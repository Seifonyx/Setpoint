// Setpoint smoke tests. Run from the project folder:  node tests/smoke.js
// Starts a small local server, opens the app in Chromium at phone size (light and dark), and checks the main flows.
const http = require('http'), fs = require('fs'), path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const server = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html')); fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(b); }); });
let pass = 0, fail = 0; const ok = (name, cond, extra) => { if (cond) pass++; else { fail++; console.log('FAIL', name, extra !== undefined ? JSON.stringify(extra) : ''); } };
server.listen(0, async () => {
  const URL0 = 'http://localhost:' + server.address().port + '/?test=1';
  const b = await chromium.launch();
  for (const mode of ['light', 'dark']) {
    const errs = [];
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: mode, serviceWorkers: 'block', isMobile: true, hasTouch: true })).newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.route(/openfoodfacts|googleapis|gstatic|jsdelivr/, r => r.abort());
    const T = iso(new Date()), Y = iso(new Date(Date.now() - 864e5));
    await p.goto(URL0); await p.evaluate(o => { localStorage.clear(); localStorage.setItem('setpoint', JSON.stringify(o)); }, { ui: { onboarded: true, checkin: 1e9, weekSeen: 9e9 }, seenVersion: '9', profile: { sex: 'female', birthYear: 1995, heightCm: 165, activity: 1.4 }, settings: { goalKg: 60 }, entries: [{ date: Y, kg: 70 }], food: { [Y]: [{ id: 'y1', ref: 'u173944', name: 'Bananas, raw', g: 120, qty: 120, unit: 'g', kcal: 107, protein: 1, carbs: 27, fat: 0, meal: 'breakfast' }] } });
    await p.reload(); await p.waitForTimeout(1500); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok(mode + ': diary shows', await p.isVisible('#panel-diary'));
    // add a food from search
    await p.click('#addBtn'); await p.waitForTimeout(1800); await p.fill('#afQ', 'banana'); await p.waitForTimeout(600);
    await p.click('#afList [data-f] >> nth=0'); await p.waitForTimeout(400); await p.click('#svAdd'); await p.waitForTimeout(400);
    let s = await p.evaluate(() => JSON.parse(localStorage.setpoint));
    ok(mode + ': food added today', (s.food[T] || []).length === 1, s.food[T]);
    ok(mode + ': new entry has a change time', (s.food[T] || [{}])[0].u > 0);
    // quick add
    await p.click('#afQuick'); await p.waitForTimeout(300);
    const qk = await p.$('#qaK'); if (qk) { await p.fill('#qaK', '300'); await p.click('#qaAdd').catch(() => {}); await p.waitForTimeout(300); }
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    // quick amount 2×
    const id = (await p.evaluate(() => JSON.parse(localStorage.setpoint).food))[T][0].id;
    await p.click('[data-food="' + id + '"] .row-v'); await p.waitForTimeout(250); await p.click('.pop-menu button:has-text("2×")'); await p.waitForTimeout(400);
    s = await p.evaluate(() => JSON.parse(localStorage.setpoint)); const it = s.food[T].find(x => x.id === id);
    ok(mode + ': 2× doubles the amount', it && it.g >= 200, it);
    // delete + tombstone + undo
    await p.evaluate(id => { const el = document.querySelector('[data-sw="' + id + '"] [data-sw-act="del"]'); if (el) el.click(); }, id); await p.waitForTimeout(400);
    s = await p.evaluate(() => JSON.parse(localStorage.setpoint));
    ok(mode + ': delete is remembered for syncing', !!(s.del && s.del[id]), s.del);
    await p.click('#toastBtn').catch(() => {}); await p.waitForTimeout(400);
    s = await p.evaluate(() => JSON.parse(localStorage.setpoint));
    ok(mode + ': undo brings it back', (s.food[T] || []).some(x => x.id === id) && !(s.del || {})[id]);
    // tabs render without errors
    for (const t of ['you', 'settings', 'targets', 'foods']) { await p.evaluate(t => document.querySelector('#tab-' + t + ', [data-go="' + t + '"]').click(), t); await p.waitForTimeout(250); }
    await p.evaluate(() => document.querySelector('#tab-progress').click()); await p.waitForTimeout(400);
    ok(mode + ': chart drawn', !!(await p.$('#chart svg, #chart .chart-empty')));
    // sync merge rules
    const m = await p.evaluate(() => {
      const S = window.__setpoint, base = { entries: [], phases: [], measures: [], myFoods: [], favs: [], offFoods: [], recipes: [], meals: [], water: {}, settings: {}, profile: {} };
      const A = S.migrate(Object.assign({}, base, { food: { '2026-01-01': [{ id: 'k', name: 'Old', kcal: 100, protein: 0, carbs: 0, fat: 0, meal: 'lunch', u: 1700000000000 }, { id: 'gone', name: 'Deleted here', kcal: 50, protein: 0, carbs: 0, fat: 0, meal: 'lunch', u: 1700000000000 }] }, del: {} }));
      const B = S.migrate(Object.assign({}, base, { food: { '2026-01-01': [{ id: 'k', name: 'Edited later', kcal: 150, protein: 0, carbs: 0, fat: 0, meal: 'lunch', u: 1800000000000 }] }, del: { gone: Date.now() } }));
      const r = S.mergeData(A, B, false); const day = r.food['2026-01-01'] || [];
      return { names: day.map(x => x.name), del: Object.keys(r.del) };
    });
    ok(mode + ': merge keeps the newest edit', m.names.indexOf('Edited later') >= 0 && m.names.indexOf('Old') < 0, m);
    ok(mode + ': merge keeps a deletion', m.names.indexOf('Deleted here') < 0, m);
    ok(mode + ': no page errors', !errs.length, errs);
  }
  await b.close(); server.close();
  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
});
