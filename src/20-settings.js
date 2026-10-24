  /* ================= Settings ================= */
  // A small dot on your profile button: synced, saving, offline or a problem. Nothing when you're not signed in.
  function renderSyncDot() {
    const sy = state.sync, st = !sy.uid ? '' : syncBusy || sy.dirty ? (navigator.onLine ? 'busy' : 'off') : !navigator.onLine ? 'off' : syncError ? 'err' : 'ok';
    $$('.avatar-btn').forEach(function (b) { if (st) b.dataset.sync = st; else delete b.dataset.sync; b.title = st ? syncStatus() : ''; });
    const ty = $('#tab-you .tab-ico'); if (ty) { if (st && st !== 'ok') ty.dataset.sync = st; else delete ty.dataset.sync; }
  }
  function renderAccount() {
    renderSyncDot();
    const sy = state.sync, ico = $('#acctIco');
    $$('.avatar-btn').forEach(function (b) { b.innerHTML = sy.uid ? esc((sy.email || '?').charAt(0).toUpperCase()) : USER_ICO; });
    if ($('#yhSub')) $('#yhSub').textContent = youSub();
    if (!ico) return;
    if (!sy.uid) {
      $('#acctTitle').textContent = 'Sign in';
      $('#acctSub').textContent = 'Sync across devices';
      ico.innerHTML = USER_ICO;
    } else {
      $('#acctTitle').textContent = sy.email || 'Signed in';
      $('#acctSub').textContent = syncStatus();
      ico.innerHTML = '<b style="font-size:15px">' + esc((sy.email || '?').charAt(0).toUpperCase()) + '</b>';
    }
  }
  function ago(ms) {
    const s = Math.round((Date.now() - ms) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return fmtDate(isoOf(new Date(ms)));
  }
  function syncStatus() {
    const sy = state.sync;
    if (syncBusy) return 'Syncing…';
    if (!navigator.onLine) return 'Offline · syncs when you\'re back';
    if (syncError) return 'Couldn\'t sync · tap to retry';
    if (sy.dirty) return 'Waiting to sync';
    return sy.lastSync ? 'Synced ' + ago(sy.lastSync) : 'Not synced yet';
  }

  // Storage on this phone: ask the browser to keep it, show how much is used, and warn when it's nearly full.
  let storeEst = null;
  function checkStorage() {
    if (!navigator.storage || !navigator.storage.estimate) return;
    const installed = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    if (installed && navigator.storage.persist) navigator.storage.persisted().then(function (p) { if (!p) navigator.storage.persist().catch(function () {}); }).catch(function () {});
    navigator.storage.estimate().then(function (e) {
      storeEst = e; if ($('#storeSub')) $('#storeSub').textContent = storeLine();
      const r = e.quota ? e.usage / e.quota : 0, wk = weekStart(dayNum(todayISO()));
      if (r > 0.8 && state.ui.storeWarn !== wk) { state.ui.storeWarn = wk; save(); toast('Your phone\'s storage for Setpoint is almost full. Back up, then remove old photos.'); }
    }).catch(function () {});
  }
  function storeLine() { if (!storeEst || !storeEst.usage) return 'Checking…'; const mb = function (b) { return b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : Math.max(0.1, b / 1e6).toFixed(b < 1e7 ? 1 : 0) + ' MB'; }; return mb(storeEst.usage) + ' used' + (storeEst.quota ? ' of ' + mb(storeEst.quota) + ' available' : ''); }
  function renderSettings() {
    renderAccount();
    if ($('#storeSub')) $('#storeSub').textContent = storeLine();
    if (state.ui.tab === 'you') renderYouHero();
    const s = state.settings;
    $$('[data-setting]').forEach(function (seg) { $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === s[seg.dataset.setting]); }); });
    $('#hapticsToggle').checked = s.haptics;
    $('#numpadToggle').checked = !!s.numpad;
    $('#oledToggle').checked = !!s.oled;
    $('#explodeToggle').checked = !!s.explode;
    $('#autoAdjToggle').checked = s.autoAdjust;
    $('#fastToggle').checked = s.fasting;
    $('#lockRow').hidden = !lockSupported(); $('#lockToggle').checked = !!lockCfg();
    if ($('#themeVal')) $('#themeVal').textContent = (THEMES.find(function (t) { return t[0] === s.style; }) || THEMES[0])[1];
    $('#weekStartSel').value = String(s.weekStart); $('#weekStartVal').textContent = WEEKDAYS[s.weekStart];
    const tr = s.train, sp = trainSplit(); if ($('#trainSub')) $('#trainSub').textContent = tr && tr.days.length ? weekOrder().filter(function (d) { return tr.days.indexOf(d) >= 0; }).map(function (d) { return dayAbbr(d); }).join(', ') + (sp ? ' · +' + fmtKcal(roundKcal(sp.tx)) + ' / −' + fmtKcal(roundKcal(sp.rx)) + ' kcal' : '') : 'Eat more on the days you train';
    if ($('#goalRowVal')) $('#goalRowVal').textContent = s.goalKg ? fmtW(s.goalKg) + ' ' + unit() : 'Not set';
    $('#versionLbl').textContent = 'v' + APP_VERSION;
    $('#youFoot').textContent = 'Setpoint v' + APP_VERSION;
    const nf = state.myFoods.length + state.recipes.length + state.meals.length;
    if ($('#youFoodsSub')) $('#youFoodsSub').textContent = nf ? [[state.myFoods.length, 'food'], [state.recipes.length, 'recipe'], [state.meals.length, 'meal']].filter(function (x) { return x[0]; }).map(function (x) { return x[0] + ' ' + x[1] + (x[0] === 1 ? '' : 's'); }).join(' · ') : 'Your foods, recipes and meals';
    const pl = makePlan(activeEnergy()); $('#youTargetSub').textContent = pl ? fmtKcal(roundKcal(pl.target)) + ' kcal · ' + pl.protein + ' g protein' : 'Calories, macros, activity';
  }

  function renderAll() { applyMeals(); recordGoal(); renderToday(); renderProgress(); renderBody(); renderNutrition(); renderChart(); renderEnergy(); renderSettings(); renderFoods(); }

