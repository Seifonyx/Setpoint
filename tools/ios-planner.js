  // ---- Day planner (iPhone): a whole day of food for your targets ----
  // Built for the iPhone app (not the web app's meal ideas). Each meal is put together slot by slot (a protein, a
  // carb, vegetables or fruit, a little fat), choosing the food that best fills the vitamins and minerals the day
  // still lacks, leans towards what you actually log, and keeps the day sensible: one protein per meal, meat or fish
  // at most twice a day and never the same kind twice, a daily cap on meat and fish, and no food twice.
  // Amounts are then fitted so each meal lands on its share of your calories and macros, and rounded to amounts
  // you'd really eat (2 eggs, 1 slice, 150 g).

  // [id, slot, family, lo g, hi g, meals it suits (b breakfast, m main meal, s snack), English, Arabic]
  var POOL = [
    ['u2707154', 'p', 'egg', 50, 150, 'bm', 'Eggs', 'بيض'],
    ['u2705421', 'p', 'dairy', 150, 300, 'bs', 'Greek yogurt', 'زبادي يوناني'],
    ['u173417', 'p', 'dairy', 100, 250, 'bs', 'Cottage cheese', 'جبن قريش'],
    ['u2707367', 'p', 'legume', 120, 300, 'bm', 'Ful medames', 'فول مدمس'],
    ['u2705956', 'p', 'poultry', 100, 200, 'm', 'Chicken breast', 'صدر دجاج'],
    ['u9000024', 'p', 'poultry', 100, 200, 'm', 'Shish tawook', 'شيش طاووق'],
    ['u174494', 'p', 'poultry', 90, 170, 'm', 'Ground turkey', 'لحم ديك رومي مفروم'],
    ['u2705824', 'p', 'meat', 90, 160, 'm', 'Beef steak', 'ستيك لحم'],
    ['u9000022', 'p', 'meat', 70, 150, 'm', 'Kofta', 'كفتة'],
    ['u175168', 'p', 'fish', 100, 180, 'm', 'Salmon', 'سلمون'],
    ['u175177', 'p', 'fish', 110, 200, 'm', 'Tilapia', 'بلطي'],
    ['u2706311', 'p', 'fish', 70, 150, 'm', 'Tuna', 'تونة'],
    ['u175139', 'p', 'fish', 60, 110, 'm', 'Sardines', 'سردين'],
    ['u175180', 'p', 'fish', 90, 170, 'm', 'Shrimp', 'جمبري'],
    ['u172421', 'p', 'legume', 150, 300, 'm', 'Lentils', 'عدس'],
    ['u173801', 'p', 'legume', 120, 250, 'm', 'Chickpeas', 'حمص'],
    ['u2707436', 'p', 'legume', 80, 160, 'ms', 'Edamame', 'إدامامي'],
    ['u173904', 'c', 'grain', 30, 90, 'b', 'Oats', 'شوفان'],
    ['u2707711', 'c', 'grain', 30, 110, 'b', 'Whole wheat bread', 'خبز قمح كامل'],
    ['u174916', 'c', 'grain', 40, 120, 'bm', 'Whole wheat pita', 'عيش بلدي'],
    ['u2708403', 'c', 'grain', 100, 300, 'm', 'Rice', 'أرز'],
    ['u2708409', 'c', 'grain', 100, 300, 'm', 'Brown rice', 'أرز بني'],
    ['u172024', 'c', 'grain', 100, 280, 'm', 'Whole grain pasta', 'مكرونة حبوب كاملة'],
    ['u170093', 'c', 'grain', 150, 350, 'm', 'Baked potato', 'بطاطس مشوية'],
    ['u168483', 'c', 'grain', 150, 350, 'm', 'Sweet potato', 'بطاطا'],
    ['u168917', 'c', 'grain', 100, 260, 'm', 'Quinoa', 'كينوا'],
    ['u170287', 'c', 'grain', 100, 260, 'm', 'Bulgur', 'برغل'],
    ['u168462', 'v', 'leafy', 40, 100, 'bm', 'Spinach', 'سبانخ'],
    ['u168421', 'v', 'leafy', 30, 80, 'm', 'Kale', 'كرنب أجعد'],
    ['u2709647', 'v', 'green', 100, 200, 'm', 'Broccoli', 'بروكلي'],
    ['u170393', 'v', 'root', 60, 150, 'm', 'Carrots', 'جزر'],
    ['u2709719', 'v', 'salad', 80, 200, 'bm', 'Tomatoes', 'طماطم'],
    ['u168409', 'v', 'salad', 80, 200, 'bm', 'Cucumber', 'خيار'],
    ['u2709855', 'v', 'green', 100, 200, 'm', 'Green beans', 'فاصوليا خضراء'],
    ['u169986', 'v', 'green', 100, 200, 'm', 'Cauliflower', 'قرنبيط'],
    ['u2709793', 'v', 'other', 60, 150, 'bm', 'Mushrooms', 'مشروم'],
    ['u9000008', 'v', 'leafy', 150, 300, 'm', 'Molokhia', 'ملوخية'],
    ['u173944', 'x', 'fruit', 100, 150, 'bs', 'Banana', 'موز'],
    ['u171688', 'x', 'fruit', 150, 220, 'bs', 'Apple', 'تفاح'],
    ['u169097', 'x', 'fruit', 130, 220, 'bs', 'Orange', 'برتقال'],
    ['u167762', 'x', 'fruit', 120, 250, 'bs', 'Strawberries', 'فراولة'],
    ['u168153', 'x', 'fruit', 70, 160, 'bs', 'Kiwi', 'كيوي'],
    ['u171711', 'x', 'fruit', 80, 160, 'bs', 'Blueberries', 'توت أزرق'],
    ['u173044', 'x', 'fruit', 60, 180, 'bs', 'Guava', 'جوافة'],
    ['u169134', 'x', 'fruit', 80, 170, 'bs', 'Pomegranate', 'رمان'],
    ['u171726', 'x', 'fruit', 20, 50, 's', 'Dates', 'بلح'],
    ['u171413', 'f', 'oil', 5, 15, 'm', 'Olive oil', 'زيت زيتون'],
    ['u170567', 'f', 'nut', 15, 35, 'bs', 'Almonds', 'لوز'],
    ['u170187', 'f', 'nut', 15, 30, 'bs', 'Walnuts', 'عين جمل'],
    ['u2707537', 'f', 'nut', 15, 32, 'bs', 'Peanut butter', 'زبدة فول سوداني'],
    ['u171705', 'f', 'fruit-fat', 50, 120, 'bm', 'Avocado', 'أفوكادو'],
    ['u170554', 'f', 'seed', 10, 25, 'b', 'Chia seeds', 'بذور الشيا'],
    ['u173420', 'f', 'cheese', 25, 60, 'b', 'Feta', 'جبنة فيتا'],
    ['u170872', 'd', 'dairy', 200, 300, 'bs', 'Milk', 'حليب']
  ];
  // What each kind of meal is made of. '?' = only when the meal still needs it.
  var SHAPES = { b: ['p', 'c', 'xv', 'f?'], m: ['p', 'c', 'v', 'v', 'f'], s: ['ps', 'x'] };
  var FLESH = { meat: 1, poultry: 1, fish: 1 }, FLESH_CAP = 260; // g of meat, chicken and fish in a day at most
  // Breakfast goes one way or the other: sweet (yogurt, oats, fruit, nuts) or savoury (eggs, ful, bread, vegetables).
  var SWEET = { u2705421: 1, u173904: 1, u170872: 1, u170554: 1, u2707537: 1 }, SAVOURY = { u2707154: 1, u2707367: 1, u173420: 1, u171705: 1 };
  function style(x) { if (SWEET[x.f.id] || x.slot === 'x') return 'sweet'; if (SAVOURY[x.f.id] || x.slot === 'v') return 'savoury'; return ''; }
  var MICRO_KEYS = ['fib', 'vA', 'vC', 'vD', 'vE', 'vK', 'fol', 'b12', 'b6', 'ca', 'fe', 'mg', 'k', 'zn'];

  function planKind(k) {
    var n = ((MEALS.find(function (m) { return m[0] === k; }) || [k, k])[1] || '').toLowerCase() + ' ' + k;
    if (/breakfast|suhoor|morning|فطار|سحور/.test(n)) return 'b';
    if (/lunch|dinner|iftar|supper|غداء|عشاء|إفطار/.test(n)) return 'm';
    return 's';
  }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // How often you log each food, by kind of meal, over the last 90 days (what the planner learns from).
  function logsByKind() {
    var out = { b: {}, m: {}, s: {} }, grams = {}, from = dayNum(todayISO()) - 90;
    Object.keys(state.food).forEach(function (dt) {
      if (dayNum(dt) < from) return;
      state.food[dt].forEach(function (it) {
        if (!it.ref || it.plan || isDailyTotal(it)) return;
        var k = planKind(it.meal); out[k][it.ref] = (out[k][it.ref] || 0) + 1;
        (grams[it.ref] = grams[it.ref] || []).push(it.g || 0);
      });
    });
    return { use: out, grams: grams };
  }
  // Your own regulars become candidates too, in the slot their kind fits.
  function slotOf(f) {
    var k = ftKind(f), kc = per100(f, 'kcal') || 0, p = per100(f, 'p') || 0;
    if (!kc) return null;
    var pShare = p * 4 / kc;
    if (k === 'meat' || k === 'poultry' || k === 'fish') return pShare > 0.3 ? ['p', k] : null;
    if (k === 'egg') return ['p', 'egg'];
    if (k === 'dairy') return pShare > 0.3 ? ['p', 'dairy'] : ['d', 'dairy'];
    if (k === 'legume') return ['p', 'legume'];
    if (k === 'grain') return ['c', 'grain'];
    if (k === 'veg') return ['v', 'other'];
    if (k === 'fruit') return ['x', 'fruit'];
    if (k === 'nut') return ['f', 'nut'];
    return null; // sweets, drinks, snacks, dishes and sauces aren't planned
  }
  function candidates(logs, useMine) {
    var list = [], seen = {};
    POOL.forEach(function (d) {
      var f = getFood(d[0]); if (!f) return;
      seen[f.id] = 1;
      list.push({ f: f, slot: d[1], fam: d[2], lo: d[3], hi: d[4], fits: d[5], label: lang === 'ar' ? d[7] : d[6] });
    });
    if (useMine) ['b', 'm', 's'].forEach(function (kind) {
      Object.keys(logs.use[kind]).forEach(function (ref) {
        if (seen[ref] || logs.use[kind][ref] < 3) return;
        var f = getFood(ref), s = f && slotOf(f); if (!s) return;
        seen[ref] = 1;
        var gs = (logs.grams[ref] || []).filter(function (g) { return g > 0; }).sort(function (a, b) { return a - b; }), med = gs.length ? gs[Math.floor(gs.length / 2)] : 100;
        list.push({ f: f, slot: s[0], fam: s[1], lo: Math.max(5, med * 0.6), hi: med * 1.4, fits: kind === 'm' ? 'm' : kind === 'b' ? 'b' : 's', label: L(f.name), mine: true });
      });
    });
    return list;
  }
  function nutAt(f, k, g) { var v = per100(f, k); return v == null ? 0 : v * g / 100; }

  // Grams that read well: whole eggs, slices and pieces, else steps of 5 or 10 g.
  function wholeAmount(f, g, slot) {
    // the units that read naturally for each kind of food
    var k = ftKind(f), ok = k === 'egg' ? /^(large|medium|egg)$/ : k === 'fruit' ? /^(large|medium|small|fruit|date)$/ : k === 'grain' && /bread|pita/i.test(f.name) ? /^(slice|pita|small pita)$/
      : (k === 'grain' && !/potato/i.test(f.name)) || k === 'legume' || (k === 'dairy' && slot !== 'f') ? /^(cup)$/ : k === 'nut' && /butter/i.test(f.name) ? /^(tbsp)$/ : /^(fillet|skewer|piece)$/;
    var u = slot === 'v' ? null : unitsFor(f).find(function (x) { return !x.mine && ok.test(x.label) && x.g >= 8 && x.g <= 260; });
    if (u) {
      var half = /pita|cup|tbsp/.test(u.label), q = Math.max(half ? 0.5 : 1, half ? Math.round(g / u.g * 2) / 2 : Math.round(g / u.g));
      if (Math.abs(q * u.g - g) / Math.max(g, 1) < 0.3) return { qty: q, unit: u.label, g: Math.round(q * u.g * 10) / 10 };
    }
    var step = g < 40 ? 5 : 10, gg = Math.max(step, Math.round(g / step) * step);
    return { qty: gg, unit: 'g', g: gg };
  }
  // Amounts for a meal's foods so it lands on its calories and macros, each within a sensible range.
  function fitAmounts(foods, T) {
    var n = foods.length, per = foods.map(function (x) { return ['kcal', 'p', 'c', 'f'].map(function (k) { return (per100(x.f, k) || 0) / 100; }); });
    var g = foods.map(function (x) { return (x.lo + x.hi) / 2; }), tgt = [T.kcal, T.p, T.c, T.f], w = [1, 4 * 1.8, 4, 9];
    for (var round = 0; round < 80; round++) {
      var moved = 0;
      for (var i = 0; i < n; i++) {
        var t = [0, 0, 0, 0]; for (var j = 0; j < n; j++) for (var k = 0; k < 4; k++) t[k] += per[j][k] * g[j];
        var num = 0, den = 0;
        for (k = 0; k < 4; k++) { var ww = w[k] * w[k]; num += ww * (t[k] - tgt[k]) * per[i][k]; den += ww * per[i][k] * per[i][k]; }
        if (!den) continue;
        var ng = Math.max(foods[i].lo, Math.min(foods[i].hi, g[i] - num / den));
        moved += Math.abs(ng - g[i]); g[i] = ng;
      }
      if (moved < 0.5) break;
    }
    return g;
  }

  function planDayNow(o) {
    var T = o.target; if (!T || !(T.kcal > 0)) return null;
    var keys = MEALS.map(function (m) { return m[0]; }), open = keys.filter(function (k) { return !o.meals || !o.meals.length || o.meals.indexOf(k) >= 0; });
    var logs = logsByKind(), useMine = o.mine !== false, pool = candidates(logs, useMine), seeds = o.seeds || {};
    var nt = nutTargets(todayISO()), goal = {}; MICRO_KEYS.forEach(function (k) { goal[k] = nt[k] && nt[k].goal ? nt[k].goal : null; });
    var have = {}; MICRO_KEYS.forEach(function (k) { have[k] = 0; });
    var used = {}, fleshMeals = 0, fleshG = 0, famUsed = {}, eggs = 0;
    var proteinNeed = Math.min(2, Math.max(0.5, T.p * 4 / T.kcal / 0.2)); // how protein-heavy your targets are
    var share = { b: 25, m: 35, s: 10 }, wsum = open.reduce(function (a, k) { return a + share[planKind(k)]; }, 0);
    // Main meals first (they carry the day's protein), then breakfast, then snacks.
    var order = open.slice().sort(function (a, b) { return 'mbs'.indexOf(planKind(a)) - 'mbs'.indexOf(planKind(b)); });
    var byMeal = {};
    order.forEach(function (mk) {
      var kind = planKind(mk), s = share[kind] / wsum, MT = { kcal: T.kcal * s, p: T.p * s, c: T.c * s, f: T.f * s };
      var r = rng(hashStr(mk + ':' + (seeds[mk] || 0) + ':' + (o.seed || 0))), picked = [], famHere = {}, mood = '';
      var gain = function (x) {
        var mid = (x.lo + x.hi) / 2, sc = 0;
        MICRO_KEYS.forEach(function (k) {
          if (!goal[k]) return;
          var need = Math.max(0, goal[k] - have[k]); if (!need) return;
          sc += Math.min(nutAt(x.f, k, mid), need) / goal[k] * (k === 'fib' ? 1.5 : /^v|^b|fol/.test(k) ? 1.3 : 1);
        });
        return sc;
      };
      var ok = function (x, slot) {
        if (used[x.f.id] && x.fam !== 'oil') return false;
        if (x.fits.indexOf(kind) < 0) return false;
        if (slot === 'ps') { if (!(x.slot === 'p' && x.fam !== 'meat' && x.fam !== 'poultry' && x.fam !== 'fish') && !(x.slot === 'd') && !(x.slot === 'f' && x.fam === 'nut')) return false; }
        else if (slot === 'xv') { if (x.slot !== 'x' && x.slot !== 'v') return false; }
        else if (x.slot !== slot) return false;
        if (FLESH[x.fam]) {
          if (fleshMeals >= 2 || famUsed[x.fam] || FLESH_CAP - fleshG < x.lo) return false;
          if (x.fam === 'meat' && famUsed.meat) return false;
        }
        if (x.fam === 'egg' && eggs >= 3) return false;
        if (slot === 'v' && famHere[x.fam] && x.fam !== 'other') return false; // two different kinds of vegetable
        return true;
      };
      SHAPES[kind].forEach(function (slot) {
        var optional = /\?$/.test(slot); slot = slot.replace('?', '');
        if (optional) { // a little fat only if the meal's fat isn't covered yet
          var fat = picked.reduce(function (a, x) { return a + nutAt(x.f, 'f', (x.lo + x.hi) / 2); }, 0);
          if (fat >= MT.f * 0.8) return;
        }
        var best = null, bs = -1e9;
        pool.forEach(function (x) {
          if (!ok(x, slot) || picked.indexOf(x) >= 0) return;
          var learn = useMine ? Math.log(1 + (logs.use[kind][x.f.id] || 0)) * 1.6 : 0;
          var kc = per100(x.f, 'kcal') || 1, pd = (per100(x.f, 'p') || 0) * 400 / kc; // % of calories from protein
          var prot = x.slot === 'p' || slot === 'ps' ? Math.min(1.6, Math.max(0, pd - 20) / 15) * proteinNeed : 0;
          if (kind === 'b' && mood && style(x) && style(x) !== mood) return; // no blueberries with ful
          var sc = Math.min(gain(x), 3) * (x.slot === 'c' ? 0.6 : 1.3) + prot * 0.8 + learn + r() * 2.8 + (x.mine ? 0.4 : 0);
          if (sc > bs) { bs = sc; best = x; }
        });
        if (!best) return;
        if (kind === 'b' && !mood) mood = style(best);
        picked.push(best); used[best.f.id] = 1; famHere[best.fam] = 1;
        if (FLESH[best.fam]) { fleshMeals++; famUsed[best.fam] = 1; }
      });
      // the meat or fish portion can't take the day over its cap
      var foods = picked.map(function (x) { var y = Object.assign({}, x); if (FLESH[x.fam]) y.hi = Math.min(x.hi, FLESH_CAP - fleshG); return y; });
      var grams = fitAmounts(foods, MT);
      var items = foods.map(function (x, i) {
        var a = wholeAmount(x.f, grams[i], x.slot), m = macrosFor(x.f, a.g);
        if (FLESH[x.fam]) fleshG += a.g;
        if (x.fam === 'egg') eggs += Math.round(a.g / 50);
        MICRO_KEYS.forEach(function (k) { have[k] += nutAt(x.f, k, a.g); });
        return { ref: x.f.id, name: x.label, qty: a.qty, unit: a.unit, g: a.g, amt: L(fmtAmt(a.qty, a.unit)), kind: ftKind(x.f),
          kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat, usual: !!(logs.use[kind][x.f.id] >= 2) };
      });
      byMeal[mk] = items;
    });
    var meals = keys.map(function (k) {
      var items = byMeal[k];
      if (!items) return { meal: k, name: mealName(k), on: false, items: [], kcal: 0, protein: 0, carbs: 0, fat: 0 };
      var t = items.reduce(function (a, x) { a.kcal += x.kcal; a.protein += x.protein; a.carbs += x.carbs; a.fat += x.fat; return a; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
      return Object.assign({ meal: k, name: mealName(k), on: true, items: items }, t);
    });
    var tot = meals.reduce(function (a, m) { a.kcal += m.kcal; a.protein += m.protein; a.carbs += m.carbs; a.fat += m.fat; return a; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    var micros = MICRO_KEYS.filter(function (k) { return goal[k]; }).map(function (k) {
      return { key: k, label: L(NUT[k] ? NUT[k].label : k), pct: Math.round(have[k] / goal[k] * 100) };
    });
    return { target: { kcal: Math.round(T.kcal), protein: Math.round(T.p), carbs: Math.round(T.c), fat: Math.round(T.f) }, total: tot, meals: meals, micros: micros,
      met: micros.filter(function (m) { return m.pct >= 80; }).length };
  }
