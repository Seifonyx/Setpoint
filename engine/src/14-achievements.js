  var photos = []; // progress photos stay in the app's own file
  function achievements() { return onePass(achievementsNow); }
  function achievementsNow() {
    const days = Object.keys(state.food).filter(function (k) { return state.food[k].some(function (it) { return !it.plan; }); }).sort();
    const has = {}; days.forEach(function (k) { has[dayNum(k)] = 1; });
    let best = 0, run = 0, prevMiss = false, used = {};
    if (days.length) for (let d = dayNum(days[0]); d <= dayNum(todayISO()); d++) {
      if (has[d]) { run++; prevMiss = false; if (run > best) best = run; }
      else { const w = weekStart(d); if (!prevMiss && !used[w] && run) { used[w] = 1; prevMiss = true; } else { run = 0; prevMiss = false; used = {}; } }
    }
    const nFoods = days.reduce(function (a, k) { return a + state.food[k].filter(function (it) { return !it.plan; }).length; }, 0);
    const inRow = function (test, back) { let r = 0, mx = 0; for (let i = back; i >= 1; i--) { const iso = isoFromDay(dayNum(todayISO()) - i); if (test(iso)) { r++; if (r > mx) mx = r; } else r = 0; } return mx; };
    // each day's food and plan, worked out once for both protein and calories (days with no food can't count)
    const hit = {}, dayHit = function (iso) { if (!hit[iso]) { const t = dayTotals(iso), pl = t.kcal > 0 ? dayPlan(iso) : null; hit[iso] = { p: !!pl && t.protein >= pl.protein, k: !!pl && t.kcal >= pl.target * 0.9 && t.kcal <= pl.target * 1.1 }; } return hit[iso]; };
    const protRow = inRow(function (iso) { return dayHit(iso).p; }, 180);
    const waterRow = inRow(function (iso) { return waterTotal(iso) >= waterGoal(); }, 180);
    const kcalRow = inRow(function (iso) { return dayHit(iso).k; }, 180);
    // How far from your first weigh-in to your goal you've come, on the trend.
    const goalPct = (function () { const g = state.settings.goalKg, l = state.entries, cur = currentKg(); if (!g || !l.length || cur == null) return null; const st = l[0].kg, span = st - g; return span ? (st - cur) / span * 100 : 100; })();
    let allMicros = false;
    if (foodDB) for (let i = 0; i < 120 && !allMicros; i++) { const iso = isoFromDay(dayNum(todayISO()) - i); if (!foodFor(iso).length || dayNeedsDB(iso)) continue; const nd = dayNutrients(iso); if (nd.items < 3) continue; const mm = microsMet(nd, nutTargets(iso)); if (mm && mm.of && mm.met >= mm.of) allMicros = true; }
    const es = state.entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    const avg = function (l) { return l.reduce(function (a, e) { return a + e.kg; }, 0) / l.length; };
    let change = 0; if (es.length >= 10) { const first = avg(es.slice(0, 5)); let lo = first, hi = first; for (let i = 5; i <= es.length; i++) { const v = avg(es.slice(i - 5, i)); lo = Math.min(lo, v); hi = Math.max(hi, v); } change = state.settings.goalKg && state.settings.goalKg > first ? hi - first : first - lo; }
    const gaining = state.settings.goalKg && es.length && state.settings.goalKg > es[0].kg;
    const kgs = function (k) { return unit() === 'lb' ? Math.round(k * 2.2046) + ' lb' : k + ' kg'; };
    return [
      { t: 'First food logged', got: nFoods > 0, p: '' },
      { t: '7-day streak', got: best >= 7, p: Math.min(best, 7) + '/7' }, { t: '30-day streak', got: best >= 30, p: Math.min(best, 30) + '/30' }, { t: '100-day streak', got: best >= 100, p: Math.min(best, 100) + '/100' },
      { t: '100 foods logged', got: nFoods >= 100, p: Math.min(nFoods, 100) + '/100' }, { t: '1,000 foods logged', got: nFoods >= 1000, p: Math.min(nFoods, 1000) + '/1000' },
      { t: 'Protein target 7 days in a row', got: protRow >= 7, p: Math.min(protRow, 7) + '/7' }, { t: 'Water goal 7 days in a row', got: waterRow >= 7, p: Math.min(waterRow, 7) + '/7' },
      { t: '30 weigh-ins', got: es.length >= 30, p: Math.min(es.length, 30) + '/30' },
      { t: (gaining ? 'First ' : 'First ') + kgs(1) + (gaining ? ' gained' : ' lost'), got: change >= 1, p: '' }, { t: kgs(5) + (gaining ? ' gained' : ' lost'), got: change >= 5, p: '' }, { t: kgs(10) + (gaining ? ' gained' : ' lost'), got: change >= 10, p: '' },
      { t: 'First recipe', got: state.recipes.length > 0, p: '' }, { t: 'First meal saved', got: state.meals.length > 0, p: '' },
      { t: 'First barcode scanned', got: state.offFoods.length > 0 || days.some(function (k) { return state.food[k].some(function (it) { return it.ref && /^(o|ub)/.test(it.ref); }); }), p: '' },
      { t: 'First progress photo', got: photos.length > 0, p: '' },
      { t: '5% of the way to your goal', got: goalPct >= 5, p: goalPct != null && goalPct < 5 ? Math.max(0, Math.round(goalPct)) + '%' : '' },
      { t: 'Halfway to your goal', got: goalPct >= 50, p: goalPct != null && goalPct < 50 ? Math.max(0, Math.round(goalPct)) + '%' : '' },
      { t: 'Goal reached', got: goalPct >= 100, p: goalPct != null && goalPct < 100 ? Math.max(0, Math.round(goalPct)) + '%' : '' },
      { t: 'Calories on target 7 days in a row', got: kcalRow >= 7, p: Math.min(kcalRow, 7) + '/7' },
      { t: 'Protein target 30 days in a row', got: protRow >= 30, p: Math.min(protRow, 30) + '/30' },
      { t: 'First refeed or diet break', got: Object.keys(state.dayMode || {}).some(function (k) { return k <= todayISO(); }), p: '' },
      { t: 'Every vitamin and mineral in one day', got: allMicros, p: '' }
    ];
  }