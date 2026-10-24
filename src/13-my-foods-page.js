  // You → My foods: edit or delete your own foods, recipes and meals.
  // Foods tab, laid out like Cronometer: a card each for Meals, Recipes and Foods (tap to open the list, or create one),
  // then insights from your diary at the bottom.
  let foodsView = null, foodsSearch = false, fvSnap = ''; // fvSnap: the Foods page behind an open list (shown while swiping back)
  const MF_IC = {
    log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/><path d="M12 8v4l3 2"/></svg>',
    kcal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.5 1 2.5 2 3 .5-3-.5-5.5.5-8z"/></svg>',
    p: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11M4 9l5-5M15 20l5-5M3 12l3-3M12 21l-3 3M18 6l3-3"/></svg>',
    hi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4M11 8v6M8 11h6"/></svg>'
  };
  // Foods → Meal planner: a whole day of meals built for your targets.
  function forDayHtml() {
    const pl = makePlan(activeEnergy());
    const CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M8 14h4M8 17h7"/></svg>';
    return '<div class="group-label mf-ins-l">For your day</div>' +
      '<button type="button" class="card fd-plan" data-plan-day><span class="ico ic-c-green">' + CAL + '</span><span class="grow"><b>Meal planner</b><small>' +
      (!pl ? 'Set your targets to plan a day' : 'A full day of meals for ' + fmtKcal(roundKcal(pl.target)) + ' kcal') +
      '</small></span>' + CHEV + '</button>';
  }
  function renderFoods() {
    const box = $('#foodsBox'); if (!box || state.ui.tab !== 'foods') return;
    const byName = function (a, b) { return a.name.localeCompare(b.name); };
    const sw = $('#mfSearchWrap'); if (sw) sw.hidden = !(foodsSearch || foodsView);
    $('#mfHead').innerHTML = ''; $('#panel-foods .page-head').hidden = !!foodsView;
    const sb = $('#mfSearchBtn'); if (sb) { sb.hidden = !!foodsView; sb.setAttribute('aria-pressed', foodsSearch); }
    // Each row: a picture for the kind of food, the name, a small protein/carbs/fat bar with its serving, and the calories.
    const fq = normText(($('#mfQ') || {}).value || '').trim();
    const row = function (kind, id, t, sub, kc, m) {
      if (fq && normText(t).indexOf(fq) < 0) return '';
      const ic = kind === 'food' ? (ftGuess(t, '') || 'mine') : kind;
      return '<button type="button" class="row mf-row" data-mf="' + kind + '" data-id="' + id + '">' + ftIcon(ic) + '<div class="grow"><div class="row-t">' + esc(t) + '</div><div class="row-s mf-sub">' + (m ? mealMacros(m) : '') + '<span class="mf-s">' + sub + '</span></div></div>' + (kc != null ? '<span class="row-v num mf-k">' + fmtKcal(kc) + '<small>kcal</small></span>' : CHEV) + '</button>';
    };
    const ADD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12M12 6v12"/></svg>';
    const lists = {
      food: function () { return state.myFoods.slice().sort(function (a, b) { const oa = !a.ok && oddMacros(a.kcal, a.p, a.c, a.f), ob = !b.ok && oddMacros(b.kcal, b.p, b.c, b.f); return (ob ? 1 : 0) - (oa ? 1 : 0) || byName(a, b); }).map(function (c) { return row('food', c.id, c.name, '1 ' + esc(c.unit) + (c.g ? ' (' + fmtQty(c.g) + ' g)' : '') + (!c.ok && oddMacros(c.kcal, c.p, c.c, c.f) ? ' · <span class="odd-tag">Check numbers</span>' : ''), c.kcal, { p: c.p, c: c.c, f: c.f }); }); },
      recipe: function () {
        if (!foodDB && state.recipes.some(function (rc) { return needsDB(rc.id); })) loadFoods().then(renderFoods, function () {});
        return state.recipes.slice().sort(byName).map(function (rc) { const f = foodDB || !needsDB(rc.id) ? recipeFood(rc) : null, mm = f ? macrosFor(f, unitsFor(f)[0].g) : null; return row('recipe', rc.id, rc.name, rc.items.length + ' ingredient' + (rc.items.length === 1 ? '' : 's') + ' · per serving', mm ? mm.kcal : null, mm ? { p: mm.protein, c: mm.carbs, f: mm.fat } : null); });
      },
      meal: function () { return state.meals.slice().sort(byName).map(function (m) { const k = m.items.reduce(function (a, f) { return a + f.kcal; }, 0); const t = m.items.reduce(function (a, x) { a.p += x.protein || 0; a.c += x.carbs || 0; a.f += x.fat || 0; return a; }, { p: 0, c: 0, f: 0 }); return row('meal', m.id, m.name, m.items.length + ' food' + (m.items.length === 1 ? '' : 's'), k, t); }); }
    };
    const TITLE = { meal: 'Meals', recipe: 'Recipes', food: 'Your foods', repeat: 'Repeat items' };
    const notes = function () {
      let h = '';
      const dupN = dupGroups().length;
      if (dupN) h += '<button type="button" class="text-btn odd-note dup-note" data-action="dups">' + dupN + (dupN === 1 ? ' food looks' : ' foods look') + ' like a copy of another. Review ›</button>';
      const oddN = state.myFoods.filter(function (c) { return !c.ok && oddMacros(c.kcal, c.p, c.c, c.f); }).length;
      if (oddN) h += '<p class="muted-note odd-note">' + oddN + (oddN === 1 ? ' food has' : ' foods have') + ' calories that don\'t match the protein, carbs and fat. Tap to check.</p>';
      return h;
    };
    // One list (after tapping a card).
    if (foodsView === 'repeat') {
      $('#mfHead').innerHTML = '<div class="mf-lhead"><button type="button" class="back-btn" data-mf-back aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><h2>Repeat items</h2><button type="button" class="mf-add" data-mf="repeat">' + ADD + 'New</button></div>';
      const rl = repeatListHtml(fq); repSug = rl.sug;
      box.innerHTML = rl.html || '<p class="muted-note fd-empty">Nothing here matches “' + esc(($('#mfQ') || {}).value || '') + '”.</p>';
      return;
    }
    if (foodsView) {
      const k = foodsView, all = lists[k](), vis = all.filter(Boolean);
      const EMPTY = { meal: 'No meals yet. Build one, or save one from ⋯ on a meal in your Diary.', recipe: 'No recipes yet. Build one from ingredients and it works out each serving.', food: 'No foods of your own yet. Add one from its label, or anything that isn\'t in the list.' };
      $('#mfHead').innerHTML = '<div class="mf-lhead"><button type="button" class="back-btn" data-mf-back aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><h2>' + TITLE[k] + '</h2>' + (k === 'recipe' ? '<button type="button" class="mf-add mf-paste" data-mf-paste>Paste</button>' : '') + '<button type="button" class="mf-add" data-mf="' + k + '">' + ADD + 'New</button></div>';
      box.innerHTML = (k === 'food' ? notes() : '') +
        (vis.length ? '<div class="list">' + vis.join('') + '</div>' : fq && all.length ? '<p class="muted-note fd-empty">Nothing here matches “' + esc(($('#mfQ') || {}).value || '') + '”.</p>' : '<p class="muted-note fd-empty">' + EMPTY[k] + '</p>');
      return;
    }
    // Searching from the main page: results from all three.
    if (fq) {
      let html = '';
      ['meal', 'recipe', 'food'].forEach(function (k) { const vis = lists[k]().filter(Boolean); if (vis.length) html += '<div class="group-label">' + TITLE[k] + '</div><div class="list">' + vis.join('') + '</div>'; });
      box.innerHTML = html || '<p class="muted-note fd-empty">Nothing here matches “' + esc(($('#mfQ') || {}).value || '') + '”.</p>';
      return;
    }
    const n = { meal: state.meals.length, recipe: state.recipes.length, food: state.myFoods.length, repeat: state.repeats.length };
    // Four tiles: tap one to open its list, + to make a new one. A short line says what it's for until you have some.
    const TAG = { meal: 'Log a whole meal in one tap', recipe: 'Works out each serving', food: 'Straight from a label', repeat: 'Added for you each day' };
    const UNIT = { meal: ['meal', 'meals'], recipe: ['recipe', 'recipes'], food: ['food', 'foods'], repeat: ['item', 'items'] };
    const tile = function (k, title) {
      return '<div class="mf-tile" role="button" tabindex="0" data-mf-open="' + k + '"><div class="mf-t-top">' + (k === 'repeat' ? '<span class="ft-ico rp-ic">' + REP_IC + '</span>' : ftIcon(k === 'food' ? 'mine' : k)) +
        '<button type="button" class="mf-t-add" data-mf="' + k + '" aria-label="New">' + ADD + '</button></div><div class="mf-t-t">' + title + '</div><div class="mf-t-s">' + (n[k] ? n[k] + ' ' + UNIT[k][n[k] === 1 ? 0 : 1] : TAG[k]) + '</div></div>';
    };
    box.innerHTML = (state.myFoods.length ? notes() : '') +
      '<div class="mf-grid">' + tile('meal', 'Meals') + tile('recipe', 'Recipes') + tile('food', 'Your foods') + tile('repeat', 'Repeat items') + '</div>' +
      forDayHtml();
  }
  $('#mfQ').addEventListener('input', function () { renderFoods(); });
  let repSug = [];
  function mfClick(e) {
    const rp = e.target.closest('[data-rep]');
    if (rp) { const r = state.repeats.find(function (x) { return x.id === rp.dataset.rep; }); if (r) { buzz('light'); repeatSheet(r); } return; }
    const ra = e.target.closest('[data-rep-all]');
    if (ra) { buzz('light'); if (ra.dataset.repAll === 'resume') { const snap = snapshot(); state.repeats.forEach(function (r) { r.paused = false; r.until = null; r.u = Date.now(); }); applyRepeats(); save(); renderAll(); toast('Repeat items resumed', function () { restore(snap); }); } else pauseAllSheet(); return; }
    const rs = e.target.closest('[data-rsug]');
    if (rs) { const sg = repSug[+rs.dataset.rsug]; if (sg) { buzz('light'); repeatSheet({ item: repItemCopy(sg.item), meal: sg.meal, days: [] }); } return; }
    const b = e.target.closest('[data-mf]');
    if (b) { buzz('light'); addFoodSheet(null, null, null, null, false, { kind: b.dataset.mf, item: b.dataset.id || null }); return; }
    if (e.target.closest('[data-mf-paste]')) { buzz('light'); addFoodSheet(null, null, null, null, false, { kind: 'recipe', paste: true }); return; }
    if (e.target.closest('[data-mf-back]')) { buzz('light'); pageMove('pop', function () { if (foodsView) navDrop('fv'); foodsView = null; $('#mfQ').value = ''; renderFoods(); }); return; }
    const o = e.target.closest('[data-mf-open]');
    if (o) { buzz('light'); pageMove('push', function () { if (!foodsView) { fvSnap = $('#foodsBox').innerHTML; navPush('fv'); } foodsView = o.dataset.mfOpen; foodsSearch = false; $('#mfQ').value = ''; renderFoods(); }); }
  }
  $('#foodsBox').addEventListener('click', mfClick); $('#mfHead').addEventListener('click', mfClick);
  $('#mfSearchBtn').addEventListener('click', function () { foodsSearch = !foodsSearch; buzz('light'); if (!foodsSearch) $('#mfQ').value = ''; renderFoods(); if (foodsSearch) $('#mfQ').focus(); });

  // A logged food with actions behind it: swipe right for ⋯, then Copy, Adjust (recipes) and Delete.
  const COPY_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
  const ADJ_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';
  function swRow(f, rowHtml, delOnly) {
    const act = function (k, cls, ic, label) { return '<button type="button" class="sw-btn ' + cls + '" data-sw-act="' + k + '" data-id="' + f.id + '" tabindex="-1">' + ic + '<span>' + label + '</span></button>'; };
    return '<div class="sw" data-sw="' + f.id + '"' + (delOnly ? ' data-nodrag' : '') + '><div class="sw-acts">' + act('del', 'sw-del', TRASH, 'Delete') + '</div>' + rowHtml + '</div>';
  }
  // Tap the calories on a logged food: ½×, ¾×, 1¼×, 1½× or 2× without opening it.
  function scaleItem(it, k) {
    const r1 = function (v) { return Math.round(v * 10) / 10; };
    if (it.ref) {
      const f = itemFood(it); if (!f) return false;
      it.qty = Math.round(it.qty * k * 1000) / 1000; it.g = r1(it.g * k);
      const m = macrosFor(f, it.g); Object.assign(it, { kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat });
      return true;
    }
    it.kcal = Math.min(10000, Math.round(it.kcal * k)); it.protein = Math.round(it.protein * k); it.carbs = Math.round(it.carbs * k); it.fat = Math.round(it.fat * k);
    if (it.n) Object.keys(it.n).forEach(function (x) { it.n[x] = Math.round(it.n[x] * k * 1000) / 1000; });
    if (it.mi) it.mi.forEach(function (x) { if (x.ref) { x.qty = Math.round(x.qty * k * 1000) / 1000; x.g = r1(x.g * k); } x.kcal = Math.round(x.kcal * k); x.protein = Math.round(x.protein * k); x.carbs = Math.round(x.carbs * k); x.fat = Math.round(x.fat * k); });
    return true;
  }
  function quickAmount(anchor, id) {
    const d = viewDay, it = foodFor(d).find(function (x) { return x.id === id; }); if (!it) return;
    buzz('light');
    const opt = function (k, label) { return { label: label + ' · ' + fmtKcal(Math.round(it.kcal * k)) + ' kcal', run: function () { const snap = snapshot(); if (!scaleItem(it, k)) { toast('Open it to change the amount'); return; } save(); renderAll(); toast('Amount changed', function () { restore(snap); }); } }; };
    popMenu(anchor, [opt(0.5, '½×'), opt(0.75, '¾×'), opt(1.25, '1¼×'), opt(1.5, '1½×'), opt(2, '2×'), { label: 'Other amount…', run: function () { foodItemSheet(id, d); } }]);
  }
  function removeFoodItem(id, date) {
    const d = date || viewDay, snap = snapshot(), f = foodFor(d).find(function (x) { return x.id === id; });
    if (!f) return;
    state.food[d] = foodFor(d).filter(function (x) { return x.id !== id; });
    if (!state.food[d].length) delete state.food[d];
    save(); renderAll(); buzz('medium'); toast('Removed ' + (f.name || 'food'), function () { restore(snap); });
  }
  // Hold a logged food (without dragging): its shortcuts in one place.
  function quickSheet(id, date) {
    const d = date || viewDay, it = foodFor(d).find(function (x) { return x.id === id; }); if (!it) return;
    const fav = it.ref && isFav(it.ref), sub = (it.ref ? fmtAmt(it.qty, it.unit) + ' · ' : '') + fmtKcal(it.kcal) + ' kcal';
    const r = function (k, ic, t, cls) { return '<button type="button" class="row qs-row' + (cls ? ' ' + cls : '') + '" data-qs="' + k + '"><span class="qs-ic">' + ic + '</span><div class="grow row-t">' + t + '</div></button>'; };
    openSheet('<div class="sheet-head qs-head">' + diaryIcon(it) + '<div class="grow" style="min-width:0"><h2 class="sheet-title" id="sheetTitle">' + esc(it.name || 'Quick add') + '</h2><div class="label faint">' + esc(sub) + ' · ' + esc(mealName(mealOf(it))) + '</div></div></div>' +
      '<div class="list">' +
        (it.plan && d <= todayISO() ? r('eat', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>', 'Mark as eaten') : '') +
        r('dup', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>', 'Add another') +
        r('time', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>', 'Change time' + (it.t ? ' <span class="qs-v">' + esc(fmtHM(it.t)) + '</span>' : '')) +
        r('copy', COPY_IC, 'Copy to another day') +
        r('rep', REP_IC, it.rep && state.repeats.some(function (x) { return x.id === it.rep; }) ? 'Edit repeat' : 'Repeat this') +
        (it.ref ? r('fav', STAR(fav), fav ? 'Remove from favorites' : 'Add to favorites') : '') +
      '</div>' +
      '<div class="label faint fd-sec">Move to</div><div class="qs-meals">' + MEALS.filter(function (m) { return m[0] !== mealOf(it); }).map(function (m) { return '<button type="button" data-qm="' + m[0] + '">' + mealIcon(m[0]) + '<span>' + esc(m[1]) + '</span></button>'; }).join('') + '</div>' +
      '<div class="list" style="margin-top:14px">' + r('del', TRASH, it.rep ? 'Skip today <span class="qs-v">Only this day; it repeats as usual</span>' : 'Delete', 'danger') + '</div>', function (body) {
      $$('[data-qs]', body).forEach(function (b) { b.addEventListener('click', function () {
        const k = b.dataset.qs; closeSheet();
        if (k === 'time') setTimeout(function () { timeSheet(id, d); }, 260);
        else if (k === 'copy') setTimeout(function () { copyItemSheet(id, d); }, 260);
        else if (k === 'rep') setTimeout(function () { const ex = it.rep && state.repeats.find(function (x) { return x.id === it.rep; }); repeatSheet(ex || { item: repItemCopy(it), meal: mealOf(it), days: [] }); }, 260);
        else if (k === 'del') removeFoodItem(id, d);
        else if (k === 'dup') { const snap = snapshot(), c = Object.assign({}, it, { id: newId() }); delete c.u; delete c.pic; addItems(d, [c]); save(); renderAll(); buzz('success'); toast('Added another ' + (it.name || 'food'), function () { restore(snap); }); }
        else if (k === 'eat') { const snap = snapshot(); delete it.plan; if (d === todayISO()) it.t = nowHM(); save(); renderAll(); eatenFlash(it.id); buzz('success'); toast('Marked as eaten', function () { restore(snap); }); }
        else if (k === 'fav') { if (fav) state.favs = state.favs.filter(function (x) { return x !== it.ref; }); else state.favs.unshift(it.ref); save(); buzz('light'); toast(fav ? 'Removed from favorites' : 'Added to favorites'); }
      }); });
      $$('[data-qm]', body).forEach(function (b) { b.addEventListener('click', function () {
        const snap = snapshot(); it.meal = b.dataset.qm; closeSheet(); save(); renderAll(); buzz('success'); toast('Moved to ' + mealName(it.meal), function () { restore(snap); });
      }); });
    });
  }
  // When you ate it (from the hold menu).
  function timeSheet(id, date) {
    const d = date || viewDay, it = foodFor(d).find(function (x) { return x.id === id; }); if (!it) return;
    openSheet('<div class="sheet-head"><div class="grow" style="min-width:0"><div class="label faint">' + esc(it.name || 'Quick add') + '</div><h2 class="sheet-title" id="sheetTitle">Change time</h2></div></div>' +
      '<div class="field"><input class="input tm-in" type="time" id="tmT" value="' + (it.t || nowHM()) + '" aria-label="Time eaten" /></div>' +
      '<div class="tm-chips"><button type="button" data-tm="now">Now</button>' + (it.t ? '<button type="button" data-tm="clear">No time</button>' : '') + '</div>' +
      '<div class="sheet-foot"><button type="button" class="btn primary block" id="tmSave">Save</button></div>', function (root) {
      const T = $('#tmT', root);
      $$('[data-tm]', root).forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.tm === 'now') T.value = nowHM(); else T.value = ''; buzz('light'); }); });
      $('#tmSave', root).addEventListener('click', function () {
        const snap = snapshot(), v = T.value;
        if (/^\d\d:\d\d$/.test(v)) it.t = v; else delete it.t;
        save(); renderAll(); closeSheet(); buzz('success'); toast(it.t ? 'Time set to ' + fmtHM(it.t) : 'Time removed', function () { restore(snap); });
      });
    });
  }
  // Copy one logged food: to today/tomorrow or any day, into whichever meal.
  function copyItemSheet(id, date) {
    const d = date || viewDay, f = foodFor(d).find(function (x) { return x.id === id; });
    if (!f) return;
    const today = todayISO(), other = d === today ? isoFromDay(dayNum(today) + 1) : today;
    let ml = f.meal;
    openSheet('<div class="sheet-head"><div class="grow" style="min-width:0"><div class="label faint">' + esc(f.name || 'Quick add') + ' · ' + fmtKcal(f.kcal) + ' kcal</div><h2 class="sheet-title" id="sheetTitle">Copy to</h2></div></div>' +
      '<div class="field"><span>Meal</span><select class="input" id="ciMeal" aria-label="Meal">' + MEALS.map(function (m) { return '<option value="' + m[0] + '"' + (m[0] === ml ? ' selected' : '') + '>' + m[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="list">' +
        '<button type="button" class="row" data-ci="' + d + '"><div class="grow row-t">' + esc(relDate(d)) + ' <span class="faint">(again)</span></div>' + CHEV + '</button>' +
        '<button type="button" class="row" data-ci="' + other + '"><div class="grow row-t">' + esc(relDate(other)) + '</div>' + CHEV + '</button>' +
        '<label class="row" style="position:relative"><div class="grow row-t">Another day</div>' + CHEV + '<input type="date" id="ciPick" aria-label="Copy to another day" style="position:absolute;inset:0;opacity:0;width:100%;height:100%;border:0" /></label>' +
      '</div>',
      function (root) {
        const go = function (to) { if (!/^\d{4}-\d{2}-\d{2}$/.test(to)) return; closeSheet(); copyFood([Object.assign({}, f, { meal: ml })], to, 'Copied to ' + relDate(to)); };
        $('#ciMeal', root).addEventListener('change', function () { ml = this.value; buzz('light'); });
        $$('[data-ci]', root).forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.ci); }); });
        $('#ciPick', root).addEventListener('change', function () { go(this.value); });
      });
  }
  // Copy foods to a day (new ids, same meals).
  function copyFood(items, to, label) {
    if (!items.length) return;
    const snap = snapshot();
    addItems(to, items.map(function (it) { return Object.assign({}, it, { id: newId() }); }));
    save(); renderAll(); buzz('success');
    toast((label || 'Copied') + ' · ' + items.length + (items.length === 1 ? ' food' : ' foods'), function () { restore(snap); });
  }
  // A tidy picture of a day (for a coach or a friend): totals, macros and every food by meal.
  function shareDay(d) {
    const its = eatenFor(d), tt = dayTotals(d), pl = dayPlan(d), W = 1080, pad = 72, cs = getComputedStyle(document.documentElement);
    const col = function (v, fb) { return (cs.getPropertyValue(v) || '').trim() || fb; };
    const groups = MEALS.map(function (m) { return { n: m[1], items: its.filter(function (f) { return mealOf(f) === m[0] && !isDailyTotal(f); }) }; }).filter(function (g) { return g.items.length; });
    const H = 520 + groups.reduce(function (a, g) { return a + 74 + g.items.length * 58; }, 0) + 90;
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const font = function (w, s) { x.font = w + ' ' + s + 'px Figtree, system-ui, sans-serif'; };
    x.fillStyle = '#f3f4f6'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect ? x.roundRect(36, 36, W - 72, H - 72, 44) : x.rect(36, 36, W - 72, H - 72); x.fill();
    x.fillStyle = '#9ba1ac'; font('600', 34); x.fillText(fmtDate(d, { weekday: 'long', month: 'long', day: 'numeric' }), pad, 130);
    x.fillStyle = '#111318'; font('800', 96); x.fillText(fmtKcal(tt.kcal), pad, 245); const kw = x.measureText(fmtKcal(tt.kcal)).width;
    x.fillStyle = '#5f6673'; font('600', 40); x.fillText('kcal' + (pl ? ' of ' + fmtKcal(roundKcal(pl.target)) : ''), pad + kw + 18, 245);
    const mac = [['Protein', tt.protein, pl && pl.protein, col('--mp', '#2f9e6e')], ['Carbs', tt.carbs, pl && pl.carbs, col('--mc', '#3d84c6')], ['Fat', tt.fat, pl && pl.fat, col('--mf', '#8b5cf6')]], bw = (W - pad * 2 - 2 * 36) / 3;
    mac.forEach(function (m, i) { const x0 = pad + i * (bw + 36); x.fillStyle = '#5f6673'; font('600', 30); x.fillText(m[0], x0, 320); x.fillStyle = '#111318'; font('800', 40); x.fillText(m[1] + (m[2] ? ' / ' + m[2] : '') + ' g', x0, 372); x.fillStyle = '#eef0f3'; x.fillRect(x0, 394, bw, 12); x.fillStyle = m[3]; x.fillRect(x0, 394, bw * Math.min(1, m[2] ? m[1] / m[2] : 0), 12); });
    let y = 480;
    groups.forEach(function (g) {
      x.fillStyle = '#111318'; font('800', 38); x.fillText(g.n, pad, y + 30); const gk = fmtKcal(g.items.reduce(function (a, f) { return a + f.kcal; }, 0)) + ' kcal'; x.fillStyle = '#9ba1ac'; font('600', 32); x.fillText(gk, W - pad - x.measureText(gk).width, y + 30); y += 74;
      g.items.forEach(function (f) { let nm = f.name || 'Quick add'; font('500', 34); while (x.measureText(nm).width > W - pad * 2 - 180 && nm.length > 4) nm = nm.slice(0, -2); if (nm !== (f.name || 'Quick add')) nm = nm.trim() + '…'; x.fillStyle = '#2a2f37'; x.fillText(nm, pad + 8, y + 10); const kk = fmtKcal(f.kcal); x.fillStyle = '#5f6673'; x.fillText(kk, W - pad - x.measureText(kk).width, y + 10); y += 58; });
      y += 16;
    });
    x.fillStyle = '#12946a'; font('800', 30); x.fillText('Setpoint', pad, H - 80);
    c.toBlob(function (blob) {
      const file = new File([blob], 'setpoint-' + d + '.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: 'My day · Setpoint' }).catch(function () {});
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast('Image saved'); }
    }, 'image/png');
  }
  // The last 30 days on one image: averages, days on target, weight change, best day, most eaten foods.
  function shareMonth() { return onePass(shareMonthNow); }
  function shareMonthNow() {
    const today = dayNum(todayISO()), days = [];
    for (let d = today - 29; d <= today; d++) { const iso = isoFromDay(d), t = dayTotals(iso), pl = dayPlan(iso); if (t.kcal > 0) days.push({ iso: iso, t: t, tg: pl ? roundKcal(pl.target) : null, p: pl ? pl.protein : null }); }
    if (days.length < 3) { toast('Log a few more days first'); return; }
    const avg = function (k) { return Math.round(days.reduce(function (a, x) { return a + x.t[k]; }, 0) / days.length); };
    const withT = days.filter(function (x) { return x.tg; }), onT = withT.filter(function (x) { return Math.abs(x.t.kcal - x.tg) <= x.tg * 0.1; }).length;
    const tAvg = withT.length ? Math.round(withT.reduce(function (a, x) { return a + x.tg; }, 0) / withT.length) : null;
    const w0 = trendAt(today - 29), w1 = currentKg(), cnt = {};
    days.forEach(function (x) { eatenFor(x.iso).forEach(function (it) { if (isDailyTotal(it) || isImported(it)) return; const n = (it.name || '').split(',')[0].slice(0, 26); if (n) cnt[n] = (cnt[n] || 0) + 1; }); });
    const top = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).slice(0, 5);
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), pad = 80;
    const cs = getComputedStyle(document.documentElement), acc = (cs.getPropertyValue('--accent') || '#0f9a6c').trim();
    const font = function (w, s) { x.font = w + ' ' + s + 'px Figtree, system-ui, sans-serif'; };
    x.fillStyle = '#f3f5f4'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(40, 40, W - 80, H - 80, 48) : x.rect(40, 40, W - 80, H - 80); x.fill();
    x.fillStyle = acc; font('800', 34); x.fillText('SETPOINT · LAST 30 DAYS', pad, 130);
    x.fillStyle = '#111'; font('800', 64); x.fillText(fmtDate(isoFromDay(today - 29), { month: 'short', day: 'numeric' }) + ' – ' + fmtDate(isoFromDay(today), { month: 'short', day: 'numeric' }), pad, 215);
    const tiles = [[fmtKcal(avg('kcal')), 'avg kcal' + (tAvg ? ' / ' + fmtKcal(tAvg) : '')], [avg('protein') + ' g', 'avg protein'], [onT + ' / ' + days.length, 'days on target'], [w0 != null && w1 != null ? (w1 - w0 > 0 ? '+' : '') + fmtW(w1 - w0) + ' ' + unit() : '–', 'weight trend']];
    tiles.forEach(function (tl, i) { const cx = pad + (i % 2) * 470, cy = 290 + Math.floor(i / 2) * 210; x.fillStyle = '#f2f5f3'; x.beginPath(); x.roundRect ? x.roundRect(cx, cy, 440, 180, 28) : x.rect(cx, cy, 440, 180); x.fill(); x.fillStyle = '#111'; font('800', 62); x.fillText(tl[0], cx + 36, cy + 95); x.fillStyle = '#6b7570'; font('600', 30); x.fillText(tl[1], cx + 36, cy + 145); });
    let y = 770; x.fillStyle = '#111'; font('800', 40); x.fillText('Most eaten', pad, y); y += 30;
    top.forEach(function (n, i) { y += 64; x.fillStyle = acc; font('800', 34); x.fillText(String(i + 1), pad, y); x.fillStyle = '#2a2f2c'; font('600', 36); x.fillText(n, pad + 56, y); const k = cnt[n] + '×'; x.fillStyle = '#8a948f'; x.fillText(k, W - pad - x.measureText(k).width, y); });
    x.fillStyle = '#8a948f'; font('600', 28); x.fillText(days.length + ' days logged', pad, H - 90);
    c.toBlob(function (blob) {
      const file = new File([blob], 'setpoint-month-' + todayISO() + '.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: 'My month · Setpoint' }).catch(function () {});
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast('Image saved'); }
    }, 'image/png');
  }
  // ⋯ at the top of the Diary: copy this day, copy the day before into it, paste, or clear it.
  let clip = null; // { items, from } copied with "Copy day"
  try { clip = JSON.parse(sessionStorage.getItem('setpoint-clip')) || null; } catch (x) { clip = null; }
  // A break from dieting: eat at maintenance for as many days as you choose (one day is a refeed, with the extra as carbs).
  function breakSheet(d) {
    let n = 7;
    const range = function () { return n === 1 ? fmtDate(d, { weekday: 'long', month: 'short', day: 'numeric' }) : fmtDate(d, { month: 'short', day: 'numeric' }) + ' – ' + fmtDate(isoFromDay(dayNum(d) + n - 1), { month: 'short', day: 'numeric' }); };
    const draw = function (root) {
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">Take a break</h2></div></div>' +
        '<p class="sheet-text">Eat at maintenance instead of your usual target. A short break can help with energy, training and sticking with your plan.</p>' +
        '<div class="label faint fd-sec">How many days?</div>' +
        '<div class="rates br-days">' + [1, 2, 3, 5, 7, 14].map(function (k) { return '<button type="button" data-brk="' + k + '" aria-pressed="' + (k === n) + '">' + (k === 1 ? '1 day' : k + ' days') + '</button>'; }).join('') + '</div>' +
        '<div class="stat-box br-sum"><b>' + esc(range()) + '</b><span>' + (n === 1 ? 'A refeed day: the extra calories come from carbs' : 'A diet break: the extra calories are split between carbs and fat') + '</span></div>' +
        '<button type="button" class="btn primary block" id="brGo">' + (n === 1 ? 'Start 1-day break' : 'Start ' + n + '-day break') + '</button>';
      $$('[data-brk]', root).forEach(function (b) { b.addEventListener('click', function () { n = +b.dataset.brk; buzz('light'); draw(root); }); });
      $('#brGo', root).addEventListener('click', function () {
        const snap = snapshot(); for (let i = 0; i < n; i++) state.dayMode[isoFromDay(dayNum(d) + i)] = n === 1 ? 'f' : 'b';
        save(); renderAll(); closeSheet(); buzz('success'); toast(n === 1 ? 'Break: 1 day at maintenance' : 'Break: ' + n + ' days at maintenance', function () { restore(snap); });
      });
    };
    openSheet('<div id="brRoot"></div>', function (body) { draw($('#brRoot', body)); });
  }
  function dayMenu(date) {
    const d = date || viewDay, its = foodFor(d), prev = isoFromDay(dayNum(d) - 1), pits = foodFor(prev), n = function (k) { return k + (k === 1 ? ' food' : ' foods'); };
    const row = function (id, t, sub, off, danger) { return '<button type="button" class="row" id="' + id + '"' + (off ? ' disabled' : '') + '><div class="grow"><div class="row-t"' + (danger ? ' style="color:var(--danger)"' : '') + '>' + t + '</div>' + (sub ? '<div class="row-s">' + sub + '</div>' : '') + '</div></button>'; };
    openSheet('<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">Diary</h2></div></div>' +
      '<div class="list day-menu">' +
        row('dmCopy', 'Copy day', its.length ? n(its.length) : 'Nothing logged yet', !its.length) +
        row('dmPrev', 'Copy previous day', pits.length ? n(pits.length) + ' from ' + esc(relDate(prev)) : 'Nothing logged ' + esc(relDate(prev)), !pits.length) +
        (clip ? row('dmPaste', 'Paste', n(clip.items.length) + ' from ' + esc(relDate(clip.from))) : '') +
        (function () { const md = state.dayMode[d]; if (!md) return row('dmMode', 'Take a break', 'Eat at maintenance for a day or more'); let e = dayNum(d); while (state.dayMode[isoFromDay(e + 1)]) e++; return row('dmMode', 'End the break', 'Eating at maintenance' + (e > dayNum(d) ? ' until ' + esc(fmtDate(isoFromDay(e), { weekday: 'short', month: 'short', day: 'numeric' })) : ' today')); })() +
        row('dmPlan', 'Meal planner', 'A full day of meals for your targets') +
        row('dmShare', 'Share this day', 'An image of your food and totals') +
        (plannedFor(d).length ? row('dmEatAll', 'Mark planned food as eaten', n(plannedFor(d).length)) : '') +
        row('dmCats', 'Categories', MEALS.map(function (m) { return esc(m[1]); }).join(', ')) +
        row('dmClear', 'Delete all diary entries', its.length ? n(its.length) : '', !its.length, true) +
      '</div>',
      function (root) {
        $('#dmCopy', root).addEventListener('click', function () {
          clip = { items: its.map(function (it) { const c = Object.assign({}, it); delete c.id; return c; }), from: d };
          try { sessionStorage.setItem('setpoint-clip', JSON.stringify(clip)); } catch (x) {}
          closeSheet(); buzz('success'); toast('Copied ' + n(its.length) + '. Go to a day and tap Paste.');
        });
        $('#dmShare', root).addEventListener('click', function () { closeSheet(); shareDay(d); });
        $('#dmPlan', root).addEventListener('click', function () { closeSheet(); planDaySheet(d); });
        $('#dmMode', root).addEventListener('click', function () {
          if (!state.dayMode[d]) { buzz('light'); breakSheet(d); return; }
          const snap = snapshot(); let k = dayNum(d); while (state.dayMode[isoFromDay(k)]) { delete state.dayMode[isoFromDay(k)]; k++; }
          save(); renderAll(); closeSheet(); buzz('success'); toast('Back to normal', function () { restore(snap); });
        });
        if ($('#dmEatAll', root)) $('#dmEatAll', root).addEventListener('click', function () {
          const snap = snapshot(), its2 = plannedFor(d); its2.forEach(function (it) { delete it.plan; if (d === todayISO() && !it.t) it.t = nowHM(); });
          save(); renderAll(); closeSheet(); buzz('success'); toast('Eaten · ' + n(its2.length), function () { restore(snap); });
        });
        $('#dmCats', root).addEventListener('click', function () { buzz('light'); catsSheet(); });
        $('#dmPrev', root).addEventListener('click', function () { closeSheet(); copyFood(pits, d); });
        if (clip) $('#dmPaste', root).addEventListener('click', function () { closeSheet(); copyFood(clip.items, d, 'Pasted'); });
        $('#dmClear', root).addEventListener('click', function () {
          const snap = snapshot(), k = its.length;
          delete state.food[d];
          save(); renderAll(); closeSheet(); buzz('medium'); toast('Deleted ' + n(k), function () { restore(snap); });
        });
      });
  }
  // Share a recipe or meal as a link. Your own foods and scanned products in it travel along.
  function b64u(str) { return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(s); return new TextDecoder().decode(Uint8Array.from(bin, function (c) { return c.charCodeAt(0); })); }
  function shareLink(kind, obj) {
    const foods = {}, offs = {};
    obj.items.forEach(function (it) { if (!it.ref) return; const t = it.ref.charAt(0); if (t === 'c') { const c = state.myFoods.find(function (x) { return x.id === it.ref; }); if (c) foods[c.id] = c; } if (t === 'o') { const o = state.offFoods.find(function (x) { return x.id === it.ref; }); if (o) offs[o.id] = o; } });
    const payload = { v: 1, k: kind, d: kind === 'r' ? { name: obj.name, servings: obj.servings, cookedG: obj.cookedG, items: obj.items } : { name: obj.name, items: obj.items.map(function (it) { const c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan; return c; }) }, c: Object.keys(foods).map(function (k) { return foods[k]; }), o: Object.keys(offs).map(function (k) { return offs[k]; }) };
    const url = location.origin + location.pathname + '#s=' + b64u(JSON.stringify(payload));
    const title = obj.name + ' · Setpoint';
    if (navigator.share) navigator.share({ title: title, text: (kind === 'r' ? 'Recipe: ' : 'Meal: ') + obj.name, url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Link copied'); }, function () { toast('Couldn\'t copy the link'); });
  }
  function openShared(hash) {
    let pl; try { pl = JSON.parse(unb64u(hash)); } catch (e) { toast('That link didn\'t work'); return; }
    if (!pl || (pl.k !== 'r' && pl.k !== 'm') || !pl.d || !Array.isArray(pl.d.items) || typeof pl.d.name !== 'string') { toast('That link didn\'t work'); return; }
    const name = pl.d.name.slice(0, 60), n = pl.d.items.length;
    openSheet('<div class="sheet-head"><div><div class="label faint">Shared with you</div><h2 class="sheet-title" id="sheetTitle">' + esc(name) + '</h2></div></div>' +
      '<p class="sheet-text">' + (pl.k === 'r' ? 'A recipe' : 'A meal') + ' with ' + n + ' food' + (n === 1 ? '' : 's') + ': ' + esc(pl.d.items.slice(0, 6).map(function (x) { return x.name || 'Quick add'; }).join(', ')) + (n > 6 ? '…' : '') + '.</p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="shNo">Not now</button><button type="button" class="btn primary" id="shGo">Add to My foods</button></div>',
      function (root) {
        $('#shNo', root).addEventListener('click', function () { closeSheet(); });
        $('#shGo', root).addEventListener('click', function () {
          const snap = snapshot(), map = {};
          // Bring their own foods in as yours (new ids), and scanned products as they are; then run it all through migrate.
          (pl.c || []).forEach(function (c) { if (c && typeof c.id === 'string') { const id = 'c' + newId(); map[c.id] = id; state.myFoods.push(Object.assign({}, c, { id: id })); } });
          (pl.o || []).forEach(function (o) { if (o && typeof o.id === 'string' && !state.offFoods.some(function (x) { return x.id === o.id; })) state.offFoods.unshift(o); });
          const fix = function (it) { const c = Object.assign({}, it); if (c.ref && map[c.ref]) c.ref = map[c.ref]; return c; };
          if (pl.k === 'r') state.recipes.push({ id: 'r' + newId(), name: name, servings: pl.d.servings, cookedG: pl.d.cookedG, items: pl.d.items.map(fix) });
          else state.meals.push({ id: 'm' + newId(), name: name.slice(0, 40), items: pl.d.items.map(fix) });
          const clean = migrate(JSON.parse(JSON.stringify(state)));
          state.myFoods = clean.myFoods; state.offFoods = clean.offFoods; state.recipes = clean.recipes; state.meals = clean.meals;
          save(); renderAll(); closeSheet(); buzz('success'); toast('Added to My foods', function () { restore(snap); });
        });
      });
  }
  // App lock: a passkey on this device (Face ID, Touch ID or your passcode). It stays on this device only.
  const LOCK_KEY = 'setpoint-lock';
  function lockCfg() { try { return JSON.parse(localStorage.getItem(LOCK_KEY)) || null; } catch (e) { return null; } }
  function lockSupported() { return !!(window.PublicKeyCredential && navigator.credentials && window.isSecureContext); }
  const rnd = function (n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; };
  const toB = function (buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }, fromB = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };
  function lockSetup() {
    return navigator.credentials.create({ publicKey: { challenge: rnd(32), rp: { name: 'Setpoint' }, user: { id: rnd(16), name: 'Setpoint', displayName: 'Setpoint' }, pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }], authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, timeout: 60000 } })
      .then(function (c) { localStorage.setItem(LOCK_KEY, JSON.stringify({ id: toB(c.rawId) })); return true; });
  }
  function lockVerify() {
    const cfg = lockCfg(); if (!cfg) return Promise.resolve(true);
    return navigator.credentials.get({ publicKey: { challenge: rnd(32), allowCredentials: [{ type: 'public-key', id: fromB(cfg.id) }], userVerification: 'required', timeout: 60000 } }).then(function () { return true; });
  }
  let lockedAt = 0;
  function showLock() { if (!lockCfg()) return; const el = $('#lockScreen'); el.hidden = false; document.body.classList.add('locked'); }
  function unlock() { lockVerify().then(function () { $('#lockScreen').hidden = true; document.body.classList.remove('locked'); buzz('success'); }, function () { buzz('warn'); }); }
  $('#lockGo').addEventListener('click', unlock);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') lockedAt = Date.now(); else if (lockCfg() && lockedAt && Date.now() - lockedAt > 60000) showLock(); });
  showLock();
  // Nutrition label → numbers. Tesseract runs on the phone (downloaded once from a CDN, then cached).
  let tessP = null;
  function loadTess() { if (!tessP) tessP = new Promise(function (ok, no) { if (window.Tesseract) return ok(window.Tesseract); const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'; sc.onload = function () { ok(window.Tesseract); }; sc.onerror = function () { tessP = null; no(new Error('load')); }; document.head.appendChild(sc); }); return tessP; }
  function parseLabel(text) {
    const t = text.toLowerCase().replace(/,(\d)/g, '.$1').replace(/[|]/g, ' ').replace(/\bo(?=\s*g\b)/g, '0');
    const num = function (re) { const m = re.exec(t); return m ? parseFloat(m[1]) : null; };
    let kcal = num(/(\d+(?:\.\d+)?)\s*kcal/) ; if (kcal == null) kcal = num(/calories[^\d]{0,20}(\d+(?:\.\d+)?)/);
    if (kcal == null) { const kj = num(/(\d+(?:\.\d+)?)\s*kj/); if (kj != null) kcal = Math.round(kj / 4.184); }
    let fat = null; const fr = /(total\s+)?fat[^\d]{0,14}(\d+(?:\.\d+)?)\s*g/g; let m;
    while ((m = fr.exec(t))) { const before = t.slice(Math.max(0, m.index - 14), m.index); if (!/saturat|trans|mono|poly/.test(before)) { fat = parseFloat(m[2]); break; } }
    const out = {
      kcal: kcal, fat: fat,
      p: num(/protein[s]?[^\d]{0,14}(\d+(?:\.\d+)?)\s*g/),
      c: num(/carbohydrate[s]?[^\d]{0,16}(\d+(?:\.\d+)?)\s*g/) != null ? num(/carbohydrate[s]?[^\d]{0,16}(\d+(?:\.\d+)?)\s*g/) : num(/carbs?[^\d]{0,10}(\d+(?:\.\d+)?)\s*g/),
      fib: num(/fib(?:er|re)[^\d]{0,14}(\d+(?:\.\d+)?)\s*g/), sug: num(/sugars?[^\d]{0,14}(\d+(?:\.\d+)?)\s*g/), sat: num(/saturate[sd]?(?:\s+fat)?[^\d]{0,10}(\d+(?:\.\d+)?)\s*g/),
      g: num(/serving size[^\d]{0,24}(\d+(?:\.\d+)?)\s*(?:g|ml)/) || num(/\((\d+(?:\.\d+)?)\s*(?:g|ml)\)/)
    };
    const na = /sodium[^\d]{0,14}(\d+(?:\.\d+)?)\s*(mg|g)/.exec(t); if (na) out.na = parseFloat(na[1]) * (na[2] === 'g' ? 1000 : 1);
    if (!out.g && /per\s*100\s*(g|ml)/.test(t)) out.per100 = true;
    return out;
  }
  // Receipt / menu text → food lines: drop prices, totals and shop details, keep "2x Chicken shawarma".
  function menuLines(text) {
    const skip = /total|subtotal|tax|vat|service|cash|change|visa|card|tel|phone|order|table|date|time|receipt|invoice|thank|delivery|discount|tip|www|http|@|ضريبة|اجمالي|الإجمالي|خدمة|شكرا|فاتورة|توصيل|خصم/i;
    return text.split(/\n+/).map(function (l) {
      return l.replace(/\b(?:egp|le|l\.e|sar|aed|usd|eur|kwd|qar)\b\.?/gi, ' ').replace(/[$€£]|ج\.?م|جنيه|ريال|درهم/g, ' ')
        .replace(/\d+[.,]\d{2}\b/g, ' ').replace(/^\s*(\d+)\s*[x×*]\s*/i, '$1 ').replace(/\s[x×]\s*\d+\s*$/i, '').replace(/[|_=#~]+/g, ' ').replace(/\s+/g, ' ').trim();
    }).filter(function (l) { return l.length >= 3 && l.length <= 50 && /[a-zء-ي]{3}/i.test(l) && !skip.test(l); }).slice(0, 15);
  }
  function readLabel(file, root) {
    const b = $('#cfScan', root), was = b.innerHTML; b.disabled = true; b.textContent = 'Reading the label…';
    const done = function () { b.disabled = false; b.innerHTML = was; };
    loadTess().then(function (T) { return T.recognize(file, 'eng'); }).then(function (r) {
      done(); const v = parseLabel((r && r.data && r.data.text) || ''), set = function (id, x) { if (x != null && $('#' + id, root)) $('#' + id, root).value = String(Math.round(x * 10) / 10); };
      const got = ['kcal', 'p', 'c', 'fat'].filter(function (k) { return v[k] != null; }).length;
      if (!got) { toast('Couldn\'t read that label. Try a sharper, closer photo.'); buzz('warn'); return; }
      set('cfK', v.kcal); set('cfP', v.p); set('cfC', v.c); set('cfF', v.fat);
      if (v.g) set('cfG', v.g); else if (v.per100) { set('cfG', 100); if (!$('#cfU', root).value) $('#cfU', root).value = '100 g'; }
      let extra = false; [['fib', 'fib'], ['sug', 'sug'], ['sat', 'sat'], ['na', 'na']].forEach(function (x) { if (v[x[0]] != null && $('#cfx_' + x[1], root)) { $('#cfx_' + x[1], root).value = String(Math.round(v[x[0]] * 10) / 10); extra = true; } });
      if (extra && $('#cfExtra', root).hidden) $('#cfMore', root).click();
      buzz('success'); toast('Filled from the label. Check the numbers.');
    }, function () { done(); toast(navigator.onLine === false ? 'Label scanning needs the internet the first time.' : 'Couldn\'t read the label.'); buzz('warn'); });
  }
  // Settings → Back up & restore / Import: one tidy sheet each.
  function dataSheet(kind) {
    const row = function (act, ico, t, sub) { return '<button type="button" class="row" data-ds="' + act + '"><span class="ico ico-s">' + ico + '</span><div class="grow"><div class="row-t">' + t + '</div>' + (sub ? '<div class="row-s">' + sub + '</div>' : '') + '</div>' + CHEV + '</button>'; };
    const I = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
    // Everything about your data in one place: back up, export, bring data in, and tidy up.
    const g = function (label, rows) { return '<div class="group-label">' + label + '</div><div class="list">' + rows + '</div>'; };
    openSheet('<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Your data</h2></div></div>' +
      (storeEst && storeEst.usage ? '<p class="muted-note ds-store">' + esc(storeLine()) + ' on this phone</p>' : '') +
      g('Back up', row('export-json', I('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>'), 'Back up', 'Save everything to a file') + row('import', I('<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19h14"/>'), 'Restore', 'From a Setpoint backup file') + row('backups', I('<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/><path d="M12 8v4l3 2"/>'), 'Daily backups', 'A copy every day on this phone, kept for 7 days')) +
      g('Export', row('export-food', I('<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 9.5h16M9.5 9.5V20"/>'), 'Export food log', 'Everything you ate, with nutrients, as a spreadsheet') + row('export-csv', I('<path d="M4 17l5-5 4 3 7-8"/>'), 'Export weigh-ins', 'Your weight and trend as a spreadsheet')) +
      g('Import', row('import-crono', I('<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>'), 'From Cronometer', 'Pick dailysummary.csv and servings.csv together') + row('import-csv', I('<path d="M4 17l5-5 4 3 7-8"/>'), 'Weigh-ins from another app', 'Happy Scale, Libra, MyFitnessPal and more')) +
      g('Tidy up', row('health', I('<path d="M9 12l2 2 4-4"/><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/>'), 'Check my data', 'Find and fix entries that look wrong')),
      function (root) { $$('[data-ds]', root).forEach(function (b) { b.addEventListener('click', function () { const a = b.dataset.ds; closeSheet(); const el = document.createElement('button'); el.dataset.action = a; el.hidden = true; document.body.appendChild(el); el.click(); el.remove(); }); }); });
  }
  // Theme picker: a small preview of each theme, in the light or dark version you're using now.
  function themeSheet() {
    const dark = document.documentElement.getAttribute('data-mode') === 'dark';
    const draw = function (root) {
      root.innerHTML = '<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Theme</h2></div></div><div class="th-grid">' + THEMES.map(function (t) {
        const c = dark ? t[3] : t[2], on = state.settings.style === t[0];
        return '<button type="button" class="th-card' + (on ? ' on' : '') + '" data-th="' + t[0] + '" aria-pressed="' + on + '"><span class="th-prev" style="background:' + c[0] + '"><span class="th-glow" style="background:radial-gradient(80% 70% at 0% 0%,' + c[2] + '33,transparent 70%)"></span><span class="th-mini" style="background:' + c[1] + '"><i style="border-color:' + c[2] + ';border-right-color:' + c[0] + '"></i><b style="background:' + c[3] + '"></b><b style="background:' + c[3] + ';opacity:.35;width:60%"></b></span><span class="th-btn" style="background:' + c[2] + '"></span></span><span class="th-name">' + t[1] + '</span></button>';
      }).join('') + '</div>';
      $$('[data-th]', root).forEach(function (b) { b.addEventListener('click', function () { if (state.settings.style === b.dataset.th) return; state.settings.style = b.dataset.th; save(); buzz('light'); restyle(function () { applyAppearance(); renderAll(); draw(root); }); }); });
    };
    openSheet('<div id="thRoot"></div>', function (body) { draw($('#thRoot', body)); });
  }
  // Training days: which weekdays, and how much more you eat on them.
  function trainSheet() {
    const cur = state.settings.train || { days: [] }, t = state.profile.training;
    let days = cur.days.slice();
    openSheet('<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Training days</h2></div></div>' +
      '<p class="sheet-text">Pick the days you train. You eat more on those days and less on rest days. Your weekly total stays the same.</p>' +
      '<div class="day-chips" id="trDays">' + weekOrder().map(function (d) { return '<button type="button" data-v="' + d + '" aria-pressed="' + (days.indexOf(d) >= 0) + '">' + dayAbbr(d) + '</button>'; }).join('') + '</div>' +
      '<div class="stat-box tr-split" id="trNote"></div>' +
      '<div class="sheet-foot"><button type="button" class="btn primary block" id="trSave">Save</button></div>',
      function (root) {
        sheet.classList.add('tall');
        // Preview with the days picked (they also become your training days a week in Activity).
        const note = function () {
          const c = calcEnergy(), pl = makePlan(activeEnergy());
          if (!days.length) { $('#trNote', root).innerHTML = '<span class="muted-note">No days picked: every day has the same target.</span>'; return; }
          if (!c || !pl) { $('#trNote', root).innerHTML = '<span class="muted-note">Add your details in Targets first.</span>'; return; }
          const tt = Object.assign({}, t, { days: days.length }), e2 = energyFor(Object.assign({}, state.profile, { age: ageNow(), training: tt }), c.kg);
          const session = e2.train * 7 / days.length / 0.9, avg = e2.train / 0.9, base = roundKcal(pl.target - c.tdee + e2.tdee);
          const on = roundKcal(base + session - avg), off = roundKcal(base - avg);
          $('#trNote', root).innerHTML = '<div class="tr-row"><span>Training days (' + days.length + ')</span><b class="num">' + fmtKcal(on) + ' kcal</b></div><div class="tr-row"><span>Rest days (' + (7 - days.length) + ')</span><b class="num">' + fmtKcal(off) + ' kcal</b></div><div class="tr-row faint"><span>Average</span><b class="num">' + fmtKcal(Math.round((on * days.length + off * (7 - days.length)) / 7 / 10) * 10) + ' kcal</b></div>' +
            '<p class="muted-note" style="margin:8px 0 0">Based on ' + t.minutes + ' min of ' + t.type + ' (' + t.intensity + '). Change that in Activity.</p>';
        };
        note();
        $$('#trDays button', root).forEach(function (b) { b.addEventListener('click', function () { const v = +b.dataset.v, i = days.indexOf(v); if (i >= 0) days.splice(i, 1); else days.push(v); b.setAttribute('aria-pressed', i < 0); buzz('light'); note(); }); });
        $('#trSave', root).addEventListener('click', function () {
          const snap = snapshot();
          state.settings.train = days.length ? { days: days.sort() } : null;
          if (days.length) state.profile.training.days = days.length;
          save(); renderAll(); closeSheet(); buzz('success'); toast('Training days saved', function () { restore(snap); });
        });
      }, function () { sheet.classList.remove('tall'); });
  }
  // Your Diary categories: rename, reorder (drag ≡), add (like Pre-workout) or remove.
  const GRIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 8h14M5 12h14M5 16h14"/></svg>';
  function catsSheet() {
    let list = MEALS.map(function (m) { return { k: m[0], n: m[1] }; });
    const draw = function (root) {
      root.innerHTML = '<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Categories</h2></div></div>' +
        '<div class="list" id="catList">' + list.map(function (c, i) {
          return '<div class="row cat-row" data-cat="' + i + '"><span class="cat-grip" aria-label="Drag to reorder">' + GRIP + '</span><input class="input cat-in" data-ci="' + i + '" maxlength="24" value="' + esc(c.n) + '" aria-label="Category name" autocomplete="off" />' +
            '<button type="button" class="icon-btn me-rm" data-cdel="' + i + '" aria-label="Remove ' + esc(c.n) + '"' + (list.length < 2 ? ' disabled' : '') + '>' + TRASH + '</button></div>';
        }).join('') + '</div>' +
        '<div class="cat-add"><input class="input" id="catNew" maxlength="24" placeholder="New, like Pre-workout" aria-label="New category" autocomplete="off" /><button type="button" class="btn soft" id="catAdd">Add</button></div>' +
        '<p class="form-error" id="catErr" hidden></p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="catDone">Save</button></div>';
      const err = function (m) { const x = $('#catErr', root); x.textContent = m; x.hidden = !m; if (m) buzz('warn'); };
      $$('[data-ci]', root).forEach(function (inp) { inp.addEventListener('input', function () { list[+inp.dataset.ci].n = inp.value; }); });
      $$('[data-cdel]', root).forEach(function (b) { b.addEventListener('click', function () { list.splice(+b.dataset.cdel, 1); buzz('light'); draw(root); }); });
      const add = function () {
        const n = $('#catNew', root).value.trim();
        if (!n) return err('Type a name first');
        if (list.length >= 10) return err('Up to 10 categories');
        list.push({ k: 'g' + newId().replace(/[^a-z0-9]/g, '').slice(0, 8).padEnd(3, '0'), n: n.slice(0, 24) }); buzz('light'); draw(root);
      };
      $('#catAdd', root).addEventListener('click', add);
      $('#catNew', root).addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); add(); } });
      dragSort($('#catList', root), '.cat-row', function (src, tgt, before) {
        const from = +src.dataset.cat, mv = list.splice(from, 1)[0]; let to = +tgt.dataset.cat; if (from < to) to--; if (!before) to++;
        list.splice(to, 0, mv); buzz('light'); draw(root);
      }, { handle: '.cat-grip' });
      $('#catDone', root).addEventListener('click', function () {
        list = list.map(function (c) { return { k: c.k, n: c.n.trim().slice(0, 24) }; });
        if (list.some(function (c) { return !c.n; })) return err('Give every category a name');
        const snap = snapshot(), keys = list.map(function (c) { return c.k; }), last = keys[keys.length - 1];
        let moved = 0;
        Object.keys(state.food).forEach(function (dt) { state.food[dt].forEach(function (it) { if (keys.indexOf(it.meal) < 0 && !isDailyTotal(it)) { it.meal = last; moved++; } }); });
        state.ui.shut = state.ui.shut.filter(function (k) { return keys.indexOf(k) >= 0; });
        const same = list.length === DEFAULT_MEALS.length && list.every(function (c, i) { return c.k === DEFAULT_MEALS[i][0] && c.n === DEFAULT_MEALS[i][1]; });
        state.settings.meals = same ? null : list;
        save(); renderAll(); closeSheet(); buzz('success');
        toast(moved ? 'Saved. Food from removed categories is now in ' + list[list.length - 1].n : 'Categories saved', function () { restore(snap); });
      });
    };
    openSheet('<div id="catRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#catRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
  // Tap a meal's name: its totals, and copy, save or clear it.
  function mealSheet(meal, date) {
    const d = date || viewDay, its = foodFor(d).filter(function (f) { return mealOf(f) === meal; });
    if (!its.length) return;
    const t = its.reduce(function (a, f) { return { kcal: a.kcal + f.kcal, p: a.p + f.protein, c: a.c + f.carbs, f: a.f + f.fat }; }, { kcal: 0, p: 0, c: 0, f: 0 });
    const today = todayISO();
    openSheet('<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">' + mealName(meal) + '</h2></div></div>' +
      '<div class="stat-box sv-mac meal-tot"><div><b class="num">' + fmtKcal(t.kcal) + '</b><span>kcal</span></div><div><b class="num">' + t.p + '</b><span>g protein</span></div><div><b class="num">' + t.c + '</b><span>g carbs</span></div><div><b class="num">' + t.f + '</b><span>g fat</span></div></div>' +
      '<div id="msSaveBox" hidden><div class="field"><input class="input" id="msName" maxlength="40" placeholder="Name, like Usual breakfast" aria-label="Meal name" autocomplete="off" /></div><button type="button" class="btn primary block" id="msSaveGo" style="margin-bottom:16px">Save meal</button></div>' +
      '<div class="list">' +
        (d !== today ? '<button type="button" class="row" id="msToday"><div class="grow row-t">Copy to today</div>' + CHEV + '</button>' : '') +
        '<button type="button" class="row" id="msSave"><div class="grow row-t">Save as a meal</div>' + CHEV + '</button>' +
        '<button type="button" class="row" id="msClear"><div class="grow row-t" style="color:var(--danger)">Remove all</div></button>' +
      '</div>',
      function (root) {
        if ($('#msToday', root)) $('#msToday', root).addEventListener('click', function () { closeSheet(); copyFood(its, today, 'Copied to today'); });
        $('#msSave', root).addEventListener('click', function () { $('#msSaveBox', root).hidden = false; this.hidden = true; $('#msName', root).focus(); });
        const saveMeal = function () {
          const nm = $('#msName', root).value.trim() || mealName(meal);
          state.meals.push({ id: 'm' + newId(), name: nm.slice(0, 40), items: its.slice(0, 40).map(function (it) { const c = Object.assign({}, it); delete c.id; delete c.meal; return c; }) });
          save(); closeSheet(); buzz('success'); toast('Saved to My foods');
        };
        $('#msSaveGo', root).addEventListener('click', saveMeal);
        $('#msName', root).addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); saveMeal(); } });
        $('#msClear', root).addEventListener('click', function () {
          const snap = snapshot();
          state.food[d] = foodFor(d).filter(function (f) { return f.meal !== meal; });
          if (!state.food[d].length) delete state.food[d];
          save(); renderAll(); closeSheet(); buzz('medium'); toast(mealName(meal) + ' cleared', function () { restore(snap); });
        });
      });
  }

