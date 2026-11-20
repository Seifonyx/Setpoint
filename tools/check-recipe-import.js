// Build server check: download real recipe pages and run them through the app's own recipe import (the engine),
// to see which sites import and how well the ingredients match. Prints a report; never fails the build.
// node tools/check-recipe-import.js > out/recipe-import.txt
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');

const SITES = [
  'https://www.allrecipes.com/recipe/21014/good-old-fashioned-pancakes/',
  'https://www.bbcgoodfood.com/recipes/easy-pancakes',
  'https://www.budgetbytes.com/one-pot-creamy-cajun-chicken-pasta/',
  'https://cookieandkate.com/best-lentil-soup-recipe/',
  'https://www.simplyrecipes.com/recipes/homemade_pizza/',
  'https://www.loveandlemons.com/hummus-recipe/',
  'https://www.recipetineats.com/chicken-stir-fry/',
  'https://www.bonappetit.com/recipe/bas-best-chocolate-chip-cookies',
];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1';

(async () => {
  const ctx = { console, setTimeout };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'ios/Setpoint/Resources/engine.js'), 'utf8') + ';this.SP=SP;', ctx);
  const sp = ctx.SP;
  sp.setState('{}');
  sp.loadFoods(fs.readFileSync(path.join(ROOT, 'foods.json'), 'utf8'));
  await new Promise(r => setTimeout(r, 200));
  let worked = 0;
  for (const url of SITES) {
    let html = '';
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' }, signal: AbortSignal.timeout(20000) });
      html = await res.text();
      if (!res.ok) { console.log(`✗ ${url}\n   HTTP ${res.status}\n`); continue; }
    } catch (e) { console.log(`✗ ${url}\n   couldn't download: ${e.message}\n`); continue; }
    const r = JSON.parse(sp.recipeFromHtml(html));
    if (!r || !r.lines.length) { console.log(`✗ ${url}\n   no recipe data on the page (${html.length} bytes)\n`); continue; }
    worked++;
    const rows = JSON.parse(sp.importLines(JSON.stringify(r.lines)));
    const ok = rows.filter(x => x.ok).length, sure = rows.filter(x => x.ok && x.sure).length, skip = rows.filter(x => x.skip).length;
    console.log(`✓ ${url}\n   "${r.name}" · serves ${r.servings ?? '?'} · ${rows.length} lines: ${ok} matched (${sure} sure), ${skip} left out, ${rows.length - ok - skip} not found`);
    for (const x of rows) console.log(`   ${x.ok ? (x.sure ? '✓' : '?') : x.skip ? '-' : '✗'} ${x.line.slice(0, 55).padEnd(55)} → ${x.ok ? `${x.name.slice(0, 40)} · ${x.amt} · ${Math.round(x.kcal)} kcal` : ''}`);
    console.log('');
  }
  console.log(`${worked} of ${SITES.length} sites imported.`);
})();
