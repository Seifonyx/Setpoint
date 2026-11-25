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
  function hasData(d) { return d.entries.length > 0 || d.phases.length > 0 || Object.keys(d.food).length > 0 || d.measures.length > 0 || d.myFoods.length > 0 || d.recipes.length > 0 || d.meals.length > 0 || !!d.profile.sex; }