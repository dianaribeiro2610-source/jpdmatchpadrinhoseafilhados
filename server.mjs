import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function safePath(urlPath) {
  const clean = urlPath.split('?')[0].split('#')[0];
  const normalized = normalize(clean).replace(/^([.][.][/\\])+/, '');
  return normalized === '/' ? '/index.html' : normalized;
}

createServer(async (req, res) => {
  try {
    const requestedPath = safePath(req.url || '/');
    const fullPath = join(ROOT, requestedPath);
    const extension = extname(fullPath).toLowerCase();

    try {
      const file = await readFile(fullPath);
      res.writeHead(200, { 'Content-Type': MIME[extension] || 'application/octet-stream' });
      res.end(file);
      return;
    } catch {
      // SPA-like fallback for preview tools that hit unknown routes.
      const fallback = await readFile(join(ROOT, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fallback);
      return;
    }
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
}).listen(PORT, () => {
  console.log(`JPD dashboard running on http://localhost:${PORT}`);
});
