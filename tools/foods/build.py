#!/usr/bin/env python3
"""Builds the food list (foods.json) from what's in it now, made better:

1. Merges duplicates and near-identical entries, keeping the most accurate one (lab data before survey estimates,
   then the one with the most nutrients). The others point to it (alias), so anything you logged still finds its food.
2. Fixes packaged foods whose calories don't add up, and drops the hopeless ones.
3. Adds packaged products from Open Food Facts (off_fetch.py, then this), with real can / bottle / pack sizes.
4. Adds Egyptian dishes worked out from their recipes (egypt_dishes.py).
5. Gives every food a natural serving where it only had grams.

Run from the project root:  python3 tools/foods/build.py [off-raw.jsonl]
It's safe to run again: merging is repeatable and imported products replace their older copies.
"""
import json, re, sys, os, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FOODS = os.path.join(ROOT, 'foods.json')
d = json.load(open(FOODS))
K = {k: i for i, k in enumerate(d['keys'])}
cats = d['cats']
def cat(name):
    if name not in cats: cats.append(name)
    return cats.index(name)
PACK = cat('Packaged foods')
report = collections.Counter()

def src(i):
    if isinstance(i, str): return 'pack'
    return 'eg' if i >= 9000000 else 'fndds' if i > 1000000 else 'sr' if i < 200000 else 'fdn'
RANK = {'fdn': 0, 'sr': 1, 'fndds': 2}
def filled(r): return sum(1 for v in r[3] if v is not None)

# Names the app's own code points to (top picks, popular foods): these entries always stay.
app = open(os.path.join(ROOT, 'engine', 'src', '06-food-database.js')).read()
tp = re.search(r"const TOP_PICKS = \{(.*?)\};", app).group(1)
pp = re.search(r"const POPULAR = \{\}; \[(.*?)\]\.forEach", app).group(1)
PINNED = set(x.replace("\\'", "'") for x in re.findall(r":\s*'((?:[^'\\]|\\.)*)'", tp)) | set(x.replace("\\'", "'") for x in re.findall(r"'((?:[^'\\]|\\.)*)'", pp))
def pinned(r): return r[1] in PINNED or (len(r) > 8 and r[8] in PINNED)

# ---------- 1. duplicates ----------
# words that don't change what the food is ("Rice, white, NFS" is "Rice, white"); anything else in one name but not
# the other (raw/boiled, with peel, unsalted, chocolate chip…) means they're different foods and stay apart
NEUTRAL = set('nfs ns as to of the and all types varieties commercially commercial prepared ready serve regular solid fresh'.split())
def norm(s): return re.sub(r'[^a-z0-9 ]', ' ', s.lower())
def stemw(w): return re.sub(r'(ies)$', 'y', re.sub(r'(?<=[a-z]{3})(es|s)$', '', w))
def words(r): return tuple(stemw(w) for w in norm(r[1].split(' · ')[0]).split() if w not in NEUTRAL)  # in order: 'white cake, chocolate icing' isn't 'chocolate cake, white icing'
def close(a, b):
    """Same food in practice: calories within 5%, protein / carbs / fat within 10% (or 1.5 g), and sodium, sugar,
    fibre and caffeine alike where both have them."""
    for k, tol, floor in (('kcal', 0.05, 4), ('p', 0.10, 1.5), ('c', 0.10, 1.5), ('f', 0.10, 1.5),
                          ('na', 0.20, 25), ('sug', 0.15, 1.5), ('fib', 0.25, 1), ('caff', 0.2, 5)):
        x, y = a[3][K[k]], b[3][K[k]]
        if x is None or y is None:
            if k in ('kcal', 'p', 'c', 'f'): return False
            continue
        if abs(x - y) > max(floor, tol * max(abs(x), abs(y))): return False
    return True
def better(a, b):
    """The more accurate of two: lab data first (Foundation, then SR Legacy), then more nutrients, then a shorter name."""
    ka = (RANK.get(src(a[0]), 3), -filled(a), len(a[1])); kb = (RANK.get(src(b[0]), 3), -filled(b), len(b[1]))
    return a if ka <= kb else b

generic = [r for r in d['foods'] if src(r[0]) in RANK]
by_head = collections.defaultdict(list)
for r in generic:
    ws = words(r)
    if ws: by_head[stemw(norm(r[1]).split()[0]) if norm(r[1]).split() else ''].append((r, ws))
alias = {str(k): v for k, v in d.get('alias', {}).items()}
dropped = {}
for head, group in by_head.items():
    if len(group) < 2: continue
    group.sort(key=lambda x: (RANK.get(src(x[0][0]), 3), -filled(x[0])))
    for i, (a, wa) in enumerate(group):
        if a[0] in dropped: continue
        for b, wb in group[i + 1:]:
            if b[0] in dropped or a[0] in dropped: continue
            same_name = norm(a[1]) == norm(b[1])
            # the same name, give or take words that change nothing ("Rice, white" / "Rice, white, NFS"), and the same numbers
            # (Not merged: a general survey entry like "Tuna" and a specific lab one like "Tuna, light, canned in water":
            # the general one is the right pick when you don't know the kind, so both stay.)
            if not ((same_name or wa == wb) and close(a, b)): continue
            keep = better(a, b); drop = b if keep is a else a
            if pinned(drop) and not pinned(keep): keep, drop = drop, keep
            if pinned(drop): continue
            # what the dropped one had that the kept one lacks: its servings, Arabic name, popularity
            have = {s[0] for s in keep[4]}
            keep[4].extend(s for s in drop[4] if s[0] not in have)
            if len(drop) > 7 and drop[7] and (len(keep) <= 7 or not keep[7]):
                while len(keep) < 8: keep.append('')
                keep[7] = drop[7]
            keep[5] = max(keep[5] or 0, drop[5] or 0)
            dropped[drop[0]] = keep[0]
report['merged duplicates'] = len(dropped)
def final(i):
    seen = set()
    while i in dropped and i not in seen: seen.add(i); i = dropped[i]
    return i
for o, n in list(alias.items()): alias[o] = final(n)
for o, n in dropped.items(): alias[str(o)] = final(n)
d['foods'] = [r for r in d['foods'] if r[0] not in dropped]

# ---------- 1b. the same packaged product under several barcodes ----------
packs = collections.defaultdict(list)
for r in d['foods']:
    if src(r[0]) == 'pack': packs[(norm(r[1]), round((r[3][K['kcal']] or 0) / 3))].append(r)
pdrop = {}
for group in packs.values():
    if len(group) < 2: continue
    group.sort(key=lambda r: (-sum(1 for s_ in r[4] if s_[0] not in ('100 g', '1 serving')), -filled(r)))  # real sizes, then most nutrients
    for r in group[1:]: pdrop[r[0]] = group[0][0]
d['foods'] = [r for r in d['foods'] if r[0] not in pdrop]
for o, n in pdrop.items(): alias[str(o)] = n
report['packaged duplicates merged'] = len(pdrop)

# ---------- 2. packaged foods: numbers that don't add up ----------
def kcal_ok(n):
    k, p, c, f = (n[K[x]] for x in ('kcal', 'p', 'c', 'f'))
    if None in (k, p, c, f): return False
    est = 4 * p + 4 * c + 9 * f + 7 * (n[K['alc']] or 0)
    return abs(est - k) <= max(15, 0.25 * max(k, est))
kept = []
for r in d['foods']:
    if src(r[0]) == 'pack' and not kcal_ok(r[3]):
        report['packaged dropped (calories do not add up)'] += 1; continue
    kept.append(r)
d['foods'] = kept

# ---------- 3. Open Food Facts ----------
OFF_MAP = {  # key: (Open Food Facts nutrient, factor from grams)
    'kcal': ('energy-kcal', 1), 'p': ('proteins', 1), 'c': ('carbohydrates', 1), 'f': ('fat', 1), 'fib': ('fiber', 1),
    'sug': ('sugars', 1), 'sat': ('saturated-fat', 1), 'mono': ('monounsaturated-fat', 1), 'poly': ('polyunsaturated-fat', 1),
    'trans': ('trans-fat', 1), 'chol': ('cholesterol', 1000), 'na': ('sodium', 1000), 'k': ('potassium', 1000),
    'ca': ('calcium', 1000), 'fe': ('iron', 1000), 'mg': ('magnesium', 1000), 'ph': ('phosphorus', 1000), 'zn': ('zinc', 1000),
    'vA': ('vitamin-a', 1e6), 'vC': ('vitamin-c', 1000), 'vD': ('vitamin-d', 1e6), 'vE': ('vitamin-e', 1000),
    'b1': ('vitamin-b1', 1000), 'b2': ('vitamin-b2', 1000), 'b3': ('vitamin-pp', 1000), 'b6': ('vitamin-b6', 1000),
    'fol': ('folates', 1e6), 'b12': ('vitamin-b12', 1e6), 'caff': ('caffeine', 1000)}
def num(x):
    try: return float(x)
    except (TypeError, ValueError): return None
def amount(s):
    """'250 ml', '6 x 330ml', '1 L', '45g' → (grams or ml of one item, 'ml' or 'g')."""
    if not s: return None
    t = s.lower().replace(',', '.')
    m = re.search(r'(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ml|cl|l|g|kg)\b', t) or re.search(r'()(\d+(?:\.\d+)?)\s*(ml|cl|l|g|kg|gr|grams?)\b', t)
    if not m: return None
    v = float(m.group(2)); u = m.group(3)
    v = v * {'ml': 1, 'cl': 10, 'l': 1000, 'g': 1, 'gr': 1, 'gram': 1, 'grams': 1, 'kg': 1000}[u]
    return (v, 'ml' if u in ('ml', 'cl', 'l') else 'g') if 0 < v <= 5000 else None
ASCIIISH = re.compile(r"^[A-Za-z0-9 '&.,%+\-/()!éèêàâîôûçÉ®™]+$")
def clean_name(p):
    for k in ('product_name_en', 'product_name'):
        n = (p.get(k) or '').strip()
        if n and ASCIIISH.match(n):
            n = re.sub(r'\s+', ' ', n)[:70]
            return n[0].upper() + n[1:] if n.islower() else n  # "pringles hot" → "Pringles hot"
    return None
def container(p, qty):
    v, u = qty; cs = ' '.join(p.get('categories_tags') or [])
    if u == 'ml':
        if re.search(r'energy-drink|soda|carbonated|cola', cs) and v <= 500: return '1 can (%d ml)' % v
        return '1 bottle (%s)' % ('%g L' % (v / 1000) if v >= 1000 else '%d ml' % v)
    if re.search(r'bars|chocolate-bars|candy|confection', cs) and v <= 100: return '1 bar (%g g)' % v
    if re.search(r'yogurt|yoghurt', cs) and v <= 250: return '1 cup (%g g)' % v
    return '1 pack (%g g)' % v
def off_rows(path):
    best = {}
    for line in open(path):
        p = json.loads(line); n100 = p.get('nutriments') or {}
        name = clean_name(p); brand = (p.get('brands') or '').split(',')[0].strip()
        if not name or not brand: report['off skipped (no English name or brand)'] += 1; continue
        n = [None] * len(d['keys'])
        for k, (f, x) in OFF_MAP.items():
            v = num(n100.get(f + '_100g'))
            if v is not None and v >= 0: n[K[k]] = round(v * x, 3 if x == 1 else 2)
        alc = num(n100.get('alcohol_100g'))
        if alc: n[K['alc']] = round(alc * 0.789, 2)  # % by volume to grams
        if not kcal_ok(n) or n[K['kcal']] > 900: report['off skipped (numbers missing or do not add up)'] += 1; continue
        por = []
        q = amount(p.get('quantity'))
        if q: por.append([container(p, q), q[0]])
        sq = num(p.get('serving_quantity'))
        # the serving's unit: from its own text ("250 ml"), else the pack's, else ml for drinks
        su = (amount(p.get('serving_size')) or q or (0, 'ml' if re.search(r'beverage|drink', ' '.join(p.get('categories_tags') or [])) else 'g'))[1]
        if sq and 5 <= sq <= 2000 and (not q or abs(sq - q[0]) > 1): por.append(['1 serving (%g %s)' % (sq, su), sq])
        if not por: por.append(['100 g', 100])
        ar = (p.get('product_name_ar') or '').strip()
        row = ['b' + p['code'], name if brand.lower() in name.lower() else name + ' · ' + brand, PACK, n, por, 0, brand, ar]
        key = (norm(name), norm(brand), round((n[K['kcal']] or 0) / 3))
        scans = p.get('unique_scans_n') or 0
        if key not in best or scans > best[key][0]: best[key] = (scans, row)
    return [r for _, r in best.values()]
if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
    new = off_rows(sys.argv[1]); ids = {r[0] for r in new}
    # an imported product replaces its older copy (same barcode, or same name and brand)
    names = {(norm(r[1]), round((r[3][K['kcal']] or 0) / 3)) for r in new}
    before = len(d['foods'])
    d['foods'] = [r for r in d['foods'] if not (src(r[0]) == 'pack' and (r[0] in ids or (norm(r[1]), round((r[3][K['kcal']] or 0) / 3)) in names))]
    report['packaged replaced by fresher label data'] = before - len(d['foods'])
    d['foods'].extend(new); report['packaged from Open Food Facts'] = len(new)

# ---------- 4. Egyptian dishes from recipes ----------
eg = os.path.join(os.path.dirname(__file__), 'egypt-dishes.json')
if os.path.exists(eg):
    dishes = json.load(open(eg))
    ids = {r['id'] for r in dishes}
    d['foods'] = [r for r in d['foods'] if r[0] not in ids]
    egc = cat('Egyptian dishes')
    for r in dishes: d['foods'].append([r['id'], r['name'], egc, r['n'], r['por'], r.get('pop', 0.5), r.get('alt', ''), r.get('ar', ''), r.get('on', '')])
    report['Egyptian dishes from recipes'] = len(dishes)

# ---------- 5. a natural serving for foods with only grams ----------
for r in d['foods']:
    if not r[4]: r[4] = [['100 g', 100]]; report['given a 100 g serving'] += 1

d['alias'] = {k: v for k, v in alias.items() if k != str(v)}
json.dump(d, open(FOODS, 'w'), ensure_ascii=False, separators=(',', ':'))
print(json.dumps(report, indent=1)); print('foods now', len(d['foods']), 'aliases', len(d['alias']))
