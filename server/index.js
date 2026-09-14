import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaults } from './seed.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataDir = resolve(process.env.DATA_DIR || resolve(root, 'data'));
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(resolve(dataDir, 'jefoze.sqlite'));
db.exec(`PRAGMA journal_mode=WAL;
  CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1);
  CREATE TABLE IF NOT EXISTS auth (id INTEGER PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);`);
for (const [key, value] of Object.entries(defaults)) db.prepare('INSERT OR IGNORE INTO content(key,value) VALUES (?,?)').run(key, JSON.stringify(value));
function setPassword(password) {
  const salt = randomBytes(32).toString('hex');
  db.prepare('INSERT OR REPLACE INTO auth VALUES (1,?,?)').run(salt, scryptSync(password, salt, 64).toString('hex'));
}
if (!db.prepare('SELECT id FROM auth').get()) {
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) throw new Error('Set ADMIN_PASSWORD to at least 12 characters for the first start.');
  setPassword(process.env.ADMIN_PASSWORD);
}
const checkPassword = password => {
  const record = db.prepare('SELECT * FROM auth WHERE id=1').get();
  return typeof password === 'string' && password.length <= 512 && timingSafeEqual(Buffer.from(record.hash, 'hex'), scryptSync(password, record.salt, 64));
};
const digest = value => createHash('sha256').update(value).digest('hex');
const sessionId = req => digest((req.headers.cookie || '').match(/(?:^|;\s*)jz_session=([a-f0-9]{64})(?:;|$)/)?.[1] || '');
const authenticated = req => !!db.prepare('SELECT token FROM sessions WHERE token=? AND expires>?').get(sessionId(req), Date.now());
const cookie = (token, age) => `jz_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
const clients = new Set();
const attempts = new Map();
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'Expected JSON');
  const chunks = []; let length = 0;
  for await (const chunk of req) { length += chunk.length; if (length > 16 * 1024 * 1024) fail(413, 'Image or content is too large'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks)); } catch { fail(400, 'Invalid JSON'); }
}
const str = (s, max = 2000) => typeof s === 'string' && s.length <= max;
const link = (s, mail = false) => {
  if (!str(s)) return false;
  try { const u = new URL(s); return ['http:', 'https:', ...(mail ? ['mailto:'] : [])].includes(u.protocol); } catch { return false; }
};
const picture = s => str(s, 4 * 1024 * 1024) && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(s);
const seed = n => Number.isSafeInteger(n) && n >= 0;
const img = v => v && typeof v === 'object' && (v.src ? picture(v.src) : seed(v.seed));
function validate(key, value) {
  let valid = false;
  if (key === 'works' || key === 'contacts') {
    valid = Array.isArray(value) && value.length <= 200 && new Set(value.map(x => x?.id)).size === value.length && value.every(x =>
      x && /^[a-zA-Z0-9_-]{1,80}$/.test(x.id) && (key === 'works'
        ? str(x.name, 120) && x.name.length >= 2 && str(x.cat, 100) && link(x.github) && img(x.img) && (str(x.short) || (x.short && str(x.short.en) && str(x.short.ru)))
        : str(x.label, 120) && x.label.length > 0 && str(x.value, 300) && x.value.length > 0 && (x.url === '' || link(x.url, true))));
  } else if (key === 'site') {
    valid = value && Object.keys(value).every(k => ['heroSeed', 'aboutSeed', 'heroSrc', 'aboutSrc', 'stats'].includes(k)) &&
      seed(value.heroSeed) && seed(value.aboutSeed) && (!value.heroSrc || picture(value.heroSrc)) && (!value.aboutSrc || picture(value.aboutSrc)) &&
      Array.isArray(value.stats) && value.stats.length === 3 && value.stats.every(s => seed(s.v) && s.v <= 1000000 && str(s.suf, 3));
  }
  if (!valid) fail(400, 'Invalid content');
}
function content() {
  const data = {}, revisions = {};
  for (const row of db.prepare('SELECT * FROM content').all()) { data[row.key] = JSON.parse(row.value); revisions[row.key] = row.revision; }
  return { data, revisions };
}
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path.startsWith('/api/')) {
      if (!['GET', 'HEAD'].includes(req.method)) {
        if (req.headers['sec-fetch-site'] === 'cross-site') fail(403, 'Cross-site request denied');
        if (req.headers.origin && req.headers.origin !== (process.env.PUBLIC_ORIGIN || `http://${req.headers.host}`)) fail(403, 'Origin denied');
      }
      if (path === '/api/content' && req.method === 'GET') return json(res, 200, content());
      if (path === '/api/session' && req.method === 'GET') return json(res, 200, { authenticated: authenticated(req) });
      if (path === '/api/events' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
        res.write('data: ready\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
      }
      if (path === '/api/login' && req.method === 'POST') {
        const ip = req.socket.remoteAddress;
        const rate = attempts.get(ip) || { count: 0, until: Date.now() + 900000 };
        if (rate.until < Date.now()) { rate.count = 0; rate.until = Date.now() + 900000; }
        attempts.set(ip, rate);
        if (++rate.count > 10) fail(429, 'Too many attempts. Try again in 15 minutes.');
        const input = await body(req);
        if (!checkPassword(input.password)) fail(401, 'Wrong password');
        attempts.delete(ip);
        const token = randomBytes(32).toString('hex');
        db.prepare('INSERT INTO sessions VALUES (?,?)').run(digest(token), Date.now() + 43200000);
        res.setHeader('Set-Cookie', cookie(token, 43200)); return json(res, 200, { ok: true });
      }
      if (!authenticated(req)) fail(401, 'Please sign in again');
      if (path === '/api/logout' && req.method === 'POST') {
        db.prepare('DELETE FROM sessions WHERE token=?').run(sessionId(req));
        res.setHeader('Set-Cookie', cookie('', 0)); return json(res, 200, { ok: true });
      }
      if (path === '/api/password' && req.method === 'POST') {
        const input = await body(req);
        if (!checkPassword(input.current)) fail(400, 'Wrong current password');
        if (!str(input.password, 512) || input.password.length < 12) fail(400, 'Use at least 12 characters');
        db.exec('BEGIN');
        try { setPassword(input.password); db.prepare('DELETE FROM sessions WHERE token != ?').run(sessionId(req)); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; }
        return json(res, 200, { ok: true });
      }
      if (path.startsWith('/api/content/') && req.method === 'PUT') {
        const key = path.slice('/api/content/'.length), input = await body(req);
        validate(key, input.value);
        const result = db.prepare('UPDATE content SET value=?, revision=revision+1 WHERE key=? AND revision=?').run(JSON.stringify(input.value), key, input.revision ?? -1);
        if (!result.changes) fail(409, 'Content changed in another window. Review the latest version and save again.');
        for (const client of clients) client.write('data: changed\n\n');
        return json(res, 200, content());
      }
      fail(404, 'Not found');
    }
    if (!['GET', 'HEAD'].includes(req.method)) fail(405, 'Method not allowed');
    const dist = resolve(root, 'dist');
    const file = resolve(dist, '.' + decodeURIComponent(path === '/' ? '/index.html' : path));
    if (!file.startsWith(dist + sep)) fail(404, 'Not found');
    let buffer;
    try { if (!statSync(file).isFile()) fail(404, 'Not found'); buffer = readFileSync(file); } catch { fail(404, 'Not found'); }
    const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : buffer);
  } catch (e) {
    if (!e.status) console.error(e);
    if (!res.headersSent) json(res, e.status || 500, { error: e.status ? e.message : 'Server error' }); else res.end();
  }
});
const timer = setInterval(() => {
  for (const client of clients) client.write(': heartbeat\n\n');
  db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
  for (const [ip, rate] of attempts) if (rate.until < Date.now()) attempts.delete(ip);
}, 25000);
server.listen(Number(process.env.PORT || 3001), process.env.HOST || '0.0.0.0', () => console.log(`Jefoze listening on port ${server.address().port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => { clearInterval(timer); for (const c of clients) c.end(); server.close(() => { db.close(); process.exit(0); }); });
