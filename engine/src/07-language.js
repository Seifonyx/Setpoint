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