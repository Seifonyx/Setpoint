  /* ================= Fasting ================= */
  function fmtAgo(ms) { const m = Math.floor(ms / 60000), h = Math.floor(m / 60); return h ? h + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : '') : Math.max(1, m) + 'm'; }
  function fmtDur(ms, secs) {
    const t = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
    return h + ':' + String(m).padStart(2, '0') + (secs ? ':' + String(s).padStart(2, '0') : '');
  }
  function fmtClock(ms) { return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  function localDay(ms) { const d = new Date(ms); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fmtWhen(ms) { return relDate(localDay(ms)) + ', ' + fmtClock(ms); }
  function toLocalInput(ms) { const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); }
  let fastTimer = null;
  // The last time you ate (from entry times, today or yesterday), as a timestamp.
  function lastMeal() {
    let best = null; const now = Date.now();
    [isoFromDay(dayNum(todayISO()) - 1), todayISO()].forEach(function (d) { foodFor(d).forEach(function (it) { if (!it.t || it.plan) return; const p = d.split('-'), h = it.t.split(':'); const ms = new Date(+p[0], +p[1] - 1, +p[2], +h[0], +h[1]).getTime(); if (ms <= now && (!best || ms > best)) best = ms; }); });
    return best && now - best < 24 * 3600000 ? best : null;
  }
  function fastSheet() {
    const draw = function (root) {
      const f = state.fast, now = Date.now(), goalMs = f.goal * 3600000;
      clearInterval(fastTimer);
      if (f.start) {
        const el = now - f.start, pct = Math.min(100, el / goalMs * 100), r = 54, c = 2 * Math.PI * r;
        root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + f.goal + '-hour fast</div><h2 class="sheet-title" id="sheetTitle">Fasting</h2></div></div>' +
          '<div class="fast-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="' + r + '" class="ring-bg"/><circle cx="60" cy="60" r="' + r + '" class="ring-fg' + (pct >= 100 ? ' done' : '') + '" id="fsArc" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pct / 100)).toFixed(1) + '"/></svg>' +
            '<div><span class="num" id="fsEl">' + fmtDur(el, true) + '</span><small id="fsLeft">' + (el >= goalMs ? 'Goal reached' : fmtDur(goalMs - el) + ' to go') + '</small></div></div>' +
          '<div class="stat-box sv-mac meal-tot"><div><b class="num">' + fmtClock(f.start) + '</b><span>started</span></div><div><b class="num">' + fmtClock(f.start + goalMs) + '</b><span>goal</span></div></div>' +
          '<div class="label faint" style="margin:4px 0 8px">Goal</div><div class="meal-chips" id="fsGoal">' + FAST_GOALS.map(function (g) { return '<button type="button" data-v="' + g + '" aria-pressed="' + (g === f.goal) + '">' + g + 'h</button>'; }).join('') + '</div>' +
          '<div class="field"><span>Started</span><input class="input" type="datetime-local" id="fsStart" value="' + toLocalInput(f.start) + '" max="' + toLocalInput(now) + '" aria-label="Fast started" /></div>' +
          '<button type="button" class="btn primary block" id="fsEnd">End fast</button>';
        const tick = function () {
          if (!root.isConnected || !state.fast.start) { clearInterval(fastTimer); return; }
          const e2 = Date.now() - state.fast.start, p2 = Math.min(100, e2 / goalMs * 100);
          $('#fsEl', root).textContent = fmtDur(e2, true);
          $('#fsLeft', root).textContent = e2 >= goalMs ? 'Goal reached' : fmtDur(goalMs - e2) + ' to go';
          const arc = $('#fsArc', root); arc.setAttribute('stroke-dashoffset', (c * (1 - p2 / 100)).toFixed(1)); arc.classList.toggle('done', p2 >= 100);
        };
        fastTimer = setInterval(tick, 1000);
        $$('#fsGoal button', root).forEach(function (b) { b.addEventListener('click', function () { state.fast.goal = +b.dataset.v; save(); renderDiary(); buzz('light'); draw(root); }); });
        $('#fsStart', root).addEventListener('change', function () {
          const t = new Date(this.value).getTime();
          if (!isFinite(t) || t > Date.now() || Date.now() - t > 7 * 864e5) { toast('Pick a time in the last 7 days'); this.value = toLocalInput(state.fast.start); return; }
          state.fast.start = t; save(); renderDiary(); draw(root);
        });
        $('#fsEnd', root).addEventListener('click', function () {
          const snap = snapshot(), s0 = state.fast.start, e = Date.now();
          state.fast.log = [{ s: s0, e: e, g: state.fast.goal }].concat(state.fast.log).slice(0, 100); state.fast.start = null;
          save(); renderDiary(); buzz(e - s0 >= goalMs ? 'success' : 'medium'); draw(root);
          toast((e - s0 >= goalMs ? 'Goal reached · ' : 'Fast ended · ') + fmtDur(e - s0), function () { restore(snap); if (root.isConnected) draw(root); });
        });
        return;
      }
      const log = f.log.slice(0, 5);
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">Not fasting</div><h2 class="sheet-title" id="sheetTitle">Fasting</h2></div></div>' +
        '<div class="label faint" style="margin:0 0 8px">Goal</div><div class="meal-chips" id="fsGoal">' + FAST_GOALS.map(function (g) { return '<button type="button" data-v="' + g + '" aria-pressed="' + (g === f.goal) + '">' + g + 'h</button>'; }).join('') + '</div>' +
        '<p class="muted-note" style="margin:-6px 0 14px">' + f.goal + ':' + (24 - f.goal > 0 ? 24 - f.goal : 0) + ' · you\'d finish at ' + fmtClock(now + f.goal * 3600000) + '</p>' +
        '<button type="button" class="btn primary block" id="fsGo">Start fast now</button>' +
        (lastMeal() ? '<button type="button" class="btn soft block" id="fsLast" style="margin-top:10px">Start from my last meal · ' + fmtClock(lastMeal()) + '</button>' : '') +
        '<label class="text-btn fs-earlier">Started earlier?<input type="datetime-local" id="fsEarlier" max="' + toLocalInput(now) + '" aria-label="Started earlier" /></label>' +
        (log.length ? '<div class="label faint fd-sec">Recent fasts</div><div class="list">' + log.map(function (x) {
          const done = x.e - x.s >= x.g * 3600000;
          return '<div class="row fd-row"><div class="grow"><div class="row-t">' + fmtDur(x.e - x.s) + ' h' + (done ? ' <span class="fs-ok">✓</span>' : '') + '</div><div class="row-s">' + esc(fmtWhen(x.s)) + ' · goal ' + x.g + 'h</div></div></div>';
        }).join('') + '</div>' : '') +
        '<p class="muted-note sv-src">Fasting isn\'t right for everyone. Check with a doctor if you\'re pregnant, diabetic or have a history of eating disorders.</p>';
      $$('#fsGoal button', root).forEach(function (b) { b.addEventListener('click', function () { state.fast.goal = +b.dataset.v; save(); buzz('light'); draw(root); }); });
      const start = function (t) { state.fast.start = t; save(); renderDiary(); buzz('success'); draw(root); };
      $('#fsGo', root).addEventListener('click', function () { start(Date.now()); });
      if ($('#fsLast', root)) $('#fsLast', root).addEventListener('click', function () { start(lastMeal()); });
      $('#fsEarlier', root).addEventListener('change', function () {
        const t = new Date(this.value).getTime();
        if (!isFinite(t) || t > Date.now() || Date.now() - t > 7 * 864e5) { toast('Pick a time in the last 7 days'); return; }
        start(t);
      });
    };
    openSheet('<div id="fsRoot"></div>', function (body) { draw($('#fsRoot', body)); }, function () { clearInterval(fastTimer); });
  }

