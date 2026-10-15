import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
// Local previews must never consume the production film's transfer allowance.
const localFilm = resolve(process.env.LOCAL_FILM_PATH || '../media/strikeout/ghost-town-1080p.mp4');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/__local-film.mp4') {
      const info = await stat(localFilm).catch(() => null);
      if (!info?.isFile()) { res.writeHead(404).end('Set LOCAL_FILM_PATH to a local MP4. Hosted video is disabled in local previews.'); return; }
      const range = req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
      let start = 0;
      let end = info.size - 1;
      if (req.headers.range) {
        if (range && (range[1] || range[2])) {
          start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
          end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
        } else { start = info.size; }
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
          res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end(); return;
        }
      }
      const headers = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-store' };
      if (range) headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
      res.writeHead(range ? 206 : 200, headers);
      if (req.method === 'HEAD') { res.end(); return; }
      const stream = createReadStream(localFilm, { start, end });
      res.on('close', () => stream.destroy());
      stream.on('error', () => res.destroy());
      stream.pipe(res);
      return;
    }
    let path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if (!extname(path)) path += '.html';
    let status = 200;
    if (!await stat(path).then(s => s.isFile()).catch(() => false)) { path = resolve(root, '404.html'); status = 404; }
    res.writeHead(status, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    const content = await readFile(path);
    res.end(path.endsWith(`${sep}content.js`) ? content.toString().replace(/(\burl:\s*)(['"])[^'"]*\2/, "$1'/__local-film.mp4'") : content);
  } catch { res.writeHead(400).end('Bad request'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${server.address().port}`));
