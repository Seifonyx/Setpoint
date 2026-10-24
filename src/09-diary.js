  /* ================= Diary ================= */
  let viewDay = todayISO();
  // Which category you usually log at this time of day (from entry times over the last 60 days), else by the clock.
  let mealTimes = { day: null, med: null };
  function mealByTime() {
    const now = new Date(), mins = now.getHours() * 60 + now.getMinutes(), today = todayISO();
    if (mealTimes.day !== today) {
      const t = {}, from = dayNum(today) - 60;
      Object.keys(state.food).forEach(function (d) { if (dayNum(d) < from) return; state.food[d].forEach(function (it) { if (!it.t || it.plan || isImported(it)) return; const m = /^(\d\d):(\d\d)$/.exec(it.t); (t[it.meal] = t[it.meal] || []).push(+m[1] * 60 + +m[2]); }); });
      const med = {}; Object.keys(t).forEach(function (k) { if (t[k].length >= 3) { const a = t[k].sort(function (x, y) { return x - y; }); med[k] = a[Math.floor(a.length / 2)]; } });
      mealTimes = { day: today, med: med };
    }
    let best = null, gap = 1e9; MEALS.forEach(function (m) { const v = mealTimes.med[m[0]]; if (v != null && Math.abs(v - mins) < gap) { gap = Math.abs(v - mins); best = m[0]; } });
    if (best && gap <= 120) return best;
    const h = now.getHours(), k = h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 21 ? 'dinner' : 'snacks'; return MEALS.some(function (x) { return x[0] === k; }) ? k : MEALS[0][0];
  }
  let sumPage = 0, sumObs = null, swOpen = null;
  // Second card on the diary: a few nutrients you care about, as small rings.
  const NEW_HIGHLIGHTS = ['fib', 'ca', 'fe', 'vD', 'k', 'mg'];
  function highlights() {
    const own = (state.settings.highlights || []).filter(function (k) { return NUT[k] && ['kcal', 'p', 'c', 'f'].indexOf(k) < 0; });
    if (own.length) return { keys: own, why: 'mine' };
    // Once there's enough logging, suggest what you're often low on; before that, nutrients many people miss.
    const low = oftenLow().low.map(function (x) { return x.key; }).filter(function (k) { return ['kcal', 'p', 'c', 'f'].indexOf(k) < 0; });
    if (low.length >= 3) return { keys: low.concat(NEW_HIGHLIGHTS.filter(function (k) { return low.indexOf(k) < 0; })).slice(0, 6), why: 'low' };
    return { keys: NEW_HIGHLIGHTS, why: 'new' };
  }
  function shortNut(k) { return NUT[k].label.replace('Vitamin ', 'Vit ').replace(/ \(.*\)/, '').replace('Monounsaturated', 'Mono fat').replace('Polyunsaturated', 'Poly fat').replace('Saturated fat', 'Sat. fat'); }
  function highlightCard() {
    const loading = dayNeedsDB(viewDay);
    // Suggestions look at the last two weeks, so fetch the food list for those too.
    let past = false; if (!foodDB && !state.settings.highlights) { const t = dayNum(todayISO()); for (let d = t - 14; d < t && !past; d++) past = dayNeedsDB(isoFromDay(d)); }
    if (loading || past) loadFoods().then(function () { if (state.ui.tab === 'diary') renderDiary(); }, function () {});
    const hl = highlights(), nd = loading ? null : dayNutrients(viewDay), tg = nutTargets(viewDay), mm = nd ? microsMet(nd, tg) : null, r = 18, C = 2 * Math.PI * r;
    const items = hl.keys.map(function (k) {
      const t = tg[k], lim = t && t.max != null && t.min == null, goal = t ? (lim ? t.max : t.min) : null, v = nd ? nd.tot[k] || 0 : 0, pct = goal ? v / goal * 100 : 0;
      const cls = !goal ? 'none' : (lim && v > goal) || (t.ul && v > t.ul) ? 'over' : lim ? 'ok' : pct >= 100 ? 'met' : pct >= 50 ? 'part' : 'low';
      return '<div class="hl-item ' + cls + '" data-src="' + k + '" role="button" tabindex="0" aria-label="' + shortNut(k) + ': where it came from"><div class="hl-ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="' + r + '" class="hl-bg"/><circle cx="22" cy="22" r="' + r + '" class="hl-fg" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - Math.min(100, pct) / 100)).toFixed(1) + '"/></svg>' +
        '<b class="num">' + (goal ? Math.round(pct) + '%' : fmtNut(v, NUT[k].unit)) + '</b></div><span>' + shortNut(k) + '</span></div>';
    }).join('');
    const why = hl.why === 'mine' ? 'Your picks' : hl.why === 'low' ? 'Suggested: often low for you' : 'Suggested to start with';
    return '<div class="card hl-card" data-action="nutrients" role="button" tabindex="0" aria-label="Highlighted nutrients">' +
      '<div class="hl-head"><div class="grow"><div class="hl-title">Highlighted nutrients</div><div class="label faint">' + why + '</div></div><button type="button" class="text-btn hl-edit" data-hl-edit>Edit</button></div>' +
      '<div class="hl-grid' + (hl.keys.length > 6 ? ' four' : '') + '">' + items + '</div>' +
      (mm ? '<div class="sum-micro"><span>Vitamins &amp; minerals</span><b class="num">' + mm.met + ' <small>/ ' + mm.of + ' met</small></b><span class="bar"><i style="width:' + (mm.met / mm.of * 100).toFixed(1) + '%"></i></span></div>' : '') +
      '</div>';
  }
  // Pick up to 8 nutrients for the diary card, or go back to suggestions.
  function highlightsSheet() {
    const draw = function (root) {
      const hl = highlights(), sel = hl.keys.slice(), sugg = (function () { const o = state.settings.highlights; state.settings.highlights = null; const h = highlights(); state.settings.highlights = o; return h; })();
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">Pick up to 8</div><h2 class="sheet-title" id="sheetTitle">Highlighted nutrients</h2></div></div>' +
        '<div class="stat-box hl-sugg"><div class="row-t">' + (sugg.why === 'low' ? 'Suggested: what you\'re often low on' : 'Suggested to start with') + '</div><div class="row-s">' + sugg.keys.map(shortNut).join(' · ') + '</div>' +
        (hl.why === 'mine' ? '<button type="button" class="btn soft block" id="hlSugg" style="margin-top:10px">Use suggested</button>' : '<div class="row-s" style="margin-top:6px">In use. Pick your own below.</div>') + '</div>' +
        NUT_GROUPS.filter(function (g) { return g[0] !== 'gen'; }).concat([['gen', 'General']]).map(function (g) {
          const rows = NUTS.filter(function (n) { return n[3] === g[0] && ['kcal', 'p', 'c', 'f'].indexOf(n[0]) < 0; });
          return '<div class="label faint fd-sec">' + g[1] + '</div><div class="list">' + rows.map(function (n) {
            const on = sel.indexOf(n[0]) >= 0;
            return '<button type="button" class="row fd-row hl-pick" data-hl="' + n[0] + '" aria-pressed="' + on + '"><div class="grow row-t">' + n[1] + '</div><span class="hl-check">' + (on ? '✓' : '') + '</span></button>';
          }).join('') + '</div>';
        }).join('') +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="hlDone">Done</button></div>';
      $$('[data-hl]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          const k = b.dataset.hl, cur = highlights().keys.slice(), i = cur.indexOf(k);
          if (i >= 0) cur.splice(i, 1); else { if (cur.length >= 8) { toast('Up to 8 nutrients'); buzz('warn'); return; } cur.push(k); }
          state.settings.highlights = cur.length ? cur : null; save(); renderDiary(); buzz('light');
          const top = root.parentNode ? sheet.scrollTop : 0; draw(root); sheet.scrollTop = top;
        });
      });
      if ($('#hlSugg', root)) $('#hlSugg', root).addEventListener('click', function () { state.settings.highlights = null; save(); renderDiary(); buzz('light'); draw(root); });
      $('#hlDone', root).addEventListener('click', function () { closeSheet(); });
    };
    openSheet('<div id="afRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#afRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
  function isDailyTotal(f) { return /^w-/.test(f.id) || (!f.ref && f.name === 'Daily total'); }
  // Days in a row with food logged. One missed day per week is forgiven (two in a row, or a second in the same week, ends it).
  // Today doesn't count against you until it's over.
  function foodStreak() {
    const ds = Object.keys(state.food).filter(function (k) { return state.food[k].some(function (it) { return !it.plan; }); }).sort();
    if (!ds.length) return 0;
    const has = {}; ds.forEach(function (k) { has[dayNum(k)] = 1; });
    const today = dayNum(todayISO()), first = dayNum(ds[0]), used = {};
    let d = has[today] ? today : today - 1, n = 0, prevMiss = false;
    while (d >= first) {
      if (has[d]) { n++; prevMiss = false; }
      else { const w = weekStart(d); if (prevMiss || used[w] || !n) break; used[w] = 1; prevMiss = true; }
      d--;
    }
    return n;
  }
  // The calories-left number counts to its new value and the ring follows, when something changes on the same day.
  let sumPrev = null;
  const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TG_HEAD = '', TG_BTN = '<button type="button" class="sum-tg" data-action="go-targets"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/><path d="M9 3h6v3H9zM8.5 11l1.5 1.5 3-3M14.5 11.5H16M8.5 16.5l1.5 1.5 3-3M14.5 17H16"/></svg>Plan<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>';
  // Bars fill and numbers count from where they were when they change on screen (not the first time you see them).
  // Bars carry data-aw; numbers carry data-an (the value) and data-af (k: kcal, g: grams, p: percent).
  const animMem = {};
  function animate(root, key) {
    if (!root) return;
    const bars = $$('[data-aw]', root), nums = $$('[data-an]', root), mem = animMem[key];
    const now = { w: bars.map(function (b) { return b.style.width; }), c: bars.map(function (b) { return getComputedStyle(b).backgroundColor; }), n: nums.map(function (e) { return +e.dataset.an; }) };
    animMem[key] = now;
    if (!mem || calm || mem.w.length !== now.w.length || mem.n.length !== now.n.length) return;
    // bars grow or shrink to their new length, and a colour change (going over a target, or back under) blends along
    bars.forEach(function (b, i) { const from = mem.w[i], fc = mem.c && mem.c[i], recol = fc && fc !== now.c[i]; if (!from || (from === now.w[i] && !recol)) return;
      b.style.transition = 'none'; b.style.width = from; if (recol) b.style.backgroundColor = fc; b.getBoundingClientRect();
      b.style.transition = 'width .6s cubic-bezier(.2,.8,.2,1), background-color .45s ease'; b.style.width = now.w[i]; if (recol) b.style.backgroundColor = ''; });
    nums.forEach(function (e, i) {
      const from = mem.n[i], to = now.n[i]; if (from === to || isNaN(from) || isNaN(to)) return;
      const f = e.dataset.af, fmt = function (v) { v = Math.round(v); return f === 'p' ? v + '%' : f === 'g' ? String(v) : fmtKcal(v); }, t0 = performance.now();
      (function step(t) { const k = Math.min(1, (t - t0) / 550); e.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
    });
  }
  function animSum(sc) {
    const cnt = $('.sum-card .cnt', sc), ring = $('.sum-card .ring-fg', sc), bar = $('.sum-kbar i', sc);
    if (!cnt && !ring && !bar) { sumPrev = null; return; }
    const v = cnt ? +cnt.dataset.v : 0, off = ring ? +ring.getAttribute('stroke-dashoffset') : 0, w = bar ? bar.style.width : '';
    const pv = sumPrev && sumPrev.day === viewDay ? sumPrev : null;
    sumPrev = { day: viewDay, v: v, off: off, w: w };
    if (!pv || (pv.v === v && pv.off === off && pv.w === w) || calm) return;
    if (ring) { ring.style.transition = 'none'; ring.setAttribute('stroke-dashoffset', pv.off); ring.getBoundingClientRect(); ring.style.transition = 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)'; ring.setAttribute('stroke-dashoffset', off); }
    if (bar) { bar.style.transition = 'none'; bar.style.width = pv.w; bar.getBoundingClientRect(); bar.style.transition = 'width .6s cubic-bezier(.2,.8,.2,1)'; bar.style.width = w; }
    const t0 = performance.now(), from = pv.v;
    if (cnt) (function step(t) { const k = Math.min(1, (t - t0) / 550), e = 1 - Math.pow(1 - k, 3); cnt.textContent = fmtKcal(Math.round(from + (v - from) * e)); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  // A row of cards you swipe through one at a time, like iPhone: it follows your finger (with a rubber band past the
  // first and last card), then settles on a card with a spring that starts at your finger's speed: the next one
  // after a flick or a drag past halfway. You can catch it again while it's still moving.
  // fitHeight: the strip's height blends between the cards' heights as you swipe. Returns a ResizeObserver (or null) to disconnect later.
  function pager(track, start, onChange, fitHeight) {
    const inner = track.firstElementChild, cards = inner.children, n = cards.length, rtl = document.documentElement.dir === 'rtl';
    let page = Math.max(0, Math.min(n - 1, start || 0)), x0 = 0, y0 = 0, dx = 0, base = 0, axis = '', id = null, moved = false, grabbed = false, run = null, hrun = null;
    const fs = fingerSpeed();
    const step = function () { return cards[0].offsetWidth + 12; };
    const pos = function (p) { return (rtl ? 1 : -1) * p * step(); };
    const heightAt = function (p) { p = Math.max(0, Math.min(n - 1, p)); const a = Math.floor(p), b = Math.min(n - 1, a + 1), f = p - a; return cards[a].offsetHeight + (cards[b].offsetHeight - cards[a].offsetHeight) * f; };
    const setH = function (p) { if (fitHeight && cards[0].offsetHeight) { track.style.transition = 'none'; track.style.height = Math.round(heightAt(p) + 26) + 'px'; } };
    const set = function (p) { inner.style.transition = 'none'; inner.style.transform = 'translate3d(' + (pos(page) + dx).toFixed(1) + 'px,0,0)'; setH(p); };
    const stopRun = function () { if (run) { run.stop(); run = null; } if (hrun) { hrun.stop(); hrun = null; } };
    // settle on card p: a spring from wherever the strip is now, starting at v (finger speed, px/ms, + = rightwards)
    const springTo = function (p, v) {
      stopRun();
      const from = nowAt(inner).x, to = pos(p);
      if (calmMotion() || !inner.animate) { inner.style.transform = 'translate3d(' + to + 'px,0,0)'; setH(p); return; }
      const r = run = springGroup([[inner, { transform: 'translate3d(' + from + 'px,0,0)' }, { transform: 'translate3d(' + to + 'px,0,0)' }]], { response: 0.44, damping: 0.86, v: to === from ? 0 : v * Math.sign(to - from), dist: Math.abs(to - from) });
      r.onEnd = function () { if (run === r) run = null; };
      if (fitHeight && cards[0].offsetHeight) {
        const h0 = track.getBoundingClientRect().height, h1 = Math.round(heightAt(p) + 26);
        track.style.transition = 'none';
        if (Math.abs(h1 - h0) > 1) { const hr = hrun = springGroup([[track, { height: h0 + 'px' }, { height: h1 + 'px' }]], { response: 0.44, damping: 1, v: 0, dist: 1, noOver: true }); hr.onEnd = function () { if (hrun === hr) hrun = null; }; }
        else track.style.height = h1 + 'px';
      }
    };
    const go = function (p, v) { const was = page; page = Math.max(0, Math.min(n - 1, p)); dx = 0; springTo(page, v || 0); if (page !== was) { buzz('light'); onChange(page); } };
    // A strip that fits its height is placed straight away (what's below it must be where it'll stay, for the
    // diary's glide). Otherwise the first placement waits for the size watcher below, which reports once the
    // strip is laid out (before it's drawn): measuring here would lay out the whole page an extra time.
    if (!window.ResizeObserver || fitHeight) set(page); else { inner.style.transition = 'none'; inner.style.transform = 'translate3d(0,0,0)'; }
    track.addEventListener('pointerdown', function (e) {
      if (n < 2) return;
      x0 = e.clientX; y0 = e.clientY; axis = ''; id = e.pointerId; moved = false; fs.reset(); fs.add(e.clientX, e.timeStamp);
      // still moving from the last swipe: take hold of it right where it is
      grabbed = !!run; if (grabbed) { stopRun(); dx = nowAt(inner).x - pos(page); } else dx = 0;
      base = dx;
    });
    track.addEventListener('pointermove', function (e) {
      if (id !== e.pointerId) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!axis) {
        if ((Math.abs(mx) > 8 || (grabbed && Math.abs(mx) > 2)) && Math.abs(mx) > Math.abs(my)) { axis = 'x'; moved = true; x0 = e.clientX; try { track.setPointerCapture(id); } catch (x) {} }
        else if (Math.abs(my) > 8) { axis = 'y'; if (grabbed) go(page, 0); return; }
        else return;
      }
      if (axis !== 'x') return;
      fs.add(e.clientX, e.timeStamp);
      // past the first or last card it gives less and less (iPhone's rubber band)
      const raw = pos(page) + base + (e.clientX - x0), a = Math.min(pos(0), pos(n - 1)), b = Math.max(pos(0), pos(n - 1)), give = step() * 0.4;
      const at = raw > b ? b + rubber(raw - b, give) : raw < a ? a - rubber(a - raw, give) : raw;
      dx = at - pos(page);
      set(page + (rtl ? dx : -dx) / step());
    });
    const end = function (e) {
      if (id !== e.pointerId) return; id = null;
      if (axis !== 'x') { if (grabbed && axis !== 'y') go(page, 0); return; } // caught, then let go without moving: settle from there
      if (e.clientX != null) fs.add(e.clientX, e.timeStamp); // where the finger lifted counts too
      const v = fs.get(e.timeStamp), fwd = rtl ? dx : -dx, proj = fwd + (rtl ? v : -v) * 180; // towards the next card, px
      go(page + (proj > step() * 0.5 ? 1 : proj < -step() * 0.5 ? -1 : 0), v);
    };
    track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
    // A swipe isn't a tap: don't open the card underneath.
    track.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { go(page + ((e.key === 'ArrowRight') !== rtl ? 1 : -1), 0); e.preventDefault(); } });
    if (window.ResizeObserver) { const ro = new ResizeObserver(function () { if (id == null && !run && !hrun) set(page); }); Array.prototype.forEach.call(cards, function (c) { ro.observe(c); }); return ro; }
    return null;
  }
  // Cards that come and go (Ramadan, getting started, backup, last week, nutrient gaps) share one swipeable spot.
  let fyPage = 0, fyObs = null;
  // What you usually have for a meal: foods logged in it on at least 3 of the last 28 days (and on 40% of the days you logged it).
  let usualCache = { sig: '', v: {} };
  function usualFor(meal) {
    const today = dayNum(todayISO()), sig = today + ':' + Object.keys(state.food).length + ':' + JSON.stringify(state.food[isoFromDay(today - 1)] || []).length;
    if (usualCache.sig !== sig) usualCache = { sig: sig, v: {} };
    if (usualCache.v[meal] !== undefined) return usualCache.v[meal];
    const cnt = {}, last = {}; let days = 0;
    for (let k = 28; k >= 1; k--) {
      const its = eatenFor(isoFromDay(today - k)).filter(function (it) { return mealOf(it) === meal && it.ref && !isDailyTotal(it); });
      if (!its.length) continue; days++;
      const seen = {};
      its.forEach(function (it) { if (seen[it.ref]) return; seen[it.ref] = 1; cnt[it.ref] = (cnt[it.ref] || 0) + 1; last[it.ref] = it; });
    }
    const pick = Object.keys(cnt).filter(function (r) { return cnt[r] >= 3 && cnt[r] >= days * 0.4; }).sort(function (a, b) { return cnt[b] - cnt[a]; }).slice(0, 4).map(function (r) { return last[r]; });
    return (usualCache.v[meal] = pick.length ? pick : null);
  }
  function usualRow(meal) {
    const u = usualFor(meal); if (!u) return '';
    const kc = u.reduce(function (a, it) { return a + it.kcal; }, 0);
    return '<button type="button" class="usual" data-usual="' + meal + '"><span class="grow"><span class="usual-l">Your usual</span><span class="usual-n">' + esc(u.map(function (it) { return shortName(it.name); }).join(' · ')) + '</span></span><span class="usual-k num">' + fmtKcal(kc) + ' kcal</span><span class="usual-add">Add</span></button>';
  }
  // An empty meal offers what you had in it the day before, in one tap.
  function sameItems(meal) {
    if (viewDay > todayISO()) return [];
    return eatenFor(isoFromDay(dayNum(viewDay) - 1)).filter(function (it) { return mealOf(it) === meal && !isDailyTotal(it); });
  }
  function sameRow(meal) {
    const its = sameItems(meal); if (!its.length) return '';
    const sx = state.ui.sameX; if (sx && sx.d === viewDay && sx.m.indexOf(meal) >= 0) return ''; // dismissed for this day
    const kc = its.reduce(function (a, it) { return a + it.kcal; }, 0);
    return '<div class="usual same-y"><button type="button" class="same-go" data-same="' + meal + '"><span class="grow"><span class="usual-l">' + (viewDay === todayISO() ? 'Same as yesterday' : 'Same as the day before') + '</span><span class="usual-n">' + esc(its.map(function (it) { return shortName(it.name || 'Quick add'); }).join(' · ')) + '</span></span><span class="usual-k num">' + fmtKcal(kc) + ' kcal</span><span class="usual-add">Add</span></button>' +
      '<button type="button" class="same-x" data-same-x="' + meal + '" aria-label="Hide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button></div>';
  }
  // ----- Repeat items -----
  // Foods you choose to have added to your diary every day (or on the days you pick). Each day's copy has a fixed id,
  // so two phones never add it twice, and deleting it on a day you skip it keeps it gone (the deletion is remembered).
  const REP_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l3 3-3 3"/><path d="M4 11V9a3 3 0 0 1 3-3h13"/><path d="M7 21l-3-3 3-3"/><path d="M20 13v2a3 3 0 0 1-3 3H4"/></svg>';
  // Short day name in the app's language ("Fri" / "جمعة").
  function dayAbbr(d) { const x = WEEKDAYS[d].slice(0, 3); return state.settings.lang === 'ar' && typeof tr === 'function' ? tr(x) || x : x; }
  function repDays(r) {
    if (!r.days.length || r.days.length === 7) return 'Every day';
    const o = weekOrder().filter(function (d) { return r.days.indexOf(d) >= 0; });
    return o.map(function (d) { return dayAbbr(d); }).join(' · ');
  }
  function repOn(r, iso) { return !r.days.length || r.days.indexOf(new Date(dayNum(iso) * 864e5).getUTCDay()) >= 0; }
  function repItemId(r, iso) { return 'rp' + r.id + iso.replace(/-/g, ''); }
  // Add today's repeat items that aren't there yet. Returns how many were added.
  function applyRepeats() {
    if (!state.repeats || !state.repeats.length) return 0;
    const t = todayISO(), list = state.food[t] || [], add = [];
    state.repeats.forEach(function (r) { if (r.paused && r.until && r.until <= t) { r.paused = false; r.until = null; r.u = Date.now(); } });
    state.repeats.forEach(function (r) {
      if (r.paused || !repOn(r, t)) return;
      const id = repItemId(r, t);
      if (list.some(function (x) { return x.id === id; }) || (state.del && state.del[id])) return;
      if (MEALS.every(function (m) { return m[0] !== r.meal; })) return;
      if (r.time && nowHM() < r.time) return; // added when its time comes
      add.push(Object.assign({}, r.item, { id: id, meal: r.meal, rep: r.id }, r.time ? { t: r.time } : {}));
    });
    if (!add.length) return 0;
    state.food[t] = list.concat(add); save();
    return add.length;
  }
  // How a repeat item stands today: added, skipped, starts tomorrow, not today, or paused.
  function repStatus(r) {
    const t = todayISO(), id = repItemId(r, t);
    if (r.paused) return { k: 'paused', t: r.until ? 'Paused until ' + fmtDate(r.until, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Paused' };
    if (!repOn(r, t)) return { k: 'off', t: 'Not today' };
    if ((state.food[t] || []).some(function (x) { return x.id === id; })) return { k: 'on', t: 'Added today' };
    if (state.del && state.del[id]) return r.u && isoFromDay(Math.floor((r.u - new Date().getTimezoneOffset() * 6e4) / 864e5)) === t && state.del[id] - r.u < 5000 ? { k: 'next', t: 'Starts tomorrow' } : { k: 'skip', t: 'Skipped today' };
    if (r.time && nowHM() < r.time) return { k: 'next', t: 'Adds at ' + fmtHM(r.time) };
    return { k: 'next', t: 'Adds next time you open the app' };
  }
  // Suggestions: foods you've had in the same meal on most days lately (what used to be "your usual").
  function repeatSuggestions() {
    const out = [];
    MEALS.forEach(function (m) {
      (usualFor(m[0]) || []).forEach(function (it) {
        if (state.repeats.some(function (r) { return r.item.ref === it.ref && r.meal === m[0]; })) return;
        let n = 0; for (let k = 1; k <= 14; k++) if (eatenFor(isoFromDay(dayNum(todayISO()) - k)).some(function (x) { return x.ref === it.ref && mealOf(x) === m[0]; })) n++;
        out.push({ meal: m[0], item: it, n: n });
      });
    });
    return out.sort(function (a, b) { return b.n - a.n; }).slice(0, 8);
  }
  function repItemCopy(it) { const c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan; delete c.pic; delete c.note; delete c.u; delete c.rep; delete c.rc; return c; }
  // A starting time for "Add at a set time": when you last had it, or a usual time for that meal.
  function repDefTime(r) {
    if (r.item && /^\d\d:\d\d$/.test(r.item.t || '')) return r.item.t;
    const i = MEALS.findIndex(function (m) { return m[0] === r.meal; }), n = MEALS.length;
    return ['08:00', '13:00', '16:00', '19:00', '21:00', '22:00'][n <= 4 ? [0, 1, 3, 2][i] || 0 : Math.min(i, 5)] || '08:00';
  }
  function repNote(time) {
    return (time ? 'It\'s added to your diary at ' + fmtHM(time) + ' on those days.' : 'From tomorrow, it\'s added to your diary on those days.') + ' On a day you skip it, just delete it from the diary.';
  }
  // Create or edit one: amount, which meal, and which days.
  function repeatSheet(r0) {
    const isNew = !r0.id, r = { id: r0.id || null, item: Object.assign({}, r0.item), meal: MEALS.some(function (m) { return m[0] === r0.meal; }) ? r0.meal : MEALS[0][0], days: (r0.days || []).slice(), paused: !!r0.paused, time: r0.time || null };
    const base = Object.assign({}, r.item), hasQty = base.ref && base.qty > 0, food = base.ref ? getFood(base.ref) : null, units = food ? unitsFor(food) : null;
    openSheet('<div id="rpRoot"></div>', function (body) {
      sheet.classList.add('tall');
      const root = $('#rpRoot', body);
      const draw = function () {
        const it = r.item;
        root.innerHTML = '<div class="sheet-head qs-head"><span class="rp-ic">' + REP_IC + '</span><div class="grow" style="min-width:0"><div class="label faint">' + (isNew ? 'New repeat item' : 'Repeat item') + '</div><h2 class="sheet-title" id="sheetTitle">' + esc(it.name || 'Quick add') + '</h2></div></div>' +
          (hasQty ? '<div class="field"><span>Amount</span>' + (units ? '<div class="sv-amt rp-amt"><input class="input" id="rpQ" inputmode="decimal" maxlength="6" value="' + fmtQty(it.qty) + '" autocomplete="off" aria-label="Amount" /><select class="input" id="rpU" aria-label="Unit">' + units.map(function (u, i) { return '<option value="' + i + '"' + (u.label === it.unit ? ' selected' : '') + '>' + esc(u.label) + '</option>'; }).join('') + '</select></div>'
            : '<div class="sfx"><input class="input" id="rpQ" inputmode="decimal" maxlength="6" value="' + fmtQty(it.qty) + '" autocomplete="off" aria-label="Amount" /><em>' + esc(it.unit === 'g' ? 'g' : it.unit) + '</em></div>') + '</div>' : '') +
          '<p class="rp-mac" id="rpMac">' + fmtKcal(it.kcal) + ' kcal · P ' + it.protein + ' · C ' + it.carbs + ' · F ' + it.fat + '</p>' +
          '<div class="label faint fd-sec">Meal</div><div class="mt-chips rp-chips">' + MEALS.map(function (m) { return '<button type="button" data-rm="' + m[0] + '" aria-pressed="' + (m[0] === r.meal) + '">' + esc(m[1]) + '</button>'; }).join('') + '</div>' +
          '<div class="label faint fd-sec">Days</div><div class="rp-days"><button type="button" data-rd="all" aria-pressed="' + (!r.days.length || r.days.length === 7) + '">Every day</button>' + weekOrder().map(function (d) { return '<button type="button" data-rd="' + d + '" aria-pressed="' + (r.days.length > 0 && r.days.length < 7 && r.days.indexOf(d) >= 0) + '">' + WEEKDAYS[d].slice(0, 2) + '</button>'; }).join('') + '</div>' +
          (isNew ? '' : '<div class="list rp-pause"><label class="row"><div class="grow"><div class="row-t">Pause</div><div class="row-s">Stop adding it for now</div></div><span class="switch"><input type="checkbox" id="rpPause"' + (r.paused ? ' checked' : '') + ' /><i></i></span></label>' +
            '<label class="row rp-until"' + (r.paused ? '' : ' hidden') + '><div class="grow"><div class="row-t">Resume on</div><div class="row-s">Leave empty to resume yourself</div></div><input class="input rp-date" type="date" id="rpUntil" min="' + isoFromDay(dayNum(todayISO()) + 1) + '" value="' + (r0.until || '') + '" /></label></div>') +
          '<div class="list rp-pause rp-time"><label class="row"><div class="grow"><div class="row-t">Add at a set time</div><div class="row-s">Added to your diary at this time</div></div><span class="switch"><input type="checkbox" id="rpTimeOn"' + (r.time ? ' checked' : '') + ' /><i></i></span></label>' +
            '<label class="row rp-until rp-tm"' + (r.time ? '' : ' hidden') + '><div class="grow"><div class="row-t">Time</div></div><input class="input rp-date" type="time" id="rpTime" value="' + (r.time || repDefTime(r)) + '" aria-label="Time" /></label></div>' +
          '<p class="muted-note rp-note" id="rpNote">' + repNote(r.time) + '</p>' +
          '<div class="btn-row">' + (isNew ? '' : '<button type="button" class="btn danger icon-only" id="rpDel" aria-label="Stop repeating">' + TRASH + '</button>') + '<button type="button" class="btn primary" id="rpSave">' + (isNew ? 'Start repeating' : 'Save') + '</button></div>';
        if ($('#rpPause', root)) $('#rpPause', root).addEventListener('change', function () { $('.rp-until:not(.rp-tm)', root).hidden = !this.checked; });
        const timeVal = function () { return $('#rpTimeOn', root).checked && /^\d\d:\d\d$/.test($('#rpTime', root).value) ? $('#rpTime', root).value : null; };
        $('#rpTimeOn', root).addEventListener('change', function () { $('.rp-tm', root).hidden = !this.checked; r.time = timeVal(); $('#rpNote', root).textContent = repNote(r.time); buzz('light'); });
        $('#rpTime', root).addEventListener('input', function () { r.time = timeVal(); $('#rpNote', root).textContent = repNote(r.time); });
        const recalc = function () {
          const n = parseNum($('#rpQ', root).value); if (isNaN(n) || n <= 0 || n > 10000) return;
          if (units) { const u = units[+$('#rpU', root).value], g = n * u.g, mm = macrosFor(food, g); Object.assign(r.item, { qty: Math.round(n * 1000) / 1000, unit: u.label, g: Math.round(g * 10) / 10, kcal: Math.min(mm.kcal, 10000), protein: mm.protein, carbs: mm.carbs, fat: mm.fat }); }
          else { const k = n / base.qty; Object.assign(r.item, { qty: Math.round(n * 1000) / 1000, g: Math.round(base.g * k * 10) / 10, kcal: Math.round(base.kcal * k), protein: Math.round(base.protein * k), carbs: Math.round(base.carbs * k), fat: Math.round(base.fat * k) }); }
          $('#rpMac', root).textContent = fmtKcal(r.item.kcal) + ' kcal · P ' + r.item.protein + ' · C ' + r.item.carbs + ' · F ' + r.item.fat;
        };
        if (hasQty) { $('#rpQ', root).addEventListener('input', recalc); if ($('#rpU', root)) $('#rpU', root).addEventListener('change', function () { const u = units[+this.value]; $('#rpQ', root).value = u.label === 'g' ? '100' : '1'; recalc(); }); }
        // Taps only update the buttons (no redraw), so the sheet never jumps while you choose.
        const paintDays = function () { const all = !r.days.length || r.days.length === 7; $$('[data-rd]', root).forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.rd === 'all' ? all : !all && r.days.indexOf(+x.dataset.rd) >= 0); }); };
        $$('[data-rm]', root).forEach(function (b) { b.addEventListener('click', function () { r.meal = b.dataset.rm; buzz('light'); $$('[data-rm]', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }); });
        $$('[data-rd]', root).forEach(function (b) { b.addEventListener('click', function () {
          const v = b.dataset.rd;
          if (v === 'all') r.days = [];
          else { const d = +v; const i = r.days.indexOf(d); if (i >= 0) r.days.splice(i, 1); else r.days.push(d); if (r.days.length === 7) r.days = []; }
          buzz('light'); paintDays();
        }); });
        $('#rpSave', root).addEventListener('click', function () {
          const snap = snapshot(), rec = { id: r.id || 'p' + Math.random().toString(36).slice(2, 10), item: repItemCopy(r.item), meal: r.meal, days: r.days.slice().sort(), u: Date.now(), paused: !!($('#rpPause', root) && $('#rpPause', root).checked), time: timeVal() };
          if (rec.paused && $('#rpUntil', root) && ISO_RE.test($('#rpUntil', root).value) && $('#rpUntil', root).value > todayISO()) rec.until = $('#rpUntil', root).value;
          const i = state.repeats.findIndex(function (x) { return x.id === rec.id; });
          if (i >= 0) state.repeats[i] = rec; else state.repeats.push(rec);
          if (state.del) delete state.del['rp:' + rec.id];
          // Starts from tomorrow: today's copy is marked as skipped (unless it's already in the diary),
          // except with a time still to come today, when it's added at that time.
          const tid = repItemId(rec, todayISO()), later = rec.time && rec.time > nowHM() && !rec.paused && repOn(rec, todayISO());
          if (!later && !(state.food[todayISO()] || []).some(function (x) { return x.id === tid; })) state.del[tid] = Date.now();
          save(); renderAll(); closeSheet(); buzz('success');
          toast((isNew ? 'Repeating ' + shortName(rec.item.name) + (later ? ', today at ' + fmtHM(rec.time) : ' from tomorrow') : 'Repeat saved'), function () { restore(snap); });
        });
        if ($('#rpDel', root)) $('#rpDel', root).addEventListener('click', function () {
          const snap = snapshot();
          state.repeats = state.repeats.filter(function (x) { return x.id !== r.id; });
          state.del['rp:' + r.id] = Date.now();
          save(); renderAll(); closeSheet(); buzz('medium');
          toast('Stopped repeating ' + shortName(r.item.name), function () { restore(snap); });
        });
      };
      draw();
    }, function () { sheet.classList.remove('tall'); });
  }
  // Pause every repeat item, e.g. while travelling: for a few days, a week, or until you resume.
  function pauseAllSheet() {
    const t = dayNum(todayISO()), opts = [[3, '3 days'], [7, '1 week'], [14, '2 weeks'], [0, 'Until I resume']];
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Pause all repeat items</h2></div><p class="sheet-text">Nothing is added while they\'re paused. Good for travel or a change of routine.</p>' +
      '<div class="list">' + opts.map(function (o) { return '<button type="button" class="row" data-pa="' + o[0] + '"><div class="grow"><div class="row-t">' + o[1] + '</div>' + (o[0] ? '<div class="row-s">Back on ' + esc(fmtDate(isoFromDay(t + o[0]), { weekday: 'short', month: 'short', day: 'numeric' })) + '</div>' : '') + '</div>' + CHEV + '</button>'; }).join('') + '</div>',
      function (root) {
        $$('[data-pa]', root).forEach(function (b) { b.addEventListener('click', function () {
          const n = +b.dataset.pa, snap = snapshot(), until = n ? isoFromDay(t + n) : null;
          state.repeats.forEach(function (r) { r.paused = true; r.until = until; r.u = Date.now(); });
          save(); renderAll(); closeSheet(); buzz('success'); toast('Repeat items paused' + (until ? ' until ' + fmtDate(until, { month: 'short', day: 'numeric' }) : ''), function () { restore(snap); });
        }); });
      });
  }
  // The Repeat items list (Foods tab): yours, then suggestions from what you eat most days.
  function repeatListHtml(fq) {
    const mealN = function (k) { const m = MEALS.find(function (x) { return x[0] === k; }); return m ? m[1] : k; };
    const mine = state.repeats.filter(function (r) { return !fq || normText(r.item.name || '').indexOf(fq) >= 0; });
    let h = '';
    if (mine.length && !fq) {
      // Today at a glance: what your repeat items add.
      const st = state.repeats.map(function (r) { return { r: r, s: repStatus(r).k }; }), on = st.filter(function (x) { return x.s === 'on'; }).map(function (x) { return x.r; });
      const nLater = state.repeats.filter(function (r) { return r.time && !r.paused && repOn(r, todayISO()) && nowHM() < r.time && !(state.del && state.del[repItemId(r, todayISO())]); }).length, nSkip = st.filter(function (x) { return x.s === 'skip'; }).length, nPause = st.filter(function (x) { return x.s === 'paused'; }).length;
      const k = on.reduce(function (a, r) { return a + (r.item.kcal || 0); }, 0), pr = on.reduce(function (a, r) { return a + (r.item.protein || 0); }, 0);
      const extra = [nSkip ? nSkip + ' skipped' : '', nPause ? nPause + ' paused' : ''].filter(Boolean).join(' · ');
      const allPaused = state.repeats.every(function (r) { return r.paused; });
      const pauseBtn = '<button type="button" class="rp-all" data-rep-all="' + (allPaused ? 'resume' : 'pause') + '">' + (allPaused ? 'Resume all' : 'Pause all') + '</button>';
      const title = on.length ? on.length + (on.length === 1 ? ' repeat added today' : ' repeats added today') : nLater ? 'Coming up later today' : allPaused ? 'All repeats paused' : 'Nothing repeats today';
      const sub = on.length ? fmtKcal(k) + ' kcal · ' + pr + ' g protein' + (nLater ? ' · ' + nLater + ' more later' : '') : nLater ? nLater + ' will be added at the time you set' : allPaused ? 'Turn them back on any time' : 'Your repeats are set for other days';
      h += '<div class="card rp-sum"><div class="rp-sum-top"><span class="rp-ic">' + REP_IC + '</span>' + pauseBtn + '</div><b>' + esc(title) + '</b><span>' + esc(sub) + (extra ? ' · ' + esc(extra) : '') + '</span></div>';
    }
    // Grouped by meal, in your Diary's order.
    MEALS.concat(mine.some(function (r) { return MEALS.every(function (m) { return m[0] !== r.meal; }); }) ? [['?', 'Other']] : []).forEach(function (m) {
      const rs = mine.filter(function (r) { return m[0] === '?' ? MEALS.every(function (x) { return x[0] !== r.meal; }) : r.meal === m[0]; });
      if (!rs.length) return;
      h += '<div class="group-label">' + esc(m[1]) + '</div><div class="list">' + rs.map(function (r) {
        const stt = repStatus(r);
        return '<button type="button" class="row mf-row rp-row' + (r.paused ? ' paused' : '') + '" data-rep="' + r.id + '">' + diaryIcon(r.item) + '<div class="grow"><div class="row-t">' + esc(r.item.name || 'Quick add') + '</div><div class="row-s">' + esc(repDays(r)) + (r.time ? ' · ' + esc(fmtHM(r.time)) : '') + (r.item.ref ? ' · ' + esc(fmtAmt(r.item.qty, r.item.unit)) : '') + '</div>' + (stt.k === 'on' || stt.k === 'next' ? '' : '<span class="rp-st rp-' + stt.k + '">' + esc(stt.t) + '</span>') + '</div><span class="row-v num mf-k">' + fmtKcal(r.item.kcal) + '<small>kcal</small></span></button>';
      }).join('') + '</div>';
    });
    if (!mine.length && !fq) h += '<p class="muted-note fd-empty">Nothing repeating yet. Pick a food below, tap New, or hold a food in your diary and choose Repeat.</p>';
    const sug = fq ? [] : repeatSuggestions();
    if (sug.length) h += '<div class="group-label">Suggested from your diary</div><div class="list">' + sug.map(function (s, i) {
      return '<div class="row mf-row rp-sug">' + diaryIcon(s.item) + '<div class="grow"><div class="row-t">' + esc(s.item.name || '') + '</div><div class="row-s">' + esc(mealN(s.meal)) + ' · ' + s.n + ' of the last 14 days · ' + esc(fmtAmt(s.item.qty, s.item.unit)) + '</div></div><button type="button" class="mf-add" data-rsug="' + i + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12M12 6v12"/></svg>Repeat</button></div>';
    }).join('') + '</div>';
    return { html: h, sug: sug };
  }
  function shortName(n) { return String(n || '').split(' · ')[0].split(',')[0].slice(0, 26); }
  // A simple 0–100 for the day: calories near target, protein reached, fibre, and carbs/fat near plan.
  function dayScore(d) {
    const plan = dayPlan(d), tt = dayTotals(d); if (!plan || !tt.kcal) return null;
    const tgt = roundKcal(plan.target), parts = [];
    const off = Math.abs(tt.kcal - tgt) / tgt;
    parts.push({ k: 'kcal', label: 'Calories', max: 40, pts: 40 * Math.max(0, Math.min(1, (0.3 - off) / 0.25)), note: fmtKcal(tt.kcal) + ' of ' + fmtKcal(tgt) + ' kcal' });
    parts.push({ k: 'p', label: 'Protein', max: 30, pts: 30 * Math.min(1, plan.protein ? tt.protein / plan.protein : 1), note: tt.protein + ' of ' + plan.protein + ' g' });
    if (foodDB) {
      const nd = dayNutrients(d), tg = nutTargets(d), fmin = tg.fib && tg.fib.min || 25;
      if (nd.cov.fib > 0.6) parts.push({ k: 'fib', label: 'Fibre', max: 15, pts: 15 * Math.min(1, nd.tot.fib / fmin), note: Math.round(nd.tot.fib) + ' of ' + Math.round(fmin) + ' g' });
    }
    const bal = function (v, t) { return t ? Math.max(0, 1 - Math.max(0, Math.abs(v - t) / t - 0.15) / 0.35) : 1; };
    parts.push({ k: 'bal', label: 'Carbs and fat', max: 15, pts: 15 * (bal(tt.carbs, plan.carbs) + bal(tt.fat, plan.fat)) / 2, note: 'C ' + tt.carbs + ' / ' + plan.carbs + ' g · F ' + tt.fat + ' / ' + plan.fat + ' g' });
    const max = parts.reduce(function (a, x) { return a + x.max; }, 0), score = Math.round(parts.reduce(function (a, x) { return a + x.pts; }, 0) / max * 100);
    return { score: score, grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D', parts: parts };
  }
  function scorePill(d) {
    const tt = dayTotals(d), plan = dayPlan(d); if (!plan) return '';
    if (d > todayISO() || (d === todayISO() && tt.kcal < plan.target * 0.7)) return '';
    const sc = dayScore(d); if (!sc) return '';
    return '<span class="dscore ds-' + sc.grade.toLowerCase() + '" data-action="day-score" role="button" aria-label="Day score ' + sc.grade + ', ' + sc.score + ' out of 100"><b>' + sc.grade + '</b><small>Day score</small></span>';
  }
  function dayScoreSheet(d) {
    const sc = dayScore(d); if (!sc) return;
    const weak = sc.parts.slice().sort(function (a, b) { return a.pts / a.max - b.pts / b.max; })[0];
    const tip = weak.pts / weak.max > 0.9 ? 'A really well balanced day.' : weak.k === 'kcal' ? 'Calories were the furthest off. Getting closer to your target helps the most.' : weak.k === 'p' ? 'Protein was the lowest. Eggs, chicken, tuna, Greek yogurt or lentils help.' : weak.k === 'fib' ? 'Fibre was low. Beans, foul, vegetables, fruit and whole grains help.' : 'Carbs and fat were a bit off plan. Calories still count most.';
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Day score</h2></div>' +
      '<div class="ds-hero"><span class="dscore big ds-' + sc.grade.toLowerCase() + '">' + sc.grade + '</span><div><b class="num">' + sc.score + '<small> / 100</small></b><span>' + esc(relDate(d)) + '</span></div></div>' +
      '<div class="list ds-list">' + sc.parts.map(function (x) { const pc = x.pts / x.max * 100; return '<div class="row"><div class="grow"><div class="row-t">' + x.label + '</div><div class="row-s">' + x.note + '</div><div class="bar ds-bar"><i style="width:' + pc.toFixed(0) + '%"></i></div></div><span class="row-v num">' + Math.round(x.pts) + '<small>/' + x.max + '</small></span></div>'; }).join('') + '</div>' +
      '<p class="muted-note ds-tip">' + tip + '</p>');
  }
  // Hitting the day's target (calories 90–105%, protein 90%+) while you log: a little confetti, once a day.
  let dayHit = null;
  function dayHitCheck(plan, tt) {
    const hit = !!plan && tt.kcal >= plan.target * 0.9 && tt.kcal <= plan.target * 1.05 && (!plan.protein || tt.protein >= plan.protein * 0.9);
    const was = dayHit; dayHit = hit;
    if (!hit || was !== false || state.ui.celeb === todayISO()) return;
    state.ui.celeb = todayISO(); save();
    setTimeout(function () {
      buzz('success');
      const el = document.createElement('div'), still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.className = 'day-confetti';
      const colors = ['var(--accent)', '#f6c453', '#ff7a8a', '#7ab8ff', '#b4a4ff'];
      let bits = ''; if (!still) for (let i = 0; i < 40; i++) bits += '<i aria-hidden="true" style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + colors[i % colors.length] + ';animation-delay:' + (Math.random() * 0.5).toFixed(2) + 's;animation-duration:' + (1.5 + Math.random() * 1.1).toFixed(2) + 's"></i>';
      el.innerHTML = bits + '<span class="day-pill" role="status">' + FLAME + 'Right on target today</span>';
      document.body.appendChild(el); setTimeout(function () { el.remove(); }, 3200);
    }, 450);
  }
  // A meal's protein, carbs and fat: a little bar split by where the calories come from, and the grams in matching colours.
  function mealMacros(m) {
    const kp = m.p * 4, kc = m.c * 4, kf = m.f * 9, t = kp + kc + kf;
    return (t ? '<span class="mh-bar" aria-hidden="true">' + [['p', kp], ['c', kc], ['f', kf]].filter(function (x) { return x[1] / t >= 0.02; }).map(function (x) { return '<i class="mb-' + x[0] + '" style="flex:' + x[1].toFixed(0) + '"></i>'; }).join('') + '</span>' : '') +
      '<span class="mh-n"><b class="t-p">' + Math.round(m.p) + '</b>P <b class="t-c">' + Math.round(m.c) + '</b>C <b class="t-f">' + Math.round(m.f) + '</b>F</span>';
  }
  function forYou(cards) {
    cards = cards.filter(Boolean);
    if (cards.length < 2) { fyPage = 0; return cards.join(''); }
    if (fyPage >= cards.length) fyPage = cards.length - 1;
    return '<div class="fy"><div class="fy-track pager" id="fyTrack"><div class="pg-in">' + cards.join('') + '</div></div><div class="fy-dots" id="fyDots" aria-hidden="true">' + cards.map(function (c, k) { return '<i' + (k === fyPage ? ' class="on"' : '') + '></i>'; }).join('') + '</div></div>';
  }
  // The Diary moves instead of jumping. Change day and the day slides in from that side; change something on the
  // same day (add or remove a food, fold a meal, hide a suggestion) and everything below glides to its new place.
  let diaryDay = null;
  function diaryItems() {
    const out = {}, ml = $('#mealList'); if (!ml) return out;
    const put = function (k, el, rel) { out[k] = { el: el, top: el.getBoundingClientRect().top - (rel ? rel.getBoundingClientRect().top : 0) }; };
    const t = $('#tiles'); if (t && !t.hidden) put('tiles', t);
    const fy = $('.fy', ml); if (fy) put('fy', fy);
    $$('.meal-sec', ml).forEach(function (sec) {
      const h = $('.meal-head', sec); if (!h) return; put('s:' + h.dataset.mh, sec);
      $$('.sw', sec).forEach(function (w) { const b = w.querySelector('[data-food]'); if (!b) return; put('f:' + b.dataset.food, w, sec); // rows: where they sit in their meal
        const pr = w.parentNode.getBoundingClientRect(), r = w.getBoundingClientRect(); out['f:' + b.dataset.food].ghost = { sec: 's:' + h.dataset.mh, box: w.parentNode.className, top: r.top - pr.top, left: r.left - pr.left, w: r.width }; });
    });
    return out;
  }
  function diaryGlide(before) {
    const after = diaryItems(), ease = 'cubic-bezier(.2,.8,.2,1)';
    Object.keys(after).forEach(function (k) {
      const a = after[k], b = before[k];
      // a row that's new here (put back with undo, moved in): fades in as the space for it opens
      if (!b) { if (k.indexOf('f:') === 0 && !a.el.querySelector('.row-new')) a.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 90, easing: 'ease', fill: 'backwards' }); return; }
      const dy = b.top - a.top; if (Math.abs(dy) < 1) return;
      a.el.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 400, easing: ease });
    });
    // a row that's gone fades out where it was, under the rows sliding up into its place
    Object.keys(before).forEach(function (k) {
      const b = before[k], g = b.ghost; if (!g || after[k] || !after[g.sec]) return;
      const sec = after[g.sec].el, box = (g.box && sec.querySelector('.' + g.box.trim().split(/\s+/).join('.'))) || sec;
      const el = b.el, keep = box.style.position, stat = getComputedStyle(box).position === 'static';
      el.style.cssText += ';position:absolute;top:' + g.top + 'px;left:' + g.left + 'px;width:' + g.w + 'px;margin:0;pointer-events:none';
      el.setAttribute('aria-hidden', 'true'); el.inert = true; $$('[id]', el).forEach(function (x) { x.removeAttribute('id'); });
      if (stat) box.style.position = 'relative';
      box.insertBefore(el, box.firstChild);
      const an = el.animate([{ opacity: 1, transform: (el.style.transform || 'none') }, { opacity: 0, transform: (el.style.transform ? el.style.transform + ' ' : '') + 'scale(.97)' }], { duration: 220, easing: 'ease', fill: 'forwards' });
      const done = function () { el.remove(); if (stat && !box.querySelector(':scope > .sw[aria-hidden="true"]')) box.style.position = keep; };
      an.onfinish = an.oncancel = done;
    });
  }
  function daySlide(dir) {
    const dx = 26 * dir * (document.documentElement.dir === 'rtl' ? -1 : 1), ease = 'cubic-bezier(.22,1,.36,1)';
    ['#sumCard', '#tiles', '#mealList'].forEach(function (sel, i) {
      const el = $(sel); if (!el || el.hidden) return;
      el.animate([{ opacity: 0, transform: 'translateX(' + dx + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: i * 35, easing: ease, fill: 'backwards' });
    });
    const t = $('.day-title'); if (t) t.animate([{ opacity: 0, transform: 'translateX(' + dx * 0.4 + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: ease });
  }
  // A planned food you tick off glows once, so you see which one changed.
  function eatenFlash(id) {
    const r = $('#mealList [data-food="' + id + '"]'); if (!r || !r.animate || calmMotion()) return;
    const c = getComputedStyle(document.documentElement).getPropertyValue('--accent-soft').trim() || 'rgba(0,0,0,.06)';
    r.animate([{ backgroundColor: c }, { backgroundColor: 'transparent' }], { duration: 1100, easing: 'cubic-bezier(.22,1,.36,1)' });
    const v = r.querySelector('.row-v'); if (v) v.animate([{ transform: 'scale(1.18)' }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.34,1.45,.64,1)' });
  }
  function renderDiary() {
    const p = $('#panel-diary'), live = !!p && !p.hidden && state.ui.tab === 'diary' && !document.hidden && !calmMotion() && !!document.body.animate;
    const prev = diaryDay, before = live && prev === viewDay ? diaryItems() : null;
    renderDiaryNow();
    diaryDay = viewDay;
    if (!live || !prev) return;
    if (prev !== viewDay) daySlide(viewDay > prev ? 1 : -1); else if (before) diaryGlide(before);
  }
  function renderDiaryNow() {
    const today = todayISO(), maxDay = isoFromDay(dayNum(today) + PLAN_DAYS);
    if (viewDay > maxDay) viewDay = today;
    const diff = dayNum(today) - dayNum(viewDay), ahead = diff < 0;
    $('#dayLabel').textContent = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : diff === -1 ? 'Tomorrow' : fmtDate(viewDay, { weekday: 'long' });
    const stk = diff === 0 ? foodStreak() : 0;
    $('#daySub').innerHTML = esc(fmtDate(viewDay, { month: 'short', day: 'numeric' }) + (parseISO(viewDay).getFullYear() !== new Date().getFullYear() ? ', ' + parseISO(viewDay).getFullYear() : '')) + (stk >= 2 ? '<span class="stk">' + FLAME + stk + '</span>' : '');
    $('#daySub').title = stk >= 2 ? stk + ' days logged in a row (one missed day a week is forgiven)' : '';
    $('#dayPick').value = viewDay; $('#dayPick').max = maxDay;
    $('#dayNext').disabled = viewDay >= maxDay;
    $('#tiles').hidden = ahead; // weight, water and fasting are for today and before

    // Summary: calories left (ring) and macro bars
    const plan = dayPlan(viewDay), tt = dayTotals(viewDay), sc = $('#sumCard');
    let page1 = '';
    if (plan) {
      const tgt = roundKcal(plan.target), left = tgt - tt.kcal, r = 34, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, tt.kcal / tgt));
      // Energy, protein, carbs and fat: amount / target, % and a bar each.
      // One card: calories on top (eaten / target, what's left, a full bar), then protein, carbs and fat side by side.
      // Red once you go over that nutrient's max (from Targets); with no max set, a little past the target.
      const ntg = nutTargets(viewDay), NK = { k: 'kcal', p: 'p', c: 'c', f: 'f' };
      const meter = function (val, max, k) { const pc = max ? val / max * 100 : 0, hi = ntg[NK[k]] && ntg[NK[k]].hi; return '<div class="bar tg-bar sm-bar"><i data-aw class="mb-' + k + ((hi != null ? val > hi : val > max * (k === 'k' ? 1.05 : 1.1)) ? ' over' : '') + '" style="width:' + Math.min(100, pc).toFixed(1) + '%"></i></div>'; };
      const tags = [plannedFor(viewDay).length ? '+' + fmtKcal(plannedFor(viewDay).reduce(function (a, f) { return a + f.kcal; }, 0)) + ' planned' : '', plan.train != null ? (plan.train ? 'Training day' : 'Rest day') : '', plan.flex ? 'Flex ' + (plan.flex > 0 ? '+' : '−') + fmtKcal(Math.abs(plan.flex)) : '', plan.mode ? (plan.mode === 'f' ? 'Refeed day' : 'Diet break') : ''].filter(Boolean);
      page1 = '<div class="card sum-card" data-action="nutrients" role="button" tabindex="0"><div class="sum-head">' + TG_BTN + scorePill(viewDay) + '</div>' +
        (tags.length ? '<div class="sum-tags">' + tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="sm-cal"><div class="sm-l">Calories</div><div class="sm-top"><span class="sm-v num"><b data-an="' + Math.round(tt.kcal) + '">' + fmtKcal(tt.kcal) + '</b><span class="sm-u">kcal</span><span class="sm-of">/ ' + fmtKcal(tgt) + '</span></span>' +
          '<span class="sm-left num' + (left < 0 ? ' over' : '') + '"><b>' + fmtKcal(Math.abs(left)) + '</b> ' + (left < 0 ? 'over' : 'left') + '</span></div>' + meter(tt.kcal, tgt, 'k') + '</div>' +
        '<div class="sm-macs">' + [['Protein', tt.protein, plan.protein, 'p'], ['Carbs', tt.carbs, plan.carbs, 'c'], ['Fat', tt.fat, plan.fat, 'f']].map(function (x) {
          return '<div class="sm-m"><div class="sm-l">' + x[0] + '</div><div class="sm-mv num"><b data-an="' + Math.round(x[1]) + '" data-af="g">' + Math.round(x[1]) + '</b><span class="sm-u">g</span><span class="sm-of">/ ' + x[2] + '</span></div>' + meter(x[1], x[2], x[3]) + '</div>';
        }).join('') + '</div></div>';
    } else {
      page1 = '<div class="card sum-card sum-empty" data-action="go-targets" role="button" tabindex="0"><div class="sum-head">' + TG_BTN + '</div>' +
        '<p class="sum-empty-t">Set your targets to see energy, protein, carbs and fat here.' + (tt.kcal ? ' ' + fmtKcal(tt.kcal) + ' kcal logged so far.' : '') + '</p><span class="btn soft sum-empty-b">Set targets</span></div>';
    }

    // Swipe left for highlighted nutrients (keeps whichever card you were on).
    sc.innerHTML = '<div class="sum-track pager" id="sumTrack"><div class="pg-in">' + page1 + highlightCard() + '</div></div><div class="sum-dots" aria-hidden="true"><i' + (sumPage ? '' : ' class="on"') + '></i><i' + (sumPage ? ' class="on"' : '') + '></i></div>';
    animate(sc, 'sum:' + viewDay);
    if (diff === 0) dayHitCheck(plan, tt);
    if (!state.ui.holdTip && foodFor(viewDay).length >= 3) { state.ui.holdTip = true; save(); setTimeout(function () { toast('Tip: hold a food for shortcuts, or hold and drag to move it'); }, 1500); }
    // Swipe between the two cards. Moved by hand (not the browser's snap scrolling), so it follows your finger and settles without overshooting.
    const track = $('#sumTrack');
    if (sumObs) sumObs.disconnect();
    sumObs = pager(track, sumPage, function (pg) { sumPage = pg; $$('.sum-dots i', sc).forEach(function (d, i) { d.classList.toggle('on', i === pg); }); }, true);

    // Tiles: weight, water, fasting
    const e = findEntry(viewDay), wr = $('#weightRow');
    wr.innerHTML = '<span class="tile-top"><span class="label"><i class="tl-dot tl-w"></i>Weight</span>' + (e ? '' : '<span class="tile-add">Log</span>') + '</span>' +
      (e ? '<span class="l-v num">' + fmtW(e.kg) + '<span class="unit" style="font-size:12px">' + unit() + '</span></span><span class="l-s">Trend ' + fmtW(trendAt(dayNum(viewDay))) + '</span>'
        : '<span class="row-t tile-empty">' + (diff === 0 ? 'Not logged yet' : 'Not logged') + '</span><span class="l-s">&nbsp;</span>');
    const wml = waterTotal(viewDay), wg = waterGoal();
    $('#waterTile').innerHTML = '<span class="tile-top"><span class="label"><i class="tl-dot tl-h"></i>Water</span><button type="button" class="tile-plus" data-water-add aria-label="Add a glass of water">+</button></span>' +
      '<span class="l-v num">' + (wml >= 1000 ? (Math.round(wml / 10) / 100) : Math.round(wml)) + '<span class="unit" style="font-size:12px">' + (wml >= 1000 ? 'L' : 'ml') + '</span></span>' +
      '<span class="bar tile-bar"><i data-aw style="width:' + Math.min(100, wml / wg * 100).toFixed(1) + '%"></i></span>';
    animate($('#waterTile'), 'water:' + viewDay);
    const ft = $('#fastTile'), fon = state.settings.fasting;
    ft.hidden = !fon; $('#tiles').classList.toggle('three', fon);
    if (fon) {
      const fsx = state.fast, el = fsx.start ? Date.now() - fsx.start : 0;
      ft.innerHTML = '<span class="tile-top"><span class="label"><i class="tl-dot tl-f"></i>Fasting</span></span>' +
        (fsx.start ? '<span class="l-v num">' + fmtDur(el) + '<span class="unit" style="font-size:12px">h</span></span><span class="bar tile-bar' + (el >= fsx.goal * 3600000 ? ' done' : '') + '"><i style="width:' + Math.min(100, el / (fsx.goal * 36000)).toFixed(1) + '%"></i></span>'
          : '<span class="row-t tile-empty">Start</span><span class="l-s">' + (lastMeal() ? 'Ate ' + fmtAgo(Date.now() - lastMeal()) + ' ago' : fsx.goal + 'h goal') + '</span>');
    }

    // Meals
    const items = foodFor(viewDay), totals = items.filter(isDailyTotal), shut = state.ui.shut;
    let html = '';
    // Calorie totals saved with a weigh-in (older versions) sit on their own, not in a meal.
    if (totals.length) html += '<div class="list">' + totals.map(function (f) { return swRow(f, '<button type="button" class="row food-item day-total" data-food="' + f.id + '"><div class="grow"><div class="row-t">Daily total</div><div class="row-s">Calories saved with your weigh-in</div></div><span class="row-v num">' + fmtKcal(f.kcal) + '</span></button>', true); }).join('') + '</div>';
    MEALS.forEach(function (m) {
      const its = items.filter(function (f) { return mealOf(f) === m[0] && !isDailyTotal(f); }), kc = its.reduce(function (a, f) { return a + (counts(f, viewDay) ? f.kcal : 0); }, 0), open = shut.indexOf(m[0]) < 0;
      // Meal title sits above its card (on the page), so it reads as a heading; the card holds only the foods.
      const mac = its.filter(function (f) { return counts(f, viewDay); }).reduce(function (a, f) { a.p += f.protein || 0; a.c += f.carbs || 0; a.f += f.fat || 0; return a; }, { p: 0, c: 0, f: 0 });
      html += '<section class="meal-sec' + (open && its.length ? '' : ' shut') + '"><div class="list meal-card">';
      html += '<div class="meal-head' + (open ? '' : ' shut') + '" data-mh="' + m[0] + '"><button type="button" class="meal-toggle" data-toggle-meal="' + m[0] + '" aria-expanded="' + open + '"><span class="mh-t"><span class="mh-line"><span class="row-t">' + esc(m[1]) + '</span><svg class="meal-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>' + (its.length ? '<span class="mh-sub">' + (open ? mealMacros(mac) : its.length + (its.length === 1 ? ' food' : ' foods')) + '</span>' : '') + '</span></button>' +
        '<span class="row-v num">' + (kc ? fmtKcal(kc) + '<small> kcal</small>' : '') + '</span>' +
        (its.length ? '<button type="button" class="icon-btn meal-more" data-meal-menu="' + m[0] + '" aria-label="' + m[1] + ' options"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18.5" cy="12" r="1.7"/></svg></button>' : '') +
        (open && its.length ? '' : '<button type="button" class="icon-btn mh-add" data-add-meal="' + m[0] + '" aria-label="Add to ' + m[1] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg></button>') + '</div>';
      const usual = '', card = open && its.length;
      if (card) html += '<div class="meal-body">' + usual;
      if (open) its.forEach(function (f) {
        const mac = [fmtHM(f.t), f.ref ? fmtAmt(f.qty, f.unit) : [f.protein ? 'P ' + f.protein : '', f.carbs ? 'C ' + f.carbs : '', f.fat ? 'F ' + f.fat : ''].filter(Boolean).join(' · ')].filter(Boolean).join(' · ');
        const pl = f.plan, tickable = pl && viewDay <= todayISO();
        html += swRow(f, '<button type="button" class="row food-item' + (pl ? ' planned' : '') + (justAdded[f.id] && Date.now() - justAt < 4000 ? ' row-new' : '') + '" data-food="' + f.id + '">' + (tickable ? '<span class="pl-tick" data-eat="' + f.id + '" role="checkbox" aria-checked="false" aria-label="Mark ' + esc(f.name || 'food') + ' as eaten"></span>' : diaryIcon(f)) + '<div class="grow"><div class="row-t">' + esc(f.name || 'Quick add') + (f.pic ? '<span class="pic-ic" data-pic="' + f.id + '" aria-label="Photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg></span>' : '') + '</div><div class="row-s">' + (f.rep ? '<span class="rep-mk" title="Repeat item" aria-label="Repeat item">' + REP_IC + '</span>' : '') + [pl ? 'Planned' : '', mac].filter(Boolean).join(' · ') + '</div>' + (f.note ? '<div class="row-note">' + esc(f.note) + '</div>' : '') + '</div><span class="row-v num">' + fmtKcal(f.kcal) + '</span></button>');
      });
      if (card) html += (its.length ? '<button type="button" class="meal-add" data-add-meal="' + m[0] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>Add food</button>' : '') + '</div>';
      if (!its.length) html += sameRow(m[0]);
      html += '</div></section>';
    });
    swOpen = null;
    $('#mealList').innerHTML = forYou([ramadanBanner(), startBanner(), backupBanner(), gapBanner()]) + html + diaryHint();
    const fy = $('#fyTrack');
    if (fyObs) { fyObs.disconnect(); fyObs = null; }
    if (fy) fyObs = pager(fy, fyPage, function (pg) { fyPage = pg; $$('#fyDots i').forEach(function (d, k) { d.classList.toggle('on', k === pg); }); }, false);
    if (!foodDB && !warmT) warmT = setTimeout(function () { (window.requestIdleCallback || setTimeout)(function () { loadFoods().then(function () { if (state.ui.tab === 'diary' && (gapBanner() || drinksWater(viewDay))) renderDiary(); setTimeout(function () { didYouMean('qqqq'); }, 300); }, function () {}); }); }, 150);
  }

