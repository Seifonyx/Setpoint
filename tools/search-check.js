// Search quality check: common English, Arabic and Egyptian searches must put the right food first.
// Runs on every iPhone build (after `node tools/ios-engine.js`); a failure stops the release.
// Each case: [what you type, pattern the FIRST result's name must match]. Add a case whenever a search goes wrong.
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const ctx = { console, setTimeout }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'ios/Setpoint/Resources/engine.js'), 'utf8'), ctx);
const SP = ctx.SP;
SP.loadFoods(fs.readFileSync(path.join(root, 'foods.json'), 'utf8'));
SP.setState('{}');

const CASES = [
  // everyday foods
  ['egg', /^Egg, (raw|whole|hard)/], ['eggs', /^Egg/], ['banana', /^Banana/], ['apple', /^Apples?, raw/], ['rice', /^White rice/],
  ['white rice', /^White rice/], ['brown rice', /^Brown rice/], ['chicken breast', /^Chicken breast/], ['chicken', /^Chicken (breast|thigh)/],
  ['beef', /beef/i], ['ground beef', /^Ground beef/], ['salmon', /^Salmon/], ['tuna', /^Tuna/], ['milk', /^Milk/], ['oats', /^Oats/],
  ['oatmeal', /^Oatmeal/], ['bread', /bread/i], ['whole wheat bread', /^Whole-wheat bread/], ['pasta', /^Pasta/], ['potato', /^Potato/],
  ['sweet potato', /^Sweet potato/], ['avocado', /^Avocado/], ['almonds', /^Almonds/], ['peanut butter', /^Peanut butter/i],
  ['olive oil', /^Olive oil/], ['butter', /^Butter/], ['cheese', /cheese/i], ['greek yogurt', /^Greek yogurt/], ['yogurt', /yogurt/i],
  ['broccoli', /^Broccoli, raw/], ['spinach', /^Spinach/], ['tomato', /tomato/i], ['cucumber', /^Cucumber/], ['orange', /^Oranges?, raw/],
  ['strawberries', /^Strawberr/], ['blueberries', /^Blueberr/], ['grapes', /^Grapes/], ['watermelon', /^Watermelon/], ['mango', /^Mango/],
  ['dates', /^Dates?/], ['honey', /^Honey/], ['sugar', /sugar/i], ['coffee', /coffee/i], ['tea', /tea/i], ['orange juice', /^Orange juice/],
  ['pizza', /^Pizza/], ['burger', /burger/i], ['fries', /fries/i], ['falafel', /^Falafel/], ['hummus', /^Hummus/], ['tahini', /^Tahini/],
  ['pita', /^Pita/], ['cottage cheese', /^Cottage cheese/], ['whey protein', /whey/i], ['protein bar', /protein bar/i], ['nutella', /^Nutella/],
  ['dark chocolate', /^Dark chocolate/], ['milk chocolate', /^Milk chocolate/], ['ice cream', /ice cream/i], ['water', /^Water/],
  ['corn', /corn/i], ['peas', /peas/i], ['carrot', /^Carrots?/], ['onion', /^Onions?/], ['garlic', /^Garlic/], ['lettuce', /^Lettuce/],
  ['mushrooms', /mushrooms/i], ['shrimp', /^Shrimp/], ['turkey', /^Turkey/], ['bacon', /^Bacon/], ['sausage', /^Sausage/], ['ham', /^Ham/],
  ['cereal', /cereal/i], ['granola', /^Granola/], ['popcorn', /popcorn/i], ['chips', /chips/i], ['croissant', /^Croissant/], ['bagel', /^Bagel/],
  ['quinoa', /^Quinoa/], ['lentils', /^Lentils/], ['chickpeas', /^Chickpeas/], ['black beans', /^Black beans/], ['tofu', /^Tofu/],
  ['steak', /steak/i], ['liver', /liver/i], ['almond milk', /^Almond milk/], ['oat milk', /^Oat milk/], ['corn flakes', /^Corn flakes/],
  ['cookie', /^Cookie/], ['cookies', /^Cookie/], ['iced coffee', /^Iced coffee/i], ['cappuccino', /^Cappuccino/], ['latte', /^Latte/],
  // drinks and brands people type
  ['coke', /^Cola/], ['coca cola', /^Cola/], ['cocacola', /^Cola/], ['pepsi', /^Pepsi/], ['sprite', /^Sprite/], ['7up', /lemon-lime|7 ?up|seven up/i],
  ['fanta', /^Orange soda|^Fanta/], ['mountain dew', /^Mountain Dew/], ['red bull', /Red ?Bull/i], ['redbull', /Red ?Bull/i],
  ['monster', /Monster/], ['monster energy', /Monster/], ['gatorade', /Gatorade/i], ['energy drink', /^Energy drink/i],
  ['kitkat', /kit ?kat/i], ['snickers', /^Snickers/], ['twix', /^Twix/], ['oreo', /^Oreo/], ['pringles', /pringles/i], ['doritos', /^Doritos/],
  ['galaxy', /^Galaxy/], ['nescafe', /^Nescaf/i], ['indomie', /Indomie/i], ['chipsy', /Chipsy/i], ['molto', /Molto/i], ['juhayna', /Juhayna/i],
  ['almarai', /Almarai/i], ['domty', /Domty/i], ['big mac', /^Big Mac/], ['whopper', /^Whopper/], ['chicken nuggets', /nuggets/i],
  ['frappuccino', /Frappuccino/],
  // Egyptian dishes
  ['koshary', /^Kosh/], ['ful', /^Ful/], ['molokhia', /^Molokhia/], ['feteer', /^Feteer/], ['basbousa', /^Basbousa/], ['konafa', /^Konafa/],
  ['mahshi', /^Mahshi/], ['hawawshi', /^Hawawshi/], ['taameya', /^Taameya/], ['lentil soup', /^Lentil soup/], ['baladi bread', /^Aish baladi/],
  ['shawarma', /shaw[ae]rma/i], ['kofta', /^Kofta/], ['kebab', /^Kebab/], ['fattah', /^Fatt?ah/], ['om ali', /^Om Ali/], ['sobia', /^Sob/],
  ['karkade', /^Karkade/], ['sahlab', /^Sahlab/], ['qatayef', /^Qatayef/], ['white cheese', /^Gebna domiati/], ['areesh', /areesh/i],
  ['rumi cheese', /^Rumi/i], ['bechamel pasta', /bechamel/i], ['baba ghanoug', /^Baba ghanoug/i], ['feseekh', /^Fes[ei]kh/i],
  // Arabic
  ['بيض', /^Egg/], ['موز', /^Banana/], ['رز', /rice/i], ['فراخ', /^Chicken/], ['عيش', /^Aish baladi/], ['لبن', /^Milk/], ['جبنة', /cheese/i],
  ['فول', /^Ful/], ['طعمية', /^Taameya/], ['كشري', /^Kosh/], ['ملوخية', /^Molokhia/], ['شاورما', /shaw[ae]rma/i], ['بطاطس', /^Potato/],
  ['تفاح', /^Apple/], ['زبادي', /yogurt/i], ['قهوة', /coffee/i], ['شاي', /tea/i], ['سكر', /sugar/i], ['عسل', /^Honey/], ['تمر', /^Dates?/],
  ['كنافة', /^Konafa/], ['بسبوسة', /^Basbousa/], ['محشي', /^Mahshi/], ['فطير', /^Feteer/], ['ريد بول', /Red ?Bull/i], ['كوكاكولا', /^Cola/],
  // amounts typed into the search: the food is still found, and the amount comes along
  ['150g chicken breast', /^Chicken breast/, '150 g'], ['2 eggs', /^Egg/, /^2 /], ['200ml milk', /^Milk/, '200 ml'], ['1 cup rice', /rice/i, '1 cup'],
];

setTimeout(function () {
  let bad = 0;
  const lines = CASES.map(function (c) {
    const r = JSON.parse(SP.search(c[0], 'lunch'));
    const first = r[0] || {}, ok = c[1].test(first.name || '') &&
      (c[2] == null || (c[2] instanceof RegExp ? c[2].test(first.amt || '') : first.amt === c[2]));
    if (!ok) bad++;
    return (ok ? 'ok   ' : 'FAIL ') + c[0] + ' → ' + (first.name || '(nothing)') + (c[2] ? ' · ' + (first.amt || '') : '') +
      (ok ? '' : '   (next: ' + r.slice(1, 3).map(function (h) { return h.name; }).join(' | ') + ')');
  });
  const out = lines.filter(function (l) { return process.argv.includes('-v') || l.startsWith('FAIL'); });
  out.forEach(function (l) { console.log(l); });
  console.log('search check: ' + (CASES.length - bad) + ' of ' + CASES.length + ' searches put the right food first');
  if (process.argv[2] && !process.argv[2].startsWith('-')) fs.writeFileSync(process.argv[2], lines.join('\n') + '\n');
  process.exit(bad ? 1 : 0);
}, 1000);
