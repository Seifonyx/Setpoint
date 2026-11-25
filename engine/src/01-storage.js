  const SCHEMA = 3;
  const LB = 2.2046226218;
  const DEFAULT_SETTINGS = { unit: 'kg', theme: 'auto', style: 'graphite', tabs: 'bottom', haptics: true, goalKg: null, trackCalories: true };
  const TABS = ['diary', 'progress', 'you', 'targets', 'settings', 'foods'];
  const DEFAULT_MEALS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snacks', 'Snacks']];
  const THEMES = [
    ['graphite', 'Graphite', ['#f2f2f7', '#ffffff', '#1c1c1e', '#111114'], ['#000000', '#111113', '#f2f2f5', '#f2f2f5']],
    ['classic', 'Emerald', ['#f2f5f3', '#ffffff', '#0f9a6c', '#0f1714'], ['#0a0f0d', '#121a17', '#5fdcab', '#ecf3ef']],
    ['ocean', 'Ocean', ['#eef4f9', '#ffffff', '#1f6fe5', '#0c1824'], ['#070d16', '#0f1824', '#6aa8ff', '#e8f0f9']],
    ['rose', 'Rose', ['#f8f1f2', '#fffbfb', '#c2416b', '#24121a'], ['#120a0d', '#1c1216', '#ff8db0', '#f6eaee']],
    ['violet', 'Midnight', ['#f2f1f8', '#ffffff', '#6c4cf1', '#13111f'], ['#08070f', '#12101d', '#a594ff', '#ece9fb']],
    ['sand', 'Terracotta', ['#f6f1ea', '#fffdf9', '#c4602f', '#231a12'], ['#0f0c09', '#1a1511', '#f0955f', '#f4ece2']],
    ['luxe', 'Luxe', ['#f4efe6', '#fffcf6', '#0f5c45', '#1d1913'], ['#0a0b0a', '#141614', '#dcb86e', '#f2ece0']]
  ];
  const THEME_KEYS = THEMES.map(function (t) { return t[0]; });
  const MEAL_KEY = /^(breakfast|lunch|dinner|snacks|g[a-z0-9]{2,10})$/;
  const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
  const FAST_GOALS = [12, 14, 16, 18, 20, 24];
  const REF_RE = /^[ucor][\w-]{1,23}$/;
  function pick(v, allowed, fallback) { return allowed.indexOf(v) >= 0 ? v : fallback; }
  function numIn(v, lo, hi) { const n = Number(v); return (v !== null && v !== '' && v !== undefined && isFinite(n) && n >= lo && n <= hi) ? n : null; }
  function crNameStr(s) { const ell = /…$/.test(s), parts = s.replace(/…$/, '').split(', '), c = {}, order = []; parts.forEach(function (n) { const m = / ×(\d+)$/.exec(n), k = n.replace(/ ×\d+$/, ''); if (!c[k]) { c[k] = 0; order.push(k); } c[k] += m ? +m[1] : 1; }); return order.map(function (n) { return n + (c[n] > 1 ? ' ×' + c[n] : ''); }).join(', ') + (ell ? '…' : ''); }