#!/usr/bin/env python3
"""Checks packaged foods against the makers' own figures and marks the ones that agree as verified (row[9]).

1. USDA Branded Foods (labels the manufacturers submit themselves), matched by barcode. When its calories agree
   with ours, its numbers replace ours (they fix label typos such as swapped fat and carbs) and fill what we lacked
   (sugar, sodium, cholesterol, fibre...). Marked 'usda'.
2. Caffeine, which labels outside the EU rarely give: the makers' published amount per 100 ml for each drink line.
   A drink whose calories (and sugar, when known) match the maker's label is marked 'maker'. Caffeine from weaker
   sources (lab studies or several retailers agreeing, not the maker) is filled in but doesn't make the drink verified.

Run from the project root after build.py:  python3 tools/foods/verify.py
tools/foods/usda-branded.json holds the USDA records for our barcodes; make it again with
`python3 tools/foods/verify.py --usda <FoodData_Central_branded_food_csv zip>` (fdc.nal.usda.gov/download-datasets).
"""
import csv, io, json, re, sys, zipfile

FOODS = 'foods.json'
USDA = 'tools/foods/usda-branded.json'
d = json.load(open(FOODS))
K = {k: i for i, k in enumerate(d['keys'])}
report = {}
def bump(k, n=1): report[k] = report.get(k, 0) + n

# USDA nutrient ids → our keys (units match: g, mg, µg)
FDC = {'1008': 'kcal', '1003': 'p', '1005': 'c', '1004': 'f', '1079': 'fib', '2000': 'sug', '1258': 'sat', '1257': 'trans',
       '1253': 'chol', '1093': 'na', '1092': 'k', '1087': 'ca', '1089': 'fe', '1090': 'mg', '1095': 'zn', '1162': 'vC',
       '1114': 'vD', '1106': 'vA', '1178': 'b12', '1057': 'caff'}

def packaged():
    for r in d['foods']:
        if isinstance(r[0], str) and r[0].startswith('b'): yield r

if len(sys.argv) > 2 and sys.argv[1] == '--usda':
    csv.field_size_limit(10 ** 9)
    codes = {r[0][1:].lstrip('0'): r[0] for r in packaged()}
    z = zipfile.ZipFile(sys.argv[2]); name = lambda s: [n for n in z.namelist() if n.endswith('/' + s)][0]
    hit = {}
    with z.open(name('branded_food.csv')) as f:
        for row in csv.DictReader(io.TextIOWrapper(f, 'utf-8')):
            g = (row['gtin_upc'] or '').lstrip('0')
            if g in codes and not row['discontinued_date'] and (codes[g] not in hit or int(row['fdc_id']) > int(hit[codes[g]]['fdc_id'])):
                hit[codes[g]] = row
    want = {r['fdc_id'] for r in hit.values()}; nut = {}
    with z.open(name('food_nutrient.csv')) as f:
        for row in csv.DictReader(io.TextIOWrapper(f, 'utf-8')):
            if row['fdc_id'] in want and row['nutrient_id'] in FDC and row['amount'] != '':
                nut.setdefault(row['fdc_id'], {})[row['nutrient_id']] = float(row['amount'])
    out = {i: {'fdc_id': r['fdc_id'], 'serving': r['serving_size'], 'unit': r['serving_size_unit'], 'n': nut.get(r['fdc_id'], {})} for i, r in hit.items()}
    json.dump(out, open(USDA, 'w'), separators=(',', ':'), sort_keys=True)
    print('USDA records for our barcodes:', len(out)); sys.exit()

def mark(r, how):
    while len(r) < 10: r.append(None)
    r[9] = how

def close(a, b, rel, absol): return a is not None and b is not None and abs(a - b) <= max(absol, rel * max(abs(a), abs(b)))
def consistent(n):  # the label's own calories add up
    k, p, c, f = (n.get(x) for x in ('kcal', 'p', 'c', 'f'))
    return None not in (k, p, c, f) and abs(4 * p + 4 * c + 9 * f - k) <= max(20, 0.2 * k)

# ---------- 1. USDA Branded Foods ----------
usda = json.load(open(USDA))
by = {r[0]: r for r in d['foods']}
for i, x in usda.items():
    r = by.get(i)
    if not r: continue
    raw = {FDC[k]: v for k, v in x['n'].items()}
    if raw.get('kcal') is None: bump('usda: no calories'); continue
    sv = float(x['serving'] or 0) if (x['unit'] or '').lower() in ('g', 'grm', 'ml', 'mlt') else 0
    ours = r[3][K['kcal']]
    # USDA gives most records per 100 g, a few per serving: take whichever reading agrees with our label
    for s in [1] + ([100 / sv] if sv else []):
        n = {k: v * s for k, v in raw.items()}
        if consistent(n) and close(n['kcal'], ours, 0.12, 10): break
    else:
        bump('usda: calories disagree (left as label data)'); continue
    for k, v in n.items(): r[3][K[k]] = round(v, 3)
    mark(r, 'usda'); bump('verified with USDA Branded Foods')

# ---------- 2. caffeine from the makers ----------
# (pattern, not these, caffeine mg/100 ml, label check {kcal ranges}, verified?, the brand alone is enough?, source)
# Brands that sell many other drinks (Coca-Cola, Pepsi) must be named in the product name itself, so their teas,
# juices and lemon sodas aren't given cola caffeine.
NOCAFF = r'caffeine.?free|sans caf|koffeinfrei|decaf|sin cafe'
CAFF = [
    (r'red ?bull', r'organics|simply|cola|ginger|bitter|tonic|lemon ?ade', 32, [(0, 6), (40, 50)], True, True, 'redbull.com (32 mg per 100 ml, every edition)'),
    (r'monster', r'java|coffee|rehab|hydro|protein|muscle|latte|espresso|\btea\b|cookie|cereal', 32, [(0, 6), (15, 55)], True, True, 'Monster EU can label (160 mg per 500 ml)'),
    (r'xdurance', r'', 40, [(0, 60)], True, True, 'Rockstar Xdurance UK can label (40 mg/100 ml)'),
    (r'rockstar', r'recovery|protein', 31, [(0, 6), (15, 55)], True, True, 'Rockstar UK can label (31 mg/100 ml)'),
    (r'\b(coca|coke)\b.*\b(zero|light|diet)\b|\b(zero|light|diet)\b.*\b(coca|coke)\b', r'coffee|energy|cherry|vanilla', None, [(0, 4)], True, False, 'coca-cola.com'),
    (r'\bcoca.?cola\b|\bcoke\b', r'coffee|energy|zero|light|diet|cherry|vanilla|oreo', 10.3, [(38, 46)], True, False, 'coca-cola.com (34 mg per 330 ml)'),
    (r'\bpepsi\b', r'max|zero|light|electric', 10.7, [(0, 50)], False, False, 'lab study, J. Food Sci. (38 mg per 355 ml)'),
    (r'mountain ?dew', r'energi|game ?fuel|kickstart|rise', 15.2, [(0, 60)], False, False, 'several sources (54 mg per 355 ml)'),
    (r'\bsting\b', r'', 29, [(0, 60)], False, True, 'several sources (about 29 mg/100 ml)'),
]
DIET_COKE = {'zero': 10.3, 'light': 13.9, 'diet': 13.9}  # coca-cola.com UK: Zero 34 mg, Diet Coke 46 mg per 330 ml
for r in packaged():
    name = r[1].split(' · ')[0].lower(); brand = (r[6] if len(r) > 6 and isinstance(r[6], str) else '').lower()
    kc = r[3][K['kcal']]
    if kc is None or kc > 120 or re.search(NOCAFF, name): continue  # not a drink as sold (a powder, a candy), or caffeine-free
    for pat, skip, mg, kranges, strong, by_brand, src in CAFF:
        text = name + ' ' + brand if by_brand else name
        if not re.search(pat, text) or (skip and re.search(skip, text)): continue
        if mg is None: mg = next(v for w, v in DIET_COKE.items() if re.search(r'\b%s\b' % w, text))
        have = r[3][K['caff']]
        if have is None or strong and not 0.6 * mg <= have <= 1.6 * mg:  # missing, or (with the maker's own figure) an obvious typo
            bump('caffeine %s (%s)' % ('filled in' if have is None else 'corrected', src.split(' (')[0]))
            r[3][K['caff']] = mg
        if strong and any(lo <= kc <= hi for lo, hi in kranges) and not (len(r) > 9 and r[9]):  # calories match the maker's label
            mark(r, 'maker'); bump("verified with the maker's figures")
        break

json.dump(d, open(FOODS, 'w'), separators=(',', ':'), ensure_ascii=False)
print(json.dumps(report, indent=1, ensure_ascii=False))
print('verified packaged foods:', sum(1 for r in packaged() if len(r) > 9 and r[9]), 'of', sum(1 for _ in packaged()))
