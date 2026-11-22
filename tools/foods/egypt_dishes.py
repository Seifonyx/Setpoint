#!/usr/bin/env python3
"""Egyptian dishes worked out from their recipes: every dish is a typical home (or shop) batch made of USDA
ingredients, so it gets the full set of nutrients, not just calories. The numbers are estimates (recipes vary),
and the app says so. Writes egypt-dishes.json next to this file; build.py adds them to the food list.

Each recipe: id, English name, Arabic name, other spellings, serving name, serving grams,
ingredients [(ingredient, grams raw)], and the cooked weight of the batch (water added or lost), if not the sum.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(os.path.join(ROOT, 'foods.json')))
by = {r[0]: r for r in d['foods']}
I = dict(fava=173798, olive=171413, oil=171025, tomato=170457, onion=170000, pepper=170427, butter=173410, ghee=173412,
    egg=171287, gebna=9000050, baladi=9000048, flour=168894, sugar=169655, honey=169640, milk=171265, cream=170859,
    potato=170026, rice=168877, pasta=169736, paste=170459, tsauce=170054, mince=171796, beef=171206, breast=171077,
    chicken=171474, dark=171463, peas=170016, carrot=170393, okra=169260, zucchini=169291, eggplant=169228, spinach=168462,
    taro=169308, garlic=169230, coriander=169997, dill=172233, parsley=170416, lemon=167747, yogurt=171284, cucumber=169225,
    beet=169145, cauli=169986, tilapia=175176, shrimp=174210, squid=174223, semolina=169715, coconut=168586, almond=170567,
    walnut=170187, pistachio=170184, raisin=168165, phyllo=172791, puff=172790, wheat=169721, squab=174475, cumin=170923,
    tahini=168604, chickpea=173799, lentil=172421, mozz=170845, cheddar=173414, sausage=171617, pastrami=170204,
    cornstarch=169698, cinnamon=171320, crumbs=174928, cocoa=169593, nutella=168000, tea=173227, coffee=171893,
    sugarcane=2710606, mango=169910, carob=173755, fenugreek=171324, dates=168191, mint=173475, ginger=169231,
    rabbit=172521, jute=168419, liver=169451, vinegar=173469, water=None)

R = [  # id, name, arabic, other spellings, serving, grams, ingredients, cooked batch weight (None = sum)
 # breakfast and street food
 (9100001, 'Ful eskandarani', 'فول اسكندراني', 'foul eskandarany alexandrian', 'plate', 250,
  [('fava', 400), ('tomato', 120), ('onion', 60), ('pepper', 60), ('oil', 20), ('cumin', 3), ('garlic', 8)], None),
 (9100002, 'Ful with butter', 'فول بالزبدة', 'foul bel zebda', 'plate', 230, [('fava', 400), ('butter', 25), ('cumin', 3)], None),
 (9100003, 'Eggs with tomato', 'بيض بالطماطم', 'bayd bel tamatem', 'plate', 200, [('egg', 150), ('tomato', 150), ('onion', 40), ('oil', 12)], 320),
 (9100004, 'Gebna with tomato', 'جبنة بالطماطم', 'gebna bel tamatem cheese tomato', 'plate', 150,
  [('gebna', 100), ('tomato', 80), ('oil', 8), ('pepper', 20)], None),
 (9100005, 'Halawa tahiniya', 'حلاوة طحينية', 'halva halawa', 'tablespoon', 20, [('tahini', 50), ('sugar', 45), ('pistachio', 5)], None),
 (9100006, 'Feteer with cheese', 'فطير بالجبنة', 'feteer gebna', 'quarter', 150,
  [('flour', 250), ('ghee', 70), ('water', 120), ('mozz', 120), ('gebna', 60)], 560),
 (9100007, 'Feteer with sugar and honey', 'فطير بالسكر والعسل', 'feteer sweet sokar', 'quarter', 140,
  [('flour', 250), ('ghee', 80), ('water', 120), ('sugar', 40), ('honey', 40)], 480),
 (9100008, 'Egg sandwich (baladi bread)', 'ساندوتش بيض', 'sandwich bayd', 'sandwich', 170, [('baladi', 90), ('egg', 60), ('oil', 7), ('tomato', 20)], None),
 (9100009, 'Fries sandwich (batates)', 'ساندوتش بطاطس', 'sandwich batates potato', 'sandwich', 200, [('baladi', 90), ('potato', 130), ('oil', 18)], 200),
 (9100010, 'Kofta sandwich', 'ساندوتش كفتة', 'sandwich kofta', 'sandwich', 210, [('baladi', 90), ('mince', 100), ('onion', 15), ('tahini', 10), ('tomato', 20)], 210),
 (9100011, 'Sogo2 sandwich (sausage)', 'ساندوتش سجق', 'sogo2 sogo sausage sandwich', 'sandwich', 200,
  [('baladi', 90), ('sausage', 90), ('pepper', 20), ('tomato', 20), ('oil', 5)], None),
 (9100012, 'Sogo2 eskandarani (sausage with peppers)', 'سجق اسكندراني', 'sogo2 sausage alexandrian', 'plate', 250,
  [('sausage', 200), ('pepper', 60), ('tomato', 60), ('onion', 40), ('oil', 10)], 330),
 (9100013, 'Meat shawarma sandwich', 'ساندوتش شاورما لحمة', 'shawerma lahma', 'sandwich', 220,
  [('baladi', 80), ('beef', 110), ('tahini', 15), ('onion', 15), ('tomato', 15), ('oil', 8)], 220),
 (9100014, 'Broasted chicken, 2 pieces', 'فراخ بروستد', 'broasted fried chicken', '2 pieces', 230,
  [('chicken', 200), ('flour', 25), ('egg', 15), ('oil', 25)], 230),
 (9100015, 'Crepe with chicken pane', 'كريب فراخ بانيه', 'crepe chicken', 'crepe', 280,
  [('flour', 60), ('egg', 25), ('milk', 80), ('breast', 110), ('crumbs', 20), ('oil', 20), ('mozz', 30)], 290),
 (9100016, 'Sweet crepe with chocolate', 'كريب نوتيلا', 'crepe nutella chocolate', 'crepe', 180,
  [('flour', 60), ('egg', 25), ('milk', 90), ('nutella', 45)], 190),
 # home cooking
 (9100101, 'Egyptian white rice', 'رز أبيض', 'roz abyad', 'cup', 180, [('rice', 400), ('ghee', 30), ('water', 700)], 1080),
 (9100102, 'Pasta with red sauce', 'مكرونة بالصلصة', 'makarona salsa', 'plate', 300,
  [('pasta', 500), ('tsauce', 400), ('onion', 80), ('oil', 40), ('garlic', 10)], 1700),
 (9100103, 'Pasta with minced meat sauce', 'مكرونة باللحمة المفرومة', 'makarona lahma mafroma bolognese', 'plate', 320,
  [('pasta', 500), ('mince', 400), ('tsauce', 400), ('onion', 100), ('oil', 30)], 2000),
 (9100104, 'Bazella (peas and carrots with meat)', 'بسلة بالجزر واللحمة', 'bazella besella peas stew', 'bowl', 300,
  [('peas', 500), ('carrot', 200), ('beef', 400), ('tsauce', 300), ('onion', 120), ('ghee', 30)], 1600),
 (9100105, 'Potatoes in tomato sauce with meat', 'بطاطس بالصلصة واللحمة', 'batates fel forn potato stew', 'bowl', 300,
  [('potato', 800), ('beef', 400), ('tsauce', 400), ('onion', 120), ('oil', 40)], 1700),
 (9100106, 'Zucchini with bechamel', 'كوسة بالبشاميل', 'kosa bechamel', 'piece', 250,
  [('zucchini', 800), ('mince', 300), ('milk', 700), ('flour', 70), ('butter', 60), ('onion', 80)], 1700),
 (9100107, 'Spinach stew with meat', 'سبانخ باللحمة', 'sabanekh spinach', 'bowl', 300,
  [('spinach', 700), ('beef', 300), ('onion', 100), ('garlic', 15), ('ghee', 30), ('rice', 40)], 1300),
 (9100108, 'Taro stew (kolkas)', 'قلقاس', 'kolkas colocasia', 'bowl', 300,
  [('taro', 800), ('beef', 300), ('spinach', 150), ('coriander', 40), ('garlic', 15), ('ghee', 30)], 1600),
 (9100109, 'Daoud basha (kofta in tomato sauce)', 'داوود باشا', 'daood pasha kofta salsa', 'plate', 280,
  [('mince', 500), ('onion', 120), ('tsauce', 400), ('oil', 30), ('crumbs', 30)], 1050),
 (9100110, 'Roast chicken with potatoes', 'فراخ في الفرن بالبطاطس', 'ferakh fel forn chicken potato', 'plate', 400,
  [('chicken', 900), ('potato', 700), ('onion', 150), ('oil', 40), ('tsauce', 150)], 1550),
 (9100111, 'Stuffed pigeon (hamam mahshi)', 'حمام محشي', 'hamam ma7shi pigeon', 'pigeon', 300,
  [('squab', 170), ('rice', 60), ('ghee', 10), ('onion', 15)], 300),
 (9100112, 'Baked fish (singari)', 'سمك سنجاري', 'samak singari', 'plate', 300,
  [('tilapia', 800), ('tomato', 300), ('pepper', 100), ('onion', 100), ('oil', 50), ('garlic', 15)], 1150),
 (9100113, 'Shrimp tagine', 'طاجن جمبري', 'gambari shrimp tagen', 'plate', 280,
  [('shrimp', 600), ('tsauce', 300), ('pepper', 100), ('onion', 100), ('oil', 40), ('garlic', 15)], 1000),
 (9100114, 'Fried calamari', 'كاليماري مقلي', 'calamari squid', 'plate', 220, [('squid', 400), ('flour', 60), ('oil', 50)], 420),
 (9100115, 'Liver with onions (kebda)', 'كبدة بالبصل', 'kebda liver', 'plate', 220, [('liver', 400), ('onion', 100), ('pepper', 60), ('oil', 30)], 430),
 (9100116, 'Molokhia with rabbit', 'ملوخية بالأرانب', 'molokhia arnab', 'plate', 450,
  [('jute', 300), ('rabbit', 350), ('ghee', 30), ('garlic', 25), ('coriander', 20), ('water', 400), ('rice', 120)], 1300),
 (9100117, 'Lentil with rice (koshari asfar)', 'كشري أصفر', 'koshari asfar yellow lentil rice', 'plate', 300,
  [('rice', 300), ('lentil', 400), ('oil', 40), ('onion', 80), ('water', 500)], 1350),
 # soups
 (9100201, 'Chicken soup with orzo', 'شوربة لسان عصفور', 'shorbet lesan asfour orzo soup', 'bowl', 300,
  [('dark', 200), ('pasta', 120), ('onion', 60), ('carrot', 60), ('water', 1400), ('ghee', 15)], 1700),
 (9100202, 'Vegetable soup', 'شوربة خضار', 'shorbet khodar', 'bowl', 300,
  [('potato', 200), ('carrot', 150), ('zucchini', 150), ('peas', 100), ('onion', 80), ('tsauce', 150), ('oil', 20), ('water', 900)], 1600),
 (9100203, 'Fish soup', 'شوربة سمك', 'shorbet samak', 'bowl', 300,
  [('tilapia', 400), ('shrimp', 100), ('tsauce', 200), ('rice', 60), ('onion', 80), ('oil', 25), ('water', 1000)], 1700),
 (9100204, 'Freekeh soup', 'شوربة فريك', 'freekeh soup', 'bowl', 300, [('wheat', 150), ('dark', 200), ('onion', 60), ('ghee', 15), ('water', 1300)], 1600),
 # salads and sides
 (9100301, 'Potato salad (Egyptian)', 'سلطة بطاطس', 'salatet batates', 'cup', 180, [('potato', 600), ('onion', 40), ('parsley', 20), ('oil', 40), ('lemon', 40), ('vinegar', 20)], 700),
 (9100302, 'Beet salad', 'سلطة بنجر', 'salatet bangar beetroot', 'cup', 150, [('beet', 500), ('oil', 15), ('vinegar', 30), ('garlic', 5)], 520),
 (9100303, 'Yogurt cucumber salad', 'سلطة زبادي بالخيار', 'salatet zabadi', 'cup', 200, [('yogurt', 500), ('cucumber', 250), ('mint', 10), ('garlic', 5)], None),
 (9100304, 'Fried eggplant', 'باذنجان مقلي', 'betengan ma2li eggplant', 'plate', 150, [('eggplant', 600), ('oil', 90), ('garlic', 10), ('vinegar', 20)], 520),
 (9100305, 'Fried cauliflower', 'قرنبيط مقلي', 'arnabit ma2li cauliflower', 'plate', 150, [('cauli', 500), ('flour', 40), ('egg', 50), ('oil', 70)], 560),
 (9100306, 'Egyptian fries', 'بطاطس مقلية', 'batates ma2leya french fries', 'plate', 150, [('potato', 500), ('oil', 55)], 330),
 # bakery
 (9100401, 'Goulash with meat (rokak)', 'جلاش باللحمة', 'goulash rokak phyllo meat', 'piece', 180,
  [('phyllo', 400), ('mince', 400), ('ghee', 100), ('onion', 80), ('milk', 150), ('egg', 50)], 1080),
 (9100402, 'Goulash with cheese', 'جلاش بالجبنة', 'goulash gebna cheese', 'piece', 160,
  [('phyllo', 400), ('gebna', 250), ('mozz', 150), ('ghee', 100), ('milk', 150), ('egg', 50)], 1040),
 (9100403, 'Sambousek with cheese', 'سمبوسك جبنة', 'sambousak cheese', '3 pieces', 90, [('flour', 250), ('oil', 120), ('gebna', 180), ('water', 90)], 640),
 (9100404, 'Sambousek with meat', 'سمبوسك لحمة', 'sambousak meat', '3 pieces', 90, [('flour', 250), ('oil', 120), ('mince', 200), ('onion', 50), ('water', 90)], 660),
 (9100405, 'Feteer pizza', 'فطيرة بيتزا', 'feteer pizza egyptian', 'quarter', 170,
  [('flour', 250), ('ghee', 50), ('water', 120), ('mozz', 120), ('pastrami', 60), ('pepper', 40), ('tsauce', 60)], 660),
 # sweets
 (9100501, 'Zalabya (lokma)', 'زلابية', 'zalabia lokmet el kady luqmat', '6 pieces', 90,
  [('flour', 250), ('water', 220), ('oil', 90), ('sugar', 150), ('honey', 30)], 680),
 (9100502, 'Ashura (wheat pudding)', 'عاشوراء', 'ashoura wheat pudding', 'bowl', 220,
  [('wheat', 150), ('milk', 700), ('sugar', 90), ('cornstarch', 20), ('raisin', 30), ('coconut', 15), ('almond', 15)], 1050),
 (9100503, 'Konafa with cream', 'كنافة بالقشطة', 'kunafa ishta cream', 'piece', 150,
  [('phyllo', 500), ('ghee', 150), ('cream', 250), ('milk', 250), ('cornstarch', 30), ('sugar', 250), ('water', 150)], 1450),
 (9100504, 'Basbousa with cream', 'بسبوسة بالقشطة', 'basbousa ishta', 'piece', 100,
  [('semolina', 400), ('sugar', 300), ('yogurt', 200), ('ghee', 120), ('cream', 200), ('coconut', 50), ('water', 150)], 1300),
 (9100505, 'Rice pudding with nuts', 'رز بلبن بالمكسرات', 'roz bel laban nuts', 'cup', 200,
  [('rice', 100), ('milk', 1000), ('sugar', 100), ('cornstarch', 15), ('pistachio', 25), ('almond', 25)], 1150),
 (9100506, 'Couscous with sugar (sweet)', 'كسكسي بالسكر', 'koskosi sweet couscous', 'bowl', 200,
  [('semolina', 250), ('ghee', 50), ('sugar', 60), ('raisin', 40), ('coconut', 20), ('milk', 150)], 680),
 (9100507, 'Kahk with agameya', 'كحك بالعجمية', 'kahk eid agameya', 'piece', 40,
  [('flour', 500), ('ghee', 300), ('sugar', 120), ('honey', 60), ('walnut', 40), ('milk', 120)], 1080),
 (9100508, 'Biscuits (baskot el eid)', 'بسكويت العيد', 'baskot eid biscuits', '3 pieces', 45,
  [('flour', 500), ('butter', 180), ('sugar', 200), ('egg', 100), ('milk', 100)], 980),
 (9100509, 'Petit four with chocolate', 'بيتي فور بالشوكولاتة', 'petit four', '3 pieces', 40, [('flour', 300), ('butter', 220), ('sugar', 100), ('nutella', 100), ('almond', 30)], 720),
 (9100510, 'Qatayef with cream (fried)', 'قطايف بالقشطة', 'atayef ishta', '2 pieces', 120,
  [('flour', 250), ('milk', 300), ('cream', 200), ('oil', 100), ('sugar', 200), ('water', 100)], 1050),
 (9100511, 'Om Ali with nuts', 'أم علي بالمكسرات', 'om ali', 'bowl', 220,
  [('puff', 300), ('milk', 900), ('cream', 150), ('sugar', 120), ('raisin', 50), ('coconut', 40), ('almond', 40), ('pistachio', 30)], 1500),
 (9100512, 'Ghorayeba', 'غريبة', 'ghorayeba shortbread', 'piece', 25, [('flour', 300), ('ghee', 200), ('sugar', 120)], 600),
 (9100513, 'Dates with tahini', 'بلح بالطحينة', 'balah tahina', '3 dates', 45, [('dates', 70), ('tahini', 15)], None),
 # drinks
 (9100601, 'Sugarcane juice', 'عصير قصب', 'aseer asab qasab sugar cane', 'glass', 300, [('sugarcane', 300)], None),
 (9100602, 'Fresh mango juice', 'عصير مانجو فريش', 'aseer mango', 'glass', 300, [('mango', 250), ('sugar', 25), ('water', 80)], None),
 (9100603, 'Lemonade (lamoon)', 'عصير ليمون', 'lamoon lemon juice', 'glass', 300, [('lemon', 60), ('sugar', 35), ('water', 230)], None),
 (9100604, 'Lemon mint (lamoon bel ne3na3)', 'ليمون بالنعناع', 'lemon mint', 'glass', 300, [('lemon', 60), ('sugar', 35), ('mint', 8), ('water', 220)], None),
 (9100605, 'Instant coffee with milk and sugar', 'نسكافيه باللبن', 'nescafe milk', 'mug', 250, [('coffee', 3), ('milk', 120), ('sugar', 12), ('water', 120)], None),
 (9100606, 'Tea with mint and sugar', 'شاي بالنعناع', 'shay ne3na3 mint tea', 'cup', 200, [('tea', 190), ('sugar', 10), ('mint', 3)], None),
 (9100607, 'Fenugreek drink (helba)', 'حلبة', 'helba', 'cup', 200, [('fenugreek', 6), ('sugar', 10), ('water', 190)], None),
 (9100608, 'Carob drink (kharoub)', 'خروب', 'kharoub carob', 'glass', 250, [('carob', 30), ('sugar', 20), ('water', 220)], None),
 (9100609, 'Ginger and cinnamon (hot drink)', 'جنزبيل بالقرفة', 'ganzabeel erfa', 'cup', 200, [('ginger', 8), ('cinnamon', 2), ('sugar', 10), ('water', 190)], None),
 (9100610, 'Dates milkshake', 'ميلك شيك بلح', 'balah milkshake', 'glass', 300, [('dates', 60), ('milk', 240)], None),
]

out = []
for rid, name, ar, alt, serving, sg, ings, cooked in R:
    tot = [0.0] * len(d['keys']); seen = [False] * len(d['keys']); raw_w = 0
    for key, g in ings:
        raw_w += g
        if I[key] is None: continue  # water
        n = by[I[key]][3]
        for i, v in enumerate(n):
            if v is not None: tot[i] += v * g / 100; seen[i] = True
    w = cooked or raw_w
    n100 = [round(t * 100 / w, 3) if s else None for t, s in zip(tot, seen)]
    out.append({'id': rid, 'name': name + ' · ' + ar, 'n': n100, 'por': [['1 ' + serving, sg], ['100 g', 100]], 'pop': 0.5,
                'alt': alt + ' ' + ar, 'ar': ar, 'on': name, 'recipe': [[by[I[k]][1] if I[k] else 'Water', g] for k, g in ings]})
json.dump(out, open(os.path.join(os.path.dirname(__file__), 'egypt-dishes.json'), 'w'), ensure_ascii=False, indent=0)
for o in out: print('%-45s %4.0f kcal/100g  1 %s = %4.0f kcal' % (o['name'][:45], o['n'][0], o['por'][0][0], o['n'][0] * o['por'][0][1] / 100))
print(len(out), 'dishes')
