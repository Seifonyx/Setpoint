  /* ================= Nutrients (vitamins, minerals, lipids) ================= */
  // [key, label, unit, group]. Keys match foods.json.
  const NUTS = [
    ['kcal', 'Energy', 'kcal', 'gen'], ['p', 'Protein', 'g', 'gen'], ['c', 'Carbs', 'g', 'gen'], ['fib', 'Fiber', 'g', 'gen'], ['sug', 'Sugars', 'g', 'gen'], ['f', 'Fat', 'g', 'gen'], ['caff', 'Caffeine', 'mg', 'gen'], ['alc', 'Alcohol', 'g', 'gen'],
    ['vA', 'Vitamin A', 'µg', 'vit'], ['vC', 'Vitamin C', 'mg', 'vit'], ['vD', 'Vitamin D', 'µg', 'vit'], ['vE', 'Vitamin E', 'mg', 'vit'], ['vK', 'Vitamin K', 'µg', 'vit'],
    ['b1', 'B1 (thiamin)', 'mg', 'vit'], ['b2', 'B2 (riboflavin)', 'mg', 'vit'], ['b3', 'B3 (niacin)', 'mg', 'vit'], ['b5', 'B5 (pantothenic acid)', 'mg', 'vit'], ['b6', 'B6', 'mg', 'vit'], ['fol', 'Folate', 'µg', 'vit'], ['b12', 'B12', 'µg', 'vit'], ['chl', 'Choline', 'mg', 'vit'],
    ['ca', 'Calcium', 'mg', 'min'], ['cu', 'Copper', 'mg', 'min'], ['fe', 'Iron', 'mg', 'min'], ['mg', 'Magnesium', 'mg', 'min'], ['mn', 'Manganese', 'mg', 'min'], ['ph', 'Phosphorus', 'mg', 'min'], ['k', 'Potassium', 'mg', 'min'], ['se', 'Selenium', 'µg', 'min'], ['na', 'Sodium', 'mg', 'min'], ['zn', 'Zinc', 'mg', 'min'],
    ['sat', 'Saturated fat', 'g', 'lip'], ['mono', 'Monounsaturated', 'g', 'lip'], ['poly', 'Polyunsaturated', 'g', 'lip'], ['trans', 'Trans fat', 'g', 'lip'], ['chol', 'Cholesterol', 'mg', 'lip'], ['ala', 'Omega-3 (ALA)', 'g', 'lip'], ['epa', 'Omega-3 (EPA)', 'g', 'lip'], ['dha', 'Omega-3 (DHA)', 'g', 'lip'], ['la', 'Omega-6 (LA)', 'g', 'lip']
  ];
  const NUT = {}; NUTS.forEach(function (n) { NUT[n[0]] = { key: n[0], label: n[1], unit: n[2], group: n[3] }; });
  const NUT_GROUPS = [['gen', 'General'], ['vit', 'Vitamins'], ['min', 'Minerals'], ['lip', 'Fats']];
  const MICROS = NUTS.filter(function (n) { return n[3] === 'vit' || n[3] === 'min'; }).map(function (n) { return n[0]; }).filter(function (k) { return k !== 'na'; });
  // US Dietary Reference Intakes (RDA or AI), by sex: [female, male]. Ages 19–50 unless noted in nutTargets().
  const DRI = { vA: [700, 900], vC: [75, 90], vD: [15, 15], vE: [15, 15], vK: [90, 120], b1: [1.1, 1.2], b2: [1.1, 1.3], b3: [14, 16], b5: [5, 5], b6: [1.3, 1.3], fol: [400, 400], b12: [2.4, 2.4], chl: [425, 550],
    ca: [1000, 1000], cu: [0.9, 0.9], fe: [18, 8], mg: [320, 420], mn: [1.8, 2.3], ph: [700, 700], k: [2600, 3400], se: [55, 55], zn: [8, 11], ala: [1.1, 1.6], la: [12, 17] };
  const DRI_TEEN = { vA: [700, 900], vC: [65, 75], vK: [75, 75], b1: [1, 1.2], b2: [1, 1.3], b6: [1.2, 1.3], chl: [400, 550], ca: [1300, 1300], cu: [0.89, 0.89], fe: [15, 11], mg: [360, 410], mn: [1.6, 2.2], ph: [1250, 1250], k: [2300, 3000], zn: [9, 11], la: [11, 16] };
  // Tolerable upper intakes from food (only where the limit applies to food, not just supplements).
  const UL = { vC: 2000, vD: 100, b6: 100, chl: 3500, ca: 2500, cu: 10, fe: 45, mn: 11, ph: 4000, se: 400, zn: 40 };
  // Personal targets, like Cronometer: a minimum, a goal and a maximum for each nutrient (recommended for your age,
  // sex and weight, and each one yours to change). nutRec() is the recommendation; nutTargets() adds your changes.
  // For the rest of the app each also carries min (the amount to reach), max (a limit, for things you only keep under)
  // and ul (a safe upper limit).
  function nutRec(date) {
    const p = state.profile, age = ageNow() || 30, sex = p.sex, r = {};
    const pickSex = function (v) { return sex === 'male' ? v[1] : sex === 'female' ? v[0] : (v[0] + v[1]) / 2; };
    Object.keys(DRI).forEach(function (k) { r[k] = { goal: pickSex(age < 19 && DRI_TEEN[k] ? DRI_TEEN[k] : DRI[k]) }; });
    const set = function (k, v) { if (r[k]) r[k].goal = v; };
    if (age > 50) { set('fe', 8); set('b6', pickSex([1.5, 1.7])); set('la', pickSex([11, 14])); if (sex !== 'male') set('ca', 1200); }
    if (age > 70) { set('vD', 20); set('ca', 1200); }
    if (age >= 31 && age < 51) set('mg', pickSex([320, 420])); else if (age >= 19 && age < 31) set('mg', pickSex([310, 400]));
    Object.keys(UL).forEach(function (k) { if (r[k]) r[k].hi = UL[k]; });
    if (age > 50 && r.ca) r.ca.hi = 2000;
    if (age > 70 && r.ph) r.ph.hi = 3000;
    const plan = dayPlan(date), kcal = plan ? roundKcal(plan.target) : (sex === 'male' ? 2500 : 2000);
    r.kcal = { goal: kcal };
    if (plan) {
      r.p = { goal: plan.protein }; r.c = { goal: plan.carbs };
      r.f = { goal: plan.fat, hi: Math.round(kcal * 0.35 / 9) }; // at most 35% of calories
    }
    r.fib = { goal: Math.max(25, Math.round(kcal / 1000 * 14)) };
    r.na = { hi: 2300 }; r.sat = { hi: Math.round(kcal * 0.1 / 9) }; r.caff = { hi: 400 };
    return r;
  }
  function nutTargets(date) {
    const rec = nutRec(date), own = state.profile.nutT || {}, t = {};
    Object.keys(rec).concat(Object.keys(own)).forEach(function (k) {
      if (t[k]) return;
      const r = rec[k] || {}, o = own[k], x = { goal: r.goal != null ? r.goal : null, hi: r.hi != null ? r.hi : null };
      if (typeof o === 'number') { if (x.goal == null && x.hi != null) x.hi = o; else x.goal = o; } // older versions: one number
      else if (o) ['goal', 'hi'].forEach(function (f) { if (o[f] !== undefined) x[f] = o[f]; });
      if (o && (k === 'kcal' || ((k === 'p' || k === 'c' || k === 'f') && rec[k]))) x.goal = r.goal; // these follow your plan
      const m = x.goal;
      if (m != null) x.min = m; else if (x.hi != null) x.max = x.hi;
      if (m != null && x.hi != null) x.ul = x.hi;
      if (o) x.custom = true;
      if (x.goal != null || x.hi != null || o) t[k] = x;
    });
    return t;
  }
  // Nutrients in one logged item, or null when we only know its calories and macros.
  function itemNutrients(it) {
    if (Array.isArray(it.mi)) {
      const o = {}; let any = false;
      it.mi.forEach(function (x) { const v = itemNutrients(x); if (!v) return; any = true; NUTS.forEach(function (n) { if (v[n[0]] != null) o[n[0]] = (o[n[0]] || 0) + v[n[0]]; }); });
      if (!any) return null;
      NUTS.forEach(function (n) { if (o[n[0]] == null) o[n[0]] = null; });
      o.kcal = it.kcal; o.p = it.protein; o.c = it.carbs; o.f = it.fat; return o;
    }
    if (!it.ref && it.n) { const o = {}; NUTS.forEach(function (n) { o[n[0]] = it.n[n[0]] != null ? it.n[n[0]] : null; }); o.kcal = it.kcal; o.p = it.protein; o.c = it.carbs; o.f = it.fat; return o; }
    if (!it.ref) return null;
    const f = itemFood(it); if (!f) return null;
    const out = {}, q = it.g / 100;
    NUTS.forEach(function (n) { const v = per100(f, n[0]); out[n[0]] = v == null ? null : v * q; });
    out.kcal = it.kcal; out.p = it.protein; out.c = it.carbs; out.f = it.fat; // what was logged
    return out;
  }
  // A day's totals, with how much of the day's calories each nutrient has data for (0–1).
  function dayNutrients(date) {
    const items = eatenFor(date), tot = {}, cov = {}; let kcal = 0, noData = 0;
    NUTS.forEach(function (n) { tot[n[0]] = 0; cov[n[0]] = 0; });
    items.forEach(function (it) {
      kcal += it.kcal;
      const n = itemNutrients(it);
      if (!n) { noData++; tot.kcal += it.kcal; tot.p += it.protein; tot.c += it.carbs; tot.f += it.fat; ['kcal', 'p', 'c', 'f'].forEach(function (k) { cov[k] += it.kcal; }); return; }
      NUTS.forEach(function (x) { const v = n[x[0]]; if (v != null) { tot[x[0]] += v; cov[x[0]] += it.kcal; } });
    });
    if (!items.length && dayTotals(date).kcal) { const tt = dayTotals(date); tot.kcal = tt.kcal; tot.p = tt.protein; tot.c = tt.carbs; tot.f = tt.fat; kcal = tt.kcal; noData = 1; ['kcal', 'p', 'c', 'f'].forEach(function (k) { cov[k] = kcal; }); }
    NUTS.forEach(function (n) { cov[n[0]] = kcal ? cov[n[0]] / kcal : 1; });
    return { tot: tot, cov: cov, kcal: kcal, items: items.length, noData: noData };
  }
  // Whether the day's foods need the database to work out vitamins and minerals.
  function dayNeedsDB(date) { return !foodDB && foodFor(date).some(function (it) { return it.ref && itemNeedsDB(it); }); }
  function fmtNut(v, unit) {
    if (v == null) return '–';
    const a = Math.abs(v), s = a >= 100 ? Math.round(v) : a >= 10 ? Math.round(v * 10) / 10 : a >= 1 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100;
    return (unit === 'kcal' ? fmtKcal(s) : a >= 1000 ? fmtKcal(s) : String(s)) + (unit === 'kcal' ? ' kcal' : ' ' + unit);
  }
  // One nutrient row: amount, target and a bar. Limits (sodium, saturated fat) fill towards a maximum.
  function nutRow(key, v, tg, cov, opts) {
    const n = NUT[key], o = opts || {}, lim = tg && tg.max != null && tg.min == null, goal = tg ? (lim ? tg.max : tg.min) : null;
    const pct = goal ? v / goal * 100 : null, over = tg && ((lim && v > tg.max) || (tg.ul && v > tg.ul));
    const cls = over ? 'over' : pct == null ? 'none' : lim ? 'ok' : ['kcal', 'c', 'f'].indexOf(key) >= 0 ? 'macro' : pct >= 100 ? 'met' : pct >= 50 ? 'part' : 'low';
    return '<' + (o.tap ? 'button type="button" data-high="' + key + '"' : 'div') + ' class="nut-row ' + cls + '">' +
      '<span class="nr-l">' + n.label + (cov != null && cov < 0.8 && v > 0 ? '<i class="nr-flag" title="Some foods have no data for this">*</i>' : '') + '</span>' +
      '<span class="nr-v num">' + fmtNut(v, n.unit) + (goal ? ' <small>/ ' + fmtNut(goal, n.unit).replace(' ' + n.unit, '') + (lim ? ' max' : '') + '</small>' : '') + '</span>' +
      (goal ? '<span class="nr-p num">' + Math.round(pct) + '%</span><span class="bar nr-bar"><i style="width:' + Math.min(100, pct).toFixed(1) + '%"></i></span>' : '<span class="nr-p"></span>') +
      (over && tg.ul && v > tg.ul ? '<span class="nr-note">Above the safe upper limit (' + fmtNut(tg.ul, n.unit) + ')</span>' : '') +
      '</' + (o.tap ? 'button' : 'div') + '>';
  }
  function nutPanel(tot, tg, cov, opts) {
    return NUT_GROUPS.map(function (g) {
      const rows = NUTS.filter(function (n) { return n[3] === g[0] && (opts && opts.known ? tot[n[0]] != null : tot[n[0]] > 0 || (tg[n[0]] && tg[n[0]].min) || (opts && opts.all)); });
      if (!rows.length) return '';
      return '<div class="label faint fd-sec">' + g[1] + '</div><div class="nut-list">' + rows.map(function (n) { return nutRow(n[0], tot[n[0]] || 0, tg[n[0]], cov ? cov[n[0]] : null, opts); }).join('') + '</div>';
    }).join('');
  }
  function microsMet(nd, tg) {
    let met = 0; MICROS.forEach(function (k) { if (tg[k] && tg[k].min && nd.tot[k] >= tg[k].min) met++; });
    return { met: met, of: MICROS.length };
  }

  // Day nutrients: everything eaten that day against your targets.
  function nutrientsSheet(date) {
    const d = date || viewDay;
    const draw = function (root) {
      const nd = dayNutrients(d), tg = nutTargets(d), mm = microsMet(nd, tg), p = state.profile;
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">Nutrients</h2></div>' +
        '<button type="button" class="text-btn" id="nsTargets" style="margin:0">Targets</button></div>' +
        (nd.items || nd.kcal ? keyBoxes(function (k) { return nd.cov[k] > 0 ? nd.tot[k] : null; }) + '<div class="nt-met"><span>Vitamins &amp; minerals</span><b class="num">' + mm.met + ' <small>of ' + mm.of + ' met</small></b><span class="bar"><i style="width:' + (mm.met / Math.max(1, mm.of) * 100).toFixed(1) + '%"></i></span></div>' : '') +
        (dayNeedsDB(d) ? skel(4) :
          (!nd.items && !nd.kcal ? emptyState(LEAF_IC, 'Nothing logged yet', 'Add food to see your vitamins and minerals.') : '') +
          (nd.noData ? '<p class="muted-note ns-note">' + nd.noData + (nd.noData === 1 ? ' food has' : ' foods have') + ' calories only (quick adds or your own foods), so some totals are low. * = partly missing data.</p>' : '') +
          (!p.sex || !p.birthYear ? '<p class="muted-note ns-note">Add your age and sex in Targets for personal targets.</p>' : '') +
          nutPanel(nd.tot, tg, nd.cov, { tap: true })) +
        '<p class="muted-note sv-src">Targets: US Dietary Reference Intakes. Tap a nutrient to see where it came from.</p>';
      $('#nsTargets', root).addEventListener('click', function () { closeSheet(); showTab('targets'); });
      $$('[data-high]', root).forEach(function (b) { b.addEventListener('click', function () { sourcesSheet(b.dataset.high, d); }); });
    };
    openSheet('<div id="nsRoot"></div>', function (body) {
      sheet.classList.add('tall');
      const root = $('#nsRoot', body); draw(root);
      if (dayNeedsDB(d)) loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) toast('Couldn\'t load the food list'); });
    }, function () { sheet.classList.remove('tall'); });
  }

  // Where a nutrient came from: the foods you ate that day (or over the last few days), biggest first.
  function sourcesSheet(key, date, days) {
    const d = date || viewDay, nd = days || 1, d0 = dayNum(d);
    const isos = []; for (let i = 0; i < nd; i++) isos.push(isoFromDay(d0 - i));
    const draw = function (root) {
      const n = NUT[key], t = nutTargets(d)[key], lim = t && t.max != null && t.min == null, goal = t ? (lim ? t.max : t.min) : null;
      const when = nd === 1 ? (d === todayISO() ? 'Today' : fmtDate(d, { weekday: 'short', month: 'short', day: 'numeric' })) : 'Last ' + nd + ' days';
      const head = '<div class="sheet-head"><div class="grow"><div class="label faint">Where it came from · ' + when + '</div><h2 class="sheet-title" id="sheetTitle">' + n.label + '</h2></div></div>';
      if (isos.some(dayNeedsDB)) { root.innerHTML = head + skel(4); return; }
      const by = {}; let tot = 0, none = 0;
      isos.forEach(function (iso) {
        eatenFor(iso).forEach(function (it) {
          if (isDailyTotal(it)) return;
          (Array.isArray(it.mi) ? it.mi : [it]).forEach(function (x) {
            const v = itemNutrients(x), mac = { kcal: x.kcal, p: x.protein, c: x.carbs, f: x.fat };
            const val = v && v[key] != null ? v[key] : mac[key] != null ? mac[key] : null;
            if (val == null) { none++; return; }
            if (val <= 0) return;
            const nm = x.name || 'Quick add', o = by[nm] || (by[nm] = { v: 0, n: 0 }); o.v += val; o.n++; tot += val;
          });
        });
      });
      const rows = Object.keys(by).map(function (k) { return { name: k, v: by[k].v, n: by[k].n }; }).sort(function (a, b) { return b.v - a.v; });
      const day = nd > 1 ? tot / nd : tot, pct = goal ? day / goal * 100 : null, over = goal && (lim ? day > goal : t.ul && day > t.ul);
      const sum = '<div class="src-sum' + (over ? ' over' : '') + '"><div><b class="num">' + fmtNut(nd > 1 ? day : tot, n.unit) + '</b>' + (nd > 1 ? '<span> a day</span>' : '') +
        (goal ? '<span> of ' + fmtNut(goal, n.unit) + (lim ? ' max' : '') + '</span>' : '') + '</div>' + (goal ? '<b class="num src-pc">' + Math.round(pct) + '%</b>' : '') +
        (goal ? '<span class="bar"><i style="width:' + Math.min(100, pct).toFixed(1) + '%"></i></span>' : '') + '</div>';
      root.innerHTML = head + sum + (!rows.length ? '<p class="muted-note fd-empty">Nothing with ' + esc(n.label.toLowerCase()) + ' logged' + (nd === 1 ? (d === todayISO() ? ' today' : ' that day') : ' in the last ' + nd + ' days') + '.</p>' :
        '<div class="list">' + rows.slice(0, 30).map(function (r) {
          const pc = Math.round(r.v / tot * 100);
          return '<div class="row fd-row hi-wk"><div class="grow"><div class="row-t">' + esc(r.name) + '</div><div class="row-s">' + (r.n > 1 ? r.n + ' times · ' : '') + pc + '% of the total</div><div class="hi-bar"><i style="width:' + Math.max(3, pc) + '%"></i></div></div><span class="row-v num hi-v">' + fmtNut(r.v, n.unit) + '</span></div>';
        }).join('') + '</div>') +
        (none ? '<p class="muted-note sv-src">' + none + (none === 1 ? ' food has' : ' foods have') + ' no data for this, so ' + (none === 1 ? 'it isn\'t' : 'they aren\'t') + ' counted.</p>' : '');
    };
    openSheet('<div id="srcRoot"></div>', function (body) {
      sheet.classList.add('tall');
      const root = $('#srcRoot', body); draw(root);
      if (isos.some(dayNeedsDB)) loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) toast('Couldn\'t load the food list'); });
    }, function () { sheet.classList.remove('tall'); });
  }
  // Foods highest in a nutrient, per serving or per 100 kcal. Tap one to add it.
  // Foods high in a nutrient now lives in Suggest food (the "By nutrient" filter).
  function highInSheet(key, perKcal, week) { nutFoodsSheet(viewDay || todayISO(), { key: key, by: week ? 'week' : perKcal ? 'kcal' : 'serving' }); }
  // The list for one nutrient: your week's top sources, or the foods richest in it per serving or per 100 kcal.
  function highInHtml(key, by) {
    const n = NUT[key], tg = nutTargets()[key], goal = tg ? tg.min || tg.max : null;
    if (by === 'week') {
      const bym = {}, t0 = dayNum(todayISO()); let tot = 0;
      for (let i = 0; i < 7; i++) eatenFor(isoFromDay(t0 - i)).forEach(function (it) {
        if (isDailyTotal(it)) return;
        const v = itemNutrients(it), mac = { kcal: it.kcal, p: it.protein, c: it.carbs, f: it.fat };
        const x = v && v[key] != null ? v[key] : mac[key] != null ? mac[key] : null; if (!x || x <= 0) return;
        const nm = (it.name || 'Quick add').split(' · ')[0], o = bym[nm] || (bym[nm] = { v: 0, n: 0, ref: it.ref }); o.v += x; o.n++; tot += x;
      });
      const rows = Object.keys(bym).map(function (k) { return { name: k, v: bym[k].v, n: bym[k].n, ref: bym[k].ref }; }).sort(function (a, b) { return b.v - a.v; });
      return !rows.length ? '<p class="muted-note fd-empty">Nothing with ' + esc(n.label.toLowerCase()) + ' logged in the last 7 days.</p>' :
        '<p class="muted-note hi-tot">Last 7 days: <b class="num">' + fmtNut(tot, n.unit) + '</b> · about ' + fmtNut(tot / 7, n.unit) + ' a day' + (goal ? ' (target ' + fmtNut(goal, n.unit) + ')' : '') + '</p>' +
        '<div class="list">' + rows.slice(0, 30).map(function (r) {
          const pct = Math.round(r.v / tot * 100), f = r.ref && getFood(r.ref);
          return '<' + (f ? 'button type="button" data-sg="' + f.id + '"' : 'div') + ' class="row fd-row hi-wk"><div class="grow"><div class="row-t">' + esc(r.name) + '</div><div class="row-s">' + (r.n > 1 ? r.n + ' times' : 'once') + ' · ' + pct + '% of your total</div><div class="hi-bar"><i style="width:' + Math.max(3, pct) + '%"></i></div></div><span class="row-v num hi-v">' + fmtNut(r.v, n.unit) + '</span></' + (f ? 'button' : 'div') + '>';
        }).join('') + '</div><p class="muted-note sv-src">Foods with no data for this nutrient (most quick adds) aren\'t counted.</p>';
    }
    const perKcal = by === 'kcal', res = [], mine = {}, t1 = dayNum(todayISO());
    // Everyday foods only (plus anything you've logged or saved), so the list isn't spleen and dried egg white.
    for (let i = 0; i < 60; i++) eatenFor(isoFromDay(t1 - i)).forEach(function (it) { if (it.ref) mine[it.ref] = 1; });
    state.favs.forEach(function (r) { mine[r] = 1; });
    foodDB.list.forEach(function (f) {
      if (!f.pop && !mine[f.id]) return;
      const v100 = per100(f, key), kc = per100(f, 'kcal');
      // Skip things not eaten as they are: raw dry beans and grains, flours, brans, dried seaweed, brands and powders.
      if (!v100 || v100 <= 0 || CAT_PENALTY[f.cat] >= 5 || f.cat === 'Spices and Herbs' || f.cat === 'Packaged foods' || /[A-Z]{3,}|powder|dry mix|dehydrated|freeze-dried|supplement|fortified/.test(f.name) ||
        /mature seeds, raw|, crude|flour|\bmeal\b|\bbran\b|seaweed|, dry\b|uncooked|, unprepared/i.test(f.name)) return;
      if (perKcal) { if (!kc || kc < 15) return; res.push({ f: f, v: v100 / kc * 100, sub: 'per 100 kcal' }); return; }
      const s = defaultServing(f), g = s.qty * s.unit.g;
      if (g > 500 || (kc || 0) * g / 100 > 450) return;
      res.push({ f: f, v: v100 * g / 100, sub: fmtAmt(s.qty, s.unit.label) });
    });
    res.sort(function (a, b) { return b.v - a.v || (b.f.pop || 0) - (a.f.pop || 0); });
    return '<div class="list">' + res.slice(0, 40).map(function (r) {
      return '<button type="button" class="row fd-row" data-sg="' + r.f.id + '">' + ftIcon(ftKind(r.f)) + '<div class="grow"><div class="row-t">' + esc(r.f.name) + '</div><div class="row-s">' + esc(r.sub) + '</div></div><span class="row-v num hi-v">' + fmtNut(r.v, n.unit) + (goal ? '<small>' + Math.round(r.v / goal * 100) + '%</small>' : '') + '</span></button>';
    }).join('') + '</div><p class="muted-note sv-src">Everyday foods, plus ones you\'ve logged or saved. Tap one to pick an amount.</p>';
  }

  // Your targets for each nutrient; tap one to set your own.
  // The Targets page, like Cronometer: each nutrient with a daily target and a max you type straight in.
  // Custom is on once you change something; turning it off goes back to what's recommended for you.
  const NT_GROUPS = [['mac', 'Macros', ['kcal', 'p', 'c', 'f', 'fib', 'sug']], ['vit', 'Vitamins'], ['min', 'Minerals'], ['lip', 'Fats', null, ['f']], ['oth', 'Other', ['caff', 'alc']]];
  const NT_PLAN = { kcal: 1, p: 1, c: 1, f: 1 };
  function ntRowHtml(k, tg) {
    const n = NUT[k], t = tg[k] || {}, own = (state.profile.nutT || {})[k] != null, fromPlan = NT_PLAN[k] && t.goal != null;
    const v = function (x) { return x != null ? String(Math.round(x * 100) / 100) : ''; };
    const box = function (f, label) {
      if (f === 'goal' && fromPlan) return '<button type="button" class="nt-box nt-plan" data-nt-plan="' + k + '"><span>' + label + '</span><b class="num">' + fmtNut(t.goal, n.unit).replace(/\s*(mg|µg|g|kcal)$/, '') + '</b><em>' + n.unit + '</em><small>Plan</small></button>';
      return '<label class="nt-box"><span>' + label + '</span><input class="num" inputmode="decimal" maxlength="7" placeholder="None" data-nt-in="' + k + '" data-f="' + f + '" value="' + v(t[f]) + '" aria-label="' + esc(n.label) + ' ' + label + '" /><em>' + n.unit + '</em></label>';
    };
    return '<div class="nt-card" data-nt-row="' + k + '"><div class="nt-top"><b>' + esc(n.label) + '</b><label class="nt-cus"><span>Custom</span><span class="switch"><input type="checkbox" data-nt-cus="' + k + '"' + (own ? ' checked' : '') + ' /><i></i></span></label></div>' +
      '<div class="nt-boxes">' + box('goal', 'Daily target') + box('hi', 'Max') + '</div></div>';
  }
  function renderNutTable() {
    const box = $('#ntTable'); if (!box || box.contains(document.activeElement)) return;
    const tg = nutTargets();
    box.innerHTML = '<div class="nt-who">' + (state.profile.sex && state.profile.birthYear ? 'Recommended for your age and sex. Tap a number to change it.' : 'Add your age and sex in Energy expenditure → About you for targets made for you.') + '</div>' +
      NT_GROUPS.map(function (g) {
        const keys = (g[2] || NUTS.filter(function (n) { return n[3] === g[0] && (!g[3] || g[3].indexOf(n[0]) < 0); }).map(function (n) { return n[0]; })).filter(function (k) { return NUT[k]; });
        return '<div class="group-label">' + g[1] + '</div><div class="card nt-group">' + keys.map(function (k) { return ntRowHtml(k, tg); }).join('') + '</div>';
      }).join('') +
      '<p class="muted-note sv-src">From the US Dietary Reference Intakes: the target is the recommended amount, the max is the safe upper limit. Going over a max shows in red. Calorie, protein, carb and fat targets follow your plan.</p>';
  }
  function ntSaveRow(k, row) {
    const rec = nutRec()[k] || {}, o = {}, ins = $$('[data-nt-in]', row);
    let bad = '';
    ins.forEach(function (inp) {
      const raw = inp.value.trim(), f = inp.dataset.f;
      if (!raw) { o[f] = null; return; }
      const v = parseNum(raw); if (isNaN(v) || v <= 0 || v > 100000) { bad = 'Use a number above 0, or leave it empty'; return; }
      o[f] = Math.round(v * 100) / 100;
    });
    const goal = NT_PLAN[k] && rec.goal != null ? rec.goal : o.goal;
    if (!bad && goal != null && o.hi != null && goal > o.hi) bad = 'The target is above the max';
    if (bad) { toast(bad); buzz('warn'); row.outerHTML = ntRowHtml(k, nutTargets()); return; }
    const all = Object.assign({}, state.profile.nutT || {}); all[k] = o; state.profile.nutT = all;
    save(); const sw = $('[data-nt-cus="' + k + '"]', row); if (sw) sw.checked = true;
    renderAll();
  }
  document.addEventListener('change', function (e) {
    const inp = e.target.closest('[data-nt-in]');
    if (inp) { const row = inp.closest('[data-nt-row]'); ntSaveRow(inp.dataset.ntIn, row); return; }
    const cus = e.target.closest('[data-nt-cus]');
    if (cus) {
      const k = cus.dataset.ntCus, all = Object.assign({}, state.profile.nutT || {}), snap = snapshot();
      if (cus.checked) { const t = nutTargets()[k] || {}; all[k] = { goal: t.goal != null ? t.goal : null, hi: t.hi != null ? t.hi : null }; }
      else delete all[k];
      state.profile.nutT = all; save(); buzz('light'); renderAll();
      const row = $('[data-nt-row="' + k + '"]'); if (row) row.outerHTML = ntRowHtml(k, nutTargets());
      if (!cus.checked) toast(NUT[k].label + ': back to recommended', function () { restore(snap); });
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.closest && e.target.closest('[data-nt-in]')) e.target.blur(); });
  document.addEventListener('focusout', function (e) { if (e.target.closest && e.target.closest('[data-nt-in]')) setTimeout(function () { const b = $('#ntTable'); if (b && !b.contains(document.activeElement)) renderNutTable(); }, 0); });
  // Nutrients you've been short on lately (last 14 days with real logging), most missed first.
  function oftenLow() { return onePass(oftenLowNow); }
  function oftenLowNow() {
    const today = dayNum(todayISO()), tg = nutTargets(), days = [];
    for (let d = today - 14; d < today; d++) { const iso = isoFromDay(d), nd = dayNutrients(iso); if (nd.items && nd.kcal >= (nutTargets(iso).kcal.min || 2000) * 0.5) days.push(nd); }
    if (days.length < 3) return { days: days.length, low: [] };
    const low = [];
    MICROS.concat(['fib', 'p']).forEach(function (k) {
      const t = tg[k]; if (!t || !t.min) return;
      const cov = days.reduce(function (a, x) { return a + x.cov[k]; }, 0) / days.length;
      if (cov < 0.7) return; // not enough data to judge
      const avg = days.reduce(function (a, x) { return a + x.tot[k]; }, 0) / days.length, pct = avg / t.min * 100;
      if (pct < 75) low.push({ key: k, pct: pct, avg: avg });
    });
    low.sort(function (a, b) { return a.pct - b.pct; });
    return { days: days.length, low: low };
  }
  function renderLowCard() {
    const box = $('#lowBox'); if (!box) return;
    const anyRef = Object.keys(state.food).some(function (d) { return state.food[d].some(function (it) { return it.ref; }); });
    if (anyRef && !foodDB) {
      // Only fetch the food list once this card is actually on screen.
      box.innerHTML = '';
      if (state.ui.tab === 'progress' && state.ui.prog === 'nutrition') loadFoods().then(renderLowCard, function () {});
      return;
    }
    const r = oftenLow();
    box.innerHTML = '<div class="card"><div class="card-head"><h2 class="card-title">Often low on</h2><span class="label faint">Last 2 weeks</span></div>' +
      (r.days < 3 ? '<p class="t-sub">Log your food for at least 3 days to see which vitamins and minerals you tend to miss.</p>'
        : r.low.length ? '<div class="nut-list">' + r.low.slice(0, 5).map(function (x) { const n = NUT[x.key]; return '<button type="button" class="nut-row low-row" data-high="' + x.key + '"><span class="nr-l">' + n.label + '</span><span class="nr-v num">' + fmtNut(x.avg, n.unit) + ' <small>avg</small></span><span class="nr-p num">' + Math.round(x.pct) + '%</span><span class="bar nr-bar"><i style="width:' + Math.min(100, x.pct).toFixed(1) + '%"></i></span></button>'; }).join('') + '</div>' +
          '<p class="t-sub" style="margin-top:10px">Average of ' + r.days + ' days. Tap one for foods high in it.</p>'
          : '<p class="t-sub">Nothing below 75% of target on average over ' + r.days + ' days. Nicely done.</p>') +
      '<button type="button" class="btn soft block" data-high="vD" style="margin-top:12px">Find foods high in…</button></div>';
  }

