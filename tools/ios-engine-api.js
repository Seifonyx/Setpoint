  // ---- What the iPhone app calls (everything goes in and out as JSON text) ----
  var J = JSON.stringify;
  // Lets the engine look back as if it were an earlier day (for history charts). The last declaration wins in JS,
  // so every helper that asks for today uses this one.
  var __today = null;
  if (!Object.keys(NUT).length) NUTS.forEach(function (n) { NUT[n[0]] = { key: n[0], label: n[1], unit: n[2], group: n[3] }; });
  function todayISO() { return __today || isoOf(new Date()); }
  // Arabic: the web app's own phrase list (ar.js), applied to text the engine hands out, when the iPhone is in Arabic.
  var lang = 'en';
  function L(s) { return lang === 'ar' && typeof s === 'string' && s ? (tr(s) || s) : s; }
  function setMeals() { MEALS = state.settings.meals && state.settings.meals.length ? state.settings.meals.map(function (x) { return [x.k, x.n]; }) : DEFAULT_MEALS; }
  // Verified: lab-measured USDA data or a restaurant's own published numbers (not estimates, community barcode data or your own foods).
  function isVerified(f) { if (f.est || f.custom || f.recipe || f.off) return false; var m = /^u(\d+)$/.exec(f.id); return m ? +m[1] < 9000000 : /^ur/.test(f.id); }
  function row(f, meal) {
    // Your usual amount (or a sensible serving), with its numbers, so the list can add it in one tap.
    var us = unitsFor(f), lp = lastPortion(f.id, meal), u = lp && us.find(function (x) { return x.label === lp.unit; }), q, lbl, g;
    if (u) { q = lp.qty; lbl = lp.unit; g = q * u.g; } else { var ds = defaultServing(f); q = ds.qty; lbl = ds.unit.label; g = q * ds.unit.g; }
    var m = macrosFor(f, g);
    return { id: f.id, name: L(f.name), sub: L(servingLine(f, meal)), via: f.via || null, fav: isFav(f.id), est: !!f.est, recipe: !!f.recipe, custom: !!f.custom,
      off: !!f.off || f.cat === 'Packaged foods', kind: ftKind(f), verified: isVerified(f), q: q, u: lbl, amt: L(fmtAmt(q, lbl)), usual: !!u && lp.n >= 2,
      kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat };
  }
  function sortRows(list, sort, verifiedOnly) {
    var fu = foodUse(), rec = {};
    fu.order.forEach(function (o, i) { if (o.item.ref && rec[o.item.ref] == null) rec[o.item.ref] = i; });
    if (verifiedOnly) list = list.filter(function (r) { return r.verified; });
    var by = function (cmp) { return list.map(function (r, i) { return [r, i]; }).sort(function (a, b) { return cmp(a[0], b[0]) || a[1] - b[1]; }).map(function (x) { return x[0]; }); };
    if (sort === 'recent') return by(function (a, b) { var x = rec[a.id], y = rec[b.id]; return (x == null ? 1e9 : x) - (y == null ? 1e9 : y); });
    if (sort === 'frequent') return by(function (a, b) { return (fu.use[b.id] || 0) - (fu.use[a.id] || 0); });
    if (sort === 'az') return by(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
    if (sort === 'kcal') return by(function (a, b) { return (a.kcal || 0) - (b.kcal || 0); });
    return list;
  }
  // The iPhone app's own data (root.ios): migrate() only knows the web app's keys, so it's carried across here.
  function keepIos(raw, out) { if (raw && raw.ios && typeof raw.ios === 'object' && !Array.isArray(raw.ios)) out.ios = raw.ios; return out; }
  // Saved days merge by id; the newer copy wins, and a deleted day stays deleted (ios.del: id -> when).
  function mergeIos(a, b) {
    a = a && typeof a === 'object' ? a : {}; b = b && typeof b === 'object' ? b : {};
    var out = Object.assign({}, a, b), del = Object.assign({}, a.del || {});
    Object.keys(b.del || {}).forEach(function (k) { if (!del[k] || b.del[k] > del[k]) del[k] = b.del[k]; });
    var by = {};
    (a.savedDays || []).concat(b.savedDays || []).forEach(function (d) { if (d && d.id && (!by[d.id] || (d.u || 0) > (by[d.id].u || 0))) by[d.id] = d; });
    out.savedDays = Object.keys(by).map(function (k) { return by[k]; }).filter(function (d) { return !(del[d.id] && del[d.id] >= (d.u || 0)); })
      .sort(function (x, y) { return (y.created || 0) - (x.created || 0); });
    out.del = del;
    return out;
  }
  // Amounts read like a person says them: ½ cup, 1½ slices, ¼ tsp (grams stay plain numbers). Overrides the web's fmtAmt.
  function fracQty(q) {
    var w = Math.floor(q + 1e-9), f = q - w, sym = null;
    [[0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']].forEach(function (m) { if (Math.abs(f - m[0]) < 0.02) sym = m[1]; });
    return sym ? (w ? String(w) : '') + sym : fmtQty(q);
  }
  function fmtAmt(qty, unit) {
    if (unit === 'g') return fmtQty(qty) + ' g';
    var u = String(unit || '').replace(/^small\/regular fillet$/, 'fillet');
    if (/^\d/.test(u)) return qty === 1 ? u : fracQty(qty) + ' × ' + u;
    if (qty > 1) u = u.replace(/^([^,(]*?)([a-z]+)(?=\s*(,|\(|$))/i, function (all, pre, w) { return pre + (UNIT_PL[w.toLowerCase()] || w); });
    return fracQty(qty) + ' ' + u;
  }
  function itemFor(f, qty, label, meal) {
    var us = unitsFor(f), u = us.find(function (x) { return x.label === label; }) || us[0], g = qty * u.g, m = macrosFor(f, g);
    return { id: newId(), meal: meal, ref: f.id, g: Math.round(g * 10) / 10, qty: Math.round(qty * 1000) / 1000, unit: u.label,
      kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat, name: f.name.slice(0, 80) };
  }
  return {
    // Your data, in the web app's format (cleaned exactly as the web app cleans it).
    setState: function (txt) { var raw = JSON.parse(txt); state = keepIos(raw, migrate(raw)); setMeals(); dataVer++; return 'ok'; },
    getState: function () { return J(state); },
    part: function (k) { return J(state[k] === undefined ? null : state[k]); },
    // The food list (foods.json). Built in one go; ready once the promise settles (right after this call returns).
    loadFoods: function (txt) { var self = this; buildFoods(JSON.parse(txt)).then(function (db) { foodDB = db; self.ready = true; }); return 'ok'; },
    ready: false,

    // ---- Adding food ----
    // sort: 'best' (the web app's ranking), 'recent' (what you logged lately first) or 'frequent' (most logged first).
    searchSorted: function (q, meal, sort, verifiedOnly) { return J(sortRows(JSON.parse(this.search(q, meal)), sort, verifiedOnly)); },
    // Favorites, your foods and recipes, sorted the same ways (plus A to Z and by calories).
    listSorted: function (kind, meal, sort, verifiedOnly) { return J(sortRows(JSON.parse(this[kind](meal)), sort, verifiedOnly)); },
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
    // The foods you log most, most first.
    frequent: function (meal) {
      var fu = foodUse();
      return J(Object.keys(fu.use).sort(function (a, b) { return fu.use[b] - fu.use[a]; }).slice(0, 40)
        .map(getFood).filter(Boolean).map(function (f) { return row(f, meal); }));
    },
    // A whole day of food for your targets: opts {target: {kcal, p, c, f}, meals: [keys], seeds: {meal: n}, seed, mine}.
    planDay: function (txt) { return J(planDayNow(JSON.parse(txt))); },
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
    // A logged recipe's ingredients for this day: its own copy if adjusted (it.rc), else the saved recipe's.
    recipeOf: function (txt) {
      var it = JSON.parse(txt), rc = it.rc || (state.recipes.find(function (r) { return r.id === it.ref; }) || null);
      if (!rc) return 'null';
      return J({ servings: rc.servings || 1, cookedG: rc.cookedG || null, items: (rc.items || []).map(function (x) {
        var f = getFood(x.ref), m = f ? macrosFor(f, x.g || 0) : { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        return { ref: x.ref, name: x.name || (f && f.name) || '', g: x.g, qty: x.qty, unit: x.unit, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat };
      }) });
    },
    // Save a recipe adjusted for this day only (rc), or go back to the saved recipe (rcTxt null), as the web app does.
    applyRecipe: function (txt, rcTxt) {
      var it = JSON.parse(txt);
      if (rcTxt) { var rc = JSON.parse(rcTxt); it.rc = { servings: rc.servings, cookedG: rc.cookedG || null, items: rc.items.map(function (x) { return { ref: x.ref, name: x.name, g: x.g, qty: x.qty, unit: x.unit }; }) }; }
      else delete it.rc;
      var f = itemFood(it);
      if (f) {
        var u = unitsFor(f).find(function (x) { return x.label === it.unit; });
        if (u) it.g = Math.round(it.qty * u.g * 10) / 10;
        var m = macrosFor(f, it.g); it.kcal = Math.min(m.kcal, 10000); it.protein = m.protein; it.carbs = m.carbs; it.fat = m.fat;
      }
      return J(it);
    },
    fmtAmt: function (qty, unit) { return L(fmtAmt(qty, unit)); },
    setLang: function (l) { lang = l === 'ar' ? 'ar' : 'en'; return 'ok'; },
    tr: function (s) { return L(s); },
    // A saved meal for the diary: one entry with its foods (or each food on its own with "Log meals as separate foods").
    // A meal goes into the diary as its foods, each on its own (scaled by how many servings you're having).
    logMeal: function (mid, meal, factor) {
      var mm = state.meals.find(function (m) { return m.id === mid; }); if (!mm) return '[]';
      var k = factor > 0 ? factor : 1;
      return J(mm.items.map(function (it) {
        var c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan;
        if (k !== 1) {
          ['kcal', 'protein', 'carbs', 'fat'].forEach(function (x) { if (typeof c[x] === 'number') c[x] = Math.round(c[x] * k); });
          ['g', 'qty'].forEach(function (x) { if (typeof c[x] === 'number') c[x] = Math.round(c[x] * k * 1000) / 1000; });
        }
        return Object.assign(c, { id: newId(), meal: meal });
      }));
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
    syncMerge: function (localTxt, cloudTxt, cloudNewer) {
      var a = JSON.parse(localTxt), b = JSON.parse(cloudTxt), out = migrate(mergeData(migrate(a), migrate(b), !!cloudNewer));
      out.ios = mergeIos(a.ios, b.ios);
      return J(out);
    },
    syncHasData: function (txt) { return hasData(migrate(JSON.parse(txt))); },
    // The cloud save put back together: the main document's data plus each food month (and food an old version left in the main document).
    syncJoin: function (mainTxt, monthsTxt) {
      var data = JSON.parse(mainTxt || '{}'), food = {};
      JSON.parse(monthsTxt || '[]').forEach(function (t) { var part = {}; try { part = JSON.parse(t || '{}'); } catch (e) {} Object.keys(part).forEach(function (k) { food[k] = part[k]; }); });
      Object.keys(data.food || {}).forEach(function (dt) { var byId = {}; (food[dt] || []).concat(data.food[dt] || []).forEach(function (f) { if (f && f.id) byId[f.id] = f; }); food[dt] = Object.keys(byId).map(function (k) { return byId[k]; }); });
      data.food = food;
      return J(data);
    },

    // ---- Vitamins and minerals: a day's totals against your targets, and what's often low (last 2 weeks) ----
    nutrients: function (d) {
      var nd = dayNutrients(d), tg = nutTargets(d);
      return J({ items: nd.items, kcal: nd.kcal, groups: NUT_GROUPS.map(function (g) { return { key: g[0], label: L(g[1]) }; }),
        rows: NUTS.map(function (n) { var t = tg[n[0]] || {}; return { key: n[0], label: L(n[1]), unit: n[2], group: n[3], v: nd.tot[n[0]] || 0, cov: nd.cov[n[0]], goal: t.goal == null ? null : t.goal, hi: t.hi == null ? null : t.hi }; }),
        low: oftenLow().low.map(function (x) { return { key: x.key, label: L(NUT[x.key].label), pct: x.pct }; }) });
    },

    // Last week (or any week starting on a given day): averages, days on target, weight change.
    weekReview: function (startIso) {
      var st = startIso ? dayNum(startIso) : weekStart(dayNum(todayISO())) - 7, r = weekReview(st);
      if (!r) return 'null';
      return J({ start: isoFromDay(r.start), label: L(weekRange(r.start)), n: r.n, kcal: r.kcal, protein: r.protein, tg: r.tg, pg: r.pg, best: r.best ? r.best.iso : null, onTarget: r.onTarget, train: r.train, trainOn: trainOn(), dw: r.dw == null ? null : r.dw });
    },
    // Achievements and your logging streak.
    achievements: function (hasPhotos) {
      photos = hasPhotos ? [1] : [];
      return J({ streak: foodStreak(), list: achievements().map(function (a) { return { t: L(a.t), got: !!a.got, p: a.p || '' }; }) });
    },

    // Ramadan: Fajr and Maghrib today and tomorrow for a place, and the city list.
    prayer: function (lat, lon, fa) {
      var now = new Date(), t = prayerTimes(now, lat, lon, fa), tm = prayerTimes(new Date(now.getTime() + 864e5), lat, lon, fa);
      return J({ fajr: t.fajr.getTime(), maghrib: t.maghrib.getTime(), fajrNext: tm.fajr.getTime() });
    },
    cities: function () { return J(RAM_CITIES.map(function (c) { return { name: c[0], lat: c[1], lon: c[2], fa: c[3] }; })); },

    // Weight factors: what moves your next-morning weight (salt, carbs, fiber, big days, training), from your own log.
    insights: function () {
      var r = weightInsights();
      return J({ n: r.n, items: r.items.map(function (x) { return { t: L(x.t), d: x.d, s: L(x.s), note: L(x.note) }; }) });
    },

    // Foods set to repeat (state.repeats) are added to today, as the web app does on every open. Returns how many.
    applyRepeats: function () { return applyRepeats(); },
    // How well a day matched its targets: 0–100 and a grade, with the parts.
    dayScore: function (d) {
      var tt = dayTotals(d), plan = dayPlan(d); if (!plan) return 'null';
      if (d > todayISO() || (d === todayISO() && tt.kcal < plan.target * 0.7)) return 'null';
      var sc = dayScore(d); if (!sc) return 'null';
      return J({ score: sc.score, grade: sc.grade, parts: sc.parts.map(function (x) { return { label: L(x.label), pts: x.pts, max: x.max, note: x.note }; }) });
    },

    // A kind for each food logged on a day (egg, grain, fruit…), for the Diary's food icons.
    // Icons for your repeating foods: repeat id → kind.
    repeatKinds: function () {
      var o = {};
      (state.repeats || []).forEach(function (r) { var it = r.item || {}, f = it.ref ? itemFood(it) : null; o[r.id] = f ? ftKind(f) : (ftGuess(it.name || '', '') || 'quick'); });
      return J(o);
    },
    // A logged item's (or an edited one's) vitamins, minerals and fiber against your daily targets, most covered first.
    itemNutrientRows: function (txt) {
      var it = JSON.parse(txt), v = itemNutrients(it); if (!v) return '[]';
      var tg = nutTargets(todayISO()), keys = ['fib', 'sug', 'sat', 'na', 'k', 'ca', 'fe', 'mg', 'zn', 'vA', 'vC', 'vD', 'vE', 'vK', 'b1', 'b2', 'b3', 'b6', 'b12', 'fol', 'chol'];
      return J(keys.filter(function (k) { return v[k] != null && NUT[k]; }).map(function (k) {
        var t = tg[k] || {};
        return { key: k, label: L(NUT[k].label), unit: NUT[k].unit, v: v[k], goal: t.goal == null ? null : t.goal, hi: t.hi == null ? null : t.hi };
      }));
    },
    itemKinds: function (d) {
      var o = {};
      (state.food[d] || []).forEach(function (it) { var f = it.ref ? itemFood(it) : null; o[it.id] = Array.isArray(it.mi) ? 'meal' : f ? ftKind(f) : (ftGuess(it.name || '', '') || 'quick'); });
      return J(o);
    },

    // ---- Coaching ----
    // Your measured expenditure week by week (each from the 4 weeks before it), with the target you had then.
    expenditureHistory: function (weeks) {
      var out = [], today = dayNum(isoOf(new Date()));
      for (var k = weeks - 1; k >= 0; k--) {
        var d = isoFromDay(today - 7 * k); __today = d; dataVer++;
        var m = measuredEnergyNow(), goalKey = Object.keys(state.goals).filter(function (x) { return x <= d; }).sort().pop();
        out.push({ date: d, tdee: m.ready ? m.tdee : null, intake: m.ready ? m.intake : null, target: goalKey ? state.goals[goalKey].k : null, trend: trendAt(dayNum(d)) });
      }
      __today = null; dataVer++;
      return J(out);
    },
    // Which foods gave you the most of a nutrient over the last few days.
    nutrientSources: function (key, d, days) {
      var by = {}, end = dayNum(d);
      for (var x = end - days + 1; x <= end; x++) eatenFor(isoFromDay(x)).forEach(function (it) {
        var n = itemNutrients(it); if (!n || !n[key]) return;
        var name = it.name || 'Food', o = by[name] || (by[name] = { name: L(name), v: 0, times: 0 });
        o.v += n[key]; o.times++;
      });
      var list = Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.v - a.v; }).slice(0, 12);
      return J({ unit: NUT[key] ? NUT[key].unit : '', label: NUT[key] ? L(NUT[key].label) : key, list: list });
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
        weeks: weeks, cycle: cycleWindows().map(function (w) { return { from: isoFromDay(w.a), to: isoFromDay(w.b), guess: !!w.guess }; }), down: goodWhenDown(), goalKg: state.settings.goalKg || null, now: currentKg(), unit: unit() });
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
