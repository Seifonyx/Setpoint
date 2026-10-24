  /* ================= Weight maths ================= */
  // A run of days worked out in one go (a streak over months, two weeks of nutrients, a chart) shares the
  // things that can't change in between: today's trend, burn and plan are worked out once, not once a day.
  // Only for reading: nothing in a pass changes your data.
  let pass = null;
  function onePass(fn) { if (pass) return fn(); pass = {}; try { return fn(); } finally { pass = null; } }
  function inPass(k, fn) { if (!pass) return fn(); if (!(k in pass)) pass[k] = fn(); return pass[k]; }
  function entries() { return state.entries; }
  function findEntry(date) {
    if (pass) { const m = inPass('ent', function () { const o = {}; state.entries.forEach(function (e) { if (!o[e.date]) o[e.date] = e; }); return o; }); return m[date] || null; }
    return state.entries.find(function (e) { return e.date === date; }) || null;
  }
  function upsert(entry) {
    const i = state.entries.findIndex(function (e) { return e.date === entry.date; });
    if (i >= 0) state.entries[i] = entry; else state.entries.push(entry);
    state.entries.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  }
  // Trend weight: each day moves the trend 20% of the way towards that day's weight (lag similar to a
  // 7-day average, but smooth and gap-proof). Days without a weigh-in use a straight line between the
  // weigh-ins either side, and a single day can't pull it by more than 1.5 kg, so water spikes barely show.
  const TREND_ALPHA = 0.2, SPIKE_CAP = 1.5;
  let trendCache = { sig: null, map: null };
  function trendMap() { return inPass('tm', trendMapNow); }
  function trendMapNow() {
    const l = state.entries; let h = 0;
    for (let i = 0; i < l.length; i++) h = (h * 31 + dayNum(l[i].date) * 7 + Math.round(l[i].kg * 1000)) % 2147483647; // cheap fingerprint
    const sig = l.length + ':' + h;
    if (trendCache.sig === sig) return trendCache.map;
    const map = {};
    if (l.length) {
      let t = l[0].kg;
      map[dayNum(l[0].date)] = t;
      for (let i = 1; i < l.length; i++) {
        const a = l[i - 1], b = l[i], da = dayNum(a.date), db = dayNum(b.date);
        for (let d = da + 1; d <= db; d++) {
          const w = a.kg + (b.kg - a.kg) * (d - da) / (db - da);
          t += TREND_ALPHA * Math.max(-SPIKE_CAP, Math.min(SPIKE_CAP, w - t));
        }
        map[db] = t;
      }
    }
    trendCache = { sig: sig, map: map };
    return map;
  }
  // Trend on the latest weigh-in day at or before `day`.
  function trendAt(day) {
    const map = trendMap(), l = state.entries;
    for (let i = l.length - 1; i >= 0; i--) { const d = dayNum(l[i].date); if (d <= day) return map[d]; }
    return null;
  }
  function withTrend() { const map = trendMap(); return state.entries.map(function (e) { const d = dayNum(e.date); return { date: e.date, kg: e.kg, note: e.note, kcal: e.kcal, day: d, trend: map[d] }; }); }
  function linreg(points) {
    const n = points.length;
    if (n < 2) return null;
    let sx = 0, sy = 0, sxy = 0, sxx = 0;
    points.forEach(function (p) { sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x; });
    const den = n * sxx - sx * sx;
    if (den === 0) return null;
    const slope = (n * sxy - sx * sy) / den;
    return { slope: slope, intercept: (sy - slope * sx) / n };
  }
  function currentPhase() { return state.phases.length ? state.phases[state.phases.length - 1] : null; }
  function trend() {
    const p = currentPhase();
    const list = p ? state.entries.filter(function (e) { return e.date >= p.date; }) : state.entries;
    if (list.length < 2) return null;
    const reg = linreg(list.map(function (e) { return { x: dayNum(e.date), y: e.kg }; }));
    return reg ? { perDay: reg.slope, perWeek: reg.slope * 7, first: list[0] } : null;
  }
  function currentKg() { return inPass('kg', function () { const l = state.entries; return l.length ? trendAt(dayNum(l[l.length - 1].date)) : null; }); }


  // Calories for a day: the food log if there is one, otherwise the single total saved with the weigh-in.
  function foodFor(date) { return state.food[date] || []; }
  // What counts towards a day: food you ate. Planned food only counts on days still to come (to plan them).
  const PLAN_DAYS = 14;
  function counts(f, date) { return !f.plan || date > todayISO(); }
  function eatenFor(date) { const l = foodFor(date); return date > todayISO() ? l.slice() : l.filter(function (f) { return !f.plan; }); }
  function plannedFor(date) { return date > todayISO() ? [] : foodFor(date).filter(function (f) { return f.plan; }); }
  function dayTotals(date) {
    const items = eatenFor(date);
    if (items.length) { let k = 0, p = 0, c = 0, f = 0; for (let i = 0; i < items.length; i++) { const x = items[i]; k += x.kcal || 0; p += x.protein || 0; c += x.carbs || 0; f += x.fat || 0; } return { kcal: k, protein: p, carbs: c, fat: f, fromLog: true }; }
    const e = findEntry(date);
    return { kcal: e && e.kcal ? e.kcal : 0, protein: 0, carbs: 0, fat: 0, fromLog: false };
  }
  function dayKcal(date) { return dayTotals(date).kcal || null; }

  // Weeks start on your chosen day (Friday unless changed). Days are dayNum() values.
  function weekStart(day) { const ws = state && state.settings && state.settings.weekStart != null ? state.settings.weekStart : 5; return day - ((new Date(day * 864e5).getUTCDay() - ws + 7) % 7); }
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function weekOrder() { const ws = state.settings.weekStart; return [0, 1, 2, 3, 4, 5, 6].map(function (i) { return (ws + i) % 7; }); }
  function weekStats(start) {
    const es = state.entries.filter(function (e) { const d = dayNum(e.date); return d >= start && d <= start + 6; });
    if (!es.length) return null;
    const today = dayNum(todayISO()), kc = [];
    for (let d = start; d <= start + 6 && d < today; d++) { const k = dayKcal(isoFromDay(d)); if (k) kc.push(k); }
    let lo = es[0].kg, hi = es[0].kg;
    es.forEach(function (e) { lo = Math.min(lo, e.kg); hi = Math.max(hi, e.kg); });
    return {
      start: start, n: es.length, lo: lo, hi: hi,
      avg: es.reduce(function (a, e) { return a + e.kg; }, 0) / es.length,
      kcal: kc.length ? kc.reduce(function (a, k) { return a + k; }, 0) / kc.length : null
    };
  }
  function weekRange(start) {
    const a = isoFromDay(start), b = isoFromDay(start + 6);
    return fmtDate(a) + ' – ' + (a.slice(5, 7) === b.slice(5, 7) ? parseISO(b).getDate() : fmtDate(b));
  }
  function deltaChip(kg, goodWhenDown) {
    const flat = Math.abs(toDisp(kg)) < 0.05;
    const good = !flat && goodWhenDown != null && (kg < 0) === goodWhenDown;
    return '<span class="delta-chip' + (good ? ' good' : '') + '">' + (flat ? 'Steady' : (kg < 0 ? ARROW_DOWN : ARROW_UP) + fmtW(Math.abs(kg)) + ' ' + unit()) + '</span>';
  }
  // Which direction counts as progress: towards the goal, or the chosen pace.
  function goodWhenDown() {
    const g = state.settings.goalKg, now = currentKg();
    if (g && now != null && Math.abs(g - now) > 0.3) return g < now;
    const p = state.profile.paceKg;
    return p ? p < 0 : null;
  }

