import { mkdir, copyFile, cp, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pages } from '../content.js';

const runtimeFiles = ['app.js', 'media.js', 'content.js', 'pages.js', 'styles.css', 'mobile.css', 'pages.css'];
const sources = new Map(await Promise.all([...runtimeFiles, 'index.html', 'mobile-preview.html'].map(async file => [file, await readFile(file, 'utf8')])));
const hash = createHash('sha256');
for (const [file, source] of sources) hash.update(file).update('\0').update(source).update('\0');
const release = hash.digest('hex').slice(0, 16);
const releasePath = `/releases/${release}`;
await mkdir(`dist${releasePath}`, { recursive: true });
for (const file of runtimeFiles) {
  await writeFile(`dist${releasePath}/${file}`, sources.get(file));
  // Keep older open pages' root-level module URLs working during updates.
  await copyFile(file, `dist/${file}`);
}
await cp('assets', 'dist/assets', { recursive: true });
function versionHtml(html) {
  for (const file of runtimeFiles) html = html.replaceAll(`"/${file}"`, `"${releasePath}/${file}"`);
  return html.replace('<head>', `<head>\n  <meta name="strikeout-release" content="${release}">`);
}
const html = versionHtml(sources.get('index.html'));
await writeFile('dist/index.html', html);
await writeFile('dist/mobile-preview.html', versionHtml(sources.get('mobile-preview.html')));
for (const page of pages) {
  await writeFile(`dist/${page.slug}.html`, html.replace('<title>Strikeout</title>', `<title>${page.title} — Strikeout</title>`));
}
await writeFile('dist/404.html', html.replace('<title>Strikeout</title>', '<title>Not found — Strikeout</title>'));
await writeFile('dist/release.json', JSON.stringify({ release }) + '\n');
console.log(`Built Strikeout release ${release}, homepage and ${pages.length} subpages.`);
