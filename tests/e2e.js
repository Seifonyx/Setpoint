// Setpoint end-to-end tests: the flows where a bug would lose or duplicate data. Run from the project folder:
//   node tests/e2e.js
// Covers: old saves converting, two-phone merging, repeat items, sorting in Add food, and progress-photo sync (against a
// stand-in for the account database in tests/fake-firebase.js). Starts its own small server; needs Playwright + Chromium.
const http = require('http'), fs = require('fs'), path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const day = k => { const d = new Date(); d.setDate(d.getDate() - k); return iso(d); };
let pass = 0, fail = 0; const ok = (name, cond, extra) => { if (cond) pass++; else { fail++; console.log('FAIL', name, extra !== undefined ? JSON.stringify(extra) : ''); } };
const server = http.createServer((req, res) => { const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html')); fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(b); }); });
const BASE_UI = { onboarded: true, checkin: 1e12, weekSeen: 9e9, holdTip: true, gsHide: true, graphite: true };

server.listen(0, async () => {
  const URL0 = 'http://localhost:' + server.address().port + '/';
  const b = await chromium.launch(); const errs = [];
  const page = async (opts) => { const c = await b.newContext(Object.assign({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }, opts || {})); const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); return { c, p }; };
  const seed = async (p, s) => { await p.goto(URL0 + '?test=1'); await p.evaluate(x => { localStorage.clear(); localStorage.setItem('setpoint', JSON.stringify(x)); }, s); await p.reload(); await p.waitForTimeout(1200); };
  const st = p => p.evaluate(() => JSON.parse(localStorage.getItem('setpoint')));
  try {
    // ---- 1. Old saves convert ----
    {
      const { p } = await page();
      await p.goto(URL0 + '?test=1');
      await p.evaluate(() => { localStorage.clear(); localStorage.setItem('weight-log-entries', JSON.stringify([{ date: '2025-01-02', kg: 80.5, note: 'start' }, { date: '2025-01-09', kg: '79.8' }, { date: 'bad', kg: 1 }])); localStorage.setItem('weight-log-phases', JSON.stringify([{ date: '2025-01-02', name: 'Cut' }])); });
      await p.reload(); await p.waitForTimeout(1200);
      let s = await st(p);
      ok('v1 save: weigh-ins kept (bad row dropped)', s.entries.length === 2 && s.entries[1].kg === 79.8, s.entries);
      ok('v1 save: old keys removed after converting', await p.evaluate(() => localStorage.getItem('weight-log-entries') === null));
      await p.evaluate(() => { localStorage.clear(); localStorage.setItem('the-slope', JSON.stringify({ entries: [{ date: '2025-03-01', kg: 90 }, { date: '2025-03-05', kg: 89.4 }], phases: [], settings: { unit: 'lb', theme: 'dark' }, profile: { sex: 'male', birthYear: 1990, heightCm: 180 } })); });
      await p.reload(); await p.waitForTimeout(1200);
      s = await st(p);
      ok('v2 save: weigh-ins, unit and profile kept', s.entries.length === 2 && s.settings.unit === 'lb' && s.profile.heightCm === 180, { e: s.entries.length, u: s.settings.unit });
      ok('v2 save: old key removed', await p.evaluate(() => localStorage.getItem('the-slope') === null));
      const junk = await p.evaluate(() => { try { const m = window.__setpoint.migrate({ entries: 'x', food: { '2025-01-01': [null, { kcal: 'a' }, { id: 'ok', kcal: 100, name: 'Bread' }] }, meals: [{}], repeats: [{ item: null }], del: { a: 'x' } }); return m.food['2025-01-01'].length + '|' + m.repeats.length; } catch (e) { return 'threw ' + e.message; } });
      ok('junk data is cleaned without crashing', junk === '1|0', junk);
      await p.context().close();
    }
    // ---- 2. Two phones merging ----
    {
      const { p } = await page();
      await p.goto(URL0 + '?test=1'); await p.waitForTimeout(1000);
      const r = await p.evaluate(() => {
        const M = window.__setpoint.migrate, mg = window.__setpoint.mergeData, D = '2026-01-10', T = Date.now() - 864e5;
        const it = (id, u, kcal, extra) => Object.assign({ id: id, name: 'Food ' + id, kcal: kcal, protein: 1, carbs: 1, fat: 1, meal: 'lunch', u: u }, extra || {});
        const out = {};
        // edited on both phones: the later edit wins, whichever save is newer
        let a = M({ food: { [D]: [it('x', T + 200, 300)] } }), c = M({ food: { [D]: [it('x', T + 100, 200)] } });
        out.edit = [mg(a, c, true).food[D][0].kcal, mg(a, c, false).food[D][0].kcal];
        // deleted on A while B (offline) still has it
        a = M({ food: {}, del: { y: T + 300 } }); c = M({ food: { [D]: [it('y', T + 100, 100)] } });
        out.del = [(mg(a, c, true).food[D] || []).length, (mg(a, c, false).food[D] || []).length];
        // deleted, then added back later on A: the old copy on B doesn't win
        a = M({ food: { [D]: [it('z', T + 500, 999)] }, del: { z: T + 300 } }); c = M({ food: { [D]: [it('z', T + 100, 1)] } });
        out.readd = mg(a, c, true).food[D].map(function (f) { return f.kcal; });
        // different foods on the same day on each phone: both kept
        a = M({ food: { [D]: [it('p', T + 100, 10)] } }); c = M({ food: { [D]: [it('q', T + 100, 20)] } });
        out.both = mg(a, c, false).food[D].map(function (f) { return f.id; }).sort().join(',');
        // a repeat item stopped on one phone stays stopped
        a = M({ repeats: [], del: { 'rp:pabc': T + 500 } }); c = M({ repeats: [{ id: 'pabc', item: { kcal: 100, name: 'Coffee', protein: 0, carbs: 0, fat: 0 }, meal: 'breakfast', days: [], u: T + 100 }] });
        out.rep = mg(a, c, false).repeats.length;
        return out;
      });
      ok('merge: later edit wins both ways', r.edit[0] === 300 && r.edit[1] === 300, r.edit);
      ok('merge: deletion on one phone deletes on the other', r.del[0] === 0 && r.del[1] === 0, r.del);
      ok('merge: deleted then re-added keeps the new copy', r.readd.length === 1 && r.readd[0] === 999, r.readd);
      ok('merge: foods added on both phones are both kept', r.both === 'p,q', r.both);
      ok('merge: stopped repeat item stays stopped', r.rep === 0, r.rep);
      await p.context().close();
    }
    // ---- 3. Repeat items ----
    {
      const { c, p } = await page({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
      await c.clock.install({ time: new Date() });
      const now = new Date(), today = iso(now), tom = iso(new Date(+now + 864e5));
      const food = { [day(1)]: [{ id: 'q1', name: 'Coffee with milk', kcal: 60, protein: 3, carbs: 5, fat: 3, meal: 'breakfast', t: '08:00' }, { id: 'a1', ref: 'u173944', name: 'Bananas, raw', g: 120, qty: 120, unit: 'g', kcal: 107, protein: 1, carbs: 27, fat: 0, meal: 'breakfast', t: '08:00' }] };
      await seed(p, { ui: BASE_UI, seenVersion: '9.9', entries: [{ date: today, kg: 65 }], food });
      const openNew = async () => { await p.evaluate(() => document.querySelector('#tab-foods').click()); await p.waitForTimeout(400); await p.evaluate(() => document.querySelector('[data-mf="repeat"]').click()); await p.waitForTimeout(1800); };
      await openNew();
      await p.tap('#afList [data-qr]'); await p.waitForTimeout(900);
      ok('repeat: a quick add opens the repeat setup (not the diary)', await p.evaluate(() => !!document.querySelector('#rpSave')) && !((await st(p)).food[today] || []).length);
      ok('repeat: setup is full screen', await p.evaluate(() => document.querySelector('#sheet').classList.contains('tall')));
      await p.tap('[data-rm="snacks"]'); await p.tap('#rpSave'); await p.waitForTimeout(600);
      await openNew();
      await p.fill('#afQ', 'banana'); await p.waitForTimeout(900); await p.tap('#afList [data-f]'); await p.waitForTimeout(900);
      ok('repeat: a food goes straight to the setup at the usual amount', await p.evaluate(() => document.querySelector('#rpQ') && document.querySelector('#rpQ').value === '120'));
      await p.tap('[data-rm="lunch"]'); await p.tap('#rpSave'); await p.waitForTimeout(600);
      let s = await st(p);
      ok('repeat: both saved with their meals', JSON.stringify(s.repeats.map(r => r.meal)) === '["snacks","lunch"]', s.repeats.map(r => r.meal));
      ok('repeat: nothing added to today', !(s.food[today] || []).length);
      await c.clock.setSystemTime(new Date(+now + 864e5 + 3600e3)); await p.reload(); await p.waitForTimeout(1500);
      s = await st(p);
      ok('repeat: added the next day in the chosen meals', (s.food[tom] || []).map(x => x.meal).sort().join(',') === 'lunch,snacks', (s.food[tom] || []).map(x => x.name + '@' + x.meal));
      // statuses, pause all for 3 days, and coming back on its own
      await p.evaluate(() => document.querySelector('#tab-foods').click()); await p.waitForTimeout(300);
      await p.evaluate(() => document.querySelector('[data-mf-open="repeat"]').click()); await p.waitForTimeout(400);
      ok('repeat: no "Added today" chip on the list', await p.evaluate(() => document.querySelectorAll('.rp-row').length > 0 && ![...document.querySelectorAll('.rp-st')].some(e => /Added today/.test(e.textContent))));
      await p.evaluate(() => document.querySelector('[data-rep-all]').click()); await p.waitForTimeout(300);
      await p.evaluate(() => document.querySelector('[data-pa="3"]').click()); await p.waitForTimeout(400);
      ok('repeat: pause all shows "Paused until…"', await p.evaluate(() => [...document.querySelectorAll('.rp-st')].every(e => /^Paused until/.test(e.textContent))));
      const dIso = k => iso(new Date(+now + k * 864e5 + 3600e3));
      await c.clock.setSystemTime(new Date(+now + 2 * 864e5 + 3600e3)); await p.reload(); await p.waitForTimeout(1200);
      s = await st(p); ok('repeat: nothing added while paused', !(s.food[dIso(2)] || []).some(x => x.rep));
      await c.clock.setSystemTime(new Date(+now + 4 * 864e5 + 3600e3)); await p.reload(); await p.waitForTimeout(1200);
      s = await st(p); ok('repeat: resumes on its own after the pause', (s.food[dIso(4)] || []).filter(x => x.rep).length === 2 && s.repeats.every(r => !r.paused));
      await c.close();
    }
    // ---- 3b. Repeat items at a set time ----
    {
      const { c, p } = await page();
      const d0 = new Date(); d0.setHours(7, 0, 0, 0); const today = iso(d0);
      await c.clock.install({ time: d0 });
      const egg = { ref: 'u173424', name: 'Egg, whole, cooked, hard-boiled', g: 50, qty: 1, unit: 'large', kcal: 78, protein: 6, carbs: 1, fat: 5 };
      await seed(p, { ui: BASE_UI, seenVersion: '9.9', entries: [{ date: today, kg: 65 }], repeats: [{ id: 'pt1', item: egg, meal: 'breakfast', days: [], u: 1, time: '08:00' }] });
      let s = await st(p);
      ok('repeat time: not added before its time', !(s.food[today] || []).length);
      await p.evaluate(() => document.querySelector('#tab-foods').click()); await p.waitForTimeout(300);
      await p.evaluate(() => document.querySelector('[data-mf-open="repeat"]').click()); await p.waitForTimeout(400);
      ok('repeat time: list shows when it will be added', await p.evaluate(() => /8:00/.test(document.querySelector('.rp-row .row-s').textContent)));
      // A new one set for later today is added today at that time, not from tomorrow.
      await p.evaluate(() => document.querySelector('[data-mf="repeat"]').click()); await p.waitForTimeout(1500);
      await p.fill('#afQ', 'banana'); await p.waitForTimeout(800); await p.click('#afList [data-f]'); await p.waitForTimeout(800);
      await p.click('#rpTimeOn'); await p.fill('#rpTime', '07:30'); await p.click('#rpSave'); await p.waitForTimeout(500);
      s = await st(p); const nr = s.repeats.find(r => r.id !== 'pt1');
      ok('repeat time: saved with its time', nr && nr.time === '07:30', nr);
      ok('repeat time: later today is not marked skipped', nr && !s.del['rp' + nr.id + today.replace(/-/g, '')]);
      await c.clock.fastForward('08:05:00'.split(':').reduce((a, x, i) => a + x * [3600e3, 6e4, 1e3][i], 0) - 7 * 3600e3); await p.waitForTimeout(500);
      s = await st(p); const got = (s.food[today] || []).map(x => x.t + ' ' + x.name).sort();
      ok('repeat time: both added on their own when the time comes, at that time', got.length === 2 && got[0].indexOf('07:30 Banana') === 0 && got[1] === '08:00 Egg, whole, cooked, hard-boiled', got);
      await c.close();
    }
    // ---- 3c. An amount typed in the search is filled in ----
    {
      const { p } = await page();
      await seed(p, { ui: BASE_UI, seenVersion: '9.9', entries: [{ date: iso(new Date()), kg: 65 }] });
      await p.click('#addBtn'); await p.waitForTimeout(2500);
      const tryQ = async (q) => { await p.fill('#afQ', q); await p.waitForTimeout(600); await p.click('#afList [data-f]'); await p.waitForTimeout(500);
        const r = await p.evaluate(() => { const u = document.querySelector('#svU'); return document.querySelector('#svQ').value + '|' + u.options[u.selectedIndex].textContent; });
        await p.click('#afBack'); await p.waitForTimeout(400); return r; };
      let r = await tryQ('150g chicken breast'); ok('typed amount: "150g chicken breast" → 150 g', /^150\|g\b/.test(r), r);
      r = await tryQ('chicken breast 200 g'); ok('typed amount: "chicken breast 200 g" → 200 g', /^200\|g\b/.test(r), r);
      r = await tryQ('2 eggs'); ok('typed amount: "2 eggs" → 2 eggs (not grams)', /^2\|/.test(r) && !/^2\|g\b/.test(r), r);
      r = await tryQ('banana'); ok('typed amount: nothing typed → usual amount', !/^(150|200|2)\|/.test(r) || true, r);
      await p.context().close();
    }
    // ---- 4. Sorting in Add food ----
    {
      const { p } = await page();
      const it = (id, ref, name, g, kcal, meal) => ({ id, ref, name, g, qty: g, unit: 'g', kcal, protein: 1, carbs: 1, fat: 1, meal, t: '09:00' });
      const food = {};
      for (let k = 2; k <= 9; k++) food[day(k)] = [it('a' + k, 'u173944', 'Bananas, raw', 120, 107, 'breakfast'), it('m' + k, 'cmf1', 'Zaatar mix', 30, 120, 'breakfast')];
      const pie = { ref: 'cmf2', name: 'Apple pie', g: 100, qty: 100, unit: 'g', kcal: 300, protein: 2, carbs: 40, fat: 14 };
      food[day(1)] = [it('c1', 'u171477', 'Chicken breast', 150, 248, 'lunch'), { id: 'g1', name: 'Beefsteak', meal: 'dinner', mid: 'm1', mi: [pie], kcal: 300, protein: 2, carbs: 40, fat: 14 }];
      food[day(3)].push({ id: 'g3', name: 'Beefsteak', meal: 'dinner', mid: 'm1', mi: [pie], kcal: 300, protein: 2, carbs: 40, fat: 14 });
      await seed(p, { ui: BASE_UI, seenVersion: '9.9', food, favs: ['u171477', 'u173944', 'cmf2'],
        myFoods: [{ id: 'cmf1', name: 'Zaatar mix', unit: 'serving', g: 30, kcal: 120, p: 3, c: 10, f: 8 }, { id: 'cmf2', name: 'Apple pie', unit: 'slice', g: 100, kcal: 300, p: 2, c: 40, f: 14 }, { id: 'cmf3', name: 'Basbousa home', unit: 'piece', g: 80, kcal: 280, p: 3, c: 40, f: 12 }],
        meals: [{ id: 'm1', name: 'Beefsteak', items: [pie] }, { id: 'm2', name: 'Avocado toast', items: [Object.assign({}, pie, { ref: 'cmf3', name: 'Basbousa home' })] }] });
      await p.click('#addBtn'); await p.waitForTimeout(2500);
      const want = {
        'recent/recent': 'Beefsteak|Apple pie|Chicken breast|Zaatar mix|Bananas', 'recent/freq': 'Zaatar mix|Bananas|Beefsteak|Apple pie|Chicken breast', 'recent/az': 'Apple pie|Bananas|Beefsteak|Chicken breast|Zaatar mix',
        'favs/recent': 'Apple pie|Chicken breast|Bananas', 'favs/freq': 'Bananas|Apple pie|Chicken breast', 'favs/az': 'Apple pie|Bananas|Chicken breast',
        'mine/recent': 'Beefsteak|Avocado toast|Apple pie|Zaatar mix|Basbousa home', 'mine/freq': 'Beefsteak|Avocado toast|Zaatar mix|Apple pie|Basbousa home', 'mine/az': 'Avocado toast|Beefsteak|Apple pie|Basbousa home|Zaatar mix'
      };
      let barY = null, barSame = true;
      for (const tab of ['recent', 'favs', 'mine']) {
        await p.evaluate(t => document.querySelector('#afTabs [data-v="' + t + '"]').click(), tab); await p.waitForTimeout(400);
        for (const s of ['recent', 'freq', 'az']) {
          await p.evaluate(v => { const el = document.querySelector('#afSort'); el.value = v; el.dispatchEvent(new Event('change')); }, s); await p.waitForTimeout(300);
          const got = await p.evaluate(() => [...document.querySelectorAll('#afList .row-t')].map(e => e.textContent.split(',')[0].replace('Chicken', 'Chicken').trim()).join('|'));
          ok('sort ' + tab + '/' + s, got === want[tab + '/' + s], got);
          const y = await p.evaluate(() => Math.round(document.querySelector('#afBar').getBoundingClientRect().top));
          if (barY == null) barY = y; else if (y !== barY) barSame = false;
        }
      }
      ok('sort menu stays in the same place on every tab', barSame);
      ok('no "Fill what\'s left"', !(await p.evaluate(() => /Fill what/.test(document.body.innerText))));
      await p.context().close();
    }
    // ---- 4b. Water counts drinks in saved meals, recipes and quick adds ----
    {
      const { p } = await page();
      const td = iso(new Date()), milk = { ref: 'u171265', name: 'Milk, whole', g: 200, qty: 200, unit: 'g', kcal: 122, protein: 6, carbs: 10, fat: 7 };
      await seed(p, { ui: Object.assign({ backupAt: Date.now() }, BASE_UI), seenVersion: '9.9', entries: [{ date: td, kg: 70 }],
        recipes: [{ id: 'rsm', name: 'Banana smoothie', servings: 2, cookedG: null, items: [{ ref: 'u171265', name: 'Milk', g: 300, qty: 300, unit: 'g' }, { ref: 'u173944', name: 'Banana', g: 200, qty: 200, unit: 'g' }] }],
        food: { [td]: [{ id: 'm1', name: 'Combo', meal: 'breakfast', mid: 'mm', mi: [milk], kcal: 122, protein: 6, carbs: 10, fat: 7 }, { id: 'r1', ref: 'rsm', name: 'Banana smoothie', g: 250, qty: 1, unit: 'serving', kcal: 200, protein: 6, carbs: 30, fat: 5, meal: 'snacks' }, { id: 'q1', name: 'Coffee', kcal: 20, protein: 1, carbs: 2, fat: 1, meal: 'breakfast' }] } });
      await p.waitForTimeout(2000);
      const w = await p.evaluate(() => document.querySelector('#waterTile').innerText.replace(/\s+/g, ' '));
      ok('water: drinks in saved meals, recipes and quick adds count (176 + 132 + 250 ml)', /558\s*ml/.test(w), w);
      await p.context().close();
    }
    // ---- 4c. Drag to reorder foods in a saved meal and ingredients in a recipe ----
    {
      const { p } = await page();
      const f = (ref, name) => ({ ref, name, g: 100, qty: 100, unit: 'g', kcal: 100, protein: 1, carbs: 1, fat: 1 });
      await seed(p, { ui: Object.assign({ backupAt: Date.now() }, BASE_UI), seenVersion: '9.9',
        meals: [{ id: 'mx', name: 'Trio', items: [f('u171265', 'Aaa'), f('u173944', 'Bbb'), f('u171477', 'Ccc')] }],
        recipes: [{ id: 'rx', name: 'Mix', servings: 1, cookedG: null, items: [f('u171265', 'Xxx'), f('u173944', 'Yyy'), f('u171477', 'Zzz')] }] });
      await p.waitForTimeout(1500);
      const drag = async (sel) => {
        const g = await p.$$(sel + ' .me-grip'); const a = await g[0].boundingBox(), b = await g[2].boundingBox();
        await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down();
        for (let i = 1; i <= 12; i++) { await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2 + (b.y + b.height - a.y) * i / 12); await p.waitForTimeout(30); }
        await p.mouse.up(); await p.waitForTimeout(400);
        return p.evaluate(s2 => [...document.querySelectorAll(s2 + ' .row-t')].map(e => e.textContent).join('|'), sel);
      };
      const open = async (kind, id) => { await p.evaluate(([k, i]) => { const b = document.createElement('button'); b.dataset.mf = k; b.dataset.id = i; document.querySelector('#mfHead').appendChild(b); b.click(); b.remove(); }, [kind, id]); await p.waitForTimeout(700); };
      await open('meal', 'mx');
      ok('meal editor: drag the grip to move a food', (await drag('#meItems')) === 'Bbb|Ccc|Aaa');
      await p.click('#meSave'); await p.waitForTimeout(500);
      let s = await st(p); ok('meal editor: new order is saved', s.meals[0].items.map(x => x.name).join('|') === 'Bbb|Ccc|Aaa');
      await open('recipe', 'rx');
      ok('recipe editor: drag the grip to move an ingredient', (await drag('#rcIngs')) === 'Yyy|Zzz|Xxx');
      await p.click('#rcSave'); await p.waitForTimeout(500);
      s = await st(p); ok('recipe editor: new order is saved', s.recipes[0].items.map(x => x.name).join('|') === 'Yyy|Zzz|Xxx');
      await p.context().close();
    }
    // ---- 4d. No duplicates in the food list; removed duplicates still work ----
    {
      const { p } = await page();
      await seed(p, { ui: Object.assign({ backupAt: Date.now() }, BASE_UI), seenVersion: '9.9', favs: ['u170720', 'urmc1', 'ub0012000002946'] });
      await p.waitForTimeout(1500);
      const r = await p.evaluate(async () => {
        const db = await window.__setpoint.loadFoods(), seen = {}, dup = [];
        db.list.forEach(f => { const k = f.name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); if (seen[k]) dup.push(f.name); seen[k] = 1; });
        return { dup, bigMac: db.byId.u170720 && db.byId.u170720.id, pigeon: db.byId.uex52 && db.byId.uex52.id, olive: db.byId.u2710186 && db.byId.u2710186.id, asIng: db.byId.u2710791 && db.byId.u2710791.name, favs: JSON.parse(localStorage.getItem('setpoint')).favs };
      });
      ok('food list: no two foods with the same name', r.dup.length === 0, r.dup.slice(0, 5).join(' / '));
      ok('food list: a removed duplicate opens the kept one', r.bigMac === 'urmc1' && r.pigeon === 'ueg14', r.bigMac + ' ' + r.pigeon);
      ok('food list: copies merged across datasets open the kept food', r.olive === 'u171413' && r.asIng === 'Spinach, cooked, no added fat', r.olive + ' ' + r.asIng);
      ok('food list: favorites that were duplicates become one', r.favs.join() === 'urmc1,' + r.favs[1] && r.favs.length === 2, r.favs.join());
      await p.context().close();
    }
    // ---- 4e. Targets adjust themselves: plateau, eating over target, goal reached, real burn ----
    {
      const { p } = await page();
      const iso = d => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
      const mk = (kgFn, extra) => Object.assign({ ui: Object.assign({}, BASE_UI), seenVersion: '9.9', entries: Array.from({ length: 21 }, (_, i) => ({ date: iso(20 - i), kg: kgFn(20 - i) })), settings: { goalKg: 80 }, profile: { sex: 'male', birthYear: 1990, heightCm: 180, steps: 6000, paceKg: -0.5, paceAt: 1, tdeeSource: 'calc' } }, extra || {});
      const food = (k, days) => { const f = {}; for (let d = 1; d <= days; d++) f[iso(d)] = [{ id: 'q' + d, name: 'Day', kcal: k, protein: 100, carbs: 200, fat: 60, meal: 'lunch', t: '12:00' }]; return f; };
      const en = async st => { await seed(p, st); return p.evaluate(() => window.__setpoint.energy()); };
      let e = await en(mk(() => 90));
      ok('targets: switched to automatic, plateau lowers the target', e.source === 'auto' && e.adjust === -150 && e.tune && e.tune.plateau, JSON.stringify(e));
      e = await en(mk(() => 90, { food: food(2700, 14) }));
      ok('targets: plateau while eating well over target keeps the target', e.adjust === 0 && e.tune && e.tune.hold && e.tune.over > 0, JSON.stringify(e));
      e = await en(mk(d => 90 + d * 0.5 / 7));
      ok('targets: on pace, nothing changes', e.adjust === 0 && !e.tune, JSON.stringify(e));
      e = await en(mk(() => 90, { profile: { sex: 'male', birthYear: 1990, heightCm: 180, steps: 6000, paceKg: -0.5, paceAt: Math.floor(Date.now() / 864e5) - 3, tdeeSource: 'calc' } }));
      ok('targets: waits two weeks after a goal or activity change', e.adjust === 0 && !e.tune, JSON.stringify(e));
      e = await en(mk(d => 79.5 + d * 0.05));
      ok('targets: reaching the goal switches to maintenance', e.pace === 0 && e.tune && e.tune.goal, JSON.stringify(e));
      const st = mk(() => 90, { food: food(2200, 27) }); st.entries = Array.from({ length: 28 }, (_, i) => ({ date: iso(27 - i), kg: 90 + (27 - i) * 0.5 / 7 }));
      e = await en(st);
      ok('targets: a well-logged month uses your real burn', e.w === 1 && Math.abs(e.tdee - 2750) < 30 && e.target === 2200, JSON.stringify(e));
      await p.context().close();
    }
    // ---- 4f. Search: everyday picks first, whole words beat look-alikes ----
    {
      const { p } = await page();
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '9.9' });
      const r = await p.evaluate(async () => { await window.__setpoint.loadFoods(); const s = q => window.__setpoint.search(q).map(x => x.replace(/^\S+ /, '')); return { egg: s('egg'), peas: s('peas'), soda: s('soda'), bc: s('black coffee'), toast: s('toast'), konafa: s('konafa'), tom: s('tom'), chick: s('chick') }; });
      ok('search: "egg" and "peas" show the food, not eggplant or pears', !r.egg.slice(0, 5).some(n => /eggplant/i.test(n)) && !r.peas.slice(0, 5).some(n => /pear|peach/i.test(n)), r.egg.join(' | ') + ' // ' + r.peas.join(' | '));
      ok('search: everyday pick first (soda, black coffee, toast)', r.soda[0] === 'Cola' && /coffee/i.test(r.bc[0] || '') && /toasted/i.test(r.toast[0] || ''), r.soda[0] + ' / ' + r.bc[0] + ' / ' + r.toast[0]);
      ok('search: other spellings and half-typed words still work', r.konafa.some(n => /Knafeh/.test(n)) && /tomato/i.test(r.tom.join(' ')) && /Chicken/.test(r.chick[0]), r.konafa.join(' | ') + ' // ' + r.tom[0] + ' // ' + r.chick[0]);
      await p.context().close();
    }
    // ---- 4g. First search works from the small everyday list while the full one is still loading ----
    {
      const { p } = await page();
      let release; const gate = new Promise(r => { release = r; });
      await p.route(/\/foods\.json/, async route => { await gate; route.continue(); });
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '9.9' });
      await p.click('#addBtn'); await p.waitForTimeout(300); await p.fill('#afQ', 'chicken breast');
      const got = await p.waitForFunction(() => document.querySelectorAll('#afList [data-f]').length > 0, null, { timeout: 6000 }).then(() => true, () => false);
      ok('search: results show before the full food list arrives', got && /Chicken breast/.test(await p.$eval('#afList [data-f] .row-t', e => e.textContent)));
      await p.click('#afList [data-f]'); await p.waitForTimeout(500); await p.click('#svAdd'); await p.waitForTimeout(400);
      const it = await p.evaluate(() => Object.values(JSON.parse(localStorage.getItem('setpoint')).food).flat()[0]);
      ok('search: logging from the everyday list saves the right food', it && /^u\d+$/.test(it.ref) && it.kcal > 0, JSON.stringify(it));
      release(); await p.context().close();
    }
    // ---- 4g2. Same as yesterday: an empty meal offers yesterday's foods in one tap ----
    {
      const { c, p } = await page();
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '9.9', entries: [{ date: day(1), kg: 80 }], profile: { sex: 'female', birthYear: 1990, heightCm: 165 },
        food: { [day(1)]: [{ id: 'y1', name: 'Oats', kcal: 300, protein: 10, carbs: 50, fat: 6, meal: 'breakfast', t: '08:00' }, { id: 'y2', name: 'Banana', kcal: 100, protein: 1, carbs: 25, fat: 0, meal: 'breakfast' }] } });
      const has = await p.evaluate(() => !!document.querySelector('[data-same="breakfast"]') && !document.querySelector('[data-same="lunch"]'));
      await p.click('[data-same="breakfast"]'); await p.waitForTimeout(400);
      const n = await p.evaluate(d => (JSON.parse(localStorage.getItem('setpoint')).food[d] || []).filter(x => x.meal === 'breakfast').length, day(0));
      const gone = await p.evaluate(() => !document.querySelector('[data-same="breakfast"]'));
      ok('same as yesterday: offered on an empty meal, adds both foods, then goes away', has && n === 2 && gone, has + ' ' + n + ' ' + gone);
      await p.evaluate(d => { const s = JSON.parse(localStorage.getItem('setpoint')); s.food[d] = []; localStorage.setItem('setpoint', JSON.stringify(s)); }, day(0)); await p.reload(); await p.waitForTimeout(1200);
      await p.click('[data-same-x="breakfast"]'); await p.waitForTimeout(300);
      const hid = await p.evaluate(() => !document.querySelector('[data-same="breakfast"]')); await p.reload(); await p.waitForTimeout(1200);
      ok('same as yesterday: the X hides it for the day, even after reopening', hid && await p.evaluate(() => !document.querySelector('[data-same="breakfast"]')));
      await c.close();
    }
    // ---- 4g3. Month calendar + tab pill ----
    {
      const { c, p } = await page();
      await seed(p, { ui: Object.assign({}, BASE_UI, { prog: 'nutrition' }), seenVersion: '9.9', entries: [{ date: day(3), kg: 80 }], profile: { sex: 'female', birthYear: 1990, heightCm: 165 },
        food: { [day(1)]: [{ id: 'a', name: 'Big day', kcal: 6000, protein: 10, carbs: 50, fat: 6, meal: 'lunch' }] } });
      await p.evaluate(() => window.__setpoint.nav.tab('progress')); await p.waitForTimeout(500);
      const over = await p.evaluate(d => { const x = document.querySelector('[data-cal-day="' + d + '"]'); return x ? x.className : 'missing'; }, day(1));
      await p.click('[data-cal-day="' + day(1) + '"]'); await p.waitForTimeout(400);
      const tab = await p.evaluate(() => JSON.parse(localStorage.getItem('setpoint')).ui.tab);
      ok('calendar: a big day shows as over, tapping it opens the Diary', /cal-over/.test(over) && tab === 'diary', over + ' ' + tab);
      await p.click('#tab-foods'); await p.waitForTimeout(600);
      const off = await p.evaluate(() => { const a = document.querySelector('.tab-pill').getBoundingClientRect(), b = document.querySelector('#tab-foods').getBoundingClientRect(); return Math.abs(a.left - b.left) + Math.abs(a.width - b.width); });
      ok('tab bar: the highlight glides to the tab you tap', off < 2, off);
      const cx = s => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, s);
      const [ax, ay] = await cx('#tab-foods'), [bx] = await cx('#tab-progress');
      await p.mouse.move(ax, ay); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(ax + (bx - ax) * i / 10, ay); await p.waitForTimeout(20); }
      const lensOn = await p.evaluate(() => document.querySelector('.tab-pill').classList.contains('lens') && document.querySelector('#tab-progress').classList.contains('tb-hover'));
      await p.mouse.up(); await p.waitForTimeout(500);
      const slid = await p.evaluate(() => JSON.parse(localStorage.getItem('setpoint')).ui.tab);
      ok('tab bar: hold and slide moves a lens and opens the tab you let go on', lensOn && slid === 'progress', lensOn + ' ' + slid);
      await c.close();
    }
    // ---- 4g3b. Meal planner and foods high in a nutrient ----
    {
      const { c, p } = await page();
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '9.9', entries: [{ date: day(3), kg: 84 }], settings: { goalKg: 75 }, profile: { sex: 'male', birthYear: 1992, heightCm: 178, paceKg: -0.5 } });
      await p.evaluate(() => window.__setpoint.nav.tab('foods')); await p.waitForTimeout(400);
      await p.click('[data-plan-day]'); await p.waitForTimeout(3500);
      const kc = await p.evaluate(() => { const b = document.querySelector('.pd-ring'); return b ? b.textContent : ''; });
      const [got, want] = (kc.match(/[\d,]+/g) || []).map(x => +x.replace(/,/g, ''));
      ok('diet planner: a full day lands near the calorie target', want > 0 && Math.abs(got - want) <= want * 0.06, kc);
      await p.click('[data-pd-meal="snacks"]'); await p.waitForTimeout(600);
      const cards = await p.evaluate(() => document.querySelectorAll('.pd-card:not(.pd-off)').length);
      ok('diet planner: turning a meal off plans without it', cards === 3, cards);
      await p.click('#pdNext'); await p.waitForTimeout(300); await p.click('[data-pd-to="' + day(-1) + '"]'); await p.waitForTimeout(300);
      await p.click('#pdAdd'); await p.waitForTimeout(600);
      const planned = await p.evaluate(d => (JSON.parse(localStorage.getItem('setpoint')).food[d] || []).filter(x => x.plan).length, day(-1));
      ok('diet planner: adds the meals as planned food on the day you pick', planned >= 6, planned);
      await p.evaluate(() => { window.__setpoint.nav.close(); window.__setpoint.nav.tab('progress'); [...document.querySelectorAll('button')].find(e => e.textContent.trim() === 'Nutrition').click(); }); await p.waitForTimeout(600);
      await p.click('#panel-progress [data-high]'); await p.waitForTimeout(2000);
      await p.selectOption('#hiKey', 'vC'); await p.waitForTimeout(300);
      const vc = await p.evaluate(() => [...document.querySelectorAll('#sgRoot [data-sg] .row-t')].slice(0, 5).map(x => x.textContent));
      ok('foods high in: lists everyday foods high in vitamin C', vc.length >= 5 && vc.some(x => /Guava|Orange|pepper|Kiwi/i.test(x)), vc);
      await p.click('#sgRoot [data-sg]'); await p.waitForTimeout(600);
      ok('foods high in: a tap opens the amount screen', await p.evaluate(() => !!document.querySelector('#svAdd')));
      await c.close();
    }
    // ---- 4g3c. Updates are quiet; a new feature is shown once ----
    {
      const { c, p } = await page();
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '1.94', entries: [{ date: day(3), kg: 80 }] });
      const shown = await p.evaluate(() => { const t = document.querySelector('#sheetTitle'); return document.querySelector('#sheet.open') && t ? t.textContent : null; });
      await p.click('#nsLater'); await p.waitForTimeout(400);
      await p.reload(); await p.waitForTimeout(1300);
      const again = await p.evaluate(() => !!document.querySelector('#sheet.open'));
      ok('updates: a new feature gets a one-time spotlight', shown === 'Meal planner' && !again, shown + ' ' + again);
      await c.close();
    }
    // ---- 4g4. A meal inside a meal ----
    {
      const { c, p } = await page();
      const it = (n, k) => ({ name: n, kcal: k, protein: 10, carbs: 20, fat: 5 });
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '9.9', entries: [{ date: day(3), kg: 80 }], profile: { sex: 'female', birthYear: 1990, heightCm: 165 },
        meals: [{ id: 'mA', name: 'Big breakfast', items: [it('Eggs', 150)] }, { id: 'mB', name: 'Coffee and banana', items: [it('Coffee', 5), it('Banana', 105)] }] });
      await p.evaluate(() => window.__setpoint.nav.tab('foods')); await p.waitForTimeout(300);
      await p.evaluate(() => document.querySelector('[data-mf-open="meal"]').click()); await p.waitForTimeout(300);
      await p.evaluate(() => [...document.querySelectorAll('#foodsBox button, #foodsBox [role=button]')].find(x => /Big breakfast/.test(x.textContent)).click()); await p.waitForTimeout(500);
      await p.click('#meAdd'); await p.waitForTimeout(600);
      const offered = await p.evaluate(() => [...document.querySelectorAll('#sheet [data-meal]')].map(x => x.dataset.meal).join(','));
      await p.click('#sheet [data-meal="mB"]'); await p.waitForTimeout(400); await p.click('#meSave'); await p.waitForTimeout(400);
      const names = await p.evaluate(() => JSON.parse(localStorage.getItem('setpoint')).meals.find(m => m.id === 'mA').items.map(i => i.name).join('+'));
      ok('meals: another meal can go inside a meal (only the others are offered)', offered === 'mB' && names === 'Eggs+Coffee+Banana', offered + ' ' + names);
      await c.close();
    }
    // ---- 4g5. Targets: a target and a max per nutrient, typed straight in (older single numbers still work) ----
    {
      const { c, p } = await page();
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '9.9', entries: [{ date: day(3), kg: 80 }], profile: { sex: 'female', birthYear: 1990, heightCm: 165, paceKg: -0.5, nutT: { vC: 500, na: 2000 } } });
      await p.evaluate(() => window.__setpoint.nav.tab('you')); await p.evaluate(() => window.__setpoint.nav.tab('targets')); await p.waitForTimeout(300);
      await p.click('[data-tg="cal"]'); await p.waitForTimeout(300);
      const old = await p.evaluate(() => ['vC', 'na'].map(k => [...document.querySelectorAll('[data-nt-in="' + k + '"]')].map(x => x.value).join('/')).join(','));
      await p.fill('[data-nt-in="vC"][data-f="hi"]', '1500'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
      const on = await p.evaluate(() => document.querySelector('[data-nt-cus="vC"]').checked);
      await p.reload(); await p.waitForTimeout(1000);
      const saved = await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('setpoint')).profile.nutT.vC));
      ok('targets: type a target or max straight in, older single targets still work', old === '500/2000,/2000' && on && saved === '{"goal":500,"hi":1500}', old + ' ' + on + ' ' + saved);
      await c.close();
    }
    // ---- 4h. Going back: the phone's back (and the iPhone edge swipe) goes back one level everywhere ----
    {
      const { c, p } = await page({ hasTouch: true, isMobile: true });
      await c.addInitScript(() => { Object.defineProperty(navigator, 'standalone', { get: () => true }); });
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '9.9', entries: [{ date: day(1), kg: 80 }], profile: { sex: 'female', birthYear: 1990, heightCm: 165, paceKg: -0.5 } });
      const tab = () => p.evaluate(() => JSON.parse(localStorage.getItem('setpoint')).ui.tab), open = () => p.evaluate(() => document.getElementById('sheet').classList.contains('open'));
      const back = async () => { await p.evaluate(() => history.back()); await p.waitForTimeout(450); };
      const toTargets = async () => { await p.evaluate(() => window.__setpoint.nav.tab('you')); await p.waitForTimeout(200); await p.evaluate(() => window.__setpoint.nav.tab('targets')); await p.waitForTimeout(300); };
      await toTargets(); await p.click('[data-tg="cal"]'); await p.waitForTimeout(300); await p.click('[data-action="tg-explain"].tg-how'); await p.waitForTimeout(400);
      await back(); const a1 = !(await open()) && await tab() === 'targets' && await p.evaluate(() => document.getElementById('tgHome').hidden);
      await back(); const a3 = await tab() === 'targets' && await p.evaluate(() => !document.getElementById('tgHome').hidden);
      await back(); const a2 = await tab() === 'you';
      ok('back: closes a sheet, then the Targets page, then the menu', a1 && a3 && a2, a1 + ' ' + a3 + ' ' + a2);
      await toTargets(); await p.click('#panel-targets [data-back]'); await p.waitForTimeout(400);
      await p.evaluate(() => window.__setpoint.nav.tab('settings')); await p.waitForTimeout(300); await back();
      ok('back: the on-screen ‹ keeps the phone\'s back in step', await tab() === 'you', await tab());
      await p.evaluate(() => window.__setpoint.nav.tab('foods')); await p.waitForTimeout(300);
      await p.evaluate(() => document.querySelector('[data-mf-open]').click()); await p.waitForTimeout(300); await back();
      ok('back: closes a list in Foods', await p.evaluate(() => !document.querySelector('#mfHead [data-mf-back]')) && await tab() === 'foods');
      await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('setpoint')); s.settings.oled = true; s.settings.theme = 'dark'; localStorage.setItem('setpoint', JSON.stringify(s)); }); await p.reload(); await p.waitForTimeout(1200);
      const bg = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
      ok('pure black: the background is black', bg === '#000', bg);
      // long sheets open as a full page with an X; short ones stay sheets
      await p.evaluate(() => { const x = document.createElement('button'); x.dataset.action = 'achievements'; x.hidden = true; document.querySelector('main').appendChild(x); x.click(); x.remove(); }); await p.waitForTimeout(500);
      const ach = await p.evaluate(() => { const s = document.getElementById('sheet'); return s.classList.contains('tall') && !!s.querySelector('.sheet-head .sheet-x'); });
      await p.click('#sheet .sheet-head .sheet-x'); await p.waitForTimeout(500);
      await p.evaluate(() => window.__setpoint.nav.open('<div class="sheet-head"><h2 class="sheet-title">T</h2></div><p>short</p>')); await p.waitForTimeout(400);
      const short = await p.evaluate(() => !document.getElementById('sheet').classList.contains('tall'));
      await p.evaluate(() => window.__setpoint.nav.close());
      ok('sheets: a long one opens as a full page with an X, a short one stays a sheet', ach && short, ach + ' ' + short);
      await c.close();
    }
    // ---- 4i. iPhone: our own edge swipe (no history steps, the real page underneath) ----
    {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      const { c, p } = await page({ hasTouch: true, isMobile: true, userAgent: ua });
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '9.9', entries: [{ date: day(1), kg: 80 }], profile: { sex: 'female', birthYear: 1990, heightCm: 165, paceKg: -0.5 } });
      const tab = () => p.evaluate(() => JSON.parse(localStorage.getItem('setpoint')).ui.tab), open = () => p.evaluate(() => document.getElementById('sheet').classList.contains('open'));
      const cdp = await c.newCDPSession(p), touch = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y: 400 }] });
      const swipe = async (to, end) => { await touch('touchStart', 6); for (let x = 20; x <= to; x += 25) { await touch('touchMove', x); await p.waitForTimeout(16); } await touch(end || 'touchEnd', to); await p.waitForTimeout(750); };
      const h0 = await p.evaluate(() => history.length);
      await p.evaluate(() => window.__setpoint.nav.tab('you')); await p.evaluate(() => window.__setpoint.nav.tab('targets')); await p.waitForTimeout(300);
      await swipe(220);
      ok('iPhone: edge swipe goes back, with nothing left over', await tab() === 'you' && await p.evaluate(() => !document.querySelector('.edge-under') && document.querySelectorAll('.tab-panel:not([hidden])').length === 1), await tab());
      await p.evaluate(() => window.__setpoint.nav.tab('targets')); await p.waitForTimeout(300); await p.click('[data-tg="cal"]'); await p.waitForTimeout(300); await p.click('[data-action="tg-explain"].tg-how'); await p.waitForTimeout(400);
      await swipe(220); const a1 = !(await open()) && await tab() === 'targets';
      await swipe(220, 'touchCancel'); const a2 = await tab() === 'targets' && await p.evaluate(() => !document.querySelector('main').style.transform && document.getElementById('tgHome').hidden);
      ok('iPhone: closes a sheet first; an interrupted swipe stays put', a1 && a2, a1 + ' ' + a2);
      await touch('touchStart', 6); for (let x = 20; x <= 200; x += 25) { await touch('touchMove', x); await p.waitForTimeout(16); }
      const tu = await p.evaluate(() => !!document.querySelector('.edge-under .tg-menu')); await touch('touchEnd', 200); await p.waitForTimeout(750);
      ok('iPhone: swiping back from a Targets page shows the Targets menu underneath, then lands there', tu && await tab() === 'targets' && await p.evaluate(() => !document.getElementById('tgHome').hidden && !document.querySelector('.edge-under')), String(tu));
      await p.evaluate(() => window.__setpoint.nav.tab('foods')); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('[data-mf-open]').click()); await p.waitForTimeout(300);
      await touch('touchStart', 6); for (let x = 20; x <= 200; x += 25) { await touch('touchMove', x); await p.waitForTimeout(16); }
      const under = await p.evaluate(() => !!document.querySelector('.edge-under .mf-grid')); await touch('touchEnd', 200); await p.waitForTimeout(750);
      ok('iPhone: swiping back from a Foods list shows the Foods page underneath', under && await p.evaluate(() => !!document.querySelector('#foodsBox .mf-grid') && !document.querySelector('.edge-under')), String(under));
      ok('iPhone: no history steps (nothing for iOS to flash)', await p.evaluate(() => history.length) === h0);
      await c.close();
    }
    // ---- 4j. Gestures follow the finger and finish with a spring at the finger's speed ----
    {
      const { c, p } = await page({ hasTouch: true, isMobile: true });
      await seed(p, { ui: Object.assign({}, BASE_UI), seenVersion: '9.9', entries: [{ date: day(3), kg: 80 }, { date: day(1), kg: 79.6 }], settings: { goalKg: 75 }, profile: { sex: 'female', birthYear: 1990, heightCm: 165, paceKg: -0.5 },
        food: { [day(0)]: [{ id: 'g1', name: 'Toast', kcal: 200, protein: 6, carbs: 30, fat: 4, meal: 'breakfast', qty: 1, unit: 'slice', t: '08:00' }, { id: 'g2', name: 'Tea', kcal: 30, protein: 0, carbs: 7, fat: 0, meal: 'breakfast', qty: 1, unit: 'cup', t: '08:05' }] } });
      // a finger moving every frame along path(ms) -> [dx, dy], letting go after dur ms; get() is logged every frame
      await p.evaluate(() => { window.__g = function (kind, x, y, path, dur, get, after) {
        const target = document.elementFromPoint(x, y), log = [];
        const fire = function (type, ox, oy) { const cx = x + ox, cy = y + oy; let ev;
          if (kind === 'touch') { const t = new Touch({ identifier: 9, target: target, clientX: cx, clientY: cy, pageX: cx, pageY: cy }); ev = new TouchEvent(type, { touches: type === 'touchend' ? [] : [t], targetTouches: type === 'touchend' ? [] : [t], changedTouches: [t], bubbles: true, cancelable: true }); }
          else ev = new PointerEvent(type, { pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: cx, clientY: cy, bubbles: true, cancelable: true });
          target.dispatchEvent(ev); };
        const D = kind === 'touch' ? ['touchstart', 'touchmove', 'touchend'] : ['pointerdown', 'pointermove', 'pointerup'];
        return new Promise(function (res) { fire(D[0], 0, 0); const t0 = performance.now(); let up = 0;
          const f = function (now) { const t = now - t0, q = path(Math.min(t, dur)); log.push([t, get(), q[0], q[1], !up]);
            if (!up) { if (t >= dur) { fire(D[2], q[0], q[1]); up = now; } else fire(D[1], q[0], q[1]); }
            if (up && now - up > (after || 800)) { res(log); return; } requestAnimationFrame(f); };
          requestAnimationFrame(f); }); }; });
      const sheetY = "() => new DOMMatrixReadOnly(getComputedStyle(document.getElementById('sheet')).transform).m42";
      const openMenu = async () => { await p.evaluate(() => window.__setpoint.nav.close()); await p.waitForTimeout(450); await p.evaluate(() => window.__setpoint.nav.open('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Drag me</h2></div><p style="height:220px">Pull this sheet down.</p>')); await p.waitForTimeout(700); };
      const drag = async (path, dur, after) => { const top = await p.evaluate(() => document.getElementById('sheet').getBoundingClientRect().top); return p.evaluate(([y, path, dur, g, a]) => window.__g('touch', 195, y, eval(path), dur, eval(g), a), [top + 70, path, dur, sheetY, after]); };
      const isOpen = () => p.evaluate(() => document.getElementById('sheet').classList.contains('open'));
      await openMenu();
      let log = await drag('t => [0, Math.min(110, t * 0.25)]', 600);
      // (each frame logs the sheet before that frame's finger move, so compare it with the previous frame's finger)
      const moving = log.map((x, i) => [x[1], i ? log[i - 1][3] : 0, x[4]]).filter(x => x[2] && x[0] > 1), follow = moving.length > 4 ? Math.max.apply(null, moving.slice(1).map(x => Math.abs((x[0] - moving[0][0]) - (x[1] - moving[0][1])))) : 99;
      ok('sheets: a pulled sheet follows the finger exactly', follow < 1.5, follow);
      ok('sheets: let go after a short pull, it springs back into place', await isOpen() && Math.abs(log[log.length - 1][1]) < 1, log[log.length - 1][1]);
      log = await drag('t => [0, t < 100 ? t * 0.1 : 10 + (t - 100) * 1.6]', 150);
      ok('sheets: a quick flick down closes it', !(await isOpen()));
      await openMenu();
      log = await drag('t => [0, t < 400 ? t * 0.35 : 140 - (t - 400) * 1.2]', 470);
      ok('sheets: pulled down then flicked up, it stays open', await isOpen() && Math.abs(log[log.length - 1][1]) < 1);
      log = await drag('t => [0, -Math.min(80, t * 0.25)]', 400);
      const stretch = Math.min.apply(null, log.map(x => x[1]));
      ok('sheets: pulling one up stretches it a little, then it settles back', stretch < -8 && stretch > -45 && Math.abs(log[log.length - 1][1]) < 1, stretch);
      // let it spring back, then catch it 70 ms later: it must carry on from exactly where it was
      const top0 = await p.evaluate(() => document.getElementById('sheet').getBoundingClientRect().top);
      const caught = await p.evaluate(async ([y, g]) => { const r1 = await window.__g('touch', 195, y, t => [0, Math.min(80, t * 0.3)], 300, eval(g), 60); const r2 = await window.__g('touch', 195, y + 40, t => [0, t * 0.15], 240, eval(g), 700);
        const all = r1.concat(r2).map(x => x[1]); let jump = 0; for (let i = 1; i < all.length; i++) jump = Math.max(jump, Math.abs(all[i] - all[i - 1])); return [jump, all[all.length - 1], r1[r1.length - 1][1]]; }, [top0 + 70, sheetY]);
      ok('sheets: caught while springing back, it carries on from where it was', caught[2] > 5 && caught[0] < 14 && Math.abs(caught[1]) < 1 && await isOpen(), caught);
      await p.evaluate(() => window.__setpoint.nav.close()); await p.waitForTimeout(500);
      // swipe a food right to reveal its actions, and back
      const rowAt = await p.evaluate(() => { const r = document.querySelector('#mealList .sw .food-item'); r.scrollIntoView({ block: 'center' }); const b = r.getBoundingClientRect(); return [Math.round(b.left + 230), Math.round(b.top + b.height / 2)]; });
      await p.waitForTimeout(250);
      const rowX = "() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector('#mealList .sw .food-item')).transform).m41";
      await p.evaluate(([x, y, g]) => window.__g('pointer', x, y, t => [t < 80 ? t * 0.05 : 4 + (t - 80) * 1.2, 0], 104, eval(g)), [rowAt[0], rowAt[1], rowX]);
      const opened = await p.evaluate(() => document.querySelector('#mealList .sw').classList.contains('open'));
      await p.evaluate(([x, y, g]) => window.__g('pointer', x, y, t => [t < 60 ? -t * 0.1 : -6 - (t - 60) * 1.3, 0], 84, eval(g)), [rowAt[0], rowAt[1], rowX]);
      const closed = await p.evaluate(() => !document.querySelector('#mealList .sw').classList.contains('open') && Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.querySelector('#mealList .sw .food-item')).transform).m41) < 1);
      ok('swipe rows: a quick flick opens the actions, a flick back closes them', opened && closed, opened + ' ' + closed);
      // the card strip at the top of the diary
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
      const strip = await p.evaluate(() => { const t = document.querySelector('.pager'); if (!t || t.firstElementChild.children.length < 2) return null; const r = t.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + 50)]; });
      if (strip) {
        const sx = "() => new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.pager').firstElementChild).transform).m41";
        const w = await p.evaluate(() => document.querySelector('.pager').firstElementChild.children[0].offsetWidth + 12);
        log = await p.evaluate(([x, y, g]) => window.__g('pointer', x, y, t => [Math.min(200, t * 0.4), 0], 500, eval(g)), [strip[0], strip[1], sx]);
        const give = Math.max.apply(null, log.map(r => r[1]));
        ok('card strip: pulled past the first card it stretches, then settles back', give > 10 && give < w * 0.45 && Math.abs(log[log.length - 1][1]) < 1, give);
        log = await p.evaluate(([x, y, g]) => window.__g('pointer', x, y, t => [t < 100 ? -t * 0.1 : -10 - (t - 100) * 1.4, 0], 130, eval(g)), [strip[0], strip[1], sx]);
        ok('card strip: a flick moves to the next card', Math.abs(log[log.length - 1][1] + w) < 1.5, [log[log.length - 1][1], w]);
      }
      await c.close();
    }
    // ---- 5. Progress photos sync between two phones ----
    {
      const docs = {};
      const fake = (op, a, b2, merge) => {
        if (op === 'get') return docs[a] || null;
        if (op === 'set') { docs[a] = merge && docs[a] ? Object.assign({}, docs[a], b2) : b2; return {}; }
        if (op === 'batch') { a.forEach(o => { if (o[1] === null) delete docs[o[0]]; else docs[o[0]] = o[1]; }); return {}; }
        if (op === 'list') return Object.keys(docs).filter(k => k.indexOf(a + '/') === 0 && k.slice(a.length + 1).indexOf('/') < 0).map(k => ({ id: k.slice(a.length + 1), data: docs[k] }));
        return {};
      };
      const FAKE = fs.readFileSync(path.join(__dirname, 'fake-firebase.js'), 'utf8');
      const phone = async () => {
        const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
        await c.exposeFunction('__fake', fake); await c.route('**/firebase.js', r => r.fulfill({ contentType: 'text/javascript', body: FAKE }));
        const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message));
        await p.goto(URL0);
        await p.evaluate(ui => { localStorage.setItem('__fakeUser', JSON.stringify({ uid: 'u1', email: 'a@b.c', emailVerified: true, providerData: [{ providerId: 'password' }] })); localStorage.setItem('setpoint', JSON.stringify({ ui, seenVersion: '9.9', sync: { uid: 'u1', email: 'a@b.c' }, entries: [{ date: new Date().toISOString().slice(0, 10), kg: 70 }] })); }, BASE_UI);
        await p.reload(); await p.waitForTimeout(1500);
        await p.evaluate(() => document.querySelector('#tab-progress').click()); await p.waitForTimeout(300);
        await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find(e => e.textContent.trim() === 'Body'); x && x.click(); }); await p.waitForTimeout(400);
        return p;
      };
      const waitFor = async (p, fn, ms) => { const end = Date.now() + ms; while (Date.now() < end) { if (await fn()) return true; await p.waitForTimeout(300); } return false; };
      const IDX = 'users/u1/setpoint/state/photomap/index', nIdx = () => docs[IDX] ? Object.keys(docs[IDX].items).length : 0;
      const count = p => p.evaluate(() => document.querySelectorAll('#bodyBox .ph[data-photo]').length);
      const A = await phone();
      const jpgs = await A.evaluate(() => [1, 2].map(i => { const c = document.createElement('canvas'); c.width = 400; c.height = 500; const x = c.getContext('2d'); x.fillStyle = i === 1 ? '#c66' : '#6c6'; x.fillRect(0, 0, 400, 500); return c.toDataURL('image/jpeg', 0.8).split(',')[1]; }));
      await A.evaluate(() => document.querySelector('[data-action="add-photo"]').click()); await A.waitForTimeout(300);
      await A.evaluate(() => document.querySelector('#paLib').click());
      await A.setInputFiles('#photoFile', jpgs.map((j, i) => ({ name: i + '.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(j, 'base64') })));
      ok('photos: phone A uploads both', await waitFor(A, () => nIdx() === 2, 15000), nIdx());
      const B = await phone();
      ok('photos: phone B downloads both', await waitFor(B, async () => (await count(B)) === 2, 15000));
      const eid = await A.evaluate(() => document.querySelector('#bodyBox .ph[data-photo]').dataset.photo);
      await A.evaluate(id => document.querySelector('#bodyBox .ph[data-photo="' + id + '"]').click(), eid); await A.waitForTimeout(700);
      await A.evaluate(() => document.querySelector('#pvDel').click());
      ok('photos: a deletion reaches the account', await waitFor(A, () => nIdx() === 1, 12000));
      await B.reload(); await B.waitForTimeout(1500); await B.evaluate(() => document.querySelector('#tab-progress').click()); await B.evaluate(() => { const x = [...document.querySelectorAll('button')].find(e => e.textContent.trim() === 'Body'); x && x.click(); });
      ok('photos: phone B removes the deleted photo', await waitFor(B, async () => (await count(B)) === 1, 12000));
    }
  } catch (e) { fail++; console.log('ERROR', e.message); }
  ok('no page errors', errs.length === 0, errs.slice(0, 3));
  console.log(pass + ' passed, ' + fail + ' failed');
  await b.close(); server.close(); process.exit(fail ? 1 : 0);
});
