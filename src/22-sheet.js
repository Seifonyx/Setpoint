  /* ================= Sheet ================= */
  const sheet = $('#sheet'), scrim = $('#scrim'), sheetBody = $('#sheetBody');
  let sheetOnClose = null, lastFocus = null;
  let sheetHist = false;
  sheet.addEventListener('scroll', function () {
    const sb = sheet.querySelector('.af-sticky'); if (!sb) return;
    sb.classList.toggle('stuck', sheet.scrollTop > sb.offsetTop - parseFloat(sb.style.top || 0) - 2);
  }, { passive: true });
  let tallOutT = 0, sheetRun = null;
  // A sheet let go of mid-drag is still on its spring: anything that opens or closes a sheet takes over from there.
  function sheetSettle() {
    if (!sheetRun) return;
    const r = sheetRun; sheetRun = null; r.stop();
    sheet.classList.remove('dragging'); sheet.style.pointerEvents = ''; scrim.style.transition = '';
    if (r.closing) { r.onEnd = null; closeSheet(); }
    scrim.style.opacity = '';
  }
  function openSheet(html, onMount, onClose) {
    sheetSettle();
    if (!sheet.classList.contains('open')) { sheetOpenAt = performance.now(); sheetTitleWas = null; }
    if (sheet.classList.contains('open') && sheetOnClose) { const cb = sheetOnClose; sheetOnClose = null; cb(); }
    lastFocus = document.activeElement;
    hideToast();
    if (sheet.classList.contains('auto-tall') || sheet.classList.contains('tall-out')) { clearTimeout(tallOutT); sheet.classList.remove('tall', 'auto-tall', 'tall-out'); }
    sheetBody.innerHTML = html;
    sheet.scrollTop = 0;
    sheetOnClose = onClose || null;
    sheet.style.transform = '';
    sheet.classList.add('open'); scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
    $$('main, .tabbar').forEach(function (el) { el.inert = true; });
    if (!sheetHist) { sheetHist = true; navPush('sheet'); }
    if (onMount) onMount(sheetBody);
    autoTall();
    addSheetX();
  }
  // A small menu under a ⋯ button. items: [{ label, danger, run }]
  function popMenu(anchor, items) {
    closePop();
    const r = anchor.getBoundingClientRect(), m = document.createElement('div');
    m.className = 'pop-menu'; m.setAttribute('role', 'menu');
    m.innerHTML = items.map(function (it, i) { return '<button type="button" role="menuitem" data-pi="' + i + '"' + (it.danger ? ' class="danger"' : '') + '>' + esc(it.label) + '</button>'; }).join('');
    document.body.appendChild(m);
    const w = m.offsetWidth, top = Math.min(innerHeight - m.offsetHeight - 12, r.bottom + 6), left = Math.max(12, Math.min(innerWidth - w - 12, r.right - w));
    m.style.top = top + 'px'; m.style.left = left + 'px';
    // it grows out of the button that opened it (and shrinks back into it), whichever side that ends up on
    m.style.transformOrigin = Math.round(r.left + r.width / 2 - left) + 'px ' + Math.round(r.top + r.height / 2 - top) + 'px';
    requestAnimationFrame(function () { m.classList.add('open'); });
    $$('[data-pi]', m).forEach(function (b) { b.addEventListener('click', function () { const it = items[+b.dataset.pi]; closePop(); buzz('light'); it.run(); }); });
    setTimeout(function () { document.addEventListener('pointerdown', popAway, true); }, 0);
  }
  function popAway(e) { if (!e.target.closest('.pop-menu')) closePop(); }
  function closePop() {
    document.removeEventListener('pointerdown', popAway, true);
    // shrinks back into its button and fades, instead of vanishing at once
    $$('.pop-menu:not(.closing)').forEach(function (m) { m.classList.add('closing'); m.classList.remove('open'); setTimeout(function () { m.remove(); }, calmMotion() ? 0 : 220); });
  }
  // ⋯ in a sheet header: the actions are the buttons in that screen's hidden .menu-src.
  sheet.addEventListener('click', function (e) {
    const b = e.target.closest('[data-more]'); if (!b) return;
    const scope = b.closest('#afRoot, #catRoot, #sheetBody'), src = scope && scope.querySelector('.menu-src'); if (!src) return;
    const items = $$('button', src).filter(function (x) { return !x.hasAttribute('data-off'); }).map(function (x) { return { label: x.dataset.label || x.textContent, danger: x.classList.contains('danger'), run: function () { x.click(); } }; });
    if (items.length) popMenu(b, items);
  });
  // Full-screen sheets close with a ‹ at the top left, like every other page (headers that re-render get it back too).
  function addSheetX() {
    if (!sheet.classList.contains('tall')) return;
    $$('.sheet-head', sheetBody).forEach(function (h) {
      if (h.querySelector('.back-btn, .sheet-x')) return;
      h.insertAdjacentHTML('afterbegin', '<button type="button" class="icon-btn back-btn sheet-x" aria-label="Close">' + BACK_IC + '</button>');
      h.firstElementChild.addEventListener('click', function () { closeSheet(); });
    });
  }
  // A sheet too long to fit (it would reach the clock at the top) opens as a full page with an X instead.
  function autoTall() {
    if (!sheet.classList.contains('open') || sheet.classList.contains('tall')) return;
    if (sheet.scrollHeight > sheet.clientHeight + 2) { sheet.classList.add('tall', 'auto-tall'); sheet.scrollTop = 0; }
  }
  // Moving between a sheet's steps (search → amount, the welcome steps, plan → add) slides the new step in: from the
  // side you're heading to, or from the other side when you went back. Re-drawing the same step doesn't move it.
  let sheetOpenAt = 0, sheetTitleWas = null, sheetBackAt = 0, sheetH = 0, sheetSize = null;
  sheet.addEventListener('click', function (e) { if (e.target.closest('.sheet-head .back-btn:not(.sheet-x)')) sheetBackAt = performance.now(); }, true);
  // Like iPhone: going forward, the new step slides in over the old one, which moves a little way off and dims;
  // going back, the step you're leaving slides away to the side and the one before comes back from underneath.
  let sheetScrollY = 0, stepRun = null;
  sheet.addEventListener('scroll', function () { sheetScrollY = sheet.scrollTop; }, { passive: true });
  // (in Arabic the title is translated a moment after it's drawn: both spellings count as the same step)
  const stepName = function (s) { return (AR && typeof tr === 'function' && tr(s)) || s; };
  const sheetStep = function (recs) {
    const t = $('#sheetTitle', sheetBody), txt = t ? stepName(t.textContent.trim()).trim() : null;
    if (txt == null || txt === sheetTitleWas) return;
    const was = sheetTitleWas, oldY = sheetScrollY; sheetTitleWas = txt; sheetScrollY = sheet.scrollTop;
    if (was == null || navInstant || calmMotion() || !sheet.classList.contains('open') || performance.now() - sheetOpenAt < 400) return;
    const head = t.closest('.sheet-head'), view = head && head.parentElement; if (!view || !view.animate) return;
    const back = performance.now() - sheetBackAt < 600, sg = document.documentElement.dir === 'rtl' ? -1 : 1;
    if (stepRun) stepRun();
    // the step you're leaving: what was just taken out of the sheet
    let gone = [];
    (recs || []).forEach(function (r) { if (r.target === view) r.removedNodes.forEach(function (n) { gone.push(n); }); });
    if (!gone.length) (recs || []).forEach(function (r) { if (r.target === view.parentNode && [].indexOf.call(r.addedNodes, view) >= 0) r.removedNodes.forEach(function (n) { gone.push(n); }); });
    gone = gone.filter(function (n) { return n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()); });
    if (!gone.length) { view.animate([{ opacity: 0, transform: 'translateX(' + (back ? -1 : 1) * sg * 22 + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' }); return; }
    const ghost = document.createElement('div'), hk = snapHooks(), bg = getComputedStyle(sheet).backgroundColor, pad = parseFloat(getComputedStyle(sheet).paddingLeft) || 0;
    ghost.className = 'sheet-ghost ' + view.className; ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
    if (view.id && hk.ids[view.id]) ghost.id = view.id; // (styled by its id; the live step comes first, so lookups still find that one)
    const vs = getComputedStyle(view); ['display', 'flexDirection', 'alignItems', 'justifyContent', 'gap'].forEach(function (k) { ghost.style[k] = vs[k]; });
    gone.forEach(function (n) { ghost.appendChild(n); });
    $$('*', ghost).forEach(function (el) { for (let i = el.attributes.length - 1; i >= 0; i--) { const n = el.attributes[i].name; if (n === 'for' || n === 'name' || (n === 'id' && !hk.ids[el.id]) || (n.indexOf('data-') === 0 && !hk.attrs[n])) el.removeAttribute(n); } });
    const vt = view.offsetTop - oldY; // where the old step's top was on screen
    ghost.style.cssText += ';position:absolute;margin:0;pointer-events:none;top:' + (vt + sheet.scrollTop) + 'px;left:' + view.offsetLeft + 'px;width:' + view.offsetWidth + 'px;min-height:' + Math.max(0, sheet.clientHeight - vt) + 'px;box-sizing:border-box;z-index:' + (back ? 3 : 1) + ';background:' + bg + ';box-shadow:0 0 0 ' + pad + 'px ' + bg;
    sheet.appendChild(ghost);
    const W = sheet.clientWidth, MS = 420, EASE = 'cubic-bezier(.32,.72,0,1)', keep = view.style.cssText;
    view.style.position = 'relative'; view.style.zIndex = back ? '1' : '2'; view.style.background = bg; view.style.boxShadow = '0 0 0 ' + pad + 'px ' + bg;
    const sx = sheet.style.overflowX; sheet.style.overflowX = 'hidden';
    const far = sg * W, near = -sg * W * 0.3;
    const a1 = back ? view.animate([{ transform: 'translateX(' + near + 'px)', opacity: 0.55 }, { transform: 'none', opacity: 1 }], { duration: MS, easing: EASE })
      : view.animate([{ transform: 'translateX(' + far + 'px)' }, { transform: 'none' }], { duration: MS, easing: EASE });
    const a2 = back ? ghost.animate([{ transform: 'none' }, { transform: 'translateX(' + far + 'px)' }], { duration: MS, easing: EASE, fill: 'forwards' })
      : ghost.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(' + near + 'px)', opacity: 0.55 }], { duration: MS, easing: EASE, fill: 'forwards' });
    let over = false;
    const end = stepRun = function () { if (over) return; over = true; if (stepRun === end) stepRun = null; ghost.remove(); a1.cancel(); view.style.cssText = keep; sheet.style.overflowX = sx; };
    a1.onfinish = end; a2.onfinish = end;
  };
  new MutationObserver(function (recs) { autoTall(); addSheetX(); sheetStep(recs); }).observe(sheetBody, { childList: true, subtree: true });
  // Sheets change size smoothly: when what's inside grows or shrinks (the next step, a message, a longer list), the
  // top edge glides to its new place instead of jumping.
  if (window.ResizeObserver) new ResizeObserver(function () {
    const open = sheet.classList.contains('open');
    const from = sheetSize ? sheet.getBoundingClientRect().height : sheetH;
    if (sheetSize) { sheetSize.cancel(); sheetSize = null; }
    const to = sheet.offsetHeight; sheetH = open ? to : 0;
    if (!open || !from || Math.abs(to - from) < 3 || sheet.classList.contains('tall') || sheet.classList.contains('dragging') || calmMotion() || performance.now() - sheetOpenAt < 480 || !sheet.animate) return;
    sheet.style.overflowY = 'hidden';
    sheetSize = sheet.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: 380, easing: 'cubic-bezier(.32,.72,0,1)' });
    const a = sheetSize; a.onfinish = a.oncancel = function () { if (sheetSize === a) sheetSize = null; if (!sheetSize) sheet.style.overflowY = ''; };
  }).observe(sheetBody);
  function closeSheet(fromBack) {
    closePop();
    if (stepRun) stepRun();
    if (sheetRun && !sheetRun.closing) sheetSettle(); // springing back into place: close from where it is now
    sheet.classList.remove('dragging');
    if (sheetSize) { sheetSize.cancel(); sheetSize = null; }
    if (!sheet.classList.contains('open')) return;
    if (sheetHist) { sheetHist = false; if (fromBack !== true) navDrop('sheet'); }
    if (document.activeElement && sheet.contains(document.activeElement)) document.activeElement.blur();
    // Back from the phone (its own swipe already slid things away): close at once instead of sliding down after it.
    if (navInstant) { sheet.style.transition = scrim.style.transition = 'none'; requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.style.transition = scrim.style.transition = ''; }); }); }
    const wasTall = sheet.classList.contains('tall');
    sheet.classList.remove('open'); scrim.classList.remove('open');
    // back to a normal sheet once it has slid away
    if (sheet.classList.contains('auto-tall')) setTimeout(function () { if (!sheet.classList.contains('open')) sheet.classList.remove('tall', 'auto-tall'); }, navInstant ? 0 : 360);
    sheet.style.transform = '';
    document.body.style.overflow = '';
    $$('main, .tabbar').forEach(function (el) { el.inert = false; });
    const cb = sheetOnClose; sheetOnClose = null;
    if (cb) cb();
    // A full-screen sheet keeps its full-screen look while it slides away (each one's own close step takes it
    // off at once, which would first snap it into a smaller card with rounded corners).
    if (wasTall && !navInstant && !sheet.classList.contains('open')) {
      sheet.classList.add('tall', 'tall-out'); clearTimeout(tallOutT);
      tallOutT = setTimeout(function () { if (!sheet.classList.contains('open')) sheet.classList.remove('tall', 'tall-out', 'auto-tall'); }, 360);
    }
    if (lastFocus && lastFocus.focus && window.matchMedia('(hover: hover)').matches) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
    maybeReload();
  }
  scrim.addEventListener('click', function () { closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  // Cards that act like buttons open with Enter or Space too.
  document.addEventListener('keydown', function (e) { if (!e.defaultPrevented && (e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('div[role="button"][tabindex]')) { e.preventDefault(); e.target.click(); } });
  // Pull a sheet down to close it, like iPhone: it follows your finger from anywhere on it (when it's scrolled to the
  // top) or from the handle, pulling it up gives a little, and the dimming fades with it. Letting go finishes the
  // move at your finger's speed: closed if you pulled it far or flicked it down, otherwise it springs back into
  // place. You can catch it again while it's moving, even while it's still opening. Lists, number pads, swipers
  // and text fields keep their own gestures.
  (function sheetDrag() {
    let y0 = 0, x0 = 0, base = 0, dy = 0, on = false, live = false, moving = false, handle = false, noClick = 0;
    const sp = fingerSpeed();
    sheet.addEventListener('click', function (e) { if (performance.now() - noClick < 350) { e.preventDefault(); e.stopPropagation(); } }, true);
    const vis = function (y) { return y >= 0 ? y : -rubber(-y, 44); }; // pulled up: a little give
    const place = function (y) {
      dy = y; sheet.style.transform = 'translate3d(0,' + vis(y).toFixed(2) + 'px,0)';
      scrim.style.opacity = String(Math.max(0, Math.min(1, 1 - Math.max(0, y) / Math.max(260, sheet.offsetHeight))));
    };
    const isMoving = function () { return !!sheetRun || sheet.getAnimations().some(function (a) { return a.transitionProperty === 'transform' && a.playState === 'running'; }); };
    const goLive = function () {
      // stop it exactly where it is (it may still be opening or springing) and carry on from there with the finger
      if (sheetRun) { sheetRun.stop(); sheetRun = null; sheet.style.pointerEvents = ''; }
      const y = nowAt(sheet).y;
      sheet.classList.add('dragging'); scrim.style.transition = 'none';
      base = y >= 0 ? y : -((1 / (1 - Math.min(0.95, -y / 44)) - 1) * 44 / 0.55); place(base); // (stretched up: where the finger would be)
      live = true;
    };
    const begin = function (y, x, t, fromHandle) {
      if (!sheet.classList.contains('open') || sheet.classList.contains('tall') || dragActive) return false;
      y0 = y; x0 = x; on = true; live = false; handle = fromHandle; moving = isMoving(); sp.reset(); sp.add(0, t);
      return true;
    };
    const move = function (y, x, t, ev) {
      if (!on) return;
      if (!sheet.classList.contains('open')) { on = false; live = false; return; } // closed some other way meanwhile
      const d = y - y0, ax = Math.abs(x - x0);
      if (!live) {
        if (moving) { // a sheet that's still moving: take hold as soon as the finger moves (a tap doesn't stop it)
          if (Math.abs(d) < 4 && ax < 4) return;
          if (ax > Math.abs(d)) { on = false; return; }
          goLive(); y0 = y;
        } else if (handle) {
          if (Math.abs(d) < 4) return;
          goLive(); y0 = y;
        } else {
          if (ax >= Math.abs(d)) { if (ax > 6) on = false; return; } // sideways (or not clearly up or down yet): not ours
          const top = sheet.scrollTop <= 0, scrolls = sheet.scrollHeight > sheet.clientHeight + 1;
          if (d > 0 && !top) { if (ev && !ev.cancelable) on = false; return; } // the list scrolls first
          if (d < 0 && scrolls) { on = false; return; } // scrolling up through the list
          // down from the top (or up on a sheet with nothing to scroll): the sheet itself moves, not the page bounce
          if (ev && ev.cancelable) ev.preventDefault();
          if (Math.abs(d) < 8) return;
          goLive(); y0 = y;
        }
      }
      if (ev && ev.cancelable) ev.preventDefault();
      place(base + (y - y0)); sp.add(dy, t);
    };
    const finish = function (t, cancel) {
      if (!on) return; on = false; if (!live) return; live = false; noClick = performance.now();
      if (!sheet.classList.contains('open')) return;
      const v = cancel ? 0 : sp.get(t), h = sheet.offsetHeight, proj = dy + v * 200; // v: px/ms, + = down
      springSheet(!cancel && dy > 0 && v > -0.1 && (proj > h * 0.42 || (v > 0.5 && dy > 12)), v, h);
    };
    const springSheet = function (close, v, h) {
      const from = vis(dy), to = close ? h + 40 : 0, so = parseFloat(scrim.style.opacity), s0 = isNaN(so) ? 1 : so;
      sheet.style.pointerEvents = close ? 'none' : '';
      if (calmMotion()) { sheet.classList.remove('dragging'); scrim.style.transition = ''; if (close) { closeSheet(); scrim.style.opacity = ''; sheet.style.pointerEvents = ''; } else { sheet.style.transform = ''; scrim.style.opacity = ''; } return; }
      const run = sheetRun = springGroup([
        [sheet, { transform: 'translate3d(0,' + from + 'px,0)' }, { transform: 'translate3d(0,' + to + 'px,0)' }],
        [scrim, { opacity: s0 }, { opacity: close ? 0 : 1 }]
      ], { response: close ? 0.4 : 0.42, damping: close ? 1 : 0.86, v: close ? v : (from > 0 ? -v : v), dist: Math.abs(to - from), noOver: close });
      run.closing = close;
      run.onEnd = function () {
        if (sheetRun !== run) return; sheetRun = null;
        sheet.classList.remove('dragging'); scrim.style.transition = '';
        if (close) { closeSheet(); sheet.style.pointerEvents = ''; scrim.style.opacity = ''; }
        else { sheet.style.transform = ''; scrim.style.opacity = ''; }
      };
    };
    // touch anywhere on the sheet
    sheet.addEventListener('touchstart', function (e) {
      on = false;
      if (e.touches.length !== 1 || e.target.closest('#grabber, input, textarea, select, [contenteditable], .pager, .kp, .sw, .no-pull')) return;
      const t = e.touches[0]; begin(t.clientY, t.clientX, e.timeStamp, false);
    }, { passive: true });
    sheet.addEventListener('touchmove', function (e) { if (!on) return; const t = e.touches[0]; move(t.clientY, t.clientX, e.timeStamp, e); }, { passive: false });
    sheet.addEventListener('touchend', function (e) { const t = e.changedTouches[0]; if (on && live && t) { place(base + (t.clientY - y0)); sp.add(dy, e.timeStamp); } finish(e.timeStamp, false); }, { passive: true });
    sheet.addEventListener('touchcancel', function (e) { finish(e.timeStamp, true); }, { passive: true });
    // the handle (also with a mouse)
    const g = $('#grabber');
    g.addEventListener('pointerdown', function (e) { if (begin(e.clientY, e.clientX, e.timeStamp, true)) try { g.setPointerCapture(e.pointerId); } catch (x) {} });
    g.addEventListener('pointermove', function (e) { move(e.clientY, e.clientX, e.timeStamp, null); });
    g.addEventListener('pointerup', function (e) { if (on && live) { place(base + (e.clientY - y0)); sp.add(dy, e.timeStamp); } finish(e.timeStamp, false); });
    g.addEventListener('pointercancel', function (e) { finish(e.timeStamp, true); });
  })();
  // Keep sheets above the on-screen keyboard.
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const fit = function () {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      sheet.style.bottom = kb > 60 ? kb + 'px' : '0px';
      sheet.style.maxHeight = Math.round(vv.height - (sheet.classList.contains('tall') ? 0 : 24)) + 'px';
    };
    vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit);
  }

