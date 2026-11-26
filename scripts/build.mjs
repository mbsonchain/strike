import { mkdir, copyFile, cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pages } from '../content.js';
import { escapeHtml, noteMarkup } from '../pages.js';

const runtimeFiles = ['app.js', 'media.js', 'content.js', 'pages.js', 'viewport.js', 'styles.css', 'mobile.css', 'pages.css'];
const noteAssets = (await readdir('assets/notes')).filter(file => file.endsWith('.svg')).sort().map(file => `assets/notes/${file}`);
const sourceFiles = [...runtimeFiles, 'index.html', 'mobile-preview.html', 'note.html', ...noteAssets];
const sources = new Map(await Promise.all(sourceFiles.map(async file => [file, await readFile(file, 'utf8')])));
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
await cp('assets/notes', `dist${releasePath}/assets/notes`, { recursive: true });
function versionHtml(html) {
  for (const file of runtimeFiles) html = html.replaceAll(`"/${file}"`, `"${releasePath}/${file}"`);
  return html.replace('<head>', `<head>\n  <meta name="strikeout-release" content="${release}">`);
}
const html = versionHtml(sources.get('index.html'));
const noteTemplate = versionHtml(sources.get('note.html'));
await writeFile('dist/index.html', html);
await writeFile('dist/mobile-preview.html', versionHtml(sources.get('mobile-preview.html')));
for (const page of pages) {
  const pageHtml = page.note
    ? noteTemplate.replace('{{title}}', escapeHtml(page.title)).replace('{{slug}}', page.slug)
        .replaceAll('{{color}}', page.backgroundColor)
        .replace('{{theme}}', page.scenery ? '' : `<meta name="theme-color" content="${page.backgroundColor}">`)
        .replace('{{note}}', () => noteMarkup(page, `${releasePath}/assets/notes/`))
    : html.replace('<body>', `<body data-page="${page.slug}">`)
        .replace('<title>Strikeout</title>', `<title>${page.title} — Strikeout</title>`);
  await writeFile(`dist/${page.slug}.html`, pageHtml);
}
await writeFile('dist/404.html', html.replace('<title>Strikeout</title>', '<title>Not found — Strikeout</title>'));
await writeFile('dist/release.json', JSON.stringify({ release }) + '\n');
console.log(`Built Strikeout release ${release}, homepage and ${pages.length} subpages.`);
