  /* ================= Energy ================= */
  // e.g. "2 g protein and ~0.8 g fat per kg of body weight. Carbs are the rest."
  function macroNote(plan) {
    const lb = unit() === 'lb';
    const g = function (perKg) { return String(Number((lb ? perKg / LB : perKg).toFixed(1))); };
    const base = plan.refWhy === 'your weight' ? 'body weight'
      : (plan.refWhy === 'your lean mass' ? 'lean mass' : 'a healthy weight for your height') + ' (' + Math.round(toDisp(plan.ref)) + ' ' + unit() + ')';
    const why = plan.custom ? '' : ' Protein is set for ' + (plan.kind === 'strength' ? 'lifting' : plan.kind === 'cardio' ? 'cardio training' : 'no regular training') + (plan.pace && plan.pace.kg < 0 ? ' while losing' : '') + '; change your workouts in Activity if that\'s not right.';
    return (plan.custom ? 'Your split: ' : '') + g(plan.proteinPerKg) + ' g protein and ' + (plan.custom ? '' : '~') + g(plan.fatPerKg) + ' g fat per ' + unit() + ' of ' + base + '. Carbs are the rest.' + why;
  }

  // Targets is a short menu: a summary of today's target, then a page each for your goal, calories & macros and daily burn.
  let tgView = null, tvSnap = '';
  const TG_SECS = { goal: 'Goal', cal: 'Targets', burn: 'Energy expenditure' };
  function showTgView() {
    $$('#panel-targets .tg-sec').forEach(function (s) { s.hidden = s.dataset.sec !== tgView; });
    $('#tgHome').hidden = !!tgView; $('#tgTitle').textContent = tgView ? TG_SECS[tgView] : 'Plan';
  }
  function tgOpen(k) {
    pageMove('push', function () {
      if (!tgView) { tvSnap = $('#tgHome').innerHTML; navPush('tv'); } // from one page to another: still one step back to the menu
      tgView = k; showTgView();
    });
  }
  function tgClose(fromBack) { if (!tgView) return; pageMove('pop', function () { tgView = null; if (fromBack !== true) navDrop('tv'); showTgView(); }); }
  function renderTgHome(plan, en) {
    const CH = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
    const menu = $('#tgMenu');
    const row = function (k, act, ic, cls, t, s, v) { return '<button type="button" class="row tg-mrow" ' + (k ? 'data-tg="' + k + '"' : 'data-action="' + act + '"') + '><span class="ico ' + cls + '">' + ic + '</span><div class="grow"><div class="row-t">' + t + '</div><div class="row-s">' + s + '</div></div>' + (v ? '<span class="row-v num">' + v + '</span>' : '') + CH + '</button>'; };
    const FLAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>';
    const TGT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>';
    let h = plan ? row('cal', '', TGT, 'ic-c-green', 'Targets', 'Macros & micros', fmtKcal(roundKcal(plan.target)) + ' kcal')
      : row('burn', '', TGT, 'ic-c-green', 'Targets', profileReady() ? 'Log your weight to work them out' : 'Add your age, sex and height to start', '');
    if (plan) {
      const p = plan.pace, g = state.settings.goalKg;
      const ps = p.dir === 'maintain' ? 'Keep your weight steady' : (p.dir === 'lose' ? 'Lose ' : 'Gain ') + RATES[unit()][p.dir][p.i] + ' ' + unit() + ' a week';
      h += row('goal', '', FLAG, 'ic-c-blue', 'Goal', esc(ps), g ? fmtW(g) + ' ' + unit() : 'Set');
    }
    h += row('burn', '', FLAME, 'ic-c-orange', 'Energy expenditure', en ? esc(en.source === 'measured' ? 'From your food log' : en.source === 'auto' && (en.w > 0) ? 'Learned from you' : 'Estimated for you') : 'Activity, age, height and weight', en ? fmtKcal(roundKcal(en.tdee)) : '');
    menu.innerHTML = h;
    renderNutTable();
  }
  function renderEnergy() {
    const p = state.profile, en = activeEnergy(), plan = makePlan(en), m = measuredEnergy(), kgNow = currentKg();
    const hero = $('#energyHero'), card = $('#planCard'), gc = $('#goalCard');
    card.hidden = !plan; gc.hidden = !plan;
    const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';

    // 1. Your daily burn (maintenance): one number, one bar, four parts.
    if (!en) {
      const needD = !profileReady(), needW = kgNow == null;
      hero.innerHTML = '<div class="tg-k">Your daily burn</div>' +
        '<div class="tg-empty-t">Let\'s work out your targets</div>' +
        '<p class="tg-empty-s">' + (needD ? 'Add your age, sex and height' + (needW ? ', then log your weight.' : '.') : 'Log your weight to finish.') + '</p>' +
        '<button type="button" class="btn primary block" data-action="' + (needD ? 'details' : 'log') + '">' + (needD ? 'Get started' : 'Log weight') + '</button>';
    } else {
      const c = en.calc, learned = en.source === 'measured' ? 'From your log' : en.source === 'auto' && (en.w > 0 || Math.abs(en.tdee - c.tdee) >= 10) ? 'Learned from you' : 'Estimated';
      let h = '<button type="button" class="tg-burn-top" data-action="tg-explain"><div class="grow"><div class="tg-k">Your daily burn</div>' +
        '<div class="tg-burn-v num">' + fmtKcal(roundKcal(en.tdee)) + '<span class="unit">kcal</span></div>' +
        '<div class="tg-burn-s">' + esc(learned) + (c ? ' · ' + esc(c.level) : '') + '</div></div>' + CHEV + '</button>';
      if (c) {
        // What the formula got wrong shows up in daily life (everyday movement varies most), so the parts add up to the burn used.
        const parts = [['Resting', c.bmr, 'o1'], ['Daily life', Math.max(0, c.life + en.tdee - c.tdee), 'o2'], ['Steps', c.steps, 'o3'], ['Training', c.train, 'o4']];
        h += '<div class="burn tg-bar">' + parts.map(function (x) { return '<i class="' + x[2] + '" style="flex-grow:' + Math.max(1, Math.round(x[1])) + '"></i>'; }).join('') + '</div>' +
          '<div class="tg-key">' + parts.map(function (x) { return '<div><span><i class="' + x[2] + '"></i>' + x[0] + '</span><b class="num">' + fmtKcal(roundKcal(x[1])) + '</b></div>'; }).join('') + '</div>';
      }
      hero.innerHTML = h;
    }

    if (plan) {
      const pace = plan.pace, diff = plan.target - en.tdee, kc = [['Protein', plan.protein, 4, 'p'], ['Carbs', plan.carbs, 4, 'c'], ['Fat', plan.fat, 9, 'f']];
      const tot = kc.reduce(function (a, x) { return a + x[1] * x[2]; }, 0) || 1;
      // 2. The daily target: the number you eat to, how it relates to your burn, and the three macros.
      const rel = Math.abs(diff) < 5 ? 'Same as your burn' : fmtKcal(Math.abs(roundKcal(diff))) + ' kcal ' + (diff < 0 ? 'below' : 'above') + ' your burn';
      card.innerHTML = '<div class="tg-k">Daily target</div>' +
        '<div class="tg-big num"><span data-an="' + roundKcal(plan.target) + '">' + fmtKcal(roundKcal(plan.target)) + '</span><span class="unit">kcal</span></div>' +
        '<div class="tg-rel">' + esc(rel) + '</div>' +
        (plan.warn ? '<div class="tg-warn">' + esc(plan.warn) + '</div>' : '') +
        '<div class="tg-mac">' + kc.map(function (x) { return '<button type="button" class="tg-m" data-action="macros"><span class="tg-m-l"><i class="d-' + x[3] + '"></i>' + x[0] + '</span><b class="num"><span data-an="' + x[1] + '" data-af="g">' + x[1] + '</span><small>g</small></b><span class="tg-m-p num">' + Math.round(x[1] * x[2] / tot * 100) + '%</span></button>'; }).join('') + '</div>' +
        '<div class="tg-links"><button type="button" class="tg-how" data-action="macros"><span class="grow">Protein &amp; fat</span><span class="tg-how-v">' + (plan.custom ? 'Your own' : 'Recommended') + '</span>' + CHEV + '</button>' +
        '<button type="button" class="tg-how" data-action="tg-explain"><span class="grow">How this is worked out</span>' + CHEV + '</button></div>';
      animate(card, 'target');
      // 3. Your goal: direction, pace and goal weight, together in one place.
      const g = state.settings.goalKg;
      const etaD = plan.eta && plan.eta.replace(/^goal by /, '');
      gc.innerHTML = '<div class="card-head"><h2 class="card-title">' + (g && etaD && pace.dir !== 'maintain' ? 'Reach ' + fmtW(g) + ' ' + unit() + ' by ' + esc(etaD) : 'Your goal') + '</h2></div>' +
        '<div class="seg"><button type="button" data-dir="lose" aria-pressed="' + (pace.dir === 'lose') + '">Lose</button><button type="button" data-dir="maintain" aria-pressed="' + (pace.dir === 'maintain') + '">Maintain</button><button type="button" data-dir="gain" aria-pressed="' + (pace.dir === 'gain') + '">Gain</button></div>' +
        (pace.dir !== 'maintain' ? '<div class="tg-rate-l">How fast, per week</div><div class="rates">' + RATES[unit()][pace.dir].map(function (v, i) { return '<button type="button" data-rate="' + i + '" aria-pressed="' + (i === pace.i) + '" aria-label="' + v + ' ' + unit() + ' per week">' + v + ' ' + unit() + '</button>'; }).join('') + '</div>' : '') +
        '<button type="button" class="tg-gw" data-action="goal"><span>Goal weight</span><b class="num">' + (g ? fmtW(g) + ' ' + unit() : 'Set') + '</b>' + CHEV + '</button>' +
        '<button type="button" class="tg-gw tg-gw2" data-tg="cal"><span>Daily target</span><b class="num">' + fmtKcal(roundKcal(plan.target)) + ' kcal</b>' + CHEV + '</button>';
    }
    const t = p.training;
    $('#actSub').textContent = fmtKcal(p.steps) + ' steps · ' + (t.days ? t.days + '× ' + { lifting: 'lifting', cardio: 'cardio', mixed: 'HIIT', sports: 'sports' }[t.type] + ' a week' : 'no workouts');
    if (profileReady()) {
      const h = unit() === 'lb' ? Math.floor(p.heightCm / 2.54 / 12) + '′' + Math.round(p.heightCm / 2.54 % 12) + '″' : Math.round(p.heightCm) + ' cm';
      $('#detailsSub').textContent = { female: 'Female', male: 'Male', other: 'Other' }[p.sex] + ' · ' + ageNow() + ' · ' + h + (p.bodyFat ? ' · ' + p.bodyFat + '% fat' : '');
    } else $('#detailsSub').textContent = 'Not set';
    const own = Object.keys(state.profile.nutT || {}).length;
    $('#nutTSub').textContent = own ? own + (own === 1 ? ' set by you' : ' set by you') : state.profile.sex && state.profile.birthYear ? 'Recommended for your age and sex' : 'Add your age and sex for personal targets';
    $('#realSub').textContent = m.ready ? (en && (en.source === 'measured' || en.source === 'auto' && en.w > 0) ? 'From your food log · in use' : 'From your food log · ready') : state.settings.trackCalories ? 'Learning from your food log' : 'Off';
    $('#realVal').textContent = m.ready ? fmtKcal(roundKcal(m.tdee)) : state.settings.trackCalories ? Math.min(m.calDays, m.needCal) + '/' + m.needCal : '';
    renderTgHome(plan, en);
  }

