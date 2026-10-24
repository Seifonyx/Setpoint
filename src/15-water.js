  /* ================= Water ================= */
  // Daily goal: yours if set, otherwise about 2 L (women) or 2.5 L (men) of drinks a day.
  function waterGoal() { return state.settings.waterGoal || (state.profile.sex === 'male' ? 2500 : state.profile.sex === 'female' ? 2000 : 2200); }
  function waterOn(d) { return state.water[d] || 0; }
  // Water in drinks you logged in the Diary (tea, coffee, juice, milk…), from each drink's real water content.
  const DRINK_RE = /\b(milk|juice|tea|coffee|soda|cola|pepsi|drink|beverage|water|laban|latte|cappuccino|espresso|americano|karkade|hibiscus|sobia|sobya|smoothie|shake|lemonade|nescafe|kefir|buttermilk|ayran|nectar|sahlab|tamr hindi|erk soos)\b|مشروب|عصير|شاي|قهوه|لبن|كركديه|سوبيا|نسكافيه|مياه/i;
  function isDrink(f) { return !!f && (/Beverages/.test(f.cat || '') || DRINK_RE.test(f.name)) && !/powder|dry|mix,|candy|bar\b|cake|pie|pudding|cheese|yogurt|cereal|bread|ice cream|frozen/i.test(f.name); }
  // Every drink in the day's diary with its water: drinks on their own, drinks inside meals, drink ingredients in
  // recipes (milk in a smoothie), and quick adds named like a drink (counted as a 250 ml cup, since they have no amount).
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
  function fmtWater(ml) { return ml >= 1000 ? (Math.round(ml / 10) / 100) + ' L' : Math.round(ml) + ' ml'; }
  function addWater(d, ml) {
    const prev = waterOn(d), next = Math.max(0, Math.min(10000, prev + ml));
    if (next) state.water[d] = next; else delete state.water[d];
    save(); renderDiary(); buzz(ml > 0 ? 'light' : 'medium');
    return prev;
  }
  function waterSheet(date) {
    const d = date || viewDay;
    const draw = function (root, editing) {
      const own = waterOn(d), fromDrinks = drinksWater(d), ml = own + fromDrinks, goal = waterGoal(), pct = Math.min(100, ml / goal * 100);
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">Water</h2></div></div>' +
        '<div class="water-big"><span class="num">' + fmtWater(ml) + '</span><small>of ' + fmtWater(goal) + '</small></div>' +
        '<div class="bar water-bar"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
        (fromDrinks ? '<p class="muted-note wt-drinks">Includes ' + fmtWater(fromDrinks) + ' from drinks in your diary</p>' : '') +
        (fromDrinks ? '<details class="wt-list"><summary>See which drinks</summary><div class="list">' + drinksList(d).map(function (x) { return '<div class="row"><div class="grow row-t">' + esc(x.name) + (x.est ? ' <span class="qs-v">a cup, estimated</span>' : '') + '</div><span class="row-v num">' + fmtWater(x.ml) + '</span></div>'; }).join('') + '</div></details>' : '') +
        '<div class="water-btns">' + state.settings.waterSizes.map(function (v, i) { return [v, ['Glass', 'Can', 'Bottle', 'Jug'][i]]; }).map(function (x) { return '<button type="button" class="btn soft" data-ml="' + x[0] + '"><b>+' + fmtWater(x[0]) + '</b><span>' + x[1] + '</span></button>'; }).join('') + '</div>' +
        '<div class="btn-row" style="margin-top:10px"><button type="button" class="btn soft" id="wtLess"' + (ml ? '' : ' disabled') + '>− 250 ml</button><button type="button" class="btn soft" id="wtGoal">Goal ' + fmtWater(goal) + '</button></div>' +
        (editing ? '<div class="label faint" style="margin:16px 0 8px">Your sizes</div><div class="four-in">' + state.settings.waterSizes.map(function (v, i) { return '<div class="field sfx"><input class="input" data-ws="' + i + '" inputmode="numeric" maxlength="4" value="' + v + '" aria-label="Size ' + (i + 1) + ' in ml" /><em>ml</em></div>'; }).join('') + '</div>' +
          '<div class="field sfx" style="margin-top:14px"><span>Daily goal</span><input class="input" id="wtG" inputmode="numeric" maxlength="5" value="' + goal + '" aria-label="Daily water goal in ml" /><em>ml</em></div><p class="form-error" id="wtErr" hidden></p>' +
          '<div class="btn-row">' + (state.settings.waterGoal ? '<button type="button" class="btn soft" id="wtAuto">Use suggested</button>' : '') + '<button type="button" class="btn primary" id="wtSave">Save goal</button></div>' : '') +
        '<div class="list wt-opt"><label class="row"><div class="grow"><div class="row-t">Count drinks from your diary</div><div class="row-s">Tea, coffee, juice, milk…, also inside meals and recipes</div></div><span class="switch"><input type="checkbox" id="wtDrinks"' + (state.settings.drinkWater !== false ? ' checked' : '') + ' /><i></i></span></label></div>' +
        '<p class="muted-note sv-src">Food has water too, so this is a rough guide.</p>';
      $$('[data-ml]', root).forEach(function (b) { b.addEventListener('click', function () { const prev = addWater(d, +b.dataset.ml); draw(root); toast('+' + fmtWater(+b.dataset.ml) + ' water', function () { state.water[d] = prev; if (!prev) delete state.water[d]; save(); renderDiary(); if (root.isConnected) draw(root); }); }); });
      $('#wtLess', root).addEventListener('click', function () { addWater(d, -250); draw(root); });
      if ($('#wtDrinks', root)) $('#wtDrinks', root).addEventListener('change', function () { state.settings.drinkWater = this.checked; save(); renderDiary(); buzz('light'); draw(root, editing); });
      $('#wtGoal', root).addEventListener('click', function () { draw(root, true); $('#wtG', root).focus(); });
      if (editing) {
        $('#wtSave', root).addEventListener('click', function () {
          const v = parseNum($('#wtG', root).value);
          if (isNaN(v) || v < 500 || v > 8000) { const x = $('#wtErr', root); x.textContent = 'Between 500 and 8,000 ml'; x.hidden = false; buzz('warn'); return; }
          const sz = $$('[data-ws]', root).map(function (x) { return parseNum(x.value); });
          if (sz.some(function (x) { return isNaN(x) || x < 50 || x > 3000; })) { const x = $('#wtErr', root); x.textContent = 'Sizes: 50 to 3,000 ml'; x.hidden = false; buzz('warn'); return; }
          state.settings.waterSizes = sz.map(Math.round);
          state.settings.waterGoal = Math.round(v); save(); renderDiary(); buzz('success'); draw(root);
        });
        if ($('#wtAuto', root)) $('#wtAuto', root).addEventListener('click', function () { state.settings.waterGoal = null; save(); renderDiary(); draw(root); });
      }
    };
    openSheet('<div id="wtRoot"></div>', function (body) { draw($('#wtRoot', body)); });
  }

