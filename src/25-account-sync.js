  /* ================= Account + sync ================= */
  // Setpoint's own Firebase project. Data lives at users/{uid}/setpoint/state, which the rules limit to its owner.
  // (A Firebase web config is public by design; access is controlled by those rules.)
  const FB_CONFIG = {
    apiKey: 'AIzaSyAYXoxTt8Bhb2A-oCrQzpKO71GL1D892_o',
    // On our own site, sign-in pages are served from this domain (/__/auth/…) so iPhone home-screen apps can finish
    // Google sign-in; elsewhere (local testing) use the project's default domain.
    authDomain: location.hostname === 'setpoint-tracker.web.app' ? 'setpoint-tracker.web.app' : 'setpoint-tracker.firebaseapp.com',
    projectId: 'setpoint-tracker',
    storageBucket: 'setpoint-tracker.firebasestorage.app',
    messagingSenderId: '813690688684',
    appId: '1:813690688684:web:579ef69ad6c51f92093b09'
  };
  const USER_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4"/></svg>';
  let fb = null, fbP = null, auth = null, db = null, user = null;
  let syncBusy = false, syncError = false, pushTimer = null;

  // The SDK is only downloaded once someone signs in (or was signed in before).
  function loadFirebase() {
    if (!fbP) {
      fbP = import('./firebase.js').then(function (m) {
        fb = m;
        const app = m.initializeApp(FB_CONFIG);
        auth = m.initializeAuth(app, { persistence: [m.indexedDBLocalPersistence, m.browserLocalPersistence], popupRedirectResolver: m.browserPopupRedirectResolver });
        db = m.getFirestore(app);
        m.getRedirectResult(auth).then(function (r) { if (r && r.user) { buzz('success'); toast('Signed in · syncing'); } }, function (e) { if (e && e.code) toast(authError(e)); }).then(function () { try { localStorage.removeItem('setpoint-redirect'); } catch (e) {} });
        return new Promise(function (resolve) {
          let first = true;
          m.onAuthStateChanged(auth, function (u) { onUser(u); if (first) { first = false; resolve(m); } });
        });
      }).catch(function (e) { fbP = null; throw e; });
    }
    return fbP;
  }
  function cloudRef() { return fb.doc(db, 'users', user.uid, 'setpoint', 'state'); }

  function onUser(u) {
    if (u) {
      const fresh = state.sync.uid !== u.uid; // first time this account syncs on this device
      user = u;
      state.sync.uid = u.uid; state.sync.email = u.email || state.sync.email;
      quietSave = true; save(); quietSave = false;
      pull(fresh);
      photoSyncSoon(2500);
    } else {
      user = null;
      if (state.sync.uid) { state.sync = migrate({}).sync; quietSave = true; save(); quietSave = false; }
    }
    renderAccount(); refreshAccountSheet();
  }

  // Merge two saves: union of weigh-ins and phases (the newer save wins a clash);
  // settings, profile and the guest calculator come from the newer save.
  function mergeData(local, cloud, cloudNewer) {
    const a = cloudNewer ? local : cloud, b = cloudNewer ? cloud : local; // b wins
    const byDate = {}, ph = {};
    a.entries.concat(b.entries).forEach(function (e) { byDate[e.date] = e; });
    a.phases.concat(b.phases).forEach(function (p) { ph[p.date] = p; });
    const food = {};
    // Entry by entry: the most recently changed copy wins (wherever it is, so moving a food to another day sticks),
    // and an entry deleted on either phone stays deleted unless it was changed after that.
    const del = Object.assign({}, a.del || {}); Object.keys(b.del || {}).forEach(function (k) { if (!del[k] || b.del[k] > del[k]) del[k] = b.del[k]; });
    const pickd = {};
    [a.food || {}, b.food || {}].forEach(function (src, si) { Object.keys(src).forEach(function (dt) { src[dt].forEach(function (f) { const cur = pickd[f.id], u = f.u || 0, cu = cur ? cur.f.u || 0 : -1; if (!cur || u > cu || (u === cu && si === 1)) pickd[f.id] = { f: f, dt: dt }; }); }); });
    const placed = {};
    [b.food || {}, a.food || {}].forEach(function (src) { Object.keys(src).forEach(function (dt) { src[dt].forEach(function (f) { const x = pickd[f.id]; if (!x || placed[f.id] || x.dt !== dt) return; if (del[f.id] && del[f.id] >= (x.f.u || 0)) return; placed[f.id] = 1; (food[dt] = food[dt] || []).push(x.f); }); }); });
    Object.keys(pickd).forEach(function (id) { const x = pickd[id]; if (placed[id] || (del[id] && del[id] >= (x.f.u || 0))) return; placed[id] = 1; (food[x.dt] = food[x.dt] || []).push(x.f); });
    const ms = {}; (a.measures || []).concat(b.measures || []).forEach(function (m) { ms[m.date] = m; });
    const byId = function (k) { const o = {}; (a[k] || []).concat(b[k] || []).forEach(function (c) { o[c.id] = c; }); return Object.keys(o).map(function (id) { return o[id]; }); };
    const mf = {}; (a.myFoods || []).concat(b.myFoods || []).forEach(function (c) { mf[c.id] = c; });
    return { v: SCHEMA, del: del, entries: Object.keys(byDate).sort().map(function (k) { return byDate[k]; }), phases: Object.keys(ph).sort().map(function (k) { return ph[k]; }), food: food, measures: Object.keys(ms).sort().map(function (k) { return ms[k]; }), myFoods: Object.keys(mf).map(function (k) { return mf[k]; }), offFoods: byId('offFoods'), recipes: byId('recipes'), meals: byId('meals'), repeats: byId('repeats').filter(function (r) { return !(del['rp:' + r.id] && del['rp:' + r.id] >= (r.u || 0)); }), water: Object.assign({}, a.water || {}, b.water || {}), goals: Object.assign({}, a.goals || {}, b.goals || {}), portions: Object.assign({}, a.portions || {}, b.portions || {}), dayType: Object.assign({}, a.dayType || {}, b.dayType || {}), dayMode: Object.assign({}, a.dayMode || {}, b.dayMode || {}),
      fast: (function () { const fb2 = b.fast || a.fast || { goal: 16, start: null, log: [] }, lg = {}; ((a.fast || {}).log || []).concat((b.fast || {}).log || []).forEach(function (x) { lg[x.s] = x; }); return { goal: fb2.goal, start: fb2.start, log: Object.keys(lg).map(function (k) { return lg[k]; }).sort(function (x, y) { return y.s - x.s; }).slice(0, 100) }; })(), favs: (b.favs || []).concat((a.favs || []).filter(function (x) { return (b.favs || []).indexOf(x) < 0; })), settings: b.settings, profile: b.profile, guest: b.guest };
  }
  function applyData(d, updatedAt) {
    const inc = migrate(d);
    state.entries = inc.entries; state.phases = inc.phases; state.food = inc.food; state.measures = inc.measures; state.myFoods = inc.myFoods; state.favs = inc.favs; state.offFoods = inc.offFoods; state.recipes = inc.recipes; state.meals = inc.meals; state.repeats = inc.repeats; state.water = inc.water; state.portions = inc.portions; state.del = inc.del; state.goals = inc.goals; state.dayType = inc.dayType; state.dayMode = inc.dayMode; state.fast = inc.fast; state.settings = inc.settings; state.profile = inc.profile; state.guest = inc.guest;
    state.sync.updatedAt = updatedAt;
    applyRepeats();
    markMilestonesSeen();
    quietSave = true; save(); quietSave = false;
    applyAppearance(); renderAll();
  }
  function hasData(d) { return d.entries.length > 0 || d.phases.length > 0 || Object.keys(d.food).length > 0 || d.measures.length > 0 || d.myFoods.length > 0 || d.recipes.length > 0 || d.meals.length > 0 || !!d.profile.sex; }

  // The food log lives in monthly pieces under the main document (users/{uid}/setpoint/state/food/YYYY-MM), so it can
  // grow for years without reaching Firestore's 1 MB-per-document limit. Everything else stays in the main document.
  function foodCol() { return fb.collection(db, 'users', user.uid, 'setpoint', 'state', 'food'); }
  function monthDoc(ym) { return fb.doc(db, 'users', user.uid, 'setpoint', 'state', 'food', ym); }
  function monthsOf(food) { const m = {}; Object.keys(food).forEach(function (d) { const ym = d.slice(0, 7); (m[ym] = m[ym] || {})[d] = food[d]; }); return m; }
  function hashStr(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + '.' + str.length.toString(36); }
  function monthSigs(food) { const m = monthsOf(food), o = {}; Object.keys(m).forEach(function (k) { o[k] = hashStr(JSON.stringify(m[k])); }); return o; }
  // What each month looked like when this device last uploaded it. null = this device hasn't synced months yet.
  function sentMonths() { try { return JSON.parse(localStorage.getItem('setpoint-months-' + user.uid) || 'null'); } catch (e) { return null; } }
  function setSentMonths(m) { try { localStorage.setItem('setpoint-months-' + user.uid, JSON.stringify(m)); } catch (e) {} }
  // The whole cloud save: main document plus every food month, plus any food an older app version left in the main document.
  function readCloud() {
    return Promise.all([fb.getDoc(cloudRef()), fb.getDocs(foodCol())]).then(function (r) {
      const c = r[0].exists() ? r[0].data() : null;
      if (!c) return null;
      const data = JSON.parse(c.data || '{}'), food = {};
      r[1].forEach(function (d) { let part = {}; try { part = JSON.parse(d.data().data || '{}'); } catch (e) {} Object.keys(part).forEach(function (k) { food[k] = part[k]; }); });
      Object.keys(data.food || {}).forEach(function (dt) { const byId = {}; (food[dt] || []).concat(data.food[dt] || []).forEach(function (f) { if (f && f.id) byId[f.id] = f; }); food[dt] = Object.keys(byId).map(function (k) { return byId[k]; }); });
      data.food = food;
      return { at: c.updatedAt || 0, split: !!c.split, data: data };
    });
  }
  function syncDone() {
    state.sync.lastSync = Date.now(); state.sync.dirty = false;
    quietSave = true; save(); quietSave = false;
    renderAccount(); refreshAccountSheet();
  }
  function pull(fresh) {
    if (!user || !navigator.onLine) { renderAccount(); return Promise.resolve(); }
    if (!sentMonths()) fresh = true; // first sync of monthly food on this device: merge everything once
    syncBusy = true; syncError = false; renderAccount();
    return fb.getDoc(cloudRef()).then(function (snap) {
      if (!snap.exists()) { syncBusy = false; setSentMonths(sentMonths() || {}); return push(); }
      const cAt = snap.data().updatedAt || 0;
      if (!fresh && !state.sync.dirty && cAt <= state.sync.updatedAt) { syncBusy = false; syncDone(); return; }
      return readCloud().then(function (rc) {
        syncBusy = false;
        const cloud = migrate(rc.data), local = migrate(cloudData());
        const took = function () { setSentMonths(rc.split ? monthSigs(state.food) : {}); if (!rc.split) return push(); syncDone(); };
        if (fresh || state.sync.dirty) {
          if (!hasData(local)) { applyData(cloud, cAt); return took(); }
          if (!hasData(cloud)) { setSentMonths(sentMonths() || {}); return push(); }
          applyData(mergeData(local, cloud, cAt > state.sync.updatedAt), Date.now());
          setSentMonths(sentMonths() || {});
          return push();
        }
        applyData(cloud, cAt); return took();
      });
    }).catch(function () { syncBusy = false; syncError = true; renderAccount(); refreshAccountSheet(); });
  }
  function push() {
    if (!user || !navigator.onLine) { renderAccount(); return Promise.resolve(); }
    const sent = sentMonths();
    if (!sent) return pull(true); // never upload months before this device has merged with the cloud once
    syncBusy = true; syncError = false; renderAccount();
    const at = state.sync.updatedAt || Date.now(), data = cloudData(), months = monthsOf(data.food), sigs = monthSigs(data.food), main = Object.assign({}, data);
    delete main.food;
    const batch = fb.writeBatch(db);
    batch.set(cloudRef(), { app: 'Setpoint', v: SCHEMA, split: 2, updatedAt: at, data: JSON.stringify(main) });
    Object.keys(sigs).forEach(function (ym) { if (sent[ym] !== sigs[ym]) batch.set(monthDoc(ym), { updatedAt: at, data: JSON.stringify(months[ym]) }); });
    Object.keys(sent).forEach(function (ym) { if (!sigs[ym]) batch.set(monthDoc(ym), { updatedAt: at, data: '{}' }); }); // emptied months
    return batch.commit().then(function () {
      syncBusy = false;
      setSentMonths(sigs);
      state.sync.lastSync = Date.now();
      if (state.sync.updatedAt === at) state.sync.dirty = false; // nothing changed while uploading
      else schedulePush();
      quietSave = true; save(); quietSave = false;
      renderAccount(); refreshAccountSheet();
    }).catch(function () { syncBusy = false; syncError = true; renderAccount(); refreshAccountSheet(); });
  }
  function schedulePush() {
    if (!state.sync.uid) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { if (user) push(); else loadFirebase().then(function () { if (user) push(); }).catch(function () {}); }, 1200);
  }

  function authError(e) {
    const c = (e && e.code) || '';
    return {
      'auth/invalid-email': 'That email doesn\'t look right',
      'auth/missing-password': 'Enter your password',
      'auth/weak-password': 'Use at least 6 characters',
      'auth/email-already-in-use': 'This email already has an account. Sign in instead.',
      'auth/invalid-credential': 'Wrong email or password. If you\'ve used Google with this email, tap Continue with Google.',
      'auth/wrong-password': 'Wrong email or password. If you\'ve used Google with this email, tap Continue with Google.',
      'auth/user-not-found': 'No account with this email',
      'auth/too-many-requests': 'Too many tries. Wait a minute and try again.',
      'auth/network-request-failed': 'You\'re offline',
      'auth/popup-blocked': 'Your browser blocked the Google window',
      'auth/account-exists-with-different-credential': 'This email signs in a different way. Try email and password.'
    }[c] || 'Something went wrong. Try again.';
  }

  let accountSheetOpen = false, accountMode = null;
  // Redraw only when signing in or out; otherwise just refresh the status line.
  function refreshAccountSheet() {
    if (!accountSheetOpen || !sheet.classList.contains('open')) return;
    if ((state.sync.uid ? 'in' : 'out') !== accountMode) accountSheet(true);
    else { const el = $('#acStatus'); if (el) el.textContent = syncStatus(); }
  }
  // Email/password account whose address isn't verified yet.
  function needsVerify() {
    return !!(user && !user.emailVerified && (user.providerData || []).some(function (p) { return p && p.providerId === 'password'; }));
  }

  function accountSheet(refresh) {
    accountMode = state.sync.uid ? 'in' : 'out';
    const sy = state.sync, GOOGLE = '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 5.9 12 5.9z"/></svg>';
    let html;
    if (sy.uid) {
      html = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Account</h2></div>' +
        '<div class="stat-box" style="display:flex;align-items:center;gap:14px;margin-bottom:18px"><span class="ico" style="border-radius:50%;width:46px;height:46px"><b style="font-size:18px">' + esc((sy.email || '?').charAt(0).toUpperCase()) + '</b></span>' +
        '<div class="grow"><div class="row-t" style="overflow:hidden;text-overflow:ellipsis">' + esc(sy.email || 'Signed in') + '</div><div class="row-s" id="acStatus">' + esc(syncStatus()) + '</div></div></div>' +
        '<p class="sheet-text" style="margin:0 0 18px">Your weigh-ins and settings sync to this account. Sign in on another device to see them there.</p>' +
        (needsVerify() ? '<div class="stat-box" id="acVerifyBox" style="margin-bottom:18px"><p class="sheet-text" style="margin:0 0 10px">Verify your email to keep your password safe. Signing in with Google before you verify removes it.</p><button type="button" class="btn soft block" id="acVerify">Send verification email</button></div>' : '') +
        '<div class="btn-row"><button type="button" class="btn soft" id="acOut">Sign out</button><button type="button" class="btn primary" id="acSync">Sync now</button></div>' +
        '<button type="button" class="text-btn ac-del" id="acDel">Delete account and cloud data</button>';
    } else {
      html = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Sign in</h2></div>' +
        '<p class="sheet-text">Back up your data and sync it across devices. Your Study Planner account works here too.</p>' +
        '<button type="button" class="btn soft block" id="acGoogle" style="margin-bottom:16px;gap:10px">' + GOOGLE + 'Continue with Google</button>' +
        '<div class="field"><input class="input" id="acEmail" type="email" inputmode="email" autocomplete="email" placeholder="Email" aria-label="Email" /></div>' +
        '<div class="field"><input class="input" id="acPass" type="password" autocomplete="current-password" placeholder="Password" aria-label="Password" /></div>' +
        '<label class="consent"><input type="checkbox" id="acOk"' + (state.ui.consentAt ? ' checked' : '') + ' /><span>I\'m 18 or older (or have a parent\'s or guardian\'s permission). I agree to the <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>, and I consent to my health data (weight, food, body measurements and photos) being stored in my account on Google Firebase servers, which may be outside Egypt.</span></label>' +
        '<p class="form-error" id="acErr" hidden></p>' +
        '<button type="button" class="btn primary block" id="acIn">Sign in</button>' +
        '<div style="display:flex;justify-content:space-between;margin-top:14px"><button type="button" class="text-btn" id="acNew" style="margin:0">Create account</button><button type="button" class="text-btn" id="acForgot" style="margin:0">Forgot password?</button></div>';
    }
    const keep = refresh ? { e: $('#acEmail') && $('#acEmail').value, p: $('#acPass') && $('#acPass').value } : null;
    openSheet(html, function (root) {
      accountSheetOpen = true;
      if (sy.uid) {
        $('#acSync', root).addEventListener('click', function () { buzz('light'); loadFirebase().then(function () { return state.sync.dirty ? push() : pull(false); }).catch(function () { syncError = true; renderAccount(); }); });
        if ($('#acVerify', root)) $('#acVerify', root).addEventListener('click', function () {
          const b = this; b.disabled = true;
          loadFirebase().then(function () { return fb.sendEmailVerification(user); })
            .then(function () { b.textContent = 'Sent. Check your inbox'; buzz('success'); })
            .catch(function (e) { b.disabled = false; toast(e && e.code === 'auth/too-many-requests' ? 'Too many tries. Wait a bit.' : 'Couldn\'t send. Are you offline?'); });
        });
        $('#acDel', root).addEventListener('click', function () { buzz('light'); deleteAccount(); });
        $('#acOut', root).addEventListener('click', function () {
          loadFirebase().then(function () { return fb.signOut(auth); }).then(function () {
            state.sync = migrate({}).sync; quietSave = true; save(); quietSave = false;
            renderAccount(); closeSheet(); buzz('medium'); toast('Signed out. Your data stays on this device.');
          }).catch(function () { toast('Couldn\'t sign out. Are you offline?'); });
        });
        return;
      }
      const email = $('#acEmail', root), pass = $('#acPass', root);
      if (keep) { email.value = keep.e || ''; pass.value = keep.p || ''; }
      const err = function (m) { const el = $('#acErr', root); if (!el) return; el.textContent = m; el.hidden = !m; if (m) buzz('warn'); };
      // The sheet may already have redrawn as "signed in" by the time this runs, so check the button exists.
      const busy = function (b) { $$('button', root).forEach(function (x) { x.disabled = b; }); const btn = $('#acIn', root); if (btn) btn.textContent = b ? 'Please wait…' : 'Sign in'; };
      // Nothing is sent to the cloud until you agree (asked once; kept with your settings).
      const agreed = function () { if (!$('#acOk', root).checked) { err('Tick the box above to continue'); return false; } if (!state.ui.consentAt) { state.ui.consentAt = Date.now(); save(); } return true; };
      const run = function (fn) {
        if (!agreed()) return;
        err(''); busy(true);
        loadFirebase().then(fn).then(function () { busy(false); if (user) { closeSheet(); buzz('success'); toast('Signed in · syncing'); } })
          .catch(function (e) { busy(false); if (e && e.code === 'auth/popup-closed-by-user') return; err(e && e.code ? authError(e) : 'Couldn\'t reach the server. Are you offline?'); });
      };
      const creds = function () { const e = email.value.trim(), pw = pass.value; if (!e) { err('Enter your email'); return null; } if (!pw) { err('Enter your password'); return null; } return [e, pw]; };
      $('#acIn', root).addEventListener('click', function () { const c = creds(); if (c) run(function () { return fb.signInWithEmailAndPassword(auth, c[0], c[1]); }); });
      pass.addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#acIn', root).click(); });
      $('#acNew', root).addEventListener('click', function () {
        const c = creds(); if (!c) return;
        if (c[1].length < 6) return err('Use at least 6 characters');
        run(function () {
          return fb.createUserWithEmailAndPassword(auth, c[0], c[1]).then(function (cred) {
            // Verified emails keep their password if Google is used later; unverified ones lose it.
            fb.sendEmailVerification(cred.user).catch(function () {});
          });
        });
      });
      $('#acForgot', root).addEventListener('click', function () {
        const e = email.value.trim(); if (!e) return err('Enter your email first');
        err(''); loadFirebase().then(function () { return fb.sendPasswordResetEmail(auth, e); })
          .then(function () { toast('Reset link sent to ' + e); }).catch(function (x) { err(authError(x)); });
      });
      $('#acGoogle', root).addEventListener('click', function () {
        run(function () {
          const provider = new fb.GoogleAuthProvider();
          const redirect = function () { try { localStorage.setItem('setpoint-redirect', '1'); } catch (e) {} return fb.signInWithRedirect(auth, provider); };
          // Home-screen apps (iPhone especially) can't use pop-ups, so leave the page and come back instead.
          if (navigator.standalone || matchMedia('(display-mode: standalone)').matches) return redirect();
          return fb.signInWithPopup(auth, provider).catch(function (e) {
            if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return redirect();
            throw e;
          });
        });
      });
    }, function () { accountSheetOpen = false; });
  }

  // Delete the account and everything synced to it (the copy on this phone stays, so nothing is lost by accident).
  function deleteAccount() {
    confirmSheet('Delete your account?', 'This permanently deletes your account and everything synced to it: weigh-ins, food log, settings and progress photos. Your Study Planner account is the same account, so it will be deleted too. The data on this phone stays until you clear it in Settings. This can\'t be undone.', 'Delete account', true, function () {
      toast('Deleting your account…');
      loadFirebase().then(function () {
        const u = user; if (!u) throw { code: 'signed-out' };
        return fb.getDoc(phIdxRef()).then(function (snap) {
          const ids = Object.keys((snap.exists() && snap.data().items) || {}), refs = ids.map(phDocRef).concat([phIdxRef(), cloudRef()]);
          let chain = Promise.resolve();
          for (let i = 0; i < refs.length; i += 400) { const part = refs.slice(i, i + 400); chain = chain.then(function () { const bt = fb.writeBatch(db); part.forEach(function (r) { bt.delete(r); }); return bt.commit(); }); }
          return chain;
        }).then(function () { return u.delete(); });
      }).then(function () {
        state.sync = migrate({}).sync; state.ui.consentAt = null; quietSave = true; save(); quietSave = false;
        renderAccount(); buzz('medium'); toast('Account deleted. Your data on this phone is still here.');
      }).catch(function (e) {
        toast(e && e.code === 'auth/requires-recent-login' ? 'For safety, sign out and sign in again, then delete.' : 'Couldn\'t delete. Are you online?');
      });
    });
  }
  window.addEventListener('online', function () { renderAccount(); if (state.sync.uid) loadFirebase().then(function () { return state.sync.dirty ? push() : pull(false); }).catch(function () {}); });
  window.addEventListener('offline', renderAccount);

