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
  // Units as shown: readable names (no "(6\" to 6-7/8\" long)" or "(yield from 1 lb ...)"), sizes from small to large,
  // then the rest in the food's own order, then weights. The label stays the key, so logged foods keep working.
  var SIZE_RANK = { 'extra small': 1, small: 2, medium: 3, large: 4, 'extra large': 5, jumbo: 6 };
  // Tidy a unit's name without losing what it says: `small (6" to 6-7/8" long)` → `small (6" to 6⅞")`,
  // `large (3-1/4" dia)` → `large (3¼" across)`, `cup (4.86 large eggs)` → `cup (about 5 large eggs)`.
  var FRAC = { '1/2': '½', '1/4': '¼', '3/4': '¾', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞', '1/3': '⅓', '2/3': '⅔' };
  function unitText(l) {
    if (l === 'NLEA serving') return 'serving (label)';
    var t = String(l)
      .replace(/(\d+)-(\d\/\d)/g, function (a, w, f) { return FRAC[f] ? w + FRAC[f] : a; })
      .replace(/(^|[\s(])(\d\/\d)(?=["\s)])/g, function (a, pre, f) { return FRAC[f] ? pre + FRAC[f] : a; })
      .replace(/\(less than ([^)]*?)(?: long)?\)/, '(under $1)')
      .replace(/(\d+)-(\d+\/\d+)/g, '$1 $2').replace(/\s+long\)/g, ')').replace(/" dia\b/g, '" across')
      .replace(/\((\d+\.\d+) /, function (a, n) { return '(about ' + Math.round(parseFloat(n)) + ' '; })
      .replace(/^unit\b/, 'piece').replace(/yield from /, 'from ').replace(/ready-to-cook /, 'raw ')
      .trim();
    return t || l;
  }
  // In Arabic: the size word translated, its description (6" to 6⅞") kept as it is.
  function unitL(t) {
    var i = t.indexOf(' ('); if (i < 0) return L(t);
    var base = t.slice(0, i), tr = L(base);
    return (tr !== base ? tr : base) + t.slice(i);
  }
  function unitRows(us) {
    var rows = us.map(function (u, i) { var t = unitText(u.label); return { label: u.label, g: u.g, text: t, mine: !!u.mine, i: i, size: SIZE_RANK[t.toLowerCase().replace(/\s*\(.*$/, '')] || 0 }; });
    rows.forEach(function (r) { if (rows.some(function (o) { return o !== r && o.text === r.text; })) r.text = r.label; }); // keep both if cleaning made them the same
    var weights = ['g', 'oz', 'kg', 'lb'];
    var group = function (r) { return weights.indexOf(r.label) >= 0 ? 3 : r.size ? 1 : 2; };
    rows.sort(function (a, b) { return group(a) - group(b) || (a.size - b.size) || (group(a) === 3 ? weights.indexOf(a.label) - weights.indexOf(b.label) : a.i - b.i); });
    return rows.map(function (r) { return { label: r.label, g: Math.round(r.g * 10) / 10, text: unitL(r.text), mine: r.mine, weight: weights.indexOf(r.label) >= 0 || r.label === 'ml' }; });
  }
  function itemFor(f, qty, label, meal) {
    var us = unitsFor(f), u = us.find(function (x) { return x.label === label; }) || us[0], g = qty * u.g, m = macrosFor(f, g);
    return { id: newId(), meal: meal, ref: f.id, g: Math.round(g * 10) / 10, qty: Math.round(qty * 1000) / 1000, unit: u.label,
      kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat, name: f.name.slice(0, 80) };
  }
  // ---- Recipe import: a recipe page's ingredient lines, matched to the food list ----
  // A recipe page's own description of itself (schema.org Recipe in <script type="application/ld+json">, which
  // most recipe sites publish): its name, servings and ingredient lines. null if the page has none.
  function recipeOf(html) {
    var found = null;
    var visit = function (o) {
      if (found || !o || typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach(visit); return; }
      var t = o['@type'], isR = t === 'Recipe' || (Array.isArray(t) && t.indexOf('Recipe') >= 0);
      if (isR && Array.isArray(o.recipeIngredient || o.ingredients)) { found = o; return; }
      Object.keys(o).forEach(function (k) { if (k === '@graph' || k === 'mainEntity' || k === 'itemListElement' || typeof o[k] === 'object') visit(o[k]); });
    };
    var re = /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi, m;
    while ((m = re.exec(html)) && !found) { try { visit(JSON.parse(m[1].trim())); } catch (e) {} }
    if (!found) return null;
    var text = function (x) { return String(x == null ? '' : x).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;|&#160;/g, ' ').replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); }).replace(/\s+/g, ' ').trim(); };
    var y = found.recipeYield; if (Array.isArray(y)) y = y[0];
    var servings = parseInt(String(y == null ? '' : y).replace(/[^\d]/g, ' ').trim().split(' ')[0], 10);
    return { name: text(found.name), servings: servings > 0 && servings < 100 ? servings : null,
      lines: (found.recipeIngredient || found.ingredients).map(text).filter(Boolean).slice(0, 60) };
  }
  // "1 ½ cups (200 g) rice, rinsed" → { qty: 1.5, unit: 'cup', grams: 200, name: 'rice' }
  var FRAC = { '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 0.25, '¾': 0.75, '⅕': 0.2, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875 };
  var UNITW = [['tbsp', /^(tablespoons?|tbsps?\.?|tbl?s?\.?|T|ملاعق كبيرة|ملعقة كبيرة|معالق كبيرة)$/], ['tsp', /^(teaspoons?|tsps?\.?|t|ملاعق صغيرة|ملعقة صغيرة|معالق صغيرة)$/],
    ['cup', /^(cups?|c\.?|كوب|اكواب|أكواب|كوباية|كوبايات)$/], ['g', /^(g|grams?|grammes?|gr\.?|جم|جرام|غرام|جرامات)$/], ['kg', /^(kg|kilos?|kilograms?|كيلو|كجم)$/],
    ['ml', /^(ml|millilitres?|milliliters?|مل|ملي)$/], ['l', /^(l|litres?|liters?|لتر)$/], ['oz', /^(oz|ounces?)$/], ['lb', /^(lbs?|pounds?)$/],
    ['clove', /^(cloves?|فص|فصوص)$/], ['slice', /^(slices?|شريحة|شرائح)$/], ['can', /^(cans?|tins?|علبة|علب)$/], ['pinch', /^(pinch(es)?|dash(es)?|رشة)$/],
    ['piece', /^(pieces?|pcs?|حبة|حبات|قطعة|قطع)$/], ['large', /^(large|كبيرة|كبير)$/], ['medium', /^(medium|متوسطة|متوسط)$/], ['small', /^(small|صغيرة|صغير)$/]];
  function parseLine(line) {
    var s = String(line).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/(\d)\s*([½⅓⅔¼¾⅕⅛⅜⅝⅞])/g, function (_, d, f) { return String(+d + FRAC[f]); })
      .replace(/[½⅓⅔¼¾⅕⅛⅜⅝⅞]/g, function (f) { return String(FRAC[f]); }).replace(/⁄/g, '/');
    // a weight in brackets is the most exact thing on the line: "1 (14.5 oz) can", "1 ½ cups (200 g)"
    var grams = null, gm = /\((?:about |approx\.? |~)?(\d+(?:\.\d+)?)[\s-]*(g|grams?|ml|oz|ounces?)\b[^)]*\)/i.exec(s);
    if (gm) grams = /^o/i.test(gm[2]) ? +gm[1] * 28.3495 : +gm[1];
    var toTaste = /\b(to taste|as needed|for garnish|optional)\b|حسب الرغبة|حسب الذوق/i.test(s);
    s = s.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
    s = s.replace(/^(an?|one)\s+/i, '1 ');
    var qty = null, m = /^(\d+(?:\.\d+)?)\s+(\d+)\/(\d+)\s*/.exec(s);
    if (m) { qty = +m[1] + m[2] / m[3]; s = s.slice(m[0].length); }
    else if ((m = /^(\d+)\/(\d+)\s*/.exec(s))) { qty = m[1] / m[2]; s = s.slice(m[0].length); }
    else if ((m = /^(\d+(?:[.,]\d+)?)\s*(?:-|–|to)\s*(\d+(?:[.,]\d+)?)\s*/.exec(s))) { qty = (parseFloat(m[1].replace(',', '.')) + parseFloat(m[2].replace(',', '.'))) / 2; s = s.slice(m[0].length); }
    else if ((m = /^(\d+(?:[.,]\d+)?)\s*/.exec(s))) { qty = parseFloat(m[1].replace(',', '.')); s = s.slice(m[0].length); }
    var unit = null, w = /^([^\s,]+)\s*/.exec(s);
    if (w) { var word = w[1].replace(/\.$/, ''); for (var i = 0; i < UNITW.length; i++) if (UNITW[i][1].test(word) || UNITW[i][1].test(word.toLowerCase())) { unit = UNITW[i][0]; s = s.slice(w[0].length); break; } }
    if (unit && /^of\s/i.test(s)) s = s.slice(3);
    var name = s.split(/,|;| - | – /)[0].replace(/\b(fresh(ly)?|chopped|diced|minced|sliced|grated|optional|to taste|divided|plus more|for serving|finely|roughly|about|approximately|packed|heaping|level)\b/gi, ' ')
      .replace(/\s+/g, ' ').trim();
    // Arabic plurals the food list doesn't know (بيضات → بيض)
    var stem = /[\u0600-\u06FF]/.test(name) ? name.replace(/(ات|ة)(?=\s|$)/g, '') : null;
    return { qty: qty, unit: unit, grams: grams, name: name || String(line), stem: stem !== name ? stem : null, skip: toTaste && qty == null };
  }
  // The food's own unit for what the recipe said, and how many of them. null unit = use grams.
  function unitMatch(f, p) {
    var us = unitsFor(f), find = function (re) { return us.find(function (u) { return re.test(u.label); }); }, q = p.qty == null ? 1 : p.qty;
    if (p.grams) return { qty: p.grams, unit: 'g', sure: true };
    switch (p.unit) {
      case 'g': return { qty: q, unit: 'g', sure: true };
      case 'kg': return { qty: q * 1000, unit: 'g', sure: true };
      case 'oz': return { qty: q * 28.3495, unit: 'g', sure: true };
      case 'lb': return { qty: q * 453.592, unit: 'g', sure: true };
      case 'l': p = { qty: q * 1000, unit: 'ml' }; q = p.qty; /* falls through */
      case 'ml': { var ml = find(/^ml$/), cup = find(/^cup\b/);
        if (ml) return { qty: q, unit: ml.label, sure: true };
        if (cup) return { qty: q / 236.588, unit: cup.label, sure: true };
        return { qty: q, unit: 'g', sure: false }; }
      case 'cup': case 'tbsp': case 'tsp': { var u = find(new RegExp('^' + (p.unit === 'cup' ? 'cup' : p.unit === 'tbsp' ? '(tbsp|tablespoon)' : '(tsp|teaspoon)') + '\\b'));
        if (u) return { qty: q, unit: u.label, sure: true };
        var gPer = { cup: 240, tbsp: 15, tsp: 5 }[p.unit]; return { qty: q * gPer, unit: 'g', sure: false }; }
      case 'pinch': { var t = find(/^(tsp|teaspoon)\b/); return t ? { qty: q * 0.0625, unit: t.label, sure: true } : { qty: q * 0.4, unit: 'g', sure: true }; }
      case 'large': case 'medium': case 'small': { var z = find(new RegExp('\\b' + p.unit + '\\b', 'i')); if (z) return { qty: q, unit: z.label, sure: true }; break; }
      case 'clove': case 'slice': case 'can': { var c = find(new RegExp('\\b' + p.unit, 'i')); if (c) return { qty: q, unit: c.label, sure: true }; break; }
    }
    // a count with no unit ("2 eggs", "1 onion"): the food's natural piece (a medium one when sizes are listed)
    var piece = find(/\bmedium\b/i) || us.find(function (x) { return ['g', 'oz', 'kg', 'lb', 'ml', 'tbsp', 'tsp'].indexOf(x.label) < 0 && !/^(cup|tbsp|tsp|fl oz)\b/.test(x.label); });
    if (piece && p.qty != null) return { qty: q, unit: piece.label, sure: p.unit == null };
    var ds = defaultServing(f); return { qty: ds.qty, unit: ds.unit.label, sure: false };
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
    // Recent or most-logged foods at one meal (the All tab's "This meal"): what you eat at breakfast at breakfast.
    // Same rules as foodUse (last 120 days, hidden ones left out); a logged meal counts each of its foods.
    mealList: function (meal, sort) {
      var from = dayNum(todayISO()) - 120, use = {}, order = [], hid = state.ui.hide || [], out = [];
      Object.keys(state.food).sort().reverse().forEach(function (dt) {
        if (dayNum(dt) < from) return;
        state.food[dt].slice().reverse().forEach(function (it) {
          if (it.meal !== meal || isDailyTotal(it) || it.plan || isImported(it)) return;
          (it.mid ? (it.mi || []) : [it]).forEach(function (x) {
            var k = x.ref || ('q|' + x.name + '|' + x.kcal + '|' + x.protein + '|' + x.carbs + '|' + x.fat);
            if (hid.indexOf(k) >= 0) return;
            if (use[k] == null) { use[k] = 0; order.push({ k: k, item: x, i: order.length }); }
            use[k]++;
          });
        });
      });
      var list = sort === 'frequent' ? order.slice().sort(function (a, b) { return (use[b.k] - use[a.k]) || a.i - b.i; }) : order;
      list.forEach(function (o) {
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
    // My foods as one list (like Cronometer's Custom tab): your own foods, recipes and saved meals together, sorted
    // by one rule. Usage comes from foodUse() (last 120 days); a logged meal counts as its meal ("m:<id>").
    // sort: 'recent' (last logged first), 'frequent' (most logged first, ties by recency), 'az', 'kcal'.
    // Never-logged items go after logged ones in A to Z order, so every sort gives a sensible, stable list.
    mineAll: function (meal, sort) {
      var fu = foodUse(), rec = {}, use = fu.allUse, out = [];
      fu.all.forEach(function (o, i) { if (rec[o.key] == null) rec[o.key] = i; });
      state.myFoods.map(customFood).forEach(function (f) { out.push(Object.assign(row(f, meal), { type: 'mine' })); });
      state.recipes.map(recipeFood).filter(Boolean).forEach(function (f) { out.push(Object.assign(row(f, meal), { type: 'recipe' })); });
      state.meals.forEach(function (m) {
        out.push({ id: 'm:' + m.id, mealId: m.id, type: 'meal', kind: 'meal', name: m.name, kcal: mealTotal(m.items), count: m.items.length });
      });
      out.forEach(function (r) { r.uses = use[r.id] || 0; r.last = rec[r.id] == null ? null : rec[r.id]; });
      var az = function (a, b) { return String(a.name).localeCompare(String(b.name)); };
      var recent = function (a, b) {
        if (a.last == null || b.last == null) return a.last == null && b.last == null ? 0 : a.last == null ? 1 : -1;
        return a.last - b.last;
      };
      var cmp = sort === 'az' ? az
        : sort === 'kcal' ? function (a, b) { return (a.kcal || 0) - (b.kcal || 0) || az(a, b); }
        : sort === 'frequent' ? function (a, b) { return (b.uses - a.uses) || recent(a, b) || az(a, b); }
        : function (a, b) { return recent(a, b) || az(a, b); };
      return J(out.sort(cmp));
    },
    // Search inside one tab only (Favorites or My foods), with the same word matching as the main search
    // (synonyms, Arabic, small typos), in the tab's own sort order.
    searchIn: function (q, meal, kind, sort, verifiedOnly) {
      var toks = queryToks(q);
      if (toks.length > 1) { var kept = toks.filter(function (a) { return !FILLER[a[0]]; }); if (kept.length) toks = kept; }
      var qn = normText(q);
      if (!toks.length && !qn) return '[]';
      var rows = kind === 'mine' ? JSON.parse(this.mineAll(meal, sort)) : JSON.parse(this.listSorted('favorites', meal, sort, verifiedOnly));
      return J(rows.filter(function (r) {
        var f = r.mealId ? null : getFood(r.id), w = f && f.w ? f.w : wordsOf(r.name);
        return (toks.length && toks.every(function (t) { return !!matchTok(t, w); })) || normText(r.name).indexOf(qn) >= 0;
      }));
    },
    // Recipe import: a page's recipe ({name, servings, lines} or null), then each line matched to a food.
    recipeFromHtml: function (html) { return J(recipeOf(String(html))); },
    importLines: function (txt) {
      var self = this;
      return J(JSON.parse(txt).map(function (line) {
        var p = parseLine(line);
        if (p.skip) return { line: line, ok: false, skip: true }; // "salt and pepper to taste": nothing to count
        var find = function (q) { return JSON.parse(self.search(q, 'lunch')).filter(function (h) { return !h.quick; }).slice(0, 6).map(function (h) { return getFood(h.id); }).filter(Boolean); };
        var foods = (p.stem && find(p.stem)) || []; if (!foods.length) foods = find(p.name);
        // a cup of flour needs a food that knows what a cup weighs: prefer one of the top matches with that unit
        var wants = { cup: /^cup\b/, tbsp: /^(tbsp|tablespoon)\b/, tsp: /^(tsp|teaspoon)\b/, clove: /clove/i, slice: /slice/i, large: /\blarge\b/i, medium: /\bmedium\b/i, small: /\bsmall\b/i }[p.unit];
        var f = (wants && !p.grams && foods.find(function (x) { return unitsFor(x).some(function (u) { return wants.test(u.label); }); })) || foods[0];
        if (!f) return { line: line, ok: false };
        var u = unitMatch(f, p), it = itemFor(f, u.qty, u.unit, 'lunch');
        return { line: line, ok: true, sure: u.sure, id: f.id, name: L(f.name), kind: ftKind(f), qty: it.qty, unit: it.unit, amt: L(fmtAmt(it.qty, it.unit)), kcal: it.kcal,
          item: { ref: it.ref, name: it.name, g: it.g, qty: it.qty, unit: it.unit, kcal: it.kcal } };
      }));
    },
    savedMeals: function () { return J(state.meals.map(function (m) { return { id: m.id, name: m.name, kcal: mealTotal(m.items), n: m.items.length }; })); },
    // One food: its units, a starting amount (your usual, else a sensible serving) and its numbers per 100 g.
    food: function (id, meal) {
      var f = getFood(id); if (!f) return 'null';
      var us = unitsFor(f), lp = lastPortion(f.id, meal), ds = defaultServing(f), p = function (k) { var v = per100(f, k); return v == null ? null : v; };
      var def = lp && us.some(function (u) { return u.label === lp.unit; }) ? { qty: lp.qty, unit: lp.unit } : { qty: ds.qty, unit: ds.unit.label };
      return J({ id: f.id, name: L(f.name), cat: f.cat || null, units: unitRows(us), def: def, fav: isFav(f.id), est: !!f.est, recipe: !!f.recipe, custom: !!f.custom,
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
    // A saved meal into the diary: as one entry holding its foods (the default), or as separate foods (a setting).
    logMeal: function (mid, meal, factor, separate) {
      var mm = state.meals.find(function (m) { return m.id === mid; }); if (!mm) return '[]';
      var k = factor > 0 ? factor : 1;
      if (!separate) {
        var mi = mm.items.map(function (it) {
          var c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan;
          if (k !== 1) {
            ['kcal', 'protein', 'carbs', 'fat'].forEach(function (x) { if (typeof c[x] === 'number') c[x] = Math.round(c[x] * k); });
            ['g', 'qty'].forEach(function (x) { if (typeof c[x] === 'number') c[x] = Math.round(c[x] * k * 1000) / 1000; });
          }
          return c;
        });
        var sum = function (x) { return mi.reduce(function (a, c) { return a + (Number(c[x]) || 0); }, 0); };
        return J([{ id: newId(), name: mm.name, meal: meal, mid: mm.id, mi: mi, kcal: Math.min(10000, Math.round(sum('kcal'))),
          protein: Math.round(sum('protein')), carbs: Math.round(sum('carbs')), fat: Math.round(sum('fat')) }]);
      }
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
        plan: pl ? { target: pl.target, protein: pl.protein, carbs: pl.carbs, fat: pl.fat, pace: pl.pace, warn: L(pl.warn), eta: L(pl.eta), etaISO: pl.etaISO || null, ref: pl.ref, refWhy: pl.refWhy, proteinPerKg: pl.proteinPerKg, fatPerKg: pl.fatPerKg, kind: pl.kind, custom: pl.custom, ranges: macroRanges(pl.pace.kg < 0, !!state.profile.bodyFat, state.profile.training || null) } : null,
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
    // Every nutrient's targets: the recommended minimum and maximum (by age and sex, or from your plan for calories and
    // macros), your own if you set any, and what's in use. Your own live in profile.nutT as { goal: min, hi: max }.
    targets: function (d) {
      var rec = nutRec(d), use = nutTargets(d), own = state.profile.nutT || {};
      var pick = function (o) { return o ? { goal: o.goal == null ? null : o.goal, hi: o.hi == null ? null : o.hi } : null; };
      return J({ groups: NUT_GROUPS.map(function (g) { return { key: g[0], label: L(g[1]) }; }),
        rows: NUTS.map(function (n) { var o = own[n[0]];
          return { key: n[0], label: L(n[1]), unit: n[2], group: n[3], plan: ['kcal', 'p', 'c', 'f'].indexOf(n[0]) >= 0,
            rec: pick(rec[n[0]]) || { goal: null, hi: null }, own: o == null ? null : (typeof o === 'number' ? { goal: o, hi: null } : { goal: o.goal === undefined ? null : o.goal, hi: o.hi === undefined ? null : o.hi }),
            use: pick(use[n[0]]) || { goal: null, hi: null } }; }) });
    },
    // Foods richest in a nutrient, per serving or per 100 kcal: everyday foods plus ones you've logged or saved
    // (the web app's own rules, so the list isn't organ meats and dried powders).
    highIn: function (key, by, meal) {
      if (!foodDB || !NUT[key]) return 'null';
      var perKcal = by === 'kcal', res = [], mine = {}, t1 = dayNum(todayISO()), tg = nutTargets(todayISO())[key], goal = tg ? (tg.min || tg.max || null) : null;
      for (var i = 0; i < 60; i++) eatenFor(isoFromDay(t1 - i)).forEach(function (it) { if (it.ref) mine[it.ref] = 1; });
      state.favs.forEach(function (r) { mine[r] = 1; });
      foodDB.list.forEach(function (f) {
        if (!f.pop && !mine[f.id]) return;
        var v100 = per100(f, key), kc = per100(f, 'kcal');
        if (!v100 || v100 <= 0 || CAT_PENALTY[f.cat] >= 5 || f.cat === 'Spices and Herbs' || f.cat === 'Packaged foods' || /[A-Z]{3,}|powder|dry mix|dehydrated|freeze-dried|supplement|fortified/.test(f.name) ||
          /mature seeds, raw|, crude|flour|\bmeal\b|\bbran\b|seaweed|, dry\b|uncooked|, unprepared/i.test(f.name)) return;
        if (perKcal) { if (!kc || kc < 15) return; res.push({ f: f, v: v100 / kc * 100, sub: L('per 100 kcal') }); return; }
        var sv = defaultServing(f), g = sv.qty * sv.unit.g;
        if (g > 500 || (kc || 0) * g / 100 > 450) return;
        res.push({ f: f, v: v100 * g / 100, sub: fmtAmt(sv.qty, sv.unit.label) });
      });
      res.sort(function (a, b) { return b.v - a.v || (b.f.pop || 0) - (a.f.pop || 0); });
      return J({ label: L(NUT[key].label), unit: NUT[key].unit, rows: res.slice(0, 40).map(function (r) { return { hit: row(r.f, meal || 'snacks'), v: r.v, sub: r.sub, pct: goal ? Math.round(r.v / goal * 100) : null }; }) });
    },
    // The icon kind for each food id (fruit, grain, drink, mine…), for lists of ingredients.
    kindsOf: function (txt) { var o = {}; JSON.parse(txt).forEach(function (r) { var f = getFood(r); o[r] = f ? ftKind(f) : 'quick'; }); return J(o); },
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
        var d = isoFromDay(today - 7 * k);
        __today = d; dataVer++;
        // "today" goes back to the real today even if a week can't be worked out (otherwise every list stays stuck)
        try {
          var m = measuredEnergyNow(), goalKey = Object.keys(state.goals).filter(function (x) { return x <= d; }).sort().pop();
          out.push({ date: d, tdee: m.ready ? m.tdee : null, intake: m.ready ? m.intake : null, target: goalKey ? state.goals[goalKey].k : null, trend: trendAt(dayNum(d)) });
        } finally { __today = null; dataVer++; }
      }
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
