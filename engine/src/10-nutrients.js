  const NUTS = [
    ['kcal', 'Energy', 'kcal', 'gen'], ['p', 'Protein', 'g', 'gen'], ['c', 'Carbs', 'g', 'gen'], ['fib', 'Fiber', 'g', 'gen'], ['sug', 'Sugars', 'g', 'gen'], ['f', 'Fat', 'g', 'gen'], ['caff', 'Caffeine', 'mg', 'gen'], ['alc', 'Alcohol', 'g', 'gen'],
    ['vA', 'Vitamin A', 'µg', 'vit'], ['vC', 'Vitamin C', 'mg', 'vit'], ['vD', 'Vitamin D', 'µg', 'vit'], ['vE', 'Vitamin E', 'mg', 'vit'], ['vK', 'Vitamin K', 'µg', 'vit'],
    ['b1', 'B1 (thiamin)', 'mg', 'vit'], ['b2', 'B2 (riboflavin)', 'mg', 'vit'], ['b3', 'B3 (niacin)', 'mg', 'vit'], ['b5', 'B5 (pantothenic acid)', 'mg', 'vit'], ['b6', 'B6', 'mg', 'vit'], ['fol', 'Folate', 'µg', 'vit'], ['b12', 'B12', 'µg', 'vit'], ['chl', 'Choline', 'mg', 'vit'],
    ['ca', 'Calcium', 'mg', 'min'], ['cu', 'Copper', 'mg', 'min'], ['fe', 'Iron', 'mg', 'min'], ['mg', 'Magnesium', 'mg', 'min'], ['mn', 'Manganese', 'mg', 'min'], ['ph', 'Phosphorus', 'mg', 'min'], ['k', 'Potassium', 'mg', 'min'], ['se', 'Selenium', 'µg', 'min'], ['na', 'Sodium', 'mg', 'min'], ['zn', 'Zinc', 'mg', 'min'],
    ['sat', 'Saturated fat', 'g', 'lip'], ['mono', 'Monounsaturated', 'g', 'lip'], ['poly', 'Polyunsaturated', 'g', 'lip'], ['trans', 'Trans fat', 'g', 'lip'], ['chol', 'Cholesterol', 'mg', 'lip'], ['ala', 'Omega-3 (ALA)', 'g', 'lip'], ['epa', 'Omega-3 (EPA)', 'g', 'lip'], ['dha', 'Omega-3 (DHA)', 'g', 'lip'], ['la', 'Omega-6 (LA)', 'g', 'lip']
  ];
  const NUT = {};
  const NUT_GROUPS = [['gen', 'General'], ['vit', 'Vitamins'], ['min', 'Minerals'], ['lip', 'Fats']];
  const MICROS = NUTS.filter(function (n) { return n[3] === 'vit' || n[3] === 'min'; }).map(function (n) { return n[0]; }).filter(function (k) { return k !== 'na'; });
  const DRI = { vA: [700, 900], vC: [75, 90], vD: [15, 15], vE: [15, 15], vK: [90, 120], b1: [1.1, 1.2], b2: [1.1, 1.3], b3: [14, 16], b5: [5, 5], b6: [1.3, 1.3], fol: [400, 400], b12: [2.4, 2.4], chl: [425, 550],
    ca: [1000, 1000], cu: [0.9, 0.9], fe: [18, 8], mg: [320, 420], mn: [1.8, 2.3], ph: [700, 700], k: [2600, 3400], se: [55, 55], zn: [8, 11], ala: [1.1, 1.6], la: [12, 17] };
  const DRI_TEEN = { vA: [700, 900], vC: [65, 75], vK: [75, 75], b1: [1, 1.2], b2: [1, 1.3], b6: [1.2, 1.3], chl: [400, 550], ca: [1300, 1300], cu: [0.89, 0.89], fe: [15, 11], mg: [360, 410], mn: [1.6, 2.2], ph: [1250, 1250], k: [2300, 3000], zn: [9, 11], la: [11, 16] };
  const UL = { vC: 2000, vD: 100, b6: 100, chl: 3500, ca: 2500, cu: 10, fe: 45, mn: 11, ph: 4000, se: 400, zn: 40 };
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
      const fmax = Math.round(kcal * 0.35 / 9); r.f = { goal: plan.fat, hi: fmax > plan.fat ? fmax : null }; // at most 35% of calories, unless your plan already asks for more
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
  function dayNeedsDB(date) { return !foodDB && foodFor(date).some(function (it) { return it.ref && itemNeedsDB(it); }); }
  function microsMet(nd, tg) {
    let met = 0; MICROS.forEach(function (k) { if (tg[k] && tg[k].min && nd.tot[k] >= tg[k].min) met++; });
    return { met: met, of: MICROS.length };
  }
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