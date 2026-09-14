import http from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const server = http.createServer(async (req, res) => {
  if (new URL(req.url, 'http://localhost').pathname.startsWith('/api/')) return handler(req, res);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    const path = new URL(req.url, 'http://localhost').pathname;
    const dist = resolve(root, 'dist');
    const file = resolve(dist, '.' + decodeURIComponent(path === '/' ? '/index.html' : path));
    if (!file.startsWith(dist + sep) || !statSync(file).isFile()) throw new Error('Not found');
    const buffer = readFileSync(file);
    const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : buffer);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 3001), process.env.HOST || '0.0.0.0', () => console.log(`Jefoze listening on port ${server.address().port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
