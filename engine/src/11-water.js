  const DRINK_RE = /\b(milk|juice|tea|coffee|soda|cola|pepsi|drink|beverage|water|laban|latte|cappuccino|espresso|americano|karkade|hibiscus|sobia|sobya|smoothie|shake|lemonade|nescafe|kefir|buttermilk|ayran|nectar|sahlab|tamr hindi|erk soos)\b|مشروب|عصير|شاي|قهوه|لبن|كركديه|سوبيا|نسكافيه|مياه/i;
  function waterGoal() { return state.settings.waterGoal || (state.profile.sex === 'male' ? 2500 : state.profile.sex === 'female' ? 2000 : 2200); }
  function waterOn(d) { return state.water[d] || 0; }
  function isDrink(f) { return !!f && (/Beverages/.test(f.cat || '') || DRINK_RE.test(f.name)) && !/powder|dry|mix,|candy|bar\b|cake|pie|pudding|cheese|yogurt|cereal|bread|ice cream|frozen/i.test(f.name); }
  function drinksList(d) {
    const out = [];
    const one = function (it, scale) {
      if (it.ref && it.g) {
        if (it.ref.charAt(0) === 'r') { // a recipe: the drinks in it, for the share you had
          const rc = it.rc || state.recipes.find(function (x) { return x.id === it.ref; }); if (!rc || !rc.items) return;
          const total = rc.cookedG || rc.items.reduce(function (a, x) { return a + (x.g || 0); }, 0); if (!total) return;
          rc.items.forEach(function (x) { one({ ref: x.ref, g: x.g, name: x.name }, scale * it.g / total); });
          return;
        }
        const f = itemFood(it); if (!isDrink(f)) return;
        const w = per100(f, 'water'); out.push({ name: (it.name || f.name).split(' · ')[0], ml: it.g * scale * (w != null ? w : 90) / 100 });
      } else if (!it.ref && !it.mi && it.name && DRINK_RE.test(it.name) && !/powder|cake|bar\b/i.test(it.name)) out.push({ name: it.name, ml: 250 * scale, est: true });
    };
    eatenFor(d).forEach(function (it) { if (isDailyTotal(it)) return; if (Array.isArray(it.mi)) it.mi.forEach(function (x) { one(x, 1); }); else one(it, 1); });
    return out.filter(function (x) { return x.ml >= 1; });
  }
  function drinksWater(d) {
    if (state.settings.drinkWater === false) return 0;
    return Math.round(drinksList(d).reduce(function (a, x) { return a + x.ml; }, 0));
  }
  function waterTotal(d) { return waterOn(d) + drinksWater(d); }