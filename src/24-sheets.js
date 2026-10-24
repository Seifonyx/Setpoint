  /* ================= Sheets ================= */
  function field(label, inner) { return '<label class="field"><span>' + label + '</span>' + inner + '</label>'; }
  function segHtml(id, opts, val) { return '<div class="seg" id="' + id + '">' + opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (String(val) === String(o[0])) + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function bindSeg(root, id, cb) {
    const btns = $$('#' + id + ' button', root);
    btns.forEach(function (b) { b.addEventListener('click', function () { btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); buzz('light'); cb(b.dataset.v); }); });
  }
  const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12M12 6v12"/></svg>';
  const MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12"/></svg>';
  const TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';

  // One sheet for logging and editing: it always shows the entry for the chosen date.
  function logSheet(date) {
    let d = date || todayISO();
    const track = false; // calories are logged in the food diary now
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Log weight</h2>' +
        '<label class="date-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg><span id="lDateLbl"></span><input type="date" id="lDate" aria-label="Date" /></label></div>' +
      '<div class="stepper"><button type="button" class="step" data-step="-1" aria-label="Minus 0.1">' + MINUS + '</button>' +
        '<div class="w-field"><input id="lW" type="text" inputmode="decimal" enterkeyhint="done" aria-label="Weight" autocomplete="off" /><div>' + unit() + '</div></div>' +
        '<button type="button" class="step" data-step="1" aria-label="Plus 0.1">' + PLUS + '</button></div>' +
      (track ? '<div class="field sfx" id="lKWrap"><input class="input" id="lK" inputmode="numeric" maxlength="5" placeholder="Calories eaten" aria-label="Calories eaten" autocomplete="off" /><em>kcal</em></div><p class="t-sub" id="lKLog" style="margin:-4px 2px 14px" hidden></p>' : '') +
      '<button type="button" class="text-btn" id="lNoteBtn">+ Add note</button>' +
      '<div class="field" id="lNoteWrap" hidden><input class="input" id="lN" maxlength="200" placeholder="Note" aria-label="Note" autocomplete="off" /></div>' +
      '<p class="form-error" id="lErr" hidden></p>' +
      '<div class="btn-row"><button type="button" class="btn danger icon-only" id="lDel" aria-label="Delete" hidden>' + TRASH + '</button><button type="button" class="btn primary" id="lSave">Save</button></div>',
      function (root) {
        const dateIn = $('#lDate', root), wIn = $('#lW', root), kIn = $('#lK', root), nIn = $('#lN', root);
        const err = function (m) { const x = $('#lErr', root); x.textContent = m; x.hidden = !m; if (m) buzz('warn'); };
        const fill = function () {
          const e = findEntry(d), latest = entries()[entries().length - 1];
          dateIn.value = d; dateIn.max = todayISO();
          $('#lDateLbl', root).textContent = relDate(d);
          $('#sheetTitle', root).textContent = e ? 'Edit weight' : 'Log weight';
          wIn.value = e ? fmtW(e.kg) : '';
          wIn.placeholder = latest ? fmtW(latest.kg) : (unit() === 'lb' ? '150.0' : '70.0');
          if (kIn) {
            const tt = dayTotals(d);
            kIn.value = e && e.kcal ? e.kcal : '';
            $('#lKWrap', root).hidden = tt.fromLog; $('#lKLog', root).hidden = !tt.fromLog;
            $('#lKLog', root).textContent = tt.fromLog ? fmtKcal(tt.kcal) + ' kcal from your food log' : '';
          }
          nIn.value = e ? e.note : '';
          $('#lNoteWrap', root).hidden = !(e && e.note);
          $('#lNoteBtn', root).hidden = !!(e && e.note);
          $('#lDel', root).hidden = !e;
          err('');
        };
        fill();
        wIn.addEventListener('focus', function () { setTimeout(function () { wIn.select(); }, 0); });
        dateIn.addEventListener('change', function () { if (dateIn.value && dateIn.value <= todayISO()) d = dateIn.value; fill(); buzz('light'); });
        $('.date-chip', root).addEventListener('click', function (e) { if (e.target === dateIn && dateIn.showPicker) { try { dateIn.showPicker(); } catch (x) {} } });
        $('#lNoteBtn', root).addEventListener('click', function () { this.hidden = true; $('#lNoteWrap', root).hidden = false; nIn.focus(); });
        const stepBy = function (dir) {
          let v = parseNum(wIn.value);
          if (isNaN(v)) v = parseNum(wIn.placeholder);
          else v = Math.round((v + dir * 0.1) * 10) / 10;
          if (!isNaN(v)) wIn.value = Math.max(0, v).toFixed(1);
          err(''); buzz('light');
        };
        $$('.step', root).forEach(function (b) {
          let hold = null, rep = null;
          const stop = function () { clearTimeout(hold); clearInterval(rep); hold = rep = null; };
          b.addEventListener('pointerdown', function (e) { e.preventDefault(); const dir = +b.dataset.step; stepBy(dir); hold = setTimeout(function () { rep = setInterval(function () { stepBy(dir); }, 70); }, 420); });
          ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, stop); });
          b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stepBy(+b.dataset.step); } });
          b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        });
        const doSave = function () {
          const v = parseNum(wIn.value);
          if (isNaN(v)) return err('Enter your weight');
          const kg = fromDisp(v);
          if (kg < 20 || kg > 400) return err('That weight doesn\'t look right');
          const kRaw = kIn && !$('#lKWrap', root).hidden ? kIn.value.trim() : '', k = kRaw ? parseNum(kRaw) : null;
          if (kRaw && (isNaN(k) || k < 300 || k > 15000)) return err('Enter the whole day\'s calories');
          const prev = findEntry(d), snap = snapshot();
          const e = { date: d, kg: Math.round(kg * 10000) / 10000, note: nIn.value.trim().slice(0, 200) };
          if (k != null) e.kcal = Math.round(k);
          else if ((!kIn || $('#lKWrap', root).hidden) && prev && prev.kcal) e.kcal = prev.kcal; // calorie field hidden: keep what's there
          upsert(e); save(); closeSheet(); renderAll(); buzz('success');
          // A big jump above the trend is almost always water. Say so, so it doesn't feel like a setback.
          const gap = e.kg - trendAt(dayNum(d)), waterish = toDisp(gap) >= (unit() === 'lb' ? 1.8 : 0.8);
          toast((prev ? 'Updated ' : 'Logged ') + v.toFixed(1) + ' ' + unit() + (waterish ? ' · likely water, trend barely moved' : ''), function () { restore(snap); });
          checkMilestones();
        };
        $('#lSave', root).addEventListener('click', doSave);
        [wIn, kIn, nIn].forEach(function (x) { if (x) x.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doSave(); } }); });
        $('#lDel', root).addEventListener('click', function () {
          const snap = snapshot(), when = d;
          state.entries = state.entries.filter(function (x) { return x.date !== when; });
          save(); closeSheet(); renderAll(); buzz('medium');
          toast('Deleted ' + (relDate(when) === 'Today' || relDate(when) === 'Yesterday' ? relDate(when).toLowerCase() + '\'s weight' : fmtDate(when)), function () { restore(snap); });
        });
      });
  }

  // Weekly check-in: one week's average, change and a short read on the pace, plus recent weeks.
  function weekSheet(start, auto, onClose, adj) {
    const w = weekStats(start), prev = weekStats(start - 7), gwd = goodWhenDown();
    const change = w && prev ? w.avg - prev.avg : null;
    let verdict = '';
    if (change != null) {
      const plan = makePlan(activeEnergy()), pace = plan ? plan.pace : null, ch = toDisp(change);
      if (pace && pace.dir !== 'maintain') {
        const exp = toDisp(pace.kg), ratio = ch / exp, rate = Number(Math.abs(exp).toFixed(2)) + ' ' + unit() + '/week';
        verdict = ratio < 0 ? (pace.dir === 'lose' ? 'Up this week. One week isn\'t a trend, so keep going.' : 'Down this week. One week isn\'t a trend.')
          : ratio < 0.5 ? 'Slower than your ' + rate + ' plan.' : ratio <= 1.5 ? 'Right on your ' + rate + ' pace.' : 'Faster than your ' + rate + ' plan.';
      } else if (pace && pace.dir === 'maintain') verdict = Math.abs(ch) < (unit() === 'lb' ? 0.5 : 0.25) ? 'Holding steady. Nice.' : (ch < 0 ? 'A little down' : 'A little up') + ' while maintaining.';
    }
    const cell = function (v, l) { return '<div class="metric"><span class="m-v num">' + v + '</span><span class="m-l">' + l + '</span></div>'; };
    let body = '<div class="sheet-head"><div><div class="label faint">' + (auto ? 'Weekly check-in' : 'Week') + '</div><h2 class="sheet-title" id="sheetTitle">' + esc(weekRange(start)) + '</h2></div></div>';
    if (!w) body += '<p class="sheet-text">No weigh-ins this week.</p>';
    else {
      body += '<div class="week-top" style="margin-bottom:6px"><div><div class="week-avg num" style="font-size:44px">' + fmtW(w.avg) + '<span class="unit">' + unit() + '</span></div><div class="week-sub">Average</div></div>' +
        (change != null ? '<div style="text-align:right">' + deltaChip(change, gwd) + '<div class="week-sub">vs week before</div></div>' : '') + '</div>' +
        (verdict ? '<p class="sheet-text" style="margin:10px 0 0">' + esc(verdict) + '</p>' : '') +
        (adj ? '<div class="stat-box" id="wkAdj" style="margin-top:16px;display:flex;align-items:center;gap:12px"><span class="ico">' + FLAME + '</span><div class="grow"><div class="row-t">' + (adj.goal ? 'Goal reached: now maintaining' : adj.hold ? 'Target kept' : 'Target ' + (adj.change > 0 ? 'raised' : 'lowered') + ' by ' + fmtKcal(Math.abs(adj.change)) + ' kcal') + '</div><div class="row-s" style="white-space:normal;overflow:visible">' + esc(tuneWhy(adj)) + '</div></div>' + (adj.hold ? '' : '<button type="button" class="text-btn" id="wkAdjUndo" style="margin:0">Undo</button>') + '</div>' : '') +
        '<div class="sv-key wk-key"><div><b class="num">' + w.n + '<small>/7</small></b><span>Weigh-ins</span></div><div><b class="num">' + fmtW(w.lo) + '</b><span>Lowest</span></div><div><b class="num">' + fmtW(w.hi) + '</b><span>Highest</span></div><div><b class="num">' + fmtW(w.hi - w.lo) + '</b><span>Range</span></div></div>';
    }
    body += weekNutrition(start);
    // Recent weeks
    const rows = [];
    for (let k = 1, st = start - 7; k <= 4; k++, st -= 7) { const x = weekStats(st); if (x) rows.push(x); }
    if (rows.length) {
      body += '<div class="label faint fd-sec wk-sec">Earlier weeks</div><div class="list">' + rows.map(function (x) {
        const pv = weekStats(x.start - 7), d = pv ? x.avg - pv.avg : null;
        return '<div class="row"><div class="grow"><div class="row-t">' + esc(weekRange(x.start)) + '</div><div class="row-s">' + x.n + ' days</div></div><span class="row-w num">' + fmtW(x.avg) + '</span><span class="delta">' + (d != null ? fmtDelta(d) : '') + '</span></div>';
      }).join('') + '</div>';
    }
    body += '<div style="height:16px"></div><button type="button" class="btn primary block" id="wkDone">Done</button>';
    openSheet(body, function (root) {
      $('#wkDone', root).addEventListener('click', function () { closeSheet(); });
      const u = $('#wkAdjUndo', root);
      if (u) u.addEventListener('click', function () { undoTune(adj); $('#wkAdj', root).remove(); toast('Target change undone'); });
    }, onClose);
  }

  function adjustSheet() {
    const p = state.profile, en = activeEnergy(), c = en && en.calc, auto = en && en.source === 'auto', t = state.ui.tune;
    const total = auto ? Math.round(en.tdee - c.tdee) : p.adjustKcal;
    const row = function (l, v) { return '<div class="row"><div class="grow row-t">' + l + '</div><span class="row-w num">' + v + '</span></div>'; };
    const sgn = function (v) { return (v > 0 ? '+' : v < 0 ? '−' : '') + fmtKcal(Math.abs(Math.round(v))); };
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">How your target learns</h2></div>' +
      '<div class="num" style="font-size:44px;font-weight:700;letter-spacing:-.04em;line-height:1">' + sgn(total) + '<span class="unit">kcal</span></div>' +
      '<p class="sheet-text" style="margin:10px 0 16px">' + (auto ? 'Your burn compared with the formula, learned from your real results.' : 'Change from weekly check-ins.') + '</p>' +
      (c ? '<div class="list">' + row('Formula estimate', fmtKcal(roundKcal(c.tdee))) +
        (state.settings.autoAdjust && p.adjustKcal ? row('Corrections from your weight trend', sgn(p.adjustKcal)) : '') +
        (auto && en.m && en.m.ready ? row('Your log (food + weight)', fmtKcal(roundKcal(en.m.tdee)) + ' · ' + Math.round(en.w * 100) + '% used') : '') +
        row('Burn used for your target', fmtKcal(roundKcal(en.tdee))) + '</div>' : '') +
      (t ? '<div class="stat-box" style="margin-top:14px"><div class="row-t">Last check · ' + esc(fmtDate(isoFromDay(t.at), { month: 'short', day: 'numeric' })) + '</div><div class="row-s" style="white-space:normal;overflow:visible">' + esc(tuneWhy(t)) + '</div></div>' : '') +
      '<p class="sheet-text" style="margin:16px 0 20px">This runs on its own. Each time you open the app, Setpoint compares your weight trend and what you logged with your plan. If you stall, it checks your food log first: if you ate over your target, the target stays; if you were on target, the estimate was off and the target moves (up to 150 kcal a week). The more days you log, the more your target is based on your real burn. Changing your goal or activity restarts the 2-week check, and reaching your goal switches you to maintenance.</p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="adjReset"' + (p.adjustKcal ? '' : ' disabled') + '>Reset corrections</button><button type="button" class="btn primary" id="adjOk">Done</button></div>',
      function (root) {
        $('#adjOk', root).addEventListener('click', function () { closeSheet(); });
        $('#adjReset', root).addEventListener('click', function () { const snap = snapshot(); p.adjustKcal = 0; p.adjustAt = dayNum(todayISO()); save(); renderAll(); closeSheet(); toast('Corrections reset', function () { restore(snap); }); });
      });
  }

  // "How this is worked out": the whole sum, step by step, in plain words. Only an explanation; the buttons live on the page.
  function targetExplainSheet() {
    const en = activeEnergy(), plan = makePlan(en); if (!en || !plan) return;
    const c = en.calc, p = state.profile, pace = plan.pace, u = unit(), t = p.training;
    const k = function (v) { return fmtKcal(Math.abs(Math.round(v))); }, sg = function (v) { return (v < 0 ? '−' : '+') + k(v); };
    const goalK = Math.round(pace.kg * KCAL_PER_KG / 7), rate = Number(Math.abs(toDisp(pace.kg)).toFixed(2)) + ' ' + u;
    const row = function (l, v, cls) { return '<div class="tx-r' + (cls ? ' ' + cls : '') + '"><span>' + l + '</span><b class="num">' + v + '</b></div>'; };
    const step = function (n, title, body) { return '<section class="tx-step"><div class="tx-sh"><span class="tx-n num">' + n + '</span><h3 class="tx-h">' + title + '</h3></div>' + body + '</section>'; };
    const para = function (x) { return '<p class="tx-p">' + x + '</p>'; };
    const item = function (dot, name, val, desc) { return '<div class="tx-part"><i class="' + dot + '"></i><div class="grow"><div class="tx-pt"><span>' + name + '</span><b class="num">' + val + '</b></div><div class="tx-pd">' + desc + '</div></div></div>'; };
    // The answer first, then where each number comes from.
    let h = para(pace.dir === 'maintain' ? 'Your target is simply what you burn in a day, so your weight stays where it is.' : 'Your target is what you burn in a day, ' + (pace.dir === 'lose' ? 'minus' : 'plus') + ' what it takes to ' + (pace.dir === 'lose' ? 'lose' : 'gain') + ' ' + rate + ' a week.') +
      '<div class="tx-eq">' + row('What you burn', k(en.tdee)) +
      (pace.dir !== 'maintain' ? row(pace.dir === 'lose' ? 'To lose ' + rate + ' a week' : 'To gain ' + rate + ' a week', sg(goalK)) : '') +
      (plan.adjust ? row('Weekly corrections', sg(plan.adjust)) : '') +
      row('Your daily target', k(plan.target) + ' kcal', 'tx-tot') + '</div>';
    // 1. Burn
    if (c) {
      const life = Math.max(0, c.life + en.tdee - c.tdee), learnedK = Math.round(en.tdee - c.tdee);
      h += step(1, 'How much you burn', para('Your body uses energy all day, even at rest. Eating this much keeps your weight steady. It adds up from four things:') +
        '<div class="tx-parts">' +
          item('o1', 'Resting', k(c.bmr), 'Keeping you alive: heart, brain, breathing. Based on your age, sex, height and weight' + (p.bodyFat ? ' and body fat' : '') + '.') +
          item('o2', 'Daily life', k(life), 'Moving around, standing, chores and digesting food.') +
          item('o3', 'Steps', k(c.steps), 'Your ' + fmtKcal(p.steps) + ' steps a day.') +
          item('o4', 'Training', k(c.train), t.days ? 'Your ' + t.days + ' workouts a week, shared out over all 7 days.' : 'No workouts in your Activity.') +
        '</div>' +
        (Math.abs(learnedK) >= 10 || en.source !== 'calc' ? '<div class="tx-note"><b>Learned from you.</b> ' + (en.source === 'measured' ? 'This comes only from your food log and weight trend: what you ate, and how your weight moved.' : 'A formula is only a starting point. Setpoint compares what you eat with how your weight actually moves, and found you burn about ' + k(learnedK) + ' kcal ' + (learnedK > 0 ? 'more' : 'less') + ' than the formula says.' + (en.source === 'auto' && en.w > 0 ? ' Right now ' + Math.round(en.w * 100) + '% of this number comes from your own log.' : '')) + '</div>' : ''));
    }
    // 2. Goal
    h += step(2, 'What your goal changes', pace.dir === 'maintain' ? para('Nothing: you eat about what you burn, so your weight stays steady.')
      : para('About 7,700 kcal makes 1 kg of body weight. ' + (pace.dir === 'lose' ? 'Losing' : 'Gaining') + ' ' + rate + ' a week takes about ' + k(Math.abs(goalK) * 7) + ' kcal a week, which is ' + k(goalK) + ' kcal a day ' + (pace.dir === 'lose' ? 'less' : 'more') + ' than you burn.') +
        (plan.eta ? para('At this pace you reach your goal on ' + plan.eta.replace(/^goal by /, '') + '.') : ''));
    // 3. Macros
    const lb = u === 'lb', per = function (v) { return Number((lb ? v / LB : v).toFixed(1)) + ' g per ' + u; };
    const refTxt = plan.refWhy === 'your weight' ? 'your weight' : plan.refWhy === 'your lean mass' ? 'your lean mass (' + Math.round(toDisp(plan.ref)) + ' ' + u + ')' : 'a healthy weight for your height (' + Math.round(toDisp(plan.ref)) + ' ' + u + ')';
    const why = plan.kind === 'strength' ? 'Higher because you lift' : plan.kind === 'cardio' ? 'Set for cardio training' : 'Set for no regular training';
    h += step(3, 'How the calories are split', para('Protein and fat are set first, because your body needs a certain amount of each. Carbs fill the rest.') +
      '<div class="tx-parts">' +
        item('d-p', 'Protein', plan.protein + ' g', per(plan.proteinPerKg) + ' of ' + refTxt + '. ' + (plan.custom ? 'You set this yourself.' : why + (pace.kg < 0 ? ', and a little higher while losing so you keep your muscle' : '') + '. Protein also keeps you full.')) +
        item('d-f', 'Fat', plan.fat + ' g', per(plan.fatPerKg) + ' of ' + refTxt + '. Needed for hormones and absorbing vitamins' + (plan.custom ? '.' : ', so it never drops below about a fifth of your calories.')) +
        item('d-c', 'Carbs', plan.carbs + ' g', 'Whatever is left. They are your main fuel for training and daily energy.') +
      '</div>' +
      (plan.refWhy === 'healthy weight for your height' ? '<div class="tx-note"><b>Why not your current weight?</b> Extra body fat doesn\'t need extra protein, so above a BMI of 25 these use the weight at BMI 25 for your height. If you add your body fat in About you, they use your lean mass instead.</div>' : ''));
    // Extras
    const sp = trainSplit();
    if (sp) h += step(4, 'Training days', para('On training days (' + weekOrder().filter(function (d) { return sp.days.indexOf(d) >= 0; }).map(function (d) { return dayAbbr(d); }).join(', ') + ') you get ' + k(Math.round(sp.tx / 10) * 10) + ' kcal more, and ' + k(Math.round(sp.rx / 10) * 10) + ' kcal less on rest days. The week adds up to the same total; only carbs move.'));
    if (state.settings.flex && state.settings.flex.on) h += step(sp ? 5 : 4, 'Flexible week', para('Your week\'s calories stay the same, but each day moves with what you ate earlier in the week.'));
    if (plan.warn) h += '<div class="tx-note tx-warn"><b>' + esc(plan.warn) + '.</b> ' + (plan.warn.indexOf('1%') >= 0 ? 'Losing faster than about 1% of your weight a week makes it hard to keep muscle. A slower pace is easier to stick to.' : 'Very low targets make it hard to get enough nutrients. A slower pace would help.') + '</div>';
    h += '<h3 class="tx-h tx-last">It stays up to date by itself</h3>' + para('Your target updates as your weight changes. Each time you open the app, Setpoint also checks your weight trend against your plan: if you stall while eating on target, your burn was overestimated and the target moves (up to 150 kcal a week). If you ate over your target, it stays. Changing your goal, activity or details updates it straight away.');
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">How your target is worked out</h2></div>' + h + '<p class="muted-note sv-src">These are estimates from standard formulas and your own log, not medical advice. Check with a doctor or dietitian before big changes, especially if you\'re pregnant, have a medical condition or a history of eating disorders.</p><div style="height:12px"></div><button type="button" class="btn primary block" id="txOk">Got it</button>', function (root) {
      $('#txOk', root).addEventListener('click', function () { closeSheet(); });
    });
  }

  const MILESTONES = { kg: [1, 2, 3, 5, 7.5, 10, 12.5, 15, 20, 25, 30, 40, 50], lb: [2, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100] };
  // Every milestone currently reached, as keys like "kg5" or "goal62.0".
  function reachedMilestones() {
    const l = entries(), down = goodWhenDown(), now = currentKg(), out = [];
    if (l.length < 3 || down == null || now == null) return out;
    const moved = toDisp(down ? l[0].kg - now : now - l[0].kg);
    MILESTONES[unit()].forEach(function (m) { if (moved >= m) out.push({ key: unit() + m, title: m + ' ' + unit() + (down ? ' down' : ' up'), sub: 'Since you started on ' + fmtDate(l[0].date, { month: 'short', day: 'numeric', year: 'numeric' }) }); });
    const g = state.settings.goalKg;
    if (g && (down ? now <= g : now >= g)) out.push({ key: 'goal' + g.toFixed(1), title: 'Goal reached', sub: 'Your trend hit ' + fmtW(g) + ' ' + unit() + '. Time to set a new one or maintain.' });
    return out;
  }
  // Data that arrives in bulk (sync, CSV import, backup restore) isn't new progress: don't celebrate it later.
  function markMilestonesSeen() { const seen = state.ui.milestones || []; reachedMilestones().forEach(function (m) { if (seen.indexOf(m.key) < 0) seen.push(m.key); }); state.ui.milestones = seen; }
  function checkMilestones() {
    const all = reachedMilestones(), seen = state.ui.milestones || [];
    const fresh = all.filter(function (m) { return seen.indexOf(m.key) < 0; });
    if (!fresh.length) return;
    state.ui.milestones = seen.concat(fresh.map(function (m) { return m.key; }));
    save();
    const best = fresh.filter(function (m) { return m.key.indexOf('goal') === 0; })[0] || fresh[fresh.length - 1];
    setTimeout(function () { celebrate(best); }, 900);
  }
  function celebrate(m) {
    const colors = ['var(--accent)', '#f6c453', '#ff7a8a', '#7ab8ff', 'var(--accent-text)'];
    let bits = '';
    for (let i = 0; i < 36; i++) bits += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + colors[i % colors.length] + ';animation-delay:' + (Math.random() * 0.6).toFixed(2) + 's;animation-duration:' + (1.6 + Math.random() * 1.2).toFixed(2) + 's;transform:rotate(' + Math.round(Math.random() * 360) + 'deg)"></i>';
    openSheet('<div class="confetti" aria-hidden="true">' + bits + '</div><div class="ob-hero" style="margin-top:18px"><span class="ob-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/></svg></span>' +
      '<h2 class="sheet-title" id="sheetTitle" style="font-size:30px">' + esc(m.title) + '</h2><p class="sheet-text" style="margin:8px 0 0">' + esc(m.sub) + '</p></div>' +
      '<button type="button" class="btn primary block" id="ceOk">Keep going</button>', function (root) { buzz('success'); $('#ceOk', root).addEventListener('click', function () { closeSheet(); }); });
  }

  function goalSheet() {
    const g = state.settings.goalKg;
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Goal weight</h2></div>' +
      '<div class="field sfx"><input class="input" id="gIn" inputmode="decimal" placeholder="' + (unit() === 'lb' ? '150.0' : '68.0') + '" value="' + (g ? fmtW(g) : '') + '" aria-label="Goal weight" autocomplete="off" /><em>' + unit() + '</em></div>' +
      '<div class="field"><span>By a date (optional)</span><input class="input" type="date" id="gBy" min="' + isoFromDay(dayNum(todayISO()) + 14) + '" aria-label="Reach it by" /></div>' +
      '<div id="gPlan"></div>' +
      '<p class="form-error" id="gErr" hidden></p>' +
      '<div class="btn-row">' + (g ? '<button type="button" class="btn soft" id="gClear">Remove</button>' : '') + '<button type="button" class="btn primary" id="gSave">Save</button></div>',
      function (root) {
        const inp = $('#gIn', root), by = $('#gBy', root);
        // With a date: the pace needed, snapped to the paces on offer (never faster than 1% of body weight a week).
        let chosen = null;
        const plan = function () {
          chosen = null; const box = $('#gPlan', root), v = parseNum(inp.value), kg = fromDisp(v), now = currentKg();
          if (!by.value || isNaN(v) || now == null) { box.innerHTML = ''; return; }
          const weeks = (dayNum(by.value) - dayNum(todayISO())) / 7, need = (kg - now) / weeks;
          if (weeks < 2 || Math.abs(kg - now) < 0.3) { box.innerHTML = ''; return; }
          const dir = need < 0 ? 'lose' : 'gain', opts = RATES[unit()][dir].map(function (o) { return unit() === 'lb' ? o / LB : o; }).filter(function (o) { return dir === 'gain' || o <= now * 0.01 + 1e-9; });
          const fit = opts.find(function (o) { return o >= Math.abs(need) - 1e-9; }), pick = fit != null ? fit : opts[opts.length - 1];
          chosen = (dir === 'lose' ? -1 : 1) * pick;
          const was = state.profile.paceKg; state.profile.paceKg = chosen; const pl = makePlan(activeEnergy()); state.profile.paceKg = was;
          const eta = new Date(); eta.setDate(eta.getDate() + Math.round(Math.abs(kg - now) / pick * 7));
          box.innerHTML = '<div class="stat-box gp-box"><div class="tr-row"><span>Needed</span><b class="num">' + fmtDelta(need) + ' ' + unit() + ' / week</b></div><div class="tr-row"><span>Your pace</span><b class="num">' + fmtDelta(chosen) + ' ' + unit() + ' / week</b></div>' + (pl ? '<div class="tr-row"><span>Daily target</span><b class="num">' + fmtKcal(roundKcal(pl.target)) + ' kcal</b></div>' : '') +
            '<p class="muted-note" style="margin:8px 0 0">' + (fit == null ? 'That\'s faster than is healthy. At this pace you\'d get there around ' + esc(fmtFuture(eta)) + '.' : 'You\'d get there around ' + esc(fmtFuture(eta)) + '.') + '</p></div>';
        };
        inp.addEventListener('input', plan); by.addEventListener('change', plan);
        const go = function () {
          const v = parseNum(inp.value), kg = fromDisp(v);
          if (isNaN(v) || kg < 20 || kg > 400) { const e = $('#gErr', root); e.textContent = 'That weight doesn\'t look right'; e.hidden = false; buzz('warn'); return; }
          state.settings.goalKg = Math.round(kg * 10000) / 10000; state.profile.paceKg = chosen; if (chosen != null) state.profile.paceAt = dayNum(todayISO());
          save(); closeSheet(); renderAll(); buzz('success'); toast('Goal set');
        };
        $('#gSave', root).addEventListener('click', go);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
        const c = $('#gClear', root);
        if (c) c.addEventListener('click', function () { const snap = snapshot(); state.settings.goalKg = null; save(); closeSheet(); renderAll(); toast('Goal removed', function () { restore(snap); }); });
      });
  }

  function phaseSheet() {
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">New phase</h2></div>' +
      '<p class="sheet-text">Your trend restarts from this date.</p>' +
      '<div class="field"><span>Type</span>' + segHtml('phType', [['Cut', 'Cut'], ['Bulk', 'Bulk'], ['Maintain', 'Maintain']], 'Cut') + '</div>' +
      field('Starts', '<input class="input" type="date" id="phDate" value="' + todayISO() + '" />') +
      '<button type="button" class="btn primary block" id="phSave">Start phase</button>',
      function (root) {
        let label = 'Cut';
        bindSeg(root, 'phType', function (v) { label = v; });
        $('#phSave', root).addEventListener('click', function () {
          const date = $('#phDate', root).value;
          if (!ISO_RE.test(date)) { buzz('warn'); return; }
          const snap = snapshot();
          state.phases = state.phases.filter(function (p) { return p.date !== date; });
          state.phases.push({ date: date, label: label });
          state.phases.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
          save(); closeSheet(); renderAll(); buzz('success');
          toast(label + ' started', function () { restore(snap); });
        });
      });
  }

  // First-run welcome: units → weight & goal → (optional) details → your plan.
  function welcomeSheet(step) {
    step = step || 1;
    const dots = '<div class="ob-dots">' + [1, 2, 3, 4].map(function (i) { return '<i class="' + (i <= step ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    const done = function () { state.ui.onboarded = true; save(); };
    let html;
    if (step === 1) {
      html = dots + '<div class="ob-hero"><span class="ob-logo"><img src="icon-192.png" alt="" /></span><h2 class="sheet-title" id="sheetTitle" style="font-size:28px">Welcome to Setpoint</h2>' +
        '<p class="sheet-text" style="margin:8px 0 0">Watch your trend, not the daily ups and downs.</p></div>' +
        '<div class="field"><span>Units</span>' + segHtml('obUnit', [['kg', 'kg'], ['lb', 'lb']], unit()) + '</div>' +
        '<button type="button" class="btn primary block" id="obNext">Get started</button>' +
        '<button type="button" class="text-btn center-btn" id="obAcct" style="margin-top:14px">I already have an account</button>' +
        '<p class="muted-note ob-legal">Setpoint gives estimates, not medical advice. By continuing you agree to the <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy Policy</a>.</p>';
    } else if (step === 2) {
      const latest = entries()[entries().length - 1], g = state.settings.goalKg;
      html = dots + '<h2 class="sheet-title" id="sheetTitle">Your weight</h2><p class="sheet-text" style="margin:6px 0 18px">Weigh in each morning for the best trend.</p>' +
        '<label class="field"><span>Today</span><div class="sfx"><input class="input big" id="obW" inputmode="decimal" placeholder="' + (unit() === 'lb' ? '160.0' : '72.0') + '" value="' + (latest ? fmtW(latest.kg) : '') + '" autocomplete="off" /><em>' + unit() + '</em></div></label>' +
        '<label class="field"><span>Goal <span class="faint">· optional</span></span><div class="sfx"><input class="input" id="obG" inputmode="decimal" value="' + (g ? fmtW(g) : '') + '" autocomplete="off" /><em>' + unit() + '</em></div></label>' +
        '<p class="form-error" id="obErr" hidden></p>' +
        '<button type="button" class="btn primary block" id="obNext">Next</button>';
    } else if (step === 3) {
      const p = state.profile;
      html = dots + '<h2 class="sheet-title" id="sheetTitle">About you</h2><p class="sheet-text" style="margin:6px 0 18px">For your daily calories and protein. You can skip this.</p>' +
        '<div class="field"><span>Sex</span>' + segHtml('obSex', [['female', 'Female'], ['male', 'Male'], ['other', 'Other']], p.sex) + '</div>' +
        '<div class="two"><label class="field"><span>Age</span><div class="sfx"><input class="input" id="obAge" inputmode="numeric" maxlength="3" value="' + (ageNow() || '') + '" autocomplete="off" /><em>yrs</em></div></label>' +
        (unit() === 'lb'
          ? '<label class="field"><span>Height</span><div class="two"><div class="sfx"><input class="input" id="obFt" inputmode="numeric" maxlength="1" autocomplete="off" /><em>ft</em></div><div class="sfx"><input class="input" id="obIn" inputmode="numeric" maxlength="2" autocomplete="off" /><em>in</em></div></div></label>'
          : '<label class="field"><span>Height</span><div class="sfx"><input class="input" id="obCm" inputmode="decimal" maxlength="5" value="' + (p.heightCm ? Math.round(p.heightCm) : '') + '" autocomplete="off" /><em>cm</em></div></label>') + '</div>' +
        '<p class="form-error" id="obErr" hidden></p>' +
        '<div class="btn-row"><button type="button" class="btn soft" id="obSkip">Skip</button><button type="button" class="btn primary" id="obNext">Next</button></div>';
    } else {
      const plan = makePlan(activeEnergy()), g = state.settings.goalKg;
      html = dots + '<div class="ob-hero"><span class="ob-check">' + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' + '</span><h2 class="sheet-title" id="sheetTitle">You\'re all set</h2></div>' +
        '<div class="stat-box"><div class="two" style="text-align:center">' +
          '<div><div class="num">' + (currentKg() != null ? fmtW(currentKg()) : '—') + '<span class="unit">' + unit() + '</span></div><div class="label faint">Starting trend</div></div>' +
          '<div><div class="num">' + (g ? fmtW(g) + '<span class="unit">' + unit() + '</span>' : '—') + '</div><div class="label faint">Goal</div></div></div>' +
          (plan ? '<div class="macros" style="margin-top:16px;padding-top:14px;border-color:var(--line)"><div><b>' + fmtKcal(roundKcal(plan.target)) + '</b><span>kcal a day</span></div><div><b>' + plan.protein + '<small>g</small></b><span>Protein</span></div><div><b>' + plan.pace.dir.charAt(0).toUpperCase() + plan.pace.dir.slice(1) + '</b><span>' + (plan.pace.kg ? Number(Math.abs(toDisp(plan.pace.kg)).toFixed(2)) + ' ' + unit() + '/wk' : 'Plan') + '</span></div></div>' : '') +
        '</div><p class="sheet-text" style="margin:16px 0 18px">Log your weight each morning. Your weekly check-in arrives every Monday.</p>' +
        '<button type="button" class="btn primary block" id="obNext">Start</button>';
    }
    openSheet(html, function (root) {
      const next = $('#obNext', root), err = function (m) { const x = $('#obErr', root); if (x) { x.textContent = m; x.hidden = !m; } if (m) buzz('warn'); };
      if (step === 1) {
        bindSeg(root, 'obUnit', function (v) { state.settings.unit = v; save(); renderAll(); });
        $('#obAcct', root).addEventListener('click', function () { done(); accountSheet(); });
        next.addEventListener('click', function () { welcomeSheet(2); });
      } else if (step === 2) {
        next.addEventListener('click', function () {
          const w = parseNum($('#obW', root).value), gRaw = $('#obG', root).value.trim(), g = gRaw ? parseNum(gRaw) : null;
          if (isNaN(w) || fromDisp(w) < 20 || fromDisp(w) > 400) return err('Enter your weight');
          if (gRaw && (isNaN(g) || fromDisp(g) < 20 || fromDisp(g) > 400)) return err('That goal doesn\'t look right');
          upsert({ date: todayISO(), kg: Math.round(fromDisp(w) * 10000) / 10000, note: '' });
          state.settings.goalKg = g != null ? Math.round(fromDisp(g) * 10000) / 10000 : null;
          save(); renderAll(); welcomeSheet(3);
        });
      } else if (step === 3) {
        let sex = state.profile.sex;
        bindSeg(root, 'obSex', function (v) { sex = v; });
        $('#obSkip', root).addEventListener('click', function () { welcomeSheet(4); });
        next.addEventListener('click', function () {
          const age = parseNum($('#obAge', root).value);
          const cm = unit() === 'lb' ? (parseNum($('#obFt', root).value) * 12 + (parseNum($('#obIn', root).value) || 0)) * 2.54 : parseNum($('#obCm', root).value);
          if (!sex) return err('Choose one for sex, or tap Skip');
          if (isNaN(age) || age < 13 || age > 100) return err('Age should be 13 to 100');
          if (isNaN(cm) || cm < 120 || cm > 230) return err('That height doesn\'t look right');
          const p = state.profile;
          p.sex = sex; p.birthYear = new Date().getFullYear() - Math.round(age); p.heightCm = Math.round(cm * 10) / 10;
          save(); renderAll(); welcomeSheet(4);
        });
      } else next.addEventListener('click', function () { closeSheet(); buzz('success'); });
    }, done);
  }

  function detailsSheet() {
    const p = state.profile, lb = unit() === 'lb';
    const ft = p.heightCm ? Math.floor(p.heightCm / 2.54 / 12) : '', inch = p.heightCm ? Math.round(p.heightCm / 2.54 % 12) : '';
    let sex = p.sex;
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">About you</h2></div>' +
      '<div class="field"><span>Sex</span>' + segHtml('dSex', [['female', 'Female'], ['male', 'Male'], ['other', 'Other']], sex) + '</div>' +
      field('Age', '<input class="input" id="dAge" inputmode="numeric" maxlength="3" placeholder="28" value="' + (ageNow() || '') + '" autocomplete="off" />') +
      (lb ? '<div class="field"><span>Height</span><div class="two"><div class="sfx"><input class="input" id="dFt" inputmode="numeric" maxlength="1" value="' + ft + '" aria-label="Feet" autocomplete="off" /><em>ft</em></div><div class="sfx"><input class="input" id="dIn" inputmode="numeric" maxlength="2" value="' + inch + '" aria-label="Inches" autocomplete="off" /><em>in</em></div></div></div>'
          : '<div class="field"><span>Height</span><div class="sfx"><input class="input" id="dCm" inputmode="decimal" maxlength="5" placeholder="170" value="' + (p.heightCm ? Math.round(p.heightCm) : '') + '" aria-label="Height" autocomplete="off" /><em>cm</em></div></div>') +
      '<div class="field"><span>Body fat <span class="faint">· optional</span></span><div class="sfx"><input class="input" id="dBf" inputmode="decimal" maxlength="4" value="' + (p.bodyFat || '') + '" aria-label="Body fat" autocomplete="off" /><em>%</em></div></div>' +
      '<p class="form-error" id="dErr" hidden></p>' +
      '<button type="button" class="btn primary block" id="dSave">Save</button>',
      function (root) {
        bindSeg(root, 'dSex', function (v) { sex = v; });
        const err = function (m) { const x = $('#dErr', root); x.textContent = m; x.hidden = false; buzz('warn'); };
        $('#dSave', root).addEventListener('click', function () {
          const age = parseNum($('#dAge', root).value);
          const cm = lb ? (parseNum($('#dFt', root).value) * 12 + (parseNum($('#dIn', root).value) || 0)) * 2.54 : parseNum($('#dCm', root).value);
          const bfRaw = $('#dBf', root).value.trim(), bf = bfRaw ? parseNum(bfRaw) : null;
          if (!sex) return err('Choose one for sex');
          if (isNaN(age) || age < 13 || age > 100) return err('Age should be 13 to 100');
          if (isNaN(cm) || cm < 120 || cm > 230) return err('That height doesn\'t look right');
          if (bfRaw && (isNaN(bf) || bf < 3 || bf > 60)) return err('Body fat should be 3 to 60%');
          const snap = snapshot();
          p.sex = sex; p.birthYear = new Date().getFullYear() - Math.round(age); p.heightCm = Math.round(cm * 10) / 10; p.bodyFat = bf != null ? Math.round(bf * 10) / 10 : null;
          save(); closeSheet(); renderAll(); buzz('success');
          toast('Saved', function () { restore(snap); });
        });
      });
  }

  function activitySheet() {
    const p = state.profile, t = p.training, snap = snapshot();
    let trainReset = false;
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Activity</h2><span class="pill" id="aLevel"></span></div>' +
      '<div class="ctl"><div class="ctl-head"><span class="label">Daily steps</span><span class="num" id="aSteps"></span></div><input type="range" id="aRange" min="0" max="25000" step="500" value="' + p.steps + '" aria-label="Daily steps" /></div>' +
      '<div class="ctl"><div class="ctl-head"><span class="label">Workouts a week</span><span class="stepper-mini"><button type="button" class="icon-btn" data-d="-1" aria-label="Fewer">' + MINUS + '</button><b class="num" id="aDays"></b><button type="button" class="icon-btn" data-d="1" aria-label="More">' + PLUS + '</button></span></div></div>' +
      '<div id="aTrain">' +
        '<div class="ctl"><div class="ctl-head"><span class="label">Type</span></div>' + segHtml('aType', [['lifting', 'Lifting'], ['cardio', 'Cardio'], ['mixed', 'HIIT'], ['sports', 'Sports']], t.type) + '</div>' +
        '<div class="ctl"><div class="ctl-head"><span class="label">Length</span></div>' + segHtml('aMin', [[30, '30m'], [45, '45m'], [60, '1h'], [90, '1.5h']], t.minutes) + '</div>' +
        '<div class="ctl"><div class="ctl-head"><span class="label">Effort</span></div>' + segHtml('aInt', [['light', 'Easy'], ['moderate', 'Moderate'], ['hard', 'Hard']], t.intensity) + '</div>' +
      '</div>' +
      '<button type="button" class="btn primary block" id="aDone">Done</button>',
      function (root) {
        const sync = function () {
          $('#aSteps', root).textContent = fmtKcal(p.steps);
          $('#aDays', root).textContent = t.days;
          $('#aTrain', root).hidden = t.days === 0;
          // Training weekdays must match workouts a week, or the week wouldn't add up.
          if (state.settings.train && state.settings.train.days.length !== t.days) { state.settings.train = null; trainReset = true; }
          const c = calcEnergy();
          $('#aLevel', root).textContent = c ? c.level : '';
          $('#aLevel', root).hidden = !c;
          save(); renderAll();
        };
        sync();
        $('#aRange', root).addEventListener('input', function () { p.steps = +this.value; sync(); });
        $$('[data-d]', root).forEach(function (b) { b.addEventListener('click', function () { t.days = Math.max(0, Math.min(7, t.days + +b.dataset.d)); buzz('light'); sync(); }); });
        bindSeg(root, 'aType', function (v) { t.type = v; sync(); });
        bindSeg(root, 'aMin', function (v) { t.minutes = +v; sync(); });
        bindSeg(root, 'aInt', function (v) { t.intensity = v; sync(); });
        $('#aDone', root).addEventListener('click', function () { closeSheet(); });
      },
      function () { if (snapshot() !== snap) p.paceAt = dayNum(todayISO()); save(); if (snapshot() !== snap) toast(trainReset ? 'Saved. Pick your training days again in Targets' : 'Activity saved', function () { restore(snap); }); });
  }

  function macrosSheet() {
    const p = state.profile, snap = snapshot(), lb = unit() === 'lb';
    const per = function (v) { return lb ? (v / LB).toFixed(2) + ' g/lb' : v.toFixed(1) + ' g/kg'; };
    const ctl = function (id, label) {
      return '<div class="ctl"><div class="ctl-head"><span class="label">' + label + '</span><span class="num" id="' + id + 'V"></span></div>' +
        '<input type="range" id="' + id + '" step="0.1" aria-label="' + label + '" />' +
        '<div class="range-foot"><span id="' + id + 'Lo"></span><button type="button" class="rec-btn" id="' + id + 'Rec"></button><span id="' + id + 'Hi"></span></div></div>';
    };
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Macros</h2><span class="pill" id="mTag"></span></div>' +
      '<div class="split" id="mBar"><i class="o4"></i><i class="o2"></i><i class="o1"></i></div>' +
      '<div class="macros" id="mPrev" style="border-top:0;padding-top:0;margin:12px 0 22px"></div>' +
      '<div class="label faint" style="margin:0 0 8px">Quick pick</div><div class="meal-chips" id="mPre"><button type="button" data-v="bal">Balanced</button><button type="button" data-v="hp">High protein</button><button type="button" data-v="lc">Lower carb</button></div>' +
      ctl('mP', 'Protein') + ctl('mF', 'Fat') +
      '<p class="warn" id="mWarn" style="margin:-8px 0 14px" hidden></p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="mReset">Recommended</button><button type="button" class="btn primary" id="mDone">Done</button></div>',
      function (root) {
        const P = $('#mP', root), F = $('#mF', root);
        // Presets stay inside the safe ranges: high protein = top of the protein range; lower carb = top of the fat range.
        $$('#mPre button', root).forEach(function (b) { b.addEventListener('click', function () {
          const plan = makePlan(activeEnergy()); if (!plan) return; const r = macroRanges(plan.pace.kg < 0);
          p.macros = b.dataset.v === 'bal' ? { protein: null, fat: null } : b.dataset.v === 'hp' ? { protein: r.protein[1], fat: r.fat[2] } : { protein: r.protein[2], fat: r.fat[1] };
          $$('#mPre button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          save(); renderAll(); buzz('light'); sync();
        }); });
        const sync = function () {
          const plan = makePlan(activeEnergy());
          if (!plan) return;
          const r = macroRanges(plan.pace.kg < 0);
          [[P, r.protein, plan.proteinPerKg, 'mP', plan.protein], [F, r.fat, plan.fatPerKg, 'mF', plan.fat]].forEach(function (x) {
            x[0].min = x[1][0]; x[0].max = x[1][1]; x[0].value = x[2];
            $('#' + x[3] + 'V', root).textContent = per(x[2]) + ' · ' + x[4] + ' g';
            $('#' + x[3] + 'Lo', root).textContent = per(x[1][0]);
            $('#' + x[3] + 'Hi', root).textContent = per(x[1][1]);
            $('#' + x[3] + 'Rec', root).textContent = 'Recommended ' + per(x[1][2]);
          });
          const kP = plan.protein * 4, kF = plan.fat * 9, kC = plan.carbs * 4, tot = Math.max(1, kP + kF + kC);
          const bars = $$('#mBar i', root);
          [kP, kF, kC].forEach(function (k, i) { bars[i].style.flexGrow = Math.max(1, Math.round(k)); });
          $('#mPrev', root).innerHTML = [['Protein', plan.protein, kP], ['Fat', plan.fat, kF], ['Carbs', plan.carbs, kC]].map(function (m) {
            return '<div><b>' + m[1] + '<small>g</small></b><span>' + m[0] + ' · ' + Math.round(m[2] / tot * 100) + '%</span></div>';
          }).join('');
          $('#mTag', root).textContent = plan.custom ? 'Custom' : 'Recommended';
          const w = plan.carbs < 50 ? 'Very little room left for carbs' : kF < plan.target * 0.2 ? 'Fat is under 20% of your calories' : '';
          $('#mWarn', root).textContent = w; $('#mWarn', root).hidden = !w;
          save(); renderAll();
        };
        const set = function (key, input) {
          const plan = makePlan(activeEnergy()), r = macroRanges(plan && plan.pace.kg < 0)[key];
          const v = Math.round(+input.value * 10) / 10;
          p.macros[key] = Math.abs(v - r[2]) < 0.001 ? null : v; // back on the recommended value = recommended
          sync();
        };
        P.addEventListener('input', function () { set('protein', P); });
        F.addEventListener('input', function () { set('fat', F); });
        P.addEventListener('change', function () { buzz('light'); });
        F.addEventListener('change', function () { buzz('light'); });
        $('#mPRec', root).addEventListener('click', function () { p.macros.protein = null; buzz('light'); sync(); });
        $('#mFRec', root).addEventListener('click', function () { p.macros.fat = null; buzz('light'); sync(); });
        $('#mReset', root).addEventListener('click', function () { p.macros.protein = null; p.macros.fat = null; buzz('medium'); sync(); });
        $('#mDone', root).addEventListener('click', function () { closeSheet(); });
        sync();
      },
      function () { save(); if (snapshot() !== snap) toast('Macros saved', function () { restore(snap); }); });
  }

  function guestSheet() {
    const g = state.guest, t = g.training, lb = unit() === 'lb';
    const ft = g.heightCm ? Math.floor(g.heightCm / 2.54 / 12) : '', inch = g.heightCm ? Math.round(g.heightCm / 2.54 % 12) : '';
    const inp = function (id, val, ph, sfx, mode, label) { return '<div class="sfx"><input class="input" id="' + id + '" inputmode="' + (mode || 'decimal') + '" maxlength="5" placeholder="' + ph + '" value="' + (val != null && val !== '' ? val : '') + '" aria-label="' + label + '" autocomplete="off" /><em>' + sfx + '</em></div>'; };
    openSheet(
      '<div class="sheet-head"><div><div class="label faint">Your plan stays the same</div><h2 class="sheet-title" id="sheetTitle">Someone else</h2></div><button type="button" class="text-btn" id="guClear" style="margin:0">Clear</button></div>' +
      '<div class="stat-box" id="guOut" style="margin-bottom:22px;position:sticky;top:30px;z-index:2;box-shadow:0 8px 18px -12px rgba(0,0,0,.35)"></div>' +
      '<div class="field"><span>Sex</span>' + segHtml('guSex', [['female', 'Female'], ['male', 'Male'], ['other', 'Other']], g.sex) + '</div>' +
      '<div class="two"><label class="field"><span>Age</span>' + inp('guAge', g.age, '30', 'yrs', 'numeric', 'Age') + '</label>' +
        '<label class="field"><span>Weight</span>' + inp('guKg', g.kg != null ? fmtW(g.kg) : '', lb ? '160' : '72', unit(), 'decimal', 'Weight') + '</label></div>' +
      (lb ? '<div class="field"><span>Height</span><div class="two">' + inp('guFt', ft, '5', 'ft', 'numeric', 'Feet') + inp('guIn', inch, '8', 'in', 'numeric', 'Inches') + '</div></div>'
          : '<label class="field"><span>Height</span>' + inp('guCm', g.heightCm ? Math.round(g.heightCm) : '', '170', 'cm', 'decimal', 'Height') + '</label>') +
      '<div class="ctl" style="margin-top:6px"><div class="ctl-head"><span class="label">Daily steps</span><span class="num" id="guSteps"></span></div><input type="range" id="guRange" min="0" max="25000" step="500" value="' + g.steps + '" aria-label="Daily steps" /></div>' +
      '<div class="ctl"><div class="ctl-head"><span class="label">Workouts a week</span><span class="stepper-mini"><button type="button" class="icon-btn" data-gd="-1" aria-label="Fewer">' + MINUS + '</button><b class="num" id="guDays"></b><button type="button" class="icon-btn" data-gd="1" aria-label="More">' + PLUS + '</button></span></div></div>' +
      '<div id="guTrain">' +
        '<div class="ctl">' + segHtml('guType', [['lifting', 'Lifting'], ['cardio', 'Cardio'], ['mixed', 'HIIT'], ['sports', 'Sports']], t.type) + '</div>' +
        '<div class="ctl">' + segHtml('guMin', [[30, '30m'], [45, '45m'], [60, '1h'], [90, '1.5h']], t.minutes) + '</div>' +
        '<div class="ctl">' + segHtml('guInt', [['light', 'Easy'], ['moderate', 'Moderate'], ['hard', 'Hard']], t.intensity) + '</div>' +
      '</div>' +
      '<div class="ctl"><div class="ctl-head"><span class="label">Goal</span></div><div class="seg" id="guDir"><button type="button" data-v="lose">Lose</button><button type="button" data-v="maintain">Maintain</button><button type="button" data-v="gain">Gain</button></div><div class="rates" id="guRates"></div></div>' +
      '<button type="button" class="btn primary block" id="guDone">Done</button>',
      function (root) {
        const val = function (id) { const el = $('#' + id, root); return el ? parseNum(el.value) : NaN; };
        const read = function () {
          const age = val('guAge'), w = val('guKg');
          g.age = !isNaN(age) && age >= 13 && age <= 100 ? Math.round(age) : null;
          g.kg = !isNaN(w) && fromDisp(w) >= 20 && fromDisp(w) <= 400 ? Math.round(fromDisp(w) * 100) / 100 : null;
          const cm = lb ? (val('guFt') * 12 + (val('guIn') || 0)) * 2.54 : val('guCm');
          g.heightCm = !isNaN(cm) && cm >= 120 && cm <= 230 ? Math.round(cm * 10) / 10 : null;
        };
        const sync = function () {
          $('#guSteps', root).textContent = fmtKcal(g.steps);
          $('#guDays', root).textContent = t.days;
          $('#guTrain', root).hidden = t.days === 0;
          const pace = snapPace(g.paceKg);
          $$('#guDir button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === pace.dir); });
          $('#guRates', root).innerHTML = pace.dir === 'maintain' ? '' : RATES[unit()][pace.dir].map(function (v, i) { return '<button type="button" data-gr="' + i + '" aria-pressed="' + (i === pace.i) + '">' + v + '</button>'; }).join('') + '<span class="rates-u">' + unit() + ' / week</span>';
          $('#guRates', root).hidden = pace.dir === 'maintain';
          const out = $('#guOut', root);
          if (!g.sex || g.age == null || g.heightCm == null || g.kg == null) {
            out.innerHTML = '<p class="muted-note" style="text-align:center;padding:10px 0;margin:0">Add sex, age, weight and height</p>';
          } else {
            const en = energyFor({ sex: g.sex, age: g.age, heightCm: g.heightCm, steps: g.steps, training: t }, g.kg);
            const plan = planFor({ tdee: en.tdee, bmr: en.bmr, kg: g.kg, pace: pace, goal: null, p: { sex: g.sex, heightCm: g.heightCm, bodyFat: null, macros: null, training: t } });
            out.innerHTML = '<div class="two" style="text-align:center"><div><div class="num">' + fmtKcal(roundKcal(en.tdee)) + '</div><div class="label faint">Maintenance</div></div>' +
              '<div><div class="num" style="color:var(--accent-text)">' + fmtKcal(roundKcal(plan.target)) + '</div><div class="label faint">' + (pace.dir === 'maintain' ? 'Target' : pace.dir === 'lose' ? 'To lose' : 'To gain') + '</div></div></div>' +
              '<div class="macros" style="margin-top:14px;padding-top:12px;border-color:var(--line)"><div><b>' + plan.protein + '<small>g</small></b><span>Protein</span></div><div><b>' + plan.fat + '<small>g</small></b><span>Fat</span></div><div><b>' + plan.carbs + '<small>g</small></b><span>Carbs</span></div></div>' +
              '<p class="muted-note" style="text-align:center;margin:10px 0 0">' + esc(macroNote(plan)).replace(/; change your workouts.*$/, '.') + '</p>' +
              '<div class="t-sub" style="text-align:center;margin-top:10px">' + en.level + (plan.warn ? ' · <span style="color:var(--danger)">' + esc(plan.warn) + '</span>' : '') + '</div>';
          }
          save();
        };
        sync();
        $$('input.input', root).forEach(function (el) { el.addEventListener('input', function () { read(); sync(); }); });
        bindSeg(root, 'guSex', function (v) { g.sex = v; sync(); });
        $('#guRange', root).addEventListener('input', function () { g.steps = +this.value; sync(); });
        $$('[data-gd]', root).forEach(function (b) { b.addEventListener('click', function () { t.days = Math.max(0, Math.min(7, t.days + +b.dataset.gd)); buzz('light'); sync(); }); });
        bindSeg(root, 'guType', function (v) { t.type = v; sync(); });
        bindSeg(root, 'guMin', function (v) { t.minutes = +v; sync(); });
        bindSeg(root, 'guInt', function (v) { t.intensity = v; sync(); });
        $('#guDir', root).addEventListener('click', function (e) {
          const b = e.target.closest('button'); if (!b) return;
          g.paceKg = paceValue(b.dataset.v, b.dataset.v === 'lose' ? 1 : 0); buzz('light'); sync();
        });
        $('#guRates', root).addEventListener('click', function (e) {
          const b = e.target.closest('[data-gr]'); if (!b) return;
          g.paceKg = paceValue(snapPace(g.paceKg).dir, +b.dataset.gr); buzz('light'); sync();
        });
        $('#guClear', root).addEventListener('click', function () { state.guest = migrate({}).guest; save(); buzz('medium'); guestSheet(); });
        $('#guDone', root).addEventListener('click', function () { closeSheet(); });
      });
  }

  // How close the formula is to your real burn, and how much to trust that.
  function estimateCheck(m, c) {
    if (!m || !m.ready || !c) return '';
    const diff = m.tdee - c.tdee, pct = Math.round(diff / c.tdee * 100);
    const conf = m.calDays >= m.needCal * 1.6 && m.span >= m.needSpan * 1.5 ? ['High', 'hi'] : m.calDays >= m.needCal * 1.2 ? ['Medium', 'mid'] : ['Low', 'low'];
    const verdict = Math.abs(pct) <= 5 ? 'The formula fits you well.' : (pct > 0 ? 'You burn about ' + pct + '% more than the formula thinks.' : 'You burn about ' + Math.abs(pct) + '% less than the formula thinks.') + (conf[1] === 'low' ? ' Keep logging to be sure.' : ' Basing your target on your log would be more accurate.');
    return '<div class="ec-box"><div class="ec-top"><b>Estimate check</b><span class="src-tag src-' + conf[1] + '">' + conf[0] + ' confidence</span></div><p>' + verdict + '</p><small>' + m.calDays + ' days with calories over ' + m.span + ' days of weigh-ins</small></div>';
  }
  // Patterns from your own log: what tends to come before a higher or lower weigh-in the next morning.
  function weightInsights() {
    const wBy = {}; state.entries.forEach(function (e) { wBy[dayNum(e.date)] = e.kg; });
    const rows = [];
    Object.keys(wBy).forEach(function (k) {
      const d = +k; if (wBy[d + 1] == null) return;
      const iso = isoFromDay(d), t = dayTotals(iso); if (!t.kcal || t.kcal < 600) return;
      const r = { delta: wBy[d + 1] - wBy[d], kcal: t.kcal, carbs: t.carbs };
      if (foodDB) { const nd = dayNutrients(iso); if (nd.cov.na > 0.7 && nd.tot.na > 0) r.na = nd.tot.na; }
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
  function fmtNum(v) { return Math.round(v).toLocaleString(); }
  function insightsSheet() {
    const draw = function (root) {
      const r = weightInsights();
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">From your own log</div><h2 class="sheet-title" id="sheetTitle">What moves your weight</h2></div></div>' +
        (r.n < 14 ? '<p class="muted-note fd-empty">Needs a bit more data: days with food logged and a weigh-in the next morning. ' + r.n + ' of 14 so far.</p>' :
          '<div class="list">' + r.items.map(function (x) { const up = x.d > 0; return '<div class="row fd-row ins-row"><div class="grow"><div class="row-t">' + esc(x.t) + '</div><div class="row-s" style="white-space:normal">' + esc(x.s) + '</div><div class="ins-note">' + esc(x.note) + '</div></div><span class="ins-v num ' + (Math.abs(x.d) < 0.15 && !x.week ? 'flat' : up ? 'up' : 'down') + '">' + (x.week ? '' : (up ? '+' : '−') + fmtW(Math.abs(x.d)) + ' ' + unit()) + '</span></div>'; }).join('') + '</div>' +
          '<p class="muted-note sv-src">Next-morning change in your weigh-in, compared between your highest and lowest third of days. ' + r.n + ' days so far.</p>');
    };
    openSheet('<div id="insRoot"></div>', function (body) {
      sheet.classList.add('tall'); const root = $('#insRoot', body); root.innerHTML = '<p class="muted-note fd-empty">Looking for patterns…</p>';
      loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) draw(root); });
    }, function () { sheet.classList.remove('tall'); });
  }
  // Fajr and Maghrib for a place and day (standard astronomical method; Fajr angle depends on the local authority).
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
  function ramadanTimes(day) { const r = state.settings.ramadan; return r && r.on ? prayerTimes(day, r.lat, r.lon, r.fa) : null; }
  function hm(ms) { const m = Math.max(0, Math.round(ms / 60000)); return (m >= 60 ? Math.floor(m / 60) + 'h ' : '') + (m % 60) + 'm'; }
  let ramTimer = null;
  // The Islamic (Umm al-Qura) date, from the phone's own calendar: { y, m, d }, or null if the phone can't tell.
  function hijri(date) {
    try {
      const o = {}; new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date).forEach(function (x) { if (x.type !== 'literal') o[x.type] = parseInt(x.value, 10); });
      return o.month && o.year ? { y: o.year, m: o.month, d: o.day } : null;
    } catch (e) { return null; }
  }
  // During Ramadan, offer to turn Ramadan mode on; after Eid, offer to turn it off. Each offer can be dismissed for the year.
  function ramadanOffer() {
    if (viewDay !== todayISO()) return '';
    const h = hijri(new Date()), r = state.settings.ramadan; if (!h) return '';
    const x = '<button type="button" class="hint-x" data-ram-x="' + h.y + '" aria-label="Not now"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button>';
    if (h.m === 9 && !(r && r.on) && state.ui.ramAsk !== String(h.y)) return '<div class="card ram-card ram-offer"><span class="ico ico-s">' + MOON_IC + '</span><div class="grow"><b>Ramadan Mubarak</b><span>Turn on Ramadan mode: Suhoor and Iftar meals, with fasting times for your city.</span><button type="button" class="btn sm tint" data-action="ramadan">Turn on</button></div>' + x + '</div>';
    if (h.m === 10 && h.d <= 10 && r && r.on && state.ui.ramOff !== String(h.y)) return '<div class="card ram-card ram-offer"><span class="ico ico-s">' + MOON_IC + '</span><div class="grow"><b>Eid Mubarak</b><span>Ramadan is over. Turn Ramadan mode off to get your usual meals back?</span><button type="button" class="btn sm tint" data-ram-off="' + h.y + '">Turn off</button></div>' + x.replace('data-ram-x', 'data-ram-x2') + '</div>';
    return '';
  }
  function ramadanBanner() {
    const r = state.settings.ramadan;
    clearInterval(ramTimer); ramTimer = null;
    const offer = ramadanOffer(); if (offer || !r || !r.on || viewDay !== todayISO()) return offer;
    ramTimer = setInterval(function () { const el = $('#ramLine'); if (el) el.innerHTML = ramLine(); else { clearInterval(ramTimer); ramTimer = null; } }, 60000);
    return '<div class="card ram-card"><span class="ico ico-s">' + MOON_IC + '</span><div class="grow" id="ramLine">' + ramLine() + '</div><button type="button" class="icon-btn" data-action="ramadan" aria-label="Ramadan settings">' + COG_IC + '</button></div>';
  }
  function ramLine() {
    const now = new Date(), t = ramadanTimes(now), tm = ramadanTimes(new Date(now.getTime() + 864e5)); if (!t) return '';
    const left = Math.max(0, waterGoal() - waterTotal(todayISO())), clock = function (d) { return fmtClock(d.getTime()); };
    if (now >= t.fajr && now < t.maghrib) return '<b>Fasting · Iftar at ' + clock(t.maghrib) + '</b><span>' + hm(t.maghrib - now) + ' to go · Suhoor ended ' + clock(t.fajr) + '</span>';
    const fajr = now < t.fajr ? t.fajr : tm.fajr;
    return '<b>Eating window · Suhoor until ' + clock(fajr) + '</b><span>' + hm(fajr - now) + ' left' + (left > 0 ? ' · drink ' + fmtVol(left) + ' more before Fajr' : ' · water goal done') + '</span>';
  }
  function fmtVol(ml) { return ml >= 1000 ? (Math.round(ml / 100) / 10) + ' L' : Math.round(ml) + ' ml'; }
  function ramadanSheet() {
    const cur = state.settings.ramadan;
    let on = !!(cur && cur.on), pick = cur ? { city: cur.city, lat: cur.lat, lon: cur.lon, fa: cur.fa } : { city: 'Cairo', lat: 30.0444, lon: 31.2357, fa: 19.5 };
    const draw = function (root) {
      const t = prayerTimes(new Date(), pick.lat, pick.lon, pick.fa);
      root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Ramadan mode</h2></div>' +
        '<p class="sheet-text">Breakfast becomes Suhoor and dinner becomes Iftar, and today\'s Diary shows the time to Iftar or to the end of Suhoor, plus how much water is left before Fajr.</p>' +
        '<div class="list"><label class="row"><div class="grow row-t">Ramadan mode</div><span class="switch"><input type="checkbox" id="rmOn"' + (on ? ' checked' : '') + ' /><i></i></span></label></div>' +
        '<div class="field" style="margin-top:14px"><span>City</span><select class="input" id="rmCity">' + RAM_CITIES.map(function (c) { return '<option' + (c[0] === pick.city ? ' selected' : '') + '>' + c[0] + '</option>'; }).join('') + (RAM_CITIES.some(function (c) { return c[0] === pick.city; }) ? '' : '<option selected>' + esc(pick.city || 'My location') + '</option>') + '</select></div>' +
        '<button type="button" class="text-btn" id="rmLoc">Use my location</button>' +
        '<div class="stat-box rm-times"><div><b class="num">' + fmtClock(t.fajr.getTime()) + '</b><span>Fajr (Suhoor ends)</span></div><div><b class="num">' + fmtClock(t.maghrib.getTime()) + '</b><span>Maghrib (Iftar)</span></div></div>' +
        '<p class="muted-note" style="text-align:start">Calculated times can differ from your local mosque by a few minutes.</p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="rmSave">Save</button></div>';
      $('#rmOn', root).addEventListener('change', function () { on = this.checked; buzz('light'); });
      $('#rmCity', root).addEventListener('change', function () { const c = RAM_CITIES.find(function (x) { return x[0] === this.value; }, this); if (c) { pick = { city: c[0], lat: c[1], lon: c[2], fa: c[3] }; draw(root); } });
      $('#rmLoc', root).addEventListener('click', function () {
        if (!navigator.geolocation) { toast('Location isn\'t available here'); return; }
        const b = this; b.textContent = 'Finding you…';
        navigator.geolocation.getCurrentPosition(function (pos) { pick = { city: 'My location', lat: Math.round(pos.coords.latitude * 1000) / 1000, lon: Math.round(pos.coords.longitude * 1000) / 1000, fa: 18 }; buzz('success'); draw(root); }, function () { b.textContent = 'Use my location'; toast('Couldn\'t get your location'); }, { timeout: 10000 });
      });
      $('#rmSave', root).addEventListener('click', function () { state.settings.ramadan = on ? { on: true, city: pick.city, lat: pick.lat, lon: pick.lon, fa: pick.fa } : null; applyMeals(); save(); renderAll(); closeSheet(); buzz('success'); toast(on ? 'Ramadan mode on · Ramadan Kareem' : 'Ramadan mode off'); });
    };
    openSheet('<div id="rmRoot"></div>', function (body) { draw($('#rmRoot', body)); });
  }
  // Days around a period when water weight is common: 5 days before to 2 days after each start, plus the next expected one.
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
  function cycleSheet() {
    const draw = function (root) {
      const c = state.settings.cycle;
      root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Cycle and weight</h2></div>' +
        '<p class="sheet-text">Many women hold 0.5–2 kg of water in the days before and around their period. With this on, those days are shaded on your weight chart so a jump doesn\'t look like a stall.</p>' +
        '<div class="list"><label class="row"><div class="grow row-t">Show on the weight chart</div><span class="switch"><input type="checkbox" id="cyOn"' + (c.on ? ' checked' : '') + ' /><i></i></span></label></div>' +
        (c.on ? '<div class="field" style="margin-top:14px"><span>Add a period start</span><div class="sv-amt" style="grid-template-columns:1fr auto;margin:0"><input class="input" type="date" id="cyD" max="' + todayISO() + '" value="' + todayISO() + '" /><button type="button" class="btn soft" id="cyAdd" style="height:50px">Add</button></div></div>' +
          (c.starts.length ? '<div class="list">' + c.starts.slice().reverse().map(function (d) { return '<div class="row fd-row"><div class="grow row-t">' + esc(fmtDate(d, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })) + '</div><button type="button" class="icon-btn me-rm" data-cyx="' + d + '" aria-label="Remove">' + TRASH + '</button></div>'; }).join('') + '</div>' : '<p class="muted-note">Add your last period start to begin. After two or more, the next one is estimated from your own cycle length.</p>') : '') +
        '<p class="muted-note sv-src">Stays private in your Setpoint data. It only changes how the chart is shaded.</p>';
      $('#cyOn', root).addEventListener('change', function () { c.on = this.checked; save(); renderChart(); buzz('light'); draw(root); });
      if ($('#cyAdd', root)) $('#cyAdd', root).addEventListener('click', function () { const v = $('#cyD', root).value; if (!ISO_RE.test(v) || v > todayISO()) return; if (c.starts.indexOf(v) < 0) { c.starts.push(v); c.starts.sort(); } save(); renderChart(); buzz('success'); draw(root); });
      $$('[data-cyx]', root).forEach(function (b) { b.addEventListener('click', function () { c.starts = c.starts.filter(function (x) { return x !== b.dataset.cyx; }); save(); renderChart(); buzz('light'); draw(root); }); });
    };
    openSheet('<div id="cyRoot"></div>', function (body) { draw($('#cyRoot', body)); });
  }
  function flexSheet() {
    const fx = state.settings.flex || { on: false, big: null, extra: 0 };
    let on = !!fx.on, big = fx.big != null ? fx.big : 5, extra = fx.extra || 0;
    const DAYS = [0, 1, 2, 3, 4, 5, 6].map(function (d) { return [d, new Date(Date.UTC(2024, 0, 7 + d)).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })]; });
    const draw = function (root) {
      root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Flexible week</h2></div>' +
        '<p class="sheet-text">Your week\'s calories stay the same, but each day adjusts: eat less early in the week and later days get more, or the other way round. You can also give one day extra, like a family lunch.</p>' +
        '<div class="list"><label class="row"><div class="grow row-t">Flexible week</div><span class="switch"><input type="checkbox" id="fxOn"' + (on ? ' checked' : '') + ' /><i></i></span></label></div>' +
        (on ? '<div class="field" style="margin-top:14px"><span>Bigger day</span><div class="seg fx-days" id="fxBig">' + DAYS.map(function (x) { return '<button type="button" data-v="' + x[0] + '" aria-pressed="' + (extra > 0 && big === x[0]) + '">' + esc(x[1]) + '</button>'; }).join('') + '</div></div>' +
          '<div class="field"><span>Extra on that day</span><div class="seg" id="fxEx">' + [0, 200, 400, 600, 800].map(function (v) { return '<button type="button" data-v="' + v + '" aria-pressed="' + (extra === v) + '">' + (v ? '+' + v : 'None') + '</button>'; }).join('') + '</div></div>' +
          '<p class="muted-note" style="text-align:start">Days stay between 75% and 135% of your normal target, and never below ' + (state.profile.sex === 'male' ? '1,500' : '1,200') + ' kcal. Days you don\'t log count as on plan.</p>' : '') +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="fxSave">Save</button></div>';
      $('#fxOn', root).addEventListener('change', function () { on = this.checked; buzz('light'); draw(root); });
      $$('#fxBig button', root).forEach(function (b) { b.addEventListener('click', function () { big = +b.dataset.v; if (!extra) extra = 400; buzz('light'); draw(root); }); });
      $$('#fxEx button', root).forEach(function (b) { b.addEventListener('click', function () { extra = +b.dataset.v; buzz('light'); draw(root); }); });
      $('#fxSave', root).addEventListener('click', function () { state.settings.flex = on ? { on: true, big: extra ? big : null, extra: extra } : null; save(); renderAll(); closeSheet(); buzz('success'); toast(on ? 'Flexible week on' : 'Flexible week off'); });
    };
    openSheet('<div id="fxRoot"></div>', function (body) { draw($('#fxRoot', body)); });
  }
  function realTdeeSheet() {
    const m = measuredEnergy(), c = calcEnergy(), en = activeEnergy();
    let body;
    if (!m.ready) {
      const pct = (Math.min(m.calDays, m.needCal) / m.needCal + Math.min(m.span, m.needSpan) / m.needSpan) * 50;
      body = '<p class="sheet-text">Formulas can be 10–15% off. Log everything you eat in the Diary, drinks and snacks too, and Setpoint will work out your real burn and start using it on its own.</p>' +
        '<div class="stat-box"><div class="two">' +
          '<div><div class="num">' + Math.min(m.calDays, m.needCal) + '<span class="unit">/ ' + m.needCal + '</span></div><div class="label faint">days with calories</div></div>' +
          '<div><div class="num">' + Math.min(m.span, m.needSpan) + '<span class="unit">/ ' + m.needSpan + '</span></div><div class="label faint">days of weigh-ins</div></div>' +
        '</div><div class="bar" style="margin-top:16px"><i style="width:' + pct.toFixed(0) + '%"></i></div></div>';
    } else {
      const sv = state.profile.tdeeSource;
      body = '<div class="num" style="font-size:46px;font-weight:700;letter-spacing:-.04em;line-height:1">' + fmtKcal(roundKcal(m.tdee)) + '<span class="unit">kcal</span></div>' +
        '<p class="sheet-text" style="margin:10px 0 20px">You ate ' + fmtKcal(roundKcal(m.intake)) + ' a day and your weight moved ' + fmtDelta(m.rateKgWk, 2) + ' ' + unit() + ' a week.' + (c ? ' The formula says ' + fmtKcal(roundKcal(c.tdee)) + '.' : '') + '</p>' + estimateCheck(m, c) +
        '<div class="field"><span>Base your target on</span><div class="seg" id="rSrc"><button type="button" data-v="auto" aria-pressed="' + (sv === 'auto') + '"' + (c ? '' : ' disabled') + '>Automatic</button><button type="button" data-v="calc" aria-pressed="' + (sv === 'calc') + '"' + (c ? '' : ' disabled') + '>Formula</button><button type="button" data-v="measured" aria-pressed="' + (sv === 'measured') + '">Your log</button></div></div>' +
        '<p class="muted-note" style="text-align:start">' + (sv === 'auto' ? 'Automatic uses ' + Math.round((en && en.w || 0) * 100) + '% your log right now, more as you log more days.' : sv === 'calc' ? 'Formula plus weekly corrections from your weight trend.' : 'Only your log, nothing from the formula.') + '</p>';
    }
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Your real burn</h2></div><p class="sheet-text" style="margin-top:-4px">How many calories you actually burn in a day (also called TDEE), worked out from what you eat and how your weight changes, instead of a formula.</p>' + body, function (root) {
      if ($('#rSrc', root)) bindSeg(root, 'rSrc', function (v) { state.profile.tdeeSource = v; save(); renderAll(); closeSheet(); realTdeeSheet(); });
    });
  }

  function whatsNewSheet() {
    hideToast();
    openSheet('<div class="sheet-head"><div class="grow"><div class="label faint">Setpoint ' + APP_VERSION + '</div><h2 class="sheet-title" id="sheetTitle">What\'s new</h2></div></div><div class="changes" data-notr dir="ltr">' +
      (function () { const one = function (c) { return '<h3>Version ' + c.v + '</h3><ul>' + c.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>'; };
        const n = /\.0$/.test(CHANGES[0].v) ? 1 : 3; // a big release stands on its own
        return CHANGES.slice(0, n).map(one).join('') + (CHANGES.length > n ? '<details class="wn-old"><summary>Earlier versions (' + (CHANGES.length - n) + ')</summary>' + CHANGES.slice(n).map(one).join('') + '</details>' : ''); })() +
      '</div><div style="height:20px"></div><div class="btn-row"><button type="button" class="btn soft" id="wnUp">Check for updates</button><button type="button" class="btn primary" id="wnOk">Done</button></div>',
      function (root) { $('#wnOk', root).addEventListener('click', function () { closeSheet(); }); $('#wnUp', root).addEventListener('click', function () { closeSheet(); checkUpdate(); }); });
    state.seenVersion = APP_VERSION; save();
  }

  // The newest feature you haven't seen yet (versions since the one you last opened), if any is worth announcing.
  function featureNews(seen) {
    const i = CHANGES.findIndex(function (c) { return c.v === seen; }); if (i < 0) return null; // unknown version: stay quiet
    const since = CHANGES.slice(0, i);
    for (let k = 0; k < since.length; k++) if (since[k].announce) return since[k].announce;
    return null;
  }
  // A one-time card for a new feature: what it is, why it helps, and a button straight to it.
  const NEWS_IC = {
    plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M8 14h4M8 17h7"/></svg>'
  };
  const NEWS_GO = { plan: function () { planDaySheet(); } };
  function spotlightSheet(n) {
    const TK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    openSheet('<div class="ns"><div class="ns-art"><span>' + (NEWS_IC[n.icon] || NEWS_IC.plan) + '</span></div><span class="ns-tag">New</span>' +
      '<h2 class="sheet-title" id="sheetTitle">' + esc(n.title) + '</h2><p class="ns-text">' + esc(n.text) + '</p>' +
      (n.points ? '<ul class="ns-pts">' + n.points.map(function (x) { return '<li><i>' + TK + '</i><span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' : '') +
      '<button type="button" class="btn primary block" id="nsGo">' + esc(n.cta || 'Try it') + '</button>' +
      '<div class="ns-more"><button type="button" class="text-btn" id="nsLater">Not now</button><span aria-hidden="true">·</span><button type="button" class="text-btn" id="nsAll">See all updates</button></div></div>',
      function (root) {
        $('#nsGo', root).addEventListener('click', function () { buzz('light'); closeSheet(); const go = NEWS_GO[n.go]; if (go) setTimeout(go, 280); });
        $('#nsLater', root).addEventListener('click', function () { closeSheet(); });
        $('#nsAll', root).addEventListener('click', function () { closeSheet(); setTimeout(whatsNewSheet, 280); });
      });
  }
  // Settings → Legal: the four policy pages.
  function legalSheet() {
    const DOC = '<span class="ico ico-s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/></svg></span>';
    const CH = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
    const a = function (href, t, s) { return '<a class="row" href="' + href + '">' + DOC + '<div class="grow"><div class="row-t">' + t + '</div><div class="row-s">' + s + '</div></div>' + CH + '</a>'; };
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Legal</h2></div><div class="list">' +
      a('privacy.html', 'Privacy Policy', 'What we collect, and your rights') + a('terms.html', 'Terms of Use', 'Including: not medical advice') +
      a('cookies.html', 'Cookies &amp; storage', 'No tracking, nothing optional') + a('refunds.html', 'Refund Policy', 'For future paid features') + '</div>');
  }
  function confirmSheet(title, text, okLabel, danger, onOk) {
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">' + esc(title) + '</h2></div><p class="sheet-text">' + text + '</p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="cfNo">Cancel</button><button type="button" class="btn ' + (danger ? 'danger' : 'primary') + '" id="cfOk">' + esc(okLabel) + '</button></div>',
      function (root) { $('#cfNo', root).addEventListener('click', function () { closeSheet(); }); $('#cfOk', root).addEventListener('click', function () { closeSheet(); onOk(); }); });
  }

