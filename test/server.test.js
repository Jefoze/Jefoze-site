import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

test('shared content, authentication, conflicts, validation and persistence', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'jefoze-test-'));
  let child, base, cookie;
  async function start() {
    child = spawn(process.execPath, ['server/index.js'], { env: { ...process.env, DATABASE_URL: '', POSTGRES_URL: '', VERCEL: '', DATA_DIR: dir, PORT: '0', HOST: '127.0.0.1', NODE_ENV: 'test', PUBLIC_ORIGIN: '', ADMIN_PASSWORD: 'test-password-12345' }, stdio: ['ignore', 'pipe', 'pipe'] });
    base = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error('Startup timeout')), 10000);
      child.stdout.on('data', chunk => { output += chunk; const match = output.match(/port (\d+)/); if (match) { clearTimeout(timer); resolve('http://127.0.0.1:' + match[1]); } });
      child.on('exit', code => { clearTimeout(timer); reject(new Error('Server exited: ' + code)); });
    });
  }
  async function stop() { const exited = once(child, 'exit'); child.kill(); await exited; }
  const request = (path, method = 'GET', value, auth = true, headers = {}) => fetch(base + '/api/' + path, { method, headers: { ...(value === undefined ? {} : { 'Content-Type': 'application/json' }), ...(auth && cookie ? { Cookie: cookie } : {}), ...headers }, body: value === undefined ? undefined : JSON.stringify(value) });
  try {
    await start();
    const initial = await (await request('content')).json();
    assert.equal(initial.data.works.length, 4);
    assert.equal(JSON.stringify(initial).includes('hash'), false);
    assert.equal((await request('content/works', 'PUT', {value: [], revision: 1}, false)).status, 401);
    assert.equal((await request('login', 'POST', {password: 'wrong'})).status, 401);
    const login = await request('login', 'POST', {password: 'test-password-12345'});
    assert.equal(login.status, 200);
    cookie = login.headers.get('set-cookie').split(';')[0];
    assert.match(login.headers.get('set-cookie'), /HttpOnly/);
    assert.equal((await (await request('session')).json()).authenticated, true);
    assert.equal((await request('content/works', 'PUT', {value: [], revision: 1}, true, {Origin: 'https://evil.example'})).status, 403);
    const saved = await request('content/works', 'PUT', {value: [], revision: initial.revisions.works});
    assert.equal(saved.status, 200);
    assert.equal((await (await request('revisions')).json()).works, 2);
    assert.deepEqual((await (await request('content', 'GET', undefined, false)).json()).data.works, []);
    assert.equal((await request('content/works', 'PUT', {value: initial.data.works, revision: 1})).status, 409);
    const invalid = structuredClone(initial.data.contacts); invalid[0].url = 'javascript:alert(1)';
    assert.equal((await request('content/contacts', 'PUT', {value: invalid, revision: 1})).status, 400);
    const work = { ...initial.data.works[0], id: 'new-work', name: 'New work' };
    assert.equal((await request('content/works', 'PUT', {value: [work], revision: 2})).status, 200);
    work.name = 'Updated work';
    assert.equal((await request('content/works', 'PUT', {value: [work], revision: 3})).status, 200);
    assert.equal((await (await request('content', 'GET', undefined, false)).json()).data.works[0].name, 'Updated work');
    assert.equal((await request('content/works', 'PUT', {value: [], revision: 4})).status, 200);
    const contacts = [{id: 'contact', label: 'Mail', value: 'test@example.com', url: 'mailto:test@example.com'}];
    assert.equal((await request('content/contacts', 'PUT', {value: contacts, revision: 1})).status, 200);
    const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZWQAAAAASUVORK5CYII=';
    assert.equal((await request('images', 'POST', {data: imageData}, false)).status, 401);
    const upload = await request('images', 'POST', {data: imageData});
    assert.equal(upload.status, 200);
    const imageUrl = (await upload.json()).url;
    const imageWork = {...work, img:{src:imageUrl}, short:{ru:'Безопасный обмен между игроками'}};
    assert.equal((await request('content/works', 'PUT', {value:[imageWork], revision:5})).status, 200);
    assert.deepEqual((await (await request('content', 'GET', undefined, false)).json()).data.works, [imageWork]);
    assert.equal((await request('content/works', 'PUT', {value:[], revision:6})).status, 200);
    const downloaded = await fetch(base + imageUrl);
    assert.equal(downloaded.headers.get('content-type'), 'image/png');
    assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), Buffer.from(imageData.split(',')[1], 'base64'));
    const site = {...initial.data.site, heroSrc: imageUrl, stats: [{v:100,suf:'+'},{v:8,suf:''},{v:12,suf:'h'}]};
    assert.equal((await request('content/site', 'PUT', {value: site, revision: 1})).status, 200);
    const shared = await (await request('content', 'GET', undefined, false)).json();
    assert.deepEqual(shared.data.contacts, contacts);
    assert.deepEqual(shared.data.site, site);
    assert.equal((await request('password', 'POST', {current: 'wrong', password: 'new-password-12345'})).status, 400);
    assert.equal((await request('password', 'POST', {current: 'test-password-12345', password: 'new-password-12345'})).status, 200);
    await stop(); await start();
    assert.deepEqual((await (await request('content')).json()).data.works, []);
    assert.deepEqual((await (await request('content')).json()).data.site, site);
    assert.equal((await request('login', 'POST', {password: 'test-password-12345'})).status, 401);
    assert.equal((await request('login', 'POST', {password: 'new-password-12345'})).status, 200);
    assert.equal((await request('logout', 'POST', {})).status, 200);
    assert.equal((await (await request('session')).json()).authenticated, false);
    assert.equal((await request('content/works', 'PUT', {value: [], revision: 2})).status, 401);
  } finally { if (child && child.exitCode === null) await stop(); await rm(dir, { recursive: true, force: true }); }
});
