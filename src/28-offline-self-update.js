  /* ================= Offline + self-update ================= */
  let swReg = null, pendingReload = false;
  function maybeReload(force) {
    if (!pendingReload) return;
    if (force || !sheet.classList.contains('open') || document.visibilityState === 'hidden') { pendingReload = false; location.reload(); }
  }
  function checkUpdate() {
    if (!swReg) { toast(navigator.onLine ? 'You\'re up to date' : 'You\'re offline'); return; }
    toast('Checking…');
    swReg.update().then(function () { setTimeout(function () { if (!pendingReload) toast('Up to date · v' + APP_VERSION); }, 1200); })
      .catch(function () { toast('Couldn\'t check. Are you offline?'); });
  }
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (!hadController) return;
        pendingReload = true;
        setTimeout(maybeReload, 600);
      });
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        swReg = reg;
        setInterval(function () { if (reg) reg.update().catch(function () {}); }, 60 * 60 * 1000);
        // Also look for a new version whenever the app comes back to the screen.
        document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') reg.update().catch(function () {}); });
      }).catch(function () {});
    });
    setInterval(function () { maybeReload(); }, 5000);
  }

  // Pinch-to-zoom stays available (accessibility); only double-tap zoom is turned off, so quick taps don't zoom.
  document.addEventListener('dblclick', function (e) { e.preventDefault(); }, { passive: false });

