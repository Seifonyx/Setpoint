  /* ================= Going back ================= */
  // Each level you can go back from (a page inside a tab, a list in Foods, an open sheet) is one step back.
  // Android and browsers: each step is a history entry, so the phone's back button or gesture goes back one level.
  // iPhone: no history entries (iOS would flash an old snapshot of the page while swiping); instead the app has its
  // own edge swipe that shows the real screen underneath and follows your finger.
  const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Home-screen app on iPhone: newer iOS draws the app under the clock even with the "default" status bar, but still
  // reports a top safe area of 0. Then use the real status bar height, so sheets and headers stay below it.
  (function safeTop() {
    if (!IOS) return;
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;left:0;height:0;visibility:hidden;padding-top:env(safe-area-inset-top,0px)';
    const fix = function () {
      const root = document.documentElement; root.style.removeProperty('--safe-t');
      document.body.appendChild(probe); const env = parseFloat(getComputedStyle(probe).paddingTop) || 0; probe.remove();
      const sh = Math.max(screen.width, screen.height), portrait = innerHeight > innerWidth;
      // the app covers the whole screen (so the clock sits on top of it) but iOS says there's no inset
      if (env < 20 && portrait && innerHeight >= sh - 2) root.style.setProperty('--safe-t', (sh >= 852 ? 59 : sh >= 812 ? 50 : 20) + 'px');
    };
    fix(); addEventListener('resize', fix); addEventListener('orientationchange', function () { setTimeout(fix, 300); });
  })();
  const NAV_ID = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const navStack = [];
  let navSkip = 0, navQueue = 0, navPopAt = 0, navInstant = false;
  if (!IOS) try { history.replaceState({ navBase: NAV_ID }, ''); } catch (e) {}
  function navPush(tag) {
    navStack.push(tag);
    if (IOS) return;
    if (navSkip) navQueue++; else history.pushState({ nav: navStack.length, id: NAV_ID }, ''); // wait for our own history.back() to finish first
  }
  // Left a level with a button on screen: take its step away too.
  function navDrop(tag) {
    const i = navStack.lastIndexOf(tag); if (i < 0) return;
    navStack.splice(i, 1);
    if (IOS) return;
    if (navQueue) { navQueue--; return; }
    navSkip++; history.back();
  }
  // Go back one level (from the phone's back, or the iPhone edge swipe).
  function navBack(anim) {
    const top = navStack.pop(); if (!top) return;
    navInstant = !(anim && top !== 'sheet'); // the phone's back button moves pages like a back tap; a swipe has already moved them
    try {
      if (top === 'sheet') {
        // A sheet with steps (search → amount) goes back a step; otherwise it closes.
        const b = sheet.classList.contains('open') && $('#sheetBody .sheet-head .back-btn:not(.sheet-x):not([data-close])');
        if (b && b.offsetParent) { navPush('sheet'); b.click(); } else closeSheet(true);
      } else if (top === 'page') goBack(true);
      else if (top === 'tv') tgClose(true);
      else if (top === 'fv') pageMove('pop', function () { foodsView = null; $('#mfQ').value = ''; renderFoods(); });
    } finally { navInstant = false; }
  }
  window.addEventListener('popstate', function (e) {
    if (IOS) return;
    navPopAt = Date.now();
    if (navSkip) { navSkip--; if (!navSkip) for (; navQueue; navQueue--) history.pushState({ nav: navStack.length, id: NAV_ID }, ''); return; }
    const st = e.state || {};
    if (!navStack.length) { if (st.nav && st.id !== NAV_ID) history.back(); return; } // a level left over from before a reload: skip it
    navBack(true);
  });
  // iPhone: swipe from the edge to go back. The screen you're going back to is shown underneath as you drag.
  // Smoothness: moves are drawn once per frame on the GPU, flicks use your finger's latest speed, and the finish
  // carries that speed on instead of starting a fresh animation.
  (function edgeSwipe() {
    if (!IOS) return;
    const EDGE = 28, PAR = 0.3;
    let x0 = 0, y0 = 0, on = false, el = null, under = null, wrap = null, home = null, dim = null, shade = null, dx = 0, kind = '', raf = 0, busy = false;
    const fs = fingerSpeed();
    const rtl = function () { return document.documentElement.dir === 'rtl'; };
    const atEdge = function (x) { return (rtl() ? innerWidth - x : x) <= EDGE; };
    const sgn = function () { return rtl() ? -1 : 1; };
    // The swipe stays inside the app: a touch that starts at the edge isn't for card swipers or swipe-to-reveal rows.
    document.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch' && navStack.length && atEdge(e.clientX)) e.stopPropagation(); }, true);
    const mkUnder = function (inner) {
      wrap = document.createElement('div'); wrap.className = 'edge-under' + (document.documentElement.classList.contains('tabs-top') ? ' top' : '');
      wrap.appendChild(inner); dim = document.createElement('div'); dim.className = 'edge-dim'; wrap.appendChild(dim);
      document.body.appendChild(wrap); under = wrap;
    };
    const begin = function () {
      if (pageRun) pageRun.end(); // a page still sliding in: it finishes first, then the swipe takes it from there
      kind = navStack[navStack.length - 1];
      if (kind === 'sheet') el = sheet.classList.contains('open') ? sheet : null;
      else {
        el = document.querySelector('main'); if (!el) return;
        if (kind === 'fv' && fvSnap) { // a list in Foods: the Foods page goes underneath
          const ph = $('#panel-foods .page-head').cloneNode(true), pn = document.createElement('div');
          ph.hidden = false; $$('[id]', ph).forEach(function (x) { x.removeAttribute('id'); });
          pn.className = 'tab-panel'; pn.appendChild(ph); pn.insertAdjacentHTML('beforeend', '<div>' + fvSnap + '</div>');
          home = null; mkUnder(pn);
        } else if (kind === 'tv' && tvSnap) { // a page inside Targets: the Targets menu goes underneath
          const ph = $('#panel-targets .page-head').cloneNode(true), pn = document.createElement('div');
          $$('[id]', ph).forEach(function (x) { x.removeAttribute('id'); }); const h1 = ph.querySelector('h1'); if (h1) h1.textContent = typeof tr === 'function' && state.settings.lang === 'ar' ? tr('Plan') || 'Plan' : 'Plan';
          pn.className = 'tab-panel'; pn.appendChild(ph); pn.insertAdjacentHTML('beforeend', '<div>' + tvSnap + '</div>');
          home = null; mkUnder(pn);
        } else if (kind === 'page') { // the page you'll land on, in its own layer
          const t = state.ui.tab, to = t === 'targets' || t === 'settings' ? 'you' : lastMain, p = $('#panel-' + to);
          if (to === 'you') renderYouHero();
          if (p && p.hidden) { home = { parent: p.parentNode, next: p.nextSibling }; p.hidden = false; mkUnder(p); }
        }
        shade = document.createElement('div'); shade.className = 'edge-shade' + (rtl() ? ' rtl' : ''); document.body.appendChild(shade);
      }
      if (!el) return;
      el.classList.add('edge-drag'); el.style.transition = 'none';
      if (under) under.style.transition = 'none';
      if (kind === 'sheet') scrim.style.transition = 'none';
    };
    const paint = function () {
      raf = 0; if (!el) return;
      const d = dx, k = Math.min(1, d / innerWidth), x = sgn() * d;
      el.style.transform = d ? 'translate3d(' + x + 'px,0,0)' : '';
      if (shade) shade.style.transform = 'translate3d(' + x + 'px,0,0)';
      if (under) under.style.transform = 'translate3d(' + (-sgn() * innerWidth * PAR * (1 - k)) + 'px,0,0)';
      if (dim) dim.style.opacity = String(0.22 * (1 - k));
      if (kind === 'sheet') scrim.style.opacity = String(1 - k);
    };
    const clean = function () {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (el) { el.style.transition = 'none'; el.style.transform = ''; el.classList.remove('edge-drag'); }
      if (wrap) { const p = wrap.firstElementChild; if (p && home) { home.parent.insertBefore(p, home.next); p.hidden = ('panel-' + state.ui.tab) !== p.id; settleAnims(p); } wrap.remove(); }
      if (shade) shade.remove();
      scrim.style.transition = ''; scrim.style.opacity = '';
      const e1 = el; el = null; under = null; wrap = null; home = null; dim = null; shade = null; busy = false;
      if (e1) requestAnimationFrame(function () { e1.style.transition = ''; });
    };
    // Finish (or spring back) from where the finger let go: one spring for the page, its shadow, the page underneath
    // and the dimming, starting at the finger's speed.
    const settle = function (go, v) {
      busy = true;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      const W = innerWidth, sg = sgn(), target = go ? W : 0, k0 = Math.min(1, dx / W), k1 = go ? 1 : 0;
      const tx = function (d) { return { transform: 'translate3d(' + sg * d + 'px,0,0)' }; }, ux = function (k) { return { transform: 'translate3d(' + (-sg * W * PAR * (1 - k)) + 'px,0,0)' }; };
      const parts = [];
      if (el) parts.push([el, tx(dx), tx(target)]);
      if (shade) parts.push([shade, tx(dx), tx(target)]);
      if (under) parts.push([under, ux(k0), ux(k1)]);
      if (dim) parts.push([dim, { opacity: 0.22 * (1 - k0) }, { opacity: 0.22 * (1 - k1) }]);
      if (kind === 'sheet') parts.push([scrim, { opacity: 1 - k0 }, { opacity: 1 - k1 }]);
      parts.forEach(function (q) { q[0].style.transition = 'none'; });
      const done = function () { if (go) { buzz('light'); navBack(); } clean(); };
      if (calmMotion()) { done(); return; }
      springGroup(parts, { response: go ? 0.36 : 0.34, damping: 1, v: go ? v : -v, dist: Math.abs(target - dx), noOver: true }).onEnd = done;
    };
    document.addEventListener('touchstart', function (e) {
      on = false; if (e.touches.length !== 1 || !navStack.length || dragActive || el || busy) return;
      const t = e.touches[0]; if (!atEdge(t.clientX)) return;
      x0 = t.clientX; y0 = t.clientY; dx = 0; on = true; fs.reset(); fs.add(0, e.timeStamp);
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!on) return;
      const t = e.touches[0], d = (t.clientX - x0) * sgn(), dy = Math.abs(t.clientY - y0);
      if (!el) { if (dy > 10 && dy > d) { on = false; return; } if (d < 6) return; begin(); if (!el) { on = false; return; } }
      dx = Math.max(0, d); fs.add(dx, e.timeStamp);
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (!on) return; on = false; if (!el) return;
      // the finger's speed as it let go (px/ms): a quick flick counts even if the swipe was short; 0 if it rested first
      const lt = e.changedTouches[0]; if (lt) { dx = Math.max(0, (lt.clientX - x0) * sgn()); fs.add(dx, e.timeStamp); }
      const v = fs.get(e.timeStamp);
      settle((v > 0.5 && dx > 40) || (dx > innerWidth * 0.45 && v > -0.2), v);
    }, { passive: true });
    // The phone took the touch over: put things back, never go back from here.
    document.addEventListener('touchcancel', function () { if (!on) return; on = false; if (el) settle(false, 1); }, { passive: true });
  })();

  // Finish (not replay) the entrance animations of something that's already on screen, e.g. a page that moved
  // into place: CSS restarts an element's animations whenever it's shown or moved.
  function settleAnims(root) {
    if (!root || !document.getAnimations) return;
    root.getBoundingClientRect(); // let the browser start them first
    document.getAnimations().forEach(function (a) {
      const t = a.effect && a.effect.target, tm = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
      if (!t || !root.contains(t) || !tm || tm.iterations === Infinity || !window.CSSAnimation || !(a instanceof CSSAnimation)) return;
      try { a.finish(); } catch (e) {}
    });
  }
  // Tapping into a page, or back out of it, moves like iPhone navigation, with the same layers as the edge swipe:
  // forward, the new page slides in over the one you were on, which drifts a third of the way and dims; back is the
  // reverse. A page you go back to is where you left it. Skipped for the phone's own swipe and for reduced motion.
  const pageScroll = {};
  let pageRun = null;
  function pageKey() { const t = state.ui.tab; return t + (t === 'foods' && foodsView ? ':' + foodsView : '') + (t === 'targets' && tgView ? ':' + tgView : ''); }
  // Only what's on screen goes into the copy: anything that starts below the bottom edge is emptied and
  // hidden there (nothing on screen moves, and the browser has far less to lay out as the page slides).
  // Only in plain top-to-bottom layouts, where hiding what comes later can't move what came before.
  function snapTrim(o, c, depth) {
    const cs = getComputedStyle(o), d = cs.display;
    if (!(d === 'block' || d === 'flow-root' || (d === 'flex' && cs.flexDirection === 'column' && /^(normal|flex-start|start)$/.test(cs.justifyContent)))) return;
    const cut = innerHeight + 24, ok = o.children, ck = c.children;
    if (ok.length !== ck.length) return;
    for (let i = ok.length - 1; i >= 0; i--) {
      const k = ok[i], r = k.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (r.top > cut) { const ps = getComputedStyle(k).position; if (ps === 'static' || ps === 'relative') { ck[i].textContent = ''; ck[i].style.setProperty('display', 'none', 'important'); } }
      else if (r.bottom > cut && depth < 6 && k.children.length > 1) snapTrim(k, ck[i], depth + 1);
    }
  }
  // The ids and data-… attributes the stylesheet styles by (read from it once).
  let cssHooks = null;
  function snapHooks() {
    if (cssHooks) return cssHooks;
    const ids = {}, attrs = {};
    const scan = function (rules) { for (let i = 0; i < rules.length; i++) { const r = rules[i], t = r.selectorText;
      if (t) { (t.match(/#[A-Za-z][\w-]*/g) || []).forEach(function (x) { if (!/^#panel-/.test(x)) ids[x.slice(1)] = 1; }); (t.match(/\[data-[\w-]+/g) || []).forEach(function (x) { attrs[x.slice(1)] = 1; }); }
      if (r.cssRules) scan(r.cssRules); } };
    for (let i = 0; i < document.styleSheets.length; i++) { try { scan(document.styleSheets[i].cssRules); } catch (e) {} }
    cssHooks = { ids: ids, attrs: attrs };
    return cssHooks;
  }
  function pageMove(dir, apply) {
    const back = dir === 'pop', from = pageKey(), y = window.scrollY;
    if (back) delete pageScroll[from]; else pageScroll[from] = y;
    // (after the edge swipe the page underneath was shown from the top, so it stays at the top)
    const landed = function () { const k = pageKey(); if (back && !navInstant && pageScroll[k] != null) window.scrollTo(0, pageScroll[k]); else window.scrollTo(0, 0); delete pageScroll[k]; };
    const main = document.querySelector('main'), cur = main && $$('.tab-panel', main).filter(function (x) { return !x.hidden; })[0];
    // two moves in the same tap (Plan, then one of its pages): the second just changes what's sliding in
    if (pageRun && performance.now() - pageRun.t0 < 80) { apply(); landed(); settleAnims(main); return; }
    if (pageRun) pageRun.end();
    if (navInstant || calmMotion() || document.hidden || !cur) { apply(); landed(); return; }
    const rtl = document.documentElement.dir === 'rtl', sg = rtl ? -1 : 1, W = innerWidth, PAR = 0.3, MS = 460, EASE = 'cubic-bezier(.32,.72,0,1)';
    // a still copy of the page you're leaving, drawn exactly where it is on screen
    // (ids and the app's data-… hooks are taken off it, so nothing can find it and mistake it for the real page,
    // except the ones the stylesheet styles by, so it looks exactly the same)
    const snap = cur.cloneNode(true), hk = snapHooks();
    snapTrim(cur, snap, 0);
    [snap].concat($$('*', snap)).forEach(function (el) { for (let i = el.attributes.length - 1; i >= 0; i--) { const n = el.attributes[i].name;
      if (n === 'for' || n === 'name' || (n === 'id' && (!hk.ids[el.id] || el === snap)) || (n.indexOf('data-') === 0 && !hk.attrs[n])) el.removeAttribute(n); } });
    // what copying leaves behind: a menu's current choice and anything drawn on a canvas
    const sels = $$('select', cur), sels2 = $$('select', snap); if (sels.length === sels2.length) sels.forEach(function (x, i) { sels2[i].selectedIndex = x.selectedIndex; });
    const cvs = $$('canvas', cur), cvs2 = $$('canvas', snap); if (cvs.length === cvs2.length) cvs.forEach(function (x, i) { try { if (x.width && x.height) cvs2[i].getContext('2d').drawImage(x, 0, 0); } catch (e) {} });
    snap.style.transform = 'translate3d(0,' + (-y) + 'px,0)';
    const layer = document.createElement('div'); layer.className = (back ? 'page-over' : 'edge-under') + ' snap' + (document.documentElement.classList.contains('tabs-top') ? ' top' : '');
    layer.setAttribute('aria-hidden', 'true'); layer.inert = true; layer.appendChild(snap);
    const dim = document.createElement('div'); dim.className = back ? 'page-dim' : 'edge-dim';
    const shade = document.createElement('div'); shade.className = 'edge-shade' + (rtl ? ' rtl' : '') + (back ? ' over' : '');
    if (back) document.body.appendChild(dim); else layer.appendChild(dim);
    document.body.appendChild(layer); document.body.appendChild(shade);
    main.classList.add('edge-drag', 'pm');
    try { apply(); } finally { landed(); }
    settleAnims(main);
    const put = function (el, x, tr) { el.style.transition = tr || 'none'; el.style.transform = 'translate3d(' + x + 'px,0,0)'; };
    // (the edge shadow fades in as the page arrives and out as it leaves, so it never appears at once at the edge)
    if (back) { put(main, -sg * W * PAR); put(layer, 0); put(shade, 0); shade.style.opacity = '1'; dim.style.opacity = '.22'; }
    else { put(main, sg * W); put(shade, sg * W); shade.style.opacity = '0'; put(layer, 0); dim.style.opacity = '0'; }
    main.getBoundingClientRect();
    const TR = 'transform ' + MS + 'ms ' + EASE, TRS = TR + ', opacity ' + (back ? Math.round(MS * 0.9) + 'ms ease' : Math.round(MS * 0.5) + 'ms ease 20ms');
    dim.style.transition = 'opacity ' + MS + 'ms ease';
    if (back) { put(main, 0, TR); put(layer, sg * W, TR); put(shade, sg * W, TRS); shade.style.opacity = '0'; dim.style.opacity = '0'; }
    else { put(main, 0, TR); put(shade, 0, TRS); shade.style.opacity = '1'; put(layer, -sg * W * PAR, TR); dim.style.opacity = '.22'; }
    let over = false, tm = 0;
    const run = { t0: performance.now(), end: function () {
      if (over) return; over = true; clearTimeout(tm);
      layer.remove(); shade.remove(); dim.remove();
      main.style.transition = 'none'; main.style.transform = ''; main.classList.remove('edge-drag', 'pm');
      requestAnimationFrame(function () { main.style.transition = ''; });
      if (pageRun === run) pageRun = null;
    } };
    pageRun = run; tm = setTimeout(run.end, MS + 40);
  }
