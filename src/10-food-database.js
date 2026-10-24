  /* ================= Food database ================= */
  // [id, item, place, grams, kcal, protein, carbs, fat, serving name, other words (Arabic etc.)]. Restaurant estimates.
  // More Egyptian home cooking: estimates per serving. [id, name, '', grams, kcal, protein, carbs, fat, serving, words]
  // More home-style dishes from Egypt, the Gulf, the Levant, Turkey and Morocco, plus a few everyday extras (estimates).
  const EGYPT_MORE2 = [
    ['ex01', 'Rumi cheese', '', 30, 113, 7.5, 0.5, 9, 'slice', 'جبنة رومي gebna romy roumy'],
    ['ex02', 'Istanbuli cheese', '', 30, 78, 4, 1, 6.5, 'portion', 'جبنة اسطنبولي istanbouli'],
    ['ex03', 'Halloumi cheese', '', 30, 96, 6.5, 0.6, 7.5, 'slice', 'حلوم حلومي hallomi'],
    ['ex04', 'Shami bread', '', 75, 201, 6.8, 40, 1.5, 'loaf', 'عيش شامي shamy'],
    ['ex05', 'Fino bread', '', 60, 172, 5.5, 32, 2.5, 'roll', 'عيش فينو feeno'],
    ['ex06', 'Simit (semeet)', '', 100, 314, 10, 55, 6, 'piece', 'سميط semit'],
    ['ex07', 'Aish shamsi', '', 100, 250, 9, 50, 1.5, 'loaf', 'عيش شمسي sun bread'],
    ['ex08', 'Chicken kabsa', '', 450, 690, 38, 85, 22, 'plate', 'كبسة فراخ kabsah'],
    ['ex09', 'Meat kabsa', '', 450, 752, 40, 85, 28, 'plate', 'كبسة لحم kabsah lamb'],
    ['ex10', 'Chicken mandi', '', 450, 736, 42, 88, 24, 'plate', 'مندي فراخ mandy'],
    ['ex11', 'Meat mandi', '', 450, 804, 44, 85, 32, 'plate', 'مندي لحم mandy lamb'],
    ['ex12', 'Machboos', '', 450, 718, 40, 90, 22, 'plate', 'مجبوس majboos'],
    ['ex13', 'Harees', '', 300, 370, 22, 48, 10, 'bowl', 'هريس hareis'],
    ['ex14', 'Jareesh', '', 300, 341, 15, 50, 9, 'bowl', 'جريش jarish'],
    ['ex15', 'Saloona (Gulf stew)', '', 300, 260, 20, 18, 12, 'bowl', 'صالونة'],
    ['ex16', 'Thareed', '', 350, 464, 25, 55, 16, 'bowl', 'ثريد tharid'],
    ['ex17', 'Balaleet', '', 200, 388, 10, 60, 12, 'plate', 'بلاليط'],
    ['ex18', 'Luqaimat', '', 100, 371, 4, 55, 15, '5 pieces', 'لقيمات loqaimat lugaimat'],
    ['ex19', 'Chebab (Emirati pancake)', '', 80, 214, 5, 35, 6, 'piece', 'جباب'],
    ['ex20', 'Regag bread', '', 40, 136, 3, 22, 4, 'piece', 'رقاق'],
    ['ex21', 'Fattoush', '', 250, 230, 4, 22, 14, 'bowl', 'فتوش fatoush'],
    ['ex22', 'Muhammara', '', 40, 108, 2, 7, 8, '2 tbsp', 'محمرة mhammara'],
    ['ex23', 'Mutabal', '', 50, 76, 1.5, 4, 6, '2 tbsp', 'متبل moutabal'],
    ['ex24', 'Manakish zaatar', '', 130, 436, 9, 55, 20, 'piece', 'مناقيش زعتر manaeesh manousheh'],
    ['ex25', 'Manakish cheese', '', 150, 468, 17, 55, 20, 'piece', 'مناقيش جبنة'],
    ['ex26', 'Sfeeha (meat pie)', '', 60, 172, 7, 18, 8, 'piece', 'صفيحة sfiha'],
    ['ex27', 'Spinach fatayer', '', 80, 195, 5, 28, 7, 'piece', 'فطاير سبانخ fatayer'],
    ['ex28', 'Kibbeh, fried', '', 60, 165, 7, 14, 9, 'piece', 'كبة kibbe kobeba'],
    ['ex29', 'Maqluba', '', 400, 590, 28, 70, 22, 'plate', 'مقلوبة maklouba'],
    ['ex30', 'Mansaf', '', 450, 795, 45, 75, 35, 'plate', 'منسف'],
    ['ex31', 'Musakhan', '', 200, 426, 22, 35, 22, 'piece', 'مسخن msakhan'],
    ['ex32', 'Shish barak', '', 300, 375, 20, 40, 15, 'bowl', 'شيش برك'],
    ['ex33', 'Arayes', '', 150, 390, 18, 30, 22, 'piece', 'عرايس araies'],
    ['ex34', 'Labneh balls in oil', '', 60, 140, 5, 3, 12, '3 balls', 'كرات لبنة'],
    ['ex35', 'Zaatar with olive oil', '', 15, 73, 0.5, 2, 7, 'tbsp', 'زعتر بالزيت'],
    ['ex36', 'Knafeh nabulsi', '', 150, 466, 12, 55, 22, 'piece', 'كنافة نابلسية kunafa nabulsia'],
    ['ex38', 'Halawet el jibn', '', 100, 289, 7, 45, 9, '2 pieces', 'حلاوة الجبن'],
    ['ex39', 'Lahmacun', '', 120, 290, 12, 38, 10, 'piece', 'لحم بعجين lahm bi ajeen'],
    ['ex40', 'Cheese pide', '', 250, 618, 25, 80, 22, 'piece', 'بيدا pida'],
    ['ex41', 'Doner kebab wrap', '', 300, 573, 32, 55, 25, 'wrap', 'دونر doner'],
    ['ex42', 'Gozleme', '', 200, 420, 14, 55, 16, 'piece', 'جوزلمة gözleme'],
    ['ex43', 'Adana kebab', '', 150, 333, 25, 2, 25, 'skewer', 'كباب أضنة'],
    ['ex44', 'Dukkah', '', 10, 56, 2, 2, 4.5, 'tbsp', 'دقة duqqa dukka'],
    ['ex45', 'Torshi (mixed pickles)', '', 50, 11, 0.5, 2, 0.1, 'portion', 'طرشي mekhalel مخلل pickles'],
    ['ex46', 'Fesikh', '', 100, 220, 28, 0, 12, 'portion', 'فسيخ feseekh'],
    ['ex47', 'Renga (smoked herring)', '', 100, 196, 22, 0, 12, 'portion', 'رنجة ringa herring'],
    ['ex48', 'Freekeh, cooked', '', 160, 234, 8, 46, 2, 'cup', 'فريك freek'],
    ['ex49', 'Freekeh with chicken', '', 400, 612, 38, 70, 20, 'plate', 'فريك بالفراخ'],
    ['ex50', 'Chicken escalope, breaded', '', 150, 328, 28, 18, 16, 'piece', 'اسكالوب فراخ escalop'],
    ['ex51', 'Beef escalope pane', '', 150, 338, 26, 18, 18, 'piece', 'اسكالوب بانيه لحم'],
    ['ex53', 'Kebab (grilled lamb)', '', 100, 284, 26, 0, 20, 'portion', 'كباب kabab'],
    ['ex54', 'Fatta with meat', '', 450, 835, 40, 90, 35, 'plate', 'فتة باللحمة fattah'],
    ['ex55', 'Mombar', '', 100, 270, 6, 30, 14, 'portion', 'ممبار mumbar'],
    ['ex56', 'Bisara', '', 250, 268, 14, 35, 8, 'bowl', 'بصارة besara'],
    ['ex57', 'Mesaqaa (Egyptian moussaka)', '', 250, 250, 4, 18, 18, 'plate', 'مسقعة msa2a3a moussaka'],
    ['ex58', 'Lisan asfour with meat (orzo)', '', 350, 500, 25, 55, 20, 'plate', 'طاجن لسان عصفور'],
    ['ex59', 'Roz meammar', '', 250, 414, 8, 55, 18, 'plate', 'رز معمر'],
    ['ex60', 'Mehalabeya', '', 150, 193, 5, 32, 5, 'cup', 'مهلبية muhallebi'],
    ['ex61', 'Balah el sham', '', 100, 358, 4, 45, 18, '4 pieces', 'بلح الشام'],
    ['ex62', 'Meshabek', '', 60, 240, 2, 40, 8, '2 pieces', 'مشبك'],
    ['ex63', 'Harissa (semolina cake)', '', 80, 273, 3, 45, 9, 'piece', 'هريسة'],
    ['ex64', 'Ful with eggs', '', 250, 300, 18, 30, 12, 'plate', 'فول بالبيض'],
    ['ex65', 'Eggs with pastrami', '', 150, 286, 20, 2, 22, '2 eggs', 'بيض بالبسطرمة'],
    ['ex66', 'Eid biscuits (baskot)', '', 45, 205, 3, 28, 9, '3 pieces', 'بسكويت العيد'],
    ['ex67', 'Petit four', '', 40, 196, 2.5, 24, 10, '3 pieces', 'بيتي فور'],
    ['ex68', 'Tamr hindi drink', '', 250, 184, 0.5, 45, 0.2, 'glass', 'تمر هندي tamarind'],
    ['ex69', 'Erk soos (licorice drink)', '', 250, 101, 0.3, 25, 0, 'glass', 'عرقسوس'],
    ['ex70', 'Hummus el sham (hot chickpea drink)', '', 250, 183, 9, 30, 3, 'cup', 'حمص الشام'],
    ['ex71', 'Lemon mint juice', '', 300, 144, 0.5, 35, 0.2, 'glass', 'ليمون نعناع'],
    ['ex72', 'Turkish coffee, no sugar', '', 60, 8, 0.5, 1, 0.2, 'cup', 'قهوة تركي سادة'],
    ['ex73', 'Turkish coffee with sugar', '', 60, 28, 0.5, 6, 0.2, 'cup', 'قهوة تركي مظبوط'],
    ['ex74', 'Guava juice', '', 250, 160, 1, 38, 0.5, 'glass', 'عصير جوافة'],
    ['ex75', 'Strawberry juice', '', 250, 168, 1, 40, 0.5, 'glass', 'عصير فراولة'],
    ['ex76', 'Harira', '', 300, 222, 12, 30, 6, 'bowl', 'حريرة'],
    ['ex77', 'Chicken tagine', '', 350, 418, 35, 20, 22, 'plate', 'طاجين فراخ tajine'],
    ['ex78', 'Couscous with meat and vegetables', '', 400, 602, 30, 80, 18, 'plate', 'كسكسي couscous royal'],
    ['ex79', 'Msemen', '', 90, 292, 6, 40, 12, 'piece', 'مسمن'],
    ['ex80', 'Pastilla', '', 200, 458, 20, 45, 22, 'piece', 'بسطيلة bastilla'],
    ['ex81', 'Baghrir', '', 60, 114, 3, 22, 1.5, 'piece', 'بغرير'],
    ['ex82', 'Creatine monohydrate', '', 5, 0, 0, 0, 0, 'scoop', 'كرياتين creatin'],
    ['ex83', 'Whey protein, 1 scoop', '', 30, 122, 24, 3, 1.5, 'scoop', 'واي بروتين whey'],
    ['ex84', 'Mixed grill', '', 350, 660, 70, 5, 40, 'plate', 'مشويات مشكلة'],
    ['ex85', 'Tarb', '', 100, 324, 18, 0, 28, 'portion', 'طرب'],
    ['ex86', 'Risotto', '', 300, 364, 9, 55, 12, 'plate', 'ريزوتو'],
    ['ex87', 'Sogo2 (Alexandrian sausage)', '', 100, 297, 14, 4, 25, 'portion', 'سجق اسكندراني sausage'],
    ['ex88', 'Liver, Alexandrian style', '', 150, 270, 30, 6, 14, 'portion', 'كبدة اسكندراني'],
    ['ex90', 'Fish sayadeya rice', '', 250, 333, 8, 55, 9, 'plate', 'رز صيادية'],
    ['ex91', 'Camel meat, cooked', '', 100, 174, 30, 0, 6, 'portion', 'لحم جمل لحمة جملي camel']
  ];
  // KFC, McDonald's, Hardee's, Pizza Hut, Bazooka, Zooba and Willy's Kitchen (estimates for a typical serving).
  // More chains (v1.38): estimates per serving from typical published menus.
  const RESTAURANTS3 = [
    ['rxt1', 'Foul sandwich', 'El Tabei', 150, 300, 12, 45, 8, 'sandwich', 'فول ساندوتش الطابعي الدمياطي tabei tabie tabaei domiati'],
    ['rxt2', 'Taameya sandwich', 'El Tabei', 150, 380, 11, 45, 17, 'sandwich', 'طعمية فلافل ساندوتش الطابعي tabei falafel'],
    ['rxt3', 'Taameya, 1 piece', 'El Tabei', 30, 100, 3, 8, 6, 'piece', 'طعمية فلافل قرص الطابعي tabei falafel'],
    ['rxt4', 'Foul plate', 'El Tabei', 250, 300, 17, 35, 10, 'plate', 'طبق فول الطابعي tabei'],
    ['rxt5', 'Foul Iskandarani', 'El Tabei', 250, 340, 17, 36, 14, 'plate', 'فول اسكندراني الطابعي tabei'],
    ['rxt6', 'Shakshuka sandwich', 'El Tabei', 150, 320, 14, 35, 13, 'sandwich', 'شكشوكة بيض ساندوتش الطابعي tabei egg'],
    ['rxt7', 'Fries sandwich', 'El Tabei', 150, 380, 7, 55, 15, 'sandwich', 'بطاطس ساندوتش الطابعي tabei potato'],
    ['rxt8', 'Eggplant sandwich', 'El Tabei', 150, 350, 6, 40, 18, 'sandwich', 'بتنجان مقلي ساندوتش الطابعي tabei aubergine betengan'],
    ['rxt9', 'Tahini salad', 'El Tabei', 50, 150, 4, 4, 13, 'side', 'طحينة الطابعي tabei tahina'],
    ['rxt10', 'Baba ghanoug', 'El Tabei', 100, 120, 2, 8, 9, 'side', 'بابا غنوج الطابعي tabei'],
    ['rxb1', 'Whopper', 'Burger King', 290, 660, 28, 49, 40, 'sandwich', 'وابر برجر كنج burgerking bk'],
    ['rxb2', 'Whopper Jr', 'Burger King', 150, 330, 15, 28, 18, 'sandwich', 'وابر جونيور برجر كنج burgerking bk junior'],
    ['rxb3', 'Double Whopper', 'Burger King', 373, 900, 48, 49, 57, 'sandwich', 'دبل وابر برجر كنج burgerking bk'],
    ['rxb4', 'Cheeseburger', 'Burger King', 120, 300, 16, 30, 13, 'sandwich', 'تشيز برجر برجر كنج burgerking bk'],
    ['rxb5', 'Chicken Royale', 'Burger King', 205, 570, 24, 50, 30, 'sandwich', 'تشيكن رويال برجر كنج burgerking bk'],
    ['rxb6', 'Big King', 'Burger King', 210, 520, 27, 40, 28, 'sandwich', 'بيج كنج برجر كنج burgerking bk'],
    ['rxb7', 'Chicken Nuggets, 6 pieces', 'Burger King', 90, 260, 13, 16, 16, 'box', 'ناجتس برجر كنج burgerking bk nuggets'],
    ['rxb8', 'Fries, medium', 'Burger King', 116, 370, 4, 49, 17, 'medium', 'بطاطس برجر كنج burgerking bk potato'],
    ['rxb9', 'Onion Rings, medium', 'Burger King', 91, 320, 4, 37, 17, 'medium', 'حلقات بصل برجر كنج burgerking bk'],
    ['rxd1', 'Margherita, 1 slice (medium pizza)', "Domino's", 80, 190, 8, 24, 7, 'slice', 'مارجريتا بيتزا دومينوز dominos pizza'],
    ['rxd2', 'Pepperoni, 1 slice (medium pizza)', "Domino's", 85, 220, 9, 24, 10, 'slice', 'بيبروني بيتزا دومينوز dominos pizza'],
    ['rxd3', 'BBQ Chicken, 1 slice (medium pizza)', "Domino's", 95, 220, 11, 26, 8, 'slice', 'باربكيو فراخ بيتزا دومينوز dominos pizza'],
    ['rxd4', 'Super Supreme, 1 slice (medium pizza)', "Domino's", 105, 240, 10, 25, 11, 'slice', 'سوبر سوبريم بيتزا دومينوز dominos pizza'],
    ['rxd5', 'Vegetarian, 1 slice (medium pizza)', "Domino's", 95, 180, 7, 25, 6, 'slice', 'خضار فيجيتيريان بيتزا دومينوز dominos pizza veggie'],
    ['rxd6', 'Cheesy bread, 1 piece', "Domino's", 35, 110, 4, 12, 5, 'piece', 'خبز بالجبنة دومينوز dominos garlic'],
    ['rxp1', 'Cheese, 1 slice (large pizza)', "Papa John's", 110, 280, 11, 34, 11, 'slice', 'جبنة بيتزا بابا جونز papajohns pizza margherita'],
    ['rxp2', 'Pepperoni, 1 slice (large pizza)', "Papa John's", 115, 310, 13, 34, 13, 'slice', 'بيبروني بيتزا بابا جونز papajohns pizza'],
    ['rxp3', 'BBQ Chicken, 1 slice (large pizza)', "Papa John's", 125, 300, 14, 38, 10, 'slice', 'باربكيو فراخ بيتزا بابا جونز papajohns pizza'],
    ['rxp4', 'Garden Special, 1 slice (large pizza)', "Papa John's", 125, 260, 10, 34, 9, 'slice', 'خضار بيتزا بابا جونز papajohns pizza veggie'],
    ['rxp5', 'Garlic sauce', "Papa John's", 28, 150, 0, 0, 17, 'cup', 'صوص ثوم بابا جونز papajohns dip'],
    ['rxs1', 'Caffè Latte, grande', 'Starbucks', 473, 220, 12, 18, 11, 'grande', 'لاتيه ستاربكس starbucks latte coffee'],
    ['rxs2', 'Cappuccino, grande', 'Starbucks', 473, 140, 8, 12, 7, 'grande', 'كابتشينو ستاربكس starbucks coffee'],
    ['rxs3', 'Caramel Macchiato, grande', 'Starbucks', 473, 250, 10, 35, 7, 'grande', 'كراميل ماكياتو ستاربكس starbucks coffee'],
    ['rxs4', 'Caffè Mocha, grande', 'Starbucks', 473, 370, 13, 43, 15, 'grande', 'موكا ستاربكس starbucks coffee'],
    ['rxs5', 'White Chocolate Mocha, grande', 'Starbucks', 473, 430, 14, 53, 18, 'grande', 'وايت موكا ستاربكس starbucks coffee'],
    ['rxs6', 'Spanish Latte, grande', 'Starbucks', 473, 330, 12, 44, 12, 'grande', 'سبانش لاتيه ستاربكس starbucks coffee'],
    ['rxs7', 'Caramel Frappuccino, grande', 'Starbucks', 473, 380, 5, 55, 16, 'grande', 'فرابتشينو كراميل ستاربكس starbucks frappe'],
    ['rxs8', 'Java Chip Frappuccino, grande', 'Starbucks', 473, 440, 6, 63, 19, 'grande', 'جافا تشيب فرابتشينو ستاربكس starbucks frappe'],
    ['rxs9', 'Americano, grande', 'Starbucks', 473, 15, 1, 2, 0, 'grande', 'امريكانو ستاربكس starbucks coffee'],
    ['rxs10', 'Butter croissant', 'Starbucks', 68, 260, 5, 30, 14, 'piece', 'كرواسون ستاربكس starbucks'],
    ['rxs11', 'Chocolate croissant', 'Starbucks', 75, 300, 5, 33, 16, 'piece', 'كرواسون شوكولاتة ستاربكس starbucks'],
    ['rxs12', 'Blueberry muffin', 'Starbucks', 113, 360, 5, 52, 15, 'piece', 'مافن توت ستاربكس starbucks'],
    ['rxc1', 'Latte, medio', 'Costa', 360, 185, 11, 17, 8, 'medio', 'لاتيه كوستا costa coffee'],
    ['rxc2', 'Cappuccino, medio', 'Costa', 360, 140, 8, 11, 7, 'medio', 'كابتشينو كوستا costa coffee'],
    ['rxc3', 'Flat White', 'Costa', 220, 140, 8, 10, 7, 'cup', 'فلات وايت كوستا costa coffee'],
    ['rxc4', 'Americano, medio', 'Costa', 360, 10, 1, 1, 0, 'medio', 'امريكانو كوستا costa coffee'],
    ['rxc5', 'Mocha, medio', 'Costa', 360, 260, 11, 30, 10, 'medio', 'موكا كوستا costa coffee'],
    ['rxc6', 'Caramel Latte, medio', 'Costa', 360, 240, 10, 31, 8, 'medio', 'كراميل لاتيه كوستا costa coffee'],
    ['rxc7', 'Caramel Frostino, medio', 'Costa', 400, 300, 4, 50, 9, 'medio', 'فروستينو كراميل كوستا costa frappe'],
    ['rxc8', 'Hot Chocolate, medio', 'Costa', 360, 270, 11, 36, 9, 'medio', 'هوت شوكليت كوستا costa cocoa'],
    ['rxl1', 'Latte, medium', 'Cilantro', 350, 180, 10, 15, 9, 'medium', 'لاتيه سيلانترو cilantro coffee'],
    ['rxl2', 'Spanish Latte, medium', 'Cilantro', 350, 290, 10, 40, 10, 'medium', 'سبانش لاتيه سيلانترو cilantro coffee'],
    ['rxl3', 'Iced Caramel Latte, medium', 'Cilantro', 400, 250, 8, 36, 8, 'medium', 'ايس كراميل لاتيه سيلانترو cilantro coffee'],
    ['rxl4', 'Hot Chocolate, medium', 'Cilantro', 350, 300, 10, 40, 11, 'medium', 'هوت شوكليت سيلانترو cilantro cocoa'],
    ['rxl5', 'Turkey & cheese croissant', 'Cilantro', 150, 420, 18, 35, 23, 'piece', 'كرواسون تركي جبنة سيلانترو cilantro sandwich'],
    ['rxl6', 'Chicken pesto sandwich', 'Cilantro', 200, 480, 25, 45, 22, 'sandwich', 'ساندوتش فراخ بيستو سيلانترو cilantro'],
    ['rxl7', 'Chocolate chip cookie', 'Cilantro', 70, 330, 4, 42, 16, 'piece', 'كوكيز سيلانترو cilantro'],
    ['rxl8', 'Mango smoothie', 'Cilantro', 400, 260, 2, 62, 1, 'cup', 'سموزي مانجو سيلانترو cilantro'],
    ['rxn1', 'Glazed donut', "Dunkin'", 60, 240, 4, 33, 11, 'piece', 'دونات جليزد دانكن دونتس dunkin donuts doughnut'],
    ['rxn2', 'Chocolate frosted donut', "Dunkin'", 66, 270, 4, 35, 13, 'piece', 'دونات شوكولاتة دانكن دونتس dunkin donuts doughnut'],
    ['rxn3', 'Boston Kreme donut', "Dunkin'", 85, 300, 4, 40, 14, 'piece', 'دونات بوسطن كريم دانكن دونتس dunkin donuts doughnut'],
    ['rxn4', 'Strawberry frosted donut', "Dunkin'", 67, 270, 3, 35, 13, 'piece', 'دونات فراولة دانكن دونتس dunkin donuts doughnut'],
    ['rxn5', 'Munchkins, 5 glazed', "Dunkin'", 75, 300, 4, 40, 14, 'box', 'مانشكينز دانكن دونتس dunkin donuts'],
    ['rxn6', 'Latte, medium', "Dunkin'", 400, 210, 11, 17, 11, 'medium', 'لاتيه دانكن دونتس dunkin donuts coffee'],
    ['rxn7', 'Iced coffee with milk & sugar, medium', "Dunkin'", 450, 150, 2, 30, 2, 'medium', 'ايس كوفي دانكن دونتس dunkin donuts'],
    ['rxk1', 'Ice cream, 1 scoop', 'Koueider', 70, 150, 3, 18, 7, 'scoop', 'ايس كريم كويدر koueider gelato'],
    ['rxk2', 'Ice cream cone, 2 scoops', 'Koueider', 160, 340, 6, 44, 16, 'cone', 'ايس كريم كون كويدر koueider gelato'],
    ['rxk3', 'Basbousa, 1 piece', 'Koueider', 80, 300, 4, 45, 12, 'piece', 'بسبوسة كويدر koueider'],
    ['rxk4', 'Konafa with cream, 1 piece', 'Koueider', 100, 380, 6, 42, 21, 'piece', 'كنافة بالقشطة كويدر koueider kunafa'],
    ['rxk5', 'Baklava, 1 piece', 'Koueider', 40, 180, 3, 20, 10, 'piece', 'بقلاوة كويدر koueider'],
    ['rxk6', 'Om Ali', 'Koueider', 250, 550, 12, 60, 29, 'bowl', 'ام علي كويدر koueider'],
    ['rxk7', 'Ghorayeba, 1 piece', 'Koueider', 25, 130, 1.5, 14, 8, 'piece', 'غريبة كويدر koueider cookie'],
    ['rxk8', 'Petit four, 1 piece', 'Koueider', 15, 75, 1, 9, 4, 'piece', 'بيتي فور كويدر koueider cookie']
  ];
  // Popular Egyptian packaged products (v1.38): typical label values per pack or serving.
  const PACKAGED_EG = [
    ['pk1', 'White Cheese (Feta)', 'Domty', 30, 75, 3.5, 1, 6.3, 'slice', 'جبنة بيضاء فيتا دومتي'],
    ['pk2', 'Istanbuli Cheese', 'Domty', 30, 80, 3.5, 1, 7, 'slice', 'جبنة اسطنبولي دومتي'],
    ['pk3', 'Feta Light', 'Domty', 30, 50, 4, 1.5, 3, 'slice', 'جبنة فيتا لايت دومتي'],
    ['pk4', 'Rumi Cheese', 'Domty', 30, 110, 7.5, 0.5, 9, 'slice', 'جبنة رومي دومتي roumy romy'],
    ['pk5', 'Mozzarella', 'Domty', 30, 85, 6, 1, 6.5, 'slice', 'موتزاريلا دومتي'],
    ['pk6', 'Cheddar slice', 'Domty', 20, 60, 3, 1.5, 4.8, 'slice', 'شيدر شرايح دومتي'],
    ['pk7', 'Cream cheese portion', 'Domty', 25, 60, 2, 1.5, 5, 'portion', 'جبنة كريمي مثلثات دومتي'],
    ['pk8', 'Mango juice', 'Domty', 235, 125, 0, 31, 0, 'pack', 'عصير مانجو دومتي'],
    ['pk9', 'Croissant Chocolate', 'Molto', 60, 260, 4, 30, 13.5, 'piece', 'مولتو كرواسون شوكولاتة ايديتا edita'],
    ['pk11', 'Mini', 'Molto', 25, 110, 2, 13, 5.5, 'piece', 'مولتو ميني ايديتا edita'],
    ['pk12', 'Patisserie Cheese', 'Molto', 75, 290, 6, 32, 15, 'piece', 'مولتو باتيسري جبنة ايديتا edita'],
    ['pk13', 'Cake Chocolate', 'Todo', 45, 190, 2, 25, 9, 'piece', 'تودو كيك شوكولاتة ايديتا edita'],
    ['pk14', 'Cake Vanilla', 'Twinkies', 40, 150, 1.5, 24, 5.5, 'piece', 'توينكيز ايديتا edita'],
    ['pk15', 'Cream Roll', 'HoHos', 33, 145, 1.5, 19, 7, 'piece', 'هوهوز ايديتا edita'],
    ['pk16', 'Pizza', 'Bake Rolz', 40, 190, 4.5, 27, 7, 'bag', 'بيك رولز بيتزا ايديتا edita bakerolz'],
    ['pk17', 'Sticks Salt', 'Bake Stix', 40, 180, 4.5, 27, 6, 'bag', 'بيك ستيكس ايديتا edita bakestix'],
    ['pk18', 'Wafer Chocolate', 'Freska', 30, 160, 2, 19, 8.5, 'piece', 'فريسكا ويفر ايديتا edita'],
    ['pk19', 'Salt', 'Chipsy', 45, 245, 3, 24, 15.5, 'bag', 'شيبسي ملح'],
    ['pk20', 'Cheese', 'Chipsy', 45, 245, 3, 24, 15.5, 'bag', 'شيبسي جبنة'],
    ['pk21', 'Tomato Ketchup', 'Chipsy', 45, 240, 3, 25, 15, 'bag', 'شيبسي طماطم كاتشب'],
    ['pk22', 'Chili & Lemon', 'Chipsy', 45, 240, 3, 25, 15, 'bag', 'شيبسي شطة ليمون'],
    ['pk23', 'Kebab', 'Chipsy', 45, 240, 3, 25, 15, 'bag', 'شيبسي كباب'],
    ['pk24', 'Forno Baked', 'Chipsy', 40, 170, 3, 28, 5, 'bag', 'شيبسي فورنو'],
    ['pk27', 'Cheese', 'Cheetos', 25, 135, 1.5, 15, 7.5, 'bag', 'شيتوس جبنة'],
    ['pk28', 'Baked Bites', 'Sun Bites', 40, 195, 3, 25, 9, 'bag', 'صن بايتس'],
    ['pk29', 'Pineapple malt drink', 'Fayrouz', 330, 140, 0, 35, 0, 'can', 'فيروز اناناس'],
    ['pk30', 'Apple malt drink', 'Fayrouz', 330, 145, 0, 36, 0, 'can', 'فيروز تفاح'],
    ['pk31', 'Peach malt drink', 'Fayrouz', 330, 145, 0, 36, 0, 'can', 'فيروز خوخ'],
    ['pk32', 'Mango juice', 'Beyti', 235, 130, 0.3, 31, 0, 'pack', 'عصير مانجو بيتي'],
    ['pk33', 'Full cream milk', 'Beyti', 200, 125, 6.4, 9.4, 7, 'pack', 'لبن كامل الدسم بيتي'],
    ['pk34', 'Plain yogurt', 'Beyti', 105, 75, 4, 5, 4, 'cup', 'زبادي بيتي'],
    ['pk35', 'Istanbuli Cheese', 'Obour Land', 30, 80, 3.5, 1, 7, 'slice', 'جبنة اسطنبولي عبور لاند obourland'],
    ['pk36', 'White Cheese (Feta)', 'Obour Land', 30, 70, 3, 1, 6, 'slice', 'جبنة بيضاء فيتا عبور لاند obourland'],
    ['pk37', 'Full cream milk', 'Obour Land', 200, 125, 6.4, 9.4, 7, 'pack', 'لبن كامل الدسم عبور لاند obourland'],
    ['pk38', 'Plain yogurt', 'Obour Land', 100, 65, 3.5, 5, 3.4, 'cup', 'زبادي عبور لاند obourland'],
    ['pk39', 'Tea Biscuits', 'Bisco Misr', 40, 180, 3, 30, 5.5, 'pack', 'بسكويت شاي بسكو مصر biscomisr'],
    ['pk40', 'Datto date bar', 'Bisco Misr', 40, 160, 2, 28, 4.5, 'piece', 'داتو عجوة بسكو مصر biscomisr'],
    ['pk41', 'Petit Four', 'Bisco Misr', 50, 260, 3.5, 30, 14, 'pack', 'بيتي فور بسكو مصر biscomisr'],
    ['pk42', 'Milk Chocolate', 'Corona', 35, 190, 2.5, 20, 11, 'bar', 'شوكولاتة باللبن كورونا'],
    ['pk43', 'Hazelnut Chocolate', 'Corona', 35, 195, 3, 18, 12.5, 'bar', 'شوكولاتة بندق كورونا'],
    ['pk44', 'Tahini', 'El Rashidi', 15, 95, 2.7, 3, 8.5, 'tbsp', 'طحينة الرشيدي الميزان rashidi mizan'],
    ['pk45', 'Halawa', 'El Rashidi', 50, 260, 6, 26, 15, 'slice', 'حلاوة طحينية الرشيدي الميزان rashidi mizan halva'],
    ['pk46', 'Honey', 'El Rashidi', 21, 64, 0, 17, 0, 'tbsp', 'عسل الرشيدي الميزان rashidi mizan'],
    ['pk47', 'Beef luncheon', 'Halwani', 30, 70, 3.5, 1.5, 5.5, 'slices', 'لانشون حلواني halwani bros'],
    ['pk48', 'Oats', 'Isis', 40, 150, 5, 25, 3, 'serving', 'شوفان ايزيس'],
    ['pk50', 'Rayeb', 'Juhayna', 250, 150, 8, 12, 8, 'bottle', 'رايب جهينة laban'],
    ['pk51', 'Chocolate wafer', 'Lion', 30, 150, 1.5, 19, 7.5, 'bar', 'ليون ويفر شوكولاتة'],
    ['pk52', 'Cream Cheese', 'Lamar', 25, 60, 2, 1.5, 5, 'portion', 'جبنة كريمي لمار']
  ];
  const RESTAURANTS2 = [
    ['rmc1', 'Big Mac', "McDonald's", 219, 550, 25, 45, 30, 'sandwich', 'بيج ماك ماكدونالدز mcdonalds macdonalds'],
    ['rmc2', 'Cheeseburger', "McDonald's", 114, 305, 15, 32, 13, 'sandwich', 'تشيز برجر ماكدونالدز mcdonalds'],
    ['rmc3', 'McChicken', "McDonald's", 147, 387, 14, 40, 19, 'sandwich', 'ماك تشيكن ماكدونالدز mcdonalds'],
    ['rmc4', 'Big Tasty', "McDonald's", 310, 753, 42, 45, 45, 'sandwich', 'بيج تيستي ماكدونالدز mcdonalds'],
    ['rmc5', 'Chicken McNuggets, 6 pieces', "McDonald's", 96, 259, 15, 16, 15, 'box', 'ناجتس ماكدونالدز mcdonalds nuggets'],
    ['rmc6', 'Chicken McNuggets, 9 pieces', "McDonald's", 144, 395, 23, 24, 23, 'box', 'ناجتس ماكدونالدز mcdonalds nuggets'],
    ['rmc7', 'Filet-O-Fish', "McDonald's", 136, 342, 15, 39, 14, 'sandwich', 'فيليه او فيش ماكدونالدز mcdonalds fish'],
    ['rmc8', 'Fries, medium', "McDonald's", 114, 328, 4, 42, 16, 'portion', 'بطاطس ماكدونالدز mcdonalds fries'],
    ['rmc9', 'Fries, large', "McDonald's", 154, 442, 5, 56, 22, 'portion', 'بطاطس كبير ماكدونالدز mcdonalds fries'],
    ['rmc10', 'McFlurry Oreo', "McDonald's", 186, 380, 8, 60, 12, 'cup', 'ماك فلوري ماكدونالدز mcdonalds icecream'],
    ['rmc11', 'Apple pie', "McDonald's", 80, 236, 2, 30, 12, 'piece', 'فطيرة تفاح ماكدونالدز mcdonalds'],
    ['rmc12', 'Grand Chicken Special', "McDonald's", 250, 592, 30, 55, 28, 'sandwich', 'جراند تشيكن ماكدونالدز mcdonalds'],
    ['rmc13', 'McRoyale', "McDonald's", 200, 514, 30, 40, 26, 'sandwich', 'ماك رويال ماكدونالدز mcdonalds'],
    ['rkf1', 'Original Recipe chicken, breast', 'KFC', 180, 385, 38, 11, 21, 'piece', 'كنتاكي صدر kfc kentucky'],
    ['rkf2', 'Original Recipe chicken, thigh', 'KFC', 120, 279, 19, 8, 19, 'piece', 'كنتاكي ورك kfc kentucky'],
    ['rkf3', 'Original Recipe chicken, drumstick', 'KFC', 70, 140, 13, 4, 8, 'piece', 'كنتاكي دبوس kfc kentucky'],
    ['rkf4', 'Zinger sandwich', 'KFC', 220, 510, 28, 50, 22, 'sandwich', 'زنجر كنتاكي kfc kentucky'],
    ['rkf5', 'Twister', 'KFC', 230, 513, 22, 50, 25, 'wrap', 'تويستر كنتاكي kfc kentucky'],
    ['rkf6', 'Mighty Zinger', 'KFC', 330, 780, 45, 60, 40, 'sandwich', 'مايتي زنجر كنتاكي kfc kentucky'],
    ['rkf7', 'Popcorn chicken, regular', 'KFC', 130, 322, 20, 20, 18, 'box', 'بوب كورن تشيكن كنتاكي kfc'],
    ['rkf8', 'Coleslaw', 'KFC', 130, 166, 1, 18, 10, 'cup', 'كول سلو كنتاكي kfc'],
    ['rkf9', 'Fries, regular', 'KFC', 100, 290, 3, 38, 14, 'portion', 'بطاطس كنتاكي kfc fries'],
    ['rkf10', 'Rice', 'KFC', 150, 223, 4, 45, 3, 'cup', 'رز كنتاكي kfc'],
    ['rkf11', 'Dinner box, 3 pieces', 'KFC', 500, 1100, 60, 80, 60, 'box', 'وجبة كنتاكي ٣ قطع kfc box'],
    ['rhd1', 'Thickburger, 1/3 lb', "Hardee's", 300, 757, 38, 50, 45, 'sandwich', 'ثيك برجر هارديز hardees'],
    ['rhd2', 'Famous Star', "Hardee's", 250, 615, 25, 50, 35, 'sandwich', 'فيمس ستار هارديز hardees'],
    ['rhd3', 'Mushroom Swiss burger', "Hardee's", 280, 642, 35, 40, 38, 'sandwich', 'ماشروم سويس هارديز hardees'],
    ['rhd4', 'Chicken tenders, 3 pieces', "Hardee's", 150, 327, 30, 18, 15, 'box', 'تندرز هارديز hardees'],
    ['rhd5', 'Curly fries, medium', "Hardee's", 130, 380, 5, 45, 20, 'portion', 'كيرلي فرايز هارديز hardees'],
    ['rhd6', 'Chicken fillet sandwich', "Hardee's", 230, 557, 28, 55, 25, 'sandwich', 'فيليه فراخ هارديز hardees'],
    ['rph1', 'Margherita, medium, 1 slice', 'Pizza Hut', 100, 233, 10, 28, 9, 'slice', 'بيتزا مارجريتا بيتزا هت pizzahut'],
    ['rph2', 'Pepperoni, medium, 1 slice', 'Pizza Hut', 105, 264, 11, 28, 12, 'slice', 'بيتزا بيبروني بيتزا هت pizzahut'],
    ['rph3', 'Supreme, medium, 1 slice', 'Pizza Hut', 130, 281, 12, 29, 13, 'slice', 'بيتزا سوبريم بيتزا هت pizzahut'],
    ['rph4', 'Chicken ranch, medium, 1 slice', 'Pizza Hut', 120, 263, 13, 28, 11, 'slice', 'بيتزا تشيكن رانش بيتزا هت pizzahut'],
    ['rph5', 'Personal pan pizza, margherita', 'Pizza Hut', 300, 750, 30, 90, 30, 'pizza', 'بيتزا شخصي بيتزا هت pizzahut'],
    ['rph6', 'Garlic bread, 1 piece', 'Pizza Hut', 40, 129, 3, 18, 5, 'piece', 'خبز بالتوم بيتزا هت pizzahut'],
    ['rbz1', 'Classic crispy chicken sandwich', 'Bazooka', 250, 566, 28, 55, 26, 'sandwich', 'بازوكا كريسبي bazooka'],
    ['rbz2', 'Bazooka fries', 'Bazooka', 150, 378, 4, 50, 18, 'portion', 'بطاطس بازوكا bazooka'],
    ['rbz3', 'Spicy chicken wrap', 'Bazooka', 260, 528, 26, 52, 24, 'wrap', 'راب سبايسي بازوكا bazooka'],
    ['rbz4', 'Chicken strips, 3 pieces', 'Bazooka', 150, 336, 28, 20, 16, 'box', 'استربس بازوكا bazooka'],
    ['rzb1', 'Taameya sandwich', 'Zooba', 180, 366, 10, 50, 14, 'sandwich', 'زوبا طعمية zooba'],
    ['rzb2', 'Ful sandwich', 'Zooba', 200, 358, 12, 55, 10, 'sandwich', 'زوبا فول zooba'],
    ['rzb3', 'Koshari bowl', 'Zooba', 400, 660, 18, 120, 12, 'bowl', 'زوبا كشري zooba koshary'],
    ['rzb4', 'Hawawshi', 'Zooba', 250, 570, 25, 50, 30, 'piece', 'زوبا حواوشي zooba'],
    ['rzb5', 'Liver sandwich', 'Zooba', 200, 394, 22, 45, 14, 'sandwich', 'زوبا كبدة zooba'],
    ['rzb6', 'Molokhia with rice', 'Zooba', 400, 466, 10, 75, 14, 'plate', 'زوبا ملوخية zooba'],
    ['rwk1', 'Grilled chicken salad bowl', "Willy's Kitchen", 350, 387, 38, 25, 15, 'bowl', 'ويليز كيتشن سلطة willys'],
    ['rwk2', 'Chicken burger', "Willy's Kitchen", 250, 498, 30, 45, 22, 'sandwich', 'ويليز كيتشن برجر willys'],
    ['rwk3', 'Steak sandwich', "Willy's Kitchen", 280, 518, 32, 48, 22, 'sandwich', 'ويليز كيتشن ستيك willys'],
    ['rwk4', 'Protein pancakes', "Willy's Kitchen", 200, 332, 25, 40, 8, 'plate', 'ويليز كيتشن بان كيك willys']
  ];
  const EGYPT_MORE = [
    ['eg01', 'Mombar (stuffed casings)', '', 150, 380, 12, 38, 20, 'plate', 'ممبار mumbar'],
    ['eg02', "Kaware' (trotters soup)", '', 350, 420, 38, 4, 28, 'bowl', 'كوارع kawar3'],
    ['eg03', 'Rokak with minced meat', '', 200, 560, 22, 45, 32, 'square', 'رقاق باللحمة ro2a2'],
    ['eg04', 'Goulash with minced meat', '', 180, 520, 20, 40, 31, 'square', 'جلاش باللحمة gollash'],
    ['eg05', 'Goulash with cheese', '', 160, 470, 15, 38, 28, 'square', 'جلاش بالجبنة'],
    ['eg06', 'Sambousek with cheese', '', 30, 110, 3, 10, 6.5, 'piece', 'سمبوسك جبنة sambosa'],
    ['eg07', 'Sambousek with meat', '', 35, 125, 5, 10, 7, 'piece', 'سمبوسك لحمة sambosa'],
    ['eg08', 'Potato tray with meat', '', 350, 430, 22, 35, 22, 'plate', 'صينية بطاطس باللحمة'],
    ['eg09', 'Chicken with rice', '', 450, 780, 48, 75, 30, 'plate', 'فراخ بالرز'],
    ['eg10', 'Grilled chicken, quarter', '', 250, 480, 50, 0, 30, 'quarter', 'ربع فرخة مشوية'],
    ['eg11', 'Fried chicken, home style', '', 150, 400, 32, 10, 25, 'piece', 'فراخ مقلية'],
    ['eg12', 'Kofta bel tahina', '', 300, 620, 32, 12, 50, 'plate', 'كفتة بالطحينة'],
    ['eg13', 'Daoud basha', '', 300, 480, 25, 18, 34, 'plate', 'داود باشا dawood'],
    ['eg14', 'Stuffed pigeon (hamam mahshi)', '', 350, 760, 40, 55, 42, 'pigeon', 'حمام محشي'],
    ['eg15', 'Spinach stew with meat', '', 300, 300, 20, 12, 19, 'plate', 'سبانخ باللحمة sabanekh'],
    ['eg16', 'Peas and carrots with meat', '', 300, 360, 22, 28, 18, 'plate', 'بسلة بالجزر bisella'],
    ['eg17', 'Colocasia (qolqas) with chard', '', 300, 290, 15, 32, 11, 'bowl', 'قلقاس 2ol2as'],
    ['eg19', 'Grilled fish', '', 250, 320, 50, 0, 12, 'fish', 'سمك مشوي'],
    ['eg21', 'Pasta with red sauce', '', 300, 420, 13, 70, 10, 'plate', 'مكرونة صلصة'],
    ['eg22', 'Pasta with minced meat', '', 300, 520, 24, 62, 19, 'plate', 'مكرونة باللحمة المفرومة'],
    ['eg23', 'Kobeba', '', 60, 180, 9, 14, 10, 'piece', 'كبيبة kobeiba'],
    ['eg25', 'Fried potatoes, home style', '', 150, 470, 5, 55, 25, 'plate', 'بطاطس مقلية'],
    ['eg26', 'Fried eggs, 2', '', 100, 196, 14, 1, 15, '2 eggs', 'بيض مقلي'],
    ['eg27', 'Boiled eggs, 2', '', 100, 155, 13, 1, 11, '2 eggs', 'بيض مسلوق'],
    ['eg28', 'Halawa tahinia', '', 40, 210, 5, 21, 13, 'piece', 'حلاوة طحينية halawa'],
    ['eg29', 'Egg sandwich (baladi)', '', 150, 330, 15, 38, 13, 'sandwich', 'ساندوتش بيض'],
    ['eg30', 'Potato sandwich (baladi)', '', 170, 420, 7, 58, 18, 'sandwich', 'ساندوتش بطاطس'],
    ['eg31', 'Kofta sandwich', '', 200, 480, 24, 40, 25, 'sandwich', 'ساندوتش كفتة'],
    ['eg32', 'Mesh (aged cheese)', '', 30, 70, 4, 1, 5.5, 'tbsp', 'مش'],
    ['eg33', 'Zalabya (lo2met el adi)', '', 100, 380, 4, 45, 20, '5 pieces', 'زلابية لقمة القاضي'],
    ['eg34', 'Sugarcane juice', '', 300, 270, 0, 68, 0, 'glass', 'عصير قصب asab'],
    ['eg35', 'Fresh mango juice', '', 300, 200, 1.5, 48, 0.5, 'glass', 'عصير مانجو'],
    ['eg36', 'Qamar el din drink', '', 250, 230, 1, 56, 0.3, 'glass', 'قمر الدين amar eldin'],
    ['eg37', 'Coffee with milk (Nescafe)', '', 250, 130, 6, 15, 5, 'mug', 'نسكافيه بالحليب'],
    ['eg38', 'Lib (sunflower seeds)', '', 30, 170, 6, 6, 14, 'handful', 'لب'],
    ['eg39', 'Termes (lupini beans)', '', 100, 120, 15, 9, 3, 'cup', 'ترمس tirmis'],
    ['eg40', 'Halabessa (chickpea broth)', '', 250, 210, 11, 35, 3, 'cup', 'حمص الشام'],
    ['eg41', 'Roasted sweet potato', '', 200, 180, 4, 41, 0.3, 'piece', 'بطاطا مشوية'],
    ['eg42', 'Grilled corn on the cob', '', 150, 140, 5, 30, 2, 'cob', 'درة مشوي'],
    ['eg43', 'Roz bel khalta', '', 250, 480, 12, 60, 21, 'plate', 'رز بالخلطة'],
    ['eg44', 'Fattet shawerma', '', 400, 820, 40, 80, 36, 'plate', 'فتة شاورما'],
    ['eg45', 'Hummus with tahini', '', 100, 177, 8, 14, 10, 'small plate', 'حمص بالطحينة'],
    ['eg46', 'Belila', '', 300, 330, 10, 55, 7, 'bowl', 'بليلة'],
    ['eg47', 'Sweet couscous', '', 250, 480, 9, 80, 13, 'plate', 'كسكسي بالسكر'],
    ['eg48', 'Mahshi with meat', '', 300, 450, 18, 45, 22, 'plate', 'محشي باللحمة'],
    ['eg49', 'Feteer with honey and cream', '', 200, 760, 12, 78, 44, 'quarter', 'فطير بالعسل والقشطة'],
    ['eg50', 'Ataif with cream', '', 70, 230, 4, 30, 10, 'piece', 'قطايف بالقشطة']
  ];
  const RESTAURANTS = [
    ['rk1', 'Koshary, small', 'Koshary El Tahrir', 350, 600, 18, 110, 10, 'small box', 'كشري التحرير koshary koshari'],
    ['rk2', 'Koshary, medium', 'Koshary El Tahrir', 500, 860, 25, 158, 14, 'medium box', 'كشري التحرير koshary koshari'],
    ['rk3', 'Koshary, large', 'Koshary El Tahrir', 700, 1200, 35, 220, 20, 'large box', 'كشري التحرير koshary koshari'],
    ['ra1', 'Koshary, medium', 'Abou Tarek', 500, 880, 25, 160, 15, 'medium plate', 'كشري ابو طارق koshary koshari'],
    ['ra2', 'Koshary, large', 'Abou Tarek', 700, 1230, 35, 224, 21, 'large plate', 'كشري ابو طارق koshary koshari'],
    ['rm1', 'Classic beef burger', "Mo'men", 220, 540, 27, 42, 29, 'burger', 'مؤمن momen burger'],
    ['rm2', 'Chicken fillet sandwich', "Mo'men", 230, 560, 28, 55, 25, 'sandwich', 'مؤمن momen فيليه'],
    ['rm3', 'Crispy chicken sandwich', "Mo'men", 240, 620, 26, 58, 31, 'sandwich', 'مؤمن momen كرسبي'],
    ['rm4', 'French fries, regular', "Mo'men", 120, 340, 4, 44, 17, 'regular', 'مؤمن momen بطاطس'],
    ['rc1', 'Chicken shawarma sandwich', 'Cook Door', 220, 470, 28, 45, 19, 'sandwich', 'كوك دور cookdoor شاورما فراخ'],
    ['rc2', 'Beef shawarma sandwich', 'Cook Door', 220, 530, 27, 44, 27, 'sandwich', 'كوك دور cookdoor شاورما لحمة'],
    ['rc3', 'Club sandwich', 'Cook Door', 260, 620, 32, 50, 32, 'sandwich', 'كوك دور cookdoor كلوب'],
    ['rb1', 'Classic burger', 'Buffalo Burger', 300, 760, 38, 48, 45, 'burger', 'بافلو برجر buffalo'],
    ['rb2', 'Cheese burger, double', 'Buffalo Burger', 380, 1020, 56, 50, 66, 'burger', 'بافلو برجر buffalo'],
    ['rb3', 'Chicken burger', 'Buffalo Burger', 290, 680, 34, 55, 35, 'burger', 'بافلو برجر buffalo'],
    ['rb4', 'Fries, regular', 'Buffalo Burger', 140, 390, 5, 50, 19, 'regular', 'بافلو برجر buffalo بطاطس'],
    ['rg1', 'Ful sandwich', 'Gad', 130, 250, 10, 38, 6, 'sandwich', 'جاد فول foul'],
    ['rg2', 'Taameya sandwich', 'Gad', 130, 300, 9, 40, 12, 'sandwich', 'جاد طعمية falafel'],
    ['rg3', 'Egg sandwich', 'Gad', 140, 320, 14, 36, 13, 'sandwich', 'جاد بيض'],
    ['rg4', 'Liver sandwich (kebda)', 'Gad', 160, 380, 20, 40, 15, 'sandwich', 'جاد كبدة kebda'],
    ['rg5', "Sausage sandwich (sogo')", 'Gad', 160, 430, 16, 40, 23, 'sandwich', 'جاد سجق sausage'],
    ['rg6', 'Hawawshi', 'Gad', 250, 660, 28, 50, 38, 'piece', 'جاد حواوشي'],
    ['rg7', 'Feteer meshaltet, plain (quarter)', 'Gad', 120, 480, 8, 45, 30, 'quarter', 'جاد فطير مشلتت'],
    ['rf1', 'Original Recipe chicken, 1 piece', 'KFC', 115, 290, 20, 10, 19, 'piece', 'كنتاكي kfc'],
    ['rf3', 'Twister wrap', 'KFC', 230, 560, 26, 52, 27, 'wrap', 'كنتاكي kfc تويستر'],
    ['rf4', 'Coleslaw, regular', 'KFC', 100, 150, 1, 14, 10, 'regular', 'كنتاكي kfc كول سلو'],
    ['rh1', 'Chicken shawarma plate', 'Shawarma restaurant', 400, 820, 45, 70, 38, 'plate', 'شاورما فراخ وجبة'],
    ['rh2', 'Kofta, 4 pieces', 'Grill restaurant', 200, 520, 34, 6, 40, '4 pieces', 'كفتة مشويات'],
    ['rh3', 'Grilled chicken, half', 'Grill restaurant', 350, 620, 62, 2, 40, 'half chicken', 'فراخ مشوية نص فرخة'],
    ['rh4', 'Molokhia with rice', 'Restaurant', 450, 560, 18, 90, 14, 'plate', 'ملوخية ورز']
  ];
  // USDA FoodData Central (SR Legacy) plus Egyptian dishes, per 100 g. Downloaded the first time it's needed, then kept offline.
  const FOODS_URL = 'foods.json?v=db11', CORE_URL = 'foods-core.json?v=db11';
  let foodDB = null, foodDBP = null;
  // Lower-case, no accents; Arabic without vowel marks and with one spelling for alef, taa marbuta and yaa.
  function normText(s) {
    s = String(s || '');
    if (/^[\x00-\x7f]*$/.test(s)) return s.toLowerCase().replace(/[^a-z0-9%]+/g, ' ').trim();
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[ً-ٰٟـ]/g, '').replace(/[آأإٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ث/g, 'ت').replace(/ذ/g, 'ز').replace(/ظ/g, 'ض')
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x660); })
      .replace(/[^a-z0-9%ء-ي]+/g, ' ').trim();
  }
  function stem(w) {
    if (/^[ء-ي]/.test(w)) return w.length > 5 && w.indexOf('بال') === 0 ? w.slice(3) : w.length > 4 && w.indexOf('ال') === 0 ? w.slice(2) : w; // بال / ال
    if (w.length <= 3) return w;
    if (/ies$/.test(w)) return w.slice(0, -3) + 'y';   // berries → berry
    if (/oes$/.test(w)) return w.slice(0, -2);         // potatoes → potato
    return /[^s]s$/.test(w) ? w.slice(0, -1) : w;       // eggs → egg
  }
  function wordsOf(s) { return normText(s).split(' ').filter(Boolean).map(stem); }
  // Everyday names (English spellings of Egyptian words, and Arabic) for what USDA calls something else.
  const FOOD_SYNONYMS = (function () {
    const raw = { konafa: 'knafeh', fatta: 'fattet', knafeh: 'konafa', kunafa: 'konafa', kanafeh: 'konafa', knafa: 'konafa', fattet: 'fatta', fatteh: 'fatta', baklawa: 'baklava', mince: 'ground', minced: 'ground', beetroot: 'beet', aubergine: 'eggplant', courgette: 'zucchini', prawn: 'shrimp', capsicum: 'pepper', 'بنجر': 'beet', fool: 'fava', ta3meya: 'falafel', ta3mia: 'falafel', taamia: 'falafel', '3eish': 'pita', '3esh': 'pita', eesh: 'pita', bed: 'egg', beda: 'egg', bayd: 'egg', labna: 'yogurt', gibna: 'cheese', gebnah: 'cheese', firakh: 'chicken', fera5: 'chicken', fra5: 'chicken', lahm: 'beef', kebda: 'liver', kibda: 'liver', ba2ola: 'bean', batatis: 'potato', tamatim: 'tomato', '5iyar': 'cucumber', '5yar': 'cucumber', toom: 'garlic', '3asal': 'honey', '3adas': 'lentil', hommos: 'chickpea', hummus: 'chickpea', homos: 'chickpea', zabady: 'yogurt', laban: 'milk', shoufan: 'oat', shofan: 'oat', mozz: 'banana', moz: 'banana', tofa7: 'apple', tofah: 'apple', borto2an: 'orange', '3enab': 'grape', bate5: 'watermelon', ferawla: 'strawberry', manga: 'mango', makarona: 'pasta', macarona: 'pasta', foul: 'fava', ful: 'fava', fuul: 'fava', molokhia: 'jute', mulukhiyah: 'jute', molokheya: 'jute', mloukhia: 'jute', baladi: 'pita', aish: 'pita', eish: 'pita', taameya: 'falafel', tameya: 'falafel',
      zabadi: 'yogurt', laban: 'milk', gebna: 'cheese', semsem: 'sesame', ruz: 'rice', roz: 'rice', batates: 'potato', tamatem: 'tomato', khiyar: 'cucumber', basal: 'onion', toum: 'garlic', samak: 'fish',
      ferakh: 'chicken', frakh: 'chicken', lahma: 'beef', beid: 'egg', asal: 'honey', tamr: 'date', balah: 'date', zeit: 'oil', shai: 'tea', shay: 'tea', ahwa: 'coffee', qahwa: 'coffee',
      'فول': 'fava', 'رز': 'rice', 'ارز': 'rice', 'عدس': 'lentil', 'حمص': 'chickpea', 'فراخ': 'chicken', 'دجاج': 'chicken', 'فرخه': 'chicken', 'لحم': 'beef', 'لحمه': 'beef', 'كبده': 'liver', 'سمك': 'fish', 'تونه': 'tuna',
      'جمبري': 'shrimp', 'سلمون': 'salmon', 'بيض': 'egg', 'بيضه': 'egg', 'لبن': 'milk', 'حليب': 'milk', 'زبادي': 'yogurt', 'جبنه': 'cheese', 'جبن': 'cheese', 'زبده': 'butter', 'سمنه': 'butter', 'زيت': 'oil', 'زيتون': 'olive',
      'عسل': 'honey', 'سكر': 'sugar', 'شاي': 'tea', 'قهوه': 'coffee', 'عيش': 'pita', 'خبز': 'bread', 'مكرونه': 'pasta', 'بطاطس': 'potato', 'بطاطا': 'sweet', 'طماطم': 'tomato', 'خيار': 'cucumber', 'بصل': 'onion',
      'ثوم': 'garlic', 'جزر': 'carrot', 'خس': 'lettuce', 'سبانخ': 'spinach', 'كوسه': 'zucchini', 'باذنجان': 'eggplant', 'بتنجان': 'eggplant', 'فلفل': 'pepper', 'باميه': 'okra', 'كرنب': 'cabbage', 'قرنبيط': 'cauliflower',
      'بروكلي': 'broccoli', 'بسله': 'pea', 'فاصوليا': 'bean', 'ذره': 'corn', 'مشروم': 'mushroom', 'بقدونس': 'parsley', 'كزبره': 'coriander', 'شبت': 'dill', 'نعناع': 'spearmint', 'ليمون': 'lemon', 'برتقال': 'orange',
      'تفاح': 'apple', 'موز': 'banana', 'عنب': 'grape', 'فراوله': 'strawberry', 'بطيخ': 'watermelon', 'مانجو': 'mango', 'جوافه': 'guava', 'تين': 'fig', 'رمان': 'pomegranate', 'خوخ': 'peach', 'مشمش': 'apricot',
      'كمثري': 'pear', 'بلح': 'date', 'تمر': 'date', 'لوز': 'almond', 'سوداني': 'peanut', 'جوز': 'walnut', 'عين': 'walnut', 'كاجو': 'cashew', 'فستق': 'pistachio', 'سمسم': 'sesame', 'طحينه': 'tahini', 'شوفان': 'oat',
      'عصير': 'juice', 'مياه': 'water', 'ماء': 'water', 'كريمه': 'cream', 'شوكولاته': 'chocolate', 'شيكولاته': 'chocolate', 'بسكويت': 'cookie', 'كيك': 'cake', 'ايس': 'ice', 'بيتزا': 'pizza', 'برجر': 'hamburger',
      'مشوي': 'roasted', 'مشويه': 'roasted', 'مقلي': 'fried', 'مقليه': 'fried', 'مسلوق': 'boiled', 'مسلوقه': 'boiled', 'مطبوخ': 'cooked', 'ني': 'raw', 'صدر': 'breast', 'صدور': 'breast', 'ورك': 'thigh', 'اوراك': 'thigh',
      'جناح': 'wing', 'اجنحه': 'wing', 'مفروم': 'ground', 'مفرومه': 'ground', 'كامل': 'whole', 'معلبه': 'canned', 'معلب': 'canned', 'مجفف': 'dried', 'سجق': 'sausage', 'بسطرمه': 'pastrami', 'رومي': 'turkey', 'ضاني': 'lamb', 'بتلو': 'veal', 'افوكادو': 'avocado', 'مربي': 'jam', 'كورن': 'corn', 'فيلو': 'phyllo', 'دقيق': 'flour', 'سميد': 'semolina' };
    const out = {}; Object.keys(raw).forEach(function (k) { out[stem(normText(k))] = raw[k]; }); return out;
  })();
  // Egyptian brands, however they're typed. Used for local search and for the packaged-food lookup.
  const BRANDS = { juhayna: ['جهينه', 'juhaina', 'johayna', 'gohayna', 'guhayna', 'juhyna', 'jouhayna', 'gohina', 'juhayana'], domty: ['دومتي', 'domti', 'domte'], almarai: ['المراعي', 'marai', 'al marai', 'almarai'], beyti: ['بيتي', 'baity', 'beity'], lamar: ['لمار'], edita: ['ايديتا', 'اديتا'], molto: ['مولتو'], chipsy: ['شيبسي', 'chipsi'], 'lay\'s': ['ليز', 'lays'], president: ['بريزيدنت'], panda: ['باندا'], americana: ['امريكانا'], halwani: ['حلواني'], faragello: ['فرجلو'], isis: ['ايزيس'], 'el rashidi': ['الرشيدي', 'rashidi'], 'labanita': ['لبنيتا'], 'obour land': ['عبور لاند', 'obourland'], 'nestle': ['نستله'], 'nescafe': ['نسكافيه'], 'pepsi': ['بيبسي'], 'coca cola': ['كوكاكولا', 'coke', 'كوكا'], 'schweppes': ['شويبس'], 'tiger': ['تايجر'], 'todo': ['تودو'], 'bake rolz': ['بيك رولز'], 'kitkat': ['كيت كات', 'kit kat'], 'twinkies': ['توينكز'], 'lambada': ['لمبادا'], 'cadbury': ['كادبوري'], 'galaxy': ['جالاكسي'], 'snickers': ['سنيكرز'], 'nutella': ['نوتيلا'], 'regina': ['ريجينا'], 'el maleka': ['الملكه', 'maleka'], 'hayat': ['حياه'], 'nestle pure life': ['نستله بيور لايف'], 'baraka': ['بركه'], 'dasani': ['داساني'], 'enjoy': ['انجوي'], 'oreo': ['اوريو'], 'kiri': ['كيري'], 'la vache qui rit': ['البقره الضاحكه', 'laughing cow'], 'dolce': ['دولسي'], 'teama': ['تيما'] };
  const BRAND_OF = (function () { const o = {}; Object.keys(BRANDS).forEach(function (b) { o[normText(b)] = b; BRANDS[b].forEach(function (a) { o[normText(a)] = b; }); }); return o; })();
  // "جهينه لبن" → "juhayna لبن": swap any brand spelling for the brand's usual name.
  function brandQuery(q) {
    let t = ' ' + normText(q) + ' ';
    Object.keys(BRAND_OF).sort(function (a, b) { return b.length - a.length; }).forEach(function (k) { if (t.indexOf(' ' + k + ' ') >= 0) t = t.replace(' ' + k + ' ', ' ' + BRAND_OF[k] + ' '); });
    return t.trim();
  }
  (function () {
    const more = { 'لوبيا': 'cowpea', 'ترمس': 'lupin', 'حلبه': 'fenugreek', 'كمون': 'cumin', 'كركم': 'turmeric', 'زنجبيل': 'ginger', 'قرنفل': 'clove', 'هيل': 'cardamom', 'حبهان': 'cardamom', 'ينسون': 'anise', 'كراويه': 'caraway', 'شمر': 'fennel', 'زعتر': 'thyme', 'روزماري': 'rosemary', 'ريحان': 'basil', 'جرجير': 'arugula', 'كرفس': 'celery', 'فجل': 'radish', 'لفت': 'turnip', 'قلقاس': 'taro', 'خرشوف': 'artichoke', 'هليون': 'asparagus', 'سلق': 'chard', 'كرات': 'leek', 'شطه': 'chili',
      'يوسفي': 'tangerine', 'كيوي': 'kiwi', 'اناناس': 'pineapple', 'كانتلوب': 'cantaloupe', 'شمام': 'melon', 'برقوق': 'plum', 'كريز': 'cherry', 'توت': 'mulberry', 'افوكادو': 'avocado', 'بابايا': 'papaya', 'زبيب': 'raisin', 'قراصيا': 'prune', 'بندق': 'hazelnut', 'لب': 'seed', 'برغل': 'bulgur', 'شعير': 'barley', 'نشا': 'cornstarch', 'سميد': 'semolina', 'دقيق': 'flour', 'خميره': 'yeast', 'فانيليا': 'vanilla', 'كاكاو': 'cocoa', 'جيلي': 'gelatin', 'مربي': 'jam', 'حلاوه': 'halva', 'قشطه': 'cream', 'سمن': 'ghee', 'مايونيز': 'mayonnaise', 'كاتشب': 'ketchup', 'كاتشاب': 'ketchup', 'مسطرده': 'mustard', 'خل': 'vinegar', 'صويا': 'soy', 'ملح': 'salt',
      'صفار': 'yolk', 'بياض': 'white', 'رايب': 'buttermilk', 'موتزاريلا': 'mozzarella', 'شيدر': 'cheddar', 'بارميزان': 'parmesan', 'ريكوتا': 'ricotta', 'بوظه': 'ice', 'كيكه': 'cake', 'بقلاوه': 'baklava', 'كرواسون': 'croissant', 'توست': 'toast', 'بقسماط': 'rusk', 'شاورما': 'shawarma', 'شاورمه': 'shawarma', 'كباب': 'kebab', 'كفته': 'kofta', 'ناجتس': 'nugget', 'بانيه': 'pane', 'اسكالوب': 'escalope', 'ستيك': 'steak', 'ضاني': 'lamb', 'بتلو': 'veal', 'كلاوي': 'kidney', 'حمام': 'pigeon', 'وز': 'goose', 'سمان': 'quail', 'ارنب': 'rabbit', 'ارانب': 'rabbit',
      'بلطي': 'tilapia', 'بوري': 'mullet', 'سردين': 'sardine', 'ماكريل': 'mackerel', 'كاليماري': 'squid', 'سبيط': 'cuttlefish', 'استاكوزا': 'lobster', 'كابوريا': 'crab', 'نسكافيه': 'nescafe', 'كابتشينو': 'cappuccino', 'لاتيه': 'latte', 'كوكاكولا': 'coca', 'بيبسي': 'pepsi', 'صودا': 'soda', 'شيبسي': 'chips', 'بسكوت': 'cookie', 'شوربه': 'soup', 'سلطه': 'salad', 'مشروب': 'drink', 'كريب': 'crepe', 'وافل': 'waffle', 'بان كيك': 'pancake', 'دونات': 'doughnut', 'مافن': 'muffin', 'براونيز': 'brownie', 'تشيز كيك': 'cheesecake', 'سوشي': 'sushi', 'نودلز': 'noodle', 'اندومي': 'indomie', 'بروتين': 'protein', 'كرياتين': 'creatine', 'واي': 'whey',
      bateekh: 'watermelon', batee5: 'watermelon', fraoula: 'strawberry', farawla: 'strawberry', gazar: 'carrot', kosa: 'zucchini', betengan: 'eggplant', bitingan: 'eggplant', felfel: 'pepper', bamya: 'okra', sabanekh: 'spinach', koronb: 'cabbage', kromb: 'cabbage', arnabeet: 'cauliflower', bazella: 'pea', fasolia: 'bean', zebda: 'butter', samna: 'ghee', sokar: 'sugar', soukar: 'sugar', 'da2i2': 'flour', sogo2: 'sausage', sogo: 'sausage', basterma: 'pastrami', gambary: 'shrimp', gambari: 'shrimp', balti: 'tilapia', '3ads': 'lentil', 'ads': 'lentil', '7omos': 'chickpea', kebda: 'liver', fakha: 'fruit', khodar: 'vegetable', mango: 'mango', '3asir': 'juice', aseer: 'juice', 'mayya': 'water', maya: 'water', 'ahwa': 'coffee', '2ahwa': 'coffee', shay: 'tea' };
    Object.keys(more).forEach(function (k) { const kk = stem(normText(k)); if (!FOOD_SYNONYMS[kk]) FOOD_SYNONYMS[kk] = more[k]; });
  })();
  // Arabic word for a food's main English word (shown next to results when you search in Arabic).
  let revAr = null;
  function arabicFor(f) {
    if (!revAr) { revAr = {}; Object.keys(FOOD_SYNONYMS).forEach(function (k) { if (/[ء-ي]/.test(k)) { const e = stem(FOOD_SYNONYMS[k]); if (!revAr[e] && k.length > 2) revAr[e] = k.replace(/ه$/, 'ة'); } }); }
    if (/[ء-ي]/.test(f.name)) return '';
    if (f.ar) return f.ar;
    return revAr[f.first[0]] || (CLASS_WORDS.indexOf(f.first[0]) >= 0 && revAr[f.first[1]]) || '';
  }
  // "Did you mean": the closest word the food list actually uses, for each word that found nothing.
  let vocab = null, vocabList = null;
  function didYouMean(q) {
    if (!foodDB) return '';
    if (!vocab) { vocab = {}; foodDB.list.forEach(function (f) { f.w.forEach(function (w) { if (w.length >= 3 && !/\d/.test(w)) vocab[w] = (vocab[w] || 0) + 1; }); }); vocabList = Object.keys(vocab).sort(); }
    const hasPrefix = function (t) { let lo = 0, hi = vocabList.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (vocabList[mid] < t) lo = mid + 1; else hi = mid; } return lo < vocabList.length && vocabList[lo].indexOf(t) === 0; };
    const ws = wordsOf(prepQuery(q)); let changed = false;
    const out = ws.map(function (t) {
      if (t.length < 3 || /[ء-ي]/.test(t) || FOOD_SYNONYMS[t] || hasPrefix(t)) return t;
      let best = null, bs = 1e9; const max = t.length >= 6 ? 2 : 1;
      vocabList.forEach(function (v) { if (Math.abs(v.length - t.length) > max || v[0] !== t[0] && v[1] !== t[1]) return; if (near(t, v, max)) { const sc = Math.abs(v.length - t.length) * 3 - Math.log(vocab[v] + 1); if (sc < bs) { bs = sc; best = v; } } });
      if (best) { changed = true; return best; } return t;
    });
    return changed ? out.join(' ') : '';
  }
  // The food's main name: "Chicken, breast, meat only…" → chicken breast; "Chicken breast tenders…" → chicken breast tenders.
  function mainWords(name) { const seg = name.split(','), w = wordsOf(seg[0]); return w.length === 1 && seg[1] ? w.concat(wordsOf(seg[1])) : w; }
  // Builds the searchable list from a foods file (the full one, or the small everyday one that loads first).
  function buildFoods(d) {
        const K = {}, byId = {};
        d.keys.forEach(function (k, i) { K[k] = i; });
        const list = [], one = function (r) {
          // r[8] keeps the original USDA name ("Bananas, raw"): its word order still guides ranking and its words still find the food.
          const on = r[8] || r[1], alt = r[6] ? wordsOf(r[6]) : [], nw = wordsOf(on), comma = on.indexOf(',');
          const mw = comma < 0 ? nw : mainWords(on), first = mw.concat(alt);
          // Egyptian dishes also start with their Arabic name and common spelling (فول, foul).
          const heads = [first[0]].concat(alt.filter(function (x, i) { return i === 0 || /^[a-z]/.test(x) && !/^[a-z]/.test(alt[i - 1]); }));
          const f = { id: 'u' + r[0], name: r[1], cat: d.cats[r[2]], n: r[3], por: r[4], pop: r[5] || 0, w: alt.length ? nw.concat(alt) : nw, len: nw.length, first: first, heads: heads };
          if (r[8]) { f.on = r[8]; wordsOf(r[1]).forEach(function (x) { if (f.w.indexOf(x) < 0) f.w.push(x); }); }
          if (d.core) { f.m = {}; d.keys.forEach(function (k, i) { f.m[k] = r[3][i]; }); f.core = true; } // just the main numbers; the rest comes with the full list
          if (r[7]) { f.ar = r[7]; const aw = wordsOf(r[7]); f.w = f.w.concat(aw); f.arFirst = aw.slice(0, 2); }
          if (typeof r[0] === 'number' && r[0] > 1000000 && r[0] < 9000000) f.src = 'fndds';
          byId[f.id] = f; list.push(f);
        };
        return new Promise(function (res) {
          let i = 0;
          (function slice() { const end = Math.min(d.foods.length, i + 1500); for (; i < end; i++) one(d.foods[i]); if (i < d.foods.length) setTimeout(slice, 0); else res(); })();
        }).then(function () {
        // Popular Egyptian restaurant items: estimates per serving, searchable like any food.
        RESTAURANTS.concat(RESTAURANTS2, RESTAURANTS3, EGYPT_MORE, EGYPT_MORE2).forEach(function (r) {
          const g = r[3], k = 100 / g, f = { id: 'u' + r[0], place: r[2] || null, palt: r[9] || '', name: r[1] + (r[2] ? ' · ' + r[2] : ''), cat: r[2] ? 'Restaurants (estimate)' : r[0].indexOf('ex') === 0 ? 'Dishes (estimate)' : 'Egyptian dishes', m: { kcal: r[4] * k, p: r[5] * k, c: r[6] * k, f: r[7] * k }, por: [['1 ' + (r[8] || 'serving'), g]], pop: 0.6 };
          f.w = wordsOf(f.name + ' ' + (r[9] || '')); f.first = mainWords(r[1]); f.len = wordsOf(r[1]).length; f.heads = [f.first[0]];
          list.push(f); byId[f.id] = f;
        });
        // Egyptian packaged products: typical label values, marked as estimates.
        PACKAGED_EG.forEach(function (r) {
          const g = r[3], k = 100 / g, f = { id: 'u' + r[0], est: true, name: r[1] + ' · ' + r[2], cat: 'Packaged foods', m: { kcal: r[4] * k, p: r[5] * k, c: r[6] * k, f: r[7] * k }, por: [['1 ' + r[8], g]], pop: 0.6 };
          f.w = wordsOf(f.name + ' ' + r[9]); f.first = mainWords(r[2] + ' ' + r[1]); f.len = wordsOf(r[1]).length + 1; f.heads = [f.first[0]];
          list.push(f); byId[f.id] = f;
        });
        // Duplicates that were removed point to the copy that was kept, so saved items still find their food.
        Object.keys(d.alias || {}).forEach(function (o) { const k = byId['u' + d.alias[o]]; if (k && !byId['u' + o]) byId['u' + o] = k; });
        // Every whole word in the food list: a search word that is one of these is a finished word, not a word being typed.
        const vocab = {}; list.forEach(function (f) { for (let i = 0; i < f.w.length; i++) vocab[f.w[i]] = (vocab[f.w[i]] || 0) + 1; });
        return { K: K, list: list, byId: byId, vocab: vocab };
        });
  }
  function loadFoods() {
    if (!foodDBP) {
      foodDBP = fetch(FOODS_URL).then(function (r) { if (!r.ok) throw new Error('foods ' + r.status); return r.json(); }).then(buildFoods).then(function (db) {
        foodDB = db; coreDB = null; placesCache = null;
        // A favorite that was a removed duplicate becomes the kept one (once, without doubles).
        const fv = []; state.favs.forEach(function (x) { const f = db.byId[x], y = f ? f.id : x; if (fv.indexOf(y) < 0) fv.push(y); });
        if (fv.join() !== state.favs.join()) { state.favs = fv; save(); }
        return foodDB;
      }).catch(function (e) { foodDBP = null; throw e; });
    }
    return foodDBP;
  }
  // The first search shouldn't wait for the whole list: the everyday foods (a quarter of the size) come first.
  // Skipped when the full list is already saved on this phone.
  let coreDB = null, coreP = null;
  function loadCoreFoods() {
    if (foodDB || coreDB) return Promise.resolve(foodDB || coreDB);
    if (!coreP) {
      const saved = 'caches' in window ? caches.open('setpoint-foods').then(function (c) { return c.match(FOODS_URL); }).catch(function () { return null; }) : Promise.resolve(null);
      coreP = saved.then(function (hit) {
        if (hit || foodDB) return null;
        return fetch(CORE_URL).then(function (r) { if (!r.ok) throw new Error('core ' + r.status); return r.json(); }).then(buildFoods).then(function (db) { if (!foodDB) { coreDB = db; placesCache = null; } return coreDB; });
      }).catch(function () { coreP = null; return null; });
    }
    return coreP;
  }
  // Fetch the file in the background once, so search works offline later (the service worker keeps it).
  function prefetchFoods() {
    if (!('caches' in window)) return;
    caches.open('setpoint-foods').then(function (c) { return c.match(new URL(FOODS_URL, location.href).href); })
      .then(function (hit) { if (!hit) fetch(FOODS_URL).catch(function () {}); }).catch(function () {});
  }

  // My foods are stored per serving; shaped here like database foods (per 100 g of "serving weight").
  // Calories that don't match protein, carbs and fat (4/4/9 kcal per gram), allowing for rounding and fiber.
  // How much to trust a food's numbers, as a small tag.
  function srcBadge(f) {
    const t = f.recipe ? ['Recipe', 'mid'] : f.custom ? ['Yours', 'mid'] : f.est ? ['Estimate', 'low'] : f.off || f.cat === 'Packaged foods' ? ['Label', 'mid'] : f.cat === 'Restaurants (estimate)' || f.cat === 'Egyptian dishes' || f.cat === 'Dishes (estimate)' ? ['Estimate', 'low'] : ['USDA', 'hi'];
    return '<span class="src-tag src-' + t[1] + '">' + t[0] + '</span>';
  }
  // Your foods that are really the same: same name (ignoring case and punctuation), same serving, calories within 5%.
  function dupGroups() {
    const by = {};
    state.myFoods.forEach(function (c) { const k = wordsOf(c.name).sort().join(' ') + '|' + normText(c.unit); (by[k] = by[k] || []).push(c); });
    const out = [];
    Object.keys(by).forEach(function (k) {
      const list = by[k]; if (list.length < 2) return;
      const used = {};
      list.forEach(function (a, i) {
        if (used[a.id]) return;
        const g = [a].concat(list.slice(i + 1).filter(function (b) { return !used[b.id] && Math.abs(a.kcal - b.kcal) <= Math.max(5, a.kcal * 0.05) && (a.g || 0) === (b.g || 0) || (!used[b.id] && a.kcal === b.kcal); }));
        if (g.length > 1) { g.forEach(function (x) { used[x.id] = 1; }); out.push(g); }
      });
    });
    return out;
  }
  // Keep one food, point everything that used the others at it, remove the others.
  function mergeFoods(keep, drop) {
    const ids = {}; drop.forEach(function (c) { ids[c.id] = 1; });
    Object.keys(state.food).forEach(function (d) { state.food[d].forEach(function (it) { if (ids[it.ref]) it.ref = keep.id; (it.mi || []).forEach(function (x) { if (ids[x.ref]) x.ref = keep.id; }); }); });
    state.recipes.forEach(function (rc) { rc.items.forEach(function (x) { if (ids[x.ref]) x.ref = keep.id; }); });
    state.meals.forEach(function (m) { m.items.forEach(function (x) { if (ids[x.ref]) x.ref = keep.id; }); });
    const fav = state.favs.some(function (x) { return ids[x]; });
    state.favs = state.favs.filter(function (x) { return !ids[x]; }); if (fav && state.favs.indexOf(keep.id) < 0) state.favs.unshift(keep.id);
    state.myFoods = state.myFoods.filter(function (c) { return !ids[c.id]; });
  }
  function dupsSheet() {
    const draw = function (root) {
      const gs = dupGroups(), use = foodUse().use;
      root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Possible copies</h2></div>' +
        (!gs.length ? '<p class="muted-note fd-empty">No copies left. Nice and tidy.</p>' :
          '<p class="muted-note" style="text-align:start;margin:0 2px 12px">Merging keeps one and moves your diary, recipes and meals over to it.</p>' +
          gs.map(function (g, gi) {
            g.sort(function (a, b) { return (use[b.id] || 0) - (use[a.id] || 0); });
            return '<div class="card dup-card"><div class="list">' + g.map(function (c, i) { return '<label class="row fd-row"><input type="radio" name="dup' + gi + '" value="' + c.id + '"' + (i ? '' : ' checked') + ' /><div class="grow"><div class="row-t">' + esc(c.name) + '</div><div class="row-s">1 ' + esc(c.unit) + ' · ' + fmtKcal(c.kcal) + ' kcal · P ' + c.p + ' · C ' + c.c + ' · F ' + c.f + (use[c.id] ? ' · logged ' + use[c.id] + '×' : '') + '</div></div></label>'; }).join('') +
              '</div><button type="button" class="btn soft block" data-merge="' + gi + '">Merge into the ticked one</button></div>';
          }).join(''));
      $$('[data-merge]', root).forEach(function (b) { b.addEventListener('click', function () {
        const g = dupGroups()[+b.dataset.merge]; if (!g) return;
        const pick = root.querySelector('input[name="dup' + b.dataset.merge + '"]:checked'), keep = g.find(function (c) { return pick && c.id === pick.value; }) || g[0];
        const snap = snapshot(); mergeFoods(keep, g.filter(function (c) { return c !== keep; }));
        save(); renderAll(); renderFoods(); buzz('success'); toast('Merged into ' + keep.name, function () { restore(snap); renderFoods(); }); draw(root);
      }); });
    };
    openSheet('<div id="dupRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#dupRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
  // Look through everything for things that are probably mistakes, and offer a fix for each.
  function healthIssues() {
    const out = [], today = todayISO();
    Object.keys(state.food).forEach(function (d) {
      const seen = {};
      state.food[d].forEach(function (it) {
        const lbl = esc(it.name || 'Quick add') + ' · ' + esc(fmtDate(d));
        if (seen[it.id]) out.push({ t: 'Two entries share the same id', s: lbl, fix: 'Fix', run: function () { it.id = newId(); } });
        seen[it.id] = 1;
        if (it.ref && foodDB && !itemFood(it)) out.push({ t: 'Food no longer exists', s: lbl, fix: 'Keep as quick add', run: function () { delete it.ref; delete it.g; delete it.qty; delete it.unit; delete it.rc; } });
        if (it.kcal > 4000) out.push({ t: 'Very large entry (' + fmtKcal(it.kcal) + ' kcal)', s: lbl, fix: 'Delete', run: function () { state.food[d] = state.food[d].filter(function (x) { return x !== it; }); } });
        if (!it.ref && !it.mid && !isImported(it) && it.kcal > 50 && oddMacros(it.kcal, it.protein, it.carbs, it.fat) && (it.protein && it.carbs && it.fat || 4 * it.protein + 4 * it.carbs + 9 * it.fat > it.kcal * 1.25 + 25)) out.push({ t: 'Calories don\'t match macros', s: lbl + ' · ' + it.kcal + ' kcal vs ~' + Math.round(4 * it.protein + 4 * it.carbs + 9 * it.fat), fix: 'Use macros', run: function () { it.kcal = Math.round(4 * it.protein + 4 * it.carbs + 9 * it.fat); } });
        if (d > today && !it.plan) out.push({ t: 'Eaten on a future day', s: lbl, fix: 'Mark as planned', run: function () { it.plan = true; delete it.t; } });
      });
    });
    const es = state.entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    es.forEach(function (e, i) {
      const nb = es.slice(Math.max(0, i - 3), i).concat(es.slice(i + 1, i + 4)); if (nb.length < 3) return;
      const med = nb.map(function (x) { return x.kg; }).sort(function (a, b) { return a - b; })[Math.floor(nb.length / 2)];
      if (Math.abs(e.kg - med) > Math.max(3, med * 0.05)) out.push({ t: 'Weigh-in looks off (' + fmtW(e.kg) + ' ' + unit() + ')', s: esc(fmtDate(e.date)) + ' · nearby days are about ' + fmtW(med) + ' ' + unit(), fix: 'Delete', run: function () { state.entries = state.entries.filter(function (x) { return x !== e; }); } });
    });
    if (foodDB) {
      state.recipes.forEach(function (rc) { const miss = rc.items.filter(function (x) { return !getFood(x.ref); }); if (miss.length && miss.length < rc.items.length) out.push({ t: 'Recipe has missing ingredients', s: esc(rc.name) + ' · ' + miss.length + ' missing', fix: 'Remove them', run: function () { rc.items = rc.items.filter(function (x) { return getFood(x.ref); }); } }); });
      state.meals.forEach(function (m) { const miss = m.items.filter(function (x) { return x.ref && !getFood(x.ref); }); if (miss.length) out.push({ t: 'Meal has missing foods', s: esc(m.name) + ' · ' + miss.length + ' missing', fix: 'Keep as quick adds', run: function () { miss.forEach(function (x) { delete x.ref; delete x.g; delete x.qty; delete x.unit; }); } }); });
    }
    state.myFoods.forEach(function (c) { if (!c.ok && oddMacros(c.kcal, c.p, c.c, c.f)) out.push({ t: 'Your food\'s calories don\'t match its macros', s: esc(c.name) + ' · ' + c.kcal + ' kcal vs ~' + Math.round(4 * c.p + 4 * c.c + 9 * c.f), fix: 'Use macros', run: function () { c.kcal = Math.round(4 * c.p + 4 * c.c + 9 * c.f); } }); });
    return out;
  }
  function healthSheet() {
    const draw = function (root) {
      if (!foodDB) { root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Check my data</h2></div>' + skel(4); loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) { foodDB = foodDB || null; root.querySelector('.fd-empty').textContent = 'Couldn\'t load the food list. Check your connection.'; } }); return; }
      const is = healthIssues();
      root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Check my data</h2></div>' +
        (!is.length ? '<div class="hc-ok">' + CHECK_IC + '<b>Everything looks right</b><span>No broken foods, odd entries or weigh-ins that look like typos.</span></div>' :
          '<p class="muted-note" style="text-align:start;margin:0 2px 12px">' + is.length + (is.length === 1 ? ' thing looks' : ' things look') + ' off. Nothing changes unless you tap a fix.</p>' +
          (is.length > 1 ? '<button type="button" class="btn soft block" id="hcAll" style="margin-bottom:12px">Fix all ' + is.length + '</button>' : '') +
          '<div class="list">' + is.slice(0, 80).map(function (x, i) { return '<div class="row fd-row hc-row"><div class="grow"><div class="row-t">' + esc(x.t) + '</div><div class="row-s">' + x.s + '</div></div><button type="button" class="btn sm tint" data-hc="' + i + '">' + esc(x.fix) + '</button></div>'; }).join('') + '</div>');
      const fix = function (list, msg) { const snap = snapshot(); list.forEach(function (x) { x.run(); }); save(); renderAll(); buzz('success'); toast(msg, function () { restore(snap); }); draw(root); };
      $$('[data-hc]', root).forEach(function (b) { b.addEventListener('click', function () { fix([is[+b.dataset.hc]], 'Fixed'); }); });
      if ($('#hcAll', root)) $('#hcAll', root).addEventListener('click', function () { fix(is, 'Fixed ' + is.length + ' things'); });
    };
    openSheet('<div id="hcRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#hcRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
  const CHECK_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 10"/></svg>';
  // Verified: numbers measured or surveyed by the USDA (not estimates, product labels or your own entries).
  function isVerified(f) { return !!f && /^u\d+$/.test(f.id) && !f.custom && !f.recipe && !f.off && ['Packaged foods', 'Restaurants (estimate)', 'Egyptian dishes', 'Dishes (estimate)'].indexOf(f.cat) < 0; }
  const VER_IC = '<span class="ver" role="img" aria-label="Verified" title="Verified: measured by the USDA"><svg viewBox="0 0 24 24"><path d="M10.84 2.35Q12.00 1.40 13.16 2.35Q14.33 3.31 15.81 3.06Q17.30 2.82 17.83 4.23Q18.36 5.64 19.77 6.17Q21.18 6.70 20.94 8.19Q20.69 9.67 21.65 10.84Q22.60 12.00 21.65 13.16Q20.69 14.33 20.94 15.81Q21.18 17.30 19.77 17.83Q18.36 18.36 17.83 19.77Q17.30 21.18 15.81 20.94Q14.33 20.69 13.16 21.65Q12.00 22.60 10.84 21.65Q9.67 20.69 8.19 20.94Q6.70 21.18 6.17 19.77Q5.64 18.36 4.23 17.83Q2.82 17.30 3.06 15.81Q3.31 14.33 2.35 13.16Q1.40 12.00 2.35 10.84Q3.31 9.67 3.06 8.19Q2.82 6.70 4.23 6.17Q5.64 5.64 6.17 4.23Q6.70 2.82 8.19 3.06Q9.67 3.31 10.84 2.35Z" fill="currentColor"/><path d="M7.7 12.3l2.8 2.8 5.8-5.9" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  function oddMacros(k, p, c, f) { const est = 4 * p + 4 * c + 9 * f; if (k < 15 && est < 15) return false; return Math.abs(k - est) > Math.max(25, 0.22 * Math.max(k, est)); }
  function customFood(c) {
    const g = c.g || 100, k = 100 / g;
    const m = { kcal: c.kcal * k, p: c.p * k, c: c.c * k, f: c.f * k };
    Object.keys(c.n || {}).forEach(function (key) { m[key] = c.n[key] * k; });
    return { id: c.id, name: c.name, cat: 'My foods', custom: true, noG: !c.g, m: m, por: [['1 ' + c.unit, g]], w: wordsOf(c.name), first: mainWords(c.name) };
  }
  // Extra label nutrients you can add to your own foods (per serving).
  const LABEL_NUTS = [['fib', 'Fiber', 'g'], ['sug', 'Sugars', 'g'], ['sat', 'Saturated fat', 'g'], ['na', 'Sodium', 'mg'], ['k', 'Potassium', 'mg'], ['ca', 'Calcium', 'mg'], ['fe', 'Iron', 'mg'], ['vD', 'Vitamin D', 'µg']];
  // Scanned products (Open Food Facts), per 100 g.
  function offFood(o) {
    return { id: o.id, name: o.name + (o.brand ? ' · ' + o.brand : ''), cat: 'Open Food Facts', off: true, m: o.n, por: o.sv ? [['1 serving', o.sv]] : [], w: wordsOf(o.name + ' ' + (o.brand || '')), first: mainWords(o.name) };
  }
  // Recipes: totals from their ingredients, per serving. Null until the ingredients can be looked up.
  // A logged item's food. A recipe adjusted for one day carries its own ingredients (it.rc).
  function itemFood(it) {
    if (!it.ref) return null;
    if (it.rc && it.ref.charAt(0) === 'r') return recipeFood({ id: it.ref, name: it.name, servings: it.rc.servings, cookedG: it.rc.cookedG, items: it.rc.items });
    return getFood(it.ref);
  }
  function itemNeedsDB(it) { return it.rc ? it.rc.items.some(function (x) { return x.ref.charAt(0) === 'u'; }) : needsDB(it.ref); }
  function needsDB(ref) {
    if (ref.charAt(0) === 'u') return true;
    const rc = ref.charAt(0) === 'r' && state.recipes.find(function (x) { return x.id === ref; });
    return !!(rc && rc.items.some(function (it) { return it.ref.charAt(0) === 'u'; }));
  }
  // Weight of one serving: from the cooked weight if you entered it, otherwise from the ingredients' weight.
  function recipeServingG(rc) { return rc.cookedG ? rc.cookedG / rc.servings : Math.max(1, rc.items.reduce(function (a, it) { return a + (it.g || 0); }, 0)) / rc.servings; }
  function recipeFood(rc) {
    if (!foodDB && rc.items.some(function (it) { return it.ref.charAt(0) === 'u'; })) return null;
    const tot = {}, keys = foodDB ? Object.keys(foodDB.K) : ['kcal', 'p', 'c', 'f'];
    let missing = 0;
    rc.items.forEach(function (it) {
      const f = getFood(it.ref); if (!f) { missing++; return; }
      keys.forEach(function (k) { const v = per100(f, k); if (v != null) tot[k] = (tot[k] || 0) + v * it.g / 100; });
    });
    const sg = recipeServingG(rc), m = {};
    Object.keys(tot).forEach(function (k) { m[k] = tot[k] / rc.servings / sg * 100; });
    return { id: rc.id, name: rc.name, cat: 'Recipe', recipe: true, rawG: !rc.cookedG, missing: missing, m: m, por: [['1 serving', sg]], w: wordsOf(rc.name), first: mainWords(rc.name) };
  }
  function getFood(ref) {
    if (!ref) return null;
    const t = ref.charAt(0), find = function (list) { return list.find(function (x) { return x.id === ref; }); };
    if (t === 'c') { const c = find(state.myFoods); return c ? customFood(c) : null; }
    if (t === 'o') { const o = find(state.offFoods); return o ? offFood(o) : null; }
    if (t === 'r') { const rc = find(state.recipes); return rc ? recipeFood(rc) : null; }
    return foodDB ? foodDB.byId[ref] || null : coreDB ? coreDB.byId[ref] || null : null;
  }
  // After you change one of your foods or recipes, redo the numbers everywhere it was used (diary days and meals).
  function refreshRefs(ids) {
    const inRc = function (items) { return (items || []).some(function (x) { return ids[x.ref]; }); };
    const hit = function (it) {
      if (!it.ref || !it.g) return false;
      if (ids[it.ref] || it.rc && inRc(it.rc.items)) return true;
      const rc = it.ref.charAt(0) === 'r' && !it.rc && state.recipes.find(function (x) { return x.id === it.ref; });
      return !!(rc && inRc(rc.items));
    };
    const fix = function (it) {
      if (!hit(it)) return false;
      const f = itemFood(it); if (!f) return false;
      // Logged as "1 piece" or "2 servings": follow the new serving weight too.
      const u = it.qty && it.unit && it.unit !== 'g' && it.unit !== 'oz' ? unitsFor(f).find(function (x) { return x.label === it.unit && !x.mine; }) : null;
      const g = u ? Math.round(it.qty * u.g * 10) / 10 : it.g, m = macrosFor(f, g);
      if (g === it.g && m.kcal === it.kcal && m.protein === it.protein && m.carbs === it.carbs && m.fat === it.fat) return false;
      it.g = g; Object.assign(it, m); return true;
    };
    const sumUp = function (o, items) { ['kcal', 'protein', 'carbs', 'fat'].forEach(function (k) { o[k] = Math.round(items.reduce(function (a, x) { return a + (x[k] || 0); }, 0)); }); };
    let logged = 0, meals = 0;
    Object.keys(state.food).forEach(function (d) {
      state.food[d].forEach(function (it) {
        if (Array.isArray(it.mi)) { let ch = false; it.mi.forEach(function (x) { if (fix(x)) ch = true; }); if (ch) { sumUp(it, it.mi); logged++; } }
        else if (fix(it)) logged++;
      });
    });
    state.meals.forEach(function (m) { let ch = false; m.items.forEach(function (x) { if (fix(x)) ch = true; }); if (ch) meals++; });
    return { logged: logged, meals: meals };
  }
  function refreshNote(r) {
    const a = [];
    if (r.logged) a.push(r.logged + ' logged ' + (r.logged === 1 ? 'item' : 'items'));
    if (r.meals) a.push(r.meals + ' saved ' + (r.meals === 1 ? 'meal' : 'meals'));
    return a.length ? ' · updated ' + a.join(' and ') : '';
  }
  function per100(f, key) { if (f.m) return f.m[key] != null ? f.m[key] : null; const i = foodDB.K[key]; return i == null ? null : f.n[i]; }
  function macrosFor(f, g) {
    const q = g / 100, v = function (k) { const x = per100(f, k); return x == null ? 0 : x * q; };
    return { kcal: Math.round(v('kcal')), protein: Math.round(v('p')), carbs: Math.round(v('c')), fat: Math.round(v('f')) };
  }
  // Household units for a food ("cup, chopped" = 136 g), then grams and ounces.
  function unitsFor(f) {
    const out = [];
    (f.por || []).forEach(function (p) {
      const m = /^(\d+(?:\.\d+)?)\s+(.+)$/.exec(p[0]); let a = 1, lbl = p[0];
      if (m) { a = parseFloat(m[1]) || 1; lbl = m[2]; }
      if (!out.some(function (u) { return u.label === lbl; })) out.push({ label: lbl, g: p[1] / a });
    });
    (state.portions[f.id] || []).forEach(function (p) { if (!out.some(function (u) { return u.label === p.l; })) out.push({ label: p.l, g: p.g, mine: true }); });
    if (!f.noG) { out.push({ label: 'g', g: 1 }); out.push({ label: 'oz', g: 28.3495 }); }
    return out;
  }
  // A sensible starting amount: the food's first portion, but 100 g instead of tiny US measures like "1 oz".
  function defaultServing(f) { const us = unitsFor(f), u = us[0]; if (u.label === 'g' || ((u.label === 'oz' || u.label === 'fl oz' || /^1 (fl )?oz\b/.test(u.label)) && !f.noG)) return { qty: 100, unit: us.find(function (x) { return x.label === 'g'; }) || u }; return { qty: 1, unit: u }; }
  function fmtQty(q) { return String(Math.round(q * 100) / 100); }
  // "2 eggs", "1 slice", "2 cups, chopped": the unit reads naturally for the amount. A unit that already has a
  // size in it (USDA's "5.3 oz container") shows as "5.3 oz container", or "2 × 5.3 oz container".
  const UNIT_PL = { egg: 'eggs', slice: 'slices', piece: 'pieces', cup: 'cups', serving: 'servings', bowl: 'bowls', plate: 'plates', sandwich: 'sandwiches', patty: 'patties',
    fillet: 'fillets', bar: 'bars', loaf: 'loaves', burger: 'burgers', wing: 'wings', nugget: 'nuggets', glass: 'glasses', can: 'cans', bottle: 'bottles', box: 'boxes',
    unit: 'units', skewer: 'skewers', date: 'dates', pita: 'pitas', container: 'containers', fruit: 'fruits', stick: 'sticks', scoop: 'scoops', packet: 'packets', bag: 'bags', jar: 'jars', pot: 'pots', mug: 'mugs' };
  function fmtAmt(qty, unit) {
    if (unit === 'g') return fmtQty(qty) + ' g';
    let u = String(unit || '').replace(/^small\/regular fillet$/, 'fillet');
    if (/^\d/.test(u)) return qty === 1 ? u : fmtQty(qty) + ' × ' + u;
    if (qty > 1) u = u.replace(/^([^,(]*?)([a-z]+)(?=\s*(,|\(|$))/i, function (all, pre, w) { return pre + (UNIT_PL[w.toLowerCase()] || w); });
    return fmtQty(qty) + ' ' + u;
  }
  // The amount you logged last time (amount and unit), so you don't have to type it again.
  let lastCache = { sig: null, map: null };
  // The amount you had last time: for this meal if you've had it at this meal before (2 eggs at breakfast, 3 at dinner), else any time.
  function lastPortion(ref, meal) {
    const sig = Object.keys(state.food).length + ':' + JSON.stringify(state.food[todayISO()] || []).length;
    if (lastCache.sig !== sig) { const map = {}; Object.keys(state.food).sort().forEach(function (d) { state.food[d].forEach(function (it) { if (it.ref && !it.plan) { const v = { qty: it.qty, unit: it.unit, g: it.g }; [it.ref, it.ref + '|' + mealOf(it)].forEach(function (k) { (map[k] = map[k] || []).push(v); }); } }); }); lastCache = { sig: sig, map: map, pick: {} }; }
    // Your usual amount: the one you picked most often in your last 8 times (the latest wins a tie).
    const pickFor = function (k) {
      if (lastCache.pick[k] !== undefined) return lastCache.pick[k];
      const l = lastCache.map[k]; if (!l) return (lastCache.pick[k] = null);
      const recent = l.slice(-8), cnt = {}; let best = null, bn = 0;
      recent.forEach(function (v, i) { const key = v.qty + '|' + v.unit; cnt[key] = (cnt[key] || 0) + 1; if (cnt[key] >= bn) { bn = cnt[key]; best = v; } });
      return (lastCache.pick[k] = Object.assign({ n: bn }, best));
    };
    return (meal && pickFor(ref + '|' + meal)) || pickFor(ref) || null;
  }
  function servingLine(f, meal) {
    const lp = lastPortion(f.id, meal), u = lp && unitsFor(f).find(function (x) { return x.label === lp.unit; });
    if (u) return fmtAmt(lp.qty, lp.unit) + ' · ' + fmtKcal(macrosFor(f, lp.qty * u.g).kcal) + ' kcal · ' + (lp.n >= 2 ? 'your usual' : 'last time');
    const s = defaultServing(f); return fmtAmt(s.qty, s.unit.label) + ' · ' + fmtKcal(macrosFor(f, s.qty * s.unit.g).kcal) + ' kcal';
  }
  function isFav(ref) { return state.favs.indexOf(ref) >= 0; }
  function mealTotal(items) { return items.reduce(function (a, f) { return a + f.kcal; }, 0); }
  // How often each food was logged lately, for Recent and for ranking search results.
  // A whole meal brought in from Cronometer (one entry, many foods). Copies get new ids, so check the content too.
  function isImported(it) { return /^cr-/.test(it.id) || (!it.ref && !it.mid && !!it.n && Object.keys(it.n).length > 0); }
  // What you've eaten in the last 120 days, newest first: each food once (order) with how often (use).
  // Meals you logged are kept apart (meals / mUse, keys "m:<id>"), and the foods inside them count as eaten too.
  // all / allUse mix both, newest first, for the lists that show meals and foods together.
  function foodUse() {
    const use = {}, order = [], mUse = {}, meals = [], from = dayNum(todayISO()) - 120; let n = 0;
    const add = function (k, it) { if (!use[k]) { use[k] = 0; order.push({ key: k, item: it, s: n++ }); } use[k]++; };
    Object.keys(state.food).sort().reverse().forEach(function (dt) {
      if (dayNum(dt) < from) return;
      state.food[dt].slice().reverse().forEach(function (it) {
        if (isDailyTotal(it) || it.plan || isImported(it)) return; // imported days are whole meals, not foods
        if (it.mid) {
          const mk = 'm:' + it.mid; if (!mUse[mk]) { mUse[mk] = 0; meals.push({ key: mk, item: it, s: n++ }); } mUse[mk]++;
          (it.mi || []).forEach(function (x) { if (x.ref) add(x.ref, x); });
          return;
        }
        add(it.ref || ('q|' + it.name + '|' + it.kcal + '|' + it.protein + '|' + it.carbs + '|' + it.fat), it);
      });
    });
    const hid = state.ui.hide, ord = hid.length ? order.filter(function (o) { return hid.indexOf(o.key) < 0; }) : order;
    const all = ord.concat(meals.filter(function (o) { return hid.indexOf(o.key) < 0; })).sort(function (a, b) { return a.s - b.s; });
    return { use: use, order: ord, mUse: mUse, meals: meals, all: all, allUse: Object.assign({}, use, mUse) };
  }
  // "Fish, salmon", "Cheese, feta": the real name is the second word.
  const CLASS_WORDS = ['fish', 'beverage', 'nut', 'seed', 'cereal', 'spice', 'crustacean', 'mollusk', 'oil', 'snack', 'sugar', 'cheese', 'sauce', 'soup', 'candy', 'cracker', 'cookie', 'cake', 'pie', 'bread', 'pasta', 'beans', 'bean', 'pepper', 'juice', 'cream', 'yogurt', 'milk', 'pork', 'lamb', 'veal', 'beef', 'chicken', 'turkey', 'egg'];
  const CAT_PENALTY = { 'Baby Foods': 30, 'Fast Foods': 5, 'Restaurant Foods': 5, 'Meals, Entrees, and Side Dishes': 3, 'Sausages and Luncheon Meats': 6, 'Packaged foods': 4 };
  // Each search word may also match its synonym (foul → fava, رز → rice).
  // Whole phrases that mean one food, everyday / UK spellings, and amounts typed into a search ("chicken 200g").
  const PHRASES = [
    ['بطاطا حلوه', 'sweet potato'], ['فول سوداني', 'peanut'], ['زيت زيتون', 'olive oil'], ['زيت ذره', 'corn oil'], ['زيت عباد الشمس', 'sunflower oil'], ['صدور فراخ', 'chicken breast'], ['صدر فراخ', 'chicken breast'], ['صدور دجاج', 'chicken breast'], ['ورك فراخ', 'chicken thigh'], ['اوراك فراخ', 'chicken thigh'], ['اجنحه فراخ', 'chicken wing'],
    ['لحمه مفرومه', 'ground beef'], ['لحم مفروم', 'ground beef'], ['بيض مسلوق', 'egg hard-boiled'], ['بيض مقلي', 'egg fried'], ['بيض اومليت', 'omelet'], ['عسل اسود', 'molasses'], ['جوز هند', 'coconut'], ['ديك رومي', 'turkey'], ['لحم ضاني', 'lamb'], ['لحمه ضاني', 'lamb'], ['ايس كريم', 'ice cream'], ['هوت دوج', 'hot dog'],
    ['فلفل حار', 'chili pepper'], ['فلفل رومي', 'pepper sweet'], ['بصل اخضر', 'onion green'], ['جبنه بيضا', 'white cheese'], ['جبنه بيضاء', 'white cheese'], ['جبنه شيدر', 'cheddar'], ['جبنه موتزاريلا', 'mozzarella'], ['رز ابيض', 'rice white'], ['رز بني', 'rice brown'], ['عيش توست', 'bread white'], ['عيش اسمر', 'bread whole-wheat'],
    ['لبن رايب', 'buttermilk'], ['لبن زبادي', 'yogurt'], ['زبده فول سوداني', 'peanut butter'], ['كورن فليكس', 'cornflakes'], ['بيبسي دايت', 'pepsi diet'], ['كوكا كولا', 'coca cola'], ['مياه غازيه', 'sparkling water'], ['بطاطس محمره', 'french fries'], ['بطاطس مقليه', 'french fries'], ['بطاطس مسلوقه', 'potato boiled'],
    ['spring onion', 'onion green'], ['spring onions', 'onion green'], ['scallion', 'onion green'], ['scallions', 'onion green'], ['jacket potato', 'potato baked'], ['mashed potato', 'potato mashed'], ['sweetcorn', 'corn sweet'], ['ice lolly', 'ice pop'], ['fizzy drink', 'soft drink'], ['minced beef', 'ground beef'], ['beef mince', 'ground beef'], ['lamb mince', 'ground lamb'],
    ['crisps', 'potato chips'], ['porridge', 'oatmeal'], ['rocket', 'arugula'], ['yoghurt', 'yogurt'], ['yoghurts', 'yogurt'], ['chilli', 'chili'], ['chillies', 'chili'], ['flavour', 'flavor'], ['catsup', 'ketchup'], ['garbanzo', 'chickpea'], ['garbanzos', 'chickpea'], ['icing sugar', 'sugar powdered'], ['caster sugar', 'sugar'], ['wholemeal', 'whole-wheat'], ['wholegrain', 'whole grain'], ['rapeseed oil', 'canola oil'], ['broad beans', 'fava beans'], ['potatoe', 'potato'], ['kawareh', 'kaware'], ['kawar3', 'kaware'], ['كوارع', 'kaware'], ['potatos', 'potato'], ['tomatoe', 'tomato'], ['tomatos', 'tomato'], ['brocoli', 'broccoli'], ['brocolli', 'broccoli'], ['chiken', 'chicken'], ['chikin', 'chicken'], ['bannana', 'banana'], ['bananna', 'banana'], ['avacado', 'avocado'], ['yougurt', 'yogurt'], ['yogourt', 'yogurt'], ['cheeze', 'cheese'], ['sandwhich', 'sandwich'], ['sandwitch', 'sandwich'], ['spagetti', 'spaghetti'], ['spaghetti bolognese', 'spaghetti meat sauce'], ['protien', 'protein'], ['oatmeel', 'oatmeal'], ['cucmber', 'cucumber'], ['letuce', 'lettuce'], ['strawbery', 'strawberry'], ['rasberry', 'raspberry'], ['blueberry', 'blueberry'], ['tuna fish', 'tuna'], ['salmon fish', 'salmon']
  ].map(function (x) { return [normText(x[0]), x[1]]; }).sort(function (a, b) { return b[0].length - a[0].length; });
  const UNIT_WORDS = { g: 1, gm: 1, gr: 1, gram: 1, grams: 1, kg: 1, ml: 1, l: 1, oz: 1, cup: 1, cups: 1, tbsp: 1, tsp: 1, piece: 1, pieces: 1, slice: 1, slices: 1, serving: 1, servings: 1, kcal: 1, cal: 1, calories: 1, 'جرام': 1, 'جم': 1, 'كيلو': 1, 'كوب': 1, 'معلقه': 1, 'حبه': 1, 'سعر': 1, 'سعره': 1 };
  function prepQuery(q) {
    let t = ' ' + normText(q) + ' ';
    PHRASES.forEach(function (x) { if (t.indexOf(' ' + x[0] + ' ') >= 0) t = t.split(' ' + x[0] + ' ').join(' ' + x[1] + ' '); });
    const ws = t.trim().split(' '), kept = ws.filter(function (w) { return !(/^\d+(?:[.,]\d+)?(?:g|gm|gr|kg|ml|l|oz|k)?$/.test(w) || UNIT_WORDS[w]); });
    return (kept.length ? kept : ws).join(' ');
  }
  function queryToks(q) {
    return wordsOf(prepQuery(q)).map(function (t) {
      const a = [t];
      const br = BRAND_OF[t]; if (br && br.indexOf(' ') < 0 && br !== t) a.push(stem(br)); // جهينه → juhayna (and the other way round)
      Object.keys(BRANDS).forEach(function (b) { if (b === t) BRANDS[b].forEach(function (x) { if (x.indexOf(' ') < 0) a.push(stem(normText(x))); }); });
      // Arabic "with"/"and" stuck to the word: بلبن → لبن, وجبنه → جبنه.
      if (/^[\u0628\u0648][\u0621-\u064A]{2,}/.test(t) && FOOD_SYNONYMS[t.slice(1)]) a.push(t.slice(1));
      a.slice().forEach(function (x) { const s = FOOD_SYNONYMS[x]; if (s) a.push(stem(s)); });
      return a;
    });
  }
  function matchTok(alts, w) {
    let hit = -1;
    let syn = false;
    for (let k = 0; k < alts.length; k++) for (let j = 0; j < w.length; j++) if (w[j].indexOf(alts[k]) === 0) { if (w[j] === alts[k]) return { i: j, exact: true, syn: k > 0 }; if (hit < 0) { hit = j; syn = k > 0; } }
    if (hit < 0 && alts[0].length >= 5) for (let j = 0; j + 1 < w.length; j++) { const two = w[j] + w[j + 1]; if (two.indexOf(alts[0]) === 0 || alts[0].indexOf(two) === 0 && two.length >= 5) return { i: j, exact: two === alts[0], syn: false }; }
    return hit < 0 ? null : { i: hit, exact: false, syn: syn };
  }
  // Edit distance with an early stop (for typos like "chiken").
  function near(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return false;
    let prev = []; for (let j = 0; j <= b.length; j++) prev[j] = j;
    let prev2 = null;
    for (let i = 1; i <= a.length; i++) { const cur = [i]; let best = i; for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1); if (cur[j] < best) best = cur[j]; } if (best > max) return false; prev2 = prev; prev = cur; }
    return prev[b.length] <= max;
  }
  function fuzzyTok(t, w) { const max = t.length >= 7 ? 2 : t.length >= 4 ? 1 : 0; if (!max) return false; for (let j = 0; j < w.length; j++) { const x = w[j]; if (x[0] !== t[0] && x[1] !== t[1]) continue; if (near(t, x, max) || (x.length > t.length && near(t, x.slice(0, t.length), max))) return true; } return false; }
  // Search memory: which food you opened for a search ("chi" → your chicken), on this device.
  function qKey(q) { return normText(q).slice(0, 24); }
  function qMemFor(q) { const k = qKey(q), out = {}; if (!k) return out; Object.keys(state.ui.qmem).forEach(function (m) { if (m === k || (k.length >= 2 && m.indexOf(k) === 0)) { const v = state.ui.qmem[m]; Object.keys(v).forEach(function (id) { out[id] = (out[id] || 0) + v[id] * (m === k ? 2 : 1); }); } }); return out; }
  function qRemember(q, id) {
    const k = qKey(q); if (!k || k.length < 2 || !REF_RE.test(id)) return;
    const m = state.ui.qmem; m[k] = m[k] || {}; m[k][id] = Math.min(999, (m[k][id] || 0) + 1);
    const ks = Object.keys(m); if (ks.length > 300) delete m[ks[0]];
    save();
  }
  // Words that mean "a dish or product made from it", not the food itself.
  // Three-letter words that are foods on their own (shorter words could still be half-typed: "tom" → tomato).
  const SHORT_FOODS = { egg: 1, pea: 1, oil: 1, tea: 1, ham: 1, jam: 1, fig: 1, yam: 1, rye: 1, soy: 1, oat: 1, gum: 1, ice: 1 };
  const FILLER = { fresh: 1, plain: 1, homemade: 1, natural: 1, organic: 1, regular: 1, normal: 1, 'طازج': 1, 'سادة': 1, 'ساده': 1, 'بيتي': 1 };
  const DERIVED = {}; ['pie', 'bread', 'cake', 'soup', 'sauce', 'oil', 'juice', 'dip', 'pickled', 'candy', 'candied', 'sandwich', 'pudding', 'seasoning', 'syrup', 'flour', 'nectar', 'jam', 'spread', 'butter', 'dressing', 'leaf', 'leaves', 'powder', 'bar', 'cookie', 'muffin', 'drink', 'flavored', 'dried', 'frozen', 'tortilla', 'paste', 'chip', 'cracker', 'roll', 'salad', 'baby', 'formula', 'substitute', 'imitation', 'meatless'].forEach(function (w) { DERIVED[w] = 1; });
  // The plain, everyday version for very common searches (the raw or basic food people usually mean).
  const TOP_PICKS = { potato: 'Potatoes, flesh and skin, raw', potatoes: 'Potatoes, flesh and skin, raw', 'بطاطس': 'Potatoes, flesh and skin, raw', 'بطاطا': 'Potatoes, flesh and skin, raw', chips: 'Potato chips, NFS', 'potato chips': 'Potato chips, NFS', flour: 'Wheat flour, white, all-purpose, enriched, bleached', 'دقيق': 'Wheat flour, white, all-purpose, enriched, bleached', spaghetti: 'Pasta, cooked, enriched, without added salt', pasta: 'Pasta, cooked, enriched, without added salt', 'مكرونه': 'Pasta, cooked, enriched, without added salt', 'minced meat': 'Beef, ground, 85% lean meat / 15% fat, crumbles, cooked, pan-browned', 'ground beef': 'Beef, ground, 85% lean meat / 15% fat, crumbles, cooked, pan-browned', 'لحمه مفرومه': 'Beef, ground, 85% lean meat / 15% fat, crumbles, cooked, pan-browned', olives: 'Olives, ripe, canned (small-extra large)', olive: 'Olives, ripe, canned (small-extra large)', 'زيتون': 'Olives, ripe, canned (small-extra large)', peanuts: 'Peanuts, all types, dry-roasted, without salt', peanut: 'Peanuts, all types, dry-roasted, without salt', 'سوداني': 'Peanuts, all types, dry-roasted, without salt', donut: 'Doughnuts, cake-type, plain', doughnut: 'Doughnuts, cake-type, plain', peach: 'Peaches, yellow, raw', peaches: 'Peaches, yellow, raw', 'خوخ': 'Peaches, yellow, raw', zucchini: 'Squash, summer, zucchini, includes skin, raw', 'كوسه': 'Squash, summer, zucchini, includes skin, raw', 'bell pepper': 'Peppers, sweet, red, raw', 'فلفل رومي': 'Peppers, sweet, red, raw', cream: 'Cream, fluid, heavy whipping', rice: 'Rice, white, long-grain, regular, enriched, cooked', 'رز': 'Rice, white, long-grain, regular, enriched, cooked', 'ارز': 'Rice, white, long-grain, regular, enriched, cooked', bamya: 'Bamia (okra stew with meat) · بامية باللحمة', bamia: 'Bamia (okra stew with meat) · بامية باللحمة', 'باميه': 'Bamia (okra stew with meat) · بامية باللحمة', 'baladi bread': 'Aish baladi (Egyptian bread) · عيش بلدي', 'aish baladi': 'Aish baladi (Egyptian bread) · عيش بلدي', 'eish baladi': 'Aish baladi (Egyptian bread) · عيش بلدي', 'عيش': 'Aish baladi (Egyptian bread) · عيش بلدي', 'عيش بلدي': 'Aish baladi (Egyptian bread) · عيش بلدي', '3eish': 'Aish baladi (Egyptian bread) · عيش بلدي', coffee: 'Beverages, coffee, brewed, prepared with tap water', 'قهوه': 'Beverages, coffee, brewed, prepared with tap water', liver: 'Beef, variety meats and by-products, liver, cooked, pan-fried', 'كبده': 'Beef, variety meats and by-products, liver, cooked, pan-fried', shrimp: 'Crustaceans, shrimp, cooked', 'جمبري': 'Crustaceans, shrimp, cooked', tuna: 'Fish, tuna, light, canned in water, drained solids', 'تونه': 'Fish, tuna, light, canned in water, drained solids', 'condensed milk': 'Milk, canned, condensed, sweetened', 'dark chocolate': 'Chocolate, dark, 70-85% cacao solids', mint: 'Spearmint, fresh', 'نعناع': 'Spearmint, fresh', cinnamon: 'Spices, cinnamon, ground', 'قرفه': 'Spices, cinnamon, ground', 'black pepper': 'Spices, pepper, black', 'فلفل اسود': 'Spices, pepper, black', tofu: 'Tofu, raw, firm, prepared with calcium sulfate', 'milk chocolate': 'Candies, milk chocolate', duck: 'Duck, domesticated, meat only, cooked, roasted', 'بط': 'Duck, domesticated, meat only, cooked, roasted', beet: 'Beets, raw', beets: 'Beets, raw', beetroot: 'Beets, raw', 'بنجر': 'Beets, raw', 'beef mince': 'Beef, ground, 85% lean meat / 15% fat, crumbles, cooked, pan-browned', steak: 'Beef, rib eye steak, boneless, lip off, separable lean and fat, trimmed to 0" fat, all grades, cooked, grilled', 'ستيك': 'Beef, rib eye steak, boneless, lip off, separable lean and fat, trimmed to 0" fat, all grades, cooked, grilled' , 'toast': 'Bread, white, commercially prepared, toasted', 'brown bread': 'Bread, whole-wheat, commercially prepared', 'burger': 'Hamburger, NFS', 'pizza': 'Pizza, cheese, from restaurant or fast food, NS as to type of crust', 'cheese pizza': 'Pizza, cheese, from restaurant or fast food, NS as to type of crust', 'soda': 'Beverages, carbonated, cola, regular', 'cola': 'Beverages, carbonated, cola, regular', 'coke': 'Beverages, carbonated, cola, regular', 'coca cola': 'Beverages, carbonated, cola, regular', 'diet coke': 'Beverages, carbonated, low calorie, cola or pepper-type, with aspartame, contains caffeine', 'diet cola': 'Beverages, carbonated, low calorie, cola or pepper-type, with aspartame, contains caffeine', 'fanta': 'Beverages, carbonated, orange', 'orange soda': 'Beverages, carbonated, orange', 'juice': 'Orange juice, raw', 'عصير': 'Orange juice, raw', 'oil': 'Sunflower oil', 'زيت': 'Sunflower oil', 'bacon': 'Bacon, NS as to type of meat, cooked', 'macaroni': 'Pasta, cooked, enriched, without added salt', 'melon': 'Cantaloupe, raw', 'شمام': 'Cantaloupe, raw', 'كانتالوب': 'Cantaloupe, raw', 'green tea': 'Beverages, tea, green, brewed, regular', 'شاي اخضر': 'Beverages, tea, green, brewed, regular', 'mushroom soup': 'Soup, cream of mushroom', 'hot sauce': 'Sauce, ready-to-serve, pepper or hot', 'white cheese': 'Gebna domiati (white cheese) · جبنة دمياطي', 'جبنه بيضاء': 'Gebna domiati (white cheese) · جبنة دمياطي', 'جبنه بيضا': 'Gebna domiati (white cheese) · جبنة دمياطي', 'gebna': 'Gebna domiati (white cheese) · جبنة دمياطي', 'gebna beda': 'Gebna domiati (white cheese) · جبنة دمياطي', '3esh': 'Aish baladi (Egyptian bread) · عيش بلدي', 'aish': 'Aish baladi (Egyptian bread) · عيش بلدي', 'eish': 'Aish baladi (Egyptian bread) · عيش بلدي', '3eish baladi': 'Aish baladi (Egyptian bread) · عيش بلدي', 'ta3meya': 'Taameya (Egyptian falafel) · طعمية', 'ta3mia': 'Taameya (Egyptian falafel) · طعمية', 'taameya': 'Taameya (Egyptian falafel) · طعمية', 'tameya': 'Taameya (Egyptian falafel) · طعمية', 'mloukhia': 'Molokhia · ملوخية', 'molokheya': 'Molokhia · ملوخية', 'mlokhia': 'Molokhia · ملوخية', 'molokhia': 'Molokhia · ملوخية', 'melokhia': 'Molokhia · ملوخية', 'black coffee': 'Beverages, coffee, brewed, prepared with tap water', 'قهوه سادة': 'Beverages, coffee, brewed, prepared with tap water', 'wine': 'Alcoholic beverage, wine, table, red', 'cereal': 'Cereal, corn flakes, plain', 'cornflakes': 'Cereal, corn flakes, plain', 'corn flakes': 'Cereal, corn flakes, plain' , 'mac and cheese': 'Macaroni or noodles with cheese', 'mac n cheese': 'Macaroni or noodles with cheese' , 'unsalted butter': 'Butter, without salt', 'salted butter': 'Butter, salted', 'butter': 'Butter, salted' };
  const POPULAR = {}; ['Egg, whole, cooked, hard-boiled', 'Egg, whole, raw, fresh', 'Egg, whole, cooked, fried', 'Egg, whole, cooked, scrambled', 'Bananas, raw', 'Apples, raw, with skin', 'Oranges, raw, all commercial varieties', 'Bread, white, commercially prepared', 'Rice, white, long-grain, regular, enriched, cooked', 'Chicken, breast, meat only, cooked, roasted', 'Chicken, breast, skinless, boneless, meat only, raw', 'Milk, whole, 3.25% milkfat, with added vitamin D', 'Yogurt, plain, whole milk', 'Yogurt, Greek, plain, nonfat', 'Cheese, feta', 'Cheese, cheddar', 'Cheese, mozzarella, whole milk', 'Cheese, cottage, lowfat, 2% milkfat', 'Tomatoes, red, ripe, raw, year round average', 'Cucumber, with peel, raw', 'Potatoes, flesh and skin, raw', 'Potatoes, boiled, cooked without skin, flesh, without salt', 'Olive oil', 'Butter, salted', 'Sugars, granulated', 'Honey', 'Beverages, coffee, brewed, prepared with tap water', 'Beverages, tea, black, brewed, prepared with tap water', 'Beef, ground, 85% lean meat / 15% fat, crumbles, cooked, pan-browned', 'Fish, tuna, light, canned in water, drained solids', 'Pasta, cooked, enriched, without added salt', 'Lentils, mature seeds, cooked, boiled, without salt', 'Fava beans, cooked', 'Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt', 'Peanut butter, smooth style, without salt', 'Almonds, NFS', 'Dates, medjool', 'Watermelon, raw', 'Mangos, raw', 'Strawberries, raw', 'Grapes, red or green (European type, such as Thompson seedless), raw', 'Carrots, raw', 'Lettuce, cos or romaine, raw', 'Onions, raw', 'Spinach, raw', 'Fish, salmon, Atlantic, farmed, cooked, dry heat', 'Crustaceans, shrimp, cooked', 'Fish, tilapia, cooked, dry heat', 'Sweet potato, cooked, baked in skin, flesh, without salt', 'Broccoli, raw', 'Oats', 'Cereals, oats, regular and quick, not fortified, dry', 'Avocados, raw, all commercial varieties', 'Guavas, common, raw', 'Pomegranates, raw', 'Figs, raw', 'Peaches, yellow, raw', 'Pears, raw', 'Garlic, raw', 'Eggplant, raw', 'Squash, summer, zucchini, includes skin, raw', 'Peppers, sweet, red, raw', 'Corn, sweet, yellow, raw', 'Peas, green, frozen, cooked, boiled, drained, without salt', 'Beans, kidney, all types, mature seeds, cooked, boiled, without salt', 'Chocolate, dark, 70-85% cacao solids', 'Ice creams, vanilla', 'Potato chips, NFS', 'Wheat flour, white, all-purpose, enriched, bleached', 'Bread, whole-wheat, commercially prepared', 'Bread, pita, white, enriched', 'Cream, fluid, heavy whipping', 'Beverages, Whey protein powder isolate'].forEach(function (n) { POPULAR[n] = 1; });
  // Nutrient searches: "high protein", "low carb snack", "بروتين عالي"… sort by what you asked for.
  const INTENTS = [
    { k: 'p', dir: -1, per: 'kcal', label: 'Most protein per calorie', re: /\b(high|rich|lots of|more|good) ?protein\b|\bprotein (rich|high|packed)\b|بروتين عالي|غني بالبروتين|عالي البروتين|بروتين كتير/ },
    { k: 'c', dir: 1, per: 'kcal', label: 'Fewest carbs per calorie', re: /\b(low|no|zero|less) ?carbs?\b|\bketo\b|\bcarb ?free\b|قليل الكارب|كارب قليل|قليل الكربوهيدرات|كيتو/ },
    { k: 'f', dir: 1, per: 'kcal', label: 'Least fat per calorie', re: /\b(low|no|zero|less) ?fat\b|\bfat ?free\b|قليل الدهون|قليل الدسم|بدون دهون/ },
    { k: 'kcal', dir: 1, per: 'g', label: 'Fewest calories per 100 g', re: /\b(low|less|few) ?(calories?|cal|kcal)\b|\blight\b|\bdiet\b|قليل السعرات|سعرات قليله|دايت/ },
    { k: 'fib', dir: -1, per: 'kcal', label: 'Most fiber per calorie', re: /\b(high|rich|lots of|more) ?fib(er|re)\b|الياف عاليه|غني بالالياف|الياف كتير/ },
    { k: 'sug', dir: 1, per: 'kcal', label: 'Least sugar per calorie', re: /\b(low|no|zero|less) ?sugar\b|\bsugar ?free\b|قليل السكر|بدون سكر/ }
  ];
  function intentOf(q) { const t = normText(q); for (let i = 0; i < INTENTS.length; i++) { const m = INTENTS[i].re.exec(t); if (m) return { it: INTENTS[i], rest: (t.slice(0, m.index) + ' ' + t.slice(m.index + m[0].length)).replace(/\b(foods?|snacks?|options?|ideas?|meals?|breakfast|lunch|dinner|اكل|اكلات|سناكس|فطار|غدا|عشا)\b/g, ' ').replace(/\s+/g, ' ').trim(), snack: /snack|سناك/.test(t), bf: /breakfast|فطار/.test(t) }; } return null; }
  function intentScore(f, it) { const v = per100(f, it.k), k = per100(f, 'kcal'); if (v == null || !k) return null; return it.per === 'kcal' ? v / k * 100 : v; }
  function intentFoods(it, snack, bf) {
    const out = [];
    foodDB.list.forEach(function (f) {
      if (CAT_PENALTY[f.cat] >= 5 || f.cat === 'Spices and Herbs' || f.cat === 'Packaged foods' || /babyfood|formula|powder|supplement|dry mix|dehydrated|freeze-dried|, raw, unprepared|uncooked|flour|seasoning|sweetener|substitute|gelatin|leavening|extract|isolate|concentrate|crude|gums?\b|peel|\bbran\b|cloud ears|fungi|lard|tallow|suet|anhydrous|shortening|bouillon|by-products|variety meats|game meat|alcoholic|cocktail|liqueur|infant|toddler/i.test(f.name)) return;
      if (f.cat === 'Fats and Oils' || f.cat === 'Beverages' && it.k !== 'kcal' && it.k !== 'sug') return;
      const k = per100(f, 'kcal'), v = intentScore(f, it); if (v == null || k < 20) return;
      if (it.k === 'c' && ((per100(f, 'p') || 0) / k * 100 < 4 || /butter|cream|oil|ghee/i.test(f.name))) return; // "low carb" means real food with protein, not fat or water
      if (snack && !/Snacks|Sweets|Fruits|Nut and Seed|Dairy|Baked/i.test(f.cat || '')) return;
      if (bf && !/Dairy and Egg|Breakfast Cereals|Baked|Fruits|Egg|Yogurt|Cheese|Bread|Breakfast/i.test(f.cat || '')) return;
      if ((it.k === 'f' || it.k === 'c' || it.k === 'sug') && /Sweets|Snacks/.test(f.cat || '') && !snack) return;
      if (/meatless|liquid from|composite|imported|baking chocolate|unsweetened, liquid/i.test(f.name)) return;
      // Everyday foods (as eaten, popular, or ones you have) beat odd ones with a slightly better number.
      const everyday = 1 + (f.src === 'fndds' ? 0.25 : 0) + (POPULAR[f.on || f.name] ? 0.6 : 0) + (f.cat === 'Egyptian dishes' || f.cat === 'Dishes (estimate)' ? 0.3 : 0);
      out.push([it.dir < 0 ? v * everyday : -(v + 1.5) / everyday, f]); // +1.5 so near-zero ties go to everyday foods
    });
    out.sort(function (a, b) { return b[0] - a[0]; });
    return out.slice(0, 60).map(function (x) { return x[1]; });
  }
  function searchFoods(q, use, opts) {
    // Words like "fresh" or "plain" describe what you mean but aren't in food names, so they don't have to match.
    let toks = queryToks(q); const qn = normText(q), qs1 = stem(normText(prepQuery(q))), top = TOP_PICKS[qn] || TOP_PICKS[normText(prepQuery(q))] || (FOOD_SYNONYMS[qs1] && TOP_PICKS[FOOD_SYNONYMS[qs1]]) || null, qset = {};
    if (toks.length > 1) { const kept = toks.filter(function (a) { return !FILLER[a[0]]; }); if (kept.length) toks = kept; }
    toks.forEach(function (a) { a.forEach(function (w) { qset[w] = 1; }); });
    if (!toks.length) return [];
    // A brand in the search puts that brand's products first; otherwise everyday foods come before packaged ones.
    const bq = ' ' + brandQuery(q) + ' ', qBrand = Object.keys(BRANDS).find(function (b) { return bq.indexOf(' ' + b + ' ') >= 0; }) || null, pq = normText(prepQuery(q));
    let pool = state.myFoods.map(customFood).concat(state.offFoods.map(offFood));
    const oneLetter = pq.replace(/\s/g, '').length < 2 && !/[ء-ي]/.test(pq); // one letter: just your own foods (keeps typing smooth)
    const viaIng = [];
    if (!(opts && opts.noRecipes)) state.recipes.forEach(function (rc) { const f = recipeFood(rc); if (!f) return; pool.push(f); const ws = []; rc.items.forEach(function (x) { const n = x.name || (getFood(x.ref) || {}).name || ''; ws.push({ n: n, w: wordsOf(n) }); }); viaIng.push({ f: f, items: ws }); });
    if (!oneLetter) pool = pool.concat(foodDB ? foodDB.list : coreDB ? coreDB.list : []);
    const DB = foodDB || coreDB, res = [], wantsProcessed = /dry|mix|powder|dehydrat|frozen|canned/.test(q.toLowerCase()), vocab = DB && DB.vocab;
    for (let i = 0; i < pool.length; i++) {
      const f = pool[i], w = f.w; let score = 0, ok = true, viaSyn = false;
      for (let t = 0; t < toks.length; t++) {
        const m = matchTok(toks[t], w);
        if (!m) { ok = false; break; }
        // "egg" is a whole word, so eggplant (which only starts with it) is a weaker match; "chick" still finds chicken.
        const weak = !m.exact && vocab && vocab[toks[t][0]] >= 8 && (toks[t][0].length >= 4 || SHORT_FOODS[toks[t][0]]) && !m.syn && !/^(fruit|seeds?|berry|berries)$/.test(w[m.i].slice(toks[t][0].length)); // kiwifruit, flaxseed are still kiwi and flax
        if (m.exact) score += 4; else if (weak) score -= 16;
        if (/^(without|no|non)$/.test(w[m.i - 1] || '') || /^(without|no)$/.test(w[m.i - 2] || '') && w[m.i - 1] === 'added') score -= 30; // "salt" isn't a food "without (added) salt"
        if (m.syn) { score -= 6; viaSyn = true; } // matched through a synonym, not the food's own name
        if (!weak && (f.first.indexOf(w[m.i]) >= 0 || (f.arFirst && f.arFirst.indexOf(w[m.i]) >= 0))) score += 10;
      }
      if (!ok) continue;
      const f0 = toks[0];
      if ((f.heads || [f.first[0]]).some(function (h) { return f0.indexOf(h) >= 0; }) || (CLASS_WORDS.indexOf(f.first[0]) >= 0 && f0.indexOf(f.first[1]) >= 0)) score += 12;
      if (f.first.length === toks.length && toks.every(function (a) { return a.some(function (t) { return f.first.indexOf(t) >= 0; }); })) score += 6;
      score -= (f.len || w.length) * 0.6 + (CAT_PENALTY[f.cat] || 0);
      if (!wantsProcessed && /dry mix|dehydrated|powder|freeze-dried|frozen|canned/i.test(f.on || f.name)) score -= 4;
      if (/\bas ingredient\b/i.test(f.on || f.name)) score -= 12; // a recipe part ("tomatoes as ingredient in omelet"), not something you eat as is
      if (f.pop) score += 9 * f.pop;
      if (f.custom || f.recipe || f.off) score += 25;
      // "olives" → olives before olive oil; "peach" → peaches before peach pie (unless you typed oil / pie).
      for (let di = 0; di < f.first.length; di++) if (DERIVED[f.first[di]] && !qset[f.first[di]]) { score -= 9; break; }
      if (top && (f.on || f.name) === top) score += 60;
      if (POPULAR[f.on || f.name] && !viaSyn) score += 12; // popular, but not over a dish whose own name you typed (fasolia, bamya)
      if (isVerified(f)) score += 3;
      const isPack = f.off || f.cat === 'Packaged foods';
      if (qBrand) { if (isPack && normText(f.name).indexOf(qBrand) >= 0) score += 35; }
      else if (isPack && !use[f.id]) score -= 8;
      const nn = normText((f.on || f.name).split(' · ')[0]);
      if (!isPack || qBrand) { if (nn === pq) score += 15; else if (nn.indexOf(pq) === 0) score += 5; } // the name is what you typed
      if (opts && opts.mealUse && opts.mealUse[f.id]) score += 4 * Math.min(opts.mealUse[f.id], 5); // what you have at this meal
      if (opts && opts.mem && opts.mem[f.id]) score += 30 + 8 * Math.min(opts.mem[f.id], 4); // you picked this for this search before
      if (use[f.id]) score += 22 + 3 * Math.min(use[f.id], 12) + (opts && opts.recent && opts.recent[f.id] != null ? Math.max(0, 10 - opts.recent[f.id]) : 0); // what you eat, and lately
      if (isFav(f.id)) score += 20;
      res.push([score, f]);
    }
    // Your recipes that contain what you searched ("chicken" → your chicken soup), below direct matches.
    viaIng.forEach(function (x) {
      if (res.some(function (r) { return r[1] === x.f; })) return;
      const hit = x.items.find(function (it) { return toks.every(function (a) { return matchTok(a, it.w); }); });
      if (hit) { x.f.via = 'Contains ' + hit.n.split(',')[0]; res.push([38 + (use[x.f.id] ? 20 : 0), x.f]); }
    });
    // Few hits, or only packaged products that share your spelling? Allow small typos too ("brocoli" → broccoli).
    const onlyPack = res.length > 0 && res.every(function (r) { return r[1].off || r[1].cat === 'Packaged foods'; });
    if (res.length < 2 || onlyPack) {
      const got = {}; res.forEach(function (r) { got[r[1].id] = 1; });
      for (let i = 0; i < pool.length; i++) {
        const f = pool[i]; if (got[f.id]) continue;
        if (!toks.every(function (a) { return matchTok(a, f.w) || fuzzyTok(a[0], f.w); })) continue;
        let score = -20 - (f.len || f.w.length) * 0.6 + (f.pop ? 9 * f.pop : 0) + (use[f.id] ? 20 : 0) + (f.custom || f.recipe || f.off ? 15 : 0);
        if (onlyPack && !(f.off || f.cat === 'Packaged foods')) score += 30 + (toks.length === 1 && f.first[0] && fuzzyTok(toks[0][0], [f.first[0]]) ? 10 : 0);
        for (let di = 0; di < f.first.length; di++) if (DERIVED[f.first[di]] && !qset[f.first[di]]) { score -= 9; break; }
        res.push([score, f]);
      }
    }
    // The everyday pick shows first even when its name uses other words (spaghetti → pasta, donut → doughnut).
    if (top && !res.some(function (r) { return (r[1].on || r[1].name) === top; })) { const tf = pool.find(function (f) { return (f.on || f.name) === top; }); if (tf) res.push([1e6, tf]); }
    res.sort(function (a, b) { return b[0] - a[0] || (a[1].on || a[1].name).length - (b[1].on || b[1].name).length; });
    // Same name twice (two "Pepsi" products, or a USDA food and its copy): keep the better one.
    const seenN = {}, out = [];
    for (let i = 0; i < res.length && out.length < ((opts && opts.limit) || 60); i++) { const k = normText(res[i][1].name); if (seenN[k]) continue; seenN[k] = 1; out.push(res[i][1]); }
    return out;
  }
  // Restaurants in the food list, each with its menu (built once).
  let placesCache = null;
  function places() {
    if (!foodDB) return [];
    if (!placesCache) {
      const by = {};
      foodDB.list.forEach(function (f) { if (!f.place) return; const p = by[f.place] || (by[f.place] = { name: f.place, items: [], w: wordsOf(f.place + ' ' + f.palt) }); p.items.push(f); });
      placesCache = Object.keys(by).map(function (k) { return by[k]; });
    }
    return placesCache;
  }
  function placeMatches(q) {
    const qw = queryToks(q); if (!qw.length) return [];
    return places().filter(function (p) { return qw.every(function (a) { return matchTok(a, p.w); }); }).slice(0, 3);
  }
  function nowHM() { const n = new Date(); return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); }
  function fmtHM(t) { const m = /^(\d\d):(\d\d)$/.exec(t || ''); if (!m) return ''; const d = new Date(); d.setHours(+m[1], +m[2], 0, 0); return fmtClock(d.getTime()); }
  // Food added to today gets the time you logged it; food added to a day still to come is planned.
  let justAdded = {}, justAt = 0;
  function addItemsReal(d, items) { return addItems(d, items); }
  function addItems(d, items) {
    justAdded = {}; items.forEach(function (it) { if (it.id) justAdded[it.id] = 1; }); justAt = Date.now(); const t = d === todayISO() ? nowHM() : null, future = d > todayISO(); state.food[d] = foodFor(d).concat(items.map(function (it) { if (future) { it.plan = true; delete it.t; } else if (t && !it.t && !it.plan) it.t = t; return it; })); }
  function newId() { return Math.random().toString(36).slice(2, 10); }
  // Product barcodes: 8, 12, 13 or 14 digits with a valid check digit.
  function validBarcode(c) {
    if (!/^(\d{8}|\d{12,14})$/.test(c)) return false;
    let s = 0; for (let i = c.length - 2, w = 3; i >= 0; i--, w = 4 - w) s += +c[i] * w;
    return (10 - s % 10) % 10 === +c[c.length - 1];
  }
  // Open Food Facts → our per-100 g keys. Their minerals and vitamins are in grams.
  function offNutrients(nt) {
    const n = {}, g = function (k, key, mult) { const v = Number(nt[k + '_100g']); if (nt[k + '_100g'] !== undefined && nt[k + '_100g'] !== '' && isFinite(v) && v >= 0) n[key] = Math.round(v * (mult || 1) * 1000) / 1000; };
    g('energy-kcal', 'kcal'); if (n.kcal == null && nt['energy_100g'] != null) { const kj = Number(nt['energy_100g']); if (isFinite(kj)) n.kcal = Math.round(kj / 4.184); }
    g('proteins', 'p'); g('carbohydrates', 'c'); g('fat', 'f'); g('fiber', 'fib'); g('sugars', 'sug'); g('saturated-fat', 'sat'); g('trans-fat', 'trans'); g('monounsaturated-fat', 'mono'); g('polyunsaturated-fat', 'poly');
    g('cholesterol', 'chol', 1000); g('sodium', 'na', 1000); g('potassium', 'k', 1000); g('calcium', 'ca', 1000); g('iron', 'fe', 1000); g('magnesium', 'mg', 1000); g('zinc', 'zn', 1000); g('phosphorus', 'ph', 1000);
    g('vitamin-c', 'vC', 1000); g('vitamin-a', 'vA', 1e6); g('vitamin-d', 'vD', 1e6); g('vitamin-b12', 'b12', 1e6); g('caffeine', 'caff', 1000); g('alcohol', 'alc');
    return n;
  }
  function lookupBarcode(code) {
    const local = state.offFoods.find(function (o) { return o.code === code; }), mine = state.myFoods.find(function (c) { return c.code === code; });
    if (mine) return Promise.resolve({ food: customFood(mine) });
    if (local) return Promise.resolve({ food: offFood(local) });
    if (foodDB && foodDB.byId['ub' + code]) return Promise.resolve({ food: foodDB.byId['ub' + code] }); // built-in packaged foods work offline
    const ctl = 'AbortController' in window ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
    return fetch('https://world.openfoodfacts.org/api/v2/product/' + code + '.json?fields=code,product_name,product_name_en,product_name_ar,brands,serving_quantity,nutriments', ctl ? { signal: ctl.signal } : {})
      .then(function (r) { if (!r.ok && r.status !== 404) throw new Error('off ' + r.status); return r.json(); })
      .then(function (d) {
        clearTimeout(to);
        const p = d && d.status === 1 && d.product;
        if (!p) return { notFound: true };
        const name = String(p.product_name || p.product_name_en || p.product_name_ar || '').trim().slice(0, 60), n = offNutrients(p.nutriments || {});
        if (n.kcal == null) return { notFound: true, name: name };
        const sv = Number(p.serving_quantity), o = { id: 'o' + code, code: code, name: name || 'Product ' + code, brand: String(p.brands || '').split(',')[0].trim().slice(0, 40), n: n, sv: isFinite(sv) && sv > 0 && sv < 5000 ? Math.round(sv * 10) / 10 : null };
        state.offFoods = [o].concat(state.offFoods.filter(function (x) { return x.code !== code; })).slice(0, 300);
        save();
        return { food: offFood(o) };
      }, function (e) { clearTimeout(to); throw e; });
  }

  const SEARCH_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>';
  const SCAN_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8 8v8M11 8v8M14 8v8M17 8v8" stroke-width="1.6"/></svg>';
  const STAR = function (on) { return '<svg viewBox="0 0 24 24" fill="' + (on ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>'; };
  const MORE_IC = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/></svg>';
  const BACK_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'; // ‹ that closes a full-screen sheet
  const XIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const SEL_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><path d="M5.3 7l1.3 1.3 2.3-2.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><path d="M14 7h7M14 17h7"/></svg>';
  const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
  // A colour and icon for each category (your own ones get the app colour).
  const MEAL_IC = {
    breakfast: '<path d="M4 17h16M6.5 17a5.5 5.5 0 0 1 11 0M12 6V4M5.2 9.2 3.8 7.8M18.8 9.2l1.4-1.4"/>',
    lunch: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    dinner: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
    snacks: '<path d="M12 7c-1.5-2-5-2.2-6.5.5S5 15 7.5 18c1.5 1.8 3 1.5 4.5.8 1.5.7 3 1 4.5-.8 2.5-3 3.5-7.8 2-10.5S13.5 5 12 7z"/><path d="M12 7c0-2 1-3 2.5-3.5"/>',
    other: '<path d="M7 4v16M7 4c3 0 3 3 0 3M17 4v6a3 3 0 0 1-6 0V4M14 10v10"/>'
  };
  function mealIcon(k) { const t = MEAL_IC[k] ? k : 'other'; return '<span class="mh-ico mh-' + t + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + MEAL_IC[t] + '</svg></span>'; }
  // Small type badges like Cronometer: food, recipe, meal, your own food, packaged, restaurant, quick add.
  const FT_IC = {
    food: '<path d="M12 7c-1.5-2-5-2.2-6.5.5S5 15 7.5 18c1.5 1.8 3 1.5 4.5.8 1.5.7 3 1 4.5-.8 2.5-3 3.5-7.8 2-10.5S13.5 5 12 7z"/><path d="M12 7c0-2 1-3 2.5-3.5"/>',
    recipe: '<path d="M4 10h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6zM2.5 10h19M9 6.5c0-1 .8-1.5.8-2.5M13 6.5c0-1 .8-1.5.8-2.5"/>',
    meal: '<rect x="4" y="5" width="16" height="4" rx="1.5"/><rect x="4" y="11" width="16" height="4" rx="1.5"/><path d="M6 19h12"/>',
    mine: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    pack: '<path d="M5 6v12M8 6v12M11 6v12M14 6v12M17 6v12M20 6v12"/>',
    rest: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1-3 3-3 6v3h3M17 3v18"/>',
    quick: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
    fruit: '<path d="M12 7c-1.5-2-5-2.2-6.5.5S5 15 7.5 18c1.5 1.8 3 1.5 4.5.8 1.5.7 3 1 4.5-.8 2.5-3 3.5-7.8 2-10.5S13.5 5 12 7z"/><path d="M12 7c0-2 1-3 2.5-3.5"/>',
    veg: '<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19l7-7"/>',
    meat: '<path d="M18.5 8.5c0 4.5-4.8 8.8-10 9.5-2.6.3-4.5-1.3-4.5-3.6C4 9.7 8.3 5 13.2 5c3 0 5.3 1.4 5.3 3.5z"/><path d="M8 14.5c1.5-.3 2.6-1.4 2.9-2.9"/>',
    poultry: '<path d="M15.5 3.5a5 5 0 0 1 0 7.1l-2.1 2.1-4.1-4.1 2.1-2.1a5 5 0 0 1 4.1-3z"/><path d="M9.3 8.6l-3.8 3.8"/><path d="M11.4 14.6l-3.8 3.8"/><path d="M5.5 12.4a1.8 1.8 0 1 0-1.4 3.1 1.8 1.8 0 1 0 3.5 2.8"/>',
    fish: '<path d="M3 12c3-4.5 8-5.5 12-3l4-3v12l-4-3c-4 2.5-9 1.5-12-3z"/><path d="M8 11.5h.01"/>',
    dairy: '<path d="M8 3h8v3l2 3v12H6V9l2-3z"/><path d="M6 12h12"/>',
    egg: '<path d="M12 3c-3.5 0-6 5.5-6 9.5a6 6 0 0 0 12 0C18 8.5 15.5 3 12 3z"/>',
    grain: '<path d="M6 11a3 3 0 0 1-.5-6h13a3 3 0 0 1-.5 6v8H6z"/><path d="M10 11v3M14 11v3"/>',
    drink: '<path d="M6 4h12l-1.6 16H7.6z"/><path d="M6.5 9h11"/>',
    sweet: '<path d="M6 12h12l-1.5 8h-9z"/><path d="M5 12a3.5 3.5 0 0 1 3-5.5A4 4 0 0 1 16 6a3.5 3.5 0 0 1 3 6"/>',
    nut: '<path d="M5 10h14"/><path d="M6 10c0 5 3 9 6 10 3-1 6-5 6-10"/><path d="M7 10a5 5 0 0 1 10 0"/><path d="M12 5V3"/>',
    legume: '<path d="M4 16c4 0 6-8 12-8 2.2 0 4 1 4 3-3 0-4 6-12 6-2 0-4-.4-4-1z"/><path d="M10 14h.01M14 11.5h.01"/>',
    oil: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    dish: '<path d="M4 10a8 5.5 0 0 1 16 0z"/><path d="M4 14h16"/><path d="M5 17h14a1 1 0 0 1-1 2H6a1 1 0 0 1-1-2z"/>',
    soup: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M9 7.5c0-1 1-1.5 1-3M14 7.5c0-1 1-1.5 1-3"/>',
    snack: '<path d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1-3-3z"/><path d="M9 10h.01M13 15h.01M8 15h.01"/>',
    spice: '<path d="M9 9h6l1 11H8z"/><path d="M10 9V6a2 2 0 0 1 4 0v3"/><path d="M11 13h.01M13 16h.01"/>'
  };
  // Which picture a food gets in lists: its kind of food (fruit, meat, dairy…), from its category or, failing that, its name.
  const FT_CAT = [
    ['drink', /juice|nectar|\b(tea|coffee|latte|cappuccino|espresso|soda|cola|smoothie|milkshake|shake|water|beer|wine|drink|beverage|karkade|sobia|lemonade)\b|عصير|شاي|قهوة|مشروب|كركديه/i, /Beverages|Coffee|^Tea$|drinks|juice|water|Wine|Beer|Liquor|Soft drinks|Smoothies|Nutritional beverages|Formula/],
    ['egg', /\beggs?\b|omelet|بيض|عجة/i, /^Eggs|Egg\/breakfast/],
    ['soup', /\bsoup|broth|شوربة/i, /Soups|Ramen/],
    ['dish', /\b(pizza|burger|sandwich|shawarma|koshari|kushari|taco|burrito|wrap|lasagna|biryani|hawawshi|fatta|mahshi|molokhia)\b|كشري|شاورما|حواوشي|فتة|محشي|ملوخية|بيتزا|برجر|ساندوتش/i, /Fast Foods|Restaurant|Pizza|Burgers|sandwich|Burritos|Meals, Entrees|mixed dishes|Egyptian|Dishes|Stir-fry|Egg rolls|Nachos|Mexican|Fried rice|Vegetable dishes|Macaroni and cheese|Bean, pea, legume dishes/],
    ['fish', /\b(fish|tuna|salmon|sardine|shrimp|prawn|crab|mackerel|tilapia|bolti|seafood|calamari)\b|سمك|تونة|جمبري|سلمون|سردين|بلطي/i, /Fish|Shellfish|Seafood/],
    ['poultry', /\b(chicken|turkey|duck|poultry|wings?)\b|فراخ|دجاج|ديك رومي|بط/i, /Poultry|Chicken|Turkey/],
    ['meat', /\b(beef|lamb|veal|pork|steak|sausage|bacon|ham|kofta|kebab|liver|mince|meat|salami|pastrami|hot dog|frankfurter|luncheon|basterma|meatballs?)\b|لحم|كفتة|كباب|سجق|كبدة|بسطرمة|لانشون/i, /Beef|Lamb|Pork|Sausage|Luncheon|Cold cuts|Bacon|Frankfurter|Liver|Ground beef|Meat/],
    ['dairy', /\b(milk|cheese|yogh?urt|labneh|cream|butter ?milk|kefir|ice cream|feta|mozzarella|cheddar|laban|zabadi|areesh|rayeb)\b|لبن|جبن|جبنة|زبادي|قشطة|ايس كريم|رايب/i, /Dairy|Milk|Cheese|Yogurt|Cream|Ice cream|shakes/],
    ['sweet', /\b(cake|cookie|biscuit|chocolate|candy|sweet|dessert|pudding|jam|honey|sugar|donut|doughnut|pastry|croissant|basbousa|konafa|kunafa|baklava|halawa|feteer)\b|كيك|شوكولاتة|حلوى|بسبوسة|كنافة|بقلاوة|حلاوة|عسل|سكر/i, /Sweets|Cakes|Cookies|Candy|Doughnuts|Pudding|Gelatins|Jams|Sugars|pastries|desserts|Baby food: snacks/],
    ['snack', /\b(chips|crisps|popcorn|pretzel|cracker|bar)\b|شيبسي/i, /Snacks|chips|Popcorn|Pretzels|bars|Crackers/],
    ['oil', /\boil\b|^(butter|ghee|margarine|mayonnaise|samna)\b|\bdressing\b|زيت|زبدة|سمنة|مايونيز/i, /Fats and Oils|Butter|Margarine|Mayonnaise|dressings/],
    ['nut', /\b(nuts?|almonds?|peanuts?|walnuts?|cashews?|pistachios?|seeds?|tahini|sesame)\b|مكسرات|لوز|فول سوداني|طحينة|سوداني/i, /Nut|seeds/],
    ['legume', /\b(beans?|lentils?|chickpeas?|foul|ful|falafel|ta.?meya|hummus|peas|soy|tofu)\b|فول|عدس|حمص|طعمية|فلافل/i, /Legume|Beans, peas|Soy/],
    ['grain', /\b(bread|rice|pasta|noodles?|oats?|oatmeal|cereal|flour|toast|bagel|tortilla|couscous|bulgur|freekeh|baladi|fino|roll|bun|macaroni|spaghetti|aish|pita|shami)\b|عيش|خبز|رز|أرز|مكرونة|شوفان|توست|فينو/i, /Baked|Cereal|Grains|Pasta|bread|Rolls|Bagels|Tortillas|Rice|Oatmeal|Grits|Biscuits|Pancakes|noodles|Turnovers/],
    ['fruit', /\b(apple|banana|orange|grapes?|mango|melon|watermelon|strawberr|berr|dates?|figs?|guava|peach|pear|pineapple|kiwi|apricot|plum|pomegranate|fruit|lemon|cantaloupe|cherr)\w*|تفاح|موز|برتقال|عنب|مانجو|بطيخ|فراولة|بلح|تمر|تين|جوافة|خوخ|كمثرى|رمان|فاكهة|ليمون|كانتلوب/i, /Fruit|Apples|Bananas|berries|Citrus|Grapes|Melons|Mango|Peaches|Pears|Pineapple|Strawberries|Dried fruits/],
    ['veg', /\b(vegetables?|salad|tomato|potato|onion|carrot|cucumber|lettuce|spinach|broccoli|cabbage|pepper|zucchini|eggplant|okra|bamya|molokhia|garlic|corn|beets?|cauliflower|mushroom)\w*|خضار|سلطة|طماطم|بطاطس|بصل|جزر|خيار|خس|سبانخ|كرنب|فلفل|كوسة|باذنجان|بامية|ثوم|ذرة/i, /Vegetable|Spinach|Broccoli|Cabbage|Carrots|Corn|Lettuce|Onions|Tomatoes|String beans|potato|Olives|green|starchy|red and orange|Coleslaw/],
    ['spice', /\b(spice|salt|pepper|cumin|ketchup|mustard|sauce|vinegar)\b|ملح|كمون|كاتشب|صوص|خل/i, /Spices|condiments|sauces|Dips|Sugar substitutes/]
  ];
  const ftKindCache = {};
  function ftKind(f) {
    if (!f) return 'quick';
    if (f.recipe) return 'recipe';
    if (f.custom) { const k = ftGuess(f.name, ''); return k || 'mine'; }
    if (ftKindCache[f.id]) return ftKindCache[f.id];
    const k = ftGuess(f.name, f.cat === 'Packaged foods' || f.off ? '' : (f.cat || '')) || (f.off || f.cat === 'Packaged foods' ? 'pack' : /^Restaurants/.test(f.cat || '') ? 'rest' : 'food');
    return (ftKindCache[f.id] = k);
  }
  const CATS = [['fruit', 'Fruit', 'fruit'], ['veg', 'Vegetables', 'veg'], ['meat', 'Meat', 'meat'], ['poultry', 'Chicken', 'poultry'], ['fish', 'Fish', 'fish'], ['dairy', 'Dairy', 'dairy'], ['egg', 'Eggs', 'egg'], ['grain', 'Bread & grains', 'grain'], ['legume', 'Beans', 'legume'], ['nut', 'Nuts', 'nut'], ['drink', 'Drinks', 'drink'], ['sweet', 'Sweets', 'sweet'], ['snack', 'Snacks', 'snack'], ['egypt', 'Egyptian', 'dish'], ['rest', 'Restaurants', 'rest']];
  const catCache = {};
  // The foods in one category, everyday ones first (not packaged or baby food), then by how common they are.
  function catFoods(k) {
    if (catCache[k]) return catCache[k];
    const out = foodDB.list.filter(function (f) {
      if (/^Baby|Babyfood/i.test(f.name) || /^Baby/.test(f.cat || '')) return false;
      if (k === 'egypt') return f.cat === 'Egyptian dishes';
      if (k === 'rest') return !!f.place;
      return !f.place && ftKind(f) === k;
    });
    out.sort(function (a, b) { return ((a.cat === 'Packaged foods') - (b.cat === 'Packaged foods')) || (b.pop || 0) - (a.pop || 0) || a.name.length - b.name.length; });
    return (catCache[k] = out);
  }
  function diaryIcon(it) { const food = it.ref && itemFood(it); return ftIcon(food ? ftKind(food) : (ftGuess(it.name, '') || (it.ref ? 'food' : 'quick'))); }
  function ftGuess(name, cat) {
    const first = String(name || '').split(/[,·(]/)[0];
    for (let i = 0; i < FT_CAT.length; i++) if (FT_CAT[i][1].test(first)) return FT_CAT[i][0];
    if (cat) for (let i = 0; i < FT_CAT.length; i++) if (FT_CAT[i][2].test(cat)) return FT_CAT[i][0];
    for (let i = 0; i < FT_CAT.length; i++) if (FT_CAT[i][1].test(name || '')) return FT_CAT[i][0];
    return '';
  }
  function ftIcon(t) { return '<span class="ft-ico ft-' + t + '" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + FT_IC[t] + '</svg></span>'; }
  function ftType(f) { return f.recipe ? 'recipe' : f.custom ? 'mine' : f.off || f.cat === 'Packaged foods' ? 'pack' : /^Restaurants/.test(f.cat || '') ? 'rest' : 'food'; }
  function mealName(m) { return (MEALS.find(function (x) { return x[0] === m; }) || MEALS[MEALS.length - 1])[1]; }
  // Food in a category that no longer exists shows in the last one.
  function mealOf(f) { return MEALS.some(function (x) { return x[0] === f.meal; }) ? f.meal : MEALS[MEALS.length - 1][0]; }
  // Calories in the middle of a ring split by where they come from (protein and carbs 4 kcal/g, fat 9), with grams and % beside it.
  // Grey placeholder rows while something loads (instead of "Loading…").
  function skel(n) {
    let h = '<div class="skel" role="status" aria-label="Loading">';
    for (let i = 0; i < (n || 4); i++) h += '<div class="sk-row"><i class="sk-a" style="width:' + [62, 48, 70, 55, 66][i % 5] + '%"></i><i class="sk-b" style="width:' + [34, 28, 40, 30, 36][i % 5] + '%"></i></div>';
    return h + '</div>';
  }
  // A friendly empty screen: icon, one line, a hint.
  function emptyState(ic, title, text) {
    return '<div class="es"><span class="es-ic">' + ic + '</span><b>' + title + '</b><span>' + text + '</span></div>';
  }
  // The nutrition card opens the full list (vitamins, minerals, fats) right under it. tot() gives the totals when opened.
  const SUM_MORE = '<div class="sum-more"><span>All nutrients</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div>';
  function nutToggle(card, panel, tot) {
    if (!card || !panel) return;
    card.classList.add('sum-tap'); card.setAttribute('role', 'button'); card.tabIndex = 0;
    const draw = function () { panel.innerHTML = nutPanel(tot(), nutTargets(), null, { known: true }) + '<p class="muted-note">% of your daily target.</p>'; };
    const flip = function () { panel.hidden = !panel.hidden; card.classList.toggle('open', !panel.hidden); card.setAttribute('aria-expanded', !panel.hidden); if (!panel.hidden) draw(); buzz('light'); };
    card.addEventListener('click', flip); card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    return function () { if (!panel.hidden) draw(); };
  }
  function itemsTot(items) { const t = { kcal: 0, p: 0, c: 0, f: 0 }; NUTS.forEach(function (n) { if (t[n[0]] == null) t[n[0]] = null; }); items.forEach(function (it) { t.kcal += it.kcal || 0; t.p += it.protein || 0; t.c += it.carbs || 0; t.f += it.fat || 0; const n = itemNutrients(it); if (n) NUTS.forEach(function (x) { const k = x[0]; if (['kcal', 'p', 'c', 'f'].indexOf(k) < 0 && n[k] != null) t[k] = (t[k] || 0) + n[k]; }); }); return t; }
  function foodTot(f, g) { const t = {}; NUTS.forEach(function (n) { const v = per100(f, n[0]); t[n[0]] = v == null ? null : v * g / 100; }); return t; }
  function editTitle(d) { return d === todayISO() ? 'Edit for today' : 'Edit for this day'; }
  // Fibre, sugars, saturated fat and sodium as four small boxes. get(key) gives the amount (or null when unknown).
  function keyBoxes(get) {
    const kv = [['fib', 'Fiber', 'g'], ['sug', 'Sugars', 'g'], ['sat', 'Sat. fat', 'g'], ['na', 'Sodium', 'mg']].map(function (x) { const v = get(x[0]); return { l: x[1], u: x[2], v: v == null || isNaN(v) ? null : v }; });
    if (kv.filter(function (x) { return x.v != null; }).length < 2) return '';
    return '<div class="sv-key">' + kv.map(function (x) { return '<div><b class="num">' + (x.v == null ? '–' : fmtNut(x.v, x.u).replace(' ' + x.u, '')) + '<small>' + (x.v == null ? '' : x.u) + '</small></b><span>' + x.l + '</span></div>'; }).join('') + '</div>';
  }
  function itemsKey(items) { return function (k) { let t = 0, any = false; items.forEach(function (it) { const n = itemNutrients(it); if (n && n[k] != null) { t += n[k]; any = true; } }); return any ? t : null; }; }
  function sumBox(m, label) {
    const p = m ? m.protein * 4 : 0, c = m ? m.carbs * 4 : 0, f = m ? m.fat * 9 : 0, tot = p + c + f, r = 40, C = 2 * Math.PI * r;
    let off = 0;
    const seg = function (v, cls) { if (!tot || !v) return ''; const len = v / tot * C, gap = tot && (p > 0) + (c > 0) + (f > 0) > 1 ? 2 : 0, out = '<circle cx="50" cy="50" r="' + r + '" class="mr-' + cls + '" stroke-dasharray="' + Math.max(0, len - gap).toFixed(2) + ' ' + (C - Math.max(0, len - gap)).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>'; off += len; return out; };
    const pct = function (v) { return tot ? Math.round(v / tot * 100) + '%' : '–'; };
    return '<div class="mring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="' + r + '" class="mr-bg"/>' + seg(p, 'p') + seg(c, 'c') + seg(f, 'f') + '</svg>' +
      '<div class="mr-mid"><span class="sv-kcal num">' + (m ? fmtKcal(m.kcal) : '–') + '</span><small>' + (label || 'kcal') + '</small></div></div>' +
      '<div class="mr-legend">' + [['p', 'Protein', 'protein', p], ['c', 'Carbs', 'carbs', c], ['f', 'Fat', 'fat', f]].map(function (x) {
        return '<div class="mr-row"><i class="mr-dot mr-' + x[0] + '"></i><span class="mr-l">' + x[1] + '</span><b class="num">' + (m ? m[x[2]] : '–') + ' g</b><span class="mr-pc num">' + pct(x[3]) + '</span></div>';
      }).join('') + '</div>';
  }

  // Add food: search the database and My foods, scan a barcode, or quick add calories. Stays open so you can add several.
  // Packaged-food searches you've done, kept on the phone so they come back instantly (and offline).
  const OFFQ_KEY = 'setpoint-offq';
  let offQ = null;
  function offQLoad() { if (!offQ) { try { offQ = JSON.parse(localStorage.getItem(OFFQ_KEY)) || {}; } catch (e) { offQ = {}; } } return offQ; }
  function offCacheGet(qq) { const c = offQLoad()[normText(qq)]; return c && Array.isArray(c.list) ? c : null; }
  function offCachePut(qq, list) {
    const c = offQLoad(), k = normText(qq); if (!k) return;
    c[k] = { t: Date.now(), list: list };
    const ks = Object.keys(c).sort(function (a, b) { return c[b].t - c[a].t; }); ks.slice(60).forEach(function (x) { delete c[x]; });
    try { localStorage.setItem(OFFQ_KEY, JSON.stringify(c)); } catch (e) {}
  }
  // Packaged foods from earlier searches that match what you're typing now (shown before the network answers).
  function offCachedMatches(qq) {
    const qt = queryToks(qq); if (!qt.length) return [];
    const c = offQLoad(), seen = {}, out = [];
    Object.keys(c).forEach(function (k) { c[k].list.forEach(function (o) { if (seen[o.code]) return; seen[o.code] = 1; const w = wordsOf(o.name + ' ' + (o.brand || '')); if (qt.every(function (a) { return matchTok(a, w); })) out.push(o); }); });
    return out.slice(0, 30);
  }
