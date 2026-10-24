  /* ================= Appearance ================= */
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function applyAppearance() {
    const s = state.settings, r = document.documentElement;
    const dark = s.theme === 'dark' || (s.theme === 'auto' && mq && mq.matches);
    r.setAttribute('data-mode', dark ? 'dark' : 'light');
    r.setAttribute('data-style', s.style);
    if (s.oled) r.setAttribute('data-oled', ''); else r.removeAttribute('data-oled');
    r.classList.toggle('tabs-top', s.tabs === 'top');
    r.style.zoom = { m: '', l: '1.08', xl: '1.16' }[s.textSize] || '';
    applyLang(); // bigger text: the whole layout scales and reflows
    requestAnimationFrame(function () { placePill(false); });
    requestAnimationFrame(function () { $('#themeColor').setAttribute('content', getComputedStyle(document.body).backgroundColor); });
  }
  // Arabic: the interface is translated as it's drawn (phrases from ar.js), laid out right to left, with an Arabic font.
  let arObs = null, AR = null;
  function trWord(t) { return AR && AR.D[t] !== undefined ? AR.D[t] : null; }
  function tr(str) {
    const k = str.replace(/\s+/g, ' ').trim();
    if (!k || !AR || !/[A-Za-z]/.test(k)) return null;
    let v = trWord(k);
    if (v == null) for (let i = 0; i < AR.P.length; i++) { const m = AR.P[i][0].exec(k); if (m) { v = AR.P[i][1].replace(/\$(\d)/g, function (_, n) { const c = m[+n] || ''; return trWord(c) || tr(c) || c; }); break; } }
    if (v == null && k.indexOf(' · ') > 0) { const parts = k.split(' · '), out = parts.map(function (x) { return trWord(x) || tr(x) || x; }); if (out.some(function (x, i) { return x !== parts[i]; })) v = out.join(' · '); }
    if (v == null) return null;
    const lead = str.match(/^\s*/)[0], tail = str.match(/\s*$/)[0];
    return lead + v + tail;
  }
  function trNode(n) {
    if (!AR || !n) return;
    if (n.nodeType === 3) { const p = n.parentNode; if (!p || p.closest && p.closest('[data-notr], script, style, textarea')) return; const v = tr(n.nodeValue); if (v != null && v !== n.nodeValue) n.nodeValue = v; return; }
    if (n.nodeType !== 1 || n.closest('[data-notr]')) return;
    const els = [n].concat(Array.prototype.slice.call(n.querySelectorAll('[placeholder],[aria-label],[title]')));
    els.forEach(function (el) { ['placeholder', 'aria-label', 'title'].forEach(function (a) { const v0 = el.getAttribute && el.getAttribute(a); if (v0) { const v = tr(v0); if (v != null && v !== v0) el.setAttribute(a, v); } }); });
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let t; const list = []; while ((t = w.nextNode())) list.push(t); list.forEach(trNode);
  }
  function applyLang() {
    const ar = state.settings.lang === 'ar', r = document.documentElement;
    r.lang = ar ? 'ar' : 'en'; r.dir = ar ? 'rtl' : 'ltr';
    if (!ar || arObs) return;
    // The Arabic font is part of fonts/fonts.css (hosted with the app, nothing loaded from Google).
    const go = function () {
      AR = window.SETPOINT_AR; if (!AR) { r.classList.remove('ar-wait'); return; }
      trNode(document.body); r.classList.remove('ar-wait');
      arObs = new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === 'characterData') trNode(m.target); else if (m.type === 'attributes') trNode(m.target); else m.addedNodes.forEach(trNode); }); });
      arObs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title'] });
    };
    if (window.SETPOINT_AR) go(); else { const sc = document.createElement('script'); sc.src = 'ar.js?v=' + APP_VERSION; sc.onload = go; sc.onerror = function () { r.classList.remove('ar-wait'); }; document.head.appendChild(sc); }
  }
  // Changing how the app looks (mode, theme, pure black, text size, tab bar) crossfades from the old look to the
  // new one instead of switching in a single frame, where the browser can do that (newer iPhones do).
  function restyle(fn) {
    if (!document.startViewTransition || calmMotion() || document.hidden) { fn(); return; }
    try { document.startViewTransition(fn); } catch (e) { fn(); }
  }
  function onMq() { if (state.settings.theme === 'auto') restyle(applyAppearance); }
  if (mq) (mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq));

