#!/usr/bin/env python3
"""Pulls packaged foods from Open Food Facts (the open barcode database) for the food list:
the most-scanned products of famous brands, and the most-scanned products sold in Egypt.
Writes one JSON product per line to the file given (default off-raw.jsonl). Search is limited to
about 10 requests a minute, so this waits between requests. Re-run any time to refresh."""
import json, os, sys, time, urllib.request, urllib.parse

OUT = sys.argv[1] if len(sys.argv) > 1 else 'off-raw.jsonl'
UA = {'User-Agent': 'SetpointFoodList/1.0 (food list build)'}
FIELDS = 'code,product_name,product_name_en,product_name_ar,brands,nutriments,serving_size,serving_quantity,product_quantity,quantity,unique_scans_n,countries_tags,categories_tags,completeness'
BRANDS = ['red-bull', 'monster-energy', 'monster', 'rockstar', 'sting', 'power-horse', 'coca-cola', 'pepsi', 'sprite', 'fanta', '7up',
  'mountain-dew', 'schweppes', 'mirinda', 'gatorade', 'powerade', 'lipton', 'nescafe', 'starbucks', 'nespresso', 'lavazza', 'tropicana',
  'minute-maid', 'innocent', 'nutella', 'ferrero', 'kinder', 'snickers', 'mars', 'twix', 'bounty', 'milky-way', 'galaxy', 'cadbury',
  'nestle', 'kitkat', 'lion', 'm-m-s', 'toblerone', 'milka', 'lindt', 'ritter-sport', 'hershey-s', 'reese-s', 'oreo', 'lotus', 'biscoff',
  'mcvitie-s', 'pringles', 'lay-s', 'doritos', 'cheetos', 'chipsy', 'tiger', 'quaker', 'kellogg-s', 'fitness', 'heinz', 'hellmann-s',
  'kraft', 'philadelphia', 'president', 'almarai', 'juhayna', 'domty', 'lactel', 'danone', 'activia', 'alpro', 'oatly', 'barilla',
  'edita', 'molto', 'bisco-misr', 'halwani', 'americana', 'big-chips', 'cadbury-dairy-milk', 'twinkies', 'hohos', 'kit-kat', 'nature-valley',
  'quest', 'optimum-nutrition', 'myprotein', 'grenade', 'barebells', 'fulfil', 'oikos', 'chobani', 'yoplait', 'muller', 'arla', 'lurpak',
  'kiri', 'la-vache-qui-rit', 'babybel', 'kerrygold', 'heinz-beanz', 'maggi', 'knorr', 'indomie', 'nissin', 'cup-noodles', 'dasani',
  'aquafina', 'nestle-pure-life', 'evian', 'volvic', 'perrier', 'san-pellegrino', 'vitamin-water', 'v8', 'ensure', 'herbalife',
  'nesquik', 'milo', 'ovaltine', 'horlicks', 'twinings', 'ahmad-tea', 'el-arosa', 'isis', 'harvest-foods', 'faragello', 'beyti', 'labanita',
  'teama', 'enjoy', 'bon-appetit', 'freeway', 'rani', 'vimto', 'tang', 'nido', 'bonjorno', 'abu-auf', 'el-doha', 'sunbites', 'skittles',
  'haribo', 'trolli', 'mentos', 'tic-tac', 'extra', 'orbit', 'airwaves', 'bounty', 'twix', 'maltesers', 'aero', 'smarties', 'bueno']
def get(url):
    for attempt in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r: return json.load(r)
        except Exception as e:
            print('  retry', attempt, e, flush=True); time.sleep(4 + 4 * attempt)
    return None
seen, done = set(), set()
if os.path.exists(OUT):  # carry on where an earlier run stopped
    for line in open(OUT):
        p = json.loads(line); seen.add(p.get('code')); done.add(p.get('_q'))
out = open(OUT, 'a')
def take(params, label):
    if label in done: return
    # the classic search (the newer search API is often busy): one tag filter, most-scanned first
    q = 'https://world.openfoodfacts.org/cgi/search.pl?' + urllib.parse.urlencode(dict(params, action='process', json=1, fields=FIELDS, sort_by='unique_scans_n'))
    d = get(q); n = 0
    for p in (d or {}).get('products', []):
        if p.get('code') in seen: continue
        seen.add(p.get('code')); p['_q'] = label; out.write(json.dumps(p, ensure_ascii=False) + '\n'); n += 1
    out.flush(); print(label, n, flush=True); time.sleep(6.5)  # stay under ~10 searches a minute
def tag(t, v): return {'tagtype_0': t, 'tag_contains_0': 'contains', 'tag_0': v}
for b in dict.fromkeys(BRANDS): take(dict(tag('brands', b), page_size=40), 'brand:' + b)
for page in range(1, 9): take(dict(tag('countries', 'egypt'), page_size=100, page=page), 'egypt:%d' % page)
for page in range(1, 11): take({'page_size': 100, 'page': page}, 'world:%d' % page)
print('done', len(seen))
