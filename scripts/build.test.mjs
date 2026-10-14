import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const exec = promisify(execFile);
const sourceRoot = new URL('../', import.meta.url);

test('every page loads one complete release, and a playback-only update changes all asset addresses', async t => {
  const root = await mkdtemp(join(tmpdir(), 'strikeout-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of ['package.json', 'scripts', 'assets', 'index.html', 'mobile-preview.html', 'app.js', 'media.js', 'content.js', 'diagnostics.js', 'styles.css', 'mobile.css']) {
    await cp(new URL(file, sourceRoot), join(root, file), { recursive: true });
  }
  async function build() {
    await exec(process.execPath, ['scripts/build.mjs'], { cwd: root });
    const { release } = JSON.parse(await readFile(join(root, 'dist/release.json'), 'utf8'));
    for (const page of (await readdir(join(root, 'dist'))).filter(file => file.endsWith('.html'))) {
      const html = await readFile(join(root, 'dist', page), 'utf8');
      assert.ok(html.includes(`<meta name="strikeout-release" content="${release}">`), page);
      if (page === 'mobile-preview.html') {
        assert.ok(html.includes("frame.src = '/#video'"));
        assert.ok(!html.includes('data-mobile-preview'));
        continue;
      }
      for (const asset of ['app.js', 'styles.css', 'mobile.css']) {
        assert.ok(html.includes(`/releases/${release}/${asset}`), `${page}: ${asset}`);
        assert.ok(!html.includes(`"/${asset}"`), `${page}: unversioned ${asset}`);
      }
    }
    for (const file of ['app.js', 'media.js', 'content.js', 'diagnostics.js', 'styles.css', 'mobile.css']) {
      assert.equal(await readFile(join(root, 'dist/releases', release, file), 'utf8'), await readFile(join(root, file), 'utf8'));
    }
    const app = await readFile(join(root, 'dist/releases', release, 'app.js'), 'utf8');
    for (const [, file] of app.matchAll(/from '\.\/(.*?)'/g)) {
      await readFile(join(root, 'dist/releases', release, file));
    }
    return release;
  }
  const first = await build();
  assert.equal(await build(), first, 'unchanged builds keep the same addresses');
  const mediaPath = join(root, 'media.js');
  await writeFile(mediaPath, `${await readFile(mediaPath, 'utf8')}\n// Changed playback release.\n`);
  assert.notEqual(await build(), first, 'an imported module change must invalidate the entry module too');
});
