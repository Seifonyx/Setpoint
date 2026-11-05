  /* ================= Toast ================= */
  let toastTimer = null, toastFn = null;
  // Undo is offered only when something was lost or replaced: deletes, clears, imports, restores, a replaced
  // weigh-in, an ended fast, removed categories. Everyday actions (adding, saving, ticking, moving) just confirm.
  const UNDO_KEEP = /^(Repeat items paused|Repeat items resumed|Ramadan mode off|Repeating |Repeat saved|Stopped repeating|Photo deleted|Hidden for today|Food saved · updated|Saved to My foods · updated|Recipe saved · updated|Amount changed|Merged|Fixed|Removed|Deleted|Meal deleted|Recipe deleted|Food deleted|Erased|Phase removed|Goal removed|Backup restored|Imported|Updated \d|Fast ended|Goal reached|Saved\. Food from removed|Back to the saved recipe)|cleared$/;
  function toast(msg, fn, label) {
    if (fn && !label && !UNDO_KEEP.test(msg)) fn = null;
    $('#toastMsg').textContent = msg;
    toastFn = fn || null;
    $('#toastBtn').hidden = !fn;
    $('#toastBtn').textContent = label || 'Undo';
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, fn ? 6000 : 2600);
  }
  function hideToast() { clearTimeout(toastTimer); $('#toast').classList.remove('show'); toastFn = null; }
  $('#toastBtn').addEventListener('click', function () {
    const fn = toastFn, isUndo = this.textContent === 'Undo';
    hideToast();
    if (fn) { fn(); buzz('medium'); if (isUndo) setTimeout(function () { toast('Undone'); }, 150); }
  });

  // The banner can be flicked up out of the way, like an iPhone notification.
  (function () {
    const t = $('#toast'); let y0 = null, dy = 0;
    t.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; t.classList.add('drag'); try { t.setPointerCapture(e.pointerId); } catch (x) {} });
    t.addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.min(0, e.clientY - y0); t.style.transform = 'translate(-50%,' + (dy - (dy < 0 ? 0 : 0)) + 'px)'; });
    const end = function () { if (y0 == null) return; y0 = null; t.classList.remove('drag'); t.style.transform = ''; if (dy < -18) hideToast(); };
    t.addEventListener('pointerup', end); t.addEventListener('pointercancel', end);
  })();
