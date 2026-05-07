const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function resolvePath(urlPath) {
  const normalized = decodeURIComponent((urlPath || '/').split('?')[0]);
  const candidate = normalized === '/' ? '/test.html' : normalized;
  const safePath = path.normalize(candidate).replace(/^(\.\.[\\/])+/, '');
  return path.join(ROOT, safePath);
}

const server = http.createServer((req, res) => {
  const target = resolvePath(req.url);

  if (!target.startsWith(ROOT)) {
    send(res, 403, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Forbidden');
    return;
  }

  fs.stat(target, (statErr, stats) => {
    if (statErr) {
      send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not found');
      return;
    }

    const finalPath = stats.isDirectory() ? path.join(target, 'test.html') : target;
    fs.readFile(finalPath, (readErr, content) => {
      if (readErr) {
        send(res, 500, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Internal server error');
        return;
      }

      const ext = path.extname(finalPath).toLowerCase();
      send(res, 200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      }, content);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Local server running at http://${HOST}:${PORT}/test.html`);
});
