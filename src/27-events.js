  /* ================= Events ================= */
  // Holding a switch: its knob turns into a glass bubble (like iPhone), and stays glass while it slides across.
  (function () {
    let held = null, tm = 0; // the knob stays glass a moment after you let go, while it slides
    const off = function () { const h = held; held = null; clearTimeout(tm); if (h) tm = setTimeout(function () { h.classList.remove('sw-press'); }, 360); };
    document.addEventListener('pointerdown', function (e) { const w = e.target.closest && e.target.closest('.switch, .mini-sw'); if (!w) return; clearTimeout(tm); if (held && held !== w) held.classList.remove('sw-press'); held = w; w.classList.add('sw-press'); }, true);
    ['pointerup', 'pointercancel'].forEach(function (t) { document.addEventListener(t, off, true); });
  })();
  // Switching a segmented control: the selected highlight glides to the new option (even when the control re-renders).
  document.addEventListener('click', function (e) {
    const b = e.target.closest && e.target.closest('.seg button'); if (!b || calmMotion()) return;
    const seg = b.closest('.seg'), old = seg.querySelector('button[aria-pressed="true"]'); if (!old || old === b || b.disabled) return;
    const sr = seg.getBoundingClientRect(), or = old.getBoundingClientRect(), st = getComputedStyle(old);
    const from = { x: or.left - sr.left, y: or.top - sr.top, w: or.width, bg: st.backgroundColor, sh: st.boxShadow, r: st.borderRadius }, cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2;
    requestAnimationFrame(function () {
      let s2 = seg.isConnected ? seg : null;
      if (!s2) { const at = document.elementFromPoint(cx, cy); s2 = at && at.closest('.seg'); }
      if (!s2) return; const nb = s2.querySelector('button[aria-pressed="true"]'), r2 = s2.getBoundingClientRect(); if (!nb || Math.abs(r2.top - sr.top) > 40) return;
      const nr = nb.getBoundingClientRect(), x = nr.left - r2.left, y = nr.top - r2.top, g = document.createElement('span');
      g.className = 'seg-glide'; g.setAttribute('aria-hidden', 'true');
      g.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + nr.width + 'px;height:' + nr.height + 'px;background:' + from.bg + ';box-shadow:' + from.sh + ';border-radius:' + from.r;
      s2.appendChild(g); s2.classList.add('gliding');
      const a = g.animate([{ transform: 'translate(' + (from.x - x) + 'px,' + (from.y - y) + 'px)', width: from.w + 'px' }, { transform: 'none', width: nr.width + 'px' }], { duration: 380, easing: 'cubic-bezier(.3,1.2,.4,1)' });
      a.onfinish = a.oncancel = function () { s2.classList.remove('gliding'); setTimeout(function () { g.remove(); }, 200); };
    });
  }, true);
  $$('.tab-btn').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.tab !== b.dataset.tab) { if (b.dataset.tab === 'diary') viewDay = todayISO(), renderDiary(); showTab(b.dataset.tab); } else if (b.dataset.tab === 'foods' && (foodsView || foodsSearch)) { foodsView = null; foodsSearch = false; $('#mfQ').value = ''; renderFoods(); window.scrollTo(0, 0); } else window.scrollTo({ top: 0, behavior: 'smooth' }); }); });
  $$('#progSeg button').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.prog !== b.dataset.prog) showProg(b.dataset.prog); }); });
  $$('[data-back]').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.tab === 'targets' && tgView) tgClose(); else goBack(); }); });
  $$('[data-day]').forEach(function (b) { b.addEventListener('click', function () { const n = dayNum(viewDay) + Number(b.dataset.day); if (n > dayNum(todayISO()) + PLAN_DAYS) return; viewDay = isoFromDay(n); buzz('light'); renderDiary(); }); });
  $('#dayPick').addEventListener('change', function () { if (this.value && this.value <= isoFromDay(dayNum(todayISO()) + PLAN_DAYS)) { viewDay = this.value; renderDiary(); } });
  $('.day-title').addEventListener('click', function (e) { const i = $('#dayPick'); if (e.target === i && i.showPicker) { try { i.showPicker(); } catch (x) {} } });
  $('.tabbar-inner').addEventListener('keydown', function (e) {
    const order = ['diary', 'progress', 'foods', 'you'], cur = state.ui.tab === 'settings' || state.ui.tab === 'targets' ? 'you' : state.ui.tab;
    let i = Math.max(0, order.indexOf(cur));
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') i = (i + ((e.key === 'ArrowRight') !== (document.dir === 'rtl') ? 1 : order.length - 1)) % order.length; else return;
    showTab(order[i]); $('#tab-' + order[i]).focus();
  });
  $$('#viewSeg button').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.view === b.dataset.view) return; state.ui.view = b.dataset.view; showAllEntries = false; save(); buzz('light'); renderProgress(); }); });
  // A new range: the chart sweeps in from the left instead of swapping in place.
  const chartSweep = function (box) {
    const svg = box && box.querySelector('svg'); if (!svg || !svg.animate || calmMotion()) return;
    svg.animate([{ clipPath: 'inset(0 100% 0 0)', opacity: .4 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1 }], { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' });
  };
  $$('#rangeSeg button').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.range === +b.dataset.range) return; state.ui.range = +b.dataset.range; save(); buzz('light'); renderChart(); renderProgress(); $$('#rangeSeg button').forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.range === state.ui.range); }); if (state.ui.prog === 'nutrition') { renderTrend(); chartSweep($('#trendBox')); } else chartSweep($('#chart')); }); });
  $$('[data-setting]').forEach(function (seg) {
    $$('button', seg).forEach(function (b) {
      b.addEventListener('click', function () {
        const key = seg.dataset.setting;
        if (state.settings[key] === b.dataset.v) return;
        state.settings[key] = b.dataset.v; save(); buzz('light');
        if (key === 'lang') { flushSave(); location.reload(); return; } // a clean redraw in the new language
        restyle(function () { applyAppearance(); renderAll(); });
      });
    });
  });
  $('#hapticsToggle').addEventListener('change', function () { state.settings.haptics = this.checked; save(); buzz('medium'); });
  $('#explodeToggle').addEventListener('change', function () { state.settings.explode = this.checked; save(); buzz('medium'); });
  // Search settings by any word on a row (or its group).
  $('#setQ').addEventListener('input', function () {
    const q = normText(this.value).trim(); let any = false;
    $$('#panel-settings .set-group').forEach(function (g) {
      const gl = normText(g.querySelector('.group-label').textContent); let n = 0;
      $$('.set-list > .row', g).forEach(function (r) { const hit = !q || (gl + ' ' + normText(r.textContent)).indexOf(q) >= 0; r.classList.toggle('sq-out', !hit); if (hit && !r.hidden) n++; });
      g.classList.toggle('sq-out', !n); if (n) any = true;
    });
    $('#setNone').hidden = any;
  });
  $('#oledToggle').addEventListener('change', function () { state.settings.oled = this.checked; save(); buzz('light'); const on = this.checked, t = this; setTimeout(function () { if (t.checked === on) restyle(applyAppearance); }, 300); }); // after the knob has slid
  $('#numpadToggle').addEventListener('change', function () { state.settings.numpad = this.checked; save(); buzz('medium'); });
  $('#fastToggle').addEventListener('change', function () { state.settings.fasting = this.checked; save(); buzz('medium'); renderAll(); });
  $('#lockToggle').addEventListener('change', function () {
    const el = this;
    if (el.checked) lockSetup().then(function () { buzz('success'); toast('App lock is on'); }, function () { el.checked = false; toast('App lock wasn\'t turned on'); });
    else lockVerify().then(function () { localStorage.removeItem(LOCK_KEY); buzz('light'); toast('App lock is off'); }, function () { el.checked = true; });
  });
  $('#weekStartSel').addEventListener('change', function () { state.settings.weekStart = +this.value; save(); buzz('light'); renderAll(); });
  $('#autoAdjToggle').addEventListener('change', function () { state.settings.autoAdjust = this.checked; save(); buzz('medium'); renderAll(); });

  document.addEventListener('click', function (e) {
    if (sheet.contains(e.target)) return; // sheets bind their own controls
    if (e.target.closest('[data-water-add]')) { const ws = state.settings.waterSizes[0], prev = addWater(viewDay, ws); toast('+' + fmtWater(ws) + ' water', function () { state.water[viewDay] = prev; if (!prev) delete state.water[viewDay]; save(); renderDiary(); }); return; }
    if (e.target.closest('#waterTile')) { buzz('light'); waterSheet(viewDay); return; }
    if (e.target.closest('[data-hl-edit]')) { buzz('light'); highlightsSheet(); return; }
    const rx = e.target.closest('[data-ram-x], [data-ram-x2]');
    if (rx) { if (rx.dataset.ramX) state.ui.ramAsk = rx.dataset.ramX; else state.ui.ramOff = rx.dataset.ramX2; save(); buzz('light'); renderDiary(); return; }
    const ro = e.target.closest('[data-ram-off]');
    if (ro) { const snap = snapshot(); state.settings.ramadan = null; state.ui.ramOff = ro.dataset.ramOff; applyMeals(); save(); renderAll(); buzz('success'); toast('Ramadan mode off', function () { restore(snap); }); return; }
    const hxb = e.target.closest('[data-hint-x]');
    if (hxb) {
      const snap = snapshot(), t = todayISO(), o = state.ui.hintOff && state.ui.hintOff.d === t ? state.ui.hintOff : { d: t, k: [] };
      if (o.k.indexOf(hxb.dataset.hintX) < 0) o.k.push(hxb.dataset.hintX);
      state.ui.hintOff = o; save(); buzz('light'); renderDiary(); toast('Hidden for today', function () { restore(snap); }); return;
    }
    if (e.target.closest('[data-plan-day]')) { buzz('light'); planDaySheet(); return; }
    const srcb = e.target.closest('[data-src]');
    if (srcb) { buzz('light'); sourcesSheet(srcb.dataset.src, srcb.dataset.days ? todayISO() : viewDay, +srcb.dataset.days || 1); return; }
    if (e.target.closest('[data-hi-find]')) { buzz('light'); highInSheet('fib'); return; }
    const lg = e.target.closest('[data-log-ref]');
    if (lg) { const f = getFood(lg.dataset.logRef); if (f) { buzz('light'); addFoodSheet(null, todayISO(), null, f); } return; }
    const eat = e.target.closest('[data-eat]');
    if (eat) { const it = foodFor(viewDay).find(function (x) { return x.id === eat.dataset.eat; }); if (it) { const snap = snapshot(); delete it.plan; if (viewDay === todayISO() && !it.t) it.t = nowHM(); save(); renderAll(); eatenFlash(it.id); buzz('success'); toast('Eaten · ' + (it.name || 'food'), function () { restore(snap); }); } return; }
    const mt = e.target.closest('[data-mt]'); if (mt) { measKey = mt.dataset.mt; buzz('light'); renderBody(); return; }
    if (e.target.closest('[data-bk-later]')) { state.ui.backupLater = Date.now() + 7 * 864e5; save(); buzz('light'); renderDiary(); return; }
    if (e.target.closest('[data-gs-hide]')) { state.ui.gsHide = true; save(); buzz('light'); renderDiary(); return; }
    const gs = e.target.closest('[data-gs]');
    if (gs) { buzz('light'); const k = gs.dataset.gs; if (k === 'targets') showTab('targets'); else if (k === 'food') addFoodSheet(); else if (k === 'water') waterSheet(todayISO()); else logSheet(); return; }
    const gh = e.target.closest('[data-gap-hide]');
    if (gh) { state.ui.gapHide = gh.dataset.gapHide; save(); buzz('light'); renderDiary(); return; }
    const gf = e.target.closest('[data-gap-f]');
    if (gf) { const f = getFood(gf.dataset.gapF); if (f) { buzz('light'); addFoodSheet(null, viewDay, null, f); } return; }
    const gq = e.target.closest('[data-gap-high]');
    if (gq) { buzz('light'); highInSheet(gq.dataset.gapHigh); return; }
    if (e.target.closest('[data-wr-hide]')) { state.ui.weekSeen = weekStart(dayNum(todayISO())); save(); buzz('light'); renderDiary(); return; }
    if (e.target.closest('[data-month-report]')) { buzz('light'); shareMonth(); return; }
    const ntp = e.target.closest('[data-nt-plan]');
    if (ntp) { buzz('light'); if (ntp.dataset.ntPlan === 'kcal') tgOpen('goal'); else macrosSheet(); return; }
    const tgb = e.target.closest('[data-tg]');
    if (tgb && state.ui.tab === 'targets') { buzz('light'); tgOpen(tgb.dataset.tg); return; }
    const cm = e.target.closest('[data-cal-m]');
    if (cm) { calOff = Math.max(0, calOff + Number(cm.dataset.calM)); buzz('light'); const c = $('.cal-card'); if (c) c.outerHTML = calCard(); return; }
    const cd = e.target.closest('[data-cal-day]');
    if (cd) { buzz('light'); viewDay = cd.dataset.calDay; renderDiary(); showTab('diary'); return; }
    const sxb = e.target.closest('[data-same-x]');
    if (sxb) { const m = sxb.dataset.sameX, sx = state.ui.sameX && state.ui.sameX.d === viewDay ? state.ui.sameX : { d: viewDay, m: [] }; if (sx.m.indexOf(m) < 0) sx.m.push(m); state.ui.sameX = sx; save(); buzz('light'); renderDiary(); return; }
    const sy = e.target.closest('[data-same]');
    if (sy) { const its = sameItems(sy.dataset.same); if (its.length) copyFood(its.map(function (it) { return Object.assign(repItemCopy(it), { meal: sy.dataset.same }, it.t ? { t: it.t } : {}); }), viewDay, viewDay === todayISO() ? 'Added from yesterday' : 'Added from the day before'); return; }
    const us = e.target.closest('[data-usual]');
    if (us) { const u = usualFor(us.dataset.usual); if (u) { const snap = snapshot(); addItems(viewDay, u.map(function (it) { const c = Object.assign({}, it, { id: newId(), meal: us.dataset.usual }); delete c.plan; delete c.pic; delete c.note; delete c.u; return c; })); save(); renderAll(); buzz('success'); toast('Added your usual ' + mealName(us.dataset.usual).toLowerCase(), function () { restore(snap); }); } return; }
    const hi = e.target.closest('#nutBox [data-high], #mealList [data-high]');
    if (hi) { buzz('light'); highInSheet(hi.dataset.high); return; }
    const a = e.target.closest('[data-action]');
    if (a) {
      const act = a.dataset.action;
      if (act === 'log') logSheet();
      else if (act === 'log-day') logSheet(viewDay);
      else if (act === 'day-menu') { buzz('light'); dayMenu(viewDay); }
      else if (act === 'nutrients') { buzz('light'); nutrientsSheet(viewDay); }
      else if (act === 'day-score') { buzz('light'); dayScoreSheet(viewDay); }
      else if (act === 'go-targets') { showTab('targets'); }
      else if (act === 'sync-now') { buzz('light'); if (!navigator.onLine) toast('You\'re offline. It syncs when you\'re back.'); else { const b = $('.yh-sync'); if (b) b.classList.add('spin'); pull(true).then(function () { if (b) b.classList.remove('spin'); toast(syncError ? 'Couldn\'t sync. Try again in a moment.' : 'Synced'); }); } }
      else if (act === 'fast') { buzz('light'); fastSheet(); }
      else if (act === 'nut-targets') { closeSheet(); if (state.ui.tab !== 'targets') showTab('targets'); tgOpen('cal'); setTimeout(function () { const x = $('#ntTable .nt-sec:nth-child(3)'); if (x) x.scrollIntoView({ block: 'start' }); }, 60); }
      else if (act === 'add') addFoodSheet(null, state.ui.tab === 'diary' ? viewDay : todayISO());
      else if (act === 'goal') goalSheet();
      else if (act === 'theme') { buzz('light'); themeSheet(); }
      else if (act === 'photo-compare') { buzz('light'); photoCompare(); }
      else if (act === 'photo-all') { buzz('light'); photoGallery(); }
      else if (act === 'photo-play') { buzz('light'); photoTimelapse(); }
      else if (act === 'use-bf') { const snap = snapshot(); state.profile.bodyFat = +a.dataset.bf; save(); renderAll(); buzz('success'); toast('Body fat ' + a.dataset.bf + '% · targets updated', function () { restore(snap); }); }
      else if (act === 'new-phase') phaseSheet();
      else if (act === 'details') detailsSheet();
      else if (act === 'activity') activitySheet();
      else if (act === 'real-tdee') realTdeeSheet();
      else if (act === 'macros') macrosSheet();
      else if (act === 'guest') guestSheet();
      else if (act === 'import-csv') $('#csvFile').click();
      else if (act === 'import-crono') $('#cronoFile').click();
      else if (act === 'measure') measureSheet();
      else if (act === 'add-photo') addPhotoFlow();
      else if (act === 'flex') { buzz('light'); flexSheet(); }
      else if (act === 'insights') { buzz('light'); insightsSheet(); }
      else if (act === 'ramadan') { buzz('light'); ramadanSheet(); }
      else if (act === 'cycle') { buzz('light'); cycleSheet(); }
      else if (act === 'food') addFoodSheet();
      else if (act === 'adjust-info') adjustSheet();
      else if (act === 'tg-explain') { buzz('light'); targetExplainSheet(); }
      else if (act === 'account') accountSheet();
      else if (act === 'week') weekSheet(weekStart(dayNum(todayISO())));
      else if (act === 'week-review') { buzz('light'); weekReviewSheet(weekStart(dayNum(todayISO())) - 7); }
      else if (act === 'training') { buzz('light'); trainSheet(); }
      else if (act === 'data-backup') { buzz('light'); dataSheet('backup'); }
      else if (act === 'data-import') { buzz('light'); dataSheet('import'); }
      else if (act === 'week-at') weekSheet(+a.dataset.start);
      else if (act === 'whats-new') whatsNewSheet();
      else if (act === 'legal') { buzz('light'); legalSheet(); }
      else if (act === 'export-json') exportJSON();
      else if (act === 'health') { buzz('light'); healthSheet(); }
      else if (act === 'backups') { buzz('light'); backupsSheet(); }
      else if (act === 'achievements') { buzz('light'); achievementsSheet(); }
      else if (act === 'dups') { buzz('light'); dupsSheet(); }
      else if (act === 'chart-kcal') { state.ui.chartKcal = !state.ui.chartKcal; save(); buzz('light'); renderChart(); $('#ckToggle').setAttribute('aria-pressed', !!state.ui.chartKcal); }
      else if (act === 'export-csv') exportCSV();
      else if (act === 'export-food') exportFood();
      else if (act === 'import') $('#importFile').click();
      else if (act === 'check-update') checkUpdate();
      else if (act === 'show-all') { showAllEntries = true; renderProgress(); }
      else if (act === 'erase') {
        if (!entries().length && !state.phases.length && !state.settings.goalKg && !Object.keys(state.food).length && !state.myFoods.length && !state.recipes.length && !state.meals.length) { toast('Nothing to erase'); return; }
        confirmSheet('Erase everything?', 'Removes every weigh-in, food log, your own foods, recipes, meals, water, fasting and measurements from this device' + (state.sync.uid ? ' and your account.' : '.') + ' Your settings stay.', 'Erase', true, function () {
          const snap = snapshot();
          state.entries = []; state.phases = []; state.settings.goalKg = null; state.food = {}; state.myFoods = []; state.favs = []; state.offFoods = []; state.recipes = []; state.meals = [];
          state.water = {}; state.goals = {}; state.dayType = {}; state.measures = []; state.fast = { goal: state.fast.goal, start: null, log: [] };
          save(); renderAll(); buzz('warn');
          toast('Erased', function () { restore(snap); });
        });
      }
      return;
    }
    const ed = e.target.closest('[data-edit]');
    if (ed) { buzz('light'); logSheet(ed.dataset.edit); return; }
    const dp = e.target.closest('[data-del-phase]');
    if (dp) {
      const date = dp.dataset.delPhase, snap = snapshot();
      state.phases = state.phases.filter(function (x) { return x.date !== date; });
      save(); renderAll(); buzz('medium');
      toast('Phase removed', function () { restore(snap); });
      return;
    }
    const dir = e.target.closest('[data-dir]');
    if (dir) {
      const v = dir.dataset.dir;
      if (v === currentPace().dir) return;
      setPace(v, v === 'lose' ? 1 : 0); // defaults: lose 0.5 kg (1 lb), gain 0.25 kg (0.5 lb)
      save(); buzz('light'); renderAll();
      return;
    }
    const rate = e.target.closest('[data-rate]');
    if (rate) { setPace(currentPace().dir, +rate.dataset.rate); save(); buzz('light'); renderAll(); return; }
    const am = e.target.closest('[data-add-meal]');
    if (am) { addFoodSheet(am.dataset.addMeal, viewDay); return; }
    const fo = e.target.closest('[data-fold]');
    if (fo) {
      const k = fo.dataset.fold, i = state.ui.folded.indexOf(k), box = fo.nextElementSibling;
      if (i >= 0) state.ui.folded.splice(i, 1); else state.ui.folded.push(k); save(); buzz('light'); fo.setAttribute('aria-expanded', i >= 0);
      // History and Phases open and fold smoothly (what's below moves with them)
      box.getAnimations && box.getAnimations().forEach(function (a) { a.cancel(); });
      if (calmMotion() || !box.animate) { box.hidden = i < 0; return; }
      box.style.overflow = 'hidden';
      if (i >= 0) { box.hidden = false; const h = box.offsetHeight; box.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = function () { box.style.overflow = ''; }; }
      else { const h = box.offsetHeight, a = box.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }); a.onfinish = function () { box.hidden = true; box.style.overflow = ''; a.cancel(); }; }
      return;
    }
    const tg = e.target.closest('[data-toggle-meal]');
    if (tg) {
      const k = tg.dataset.toggleMeal, i = state.ui.shut.indexOf(k), body = (tg.closest('.meal-sec') || document).querySelector('.meal-body');
      const flip = function () { const j = state.ui.shut.indexOf(k); if (j >= 0) state.ui.shut.splice(j, 1); else state.ui.shut.push(k); save(); renderDiary(); };
      buzz('light');
      if (calmMotion()) { flip(); return; }
      // folding: the foods tuck away first (and stay tucked while the Diary redraws); opening: the meals below glide
      // down to make room while the foods fade in
      if (i < 0 && body && body.animate) { body.style.overflow = 'hidden'; body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 220, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).onfinish = flip; return; }
      flip();
      const nb = i >= 0 && ($('[data-mh="' + k + '"]') || { closest: function () { return null; } }).closest('.meal-sec'), b2 = nb && nb.querySelector('.meal-body');
      if (b2 && b2.animate) b2.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 40, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      return;
    }
    const mm = e.target.closest('[data-meal-menu]');
    if (mm) { buzz('light'); mealSheet(mm.dataset.mealMenu, viewDay); return; }
    const smo = e.target.closest('[data-sw-more]');
    if (smo) { swMore(smo.closest('.sw')); return; }
    const sa = e.target.closest('[data-sw-act]');
    if (sa) {
      const id = sa.dataset.id, k = sa.dataset.swAct, it = foodFor(viewDay).find(function (x) { return x.id === id; }); swClose();
      if (!it) return;
      if (k === 'del') removeFoodItem(id, viewDay);
      else if (k === 'copy') { buzz('light'); copyItemSheet(id, viewDay); }
      else { buzz('light'); addFoodSheet(null, viewDay, it, null, true); }
      return;
    }
    const qa = e.target.closest('.food-item .row-v');
    if (qa && !swOpen && !qa.closest('.day-total')) { e.stopPropagation(); quickAmount(qa, qa.closest('[data-food]').dataset.food); return; }
    const pc = e.target.closest('[data-pic]');
    if (pc) { e.stopPropagation(); buzz('light'); picView(pc.dataset.pic); return; }
    const fi = e.target.closest('[data-food]');
    if (fi) { if (swOpen) { swClose(); return; } buzz('light'); foodItemSheet(fi.dataset.food, viewDay); return; }
    const phb = e.target.closest('[data-photo]');
    if (phb) { photoSheet(phb.dataset.photo); return; }
    const go = e.target.closest('[data-go]');
    if (go) showTab(go.dataset.go);
  });

  let resizeT = null;
  window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(renderChart, 120); });
  let lastDay = todayISO();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      if (todayISO() !== lastDay) { lastDay = todayISO(); viewDay = lastDay; applyRepeats(); renderAll(); }
      else if (applyRepeats()) renderAll();
      const tn = autoTune(); if (tn) { renderAll(); tuneToast(tn); }
      if (swReg) swReg.update().catch(function () {});
      if (user) { if (state.sync.dirty) push(); else pull(false); photoSyncSoon(4000); }
    } else maybeReload(true);
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); applyAppearance(); renderAll(); } });

