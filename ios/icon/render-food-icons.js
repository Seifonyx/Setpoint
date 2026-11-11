const { chromium } = require('playwright'); const fs = require('fs');
const IC = JSON.parse(fs.readFileSync(process.argv[2] + '/icons.json', 'utf8'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 96, height: 96 }, deviceScaleFactor: 1 });
  for (const [k, path] of Object.entries(IC)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await p.screenshot({ path: `${process.argv[2]}/food-${k}@3x.png`, omitBackground: true, clip: { x: 0, y: 0, width: 96, height: 96 } });
  }
  await b.close();
})();
