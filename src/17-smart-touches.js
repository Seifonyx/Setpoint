  /* ================= Smart touches ================= */
  // One gentle nudge on today's diary in the evening, when something important is clearly short.
  function diaryHint() {
    if (viewDay !== todayISO()) return '';
    const off = state.ui.hintOff && state.ui.hintOff.d === viewDay ? state.ui.hintOff.k : [], shown = function (x) { return off.indexOf(x.key) < 0; };
    const hx = function (k) { return '<button type="button" class="hint-x" data-hint-x="' + k + '" aria-label="Hide for today"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button>'; };
    // Over a limit today (sodium, saturated fat, caffeine, or a lot of sugar): say so any time of day.
    if (!dayNeedsDB(viewDay) && foodFor(viewDay).some(function (it) { return it.ref || it.mid; })) {
      const nd = dayNutrients(viewDay), tg = nutTargets(viewDay), kc = tg.kcal ? tg.kcal.min : 2000, over = [];
      [['na', 'Sodium', 'mg'], ['sat', 'Saturated fat', 'g'], ['caff', 'Caffeine', 'mg']].forEach(function (x) { const t = tg[x[0]]; if (t && t.max && nd.tot[x[0]] > t.max && nd.cov[x[0]] > 0.5) over.push({ key: x[0], t: x[1] + ' is over today\'s max', s: fmtNut(nd.tot[x[0]], x[2]) + ' of ' + fmtNut(t.max, x[2]) + ' · see where it came from', r: nd.tot[x[0]] / t.max }); });
      const sugMax = Math.round(kc * 0.2 / 4); if (nd.tot.sug > sugMax && nd.cov.sug > 0.5) over.push({ key: 'sug', t: 'Lots of sugar today', s: Math.round(nd.tot.sug) + ' g so far (about ' + sugMax + ' g is a lot for you) · see where it came from', r: nd.tot.sug / sugMax });
      const ov = over.filter(shown);
      if (ov.length) {
        const w = ov.sort(function (a, b) { return b.r - a.r; })[0];
        return '<div class="card hint-card warn" role="button" tabindex="0" data-src="' + w.key + '"><span class="hint-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg></span><span class="grow"><b>' + w.t + '</b><span>' + w.s + '</span></span>' + hx(w.key) + '</div>';
      }
    }
    if (new Date().getHours() < 17) return '';
    const plan = dayPlan(viewDay), tt = dayTotals(viewDay);
    if (!plan || tt.kcal < plan.target * 0.4) return '';
    const short = [];
    if (tt.protein < plan.protein * 0.6) short.push({ key: 'p', label: 'Protein', gap: Math.round(plan.protein - tt.protein) + ' g' });
    if (!dayNeedsDB(viewDay) && foodFor(viewDay).some(function (it) { return it.ref; })) {
      const nd = dayNutrients(viewDay), tg = nutTargets(viewDay);
      if (nd.cov.fib > 0.8 && nd.tot.fib < tg.fib.min * 0.5) short.push({ key: 'fib', label: 'Fiber', gap: Math.round(tg.fib.min - nd.tot.fib) + ' g' });
    }
    const sh = short.filter(shown);
    if (!sh.length) return '';
    const s = sh[0];
    return '<div class="card hint-card" role="button" tabindex="0" data-high="' + s.key + '"><span class="hint-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/></svg></span>' +
      '<span class="grow"><b>' + s.label + ' is ' + s.gap + ' short today</b><span>See foods that would fill it</span></span>' + hx(s.key) + '</div>';
  }
  // Weekly check-in: how eating went that week.
  function weekNutrition(start) { return onePass(function () { return weekNutritionNow(start); }); }
  function weekNutritionNow(start) {
    const tg = nutTargets(), days = [];
    for (let d = start; d < start + 7; d++) { const iso = isoFromDay(d); if (iso > todayISO()) break; const t = dayTotals(iso); if (t.kcal > 0) days.push(iso); }
    if (days.length < 3) return '';
    const avg = Math.round(days.reduce(function (a, d) { return a + dayTotals(d).kcal; }, 0) / days.length);
    let low = '';
    if (foodDB) {
      const nds = days.map(dayNutrients), lows = [];
      MICROS.concat(['fib']).forEach(function (k) {
        if (!tg[k] || !tg[k].min) return;
        const cov = nds.reduce(function (a, x) { return a + x.cov[k]; }, 0) / nds.length; if (cov < 0.7) return;
        const pct = nds.reduce(function (a, x) { return a + x.tot[k]; }, 0) / nds.length / tg[k].min * 100;
        if (pct < 75) lows.push([pct, NUT[k].label]);
      });
      lows.sort(function (a, b) { return a[0] - b[0]; });
      if (lows.length) low = ' Often low on ' + lows.slice(0, 2).map(function (x) { return x[1].toLowerCase().replace(/^vitamin/, 'vitamin'); }).join(' and ') + '.';
    }
    // That week's own targets (they may have changed since).
    const tgs = days.map(function (d) { const pl = dayPlan(d); return pl ? roundKcal(pl.target) : null; }).filter(Boolean), tAvg = tgs.length ? roundKcal(tgs.reduce(function (a, x) { return a + x; }, 0) / tgs.length) : null;
    const pc = tAvg ? Math.round(avg / tAvg * 100) : null;
    return '<div class="card wk-food-card"><div class="tg-row"><div class="tg-line"><span class="tg-l"><b>Calories</b> – ' + fmtKcal(avg) + (tAvg ? ' / ' + fmtKcal(tAvg) : '') + ' a day</span>' + (pc != null ? '<span class="tg-pc num">' + pc + '%</span>' : '') + '</div>' + (pc != null ? '<div class="bar tg-bar"><i class="mb-k' + (pc > 105 ? ' over' : '') + '" style="width:' + Math.min(100, pc) + '%"></i></div>' : '') + '</div>' +
      '<p class="wk-food">' + days.length + ' of 7 days logged.' + low + '</p></div>';
  }

  function foodItemSheet(id, date) {
    const d = date || viewDay, f = foodFor(d).find(function (x) { return x.id === id; });
    if (!f) return;
    if (f.ref && f.ref.charAt(0) === 'r' && (f.rc || state.recipes.some(function (x) { return x.id === f.ref; }))) return addFoodSheet(null, d, f, null, true);
    if (f.ref && (itemNeedsDB(f) || itemFood(f))) return addFoodSheet(null, d, f);
    if (f.mid && (f.mi || state.meals.some(function (x) { return x.id === f.mid; }))) return addFoodSheet(null, d, f, null, true);
    let ml = f.meal;
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">' + editTitle(d) + '</h2>' + '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>' + '</div>' +
      '<div class="meal-chips" id="feMeal">' + MEALS.map(function (m) { return '<button type="button" data-v="' + m[0] + '" aria-pressed="' + (m[0] === ml) + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      '<div class="field"><input class="input" id="feN" maxlength="40" placeholder="Name" aria-label="Name" autocomplete="off" value="' + esc(f.name) + '" /></div>' +
      '<div class="four-in">' +
        '<div class="field sfx"><input class="input" id="feK" inputmode="numeric" maxlength="5" aria-label="Calories" value="' + f.kcal + '" /><em>kcal</em></div>' +
        '<div class="field sfx"><input class="input" id="feP" inputmode="numeric" maxlength="3" aria-label="Protein" value="' + f.protein + '" /><em>g P</em></div>' +
        '<div class="field sfx"><input class="input" id="feC" inputmode="numeric" maxlength="3" aria-label="Carbs" value="' + f.carbs + '" /><em>g C</em></div>' +
        '<div class="field sfx"><input class="input" id="feF" inputmode="numeric" maxlength="3" aria-label="Fat" value="' + f.fat + '" /><em>g F</em></div>' +
      '</div><p class="form-error" id="feErr" hidden></p>' + notePicHtml(f) +
      '<div class="menu-src" hidden><button type="button" class="danger" id="feDel">Delete</button></div>' +
      '<div class="sheet-foot"><button type="button" class="btn primary block" id="feSave">Save</button></div>',
      function (root) {
        sheet.classList.add('tall'); bindNotePic(root, f);
        $$('#feMeal button', root).forEach(function (b) { b.addEventListener('click', function () { ml = b.dataset.v; $$('#feMeal button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); buzz('light'); }); });
        $('#feSave', root).addEventListener('click', function () {
          const v = function (id2, max) { const n = parseNum($('#' + id2, root).value || '0'); return isNaN(n) || n < 0 || n > max ? NaN : Math.round(n); };
          const k = v('feK', 10000), pr = v('feP', 300), cb = v('feC', 600), ft = v('feF', 300);
          if (isNaN(k) || k < 1 || isNaN(pr) || isNaN(cb) || isNaN(ft)) { const x = $('#feErr', root); x.textContent = 'Check the numbers'; x.hidden = false; buzz('warn'); return; }
          const snap = snapshot();
          Object.assign(f, { kcal: k, protein: pr, carbs: cb, fat: ft, name: $('#feN', root).value.trim().slice(0, 40), meal: ml }); readNote(root, f);
          save(); renderAll(); closeSheet(); buzz('success'); toast('Saved', function () { restore(snap); });
        });
        $('#feDel', root).addEventListener('click', function () { closeSheet(); removeFoodItem(id, d); });
      }, function () { sheet.classList.remove('tall'); });
  }

  // Progress → Nutrition: last 14 days of calories against the target, plus averages.
  // The range buttons can sit inside a card that's about to be redrawn: lift them out first so they aren't lost.
  function keepRange(el) { const rs = $('#rangeSeg'), home = $('#prog-nutrition'); if (rs && el && el.contains(rs) && home) home.parentNode.insertBefore(rs, home); }
  function renderNutrition() { whenSeen('nut', function () { onePass(renderNutritionNow); }, function () { return !$('#nutBox').firstChild || (!$('#panel-progress').hidden && !$('#prog-nutrition').hidden); }); }
  function renderNutritionNow() {
    keepRange($('#nutBox'));
    const box = $('#nutBox'), today = dayNum(todayISO()), plan = makePlan(activeEnergy()), tgt = plan ? roundKcal(plan.target) : null;
    const days = [];
    for (let d = today - 13; d <= today; d++) { const t = dayTotals(isoFromDay(d)); days.push({ d: d, t: t }); }
    const max = Math.max(tgt || 0, Math.max.apply(null, days.map(function (x) { return x.t.kcal; }))) * 1.1 || 1;
    const logged = days.filter(function (x) { return x.t.kcal > 0 && x.d < today; });
    const avg = function (k) { return logged.length ? Math.round(logged.reduce(function (a, x) { return a + x.t[k]; }, 0) / logged.length) : null; };
    const cell = function (v, l) { return '<div class="metric"><span class="m-v num">' + (v == null ? '—' : v) + '</span><span class="m-l">' + l + '</span></div>'; };
    box.innerHTML = '<div class="card"><div class="card-head"><h2 class="card-title">Calories</h2><span class="label faint">Last 14 days</span></div>' +
      '<div class="nut-bars">' + (tgt ? '<span class="nut-line" style="bottom:' + (tgt / max * 100).toFixed(1) + '%"></span>' : '') +
        days.map(function (x) { const dp = dayPlan(isoFromDay(x.d)), dt = dp ? roundKcal(dp.target) : tgt; return '<i class="' + (!x.t.kcal ? 'empty' : dt && x.t.kcal > dt * 1.1 ? 'over' : '') + '" style="height:' + (x.t.kcal ? Math.max(3, x.t.kcal / max * 100) : 3).toFixed(1) + '%" title="' + esc(fmtDate(isoFromDay(x.d))) + ': ' + x.t.kcal + ' kcal"></i>'; }).join('') + '</div>' +
      '<div class="nut-days">' + days.map(function (x) { return '<span>' + parseISO(isoFromDay(x.d)).toLocaleDateString(undefined, { weekday: 'narrow' }) + '</span>'; }).join('') + '</div>' +
      (logged.length ? '<div class="sv-sum nut-ring">' + sumBox({ kcal: avg('kcal'), protein: avg('protein'), carbs: avg('carbs'), fat: avg('fat') }, 'a day') + '</div>' : '') + '<div class="metrics four" hidden style="grid-template-columns:repeat(4,1fr)">' + cell(avg('kcal') != null ? fmtKcal(avg('kcal')) : null, 'Avg kcal') + cell(avg('protein') != null ? avg('protein') + 'g' : null, 'Protein') + cell(avg('carbs') != null ? avg('carbs') + 'g' : null, 'Carbs') + cell(avg('fat') != null ? avg('fat') + 'g' : null, 'Fat') + '</div>' +
      '<p class="t-sub" style="text-align:center;margin-top:12px">' + (logged.length ? 'Average of ' + logged.length + ' full day' + (logged.length === 1 ? '' : 's') + (tgt ? ' · line = ' + fmtKcal(tgt) + ' target' : '') : 'Log food for a few days to see your averages') + '</p></div>';
      box.insertAdjacentHTML('afterbegin', weekReviewCard());
      box.insertAdjacentHTML('beforeend', calCard() + '<div class="card" id="trendBox"></div>' + windowCard() + '<div id="lowBox"></div>'); renderTrend(); renderLowCard();
  }

  // A month at a glance: each day coloured by how it went against that day's calorie target (within 10% = on target).
  let calOff = 0; // months back from this one
  function calDay(iso) {
    const t = dayTotals(iso).kcal, pl = dayPlan(iso);
    if (!t) return 'none';
    if (!pl) return 'logged';
    return t > pl.target * 1.1 ? 'over' : t < pl.target * 0.9 ? 'under' : 'on';
  }
  function calCard() {
    const now = parseISO(todayISO()), first = new Date(now.getFullYear(), now.getMonth() - calOff, 1);
    const y = first.getFullYear(), mo = first.getMonth(), n = new Date(y, mo + 1, 0).getDate(), today = todayISO();
    const iso = function (d) { return y + '-' + String(mo + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'); };
    const order = weekOrder(), lead = order.indexOf(first.getDay()), cnt = { on: 0, over: 0, under: 0 };
    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<span class="cal-x"></span>';
    for (let d = 1; d <= n; d++) {
      const id = iso(d), fut = id > today, k = fut ? 'fut' : id === today ? 'today' : calDay(id);
      if (cnt[k] != null) cnt[k]++;
      cells += fut ? '<span class="cal-d cal-fut">' + d + '</span>' : '<button type="button" class="cal-d cal-' + k + '" data-cal-day="' + id + '" aria-label="' + esc(fmtDate(id, { weekday: 'long', month: 'long', day: 'numeric' })) + '">' + d + '</button>';
    }
    const oldest = state.entries.length || Object.keys(state.food).length ? [].concat(Object.keys(state.food), state.entries.map(function (e) { return e.date; })).sort()[0] : today;
    const canBack = iso(1) > oldest;
    const AR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
    return '<div class="card cal-card"><div class="cal-head"><button type="button" class="icon-btn cal-nav" data-cal-m="1" aria-label="Previous month"' + (canBack ? '' : ' disabled') + '>' + AR + '</button>' +
      '<div class="cal-t">' + esc(dtf({ month: 'long', year: 'numeric' }).format(first)) + '</div>' +
      '<button type="button" class="icon-btn cal-nav cal-next" data-cal-m="-1" aria-label="Next month"' + (calOff ? '' : ' disabled') + '>' + AR + '</button></div>' +
      '<div class="cal-grid cal-wd">' + order.map(function (w) { return '<span>' + esc(dayAbbr(w).slice(0, state.settings.lang === 'ar' ? 6 : 1)) + '</span>'; }).join('') + '</div>' +
      '<div class="cal-grid">' + cells + '</div>' +
      '<div class="cal-key"><span><i class="cal-on"></i>On target <b class="num">' + cnt.on + '</b></span><span><i class="cal-over"></i>Over <b class="num">' + cnt.over + '</b></span><span><i class="cal-under"></i>Under <b class="num">' + cnt.under + '</b></span></div>' +
      '<button type="button" class="ins-more cal-rep" data-month-report><span><b>Monthly report</b><small>Your last 30 days as an image</small></span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button></div>';
  }
  // Any nutrient over the last 30 or 90 days, against each day's target.
  let trendKey = 'p';
  // Nutrition trends follow the Progress range (bars per day, so at most 180 days).
  function trendSpan() { const r = state.ui.range; return r ? Math.min(r, 180) : 180; }
  function renderTrend() { onePass(renderTrendNow); }
  function renderTrendNow() {
    const box = $('#trendBox'); if (!box) return;
    keepRange(box);
    const trendDays = trendSpan(), today = dayNum(todayISO()), from = today - trendDays + 1, isos = [];
    for (let d = from; d <= today; d++) isos.push(isoFromDay(d));
    if (!foodDB && isos.some(dayNeedsDB)) { box.innerHTML = '<div class="card-head"><h2 class="card-title">Trends</h2></div>' + skel(3); loadFoods().then(renderTrend, function () {}); return; }
    const n = NUT[trendKey], vals = isos.map(function (d) { const nd = foodFor(d).length ? dayNutrients(d) : null; return nd && nd.kcal ? nd.tot[trendKey] : null; });
    const tgs = isos.map(function (d) { const t = nutTargets(d)[trendKey]; return t ? (t.max != null && t.min == null ? t.max : t.min) : null; });
    const got = vals.filter(function (v) { return v != null; }), avg = got.length ? got.reduce(function (a, v) { return a + v; }, 0) / got.length : null;
    const tNow = tgs[tgs.length - 1], max = Math.max.apply(null, got.concat(tgs.filter(function (x) { return x != null; })).concat([1])) * 1.12;
    const lim = (function () { const t = nutTargets()[trendKey]; return t && t.max != null && t.min == null; })();
    const W = 320, H = 120, bw = W / isos.length;
    const bars = vals.map(function (v, i) { if (v == null) return ''; const h = Math.max(2, v / max * H), ok = tgs[i] == null ? '' : lim ? (v > tgs[i] ? ' over' : ' met') : (v >= tgs[i] ? ' met' : v >= tgs[i] * 0.5 ? ' part' : ''); return '<rect class="tr-bar' + ok + '" x="' + (i * bw + bw * 0.18).toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + Math.min(3, bw * 0.3).toFixed(1) + '"/>'; }).join('');
    let line = ''; tgs.forEach(function (t, i) { if (t == null) return; const y = (H - t / max * H).toFixed(1); line += (line ? ' L' : 'M') + (i * bw).toFixed(1) + ' ' + y + ' L' + ((i + 1) * bw).toFixed(1) + ' ' + y; });
    const opts = NUTS.filter(function (x) { return x[0] !== 'kcal'; }).map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === trendKey ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('');
    box.innerHTML = '<div class="card-head"><h2 class="card-title">Trends</h2><span class="label faint">' + (state.ui.range ? 'Last ' + trendDays + ' days' : 'Last 6 months') + '</span></div>' +
      '<label class="tr-pick"><span>' + esc(trendKey === 'kcal' ? 'Calories' : n.label) + '</span><select id="trKey" aria-label="Nutrient"><option value="kcal"' + (trendKey === 'kcal' ? ' selected' : '') + '>Calories</option>' + opts + '</select>' + CHEV + '</label>' +
      '<div class="tr-sum"><div><b class="num">' + (avg == null ? '–' : fmtNut(avg, n.unit)) + '</b><span>average</span></div><div><b class="num">' + (tNow == null ? '–' : fmtNut(tNow, n.unit)) + '</b><span>' + (lim ? 'limit' : 'target') + '</span></div><div><b class="num">' + got.length + '</b><span>days logged</span></div></div>' +
      '<svg class="tr-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(n.label) + ' per day">' + bars + (line ? '<path class="tr-line" d="' + line + '"/>' : '') + '</svg>' +
      '<div class="tr-axis"><span>' + esc(fmtDate(isos[0], { month: 'short', day: 'numeric' })) + '</span><span>Today</span></div>';
    $('#trKey', box).addEventListener('change', function () { trendKey = this.value; buzz('light'); renderTrend(); });
    // The range buttons only change the trends, so they live in this card.
    const rs = $('#rangeSeg'); if (rs && state.ui.prog === 'nutrition') { const pk = $('.tr-pick', box); pk.parentNode.insertBefore(rs, pk.nextSibling); }
  }
  // When you eat: first and last food each day (from entry times), the window between, and the overnight gap.
  function windowCard() {
    const today = dayNum(todayISO()), rows = [];
    const mins = function (t) { const m = /^(\d\d):(\d\d)$/.exec(t); return m ? +m[1] * 60 + +m[2] : null; };
    for (let d = today - 13; d <= today; d++) {
      const iso = isoFromDay(d), ts = eatenFor(iso).map(function (it) { return it.t ? mins(it.t) : null; }).filter(function (x) { return x != null; }).sort(function (a, b) { return a - b; });
      rows.push({ d: d, iso: iso, first: ts.length >= 2 ? ts[0] : null, last: ts.length >= 2 ? ts[ts.length - 1] : null });
    }
    const got = rows.filter(function (r) { return r.first != null && r.d < today; });
    const hm = function (m) { const d = new Date(); d.setHours(Math.floor(m / 60), Math.round(m % 60), 0, 0); return fmtClock(d.getTime()); };
    if (got.length < 2) return '<div class="card"><div class="card-head"><h2 class="card-title">Eating window</h2></div><p class="muted-note">Food you log gets a time. After a few days, you\'ll see when you usually start and stop eating.</p></div>';
    const avg = function (k) { return got.reduce(function (a, r) { return a + r[k]; }, 0) / got.length; };
    const gaps = []; rows.forEach(function (r, i) { const nx = rows[i + 1]; if (r.last != null && nx && nx.first != null) gaps.push(24 * 60 - r.last + nx.first); });
    const win = avg('last') - avg('first'), gap = gaps.length ? gaps.reduce(function (a, x) { return a + x; }, 0) / gaps.length : null;
    // The last week is drawn; the averages above use two weeks.
    const bars = rows.slice(-7).map(function (r) { return '<div class="ew-row"><span>' + dtf({ weekday: 'narrow' }).format(parseISO(r.iso)) + '</span><div class="ew-track">' + (r.first != null ? '<i style="left:' + (r.first / 14.4).toFixed(1) + '%;width:' + Math.max(1.5, (r.last - r.first) / 14.4).toFixed(1) + '%"></i>' : '') + '</div></div>'; }).join('');
    const cell = function (v, l) { return '<div><b class="num">' + v + '</b><span>' + l + '</span></div>'; };
    return '<div class="card"><div class="card-head"><h2 class="card-title">Eating window</h2><span class="label faint">Last 2 weeks</span></div>' +
      '<div class="tr-sum">' + cell(hm(avg('first')), 'first food') + cell(hm(avg('last')), 'last food') + cell((Math.round(win / 6) / 10) + ' h', 'window') + '</div>' +
      '<div class="ew-chart">' + bars + '<div class="ew-axis"><span>12 AM</span><span>6</span><span>12 PM</span><span>6</span><span>12 AM</span></div></div>' +
      (gap != null ? '<p class="muted-note" style="margin:10px 0 0">Overnight you go about ' + (Math.round(gap / 6) / 10) + ' h without food' + (state.settings.fasting ? ', your fasting goal is ' + state.fast.goal + ' h' : '') + '.</p>' : '') + '</div>';
  }
  // Your week in review: from your week's first day (Friday unless you changed it).
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
  function weekReviewCard() {
    const ws = weekStart(dayNum(todayISO())), r = weekReview(ws - 7);
    if (!r) return '';
    const cell = function (v, l) { return '<div><b class="num">' + v + '</b><span>' + l + '</span></div>'; };
    return '<button type="button" class="card wr-card" data-action="week-review"><div class="card-head"><h2 class="card-title">Last week</h2><span class="label faint">' + esc(fmtDate(isoFromDay(r.start), { month: 'short', day: 'numeric' })) + ' – ' + esc(fmtDate(isoFromDay(r.start + 6), { month: 'short', day: 'numeric' })) + '</span></div>' +
      '<div class="tr-sum">' + cell(fmtKcal(r.kcal), 'avg kcal' + (r.tg ? ' / ' + fmtKcal(r.tg) : '')) + cell(r.protein + ' g', 'avg protein') + cell(r.onTarget + '/' + r.n, 'days on target') + '</div></button>';
  }
  function weekReviewSheet(start) {
    const r = weekReview(start); if (!r) return;
    const line = function (t, v) { return '<div class="row"><div class="grow row-t">' + t + '</div><span class="row-v">' + v + '</span></div>'; };
    openSheet('<div class="sheet-head"><div><div class="label faint">' + esc(fmtDate(isoFromDay(r.start), { month: 'short', day: 'numeric' })) + ' – ' + esc(fmtDate(isoFromDay(r.start + 6), { month: 'short', day: 'numeric' })) + '</div><h2 class="sheet-title" id="sheetTitle">Your week</h2></div></div>' +
      '<div class="list">' + line('Days logged', r.n + ' of 7') + line('Average calories', fmtKcal(r.kcal) + (r.tg ? ' <small class="faint">/ ' + fmtKcal(r.tg) + '</small>' : '')) + line('Average protein', r.protein + ' g' + (r.pg ? ' <small class="faint">/ ' + r.pg + ' g</small>' : '')) +
        line('Days on target', r.onTarget + ' <small class="faint">(within 10%)</small>') + (r.best ? line('Closest to target', esc(fmtDate(r.best.iso, { weekday: 'long' }))) : '') + (trainOn() ? line('Training days', r.train) : '') +
        (r.dw != null ? line('Weight (weekly average)', (r.dw > 0 ? '+' : '') + fmtW(r.dw) + ' ' + unit()) : '') + '</div>');
  }
  // Not signed in? Once a month, a gentle nudge to save a backup (your data only lives on this phone).
  function backupBanner() {
    if (state.sync.uid || viewDay !== todayISO()) return '';
    const days = Object.keys(state.food).length + state.entries.length; if (days < 7) return '';
    const now = Date.now(), first = Math.min.apply(null, Object.keys(state.food).concat(state.entries.map(function (e) { return e.date; })).map(function (d) { return parseISO(d).getTime(); }));
    if (now - (state.ui.backupAt || first) < 30 * 864e5 || (state.ui.backupLater && now < state.ui.backupLater)) return '';
    return '<div class="card bk-banner strip"><span class="strip-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 9.5H7z"/><path d="M12 15V10M9.5 12.5 12 10l2.5 2.5"/></svg></span><b class="grow">Not backed up yet</b><button type="button" class="btn sm tint" data-action="export-json">Back up</button><button type="button" class="icon-btn strip-x" data-bk-later aria-label="Later">' + XIC + '</button></div>';
  }
  // Low on something for most of the last 5 days? Point to foods you already eat that have a lot of it.
  const GAP_KEYS = ['fib', 'fe', 'vD', 'ca', 'k', 'mg', 'b12', 'fol', 'vC', 'zn'];
  let gapCache = { sig: '', html: '' };
  let warmT = null;
  function gapBanner() {
    const today = dayNum(todayISO());
    if (viewDay !== todayISO() || !foodDB) return '';
    const sig = today + ':' + Object.keys(state.food).length + ':' + JSON.stringify(state.food[isoFromDay(today - 1)] || []).length + ':' + state.ui.gapHide;
    if (gapCache.sig === sig) return gapCache.html;
    let html = '';
    const days = []; for (let i = 1; i <= 5; i++) { const nd = dayNutrients(isoFromDay(today - i)); if (nd.items && nd.kcal > 600) days.push(nd); }
    if (days.length >= 3) {
      const tg = nutTargets(); let worst = null;
      GAP_KEYS.forEach(function (k) {
        if (!tg[k] || !tg[k].min || !NUT[k]) return;
        const ok = days.filter(function (nd) { return nd.cov[k] > 0.7; }); if (ok.length < 3) return;
        const avg = ok.reduce(function (a, nd) { return a + nd.tot[k]; }, 0) / ok.length, r = avg / tg[k].min;
        const low = ok.filter(function (nd) { return nd.tot[k] < tg[k].min * 0.6; }).length;
        if (r < 0.6 && low >= 3 && (!worst || r < worst.r)) worst = { k: k, r: r, avg: avg, min: tg[k].min };
      });
      const wk = worst && worst.k + ':' + weekStart(today);
      if (worst && state.ui.gapHide !== wk) {
        // Foods you've eaten in the last 4 months, by how much of it one usual portion gives.
        const use = foodUse().use, picks = [];
        Object.keys(use).forEach(function (id) {
          const f = getFood(id); if (!f || f.recipe) return;
          const v100 = per100(f, worst.k); if (!v100) return;
          const lp = lastPortion(id), u = lp && unitsFor(f).find(function (x) { return x.label === lp.unit; }), s0 = defaultServing(f);
          const g = u ? lp.qty * u.g : s0.qty * s0.unit.g, v = v100 * g / 100;
          if (v >= worst.min * 0.1) picks.push({ f: f, v: v });
        });
        picks.sort(function (a, b) { return b.v - a.v; });
        const n = NUT[worst.k];
        html = '<div class="card gap-card"><div class="gap-top"><span class="ico ico-s">' + LEAF_IC + '</span><div class="grow"><b>Low on ' + esc(n.label.toLowerCase()) + ' lately</b><span>' + (worst.avg < 0.5 ? 'Almost none' : 'About ' + fmtNut(worst.avg, n.unit)) + ' a day, target ' + fmtNut(worst.min, n.unit) + '</span></div><button type="button" class="icon-btn wr-x" data-gap-hide="' + wk + '" aria-label="Hide">' + XIC + '</button></div>' +
          (picks.length ? '<div class="gap-chips">' + picks.slice(0, 4).map(function (x) { return '<button type="button" data-gap-f="' + x.f.id + '">' + esc(x.f.name.split(',')[0].split(' · ')[0].slice(0, 22)) + ' <small>' + fmtNut(x.v, n.unit) + '</small></button>'; }).join('') + '</div>'
            : '<button type="button" class="text-btn gap-more" data-gap-high="' + worst.k + '">See foods high in ' + esc(n.label.toLowerCase()) + '</button>') + '</div>';
      }
    }
    gapCache = { sig: sig, html: html };
    return html;
  }
  // New here: a short checklist that disappears once it's done (or hidden).
  function startBanner() {
    if (viewDay !== todayISO() || state.ui.gsHide || Object.keys(state.food).length > 3) return '';
    const steps = [
      [!!dayPlan(todayISO()), 'Set your calorie target', 'targets'],
      [Object.keys(state.food).some(function (k) { return state.food[k].length; }), 'Log your first food', 'food'],
      [Object.keys(state.water || {}).length > 0, 'Add a glass of water', 'water'],
      [state.entries.length > 0, 'Log your weight', 'weight']
    ];
    const left = steps.filter(function (x) { return !x[0]; }).length;
    if (!left) return '';
    return '<div class="card gs-card"><div class="gs-head"><b>Getting started</b><span class="label faint">' + (steps.length - left) + ' of ' + steps.length + ' done</span><button type="button" class="icon-btn wr-x" data-gs-hide aria-label="Hide">' + XIC + '</button></div>' +
      steps.map(function (x) { return '<button type="button" class="gs-step' + (x[0] ? ' done' : '') + '" data-gs="' + x[2] + '"' + (x[0] ? ' disabled' : '') + '><i></i><span>' + x[1] + '</span>' + (x[0] ? '' : CHEV) + '</button>'; }).join('') + '</div>';
  }
  function weekCardHtml() {
    const today = dayNum(todayISO()), ws = weekStart(today), cur = weekStats(ws), prev = weekStats(ws - 7);
    let dots = '';
    for (let d = ws; d < ws + 7; d++) {
      const iso = isoFromDay(d), on = !!findEntry(iso);
      dots += '<div' + (d === today ? ' class="is-today"' : '') + '><i class="' + (on ? 'on' : d > today ? 'future' : '') + (d === today ? ' today' : '') + '"></i>' + dtf({ weekday: 'narrow' }).format(parseISO(iso)) + '</div>';
    }
    let streak = 0, sd = today - (findEntry(todayISO()) ? 0 : 1);
    const logged = {}; state.entries.forEach(function (e) { logged[e.date] = 1; });
    while (logged[isoFromDay(sd)]) { streak++; sd--; }
    const right = streak >= 3 ? streak + '-day streak' : (cur ? cur.n : 0) + ' of ' + (today - ws + 1) + ' days';
    return '<span class="pt-k">This week</span>' +
      (cur ? '<span class="pt-v num">' + fmtW(cur.avg) + '<small>' + unit() + '</small></span><span class="pt-s">' + (prev ? deltaChip(cur.avg - prev.avg, goodWhenDown()) : 'Average') + '</span>'
        : '<span class="pt-v pt-none">–</span><span class="pt-s">' + (prev ? 'Last week ' + fmtW(prev.avg) + ' ' + unit() : 'No weigh-ins yet') + '</span>') +
      '<div class="week pt-week">' + dots + '</div>';
  }

  let scrubHide = null, showAllEntries = false;
  function rangeList() {
    const all = withTrend(), r = state.ui.range;
    if (!r || !all.length) return all;
    const end = dayNum(todayISO());
    return all.filter(function (p) { return p.day > end - r; });
  }
  function niceStep(span, target) {
    const raw = span / target, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  }
  function defaultReadout(pts) {
    const el = $('#readout');
    if (!pts.length) { el.innerHTML = ''; return; }
    const last = pts[pts.length - 1];
    el.innerHTML = '<span class="r-v num">' + fmtW(last.trend) + U() + '</span><span class="r-s">' + (pts.length > 1 ? deltaChip(last.trend - pts[0].trend, goodWhenDown()) : '') + '<span>' + esc(fmtDate(pts[0].date)) + (pts.length > 1 ? ' – ' + esc(fmtDate(last.date)) : '') + '</span></span>';
  }
  // The chart's width only changes with the screen (or text size), so it isn't measured on every draw:
  // measuring right after the page appears would make the browser lay out the whole page an extra time.
  let chartW = { k: '', w: 0 };
  function chartWidth(el) {
    const k = innerWidth + '|' + document.documentElement.style.zoom;
    if (chartW.k !== k || !chartW.w) { const w = el.clientWidth; chartW = { k: k, w: w }; }
    return chartW.w;
  }
  function renderChart() {
    const el = $('#chart');
    if ($('#panel-progress').hidden) return;
    $$('#rangeSeg button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.range === state.ui.range); });
    if ($('#ckToggle')) $('#ckToggle').setAttribute('aria-pressed', !!state.ui.chartKcal);
    const pts = rangeList(), goal = state.settings.goalKg;
    if (pts.length < 2) {
      el.innerHTML = '<div class="chart-empty">' + (entries().length < 2 ? 'Log two days to see your trend' : 'Nothing in this range yet') + '</div>';
      defaultReadout(pts);
      return;
    }
    const W = Math.max(280, chartWidth(el)), H = 220, padL = 8, padR = 40, padT = 12, padB = 24;
    const iw = W - padL - padR, ih = H - padT - padB;
    const d0 = pts[0].day, lastDay = Math.max(pts[pts.length - 1].day, d0 + 1);
    // Projection: carry the current trend forward towards the goal (up to ~a third of the chart's width).
    const tr = trend(), lastT = pts[pts.length - 1].trend, isLatest = pts[pts.length - 1].day === dayNum(entries()[entries().length - 1].date);
    let proj = null;
    if (goal && tr && isLatest && Math.abs(tr.perDay) > 0.001 && (goal - lastT) / tr.perDay > 0) {
      const toGoal = (goal - lastT) / tr.perDay, ext = Math.min(toGoal, Math.max(14, (lastDay - d0) * 0.35));
      proj = { day: lastDay + ext, kg: lastT + tr.perDay * ext, hits: toGoal <= ext, goalDay: lastDay + toGoal };
    }
    const d1 = proj ? Math.max(lastDay, proj.day) : lastDay;
    const vals = [];
    pts.forEach(function (p) { vals.push(toDisp(p.kg), toDisp(p.trend)); });
    if (proj) vals.push(toDisp(proj.kg));
    let mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    const minSpan = unit() === 'lb' ? 2 : 1, spread = Math.max(mx - mn, minSpan);
    let showGoal = false;
    if (goal) { const gd = toDisp(goal); if (gd >= mn - spread * 0.6 && gd <= mx + spread * 0.6) { showGoal = true; mn = Math.min(mn, gd); mx = Math.max(mx, gd); } }
    if (mx - mn < minSpan) { const m = (mx + mn) / 2; mn = m - minSpan / 2; mx = m + minSpan / 2; }
    const step = niceStep(mx - mn, 4);
    mn = Math.floor(mn / step) * step; mx = Math.ceil(mx / step) * step;
    const X = function (d) { return padL + (d - d0) / (d1 - d0) * iw; };
    const Y = function (v) { return padT + ih - (v - mn) / (mx - mn) * ih; };
    const dec = step < 1 ? (Math.round(step * 10) % 5 ? 2 : 1) : 0;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" height="' + H + '" role="img" aria-label="Weight chart">' +
      '<defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".18"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>';
    for (let v = mn; v <= mx + step / 2; v += step) {
      const y = Y(v).toFixed(1);
      s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="var(--chart-grid)"/>' +
        '<text x="' + (W - padR + 8) + '" y="' + (+y + 4) + '">' + v.toFixed(dec) + '</text>';
    }
    const span = d1 - d0, n = W < 380 ? 2 : 3;
    const lblOpts = span > 200 ? { month: 'short', year: '2-digit' } : { month: 'short', day: 'numeric' };
    for (let i = 0; i <= n; i++) {
      const d = Math.round(d0 + span * i / n);
      s += '<text x="' + X(d).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="' + (i === 0 ? 'start' : i === n ? 'end' : 'middle') + '">' + esc(fmtDate(isoFromDay(d), lblOpts)) + '</text>';
    }
    state.phases.forEach(function (p) {
      const pd = dayNum(p.date);
      if (pd < d0 || pd > d1) return;
      const x = X(pd).toFixed(1);
      s += '<line x1="' + x + '" x2="' + x + '" y1="' + padT + '" y2="' + (padT + ih) + '" stroke="var(--accent)" stroke-dasharray="2 4" opacity=".6"/>';
      if (p.label) s += '<text x="' + (+x + 5) + '" y="' + (padT + 9) + '" style="fill:var(--accent-text);font-weight:700;font-size:10px">' + esc(p.label) + '</text>';
    });
    if (showGoal) { const gy = Y(toDisp(goal)).toFixed(1); s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + gy + '" y2="' + gy + '" stroke="var(--text-3)" stroke-dasharray="4 5" stroke-width="1.2"/><text x="' + (padL + 2) + '" y="' + (gy - 5) + '" style="font-size:10px;font-weight:700">Goal</text>'; }
    cycleWindows().forEach(function (w) {
      const a = Math.max(d0, w.a), b2 = Math.min(d1, w.b + 1); if (b2 <= a) return;
      s += '<rect class="cy-band' + (w.guess ? ' guess' : '') + '" x="' + X(a).toFixed(1) + '" y="' + padT + '" width="' + (X(b2) - X(a)).toFixed(1) + '" height="' + ih + '"/>';
    });
    if (state.ui.chartKcal) {
      // Daily calories as soft bars along the bottom (scaled to the busiest day in view).
      let mxK = 0; const ks = [];
      for (let dd = Math.ceil(d0); dd <= lastDay; dd++) { const k = dayTotals(isoFromDay(dd)).kcal; if (k > 0) { ks.push([dd, k]); if (k > mxK) mxK = k; } }
      const bw = Math.max(1.5, Math.min(8, iw / Math.max(1, d1 - d0) * 0.7));
      ks.forEach(function (x) { const h = x[1] / mxK * ih * 0.38; s += '<rect class="ck-bar" x="' + (X(x[0]) - bw / 2).toFixed(1) + '" y="' + (padT + ih - h).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + Math.min(2, bw / 2).toFixed(1) + '"/>'; });
    }
    const line = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p.day).toFixed(1) + ',' + Y(toDisp(p.trend)).toFixed(1); }).join('');
    s += '<path d="' + line + 'L' + X(pts[pts.length - 1].day).toFixed(1) + ',' + (padT + ih) + 'L' + X(d0).toFixed(1) + ',' + (padT + ih) + 'Z" fill="url(#cg)"/>';
    const r = pts.length > 120 ? 1.6 : pts.length > 60 ? 2.2 : 3;
    pts.forEach(function (p) { s += '<circle cx="' + X(p.day).toFixed(1) + '" cy="' + Y(toDisp(p.kg)).toFixed(1) + '" r="' + r + '" fill="var(--chart-raw)"/>'; });
    if (proj) {
      const px = X(proj.day).toFixed(1), py = Y(toDisp(proj.kg)).toFixed(1);
      s += '<path d="M' + X(lastDay).toFixed(1) + ',' + Y(toDisp(lastT)).toFixed(1) + 'L' + px + ',' + py + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round" opacity=".8"/>';
      if (proj.hits) s += '<circle cx="' + px + '" cy="' + py + '" r="4" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/><text x="' + (+px - 6) + '" y="' + (+py - 9) + '" text-anchor="end" style="fill:var(--accent-text);font-weight:700;font-size:10px">' + esc(fmtDate(isoFromDay(Math.round(proj.goalDay)))) + '</text>';
    }
    s += '<path d="' + line + '" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<g id="scrub" style="display:none"><line id="scrubLine" y1="' + padT + '" y2="' + (padT + ih) + '" stroke="var(--text-3)"/><circle id="scrubRaw" r="4.5" fill="var(--surface)" stroke="var(--text-2)" stroke-width="2"/><circle id="scrubAvg" r="5.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5"/></g>' +
      '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="transparent"/></svg>';
    el.innerHTML = s;
    defaultReadout(pts);

    const svg = el.querySelector('svg');
    let lastIdx = -1;
    // Two fingers: spread to zoom in (a shorter range), pinch to zoom out.
    let pinch0 = 0;
    svg.addEventListener('touchstart', function (ev) { if (ev.touches.length === 2) pinch0 = Math.abs(ev.touches[0].clientX - ev.touches[1].clientX); }, { passive: true });
    svg.addEventListener('touchmove', function (ev) {
      if (ev.touches.length !== 2 || !pinch0) return;
      const dx = Math.abs(ev.touches[0].clientX - ev.touches[1].clientX), r = dx / pinch0;
      if (r > 0.75 && r < 1.35) return;
      const rs = [30, 90, 180, 365, 0], cur = rs.indexOf(state.ui.range), ord = function (v) { return v === 0 ? 99999 : v; };
      const sorted = rs.slice().sort(function (a, b) { return ord(a) - ord(b); }), i = sorted.indexOf(rs[cur < 0 ? 1 : cur]);
      const ni = r > 1 ? Math.max(0, i - 1) : Math.min(sorted.length - 1, i + 1);
      pinch0 = 0;
      if (sorted[ni] !== state.ui.range) { state.ui.range = sorted[ni]; save(); buzz('light'); renderChart(); renderProgress(); }
    }, { passive: true });
    function at(ev) {
      const rect = svg.getBoundingClientRect();
      const day = d0 + ((ev.clientX - rect.left) * (W / rect.width) - padL) / iw * (d1 - d0);
      let best = 0;
      for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i].day - day) < Math.abs(pts[best].day - day)) best = i;
      const p = pts[best], cx = X(p.day).toFixed(1);
      clearTimeout(scrubHide);
      $('#scrub', svg).style.display = '';
      $('#scrubLine', svg).setAttribute('x1', cx); $('#scrubLine', svg).setAttribute('x2', cx);
      $('#scrubRaw', svg).setAttribute('cx', cx); $('#scrubRaw', svg).setAttribute('cy', Y(toDisp(p.kg)).toFixed(1));
      $('#scrubAvg', svg).setAttribute('cx', cx); $('#scrubAvg', svg).setAttribute('cy', Y(toDisp(p.trend)).toFixed(1));
      if (best !== lastIdx) { if (lastIdx !== -1) buzz('light'); lastIdx = best; }
      const dk = dayTotals(p.date).kcal, cw = inCycleWindow(p.day);
      $('#readout').innerHTML = '<span class="r-v num">' + fmtW(p.kg) + U() + '</span><span class="r-s">' + esc(fmtDate(p.date, { weekday: 'short', month: 'short', day: 'numeric' })) + '<br>trend ' + fmtW(p.trend) + (dk ? ' · ' + fmtKcal(dk) + ' kcal' : '') + (cw ? ' · period week, water is common' : '') + '</span>';
    }
    function end(delay) {
      clearTimeout(scrubHide);
      scrubHide = setTimeout(function () { const g = $('#scrub', svg); if (g) g.style.display = 'none'; lastIdx = -1; defaultReadout(pts); }, delay);
    }
    svg.addEventListener('pointerdown', at);
    svg.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons) at(e); });
    svg.addEventListener('pointerup', function (e) { end(e.pointerType === 'mouse' ? 3000 : 1500); });
    svg.addEventListener('pointerleave', function () { end(250); });
    svg.addEventListener('pointercancel', function () { end(250); });
  }

  function renderProgress() {
    const pts = rangeList(), box = $('#rangeStats');
    if (pts.length < 2) box.hidden = true;
    else {
      box.hidden = false;
      const reg = linreg(pts.map(function (p) { return { x: p.day, y: p.kg }; }));
      let lo = pts[0], hi = pts[0];
      pts.forEach(function (p) { if (p.kg < lo.kg) lo = p; if (p.kg > hi.kg) hi = p; });
      const cell = function (v, l) { return '<div class="metric"><span class="m-v num">' + v + '</span><span class="m-l">' + l + '</span></div>'; };
      box.innerHTML = cell(String(pts.length), 'Weigh-ins') + cell(reg ? signed(toDisp(reg.slope * 7), 2) : '—', 'Per week') + cell(fmtW(lo.kg), 'Lowest') + cell(fmtW(hi.kg), 'Highest');
    }

    // Phases
    renderInsights();
    const pl = $('#phaseBox'), all = entries();
    $('#phaseFold').hidden = !state.phases.length; $('#phaseStart').hidden = state.phases.length || all.length < 2;
    $('#phaseSub').textContent = state.phases.length ? (state.phases[state.phases.length - 1].label || 'Phase') + ' · now' : 'Mark a cut, bulk or diet break';
    if (!state.phases.length) pl.innerHTML = '<button type="button" class="btn soft block" data-action="new-phase">Start a phase</button>';
    else {
      let html = '<div class="list flat">';
      state.phases.slice().reverse().forEach(function (p, idx, arr) {
        const next = idx > 0 ? arr[idx - 1] : null;
        const inPhase = all.filter(function (e) { return e.date >= p.date && (!next || e.date < next.date); });
        const change = inPhase.length >= 2 ? fmtDelta(inPhase[inPhase.length - 1].kg - inPhase[0].kg) + ' ' + unit() : '';
        html += '<div class="row"><div class="grow"><div class="row-t">' + esc(p.label || 'Phase') + (idx === 0 ? ' <span class="pill" style="margin-left:6px;height:22px">Now</span>' : '') + '</div><div class="row-s">Since ' + esc(fmtDate(p.date, { month: 'short', day: 'numeric', year: 'numeric' })) + '</div></div>' +
          (change ? '<span class="row-v num">' + change + '</span>' : '') +
          '<button type="button" class="icon-btn" data-del-phase="' + p.date + '" aria-label="Remove phase"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button></div>';
      });
      pl.innerHTML = html + '</div><button type="button" class="btn soft block" data-action="new-phase" style="margin-top:10px">New phase</button>';
    }
    $('#histSub').textContent = all.length ? all.length + (all.length === 1 ? ' weigh-in' : ' weigh-ins') : '';
    ['phases', 'history'].forEach(function (k) { const el = $('[data-fold="' + k + '"]'), open = state.ui.folded.indexOf(k) < 0; el.setAttribute('aria-expanded', open); el.nextElementSibling.hidden = !open; });

    // Weigh-ins
    const box2 = $('#entryList'), view = state.ui.view;
    $$('#viewSeg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === view); });
    if (!all.length) { box2.innerHTML = '<p class="muted-note">No weigh-ins yet.</p>'; return; }
    if (view === 'weeks') {
      const first = weekStart(dayNum(all[0].date)), weeks = [];
      for (let st = weekStart(dayNum(all[all.length - 1].date)); st >= first; st -= 7) { const w = weekStats(st); if (w) weeks.push(w); }
      const gwd = goodWhenDown(), shownW = showAllEntries ? weeks : weeks.slice(0, 8);
      box2.innerHTML = '<div class="list">' + shownW.map(function (w) {
        const pv = weekStats(w.start - 7), d = pv ? w.avg - pv.avg : null;
        const good = d != null && gwd != null && Math.abs(toDisp(d)) >= 0.05 && (d < 0) === gwd;
        return '<button type="button" class="row" data-action="week-at" data-start="' + w.start + '"><div class="grow"><div class="row-t">' + esc(weekRange(w.start)) + '</div><div class="row-s">' + w.n + ' day' + (w.n === 1 ? '' : 's') + (w.kcal ? ' · ' + fmtKcal(roundKcal(w.kcal)) + ' kcal' : '') + '</div></div>' +
          '<span class="row-w num">' + fmtW(w.avg) + '</span><span class="delta' + (good ? ' good' : '') + '">' + (d != null ? fmtDelta(d) : '') + '</span></button>';
      }).join('') + (weeks.length > shownW.length ? '<button type="button" class="row more-row" data-action="show-all">Show all ' + weeks.length + ' weeks</button>' : '') + '</div>';
      return;
    }
    const rev = all.slice().reverse(), goal = state.settings.goalKg;
    const row = function (e, i) {
      const prev = rev[i + 1];
      let delta = '<span class="delta"></span>';
      if (prev) {
        const dk = e.kg - prev.kg;
        const toward = goal && Math.abs(toDisp(dk)) >= 0.05 && Math.abs(e.kg - goal) < Math.abs(prev.kg - goal);
        delta = '<span class="delta' + (toward ? ' good' : '') + '">' + fmtDelta(dk) + '</span>';
      }
      const sub = [];
      const dk = dayKcal(e.date); if (dk) sub.push(fmtKcal(dk) + ' kcal');
      if (e.note) sub.push(e.note);
      return '<button type="button" class="row" data-edit="' + e.date + '"><div class="grow"><div class="row-t">' + esc(relDate(e.date)) + '</div>' + (sub.length ? '<div class="row-s">' + esc(sub.join(' · ')) + '</div>' : '') + '</div>' +
        '<span class="row-w num">' + fmtW(e.kg) + '</span>' + delta + '</button>';
    };
    let html = '';
    if (!showAllEntries) {
      html = '<div class="list">' + rev.slice(0, 7).map(row).join('') + (rev.length > 7 ? '<button type="button" class="row more-row" data-action="show-all">Show all ' + rev.length + '</button>' : '') + '</div>';
    } else {
      let month = '';
      rev.forEach(function (e, i) {
        const m = e.date.slice(0, 7);
        if (m !== month) {
          if (month) html += '</div>';
          month = m;
          html += '<div class="group-label">' + esc(parseISO(m + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })) + '</div><div class="list">';
        }
        html += row(e, i);
      });
      html += '</div>';
    }
    box2.innerHTML = html;
  }

  function renderInsights() {
    const l = entries(), box = $('#insightBox'), out = [], map = trendMap(), today = dayNum(todayISO());
    const I_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
    const I_WAVE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12c2.5-4 5-4 7.5 0s5 4 7.5 0 2.5-2 3-2"/></svg>';
    const I_TREND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7c4 .4 5 9 10 9.6l6.5.4"/></svg>';
    // Change on the trend over the range picked at the top of Progress
    const rng = state.ui.range || (l.length ? today - dayNum(l[0].date) : 30), rLbl = ({ 30: 'Last 30 days', 90: 'Last 3 months', 180: 'Last 6 months', 365: 'Last year' })[state.ui.range] || 'Since you started';
    const past = l.filter(function (e) { return dayNum(e.date) <= today - rng; });
    if ((past.length || !state.ui.range) && l.length >= 5 && rng >= 7) {
      const ch = currentKg() - trendAt(Math.max(today - rng, dayNum(l[0].date)));
      if (Math.abs(toDisp(ch)) >= 0.1) out.push([I_TREND, rLbl + ': <b>' + (ch < 0 ? 'down ' : 'up ') + fmtW(Math.abs(ch)) + ' ' + unit() + '</b> on your trend.']);
    }
    // Weekday pattern (water weight)
    if (l.length >= 21 && dayNum(l[l.length - 1].date) - dayNum(l[0].date) >= 28) {
      const sum = [0, 0, 0, 0, 0, 0, 0], n = [0, 0, 0, 0, 0, 0, 0];
      l.forEach(function (e) { const wd = parseISO(e.date).getDay(); sum[wd] += e.kg - map[dayNum(e.date)]; n[wd]++; });
      let hi = -1, lo = -1;
      for (let i = 0; i < 7; i++) { if (n[i] < 3) continue; const m = sum[i] / n[i]; if (hi < 0 || m > sum[hi] / n[hi]) hi = i; if (lo < 0 || m < sum[lo] / n[lo]) lo = i; }
      if (hi >= 0 && lo >= 0 && hi !== lo) {
        const gap = toDisp(sum[hi] / n[hi] - sum[lo] / n[lo]);
        const name = function (i) { return new Date(2024, 0, 7 + i).toLocaleDateString(undefined, { weekday: 'long' }) + 's'; };
        if (gap >= (unit() === 'lb' ? 0.8 : 0.4)) out.push([I_WAVE, 'You\'re usually heaviest on <b>' + name(hi) + '</b> and lightest on <b>' + name(lo) + '</b> (' + gap.toFixed(1) + ' ' + unit() + ' apart). That\'s water, not fat.']);
      }
    }
    // Consistency
    if (l.length >= 7) {
      const span = Math.max(1, Math.min(rng, today - dayNum(l[0].date) + 1)), n30 = l.filter(function (e) { return dayNum(e.date) > today - span; }).length, r = n30 / span;
      out.push([I_CAL, 'You weighed in on <b>' + n30 + ' of the last ' + span + ' days</b>.' + (r >= 0.8 ? ' Great consistency.' : r < 0.5 ? ' Daily weigh-ins make the trend more accurate.' : '')]);
    }
    const more = '<button type="button" class="ins-more" data-action="insights"><span><b>What moves your weight</b><small>Patterns from your own log</small></span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>';
    box.innerHTML = '<div class="card insight-card"><div class="card-head"><h2 class="card-title">Insights</h2></div>' + out.slice(0, 2).map(function (x) { return '<div class="insight"><span class="ico">' + x[0] + '</span><div>' + x[1] + '</div></div>'; }).join('') + more + '</div>';
  }

