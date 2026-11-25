  function foodStreak() {
    const ds = Object.keys(state.food).filter(function (k) { return state.food[k].some(function (it) { return !it.plan; }); }).sort();
    if (!ds.length) return 0;
    const has = {}; ds.forEach(function (k) { has[dayNum(k)] = 1; });
    const today = dayNum(todayISO()), first = dayNum(ds[0]), used = {};
    let d = has[today] ? today : today - 1, n = 0, prevMiss = false;
    while (d >= first) {
      if (has[d]) { n++; prevMiss = false; }
      else { const w = weekStart(d); if (prevMiss || used[w] || !n) break; used[w] = 1; prevMiss = true; }
      d--;
    }
    return n;
  }
  function repOn(r, iso) { return !r.days.length || r.days.indexOf(new Date(dayNum(iso) * 864e5).getUTCDay()) >= 0; }
  function repItemId(r, iso) { return 'rp' + r.id + iso.replace(/-/g, ''); }
  function applyRepeats() {
    if (!state.repeats || !state.repeats.length) return 0;
    const t = todayISO(), list = state.food[t] || [], add = [];
    state.repeats.forEach(function (r) { if (r.paused && r.until && r.until <= t) { r.paused = false; r.until = null; r.u = Date.now(); } });
    state.repeats.forEach(function (r) {
      if (r.paused || !repOn(r, t)) return;
      const id = repItemId(r, t);
      if (list.some(function (x) { return x.id === id; }) || (state.del && state.del[id])) return;
      if (MEALS.every(function (m) { return m[0] !== r.meal; })) return;
      if (r.time && nowHM() < r.time) return; // added when its time comes
      add.push(Object.assign({}, r.item, { id: id, meal: r.meal, rep: r.id }, r.time ? { t: r.time } : {}));
    });
    if (!add.length) return 0;
    state.food[t] = list.concat(add); save();
    return add.length;
  }
  function dayScore(d) {
    const plan = dayPlan(d), tt = dayTotals(d); if (!plan || !tt.kcal) return null;
    const tgt = roundKcal(plan.target), parts = [];
    const off = Math.abs(tt.kcal - tgt) / tgt;
    parts.push({ k: 'kcal', label: 'Calories', max: 40, pts: 40 * Math.max(0, Math.min(1, (0.3 - off) / 0.25)), note: fmtKcal(tt.kcal) + ' of ' + fmtKcal(tgt) + ' kcal' });
    parts.push({ k: 'p', label: 'Protein', max: 30, pts: 30 * Math.min(1, plan.protein ? tt.protein / plan.protein : 1), note: tt.protein + ' of ' + plan.protein + ' g' });
    if (foodDB) {
      const nd = dayNutrients(d), tg = nutTargets(d), fmin = tg.fib && tg.fib.min || 25;
      if (nd.cov.fib > 0.6) parts.push({ k: 'fib', label: 'Fiber', max: 15, pts: 15 * Math.min(1, nd.tot.fib / fmin), note: Math.round(nd.tot.fib) + ' of ' + Math.round(fmin) + ' g' });
    }
    const bal = function (v, t) { return t ? Math.max(0, 1 - Math.max(0, Math.abs(v - t) / t - 0.15) / 0.35) : 1; };
    parts.push({ k: 'bal', label: 'Carbs and fat', max: 15, pts: 15 * (bal(tt.carbs, plan.carbs) + bal(tt.fat, plan.fat)) / 2, note: 'C ' + tt.carbs + ' / ' + plan.carbs + ' g · F ' + tt.fat + ' / ' + plan.fat + ' g' });
    const max = parts.reduce(function (a, x) { return a + x.max; }, 0), score = Math.round(parts.reduce(function (a, x) { return a + x.pts; }, 0) / max * 100);
    return { score: score, grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D', parts: parts };
  }