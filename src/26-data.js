  /* ================= Data ================= */
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  // The backup file: everything (diary, foods, recipes, meals, water, weigh-ins, settings) plus your food and progress photos.
  const blobToUrl = function (b) { return new Promise(function (res) { const r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { res(null); }; r.readAsDataURL(b); }); };
  const urlToBlob = function (u) { return fetch(u).then(function (r) { return r.blob(); }); };
  function exportJSON() {
    state.ui.backupAt = Date.now(); save(); if (state.ui.tab === 'diary') renderDiary();
    const data = JSON.parse(JSON.stringify(state)); delete data.sync; delete data.ui;
    const ids = []; Object.keys(state.food).forEach(function (d) { state.food[d].forEach(function (it) { if (it.pic) ids.push(it.id); }); });
    toast('Preparing backup…');
    const foodPics = Promise.all(ids.map(function (id) { return picGet(id).then(function (b) { return b ? blobToUrl(b).then(function (u) { return [id, u]; }) : null; }, function () { return null; }); }));
    const bodyPics = photoTx('readonly', function (st) { return st.getAll(); }).then(function (list) {
      return Promise.all((list || []).map(function (r) { return Promise.all([blobToUrl(r.full), blobToUrl(r.thumb)]).then(function (u) { return { id: r.id, date: r.date, added: r.added, pose: r.pose || null, full: u[0], thumb: u[1] }; }); }));
    }, function () { return []; });
    Promise.all([foodPics, bodyPics]).then(function (r) {
      const fp = {}; r[0].forEach(function (x) { if (x && x[1]) fp[x[0]] = x[1]; });
      const out = Object.assign({ app: 'Setpoint', exported: new Date().toISOString(), version: APP_VERSION }, data, { foodPhotos: fp, bodyPhotos: r[1].filter(function (x) { return x.full; }) });
      download('setpoint-backup-' + todayISO() + '.json', JSON.stringify(out), 'application/json');
      const n = Object.keys(fp).length + out.bodyPhotos.length;
      toast('Backup saved' + (n ? ' · with ' + n + (n === 1 ? ' photo' : ' photos') : ''));
    });
  }
  // Put a backup's photos back on this phone.
  function restorePhotos(parsed) {
    const fp = parsed && parsed.foodPhotos && typeof parsed.foodPhotos === 'object' ? parsed.foodPhotos : {}, bp = parsed && Array.isArray(parsed.bodyPhotos) ? parsed.bodyPhotos : [];
    const jobs = Object.keys(fp).filter(function (id) { return typeof fp[id] === 'string' && fp[id].indexOf('data:image/') === 0; }).map(function (id) { return urlToBlob(fp[id]).then(function (b) { return picPut(id, b); }).catch(function () {}); });
    bp.forEach(function (x) { if (x && typeof x.full === 'string' && x.full.indexOf('data:image/') === 0 && typeof x.id === 'string') jobs.push(Promise.all([urlToBlob(x.full), urlToBlob(x.thumb || x.full)]).then(function (b) { return photoTx('readwrite', function (st) { st.put({ id: x.id.slice(0, 20), date: String(x.date || todayISO()).slice(0, 10), added: Number(x.added) || Date.now(), pose: ['front', 'side', 'back'].indexOf(x.pose) >= 0 ? x.pose : null, full: b[0], thumb: b[1] }); }); }).catch(function () {})); });
    return Promise.all(jobs).then(function () { loadPhotos(); renderDiary(); if (phUser()) photoSyncSoon(); });
  }
  // Everything you've eaten, one row per food, with every nutrient we know for it.
  function exportFood() {
    const dates = Object.keys(state.food).sort();
    if (!dates.length) { toast('No food logged yet'); return; }
    const go = function () {
      const q = function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
      const extra = NUTS.filter(function (n) { return ['kcal', 'p', 'c', 'f'].indexOf(n[0]) < 0; });
      const rows = [['date', 'time', 'category', 'food', 'amount', 'planned', 'kcal', 'protein_g', 'carbs_g', 'fat_g'].concat(extra.map(function (n) { return n[1] + ' (' + n[2] + ')'; }))];
      dates.forEach(function (d) { foodFor(d).forEach(function (it) {
        const nd = itemNutrients(it);
        rows.push([d, it.t || '', mealName(mealOf(it)), it.name || 'Quick add', it.ref ? fmtAmt(it.qty, it.unit) : '', it.plan ? 'yes' : '', it.kcal, it.protein, it.carbs, it.fat].concat(extra.map(function (n) { const v = nd ? nd[n[0]] : null; return v == null ? '' : Math.round(v * 100) / 100; })));
      }); });
      download('setpoint-food-' + todayISO() + '.csv', rows.map(function (r) { return r.map(q).join(','); }).join('\n'), 'text/csv');
      toast('Food log saved · ' + (rows.length - 1) + ' rows');
    };
    if (!foodDB && dates.some(dayNeedsDB)) { toast('Preparing…'); loadFoods().then(go, function () { toast('Couldn\'t load the food list. Try again online.'); }); } else go();
  }
  function exportCSV() {
    if (!entries().length) { toast('Nothing to export yet'); return; }
    const rows = [['date', 'weight_kg', 'weight_lb', 'trend_kg', 'kcal', 'note']];
    withTrend().forEach(function (e) { rows.push([e.date, e.kg.toFixed(2), (e.kg * LB).toFixed(1), e.trend.toFixed(2), dayKcal(e.date) || '', '"' + (e.note || '').replace(/"/g, '""') + '"']); });
    download('setpoint-' + todayISO() + '.csv', rows.map(function (r) { return r.join(','); }).join('\n'), 'text/csv');
    toast('CSV saved');
  }
  $('#importFile').addEventListener('change', function () {
    const f = this.files && this.files[0];
    this.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function () {
      let parsed;
      try { parsed = JSON.parse(reader.result); } catch (e) { toast('That isn\'t a Setpoint backup'); buzz('warn'); return; }
      const incoming = migrate(parsed), days = Object.keys(incoming.food).length;
      if (!incoming.entries.length && !incoming.phases.length && !days && !incoming.recipes.length && !incoming.myFoods.length) { toast('Nothing to restore in that file'); buzz('warn'); return; }
      const np = Object.keys(parsed.foodPhotos || {}).length + (Array.isArray(parsed.bodyPhotos) ? parsed.bodyPhotos.length : 0);
      confirmSheet('Restore backup?', '<b>' + days + '</b> ' + (days === 1 ? 'day' : 'days') + ' of food, <b>' + incoming.entries.length + '</b> ' + (incoming.entries.length === 1 ? 'weigh-in' : 'weigh-ins') + (np ? ' and <b>' + np + '</b> ' + (np === 1 ? 'photo' : 'photos') : '') + '. This replaces what\'s on this device.', 'Restore', false, function () {
        const snap = snapshot();
        incoming.ui = state.ui; incoming.seenVersion = state.seenVersion; incoming.sync = state.sync;
        state = incoming; markMilestonesSeen(); save(); applyAppearance(); renderAll(); buzz('success');
        restorePhotos(parsed);
        toast('Backup restored', function () { restore(snap); });
      });
    };
    reader.readAsText(f);
  });

  // Reads weight CSVs from other apps: finds the date and weight columns, the separator and the date order.
  function parseWeightCsv(text) {
    const lines = String(text).replace(/^﻿/, '').split(/\r?\n/).filter(function (l) { return l.trim() && !/^\s*#/.test(l); });
    if (!lines.length) return null;
    const delim = [';', '\t', ','].map(function (dl) { return [dl, lines[0].split(dl).length]; }).sort(function (a, b) { return b[1] - a[1]; })[0][0];
    const split = function (line) {
      const out = []; let cur = '', q = false;
      for (let i = 0; i < line.length; i++) { const ch = line[i]; if (ch === '"') q = !q; else if (ch === delim && !q) { out.push(cur.trim()); cur = ''; } else cur += ch; }
      out.push(cur.trim()); return out;
    };
    let rows = lines.map(split);
    const head = rows[0], hasHeader = head.some(function (h) { return /date|time|day|weight|mass|kg|lb/i.test(h); }) && !head.some(function (h) { return /^\d{4}-\d{2}-\d{2}/.test(h); });
    let di = 0, wi = 1, hdrUnit = null;
    if (hasHeader) {
      di = head.findIndex(function (h) { return /date|time|day/i.test(h); });
      wi = head.findIndex(function (h) { return /weight|body ?mass|^kg$|^lbs?$|\(kg\)|\(lbs?\)/i.test(h) && !/trend|goal|fat|bmi|change|lean|muscle|water|bone|diff/i.test(h); });
      const wh = head[wi] || '';
      hdrUnit = /lb|pound/i.test(wh) ? 'lb' : /kg|kilo/i.test(wh) ? 'kg' : null;
      rows = rows.slice(1);
    }
    if (di < 0 || wi < 0) return null;
    let order = null;
    rows.forEach(function (r) { const m = String(r[di] || '').match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/); if (m) { if (+m[1] > 12) order = 'dmy'; else if (+m[2] > 12 && !order) order = 'mdy'; } });
    if (!order) order = /^en-US/i.test(navigator.language || '') ? 'mdy' : 'dmy';
    const toIso = function (str) {
      let m = str.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);
      if (m) return m[1] + '-' + pad(+m[2]) + '-' + pad(+m[3]);
      m = str.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
      if (m) { let y = +m[3]; if (y < 100) y += 2000; const mo = order === 'dmy' ? +m[2] : +m[1], da = order === 'dmy' ? +m[1] : +m[2]; return mo >= 1 && mo <= 12 && da >= 1 && da <= 31 ? y + '-' + pad(mo) + '-' + pad(da) : null; }
      const t = Date.parse(str); return isNaN(t) ? null : isoOf(new Date(t));
    };
    const out = {}; let skipped = 0;
    rows.forEach(function (r) {
      const iso = toIso(String(r[di] || '')), v = parseFloat(String(r[wi] == null ? '' : r[wi]).replace(',', '.').replace(/[^\d.\-]/g, ''));
      if (!iso || !isFinite(v) || v <= 0 || iso > todayISO()) { skipped++; return; }
      if (!(iso in out)) out[iso] = v;
    });
    const dates = Object.keys(out).sort();
    if (!dates.length) return null;
    const vals = dates.map(function (dd) { return out[dd]; }).sort(function (a, b) { return a - b; }), med = vals[Math.floor(vals.length / 2)];
    return { dates: dates, values: out, unit: hdrUnit || (med > 200 ? 'lb' : unit()), skipped: skipped };
  }
  function csvImportSheet(res) {
    let u = res.unit, replace = false;
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Import weigh-ins</h2></div>' +
      '<div class="stat-box" style="margin-bottom:18px;text-align:center"><div class="num" style="font-size:30px">' + res.dates.length + '</div><div class="label faint">weigh-ins · ' + esc(fmtDate(res.dates[0], { month: 'short', day: 'numeric', year: 'numeric' })) + ' – ' + esc(fmtDate(res.dates[res.dates.length - 1], { month: 'short', day: 'numeric', year: 'numeric' })) + '</div></div>' +
      '<div class="field"><span>The file is in</span>' + segHtml('ciUnit', [['kg', 'kg'], ['lb', 'lb']], u) + '</div>' +
      '<label class="row" style="padding:12px 2px;border:0"><div class="grow"><div class="row-t">Replace days I already logged</div><div class="row-s" id="ciInfo"></div></div><span class="switch"><input type="checkbox" id="ciReplace" /><i></i></span></label>' +
      '<p class="t-sub" id="ciSample" style="margin:4px 2px 18px"></p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="ciNo">Cancel</button><button type="button" class="btn primary" id="ciGo">Import</button></div>',
      function (root) {
        const info = function () {
          const clash = res.dates.filter(function (dd) { return !!findEntry(dd); }).length, first = res.values[res.dates[res.dates.length - 1]];
          $('#ciInfo', root).textContent = clash ? clash + ' of these days are already logged' : 'None of these days are logged yet';
          $('#ciSample', root).textContent = 'Latest: ' + fmtDate(res.dates[res.dates.length - 1]) + ' · ' + first + ' ' + u + (unit() !== u ? ' (' + fmtW(u === 'lb' ? first / LB : first) + ' ' + unit() + ')' : '') + (res.skipped ? ' · ' + res.skipped + ' rows skipped' : '');
        };
        info();
        bindSeg(root, 'ciUnit', function (v) { u = v; info(); });
        $('#ciReplace', root).addEventListener('change', function () { replace = this.checked; });
        $('#ciNo', root).addEventListener('click', function () { closeSheet(); });
        $('#ciGo', root).addEventListener('click', function () {
          const snap = snapshot(); let n = 0;
          res.dates.forEach(function (dd) {
            const kg = u === 'lb' ? res.values[dd] / LB : res.values[dd];
            if (kg < 20 || kg > 400) return;
            const ex = findEntry(dd);
            if (ex && !replace) return;
            upsert({ date: dd, kg: Math.round(kg * 10000) / 10000, note: ex ? ex.note : '', kcal: ex ? ex.kcal : undefined });
            n++;
          });
          state.entries.forEach(function (e) { if (e.kcal === undefined) delete e.kcal; });
          markMilestonesSeen();
          save(); renderAll(); closeSheet(); buzz('success');
          toast(n ? 'Imported ' + n + ' weigh-in' + (n === 1 ? '' : 's') : 'Nothing new to import', n ? function () { restore(snap); } : null);
        });
      });
  }
  // Cronometer export: dailysummary.csv (nutrition per day and group) + servings.csv (the foods, for names and water).
  function parseCsv(text) {
    const rows = [], t = String(text).replace(/^\uFEFF/, ''); let row = [], cur = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (q) { if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += ch;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c.trim(); }); });
  }
  const CRONO = { 'Energy': 'kcal', 'Protein': 'p', 'Carbs': 'c', 'Fat': 'f', 'Fiber': 'fib', 'Sugars': 'sug', 'Caffeine': 'caff', 'Alcohol': 'alc', 'Vitamin A': 'vA', 'Vitamin C': 'vC', 'Vitamin D': 'vD', 'Vitamin E': 'vE', 'Vitamin K': 'vK',
    'B1': 'b1', 'B2': 'b2', 'B3': 'b3', 'B5': 'b5', 'B6': 'b6', 'Folate': 'fol', 'B12': 'b12', 'Calcium': 'ca', 'Copper': 'cu', 'Iron': 'fe', 'Magnesium': 'mg', 'Manganese': 'mn', 'Phosphorus': 'ph', 'Potassium': 'k', 'Selenium': 'se', 'Sodium': 'na', 'Zinc': 'zn',
    'Saturated': 'sat', 'Monounsaturated': 'mono', 'Polyunsaturated': 'poly', 'Trans-Fats': 'trans', 'Cholesterol': 'chol', 'ALA': 'ala', 'EPA': 'epa', 'DHA': 'dha', 'LA': 'la' };
  // "Milk-Oatmeal, Milk-Oatmeal, Apple" → "Milk-Oatmeal ×2, Apple"
  function crName(names) { const c = {}, order = []; names.forEach(function (n) { n = n.replace(/ ×\d+$/, ''); if (!c[n]) { c[n] = 0; order.push(n); } c[n]++; }); return order.map(function (n) { return n + (c[n] > 1 ? ' ×' + c[n] : ''); }).join(', '); }
  function parseCronometer(texts) {
    let sum = null, serv = null;
    texts.forEach(function (t) { const r = parseCsv(t); if (!r.length) return; const h = r[0].map(function (x) { return x.trim(); }); if (h[0] === 'Date' && h.indexOf('Group') >= 0 && h.some(function (x) { return /^Energy/.test(x); })) sum = r; else if (h[0] === 'Day' && h.indexOf('Food Name') >= 0) serv = r; });
    if (!sum) return null;
    const h = sum[0].map(function (x) { return x.trim(); }), gi = h.indexOf('Group'), cols = [];
    h.forEach(function (name, i) { const base = name.replace(/\s*\(.*$/, ''), k = CRONO[base]; if (k && NUT[k]) cols.push({ i: i, k: k, iu: /\(IU\)/.test(name) }); });
    const foods = {}, water = {};
    if (serv) {
      const sh = serv[0].map(function (x) { return x.trim(); }), di = sh.indexOf('Day'), gj = sh.indexOf('Group'), ni = sh.indexOf('Food Name'), ai = sh.indexOf('Amount');
      serv.slice(1).forEach(function (r) {
        const d = r[di], g = (r[gj] || '').trim(), nm = (r[ni] || '').trim(), amt = (r[ai] || '').trim();
        if (!ISO_RE.test(d) || !nm) return;
        const m = /^([\d.]+)\s*(ml|mL)$/i.exec(amt);
        if (/^water$/i.test(nm) && m) { water[d] = (water[d] || 0) + parseFloat(m[1]); return; }
        (foods[d + '|' + g] = foods[d + '|' + g] || []).push((function (x) { return x.length > 36 ? x.slice(0, 36).replace(/\s+\S*$/, '') : x; })(nm.replace(/\s*,\s*/g, ' ')));
      });
    }
    const days = {};
    sum.slice(1).forEach(function (r) {
      const d = r[0], g = (r[gi] || '').trim();
      if (!ISO_RE.test(d) || !g || /^total$/i.test(g) || d > todayISO()) return;
      const v = {}; let any = false;
      cols.forEach(function (c) { const x = parseFloat(r[c.i]); if (isFinite(x) && x >= 0) { v[c.k] = c.iu ? x / 40 : x; any = true; } });
      if (!any || !(v.kcal >= 1)) return;
      const names = foods[d + '|' + g] || [];
      let name = names.length ? crName(names) : g; if (name.length > 80) name = name.slice(0, 78).replace(/[ ,]+\S*$/, '') + '…';
      (days[d] = days[d] || []).push({ group: g, name: name, v: v });
    });
    return { days: days, water: water, groups: Object.keys(days).reduce(function (a, d) { days[d].forEach(function (x) { if (a.indexOf(x.group) < 0) a.push(x.group); }); return a; }, []) };
  }
  function cronoSheet(res) {
    const dates = Object.keys(res.days).sort(), wdates = Object.keys(res.water).filter(function (d) { return d <= todayISO(); });
    const n = dates.reduce(function (a, d) { return a + res.days[d].length; }, 0);
    if (!dates.length) { toast('No food with calories found in that file'); buzz('warn'); return; }
    let skip = true;
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Import from Cronometer</h2></div>' +
      '<div class="stat-box" style="margin-bottom:14px;text-align:center"><div class="num" style="font-size:30px">' + dates.length + '</div><div class="label faint">days · ' + esc(fmtDate(dates[0], { month: 'short', day: 'numeric' })) + ' to ' + esc(fmtDate(dates[dates.length - 1], { month: 'short', day: 'numeric' })) + '</div></div>' +
      '<p class="t-sub" style="margin:0 2px 14px">Each meal comes in as one entry with its calories, macros, vitamins and minerals' + (wdates.length ? ', plus water on ' + wdates.length + ' days' : '') + '. Groups: ' + res.groups.map(esc).join(', ') + '.</p>' +
      '<label class="row" style="padding:12px 2px;border:0"><div class="grow"><div class="row-t">Skip days I already logged here</div><div class="row-s" id="crInfo"></div></div><span class="switch"><input type="checkbox" id="crSkip" checked /><span></span></span></label>' +
      '<div class="btn-row" style="margin-top:12px"><button type="button" class="btn soft" id="crNo">Cancel</button><button type="button" class="btn primary" id="crGo">Import</button></div>',
      function (root) {
        const own = function (d) { return foodFor(d).some(function (it) { return !/^cr-/.test(it.id); }); };
        const clash = dates.filter(own).length;
        $('#crInfo', root).textContent = clash ? clash + ' of these days already have food' : 'None of these days have food yet';
        $('#crSkip', root).addEventListener('change', function () { skip = this.checked; });
        $('#crNo', root).addEventListener('click', function () { closeSheet(); });
        $('#crGo', root).addEventListener('click', function () {
          const snap = snapshot();
          // Cronometer groups → your categories (adds any that are missing, like Pre-Workout).
          const norm = function (x) { return x.toLowerCase().replace(/[^a-z0-9]/g, ''); };
          let cats = MEALS.map(function (m) { return { k: m[0], n: m[1] }; });
          const keyFor = {};
          res.groups.forEach(function (g) {
            if (/^water$/i.test(g)) { keyFor[g] = (cats.find(function (c) { return c.k === 'snacks'; }) || cats[cats.length - 1]).k; return; }
            let c = cats.find(function (x) { return norm(x.n) === norm(g); });
            if (!c) { const dk = DEFAULT_MEALS.find(function (m) { return norm(m[1]) === norm(g); }); if (dk && !cats.some(function (x) { return x.k === dk[0]; })) c = { k: dk[0], n: dk[1] }; }
            if (!c && cats.length < 10) c = { k: 'g' + newId().replace(/[^a-z0-9]/g, '').slice(0, 8).padEnd(3, '0'), n: g.slice(0, 24) };
            if (c && cats.indexOf(c) < 0) cats.push(c);
            keyFor[g] = c ? c.k : cats[cats.length - 1].k;
          });
          const same = cats.length === DEFAULT_MEALS.length && cats.every(function (c, i) { return c.k === DEFAULT_MEALS[i][0] && c.n === DEFAULT_MEALS[i][1]; });
          state.settings.meals = same ? null : cats; applyMeals();
          let days = 0, entries = 0, wd = 0;
          dates.forEach(function (d) {
            if (skip && own(d)) return;
            const keep = foodFor(d).filter(function (it) { return !/^cr-/.test(it.id); });
            const add = res.days[d].map(function (x, i) {
              const v = x.v, nn = {}; Object.keys(v).forEach(function (k) { if (['kcal', 'p', 'c', 'f'].indexOf(k) < 0) nn[k] = Math.round(v[k] * 1000) / 1000; });
              return { id: 'cr-' + d.replace(/-/g, '') + '-' + i, kcal: Math.min(10000, Math.round(v.kcal)), protein: Math.round(v.p || 0), carbs: Math.round(v.c || 0), fat: Math.round(v.f || 0), name: x.name, meal: keyFor[x.group], n: nn };
            });
            state.food[d] = keep.concat(add); days++; entries += add.length;
          });
          wdates.forEach(function (d) { if (skip && waterOn(d)) return; state.water[d] = Math.min(10000, Math.round(res.water[d])); wd++; });
          save(); renderAll(); closeSheet(); buzz('success');
          toast(days ? 'Imported ' + days + ' days' + (wd ? ' and water' : '') : 'Nothing new to import', days ? function () { restore(snap); } : null);
        });
      });
  }
  $('#cronoFile').addEventListener('change', function () {
    const fs = Array.prototype.slice.call(this.files || []); this.value = '';
    if (!fs.length) return;
    Promise.all(fs.map(function (f) { return f.text ? f.text() : new Promise(function (ok) { const r = new FileReader(); r.onload = function () { ok(r.result); }; r.readAsText(f); }); })).then(function (texts) {
      const res = parseCronometer(texts);
      if (!res) { toast(texts.length === 1 ? 'Pick dailysummary.csv too (it has the nutrition)' : 'Those don\'t look like Cronometer files'); buzz('warn'); return; }
      cronoSheet(res);
    });
  });
  $('#csvFile').addEventListener('change', function () {
    const f = this.files && this.files[0]; this.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = function () { const res = parseWeightCsv(r.result); if (!res) { toast('Couldn\'t find dates and weights in that file'); buzz('warn'); return; } csvImportSheet(res); };
    r.readAsText(f);
  });

  // Swipe a logged food to the right for a ⋯ button; tap it for Copy, Adjust (recipes) and Delete.
  function swSet(w, mode, v) {
    // mode: '' (closed), 'open' (⋯ showing), 'expanded' (buttons showing). The row springs there from wherever it
    // is, starting at v (finger speed, px/ms) after a swipe; the buttons stay visible until it has covered them.
    const row = w.lastElementChild;
    w.classList.toggle('open', mode === 'open'); w.classList.toggle('expanded', mode === 'expanded');
    if (row._run) { row._run.stop(); row._run = null; }
    const from = nowAt(row).x, to = mode ? w.firstElementChild.offsetWidth : 0;
    row.style.transition = 'none';
    if (calmMotion() || !row.animate || Math.abs(to - from) < 0.5) { row.style.transform = to ? 'translateX(' + to + 'px)' : ''; w.classList.remove('settling'); }
    else {
      w.classList.add('settling');
      const r = row._run = springGroup([[row, { transform: 'translateX(' + from + 'px)' }, { transform: 'translateX(' + to + 'px)' }]], { response: 0.36, damping: 0.88, v: (v || 0) * Math.sign(to - from), dist: Math.abs(to - from) });
      r.onEnd = function () { if (row._run !== r) return; row._run = null; w.classList.remove('settling'); if (!to) row.style.transform = ''; };
    }
    $$('.sw-btn', w).forEach(function (b) { b.tabIndex = mode ? 0 : -1; });
  }
  // Hold a row (or grab its handle), drag it, drop it. Other rows slide out of the way; the page scrolls at the edges.
  // onDrop(row, target, dropBefore): drop before `target` (or after it when dropBefore is false).
  let dragActive = false;
  function dragSort(box, sel, onDrop, opts) {
    opts = opts || {};
    let src = null, timer = null, on = false, y0 = 0, x0 = 0, py = 0, flow = [], tops = [], si = 0, h = 0, ins = 0, sc = null, sc0 = 0, raf = 0, mk = null, home = null;
    const scroller = function () { const sh = box.closest('.sheet'); return sh && sh.classList.contains('open') ? sh : document.scrollingElement; };
    const start = function (id) {
      on = true; dragActive = true;
      flow = $$(sel + (opts.also ? ', ' + opts.also : ''), box);
      si = flow.indexOf(src); ins = si;
      tops = flow.map(function (el) { const r = el.getBoundingClientRect(); return { top: r.top, mid: r.top + r.height / 2, bot: r.bottom }; });
      h = src.getBoundingClientRect().height; sc = scroller(); sc0 = sc.scrollTop;
      // Rows in separate cards (the Diary): leave the others still and show a line where it will land.
      if (opts.marker) {
        box.classList.add('drag-on'); home = opts.marker === true ? null : src.closest(opts.marker); if (home) home.classList.add('drag-home');
        mk = document.createElement('div'); mk.className = 'drop-line'; box.appendChild(mk);
      } else flow.forEach(function (el) { if (el !== src) el.style.transition = 'transform .18s cubic-bezier(.2,.8,.2,1)'; });
      src.classList.add('lifted'); buzz('medium'); try { src.setPointerCapture(id); } catch (x) {}
      tick();
    };
    // Where the row would land, given the finger (positions are from the start, adjusted for scrolling).
    const place = function () {
      const y = py + (sc.scrollTop - sc0);
      src.style.transform = 'translateY(' + (y - y0) + 'px) scale(1.02)';
      let k = 0; for (let i = 0; i < flow.length; i++) { if (i === si) continue; if (y > tops[i].mid) k = i < si ? i + 1 : i; }
      if (y < tops[0].mid) k = 0;
      ins = k;
      if (mk) {
        const others = tops.filter(function (t, i) { return i !== si; }), br = box.getBoundingClientRect(), shift = sc.scrollTop - sc0;
        const yv = k === si || !others.length ? null : k > 0 ? others[k - 1].bot : others[0].top;
        mk.style.opacity = yv == null ? '0' : '1';
        if (yv != null) mk.style.transform = 'translateY(' + (yv - shift - br.top - 1.5) + 'px)';
        return;
      }
      flow.forEach(function (el, i) { if (i === si) return; const dy = si < ins && i > si && i <= ins ? -h : si > ins && i >= ins && i < si ? h : 0; el.style.transform = dy ? 'translateY(' + dy + 'px)' : ''; });
    };
    const tick = function () {
      if (!on) return;
      const vh = sc === document.scrollingElement ? innerHeight : sc.getBoundingClientRect().bottom, vt = sc === document.scrollingElement ? 0 : sc.getBoundingClientRect().top;
      const edge = 70, sp = py < vt + edge ? -Math.ceil((vt + edge - py) / 6) : py > vh - edge - 80 ? Math.ceil((py - (vh - edge - 80)) / 6) : 0;
      if (sp) sc.scrollTop += sp;
      place(); raf = requestAnimationFrame(tick);
    };
    box.addEventListener('pointerdown', function (e) {
      const r = e.target.closest(sel); if (!r || !box.contains(r)) return;
      if (opts.handle ? !e.target.closest(opts.handle) : e.target.closest('input, select, .sw-acts, [data-eat]')) return;
      if (swOpen) return;
      src = r; x0 = e.clientX; y0 = py = e.clientY; on = false;
      if (opts.handle) { e.preventDefault(); start(e.pointerId); }
      else { const id = e.pointerId; timer = setTimeout(function () { if (src) start(id); }, 380); }
    });
    box.addEventListener('pointermove', function (e) {
      if (!src) return;
      if (!on) { if (Math.abs(e.clientX - x0) > 8 || Math.abs(e.clientY - y0) > 8) { clearTimeout(timer); src = null; } return; }
      py = e.clientY;
    });
    const end = function () {
      clearTimeout(timer); if (!src) return;
      const s0 = src, was = on; src = null; on = false; cancelAnimationFrame(raf);
      if (!was) return;
      dragActive = false;
      const stop = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
      document.addEventListener('click', stop, true); setTimeout(function () { document.removeEventListener('click', stop, true); }, 80);
      const moved = ins !== si, others = flow.filter(function (el) { return el !== s0; });
      const reset = function () { s0.classList.remove('lifted'); flow.forEach(function (el) { el.style.transition = ''; el.style.transform = ''; }); box.classList.remove('drag-on'); if (home) home.classList.remove('drag-home'); if (mk) mk.remove(); mk = null; home = null; };
      if (!moved) { s0.style.transition = 'transform .15s ease'; s0.style.transform = ''; setTimeout(reset, 160); if (opts.onHold) opts.onHold(s0); return; }
      reset();
      // ins = where it lands among the other rows (0 = before the first one)
      const k = ins;
      if (k < others.length) onDrop(s0, others[k], true); else onDrop(s0, others[others.length - 1], false);
    };
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  }
  document.addEventListener('touchmove', function (e) { if (dragActive) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('.sw, [data-ing]')) e.preventDefault(); });
  function swClose() { if (!swOpen) return; const r = swOpen; swOpen = null; swSet(r, ''); }
  function swMore(w) { swSet(w, 'expanded'); swOpen = w; buzz('light'); }
  (function swipeFood() {
    const list = $('#mealList'), fs = fingerSpeed();
    let w = null, row = null, x0 = 0, y0 = 0, dx = 0, base = 0, swiping = false, open = 0;
    list.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.sw-acts')) return;
      const s = e.target.closest('.sw');
      if (swOpen && swOpen !== s) swClose();
      if (!s) return;
      w = s; row = s.lastElementChild;
      if (row._run) { row._run.stop(); row._run = null; } // still sliding: take hold of it where it is
      base = Math.max(0, nowAt(row).x);
      x0 = e.clientX; y0 = e.clientY; dx = base; swiping = false; fs.reset(); fs.add(e.clientX, e.timeStamp);
    });
    list.addEventListener('pointermove', function (e) {
      if (!w) return;
      if (dragActive) { w = null; return; }
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!swiping) {
        if (Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my) * 1.5 && (mx > 0 || base)) { swiping = true; try { row.setPointerCapture(e.pointerId); } catch (x) {} w.classList.add('dragging'); open = w.querySelector('.sw-acts').offsetWidth; }
        else if (Math.abs(my) > 10) { w = null; return; }
        else return;
      }
      fs.add(e.clientX, e.timeStamp);
      dx = Math.max(0, base + mx);
      const lim = Math.max(base, open); if (dx > lim) dx = lim + rubber(dx - lim, 70); // a little give past the end
      row.style.transition = 'none'; row.style.transform = 'translateX(' + dx + 'px)';
    });
    const end = function (e) {
      if (!w) return;
      const s = w; w = null;
      if (!swiping) { if (base > 0.5 && base < (s.firstElementChild.offsetWidth || 1) - 0.5) swSet(s, s.classList.contains('expanded') ? 'expanded' : s.classList.contains('open') ? 'open' : ''); return; } // caught mid-slide, then let go
      s.classList.remove('dragging');
      // Stop the tap that follows a drag from opening the food.
      const stop = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
      document.addEventListener('click', stop, true); setTimeout(function () { document.removeEventListener('click', stop, true); }, 60);
      // where the flick would carry it decides: open (keeping the buttons it showed) or closed
      if (e && e.clientX != null) fs.add(e.clientX, e.timeStamp); // where the finger lifted counts too
      const v = e ? fs.get(e.timeStamp) : 0, proj = dx + v * 160, was = s.classList.contains('expanded') ? 'expanded' : s.classList.contains('open') ? 'open' : '';
      const keepW = was ? s.firstElementChild.offsetWidth : open;
      if (proj > keepW / 2 && v > -0.4) { const fresh = !was; swSet(s, was || 'open', v); swOpen = s; if (fresh) buzz('light'); }
      else { swSet(s, '', v); if (swOpen === s) swOpen = null; }
    };
    list.addEventListener('pointerup', end);
    list.addEventListener('pointercancel', end);
  })();
  document.addEventListener('pointerdown', function (e) { if (swOpen && !e.target.closest('#mealList')) swClose(); }, true);
  dragSort($('#mealList'), '.sw:not([data-nodrag])', function (src, tgt, before) {
    const d = viewDay, arr = foodFor(d).slice(), i = arr.findIndex(function (x) { return x.id === src.dataset.sw; });
    if (i < 0) return;
    const it = arr.splice(i, 1)[0];
    if (tgt.dataset.mh) {
      const mi = MEALS.findIndex(function (m) { return m[0] === tgt.dataset.mh; });
      if (before && mi > 0) { it.meal = MEALS[mi - 1][0]; let j = -1; arr.forEach(function (x, i) { if (mealOf(x) === it.meal && !isDailyTotal(x)) j = i; }); arr.splice(j < 0 ? arr.length : j + 1, 0, it); }
      else { it.meal = tgt.dataset.mh; const j = arr.findIndex(function (x) { return mealOf(x) === it.meal && !isDailyTotal(x); }); arr.splice(j < 0 ? arr.length : j, 0, it); }
    }
    else { const t = arr.find(function (x) { return x.id === tgt.dataset.sw; }); if (!t) return; it.meal = mealOf(t); let j = arr.indexOf(t); if (!before) j++; arr.splice(j, 0, it); }
    state.food[d] = arr; save(); renderAll(); buzz('success');

  }, { also: '.meal-head', marker: '.meal-sec', onHold: function (w) { if (w.dataset.sw) quickSheet(w.dataset.sw, viewDay); } });

  // Swipe a weigh-in left to delete it (with Undo).
  (function swipeToDelete() {
    const list = $('#entryList'), fs = fingerSpeed();
    let row = null, x0 = 0, y0 = 0, dx = 0, swiping = false, swallow = false;
    list.addEventListener('pointerdown', function (e) { const r = e.target.closest('[data-edit]'); if (!r || r._run) return; row = r; x0 = e.clientX; y0 = e.clientY; dx = 0; swiping = false; fs.reset(); fs.add(e.clientX, e.timeStamp); });
    list.addEventListener('pointermove', function (e) {
      if (!row) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!swiping) {
        if (mx < -10 && Math.abs(mx) > Math.abs(my) * 1.5) { swiping = true; try { row.setPointerCapture(e.pointerId); } catch (x) {} row.parentElement.classList.add('swiping'); }
        else if (Math.abs(my) > 10 || mx > 10) { row = null; return; }
      }
      if (swiping) { fs.add(e.clientX, e.timeStamp); dx = Math.min(0, mx); row.style.transition = 'none'; row.style.transform = 'translateX(' + dx + 'px)'; const armed = dx < -90; if (armed !== row.classList.contains('del-armed')) { row.classList.toggle('del-armed', armed); buzz('light'); } }
    });
    const end = function (e) {
      if (!row) return;
      const r = row; row = null;
      if (!swiping) return;
      swallow = true; setTimeout(function () { swallow = false; }, 60);
      r.parentElement.classList.remove('swiping');
      // past the mark, or flicked away: it slides off at the finger's speed and is deleted; otherwise it springs back
      if (e && e.clientX != null) fs.add(e.clientX, e.timeStamp);
      const v = e ? fs.get(e.timeStamp) : 0, W = r.offsetWidth, gone = dx < -90 || (v < -0.6 && dx < -36);
      const to = gone ? -W * 1.1 : 0, after = function () {
        r._run = null;
        if (!gone) { r.style.transform = ''; r.classList.remove('del-armed'); return; }
        const snap = snapshot(), when = r.dataset.edit;
        state.entries = state.entries.filter(function (x) { return x.date !== when; });
        save(); renderAll(); buzz('medium');
        toast('Deleted ' + fmtDate(when), function () { restore(snap); });
      };
      if (gone) r.classList.add('del-armed');
      if (calmMotion() || !r.animate) { r.style.transform = gone ? 'translateX(-110%)' : ''; after(); return; }
      r._run = springGroup([[r, { transform: 'translateX(' + dx + 'px)' }, { transform: 'translateX(' + to + 'px)' }]], { response: gone ? 0.3 : 0.36, damping: gone ? 1 : 0.86, v: gone ? -v : v, dist: Math.abs(to - dx), noOver: gone });
      r._run.onEnd = after;
    };
    list.addEventListener('pointerup', end); list.addEventListener('pointercancel', end);
    list.addEventListener('click', function (e) { if (swallow) { e.stopPropagation(); e.preventDefault(); } }, true);
  })();

