  function weekReview(start) { return onePass(function () { return weekReviewNow(start); }); }
  function weekReviewNow(start) {
    const days = [], today = dayNum(todayISO());
    for (let d = start; d < start + 7 && d <= today; d++) { const iso = isoFromDay(d), t = dayTotals(iso), pl = dayPlan(iso); if (t.kcal > 0) days.push({ iso: iso, t: t, tg: pl ? roundKcal(pl.target) : null, p: pl ? pl.protein : null, train: pl && pl.train }); }
    if (!days.length) return null;
    const avg = function (k) { return Math.round(days.reduce(function (a, x) { return a + x.t[k]; }, 0) / days.length); };
    const withT = days.filter(function (x) { return x.tg; }), best = withT.slice().sort(function (a, b) { return Math.abs(a.t.kcal - a.tg) - Math.abs(b.t.kcal - b.tg); })[0];
    const w = weekStats(start), wp = weekStats(start - 7);
    return { start: start, n: days.length, kcal: avg('kcal'), protein: avg('protein'), tg: withT.length ? Math.round(withT.reduce(function (a, x) { return a + x.tg; }, 0) / withT.length) : null, pg: withT.length ? Math.round(withT.reduce(function (a, x) { return a + (x.p || 0); }, 0) / withT.length) : null, best: best, onTarget: withT.filter(function (x) { return Math.abs(x.t.kcal - x.tg) <= x.tg * 0.1; }).length, train: days.filter(function (x) { return x.train; }).length, dw: w && wp ? w.avg - wp.avg : null };
  }