  /* ================= Meal planner + foods high in a nutrient ================= */
  // Everyday foods both tools can count on (USDA ids, plus a few Egyptian dishes). Your own foods come first;
  // these fill in. Each has a role, the amount range that makes sense for one person, and a natural unit to round to.
  const PF = {
    egg: ['u2707154', 'p', 50, 150], feta: ['u173420', 'f', 20, 60], cottage: ['u2705747', 'p', 100, 250], greek: ['u2705421', 'p', 120, 300], yog: ['u2705417', 'd', 120, 250], milk: ['u2705384', 'd', 150, 300],
    chicken: ['u171477', 'p', 80, 250], tilapia: ['u2706320', 'p', 100, 250], beef: ['u2705847', 'p', 80, 200], tawook: ['u9000024', 'p', 80, 240], kofta: ['u9000022', 'p', 60, 180], tuna: ['u2706311', 'p', 60, 170], salmon: ['u2706285', 'p', 80, 200],
    ful: ['u2707367', 'c', 100, 300], lentils: ['u2707423', 'c', 100, 300], chickpeas: ['u2707414', 'c', 80, 250],
    oats: ['u169705', 'c', 30, 100], bread: ['u172688', 'c', 30, 130], pita: ['u2707616', 'c', 40, 130], rice: ['u2708403', 'c', 80, 350], brown: ['u2708409', 'c', 80, 350], pasta: ['u2708357', 'c', 80, 350], potato: ['u2709382', 'c', 100, 350], sweetpot: ['u2709697', 'c', 100, 350], quinoa: ['u168917', 'c', 80, 300],
    banana: ['u173944', 'x', 80, 180], apple: ['u2709215', 'x', 100, 220], orange: ['u169097', 'x', 100, 220], dates: ['u171726', 'x', 15, 60],
    cucumber: ['u2709784', 'v', 60, 200], tomato: ['u2709719', 'v', 60, 200], lettuce: ['u2709789', 'v', 30, 120], broccoli: ['u2709647', 'v', 80, 200], carrots: ['u170393', 'v', 50, 150], molokhia: ['u9000008', 'v', 150, 350],
    oil: ['u171413', 'f', 0, 20], pb: ['u2707537', 'f', 10, 40], almonds: ['u170567', 'f', 10, 40], honey: ['u169640', 'x', 0, 25]
  };
  // Meal ideas: breakfast (b), main meals (m) and snacks (s). Each is a list of PF keys.
  const PLAN_IDEAS = {
    b: [['egg', 'bread', 'feta', 'cucumber', 'tomato'], ['oats', 'milk', 'banana', 'pb'], ['greek', 'oats', 'honey', 'almonds'], ['ful', 'pita', 'egg', 'tomato', 'oil'], ['egg', 'pita', 'cottage', 'cucumber']],
    m: [['chicken', 'rice', 'cucumber', 'tomato', 'oil'], ['tilapia', 'potato', 'broccoli', 'oil'], ['beef', 'pasta', 'tomato', 'oil'], ['tawook', 'pita', 'lettuce', 'tomato'], ['kofta', 'rice', 'cucumber', 'tomato'],
      ['chicken', 'sweetpot', 'broccoli', 'oil'], ['salmon', 'quinoa', 'lettuce', 'oil'], ['lentils', 'rice', 'carrots', 'oil'], ['tuna', 'pasta', 'lettuce', 'tomato', 'oil'], ['chicken', 'molokhia', 'rice'], ['chickpeas', 'brown', 'tomato', 'cucumber', 'oil']],
    s: [['greek', 'banana'], ['apple', 'almonds'], ['dates', 'milk'], ['yog', 'orange'], ['cottage', 'apple'], ['banana', 'pb']]
  };
  function mealKind(k) {
    const n = (mealName(k) || '').toLowerCase();
    if (/breakfast|suhoor|morning/.test(k + ' ' + n)) return 'b';
    if (/lunch|dinner|iftar|supper/.test(k + ' ' + n)) return 'm';
    return 's';
  }
  // Grams for a food that read well: whole units (2 eggs, 1 slice) when the food has one, else steps of 5 or 10 g.
  function niceAmount(f, g, role) {
    const ok = /^(large|medium|small|egg|slice|piece|fillet|small\/regular fillet|pita|small pita|skewer|bowl|fruit|date|tbsp|container)$/;
    const u = role === 'v' ? null : unitsFor(f).find(function (x) { return !x.mine && ok.test(x.label) && x.g >= 8 && x.g <= 260; });
    // whole eggs, skewers, fillets and fruit; halves only where they're normal (a slice, a pita, a bowl)
    if (u) { const half = /slice|pita|bowl|tbsp/.test(u.label), q = Math.max(half ? 0.5 : 1, half ? Math.round(g / u.g * 2) / 2 : Math.round(g / u.g)); if (Math.abs(q * u.g - g) / Math.max(g, 1) < 0.3) return { qty: q, unit: u.label, g: Math.round(q * u.g * 10) / 10 }; }
    const step = g < 40 ? 5 : 10, gg = Math.max(step, Math.round(g / step) * step);
    return { qty: gg, unit: 'g', g: gg };
  }
  // Amounts for a meal's foods so it lands on its calories, protein, carbs and fat (simple projected gradient descent).
  function fitMeal(foods, tgt) {
    const n = foods.length, per = foods.map(function (x) { const f = x.f; return [per100(f, 'kcal') || 0, per100(f, 'p') || 0, per100(f, 'c') || 0, per100(f, 'f') || 0].map(function (v) { return v / 100; }); });
    const g = foods.map(function (x) { return x.fixed != null ? x.fixed : x.lo; });
    const w = [1, 4 * 1.3, 4, 9], T = [tgt.kcal, tgt.p, tgt.c, tgt.f]; // every miss counted in calories; protein a bit more
    const tot = function () { const t = [0, 0, 0, 0]; for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) t[k] += per[i][k] * g[i]; return t; };
    // Coordinate descent: each food in turn moves to the amount that best fits, within its sensible range.
    for (let round = 0; round < 60; round++) {
      let moved = 0;
      for (let i = 0; i < n; i++) {
        if (foods[i].fixed != null) continue;
        const t = tot(); let num = 0, den = 0;
        for (let k = 0; k < 4; k++) { const ww = w[k] * w[k]; num += ww * (t[k] - T[k]) * per[i][k]; den += ww * per[i][k] * per[i][k]; }
        if (!den) continue;
        const ng = Math.max(foods[i].lo, Math.min(foods[i].hi, g[i] - num / den));
        moved += Math.abs(ng - g[i]); g[i] = ng;
      }
      if (moved < 0.5) break;
    }
    return foods.map(function (x, i) {
      const a = x.fixed != null ? { qty: x.qty, unit: x.unit, g: x.fixed } : niceAmount(x.f, g[i], x.role), m = macrosFor(x.f, a.g);
      return Object.assign({ ref: x.f.id, name: x.f.name.slice(0, 80), g: a.g, qty: a.qty, unit: a.unit }, m);
    });
  }
  function pfFood(key) { const d = PF[key]; const f = d && getFood(d[0]); return f ? { f: f, lo: d[2], hi: d[3], role: d[1] } : null; }
  // One meal: your usual foods for it if you have them (kept at your usual amounts), otherwise a fresh idea.
  function planMeal(mealKey, tgt, seed, useMine) {
    const kind = mealKind(mealKey), ideas = PLAN_IDEAS[kind], usual = useMine && seed === 0 ? usualFor(mealKey) : null;
    let foods = [];
    if (usual && usual.length) {
      usual.forEach(function (it) { const f = getFood(it.ref); if (f) foods.push({ f: f, fixed: it.g, qty: it.qty, unit: it.unit }); });
      // top up with a flexible food so the meal still reaches its share
      const fixedK = foods.reduce(function (a, x) { return a + (per100(x.f, 'kcal') || 0) * x.fixed / 100; }, 0);
      if (fixedK < tgt.kcal * 0.8) {
        const add = pfFood(kind === 'b' ? 'bread' : kind === 'm' ? 'rice' : 'banana'), same = add && foods.find(function (x) { return x.f.id === add.f.id; });
        // already one of your usual foods: have more of it rather than listing it twice
        if (same) { same.lo = same.fixed; same.hi = Math.max(same.fixed * 2, add.hi); same.role = add.role; delete same.fixed; delete same.qty; delete same.unit; }
        else if (add) foods.push(add);
      }
    } else {
      const idea = ideas[(seed + mealKey.length * 7) % ideas.length];
      idea.forEach(function (k) { const x = pfFood(k); if (x) foods.push(x); });
    }
    return { meal: mealKey, kind: kind, items: fitMeal(foods, tgt), mine: !!(usual && usual.length) };
  }
  // A whole day of meals for your targets (the plan stands on its own; you choose the date when you add it).
  function planDay(seeds, useMine, meals) {
    const pl = makePlan(activeEnergy()); if (!pl) return null;
    const open = MEALS.map(function (m) { return m[0]; }).filter(function (k) { return !meals || meals.indexOf(k) >= 0; });
    if (!open.length) return { meals: [], target: null };
    const share = { b: 25, m: 35, s: 10 }, wsum = open.reduce(function (a, k) { return a + share[mealKind(k)]; }, 0);
    const T = { kcal: roundKcal(pl.target), p: pl.protein, c: pl.carbs, f: pl.fat };
    const out = open.map(function (k) { const s = share[mealKind(k)] / wsum; return planMeal(k, { kcal: T.kcal * s, p: T.p * s, c: T.c * s, f: T.f * s }, seeds[k] || 0, useMine); });
    return { meals: out, target: T };
  }
  function mealSum(items) { return items.reduce(function (a, x) { a.kcal += x.kcal; a.p += x.protein; a.c += x.carbs; a.f += x.fat; return a; }, { kcal: 0, p: 0, c: 0, f: 0 }); }
  // Your plan is kept (which ideas, which meals) so it's the same when you come back.
  function dietOpts() {
    const o = state.ui.diet || {}, keys = MEALS.map(function (m) { return m[0]; });
    const meals = Array.isArray(o.meals) ? o.meals.filter(function (k) { return keys.indexOf(k) >= 0; }) : [];
    return { seeds: o.seeds && typeof o.seeds === 'object' ? Object.assign({}, o.seeds) : {}, mine: o.mine !== false, meals: meals.length ? meals : keys };
  }
  function planDaySheet(date) {
    const o = dietOpts(); let seeds = o.seeds, useMine = o.mine, meals = o.meals, plan = null, step = 'plan', skipFull = true, opened = false, lastOff = null, popKey = null, pdChanged = null;
    // the day it goes on: the one you opened it from, else today if it's still empty, else tomorrow
    let to = date || (eatenFor(todayISO()).some(function (x) { return !isDailyTotal(x); }) ? isoFromDay(dayNum(todayISO()) + 1) : todayISO());
    const keep = function () { state.ui.diet = { seeds: seeds, mine: useMine, meals: meals.length === MEALS.length ? null : meals }; save(); };
    const SHUF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>';
    const AGAIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4"/></svg>';
    const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    const headPlan = '<div class="sheet-head"><div class="grow"><div class="label faint">Your plan</div><h2 class="sheet-title" id="sheetTitle">Meal planner</h2></div></div>';
    const ring = function (v, t) {
      const r = 46, c = 2 * Math.PI * r, pc = t ? Math.min(1, v / t) : 0;
      return '<div class="pd-ring"><svg viewBox="0 0 108 108" aria-hidden="true"><circle cx="54" cy="54" r="' + r + '" class="pd-ring-bg"/><circle cx="54" cy="54" r="' + r + '" class="pd-ring-fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pc)).toFixed(1) + '"/></svg>' +
        '<div><b class="num" data-an="' + v + '" data-af="k">' + fmtKcal(v) + '</b><span>of ' + fmtKcal(t) + ' kcal</span></div></div>';
    };
    const macro = function (lbl, v, t, k) {
      const near = t && Math.abs(v - t) <= Math.max(5, t * 0.06);
      return '<div class="pd-mac-r"><span class="pd-dot mb-' + k + '"></span><span class="pd-mac-l">' + lbl + '</span><b class="num"><span data-an="' + v + '" data-af="g">' + v + '</span><small> / ' + t + ' g</small></b>' + (near ? '<i class="pd-ok" title="On target">' + TICK + '</i>' : '<i class="pd-ok off"></i>') +
        '<span class="bar"><i data-aw class="mb-' + k + '" style="width:' + (t ? Math.min(100, Math.round(v / t * 100)) : 0) + '%"></i></span></div>';
    };
    const drawPlan = function (root) {
      plan = planDay(seeds, useMine, meals);
      let h = headPlan;
      if (!plan) { root.innerHTML = h + '<p class="muted-note fd-empty">Set your targets first, then Setpoint can plan a day around them.</p><button type="button" class="btn primary block" data-action="go-targets">Set targets</button>'; return; }
      const all = []; plan.meals.forEach(function (m) { m.items.forEach(function (x) { all.push(x); }); });
      const tot = mealSum(all), T = plan.target;
      h += '<div class="card pd-hero">' + ring(tot.kcal, T.kcal) + '<div class="pd-macs">' + macro('Protein', tot.p, T.p, 'p') + macro('Carbs', tot.c, T.c, 'c') + macro('Fat', tot.f, T.f, 'f') + '</div></div>';
      h += '<label class="pd-mine-t"><span class="grow"><b>Learn from my entries</b><small>Builds meals from the foods and amounts you log most</small></span><span class="switch"><input type="checkbox" id="pdMine"' + (useMine ? ' checked' : '') + ' /><i></i></span></label>';
      // every meal has its own small switch; a meal that's off folds down to its name
      const byKey = {}; plan.meals.forEach(function (m) { byKey[m.meal] = m; });
      const mini = function (k, on, name) { return '<label class="mini-sw" title="' + (on ? 'Planned' : 'Not planned') + '"><input type="checkbox" data-pd-meal="' + k + '"' + (on ? ' checked' : '') + ' aria-label="Plan ' + esc(name) + '" /><i></i></label>'; };
      MEALS.forEach(function (mm) {
        const m = byKey[mm[0]], name = mealName(mm[0]);
        if (!m) { h += '<div class="card pd-card pd-off" data-m="' + mm[0] + '"><div class="pd-ch"><div class="grow"><b>' + esc(name) + '</b><span class="pd-cs">Not planned</span></div>' + mini(mm[0], false, name) + '</div></div>'; return; }
        const ms = mealSum(m.items);
        h += '<div class="card pd-card" data-m="' + m.meal + '"><div class="pd-ch"><div class="grow"><b>' + esc(name) + '</b><span class="pd-cs">' + (m.mine ? '<em>Your usual</em> · ' : '') + 'P ' + ms.p + ' · C ' + ms.c + ' · F ' + ms.f + '</span></div><span class="pd-ck num">' + fmtKcal(ms.kcal) + '<small> kcal</small></span>' + mini(m.meal, true, name) + '</div>' +
          m.items.map(function (x) { const f = getFood(x.ref); return '<div class="pd-row">' + (f ? ftIcon(ftKind(f)) : '') + '<div class="grow"><div class="row-t">' + esc(shortName(x.name)) + '</div><div class="row-s">' + esc(fmtAmt(x.qty, x.unit)) + '</div></div><span class="num pd-rk">' + fmtKcal(x.kcal) + '</span></div>'; }).join('') +
          '<button type="button" class="pd-again" data-pd-shuf="' + m.meal + '">' + AGAIN + 'Another idea</button></div>';
      });
      h += '<p class="muted-note sv-src">A starting point from your targets, not medical advice. Swap anything you don\'t like after adding it.</p>' +
        '<div class="sheet-foot pd-foot"><button type="button" class="icon-btn pd-all" id="pdAll" aria-label="Shuffle the whole day">' + SHUF + '</button><button type="button" class="btn primary grow" id="pdNext">Add to diary</button></div>';
      root.innerHTML = h;
      const fg = $('.pd-ring-fg', root), off = fg ? +fg.getAttribute('stroke-dashoffset') : 0;
      if (fg && fg.dataset) fg.dataset.off = off;
      if (!opened && !calmMotion()) {
        // first look: the ring draws in, the numbers count up and the meals rise in one after another
        opened = true; animMem.pd = null;
        const C = +fg.getAttribute('stroke-dasharray'), num = $('.pd-ring b', root), to = +num.dataset.an, t0 = performance.now();
        fg.style.transition = 'none'; fg.setAttribute('stroke-dashoffset', C); fg.getBoundingClientRect();
        requestAnimationFrame(function () { fg.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)'; fg.setAttribute('stroke-dashoffset', off); });
        (function step(t) { const k = Math.min(1, (t - t0) / 900); num.textContent = fmtKcal(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1 && num.isConnected) requestAnimationFrame(step); })(t0);
        $$('[data-aw]', root).forEach(function (b) { const w = b.style.width; b.style.transition = 'none'; b.style.width = '0%'; b.getBoundingClientRect(); requestAnimationFrame(function () { b.style.transition = 'width .9s cubic-bezier(.22,1,.36,1)'; b.style.width = w; }); });
        $$('.pd-card', root).forEach(function (c, n) { c.style.animationDelay = (120 + n * 70) + 'ms'; c.classList.add('pd-new'); });
        animate(root, 'pd');
      } else {
        if (fg && lastOff != null && lastOff !== off) { fg.style.transition = 'none'; fg.setAttribute('stroke-dashoffset', lastOff); fg.getBoundingClientRect(); fg.style.transition = 'stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)'; fg.setAttribute('stroke-dashoffset', off); }
        animate(root, 'pd');
      }
      lastOff = off;
      if (popKey) { pdChanged = popKey; popKey = null; } // the meal you switched: redraw() resizes it smoothly
      $$('[data-pd-shuf]', root).forEach(function (b) { b.addEventListener('click', function () { const k = b.dataset.pdShuf; seeds[k] = (seeds[k] || 0) + 1; keep(); buzz('light'); redraw(root, b.closest('.pd-card')); }); });
      $$('[data-pd-meal]', root).forEach(function (b) { b.addEventListener('change', function () {
        const k = b.dataset.pdMeal, i = meals.indexOf(k);
        if (!b.checked && i >= 0) { if (meals.length === 1) { b.checked = true; buzz('warn'); toast('Keep at least one meal'); return; } meals.splice(i, 1); }
        else if (b.checked && i < 0) meals = MEALS.map(function (m) { return m[0]; }).filter(function (x) { return x === k || meals.indexOf(x) >= 0; });
        popKey = k; keep(); buzz('light');
        setTimeout(function () { if (root.isConnected) redraw(root); }, 520); // let the glass knob finish sliding first
      }); });
      $('#pdMine', root).addEventListener('change', function () { useMine = this.checked; seeds = {}; keep(); buzz('light'); redraw(root); });
      $('#pdAll', root).addEventListener('click', function () { MEALS.forEach(function (m) { seeds[m[0]] = (seeds[m[0]] || 0) + 1 + Math.floor(Math.random() * 3); }); keep(); buzz('medium'); redraw(root, null, true); });
      $('#pdNext', root).addEventListener('click', function () { step = 'add'; buzz('light'); draw(root); });
    };
    // Re-draw in place, keeping your scroll. A meal that changes size (switched off or on, another idea) grows or
    // shrinks to its new height and everything below follows; its new foods fade in. Nothing jumps or blinks.
    const redraw = function (root, card, all) {
      const sc = sheet.scrollTop, key = card ? card.dataset.m : null, hs = {};
      $$('.pd-card', root).forEach(function (c) { hs[c.dataset.m] = c.offsetHeight; });
      drawPlan(root); sheet.scrollTop = sc;
      const cards = $$('.pd-card', root), pk = pdChanged; pdChanged = null;
      if (calmMotion() || !root.animate) return;
      const ease = 'cubic-bezier(.2,.8,.2,1)';
      cards.forEach(function (c) {
        const h0 = hs[c.dataset.m], h1 = c.offsetHeight; if (!h0 || Math.abs(h0 - h1) < 2) return;
        c.style.overflow = 'hidden';
        const a = c.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 380, easing: ease });
        a.onfinish = a.oncancel = function () { c.style.overflow = ''; };
      });
      cards.filter(function (c) { return all || c.dataset.m === key || c.dataset.m === pk; }).forEach(function (c, n) {
        $$('.pd-row, .pd-again', c).forEach(function (r, j) { r.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 60 + n * 40 + j * 35, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }); });
      });
    };
    // Step 2: which day it goes on.
    const drawAdd = function (root) {
      const today = todayISO(), tmr = isoFromDay(dayNum(today) + 1), have = eatenFor(to).filter(function (x) { return !isDailyTotal(x); });
      const full = {}; have.forEach(function (x) { full[mealOf(x)] = 1; });
      const kept = plan.meals.filter(function (m) { return !(skipFull && full[m.meal]); }), n = kept.reduce(function (a, m) { return a + m.items.length; }, 0), kc = mealSum([].concat.apply([], kept.map(function (m) { return m.items; }))).kcal;
      const sd = function (iso) { return esc(fmtDate(iso, { weekday: 'short', month: 'short', day: 'numeric' })); };
      const chip = function (iso, lbl) { return '<button type="button" class="pd-mt" data-pd-to="' + iso + '" aria-pressed="' + (to === iso) + '"><span class="pd-mt-c">' + TICK + '</span><span class="pd-mt-t"><b>' + lbl + '</b><small>' + sd(iso) + '</small></span></button>'; };
      const other = to !== today && to !== tmr;
      root.innerHTML = '<div class="sheet-head"><button type="button" class="icon-btn back-btn" id="pdBack" aria-label="Back">' + BACK_IC + '</button><div class="grow"><div class="label faint">Meal planner</div><h2 class="sheet-title" id="sheetTitle">Add to diary</h2></div></div>' +
        '<div class="pd-opt-l">Which day</div><div class="pd-meals pd-days">' + chip(today, 'Today') + chip(tmr, 'Tomorrow') +
        '<label class="pd-mt pd-pick" aria-pressed="' + other + '"><span class="pd-mt-c">' + TICK + '</span><span class="pd-mt-t"><b>' + (other ? 'Other day' : 'Pick a date') + '</b><small>' + (other ? sd(to) : 'Any day') + '</small></span><input type="date" id="pdDate" value="' + to + '" aria-label="Pick a date" /></label></div>' +
        '<div class="card pd-to">' + '<div class="pd-to-d"><b>' + esc(relDate(to)) + '</b><span>' + esc(fmtDate(to, { weekday: 'long', month: 'long', day: 'numeric' })) + '</span></div>' +
        (have.length ? '<p class="pd-warn">This day already has ' + fmtKcal(have.reduce(function (a, x) { return a + (x.kcal || 0); }, 0)) + ' kcal logged.</p>' +
          '<label class="pd-mine-t"><span class="grow"><b>Skip meals that already have food</b><small>Only fill the empty ones</small></span><span class="switch"><input type="checkbox" id="pdSkip"' + (skipFull ? ' checked' : '') + ' /><i></i></span></label>' : '') +
        '<div class="pd-to-l">' + plan.meals.map(function (m) { const skip = skipFull && full[m.meal]; return '<div class="pd-to-r' + (skip ? ' off' : '') + '"><span>' + esc(mealName(m.meal)) + '</span><span class="num">' + (skip ? 'Skipped' : fmtKcal(mealSum(m.items).kcal) + ' kcal') + '</span></div>'; }).join('') + '</div></div>' +
        '<p class="muted-note sv-src">Foods go in as planned, so they count once you tick them off as eaten.</p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="pdAdd"' + (n ? '' : ' disabled') + '>' + (n ? 'Add ' + n + ' foods · ' + fmtKcal(kc) + ' kcal' : 'Nothing to add') + '</button></div>';
      if (popKey === 'day') { const t = $('.pd-days [aria-pressed="true"]', root); if (t) t.classList.add('pop'); popKey = null; }
      $('#pdBack', root).addEventListener('click', function () { step = 'plan'; buzz('light'); draw(root); });
      $$('[data-pd-to]', root).forEach(function (b) { b.addEventListener('click', function () { to = b.dataset.pdTo; popKey = 'day'; buzz('light'); draw(root); }); });
      $('#pdDate', root).addEventListener('change', function () { if (/^\d{4}-\d{2}-\d{2}$/.test(this.value)) { to = this.value; popKey = 'day'; buzz('light'); draw(root); } });
      if ($('#pdSkip', root)) $('#pdSkip', root).addEventListener('change', function () { skipFull = this.checked; buzz('light'); draw(root); });
      $('#pdAdd', root).addEventListener('click', function () {
        const snap = snapshot(), items = [];
        kept.forEach(function (m) { m.items.forEach(function (x) { items.push(Object.assign({}, x, { id: newId(), meal: m.meal, plan: true })); }); });
        addItems(to, items); save(); closeSheet(); viewDay = to; renderAll(); if (state.ui.tab !== 'diary') showTab('diary'); buzz('success');
        toast('Planned ' + items.length + ' foods for ' + relDate(to), function () { restore(snap); });
      });
    };
    const draw = function (root) {
      if (!foodDB) { root.innerHTML = headPlan + skel(5); loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) root.innerHTML = headPlan + '<p class="muted-note fd-empty">The food list needs a connection the first time. Try again when you\'re online.</p>'; }); return; }
      if (step === 'add' && plan && plan.meals.length) drawAdd(root); else drawPlan(root);
      sheet.scrollTop = step === 'add' ? 0 : sheet.scrollTop;
    };
    openSheet('<div id="pdRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#pdRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }

  // ----- Foods high in a nutrient: the richest everyday foods per serving or per 100 kcal, or your week's top sources -----
  function nutFoodsSheet(date, opt) {
    let d = date || todayISO(), key = (opt && opt.key) || 'fib', by = (opt && opt.by) || 'serving';
    const head = '<div class="sheet-head"><div class="grow"><div class="label faint">Foods high in</div><h2 class="sheet-title" id="sheetTitle">' + esc((NUT[key] || NUT.fib).label) + '</h2></div></div>';
    const draw = function (root) {
      if (!foodDB) { root.innerHTML = head + skel(5); loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) root.innerHTML = head + '<p class="muted-note fd-empty">The food list needs a connection the first time. Try again when you\'re online.</p>'; }); return; }
      const nutOpts = NUTS.filter(function (x) { return (by === 'week' && x[0] !== 'kcal') || ['kcal', 'sug', 'sat', 'trans', 'chol', 'na', 'alc', 'caff'].indexOf(x[0]) < 0; });
      if (!nutOpts.some(function (x) { return x[0] === key; })) key = 'fib';
      root.innerHTML = '<div class="sheet-head"><div class="grow"><div class="label faint">Foods high in</div><h2 class="sheet-title" id="sheetTitle">' + esc(NUT[key].label) + '</h2></div></div>' +
        '<div class="sg-nut"><div class="field"><select class="input" id="hiKey" aria-label="Nutrient">' + nutOpts.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === key ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></div>' +
        '<div class="seg w3" id="hiMode"><button type="button" data-v="serving" aria-pressed="' + (by === 'serving') + '">Per serving</button><button type="button" data-v="kcal" aria-pressed="' + (by === 'kcal') + '">Per 100 kcal</button><button type="button" data-v="week" aria-pressed="' + (by === 'week') + '">Your week</button></div></div>' + highInHtml(key, by);
      $('#hiKey', root).addEventListener('change', function () { key = this.value; draw(root); });
      $$('#hiMode button', root).forEach(function (b) { b.addEventListener('click', function () { by = b.dataset.v; buzz('light'); draw(root); }); });
      $$('[data-sg]', root).forEach(function (b) { b.addEventListener('click', function () { const f = getFood(b.dataset.sg); if (!f) return; buzz('light'); closeSheet(); addFoodSheet(null, d, null, f); }); });
    };
    openSheet('<div id="sgRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#sgRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
