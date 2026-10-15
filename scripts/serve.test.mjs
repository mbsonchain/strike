import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { film } from '../content.js';

test('local previews never load the hosted film and serve only requested local byte ranges', async t => {
  const root = await mkdtemp(join(tmpdir(), 'strikeout-local-'));
  const localFilm = join(root, 'film.mp4');
  await mkdir(join(root, 'dist', 'releases', 'test'), { recursive: true });
  const content = `export const film = { url: '${film.url}' };`;
  await writeFile(join(root, 'dist', 'content.js'), content);
  // Old release files must stay local even if content.js changes while the server runs.
  const oldUrl = 'https://previous-host.example/film.mp4';
  await writeFile(join(root, 'dist', 'releases', 'test', 'content.js'), `export const film = { url: '${oldUrl}' };`);
  await writeFile(localFilm, '0123456789');
  const server = spawn(process.execPath, [fileURLToPath(new URL('./serve.mjs', import.meta.url))], {
    cwd: root, env: { ...process.env, PORT: '0', LOCAL_FILM_PATH: localFilm }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(async () => { server.kill(); await rm(root, { recursive: true, force: true }); });
  const origin = await new Promise((resolve, reject) => {
    let errors = '';
    server.stderr.on('data', chunk => { errors += chunk; });
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Local server exited: ${code}\n${errors}`)));
    server.stdout.on('data', chunk => {
      const url = chunk.toString().match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
      if (url) resolve(url);
    });
  });
  for (const path of ['/content.js', '/releases/test/content.js']) {
    const source = await (await fetch(origin + path)).text();
    assert.ok(source.includes('/__local-film.mp4'));
    assert.ok(!source.includes(film.url));
    assert.ok(!source.includes(oldUrl));
  }
  const range = await fetch(origin + '/__local-film.mp4', { headers: { Range: 'bytes=2-5' } });
  assert.equal(range.status, 206);
  assert.equal(range.headers.get('content-range'), 'bytes 2-5/10');
  assert.equal(range.headers.get('content-type'), 'video/mp4');
  assert.equal(await range.text(), '2345');
  const suffix = await fetch(origin + '/__local-film.mp4', { headers: { Range: 'bytes=-3' } });
  assert.equal(await suffix.text(), '789');
  const invalid = await fetch(origin + '/__local-film.mp4', { headers: { Range: 'bytes=10-' } });
  assert.equal(invalid.status, 416);
  const head = await fetch(origin + '/__local-film.mp4', { method: 'HEAD' });
  assert.equal(head.headers.get('content-length'), '10');
  assert.equal(await head.text(), '');
  await rm(localFilm);
  const absent = await fetch(origin + '/__local-film.mp4', { redirect: 'error' });
  assert.equal(absent.status, 404);
  assert.ok((await absent.text()).includes('Hosted video is disabled'));
});
