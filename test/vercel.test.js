import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { createHandler } from '../server/api.js';
import { initialize, openDatabase } from '../server/database.js';

test('Vercel handlers share PostgreSQL content, sessions and rate limits', async () => {
  const pg = new PGlite();
  const db = {
    query: async (text, params = []) => (await pg.query(text, params)).rows,
    batch: statements => pg.transaction(async tx => {
      const results = [];
      for (const [text, params = []] of statements) results.push((await tx.query(text, params)).rows);
      return results;
    })
  };
  const first = createHandler(async () => db);
  const second = createHandler(async () => db);
  let cookie;
  const call = async (handler, url, method = 'GET', body, extra = {}) => {
    const headers = {};
    const response = { status: 200, headers, setHeader: (name, value) => { headers[name.toLowerCase()] = value; },
      writeHead(status, values = {}) { this.status = status; for (const [name, value] of Object.entries(values)) this.setHeader(name, value); },
      end(value) { this.body = value; this.headersSent = true; } };
    // Vercel supplies an already parsed request body. No request stream here.
    await handler({ url, method, body, headers: { host: 'localhost', 'content-type': 'application/json', cookie, ...extra }, socket: {remoteAddress: '127.0.0.1'} }, response);
    return { ...response, json: () => JSON.parse(response.body) };
  };
  try {
    await initialize(db, {ADMIN_PASSWORD: 'first-password-123'});
    const initial = (await call(first, '/api/content')).json();
    const login = await call(first, '/api/login', 'POST', {password: 'first-password-123'});
    assert.equal(login.status, 200);
    cookie = login.headers['set-cookie'].split(';')[0];
    assert.equal((await call(second, '/api/session')).json().authenticated, true);
    const contact = [{id:'new-contact', label:'Website', value:'example.com', url:'https://example.com'}];
    const writes = await Promise.all([
      call(first, '/api/content/contacts', 'PUT', {value:contact, revision:initial.revisions.contacts}),
      call(second, '/api/content/contacts', 'PUT', {value:[], revision:initial.revisions.contacts})
    ]);
    assert.deepEqual(writes.map(r => r.status).sort(), [200,409]);
    assert.equal((await call(second, '/api/revisions')).json().contacts, 2);
    assert.equal((await call(second, '/api/password', 'POST', {current:'first-password-123', password:'changed-password-123'})).status, 200);
    await initialize(db, {ADMIN_PASSWORD:'first-password-123'});
    assert.equal((await call(first, '/api/login', 'POST', {password:'first-password-123'})).status, 401);
    assert.equal((await call(second, '/api/login', 'POST', {password:'changed-password-123'})).status, 200);
    assert.equal((await call(first, '/api/logout', 'POST', {})).status, 200);
    assert.equal((await call(second, '/api/session')).json().authenticated, false);
    for (let i=0; i<10; i++) assert.equal((await call(i % 2 ? first : second, '/api/login', 'POST', {password:'wrong'})).status, 401);
    assert.equal((await call(second, '/api/login', 'POST', {password:'wrong'})).status, 429);
    assert.equal((await call(first, '/api/login', 'POST', null)).status, 400);
    assert.equal((await call(first, '/api/login', 'POST', {password:'wrong'}, {origin:'https://evil.example'})).status, 403);
  } finally { await pg.close(); }
});

test('production never silently falls back to local disk', async () => {
  await assert.rejects(openDatabase({VERCEL:'1'}), /DATABASE_URL/);
  await assert.rejects(openDatabase({NODE_ENV:'production'}), /DATABASE_URL/);
});
