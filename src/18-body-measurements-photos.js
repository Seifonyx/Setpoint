  /* ================= Body: measurements + photos ================= */
  const MEAS = [['waist', 'Waist'], ['hips', 'Hips'], ['chest', 'Chest'], ['arm', 'Arm'], ['thigh', 'Thigh'], ['neck', 'Neck']];
  function lenUnit() { return unit() === 'lb' ? 'in' : 'cm'; }
  function toLen(cm) { return unit() === 'lb' ? cm / 2.54 : cm; }
  function fromLen(v) { return unit() === 'lb' ? v * 2.54 : v; }

  // A copy of everything once a day, kept on this phone for 7 days, so a bad import or sync can always be undone.
  function bkDb() { return new Promise(function (res, rej) { if (!window.indexedDB) return rej(new Error('no idb')); const r = indexedDB.open('setpoint-backups', 1); r.onupgradeneeded = function () { r.result.createObjectStore('snaps'); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function bkOp(mode, fn) { return bkDb().then(function (db) { return new Promise(function (res, rej) { const tx = db.transaction('snaps', mode), q = fn(tx.objectStore('snaps')); tx.oncomplete = function () { res(q && q.result); }; tx.onerror = function () { rej(tx.error); }; }); }); }
  function dailyBackup() {
    const day = todayISO();
    bkOp('readonly', function (st) { return st.getAllKeys(); }).then(function (keys) {
      keys = (keys || []).sort();
      if (keys.indexOf(day) >= 0 || !hasData(state)) return;
      flushSave();
      const snap = { at: Date.now(), data: JSON.stringify(state) };
      return bkOp('readwrite', function (st) { st.put(snap, day); keys.concat(day).sort().reverse().slice(7).forEach(function (k) { st.delete(k); }); });
    }).catch(function () {});
  }
  // Quiet milestones: only shown when you open them, never as pop-ups.
  function achievements() { return onePass(achievementsNow); }
  function achievementsNow() {
    const days = Object.keys(state.food).filter(function (k) { return state.food[k].some(function (it) { return !it.plan; }); }).sort();
    const has = {}; days.forEach(function (k) { has[dayNum(k)] = 1; });
    let best = 0, run = 0, prevMiss = false, used = {};
    if (days.length) for (let d = dayNum(days[0]); d <= dayNum(todayISO()); d++) {
      if (has[d]) { run++; prevMiss = false; if (run > best) best = run; }
      else { const w = weekStart(d); if (!prevMiss && !used[w] && run) { used[w] = 1; prevMiss = true; } else { run = 0; prevMiss = false; used = {}; } }
    }
    const nFoods = days.reduce(function (a, k) { return a + state.food[k].filter(function (it) { return !it.plan; }).length; }, 0);
    const inRow = function (test, back) { let r = 0, mx = 0; for (let i = back; i >= 1; i--) { const iso = isoFromDay(dayNum(todayISO()) - i); if (test(iso)) { r++; if (r > mx) mx = r; } else r = 0; } return mx; };
    // each day's food and plan, worked out once for both protein and calories (days with no food can't count)
    const hit = {}, dayHit = function (iso) { if (!hit[iso]) { const t = dayTotals(iso), pl = t.kcal > 0 ? dayPlan(iso) : null; hit[iso] = { p: !!pl && t.protein >= pl.protein, k: !!pl && t.kcal >= pl.target * 0.9 && t.kcal <= pl.target * 1.1 }; } return hit[iso]; };
    const protRow = inRow(function (iso) { return dayHit(iso).p; }, 180);
    const waterRow = inRow(function (iso) { return waterTotal(iso) >= waterGoal(); }, 180);
    const kcalRow = inRow(function (iso) { return dayHit(iso).k; }, 180);
    // How far from your first weigh-in to your goal you've come, on the trend.
    const goalPct = (function () { const g = state.settings.goalKg, l = state.entries, cur = currentKg(); if (!g || !l.length || cur == null) return null; const st = l[0].kg, span = st - g; return span ? (st - cur) / span * 100 : 100; })();
    let allMicros = false;
    if (foodDB) for (let i = 0; i < 120 && !allMicros; i++) { const iso = isoFromDay(dayNum(todayISO()) - i); if (!foodFor(iso).length || dayNeedsDB(iso)) continue; const nd = dayNutrients(iso); if (nd.items < 3) continue; const mm = microsMet(nd, nutTargets(iso)); if (mm && mm.of && mm.met >= mm.of) allMicros = true; }
    const es = state.entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    const avg = function (l) { return l.reduce(function (a, e) { return a + e.kg; }, 0) / l.length; };
    let change = 0; if (es.length >= 10) { const first = avg(es.slice(0, 5)); let lo = first, hi = first; for (let i = 5; i <= es.length; i++) { const v = avg(es.slice(i - 5, i)); lo = Math.min(lo, v); hi = Math.max(hi, v); } change = state.settings.goalKg && state.settings.goalKg > first ? hi - first : first - lo; }
    const gaining = state.settings.goalKg && es.length && state.settings.goalKg > es[0].kg;
    const kgs = function (k) { return unit() === 'lb' ? Math.round(k * 2.2046) + ' lb' : k + ' kg'; };
    return [
      { t: 'First food logged', got: nFoods > 0, p: '' },
      { t: '7-day streak', got: best >= 7, p: Math.min(best, 7) + '/7' }, { t: '30-day streak', got: best >= 30, p: Math.min(best, 30) + '/30' }, { t: '100-day streak', got: best >= 100, p: Math.min(best, 100) + '/100' },
      { t: '100 foods logged', got: nFoods >= 100, p: Math.min(nFoods, 100) + '/100' }, { t: '1,000 foods logged', got: nFoods >= 1000, p: Math.min(nFoods, 1000) + '/1000' },
      { t: 'Protein target 7 days in a row', got: protRow >= 7, p: Math.min(protRow, 7) + '/7' }, { t: 'Water goal 7 days in a row', got: waterRow >= 7, p: Math.min(waterRow, 7) + '/7' },
      { t: '30 weigh-ins', got: es.length >= 30, p: Math.min(es.length, 30) + '/30' },
      { t: (gaining ? 'First ' : 'First ') + kgs(1) + (gaining ? ' gained' : ' lost'), got: change >= 1, p: '' }, { t: kgs(5) + (gaining ? ' gained' : ' lost'), got: change >= 5, p: '' }, { t: kgs(10) + (gaining ? ' gained' : ' lost'), got: change >= 10, p: '' },
      { t: 'First recipe', got: state.recipes.length > 0, p: '' }, { t: 'First meal saved', got: state.meals.length > 0, p: '' },
      { t: 'First barcode scanned', got: state.offFoods.length > 0 || days.some(function (k) { return state.food[k].some(function (it) { return it.ref && /^(o|ub)/.test(it.ref); }); }), p: '' },
      { t: 'First progress photo', got: photos.length > 0, p: '' },
      { t: '5% of the way to your goal', got: goalPct >= 5, p: goalPct != null && goalPct < 5 ? Math.max(0, Math.round(goalPct)) + '%' : '' },
      { t: 'Halfway to your goal', got: goalPct >= 50, p: goalPct != null && goalPct < 50 ? Math.max(0, Math.round(goalPct)) + '%' : '' },
      { t: 'Goal reached', got: goalPct >= 100, p: goalPct != null && goalPct < 100 ? Math.max(0, Math.round(goalPct)) + '%' : '' },
      { t: 'Calories on target 7 days in a row', got: kcalRow >= 7, p: Math.min(kcalRow, 7) + '/7' },
      { t: 'Protein target 30 days in a row', got: protRow >= 30, p: Math.min(protRow, 30) + '/30' },
      { t: 'First refeed or diet break', got: Object.keys(state.dayMode || {}).some(function (k) { return k <= todayISO(); }), p: '' },
      { t: 'Every vitamin and mineral in one day', got: allMicros, p: '' }
    ];
  }
  // The top of You: who you are, your streak, target and weight, how far to your goal, and your latest achievements.
  function youSub() { return state.sync.uid ? syncStatus() : 'Sync across your devices'; }
  function renderYouHero() {
    const box = $('#youHero'); if (!box) return;
    const sy = state.sync, stk = foodStreak(), pl = dayPlan(todayISO()), cur = currentKg(), goal = state.settings.goalKg;
    const days = Object.keys(state.food).filter(function (k) { return state.food[k].some(function (it) { return !it.plan; }); }).length;
    let goalHtml = '';
    if (goal && cur != null && state.entries.length) {
      const start = state.entries[0].kg, span = start - goal, done = span ? Math.max(0, Math.min(1, (start - cur) / span)) : 1, left = Math.abs(cur - goal);
      goalHtml = '<div class="yh-goal"><div class="yh-gl"><span>' + (left < 0.15 ? 'Goal reached' : fmtW(left) + ' ' + unit() + ' to go') + '</span><span class="faint">' + fmtW(start) + ' → ' + fmtW(goal) + ' ' + unit() + '</span></div><div class="bar yh-bar"><i style="width:' + (done * 100).toFixed(1) + '%"></i></div></div>';
    }
    box.innerHTML = '<div class="card yh">' +
      '<div class="yh-top-w"><button type="button" class="yh-top" data-action="account"><span class="yh-av">' + (sy.uid ? esc((sy.email || '?').charAt(0).toUpperCase()) : USER_ICO) + '</span><span class="grow"><b>' + (sy.uid ? esc((sy.email || '').split('@')[0]) : 'Sign in') + '</b><span id="yhSub"' + (sy.uid ? '' : ' class="yh-cta"') + '>' + esc(youSub()) + '</span></span>' + (sy.uid ? '' : CHEV) + '</button>' +
      (sy.uid ? '<button type="button" class="icon-btn yh-sync" data-action="sync-now" aria-label="Sync now"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18.5 3v4.5H14M5.5 21v-4.5H10"/></svg></button>' : '') + '</div>' +
      '<div class="yh-stats"><div><b class="num">' + FLAME + stk + '</b><span>Day streak</span></div><div><b class="num">' + days + '</b><span>Days logged</span></div><div><b class="num">' + (cur != null ? fmtW(cur) : '–') + '<small>' + (cur != null ? unit() : '') + '</small></b><span>Weight trend</span></div></div>' +
      goalHtml + '</div>';
    showAchLine();
  }
  // The achievements line looks back over months, so it's worked out again once the page has slid in
  // (until then it shows what it said last time, which is almost always still right).
  let achLine = null, achT = 0;
  function achText() { const ach = achievements(), got = ach.filter(function (x) { return x.got; }); return got.length + ' of ' + ach.length + (got.length ? ' · ' + got[got.length - 1].t : ' · your first one is one food away'); }
  function putAchLine() { const s = $('#youAchSub'); if (s && s._en !== achLine) { s._en = achLine; s.textContent = achLine; } }
  function showAchLine() {
    if (!$('#youAchSub')) return;
    if (achLine == null) achLine = achText();
    putAchLine();
    clearTimeout(achT); achT = setTimeout(function () { achLine = achText(); putAchLine(); }, 650);
  }
  function achievementsSheet() {
    const list = achievements(), n = list.filter(function (x) { return x.got; }).length;
    openSheet('<div class="sheet-head"><div><div class="label faint">' + n + ' of ' + list.length + '</div><h2 class="sheet-title" id="sheetTitle">Achievements</h2></div></div>' +
      '<div class="ach-grid">' + list.map(function (x) { return '<div class="ach' + (x.got ? ' got' : '') + '"><span class="ach-ic">' + (x.got ? MEDAL_IC : LOCK_IC) + '</span><b>' + esc(x.t) + '</b>' + (!x.got && x.p ? '<small>' + x.p + '</small>' : '') + '</div>'; }).join('') + '</div>');
  }
  const PASTE_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3"/></svg>';
  const MEDAL_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 3h7l-2 6.5M10.5 9.5 8.5 3M12 12.2l.8 1.6 1.7.2-1.3 1.2.4 1.7-1.6-.9-1.6.9.4-1.7-1.3-1.2 1.7-.2z"/></svg>';
  const LOCK_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="10.5" width="13" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>';
  function backupsSheet() {
    const draw = function (root) {
      bkOp('readonly', function (st) { return st.getAll(); }).then(function (vals) {
        return bkOp('readonly', function (st) { return st.getAllKeys(); }).then(function (keys) { return keys.map(function (k, i) { return { day: k, v: vals[i] }; }); });
      }).then(function (list) {
        list.sort(function (a, b) { return a.day < b.day ? 1 : -1; });
        root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Restore a backup</h2></div>' +
          '<p class="muted-note" style="text-align:start;margin:0 2px 12px">Setpoint saves a copy of everything once a day and keeps the last 7, on this phone only.</p>' +
          (!list.length ? '<p class="muted-note fd-empty">No backups yet. The first one is made today.</p>' : '<div class="list">' + list.map(function (x, i) {
            let info = ''; try { const d = JSON.parse(x.v.data); info = Object.keys(d.food || {}).length + ' days of food · ' + (d.entries || []).length + ' weigh-ins'; } catch (e) {}
            return '<button type="button" class="row fd-row" data-bk="' + i + '"><div class="grow"><div class="row-t">' + esc(relDate(x.day)) + ' · ' + esc(fmtDate(x.day, { weekday: 'short', month: 'short', day: 'numeric' })) + '</div><div class="row-s">' + info + '</div></div>' + CHEV + '</button>';
          }).join('') + '</div>');
        $$('[data-bk]', root).forEach(function (b) { b.addEventListener('click', function () {
          const x = list[+b.dataset.bk];
          confirmSheet('Go back to ' + relDate(x.day).toLowerCase() + '?', 'Everything goes back to how it was then. Anything you added since will be removed (you can undo right after).', 'Restore', true, function () {
            const snap = snapshot(), sy = state.sync;
            try { state = migrate(JSON.parse(x.v.data)); } catch (e) { toast('That backup couldn\'t be read'); return; }
            state.sync = sy; save(); applyAppearance(); renderAll(); buzz('success'); toast('Backup restored', function () { restore(snap); });
          });
        }); });
      }, function () { root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Restore a backup</h2></div><p class="muted-note fd-empty">Backups aren\'t available in this browser.</p>'; });
    };
    openSheet('<div id="bkRoot"></div>', function (body) { draw($('#bkRoot', body)); });
  }
  // Photos of logged foods: on this phone only, keyed by the diary item's id.
  function picDb() { return new Promise(function (res, rej) { if (!window.indexedDB) return rej(new Error('no idb')); const r = indexedDB.open('setpoint-foodpics', 1); r.onupgradeneeded = function () { r.result.createObjectStore('pics'); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function picOp(mode, fn) { return picDb().then(function (db) { return new Promise(function (res, rej) { const tx = db.transaction('pics', mode), q = fn(tx.objectStore('pics')); tx.oncomplete = function () { res(q && q.result); }; tx.onerror = function () { rej(tx.error); }; }); }); }
  function picPut(id, blob) { return picOp('readwrite', function (st) { return st.put(blob, id); }); }
  function picGet(id) { return picOp('readonly', function (st) { return st.get(id); }); }
  function picDel(id) { return picOp('readwrite', function (st) { return st.delete(id); }).catch(function () {}); }
  function picView(id) {
    picGet(id).then(function (b) {
      if (!b) { toast('This photo isn\'t on this phone'); return; }
      const u = URL.createObjectURL(b), o = document.createElement('div');
      o.className = 'pic-view'; o.innerHTML = '<img alt="Food photo" src="' + u + '" />';
      o.addEventListener('click', function () { URL.revokeObjectURL(u); o.remove(); });
      document.body.appendChild(o);
    }, function () { toast('Couldn\'t open the photo'); });
  }
  // The note + photo block on a logged food's screen. Saves the photo straight away; the note is read on Save.
  function notePicHtml(it) {
    return '<div class="label faint fd-sec np-lbl">Note</div><div class="field"><input class="input" id="npNote" maxlength="140" placeholder="e.g. ate half, extra oil" autocomplete="off" value="' + esc(it.note || '') + '" /></div>' +
      '<div class="np-pic" id="npPic"></div><input type="file" id="npFile" accept="image/*" hidden />';
  }
  function bindNotePic(root, it) {
    const box = $('#npPic', root), file = $('#npFile', root);
    const draw = function () {
      if (!it.pic) { box.innerHTML = '<button type="button" class="text-btn np-add" id="npAdd">+ Add a photo</button>'; $('#npAdd', box).addEventListener('click', function () { file.click(); }); return; }
      box.innerHTML = '<button type="button" class="np-thumb" id="npOpen" aria-label="Open photo"></button><button type="button" class="text-btn" id="npRm">Remove photo</button>';
      picGet(it.id).then(function (b) { if (b && $('#npOpen', box)) $('#npOpen', box).style.backgroundImage = 'url(' + URL.createObjectURL(b) + ')'; }, function () {});
      $('#npOpen', box).addEventListener('click', function () { picView(it.id); });
      $('#npRm', box).addEventListener('click', function () { picDel(it.id); delete it.pic; save(); renderDiary(); buzz('light'); draw(); });
    };
    file.addEventListener('change', function () {
      const f = this.files && this.files[0]; this.value = ''; if (!f) return;
      shrink(f, 1200, 0.8).then(function (b) { return picPut(it.id, b); }).then(function () { it.pic = true; save(); renderDiary(); buzz('success'); draw(); }, function () { toast('Couldn\'t save the photo'); });
    });
    draw();
  }
  function readNote(root, it) { const v = $('#npNote', root) ? $('#npNote', root).value.trim().slice(0, 140) : null; if (v == null) return; if (v) it.note = v; else delete it.note; }
  // Photos live on this device, in IndexedDB. They're not synced, but the backup file includes them.
  let photos = [];
  function photoDb() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('no idb'));
      const r = indexedDB.open('setpoint-photos', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('photos', { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
  }
  function photoTx(mode, fn) {
    return photoDb().then(function (db) {
      return new Promise(function (res, rej) {
        const tx = db.transaction('photos', mode), store = tx.objectStore('photos'), out = fn(store);
        tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); }; tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function loadPhotos() {
    return photoTx('readonly', function (st) { return st.getAll(); }).then(function (list) {
      photos.forEach(function (ph) { URL.revokeObjectURL(ph.thumbUrl); });
      photos = (list || []).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : b.added - a.added; })
        .map(function (r) { return { id: r.id, date: r.date, added: r.added, pose: r.pose || null, thumbUrl: URL.createObjectURL(r.thumb) }; });
      renderBody();
    }).catch(function () {});
  }
  function shrink(file, max, quality) {
    return new Promise(function (res, rej) {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('encode')); }, 'image/jpeg', quality);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('image')); };
      img.src = url;
    });
  }
  // ----- Progress photos -----
  // Each photo has a date (from the photo itself when it has one) and a pose, so like is compared with like.
  const POSES = [['front', 'Front'], ['side', 'Side'], ['back', 'Back']];
  function poseName(p) { const x = POSES.find(function (q) { return q[0] === p; }); return x ? x[1] : ''; }
  function phWeight(d) { const t = trendAt(dayNum(d)); return t == null ? '' : fmtW(t) + ' ' + unit(); }
  let phPose = 'front', phDate = null;
  // The date a photo was taken, from its EXIF data (JPEG). Null when there isn't one.
  function exifDate(file) {
    return file.slice(0, 256 * 1024).arrayBuffer().then(function (buf) {
      const v = new DataView(buf); if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return null;
      let o = 2;
      while (o + 4 < v.byteLength) {
        const m = v.getUint16(o), len = v.getUint16(o + 2);
        if (m === 0xFFE1 && v.getUint32(o + 4) === 0x45786966) {
          const t = o + 10, le = v.getUint16(t) === 0x4949, u16 = function (p) { return v.getUint16(p, le); }, u32 = function (p) { return v.getUint32(p, le); };
          const ifd = function (start, want) {
            const n = u16(start); const out = {};
            for (let i = 0; i < n; i++) { const e = start + 2 + i * 12; if (e + 12 > v.byteLength) break; const tag = u16(e); if (want.indexOf(tag) >= 0) out[tag] = e; }
            return out;
          };
          const str = function (e) { const cnt = u32(e + 4), off = cnt > 4 ? t + u32(e + 8) : e + 8; let s = ''; for (let i = 0; i < cnt - 1 && off + i < v.byteLength; i++) s += String.fromCharCode(v.getUint8(off + i)); return s; };
          const i0 = t + u32(t + 4), a = ifd(i0, [0x8769, 0x0132]);
          let s = '';
          if (a[0x8769]) { const ex = ifd(t + u32(a[0x8769] + 8), [0x9003, 0x9004]); if (ex[0x9003]) s = str(ex[0x9003]); else if (ex[0x9004]) s = str(ex[0x9004]); }
          if (!s && a[0x0132]) s = str(a[0x0132]);
          const mm = /^(\d{4}):(\d{2}):(\d{2})/.exec(s);
          if (!mm) return null;
          const iso = mm[1] + '-' + mm[2] + '-' + mm[3];
          return ISO_RE.test(iso) && iso <= todayISO() && iso > '2000-01-01' ? iso : null;
        }
        if ((m & 0xFF00) !== 0xFF00) break;
        o += 2 + len;
      }
      return null;
    }).catch(function () { return null; });
  }
  $('#photoFile').addEventListener('change', function () {
    const fs = Array.prototype.slice.call(this.files || []); this.value = '';
    if (fs.length) savePhotos(fs, phPose, phDate);
  });
  // Save one or more photos (camera or gallery). Dates come from the photos when they have them.
  function savePhotos(files, pose, fallback) {
    toast(files.length > 1 ? 'Saving ' + files.length + ' photos…' : 'Saving photo…');
    let fromPhoto = 0, saved = 0;
    const one = function (f, i) {
      return (f.type === 'image/jpeg' || /\.jpe?g$/i.test(f.name || '') ? exifDate(f) : Promise.resolve(null)).then(function (ed) {
        if (ed) fromPhoto++;
        return Promise.all([shrink(f, 1600, 0.85), shrink(f, 360, 0.75)]).then(function (b) {
          const rec = { id: Math.random().toString(36).slice(2, 10), date: ed || fallback || todayISO(), added: Date.now() + i, pose: pose || null, full: b[0], thumb: b[1] };
          return photoTx('readwrite', function (st) { st.put(rec); }).then(function () { saved++; });
        });
      }).catch(function () {});
    };
    return files.slice(0, 20).reduce(function (p, f, i) { return p.then(function () { return one(f, i); }); }, Promise.resolve()).then(function () {
      if (!saved) { toast('Couldn\'t save that photo'); buzz('warn'); return; }
      buzz('success');
      toast((saved === 1 ? 'Photo saved' : saved + ' photos saved') + (fromPhoto ? ' · dated from the photo' + (fromPhoto > 1 ? 's' : '') : ''));
      photoSyncSoon();
      return loadPhotos();
    });
  }
  // Add photos: pick the pose (and date), then take one with a guide or choose from the gallery.
  function addPhotoFlow() {
    let d = todayISO();
    const CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.5"/></svg>';
    const LIB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8.5"/></svg>';
    const cam = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Add progress photos</h2>' +
      '<label class="date-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg><span id="paDateLbl"></span><input type="date" id="paDate" aria-label="Date" /></label></div>' +
      '<div class="label faint pa-l">Pose</div><div class="seg w3" id="paPose">' + POSES.map(function (p) { return '<button type="button" data-v="' + p[0] + '" aria-pressed="' + (p[0] === phPose) + '">' + p[1] + '</button>'; }).join('') + '</div>' +
      '<div class="pa-btns">' +
        (cam ? '<button type="button" class="pa-big" id="paCam"><span class="pa-ic">' + CAM + '</span><span class="grow"><b>Take photo</b><span id="paCamS"></span></span></button>' : '') +
        '<button type="button" class="pa-big" id="paLib"><span class="pa-ic">' + LIB + '</span><span class="grow"><b>Choose from gallery</b><span>Pick one or several. Each keeps the date it was taken.</span></span></button>' +
      '</div>' +
      '<p class="muted-note pa-tip">Same spot, same light and the same time of day make changes easiest to see.</p>',
      function (root) {
        const di = $('#paDate', root);
        const fill = function () {
          di.value = d; di.max = todayISO(); $('#paDateLbl', root).textContent = relDate(d);
          const has = photos.some(function (x) { return x.pose === phPose; });
          if ($('#paCamS', root)) $('#paCamS', root).textContent = has ? 'Your last ' + poseName(phPose).toLowerCase() + ' photo is faded on top so you can line up.' : 'With a camera guide; next time your last photo helps you line up.';
          $$('#paPose button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === phPose); });
        };
        fill();
        di.addEventListener('change', function () { if (di.value && di.value <= todayISO()) d = di.value; fill(); });
        $$('#paPose button', root).forEach(function (b) { b.addEventListener('click', function () { phPose = b.dataset.v; buzz('light'); fill(); }); });
        if ($('#paCam', root)) $('#paCam', root).addEventListener('click', function () { guideCamera(phPose, d); });
        $('#paLib', root).addEventListener('click', function () { phDate = d === todayISO() ? null : d; closeSheet(); $('#photoFile').click(); });
      });
  }
  // Take a progress photo with your last one of that pose faded on top, so the pose and distance match.
  function guideCamera(pose, date) {
    let stream = null, facing = 'user', ghost = null, timer = 0;
    const stop = function () { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; clearInterval(timer); };
    const ref = photos.find(function (x) { return x.pose === pose; }) || null;
    openSheet('<div class="sheet-head"><div><div class="label faint">' + poseName(pose) + (date !== todayISO() ? ' · ' + esc(relDate(date)) : '') + '</div><h2 class="sheet-title" id="sheetTitle">Line it up</h2></div></div>' +
      '<div class="gc-box" id="gcBox"><video id="gcV" playsinline muted autoplay></video><img id="gcG" alt="" /><span class="gc-grid"></span><span class="gc-count" id="gcCount" hidden></span></div>' +
      (ref ? '<div class="gc-ctl"><span class="label faint">Guide</span><input type="range" id="gcOp" min="0" max="80" value="35" aria-label="Guide strength" /></div>' : '') +
      '<div class="btn-row gc-row"><button type="button" class="btn soft" id="gcFlip">Flip</button><button type="button" class="btn soft" id="gcTimer" aria-pressed="false">Timer off</button><button type="button" class="btn primary" id="gcShot">Take photo</button></div>',
      function (root) {
        sheet.classList.add('tall');
        const v = $('#gcV', root), g = $('#gcG', root);
        if (ref) photoTx('readonly', function (st) { return st.get(ref.id); }).then(function (r) { if (r) { ghost = URL.createObjectURL(r.full); g.src = ghost; } });
        else g.hidden = true;
        if ($('#gcOp', root)) $('#gcOp', root).addEventListener('input', function () { g.style.opacity = this.value / 100; });
        const start = function () {
          stop();
          navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1600 } }, audio: false }).then(function (st) { stream = st; v.srcObject = st; v.play().catch(function () {}); $('#gcBox', root).classList.toggle('mirror', facing === 'user'); }, function () { toast('Camera not available. Choose from the gallery instead.'); closeSheet(); });
        };
        start();
        let delay = 0;
        $('#gcFlip', root).addEventListener('click', function () { facing = facing === 'user' ? 'environment' : 'user'; buzz('light'); start(); });
        $('#gcTimer', root).addEventListener('click', function () { delay = delay === 0 ? 3 : delay === 3 ? 10 : 0; this.textContent = delay ? delay + 's timer' : 'Timer off'; this.setAttribute('aria-pressed', !!delay); buzz('light'); });
        const shoot = function () {
          if (!v.videoWidth) return;
          const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
          const ctx = c.getContext('2d'); if (facing === 'user') { ctx.translate(c.width, 0); ctx.scale(-1, 1); } ctx.drawImage(v, 0, 0);
          c.toBlob(function (b) { if (!b) return; stop(); closeSheet(); savePhotos([b], pose, date); }, 'image/jpeg', 0.9);
        };
        $('#gcShot', root).addEventListener('click', function () {
          if (!delay) { shoot(); return; }
          let n = delay; const cd = $('#gcCount', root); cd.hidden = false; cd.textContent = n; clearInterval(timer);
          timer = setInterval(function () { n--; if (n <= 0) { clearInterval(timer); cd.hidden = true; buzz('medium'); shoot(); } else { cd.textContent = n; buzz('light'); } }, 1000);
        });
      }, function () { stop(); sheet.classList.remove('tall'); if (ghost) URL.revokeObjectURL(ghost); });
  }
  // The photos part of the Body card.
  function photoBlock() {
    const add = '<button type="button" class="ph" data-action="add-photo"><span class="ph-add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg></span>Add</button>';
    const strip = '<div class="photo-strip">' + add + photos.slice(0, 14).map(function (ph) { return '<button type="button" class="ph" data-photo="' + ph.id + '"><span class="ph-im"><img src="' + ph.thumbUrl + '" alt="Progress photo ' + esc(ph.date) + '" />' + (ph.pose ? '<i>' + poseName(ph.pose) + '</i>' : '') + '</span>' + esc(fmtDate(ph.date)) + '</button>'; }).join('') + '</div>';
    const since = photos.length ? dayNum(todayISO()) - dayNum(photos[0].date) : null;
    return '<div class="card-head ph-head"><span class="label">Photos</span>' + (photos.length ? '<button type="button" class="text-btn" data-action="photo-all">See all ' + photos.length + ' ›</button>' : '') + '</div>' + strip +
      '<p class="ph-sync' + (phUser() ? ' on' : '') + '"><span id="phSyncL">' + phSyncText() + '</span>' + (phUser() ? '' : ' · sign in to keep them safe in your account') + '</p>' +
      (since != null && since >= 7 ? '<p class="ph-nudge">Last photo ' + since + ' days ago. <button type="button" class="text-btn" data-action="add-photo">Take one</button></p>' : '') +
      (photos.length >= 2 ? '<div class="ph-acts"><button type="button" class="btn sm tint" data-action="photo-compare">Compare</button><button type="button" class="btn sm tint" data-action="photo-play">Timelapse</button></div>' : '');
  }
  // All photos: by pose, grouped by month.
  function photoGallery() {
    let pf = 'all';
    const draw = function (root) {
      const poses = POSES.filter(function (p) { return photos.some(function (x) { return x.pose === p[0]; }); });
      const list = photos.filter(function (x) { return pf === 'all' || x.pose === pf; });
      let html = '<div class="sheet-head"><div><div class="label faint">' + photos.length + (photos.length === 1 ? ' photo' : ' photos') + ' · ' + phSyncText().toLowerCase() + '</div><h2 class="sheet-title" id="sheetTitle">Progress photos</h2></div><button type="button" class="text-btn" id="pgAdd" style="margin:0">+ Add</button></div>';
      if (poses.length) html += '<div class="mt-chips pg-chips"><button type="button" data-pf="all" aria-pressed="' + (pf === 'all') + '">All</button>' + poses.map(function (p) { return '<button type="button" data-pf="' + p[0] + '" aria-pressed="' + (pf === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>';
      let month = '';
      list.forEach(function (ph) {
        const m = fmtDate(ph.date, { month: 'long', year: 'numeric' });
        if (m !== month) { html += (month ? '</div>' : '') + '<div class="pg-month">' + esc(m) + '</div><div class="pg-grid">'; month = m; }
        const w = phWeight(ph.date);
        html += '<button type="button" class="pg-t" data-pv="' + ph.id + '"><img src="' + ph.thumbUrl + '" alt="" /><span><b>' + esc(fmtDate(ph.date, { month: 'short', day: 'numeric' })) + '</b>' + (w ? w : '') + '</span></button>';
      });
      if (month) html += '</div>';
      if (photos.length >= 2) html += '<div class="btn-row" style="margin-top:16px"><button type="button" class="btn soft" id="pgCmp">Compare</button><button type="button" class="btn soft" id="pgPlay">Timelapse</button></div>';
      root.innerHTML = html;
      $$('[data-pf]', root).forEach(function (b) { b.addEventListener('click', function () { pf = b.dataset.pf; buzz('light'); draw(root); }); });
      $$('[data-pv]', root).forEach(function (b) { b.addEventListener('click', function () { photoViewer(b.dataset.pv, list.map(function (x) { return x.id; })); }); });
      $('#pgAdd', root).addEventListener('click', addPhotoFlow);
      if ($('#pgCmp', root)) $('#pgCmp', root).addEventListener('click', function () { photoCompare(null, null, pf === 'all' ? null : pf); });
      if ($('#pgPlay', root)) $('#pgPlay', root).addEventListener('click', function () { photoTimelapse(pf === 'all' ? null : pf); });
    };
    openSheet('<div id="pgRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#pgRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
  // One photo, full size. Swipe (or the arrows) for the next one; edit its date or pose, share it, compare or delete it.
  function photoViewer(id, ids) {
    ids = ids || photos.map(function (x) { return x.id; });
    let cur = id, url = null, editing = false;
    const draw = function (root) {
      const ph = photos.find(function (x) { return x.id === cur; }); if (!ph) { closeSheet(); return; }
      const i = ids.indexOf(cur), same = photos.filter(function (x) { return ph.pose ? x.pose === ph.pose : true; }), first = same[same.length - 1];
      const day = dayNum(ph.date) - dayNum(first.date), w = trendAt(dayNum(ph.date)), w0 = trendAt(dayNum(first.date));
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + (ph.pose ? poseName(ph.pose) + ' · ' : '') + (cur === first.id ? 'First photo' : 'Day ' + (day + 1)) + '</div><h2 class="sheet-title" id="sheetTitle">' + esc(fmtDate(ph.date, { month: 'long', day: 'numeric', year: 'numeric' })) + '</h2></div><span class="label faint">' + (i + 1) + ' / ' + ids.length + '</span></div>' +
        '<div class="pv-box" id="pvBox"><div class="photo-full pv-ph"></div>' + (i > 0 ? '<button type="button" class="pv-nav prev" id="pvPrev" aria-label="Newer">‹</button>' : '') + (i < ids.length - 1 ? '<button type="button" class="pv-nav next" id="pvNext" aria-label="Older">›</button>' : '') + '</div>' +
        '<div class="pv-info">' + (w != null ? '<span><b class="num">' + fmtW(w) + '</b> ' + unit() + ' trend</span>' : '') + (w != null && w0 != null && day > 0 ? '<span><b class="num">' + fmtDelta(w - w0) + '</b> ' + unit() + ' since the first' + (ph.pose ? ' ' + poseName(ph.pose).toLowerCase() : '') + ' photo</span>' : '') + '</div>' +
        (editing ? '<div class="pv-edit"><div class="seg w4" id="pvPose"><button type="button" data-v="" aria-pressed="' + !ph.pose + '">None</button>' + POSES.map(function (p) { return '<button type="button" data-v="' + p[0] + '" aria-pressed="' + (ph.pose === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>' +
          '<label class="field"><span>Date</span><input class="input" type="date" id="pvDate" value="' + ph.date + '" max="' + todayISO() + '" /></label><button type="button" class="btn primary block" id="pvSave">Save</button></div>' :
          '<div class="pv-acts">' + (photos.length >= 2 ? '<button type="button" class="pv-a" id="pvCmp">Compare</button>' : '') + '<button type="button" class="pv-a" id="pvEdit">Edit</button><button type="button" class="pv-a" id="pvShare">Share</button><button type="button" class="pv-a danger" id="pvDel">Delete</button></div>');
      photoTx('readonly', function (st) { return st.get(cur); }).then(function (r) { if (!r || !root.isConnected) return; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(r.full); const box = $('.pv-ph', root); if (box) box.outerHTML = '<img class="photo-full pv-ph" src="' + url + '" alt="Progress photo" />'; });
      const go = function (k) { const j = ids.indexOf(cur) + k; if (j < 0 || j >= ids.length) return; cur = ids[j]; editing = false; buzz('light'); draw(root); };
      if ($('#pvPrev', root)) $('#pvPrev', root).addEventListener('click', function () { go(-1); });
      if ($('#pvNext', root)) $('#pvNext', root).addEventListener('click', function () { go(1); });
      const bx = $('#pvBox', root); let sx = null;
      bx.addEventListener('pointerdown', function (e) { sx = e.clientX; });
      bx.addEventListener('pointerup', function (e) { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
      if (editing) {
        let np = ph.pose || '';
        $$('#pvPose button', root).forEach(function (b) { b.addEventListener('click', function () { np = b.dataset.v; $$('#pvPose button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); buzz('light'); }); });
        $('#pvSave', root).addEventListener('click', function () {
          const nd = $('#pvDate', root).value;
          photoTx('readonly', function (st) { return st.get(cur); }).then(function (r) {
            if (!r) return; r.pose = np || null; if (nd && ISO_RE.test(nd) && nd <= todayISO()) r.date = nd; r.u = Date.now(); photoSyncSoon();
            return photoTx('readwrite', function (st) { st.put(r); });
          }).then(function () { editing = false; buzz('success'); toast('Photo updated'); return loadPhotos(); }).then(function () { if (root.isConnected) draw(root); });
        });
        return;
      }
      $('#pvEdit', root).addEventListener('click', function () { editing = true; buzz('light'); draw(root); });
      if ($('#pvCmp', root)) $('#pvCmp', root).addEventListener('click', function () { const other = first.id !== cur ? first.id : same[0].id !== cur ? same[0].id : null; photoCompare(other, other ? cur : null, ph.pose || null); });
      $('#pvShare', root).addEventListener('click', function () {
        photoTx('readonly', function (st) { return st.get(cur); }).then(function (r) { if (r) shareBlob(r.full, 'progress-' + ph.date + '.jpg'); });
      });
      $('#pvDel', root).addEventListener('click', function () {
        photoTx('readonly', function (st) { return st.get(cur); }).then(function (r) {
          if (!r) return;
          const j = ids.indexOf(cur); ids.splice(j, 1);
          phDelAdd(r.id); photoSyncSoon(2500);
          return photoTx('readwrite', function (st) { st.delete(r.id); }).then(function () {
            buzz('medium'); toast('Photo deleted', function () { phDelRemove(r.id); photoTx('readwrite', function (st) { st.put(Object.assign({}, r, { synced: false, syncUid: null, u: Date.now() })); }).then(function () { photoSyncSoon(); return loadPhotos(); }); });
            return loadPhotos();
          }).then(function () { if (!ids.length) { closeSheet(); return; } cur = ids[Math.min(j, ids.length - 1)]; if (root.isConnected) draw(root); });
        });
      });
    };
    openSheet('<div id="pvRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#pvRoot', body)); }, function () { sheet.classList.remove('tall'); if (url) URL.revokeObjectURL(url); });
  }
  function shareBlob(blob, name) {
    const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file] }).catch(function () {});
    else { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 2000); toast('Image saved'); }
  }
  // The measurement nearest a date (within 10 days), for the compare screen.
  function measNear(d, key) {
    let best = null, gap = 11; state.measures.forEach(function (m) { if (m[key] == null) return; const g = Math.abs(dayNum(m.date) - dayNum(d)); if (g < gap) { gap = g; best = m[key]; } });
    return best;
  }
  // Before and after: two photos of the same pose side by side, with a slider, or faded over each other. Save it as one image.
  function photoCompare(aId, bId, pose) {
    if (photos.length < 2) return;
    let pf = pose || (bId && (photos.find(function (x) { return x.id === bId; }) || {}).pose) || null;
    const pool = function () { return photos.filter(function (x) { return !pf || x.pose === pf; }); };
    if (!pf) { const cnt = {}; photos.forEach(function (x) { if (x.pose) cnt[x.pose] = (cnt[x.pose] || 0) + 1; }); const best = Object.keys(cnt).sort(function (p, q) { return cnt[q] - cnt[p]; })[0]; if (best && cnt[best] >= 2 && !aId) pf = best; }
    let a = aId, b = bId, mode = 'side', cut = 50, fade = 50; const urls = {};
    const pick = function () { const l = pool(); if (l.length < 2) { pf = null; return pick(); } if (!l.some(function (x) { return x.id === a; })) a = l[l.length - 1].id; if (!l.some(function (x) { return x.id === b; }) || b === a) b = l[0].id === a ? l[1].id : l[0].id; };
    const get = function (pid) { return urls[pid] ? Promise.resolve(urls[pid]) : photoTx('readonly', function (st) { return st.get(pid); }).then(function (r) { urls[pid] = r ? URL.createObjectURL(r.full) : ''; return urls[pid]; }); };
    const draw = function (root) {
      pick();
      if (photos.find(function (x) { return x.id === a; }).date > photos.find(function (x) { return x.id === b; }).date) { const t = a; a = b; b = t; }
      const pa = photos.find(function (x) { return x.id === a; }), pb = photos.find(function (x) { return x.id === b; }), wa = trendAt(dayNum(pa.date)), wb = trendAt(dayNum(pb.date));
      const poses = POSES.filter(function (p) { return photos.filter(function (x) { return x.pose === p[0]; }).length >= 2; });
      const strip = function (side, cur) { return '<div class="pc-strip">' + pool().slice().reverse().map(function (ph) { return '<button type="button" class="pc-th' + (ph.id === cur ? ' on' : '') + '" data-pc="' + side + '" data-id="' + ph.id + '"><img src="' + ph.thumbUrl + '" alt="' + esc(fmtDate(ph.date)) + '" /></button>'; }).join('') + '</div>'; };
      const stats = [];
      const days = dayNum(pb.date) - dayNum(pa.date); stats.push('<span><b class="num">' + days + '</b> days</span>');
      if (wa != null && wb != null) stats.push('<span><b class="num">' + fmtDelta(wb - wa) + '</b> ' + unit() + '</span>');
      MEAS.forEach(function (m) { if (stats.length >= 4) return; const x = measNear(pa.date, m[0]), y = measNear(pb.date, m[0]); if (x != null && y != null && Math.abs(y - x) >= 0.1) stats.push('<span><b class="num">' + signed(toLen(y - x), 1) + '</b> ' + lenUnit() + ' ' + m[1].toLowerCase() + '</span>'); });
      const lbl = function (ph, w) { return '<b>' + esc(fmtDate(ph.date, { month: 'short', day: 'numeric', year: 'numeric' })) + '</b><span>' + (w != null ? fmtW(w) + ' ' + unit() : '') + '</span>'; };
      root.innerHTML = '<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Before and after</h2></div><button type="button" class="text-btn" id="pcSave" style="margin:0">Save image</button></div>' +
        (poses.length ? '<div class="mt-chips pg-chips"><button type="button" data-pcp="" aria-pressed="' + !pf + '">All</button>' + poses.map(function (p) { return '<button type="button" data-pcp="' + p[0] + '" aria-pressed="' + (pf === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>' : '') +
        '<div class="seg w3 pc-modes" id="pcMode"><button type="button" data-v="side" aria-pressed="' + (mode === 'side') + '">Side by side</button><button type="button" data-v="wipe" aria-pressed="' + (mode === 'wipe') + '">Slider</button><button type="button" data-v="fade" aria-pressed="' + (mode === 'fade') + '">Fade</button></div>' +
        (mode === 'side' ? '<div class="pc-pair"><div><div class="pc-img" id="pcA"></div>' + lbl(pa, wa) + '</div><div><div class="pc-img" id="pcB"></div>' + lbl(pb, wb) + '</div></div>' :
          '<div class="pc-over" id="pcOver"></div>' + (mode === 'fade' ? '<input type="range" id="pcFade" min="0" max="100" value="' + fade + '" aria-label="Before to after" class="pc-fade" />' : '<p class="muted-note pc-hint">Drag across the photo</p>') +
          '<div class="pc-fl"><span>' + esc(fmtDate(pa.date)) + (wa != null ? ' · ' + fmtW(wa) + ' ' + unit() : '') + '</span><span>' + esc(fmtDate(pb.date)) + (wb != null ? ' · ' + fmtW(wb) + ' ' + unit() : '') + '</span></div>') +
        '<div class="pc-stats">' + stats.join('') + '</div>' +
        '<div class="label faint fd-sec">Before</div>' + strip('a', a) + '<div class="label faint fd-sec">After</div>' + strip('b', b);
      $$('[data-pcp]', root).forEach(function (t) { t.addEventListener('click', function () { pf = t.dataset.pcp || null; buzz('light'); draw(root); }); });
      $$('#pcMode button', root).forEach(function (t) { t.addEventListener('click', function () { mode = t.dataset.v; buzz('light'); draw(root); }); });
      if (mode === 'side') {
        get(a).then(function (u) { const el = $('#pcA', root); if (el && u) el.innerHTML = '<img src="' + u + '" alt="Before" />'; });
        get(b).then(function (u) { const el = $('#pcB', root); if (el && u) el.innerHTML = '<img src="' + u + '" alt="After" />'; });
      } else Promise.all([get(a), get(b)]).then(function (u) {
        const el = $('#pcOver', root); if (!el) return;
        el.innerHTML = '<img src="' + u[0] + '" alt="Before" /><img src="' + u[1] + '" alt="After" id="pcTop" />' + (mode === 'wipe' ? '<span class="pc-cut" id="pcCut"><i></i></span>' : '');
        const top = $('#pcTop', el);
        if (mode === 'fade') { top.style.opacity = fade / 100; $('#pcFade', root).addEventListener('input', function () { fade = +this.value; top.style.opacity = fade / 100; }); return; }
        const set = function () { top.style.clipPath = 'inset(0 0 0 ' + cut + '%)'; $('#pcCut', el).style.left = cut + '%'; };
        set();
        let dragging = false;
        const mv = function (e) { const r = el.getBoundingClientRect(); cut = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); set(); };
        el.addEventListener('pointerdown', function (e) { dragging = true; try { el.setPointerCapture(e.pointerId); } catch (x) {} mv(e); });
        el.addEventListener('pointermove', function (e) { if (dragging) mv(e); });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { el.addEventListener(t, function () { dragging = false; }); });
      });
      $$('[data-pc]', root).forEach(function (t) { t.addEventListener('click', function () { if (t.dataset.pc === 'a') a = t.dataset.id; else b = t.dataset.id; buzz('light'); draw(root); }); });
      $('#pcSave', root).addEventListener('click', function () {
        Promise.all([get(a), get(b)]).then(function (u) {
          return Promise.all(u.map(function (s) { return new Promise(function (ok, no) { const im = new Image(); im.onload = function () { ok(im); }; im.onerror = no; im.src = s; }); }));
        }).then(function (ims) {
          const W = 1200, H = 1000, ph = 880, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
          x.fillStyle = '#111318'; x.fillRect(0, 0, W, H);
          ims.forEach(function (im, k) { const s = Math.max(600 / im.width, ph / im.height), w = im.width * s, h = im.height * s; x.save(); x.beginPath(); x.rect(k * 600, 0, 600, ph); x.clip(); x.drawImage(im, k * 600 + (600 - w) / 2, (ph - h) / 2, w, h); x.restore(); });
          x.fillStyle = '#fff'; x.font = '600 34px system-ui, sans-serif'; x.textAlign = 'center';
          [[pa, wa], [pb, wb]].forEach(function (p, k) { x.fillText(fmtDate(p[0].date, { month: 'short', day: 'numeric', year: 'numeric' }) + (p[1] != null ? '  ·  ' + fmtW(p[1]) + ' ' + unit() : ''), k * 600 + 300, ph + 72); });
          x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(599, 0, 2, ph);
          c.toBlob(function (bl) { if (bl) shareBlob(bl, 'progress-' + pa.date + '-to-' + pb.date + '.jpg'); }, 'image/jpeg', 0.9);
        }).catch(function () { toast('Couldn\'t make the image'); });
      });
    };
    openSheet('<div id="pcRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#pcRoot', body)); }, function () { sheet.classList.remove('tall'); Object.keys(urls).forEach(function (k) { if (urls[k]) URL.revokeObjectURL(urls[k]); }); });
  }
  // Timelapse: your photos of one pose played in order, oldest first, with the date and weight.
  function photoTimelapse(pose) {
    let pf = pose || null;
    if (!pf) { const cnt = {}; photos.forEach(function (x) { if (x.pose) cnt[x.pose] = (cnt[x.pose] || 0) + 1; }); const best = Object.keys(cnt).sort(function (p, q) { return cnt[q] - cnt[p]; })[0]; if (best && cnt[best] >= 2) pf = best; }
    let i = 0, playing = true, speed = 700, timer = 0; const urls = {};
    const get = function (pid) { return urls[pid] ? Promise.resolve(urls[pid]) : photoTx('readonly', function (st) { return st.get(pid); }).then(function (r) { urls[pid] = r ? URL.createObjectURL(r.full) : ''; return urls[pid]; }); };
    const draw = function (root) {
      const list = photos.filter(function (x) { return !pf || x.pose === pf; }).slice().reverse();
      const poses = POSES.filter(function (p) { return photos.filter(function (x) { return x.pose === p[0]; }).length >= 2; });
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + list.length + ' photos' + (pf ? ' · ' + poseName(pf) : '') + '</div><h2 class="sheet-title" id="sheetTitle">Timelapse</h2></div></div>' +
        (poses.length ? '<div class="mt-chips pg-chips"><button type="button" data-tp="" aria-pressed="' + !pf + '">All</button>' + poses.map(function (p) { return '<button type="button" data-tp="' + p[0] + '" aria-pressed="' + (pf === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>' : '') +
        '<div class="tl-box" id="tlBox"><img id="tlA" alt="" /><img id="tlB" alt="" /><div class="tl-cap" id="tlCap"></div></div>' +
        '<input type="range" class="pc-fade" id="tlPos" min="0" max="' + Math.max(0, list.length - 1) + '" value="' + i + '" aria-label="Photo" />' +
        '<div class="btn-row"><button type="button" class="btn soft" id="tlSpeed">' + (speed === 700 ? 'Normal' : speed > 700 ? 'Slow' : 'Fast') + '</button><button type="button" class="btn primary" id="tlPlay">' + (playing ? 'Pause' : 'Play') + '</button></div>';
      const A = $('#tlA', root), B = $('#tlB', root); let front = A;
      const show = function (k) {
        i = k; const ph = list[i]; if (!ph) return;
        $('#tlPos', root).value = i;
        const w = trendAt(dayNum(ph.date));
        $('#tlCap', root).innerHTML = '<b>' + esc(fmtDate(ph.date, { month: 'short', day: 'numeric', year: 'numeric' })) + '</b>' + (w != null ? '<span>' + fmtW(w) + ' ' + unit() + '</span>' : '');
        get(ph.id).then(function (u) { if (!root.isConnected) return; const back = front === A ? B : A; back.src = u; back.onload = function () { back.classList.add('on'); front.classList.remove('on'); front = back; }; });
        if (list[i + 1]) get(list[i + 1].id);
      };
      const loop = function () { clearInterval(timer); if (!playing || list.length < 2) return; timer = setInterval(function () { show(i >= list.length - 1 ? 0 : i + 1); }, speed); };
      show(Math.min(i, list.length - 1)); loop();
      $$('[data-tp]', root).forEach(function (t) { t.addEventListener('click', function () { pf = t.dataset.tp || null; i = 0; buzz('light'); draw(root); }); });
      $('#tlPos', root).addEventListener('input', function () { playing = false; clearInterval(timer); $('#tlPlay', root).textContent = 'Play'; show(+this.value); });
      $('#tlPlay', root).addEventListener('click', function () { playing = !playing; this.textContent = playing ? 'Pause' : 'Play'; buzz('light'); loop(); });
      $('#tlSpeed', root).addEventListener('click', function () { speed = speed === 700 ? 1300 : speed === 1300 ? 350 : 700; this.textContent = speed === 700 ? 'Normal' : speed > 700 ? 'Slow' : 'Fast'; buzz('light'); loop(); });
    };
    openSheet('<div id="tlRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#tlRoot', body)); }, function () { clearInterval(timer); sheet.classList.remove('tall'); Object.keys(urls).forEach(function (k) { if (urls[k]) URL.revokeObjectURL(urls[k]); }); });
  }

  // US Navy body fat estimate from waist, neck (and hips for women) and height, all in cm.
  function navyFat() {
    const p = state.profile, ms = state.measures; if (!p.heightCm || (p.sex !== 'male' && p.sex !== 'female') || !ms.length) return null;
    const pickLast = function (k) { for (let i = ms.length - 1; i >= 0; i--) if (ms[i][k] != null) return ms[i][k]; return null; };
    const w = pickLast('waist'), n = pickLast('neck'), h = pickLast('hips'); if (!w || !n) return null;
    let bf;
    if (p.sex === 'male') { if (w - n <= 0) return null; bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(p.heightCm)) - 450; }
    else { if (!h || w + h - n <= 0) return null; bf = 495 / (1.29579 - 0.35004 * Math.log10(w + h - n) + 0.22100 * Math.log10(p.heightCm)) - 450; }
    return bf >= 3 && bf <= 60 ? Math.round(bf * 10) / 10 : null;
  }
  let measKey = 'waist';
  function measTrend() {
    const ms = state.measures; if (ms.length < 2) return '';
    const keys = MEAS.filter(function (m) { return ms.filter(function (x) { return x[m[0]] != null; }).length >= 2; });
    if (!keys.length) return ''; if (!keys.some(function (m) { return m[0] === measKey; })) measKey = keys[0][0];
    const pts = ms.filter(function (x) { return x[measKey] != null; }).map(function (x) { return { d: dayNum(x.date), v: toLen(x[measKey]) }; });
    const W = 320, H = 110, d0 = pts[0].d, d1 = pts[pts.length - 1].d || d0 + 1, lo = Math.min.apply(null, pts.map(function (x) { return x.v; })), hi = Math.max.apply(null, pts.map(function (x) { return x.v; })), pad = Math.max(0.5, (hi - lo) * 0.2);
    const X = function (d) { return d1 === d0 ? W / 2 : (d - d0) / (d1 - d0) * (W - 16) + 8; }, Y = function (v) { return H - 10 - (v - lo + pad) / (hi - lo + pad * 2) * (H - 20); };
    const path = pts.map(function (x, i) { return (i ? 'L' : 'M') + X(x.d).toFixed(1) + ' ' + Y(x.v).toFixed(1); }).join(' ');
    const ch = pts[pts.length - 1].v - pts[0].v;
    return '<div class="divider-line"></div><div class="card-head" style="margin-bottom:8px"><span class="label">Trend</span><span class="label faint">' + (ch > 0 ? '+' : '') + ch.toFixed(1) + ' ' + lenUnit() + ' since ' + esc(fmtDate(isoFromDay(d0), { month: 'short', day: 'numeric' })) + '</span></div>' +
      '<div class="mt-chips">' + keys.map(function (m) { return '<button type="button" data-mt="' + m[0] + '" aria-pressed="' + (m[0] === measKey) + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      '<svg class="mt-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><path d="' + path + '" class="mt-line"/>' + pts.map(function (x) { return '<circle cx="' + X(x.d).toFixed(1) + '" cy="' + Y(x.v).toFixed(1) + '" r="3.5" class="mt-dot"/>'; }).join('') + '</svg>';
  }
  function bfLine() {
    const bf = navyFat(), p = state.profile;
    if (bf == null) return state.measures.length ? '<p class="muted-note bf-line">Add waist, neck' + (p.sex === 'female' ? ' and hips' : '') + ' to estimate your body fat.</p>' : '';
    const using = p.bodyFat && Math.abs(p.bodyFat - bf) < 0.6;
    return '<div class="bf-line"><div class="grow"><b class="num">' + bf + '%</b> <span>estimated body fat</span><small>US Navy method, from your measurements</small></div>' + (using ? '<span class="pill">In use</span>' : '<button type="button" class="btn sm tint" data-action="use-bf" data-bf="' + bf + '">Use for targets</button>') + '</div>';
  }
  function renderBody() {
    const box = $('#bodyBox');
    if (!box) return;
    const ms = state.measures, last = ms[ms.length - 1], first = ms[0];
    let meas;
    if (!last) meas = '<p class="muted-note" style="padding:0;margin:0 0 4px">Waist, hips and more show progress the scale can miss.</p>';
    else {
      meas = '<button type="button" class="meas-grid" data-action="measure" style="width:100%;border:0;background:none;padding:0;color:inherit;font:inherit">' + MEAS.filter(function (m) { return last[m[0]] != null; }).map(function (m) {
        let f = null; for (let i = 0; i < ms.length && f == null; i++) f = ms[i][m[0]];
        const d = f != null && ms.length > 1 ? toLen(last[m[0]] - f) : null;
        return '<div><b>' + toLen(last[m[0]]).toFixed(1) + '</b><span>' + m[1] + '</span>' + (d != null && Math.abs(d) >= 0.05 ? '<em>' + signed(d, 1) + '</em>' : '<em>&nbsp;</em>') + '</div>';
      }).join('') + '</button>' +
      '<div class="t-sub" style="margin-top:12px;text-align:center">' + lenUnit() + ' · ' + esc(fmtDate(last.date, { month: 'short', day: 'numeric' })) + (ms.length > 1 && first !== last ? ' · change since ' + esc(fmtDate(first.date, { month: 'short', day: 'numeric' })) : '') + '</div>';
    }
    box.innerHTML = '<div class="section-head"><h2>Body</h2><button type="button" class="btn sm tint" data-action="measure">' + (last ? 'Update' : 'Add') + '</button></div>' +
      '<div class="card">' + meas + bfLine() + measTrend() + '<div class="divider-line"></div>' +
      photoBlock() + '</div>';
  }

  function measureSheet() {
    let d = todayISO();
    const last = state.measures[state.measures.length - 1];
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Measurements</h2>' +
        '<label class="date-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg><span id="msDateLbl"></span><input type="date" id="msDate" aria-label="Date" /></label></div>' +
      '<div class="two">' + MEAS.map(function (m) { return '<label class="field"><span>' + m[1] + '</span><div class="sfx"><input class="input" id="ms_' + m[0] + '" inputmode="decimal" maxlength="5" autocomplete="off" /><em>' + lenUnit() + '</em></div></label>'; }).join('') + '</div>' +
      '<p class="t-sub" style="margin:-4px 2px 16px">Measure at the same spot each time, relaxed, first thing in the morning.</p>' +
      '<p class="form-error" id="msErr" hidden></p>' +
      '<div class="btn-row"><button type="button" class="btn danger icon-only" id="msDel" aria-label="Delete" hidden>' + TRASH + '</button><button type="button" class="btn primary" id="msSave">Save</button></div>',
      function (root) {
        const dateIn = $('#msDate', root);
        const fill = function () {
          const row = state.measures.find(function (m) { return m.date === d; });
          dateIn.value = d; dateIn.max = todayISO(); $('#msDateLbl', root).textContent = relDate(d);
          MEAS.forEach(function (m) {
            const el = $('#ms_' + m[0], root);
            el.value = row && row[m[0]] != null ? toLen(row[m[0]]).toFixed(1) : '';
            el.placeholder = last && last[m[0]] != null ? toLen(last[m[0]]).toFixed(1) : '';
          });
          $('#msDel', root).hidden = !row;
        };
        fill();
        dateIn.addEventListener('change', function () { if (dateIn.value && dateIn.value <= todayISO()) d = dateIn.value; fill(); });
        $('#msSave', root).addEventListener('click', function () {
          const row = { date: d }; let any = false, bad = false;
          MEAS.forEach(function (m) {
            const raw = $('#ms_' + m[0], root).value.trim();
            if (!raw) { row[m[0]] = null; return; }
            const cm = fromLen(parseNum(raw));
            if (isNaN(cm) || cm < 10 || cm > 300) bad = true; else { row[m[0]] = Math.round(cm * 10) / 10; any = true; }
          });
          const e = $('#msErr', root);
          if (bad) { e.textContent = 'One of those doesn\'t look right'; e.hidden = false; buzz('warn'); return; }
          if (!any) { e.textContent = 'Add at least one measurement'; e.hidden = false; buzz('warn'); return; }
          const snap = snapshot();
          state.measures = state.measures.filter(function (m) { return m.date !== d; }).concat([row]).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
          save(); renderAll(); closeSheet(); buzz('success');
          toast('Measurements saved', function () { restore(snap); });
        });
        $('#msDel', root).addEventListener('click', function () {
          const snap = snapshot();
          state.measures = state.measures.filter(function (m) { return m.date !== d; });
          save(); renderAll(); closeSheet(); toast('Deleted', function () { restore(snap); });
        });
      });
  }

  // ----- Progress photos in your account -----
  // When you're signed in, each photo is also kept in your account (users/{uid}/setpoint/state/photos/{id}, private to
  // you), with a small index listing them all. Photos are copied both ways, edits (date, pose) follow the newest change,
  // and a photo deleted on one phone is deleted on the others.
  let phSync = { busy: false, again: false, state: '', timer: 0 };
  function phDelList() { try { return JSON.parse(localStorage.getItem('setpoint-phdel') || '[]'); } catch (e) { return []; } }
  function phDelSet(l) { try { localStorage.setItem('setpoint-phdel', JSON.stringify(l.slice(-500))); } catch (e) {} }
  function phDelAdd(id) { const l = phDelList(); if (l.indexOf(id) < 0) l.push(id); phDelSet(l); }
  function phDelRemove(id) { phDelSet(phDelList().filter(function (x) { return x !== id; })); }
  function photoSyncSoon(ms) { clearTimeout(phSync.timer); phSync.timer = setTimeout(photoSync, ms == null ? 1200 : ms); }
  function phIdxRef() { return fb.doc(db, 'users', user.uid, 'setpoint', 'state', 'photomap', 'index'); }
  function phDocRef(id) { return fb.doc(db, 'users', user.uid, 'setpoint', 'state', 'photos', id); }
  // A copy small enough for one database record (well under 1 MB).
  function phCloudImg(blob) {
    const tries = [[1280, 0.8], [1080, 0.72], [900, 0.65]];
    const go = function (i) { return shrink(blob, tries[i][0], tries[i][1]).then(blobToUrl).then(function (u) { return u && u.length > 900000 && i < tries.length - 1 ? go(i + 1) : u; }); };
    return go(0);
  }
  function phMeta(r) { return { u: r.u || r.added || 0, date: r.date, pose: r.pose || null, added: r.added || 0 }; }
  function photoSync() {
    if (!phUser() || !fb || !db) return Promise.resolve();
    if (phSync.busy) { phSync.again = true; return Promise.resolve(); }
    phSync.busy = true; phSync.state = 'syncing'; phSyncLabel();
    const uid = user.uid, dels = phDelList();
    let idx = {}, changed = false, touched = false;
    const done = [];
    return Promise.all([fb.getDoc(phIdxRef()), photoTx('readonly', function (st) { return st.getAll(); })]).then(function (res) {
      const remote = (res[0].exists() && res[0].data().items) || {}, local = {};
      idx = Object.assign({}, remote);
      (res[1] || []).forEach(function (r) { local[r.id] = r; });
      const jobs = [];
      // Deleted here: delete in the account too.
      dels.forEach(function (id) {
        if (local[id]) return; // brought back with Undo
        done.push(id);
        if (!idx[id]) return;
        delete idx[id]; changed = true;
        jobs.push(function () { const b = fb.writeBatch(db); b.delete(phDocRef(id)); return b.commit(); });
      });
      Object.keys(local).forEach(function (id) {
        const r = local[id], rm = remote[id], lu = r.u || r.added || 0;
        if (!rm) {
          if (r.syncUid === uid) { touched = true; jobs.push(function () { return photoTx('readwrite', function (st) { st.delete(id); }); }); } // deleted on another phone
          else jobs.push(function () {
            return Promise.all([phCloudImg(r.full), blobToUrl(r.thumb)]).then(function (u) {
              if (!u[0]) throw new Error('encode');
              const m = phMeta(r);
              return fb.setDoc(phDocRef(id), Object.assign({ id: id, img: u[0], thumb: u[1] || '' }, m)).then(function () { idx[id] = m; changed = true; r.synced = true; r.syncUid = uid; r.u = m.u; return photoTx('readwrite', function (st) { st.put(r); }); });
            });
          });
        } else if (lu > rm.u) {
          jobs.push(function () { const m = phMeta(r); return fb.setDoc(phDocRef(id), m, { merge: true }).then(function () { idx[id] = m; changed = true; if (r.syncUid !== uid) { r.syncUid = uid; r.synced = true; return photoTx('readwrite', function (st) { st.put(r); }); } }); });
        } else if (rm.u > lu || r.syncUid !== uid) {
          touched = true; r.date = rm.date || r.date; r.pose = rm.pose || null; r.u = rm.u; r.synced = true; r.syncUid = uid;
          jobs.push(function () { return photoTx('readwrite', function (st) { st.put(r); }); });
        }
      });
      // In the account but not here: download.
      Object.keys(remote).forEach(function (id) {
        if (local[id] || dels.indexOf(id) >= 0) return;
        jobs.push(function () {
          return fb.getDoc(phDocRef(id)).then(function (snap) {
            if (!snap.exists()) { delete idx[id]; changed = true; return; }
            const d = snap.data(), m = remote[id];
            return Promise.all([urlToBlob(d.img), d.thumb ? urlToBlob(d.thumb) : null]).then(function (b) {
              const full = b[0]; return (b[1] ? Promise.resolve(b[1]) : shrink(full, 360, 0.75)).then(function (th) {
                touched = true;
                return photoTx('readwrite', function (st) { st.put({ id: id, date: m.date || d.date, added: m.added || d.added || Date.now(), pose: m.pose || null, u: m.u, full: full, thumb: th, synced: true, syncUid: uid }); });
              });
            });
          });
        });
      });
      return jobs.reduce(function (p, j) { return p.then(j); }, Promise.resolve());
    }).then(function () {
      return changed ? fb.setDoc(phIdxRef(), { items: idx, at: Date.now() }) : null;
    }).then(function () {
      phDelSet(phDelList().filter(function (x) { return done.indexOf(x) < 0; }));
      phSync.state = 'ok';
      return changed || touched ? loadPhotos() : null;
    }).catch(function () { phSync.state = 'error'; }).then(function () {
      phSync.busy = false; phSyncLabel();
      if (phSync.again) { phSync.again = false; photoSyncSoon(500); }
    });
  }
  function phUser() { try { return user; } catch (e) { return null; } } // safe before the account code has started
  function phSyncText() {
    if (!phUser()) return 'Only on this device';
    return phSync.state === 'syncing' ? 'Syncing…' : phSync.state === 'error' ? 'Couldn\'t sync, will retry' : 'Synced to your account';
  }
  function phSyncLabel() { const el = $('#phSyncL'); if (el) el.textContent = phSyncText(); }
  function photoSheet(id) { photoViewer(id); }


