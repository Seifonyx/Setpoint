  /* ================= Start ================= */
  load();
  loadPhotos();
  let backFromGoogle = false; try { backFromGoogle = localStorage.getItem('setpoint-redirect') === '1'; } catch (e) {}
  if (state.sync.uid || backFromGoogle) loadFirebase().catch(function () { renderAccount(); });
  applyAppearance();
  showTab(state.ui.tab, true);
  // the first page eases in as the app opens
  (function () { const p0 = $('main > .tab-panel:not([hidden])'); if (p0 && !calmMotion()) { p0.classList.add('panel-in'); setTimeout(function () { p0.classList.remove('panel-in'); }, 400); } })();
  if (state.ui.tab === 'targets' || state.ui.tab === 'settings') navPush('page');
  renderAll();
  setTimeout(prefetchFoods, 4000);
  setInterval(function () { if (state.fast.start && state.settings.fasting && state.ui.tab === 'diary' && document.visibilityState === 'visible') renderDiary(); }, 30000);
  // Show "Updated" once per version: it counts as seen as soon as it appears (it used to only
  // count once What's new was opened, so it kept coming back).
  setTimeout(checkStorage, 3000);
  setTimeout(function () { if (achLine == null) achLine = achText(); }, 2000); // ready before You is first opened
  setTimeout(function () { snapHooks(); }, 2600); // what page slides need from the stylesheet, read once while idle
  // Older saves: count milestones already reached as celebrated, so nobody gets a pile of old confetti.
  if (state.ui.milestones === null) { state.ui.milestones = reachedMilestones().map(function (m) { return m.key; }); save(); }
  // Home-screen shortcuts open straight into logging (?action=log) or food (?action=food).
  // Shared recipe/meal links (#s=…), on open or while the app is already open.
  const takeShare = function (delay) { if (!/^#s=/.test(location.hash)) return; const h = location.hash.slice(3); history.replaceState(null, '', location.pathname + location.search); setTimeout(function () { openShared(h); }, delay); };
  takeShare(500); window.addEventListener('hashchange', function () { takeShare(50); });
  const shortcut = new URLSearchParams(location.search).get('action');
  if (shortcut) history.replaceState(null, '', location.pathname);
  // Graphite is the main theme now: switch once from the old default (Emerald). Any theme you choose after that stays.
  if (!state.ui.smartBurn) { state.ui.smartBurn = true; if (state.profile.tdeeSource === 'calc') state.profile.tdeeSource = 'auto'; save(); renderAll(); }
  if (!state.ui.graphite) { state.ui.graphite = true; if (state.settings.style === 'classic') { state.settings.style = 'graphite'; applyAppearance(); renderAll(); } save(); }
  if (applyRepeats()) renderAll();
  // Repeat items with a set time are added when that time comes, even with the app open.
  setInterval(function () { if (document.visibilityState === 'visible' && !dragActive && todayISO() === lastDay && applyRepeats()) renderAll(); }, 30000);
  const isNew = !state.seenVersion && !state.entries.length && !state.profile.sex && !state.sync.uid && !state.ui.onboarded;
  // Updates install quietly, like big apps. Only a new feature worth showing gets a one-time spotlight.
  const news = state.seenVersion !== APP_VERSION && (state.seenVersion || state.entries.length) ? featureNews(state.seenVersion) : null, showUpdate = !!news;
  if (state.seenVersion !== APP_VERSION) { state.seenVersion = APP_VERSION; save(); }
  const updateToast = function () { if (news) setTimeout(function () { if (!sheet.classList.contains('open')) spotlightSheet(news); }, 500); };
  // Weekly check-in: once, on the first open of a new week, for the week that just ended.
  const lastWeek = weekStart(dayNum(todayISO())) - 7, lw = weekStats(lastWeek);
  const tuned = isNew ? null : autoTune();
  if (isNew) setTimeout(function () { welcomeSheet(1); }, 350);
  else if (shortcut === 'log' || shortcut === 'food' || shortcut === 'scan' || shortcut === 'water') { showTab('diary', true); setTimeout(function () { if (shortcut === 'log') logSheet(); else if (shortcut === 'scan') addFoodSheet(null, null, null, null, false, null, true); else if (shortcut === 'water') waterSheet(todayISO()); else addFoodSheet(); }, 250); }
  else if (state.ui.checkin !== lastWeek && lw && lw.n >= 2) {
    state.ui.checkin = lastWeek; save();
    if (tuned) renderAll();
    const t = state.ui.tune && state.ui.tune.at >= lastWeek ? state.ui.tune : null;
    setTimeout(function () { weekSheet(lastWeek, true, updateToast, t); }, 600);
  } else { updateToast(); if (tuned) { renderAll(); setTimeout(function () { tuneToast(tuned); }, showUpdate ? 5200 : 700); } }
