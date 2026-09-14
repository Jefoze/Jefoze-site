import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { database, passwordRecord } from './database.js';

const digest = value => createHash('sha256').update(value).digest('hex');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const json = (res, status, value) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
};
const str = (s, max = 2000) => typeof s === 'string' && s.length <= max;
const sessionId = req => digest((req.headers.cookie || '').match(/(?:^|;\s*)jz_session=([a-f0-9]{64})(?:;|$)/)?.[1] || '');
const secure = () => process.env.VERCEL || process.env.NODE_ENV === 'production';
const cookie = (token, age) => `jz_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure() ? '; Secure' : ''}`;
const authenticated = async (db, req) => !!(await db.query('SELECT token FROM sessions WHERE token=$1 AND expires>$2', [sessionId(req), Date.now()])).length;
async function checkPassword(db, password) {
  if (!str(password, 512)) return false;
  const [record] = await db.query('SELECT * FROM auth WHERE id=1');
  return !!record && timingSafeEqual(Buffer.from(record.hash, 'hex'), scryptSync(password, record.salt, 64));
}
const BODY_LIMIT = 2 * 1024 * 1024;
async function body(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) fail(415, 'Expected JSON');
  let value;
  // Vercel may have parsed the JSON before invoking the handler.
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? String(req.body) : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > BODY_LIMIT) fail(413, 'Image or content is too large');
    try { value = JSON.parse(raw); } catch { fail(400, 'Invalid JSON'); }
  } else {
    const chunks = []; let length = 0;
    for await (const chunk of req) {
      length += chunk.length;
      if (length > BODY_LIMIT) fail(413, 'Image or content is too large');
      chunks.push(chunk);
    }
    try { value = JSON.parse(Buffer.concat(chunks)); } catch { fail(400, 'Invalid JSON'); }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Expected a JSON object');
  return value;
}
const link = (s, mail = false) => {
  if (!str(s)) return false;
  try { return ['http:', 'https:', ...(mail ? ['mailto:'] : [])].includes(new URL(s).protocol); } catch { return false; }
};
const picture = s => str(s, BODY_LIMIT - 100) && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(s);
const imageUrl = s => str(s, 100) && /^\/api\/images\/[a-f0-9]{64}$/.test(s);
const seed = n => Number.isSafeInteger(n) && n >= 0;
const img = v => v && typeof v === 'object' && (v.src ? imageUrl(v.src) : seed(v.seed));
export function validate(key, value) {
  let valid = false;
  if (key === 'works' || key === 'contacts') {
    valid = Array.isArray(value) && value.length <= 200 && new Set(value.map(x => x?.id)).size === value.length && value.every(x =>
      x && str(x.id, 80) && /^[a-zA-Z0-9_-]{1,80}$/.test(x.id) && (key === 'works'
        ? str(x.name, 120) && x.name.length >= 2 && str(x.cat, 100) && link(x.github) && img(x.img) && (str(x.short) || (x.short && str(x.short.en) && str(x.short.ru)))
        : str(x.label, 120) && x.label.length > 0 && str(x.value, 300) && x.value.length > 0 && (x.url === '' || link(x.url, true))));
  } else if (key === 'site') {
    valid = value && Object.keys(value).every(k => ['heroSeed', 'aboutSeed', 'heroSrc', 'aboutSrc', 'stats'].includes(k)) &&
      seed(value.heroSeed) && seed(value.aboutSeed) && (!value.heroSrc || imageUrl(value.heroSrc)) && (!value.aboutSrc || imageUrl(value.aboutSrc)) &&
      Array.isArray(value.stats) && value.stats.length === 3 && value.stats.every(s => s && seed(s.v) && s.v <= 1000000 && str(s.suf, 3));
  }
  if (!valid) fail(400, 'Invalid content');
}
async function content(db) {
  const data = {}, revisions = {};
  for (const row of await db.query('SELECT * FROM content')) { data[row.key] = JSON.parse(row.value); revisions[row.key] = row.revision; }
  return { data, revisions };
}
export function createHandler(getDatabase = database) {
  return async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cache-Control', 'no-store');
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      if (!['GET', 'HEAD'].includes(req.method)) {
        if (req.headers['sec-fetch-site'] === 'cross-site') fail(403, 'Cross-site request denied');
        const sameOrigin = `${secure() ? 'https' : 'http'}://${req.headers.host}`;
        if (req.headers.origin && ![sameOrigin, process.env.PUBLIC_ORIGIN].filter(Boolean).includes(req.headers.origin)) fail(403, 'Origin denied');
      }
      const db = await getDatabase();
      if (path === '/api/content' && req.method === 'GET') return json(res, 200, await content(db));
      if (path === '/api/revisions' && req.method === 'GET') {
        const rows = await db.query('SELECT key,revision FROM content');
        return json(res, 200, Object.fromEntries(rows.map(row => [row.key, row.revision])));
      }
      if (path === '/api/session' && req.method === 'GET') return json(res, 200, { authenticated: await authenticated(db, req) });
      if (/^\/api\/images\/[a-f0-9]{64}$/.test(path) && req.method === 'GET') {
        const [record] = await db.query('SELECT value FROM images WHERE id=$1', [path.split('/').pop()]);
        if (!record) fail(404, 'Image not found');
        const [header, encoded] = record.value.split(',');
        res.writeHead(200, { 'Content-Type': header.slice(5, -7), 'Cache-Control': 'public, max-age=31536000, immutable' });
        return res.end(Buffer.from(encoded, 'base64'));
      }
      if (path === '/api/login' && req.method === 'POST') {
        const input = await body(req);
        // Only Vercel's platform-supplied address is trusted in production.
        const address = process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] : req.socket?.remoteAddress;
        const ip = digest(String(address || 'unknown'));
        const now = Date.now();
        const [rate] = await db.query(`INSERT INTO login_attempts (ip,count,expires) VALUES ($1,1,$2)
          ON CONFLICT (ip) DO UPDATE SET
          count=CASE WHEN login_attempts.expires<$3 THEN 1 ELSE login_attempts.count+1 END,
          expires=CASE WHEN login_attempts.expires<$3 THEN $2 ELSE login_attempts.expires END
          RETURNING count`, [ip, now + 900000, now]);
        if (rate.count > 10) fail(429, 'Too many attempts. Try again in 15 minutes.');
        if (!await checkPassword(db, input.password)) fail(401, 'Wrong password');
        const token = randomBytes(32).toString('hex');
        await db.batch([
          ['DELETE FROM login_attempts WHERE ip=$1 OR expires<$2', [ip, now]],
          ['DELETE FROM sessions WHERE expires<=$1', [now]],
          ['INSERT INTO sessions (token,expires) VALUES ($1,$2)', [digest(token), now + 43200000]]
        ]);
        res.setHeader('Set-Cookie', cookie(token, 43200)); return json(res, 200, { ok: true });
      }
      if (!await authenticated(db, req)) fail(401, 'Please sign in again');
      if (path === '/api/logout' && req.method === 'POST') {
        await db.query('DELETE FROM sessions WHERE token=$1', [sessionId(req)]);
        res.setHeader('Set-Cookie', cookie('', 0)); return json(res, 200, { ok: true });
      }
      if (path === '/api/password' && req.method === 'POST') {
        const input = await body(req);
        if (!await checkPassword(db, input.current)) fail(400, 'Wrong current password');
        if (!str(input.password, 512) || input.password.length < 12) fail(400, 'Use at least 12 characters');
        const { salt, hash } = passwordRecord(input.password);
        await db.batch([
          ['UPDATE auth SET salt=$1,hash=$2 WHERE id=1', [salt, hash]],
          ['DELETE FROM sessions WHERE token!=$1', [sessionId(req)]]
        ]);
        return json(res, 200, { ok: true });
      }
      if (path === '/api/images' && req.method === 'POST') {
        const input = await body(req);
        if (!picture(input.data)) fail(400, 'Expected a JPEG, PNG or WebP image');
        const id = digest(input.data);
        await db.query('INSERT INTO images (id,value) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING', [id, input.data]);
        return json(res, 200, { url: `/api/images/${id}` });
      }
      if (path.startsWith('/api/content/') && req.method === 'PUT') {
        const key = path.slice('/api/content/'.length), input = await body(req);
        validate(key, input.value);
        if (!Number.isSafeInteger(input.revision)) fail(400, 'Invalid revision');
        const updated = await db.query('UPDATE content SET value=$1, revision=revision+1 WHERE key=$2 AND revision=$3 RETURNING revision', [JSON.stringify(input.value), key, input.revision]);
        if (!updated.length) fail(409, 'Content changed in another window. Review the latest version and save again.');
        return json(res, 200, await content(db));
      }
      fail(404, 'Not found');
    } catch (error) {
      if (!error.status) console.error('[api]', error.code || error.name || 'Server error');
      if (!res.headersSent) json(res, error.status || 500, { error: error.status ? error.message : 'Server error. Check the database connection in Vercel.' });
      else res.end();
    }
  };
}
export default createHandler();
