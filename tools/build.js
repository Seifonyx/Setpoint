// Joins the modules in src/ (in file-name order) into the single app.js the app loads.
// Run from the project folder:  node tools/build.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..', 'src');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
const out = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
new vm.Script(out, { filename: 'app.js' }); // stops here if the joined code has a syntax error
fs.writeFileSync(path.join(__dirname, '..', 'app.js'), out);
console.log('app.js built from ' + files.length + ' modules (' + out.split('\n').length + ' lines)');

// Stamp the offline cache with a fingerprint of the app's files, so every new build is picked up as an update
// (phones keep the cached app until this name changes, even when the version number is the same).
const root = path.join(__dirname, '..'), crypto = require('crypto');
const h = crypto.createHash('sha256');
['index.html', 'app.css', 'app.js', 'ar.js', 'privacy.html', 'terms.html', 'cookies.html', 'refunds.html', 'fonts/fonts.css'].forEach(function (f) { const p = path.join(root, f); if (fs.existsSync(p)) h.update(fs.readFileSync(p)); });
const swp = path.join(root, 'sw.js'), sw = fs.readFileSync(swp, 'utf8');
const sw2 = sw.replace(/const CACHE = 'setpoint-v([\d.]+)(?:-[0-9a-f]+)?';/, function (_, v) { return "const CACHE = 'setpoint-v" + v + '-' + h.digest('hex').slice(0, 8) + "';"; });
if (sw2 !== sw) { fs.writeFileSync(swp, sw2); }
console.log('offline cache: ' + (/const CACHE = '([^']+)'/.exec(sw2) || [])[1]);
