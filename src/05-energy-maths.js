  /* ================= Energy maths ================= */
  const KCAL_PER_KG = 7700;
  // Gross METs for a typical session (lifting includes rest between sets).
  const TRAIN_MET = {
    lifting: { light: 3, moderate: 3.5, hard: 5 },
    cardio: { light: 4, moderate: 7, hard: 10 },
    mixed: { light: 4, moderate: 6, hard: 8 },
    sports: { light: 4.5, moderate: 7, hard: 9 }
  };
  const RATES = { kg: { lose: [0.25, 0.5, 0.75, 1], gain: [0.25, 0.5] }, lb: { lose: [0.5, 1, 1.5, 2], gain: [0.5, 1] } };
  function ageNow() { const y = state.profile.birthYear; return y ? new Date().getFullYear() - y : null; }
  function profileReady() { const p = state.profile; return !!(p.sex && p.birthYear && p.heightCm); }

  // TDEE = (BMR + everyday movement + steps + training) / 0.9; the last 10% is digestion.
  // `p` needs sex, age, heightCm, steps, training and optionally bodyFat. Pure, so the guest calculator can use it.
  function energyFor(p, kg) {
    const bmr = p.bodyFat ? 370 + 21.6 * kg * (1 - p.bodyFat / 100)
      : 10 * kg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : p.sex === 'female' ? -161 : -78);
    const km = p.steps * p.heightCm * 0.00415 / 1000;  // stride ≈ 41.5% of height
    const steps = 0.5 * kg * km;                        // walking ≈ 0.5 kcal per kg per km above rest
    const t = p.training;
    const train = t.days * (TRAIN_MET[t.type][t.intensity] - 1) * kg * (t.minutes / 60) / 7;
    const tdee = (bmr * 1.1 + steps + train) / 0.9;
    const pal = tdee / bmr;
    const level = pal < 1.35 ? 'Sedentary' : pal < 1.5 ? 'Lightly active' : pal < 1.7 ? 'Moderately active' : pal < 1.9 ? 'Very active' : 'Extremely active';
    return { kg: kg, bmr: bmr, life: tdee - bmr - steps - train, steps: steps, train: train, tdee: tdee, level: level };
  }
  function calcEnergy() { return inPass('ce', calcEnergyNow); }
  function calcEnergyNow() {
    const p = state.profile, kg = currentKg();
    if (!profileReady() || kg == null) return null;
    return energyFor(Object.assign({}, p, { age: ageNow() }), kg);
  }
  // Real TDEE from the last 28 days: average intake minus the energy in the weight change.
  function measuredEnergy() { return inPass('me', measuredEnergyNow); }
  function measuredEnergyNow() {
    const end = dayNum(todayISO());
    const win = state.entries.filter(function (e) { return dayNum(e.date) > end - 28; });
    const cal = [];
    // Days logged at under half your estimated burn are probably half-logged, and would make maintenance look too low.
    const ce = calcEnergy(), lowCut = ce ? ce.tdee * 0.5 : 800;
    for (let d = end - 27; d < end; d++) { const k = dayKcal(isoFromDay(d)); if (k && k >= lowCut) cal.push(k); }
    const span = win.length > 1 ? dayNum(win[win.length - 1].date) - dayNum(win[0].date) + 1 : win.length;
    const res = { ready: false, calDays: cal.length, span: span, needCal: 10, needSpan: 14 };
    if (cal.length < res.needCal || span < res.needSpan) return res;
    const reg = linreg(win.map(function (e) { return { x: dayNum(e.date), y: e.kg }; }));
    if (!reg) return res;
    const intake = cal.reduce(function (a, k) { return a + k; }, 0) / cal.length;
    res.ready = true; res.intake = intake; res.rateKgWk = reg.slope * 7; res.tdee = intake - reg.slope * KCAL_PER_KG;
    return res;
  }
  function activeEnergy() { return inPass('ae', activeEnergyNow); }
  // Today's plan from today's burn (what the day plans below start from).
  function livePlan() { return inPass('lp', function () { return makePlan(activeEnergy()); }); }
  function activeEnergyNow() {
    const c = calcEnergy(), m = measuredEnergy(), kg = currentKg(), src = state.profile.tdeeSource;
    if (m.ready && kg != null && (src === 'measured' || !c)) return { tdee: m.tdee, source: 'measured', calc: c, kg: kg, m: m };
    if (!c) return null;
    if (src === 'auto') {
      // Automatic: start from the formula plus the weekly corrections, then lean more and more on your real
      // burn (food log + weight trend) as you log: from about 10 good days, all of it by 20 days over 4 weeks.
      // Kept within 75–130% of the formula, so a few half-logged days can't send it somewhere silly.
      const base = c.tdee + (state.settings.autoAdjust ? state.profile.adjustKcal : 0);
      let w = 0, tdee = base;
      if (m.ready) { w = clamp((m.calDays - 7) / 13, 0, 1) * clamp(m.span / 28, 0.5, 1); tdee = base + w * (clamp(m.tdee, c.tdee * 0.75, c.tdee * 1.3) - base); }
      return { tdee: tdee, source: 'auto', w: w, calc: c, kg: c.kg, m: m };
    }
    return { tdee: c.tdee, source: 'calc', calc: c, kg: c.kg };
  }
  // Pace in kg/week, snapped to the options shown for the current unit.
  function snapPace(pace) {
    if (pace == null || Math.abs(pace) < 1e-6) return { dir: 'maintain', kg: 0, i: -1 };
    const dir = pace < 0 ? 'lose' : 'gain';
    const opts = RATES[unit()][dir].map(function (v) { return unit() === 'lb' ? v / LB : v; });
    let i = 0;
    opts.forEach(function (o, j) { if (Math.abs(o - Math.abs(pace)) < Math.abs(opts[i] - Math.abs(pace))) i = j; });
    return { dir: dir, kg: (dir === 'lose' ? -1 : 1) * opts[i], i: i };
  }
  function paceValue(dir, i) {
    if (dir === 'maintain') return 0;
    const v = RATES[unit()][dir][i];
    return (dir === 'lose' ? -1 : 1) * (unit() === 'lb' ? v / LB : v);
  }
  function currentPace() {
    let pace = state.profile.paceKg;
    if (pace == null) {
      const g = state.settings.goalKg, kg = currentKg();
      pace = (g && kg && g < kg - 0.5) ? -0.5 : (g && kg && g > kg + 0.5) ? 0.25 : 0;
    }
    return snapPace(pace);
  }
  function setPace(dir, i) { state.profile.paceKg = paceValue(dir, i); state.profile.paceAt = dayNum(todayISO()); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  // What your workouts mean for protein: lifting (or HIIT / sports) twice a week or more, mostly cardio, or neither.
  function trainKind(t) { if (!t || !t.days || t.days < 2) return 'none'; return t.type === 'cardio' ? 'cardio' : 'strength'; }
  // [min, max, recommended] in g per kg of the reference weight. Lean mass needs a bit more per kg.
  // Recommended protein (per kg of a healthy reference weight): lifting 1.8 (2.0 while losing, to keep muscle),
  // cardio 1.6 (1.8), no regular training 1.4 (1.6). In line with ISSN / Morton 2018 (1.6 g/kg covers most lifters).
  function macroRanges(losing, lean, training) {
    if (lean === undefined) lean = !!state.profile.bodyFat;
    const kind = trainKind(training === undefined ? state.profile.training : training);
    const rec = ({ strength: losing ? 2.0 : 1.8, cardio: losing ? 1.8 : 1.6, none: losing ? 1.6 : 1.4 })[kind] + (lean ? 0.2 : 0);
    return {
      protein: lean ? [1.4, 2.6, Math.round(rec * 10) / 10] : [1.2, 2.2, rec],
      fat: [0.6, 1.2, 0.8],
      kind: kind
    };
  }
  // o: { tdee, bmr, kg, pace (snapped), goal, p: { sex, heightCm, bodyFat, macros } }. Pure.
  function planFor(o) {
    const pace = o.pace, kg = o.kg, p = o.p, goal = o.goal;
    const target = o.tdee + pace.kg * KCAL_PER_KG / 7 + (o.adjust || 0);
    let warn = '';
    if (pace.kg < 0 && Math.abs(pace.kg) > kg * 0.01) warn = 'Faster than 1% of body weight a week';
    else if (o.bmr && target < o.bmr) warn = 'Below resting burn';
    else if (target < (p.sex === 'male' ? 1500 : 1200)) warn = 'Very low for getting enough nutrients';
    let eta = '';
    if (goal && pace.kg !== 0 && (goal < kg) === (pace.kg < 0) && Math.abs(goal - kg) > 0.2) {
      const d = new Date(); d.setDate(d.getDate() + Math.round(Math.abs(goal - kg) / Math.abs(pace.kg) * 7));
      eta = 'goal by ' + fmtFuture(d);
    }
    // Protein and fat are set per kg of a reference weight. Extra body fat doesn't need extra
    // protein, so above BMI 25 we use the weight at BMI 25 for their height (unless body fat is known).
    const healthyKg = 25 * Math.pow(p.heightCm / 100, 2);
    let ref, refWhy;
    if (p.bodyFat) { ref = kg * (1 - p.bodyFat / 100); refWhy = 'your lean mass'; }
    else if (kg > healthyKg) { ref = healthyKg; refWhy = 'healthy weight for your height'; }
    else { ref = kg; refWhy = 'your weight'; }
    const m = p.macros || { protein: null, fat: null };
    const r = macroRanges(pace.kg < 0, !!p.bodyFat, p.training || null);
    const custom = m.protein != null || m.fat != null;
    const proteinPerKg = m.protein != null ? clamp(m.protein, r.protein[0], r.protein[1]) : r.protein[2];
    const fatPerKg = m.fat != null ? clamp(m.fat, r.fat[0], r.fat[1]) : r.fat[2];
    const protein = Math.round(ref * proteinPerKg / 5) * 5;
    // Recommended fat never drops below 22% of calories; a custom amount is used as set.
    let fat = Math.round((m.fat != null ? ref * fatPerKg : Math.max(ref * fatPerKg, target * 0.22 / 9)) / 5) * 5;
    // Very low targets: keep at least ~50 g carbs by easing recommended fat towards its floor (0.6 g/kg, 20% of calories).
    if (m.fat == null && target - protein * 4 - fat * 9 < 200) fat = Math.max(Math.round(Math.max(ref * 0.6, target * 0.2 / 9) / 5) * 5, Math.min(fat, Math.round((target - protein * 4 - 200) / 9 / 5) * 5));
    const carbs = Math.max(0, Math.round((target - protein * 4 - fat * 9) / 4 / 5) * 5);
    if (!warn && protein * 4 + fat * 9 > target) warn = 'Protein and fat alone are more than this target';
    return { target: target, pace: pace, warn: warn, eta: eta, protein: protein, fat: fat, carbs: carbs, ref: ref, refWhy: refWhy, proteinPerKg: proteinPerKg, fatPerKg: fatPerKg, custom: custom, kind: r.kind };
  }
  // Self-adjusting target, checked every day you open the app (at most one change every 6 days): compare the
  // last two weeks' real trend with the chosen pace. Before blaming the formula it checks your food log: if you
  // ate more (or less) than your target, that part of the gap is yours, not the formula's, and stays. The rest
  // moves the target half of the way (max ±150 kcal a week, ±600 total). Waits 2 weeks after you change your
  // goal, pace or activity. Not needed once the target runs fully on your log.
  function computeAdjust() { return onePass(computeAdjustNow); }
  function computeAdjustNow() {
    const en = activeEnergy();
    if (!state.settings.autoAdjust || !en || !(en.source === 'calc' || (en.source === 'auto' && en.w < 1))) return null;
    const today = dayNum(todayISO()), p = state.profile;
    if (p.adjustAt != null && today - p.adjustAt < 6) return null;
    if (p.paceAt != null && today - p.paceAt < 14) return null;
    const win = state.entries.filter(function (e) { return dayNum(e.date) > today - 15; });
    if (win.length < 6 || dayNum(win[win.length - 1].date) - dayNum(win[0].date) < 10) return null;
    const map = trendMap(), reg = linreg(win.map(function (e) { const d = dayNum(e.date); return { x: d, y: map[d] }; }));
    if (!reg) return null;
    const actual = reg.slope * 7, planned = currentPace().kg;
    const gap = (actual - planned) * KCAL_PER_KG / 7; // kcal a day: + means heavier than the plan expects
    // Your food log for the same two weeks (days that look fully logged).
    const lowCut = en.calc ? en.calc.tdee * 0.5 : 800;
    let n = 0, eat = 0, tgt = 0;
    for (let d = today - 14; d < today; d++) { const iso = isoFromDay(d), k = dayKcal(iso); if (!k || k < lowCut) continue; const pl = dayPlan(iso); if (!pl) continue; n++; eat += k; tgt += pl.target; }
    const over = n >= 7 ? (eat - tgt) / n : null;
    const left = over != null && Math.sign(over) === Math.sign(gap) ? (Math.abs(over) >= Math.abs(gap) ? 0 : gap - over) : gap;
    const change = Math.round(Math.max(-150, Math.min(150, -left * 0.5)) / 10) * 10;
    const plateau = planned < 0 && Math.abs(actual) < 0.1 && actual > planned;
    const why = { actual: actual, planned: planned, over: over != null ? Math.round(over) : null, plateau: plateau };
    if (Math.abs(change) < 30) return Math.abs(gap) >= 60 && over != null && left !== gap ? Object.assign({ hold: true, change: 0 }, why) : null;
    const before = p.adjustKcal, after = Math.max(-600, Math.min(600, before + change));
    return after === before ? null : Object.assign({ change: after - before, before: before, after: after }, why);
  }
  // Why the target moved (or didn't), in plain words.
  function tuneWhy(a) {
    const r = unit() === 'lb' ? 'lb' : 'kg', fmt = function (x) { return Number(Math.abs(toDisp(x)).toFixed(2)) + ' ' + r + '/week'; };
    if (a.goal) return 'You reached your goal, so your target is now maintenance.';
    if (a.hold) return (a.over > 0 ? 'You ate about ' + fmtKcal(Math.abs(a.over)) + ' kcal a day over your target' : 'You ate about ' + fmtKcal(Math.abs(a.over)) + ' kcal a day under your target') + ', which explains your weight, so the target stays. Hitting it should get you back on pace.';
    const moved = a.plateau ? 'Your weight has held steady for 2 weeks' : a.planned === 0 ? (a.actual < 0 ? 'Your weight is drifting down' : 'Your weight is drifting up') + ' (' + fmt(a.actual) + ')'
      : (Math.abs(a.actual) < Math.abs(a.planned) || Math.sign(a.actual) !== Math.sign(a.planned) ? 'You\'re ' + (a.planned < 0 ? 'losing' : 'gaining') + ' slower than your plan' : 'You\'re ' + (a.planned < 0 ? 'losing' : 'gaining') + ' faster than your plan') + ' (' + fmt(a.actual) + ' vs ' + fmt(a.planned) + ')';
    return moved + (a.over != null && Math.abs(a.over) < 60 ? ' while eating on target' : '') + ', so your burn is ' + (a.change < 0 ? 'lower' : 'higher') + ' than estimated.';
  }
  // Runs on every open: apply a due adjustment, and switch to maintenance once you reach your goal.
  function autoTune() {
    const today = dayNum(todayISO()), p = state.profile, g = state.settings.goalKg, kg = currentKg(), pace = currentPace();
    if (g && kg != null && pace.dir !== 'maintain' && state.ui.goalHit !== g && (pace.dir === 'lose' ? kg <= g : kg >= g)) {
      const was = p.paceKg;
      p.paceKg = 0; p.paceAt = today; state.ui.goalHit = g;
      state.ui.tune = { at: today, change: 0, goal: true, undoPace: was };
      save(); return state.ui.tune;
    }
    const adj = computeAdjust();
    if (!adj) return null;
    p.adjustAt = today;
    if (!adj.hold) p.adjustKcal = adj.after;
    state.ui.tune = Object.assign({ at: today }, adj);
    save(); return state.ui.tune;
  }
  function undoTune(t) {
    const p = state.profile;
    if (t.goal) { p.paceKg = t.undoPace != null ? t.undoPace : p.paceKg; } else if (!t.hold) p.adjustKcal = t.before;
    state.ui.tune = null; save(); renderAll();
  }
  function tuneToast(t) {
    if (!t) return;
    const msg = t.goal ? 'Goal reached! Your target is now maintenance' : t.hold ? 'Target kept: your food log explains your weight' : 'Target ' + (t.change > 0 ? 'raised' : 'lowered') + ' by ' + fmtKcal(Math.abs(t.change)) + ' kcal' + (t.plateau ? ' after a 2-week plateau' : '');
    toast(msg, t.hold ? function () { adjustSheet(); } : function () { undoTune(t); }, t.hold ? 'Why' : 'Undo');
  }

  // Training days. Your Activity (days a week, type, length) is already averaged into your daily burn, so a
  // training day isn't extra food: it's the same week, shared out differently. On a training day you burn one
  // whole session (plus digestion); on a rest day none. Weekly total = 7 × your normal target.
  function trainSplit() { return inPass('ts', trainSplitNow); }
  function trainSplitNow() {
    const tr = state.settings.train, c = calcEnergy(), t = state.profile.training;
    if (!tr || !tr.days.length || !c || !t.days || !c.train) return null;
    const session = c.train * 7 / tr.days.length / 0.9, avg = c.train / 0.9; // kcal; /0.9 adds digestion like the TDEE does. Shared over the days you picked, so the week always adds up
    return { days: tr.days.slice().sort(), tx: Math.round(session - avg), rx: Math.round(avg) };
  }
  // Remember today's targets whenever they change; a past day uses the targets it had.
  function recordGoal() {
    const pl = makePlan(activeEnergy()); if (!pl) return;
    const t = todayISO(), g = { k: roundKcal(pl.target), p: pl.protein, c: pl.carbs, f: pl.fat }, sp = trainSplit();
    if (sp) { g.td = sp.days; g.tx = sp.tx; g.rx = sp.rx; }
    const last = Object.keys(state.goals).filter(function (k) { return k <= t; }).sort().pop(), was = last && state.goals[last];
    if (was && was.k === g.k && was.p === g.p && was.c === g.c && was.f === g.f && String(was.td || '') === String(g.td || '') && (was.tx || 0) === (g.tx || 0) && (was.rx || 0) === (g.rx || 0)) return;
    state.goals[t] = g; save();
  }
  // Training day? Your weekly pattern (as it was then), unless you switched that day by hand.
  function isTrainDay(date, cfg) {
    const c = cfg || state.settings.train; if (!c || !c.days || !c.days.length) return false;
    const o = state.dayType[date]; if (o) return o === 't';
    return c.days.indexOf(new Date(dayNum(date) * 864e5).getUTCDay()) >= 0;
  }
  function trainOn() { return !!trainSplit(); }
  // Flexible week: the week's calories stay the same, but each day's target moves with what you actually ate
  // earlier in the week (and you can give one day more). Protein and fat stay put; the difference is carbs.
  let flexMemo = { v: -1, m: {} };
  function dayPlan(date) {
    const base = dayPlanBase(date), fx = state.settings.flex;
    if (!base || !date || !fx || !fx.on) return base;
    if (flexMemo.v !== dataVer) flexMemo = { v: dataVer, m: {} };
    if (flexMemo.m[date]) return flexMemo.m[date];
    const D = dayNum(date), ws = weekStart(D), today = dayNum(todayISO()), extra = fx.extra || 0, big = fx.big;
    const bt = [], w = [];
    onePass(function () { for (let i = 0; i < 7; i++) { const pl = dayPlanBase(isoFromDay(ws + i)); bt.push(pl ? pl.target : base.target); } });
    const hasBig = big != null && extra > 0;
    for (let i = 0; i < 7; i++) { const isBig = hasBig && new Date((ws + i) * 864e5).getUTCDay() === big; w.push(bt[i] + (hasBig ? (isBig ? extra : -extra / 6) : 0)); }
    const W = bt.reduce(function (a, x) { return a + x; }, 0);
    let used = 0, restW = 0;
    for (let i = 0; i < 7; i++) {
      const d = ws + i;
      if (d < D) { const k = d < today ? dayTotals(isoFromDay(d)).kcal : 0; used += d < today && k > 0 ? k : w[i]; } // days not logged count as on plan
      else restW += w[i];
    }
    const i0 = D - ws, raw = restW > 0 ? w[i0] * (W - used) / restW : w[i0];
    const floor = state.profile.sex === 'male' ? 1500 : 1200;
    const tgt = Math.round(Math.max(floor, Math.min(bt[i0] * 1.35, Math.max(bt[i0] * 0.75, raw))) / 10) * 10, dk = tgt - base.target;
    const out = Object.assign({}, base, { target: tgt, carbs: Math.max(0, Math.round((base.carbs + dk / 4) / 5) * 5), flex: Math.round(dk) });
    flexMemo.m[date] = out;
    return out;
  }
  function dayPlanBase(date) {
    const pl0 = dayPlanCore(date), md = date && state.dayMode && state.dayMode[date];
    if (!pl0 || !md) return pl0;
    // Refeed / diet break: eat at maintenance that day. Refeeds add the difference as carbs; breaks split it.
    const en = activeEnergy(); if (!en) return pl0;
    const live = livePlan(), maint = en.tdee + (live && live.adjust || 0), dk = Math.round((maint - (live ? live.target : pl0.target)) / 10) * 10;
    if (dk <= 0) return Object.assign({}, pl0, { mode: md });
    return Object.assign({}, pl0, { target: pl0.target + dk, carbs: Math.round((pl0.carbs + (md === 'f' ? dk / 4 : dk / 8)) / 5) * 5, fat: md === 'b' ? Math.round(pl0.fat + dk / 18) : pl0.fat, mode: md });
  }
  function dayPlanCore(date) {
    const live = livePlan();
    let base = live, sp = trainSplit();
    if (date && date < todayISO()) {
      const keys = inPass('gk', function () { return Object.keys(state.goals).sort(); });
      let k = null; for (let i = keys.length - 1; i >= 0; i--) if (keys[i] <= date) { k = keys[i]; break; }
      if (k) { const g = state.goals[k]; base = Object.assign({}, live || {}, { target: g.k, protein: g.p, carbs: g.c, fat: g.f, past: true }); sp = g.td ? { days: g.td, tx: g.tx, rx: g.rx } : null; }
      else sp = null; // from before targets were remembered: no training days back then
    }
    if (!base || !date || !sp) return base;
    // The difference is all carbs (protein and fat stay put).
    const on = isTrainDay(date, sp), dk = on ? sp.tx : -sp.rx;
    const carbs = Math.max(0, Math.round((base.carbs + dk / 4) / 5) * 5);
    return Object.assign({}, base, { target: base.target + dk, carbs: carbs, train: on });
  }
  function makePlan(en) {
    if (!en) return null;
    const adjust = en.source === 'calc' && state.settings.autoAdjust ? state.profile.adjustKcal : 0;
    const plan = planFor({ tdee: en.tdee, bmr: en.calc ? en.calc.bmr : null, kg: en.kg, pace: currentPace(), goal: state.settings.goalKg, p: state.profile, adjust: adjust });
    plan.adjust = adjust;
    plan.learned = en.source === 'auto' && en.calc ? Math.round(en.tdee - en.calc.tdee) : 0;
    return plan;
  }

