  function cycleWindows() {
    const c = state.settings.cycle; if (!c || !c.on || !c.starts.length) return [];
    const st = c.starts.map(dayNum).sort(function (a, b) { return a - b; }), gaps = [];
    for (let i = 1; i < st.length; i++) { const g = st[i] - st[i - 1]; if (g >= 21 && g <= 40) gaps.push(g); }
    const len = gaps.length ? Math.round(gaps.reduce(function (a, x) { return a + x; }, 0) / gaps.length) : 28;
    const out = st.map(function (d) { return { a: d - 5, b: d + 2 }; });
    let nx = st[st.length - 1] + len; const today = dayNum(todayISO()); while (nx < today - 2) nx += len;
    out.push({ a: nx - 5, b: nx + 2, guess: true });
    return out;
  }
  function inCycleWindow(day) { return cycleWindows().find(function (w) { return day >= w.a && day <= w.b; }) || null; }
  function prayerTimes(date, lat, lon, fajrAngle) {
    const R = Math.PI / 180, sin = function (x) { return Math.sin(x * R); }, cos = function (x) { return Math.cos(x * R); };
    const asin = function (x) { return Math.asin(x) / R; }, acos = function (x) { return Math.acos(Math.max(-1, Math.min(1, x))) / R; }, atan2 = function (y, x) { return Math.atan2(y, x) / R; };
    const fix = function (a, b) { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
    const y = date.getFullYear(), mo = date.getMonth() + 1, dd = date.getDate();
    let Y = y, M = mo; if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4), jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + dd + B - 1524.5 - lon / (15 * 24);
    const sun = function (j) { const D = j - 2451545, g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360), L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360), e = 23.439 - 0.00000036 * D, RA = fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24); return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - RA }; };
    const at = function (angle, t, ccw) { const s0 = sun(jd + t / 24), noon = fix(12 - s0.eqt, 24), T = acos((-sin(angle) - sin(s0.decl) * sin(lat)) / (cos(s0.decl) * cos(lat))) / 15; return noon + (ccw ? -T : T); };
    let f = at(fajrAngle, 5, true), m = at(0.833, 18, false); f = at(fajrAngle, f, true); m = at(0.833, m, false);
    const tz = -new Date(y, mo - 1, dd, 12).getTimezoneOffset() / 60, toDate = function (h) { h = h + tz - lon / 15; return new Date(y, mo - 1, dd, 0, Math.round(h * 60)); };
    return { fajr: toDate(f), maghrib: toDate(m) };
  }
  const RAM_CITIES = [['Cairo', 30.0444, 31.2357, 19.5], ['Giza', 30.0131, 31.2089, 19.5], ['Alexandria', 31.2001, 29.9187, 19.5], ['Mansoura', 31.0409, 31.3785, 19.5], ['Tanta', 30.7865, 31.0004, 19.5], ['Port Said', 31.2653, 32.3019, 19.5], ['Suez', 29.9668, 32.5498, 19.5], ['Ismailia', 30.5965, 32.2715, 19.5], ['Asyut', 27.1809, 31.1837, 19.5], ['Luxor', 25.6872, 32.6396, 19.5], ['Aswan', 24.0889, 32.8998, 19.5], ['Hurghada', 27.2579, 33.8116, 19.5], ['Sharm El Sheikh', 27.9158, 34.33, 19.5],
    ['Riyadh', 24.7136, 46.6753, 18.5], ['Jeddah', 21.4858, 39.1925, 18.5], ['Mecca', 21.3891, 39.8579, 18.5], ['Medina', 24.5247, 39.5692, 18.5], ['Dammam', 26.4207, 50.0888, 18.5], ['Dubai', 25.2048, 55.2708, 18.2], ['Abu Dhabi', 24.4539, 54.3773, 18.2], ['Kuwait City', 29.3759, 47.9774, 18], ['Doha', 25.2854, 51.531, 18], ['Amman', 31.9454, 35.9284, 18], ['London', 51.5074, -0.1278, 18]];
  function fmtNum(v) { return Math.round(v).toLocaleString(); }
  function weightInsights() {
    const wBy = {}; state.entries.forEach(function (e) { wBy[dayNum(e.date)] = e.kg; });
    const rows = [];
    Object.keys(wBy).forEach(function (k) {
      const d = +k; if (wBy[d + 1] == null) return;
      const iso = isoFromDay(d), t = dayTotals(iso); if (!t.kcal || t.kcal < 600) return;
      const r = { delta: wBy[d + 1] - wBy[d], kcal: t.kcal, carbs: t.carbs };
      if (foodDB) { const nd = dayNutrients(iso); if (nd.cov.na > 0.7 && nd.tot.na > 0) r.na = nd.tot.na; if (nd.cov.fib > 0.7 && nd.tot.fib > 0) r.fib = nd.tot.fib; }
      const pl = dayPlan(iso); if (pl && pl.train != null) r.train = pl.train;
      rows.push(r);
    });
    const out = { n: rows.length, items: [] };
    if (rows.length < 14) return out;
    const avg = function (l, k) { return l.reduce(function (a, x) { return a + x[k]; }, 0) / l.length; };
    const split = function (key, label, unitTxt, note) {
      const r = rows.filter(function (x) { return x[key] != null; }).sort(function (a, b) { return a[key] - b[key]; });
      if (r.length < 12) return;
      const n = Math.floor(r.length / 3), lo = r.slice(0, n), hi = r.slice(-n), d = avg(hi, 'delta') - avg(lo, 'delta');
      out.items.push({ t: label, d: d, s: 'After days over ' + fmtNum(avg(hi, key)) + unitTxt + ' vs under ' + fmtNum(avg(lo, key)) + unitTxt, note: Math.abs(d) >= 0.15 ? note : 'No clear effect for you so far.' });
    };
    split('na', 'Salty days', ' mg sodium', 'That\'s water, not fat. It usually leaves in 1–3 days.');
    split('carbs', 'High-carb days', ' g carbs', 'Carbs are stored with water, so the scale jumps. It isn\'t fat.');
    split('fib', 'High-fiber days', ' g fiber', 'Fiber adds food and water still in your gut. It isn\'t fat, and it shows up as a stall until it passes.');
    split('kcal', 'Bigger eating days', ' kcal', 'Mostly food and water still in you. Real fat change shows over weeks, not overnight.');
    const tr = rows.filter(function (x) { return x.train === true; }), rs = rows.filter(function (x) { return x.train === false; });
    if (tr.length >= 5 && rs.length >= 5) { const d = avg(tr, 'delta') - avg(rs, 'delta'); out.items.push({ t: 'Training days', d: d, s: 'Next morning after training vs rest days', note: Math.abs(d) >= 0.15 ? 'Muscles hold extra water after training while they repair.' : 'No clear effect for you so far.' }); }
    // Weeks: average calories against how the trend moved.
    const wk = {}; Object.keys(state.food).forEach(function (iso) { const t = dayTotals(iso).kcal; if (t < 600) return; const w = weekStart(dayNum(iso)); (wk[w] = wk[w] || []).push(t); });
    const pts = Object.keys(wk).map(Number).filter(function (w) { return wk[w].length >= 4 && trendAt(w) != null && trendAt(w + 7) != null; }).map(function (w) { return { k: wk[w].reduce(function (a, x) { return a + x; }, 0) / wk[w].length, ch: trendAt(w + 7) - trendAt(w) }; });
    if (pts.length >= 4) {
      const mk = avg(pts, 'k'), mc = avg(pts, 'ch'); let num = 0, den = 0; pts.forEach(function (p) { num += (p.k - mk) * (p.ch - mc); den += (p.k - mk) * (p.k - mk); });
      const slope = den ? num / den : 0, even = slope ? mk - mc / slope : null;
      if (slope > 0 && even && even > 800 && even < 5000) out.items.push({ t: 'Your weekly balance', d: slope * 500, s: 'Each extra 500 kcal a day moved your trend about ' + fmtDelta(toDisp(slope * 500), 2) + ' ' + unit() + ' a week', note: 'From ' + pts.length + ' weeks, you hold steady at about ' + fmtKcal(Math.round(even / 10) * 10) + ' kcal a day.', week: true });
    }
    return out;
  }