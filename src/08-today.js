  /* ================= Today ================= */
  function renderToday() {
    const list = entries();

    // This week: average, change vs last week, days logged
    $('#weekCard').innerHTML = weekCardHtml();

    // Goal
    const t = trend(), g = state.settings.goalKg, now = currentKg();
    const gb = $('#goalBox');
    if (!g) gb.innerHTML = list.length ? '<button type="button" class="card tile goal-tile" data-action="goal"><span class="pt-k">Goal</span><span class="pt-v pt-none">Set one</span><span class="pt-s">See when you\'ll get there</span></button>' : '';
    else if (now == null) gb.innerHTML = '';
    else {
      const start = t && t.first ? t.first.kg : list[0].kg;
      const reached = start >= g ? now <= g : now >= g;
      const total = Math.abs(start - g);
      const pct = reached ? 100 : total > 0 ? Math.max(0, Math.min(100, (1 - Math.abs(now - g) / total) * 100)) : 0;
      let eta = '';
      if (!reached && t && Math.abs(toDisp(t.perWeek)) >= 0.02 && ((now - g) > 0) === (t.perDay < 0)) {
        const days = Math.abs((now - g) / t.perDay);
        if (days < 730) { const d = new Date(); d.setDate(d.getDate() + Math.round(days)); eta = fmtFuture(d) + ' at your current trend'; }
      }
      gb.innerHTML = '<button type="button" class="card tile goal-tile" data-action="goal"><span class="pt-k">Goal · ' + fmtW(g) + ' ' + unit() + '</span>' +
        (reached ? '<span class="pt-v num pt-good">Reached</span>' : '<span class="pt-v num">' + fmtW(Math.abs(now - g)) + '<small>' + unit() + ' to go</small></span>') +
        '<span class="bar pt-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span><span class="pt-s">' + Math.round(pct) + '% there' + (eta ? ' · ' + esc(eta.replace(' at your current trend', '')) : '') + '</span></button>';
    }

    renderDiary();
  }

