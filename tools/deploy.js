const fs = require('fs'), zlib = require('zlib'), crypto = require('crypto'), path = require('path');
const { execFileSync } = require('child_process');
const SITE = 'setpoint-tracker', API = 'https://firebasehosting.googleapis.com/v1beta1';
const DIR = require('path').join(__dirname, '..'), TMP = require('os').tmpdir() + '/setpoint-gz';
const FILES = ['index.html', 'manifest.json', 'sw.js', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon.png', 'firebase.js', 'app.css', 'app.js', 'foods.json', 'foods-core.json', 'barcode.js', 'ar.js', 'robots.txt', 'sitemap.xml', 'og-image.png'].concat(fs.readdirSync(DIR + '/fonts').map(function (f) { return 'fonts/' + f; })).concat(fs.readdirSync(DIR).filter(function (f) { return /^((privacy|terms|cookies|refunds|legal)|google[0-9a-f]+)\.html$/.test(f); }));
fs.mkdirSync(TMP, { recursive: true });
function call(url, method, body) {
  const args = ['-sS', '-X', method, url, '-H', 'Content-Type: application/json', '-w', '\n%{http_code}'];
  if (body) args.push('-d', JSON.stringify(body));
  const out = execFileSync('curl', args).toString(); const i = out.lastIndexOf('\n');
  const code = +out.slice(i + 1), text = out.slice(0, i);
  if (code >= 300) throw new Error(method + ' ' + url + ' ' + code + ' ' + text);
  return text ? JSON.parse(text) : {};
}
const v = call(`${API}/sites/${SITE}/versions`, 'POST', { config: {
  headers: [
    { glob: '/index.html', headers: { 'Cache-Control': 'no-cache' } },
    { glob: '/sw.js', headers: { 'Cache-Control': 'no-cache' } },
    { glob: '/manifest.json', headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/manifest+json' } }
  ]
} });
const map = {}, files = {};
for (const f of FILES) { const z = zlib.gzipSync(fs.readFileSync(path.join(DIR, f))); const h = crypto.createHash('sha256').update(z).digest('hex'); fs.writeFileSync(`${TMP}/${h}`, z); map['/' + f] = h; }
const pop = call(`${API}/${v.name}:populateFiles`, 'POST', { files: map });
for (const h of pop.uploadRequiredHashes || []) {
  const out = execFileSync('curl', ['-sS', '-X', 'POST', `${pop.uploadUrl}/${h}`, '-H', 'Content-Type: application/octet-stream', '--data-binary', `@${TMP}/${h}`, '-w', '%{http_code}']).toString();
  if (!out.endsWith('200')) throw new Error('upload failed ' + out);
}
call(`${API}/${v.name}?update_mask=status`, 'PATCH', { status: 'FINALIZED' });
const rel = call(`${API}/sites/${SITE}/releases?versionName=${encodeURIComponent(v.name)}`, 'POST', { message: 'Setpoint v' + JSON.parse(fs.readFileSync(DIR + '/package.json')).version });
console.log('released', rel.name, '| uploaded', (pop.uploadRequiredHashes || []).length, 'files');
