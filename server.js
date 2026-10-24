// Tiny static server for Setpoint. No dependencies: `npm start`, then open http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load PORT (and anything else) from a .env file if there is one.
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  });
} catch (e) { /* no .env, that's fine */ }

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};
const PUBLIC = new Set(['index.html', 'manifest.json', 'sw.js', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png', 'firebase.js', 'app.css', 'app.js', 'foods.json', 'barcode.js']);

http.createServer((req, res) => {
  let name = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
  // Unknown files get a real 404. Sending the page back instead breaks phones that look for icons by name.
  if (!PUBLIC.has(name)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Not found'); return; }
  const file = path.join(ROOT, name);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const headers = { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' };
    // Never cache the page or the service worker, so updates arrive straight away.
    headers['Cache-Control'] = (name === 'index.html' || name === 'sw.js') ? 'no-cache' : 'public, max-age=86400';
    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(PORT, () => console.log('Setpoint is running at http://localhost:' + PORT));
