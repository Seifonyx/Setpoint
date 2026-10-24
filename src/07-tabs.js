  /* ================= Tabs ================= */
  let lastMain = 'diary';
  // The soft highlight behind the selected tab glides to the next one instead of jumping.
  const MAIN_TABS = ['diary', 'progress', 'foods', 'you'];
  const tabPill = document.createElement('span'); tabPill.className = 'tab-pill'; tabPill.setAttribute('aria-hidden', 'true');
  // The theme's own highlight colour (each style has its own), looked up once for each look.
  let pillBg = { k: '', v: '' };
  function pillColour(ico, bar) {
    const r = document.documentElement, k = r.getAttribute('data-style') + '|' + r.getAttribute('data-mode') + '|' + r.hasAttribute('data-oled') + '|' + r.classList.contains('tabs-top');
    if (pillBg.k === k && pillBg.v) return pillBg.v;
    $$('.tab-ico', bar).forEach(function (x) { x.style.transition = 'none'; });
    bar.classList.remove('pill-on'); const v = getComputedStyle(ico).backgroundColor; bar.classList.add('pill-on');
    if (v && v !== 'transparent' && v !== 'rgba(0, 0, 0, 0)') pillBg = { k: k, v: v };
    return v;
  }
  addEventListener('load', function () { pillBg = { k: '', v: '' }; });
  function placePill(animate) {
    const inner = document.querySelector('.tabbar-inner'), ico = document.querySelector('.tab-btn[aria-current="page"] .tab-ico'), bar = document.querySelector('.tabbar');
    // the floating glass bar at the bottom highlights the whole tab (icon and name), like iPhone
    const sel = ico && !document.documentElement.classList.contains('tabs-top') ? ico.parentNode : ico;
    if (!inner || !bar) return;
    if (!tabPill.parentNode) inner.prepend(tabPill);
    if (!sel || !sel.offsetWidth) { tabPill.style.opacity = '0'; return; }
    const bg = pillColour(ico, bar);
    tabPill.style.transition = animate ? '' : 'none';
    tabPill.style.background = bg; tabPill.style.width = sel.offsetWidth + 'px'; tabPill.style.height = sel.offsetHeight + 'px';
    tabPill.style.transform = 'translate(' + sel.offsetLeft + 'px,' + sel.offsetTop + 'px)'; tabPill.style.opacity = '1';
    if (!animate) { void tabPill.offsetWidth; tabPill.style.transition = ''; }
  }
  addEventListener('resize', function () { placePill(false); });
  // Press and slide on the tab bar, like iPhone: the highlight swells into a lens, follows your finger
  // with a tick on each tab, and lifting your finger opens the tab under it.
  (function () {
    const inner = document.querySelector('.tabbar-inner'); if (!inner) return;
    let drag = null, eatClick = 0;
    const tabs = function () { return $$('.tab-btn', inner).filter(function (b) { return b.offsetWidth; }); };
    const nearest = function (x) { let best = null, bd = 1e9; tabs().forEach(function (b) { const r = b.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - x); if (d < bd) { bd = d; best = b; } }); return best; };
    const lens = function (x) {
      const ir = inner.getBoundingClientRect(), ts = tabs(); if (!ts.length) return;
      const w = tabPill.offsetWidth || ts[0].offsetWidth, a = ts[0].getBoundingClientRect(), z = ts[ts.length - 1].getBoundingClientRect();
      const lo = Math.min(a.left, z.left) - ir.left, hi = Math.max(a.right, z.right) - ir.left - w;
      const left = Math.max(lo - 6, Math.min(hi + 6, x - ir.left - w / 2)); // a little give past the ends
      tabPill.style.transform = 'translate(' + left + 'px,' + drag.top + 'px) scale(1.14,1.1)';
    };
    const hover = function (b) { if (drag.on === b) return; if (drag.on) drag.on.classList.remove('tb-hover'); drag.on = b; if (b) b.classList.add('tb-hover'); };
    const end = function (go) {
      if (!drag) return; const d = drag; drag = null;
      document.querySelector('.tabbar').classList.remove('tb-held'); tabPill.classList.remove('lens');
      if (d.on) d.on.classList.remove('tb-hover');
      if (go && d.moved && d.on) { eatClick = Date.now(); if (d.on.dataset.tab !== state.ui.tab) d.on.click(); else placePill(true); }
      else placePill(true);
    };
    inner.addEventListener('pointerdown', function (e) {
      const b = e.target.closest('.tab-btn'); if (!b || e.button > 0 || !tabPill.parentNode) return;
      const ref = document.documentElement.classList.contains('tabs-top') ? b.querySelector('.tab-ico') : b; // what the highlight covers
      drag = { id: e.pointerId, x0: e.clientX, moved: false, on: null, top: ref.offsetTop || 0 };
      document.querySelector('.tabbar').classList.add('tb-held'); tabPill.classList.add('lens'); tabPill.style.opacity = '1';
      if (!b.hasAttribute('aria-current')) { tabPill.style.width = ref.offsetWidth + 'px'; tabPill.style.height = ref.offsetHeight + 'px'; }
      lens(e.clientX); hover(b);
    });
    inner.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.abs(e.clientX - drag.x0) > 6) { drag.moved = true; try { inner.setPointerCapture(e.pointerId); } catch (er) {} }
      if (!drag.moved) return;
      lens(e.clientX); const b = nearest(e.clientX); if (b && b !== drag.on) { hover(b); buzz('light'); }
    });
    inner.addEventListener('pointerup', function (e) { if (drag && e.pointerId === drag.id) end(true); });
    inner.addEventListener('pointercancel', function () { end(false); });
    inner.addEventListener('lostpointercapture', function () { if (drag && drag.moved) end(true); });
    // the click that follows a slide was already handled
    inner.addEventListener('click', function (e) { if (Date.now() - eatClick < 400 && e.isTrusted) { e.stopPropagation(); e.preventDefault(); } }, true);
  })();
  // Big page titles shrink into a small bar at the top once you scroll past them (like iPhone apps).
  const miniBar = document.createElement('div'); miniBar.className = 'mini-bar'; miniBar.setAttribute('aria-hidden', 'true'); miniBar.innerHTML = '<span></span>'; document.body.appendChild(miniBar);
  let miniRaf = 0;
  function miniCheck() {
    miniRaf = 0;
    const panel = document.querySelector('main > .tab-panel:not([hidden])'), h1 = panel && panel.querySelector('.page-head:not([hidden]) h1');
    const on = !!h1 && h1.getBoundingClientRect().bottom < 6;
    if (on) miniBar.firstChild.textContent = h1.textContent;
    miniBar.classList.toggle('on', on);
  }
  window.addEventListener('scroll', function () { if (!miniRaf) miniRaf = requestAnimationFrame(miniCheck); }, { passive: true });
  // Going into Settings or Plan slides the page in like iPhone navigation (going back is goBack's job).
  function showTab(tab, silent, fromBack) {
    const prev = state.ui.tab;
    if (!silent && !fromBack && (tab === 'targets' || tab === 'settings') && tab !== prev) { pageMove('push', function () { showTabNow(tab, silent, fromBack); }); return; }
    showTabNow(tab, silent, fromBack);
  }
  function showTabNow(tab, silent, fromBack) {
    const sub = function (t) { return t === 'targets' || t === 'settings'; }, prev = state.ui.tab;
    if (sub(tab) && !sub(prev)) navPush('page'); else if (!sub(tab) && sub(prev) && !fromBack) navDrop('page');
    // A list open in Foods is a level of its own while you're on the Foods tab.
    if (prev === 'targets' && tab !== 'targets' && tgView) { navDrop('tv'); tgView = null; showTgView(); }
    if (prev === 'foods' && tab !== 'foods' && foodsView) navDrop('fv'); else if (tab === 'foods' && prev !== 'foods' && foodsView) navPush('fv');
    if (tab === 'diary' || tab === 'progress' || tab === 'foods' || tab === 'you') lastMain = tab;
    state.ui.tab = tab; save();
    const tabOf = tab === 'settings' || tab === 'targets' ? 'you' : tab; // pages inside You keep You lit
    $$('.tab-btn').forEach(function (b) { const on = b.dataset.tab === tabOf; if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    if (tab === 'you') renderYouHero();
    // Between the four main tabs, the page slides in from the side you're heading to.
    const from = MAIN_TABS.indexOf(prev), to = MAIN_TABS.indexOf(tab), pnl = $('#panel-' + tab);
    if (pnl && from >= 0 && to >= 0 && from !== to && !silent && !navInstant) {
      const dir = (to > from ? 1 : -1) * (document.documentElement.dir === 'rtl' ? -1 : 1);
      pnl.style.setProperty('--tab-dx', dir * 18 + 'px'); pnl.classList.remove('tab-slide'); void pnl.offsetWidth; pnl.classList.add('tab-slide');
      clearTimeout(pnl._ts); pnl._ts = setTimeout(function () { pnl.classList.remove('tab-slide'); }, 450);
    }
    $$('main > .tab-panel').forEach(function (p) { p.hidden = p.id !== 'panel-' + tab; }); // (not the still copy of the page that's sliding away)
    if (tab === 'progress') showProg(state.ui.prog, true);
    if (tab === 'foods') renderFoods();
    const pn = $('#panel-' + tab); if (pn && !silent && !navInstant) { pn.classList.add('anim-in'); setTimeout(function () { pn.classList.remove('anim-in'); }, 700); }
    if (!silent) { buzz('light'); window.scrollTo(0, 0); }
    // measuring waits for the frame, once everything above has been drawn (one layout instead of several)
    const glide = !silent && !navInstant;
    requestAnimationFrame(function () { placePill(glide); miniCheck(); });
  }
  function showProg(which, silent) {
    const order = ['weight', 'nutrition', 'body'], was = order.indexOf(state.ui.prog), now = order.indexOf(which);
    state.ui.prog = which; save();
    $$('#progSeg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.prog === which); });
    ['weight', 'nutrition', 'body'].forEach(function (k) { $('#prog-' + k).hidden = k !== which; });
    if (which === 'nutrition' && $('#panel-progress').hidden === false) catchUp('nut');
    // The range buttons sit inside the weight chart card; for nutrition they sit above the trends.
    const rs = $('#rangeSeg'); if (which === 'weight') $('#chartRangeSlot').appendChild(rs); else { const tb = $('#trendBox .tr-pick'); if (tb) tb.parentNode.insertBefore(rs, tb.nextSibling); }
    $('#rangeSeg').hidden = which === 'body'; $$('#rangeSeg button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.range === state.ui.range); }); $$('#rangeSeg button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.range === state.ui.range); });
    if (!silent) buzz('light');
    if (which === 'weight') renderChart();
    if (which === 'nutrition') renderLowCard();
    // Weight, Nutrition and Body slide in from the side you tapped, like the tabs
    const sec = $('#prog-' + which);
    if (!silent && sec && sec.animate && was >= 0 && was !== now && !calmMotion()) {
      const dx = (now > was ? 1 : -1) * (document.documentElement.dir === 'rtl' ? -1 : 1) * 22;
      sec.animate([{ opacity: 0, transform: 'translateX(' + dx + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  }
  function goBack(fromBack) { const t = state.ui.tab, to = t === 'targets' || t === 'settings' ? 'you' : lastMain; pageMove('pop', function () { showTabNow(to, false, fromBack === true); }); }

