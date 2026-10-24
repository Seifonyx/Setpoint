  /* ================= Storage ================= */
  const KEY = 'setpoint';
  // Older versions saved under these keys. load() copies them into KEY once, then removes them.
  const LEGACY_KEY = 'the-slope';                              // v2.1 – v2.2
  const V1_KEYS = ['weight-log-entries', 'weight-log-phases']; // v1
  const SCHEMA = 3;
  const LB = 2.2046226218;
  const DEFAULT_SETTINGS = { unit: 'kg', theme: 'auto', style: 'graphite', tabs: 'bottom', haptics: true, goalKg: null, trackCalories: true };
  const TABS = ['diary', 'progress', 'you', 'targets', 'settings', 'foods'];
  const DEFAULT_MEALS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snacks', 'Snacks']];
  // Themes (each has a light and a dark version in app.css). [key, name, light [bg, card, accent, ink], dark [...]]
  const THEMES = [
    ['graphite', 'Graphite', ['#f2f2f7', '#ffffff', '#1c1c1e', '#111114'], ['#000000', '#111113', '#f2f2f5', '#f2f2f5']],
    ['classic', 'Emerald', ['#f2f5f3', '#ffffff', '#0f9a6c', '#0f1714'], ['#0a0f0d', '#121a17', '#5fdcab', '#ecf3ef']],
    ['ocean', 'Ocean', ['#eef4f9', '#ffffff', '#1f6fe5', '#0c1824'], ['#070d16', '#0f1824', '#6aa8ff', '#e8f0f9']],
    ['rose', 'Rose', ['#f8f1f2', '#fffbfb', '#c2416b', '#24121a'], ['#120a0d', '#1c1216', '#ff8db0', '#f6eaee']],
    ['violet', 'Midnight', ['#f2f1f8', '#ffffff', '#6c4cf1', '#13111f'], ['#08070f', '#12101d', '#a594ff', '#ece9fb']],
    ['sand', 'Terracotta', ['#f6f1ea', '#fffdf9', '#c4602f', '#231a12'], ['#0f0c09', '#1a1511', '#f0955f', '#f4ece2']],
    ['luxe', 'Luxe', ['#f4efe6', '#fffcf6', '#0f5c45', '#1d1913'], ['#0a0b0a', '#141614', '#dcb86e', '#f2ece0']]
  ];
  const THEME_KEYS = THEMES.map(function (t) { return t[0]; });
  const MEAL_KEY = /^(breakfast|lunch|dinner|snacks|g[a-z0-9]{2,10})$/;
  let MEALS = DEFAULT_MEALS; // the Diary's categories, yours if you changed them (settings.meals)
  function applyMeals() {
    const m = state && state.settings && state.settings.meals; MEALS = m && m.length ? m.map(function (x) { return [x.k, x.n]; }) : DEFAULT_MEALS;
    if (state && state.settings && state.settings.ramadan && state.settings.ramadan.on) MEALS = MEALS.map(function (x) { return x[0] === 'breakfast' ? ['breakfast', 'Suhoor'] : x[0] === 'dinner' ? ['dinner', 'Iftar'] : x; });
  }
  const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
  const FAST_GOALS = [12, 14, 16, 18, 20, 24];
  const REF_RE = /^[ucor][\w-]{1,23}$/; // u<USDA id>, c<my food>, o<barcode> (Open Food Facts), r<recipe>
  let state;

  function pick(v, allowed, fallback) { return allowed.indexOf(v) >= 0 ? v : fallback; }
  function numIn(v, lo, hi) { const n = Number(v); return (v !== null && v !== '' && v !== undefined && isFinite(n) && n >= lo && n <= hi) ? n : null; }

  // Turns anything we've ever saved (old keys, v1 arrays, v2/v3 objects, backup files)
  // into the current shape. Weights are always stored in kg.
  function crNameStr(s) { const ell = /…$/.test(s), parts = s.replace(/…$/, '').split(', '), c = {}, order = []; parts.forEach(function (n) { const m = / ×(\d+)$/.exec(n), k = n.replace(/ ×\d+$/, ''); if (!c[k]) { c[k] = 0; order.push(k); } c[k] += m ? +m[1] : 1; }); return order.map(function (n) { return n + (c[n] > 1 ? ' ×' + c[n] : ''); }).join(', ') + (ell ? '…' : ''); }
  function migrate(raw) {
    let d = raw;
    if (Array.isArray(d)) d = { entries: d };
    if (!d || typeof d !== 'object') d = {};
    const s = (d.settings && typeof d.settings === 'object') ? d.settings : {};
    const ui = (d.ui && typeof d.ui === 'object') ? d.ui : {};
    const pr = (d.profile && typeof d.profile === 'object') ? d.profile : {};
    const tr = (pr.training && typeof pr.training === 'object') ? pr.training : {};
    const thisYear = new Date().getFullYear();
    const gu = (d.guest && typeof d.guest === 'object') ? d.guest : {}, gt = (gu.training && typeof gu.training === 'object') ? gu.training : {};
    // Older tab names: v2 Trend/History → Progress, v3 Today → Diary, v3 Energy → Targets.
    const tab = { trend: 'progress', history: 'progress', today: 'diary', energy: 'targets' }[ui.tab] || ui.tab;
    const out = {
      v: SCHEMA,
      entries: [],
      phases: [],
      settings: {
        unit: pick(s.unit, ['kg', 'lb'], DEFAULT_SETTINGS.unit),
        theme: pick(s.theme, ['auto', 'light', 'dark'], DEFAULT_SETTINGS.theme),
        style: pick(s.style, THEME_KEYS, DEFAULT_SETTINGS.style),
        textSize: pick(s.textSize, ['m', 'l', 'xl'], 'm'),
        tabs: pick(s.tabs, ['bottom', 'top'], DEFAULT_SETTINGS.tabs),
        haptics: typeof s.haptics === 'boolean' ? s.haptics : DEFAULT_SETTINGS.haptics,
        numpad: s.numpad === true,
        drinkWater: s.drinkWater !== false,
        oled: s.oled === true,
        lang: s.lang === 'ar' ? 'ar' : 'en',
        explode: s.explode === true,
        flex: s.flex && typeof s.flex === 'object' && s.flex.on ? { on: true, big: numIn(s.flex.big, 0, 6), extra: numIn(s.flex.extra, 0, 1500) || 0 } : null,
        ramadan: s.ramadan && typeof s.ramadan === 'object' && s.ramadan.on && numIn(s.ramadan.lat, -66, 66) != null && numIn(s.ramadan.lon, -180, 180) != null ? { on: true, city: typeof s.ramadan.city === 'string' ? s.ramadan.city.slice(0, 40) : '', lat: Number(s.ramadan.lat), lon: Number(s.ramadan.lon), fa: numIn(s.ramadan.fa, 12, 21) || 18 } : null,
        cycle: s.cycle && typeof s.cycle === 'object' ? { on: s.cycle.on === true, starts: (Array.isArray(s.cycle.starts) ? s.cycle.starts : []).filter(function (x) { return typeof x === 'string' && ISO_RE.test(x); }).sort().slice(-24) } : { on: false, starts: [] },
        goalKg: numIn(s.goalKg, 20, 400),
        trackCalories: true, // food logging is always on since v4.1
        autoAdjust: typeof s.autoAdjust === 'boolean' ? s.autoAdjust : true,
        waterGoal: numIn(s.waterGoal, 500, 8000) ? Math.round(s.waterGoal) : null,
        waterSizes: Array.isArray(s.waterSizes) && s.waterSizes.length === 4 && s.waterSizes.every(function (v) { return numIn(v, 50, 3000) != null; }) ? s.waterSizes.map(Math.round) : [250, 330, 500, 1000],
        fasting: s.fasting === true,
        weekStart: Number.isInteger(s.weekStart) && s.weekStart >= 0 && s.weekStart <= 6 ? s.weekStart : 5, // Friday
        train: s.train && Array.isArray(s.train.days) && s.train.days.length ? { days: s.train.days.filter(function (x, i, a) { return Number.isInteger(x) && x >= 0 && x <= 6 && a.indexOf(x) === i; }) } : null,
        meals: Array.isArray(s.meals) ? (function () {
          const seen = {}, out = s.meals.filter(function (m) { if (!m || typeof m.k !== 'string' || !MEAL_KEY.test(m.k) || seen[m.k] || typeof m.n !== 'string' || !m.n.trim()) return false; seen[m.k] = 1; return true; }).slice(0, 10).map(function (m) { return { k: m.k, n: m.n.trim().slice(0, 24) }; });
          return out.length ? out : null;
        })() : null,
        highlights: Array.isArray(s.highlights) && s.highlights.length ? s.highlights.filter(function (k, i, a) { return typeof k === 'string' && /^[a-zA-Z0-9]{1,6}$/.test(k) && a.indexOf(k) === i; }).slice(0, 8) : null
      },
      profile: {
        sex: pick(pr.sex, ['female', 'male', 'other'], null),
        birthYear: numIn(pr.birthYear, thisYear - 110, thisYear - 10),
        // Your own nutrient targets (overrides the recommended ones).
        nutT: (function () { const o = {}, src = pr.nutT && typeof pr.nutT === 'object' ? pr.nutT : {}; Object.keys(src).forEach(function (k) { if (!/^[a-zA-Z0-9]{1,6}$/.test(k)) return; const x = src[k]; if (x && typeof x === 'object') { const r = {}; ['lo', 'goal', 'hi'].forEach(function (f) { if (x[f] === null) r[f] = null; else { const v = numIn(x[f], 0.001, 100000); if (v != null) r[f] = v; } }); if (Object.keys(r).length) o[k] = r; } else { const v = numIn(x, 0.001, 100000); if (v != null) o[k] = v; } }); return o; })(), // a number (older versions) or { lo, goal, hi }
        heightCm: numIn(pr.heightCm, 100, 250),
        bodyFat: numIn(pr.bodyFat, 3, 70),
        steps: numIn(pr.steps, 0, 50000) != null ? Math.round(pr.steps) : 7000,
        training: {
          days: numIn(tr.days, 0, 7) != null ? Math.round(tr.days) : 3,
          type: pick(tr.type, ['lifting', 'cardio', 'mixed', 'sports'], 'lifting'),
          minutes: pick(Number(tr.minutes), [30, 45, 60, 90], 60),
          intensity: pick(tr.intensity, ['light', 'moderate', 'hard'], 'moderate')
        },
        paceKg: numIn(pr.paceKg, -1.5, 1.5),
        tdeeSource: pick(pr.tdeeSource, ['auto', 'calc', 'measured'], 'auto'),
        // Weekly self-correction of the formula target (kcal/day), and when it/pace last changed (dayNum).
        adjustKcal: numIn(pr.adjustKcal, -600, 600) || 0,
        adjustAt: numIn(pr.adjustAt, 0, 1e6),
        paceAt: numIn(pr.paceAt, 0, 1e6),
        // null = use the recommended amount. Values are g per kg of the reference weight.
        macros: {
          protein: numIn(pr.macros && pr.macros.protein, 1.4, 2.8),
          fat: numIn(pr.macros && pr.macros.fat, 0.4, 1.4)
        }
      },
      ui: {
        tab: pick(tab, TABS, 'diary'),
        prog: pick(ui.prog, ['weight', 'nutrition', 'body'], 'weight'),
        range: [30, 90, 180, 365, 0].indexOf(Number(ui.range)) >= 0 ? Number(ui.range) : 90,
        view: pick(ui.view, ['days', 'weeks'], 'days'),
        foodTab: pick(ui.foodTab, ['recent', 'favs', 'mine'], 'recent'),
        holdTip: ui.holdTip === true,
        consentAt: Number.isFinite(ui.consentAt) && ui.consentAt > 0 ? ui.consentAt : null, // when you agreed to the terms, privacy policy and cloud storage of your health data
        ramAsk: typeof ui.ramAsk === 'string' ? ui.ramAsk.slice(0, 6) : null, // Islamic year the "turn on Ramadan mode" offer was dismissed
        ramOff: typeof ui.ramOff === 'string' ? ui.ramOff.slice(0, 6) : null,
        smartBurn: ui.smartBurn === true, // moved to the automatic burn once (v1.65)
        tune: ui.tune && typeof ui.tune === 'object' && typeof ui.tune.at === 'number' ? { at: ui.tune.at, change: numIn(ui.tune.change, -600, 600) || 0, hold: ui.tune.hold === true, over: numIn(ui.tune.over, -5000, 5000), actual: numIn(ui.tune.actual, -5, 5), planned: numIn(ui.tune.planned, -5, 5), plateau: ui.tune.plateau === true, goal: ui.tune.goal === true, before: numIn(ui.tune.before, -600, 600), after: numIn(ui.tune.after, -600, 600), undoPace: numIn(ui.tune.undoPace, -1.5, 1.5) } : null,
        goalHit: numIn(ui.goalHit, 20, 400),
        graphite: ui.graphite === true, // switched to Graphite once (v1.50); you can pick another theme after
        hintOff: ui.hintOff && ISO_RE.test(String(ui.hintOff.d || '')) && Array.isArray(ui.hintOff.k) ? { d: ui.hintOff.d, k: ui.hintOff.k.filter(function (k) { return typeof k === 'string' && k.length < 10; }).slice(0, 10) } : null,
        storeWarn: Number.isInteger(ui.storeWarn) ? ui.storeWarn : null,
        diet: ui.diet && typeof ui.diet === 'object' ? { seeds: (function (o) { const r = {}; if (o && typeof o === 'object') Object.keys(o).slice(0, 12).forEach(function (k) { if (MEAL_KEY.test(k) && Number.isInteger(o[k]) && o[k] >= 0) r[k] = Math.min(o[k], 9999); }); return r; })(ui.diet.seeds), mine: ui.diet.mine !== false, meals: Array.isArray(ui.diet.meals) ? ui.diet.meals.filter(function (m) { return typeof m === 'string' && MEAL_KEY.test(m); }).slice(0, 12) : null } : null, // the Diet planner's current plan
        sameX: ui.sameX && ISO_RE.test(String(ui.sameX.d || '')) && Array.isArray(ui.sameX.m) ? { d: ui.sameX.d, m: ui.sameX.m.filter(function (m) { return typeof m === 'string' && MEAL_KEY.test(m); }).slice(0, 12) } : null, // "Same as yesterday" hidden for these meals on that day
        celeb: ISO_RE.test(String(ui.celeb || '')) ? ui.celeb : null, // last day we celebrated hitting the target
        folded: Array.isArray(ui.folded) ? ui.folded.filter(function (k, i, a) { return ['phases', 'history'].indexOf(k) >= 0 && a.indexOf(k) === i; }) : [],
        shut: Array.isArray(ui.shut) ? ui.shut.filter(function (m, i, a) { return typeof m === 'string' && MEAL_KEY.test(m) && a.indexOf(m) === i; }) : [],
        weekSeen: typeof ui.weekSeen === 'number' ? ui.weekSeen : null,
        gapHide: typeof ui.gapHide === 'string' ? ui.gapHide.slice(0, 40) : null,
        gsHide: ui.gsHide === true,
        qhist: Array.isArray(ui.qhist) ? ui.qhist.filter(function (x) { return typeof x === 'string' && x.trim(); }).map(function (x) { return x.slice(0, 30); }).slice(0, 8) : [],
        chartKcal: ui.chartKcal === true,
        sver: ui.sver === true,
        pins: Array.isArray(ui.pins) ? ui.pins.filter(function (k) { return typeof k === 'string' && k.length < 200; }).slice(0, 30) : [],
        hide: Array.isArray(ui.hide) ? ui.hide.filter(function (k) { return typeof k === 'string' && k.length < 200; }).slice(0, 400) : [],
        qmem: ui.qmem && typeof ui.qmem === 'object' ? (function () { const o = {}; Object.keys(ui.qmem).slice(0, 300).forEach(function (k) { const v = ui.qmem[k]; if (k.length <= 40 && v && typeof v === 'object') { const m = {}; Object.keys(v).slice(0, 6).forEach(function (id) { if (REF_RE.test(id) && numIn(v[id], 1, 999)) m[id] = Math.round(v[id]); }); o[k] = m; } }); return o; })() : {},
        sort: pick(ui.sort, ['recent', 'freq', 'az'], 'recent'),
        backupAt: typeof ui.backupAt === 'number' ? ui.backupAt : null,
        backupLater: typeof ui.backupLater === 'number' ? ui.backupLater : null,
        checkin: typeof ui.checkin === 'number' ? ui.checkin : null,
        onboarded: !!ui.onboarded,
        // Milestones already celebrated. null = not set up yet (older saves), filled in silently on first run.
        milestones: Array.isArray(ui.milestones) ? ui.milestones.filter(function (k) { return typeof k === 'string'; }).slice(0, 200) : null
      },
      // The "someone else" calculator. Kept apart from profile so it never changes your own plan.
      guest: {
        sex: pick(gu.sex, ['female', 'male', 'other'], null),
        age: numIn(gu.age, 13, 100),
        heightCm: numIn(gu.heightCm, 100, 250),
        kg: numIn(gu.kg, 20, 400),
        steps: numIn(gu.steps, 0, 50000) != null ? Math.round(gu.steps) : 7000,
        training: {
          days: numIn(gt.days, 0, 7) != null ? Math.round(gt.days) : 0,
          type: pick(gt.type, ['lifting', 'cardio', 'mixed', 'sports'], 'lifting'),
          minutes: pick(Number(gt.minutes), [30, 45, 60, 90], 60),
          intensity: pick(gt.intensity, ['light', 'moderate', 'hard'], 'moderate')
        },
        paceKg: numIn(gu.paceKg, -1.5, 1.5) != null ? Number(gu.paceKg) : 0
      },
      seenVersion: typeof d.seenVersion === 'string' ? d.seenVersion : null,
      // Device-only sync bookkeeping. Never uploaded.
      sync: {
        uid: d.sync && typeof d.sync.uid === 'string' ? d.sync.uid : null,
        email: d.sync && typeof d.sync.email === 'string' ? d.sync.email : null,
        updatedAt: d.sync && typeof d.sync.updatedAt === 'number' ? d.sync.updatedAt : 0,
        lastSync: d.sync && typeof d.sync.lastSync === 'number' ? d.sync.lastSync : 0,
        dirty: !!(d.sync && d.sync.dirty)
      }
    };
    const byDate = {};
    (Array.isArray(d.entries) ? d.entries : []).forEach(function (e) {
      if (!e || typeof e !== 'object') return;
      const date = String(e.date || '').slice(0, 10);
      if (!ISO_RE.test(date)) return;
      const kg = e.kg != null ? Number(e.kg) : Number(e.weight); // v1 stored { date, weight } in kg
      if (!isFinite(kg) || kg <= 0 || kg > 700) return;
      const entry = { date: date, kg: Math.round(kg * 10000) / 10000, note: typeof e.note === 'string' ? e.note.slice(0, 200) : '' };
      const kcal = numIn(e.kcal, 1, 20000);
      if (kcal != null) entry.kcal = Math.round(kcal);
      byDate[date] = entry;
    });
    out.entries = Object.keys(byDate).sort().map(function (k) { return byDate[k]; });
    const MEAS_KEYS = ['waist', 'hips', 'chest', 'arm', 'thigh', 'neck'], mByDate = {};
    (Array.isArray(d.measures) ? d.measures : []).forEach(function (m) {
      if (!m || !ISO_RE.test(String(m.date || ''))) return;
      const row = { date: m.date }; let any = false;
      MEAS_KEYS.forEach(function (k) { const v = numIn(m[k], 10, 300); row[k] = v != null ? Math.round(v * 10) / 10 : null; if (v != null) any = true; });
      if (any) mByDate[m.date] = row;
    });
    out.measures = Object.keys(mByDate).sort().map(function (k) { return mByDate[k]; });
    out.food = {};
    if (d.food && typeof d.food === 'object') Object.keys(d.food).forEach(function (date) {
      if (!ISO_RE.test(date) || !Array.isArray(d.food[date])) return;
      const items = d.food[date].filter(function (f) { return f && numIn(f.kcal, 0, 10000) != null; }).slice(0, 100).map(normItem);
      if (items.length) out.food[date] = items;
    });
    function normItem(f) {
        const g = function (v) { return numIn(v, 0, 1000) != null ? Math.round(Number(v)) : 0; };
        const it = { id: typeof f.id === 'string' ? f.id.slice(0, 24) : Math.random().toString(36).slice(2, 10), kcal: Math.round(Number(f.kcal)), protein: g(f.protein), carbs: g(f.carbs), fat: g(f.fat), name: typeof f.name === 'string' ? f.name.trim().slice(0, 80) : '', meal: typeof f.meal === 'string' && MEAL_KEY.test(f.meal) ? f.meal : 'snacks' };
        if (typeof f.rep === 'string' && /^p[\w]{1,12}$/.test(f.rep)) it.rep = f.rep;
        // Foods picked from the database or My foods remember what and how much, so they can be edited later.
        if (typeof f.ref === 'string' && REF_RE.test(f.ref) && numIn(f.g, 0.01, 20000) != null && numIn(f.qty, 0.001, 10000) != null && typeof f.unit === 'string') {
          it.ref = f.ref; it.g = Math.round(Number(f.g) * 10) / 10; it.qty = Math.round(Number(f.qty) * 1000) / 1000; it.unit = f.unit.slice(0, 48);
          if (it.ref.charAt(0) === 'r' && f.rc && Array.isArray(f.rc.items)) {
            const its = f.rc.items.filter(function (x) { return x && typeof x.ref === 'string' && /^[uco][\w-]{1,23}$/.test(x.ref) && numIn(x.g, 0.01, 20000) != null; }).slice(0, 60).map(function (x) {
              return { ref: x.ref, name: typeof x.name === 'string' ? x.name.slice(0, 80) : '', g: Math.round(Number(x.g) * 10) / 10, qty: numIn(x.qty, 0.001, 10000) || Number(x.g), unit: typeof x.unit === 'string' ? x.unit.slice(0, 48) : 'g' };
            });
            if (its.length) it.rc = { servings: numIn(f.rc.servings, 1, 100) ? Math.round(f.rc.servings) : 1, cookedG: numIn(f.rc.cookedG, 1, 50000), items: its };
          }
        }
        if (typeof f.t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(f.t)) it.t = f.t; // time eaten
        if (f.plan === true) it.plan = true; // planned, not eaten yet
        if (numIn(f.u, 1e12, 1e13) != null) it.u = Math.round(f.u); // when it was last changed (for syncing two phones)
        if (typeof f.note === 'string' && f.note.trim()) it.note = f.note.trim().slice(0, 140);
        if (f.pic === true) it.pic = true; // a photo kept on this phone
        if (typeof f.mid === 'string' && /^m[\w-]{1,23}$/.test(f.mid)) { // a meal logged as one entry, with its foods
          it.mid = f.mid;
          if (Array.isArray(f.mi)) { const mi = f.mi.filter(function (x) { return x && !x.mid && numIn(x.kcal, 0, 10000) != null; }).slice(0, 40).map(function (x) { const c = normItem(x); delete c.id; delete c.meal; return c; }); if (mi.length) it.mi = mi; }
        }
        if ((/^cr-/.test(f.id) || (!it.ref && f.n && !it.mid)) && it.name.indexOf(', ') > 0) it.name = crNameStr(it.name); // tidy older imports (and copies)
        // Imported days (Cronometer) bring their own vitamins and minerals.
        if (!it.ref && f.n && typeof f.n === 'object') {
          const n = {}; let c = 0;
          Object.keys(f.n).forEach(function (k) { if (c < 60 && /^[a-zA-Z0-9]{1,6}$/.test(k)) { const v = numIn(f.n[k], 0, 1000000); if (v != null) { n[k] = Math.round(v * 1000) / 1000; c++; } } });
          if (c) it.n = n;
        }
        return it;
    }
    // Before v4.2 a calorie total could be saved with a weigh-in. Turn it into a normal diary item so it can be
    // seen, edited and deleted (the fixed id stops two synced devices from adding it twice).
    out.entries.forEach(function (e) {
      if (e.kcal == null) return;
      if (!out.food[e.date]) out.food[e.date] = [{ id: 'w-' + e.date, kcal: Math.min(e.kcal, 10000), protein: 0, carbs: 0, fat: 0, name: 'Daily total', meal: 'snacks' }];
      delete e.kcal;
    });
    const g1 = function (v) { return numIn(v, 0, 5000) != null ? Math.round(Number(v) * 10) / 10 : 0; };
    out.myFoods = (Array.isArray(d.myFoods) ? d.myFoods : []).filter(function (c) { return c && typeof c.name === 'string' && c.name.trim() && numIn(c.kcal, 0, 10000) != null; }).slice(0, 500).map(function (c) {
      return { id: typeof c.id === 'string' && /^c[\w-]{1,23}$/.test(c.id) ? c.id : 'c' + Math.random().toString(36).slice(2, 10), name: c.name.trim().slice(0, 60),
        unit: (typeof c.unit === 'string' && c.unit.trim() ? c.unit.trim() : 'serving').slice(0, 30), g: numIn(c.g, 0.1, 5000), kcal: Math.round(Number(c.kcal)), p: g1(c.p), c: g1(c.c), f: g1(c.f), code: typeof c.code === 'string' && /^\d{8,14}$/.test(c.code) ? c.code : undefined, ok: c.ok === true ? true : undefined,
        n: (function () { const n = {}; if (c.n && typeof c.n === 'object') ['fib', 'sug', 'sat', 'na', 'k', 'ca', 'fe', 'vD'].forEach(function (k) { const v = numIn(c.n[k], 0, 100000); if (v != null) n[k] = v; }); return n; })() };
    });
    // Scanned products (Open Food Facts), kept so they work offline and show up in search.
    const NKEYS = ['kcal', 'p', 'c', 'f', 'fib', 'sug', 'sat', 'trans', 'mono', 'poly', 'chol', 'na', 'k', 'ca', 'fe', 'mg', 'zn', 'ph', 'vC', 'vA', 'vD', 'b12', 'caff', 'alc'];
    out.offFoods = (Array.isArray(d.offFoods) ? d.offFoods : []).filter(function (o) { return o && typeof o.code === 'string' && /^\d{8,14}$/.test(o.code) && o.n && numIn(o.n.kcal, 0, 1000) != null; }).slice(0, 300).map(function (o) {
      const n = {}; NKEYS.forEach(function (k) { const v = numIn(o.n[k], 0, 1e6); if (v != null) n[k] = v; });
      return { id: 'o' + o.code, code: o.code, name: (typeof o.name === 'string' && o.name.trim() ? o.name.trim() : 'Product ' + o.code).slice(0, 60), brand: typeof o.brand === 'string' ? o.brand.slice(0, 40) : '', n: n, sv: numIn(o.sv, 0.1, 5000) };
    });
    out.recipes = (Array.isArray(d.recipes) ? d.recipes : []).filter(function (r) { return r && typeof r.name === 'string' && r.name.trim() && Array.isArray(r.items); }).slice(0, 300).map(function (r) {
      return { id: typeof r.id === 'string' && /^r[\w-]{1,23}$/.test(r.id) ? r.id : 'r' + Math.random().toString(36).slice(2, 10), name: r.name.trim().slice(0, 60), servings: numIn(r.servings, 1, 100) ? Math.round(r.servings) : 1, cookedG: numIn(r.cookedG, 1, 50000),
        items: r.items.filter(function (it) { return it && typeof it.ref === 'string' && /^[uco][\w-]{1,23}$/.test(it.ref) && numIn(it.g, 0.01, 20000) != null; }).slice(0, 60).map(function (it) {
          return { ref: it.ref, name: typeof it.name === 'string' ? it.name.slice(0, 80) : '', g: Math.round(Number(it.g) * 10) / 10, qty: numIn(it.qty, 0.001, 10000) || Number(it.g), unit: typeof it.unit === 'string' ? it.unit.slice(0, 48) : 'g' };
        }) };
    });
    // Repeat items: foods you've chosen to add to the diary every day (or on chosen days), on their own.
    out.repeats = (Array.isArray(d.repeats) ? d.repeats : []).filter(function (r) { return r && r.item && numIn(r.item.kcal, 0, 10000) != null && typeof r.meal === 'string' && MEAL_KEY.test(r.meal); }).slice(0, 40).map(function (r) {
      const it = normItem(r.item); delete it.id; delete it.meal;
      return { id: typeof r.id === 'string' && /^p[\w]{1,12}$/.test(r.id) ? r.id : 'p' + Math.random().toString(36).slice(2, 10), item: it, meal: r.meal,
        days: Array.isArray(r.days) ? r.days.filter(function (x, i, a) { return Number.isInteger(x) && x >= 0 && x <= 6 && a.indexOf(x) === i; }) : [], u: numIn(r.u, 0, 1e14) || 0, paused: r.paused === true, until: r.paused === true && ISO_RE.test(String(r.until || '')) ? r.until : null, time: /^([01]\d|2[0-3]):[0-5]\d$/.test(String(r.time || '')) ? r.time : null };
    });
    out.meals = (Array.isArray(d.meals) ? d.meals : []).filter(function (m) { return m && typeof m.name === 'string' && m.name.trim() && Array.isArray(m.items) && m.items.length; }).slice(0, 200).map(function (m) {
      return { id: typeof m.id === 'string' && /^m[\w-]{1,23}$/.test(m.id) ? m.id : 'm' + Math.random().toString(36).slice(2, 10), name: m.name.trim().slice(0, 40),
        items: m.items.filter(function (f) { return f && numIn(f.kcal, 0, 10000) != null; }).slice(0, 40).map(function (f) { const it = normItem(f); delete it.id; delete it.meal; return it; }) };
    });
    (function () {
      const byId = {}; out.recipes.forEach(function (r) { byId[r.id] = r; });
      const fix = function (it) {
        if (!it.ref || it.ref.charAt(0) !== 'r' || it.unit !== 'serving') return;
        const rc = it.rc || byId[it.ref]; if (!rc || rc.cookedG || !rc.items.length) return;
        it.g = Math.round(it.qty * recipeServingG(rc) * 10) / 10;
      };
      Object.keys(out.food).forEach(function (k) { out.food[k].forEach(fix); });
      out.meals.forEach(function (m) { m.items.forEach(fix); });
    })();
    out.favs = (Array.isArray(d.favs) ? d.favs : []).filter(function (x, i, a) { return typeof x === 'string' && REF_RE.test(x) && a.indexOf(x) === i; }).slice(0, 300);
    // Daily targets as they were, by the day they started (so past days keep their old goals).
    out.goals = {};
    if (d.goals && typeof d.goals === 'object') Object.keys(d.goals).sort().slice(-1000).forEach(function (k) {
      const g = d.goals[k]; if (!ISO_RE.test(k) || !g) return;
      const kc = numIn(g.k, 500, 10000); if (kc == null) return;
      out.goals[k] = { k: Math.round(kc), p: Math.round(numIn(g.p, 0, 1000) || 0), c: Math.round(numIn(g.c, 0, 2000) || 0), f: Math.round(numIn(g.f, 0, 1000) || 0) };
      if (Array.isArray(g.td) && numIn(g.tx, 0, 3000) != null && numIn(g.rx, 0, 3000) != null) { out.goals[k].td = g.td.filter(function (x) { return Number.isInteger(x) && x >= 0 && x <= 6; }); out.goals[k].tx = Math.round(g.tx); out.goals[k].rx = Math.round(g.rx); }
    });
    out.dayMode = {}; // refeed ('f') or diet break ('b') days
    if (d.dayMode && typeof d.dayMode === 'object') Object.keys(d.dayMode).forEach(function (k) { if (ISO_RE.test(k) && (d.dayMode[k] === 'f' || d.dayMode[k] === 'b')) out.dayMode[k] = d.dayMode[k]; });
    out.dayType = {}; // per-day training/rest override
    if (d.dayType && typeof d.dayType === 'object') Object.keys(d.dayType).forEach(function (k) { if (ISO_RE.test(k) && (d.dayType[k] === 't' || d.dayType[k] === 'r')) out.dayType[k] = d.dayType[k]; });
    // Diary entries deleted on some phone, and when: { id: time } (kept 120 days so other phones learn about it).
    out.del = {};
    // Deletions are remembered for a year, so a phone that's been offline a long time can't bring deleted foods back (newest 5,000 kept).
    if (d.del && typeof d.del === 'object') { const old = Date.now() - 365 * 864e5; Object.keys(d.del).filter(function (k) { const t = numIn(d.del[k], 1e12, 1e13); return typeof k === 'string' && k.length <= 24 && t != null && t > old; }).sort(function (a, b) { return d.del[b] - d.del[a]; }).slice(0, 5000).forEach(function (k) { out.del[k] = Math.round(d.del[k]); }); }
    // Your own portion sizes for any food: { foodId: [{ l: 'my bowl', g: 350 }] }
    out.portions = {};
    if (d.portions && typeof d.portions === 'object') Object.keys(d.portions).slice(0, 500).forEach(function (k) {
      if (!REF_RE.test(k) || !Array.isArray(d.portions[k])) return;
      const l = d.portions[k].filter(function (x) { return x && typeof x.l === 'string' && x.l.trim() && numIn(x.g, 0.1, 5000) != null; }).slice(0, 8).map(function (x) { return { l: x.l.trim().slice(0, 24), g: Math.round(x.g * 10) / 10 }; });
      if (l.length) out.portions[k] = l;
    });
    out.water = {};
    if (d.water && typeof d.water === 'object') Object.keys(d.water).forEach(function (k) { const v = numIn(d.water[k], 1, 10000); if (ISO_RE.test(k) && v != null) out.water[k] = Math.round(v); });
    const fs = d.fast && typeof d.fast === 'object' ? d.fast : {}, okMs = function (v) { return numIn(v, 1.5e12, 4e12); };
    out.fast = { goal: FAST_GOALS.indexOf(Number(fs.goal)) >= 0 ? Number(fs.goal) : 16, start: okMs(fs.start),
      log: (Array.isArray(fs.log) ? fs.log : []).filter(function (x) { return x && okMs(x.s) && okMs(x.e) && x.e > x.s && x.e - x.s < 8 * 864e5; }).slice(0, 100).map(function (x) { return { s: x.s, e: x.e, g: FAST_GOALS.indexOf(Number(x.g)) >= 0 ? Number(x.g) : 16 }; }) };
    const phaseByDate = {};
    (Array.isArray(d.phases) ? d.phases : []).forEach(function (p) {
      if (!p || typeof p !== 'object') return;
      const date = String(p.date || '').slice(0, 10);
      if (!ISO_RE.test(date)) return;
      phaseByDate[date] = { date: date, label: typeof p.label === 'string' ? p.label.trim().slice(0, 40) : '' };
    });
    out.phases = Object.keys(phaseByDate).sort().map(function (k) { return phaseByDate[k]; });
    return out;
  }

  function load() {
    let raw = null, legacy = null;
    try { const s = localStorage.getItem(KEY); if (s) raw = JSON.parse(s); } catch (e) { raw = null; }
    if (!raw) {
      try { const s = localStorage.getItem(LEGACY_KEY); if (s) { raw = JSON.parse(s); legacy = [LEGACY_KEY]; } } catch (e) { raw = null; }
    }
    if (!raw) {
      try {
        const e = localStorage.getItem(V1_KEYS[0]), p = localStorage.getItem(V1_KEYS[1]);
        if (e || p) { raw = { entries: e ? JSON.parse(e) : [], phases: p ? JSON.parse(p) : [], seenVersion: '1.0' }; legacy = V1_KEYS; }
      } catch (err) { raw = null; }
    }
    state = migrate(raw);
    save(); if (legacy) flushSave();
    // Only clear the old copy once the new one has definitely been written.
    if (legacy) {
      try {
        const check = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (check && Array.isArray(check.entries) && check.entries.length === state.entries.length) legacy.forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) {}
    }
  }
  // What gets synced to the account (not ui, sync or seenVersion).
  function cloudData() { return { v: state.v, entries: state.entries, phases: state.phases, food: state.food, measures: state.measures, myFoods: state.myFoods, favs: state.favs, offFoods: state.offFoods, recipes: state.recipes, meals: state.meals, repeats: state.repeats, water: state.water, portions: state.portions, del: state.del, goals: state.goals, dayType: state.dayType, dayMode: state.dayMode, fast: state.fast, settings: state.settings, profile: state.profile, guest: state.guest }; }
  let lastSig = null, quietSave = false, saveQueued = false, saveQuiet = false;
  let dataVer = 0; // goes up on every change (for caches)
  function save() {
    dataVer++;
    saveQuiet = saveQueued ? saveQuiet && quietSave : quietSave; // quiet only if every save in the batch was
    if (saveQueued) return;
    saveQueued = true;
    // Written down just after the next frame is drawn, so saving never holds up what a tap shows.
    // (Closing or leaving the app writes it straight away: see pagehide and visibilitychange below.)
    if (document.hidden || typeof requestAnimationFrame !== 'function') Promise.resolve().then(flushSave);
    else { requestAnimationFrame(function () { setTimeout(flushSave, 0); }); setTimeout(flushSave, 300); }
  }
  // What every diary entry looked like at the last save, to notice which ones changed or were deleted since.
  let itemSigs = null;
  function stampItems(quiet) {
    if (!state.del) state.del = {};
    const now = Date.now(), seen = {}, prev = itemSigs, next = {};
    Object.keys(state.food).forEach(function (d) { state.food[d].forEach(function (it) {
      const u = it.u; delete it.u; const sg = d + '|' + JSON.stringify(it); if (u !== undefined) it.u = u;
      next[it.id] = sg; seen[it.id] = 1;
      if (prev && !quiet && prev[it.id] !== sg) it.u = now; // new or changed
      if (state.del[it.id]) delete state.del[it.id]; // it's back (undo)
    }); });
    if (prev && !quiet) Object.keys(prev).forEach(function (id) { if (!seen[id]) state.del[id] = now; });
    itemSigs = next;
  }
  function flushSave() {
    if (!saveQueued) return;
    saveQueued = false;
    stampItems(saveQuiet || lastSig === null);
    const sig = JSON.stringify(cloudData());
    if (lastSig !== null && sig !== lastSig && !saveQuiet) { state.sync.updatedAt = Date.now(); state.sync.dirty = true; schedulePush(); }
    lastSig = sig;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    renderSyncDot();
  }
  window.addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', function () { if (document.hidden) flushSave(); });
  setTimeout(function () { if (typeof dailyBackup === 'function') dailyBackup(); }, 4000);
  // For the test suite only (opened with ?test=1): the sync merge, so it can be checked directly.
  if (/[?&]test=1\b/.test(location.search)) window.__setpoint = { mergeData: function (l, c, n) { return mergeData(l, c, n); }, migrate: function (d) { return migrate(d); }, foodReady: function () { return !!foodDB; }, loadFoods: function () { return loadFoods(); }, highIn: function (k, by) { return highInHtml(k, by); }, db: function () { return foodDB; }, energy: function () { const e = activeEnergy(), pl = makePlan(e); return e && { tdee: Math.round(e.tdee), source: e.source, w: e.w, calc: e.calc && Math.round(e.calc.tdee), target: pl && Math.round(pl.target), adjust: state.profile.adjustKcal, pace: state.profile.paceKg, tune: state.ui.tune }; }, nav: { open: function (h) { openSheet(h); }, close: function () { closeSheet(); }, tab: function (t) { showTab(t); } }, renderAll: function () { renderAll(); }, words: function (id) { const f = getFood(id); return f && { w: f.w, first: f.first, on: f.on }; }, search: function (q, n) { return searchFoods(q, {}, { noRecipes: true }).slice(0, n || 5).map(function (f) { return f.id + ' ' + f.name; }); } };
  function snapshot() { flushSave(); return JSON.stringify(state); }
  function restore(snap) { const sy = state.sync; state = migrate(JSON.parse(snap)); state.sync = sy; save(); applyAppearance(); renderAll(); }

