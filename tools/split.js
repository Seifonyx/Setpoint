// The other direction: cuts app.js into src/ modules at its section headings. Only needed if app.js was edited directly.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const lines = src.split('\n'), cuts = [{ at: 0, name: 'start' }];
const extra = [[/^  \/\/ With `edit` \(a logged item/, 'add-food-sheet'], [/^  \/\/ Camera barcode reading\./, 'camera'], [/^  \/\/ You → My foods:/, 'my-foods-page']];
lines.forEach((l, i) => {
  const m = /^  \/\* =+ (.+?) =+ \*\/$/.exec(l);
  if (m) cuts.push({ at: i, name: m[1].toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') });
  extra.forEach(x => { if (x[0].test(l)) cuts.push({ at: i, name: x[1] }); });
});
const endAt = lines.length - 2; // the closing "})();" gets its own file
cuts.push({ at: endAt, name: 'end' });
cuts.sort((a, b) => a.at - b.at);
const dir = path.join(root, 'src'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
cuts.forEach((c, i) => {
  const to = i + 1 < cuts.length ? cuts[i + 1].at : lines.length;
  const body = lines.slice(c.at, to).join('\n') + (to < lines.length ? '\n' : '');
  fs.writeFileSync(path.join(dir, String(i).padStart(2, '0') + '-' + c.name + '.js'), body);
});
console.log('split into ' + cuts.length + ' modules');
