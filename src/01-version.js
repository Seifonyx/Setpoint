  /* ================= Version ================= */
  const APP_VERSION = '2.0.9';
  const CHANGES = [
    { v: '2.0.9', items: [
      'Setpoint now has its own home at setpoint-tracker.web.app, with accounts kept in its own place.'
    ] },
    { v: '2.0.8', items: [
      'Sheets now follow your finger like iPhone: pull one down from anywhere (or its handle) and let go, and it closes or springs back at the speed you flicked it. Pulling one up gives a little, and you can catch it again while it\'s still moving, even while it\'s opening.',
      'Swiping back from the edge, the cards at the top of the Diary, and swiping a food or a weigh-in now finish with a spring that carries on at your finger\'s speed, with a gentle stretch past the ends. A quick flick is enough.'
    ] },
    { v: '2.0.7', items: [
      'Moving between steps in a sheet (like picking a food in Add food, or Add to diary in Meal planner) now slides like iPhone: the new step comes in over the old one, and going back slides it away.',
      'Deleting a food fades it out while the rest move up, and Undo fades it back in. The calorie bar\'s colour now blends smoothly when you go over your target or back under it.',
      'Meal planner: switching a meal off or on, or picking another idea, smoothly resizes it instead of jumping.',
      'Menus shrink back into their button when they close, and changing the mode, theme, pure black, text size or tab bar crossfades to the new look.'
    ] },
    { v: '2.0.6', items: [
      'Faster everywhere: opening You, going back from Settings, switching tabs and logging food all respond quicker, even with months of entries.',
      'When a page slides in (Settings, Plan, lists in Foods), the page you\'re leaving now stays fully visible behind it, exactly where it was, in every theme and in Arabic. Before, it could show blank or shift.',
      'Switching tabs no longer fades the page in twice, and full-screen sheets like Add food slide away as they are instead of first snapping into a smaller card.'
    ] },
    { v: '2.0.5', items: [
      'The meal switches in Meal planner now turn into a glass lens when you hold them, and slide all the way across before the meal updates. The glass on every switch is bigger and clearer while held.'
    ] },
    { v: '2.0.4', items: [
      'Glass, like iPhone: holding a switch turns its knob into a glass bubble as it slides, and menus, notifications, the scroll title bar, header buttons and full-page headers are frosted glass now.'
    ] },
    { v: '2.0.3', items: [
      'In dark mode, every switch is now dark with a white knob, so it matches the rest of the dark theme.'
    ] },
    { v: '2.0.2', items: [
      'Updates now install quietly in the background. When there\'s a new feature worth knowing about, you\'ll see it once, with a button that takes you straight to it. Everything else is in Settings → What\'s new.'
    ] },
    { v: '2.0.1', items: [
      'Meal planner: the meal tiles at the top are gone. Each meal now has its own small switch beside its name, and a meal you turn off folds down so you can turn it back on right there.'
    ] },
    { v: '2.0', announce: { icon: 'plan', go: 'plan', title: 'Meal planner', text: 'A whole day of meals built around your calories and macros, ready to add to any day.',
      points: ['Learns from the foods and amounts you log most', 'Turn meals on or off, and swap any one for another idea', 'Add it to today, tomorrow or any date in one tap'], cta: 'Plan a day' }, items: [
      'Setpoint 2.0 is the first full release. Everything from the last 100+ updates is now in one finished app: the Diary, Progress, Foods, your Plan, sync, Arabic, and the glass tab bar.',
      'Diet planner is now Meal planner. Pick the meals to plan from clear tiles that show each one\'s calories, and Learn from my entries builds meals from the foods and amounts you log most.',
      'Opening the planner, the ring draws in, the numbers count up and the meals rise in one after another. Changing anything moves the numbers and bars smoothly to their new values.',
      'Pick the day in Add to diary from tiles too: today, tomorrow or any date.'
    ] },
    { v: '1.94', items: [
      'Diet planner is now a real planner: it builds a whole day from your targets, keeps your plan when you come back, and lets you choose which meals to plan and whether to start from your usual meals.',
      'A new summary shows your planned calories in a ring, with protein, carbs and fat against your targets. Each meal is its own card with Another idea to swap it.',
      'Add to diary lets you pick the day: today, tomorrow or any date. If that day already has food, it can skip those meals.'
    ] },
    { v: '1.93', items: [
      'Plan my day is now Diet planner. It has its own card in Foods, and it\'s in Diary ⋯ too.',
      'Suggest food is gone, so Foods is simpler. Foods high in a nutrient still opens when you tap a nutrient in the Diary or Progress.',
      'Smoother motion everywhere: buttons spring back when you let go, sheets rise and leave like iPhone\'s, menus and toasts pop in, switch highlights glide to the option you pick, and meals fold and unfold instead of jumping.'
    ] },
    { v: '1.92', items: [
      'Hold the tab bar and slide your finger: the highlight swells into a glass lens that follows you, with a tick on each tab. Let go to open that tab.'
    ] },
    { v: '1.91', items: [
      'Same as yesterday has an X, so you can hide it for that meal for the rest of the day.',
      'The tab bar is now a floating glass bar at the bottom, like on iPhone. The selected tab gets a soft highlight that slides between tabs.',
      'Plan has its own icon now, and the card at the top of your Diary says Plan, since that\'s where it takes you.',
      'Settings is shorter: Back up, Import, Check my data and storage are now one Your data page, the four legal pages are one Legal row, and Check for updates lives in What\'s new.',
      'Goal weight was in Settings and in Plan, so now it\'s only in Plan → Goal. Auto-adjust target moved to Plan → Energy expenditure, next to your other target settings.',
      'You: the stats show Days logged instead of repeating your daily target, and the Diary menu only shows Paste after you copy a day.'
    ] },
    { v: '1.90', items: [
      'Setpoint can now be found on Google and other search engines, and sharing the link shows a proper preview with the app name and icon.'
    ] },
    { v: '1.89', items: [
      'Foods high in a nutrient is now part of Suggest food: pick the By nutrient filter, choose any nutrient, and see the richest foods per serving, per 100 kcal, or where it came from in your week.'
    ] },
    { v: '1.88', items: [
      'Foods → For your day has two new tools. Suggest food shows what fills what you still need today (pick Best match, High protein, Lighter or Vitamins & fiber), and tapping one lets you set the amount.',
      'Plan my day builds a full day of meals that fits your calories and macros. Shuffle any meal you don\'t like, or use your usual meals, then add it all as planned food. It\'s also in Diary ⋯ → Plan this day.',
      'The old Insights section in Foods is gone to make room for these.'
    ] },
    { v: '1.87', items: [
      'Progress is cleaner: the range buttons sit inside the weight chart (with the change over that range at the top), This week and Goal are two tiles side by side, What moves your weight joins Insights, and Phases is a single row until you start one.',
      'Nutrition: the monthly report lives in the calendar card, Trends has a clear nutrient picker with its own range buttons, and the eating window shows your last week.',
      'New in Settings → Legal: a Privacy Policy, Terms of Use, Cookies & storage and a Refund Policy. Setpoint has no ads, no analytics and no tracking.',
      'You can now delete your account and everything synced to it (You → Account → Delete account and cloud data). Signing in asks for your consent first.',
      'Fonts now come with the app instead of from Google, so opening Setpoint no longer contacts Google. Pinch-to-zoom works on iPhone, and keyboard focus is easier to see.'
    ] },
    { v: '1.86', items: [
      'Targets is now Plan, a short menu instead of one long page. The top card opens Targets: an overview of your calories and macros, then every nutrient with a daily target and a max you can type straight in (recommended for your age and sex; Custom turns on when you change one, and off puts the recommended back).',
      'Going over a max now shows in red on the Diary cards.',
      'Plan also has Goal (lose, maintain or gain, how fast, goal weight, and the daily target it gives you) and Energy expenditure (how your burn adds up, plus activity, about you, TDEE, training days and flexible week).'
    ] },
    { v: '1.85', items: [
      'Diary menu (⋯) is simpler: Take a break replaces refeed day and diet break. Pick how many days (1 to 14) to eat at maintenance; one day is a refeed with extra carbs. Training days now live only in Targets.',
      'Monthly report moved to Progress → Nutrition, under the calendar.'
    ] },
    { v: '1.84', items: [
      'Diary: the targets card has a new layout. Calories sit on top (what you\'ve eaten, your target and what\'s left, with one long bar), and protein, carbs and fat sit side by side underneath, each with its own bar.'
    ] },
    { v: '1.83', items: [
      'Meals can now go inside meals, like in Cronometer. When you build or edit a meal, tap + Add food or meal: your other meals are listed at the top (and in search), and tapping one adds all its foods.'
    ] },
    { v: '1.82', items: [
      'Progress → Nutrition has a month calendar: each day is green (on target, within 10%), orange (over) or light (under), today has a ring, and tapping a day opens it in the Diary. Use the arrows to look back at earlier months.',
      'Smoother tab switching: the highlight in the tab bar glides to the tab you tap, and the page slides in from that side.',
      'Fixed: in Arabic, a few screens could fail to draw for a moment while the app was starting up.'
    ] },
    { v: '1.81', items: [
      'Diary: an empty meal now offers what you had in it yesterday, like "Same as yesterday · Oats · Banana". One tap adds it all, with Undo. This replaces Copy to another day in the meal menu.',
      'Full pages: the ‹ arrow and title now sit exactly where they do on Targets and Settings.'
    ] },
    { v: '1.80', items: [
      'Full pages now close with a ‹ back arrow at the top left instead of an X, the same as every other page in the app.'
    ] },
    { v: '1.79', items: [
      'Long sheets, like Achievements, the weekly view and What\'s new, now open as a full page with an X at the top, so nothing sits under the clock. Short ones still slide up from the bottom.'
    ] },
    { v: '1.78', items: [
      'Fixed for real this time: on iPhone, Achievements and other sheets no longer slide up under the clock. Newer iOS draws the app under the status bar but tells it there is nothing there, so Setpoint now works out the status bar height itself.'
    ] },
    { v: '1.77', items: [
      'Insights on the Foods tab are cleaner: one Top sources card with a Calories / Protein switch and a bar for each food, and your most logged foods as chips you can tap to log again.',
      'Fixed: some sheets, like Achievements, could slide up under the clock and notch at the top of the screen. Every sheet now stops below it.'
    ] },
    { v: '1.76', items: [
      'iPhone: swiping back is calmer. The page slides away a little slower and more gently when you let go, and it takes a clearer swipe to go back, so it doesn\'t jump back by accident.'
    ] },
    { v: '1.75', items: [
      'iPhone: smoother swiping back. The page moves in step with your finger, a quick flick is enough to go back, the finish keeps the speed of your swipe, and the page underneath dims slightly like a native app. The edge you swipe from is a little wider too.'
    ] },
    { v: '1.74', items: [
      'iPhone: swiping back from a list in Foods (Meals, Recipes, Your foods, Repeat items) now shows the Foods page underneath instead of a black screen.'
    ] },
    { v: '1.73', items: [
      'iPhone: swiping back no longer flashes an odd page. Setpoint now does the back swipe itself: the page you\'re going back to is shown underneath as you drag, like a native app, and a short or interrupted swipe springs back.'
    ] },
    { v: '1.72', items: [
      '"Saved meals" are now just called "Meals" everywhere.'
    ] },
    { v: '1.71', items: [
      'Fixed swiping back: one swipe now always goes back exactly one step. Before, your phone\'s own back swipe and Setpoint\'s could both happen at once, which went back twice and showed two pages sliding on top of each other.',
      'Fixed back after an update: steps left over from before the app reloaded are skipped, so you no longer land on the same page again.',
      'A swipe from the edge no longer also moves the cards or rows underneath it, and a swipe the phone interrupts puts the page back in place.',
      'Pure black works again in dark mode.'
    ] },
    { v: '1.70', items: [
      'A cleaner look across the app. Section titles and card labels now use one calm style (no more ALL CAPS), and lists everywhere have coloured icons so they\'re easier to scan.',
      'Foods is now a simple 2×2 grid: Saved meals, Recipes, Your foods and Repeat items, each showing how many you have, with a + to make a new one. "Paste a recipe" is inside Recipes.',
      'Diary: the backup reminder is now a slim one-line strip, so your meals sit higher. The Targets card keeps its look, a little tidier.',
      'Dark mode: cards stand out more clearly from the black background.',
      'Bars fill and numbers count up smoothly when they change, like your percentages after you log a food, your water bar, and your target when you change your pace.',
      'Add food shows three ways to add something (search, scan, or say it) when your list is still short. The amount screen gives the unit more room so long names fit.'
    ] },
    { v: '1.69', items: [
      'Going back now works the same everywhere. Your phone\'s back gesture or button goes back one step at a time: it closes a sheet, steps back inside a sheet (like from an amount to your search), and leaves pages like Targets, Settings and the lists in Foods. Before, some pages skipped back too far or closed the app.',
      'On iPhone, when Setpoint is added to your Home Screen, you can now swipe from the left edge to go back on any page or sheet. The page follows your finger.',
      'Targets: "Protein & fat" is now right on the page under your target, so you can change your split in one tap.',
      '"How this is worked out" is clearer: your target in one sentence and one sum, then three short steps (how much you burn, what your goal changes, how the calories are split), with nothing to tap inside it. Training days show in Arabic too.'
    ] },
    { v: '1.68', items: [
      'Faster first search: the app now loads the everyday foods first (about a quarter of the size), so search works almost straight away the first time, even on a slow connection. The rest of the foods arrive a moment later in the background.',
      'Search fixes: "fried egg" no longer shows fried eggplant, "salt" no longer lists unsalted foods, and "unsalted butter" shows butter first.'
    ] },
    { v: '1.67', items: [
      'A cleaner Targets page. Your daily target now sits on top with protein, carbs and fat as three simple tiles. Your goal (lose, maintain or gain, how fast, and your goal weight) has its own card, and your daily burn has its own card with an easy-to-read breakdown.',
      'New "How this is worked out": tap it under your target for the whole sum in plain words: your burn, what your goal takes off or adds, why you get that much protein, fat and carbs, and how training days change things.',
      '"Real TDEE" is now called "Your real burn", with a short explanation of what it is. The settings at the bottom are grouped into About you and More options.',
      'Repeat items look tidier: no more "Added today" tag on each item, a clearer summary at the top, and tags only when something is different (skipped, paused or not today).'
    ] },
    { v: '1.66', items: [
      'Better search results: we went through over 300 everyday searches in English, Arabic and Franco and fixed the weak ones. "Soda", "cola", "toast", "pizza", "juice", "oil", "white cheese", "3esh" and "ta3meya" now show the everyday food first, and "black coffee" finds coffee.',
      'Whole words win over look-alikes: "egg" no longer brings up eggplant near the top, "peas" no longer shows pears, and "water" no longer shows watermelon. Half-typed words still work as before.',
      'Fewer odd results: recipe-only entries (like "tomatoes as ingredient in omelet") sit lower, and random near-spellings no longer fill the list when real matches exist. Other spellings like knafeh, kunafa, fattet and baklawa are understood.'
    ] },
    { v: '1.65', items: [
      'Your targets now run on their own. Each time you open the app, Setpoint checks your weight trend and your food log against your plan, not just at the weekly check-in.',
      'If your weight stalls, it checks what you ate first. Ate over your target? The target stays, and it tells you why. Ate on target? The burn estimate was off, so the target moves (up to 150 kcal a week).',
      'The more days you log, the more your target uses your real burn instead of the formula. This is the new Automatic setting in Real TDEE (you can still pick Formula or Your log).',
      'Reaching your goal switches you to maintenance on its own (with Undo). Changing your goal, pace or activity restarts the 2-week check, so your own edits always come first.',
      'Tap "Learned from your results" under your target to see how it was worked out.'
    ] },
    { v: '1.64', items: [
      'Fewer repeats in search: 372 foods that were the same food listed twice (from different USDA lists, like "Olive oil" and "Oil, olive, salad or cooking") were merged into one, keeping the more complete one. Look-alikes that are really different now say how, like "Yogurt, any flavor" next to "Yogurt, plain". Foods you saved before still open.'
    ] },
    { v: '1.63', items: [
      'Clearer food names: all 15,000 foods were checked and over 8,000 got shorter, easier names, like "Orange soda" instead of "Beverages, carbonated, orange" and "Chicken breast, no skin, roasted" instead of "Chicken, breast, meat only, cooked, roasted". Searching by the old words still finds them.'
    ] },
    { v: '1.62', items: [
      'Repeat items can be added at a set time: turn on "Add at a set time" and pick the time. The food shows up in your diary at that time, logged at that time. Set it for later today and it starts today.',
      'Type an amount with your search, like "150g chicken breast", "chicken 200 g" or "2 eggs", and it\'s filled in when you pick the food.'
    ] },
    { v: '1.61', items: [
      'Cleaner food search: 271 duplicate foods were removed (like the same food listed twice, or one drink scanned five times). Anything you already logged, saved or starred still works.'
    ] },
    { v: '1.60', items: [
      'Reorder foods in a saved meal and ingredients in a recipe: drag the ≡ handle on the left of a row up or down.',
      'Fix: the "Paste a list" button in recipes no longer sticks out past the edge of the screen.'
    ] },
    { v: '1.59', items: [
      'Fix: water now counts drinks inside saved meals and recipes, and quick adds named like a drink (as a 250 ml cup). Tap "See which drinks" in Water to see what was counted.'
    ] },
    { v: '1.58', items: [
      'Repeat items in your diary have a small repeat icon, and holding one gives "Skip today" (only that day; it repeats as usual after).',
      'Fix: the Foods tab updates straight away after you change something there.'
    ] },
    { v: '1.57', items: [
      'Repeat items: pause one until a date and it comes back on its own, or pause all of them for 3 days, a week, 2 weeks or until you resume (handy for travel).',
      'Suggestions say how often you actually had each food in the last 14 days, most regular first.'
    ] },
    { v: '1.56', items: [
      'Repeat items: grouped by meal, with a summary of what they add today and a status on each one (added today, skipped, starts tomorrow, not today).',
      'Pause a repeat item to stop it for a while without deleting it.'
    ] },
    { v: '1.55', items: [
      'Ramadan: when Ramadan starts, the Diary offers to turn on Ramadan mode (Suhoor and Iftar, with fasting times). After Eid it offers to turn it off. Dates come from your phone\'s Islamic calendar.'
    ] },
    { v: '1.54', items: [
      'Behind the scenes: a permanent test suite now checks the risky parts before every update: old saves converting, two phones merging, repeat items, sorting and photo sync.',
      'Fix: after converting a save from an old version of the app, the old copy is now cleaned up.'
    ] },
    { v: '1.53', items: [
      'Deleted foods are remembered for a year (was 120 days), so a phone that\'s been offline a long time can\'t bring them back when it syncs.',
      'What\'s new shows the latest versions; older ones are folded under "Earlier versions".',
      'Small fixes: arrow keys move through all four tabs, and a tidy-up of leftover code.'
    ] },
    { v: '1.52', items: [
      'Add food: the sort menu (Latest, Most frequent, A–Z) stays in one place under the search bar on every tab.',
      '"Fill what\'s left" suggestions are gone.'
    ] },
    { v: '1.51', items: [
      'Fix: Latest, Most frequent and A–Z now work in every Add food tab. Saved meals in My foods follow the sort, saved meals you log show up in All, and foods eaten as part of a saved meal count towards Latest and Most frequent.'
    ] },
    { v: '1.50', items: [
      'Graphite (clean black and white) is now the main theme. You can still pick another one in Settings → Appearance.'
    ] },
    { v: '1.49', items: [
      'Repeat items: picking a food or saved meal under New goes straight to the repeat setup (at your usual amount), with no extra screen first.',
      'The repeat setup is full screen and doesn\'t drag, and you can change the unit (g, piece, cup…) as well as the amount.'
    ] },
    { v: '1.48', items: [
      'Fix: New in Repeat items always lets you choose the meal and days, whichever way you pick the food (it no longer adds it straight to today\'s diary).',
      'A new or changed repeat item starts from tomorrow; it isn\'t added to today.'
    ] },
    { v: '1.47', items: [
      'Fix: lists in the Foods tab (Repeat items, Saved meals, Recipes, Your foods) were covered at the top by the small title bar. They show fully now.',
      'Fix: choosing the meal and days for a repeat item works reliably on phones (the sheet no longer jumps when you tap).'
    ] },
    { v: '1.46', items: [
      'Repeat items (Foods tab): choose foods you have most days and they\'re added to your diary for you, every day or on the days you pick. Delete one on a day you skip it. Suggestions come from what you eat most days, and you can hold any food in your diary and choose Repeat this.',
      '"Your usual" in the Diary is gone; its suggestions now live in Repeat items.',
      'Progress photos sync to your account when you\'re signed in, so they\'re safe if you change phones and show up on your other devices. Edits and deletions sync too.'
    ] },
    { v: '1.45', items: [
      'Protein now depends on how you train: lifting 1.8 g per kg (2.0 while losing), cardio 1.6 (1.8), no regular workouts 1.4 (1.6), per kg of a healthy weight for your height. Before, everyone got the lifting amount.',
      'Fix: on training days, if the days you picked didn\'t match your workouts a week, the week\'s calories didn\'t add up. Now they always do.',
      'Maintenance from your log skips days that look half-logged, so it isn\'t pulled too low.',
      'Very low calorie targets keep some carbs (fat eases down to its minimum first), and you\'re told if protein and fat alone go over.',
      'Fibre target is at least 25 g. The calculator for someone else no longer assumes they lift.',
      'Messages at the bottom match dark mode.'
    ] },
    { v: '1.44', items: [
      'Progress photos, rebuilt: tag each photo Front, Side or Back, and photos from your gallery keep the date they were taken. Add several at once.',
      'See all your photos by month, with your weight at the time. Open one and swipe through them; edit its date or pose, share it, or delete it (with Undo).',
      'Compare photos with a slider you drag across, side by side, or faded, with the days, weight and measurement changes. Save the comparison as one image.',
      'Timelapse: watch your photos of one pose play in order.',
      'Taking a photo: a grid, a 3 or 10 second timer, and your last photo of that pose faded on top to line up.',
      'Scanning: read a barcode from a photo in your gallery, and the nutrition label scan now lets you pick a photo too.'
    ] },
    { v: '1.43', items: [
      'No more "Moved to…" message after you drag a food to another meal.'
    ] },
    { v: '1.42', items: [
      'Fix: dragging a food to another meal no longer makes the food and meal names disappear. The food floats above the cards and a line shows where it will land.',
      'Add food is cleaner: the food-type buttons (Fruit, Meat…) and recent searches are gone.',
      'Foods tab: "Foods high in a nutrient" is now the first insight.'
    ] },
    { v: '1.41', items: [
      'Fix: changing the serving weight of one of your foods (or a recipe\'s servings) now updates items you logged as "1 piece" or "2 servings" correctly.'
    ] },
    { v: '1.40', items: [
      'Foods tab laid out like Cronometer: a card each for Saved meals, Recipes and Your foods. Tap a card to see the list, or create one straight from it.',
      'Insights moved to the bottom of the Foods tab: most logged, where your calories and protein come from, and foods high in a nutrient.'
    ] },
    { v: '1.39', items: [
      'Changing one of your foods or recipes now updates it everywhere you used it: diary days and saved meals (with Undo).',
      'Foods tab: Foods, Recipes and Meals on one page in clear sections, with insights on top (most logged, where your calories and protein come from).',
      'Tap a highlighted nutrient to see which of the day\'s foods it came from. Tap anywhere else on the card for all of the day\'s nutrients.',
      'Warnings like saturated fat over the max can be hidden for the day with ×.',
      'Saved meals in your diary now count toward vitamins and minerals.'
    ] },
    { v: '1.38', items: [
      'New restaurant menus: El Tabei, Burger King, Domino\'s, Papa John\'s, Starbucks, Costa, Cilantro, Dunkin\' and Koueider.',
      'More Egyptian packaged foods: Domty, Molto, Todo, HoHos, Bake Rolz, Chipsy, Doritos, Fayrouz, Beyti, Obour Land, Bisco Misr, Corona, El Rashidi and more.'
    ] },
    { v: '1.37', items: [
      'Browse foods by kind (Fruit, Meat, Dairy, Egyptian, Restaurants…) on the All tab before you type.',
      'Restaurant menus: pick how many of each item (− 2 +) with a running total.',
      'Foods tab: pictures, a protein/carbs/fat bar and calories on every row, plus a search box.',
      'Progress: the goal is a full-width bar showing how far you\'ve come.',
      'The Diary warns you when sodium, saturated fat or caffeine goes over your max, or sugar gets high.',
      'New achievements: 5% / halfway / goal reached, 7 days on calorie target, 30-day protein streak, first refeed, every vitamin in a day.',
      'Sync now button on the You card, and Settings shows how much storage Setpoint uses (with a warning if it fills up).',
      'A full check for bugs and small fixes throughout.'
    ] },
    { v: '1.36', items: [
      'The backup file now really saves everything: your diary, foods, recipes, meals and water (before, it only had weigh-ins and settings), plus your food and progress photos.',
      'Targets, the Nutrients screen and the weekly check-in match the new look.',
      'Each meal heading shows a small protein/carbs/fat bar.',
      'Recent searches open the food you picked last time, and foods default to your usual amount for that meal.',
      'Progress Insights follow the range you pick at the top.',
      'Less repetition: "Usual for…" left Add food (the Diary\'s "Your usual" does it), and the highlighted nutrients card no longer offers protein, carbs or fat.'
    ] },
    { v: '1.35', items: [
      'Add food: your foods come first, headed by the sort you picked (Latest, Most frequent or A–Z). "Fill what\'s left" suggestions are below them.'
    ] },
    { v: '1.34', items: [
      'The summary card is now Cronometer-style: Targets on the left, your day score on the right, then energy, protein, carbs and fat bars. The ring is gone.'
    ] },
    { v: '1.33', items: [
      'A cleaner summary card: "Targets" and the ring on top, then energy, protein, carbs and fat below a divider. The "kcal left" number is gone (the Energy row shows it).'
    ] },
    { v: '1.32', items: [
      'Diary summary: "Targets ›" at the top left opens your Targets.',
      'Energy, protein, carbs and fat each get a full row with amount / target, % and a bar, under the ring.'
    ] },
    { v: '1.31', items: [
      'Cleaner food, recipe and meal screens: the serving buttons and the "% of your calories" line are gone.',
      'Tap the nutrition card to see every vitamin, mineral and fat right under it (tap again to close).'
    ] },
    { v: '1.30', items: [
      'Foods, recipes and meals in your Diary all open the same way: how much you had, the nutrition and the four boxes, with a note (and photo) at the bottom.',
      'The time moved to the hold menu: hold a food and pick "Change time".'
    ] },
    { v: '1.29', items: [
      'Tapping a recipe in your Diary now opens it like a meal: how much you had (servings or grams), its ingredients and the nutrition. Changes there are for that day only; edit the recipe itself in Foods.',
      'Meals and recipes both show the fibre, sugar, saturated fat and sodium boxes.'
    ] },
    { v: '1.28', items: [
      'Tap a food to change anything about it. The hold menu no longer repeats "Change amount" and "Adjust ingredients".',
      'Recipes in your Diary have a "Change ingredients this time" button when you tap them (your saved recipe stays the same).'
    ] },
    { v: '1.27', items: [
      'The calorie ring now fills in protein, carbs and fat colours, sized by the calories each gave you.',
      'Each meal is its own card again, with its heading on a soft strip at the top, so meals are clearly separate.',
      'Less doubling up: the calorie bar under the ring is gone (the ring shows it), the profile button on the Diary is gone (use the You tab; sync problems show as a dot on it), the "Last week" card is gone (the weekly check-in covers it), swiping a food is now just Delete (hold it for everything else, including Adjust ingredients), and Daily backups moved inside Back up & restore.'
    ] },
    { v: '1.26', items: [
      'A calmer Diary: simpler meal headings, lighter rows with fine dividers, and empty meals are just a heading with a + button.',
      'The evening tip ("Protein is … short today") now looks like the rest of the app.'
    ] },
    { v: '1.25', items: [
      'Diary: each meal\'s name now sits above its card as a heading, with its protein, carbs and fat. The card holds just your foods, with an "Add food" button at the bottom.'
    ] },
    { v: '1.24', items: [
      'You: your account and sync status are now part of the top card (tap it for account options).',
      'Below it: Settings, Targets, then Achievements.'
    ] },
    { v: '1.23', items: [
      'Swiping between your calories and nutrients now follows your finger and settles straight on the card, with no overshoot or bounce back. Same for the swipeable tips card.'
    ] },
    { v: '1.22', items: [
      'The percentage in the calorie ring is now exactly centred.',
      'Swiping to your nutrients is smooth: the card grows with your finger instead of jumping.'
    ] },
    { v: '1.21', items: [
      'Foods have little pictures by type (fruit, meat, dairy, bread, drinks…) in search and in your Diary.',
      'New tab bar: Diary, Progress, Foods and You.',
      'You now opens with your streak, target, weight trend, how far to your goal and your achievements.',
      'In Add food, the search bar stays at the top while you scroll.',
      'A little confetti when you land on your calorie and protein targets for the day.',
      'Recipes: "Paste a list" is right next to "Add ingredient".',
      'Hold a food in your Diary for shortcuts: change amount, add another, copy, favorite, move to another meal or delete. Hold and drag still moves it.'
    ] },
    { v: '1.20', items: [
      'Recipes can always be logged in grams. Without a cooked weight, grams follow the raw ingredients\' weight (your past entries stay the same).',
      'Add food: "Recent" is now "All", and searching in Favorites or My foods only looks there.'
    ] },
    { v: '1.19', items: [
      'Each meal now sits in its own card, with space between them, so the Diary is easier to read.',
      'Banners (backup, last week, nutrient tips…) share one card you can swipe, instead of stacking up.',
      '"Your usual" under an empty meal adds what you normally eat there in one tap.',
      'Day score: a letter for how balanced your day was. Tap it to see why.',
      'Food page: tap a serving size, see how much of your day it is, and fibre, sugar, saturated fat and sodium at a glance.',
      'Progress has one time range at the top for every chart.',
      'Settings are regrouped and have a search box.',
      'Page titles shrink into the top bar as you scroll, grey placeholders show while things load, and empty screens explain what to do.',
      'Easier-to-read grey text in light mode, and the app opens faster on slow connections.'
    ] },
    { v: '1.18', items: [
      'Menus for KFC, McDonald\'s, Hardee\'s, Pizza Hut, Bazooka, Zooba and Willy\'s Kitchen.',
      'Natural Arabic names for the 450 foods you\'ll see most.',
      'Tea, coffee, juice and milk you log count toward your water goal (you can turn this off in Water).',
      'Refeed days and diet breaks: from the Diary ⋯ menu, eat at maintenance for a day or a week.',
      'Pure black option for dark mode (Settings), made for OLED iPhones.',
      'The food list gets ready as soon as the app opens, so search works right away.'
    ] },
    { v: '1.17.2', items: [
      'The verified badge is redrawn: perfectly round with the tick centred.'
    ] },
    { v: '1.17.1', items: [
      'Cleaner Add food: tidy recent searches, a header on every list with the sort menu beside Recent, and a quieter hidden-foods link.'
    ] },
    { v: '1.17', items: [
      'Every food now has an Arabic name you can search by, and in Arabic the Arabic name shows first.',
      'Arabic spelling slips are forgiven (ث/ت, ذ/ز, ظ/ض and small typos).',
      'Searching finds your recipes and saved meals by what\'s in them ("chicken" → your chicken soup).',
      'Nutrient searches: "high protein", "low carb snack", "low calorie", "high fiber", "بروتين عالي".',
      'Everyday foods most people mean rank first, and the Verified toggle stays on until you turn it off.'
    ] },
    { v: '1.16.1', items: [
      'A blue verified badge marks foods with numbers measured by the USDA, and a Verified filter in search.'
    ] },
    { v: '1.16', items: [
      'Search understands much more: phrases like "زيت زيتون" and "صدور فراخ", 150 more Arabic and Franco words, UK spellings, joined words ("cornflakes") and swapped letters.',
      'Better ranking: brands you name come first, everyday foods beat packaged ones, and foods you usually have at this meal rank higher. Duplicates are removed.',
      'Filter results (All, Foods, Dishes, Packaged, Mine), see your recent searches, and matched words are in bold.',
      '"Did you mean…?" for spelling mistakes, Enter opens the top result, and typing just a number offers a quick add.',
      'Searching in Arabic shows the Arabic name next to results.'
    ] },
    { v: '1.15.2', items: [
      'Search: more plain foods come first (mint, cinnamon, black pepper, tofu, duck, beetroot, milk chocolate), "beef mince" and words like "fresh" work, and camel meat was added.'
    ] },
    { v: '1.15.1', items: [
      'More packaged products from Egypt, Saudi Arabia and the UAE built in.'
    ] },
    { v: '1.15', items: [
      'Bigger food list: 340 lab-measured basics from USDA Foundation Foods and about 90 more dishes (Egyptian, Gulf, Levant, Turkish, Moroccan).',
      'Better search: the plain food comes first (olives before olive oil, peaches before peach pie, raw potatoes for "potato").',
      'Packaged products with broken names (barcodes or prices) were cleaned out.'
    ] },
    { v: '1.14', items: [
      'Arabic: Settings → Language → العربية. The app switches to Arabic, right to left (beta: a few rare screens may still show English).',
      'Behind the scenes: the code is now split into modules, with automatic tests before each release.'
    ] },
    { v: '1.13', items: [
      'Flexible week (Targets): days adjust to keep your week on track, and one day can get extra.',
      'Estimate check: see how close the formula is to your real burn, and how sure that is.',
      'What moves your weight (Progress): salty, high-carb, big and training days from your own log.',
      'Ramadan mode (Settings): Suhoor and Iftar, time to Iftar, and water left before Fajr.',
      'Cycle and weight (Settings): shades the days when water weight is common on your chart.',
      'Take progress photos with your last one faded on top, and compare photos as an overlay.'
    ] },
    { v: '1.12', items: [
      'Daily backups on your phone (last 7 days): Settings → Restore a backup.',
      'Safer syncing: a food deleted or edited on one phone stays that way on the other.',
      'Say what you ate: tap the mic in Add food.',
      'Scan a menu or receipt to add everything on it.',
      'Barcode scanner beeps, has a flashlight button (where the phone allows), and can scan the label when a product isn\'t found.',
      'Understands "a handful", "a plate", "a glass", "رغيف", "كوباية", "معلقة" and more.',
      'Haptics now work on iPhone (iOS 18 and newer).',
      'Achievements in You, shown only when you look.'
    ] },
    { v: '1.11.1', items: [
      'Hold a food in Add food to pin it to the top or hide it from Recent.',
      'Picking several foods just shows tick boxes; the Add button appears once you tick something. Tap the icon again to stop.'
    ] },
    { v: '1.11', items: [
      'Opens faster and the food list gets ready in the background, so search is instant.',
      'Tap the calories on a logged food to quickly make it ½×, 1½×, 2× and more.',
      'Every food shows where its numbers come from (USDA, label, your own or an estimate).',
      'Spot and merge copies in My foods.',
      'Weight chart: show your daily calories behind it, tap a day to see both, pinch to zoom.',
      'Check my data (Settings) finds broken foods, typo weigh-ins and odd entries, with one-tap fixes.',
      'A sync dot on your profile button, smoother animations and easier-to-tap buttons.',
      'The food list was checked: products with labels that don\'t add up were removed.'
    ] },
    { v: '1.10', items: [
      'Amounts are remembered per meal, like 2 eggs at breakfast and 3 at dinner.',
      'Star items on a restaurant menu to keep your usual order at the top.',
      'If you\'ve been low on a vitamin or mineral for days, a small card suggests foods you already eat that have it.',
      'The streak uses the app\'s own flame icon.'
    ] },
    { v: '1.9', items: [
      'Restaurant menus: search a place like Cook Door and tick everything you had.',
      'Add a note or photo to any logged food.',
      'Tap a nutrient to see which of your foods gave you the most of it this week.',
      'A food logging streak on the Diary that forgives one missed day a week.',
      'Your foods with calories that don\'t match their macros are flagged so you can fix them.'
    ] },
    { v: '1.8', items: [
      'A much bigger food list: thousands of everyday foods and dishes with real portion sizes.',
      'Thousands of packaged products sold in Egypt and the Gulf are built in, so they show up instantly and their barcodes work offline.'
    ] },
    { v: '1.7.3', items: [
      'Logged meals can be adjusted for that day: change amounts, add or remove foods, or split them into separate foods.',
      'One switch, "Explode all meals", in Settings (also in the meal screen) instead of a switch on each meal.'
    ] },
    { v: '1.7.2', items: [
      'The number pad is now a choice in Settings (off by default).',
      'Saved meals log as one entry unless you turn on "Add as separate foods" in the meal.'
    ] },
    { v: '1.7.1', items: [
      'Packaged food search is much more reliable, and brands like Juhayna work in English or Arabic.',
      'Searches you\'ve done before show up instantly, even offline.',
      'Fewer keyboard arrows while typing in a sheet.'
    ] },
    { v: '1.7', items: [
      'Scan a nutrition label to fill in a new food.',
      'About 50 more Egyptian home dishes in search.',
      'Pin foods to the top of Recent, or hide ones you don\'t want there (hold a food, then Pin or Hide). Imported meals no longer show in Recent.',
      'Small icons show what each item is: food, recipe, meal, your own, packaged, restaurant, quick add.',
      'A number pad with quick amounts when you set how much.',
      'Smarter: search remembers what you pick, understands Franco-Arabic, and the meal is picked from when you usually log it.',
      'Measurement trend charts (Body tab) and a monthly report image (⋯ on the Diary).',
      'Targets is cleaner, and Plan for someone else lives there now.'
    ] },
    { v: '1.6', items: [
      'New themes in Settings: Emerald, Ocean, Rose, Midnight, Terracotta, Graphite and Luxe, each in light and dark.',
      'Build a meal from scratch (My foods → Meals → New meal), and change the amounts in a saved meal.',
      'Turn a recipe into a meal: ⋯ in the recipe → Turn into a meal.'
    ] },
    { v: '1.5', items: [
      'A fresh look: warmer colours, colour-coded meals and tiles, and a calmer layout.',
      'Fewer buttons: extra actions (share, delete, paste, portions…) live under ⋯ at the top.',
      'Compare two foods side by side (⋯ on any food).',
      'Scale a recipe: half, double or triple (⋯ in the recipe).',
      'Bigger text option in Settings.',
      'Before and after photos (Body tab).',
      'A monthly backup reminder when you\'re not signed in.'
    ] },
    { v: '1.4', items: [
      'Egyptian restaurant foods in search (estimates): Koshary El Tahrir, Abou Tarek, Mo\'men, Cook Door, Buffalo Burger, Gad and more.',
      'Paste an ingredient list into a recipe.',
      'Scan several barcodes in a row, then add them all.',
      'Body fat estimate from your measurements (Body tab), and you can use it for your targets.',
      'Set a goal date and see the pace and calories you need.',
      'Long-press the app icon for Scan barcode and Add water.',
      'Undo now only shows up when something was deleted or replaced.'
    ] },
    { v: '1.3', items: [
      'Type a whole meal in search, like "2 eggs, 150 g rice, a banana", and add it all at once.',
      'Search forgives typos, and packaged foods now show up right in your search results.',
      'Save your own portions on any food, like "my bowl".',
      'Share a day as an image (⋯ on the Diary).',
      'Set your own water sizes.',
      'Macro quick picks: Balanced, High protein or Lower carb.'
    ] },
    { v: '1.2', items: [
      'Search packaged foods by name (Open Food Facts), Egyptian brands first.',
      'Foods open at the amount you logged last time.',
      'Sort your lists: Latest, Most frequent or A–Z.',
      'Eating window: when you start and stop eating (Progress → Nutrition).',
      'Share a recipe or saved meal as a link (You → My foods → Share).',
      'App lock with Face ID or your passcode (Settings).',
      'Dragging to reorder is smoother. New food buttons are at the bottom. Imported Cronometer days no longer crowd Recent.'
    ] },
    { v: '1.1', items: [
      'Plan ahead: go forward up to two weeks and add food. Tick it when you eat it. Only eaten food counts.',
      'Fits what\'s left: Add food suggests foods you usually have that fit the rest of your day.',
      'Export your whole food log, with nutrients, as a spreadsheet (Settings → Back up & restore).',
      'Erase all data now really erases everything.'
    ] },
    { v: '1.0.1', items: [
      'Setting training days no longer changes past days. They keep the targets they had.'
    ] },
    { v: '1.0', items: [
      'Setpoint 1.0: the first full release.',
      'Log food from 7,600+ foods (USDA and Egyptian dishes), barcodes, your own foods, recipes and saved meals.',
      'Calories, macros, vitamins and minerals for every day, with targets made for you.',
      'Training days share your week\'s calories out: more on training days, less on rest days, same weekly total.',
      'Weight trend, real TDEE, weekly check-ins and a target that adjusts itself.',
      'Water, fasting, trends, categories, and import from Cronometer.',
      'Works offline and syncs across your devices when you sign in.'
    ] }
  ];

