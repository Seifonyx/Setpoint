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

