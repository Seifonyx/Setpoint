#!/usr/bin/env python3
"""Fills gaps in the food list with values that are certain (never guesses), and removes unverified copies of
verified foods. Run from the project root after build.py and verify.py:  python3 tools/foods/complete.py

1. Certain zeros: no fat → no saturated, trans, mono or poly fat and no cholesterol; no carbs → no sugar or fibre;
   unprocessed plant foods → no cholesterol; plain meat, fish, eggs, fruit, vegetables, grains, nuts, oils and
   spices → no caffeine (USDA left these blank because it didn't test for them, not because they're unknown).
2. USDA Foundation foods (newer lab analyses that skipped many nutrients) take what they lack from the same food's
   SR Legacy lab analysis.
3. A packaged food that isn't verified is removed when a verified food is the same product (same words in its name
   and brand, ignoring sizes and packaging, and the same calories). Its id is kept as an alias of the verified one,
   so saved diary entries, favourites and a scan of its barcode open the verified food.
"""
import json, re, unicodedata

d = json.load(open('foods.json'))
K = {k: i for i, k in enumerate(d['keys'])}
CATS = d['cats']
report = {}
def bump(k, n=1): report[k] = report.get(k, 0) + n
def cat(r): return CATS[r[2]] if isinstance(r[2], int) and r[2] < len(CATS) else ''
def on(r): return (r[8] if len(r) > 8 and r[8] else r[1])
def checked(r): return len(r) > 9 and bool(r[9])
def lab(r): return isinstance(r[0], int) and r[0] < 9000000

def fill(r, k, v, why):
    if r[3][K[k]] is None: r[3][K[k]] = v; bump(why)

# ---------- 1. certain zeros ----------
PLANT_CATS = {'Vegetables and Vegetable Products', 'Fruits and Fruit Juices', 'Legumes and Legume Products', 'Nut and Seed Products',
              'Cereal Grains and Pasta', 'Spices and Herbs', 'Citrus fruits', 'Apples', 'Bananas', 'Melons', 'Grapes', 'Mango and papaya',
              'Peaches and nectarines', 'Pears', 'Pineapple', 'Blueberries and other berries', 'Strawberries', 'Other fruits and fruit salads',
              'Dried fruits', 'Spinach', 'Broccoli', 'Carrots', 'Tomatoes', 'Onions', 'Corn', 'Cabbage', 'String beans', 'Other dark green vegetables',
              'Other red and orange vegetables', 'Other starchy vegetables', 'Lettuce and lettuce salads', 'Beans, peas, legumes', 'Nuts and seeds',
              'Citrus juice', 'Apple juice', 'Other fruit juice', 'Vegetable juice', 'Plant-based milk', 'Rice'}
NO_CAFF_CATS = PLANT_CATS | {'Beef Products', 'Pork Products', 'Poultry Products', 'Finfish and Shellfish Products', 'Lamb, Veal, and Game Products',
              'Sausages and Luncheon Meats', 'Fats and Oils', 'Dairy and Egg Products', 'Beef, excludes ground', 'Ground beef', 'Pork', 'Bacon',
              'Lamb, goat, game', 'Turkey, duck, other poultry', 'Chicken, whole pieces', 'Liver and organ meats', 'Fish', 'Shellfish',
              'Eggs and omelets', 'Cheese', 'Cottage/ricotta cheese', 'Milk, reduced fat', 'Milk, whole', 'Milk, lowfat', 'Milk, nonfat',
              'Yogurt, regular', 'Yogurt, Greek', 'Butter and animal fats', 'Salad dressings and vegetable oils', 'Tap water', 'Bottled water',
              'Pasta, noodles, cooked grains', 'Yeast breads', 'Tortillas', 'White potatoes, baked or boiled', 'Sugars and honey'}
CAFF_WORDS = re.compile(r'coffee|tea\b|cola|chocolate|cocoa|cacao|mocha|espresso|latte|cappuccino|energy|guarana|mate\b|kola|caffein|brownie|fudge|tiramisu', re.I)
ANIMAL_WORDS = re.compile(r'butter|lard|tallow|ghee|cream|milk|cheese|egg|meat|beef|pork|chicken|fish|lamb|bacon|anchov|honey|yogurt|mayonnaise|animal', re.I)
for r in d['foods']:
    n = r[3]
    if n[K['f']] is not None and n[K['f']] < 0.05:
        for k in ('sat', 'trans', 'mono', 'poly', 'chol'): fill(r, k, 0, 'no fat, so none of: saturated, trans, mono, poly fat, cholesterol')
    if n[K['c']] is not None and n[K['c']] < 0.05:
        for k in ('sug', 'fib'): fill(r, k, 0, 'no carbs, so no sugar or fibre')
    if not lab(r): continue  # the rest need USDA's category, which packaged foods don't have
    c = cat(r); text = on(r) + ' ' + r[1]
    if c in PLANT_CATS and not ANIMAL_WORDS.search(text): fill(r, 'chol', 0, 'plant food, so no cholesterol')
    if c in NO_CAFF_CATS and not CAFF_WORDS.search(text): fill(r, 'caff', 0, 'can\'t contain caffeine')

# ---------- 2. Foundation foods from their SR Legacy twin ----------
TWIN = {321360: 170457, 325198: 170853, 747429: 170853, 332791: 169096, 333008: 174963, 333281: 170051, 333476: 175129,
        746952: 173864, 747693: 168556, 747997: 172183, 748236: 172184, 748967: 171287, 749420: 168322, 789951: 168936,
        790018: 169761, 790085: 168893, 790146: 168896, 790276: 170290, 790577: 170000, 790646: 170000}
by = {r[0]: r for r in d['foods']}
for f, s in TWIN.items():
    a, b = by.get(f), by.get(s)
    if not a or not b: continue
    for i, v in enumerate(a[3]):
        if v is None and b[3][i] is not None: a[3][i] = b[3][i]; bump('Foundation food completed from its SR Legacy lab twin')

# ---------- 3. copies of verified foods ----------
# Same product = the same words in the product name (sizes, packaging and filler words like "original" or "energy drink"
# ignored, "coke" read as "coca cola"), a brand in common (or none given), and calories and sugar that agree.
DROP = re.compile(r'\b\d+([.,]\d+)?\s*(ml|cl|l|g|gr|kg|oz|fl)\b|\b\d+\s*x\b|\bx\s*\d+\b|\b(can|cans|canette|bottle|pet|pack|multipack|lata|dose|nrb)\b')
STOP = {'energy', 'drink', 'drinks', 'boisson', 'energisante', 'energetica', 'the', 'edition', 'flavor', 'flavour', 'flavoured', 'soda', 'soft',
        'and', 'with', 'de', 'a', 'original', 'classic', 'regular', 'taste', 'gout', 'sabor', 'rasa', 'asli', 'sugar', 'cookies', 'cookie',
        'biscuits', 'biscuit', 'bar', 'bars', 'candy', 'single', 'singles', 'imp'}
SYN = {'coke': 'coca cola', 'cocacola': 'coca cola', 'kitkat': 'kit kat'}
def words(s):
    t = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower().replace('-', ' ')
    t = DROP.sub(' ', t)
    out = []
    for x in re.findall(r'[a-z0-9]+', t):
        if len(x) > 1: out += SYN.get(x, x).split()  # not the s of Lay's
    return out
def brand(r): return r[6] if len(r) > 6 and isinstance(r[6], str) else ''
# Brand names: words that appear in at least two products' brand, except ordinary food words.
GENERIC = {'milk', 'nature', 'valley', 'dairy', 'nutrition', 'red', 'bio', 'sport', 'garden', 'foods', 'food', 'organic', 'tea', 'way',
           'real', 'star', 'extra', 'good', 'keto', 'bakery', 'farms', 'cola', 'maison', 'harvest', 'protein', 'chocolate', 'cheese',
           'cream', 'juice', 'water', 'coffee', 'bread', 'oil', 'yogurt', 'chips', 'fresh', 'natural', 'gold', 'premium', 'mini', 'zero'}
_bc = {}
for r in d['foods']:
    if isinstance(r[0], str):
        for w in set(words(brand(r))): _bc[w] = _bc.get(w, 0) + 1
# ordinary food words: everything in USDA's names outside brackets ("Energy drink (Monster)" → energy, drink)
FOODWORDS = set()
for r in d['foods']:
    if lab(r): FOODWORDS.update(words(re.sub(r'\([^)]*\)', ' ', on(r) + ' ' + r[1])))
KNOWN = {w for w, n in _bc.items() if len(w) >= 3 and w not in GENERIC and (n >= 5 or n >= 2 and w not in FOODWORDS)}  # big brands count even when USDA names them
def own(r): return set(x for x in words(r[1].split(' · ')[0]) if x not in STOP)
def fam(r): return set(words(r[1] + ' ' + brand(r))) & KNOWN  # its brand names, wherever they're written
def key(r):  # the product's own words without brand names ("Monster energy ultra zero sugar" = "Ultra Zero Sugar · Monster")
    w = own(r)
    return tuple(sorted(w - KNOWN or w))
def same(a, b):
    fa, fb = fam(a), fam(b)
    if (fa or fb) and not (fa & fb): return False  # a brand each, and none in common (Pepsi Zero isn't Coca-Cola Zero)
    if not fa and not fb:  # rarer brands: the brand fields must share a word (Puvana water isn't Dasani)
        ba = set(words(brand(a) + ' ' + (a[1].split(' · ')[1] if ' · ' in a[1] else ''))) - GENERIC
        bb = set(words(brand(b) + ' ' + (b[1].split(' · ')[1] if ' · ' in b[1] else ''))) - GENERIC
        if ba and bb and not (ba & bb): return False
    for k, rel, ab in (('kcal', 0.15, 5), ('sug', 0.2, 1.5), ('f', 0.25, 1.5), ('p', 0.25, 1.5)):
        x, y = a[3][K[k]], b[3][K[k]]
        if x is not None and y is not None and abs(x - y) > max(ab, rel * max(x, y)): return False
    return a[3][K['kcal']] is not None and b[3][K['kcal']] is not None
def rank(r):  # which copy to keep: checked with USDA, then with the maker, then the most complete, with real sizes
    return ({'usda': 2, 'maker': 1}.get(r[9] if len(r) > 9 else None, 0), sum(v is not None for v in r[3]),
            sum(1 for s_ in r[4] if s_[0] not in ('100 g', '1 serving')))
groups = {}
for r in d['foods']:
    if isinstance(r[0], str) and key(r): groups.setdefault(key(r), []).append(r)
alias = d.setdefault('alias', {})
gone = set()
for g in groups.values():
    if len(g) < 2 or not any(checked(r) for r in g): continue
    g.sort(key=rank, reverse=True)
    for i_, a in enumerate(g):
        if a[0] in gone or not checked(a): continue
        for b in g[i_ + 1:]:
            if b[0] in gone or not same(a, b): continue
            gone.add(b[0]); alias[b[0]] = a[0]
            for s_ in b[4]:  # its sizes, if the kept one lacks them
                if s_[0] not in [x[0] for x in a[4]] and s_[0] not in ('100 g', '1 serving'): a[4].append(s_)
            if not a[7] if len(a) > 7 else False: a[7] = b[7] if len(b) > 7 else a[7]
            bump('copy removed (verified %s kept)' % ('one also' if checked(b) else 'one'))
d['foods'] = [r for r in d['foods'] if r[0] not in gone]
# an alias whose food is back in the list (imported again) does nothing: drop it
ids = {r[0] for r in d['foods']}
for o in [o for o in alias if o in ids or (o.isdigit() and int(o) in ids)]: del alias[o]
for o in [o for o in alias if isinstance(alias[o], str) and alias[o].startswith('b') and alias[o] not in ids and alias[o] not in alias]: del alias[o]  # its product is gone
# an alias that pointed at a food removed now points at what replaced it
for o in list(alias):
    t = alias[o]; seen = set()
    while t in alias and t not in seen: seen.add(t); t = alias[t]
    alias[o] = t

json.dump(d, open('foods.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print(json.dumps(report, indent=1, ensure_ascii=False))
print('foods now', len(d['foods']), 'aliases', len(alias))
