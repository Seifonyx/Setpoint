  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayISO() { return isoOf(new Date()); }
  function parseISO(iso) { const p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  const dayNumMemo = {};
  function dayNum(iso) { let v = dayNumMemo[iso]; if (v === undefined) { const p = iso.split('-'); v = dayNumMemo[iso] = Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); } return v; }
  function isoFromDay(n) { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
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