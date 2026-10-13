import { mkdir, copyFile, cp, readFile, writeFile } from 'node:fs/promises';
import { pages } from '../content.js';

await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'app.js', 'media.js', 'content.js', 'styles.css', 'mobile-preview.html']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
const html = await readFile('index.html', 'utf8');
for (const page of pages) {
  await writeFile(`dist/${page.slug}.html`, html.replace('<title>Strikeout</title>', `<title>${page.title} — Strikeout</title>`));
}
await writeFile('dist/404.html', html.replace('<title>Strikeout</title>', '<title>Not found — Strikeout</title>'));
console.log(`Built Strikeout entrance and ${pages.length} subpages.`);
