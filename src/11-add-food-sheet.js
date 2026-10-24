  // With `edit` (a logged item with a known food) it opens straight on that item's serving.
  function addFoodSheet(meal, date, edit, startFood, adjust, manage, startScan) {
    const d = date || viewDay;
    let ml = edit ? edit.meal : (meal || mealByTime()), added = 0, q = '', root = null, stopScan = null;
    let draft = null, pick = false; // recipe being edited; pick = choosing an ingredient for it
    const pickRepeat = !!(manage && manage.kind === 'repeat'); // choosing a food to repeat every day
    // While choosing a repeat item, every way of adding (quick adds, meals, several at once…) goes to the repeat setup instead of the diary.
    let repTaken = false;
    // A food for a repeat item, at your usual amount (or its normal serving); the amount can be changed in the setup.
    const repPickFood = function (f) {
      const lp = lastPortion(f.id, ml), us = unitsFor(f), u0 = lp && us.find(function (x) { return x.label === lp.unit; });
      const ds = u0 ? { qty: lp.qty, unit: u0 } : defaultServing(f), g = ds.qty * ds.unit.g, mm = macrosFor(f, g);
      addItems(d, [{ ref: f.id, g: Math.round(g * 10) / 10, qty: ds.qty, unit: ds.unit.label, kcal: Math.min(mm.kcal, 10000), protein: mm.protein, carbs: mm.carbs, fat: mm.fat, name: f.name.slice(0, 80), meal: ml }]);
    };
    const addItems = function (d2, its) {
      if (!pickRepeat) return addItemsReal(d2, its);
      if (repTaken || !its || !its.length) return; repTaken = true;
      const it = its[0]; closeSheet();
      setTimeout(function () { repeatSheet({ item: repItemCopy(it), meal: it.meal || ml, days: [] }); }, 300);
    };
    const leave = function () { if (stopScan) { stopScan(); stopScan = null; } };
    let replaceAt = null; // ingredient being swapped for another food
    let multi = false, picked = {}; // choosing several foods to add in one go
    let catSel = null; // browsing a category (fruit, meat…) on the All tab
    let sFilter = 'all', sLimit = 40, hlAlts = null, mealUseC = null; // search: type filter, how many to show, words to bold, this meal's foods
    let offRes = null; // packaged-food search results { q, list, err, busy }
    let scanTray = null; // products collected while scanning several
    let comparing = null; // { f, g }: the food you're comparing from
    let offT = null;
    function scheduleOff() { clearTimeout(offT); const qq = q.trim(), hit = offCacheGet(qq); if (hit) { offRes = { q: qq, list: hit.list }; if (Date.now() - hit.t < 864e5) return; } if (navigator.onLine === false) return; offT = setTimeout(offSearch, hit ? 50 : 450); }
    function offHtml() {
      if (offRes.busy) return '<p class="muted-note fd-empty">Searching packaged foods…</p>';
      if (offRes.err) return '<p class="muted-note fd-empty">' + offRes.err + '</p>';
      if (!offRes.list.length) return '<p class="muted-note fd-empty">No packaged foods found.</p>';
      return '<div class="label faint fd-sec">Packaged foods · Open Food Facts</div><div class="list">' + offRes.list.map(function (o, i) { const k = o.n.kcal; return '<button type="button" class="row fd-row" data-offr="' + i + '"><div class="grow"><div class="row-t">' + esc(o.name + (o.brand ? ' · ' + o.brand : '')) + '</div><div class="row-s">' + (k != null ? Math.round(k) + ' kcal per 100 g' : '') + (o.sv ? ' · serving ' + fmtQty(o.sv) + ' g' : '') + '</div></div></button>'; }).join('') + '</div>';
    }
    function offSearch() {
      const qq = q.trim(); if (qq.length < 2) return;
      const prev = offCacheGet(qq);
      const keep = prev ? prev.list : (offRes && offRes.q === qq ? offRes.list : []);
      offRes = { q: qq, list: keep, busy: !prev }; if (!prev) drawList();
      const FIELDS = 'code,product_name,product_name_en,product_name_ar,brands,serving_quantity,nutriments,countries_tags';
      const json = function (url) { const ctl = 'AbortController' in window ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 12000); return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { clearTimeout(to); if (!r.ok) throw new Error(r.status); return r.json(); }); };
      const toO = function (p) { const name = String(p.product_name || p.product_name_en || p.product_name_ar || '').trim().slice(0, 60), n = offNutrients(p.nutriments || {}), sv = Number(p.serving_quantity), br = Array.isArray(p.brands) ? p.brands[0] : String(p.brands || '').split(',')[0]; if (!name || n.kcal == null || !/^\d{8,14}$/.test(String(p.code || ''))) return null; return { id: 'o' + p.code, code: String(p.code), name: name, brand: String(br || '').trim().slice(0, 40), n: n, sv: isFinite(sv) && sv > 0 && sv < 2000 ? sv : null, eg: (p.countries_tags || []).indexOf('en:egypt') >= 0 }; };
      // Ask both Open Food Facts search services at once (either can be slow or down), plus a brand lookup
      // when the search names a brand, then merge. A brand typed in Arabic is searched by its usual name.
      const bq = brandQuery(qq), words = bq.split(' '), brand = Object.keys(BRANDS).find(function (b) { return (' ' + bq + ' ').indexOf(' ' + b + ' ') >= 0; }) || Object.keys(BRANDS).find(function (b) { return b.indexOf(' ') < 0 && words.some(function (w) { return w.length >= 4 && b.indexOf(w) === 0; }); });
      if (brand && words.indexOf(brand) < 0) words.forEach(function (w, i) { if (w.length >= 4 && brand.indexOf(w) === 0) words[i] = brand; });
      const sq = /[ء-ي]/.test(qq) && brand ? bq : qq;
      const soft = function (pr) { return pr.then(function (x) { return { ok: true, ps: x }; }, function () { return { ok: false, ps: [] }; }); };
      const jobs = [
        soft(json('https://search.openfoodfacts.org/search?q=' + encodeURIComponent(sq) + '&page_size=40&fields=' + FIELDS).then(function (d) { return d.hits || []; })),
        soft(json('https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(sq) + '&search_simple=1&action=process&json=1&page_size=30&fields=' + FIELDS).then(function (d) { return d.products || []; }))
      ];
      if (brand) jobs.push(soft(json('https://world.openfoodfacts.org/api/v2/search?brands_tags=' + encodeURIComponent(brand.replace(/'/g, '').replace(/ /g, '-')) + '&page_size=100&fields=' + FIELDS).then(function (d) { return d.products || []; })));
      Promise.all(jobs).then(function (rs) {
        if (!rs.some(function (r) { return r.ok; })) { if (offRes && offRes.q === qq) { offRes = { q: qq, list: keep, err: keep.length ? null : 'Couldn\'t reach packaged foods.' }; drawList(); } return; }
        // Keep products whose name/brand has every word you typed (beyond the brand), Egyptian ones first.
        const rest = words.filter(function (w) { return w && w !== brand; }), qt = rest.length ? queryToks(rest.join(' ')) : [];
        const seen = {}, all = [].concat.apply([], rs.map(function (r) { return r.ps; })).map(toO).filter(function (o) { if (!o || seen[o.code]) return false; seen[o.code] = 1; return true; });
        const fits = function (o) { const w = wordsOf(o.name + ' ' + o.brand + ' ' + (o.brand ? brandQuery(o.brand) : '')); return qt.every(function (a) { return matchTok(a, w); }); };
        const good = all.filter(fits), list = (good.length ? good : all).sort(function (a, b) { return (b.eg ? 1 : 0) - (a.eg ? 1 : 0); }).slice(0, 30).map(function (o) { delete o.eg; return o; });
        offCachePut(qq, list);
        if (offRes && offRes.q === qq) { offRes = { q: qq, list: list }; drawList(); }
      });
    }
    // Adjust: this entry's own copy of the recipe (its earlier adjustment, or the saved recipe).
    const adjustDraft = function () {
      const rc = edit.rc || state.recipes.find(function (x) { return x.id === edit.ref; }) || { servings: 1, cookedG: null, items: [] };
      return JSON.parse(JSON.stringify({ id: edit.ref, name: edit.name, servings: rc.servings, cookedG: rc.cookedG, items: rc.items }));
    };
    // manage: opened from You → My foods, so saving or going back returns there.
    const done = function () { closeSheet(); renderFoods(); };
    // Header: back, title, and which day/meal this goes to (tap the meal to change it).
    const head = function (title, back, right, noMeal) {
      const where = pick ? esc(pickMeal ? (mealDraft.name || 'Meal') : (draft.name || 'Recipe')) : manage ? 'My foods' : '<span id="afDay">' + esc(relDate(d)) + (added ? ' · ' + added + ' added' : '') + '</span>' + (noMeal ? '' : ' · <label class="meal-pick"><select id="afMealSel" aria-label="Meal">' + MEALS.map(function (m) { return '<option value="' + m[0] + '"' + (m[0] === ml ? ' selected' : '') + '>' + m[1] + '</option>'; }).join('') + '</select></label>');
      return '<div class="sheet-head">' + (back === 'x' ? '<button type="button" class="icon-btn back-btn" id="afBack" data-close aria-label="Close">' + BACK_IC + '</button>' : back ? '<button type="button" class="icon-btn back-btn" id="afBack" aria-label="Back">' + BACK + '</button>' : '') +
        '<div class="grow" style="min-width:0"><div class="label faint af-where">' + where + '</div><h2 class="sheet-title" id="sheetTitle">' + title + '</h2></div>' + (right || '') + '</div>';
    };
    const bindMeal = function (cb) { const sel = $('#afMealSel', root); if (sel) sel.addEventListener('change', function () { ml = sel.value; buzz('light'); if (cb) cb(); }); };
    const logged = function (label, snap) {
      if (pickRepeat) return;
      save(); renderAll(); buzz('success'); added++;
      toast(label, function () { restore(snap); added = Math.max(0, added - 1); refreshHead(); });
    };

    // ----- list: search, Recent, Favorites, My foods -----
    // Foods you usually have that fit what's left of the day (calories first, then protein, carbs and fat).
    function fitsLeft() {
      if (pick || d < todayISO()) return null;
      const pl = dayPlan(d); if (!pl) return null;
      const tt = dayTotals(d), rk = roundKcal(pl.target) - tt.kcal, rp = pl.protein - tt.protein, rc = pl.carbs - tt.carbs, rf = pl.fat - tt.fat;
      if (rk < 120) return null;
      const P = Math.max(0, rp) * 4, Cc = Math.max(0, rc) * 4, F = Math.max(0, rf) * 9, W = P + Cc + F || 1;
      const fu = foodUse(), cands = [], seen = {};
      fu.order.forEach(function (o) { if (seen[o.key]) return; seen[o.key] = 1; const it = o.item; if (it.ref && !getFood(it.ref)) return; cands.push({ key: o.key, o: o, ref: it.ref, name: it.name || 'Quick add', kcal: it.kcal, p: it.protein, c: it.carbs, f: it.fat, amt: it.ref ? fmtAmt(it.qty, it.unit) : 'Quick add', use: fu.use[o.key] || 1 }); });
      state.recipes.concat(state.myFoods).forEach(function (x) { if (seen[x.id]) return; const f = getFood(x.id); if (!f) return; const s0 = defaultServing(f), m = macrosFor(f, s0.qty * s0.unit.g); cands.push({ key: x.id, ref: x.id, name: f.name, kcal: m.kcal, p: m.protein, c: m.carbs, f: m.fat, amt: fmtAmt(s0.qty, s0.unit.label), use: 0 }); });
      const scored = cands.filter(function (c) { return c.kcal >= 40 && c.kcal <= rk * 1.1; }).map(function (c) {
        const fill = (P ? P / W * Math.min(c.p, rp) / rp : 0) + (Cc ? Cc / W * Math.min(c.c, rc) / rc : 0) + (F ? F / W * Math.min(c.f, rf) / rf : 0);
        const over = (Math.max(0, c.p - Math.max(0, rp)) * 4 + Math.max(0, c.c - Math.max(0, rc)) * 4 + Math.max(0, c.f - Math.max(0, rf)) * 9) / rk;
        return { c: c, s: fill - 1.5 * over + Math.min(c.use, 10) * 0.01 };
      }).filter(function (x) { return x.s > 0.05; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4).map(function (x) { return x.c; });
      return scored.length ? { items: scored, rk: rk, rp: Math.max(0, Math.round(rp)) } : null;
    }
    function showList() {
      leave();
      const tab = state.ui.foodTab;
      root.innerHTML = head(comparing ? 'Compare with' : pick ? (pickMeal ? 'Add to meal' : replaceAt != null ? 'Replace with' : 'Add ingredient') : pickRepeat ? 'Food to repeat' : 'Add food', pick || !!comparing, pick ? '' : '<button type="button" class="text-btn" id="afQuick" style="margin:0">Quick add</button>') +
        '<div class="seg af-tabs" id="afTabs">' + [['recent', 'All'], ['favs', 'Favorites'], ['mine', 'My foods']].map(function (t) { return '<button type="button" data-v="' + t[0] + '" aria-pressed="' + (t[0] === tab) + '">' + t[1] + '</button>'; }).join('') + '</div>' +
        '<div class="search-box">' + SEARCH_ICO + '<input id="afQ" type="search" placeholder="Search foods" aria-label="Search foods" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search" />' +
        (!pick && SpeechRec ? '<button type="button" class="scan-btn" id="afMic" aria-label="Say what you ate">' + MIC_IC + '</button>' : '') +
        (pick ? '' : '<button type="button" class="scan-btn af-sel" id="afSel" aria-pressed="' + multi + '" aria-label="Pick several">' + SEL_IC + '</button>') +
        '<button type="button" class="scan-btn" id="afScan" aria-label="Scan a barcode">' + SCAN_ICO + '</button></div>' +
        '<div class="af-bar af-sortbar" id="afBar" hidden></div>' +
        '<div id="afList"></div>' +
        (pick ? '' : '<div class="sheet-foot" id="afMulti" hidden><button type="button" class="btn primary block" id="afMGo">Add</button></div>');
      // The search bar stays pinned under the title while the tabs scroll away.
      const sbx = $('.search-box', root), shd = $('.sheet-head', root);
      if (sbx && shd) { sbx.classList.add('af-sticky'); sbx.style.top = shd.offsetHeight + 'px'; }
      const Q = $('#afQ', root);
      Q.value = q;
      if (comparing) $('#afBack', root).addEventListener('click', function () { const a = comparing; comparing = null; showServe(a.f); });
      else if (pick) $('#afBack', root).addEventListener('click', function () { pick = false; replaceAt = null; if (pickMeal) { pickMeal = false; showMealEdit(); } else showRecipe(); });
      else {
        bindMeal(function () { if (!q.trim() && state.ui.foodTab === 'recent') drawList(); syncMulti(); }); $('#afQuick', root).addEventListener('click', showQuick);
        $('#afSel', root).addEventListener('click', function () { setMulti(!multi); });
        $('#afMGo', root).addEventListener('click', addPicked);
      }
      $('#afScan', root).addEventListener('click', function () { buzz('light'); showScan(); });
      if ($('#afMic', root)) $('#afMic', root).addEventListener('click', function () {
        const btn = this, inp = $('#afQ', root);
        if (btn.classList.contains('on')) { try { rec && rec.stop(); } catch (e) {} return; }
        let rec; try { rec = new SpeechRec(); } catch (e) { toast('Voice isn\'t available here. Try the keyboard\'s mic.'); return; }
        rec.lang = /[ء-ي]/.test(inp.value) ? 'ar-EG' : (navigator.language || 'en-US'); rec.interimResults = true; rec.maxAlternatives = 1;
        btn.classList.add('on'); buzz('light'); inp.placeholder = 'Listening… e.g. "two eggs and a coffee"';
        rec.onresult = function (e) { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; inp.value = t; inp.dispatchEvent(new Event('input')); };
        rec.onerror = function (e) { if (e.error === 'not-allowed') toast('Allow the microphone to use voice'); };
        rec.onend = function () { btn.classList.remove('on'); inp.placeholder = 'Search foods'; if (inp.value.trim()) buzz('success'); };
        try { rec.start(); } catch (e) { btn.classList.remove('on'); }
      });
      // Tapping a tab while searching clears the search and shows that tab.
      $$('#afTabs button', root).forEach(function (b) { b.addEventListener('click', function () { state.ui.foodTab = b.dataset.v; save(); sFilter = 'all'; sLimit = 40; $$('#afTabs button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); buzz('light'); drawList(); }); });
      let t = null;
      Q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { q = Q.value; sFilter = 'all'; sLimit = 40; drawList(); }, 120); });
      Q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(t); q = Q.value; drawList(); const first = q.trim() && $('#afList [data-f], #afList [data-qr]', root); Q.blur(); if (first && !multi) first.click(); } });
      drawList();
      if (!edit && window.matchMedia('(hover: hover)').matches) Q.focus();
    }
    // Bold the words that match what you typed.
    function hlName(name) {
      if (!hlAlts || !hlAlts.length) return esc(name);
      return name.split(/(\s+|,\s*|\s·\s|\(|\))/).map(function (part) { const w = stem(normText(part)); return w && w.length >= 2 && hlAlts.some(function (a) { return w.indexOf(a) === 0; }) ? '<b>' + esc(part) + '</b>' : esc(part); }).join('');
    }
    function row(f, sub, okey) {
      // In Arabic, the Arabic name leads (the English name moves under it); searching in Arabic shows it beside the name.
      const arTitle = state.settings.lang === 'ar' && f.ar && (f.ar.indexOf(' ') > 0 || f.first.length < 2) ? f.ar : ''; // a one-word Arabic name would hide what the food is
      const ar = !arTitle && (hlAlts && /[ء-ي]/.test(q) || state.settings.lang === 'ar') ? arabicFor(f) : '';
      return '<button type="button" class="row fd-row" data-f="' + f.id + '"' + (okey ? ' data-o="' + esc(okey) + '"' : '') + '>' + ftIcon(ftKind(f)) + '<div class="grow"><div class="row-t" data-notr>' + (arTitle ? hlName(f.ar) : hlName(f.name)) + (isVerified(f) ? VER_IC : '') + (ar ? ' <span class="ar-hint">' + esc(ar) + '</span>' : '') + '</div><div class="row-s">' + esc(sub || (f.via ? f.via + ' · ' : '') + (arTitle && f.ar ? f.name.split(',').slice(0, 2).join(',') + ' · ' : '') + servingLine(f, ml)) + '</div></div>' + (isFav(f.id) ? '<span class="fd-star">' + STAR(true) + '</span>' : '') + '</button>';
    }
    function qRow(o) { return '<button type="button" class="row fd-row" data-qr="' + esc(o.key) + '" data-o="' + esc(o.key) + '">' + ftIcon('quick') + '<div class="grow"><div class="row-t">' + esc(o.item.name || 'Quick add') + '</div><div class="row-s">Quick add · ' + fmtKcal(o.item.kcal) + ' kcal</div></div><span class="fd-plus">+</span></button>'; }
    // Building a meal: your other saved meals can go into it too (their foods are added, like in Cronometer).
    function otherMeals() { return state.meals.filter(function (m) { return !mealDraft || m.id !== mealDraft.id; }); }
    function addMealInto(m) {
      const room = 40 - mealDraft.items.length, its = m.items.slice(0, Math.max(0, room)).map(function (it) { const c = JSON.parse(JSON.stringify(it)); delete c.id; delete c.meal; delete c.t; delete c.plan; return c; });
      mealDraft.items = mealDraft.items.concat(its);
      pick = false; pickMeal = false; buzz('success'); showMealEdit();
      toast(its.length < m.items.length ? 'A meal holds up to 40 foods' : 'Added ' + m.name);
    }
    function mealRow(m) { return '<button type="button" class="row fd-row" data-meal="' + m.id + '">' + ftIcon('meal') + '<div class="grow"><div class="row-t">' + esc(m.name) + '</div><div class="row-s">' + (m.via ? esc(m.via) + ' · ' : '') + 'Meal · ' + m.items.length + (m.items.length === 1 ? ' food' : ' foods') + ' · ' + fmtKcal(mealTotal(m.items)) + ' kcal</div></div></button>'; }
    function section(title, html) { return '<div class="label faint fd-sec">' + title + '</div><div class="list">' + html + '</div>'; }
    // Order a list of foods by your sort choice. key(x) → foodUse key, name(x) → name.
    function sorted(list, key, name, fu) {
      const srt = state.ui.sort, pos = {}, use = fu.allUse; fu.all.forEach(function (o, i) { pos[o.key] = i; });
      const out = list.slice();
      if (srt === 'az') out.sort(function (a, b) { return name(a).localeCompare(name(b)); });
      else if (srt === 'freq') out.sort(function (a, b) { return (use[key(b)] || 0) - (use[key(a)] || 0) || (pos[key(a)] != null ? pos[key(a)] : 1e9) - (pos[key(b)] != null ? pos[key(b)] : 1e9); });
      else if (srt === 'recent' && list.length && !list[0].key) out.sort(function (a, b) { return (pos[key(a)] != null ? pos[key(a)] : 1e9) - (pos[key(b)] != null ? pos[key(b)] : 1e9); });
      return out;
    }
    // "2 eggs, 150 g rice, a banana" → each food with its amount.
    const NUMW = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0.5, '½': 0.5, '¼': 0.25, 'واحد': 1, 'واحده': 1, 'اتنين': 2, 'تلاته': 3, 'تلاتة': 3, 'اربعه': 4, 'خمسه': 5, 'نص': 0.5, 'ربع': 0.25 };
  // Everyday and Egyptian measures: the food's own portion with that word if it has one, otherwise a typical weight.
  const MEASURES = [
    [/^(handfuls?|حفنه|حفنة)$/, ['handful'], 30], [/^(plates?|صحن|طبق)$/, ['plate', 'serving'], 300], [/^(bowls?|سلطانيه)$/, ['bowl', 'cup'], 250],
    [/^(glass(es)?|mugs?|كوبايه|كوباية|كوب|مج)$/, ['cup', 'glass', 'fl oz'], 240], [/^(cans?|علبه|علبة)$/, ['can', 'package'], 330], [/^(bottles?|ازازه|قزازه)$/, ['bottle'], 500],
    [/^(packs?|packets?|bags?|كيس)$/, ['package', 'packet', 'bag', 'serving'], 40], [/^(slices?|شريحه|شريحة)$/, ['slice'], 30], [/^(scoops?)$/, ['scoop'], 30],
    [/^(tbsp|tablespoons?|spoons?|معلقه|معلقة|ملعقه|ملعقة)$/, ['tbsp', 'tablespoon'], 15], [/^(tsp|teaspoons?)$/, ['tsp', 'teaspoon'], 5],
    [/^(loaf|loaves|رغيف|ارغفه)$/, ['loaf', 'pita', 'piece'], 90], [/^(pieces?|pcs?|حته|حتة|قطعه|قطعة)$/, ['piece', 'medium', 'serving'], null], [/^(sandwich(es)?|ساندوتش)$/, ['sandwich'], 200]
  ];
    // An amount typed with the food: "150 g chicken", "2 eggs", "نص رغيف", "chicken 150g". Returns [number, unit word, food words].
    function splitAmt(part) {
      part = String(part).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x660); }).trim();
      const m = /^(\d+(?:[.,]\d+)?|½|¼|a|an|one|two|three|four|five|six|half|واحد|واحده|اتنين|تلاته|تلاتة|اربعه|خمسه|نص|ربع)?\s*(g|gr|grams?|kg|ml|l|oz|cups?|tbsp|tablespoons?|tsp|teaspoons?|slices?|pieces?|pcs?|bowls?|scoops?|large|medium|small|handfuls?|plates?|glass(?:es)?|mugs?|cans?|bottles?|packs?|packets?|bags?|spoons?|loaf|loaves|sandwich(?:es)?|حفنه|حفنة|صحن|طبق|سلطانيه|كوبايه|كوباية|كوب|مج|علبه|علبة|ازازه|قزازه|كيس|شريحه|شريحة|معلقه|معلقة|ملعقه|ملعقة|رغيف|ارغفه|حته|حتة|قطعه|قطعة|ساندوتش)?\.?\s+(?:of\s+|من\s+)?(.+)$/i.exec(part);
      const e = !m || (!m[1] && !m[2]) ? /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(g|gr|grams?|kg|ml|l|oz|جرام|جم)$/i.exec(part) : null;
      if (e) return [parseFloat(e[2].replace(',', '.')), e[3].toLowerCase().replace(/^(جرام|جم)$/, 'g'), e[1]];
      if (!m) return [null, '', part];
      return [m[1] ? (NUMW[m[1].toLowerCase()] || parseFloat(m[1].replace(',', '.'))) : null, (m[2] || '').toLowerCase(), m[3]];
    }
    // That amount for one food, in one of its units (null when nothing was typed).
    function amountFor(f, n, uw) {
      if (n == null && !uw) return null;
      const units = unitsFor(f); let g = null, qty, unit;
      const gramsU = { g: 1, gr: 1, gram: 1, grams: 1, kg: 1000, ml: 1, l: 1000, oz: 28.3495 }[uw];
      if (gramsU && !f.noG) { g = (n || 1) * gramsU; unit = units.find(function (u) { return u.label === 'g'; }); qty = Math.round(g); }
      else if (uw) {
        const w = uw.replace(/s$/, '').replace(/^tablespoon$/, 'tbsp').replace(/^teaspoon$/, 'tsp').replace(/^pc$/, 'piece');
        let u = units.find(function (x) { return x.label.toLowerCase().indexOf(w) >= 0; });
        const ms = !u && MEASURES.find(function (x) { return x[0].test(uw); });
        if (ms) { u = units.find(function (x) { return ms[1].some(function (k) { return x.label.toLowerCase().indexOf(k) >= 0; }); }); if (!u && ms[2] && !f.noG) { g = (n || 1) * ms[2]; unit = units.find(function (x) { return x.label === 'g'; }); qty = Math.round(g); } }
        if (u) { unit = u; qty = n || 1; g = qty * u.g; }
      }
      // A count ("2 eggs", "a banana"): a whole-item size like medium or large, not cups or spoons.
      const each = function () { const c = units.filter(function (x) { return x.label !== 'g' && x.label !== 'oz'; }); return c.find(function (x) { return /\bmedium\b/i.test(x.label); }) || c.find(function (x) { return /\b(large|small|whole|piece|item|fruit|each|slice|egg|bar|patty|loaf|serving)\b/i.test(x.label); }) || c.find(function (x) { return !/cup|tbsp|tsp|tablespoon|teaspoon|oz|ml|chopped|sliced|mashed|diced/i.test(x.label); }) || c[0]; };
      if (g == null && n != null) { const u = each(); if (u && n <= 20) { unit = u; qty = n; g = n * u.g; } else if (!f.noG) { unit = units.find(function (x) { return x.label === 'g'; }); qty = n; g = n; } }
      return g == null ? null : { g: g, qty: qty, unit: unit };
    }
    function parseMeal(text, lines) {
      const parts = (lines ? text.split(/\n+/) : text.split(/\s*(?:,|;|\+|\n|\band\b|\bwith\b| و )\s*/i)).map(function (x) { return x.trim(); }).filter(Boolean);
      if (!lines && parts.length < 2 && !/^\s*(\d|½|¼)/.test(text)) return null;
      const fu = foodUse();
      const out = parts.map(function (part) {
        const sa = splitAmt(part), n = sa[0], uw = sa[1], name = sa[2];
        const f = searchFoods(name, fu.use, { noRecipes: !!lines })[0]; if (!f) return { part: part };
        const units = unitsFor(f), am = amountFor(f, n, uw); let g = am ? am.g : null, qty = am ? am.qty : null, unit = am ? am.unit : null;
        if (g == null) { const lp = lastPortion(f.id, ml), lu = lp && units.find(function (u) { return u.label === lp.unit; }); if (lu) { unit = lu; qty = lp.qty; g = lp.qty * lu.g; } else { const s0 = defaultServing(f); unit = units.find(function (u) { return u.label === s0.unit.label; }) || s0.unit; qty = s0.qty; g = s0.qty * s0.unit.g; } }
        const mm = macrosFor(f, g);
        return { part: part, f: f, g: Math.round(g * 10) / 10, qty: Math.round(qty * 1000) / 1000, unit: unit.label, m: mm };
      });
      return out.length && out.some(function (x) { return x.f; }) ? out : null;
    }
    function drawList() {
      const box = $('#afList', root); if (!box) return;
      const searching = q.trim().length > 0;
      hlAlts = null;
      $('#afTabs', root).classList.toggle('searching', searching);
      const ph = state.ui.foodTab === 'mine' ? 'Search my foods' : state.ui.foodTab === 'favs' ? 'Search favorites' : 'Search foods', qi = $('#afQ', root);
      if (qi && qi.dataset.ph !== ph) { qi.dataset.ph = ph; qi.placeholder = ph; qi.setAttribute('aria-label', ph); if (typeof tr === 'function' && state.settings.lang === 'ar') { qi.placeholder = tr(ph); qi.setAttribute('aria-label', tr(ph)); } }
      const needDB = !foodDB;
      if (needDB && !coreDB) loadCoreFoods().then(function (db) { if (db && !foodDB && $('#afList', root)) drawList(); });
      if (needDB) loadFoods().then(function () { if ($('#afList', root)) drawList(); }, function () { const b = $('#afList', root); if (b && !foodDB) b.innerHTML = '<p class="muted-note fd-empty">Couldn\'t load the food list. Check your connection and try again. Quick add and My foods still work.</p>'; });
      const fu = foodUse();
      let html = '';
      const scope = state.ui.foodTab === 'mine' || state.ui.foodTab === 'favs' ? state.ui.foodTab : null;
      if (searching && scope) {
        // Searching inside Favorites or My foods only looks at what's there.
        const qw = queryToks(q), hit = function (name) { const w = wordsOf(name || ''); return qw.every(function (a) { return matchTok(a, w) || a.some(function (t) { return fuzzyTok(t, w); }); }); };
        hlAlts = []; qw.forEach(function (a) { a.forEach(function (x) { if (x.length >= 2) hlAlts.push(x); }); });
        let mealsHit = [], foods = [];
        if (scope === 'mine') {
          mealsHit = (pick ? (pickMeal ? otherMeals() : []) : state.meals).filter(function (m) { return hit(m.name); });
          foods = (pick && !pickMeal ? [] : state.recipes.map(recipeFood).filter(Boolean)).concat(state.myFoods.map(customFood)).filter(function (f) { return hit(f.name); });
        } else foods = state.favs.map(getFood).filter(function (f) { return f && !(pick && !pickMeal && f.recipe) && hit(f.name); });
        html = mealsHit.length || foods.length ? '<div class="list">' + mealsHit.map(mealRow).join('') + foods.map(function (f) { return row(f); }).join('') + '</div>'
          : (needDB && scope === 'favs' && state.favs.length ? skel(3) : '<p class="muted-note fd-empty">Nothing in ' + (scope === 'mine' ? 'My foods' : 'Favorites') + ' matches. <button type="button" class="text-btn" data-scope-all>Search all foods</button></p>');
        if (scope === 'mine') html += '<button type="button" class="text-btn fd-create" data-new-food>Create “' + esc(q.trim().slice(0, 30)) + '” as a food</button>';
      } else if (searching) {
        const pm = !pick && foodDB ? parseMeal(q) : null;
        if (pm) {
          const ok = pm.filter(function (x) { return x.f; });
          html += '<div class="card pm-card"><div class="label faint">Add all at once</div>' + pm.map(function (x) { return '<div class="pm-row' + (x.f ? '' : ' miss') + '"><span class="grow"><b>' + esc(x.part) + '</b>' + (x.f ? '<small>' + esc(x.f.name) + ' · ' + fmtAmt(x.qty, x.unit) + '</small>' : '<small>No match</small>') + '</span>' + (x.f ? '<span class="num">' + fmtKcal(x.m.kcal) + '</span>' : '') + '</div>'; }).join('') +
            '<button type="button" class="btn primary block" id="pmGo">Add ' + ok.length + ' to ' + mealName(ml) + ' · ' + fmtKcal(ok.reduce(function (a, x) { return a + x.m.kcal; }, 0)) + ' kcal</button></div>';
        }
        const digits = q.replace(/\s/g, '');
        if (/^\d{8,14}$/.test(digits)) html += '<button type="button" class="btn soft block" data-code="' + digits + '" style="margin-bottom:12px">Look up barcode ' + digits + '</button>';
        const rec = {}; fu.order.forEach(function (o, i) { if (o.item.ref && rec[o.item.ref] == null) rec[o.item.ref] = i; });
        if (!mealUseC || mealUseC.ml !== ml) { const mu = {}, from = dayNum(todayISO()) - 90; Object.keys(state.food).forEach(function (dt) { if (dayNum(dt) >= from) state.food[dt].forEach(function (it) { if (it.ref && it.meal === ml && !it.plan) mu[it.ref] = (mu[it.ref] || 0) + 1; }); }); mealUseC = { ml: ml, m: mu }; }
        const intent = foodDB ? intentOf(q) : null;
        let all = intent && !intent.rest ? intentFoods(intent.it, intent.snack, intent.bf) : searchFoods(intent ? intent.rest : q, fu.use, { noRecipes: pick && !pickMeal, recent: rec, mem: qMemFor(q), mealUse: mealUseC.m, limit: 160 });
        if (intent && intent.rest) all = all.filter(function (f) { return intentScore(f, intent.it) != null; }).sort(function (a, b) { return (intentScore(a, intent.it) - intentScore(b, intent.it)) * intent.it.dir; });
        if (intent) html += '<p class="muted-note intent-note">' + intent.it.label + (intent.rest ? ' · ' + esc(intent.rest) : '') + '</p>';
        const qw = queryToks(intent ? intent.rest || 'zzzz' : q);
        hlAlts = []; qw.forEach(function (a) { a.forEach(function (x) { if (x.length >= 2) hlAlts.push(x); }); });
        const kind = function (f) { const t = ftType(f); return f.custom || f.recipe ? 'mine' : t === 'pack' ? 'pack' : t === 'rest' || f.cat === 'Egyptian dishes' || f.cat === 'Dishes (estimate)' || /Meals, Entrees|Mixed Dishes|Sandwiches|Pizza|Burgers|Soups|Fast Foods|Restaurant/i.test(f.cat || '') ? 'dish' : 'food'; };
        const counts = { all: all.length, food: 0, dish: 0, pack: 0, mine: 0, ver: 0 }; all.forEach(function (f) { counts[kind(f)]++; if (isVerified(f)) counts.ver++; });
        const vOnly = state.ui.sver && !pick;
        const filtered = (sFilter === 'all' ? all : all.filter(function (f) { return kind(f) === sFilter; })).filter(function (f) { return !vOnly || isVerified(f); });
        const res = filtered.slice(0, sLimit);
        if (!pick && all.length > 6) html += '<div class="sf-chips" role="group" aria-label="Filter results"><button type="button" class="sf-ver" data-sver aria-pressed="' + !!state.ui.sver + '">' + VER_IC + 'Verified</button>' + [['all', 'All'], ['food', 'Foods'], ['dish', 'Dishes'], ['pack', 'Packaged'], ['mine', 'Mine']].filter(function (x) { return x[0] === 'all' || counts[x[0]]; }).map(function (x) { return '<button type="button" data-sf="' + x[0] + '" aria-pressed="' + (sFilter === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>';
        const dym = all.length < 4 ? didYouMean(q) : '';
        if (dym && normText(dym) !== normText(q)) html += '<button type="button" class="text-btn dym" data-dym="' + esc(dym) + '">Did you mean <b>' + esc(dym) + '</b>?</button>';
        const kq = /^\s*(\d{2,4})\s*(kcal|cal|calories|سعره?)?\s*$/i.exec(q);
        if (kq && !pick && +kq[1] >= 10 && +kq[1] <= 5000) html += '<button type="button" class="btn soft block" data-qk="' + kq[1] + '" style="margin-bottom:12px">Quick add ' + fmtKcal(+kq[1]) + ' kcal</button>';
        // Your own quick adds match too, so things you typed in by hand come back.
        const quick = pick ? [] : fu.order.filter(function (o) { return !o.item.ref && o.item.name && qw.every(function (a) { return matchTok(a, wordsOf(o.item.name)); }); }).slice(0, 4);
        const meals = (pick ? (pickMeal ? otherMeals() : []) : state.meals).filter(function (m) { const w = wordsOf(m.name); if (qw.every(function (a) { return matchTok(a, w); })) { m.via = ''; return true; } const hit = m.items.find(function (it) { const iw = wordsOf(it.name || ''); return qw.every(function (a) { return matchTok(a, iw); }); }); m.via = hit ? 'Contains ' + (hit.name || '').split(',')[0] : ''; return !!hit; });
        // Packaged foods (Open Food Facts) join the same list once they arrive.
        const qq = q.trim(), have = {}; res.forEach(function (f) { have[f.id] = 1; if (f.id.indexOf('ub') === 0) have['o' + f.id.slice(2)] = 1; });
        if (qq.length >= 3 && !pick && (!offRes || offRes.q !== qq)) { scheduleOff(); if ((!offRes || offRes.q !== qq)) { const cm = offCachedMatches(qq); if (cm.length) offRes = { q: qq, list: cm, busy: true }; } }
        const offRows = offRes && offRes.q === qq && offRes.list ? offRes.list.filter(function (o) { return !have[o.id]; }).slice(0, 10).map(function (o, i) { const k = o.n.kcal; return '<button type="button" class="row fd-row" data-offr="' + offRes.list.indexOf(o) + '"><div class="grow"><div class="row-t">' + esc(o.name) + '</div><div class="row-s">Packaged' + (o.brand ? ' · ' + esc(o.brand) : '') + (k != null ? ' · ' + Math.round(k) + ' kcal / 100 g' : '') + '</div></div></button>'; }) : [];
        const offWait = offRes && offRes.q === qq && offRes.busy && !offRows.length;
        const offErr = offRes && offRes.q === qq && offRes.err;
        const pls = pick ? [] : placeMatches(q);
        if (pls.length) html += '<div class="list mn-places">' + pls.map(function (p) { return '<button type="button" class="row fd-row" data-menu="' + esc(p.name) + '">' + ftIcon('rest') + '<div class="grow"><div class="row-t">' + esc(p.name) + ' menu</div><div class="row-s">' + p.items.length + ' items · pick several at once</div></div>' + CHEV + '</button>'; }).join('') + '</div>';
        if (meals.length || res.length || quick.length || offRows.length) html += '<div class="list">' + meals.map(mealRow).join('') + quick.map(function (o) { return qRow(o); }).join('') + res.map(function (f) { return row(f); }).join('') + ((sFilter === 'all' || sFilter === 'pack') && !vOnly ? offRows.join('') : '') + '</div>' + (filtered.length > sLimit ? '<button type="button" class="text-btn fd-create" data-more-res>Show ' + Math.min(40, filtered.length - sLimit) + ' more</button>' : '') + (offWait ? '<p class="muted-note off-wait">Looking for packaged foods…</p>' : offErr ? '<button type="button" class="text-btn fd-create" data-off-retry>' + offErr + ' Try again</button>' : '');
        else if (needDB || offWait) html += offWait ? '<p class="muted-note fd-empty">Looking for packaged foods…</p>' : skel(5);
        else html += '<p class="muted-note fd-empty">No matches. Try fewer or simpler words, or Arabic.</p>' + (offErr ? '<button type="button" class="text-btn fd-create" data-off-retry>' + offErr + ' Try again</button>' : '');
        html += '<button type="button" class="text-btn fd-create" data-new-food>Create “' + esc(q.trim().slice(0, 30)) + '” as a food</button>';
      } else if (state.ui.foodTab === 'mine') {
        const mfNew = '<div class="mf-actions mf-bottom' + (pick ? ' one' : '') + '"><button type="button" class="mf-card" data-new-food><span class="mf-ico">+</span><b>New food</b><small>From a label or your own numbers</small></button>' +
          (pick ? '' : '<button type="button" class="mf-card" data-new-recipe><span class="mf-ico">+</span><b>New recipe</b><small>Built from ingredients</small></button><button type="button" class="mf-card" data-new-meal><span class="mf-ico">+</span><b>New meal</b><small>Foods you eat together</small></button>') + '</div>';
        html = '';
        const byName = function (a, b) { return a.name.localeCompare(b.name); };
        const mList = pick ? (pickMeal ? otherMeals() : []) : state.meals;
        if (mList.length) html += section('Meals', sorted(mList.slice().sort(byName), function (m) { return 'm:' + m.id; }, function (m) { return m.name; }, fu).map(mealRow).join(''));
        const rcs = pick && !pickMeal ? [] : state.recipes.slice().sort(byName).map(recipeFood).filter(Boolean);
        const kf = function (f) { return f.id; }, nf = function (f) { return f.name; };
        if (rcs.length) html += section('Recipes', sorted(rcs, kf, nf, fu).map(function (f) { return row(f); }).join(''));
        if (state.myFoods.length) html += section('Foods', sorted(state.myFoods.map(customFood), kf, nf, fu).map(function (f) { return row(f); }).join(''));
        if (!state.myFoods.length && !state.recipes.length && !state.meals.length) html += '<p class="muted-note fd-empty">Create foods and recipes here. To save a whole meal, tap ⋯ next to it in the diary.</p>';
        html += mfNew;
        if (!pick && (state.myFoods.length || state.recipes.length || state.meals.length)) html += '<button type="button" class="text-btn fd-create" data-manage>Edit or delete in You → My foods</button>';
      } else if (state.ui.foodTab === 'favs') {
        const fs = sorted(state.favs.map(getFood).filter(function (f) { return f && !(pick && !pickMeal && f.recipe); }), function (f) { return f.id; }, function (f) { return f.name; }, fu);
        if (fs.length) html = '<div class="list">' + fs.map(function (f) { return row(f); }).join('') + '</div>';
        else html = needDB && state.favs.length ? skel(4) : emptyState(STAR(false), 'No favorites yet', 'Tap the star on a food to keep it here.');
      } else {
        const rows = [], usual = [];
        // Foods you often have at this meal come first.
        if (!pick) {
          const cnt = {}, from = dayNum(todayISO()) - 30;
          Object.keys(state.food).forEach(function (dt) { if (dayNum(dt) >= from) state.food[dt].forEach(function (it) { if (it.meal === ml) { const k = it.ref || ('q|' + it.name + '|' + it.kcal + '|' + it.protein + '|' + it.carbs + '|' + it.fat); cnt[k] = (cnt[k] || 0) + 1; } }); });
          fu.order.filter(function (o) { return cnt[o.key] >= 2; }).sort(function (a, b) { return cnt[b.key] - cnt[a.key]; }).slice(0, 5).forEach(function (o) { usual.push(o.key); });
        }
        const rowFor = function (o) {
          const it = o.item;
          if (it.ref) {
            const f = getFood(it.ref); if (!f || (pick && !pickMeal && f.recipe)) return '';
            const lp = !pick && lastPortion(it.ref, ml), same = !lp || (lp.qty === it.qty && lp.unit === it.unit); // the amount you have at this meal
            return row(f, same ? fmtAmt(it.qty, it.unit) + ' · ' + fmtKcal(it.kcal) + ' kcal' : fmtAmt(lp.qty, lp.unit) + ' · ' + fmtKcal(macrosFor(f, lp.g).kcal) + ' kcal', o.key);
          }
          return pick ? '' : qRow(o);
        };
        usual.length = 0; // the Diary's "Your usual" covers this
        const usualRows = usual.map(function (k) { return rowFor(fu.order.find(function (o) { return o.key === k; })); }).filter(Boolean);
        const mealOfKey = function (k) { return k.indexOf('m:') === 0 ? state.meals.find(function (m) { return 'm:' + m.id === k; }) : null; };
        const pool = pick ? fu.order : fu.all.filter(function (o) { return o.key.indexOf('m:') !== 0 || mealOfKey(o.key); });
        const srt = state.ui.sort, ord = srt === 'recent' ? pool : sorted(pool, function (o) { return o.key; }, function (o) { const sm = mealOfKey(o.key); if (sm) return sm.name; const f = o.item.ref && getFood(o.item.ref); return f ? f.name : o.item.name || ''; }, fu);
        if (srt !== 'recent') usual.length = 0; // "usual for this meal" only with Latest
        ord.forEach(function (o) {
          if (rows.length >= (srt === 'recent' ? 30 : 60) || usual.indexOf(o.key) >= 0) return;
          const it = o.item, sm = mealOfKey(o.key);
          if (sm) { rows.push(mealRow(sm)); return; }
          if (it.ref) { const f = getFood(it.ref); if (f && !(pick && !pickMeal && f.recipe)) rows.push(row(f, null, o.key)); }
          else if (!pick) rows.push(qRow(o));
        });
        const fit = null; // "Fill what's left" removed
        const fitHtml = fit ? '<div class="label faint fd-sec fit-sec">Fill what\'s left · ' + fmtKcal(fit.rk) + ' kcal' + (fit.rp ? ', ' + fit.rp + ' g protein' : '') + '</div><div class="list fit-list">' + fit.items.map(function (c) {
          const sub = c.amt + ' · ' + fmtKcal(c.kcal) + ' kcal · ' + c.p + ' g protein';
          return c.ref ? '<button type="button" class="row fd-row" data-f="' + c.ref + '"' + (c.o ? ' data-o="' + esc(c.key) + '"' : '') + ' data-fit="' + esc(c.key) + '">' + (getFood(c.ref) ? ftIcon(ftKind(getFood(c.ref))) : '') + '<div class="grow"><div class="row-t">' + esc(c.name) + '</div><div class="row-s">' + esc(sub) + '</div></div></button>'
            : '<button type="button" class="row fd-row" data-qr="' + esc(c.key) + '" data-o="' + esc(c.key) + '">' + ftIcon('quick') + '<div class="grow"><div class="row-t">' + esc(c.name) + '</div><div class="row-s">' + esc(sub) + '</div></div><span class="fd-plus">+</span></button>';
        }).join('') + '</div>' : '';
        const pinRows = pick ? [] : state.ui.pins.map(function (k) { const o = fu.order.find(function (x) { return x.key === k; }); if (o) return rowFor(o); const f = REF_RE.test(k) && getFood(k); return f ? row(f, null, null).replace('data-f="', 'data-pin="1" data-f="') : ''; }).filter(Boolean);
        const pinSet = {}; state.ui.pins.forEach(function (k) { pinSet[k] = 1; });
        for (let i = rows.length - 1; i >= 0; i--) { const m = /data-o="([^"]+)"/.exec(rows[i]); if (m && pinSet[m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"')]) rows.splice(i, 1); }
        const pinHtml = pinRows.length ? section('Pinned', pinRows.join('')) : '';
        const hidNote = !pick && state.ui.hide.length ? '<button type="button" class="text-btn hid-note" data-unhide>Show ' + state.ui.hide.length + ' hidden ' + (state.ui.hide.length === 1 ? 'food' : 'foods') + '</button>' : '';
        // Every list gets a header; the sort menu sits on the Recent header.
        const recentSec = function (rowsHtml) { return (pinHtml ? '<div class="label faint fd-sec">Recent</div>' : '') + '<div class="list">' + rowsHtml + '</div>'; };
        if (usualRows.length >= 2) html = pinHtml + section('Usual for ' + mealName(ml), usualRows.join('')) + (rows.length ? recentSec(rows.join('')) : '') + hidNote + fitHtml;
        else if (pinHtml) html = pinHtml + (rows.length || usualRows.length ? recentSec(usualRows.concat(rows).join('')) : '') + hidNote + fitHtml;
        else html = (rows.length || usualRows.length ? recentSec(usualRows.concat(rows).join('')) + hidNote : needDB && fu.order.length ? '<p class="muted-note fd-empty">Loading…</p>' : '') + fitHtml;
        // Adding to a meal: your other meals come first, so one can go in whole.
        if (pickMeal && otherMeals().length) html = section('Meals', otherMeals().slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(mealRow).join('')) + html;
        // Not much here yet: three ways to add something.
        if (!pick && rows.length + usualRows.length + pinRows.length < 6 && !(needDB && fu.order.length)) html += '<div class="af-hint' + (rows.length + usualRows.length + pinRows.length ? '' : ' fd-empty') + '">' +
          '<div><span>' + MF_IC.hi + '</span><b>Search</b><small>Type a food, or "2 eggs"</small></div>' +
          '<div><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7V5h3M17 5h3v2M20 17v2h-3M7 19H4v-2M8 9v6M11 9v6M14 9v6M17 9v6"/></svg></span><b>Scan</b><small>A barcode or a label</small></div>' +
          '<div><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg></span><b>Say it</b><small>Tap the mic and talk</small></div></div>';
      }
      const bar = $('#afBar', root), showSort = !searching && !catSel && html.indexOf('fd-empty') < 0;
      if (bar) { bar.hidden = !showSort; bar.innerHTML = showSort ? '<label class="sort-pick">' + ({ recent: 'Latest', freq: 'Most frequent', az: 'A–Z' })[state.ui.sort] + CHEV + '<select id="afSort" aria-label="Sort"><option value="recent">Latest</option><option value="freq">Most frequent</option><option value="az">A–Z</option></select></label>' : ''; }
      html = html.replace('<div class="fd-sec-row sort-head"><!--SORT--></div>', '');
      box.innerHTML = html;
      if (bar && $('#afSort', bar)) { $('#afSort', bar).value = state.ui.sort; $('#afSort', bar).addEventListener('change', function () { state.ui.sort = this.value; save(); buzz('light'); drawList(); }); }
      box.classList.toggle('multi', multi);
      if (multi) {
        $$('[data-meal]', box).forEach(function (b) { b.disabled = true; });
        $$('[data-f], [data-qr]', box).forEach(function (b) {
          const k = b.dataset.o || 'f:' + b.dataset.f;
          b.setAttribute('aria-pressed', !!picked[k]);
          b.insertAdjacentHTML('afterbegin', '<span class="pk-box" aria-hidden="true">' + (picked[k] ? '✓' : '') + '</span>');
          b.addEventListener('click', function (e) {
            e.stopImmediatePropagation();
            if (picked[k]) delete picked[k]; else picked[k] = { o: b.dataset.o || null, f: b.dataset.f || null };
            b.setAttribute('aria-pressed', !!picked[k]); b.querySelector('.pk-box').textContent = picked[k] ? '✓' : ''; buzz('light'); syncMulti();
          });
        });
      }
      if (!pick && !multi) $$('[data-f], [data-qr]', box).forEach(function (b) {
        let tm = null, x0 = 0, y0 = 0;
        b.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; tm = setTimeout(function () { tm = null; buzz('medium'); const stop = function (ev) { if (ev.target.closest('.pop-menu')) return; ev.stopPropagation(); ev.preventDefault(); }; document.addEventListener('click', stop, true); setTimeout(function () { document.removeEventListener('click', stop, true); }, 400); rowMenu(b); }, 500); });
        b.addEventListener('pointermove', function (e) { if (tm && (Math.abs(e.clientX - x0) > 8 || Math.abs(e.clientY - y0) > 8)) { clearTimeout(tm); tm = null; } });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, function () { clearTimeout(tm); tm = null; }); });
      });
      $$('[data-f]', box).forEach(function (b) { b.addEventListener('click', function () {
        const f = getFood(b.dataset.f); if (!f) return; buzz('light');
        if (comparing) { showCompare(comparing, f); return; }
        if (pickRepeat) { repPickFood(f); return; }
        if (q.trim()) { qRemember(q, f.id); const h = q.trim().slice(0, 30); state.ui.qhist = [h].concat(state.ui.qhist.filter(function (x) { return x.toLowerCase() !== h.toLowerCase(); })).slice(0, 8); }
        const o = b.dataset.fit && b.dataset.o && fu.order.find(function (x) { return x.key === b.dataset.o; });
        // An amount typed in the search ("150 g", "2", "a cup") is filled in for you.
        const sa = !o && q.trim() && q.indexOf(',') < 0 ? splitAmt(q.trim()) : null, am = sa && amountFor(f, sa[0], sa[1]);
        showServe(f, null, o ? { qty: o.item.qty, unit: o.item.unit, g: o.item.g } : am ? { qty: am.qty, unit: am.unit.label, g: am.g } : null);
      }); });
      $$('[data-meal]', box).forEach(function (b) { b.addEventListener('click', function () { const m = state.meals.find(function (x) { return x.id === b.dataset.meal; }); if (m) { if (pickMeal) return addMealInto(m); buzz('light'); if (pickRepeat) addItems(d, [mealEntry(m, ml)]); else showMeal(m); } }); });
      $$('[data-unhide]', box).forEach(function (b) { b.addEventListener('click', function () { state.ui.hide = []; save(); buzz('light'); drawList(); }); });
      $$('[data-sver]', box).forEach(function (b) { b.addEventListener('click', function () { state.ui.sver = !state.ui.sver; save(); sLimit = 40; buzz('light'); drawList(); }); });
      $$('[data-scope-all]', box).forEach(function (b) { b.addEventListener('click', function () { state.ui.foodTab = 'recent'; save(); $$('#afTabs button', root).forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === 'recent'); }); buzz('light'); drawList(); }); });
      $$('[data-sf]', box).forEach(function (b) { b.addEventListener('click', function () { sFilter = b.dataset.sf; sLimit = 40; buzz('light'); drawList(); }); });
      $$('[data-more-res]', box).forEach(function (b) { b.addEventListener('click', function () { sLimit += 40; buzz('light'); drawList(); }); });
      $$('[data-dym]', box).forEach(function (b) { b.addEventListener('click', function () { q = b.dataset.dym; const i = $('#afQ', root); if (i) i.value = q; buzz('light'); drawList(); }); });
      $$('[data-qh]', box).forEach(function (b) { b.addEventListener('click', function () {
        q = b.dataset.qh; const i = $('#afQ', root); if (i) i.value = q; buzz('light');
        const mem = qMemFor(q), top = Object.keys(mem).sort(function (a, c) { return mem[c] - mem[a]; })[0], f = top && getFood(top);
        if (f) showServe(f); else drawList();
      }); });
      $$('[data-cat]', box).forEach(function (b) { b.addEventListener('click', function () { catSel = b.dataset.cat; buzz('light'); drawList(); const sh = box.closest('.sheet'); if (sh) sh.scrollTop = 0; }); });
      $$('[data-cat-x]', box).forEach(function (b) { b.addEventListener('click', function () { catSel = null; buzz('light'); drawList(); }); });
      $$('[data-qh-clear]', box).forEach(function (b) { b.addEventListener('click', function () { state.ui.qhist = []; save(); buzz('light'); drawList(); }); });
      $$('[data-qk]', box).forEach(function (b) { b.addEventListener('click', function () { const snap = snapshot(); addItems(d, [{ id: newId(), name: 'Quick add', kcal: +b.dataset.qk, protein: 0, carbs: 0, fat: 0, meal: ml }]); logged('Added to ' + mealName(ml), snap); q = ''; const i = $('#afQ', root); if (i) i.value = ''; drawList(); }); });
      $$('[data-menu]', box).forEach(function (b) { b.addEventListener('click', function () { const p = places().find(function (x) { return x.name === b.dataset.menu; }); if (p) { buzz('light'); showMenu(p); } }); });
      $$('[data-off-retry]', box).forEach(function (b) { b.addEventListener('click', function () { buzz('light'); offSearch(); }); });
      $$('[data-new-food]', box).forEach(function (b) { b.addEventListener('click', function () { showCreate(null, q.trim()); }); });
      $$('[data-manage]', box).forEach(function (b) { b.addEventListener('click', function () { closeSheet(); showTab('foods'); }); });
      $$('[data-new-meal]', box).forEach(function (b) { b.addEventListener('click', function () { buzz('light'); showMealEdit({ id: null, name: '', items: [] }); }); });
      $$('[data-new-recipe]', box).forEach(function (b) { b.addEventListener('click', function () { draft = { name: q.trim().slice(0, 60), servings: 1, cookedG: null, items: [] }; showRecipe(); }); });
      $$('[data-code]', box).forEach(function (b) { b.addEventListener('click', function () { showScan(b.dataset.code); }); });
      if ($('#pmGo', box)) $('#pmGo', box).addEventListener('click', function () {
        const its = (parseMeal(q) || []).filter(function (x) { return x.f; }); if (!its.length) return;
        const snap = snapshot();
        addItems(d, its.map(function (x) { return { id: newId(), ref: x.f.id, g: x.g, qty: x.qty, unit: x.unit, kcal: Math.min(x.m.kcal, 10000), protein: x.m.protein, carbs: x.m.carbs, fat: x.m.fat, name: x.f.name.slice(0, 80), meal: ml }; }));
        added += its.length - 1; logged('Added ' + its.length + ' to ' + mealName(ml), snap); q = ''; closeSheet();
      });
      $$('[data-offr]', box).forEach(function (b) { b.addEventListener('click', function () {
        const o = offRes.list[+b.dataset.offr]; if (!o) return;
        state.offFoods = [o].concat(state.offFoods.filter(function (x) { return x.code !== o.code; })).slice(0, 300); save(); buzz('light'); if (pickRepeat) repPickFood(offFood(o)); else showServe(offFood(o));
      }); });
      $$('[data-qr]', box).forEach(function (b) {
        b.addEventListener('click', function () {
          const o = fu.order.find(function (x) { return x.key === b.dataset.qr; }); if (!o) return;
          const it = o.item, snap = snapshot();
          addItems(d, [{ id: newId(), kcal: it.kcal, protein: it.protein, carbs: it.carbs, fat: it.fat, name: it.name, meal: ml }]);
          logged('Added to ' + mealName(ml), snap); refreshHead();
        });
      });
    }
    // Hold a food: pin it to the top of Recent, or hide it from Recent (it stays everywhere else).
    function rowMenu(b) {
      const k = b.dataset.o || b.dataset.f, pinned = state.ui.pins.indexOf(k) >= 0, hidden = state.ui.hide.indexOf(k) >= 0;
      popMenu(b, [
        { label: pinned ? 'Unpin' : 'Pin to the top', run: function () { state.ui.pins = pinned ? state.ui.pins.filter(function (x) { return x !== k; }) : [k].concat(state.ui.pins.filter(function (x) { return x !== k; })).slice(0, 30); state.ui.hide = state.ui.hide.filter(function (x) { return x !== k; }); save(); toast(pinned ? 'Unpinned' : 'Pinned to the top'); drawList(); } },
        { label: hidden ? 'Show in Recent' : 'Hide from Recent', run: function () { state.ui.hide = hidden ? state.ui.hide.filter(function (x) { return x !== k; }) : [k].concat(state.ui.hide).slice(0, 400); state.ui.pins = state.ui.pins.filter(function (x) { return x !== k; }); save(); toast(hidden ? 'Back in Recent' : 'Hidden from Recent'); drawList(); } }
      ]);
    }
    function setMulti(on) { multi = on; picked = {}; buzz('light'); const b = $('#afSel', root); if (b) b.setAttribute('aria-pressed', on); drawList(); syncMulti(); }
    function syncMulti() {
      const bar = $('#afMulti', root); if (!bar) return;
      // Only an Add button, and only once something is ticked. Tap the select icon again to stop.
      const n = Object.keys(picked).length; bar.hidden = !multi || !n;
      if (n) { const kc = Object.keys(picked).map(pickedItem).filter(Boolean).reduce(function (a, x) { return a + x.kcal; }, 0); $('#afMGo', root).textContent = 'Add ' + n + ' to ' + mealName(ml) + ' · ' + fmtKcal(kc) + ' kcal'; }
    }
    // What a picked row adds: the amount you had last time, or a normal serving.
    function pickedItem(k) {
      const fu = foodUse(), o = picked[k].o && fu.order.find(function (x) { return x.key === picked[k].o; });
      if (o && !o.item.ref) return { kcal: o.item.kcal, protein: o.item.protein, carbs: o.item.carbs, fat: o.item.fat, name: o.item.name };
      const f = getFood(picked[k].f || (o && o.item.ref)); if (!f) return null;
      let amt;
      if (o && o.item.ref) amt = { g: o.item.g, qty: o.item.qty, unit: o.item.unit };
      else { const lp = lastPortion(f.id, ml), lu = lp && unitsFor(f).find(function (u) { return u.label === lp.unit; }); if (lu) amt = { g: Math.round(lp.qty * lu.g * 10) / 10, qty: lp.qty, unit: lp.unit }; else { const s0 = defaultServing(f); amt = { g: Math.round(s0.qty * s0.unit.g * 10) / 10, qty: s0.qty, unit: s0.unit.label }; } }
      const m = macrosFor(f, amt.g);
      return Object.assign({ kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat, name: f.name.slice(0, 80), ref: f.id }, amt);
    }
    function addPicked() {
      const its = Object.keys(picked).map(pickedItem).filter(Boolean);
      if (!its.length) return;
      const snap = snapshot();
      addItems(d, its.map(function (it) { return Object.assign({ id: newId(), meal: ml }, it); }));
      added += its.length - 1; logged('Added ' + its.length + ' to ' + mealName(ml), snap);
      multi = false; picked = {}; closeSheet();
    }
    function refreshHead() { const l = $('#afDay', root); if (l) l.textContent = relDate(d) + (added ? ' · ' + added + ' added' : ''); }

    // ----- serving: how much, which meal (or, while picking, how much goes in the recipe) -----
    function showServe(f, item, preset) {
      leave();
      const units = unitsFor(f), forRecipe = pick, editing = !!item;
      let qty, unit;
      if (preset) { unit = units.find(function (u) { return u.label === preset.unit; }) || null; qty = preset.qty; if (!unit) { unit = units.find(function (u) { return u.label === 'g'; }) || units[0]; qty = preset.g / unit.g; } }
      else if (item) { unit = units.find(function (u) { return u.label === item.unit; }) || null; qty = item.qty; if (!unit) { unit = units.find(function (u) { return u.label === 'g'; }) || units[0]; qty = item.g / unit.g; } }
      else { const lp = (!pick || pickMeal) && lastPortion(f.id, pick ? null : ml), lu = lp && units.find(function (u) { return u.label === lp.unit; }); if (lu) { unit = lu; qty = lp.qty; } else { const s0 = defaultServing(f); qty = s0.qty; unit = units.find(function (u) { return u.label === s0.unit.label; }) || units[0]; } }
      // Replacing an ingredient: start from the same weight as the one it replaces.
      if (!item && pick && replaceAt != null && draft.items[replaceAt]) { const gu = units.find(function (u) { return u.label === 'g'; }); if (gu) { unit = gu; qty = Math.round(draft.items[replaceAt].g); } }
      const src = srcBadge(f) + (f.est ? 'Typical values for this product · check the pack' : f.off || f.cat === 'Packaged foods' ? 'From the product label (Open Food Facts)' : f.cat === 'Restaurants (estimate)' ? 'Estimate for a typical serving' : f.recipe ? 'Recipe · ' + (state.recipes.find(function (x) { return x.id === f.id; }) || { items: [] }).items.length + ' ingredients' + (f.missing ? ' (some missing)' : '') + (f.rawG ? '. Grams are by raw ingredient weight; add the cooked weight to the recipe for exact grams.' : '') : f.custom ? 'Your own numbers' : f.cat === 'Egyptian dishes' ? 'Egyptian dish · estimate from a typical recipe' : f.cat === 'Dishes (estimate)' ? 'Estimate from a typical recipe' : esc(f.cat) + (f.src === 'fndds' ? ' · USDA, as eaten' : ' · USDA, lab analysis'));
      root.innerHTML = head(editing ? (forRecipe ? 'Ingredient' : editTitle(d)) : (forRecipe ? 'How much goes in?' : 'How much?'), edit && !forRecipe ? 'x' : true, '<button type="button" class="icon-btn fd-fav" id="svFav" aria-pressed="' + isFav(f.id) + '" aria-label="Favorite">' + STAR(isFav(f.id)) + '</button>' + '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>', forRecipe) +
        '<div class="sv-name">' + esc(f.name) + (isVerified(f) ? VER_IC : '') + '</div>' +
        (editing && !forRecipe ? '<div class="label faint fd-sec">How much you had</div>' : '') +
        '<div class="sv-amt"><div class="field"><input class="input" id="svQ" ' + (state.settings.numpad ? 'inputmode="none" readonly' : 'inputmode="decimal" enterkeyhint="done"') + ' autocomplete="off" aria-label="Amount" value="' + fmtQty(qty) + '" /></div>' +
        '<div class="field"><select class="input" id="svU" aria-label="Unit">' + units.map(function (u, i) { return '<option value="' + i + '"' + (u === unit ? ' selected' : '') + '>' + esc(u.label) + (u.label === 'g' || u.label === 'oz' || f.noG ? '' : ' (' + fmtQty(Math.round(u.g * 10) / 10) + ' g)') + '</option>'; }).join('') + '</select></div></div>' +
        (!state.settings.numpad ? '' : '<div class="kp" id="svKp"><div class="kp-quick" id="kpQ"></div>' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(function (k) { return '<button type="button" data-k="' + k + '"' + (k === '⌫' ? ' aria-label="Delete"' : '') + '>' + k + '</button>'; }).join('') + '</div>') +
        '<div class="sv-portion" id="svPortion"></div>' +
        '<div class="sv-sum" id="svSum"></div>' +
        '<div class="nut-drop" id="svNuts" hidden></div>' +
        '<div class="sv-key" id="svKey"></div>' +

        '<p class="form-error" id="svErr" hidden></p>' +
        '<div class="menu-src" hidden>' + (forRecipe && editing && !pickMeal ? '<button type="button" id="svReplace">Replace with another food</button>' : '') + '<span id="svMenuDyn"></span>' + (!forRecipe ? '<button type="button" id="svCmp">Compare with another food</button>' : '') + (editing ? '<button type="button" class="danger" id="svDel">' + (forRecipe ? 'Remove from recipe' : 'Delete') + '</button>' : '') + '</div>' +
        (editing && !forRecipe ? notePicHtml(item) : '') +
        (src ? '<p class="muted-note sv-src">' + src + '</p>' : '') +
        '<div class="sheet-foot">' + (editing ? '<button type="button" class="btn primary block" id="svAdd">' + (forRecipe ? 'Done' : 'Save') + '</button>'
          : '<button type="button" class="btn primary block" id="svAdd">' + (forRecipe ? (replaceAt != null ? 'Replace' : 'Add to recipe') : pickRepeat ? 'Next<span id="svMealName" hidden></span>' : 'Add to <span id="svMealName"></span>') + '</button>') + '</div>';
      const Q = $('#svQ', root), U = $('#svU', root);
      const grams = function () { const n = parseNum(Q.value); return isNaN(n) || n <= 0 ? NaN : n * units[+U.value].g; };
      // "Save this amount as a portion" (or remove one of yours).
      const portionUI = function (open) {
        const box = $('#svPortion', root), u = units[+U.value];
        if (open) {
          box.innerHTML = '<div class="pt-form"><input class="input" id="ptN" maxlength="24" placeholder="Name, like my bowl" aria-label="Portion name" autocomplete="off" /><button type="button" class="btn primary" id="ptSave">Save</button></div>';
          $('#ptN', box).focus();
          $('#ptSave', box).addEventListener('click', function () {
            const nm = $('#ptN', box).value.trim(), g = grams();
            if (!nm || isNaN(g)) { toast(!nm ? 'Give it a name' : 'Enter an amount first'); buzz('warn'); return; }
            const list = (state.portions[f.id] || []).filter(function (x) { return x.l !== nm; }); list.push({ l: nm.slice(0, 24), g: Math.round(g * 10) / 10 });
            state.portions[f.id] = list.slice(-8); save(); buzz('success'); toast('Saved “' + nm + '” · ' + fmtQty(Math.round(g)) + ' g');
            showServe(f, item, { qty: 1, unit: nm, g: g });
          });
          return;
        }
        box.innerHTML = '';
        const dyn = $('#svMenuDyn', root); if (!dyn) return;
        dyn.innerHTML = u && u.mine ? '<button type="button" id="ptDel">Remove portion “' + esc(u.label) + '”</button>' : '<button type="button" id="ptAdd">Save this amount as a portion</button>';
        if ($('#ptAdd', dyn)) $('#ptAdd', dyn).addEventListener('click', function () { portionUI(true); });
        if ($('#ptDel', dyn)) $('#ptDel', dyn).addEventListener('click', function () {
          const g = grams(); state.portions[f.id] = (state.portions[f.id] || []).filter(function (x) { return x.l !== u.label; }); if (!state.portions[f.id].length) delete state.portions[f.id];
          save(); buzz('light'); showServe(f, item, { qty: Math.round(g), unit: 'g', g: g });
        });
      };
      let svNutRedraw = null;
      const draw = function () {
        portionUI(false);
        const g = grams();
        const mm = isNaN(g) ? null : macrosFor(f, g);
        $('#svSum', root).innerHTML = sumBox(mm, editing && !forRecipe ? 'you had' : null) + SUM_MORE;
        const kv = [['fib', 'Fiber', 'g'], ['sug', 'Sugars', 'g'], ['sat', 'Sat. fat', 'g'], ['na', 'Sodium', 'mg']].map(function (x) { const v = per100(f, x[0]); return { l: x[1], u: x[2], v: v == null || isNaN(g) ? null : v * g / 100 }; });
        const ky = $('#svKey', root);
        ky.innerHTML = kv.filter(function (x) { return x.v != null; }).length >= 2 ? kv.map(function (x) { return '<div><b class="num">' + (x.v == null ? '–' : fmtNut(x.v, x.u).replace(' ' + x.u, '')) + '<small>' + (x.v == null ? '' : x.u) + '</small></b><span>' + x.l + '</span></div>'; }).join('') : '';
        ky.hidden = !ky.innerHTML;
        const mn = $('#svMealName', root); if (mn) mn.textContent = mealName(ml);
        if (svNutRedraw) svNutRedraw();
      };
      svNutRedraw = nutToggle($('#svSum', root), $('#svNuts', root), function () { const g = grams(); return isNaN(g) ? {} : foodTot(f, g); });
      draw();
      draw();
      Q.addEventListener('input', draw);
      U.addEventListener('change', function () {
        // Keep roughly the same amount when switching units (e.g. 1 cup → 136 g).
        const prev = unit, n = parseNum(Q.value); unit = units[+U.value];
        if (!isNaN(n) && n > 0) { const g = n * prev.g, nq = g / unit.g; Q.value = fmtQty(unit.label === 'g' ? Math.round(nq) : Math.round(nq * 4) / 4 || Math.round(nq * 100) / 100); }
        draw();
      });
      // The number pad: the first key replaces the amount, then keys add on. Quick picks for common amounts.
      let fresh = true;
      const setQ = function (v) { Q.value = v; Q.dispatchEvent(new Event('input')); };
      const quick = function () { const u = units[+U.value]; $('#kpQ', root).innerHTML = (u.label === 'g' ? [50, 100, 150, 200, 250] : u.label === 'oz' ? [1, 2, 4, 6, 8] : [0.5, 1, 1.5, 2, 3]).map(function (v) { return '<button type="button" data-kq="' + v + '">' + (v === 0.5 ? '½' : v === 1.5 ? '1½' : v) + '</button>'; }).join(''); };
      if ($('#svKp', root)) { quick(); U.addEventListener('change', function () { quick(); fresh = true; }); }
      if ($('#svKp', root)) $('#svKp', root).addEventListener('click', function (e) {
        const q2 = e.target.closest('[data-kq]'), k = e.target.closest('[data-k]');
        if (q2) { buzz('light'); setQ(q2.dataset.kq); fresh = true; return; }
        if (!k) return; buzz('light'); let v = fresh ? '' : Q.value; fresh = false;
        if (k.dataset.k === '⌫') v = v.slice(0, -1); else if (k.dataset.k === '.') { if (v.indexOf('.') < 0) v = (v || '0') + '.'; } else if (v.replace('.', '').length < 6) v = v === '0' ? k.dataset.k : v + k.dataset.k;
        setQ(v);
      });
      Q.addEventListener('focus', function () { fresh = true; if (!state.settings.numpad) Q.select(); });
      Q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#svAdd', root).click(); } });
      if (!forRecipe) bindMeal(draw);
      if (editing && !forRecipe && $('#npPic', root)) bindNotePic(root, item);
      $('#afBack', root).addEventListener('click', function () { if (forRecipe && editing) { if (pickMeal) { pick = false; pickMeal = false; showMealEdit(); } else showRecipe(); } else if (edit && !pick) closeSheet(); else showList(); });
      $('#svFav', root).addEventListener('click', function () {
        const on = !isFav(f.id);
        if (on) state.favs.unshift(f.id); else state.favs = state.favs.filter(function (x) { return x !== f.id; });
        save(); buzz('light'); this.setAttribute('aria-pressed', on); this.innerHTML = STAR(on);
        toast(on ? 'Added to Favorites' : 'Removed from Favorites');
      });
      $('#svAdd', root).addEventListener('click', function () {
        const g = grams(), n = parseNum(Q.value);
        if (isNaN(g) || g > 20000 || n > 10000) { const x = $('#svErr', root); x.textContent = 'Enter an amount'; x.hidden = false; buzz('warn'); Q.focus(); return; }
        const u = units[+U.value], amt = { ref: f.id, g: Math.round(g * 10) / 10, qty: Math.round(n * 1000) / 1000, unit: u.label };
        if (forRecipe && pickMeal) {
          // a food in a meal keeps its calories and macros for that amount
          const mm2 = macrosFor(f, g), fields2 = Object.assign({ name: f.name.slice(0, 80), kcal: Math.min(mm2.kcal, 10000), protein: mm2.protein, carbs: mm2.carbs, fat: mm2.fat }, amt);
          if (editing) Object.assign(item, fields2); else mealDraft.items.push(fields2);
          buzz('success'); pick = false; pickMeal = false; showMealEdit(); return;
        }
        if (forRecipe) {
          if (editing) Object.assign(item, amt);
          else if (replaceAt != null && draft.items[replaceAt]) { draft.items[replaceAt] = Object.assign({ name: f.name.slice(0, 80) }, amt); replaceAt = null; }
          else draft.items.push(Object.assign({ name: f.name.slice(0, 80) }, amt));
          buzz('success'); pick = false; showRecipe(); return;
        }
        if (pickRepeat) { const mr = macrosFor(f, g); closeSheet(); setTimeout(function () { repeatSheet({ item: Object.assign({ kcal: Math.min(mr.kcal, 10000), protein: mr.protein, carbs: mr.carbs, fat: mr.fat, name: f.name.slice(0, 80) }, amt), meal: ml, days: [] }); }, 260); return; }
        const m = macrosFor(f, g), snap = snapshot();
        const fields = Object.assign({ kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat, name: f.name.slice(0, 80), meal: ml }, amt);
        if (item) {
          Object.assign(item, fields); readNote(root, item); save(); renderAll(); closeSheet(); buzz('success'); toast('Saved', function () { restore(snap); });
          return;
        }
        addItems(d, [Object.assign({ id: newId() }, fields)]);
        logged('Added to ' + mealName(ml), snap);
        showList();
      });
      if ($('#svReplace', root)) $('#svReplace', root).addEventListener('click', function () { replaceAt = draft.items.indexOf(item); q = ''; buzz('light'); showList(); });
      if ($('#svCmp', root)) $('#svCmp', root).addEventListener('click', function () { comparing = { f: f, g: grams() }; q = ''; showList(); });
      if (editing) $('#svDel', root).addEventListener('click', function () {
        if (forRecipe && pickMeal) { mealDraft.items = mealDraft.items.filter(function (x) { return x !== item; }); pick = false; pickMeal = false; buzz('medium'); showMealEdit(); return; }
        if (forRecipe) { draft.items = draft.items.filter(function (x) { return x !== item; }); buzz('medium'); showRecipe(); return; }
        const snap = snapshot();
        state.food[d] = foodFor(d).filter(function (x) { return x.id !== item.id; });
        if (!state.food[d].length) delete state.food[d];
        save(); renderAll(); closeSheet(); buzz('medium'); toast('Removed', function () { restore(snap); });
      });
    }

    // ----- barcode: camera, or type the number -----
    function showScan(code) {
      leave();
      root.innerHTML = head('Scan barcode', true, '<button type="button" class="text-btn" id="scMany" style="margin:0" aria-pressed="' + !!scanTray + '">' + (scanTray ? 'One at a time' : 'Scan several') + '</button>', true) +
        (scanTray ? '<div class="sc-tray" id="scTray"></div>' : '') +
        '<div class="scan-box" id="scBox"><video id="scV" playsinline muted autoplay></video><span class="scan-frame"></span></div>' +
        '<p class="muted-note scan-msg" id="scMsg">Point the camera at the barcode</p>' +
        '<button type="button" class="text-btn sc-pic" id="scPic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8.5"/></svg>Choose a photo of the barcode</button><input type="file" id="scPicF" accept="image/*" hidden />' +
        '<div class="sv-amt" style="grid-template-columns:1fr auto"><div class="field"><input class="input" id="scCode" inputmode="numeric" maxlength="14" autocomplete="off" placeholder="Or type the number" aria-label="Barcode number" /></div>' +
        '<button type="button" class="btn soft" id="scGo" style="height:50px">Look up</button></div>' +
        '<div id="scRes"></div>' +
        '<button type="button" class="text-btn fd-create" id="scMenu">Scan a menu or receipt instead</button><input type="file" id="scMenuF" accept="image/*" hidden />' +
        '<p class="muted-note sv-src">Product data from Open Food Facts</p>';
      $('#afBack', root).addEventListener('click', function () { scanTray = null; showList(); });
      $('#scMenu', root).addEventListener('click', function () { $('#scMenuF', root).click(); });
      $('#scMenuF', root).addEventListener('change', function () {
        const file = this.files && this.files[0]; this.value = ''; if (!file) return;
        leave(); const b = $('#scMenu', root); b.disabled = true; b.textContent = 'Reading the photo…';
        loadTess().then(function (T) { return T.recognize(file, 'eng+ara'); }).then(function (r) {
          const items = menuLines((r && r.data && r.data.text) || '');
          if (!items.length) { b.disabled = false; b.textContent = 'Scan a menu or receipt instead'; toast('Couldn\'t find any foods in that photo'); buzz('warn'); return; }
          // The list goes into search, where "Add all at once" matches each line to a food.
          q = items.join(', '); scanTray = null; showList(); const inp = $('#afQ', root); if (inp) inp.value = q; drawList(); buzz('success');
        }, function () { b.disabled = false; b.textContent = 'Scan a menu or receipt instead'; toast(navigator.onLine === false ? 'Reading photos needs the internet the first time.' : 'Couldn\'t read the photo.'); buzz('warn'); });
      });
      const msg = function (t) { const m = $('#scMsg', root); if (m) m.textContent = t; };
      const C = $('#scCode', root);
      $('#scMany', root).addEventListener('click', function () { scanTray = scanTray ? null : []; buzz('light'); showScan(); });
      // Several in a row: each product goes on a tray (at your last portion), then add them all.
      const drawTray = function () {
        const t = $('#scTray', root); if (!t) return;
        t.innerHTML = scanTray.length ? '<div class="list">' + scanTray.map(function (x, i) { return '<div class="row fd-row"><div class="grow"><div class="row-t">' + esc(x.name) + '</div><div class="row-s">' + fmtAmt(x.qty, x.unit) + ' · ' + fmtKcal(x.kcal) + ' kcal</div></div><button type="button" class="icon-btn me-rm" data-trx="' + i + '" aria-label="Remove">' + TRASH + '</button></div>'; }).join('') + '</div><button type="button" class="btn primary block" id="scAddAll">Add ' + scanTray.length + ' to ' + mealName(ml) + '</button>' : '<p class="muted-note fd-empty">Scan products one after another. They collect here.</p>';
        $$('[data-trx]', t).forEach(function (b) { b.addEventListener('click', function () { scanTray.splice(+b.dataset.trx, 1); drawTray(); }); });
        if ($('#scAddAll', t)) $('#scAddAll', t).addEventListener('click', function () { const snap = snapshot(), its = scanTray.map(function (x) { return Object.assign({ id: newId(), meal: ml }, x); }); addItems(d, its); scanTray = null; added += its.length - 1; logged('Added ' + its.length + ' to ' + mealName(ml), snap); closeSheet(); });
      };
      const toTray = function (c) {
        msg('Looking up ' + c + '…');
        lookupBarcode(c).then(function (r) {
          if (!root.isConnected || !scanTray) return;
          if (!r.food) { msg('Not found: ' + c + '. Keep scanning, or add it later.'); buzz('warn'); return; }
          const f = r.food, lp = lastPortion(f.id), us = unitsFor(f), lu = lp && us.find(function (u) { return u.label === lp.unit; }), s0 = defaultServing(f);
          const qty = lu ? lp.qty : s0.qty, unit = lu || s0.unit, g = Math.round(qty * unit.g * 10) / 10, m = macrosFor(f, g);
          scanTray.push({ ref: f.id, name: f.name.slice(0, 80), g: g, qty: qty, unit: unit.label, kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat });
          buzz('success'); msg('Added ' + f.name + '. Scan the next one.'); drawTray();
        }, function () { msg('Couldn\'t reach Open Food Facts. Check your connection.'); });
      };
      if (scanTray) drawTray();
      const find = function (c) {
        c = String(c).replace(/\D/g, '');
        if (!validBarcode(c)) { msg('That doesn\'t look like a full barcode. Check the number.'); buzz('warn'); return; }
        if (scanTray) { C.value = ''; toTray(c); return; }
        leave(); C.value = c; $('#scBox', root).hidden = true; msg('Looking up ' + c + '…'); $('#scRes', root).innerHTML = '';
        lookupBarcode(c).then(function (r) {
          if (!root.isConnected || !$('#scRes', root)) return;
          if (r.food) { buzz('success'); showServe(r.food); return; }
          msg('');
          $('#scRes', root).innerHTML = '<p class="muted-note fd-empty">' + (r.name ? '“' + esc(r.name) + '” is in Open Food Facts, but without nutrition facts.' : 'This product isn\'t in Open Food Facts yet.') + ' Add it from the label and it will be found next time.</p>' +
            '<button type="button" class="btn primary block" id="scLabel">Scan the label</button><button type="button" class="text-btn fd-create" id="scNew">Type it in instead</button>';
          $('#scNew', root).addEventListener('click', function () { showCreate(null, r.name || '', null, c); });
          $('#scLabel', root).addEventListener('click', function () { showCreate(null, r.name || '', null, c); const f = $('#cfImg', root); if (f) f.click(); });
        }, function () { if (root.isConnected) msg('Couldn\'t reach Open Food Facts. Check your connection and try again.'); });
      };
      $('#scGo', root).addEventListener('click', function () { find(C.value); });
      $('#scPic', root).addEventListener('click', function () { $('#scPicF', root).click(); });
      $('#scPicF', root).addEventListener('change', function () {
        const file = this.files && this.files[0]; this.value = ''; if (!file) return;
        msg('Reading the barcode…');
        decodeBarcodeFile(file).then(function (c) {
          if (!root.isConnected) return;
          if (c && validBarcode(c)) { beep(); find(c); }
          else { msg('Couldn\'t find a barcode in that photo. Try a closer, sharper one, or type the number.'); buzz('warn'); }
        });
      });
      C.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); find(C.value); } });
      if (code) { $('#scBox', root).hidden = true; find(code); return; }
      primeBeep();
      startCamera($('#scV', root), find, msg, !!scanTray).then(function (stop) {
        if (stop) {
          if (root.isConnected && $('#scV', root)) {
            stopScan = stop;
            if (stop.torch) { let on = false; $('#scBox', root).insertAdjacentHTML('beforeend', '<button type="button" class="sc-torch" id="scTorch" aria-pressed="false" aria-label="Flashlight">' + TORCH_IC + '</button>'); $('#scTorch', root).addEventListener('click', function () { on = !on; stop.torch(on).catch(function () {}); this.setAttribute('aria-pressed', on); buzz('light'); }); }
          } else stop();
        }
        else if ($('#scBox', root)) $('#scBox', root).hidden = true; // no camera: just the number field
      });
    }

    // ----- a meal: add all of it -----
    function showMeal(mm) {
      leave();
      root.innerHTML = head('Meal', true) + '<div class="sv-name">' + esc(mm.name) + '</div>' +
        '<div class="list">' + mm.items.map(function (it) { return '<div class="row fd-row"><div class="grow"><div class="row-t">' + esc(it.name || 'Quick add') + '</div><div class="row-s">' + (it.ref ? fmtAmt(it.qty, it.unit) + ' · ' : '') + fmtKcal(it.kcal) + ' kcal</div></div></div>'; }).join('') + '</div>' +
        '<div class="sv-sum">' + sumBox(mm.items.reduce(function (a, f) { return { kcal: a.kcal + f.kcal, protein: a.protein + f.protein, carbs: a.carbs + f.carbs, fat: a.fat + f.fat }; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })) + '</div>' +
        '<div class="sheet-foot"><div class="btn-row"><button type="button" class="btn danger icon-only" id="smDel" aria-label="Delete meal">' + TRASH + '</button><button type="button" class="btn primary" id="smAdd">Add to <span id="smName"></span></button></div></div>';
      const nm = function () { $('#smName', root).textContent = mealName(ml); };
      nm(); bindMeal(nm);
      $('#afBack', root).addEventListener('click', showList);
      $('#smAdd', root).addEventListener('click', function () {
        const snap = snapshot();
        if (state.settings.explode) addItems(d, mm.items.map(function (it) { return Object.assign({}, it, { id: newId(), meal: ml }); }));
        else addItems(d, [mealEntry(mm, ml)]);
        logged('Added ' + mm.name, snap); showList();
      });
      $('#smDel', root).addEventListener('click', function () {
        const snap = snapshot();
        state.meals = state.meals.filter(function (x) { return x.id !== mm.id; });
        save(); buzz('medium'); toast('Meal deleted', function () { restore(snap); }); showList();
      });
    }

    // A meal as one diary entry: its totals, plus its vitamins and minerals added up.
    function mealEntry(mm, meal) {
      const t = mealSum(mm.items), n = {};
      mm.items.forEach(function (it) { const v = itemNutrients(it); if (!v) return; NUTS.forEach(function (x) { const k = x[0]; if (v[k] != null) n[k] = (n[k] || 0) + v[k]; }); });
      Object.keys(n).forEach(function (k) { n[k] = Math.round(n[k] * 1000) / 1000; });
      const e = { id: newId(), name: mm.name, meal: meal, mid: mm.id, mi: mm.items.map(function (it) { const c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan; return c; }), kcal: Math.min(10000, Math.round(t.kcal)), protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat) };
      if (Object.keys(n).length) e.n = n;
      return e;
    }
    // A restaurant's whole menu: tick what you had, add it all at once.
    function showMenu(pl) {
      leave();
      const its0 = pl.items.slice().sort(function (a, b) { return (isFav(b.id) ? 1 : 0) - (isFav(a.id) ? 1 : 0); });
      pl = { name: pl.name, items: its0 };
      const sel = {}, sv = pl.items.map(function (f) { const s0 = defaultServing(f), g = s0.qty * s0.unit.g; return { s: s0, g: g, m: macrosFor(f, g) }; });
      root.innerHTML = head(esc(pl.name), true) +
        '<div class="list">' + pl.items.map(function (f, i) { return '<div class="row fd-row mn-row"><button type="button" class="mn-tick" data-tk="' + i + '" aria-pressed="false" aria-label="Select"></button><button type="button" class="grow mn-open" data-mo="' + i + '"><div class="row-t">' + esc(f.name.split(' · ')[0]) + '</div><div class="row-s">' + esc(fmtAmt(sv[i].s.qty, sv[i].s.unit.label)) + ' · ' + fmtKcal(sv[i].m.kcal) + ' kcal · ' + sv[i].m.protein + ' g protein</div></button><span class="mn-qty" data-qi="' + i + '" hidden><button type="button" data-qd="-1" aria-label="One less">−</button><b class="num">1</b><button type="button" data-qd="1" aria-label="One more">+</button></span><button type="button" class="icon-btn mn-star" data-st="' + i + '" aria-pressed="' + isFav(f.id) + '" aria-label="Favorite">' + STAR(isFav(f.id)) + '</button></div>'; }).join('') + '</div>' +
        '<p class="muted-note sv-src">Estimates for a typical serving.</p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="mnAdd" disabled>Tick what you had</button></div>';
      const upd = function () {
        const ks = Object.keys(sel), b = $('#mnAdd', root), kc = ks.reduce(function (a, i) { return a + sv[i].m.kcal * sel[i]; }, 0), n = ks.reduce(function (a, i) { return a + sel[i]; }, 0);
        b.disabled = !ks.length; b.textContent = ks.length ? 'Add ' + n + ' to ' + mealName(ml) + ' · ' + fmtKcal(kc) + ' kcal' : 'Tick what you had';
        $$('[data-qi]', root).forEach(function (q) { const i = q.dataset.qi; q.hidden = !sel[i]; if (sel[i]) q.querySelector('b').textContent = sel[i]; const st = q.nextElementSibling; if (st) st.hidden = !!sel[i]; });
      };
      bindMeal(upd);
      $('#afBack', root).addEventListener('click', showList);
      $$('[data-tk]', root).forEach(function (b) { b.addEventListener('click', function () { const i = b.dataset.tk; if (sel[i]) delete sel[i]; else sel[i] = 1; b.setAttribute('aria-pressed', !!sel[i]); buzz('light'); upd(); }); });
      $$('[data-qi] [data-qd]', root).forEach(function (b) { b.addEventListener('click', function () { const i = b.parentNode.dataset.qi, n = (sel[i] || 0) + +b.dataset.qd; if (n <= 0) { delete sel[i]; const t = root.querySelector('[data-tk="' + i + '"]'); if (t) t.setAttribute('aria-pressed', false); } else sel[i] = Math.min(9, n); buzz('light'); upd(); }); });
      $$('[data-mo]', root).forEach(function (b) { b.addEventListener('click', function () { buzz('light'); showServe(pl.items[+b.dataset.mo]); }); });
      $$('[data-st]', root).forEach(function (b) { b.addEventListener('click', function () {
        const id = pl.items[+b.dataset.st].id, on = !isFav(id);
        if (on) state.favs.unshift(id); else state.favs = state.favs.filter(function (x) { return x !== id; });
        save(); buzz('light'); b.setAttribute('aria-pressed', on); b.innerHTML = STAR(on);
      }); });
      $('#mnAdd', root).addEventListener('click', function () {
        const snap = snapshot(), its = Object.keys(sel).map(function (i) { const f = pl.items[i], x = sv[i], k = sel[i], m = k === 1 ? x.m : macrosFor(f, x.g * k); return { id: newId(), meal: ml, ref: f.id, name: f.name.slice(0, 80), g: Math.round(x.g * k * 10) / 10, qty: Math.round(x.s.qty * k * 1000) / 1000, unit: x.s.unit.label, kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat }; });
        addItems(d, its); added += its.length - 1; logged('Added ' + its.length + ' from ' + pl.name, snap); showList();
      });
    }
    // ----- meal: rename, remove foods, delete (from You → My foods) -----
    // A meal being made or edited: { id (null = new), name, items }. Foods are added like recipe ingredients.
    let mealDraft = null, pickMeal = false, mealAdj = false;
    const mealSum = function (items) { return items.reduce(function (a, f) { return { kcal: a.kcal + f.kcal, protein: a.protein + f.protein, carbs: a.carbs + f.carbs, fat: a.fat + f.fat }; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 }); };
    function showMealEdit(mm) {
      leave();
      if (mm) mealDraft = JSON.parse(JSON.stringify({ id: mm.id || null, name: mm.name || '', items: mm.items || [] }));
      const md = mealDraft, isNew = !md.id || !state.meals.some(function (x) { return x.id === md.id; });
      root.innerHTML = head(mealAdj ? editTitle(d) : isNew ? 'New meal' : 'Edit meal', 'x', isNew && !mealAdj ? '' : '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>', true) +
        (mealAdj ? '<div class="menu-src" hidden><button type="button" id="meExplode">Split into separate foods</button>' + (state.meals.some(function (x) { return x.id === md.id; }) ? '<button type="button" id="meReset">Use the meal again</button>' : '') + '</div>' :
          isNew ? '' : '<div class="menu-src" hidden><button type="button" id="meShare">Share</button><button type="button" class="danger" id="meDel">Delete meal</button></div>') +
        (mealAdj ? '<div class="sv-name">' + esc(md.name) + '</div><p class="muted-note adj-note">Changes this day only. To change the meal itself, go to Foods.</p>' : '') +
        '<div class="field"' + (mealAdj ? ' hidden' : '') + '><span>Name</span><input class="input" id="meN" maxlength="40" placeholder="e.g. Usual breakfast" aria-label="Meal name" autocomplete="off" value="' + esc(md.name) + '" /></div>' +
        '<div class="label faint fd-sec">Foods</div>' +
        (md.items.length ? '<div class="list" id="meItems">' + md.items.map(function (it, i) { return '<div class="row fd-row me-row" data-mrow="' + i + '">' + (md.items.length > 1 ? '<span class="cat-grip me-grip" aria-label="Drag to reorder">' + GRIP + '</span>' : '') + '<button type="button" class="grow me-open" data-mi="' + i + '"><div class="row-t">' + esc(it.name || 'Quick add') + '</div><div class="row-s">' + (it.ref ? fmtAmt(it.qty, it.unit) + ' · ' : '') + fmtKcal(it.kcal) + ' kcal</div></button><button type="button" class="icon-btn me-rm" data-rm="' + i + '" aria-label="Remove ' + esc(it.name || 'food') + '">' + TRASH + '</button></div>'; }).join('') + '</div>' : '<p class="muted-note fd-empty">No foods yet.</p>') +
        '<button type="button" class="btn soft block" id="meAdd" style="margin-bottom:16px">' + (otherMeals().length ? '+ Add food or meal' : '+ Add food') + '</button>' +
        (mealAdj ? '' : '<div class="list me-opt"><label class="row"><div class="grow"><div class="row-t">Explode all meals</div><div class="row-s">Log every meal as its separate foods</div></div><span class="switch"><input type="checkbox" id="meSplit"' + (state.settings.explode ? ' checked' : '') + ' /><i></i></span></label></div>') +
        (md.items.length ? '<div class="sv-sum" id="meSum">' + sumBox(mealSum(md.items), mealAdj ? 'you had' : 'kcal') + SUM_MORE + '</div><div class="nut-drop" id="meNuts" hidden></div>' + keyBoxes(itemsKey(md.items)) : '') +
        '<p class="form-error" id="meErr" hidden></p>' +
        (mealAdj ? notePicHtml(edit) : '') +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="meSave">' + (isNew ? 'Save meal' : 'Save') + '</button></div>';
      const N = $('#meN', root);
      N.addEventListener('input', function () { md.name = N.value; });
      nutToggle($('#meSum', root), $('#meNuts', root), function () { return itemsTot(md.items); });
      if ($('#meSplit', root)) $('#meSplit', root).addEventListener('change', function () { state.settings.explode = this.checked; save(); buzz('light'); });
      $('#afBack', root).addEventListener('click', function () { mealDraft = null; if (manage || mealAdj) closeSheet(); else showList(); });
      if (mealAdj) {
        bindNotePic(root, edit);
        const entry = function () { return foodFor(d).find(function (x) { return x.id === edit.id; }); };
        const apply = function (items, msg) {
          const it = entry(); if (!it) return closeSheet();
          const snap = snapshot(), e = mealEntry({ id: it.mid, name: (md.name.trim() || it.name).slice(0, 40), items: items }, it.meal);
          delete e.id; delete e.meal; delete it.n; Object.assign(it, e); readNote(root, it);
          mealDraft = null; save(); renderAll(); closeSheet(); buzz('success'); toast(msg, function () { restore(snap); });
        };
        $('#meSave', root).addEventListener('click', function (ev) {
          ev.stopImmediatePropagation();
          if (!md.items.length) { closeSheet(); removeFoodItem(edit.id, d); return; }
          apply(md.items, 'Saved for this day only');
        }, true);
        $('#meExplode', root).addEventListener('click', function () {
          const it = entry(); if (!it) return closeSheet();
          const snap = snapshot(), list = foodFor(d), at = list.indexOf(it);
          const parts = md.items.map(function (x) { return Object.assign({}, x, { id: newId(), meal: it.meal }, it.t ? { t: it.t } : {}); });
          list.splice.apply(list, [at, 1].concat(parts));
          mealDraft = null; save(); renderAll(); closeSheet(); buzz('success'); toast('Split into ' + parts.length + ' foods', function () { restore(snap); });
        });
        if ($('#meReset', root)) $('#meReset', root).addEventListener('click', function () { const m = state.meals.find(function (x) { return x.id === md.id; }); md.name = m.name; apply(m.items, 'Back to the meal'); });
      }
      $('#meAdd', root).addEventListener('click', function () { pick = true; pickMeal = true; q = ''; showList(); });
      $$('[data-rm]', root).forEach(function (b) { b.addEventListener('click', function () { md.items.splice(+b.dataset.rm, 1); buzz('light'); showMealEdit(); }); });
      // Drag the grip to reorder the foods.
      const meList = $('#meItems', root);
      if (meList) dragSort(meList, '[data-mrow]', function (src, tgt, before) {
        const from = +src.dataset.mrow, mv = md.items.splice(from, 1)[0];
        let to = +tgt.dataset.mrow; if (from < to) to--; if (!before) to++;
        md.items.splice(to, 0, mv); buzz('light'); showMealEdit();
      }, { handle: '.me-grip' });
      $$('[data-mi]', root).forEach(function (b) { b.addEventListener('click', function () {
        const it = md.items[+b.dataset.mi], f = it.ref && getFood(it.ref);
        if (!f) { toast(it.ref ? 'This food isn\'t available any more' : 'Quick adds can only be removed'); return; }
        pick = true; pickMeal = true; showServe(f, it);
      }); });
      const del = function () {
        const snap = snapshot();
        state.meals = state.meals.filter(function (x) { return x.id !== md.id; });
        mealDraft = null; save(); buzz('medium'); toast('Meal deleted', function () { restore(snap); renderFoods(); }); if (manage) done(); else showList();
      };
      if ($('#meDel', root)) $('#meDel', root).addEventListener('click', del);
      if ($('#meShare', root)) $('#meShare', root).addEventListener('click', function () { buzz('light'); shareLink('m', { name: md.name.trim() || 'Meal', items: md.items }); });
      $('#meSave', root).addEventListener('click', function () {
        const nm = md.name.trim(), err = function (m) { const x = $('#meErr', root); x.textContent = m; x.hidden = false; buzz('warn'); };
        if (!md.items.length) { if (isNew) return err('Add at least one food'); return del(); }
        if (!nm) return err('Give it a name');
        const clean = md.items.slice(0, 40).map(function (it) { const c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan; return c; });
        const real = !isNew && state.meals.find(function (x) { return x.id === md.id; });
        if (real) { real.name = nm.slice(0, 40); real.items = clean; } else state.meals.push({ id: 'm' + newId(), name: nm.slice(0, 40), items: clean });
        mealDraft = null; save(); buzz('success'); toast(real ? 'Meal saved' : 'Meal created'); if (manage) done(); else showList();
      });
    }
    // Recipe → meal: its ingredients become the meal's foods (the whole batch, or one serving's worth).
    function recipeToMeal(oneServing) {
      const k = oneServing ? 1 / (draft.servings || 1) : 1, items = [];
      draft.items.forEach(function (it) { const f = getFood(it.ref); if (!f) return; const g = Math.round(it.g * k * 10) / 10, m = macrosFor(f, g); items.push({ ref: it.ref, name: it.name || f.name, g: g, qty: Math.round(it.qty * k * 1000) / 1000, unit: it.unit, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat }); });
      if (!items.length) { toast('No ingredients to use'); return; }
      showMealEdit({ id: null, name: (draft.name || 'Recipe') + (oneServing && (draft.servings || 1) > 1 ? ' (1 serving)' : ''), items: items });
    }

    // Save an adjusted recipe onto this one entry (null = back to the saved recipe), keeping the amount eaten.
    function saveAdjust(rcv, amt) {
      const it = foodFor(d).find(function (x) { return x.id === edit.id; });
      if (!it) return closeSheet();
      const snap = snapshot();
      if (rcv) it.rc = rcv; else delete it.rc;
      if (amt && amt.qty > 0) { it.qty = Math.round(amt.qty * 1000) / 1000; it.unit = amt.unit; }
      if (root) readNote(root, it);
      const f = itemFood(it);
      if (f) {
        const u = unitsFor(f).find(function (x) { return x.label === it.unit; });
        if (u) it.g = Math.round(it.qty * u.g * 10) / 10;
        const m = macrosFor(f, it.g); Object.assign(it, { kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat });
      }
      draft = null; save(); renderAll(); closeSheet(); buzz('success');
      toast(rcv ? 'Saved for this day only' : 'Back to the saved recipe', function () { restore(snap); });
    }

    // ----- compare two foods, per serving or per 100 g -----
    function showCompare(A, fb) {
      leave();
      let basis = 'serving';
      const amt = function (f, g0) { if (g0) return g0; const lp = lastPortion(f.id), u = lp && unitsFor(f).find(function (x) { return x.label === lp.unit; }); if (u) return lp.qty * u.g; const s0 = defaultServing(f); return s0.qty * s0.unit.g; };
      const ga = amt(A.f, isNaN(A.g) ? null : A.g), gb = amt(fb, null);
      const KEYS = [['kcal', 0], ['p', 1], ['c', 0], ['fib', 1], ['sug', -1], ['f', 0], ['sat', -1], ['na', -1], ['k', 1], ['ca', 1], ['fe', 1], ['mg', 1], ['vC', 1], ['vD', 1], ['vA', 1], ['b12', 1]];
      const draw = function () {
        const xa = basis === '100' ? 100 : ga, xb = basis === '100' ? 100 : gb;
        const rows = KEYS.map(function (k) {
          const n = NUT[k[0]]; if (!n) return '';
          const a = per100(A.f, k[0]), b = per100(fb, k[0]); if (a == null && b == null) return '';
          const va = a == null ? null : a * xa / 100, vb = b == null ? null : b * xb / 100;
          const better = k[1] && va != null && vb != null && Math.abs(va - vb) > Math.max(va, vb) * 0.05 ? ((va > vb) === (k[1] > 0) ? 'a' : 'b') : '';
          return '<div class="cmp-row"><span class="cmp-v' + (better === 'a' ? ' win' : '') + '">' + (va == null ? '–' : fmtNut(va, n.unit)) + '</span><span class="cmp-l">' + esc(n.label.replace(/ \(.*\)/, '')) + '</span><span class="cmp-v' + (better === 'b' ? ' win' : '') + '">' + (vb == null ? '–' : fmtNut(vb, n.unit)) + '</span></div>';
        }).join('');
        root.innerHTML = head('Compare', true, '', true) +
          segHtml('cmpB', [['serving', 'Per serving'], ['100', 'Per 100 g']], basis) +
          '<div class="cmp-head"><button type="button" class="cmp-food" data-cf="a"><b>' + esc(A.f.name) + '</b><small>' + (basis === '100' ? '100 g' : fmtQty(Math.round(ga)) + ' g') + '</small></button><button type="button" class="cmp-food" data-cf="b"><b>' + esc(fb.name) + '</b><small>' + (basis === '100' ? '100 g' : fmtQty(Math.round(gb)) + ' g') + '</small></button></div>' +
          '<div class="card cmp-card">' + rows + '</div><p class="muted-note">Green marks the better pick for that nutrient. Tap a food to log it.</p>';
        bindSeg(root, 'cmpB', function (v) { basis = v; draw(); });
        $('#afBack', root).addEventListener('click', function () { showList(); });
        $$('[data-cf]', root).forEach(function (b) { b.addEventListener('click', function () { const f = b.dataset.cf === 'a' ? A.f : fb; comparing = null; showServe(f); }); });
      };
      draw();
    }
    // ----- paste an ingredient list into a recipe -----
    function showPaste() {
      leave();
      root.innerHTML = head('Paste ingredients', true, '', true) +
        '<p class="sheet-text">One ingredient per line, with amounts, like "200 g chicken breast" or "2 tbsp olive oil".</p>' +
        '<div class="field"><textarea class="input pa-text" id="paT" rows="7" aria-label="Ingredients" placeholder="500 g minced beef&#10;1 onion&#10;2 tbsp olive oil&#10;400 g tomatoes"></textarea></div>' +
        '<div id="paPrev"></div>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="paGo" disabled>Add to recipe</button></div>';
      const T = $('#paT', root), P = $('#paPrev', root);
      let found = [];
      const run = function () {
        const lines = T.value.split(/\n+/).map(function (l) { return l.replace(/^\s*(?:[-•*·▪]|\d+[.)])\s+/, '').replace(/\(.*?\)/g, '').split(',')[0].trim(); }).filter(Boolean);
        found = lines.length ? (parseMeal(lines.join('\n'), true) || []) : [];
        const ok = found.filter(function (x) { return x.f; });
        P.innerHTML = found.length ? '<div class="card pm-card">' + found.map(function (x) { return '<div class="pm-row' + (x.f ? '' : ' miss') + '"><span class="grow"><b>' + esc(x.part) + '</b><small>' + (x.f ? esc(x.f.name) + ' · ' + fmtAmt(x.qty, x.unit) : 'No match: add it by hand') + '</small></span>' + (x.f ? '<span class="num">' + fmtKcal(x.m.kcal) + '</span>' : '') + '</div>'; }).join('') + '</div>' : '';
        const b = $('#paGo', root); b.disabled = !ok.length; b.textContent = ok.length ? 'Add ' + ok.length + ' to recipe' : 'Add to recipe';
      };
      const go = function () { if (!foodDB) { P.innerHTML = skel(4); loadFoods().then(run, function () {}); } else run(); };
      let t2 = null; T.addEventListener('input', function () { clearTimeout(t2); t2 = setTimeout(go, 300); });
      $('#afBack', root).addEventListener('click', showRecipe);
      $('#paGo', root).addEventListener('click', function () {
        found.filter(function (x) { return x.f && !x.f.recipe; }).forEach(function (x) { draft.items.push({ ref: x.f.id, name: x.f.name.slice(0, 80), g: x.g, qty: x.qty, unit: x.unit }); });
        buzz('success'); showRecipe();
      });
    }
    // ----- recipe editor -----
    function showRecipe() {
      leave();
      if (adjust && !draft.amt) draft.amt = { qty: edit.qty || 1, unit: edit.unit || 'serving' };
      const rcFood = function () { return recipeFood({ id: draft.id || 'rnew', name: draft.name, servings: draft.servings || 1, cookedG: draft.cookedG, items: draft.items }); };
      root.innerHTML = head(adjust ? editTitle(d) : draft.id ? 'Edit recipe' : 'New recipe', adjust || manage ? 'x' : true, '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>', true) +
        '<div class="menu-src" hidden><button type="button" id="rcPaste">Paste an ingredient list</button>' + (draft.items.length ? '<button type="button" id="rcScale">Scale the recipe</button>' : '') + (draft.items.length && !adjust ? '<button type="button" id="rcMeal">Turn into a meal</button>' : '') + (manage && draft.id ? '<button type="button" id="rcShare">Share</button>' : '') + (!adjust && draft.id ? '<button type="button" class="danger" id="rcDel">Delete recipe</button>' : '') + '</div>' +
        (adjust ? '<div class="sv-name">' + esc(draft.name) + '</div><p class="muted-note adj-note">Changes this day only. To change the recipe itself, go to Foods.</p>' +
          '<div class="label faint fd-sec">How much you had</div><div class="sv-amt rc-amt"><div class="field"><input class="input" id="rcQ" inputmode="decimal" enterkeyhint="done" autocomplete="off" aria-label="Amount" value="' + fmtQty(draft.amt.qty) + '" /></div><div class="field"><select class="input" id="rcU" aria-label="Unit"></select></div></div>' : '') +
        '<div class="field"' + (adjust ? ' hidden' : '') + '><span>Name</span><input class="input" id="rcN" maxlength="60" placeholder="e.g. Lentil soup" aria-label="Recipe name" autocomplete="off" value="' + esc(draft.name || '') + '" /></div>' +
        '<div class="two"><div class="field sfx"><span>Servings</span><input class="input" id="rcS" inputmode="numeric" maxlength="3" aria-label="Servings" value="' + (draft.servings || 1) + '" /></div>' +
        '<div class="field sfx"><span>Cooked weight</span><input class="input" id="rcG" inputmode="decimal" maxlength="6" placeholder="optional" aria-label="Cooked weight in grams, optional" value="' + (draft.cookedG ? fmtQty(draft.cookedG) : '') + '" /><em>g</em></div></div>' +
        '<div class="label faint fd-sec">Ingredients</div>' +
        (draft.items.length ? '<div class="list" id="rcIngs">' + draft.items.map(function (it, i) { const f = getFood(it.ref); return '<div class="row fd-row me-row" data-ing="' + i + '" role="button" tabindex="0">' + (draft.items.length > 1 ? '<span class="cat-grip me-grip" aria-label="Drag to reorder">' + GRIP + '</span>' : '') + '<div class="grow"><div class="row-t">' + esc(it.name) + '</div><div class="row-s">' + fmtAmt(it.qty, it.unit) + (f ? ' · ' + fmtKcal(macrosFor(f, it.g).kcal) + ' kcal' : '') + '</div></div><button type="button" class="icon-btn me-rm" data-rmi="' + i + '" aria-label="Remove ' + esc(it.name) + '">' + TRASH + '</button></div>'; }).join('') + '</div>' : '') +
        (adjust ? '<button type="button" class="btn soft block" id="rcAdd" style="margin-bottom:16px">+ Add ingredient</button>' : '<div class="rc-adds"><button type="button" class="btn soft" id="rcAdd">+ Add ingredient</button><button type="button" class="btn soft" id="rcPaste2">' + PASTE_IC + 'Paste a list</button></div>') +
        (draft.items.length ? '' : '<p class="muted-note rc-hint">Got the recipe written down? Paste the ingredients, one per line (like “2 cups rice” or “500 g chicken”), and they\'re matched for you.</p>') +
        '<div class="sv-sum" id="rcSum"></div><div class="nut-drop" id="rcNuts" hidden></div><div id="rcKey"></div>' +
        '<p class="form-error" id="rcErr" hidden></p>' +
        (adjust && edit.rc ? '<button type="button" class="text-btn fd-create" id="rcReset">Use the saved recipe again</button>' : '') +
        (adjust ? notePicHtml(edit) : '') +
        '<div class="sheet-foot">' + (adjust || draft.id ? '<button type="button" class="btn primary block" id="rcSave">Save</button>'
          : '<button type="button" class="btn primary block" id="rcSave">Save recipe</button>') + '</div>';
      const N = $('#rcN', root), S = $('#rcS', root), G = $('#rcG', root);
      let rcG = 0, rcRedraw = null;
      const sync = function () {
        draft.name = N.value.trim(); const sv = parseInt(S.value, 10); draft.servings = sv >= 1 && sv <= 100 ? sv : draft.servings;
        const g = parseNum(G.value); draft.cookedG = G.value.trim() && g > 0 && g <= 50000 ? g : null;
        const f = draft.items.length ? rcFood() : null;
        let gg = f ? unitsFor(f)[0].g : 0, lbl = 'per serving';
        if (adjust && f) {
          const us = unitsFor(f), U = $('#rcU', root), Q = $('#rcQ', root), q = parseNum(Q.value);
          U.innerHTML = us.map(function (u) { return '<option value="' + esc(u.label) + '"' + (u.label === draft.amt.unit ? ' selected' : '') + '>' + esc(u.label) + (u.label === 'g' || u.label === 'oz' ? '' : ' (' + fmtQty(Math.round(u.g)) + ' g)') + '</option>'; }).join('');
          if (!us.some(function (u) { return u.label === draft.amt.unit; })) { draft.amt.unit = us[0].label; U.value = draft.amt.unit; }
          if (q > 0) draft.amt.qty = q;
          gg = draft.amt.qty * us.find(function (u) { return u.label === draft.amt.unit; }).g; lbl = 'you had';
        }
        $('#rcSum', root).innerHTML = sumBox(f ? macrosFor(f, gg) : null, lbl) + (f ? SUM_MORE : '');
        rcG = gg;
        if (rcRedraw) rcRedraw();
        $('#rcKey', root).innerHTML = f ? keyBoxes(function (k) { const v = per100(f, k); return v == null ? null : v * gg / 100; }) : '';
      };
      sync();
      rcRedraw = nutToggle($('#rcSum', root), $('#rcNuts', root), function () { const f = draft.items.length ? rcFood() : null; return f ? foodTot(f, rcG) : {}; });
      [N, S, G].forEach(function (x) { x.addEventListener('input', sync); });
      if (adjust) {
        bindNotePic(root, edit);
        $('#rcQ', root).addEventListener('input', sync);
        $('#rcU', root).addEventListener('change', function () {
          // keep about the same amount when switching between servings and grams
          const f = draft.items.length ? rcFood() : null, us = f ? unitsFor(f) : [], a = us.find(function (u) { return u.label === draft.amt.unit; }), b = us.find(function (u) { return u.label === this.value; }, this);
          if (a && b) { const g = draft.amt.qty * a.g, nq = g / b.g; draft.amt.qty = b.label === 'g' ? Math.round(nq) : Math.round(nq * 4) / 4 || Math.round(nq * 100) / 100; $('#rcQ', root).value = fmtQty(draft.amt.qty); }
          draft.amt.unit = this.value; sync();
        });
      }
      $('#afBack', root).addEventListener('click', function () { draft = null; if (adjust || manage) closeSheet(); else showList(); });
      $('#rcAdd', root).addEventListener('click', function () { sync(); pick = true; replaceAt = null; q = ''; showList(); });
      $('#rcPaste', root).addEventListener('click', function () { sync(); showPaste(); });
      if ($('#rcPaste2', root)) $('#rcPaste2', root).addEventListener('click', function () { sync(); buzz('light'); showPaste(); });
      $$('[data-rmi]', root).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); sync(); draft.items.splice(+b.dataset.rmi, 1); buzz('light'); showRecipe(); }); });
      if ($('#rcMeal', root)) $('#rcMeal', root).addEventListener('click', function () {
        sync(); const sv = draft.servings || 1;
        popMenu($('[data-more]', root), [{ label: 'Whole recipe (' + sv + ' serving' + (sv === 1 ? '' : 's') + ')', run: function () { recipeToMeal(false); } }].concat(sv > 1 ? [{ label: 'One serving', run: function () { recipeToMeal(true); } }] : []));
      });
      // Scale: make half, one and a half, double or triple (ingredients, cooked weight and servings together).
      if ($('#rcScale', root)) $('#rcScale', root).addEventListener('click', function () {
        sync();
        popMenu($('[data-more]', root), [0.5, 1.5, 2, 3].map(function (k) { return { label: (k === 0.5 ? 'Half' : k === 1.5 ? '1½ times' : k === 2 ? 'Double' : 'Triple') + ' (×' + k + ')', run: function () {
          draft.items.forEach(function (it) { it.g = Math.round(it.g * k * 10) / 10; it.qty = Math.round(it.qty * k * 1000) / 1000; });
          if (draft.cookedG) draft.cookedG = Math.round(draft.cookedG * k);
          draft.servings = Math.max(1, Math.round((draft.servings || 1) * k)); buzz('success'); showRecipe();
        } }; }));
      });
      // Drag the grip to reorder ingredients.
      const ingList = $('#rcIngs', root);
      if (ingList) dragSort(ingList, '[data-ing]', function (src, tgt, before) {
        sync(); const from = +src.dataset.ing, mv = draft.items.splice(from, 1)[0];
        let to = +tgt.dataset.ing; if (from < to) to--; if (!before) to++;
        draft.items.splice(to, 0, mv); buzz('light'); showRecipe();
      }, { handle: '.me-grip' });
      $$('[data-ing]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          sync(); const it = draft.items[+b.dataset.ing], f = getFood(it.ref);
          if (!f) { toast('This ingredient isn\'t available any more'); return; }
          pick = true; showServe(f, it);
        });
      });
      $('#rcSave', root).addEventListener('click', function () {
        sync();
        const err = function (m) { const x = $('#rcErr', root); x.textContent = m; x.hidden = false; buzz('warn'); };
        if (!draft.name) return err('Give it a name');
        const sv = parseInt(S.value, 10); if (!(sv >= 1 && sv <= 100)) return err('Servings: 1 to 100');
        if (!draft.items.length) return err('Add at least one ingredient');
        if (G.value.trim() && !draft.cookedG) return err('Check the cooked weight');
        const vals = { name: draft.name.slice(0, 60), servings: sv, cookedG: draft.cookedG ? Math.round(draft.cookedG) : null, items: draft.items.slice(0, 60).map(function (it) { return { ref: it.ref, name: it.name, g: it.g, qty: it.qty, unit: it.unit }; }) };
        if (adjust) { if (!(draft.amt.qty > 0)) return err('Enter how much you had'); return saveAdjust({ servings: sv, cookedG: vals.cookedG, items: vals.items }, draft.amt); }
        let rc = draft.id && state.recipes.find(function (x) { return x.id === draft.id; });
        const snap = rc ? snapshot() : null;
        if (rc) Object.assign(rc, vals); else { rc = Object.assign({ id: 'r' + newId() }, vals); state.recipes.push(rc); }
        const rf = snap ? refreshRefs({ [rc.id]: true }) : { logged: 0, meals: 0 };
        save(); buzz('success'); toast('Recipe saved' + refreshNote(rf), rf.logged || rf.meals ? function () { restore(snap); renderFoods(); } : null); draft = null;
        if (manage) return done();
        const f = recipeFood(rc); if (f) showServe(f, adjust ? edit : undefined); else showList();
      });
      if ($('#rcReset', root)) $('#rcReset', root).addEventListener('click', function () { saveAdjust(null, draft && draft.amt); });
      if ($('#rcShare', root)) $('#rcShare', root).addEventListener('click', function () { sync(); buzz('light'); shareLink('r', draft); });
      if ($('#rcDel', root)) $('#rcDel', root).addEventListener('click', function () {
        const snap = snapshot(), id = draft.id;
        state.recipes = state.recipes.filter(function (x) { return x.id !== id; }); state.favs = state.favs.filter(function (x) { return x !== id; });
        save(); buzz('medium'); toast('Recipe deleted. Logged entries stay.', function () { restore(snap); renderFoods(); }); draft = null; if (manage) done(); else showList();
      });
    }

    // ----- quick add: just numbers -----
    function showQuick() {
      leave();
      root.innerHTML = head('Quick add', true) +
        '<div class="field"><span>Name</span><input class="input" id="afN" maxlength="40" placeholder="Optional" aria-label="Name" autocomplete="off" /></div>' +
        '<div class="four-in">' +
          '<div class="field sfx"><span>Calories</span><input class="input" id="afK" inputmode="numeric" maxlength="5" placeholder="0" aria-label="Calories" autocomplete="off" /><em>kcal</em></div>' +
          '<div class="field sfx"><span>Protein</span><input class="input" id="afP" inputmode="numeric" maxlength="3" placeholder="0" aria-label="Protein" autocomplete="off" /><em>g</em></div>' +
          '<div class="field sfx"><span>Carbs</span><input class="input" id="afC" inputmode="numeric" maxlength="3" placeholder="0" aria-label="Carbs" autocomplete="off" /><em>g</em></div>' +
          '<div class="field sfx"><span>Fat</span><input class="input" id="afF" inputmode="numeric" maxlength="3" placeholder="0" aria-label="Fat" autocomplete="off" /><em>g</em></div>' +
        '</div><p class="form-error" id="afErr" hidden></p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="afAdd">Add to <span id="afMealName"></span></button></div>';
      const N = $('#afN', root), K = $('#afK', root), P = $('#afP', root), C = $('#afC', root), F = $('#afF', root);
      const syncMeal = function () { $('#afMealName', root).textContent = mealName(ml); };
      syncMeal(); bindMeal(syncMeal);
      $('#afBack', root).addEventListener('click', showList);
      const err = function (m) { const x = $('#afErr', root); x.textContent = m; x.hidden = !m; if (m) buzz('warn'); };
      const num = function (el, max) { const v = el.value.trim(); if (!v) return 0; const n = parseNum(v); return isNaN(n) || n < 0 || n > max ? NaN : Math.round(n); };
      $('#afAdd', root).addEventListener('click', function () {
        const k = parseNum(K.value), pr = num(P, 300), cb = num(C, 600), ft = num(F, 300);
        if (isNaN(k) || k < 1 || k > 5000) return err('Enter calories between 1 and 5,000');
        if (isNaN(pr) || isNaN(cb) || isNaN(ft)) return err('Check the protein, carbs and fat');
        err(''); const snap = snapshot();
        addItems(d, [{ id: newId(), kcal: Math.round(k), protein: pr, carbs: cb, fat: ft, name: N.value.trim(), meal: ml }]);
        logged('Added to ' + mealName(ml), snap); refreshHead();
        [N, K, P, C, F].forEach(function (x) { x.value = ''; });
      });
      [N, K, P, C, F].forEach(function (x) { x.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#afAdd', root).click(); } }); });
      if (window.matchMedia('(hover: hover)').matches) K.focus();
    }

    // ----- create / edit one of My foods (values per serving) -----
    function showCreate(c, name, fromFood, code) {
      leave();
      root.innerHTML = head(c ? 'Edit food' : 'New food', manage ? 'x' : true, c ? '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>' : '', true) + (c ? '<div class="menu-src" hidden><button type="button" class="danger" id="cfDel">Delete food</button></div>' : '') +
        '<button type="button" class="btn soft block lb-scan" id="cfScan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M8 9h8M8 12h8M8 15h5"/></svg>Scan a nutrition label</button><input type="file" id="cfImg" accept="image/*" hidden />' +
        '<div class="field"><span>Name</span><input class="input" id="cfN" maxlength="60" placeholder="e.g. Protein bar" aria-label="Name" autocomplete="off" value="' + esc(c ? c.name : name || '') + '" /></div>' +
        '<div class="two"><div class="field"><span>Serving</span><input class="input" id="cfU" maxlength="30" placeholder="serving" aria-label="Serving name, like slice or bowl" autocomplete="off" value="' + esc(c ? c.unit : '') + '" /></div>' +
        '<div class="field sfx"><span>Weight</span><input class="input" id="cfG" inputmode="decimal" maxlength="6" placeholder="optional" aria-label="Serving weight in grams, optional" autocomplete="off" value="' + (c && c.g ? fmtQty(c.g) : '') + '" /><em>g</em></div></div>' +
        '<div class="form-sec">Nutrition per serving' + ((c && c.code) || code ? ' <small>· barcode ' + esc((c && c.code) || code) + '</small>' : '') + '</div>' +
        '<div class="four-in">' +
          '<div class="field sfx"><span>Calories</span><input class="input" id="cfK" inputmode="numeric" maxlength="5" placeholder="0" aria-label="Calories" autocomplete="off" value="' + (c ? c.kcal : '') + '" /><em>kcal</em></div>' +
          '<div class="field sfx"><span>Protein</span><input class="input" id="cfP" inputmode="decimal" maxlength="5" placeholder="0" aria-label="Protein" autocomplete="off" value="' + (c ? c.p : '') + '" /><em>g</em></div>' +
          '<div class="field sfx"><span>Carbs</span><input class="input" id="cfC" inputmode="decimal" maxlength="5" placeholder="0" aria-label="Carbs" autocomplete="off" value="' + (c ? c.c : '') + '" /><em>g</em></div>' +
          '<div class="field sfx"><span>Fat</span><input class="input" id="cfF" inputmode="decimal" maxlength="5" placeholder="0" aria-label="Fat" autocomplete="off" value="' + (c ? c.f : '') + '" /><em>g</em></div>' +
        '</div>' +
        '<div class="odd-hint" id="cfOdd" hidden><span id="cfOddT"></span><div><button type="button" class="text-btn" id="cfOddUse"></button><button type="button" class="text-btn" id="cfOddOk">It\'s correct</button></div></div>' +
        '<button type="button" class="text-btn sv-more" id="cfMore">' + (c && c.n && Object.keys(c.n).length ? 'Hide' : 'More from the label') + '</button>' +
        '<div class="four-in" id="cfExtra"' + (c && c.n && Object.keys(c.n).length ? '' : ' hidden') + '>' + LABEL_NUTS.map(function (x) { return '<div class="field sfx"><span>' + x[1] + '</span><input class="input" id="cfx_' + x[0] + '" inputmode="decimal" maxlength="6" placeholder="0" aria-label="' + x[1] + '" autocomplete="off" value="' + (c && c.n && c.n[x[0]] != null ? c.n[x[0]] : '') + '" /><em>' + x[2] + '</em></div>'; }).join('') + '</div>' +
        '<p class="form-error" id="cfErr" hidden></p>' +
        '<div class="sheet-foot">' + (c ? '<button type="button" class="btn primary block" id="cfSave">Save</button>'
          : '<button type="button" class="btn primary block" id="cfSave">Save food</button>') + '</div>';
      $('#afBack', root).addEventListener('click', function () { if (manage) closeSheet(); else if (fromFood) showServe(customFood(c)); else showList(); });
      $('#cfScan', root).addEventListener('click', function () { $('#cfImg', root).click(); });
      $('#cfImg', root).addEventListener('change', function () { const file = this.files && this.files[0]; this.value = ''; if (file) readLabel(file, root); });
      $('#cfMore', root).addEventListener('click', function () { const x = $('#cfExtra', root); x.hidden = !x.hidden; this.textContent = x.hidden ? 'More from the label' : 'Hide'; buzz('light'); });
      const err = function (m) { const x = $('#cfErr', root); x.textContent = m; x.hidden = !m; if (m) buzz('warn'); };
      const num = function (id, max) { const v = $('#' + id, root).value.trim(); if (!v) return 0; const n = parseNum(v); return isNaN(n) || n < 0 || n > max ? NaN : Math.round(n * 10) / 10; };
      let okFlag = !!(c && c.ok);
      const oddCheck = function () {
        const v = function (id) { const x = parseNum($('#' + id, root).value || '0'); return isNaN(x) ? 0 : x; };
        const k = v('cfK'), est = Math.round(4 * v('cfP') + 4 * v('cfC') + 9 * v('cfF')), odd = $('#cfK', root).value.trim() && oddMacros(k, v('cfP'), v('cfC'), v('cfF'));
        $('#cfOdd', root).hidden = !odd || okFlag;
        if (odd) { $('#cfOddT', root).textContent = 'These macros add up to about ' + est + ' kcal, not ' + Math.round(k) + '.'; $('#cfOddUse', root).textContent = 'Use ' + est + ' kcal'; $('#cfOddUse', root).dataset.v = est; }
      };
      ['cfK', 'cfP', 'cfC', 'cfF'].forEach(function (id) { $('#' + id, root).addEventListener('input', function () { okFlag = false; oddCheck(); }); });
      $('#cfOddUse', root).addEventListener('click', function () { $('#cfK', root).value = this.dataset.v; buzz('light'); oddCheck(); });
      $('#cfOddOk', root).addEventListener('click', function () { okFlag = true; buzz('light'); oddCheck(); });
      oddCheck();
      $('#cfSave', root).addEventListener('click', function () {
        const nm = $('#cfN', root).value.trim(), k = parseNum($('#cfK', root).value), gv = $('#cfG', root).value.trim(), g = gv ? parseNum(gv) : null;
        const p = num('cfP', 1000), cb = num('cfC', 1000), ft = num('cfF', 1000);
        if (!nm) return err('Give it a name');
        if (isNaN(k) || k < 0 || k > 10000) return err('Enter the calories per serving');
        if (gv && (isNaN(g) || g <= 0 || g > 5000)) return err('Check the weight');
        if (isNaN(p) || isNaN(cb) || isNaN(ft)) return err('Check the protein, carbs and fat');
        const extra = {}; let bad = false;
        LABEL_NUTS.forEach(function (x) { const v = $('#cfx_' + x[0], root).value.trim(); if (!v) return; const n = parseNum(v); if (isNaN(n) || n < 0 || n > 100000) bad = true; else extra[x[0]] = Math.round(n * 100) / 100; });
        if (bad) return err('Check the extra nutrients');
        const vals = { name: nm.slice(0, 60), unit: ($('#cfU', root).value.trim() || 'serving').slice(0, 30), g: g ? Math.round(g * 10) / 10 : null, kcal: Math.round(k), p: p, c: cb, f: ft, n: extra, ok: okFlag && oddMacros(k, p, cb, ft) ? true : undefined };
        if (code) vals.code = code;
        const snap = c ? snapshot() : null;
        if (c) Object.assign(c, vals); else { c = Object.assign({ id: 'c' + newId() }, vals); state.myFoods.push(c); }
        const rf = snap ? refreshRefs({ [c.id]: true }) : { logged: 0, meals: 0 };
        save(); buzz('success'); toast((fromFood || manage ? 'Food saved' : 'Saved to My foods') + refreshNote(rf), rf.logged || rf.meals ? function () { restore(snap); renderFoods(); } : null);
        if (manage) done(); else showServe(customFood(c));
      });
      if ($('#cfDel', root)) $('#cfDel', root).addEventListener('click', function () {
        const snap = snapshot(), id = c.id;
        state.myFoods = state.myFoods.filter(function (x) { return x.id !== id; });
        state.favs = state.favs.filter(function (x) { return x !== id; });
        save(); buzz('medium'); toast('Food deleted. Logged entries stay.', function () { restore(snap); renderFoods(); });
        if (manage) done(); else showList();
      });
    }

    openSheet('<div id="afRoot"></div>', function (body) {
      sheet.classList.add('tall');
      root = $('#afRoot', body);
      if (edit && !foodDB && itemNeedsDB(edit)) {
        root.innerHTML = head('Edit food', 'x') + skel(4);
        $('#afBack', root).addEventListener('click', function () { closeSheet(); });
        loadFoods().then(function () { const f = itemFood(edit); if (root.isConnected) { if (f && adjust) { draft = adjustDraft(); showRecipe(); } else if (f) showServe(f, edit); else { closeSheet(); toast('This food isn\'t in the list any more'); } } },
          function () { if (root.isConnected) root.innerHTML = head('Edit food', 'x') + '<p class="muted-note fd-empty">Couldn\'t load the food list. Check your connection.</p>'; });
      } else if (manage) {
        // Recipes made from the food list need it loaded first.
        const go = function () {
          if (manage.kind === 'repeat') showList();
          else if (manage.kind === 'food') showCreate(manage.item ? state.myFoods.find(function (x) { return x.id === manage.item; }) : null, '');
          else if (manage.kind === 'meal') showMealEdit(manage.item ? state.meals.find(function (x) { return x.id === manage.item; }) : { id: null, name: '', items: [] });
          else { draft = manage.item ? JSON.parse(JSON.stringify(state.recipes.find(function (x) { return x.id === manage.item; }))) : { name: '', servings: 1, cookedG: null, items: [] }; showRecipe(); if (manage.paste) showPaste(); }
        };
        if (manage.kind === 'recipe' && manage.item && !foodDB && needsDB(manage.item)) {
          root.innerHTML = head('Edit recipe', 'x', '', true) + skel(4);
          $('#afBack', root).addEventListener('click', closeSheet);
          loadFoods().then(function () { if (root.isConnected) go(); }, function () { if (root.isConnected) root.innerHTML = head('Edit recipe', 'x', '', true) + '<p class="muted-note fd-empty">Couldn\'t load the food list. Check your connection.</p>'; });
        } else go();
      } else if (edit && edit.mid) {
        const sm = state.meals.find(function (x) { return x.id === edit.mid; });
        mealAdj = true; showMealEdit({ id: edit.mid, name: edit.name, items: edit.mi || (sm ? sm.items : []) });
      } else if (adjust) { draft = adjustDraft(); showRecipe(); }
      else if (edit) showServe(itemFood(edit), edit);
      else if (startFood) showServe(startFood);
      else if (startScan) showScan();
      else { showList(); }
    }, function () { sheet.classList.remove('tall'); leave(); });
  }

