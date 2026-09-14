import { neon } from '@neondatabase/serverless';
import { randomBytes, scryptSync } from 'node:crypto';
import { defaults } from './seed.js';

export function passwordRecord(password) {
  const salt = randomBytes(32).toString('hex');
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') };
}

export async function openDatabase(env = process.env) {
  const url = env.DATABASE_URL || env.POSTGRES_URL;
  if (url) {
    const sql = neon(url);
    return {
      query: (text, params = []) => sql.query(text, params),
      batch: statements => sql.transaction(statements.map(([text, params = []]) => sql.query(text, params))),
      schema: statements => sql.transaction([
        sql.query('SELECT pg_advisory_xact_lock(741963852)'),
        ...statements.map(([text]) => sql.query(text))
      ]),
      close() {}
    };
  }
  if (env.VERCEL || env.NODE_ENV === 'production') {
    throw Object.assign(new Error('Connect a Neon database and set DATABASE_URL in Vercel, then redeploy.'), { status: 503 });
  }
  // The local adapter is for development and integration tests only.
  const { DatabaseSync } = await import('node:sqlite');
  const { mkdirSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const dir = resolve(env.DATA_DIR || 'data');
  mkdirSync(dir, { recursive: true });
  const sqlite = new DatabaseSync(resolve(dir, 'jefoze.sqlite'));
  sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  const query = (text, params = []) => {
    const args = [];
    const converted = text.replace(/\$(\d+)/g, (_, index) => { args.push(params[Number(index) - 1]); return '?'; });
    return sqlite.prepare(converted).all(...args);
  };
  return {
    query: async (...args) => query(...args),
    batch: async statements => {
      sqlite.exec('BEGIN IMMEDIATE');
      try { const results = statements.map(([text, params]) => query(text, params)); sqlite.exec('COMMIT'); return results; }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
    close: () => sqlite.close()
  };
}

export async function initialize(db, env = process.env) {
  // Serialize schema creation when several Vercel instances start together.
  await (db.schema || db.batch)([
    ['CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1)'],
    ['CREATE TABLE IF NOT EXISTS auth (id INTEGER PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL)'],
    ['CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires BIGINT NOT NULL)'],
    ['CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL)'],
    ['CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, value TEXT NOT NULL)']
  ]);
  if (!(await db.query('SELECT id FROM auth WHERE id=1')).length) {
    if (typeof env.ADMIN_PASSWORD !== 'string' || env.ADMIN_PASSWORD.length < 12 || env.ADMIN_PASSWORD.length > 512) {
      throw Object.assign(new Error('Set ADMIN_PASSWORD to 12–512 characters in Vercel, then redeploy.'), { status: 503 });
    }
    const { salt, hash } = passwordRecord(env.ADMIN_PASSWORD);
    await db.query('INSERT INTO auth (id,salt,hash) VALUES (1,$1,$2) ON CONFLICT (id) DO NOTHING', [salt, hash]);
  }
  await db.batch(Object.entries(defaults).map(([key, value]) => [
    'INSERT INTO content (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', [key, JSON.stringify(value)]
  ]));
}

let pending;
export function database() {
  if (!pending) pending = (async () => {
    const db = await openDatabase();
    try { await initialize(db); return db; } catch (error) { db.close(); throw error; }
  })().catch(error => { pending = undefined; throw error; });
  return pending;
}
