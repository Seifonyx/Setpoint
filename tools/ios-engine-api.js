  // ---- What the iPhone app calls (everything goes in and out as JSON text) ----
  var J = JSON.stringify;
  // Arabic: the web app's own phrase list (ar.js), applied to text the engine hands out, when the iPhone is in Arabic.
  var lang = 'en';
  function L(s) { return lang === 'ar' && typeof s === 'string' && s ? (tr(s) || s) : s; }
  function setMeals() { MEALS = state.settings.meals && state.settings.meals.length ? state.settings.meals.map(function (x) { return [x.k, x.n]; }) : DEFAULT_MEALS; }
  function row(f, meal) {
    return { id: f.id, name: L(f.name), sub: L(servingLine(f, meal)), via: f.via || null, fav: isFav(f.id), est: !!f.est, recipe: !!f.recipe, custom: !!f.custom, kind: ftKind(f) };
  }
  function itemFor(f, qty, label, meal) {
    var us = unitsFor(f), u = us.find(function (x) { return x.label === label; }) || us[0], g = qty * u.g, m = macrosFor(f, g);
    return { id: newId(), meal: meal, ref: f.id, g: Math.round(g * 10) / 10, qty: Math.round(qty * 1000) / 1000, unit: u.label,
      kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat, name: f.name.slice(0, 80) };
  }
  return {
    // Your data, in the web app's format (cleaned exactly as the web app cleans it).
    setState: function (txt) { state = migrate(JSON.parse(txt)); setMeals(); dataVer++; return 'ok'; },
    getState: function () { return J(state); },
    part: function (k) { return J(state[k] === undefined ? null : state[k]); },
    // The food list (foods.json). Built in one go; ready once the promise settles (right after this call returns).
    loadFoods: function (txt) { var self = this; buildFoods(JSON.parse(txt)).then(function (db) { foodDB = db; self.ready = true; }); return 'ok'; },
    ready: false,

    // ---- Adding food ----
    search: function (q, meal) {
      if (!foodDB || !String(q).trim()) return '[]';
      var fu = foodUse(), rec = {}, mu = {}, from = dayNum(todayISO()) - 90;
      fu.order.forEach(function (o, i) { if (o.item.ref && rec[o.item.ref] == null) rec[o.item.ref] = i; });
      Object.keys(state.food).forEach(function (dt) { if (dayNum(dt) >= from) state.food[dt].forEach(function (it) { if (it.ref && it.meal === meal && !it.plan) mu[it.ref] = (mu[it.ref] || 0) + 1; }); });
      var intent = intentOf(q);
      var all = intent && !intent.rest ? intentFoods(intent.it, intent.snack, intent.bf) : searchFoods(intent ? intent.rest : q, fu.use, { recent: rec, mem: qMemFor(q), mealUse: mu, limit: 60 });
      if (intent && intent.rest) all = all.filter(function (f) { return intentScore(f, intent.it) != null; }).sort(function (a, b) { return (intentScore(a, intent.it) - intentScore(b, intent.it)) * intent.it.dir; });
      return J(all.slice(0, 60).map(function (f) { return row(f, meal); }));
    },
    // What you ate lately (foods from the list, and quick adds), newest first.
    recents: function (meal) {
      var fu = foodUse(), out = [];
      fu.order.forEach(function (o) {
        if (out.length >= 40) return;
        if (o.item.ref) { var f = getFood(o.item.ref); if (f) out.push(row(f, meal)); }
        else out.push({ quick: true, name: o.item.name || L('Quick add'), kcal: o.item.kcal, protein: o.item.protein, carbs: o.item.carbs, fat: o.item.fat });
      });
      return J(out);
    },
    favorites: function (meal) { return J(state.favs.map(getFood).filter(Boolean).map(function (f) { return row(f, meal); })); },
    myFoods: function (meal) { return J(state.myFoods.map(customFood).map(function (f) { return row(f, meal); })); },
    recipes: function (meal) { return J(state.recipes.map(recipeFood).filter(Boolean).map(function (f) { return row(f, meal); })); },
    savedMeals: function () { return J(state.meals.map(function (m) { return { id: m.id, name: m.name, kcal: mealTotal(m.items), n: m.items.length }; })); },
    // One food: its units, a starting amount (your usual, else a sensible serving) and its numbers per 100 g.
    food: function (id, meal) {
      var f = getFood(id); if (!f) return 'null';
      var us = unitsFor(f), lp = lastPortion(f.id, meal), ds = defaultServing(f), p = function (k) { var v = per100(f, k); return v == null ? null : v; };
      var def = lp && us.some(function (u) { return u.label === lp.unit; }) ? { qty: lp.qty, unit: lp.unit } : { qty: ds.qty, unit: ds.unit.label };
      return J({ id: f.id, name: L(f.name), cat: f.cat || null, units: us.map(function (u) { return { label: u.label, g: u.g, text: L(u.label) }; }), def: def, fav: isFav(f.id), est: !!f.est, recipe: !!f.recipe, custom: !!f.custom,
        per100: { kcal: p('kcal'), p: p('p'), c: p('c'), f: p('f'), fib: p('fib'), sug: p('sug'), sat: p('sat'), na: p('na') } });
    },
    macros: function (id, qty, label) { var f = getFood(id); if (!f) return 'null'; var it = itemFor(f, qty, label, 'snacks'); return J({ kcal: it.kcal, protein: it.protein, carbs: it.carbs, fat: it.fat, g: it.g }); },
    // A new diary item for a food at an amount, exactly as the web app logs it.
    item: function (id, qty, label, meal) { var f = getFood(id); return f ? J(itemFor(f, qty, label, meal)) : 'null'; },
    // A logged food at a new amount (keeps its id, meal, time and note).
    reamount: function (txt, qty, label) {
      var it = JSON.parse(txt), f = itemFood(it); if (!f) return 'null';
      var n = itemFor(f, qty, label, it.meal); delete n.id; delete n.name; delete n.meal;
      return J(Object.assign(it, n));
    },
    fmtAmt: function (qty, unit) { return L(fmtAmt(qty, unit)); },
    setLang: function (l) { lang = l === 'ar' ? 'ar' : 'en'; return 'ok'; },
    tr: function (s) { return L(s); },
    // A saved meal for the diary: one entry with its foods (or each food on its own with "Log meals as separate foods").
    logMeal: function (mid, meal) {
      var mm = state.meals.find(function (m) { return m.id === mid; }); if (!mm) return '[]';
      var copy = function (it) { var c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan; return c; };
      if (state.settings.explode) return J(mm.items.map(function (it) { return Object.assign(copy(it), { id: newId(), meal: meal }); }));
      var t = mm.items.reduce(function (a, x) { return { kcal: a.kcal + x.kcal, protein: a.protein + x.protein, carbs: a.carbs + x.carbs, fat: a.fat + x.fat }; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
      return J([{ id: newId(), name: mm.name, meal: meal, mid: mm.id, mi: mm.items.map(copy), kcal: Math.min(10000, Math.round(t.kcal)), protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat) }]);
    },
    toggleFav: function (id) { if (isFav(id)) state.favs = state.favs.filter(function (x) { return x !== id; }); else state.favs.unshift(id); return J(state.favs); },
    // Barcodes: your foods and the built-in packaged list first (offline), else the app asks Open Food Facts and hands the answer here.
    validBarcode: function (c) { return validBarcode(c); },
    barcodeLocal: function (code) {
      var mine = state.myFoods.find(function (c) { return c.code === code; }), local = state.offFoods.find(function (o) { return o.code === code; });
      if (mine) return J(customFood(mine).id); if (local) return J(offFood(local).id); if (foodDB && foodDB.byId['ub' + code]) return J(foodDB.byId['ub' + code].id);
      return 'null';
    },
    offProduct: function (txt, code) {
      var d = JSON.parse(txt), p = d && d.status === 1 && d.product;
      if (!p) return J({ notFound: true });
      var name = String(p.product_name || p.product_name_en || p.product_name_ar || '').trim().slice(0, 60), n = offNutrients(p.nutriments || {});
      if (n.kcal == null) return J({ notFound: true, name: name });
      var sv = Number(p.serving_quantity), o = { id: 'o' + code, code: code, name: name || 'Product ' + code, brand: String(p.brands || '').split(',')[0].trim().slice(0, 40), n: n, sv: isFinite(sv) && sv > 0 && sv < 5000 ? Math.round(sv * 10) / 10 : null };
      state.offFoods = [o].concat(state.offFoods.filter(function (x) { return x.code !== code; })).slice(0, 300);
      return J({ id: offFood(o).id });
    },

    // ---- Plan and maths ----
    dayPlan: function (d) {
      var p = dayPlan(d); if (!p) return 'null';
      return J({ kcal: roundKcal(p.target), protein: p.protein, carbs: p.carbs, fat: p.fat, train: p.train == null ? null : p.train, flex: p.flex || 0, mode: p.mode || null });
    },
    trend: function (d) { var t = trendAt(dayNum(d)); return J(t == null ? null : t); },
    // Everything the Plan screens show.
    overview: function () {
      var en = activeEnergy(), pl = makePlan(en), m = measuredEnergy(), c = en && en.calc, sp = trainSplit();
      return J({
        ready: profileReady(), kg: currentKg(), unit: unit(), adaptive: adaptive(), adjustKcal: state.profile.adjustKcal, tune: state.ui.tune || null,
        tuneWhy: state.ui.tune ? L(tuneWhy(state.ui.tune)) : null,
        profile: state.profile, age: ageNow(), goalKg: state.settings.goalKg, rates: RATES[unit()],
        energy: en ? { tdee: en.tdee, source: en.source, w: en.w == null ? null : en.w, calc: c ? c.tdee : null, level: c ? L(c.level) : null, parts: c ? burnParts(c, en) : null } : null,
        measured: m,
        plan: pl ? { target: pl.target, protein: pl.protein, carbs: pl.carbs, fat: pl.fat, pace: pl.pace, warn: L(pl.warn), eta: L(pl.eta), ref: pl.ref, refWhy: pl.refWhy, proteinPerKg: pl.proteinPerKg, fatPerKg: pl.fatPerKg, kind: pl.kind, custom: pl.custom, ranges: macroRanges(pl.pace.kg < 0, !!state.profile.bodyFat, state.profile.training || null) } : null,
        split: sp, flex: state.settings.flex || null
      });
    },
    paceValue: function (dir, i) { return paceValue(dir, i); },
    // ---- Account sync (the web app's own merge; the iPhone app does the network part) ----
    // Two saves joined: weigh-ins and foods by date/id, the most recently changed copy winning, deletions kept.
    syncMerge: function (localTxt, cloudTxt, cloudNewer) { return J(migrate(mergeData(migrate(JSON.parse(localTxt)), migrate(JSON.parse(cloudTxt)), !!cloudNewer))); },
    syncHasData: function (txt) { return hasData(migrate(JSON.parse(txt))); },
    // The cloud save put back together: the main document's data plus each food month (and food an old version left in the main document).
    syncJoin: function (mainTxt, monthsTxt) {
      var data = JSON.parse(mainTxt || '{}'), food = {};
      JSON.parse(monthsTxt || '[]').forEach(function (t) { var part = {}; try { part = JSON.parse(t || '{}'); } catch (e) {} Object.keys(part).forEach(function (k) { food[k] = part[k]; }); });
      Object.keys(data.food || {}).forEach(function (dt) { var byId = {}; (food[dt] || []).concat(data.food[dt] || []).forEach(function (f) { if (f && f.id) byId[f.id] = f; }); food[dt] = Object.keys(byId).map(function (k) { return byId[k]; }); });
      data.food = food;
      return J(data);
    },

    // ---- Progress ----
    // Every weigh-in with its trend, the weeks (average, days weighed, calories), and which way counts as progress.
    progress: function () {
      var all = withTrend(), weeks = [];
      if (all.length) {
        var first = weekStart(dayNum(all[0].date));
        for (var st = weekStart(dayNum(all[all.length - 1].date)); st >= first; st -= 7) {
          var w = weekStats(st); if (!w) continue;
          var pv = weekStats(st - 7);
          weeks.push({ start: isoFromDay(st), label: L(weekRange(st)), n: w.n, avg: w.avg, lo: w.lo, hi: w.hi, kcal: w.kcal, delta: pv ? w.avg - pv.avg : null });
        }
      }
      return J({ points: all.map(function (e) { return { date: e.date, kg: e.kg, trend: e.trend == null ? e.kg : e.trend, x: e.x, note: e.note || '', kcal: dayKcal(e.date) }; }),
        weeks: weeks, down: goodWhenDown(), goalKg: state.settings.goalKg || null, now: currentKg(), unit: unit() });
    },
    // Food eaten each day for the last n days, with that day's targets (days with nothing logged are left out).
    nutrition: function (n) {
      var out = [], today = dayNum(todayISO());
      for (var d = today - n + 1; d <= today; d++) {
        var iso = isoFromDay(d), t = dayTotals(iso); if (!t || !t.kcal) continue;
        var p = dayPlan(iso);
        out.push({ date: iso, kcal: t.kcal, protein: t.protein, carbs: t.carbs, fat: t.fat, target: p ? roundKcal(p.target) : null, proteinTarget: p ? p.protein : null });
      }
      return J(out);
    },
    // Run on every open, like the web app: a due weekly adjustment, reaching your goal, and today's targets remembered.
    tick: function () { var t = autoTune(); recordGoal(); return J(t || null); },
    undoTune: function () { var t = state.ui.tune; if (t) undoTune(t); return 'ok'; }
  };
