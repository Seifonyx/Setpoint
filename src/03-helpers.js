  /* ================= Helpers ================= */
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayISO() { return isoOf(new Date()); }
  function parseISO(iso) { const p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  const dayNumMemo = {};
  function dayNum(iso) { let v = dayNumMemo[iso]; if (v === undefined) { const p = iso.split('-'); v = dayNumMemo[iso] = Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); } return v; }
  function isoFromDay(n) { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  // Date formatters are slow to create, so each style is made once.
  const dtfs = {};
  function dtf(opts) { const loc = state && state.settings && state.settings.lang === 'ar' ? 'ar-EG-u-nu-latn' : undefined, k = (loc || '') + JSON.stringify(opts); return dtfs[k] || (dtfs[k] = new Intl.DateTimeFormat(loc, opts)); }
  function fmtDate(iso, opts) { return dtf(opts || { month: 'short', day: 'numeric' }).format(parseISO(iso)); }
  function fmtFuture(d) { return dtf(d.getFullYear() !== new Date().getFullYear() ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' }).format(d); }
  function relDate(iso) {
    const diff = dayNum(todayISO()) - dayNum(iso);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff === -1) return 'Tomorrow';
    return fmtDate(iso, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  function unit() { return state.settings.unit; }
  function toDisp(kg) { return unit() === 'lb' ? kg * LB : kg; }
  function fromDisp(v) { return unit() === 'lb' ? v / LB : v; }
  function fmtW(kg, dp) { return toDisp(kg).toFixed(dp == null ? 1 : dp); }
  function signed(v, dp) { const r = Number(v.toFixed(dp)); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r).toFixed(dp); }
  function fmtDelta(kg, dp) { return signed(toDisp(kg), dp == null ? 1 : dp); }
  function U() { return '<span class="unit">' + unit() + '</span>'; }
  function parseNum(s) { const n = parseFloat(String(s).replace(',', '.').replace(/[^\d.\-]/g, '')); return isFinite(n) ? n : NaN; }
  function fmtKcal(n) { return Math.round(n).toLocaleString(); }
  function roundKcal(n) { return Math.round(n / 10) * 10; }
  const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
  const MOON_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/><path d="M17 3.5v3M15.5 5h3"/></svg>';
  const COG_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>';
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const SEARCH_MINI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/></svg>';
  const TORCH_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1.5 5h-5zM9.5 8h5v4.5l-1.2 8.5h-2.6l-1.2-8.5z"/><path d="M12 12v2.5"/></svg>';
  const MIC_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
  const LEAF_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/></svg>';
  const FLAME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2c.5 2.9 4.9 5 4.9 9.9a4.9 4.9 0 0 1-9.8 0c0-2.2 1.1-3.8 2.3-4.8.1 1.7.9 2.7 2 3.1-.8-3 .1-6 .6-8.2z"/></svg>';
  const ARROW_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
  const ARROW_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';

  // iPhones don't support vibration from web apps, but toggling a hidden switch gives the system's light tick (iOS 18+).
  let hapEl = null;
  function iosTick() {
    if (!hapEl) {
      hapEl = document.createElement('label'); hapEl.setAttribute('aria-hidden', 'true');
      hapEl.style.cssText = 'position:fixed;left:-100px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
      hapEl.innerHTML = '<input type="checkbox" switch tabindex="-1" />';
      hapEl.addEventListener('click', function (e) { e.stopPropagation(); }, true);
      document.body.appendChild(hapEl);
    }
    try { hapEl.click(); } catch (e) {}
  }
  // Fewer animations when the phone asks for reduced motion.
  const calmMq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function calmMotion() { return !!(calmMq && calmMq.matches); }
  // Parts of the app that aren't on screen are redrawn a moment after a change, one at a time, so a change
  // only waits for what you can see. Opening one that's still waiting draws it straight away (catchUp).
  const later = {}; let laterT = 0;
  function whenSeen(key, draw, seen) {
    if (seen()) { delete later[key]; draw(); return; }
    later[key] = draw; clearTimeout(laterT); laterT = setTimeout(drainLater, 900);
  }
  function drainLater() {
    const k = Object.keys(later)[0]; if (!k) return;
    const draw = later[k]; delete later[k]; draw();
    if (Object.keys(later).length) laterT = setTimeout(drainLater, 80);
  }
  /* ================= Springs ================= */
  // Movement that finishes like iPhone: it carries on at the speed your finger let go and settles naturally,
  // instead of a fixed curve that always starts from a standstill. The spring is worked out up front and handed to
  // the browser as a curve, so the GPU runs it smoothly even while the app is busy.
  // response ≈ how long the move takes (seconds); damping 1 = no bounce, a little under 1 = a small bounce.
  const curveOK = (function () { try { return !!(window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)')); } catch (e) { return false; } })();
  function springCurve(response, damping, v0, noOver) {
    // v0: starting speed towards the target, in distances per second (0 = from rest)
    const w = 2 * Math.PI / Math.max(0.05, response), z = damping;
    let x;
    if (z < 1) { const wd = w * Math.sqrt(1 - z * z), B = (z * w - v0) / wd; x = function (t) { return Math.exp(-z * w * t) * (Math.cos(wd * t) + B * Math.sin(wd * t)); }; }
    else if (z === 1) { const B = w - v0; x = function (t) { return Math.exp(-w * t) * (1 + B * t); }; }
    else { const q = Math.sqrt(z * z - 1), r1 = -w * (z - q), r2 = -w * (z + q), c2 = (-v0 - r1) / (r2 - r1), c1 = 1 - c2; x = function (t) { return c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t); }; }
    // how long until it has settled (within a fraction of a pixel on a typical move)
    let T = 0; const dt = 1 / 240;
    while (T < 2.5) { const a = x(T), b = x(T + dt); if (Math.abs(a) < 0.0015 && Math.abs(b - a) / dt < 0.03) break; T += dt; }
    T = Math.max(T, 0.12);
    if (!curveOK) return { easing: v0 > 4 ? 'cubic-bezier(.12,.75,.3,1)' : 'cubic-bezier(.25,.8,.3,1)', duration: Math.round(T * 850) };
    const N = Math.max(30, Math.min(160, Math.round(T * 130))), pts = [];
    for (let i = 0; i <= N; i++) { let p = i === N ? 1 : 1 - x(T * i / N); if (noOver) p = Math.min(1, p); pts.push(+p.toFixed(4)); }
    return { easing: 'linear(' + pts.join(', ') + ')', duration: Math.round(T * 1000) };
  }
  // Several things moving as one (a sheet and its dimming; a page, its shadow and the page underneath): the same
  // spring, each part from one look to another. parts: [[element, fromKeyframe, toKeyframe], …]
  // o: response, damping, v (finger speed in px/ms towards the target), dist (px the main part moves), noOver.
  // Returns { stop(), onEnd } — stop() freezes everything where it is right now (to be caught by a finger).
  function springGroup(parts, o) {
    const v0 = o.dist > 0.5 ? (o.v || 0) * 1000 / o.dist : 0;
    const c = springCurve(o.response || 0.4, o.damping == null ? 1 : o.damping, Math.max(-25, Math.min(35, v0)), o.noOver);
    const run = { ms: c.duration, onEnd: null, over: false };
    const anims = parts.map(function (p) { return p[0].animate([p[1], p[2]], { duration: c.duration, easing: c.easing, fill: 'forwards' }); });
    const put = function (el, k, v) { el.style[k] = typeof v === 'number' ? String(v) : v; };
    run.stop = function () { if (run.over) return; run.over = true; parts.forEach(function (p, i) { const cs = getComputedStyle(p[0]); Object.keys(p[2]).forEach(function (k) { put(p[0], k, cs[k]); }); anims[i].cancel(); }); };
    const fin = function () { if (run.over) return; run.over = true; parts.forEach(function (p, i) { Object.keys(p[2]).forEach(function (k) { put(p[0], k, p[2][k]); }); anims[i].cancel(); }); if (run.onEnd) run.onEnd(); };
    if (anims.length) anims[0].onfinish = fin; else setTimeout(fin, 0);
    return run;
  }
  // How fast a finger is moving (px/ms) at the end, so a flick counts even at the end of a slow drag;
  // 0 if it rested before letting go.
  function fingerSpeed() {
    let s = [];
    return {
      add: function (v, t) { s.push([v, t]); if (s.length > 10) s.shift(); },
      get: function (now) {
        // the last ~60 ms (a sharp flick at the end counts in full), or ~100 ms if the finger moved less often
        let r = s.filter(function (x) { return now - x[1] < 60; }); if (r.length < 3) r = s.filter(function (x) { return now - x[1] < 100; });
        if (r.length < 2 && s.length > 1 && now - s[s.length - 1][1] < 50) r = s.slice(-2); // a very quick flick: its last two points
        if (r.length < 2) return 0; const a = r[0], b = r[r.length - 1]; return b[1] > a[1] ? (b[0] - a[0]) / (b[1] - a[1]) : 0;
      },
      reset: function () { s = []; }
    };
  }
  // iPhone's rubber band: pulling past an end gives less and less (dim = how far it can stretch at most).
  function rubber(x, dim) { return (1 - 1 / (x * 0.55 / dim + 1)) * dim; }
  // Where an element's transform really is right now (also halfway through an animation).
  function nowAt(el) { try { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); return { x: m.m41, y: m.m42 }; } catch (e) { return { x: 0, y: 0 }; } }
  function catchUp(key) { const draw = later[key]; if (draw) { delete later[key]; draw(); } }
  function buzz(kind) {
    if (!state.settings.haptics) return;
    if (!navigator.vibrate) { iosTick(); if (kind === 'success' || kind === 'warn') setTimeout(iosTick, 90); return; }
    const p = { light: 8, medium: 16, success: [12, 50, 16], warn: [24, 40, 24] }[kind] || 8;
    try { navigator.vibrate(p); } catch (e) {}
  }

