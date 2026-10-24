# Builds foods-core.json: the everyday foods people search most, so the first search is instant
# while the full foods.json loads in the background. Run after foods.json changes:
#   python3 tools/core.py [extra-ids.json]
import json, re, gzip, sys
d = json.load(open('foods.json'))
s = open('app.js').read()
tp = re.search(r"const TOP_PICKS = \{(.*?)\};", s).group(1)
pp = re.search(r"const POPULAR = \{\}; \[(.*?)\]\.forEach", s).group(1)
names = set(x.replace("\\'", "'") for x in re.findall(r":\s*'((?:[^'\\]|\\.)*)'", tp)) | set(x.replace("\\'", "'") for x in re.findall(r"'((?:[^'\\]|\\.)*)'", pp))
extra = set(x.lstrip('u') for x in json.load(open(sys.argv[1]))) if len(sys.argv) > 1 else set()
def src(i): return 'pack' if isinstance(i, str) else 'eg' if i >= 9000000 else 'fndds' if i > 1000000 else 'sr' if i < 200000 else 'fdn'
KEYS = ['kcal', 'p', 'c', 'f', 'fib', 'sug']
core = []
for r in d['foods']:
    i = r[0]; nm = r[1]; on = r[8] if len(r) > 8 and r[8] else nm; sc = src(i)
    words = len(re.findall(r"[A-Za-z]+", nm.split(' · ')[0]))
    if (str(i) in extra or r[5] or sc in ('eg', 'pack') or nm in names or on in names
            or (sc == 'fndds' and words <= 3 and 'as ingredient' not in on.lower() and 'baby' not in on.lower())
            or (sc == 'sr' and words <= 3 and not re.search(r'baby|infant|formula|alcohol', (on + ' ' + d['cats'][r[2]]).lower()))):
        # Only what a search row and a quick log need; vitamins and minerals come with the full list.
        core.append([r[0], r[1], r[2], [r[3][d['keys'].index(k)] for k in KEYS]] + r[4:])
out = {'keys': KEYS, 'cats': d['cats'], 'foods': core, 'alias': {}, 'core': True}
js = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
open('foods-core.json', 'w').write(js)
print(len(core), 'foods,', len(js) // 1024, 'KB,', len(gzip.compress(js.encode())) // 1024, 'KB compressed')
