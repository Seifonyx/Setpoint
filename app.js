(function () {
  'use strict';

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

  /* ================= Storage ================= */
  const KEY = 'setpoint';
  // Older versions saved under these keys. load() copies them into KEY once, then removes them.
  const LEGACY_KEY = 'the-slope';                              // v2.1 – v2.2
  const V1_KEYS = ['weight-log-entries', 'weight-log-phases']; // v1
  const SCHEMA = 3;
  const LB = 2.2046226218;
  const DEFAULT_SETTINGS = { unit: 'kg', theme: 'auto', style: 'graphite', tabs: 'bottom', haptics: true, goalKg: null, trackCalories: true };
  const TABS = ['diary', 'progress', 'you', 'targets', 'settings', 'foods'];
  const DEFAULT_MEALS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snacks', 'Snacks']];
  // Themes (each has a light and a dark version in app.css). [key, name, light [bg, card, accent, ink], dark [...]]
  const THEMES = [
    ['graphite', 'Graphite', ['#f2f2f7', '#ffffff', '#1c1c1e', '#111114'], ['#000000', '#111113', '#f2f2f5', '#f2f2f5']],
    ['classic', 'Emerald', ['#f2f5f3', '#ffffff', '#0f9a6c', '#0f1714'], ['#0a0f0d', '#121a17', '#5fdcab', '#ecf3ef']],
    ['ocean', 'Ocean', ['#eef4f9', '#ffffff', '#1f6fe5', '#0c1824'], ['#070d16', '#0f1824', '#6aa8ff', '#e8f0f9']],
    ['rose', 'Rose', ['#f8f1f2', '#fffbfb', '#c2416b', '#24121a'], ['#120a0d', '#1c1216', '#ff8db0', '#f6eaee']],
    ['violet', 'Midnight', ['#f2f1f8', '#ffffff', '#6c4cf1', '#13111f'], ['#08070f', '#12101d', '#a594ff', '#ece9fb']],
    ['sand', 'Terracotta', ['#f6f1ea', '#fffdf9', '#c4602f', '#231a12'], ['#0f0c09', '#1a1511', '#f0955f', '#f4ece2']],
    ['luxe', 'Luxe', ['#f4efe6', '#fffcf6', '#0f5c45', '#1d1913'], ['#0a0b0a', '#141614', '#dcb86e', '#f2ece0']]
  ];
  const THEME_KEYS = THEMES.map(function (t) { return t[0]; });
  const MEAL_KEY = /^(breakfast|lunch|dinner|snacks|g[a-z0-9]{2,10})$/;
  let MEALS = DEFAULT_MEALS; // the Diary's categories, yours if you changed them (settings.meals)
  function applyMeals() {
    const m = state && state.settings && state.settings.meals; MEALS = m && m.length ? m.map(function (x) { return [x.k, x.n]; }) : DEFAULT_MEALS;
    if (state && state.settings && state.settings.ramadan && state.settings.ramadan.on) MEALS = MEALS.map(function (x) { return x[0] === 'breakfast' ? ['breakfast', 'Suhoor'] : x[0] === 'dinner' ? ['dinner', 'Iftar'] : x; });
  }
  const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
  const FAST_GOALS = [12, 14, 16, 18, 20, 24];
  const REF_RE = /^[ucor][\w-]{1,23}$/; // u<USDA id>, c<my food>, o<barcode> (Open Food Facts), r<recipe>
  let state;

  function pick(v, allowed, fallback) { return allowed.indexOf(v) >= 0 ? v : fallback; }
  function numIn(v, lo, hi) { const n = Number(v); return (v !== null && v !== '' && v !== undefined && isFinite(n) && n >= lo && n <= hi) ? n : null; }

  // Turns anything we've ever saved (old keys, v1 arrays, v2/v3 objects, backup files)
  // into the current shape. Weights are always stored in kg.
  function crNameStr(s) { const ell = /…$/.test(s), parts = s.replace(/…$/, '').split(', '), c = {}, order = []; parts.forEach(function (n) { const m = / ×(\d+)$/.exec(n), k = n.replace(/ ×\d+$/, ''); if (!c[k]) { c[k] = 0; order.push(k); } c[k] += m ? +m[1] : 1; }); return order.map(function (n) { return n + (c[n] > 1 ? ' ×' + c[n] : ''); }).join(', ') + (ell ? '…' : ''); }
  function migrate(raw) {
    let d = raw;
    if (Array.isArray(d)) d = { entries: d };
    if (!d || typeof d !== 'object') d = {};
    const s = (d.settings && typeof d.settings === 'object') ? d.settings : {};
    const ui = (d.ui && typeof d.ui === 'object') ? d.ui : {};
    const pr = (d.profile && typeof d.profile === 'object') ? d.profile : {};
    const tr = (pr.training && typeof pr.training === 'object') ? pr.training : {};
    const thisYear = new Date().getFullYear();
    const gu = (d.guest && typeof d.guest === 'object') ? d.guest : {}, gt = (gu.training && typeof gu.training === 'object') ? gu.training : {};
    // Older tab names: v2 Trend/History → Progress, v3 Today → Diary, v3 Energy → Targets.
    const tab = { trend: 'progress', history: 'progress', today: 'diary', energy: 'targets' }[ui.tab] || ui.tab;
    const out = {
      v: SCHEMA,
      entries: [],
      phases: [],
      settings: {
        unit: pick(s.unit, ['kg', 'lb'], DEFAULT_SETTINGS.unit),
        theme: pick(s.theme, ['auto', 'light', 'dark'], DEFAULT_SETTINGS.theme),
        style: pick(s.style, THEME_KEYS, DEFAULT_SETTINGS.style),
        textSize: pick(s.textSize, ['m', 'l', 'xl'], 'm'),
        tabs: pick(s.tabs, ['bottom', 'top'], DEFAULT_SETTINGS.tabs),
        haptics: typeof s.haptics === 'boolean' ? s.haptics : DEFAULT_SETTINGS.haptics,
        numpad: s.numpad === true,
        drinkWater: s.drinkWater !== false,
        oled: s.oled === true,
        lang: s.lang === 'ar' ? 'ar' : 'en',
        explode: s.explode === true,
        flex: s.flex && typeof s.flex === 'object' && s.flex.on ? { on: true, big: numIn(s.flex.big, 0, 6), extra: numIn(s.flex.extra, 0, 1500) || 0 } : null,
        ramadan: s.ramadan && typeof s.ramadan === 'object' && s.ramadan.on && numIn(s.ramadan.lat, -66, 66) != null && numIn(s.ramadan.lon, -180, 180) != null ? { on: true, city: typeof s.ramadan.city === 'string' ? s.ramadan.city.slice(0, 40) : '', lat: Number(s.ramadan.lat), lon: Number(s.ramadan.lon), fa: numIn(s.ramadan.fa, 12, 21) || 18 } : null,
        cycle: s.cycle && typeof s.cycle === 'object' ? { on: s.cycle.on === true, starts: (Array.isArray(s.cycle.starts) ? s.cycle.starts : []).filter(function (x) { return typeof x === 'string' && ISO_RE.test(x); }).sort().slice(-24) } : { on: false, starts: [] },
        goalKg: numIn(s.goalKg, 20, 400),
        trackCalories: true, // food logging is always on since v4.1
        autoAdjust: typeof s.autoAdjust === 'boolean' ? s.autoAdjust : true,
        waterGoal: numIn(s.waterGoal, 500, 8000) ? Math.round(s.waterGoal) : null,
        waterSizes: Array.isArray(s.waterSizes) && s.waterSizes.length === 4 && s.waterSizes.every(function (v) { return numIn(v, 50, 3000) != null; }) ? s.waterSizes.map(Math.round) : [250, 330, 500, 1000],
        fasting: s.fasting === true,
        weekStart: Number.isInteger(s.weekStart) && s.weekStart >= 0 && s.weekStart <= 6 ? s.weekStart : 5, // Friday
        train: s.train && Array.isArray(s.train.days) && s.train.days.length ? { days: s.train.days.filter(function (x, i, a) { return Number.isInteger(x) && x >= 0 && x <= 6 && a.indexOf(x) === i; }) } : null,
        meals: Array.isArray(s.meals) ? (function () {
          const seen = {}, out = s.meals.filter(function (m) { if (!m || typeof m.k !== 'string' || !MEAL_KEY.test(m.k) || seen[m.k] || typeof m.n !== 'string' || !m.n.trim()) return false; seen[m.k] = 1; return true; }).slice(0, 10).map(function (m) { return { k: m.k, n: m.n.trim().slice(0, 24) }; });
          return out.length ? out : null;
        })() : null,
        highlights: Array.isArray(s.highlights) && s.highlights.length ? s.highlights.filter(function (k, i, a) { return typeof k === 'string' && /^[a-zA-Z0-9]{1,6}$/.test(k) && a.indexOf(k) === i; }).slice(0, 8) : null
      },
      profile: {
        sex: pick(pr.sex, ['female', 'male', 'other'], null),
        birthYear: numIn(pr.birthYear, thisYear - 110, thisYear - 10),
        // Your own nutrient targets (overrides the recommended ones).
        nutT: (function () { const o = {}, src = pr.nutT && typeof pr.nutT === 'object' ? pr.nutT : {}; Object.keys(src).forEach(function (k) { if (!/^[a-zA-Z0-9]{1,6}$/.test(k)) return; const x = src[k]; if (x && typeof x === 'object') { const r = {}; ['lo', 'goal', 'hi'].forEach(function (f) { if (x[f] === null) r[f] = null; else { const v = numIn(x[f], 0.001, 100000); if (v != null) r[f] = v; } }); if (Object.keys(r).length) o[k] = r; } else { const v = numIn(x, 0.001, 100000); if (v != null) o[k] = v; } }); return o; })(), // a number (older versions) or { lo, goal, hi }
        heightCm: numIn(pr.heightCm, 100, 250),
        bodyFat: numIn(pr.bodyFat, 3, 70),
        steps: numIn(pr.steps, 0, 50000) != null ? Math.round(pr.steps) : 7000,
        training: {
          days: numIn(tr.days, 0, 7) != null ? Math.round(tr.days) : 3,
          type: pick(tr.type, ['lifting', 'cardio', 'mixed', 'sports'], 'lifting'),
          minutes: pick(Number(tr.minutes), [30, 45, 60, 90], 60),
          intensity: pick(tr.intensity, ['light', 'moderate', 'hard'], 'moderate')
        },
        paceKg: numIn(pr.paceKg, -1.5, 1.5),
        tdeeSource: pick(pr.tdeeSource, ['auto', 'calc', 'measured'], 'auto'),
        // Weekly self-correction of the formula target (kcal/day), and when it/pace last changed (dayNum).
        adjustKcal: numIn(pr.adjustKcal, -600, 600) || 0,
        adjustAt: numIn(pr.adjustAt, 0, 1e6),
        paceAt: numIn(pr.paceAt, 0, 1e6),
        // null = use the recommended amount. Values are g per kg of the reference weight.
        macros: {
          protein: numIn(pr.macros && pr.macros.protein, 1.4, 2.8),
          fat: numIn(pr.macros && pr.macros.fat, 0.4, 1.4)
        }
      },
      ui: {
        tab: pick(tab, TABS, 'diary'),
        prog: pick(ui.prog, ['weight', 'nutrition', 'body'], 'weight'),
        range: [30, 90, 180, 365, 0].indexOf(Number(ui.range)) >= 0 ? Number(ui.range) : 90,
        view: pick(ui.view, ['days', 'weeks'], 'days'),
        foodTab: pick(ui.foodTab, ['recent', 'favs', 'mine'], 'recent'),
        holdTip: ui.holdTip === true,
        consentAt: Number.isFinite(ui.consentAt) && ui.consentAt > 0 ? ui.consentAt : null, // when you agreed to the terms, privacy policy and cloud storage of your health data
        ramAsk: typeof ui.ramAsk === 'string' ? ui.ramAsk.slice(0, 6) : null, // Islamic year the "turn on Ramadan mode" offer was dismissed
        ramOff: typeof ui.ramOff === 'string' ? ui.ramOff.slice(0, 6) : null,
        smartBurn: ui.smartBurn === true, // moved to the automatic burn once (v1.65)
        tune: ui.tune && typeof ui.tune === 'object' && typeof ui.tune.at === 'number' ? { at: ui.tune.at, change: numIn(ui.tune.change, -600, 600) || 0, hold: ui.tune.hold === true, over: numIn(ui.tune.over, -5000, 5000), actual: numIn(ui.tune.actual, -5, 5), planned: numIn(ui.tune.planned, -5, 5), plateau: ui.tune.plateau === true, goal: ui.tune.goal === true, before: numIn(ui.tune.before, -600, 600), after: numIn(ui.tune.after, -600, 600), undoPace: numIn(ui.tune.undoPace, -1.5, 1.5) } : null,
        goalHit: numIn(ui.goalHit, 20, 400),
        graphite: ui.graphite === true, // switched to Graphite once (v1.50); you can pick another theme after
        hintOff: ui.hintOff && ISO_RE.test(String(ui.hintOff.d || '')) && Array.isArray(ui.hintOff.k) ? { d: ui.hintOff.d, k: ui.hintOff.k.filter(function (k) { return typeof k === 'string' && k.length < 10; }).slice(0, 10) } : null,
        storeWarn: Number.isInteger(ui.storeWarn) ? ui.storeWarn : null,
        diet: ui.diet && typeof ui.diet === 'object' ? { seeds: (function (o) { const r = {}; if (o && typeof o === 'object') Object.keys(o).slice(0, 12).forEach(function (k) { if (MEAL_KEY.test(k) && Number.isInteger(o[k]) && o[k] >= 0) r[k] = Math.min(o[k], 9999); }); return r; })(ui.diet.seeds), mine: ui.diet.mine !== false, meals: Array.isArray(ui.diet.meals) ? ui.diet.meals.filter(function (m) { return typeof m === 'string' && MEAL_KEY.test(m); }).slice(0, 12) : null } : null, // the Diet planner's current plan
        sameX: ui.sameX && ISO_RE.test(String(ui.sameX.d || '')) && Array.isArray(ui.sameX.m) ? { d: ui.sameX.d, m: ui.sameX.m.filter(function (m) { return typeof m === 'string' && MEAL_KEY.test(m); }).slice(0, 12) } : null, // "Same as yesterday" hidden for these meals on that day
        celeb: ISO_RE.test(String(ui.celeb || '')) ? ui.celeb : null, // last day we celebrated hitting the target
        folded: Array.isArray(ui.folded) ? ui.folded.filter(function (k, i, a) { return ['phases', 'history'].indexOf(k) >= 0 && a.indexOf(k) === i; }) : [],
        shut: Array.isArray(ui.shut) ? ui.shut.filter(function (m, i, a) { return typeof m === 'string' && MEAL_KEY.test(m) && a.indexOf(m) === i; }) : [],
        weekSeen: typeof ui.weekSeen === 'number' ? ui.weekSeen : null,
        gapHide: typeof ui.gapHide === 'string' ? ui.gapHide.slice(0, 40) : null,
        gsHide: ui.gsHide === true,
        qhist: Array.isArray(ui.qhist) ? ui.qhist.filter(function (x) { return typeof x === 'string' && x.trim(); }).map(function (x) { return x.slice(0, 30); }).slice(0, 8) : [],
        chartKcal: ui.chartKcal === true,
        sver: ui.sver === true,
        pins: Array.isArray(ui.pins) ? ui.pins.filter(function (k) { return typeof k === 'string' && k.length < 200; }).slice(0, 30) : [],
        hide: Array.isArray(ui.hide) ? ui.hide.filter(function (k) { return typeof k === 'string' && k.length < 200; }).slice(0, 400) : [],
        qmem: ui.qmem && typeof ui.qmem === 'object' ? (function () { const o = {}; Object.keys(ui.qmem).slice(0, 300).forEach(function (k) { const v = ui.qmem[k]; if (k.length <= 40 && v && typeof v === 'object') { const m = {}; Object.keys(v).slice(0, 6).forEach(function (id) { if (REF_RE.test(id) && numIn(v[id], 1, 999)) m[id] = Math.round(v[id]); }); o[k] = m; } }); return o; })() : {},
        sort: pick(ui.sort, ['recent', 'freq', 'az'], 'recent'),
        backupAt: typeof ui.backupAt === 'number' ? ui.backupAt : null,
        backupLater: typeof ui.backupLater === 'number' ? ui.backupLater : null,
        checkin: typeof ui.checkin === 'number' ? ui.checkin : null,
        onboarded: !!ui.onboarded,
        // Milestones already celebrated. null = not set up yet (older saves), filled in silently on first run.
        milestones: Array.isArray(ui.milestones) ? ui.milestones.filter(function (k) { return typeof k === 'string'; }).slice(0, 200) : null
      },
      // The "someone else" calculator. Kept apart from profile so it never changes your own plan.
      guest: {
        sex: pick(gu.sex, ['female', 'male', 'other'], null),
        age: numIn(gu.age, 13, 100),
        heightCm: numIn(gu.heightCm, 100, 250),
        kg: numIn(gu.kg, 20, 400),
        steps: numIn(gu.steps, 0, 50000) != null ? Math.round(gu.steps) : 7000,
        training: {
          days: numIn(gt.days, 0, 7) != null ? Math.round(gt.days) : 0,
          type: pick(gt.type, ['lifting', 'cardio', 'mixed', 'sports'], 'lifting'),
          minutes: pick(Number(gt.minutes), [30, 45, 60, 90], 60),
          intensity: pick(gt.intensity, ['light', 'moderate', 'hard'], 'moderate')
        },
        paceKg: numIn(gu.paceKg, -1.5, 1.5) != null ? Number(gu.paceKg) : 0
      },
      seenVersion: typeof d.seenVersion === 'string' ? d.seenVersion : null,
      // Device-only sync bookkeeping. Never uploaded.
      sync: {
        uid: d.sync && typeof d.sync.uid === 'string' ? d.sync.uid : null,
        email: d.sync && typeof d.sync.email === 'string' ? d.sync.email : null,
        updatedAt: d.sync && typeof d.sync.updatedAt === 'number' ? d.sync.updatedAt : 0,
        lastSync: d.sync && typeof d.sync.lastSync === 'number' ? d.sync.lastSync : 0,
        dirty: !!(d.sync && d.sync.dirty)
      }
    };
    const byDate = {};
    (Array.isArray(d.entries) ? d.entries : []).forEach(function (e) {
      if (!e || typeof e !== 'object') return;
      const date = String(e.date || '').slice(0, 10);
      if (!ISO_RE.test(date)) return;
      const kg = e.kg != null ? Number(e.kg) : Number(e.weight); // v1 stored { date, weight } in kg
      if (!isFinite(kg) || kg <= 0 || kg > 700) return;
      const entry = { date: date, kg: Math.round(kg * 10000) / 10000, note: typeof e.note === 'string' ? e.note.slice(0, 200) : '' };
      const kcal = numIn(e.kcal, 1, 20000);
      if (kcal != null) entry.kcal = Math.round(kcal);
      byDate[date] = entry;
    });
    out.entries = Object.keys(byDate).sort().map(function (k) { return byDate[k]; });
    const MEAS_KEYS = ['waist', 'hips', 'chest', 'arm', 'thigh', 'neck'], mByDate = {};
    (Array.isArray(d.measures) ? d.measures : []).forEach(function (m) {
      if (!m || !ISO_RE.test(String(m.date || ''))) return;
      const row = { date: m.date }; let any = false;
      MEAS_KEYS.forEach(function (k) { const v = numIn(m[k], 10, 300); row[k] = v != null ? Math.round(v * 10) / 10 : null; if (v != null) any = true; });
      if (any) mByDate[m.date] = row;
    });
    out.measures = Object.keys(mByDate).sort().map(function (k) { return mByDate[k]; });
    out.food = {};
    if (d.food && typeof d.food === 'object') Object.keys(d.food).forEach(function (date) {
      if (!ISO_RE.test(date) || !Array.isArray(d.food[date])) return;
      const items = d.food[date].filter(function (f) { return f && numIn(f.kcal, 0, 10000) != null; }).slice(0, 100).map(normItem);
      if (items.length) out.food[date] = items;
    });
    function normItem(f) {
        const g = function (v) { return numIn(v, 0, 1000) != null ? Math.round(Number(v)) : 0; };
        const it = { id: typeof f.id === 'string' ? f.id.slice(0, 24) : Math.random().toString(36).slice(2, 10), kcal: Math.round(Number(f.kcal)), protein: g(f.protein), carbs: g(f.carbs), fat: g(f.fat), name: typeof f.name === 'string' ? f.name.trim().slice(0, 80) : '', meal: typeof f.meal === 'string' && MEAL_KEY.test(f.meal) ? f.meal : 'snacks' };
        if (typeof f.rep === 'string' && /^p[\w]{1,12}$/.test(f.rep)) it.rep = f.rep;
        // Foods picked from the database or My foods remember what and how much, so they can be edited later.
        if (typeof f.ref === 'string' && REF_RE.test(f.ref) && numIn(f.g, 0.01, 20000) != null && numIn(f.qty, 0.001, 10000) != null && typeof f.unit === 'string') {
          it.ref = f.ref; it.g = Math.round(Number(f.g) * 10) / 10; it.qty = Math.round(Number(f.qty) * 1000) / 1000; it.unit = f.unit.slice(0, 48);
          if (it.ref.charAt(0) === 'r' && f.rc && Array.isArray(f.rc.items)) {
            const its = f.rc.items.filter(function (x) { return x && typeof x.ref === 'string' && /^[uco][\w-]{1,23}$/.test(x.ref) && numIn(x.g, 0.01, 20000) != null; }).slice(0, 60).map(function (x) {
              return { ref: x.ref, name: typeof x.name === 'string' ? x.name.slice(0, 80) : '', g: Math.round(Number(x.g) * 10) / 10, qty: numIn(x.qty, 0.001, 10000) || Number(x.g), unit: typeof x.unit === 'string' ? x.unit.slice(0, 48) : 'g' };
            });
            if (its.length) it.rc = { servings: numIn(f.rc.servings, 1, 100) ? Math.round(f.rc.servings) : 1, cookedG: numIn(f.rc.cookedG, 1, 50000), items: its };
          }
        }
        if (typeof f.t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(f.t)) it.t = f.t; // time eaten
        if (f.plan === true) it.plan = true; // planned, not eaten yet
        if (numIn(f.u, 1e12, 1e13) != null) it.u = Math.round(f.u); // when it was last changed (for syncing two phones)
        if (typeof f.note === 'string' && f.note.trim()) it.note = f.note.trim().slice(0, 140);
        if (f.pic === true) it.pic = true; // a photo kept on this phone
        if (typeof f.mid === 'string' && /^m[\w-]{1,23}$/.test(f.mid)) { // a meal logged as one entry, with its foods
          it.mid = f.mid;
          if (Array.isArray(f.mi)) { const mi = f.mi.filter(function (x) { return x && !x.mid && numIn(x.kcal, 0, 10000) != null; }).slice(0, 40).map(function (x) { const c = normItem(x); delete c.id; delete c.meal; return c; }); if (mi.length) it.mi = mi; }
        }
        if ((/^cr-/.test(f.id) || (!it.ref && f.n && !it.mid)) && it.name.indexOf(', ') > 0) it.name = crNameStr(it.name); // tidy older imports (and copies)
        // Imported days (Cronometer) bring their own vitamins and minerals.
        if (!it.ref && f.n && typeof f.n === 'object') {
          const n = {}; let c = 0;
          Object.keys(f.n).forEach(function (k) { if (c < 60 && /^[a-zA-Z0-9]{1,6}$/.test(k)) { const v = numIn(f.n[k], 0, 1000000); if (v != null) { n[k] = Math.round(v * 1000) / 1000; c++; } } });
          if (c) it.n = n;
        }
        return it;
    }
    // Before v4.2 a calorie total could be saved with a weigh-in. Turn it into a normal diary item so it can be
    // seen, edited and deleted (the fixed id stops two synced devices from adding it twice).
    out.entries.forEach(function (e) {
      if (e.kcal == null) return;
      if (!out.food[e.date]) out.food[e.date] = [{ id: 'w-' + e.date, kcal: Math.min(e.kcal, 10000), protein: 0, carbs: 0, fat: 0, name: 'Daily total', meal: 'snacks' }];
      delete e.kcal;
    });
    const g1 = function (v) { return numIn(v, 0, 5000) != null ? Math.round(Number(v) * 10) / 10 : 0; };
    out.myFoods = (Array.isArray(d.myFoods) ? d.myFoods : []).filter(function (c) { return c && typeof c.name === 'string' && c.name.trim() && numIn(c.kcal, 0, 10000) != null; }).slice(0, 500).map(function (c) {
      return { id: typeof c.id === 'string' && /^c[\w-]{1,23}$/.test(c.id) ? c.id : 'c' + Math.random().toString(36).slice(2, 10), name: c.name.trim().slice(0, 60),
        unit: (typeof c.unit === 'string' && c.unit.trim() ? c.unit.trim() : 'serving').slice(0, 30), g: numIn(c.g, 0.1, 5000), kcal: Math.round(Number(c.kcal)), p: g1(c.p), c: g1(c.c), f: g1(c.f), code: typeof c.code === 'string' && /^\d{8,14}$/.test(c.code) ? c.code : undefined, ok: c.ok === true ? true : undefined,
        n: (function () { const n = {}; if (c.n && typeof c.n === 'object') ['fib', 'sug', 'sat', 'na', 'k', 'ca', 'fe', 'vD'].forEach(function (k) { const v = numIn(c.n[k], 0, 100000); if (v != null) n[k] = v; }); return n; })() };
    });
    // Scanned products (Open Food Facts), kept so they work offline and show up in search.
    const NKEYS = ['kcal', 'p', 'c', 'f', 'fib', 'sug', 'sat', 'trans', 'mono', 'poly', 'chol', 'na', 'k', 'ca', 'fe', 'mg', 'zn', 'ph', 'vC', 'vA', 'vD', 'b12', 'caff', 'alc'];
    out.offFoods = (Array.isArray(d.offFoods) ? d.offFoods : []).filter(function (o) { return o && typeof o.code === 'string' && /^\d{8,14}$/.test(o.code) && o.n && numIn(o.n.kcal, 0, 1000) != null; }).slice(0, 300).map(function (o) {
      const n = {}; NKEYS.forEach(function (k) { const v = numIn(o.n[k], 0, 1e6); if (v != null) n[k] = v; });
      return { id: 'o' + o.code, code: o.code, name: (typeof o.name === 'string' && o.name.trim() ? o.name.trim() : 'Product ' + o.code).slice(0, 60), brand: typeof o.brand === 'string' ? o.brand.slice(0, 40) : '', n: n, sv: numIn(o.sv, 0.1, 5000) };
    });
    out.recipes = (Array.isArray(d.recipes) ? d.recipes : []).filter(function (r) { return r && typeof r.name === 'string' && r.name.trim() && Array.isArray(r.items); }).slice(0, 300).map(function (r) {
      return { id: typeof r.id === 'string' && /^r[\w-]{1,23}$/.test(r.id) ? r.id : 'r' + Math.random().toString(36).slice(2, 10), name: r.name.trim().slice(0, 60), servings: numIn(r.servings, 1, 100) ? Math.round(r.servings) : 1, cookedG: numIn(r.cookedG, 1, 50000),
        items: r.items.filter(function (it) { return it && typeof it.ref === 'string' && /^[uco][\w-]{1,23}$/.test(it.ref) && numIn(it.g, 0.01, 20000) != null; }).slice(0, 60).map(function (it) {
          return { ref: it.ref, name: typeof it.name === 'string' ? it.name.slice(0, 80) : '', g: Math.round(Number(it.g) * 10) / 10, qty: numIn(it.qty, 0.001, 10000) || Number(it.g), unit: typeof it.unit === 'string' ? it.unit.slice(0, 48) : 'g' };
        }) };
    });
    // Repeat items: foods you've chosen to add to the diary every day (or on chosen days), on their own.
    out.repeats = (Array.isArray(d.repeats) ? d.repeats : []).filter(function (r) { return r && r.item && numIn(r.item.kcal, 0, 10000) != null && typeof r.meal === 'string' && MEAL_KEY.test(r.meal); }).slice(0, 40).map(function (r) {
      const it = normItem(r.item); delete it.id; delete it.meal;
      return { id: typeof r.id === 'string' && /^p[\w]{1,12}$/.test(r.id) ? r.id : 'p' + Math.random().toString(36).slice(2, 10), item: it, meal: r.meal,
        days: Array.isArray(r.days) ? r.days.filter(function (x, i, a) { return Number.isInteger(x) && x >= 0 && x <= 6 && a.indexOf(x) === i; }) : [], u: numIn(r.u, 0, 1e14) || 0, paused: r.paused === true, until: r.paused === true && ISO_RE.test(String(r.until || '')) ? r.until : null, time: /^([01]\d|2[0-3]):[0-5]\d$/.test(String(r.time || '')) ? r.time : null };
    });
    out.meals = (Array.isArray(d.meals) ? d.meals : []).filter(function (m) { return m && typeof m.name === 'string' && m.name.trim() && Array.isArray(m.items) && m.items.length; }).slice(0, 200).map(function (m) {
      return { id: typeof m.id === 'string' && /^m[\w-]{1,23}$/.test(m.id) ? m.id : 'm' + Math.random().toString(36).slice(2, 10), name: m.name.trim().slice(0, 40),
        items: m.items.filter(function (f) { return f && numIn(f.kcal, 0, 10000) != null; }).slice(0, 40).map(function (f) { const it = normItem(f); delete it.id; delete it.meal; return it; }) };
    });
    (function () {
      const byId = {}; out.recipes.forEach(function (r) { byId[r.id] = r; });
      const fix = function (it) {
        if (!it.ref || it.ref.charAt(0) !== 'r' || it.unit !== 'serving') return;
        const rc = it.rc || byId[it.ref]; if (!rc || rc.cookedG || !rc.items.length) return;
        it.g = Math.round(it.qty * recipeServingG(rc) * 10) / 10;
      };
      Object.keys(out.food).forEach(function (k) { out.food[k].forEach(fix); });
      out.meals.forEach(function (m) { m.items.forEach(fix); });
    })();
    out.favs = (Array.isArray(d.favs) ? d.favs : []).filter(function (x, i, a) { return typeof x === 'string' && REF_RE.test(x) && a.indexOf(x) === i; }).slice(0, 300);
    // Daily targets as they were, by the day they started (so past days keep their old goals).
    out.goals = {};
    if (d.goals && typeof d.goals === 'object') Object.keys(d.goals).sort().slice(-1000).forEach(function (k) {
      const g = d.goals[k]; if (!ISO_RE.test(k) || !g) return;
      const kc = numIn(g.k, 500, 10000); if (kc == null) return;
      out.goals[k] = { k: Math.round(kc), p: Math.round(numIn(g.p, 0, 1000) || 0), c: Math.round(numIn(g.c, 0, 2000) || 0), f: Math.round(numIn(g.f, 0, 1000) || 0) };
      if (Array.isArray(g.td) && numIn(g.tx, 0, 3000) != null && numIn(g.rx, 0, 3000) != null) { out.goals[k].td = g.td.filter(function (x) { return Number.isInteger(x) && x >= 0 && x <= 6; }); out.goals[k].tx = Math.round(g.tx); out.goals[k].rx = Math.round(g.rx); }
    });
    out.dayMode = {}; // refeed ('f') or diet break ('b') days
    if (d.dayMode && typeof d.dayMode === 'object') Object.keys(d.dayMode).forEach(function (k) { if (ISO_RE.test(k) && (d.dayMode[k] === 'f' || d.dayMode[k] === 'b')) out.dayMode[k] = d.dayMode[k]; });
    out.dayType = {}; // per-day training/rest override
    if (d.dayType && typeof d.dayType === 'object') Object.keys(d.dayType).forEach(function (k) { if (ISO_RE.test(k) && (d.dayType[k] === 't' || d.dayType[k] === 'r')) out.dayType[k] = d.dayType[k]; });
    // Diary entries deleted on some phone, and when: { id: time } (kept 120 days so other phones learn about it).
    out.del = {};
    // Deletions are remembered for a year, so a phone that's been offline a long time can't bring deleted foods back (newest 5,000 kept).
    if (d.del && typeof d.del === 'object') { const old = Date.now() - 365 * 864e5; Object.keys(d.del).filter(function (k) { const t = numIn(d.del[k], 1e12, 1e13); return typeof k === 'string' && k.length <= 24 && t != null && t > old; }).sort(function (a, b) { return d.del[b] - d.del[a]; }).slice(0, 5000).forEach(function (k) { out.del[k] = Math.round(d.del[k]); }); }
    // Your own portion sizes for any food: { foodId: [{ l: 'my bowl', g: 350 }] }
    out.portions = {};
    if (d.portions && typeof d.portions === 'object') Object.keys(d.portions).slice(0, 500).forEach(function (k) {
      if (!REF_RE.test(k) || !Array.isArray(d.portions[k])) return;
      const l = d.portions[k].filter(function (x) { return x && typeof x.l === 'string' && x.l.trim() && numIn(x.g, 0.1, 5000) != null; }).slice(0, 8).map(function (x) { return { l: x.l.trim().slice(0, 24), g: Math.round(x.g * 10) / 10 }; });
      if (l.length) out.portions[k] = l;
    });
    out.water = {};
    if (d.water && typeof d.water === 'object') Object.keys(d.water).forEach(function (k) { const v = numIn(d.water[k], 1, 10000); if (ISO_RE.test(k) && v != null) out.water[k] = Math.round(v); });
    const fs = d.fast && typeof d.fast === 'object' ? d.fast : {}, okMs = function (v) { return numIn(v, 1.5e12, 4e12); };
    out.fast = { goal: FAST_GOALS.indexOf(Number(fs.goal)) >= 0 ? Number(fs.goal) : 16, start: okMs(fs.start),
      log: (Array.isArray(fs.log) ? fs.log : []).filter(function (x) { return x && okMs(x.s) && okMs(x.e) && x.e > x.s && x.e - x.s < 8 * 864e5; }).slice(0, 100).map(function (x) { return { s: x.s, e: x.e, g: FAST_GOALS.indexOf(Number(x.g)) >= 0 ? Number(x.g) : 16 }; }) };
    const phaseByDate = {};
    (Array.isArray(d.phases) ? d.phases : []).forEach(function (p) {
      if (!p || typeof p !== 'object') return;
      const date = String(p.date || '').slice(0, 10);
      if (!ISO_RE.test(date)) return;
      phaseByDate[date] = { date: date, label: typeof p.label === 'string' ? p.label.trim().slice(0, 40) : '' };
    });
    out.phases = Object.keys(phaseByDate).sort().map(function (k) { return phaseByDate[k]; });
    return out;
  }

  function load() {
    let raw = null, legacy = null;
    try { const s = localStorage.getItem(KEY); if (s) raw = JSON.parse(s); } catch (e) { raw = null; }
    if (!raw) {
      try { const s = localStorage.getItem(LEGACY_KEY); if (s) { raw = JSON.parse(s); legacy = [LEGACY_KEY]; } } catch (e) { raw = null; }
    }
    if (!raw) {
      try {
        const e = localStorage.getItem(V1_KEYS[0]), p = localStorage.getItem(V1_KEYS[1]);
        if (e || p) { raw = { entries: e ? JSON.parse(e) : [], phases: p ? JSON.parse(p) : [], seenVersion: '1.0' }; legacy = V1_KEYS; }
      } catch (err) { raw = null; }
    }
    state = migrate(raw);
    save(); if (legacy) flushSave();
    // Only clear the old copy once the new one has definitely been written.
    if (legacy) {
      try {
        const check = JSON.parse(localStorage.getItem(KEY) || 'null');
        if (check && Array.isArray(check.entries) && check.entries.length === state.entries.length) legacy.forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) {}
    }
  }
  // What gets synced to the account (not ui, sync or seenVersion).
  function cloudData() { return { v: state.v, entries: state.entries, phases: state.phases, food: state.food, measures: state.measures, myFoods: state.myFoods, favs: state.favs, offFoods: state.offFoods, recipes: state.recipes, meals: state.meals, repeats: state.repeats, water: state.water, portions: state.portions, del: state.del, goals: state.goals, dayType: state.dayType, dayMode: state.dayMode, fast: state.fast, settings: state.settings, profile: state.profile, guest: state.guest }; }
  let lastSig = null, quietSave = false, saveQueued = false, saveQuiet = false;
  let dataVer = 0; // goes up on every change (for caches)
  function save() {
    dataVer++;
    saveQuiet = saveQueued ? saveQuiet && quietSave : quietSave; // quiet only if every save in the batch was
    if (saveQueued) return;
    saveQueued = true;
    // Written down just after the next frame is drawn, so saving never holds up what a tap shows.
    // (Closing or leaving the app writes it straight away: see pagehide and visibilitychange below.)
    if (document.hidden || typeof requestAnimationFrame !== 'function') Promise.resolve().then(flushSave);
    else { requestAnimationFrame(function () { setTimeout(flushSave, 0); }); setTimeout(flushSave, 300); }
  }
  // What every diary entry looked like at the last save, to notice which ones changed or were deleted since.
  let itemSigs = null;
  function stampItems(quiet) {
    if (!state.del) state.del = {};
    const now = Date.now(), seen = {}, prev = itemSigs, next = {};
    Object.keys(state.food).forEach(function (d) { state.food[d].forEach(function (it) {
      const u = it.u; delete it.u; const sg = d + '|' + JSON.stringify(it); if (u !== undefined) it.u = u;
      next[it.id] = sg; seen[it.id] = 1;
      if (prev && !quiet && prev[it.id] !== sg) it.u = now; // new or changed
      if (state.del[it.id]) delete state.del[it.id]; // it's back (undo)
    }); });
    if (prev && !quiet) Object.keys(prev).forEach(function (id) { if (!seen[id]) state.del[id] = now; });
    itemSigs = next;
  }
  function flushSave() {
    if (!saveQueued) return;
    saveQueued = false;
    stampItems(saveQuiet || lastSig === null);
    const sig = JSON.stringify(cloudData());
    if (lastSig !== null && sig !== lastSig && !saveQuiet) { state.sync.updatedAt = Date.now(); state.sync.dirty = true; schedulePush(); }
    lastSig = sig;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    renderSyncDot();
  }
  window.addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', function () { if (document.hidden) flushSave(); });
  setTimeout(function () { if (typeof dailyBackup === 'function') dailyBackup(); }, 4000);
  // For the test suite only (opened with ?test=1): the sync merge, so it can be checked directly.
  if (/[?&]test=1\b/.test(location.search)) window.__setpoint = { mergeData: function (l, c, n) { return mergeData(l, c, n); }, migrate: function (d) { return migrate(d); }, foodReady: function () { return !!foodDB; }, loadFoods: function () { return loadFoods(); }, highIn: function (k, by) { return highInHtml(k, by); }, db: function () { return foodDB; }, energy: function () { const e = activeEnergy(), pl = makePlan(e); return e && { tdee: Math.round(e.tdee), source: e.source, w: e.w, calc: e.calc && Math.round(e.calc.tdee), target: pl && Math.round(pl.target), adjust: state.profile.adjustKcal, pace: state.profile.paceKg, tune: state.ui.tune }; }, nav: { open: function (h) { openSheet(h); }, close: function () { closeSheet(); }, tab: function (t) { showTab(t); } }, renderAll: function () { renderAll(); }, words: function (id) { const f = getFood(id); return f && { w: f.w, first: f.first, on: f.on }; }, search: function (q, n) { return searchFoods(q, {}, { noRecipes: true }).slice(0, n || 5).map(function (f) { return f.id + ' ' + f.name; }); } };
  function snapshot() { flushSave(); return JSON.stringify(state); }
  function restore(snap) { const sy = state.sync; state = migrate(JSON.parse(snap)); state.sync = sy; save(); applyAppearance(); renderAll(); }

  /* ================= Helpers ================= */
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayISO() { return isoOf(new Date()); }
  function parseISO(iso) { const p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  const dayNumMemo = {};
  function dayNum(iso) { let v = dayNumMemo[iso]; if (v === undefined) { const p = iso.split('-'); v = dayNumMemo[iso] = Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); } return v; }
  function isoFromDay(n) { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  // Date formatters are slow to create, so each style is made once.
  const dtfs = {};
  function dtf(opts) { const loc = state && state.settings && state.settings.lang === 'ar' ? 'ar-EG-u-nu-latn' : undefined, k = (loc || '') + JSON.stringify(opts); return dtfs[k] || (dtfs[k] = new Intl.DateTimeFormat(loc, opts)); }
  function fmtDate(iso, opts) { return dtf(opts || { month: 'short', day: 'numeric' }).format(parseISO(iso)); }
  function fmtFuture(d) { return dtf(d.getFullYear() !== new Date().getFullYear() ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' }).format(d); }
  function relDate(iso) {
    const diff = dayNum(todayISO()) - dayNum(iso);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff === -1) return 'Tomorrow';
    return fmtDate(iso, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  function unit() { return state.settings.unit; }
  function toDisp(kg) { return unit() === 'lb' ? kg * LB : kg; }
  function fromDisp(v) { return unit() === 'lb' ? v / LB : v; }
  function fmtW(kg, dp) { return toDisp(kg).toFixed(dp == null ? 1 : dp); }
  function signed(v, dp) { const r = Number(v.toFixed(dp)); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r).toFixed(dp); }
  function fmtDelta(kg, dp) { return signed(toDisp(kg), dp == null ? 1 : dp); }
  function U() { return '<span class="unit">' + unit() + '</span>'; }
  function parseNum(s) { const n = parseFloat(String(s).replace(',', '.').replace(/[^\d.\-]/g, '')); return isFinite(n) ? n : NaN; }
  function fmtKcal(n) { return Math.round(n).toLocaleString(); }
  function roundKcal(n) { return Math.round(n / 10) * 10; }
  const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
  const MOON_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/><path d="M17 3.5v3M15.5 5h3"/></svg>';
  const COG_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>';
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const SEARCH_MINI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/></svg>';
  const TORCH_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1.5 5h-5zM9.5 8h5v4.5l-1.2 8.5h-2.6l-1.2-8.5z"/><path d="M12 12v2.5"/></svg>';
  const MIC_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
  const LEAF_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/></svg>';
  const FLAME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2c.5 2.9 4.9 5 4.9 9.9a4.9 4.9 0 0 1-9.8 0c0-2.2 1.1-3.8 2.3-4.8.1 1.7.9 2.7 2 3.1-.8-3 .1-6 .6-8.2z"/></svg>';
  const ARROW_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
  const ARROW_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';

  // iPhones don't support vibration from web apps, but toggling a hidden switch gives the system's light tick (iOS 18+).
  let hapEl = null;
  function iosTick() {
    if (!hapEl) {
      hapEl = document.createElement('label'); hapEl.setAttribute('aria-hidden', 'true');
      hapEl.style.cssText = 'position:fixed;left:-100px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
      hapEl.innerHTML = '<input type="checkbox" switch tabindex="-1" />';
      hapEl.addEventListener('click', function (e) { e.stopPropagation(); }, true);
      document.body.appendChild(hapEl);
    }
    try { hapEl.click(); } catch (e) {}
  }
  // Fewer animations when the phone asks for reduced motion.
  const calmMq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function calmMotion() { return !!(calmMq && calmMq.matches); }
  // Parts of the app that aren't on screen are redrawn a moment after a change, one at a time, so a change
  // only waits for what you can see. Opening one that's still waiting draws it straight away (catchUp).
  const later = {}; let laterT = 0;
  function whenSeen(key, draw, seen) {
    if (seen()) { delete later[key]; draw(); return; }
    later[key] = draw; clearTimeout(laterT); laterT = setTimeout(drainLater, 900);
  }
  function drainLater() {
    const k = Object.keys(later)[0]; if (!k) return;
    const draw = later[k]; delete later[k]; draw();
    if (Object.keys(later).length) laterT = setTimeout(drainLater, 80);
  }
  /* ================= Springs ================= */
  // Movement that finishes like iPhone: it carries on at the speed your finger let go and settles naturally,
  // instead of a fixed curve that always starts from a standstill. The spring is worked out up front and handed to
  // the browser as a curve, so the GPU runs it smoothly even while the app is busy.
  // response ≈ how long the move takes (seconds); damping 1 = no bounce, a little under 1 = a small bounce.
  const curveOK = (function () { try { return !!(window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)')); } catch (e) { return false; } })();
  function springCurve(response, damping, v0, noOver) {
    // v0: starting speed towards the target, in distances per second (0 = from rest)
    const w = 2 * Math.PI / Math.max(0.05, response), z = damping;
    let x;
    if (z < 1) { const wd = w * Math.sqrt(1 - z * z), B = (z * w - v0) / wd; x = function (t) { return Math.exp(-z * w * t) * (Math.cos(wd * t) + B * Math.sin(wd * t)); }; }
    else if (z === 1) { const B = w - v0; x = function (t) { return Math.exp(-w * t) * (1 + B * t); }; }
    else { const q = Math.sqrt(z * z - 1), r1 = -w * (z - q), r2 = -w * (z + q), c2 = (-v0 - r1) / (r2 - r1), c1 = 1 - c2; x = function (t) { return c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t); }; }
    // how long until it has settled (within a fraction of a pixel on a typical move)
    let T = 0; const dt = 1 / 240;
    while (T < 2.5) { const a = x(T), b = x(T + dt); if (Math.abs(a) < 0.0015 && Math.abs(b - a) / dt < 0.03) break; T += dt; }
    T = Math.max(T, 0.12);
    if (!curveOK) return { easing: v0 > 4 ? 'cubic-bezier(.12,.75,.3,1)' : 'cubic-bezier(.25,.8,.3,1)', duration: Math.round(T * 850) };
    const N = Math.max(30, Math.min(160, Math.round(T * 130))), pts = [];
    for (let i = 0; i <= N; i++) { let p = i === N ? 1 : 1 - x(T * i / N); if (noOver) p = Math.min(1, p); pts.push(+p.toFixed(4)); }
    return { easing: 'linear(' + pts.join(', ') + ')', duration: Math.round(T * 1000) };
  }
  // Several things moving as one (a sheet and its dimming; a page, its shadow and the page underneath): the same
  // spring, each part from one look to another. parts: [[element, fromKeyframe, toKeyframe], …]
  // o: response, damping, v (finger speed in px/ms towards the target), dist (px the main part moves), noOver.
  // Returns { stop(), onEnd } — stop() freezes everything where it is right now (to be caught by a finger).
  function springGroup(parts, o) {
    const v0 = o.dist > 0.5 ? (o.v || 0) * 1000 / o.dist : 0;
    const c = springCurve(o.response || 0.4, o.damping == null ? 1 : o.damping, Math.max(-25, Math.min(35, v0)), o.noOver);
    const run = { ms: c.duration, onEnd: null, over: false };
    const anims = parts.map(function (p) { return p[0].animate([p[1], p[2]], { duration: c.duration, easing: c.easing, fill: 'forwards' }); });
    const put = function (el, k, v) { el.style[k] = typeof v === 'number' ? String(v) : v; };
    run.stop = function () { if (run.over) return; run.over = true; parts.forEach(function (p, i) { const cs = getComputedStyle(p[0]); Object.keys(p[2]).forEach(function (k) { put(p[0], k, cs[k]); }); anims[i].cancel(); }); };
    const fin = function () { if (run.over) return; run.over = true; parts.forEach(function (p, i) { Object.keys(p[2]).forEach(function (k) { put(p[0], k, p[2][k]); }); anims[i].cancel(); }); if (run.onEnd) run.onEnd(); };
    if (anims.length) anims[0].onfinish = fin; else setTimeout(fin, 0);
    return run;
  }
  // How fast a finger is moving (px/ms) at the end, so a flick counts even at the end of a slow drag;
  // 0 if it rested before letting go.
  function fingerSpeed() {
    let s = [];
    return {
      add: function (v, t) { s.push([v, t]); if (s.length > 10) s.shift(); },
      get: function (now) {
        // the last ~60 ms (a sharp flick at the end counts in full), or ~100 ms if the finger moved less often
        let r = s.filter(function (x) { return now - x[1] < 60; }); if (r.length < 3) r = s.filter(function (x) { return now - x[1] < 100; });
        if (r.length < 2 && s.length > 1 && now - s[s.length - 1][1] < 50) r = s.slice(-2); // a very quick flick: its last two points
        if (r.length < 2) return 0; const a = r[0], b = r[r.length - 1]; return b[1] > a[1] ? (b[0] - a[0]) / (b[1] - a[1]) : 0;
      },
      reset: function () { s = []; }
    };
  }
  // iPhone's rubber band: pulling past an end gives less and less (dim = how far it can stretch at most).
  function rubber(x, dim) { return (1 - 1 / (x * 0.55 / dim + 1)) * dim; }
  // Where an element's transform really is right now (also halfway through an animation).
  function nowAt(el) { try { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); return { x: m.m41, y: m.m42 }; } catch (e) { return { x: 0, y: 0 }; } }
  function catchUp(key) { const draw = later[key]; if (draw) { delete later[key]; draw(); } }
  function buzz(kind) {
    if (!state.settings.haptics) return;
    if (!navigator.vibrate) { iosTick(); if (kind === 'success' || kind === 'warn') setTimeout(iosTick, 90); return; }
    const p = { light: 8, medium: 16, success: [12, 50, 16], warn: [24, 40, 24] }[kind] || 8;
    try { navigator.vibrate(p); } catch (e) {}
  }

  /* ================= Weight maths ================= */
  // A run of days worked out in one go (a streak over months, two weeks of nutrients, a chart) shares the
  // things that can't change in between: today's trend, burn and plan are worked out once, not once a day.
  // Only for reading: nothing in a pass changes your data.
  let pass = null;
  function onePass(fn) { if (pass) return fn(); pass = {}; try { return fn(); } finally { pass = null; } }
  function inPass(k, fn) { if (!pass) return fn(); if (!(k in pass)) pass[k] = fn(); return pass[k]; }
  function entries() { return state.entries; }
  function findEntry(date) {
    if (pass) { const m = inPass('ent', function () { const o = {}; state.entries.forEach(function (e) { if (!o[e.date]) o[e.date] = e; }); return o; }); return m[date] || null; }
    return state.entries.find(function (e) { return e.date === date; }) || null;
  }
  function upsert(entry) {
    const i = state.entries.findIndex(function (e) { return e.date === entry.date; });
    if (i >= 0) state.entries[i] = entry; else state.entries.push(entry);
    state.entries.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  }
  // Trend weight: each day moves the trend 20% of the way towards that day's weight (lag similar to a
  // 7-day average, but smooth and gap-proof). Days without a weigh-in use a straight line between the
  // weigh-ins either side, and a single day can't pull it by more than 1.5 kg, so water spikes barely show.
  const TREND_ALPHA = 0.2, SPIKE_CAP = 1.5;
  let trendCache = { sig: null, map: null };
  function trendMap() { return inPass('tm', trendMapNow); }
  function trendMapNow() {
    const l = state.entries; let h = 0;
    for (let i = 0; i < l.length; i++) h = (h * 31 + dayNum(l[i].date) * 7 + Math.round(l[i].kg * 1000)) % 2147483647; // cheap fingerprint
    const sig = l.length + ':' + h;
    if (trendCache.sig === sig) return trendCache.map;
    const map = {};
    if (l.length) {
      let t = l[0].kg;
      map[dayNum(l[0].date)] = t;
      for (let i = 1; i < l.length; i++) {
        const a = l[i - 1], b = l[i], da = dayNum(a.date), db = dayNum(b.date);
        for (let d = da + 1; d <= db; d++) {
          const w = a.kg + (b.kg - a.kg) * (d - da) / (db - da);
          t += TREND_ALPHA * Math.max(-SPIKE_CAP, Math.min(SPIKE_CAP, w - t));
        }
        map[db] = t;
      }
    }
    trendCache = { sig: sig, map: map };
    return map;
  }
  // Trend on the latest weigh-in day at or before `day`.
  function trendAt(day) {
    const map = trendMap(), l = state.entries;
    for (let i = l.length - 1; i >= 0; i--) { const d = dayNum(l[i].date); if (d <= day) return map[d]; }
    return null;
  }
  function withTrend() { const map = trendMap(); return state.entries.map(function (e) { const d = dayNum(e.date); return { date: e.date, kg: e.kg, note: e.note, kcal: e.kcal, day: d, trend: map[d] }; }); }
  function linreg(points) {
    const n = points.length;
    if (n < 2) return null;
    let sx = 0, sy = 0, sxy = 0, sxx = 0;
    points.forEach(function (p) { sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x; });
    const den = n * sxx - sx * sx;
    if (den === 0) return null;
    const slope = (n * sxy - sx * sy) / den;
    return { slope: slope, intercept: (sy - slope * sx) / n };
  }
  function currentPhase() { return state.phases.length ? state.phases[state.phases.length - 1] : null; }
  function trend() {
    const p = currentPhase();
    const list = p ? state.entries.filter(function (e) { return e.date >= p.date; }) : state.entries;
    if (list.length < 2) return null;
    const reg = linreg(list.map(function (e) { return { x: dayNum(e.date), y: e.kg }; }));
    return reg ? { perDay: reg.slope, perWeek: reg.slope * 7, first: list[0] } : null;
  }
  function currentKg() { return inPass('kg', function () { const l = state.entries; return l.length ? trendAt(dayNum(l[l.length - 1].date)) : null; }); }


  // Calories for a day: the food log if there is one, otherwise the single total saved with the weigh-in.
  function foodFor(date) { return state.food[date] || []; }
  // What counts towards a day: food you ate. Planned food only counts on days still to come (to plan them).
  const PLAN_DAYS = 14;
  function counts(f, date) { return !f.plan || date > todayISO(); }
  function eatenFor(date) { const l = foodFor(date); return date > todayISO() ? l.slice() : l.filter(function (f) { return !f.plan; }); }
  function plannedFor(date) { return date > todayISO() ? [] : foodFor(date).filter(function (f) { return f.plan; }); }
  function dayTotals(date) {
    const items = eatenFor(date);
    if (items.length) { let k = 0, p = 0, c = 0, f = 0; for (let i = 0; i < items.length; i++) { const x = items[i]; k += x.kcal || 0; p += x.protein || 0; c += x.carbs || 0; f += x.fat || 0; } return { kcal: k, protein: p, carbs: c, fat: f, fromLog: true }; }
    const e = findEntry(date);
    return { kcal: e && e.kcal ? e.kcal : 0, protein: 0, carbs: 0, fat: 0, fromLog: false };
  }
  function dayKcal(date) { return dayTotals(date).kcal || null; }

  // Weeks start on your chosen day (Friday unless changed). Days are dayNum() values.
  function weekStart(day) { const ws = state && state.settings && state.settings.weekStart != null ? state.settings.weekStart : 5; return day - ((new Date(day * 864e5).getUTCDay() - ws + 7) % 7); }
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function weekOrder() { const ws = state.settings.weekStart; return [0, 1, 2, 3, 4, 5, 6].map(function (i) { return (ws + i) % 7; }); }
  function weekStats(start) {
    const es = state.entries.filter(function (e) { const d = dayNum(e.date); return d >= start && d <= start + 6; });
    if (!es.length) return null;
    const today = dayNum(todayISO()), kc = [];
    for (let d = start; d <= start + 6 && d < today; d++) { const k = dayKcal(isoFromDay(d)); if (k) kc.push(k); }
    let lo = es[0].kg, hi = es[0].kg;
    es.forEach(function (e) { lo = Math.min(lo, e.kg); hi = Math.max(hi, e.kg); });
    return {
      start: start, n: es.length, lo: lo, hi: hi,
      avg: es.reduce(function (a, e) { return a + e.kg; }, 0) / es.length,
      kcal: kc.length ? kc.reduce(function (a, k) { return a + k; }, 0) / kc.length : null
    };
  }
  function weekRange(start) {
    const a = isoFromDay(start), b = isoFromDay(start + 6);
    return fmtDate(a) + ' – ' + (a.slice(5, 7) === b.slice(5, 7) ? parseISO(b).getDate() : fmtDate(b));
  }
  function deltaChip(kg, goodWhenDown) {
    const flat = Math.abs(toDisp(kg)) < 0.05;
    const good = !flat && goodWhenDown != null && (kg < 0) === goodWhenDown;
    return '<span class="delta-chip' + (good ? ' good' : '') + '">' + (flat ? 'Steady' : (kg < 0 ? ARROW_DOWN : ARROW_UP) + fmtW(Math.abs(kg)) + ' ' + unit()) + '</span>';
  }
  // Which direction counts as progress: towards the goal, or the chosen pace.
  function goodWhenDown() {
    const g = state.settings.goalKg, now = currentKg();
    if (g && now != null && Math.abs(g - now) > 0.3) return g < now;
    const p = state.profile.paceKg;
    return p ? p < 0 : null;
  }

  /* ================= Energy maths ================= */
  const KCAL_PER_KG = 7700;
  // Gross METs for a typical session (lifting includes rest between sets).
  const TRAIN_MET = {
    lifting: { light: 3, moderate: 3.5, hard: 5 },
    cardio: { light: 4, moderate: 7, hard: 10 },
    mixed: { light: 4, moderate: 6, hard: 8 },
    sports: { light: 4.5, moderate: 7, hard: 9 }
  };
  const RATES = { kg: { lose: [0.25, 0.5, 0.75, 1], gain: [0.25, 0.5] }, lb: { lose: [0.5, 1, 1.5, 2], gain: [0.5, 1] } };
  function ageNow() { const y = state.profile.birthYear; return y ? new Date().getFullYear() - y : null; }
  function profileReady() { const p = state.profile; return !!(p.sex && p.birthYear && p.heightCm); }

  // TDEE = (BMR + everyday movement + steps + training) / 0.9; the last 10% is digestion.
  // `p` needs sex, age, heightCm, steps, training and optionally bodyFat. Pure, so the guest calculator can use it.
  function energyFor(p, kg) {
    const bmr = p.bodyFat ? 370 + 21.6 * kg * (1 - p.bodyFat / 100)
      : 10 * kg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : p.sex === 'female' ? -161 : -78);
    const km = p.steps * p.heightCm * 0.00415 / 1000;  // stride ≈ 41.5% of height
    const steps = 0.5 * kg * km;                        // walking ≈ 0.5 kcal per kg per km above rest
    const t = p.training;
    const train = t.days * (TRAIN_MET[t.type][t.intensity] - 1) * kg * (t.minutes / 60) / 7;
    const tdee = (bmr * 1.1 + steps + train) / 0.9;
    const pal = tdee / bmr;
    const level = pal < 1.35 ? 'Sedentary' : pal < 1.5 ? 'Lightly active' : pal < 1.7 ? 'Moderately active' : pal < 1.9 ? 'Very active' : 'Extremely active';
    return { kg: kg, bmr: bmr, life: tdee - bmr - steps - train, steps: steps, train: train, tdee: tdee, level: level };
  }
  function calcEnergy() { return inPass('ce', calcEnergyNow); }
  function calcEnergyNow() {
    const p = state.profile, kg = currentKg();
    if (!profileReady() || kg == null) return null;
    return energyFor(Object.assign({}, p, { age: ageNow() }), kg);
  }
  // Real TDEE from the last 28 days: average intake minus the energy in the weight change.
  function measuredEnergy() { return inPass('me', measuredEnergyNow); }
  function measuredEnergyNow() {
    const end = dayNum(todayISO());
    const win = state.entries.filter(function (e) { return dayNum(e.date) > end - 28; });
    const cal = [];
    // Days logged at under half your estimated burn are probably half-logged, and would make maintenance look too low.
    const ce = calcEnergy(), lowCut = ce ? ce.tdee * 0.5 : 800;
    for (let d = end - 27; d < end; d++) { const k = dayKcal(isoFromDay(d)); if (k && k >= lowCut) cal.push(k); }
    const span = win.length > 1 ? dayNum(win[win.length - 1].date) - dayNum(win[0].date) + 1 : win.length;
    const res = { ready: false, calDays: cal.length, span: span, needCal: 10, needSpan: 14 };
    if (cal.length < res.needCal || span < res.needSpan) return res;
    const reg = linreg(win.map(function (e) { return { x: dayNum(e.date), y: e.kg }; }));
    if (!reg) return res;
    const intake = cal.reduce(function (a, k) { return a + k; }, 0) / cal.length;
    res.ready = true; res.intake = intake; res.rateKgWk = reg.slope * 7; res.tdee = intake - reg.slope * KCAL_PER_KG;
    return res;
  }
  function activeEnergy() { return inPass('ae', activeEnergyNow); }
  // Today's plan from today's burn (what the day plans below start from).
  function livePlan() { return inPass('lp', function () { return makePlan(activeEnergy()); }); }
  function activeEnergyNow() {
    const c = calcEnergy(), m = measuredEnergy(), kg = currentKg(), src = state.profile.tdeeSource;
    if (m.ready && kg != null && (src === 'measured' || !c)) return { tdee: m.tdee, source: 'measured', calc: c, kg: kg, m: m };
    if (!c) return null;
    if (src === 'auto') {
      // Automatic: start from the formula plus the weekly corrections, then lean more and more on your real
      // burn (food log + weight trend) as you log: from about 10 good days, all of it by 20 days over 4 weeks.
      // Kept within 75–130% of the formula, so a few half-logged days can't send it somewhere silly.
      const base = c.tdee + (state.settings.autoAdjust ? state.profile.adjustKcal : 0);
      let w = 0, tdee = base;
      if (m.ready) { w = clamp((m.calDays - 7) / 13, 0, 1) * clamp(m.span / 28, 0.5, 1); tdee = base + w * (clamp(m.tdee, c.tdee * 0.75, c.tdee * 1.3) - base); }
      return { tdee: tdee, source: 'auto', w: w, calc: c, kg: c.kg, m: m };
    }
    return { tdee: c.tdee, source: 'calc', calc: c, kg: c.kg };
  }
  // Pace in kg/week, snapped to the options shown for the current unit.
  function snapPace(pace) {
    if (pace == null || Math.abs(pace) < 1e-6) return { dir: 'maintain', kg: 0, i: -1 };
    const dir = pace < 0 ? 'lose' : 'gain';
    const opts = RATES[unit()][dir].map(function (v) { return unit() === 'lb' ? v / LB : v; });
    let i = 0;
    opts.forEach(function (o, j) { if (Math.abs(o - Math.abs(pace)) < Math.abs(opts[i] - Math.abs(pace))) i = j; });
    return { dir: dir, kg: (dir === 'lose' ? -1 : 1) * opts[i], i: i };
  }
  function paceValue(dir, i) {
    if (dir === 'maintain') return 0;
    const v = RATES[unit()][dir][i];
    return (dir === 'lose' ? -1 : 1) * (unit() === 'lb' ? v / LB : v);
  }
  function currentPace() {
    let pace = state.profile.paceKg;
    if (pace == null) {
      const g = state.settings.goalKg, kg = currentKg();
      pace = (g && kg && g < kg - 0.5) ? -0.5 : (g && kg && g > kg + 0.5) ? 0.25 : 0;
    }
    return snapPace(pace);
  }
  function setPace(dir, i) { state.profile.paceKg = paceValue(dir, i); state.profile.paceAt = dayNum(todayISO()); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  // What your workouts mean for protein: lifting (or HIIT / sports) twice a week or more, mostly cardio, or neither.
  function trainKind(t) { if (!t || !t.days || t.days < 2) return 'none'; return t.type === 'cardio' ? 'cardio' : 'strength'; }
  // [min, max, recommended] in g per kg of the reference weight. Lean mass needs a bit more per kg.
  // Recommended protein (per kg of a healthy reference weight): lifting 1.8 (2.0 while losing, to keep muscle),
  // cardio 1.6 (1.8), no regular training 1.4 (1.6). In line with ISSN / Morton 2018 (1.6 g/kg covers most lifters).
  function macroRanges(losing, lean, training) {
    if (lean === undefined) lean = !!state.profile.bodyFat;
    const kind = trainKind(training === undefined ? state.profile.training : training);
    const rec = ({ strength: losing ? 2.0 : 1.8, cardio: losing ? 1.8 : 1.6, none: losing ? 1.6 : 1.4 })[kind] + (lean ? 0.2 : 0);
    return {
      protein: lean ? [1.4, 2.6, Math.round(rec * 10) / 10] : [1.2, 2.2, rec],
      fat: [0.6, 1.2, 0.8],
      kind: kind
    };
  }
  // o: { tdee, bmr, kg, pace (snapped), goal, p: { sex, heightCm, bodyFat, macros } }. Pure.
  function planFor(o) {
    const pace = o.pace, kg = o.kg, p = o.p, goal = o.goal;
    const target = o.tdee + pace.kg * KCAL_PER_KG / 7 + (o.adjust || 0);
    let warn = '';
    if (pace.kg < 0 && Math.abs(pace.kg) > kg * 0.01) warn = 'Faster than 1% of body weight a week';
    else if (o.bmr && target < o.bmr) warn = 'Below resting burn';
    else if (target < (p.sex === 'male' ? 1500 : 1200)) warn = 'Very low for getting enough nutrients';
    let eta = '';
    if (goal && pace.kg !== 0 && (goal < kg) === (pace.kg < 0) && Math.abs(goal - kg) > 0.2) {
      const d = new Date(); d.setDate(d.getDate() + Math.round(Math.abs(goal - kg) / Math.abs(pace.kg) * 7));
      eta = 'goal by ' + fmtFuture(d);
    }
    // Protein and fat are set per kg of a reference weight. Extra body fat doesn't need extra
    // protein, so above BMI 25 we use the weight at BMI 25 for their height (unless body fat is known).
    const healthyKg = 25 * Math.pow(p.heightCm / 100, 2);
    let ref, refWhy;
    if (p.bodyFat) { ref = kg * (1 - p.bodyFat / 100); refWhy = 'your lean mass'; }
    else if (kg > healthyKg) { ref = healthyKg; refWhy = 'healthy weight for your height'; }
    else { ref = kg; refWhy = 'your weight'; }
    const m = p.macros || { protein: null, fat: null };
    const r = macroRanges(pace.kg < 0, !!p.bodyFat, p.training || null);
    const custom = m.protein != null || m.fat != null;
    const proteinPerKg = m.protein != null ? clamp(m.protein, r.protein[0], r.protein[1]) : r.protein[2];
    const fatPerKg = m.fat != null ? clamp(m.fat, r.fat[0], r.fat[1]) : r.fat[2];
    const protein = Math.round(ref * proteinPerKg / 5) * 5;
    // Recommended fat never drops below 22% of calories; a custom amount is used as set.
    let fat = Math.round((m.fat != null ? ref * fatPerKg : Math.max(ref * fatPerKg, target * 0.22 / 9)) / 5) * 5;
    // Very low targets: keep at least ~50 g carbs by easing recommended fat towards its floor (0.6 g/kg, 20% of calories).
    if (m.fat == null && target - protein * 4 - fat * 9 < 200) fat = Math.max(Math.round(Math.max(ref * 0.6, target * 0.2 / 9) / 5) * 5, Math.min(fat, Math.round((target - protein * 4 - 200) / 9 / 5) * 5));
    const carbs = Math.max(0, Math.round((target - protein * 4 - fat * 9) / 4 / 5) * 5);
    if (!warn && protein * 4 + fat * 9 > target) warn = 'Protein and fat alone are more than this target';
    return { target: target, pace: pace, warn: warn, eta: eta, protein: protein, fat: fat, carbs: carbs, ref: ref, refWhy: refWhy, proteinPerKg: proteinPerKg, fatPerKg: fatPerKg, custom: custom, kind: r.kind };
  }
  // Self-adjusting target, checked every day you open the app (at most one change every 6 days): compare the
  // last two weeks' real trend with the chosen pace. Before blaming the formula it checks your food log: if you
  // ate more (or less) than your target, that part of the gap is yours, not the formula's, and stays. The rest
  // moves the target half of the way (max ±150 kcal a week, ±600 total). Waits 2 weeks after you change your
  // goal, pace or activity. Not needed once the target runs fully on your log.
  function computeAdjust() { return onePass(computeAdjustNow); }
  function computeAdjustNow() {
    const en = activeEnergy();
    if (!state.settings.autoAdjust || !en || !(en.source === 'calc' || (en.source === 'auto' && en.w < 1))) return null;
    const today = dayNum(todayISO()), p = state.profile;
    if (p.adjustAt != null && today - p.adjustAt < 6) return null;
    if (p.paceAt != null && today - p.paceAt < 14) return null;
    const win = state.entries.filter(function (e) { return dayNum(e.date) > today - 15; });
    if (win.length < 6 || dayNum(win[win.length - 1].date) - dayNum(win[0].date) < 10) return null;
    const map = trendMap(), reg = linreg(win.map(function (e) { const d = dayNum(e.date); return { x: d, y: map[d] }; }));
    if (!reg) return null;
    const actual = reg.slope * 7, planned = currentPace().kg;
    const gap = (actual - planned) * KCAL_PER_KG / 7; // kcal a day: + means heavier than the plan expects
    // Your food log for the same two weeks (days that look fully logged).
    const lowCut = en.calc ? en.calc.tdee * 0.5 : 800;
    let n = 0, eat = 0, tgt = 0;
    for (let d = today - 14; d < today; d++) { const iso = isoFromDay(d), k = dayKcal(iso); if (!k || k < lowCut) continue; const pl = dayPlan(iso); if (!pl) continue; n++; eat += k; tgt += pl.target; }
    const over = n >= 7 ? (eat - tgt) / n : null;
    const left = over != null && Math.sign(over) === Math.sign(gap) ? (Math.abs(over) >= Math.abs(gap) ? 0 : gap - over) : gap;
    const change = Math.round(Math.max(-150, Math.min(150, -left * 0.5)) / 10) * 10;
    const plateau = planned < 0 && Math.abs(actual) < 0.1 && actual > planned;
    const why = { actual: actual, planned: planned, over: over != null ? Math.round(over) : null, plateau: plateau };
    if (Math.abs(change) < 30) return Math.abs(gap) >= 60 && over != null && left !== gap ? Object.assign({ hold: true, change: 0 }, why) : null;
    const before = p.adjustKcal, after = Math.max(-600, Math.min(600, before + change));
    return after === before ? null : Object.assign({ change: after - before, before: before, after: after }, why);
  }
  // Why the target moved (or didn't), in plain words.
  function tuneWhy(a) {
    const r = unit() === 'lb' ? 'lb' : 'kg', fmt = function (x) { return Number(Math.abs(toDisp(x)).toFixed(2)) + ' ' + r + '/week'; };
    if (a.goal) return 'You reached your goal, so your target is now maintenance.';
    if (a.hold) return (a.over > 0 ? 'You ate about ' + fmtKcal(Math.abs(a.over)) + ' kcal a day over your target' : 'You ate about ' + fmtKcal(Math.abs(a.over)) + ' kcal a day under your target') + ', which explains your weight, so the target stays. Hitting it should get you back on pace.';
    const moved = a.plateau ? 'Your weight has held steady for 2 weeks' : a.planned === 0 ? (a.actual < 0 ? 'Your weight is drifting down' : 'Your weight is drifting up') + ' (' + fmt(a.actual) + ')'
      : (Math.abs(a.actual) < Math.abs(a.planned) || Math.sign(a.actual) !== Math.sign(a.planned) ? 'You\'re ' + (a.planned < 0 ? 'losing' : 'gaining') + ' slower than your plan' : 'You\'re ' + (a.planned < 0 ? 'losing' : 'gaining') + ' faster than your plan') + ' (' + fmt(a.actual) + ' vs ' + fmt(a.planned) + ')';
    return moved + (a.over != null && Math.abs(a.over) < 60 ? ' while eating on target' : '') + ', so your burn is ' + (a.change < 0 ? 'lower' : 'higher') + ' than estimated.';
  }
  // Runs on every open: apply a due adjustment, and switch to maintenance once you reach your goal.
  function autoTune() {
    const today = dayNum(todayISO()), p = state.profile, g = state.settings.goalKg, kg = currentKg(), pace = currentPace();
    if (g && kg != null && pace.dir !== 'maintain' && state.ui.goalHit !== g && (pace.dir === 'lose' ? kg <= g : kg >= g)) {
      const was = p.paceKg;
      p.paceKg = 0; p.paceAt = today; state.ui.goalHit = g;
      state.ui.tune = { at: today, change: 0, goal: true, undoPace: was };
      save(); return state.ui.tune;
    }
    const adj = computeAdjust();
    if (!adj) return null;
    p.adjustAt = today;
    if (!adj.hold) p.adjustKcal = adj.after;
    state.ui.tune = Object.assign({ at: today }, adj);
    save(); return state.ui.tune;
  }
  function undoTune(t) {
    const p = state.profile;
    if (t.goal) { p.paceKg = t.undoPace != null ? t.undoPace : p.paceKg; } else if (!t.hold) p.adjustKcal = t.before;
    state.ui.tune = null; save(); renderAll();
  }
  function tuneToast(t) {
    if (!t) return;
    const msg = t.goal ? 'Goal reached! Your target is now maintenance' : t.hold ? 'Target kept: your food log explains your weight' : 'Target ' + (t.change > 0 ? 'raised' : 'lowered') + ' by ' + fmtKcal(Math.abs(t.change)) + ' kcal' + (t.plateau ? ' after a 2-week plateau' : '');
    toast(msg, t.hold ? function () { adjustSheet(); } : function () { undoTune(t); }, t.hold ? 'Why' : 'Undo');
  }

  // Training days. Your Activity (days a week, type, length) is already averaged into your daily burn, so a
  // training day isn't extra food: it's the same week, shared out differently. On a training day you burn one
  // whole session (plus digestion); on a rest day none. Weekly total = 7 × your normal target.
  function trainSplit() { return inPass('ts', trainSplitNow); }
  function trainSplitNow() {
    const tr = state.settings.train, c = calcEnergy(), t = state.profile.training;
    if (!tr || !tr.days.length || !c || !t.days || !c.train) return null;
    const session = c.train * 7 / tr.days.length / 0.9, avg = c.train / 0.9; // kcal; /0.9 adds digestion like the TDEE does. Shared over the days you picked, so the week always adds up
    return { days: tr.days.slice().sort(), tx: Math.round(session - avg), rx: Math.round(avg) };
  }
  // Remember today's targets whenever they change; a past day uses the targets it had.
  function recordGoal() {
    const pl = makePlan(activeEnergy()); if (!pl) return;
    const t = todayISO(), g = { k: roundKcal(pl.target), p: pl.protein, c: pl.carbs, f: pl.fat }, sp = trainSplit();
    if (sp) { g.td = sp.days; g.tx = sp.tx; g.rx = sp.rx; }
    const last = Object.keys(state.goals).filter(function (k) { return k <= t; }).sort().pop(), was = last && state.goals[last];
    if (was && was.k === g.k && was.p === g.p && was.c === g.c && was.f === g.f && String(was.td || '') === String(g.td || '') && (was.tx || 0) === (g.tx || 0) && (was.rx || 0) === (g.rx || 0)) return;
    state.goals[t] = g; save();
  }
  // Training day? Your weekly pattern (as it was then), unless you switched that day by hand.
  function isTrainDay(date, cfg) {
    const c = cfg || state.settings.train; if (!c || !c.days || !c.days.length) return false;
    const o = state.dayType[date]; if (o) return o === 't';
    return c.days.indexOf(new Date(dayNum(date) * 864e5).getUTCDay()) >= 0;
  }
  function trainOn() { return !!trainSplit(); }
  // Flexible week: the week's calories stay the same, but each day's target moves with what you actually ate
  // earlier in the week (and you can give one day more). Protein and fat stay put; the difference is carbs.
  let flexMemo = { v: -1, m: {} };
  function dayPlan(date) {
    const base = dayPlanBase(date), fx = state.settings.flex;
    if (!base || !date || !fx || !fx.on) return base;
    if (flexMemo.v !== dataVer) flexMemo = { v: dataVer, m: {} };
    if (flexMemo.m[date]) return flexMemo.m[date];
    const D = dayNum(date), ws = weekStart(D), today = dayNum(todayISO()), extra = fx.extra || 0, big = fx.big;
    const bt = [], w = [];
    onePass(function () { for (let i = 0; i < 7; i++) { const pl = dayPlanBase(isoFromDay(ws + i)); bt.push(pl ? pl.target : base.target); } });
    const hasBig = big != null && extra > 0;
    for (let i = 0; i < 7; i++) { const isBig = hasBig && new Date((ws + i) * 864e5).getUTCDay() === big; w.push(bt[i] + (hasBig ? (isBig ? extra : -extra / 6) : 0)); }
    const W = bt.reduce(function (a, x) { return a + x; }, 0);
    let used = 0, restW = 0;
    for (let i = 0; i < 7; i++) {
      const d = ws + i;
      if (d < D) { const k = d < today ? dayTotals(isoFromDay(d)).kcal : 0; used += d < today && k > 0 ? k : w[i]; } // days not logged count as on plan
      else restW += w[i];
    }
    const i0 = D - ws, raw = restW > 0 ? w[i0] * (W - used) / restW : w[i0];
    const floor = state.profile.sex === 'male' ? 1500 : 1200;
    const tgt = Math.round(Math.max(floor, Math.min(bt[i0] * 1.35, Math.max(bt[i0] * 0.75, raw))) / 10) * 10, dk = tgt - base.target;
    const out = Object.assign({}, base, { target: tgt, carbs: Math.max(0, Math.round((base.carbs + dk / 4) / 5) * 5), flex: Math.round(dk) });
    flexMemo.m[date] = out;
    return out;
  }
  function dayPlanBase(date) {
    const pl0 = dayPlanCore(date), md = date && state.dayMode && state.dayMode[date];
    if (!pl0 || !md) return pl0;
    // Refeed / diet break: eat at maintenance that day. Refeeds add the difference as carbs; breaks split it.
    const en = activeEnergy(); if (!en) return pl0;
    const live = livePlan(), maint = en.tdee + (live && live.adjust || 0), dk = Math.round((maint - (live ? live.target : pl0.target)) / 10) * 10;
    if (dk <= 0) return Object.assign({}, pl0, { mode: md });
    return Object.assign({}, pl0, { target: pl0.target + dk, carbs: Math.round((pl0.carbs + (md === 'f' ? dk / 4 : dk / 8)) / 5) * 5, fat: md === 'b' ? Math.round(pl0.fat + dk / 18) : pl0.fat, mode: md });
  }
  function dayPlanCore(date) {
    const live = livePlan();
    let base = live, sp = trainSplit();
    if (date && date < todayISO()) {
      const keys = inPass('gk', function () { return Object.keys(state.goals).sort(); });
      let k = null; for (let i = keys.length - 1; i >= 0; i--) if (keys[i] <= date) { k = keys[i]; break; }
      if (k) { const g = state.goals[k]; base = Object.assign({}, live || {}, { target: g.k, protein: g.p, carbs: g.c, fat: g.f, past: true }); sp = g.td ? { days: g.td, tx: g.tx, rx: g.rx } : null; }
      else sp = null; // from before targets were remembered: no training days back then
    }
    if (!base || !date || !sp) return base;
    // The difference is all carbs (protein and fat stay put).
    const on = isTrainDay(date, sp), dk = on ? sp.tx : -sp.rx;
    const carbs = Math.max(0, Math.round((base.carbs + dk / 4) / 5) * 5);
    return Object.assign({}, base, { target: base.target + dk, carbs: carbs, train: on });
  }
  function makePlan(en) {
    if (!en) return null;
    const adjust = en.source === 'calc' && state.settings.autoAdjust ? state.profile.adjustKcal : 0;
    const plan = planFor({ tdee: en.tdee, bmr: en.calc ? en.calc.bmr : null, kg: en.kg, pace: currentPace(), goal: state.settings.goalKg, p: state.profile, adjust: adjust });
    plan.adjust = adjust;
    plan.learned = en.source === 'auto' && en.calc ? Math.round(en.tdee - en.calc.tdee) : 0;
    return plan;
  }

  /* ================= Appearance ================= */
  const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function applyAppearance() {
    const s = state.settings, r = document.documentElement;
    const dark = s.theme === 'dark' || (s.theme === 'auto' && mq && mq.matches);
    r.setAttribute('data-mode', dark ? 'dark' : 'light');
    r.setAttribute('data-style', s.style);
    if (s.oled) r.setAttribute('data-oled', ''); else r.removeAttribute('data-oled');
    r.classList.toggle('tabs-top', s.tabs === 'top');
    r.style.zoom = { m: '', l: '1.08', xl: '1.16' }[s.textSize] || '';
    applyLang(); // bigger text: the whole layout scales and reflows
    requestAnimationFrame(function () { placePill(false); });
    requestAnimationFrame(function () { $('#themeColor').setAttribute('content', getComputedStyle(document.body).backgroundColor); });
  }
  // Arabic: the interface is translated as it's drawn (phrases from ar.js), laid out right to left, with an Arabic font.
  let arObs = null, AR = null;
  function trWord(t) { return AR && AR.D[t] !== undefined ? AR.D[t] : null; }
  function tr(str) {
    const k = str.replace(/\s+/g, ' ').trim();
    if (!k || !AR || !/[A-Za-z]/.test(k)) return null;
    let v = trWord(k);
    if (v == null) for (let i = 0; i < AR.P.length; i++) { const m = AR.P[i][0].exec(k); if (m) { v = AR.P[i][1].replace(/\$(\d)/g, function (_, n) { const c = m[+n] || ''; return trWord(c) || tr(c) || c; }); break; } }
    if (v == null && k.indexOf(' · ') > 0) { const parts = k.split(' · '), out = parts.map(function (x) { return trWord(x) || tr(x) || x; }); if (out.some(function (x, i) { return x !== parts[i]; })) v = out.join(' · '); }
    if (v == null) return null;
    const lead = str.match(/^\s*/)[0], tail = str.match(/\s*$/)[0];
    return lead + v + tail;
  }
  function trNode(n) {
    if (!AR || !n) return;
    if (n.nodeType === 3) { const p = n.parentNode; if (!p || p.closest && p.closest('[data-notr], script, style, textarea')) return; const v = tr(n.nodeValue); if (v != null && v !== n.nodeValue) n.nodeValue = v; return; }
    if (n.nodeType !== 1 || n.closest('[data-notr]')) return;
    const els = [n].concat(Array.prototype.slice.call(n.querySelectorAll('[placeholder],[aria-label],[title]')));
    els.forEach(function (el) { ['placeholder', 'aria-label', 'title'].forEach(function (a) { const v0 = el.getAttribute && el.getAttribute(a); if (v0) { const v = tr(v0); if (v != null && v !== v0) el.setAttribute(a, v); } }); });
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let t; const list = []; while ((t = w.nextNode())) list.push(t); list.forEach(trNode);
  }
  function applyLang() {
    const ar = state.settings.lang === 'ar', r = document.documentElement;
    r.lang = ar ? 'ar' : 'en'; r.dir = ar ? 'rtl' : 'ltr';
    if (!ar || arObs) return;
    // The Arabic font is part of fonts/fonts.css (hosted with the app, nothing loaded from Google).
    const go = function () {
      AR = window.SETPOINT_AR; if (!AR) { r.classList.remove('ar-wait'); return; }
      trNode(document.body); r.classList.remove('ar-wait');
      arObs = new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === 'characterData') trNode(m.target); else if (m.type === 'attributes') trNode(m.target); else m.addedNodes.forEach(trNode); }); });
      arObs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title'] });
    };
    if (window.SETPOINT_AR) go(); else { const sc = document.createElement('script'); sc.src = 'ar.js?v=' + APP_VERSION; sc.onload = go; sc.onerror = function () { r.classList.remove('ar-wait'); }; document.head.appendChild(sc); }
  }
  // Changing how the app looks (mode, theme, pure black, text size, tab bar) crossfades from the old look to the
  // new one instead of switching in a single frame, where the browser can do that (newer iPhones do).
  function restyle(fn) {
    if (!document.startViewTransition || calmMotion() || document.hidden) { fn(); return; }
    try { document.startViewTransition(fn); } catch (e) { fn(); }
  }
  function onMq() { if (state.settings.theme === 'auto') restyle(applyAppearance); }
  if (mq) (mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq));

  /* ================= Tabs ================= */
  let lastMain = 'diary';
  // The soft highlight behind the selected tab glides to the next one instead of jumping.
  const MAIN_TABS = ['diary', 'progress', 'foods', 'you'];
  const tabPill = document.createElement('span'); tabPill.className = 'tab-pill'; tabPill.setAttribute('aria-hidden', 'true');
  // The theme's own highlight colour (each style has its own), looked up once for each look.
  let pillBg = { k: '', v: '' };
  function pillColour(ico, bar) {
    const r = document.documentElement, k = r.getAttribute('data-style') + '|' + r.getAttribute('data-mode') + '|' + r.hasAttribute('data-oled') + '|' + r.classList.contains('tabs-top');
    if (pillBg.k === k && pillBg.v) return pillBg.v;
    $$('.tab-ico', bar).forEach(function (x) { x.style.transition = 'none'; });
    bar.classList.remove('pill-on'); const v = getComputedStyle(ico).backgroundColor; bar.classList.add('pill-on');
    if (v && v !== 'transparent' && v !== 'rgba(0, 0, 0, 0)') pillBg = { k: k, v: v };
    return v;
  }
  addEventListener('load', function () { pillBg = { k: '', v: '' }; });
  function placePill(animate) {
    const inner = document.querySelector('.tabbar-inner'), ico = document.querySelector('.tab-btn[aria-current="page"] .tab-ico'), bar = document.querySelector('.tabbar');
    // the floating glass bar at the bottom highlights the whole tab (icon and name), like iPhone
    const sel = ico && !document.documentElement.classList.contains('tabs-top') ? ico.parentNode : ico;
    if (!inner || !bar) return;
    if (!tabPill.parentNode) inner.prepend(tabPill);
    if (!sel || !sel.offsetWidth) { tabPill.style.opacity = '0'; return; }
    const bg = pillColour(ico, bar);
    tabPill.style.transition = animate ? '' : 'none';
    tabPill.style.background = bg; tabPill.style.width = sel.offsetWidth + 'px'; tabPill.style.height = sel.offsetHeight + 'px';
    tabPill.style.transform = 'translate(' + sel.offsetLeft + 'px,' + sel.offsetTop + 'px)'; tabPill.style.opacity = '1';
    if (!animate) { void tabPill.offsetWidth; tabPill.style.transition = ''; }
  }
  addEventListener('resize', function () { placePill(false); });
  // Press and slide on the tab bar, like iPhone: the highlight swells into a lens, follows your finger
  // with a tick on each tab, and lifting your finger opens the tab under it.
  (function () {
    const inner = document.querySelector('.tabbar-inner'); if (!inner) return;
    let drag = null, eatClick = 0;
    const tabs = function () { return $$('.tab-btn', inner).filter(function (b) { return b.offsetWidth; }); };
    const nearest = function (x) { let best = null, bd = 1e9; tabs().forEach(function (b) { const r = b.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - x); if (d < bd) { bd = d; best = b; } }); return best; };
    const lens = function (x) {
      const ir = inner.getBoundingClientRect(), ts = tabs(); if (!ts.length) return;
      const w = tabPill.offsetWidth || ts[0].offsetWidth, a = ts[0].getBoundingClientRect(), z = ts[ts.length - 1].getBoundingClientRect();
      const lo = Math.min(a.left, z.left) - ir.left, hi = Math.max(a.right, z.right) - ir.left - w;
      const left = Math.max(lo - 6, Math.min(hi + 6, x - ir.left - w / 2)); // a little give past the ends
      tabPill.style.transform = 'translate(' + left + 'px,' + drag.top + 'px) scale(1.14,1.1)';
    };
    const hover = function (b) { if (drag.on === b) return; if (drag.on) drag.on.classList.remove('tb-hover'); drag.on = b; if (b) b.classList.add('tb-hover'); };
    const end = function (go) {
      if (!drag) return; const d = drag; drag = null;
      document.querySelector('.tabbar').classList.remove('tb-held'); tabPill.classList.remove('lens');
      if (d.on) d.on.classList.remove('tb-hover');
      if (go && d.moved && d.on) { eatClick = Date.now(); if (d.on.dataset.tab !== state.ui.tab) d.on.click(); else placePill(true); }
      else placePill(true);
    };
    inner.addEventListener('pointerdown', function (e) {
      const b = e.target.closest('.tab-btn'); if (!b || e.button > 0 || !tabPill.parentNode) return;
      const ref = document.documentElement.classList.contains('tabs-top') ? b.querySelector('.tab-ico') : b; // what the highlight covers
      drag = { id: e.pointerId, x0: e.clientX, moved: false, on: null, top: ref.offsetTop || 0 };
      document.querySelector('.tabbar').classList.add('tb-held'); tabPill.classList.add('lens'); tabPill.style.opacity = '1';
      if (!b.hasAttribute('aria-current')) { tabPill.style.width = ref.offsetWidth + 'px'; tabPill.style.height = ref.offsetHeight + 'px'; }
      lens(e.clientX); hover(b);
    });
    inner.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.abs(e.clientX - drag.x0) > 6) { drag.moved = true; try { inner.setPointerCapture(e.pointerId); } catch (er) {} }
      if (!drag.moved) return;
      lens(e.clientX); const b = nearest(e.clientX); if (b && b !== drag.on) { hover(b); buzz('light'); }
    });
    inner.addEventListener('pointerup', function (e) { if (drag && e.pointerId === drag.id) end(true); });
    inner.addEventListener('pointercancel', function () { end(false); });
    inner.addEventListener('lostpointercapture', function () { if (drag && drag.moved) end(true); });
    // the click that follows a slide was already handled
    inner.addEventListener('click', function (e) { if (Date.now() - eatClick < 400 && e.isTrusted) { e.stopPropagation(); e.preventDefault(); } }, true);
  })();
  // Big page titles shrink into a small bar at the top once you scroll past them (like iPhone apps).
  const miniBar = document.createElement('div'); miniBar.className = 'mini-bar'; miniBar.setAttribute('aria-hidden', 'true'); miniBar.innerHTML = '<span></span>'; document.body.appendChild(miniBar);
  let miniRaf = 0;
  function miniCheck() {
    miniRaf = 0;
    const panel = document.querySelector('main > .tab-panel:not([hidden])'), h1 = panel && panel.querySelector('.page-head:not([hidden]) h1');
    const on = !!h1 && h1.getBoundingClientRect().bottom < 6;
    if (on) miniBar.firstChild.textContent = h1.textContent;
    miniBar.classList.toggle('on', on);
  }
  window.addEventListener('scroll', function () { if (!miniRaf) miniRaf = requestAnimationFrame(miniCheck); }, { passive: true });
  // Going into Settings or Plan slides the page in like iPhone navigation (going back is goBack's job).
  function showTab(tab, silent, fromBack) {
    const prev = state.ui.tab;
    if (!silent && !fromBack && (tab === 'targets' || tab === 'settings') && tab !== prev) { pageMove('push', function () { showTabNow(tab, silent, fromBack); }); return; }
    showTabNow(tab, silent, fromBack);
  }
  function showTabNow(tab, silent, fromBack) {
    const sub = function (t) { return t === 'targets' || t === 'settings'; }, prev = state.ui.tab;
    if (sub(tab) && !sub(prev)) navPush('page'); else if (!sub(tab) && sub(prev) && !fromBack) navDrop('page');
    // A list open in Foods is a level of its own while you're on the Foods tab.
    if (prev === 'targets' && tab !== 'targets' && tgView) { navDrop('tv'); tgView = null; showTgView(); }
    if (prev === 'foods' && tab !== 'foods' && foodsView) navDrop('fv'); else if (tab === 'foods' && prev !== 'foods' && foodsView) navPush('fv');
    if (tab === 'diary' || tab === 'progress' || tab === 'foods' || tab === 'you') lastMain = tab;
    state.ui.tab = tab; save();
    const tabOf = tab === 'settings' || tab === 'targets' ? 'you' : tab; // pages inside You keep You lit
    $$('.tab-btn').forEach(function (b) { const on = b.dataset.tab === tabOf; if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    if (tab === 'you') renderYouHero();
    // Between the four main tabs, the page slides in from the side you're heading to.
    const from = MAIN_TABS.indexOf(prev), to = MAIN_TABS.indexOf(tab), pnl = $('#panel-' + tab);
    if (pnl && from >= 0 && to >= 0 && from !== to && !silent && !navInstant) {
      const dir = (to > from ? 1 : -1) * (document.documentElement.dir === 'rtl' ? -1 : 1);
      pnl.style.setProperty('--tab-dx', dir * 18 + 'px'); pnl.classList.remove('tab-slide'); void pnl.offsetWidth; pnl.classList.add('tab-slide');
      clearTimeout(pnl._ts); pnl._ts = setTimeout(function () { pnl.classList.remove('tab-slide'); }, 450);
    }
    $$('main > .tab-panel').forEach(function (p) { p.hidden = p.id !== 'panel-' + tab; }); // (not the still copy of the page that's sliding away)
    if (tab === 'progress') showProg(state.ui.prog, true);
    if (tab === 'foods') renderFoods();
    const pn = $('#panel-' + tab); if (pn && !silent && !navInstant) { pn.classList.add('anim-in'); setTimeout(function () { pn.classList.remove('anim-in'); }, 700); }
    if (!silent) { buzz('light'); window.scrollTo(0, 0); }
    // measuring waits for the frame, once everything above has been drawn (one layout instead of several)
    const glide = !silent && !navInstant;
    requestAnimationFrame(function () { placePill(glide); miniCheck(); });
  }
  function showProg(which, silent) {
    const order = ['weight', 'nutrition', 'body'], was = order.indexOf(state.ui.prog), now = order.indexOf(which);
    state.ui.prog = which; save();
    $$('#progSeg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.prog === which); });
    ['weight', 'nutrition', 'body'].forEach(function (k) { $('#prog-' + k).hidden = k !== which; });
    if (which === 'nutrition' && $('#panel-progress').hidden === false) catchUp('nut');
    // The range buttons sit inside the weight chart card; for nutrition they sit above the trends.
    const rs = $('#rangeSeg'); if (which === 'weight') $('#chartRangeSlot').appendChild(rs); else { const tb = $('#trendBox .tr-pick'); if (tb) tb.parentNode.insertBefore(rs, tb.nextSibling); }
    $('#rangeSeg').hidden = which === 'body'; $$('#rangeSeg button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.range === state.ui.range); }); $$('#rangeSeg button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.range === state.ui.range); });
    if (!silent) buzz('light');
    if (which === 'weight') renderChart();
    if (which === 'nutrition') renderLowCard();
    // Weight, Nutrition and Body slide in from the side you tapped, like the tabs
    const sec = $('#prog-' + which);
    if (!silent && sec && sec.animate && was >= 0 && was !== now && !calmMotion()) {
      const dx = (now > was ? 1 : -1) * (document.documentElement.dir === 'rtl' ? -1 : 1) * 22;
      sec.animate([{ opacity: 0, transform: 'translateX(' + dx + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  }
  function goBack(fromBack) { const t = state.ui.tab, to = t === 'targets' || t === 'settings' ? 'you' : lastMain; pageMove('pop', function () { showTabNow(to, false, fromBack === true); }); }

  /* ================= Today ================= */
  function renderToday() {
    const list = entries();

    // This week: average, change vs last week, days logged
    $('#weekCard').innerHTML = weekCardHtml();

    // Goal
    const t = trend(), g = state.settings.goalKg, now = currentKg();
    const gb = $('#goalBox');
    if (!g) gb.innerHTML = list.length ? '<button type="button" class="card tile goal-tile" data-action="goal"><span class="pt-k">Goal</span><span class="pt-v pt-none">Set one</span><span class="pt-s">See when you\'ll get there</span></button>' : '';
    else if (now == null) gb.innerHTML = '';
    else {
      const start = t && t.first ? t.first.kg : list[0].kg;
      const reached = start >= g ? now <= g : now >= g;
      const total = Math.abs(start - g);
      const pct = reached ? 100 : total > 0 ? Math.max(0, Math.min(100, (1 - Math.abs(now - g) / total) * 100)) : 0;
      let eta = '';
      if (!reached && t && Math.abs(toDisp(t.perWeek)) >= 0.02 && ((now - g) > 0) === (t.perDay < 0)) {
        const days = Math.abs((now - g) / t.perDay);
        if (days < 730) { const d = new Date(); d.setDate(d.getDate() + Math.round(days)); eta = fmtFuture(d) + ' at your current trend'; }
      }
      gb.innerHTML = '<button type="button" class="card tile goal-tile" data-action="goal"><span class="pt-k">Goal · ' + fmtW(g) + ' ' + unit() + '</span>' +
        (reached ? '<span class="pt-v num pt-good">Reached</span>' : '<span class="pt-v num">' + fmtW(Math.abs(now - g)) + '<small>' + unit() + ' to go</small></span>') +
        '<span class="bar pt-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span><span class="pt-s">' + Math.round(pct) + '% there' + (eta ? ' · ' + esc(eta.replace(' at your current trend', '')) : '') + '</span></button>';
    }

    renderDiary();
  }

  /* ================= Diary ================= */
  let viewDay = todayISO();
  // Which category you usually log at this time of day (from entry times over the last 60 days), else by the clock.
  let mealTimes = { day: null, med: null };
  function mealByTime() {
    const now = new Date(), mins = now.getHours() * 60 + now.getMinutes(), today = todayISO();
    if (mealTimes.day !== today) {
      const t = {}, from = dayNum(today) - 60;
      Object.keys(state.food).forEach(function (d) { if (dayNum(d) < from) return; state.food[d].forEach(function (it) { if (!it.t || it.plan || isImported(it)) return; const m = /^(\d\d):(\d\d)$/.exec(it.t); (t[it.meal] = t[it.meal] || []).push(+m[1] * 60 + +m[2]); }); });
      const med = {}; Object.keys(t).forEach(function (k) { if (t[k].length >= 3) { const a = t[k].sort(function (x, y) { return x - y; }); med[k] = a[Math.floor(a.length / 2)]; } });
      mealTimes = { day: today, med: med };
    }
    let best = null, gap = 1e9; MEALS.forEach(function (m) { const v = mealTimes.med[m[0]]; if (v != null && Math.abs(v - mins) < gap) { gap = Math.abs(v - mins); best = m[0]; } });
    if (best && gap <= 120) return best;
    const h = now.getHours(), k = h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 21 ? 'dinner' : 'snacks'; return MEALS.some(function (x) { return x[0] === k; }) ? k : MEALS[0][0];
  }
  let sumPage = 0, sumObs = null, swOpen = null;
  // Second card on the diary: a few nutrients you care about, as small rings.
  const NEW_HIGHLIGHTS = ['fib', 'ca', 'fe', 'vD', 'k', 'mg'];
  function highlights() {
    const own = (state.settings.highlights || []).filter(function (k) { return NUT[k] && ['kcal', 'p', 'c', 'f'].indexOf(k) < 0; });
    if (own.length) return { keys: own, why: 'mine' };
    // Once there's enough logging, suggest what you're often low on; before that, nutrients many people miss.
    const low = oftenLow().low.map(function (x) { return x.key; }).filter(function (k) { return ['kcal', 'p', 'c', 'f'].indexOf(k) < 0; });
    if (low.length >= 3) return { keys: low.concat(NEW_HIGHLIGHTS.filter(function (k) { return low.indexOf(k) < 0; })).slice(0, 6), why: 'low' };
    return { keys: NEW_HIGHLIGHTS, why: 'new' };
  }
  function shortNut(k) { return NUT[k].label.replace('Vitamin ', 'Vit ').replace(/ \(.*\)/, '').replace('Monounsaturated', 'Mono fat').replace('Polyunsaturated', 'Poly fat').replace('Saturated fat', 'Sat. fat'); }
  function highlightCard() {
    const loading = dayNeedsDB(viewDay);
    // Suggestions look at the last two weeks, so fetch the food list for those too.
    let past = false; if (!foodDB && !state.settings.highlights) { const t = dayNum(todayISO()); for (let d = t - 14; d < t && !past; d++) past = dayNeedsDB(isoFromDay(d)); }
    if (loading || past) loadFoods().then(function () { if (state.ui.tab === 'diary') renderDiary(); }, function () {});
    const hl = highlights(), nd = loading ? null : dayNutrients(viewDay), tg = nutTargets(viewDay), mm = nd ? microsMet(nd, tg) : null, r = 18, C = 2 * Math.PI * r;
    const items = hl.keys.map(function (k) {
      const t = tg[k], lim = t && t.max != null && t.min == null, goal = t ? (lim ? t.max : t.min) : null, v = nd ? nd.tot[k] || 0 : 0, pct = goal ? v / goal * 100 : 0;
      const cls = !goal ? 'none' : (lim && v > goal) || (t.ul && v > t.ul) ? 'over' : lim ? 'ok' : pct >= 100 ? 'met' : pct >= 50 ? 'part' : 'low';
      return '<div class="hl-item ' + cls + '" data-src="' + k + '" role="button" tabindex="0" aria-label="' + shortNut(k) + ': where it came from"><div class="hl-ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="' + r + '" class="hl-bg"/><circle cx="22" cy="22" r="' + r + '" class="hl-fg" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - Math.min(100, pct) / 100)).toFixed(1) + '"/></svg>' +
        '<b class="num">' + (goal ? Math.round(pct) + '%' : fmtNut(v, NUT[k].unit)) + '</b></div><span>' + shortNut(k) + '</span></div>';
    }).join('');
    const why = hl.why === 'mine' ? 'Your picks' : hl.why === 'low' ? 'Suggested: often low for you' : 'Suggested to start with';
    return '<div class="card hl-card" data-action="nutrients" role="button" tabindex="0" aria-label="Highlighted nutrients">' +
      '<div class="hl-head"><div class="grow"><div class="hl-title">Highlighted nutrients</div><div class="label faint">' + why + '</div></div><button type="button" class="text-btn hl-edit" data-hl-edit>Edit</button></div>' +
      '<div class="hl-grid' + (hl.keys.length > 6 ? ' four' : '') + '">' + items + '</div>' +
      (mm ? '<div class="sum-micro"><span>Vitamins &amp; minerals</span><b class="num">' + mm.met + ' <small>/ ' + mm.of + ' met</small></b><span class="bar"><i style="width:' + (mm.met / mm.of * 100).toFixed(1) + '%"></i></span></div>' : '') +
      '</div>';
  }
  // Pick up to 8 nutrients for the diary card, or go back to suggestions.
  function highlightsSheet() {
    const draw = function (root) {
      const hl = highlights(), sel = hl.keys.slice(), sugg = (function () { const o = state.settings.highlights; state.settings.highlights = null; const h = highlights(); state.settings.highlights = o; return h; })();
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">Pick up to 8</div><h2 class="sheet-title" id="sheetTitle">Highlighted nutrients</h2></div></div>' +
        '<div class="stat-box hl-sugg"><div class="row-t">' + (sugg.why === 'low' ? 'Suggested: what you\'re often low on' : 'Suggested to start with') + '</div><div class="row-s">' + sugg.keys.map(shortNut).join(' · ') + '</div>' +
        (hl.why === 'mine' ? '<button type="button" class="btn soft block" id="hlSugg" style="margin-top:10px">Use suggested</button>' : '<div class="row-s" style="margin-top:6px">In use. Pick your own below.</div>') + '</div>' +
        NUT_GROUPS.filter(function (g) { return g[0] !== 'gen'; }).concat([['gen', 'General']]).map(function (g) {
          const rows = NUTS.filter(function (n) { return n[3] === g[0] && ['kcal', 'p', 'c', 'f'].indexOf(n[0]) < 0; });
          return '<div class="label faint fd-sec">' + g[1] + '</div><div class="list">' + rows.map(function (n) {
            const on = sel.indexOf(n[0]) >= 0;
            return '<button type="button" class="row fd-row hl-pick" data-hl="' + n[0] + '" aria-pressed="' + on + '"><div class="grow row-t">' + n[1] + '</div><span class="hl-check">' + (on ? '✓' : '') + '</span></button>';
          }).join('') + '</div>';
        }).join('') +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="hlDone">Done</button></div>';
      $$('[data-hl]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          const k = b.dataset.hl, cur = highlights().keys.slice(), i = cur.indexOf(k);
          if (i >= 0) cur.splice(i, 1); else { if (cur.length >= 8) { toast('Up to 8 nutrients'); buzz('warn'); return; } cur.push(k); }
          state.settings.highlights = cur.length ? cur : null; save(); renderDiary(); buzz('light');
          const top = root.parentNode ? sheet.scrollTop : 0; draw(root); sheet.scrollTop = top;
        });
      });
      if ($('#hlSugg', root)) $('#hlSugg', root).addEventListener('click', function () { state.settings.highlights = null; save(); renderDiary(); buzz('light'); draw(root); });
      $('#hlDone', root).addEventListener('click', function () { closeSheet(); });
    };
    openSheet('<div id="afRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#afRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
  function isDailyTotal(f) { return /^w-/.test(f.id) || (!f.ref && f.name === 'Daily total'); }
  // Days in a row with food logged. One missed day per week is forgiven (two in a row, or a second in the same week, ends it).
  // Today doesn't count against you until it's over.
  function foodStreak() {
    const ds = Object.keys(state.food).filter(function (k) { return state.food[k].some(function (it) { return !it.plan; }); }).sort();
    if (!ds.length) return 0;
    const has = {}; ds.forEach(function (k) { has[dayNum(k)] = 1; });
    const today = dayNum(todayISO()), first = dayNum(ds[0]), used = {};
    let d = has[today] ? today : today - 1, n = 0, prevMiss = false;
    while (d >= first) {
      if (has[d]) { n++; prevMiss = false; }
      else { const w = weekStart(d); if (prevMiss || used[w] || !n) break; used[w] = 1; prevMiss = true; }
      d--;
    }
    return n;
  }
  // The calories-left number counts to its new value and the ring follows, when something changes on the same day.
  let sumPrev = null;
  const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TG_HEAD = '', TG_BTN = '<button type="button" class="sum-tg" data-action="go-targets"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/><path d="M9 3h6v3H9zM8.5 11l1.5 1.5 3-3M14.5 11.5H16M8.5 16.5l1.5 1.5 3-3M14.5 17H16"/></svg>Plan<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>';
  // Bars fill and numbers count from where they were when they change on screen (not the first time you see them).
  // Bars carry data-aw; numbers carry data-an (the value) and data-af (k: kcal, g: grams, p: percent).
  const animMem = {};
  function animate(root, key) {
    if (!root) return;
    const bars = $$('[data-aw]', root), nums = $$('[data-an]', root), mem = animMem[key];
    const now = { w: bars.map(function (b) { return b.style.width; }), c: bars.map(function (b) { return getComputedStyle(b).backgroundColor; }), n: nums.map(function (e) { return +e.dataset.an; }) };
    animMem[key] = now;
    if (!mem || calm || mem.w.length !== now.w.length || mem.n.length !== now.n.length) return;
    // bars grow or shrink to their new length, and a colour change (going over a target, or back under) blends along
    bars.forEach(function (b, i) { const from = mem.w[i], fc = mem.c && mem.c[i], recol = fc && fc !== now.c[i]; if (!from || (from === now.w[i] && !recol)) return;
      b.style.transition = 'none'; b.style.width = from; if (recol) b.style.backgroundColor = fc; b.getBoundingClientRect();
      b.style.transition = 'width .6s cubic-bezier(.2,.8,.2,1), background-color .45s ease'; b.style.width = now.w[i]; if (recol) b.style.backgroundColor = ''; });
    nums.forEach(function (e, i) {
      const from = mem.n[i], to = now.n[i]; if (from === to || isNaN(from) || isNaN(to)) return;
      const f = e.dataset.af, fmt = function (v) { v = Math.round(v); return f === 'p' ? v + '%' : f === 'g' ? String(v) : fmtKcal(v); }, t0 = performance.now();
      (function step(t) { const k = Math.min(1, (t - t0) / 550); e.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(t0);
    });
  }
  function animSum(sc) {
    const cnt = $('.sum-card .cnt', sc), ring = $('.sum-card .ring-fg', sc), bar = $('.sum-kbar i', sc);
    if (!cnt && !ring && !bar) { sumPrev = null; return; }
    const v = cnt ? +cnt.dataset.v : 0, off = ring ? +ring.getAttribute('stroke-dashoffset') : 0, w = bar ? bar.style.width : '';
    const pv = sumPrev && sumPrev.day === viewDay ? sumPrev : null;
    sumPrev = { day: viewDay, v: v, off: off, w: w };
    if (!pv || (pv.v === v && pv.off === off && pv.w === w) || calm) return;
    if (ring) { ring.style.transition = 'none'; ring.setAttribute('stroke-dashoffset', pv.off); ring.getBoundingClientRect(); ring.style.transition = 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)'; ring.setAttribute('stroke-dashoffset', off); }
    if (bar) { bar.style.transition = 'none'; bar.style.width = pv.w; bar.getBoundingClientRect(); bar.style.transition = 'width .6s cubic-bezier(.2,.8,.2,1)'; bar.style.width = w; }
    const t0 = performance.now(), from = pv.v;
    if (cnt) (function step(t) { const k = Math.min(1, (t - t0) / 550), e = 1 - Math.pow(1 - k, 3); cnt.textContent = fmtKcal(Math.round(from + (v - from) * e)); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  // A row of cards you swipe through one at a time, like iPhone: it follows your finger (with a rubber band past the
  // first and last card), then settles on a card with a spring that starts at your finger's speed: the next one
  // after a flick or a drag past halfway. You can catch it again while it's still moving.
  // fitHeight: the strip's height blends between the cards' heights as you swipe. Returns a ResizeObserver (or null) to disconnect later.
  function pager(track, start, onChange, fitHeight) {
    const inner = track.firstElementChild, cards = inner.children, n = cards.length, rtl = document.documentElement.dir === 'rtl';
    let page = Math.max(0, Math.min(n - 1, start || 0)), x0 = 0, y0 = 0, dx = 0, base = 0, axis = '', id = null, moved = false, grabbed = false, run = null, hrun = null;
    const fs = fingerSpeed();
    const step = function () { return cards[0].offsetWidth + 12; };
    const pos = function (p) { return (rtl ? 1 : -1) * p * step(); };
    const heightAt = function (p) { p = Math.max(0, Math.min(n - 1, p)); const a = Math.floor(p), b = Math.min(n - 1, a + 1), f = p - a; return cards[a].offsetHeight + (cards[b].offsetHeight - cards[a].offsetHeight) * f; };
    const setH = function (p) { if (fitHeight && cards[0].offsetHeight) { track.style.transition = 'none'; track.style.height = Math.round(heightAt(p) + 26) + 'px'; } };
    const set = function (p) { inner.style.transition = 'none'; inner.style.transform = 'translate3d(' + (pos(page) + dx).toFixed(1) + 'px,0,0)'; setH(p); };
    const stopRun = function () { if (run) { run.stop(); run = null; } if (hrun) { hrun.stop(); hrun = null; } };
    // settle on card p: a spring from wherever the strip is now, starting at v (finger speed, px/ms, + = rightwards)
    const springTo = function (p, v) {
      stopRun();
      const from = nowAt(inner).x, to = pos(p);
      if (calmMotion() || !inner.animate) { inner.style.transform = 'translate3d(' + to + 'px,0,0)'; setH(p); return; }
      const r = run = springGroup([[inner, { transform: 'translate3d(' + from + 'px,0,0)' }, { transform: 'translate3d(' + to + 'px,0,0)' }]], { response: 0.44, damping: 0.86, v: to === from ? 0 : v * Math.sign(to - from), dist: Math.abs(to - from) });
      r.onEnd = function () { if (run === r) run = null; };
      if (fitHeight && cards[0].offsetHeight) {
        const h0 = track.getBoundingClientRect().height, h1 = Math.round(heightAt(p) + 26);
        track.style.transition = 'none';
        if (Math.abs(h1 - h0) > 1) { const hr = hrun = springGroup([[track, { height: h0 + 'px' }, { height: h1 + 'px' }]], { response: 0.44, damping: 1, v: 0, dist: 1, noOver: true }); hr.onEnd = function () { if (hrun === hr) hrun = null; }; }
        else track.style.height = h1 + 'px';
      }
    };
    const go = function (p, v) { const was = page; page = Math.max(0, Math.min(n - 1, p)); dx = 0; springTo(page, v || 0); if (page !== was) { buzz('light'); onChange(page); } };
    // A strip that fits its height is placed straight away (what's below it must be where it'll stay, for the
    // diary's glide). Otherwise the first placement waits for the size watcher below, which reports once the
    // strip is laid out (before it's drawn): measuring here would lay out the whole page an extra time.
    if (!window.ResizeObserver || fitHeight) set(page); else { inner.style.transition = 'none'; inner.style.transform = 'translate3d(0,0,0)'; }
    track.addEventListener('pointerdown', function (e) {
      if (n < 2) return;
      x0 = e.clientX; y0 = e.clientY; axis = ''; id = e.pointerId; moved = false; fs.reset(); fs.add(e.clientX, e.timeStamp);
      // still moving from the last swipe: take hold of it right where it is
      grabbed = !!run; if (grabbed) { stopRun(); dx = nowAt(inner).x - pos(page); } else dx = 0;
      base = dx;
    });
    track.addEventListener('pointermove', function (e) {
      if (id !== e.pointerId) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!axis) {
        if ((Math.abs(mx) > 8 || (grabbed && Math.abs(mx) > 2)) && Math.abs(mx) > Math.abs(my)) { axis = 'x'; moved = true; x0 = e.clientX; try { track.setPointerCapture(id); } catch (x) {} }
        else if (Math.abs(my) > 8) { axis = 'y'; if (grabbed) go(page, 0); return; }
        else return;
      }
      if (axis !== 'x') return;
      fs.add(e.clientX, e.timeStamp);
      // past the first or last card it gives less and less (iPhone's rubber band)
      const raw = pos(page) + base + (e.clientX - x0), a = Math.min(pos(0), pos(n - 1)), b = Math.max(pos(0), pos(n - 1)), give = step() * 0.4;
      const at = raw > b ? b + rubber(raw - b, give) : raw < a ? a - rubber(a - raw, give) : raw;
      dx = at - pos(page);
      set(page + (rtl ? dx : -dx) / step());
    });
    const end = function (e) {
      if (id !== e.pointerId) return; id = null;
      if (axis !== 'x') { if (grabbed && axis !== 'y') go(page, 0); return; } // caught, then let go without moving: settle from there
      if (e.clientX != null) fs.add(e.clientX, e.timeStamp); // where the finger lifted counts too
      const v = fs.get(e.timeStamp), fwd = rtl ? dx : -dx, proj = fwd + (rtl ? v : -v) * 180; // towards the next card, px
      go(page + (proj > step() * 0.5 ? 1 : proj < -step() * 0.5 ? -1 : 0), v);
    };
    track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
    // A swipe isn't a tap: don't open the card underneath.
    track.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { go(page + ((e.key === 'ArrowRight') !== rtl ? 1 : -1), 0); e.preventDefault(); } });
    if (window.ResizeObserver) { const ro = new ResizeObserver(function () { if (id == null && !run && !hrun) set(page); }); Array.prototype.forEach.call(cards, function (c) { ro.observe(c); }); return ro; }
    return null;
  }
  // Cards that come and go (Ramadan, getting started, backup, last week, nutrient gaps) share one swipeable spot.
  let fyPage = 0, fyObs = null;
  // What you usually have for a meal: foods logged in it on at least 3 of the last 28 days (and on 40% of the days you logged it).
  let usualCache = { sig: '', v: {} };
  function usualFor(meal) {
    const today = dayNum(todayISO()), sig = today + ':' + Object.keys(state.food).length + ':' + JSON.stringify(state.food[isoFromDay(today - 1)] || []).length;
    if (usualCache.sig !== sig) usualCache = { sig: sig, v: {} };
    if (usualCache.v[meal] !== undefined) return usualCache.v[meal];
    const cnt = {}, last = {}; let days = 0;
    for (let k = 28; k >= 1; k--) {
      const its = eatenFor(isoFromDay(today - k)).filter(function (it) { return mealOf(it) === meal && it.ref && !isDailyTotal(it); });
      if (!its.length) continue; days++;
      const seen = {};
      its.forEach(function (it) { if (seen[it.ref]) return; seen[it.ref] = 1; cnt[it.ref] = (cnt[it.ref] || 0) + 1; last[it.ref] = it; });
    }
    const pick = Object.keys(cnt).filter(function (r) { return cnt[r] >= 3 && cnt[r] >= days * 0.4; }).sort(function (a, b) { return cnt[b] - cnt[a]; }).slice(0, 4).map(function (r) { return last[r]; });
    return (usualCache.v[meal] = pick.length ? pick : null);
  }
  function usualRow(meal) {
    const u = usualFor(meal); if (!u) return '';
    const kc = u.reduce(function (a, it) { return a + it.kcal; }, 0);
    return '<button type="button" class="usual" data-usual="' + meal + '"><span class="grow"><span class="usual-l">Your usual</span><span class="usual-n">' + esc(u.map(function (it) { return shortName(it.name); }).join(' · ')) + '</span></span><span class="usual-k num">' + fmtKcal(kc) + ' kcal</span><span class="usual-add">Add</span></button>';
  }
  // An empty meal offers what you had in it the day before, in one tap.
  function sameItems(meal) {
    if (viewDay > todayISO()) return [];
    return eatenFor(isoFromDay(dayNum(viewDay) - 1)).filter(function (it) { return mealOf(it) === meal && !isDailyTotal(it); });
  }
  function sameRow(meal) {
    const its = sameItems(meal); if (!its.length) return '';
    const sx = state.ui.sameX; if (sx && sx.d === viewDay && sx.m.indexOf(meal) >= 0) return ''; // dismissed for this day
    const kc = its.reduce(function (a, it) { return a + it.kcal; }, 0);
    return '<div class="usual same-y"><button type="button" class="same-go" data-same="' + meal + '"><span class="grow"><span class="usual-l">' + (viewDay === todayISO() ? 'Same as yesterday' : 'Same as the day before') + '</span><span class="usual-n">' + esc(its.map(function (it) { return shortName(it.name || 'Quick add'); }).join(' · ')) + '</span></span><span class="usual-k num">' + fmtKcal(kc) + ' kcal</span><span class="usual-add">Add</span></button>' +
      '<button type="button" class="same-x" data-same-x="' + meal + '" aria-label="Hide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button></div>';
  }
  // ----- Repeat items -----
  // Foods you choose to have added to your diary every day (or on the days you pick). Each day's copy has a fixed id,
  // so two phones never add it twice, and deleting it on a day you skip it keeps it gone (the deletion is remembered).
  const REP_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l3 3-3 3"/><path d="M4 11V9a3 3 0 0 1 3-3h13"/><path d="M7 21l-3-3 3-3"/><path d="M20 13v2a3 3 0 0 1-3 3H4"/></svg>';
  // Short day name in the app's language ("Fri" / "جمعة").
  function dayAbbr(d) { const x = WEEKDAYS[d].slice(0, 3); return state.settings.lang === 'ar' && typeof tr === 'function' ? tr(x) || x : x; }
  function repDays(r) {
    if (!r.days.length || r.days.length === 7) return 'Every day';
    const o = weekOrder().filter(function (d) { return r.days.indexOf(d) >= 0; });
    return o.map(function (d) { return dayAbbr(d); }).join(' · ');
  }
  function repOn(r, iso) { return !r.days.length || r.days.indexOf(new Date(dayNum(iso) * 864e5).getUTCDay()) >= 0; }
  function repItemId(r, iso) { return 'rp' + r.id + iso.replace(/-/g, ''); }
  // Add today's repeat items that aren't there yet. Returns how many were added.
  function applyRepeats() {
    if (!state.repeats || !state.repeats.length) return 0;
    const t = todayISO(), list = state.food[t] || [], add = [];
    state.repeats.forEach(function (r) { if (r.paused && r.until && r.until <= t) { r.paused = false; r.until = null; r.u = Date.now(); } });
    state.repeats.forEach(function (r) {
      if (r.paused || !repOn(r, t)) return;
      const id = repItemId(r, t);
      if (list.some(function (x) { return x.id === id; }) || (state.del && state.del[id])) return;
      if (MEALS.every(function (m) { return m[0] !== r.meal; })) return;
      if (r.time && nowHM() < r.time) return; // added when its time comes
      add.push(Object.assign({}, r.item, { id: id, meal: r.meal, rep: r.id }, r.time ? { t: r.time } : {}));
    });
    if (!add.length) return 0;
    state.food[t] = list.concat(add); save();
    return add.length;
  }
  // How a repeat item stands today: added, skipped, starts tomorrow, not today, or paused.
  function repStatus(r) {
    const t = todayISO(), id = repItemId(r, t);
    if (r.paused) return { k: 'paused', t: r.until ? 'Paused until ' + fmtDate(r.until, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Paused' };
    if (!repOn(r, t)) return { k: 'off', t: 'Not today' };
    if ((state.food[t] || []).some(function (x) { return x.id === id; })) return { k: 'on', t: 'Added today' };
    if (state.del && state.del[id]) return r.u && isoFromDay(Math.floor((r.u - new Date().getTimezoneOffset() * 6e4) / 864e5)) === t && state.del[id] - r.u < 5000 ? { k: 'next', t: 'Starts tomorrow' } : { k: 'skip', t: 'Skipped today' };
    if (r.time && nowHM() < r.time) return { k: 'next', t: 'Adds at ' + fmtHM(r.time) };
    return { k: 'next', t: 'Adds next time you open the app' };
  }
  // Suggestions: foods you've had in the same meal on most days lately (what used to be "your usual").
  function repeatSuggestions() {
    const out = [];
    MEALS.forEach(function (m) {
      (usualFor(m[0]) || []).forEach(function (it) {
        if (state.repeats.some(function (r) { return r.item.ref === it.ref && r.meal === m[0]; })) return;
        let n = 0; for (let k = 1; k <= 14; k++) if (eatenFor(isoFromDay(dayNum(todayISO()) - k)).some(function (x) { return x.ref === it.ref && mealOf(x) === m[0]; })) n++;
        out.push({ meal: m[0], item: it, n: n });
      });
    });
    return out.sort(function (a, b) { return b.n - a.n; }).slice(0, 8);
  }
  function repItemCopy(it) { const c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan; delete c.pic; delete c.note; delete c.u; delete c.rep; delete c.rc; return c; }
  // A starting time for "Add at a set time": when you last had it, or a usual time for that meal.
  function repDefTime(r) {
    if (r.item && /^\d\d:\d\d$/.test(r.item.t || '')) return r.item.t;
    const i = MEALS.findIndex(function (m) { return m[0] === r.meal; }), n = MEALS.length;
    return ['08:00', '13:00', '16:00', '19:00', '21:00', '22:00'][n <= 4 ? [0, 1, 3, 2][i] || 0 : Math.min(i, 5)] || '08:00';
  }
  function repNote(time) {
    return (time ? 'It\'s added to your diary at ' + fmtHM(time) + ' on those days.' : 'From tomorrow, it\'s added to your diary on those days.') + ' On a day you skip it, just delete it from the diary.';
  }
  // Create or edit one: amount, which meal, and which days.
  function repeatSheet(r0) {
    const isNew = !r0.id, r = { id: r0.id || null, item: Object.assign({}, r0.item), meal: MEALS.some(function (m) { return m[0] === r0.meal; }) ? r0.meal : MEALS[0][0], days: (r0.days || []).slice(), paused: !!r0.paused, time: r0.time || null };
    const base = Object.assign({}, r.item), hasQty = base.ref && base.qty > 0, food = base.ref ? getFood(base.ref) : null, units = food ? unitsFor(food) : null;
    openSheet('<div id="rpRoot"></div>', function (body) {
      sheet.classList.add('tall');
      const root = $('#rpRoot', body);
      const draw = function () {
        const it = r.item;
        root.innerHTML = '<div class="sheet-head qs-head"><span class="rp-ic">' + REP_IC + '</span><div class="grow" style="min-width:0"><div class="label faint">' + (isNew ? 'New repeat item' : 'Repeat item') + '</div><h2 class="sheet-title" id="sheetTitle">' + esc(it.name || 'Quick add') + '</h2></div></div>' +
          (hasQty ? '<div class="field"><span>Amount</span>' + (units ? '<div class="sv-amt rp-amt"><input class="input" id="rpQ" inputmode="decimal" maxlength="6" value="' + fmtQty(it.qty) + '" autocomplete="off" aria-label="Amount" /><select class="input" id="rpU" aria-label="Unit">' + units.map(function (u, i) { return '<option value="' + i + '"' + (u.label === it.unit ? ' selected' : '') + '>' + esc(u.label) + '</option>'; }).join('') + '</select></div>'
            : '<div class="sfx"><input class="input" id="rpQ" inputmode="decimal" maxlength="6" value="' + fmtQty(it.qty) + '" autocomplete="off" aria-label="Amount" /><em>' + esc(it.unit === 'g' ? 'g' : it.unit) + '</em></div>') + '</div>' : '') +
          '<p class="rp-mac" id="rpMac">' + fmtKcal(it.kcal) + ' kcal · P ' + it.protein + ' · C ' + it.carbs + ' · F ' + it.fat + '</p>' +
          '<div class="label faint fd-sec">Meal</div><div class="mt-chips rp-chips">' + MEALS.map(function (m) { return '<button type="button" data-rm="' + m[0] + '" aria-pressed="' + (m[0] === r.meal) + '">' + esc(m[1]) + '</button>'; }).join('') + '</div>' +
          '<div class="label faint fd-sec">Days</div><div class="rp-days"><button type="button" data-rd="all" aria-pressed="' + (!r.days.length || r.days.length === 7) + '">Every day</button>' + weekOrder().map(function (d) { return '<button type="button" data-rd="' + d + '" aria-pressed="' + (r.days.length > 0 && r.days.length < 7 && r.days.indexOf(d) >= 0) + '">' + WEEKDAYS[d].slice(0, 2) + '</button>'; }).join('') + '</div>' +
          (isNew ? '' : '<div class="list rp-pause"><label class="row"><div class="grow"><div class="row-t">Pause</div><div class="row-s">Stop adding it for now</div></div><span class="switch"><input type="checkbox" id="rpPause"' + (r.paused ? ' checked' : '') + ' /><i></i></span></label>' +
            '<label class="row rp-until"' + (r.paused ? '' : ' hidden') + '><div class="grow"><div class="row-t">Resume on</div><div class="row-s">Leave empty to resume yourself</div></div><input class="input rp-date" type="date" id="rpUntil" min="' + isoFromDay(dayNum(todayISO()) + 1) + '" value="' + (r0.until || '') + '" /></label></div>') +
          '<div class="list rp-pause rp-time"><label class="row"><div class="grow"><div class="row-t">Add at a set time</div><div class="row-s">Added to your diary at this time</div></div><span class="switch"><input type="checkbox" id="rpTimeOn"' + (r.time ? ' checked' : '') + ' /><i></i></span></label>' +
            '<label class="row rp-until rp-tm"' + (r.time ? '' : ' hidden') + '><div class="grow"><div class="row-t">Time</div></div><input class="input rp-date" type="time" id="rpTime" value="' + (r.time || repDefTime(r)) + '" aria-label="Time" /></label></div>' +
          '<p class="muted-note rp-note" id="rpNote">' + repNote(r.time) + '</p>' +
          '<div class="btn-row">' + (isNew ? '' : '<button type="button" class="btn danger icon-only" id="rpDel" aria-label="Stop repeating">' + TRASH + '</button>') + '<button type="button" class="btn primary" id="rpSave">' + (isNew ? 'Start repeating' : 'Save') + '</button></div>';
        if ($('#rpPause', root)) $('#rpPause', root).addEventListener('change', function () { $('.rp-until:not(.rp-tm)', root).hidden = !this.checked; });
        const timeVal = function () { return $('#rpTimeOn', root).checked && /^\d\d:\d\d$/.test($('#rpTime', root).value) ? $('#rpTime', root).value : null; };
        $('#rpTimeOn', root).addEventListener('change', function () { $('.rp-tm', root).hidden = !this.checked; r.time = timeVal(); $('#rpNote', root).textContent = repNote(r.time); buzz('light'); });
        $('#rpTime', root).addEventListener('input', function () { r.time = timeVal(); $('#rpNote', root).textContent = repNote(r.time); });
        const recalc = function () {
          const n = parseNum($('#rpQ', root).value); if (isNaN(n) || n <= 0 || n > 10000) return;
          if (units) { const u = units[+$('#rpU', root).value], g = n * u.g, mm = macrosFor(food, g); Object.assign(r.item, { qty: Math.round(n * 1000) / 1000, unit: u.label, g: Math.round(g * 10) / 10, kcal: Math.min(mm.kcal, 10000), protein: mm.protein, carbs: mm.carbs, fat: mm.fat }); }
          else { const k = n / base.qty; Object.assign(r.item, { qty: Math.round(n * 1000) / 1000, g: Math.round(base.g * k * 10) / 10, kcal: Math.round(base.kcal * k), protein: Math.round(base.protein * k), carbs: Math.round(base.carbs * k), fat: Math.round(base.fat * k) }); }
          $('#rpMac', root).textContent = fmtKcal(r.item.kcal) + ' kcal · P ' + r.item.protein + ' · C ' + r.item.carbs + ' · F ' + r.item.fat;
        };
        if (hasQty) { $('#rpQ', root).addEventListener('input', recalc); if ($('#rpU', root)) $('#rpU', root).addEventListener('change', function () { const u = units[+this.value]; $('#rpQ', root).value = u.label === 'g' ? '100' : '1'; recalc(); }); }
        // Taps only update the buttons (no redraw), so the sheet never jumps while you choose.
        const paintDays = function () { const all = !r.days.length || r.days.length === 7; $$('[data-rd]', root).forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.rd === 'all' ? all : !all && r.days.indexOf(+x.dataset.rd) >= 0); }); };
        $$('[data-rm]', root).forEach(function (b) { b.addEventListener('click', function () { r.meal = b.dataset.rm; buzz('light'); $$('[data-rm]', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }); });
        $$('[data-rd]', root).forEach(function (b) { b.addEventListener('click', function () {
          const v = b.dataset.rd;
          if (v === 'all') r.days = [];
          else { const d = +v; const i = r.days.indexOf(d); if (i >= 0) r.days.splice(i, 1); else r.days.push(d); if (r.days.length === 7) r.days = []; }
          buzz('light'); paintDays();
        }); });
        $('#rpSave', root).addEventListener('click', function () {
          const snap = snapshot(), rec = { id: r.id || 'p' + Math.random().toString(36).slice(2, 10), item: repItemCopy(r.item), meal: r.meal, days: r.days.slice().sort(), u: Date.now(), paused: !!($('#rpPause', root) && $('#rpPause', root).checked), time: timeVal() };
          if (rec.paused && $('#rpUntil', root) && ISO_RE.test($('#rpUntil', root).value) && $('#rpUntil', root).value > todayISO()) rec.until = $('#rpUntil', root).value;
          const i = state.repeats.findIndex(function (x) { return x.id === rec.id; });
          if (i >= 0) state.repeats[i] = rec; else state.repeats.push(rec);
          if (state.del) delete state.del['rp:' + rec.id];
          // Starts from tomorrow: today's copy is marked as skipped (unless it's already in the diary),
          // except with a time still to come today, when it's added at that time.
          const tid = repItemId(rec, todayISO()), later = rec.time && rec.time > nowHM() && !rec.paused && repOn(rec, todayISO());
          if (!later && !(state.food[todayISO()] || []).some(function (x) { return x.id === tid; })) state.del[tid] = Date.now();
          save(); renderAll(); closeSheet(); buzz('success');
          toast((isNew ? 'Repeating ' + shortName(rec.item.name) + (later ? ', today at ' + fmtHM(rec.time) : ' from tomorrow') : 'Repeat saved'), function () { restore(snap); });
        });
        if ($('#rpDel', root)) $('#rpDel', root).addEventListener('click', function () {
          const snap = snapshot();
          state.repeats = state.repeats.filter(function (x) { return x.id !== r.id; });
          state.del['rp:' + r.id] = Date.now();
          save(); renderAll(); closeSheet(); buzz('medium');
          toast('Stopped repeating ' + shortName(r.item.name), function () { restore(snap); });
        });
      };
      draw();
    }, function () { sheet.classList.remove('tall'); });
  }
  // Pause every repeat item, e.g. while travelling: for a few days, a week, or until you resume.
  function pauseAllSheet() {
    const t = dayNum(todayISO()), opts = [[3, '3 days'], [7, '1 week'], [14, '2 weeks'], [0, 'Until I resume']];
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Pause all repeat items</h2></div><p class="sheet-text">Nothing is added while they\'re paused. Good for travel or a change of routine.</p>' +
      '<div class="list">' + opts.map(function (o) { return '<button type="button" class="row" data-pa="' + o[0] + '"><div class="grow"><div class="row-t">' + o[1] + '</div>' + (o[0] ? '<div class="row-s">Back on ' + esc(fmtDate(isoFromDay(t + o[0]), { weekday: 'short', month: 'short', day: 'numeric' })) + '</div>' : '') + '</div>' + CHEV + '</button>'; }).join('') + '</div>',
      function (root) {
        $$('[data-pa]', root).forEach(function (b) { b.addEventListener('click', function () {
          const n = +b.dataset.pa, snap = snapshot(), until = n ? isoFromDay(t + n) : null;
          state.repeats.forEach(function (r) { r.paused = true; r.until = until; r.u = Date.now(); });
          save(); renderAll(); closeSheet(); buzz('success'); toast('Repeat items paused' + (until ? ' until ' + fmtDate(until, { month: 'short', day: 'numeric' }) : ''), function () { restore(snap); });
        }); });
      });
  }
  // The Repeat items list (Foods tab): yours, then suggestions from what you eat most days.
  function repeatListHtml(fq) {
    const mealN = function (k) { const m = MEALS.find(function (x) { return x[0] === k; }); return m ? m[1] : k; };
    const mine = state.repeats.filter(function (r) { return !fq || normText(r.item.name || '').indexOf(fq) >= 0; });
    let h = '';
    if (mine.length && !fq) {
      // Today at a glance: what your repeat items add.
      const st = state.repeats.map(function (r) { return { r: r, s: repStatus(r).k }; }), on = st.filter(function (x) { return x.s === 'on'; }).map(function (x) { return x.r; });
      const nLater = state.repeats.filter(function (r) { return r.time && !r.paused && repOn(r, todayISO()) && nowHM() < r.time && !(state.del && state.del[repItemId(r, todayISO())]); }).length, nSkip = st.filter(function (x) { return x.s === 'skip'; }).length, nPause = st.filter(function (x) { return x.s === 'paused'; }).length;
      const k = on.reduce(function (a, r) { return a + (r.item.kcal || 0); }, 0), pr = on.reduce(function (a, r) { return a + (r.item.protein || 0); }, 0);
      const extra = [nSkip ? nSkip + ' skipped' : '', nPause ? nPause + ' paused' : ''].filter(Boolean).join(' · ');
      const allPaused = state.repeats.every(function (r) { return r.paused; });
      const pauseBtn = '<button type="button" class="rp-all" data-rep-all="' + (allPaused ? 'resume' : 'pause') + '">' + (allPaused ? 'Resume all' : 'Pause all') + '</button>';
      const title = on.length ? on.length + (on.length === 1 ? ' repeat added today' : ' repeats added today') : nLater ? 'Coming up later today' : allPaused ? 'All repeats paused' : 'Nothing repeats today';
      const sub = on.length ? fmtKcal(k) + ' kcal · ' + pr + ' g protein' + (nLater ? ' · ' + nLater + ' more later' : '') : nLater ? nLater + ' will be added at the time you set' : allPaused ? 'Turn them back on any time' : 'Your repeats are set for other days';
      h += '<div class="card rp-sum"><div class="rp-sum-top"><span class="rp-ic">' + REP_IC + '</span>' + pauseBtn + '</div><b>' + esc(title) + '</b><span>' + esc(sub) + (extra ? ' · ' + esc(extra) : '') + '</span></div>';
    }
    // Grouped by meal, in your Diary's order.
    MEALS.concat(mine.some(function (r) { return MEALS.every(function (m) { return m[0] !== r.meal; }); }) ? [['?', 'Other']] : []).forEach(function (m) {
      const rs = mine.filter(function (r) { return m[0] === '?' ? MEALS.every(function (x) { return x[0] !== r.meal; }) : r.meal === m[0]; });
      if (!rs.length) return;
      h += '<div class="group-label">' + esc(m[1]) + '</div><div class="list">' + rs.map(function (r) {
        const stt = repStatus(r);
        return '<button type="button" class="row mf-row rp-row' + (r.paused ? ' paused' : '') + '" data-rep="' + r.id + '">' + diaryIcon(r.item) + '<div class="grow"><div class="row-t">' + esc(r.item.name || 'Quick add') + '</div><div class="row-s">' + esc(repDays(r)) + (r.time ? ' · ' + esc(fmtHM(r.time)) : '') + (r.item.ref ? ' · ' + esc(fmtAmt(r.item.qty, r.item.unit)) : '') + '</div>' + (stt.k === 'on' || stt.k === 'next' ? '' : '<span class="rp-st rp-' + stt.k + '">' + esc(stt.t) + '</span>') + '</div><span class="row-v num mf-k">' + fmtKcal(r.item.kcal) + '<small>kcal</small></span></button>';
      }).join('') + '</div>';
    });
    if (!mine.length && !fq) h += '<p class="muted-note fd-empty">Nothing repeating yet. Pick a food below, tap New, or hold a food in your diary and choose Repeat.</p>';
    const sug = fq ? [] : repeatSuggestions();
    if (sug.length) h += '<div class="group-label">Suggested from your diary</div><div class="list">' + sug.map(function (s, i) {
      return '<div class="row mf-row rp-sug">' + diaryIcon(s.item) + '<div class="grow"><div class="row-t">' + esc(s.item.name || '') + '</div><div class="row-s">' + esc(mealN(s.meal)) + ' · ' + s.n + ' of the last 14 days · ' + esc(fmtAmt(s.item.qty, s.item.unit)) + '</div></div><button type="button" class="mf-add" data-rsug="' + i + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12M12 6v12"/></svg>Repeat</button></div>';
    }).join('') + '</div>';
    return { html: h, sug: sug };
  }
  function shortName(n) { return String(n || '').split(' · ')[0].split(',')[0].slice(0, 26); }
  // A simple 0–100 for the day: calories near target, protein reached, fibre, and carbs/fat near plan.
  function dayScore(d) {
    const plan = dayPlan(d), tt = dayTotals(d); if (!plan || !tt.kcal) return null;
    const tgt = roundKcal(plan.target), parts = [];
    const off = Math.abs(tt.kcal - tgt) / tgt;
    parts.push({ k: 'kcal', label: 'Calories', max: 40, pts: 40 * Math.max(0, Math.min(1, (0.3 - off) / 0.25)), note: fmtKcal(tt.kcal) + ' of ' + fmtKcal(tgt) + ' kcal' });
    parts.push({ k: 'p', label: 'Protein', max: 30, pts: 30 * Math.min(1, plan.protein ? tt.protein / plan.protein : 1), note: tt.protein + ' of ' + plan.protein + ' g' });
    if (foodDB) {
      const nd = dayNutrients(d), tg = nutTargets(d), fmin = tg.fib && tg.fib.min || 25;
      if (nd.cov.fib > 0.6) parts.push({ k: 'fib', label: 'Fibre', max: 15, pts: 15 * Math.min(1, nd.tot.fib / fmin), note: Math.round(nd.tot.fib) + ' of ' + Math.round(fmin) + ' g' });
    }
    const bal = function (v, t) { return t ? Math.max(0, 1 - Math.max(0, Math.abs(v - t) / t - 0.15) / 0.35) : 1; };
    parts.push({ k: 'bal', label: 'Carbs and fat', max: 15, pts: 15 * (bal(tt.carbs, plan.carbs) + bal(tt.fat, plan.fat)) / 2, note: 'C ' + tt.carbs + ' / ' + plan.carbs + ' g · F ' + tt.fat + ' / ' + plan.fat + ' g' });
    const max = parts.reduce(function (a, x) { return a + x.max; }, 0), score = Math.round(parts.reduce(function (a, x) { return a + x.pts; }, 0) / max * 100);
    return { score: score, grade: score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D', parts: parts };
  }
  function scorePill(d) {
    const tt = dayTotals(d), plan = dayPlan(d); if (!plan) return '';
    if (d > todayISO() || (d === todayISO() && tt.kcal < plan.target * 0.7)) return '';
    const sc = dayScore(d); if (!sc) return '';
    return '<span class="dscore ds-' + sc.grade.toLowerCase() + '" data-action="day-score" role="button" aria-label="Day score ' + sc.grade + ', ' + sc.score + ' out of 100"><b>' + sc.grade + '</b><small>Day score</small></span>';
  }
  function dayScoreSheet(d) {
    const sc = dayScore(d); if (!sc) return;
    const weak = sc.parts.slice().sort(function (a, b) { return a.pts / a.max - b.pts / b.max; })[0];
    const tip = weak.pts / weak.max > 0.9 ? 'A really well balanced day.' : weak.k === 'kcal' ? 'Calories were the furthest off. Getting closer to your target helps the most.' : weak.k === 'p' ? 'Protein was the lowest. Eggs, chicken, tuna, Greek yogurt or lentils help.' : weak.k === 'fib' ? 'Fibre was low. Beans, foul, vegetables, fruit and whole grains help.' : 'Carbs and fat were a bit off plan. Calories still count most.';
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Day score</h2></div>' +
      '<div class="ds-hero"><span class="dscore big ds-' + sc.grade.toLowerCase() + '">' + sc.grade + '</span><div><b class="num">' + sc.score + '<small> / 100</small></b><span>' + esc(relDate(d)) + '</span></div></div>' +
      '<div class="list ds-list">' + sc.parts.map(function (x) { const pc = x.pts / x.max * 100; return '<div class="row"><div class="grow"><div class="row-t">' + x.label + '</div><div class="row-s">' + x.note + '</div><div class="bar ds-bar"><i style="width:' + pc.toFixed(0) + '%"></i></div></div><span class="row-v num">' + Math.round(x.pts) + '<small>/' + x.max + '</small></span></div>'; }).join('') + '</div>' +
      '<p class="muted-note ds-tip">' + tip + '</p>');
  }
  // Hitting the day's target (calories 90–105%, protein 90%+) while you log: a little confetti, once a day.
  let dayHit = null;
  function dayHitCheck(plan, tt) {
    const hit = !!plan && tt.kcal >= plan.target * 0.9 && tt.kcal <= plan.target * 1.05 && (!plan.protein || tt.protein >= plan.protein * 0.9);
    const was = dayHit; dayHit = hit;
    if (!hit || was !== false || state.ui.celeb === todayISO()) return;
    state.ui.celeb = todayISO(); save();
    setTimeout(function () {
      buzz('success');
      const el = document.createElement('div'), still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.className = 'day-confetti';
      const colors = ['var(--accent)', '#f6c453', '#ff7a8a', '#7ab8ff', '#b4a4ff'];
      let bits = ''; if (!still) for (let i = 0; i < 40; i++) bits += '<i aria-hidden="true" style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + colors[i % colors.length] + ';animation-delay:' + (Math.random() * 0.5).toFixed(2) + 's;animation-duration:' + (1.5 + Math.random() * 1.1).toFixed(2) + 's"></i>';
      el.innerHTML = bits + '<span class="day-pill" role="status">' + FLAME + 'Right on target today</span>';
      document.body.appendChild(el); setTimeout(function () { el.remove(); }, 3200);
    }, 450);
  }
  // A meal's protein, carbs and fat: a little bar split by where the calories come from, and the grams in matching colours.
  function mealMacros(m) {
    const kp = m.p * 4, kc = m.c * 4, kf = m.f * 9, t = kp + kc + kf;
    return (t ? '<span class="mh-bar" aria-hidden="true">' + [['p', kp], ['c', kc], ['f', kf]].filter(function (x) { return x[1] / t >= 0.02; }).map(function (x) { return '<i class="mb-' + x[0] + '" style="flex:' + x[1].toFixed(0) + '"></i>'; }).join('') + '</span>' : '') +
      '<span class="mh-n"><b class="t-p">' + Math.round(m.p) + '</b>P <b class="t-c">' + Math.round(m.c) + '</b>C <b class="t-f">' + Math.round(m.f) + '</b>F</span>';
  }
  function forYou(cards) {
    cards = cards.filter(Boolean);
    if (cards.length < 2) { fyPage = 0; return cards.join(''); }
    if (fyPage >= cards.length) fyPage = cards.length - 1;
    return '<div class="fy"><div class="fy-track pager" id="fyTrack"><div class="pg-in">' + cards.join('') + '</div></div><div class="fy-dots" id="fyDots" aria-hidden="true">' + cards.map(function (c, k) { return '<i' + (k === fyPage ? ' class="on"' : '') + '></i>'; }).join('') + '</div></div>';
  }
  // The Diary moves instead of jumping. Change day and the day slides in from that side; change something on the
  // same day (add or remove a food, fold a meal, hide a suggestion) and everything below glides to its new place.
  let diaryDay = null;
  function diaryItems() {
    const out = {}, ml = $('#mealList'); if (!ml) return out;
    const put = function (k, el, rel) { out[k] = { el: el, top: el.getBoundingClientRect().top - (rel ? rel.getBoundingClientRect().top : 0) }; };
    const t = $('#tiles'); if (t && !t.hidden) put('tiles', t);
    const fy = $('.fy', ml); if (fy) put('fy', fy);
    $$('.meal-sec', ml).forEach(function (sec) {
      const h = $('.meal-head', sec); if (!h) return; put('s:' + h.dataset.mh, sec);
      $$('.sw', sec).forEach(function (w) { const b = w.querySelector('[data-food]'); if (!b) return; put('f:' + b.dataset.food, w, sec); // rows: where they sit in their meal
        const pr = w.parentNode.getBoundingClientRect(), r = w.getBoundingClientRect(); out['f:' + b.dataset.food].ghost = { sec: 's:' + h.dataset.mh, box: w.parentNode.className, top: r.top - pr.top, left: r.left - pr.left, w: r.width }; });
    });
    return out;
  }
  function diaryGlide(before) {
    const after = diaryItems(), ease = 'cubic-bezier(.2,.8,.2,1)';
    Object.keys(after).forEach(function (k) {
      const a = after[k], b = before[k];
      // a row that's new here (put back with undo, moved in): fades in as the space for it opens
      if (!b) { if (k.indexOf('f:') === 0 && !a.el.querySelector('.row-new')) a.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 90, easing: 'ease', fill: 'backwards' }); return; }
      const dy = b.top - a.top; if (Math.abs(dy) < 1) return;
      a.el.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 400, easing: ease });
    });
    // a row that's gone fades out where it was, under the rows sliding up into its place
    Object.keys(before).forEach(function (k) {
      const b = before[k], g = b.ghost; if (!g || after[k] || !after[g.sec]) return;
      const sec = after[g.sec].el, box = (g.box && sec.querySelector('.' + g.box.trim().split(/\s+/).join('.'))) || sec;
      const el = b.el, keep = box.style.position, stat = getComputedStyle(box).position === 'static';
      el.style.cssText += ';position:absolute;top:' + g.top + 'px;left:' + g.left + 'px;width:' + g.w + 'px;margin:0;pointer-events:none';
      el.setAttribute('aria-hidden', 'true'); el.inert = true; $$('[id]', el).forEach(function (x) { x.removeAttribute('id'); });
      if (stat) box.style.position = 'relative';
      box.insertBefore(el, box.firstChild);
      const an = el.animate([{ opacity: 1, transform: (el.style.transform || 'none') }, { opacity: 0, transform: (el.style.transform ? el.style.transform + ' ' : '') + 'scale(.97)' }], { duration: 220, easing: 'ease', fill: 'forwards' });
      const done = function () { el.remove(); if (stat && !box.querySelector(':scope > .sw[aria-hidden="true"]')) box.style.position = keep; };
      an.onfinish = an.oncancel = done;
    });
  }
  function daySlide(dir) {
    const dx = 26 * dir * (document.documentElement.dir === 'rtl' ? -1 : 1), ease = 'cubic-bezier(.22,1,.36,1)';
    ['#sumCard', '#tiles', '#mealList'].forEach(function (sel, i) {
      const el = $(sel); if (!el || el.hidden) return;
      el.animate([{ opacity: 0, transform: 'translateX(' + dx + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: i * 35, easing: ease, fill: 'backwards' });
    });
    const t = $('.day-title'); if (t) t.animate([{ opacity: 0, transform: 'translateX(' + dx * 0.4 + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: ease });
  }
  // A planned food you tick off glows once, so you see which one changed.
  function eatenFlash(id) {
    const r = $('#mealList [data-food="' + id + '"]'); if (!r || !r.animate || calmMotion()) return;
    const c = getComputedStyle(document.documentElement).getPropertyValue('--accent-soft').trim() || 'rgba(0,0,0,.06)';
    r.animate([{ backgroundColor: c }, { backgroundColor: 'transparent' }], { duration: 1100, easing: 'cubic-bezier(.22,1,.36,1)' });
    const v = r.querySelector('.row-v'); if (v) v.animate([{ transform: 'scale(1.18)' }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.34,1.45,.64,1)' });
  }
  function renderDiary() {
    const p = $('#panel-diary'), live = !!p && !p.hidden && state.ui.tab === 'diary' && !document.hidden && !calmMotion() && !!document.body.animate;
    const prev = diaryDay, before = live && prev === viewDay ? diaryItems() : null;
    renderDiaryNow();
    diaryDay = viewDay;
    if (!live || !prev) return;
    if (prev !== viewDay) daySlide(viewDay > prev ? 1 : -1); else if (before) diaryGlide(before);
  }
  function renderDiaryNow() {
    const today = todayISO(), maxDay = isoFromDay(dayNum(today) + PLAN_DAYS);
    if (viewDay > maxDay) viewDay = today;
    const diff = dayNum(today) - dayNum(viewDay), ahead = diff < 0;
    $('#dayLabel').textContent = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : diff === -1 ? 'Tomorrow' : fmtDate(viewDay, { weekday: 'long' });
    const stk = diff === 0 ? foodStreak() : 0;
    $('#daySub').innerHTML = esc(fmtDate(viewDay, { month: 'short', day: 'numeric' }) + (parseISO(viewDay).getFullYear() !== new Date().getFullYear() ? ', ' + parseISO(viewDay).getFullYear() : '')) + (stk >= 2 ? '<span class="stk">' + FLAME + stk + '</span>' : '');
    $('#daySub').title = stk >= 2 ? stk + ' days logged in a row (one missed day a week is forgiven)' : '';
    $('#dayPick').value = viewDay; $('#dayPick').max = maxDay;
    $('#dayNext').disabled = viewDay >= maxDay;
    $('#tiles').hidden = ahead; // weight, water and fasting are for today and before

    // Summary: calories left (ring) and macro bars
    const plan = dayPlan(viewDay), tt = dayTotals(viewDay), sc = $('#sumCard');
    let page1 = '';
    if (plan) {
      const tgt = roundKcal(plan.target), left = tgt - tt.kcal, r = 34, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, tt.kcal / tgt));
      // Energy, protein, carbs and fat: amount / target, % and a bar each.
      // One card: calories on top (eaten / target, what's left, a full bar), then protein, carbs and fat side by side.
      // Red once you go over that nutrient's max (from Targets); with no max set, a little past the target.
      const ntg = nutTargets(viewDay), NK = { k: 'kcal', p: 'p', c: 'c', f: 'f' };
      const meter = function (val, max, k) { const pc = max ? val / max * 100 : 0, hi = ntg[NK[k]] && ntg[NK[k]].hi; return '<div class="bar tg-bar sm-bar"><i data-aw class="mb-' + k + ((hi != null ? val > hi : val > max * (k === 'k' ? 1.05 : 1.1)) ? ' over' : '') + '" style="width:' + Math.min(100, pc).toFixed(1) + '%"></i></div>'; };
      const tags = [plannedFor(viewDay).length ? '+' + fmtKcal(plannedFor(viewDay).reduce(function (a, f) { return a + f.kcal; }, 0)) + ' planned' : '', plan.train != null ? (plan.train ? 'Training day' : 'Rest day') : '', plan.flex ? 'Flex ' + (plan.flex > 0 ? '+' : '−') + fmtKcal(Math.abs(plan.flex)) : '', plan.mode ? (plan.mode === 'f' ? 'Refeed day' : 'Diet break') : ''].filter(Boolean);
      page1 = '<div class="card sum-card" data-action="nutrients" role="button" tabindex="0"><div class="sum-head">' + TG_BTN + scorePill(viewDay) + '</div>' +
        (tags.length ? '<div class="sum-tags">' + tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="sm-cal"><div class="sm-l">Calories</div><div class="sm-top"><span class="sm-v num"><b data-an="' + Math.round(tt.kcal) + '">' + fmtKcal(tt.kcal) + '</b><span class="sm-u">kcal</span><span class="sm-of">/ ' + fmtKcal(tgt) + '</span></span>' +
          '<span class="sm-left num' + (left < 0 ? ' over' : '') + '"><b>' + fmtKcal(Math.abs(left)) + '</b> ' + (left < 0 ? 'over' : 'left') + '</span></div>' + meter(tt.kcal, tgt, 'k') + '</div>' +
        '<div class="sm-macs">' + [['Protein', tt.protein, plan.protein, 'p'], ['Carbs', tt.carbs, plan.carbs, 'c'], ['Fat', tt.fat, plan.fat, 'f']].map(function (x) {
          return '<div class="sm-m"><div class="sm-l">' + x[0] + '</div><div class="sm-mv num"><b data-an="' + Math.round(x[1]) + '" data-af="g">' + Math.round(x[1]) + '</b><span class="sm-u">g</span><span class="sm-of">/ ' + x[2] + '</span></div>' + meter(x[1], x[2], x[3]) + '</div>';
        }).join('') + '</div></div>';
    } else {
      page1 = '<div class="card sum-card sum-empty" data-action="go-targets" role="button" tabindex="0"><div class="sum-head">' + TG_BTN + '</div>' +
        '<p class="sum-empty-t">Set your targets to see energy, protein, carbs and fat here.' + (tt.kcal ? ' ' + fmtKcal(tt.kcal) + ' kcal logged so far.' : '') + '</p><span class="btn soft sum-empty-b">Set targets</span></div>';
    }

    // Swipe left for highlighted nutrients (keeps whichever card you were on).
    sc.innerHTML = '<div class="sum-track pager" id="sumTrack"><div class="pg-in">' + page1 + highlightCard() + '</div></div><div class="sum-dots" aria-hidden="true"><i' + (sumPage ? '' : ' class="on"') + '></i><i' + (sumPage ? ' class="on"' : '') + '></i></div>';
    animate(sc, 'sum:' + viewDay);
    if (diff === 0) dayHitCheck(plan, tt);
    if (!state.ui.holdTip && foodFor(viewDay).length >= 3) { state.ui.holdTip = true; save(); setTimeout(function () { toast('Tip: hold a food for shortcuts, or hold and drag to move it'); }, 1500); }
    // Swipe between the two cards. Moved by hand (not the browser's snap scrolling), so it follows your finger and settles without overshooting.
    const track = $('#sumTrack');
    if (sumObs) sumObs.disconnect();
    sumObs = pager(track, sumPage, function (pg) { sumPage = pg; $$('.sum-dots i', sc).forEach(function (d, i) { d.classList.toggle('on', i === pg); }); }, true);

    // Tiles: weight, water, fasting
    const e = findEntry(viewDay), wr = $('#weightRow');
    wr.innerHTML = '<span class="tile-top"><span class="label"><i class="tl-dot tl-w"></i>Weight</span>' + (e ? '' : '<span class="tile-add">Log</span>') + '</span>' +
      (e ? '<span class="l-v num">' + fmtW(e.kg) + '<span class="unit" style="font-size:12px">' + unit() + '</span></span><span class="l-s">Trend ' + fmtW(trendAt(dayNum(viewDay))) + '</span>'
        : '<span class="row-t tile-empty">' + (diff === 0 ? 'Not logged yet' : 'Not logged') + '</span><span class="l-s">&nbsp;</span>');
    const wml = waterTotal(viewDay), wg = waterGoal();
    $('#waterTile').innerHTML = '<span class="tile-top"><span class="label"><i class="tl-dot tl-h"></i>Water</span><button type="button" class="tile-plus" data-water-add aria-label="Add a glass of water">+</button></span>' +
      '<span class="l-v num">' + (wml >= 1000 ? (Math.round(wml / 10) / 100) : Math.round(wml)) + '<span class="unit" style="font-size:12px">' + (wml >= 1000 ? 'L' : 'ml') + '</span></span>' +
      '<span class="bar tile-bar"><i data-aw style="width:' + Math.min(100, wml / wg * 100).toFixed(1) + '%"></i></span>';
    animate($('#waterTile'), 'water:' + viewDay);
    const ft = $('#fastTile'), fon = state.settings.fasting;
    ft.hidden = !fon; $('#tiles').classList.toggle('three', fon);
    if (fon) {
      const fsx = state.fast, el = fsx.start ? Date.now() - fsx.start : 0;
      ft.innerHTML = '<span class="tile-top"><span class="label"><i class="tl-dot tl-f"></i>Fasting</span></span>' +
        (fsx.start ? '<span class="l-v num">' + fmtDur(el) + '<span class="unit" style="font-size:12px">h</span></span><span class="bar tile-bar' + (el >= fsx.goal * 3600000 ? ' done' : '') + '"><i style="width:' + Math.min(100, el / (fsx.goal * 36000)).toFixed(1) + '%"></i></span>'
          : '<span class="row-t tile-empty">Start</span><span class="l-s">' + (lastMeal() ? 'Ate ' + fmtAgo(Date.now() - lastMeal()) + ' ago' : fsx.goal + 'h goal') + '</span>');
    }

    // Meals
    const items = foodFor(viewDay), totals = items.filter(isDailyTotal), shut = state.ui.shut;
    let html = '';
    // Calorie totals saved with a weigh-in (older versions) sit on their own, not in a meal.
    if (totals.length) html += '<div class="list">' + totals.map(function (f) { return swRow(f, '<button type="button" class="row food-item day-total" data-food="' + f.id + '"><div class="grow"><div class="row-t">Daily total</div><div class="row-s">Calories saved with your weigh-in</div></div><span class="row-v num">' + fmtKcal(f.kcal) + '</span></button>', true); }).join('') + '</div>';
    MEALS.forEach(function (m) {
      const its = items.filter(function (f) { return mealOf(f) === m[0] && !isDailyTotal(f); }), kc = its.reduce(function (a, f) { return a + (counts(f, viewDay) ? f.kcal : 0); }, 0), open = shut.indexOf(m[0]) < 0;
      // Meal title sits above its card (on the page), so it reads as a heading; the card holds only the foods.
      const mac = its.filter(function (f) { return counts(f, viewDay); }).reduce(function (a, f) { a.p += f.protein || 0; a.c += f.carbs || 0; a.f += f.fat || 0; return a; }, { p: 0, c: 0, f: 0 });
      html += '<section class="meal-sec' + (open && its.length ? '' : ' shut') + '"><div class="list meal-card">';
      html += '<div class="meal-head' + (open ? '' : ' shut') + '" data-mh="' + m[0] + '"><button type="button" class="meal-toggle" data-toggle-meal="' + m[0] + '" aria-expanded="' + open + '"><span class="mh-t"><span class="mh-line"><span class="row-t">' + esc(m[1]) + '</span><svg class="meal-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>' + (its.length ? '<span class="mh-sub">' + (open ? mealMacros(mac) : its.length + (its.length === 1 ? ' food' : ' foods')) + '</span>' : '') + '</span></button>' +
        '<span class="row-v num">' + (kc ? fmtKcal(kc) + '<small> kcal</small>' : '') + '</span>' +
        (its.length ? '<button type="button" class="icon-btn meal-more" data-meal-menu="' + m[0] + '" aria-label="' + m[1] + ' options"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18.5" cy="12" r="1.7"/></svg></button>' : '') +
        (open && its.length ? '' : '<button type="button" class="icon-btn mh-add" data-add-meal="' + m[0] + '" aria-label="Add to ' + m[1] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg></button>') + '</div>';
      const usual = '', card = open && its.length;
      if (card) html += '<div class="meal-body">' + usual;
      if (open) its.forEach(function (f) {
        const mac = [fmtHM(f.t), f.ref ? fmtAmt(f.qty, f.unit) : [f.protein ? 'P ' + f.protein : '', f.carbs ? 'C ' + f.carbs : '', f.fat ? 'F ' + f.fat : ''].filter(Boolean).join(' · ')].filter(Boolean).join(' · ');
        const pl = f.plan, tickable = pl && viewDay <= todayISO();
        html += swRow(f, '<button type="button" class="row food-item' + (pl ? ' planned' : '') + (justAdded[f.id] && Date.now() - justAt < 4000 ? ' row-new' : '') + '" data-food="' + f.id + '">' + (tickable ? '<span class="pl-tick" data-eat="' + f.id + '" role="checkbox" aria-checked="false" aria-label="Mark ' + esc(f.name || 'food') + ' as eaten"></span>' : diaryIcon(f)) + '<div class="grow"><div class="row-t">' + esc(f.name || 'Quick add') + (f.pic ? '<span class="pic-ic" data-pic="' + f.id + '" aria-label="Photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg></span>' : '') + '</div><div class="row-s">' + (f.rep ? '<span class="rep-mk" title="Repeat item" aria-label="Repeat item">' + REP_IC + '</span>' : '') + [pl ? 'Planned' : '', mac].filter(Boolean).join(' · ') + '</div>' + (f.note ? '<div class="row-note">' + esc(f.note) + '</div>' : '') + '</div><span class="row-v num">' + fmtKcal(f.kcal) + '</span></button>');
      });
      if (card) html += (its.length ? '<button type="button" class="meal-add" data-add-meal="' + m[0] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>Add food</button>' : '') + '</div>';
      if (!its.length) html += sameRow(m[0]);
      html += '</div></section>';
    });
    swOpen = null;
    $('#mealList').innerHTML = forYou([ramadanBanner(), startBanner(), backupBanner(), gapBanner()]) + html + diaryHint();
    const fy = $('#fyTrack');
    if (fyObs) { fyObs.disconnect(); fyObs = null; }
    if (fy) fyObs = pager(fy, fyPage, function (pg) { fyPage = pg; $$('#fyDots i').forEach(function (d, k) { d.classList.toggle('on', k === pg); }); }, false);
    if (!foodDB && !warmT) warmT = setTimeout(function () { (window.requestIdleCallback || setTimeout)(function () { loadFoods().then(function () { if (state.ui.tab === 'diary' && (gapBanner() || drinksWater(viewDay))) renderDiary(); setTimeout(function () { didYouMean('qqqq'); }, 300); }, function () {}); }); }, 150);
  }

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
  // With `edit` (a logged item with a known food) it opens straight on that item's serving.
  function addFoodSheet(meal, date, edit, startFood, adjust, manage, startScan) {
    const d = date || viewDay;
    let ml = edit ? edit.meal : (meal || mealByTime()), added = 0, q = '', root = null, stopScan = null;
    let draft = null, pick = false; // recipe being edited; pick = choosing an ingredient for it
    const pickRepeat = !!(manage && manage.kind === 'repeat'); // choosing a food to repeat every day
    // While choosing a repeat item, every way of adding (quick adds, meals, several at once…) goes to the repeat setup instead of the diary.
    let repTaken = false;
    // A food for a repeat item, at your usual amount (or its normal serving); the amount can be changed in the setup.
    const repPickFood = function (f) {
      const lp = lastPortion(f.id, ml), us = unitsFor(f), u0 = lp && us.find(function (x) { return x.label === lp.unit; });
      const ds = u0 ? { qty: lp.qty, unit: u0 } : defaultServing(f), g = ds.qty * ds.unit.g, mm = macrosFor(f, g);
      addItems(d, [{ ref: f.id, g: Math.round(g * 10) / 10, qty: ds.qty, unit: ds.unit.label, kcal: Math.min(mm.kcal, 10000), protein: mm.protein, carbs: mm.carbs, fat: mm.fat, name: f.name.slice(0, 80), meal: ml }]);
    };
    const addItems = function (d2, its) {
      if (!pickRepeat) return addItemsReal(d2, its);
      if (repTaken || !its || !its.length) return; repTaken = true;
      const it = its[0]; closeSheet();
      setTimeout(function () { repeatSheet({ item: repItemCopy(it), meal: it.meal || ml, days: [] }); }, 300);
    };
    const leave = function () { if (stopScan) { stopScan(); stopScan = null; } };
    let replaceAt = null; // ingredient being swapped for another food
    let multi = false, picked = {}; // choosing several foods to add in one go
    let catSel = null; // browsing a category (fruit, meat…) on the All tab
    let sFilter = 'all', sLimit = 40, hlAlts = null, mealUseC = null; // search: type filter, how many to show, words to bold, this meal's foods
    let offRes = null; // packaged-food search results { q, list, err, busy }
    let scanTray = null; // products collected while scanning several
    let comparing = null; // { f, g }: the food you're comparing from
    let offT = null;
    function scheduleOff() { clearTimeout(offT); const qq = q.trim(), hit = offCacheGet(qq); if (hit) { offRes = { q: qq, list: hit.list }; if (Date.now() - hit.t < 864e5) return; } if (navigator.onLine === false) return; offT = setTimeout(offSearch, hit ? 50 : 450); }
    function offHtml() {
      if (offRes.busy) return '<p class="muted-note fd-empty">Searching packaged foods…</p>';
      if (offRes.err) return '<p class="muted-note fd-empty">' + offRes.err + '</p>';
      if (!offRes.list.length) return '<p class="muted-note fd-empty">No packaged foods found.</p>';
      return '<div class="label faint fd-sec">Packaged foods · Open Food Facts</div><div class="list">' + offRes.list.map(function (o, i) { const k = o.n.kcal; return '<button type="button" class="row fd-row" data-offr="' + i + '"><div class="grow"><div class="row-t">' + esc(o.name + (o.brand ? ' · ' + o.brand : '')) + '</div><div class="row-s">' + (k != null ? Math.round(k) + ' kcal per 100 g' : '') + (o.sv ? ' · serving ' + fmtQty(o.sv) + ' g' : '') + '</div></div></button>'; }).join('') + '</div>';
    }
    function offSearch() {
      const qq = q.trim(); if (qq.length < 2) return;
      const prev = offCacheGet(qq);
      const keep = prev ? prev.list : (offRes && offRes.q === qq ? offRes.list : []);
      offRes = { q: qq, list: keep, busy: !prev }; if (!prev) drawList();
      const FIELDS = 'code,product_name,product_name_en,product_name_ar,brands,serving_quantity,nutriments,countries_tags';
      const json = function (url) { const ctl = 'AbortController' in window ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 12000); return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { clearTimeout(to); if (!r.ok) throw new Error(r.status); return r.json(); }); };
      const toO = function (p) { const name = String(p.product_name || p.product_name_en || p.product_name_ar || '').trim().slice(0, 60), n = offNutrients(p.nutriments || {}), sv = Number(p.serving_quantity), br = Array.isArray(p.brands) ? p.brands[0] : String(p.brands || '').split(',')[0]; if (!name || n.kcal == null || !/^\d{8,14}$/.test(String(p.code || ''))) return null; return { id: 'o' + p.code, code: String(p.code), name: name, brand: String(br || '').trim().slice(0, 40), n: n, sv: isFinite(sv) && sv > 0 && sv < 2000 ? sv : null, eg: (p.countries_tags || []).indexOf('en:egypt') >= 0 }; };
      // Ask both Open Food Facts search services at once (either can be slow or down), plus a brand lookup
      // when the search names a brand, then merge. A brand typed in Arabic is searched by its usual name.
      const bq = brandQuery(qq), words = bq.split(' '), brand = Object.keys(BRANDS).find(function (b) { return (' ' + bq + ' ').indexOf(' ' + b + ' ') >= 0; }) || Object.keys(BRANDS).find(function (b) { return b.indexOf(' ') < 0 && words.some(function (w) { return w.length >= 4 && b.indexOf(w) === 0; }); });
      if (brand && words.indexOf(brand) < 0) words.forEach(function (w, i) { if (w.length >= 4 && brand.indexOf(w) === 0) words[i] = brand; });
      const sq = /[ء-ي]/.test(qq) && brand ? bq : qq;
      const soft = function (pr) { return pr.then(function (x) { return { ok: true, ps: x }; }, function () { return { ok: false, ps: [] }; }); };
      const jobs = [
        soft(json('https://search.openfoodfacts.org/search?q=' + encodeURIComponent(sq) + '&page_size=40&fields=' + FIELDS).then(function (d) { return d.hits || []; })),
        soft(json('https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(sq) + '&search_simple=1&action=process&json=1&page_size=30&fields=' + FIELDS).then(function (d) { return d.products || []; }))
      ];
      if (brand) jobs.push(soft(json('https://world.openfoodfacts.org/api/v2/search?brands_tags=' + encodeURIComponent(brand.replace(/'/g, '').replace(/ /g, '-')) + '&page_size=100&fields=' + FIELDS).then(function (d) { return d.products || []; })));
      Promise.all(jobs).then(function (rs) {
        if (!rs.some(function (r) { return r.ok; })) { if (offRes && offRes.q === qq) { offRes = { q: qq, list: keep, err: keep.length ? null : 'Couldn\'t reach packaged foods.' }; drawList(); } return; }
        // Keep products whose name/brand has every word you typed (beyond the brand), Egyptian ones first.
        const rest = words.filter(function (w) { return w && w !== brand; }), qt = rest.length ? queryToks(rest.join(' ')) : [];
        const seen = {}, all = [].concat.apply([], rs.map(function (r) { return r.ps; })).map(toO).filter(function (o) { if (!o || seen[o.code]) return false; seen[o.code] = 1; return true; });
        const fits = function (o) { const w = wordsOf(o.name + ' ' + o.brand + ' ' + (o.brand ? brandQuery(o.brand) : '')); return qt.every(function (a) { return matchTok(a, w); }); };
        const good = all.filter(fits), list = (good.length ? good : all).sort(function (a, b) { return (b.eg ? 1 : 0) - (a.eg ? 1 : 0); }).slice(0, 30).map(function (o) { delete o.eg; return o; });
        offCachePut(qq, list);
        if (offRes && offRes.q === qq) { offRes = { q: qq, list: list }; drawList(); }
      });
    }
    // Adjust: this entry's own copy of the recipe (its earlier adjustment, or the saved recipe).
    const adjustDraft = function () {
      const rc = edit.rc || state.recipes.find(function (x) { return x.id === edit.ref; }) || { servings: 1, cookedG: null, items: [] };
      return JSON.parse(JSON.stringify({ id: edit.ref, name: edit.name, servings: rc.servings, cookedG: rc.cookedG, items: rc.items }));
    };
    // manage: opened from You → My foods, so saving or going back returns there.
    const done = function () { closeSheet(); renderFoods(); };
    // Header: back, title, and which day/meal this goes to (tap the meal to change it).
    const head = function (title, back, right, noMeal) {
      const where = pick ? esc(pickMeal ? (mealDraft.name || 'Meal') : (draft.name || 'Recipe')) : manage ? 'My foods' : '<span id="afDay">' + esc(relDate(d)) + (added ? ' · ' + added + ' added' : '') + '</span>' + (noMeal ? '' : ' · <label class="meal-pick"><select id="afMealSel" aria-label="Meal">' + MEALS.map(function (m) { return '<option value="' + m[0] + '"' + (m[0] === ml ? ' selected' : '') + '>' + m[1] + '</option>'; }).join('') + '</select></label>');
      return '<div class="sheet-head">' + (back === 'x' ? '<button type="button" class="icon-btn back-btn" id="afBack" data-close aria-label="Close">' + BACK_IC + '</button>' : back ? '<button type="button" class="icon-btn back-btn" id="afBack" aria-label="Back">' + BACK + '</button>' : '') +
        '<div class="grow" style="min-width:0"><div class="label faint af-where">' + where + '</div><h2 class="sheet-title" id="sheetTitle">' + title + '</h2></div>' + (right || '') + '</div>';
    };
    const bindMeal = function (cb) { const sel = $('#afMealSel', root); if (sel) sel.addEventListener('change', function () { ml = sel.value; buzz('light'); if (cb) cb(); }); };
    const logged = function (label, snap) {
      if (pickRepeat) return;
      save(); renderAll(); buzz('success'); added++;
      toast(label, function () { restore(snap); added = Math.max(0, added - 1); refreshHead(); });
    };

    // ----- list: search, Recent, Favorites, My foods -----
    // Foods you usually have that fit what's left of the day (calories first, then protein, carbs and fat).
    function fitsLeft() {
      if (pick || d < todayISO()) return null;
      const pl = dayPlan(d); if (!pl) return null;
      const tt = dayTotals(d), rk = roundKcal(pl.target) - tt.kcal, rp = pl.protein - tt.protein, rc = pl.carbs - tt.carbs, rf = pl.fat - tt.fat;
      if (rk < 120) return null;
      const P = Math.max(0, rp) * 4, Cc = Math.max(0, rc) * 4, F = Math.max(0, rf) * 9, W = P + Cc + F || 1;
      const fu = foodUse(), cands = [], seen = {};
      fu.order.forEach(function (o) { if (seen[o.key]) return; seen[o.key] = 1; const it = o.item; if (it.ref && !getFood(it.ref)) return; cands.push({ key: o.key, o: o, ref: it.ref, name: it.name || 'Quick add', kcal: it.kcal, p: it.protein, c: it.carbs, f: it.fat, amt: it.ref ? fmtAmt(it.qty, it.unit) : 'Quick add', use: fu.use[o.key] || 1 }); });
      state.recipes.concat(state.myFoods).forEach(function (x) { if (seen[x.id]) return; const f = getFood(x.id); if (!f) return; const s0 = defaultServing(f), m = macrosFor(f, s0.qty * s0.unit.g); cands.push({ key: x.id, ref: x.id, name: f.name, kcal: m.kcal, p: m.protein, c: m.carbs, f: m.fat, amt: fmtAmt(s0.qty, s0.unit.label), use: 0 }); });
      const scored = cands.filter(function (c) { return c.kcal >= 40 && c.kcal <= rk * 1.1; }).map(function (c) {
        const fill = (P ? P / W * Math.min(c.p, rp) / rp : 0) + (Cc ? Cc / W * Math.min(c.c, rc) / rc : 0) + (F ? F / W * Math.min(c.f, rf) / rf : 0);
        const over = (Math.max(0, c.p - Math.max(0, rp)) * 4 + Math.max(0, c.c - Math.max(0, rc)) * 4 + Math.max(0, c.f - Math.max(0, rf)) * 9) / rk;
        return { c: c, s: fill - 1.5 * over + Math.min(c.use, 10) * 0.01 };
      }).filter(function (x) { return x.s > 0.05; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4).map(function (x) { return x.c; });
      return scored.length ? { items: scored, rk: rk, rp: Math.max(0, Math.round(rp)) } : null;
    }
    function showList() {
      leave();
      const tab = state.ui.foodTab;
      root.innerHTML = head(comparing ? 'Compare with' : pick ? (pickMeal ? 'Add to meal' : replaceAt != null ? 'Replace with' : 'Add ingredient') : pickRepeat ? 'Food to repeat' : 'Add food', pick || !!comparing, pick ? '' : '<button type="button" class="text-btn" id="afQuick" style="margin:0">Quick add</button>') +
        '<div class="seg af-tabs" id="afTabs">' + [['recent', 'All'], ['favs', 'Favorites'], ['mine', 'My foods']].map(function (t) { return '<button type="button" data-v="' + t[0] + '" aria-pressed="' + (t[0] === tab) + '">' + t[1] + '</button>'; }).join('') + '</div>' +
        '<div class="search-box">' + SEARCH_ICO + '<input id="afQ" type="search" placeholder="Search foods" aria-label="Search foods" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search" />' +
        (!pick && SpeechRec ? '<button type="button" class="scan-btn" id="afMic" aria-label="Say what you ate">' + MIC_IC + '</button>' : '') +
        (pick ? '' : '<button type="button" class="scan-btn af-sel" id="afSel" aria-pressed="' + multi + '" aria-label="Pick several">' + SEL_IC + '</button>') +
        '<button type="button" class="scan-btn" id="afScan" aria-label="Scan a barcode">' + SCAN_ICO + '</button></div>' +
        '<div class="af-bar af-sortbar" id="afBar" hidden></div>' +
        '<div id="afList"></div>' +
        (pick ? '' : '<div class="sheet-foot" id="afMulti" hidden><button type="button" class="btn primary block" id="afMGo">Add</button></div>');
      // The search bar stays pinned under the title while the tabs scroll away.
      const sbx = $('.search-box', root), shd = $('.sheet-head', root);
      if (sbx && shd) { sbx.classList.add('af-sticky'); sbx.style.top = shd.offsetHeight + 'px'; }
      const Q = $('#afQ', root);
      Q.value = q;
      if (comparing) $('#afBack', root).addEventListener('click', function () { const a = comparing; comparing = null; showServe(a.f); });
      else if (pick) $('#afBack', root).addEventListener('click', function () { pick = false; replaceAt = null; if (pickMeal) { pickMeal = false; showMealEdit(); } else showRecipe(); });
      else {
        bindMeal(function () { if (!q.trim() && state.ui.foodTab === 'recent') drawList(); syncMulti(); }); $('#afQuick', root).addEventListener('click', showQuick);
        $('#afSel', root).addEventListener('click', function () { setMulti(!multi); });
        $('#afMGo', root).addEventListener('click', addPicked);
      }
      $('#afScan', root).addEventListener('click', function () { buzz('light'); showScan(); });
      if ($('#afMic', root)) $('#afMic', root).addEventListener('click', function () {
        const btn = this, inp = $('#afQ', root);
        if (btn.classList.contains('on')) { try { rec && rec.stop(); } catch (e) {} return; }
        let rec; try { rec = new SpeechRec(); } catch (e) { toast('Voice isn\'t available here. Try the keyboard\'s mic.'); return; }
        rec.lang = /[ء-ي]/.test(inp.value) ? 'ar-EG' : (navigator.language || 'en-US'); rec.interimResults = true; rec.maxAlternatives = 1;
        btn.classList.add('on'); buzz('light'); inp.placeholder = 'Listening… e.g. "two eggs and a coffee"';
        rec.onresult = function (e) { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; inp.value = t; inp.dispatchEvent(new Event('input')); };
        rec.onerror = function (e) { if (e.error === 'not-allowed') toast('Allow the microphone to use voice'); };
        rec.onend = function () { btn.classList.remove('on'); inp.placeholder = 'Search foods'; if (inp.value.trim()) buzz('success'); };
        try { rec.start(); } catch (e) { btn.classList.remove('on'); }
      });
      // Tapping a tab while searching clears the search and shows that tab.
      $$('#afTabs button', root).forEach(function (b) { b.addEventListener('click', function () { state.ui.foodTab = b.dataset.v; save(); sFilter = 'all'; sLimit = 40; $$('#afTabs button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); buzz('light'); drawList(); }); });
      let t = null;
      Q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { q = Q.value; sFilter = 'all'; sLimit = 40; drawList(); }, 120); });
      Q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(t); q = Q.value; drawList(); const first = q.trim() && $('#afList [data-f], #afList [data-qr]', root); Q.blur(); if (first && !multi) first.click(); } });
      drawList();
      if (!edit && window.matchMedia('(hover: hover)').matches) Q.focus();
    }
    // Bold the words that match what you typed.
    function hlName(name) {
      if (!hlAlts || !hlAlts.length) return esc(name);
      return name.split(/(\s+|,\s*|\s·\s|\(|\))/).map(function (part) { const w = stem(normText(part)); return w && w.length >= 2 && hlAlts.some(function (a) { return w.indexOf(a) === 0; }) ? '<b>' + esc(part) + '</b>' : esc(part); }).join('');
    }
    function row(f, sub, okey) {
      // In Arabic, the Arabic name leads (the English name moves under it); searching in Arabic shows it beside the name.
      const arTitle = state.settings.lang === 'ar' && f.ar && (f.ar.indexOf(' ') > 0 || f.first.length < 2) ? f.ar : ''; // a one-word Arabic name would hide what the food is
      const ar = !arTitle && (hlAlts && /[ء-ي]/.test(q) || state.settings.lang === 'ar') ? arabicFor(f) : '';
      return '<button type="button" class="row fd-row" data-f="' + f.id + '"' + (okey ? ' data-o="' + esc(okey) + '"' : '') + '>' + ftIcon(ftKind(f)) + '<div class="grow"><div class="row-t" data-notr>' + (arTitle ? hlName(f.ar) : hlName(f.name)) + (isVerified(f) ? VER_IC : '') + (ar ? ' <span class="ar-hint">' + esc(ar) + '</span>' : '') + '</div><div class="row-s">' + esc(sub || (f.via ? f.via + ' · ' : '') + (arTitle && f.ar ? f.name.split(',').slice(0, 2).join(',') + ' · ' : '') + servingLine(f, ml)) + '</div></div>' + (isFav(f.id) ? '<span class="fd-star">' + STAR(true) + '</span>' : '') + '</button>';
    }
    function qRow(o) { return '<button type="button" class="row fd-row" data-qr="' + esc(o.key) + '" data-o="' + esc(o.key) + '">' + ftIcon('quick') + '<div class="grow"><div class="row-t">' + esc(o.item.name || 'Quick add') + '</div><div class="row-s">Quick add · ' + fmtKcal(o.item.kcal) + ' kcal</div></div><span class="fd-plus">+</span></button>'; }
    // Building a meal: your other saved meals can go into it too (their foods are added, like in Cronometer).
    function otherMeals() { return state.meals.filter(function (m) { return !mealDraft || m.id !== mealDraft.id; }); }
    function addMealInto(m) {
      const room = 40 - mealDraft.items.length, its = m.items.slice(0, Math.max(0, room)).map(function (it) { const c = JSON.parse(JSON.stringify(it)); delete c.id; delete c.meal; delete c.t; delete c.plan; return c; });
      mealDraft.items = mealDraft.items.concat(its);
      pick = false; pickMeal = false; buzz('success'); showMealEdit();
      toast(its.length < m.items.length ? 'A meal holds up to 40 foods' : 'Added ' + m.name);
    }
    function mealRow(m) { return '<button type="button" class="row fd-row" data-meal="' + m.id + '">' + ftIcon('meal') + '<div class="grow"><div class="row-t">' + esc(m.name) + '</div><div class="row-s">' + (m.via ? esc(m.via) + ' · ' : '') + 'Meal · ' + m.items.length + (m.items.length === 1 ? ' food' : ' foods') + ' · ' + fmtKcal(mealTotal(m.items)) + ' kcal</div></div></button>'; }
    function section(title, html) { return '<div class="label faint fd-sec">' + title + '</div><div class="list">' + html + '</div>'; }
    // Order a list of foods by your sort choice. key(x) → foodUse key, name(x) → name.
    function sorted(list, key, name, fu) {
      const srt = state.ui.sort, pos = {}, use = fu.allUse; fu.all.forEach(function (o, i) { pos[o.key] = i; });
      const out = list.slice();
      if (srt === 'az') out.sort(function (a, b) { return name(a).localeCompare(name(b)); });
      else if (srt === 'freq') out.sort(function (a, b) { return (use[key(b)] || 0) - (use[key(a)] || 0) || (pos[key(a)] != null ? pos[key(a)] : 1e9) - (pos[key(b)] != null ? pos[key(b)] : 1e9); });
      else if (srt === 'recent' && list.length && !list[0].key) out.sort(function (a, b) { return (pos[key(a)] != null ? pos[key(a)] : 1e9) - (pos[key(b)] != null ? pos[key(b)] : 1e9); });
      return out;
    }
    // "2 eggs, 150 g rice, a banana" → each food with its amount.
    const NUMW = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0.5, '½': 0.5, '¼': 0.25, 'واحد': 1, 'واحده': 1, 'اتنين': 2, 'تلاته': 3, 'تلاتة': 3, 'اربعه': 4, 'خمسه': 5, 'نص': 0.5, 'ربع': 0.25 };
  // Everyday and Egyptian measures: the food's own portion with that word if it has one, otherwise a typical weight.
  const MEASURES = [
    [/^(handfuls?|حفنه|حفنة)$/, ['handful'], 30], [/^(plates?|صحن|طبق)$/, ['plate', 'serving'], 300], [/^(bowls?|سلطانيه)$/, ['bowl', 'cup'], 250],
    [/^(glass(es)?|mugs?|كوبايه|كوباية|كوب|مج)$/, ['cup', 'glass', 'fl oz'], 240], [/^(cans?|علبه|علبة)$/, ['can', 'package'], 330], [/^(bottles?|ازازه|قزازه)$/, ['bottle'], 500],
    [/^(packs?|packets?|bags?|كيس)$/, ['package', 'packet', 'bag', 'serving'], 40], [/^(slices?|شريحه|شريحة)$/, ['slice'], 30], [/^(scoops?)$/, ['scoop'], 30],
    [/^(tbsp|tablespoons?|spoons?|معلقه|معلقة|ملعقه|ملعقة)$/, ['tbsp', 'tablespoon'], 15], [/^(tsp|teaspoons?)$/, ['tsp', 'teaspoon'], 5],
    [/^(loaf|loaves|رغيف|ارغفه)$/, ['loaf', 'pita', 'piece'], 90], [/^(pieces?|pcs?|حته|حتة|قطعه|قطعة)$/, ['piece', 'medium', 'serving'], null], [/^(sandwich(es)?|ساندوتش)$/, ['sandwich'], 200]
  ];
    // An amount typed with the food: "150 g chicken", "2 eggs", "نص رغيف", "chicken 150g". Returns [number, unit word, food words].
    function splitAmt(part) {
      part = String(part).replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x660); }).trim();
      const m = /^(\d+(?:[.,]\d+)?|½|¼|a|an|one|two|three|four|five|six|half|واحد|واحده|اتنين|تلاته|تلاتة|اربعه|خمسه|نص|ربع)?\s*(g|gr|grams?|kg|ml|l|oz|cups?|tbsp|tablespoons?|tsp|teaspoons?|slices?|pieces?|pcs?|bowls?|scoops?|large|medium|small|handfuls?|plates?|glass(?:es)?|mugs?|cans?|bottles?|packs?|packets?|bags?|spoons?|loaf|loaves|sandwich(?:es)?|حفنه|حفنة|صحن|طبق|سلطانيه|كوبايه|كوباية|كوب|مج|علبه|علبة|ازازه|قزازه|كيس|شريحه|شريحة|معلقه|معلقة|ملعقه|ملعقة|رغيف|ارغفه|حته|حتة|قطعه|قطعة|ساندوتش)?\.?\s+(?:of\s+|من\s+)?(.+)$/i.exec(part);
      const e = !m || (!m[1] && !m[2]) ? /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(g|gr|grams?|kg|ml|l|oz|جرام|جم)$/i.exec(part) : null;
      if (e) return [parseFloat(e[2].replace(',', '.')), e[3].toLowerCase().replace(/^(جرام|جم)$/, 'g'), e[1]];
      if (!m) return [null, '', part];
      return [m[1] ? (NUMW[m[1].toLowerCase()] || parseFloat(m[1].replace(',', '.'))) : null, (m[2] || '').toLowerCase(), m[3]];
    }
    // That amount for one food, in one of its units (null when nothing was typed).
    function amountFor(f, n, uw) {
      if (n == null && !uw) return null;
      const units = unitsFor(f); let g = null, qty, unit;
      const gramsU = { g: 1, gr: 1, gram: 1, grams: 1, kg: 1000, ml: 1, l: 1000, oz: 28.3495 }[uw];
      if (gramsU && !f.noG) { g = (n || 1) * gramsU; unit = units.find(function (u) { return u.label === 'g'; }); qty = Math.round(g); }
      else if (uw) {
        const w = uw.replace(/s$/, '').replace(/^tablespoon$/, 'tbsp').replace(/^teaspoon$/, 'tsp').replace(/^pc$/, 'piece');
        let u = units.find(function (x) { return x.label.toLowerCase().indexOf(w) >= 0; });
        const ms = !u && MEASURES.find(function (x) { return x[0].test(uw); });
        if (ms) { u = units.find(function (x) { return ms[1].some(function (k) { return x.label.toLowerCase().indexOf(k) >= 0; }); }); if (!u && ms[2] && !f.noG) { g = (n || 1) * ms[2]; unit = units.find(function (x) { return x.label === 'g'; }); qty = Math.round(g); } }
        if (u) { unit = u; qty = n || 1; g = qty * u.g; }
      }
      // A count ("2 eggs", "a banana"): a whole-item size like medium or large, not cups or spoons.
      const each = function () { const c = units.filter(function (x) { return x.label !== 'g' && x.label !== 'oz'; }); return c.find(function (x) { return /\bmedium\b/i.test(x.label); }) || c.find(function (x) { return /\b(large|small|whole|piece|item|fruit|each|slice|egg|bar|patty|loaf|serving)\b/i.test(x.label); }) || c.find(function (x) { return !/cup|tbsp|tsp|tablespoon|teaspoon|oz|ml|chopped|sliced|mashed|diced/i.test(x.label); }) || c[0]; };
      if (g == null && n != null) { const u = each(); if (u && n <= 20) { unit = u; qty = n; g = n * u.g; } else if (!f.noG) { unit = units.find(function (x) { return x.label === 'g'; }); qty = n; g = n; } }
      return g == null ? null : { g: g, qty: qty, unit: unit };
    }
    function parseMeal(text, lines) {
      const parts = (lines ? text.split(/\n+/) : text.split(/\s*(?:,|;|\+|\n|\band\b|\bwith\b| و )\s*/i)).map(function (x) { return x.trim(); }).filter(Boolean);
      if (!lines && parts.length < 2 && !/^\s*(\d|½|¼)/.test(text)) return null;
      const fu = foodUse();
      const out = parts.map(function (part) {
        const sa = splitAmt(part), n = sa[0], uw = sa[1], name = sa[2];
        const f = searchFoods(name, fu.use, { noRecipes: !!lines })[0]; if (!f) return { part: part };
        const units = unitsFor(f), am = amountFor(f, n, uw); let g = am ? am.g : null, qty = am ? am.qty : null, unit = am ? am.unit : null;
        if (g == null) { const lp = lastPortion(f.id, ml), lu = lp && units.find(function (u) { return u.label === lp.unit; }); if (lu) { unit = lu; qty = lp.qty; g = lp.qty * lu.g; } else { const s0 = defaultServing(f); unit = units.find(function (u) { return u.label === s0.unit.label; }) || s0.unit; qty = s0.qty; g = s0.qty * s0.unit.g; } }
        const mm = macrosFor(f, g);
        return { part: part, f: f, g: Math.round(g * 10) / 10, qty: Math.round(qty * 1000) / 1000, unit: unit.label, m: mm };
      });
      return out.length && out.some(function (x) { return x.f; }) ? out : null;
    }
    function drawList() {
      const box = $('#afList', root); if (!box) return;
      const searching = q.trim().length > 0;
      hlAlts = null;
      $('#afTabs', root).classList.toggle('searching', searching);
      const ph = state.ui.foodTab === 'mine' ? 'Search my foods' : state.ui.foodTab === 'favs' ? 'Search favorites' : 'Search foods', qi = $('#afQ', root);
      if (qi && qi.dataset.ph !== ph) { qi.dataset.ph = ph; qi.placeholder = ph; qi.setAttribute('aria-label', ph); if (typeof tr === 'function' && state.settings.lang === 'ar') { qi.placeholder = tr(ph); qi.setAttribute('aria-label', tr(ph)); } }
      const needDB = !foodDB;
      if (needDB && !coreDB) loadCoreFoods().then(function (db) { if (db && !foodDB && $('#afList', root)) drawList(); });
      if (needDB) loadFoods().then(function () { if ($('#afList', root)) drawList(); }, function () { const b = $('#afList', root); if (b && !foodDB) b.innerHTML = '<p class="muted-note fd-empty">Couldn\'t load the food list. Check your connection and try again. Quick add and My foods still work.</p>'; });
      const fu = foodUse();
      let html = '';
      const scope = state.ui.foodTab === 'mine' || state.ui.foodTab === 'favs' ? state.ui.foodTab : null;
      if (searching && scope) {
        // Searching inside Favorites or My foods only looks at what's there.
        const qw = queryToks(q), hit = function (name) { const w = wordsOf(name || ''); return qw.every(function (a) { return matchTok(a, w) || a.some(function (t) { return fuzzyTok(t, w); }); }); };
        hlAlts = []; qw.forEach(function (a) { a.forEach(function (x) { if (x.length >= 2) hlAlts.push(x); }); });
        let mealsHit = [], foods = [];
        if (scope === 'mine') {
          mealsHit = (pick ? (pickMeal ? otherMeals() : []) : state.meals).filter(function (m) { return hit(m.name); });
          foods = (pick && !pickMeal ? [] : state.recipes.map(recipeFood).filter(Boolean)).concat(state.myFoods.map(customFood)).filter(function (f) { return hit(f.name); });
        } else foods = state.favs.map(getFood).filter(function (f) { return f && !(pick && !pickMeal && f.recipe) && hit(f.name); });
        html = mealsHit.length || foods.length ? '<div class="list">' + mealsHit.map(mealRow).join('') + foods.map(function (f) { return row(f); }).join('') + '</div>'
          : (needDB && scope === 'favs' && state.favs.length ? skel(3) : '<p class="muted-note fd-empty">Nothing in ' + (scope === 'mine' ? 'My foods' : 'Favorites') + ' matches. <button type="button" class="text-btn" data-scope-all>Search all foods</button></p>');
        if (scope === 'mine') html += '<button type="button" class="text-btn fd-create" data-new-food>Create “' + esc(q.trim().slice(0, 30)) + '” as a food</button>';
      } else if (searching) {
        const pm = !pick && foodDB ? parseMeal(q) : null;
        if (pm) {
          const ok = pm.filter(function (x) { return x.f; });
          html += '<div class="card pm-card"><div class="label faint">Add all at once</div>' + pm.map(function (x) { return '<div class="pm-row' + (x.f ? '' : ' miss') + '"><span class="grow"><b>' + esc(x.part) + '</b>' + (x.f ? '<small>' + esc(x.f.name) + ' · ' + fmtAmt(x.qty, x.unit) + '</small>' : '<small>No match</small>') + '</span>' + (x.f ? '<span class="num">' + fmtKcal(x.m.kcal) + '</span>' : '') + '</div>'; }).join('') +
            '<button type="button" class="btn primary block" id="pmGo">Add ' + ok.length + ' to ' + mealName(ml) + ' · ' + fmtKcal(ok.reduce(function (a, x) { return a + x.m.kcal; }, 0)) + ' kcal</button></div>';
        }
        const digits = q.replace(/\s/g, '');
        if (/^\d{8,14}$/.test(digits)) html += '<button type="button" class="btn soft block" data-code="' + digits + '" style="margin-bottom:12px">Look up barcode ' + digits + '</button>';
        const rec = {}; fu.order.forEach(function (o, i) { if (o.item.ref && rec[o.item.ref] == null) rec[o.item.ref] = i; });
        if (!mealUseC || mealUseC.ml !== ml) { const mu = {}, from = dayNum(todayISO()) - 90; Object.keys(state.food).forEach(function (dt) { if (dayNum(dt) >= from) state.food[dt].forEach(function (it) { if (it.ref && it.meal === ml && !it.plan) mu[it.ref] = (mu[it.ref] || 0) + 1; }); }); mealUseC = { ml: ml, m: mu }; }
        const intent = foodDB ? intentOf(q) : null;
        let all = intent && !intent.rest ? intentFoods(intent.it, intent.snack, intent.bf) : searchFoods(intent ? intent.rest : q, fu.use, { noRecipes: pick && !pickMeal, recent: rec, mem: qMemFor(q), mealUse: mealUseC.m, limit: 160 });
        if (intent && intent.rest) all = all.filter(function (f) { return intentScore(f, intent.it) != null; }).sort(function (a, b) { return (intentScore(a, intent.it) - intentScore(b, intent.it)) * intent.it.dir; });
        if (intent) html += '<p class="muted-note intent-note">' + intent.it.label + (intent.rest ? ' · ' + esc(intent.rest) : '') + '</p>';
        const qw = queryToks(intent ? intent.rest || 'zzzz' : q);
        hlAlts = []; qw.forEach(function (a) { a.forEach(function (x) { if (x.length >= 2) hlAlts.push(x); }); });
        const kind = function (f) { const t = ftType(f); return f.custom || f.recipe ? 'mine' : t === 'pack' ? 'pack' : t === 'rest' || f.cat === 'Egyptian dishes' || f.cat === 'Dishes (estimate)' || /Meals, Entrees|Mixed Dishes|Sandwiches|Pizza|Burgers|Soups|Fast Foods|Restaurant/i.test(f.cat || '') ? 'dish' : 'food'; };
        const counts = { all: all.length, food: 0, dish: 0, pack: 0, mine: 0, ver: 0 }; all.forEach(function (f) { counts[kind(f)]++; if (isVerified(f)) counts.ver++; });
        const vOnly = state.ui.sver && !pick;
        const filtered = (sFilter === 'all' ? all : all.filter(function (f) { return kind(f) === sFilter; })).filter(function (f) { return !vOnly || isVerified(f); });
        const res = filtered.slice(0, sLimit);
        if (!pick && all.length > 6) html += '<div class="sf-chips" role="group" aria-label="Filter results"><button type="button" class="sf-ver" data-sver aria-pressed="' + !!state.ui.sver + '">' + VER_IC + 'Verified</button>' + [['all', 'All'], ['food', 'Foods'], ['dish', 'Dishes'], ['pack', 'Packaged'], ['mine', 'Mine']].filter(function (x) { return x[0] === 'all' || counts[x[0]]; }).map(function (x) { return '<button type="button" data-sf="' + x[0] + '" aria-pressed="' + (sFilter === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>';
        const dym = all.length < 4 ? didYouMean(q) : '';
        if (dym && normText(dym) !== normText(q)) html += '<button type="button" class="text-btn dym" data-dym="' + esc(dym) + '">Did you mean <b>' + esc(dym) + '</b>?</button>';
        const kq = /^\s*(\d{2,4})\s*(kcal|cal|calories|سعره?)?\s*$/i.exec(q);
        if (kq && !pick && +kq[1] >= 10 && +kq[1] <= 5000) html += '<button type="button" class="btn soft block" data-qk="' + kq[1] + '" style="margin-bottom:12px">Quick add ' + fmtKcal(+kq[1]) + ' kcal</button>';
        // Your own quick adds match too, so things you typed in by hand come back.
        const quick = pick ? [] : fu.order.filter(function (o) { return !o.item.ref && o.item.name && qw.every(function (a) { return matchTok(a, wordsOf(o.item.name)); }); }).slice(0, 4);
        const meals = (pick ? (pickMeal ? otherMeals() : []) : state.meals).filter(function (m) { const w = wordsOf(m.name); if (qw.every(function (a) { return matchTok(a, w); })) { m.via = ''; return true; } const hit = m.items.find(function (it) { const iw = wordsOf(it.name || ''); return qw.every(function (a) { return matchTok(a, iw); }); }); m.via = hit ? 'Contains ' + (hit.name || '').split(',')[0] : ''; return !!hit; });
        // Packaged foods (Open Food Facts) join the same list once they arrive.
        const qq = q.trim(), have = {}; res.forEach(function (f) { have[f.id] = 1; if (f.id.indexOf('ub') === 0) have['o' + f.id.slice(2)] = 1; });
        if (qq.length >= 3 && !pick && (!offRes || offRes.q !== qq)) { scheduleOff(); if ((!offRes || offRes.q !== qq)) { const cm = offCachedMatches(qq); if (cm.length) offRes = { q: qq, list: cm, busy: true }; } }
        const offRows = offRes && offRes.q === qq && offRes.list ? offRes.list.filter(function (o) { return !have[o.id]; }).slice(0, 10).map(function (o, i) { const k = o.n.kcal; return '<button type="button" class="row fd-row" data-offr="' + offRes.list.indexOf(o) + '"><div class="grow"><div class="row-t">' + esc(o.name) + '</div><div class="row-s">Packaged' + (o.brand ? ' · ' + esc(o.brand) : '') + (k != null ? ' · ' + Math.round(k) + ' kcal / 100 g' : '') + '</div></div></button>'; }) : [];
        const offWait = offRes && offRes.q === qq && offRes.busy && !offRows.length;
        const offErr = offRes && offRes.q === qq && offRes.err;
        const pls = pick ? [] : placeMatches(q);
        if (pls.length) html += '<div class="list mn-places">' + pls.map(function (p) { return '<button type="button" class="row fd-row" data-menu="' + esc(p.name) + '">' + ftIcon('rest') + '<div class="grow"><div class="row-t">' + esc(p.name) + ' menu</div><div class="row-s">' + p.items.length + ' items · pick several at once</div></div>' + CHEV + '</button>'; }).join('') + '</div>';
        if (meals.length || res.length || quick.length || offRows.length) html += '<div class="list">' + meals.map(mealRow).join('') + quick.map(function (o) { return qRow(o); }).join('') + res.map(function (f) { return row(f); }).join('') + ((sFilter === 'all' || sFilter === 'pack') && !vOnly ? offRows.join('') : '') + '</div>' + (filtered.length > sLimit ? '<button type="button" class="text-btn fd-create" data-more-res>Show ' + Math.min(40, filtered.length - sLimit) + ' more</button>' : '') + (offWait ? '<p class="muted-note off-wait">Looking for packaged foods…</p>' : offErr ? '<button type="button" class="text-btn fd-create" data-off-retry>' + offErr + ' Try again</button>' : '');
        else if (needDB || offWait) html += offWait ? '<p class="muted-note fd-empty">Looking for packaged foods…</p>' : skel(5);
        else html += '<p class="muted-note fd-empty">No matches. Try fewer or simpler words, or Arabic.</p>' + (offErr ? '<button type="button" class="text-btn fd-create" data-off-retry>' + offErr + ' Try again</button>' : '');
        html += '<button type="button" class="text-btn fd-create" data-new-food>Create “' + esc(q.trim().slice(0, 30)) + '” as a food</button>';
      } else if (state.ui.foodTab === 'mine') {
        const mfNew = '<div class="mf-actions mf-bottom' + (pick ? ' one' : '') + '"><button type="button" class="mf-card" data-new-food><span class="mf-ico">+</span><b>New food</b><small>From a label or your own numbers</small></button>' +
          (pick ? '' : '<button type="button" class="mf-card" data-new-recipe><span class="mf-ico">+</span><b>New recipe</b><small>Built from ingredients</small></button><button type="button" class="mf-card" data-new-meal><span class="mf-ico">+</span><b>New meal</b><small>Foods you eat together</small></button>') + '</div>';
        html = '';
        const byName = function (a, b) { return a.name.localeCompare(b.name); };
        const mList = pick ? (pickMeal ? otherMeals() : []) : state.meals;
        if (mList.length) html += section('Meals', sorted(mList.slice().sort(byName), function (m) { return 'm:' + m.id; }, function (m) { return m.name; }, fu).map(mealRow).join(''));
        const rcs = pick && !pickMeal ? [] : state.recipes.slice().sort(byName).map(recipeFood).filter(Boolean);
        const kf = function (f) { return f.id; }, nf = function (f) { return f.name; };
        if (rcs.length) html += section('Recipes', sorted(rcs, kf, nf, fu).map(function (f) { return row(f); }).join(''));
        if (state.myFoods.length) html += section('Foods', sorted(state.myFoods.map(customFood), kf, nf, fu).map(function (f) { return row(f); }).join(''));
        if (!state.myFoods.length && !state.recipes.length && !state.meals.length) html += '<p class="muted-note fd-empty">Create foods and recipes here. To save a whole meal, tap ⋯ next to it in the diary.</p>';
        html += mfNew;
        if (!pick && (state.myFoods.length || state.recipes.length || state.meals.length)) html += '<button type="button" class="text-btn fd-create" data-manage>Edit or delete in You → My foods</button>';
      } else if (state.ui.foodTab === 'favs') {
        const fs = sorted(state.favs.map(getFood).filter(function (f) { return f && !(pick && !pickMeal && f.recipe); }), function (f) { return f.id; }, function (f) { return f.name; }, fu);
        if (fs.length) html = '<div class="list">' + fs.map(function (f) { return row(f); }).join('') + '</div>';
        else html = needDB && state.favs.length ? skel(4) : emptyState(STAR(false), 'No favorites yet', 'Tap the star on a food to keep it here.');
      } else {
        const rows = [], usual = [];
        // Foods you often have at this meal come first.
        if (!pick) {
          const cnt = {}, from = dayNum(todayISO()) - 30;
          Object.keys(state.food).forEach(function (dt) { if (dayNum(dt) >= from) state.food[dt].forEach(function (it) { if (it.meal === ml) { const k = it.ref || ('q|' + it.name + '|' + it.kcal + '|' + it.protein + '|' + it.carbs + '|' + it.fat); cnt[k] = (cnt[k] || 0) + 1; } }); });
          fu.order.filter(function (o) { return cnt[o.key] >= 2; }).sort(function (a, b) { return cnt[b.key] - cnt[a.key]; }).slice(0, 5).forEach(function (o) { usual.push(o.key); });
        }
        const rowFor = function (o) {
          const it = o.item;
          if (it.ref) {
            const f = getFood(it.ref); if (!f || (pick && !pickMeal && f.recipe)) return '';
            const lp = !pick && lastPortion(it.ref, ml), same = !lp || (lp.qty === it.qty && lp.unit === it.unit); // the amount you have at this meal
            return row(f, same ? fmtAmt(it.qty, it.unit) + ' · ' + fmtKcal(it.kcal) + ' kcal' : fmtAmt(lp.qty, lp.unit) + ' · ' + fmtKcal(macrosFor(f, lp.g).kcal) + ' kcal', o.key);
          }
          return pick ? '' : qRow(o);
        };
        usual.length = 0; // the Diary's "Your usual" covers this
        const usualRows = usual.map(function (k) { return rowFor(fu.order.find(function (o) { return o.key === k; })); }).filter(Boolean);
        const mealOfKey = function (k) { return k.indexOf('m:') === 0 ? state.meals.find(function (m) { return 'm:' + m.id === k; }) : null; };
        const pool = pick ? fu.order : fu.all.filter(function (o) { return o.key.indexOf('m:') !== 0 || mealOfKey(o.key); });
        const srt = state.ui.sort, ord = srt === 'recent' ? pool : sorted(pool, function (o) { return o.key; }, function (o) { const sm = mealOfKey(o.key); if (sm) return sm.name; const f = o.item.ref && getFood(o.item.ref); return f ? f.name : o.item.name || ''; }, fu);
        if (srt !== 'recent') usual.length = 0; // "usual for this meal" only with Latest
        ord.forEach(function (o) {
          if (rows.length >= (srt === 'recent' ? 30 : 60) || usual.indexOf(o.key) >= 0) return;
          const it = o.item, sm = mealOfKey(o.key);
          if (sm) { rows.push(mealRow(sm)); return; }
          if (it.ref) { const f = getFood(it.ref); if (f && !(pick && !pickMeal && f.recipe)) rows.push(row(f, null, o.key)); }
          else if (!pick) rows.push(qRow(o));
        });
        const fit = null; // "Fill what's left" removed
        const fitHtml = fit ? '<div class="label faint fd-sec fit-sec">Fill what\'s left · ' + fmtKcal(fit.rk) + ' kcal' + (fit.rp ? ', ' + fit.rp + ' g protein' : '') + '</div><div class="list fit-list">' + fit.items.map(function (c) {
          const sub = c.amt + ' · ' + fmtKcal(c.kcal) + ' kcal · ' + c.p + ' g protein';
          return c.ref ? '<button type="button" class="row fd-row" data-f="' + c.ref + '"' + (c.o ? ' data-o="' + esc(c.key) + '"' : '') + ' data-fit="' + esc(c.key) + '">' + (getFood(c.ref) ? ftIcon(ftKind(getFood(c.ref))) : '') + '<div class="grow"><div class="row-t">' + esc(c.name) + '</div><div class="row-s">' + esc(sub) + '</div></div></button>'
            : '<button type="button" class="row fd-row" data-qr="' + esc(c.key) + '" data-o="' + esc(c.key) + '">' + ftIcon('quick') + '<div class="grow"><div class="row-t">' + esc(c.name) + '</div><div class="row-s">' + esc(sub) + '</div></div><span class="fd-plus">+</span></button>';
        }).join('') + '</div>' : '';
        const pinRows = pick ? [] : state.ui.pins.map(function (k) { const o = fu.order.find(function (x) { return x.key === k; }); if (o) return rowFor(o); const f = REF_RE.test(k) && getFood(k); return f ? row(f, null, null).replace('data-f="', 'data-pin="1" data-f="') : ''; }).filter(Boolean);
        const pinSet = {}; state.ui.pins.forEach(function (k) { pinSet[k] = 1; });
        for (let i = rows.length - 1; i >= 0; i--) { const m = /data-o="([^"]+)"/.exec(rows[i]); if (m && pinSet[m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"')]) rows.splice(i, 1); }
        const pinHtml = pinRows.length ? section('Pinned', pinRows.join('')) : '';
        const hidNote = !pick && state.ui.hide.length ? '<button type="button" class="text-btn hid-note" data-unhide>Show ' + state.ui.hide.length + ' hidden ' + (state.ui.hide.length === 1 ? 'food' : 'foods') + '</button>' : '';
        // Every list gets a header; the sort menu sits on the Recent header.
        const recentSec = function (rowsHtml) { return (pinHtml ? '<div class="label faint fd-sec">Recent</div>' : '') + '<div class="list">' + rowsHtml + '</div>'; };
        if (usualRows.length >= 2) html = pinHtml + section('Usual for ' + mealName(ml), usualRows.join('')) + (rows.length ? recentSec(rows.join('')) : '') + hidNote + fitHtml;
        else if (pinHtml) html = pinHtml + (rows.length || usualRows.length ? recentSec(usualRows.concat(rows).join('')) : '') + hidNote + fitHtml;
        else html = (rows.length || usualRows.length ? recentSec(usualRows.concat(rows).join('')) + hidNote : needDB && fu.order.length ? '<p class="muted-note fd-empty">Loading…</p>' : '') + fitHtml;
        // Adding to a meal: your other meals come first, so one can go in whole.
        if (pickMeal && otherMeals().length) html = section('Meals', otherMeals().slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(mealRow).join('')) + html;
        // Not much here yet: three ways to add something.
        if (!pick && rows.length + usualRows.length + pinRows.length < 6 && !(needDB && fu.order.length)) html += '<div class="af-hint' + (rows.length + usualRows.length + pinRows.length ? '' : ' fd-empty') + '">' +
          '<div><span>' + MF_IC.hi + '</span><b>Search</b><small>Type a food, or "2 eggs"</small></div>' +
          '<div><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7V5h3M17 5h3v2M20 17v2h-3M7 19H4v-2M8 9v6M11 9v6M14 9v6M17 9v6"/></svg></span><b>Scan</b><small>A barcode or a label</small></div>' +
          '<div><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg></span><b>Say it</b><small>Tap the mic and talk</small></div></div>';
      }
      const bar = $('#afBar', root), showSort = !searching && !catSel && html.indexOf('fd-empty') < 0;
      if (bar) { bar.hidden = !showSort; bar.innerHTML = showSort ? '<label class="sort-pick">' + ({ recent: 'Latest', freq: 'Most frequent', az: 'A–Z' })[state.ui.sort] + CHEV + '<select id="afSort" aria-label="Sort"><option value="recent">Latest</option><option value="freq">Most frequent</option><option value="az">A–Z</option></select></label>' : ''; }
      html = html.replace('<div class="fd-sec-row sort-head"><!--SORT--></div>', '');
      box.innerHTML = html;
      if (bar && $('#afSort', bar)) { $('#afSort', bar).value = state.ui.sort; $('#afSort', bar).addEventListener('change', function () { state.ui.sort = this.value; save(); buzz('light'); drawList(); }); }
      box.classList.toggle('multi', multi);
      if (multi) {
        $$('[data-meal]', box).forEach(function (b) { b.disabled = true; });
        $$('[data-f], [data-qr]', box).forEach(function (b) {
          const k = b.dataset.o || 'f:' + b.dataset.f;
          b.setAttribute('aria-pressed', !!picked[k]);
          b.insertAdjacentHTML('afterbegin', '<span class="pk-box" aria-hidden="true">' + (picked[k] ? '✓' : '') + '</span>');
          b.addEventListener('click', function (e) {
            e.stopImmediatePropagation();
            if (picked[k]) delete picked[k]; else picked[k] = { o: b.dataset.o || null, f: b.dataset.f || null };
            b.setAttribute('aria-pressed', !!picked[k]); b.querySelector('.pk-box').textContent = picked[k] ? '✓' : ''; buzz('light'); syncMulti();
          });
        });
      }
      if (!pick && !multi) $$('[data-f], [data-qr]', box).forEach(function (b) {
        let tm = null, x0 = 0, y0 = 0;
        b.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; tm = setTimeout(function () { tm = null; buzz('medium'); const stop = function (ev) { if (ev.target.closest('.pop-menu')) return; ev.stopPropagation(); ev.preventDefault(); }; document.addEventListener('click', stop, true); setTimeout(function () { document.removeEventListener('click', stop, true); }, 400); rowMenu(b); }, 500); });
        b.addEventListener('pointermove', function (e) { if (tm && (Math.abs(e.clientX - x0) > 8 || Math.abs(e.clientY - y0) > 8)) { clearTimeout(tm); tm = null; } });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { b.addEventListener(ev, function () { clearTimeout(tm); tm = null; }); });
      });
      $$('[data-f]', box).forEach(function (b) { b.addEventListener('click', function () {
        const f = getFood(b.dataset.f); if (!f) return; buzz('light');
        if (comparing) { showCompare(comparing, f); return; }
        if (pickRepeat) { repPickFood(f); return; }
        if (q.trim()) { qRemember(q, f.id); const h = q.trim().slice(0, 30); state.ui.qhist = [h].concat(state.ui.qhist.filter(function (x) { return x.toLowerCase() !== h.toLowerCase(); })).slice(0, 8); }
        const o = b.dataset.fit && b.dataset.o && fu.order.find(function (x) { return x.key === b.dataset.o; });
        // An amount typed in the search ("150 g", "2", "a cup") is filled in for you.
        const sa = !o && q.trim() && q.indexOf(',') < 0 ? splitAmt(q.trim()) : null, am = sa && amountFor(f, sa[0], sa[1]);
        showServe(f, null, o ? { qty: o.item.qty, unit: o.item.unit, g: o.item.g } : am ? { qty: am.qty, unit: am.unit.label, g: am.g } : null);
      }); });
      $$('[data-meal]', box).forEach(function (b) { b.addEventListener('click', function () { const m = state.meals.find(function (x) { return x.id === b.dataset.meal; }); if (m) { if (pickMeal) return addMealInto(m); buzz('light'); if (pickRepeat) addItems(d, [mealEntry(m, ml)]); else showMeal(m); } }); });
      $$('[data-unhide]', box).forEach(function (b) { b.addEventListener('click', function () { state.ui.hide = []; save(); buzz('light'); drawList(); }); });
      $$('[data-sver]', box).forEach(function (b) { b.addEventListener('click', function () { state.ui.sver = !state.ui.sver; save(); sLimit = 40; buzz('light'); drawList(); }); });
      $$('[data-scope-all]', box).forEach(function (b) { b.addEventListener('click', function () { state.ui.foodTab = 'recent'; save(); $$('#afTabs button', root).forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === 'recent'); }); buzz('light'); drawList(); }); });
      $$('[data-sf]', box).forEach(function (b) { b.addEventListener('click', function () { sFilter = b.dataset.sf; sLimit = 40; buzz('light'); drawList(); }); });
      $$('[data-more-res]', box).forEach(function (b) { b.addEventListener('click', function () { sLimit += 40; buzz('light'); drawList(); }); });
      $$('[data-dym]', box).forEach(function (b) { b.addEventListener('click', function () { q = b.dataset.dym; const i = $('#afQ', root); if (i) i.value = q; buzz('light'); drawList(); }); });
      $$('[data-qh]', box).forEach(function (b) { b.addEventListener('click', function () {
        q = b.dataset.qh; const i = $('#afQ', root); if (i) i.value = q; buzz('light');
        const mem = qMemFor(q), top = Object.keys(mem).sort(function (a, c) { return mem[c] - mem[a]; })[0], f = top && getFood(top);
        if (f) showServe(f); else drawList();
      }); });
      $$('[data-cat]', box).forEach(function (b) { b.addEventListener('click', function () { catSel = b.dataset.cat; buzz('light'); drawList(); const sh = box.closest('.sheet'); if (sh) sh.scrollTop = 0; }); });
      $$('[data-cat-x]', box).forEach(function (b) { b.addEventListener('click', function () { catSel = null; buzz('light'); drawList(); }); });
      $$('[data-qh-clear]', box).forEach(function (b) { b.addEventListener('click', function () { state.ui.qhist = []; save(); buzz('light'); drawList(); }); });
      $$('[data-qk]', box).forEach(function (b) { b.addEventListener('click', function () { const snap = snapshot(); addItems(d, [{ id: newId(), name: 'Quick add', kcal: +b.dataset.qk, protein: 0, carbs: 0, fat: 0, meal: ml }]); logged('Added to ' + mealName(ml), snap); q = ''; const i = $('#afQ', root); if (i) i.value = ''; drawList(); }); });
      $$('[data-menu]', box).forEach(function (b) { b.addEventListener('click', function () { const p = places().find(function (x) { return x.name === b.dataset.menu; }); if (p) { buzz('light'); showMenu(p); } }); });
      $$('[data-off-retry]', box).forEach(function (b) { b.addEventListener('click', function () { buzz('light'); offSearch(); }); });
      $$('[data-new-food]', box).forEach(function (b) { b.addEventListener('click', function () { showCreate(null, q.trim()); }); });
      $$('[data-manage]', box).forEach(function (b) { b.addEventListener('click', function () { closeSheet(); showTab('foods'); }); });
      $$('[data-new-meal]', box).forEach(function (b) { b.addEventListener('click', function () { buzz('light'); showMealEdit({ id: null, name: '', items: [] }); }); });
      $$('[data-new-recipe]', box).forEach(function (b) { b.addEventListener('click', function () { draft = { name: q.trim().slice(0, 60), servings: 1, cookedG: null, items: [] }; showRecipe(); }); });
      $$('[data-code]', box).forEach(function (b) { b.addEventListener('click', function () { showScan(b.dataset.code); }); });
      if ($('#pmGo', box)) $('#pmGo', box).addEventListener('click', function () {
        const its = (parseMeal(q) || []).filter(function (x) { return x.f; }); if (!its.length) return;
        const snap = snapshot();
        addItems(d, its.map(function (x) { return { id: newId(), ref: x.f.id, g: x.g, qty: x.qty, unit: x.unit, kcal: Math.min(x.m.kcal, 10000), protein: x.m.protein, carbs: x.m.carbs, fat: x.m.fat, name: x.f.name.slice(0, 80), meal: ml }; }));
        added += its.length - 1; logged('Added ' + its.length + ' to ' + mealName(ml), snap); q = ''; closeSheet();
      });
      $$('[data-offr]', box).forEach(function (b) { b.addEventListener('click', function () {
        const o = offRes.list[+b.dataset.offr]; if (!o) return;
        state.offFoods = [o].concat(state.offFoods.filter(function (x) { return x.code !== o.code; })).slice(0, 300); save(); buzz('light'); if (pickRepeat) repPickFood(offFood(o)); else showServe(offFood(o));
      }); });
      $$('[data-qr]', box).forEach(function (b) {
        b.addEventListener('click', function () {
          const o = fu.order.find(function (x) { return x.key === b.dataset.qr; }); if (!o) return;
          const it = o.item, snap = snapshot();
          addItems(d, [{ id: newId(), kcal: it.kcal, protein: it.protein, carbs: it.carbs, fat: it.fat, name: it.name, meal: ml }]);
          logged('Added to ' + mealName(ml), snap); refreshHead();
        });
      });
    }
    // Hold a food: pin it to the top of Recent, or hide it from Recent (it stays everywhere else).
    function rowMenu(b) {
      const k = b.dataset.o || b.dataset.f, pinned = state.ui.pins.indexOf(k) >= 0, hidden = state.ui.hide.indexOf(k) >= 0;
      popMenu(b, [
        { label: pinned ? 'Unpin' : 'Pin to the top', run: function () { state.ui.pins = pinned ? state.ui.pins.filter(function (x) { return x !== k; }) : [k].concat(state.ui.pins.filter(function (x) { return x !== k; })).slice(0, 30); state.ui.hide = state.ui.hide.filter(function (x) { return x !== k; }); save(); toast(pinned ? 'Unpinned' : 'Pinned to the top'); drawList(); } },
        { label: hidden ? 'Show in Recent' : 'Hide from Recent', run: function () { state.ui.hide = hidden ? state.ui.hide.filter(function (x) { return x !== k; }) : [k].concat(state.ui.hide).slice(0, 400); state.ui.pins = state.ui.pins.filter(function (x) { return x !== k; }); save(); toast(hidden ? 'Back in Recent' : 'Hidden from Recent'); drawList(); } }
      ]);
    }
    function setMulti(on) { multi = on; picked = {}; buzz('light'); const b = $('#afSel', root); if (b) b.setAttribute('aria-pressed', on); drawList(); syncMulti(); }
    function syncMulti() {
      const bar = $('#afMulti', root); if (!bar) return;
      // Only an Add button, and only once something is ticked. Tap the select icon again to stop.
      const n = Object.keys(picked).length; bar.hidden = !multi || !n;
      if (n) { const kc = Object.keys(picked).map(pickedItem).filter(Boolean).reduce(function (a, x) { return a + x.kcal; }, 0); $('#afMGo', root).textContent = 'Add ' + n + ' to ' + mealName(ml) + ' · ' + fmtKcal(kc) + ' kcal'; }
    }
    // What a picked row adds: the amount you had last time, or a normal serving.
    function pickedItem(k) {
      const fu = foodUse(), o = picked[k].o && fu.order.find(function (x) { return x.key === picked[k].o; });
      if (o && !o.item.ref) return { kcal: o.item.kcal, protein: o.item.protein, carbs: o.item.carbs, fat: o.item.fat, name: o.item.name };
      const f = getFood(picked[k].f || (o && o.item.ref)); if (!f) return null;
      let amt;
      if (o && o.item.ref) amt = { g: o.item.g, qty: o.item.qty, unit: o.item.unit };
      else { const lp = lastPortion(f.id, ml), lu = lp && unitsFor(f).find(function (u) { return u.label === lp.unit; }); if (lu) amt = { g: Math.round(lp.qty * lu.g * 10) / 10, qty: lp.qty, unit: lp.unit }; else { const s0 = defaultServing(f); amt = { g: Math.round(s0.qty * s0.unit.g * 10) / 10, qty: s0.qty, unit: s0.unit.label }; } }
      const m = macrosFor(f, amt.g);
      return Object.assign({ kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat, name: f.name.slice(0, 80), ref: f.id }, amt);
    }
    function addPicked() {
      const its = Object.keys(picked).map(pickedItem).filter(Boolean);
      if (!its.length) return;
      const snap = snapshot();
      addItems(d, its.map(function (it) { return Object.assign({ id: newId(), meal: ml }, it); }));
      added += its.length - 1; logged('Added ' + its.length + ' to ' + mealName(ml), snap);
      multi = false; picked = {}; closeSheet();
    }
    function refreshHead() { const l = $('#afDay', root); if (l) l.textContent = relDate(d) + (added ? ' · ' + added + ' added' : ''); }

    // ----- serving: how much, which meal (or, while picking, how much goes in the recipe) -----
    function showServe(f, item, preset) {
      leave();
      const units = unitsFor(f), forRecipe = pick, editing = !!item;
      let qty, unit;
      if (preset) { unit = units.find(function (u) { return u.label === preset.unit; }) || null; qty = preset.qty; if (!unit) { unit = units.find(function (u) { return u.label === 'g'; }) || units[0]; qty = preset.g / unit.g; } }
      else if (item) { unit = units.find(function (u) { return u.label === item.unit; }) || null; qty = item.qty; if (!unit) { unit = units.find(function (u) { return u.label === 'g'; }) || units[0]; qty = item.g / unit.g; } }
      else { const lp = (!pick || pickMeal) && lastPortion(f.id, pick ? null : ml), lu = lp && units.find(function (u) { return u.label === lp.unit; }); if (lu) { unit = lu; qty = lp.qty; } else { const s0 = defaultServing(f); qty = s0.qty; unit = units.find(function (u) { return u.label === s0.unit.label; }) || units[0]; } }
      // Replacing an ingredient: start from the same weight as the one it replaces.
      if (!item && pick && replaceAt != null && draft.items[replaceAt]) { const gu = units.find(function (u) { return u.label === 'g'; }); if (gu) { unit = gu; qty = Math.round(draft.items[replaceAt].g); } }
      const src = srcBadge(f) + (f.est ? 'Typical values for this product · check the pack' : f.off || f.cat === 'Packaged foods' ? 'From the product label (Open Food Facts)' : f.cat === 'Restaurants (estimate)' ? 'Estimate for a typical serving' : f.recipe ? 'Recipe · ' + (state.recipes.find(function (x) { return x.id === f.id; }) || { items: [] }).items.length + ' ingredients' + (f.missing ? ' (some missing)' : '') + (f.rawG ? '. Grams are by raw ingredient weight; add the cooked weight to the recipe for exact grams.' : '') : f.custom ? 'Your own numbers' : f.cat === 'Egyptian dishes' ? 'Egyptian dish · estimate from a typical recipe' : f.cat === 'Dishes (estimate)' ? 'Estimate from a typical recipe' : esc(f.cat) + (f.src === 'fndds' ? ' · USDA, as eaten' : ' · USDA, lab analysis'));
      root.innerHTML = head(editing ? (forRecipe ? 'Ingredient' : editTitle(d)) : (forRecipe ? 'How much goes in?' : 'How much?'), edit && !forRecipe ? 'x' : true, '<button type="button" class="icon-btn fd-fav" id="svFav" aria-pressed="' + isFav(f.id) + '" aria-label="Favorite">' + STAR(isFav(f.id)) + '</button>' + '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>', forRecipe) +
        '<div class="sv-name">' + esc(f.name) + (isVerified(f) ? VER_IC : '') + '</div>' +
        (editing && !forRecipe ? '<div class="label faint fd-sec">How much you had</div>' : '') +
        '<div class="sv-amt"><div class="field"><input class="input" id="svQ" ' + (state.settings.numpad ? 'inputmode="none" readonly' : 'inputmode="decimal" enterkeyhint="done"') + ' autocomplete="off" aria-label="Amount" value="' + fmtQty(qty) + '" /></div>' +
        '<div class="field"><select class="input" id="svU" aria-label="Unit">' + units.map(function (u, i) { return '<option value="' + i + '"' + (u === unit ? ' selected' : '') + '>' + esc(u.label) + (u.label === 'g' || u.label === 'oz' || f.noG ? '' : ' (' + fmtQty(Math.round(u.g * 10) / 10) + ' g)') + '</option>'; }).join('') + '</select></div></div>' +
        (!state.settings.numpad ? '' : '<div class="kp" id="svKp"><div class="kp-quick" id="kpQ"></div>' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(function (k) { return '<button type="button" data-k="' + k + '"' + (k === '⌫' ? ' aria-label="Delete"' : '') + '>' + k + '</button>'; }).join('') + '</div>') +
        '<div class="sv-portion" id="svPortion"></div>' +
        '<div class="sv-sum" id="svSum"></div>' +
        '<div class="nut-drop" id="svNuts" hidden></div>' +
        '<div class="sv-key" id="svKey"></div>' +

        '<p class="form-error" id="svErr" hidden></p>' +
        '<div class="menu-src" hidden>' + (forRecipe && editing && !pickMeal ? '<button type="button" id="svReplace">Replace with another food</button>' : '') + '<span id="svMenuDyn"></span>' + (!forRecipe ? '<button type="button" id="svCmp">Compare with another food</button>' : '') + (editing ? '<button type="button" class="danger" id="svDel">' + (forRecipe ? 'Remove from recipe' : 'Delete') + '</button>' : '') + '</div>' +
        (editing && !forRecipe ? notePicHtml(item) : '') +
        (src ? '<p class="muted-note sv-src">' + src + '</p>' : '') +
        '<div class="sheet-foot">' + (editing ? '<button type="button" class="btn primary block" id="svAdd">' + (forRecipe ? 'Done' : 'Save') + '</button>'
          : '<button type="button" class="btn primary block" id="svAdd">' + (forRecipe ? (replaceAt != null ? 'Replace' : 'Add to recipe') : pickRepeat ? 'Next<span id="svMealName" hidden></span>' : 'Add to <span id="svMealName"></span>') + '</button>') + '</div>';
      const Q = $('#svQ', root), U = $('#svU', root);
      const grams = function () { const n = parseNum(Q.value); return isNaN(n) || n <= 0 ? NaN : n * units[+U.value].g; };
      // "Save this amount as a portion" (or remove one of yours).
      const portionUI = function (open) {
        const box = $('#svPortion', root), u = units[+U.value];
        if (open) {
          box.innerHTML = '<div class="pt-form"><input class="input" id="ptN" maxlength="24" placeholder="Name, like my bowl" aria-label="Portion name" autocomplete="off" /><button type="button" class="btn primary" id="ptSave">Save</button></div>';
          $('#ptN', box).focus();
          $('#ptSave', box).addEventListener('click', function () {
            const nm = $('#ptN', box).value.trim(), g = grams();
            if (!nm || isNaN(g)) { toast(!nm ? 'Give it a name' : 'Enter an amount first'); buzz('warn'); return; }
            const list = (state.portions[f.id] || []).filter(function (x) { return x.l !== nm; }); list.push({ l: nm.slice(0, 24), g: Math.round(g * 10) / 10 });
            state.portions[f.id] = list.slice(-8); save(); buzz('success'); toast('Saved “' + nm + '” · ' + fmtQty(Math.round(g)) + ' g');
            showServe(f, item, { qty: 1, unit: nm, g: g });
          });
          return;
        }
        box.innerHTML = '';
        const dyn = $('#svMenuDyn', root); if (!dyn) return;
        dyn.innerHTML = u && u.mine ? '<button type="button" id="ptDel">Remove portion “' + esc(u.label) + '”</button>' : '<button type="button" id="ptAdd">Save this amount as a portion</button>';
        if ($('#ptAdd', dyn)) $('#ptAdd', dyn).addEventListener('click', function () { portionUI(true); });
        if ($('#ptDel', dyn)) $('#ptDel', dyn).addEventListener('click', function () {
          const g = grams(); state.portions[f.id] = (state.portions[f.id] || []).filter(function (x) { return x.l !== u.label; }); if (!state.portions[f.id].length) delete state.portions[f.id];
          save(); buzz('light'); showServe(f, item, { qty: Math.round(g), unit: 'g', g: g });
        });
      };
      let svNutRedraw = null;
      const draw = function () {
        portionUI(false);
        const g = grams();
        const mm = isNaN(g) ? null : macrosFor(f, g);
        $('#svSum', root).innerHTML = sumBox(mm, editing && !forRecipe ? 'you had' : null) + SUM_MORE;
        const kv = [['fib', 'Fiber', 'g'], ['sug', 'Sugars', 'g'], ['sat', 'Sat. fat', 'g'], ['na', 'Sodium', 'mg']].map(function (x) { const v = per100(f, x[0]); return { l: x[1], u: x[2], v: v == null || isNaN(g) ? null : v * g / 100 }; });
        const ky = $('#svKey', root);
        ky.innerHTML = kv.filter(function (x) { return x.v != null; }).length >= 2 ? kv.map(function (x) { return '<div><b class="num">' + (x.v == null ? '–' : fmtNut(x.v, x.u).replace(' ' + x.u, '')) + '<small>' + (x.v == null ? '' : x.u) + '</small></b><span>' + x.l + '</span></div>'; }).join('') : '';
        ky.hidden = !ky.innerHTML;
        const mn = $('#svMealName', root); if (mn) mn.textContent = mealName(ml);
        if (svNutRedraw) svNutRedraw();
      };
      svNutRedraw = nutToggle($('#svSum', root), $('#svNuts', root), function () { const g = grams(); return isNaN(g) ? {} : foodTot(f, g); });
      draw();
      draw();
      Q.addEventListener('input', draw);
      U.addEventListener('change', function () {
        // Keep roughly the same amount when switching units (e.g. 1 cup → 136 g).
        const prev = unit, n = parseNum(Q.value); unit = units[+U.value];
        if (!isNaN(n) && n > 0) { const g = n * prev.g, nq = g / unit.g; Q.value = fmtQty(unit.label === 'g' ? Math.round(nq) : Math.round(nq * 4) / 4 || Math.round(nq * 100) / 100); }
        draw();
      });
      // The number pad: the first key replaces the amount, then keys add on. Quick picks for common amounts.
      let fresh = true;
      const setQ = function (v) { Q.value = v; Q.dispatchEvent(new Event('input')); };
      const quick = function () { const u = units[+U.value]; $('#kpQ', root).innerHTML = (u.label === 'g' ? [50, 100, 150, 200, 250] : u.label === 'oz' ? [1, 2, 4, 6, 8] : [0.5, 1, 1.5, 2, 3]).map(function (v) { return '<button type="button" data-kq="' + v + '">' + (v === 0.5 ? '½' : v === 1.5 ? '1½' : v) + '</button>'; }).join(''); };
      if ($('#svKp', root)) { quick(); U.addEventListener('change', function () { quick(); fresh = true; }); }
      if ($('#svKp', root)) $('#svKp', root).addEventListener('click', function (e) {
        const q2 = e.target.closest('[data-kq]'), k = e.target.closest('[data-k]');
        if (q2) { buzz('light'); setQ(q2.dataset.kq); fresh = true; return; }
        if (!k) return; buzz('light'); let v = fresh ? '' : Q.value; fresh = false;
        if (k.dataset.k === '⌫') v = v.slice(0, -1); else if (k.dataset.k === '.') { if (v.indexOf('.') < 0) v = (v || '0') + '.'; } else if (v.replace('.', '').length < 6) v = v === '0' ? k.dataset.k : v + k.dataset.k;
        setQ(v);
      });
      Q.addEventListener('focus', function () { fresh = true; if (!state.settings.numpad) Q.select(); });
      Q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#svAdd', root).click(); } });
      if (!forRecipe) bindMeal(draw);
      if (editing && !forRecipe && $('#npPic', root)) bindNotePic(root, item);
      $('#afBack', root).addEventListener('click', function () { if (forRecipe && editing) { if (pickMeal) { pick = false; pickMeal = false; showMealEdit(); } else showRecipe(); } else if (edit && !pick) closeSheet(); else showList(); });
      $('#svFav', root).addEventListener('click', function () {
        const on = !isFav(f.id);
        if (on) state.favs.unshift(f.id); else state.favs = state.favs.filter(function (x) { return x !== f.id; });
        save(); buzz('light'); this.setAttribute('aria-pressed', on); this.innerHTML = STAR(on);
        toast(on ? 'Added to Favorites' : 'Removed from Favorites');
      });
      $('#svAdd', root).addEventListener('click', function () {
        const g = grams(), n = parseNum(Q.value);
        if (isNaN(g) || g > 20000 || n > 10000) { const x = $('#svErr', root); x.textContent = 'Enter an amount'; x.hidden = false; buzz('warn'); Q.focus(); return; }
        const u = units[+U.value], amt = { ref: f.id, g: Math.round(g * 10) / 10, qty: Math.round(n * 1000) / 1000, unit: u.label };
        if (forRecipe && pickMeal) {
          // a food in a meal keeps its calories and macros for that amount
          const mm2 = macrosFor(f, g), fields2 = Object.assign({ name: f.name.slice(0, 80), kcal: Math.min(mm2.kcal, 10000), protein: mm2.protein, carbs: mm2.carbs, fat: mm2.fat }, amt);
          if (editing) Object.assign(item, fields2); else mealDraft.items.push(fields2);
          buzz('success'); pick = false; pickMeal = false; showMealEdit(); return;
        }
        if (forRecipe) {
          if (editing) Object.assign(item, amt);
          else if (replaceAt != null && draft.items[replaceAt]) { draft.items[replaceAt] = Object.assign({ name: f.name.slice(0, 80) }, amt); replaceAt = null; }
          else draft.items.push(Object.assign({ name: f.name.slice(0, 80) }, amt));
          buzz('success'); pick = false; showRecipe(); return;
        }
        if (pickRepeat) { const mr = macrosFor(f, g); closeSheet(); setTimeout(function () { repeatSheet({ item: Object.assign({ kcal: Math.min(mr.kcal, 10000), protein: mr.protein, carbs: mr.carbs, fat: mr.fat, name: f.name.slice(0, 80) }, amt), meal: ml, days: [] }); }, 260); return; }
        const m = macrosFor(f, g), snap = snapshot();
        const fields = Object.assign({ kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat, name: f.name.slice(0, 80), meal: ml }, amt);
        if (item) {
          Object.assign(item, fields); readNote(root, item); save(); renderAll(); closeSheet(); buzz('success'); toast('Saved', function () { restore(snap); });
          return;
        }
        addItems(d, [Object.assign({ id: newId() }, fields)]);
        logged('Added to ' + mealName(ml), snap);
        showList();
      });
      if ($('#svReplace', root)) $('#svReplace', root).addEventListener('click', function () { replaceAt = draft.items.indexOf(item); q = ''; buzz('light'); showList(); });
      if ($('#svCmp', root)) $('#svCmp', root).addEventListener('click', function () { comparing = { f: f, g: grams() }; q = ''; showList(); });
      if (editing) $('#svDel', root).addEventListener('click', function () {
        if (forRecipe && pickMeal) { mealDraft.items = mealDraft.items.filter(function (x) { return x !== item; }); pick = false; pickMeal = false; buzz('medium'); showMealEdit(); return; }
        if (forRecipe) { draft.items = draft.items.filter(function (x) { return x !== item; }); buzz('medium'); showRecipe(); return; }
        const snap = snapshot();
        state.food[d] = foodFor(d).filter(function (x) { return x.id !== item.id; });
        if (!state.food[d].length) delete state.food[d];
        save(); renderAll(); closeSheet(); buzz('medium'); toast('Removed', function () { restore(snap); });
      });
    }

    // ----- barcode: camera, or type the number -----
    function showScan(code) {
      leave();
      root.innerHTML = head('Scan barcode', true, '<button type="button" class="text-btn" id="scMany" style="margin:0" aria-pressed="' + !!scanTray + '">' + (scanTray ? 'One at a time' : 'Scan several') + '</button>', true) +
        (scanTray ? '<div class="sc-tray" id="scTray"></div>' : '') +
        '<div class="scan-box" id="scBox"><video id="scV" playsinline muted autoplay></video><span class="scan-frame"></span></div>' +
        '<p class="muted-note scan-msg" id="scMsg">Point the camera at the barcode</p>' +
        '<button type="button" class="text-btn sc-pic" id="scPic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8.5"/></svg>Choose a photo of the barcode</button><input type="file" id="scPicF" accept="image/*" hidden />' +
        '<div class="sv-amt" style="grid-template-columns:1fr auto"><div class="field"><input class="input" id="scCode" inputmode="numeric" maxlength="14" autocomplete="off" placeholder="Or type the number" aria-label="Barcode number" /></div>' +
        '<button type="button" class="btn soft" id="scGo" style="height:50px">Look up</button></div>' +
        '<div id="scRes"></div>' +
        '<button type="button" class="text-btn fd-create" id="scMenu">Scan a menu or receipt instead</button><input type="file" id="scMenuF" accept="image/*" hidden />' +
        '<p class="muted-note sv-src">Product data from Open Food Facts</p>';
      $('#afBack', root).addEventListener('click', function () { scanTray = null; showList(); });
      $('#scMenu', root).addEventListener('click', function () { $('#scMenuF', root).click(); });
      $('#scMenuF', root).addEventListener('change', function () {
        const file = this.files && this.files[0]; this.value = ''; if (!file) return;
        leave(); const b = $('#scMenu', root); b.disabled = true; b.textContent = 'Reading the photo…';
        loadTess().then(function (T) { return T.recognize(file, 'eng+ara'); }).then(function (r) {
          const items = menuLines((r && r.data && r.data.text) || '');
          if (!items.length) { b.disabled = false; b.textContent = 'Scan a menu or receipt instead'; toast('Couldn\'t find any foods in that photo'); buzz('warn'); return; }
          // The list goes into search, where "Add all at once" matches each line to a food.
          q = items.join(', '); scanTray = null; showList(); const inp = $('#afQ', root); if (inp) inp.value = q; drawList(); buzz('success');
        }, function () { b.disabled = false; b.textContent = 'Scan a menu or receipt instead'; toast(navigator.onLine === false ? 'Reading photos needs the internet the first time.' : 'Couldn\'t read the photo.'); buzz('warn'); });
      });
      const msg = function (t) { const m = $('#scMsg', root); if (m) m.textContent = t; };
      const C = $('#scCode', root);
      $('#scMany', root).addEventListener('click', function () { scanTray = scanTray ? null : []; buzz('light'); showScan(); });
      // Several in a row: each product goes on a tray (at your last portion), then add them all.
      const drawTray = function () {
        const t = $('#scTray', root); if (!t) return;
        t.innerHTML = scanTray.length ? '<div class="list">' + scanTray.map(function (x, i) { return '<div class="row fd-row"><div class="grow"><div class="row-t">' + esc(x.name) + '</div><div class="row-s">' + fmtAmt(x.qty, x.unit) + ' · ' + fmtKcal(x.kcal) + ' kcal</div></div><button type="button" class="icon-btn me-rm" data-trx="' + i + '" aria-label="Remove">' + TRASH + '</button></div>'; }).join('') + '</div><button type="button" class="btn primary block" id="scAddAll">Add ' + scanTray.length + ' to ' + mealName(ml) + '</button>' : '<p class="muted-note fd-empty">Scan products one after another. They collect here.</p>';
        $$('[data-trx]', t).forEach(function (b) { b.addEventListener('click', function () { scanTray.splice(+b.dataset.trx, 1); drawTray(); }); });
        if ($('#scAddAll', t)) $('#scAddAll', t).addEventListener('click', function () { const snap = snapshot(), its = scanTray.map(function (x) { return Object.assign({ id: newId(), meal: ml }, x); }); addItems(d, its); scanTray = null; added += its.length - 1; logged('Added ' + its.length + ' to ' + mealName(ml), snap); closeSheet(); });
      };
      const toTray = function (c) {
        msg('Looking up ' + c + '…');
        lookupBarcode(c).then(function (r) {
          if (!root.isConnected || !scanTray) return;
          if (!r.food) { msg('Not found: ' + c + '. Keep scanning, or add it later.'); buzz('warn'); return; }
          const f = r.food, lp = lastPortion(f.id), us = unitsFor(f), lu = lp && us.find(function (u) { return u.label === lp.unit; }), s0 = defaultServing(f);
          const qty = lu ? lp.qty : s0.qty, unit = lu || s0.unit, g = Math.round(qty * unit.g * 10) / 10, m = macrosFor(f, g);
          scanTray.push({ ref: f.id, name: f.name.slice(0, 80), g: g, qty: qty, unit: unit.label, kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat });
          buzz('success'); msg('Added ' + f.name + '. Scan the next one.'); drawTray();
        }, function () { msg('Couldn\'t reach Open Food Facts. Check your connection.'); });
      };
      if (scanTray) drawTray();
      const find = function (c) {
        c = String(c).replace(/\D/g, '');
        if (!validBarcode(c)) { msg('That doesn\'t look like a full barcode. Check the number.'); buzz('warn'); return; }
        if (scanTray) { C.value = ''; toTray(c); return; }
        leave(); C.value = c; $('#scBox', root).hidden = true; msg('Looking up ' + c + '…'); $('#scRes', root).innerHTML = '';
        lookupBarcode(c).then(function (r) {
          if (!root.isConnected || !$('#scRes', root)) return;
          if (r.food) { buzz('success'); showServe(r.food); return; }
          msg('');
          $('#scRes', root).innerHTML = '<p class="muted-note fd-empty">' + (r.name ? '“' + esc(r.name) + '” is in Open Food Facts, but without nutrition facts.' : 'This product isn\'t in Open Food Facts yet.') + ' Add it from the label and it will be found next time.</p>' +
            '<button type="button" class="btn primary block" id="scLabel">Scan the label</button><button type="button" class="text-btn fd-create" id="scNew">Type it in instead</button>';
          $('#scNew', root).addEventListener('click', function () { showCreate(null, r.name || '', null, c); });
          $('#scLabel', root).addEventListener('click', function () { showCreate(null, r.name || '', null, c); const f = $('#cfImg', root); if (f) f.click(); });
        }, function () { if (root.isConnected) msg('Couldn\'t reach Open Food Facts. Check your connection and try again.'); });
      };
      $('#scGo', root).addEventListener('click', function () { find(C.value); });
      $('#scPic', root).addEventListener('click', function () { $('#scPicF', root).click(); });
      $('#scPicF', root).addEventListener('change', function () {
        const file = this.files && this.files[0]; this.value = ''; if (!file) return;
        msg('Reading the barcode…');
        decodeBarcodeFile(file).then(function (c) {
          if (!root.isConnected) return;
          if (c && validBarcode(c)) { beep(); find(c); }
          else { msg('Couldn\'t find a barcode in that photo. Try a closer, sharper one, or type the number.'); buzz('warn'); }
        });
      });
      C.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); find(C.value); } });
      if (code) { $('#scBox', root).hidden = true; find(code); return; }
      primeBeep();
      startCamera($('#scV', root), find, msg, !!scanTray).then(function (stop) {
        if (stop) {
          if (root.isConnected && $('#scV', root)) {
            stopScan = stop;
            if (stop.torch) { let on = false; $('#scBox', root).insertAdjacentHTML('beforeend', '<button type="button" class="sc-torch" id="scTorch" aria-pressed="false" aria-label="Flashlight">' + TORCH_IC + '</button>'); $('#scTorch', root).addEventListener('click', function () { on = !on; stop.torch(on).catch(function () {}); this.setAttribute('aria-pressed', on); buzz('light'); }); }
          } else stop();
        }
        else if ($('#scBox', root)) $('#scBox', root).hidden = true; // no camera: just the number field
      });
    }

    // ----- a meal: add all of it -----
    function showMeal(mm) {
      leave();
      root.innerHTML = head('Meal', true) + '<div class="sv-name">' + esc(mm.name) + '</div>' +
        '<div class="list">' + mm.items.map(function (it) { return '<div class="row fd-row"><div class="grow"><div class="row-t">' + esc(it.name || 'Quick add') + '</div><div class="row-s">' + (it.ref ? fmtAmt(it.qty, it.unit) + ' · ' : '') + fmtKcal(it.kcal) + ' kcal</div></div></div>'; }).join('') + '</div>' +
        '<div class="sv-sum">' + sumBox(mm.items.reduce(function (a, f) { return { kcal: a.kcal + f.kcal, protein: a.protein + f.protein, carbs: a.carbs + f.carbs, fat: a.fat + f.fat }; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })) + '</div>' +
        '<div class="sheet-foot"><div class="btn-row"><button type="button" class="btn danger icon-only" id="smDel" aria-label="Delete meal">' + TRASH + '</button><button type="button" class="btn primary" id="smAdd">Add to <span id="smName"></span></button></div></div>';
      const nm = function () { $('#smName', root).textContent = mealName(ml); };
      nm(); bindMeal(nm);
      $('#afBack', root).addEventListener('click', showList);
      $('#smAdd', root).addEventListener('click', function () {
        const snap = snapshot();
        if (state.settings.explode) addItems(d, mm.items.map(function (it) { return Object.assign({}, it, { id: newId(), meal: ml }); }));
        else addItems(d, [mealEntry(mm, ml)]);
        logged('Added ' + mm.name, snap); showList();
      });
      $('#smDel', root).addEventListener('click', function () {
        const snap = snapshot();
        state.meals = state.meals.filter(function (x) { return x.id !== mm.id; });
        save(); buzz('medium'); toast('Meal deleted', function () { restore(snap); }); showList();
      });
    }

    // A meal as one diary entry: its totals, plus its vitamins and minerals added up.
    function mealEntry(mm, meal) {
      const t = mealSum(mm.items), n = {};
      mm.items.forEach(function (it) { const v = itemNutrients(it); if (!v) return; NUTS.forEach(function (x) { const k = x[0]; if (v[k] != null) n[k] = (n[k] || 0) + v[k]; }); });
      Object.keys(n).forEach(function (k) { n[k] = Math.round(n[k] * 1000) / 1000; });
      const e = { id: newId(), name: mm.name, meal: meal, mid: mm.id, mi: mm.items.map(function (it) { const c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan; return c; }), kcal: Math.min(10000, Math.round(t.kcal)), protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat) };
      if (Object.keys(n).length) e.n = n;
      return e;
    }
    // A restaurant's whole menu: tick what you had, add it all at once.
    function showMenu(pl) {
      leave();
      const its0 = pl.items.slice().sort(function (a, b) { return (isFav(b.id) ? 1 : 0) - (isFav(a.id) ? 1 : 0); });
      pl = { name: pl.name, items: its0 };
      const sel = {}, sv = pl.items.map(function (f) { const s0 = defaultServing(f), g = s0.qty * s0.unit.g; return { s: s0, g: g, m: macrosFor(f, g) }; });
      root.innerHTML = head(esc(pl.name), true) +
        '<div class="list">' + pl.items.map(function (f, i) { return '<div class="row fd-row mn-row"><button type="button" class="mn-tick" data-tk="' + i + '" aria-pressed="false" aria-label="Select"></button><button type="button" class="grow mn-open" data-mo="' + i + '"><div class="row-t">' + esc(f.name.split(' · ')[0]) + '</div><div class="row-s">' + esc(fmtAmt(sv[i].s.qty, sv[i].s.unit.label)) + ' · ' + fmtKcal(sv[i].m.kcal) + ' kcal · ' + sv[i].m.protein + ' g protein</div></button><span class="mn-qty" data-qi="' + i + '" hidden><button type="button" data-qd="-1" aria-label="One less">−</button><b class="num">1</b><button type="button" data-qd="1" aria-label="One more">+</button></span><button type="button" class="icon-btn mn-star" data-st="' + i + '" aria-pressed="' + isFav(f.id) + '" aria-label="Favorite">' + STAR(isFav(f.id)) + '</button></div>'; }).join('') + '</div>' +
        '<p class="muted-note sv-src">Estimates for a typical serving.</p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="mnAdd" disabled>Tick what you had</button></div>';
      const upd = function () {
        const ks = Object.keys(sel), b = $('#mnAdd', root), kc = ks.reduce(function (a, i) { return a + sv[i].m.kcal * sel[i]; }, 0), n = ks.reduce(function (a, i) { return a + sel[i]; }, 0);
        b.disabled = !ks.length; b.textContent = ks.length ? 'Add ' + n + ' to ' + mealName(ml) + ' · ' + fmtKcal(kc) + ' kcal' : 'Tick what you had';
        $$('[data-qi]', root).forEach(function (q) { const i = q.dataset.qi; q.hidden = !sel[i]; if (sel[i]) q.querySelector('b').textContent = sel[i]; const st = q.nextElementSibling; if (st) st.hidden = !!sel[i]; });
      };
      bindMeal(upd);
      $('#afBack', root).addEventListener('click', showList);
      $$('[data-tk]', root).forEach(function (b) { b.addEventListener('click', function () { const i = b.dataset.tk; if (sel[i]) delete sel[i]; else sel[i] = 1; b.setAttribute('aria-pressed', !!sel[i]); buzz('light'); upd(); }); });
      $$('[data-qi] [data-qd]', root).forEach(function (b) { b.addEventListener('click', function () { const i = b.parentNode.dataset.qi, n = (sel[i] || 0) + +b.dataset.qd; if (n <= 0) { delete sel[i]; const t = root.querySelector('[data-tk="' + i + '"]'); if (t) t.setAttribute('aria-pressed', false); } else sel[i] = Math.min(9, n); buzz('light'); upd(); }); });
      $$('[data-mo]', root).forEach(function (b) { b.addEventListener('click', function () { buzz('light'); showServe(pl.items[+b.dataset.mo]); }); });
      $$('[data-st]', root).forEach(function (b) { b.addEventListener('click', function () {
        const id = pl.items[+b.dataset.st].id, on = !isFav(id);
        if (on) state.favs.unshift(id); else state.favs = state.favs.filter(function (x) { return x !== id; });
        save(); buzz('light'); b.setAttribute('aria-pressed', on); b.innerHTML = STAR(on);
      }); });
      $('#mnAdd', root).addEventListener('click', function () {
        const snap = snapshot(), its = Object.keys(sel).map(function (i) { const f = pl.items[i], x = sv[i], k = sel[i], m = k === 1 ? x.m : macrosFor(f, x.g * k); return { id: newId(), meal: ml, ref: f.id, name: f.name.slice(0, 80), g: Math.round(x.g * k * 10) / 10, qty: Math.round(x.s.qty * k * 1000) / 1000, unit: x.s.unit.label, kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat }; });
        addItems(d, its); added += its.length - 1; logged('Added ' + its.length + ' from ' + pl.name, snap); showList();
      });
    }
    // ----- meal: rename, remove foods, delete (from You → My foods) -----
    // A meal being made or edited: { id (null = new), name, items }. Foods are added like recipe ingredients.
    let mealDraft = null, pickMeal = false, mealAdj = false;
    const mealSum = function (items) { return items.reduce(function (a, f) { return { kcal: a.kcal + f.kcal, protein: a.protein + f.protein, carbs: a.carbs + f.carbs, fat: a.fat + f.fat }; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 }); };
    function showMealEdit(mm) {
      leave();
      if (mm) mealDraft = JSON.parse(JSON.stringify({ id: mm.id || null, name: mm.name || '', items: mm.items || [] }));
      const md = mealDraft, isNew = !md.id || !state.meals.some(function (x) { return x.id === md.id; });
      root.innerHTML = head(mealAdj ? editTitle(d) : isNew ? 'New meal' : 'Edit meal', 'x', isNew && !mealAdj ? '' : '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>', true) +
        (mealAdj ? '<div class="menu-src" hidden><button type="button" id="meExplode">Split into separate foods</button>' + (state.meals.some(function (x) { return x.id === md.id; }) ? '<button type="button" id="meReset">Use the meal again</button>' : '') + '</div>' :
          isNew ? '' : '<div class="menu-src" hidden><button type="button" id="meShare">Share</button><button type="button" class="danger" id="meDel">Delete meal</button></div>') +
        (mealAdj ? '<div class="sv-name">' + esc(md.name) + '</div><p class="muted-note adj-note">Changes this day only. To change the meal itself, go to Foods.</p>' : '') +
        '<div class="field"' + (mealAdj ? ' hidden' : '') + '><span>Name</span><input class="input" id="meN" maxlength="40" placeholder="e.g. Usual breakfast" aria-label="Meal name" autocomplete="off" value="' + esc(md.name) + '" /></div>' +
        '<div class="label faint fd-sec">Foods</div>' +
        (md.items.length ? '<div class="list" id="meItems">' + md.items.map(function (it, i) { return '<div class="row fd-row me-row" data-mrow="' + i + '">' + (md.items.length > 1 ? '<span class="cat-grip me-grip" aria-label="Drag to reorder">' + GRIP + '</span>' : '') + '<button type="button" class="grow me-open" data-mi="' + i + '"><div class="row-t">' + esc(it.name || 'Quick add') + '</div><div class="row-s">' + (it.ref ? fmtAmt(it.qty, it.unit) + ' · ' : '') + fmtKcal(it.kcal) + ' kcal</div></button><button type="button" class="icon-btn me-rm" data-rm="' + i + '" aria-label="Remove ' + esc(it.name || 'food') + '">' + TRASH + '</button></div>'; }).join('') + '</div>' : '<p class="muted-note fd-empty">No foods yet.</p>') +
        '<button type="button" class="btn soft block" id="meAdd" style="margin-bottom:16px">' + (otherMeals().length ? '+ Add food or meal' : '+ Add food') + '</button>' +
        (mealAdj ? '' : '<div class="list me-opt"><label class="row"><div class="grow"><div class="row-t">Explode all meals</div><div class="row-s">Log every meal as its separate foods</div></div><span class="switch"><input type="checkbox" id="meSplit"' + (state.settings.explode ? ' checked' : '') + ' /><i></i></span></label></div>') +
        (md.items.length ? '<div class="sv-sum" id="meSum">' + sumBox(mealSum(md.items), mealAdj ? 'you had' : 'kcal') + SUM_MORE + '</div><div class="nut-drop" id="meNuts" hidden></div>' + keyBoxes(itemsKey(md.items)) : '') +
        '<p class="form-error" id="meErr" hidden></p>' +
        (mealAdj ? notePicHtml(edit) : '') +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="meSave">' + (isNew ? 'Save meal' : 'Save') + '</button></div>';
      const N = $('#meN', root);
      N.addEventListener('input', function () { md.name = N.value; });
      nutToggle($('#meSum', root), $('#meNuts', root), function () { return itemsTot(md.items); });
      if ($('#meSplit', root)) $('#meSplit', root).addEventListener('change', function () { state.settings.explode = this.checked; save(); buzz('light'); });
      $('#afBack', root).addEventListener('click', function () { mealDraft = null; if (manage || mealAdj) closeSheet(); else showList(); });
      if (mealAdj) {
        bindNotePic(root, edit);
        const entry = function () { return foodFor(d).find(function (x) { return x.id === edit.id; }); };
        const apply = function (items, msg) {
          const it = entry(); if (!it) return closeSheet();
          const snap = snapshot(), e = mealEntry({ id: it.mid, name: (md.name.trim() || it.name).slice(0, 40), items: items }, it.meal);
          delete e.id; delete e.meal; delete it.n; Object.assign(it, e); readNote(root, it);
          mealDraft = null; save(); renderAll(); closeSheet(); buzz('success'); toast(msg, function () { restore(snap); });
        };
        $('#meSave', root).addEventListener('click', function (ev) {
          ev.stopImmediatePropagation();
          if (!md.items.length) { closeSheet(); removeFoodItem(edit.id, d); return; }
          apply(md.items, 'Saved for this day only');
        }, true);
        $('#meExplode', root).addEventListener('click', function () {
          const it = entry(); if (!it) return closeSheet();
          const snap = snapshot(), list = foodFor(d), at = list.indexOf(it);
          const parts = md.items.map(function (x) { return Object.assign({}, x, { id: newId(), meal: it.meal }, it.t ? { t: it.t } : {}); });
          list.splice.apply(list, [at, 1].concat(parts));
          mealDraft = null; save(); renderAll(); closeSheet(); buzz('success'); toast('Split into ' + parts.length + ' foods', function () { restore(snap); });
        });
        if ($('#meReset', root)) $('#meReset', root).addEventListener('click', function () { const m = state.meals.find(function (x) { return x.id === md.id; }); md.name = m.name; apply(m.items, 'Back to the meal'); });
      }
      $('#meAdd', root).addEventListener('click', function () { pick = true; pickMeal = true; q = ''; showList(); });
      $$('[data-rm]', root).forEach(function (b) { b.addEventListener('click', function () { md.items.splice(+b.dataset.rm, 1); buzz('light'); showMealEdit(); }); });
      // Drag the grip to reorder the foods.
      const meList = $('#meItems', root);
      if (meList) dragSort(meList, '[data-mrow]', function (src, tgt, before) {
        const from = +src.dataset.mrow, mv = md.items.splice(from, 1)[0];
        let to = +tgt.dataset.mrow; if (from < to) to--; if (!before) to++;
        md.items.splice(to, 0, mv); buzz('light'); showMealEdit();
      }, { handle: '.me-grip' });
      $$('[data-mi]', root).forEach(function (b) { b.addEventListener('click', function () {
        const it = md.items[+b.dataset.mi], f = it.ref && getFood(it.ref);
        if (!f) { toast(it.ref ? 'This food isn\'t available any more' : 'Quick adds can only be removed'); return; }
        pick = true; pickMeal = true; showServe(f, it);
      }); });
      const del = function () {
        const snap = snapshot();
        state.meals = state.meals.filter(function (x) { return x.id !== md.id; });
        mealDraft = null; save(); buzz('medium'); toast('Meal deleted', function () { restore(snap); renderFoods(); }); if (manage) done(); else showList();
      };
      if ($('#meDel', root)) $('#meDel', root).addEventListener('click', del);
      if ($('#meShare', root)) $('#meShare', root).addEventListener('click', function () { buzz('light'); shareLink('m', { name: md.name.trim() || 'Meal', items: md.items }); });
      $('#meSave', root).addEventListener('click', function () {
        const nm = md.name.trim(), err = function (m) { const x = $('#meErr', root); x.textContent = m; x.hidden = false; buzz('warn'); };
        if (!md.items.length) { if (isNew) return err('Add at least one food'); return del(); }
        if (!nm) return err('Give it a name');
        const clean = md.items.slice(0, 40).map(function (it) { const c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan; return c; });
        const real = !isNew && state.meals.find(function (x) { return x.id === md.id; });
        if (real) { real.name = nm.slice(0, 40); real.items = clean; } else state.meals.push({ id: 'm' + newId(), name: nm.slice(0, 40), items: clean });
        mealDraft = null; save(); buzz('success'); toast(real ? 'Meal saved' : 'Meal created'); if (manage) done(); else showList();
      });
    }
    // Recipe → meal: its ingredients become the meal's foods (the whole batch, or one serving's worth).
    function recipeToMeal(oneServing) {
      const k = oneServing ? 1 / (draft.servings || 1) : 1, items = [];
      draft.items.forEach(function (it) { const f = getFood(it.ref); if (!f) return; const g = Math.round(it.g * k * 10) / 10, m = macrosFor(f, g); items.push({ ref: it.ref, name: it.name || f.name, g: g, qty: Math.round(it.qty * k * 1000) / 1000, unit: it.unit, kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat }); });
      if (!items.length) { toast('No ingredients to use'); return; }
      showMealEdit({ id: null, name: (draft.name || 'Recipe') + (oneServing && (draft.servings || 1) > 1 ? ' (1 serving)' : ''), items: items });
    }

    // Save an adjusted recipe onto this one entry (null = back to the saved recipe), keeping the amount eaten.
    function saveAdjust(rcv, amt) {
      const it = foodFor(d).find(function (x) { return x.id === edit.id; });
      if (!it) return closeSheet();
      const snap = snapshot();
      if (rcv) it.rc = rcv; else delete it.rc;
      if (amt && amt.qty > 0) { it.qty = Math.round(amt.qty * 1000) / 1000; it.unit = amt.unit; }
      if (root) readNote(root, it);
      const f = itemFood(it);
      if (f) {
        const u = unitsFor(f).find(function (x) { return x.label === it.unit; });
        if (u) it.g = Math.round(it.qty * u.g * 10) / 10;
        const m = macrosFor(f, it.g); Object.assign(it, { kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat });
      }
      draft = null; save(); renderAll(); closeSheet(); buzz('success');
      toast(rcv ? 'Saved for this day only' : 'Back to the saved recipe', function () { restore(snap); });
    }

    // ----- compare two foods, per serving or per 100 g -----
    function showCompare(A, fb) {
      leave();
      let basis = 'serving';
      const amt = function (f, g0) { if (g0) return g0; const lp = lastPortion(f.id), u = lp && unitsFor(f).find(function (x) { return x.label === lp.unit; }); if (u) return lp.qty * u.g; const s0 = defaultServing(f); return s0.qty * s0.unit.g; };
      const ga = amt(A.f, isNaN(A.g) ? null : A.g), gb = amt(fb, null);
      const KEYS = [['kcal', 0], ['p', 1], ['c', 0], ['fib', 1], ['sug', -1], ['f', 0], ['sat', -1], ['na', -1], ['k', 1], ['ca', 1], ['fe', 1], ['mg', 1], ['vC', 1], ['vD', 1], ['vA', 1], ['b12', 1]];
      const draw = function () {
        const xa = basis === '100' ? 100 : ga, xb = basis === '100' ? 100 : gb;
        const rows = KEYS.map(function (k) {
          const n = NUT[k[0]]; if (!n) return '';
          const a = per100(A.f, k[0]), b = per100(fb, k[0]); if (a == null && b == null) return '';
          const va = a == null ? null : a * xa / 100, vb = b == null ? null : b * xb / 100;
          const better = k[1] && va != null && vb != null && Math.abs(va - vb) > Math.max(va, vb) * 0.05 ? ((va > vb) === (k[1] > 0) ? 'a' : 'b') : '';
          return '<div class="cmp-row"><span class="cmp-v' + (better === 'a' ? ' win' : '') + '">' + (va == null ? '–' : fmtNut(va, n.unit)) + '</span><span class="cmp-l">' + esc(n.label.replace(/ \(.*\)/, '')) + '</span><span class="cmp-v' + (better === 'b' ? ' win' : '') + '">' + (vb == null ? '–' : fmtNut(vb, n.unit)) + '</span></div>';
        }).join('');
        root.innerHTML = head('Compare', true, '', true) +
          segHtml('cmpB', [['serving', 'Per serving'], ['100', 'Per 100 g']], basis) +
          '<div class="cmp-head"><button type="button" class="cmp-food" data-cf="a"><b>' + esc(A.f.name) + '</b><small>' + (basis === '100' ? '100 g' : fmtQty(Math.round(ga)) + ' g') + '</small></button><button type="button" class="cmp-food" data-cf="b"><b>' + esc(fb.name) + '</b><small>' + (basis === '100' ? '100 g' : fmtQty(Math.round(gb)) + ' g') + '</small></button></div>' +
          '<div class="card cmp-card">' + rows + '</div><p class="muted-note">Green marks the better pick for that nutrient. Tap a food to log it.</p>';
        bindSeg(root, 'cmpB', function (v) { basis = v; draw(); });
        $('#afBack', root).addEventListener('click', function () { showList(); });
        $$('[data-cf]', root).forEach(function (b) { b.addEventListener('click', function () { const f = b.dataset.cf === 'a' ? A.f : fb; comparing = null; showServe(f); }); });
      };
      draw();
    }
    // ----- paste an ingredient list into a recipe -----
    function showPaste() {
      leave();
      root.innerHTML = head('Paste ingredients', true, '', true) +
        '<p class="sheet-text">One ingredient per line, with amounts, like "200 g chicken breast" or "2 tbsp olive oil".</p>' +
        '<div class="field"><textarea class="input pa-text" id="paT" rows="7" aria-label="Ingredients" placeholder="500 g minced beef&#10;1 onion&#10;2 tbsp olive oil&#10;400 g tomatoes"></textarea></div>' +
        '<div id="paPrev"></div>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="paGo" disabled>Add to recipe</button></div>';
      const T = $('#paT', root), P = $('#paPrev', root);
      let found = [];
      const run = function () {
        const lines = T.value.split(/\n+/).map(function (l) { return l.replace(/^\s*(?:[-•*·▪]|\d+[.)])\s+/, '').replace(/\(.*?\)/g, '').split(',')[0].trim(); }).filter(Boolean);
        found = lines.length ? (parseMeal(lines.join('\n'), true) || []) : [];
        const ok = found.filter(function (x) { return x.f; });
        P.innerHTML = found.length ? '<div class="card pm-card">' + found.map(function (x) { return '<div class="pm-row' + (x.f ? '' : ' miss') + '"><span class="grow"><b>' + esc(x.part) + '</b><small>' + (x.f ? esc(x.f.name) + ' · ' + fmtAmt(x.qty, x.unit) : 'No match: add it by hand') + '</small></span>' + (x.f ? '<span class="num">' + fmtKcal(x.m.kcal) + '</span>' : '') + '</div>'; }).join('') + '</div>' : '';
        const b = $('#paGo', root); b.disabled = !ok.length; b.textContent = ok.length ? 'Add ' + ok.length + ' to recipe' : 'Add to recipe';
      };
      const go = function () { if (!foodDB) { P.innerHTML = skel(4); loadFoods().then(run, function () {}); } else run(); };
      let t2 = null; T.addEventListener('input', function () { clearTimeout(t2); t2 = setTimeout(go, 300); });
      $('#afBack', root).addEventListener('click', showRecipe);
      $('#paGo', root).addEventListener('click', function () {
        found.filter(function (x) { return x.f && !x.f.recipe; }).forEach(function (x) { draft.items.push({ ref: x.f.id, name: x.f.name.slice(0, 80), g: x.g, qty: x.qty, unit: x.unit }); });
        buzz('success'); showRecipe();
      });
    }
    // ----- recipe editor -----
    function showRecipe() {
      leave();
      if (adjust && !draft.amt) draft.amt = { qty: edit.qty || 1, unit: edit.unit || 'serving' };
      const rcFood = function () { return recipeFood({ id: draft.id || 'rnew', name: draft.name, servings: draft.servings || 1, cookedG: draft.cookedG, items: draft.items }); };
      root.innerHTML = head(adjust ? editTitle(d) : draft.id ? 'Edit recipe' : 'New recipe', adjust || manage ? 'x' : true, '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>', true) +
        '<div class="menu-src" hidden><button type="button" id="rcPaste">Paste an ingredient list</button>' + (draft.items.length ? '<button type="button" id="rcScale">Scale the recipe</button>' : '') + (draft.items.length && !adjust ? '<button type="button" id="rcMeal">Turn into a meal</button>' : '') + (manage && draft.id ? '<button type="button" id="rcShare">Share</button>' : '') + (!adjust && draft.id ? '<button type="button" class="danger" id="rcDel">Delete recipe</button>' : '') + '</div>' +
        (adjust ? '<div class="sv-name">' + esc(draft.name) + '</div><p class="muted-note adj-note">Changes this day only. To change the recipe itself, go to Foods.</p>' +
          '<div class="label faint fd-sec">How much you had</div><div class="sv-amt rc-amt"><div class="field"><input class="input" id="rcQ" inputmode="decimal" enterkeyhint="done" autocomplete="off" aria-label="Amount" value="' + fmtQty(draft.amt.qty) + '" /></div><div class="field"><select class="input" id="rcU" aria-label="Unit"></select></div></div>' : '') +
        '<div class="field"' + (adjust ? ' hidden' : '') + '><span>Name</span><input class="input" id="rcN" maxlength="60" placeholder="e.g. Lentil soup" aria-label="Recipe name" autocomplete="off" value="' + esc(draft.name || '') + '" /></div>' +
        '<div class="two"><div class="field sfx"><span>Servings</span><input class="input" id="rcS" inputmode="numeric" maxlength="3" aria-label="Servings" value="' + (draft.servings || 1) + '" /></div>' +
        '<div class="field sfx"><span>Cooked weight</span><input class="input" id="rcG" inputmode="decimal" maxlength="6" placeholder="optional" aria-label="Cooked weight in grams, optional" value="' + (draft.cookedG ? fmtQty(draft.cookedG) : '') + '" /><em>g</em></div></div>' +
        '<div class="label faint fd-sec">Ingredients</div>' +
        (draft.items.length ? '<div class="list" id="rcIngs">' + draft.items.map(function (it, i) { const f = getFood(it.ref); return '<div class="row fd-row me-row" data-ing="' + i + '" role="button" tabindex="0">' + (draft.items.length > 1 ? '<span class="cat-grip me-grip" aria-label="Drag to reorder">' + GRIP + '</span>' : '') + '<div class="grow"><div class="row-t">' + esc(it.name) + '</div><div class="row-s">' + fmtAmt(it.qty, it.unit) + (f ? ' · ' + fmtKcal(macrosFor(f, it.g).kcal) + ' kcal' : '') + '</div></div><button type="button" class="icon-btn me-rm" data-rmi="' + i + '" aria-label="Remove ' + esc(it.name) + '">' + TRASH + '</button></div>'; }).join('') + '</div>' : '') +
        (adjust ? '<button type="button" class="btn soft block" id="rcAdd" style="margin-bottom:16px">+ Add ingredient</button>' : '<div class="rc-adds"><button type="button" class="btn soft" id="rcAdd">+ Add ingredient</button><button type="button" class="btn soft" id="rcPaste2">' + PASTE_IC + 'Paste a list</button></div>') +
        (draft.items.length ? '' : '<p class="muted-note rc-hint">Got the recipe written down? Paste the ingredients, one per line (like “2 cups rice” or “500 g chicken”), and they\'re matched for you.</p>') +
        '<div class="sv-sum" id="rcSum"></div><div class="nut-drop" id="rcNuts" hidden></div><div id="rcKey"></div>' +
        '<p class="form-error" id="rcErr" hidden></p>' +
        (adjust && edit.rc ? '<button type="button" class="text-btn fd-create" id="rcReset">Use the saved recipe again</button>' : '') +
        (adjust ? notePicHtml(edit) : '') +
        '<div class="sheet-foot">' + (adjust || draft.id ? '<button type="button" class="btn primary block" id="rcSave">Save</button>'
          : '<button type="button" class="btn primary block" id="rcSave">Save recipe</button>') + '</div>';
      const N = $('#rcN', root), S = $('#rcS', root), G = $('#rcG', root);
      let rcG = 0, rcRedraw = null;
      const sync = function () {
        draft.name = N.value.trim(); const sv = parseInt(S.value, 10); draft.servings = sv >= 1 && sv <= 100 ? sv : draft.servings;
        const g = parseNum(G.value); draft.cookedG = G.value.trim() && g > 0 && g <= 50000 ? g : null;
        const f = draft.items.length ? rcFood() : null;
        let gg = f ? unitsFor(f)[0].g : 0, lbl = 'per serving';
        if (adjust && f) {
          const us = unitsFor(f), U = $('#rcU', root), Q = $('#rcQ', root), q = parseNum(Q.value);
          U.innerHTML = us.map(function (u) { return '<option value="' + esc(u.label) + '"' + (u.label === draft.amt.unit ? ' selected' : '') + '>' + esc(u.label) + (u.label === 'g' || u.label === 'oz' ? '' : ' (' + fmtQty(Math.round(u.g)) + ' g)') + '</option>'; }).join('');
          if (!us.some(function (u) { return u.label === draft.amt.unit; })) { draft.amt.unit = us[0].label; U.value = draft.amt.unit; }
          if (q > 0) draft.amt.qty = q;
          gg = draft.amt.qty * us.find(function (u) { return u.label === draft.amt.unit; }).g; lbl = 'you had';
        }
        $('#rcSum', root).innerHTML = sumBox(f ? macrosFor(f, gg) : null, lbl) + (f ? SUM_MORE : '');
        rcG = gg;
        if (rcRedraw) rcRedraw();
        $('#rcKey', root).innerHTML = f ? keyBoxes(function (k) { const v = per100(f, k); return v == null ? null : v * gg / 100; }) : '';
      };
      sync();
      rcRedraw = nutToggle($('#rcSum', root), $('#rcNuts', root), function () { const f = draft.items.length ? rcFood() : null; return f ? foodTot(f, rcG) : {}; });
      [N, S, G].forEach(function (x) { x.addEventListener('input', sync); });
      if (adjust) {
        bindNotePic(root, edit);
        $('#rcQ', root).addEventListener('input', sync);
        $('#rcU', root).addEventListener('change', function () {
          // keep about the same amount when switching between servings and grams
          const f = draft.items.length ? rcFood() : null, us = f ? unitsFor(f) : [], a = us.find(function (u) { return u.label === draft.amt.unit; }), b = us.find(function (u) { return u.label === this.value; }, this);
          if (a && b) { const g = draft.amt.qty * a.g, nq = g / b.g; draft.amt.qty = b.label === 'g' ? Math.round(nq) : Math.round(nq * 4) / 4 || Math.round(nq * 100) / 100; $('#rcQ', root).value = fmtQty(draft.amt.qty); }
          draft.amt.unit = this.value; sync();
        });
      }
      $('#afBack', root).addEventListener('click', function () { draft = null; if (adjust || manage) closeSheet(); else showList(); });
      $('#rcAdd', root).addEventListener('click', function () { sync(); pick = true; replaceAt = null; q = ''; showList(); });
      $('#rcPaste', root).addEventListener('click', function () { sync(); showPaste(); });
      if ($('#rcPaste2', root)) $('#rcPaste2', root).addEventListener('click', function () { sync(); buzz('light'); showPaste(); });
      $$('[data-rmi]', root).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); sync(); draft.items.splice(+b.dataset.rmi, 1); buzz('light'); showRecipe(); }); });
      if ($('#rcMeal', root)) $('#rcMeal', root).addEventListener('click', function () {
        sync(); const sv = draft.servings || 1;
        popMenu($('[data-more]', root), [{ label: 'Whole recipe (' + sv + ' serving' + (sv === 1 ? '' : 's') + ')', run: function () { recipeToMeal(false); } }].concat(sv > 1 ? [{ label: 'One serving', run: function () { recipeToMeal(true); } }] : []));
      });
      // Scale: make half, one and a half, double or triple (ingredients, cooked weight and servings together).
      if ($('#rcScale', root)) $('#rcScale', root).addEventListener('click', function () {
        sync();
        popMenu($('[data-more]', root), [0.5, 1.5, 2, 3].map(function (k) { return { label: (k === 0.5 ? 'Half' : k === 1.5 ? '1½ times' : k === 2 ? 'Double' : 'Triple') + ' (×' + k + ')', run: function () {
          draft.items.forEach(function (it) { it.g = Math.round(it.g * k * 10) / 10; it.qty = Math.round(it.qty * k * 1000) / 1000; });
          if (draft.cookedG) draft.cookedG = Math.round(draft.cookedG * k);
          draft.servings = Math.max(1, Math.round((draft.servings || 1) * k)); buzz('success'); showRecipe();
        } }; }));
      });
      // Drag the grip to reorder ingredients.
      const ingList = $('#rcIngs', root);
      if (ingList) dragSort(ingList, '[data-ing]', function (src, tgt, before) {
        sync(); const from = +src.dataset.ing, mv = draft.items.splice(from, 1)[0];
        let to = +tgt.dataset.ing; if (from < to) to--; if (!before) to++;
        draft.items.splice(to, 0, mv); buzz('light'); showRecipe();
      }, { handle: '.me-grip' });
      $$('[data-ing]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          sync(); const it = draft.items[+b.dataset.ing], f = getFood(it.ref);
          if (!f) { toast('This ingredient isn\'t available any more'); return; }
          pick = true; showServe(f, it);
        });
      });
      $('#rcSave', root).addEventListener('click', function () {
        sync();
        const err = function (m) { const x = $('#rcErr', root); x.textContent = m; x.hidden = false; buzz('warn'); };
        if (!draft.name) return err('Give it a name');
        const sv = parseInt(S.value, 10); if (!(sv >= 1 && sv <= 100)) return err('Servings: 1 to 100');
        if (!draft.items.length) return err('Add at least one ingredient');
        if (G.value.trim() && !draft.cookedG) return err('Check the cooked weight');
        const vals = { name: draft.name.slice(0, 60), servings: sv, cookedG: draft.cookedG ? Math.round(draft.cookedG) : null, items: draft.items.slice(0, 60).map(function (it) { return { ref: it.ref, name: it.name, g: it.g, qty: it.qty, unit: it.unit }; }) };
        if (adjust) { if (!(draft.amt.qty > 0)) return err('Enter how much you had'); return saveAdjust({ servings: sv, cookedG: vals.cookedG, items: vals.items }, draft.amt); }
        let rc = draft.id && state.recipes.find(function (x) { return x.id === draft.id; });
        const snap = rc ? snapshot() : null;
        if (rc) Object.assign(rc, vals); else { rc = Object.assign({ id: 'r' + newId() }, vals); state.recipes.push(rc); }
        const rf = snap ? refreshRefs({ [rc.id]: true }) : { logged: 0, meals: 0 };
        save(); buzz('success'); toast('Recipe saved' + refreshNote(rf), rf.logged || rf.meals ? function () { restore(snap); renderFoods(); } : null); draft = null;
        if (manage) return done();
        const f = recipeFood(rc); if (f) showServe(f, adjust ? edit : undefined); else showList();
      });
      if ($('#rcReset', root)) $('#rcReset', root).addEventListener('click', function () { saveAdjust(null, draft && draft.amt); });
      if ($('#rcShare', root)) $('#rcShare', root).addEventListener('click', function () { sync(); buzz('light'); shareLink('r', draft); });
      if ($('#rcDel', root)) $('#rcDel', root).addEventListener('click', function () {
        const snap = snapshot(), id = draft.id;
        state.recipes = state.recipes.filter(function (x) { return x.id !== id; }); state.favs = state.favs.filter(function (x) { return x !== id; });
        save(); buzz('medium'); toast('Recipe deleted. Logged entries stay.', function () { restore(snap); renderFoods(); }); draft = null; if (manage) done(); else showList();
      });
    }

    // ----- quick add: just numbers -----
    function showQuick() {
      leave();
      root.innerHTML = head('Quick add', true) +
        '<div class="field"><span>Name</span><input class="input" id="afN" maxlength="40" placeholder="Optional" aria-label="Name" autocomplete="off" /></div>' +
        '<div class="four-in">' +
          '<div class="field sfx"><span>Calories</span><input class="input" id="afK" inputmode="numeric" maxlength="5" placeholder="0" aria-label="Calories" autocomplete="off" /><em>kcal</em></div>' +
          '<div class="field sfx"><span>Protein</span><input class="input" id="afP" inputmode="numeric" maxlength="3" placeholder="0" aria-label="Protein" autocomplete="off" /><em>g</em></div>' +
          '<div class="field sfx"><span>Carbs</span><input class="input" id="afC" inputmode="numeric" maxlength="3" placeholder="0" aria-label="Carbs" autocomplete="off" /><em>g</em></div>' +
          '<div class="field sfx"><span>Fat</span><input class="input" id="afF" inputmode="numeric" maxlength="3" placeholder="0" aria-label="Fat" autocomplete="off" /><em>g</em></div>' +
        '</div><p class="form-error" id="afErr" hidden></p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="afAdd">Add to <span id="afMealName"></span></button></div>';
      const N = $('#afN', root), K = $('#afK', root), P = $('#afP', root), C = $('#afC', root), F = $('#afF', root);
      const syncMeal = function () { $('#afMealName', root).textContent = mealName(ml); };
      syncMeal(); bindMeal(syncMeal);
      $('#afBack', root).addEventListener('click', showList);
      const err = function (m) { const x = $('#afErr', root); x.textContent = m; x.hidden = !m; if (m) buzz('warn'); };
      const num = function (el, max) { const v = el.value.trim(); if (!v) return 0; const n = parseNum(v); return isNaN(n) || n < 0 || n > max ? NaN : Math.round(n); };
      $('#afAdd', root).addEventListener('click', function () {
        const k = parseNum(K.value), pr = num(P, 300), cb = num(C, 600), ft = num(F, 300);
        if (isNaN(k) || k < 1 || k > 5000) return err('Enter calories between 1 and 5,000');
        if (isNaN(pr) || isNaN(cb) || isNaN(ft)) return err('Check the protein, carbs and fat');
        err(''); const snap = snapshot();
        addItems(d, [{ id: newId(), kcal: Math.round(k), protein: pr, carbs: cb, fat: ft, name: N.value.trim(), meal: ml }]);
        logged('Added to ' + mealName(ml), snap); refreshHead();
        [N, K, P, C, F].forEach(function (x) { x.value = ''; });
      });
      [N, K, P, C, F].forEach(function (x) { x.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#afAdd', root).click(); } }); });
      if (window.matchMedia('(hover: hover)').matches) K.focus();
    }

    // ----- create / edit one of My foods (values per serving) -----
    function showCreate(c, name, fromFood, code) {
      leave();
      root.innerHTML = head(c ? 'Edit food' : 'New food', manage ? 'x' : true, c ? '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>' : '', true) + (c ? '<div class="menu-src" hidden><button type="button" class="danger" id="cfDel">Delete food</button></div>' : '') +
        '<button type="button" class="btn soft block lb-scan" id="cfScan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M8 9h8M8 12h8M8 15h5"/></svg>Scan a nutrition label</button><input type="file" id="cfImg" accept="image/*" hidden />' +
        '<div class="field"><span>Name</span><input class="input" id="cfN" maxlength="60" placeholder="e.g. Protein bar" aria-label="Name" autocomplete="off" value="' + esc(c ? c.name : name || '') + '" /></div>' +
        '<div class="two"><div class="field"><span>Serving</span><input class="input" id="cfU" maxlength="30" placeholder="serving" aria-label="Serving name, like slice or bowl" autocomplete="off" value="' + esc(c ? c.unit : '') + '" /></div>' +
        '<div class="field sfx"><span>Weight</span><input class="input" id="cfG" inputmode="decimal" maxlength="6" placeholder="optional" aria-label="Serving weight in grams, optional" autocomplete="off" value="' + (c && c.g ? fmtQty(c.g) : '') + '" /><em>g</em></div></div>' +
        '<div class="form-sec">Nutrition per serving' + ((c && c.code) || code ? ' <small>· barcode ' + esc((c && c.code) || code) + '</small>' : '') + '</div>' +
        '<div class="four-in">' +
          '<div class="field sfx"><span>Calories</span><input class="input" id="cfK" inputmode="numeric" maxlength="5" placeholder="0" aria-label="Calories" autocomplete="off" value="' + (c ? c.kcal : '') + '" /><em>kcal</em></div>' +
          '<div class="field sfx"><span>Protein</span><input class="input" id="cfP" inputmode="decimal" maxlength="5" placeholder="0" aria-label="Protein" autocomplete="off" value="' + (c ? c.p : '') + '" /><em>g</em></div>' +
          '<div class="field sfx"><span>Carbs</span><input class="input" id="cfC" inputmode="decimal" maxlength="5" placeholder="0" aria-label="Carbs" autocomplete="off" value="' + (c ? c.c : '') + '" /><em>g</em></div>' +
          '<div class="field sfx"><span>Fat</span><input class="input" id="cfF" inputmode="decimal" maxlength="5" placeholder="0" aria-label="Fat" autocomplete="off" value="' + (c ? c.f : '') + '" /><em>g</em></div>' +
        '</div>' +
        '<div class="odd-hint" id="cfOdd" hidden><span id="cfOddT"></span><div><button type="button" class="text-btn" id="cfOddUse"></button><button type="button" class="text-btn" id="cfOddOk">It\'s correct</button></div></div>' +
        '<button type="button" class="text-btn sv-more" id="cfMore">' + (c && c.n && Object.keys(c.n).length ? 'Hide' : 'More from the label') + '</button>' +
        '<div class="four-in" id="cfExtra"' + (c && c.n && Object.keys(c.n).length ? '' : ' hidden') + '>' + LABEL_NUTS.map(function (x) { return '<div class="field sfx"><span>' + x[1] + '</span><input class="input" id="cfx_' + x[0] + '" inputmode="decimal" maxlength="6" placeholder="0" aria-label="' + x[1] + '" autocomplete="off" value="' + (c && c.n && c.n[x[0]] != null ? c.n[x[0]] : '') + '" /><em>' + x[2] + '</em></div>'; }).join('') + '</div>' +
        '<p class="form-error" id="cfErr" hidden></p>' +
        '<div class="sheet-foot">' + (c ? '<button type="button" class="btn primary block" id="cfSave">Save</button>'
          : '<button type="button" class="btn primary block" id="cfSave">Save food</button>') + '</div>';
      $('#afBack', root).addEventListener('click', function () { if (manage) closeSheet(); else if (fromFood) showServe(customFood(c)); else showList(); });
      $('#cfScan', root).addEventListener('click', function () { $('#cfImg', root).click(); });
      $('#cfImg', root).addEventListener('change', function () { const file = this.files && this.files[0]; this.value = ''; if (file) readLabel(file, root); });
      $('#cfMore', root).addEventListener('click', function () { const x = $('#cfExtra', root); x.hidden = !x.hidden; this.textContent = x.hidden ? 'More from the label' : 'Hide'; buzz('light'); });
      const err = function (m) { const x = $('#cfErr', root); x.textContent = m; x.hidden = !m; if (m) buzz('warn'); };
      const num = function (id, max) { const v = $('#' + id, root).value.trim(); if (!v) return 0; const n = parseNum(v); return isNaN(n) || n < 0 || n > max ? NaN : Math.round(n * 10) / 10; };
      let okFlag = !!(c && c.ok);
      const oddCheck = function () {
        const v = function (id) { const x = parseNum($('#' + id, root).value || '0'); return isNaN(x) ? 0 : x; };
        const k = v('cfK'), est = Math.round(4 * v('cfP') + 4 * v('cfC') + 9 * v('cfF')), odd = $('#cfK', root).value.trim() && oddMacros(k, v('cfP'), v('cfC'), v('cfF'));
        $('#cfOdd', root).hidden = !odd || okFlag;
        if (odd) { $('#cfOddT', root).textContent = 'These macros add up to about ' + est + ' kcal, not ' + Math.round(k) + '.'; $('#cfOddUse', root).textContent = 'Use ' + est + ' kcal'; $('#cfOddUse', root).dataset.v = est; }
      };
      ['cfK', 'cfP', 'cfC', 'cfF'].forEach(function (id) { $('#' + id, root).addEventListener('input', function () { okFlag = false; oddCheck(); }); });
      $('#cfOddUse', root).addEventListener('click', function () { $('#cfK', root).value = this.dataset.v; buzz('light'); oddCheck(); });
      $('#cfOddOk', root).addEventListener('click', function () { okFlag = true; buzz('light'); oddCheck(); });
      oddCheck();
      $('#cfSave', root).addEventListener('click', function () {
        const nm = $('#cfN', root).value.trim(), k = parseNum($('#cfK', root).value), gv = $('#cfG', root).value.trim(), g = gv ? parseNum(gv) : null;
        const p = num('cfP', 1000), cb = num('cfC', 1000), ft = num('cfF', 1000);
        if (!nm) return err('Give it a name');
        if (isNaN(k) || k < 0 || k > 10000) return err('Enter the calories per serving');
        if (gv && (isNaN(g) || g <= 0 || g > 5000)) return err('Check the weight');
        if (isNaN(p) || isNaN(cb) || isNaN(ft)) return err('Check the protein, carbs and fat');
        const extra = {}; let bad = false;
        LABEL_NUTS.forEach(function (x) { const v = $('#cfx_' + x[0], root).value.trim(); if (!v) return; const n = parseNum(v); if (isNaN(n) || n < 0 || n > 100000) bad = true; else extra[x[0]] = Math.round(n * 100) / 100; });
        if (bad) return err('Check the extra nutrients');
        const vals = { name: nm.slice(0, 60), unit: ($('#cfU', root).value.trim() || 'serving').slice(0, 30), g: g ? Math.round(g * 10) / 10 : null, kcal: Math.round(k), p: p, c: cb, f: ft, n: extra, ok: okFlag && oddMacros(k, p, cb, ft) ? true : undefined };
        if (code) vals.code = code;
        const snap = c ? snapshot() : null;
        if (c) Object.assign(c, vals); else { c = Object.assign({ id: 'c' + newId() }, vals); state.myFoods.push(c); }
        const rf = snap ? refreshRefs({ [c.id]: true }) : { logged: 0, meals: 0 };
        save(); buzz('success'); toast((fromFood || manage ? 'Food saved' : 'Saved to My foods') + refreshNote(rf), rf.logged || rf.meals ? function () { restore(snap); renderFoods(); } : null);
        if (manage) done(); else showServe(customFood(c));
      });
      if ($('#cfDel', root)) $('#cfDel', root).addEventListener('click', function () {
        const snap = snapshot(), id = c.id;
        state.myFoods = state.myFoods.filter(function (x) { return x.id !== id; });
        state.favs = state.favs.filter(function (x) { return x !== id; });
        save(); buzz('medium'); toast('Food deleted. Logged entries stay.', function () { restore(snap); renderFoods(); });
        if (manage) done(); else showList();
      });
    }

    openSheet('<div id="afRoot"></div>', function (body) {
      sheet.classList.add('tall');
      root = $('#afRoot', body);
      if (edit && !foodDB && itemNeedsDB(edit)) {
        root.innerHTML = head('Edit food', 'x') + skel(4);
        $('#afBack', root).addEventListener('click', function () { closeSheet(); });
        loadFoods().then(function () { const f = itemFood(edit); if (root.isConnected) { if (f && adjust) { draft = adjustDraft(); showRecipe(); } else if (f) showServe(f, edit); else { closeSheet(); toast('This food isn\'t in the list any more'); } } },
          function () { if (root.isConnected) root.innerHTML = head('Edit food', 'x') + '<p class="muted-note fd-empty">Couldn\'t load the food list. Check your connection.</p>'; });
      } else if (manage) {
        // Recipes made from the food list need it loaded first.
        const go = function () {
          if (manage.kind === 'repeat') showList();
          else if (manage.kind === 'food') showCreate(manage.item ? state.myFoods.find(function (x) { return x.id === manage.item; }) : null, '');
          else if (manage.kind === 'meal') showMealEdit(manage.item ? state.meals.find(function (x) { return x.id === manage.item; }) : { id: null, name: '', items: [] });
          else { draft = manage.item ? JSON.parse(JSON.stringify(state.recipes.find(function (x) { return x.id === manage.item; }))) : { name: '', servings: 1, cookedG: null, items: [] }; showRecipe(); if (manage.paste) showPaste(); }
        };
        if (manage.kind === 'recipe' && manage.item && !foodDB && needsDB(manage.item)) {
          root.innerHTML = head('Edit recipe', 'x', '', true) + skel(4);
          $('#afBack', root).addEventListener('click', closeSheet);
          loadFoods().then(function () { if (root.isConnected) go(); }, function () { if (root.isConnected) root.innerHTML = head('Edit recipe', 'x', '', true) + '<p class="muted-note fd-empty">Couldn\'t load the food list. Check your connection.</p>'; });
        } else go();
      } else if (edit && edit.mid) {
        const sm = state.meals.find(function (x) { return x.id === edit.mid; });
        mealAdj = true; showMealEdit({ id: edit.mid, name: edit.name, items: edit.mi || (sm ? sm.items : []) });
      } else if (adjust) { draft = adjustDraft(); showRecipe(); }
      else if (edit) showServe(itemFood(edit), edit);
      else if (startFood) showServe(startFood);
      else if (startScan) showScan();
      else { showList(); }
    }, function () { sheet.classList.remove('tall'); leave(); });
  }

  // Camera barcode reading. Uses the browser's own reader where there is one, otherwise ZXing (barcode.js).
  // Resolves to a stop function, or null if the camera can't start (the typed number still works).
  // A short beep when a barcode is read (the sound context is started on the tap that opened the scanner).
  let beepCtx = null;
  function primeBeep() { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; beepCtx = beepCtx || new C(); if (beepCtx.state === 'suspended') beepCtx.resume(); } catch (e) {} }
  function beep() { try { if (!beepCtx) return; const o = beepCtx.createOscillator(), g = beepCtx.createGain(), t = beepCtx.currentTime; o.frequency.value = 1320; g.gain.setValueAtTime(0.07, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); o.connect(g); g.connect(beepCtx.destination); o.start(t); o.stop(t + 0.13); } catch (e) {} }
  // A barcode from a photo (gallery or camera roll): the phone's own reader if it has one, otherwise ZXing, upright then turned.
  function decodeBarcodeFile(file) {
    if (!window.createImageBitmap) return Promise.resolve(null);
    return createImageBitmap(file).then(function (bmp) {
      let native = Promise.resolve(null);
      try { if ('BarcodeDetector' in window) native = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }).detect(bmp).then(function (b) { return b[0] ? b[0].rawValue : null; }, function () { return null; }); } catch (e) {}
      return native.then(function (c) {
        if (c) return c;
        return import('./barcode.js').then(function (m) {
          const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
          const cv = document.createElement('canvas'), ctx = cv.getContext('2d', { willReadFrequently: true });
          const attempt = function (turn) {
            cv.width = turn ? h : w; cv.height = turn ? w : h; ctx.setTransform(1, 0, 0, 1, 0, 0);
            if (turn) { ctx.translate(h, 0); ctx.rotate(Math.PI / 2); }
            ctx.drawImage(bmp, 0, 0, w, h);
            return m.decode(ctx.getImageData(0, 0, cv.width, cv.height));
          };
          return attempt(false) || attempt(true) || null;
        });
      });
    }).catch(function () { return null; });
  }
  function startCamera(video, onCode, msg, keep) {
    const onCode0 = onCode; onCode = function (c) { beep(); onCode0(c); };
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg('No camera here. Type the number instead.'); return Promise.resolve(null); }
    let stream = null, timer = null, stopped = false, last = '', seen = 0;
    const stop = function () { stopped = true; clearTimeout(timer); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); };
    const native = 'BarcodeDetector' in window ? window.BarcodeDetector.getSupportedFormats().then(function (f) { return f.indexOf('ean_13') >= 0 ? new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }) : null; }).catch(function () { return null; }) : Promise.resolve(null);
    return Promise.all([navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }), native])
      .then(function (r) {
        stream = r[0]; const det = r[1];
        if (stopped) { stop(); return null; }
        // The phone's flashlight, where the camera allows it (most Android phones; not iPhone in the browser).
        try { const tr = stream.getVideoTracks()[0], caps = tr.getCapabilities ? tr.getCapabilities() : {}; if (caps.torch) stop.torch = function (on) { return tr.applyConstraints({ advanced: [{ torch: on }] }); }; } catch (e) {}
        video.srcObject = stream; video.play().catch(function () {});
        const zx = det ? Promise.resolve(null) : import('./barcode.js');
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
        // The same number twice in a row counts, so one blurry frame can't give a wrong code.
        // keep = scanning several: stay on, and ignore the same code for a moment after it's read.
        const recent = {};
        const got = function (c) { if (!c || stopped) return false; if (c === last) seen++; else { last = c; seen = 1; } if (seen >= 2 && validBarcode(c)) { if (keep) { const t = Date.now(); last = ''; seen = 0; if (recent[c] && t - recent[c] < 3000) return false; recent[c] = t; onCode(c); return false; } stop(); onCode(c); return true; } return false; };
        const tick = function () {
          if (stopped) return;
          if (video.readyState < 2) { timer = setTimeout(tick, 150); return; }
          if (det) { det.detect(video).then(function (b) { if (!got(b[0] && b[0].rawValue)) timer = setTimeout(tick, 120); }, function () { timer = setTimeout(tick, 250); }); return; }
          zx.then(function (m) {
            if (stopped) return;
            const w = video.videoWidth, h = video.videoHeight, ch = Math.round(h * 0.5);
            canvas.width = w; canvas.height = ch; ctx.drawImage(video, 0, (h - ch) / 2, w, ch, 0, 0, w, ch);
            if (!got(m.decode(ctx.getImageData(0, 0, w, ch)))) timer = setTimeout(tick, 120);
          }, function () { msg('Couldn\'t load the barcode reader. Type the number instead.'); });
        };
        tick();
        return stop;
      }, function () { msg('Camera not available. Allow camera access, or type the number.'); return null; });
  }

  // You → My foods: edit or delete your own foods, recipes and meals.
  // Foods tab, laid out like Cronometer: a card each for Meals, Recipes and Foods (tap to open the list, or create one),
  // then insights from your diary at the bottom.
  let foodsView = null, foodsSearch = false, fvSnap = ''; // fvSnap: the Foods page behind an open list (shown while swiping back)
  const MF_IC = {
    log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/><path d="M12 8v4l3 2"/></svg>',
    kcal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.5 1 2.5 2 3 .5-3-.5-5.5.5-8z"/></svg>',
    p: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11M4 9l5-5M15 20l5-5M3 12l3-3M12 21l-3 3M18 6l3-3"/></svg>',
    hi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4M11 8v6M8 11h6"/></svg>'
  };
  // Foods → Meal planner: a whole day of meals built for your targets.
  function forDayHtml() {
    const pl = makePlan(activeEnergy());
    const CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M8 14h4M8 17h7"/></svg>';
    return '<div class="group-label mf-ins-l">For your day</div>' +
      '<button type="button" class="card fd-plan" data-plan-day><span class="ico ic-c-green">' + CAL + '</span><span class="grow"><b>Meal planner</b><small>' +
      (!pl ? 'Set your targets to plan a day' : 'A full day of meals for ' + fmtKcal(roundKcal(pl.target)) + ' kcal') +
      '</small></span>' + CHEV + '</button>';
  }
  function renderFoods() {
    const box = $('#foodsBox'); if (!box || state.ui.tab !== 'foods') return;
    const byName = function (a, b) { return a.name.localeCompare(b.name); };
    const sw = $('#mfSearchWrap'); if (sw) sw.hidden = !(foodsSearch || foodsView);
    $('#mfHead').innerHTML = ''; $('#panel-foods .page-head').hidden = !!foodsView;
    const sb = $('#mfSearchBtn'); if (sb) { sb.hidden = !!foodsView; sb.setAttribute('aria-pressed', foodsSearch); }
    // Each row: a picture for the kind of food, the name, a small protein/carbs/fat bar with its serving, and the calories.
    const fq = normText(($('#mfQ') || {}).value || '').trim();
    const row = function (kind, id, t, sub, kc, m) {
      if (fq && normText(t).indexOf(fq) < 0) return '';
      const ic = kind === 'food' ? (ftGuess(t, '') || 'mine') : kind;
      return '<button type="button" class="row mf-row" data-mf="' + kind + '" data-id="' + id + '">' + ftIcon(ic) + '<div class="grow"><div class="row-t">' + esc(t) + '</div><div class="row-s mf-sub">' + (m ? mealMacros(m) : '') + '<span class="mf-s">' + sub + '</span></div></div>' + (kc != null ? '<span class="row-v num mf-k">' + fmtKcal(kc) + '<small>kcal</small></span>' : CHEV) + '</button>';
    };
    const ADD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12M12 6v12"/></svg>';
    const lists = {
      food: function () { return state.myFoods.slice().sort(function (a, b) { const oa = !a.ok && oddMacros(a.kcal, a.p, a.c, a.f), ob = !b.ok && oddMacros(b.kcal, b.p, b.c, b.f); return (ob ? 1 : 0) - (oa ? 1 : 0) || byName(a, b); }).map(function (c) { return row('food', c.id, c.name, '1 ' + esc(c.unit) + (c.g ? ' (' + fmtQty(c.g) + ' g)' : '') + (!c.ok && oddMacros(c.kcal, c.p, c.c, c.f) ? ' · <span class="odd-tag">Check numbers</span>' : ''), c.kcal, { p: c.p, c: c.c, f: c.f }); }); },
      recipe: function () {
        if (!foodDB && state.recipes.some(function (rc) { return needsDB(rc.id); })) loadFoods().then(renderFoods, function () {});
        return state.recipes.slice().sort(byName).map(function (rc) { const f = foodDB || !needsDB(rc.id) ? recipeFood(rc) : null, mm = f ? macrosFor(f, unitsFor(f)[0].g) : null; return row('recipe', rc.id, rc.name, rc.items.length + ' ingredient' + (rc.items.length === 1 ? '' : 's') + ' · per serving', mm ? mm.kcal : null, mm ? { p: mm.protein, c: mm.carbs, f: mm.fat } : null); });
      },
      meal: function () { return state.meals.slice().sort(byName).map(function (m) { const k = m.items.reduce(function (a, f) { return a + f.kcal; }, 0); const t = m.items.reduce(function (a, x) { a.p += x.protein || 0; a.c += x.carbs || 0; a.f += x.fat || 0; return a; }, { p: 0, c: 0, f: 0 }); return row('meal', m.id, m.name, m.items.length + ' food' + (m.items.length === 1 ? '' : 's'), k, t); }); }
    };
    const TITLE = { meal: 'Meals', recipe: 'Recipes', food: 'Your foods', repeat: 'Repeat items' };
    const notes = function () {
      let h = '';
      const dupN = dupGroups().length;
      if (dupN) h += '<button type="button" class="text-btn odd-note dup-note" data-action="dups">' + dupN + (dupN === 1 ? ' food looks' : ' foods look') + ' like a copy of another. Review ›</button>';
      const oddN = state.myFoods.filter(function (c) { return !c.ok && oddMacros(c.kcal, c.p, c.c, c.f); }).length;
      if (oddN) h += '<p class="muted-note odd-note">' + oddN + (oddN === 1 ? ' food has' : ' foods have') + ' calories that don\'t match the protein, carbs and fat. Tap to check.</p>';
      return h;
    };
    // One list (after tapping a card).
    if (foodsView === 'repeat') {
      $('#mfHead').innerHTML = '<div class="mf-lhead"><button type="button" class="back-btn" data-mf-back aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><h2>Repeat items</h2><button type="button" class="mf-add" data-mf="repeat">' + ADD + 'New</button></div>';
      const rl = repeatListHtml(fq); repSug = rl.sug;
      box.innerHTML = rl.html || '<p class="muted-note fd-empty">Nothing here matches “' + esc(($('#mfQ') || {}).value || '') + '”.</p>';
      return;
    }
    if (foodsView) {
      const k = foodsView, all = lists[k](), vis = all.filter(Boolean);
      const EMPTY = { meal: 'No meals yet. Build one, or save one from ⋯ on a meal in your Diary.', recipe: 'No recipes yet. Build one from ingredients and it works out each serving.', food: 'No foods of your own yet. Add one from its label, or anything that isn\'t in the list.' };
      $('#mfHead').innerHTML = '<div class="mf-lhead"><button type="button" class="back-btn" data-mf-back aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><h2>' + TITLE[k] + '</h2>' + (k === 'recipe' ? '<button type="button" class="mf-add mf-paste" data-mf-paste>Paste</button>' : '') + '<button type="button" class="mf-add" data-mf="' + k + '">' + ADD + 'New</button></div>';
      box.innerHTML = (k === 'food' ? notes() : '') +
        (vis.length ? '<div class="list">' + vis.join('') + '</div>' : fq && all.length ? '<p class="muted-note fd-empty">Nothing here matches “' + esc(($('#mfQ') || {}).value || '') + '”.</p>' : '<p class="muted-note fd-empty">' + EMPTY[k] + '</p>');
      return;
    }
    // Searching from the main page: results from all three.
    if (fq) {
      let html = '';
      ['meal', 'recipe', 'food'].forEach(function (k) { const vis = lists[k]().filter(Boolean); if (vis.length) html += '<div class="group-label">' + TITLE[k] + '</div><div class="list">' + vis.join('') + '</div>'; });
      box.innerHTML = html || '<p class="muted-note fd-empty">Nothing here matches “' + esc(($('#mfQ') || {}).value || '') + '”.</p>';
      return;
    }
    const n = { meal: state.meals.length, recipe: state.recipes.length, food: state.myFoods.length, repeat: state.repeats.length };
    // Four tiles: tap one to open its list, + to make a new one. A short line says what it's for until you have some.
    const TAG = { meal: 'Log a whole meal in one tap', recipe: 'Works out each serving', food: 'Straight from a label', repeat: 'Added for you each day' };
    const UNIT = { meal: ['meal', 'meals'], recipe: ['recipe', 'recipes'], food: ['food', 'foods'], repeat: ['item', 'items'] };
    const tile = function (k, title) {
      return '<div class="mf-tile" role="button" tabindex="0" data-mf-open="' + k + '"><div class="mf-t-top">' + (k === 'repeat' ? '<span class="ft-ico rp-ic">' + REP_IC + '</span>' : ftIcon(k === 'food' ? 'mine' : k)) +
        '<button type="button" class="mf-t-add" data-mf="' + k + '" aria-label="New">' + ADD + '</button></div><div class="mf-t-t">' + title + '</div><div class="mf-t-s">' + (n[k] ? n[k] + ' ' + UNIT[k][n[k] === 1 ? 0 : 1] : TAG[k]) + '</div></div>';
    };
    box.innerHTML = (state.myFoods.length ? notes() : '') +
      '<div class="mf-grid">' + tile('meal', 'Meals') + tile('recipe', 'Recipes') + tile('food', 'Your foods') + tile('repeat', 'Repeat items') + '</div>' +
      forDayHtml();
  }
  $('#mfQ').addEventListener('input', function () { renderFoods(); });
  let repSug = [];
  function mfClick(e) {
    const rp = e.target.closest('[data-rep]');
    if (rp) { const r = state.repeats.find(function (x) { return x.id === rp.dataset.rep; }); if (r) { buzz('light'); repeatSheet(r); } return; }
    const ra = e.target.closest('[data-rep-all]');
    if (ra) { buzz('light'); if (ra.dataset.repAll === 'resume') { const snap = snapshot(); state.repeats.forEach(function (r) { r.paused = false; r.until = null; r.u = Date.now(); }); applyRepeats(); save(); renderAll(); toast('Repeat items resumed', function () { restore(snap); }); } else pauseAllSheet(); return; }
    const rs = e.target.closest('[data-rsug]');
    if (rs) { const sg = repSug[+rs.dataset.rsug]; if (sg) { buzz('light'); repeatSheet({ item: repItemCopy(sg.item), meal: sg.meal, days: [] }); } return; }
    const b = e.target.closest('[data-mf]');
    if (b) { buzz('light'); addFoodSheet(null, null, null, null, false, { kind: b.dataset.mf, item: b.dataset.id || null }); return; }
    if (e.target.closest('[data-mf-paste]')) { buzz('light'); addFoodSheet(null, null, null, null, false, { kind: 'recipe', paste: true }); return; }
    if (e.target.closest('[data-mf-back]')) { buzz('light'); pageMove('pop', function () { if (foodsView) navDrop('fv'); foodsView = null; $('#mfQ').value = ''; renderFoods(); }); return; }
    const o = e.target.closest('[data-mf-open]');
    if (o) { buzz('light'); pageMove('push', function () { if (!foodsView) { fvSnap = $('#foodsBox').innerHTML; navPush('fv'); } foodsView = o.dataset.mfOpen; foodsSearch = false; $('#mfQ').value = ''; renderFoods(); }); }
  }
  $('#foodsBox').addEventListener('click', mfClick); $('#mfHead').addEventListener('click', mfClick);
  $('#mfSearchBtn').addEventListener('click', function () { foodsSearch = !foodsSearch; buzz('light'); if (!foodsSearch) $('#mfQ').value = ''; renderFoods(); if (foodsSearch) $('#mfQ').focus(); });

  // A logged food with actions behind it: swipe right for ⋯, then Copy, Adjust (recipes) and Delete.
  const COPY_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>';
  const ADJ_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';
  function swRow(f, rowHtml, delOnly) {
    const act = function (k, cls, ic, label) { return '<button type="button" class="sw-btn ' + cls + '" data-sw-act="' + k + '" data-id="' + f.id + '" tabindex="-1">' + ic + '<span>' + label + '</span></button>'; };
    return '<div class="sw" data-sw="' + f.id + '"' + (delOnly ? ' data-nodrag' : '') + '><div class="sw-acts">' + act('del', 'sw-del', TRASH, 'Delete') + '</div>' + rowHtml + '</div>';
  }
  // Tap the calories on a logged food: ½×, ¾×, 1¼×, 1½× or 2× without opening it.
  function scaleItem(it, k) {
    const r1 = function (v) { return Math.round(v * 10) / 10; };
    if (it.ref) {
      const f = itemFood(it); if (!f) return false;
      it.qty = Math.round(it.qty * k * 1000) / 1000; it.g = r1(it.g * k);
      const m = macrosFor(f, it.g); Object.assign(it, { kcal: Math.min(m.kcal, 10000), protein: m.protein, carbs: m.carbs, fat: m.fat });
      return true;
    }
    it.kcal = Math.min(10000, Math.round(it.kcal * k)); it.protein = Math.round(it.protein * k); it.carbs = Math.round(it.carbs * k); it.fat = Math.round(it.fat * k);
    if (it.n) Object.keys(it.n).forEach(function (x) { it.n[x] = Math.round(it.n[x] * k * 1000) / 1000; });
    if (it.mi) it.mi.forEach(function (x) { if (x.ref) { x.qty = Math.round(x.qty * k * 1000) / 1000; x.g = r1(x.g * k); } x.kcal = Math.round(x.kcal * k); x.protein = Math.round(x.protein * k); x.carbs = Math.round(x.carbs * k); x.fat = Math.round(x.fat * k); });
    return true;
  }
  function quickAmount(anchor, id) {
    const d = viewDay, it = foodFor(d).find(function (x) { return x.id === id; }); if (!it) return;
    buzz('light');
    const opt = function (k, label) { return { label: label + ' · ' + fmtKcal(Math.round(it.kcal * k)) + ' kcal', run: function () { const snap = snapshot(); if (!scaleItem(it, k)) { toast('Open it to change the amount'); return; } save(); renderAll(); toast('Amount changed', function () { restore(snap); }); } }; };
    popMenu(anchor, [opt(0.5, '½×'), opt(0.75, '¾×'), opt(1.25, '1¼×'), opt(1.5, '1½×'), opt(2, '2×'), { label: 'Other amount…', run: function () { foodItemSheet(id, d); } }]);
  }
  function removeFoodItem(id, date) {
    const d = date || viewDay, snap = snapshot(), f = foodFor(d).find(function (x) { return x.id === id; });
    if (!f) return;
    state.food[d] = foodFor(d).filter(function (x) { return x.id !== id; });
    if (!state.food[d].length) delete state.food[d];
    save(); renderAll(); buzz('medium'); toast('Removed ' + (f.name || 'food'), function () { restore(snap); });
  }
  // Hold a logged food (without dragging): its shortcuts in one place.
  function quickSheet(id, date) {
    const d = date || viewDay, it = foodFor(d).find(function (x) { return x.id === id; }); if (!it) return;
    const fav = it.ref && isFav(it.ref), sub = (it.ref ? fmtAmt(it.qty, it.unit) + ' · ' : '') + fmtKcal(it.kcal) + ' kcal';
    const r = function (k, ic, t, cls) { return '<button type="button" class="row qs-row' + (cls ? ' ' + cls : '') + '" data-qs="' + k + '"><span class="qs-ic">' + ic + '</span><div class="grow row-t">' + t + '</div></button>'; };
    openSheet('<div class="sheet-head qs-head">' + diaryIcon(it) + '<div class="grow" style="min-width:0"><h2 class="sheet-title" id="sheetTitle">' + esc(it.name || 'Quick add') + '</h2><div class="label faint">' + esc(sub) + ' · ' + esc(mealName(mealOf(it))) + '</div></div></div>' +
      '<div class="list">' +
        (it.plan && d <= todayISO() ? r('eat', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>', 'Mark as eaten') : '') +
        r('dup', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>', 'Add another') +
        r('time', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>', 'Change time' + (it.t ? ' <span class="qs-v">' + esc(fmtHM(it.t)) + '</span>' : '')) +
        r('copy', COPY_IC, 'Copy to another day') +
        r('rep', REP_IC, it.rep && state.repeats.some(function (x) { return x.id === it.rep; }) ? 'Edit repeat' : 'Repeat this') +
        (it.ref ? r('fav', STAR(fav), fav ? 'Remove from favorites' : 'Add to favorites') : '') +
      '</div>' +
      '<div class="label faint fd-sec">Move to</div><div class="qs-meals">' + MEALS.filter(function (m) { return m[0] !== mealOf(it); }).map(function (m) { return '<button type="button" data-qm="' + m[0] + '">' + mealIcon(m[0]) + '<span>' + esc(m[1]) + '</span></button>'; }).join('') + '</div>' +
      '<div class="list" style="margin-top:14px">' + r('del', TRASH, it.rep ? 'Skip today <span class="qs-v">Only this day; it repeats as usual</span>' : 'Delete', 'danger') + '</div>', function (body) {
      $$('[data-qs]', body).forEach(function (b) { b.addEventListener('click', function () {
        const k = b.dataset.qs; closeSheet();
        if (k === 'time') setTimeout(function () { timeSheet(id, d); }, 260);
        else if (k === 'copy') setTimeout(function () { copyItemSheet(id, d); }, 260);
        else if (k === 'rep') setTimeout(function () { const ex = it.rep && state.repeats.find(function (x) { return x.id === it.rep; }); repeatSheet(ex || { item: repItemCopy(it), meal: mealOf(it), days: [] }); }, 260);
        else if (k === 'del') removeFoodItem(id, d);
        else if (k === 'dup') { const snap = snapshot(), c = Object.assign({}, it, { id: newId() }); delete c.u; delete c.pic; addItems(d, [c]); save(); renderAll(); buzz('success'); toast('Added another ' + (it.name || 'food'), function () { restore(snap); }); }
        else if (k === 'eat') { const snap = snapshot(); delete it.plan; if (d === todayISO()) it.t = nowHM(); save(); renderAll(); eatenFlash(it.id); buzz('success'); toast('Marked as eaten', function () { restore(snap); }); }
        else if (k === 'fav') { if (fav) state.favs = state.favs.filter(function (x) { return x !== it.ref; }); else state.favs.unshift(it.ref); save(); buzz('light'); toast(fav ? 'Removed from favorites' : 'Added to favorites'); }
      }); });
      $$('[data-qm]', body).forEach(function (b) { b.addEventListener('click', function () {
        const snap = snapshot(); it.meal = b.dataset.qm; closeSheet(); save(); renderAll(); buzz('success'); toast('Moved to ' + mealName(it.meal), function () { restore(snap); });
      }); });
    });
  }
  // When you ate it (from the hold menu).
  function timeSheet(id, date) {
    const d = date || viewDay, it = foodFor(d).find(function (x) { return x.id === id; }); if (!it) return;
    openSheet('<div class="sheet-head"><div class="grow" style="min-width:0"><div class="label faint">' + esc(it.name || 'Quick add') + '</div><h2 class="sheet-title" id="sheetTitle">Change time</h2></div></div>' +
      '<div class="field"><input class="input tm-in" type="time" id="tmT" value="' + (it.t || nowHM()) + '" aria-label="Time eaten" /></div>' +
      '<div class="tm-chips"><button type="button" data-tm="now">Now</button>' + (it.t ? '<button type="button" data-tm="clear">No time</button>' : '') + '</div>' +
      '<div class="sheet-foot"><button type="button" class="btn primary block" id="tmSave">Save</button></div>', function (root) {
      const T = $('#tmT', root);
      $$('[data-tm]', root).forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.tm === 'now') T.value = nowHM(); else T.value = ''; buzz('light'); }); });
      $('#tmSave', root).addEventListener('click', function () {
        const snap = snapshot(), v = T.value;
        if (/^\d\d:\d\d$/.test(v)) it.t = v; else delete it.t;
        save(); renderAll(); closeSheet(); buzz('success'); toast(it.t ? 'Time set to ' + fmtHM(it.t) : 'Time removed', function () { restore(snap); });
      });
    });
  }
  // Copy one logged food: to today/tomorrow or any day, into whichever meal.
  function copyItemSheet(id, date) {
    const d = date || viewDay, f = foodFor(d).find(function (x) { return x.id === id; });
    if (!f) return;
    const today = todayISO(), other = d === today ? isoFromDay(dayNum(today) + 1) : today;
    let ml = f.meal;
    openSheet('<div class="sheet-head"><div class="grow" style="min-width:0"><div class="label faint">' + esc(f.name || 'Quick add') + ' · ' + fmtKcal(f.kcal) + ' kcal</div><h2 class="sheet-title" id="sheetTitle">Copy to</h2></div></div>' +
      '<div class="field"><span>Meal</span><select class="input" id="ciMeal" aria-label="Meal">' + MEALS.map(function (m) { return '<option value="' + m[0] + '"' + (m[0] === ml ? ' selected' : '') + '>' + m[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="list">' +
        '<button type="button" class="row" data-ci="' + d + '"><div class="grow row-t">' + esc(relDate(d)) + ' <span class="faint">(again)</span></div>' + CHEV + '</button>' +
        '<button type="button" class="row" data-ci="' + other + '"><div class="grow row-t">' + esc(relDate(other)) + '</div>' + CHEV + '</button>' +
        '<label class="row" style="position:relative"><div class="grow row-t">Another day</div>' + CHEV + '<input type="date" id="ciPick" aria-label="Copy to another day" style="position:absolute;inset:0;opacity:0;width:100%;height:100%;border:0" /></label>' +
      '</div>',
      function (root) {
        const go = function (to) { if (!/^\d{4}-\d{2}-\d{2}$/.test(to)) return; closeSheet(); copyFood([Object.assign({}, f, { meal: ml })], to, 'Copied to ' + relDate(to)); };
        $('#ciMeal', root).addEventListener('change', function () { ml = this.value; buzz('light'); });
        $$('[data-ci]', root).forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.ci); }); });
        $('#ciPick', root).addEventListener('change', function () { go(this.value); });
      });
  }
  // Copy foods to a day (new ids, same meals).
  function copyFood(items, to, label) {
    if (!items.length) return;
    const snap = snapshot();
    addItems(to, items.map(function (it) { return Object.assign({}, it, { id: newId() }); }));
    save(); renderAll(); buzz('success');
    toast((label || 'Copied') + ' · ' + items.length + (items.length === 1 ? ' food' : ' foods'), function () { restore(snap); });
  }
  // A tidy picture of a day (for a coach or a friend): totals, macros and every food by meal.
  function shareDay(d) {
    const its = eatenFor(d), tt = dayTotals(d), pl = dayPlan(d), W = 1080, pad = 72, cs = getComputedStyle(document.documentElement);
    const col = function (v, fb) { return (cs.getPropertyValue(v) || '').trim() || fb; };
    const groups = MEALS.map(function (m) { return { n: m[1], items: its.filter(function (f) { return mealOf(f) === m[0] && !isDailyTotal(f); }) }; }).filter(function (g) { return g.items.length; });
    const H = 520 + groups.reduce(function (a, g) { return a + 74 + g.items.length * 58; }, 0) + 90;
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const font = function (w, s) { x.font = w + ' ' + s + 'px Figtree, system-ui, sans-serif'; };
    x.fillStyle = '#f3f4f6'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect ? x.roundRect(36, 36, W - 72, H - 72, 44) : x.rect(36, 36, W - 72, H - 72); x.fill();
    x.fillStyle = '#9ba1ac'; font('600', 34); x.fillText(fmtDate(d, { weekday: 'long', month: 'long', day: 'numeric' }), pad, 130);
    x.fillStyle = '#111318'; font('800', 96); x.fillText(fmtKcal(tt.kcal), pad, 245); const kw = x.measureText(fmtKcal(tt.kcal)).width;
    x.fillStyle = '#5f6673'; font('600', 40); x.fillText('kcal' + (pl ? ' of ' + fmtKcal(roundKcal(pl.target)) : ''), pad + kw + 18, 245);
    const mac = [['Protein', tt.protein, pl && pl.protein, col('--mp', '#2f9e6e')], ['Carbs', tt.carbs, pl && pl.carbs, col('--mc', '#3d84c6')], ['Fat', tt.fat, pl && pl.fat, col('--mf', '#8b5cf6')]], bw = (W - pad * 2 - 2 * 36) / 3;
    mac.forEach(function (m, i) { const x0 = pad + i * (bw + 36); x.fillStyle = '#5f6673'; font('600', 30); x.fillText(m[0], x0, 320); x.fillStyle = '#111318'; font('800', 40); x.fillText(m[1] + (m[2] ? ' / ' + m[2] : '') + ' g', x0, 372); x.fillStyle = '#eef0f3'; x.fillRect(x0, 394, bw, 12); x.fillStyle = m[3]; x.fillRect(x0, 394, bw * Math.min(1, m[2] ? m[1] / m[2] : 0), 12); });
    let y = 480;
    groups.forEach(function (g) {
      x.fillStyle = '#111318'; font('800', 38); x.fillText(g.n, pad, y + 30); const gk = fmtKcal(g.items.reduce(function (a, f) { return a + f.kcal; }, 0)) + ' kcal'; x.fillStyle = '#9ba1ac'; font('600', 32); x.fillText(gk, W - pad - x.measureText(gk).width, y + 30); y += 74;
      g.items.forEach(function (f) { let nm = f.name || 'Quick add'; font('500', 34); while (x.measureText(nm).width > W - pad * 2 - 180 && nm.length > 4) nm = nm.slice(0, -2); if (nm !== (f.name || 'Quick add')) nm = nm.trim() + '…'; x.fillStyle = '#2a2f37'; x.fillText(nm, pad + 8, y + 10); const kk = fmtKcal(f.kcal); x.fillStyle = '#5f6673'; x.fillText(kk, W - pad - x.measureText(kk).width, y + 10); y += 58; });
      y += 16;
    });
    x.fillStyle = '#12946a'; font('800', 30); x.fillText('Setpoint', pad, H - 80);
    c.toBlob(function (blob) {
      const file = new File([blob], 'setpoint-' + d + '.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: 'My day · Setpoint' }).catch(function () {});
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast('Image saved'); }
    }, 'image/png');
  }
  // The last 30 days on one image: averages, days on target, weight change, best day, most eaten foods.
  function shareMonth() { return onePass(shareMonthNow); }
  function shareMonthNow() {
    const today = dayNum(todayISO()), days = [];
    for (let d = today - 29; d <= today; d++) { const iso = isoFromDay(d), t = dayTotals(iso), pl = dayPlan(iso); if (t.kcal > 0) days.push({ iso: iso, t: t, tg: pl ? roundKcal(pl.target) : null, p: pl ? pl.protein : null }); }
    if (days.length < 3) { toast('Log a few more days first'); return; }
    const avg = function (k) { return Math.round(days.reduce(function (a, x) { return a + x.t[k]; }, 0) / days.length); };
    const withT = days.filter(function (x) { return x.tg; }), onT = withT.filter(function (x) { return Math.abs(x.t.kcal - x.tg) <= x.tg * 0.1; }).length;
    const tAvg = withT.length ? Math.round(withT.reduce(function (a, x) { return a + x.tg; }, 0) / withT.length) : null;
    const w0 = trendAt(today - 29), w1 = currentKg(), cnt = {};
    days.forEach(function (x) { eatenFor(x.iso).forEach(function (it) { if (isDailyTotal(it) || isImported(it)) return; const n = (it.name || '').split(',')[0].slice(0, 26); if (n) cnt[n] = (cnt[n] || 0) + 1; }); });
    const top = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).slice(0, 5);
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), pad = 80;
    const cs = getComputedStyle(document.documentElement), acc = (cs.getPropertyValue('--accent') || '#0f9a6c').trim();
    const font = function (w, s) { x.font = w + ' ' + s + 'px Figtree, system-ui, sans-serif'; };
    x.fillStyle = '#f3f5f4'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(40, 40, W - 80, H - 80, 48) : x.rect(40, 40, W - 80, H - 80); x.fill();
    x.fillStyle = acc; font('800', 34); x.fillText('SETPOINT · LAST 30 DAYS', pad, 130);
    x.fillStyle = '#111'; font('800', 64); x.fillText(fmtDate(isoFromDay(today - 29), { month: 'short', day: 'numeric' }) + ' – ' + fmtDate(isoFromDay(today), { month: 'short', day: 'numeric' }), pad, 215);
    const tiles = [[fmtKcal(avg('kcal')), 'avg kcal' + (tAvg ? ' / ' + fmtKcal(tAvg) : '')], [avg('protein') + ' g', 'avg protein'], [onT + ' / ' + days.length, 'days on target'], [w0 != null && w1 != null ? (w1 - w0 > 0 ? '+' : '') + fmtW(w1 - w0) + ' ' + unit() : '–', 'weight trend']];
    tiles.forEach(function (tl, i) { const cx = pad + (i % 2) * 470, cy = 290 + Math.floor(i / 2) * 210; x.fillStyle = '#f2f5f3'; x.beginPath(); x.roundRect ? x.roundRect(cx, cy, 440, 180, 28) : x.rect(cx, cy, 440, 180); x.fill(); x.fillStyle = '#111'; font('800', 62); x.fillText(tl[0], cx + 36, cy + 95); x.fillStyle = '#6b7570'; font('600', 30); x.fillText(tl[1], cx + 36, cy + 145); });
    let y = 770; x.fillStyle = '#111'; font('800', 40); x.fillText('Most eaten', pad, y); y += 30;
    top.forEach(function (n, i) { y += 64; x.fillStyle = acc; font('800', 34); x.fillText(String(i + 1), pad, y); x.fillStyle = '#2a2f2c'; font('600', 36); x.fillText(n, pad + 56, y); const k = cnt[n] + '×'; x.fillStyle = '#8a948f'; x.fillText(k, W - pad - x.measureText(k).width, y); });
    x.fillStyle = '#8a948f'; font('600', 28); x.fillText(days.length + ' days logged', pad, H - 90);
    c.toBlob(function (blob) {
      const file = new File([blob], 'setpoint-month-' + todayISO() + '.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: 'My month · Setpoint' }).catch(function () {});
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast('Image saved'); }
    }, 'image/png');
  }
  // ⋯ at the top of the Diary: copy this day, copy the day before into it, paste, or clear it.
  let clip = null; // { items, from } copied with "Copy day"
  try { clip = JSON.parse(sessionStorage.getItem('setpoint-clip')) || null; } catch (x) { clip = null; }
  // A break from dieting: eat at maintenance for as many days as you choose (one day is a refeed, with the extra as carbs).
  function breakSheet(d) {
    let n = 7;
    const range = function () { return n === 1 ? fmtDate(d, { weekday: 'long', month: 'short', day: 'numeric' }) : fmtDate(d, { month: 'short', day: 'numeric' }) + ' – ' + fmtDate(isoFromDay(dayNum(d) + n - 1), { month: 'short', day: 'numeric' }); };
    const draw = function (root) {
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">Take a break</h2></div></div>' +
        '<p class="sheet-text">Eat at maintenance instead of your usual target. A short break can help with energy, training and sticking with your plan.</p>' +
        '<div class="label faint fd-sec">How many days?</div>' +
        '<div class="rates br-days">' + [1, 2, 3, 5, 7, 14].map(function (k) { return '<button type="button" data-brk="' + k + '" aria-pressed="' + (k === n) + '">' + (k === 1 ? '1 day' : k + ' days') + '</button>'; }).join('') + '</div>' +
        '<div class="stat-box br-sum"><b>' + esc(range()) + '</b><span>' + (n === 1 ? 'A refeed day: the extra calories come from carbs' : 'A diet break: the extra calories are split between carbs and fat') + '</span></div>' +
        '<button type="button" class="btn primary block" id="brGo">' + (n === 1 ? 'Start 1-day break' : 'Start ' + n + '-day break') + '</button>';
      $$('[data-brk]', root).forEach(function (b) { b.addEventListener('click', function () { n = +b.dataset.brk; buzz('light'); draw(root); }); });
      $('#brGo', root).addEventListener('click', function () {
        const snap = snapshot(); for (let i = 0; i < n; i++) state.dayMode[isoFromDay(dayNum(d) + i)] = n === 1 ? 'f' : 'b';
        save(); renderAll(); closeSheet(); buzz('success'); toast(n === 1 ? 'Break: 1 day at maintenance' : 'Break: ' + n + ' days at maintenance', function () { restore(snap); });
      });
    };
    openSheet('<div id="brRoot"></div>', function (body) { draw($('#brRoot', body)); });
  }
  function dayMenu(date) {
    const d = date || viewDay, its = foodFor(d), prev = isoFromDay(dayNum(d) - 1), pits = foodFor(prev), n = function (k) { return k + (k === 1 ? ' food' : ' foods'); };
    const row = function (id, t, sub, off, danger) { return '<button type="button" class="row" id="' + id + '"' + (off ? ' disabled' : '') + '><div class="grow"><div class="row-t"' + (danger ? ' style="color:var(--danger)"' : '') + '>' + t + '</div>' + (sub ? '<div class="row-s">' + sub + '</div>' : '') + '</div></button>'; };
    openSheet('<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">Diary</h2></div></div>' +
      '<div class="list day-menu">' +
        row('dmCopy', 'Copy day', its.length ? n(its.length) : 'Nothing logged yet', !its.length) +
        row('dmPrev', 'Copy previous day', pits.length ? n(pits.length) + ' from ' + esc(relDate(prev)) : 'Nothing logged ' + esc(relDate(prev)), !pits.length) +
        (clip ? row('dmPaste', 'Paste', n(clip.items.length) + ' from ' + esc(relDate(clip.from))) : '') +
        (function () { const md = state.dayMode[d]; if (!md) return row('dmMode', 'Take a break', 'Eat at maintenance for a day or more'); let e = dayNum(d); while (state.dayMode[isoFromDay(e + 1)]) e++; return row('dmMode', 'End the break', 'Eating at maintenance' + (e > dayNum(d) ? ' until ' + esc(fmtDate(isoFromDay(e), { weekday: 'short', month: 'short', day: 'numeric' })) : ' today')); })() +
        row('dmPlan', 'Meal planner', 'A full day of meals for your targets') +
        row('dmShare', 'Share this day', 'An image of your food and totals') +
        (plannedFor(d).length ? row('dmEatAll', 'Mark planned food as eaten', n(plannedFor(d).length)) : '') +
        row('dmCats', 'Categories', MEALS.map(function (m) { return esc(m[1]); }).join(', ')) +
        row('dmClear', 'Delete all diary entries', its.length ? n(its.length) : '', !its.length, true) +
      '</div>',
      function (root) {
        $('#dmCopy', root).addEventListener('click', function () {
          clip = { items: its.map(function (it) { const c = Object.assign({}, it); delete c.id; return c; }), from: d };
          try { sessionStorage.setItem('setpoint-clip', JSON.stringify(clip)); } catch (x) {}
          closeSheet(); buzz('success'); toast('Copied ' + n(its.length) + '. Go to a day and tap Paste.');
        });
        $('#dmShare', root).addEventListener('click', function () { closeSheet(); shareDay(d); });
        $('#dmPlan', root).addEventListener('click', function () { closeSheet(); planDaySheet(d); });
        $('#dmMode', root).addEventListener('click', function () {
          if (!state.dayMode[d]) { buzz('light'); breakSheet(d); return; }
          const snap = snapshot(); let k = dayNum(d); while (state.dayMode[isoFromDay(k)]) { delete state.dayMode[isoFromDay(k)]; k++; }
          save(); renderAll(); closeSheet(); buzz('success'); toast('Back to normal', function () { restore(snap); });
        });
        if ($('#dmEatAll', root)) $('#dmEatAll', root).addEventListener('click', function () {
          const snap = snapshot(), its2 = plannedFor(d); its2.forEach(function (it) { delete it.plan; if (d === todayISO() && !it.t) it.t = nowHM(); });
          save(); renderAll(); closeSheet(); buzz('success'); toast('Eaten · ' + n(its2.length), function () { restore(snap); });
        });
        $('#dmCats', root).addEventListener('click', function () { buzz('light'); catsSheet(); });
        $('#dmPrev', root).addEventListener('click', function () { closeSheet(); copyFood(pits, d); });
        if (clip) $('#dmPaste', root).addEventListener('click', function () { closeSheet(); copyFood(clip.items, d, 'Pasted'); });
        $('#dmClear', root).addEventListener('click', function () {
          const snap = snapshot(), k = its.length;
          delete state.food[d];
          save(); renderAll(); closeSheet(); buzz('medium'); toast('Deleted ' + n(k), function () { restore(snap); });
        });
      });
  }
  // Share a recipe or meal as a link. Your own foods and scanned products in it travel along.
  function b64u(str) { return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(s); return new TextDecoder().decode(Uint8Array.from(bin, function (c) { return c.charCodeAt(0); })); }
  function shareLink(kind, obj) {
    const foods = {}, offs = {};
    obj.items.forEach(function (it) { if (!it.ref) return; const t = it.ref.charAt(0); if (t === 'c') { const c = state.myFoods.find(function (x) { return x.id === it.ref; }); if (c) foods[c.id] = c; } if (t === 'o') { const o = state.offFoods.find(function (x) { return x.id === it.ref; }); if (o) offs[o.id] = o; } });
    const payload = { v: 1, k: kind, d: kind === 'r' ? { name: obj.name, servings: obj.servings, cookedG: obj.cookedG, items: obj.items } : { name: obj.name, items: obj.items.map(function (it) { const c = Object.assign({}, it); delete c.id; delete c.meal; delete c.t; delete c.plan; return c; }) }, c: Object.keys(foods).map(function (k) { return foods[k]; }), o: Object.keys(offs).map(function (k) { return offs[k]; }) };
    const url = location.origin + location.pathname + '#s=' + b64u(JSON.stringify(payload));
    const title = obj.name + ' · Setpoint';
    if (navigator.share) navigator.share({ title: title, text: (kind === 'r' ? 'Recipe: ' : 'Meal: ') + obj.name, url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Link copied'); }, function () { toast('Couldn\'t copy the link'); });
  }
  function openShared(hash) {
    let pl; try { pl = JSON.parse(unb64u(hash)); } catch (e) { toast('That link didn\'t work'); return; }
    if (!pl || (pl.k !== 'r' && pl.k !== 'm') || !pl.d || !Array.isArray(pl.d.items) || typeof pl.d.name !== 'string') { toast('That link didn\'t work'); return; }
    const name = pl.d.name.slice(0, 60), n = pl.d.items.length;
    openSheet('<div class="sheet-head"><div><div class="label faint">Shared with you</div><h2 class="sheet-title" id="sheetTitle">' + esc(name) + '</h2></div></div>' +
      '<p class="sheet-text">' + (pl.k === 'r' ? 'A recipe' : 'A meal') + ' with ' + n + ' food' + (n === 1 ? '' : 's') + ': ' + esc(pl.d.items.slice(0, 6).map(function (x) { return x.name || 'Quick add'; }).join(', ')) + (n > 6 ? '…' : '') + '.</p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="shNo">Not now</button><button type="button" class="btn primary" id="shGo">Add to My foods</button></div>',
      function (root) {
        $('#shNo', root).addEventListener('click', function () { closeSheet(); });
        $('#shGo', root).addEventListener('click', function () {
          const snap = snapshot(), map = {};
          // Bring their own foods in as yours (new ids), and scanned products as they are; then run it all through migrate.
          (pl.c || []).forEach(function (c) { if (c && typeof c.id === 'string') { const id = 'c' + newId(); map[c.id] = id; state.myFoods.push(Object.assign({}, c, { id: id })); } });
          (pl.o || []).forEach(function (o) { if (o && typeof o.id === 'string' && !state.offFoods.some(function (x) { return x.id === o.id; })) state.offFoods.unshift(o); });
          const fix = function (it) { const c = Object.assign({}, it); if (c.ref && map[c.ref]) c.ref = map[c.ref]; return c; };
          if (pl.k === 'r') state.recipes.push({ id: 'r' + newId(), name: name, servings: pl.d.servings, cookedG: pl.d.cookedG, items: pl.d.items.map(fix) });
          else state.meals.push({ id: 'm' + newId(), name: name.slice(0, 40), items: pl.d.items.map(fix) });
          const clean = migrate(JSON.parse(JSON.stringify(state)));
          state.myFoods = clean.myFoods; state.offFoods = clean.offFoods; state.recipes = clean.recipes; state.meals = clean.meals;
          save(); renderAll(); closeSheet(); buzz('success'); toast('Added to My foods', function () { restore(snap); });
        });
      });
  }
  // App lock: a passkey on this device (Face ID, Touch ID or your passcode). It stays on this device only.
  const LOCK_KEY = 'setpoint-lock';
  function lockCfg() { try { return JSON.parse(localStorage.getItem(LOCK_KEY)) || null; } catch (e) { return null; } }
  function lockSupported() { return !!(window.PublicKeyCredential && navigator.credentials && window.isSecureContext); }
  const rnd = function (n) { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; };
  const toB = function (buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }, fromB = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };
  function lockSetup() {
    return navigator.credentials.create({ publicKey: { challenge: rnd(32), rp: { name: 'Setpoint' }, user: { id: rnd(16), name: 'Setpoint', displayName: 'Setpoint' }, pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }], authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, timeout: 60000 } })
      .then(function (c) { localStorage.setItem(LOCK_KEY, JSON.stringify({ id: toB(c.rawId) })); return true; });
  }
  function lockVerify() {
    const cfg = lockCfg(); if (!cfg) return Promise.resolve(true);
    return navigator.credentials.get({ publicKey: { challenge: rnd(32), allowCredentials: [{ type: 'public-key', id: fromB(cfg.id) }], userVerification: 'required', timeout: 60000 } }).then(function () { return true; });
  }
  let lockedAt = 0;
  function showLock() { if (!lockCfg()) return; const el = $('#lockScreen'); el.hidden = false; document.body.classList.add('locked'); }
  function unlock() { lockVerify().then(function () { $('#lockScreen').hidden = true; document.body.classList.remove('locked'); buzz('success'); }, function () { buzz('warn'); }); }
  $('#lockGo').addEventListener('click', unlock);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') lockedAt = Date.now(); else if (lockCfg() && lockedAt && Date.now() - lockedAt > 60000) showLock(); });
  showLock();
  // Nutrition label → numbers. Tesseract runs on the phone (downloaded once from a CDN, then cached).
  let tessP = null;
  function loadTess() { if (!tessP) tessP = new Promise(function (ok, no) { if (window.Tesseract) return ok(window.Tesseract); const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'; sc.onload = function () { ok(window.Tesseract); }; sc.onerror = function () { tessP = null; no(new Error('load')); }; document.head.appendChild(sc); }); return tessP; }
  function parseLabel(text) {
    const t = text.toLowerCase().replace(/,(\d)/g, '.$1').replace(/[|]/g, ' ').replace(/\bo(?=\s*g\b)/g, '0');
    const num = function (re) { const m = re.exec(t); return m ? parseFloat(m[1]) : null; };
    let kcal = num(/(\d+(?:\.\d+)?)\s*kcal/) ; if (kcal == null) kcal = num(/calories[^\d]{0,20}(\d+(?:\.\d+)?)/);
    if (kcal == null) { const kj = num(/(\d+(?:\.\d+)?)\s*kj/); if (kj != null) kcal = Math.round(kj / 4.184); }
    let fat = null; const fr = /(total\s+)?fat[^\d]{0,14}(\d+(?:\.\d+)?)\s*g/g; let m;
    while ((m = fr.exec(t))) { const before = t.slice(Math.max(0, m.index - 14), m.index); if (!/saturat|trans|mono|poly/.test(before)) { fat = parseFloat(m[2]); break; } }
    const out = {
      kcal: kcal, fat: fat,
      p: num(/protein[s]?[^\d]{0,14}(\d+(?:\.\d+)?)\s*g/),
      c: num(/carbohydrate[s]?[^\d]{0,16}(\d+(?:\.\d+)?)\s*g/) != null ? num(/carbohydrate[s]?[^\d]{0,16}(\d+(?:\.\d+)?)\s*g/) : num(/carbs?[^\d]{0,10}(\d+(?:\.\d+)?)\s*g/),
      fib: num(/fib(?:er|re)[^\d]{0,14}(\d+(?:\.\d+)?)\s*g/), sug: num(/sugars?[^\d]{0,14}(\d+(?:\.\d+)?)\s*g/), sat: num(/saturate[sd]?(?:\s+fat)?[^\d]{0,10}(\d+(?:\.\d+)?)\s*g/),
      g: num(/serving size[^\d]{0,24}(\d+(?:\.\d+)?)\s*(?:g|ml)/) || num(/\((\d+(?:\.\d+)?)\s*(?:g|ml)\)/)
    };
    const na = /sodium[^\d]{0,14}(\d+(?:\.\d+)?)\s*(mg|g)/.exec(t); if (na) out.na = parseFloat(na[1]) * (na[2] === 'g' ? 1000 : 1);
    if (!out.g && /per\s*100\s*(g|ml)/.test(t)) out.per100 = true;
    return out;
  }
  // Receipt / menu text → food lines: drop prices, totals and shop details, keep "2x Chicken shawarma".
  function menuLines(text) {
    const skip = /total|subtotal|tax|vat|service|cash|change|visa|card|tel|phone|order|table|date|time|receipt|invoice|thank|delivery|discount|tip|www|http|@|ضريبة|اجمالي|الإجمالي|خدمة|شكرا|فاتورة|توصيل|خصم/i;
    return text.split(/\n+/).map(function (l) {
      return l.replace(/\b(?:egp|le|l\.e|sar|aed|usd|eur|kwd|qar)\b\.?/gi, ' ').replace(/[$€£]|ج\.?م|جنيه|ريال|درهم/g, ' ')
        .replace(/\d+[.,]\d{2}\b/g, ' ').replace(/^\s*(\d+)\s*[x×*]\s*/i, '$1 ').replace(/\s[x×]\s*\d+\s*$/i, '').replace(/[|_=#~]+/g, ' ').replace(/\s+/g, ' ').trim();
    }).filter(function (l) { return l.length >= 3 && l.length <= 50 && /[a-zء-ي]{3}/i.test(l) && !skip.test(l); }).slice(0, 15);
  }
  function readLabel(file, root) {
    const b = $('#cfScan', root), was = b.innerHTML; b.disabled = true; b.textContent = 'Reading the label…';
    const done = function () { b.disabled = false; b.innerHTML = was; };
    loadTess().then(function (T) { return T.recognize(file, 'eng'); }).then(function (r) {
      done(); const v = parseLabel((r && r.data && r.data.text) || ''), set = function (id, x) { if (x != null && $('#' + id, root)) $('#' + id, root).value = String(Math.round(x * 10) / 10); };
      const got = ['kcal', 'p', 'c', 'fat'].filter(function (k) { return v[k] != null; }).length;
      if (!got) { toast('Couldn\'t read that label. Try a sharper, closer photo.'); buzz('warn'); return; }
      set('cfK', v.kcal); set('cfP', v.p); set('cfC', v.c); set('cfF', v.fat);
      if (v.g) set('cfG', v.g); else if (v.per100) { set('cfG', 100); if (!$('#cfU', root).value) $('#cfU', root).value = '100 g'; }
      let extra = false; [['fib', 'fib'], ['sug', 'sug'], ['sat', 'sat'], ['na', 'na']].forEach(function (x) { if (v[x[0]] != null && $('#cfx_' + x[1], root)) { $('#cfx_' + x[1], root).value = String(Math.round(v[x[0]] * 10) / 10); extra = true; } });
      if (extra && $('#cfExtra', root).hidden) $('#cfMore', root).click();
      buzz('success'); toast('Filled from the label. Check the numbers.');
    }, function () { done(); toast(navigator.onLine === false ? 'Label scanning needs the internet the first time.' : 'Couldn\'t read the label.'); buzz('warn'); });
  }
  // Settings → Back up & restore / Import: one tidy sheet each.
  function dataSheet(kind) {
    const row = function (act, ico, t, sub) { return '<button type="button" class="row" data-ds="' + act + '"><span class="ico ico-s">' + ico + '</span><div class="grow"><div class="row-t">' + t + '</div>' + (sub ? '<div class="row-s">' + sub + '</div>' : '') + '</div>' + CHEV + '</button>'; };
    const I = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
    // Everything about your data in one place: back up, export, bring data in, and tidy up.
    const g = function (label, rows) { return '<div class="group-label">' + label + '</div><div class="list">' + rows + '</div>'; };
    openSheet('<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Your data</h2></div></div>' +
      (storeEst && storeEst.usage ? '<p class="muted-note ds-store">' + esc(storeLine()) + ' on this phone</p>' : '') +
      g('Back up', row('export-json', I('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>'), 'Back up', 'Save everything to a file') + row('import', I('<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19h14"/>'), 'Restore', 'From a Setpoint backup file') + row('backups', I('<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/><path d="M12 8v4l3 2"/>'), 'Daily backups', 'A copy every day on this phone, kept for 7 days')) +
      g('Export', row('export-food', I('<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 9.5h16M9.5 9.5V20"/>'), 'Export food log', 'Everything you ate, with nutrients, as a spreadsheet') + row('export-csv', I('<path d="M4 17l5-5 4 3 7-8"/>'), 'Export weigh-ins', 'Your weight and trend as a spreadsheet')) +
      g('Import', row('import-crono', I('<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>'), 'From Cronometer', 'Pick dailysummary.csv and servings.csv together') + row('import-csv', I('<path d="M4 17l5-5 4 3 7-8"/>'), 'Weigh-ins from another app', 'Happy Scale, Libra, MyFitnessPal and more')) +
      g('Tidy up', row('health', I('<path d="M9 12l2 2 4-4"/><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/>'), 'Check my data', 'Find and fix entries that look wrong')),
      function (root) { $$('[data-ds]', root).forEach(function (b) { b.addEventListener('click', function () { const a = b.dataset.ds; closeSheet(); const el = document.createElement('button'); el.dataset.action = a; el.hidden = true; document.body.appendChild(el); el.click(); el.remove(); }); }); });
  }
  // Theme picker: a small preview of each theme, in the light or dark version you're using now.
  function themeSheet() {
    const dark = document.documentElement.getAttribute('data-mode') === 'dark';
    const draw = function (root) {
      root.innerHTML = '<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Theme</h2></div></div><div class="th-grid">' + THEMES.map(function (t) {
        const c = dark ? t[3] : t[2], on = state.settings.style === t[0];
        return '<button type="button" class="th-card' + (on ? ' on' : '') + '" data-th="' + t[0] + '" aria-pressed="' + on + '"><span class="th-prev" style="background:' + c[0] + '"><span class="th-glow" style="background:radial-gradient(80% 70% at 0% 0%,' + c[2] + '33,transparent 70%)"></span><span class="th-mini" style="background:' + c[1] + '"><i style="border-color:' + c[2] + ';border-right-color:' + c[0] + '"></i><b style="background:' + c[3] + '"></b><b style="background:' + c[3] + ';opacity:.35;width:60%"></b></span><span class="th-btn" style="background:' + c[2] + '"></span></span><span class="th-name">' + t[1] + '</span></button>';
      }).join('') + '</div>';
      $$('[data-th]', root).forEach(function (b) { b.addEventListener('click', function () { if (state.settings.style === b.dataset.th) return; state.settings.style = b.dataset.th; save(); buzz('light'); restyle(function () { applyAppearance(); renderAll(); draw(root); }); }); });
    };
    openSheet('<div id="thRoot"></div>', function (body) { draw($('#thRoot', body)); });
  }
  // Training days: which weekdays, and how much more you eat on them.
  function trainSheet() {
    const cur = state.settings.train || { days: [] }, t = state.profile.training;
    let days = cur.days.slice();
    openSheet('<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Training days</h2></div></div>' +
      '<p class="sheet-text">Pick the days you train. You eat more on those days and less on rest days. Your weekly total stays the same.</p>' +
      '<div class="day-chips" id="trDays">' + weekOrder().map(function (d) { return '<button type="button" data-v="' + d + '" aria-pressed="' + (days.indexOf(d) >= 0) + '">' + dayAbbr(d) + '</button>'; }).join('') + '</div>' +
      '<div class="stat-box tr-split" id="trNote"></div>' +
      '<div class="sheet-foot"><button type="button" class="btn primary block" id="trSave">Save</button></div>',
      function (root) {
        sheet.classList.add('tall');
        // Preview with the days picked (they also become your training days a week in Activity).
        const note = function () {
          const c = calcEnergy(), pl = makePlan(activeEnergy());
          if (!days.length) { $('#trNote', root).innerHTML = '<span class="muted-note">No days picked: every day has the same target.</span>'; return; }
          if (!c || !pl) { $('#trNote', root).innerHTML = '<span class="muted-note">Add your details in Targets first.</span>'; return; }
          const tt = Object.assign({}, t, { days: days.length }), e2 = energyFor(Object.assign({}, state.profile, { age: ageNow(), training: tt }), c.kg);
          const session = e2.train * 7 / days.length / 0.9, avg = e2.train / 0.9, base = roundKcal(pl.target - c.tdee + e2.tdee);
          const on = roundKcal(base + session - avg), off = roundKcal(base - avg);
          $('#trNote', root).innerHTML = '<div class="tr-row"><span>Training days (' + days.length + ')</span><b class="num">' + fmtKcal(on) + ' kcal</b></div><div class="tr-row"><span>Rest days (' + (7 - days.length) + ')</span><b class="num">' + fmtKcal(off) + ' kcal</b></div><div class="tr-row faint"><span>Average</span><b class="num">' + fmtKcal(Math.round((on * days.length + off * (7 - days.length)) / 7 / 10) * 10) + ' kcal</b></div>' +
            '<p class="muted-note" style="margin:8px 0 0">Based on ' + t.minutes + ' min of ' + t.type + ' (' + t.intensity + '). Change that in Activity.</p>';
        };
        note();
        $$('#trDays button', root).forEach(function (b) { b.addEventListener('click', function () { const v = +b.dataset.v, i = days.indexOf(v); if (i >= 0) days.splice(i, 1); else days.push(v); b.setAttribute('aria-pressed', i < 0); buzz('light'); note(); }); });
        $('#trSave', root).addEventListener('click', function () {
          const snap = snapshot();
          state.settings.train = days.length ? { days: days.sort() } : null;
          if (days.length) state.profile.training.days = days.length;
          save(); renderAll(); closeSheet(); buzz('success'); toast('Training days saved', function () { restore(snap); });
        });
      }, function () { sheet.classList.remove('tall'); });
  }
  // Your Diary categories: rename, reorder (drag ≡), add (like Pre-workout) or remove.
  const GRIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 8h14M5 12h14M5 16h14"/></svg>';
  function catsSheet() {
    let list = MEALS.map(function (m) { return { k: m[0], n: m[1] }; });
    const draw = function (root) {
      root.innerHTML = '<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Categories</h2></div></div>' +
        '<div class="list" id="catList">' + list.map(function (c, i) {
          return '<div class="row cat-row" data-cat="' + i + '"><span class="cat-grip" aria-label="Drag to reorder">' + GRIP + '</span><input class="input cat-in" data-ci="' + i + '" maxlength="24" value="' + esc(c.n) + '" aria-label="Category name" autocomplete="off" />' +
            '<button type="button" class="icon-btn me-rm" data-cdel="' + i + '" aria-label="Remove ' + esc(c.n) + '"' + (list.length < 2 ? ' disabled' : '') + '>' + TRASH + '</button></div>';
        }).join('') + '</div>' +
        '<div class="cat-add"><input class="input" id="catNew" maxlength="24" placeholder="New, like Pre-workout" aria-label="New category" autocomplete="off" /><button type="button" class="btn soft" id="catAdd">Add</button></div>' +
        '<p class="form-error" id="catErr" hidden></p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="catDone">Save</button></div>';
      const err = function (m) { const x = $('#catErr', root); x.textContent = m; x.hidden = !m; if (m) buzz('warn'); };
      $$('[data-ci]', root).forEach(function (inp) { inp.addEventListener('input', function () { list[+inp.dataset.ci].n = inp.value; }); });
      $$('[data-cdel]', root).forEach(function (b) { b.addEventListener('click', function () { list.splice(+b.dataset.cdel, 1); buzz('light'); draw(root); }); });
      const add = function () {
        const n = $('#catNew', root).value.trim();
        if (!n) return err('Type a name first');
        if (list.length >= 10) return err('Up to 10 categories');
        list.push({ k: 'g' + newId().replace(/[^a-z0-9]/g, '').slice(0, 8).padEnd(3, '0'), n: n.slice(0, 24) }); buzz('light'); draw(root);
      };
      $('#catAdd', root).addEventListener('click', add);
      $('#catNew', root).addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); add(); } });
      dragSort($('#catList', root), '.cat-row', function (src, tgt, before) {
        const from = +src.dataset.cat, mv = list.splice(from, 1)[0]; let to = +tgt.dataset.cat; if (from < to) to--; if (!before) to++;
        list.splice(to, 0, mv); buzz('light'); draw(root);
      }, { handle: '.cat-grip' });
      $('#catDone', root).addEventListener('click', function () {
        list = list.map(function (c) { return { k: c.k, n: c.n.trim().slice(0, 24) }; });
        if (list.some(function (c) { return !c.n; })) return err('Give every category a name');
        const snap = snapshot(), keys = list.map(function (c) { return c.k; }), last = keys[keys.length - 1];
        let moved = 0;
        Object.keys(state.food).forEach(function (dt) { state.food[dt].forEach(function (it) { if (keys.indexOf(it.meal) < 0 && !isDailyTotal(it)) { it.meal = last; moved++; } }); });
        state.ui.shut = state.ui.shut.filter(function (k) { return keys.indexOf(k) >= 0; });
        const same = list.length === DEFAULT_MEALS.length && list.every(function (c, i) { return c.k === DEFAULT_MEALS[i][0] && c.n === DEFAULT_MEALS[i][1]; });
        state.settings.meals = same ? null : list;
        save(); renderAll(); closeSheet(); buzz('success');
        toast(moved ? 'Saved. Food from removed categories is now in ' + list[list.length - 1].n : 'Categories saved', function () { restore(snap); });
      });
    };
    openSheet('<div id="catRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#catRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
  // Tap a meal's name: its totals, and copy, save or clear it.
  function mealSheet(meal, date) {
    const d = date || viewDay, its = foodFor(d).filter(function (f) { return mealOf(f) === meal; });
    if (!its.length) return;
    const t = its.reduce(function (a, f) { return { kcal: a.kcal + f.kcal, p: a.p + f.protein, c: a.c + f.carbs, f: a.f + f.fat }; }, { kcal: 0, p: 0, c: 0, f: 0 });
    const today = todayISO();
    openSheet('<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">' + mealName(meal) + '</h2></div></div>' +
      '<div class="stat-box sv-mac meal-tot"><div><b class="num">' + fmtKcal(t.kcal) + '</b><span>kcal</span></div><div><b class="num">' + t.p + '</b><span>g protein</span></div><div><b class="num">' + t.c + '</b><span>g carbs</span></div><div><b class="num">' + t.f + '</b><span>g fat</span></div></div>' +
      '<div id="msSaveBox" hidden><div class="field"><input class="input" id="msName" maxlength="40" placeholder="Name, like Usual breakfast" aria-label="Meal name" autocomplete="off" /></div><button type="button" class="btn primary block" id="msSaveGo" style="margin-bottom:16px">Save meal</button></div>' +
      '<div class="list">' +
        (d !== today ? '<button type="button" class="row" id="msToday"><div class="grow row-t">Copy to today</div>' + CHEV + '</button>' : '') +
        '<button type="button" class="row" id="msSave"><div class="grow row-t">Save as a meal</div>' + CHEV + '</button>' +
        '<button type="button" class="row" id="msClear"><div class="grow row-t" style="color:var(--danger)">Remove all</div></button>' +
      '</div>',
      function (root) {
        if ($('#msToday', root)) $('#msToday', root).addEventListener('click', function () { closeSheet(); copyFood(its, today, 'Copied to today'); });
        $('#msSave', root).addEventListener('click', function () { $('#msSaveBox', root).hidden = false; this.hidden = true; $('#msName', root).focus(); });
        const saveMeal = function () {
          const nm = $('#msName', root).value.trim() || mealName(meal);
          state.meals.push({ id: 'm' + newId(), name: nm.slice(0, 40), items: its.slice(0, 40).map(function (it) { const c = Object.assign({}, it); delete c.id; delete c.meal; return c; }) });
          save(); closeSheet(); buzz('success'); toast('Saved to My foods');
        };
        $('#msSaveGo', root).addEventListener('click', saveMeal);
        $('#msName', root).addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); saveMeal(); } });
        $('#msClear', root).addEventListener('click', function () {
          const snap = snapshot();
          state.food[d] = foodFor(d).filter(function (f) { return f.meal !== meal; });
          if (!state.food[d].length) delete state.food[d];
          save(); renderAll(); closeSheet(); buzz('medium'); toast(mealName(meal) + ' cleared', function () { restore(snap); });
        });
      });
  }

  /* ================= Nutrients (vitamins, minerals, lipids) ================= */
  // [key, label, unit, group]. Keys match foods.json.
  const NUTS = [
    ['kcal', 'Energy', 'kcal', 'gen'], ['p', 'Protein', 'g', 'gen'], ['c', 'Carbs', 'g', 'gen'], ['fib', 'Fiber', 'g', 'gen'], ['sug', 'Sugars', 'g', 'gen'], ['f', 'Fat', 'g', 'gen'], ['caff', 'Caffeine', 'mg', 'gen'], ['alc', 'Alcohol', 'g', 'gen'],
    ['vA', 'Vitamin A', 'µg', 'vit'], ['vC', 'Vitamin C', 'mg', 'vit'], ['vD', 'Vitamin D', 'µg', 'vit'], ['vE', 'Vitamin E', 'mg', 'vit'], ['vK', 'Vitamin K', 'µg', 'vit'],
    ['b1', 'B1 (thiamin)', 'mg', 'vit'], ['b2', 'B2 (riboflavin)', 'mg', 'vit'], ['b3', 'B3 (niacin)', 'mg', 'vit'], ['b5', 'B5 (pantothenic acid)', 'mg', 'vit'], ['b6', 'B6', 'mg', 'vit'], ['fol', 'Folate', 'µg', 'vit'], ['b12', 'B12', 'µg', 'vit'], ['chl', 'Choline', 'mg', 'vit'],
    ['ca', 'Calcium', 'mg', 'min'], ['cu', 'Copper', 'mg', 'min'], ['fe', 'Iron', 'mg', 'min'], ['mg', 'Magnesium', 'mg', 'min'], ['mn', 'Manganese', 'mg', 'min'], ['ph', 'Phosphorus', 'mg', 'min'], ['k', 'Potassium', 'mg', 'min'], ['se', 'Selenium', 'µg', 'min'], ['na', 'Sodium', 'mg', 'min'], ['zn', 'Zinc', 'mg', 'min'],
    ['sat', 'Saturated fat', 'g', 'lip'], ['mono', 'Monounsaturated', 'g', 'lip'], ['poly', 'Polyunsaturated', 'g', 'lip'], ['trans', 'Trans fat', 'g', 'lip'], ['chol', 'Cholesterol', 'mg', 'lip'], ['ala', 'Omega-3 (ALA)', 'g', 'lip'], ['epa', 'Omega-3 (EPA)', 'g', 'lip'], ['dha', 'Omega-3 (DHA)', 'g', 'lip'], ['la', 'Omega-6 (LA)', 'g', 'lip']
  ];
  const NUT = {}; NUTS.forEach(function (n) { NUT[n[0]] = { key: n[0], label: n[1], unit: n[2], group: n[3] }; });
  const NUT_GROUPS = [['gen', 'General'], ['vit', 'Vitamins'], ['min', 'Minerals'], ['lip', 'Fats']];
  const MICROS = NUTS.filter(function (n) { return n[3] === 'vit' || n[3] === 'min'; }).map(function (n) { return n[0]; }).filter(function (k) { return k !== 'na'; });
  // US Dietary Reference Intakes (RDA or AI), by sex: [female, male]. Ages 19–50 unless noted in nutTargets().
  const DRI = { vA: [700, 900], vC: [75, 90], vD: [15, 15], vE: [15, 15], vK: [90, 120], b1: [1.1, 1.2], b2: [1.1, 1.3], b3: [14, 16], b5: [5, 5], b6: [1.3, 1.3], fol: [400, 400], b12: [2.4, 2.4], chl: [425, 550],
    ca: [1000, 1000], cu: [0.9, 0.9], fe: [18, 8], mg: [320, 420], mn: [1.8, 2.3], ph: [700, 700], k: [2600, 3400], se: [55, 55], zn: [8, 11], ala: [1.1, 1.6], la: [12, 17] };
  const DRI_TEEN = { vA: [700, 900], vC: [65, 75], vK: [75, 75], b1: [1, 1.2], b2: [1, 1.3], b6: [1.2, 1.3], chl: [400, 550], ca: [1300, 1300], cu: [0.89, 0.89], fe: [15, 11], mg: [360, 410], mn: [1.6, 2.2], ph: [1250, 1250], k: [2300, 3000], zn: [9, 11], la: [11, 16] };
  // Tolerable upper intakes from food (only where the limit applies to food, not just supplements).
  const UL = { vC: 2000, vD: 100, b6: 100, chl: 3500, ca: 2500, cu: 10, fe: 45, mn: 11, ph: 4000, se: 400, zn: 40 };
  // Personal targets, like Cronometer: a minimum, a goal and a maximum for each nutrient (recommended for your age,
  // sex and weight, and each one yours to change). nutRec() is the recommendation; nutTargets() adds your changes.
  // For the rest of the app each also carries min (the amount to reach), max (a limit, for things you only keep under)
  // and ul (a safe upper limit).
  function nutRec(date) {
    const p = state.profile, age = ageNow() || 30, sex = p.sex, r = {};
    const pickSex = function (v) { return sex === 'male' ? v[1] : sex === 'female' ? v[0] : (v[0] + v[1]) / 2; };
    Object.keys(DRI).forEach(function (k) { r[k] = { goal: pickSex(age < 19 && DRI_TEEN[k] ? DRI_TEEN[k] : DRI[k]) }; });
    const set = function (k, v) { if (r[k]) r[k].goal = v; };
    if (age > 50) { set('fe', 8); set('b6', pickSex([1.5, 1.7])); set('la', pickSex([11, 14])); if (sex !== 'male') set('ca', 1200); }
    if (age > 70) { set('vD', 20); set('ca', 1200); }
    if (age >= 31 && age < 51) set('mg', pickSex([320, 420])); else if (age >= 19 && age < 31) set('mg', pickSex([310, 400]));
    Object.keys(UL).forEach(function (k) { if (r[k]) r[k].hi = UL[k]; });
    if (age > 50 && r.ca) r.ca.hi = 2000;
    if (age > 70 && r.ph) r.ph.hi = 3000;
    const plan = dayPlan(date), kcal = plan ? roundKcal(plan.target) : (sex === 'male' ? 2500 : 2000);
    r.kcal = { goal: kcal };
    if (plan) {
      r.p = { goal: plan.protein }; r.c = { goal: plan.carbs };
      r.f = { goal: plan.fat, hi: Math.round(kcal * 0.35 / 9) }; // at most 35% of calories
    }
    r.fib = { goal: Math.max(25, Math.round(kcal / 1000 * 14)) };
    r.na = { hi: 2300 }; r.sat = { hi: Math.round(kcal * 0.1 / 9) }; r.caff = { hi: 400 };
    return r;
  }
  function nutTargets(date) {
    const rec = nutRec(date), own = state.profile.nutT || {}, t = {};
    Object.keys(rec).concat(Object.keys(own)).forEach(function (k) {
      if (t[k]) return;
      const r = rec[k] || {}, o = own[k], x = { goal: r.goal != null ? r.goal : null, hi: r.hi != null ? r.hi : null };
      if (typeof o === 'number') { if (x.goal == null && x.hi != null) x.hi = o; else x.goal = o; } // older versions: one number
      else if (o) ['goal', 'hi'].forEach(function (f) { if (o[f] !== undefined) x[f] = o[f]; });
      if (o && (k === 'kcal' || ((k === 'p' || k === 'c' || k === 'f') && rec[k]))) x.goal = r.goal; // these follow your plan
      const m = x.goal;
      if (m != null) x.min = m; else if (x.hi != null) x.max = x.hi;
      if (m != null && x.hi != null) x.ul = x.hi;
      if (o) x.custom = true;
      if (x.goal != null || x.hi != null || o) t[k] = x;
    });
    return t;
  }
  // Nutrients in one logged item, or null when we only know its calories and macros.
  function itemNutrients(it) {
    if (Array.isArray(it.mi)) {
      const o = {}; let any = false;
      it.mi.forEach(function (x) { const v = itemNutrients(x); if (!v) return; any = true; NUTS.forEach(function (n) { if (v[n[0]] != null) o[n[0]] = (o[n[0]] || 0) + v[n[0]]; }); });
      if (!any) return null;
      NUTS.forEach(function (n) { if (o[n[0]] == null) o[n[0]] = null; });
      o.kcal = it.kcal; o.p = it.protein; o.c = it.carbs; o.f = it.fat; return o;
    }
    if (!it.ref && it.n) { const o = {}; NUTS.forEach(function (n) { o[n[0]] = it.n[n[0]] != null ? it.n[n[0]] : null; }); o.kcal = it.kcal; o.p = it.protein; o.c = it.carbs; o.f = it.fat; return o; }
    if (!it.ref) return null;
    const f = itemFood(it); if (!f) return null;
    const out = {}, q = it.g / 100;
    NUTS.forEach(function (n) { const v = per100(f, n[0]); out[n[0]] = v == null ? null : v * q; });
    out.kcal = it.kcal; out.p = it.protein; out.c = it.carbs; out.f = it.fat; // what was logged
    return out;
  }
  // A day's totals, with how much of the day's calories each nutrient has data for (0–1).
  function dayNutrients(date) {
    const items = eatenFor(date), tot = {}, cov = {}; let kcal = 0, noData = 0;
    NUTS.forEach(function (n) { tot[n[0]] = 0; cov[n[0]] = 0; });
    items.forEach(function (it) {
      kcal += it.kcal;
      const n = itemNutrients(it);
      if (!n) { noData++; tot.kcal += it.kcal; tot.p += it.protein; tot.c += it.carbs; tot.f += it.fat; ['kcal', 'p', 'c', 'f'].forEach(function (k) { cov[k] += it.kcal; }); return; }
      NUTS.forEach(function (x) { const v = n[x[0]]; if (v != null) { tot[x[0]] += v; cov[x[0]] += it.kcal; } });
    });
    if (!items.length && dayTotals(date).kcal) { const tt = dayTotals(date); tot.kcal = tt.kcal; tot.p = tt.protein; tot.c = tt.carbs; tot.f = tt.fat; kcal = tt.kcal; noData = 1; ['kcal', 'p', 'c', 'f'].forEach(function (k) { cov[k] = kcal; }); }
    NUTS.forEach(function (n) { cov[n[0]] = kcal ? cov[n[0]] / kcal : 1; });
    return { tot: tot, cov: cov, kcal: kcal, items: items.length, noData: noData };
  }
  // Whether the day's foods need the database to work out vitamins and minerals.
  function dayNeedsDB(date) { return !foodDB && foodFor(date).some(function (it) { return it.ref && itemNeedsDB(it); }); }
  function fmtNut(v, unit) {
    if (v == null) return '–';
    const a = Math.abs(v), s = a >= 100 ? Math.round(v) : a >= 10 ? Math.round(v * 10) / 10 : a >= 1 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100;
    return (unit === 'kcal' ? fmtKcal(s) : a >= 1000 ? fmtKcal(s) : String(s)) + (unit === 'kcal' ? ' kcal' : ' ' + unit);
  }
  // One nutrient row: amount, target and a bar. Limits (sodium, saturated fat) fill towards a maximum.
  function nutRow(key, v, tg, cov, opts) {
    const n = NUT[key], o = opts || {}, lim = tg && tg.max != null && tg.min == null, goal = tg ? (lim ? tg.max : tg.min) : null;
    const pct = goal ? v / goal * 100 : null, over = tg && ((lim && v > tg.max) || (tg.ul && v > tg.ul));
    const cls = over ? 'over' : pct == null ? 'none' : lim ? 'ok' : ['kcal', 'c', 'f'].indexOf(key) >= 0 ? 'macro' : pct >= 100 ? 'met' : pct >= 50 ? 'part' : 'low';
    return '<' + (o.tap ? 'button type="button" data-high="' + key + '"' : 'div') + ' class="nut-row ' + cls + '">' +
      '<span class="nr-l">' + n.label + (cov != null && cov < 0.8 && v > 0 ? '<i class="nr-flag" title="Some foods have no data for this">*</i>' : '') + '</span>' +
      '<span class="nr-v num">' + fmtNut(v, n.unit) + (goal ? ' <small>/ ' + fmtNut(goal, n.unit).replace(' ' + n.unit, '') + (lim ? ' max' : '') + '</small>' : '') + '</span>' +
      (goal ? '<span class="nr-p num">' + Math.round(pct) + '%</span><span class="bar nr-bar"><i style="width:' + Math.min(100, pct).toFixed(1) + '%"></i></span>' : '<span class="nr-p"></span>') +
      (over && tg.ul && v > tg.ul ? '<span class="nr-note">Above the safe upper limit (' + fmtNut(tg.ul, n.unit) + ')</span>' : '') +
      '</' + (o.tap ? 'button' : 'div') + '>';
  }
  function nutPanel(tot, tg, cov, opts) {
    return NUT_GROUPS.map(function (g) {
      const rows = NUTS.filter(function (n) { return n[3] === g[0] && (opts && opts.known ? tot[n[0]] != null : tot[n[0]] > 0 || (tg[n[0]] && tg[n[0]].min) || (opts && opts.all)); });
      if (!rows.length) return '';
      return '<div class="label faint fd-sec">' + g[1] + '</div><div class="nut-list">' + rows.map(function (n) { return nutRow(n[0], tot[n[0]] || 0, tg[n[0]], cov ? cov[n[0]] : null, opts); }).join('') + '</div>';
    }).join('');
  }
  function microsMet(nd, tg) {
    let met = 0; MICROS.forEach(function (k) { if (tg[k] && tg[k].min && nd.tot[k] >= tg[k].min) met++; });
    return { met: met, of: MICROS.length };
  }

  // Day nutrients: everything eaten that day against your targets.
  function nutrientsSheet(date) {
    const d = date || viewDay;
    const draw = function (root) {
      const nd = dayNutrients(d), tg = nutTargets(d), mm = microsMet(nd, tg), p = state.profile;
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">Nutrients</h2></div>' +
        '<button type="button" class="text-btn" id="nsTargets" style="margin:0">Targets</button></div>' +
        (nd.items || nd.kcal ? keyBoxes(function (k) { return nd.cov[k] > 0 ? nd.tot[k] : null; }) + '<div class="nt-met"><span>Vitamins &amp; minerals</span><b class="num">' + mm.met + ' <small>of ' + mm.of + ' met</small></b><span class="bar"><i style="width:' + (mm.met / Math.max(1, mm.of) * 100).toFixed(1) + '%"></i></span></div>' : '') +
        (dayNeedsDB(d) ? skel(4) :
          (!nd.items && !nd.kcal ? emptyState(LEAF_IC, 'Nothing logged yet', 'Add food to see your vitamins and minerals.') : '') +
          (nd.noData ? '<p class="muted-note ns-note">' + nd.noData + (nd.noData === 1 ? ' food has' : ' foods have') + ' calories only (quick adds or your own foods), so some totals are low. * = partly missing data.</p>' : '') +
          (!p.sex || !p.birthYear ? '<p class="muted-note ns-note">Add your age and sex in Targets for personal targets.</p>' : '') +
          nutPanel(nd.tot, tg, nd.cov, { tap: true })) +
        '<p class="muted-note sv-src">Targets: US Dietary Reference Intakes. Tap a nutrient to see where it came from.</p>';
      $('#nsTargets', root).addEventListener('click', function () { closeSheet(); showTab('targets'); });
      $$('[data-high]', root).forEach(function (b) { b.addEventListener('click', function () { sourcesSheet(b.dataset.high, d); }); });
    };
    openSheet('<div id="nsRoot"></div>', function (body) {
      sheet.classList.add('tall');
      const root = $('#nsRoot', body); draw(root);
      if (dayNeedsDB(d)) loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) toast('Couldn\'t load the food list'); });
    }, function () { sheet.classList.remove('tall'); });
  }

  // Where a nutrient came from: the foods you ate that day (or over the last few days), biggest first.
  function sourcesSheet(key, date, days) {
    const d = date || viewDay, nd = days || 1, d0 = dayNum(d);
    const isos = []; for (let i = 0; i < nd; i++) isos.push(isoFromDay(d0 - i));
    const draw = function (root) {
      const n = NUT[key], t = nutTargets(d)[key], lim = t && t.max != null && t.min == null, goal = t ? (lim ? t.max : t.min) : null;
      const when = nd === 1 ? (d === todayISO() ? 'Today' : fmtDate(d, { weekday: 'short', month: 'short', day: 'numeric' })) : 'Last ' + nd + ' days';
      const head = '<div class="sheet-head"><div class="grow"><div class="label faint">Where it came from · ' + when + '</div><h2 class="sheet-title" id="sheetTitle">' + n.label + '</h2></div></div>';
      if (isos.some(dayNeedsDB)) { root.innerHTML = head + skel(4); return; }
      const by = {}; let tot = 0, none = 0;
      isos.forEach(function (iso) {
        eatenFor(iso).forEach(function (it) {
          if (isDailyTotal(it)) return;
          (Array.isArray(it.mi) ? it.mi : [it]).forEach(function (x) {
            const v = itemNutrients(x), mac = { kcal: x.kcal, p: x.protein, c: x.carbs, f: x.fat };
            const val = v && v[key] != null ? v[key] : mac[key] != null ? mac[key] : null;
            if (val == null) { none++; return; }
            if (val <= 0) return;
            const nm = x.name || 'Quick add', o = by[nm] || (by[nm] = { v: 0, n: 0 }); o.v += val; o.n++; tot += val;
          });
        });
      });
      const rows = Object.keys(by).map(function (k) { return { name: k, v: by[k].v, n: by[k].n }; }).sort(function (a, b) { return b.v - a.v; });
      const day = nd > 1 ? tot / nd : tot, pct = goal ? day / goal * 100 : null, over = goal && (lim ? day > goal : t.ul && day > t.ul);
      const sum = '<div class="src-sum' + (over ? ' over' : '') + '"><div><b class="num">' + fmtNut(nd > 1 ? day : tot, n.unit) + '</b>' + (nd > 1 ? '<span> a day</span>' : '') +
        (goal ? '<span> of ' + fmtNut(goal, n.unit) + (lim ? ' max' : '') + '</span>' : '') + '</div>' + (goal ? '<b class="num src-pc">' + Math.round(pct) + '%</b>' : '') +
        (goal ? '<span class="bar"><i style="width:' + Math.min(100, pct).toFixed(1) + '%"></i></span>' : '') + '</div>';
      root.innerHTML = head + sum + (!rows.length ? '<p class="muted-note fd-empty">Nothing with ' + esc(n.label.toLowerCase()) + ' logged' + (nd === 1 ? (d === todayISO() ? ' today' : ' that day') : ' in the last ' + nd + ' days') + '.</p>' :
        '<div class="list">' + rows.slice(0, 30).map(function (r) {
          const pc = Math.round(r.v / tot * 100);
          return '<div class="row fd-row hi-wk"><div class="grow"><div class="row-t">' + esc(r.name) + '</div><div class="row-s">' + (r.n > 1 ? r.n + ' times · ' : '') + pc + '% of the total</div><div class="hi-bar"><i style="width:' + Math.max(3, pc) + '%"></i></div></div><span class="row-v num hi-v">' + fmtNut(r.v, n.unit) + '</span></div>';
        }).join('') + '</div>') +
        (none ? '<p class="muted-note sv-src">' + none + (none === 1 ? ' food has' : ' foods have') + ' no data for this, so ' + (none === 1 ? 'it isn\'t' : 'they aren\'t') + ' counted.</p>' : '');
    };
    openSheet('<div id="srcRoot"></div>', function (body) {
      sheet.classList.add('tall');
      const root = $('#srcRoot', body); draw(root);
      if (isos.some(dayNeedsDB)) loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) toast('Couldn\'t load the food list'); });
    }, function () { sheet.classList.remove('tall'); });
  }
  // Foods highest in a nutrient, per serving or per 100 kcal. Tap one to add it.
  // Foods high in a nutrient now lives in Suggest food (the "By nutrient" filter).
  function highInSheet(key, perKcal, week) { nutFoodsSheet(viewDay || todayISO(), { key: key, by: week ? 'week' : perKcal ? 'kcal' : 'serving' }); }
  // The list for one nutrient: your week's top sources, or the foods richest in it per serving or per 100 kcal.
  function highInHtml(key, by) {
    const n = NUT[key], tg = nutTargets()[key], goal = tg ? tg.min || tg.max : null;
    if (by === 'week') {
      const bym = {}, t0 = dayNum(todayISO()); let tot = 0;
      for (let i = 0; i < 7; i++) eatenFor(isoFromDay(t0 - i)).forEach(function (it) {
        if (isDailyTotal(it)) return;
        const v = itemNutrients(it), mac = { kcal: it.kcal, p: it.protein, c: it.carbs, f: it.fat };
        const x = v && v[key] != null ? v[key] : mac[key] != null ? mac[key] : null; if (!x || x <= 0) return;
        const nm = (it.name || 'Quick add').split(' · ')[0], o = bym[nm] || (bym[nm] = { v: 0, n: 0, ref: it.ref }); o.v += x; o.n++; tot += x;
      });
      const rows = Object.keys(bym).map(function (k) { return { name: k, v: bym[k].v, n: bym[k].n, ref: bym[k].ref }; }).sort(function (a, b) { return b.v - a.v; });
      return !rows.length ? '<p class="muted-note fd-empty">Nothing with ' + esc(n.label.toLowerCase()) + ' logged in the last 7 days.</p>' :
        '<p class="muted-note hi-tot">Last 7 days: <b class="num">' + fmtNut(tot, n.unit) + '</b> · about ' + fmtNut(tot / 7, n.unit) + ' a day' + (goal ? ' (target ' + fmtNut(goal, n.unit) + ')' : '') + '</p>' +
        '<div class="list">' + rows.slice(0, 30).map(function (r) {
          const pct = Math.round(r.v / tot * 100), f = r.ref && getFood(r.ref);
          return '<' + (f ? 'button type="button" data-sg="' + f.id + '"' : 'div') + ' class="row fd-row hi-wk"><div class="grow"><div class="row-t">' + esc(r.name) + '</div><div class="row-s">' + (r.n > 1 ? r.n + ' times' : 'once') + ' · ' + pct + '% of your total</div><div class="hi-bar"><i style="width:' + Math.max(3, pct) + '%"></i></div></div><span class="row-v num hi-v">' + fmtNut(r.v, n.unit) + '</span></' + (f ? 'button' : 'div') + '>';
        }).join('') + '</div><p class="muted-note sv-src">Foods with no data for this nutrient (most quick adds) aren\'t counted.</p>';
    }
    const perKcal = by === 'kcal', res = [], mine = {}, t1 = dayNum(todayISO());
    // Everyday foods only (plus anything you've logged or saved), so the list isn't spleen and dried egg white.
    for (let i = 0; i < 60; i++) eatenFor(isoFromDay(t1 - i)).forEach(function (it) { if (it.ref) mine[it.ref] = 1; });
    state.favs.forEach(function (r) { mine[r] = 1; });
    foodDB.list.forEach(function (f) {
      if (!f.pop && !mine[f.id]) return;
      const v100 = per100(f, key), kc = per100(f, 'kcal');
      // Skip things not eaten as they are: raw dry beans and grains, flours, brans, dried seaweed, brands and powders.
      if (!v100 || v100 <= 0 || CAT_PENALTY[f.cat] >= 5 || f.cat === 'Spices and Herbs' || f.cat === 'Packaged foods' || /[A-Z]{3,}|powder|dry mix|dehydrated|freeze-dried|supplement|fortified/.test(f.name) ||
        /mature seeds, raw|, crude|flour|\bmeal\b|\bbran\b|seaweed|, dry\b|uncooked|, unprepared/i.test(f.name)) return;
      if (perKcal) { if (!kc || kc < 15) return; res.push({ f: f, v: v100 / kc * 100, sub: 'per 100 kcal' }); return; }
      const s = defaultServing(f), g = s.qty * s.unit.g;
      if (g > 500 || (kc || 0) * g / 100 > 450) return;
      res.push({ f: f, v: v100 * g / 100, sub: fmtAmt(s.qty, s.unit.label) });
    });
    res.sort(function (a, b) { return b.v - a.v || (b.f.pop || 0) - (a.f.pop || 0); });
    return '<div class="list">' + res.slice(0, 40).map(function (r) {
      return '<button type="button" class="row fd-row" data-sg="' + r.f.id + '">' + ftIcon(ftKind(r.f)) + '<div class="grow"><div class="row-t">' + esc(r.f.name) + '</div><div class="row-s">' + esc(r.sub) + '</div></div><span class="row-v num hi-v">' + fmtNut(r.v, n.unit) + (goal ? '<small>' + Math.round(r.v / goal * 100) + '%</small>' : '') + '</span></button>';
    }).join('') + '</div><p class="muted-note sv-src">Everyday foods, plus ones you\'ve logged or saved. Tap one to pick an amount.</p>';
  }

  // Your targets for each nutrient; tap one to set your own.
  // The Targets page, like Cronometer: each nutrient with a daily target and a max you type straight in.
  // Custom is on once you change something; turning it off goes back to what's recommended for you.
  const NT_GROUPS = [['mac', 'Macros', ['kcal', 'p', 'c', 'f', 'fib', 'sug']], ['vit', 'Vitamins'], ['min', 'Minerals'], ['lip', 'Fats', null, ['f']], ['oth', 'Other', ['caff', 'alc']]];
  const NT_PLAN = { kcal: 1, p: 1, c: 1, f: 1 };
  function ntRowHtml(k, tg) {
    const n = NUT[k], t = tg[k] || {}, own = (state.profile.nutT || {})[k] != null, fromPlan = NT_PLAN[k] && t.goal != null;
    const v = function (x) { return x != null ? String(Math.round(x * 100) / 100) : ''; };
    const box = function (f, label) {
      if (f === 'goal' && fromPlan) return '<button type="button" class="nt-box nt-plan" data-nt-plan="' + k + '"><span>' + label + '</span><b class="num">' + fmtNut(t.goal, n.unit).replace(/\s*(mg|µg|g|kcal)$/, '') + '</b><em>' + n.unit + '</em><small>Plan</small></button>';
      return '<label class="nt-box"><span>' + label + '</span><input class="num" inputmode="decimal" maxlength="7" placeholder="None" data-nt-in="' + k + '" data-f="' + f + '" value="' + v(t[f]) + '" aria-label="' + esc(n.label) + ' ' + label + '" /><em>' + n.unit + '</em></label>';
    };
    return '<div class="nt-card" data-nt-row="' + k + '"><div class="nt-top"><b>' + esc(n.label) + '</b><label class="nt-cus"><span>Custom</span><span class="switch"><input type="checkbox" data-nt-cus="' + k + '"' + (own ? ' checked' : '') + ' /><i></i></span></label></div>' +
      '<div class="nt-boxes">' + box('goal', 'Daily target') + box('hi', 'Max') + '</div></div>';
  }
  function renderNutTable() {
    const box = $('#ntTable'); if (!box || box.contains(document.activeElement)) return;
    const tg = nutTargets();
    box.innerHTML = '<div class="nt-who">' + (state.profile.sex && state.profile.birthYear ? 'Recommended for your age and sex. Tap a number to change it.' : 'Add your age and sex in Energy expenditure → About you for targets made for you.') + '</div>' +
      NT_GROUPS.map(function (g) {
        const keys = (g[2] || NUTS.filter(function (n) { return n[3] === g[0] && (!g[3] || g[3].indexOf(n[0]) < 0); }).map(function (n) { return n[0]; })).filter(function (k) { return NUT[k]; });
        return '<div class="group-label">' + g[1] + '</div><div class="card nt-group">' + keys.map(function (k) { return ntRowHtml(k, tg); }).join('') + '</div>';
      }).join('') +
      '<p class="muted-note sv-src">From the US Dietary Reference Intakes: the target is the recommended amount, the max is the safe upper limit. Going over a max shows in red. Calorie, protein, carb and fat targets follow your plan.</p>';
  }
  function ntSaveRow(k, row) {
    const rec = nutRec()[k] || {}, o = {}, ins = $$('[data-nt-in]', row);
    let bad = '';
    ins.forEach(function (inp) {
      const raw = inp.value.trim(), f = inp.dataset.f;
      if (!raw) { o[f] = null; return; }
      const v = parseNum(raw); if (isNaN(v) || v <= 0 || v > 100000) { bad = 'Use a number above 0, or leave it empty'; return; }
      o[f] = Math.round(v * 100) / 100;
    });
    const goal = NT_PLAN[k] && rec.goal != null ? rec.goal : o.goal;
    if (!bad && goal != null && o.hi != null && goal > o.hi) bad = 'The target is above the max';
    if (bad) { toast(bad); buzz('warn'); row.outerHTML = ntRowHtml(k, nutTargets()); return; }
    const all = Object.assign({}, state.profile.nutT || {}); all[k] = o; state.profile.nutT = all;
    save(); const sw = $('[data-nt-cus="' + k + '"]', row); if (sw) sw.checked = true;
    renderAll();
  }
  document.addEventListener('change', function (e) {
    const inp = e.target.closest('[data-nt-in]');
    if (inp) { const row = inp.closest('[data-nt-row]'); ntSaveRow(inp.dataset.ntIn, row); return; }
    const cus = e.target.closest('[data-nt-cus]');
    if (cus) {
      const k = cus.dataset.ntCus, all = Object.assign({}, state.profile.nutT || {}), snap = snapshot();
      if (cus.checked) { const t = nutTargets()[k] || {}; all[k] = { goal: t.goal != null ? t.goal : null, hi: t.hi != null ? t.hi : null }; }
      else delete all[k];
      state.profile.nutT = all; save(); buzz('light'); renderAll();
      const row = $('[data-nt-row="' + k + '"]'); if (row) row.outerHTML = ntRowHtml(k, nutTargets());
      if (!cus.checked) toast(NUT[k].label + ': back to recommended', function () { restore(snap); });
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.closest && e.target.closest('[data-nt-in]')) e.target.blur(); });
  document.addEventListener('focusout', function (e) { if (e.target.closest && e.target.closest('[data-nt-in]')) setTimeout(function () { const b = $('#ntTable'); if (b && !b.contains(document.activeElement)) renderNutTable(); }, 0); });
  // Nutrients you've been short on lately (last 14 days with real logging), most missed first.
  function oftenLow() { return onePass(oftenLowNow); }
  function oftenLowNow() {
    const today = dayNum(todayISO()), tg = nutTargets(), days = [];
    for (let d = today - 14; d < today; d++) { const iso = isoFromDay(d), nd = dayNutrients(iso); if (nd.items && nd.kcal >= (nutTargets(iso).kcal.min || 2000) * 0.5) days.push(nd); }
    if (days.length < 3) return { days: days.length, low: [] };
    const low = [];
    MICROS.concat(['fib', 'p']).forEach(function (k) {
      const t = tg[k]; if (!t || !t.min) return;
      const cov = days.reduce(function (a, x) { return a + x.cov[k]; }, 0) / days.length;
      if (cov < 0.7) return; // not enough data to judge
      const avg = days.reduce(function (a, x) { return a + x.tot[k]; }, 0) / days.length, pct = avg / t.min * 100;
      if (pct < 75) low.push({ key: k, pct: pct, avg: avg });
    });
    low.sort(function (a, b) { return a.pct - b.pct; });
    return { days: days.length, low: low };
  }
  function renderLowCard() {
    const box = $('#lowBox'); if (!box) return;
    const anyRef = Object.keys(state.food).some(function (d) { return state.food[d].some(function (it) { return it.ref; }); });
    if (anyRef && !foodDB) {
      // Only fetch the food list once this card is actually on screen.
      box.innerHTML = '';
      if (state.ui.tab === 'progress' && state.ui.prog === 'nutrition') loadFoods().then(renderLowCard, function () {});
      return;
    }
    const r = oftenLow();
    box.innerHTML = '<div class="card"><div class="card-head"><h2 class="card-title">Often low on</h2><span class="label faint">Last 2 weeks</span></div>' +
      (r.days < 3 ? '<p class="t-sub">Log your food for at least 3 days to see which vitamins and minerals you tend to miss.</p>'
        : r.low.length ? '<div class="nut-list">' + r.low.slice(0, 5).map(function (x) { const n = NUT[x.key]; return '<button type="button" class="nut-row low-row" data-high="' + x.key + '"><span class="nr-l">' + n.label + '</span><span class="nr-v num">' + fmtNut(x.avg, n.unit) + ' <small>avg</small></span><span class="nr-p num">' + Math.round(x.pct) + '%</span><span class="bar nr-bar"><i style="width:' + Math.min(100, x.pct).toFixed(1) + '%"></i></span></button>'; }).join('') + '</div>' +
          '<p class="t-sub" style="margin-top:10px">Average of ' + r.days + ' days. Tap one for foods high in it.</p>'
          : '<p class="t-sub">Nothing below 75% of target on average over ' + r.days + ' days. Nicely done.</p>') +
      '<button type="button" class="btn soft block" data-high="vD" style="margin-top:12px">Find foods high in…</button></div>';
  }

  /* ================= Water ================= */
  // Daily goal: yours if set, otherwise about 2 L (women) or 2.5 L (men) of drinks a day.
  function waterGoal() { return state.settings.waterGoal || (state.profile.sex === 'male' ? 2500 : state.profile.sex === 'female' ? 2000 : 2200); }
  function waterOn(d) { return state.water[d] || 0; }
  // Water in drinks you logged in the Diary (tea, coffee, juice, milk…), from each drink's real water content.
  const DRINK_RE = /\b(milk|juice|tea|coffee|soda|cola|pepsi|drink|beverage|water|laban|latte|cappuccino|espresso|americano|karkade|hibiscus|sobia|sobya|smoothie|shake|lemonade|nescafe|kefir|buttermilk|ayran|nectar|sahlab|tamr hindi|erk soos)\b|مشروب|عصير|شاي|قهوه|لبن|كركديه|سوبيا|نسكافيه|مياه/i;
  function isDrink(f) { return !!f && (/Beverages/.test(f.cat || '') || DRINK_RE.test(f.name)) && !/powder|dry|mix,|candy|bar\b|cake|pie|pudding|cheese|yogurt|cereal|bread|ice cream|frozen/i.test(f.name); }
  // Every drink in the day's diary with its water: drinks on their own, drinks inside meals, drink ingredients in
  // recipes (milk in a smoothie), and quick adds named like a drink (counted as a 250 ml cup, since they have no amount).
  function drinksList(d) {
    const out = [];
    const one = function (it, scale) {
      if (it.ref && it.g) {
        if (it.ref.charAt(0) === 'r') { // a recipe: the drinks in it, for the share you had
          const rc = it.rc || state.recipes.find(function (x) { return x.id === it.ref; }); if (!rc || !rc.items) return;
          const total = rc.cookedG || rc.items.reduce(function (a, x) { return a + (x.g || 0); }, 0); if (!total) return;
          rc.items.forEach(function (x) { one({ ref: x.ref, g: x.g, name: x.name }, scale * it.g / total); });
          return;
        }
        const f = itemFood(it); if (!isDrink(f)) return;
        const w = per100(f, 'water'); out.push({ name: (it.name || f.name).split(' · ')[0], ml: it.g * scale * (w != null ? w : 90) / 100 });
      } else if (!it.ref && !it.mi && it.name && DRINK_RE.test(it.name) && !/powder|cake|bar\b/i.test(it.name)) out.push({ name: it.name, ml: 250 * scale, est: true });
    };
    eatenFor(d).forEach(function (it) { if (isDailyTotal(it)) return; if (Array.isArray(it.mi)) it.mi.forEach(function (x) { one(x, 1); }); else one(it, 1); });
    return out.filter(function (x) { return x.ml >= 1; });
  }
  function drinksWater(d) {
    if (state.settings.drinkWater === false) return 0;
    return Math.round(drinksList(d).reduce(function (a, x) { return a + x.ml; }, 0));
  }
  function waterTotal(d) { return waterOn(d) + drinksWater(d); }
  function fmtWater(ml) { return ml >= 1000 ? (Math.round(ml / 10) / 100) + ' L' : Math.round(ml) + ' ml'; }
  function addWater(d, ml) {
    const prev = waterOn(d), next = Math.max(0, Math.min(10000, prev + ml));
    if (next) state.water[d] = next; else delete state.water[d];
    save(); renderDiary(); buzz(ml > 0 ? 'light' : 'medium');
    return prev;
  }
  function waterSheet(date) {
    const d = date || viewDay;
    const draw = function (root, editing) {
      const own = waterOn(d), fromDrinks = drinksWater(d), ml = own + fromDrinks, goal = waterGoal(), pct = Math.min(100, ml / goal * 100);
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + esc(relDate(d)) + '</div><h2 class="sheet-title" id="sheetTitle">Water</h2></div></div>' +
        '<div class="water-big"><span class="num">' + fmtWater(ml) + '</span><small>of ' + fmtWater(goal) + '</small></div>' +
        '<div class="bar water-bar"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
        (fromDrinks ? '<p class="muted-note wt-drinks">Includes ' + fmtWater(fromDrinks) + ' from drinks in your diary</p>' : '') +
        (fromDrinks ? '<details class="wt-list"><summary>See which drinks</summary><div class="list">' + drinksList(d).map(function (x) { return '<div class="row"><div class="grow row-t">' + esc(x.name) + (x.est ? ' <span class="qs-v">a cup, estimated</span>' : '') + '</div><span class="row-v num">' + fmtWater(x.ml) + '</span></div>'; }).join('') + '</div></details>' : '') +
        '<div class="water-btns">' + state.settings.waterSizes.map(function (v, i) { return [v, ['Glass', 'Can', 'Bottle', 'Jug'][i]]; }).map(function (x) { return '<button type="button" class="btn soft" data-ml="' + x[0] + '"><b>+' + fmtWater(x[0]) + '</b><span>' + x[1] + '</span></button>'; }).join('') + '</div>' +
        '<div class="btn-row" style="margin-top:10px"><button type="button" class="btn soft" id="wtLess"' + (ml ? '' : ' disabled') + '>− 250 ml</button><button type="button" class="btn soft" id="wtGoal">Goal ' + fmtWater(goal) + '</button></div>' +
        (editing ? '<div class="label faint" style="margin:16px 0 8px">Your sizes</div><div class="four-in">' + state.settings.waterSizes.map(function (v, i) { return '<div class="field sfx"><input class="input" data-ws="' + i + '" inputmode="numeric" maxlength="4" value="' + v + '" aria-label="Size ' + (i + 1) + ' in ml" /><em>ml</em></div>'; }).join('') + '</div>' +
          '<div class="field sfx" style="margin-top:14px"><span>Daily goal</span><input class="input" id="wtG" inputmode="numeric" maxlength="5" value="' + goal + '" aria-label="Daily water goal in ml" /><em>ml</em></div><p class="form-error" id="wtErr" hidden></p>' +
          '<div class="btn-row">' + (state.settings.waterGoal ? '<button type="button" class="btn soft" id="wtAuto">Use suggested</button>' : '') + '<button type="button" class="btn primary" id="wtSave">Save goal</button></div>' : '') +
        '<div class="list wt-opt"><label class="row"><div class="grow"><div class="row-t">Count drinks from your diary</div><div class="row-s">Tea, coffee, juice, milk…, also inside meals and recipes</div></div><span class="switch"><input type="checkbox" id="wtDrinks"' + (state.settings.drinkWater !== false ? ' checked' : '') + ' /><i></i></span></label></div>' +
        '<p class="muted-note sv-src">Food has water too, so this is a rough guide.</p>';
      $$('[data-ml]', root).forEach(function (b) { b.addEventListener('click', function () { const prev = addWater(d, +b.dataset.ml); draw(root); toast('+' + fmtWater(+b.dataset.ml) + ' water', function () { state.water[d] = prev; if (!prev) delete state.water[d]; save(); renderDiary(); if (root.isConnected) draw(root); }); }); });
      $('#wtLess', root).addEventListener('click', function () { addWater(d, -250); draw(root); });
      if ($('#wtDrinks', root)) $('#wtDrinks', root).addEventListener('change', function () { state.settings.drinkWater = this.checked; save(); renderDiary(); buzz('light'); draw(root, editing); });
      $('#wtGoal', root).addEventListener('click', function () { draw(root, true); $('#wtG', root).focus(); });
      if (editing) {
        $('#wtSave', root).addEventListener('click', function () {
          const v = parseNum($('#wtG', root).value);
          if (isNaN(v) || v < 500 || v > 8000) { const x = $('#wtErr', root); x.textContent = 'Between 500 and 8,000 ml'; x.hidden = false; buzz('warn'); return; }
          const sz = $$('[data-ws]', root).map(function (x) { return parseNum(x.value); });
          if (sz.some(function (x) { return isNaN(x) || x < 50 || x > 3000; })) { const x = $('#wtErr', root); x.textContent = 'Sizes: 50 to 3,000 ml'; x.hidden = false; buzz('warn'); return; }
          state.settings.waterSizes = sz.map(Math.round);
          state.settings.waterGoal = Math.round(v); save(); renderDiary(); buzz('success'); draw(root);
        });
        if ($('#wtAuto', root)) $('#wtAuto', root).addEventListener('click', function () { state.settings.waterGoal = null; save(); renderDiary(); draw(root); });
      }
    };
    openSheet('<div id="wtRoot"></div>', function (body) { draw($('#wtRoot', body)); });
  }

  /* ================= Fasting ================= */
  function fmtAgo(ms) { const m = Math.floor(ms / 60000), h = Math.floor(m / 60); return h ? h + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : '') : Math.max(1, m) + 'm'; }
  function fmtDur(ms, secs) {
    const t = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
    return h + ':' + String(m).padStart(2, '0') + (secs ? ':' + String(s).padStart(2, '0') : '');
  }
  function fmtClock(ms) { return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
  function localDay(ms) { const d = new Date(ms); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fmtWhen(ms) { return relDate(localDay(ms)) + ', ' + fmtClock(ms); }
  function toLocalInput(ms) { const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); }
  let fastTimer = null;
  // The last time you ate (from entry times, today or yesterday), as a timestamp.
  function lastMeal() {
    let best = null; const now = Date.now();
    [isoFromDay(dayNum(todayISO()) - 1), todayISO()].forEach(function (d) { foodFor(d).forEach(function (it) { if (!it.t || it.plan) return; const p = d.split('-'), h = it.t.split(':'); const ms = new Date(+p[0], +p[1] - 1, +p[2], +h[0], +h[1]).getTime(); if (ms <= now && (!best || ms > best)) best = ms; }); });
    return best && now - best < 24 * 3600000 ? best : null;
  }
  function fastSheet() {
    const draw = function (root) {
      const f = state.fast, now = Date.now(), goalMs = f.goal * 3600000;
      clearInterval(fastTimer);
      if (f.start) {
        const el = now - f.start, pct = Math.min(100, el / goalMs * 100), r = 54, c = 2 * Math.PI * r;
        root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + f.goal + '-hour fast</div><h2 class="sheet-title" id="sheetTitle">Fasting</h2></div></div>' +
          '<div class="fast-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="' + r + '" class="ring-bg"/><circle cx="60" cy="60" r="' + r + '" class="ring-fg' + (pct >= 100 ? ' done' : '') + '" id="fsArc" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pct / 100)).toFixed(1) + '"/></svg>' +
            '<div><span class="num" id="fsEl">' + fmtDur(el, true) + '</span><small id="fsLeft">' + (el >= goalMs ? 'Goal reached' : fmtDur(goalMs - el) + ' to go') + '</small></div></div>' +
          '<div class="stat-box sv-mac meal-tot"><div><b class="num">' + fmtClock(f.start) + '</b><span>started</span></div><div><b class="num">' + fmtClock(f.start + goalMs) + '</b><span>goal</span></div></div>' +
          '<div class="label faint" style="margin:4px 0 8px">Goal</div><div class="meal-chips" id="fsGoal">' + FAST_GOALS.map(function (g) { return '<button type="button" data-v="' + g + '" aria-pressed="' + (g === f.goal) + '">' + g + 'h</button>'; }).join('') + '</div>' +
          '<div class="field"><span>Started</span><input class="input" type="datetime-local" id="fsStart" value="' + toLocalInput(f.start) + '" max="' + toLocalInput(now) + '" aria-label="Fast started" /></div>' +
          '<button type="button" class="btn primary block" id="fsEnd">End fast</button>';
        const tick = function () {
          if (!root.isConnected || !state.fast.start) { clearInterval(fastTimer); return; }
          const e2 = Date.now() - state.fast.start, p2 = Math.min(100, e2 / goalMs * 100);
          $('#fsEl', root).textContent = fmtDur(e2, true);
          $('#fsLeft', root).textContent = e2 >= goalMs ? 'Goal reached' : fmtDur(goalMs - e2) + ' to go';
          const arc = $('#fsArc', root); arc.setAttribute('stroke-dashoffset', (c * (1 - p2 / 100)).toFixed(1)); arc.classList.toggle('done', p2 >= 100);
        };
        fastTimer = setInterval(tick, 1000);
        $$('#fsGoal button', root).forEach(function (b) { b.addEventListener('click', function () { state.fast.goal = +b.dataset.v; save(); renderDiary(); buzz('light'); draw(root); }); });
        $('#fsStart', root).addEventListener('change', function () {
          const t = new Date(this.value).getTime();
          if (!isFinite(t) || t > Date.now() || Date.now() - t > 7 * 864e5) { toast('Pick a time in the last 7 days'); this.value = toLocalInput(state.fast.start); return; }
          state.fast.start = t; save(); renderDiary(); draw(root);
        });
        $('#fsEnd', root).addEventListener('click', function () {
          const snap = snapshot(), s0 = state.fast.start, e = Date.now();
          state.fast.log = [{ s: s0, e: e, g: state.fast.goal }].concat(state.fast.log).slice(0, 100); state.fast.start = null;
          save(); renderDiary(); buzz(e - s0 >= goalMs ? 'success' : 'medium'); draw(root);
          toast((e - s0 >= goalMs ? 'Goal reached · ' : 'Fast ended · ') + fmtDur(e - s0), function () { restore(snap); if (root.isConnected) draw(root); });
        });
        return;
      }
      const log = f.log.slice(0, 5);
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">Not fasting</div><h2 class="sheet-title" id="sheetTitle">Fasting</h2></div></div>' +
        '<div class="label faint" style="margin:0 0 8px">Goal</div><div class="meal-chips" id="fsGoal">' + FAST_GOALS.map(function (g) { return '<button type="button" data-v="' + g + '" aria-pressed="' + (g === f.goal) + '">' + g + 'h</button>'; }).join('') + '</div>' +
        '<p class="muted-note" style="margin:-6px 0 14px">' + f.goal + ':' + (24 - f.goal > 0 ? 24 - f.goal : 0) + ' · you\'d finish at ' + fmtClock(now + f.goal * 3600000) + '</p>' +
        '<button type="button" class="btn primary block" id="fsGo">Start fast now</button>' +
        (lastMeal() ? '<button type="button" class="btn soft block" id="fsLast" style="margin-top:10px">Start from my last meal · ' + fmtClock(lastMeal()) + '</button>' : '') +
        '<label class="text-btn fs-earlier">Started earlier?<input type="datetime-local" id="fsEarlier" max="' + toLocalInput(now) + '" aria-label="Started earlier" /></label>' +
        (log.length ? '<div class="label faint fd-sec">Recent fasts</div><div class="list">' + log.map(function (x) {
          const done = x.e - x.s >= x.g * 3600000;
          return '<div class="row fd-row"><div class="grow"><div class="row-t">' + fmtDur(x.e - x.s) + ' h' + (done ? ' <span class="fs-ok">✓</span>' : '') + '</div><div class="row-s">' + esc(fmtWhen(x.s)) + ' · goal ' + x.g + 'h</div></div></div>';
        }).join('') + '</div>' : '') +
        '<p class="muted-note sv-src">Fasting isn\'t right for everyone. Check with a doctor if you\'re pregnant, diabetic or have a history of eating disorders.</p>';
      $$('#fsGoal button', root).forEach(function (b) { b.addEventListener('click', function () { state.fast.goal = +b.dataset.v; save(); buzz('light'); draw(root); }); });
      const start = function (t) { state.fast.start = t; save(); renderDiary(); buzz('success'); draw(root); };
      $('#fsGo', root).addEventListener('click', function () { start(Date.now()); });
      if ($('#fsLast', root)) $('#fsLast', root).addEventListener('click', function () { start(lastMeal()); });
      $('#fsEarlier', root).addEventListener('change', function () {
        const t = new Date(this.value).getTime();
        if (!isFinite(t) || t > Date.now() || Date.now() - t > 7 * 864e5) { toast('Pick a time in the last 7 days'); return; }
        start(t);
      });
    };
    openSheet('<div id="fsRoot"></div>', function (body) { draw($('#fsRoot', body)); }, function () { clearInterval(fastTimer); });
  }

  /* ================= Meal planner + foods high in a nutrient ================= */
  // Everyday foods both tools can count on (USDA ids, plus a few Egyptian dishes). Your own foods come first;
  // these fill in. Each has a role, the amount range that makes sense for one person, and a natural unit to round to.
  const PF = {
    egg: ['u2707154', 'p', 50, 150], feta: ['u173420', 'f', 20, 60], cottage: ['u2705747', 'p', 100, 250], greek: ['u2705421', 'p', 120, 300], yog: ['u2705417', 'd', 120, 250], milk: ['u2705384', 'd', 150, 300],
    chicken: ['u171477', 'p', 80, 250], tilapia: ['u2706320', 'p', 100, 250], beef: ['u2705847', 'p', 80, 200], tawook: ['u9000024', 'p', 80, 240], kofta: ['u9000022', 'p', 60, 180], tuna: ['u2706311', 'p', 60, 170], salmon: ['u2706285', 'p', 80, 200],
    ful: ['u2707367', 'c', 100, 300], lentils: ['u2707423', 'c', 100, 300], chickpeas: ['u2707414', 'c', 80, 250],
    oats: ['u169705', 'c', 30, 100], bread: ['u172688', 'c', 30, 130], pita: ['u2707616', 'c', 40, 130], rice: ['u2708403', 'c', 80, 350], brown: ['u2708409', 'c', 80, 350], pasta: ['u2708357', 'c', 80, 350], potato: ['u2709382', 'c', 100, 350], sweetpot: ['u2709697', 'c', 100, 350], quinoa: ['u168917', 'c', 80, 300],
    banana: ['u173944', 'x', 80, 180], apple: ['u2709215', 'x', 100, 220], orange: ['u169097', 'x', 100, 220], dates: ['u171726', 'x', 15, 60],
    cucumber: ['u2709784', 'v', 60, 200], tomato: ['u2709719', 'v', 60, 200], lettuce: ['u2709789', 'v', 30, 120], broccoli: ['u2709647', 'v', 80, 200], carrots: ['u170393', 'v', 50, 150], molokhia: ['u9000008', 'v', 150, 350],
    oil: ['u171413', 'f', 0, 20], pb: ['u2707537', 'f', 10, 40], almonds: ['u170567', 'f', 10, 40], honey: ['u169640', 'x', 0, 25]
  };
  // Meal ideas: breakfast (b), main meals (m) and snacks (s). Each is a list of PF keys.
  const PLAN_IDEAS = {
    b: [['egg', 'bread', 'feta', 'cucumber', 'tomato'], ['oats', 'milk', 'banana', 'pb'], ['greek', 'oats', 'honey', 'almonds'], ['ful', 'pita', 'egg', 'tomato', 'oil'], ['egg', 'pita', 'cottage', 'cucumber']],
    m: [['chicken', 'rice', 'cucumber', 'tomato', 'oil'], ['tilapia', 'potato', 'broccoli', 'oil'], ['beef', 'pasta', 'tomato', 'oil'], ['tawook', 'pita', 'lettuce', 'tomato'], ['kofta', 'rice', 'cucumber', 'tomato'],
      ['chicken', 'sweetpot', 'broccoli', 'oil'], ['salmon', 'quinoa', 'lettuce', 'oil'], ['lentils', 'rice', 'carrots', 'oil'], ['tuna', 'pasta', 'lettuce', 'tomato', 'oil'], ['chicken', 'molokhia', 'rice'], ['chickpeas', 'brown', 'tomato', 'cucumber', 'oil']],
    s: [['greek', 'banana'], ['apple', 'almonds'], ['dates', 'milk'], ['yog', 'orange'], ['cottage', 'apple'], ['banana', 'pb']]
  };
  function mealKind(k) {
    const n = (mealName(k) || '').toLowerCase();
    if (/breakfast|suhoor|morning/.test(k + ' ' + n)) return 'b';
    if (/lunch|dinner|iftar|supper/.test(k + ' ' + n)) return 'm';
    return 's';
  }
  // Grams for a food that read well: whole units (2 eggs, 1 slice) when the food has one, else steps of 5 or 10 g.
  function niceAmount(f, g, role) {
    const ok = /^(large|medium|small|egg|slice|piece|fillet|small\/regular fillet|pita|small pita|skewer|bowl|fruit|date|tbsp|container)$/;
    const u = role === 'v' ? null : unitsFor(f).find(function (x) { return !x.mine && ok.test(x.label) && x.g >= 8 && x.g <= 260; });
    // whole eggs, skewers, fillets and fruit; halves only where they're normal (a slice, a pita, a bowl)
    if (u) { const half = /slice|pita|bowl|tbsp/.test(u.label), q = Math.max(half ? 0.5 : 1, half ? Math.round(g / u.g * 2) / 2 : Math.round(g / u.g)); if (Math.abs(q * u.g - g) / Math.max(g, 1) < 0.3) return { qty: q, unit: u.label, g: Math.round(q * u.g * 10) / 10 }; }
    const step = g < 40 ? 5 : 10, gg = Math.max(step, Math.round(g / step) * step);
    return { qty: gg, unit: 'g', g: gg };
  }
  // Amounts for a meal's foods so it lands on its calories, protein, carbs and fat (simple projected gradient descent).
  function fitMeal(foods, tgt) {
    const n = foods.length, per = foods.map(function (x) { const f = x.f; return [per100(f, 'kcal') || 0, per100(f, 'p') || 0, per100(f, 'c') || 0, per100(f, 'f') || 0].map(function (v) { return v / 100; }); });
    const g = foods.map(function (x) { return x.fixed != null ? x.fixed : x.lo; });
    const w = [1, 4 * 1.3, 4, 9], T = [tgt.kcal, tgt.p, tgt.c, tgt.f]; // every miss counted in calories; protein a bit more
    const tot = function () { const t = [0, 0, 0, 0]; for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) t[k] += per[i][k] * g[i]; return t; };
    // Coordinate descent: each food in turn moves to the amount that best fits, within its sensible range.
    for (let round = 0; round < 60; round++) {
      let moved = 0;
      for (let i = 0; i < n; i++) {
        if (foods[i].fixed != null) continue;
        const t = tot(); let num = 0, den = 0;
        for (let k = 0; k < 4; k++) { const ww = w[k] * w[k]; num += ww * (t[k] - T[k]) * per[i][k]; den += ww * per[i][k] * per[i][k]; }
        if (!den) continue;
        const ng = Math.max(foods[i].lo, Math.min(foods[i].hi, g[i] - num / den));
        moved += Math.abs(ng - g[i]); g[i] = ng;
      }
      if (moved < 0.5) break;
    }
    return foods.map(function (x, i) {
      const a = x.fixed != null ? { qty: x.qty, unit: x.unit, g: x.fixed } : niceAmount(x.f, g[i], x.role), m = macrosFor(x.f, a.g);
      return Object.assign({ ref: x.f.id, name: x.f.name.slice(0, 80), g: a.g, qty: a.qty, unit: a.unit }, m);
    });
  }
  function pfFood(key) { const d = PF[key]; const f = d && getFood(d[0]); return f ? { f: f, lo: d[2], hi: d[3], role: d[1] } : null; }
  // One meal: your usual foods for it if you have them (kept at your usual amounts), otherwise a fresh idea.
  function planMeal(mealKey, tgt, seed, useMine) {
    const kind = mealKind(mealKey), ideas = PLAN_IDEAS[kind], usual = useMine && seed === 0 ? usualFor(mealKey) : null;
    let foods = [];
    if (usual && usual.length) {
      usual.forEach(function (it) { const f = getFood(it.ref); if (f) foods.push({ f: f, fixed: it.g, qty: it.qty, unit: it.unit }); });
      // top up with a flexible food so the meal still reaches its share
      const fixedK = foods.reduce(function (a, x) { return a + (per100(x.f, 'kcal') || 0) * x.fixed / 100; }, 0);
      if (fixedK < tgt.kcal * 0.8) {
        const add = pfFood(kind === 'b' ? 'bread' : kind === 'm' ? 'rice' : 'banana'), same = add && foods.find(function (x) { return x.f.id === add.f.id; });
        // already one of your usual foods: have more of it rather than listing it twice
        if (same) { same.lo = same.fixed; same.hi = Math.max(same.fixed * 2, add.hi); same.role = add.role; delete same.fixed; delete same.qty; delete same.unit; }
        else if (add) foods.push(add);
      }
    } else {
      const idea = ideas[(seed + mealKey.length * 7) % ideas.length];
      idea.forEach(function (k) { const x = pfFood(k); if (x) foods.push(x); });
    }
    return { meal: mealKey, kind: kind, items: fitMeal(foods, tgt), mine: !!(usual && usual.length) };
  }
  // A whole day of meals for your targets (the plan stands on its own; you choose the date when you add it).
  function planDay(seeds, useMine, meals) {
    const pl = makePlan(activeEnergy()); if (!pl) return null;
    const open = MEALS.map(function (m) { return m[0]; }).filter(function (k) { return !meals || meals.indexOf(k) >= 0; });
    if (!open.length) return { meals: [], target: null };
    const share = { b: 25, m: 35, s: 10 }, wsum = open.reduce(function (a, k) { return a + share[mealKind(k)]; }, 0);
    const T = { kcal: roundKcal(pl.target), p: pl.protein, c: pl.carbs, f: pl.fat };
    const out = open.map(function (k) { const s = share[mealKind(k)] / wsum; return planMeal(k, { kcal: T.kcal * s, p: T.p * s, c: T.c * s, f: T.f * s }, seeds[k] || 0, useMine); });
    return { meals: out, target: T };
  }
  function mealSum(items) { return items.reduce(function (a, x) { a.kcal += x.kcal; a.p += x.protein; a.c += x.carbs; a.f += x.fat; return a; }, { kcal: 0, p: 0, c: 0, f: 0 }); }
  // Your plan is kept (which ideas, which meals) so it's the same when you come back.
  function dietOpts() {
    const o = state.ui.diet || {}, keys = MEALS.map(function (m) { return m[0]; });
    const meals = Array.isArray(o.meals) ? o.meals.filter(function (k) { return keys.indexOf(k) >= 0; }) : [];
    return { seeds: o.seeds && typeof o.seeds === 'object' ? Object.assign({}, o.seeds) : {}, mine: o.mine !== false, meals: meals.length ? meals : keys };
  }
  function planDaySheet(date) {
    const o = dietOpts(); let seeds = o.seeds, useMine = o.mine, meals = o.meals, plan = null, step = 'plan', skipFull = true, opened = false, lastOff = null, popKey = null, pdChanged = null;
    // the day it goes on: the one you opened it from, else today if it's still empty, else tomorrow
    let to = date || (eatenFor(todayISO()).some(function (x) { return !isDailyTotal(x); }) ? isoFromDay(dayNum(todayISO()) + 1) : todayISO());
    const keep = function () { state.ui.diet = { seeds: seeds, mine: useMine, meals: meals.length === MEALS.length ? null : meals }; save(); };
    const SHUF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>';
    const AGAIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4"/></svg>';
    const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    const headPlan = '<div class="sheet-head"><div class="grow"><div class="label faint">Your plan</div><h2 class="sheet-title" id="sheetTitle">Meal planner</h2></div></div>';
    const ring = function (v, t) {
      const r = 46, c = 2 * Math.PI * r, pc = t ? Math.min(1, v / t) : 0;
      return '<div class="pd-ring"><svg viewBox="0 0 108 108" aria-hidden="true"><circle cx="54" cy="54" r="' + r + '" class="pd-ring-bg"/><circle cx="54" cy="54" r="' + r + '" class="pd-ring-fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pc)).toFixed(1) + '"/></svg>' +
        '<div><b class="num" data-an="' + v + '" data-af="k">' + fmtKcal(v) + '</b><span>of ' + fmtKcal(t) + ' kcal</span></div></div>';
    };
    const macro = function (lbl, v, t, k) {
      const near = t && Math.abs(v - t) <= Math.max(5, t * 0.06);
      return '<div class="pd-mac-r"><span class="pd-dot mb-' + k + '"></span><span class="pd-mac-l">' + lbl + '</span><b class="num"><span data-an="' + v + '" data-af="g">' + v + '</span><small> / ' + t + ' g</small></b>' + (near ? '<i class="pd-ok" title="On target">' + TICK + '</i>' : '<i class="pd-ok off"></i>') +
        '<span class="bar"><i data-aw class="mb-' + k + '" style="width:' + (t ? Math.min(100, Math.round(v / t * 100)) : 0) + '%"></i></span></div>';
    };
    const drawPlan = function (root) {
      plan = planDay(seeds, useMine, meals);
      let h = headPlan;
      if (!plan) { root.innerHTML = h + '<p class="muted-note fd-empty">Set your targets first, then Setpoint can plan a day around them.</p><button type="button" class="btn primary block" data-action="go-targets">Set targets</button>'; return; }
      const all = []; plan.meals.forEach(function (m) { m.items.forEach(function (x) { all.push(x); }); });
      const tot = mealSum(all), T = plan.target;
      h += '<div class="card pd-hero">' + ring(tot.kcal, T.kcal) + '<div class="pd-macs">' + macro('Protein', tot.p, T.p, 'p') + macro('Carbs', tot.c, T.c, 'c') + macro('Fat', tot.f, T.f, 'f') + '</div></div>';
      h += '<label class="pd-mine-t"><span class="grow"><b>Learn from my entries</b><small>Builds meals from the foods and amounts you log most</small></span><span class="switch"><input type="checkbox" id="pdMine"' + (useMine ? ' checked' : '') + ' /><i></i></span></label>';
      // every meal has its own small switch; a meal that's off folds down to its name
      const byKey = {}; plan.meals.forEach(function (m) { byKey[m.meal] = m; });
      const mini = function (k, on, name) { return '<label class="mini-sw" title="' + (on ? 'Planned' : 'Not planned') + '"><input type="checkbox" data-pd-meal="' + k + '"' + (on ? ' checked' : '') + ' aria-label="Plan ' + esc(name) + '" /><i></i></label>'; };
      MEALS.forEach(function (mm) {
        const m = byKey[mm[0]], name = mealName(mm[0]);
        if (!m) { h += '<div class="card pd-card pd-off" data-m="' + mm[0] + '"><div class="pd-ch"><div class="grow"><b>' + esc(name) + '</b><span class="pd-cs">Not planned</span></div>' + mini(mm[0], false, name) + '</div></div>'; return; }
        const ms = mealSum(m.items);
        h += '<div class="card pd-card" data-m="' + m.meal + '"><div class="pd-ch"><div class="grow"><b>' + esc(name) + '</b><span class="pd-cs">' + (m.mine ? '<em>Your usual</em> · ' : '') + 'P ' + ms.p + ' · C ' + ms.c + ' · F ' + ms.f + '</span></div><span class="pd-ck num">' + fmtKcal(ms.kcal) + '<small> kcal</small></span>' + mini(m.meal, true, name) + '</div>' +
          m.items.map(function (x) { const f = getFood(x.ref); return '<div class="pd-row">' + (f ? ftIcon(ftKind(f)) : '') + '<div class="grow"><div class="row-t">' + esc(shortName(x.name)) + '</div><div class="row-s">' + esc(fmtAmt(x.qty, x.unit)) + '</div></div><span class="num pd-rk">' + fmtKcal(x.kcal) + '</span></div>'; }).join('') +
          '<button type="button" class="pd-again" data-pd-shuf="' + m.meal + '">' + AGAIN + 'Another idea</button></div>';
      });
      h += '<p class="muted-note sv-src">A starting point from your targets, not medical advice. Swap anything you don\'t like after adding it.</p>' +
        '<div class="sheet-foot pd-foot"><button type="button" class="icon-btn pd-all" id="pdAll" aria-label="Shuffle the whole day">' + SHUF + '</button><button type="button" class="btn primary grow" id="pdNext">Add to diary</button></div>';
      root.innerHTML = h;
      const fg = $('.pd-ring-fg', root), off = fg ? +fg.getAttribute('stroke-dashoffset') : 0;
      if (fg && fg.dataset) fg.dataset.off = off;
      if (!opened && !calmMotion()) {
        // first look: the ring draws in, the numbers count up and the meals rise in one after another
        opened = true; animMem.pd = null;
        const C = +fg.getAttribute('stroke-dasharray'), num = $('.pd-ring b', root), to = +num.dataset.an, t0 = performance.now();
        fg.style.transition = 'none'; fg.setAttribute('stroke-dashoffset', C); fg.getBoundingClientRect();
        requestAnimationFrame(function () { fg.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)'; fg.setAttribute('stroke-dashoffset', off); });
        (function step(t) { const k = Math.min(1, (t - t0) / 900); num.textContent = fmtKcal(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1 && num.isConnected) requestAnimationFrame(step); })(t0);
        $$('[data-aw]', root).forEach(function (b) { const w = b.style.width; b.style.transition = 'none'; b.style.width = '0%'; b.getBoundingClientRect(); requestAnimationFrame(function () { b.style.transition = 'width .9s cubic-bezier(.22,1,.36,1)'; b.style.width = w; }); });
        $$('.pd-card', root).forEach(function (c, n) { c.style.animationDelay = (120 + n * 70) + 'ms'; c.classList.add('pd-new'); });
        animate(root, 'pd');
      } else {
        if (fg && lastOff != null && lastOff !== off) { fg.style.transition = 'none'; fg.setAttribute('stroke-dashoffset', lastOff); fg.getBoundingClientRect(); fg.style.transition = 'stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)'; fg.setAttribute('stroke-dashoffset', off); }
        animate(root, 'pd');
      }
      lastOff = off;
      if (popKey) { pdChanged = popKey; popKey = null; } // the meal you switched: redraw() resizes it smoothly
      $$('[data-pd-shuf]', root).forEach(function (b) { b.addEventListener('click', function () { const k = b.dataset.pdShuf; seeds[k] = (seeds[k] || 0) + 1; keep(); buzz('light'); redraw(root, b.closest('.pd-card')); }); });
      $$('[data-pd-meal]', root).forEach(function (b) { b.addEventListener('change', function () {
        const k = b.dataset.pdMeal, i = meals.indexOf(k);
        if (!b.checked && i >= 0) { if (meals.length === 1) { b.checked = true; buzz('warn'); toast('Keep at least one meal'); return; } meals.splice(i, 1); }
        else if (b.checked && i < 0) meals = MEALS.map(function (m) { return m[0]; }).filter(function (x) { return x === k || meals.indexOf(x) >= 0; });
        popKey = k; keep(); buzz('light');
        setTimeout(function () { if (root.isConnected) redraw(root); }, 520); // let the glass knob finish sliding first
      }); });
      $('#pdMine', root).addEventListener('change', function () { useMine = this.checked; seeds = {}; keep(); buzz('light'); redraw(root); });
      $('#pdAll', root).addEventListener('click', function () { MEALS.forEach(function (m) { seeds[m[0]] = (seeds[m[0]] || 0) + 1 + Math.floor(Math.random() * 3); }); keep(); buzz('medium'); redraw(root, null, true); });
      $('#pdNext', root).addEventListener('click', function () { step = 'add'; buzz('light'); draw(root); });
    };
    // Re-draw in place, keeping your scroll. A meal that changes size (switched off or on, another idea) grows or
    // shrinks to its new height and everything below follows; its new foods fade in. Nothing jumps or blinks.
    const redraw = function (root, card, all) {
      const sc = sheet.scrollTop, key = card ? card.dataset.m : null, hs = {};
      $$('.pd-card', root).forEach(function (c) { hs[c.dataset.m] = c.offsetHeight; });
      drawPlan(root); sheet.scrollTop = sc;
      const cards = $$('.pd-card', root), pk = pdChanged; pdChanged = null;
      if (calmMotion() || !root.animate) return;
      const ease = 'cubic-bezier(.2,.8,.2,1)';
      cards.forEach(function (c) {
        const h0 = hs[c.dataset.m], h1 = c.offsetHeight; if (!h0 || Math.abs(h0 - h1) < 2) return;
        c.style.overflow = 'hidden';
        const a = c.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 380, easing: ease });
        a.onfinish = a.oncancel = function () { c.style.overflow = ''; };
      });
      cards.filter(function (c) { return all || c.dataset.m === key || c.dataset.m === pk; }).forEach(function (c, n) {
        $$('.pd-row, .pd-again', c).forEach(function (r, j) { r.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 60 + n * 40 + j * 35, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }); });
      });
    };
    // Step 2: which day it goes on.
    const drawAdd = function (root) {
      const today = todayISO(), tmr = isoFromDay(dayNum(today) + 1), have = eatenFor(to).filter(function (x) { return !isDailyTotal(x); });
      const full = {}; have.forEach(function (x) { full[mealOf(x)] = 1; });
      const kept = plan.meals.filter(function (m) { return !(skipFull && full[m.meal]); }), n = kept.reduce(function (a, m) { return a + m.items.length; }, 0), kc = mealSum([].concat.apply([], kept.map(function (m) { return m.items; }))).kcal;
      const sd = function (iso) { return esc(fmtDate(iso, { weekday: 'short', month: 'short', day: 'numeric' })); };
      const chip = function (iso, lbl) { return '<button type="button" class="pd-mt" data-pd-to="' + iso + '" aria-pressed="' + (to === iso) + '"><span class="pd-mt-c">' + TICK + '</span><span class="pd-mt-t"><b>' + lbl + '</b><small>' + sd(iso) + '</small></span></button>'; };
      const other = to !== today && to !== tmr;
      root.innerHTML = '<div class="sheet-head"><button type="button" class="icon-btn back-btn" id="pdBack" aria-label="Back">' + BACK_IC + '</button><div class="grow"><div class="label faint">Meal planner</div><h2 class="sheet-title" id="sheetTitle">Add to diary</h2></div></div>' +
        '<div class="pd-opt-l">Which day</div><div class="pd-meals pd-days">' + chip(today, 'Today') + chip(tmr, 'Tomorrow') +
        '<label class="pd-mt pd-pick" aria-pressed="' + other + '"><span class="pd-mt-c">' + TICK + '</span><span class="pd-mt-t"><b>' + (other ? 'Other day' : 'Pick a date') + '</b><small>' + (other ? sd(to) : 'Any day') + '</small></span><input type="date" id="pdDate" value="' + to + '" aria-label="Pick a date" /></label></div>' +
        '<div class="card pd-to">' + '<div class="pd-to-d"><b>' + esc(relDate(to)) + '</b><span>' + esc(fmtDate(to, { weekday: 'long', month: 'long', day: 'numeric' })) + '</span></div>' +
        (have.length ? '<p class="pd-warn">This day already has ' + fmtKcal(have.reduce(function (a, x) { return a + (x.kcal || 0); }, 0)) + ' kcal logged.</p>' +
          '<label class="pd-mine-t"><span class="grow"><b>Skip meals that already have food</b><small>Only fill the empty ones</small></span><span class="switch"><input type="checkbox" id="pdSkip"' + (skipFull ? ' checked' : '') + ' /><i></i></span></label>' : '') +
        '<div class="pd-to-l">' + plan.meals.map(function (m) { const skip = skipFull && full[m.meal]; return '<div class="pd-to-r' + (skip ? ' off' : '') + '"><span>' + esc(mealName(m.meal)) + '</span><span class="num">' + (skip ? 'Skipped' : fmtKcal(mealSum(m.items).kcal) + ' kcal') + '</span></div>'; }).join('') + '</div></div>' +
        '<p class="muted-note sv-src">Foods go in as planned, so they count once you tick them off as eaten.</p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="pdAdd"' + (n ? '' : ' disabled') + '>' + (n ? 'Add ' + n + ' foods · ' + fmtKcal(kc) + ' kcal' : 'Nothing to add') + '</button></div>';
      if (popKey === 'day') { const t = $('.pd-days [aria-pressed="true"]', root); if (t) t.classList.add('pop'); popKey = null; }
      $('#pdBack', root).addEventListener('click', function () { step = 'plan'; buzz('light'); draw(root); });
      $$('[data-pd-to]', root).forEach(function (b) { b.addEventListener('click', function () { to = b.dataset.pdTo; popKey = 'day'; buzz('light'); draw(root); }); });
      $('#pdDate', root).addEventListener('change', function () { if (/^\d{4}-\d{2}-\d{2}$/.test(this.value)) { to = this.value; popKey = 'day'; buzz('light'); draw(root); } });
      if ($('#pdSkip', root)) $('#pdSkip', root).addEventListener('change', function () { skipFull = this.checked; buzz('light'); draw(root); });
      $('#pdAdd', root).addEventListener('click', function () {
        const snap = snapshot(), items = [];
        kept.forEach(function (m) { m.items.forEach(function (x) { items.push(Object.assign({}, x, { id: newId(), meal: m.meal, plan: true })); }); });
        addItems(to, items); save(); closeSheet(); viewDay = to; renderAll(); if (state.ui.tab !== 'diary') showTab('diary'); buzz('success');
        toast('Planned ' + items.length + ' foods for ' + relDate(to), function () { restore(snap); });
      });
    };
    const draw = function (root) {
      if (!foodDB) { root.innerHTML = headPlan + skel(5); loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) root.innerHTML = headPlan + '<p class="muted-note fd-empty">The food list needs a connection the first time. Try again when you\'re online.</p>'; }); return; }
      if (step === 'add' && plan && plan.meals.length) drawAdd(root); else drawPlan(root);
      sheet.scrollTop = step === 'add' ? 0 : sheet.scrollTop;
    };
    openSheet('<div id="pdRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#pdRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }

  // ----- Foods high in a nutrient: the richest everyday foods per serving or per 100 kcal, or your week's top sources -----
  function nutFoodsSheet(date, opt) {
    let d = date || todayISO(), key = (opt && opt.key) || 'fib', by = (opt && opt.by) || 'serving';
    const head = '<div class="sheet-head"><div class="grow"><div class="label faint">Foods high in</div><h2 class="sheet-title" id="sheetTitle">' + esc((NUT[key] || NUT.fib).label) + '</h2></div></div>';
    const draw = function (root) {
      if (!foodDB) { root.innerHTML = head + skel(5); loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) root.innerHTML = head + '<p class="muted-note fd-empty">The food list needs a connection the first time. Try again when you\'re online.</p>'; }); return; }
      const nutOpts = NUTS.filter(function (x) { return (by === 'week' && x[0] !== 'kcal') || ['kcal', 'sug', 'sat', 'trans', 'chol', 'na', 'alc', 'caff'].indexOf(x[0]) < 0; });
      if (!nutOpts.some(function (x) { return x[0] === key; })) key = 'fib';
      root.innerHTML = '<div class="sheet-head"><div class="grow"><div class="label faint">Foods high in</div><h2 class="sheet-title" id="sheetTitle">' + esc(NUT[key].label) + '</h2></div></div>' +
        '<div class="sg-nut"><div class="field"><select class="input" id="hiKey" aria-label="Nutrient">' + nutOpts.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === key ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></div>' +
        '<div class="seg w3" id="hiMode"><button type="button" data-v="serving" aria-pressed="' + (by === 'serving') + '">Per serving</button><button type="button" data-v="kcal" aria-pressed="' + (by === 'kcal') + '">Per 100 kcal</button><button type="button" data-v="week" aria-pressed="' + (by === 'week') + '">Your week</button></div></div>' + highInHtml(key, by);
      $('#hiKey', root).addEventListener('change', function () { key = this.value; draw(root); });
      $$('#hiMode button', root).forEach(function (b) { b.addEventListener('click', function () { by = b.dataset.v; buzz('light'); draw(root); }); });
      $$('[data-sg]', root).forEach(function (b) { b.addEventListener('click', function () { const f = getFood(b.dataset.sg); if (!f) return; buzz('light'); closeSheet(); addFoodSheet(null, d, null, f); }); });
    };
    openSheet('<div id="sgRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#sgRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
  /* ================= Smart touches ================= */
  // One gentle nudge on today's diary in the evening, when something important is clearly short.
  function diaryHint() {
    if (viewDay !== todayISO()) return '';
    const off = state.ui.hintOff && state.ui.hintOff.d === viewDay ? state.ui.hintOff.k : [], shown = function (x) { return off.indexOf(x.key) < 0; };
    const hx = function (k) { return '<button type="button" class="hint-x" data-hint-x="' + k + '" aria-label="Hide for today"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button>'; };
    // Over a limit today (sodium, saturated fat, caffeine, or a lot of sugar): say so any time of day.
    if (!dayNeedsDB(viewDay) && foodFor(viewDay).some(function (it) { return it.ref || it.mid; })) {
      const nd = dayNutrients(viewDay), tg = nutTargets(viewDay), kc = tg.kcal ? tg.kcal.min : 2000, over = [];
      [['na', 'Sodium', 'mg'], ['sat', 'Saturated fat', 'g'], ['caff', 'Caffeine', 'mg']].forEach(function (x) { const t = tg[x[0]]; if (t && t.max && nd.tot[x[0]] > t.max && nd.cov[x[0]] > 0.5) over.push({ key: x[0], t: x[1] + ' is over today\'s max', s: fmtNut(nd.tot[x[0]], x[2]) + ' of ' + fmtNut(t.max, x[2]) + ' · see where it came from', r: nd.tot[x[0]] / t.max }); });
      const sugMax = Math.round(kc * 0.2 / 4); if (nd.tot.sug > sugMax && nd.cov.sug > 0.5) over.push({ key: 'sug', t: 'Lots of sugar today', s: Math.round(nd.tot.sug) + ' g so far (about ' + sugMax + ' g is a lot for you) · see where it came from', r: nd.tot.sug / sugMax });
      const ov = over.filter(shown);
      if (ov.length) {
        const w = ov.sort(function (a, b) { return b.r - a.r; })[0];
        return '<div class="card hint-card warn" role="button" tabindex="0" data-src="' + w.key + '"><span class="hint-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg></span><span class="grow"><b>' + w.t + '</b><span>' + w.s + '</span></span>' + hx(w.key) + '</div>';
      }
    }
    if (new Date().getHours() < 17) return '';
    const plan = dayPlan(viewDay), tt = dayTotals(viewDay);
    if (!plan || tt.kcal < plan.target * 0.4) return '';
    const short = [];
    if (tt.protein < plan.protein * 0.6) short.push({ key: 'p', label: 'Protein', gap: Math.round(plan.protein - tt.protein) + ' g' });
    if (!dayNeedsDB(viewDay) && foodFor(viewDay).some(function (it) { return it.ref; })) {
      const nd = dayNutrients(viewDay), tg = nutTargets(viewDay);
      if (nd.cov.fib > 0.8 && nd.tot.fib < tg.fib.min * 0.5) short.push({ key: 'fib', label: 'Fiber', gap: Math.round(tg.fib.min - nd.tot.fib) + ' g' });
    }
    const sh = short.filter(shown);
    if (!sh.length) return '';
    const s = sh[0];
    return '<div class="card hint-card" role="button" tabindex="0" data-high="' + s.key + '"><span class="hint-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/></svg></span>' +
      '<span class="grow"><b>' + s.label + ' is ' + s.gap + ' short today</b><span>See foods that would fill it</span></span>' + hx(s.key) + '</div>';
  }
  // Weekly check-in: how eating went that week.
  function weekNutrition(start) { return onePass(function () { return weekNutritionNow(start); }); }
  function weekNutritionNow(start) {
    const tg = nutTargets(), days = [];
    for (let d = start; d < start + 7; d++) { const iso = isoFromDay(d); if (iso > todayISO()) break; const t = dayTotals(iso); if (t.kcal > 0) days.push(iso); }
    if (days.length < 3) return '';
    const avg = Math.round(days.reduce(function (a, d) { return a + dayTotals(d).kcal; }, 0) / days.length);
    let low = '';
    if (foodDB) {
      const nds = days.map(dayNutrients), lows = [];
      MICROS.concat(['fib']).forEach(function (k) {
        if (!tg[k] || !tg[k].min) return;
        const cov = nds.reduce(function (a, x) { return a + x.cov[k]; }, 0) / nds.length; if (cov < 0.7) return;
        const pct = nds.reduce(function (a, x) { return a + x.tot[k]; }, 0) / nds.length / tg[k].min * 100;
        if (pct < 75) lows.push([pct, NUT[k].label]);
      });
      lows.sort(function (a, b) { return a[0] - b[0]; });
      if (lows.length) low = ' Often low on ' + lows.slice(0, 2).map(function (x) { return x[1].toLowerCase().replace(/^vitamin/, 'vitamin'); }).join(' and ') + '.';
    }
    // That week's own targets (they may have changed since).
    const tgs = days.map(function (d) { const pl = dayPlan(d); return pl ? roundKcal(pl.target) : null; }).filter(Boolean), tAvg = tgs.length ? roundKcal(tgs.reduce(function (a, x) { return a + x; }, 0) / tgs.length) : null;
    const pc = tAvg ? Math.round(avg / tAvg * 100) : null;
    return '<div class="card wk-food-card"><div class="tg-row"><div class="tg-line"><span class="tg-l"><b>Calories</b> – ' + fmtKcal(avg) + (tAvg ? ' / ' + fmtKcal(tAvg) : '') + ' a day</span>' + (pc != null ? '<span class="tg-pc num">' + pc + '%</span>' : '') + '</div>' + (pc != null ? '<div class="bar tg-bar"><i class="mb-k' + (pc > 105 ? ' over' : '') + '" style="width:' + Math.min(100, pc) + '%"></i></div>' : '') + '</div>' +
      '<p class="wk-food">' + days.length + ' of 7 days logged.' + low + '</p></div>';
  }

  function foodItemSheet(id, date) {
    const d = date || viewDay, f = foodFor(d).find(function (x) { return x.id === id; });
    if (!f) return;
    if (f.ref && f.ref.charAt(0) === 'r' && (f.rc || state.recipes.some(function (x) { return x.id === f.ref; }))) return addFoodSheet(null, d, f, null, true);
    if (f.ref && (itemNeedsDB(f) || itemFood(f))) return addFoodSheet(null, d, f);
    if (f.mid && (f.mi || state.meals.some(function (x) { return x.id === f.mid; }))) return addFoodSheet(null, d, f, null, true);
    let ml = f.meal;
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">' + editTitle(d) + '</h2>' + '<button type="button" class="icon-btn hd-more" data-more aria-label="More">' + MORE_IC + '</button>' + '</div>' +
      '<div class="meal-chips" id="feMeal">' + MEALS.map(function (m) { return '<button type="button" data-v="' + m[0] + '" aria-pressed="' + (m[0] === ml) + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      '<div class="field"><input class="input" id="feN" maxlength="40" placeholder="Name" aria-label="Name" autocomplete="off" value="' + esc(f.name) + '" /></div>' +
      '<div class="four-in">' +
        '<div class="field sfx"><input class="input" id="feK" inputmode="numeric" maxlength="5" aria-label="Calories" value="' + f.kcal + '" /><em>kcal</em></div>' +
        '<div class="field sfx"><input class="input" id="feP" inputmode="numeric" maxlength="3" aria-label="Protein" value="' + f.protein + '" /><em>g P</em></div>' +
        '<div class="field sfx"><input class="input" id="feC" inputmode="numeric" maxlength="3" aria-label="Carbs" value="' + f.carbs + '" /><em>g C</em></div>' +
        '<div class="field sfx"><input class="input" id="feF" inputmode="numeric" maxlength="3" aria-label="Fat" value="' + f.fat + '" /><em>g F</em></div>' +
      '</div><p class="form-error" id="feErr" hidden></p>' + notePicHtml(f) +
      '<div class="menu-src" hidden><button type="button" class="danger" id="feDel">Delete</button></div>' +
      '<div class="sheet-foot"><button type="button" class="btn primary block" id="feSave">Save</button></div>',
      function (root) {
        sheet.classList.add('tall'); bindNotePic(root, f);
        $$('#feMeal button', root).forEach(function (b) { b.addEventListener('click', function () { ml = b.dataset.v; $$('#feMeal button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); buzz('light'); }); });
        $('#feSave', root).addEventListener('click', function () {
          const v = function (id2, max) { const n = parseNum($('#' + id2, root).value || '0'); return isNaN(n) || n < 0 || n > max ? NaN : Math.round(n); };
          const k = v('feK', 10000), pr = v('feP', 300), cb = v('feC', 600), ft = v('feF', 300);
          if (isNaN(k) || k < 1 || isNaN(pr) || isNaN(cb) || isNaN(ft)) { const x = $('#feErr', root); x.textContent = 'Check the numbers'; x.hidden = false; buzz('warn'); return; }
          const snap = snapshot();
          Object.assign(f, { kcal: k, protein: pr, carbs: cb, fat: ft, name: $('#feN', root).value.trim().slice(0, 40), meal: ml }); readNote(root, f);
          save(); renderAll(); closeSheet(); buzz('success'); toast('Saved', function () { restore(snap); });
        });
        $('#feDel', root).addEventListener('click', function () { closeSheet(); removeFoodItem(id, d); });
      }, function () { sheet.classList.remove('tall'); });
  }

  // Progress → Nutrition: last 14 days of calories against the target, plus averages.
  // The range buttons can sit inside a card that's about to be redrawn: lift them out first so they aren't lost.
  function keepRange(el) { const rs = $('#rangeSeg'), home = $('#prog-nutrition'); if (rs && el && el.contains(rs) && home) home.parentNode.insertBefore(rs, home); }
  function renderNutrition() { whenSeen('nut', function () { onePass(renderNutritionNow); }, function () { return !$('#nutBox').firstChild || (!$('#panel-progress').hidden && !$('#prog-nutrition').hidden); }); }
  function renderNutritionNow() {
    keepRange($('#nutBox'));
    const box = $('#nutBox'), today = dayNum(todayISO()), plan = makePlan(activeEnergy()), tgt = plan ? roundKcal(plan.target) : null;
    const days = [];
    for (let d = today - 13; d <= today; d++) { const t = dayTotals(isoFromDay(d)); days.push({ d: d, t: t }); }
    const max = Math.max(tgt || 0, Math.max.apply(null, days.map(function (x) { return x.t.kcal; }))) * 1.1 || 1;
    const logged = days.filter(function (x) { return x.t.kcal > 0 && x.d < today; });
    const avg = function (k) { return logged.length ? Math.round(logged.reduce(function (a, x) { return a + x.t[k]; }, 0) / logged.length) : null; };
    const cell = function (v, l) { return '<div class="metric"><span class="m-v num">' + (v == null ? '—' : v) + '</span><span class="m-l">' + l + '</span></div>'; };
    box.innerHTML = '<div class="card"><div class="card-head"><h2 class="card-title">Calories</h2><span class="label faint">Last 14 days</span></div>' +
      '<div class="nut-bars">' + (tgt ? '<span class="nut-line" style="bottom:' + (tgt / max * 100).toFixed(1) + '%"></span>' : '') +
        days.map(function (x) { const dp = dayPlan(isoFromDay(x.d)), dt = dp ? roundKcal(dp.target) : tgt; return '<i class="' + (!x.t.kcal ? 'empty' : dt && x.t.kcal > dt * 1.1 ? 'over' : '') + '" style="height:' + (x.t.kcal ? Math.max(3, x.t.kcal / max * 100) : 3).toFixed(1) + '%" title="' + esc(fmtDate(isoFromDay(x.d))) + ': ' + x.t.kcal + ' kcal"></i>'; }).join('') + '</div>' +
      '<div class="nut-days">' + days.map(function (x) { return '<span>' + parseISO(isoFromDay(x.d)).toLocaleDateString(undefined, { weekday: 'narrow' }) + '</span>'; }).join('') + '</div>' +
      (logged.length ? '<div class="sv-sum nut-ring">' + sumBox({ kcal: avg('kcal'), protein: avg('protein'), carbs: avg('carbs'), fat: avg('fat') }, 'a day') + '</div>' : '') + '<div class="metrics four" hidden style="grid-template-columns:repeat(4,1fr)">' + cell(avg('kcal') != null ? fmtKcal(avg('kcal')) : null, 'Avg kcal') + cell(avg('protein') != null ? avg('protein') + 'g' : null, 'Protein') + cell(avg('carbs') != null ? avg('carbs') + 'g' : null, 'Carbs') + cell(avg('fat') != null ? avg('fat') + 'g' : null, 'Fat') + '</div>' +
      '<p class="t-sub" style="text-align:center;margin-top:12px">' + (logged.length ? 'Average of ' + logged.length + ' full day' + (logged.length === 1 ? '' : 's') + (tgt ? ' · line = ' + fmtKcal(tgt) + ' target' : '') : 'Log food for a few days to see your averages') + '</p></div>';
      box.insertAdjacentHTML('afterbegin', weekReviewCard());
      box.insertAdjacentHTML('beforeend', calCard() + '<div class="card" id="trendBox"></div>' + windowCard() + '<div id="lowBox"></div>'); renderTrend(); renderLowCard();
  }

  // A month at a glance: each day coloured by how it went against that day's calorie target (within 10% = on target).
  let calOff = 0; // months back from this one
  function calDay(iso) {
    const t = dayTotals(iso).kcal, pl = dayPlan(iso);
    if (!t) return 'none';
    if (!pl) return 'logged';
    return t > pl.target * 1.1 ? 'over' : t < pl.target * 0.9 ? 'under' : 'on';
  }
  function calCard() {
    const now = parseISO(todayISO()), first = new Date(now.getFullYear(), now.getMonth() - calOff, 1);
    const y = first.getFullYear(), mo = first.getMonth(), n = new Date(y, mo + 1, 0).getDate(), today = todayISO();
    const iso = function (d) { return y + '-' + String(mo + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'); };
    const order = weekOrder(), lead = order.indexOf(first.getDay()), cnt = { on: 0, over: 0, under: 0 };
    let cells = '';
    for (let i = 0; i < lead; i++) cells += '<span class="cal-x"></span>';
    for (let d = 1; d <= n; d++) {
      const id = iso(d), fut = id > today, k = fut ? 'fut' : id === today ? 'today' : calDay(id);
      if (cnt[k] != null) cnt[k]++;
      cells += fut ? '<span class="cal-d cal-fut">' + d + '</span>' : '<button type="button" class="cal-d cal-' + k + '" data-cal-day="' + id + '" aria-label="' + esc(fmtDate(id, { weekday: 'long', month: 'long', day: 'numeric' })) + '">' + d + '</button>';
    }
    const oldest = state.entries.length || Object.keys(state.food).length ? [].concat(Object.keys(state.food), state.entries.map(function (e) { return e.date; })).sort()[0] : today;
    const canBack = iso(1) > oldest;
    const AR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
    return '<div class="card cal-card"><div class="cal-head"><button type="button" class="icon-btn cal-nav" data-cal-m="1" aria-label="Previous month"' + (canBack ? '' : ' disabled') + '>' + AR + '</button>' +
      '<div class="cal-t">' + esc(dtf({ month: 'long', year: 'numeric' }).format(first)) + '</div>' +
      '<button type="button" class="icon-btn cal-nav cal-next" data-cal-m="-1" aria-label="Next month"' + (calOff ? '' : ' disabled') + '>' + AR + '</button></div>' +
      '<div class="cal-grid cal-wd">' + order.map(function (w) { return '<span>' + esc(dayAbbr(w).slice(0, state.settings.lang === 'ar' ? 6 : 1)) + '</span>'; }).join('') + '</div>' +
      '<div class="cal-grid">' + cells + '</div>' +
      '<div class="cal-key"><span><i class="cal-on"></i>On target <b class="num">' + cnt.on + '</b></span><span><i class="cal-over"></i>Over <b class="num">' + cnt.over + '</b></span><span><i class="cal-under"></i>Under <b class="num">' + cnt.under + '</b></span></div>' +
      '<button type="button" class="ins-more cal-rep" data-month-report><span><b>Monthly report</b><small>Your last 30 days as an image</small></span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button></div>';
  }
  // Any nutrient over the last 30 or 90 days, against each day's target.
  let trendKey = 'p';
  // Nutrition trends follow the Progress range (bars per day, so at most 180 days).
  function trendSpan() { const r = state.ui.range; return r ? Math.min(r, 180) : 180; }
  function renderTrend() { onePass(renderTrendNow); }
  function renderTrendNow() {
    const box = $('#trendBox'); if (!box) return;
    keepRange(box);
    const trendDays = trendSpan(), today = dayNum(todayISO()), from = today - trendDays + 1, isos = [];
    for (let d = from; d <= today; d++) isos.push(isoFromDay(d));
    if (!foodDB && isos.some(dayNeedsDB)) { box.innerHTML = '<div class="card-head"><h2 class="card-title">Trends</h2></div>' + skel(3); loadFoods().then(renderTrend, function () {}); return; }
    const n = NUT[trendKey], vals = isos.map(function (d) { const nd = foodFor(d).length ? dayNutrients(d) : null; return nd && nd.kcal ? nd.tot[trendKey] : null; });
    const tgs = isos.map(function (d) { const t = nutTargets(d)[trendKey]; return t ? (t.max != null && t.min == null ? t.max : t.min) : null; });
    const got = vals.filter(function (v) { return v != null; }), avg = got.length ? got.reduce(function (a, v) { return a + v; }, 0) / got.length : null;
    const tNow = tgs[tgs.length - 1], max = Math.max.apply(null, got.concat(tgs.filter(function (x) { return x != null; })).concat([1])) * 1.12;
    const lim = (function () { const t = nutTargets()[trendKey]; return t && t.max != null && t.min == null; })();
    const W = 320, H = 120, bw = W / isos.length;
    const bars = vals.map(function (v, i) { if (v == null) return ''; const h = Math.max(2, v / max * H), ok = tgs[i] == null ? '' : lim ? (v > tgs[i] ? ' over' : ' met') : (v >= tgs[i] ? ' met' : v >= tgs[i] * 0.5 ? ' part' : ''); return '<rect class="tr-bar' + ok + '" x="' + (i * bw + bw * 0.18).toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + Math.min(3, bw * 0.3).toFixed(1) + '"/>'; }).join('');
    let line = ''; tgs.forEach(function (t, i) { if (t == null) return; const y = (H - t / max * H).toFixed(1); line += (line ? ' L' : 'M') + (i * bw).toFixed(1) + ' ' + y + ' L' + ((i + 1) * bw).toFixed(1) + ' ' + y; });
    const opts = NUTS.filter(function (x) { return x[0] !== 'kcal'; }).map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === trendKey ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('');
    box.innerHTML = '<div class="card-head"><h2 class="card-title">Trends</h2><span class="label faint">' + (state.ui.range ? 'Last ' + trendDays + ' days' : 'Last 6 months') + '</span></div>' +
      '<label class="tr-pick"><span>' + esc(trendKey === 'kcal' ? 'Calories' : n.label) + '</span><select id="trKey" aria-label="Nutrient"><option value="kcal"' + (trendKey === 'kcal' ? ' selected' : '') + '>Calories</option>' + opts + '</select>' + CHEV + '</label>' +
      '<div class="tr-sum"><div><b class="num">' + (avg == null ? '–' : fmtNut(avg, n.unit)) + '</b><span>average</span></div><div><b class="num">' + (tNow == null ? '–' : fmtNut(tNow, n.unit)) + '</b><span>' + (lim ? 'limit' : 'target') + '</span></div><div><b class="num">' + got.length + '</b><span>days logged</span></div></div>' +
      '<svg class="tr-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(n.label) + ' per day">' + bars + (line ? '<path class="tr-line" d="' + line + '"/>' : '') + '</svg>' +
      '<div class="tr-axis"><span>' + esc(fmtDate(isos[0], { month: 'short', day: 'numeric' })) + '</span><span>Today</span></div>';
    $('#trKey', box).addEventListener('change', function () { trendKey = this.value; buzz('light'); renderTrend(); });
    // The range buttons only change the trends, so they live in this card.
    const rs = $('#rangeSeg'); if (rs && state.ui.prog === 'nutrition') { const pk = $('.tr-pick', box); pk.parentNode.insertBefore(rs, pk.nextSibling); }
  }
  // When you eat: first and last food each day (from entry times), the window between, and the overnight gap.
  function windowCard() {
    const today = dayNum(todayISO()), rows = [];
    const mins = function (t) { const m = /^(\d\d):(\d\d)$/.exec(t); return m ? +m[1] * 60 + +m[2] : null; };
    for (let d = today - 13; d <= today; d++) {
      const iso = isoFromDay(d), ts = eatenFor(iso).map(function (it) { return it.t ? mins(it.t) : null; }).filter(function (x) { return x != null; }).sort(function (a, b) { return a - b; });
      rows.push({ d: d, iso: iso, first: ts.length >= 2 ? ts[0] : null, last: ts.length >= 2 ? ts[ts.length - 1] : null });
    }
    const got = rows.filter(function (r) { return r.first != null && r.d < today; });
    const hm = function (m) { const d = new Date(); d.setHours(Math.floor(m / 60), Math.round(m % 60), 0, 0); return fmtClock(d.getTime()); };
    if (got.length < 2) return '<div class="card"><div class="card-head"><h2 class="card-title">Eating window</h2></div><p class="muted-note">Food you log gets a time. After a few days, you\'ll see when you usually start and stop eating.</p></div>';
    const avg = function (k) { return got.reduce(function (a, r) { return a + r[k]; }, 0) / got.length; };
    const gaps = []; rows.forEach(function (r, i) { const nx = rows[i + 1]; if (r.last != null && nx && nx.first != null) gaps.push(24 * 60 - r.last + nx.first); });
    const win = avg('last') - avg('first'), gap = gaps.length ? gaps.reduce(function (a, x) { return a + x; }, 0) / gaps.length : null;
    // The last week is drawn; the averages above use two weeks.
    const bars = rows.slice(-7).map(function (r) { return '<div class="ew-row"><span>' + dtf({ weekday: 'narrow' }).format(parseISO(r.iso)) + '</span><div class="ew-track">' + (r.first != null ? '<i style="left:' + (r.first / 14.4).toFixed(1) + '%;width:' + Math.max(1.5, (r.last - r.first) / 14.4).toFixed(1) + '%"></i>' : '') + '</div></div>'; }).join('');
    const cell = function (v, l) { return '<div><b class="num">' + v + '</b><span>' + l + '</span></div>'; };
    return '<div class="card"><div class="card-head"><h2 class="card-title">Eating window</h2><span class="label faint">Last 2 weeks</span></div>' +
      '<div class="tr-sum">' + cell(hm(avg('first')), 'first food') + cell(hm(avg('last')), 'last food') + cell((Math.round(win / 6) / 10) + ' h', 'window') + '</div>' +
      '<div class="ew-chart">' + bars + '<div class="ew-axis"><span>12 AM</span><span>6</span><span>12 PM</span><span>6</span><span>12 AM</span></div></div>' +
      (gap != null ? '<p class="muted-note" style="margin:10px 0 0">Overnight you go about ' + (Math.round(gap / 6) / 10) + ' h without food' + (state.settings.fasting ? ', your fasting goal is ' + state.fast.goal + ' h' : '') + '.</p>' : '') + '</div>';
  }
  // Your week in review: from your week's first day (Friday unless you changed it).
  function weekReview(start) { return onePass(function () { return weekReviewNow(start); }); }
  function weekReviewNow(start) {
    const days = [], today = dayNum(todayISO());
    for (let d = start; d < start + 7 && d <= today; d++) { const iso = isoFromDay(d), t = dayTotals(iso), pl = dayPlan(iso); if (t.kcal > 0) days.push({ iso: iso, t: t, tg: pl ? roundKcal(pl.target) : null, p: pl ? pl.protein : null, train: pl && pl.train }); }
    if (!days.length) return null;
    const avg = function (k) { return Math.round(days.reduce(function (a, x) { return a + x.t[k]; }, 0) / days.length); };
    const withT = days.filter(function (x) { return x.tg; }), best = withT.slice().sort(function (a, b) { return Math.abs(a.t.kcal - a.tg) - Math.abs(b.t.kcal - b.tg); })[0];
    const w = weekStats(start), wp = weekStats(start - 7);
    return { start: start, n: days.length, kcal: avg('kcal'), protein: avg('protein'), tg: withT.length ? Math.round(withT.reduce(function (a, x) { return a + x.tg; }, 0) / withT.length) : null, pg: withT.length ? Math.round(withT.reduce(function (a, x) { return a + (x.p || 0); }, 0) / withT.length) : null, best: best, onTarget: withT.filter(function (x) { return Math.abs(x.t.kcal - x.tg) <= x.tg * 0.1; }).length, train: days.filter(function (x) { return x.train; }).length, dw: w && wp ? w.avg - wp.avg : null };
  }
  function weekReviewCard() {
    const ws = weekStart(dayNum(todayISO())), r = weekReview(ws - 7);
    if (!r) return '';
    const cell = function (v, l) { return '<div><b class="num">' + v + '</b><span>' + l + '</span></div>'; };
    return '<button type="button" class="card wr-card" data-action="week-review"><div class="card-head"><h2 class="card-title">Last week</h2><span class="label faint">' + esc(fmtDate(isoFromDay(r.start), { month: 'short', day: 'numeric' })) + ' – ' + esc(fmtDate(isoFromDay(r.start + 6), { month: 'short', day: 'numeric' })) + '</span></div>' +
      '<div class="tr-sum">' + cell(fmtKcal(r.kcal), 'avg kcal' + (r.tg ? ' / ' + fmtKcal(r.tg) : '')) + cell(r.protein + ' g', 'avg protein') + cell(r.onTarget + '/' + r.n, 'days on target') + '</div></button>';
  }
  function weekReviewSheet(start) {
    const r = weekReview(start); if (!r) return;
    const line = function (t, v) { return '<div class="row"><div class="grow row-t">' + t + '</div><span class="row-v">' + v + '</span></div>'; };
    openSheet('<div class="sheet-head"><div><div class="label faint">' + esc(fmtDate(isoFromDay(r.start), { month: 'short', day: 'numeric' })) + ' – ' + esc(fmtDate(isoFromDay(r.start + 6), { month: 'short', day: 'numeric' })) + '</div><h2 class="sheet-title" id="sheetTitle">Your week</h2></div></div>' +
      '<div class="list">' + line('Days logged', r.n + ' of 7') + line('Average calories', fmtKcal(r.kcal) + (r.tg ? ' <small class="faint">/ ' + fmtKcal(r.tg) + '</small>' : '')) + line('Average protein', r.protein + ' g' + (r.pg ? ' <small class="faint">/ ' + r.pg + ' g</small>' : '')) +
        line('Days on target', r.onTarget + ' <small class="faint">(within 10%)</small>') + (r.best ? line('Closest to target', esc(fmtDate(r.best.iso, { weekday: 'long' }))) : '') + (trainOn() ? line('Training days', r.train) : '') +
        (r.dw != null ? line('Weight (weekly average)', (r.dw > 0 ? '+' : '') + fmtW(r.dw) + ' ' + unit()) : '') + '</div>');
  }
  // Not signed in? Once a month, a gentle nudge to save a backup (your data only lives on this phone).
  function backupBanner() {
    if (state.sync.uid || viewDay !== todayISO()) return '';
    const days = Object.keys(state.food).length + state.entries.length; if (days < 7) return '';
    const now = Date.now(), first = Math.min.apply(null, Object.keys(state.food).concat(state.entries.map(function (e) { return e.date; })).map(function (d) { return parseISO(d).getTime(); }));
    if (now - (state.ui.backupAt || first) < 30 * 864e5 || (state.ui.backupLater && now < state.ui.backupLater)) return '';
    return '<div class="card bk-banner strip"><span class="strip-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 8.5a4 4 0 0 1-.5 9.5H7z"/><path d="M12 15V10M9.5 12.5 12 10l2.5 2.5"/></svg></span><b class="grow">Not backed up yet</b><button type="button" class="btn sm tint" data-action="export-json">Back up</button><button type="button" class="icon-btn strip-x" data-bk-later aria-label="Later">' + XIC + '</button></div>';
  }
  // Low on something for most of the last 5 days? Point to foods you already eat that have a lot of it.
  const GAP_KEYS = ['fib', 'fe', 'vD', 'ca', 'k', 'mg', 'b12', 'fol', 'vC', 'zn'];
  let gapCache = { sig: '', html: '' };
  let warmT = null;
  function gapBanner() {
    const today = dayNum(todayISO());
    if (viewDay !== todayISO() || !foodDB) return '';
    const sig = today + ':' + Object.keys(state.food).length + ':' + JSON.stringify(state.food[isoFromDay(today - 1)] || []).length + ':' + state.ui.gapHide;
    if (gapCache.sig === sig) return gapCache.html;
    let html = '';
    const days = []; for (let i = 1; i <= 5; i++) { const nd = dayNutrients(isoFromDay(today - i)); if (nd.items && nd.kcal > 600) days.push(nd); }
    if (days.length >= 3) {
      const tg = nutTargets(); let worst = null;
      GAP_KEYS.forEach(function (k) {
        if (!tg[k] || !tg[k].min || !NUT[k]) return;
        const ok = days.filter(function (nd) { return nd.cov[k] > 0.7; }); if (ok.length < 3) return;
        const avg = ok.reduce(function (a, nd) { return a + nd.tot[k]; }, 0) / ok.length, r = avg / tg[k].min;
        const low = ok.filter(function (nd) { return nd.tot[k] < tg[k].min * 0.6; }).length;
        if (r < 0.6 && low >= 3 && (!worst || r < worst.r)) worst = { k: k, r: r, avg: avg, min: tg[k].min };
      });
      const wk = worst && worst.k + ':' + weekStart(today);
      if (worst && state.ui.gapHide !== wk) {
        // Foods you've eaten in the last 4 months, by how much of it one usual portion gives.
        const use = foodUse().use, picks = [];
        Object.keys(use).forEach(function (id) {
          const f = getFood(id); if (!f || f.recipe) return;
          const v100 = per100(f, worst.k); if (!v100) return;
          const lp = lastPortion(id), u = lp && unitsFor(f).find(function (x) { return x.label === lp.unit; }), s0 = defaultServing(f);
          const g = u ? lp.qty * u.g : s0.qty * s0.unit.g, v = v100 * g / 100;
          if (v >= worst.min * 0.1) picks.push({ f: f, v: v });
        });
        picks.sort(function (a, b) { return b.v - a.v; });
        const n = NUT[worst.k];
        html = '<div class="card gap-card"><div class="gap-top"><span class="ico ico-s">' + LEAF_IC + '</span><div class="grow"><b>Low on ' + esc(n.label.toLowerCase()) + ' lately</b><span>' + (worst.avg < 0.5 ? 'Almost none' : 'About ' + fmtNut(worst.avg, n.unit)) + ' a day, target ' + fmtNut(worst.min, n.unit) + '</span></div><button type="button" class="icon-btn wr-x" data-gap-hide="' + wk + '" aria-label="Hide">' + XIC + '</button></div>' +
          (picks.length ? '<div class="gap-chips">' + picks.slice(0, 4).map(function (x) { return '<button type="button" data-gap-f="' + x.f.id + '">' + esc(x.f.name.split(',')[0].split(' · ')[0].slice(0, 22)) + ' <small>' + fmtNut(x.v, n.unit) + '</small></button>'; }).join('') + '</div>'
            : '<button type="button" class="text-btn gap-more" data-gap-high="' + worst.k + '">See foods high in ' + esc(n.label.toLowerCase()) + '</button>') + '</div>';
      }
    }
    gapCache = { sig: sig, html: html };
    return html;
  }
  // New here: a short checklist that disappears once it's done (or hidden).
  function startBanner() {
    if (viewDay !== todayISO() || state.ui.gsHide || Object.keys(state.food).length > 3) return '';
    const steps = [
      [!!dayPlan(todayISO()), 'Set your calorie target', 'targets'],
      [Object.keys(state.food).some(function (k) { return state.food[k].length; }), 'Log your first food', 'food'],
      [Object.keys(state.water || {}).length > 0, 'Add a glass of water', 'water'],
      [state.entries.length > 0, 'Log your weight', 'weight']
    ];
    const left = steps.filter(function (x) { return !x[0]; }).length;
    if (!left) return '';
    return '<div class="card gs-card"><div class="gs-head"><b>Getting started</b><span class="label faint">' + (steps.length - left) + ' of ' + steps.length + ' done</span><button type="button" class="icon-btn wr-x" data-gs-hide aria-label="Hide">' + XIC + '</button></div>' +
      steps.map(function (x) { return '<button type="button" class="gs-step' + (x[0] ? ' done' : '') + '" data-gs="' + x[2] + '"' + (x[0] ? ' disabled' : '') + '><i></i><span>' + x[1] + '</span>' + (x[0] ? '' : CHEV) + '</button>'; }).join('') + '</div>';
  }
  function weekCardHtml() {
    const today = dayNum(todayISO()), ws = weekStart(today), cur = weekStats(ws), prev = weekStats(ws - 7);
    let dots = '';
    for (let d = ws; d < ws + 7; d++) {
      const iso = isoFromDay(d), on = !!findEntry(iso);
      dots += '<div' + (d === today ? ' class="is-today"' : '') + '><i class="' + (on ? 'on' : d > today ? 'future' : '') + (d === today ? ' today' : '') + '"></i>' + dtf({ weekday: 'narrow' }).format(parseISO(iso)) + '</div>';
    }
    let streak = 0, sd = today - (findEntry(todayISO()) ? 0 : 1);
    const logged = {}; state.entries.forEach(function (e) { logged[e.date] = 1; });
    while (logged[isoFromDay(sd)]) { streak++; sd--; }
    const right = streak >= 3 ? streak + '-day streak' : (cur ? cur.n : 0) + ' of ' + (today - ws + 1) + ' days';
    return '<span class="pt-k">This week</span>' +
      (cur ? '<span class="pt-v num">' + fmtW(cur.avg) + '<small>' + unit() + '</small></span><span class="pt-s">' + (prev ? deltaChip(cur.avg - prev.avg, goodWhenDown()) : 'Average') + '</span>'
        : '<span class="pt-v pt-none">–</span><span class="pt-s">' + (prev ? 'Last week ' + fmtW(prev.avg) + ' ' + unit() : 'No weigh-ins yet') + '</span>') +
      '<div class="week pt-week">' + dots + '</div>';
  }

  let scrubHide = null, showAllEntries = false;
  function rangeList() {
    const all = withTrend(), r = state.ui.range;
    if (!r || !all.length) return all;
    const end = dayNum(todayISO());
    return all.filter(function (p) { return p.day > end - r; });
  }
  function niceStep(span, target) {
    const raw = span / target, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  }
  function defaultReadout(pts) {
    const el = $('#readout');
    if (!pts.length) { el.innerHTML = ''; return; }
    const last = pts[pts.length - 1];
    el.innerHTML = '<span class="r-v num">' + fmtW(last.trend) + U() + '</span><span class="r-s">' + (pts.length > 1 ? deltaChip(last.trend - pts[0].trend, goodWhenDown()) : '') + '<span>' + esc(fmtDate(pts[0].date)) + (pts.length > 1 ? ' – ' + esc(fmtDate(last.date)) : '') + '</span></span>';
  }
  // The chart's width only changes with the screen (or text size), so it isn't measured on every draw:
  // measuring right after the page appears would make the browser lay out the whole page an extra time.
  let chartW = { k: '', w: 0 };
  function chartWidth(el) {
    const k = innerWidth + '|' + document.documentElement.style.zoom;
    if (chartW.k !== k || !chartW.w) { const w = el.clientWidth; chartW = { k: k, w: w }; }
    return chartW.w;
  }
  function renderChart() {
    const el = $('#chart');
    if ($('#panel-progress').hidden) return;
    $$('#rangeSeg button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.range === state.ui.range); });
    if ($('#ckToggle')) $('#ckToggle').setAttribute('aria-pressed', !!state.ui.chartKcal);
    const pts = rangeList(), goal = state.settings.goalKg;
    if (pts.length < 2) {
      el.innerHTML = '<div class="chart-empty">' + (entries().length < 2 ? 'Log two days to see your trend' : 'Nothing in this range yet') + '</div>';
      defaultReadout(pts);
      return;
    }
    const W = Math.max(280, chartWidth(el)), H = 220, padL = 8, padR = 40, padT = 12, padB = 24;
    const iw = W - padL - padR, ih = H - padT - padB;
    const d0 = pts[0].day, lastDay = Math.max(pts[pts.length - 1].day, d0 + 1);
    // Projection: carry the current trend forward towards the goal (up to ~a third of the chart's width).
    const tr = trend(), lastT = pts[pts.length - 1].trend, isLatest = pts[pts.length - 1].day === dayNum(entries()[entries().length - 1].date);
    let proj = null;
    if (goal && tr && isLatest && Math.abs(tr.perDay) > 0.001 && (goal - lastT) / tr.perDay > 0) {
      const toGoal = (goal - lastT) / tr.perDay, ext = Math.min(toGoal, Math.max(14, (lastDay - d0) * 0.35));
      proj = { day: lastDay + ext, kg: lastT + tr.perDay * ext, hits: toGoal <= ext, goalDay: lastDay + toGoal };
    }
    const d1 = proj ? Math.max(lastDay, proj.day) : lastDay;
    const vals = [];
    pts.forEach(function (p) { vals.push(toDisp(p.kg), toDisp(p.trend)); });
    if (proj) vals.push(toDisp(proj.kg));
    let mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    const minSpan = unit() === 'lb' ? 2 : 1, spread = Math.max(mx - mn, minSpan);
    let showGoal = false;
    if (goal) { const gd = toDisp(goal); if (gd >= mn - spread * 0.6 && gd <= mx + spread * 0.6) { showGoal = true; mn = Math.min(mn, gd); mx = Math.max(mx, gd); } }
    if (mx - mn < minSpan) { const m = (mx + mn) / 2; mn = m - minSpan / 2; mx = m + minSpan / 2; }
    const step = niceStep(mx - mn, 4);
    mn = Math.floor(mn / step) * step; mx = Math.ceil(mx / step) * step;
    const X = function (d) { return padL + (d - d0) / (d1 - d0) * iw; };
    const Y = function (v) { return padT + ih - (v - mn) / (mx - mn) * ih; };
    const dec = step < 1 ? (Math.round(step * 10) % 5 ? 2 : 1) : 0;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" height="' + H + '" role="img" aria-label="Weight chart">' +
      '<defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".18"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>';
    for (let v = mn; v <= mx + step / 2; v += step) {
      const y = Y(v).toFixed(1);
      s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="var(--chart-grid)"/>' +
        '<text x="' + (W - padR + 8) + '" y="' + (+y + 4) + '">' + v.toFixed(dec) + '</text>';
    }
    const span = d1 - d0, n = W < 380 ? 2 : 3;
    const lblOpts = span > 200 ? { month: 'short', year: '2-digit' } : { month: 'short', day: 'numeric' };
    for (let i = 0; i <= n; i++) {
      const d = Math.round(d0 + span * i / n);
      s += '<text x="' + X(d).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="' + (i === 0 ? 'start' : i === n ? 'end' : 'middle') + '">' + esc(fmtDate(isoFromDay(d), lblOpts)) + '</text>';
    }
    state.phases.forEach(function (p) {
      const pd = dayNum(p.date);
      if (pd < d0 || pd > d1) return;
      const x = X(pd).toFixed(1);
      s += '<line x1="' + x + '" x2="' + x + '" y1="' + padT + '" y2="' + (padT + ih) + '" stroke="var(--accent)" stroke-dasharray="2 4" opacity=".6"/>';
      if (p.label) s += '<text x="' + (+x + 5) + '" y="' + (padT + 9) + '" style="fill:var(--accent-text);font-weight:700;font-size:10px">' + esc(p.label) + '</text>';
    });
    if (showGoal) { const gy = Y(toDisp(goal)).toFixed(1); s += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + gy + '" y2="' + gy + '" stroke="var(--text-3)" stroke-dasharray="4 5" stroke-width="1.2"/><text x="' + (padL + 2) + '" y="' + (gy - 5) + '" style="font-size:10px;font-weight:700">Goal</text>'; }
    cycleWindows().forEach(function (w) {
      const a = Math.max(d0, w.a), b2 = Math.min(d1, w.b + 1); if (b2 <= a) return;
      s += '<rect class="cy-band' + (w.guess ? ' guess' : '') + '" x="' + X(a).toFixed(1) + '" y="' + padT + '" width="' + (X(b2) - X(a)).toFixed(1) + '" height="' + ih + '"/>';
    });
    if (state.ui.chartKcal) {
      // Daily calories as soft bars along the bottom (scaled to the busiest day in view).
      let mxK = 0; const ks = [];
      for (let dd = Math.ceil(d0); dd <= lastDay; dd++) { const k = dayTotals(isoFromDay(dd)).kcal; if (k > 0) { ks.push([dd, k]); if (k > mxK) mxK = k; } }
      const bw = Math.max(1.5, Math.min(8, iw / Math.max(1, d1 - d0) * 0.7));
      ks.forEach(function (x) { const h = x[1] / mxK * ih * 0.38; s += '<rect class="ck-bar" x="' + (X(x[0]) - bw / 2).toFixed(1) + '" y="' + (padT + ih - h).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + Math.min(2, bw / 2).toFixed(1) + '"/>'; });
    }
    const line = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p.day).toFixed(1) + ',' + Y(toDisp(p.trend)).toFixed(1); }).join('');
    s += '<path d="' + line + 'L' + X(pts[pts.length - 1].day).toFixed(1) + ',' + (padT + ih) + 'L' + X(d0).toFixed(1) + ',' + (padT + ih) + 'Z" fill="url(#cg)"/>';
    const r = pts.length > 120 ? 1.6 : pts.length > 60 ? 2.2 : 3;
    pts.forEach(function (p) { s += '<circle cx="' + X(p.day).toFixed(1) + '" cy="' + Y(toDisp(p.kg)).toFixed(1) + '" r="' + r + '" fill="var(--chart-raw)"/>'; });
    if (proj) {
      const px = X(proj.day).toFixed(1), py = Y(toDisp(proj.kg)).toFixed(1);
      s += '<path d="M' + X(lastDay).toFixed(1) + ',' + Y(toDisp(lastT)).toFixed(1) + 'L' + px + ',' + py + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round" opacity=".8"/>';
      if (proj.hits) s += '<circle cx="' + px + '" cy="' + py + '" r="4" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/><text x="' + (+px - 6) + '" y="' + (+py - 9) + '" text-anchor="end" style="fill:var(--accent-text);font-weight:700;font-size:10px">' + esc(fmtDate(isoFromDay(Math.round(proj.goalDay)))) + '</text>';
    }
    s += '<path d="' + line + '" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<g id="scrub" style="display:none"><line id="scrubLine" y1="' + padT + '" y2="' + (padT + ih) + '" stroke="var(--text-3)"/><circle id="scrubRaw" r="4.5" fill="var(--surface)" stroke="var(--text-2)" stroke-width="2"/><circle id="scrubAvg" r="5.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5"/></g>' +
      '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="transparent"/></svg>';
    el.innerHTML = s;
    defaultReadout(pts);

    const svg = el.querySelector('svg');
    let lastIdx = -1;
    // Two fingers: spread to zoom in (a shorter range), pinch to zoom out.
    let pinch0 = 0;
    svg.addEventListener('touchstart', function (ev) { if (ev.touches.length === 2) pinch0 = Math.abs(ev.touches[0].clientX - ev.touches[1].clientX); }, { passive: true });
    svg.addEventListener('touchmove', function (ev) {
      if (ev.touches.length !== 2 || !pinch0) return;
      const dx = Math.abs(ev.touches[0].clientX - ev.touches[1].clientX), r = dx / pinch0;
      if (r > 0.75 && r < 1.35) return;
      const rs = [30, 90, 180, 365, 0], cur = rs.indexOf(state.ui.range), ord = function (v) { return v === 0 ? 99999 : v; };
      const sorted = rs.slice().sort(function (a, b) { return ord(a) - ord(b); }), i = sorted.indexOf(rs[cur < 0 ? 1 : cur]);
      const ni = r > 1 ? Math.max(0, i - 1) : Math.min(sorted.length - 1, i + 1);
      pinch0 = 0;
      if (sorted[ni] !== state.ui.range) { state.ui.range = sorted[ni]; save(); buzz('light'); renderChart(); renderProgress(); }
    }, { passive: true });
    function at(ev) {
      const rect = svg.getBoundingClientRect();
      const day = d0 + ((ev.clientX - rect.left) * (W / rect.width) - padL) / iw * (d1 - d0);
      let best = 0;
      for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i].day - day) < Math.abs(pts[best].day - day)) best = i;
      const p = pts[best], cx = X(p.day).toFixed(1);
      clearTimeout(scrubHide);
      $('#scrub', svg).style.display = '';
      $('#scrubLine', svg).setAttribute('x1', cx); $('#scrubLine', svg).setAttribute('x2', cx);
      $('#scrubRaw', svg).setAttribute('cx', cx); $('#scrubRaw', svg).setAttribute('cy', Y(toDisp(p.kg)).toFixed(1));
      $('#scrubAvg', svg).setAttribute('cx', cx); $('#scrubAvg', svg).setAttribute('cy', Y(toDisp(p.trend)).toFixed(1));
      if (best !== lastIdx) { if (lastIdx !== -1) buzz('light'); lastIdx = best; }
      const dk = dayTotals(p.date).kcal, cw = inCycleWindow(p.day);
      $('#readout').innerHTML = '<span class="r-v num">' + fmtW(p.kg) + U() + '</span><span class="r-s">' + esc(fmtDate(p.date, { weekday: 'short', month: 'short', day: 'numeric' })) + '<br>trend ' + fmtW(p.trend) + (dk ? ' · ' + fmtKcal(dk) + ' kcal' : '') + (cw ? ' · period week, water is common' : '') + '</span>';
    }
    function end(delay) {
      clearTimeout(scrubHide);
      scrubHide = setTimeout(function () { const g = $('#scrub', svg); if (g) g.style.display = 'none'; lastIdx = -1; defaultReadout(pts); }, delay);
    }
    svg.addEventListener('pointerdown', at);
    svg.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons) at(e); });
    svg.addEventListener('pointerup', function (e) { end(e.pointerType === 'mouse' ? 3000 : 1500); });
    svg.addEventListener('pointerleave', function () { end(250); });
    svg.addEventListener('pointercancel', function () { end(250); });
  }

  function renderProgress() {
    const pts = rangeList(), box = $('#rangeStats');
    if (pts.length < 2) box.hidden = true;
    else {
      box.hidden = false;
      const reg = linreg(pts.map(function (p) { return { x: p.day, y: p.kg }; }));
      let lo = pts[0], hi = pts[0];
      pts.forEach(function (p) { if (p.kg < lo.kg) lo = p; if (p.kg > hi.kg) hi = p; });
      const cell = function (v, l) { return '<div class="metric"><span class="m-v num">' + v + '</span><span class="m-l">' + l + '</span></div>'; };
      box.innerHTML = cell(String(pts.length), 'Weigh-ins') + cell(reg ? signed(toDisp(reg.slope * 7), 2) : '—', 'Per week') + cell(fmtW(lo.kg), 'Lowest') + cell(fmtW(hi.kg), 'Highest');
    }

    // Phases
    renderInsights();
    const pl = $('#phaseBox'), all = entries();
    $('#phaseFold').hidden = !state.phases.length; $('#phaseStart').hidden = state.phases.length || all.length < 2;
    $('#phaseSub').textContent = state.phases.length ? (state.phases[state.phases.length - 1].label || 'Phase') + ' · now' : 'Mark a cut, bulk or diet break';
    if (!state.phases.length) pl.innerHTML = '<button type="button" class="btn soft block" data-action="new-phase">Start a phase</button>';
    else {
      let html = '<div class="list flat">';
      state.phases.slice().reverse().forEach(function (p, idx, arr) {
        const next = idx > 0 ? arr[idx - 1] : null;
        const inPhase = all.filter(function (e) { return e.date >= p.date && (!next || e.date < next.date); });
        const change = inPhase.length >= 2 ? fmtDelta(inPhase[inPhase.length - 1].kg - inPhase[0].kg) + ' ' + unit() : '';
        html += '<div class="row"><div class="grow"><div class="row-t">' + esc(p.label || 'Phase') + (idx === 0 ? ' <span class="pill" style="margin-left:6px;height:22px">Now</span>' : '') + '</div><div class="row-s">Since ' + esc(fmtDate(p.date, { month: 'short', day: 'numeric', year: 'numeric' })) + '</div></div>' +
          (change ? '<span class="row-v num">' + change + '</span>' : '') +
          '<button type="button" class="icon-btn" data-del-phase="' + p.date + '" aria-label="Remove phase"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button></div>';
      });
      pl.innerHTML = html + '</div><button type="button" class="btn soft block" data-action="new-phase" style="margin-top:10px">New phase</button>';
    }
    $('#histSub').textContent = all.length ? all.length + (all.length === 1 ? ' weigh-in' : ' weigh-ins') : '';
    ['phases', 'history'].forEach(function (k) { const el = $('[data-fold="' + k + '"]'), open = state.ui.folded.indexOf(k) < 0; el.setAttribute('aria-expanded', open); el.nextElementSibling.hidden = !open; });

    // Weigh-ins
    const box2 = $('#entryList'), view = state.ui.view;
    $$('#viewSeg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === view); });
    if (!all.length) { box2.innerHTML = '<p class="muted-note">No weigh-ins yet.</p>'; return; }
    if (view === 'weeks') {
      const first = weekStart(dayNum(all[0].date)), weeks = [];
      for (let st = weekStart(dayNum(all[all.length - 1].date)); st >= first; st -= 7) { const w = weekStats(st); if (w) weeks.push(w); }
      const gwd = goodWhenDown(), shownW = showAllEntries ? weeks : weeks.slice(0, 8);
      box2.innerHTML = '<div class="list">' + shownW.map(function (w) {
        const pv = weekStats(w.start - 7), d = pv ? w.avg - pv.avg : null;
        const good = d != null && gwd != null && Math.abs(toDisp(d)) >= 0.05 && (d < 0) === gwd;
        return '<button type="button" class="row" data-action="week-at" data-start="' + w.start + '"><div class="grow"><div class="row-t">' + esc(weekRange(w.start)) + '</div><div class="row-s">' + w.n + ' day' + (w.n === 1 ? '' : 's') + (w.kcal ? ' · ' + fmtKcal(roundKcal(w.kcal)) + ' kcal' : '') + '</div></div>' +
          '<span class="row-w num">' + fmtW(w.avg) + '</span><span class="delta' + (good ? ' good' : '') + '">' + (d != null ? fmtDelta(d) : '') + '</span></button>';
      }).join('') + (weeks.length > shownW.length ? '<button type="button" class="row more-row" data-action="show-all">Show all ' + weeks.length + ' weeks</button>' : '') + '</div>';
      return;
    }
    const rev = all.slice().reverse(), goal = state.settings.goalKg;
    const row = function (e, i) {
      const prev = rev[i + 1];
      let delta = '<span class="delta"></span>';
      if (prev) {
        const dk = e.kg - prev.kg;
        const toward = goal && Math.abs(toDisp(dk)) >= 0.05 && Math.abs(e.kg - goal) < Math.abs(prev.kg - goal);
        delta = '<span class="delta' + (toward ? ' good' : '') + '">' + fmtDelta(dk) + '</span>';
      }
      const sub = [];
      const dk = dayKcal(e.date); if (dk) sub.push(fmtKcal(dk) + ' kcal');
      if (e.note) sub.push(e.note);
      return '<button type="button" class="row" data-edit="' + e.date + '"><div class="grow"><div class="row-t">' + esc(relDate(e.date)) + '</div>' + (sub.length ? '<div class="row-s">' + esc(sub.join(' · ')) + '</div>' : '') + '</div>' +
        '<span class="row-w num">' + fmtW(e.kg) + '</span>' + delta + '</button>';
    };
    let html = '';
    if (!showAllEntries) {
      html = '<div class="list">' + rev.slice(0, 7).map(row).join('') + (rev.length > 7 ? '<button type="button" class="row more-row" data-action="show-all">Show all ' + rev.length + '</button>' : '') + '</div>';
    } else {
      let month = '';
      rev.forEach(function (e, i) {
        const m = e.date.slice(0, 7);
        if (m !== month) {
          if (month) html += '</div>';
          month = m;
          html += '<div class="group-label">' + esc(parseISO(m + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })) + '</div><div class="list">';
        }
        html += row(e, i);
      });
      html += '</div>';
    }
    box2.innerHTML = html;
  }

  function renderInsights() {
    const l = entries(), box = $('#insightBox'), out = [], map = trendMap(), today = dayNum(todayISO());
    const I_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
    const I_WAVE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12c2.5-4 5-4 7.5 0s5 4 7.5 0 2.5-2 3-2"/></svg>';
    const I_TREND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7c4 .4 5 9 10 9.6l6.5.4"/></svg>';
    // Change on the trend over the range picked at the top of Progress
    const rng = state.ui.range || (l.length ? today - dayNum(l[0].date) : 30), rLbl = ({ 30: 'Last 30 days', 90: 'Last 3 months', 180: 'Last 6 months', 365: 'Last year' })[state.ui.range] || 'Since you started';
    const past = l.filter(function (e) { return dayNum(e.date) <= today - rng; });
    if ((past.length || !state.ui.range) && l.length >= 5 && rng >= 7) {
      const ch = currentKg() - trendAt(Math.max(today - rng, dayNum(l[0].date)));
      if (Math.abs(toDisp(ch)) >= 0.1) out.push([I_TREND, rLbl + ': <b>' + (ch < 0 ? 'down ' : 'up ') + fmtW(Math.abs(ch)) + ' ' + unit() + '</b> on your trend.']);
    }
    // Weekday pattern (water weight)
    if (l.length >= 21 && dayNum(l[l.length - 1].date) - dayNum(l[0].date) >= 28) {
      const sum = [0, 0, 0, 0, 0, 0, 0], n = [0, 0, 0, 0, 0, 0, 0];
      l.forEach(function (e) { const wd = parseISO(e.date).getDay(); sum[wd] += e.kg - map[dayNum(e.date)]; n[wd]++; });
      let hi = -1, lo = -1;
      for (let i = 0; i < 7; i++) { if (n[i] < 3) continue; const m = sum[i] / n[i]; if (hi < 0 || m > sum[hi] / n[hi]) hi = i; if (lo < 0 || m < sum[lo] / n[lo]) lo = i; }
      if (hi >= 0 && lo >= 0 && hi !== lo) {
        const gap = toDisp(sum[hi] / n[hi] - sum[lo] / n[lo]);
        const name = function (i) { return new Date(2024, 0, 7 + i).toLocaleDateString(undefined, { weekday: 'long' }) + 's'; };
        if (gap >= (unit() === 'lb' ? 0.8 : 0.4)) out.push([I_WAVE, 'You\'re usually heaviest on <b>' + name(hi) + '</b> and lightest on <b>' + name(lo) + '</b> (' + gap.toFixed(1) + ' ' + unit() + ' apart). That\'s water, not fat.']);
      }
    }
    // Consistency
    if (l.length >= 7) {
      const span = Math.max(1, Math.min(rng, today - dayNum(l[0].date) + 1)), n30 = l.filter(function (e) { return dayNum(e.date) > today - span; }).length, r = n30 / span;
      out.push([I_CAL, 'You weighed in on <b>' + n30 + ' of the last ' + span + ' days</b>.' + (r >= 0.8 ? ' Great consistency.' : r < 0.5 ? ' Daily weigh-ins make the trend more accurate.' : '')]);
    }
    const more = '<button type="button" class="ins-more" data-action="insights"><span><b>What moves your weight</b><small>Patterns from your own log</small></span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>';
    box.innerHTML = '<div class="card insight-card"><div class="card-head"><h2 class="card-title">Insights</h2></div>' + out.slice(0, 2).map(function (x) { return '<div class="insight"><span class="ico">' + x[0] + '</span><div>' + x[1] + '</div></div>'; }).join('') + more + '</div>';
  }

  /* ================= Body: measurements + photos ================= */
  const MEAS = [['waist', 'Waist'], ['hips', 'Hips'], ['chest', 'Chest'], ['arm', 'Arm'], ['thigh', 'Thigh'], ['neck', 'Neck']];
  function lenUnit() { return unit() === 'lb' ? 'in' : 'cm'; }
  function toLen(cm) { return unit() === 'lb' ? cm / 2.54 : cm; }
  function fromLen(v) { return unit() === 'lb' ? v * 2.54 : v; }

  // A copy of everything once a day, kept on this phone for 7 days, so a bad import or sync can always be undone.
  function bkDb() { return new Promise(function (res, rej) { if (!window.indexedDB) return rej(new Error('no idb')); const r = indexedDB.open('setpoint-backups', 1); r.onupgradeneeded = function () { r.result.createObjectStore('snaps'); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function bkOp(mode, fn) { return bkDb().then(function (db) { return new Promise(function (res, rej) { const tx = db.transaction('snaps', mode), q = fn(tx.objectStore('snaps')); tx.oncomplete = function () { res(q && q.result); }; tx.onerror = function () { rej(tx.error); }; }); }); }
  function dailyBackup() {
    const day = todayISO();
    bkOp('readonly', function (st) { return st.getAllKeys(); }).then(function (keys) {
      keys = (keys || []).sort();
      if (keys.indexOf(day) >= 0 || !hasData(state)) return;
      flushSave();
      const snap = { at: Date.now(), data: JSON.stringify(state) };
      return bkOp('readwrite', function (st) { st.put(snap, day); keys.concat(day).sort().reverse().slice(7).forEach(function (k) { st.delete(k); }); });
    }).catch(function () {});
  }
  // Quiet milestones: only shown when you open them, never as pop-ups.
  function achievements() { return onePass(achievementsNow); }
  function achievementsNow() {
    const days = Object.keys(state.food).filter(function (k) { return state.food[k].some(function (it) { return !it.plan; }); }).sort();
    const has = {}; days.forEach(function (k) { has[dayNum(k)] = 1; });
    let best = 0, run = 0, prevMiss = false, used = {};
    if (days.length) for (let d = dayNum(days[0]); d <= dayNum(todayISO()); d++) {
      if (has[d]) { run++; prevMiss = false; if (run > best) best = run; }
      else { const w = weekStart(d); if (!prevMiss && !used[w] && run) { used[w] = 1; prevMiss = true; } else { run = 0; prevMiss = false; used = {}; } }
    }
    const nFoods = days.reduce(function (a, k) { return a + state.food[k].filter(function (it) { return !it.plan; }).length; }, 0);
    const inRow = function (test, back) { let r = 0, mx = 0; for (let i = back; i >= 1; i--) { const iso = isoFromDay(dayNum(todayISO()) - i); if (test(iso)) { r++; if (r > mx) mx = r; } else r = 0; } return mx; };
    // each day's food and plan, worked out once for both protein and calories (days with no food can't count)
    const hit = {}, dayHit = function (iso) { if (!hit[iso]) { const t = dayTotals(iso), pl = t.kcal > 0 ? dayPlan(iso) : null; hit[iso] = { p: !!pl && t.protein >= pl.protein, k: !!pl && t.kcal >= pl.target * 0.9 && t.kcal <= pl.target * 1.1 }; } return hit[iso]; };
    const protRow = inRow(function (iso) { return dayHit(iso).p; }, 180);
    const waterRow = inRow(function (iso) { return waterTotal(iso) >= waterGoal(); }, 180);
    const kcalRow = inRow(function (iso) { return dayHit(iso).k; }, 180);
    // How far from your first weigh-in to your goal you've come, on the trend.
    const goalPct = (function () { const g = state.settings.goalKg, l = state.entries, cur = currentKg(); if (!g || !l.length || cur == null) return null; const st = l[0].kg, span = st - g; return span ? (st - cur) / span * 100 : 100; })();
    let allMicros = false;
    if (foodDB) for (let i = 0; i < 120 && !allMicros; i++) { const iso = isoFromDay(dayNum(todayISO()) - i); if (!foodFor(iso).length || dayNeedsDB(iso)) continue; const nd = dayNutrients(iso); if (nd.items < 3) continue; const mm = microsMet(nd, nutTargets(iso)); if (mm && mm.of && mm.met >= mm.of) allMicros = true; }
    const es = state.entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    const avg = function (l) { return l.reduce(function (a, e) { return a + e.kg; }, 0) / l.length; };
    let change = 0; if (es.length >= 10) { const first = avg(es.slice(0, 5)); let lo = first, hi = first; for (let i = 5; i <= es.length; i++) { const v = avg(es.slice(i - 5, i)); lo = Math.min(lo, v); hi = Math.max(hi, v); } change = state.settings.goalKg && state.settings.goalKg > first ? hi - first : first - lo; }
    const gaining = state.settings.goalKg && es.length && state.settings.goalKg > es[0].kg;
    const kgs = function (k) { return unit() === 'lb' ? Math.round(k * 2.2046) + ' lb' : k + ' kg'; };
    return [
      { t: 'First food logged', got: nFoods > 0, p: '' },
      { t: '7-day streak', got: best >= 7, p: Math.min(best, 7) + '/7' }, { t: '30-day streak', got: best >= 30, p: Math.min(best, 30) + '/30' }, { t: '100-day streak', got: best >= 100, p: Math.min(best, 100) + '/100' },
      { t: '100 foods logged', got: nFoods >= 100, p: Math.min(nFoods, 100) + '/100' }, { t: '1,000 foods logged', got: nFoods >= 1000, p: Math.min(nFoods, 1000) + '/1000' },
      { t: 'Protein target 7 days in a row', got: protRow >= 7, p: Math.min(protRow, 7) + '/7' }, { t: 'Water goal 7 days in a row', got: waterRow >= 7, p: Math.min(waterRow, 7) + '/7' },
      { t: '30 weigh-ins', got: es.length >= 30, p: Math.min(es.length, 30) + '/30' },
      { t: (gaining ? 'First ' : 'First ') + kgs(1) + (gaining ? ' gained' : ' lost'), got: change >= 1, p: '' }, { t: kgs(5) + (gaining ? ' gained' : ' lost'), got: change >= 5, p: '' }, { t: kgs(10) + (gaining ? ' gained' : ' lost'), got: change >= 10, p: '' },
      { t: 'First recipe', got: state.recipes.length > 0, p: '' }, { t: 'First meal saved', got: state.meals.length > 0, p: '' },
      { t: 'First barcode scanned', got: state.offFoods.length > 0 || days.some(function (k) { return state.food[k].some(function (it) { return it.ref && /^(o|ub)/.test(it.ref); }); }), p: '' },
      { t: 'First progress photo', got: photos.length > 0, p: '' },
      { t: '5% of the way to your goal', got: goalPct >= 5, p: goalPct != null && goalPct < 5 ? Math.max(0, Math.round(goalPct)) + '%' : '' },
      { t: 'Halfway to your goal', got: goalPct >= 50, p: goalPct != null && goalPct < 50 ? Math.max(0, Math.round(goalPct)) + '%' : '' },
      { t: 'Goal reached', got: goalPct >= 100, p: goalPct != null && goalPct < 100 ? Math.max(0, Math.round(goalPct)) + '%' : '' },
      { t: 'Calories on target 7 days in a row', got: kcalRow >= 7, p: Math.min(kcalRow, 7) + '/7' },
      { t: 'Protein target 30 days in a row', got: protRow >= 30, p: Math.min(protRow, 30) + '/30' },
      { t: 'First refeed or diet break', got: Object.keys(state.dayMode || {}).some(function (k) { return k <= todayISO(); }), p: '' },
      { t: 'Every vitamin and mineral in one day', got: allMicros, p: '' }
    ];
  }
  // The top of You: who you are, your streak, target and weight, how far to your goal, and your latest achievements.
  function youSub() { return state.sync.uid ? syncStatus() : 'Sync across your devices'; }
  function renderYouHero() {
    const box = $('#youHero'); if (!box) return;
    const sy = state.sync, stk = foodStreak(), pl = dayPlan(todayISO()), cur = currentKg(), goal = state.settings.goalKg;
    const days = Object.keys(state.food).filter(function (k) { return state.food[k].some(function (it) { return !it.plan; }); }).length;
    let goalHtml = '';
    if (goal && cur != null && state.entries.length) {
      const start = state.entries[0].kg, span = start - goal, done = span ? Math.max(0, Math.min(1, (start - cur) / span)) : 1, left = Math.abs(cur - goal);
      goalHtml = '<div class="yh-goal"><div class="yh-gl"><span>' + (left < 0.15 ? 'Goal reached' : fmtW(left) + ' ' + unit() + ' to go') + '</span><span class="faint">' + fmtW(start) + ' → ' + fmtW(goal) + ' ' + unit() + '</span></div><div class="bar yh-bar"><i style="width:' + (done * 100).toFixed(1) + '%"></i></div></div>';
    }
    box.innerHTML = '<div class="card yh">' +
      '<div class="yh-top-w"><button type="button" class="yh-top" data-action="account"><span class="yh-av">' + (sy.uid ? esc((sy.email || '?').charAt(0).toUpperCase()) : USER_ICO) + '</span><span class="grow"><b>' + (sy.uid ? esc((sy.email || '').split('@')[0]) : 'Sign in') + '</b><span id="yhSub"' + (sy.uid ? '' : ' class="yh-cta"') + '>' + esc(youSub()) + '</span></span>' + (sy.uid ? '' : CHEV) + '</button>' +
      (sy.uid ? '<button type="button" class="icon-btn yh-sync" data-action="sync-now" aria-label="Sync now"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18.5 3v4.5H14M5.5 21v-4.5H10"/></svg></button>' : '') + '</div>' +
      '<div class="yh-stats"><div><b class="num">' + FLAME + stk + '</b><span>Day streak</span></div><div><b class="num">' + days + '</b><span>Days logged</span></div><div><b class="num">' + (cur != null ? fmtW(cur) : '–') + '<small>' + (cur != null ? unit() : '') + '</small></b><span>Weight trend</span></div></div>' +
      goalHtml + '</div>';
    showAchLine();
  }
  // The achievements line looks back over months, so it's worked out again once the page has slid in
  // (until then it shows what it said last time, which is almost always still right).
  let achLine = null, achT = 0;
  function achText() { const ach = achievements(), got = ach.filter(function (x) { return x.got; }); return got.length + ' of ' + ach.length + (got.length ? ' · ' + got[got.length - 1].t : ' · your first one is one food away'); }
  function putAchLine() { const s = $('#youAchSub'); if (s && s._en !== achLine) { s._en = achLine; s.textContent = achLine; } }
  function showAchLine() {
    if (!$('#youAchSub')) return;
    if (achLine == null) achLine = achText();
    putAchLine();
    clearTimeout(achT); achT = setTimeout(function () { achLine = achText(); putAchLine(); }, 650);
  }
  function achievementsSheet() {
    const list = achievements(), n = list.filter(function (x) { return x.got; }).length;
    openSheet('<div class="sheet-head"><div><div class="label faint">' + n + ' of ' + list.length + '</div><h2 class="sheet-title" id="sheetTitle">Achievements</h2></div></div>' +
      '<div class="ach-grid">' + list.map(function (x) { return '<div class="ach' + (x.got ? ' got' : '') + '"><span class="ach-ic">' + (x.got ? MEDAL_IC : LOCK_IC) + '</span><b>' + esc(x.t) + '</b>' + (!x.got && x.p ? '<small>' + x.p + '</small>' : '') + '</div>'; }).join('') + '</div>');
  }
  const PASTE_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3"/></svg>';
  const MEDAL_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 3h7l-2 6.5M10.5 9.5 8.5 3M12 12.2l.8 1.6 1.7.2-1.3 1.2.4 1.7-1.6-.9-1.6.9.4-1.7-1.3-1.2 1.7-.2z"/></svg>';
  const LOCK_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="10.5" width="13" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>';
  function backupsSheet() {
    const draw = function (root) {
      bkOp('readonly', function (st) { return st.getAll(); }).then(function (vals) {
        return bkOp('readonly', function (st) { return st.getAllKeys(); }).then(function (keys) { return keys.map(function (k, i) { return { day: k, v: vals[i] }; }); });
      }).then(function (list) {
        list.sort(function (a, b) { return a.day < b.day ? 1 : -1; });
        root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Restore a backup</h2></div>' +
          '<p class="muted-note" style="text-align:start;margin:0 2px 12px">Setpoint saves a copy of everything once a day and keeps the last 7, on this phone only.</p>' +
          (!list.length ? '<p class="muted-note fd-empty">No backups yet. The first one is made today.</p>' : '<div class="list">' + list.map(function (x, i) {
            let info = ''; try { const d = JSON.parse(x.v.data); info = Object.keys(d.food || {}).length + ' days of food · ' + (d.entries || []).length + ' weigh-ins'; } catch (e) {}
            return '<button type="button" class="row fd-row" data-bk="' + i + '"><div class="grow"><div class="row-t">' + esc(relDate(x.day)) + ' · ' + esc(fmtDate(x.day, { weekday: 'short', month: 'short', day: 'numeric' })) + '</div><div class="row-s">' + info + '</div></div>' + CHEV + '</button>';
          }).join('') + '</div>');
        $$('[data-bk]', root).forEach(function (b) { b.addEventListener('click', function () {
          const x = list[+b.dataset.bk];
          confirmSheet('Go back to ' + relDate(x.day).toLowerCase() + '?', 'Everything goes back to how it was then. Anything you added since will be removed (you can undo right after).', 'Restore', true, function () {
            const snap = snapshot(), sy = state.sync;
            try { state = migrate(JSON.parse(x.v.data)); } catch (e) { toast('That backup couldn\'t be read'); return; }
            state.sync = sy; save(); applyAppearance(); renderAll(); buzz('success'); toast('Backup restored', function () { restore(snap); });
          });
        }); });
      }, function () { root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Restore a backup</h2></div><p class="muted-note fd-empty">Backups aren\'t available in this browser.</p>'; });
    };
    openSheet('<div id="bkRoot"></div>', function (body) { draw($('#bkRoot', body)); });
  }
  // Photos of logged foods: on this phone only, keyed by the diary item's id.
  function picDb() { return new Promise(function (res, rej) { if (!window.indexedDB) return rej(new Error('no idb')); const r = indexedDB.open('setpoint-foodpics', 1); r.onupgradeneeded = function () { r.result.createObjectStore('pics'); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function picOp(mode, fn) { return picDb().then(function (db) { return new Promise(function (res, rej) { const tx = db.transaction('pics', mode), q = fn(tx.objectStore('pics')); tx.oncomplete = function () { res(q && q.result); }; tx.onerror = function () { rej(tx.error); }; }); }); }
  function picPut(id, blob) { return picOp('readwrite', function (st) { return st.put(blob, id); }); }
  function picGet(id) { return picOp('readonly', function (st) { return st.get(id); }); }
  function picDel(id) { return picOp('readwrite', function (st) { return st.delete(id); }).catch(function () {}); }
  function picView(id) {
    picGet(id).then(function (b) {
      if (!b) { toast('This photo isn\'t on this phone'); return; }
      const u = URL.createObjectURL(b), o = document.createElement('div');
      o.className = 'pic-view'; o.innerHTML = '<img alt="Food photo" src="' + u + '" />';
      o.addEventListener('click', function () { URL.revokeObjectURL(u); o.remove(); });
      document.body.appendChild(o);
    }, function () { toast('Couldn\'t open the photo'); });
  }
  // The note + photo block on a logged food's screen. Saves the photo straight away; the note is read on Save.
  function notePicHtml(it) {
    return '<div class="label faint fd-sec np-lbl">Note</div><div class="field"><input class="input" id="npNote" maxlength="140" placeholder="e.g. ate half, extra oil" autocomplete="off" value="' + esc(it.note || '') + '" /></div>' +
      '<div class="np-pic" id="npPic"></div><input type="file" id="npFile" accept="image/*" hidden />';
  }
  function bindNotePic(root, it) {
    const box = $('#npPic', root), file = $('#npFile', root);
    const draw = function () {
      if (!it.pic) { box.innerHTML = '<button type="button" class="text-btn np-add" id="npAdd">+ Add a photo</button>'; $('#npAdd', box).addEventListener('click', function () { file.click(); }); return; }
      box.innerHTML = '<button type="button" class="np-thumb" id="npOpen" aria-label="Open photo"></button><button type="button" class="text-btn" id="npRm">Remove photo</button>';
      picGet(it.id).then(function (b) { if (b && $('#npOpen', box)) $('#npOpen', box).style.backgroundImage = 'url(' + URL.createObjectURL(b) + ')'; }, function () {});
      $('#npOpen', box).addEventListener('click', function () { picView(it.id); });
      $('#npRm', box).addEventListener('click', function () { picDel(it.id); delete it.pic; save(); renderDiary(); buzz('light'); draw(); });
    };
    file.addEventListener('change', function () {
      const f = this.files && this.files[0]; this.value = ''; if (!f) return;
      shrink(f, 1200, 0.8).then(function (b) { return picPut(it.id, b); }).then(function () { it.pic = true; save(); renderDiary(); buzz('success'); draw(); }, function () { toast('Couldn\'t save the photo'); });
    });
    draw();
  }
  function readNote(root, it) { const v = $('#npNote', root) ? $('#npNote', root).value.trim().slice(0, 140) : null; if (v == null) return; if (v) it.note = v; else delete it.note; }
  // Photos live on this device, in IndexedDB. They're not synced, but the backup file includes them.
  let photos = [];
  function photoDb() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('no idb'));
      const r = indexedDB.open('setpoint-photos', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('photos', { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
  }
  function photoTx(mode, fn) {
    return photoDb().then(function (db) {
      return new Promise(function (res, rej) {
        const tx = db.transaction('photos', mode), store = tx.objectStore('photos'), out = fn(store);
        tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); }; tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function loadPhotos() {
    return photoTx('readonly', function (st) { return st.getAll(); }).then(function (list) {
      photos.forEach(function (ph) { URL.revokeObjectURL(ph.thumbUrl); });
      photos = (list || []).sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : b.added - a.added; })
        .map(function (r) { return { id: r.id, date: r.date, added: r.added, pose: r.pose || null, thumbUrl: URL.createObjectURL(r.thumb) }; });
      renderBody();
    }).catch(function () {});
  }
  function shrink(file, max, quality) {
    return new Promise(function (res, rej) {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('encode')); }, 'image/jpeg', quality);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('image')); };
      img.src = url;
    });
  }
  // ----- Progress photos -----
  // Each photo has a date (from the photo itself when it has one) and a pose, so like is compared with like.
  const POSES = [['front', 'Front'], ['side', 'Side'], ['back', 'Back']];
  function poseName(p) { const x = POSES.find(function (q) { return q[0] === p; }); return x ? x[1] : ''; }
  function phWeight(d) { const t = trendAt(dayNum(d)); return t == null ? '' : fmtW(t) + ' ' + unit(); }
  let phPose = 'front', phDate = null;
  // The date a photo was taken, from its EXIF data (JPEG). Null when there isn't one.
  function exifDate(file) {
    return file.slice(0, 256 * 1024).arrayBuffer().then(function (buf) {
      const v = new DataView(buf); if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return null;
      let o = 2;
      while (o + 4 < v.byteLength) {
        const m = v.getUint16(o), len = v.getUint16(o + 2);
        if (m === 0xFFE1 && v.getUint32(o + 4) === 0x45786966) {
          const t = o + 10, le = v.getUint16(t) === 0x4949, u16 = function (p) { return v.getUint16(p, le); }, u32 = function (p) { return v.getUint32(p, le); };
          const ifd = function (start, want) {
            const n = u16(start); const out = {};
            for (let i = 0; i < n; i++) { const e = start + 2 + i * 12; if (e + 12 > v.byteLength) break; const tag = u16(e); if (want.indexOf(tag) >= 0) out[tag] = e; }
            return out;
          };
          const str = function (e) { const cnt = u32(e + 4), off = cnt > 4 ? t + u32(e + 8) : e + 8; let s = ''; for (let i = 0; i < cnt - 1 && off + i < v.byteLength; i++) s += String.fromCharCode(v.getUint8(off + i)); return s; };
          const i0 = t + u32(t + 4), a = ifd(i0, [0x8769, 0x0132]);
          let s = '';
          if (a[0x8769]) { const ex = ifd(t + u32(a[0x8769] + 8), [0x9003, 0x9004]); if (ex[0x9003]) s = str(ex[0x9003]); else if (ex[0x9004]) s = str(ex[0x9004]); }
          if (!s && a[0x0132]) s = str(a[0x0132]);
          const mm = /^(\d{4}):(\d{2}):(\d{2})/.exec(s);
          if (!mm) return null;
          const iso = mm[1] + '-' + mm[2] + '-' + mm[3];
          return ISO_RE.test(iso) && iso <= todayISO() && iso > '2000-01-01' ? iso : null;
        }
        if ((m & 0xFF00) !== 0xFF00) break;
        o += 2 + len;
      }
      return null;
    }).catch(function () { return null; });
  }
  $('#photoFile').addEventListener('change', function () {
    const fs = Array.prototype.slice.call(this.files || []); this.value = '';
    if (fs.length) savePhotos(fs, phPose, phDate);
  });
  // Save one or more photos (camera or gallery). Dates come from the photos when they have them.
  function savePhotos(files, pose, fallback) {
    toast(files.length > 1 ? 'Saving ' + files.length + ' photos…' : 'Saving photo…');
    let fromPhoto = 0, saved = 0;
    const one = function (f, i) {
      return (f.type === 'image/jpeg' || /\.jpe?g$/i.test(f.name || '') ? exifDate(f) : Promise.resolve(null)).then(function (ed) {
        if (ed) fromPhoto++;
        return Promise.all([shrink(f, 1600, 0.85), shrink(f, 360, 0.75)]).then(function (b) {
          const rec = { id: Math.random().toString(36).slice(2, 10), date: ed || fallback || todayISO(), added: Date.now() + i, pose: pose || null, full: b[0], thumb: b[1] };
          return photoTx('readwrite', function (st) { st.put(rec); }).then(function () { saved++; });
        });
      }).catch(function () {});
    };
    return files.slice(0, 20).reduce(function (p, f, i) { return p.then(function () { return one(f, i); }); }, Promise.resolve()).then(function () {
      if (!saved) { toast('Couldn\'t save that photo'); buzz('warn'); return; }
      buzz('success');
      toast((saved === 1 ? 'Photo saved' : saved + ' photos saved') + (fromPhoto ? ' · dated from the photo' + (fromPhoto > 1 ? 's' : '') : ''));
      photoSyncSoon();
      return loadPhotos();
    });
  }
  // Add photos: pick the pose (and date), then take one with a guide or choose from the gallery.
  function addPhotoFlow() {
    let d = todayISO();
    const CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.5"/></svg>';
    const LIB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8.5"/></svg>';
    const cam = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Add progress photos</h2>' +
      '<label class="date-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg><span id="paDateLbl"></span><input type="date" id="paDate" aria-label="Date" /></label></div>' +
      '<div class="label faint pa-l">Pose</div><div class="seg w3" id="paPose">' + POSES.map(function (p) { return '<button type="button" data-v="' + p[0] + '" aria-pressed="' + (p[0] === phPose) + '">' + p[1] + '</button>'; }).join('') + '</div>' +
      '<div class="pa-btns">' +
        (cam ? '<button type="button" class="pa-big" id="paCam"><span class="pa-ic">' + CAM + '</span><span class="grow"><b>Take photo</b><span id="paCamS"></span></span></button>' : '') +
        '<button type="button" class="pa-big" id="paLib"><span class="pa-ic">' + LIB + '</span><span class="grow"><b>Choose from gallery</b><span>Pick one or several. Each keeps the date it was taken.</span></span></button>' +
      '</div>' +
      '<p class="muted-note pa-tip">Same spot, same light and the same time of day make changes easiest to see.</p>',
      function (root) {
        const di = $('#paDate', root);
        const fill = function () {
          di.value = d; di.max = todayISO(); $('#paDateLbl', root).textContent = relDate(d);
          const has = photos.some(function (x) { return x.pose === phPose; });
          if ($('#paCamS', root)) $('#paCamS', root).textContent = has ? 'Your last ' + poseName(phPose).toLowerCase() + ' photo is faded on top so you can line up.' : 'With a camera guide; next time your last photo helps you line up.';
          $$('#paPose button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === phPose); });
        };
        fill();
        di.addEventListener('change', function () { if (di.value && di.value <= todayISO()) d = di.value; fill(); });
        $$('#paPose button', root).forEach(function (b) { b.addEventListener('click', function () { phPose = b.dataset.v; buzz('light'); fill(); }); });
        if ($('#paCam', root)) $('#paCam', root).addEventListener('click', function () { guideCamera(phPose, d); });
        $('#paLib', root).addEventListener('click', function () { phDate = d === todayISO() ? null : d; closeSheet(); $('#photoFile').click(); });
      });
  }
  // Take a progress photo with your last one of that pose faded on top, so the pose and distance match.
  function guideCamera(pose, date) {
    let stream = null, facing = 'user', ghost = null, timer = 0;
    const stop = function () { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; clearInterval(timer); };
    const ref = photos.find(function (x) { return x.pose === pose; }) || null;
    openSheet('<div class="sheet-head"><div><div class="label faint">' + poseName(pose) + (date !== todayISO() ? ' · ' + esc(relDate(date)) : '') + '</div><h2 class="sheet-title" id="sheetTitle">Line it up</h2></div></div>' +
      '<div class="gc-box" id="gcBox"><video id="gcV" playsinline muted autoplay></video><img id="gcG" alt="" /><span class="gc-grid"></span><span class="gc-count" id="gcCount" hidden></span></div>' +
      (ref ? '<div class="gc-ctl"><span class="label faint">Guide</span><input type="range" id="gcOp" min="0" max="80" value="35" aria-label="Guide strength" /></div>' : '') +
      '<div class="btn-row gc-row"><button type="button" class="btn soft" id="gcFlip">Flip</button><button type="button" class="btn soft" id="gcTimer" aria-pressed="false">Timer off</button><button type="button" class="btn primary" id="gcShot">Take photo</button></div>',
      function (root) {
        sheet.classList.add('tall');
        const v = $('#gcV', root), g = $('#gcG', root);
        if (ref) photoTx('readonly', function (st) { return st.get(ref.id); }).then(function (r) { if (r) { ghost = URL.createObjectURL(r.full); g.src = ghost; } });
        else g.hidden = true;
        if ($('#gcOp', root)) $('#gcOp', root).addEventListener('input', function () { g.style.opacity = this.value / 100; });
        const start = function () {
          stop();
          navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1600 } }, audio: false }).then(function (st) { stream = st; v.srcObject = st; v.play().catch(function () {}); $('#gcBox', root).classList.toggle('mirror', facing === 'user'); }, function () { toast('Camera not available. Choose from the gallery instead.'); closeSheet(); });
        };
        start();
        let delay = 0;
        $('#gcFlip', root).addEventListener('click', function () { facing = facing === 'user' ? 'environment' : 'user'; buzz('light'); start(); });
        $('#gcTimer', root).addEventListener('click', function () { delay = delay === 0 ? 3 : delay === 3 ? 10 : 0; this.textContent = delay ? delay + 's timer' : 'Timer off'; this.setAttribute('aria-pressed', !!delay); buzz('light'); });
        const shoot = function () {
          if (!v.videoWidth) return;
          const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
          const ctx = c.getContext('2d'); if (facing === 'user') { ctx.translate(c.width, 0); ctx.scale(-1, 1); } ctx.drawImage(v, 0, 0);
          c.toBlob(function (b) { if (!b) return; stop(); closeSheet(); savePhotos([b], pose, date); }, 'image/jpeg', 0.9);
        };
        $('#gcShot', root).addEventListener('click', function () {
          if (!delay) { shoot(); return; }
          let n = delay; const cd = $('#gcCount', root); cd.hidden = false; cd.textContent = n; clearInterval(timer);
          timer = setInterval(function () { n--; if (n <= 0) { clearInterval(timer); cd.hidden = true; buzz('medium'); shoot(); } else { cd.textContent = n; buzz('light'); } }, 1000);
        });
      }, function () { stop(); sheet.classList.remove('tall'); if (ghost) URL.revokeObjectURL(ghost); });
  }
  // The photos part of the Body card.
  function photoBlock() {
    const add = '<button type="button" class="ph" data-action="add-photo"><span class="ph-add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg></span>Add</button>';
    const strip = '<div class="photo-strip">' + add + photos.slice(0, 14).map(function (ph) { return '<button type="button" class="ph" data-photo="' + ph.id + '"><span class="ph-im"><img src="' + ph.thumbUrl + '" alt="Progress photo ' + esc(ph.date) + '" />' + (ph.pose ? '<i>' + poseName(ph.pose) + '</i>' : '') + '</span>' + esc(fmtDate(ph.date)) + '</button>'; }).join('') + '</div>';
    const since = photos.length ? dayNum(todayISO()) - dayNum(photos[0].date) : null;
    return '<div class="card-head ph-head"><span class="label">Photos</span>' + (photos.length ? '<button type="button" class="text-btn" data-action="photo-all">See all ' + photos.length + ' ›</button>' : '') + '</div>' + strip +
      '<p class="ph-sync' + (phUser() ? ' on' : '') + '"><span id="phSyncL">' + phSyncText() + '</span>' + (phUser() ? '' : ' · sign in to keep them safe in your account') + '</p>' +
      (since != null && since >= 7 ? '<p class="ph-nudge">Last photo ' + since + ' days ago. <button type="button" class="text-btn" data-action="add-photo">Take one</button></p>' : '') +
      (photos.length >= 2 ? '<div class="ph-acts"><button type="button" class="btn sm tint" data-action="photo-compare">Compare</button><button type="button" class="btn sm tint" data-action="photo-play">Timelapse</button></div>' : '');
  }
  // All photos: by pose, grouped by month.
  function photoGallery() {
    let pf = 'all';
    const draw = function (root) {
      const poses = POSES.filter(function (p) { return photos.some(function (x) { return x.pose === p[0]; }); });
      const list = photos.filter(function (x) { return pf === 'all' || x.pose === pf; });
      let html = '<div class="sheet-head"><div><div class="label faint">' + photos.length + (photos.length === 1 ? ' photo' : ' photos') + ' · ' + phSyncText().toLowerCase() + '</div><h2 class="sheet-title" id="sheetTitle">Progress photos</h2></div><button type="button" class="text-btn" id="pgAdd" style="margin:0">+ Add</button></div>';
      if (poses.length) html += '<div class="mt-chips pg-chips"><button type="button" data-pf="all" aria-pressed="' + (pf === 'all') + '">All</button>' + poses.map(function (p) { return '<button type="button" data-pf="' + p[0] + '" aria-pressed="' + (pf === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>';
      let month = '';
      list.forEach(function (ph) {
        const m = fmtDate(ph.date, { month: 'long', year: 'numeric' });
        if (m !== month) { html += (month ? '</div>' : '') + '<div class="pg-month">' + esc(m) + '</div><div class="pg-grid">'; month = m; }
        const w = phWeight(ph.date);
        html += '<button type="button" class="pg-t" data-pv="' + ph.id + '"><img src="' + ph.thumbUrl + '" alt="" /><span><b>' + esc(fmtDate(ph.date, { month: 'short', day: 'numeric' })) + '</b>' + (w ? w : '') + '</span></button>';
      });
      if (month) html += '</div>';
      if (photos.length >= 2) html += '<div class="btn-row" style="margin-top:16px"><button type="button" class="btn soft" id="pgCmp">Compare</button><button type="button" class="btn soft" id="pgPlay">Timelapse</button></div>';
      root.innerHTML = html;
      $$('[data-pf]', root).forEach(function (b) { b.addEventListener('click', function () { pf = b.dataset.pf; buzz('light'); draw(root); }); });
      $$('[data-pv]', root).forEach(function (b) { b.addEventListener('click', function () { photoViewer(b.dataset.pv, list.map(function (x) { return x.id; })); }); });
      $('#pgAdd', root).addEventListener('click', addPhotoFlow);
      if ($('#pgCmp', root)) $('#pgCmp', root).addEventListener('click', function () { photoCompare(null, null, pf === 'all' ? null : pf); });
      if ($('#pgPlay', root)) $('#pgPlay', root).addEventListener('click', function () { photoTimelapse(pf === 'all' ? null : pf); });
    };
    openSheet('<div id="pgRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#pgRoot', body)); }, function () { sheet.classList.remove('tall'); });
  }
  // One photo, full size. Swipe (or the arrows) for the next one; edit its date or pose, share it, compare or delete it.
  function photoViewer(id, ids) {
    ids = ids || photos.map(function (x) { return x.id; });
    let cur = id, url = null, editing = false;
    const draw = function (root) {
      const ph = photos.find(function (x) { return x.id === cur; }); if (!ph) { closeSheet(); return; }
      const i = ids.indexOf(cur), same = photos.filter(function (x) { return ph.pose ? x.pose === ph.pose : true; }), first = same[same.length - 1];
      const day = dayNum(ph.date) - dayNum(first.date), w = trendAt(dayNum(ph.date)), w0 = trendAt(dayNum(first.date));
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + (ph.pose ? poseName(ph.pose) + ' · ' : '') + (cur === first.id ? 'First photo' : 'Day ' + (day + 1)) + '</div><h2 class="sheet-title" id="sheetTitle">' + esc(fmtDate(ph.date, { month: 'long', day: 'numeric', year: 'numeric' })) + '</h2></div><span class="label faint">' + (i + 1) + ' / ' + ids.length + '</span></div>' +
        '<div class="pv-box" id="pvBox"><div class="photo-full pv-ph"></div>' + (i > 0 ? '<button type="button" class="pv-nav prev" id="pvPrev" aria-label="Newer">‹</button>' : '') + (i < ids.length - 1 ? '<button type="button" class="pv-nav next" id="pvNext" aria-label="Older">›</button>' : '') + '</div>' +
        '<div class="pv-info">' + (w != null ? '<span><b class="num">' + fmtW(w) + '</b> ' + unit() + ' trend</span>' : '') + (w != null && w0 != null && day > 0 ? '<span><b class="num">' + fmtDelta(w - w0) + '</b> ' + unit() + ' since the first' + (ph.pose ? ' ' + poseName(ph.pose).toLowerCase() : '') + ' photo</span>' : '') + '</div>' +
        (editing ? '<div class="pv-edit"><div class="seg w4" id="pvPose"><button type="button" data-v="" aria-pressed="' + !ph.pose + '">None</button>' + POSES.map(function (p) { return '<button type="button" data-v="' + p[0] + '" aria-pressed="' + (ph.pose === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>' +
          '<label class="field"><span>Date</span><input class="input" type="date" id="pvDate" value="' + ph.date + '" max="' + todayISO() + '" /></label><button type="button" class="btn primary block" id="pvSave">Save</button></div>' :
          '<div class="pv-acts">' + (photos.length >= 2 ? '<button type="button" class="pv-a" id="pvCmp">Compare</button>' : '') + '<button type="button" class="pv-a" id="pvEdit">Edit</button><button type="button" class="pv-a" id="pvShare">Share</button><button type="button" class="pv-a danger" id="pvDel">Delete</button></div>');
      photoTx('readonly', function (st) { return st.get(cur); }).then(function (r) { if (!r || !root.isConnected) return; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(r.full); const box = $('.pv-ph', root); if (box) box.outerHTML = '<img class="photo-full pv-ph" src="' + url + '" alt="Progress photo" />'; });
      const go = function (k) { const j = ids.indexOf(cur) + k; if (j < 0 || j >= ids.length) return; cur = ids[j]; editing = false; buzz('light'); draw(root); };
      if ($('#pvPrev', root)) $('#pvPrev', root).addEventListener('click', function () { go(-1); });
      if ($('#pvNext', root)) $('#pvNext', root).addEventListener('click', function () { go(1); });
      const bx = $('#pvBox', root); let sx = null;
      bx.addEventListener('pointerdown', function (e) { sx = e.clientX; });
      bx.addEventListener('pointerup', function (e) { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); });
      if (editing) {
        let np = ph.pose || '';
        $$('#pvPose button', root).forEach(function (b) { b.addEventListener('click', function () { np = b.dataset.v; $$('#pvPose button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); buzz('light'); }); });
        $('#pvSave', root).addEventListener('click', function () {
          const nd = $('#pvDate', root).value;
          photoTx('readonly', function (st) { return st.get(cur); }).then(function (r) {
            if (!r) return; r.pose = np || null; if (nd && ISO_RE.test(nd) && nd <= todayISO()) r.date = nd; r.u = Date.now(); photoSyncSoon();
            return photoTx('readwrite', function (st) { st.put(r); });
          }).then(function () { editing = false; buzz('success'); toast('Photo updated'); return loadPhotos(); }).then(function () { if (root.isConnected) draw(root); });
        });
        return;
      }
      $('#pvEdit', root).addEventListener('click', function () { editing = true; buzz('light'); draw(root); });
      if ($('#pvCmp', root)) $('#pvCmp', root).addEventListener('click', function () { const other = first.id !== cur ? first.id : same[0].id !== cur ? same[0].id : null; photoCompare(other, other ? cur : null, ph.pose || null); });
      $('#pvShare', root).addEventListener('click', function () {
        photoTx('readonly', function (st) { return st.get(cur); }).then(function (r) { if (r) shareBlob(r.full, 'progress-' + ph.date + '.jpg'); });
      });
      $('#pvDel', root).addEventListener('click', function () {
        photoTx('readonly', function (st) { return st.get(cur); }).then(function (r) {
          if (!r) return;
          const j = ids.indexOf(cur); ids.splice(j, 1);
          phDelAdd(r.id); photoSyncSoon(2500);
          return photoTx('readwrite', function (st) { st.delete(r.id); }).then(function () {
            buzz('medium'); toast('Photo deleted', function () { phDelRemove(r.id); photoTx('readwrite', function (st) { st.put(Object.assign({}, r, { synced: false, syncUid: null, u: Date.now() })); }).then(function () { photoSyncSoon(); return loadPhotos(); }); });
            return loadPhotos();
          }).then(function () { if (!ids.length) { closeSheet(); return; } cur = ids[Math.min(j, ids.length - 1)]; if (root.isConnected) draw(root); });
        });
      });
    };
    openSheet('<div id="pvRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#pvRoot', body)); }, function () { sheet.classList.remove('tall'); if (url) URL.revokeObjectURL(url); });
  }
  function shareBlob(blob, name) {
    const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file] }).catch(function () {});
    else { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 2000); toast('Image saved'); }
  }
  // The measurement nearest a date (within 10 days), for the compare screen.
  function measNear(d, key) {
    let best = null, gap = 11; state.measures.forEach(function (m) { if (m[key] == null) return; const g = Math.abs(dayNum(m.date) - dayNum(d)); if (g < gap) { gap = g; best = m[key]; } });
    return best;
  }
  // Before and after: two photos of the same pose side by side, with a slider, or faded over each other. Save it as one image.
  function photoCompare(aId, bId, pose) {
    if (photos.length < 2) return;
    let pf = pose || (bId && (photos.find(function (x) { return x.id === bId; }) || {}).pose) || null;
    const pool = function () { return photos.filter(function (x) { return !pf || x.pose === pf; }); };
    if (!pf) { const cnt = {}; photos.forEach(function (x) { if (x.pose) cnt[x.pose] = (cnt[x.pose] || 0) + 1; }); const best = Object.keys(cnt).sort(function (p, q) { return cnt[q] - cnt[p]; })[0]; if (best && cnt[best] >= 2 && !aId) pf = best; }
    let a = aId, b = bId, mode = 'side', cut = 50, fade = 50; const urls = {};
    const pick = function () { const l = pool(); if (l.length < 2) { pf = null; return pick(); } if (!l.some(function (x) { return x.id === a; })) a = l[l.length - 1].id; if (!l.some(function (x) { return x.id === b; }) || b === a) b = l[0].id === a ? l[1].id : l[0].id; };
    const get = function (pid) { return urls[pid] ? Promise.resolve(urls[pid]) : photoTx('readonly', function (st) { return st.get(pid); }).then(function (r) { urls[pid] = r ? URL.createObjectURL(r.full) : ''; return urls[pid]; }); };
    const draw = function (root) {
      pick();
      if (photos.find(function (x) { return x.id === a; }).date > photos.find(function (x) { return x.id === b; }).date) { const t = a; a = b; b = t; }
      const pa = photos.find(function (x) { return x.id === a; }), pb = photos.find(function (x) { return x.id === b; }), wa = trendAt(dayNum(pa.date)), wb = trendAt(dayNum(pb.date));
      const poses = POSES.filter(function (p) { return photos.filter(function (x) { return x.pose === p[0]; }).length >= 2; });
      const strip = function (side, cur) { return '<div class="pc-strip">' + pool().slice().reverse().map(function (ph) { return '<button type="button" class="pc-th' + (ph.id === cur ? ' on' : '') + '" data-pc="' + side + '" data-id="' + ph.id + '"><img src="' + ph.thumbUrl + '" alt="' + esc(fmtDate(ph.date)) + '" /></button>'; }).join('') + '</div>'; };
      const stats = [];
      const days = dayNum(pb.date) - dayNum(pa.date); stats.push('<span><b class="num">' + days + '</b> days</span>');
      if (wa != null && wb != null) stats.push('<span><b class="num">' + fmtDelta(wb - wa) + '</b> ' + unit() + '</span>');
      MEAS.forEach(function (m) { if (stats.length >= 4) return; const x = measNear(pa.date, m[0]), y = measNear(pb.date, m[0]); if (x != null && y != null && Math.abs(y - x) >= 0.1) stats.push('<span><b class="num">' + signed(toLen(y - x), 1) + '</b> ' + lenUnit() + ' ' + m[1].toLowerCase() + '</span>'); });
      const lbl = function (ph, w) { return '<b>' + esc(fmtDate(ph.date, { month: 'short', day: 'numeric', year: 'numeric' })) + '</b><span>' + (w != null ? fmtW(w) + ' ' + unit() : '') + '</span>'; };
      root.innerHTML = '<div class="sheet-head"><div><h2 class="sheet-title" id="sheetTitle">Before and after</h2></div><button type="button" class="text-btn" id="pcSave" style="margin:0">Save image</button></div>' +
        (poses.length ? '<div class="mt-chips pg-chips"><button type="button" data-pcp="" aria-pressed="' + !pf + '">All</button>' + poses.map(function (p) { return '<button type="button" data-pcp="' + p[0] + '" aria-pressed="' + (pf === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>' : '') +
        '<div class="seg w3 pc-modes" id="pcMode"><button type="button" data-v="side" aria-pressed="' + (mode === 'side') + '">Side by side</button><button type="button" data-v="wipe" aria-pressed="' + (mode === 'wipe') + '">Slider</button><button type="button" data-v="fade" aria-pressed="' + (mode === 'fade') + '">Fade</button></div>' +
        (mode === 'side' ? '<div class="pc-pair"><div><div class="pc-img" id="pcA"></div>' + lbl(pa, wa) + '</div><div><div class="pc-img" id="pcB"></div>' + lbl(pb, wb) + '</div></div>' :
          '<div class="pc-over" id="pcOver"></div>' + (mode === 'fade' ? '<input type="range" id="pcFade" min="0" max="100" value="' + fade + '" aria-label="Before to after" class="pc-fade" />' : '<p class="muted-note pc-hint">Drag across the photo</p>') +
          '<div class="pc-fl"><span>' + esc(fmtDate(pa.date)) + (wa != null ? ' · ' + fmtW(wa) + ' ' + unit() : '') + '</span><span>' + esc(fmtDate(pb.date)) + (wb != null ? ' · ' + fmtW(wb) + ' ' + unit() : '') + '</span></div>') +
        '<div class="pc-stats">' + stats.join('') + '</div>' +
        '<div class="label faint fd-sec">Before</div>' + strip('a', a) + '<div class="label faint fd-sec">After</div>' + strip('b', b);
      $$('[data-pcp]', root).forEach(function (t) { t.addEventListener('click', function () { pf = t.dataset.pcp || null; buzz('light'); draw(root); }); });
      $$('#pcMode button', root).forEach(function (t) { t.addEventListener('click', function () { mode = t.dataset.v; buzz('light'); draw(root); }); });
      if (mode === 'side') {
        get(a).then(function (u) { const el = $('#pcA', root); if (el && u) el.innerHTML = '<img src="' + u + '" alt="Before" />'; });
        get(b).then(function (u) { const el = $('#pcB', root); if (el && u) el.innerHTML = '<img src="' + u + '" alt="After" />'; });
      } else Promise.all([get(a), get(b)]).then(function (u) {
        const el = $('#pcOver', root); if (!el) return;
        el.innerHTML = '<img src="' + u[0] + '" alt="Before" /><img src="' + u[1] + '" alt="After" id="pcTop" />' + (mode === 'wipe' ? '<span class="pc-cut" id="pcCut"><i></i></span>' : '');
        const top = $('#pcTop', el);
        if (mode === 'fade') { top.style.opacity = fade / 100; $('#pcFade', root).addEventListener('input', function () { fade = +this.value; top.style.opacity = fade / 100; }); return; }
        const set = function () { top.style.clipPath = 'inset(0 0 0 ' + cut + '%)'; $('#pcCut', el).style.left = cut + '%'; };
        set();
        let dragging = false;
        const mv = function (e) { const r = el.getBoundingClientRect(); cut = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); set(); };
        el.addEventListener('pointerdown', function (e) { dragging = true; try { el.setPointerCapture(e.pointerId); } catch (x) {} mv(e); });
        el.addEventListener('pointermove', function (e) { if (dragging) mv(e); });
        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { el.addEventListener(t, function () { dragging = false; }); });
      });
      $$('[data-pc]', root).forEach(function (t) { t.addEventListener('click', function () { if (t.dataset.pc === 'a') a = t.dataset.id; else b = t.dataset.id; buzz('light'); draw(root); }); });
      $('#pcSave', root).addEventListener('click', function () {
        Promise.all([get(a), get(b)]).then(function (u) {
          return Promise.all(u.map(function (s) { return new Promise(function (ok, no) { const im = new Image(); im.onload = function () { ok(im); }; im.onerror = no; im.src = s; }); }));
        }).then(function (ims) {
          const W = 1200, H = 1000, ph = 880, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
          x.fillStyle = '#111318'; x.fillRect(0, 0, W, H);
          ims.forEach(function (im, k) { const s = Math.max(600 / im.width, ph / im.height), w = im.width * s, h = im.height * s; x.save(); x.beginPath(); x.rect(k * 600, 0, 600, ph); x.clip(); x.drawImage(im, k * 600 + (600 - w) / 2, (ph - h) / 2, w, h); x.restore(); });
          x.fillStyle = '#fff'; x.font = '600 34px system-ui, sans-serif'; x.textAlign = 'center';
          [[pa, wa], [pb, wb]].forEach(function (p, k) { x.fillText(fmtDate(p[0].date, { month: 'short', day: 'numeric', year: 'numeric' }) + (p[1] != null ? '  ·  ' + fmtW(p[1]) + ' ' + unit() : ''), k * 600 + 300, ph + 72); });
          x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(599, 0, 2, ph);
          c.toBlob(function (bl) { if (bl) shareBlob(bl, 'progress-' + pa.date + '-to-' + pb.date + '.jpg'); }, 'image/jpeg', 0.9);
        }).catch(function () { toast('Couldn\'t make the image'); });
      });
    };
    openSheet('<div id="pcRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#pcRoot', body)); }, function () { sheet.classList.remove('tall'); Object.keys(urls).forEach(function (k) { if (urls[k]) URL.revokeObjectURL(urls[k]); }); });
  }
  // Timelapse: your photos of one pose played in order, oldest first, with the date and weight.
  function photoTimelapse(pose) {
    let pf = pose || null;
    if (!pf) { const cnt = {}; photos.forEach(function (x) { if (x.pose) cnt[x.pose] = (cnt[x.pose] || 0) + 1; }); const best = Object.keys(cnt).sort(function (p, q) { return cnt[q] - cnt[p]; })[0]; if (best && cnt[best] >= 2) pf = best; }
    let i = 0, playing = true, speed = 700, timer = 0; const urls = {};
    const get = function (pid) { return urls[pid] ? Promise.resolve(urls[pid]) : photoTx('readonly', function (st) { return st.get(pid); }).then(function (r) { urls[pid] = r ? URL.createObjectURL(r.full) : ''; return urls[pid]; }); };
    const draw = function (root) {
      const list = photos.filter(function (x) { return !pf || x.pose === pf; }).slice().reverse();
      const poses = POSES.filter(function (p) { return photos.filter(function (x) { return x.pose === p[0]; }).length >= 2; });
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">' + list.length + ' photos' + (pf ? ' · ' + poseName(pf) : '') + '</div><h2 class="sheet-title" id="sheetTitle">Timelapse</h2></div></div>' +
        (poses.length ? '<div class="mt-chips pg-chips"><button type="button" data-tp="" aria-pressed="' + !pf + '">All</button>' + poses.map(function (p) { return '<button type="button" data-tp="' + p[0] + '" aria-pressed="' + (pf === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>' : '') +
        '<div class="tl-box" id="tlBox"><img id="tlA" alt="" /><img id="tlB" alt="" /><div class="tl-cap" id="tlCap"></div></div>' +
        '<input type="range" class="pc-fade" id="tlPos" min="0" max="' + Math.max(0, list.length - 1) + '" value="' + i + '" aria-label="Photo" />' +
        '<div class="btn-row"><button type="button" class="btn soft" id="tlSpeed">' + (speed === 700 ? 'Normal' : speed > 700 ? 'Slow' : 'Fast') + '</button><button type="button" class="btn primary" id="tlPlay">' + (playing ? 'Pause' : 'Play') + '</button></div>';
      const A = $('#tlA', root), B = $('#tlB', root); let front = A;
      const show = function (k) {
        i = k; const ph = list[i]; if (!ph) return;
        $('#tlPos', root).value = i;
        const w = trendAt(dayNum(ph.date));
        $('#tlCap', root).innerHTML = '<b>' + esc(fmtDate(ph.date, { month: 'short', day: 'numeric', year: 'numeric' })) + '</b>' + (w != null ? '<span>' + fmtW(w) + ' ' + unit() + '</span>' : '');
        get(ph.id).then(function (u) { if (!root.isConnected) return; const back = front === A ? B : A; back.src = u; back.onload = function () { back.classList.add('on'); front.classList.remove('on'); front = back; }; });
        if (list[i + 1]) get(list[i + 1].id);
      };
      const loop = function () { clearInterval(timer); if (!playing || list.length < 2) return; timer = setInterval(function () { show(i >= list.length - 1 ? 0 : i + 1); }, speed); };
      show(Math.min(i, list.length - 1)); loop();
      $$('[data-tp]', root).forEach(function (t) { t.addEventListener('click', function () { pf = t.dataset.tp || null; i = 0; buzz('light'); draw(root); }); });
      $('#tlPos', root).addEventListener('input', function () { playing = false; clearInterval(timer); $('#tlPlay', root).textContent = 'Play'; show(+this.value); });
      $('#tlPlay', root).addEventListener('click', function () { playing = !playing; this.textContent = playing ? 'Pause' : 'Play'; buzz('light'); loop(); });
      $('#tlSpeed', root).addEventListener('click', function () { speed = speed === 700 ? 1300 : speed === 1300 ? 350 : 700; this.textContent = speed === 700 ? 'Normal' : speed > 700 ? 'Slow' : 'Fast'; buzz('light'); loop(); });
    };
    openSheet('<div id="tlRoot"></div>', function (body) { sheet.classList.add('tall'); draw($('#tlRoot', body)); }, function () { clearInterval(timer); sheet.classList.remove('tall'); Object.keys(urls).forEach(function (k) { if (urls[k]) URL.revokeObjectURL(urls[k]); }); });
  }

  // US Navy body fat estimate from waist, neck (and hips for women) and height, all in cm.
  function navyFat() {
    const p = state.profile, ms = state.measures; if (!p.heightCm || (p.sex !== 'male' && p.sex !== 'female') || !ms.length) return null;
    const pickLast = function (k) { for (let i = ms.length - 1; i >= 0; i--) if (ms[i][k] != null) return ms[i][k]; return null; };
    const w = pickLast('waist'), n = pickLast('neck'), h = pickLast('hips'); if (!w || !n) return null;
    let bf;
    if (p.sex === 'male') { if (w - n <= 0) return null; bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(p.heightCm)) - 450; }
    else { if (!h || w + h - n <= 0) return null; bf = 495 / (1.29579 - 0.35004 * Math.log10(w + h - n) + 0.22100 * Math.log10(p.heightCm)) - 450; }
    return bf >= 3 && bf <= 60 ? Math.round(bf * 10) / 10 : null;
  }
  let measKey = 'waist';
  function measTrend() {
    const ms = state.measures; if (ms.length < 2) return '';
    const keys = MEAS.filter(function (m) { return ms.filter(function (x) { return x[m[0]] != null; }).length >= 2; });
    if (!keys.length) return ''; if (!keys.some(function (m) { return m[0] === measKey; })) measKey = keys[0][0];
    const pts = ms.filter(function (x) { return x[measKey] != null; }).map(function (x) { return { d: dayNum(x.date), v: toLen(x[measKey]) }; });
    const W = 320, H = 110, d0 = pts[0].d, d1 = pts[pts.length - 1].d || d0 + 1, lo = Math.min.apply(null, pts.map(function (x) { return x.v; })), hi = Math.max.apply(null, pts.map(function (x) { return x.v; })), pad = Math.max(0.5, (hi - lo) * 0.2);
    const X = function (d) { return d1 === d0 ? W / 2 : (d - d0) / (d1 - d0) * (W - 16) + 8; }, Y = function (v) { return H - 10 - (v - lo + pad) / (hi - lo + pad * 2) * (H - 20); };
    const path = pts.map(function (x, i) { return (i ? 'L' : 'M') + X(x.d).toFixed(1) + ' ' + Y(x.v).toFixed(1); }).join(' ');
    const ch = pts[pts.length - 1].v - pts[0].v;
    return '<div class="divider-line"></div><div class="card-head" style="margin-bottom:8px"><span class="label">Trend</span><span class="label faint">' + (ch > 0 ? '+' : '') + ch.toFixed(1) + ' ' + lenUnit() + ' since ' + esc(fmtDate(isoFromDay(d0), { month: 'short', day: 'numeric' })) + '</span></div>' +
      '<div class="mt-chips">' + keys.map(function (m) { return '<button type="button" data-mt="' + m[0] + '" aria-pressed="' + (m[0] === measKey) + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      '<svg class="mt-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none"><path d="' + path + '" class="mt-line"/>' + pts.map(function (x) { return '<circle cx="' + X(x.d).toFixed(1) + '" cy="' + Y(x.v).toFixed(1) + '" r="3.5" class="mt-dot"/>'; }).join('') + '</svg>';
  }
  function bfLine() {
    const bf = navyFat(), p = state.profile;
    if (bf == null) return state.measures.length ? '<p class="muted-note bf-line">Add waist, neck' + (p.sex === 'female' ? ' and hips' : '') + ' to estimate your body fat.</p>' : '';
    const using = p.bodyFat && Math.abs(p.bodyFat - bf) < 0.6;
    return '<div class="bf-line"><div class="grow"><b class="num">' + bf + '%</b> <span>estimated body fat</span><small>US Navy method, from your measurements</small></div>' + (using ? '<span class="pill">In use</span>' : '<button type="button" class="btn sm tint" data-action="use-bf" data-bf="' + bf + '">Use for targets</button>') + '</div>';
  }
  function renderBody() {
    const box = $('#bodyBox');
    if (!box) return;
    const ms = state.measures, last = ms[ms.length - 1], first = ms[0];
    let meas;
    if (!last) meas = '<p class="muted-note" style="padding:0;margin:0 0 4px">Waist, hips and more show progress the scale can miss.</p>';
    else {
      meas = '<button type="button" class="meas-grid" data-action="measure" style="width:100%;border:0;background:none;padding:0;color:inherit;font:inherit">' + MEAS.filter(function (m) { return last[m[0]] != null; }).map(function (m) {
        let f = null; for (let i = 0; i < ms.length && f == null; i++) f = ms[i][m[0]];
        const d = f != null && ms.length > 1 ? toLen(last[m[0]] - f) : null;
        return '<div><b>' + toLen(last[m[0]]).toFixed(1) + '</b><span>' + m[1] + '</span>' + (d != null && Math.abs(d) >= 0.05 ? '<em>' + signed(d, 1) + '</em>' : '<em>&nbsp;</em>') + '</div>';
      }).join('') + '</button>' +
      '<div class="t-sub" style="margin-top:12px;text-align:center">' + lenUnit() + ' · ' + esc(fmtDate(last.date, { month: 'short', day: 'numeric' })) + (ms.length > 1 && first !== last ? ' · change since ' + esc(fmtDate(first.date, { month: 'short', day: 'numeric' })) : '') + '</div>';
    }
    box.innerHTML = '<div class="section-head"><h2>Body</h2><button type="button" class="btn sm tint" data-action="measure">' + (last ? 'Update' : 'Add') + '</button></div>' +
      '<div class="card">' + meas + bfLine() + measTrend() + '<div class="divider-line"></div>' +
      photoBlock() + '</div>';
  }

  function measureSheet() {
    let d = todayISO();
    const last = state.measures[state.measures.length - 1];
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Measurements</h2>' +
        '<label class="date-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg><span id="msDateLbl"></span><input type="date" id="msDate" aria-label="Date" /></label></div>' +
      '<div class="two">' + MEAS.map(function (m) { return '<label class="field"><span>' + m[1] + '</span><div class="sfx"><input class="input" id="ms_' + m[0] + '" inputmode="decimal" maxlength="5" autocomplete="off" /><em>' + lenUnit() + '</em></div></label>'; }).join('') + '</div>' +
      '<p class="t-sub" style="margin:-4px 2px 16px">Measure at the same spot each time, relaxed, first thing in the morning.</p>' +
      '<p class="form-error" id="msErr" hidden></p>' +
      '<div class="btn-row"><button type="button" class="btn danger icon-only" id="msDel" aria-label="Delete" hidden>' + TRASH + '</button><button type="button" class="btn primary" id="msSave">Save</button></div>',
      function (root) {
        const dateIn = $('#msDate', root);
        const fill = function () {
          const row = state.measures.find(function (m) { return m.date === d; });
          dateIn.value = d; dateIn.max = todayISO(); $('#msDateLbl', root).textContent = relDate(d);
          MEAS.forEach(function (m) {
            const el = $('#ms_' + m[0], root);
            el.value = row && row[m[0]] != null ? toLen(row[m[0]]).toFixed(1) : '';
            el.placeholder = last && last[m[0]] != null ? toLen(last[m[0]]).toFixed(1) : '';
          });
          $('#msDel', root).hidden = !row;
        };
        fill();
        dateIn.addEventListener('change', function () { if (dateIn.value && dateIn.value <= todayISO()) d = dateIn.value; fill(); });
        $('#msSave', root).addEventListener('click', function () {
          const row = { date: d }; let any = false, bad = false;
          MEAS.forEach(function (m) {
            const raw = $('#ms_' + m[0], root).value.trim();
            if (!raw) { row[m[0]] = null; return; }
            const cm = fromLen(parseNum(raw));
            if (isNaN(cm) || cm < 10 || cm > 300) bad = true; else { row[m[0]] = Math.round(cm * 10) / 10; any = true; }
          });
          const e = $('#msErr', root);
          if (bad) { e.textContent = 'One of those doesn\'t look right'; e.hidden = false; buzz('warn'); return; }
          if (!any) { e.textContent = 'Add at least one measurement'; e.hidden = false; buzz('warn'); return; }
          const snap = snapshot();
          state.measures = state.measures.filter(function (m) { return m.date !== d; }).concat([row]).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
          save(); renderAll(); closeSheet(); buzz('success');
          toast('Measurements saved', function () { restore(snap); });
        });
        $('#msDel', root).addEventListener('click', function () {
          const snap = snapshot();
          state.measures = state.measures.filter(function (m) { return m.date !== d; });
          save(); renderAll(); closeSheet(); toast('Deleted', function () { restore(snap); });
        });
      });
  }

  // ----- Progress photos in your account -----
  // When you're signed in, each photo is also kept in your account (users/{uid}/setpoint/state/photos/{id}, private to
  // you), with a small index listing them all. Photos are copied both ways, edits (date, pose) follow the newest change,
  // and a photo deleted on one phone is deleted on the others.
  let phSync = { busy: false, again: false, state: '', timer: 0 };
  function phDelList() { try { return JSON.parse(localStorage.getItem('setpoint-phdel') || '[]'); } catch (e) { return []; } }
  function phDelSet(l) { try { localStorage.setItem('setpoint-phdel', JSON.stringify(l.slice(-500))); } catch (e) {} }
  function phDelAdd(id) { const l = phDelList(); if (l.indexOf(id) < 0) l.push(id); phDelSet(l); }
  function phDelRemove(id) { phDelSet(phDelList().filter(function (x) { return x !== id; })); }
  function photoSyncSoon(ms) { clearTimeout(phSync.timer); phSync.timer = setTimeout(photoSync, ms == null ? 1200 : ms); }
  function phIdxRef() { return fb.doc(db, 'users', user.uid, 'setpoint', 'state', 'photomap', 'index'); }
  function phDocRef(id) { return fb.doc(db, 'users', user.uid, 'setpoint', 'state', 'photos', id); }
  // A copy small enough for one database record (well under 1 MB).
  function phCloudImg(blob) {
    const tries = [[1280, 0.8], [1080, 0.72], [900, 0.65]];
    const go = function (i) { return shrink(blob, tries[i][0], tries[i][1]).then(blobToUrl).then(function (u) { return u && u.length > 900000 && i < tries.length - 1 ? go(i + 1) : u; }); };
    return go(0);
  }
  function phMeta(r) { return { u: r.u || r.added || 0, date: r.date, pose: r.pose || null, added: r.added || 0 }; }
  function photoSync() {
    if (!phUser() || !fb || !db) return Promise.resolve();
    if (phSync.busy) { phSync.again = true; return Promise.resolve(); }
    phSync.busy = true; phSync.state = 'syncing'; phSyncLabel();
    const uid = user.uid, dels = phDelList();
    let idx = {}, changed = false, touched = false;
    const done = [];
    return Promise.all([fb.getDoc(phIdxRef()), photoTx('readonly', function (st) { return st.getAll(); })]).then(function (res) {
      const remote = (res[0].exists() && res[0].data().items) || {}, local = {};
      idx = Object.assign({}, remote);
      (res[1] || []).forEach(function (r) { local[r.id] = r; });
      const jobs = [];
      // Deleted here: delete in the account too.
      dels.forEach(function (id) {
        if (local[id]) return; // brought back with Undo
        done.push(id);
        if (!idx[id]) return;
        delete idx[id]; changed = true;
        jobs.push(function () { const b = fb.writeBatch(db); b.delete(phDocRef(id)); return b.commit(); });
      });
      Object.keys(local).forEach(function (id) {
        const r = local[id], rm = remote[id], lu = r.u || r.added || 0;
        if (!rm) {
          if (r.syncUid === uid) { touched = true; jobs.push(function () { return photoTx('readwrite', function (st) { st.delete(id); }); }); } // deleted on another phone
          else jobs.push(function () {
            return Promise.all([phCloudImg(r.full), blobToUrl(r.thumb)]).then(function (u) {
              if (!u[0]) throw new Error('encode');
              const m = phMeta(r);
              return fb.setDoc(phDocRef(id), Object.assign({ id: id, img: u[0], thumb: u[1] || '' }, m)).then(function () { idx[id] = m; changed = true; r.synced = true; r.syncUid = uid; r.u = m.u; return photoTx('readwrite', function (st) { st.put(r); }); });
            });
          });
        } else if (lu > rm.u) {
          jobs.push(function () { const m = phMeta(r); return fb.setDoc(phDocRef(id), m, { merge: true }).then(function () { idx[id] = m; changed = true; if (r.syncUid !== uid) { r.syncUid = uid; r.synced = true; return photoTx('readwrite', function (st) { st.put(r); }); } }); });
        } else if (rm.u > lu || r.syncUid !== uid) {
          touched = true; r.date = rm.date || r.date; r.pose = rm.pose || null; r.u = rm.u; r.synced = true; r.syncUid = uid;
          jobs.push(function () { return photoTx('readwrite', function (st) { st.put(r); }); });
        }
      });
      // In the account but not here: download.
      Object.keys(remote).forEach(function (id) {
        if (local[id] || dels.indexOf(id) >= 0) return;
        jobs.push(function () {
          return fb.getDoc(phDocRef(id)).then(function (snap) {
            if (!snap.exists()) { delete idx[id]; changed = true; return; }
            const d = snap.data(), m = remote[id];
            return Promise.all([urlToBlob(d.img), d.thumb ? urlToBlob(d.thumb) : null]).then(function (b) {
              const full = b[0]; return (b[1] ? Promise.resolve(b[1]) : shrink(full, 360, 0.75)).then(function (th) {
                touched = true;
                return photoTx('readwrite', function (st) { st.put({ id: id, date: m.date || d.date, added: m.added || d.added || Date.now(), pose: m.pose || null, u: m.u, full: full, thumb: th, synced: true, syncUid: uid }); });
              });
            });
          });
        });
      });
      return jobs.reduce(function (p, j) { return p.then(j); }, Promise.resolve());
    }).then(function () {
      return changed ? fb.setDoc(phIdxRef(), { items: idx, at: Date.now() }) : null;
    }).then(function () {
      phDelSet(phDelList().filter(function (x) { return done.indexOf(x) < 0; }));
      phSync.state = 'ok';
      return changed || touched ? loadPhotos() : null;
    }).catch(function () { phSync.state = 'error'; }).then(function () {
      phSync.busy = false; phSyncLabel();
      if (phSync.again) { phSync.again = false; photoSyncSoon(500); }
    });
  }
  function phUser() { try { return user; } catch (e) { return null; } } // safe before the account code has started
  function phSyncText() {
    if (!phUser()) return 'Only on this device';
    return phSync.state === 'syncing' ? 'Syncing…' : phSync.state === 'error' ? 'Couldn\'t sync, will retry' : 'Synced to your account';
  }
  function phSyncLabel() { const el = $('#phSyncL'); if (el) el.textContent = phSyncText(); }
  function photoSheet(id) { photoViewer(id); }


  /* ================= Energy ================= */
  // e.g. "2 g protein and ~0.8 g fat per kg of body weight. Carbs are the rest."
  function macroNote(plan) {
    const lb = unit() === 'lb';
    const g = function (perKg) { return String(Number((lb ? perKg / LB : perKg).toFixed(1))); };
    const base = plan.refWhy === 'your weight' ? 'body weight'
      : (plan.refWhy === 'your lean mass' ? 'lean mass' : 'a healthy weight for your height') + ' (' + Math.round(toDisp(plan.ref)) + ' ' + unit() + ')';
    const why = plan.custom ? '' : ' Protein is set for ' + (plan.kind === 'strength' ? 'lifting' : plan.kind === 'cardio' ? 'cardio training' : 'no regular training') + (plan.pace && plan.pace.kg < 0 ? ' while losing' : '') + '; change your workouts in Activity if that\'s not right.';
    return (plan.custom ? 'Your split: ' : '') + g(plan.proteinPerKg) + ' g protein and ' + (plan.custom ? '' : '~') + g(plan.fatPerKg) + ' g fat per ' + unit() + ' of ' + base + '. Carbs are the rest.' + why;
  }

  // Targets is a short menu: a summary of today's target, then a page each for your goal, calories & macros and daily burn.
  let tgView = null, tvSnap = '';
  const TG_SECS = { goal: 'Goal', cal: 'Targets', burn: 'Energy expenditure' };
  function showTgView() {
    $$('#panel-targets .tg-sec').forEach(function (s) { s.hidden = s.dataset.sec !== tgView; });
    $('#tgHome').hidden = !!tgView; $('#tgTitle').textContent = tgView ? TG_SECS[tgView] : 'Plan';
  }
  function tgOpen(k) {
    pageMove('push', function () {
      if (!tgView) { tvSnap = $('#tgHome').innerHTML; navPush('tv'); } // from one page to another: still one step back to the menu
      tgView = k; showTgView();
    });
  }
  function tgClose(fromBack) { if (!tgView) return; pageMove('pop', function () { tgView = null; if (fromBack !== true) navDrop('tv'); showTgView(); }); }
  function renderTgHome(plan, en) {
    const CH = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
    const menu = $('#tgMenu');
    const row = function (k, act, ic, cls, t, s, v) { return '<button type="button" class="row tg-mrow" ' + (k ? 'data-tg="' + k + '"' : 'data-action="' + act + '"') + '><span class="ico ' + cls + '">' + ic + '</span><div class="grow"><div class="row-t">' + t + '</div><div class="row-s">' + s + '</div></div>' + (v ? '<span class="row-v num">' + v + '</span>' : '') + CH + '</button>'; };
    const FLAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>';
    const TGT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>';
    let h = plan ? row('cal', '', TGT, 'ic-c-green', 'Targets', 'Macros & micros', fmtKcal(roundKcal(plan.target)) + ' kcal')
      : row('burn', '', TGT, 'ic-c-green', 'Targets', profileReady() ? 'Log your weight to work them out' : 'Add your age, sex and height to start', '');
    if (plan) {
      const p = plan.pace, g = state.settings.goalKg;
      const ps = p.dir === 'maintain' ? 'Keep your weight steady' : (p.dir === 'lose' ? 'Lose ' : 'Gain ') + RATES[unit()][p.dir][p.i] + ' ' + unit() + ' a week';
      h += row('goal', '', FLAG, 'ic-c-blue', 'Goal', esc(ps), g ? fmtW(g) + ' ' + unit() : 'Set');
    }
    h += row('burn', '', FLAME, 'ic-c-orange', 'Energy expenditure', en ? esc(en.source === 'measured' ? 'From your food log' : en.source === 'auto' && (en.w > 0) ? 'Learned from you' : 'Estimated for you') : 'Activity, age, height and weight', en ? fmtKcal(roundKcal(en.tdee)) : '');
    menu.innerHTML = h;
    renderNutTable();
  }
  function renderEnergy() {
    const p = state.profile, en = activeEnergy(), plan = makePlan(en), m = measuredEnergy(), kgNow = currentKg();
    const hero = $('#energyHero'), card = $('#planCard'), gc = $('#goalCard');
    card.hidden = !plan; gc.hidden = !plan;
    const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';

    // 1. Your daily burn (maintenance): one number, one bar, four parts.
    if (!en) {
      const needD = !profileReady(), needW = kgNow == null;
      hero.innerHTML = '<div class="tg-k">Your daily burn</div>' +
        '<div class="tg-empty-t">Let\'s work out your targets</div>' +
        '<p class="tg-empty-s">' + (needD ? 'Add your age, sex and height' + (needW ? ', then log your weight.' : '.') : 'Log your weight to finish.') + '</p>' +
        '<button type="button" class="btn primary block" data-action="' + (needD ? 'details' : 'log') + '">' + (needD ? 'Get started' : 'Log weight') + '</button>';
    } else {
      const c = en.calc, learned = en.source === 'measured' ? 'From your log' : en.source === 'auto' && (en.w > 0 || Math.abs(en.tdee - c.tdee) >= 10) ? 'Learned from you' : 'Estimated';
      let h = '<button type="button" class="tg-burn-top" data-action="tg-explain"><div class="grow"><div class="tg-k">Your daily burn</div>' +
        '<div class="tg-burn-v num">' + fmtKcal(roundKcal(en.tdee)) + '<span class="unit">kcal</span></div>' +
        '<div class="tg-burn-s">' + esc(learned) + (c ? ' · ' + esc(c.level) : '') + '</div></div>' + CHEV + '</button>';
      if (c) {
        // What the formula got wrong shows up in daily life (everyday movement varies most), so the parts add up to the burn used.
        const parts = [['Resting', c.bmr, 'o1'], ['Daily life', Math.max(0, c.life + en.tdee - c.tdee), 'o2'], ['Steps', c.steps, 'o3'], ['Training', c.train, 'o4']];
        h += '<div class="burn tg-bar">' + parts.map(function (x) { return '<i class="' + x[2] + '" style="flex-grow:' + Math.max(1, Math.round(x[1])) + '"></i>'; }).join('') + '</div>' +
          '<div class="tg-key">' + parts.map(function (x) { return '<div><span><i class="' + x[2] + '"></i>' + x[0] + '</span><b class="num">' + fmtKcal(roundKcal(x[1])) + '</b></div>'; }).join('') + '</div>';
      }
      hero.innerHTML = h;
    }

    if (plan) {
      const pace = plan.pace, diff = plan.target - en.tdee, kc = [['Protein', plan.protein, 4, 'p'], ['Carbs', plan.carbs, 4, 'c'], ['Fat', plan.fat, 9, 'f']];
      const tot = kc.reduce(function (a, x) { return a + x[1] * x[2]; }, 0) || 1;
      // 2. The daily target: the number you eat to, how it relates to your burn, and the three macros.
      const rel = Math.abs(diff) < 5 ? 'Same as your burn' : fmtKcal(Math.abs(roundKcal(diff))) + ' kcal ' + (diff < 0 ? 'below' : 'above') + ' your burn';
      card.innerHTML = '<div class="tg-k">Daily target</div>' +
        '<div class="tg-big num"><span data-an="' + roundKcal(plan.target) + '">' + fmtKcal(roundKcal(plan.target)) + '</span><span class="unit">kcal</span></div>' +
        '<div class="tg-rel">' + esc(rel) + '</div>' +
        (plan.warn ? '<div class="tg-warn">' + esc(plan.warn) + '</div>' : '') +
        '<div class="tg-mac">' + kc.map(function (x) { return '<button type="button" class="tg-m" data-action="macros"><span class="tg-m-l"><i class="d-' + x[3] + '"></i>' + x[0] + '</span><b class="num"><span data-an="' + x[1] + '" data-af="g">' + x[1] + '</span><small>g</small></b><span class="tg-m-p num">' + Math.round(x[1] * x[2] / tot * 100) + '%</span></button>'; }).join('') + '</div>' +
        '<div class="tg-links"><button type="button" class="tg-how" data-action="macros"><span class="grow">Protein &amp; fat</span><span class="tg-how-v">' + (plan.custom ? 'Your own' : 'Recommended') + '</span>' + CHEV + '</button>' +
        '<button type="button" class="tg-how" data-action="tg-explain"><span class="grow">How this is worked out</span>' + CHEV + '</button></div>';
      animate(card, 'target');
      // 3. Your goal: direction, pace and goal weight, together in one place.
      const g = state.settings.goalKg;
      const etaD = plan.eta && plan.eta.replace(/^goal by /, '');
      gc.innerHTML = '<div class="card-head"><h2 class="card-title">' + (g && etaD && pace.dir !== 'maintain' ? 'Reach ' + fmtW(g) + ' ' + unit() + ' by ' + esc(etaD) : 'Your goal') + '</h2></div>' +
        '<div class="seg"><button type="button" data-dir="lose" aria-pressed="' + (pace.dir === 'lose') + '">Lose</button><button type="button" data-dir="maintain" aria-pressed="' + (pace.dir === 'maintain') + '">Maintain</button><button type="button" data-dir="gain" aria-pressed="' + (pace.dir === 'gain') + '">Gain</button></div>' +
        (pace.dir !== 'maintain' ? '<div class="tg-rate-l">How fast, per week</div><div class="rates">' + RATES[unit()][pace.dir].map(function (v, i) { return '<button type="button" data-rate="' + i + '" aria-pressed="' + (i === pace.i) + '" aria-label="' + v + ' ' + unit() + ' per week">' + v + ' ' + unit() + '</button>'; }).join('') + '</div>' : '') +
        '<button type="button" class="tg-gw" data-action="goal"><span>Goal weight</span><b class="num">' + (g ? fmtW(g) + ' ' + unit() : 'Set') + '</b>' + CHEV + '</button>' +
        '<button type="button" class="tg-gw tg-gw2" data-tg="cal"><span>Daily target</span><b class="num">' + fmtKcal(roundKcal(plan.target)) + ' kcal</b>' + CHEV + '</button>';
    }
    const t = p.training;
    $('#actSub').textContent = fmtKcal(p.steps) + ' steps · ' + (t.days ? t.days + '× ' + { lifting: 'lifting', cardio: 'cardio', mixed: 'HIIT', sports: 'sports' }[t.type] + ' a week' : 'no workouts');
    if (profileReady()) {
      const h = unit() === 'lb' ? Math.floor(p.heightCm / 2.54 / 12) + '′' + Math.round(p.heightCm / 2.54 % 12) + '″' : Math.round(p.heightCm) + ' cm';
      $('#detailsSub').textContent = { female: 'Female', male: 'Male', other: 'Other' }[p.sex] + ' · ' + ageNow() + ' · ' + h + (p.bodyFat ? ' · ' + p.bodyFat + '% fat' : '');
    } else $('#detailsSub').textContent = 'Not set';
    const own = Object.keys(state.profile.nutT || {}).length;
    $('#nutTSub').textContent = own ? own + (own === 1 ? ' set by you' : ' set by you') : state.profile.sex && state.profile.birthYear ? 'Recommended for your age and sex' : 'Add your age and sex for personal targets';
    $('#realSub').textContent = m.ready ? (en && (en.source === 'measured' || en.source === 'auto' && en.w > 0) ? 'From your food log · in use' : 'From your food log · ready') : state.settings.trackCalories ? 'Learning from your food log' : 'Off';
    $('#realVal').textContent = m.ready ? fmtKcal(roundKcal(m.tdee)) : state.settings.trackCalories ? Math.min(m.calDays, m.needCal) + '/' + m.needCal : '';
    renderTgHome(plan, en);
  }

  /* ================= Settings ================= */
  // A small dot on your profile button: synced, saving, offline or a problem. Nothing when you're not signed in.
  function renderSyncDot() {
    const sy = state.sync, st = !sy.uid ? '' : syncBusy || sy.dirty ? (navigator.onLine ? 'busy' : 'off') : !navigator.onLine ? 'off' : syncError ? 'err' : 'ok';
    $$('.avatar-btn').forEach(function (b) { if (st) b.dataset.sync = st; else delete b.dataset.sync; b.title = st ? syncStatus() : ''; });
    const ty = $('#tab-you .tab-ico'); if (ty) { if (st && st !== 'ok') ty.dataset.sync = st; else delete ty.dataset.sync; }
  }
  function renderAccount() {
    renderSyncDot();
    const sy = state.sync, ico = $('#acctIco');
    $$('.avatar-btn').forEach(function (b) { b.innerHTML = sy.uid ? esc((sy.email || '?').charAt(0).toUpperCase()) : USER_ICO; });
    if ($('#yhSub')) $('#yhSub').textContent = youSub();
    if (!ico) return;
    if (!sy.uid) {
      $('#acctTitle').textContent = 'Sign in';
      $('#acctSub').textContent = 'Sync across devices';
      ico.innerHTML = USER_ICO;
    } else {
      $('#acctTitle').textContent = sy.email || 'Signed in';
      $('#acctSub').textContent = syncStatus();
      ico.innerHTML = '<b style="font-size:15px">' + esc((sy.email || '?').charAt(0).toUpperCase()) + '</b>';
    }
  }
  function ago(ms) {
    const s = Math.round((Date.now() - ms) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return fmtDate(isoOf(new Date(ms)));
  }
  function syncStatus() {
    const sy = state.sync;
    if (syncBusy) return 'Syncing…';
    if (!navigator.onLine) return 'Offline · syncs when you\'re back';
    if (syncError) return 'Couldn\'t sync · tap to retry';
    if (sy.dirty) return 'Waiting to sync';
    return sy.lastSync ? 'Synced ' + ago(sy.lastSync) : 'Not synced yet';
  }

  // Storage on this phone: ask the browser to keep it, show how much is used, and warn when it's nearly full.
  let storeEst = null;
  function checkStorage() {
    if (!navigator.storage || !navigator.storage.estimate) return;
    const installed = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    if (installed && navigator.storage.persist) navigator.storage.persisted().then(function (p) { if (!p) navigator.storage.persist().catch(function () {}); }).catch(function () {});
    navigator.storage.estimate().then(function (e) {
      storeEst = e; if ($('#storeSub')) $('#storeSub').textContent = storeLine();
      const r = e.quota ? e.usage / e.quota : 0, wk = weekStart(dayNum(todayISO()));
      if (r > 0.8 && state.ui.storeWarn !== wk) { state.ui.storeWarn = wk; save(); toast('Your phone\'s storage for Setpoint is almost full. Back up, then remove old photos.'); }
    }).catch(function () {});
  }
  function storeLine() { if (!storeEst || !storeEst.usage) return 'Checking…'; const mb = function (b) { return b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : Math.max(0.1, b / 1e6).toFixed(b < 1e7 ? 1 : 0) + ' MB'; }; return mb(storeEst.usage) + ' used' + (storeEst.quota ? ' of ' + mb(storeEst.quota) + ' available' : ''); }
  function renderSettings() {
    renderAccount();
    if ($('#storeSub')) $('#storeSub').textContent = storeLine();
    if (state.ui.tab === 'you') renderYouHero();
    const s = state.settings;
    $$('[data-setting]').forEach(function (seg) { $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === s[seg.dataset.setting]); }); });
    $('#hapticsToggle').checked = s.haptics;
    $('#numpadToggle').checked = !!s.numpad;
    $('#oledToggle').checked = !!s.oled;
    $('#explodeToggle').checked = !!s.explode;
    $('#autoAdjToggle').checked = s.autoAdjust;
    $('#fastToggle').checked = s.fasting;
    $('#lockRow').hidden = !lockSupported(); $('#lockToggle').checked = !!lockCfg();
    if ($('#themeVal')) $('#themeVal').textContent = (THEMES.find(function (t) { return t[0] === s.style; }) || THEMES[0])[1];
    $('#weekStartSel').value = String(s.weekStart); $('#weekStartVal').textContent = WEEKDAYS[s.weekStart];
    const tr = s.train, sp = trainSplit(); if ($('#trainSub')) $('#trainSub').textContent = tr && tr.days.length ? weekOrder().filter(function (d) { return tr.days.indexOf(d) >= 0; }).map(function (d) { return dayAbbr(d); }).join(', ') + (sp ? ' · +' + fmtKcal(roundKcal(sp.tx)) + ' / −' + fmtKcal(roundKcal(sp.rx)) + ' kcal' : '') : 'Eat more on the days you train';
    if ($('#goalRowVal')) $('#goalRowVal').textContent = s.goalKg ? fmtW(s.goalKg) + ' ' + unit() : 'Not set';
    $('#versionLbl').textContent = 'v' + APP_VERSION;
    $('#youFoot').textContent = 'Setpoint v' + APP_VERSION;
    const nf = state.myFoods.length + state.recipes.length + state.meals.length;
    if ($('#youFoodsSub')) $('#youFoodsSub').textContent = nf ? [[state.myFoods.length, 'food'], [state.recipes.length, 'recipe'], [state.meals.length, 'meal']].filter(function (x) { return x[0]; }).map(function (x) { return x[0] + ' ' + x[1] + (x[0] === 1 ? '' : 's'); }).join(' · ') : 'Your foods, recipes and meals';
    const pl = makePlan(activeEnergy()); $('#youTargetSub').textContent = pl ? fmtKcal(roundKcal(pl.target)) + ' kcal · ' + pl.protein + ' g protein' : 'Calories, macros, activity';
  }

  function renderAll() { applyMeals(); recordGoal(); renderToday(); renderProgress(); renderBody(); renderNutrition(); renderChart(); renderEnergy(); renderSettings(); renderFoods(); }

  /* ================= Going back ================= */
  // Each level you can go back from (a page inside a tab, a list in Foods, an open sheet) is one step back.
  // Android and browsers: each step is a history entry, so the phone's back button or gesture goes back one level.
  // iPhone: no history entries (iOS would flash an old snapshot of the page while swiping); instead the app has its
  // own edge swipe that shows the real screen underneath and follows your finger.
  const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  // Home-screen app on iPhone: newer iOS draws the app under the clock even with the "default" status bar, but still
  // reports a top safe area of 0. Then use the real status bar height, so sheets and headers stay below it.
  (function safeTop() {
    if (!IOS) return;
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;left:0;height:0;visibility:hidden;padding-top:env(safe-area-inset-top,0px)';
    const fix = function () {
      const root = document.documentElement; root.style.removeProperty('--safe-t');
      document.body.appendChild(probe); const env = parseFloat(getComputedStyle(probe).paddingTop) || 0; probe.remove();
      const sh = Math.max(screen.width, screen.height), portrait = innerHeight > innerWidth;
      // the app covers the whole screen (so the clock sits on top of it) but iOS says there's no inset
      if (env < 20 && portrait && innerHeight >= sh - 2) root.style.setProperty('--safe-t', (sh >= 852 ? 59 : sh >= 812 ? 50 : 20) + 'px');
    };
    fix(); addEventListener('resize', fix); addEventListener('orientationchange', function () { setTimeout(fix, 300); });
  })();
  const NAV_ID = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const navStack = [];
  let navSkip = 0, navQueue = 0, navPopAt = 0, navInstant = false;
  if (!IOS) try { history.replaceState({ navBase: NAV_ID }, ''); } catch (e) {}
  function navPush(tag) {
    navStack.push(tag);
    if (IOS) return;
    if (navSkip) navQueue++; else history.pushState({ nav: navStack.length, id: NAV_ID }, ''); // wait for our own history.back() to finish first
  }
  // Left a level with a button on screen: take its step away too.
  function navDrop(tag) {
    const i = navStack.lastIndexOf(tag); if (i < 0) return;
    navStack.splice(i, 1);
    if (IOS) return;
    if (navQueue) { navQueue--; return; }
    navSkip++; history.back();
  }
  // Go back one level (from the phone's back, or the iPhone edge swipe).
  function navBack(anim) {
    const top = navStack.pop(); if (!top) return;
    navInstant = !(anim && top !== 'sheet'); // the phone's back button moves pages like a back tap; a swipe has already moved them
    try {
      if (top === 'sheet') {
        // A sheet with steps (search → amount) goes back a step; otherwise it closes.
        const b = sheet.classList.contains('open') && $('#sheetBody .sheet-head .back-btn:not(.sheet-x):not([data-close])');
        if (b && b.offsetParent) { navPush('sheet'); b.click(); } else closeSheet(true);
      } else if (top === 'page') goBack(true);
      else if (top === 'tv') tgClose(true);
      else if (top === 'fv') pageMove('pop', function () { foodsView = null; $('#mfQ').value = ''; renderFoods(); });
    } finally { navInstant = false; }
  }
  window.addEventListener('popstate', function (e) {
    if (IOS) return;
    navPopAt = Date.now();
    if (navSkip) { navSkip--; if (!navSkip) for (; navQueue; navQueue--) history.pushState({ nav: navStack.length, id: NAV_ID }, ''); return; }
    const st = e.state || {};
    if (!navStack.length) { if (st.nav && st.id !== NAV_ID) history.back(); return; } // a level left over from before a reload: skip it
    navBack(true);
  });
  // iPhone: swipe from the edge to go back. The screen you're going back to is shown underneath as you drag.
  // Smoothness: moves are drawn once per frame on the GPU, flicks use your finger's latest speed, and the finish
  // carries that speed on instead of starting a fresh animation.
  (function edgeSwipe() {
    if (!IOS) return;
    const EDGE = 28, PAR = 0.3;
    let x0 = 0, y0 = 0, on = false, el = null, under = null, wrap = null, home = null, dim = null, shade = null, dx = 0, kind = '', raf = 0, busy = false;
    const fs = fingerSpeed();
    const rtl = function () { return document.documentElement.dir === 'rtl'; };
    const atEdge = function (x) { return (rtl() ? innerWidth - x : x) <= EDGE; };
    const sgn = function () { return rtl() ? -1 : 1; };
    // The swipe stays inside the app: a touch that starts at the edge isn't for card swipers or swipe-to-reveal rows.
    document.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch' && navStack.length && atEdge(e.clientX)) e.stopPropagation(); }, true);
    const mkUnder = function (inner) {
      wrap = document.createElement('div'); wrap.className = 'edge-under' + (document.documentElement.classList.contains('tabs-top') ? ' top' : '');
      wrap.appendChild(inner); dim = document.createElement('div'); dim.className = 'edge-dim'; wrap.appendChild(dim);
      document.body.appendChild(wrap); under = wrap;
    };
    const begin = function () {
      if (pageRun) pageRun.end(); // a page still sliding in: it finishes first, then the swipe takes it from there
      kind = navStack[navStack.length - 1];
      if (kind === 'sheet') el = sheet.classList.contains('open') ? sheet : null;
      else {
        el = document.querySelector('main'); if (!el) return;
        if (kind === 'fv' && fvSnap) { // a list in Foods: the Foods page goes underneath
          const ph = $('#panel-foods .page-head').cloneNode(true), pn = document.createElement('div');
          ph.hidden = false; $$('[id]', ph).forEach(function (x) { x.removeAttribute('id'); });
          pn.className = 'tab-panel'; pn.appendChild(ph); pn.insertAdjacentHTML('beforeend', '<div>' + fvSnap + '</div>');
          home = null; mkUnder(pn);
        } else if (kind === 'tv' && tvSnap) { // a page inside Targets: the Targets menu goes underneath
          const ph = $('#panel-targets .page-head').cloneNode(true), pn = document.createElement('div');
          $$('[id]', ph).forEach(function (x) { x.removeAttribute('id'); }); const h1 = ph.querySelector('h1'); if (h1) h1.textContent = typeof tr === 'function' && state.settings.lang === 'ar' ? tr('Plan') || 'Plan' : 'Plan';
          pn.className = 'tab-panel'; pn.appendChild(ph); pn.insertAdjacentHTML('beforeend', '<div>' + tvSnap + '</div>');
          home = null; mkUnder(pn);
        } else if (kind === 'page') { // the page you'll land on, in its own layer
          const t = state.ui.tab, to = t === 'targets' || t === 'settings' ? 'you' : lastMain, p = $('#panel-' + to);
          if (to === 'you') renderYouHero();
          if (p && p.hidden) { home = { parent: p.parentNode, next: p.nextSibling }; p.hidden = false; mkUnder(p); }
        }
        shade = document.createElement('div'); shade.className = 'edge-shade' + (rtl() ? ' rtl' : ''); document.body.appendChild(shade);
      }
      if (!el) return;
      el.classList.add('edge-drag'); el.style.transition = 'none';
      if (under) under.style.transition = 'none';
      if (kind === 'sheet') scrim.style.transition = 'none';
    };
    const paint = function () {
      raf = 0; if (!el) return;
      const d = dx, k = Math.min(1, d / innerWidth), x = sgn() * d;
      el.style.transform = d ? 'translate3d(' + x + 'px,0,0)' : '';
      if (shade) shade.style.transform = 'translate3d(' + x + 'px,0,0)';
      if (under) under.style.transform = 'translate3d(' + (-sgn() * innerWidth * PAR * (1 - k)) + 'px,0,0)';
      if (dim) dim.style.opacity = String(0.22 * (1 - k));
      if (kind === 'sheet') scrim.style.opacity = String(1 - k);
    };
    const clean = function () {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (el) { el.style.transition = 'none'; el.style.transform = ''; el.classList.remove('edge-drag'); }
      if (wrap) { const p = wrap.firstElementChild; if (p && home) { home.parent.insertBefore(p, home.next); p.hidden = ('panel-' + state.ui.tab) !== p.id; settleAnims(p); } wrap.remove(); }
      if (shade) shade.remove();
      scrim.style.transition = ''; scrim.style.opacity = '';
      const e1 = el; el = null; under = null; wrap = null; home = null; dim = null; shade = null; busy = false;
      if (e1) requestAnimationFrame(function () { e1.style.transition = ''; });
    };
    // Finish (or spring back) from where the finger let go: one spring for the page, its shadow, the page underneath
    // and the dimming, starting at the finger's speed.
    const settle = function (go, v) {
      busy = true;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      const W = innerWidth, sg = sgn(), target = go ? W : 0, k0 = Math.min(1, dx / W), k1 = go ? 1 : 0;
      const tx = function (d) { return { transform: 'translate3d(' + sg * d + 'px,0,0)' }; }, ux = function (k) { return { transform: 'translate3d(' + (-sg * W * PAR * (1 - k)) + 'px,0,0)' }; };
      const parts = [];
      if (el) parts.push([el, tx(dx), tx(target)]);
      if (shade) parts.push([shade, tx(dx), tx(target)]);
      if (under) parts.push([under, ux(k0), ux(k1)]);
      if (dim) parts.push([dim, { opacity: 0.22 * (1 - k0) }, { opacity: 0.22 * (1 - k1) }]);
      if (kind === 'sheet') parts.push([scrim, { opacity: 1 - k0 }, { opacity: 1 - k1 }]);
      parts.forEach(function (q) { q[0].style.transition = 'none'; });
      const done = function () { if (go) { buzz('light'); navBack(); } clean(); };
      if (calmMotion()) { done(); return; }
      springGroup(parts, { response: go ? 0.36 : 0.34, damping: 1, v: go ? v : -v, dist: Math.abs(target - dx), noOver: true }).onEnd = done;
    };
    document.addEventListener('touchstart', function (e) {
      on = false; if (e.touches.length !== 1 || !navStack.length || dragActive || el || busy) return;
      const t = e.touches[0]; if (!atEdge(t.clientX)) return;
      x0 = t.clientX; y0 = t.clientY; dx = 0; on = true; fs.reset(); fs.add(0, e.timeStamp);
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!on) return;
      const t = e.touches[0], d = (t.clientX - x0) * sgn(), dy = Math.abs(t.clientY - y0);
      if (!el) { if (dy > 10 && dy > d) { on = false; return; } if (d < 6) return; begin(); if (!el) { on = false; return; } }
      dx = Math.max(0, d); fs.add(dx, e.timeStamp);
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (!on) return; on = false; if (!el) return;
      // the finger's speed as it let go (px/ms): a quick flick counts even if the swipe was short; 0 if it rested first
      const lt = e.changedTouches[0]; if (lt) { dx = Math.max(0, (lt.clientX - x0) * sgn()); fs.add(dx, e.timeStamp); }
      const v = fs.get(e.timeStamp);
      settle((v > 0.5 && dx > 40) || (dx > innerWidth * 0.45 && v > -0.2), v);
    }, { passive: true });
    // The phone took the touch over: put things back, never go back from here.
    document.addEventListener('touchcancel', function () { if (!on) return; on = false; if (el) settle(false, 1); }, { passive: true });
  })();

  // Finish (not replay) the entrance animations of something that's already on screen, e.g. a page that moved
  // into place: CSS restarts an element's animations whenever it's shown or moved.
  function settleAnims(root) {
    if (!root || !document.getAnimations) return;
    root.getBoundingClientRect(); // let the browser start them first
    document.getAnimations().forEach(function (a) {
      const t = a.effect && a.effect.target, tm = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
      if (!t || !root.contains(t) || !tm || tm.iterations === Infinity || !window.CSSAnimation || !(a instanceof CSSAnimation)) return;
      try { a.finish(); } catch (e) {}
    });
  }
  // Tapping into a page, or back out of it, moves like iPhone navigation, with the same layers as the edge swipe:
  // forward, the new page slides in over the one you were on, which drifts a third of the way and dims; back is the
  // reverse. A page you go back to is where you left it. Skipped for the phone's own swipe and for reduced motion.
  const pageScroll = {};
  let pageRun = null;
  function pageKey() { const t = state.ui.tab; return t + (t === 'foods' && foodsView ? ':' + foodsView : '') + (t === 'targets' && tgView ? ':' + tgView : ''); }
  // Only what's on screen goes into the copy: anything that starts below the bottom edge is emptied and
  // hidden there (nothing on screen moves, and the browser has far less to lay out as the page slides).
  // Only in plain top-to-bottom layouts, where hiding what comes later can't move what came before.
  function snapTrim(o, c, depth) {
    const cs = getComputedStyle(o), d = cs.display;
    if (!(d === 'block' || d === 'flow-root' || (d === 'flex' && cs.flexDirection === 'column' && /^(normal|flex-start|start)$/.test(cs.justifyContent)))) return;
    const cut = innerHeight + 24, ok = o.children, ck = c.children;
    if (ok.length !== ck.length) return;
    for (let i = ok.length - 1; i >= 0; i--) {
      const k = ok[i], r = k.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (r.top > cut) { const ps = getComputedStyle(k).position; if (ps === 'static' || ps === 'relative') { ck[i].textContent = ''; ck[i].style.setProperty('display', 'none', 'important'); } }
      else if (r.bottom > cut && depth < 6 && k.children.length > 1) snapTrim(k, ck[i], depth + 1);
    }
  }
  // The ids and data-… attributes the stylesheet styles by (read from it once).
  let cssHooks = null;
  function snapHooks() {
    if (cssHooks) return cssHooks;
    const ids = {}, attrs = {};
    const scan = function (rules) { for (let i = 0; i < rules.length; i++) { const r = rules[i], t = r.selectorText;
      if (t) { (t.match(/#[A-Za-z][\w-]*/g) || []).forEach(function (x) { if (!/^#panel-/.test(x)) ids[x.slice(1)] = 1; }); (t.match(/\[data-[\w-]+/g) || []).forEach(function (x) { attrs[x.slice(1)] = 1; }); }
      if (r.cssRules) scan(r.cssRules); } };
    for (let i = 0; i < document.styleSheets.length; i++) { try { scan(document.styleSheets[i].cssRules); } catch (e) {} }
    cssHooks = { ids: ids, attrs: attrs };
    return cssHooks;
  }
  function pageMove(dir, apply) {
    const back = dir === 'pop', from = pageKey(), y = window.scrollY;
    if (back) delete pageScroll[from]; else pageScroll[from] = y;
    // (after the edge swipe the page underneath was shown from the top, so it stays at the top)
    const landed = function () { const k = pageKey(); if (back && !navInstant && pageScroll[k] != null) window.scrollTo(0, pageScroll[k]); else window.scrollTo(0, 0); delete pageScroll[k]; };
    const main = document.querySelector('main'), cur = main && $$('.tab-panel', main).filter(function (x) { return !x.hidden; })[0];
    // two moves in the same tap (Plan, then one of its pages): the second just changes what's sliding in
    if (pageRun && performance.now() - pageRun.t0 < 80) { apply(); landed(); settleAnims(main); return; }
    if (pageRun) pageRun.end();
    if (navInstant || calmMotion() || document.hidden || !cur) { apply(); landed(); return; }
    const rtl = document.documentElement.dir === 'rtl', sg = rtl ? -1 : 1, W = innerWidth, PAR = 0.3, MS = 460, EASE = 'cubic-bezier(.32,.72,0,1)';
    // a still copy of the page you're leaving, drawn exactly where it is on screen
    // (ids and the app's data-… hooks are taken off it, so nothing can find it and mistake it for the real page,
    // except the ones the stylesheet styles by, so it looks exactly the same)
    const snap = cur.cloneNode(true), hk = snapHooks();
    snapTrim(cur, snap, 0);
    [snap].concat($$('*', snap)).forEach(function (el) { for (let i = el.attributes.length - 1; i >= 0; i--) { const n = el.attributes[i].name;
      if (n === 'for' || n === 'name' || (n === 'id' && (!hk.ids[el.id] || el === snap)) || (n.indexOf('data-') === 0 && !hk.attrs[n])) el.removeAttribute(n); } });
    // what copying leaves behind: a menu's current choice and anything drawn on a canvas
    const sels = $$('select', cur), sels2 = $$('select', snap); if (sels.length === sels2.length) sels.forEach(function (x, i) { sels2[i].selectedIndex = x.selectedIndex; });
    const cvs = $$('canvas', cur), cvs2 = $$('canvas', snap); if (cvs.length === cvs2.length) cvs.forEach(function (x, i) { try { if (x.width && x.height) cvs2[i].getContext('2d').drawImage(x, 0, 0); } catch (e) {} });
    snap.style.transform = 'translate3d(0,' + (-y) + 'px,0)';
    const layer = document.createElement('div'); layer.className = (back ? 'page-over' : 'edge-under') + ' snap' + (document.documentElement.classList.contains('tabs-top') ? ' top' : '');
    layer.setAttribute('aria-hidden', 'true'); layer.inert = true; layer.appendChild(snap);
    const dim = document.createElement('div'); dim.className = back ? 'page-dim' : 'edge-dim';
    const shade = document.createElement('div'); shade.className = 'edge-shade' + (rtl ? ' rtl' : '') + (back ? ' over' : '');
    if (back) document.body.appendChild(dim); else layer.appendChild(dim);
    document.body.appendChild(layer); document.body.appendChild(shade);
    main.classList.add('edge-drag', 'pm');
    try { apply(); } finally { landed(); }
    settleAnims(main);
    const put = function (el, x, tr) { el.style.transition = tr || 'none'; el.style.transform = 'translate3d(' + x + 'px,0,0)'; };
    // (the edge shadow fades in as the page arrives and out as it leaves, so it never appears at once at the edge)
    if (back) { put(main, -sg * W * PAR); put(layer, 0); put(shade, 0); shade.style.opacity = '1'; dim.style.opacity = '.22'; }
    else { put(main, sg * W); put(shade, sg * W); shade.style.opacity = '0'; put(layer, 0); dim.style.opacity = '0'; }
    main.getBoundingClientRect();
    const TR = 'transform ' + MS + 'ms ' + EASE, TRS = TR + ', opacity ' + (back ? Math.round(MS * 0.9) + 'ms ease' : Math.round(MS * 0.5) + 'ms ease 20ms');
    dim.style.transition = 'opacity ' + MS + 'ms ease';
    if (back) { put(main, 0, TR); put(layer, sg * W, TR); put(shade, sg * W, TRS); shade.style.opacity = '0'; dim.style.opacity = '0'; }
    else { put(main, 0, TR); put(shade, 0, TRS); shade.style.opacity = '1'; put(layer, -sg * W * PAR, TR); dim.style.opacity = '.22'; }
    let over = false, tm = 0;
    const run = { t0: performance.now(), end: function () {
      if (over) return; over = true; clearTimeout(tm);
      layer.remove(); shade.remove(); dim.remove();
      main.style.transition = 'none'; main.style.transform = ''; main.classList.remove('edge-drag', 'pm');
      requestAnimationFrame(function () { main.style.transition = ''; });
      if (pageRun === run) pageRun = null;
    } };
    pageRun = run; tm = setTimeout(run.end, MS + 40);
  }
  /* ================= Sheet ================= */
  const sheet = $('#sheet'), scrim = $('#scrim'), sheetBody = $('#sheetBody');
  let sheetOnClose = null, lastFocus = null;
  let sheetHist = false;
  sheet.addEventListener('scroll', function () {
    const sb = sheet.querySelector('.af-sticky'); if (!sb) return;
    sb.classList.toggle('stuck', sheet.scrollTop > sb.offsetTop - parseFloat(sb.style.top || 0) - 2);
  }, { passive: true });
  let tallOutT = 0, sheetRun = null;
  // A sheet let go of mid-drag is still on its spring: anything that opens or closes a sheet takes over from there.
  function sheetSettle() {
    if (!sheetRun) return;
    const r = sheetRun; sheetRun = null; r.stop();
    sheet.classList.remove('dragging'); sheet.style.pointerEvents = ''; scrim.style.transition = '';
    if (r.closing) { r.onEnd = null; closeSheet(); }
    scrim.style.opacity = '';
  }
  function openSheet(html, onMount, onClose) {
    sheetSettle();
    if (!sheet.classList.contains('open')) { sheetOpenAt = performance.now(); sheetTitleWas = null; }
    if (sheet.classList.contains('open') && sheetOnClose) { const cb = sheetOnClose; sheetOnClose = null; cb(); }
    lastFocus = document.activeElement;
    hideToast();
    if (sheet.classList.contains('auto-tall') || sheet.classList.contains('tall-out')) { clearTimeout(tallOutT); sheet.classList.remove('tall', 'auto-tall', 'tall-out'); }
    sheetBody.innerHTML = html;
    sheet.scrollTop = 0;
    sheetOnClose = onClose || null;
    sheet.style.transform = '';
    sheet.classList.add('open'); scrim.classList.add('open');
    document.body.style.overflow = 'hidden';
    $$('main, .tabbar').forEach(function (el) { el.inert = true; });
    if (!sheetHist) { sheetHist = true; navPush('sheet'); }
    if (onMount) onMount(sheetBody);
    autoTall();
    addSheetX();
  }
  // A small menu under a ⋯ button. items: [{ label, danger, run }]
  function popMenu(anchor, items) {
    closePop();
    const r = anchor.getBoundingClientRect(), m = document.createElement('div');
    m.className = 'pop-menu'; m.setAttribute('role', 'menu');
    m.innerHTML = items.map(function (it, i) { return '<button type="button" role="menuitem" data-pi="' + i + '"' + (it.danger ? ' class="danger"' : '') + '>' + esc(it.label) + '</button>'; }).join('');
    document.body.appendChild(m);
    const w = m.offsetWidth, top = Math.min(innerHeight - m.offsetHeight - 12, r.bottom + 6), left = Math.max(12, Math.min(innerWidth - w - 12, r.right - w));
    m.style.top = top + 'px'; m.style.left = left + 'px';
    // it grows out of the button that opened it (and shrinks back into it), whichever side that ends up on
    m.style.transformOrigin = Math.round(r.left + r.width / 2 - left) + 'px ' + Math.round(r.top + r.height / 2 - top) + 'px';
    requestAnimationFrame(function () { m.classList.add('open'); });
    $$('[data-pi]', m).forEach(function (b) { b.addEventListener('click', function () { const it = items[+b.dataset.pi]; closePop(); buzz('light'); it.run(); }); });
    setTimeout(function () { document.addEventListener('pointerdown', popAway, true); }, 0);
  }
  function popAway(e) { if (!e.target.closest('.pop-menu')) closePop(); }
  function closePop() {
    document.removeEventListener('pointerdown', popAway, true);
    // shrinks back into its button and fades, instead of vanishing at once
    $$('.pop-menu:not(.closing)').forEach(function (m) { m.classList.add('closing'); m.classList.remove('open'); setTimeout(function () { m.remove(); }, calmMotion() ? 0 : 220); });
  }
  // ⋯ in a sheet header: the actions are the buttons in that screen's hidden .menu-src.
  sheet.addEventListener('click', function (e) {
    const b = e.target.closest('[data-more]'); if (!b) return;
    const scope = b.closest('#afRoot, #catRoot, #sheetBody'), src = scope && scope.querySelector('.menu-src'); if (!src) return;
    const items = $$('button', src).filter(function (x) { return !x.hasAttribute('data-off'); }).map(function (x) { return { label: x.dataset.label || x.textContent, danger: x.classList.contains('danger'), run: function () { x.click(); } }; });
    if (items.length) popMenu(b, items);
  });
  // Full-screen sheets close with a ‹ at the top left, like every other page (headers that re-render get it back too).
  function addSheetX() {
    if (!sheet.classList.contains('tall')) return;
    $$('.sheet-head', sheetBody).forEach(function (h) {
      if (h.querySelector('.back-btn, .sheet-x')) return;
      h.insertAdjacentHTML('afterbegin', '<button type="button" class="icon-btn back-btn sheet-x" aria-label="Close">' + BACK_IC + '</button>');
      h.firstElementChild.addEventListener('click', function () { closeSheet(); });
    });
  }
  // A sheet too long to fit (it would reach the clock at the top) opens as a full page with an X instead.
  function autoTall() {
    if (!sheet.classList.contains('open') || sheet.classList.contains('tall')) return;
    if (sheet.scrollHeight > sheet.clientHeight + 2) { sheet.classList.add('tall', 'auto-tall'); sheet.scrollTop = 0; }
  }
  // Moving between a sheet's steps (search → amount, the welcome steps, plan → add) slides the new step in: from the
  // side you're heading to, or from the other side when you went back. Re-drawing the same step doesn't move it.
  let sheetOpenAt = 0, sheetTitleWas = null, sheetBackAt = 0, sheetH = 0, sheetSize = null;
  sheet.addEventListener('click', function (e) { if (e.target.closest('.sheet-head .back-btn:not(.sheet-x)')) sheetBackAt = performance.now(); }, true);
  // Like iPhone: going forward, the new step slides in over the old one, which moves a little way off and dims;
  // going back, the step you're leaving slides away to the side and the one before comes back from underneath.
  let sheetScrollY = 0, stepRun = null;
  sheet.addEventListener('scroll', function () { sheetScrollY = sheet.scrollTop; }, { passive: true });
  // (in Arabic the title is translated a moment after it's drawn: both spellings count as the same step)
  const stepName = function (s) { return (AR && typeof tr === 'function' && tr(s)) || s; };
  const sheetStep = function (recs) {
    const t = $('#sheetTitle', sheetBody), txt = t ? stepName(t.textContent.trim()).trim() : null;
    if (txt == null || txt === sheetTitleWas) return;
    const was = sheetTitleWas, oldY = sheetScrollY; sheetTitleWas = txt; sheetScrollY = sheet.scrollTop;
    if (was == null || navInstant || calmMotion() || !sheet.classList.contains('open') || performance.now() - sheetOpenAt < 400) return;
    const head = t.closest('.sheet-head'), view = head && head.parentElement; if (!view || !view.animate) return;
    const back = performance.now() - sheetBackAt < 600, sg = document.documentElement.dir === 'rtl' ? -1 : 1;
    if (stepRun) stepRun();
    // the step you're leaving: what was just taken out of the sheet
    let gone = [];
    (recs || []).forEach(function (r) { if (r.target === view) r.removedNodes.forEach(function (n) { gone.push(n); }); });
    if (!gone.length) (recs || []).forEach(function (r) { if (r.target === view.parentNode && [].indexOf.call(r.addedNodes, view) >= 0) r.removedNodes.forEach(function (n) { gone.push(n); }); });
    gone = gone.filter(function (n) { return n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()); });
    if (!gone.length) { view.animate([{ opacity: 0, transform: 'translateX(' + (back ? -1 : 1) * sg * 22 + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' }); return; }
    const ghost = document.createElement('div'), hk = snapHooks(), bg = getComputedStyle(sheet).backgroundColor, pad = parseFloat(getComputedStyle(sheet).paddingLeft) || 0;
    ghost.className = 'sheet-ghost ' + view.className; ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
    if (view.id && hk.ids[view.id]) ghost.id = view.id; // (styled by its id; the live step comes first, so lookups still find that one)
    const vs = getComputedStyle(view); ['display', 'flexDirection', 'alignItems', 'justifyContent', 'gap'].forEach(function (k) { ghost.style[k] = vs[k]; });
    gone.forEach(function (n) { ghost.appendChild(n); });
    $$('*', ghost).forEach(function (el) { for (let i = el.attributes.length - 1; i >= 0; i--) { const n = el.attributes[i].name; if (n === 'for' || n === 'name' || (n === 'id' && !hk.ids[el.id]) || (n.indexOf('data-') === 0 && !hk.attrs[n])) el.removeAttribute(n); } });
    const vt = view.offsetTop - oldY; // where the old step's top was on screen
    ghost.style.cssText += ';position:absolute;margin:0;pointer-events:none;top:' + (vt + sheet.scrollTop) + 'px;left:' + view.offsetLeft + 'px;width:' + view.offsetWidth + 'px;min-height:' + Math.max(0, sheet.clientHeight - vt) + 'px;box-sizing:border-box;z-index:' + (back ? 3 : 1) + ';background:' + bg + ';box-shadow:0 0 0 ' + pad + 'px ' + bg;
    sheet.appendChild(ghost);
    const W = sheet.clientWidth, MS = 420, EASE = 'cubic-bezier(.32,.72,0,1)', keep = view.style.cssText;
    view.style.position = 'relative'; view.style.zIndex = back ? '1' : '2'; view.style.background = bg; view.style.boxShadow = '0 0 0 ' + pad + 'px ' + bg;
    const sx = sheet.style.overflowX; sheet.style.overflowX = 'hidden';
    const far = sg * W, near = -sg * W * 0.3;
    const a1 = back ? view.animate([{ transform: 'translateX(' + near + 'px)', opacity: 0.55 }, { transform: 'none', opacity: 1 }], { duration: MS, easing: EASE })
      : view.animate([{ transform: 'translateX(' + far + 'px)' }, { transform: 'none' }], { duration: MS, easing: EASE });
    const a2 = back ? ghost.animate([{ transform: 'none' }, { transform: 'translateX(' + far + 'px)' }], { duration: MS, easing: EASE, fill: 'forwards' })
      : ghost.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(' + near + 'px)', opacity: 0.55 }], { duration: MS, easing: EASE, fill: 'forwards' });
    let over = false;
    const end = stepRun = function () { if (over) return; over = true; if (stepRun === end) stepRun = null; ghost.remove(); a1.cancel(); view.style.cssText = keep; sheet.style.overflowX = sx; };
    a1.onfinish = end; a2.onfinish = end;
  };
  new MutationObserver(function (recs) { autoTall(); addSheetX(); sheetStep(recs); }).observe(sheetBody, { childList: true, subtree: true });
  // Sheets change size smoothly: when what's inside grows or shrinks (the next step, a message, a longer list), the
  // top edge glides to its new place instead of jumping.
  if (window.ResizeObserver) new ResizeObserver(function () {
    const open = sheet.classList.contains('open');
    const from = sheetSize ? sheet.getBoundingClientRect().height : sheetH;
    if (sheetSize) { sheetSize.cancel(); sheetSize = null; }
    const to = sheet.offsetHeight; sheetH = open ? to : 0;
    if (!open || !from || Math.abs(to - from) < 3 || sheet.classList.contains('tall') || sheet.classList.contains('dragging') || calmMotion() || performance.now() - sheetOpenAt < 480 || !sheet.animate) return;
    sheet.style.overflowY = 'hidden';
    sheetSize = sheet.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: 380, easing: 'cubic-bezier(.32,.72,0,1)' });
    const a = sheetSize; a.onfinish = a.oncancel = function () { if (sheetSize === a) sheetSize = null; if (!sheetSize) sheet.style.overflowY = ''; };
  }).observe(sheetBody);
  function closeSheet(fromBack) {
    closePop();
    if (stepRun) stepRun();
    if (sheetRun && !sheetRun.closing) sheetSettle(); // springing back into place: close from where it is now
    sheet.classList.remove('dragging');
    if (sheetSize) { sheetSize.cancel(); sheetSize = null; }
    if (!sheet.classList.contains('open')) return;
    if (sheetHist) { sheetHist = false; if (fromBack !== true) navDrop('sheet'); }
    if (document.activeElement && sheet.contains(document.activeElement)) document.activeElement.blur();
    // Back from the phone (its own swipe already slid things away): close at once instead of sliding down after it.
    if (navInstant) { sheet.style.transition = scrim.style.transition = 'none'; requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.style.transition = scrim.style.transition = ''; }); }); }
    const wasTall = sheet.classList.contains('tall');
    sheet.classList.remove('open'); scrim.classList.remove('open');
    // back to a normal sheet once it has slid away
    if (sheet.classList.contains('auto-tall')) setTimeout(function () { if (!sheet.classList.contains('open')) sheet.classList.remove('tall', 'auto-tall'); }, navInstant ? 0 : 360);
    sheet.style.transform = '';
    document.body.style.overflow = '';
    $$('main, .tabbar').forEach(function (el) { el.inert = false; });
    const cb = sheetOnClose; sheetOnClose = null;
    if (cb) cb();
    // A full-screen sheet keeps its full-screen look while it slides away (each one's own close step takes it
    // off at once, which would first snap it into a smaller card with rounded corners).
    if (wasTall && !navInstant && !sheet.classList.contains('open')) {
      sheet.classList.add('tall', 'tall-out'); clearTimeout(tallOutT);
      tallOutT = setTimeout(function () { if (!sheet.classList.contains('open')) sheet.classList.remove('tall', 'tall-out', 'auto-tall'); }, 360);
    }
    if (lastFocus && lastFocus.focus && window.matchMedia('(hover: hover)').matches) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
    maybeReload();
  }
  scrim.addEventListener('click', function () { closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  // Cards that act like buttons open with Enter or Space too.
  document.addEventListener('keydown', function (e) { if (!e.defaultPrevented && (e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('div[role="button"][tabindex]')) { e.preventDefault(); e.target.click(); } });
  // Pull a sheet down to close it, like iPhone: it follows your finger from anywhere on it (when it's scrolled to the
  // top) or from the handle, pulling it up gives a little, and the dimming fades with it. Letting go finishes the
  // move at your finger's speed: closed if you pulled it far or flicked it down, otherwise it springs back into
  // place. You can catch it again while it's moving, even while it's still opening. Lists, number pads, swipers
  // and text fields keep their own gestures.
  (function sheetDrag() {
    let y0 = 0, x0 = 0, base = 0, dy = 0, on = false, live = false, moving = false, handle = false, noClick = 0;
    const sp = fingerSpeed();
    sheet.addEventListener('click', function (e) { if (performance.now() - noClick < 350) { e.preventDefault(); e.stopPropagation(); } }, true);
    const vis = function (y) { return y >= 0 ? y : -rubber(-y, 44); }; // pulled up: a little give
    const place = function (y) {
      dy = y; sheet.style.transform = 'translate3d(0,' + vis(y).toFixed(2) + 'px,0)';
      scrim.style.opacity = String(Math.max(0, Math.min(1, 1 - Math.max(0, y) / Math.max(260, sheet.offsetHeight))));
    };
    const isMoving = function () { return !!sheetRun || sheet.getAnimations().some(function (a) { return a.transitionProperty === 'transform' && a.playState === 'running'; }); };
    const goLive = function () {
      // stop it exactly where it is (it may still be opening or springing) and carry on from there with the finger
      if (sheetRun) { sheetRun.stop(); sheetRun = null; sheet.style.pointerEvents = ''; }
      const y = nowAt(sheet).y;
      sheet.classList.add('dragging'); scrim.style.transition = 'none';
      base = y >= 0 ? y : -((1 / (1 - Math.min(0.95, -y / 44)) - 1) * 44 / 0.55); place(base); // (stretched up: where the finger would be)
      live = true;
    };
    const begin = function (y, x, t, fromHandle) {
      if (!sheet.classList.contains('open') || sheet.classList.contains('tall') || dragActive) return false;
      y0 = y; x0 = x; on = true; live = false; handle = fromHandle; moving = isMoving(); sp.reset(); sp.add(0, t);
      return true;
    };
    const move = function (y, x, t, ev) {
      if (!on) return;
      if (!sheet.classList.contains('open')) { on = false; live = false; return; } // closed some other way meanwhile
      const d = y - y0, ax = Math.abs(x - x0);
      if (!live) {
        if (moving) { // a sheet that's still moving: take hold as soon as the finger moves (a tap doesn't stop it)
          if (Math.abs(d) < 4 && ax < 4) return;
          if (ax > Math.abs(d)) { on = false; return; }
          goLive(); y0 = y;
        } else if (handle) {
          if (Math.abs(d) < 4) return;
          goLive(); y0 = y;
        } else {
          if (ax >= Math.abs(d)) { if (ax > 6) on = false; return; } // sideways (or not clearly up or down yet): not ours
          const top = sheet.scrollTop <= 0, scrolls = sheet.scrollHeight > sheet.clientHeight + 1;
          if (d > 0 && !top) { if (ev && !ev.cancelable) on = false; return; } // the list scrolls first
          if (d < 0 && scrolls) { on = false; return; } // scrolling up through the list
          // down from the top (or up on a sheet with nothing to scroll): the sheet itself moves, not the page bounce
          if (ev && ev.cancelable) ev.preventDefault();
          if (Math.abs(d) < 8) return;
          goLive(); y0 = y;
        }
      }
      if (ev && ev.cancelable) ev.preventDefault();
      place(base + (y - y0)); sp.add(dy, t);
    };
    const finish = function (t, cancel) {
      if (!on) return; on = false; if (!live) return; live = false; noClick = performance.now();
      if (!sheet.classList.contains('open')) return;
      const v = cancel ? 0 : sp.get(t), h = sheet.offsetHeight, proj = dy + v * 200; // v: px/ms, + = down
      springSheet(!cancel && dy > 0 && v > -0.1 && (proj > h * 0.42 || (v > 0.5 && dy > 12)), v, h);
    };
    const springSheet = function (close, v, h) {
      const from = vis(dy), to = close ? h + 40 : 0, so = parseFloat(scrim.style.opacity), s0 = isNaN(so) ? 1 : so;
      sheet.style.pointerEvents = close ? 'none' : '';
      if (calmMotion()) { sheet.classList.remove('dragging'); scrim.style.transition = ''; if (close) { closeSheet(); scrim.style.opacity = ''; sheet.style.pointerEvents = ''; } else { sheet.style.transform = ''; scrim.style.opacity = ''; } return; }
      const run = sheetRun = springGroup([
        [sheet, { transform: 'translate3d(0,' + from + 'px,0)' }, { transform: 'translate3d(0,' + to + 'px,0)' }],
        [scrim, { opacity: s0 }, { opacity: close ? 0 : 1 }]
      ], { response: close ? 0.4 : 0.42, damping: close ? 1 : 0.86, v: close ? v : (from > 0 ? -v : v), dist: Math.abs(to - from), noOver: close });
      run.closing = close;
      run.onEnd = function () {
        if (sheetRun !== run) return; sheetRun = null;
        sheet.classList.remove('dragging'); scrim.style.transition = '';
        if (close) { closeSheet(); sheet.style.pointerEvents = ''; scrim.style.opacity = ''; }
        else { sheet.style.transform = ''; scrim.style.opacity = ''; }
      };
    };
    // touch anywhere on the sheet
    sheet.addEventListener('touchstart', function (e) {
      on = false;
      if (e.touches.length !== 1 || e.target.closest('#grabber, input, textarea, select, [contenteditable], .pager, .kp, .sw, .no-pull')) return;
      const t = e.touches[0]; begin(t.clientY, t.clientX, e.timeStamp, false);
    }, { passive: true });
    sheet.addEventListener('touchmove', function (e) { if (!on) return; const t = e.touches[0]; move(t.clientY, t.clientX, e.timeStamp, e); }, { passive: false });
    sheet.addEventListener('touchend', function (e) { const t = e.changedTouches[0]; if (on && live && t) { place(base + (t.clientY - y0)); sp.add(dy, e.timeStamp); } finish(e.timeStamp, false); }, { passive: true });
    sheet.addEventListener('touchcancel', function (e) { finish(e.timeStamp, true); }, { passive: true });
    // the handle (also with a mouse)
    const g = $('#grabber');
    g.addEventListener('pointerdown', function (e) { if (begin(e.clientY, e.clientX, e.timeStamp, true)) try { g.setPointerCapture(e.pointerId); } catch (x) {} });
    g.addEventListener('pointermove', function (e) { move(e.clientY, e.clientX, e.timeStamp, null); });
    g.addEventListener('pointerup', function (e) { if (on && live) { place(base + (e.clientY - y0)); sp.add(dy, e.timeStamp); } finish(e.timeStamp, false); });
    g.addEventListener('pointercancel', function (e) { finish(e.timeStamp, true); });
  })();
  // Keep sheets above the on-screen keyboard.
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const fit = function () {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      sheet.style.bottom = kb > 60 ? kb + 'px' : '0px';
      sheet.style.maxHeight = Math.round(vv.height - (sheet.classList.contains('tall') ? 0 : 24)) + 'px';
    };
    vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit);
  }

  /* ================= Toast ================= */
  let toastTimer = null, toastFn = null;
  // Undo is offered only when something was lost or replaced: deletes, clears, imports, restores, a replaced
  // weigh-in, an ended fast, removed categories. Everyday actions (adding, saving, ticking, moving) just confirm.
  const UNDO_KEEP = /^(Repeat items paused|Repeat items resumed|Ramadan mode off|Repeating |Repeat saved|Stopped repeating|Photo deleted|Hidden for today|Food saved · updated|Saved to My foods · updated|Recipe saved · updated|Amount changed|Merged|Fixed|Removed|Deleted|Meal deleted|Recipe deleted|Food deleted|Erased|Phase removed|Goal removed|Backup restored|Imported|Updated \d|Fast ended|Goal reached|Saved\. Food from removed|Back to the saved recipe)|cleared$/;
  function toast(msg, fn, label) {
    if (fn && !label && !UNDO_KEEP.test(msg)) fn = null;
    $('#toastMsg').textContent = msg;
    toastFn = fn || null;
    $('#toastBtn').hidden = !fn;
    $('#toastBtn').textContent = label || 'Undo';
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, fn ? 6000 : 2600);
  }
  function hideToast() { clearTimeout(toastTimer); $('#toast').classList.remove('show'); toastFn = null; }
  $('#toastBtn').addEventListener('click', function () {
    const fn = toastFn, isUndo = this.textContent === 'Undo';
    hideToast();
    if (fn) { fn(); buzz('medium'); if (isUndo) setTimeout(function () { toast('Undone'); }, 150); }
  });

  /* ================= Sheets ================= */
  function field(label, inner) { return '<label class="field"><span>' + label + '</span>' + inner + '</label>'; }
  function segHtml(id, opts, val) { return '<div class="seg" id="' + id + '">' + opts.map(function (o) { return '<button type="button" data-v="' + o[0] + '" aria-pressed="' + (String(val) === String(o[0])) + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function bindSeg(root, id, cb) {
    const btns = $$('#' + id + ' button', root);
    btns.forEach(function (b) { b.addEventListener('click', function () { btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); buzz('light'); cb(b.dataset.v); }); });
  }
  const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12M12 6v12"/></svg>';
  const MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12"/></svg>';
  const TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';

  // One sheet for logging and editing: it always shows the entry for the chosen date.
  function logSheet(date) {
    let d = date || todayISO();
    const track = false; // calories are logged in the food diary now
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Log weight</h2>' +
        '<label class="date-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg><span id="lDateLbl"></span><input type="date" id="lDate" aria-label="Date" /></label></div>' +
      '<div class="stepper"><button type="button" class="step" data-step="-1" aria-label="Minus 0.1">' + MINUS + '</button>' +
        '<div class="w-field"><input id="lW" type="text" inputmode="decimal" enterkeyhint="done" aria-label="Weight" autocomplete="off" /><div>' + unit() + '</div></div>' +
        '<button type="button" class="step" data-step="1" aria-label="Plus 0.1">' + PLUS + '</button></div>' +
      (track ? '<div class="field sfx" id="lKWrap"><input class="input" id="lK" inputmode="numeric" maxlength="5" placeholder="Calories eaten" aria-label="Calories eaten" autocomplete="off" /><em>kcal</em></div><p class="t-sub" id="lKLog" style="margin:-4px 2px 14px" hidden></p>' : '') +
      '<button type="button" class="text-btn" id="lNoteBtn">+ Add note</button>' +
      '<div class="field" id="lNoteWrap" hidden><input class="input" id="lN" maxlength="200" placeholder="Note" aria-label="Note" autocomplete="off" /></div>' +
      '<p class="form-error" id="lErr" hidden></p>' +
      '<div class="btn-row"><button type="button" class="btn danger icon-only" id="lDel" aria-label="Delete" hidden>' + TRASH + '</button><button type="button" class="btn primary" id="lSave">Save</button></div>',
      function (root) {
        const dateIn = $('#lDate', root), wIn = $('#lW', root), kIn = $('#lK', root), nIn = $('#lN', root);
        const err = function (m) { const x = $('#lErr', root); x.textContent = m; x.hidden = !m; if (m) buzz('warn'); };
        const fill = function () {
          const e = findEntry(d), latest = entries()[entries().length - 1];
          dateIn.value = d; dateIn.max = todayISO();
          $('#lDateLbl', root).textContent = relDate(d);
          $('#sheetTitle', root).textContent = e ? 'Edit weight' : 'Log weight';
          wIn.value = e ? fmtW(e.kg) : '';
          wIn.placeholder = latest ? fmtW(latest.kg) : (unit() === 'lb' ? '150.0' : '70.0');
          if (kIn) {
            const tt = dayTotals(d);
            kIn.value = e && e.kcal ? e.kcal : '';
            $('#lKWrap', root).hidden = tt.fromLog; $('#lKLog', root).hidden = !tt.fromLog;
            $('#lKLog', root).textContent = tt.fromLog ? fmtKcal(tt.kcal) + ' kcal from your food log' : '';
          }
          nIn.value = e ? e.note : '';
          $('#lNoteWrap', root).hidden = !(e && e.note);
          $('#lNoteBtn', root).hidden = !!(e && e.note);
          $('#lDel', root).hidden = !e;
          err('');
        };
        fill();
        wIn.addEventListener('focus', function () { setTimeout(function () { wIn.select(); }, 0); });
        dateIn.addEventListener('change', function () { if (dateIn.value && dateIn.value <= todayISO()) d = dateIn.value; fill(); buzz('light'); });
        $('.date-chip', root).addEventListener('click', function (e) { if (e.target === dateIn && dateIn.showPicker) { try { dateIn.showPicker(); } catch (x) {} } });
        $('#lNoteBtn', root).addEventListener('click', function () { this.hidden = true; $('#lNoteWrap', root).hidden = false; nIn.focus(); });
        const stepBy = function (dir) {
          let v = parseNum(wIn.value);
          if (isNaN(v)) v = parseNum(wIn.placeholder);
          else v = Math.round((v + dir * 0.1) * 10) / 10;
          if (!isNaN(v)) wIn.value = Math.max(0, v).toFixed(1);
          err(''); buzz('light');
        };
        $$('.step', root).forEach(function (b) {
          let hold = null, rep = null;
          const stop = function () { clearTimeout(hold); clearInterval(rep); hold = rep = null; };
          b.addEventListener('pointerdown', function (e) { e.preventDefault(); const dir = +b.dataset.step; stepBy(dir); hold = setTimeout(function () { rep = setInterval(function () { stepBy(dir); }, 70); }, 420); });
          ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, stop); });
          b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stepBy(+b.dataset.step); } });
          b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        });
        const doSave = function () {
          const v = parseNum(wIn.value);
          if (isNaN(v)) return err('Enter your weight');
          const kg = fromDisp(v);
          if (kg < 20 || kg > 400) return err('That weight doesn\'t look right');
          const kRaw = kIn && !$('#lKWrap', root).hidden ? kIn.value.trim() : '', k = kRaw ? parseNum(kRaw) : null;
          if (kRaw && (isNaN(k) || k < 300 || k > 15000)) return err('Enter the whole day\'s calories');
          const prev = findEntry(d), snap = snapshot();
          const e = { date: d, kg: Math.round(kg * 10000) / 10000, note: nIn.value.trim().slice(0, 200) };
          if (k != null) e.kcal = Math.round(k);
          else if ((!kIn || $('#lKWrap', root).hidden) && prev && prev.kcal) e.kcal = prev.kcal; // calorie field hidden: keep what's there
          upsert(e); save(); closeSheet(); renderAll(); buzz('success');
          // A big jump above the trend is almost always water. Say so, so it doesn't feel like a setback.
          const gap = e.kg - trendAt(dayNum(d)), waterish = toDisp(gap) >= (unit() === 'lb' ? 1.8 : 0.8);
          toast((prev ? 'Updated ' : 'Logged ') + v.toFixed(1) + ' ' + unit() + (waterish ? ' · likely water, trend barely moved' : ''), function () { restore(snap); });
          checkMilestones();
        };
        $('#lSave', root).addEventListener('click', doSave);
        [wIn, kIn, nIn].forEach(function (x) { if (x) x.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doSave(); } }); });
        $('#lDel', root).addEventListener('click', function () {
          const snap = snapshot(), when = d;
          state.entries = state.entries.filter(function (x) { return x.date !== when; });
          save(); closeSheet(); renderAll(); buzz('medium');
          toast('Deleted ' + (relDate(when) === 'Today' || relDate(when) === 'Yesterday' ? relDate(when).toLowerCase() + '\'s weight' : fmtDate(when)), function () { restore(snap); });
        });
      });
  }

  // Weekly check-in: one week's average, change and a short read on the pace, plus recent weeks.
  function weekSheet(start, auto, onClose, adj) {
    const w = weekStats(start), prev = weekStats(start - 7), gwd = goodWhenDown();
    const change = w && prev ? w.avg - prev.avg : null;
    let verdict = '';
    if (change != null) {
      const plan = makePlan(activeEnergy()), pace = plan ? plan.pace : null, ch = toDisp(change);
      if (pace && pace.dir !== 'maintain') {
        const exp = toDisp(pace.kg), ratio = ch / exp, rate = Number(Math.abs(exp).toFixed(2)) + ' ' + unit() + '/week';
        verdict = ratio < 0 ? (pace.dir === 'lose' ? 'Up this week. One week isn\'t a trend, so keep going.' : 'Down this week. One week isn\'t a trend.')
          : ratio < 0.5 ? 'Slower than your ' + rate + ' plan.' : ratio <= 1.5 ? 'Right on your ' + rate + ' pace.' : 'Faster than your ' + rate + ' plan.';
      } else if (pace && pace.dir === 'maintain') verdict = Math.abs(ch) < (unit() === 'lb' ? 0.5 : 0.25) ? 'Holding steady. Nice.' : (ch < 0 ? 'A little down' : 'A little up') + ' while maintaining.';
    }
    const cell = function (v, l) { return '<div class="metric"><span class="m-v num">' + v + '</span><span class="m-l">' + l + '</span></div>'; };
    let body = '<div class="sheet-head"><div><div class="label faint">' + (auto ? 'Weekly check-in' : 'Week') + '</div><h2 class="sheet-title" id="sheetTitle">' + esc(weekRange(start)) + '</h2></div></div>';
    if (!w) body += '<p class="sheet-text">No weigh-ins this week.</p>';
    else {
      body += '<div class="week-top" style="margin-bottom:6px"><div><div class="week-avg num" style="font-size:44px">' + fmtW(w.avg) + '<span class="unit">' + unit() + '</span></div><div class="week-sub">Average</div></div>' +
        (change != null ? '<div style="text-align:right">' + deltaChip(change, gwd) + '<div class="week-sub">vs week before</div></div>' : '') + '</div>' +
        (verdict ? '<p class="sheet-text" style="margin:10px 0 0">' + esc(verdict) + '</p>' : '') +
        (adj ? '<div class="stat-box" id="wkAdj" style="margin-top:16px;display:flex;align-items:center;gap:12px"><span class="ico">' + FLAME + '</span><div class="grow"><div class="row-t">' + (adj.goal ? 'Goal reached: now maintaining' : adj.hold ? 'Target kept' : 'Target ' + (adj.change > 0 ? 'raised' : 'lowered') + ' by ' + fmtKcal(Math.abs(adj.change)) + ' kcal') + '</div><div class="row-s" style="white-space:normal;overflow:visible">' + esc(tuneWhy(adj)) + '</div></div>' + (adj.hold ? '' : '<button type="button" class="text-btn" id="wkAdjUndo" style="margin:0">Undo</button>') + '</div>' : '') +
        '<div class="sv-key wk-key"><div><b class="num">' + w.n + '<small>/7</small></b><span>Weigh-ins</span></div><div><b class="num">' + fmtW(w.lo) + '</b><span>Lowest</span></div><div><b class="num">' + fmtW(w.hi) + '</b><span>Highest</span></div><div><b class="num">' + fmtW(w.hi - w.lo) + '</b><span>Range</span></div></div>';
    }
    body += weekNutrition(start);
    // Recent weeks
    const rows = [];
    for (let k = 1, st = start - 7; k <= 4; k++, st -= 7) { const x = weekStats(st); if (x) rows.push(x); }
    if (rows.length) {
      body += '<div class="label faint fd-sec wk-sec">Earlier weeks</div><div class="list">' + rows.map(function (x) {
        const pv = weekStats(x.start - 7), d = pv ? x.avg - pv.avg : null;
        return '<div class="row"><div class="grow"><div class="row-t">' + esc(weekRange(x.start)) + '</div><div class="row-s">' + x.n + ' days</div></div><span class="row-w num">' + fmtW(x.avg) + '</span><span class="delta">' + (d != null ? fmtDelta(d) : '') + '</span></div>';
      }).join('') + '</div>';
    }
    body += '<div style="height:16px"></div><button type="button" class="btn primary block" id="wkDone">Done</button>';
    openSheet(body, function (root) {
      $('#wkDone', root).addEventListener('click', function () { closeSheet(); });
      const u = $('#wkAdjUndo', root);
      if (u) u.addEventListener('click', function () { undoTune(adj); $('#wkAdj', root).remove(); toast('Target change undone'); });
    }, onClose);
  }

  function adjustSheet() {
    const p = state.profile, en = activeEnergy(), c = en && en.calc, auto = en && en.source === 'auto', t = state.ui.tune;
    const total = auto ? Math.round(en.tdee - c.tdee) : p.adjustKcal;
    const row = function (l, v) { return '<div class="row"><div class="grow row-t">' + l + '</div><span class="row-w num">' + v + '</span></div>'; };
    const sgn = function (v) { return (v > 0 ? '+' : v < 0 ? '−' : '') + fmtKcal(Math.abs(Math.round(v))); };
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">How your target learns</h2></div>' +
      '<div class="num" style="font-size:44px;font-weight:700;letter-spacing:-.04em;line-height:1">' + sgn(total) + '<span class="unit">kcal</span></div>' +
      '<p class="sheet-text" style="margin:10px 0 16px">' + (auto ? 'Your burn compared with the formula, learned from your real results.' : 'Change from weekly check-ins.') + '</p>' +
      (c ? '<div class="list">' + row('Formula estimate', fmtKcal(roundKcal(c.tdee))) +
        (state.settings.autoAdjust && p.adjustKcal ? row('Corrections from your weight trend', sgn(p.adjustKcal)) : '') +
        (auto && en.m && en.m.ready ? row('Your log (food + weight)', fmtKcal(roundKcal(en.m.tdee)) + ' · ' + Math.round(en.w * 100) + '% used') : '') +
        row('Burn used for your target', fmtKcal(roundKcal(en.tdee))) + '</div>' : '') +
      (t ? '<div class="stat-box" style="margin-top:14px"><div class="row-t">Last check · ' + esc(fmtDate(isoFromDay(t.at), { month: 'short', day: 'numeric' })) + '</div><div class="row-s" style="white-space:normal;overflow:visible">' + esc(tuneWhy(t)) + '</div></div>' : '') +
      '<p class="sheet-text" style="margin:16px 0 20px">This runs on its own. Each time you open the app, Setpoint compares your weight trend and what you logged with your plan. If you stall, it checks your food log first: if you ate over your target, the target stays; if you were on target, the estimate was off and the target moves (up to 150 kcal a week). The more days you log, the more your target is based on your real burn. Changing your goal or activity restarts the 2-week check, and reaching your goal switches you to maintenance.</p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="adjReset"' + (p.adjustKcal ? '' : ' disabled') + '>Reset corrections</button><button type="button" class="btn primary" id="adjOk">Done</button></div>',
      function (root) {
        $('#adjOk', root).addEventListener('click', function () { closeSheet(); });
        $('#adjReset', root).addEventListener('click', function () { const snap = snapshot(); p.adjustKcal = 0; p.adjustAt = dayNum(todayISO()); save(); renderAll(); closeSheet(); toast('Corrections reset', function () { restore(snap); }); });
      });
  }

  // "How this is worked out": the whole sum, step by step, in plain words. Only an explanation; the buttons live on the page.
  function targetExplainSheet() {
    const en = activeEnergy(), plan = makePlan(en); if (!en || !plan) return;
    const c = en.calc, p = state.profile, pace = plan.pace, u = unit(), t = p.training;
    const k = function (v) { return fmtKcal(Math.abs(Math.round(v))); }, sg = function (v) { return (v < 0 ? '−' : '+') + k(v); };
    const goalK = Math.round(pace.kg * KCAL_PER_KG / 7), rate = Number(Math.abs(toDisp(pace.kg)).toFixed(2)) + ' ' + u;
    const row = function (l, v, cls) { return '<div class="tx-r' + (cls ? ' ' + cls : '') + '"><span>' + l + '</span><b class="num">' + v + '</b></div>'; };
    const step = function (n, title, body) { return '<section class="tx-step"><div class="tx-sh"><span class="tx-n num">' + n + '</span><h3 class="tx-h">' + title + '</h3></div>' + body + '</section>'; };
    const para = function (x) { return '<p class="tx-p">' + x + '</p>'; };
    const item = function (dot, name, val, desc) { return '<div class="tx-part"><i class="' + dot + '"></i><div class="grow"><div class="tx-pt"><span>' + name + '</span><b class="num">' + val + '</b></div><div class="tx-pd">' + desc + '</div></div></div>'; };
    // The answer first, then where each number comes from.
    let h = para(pace.dir === 'maintain' ? 'Your target is simply what you burn in a day, so your weight stays where it is.' : 'Your target is what you burn in a day, ' + (pace.dir === 'lose' ? 'minus' : 'plus') + ' what it takes to ' + (pace.dir === 'lose' ? 'lose' : 'gain') + ' ' + rate + ' a week.') +
      '<div class="tx-eq">' + row('What you burn', k(en.tdee)) +
      (pace.dir !== 'maintain' ? row(pace.dir === 'lose' ? 'To lose ' + rate + ' a week' : 'To gain ' + rate + ' a week', sg(goalK)) : '') +
      (plan.adjust ? row('Weekly corrections', sg(plan.adjust)) : '') +
      row('Your daily target', k(plan.target) + ' kcal', 'tx-tot') + '</div>';
    // 1. Burn
    if (c) {
      const life = Math.max(0, c.life + en.tdee - c.tdee), learnedK = Math.round(en.tdee - c.tdee);
      h += step(1, 'How much you burn', para('Your body uses energy all day, even at rest. Eating this much keeps your weight steady. It adds up from four things:') +
        '<div class="tx-parts">' +
          item('o1', 'Resting', k(c.bmr), 'Keeping you alive: heart, brain, breathing. Based on your age, sex, height and weight' + (p.bodyFat ? ' and body fat' : '') + '.') +
          item('o2', 'Daily life', k(life), 'Moving around, standing, chores and digesting food.') +
          item('o3', 'Steps', k(c.steps), 'Your ' + fmtKcal(p.steps) + ' steps a day.') +
          item('o4', 'Training', k(c.train), t.days ? 'Your ' + t.days + ' workouts a week, shared out over all 7 days.' : 'No workouts in your Activity.') +
        '</div>' +
        (Math.abs(learnedK) >= 10 || en.source !== 'calc' ? '<div class="tx-note"><b>Learned from you.</b> ' + (en.source === 'measured' ? 'This comes only from your food log and weight trend: what you ate, and how your weight moved.' : 'A formula is only a starting point. Setpoint compares what you eat with how your weight actually moves, and found you burn about ' + k(learnedK) + ' kcal ' + (learnedK > 0 ? 'more' : 'less') + ' than the formula says.' + (en.source === 'auto' && en.w > 0 ? ' Right now ' + Math.round(en.w * 100) + '% of this number comes from your own log.' : '')) + '</div>' : ''));
    }
    // 2. Goal
    h += step(2, 'What your goal changes', pace.dir === 'maintain' ? para('Nothing: you eat about what you burn, so your weight stays steady.')
      : para('About 7,700 kcal makes 1 kg of body weight. ' + (pace.dir === 'lose' ? 'Losing' : 'Gaining') + ' ' + rate + ' a week takes about ' + k(Math.abs(goalK) * 7) + ' kcal a week, which is ' + k(goalK) + ' kcal a day ' + (pace.dir === 'lose' ? 'less' : 'more') + ' than you burn.') +
        (plan.eta ? para('At this pace you reach your goal on ' + plan.eta.replace(/^goal by /, '') + '.') : ''));
    // 3. Macros
    const lb = u === 'lb', per = function (v) { return Number((lb ? v / LB : v).toFixed(1)) + ' g per ' + u; };
    const refTxt = plan.refWhy === 'your weight' ? 'your weight' : plan.refWhy === 'your lean mass' ? 'your lean mass (' + Math.round(toDisp(plan.ref)) + ' ' + u + ')' : 'a healthy weight for your height (' + Math.round(toDisp(plan.ref)) + ' ' + u + ')';
    const why = plan.kind === 'strength' ? 'Higher because you lift' : plan.kind === 'cardio' ? 'Set for cardio training' : 'Set for no regular training';
    h += step(3, 'How the calories are split', para('Protein and fat are set first, because your body needs a certain amount of each. Carbs fill the rest.') +
      '<div class="tx-parts">' +
        item('d-p', 'Protein', plan.protein + ' g', per(plan.proteinPerKg) + ' of ' + refTxt + '. ' + (plan.custom ? 'You set this yourself.' : why + (pace.kg < 0 ? ', and a little higher while losing so you keep your muscle' : '') + '. Protein also keeps you full.')) +
        item('d-f', 'Fat', plan.fat + ' g', per(plan.fatPerKg) + ' of ' + refTxt + '. Needed for hormones and absorbing vitamins' + (plan.custom ? '.' : ', so it never drops below about a fifth of your calories.')) +
        item('d-c', 'Carbs', plan.carbs + ' g', 'Whatever is left. They are your main fuel for training and daily energy.') +
      '</div>' +
      (plan.refWhy === 'healthy weight for your height' ? '<div class="tx-note"><b>Why not your current weight?</b> Extra body fat doesn\'t need extra protein, so above a BMI of 25 these use the weight at BMI 25 for your height. If you add your body fat in About you, they use your lean mass instead.</div>' : ''));
    // Extras
    const sp = trainSplit();
    if (sp) h += step(4, 'Training days', para('On training days (' + weekOrder().filter(function (d) { return sp.days.indexOf(d) >= 0; }).map(function (d) { return dayAbbr(d); }).join(', ') + ') you get ' + k(Math.round(sp.tx / 10) * 10) + ' kcal more, and ' + k(Math.round(sp.rx / 10) * 10) + ' kcal less on rest days. The week adds up to the same total; only carbs move.'));
    if (state.settings.flex && state.settings.flex.on) h += step(sp ? 5 : 4, 'Flexible week', para('Your week\'s calories stay the same, but each day moves with what you ate earlier in the week.'));
    if (plan.warn) h += '<div class="tx-note tx-warn"><b>' + esc(plan.warn) + '.</b> ' + (plan.warn.indexOf('1%') >= 0 ? 'Losing faster than about 1% of your weight a week makes it hard to keep muscle. A slower pace is easier to stick to.' : 'Very low targets make it hard to get enough nutrients. A slower pace would help.') + '</div>';
    h += '<h3 class="tx-h tx-last">It stays up to date by itself</h3>' + para('Your target updates as your weight changes. Each time you open the app, Setpoint also checks your weight trend against your plan: if you stall while eating on target, your burn was overestimated and the target moves (up to 150 kcal a week). If you ate over your target, it stays. Changing your goal, activity or details updates it straight away.');
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">How your target is worked out</h2></div>' + h + '<p class="muted-note sv-src">These are estimates from standard formulas and your own log, not medical advice. Check with a doctor or dietitian before big changes, especially if you\'re pregnant, have a medical condition or a history of eating disorders.</p><div style="height:12px"></div><button type="button" class="btn primary block" id="txOk">Got it</button>', function (root) {
      $('#txOk', root).addEventListener('click', function () { closeSheet(); });
    });
  }

  const MILESTONES = { kg: [1, 2, 3, 5, 7.5, 10, 12.5, 15, 20, 25, 30, 40, 50], lb: [2, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100] };
  // Every milestone currently reached, as keys like "kg5" or "goal62.0".
  function reachedMilestones() {
    const l = entries(), down = goodWhenDown(), now = currentKg(), out = [];
    if (l.length < 3 || down == null || now == null) return out;
    const moved = toDisp(down ? l[0].kg - now : now - l[0].kg);
    MILESTONES[unit()].forEach(function (m) { if (moved >= m) out.push({ key: unit() + m, title: m + ' ' + unit() + (down ? ' down' : ' up'), sub: 'Since you started on ' + fmtDate(l[0].date, { month: 'short', day: 'numeric', year: 'numeric' }) }); });
    const g = state.settings.goalKg;
    if (g && (down ? now <= g : now >= g)) out.push({ key: 'goal' + g.toFixed(1), title: 'Goal reached', sub: 'Your trend hit ' + fmtW(g) + ' ' + unit() + '. Time to set a new one or maintain.' });
    return out;
  }
  // Data that arrives in bulk (sync, CSV import, backup restore) isn't new progress: don't celebrate it later.
  function markMilestonesSeen() { const seen = state.ui.milestones || []; reachedMilestones().forEach(function (m) { if (seen.indexOf(m.key) < 0) seen.push(m.key); }); state.ui.milestones = seen; }
  function checkMilestones() {
    const all = reachedMilestones(), seen = state.ui.milestones || [];
    const fresh = all.filter(function (m) { return seen.indexOf(m.key) < 0; });
    if (!fresh.length) return;
    state.ui.milestones = seen.concat(fresh.map(function (m) { return m.key; }));
    save();
    const best = fresh.filter(function (m) { return m.key.indexOf('goal') === 0; })[0] || fresh[fresh.length - 1];
    setTimeout(function () { celebrate(best); }, 900);
  }
  function celebrate(m) {
    const colors = ['var(--accent)', '#f6c453', '#ff7a8a', '#7ab8ff', 'var(--accent-text)'];
    let bits = '';
    for (let i = 0; i < 36; i++) bits += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;background:' + colors[i % colors.length] + ';animation-delay:' + (Math.random() * 0.6).toFixed(2) + 's;animation-duration:' + (1.6 + Math.random() * 1.2).toFixed(2) + 's;transform:rotate(' + Math.round(Math.random() * 360) + 'deg)"></i>';
    openSheet('<div class="confetti" aria-hidden="true">' + bits + '</div><div class="ob-hero" style="margin-top:18px"><span class="ob-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/></svg></span>' +
      '<h2 class="sheet-title" id="sheetTitle" style="font-size:30px">' + esc(m.title) + '</h2><p class="sheet-text" style="margin:8px 0 0">' + esc(m.sub) + '</p></div>' +
      '<button type="button" class="btn primary block" id="ceOk">Keep going</button>', function (root) { buzz('success'); $('#ceOk', root).addEventListener('click', function () { closeSheet(); }); });
  }

  function goalSheet() {
    const g = state.settings.goalKg;
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Goal weight</h2></div>' +
      '<div class="field sfx"><input class="input" id="gIn" inputmode="decimal" placeholder="' + (unit() === 'lb' ? '150.0' : '68.0') + '" value="' + (g ? fmtW(g) : '') + '" aria-label="Goal weight" autocomplete="off" /><em>' + unit() + '</em></div>' +
      '<div class="field"><span>By a date (optional)</span><input class="input" type="date" id="gBy" min="' + isoFromDay(dayNum(todayISO()) + 14) + '" aria-label="Reach it by" /></div>' +
      '<div id="gPlan"></div>' +
      '<p class="form-error" id="gErr" hidden></p>' +
      '<div class="btn-row">' + (g ? '<button type="button" class="btn soft" id="gClear">Remove</button>' : '') + '<button type="button" class="btn primary" id="gSave">Save</button></div>',
      function (root) {
        const inp = $('#gIn', root), by = $('#gBy', root);
        // With a date: the pace needed, snapped to the paces on offer (never faster than 1% of body weight a week).
        let chosen = null;
        const plan = function () {
          chosen = null; const box = $('#gPlan', root), v = parseNum(inp.value), kg = fromDisp(v), now = currentKg();
          if (!by.value || isNaN(v) || now == null) { box.innerHTML = ''; return; }
          const weeks = (dayNum(by.value) - dayNum(todayISO())) / 7, need = (kg - now) / weeks;
          if (weeks < 2 || Math.abs(kg - now) < 0.3) { box.innerHTML = ''; return; }
          const dir = need < 0 ? 'lose' : 'gain', opts = RATES[unit()][dir].map(function (o) { return unit() === 'lb' ? o / LB : o; }).filter(function (o) { return dir === 'gain' || o <= now * 0.01 + 1e-9; });
          const fit = opts.find(function (o) { return o >= Math.abs(need) - 1e-9; }), pick = fit != null ? fit : opts[opts.length - 1];
          chosen = (dir === 'lose' ? -1 : 1) * pick;
          const was = state.profile.paceKg; state.profile.paceKg = chosen; const pl = makePlan(activeEnergy()); state.profile.paceKg = was;
          const eta = new Date(); eta.setDate(eta.getDate() + Math.round(Math.abs(kg - now) / pick * 7));
          box.innerHTML = '<div class="stat-box gp-box"><div class="tr-row"><span>Needed</span><b class="num">' + fmtDelta(need) + ' ' + unit() + ' / week</b></div><div class="tr-row"><span>Your pace</span><b class="num">' + fmtDelta(chosen) + ' ' + unit() + ' / week</b></div>' + (pl ? '<div class="tr-row"><span>Daily target</span><b class="num">' + fmtKcal(roundKcal(pl.target)) + ' kcal</b></div>' : '') +
            '<p class="muted-note" style="margin:8px 0 0">' + (fit == null ? 'That\'s faster than is healthy. At this pace you\'d get there around ' + esc(fmtFuture(eta)) + '.' : 'You\'d get there around ' + esc(fmtFuture(eta)) + '.') + '</p></div>';
        };
        inp.addEventListener('input', plan); by.addEventListener('change', plan);
        const go = function () {
          const v = parseNum(inp.value), kg = fromDisp(v);
          if (isNaN(v) || kg < 20 || kg > 400) { const e = $('#gErr', root); e.textContent = 'That weight doesn\'t look right'; e.hidden = false; buzz('warn'); return; }
          state.settings.goalKg = Math.round(kg * 10000) / 10000; state.profile.paceKg = chosen; if (chosen != null) state.profile.paceAt = dayNum(todayISO());
          save(); closeSheet(); renderAll(); buzz('success'); toast('Goal set');
        };
        $('#gSave', root).addEventListener('click', go);
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
        const c = $('#gClear', root);
        if (c) c.addEventListener('click', function () { const snap = snapshot(); state.settings.goalKg = null; save(); closeSheet(); renderAll(); toast('Goal removed', function () { restore(snap); }); });
      });
  }

  function phaseSheet() {
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">New phase</h2></div>' +
      '<p class="sheet-text">Your trend restarts from this date.</p>' +
      '<div class="field"><span>Type</span>' + segHtml('phType', [['Cut', 'Cut'], ['Bulk', 'Bulk'], ['Maintain', 'Maintain']], 'Cut') + '</div>' +
      field('Starts', '<input class="input" type="date" id="phDate" value="' + todayISO() + '" />') +
      '<button type="button" class="btn primary block" id="phSave">Start phase</button>',
      function (root) {
        let label = 'Cut';
        bindSeg(root, 'phType', function (v) { label = v; });
        $('#phSave', root).addEventListener('click', function () {
          const date = $('#phDate', root).value;
          if (!ISO_RE.test(date)) { buzz('warn'); return; }
          const snap = snapshot();
          state.phases = state.phases.filter(function (p) { return p.date !== date; });
          state.phases.push({ date: date, label: label });
          state.phases.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
          save(); closeSheet(); renderAll(); buzz('success');
          toast(label + ' started', function () { restore(snap); });
        });
      });
  }

  // First-run welcome: units → weight & goal → (optional) details → your plan.
  function welcomeSheet(step) {
    step = step || 1;
    const dots = '<div class="ob-dots">' + [1, 2, 3, 4].map(function (i) { return '<i class="' + (i <= step ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    const done = function () { state.ui.onboarded = true; save(); };
    let html;
    if (step === 1) {
      html = dots + '<div class="ob-hero"><span class="ob-logo"><img src="icon-192.png" alt="" /></span><h2 class="sheet-title" id="sheetTitle" style="font-size:28px">Welcome to Setpoint</h2>' +
        '<p class="sheet-text" style="margin:8px 0 0">Watch your trend, not the daily ups and downs.</p></div>' +
        '<div class="field"><span>Units</span>' + segHtml('obUnit', [['kg', 'kg'], ['lb', 'lb']], unit()) + '</div>' +
        '<button type="button" class="btn primary block" id="obNext">Get started</button>' +
        '<button type="button" class="text-btn center-btn" id="obAcct" style="margin-top:14px">I already have an account</button>' +
        '<p class="muted-note ob-legal">Setpoint gives estimates, not medical advice. By continuing you agree to the <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy Policy</a>.</p>';
    } else if (step === 2) {
      const latest = entries()[entries().length - 1], g = state.settings.goalKg;
      html = dots + '<h2 class="sheet-title" id="sheetTitle">Your weight</h2><p class="sheet-text" style="margin:6px 0 18px">Weigh in each morning for the best trend.</p>' +
        '<label class="field"><span>Today</span><div class="sfx"><input class="input big" id="obW" inputmode="decimal" placeholder="' + (unit() === 'lb' ? '160.0' : '72.0') + '" value="' + (latest ? fmtW(latest.kg) : '') + '" autocomplete="off" /><em>' + unit() + '</em></div></label>' +
        '<label class="field"><span>Goal <span class="faint">· optional</span></span><div class="sfx"><input class="input" id="obG" inputmode="decimal" value="' + (g ? fmtW(g) : '') + '" autocomplete="off" /><em>' + unit() + '</em></div></label>' +
        '<p class="form-error" id="obErr" hidden></p>' +
        '<button type="button" class="btn primary block" id="obNext">Next</button>';
    } else if (step === 3) {
      const p = state.profile;
      html = dots + '<h2 class="sheet-title" id="sheetTitle">About you</h2><p class="sheet-text" style="margin:6px 0 18px">For your daily calories and protein. You can skip this.</p>' +
        '<div class="field"><span>Sex</span>' + segHtml('obSex', [['female', 'Female'], ['male', 'Male'], ['other', 'Other']], p.sex) + '</div>' +
        '<div class="two"><label class="field"><span>Age</span><div class="sfx"><input class="input" id="obAge" inputmode="numeric" maxlength="3" value="' + (ageNow() || '') + '" autocomplete="off" /><em>yrs</em></div></label>' +
        (unit() === 'lb'
          ? '<label class="field"><span>Height</span><div class="two"><div class="sfx"><input class="input" id="obFt" inputmode="numeric" maxlength="1" autocomplete="off" /><em>ft</em></div><div class="sfx"><input class="input" id="obIn" inputmode="numeric" maxlength="2" autocomplete="off" /><em>in</em></div></div></label>'
          : '<label class="field"><span>Height</span><div class="sfx"><input class="input" id="obCm" inputmode="decimal" maxlength="5" value="' + (p.heightCm ? Math.round(p.heightCm) : '') + '" autocomplete="off" /><em>cm</em></div></label>') + '</div>' +
        '<p class="form-error" id="obErr" hidden></p>' +
        '<div class="btn-row"><button type="button" class="btn soft" id="obSkip">Skip</button><button type="button" class="btn primary" id="obNext">Next</button></div>';
    } else {
      const plan = makePlan(activeEnergy()), g = state.settings.goalKg;
      html = dots + '<div class="ob-hero"><span class="ob-check">' + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' + '</span><h2 class="sheet-title" id="sheetTitle">You\'re all set</h2></div>' +
        '<div class="stat-box"><div class="two" style="text-align:center">' +
          '<div><div class="num">' + (currentKg() != null ? fmtW(currentKg()) : '—') + '<span class="unit">' + unit() + '</span></div><div class="label faint">Starting trend</div></div>' +
          '<div><div class="num">' + (g ? fmtW(g) + '<span class="unit">' + unit() + '</span>' : '—') + '</div><div class="label faint">Goal</div></div></div>' +
          (plan ? '<div class="macros" style="margin-top:16px;padding-top:14px;border-color:var(--line)"><div><b>' + fmtKcal(roundKcal(plan.target)) + '</b><span>kcal a day</span></div><div><b>' + plan.protein + '<small>g</small></b><span>Protein</span></div><div><b>' + plan.pace.dir.charAt(0).toUpperCase() + plan.pace.dir.slice(1) + '</b><span>' + (plan.pace.kg ? Number(Math.abs(toDisp(plan.pace.kg)).toFixed(2)) + ' ' + unit() + '/wk' : 'Plan') + '</span></div></div>' : '') +
        '</div><p class="sheet-text" style="margin:16px 0 18px">Log your weight each morning. Your weekly check-in arrives every Monday.</p>' +
        '<button type="button" class="btn primary block" id="obNext">Start</button>';
    }
    openSheet(html, function (root) {
      const next = $('#obNext', root), err = function (m) { const x = $('#obErr', root); if (x) { x.textContent = m; x.hidden = !m; } if (m) buzz('warn'); };
      if (step === 1) {
        bindSeg(root, 'obUnit', function (v) { state.settings.unit = v; save(); renderAll(); });
        $('#obAcct', root).addEventListener('click', function () { done(); accountSheet(); });
        next.addEventListener('click', function () { welcomeSheet(2); });
      } else if (step === 2) {
        next.addEventListener('click', function () {
          const w = parseNum($('#obW', root).value), gRaw = $('#obG', root).value.trim(), g = gRaw ? parseNum(gRaw) : null;
          if (isNaN(w) || fromDisp(w) < 20 || fromDisp(w) > 400) return err('Enter your weight');
          if (gRaw && (isNaN(g) || fromDisp(g) < 20 || fromDisp(g) > 400)) return err('That goal doesn\'t look right');
          upsert({ date: todayISO(), kg: Math.round(fromDisp(w) * 10000) / 10000, note: '' });
          state.settings.goalKg = g != null ? Math.round(fromDisp(g) * 10000) / 10000 : null;
          save(); renderAll(); welcomeSheet(3);
        });
      } else if (step === 3) {
        let sex = state.profile.sex;
        bindSeg(root, 'obSex', function (v) { sex = v; });
        $('#obSkip', root).addEventListener('click', function () { welcomeSheet(4); });
        next.addEventListener('click', function () {
          const age = parseNum($('#obAge', root).value);
          const cm = unit() === 'lb' ? (parseNum($('#obFt', root).value) * 12 + (parseNum($('#obIn', root).value) || 0)) * 2.54 : parseNum($('#obCm', root).value);
          if (!sex) return err('Choose one for sex, or tap Skip');
          if (isNaN(age) || age < 13 || age > 100) return err('Age should be 13 to 100');
          if (isNaN(cm) || cm < 120 || cm > 230) return err('That height doesn\'t look right');
          const p = state.profile;
          p.sex = sex; p.birthYear = new Date().getFullYear() - Math.round(age); p.heightCm = Math.round(cm * 10) / 10;
          save(); renderAll(); welcomeSheet(4);
        });
      } else next.addEventListener('click', function () { closeSheet(); buzz('success'); });
    }, done);
  }

  function detailsSheet() {
    const p = state.profile, lb = unit() === 'lb';
    const ft = p.heightCm ? Math.floor(p.heightCm / 2.54 / 12) : '', inch = p.heightCm ? Math.round(p.heightCm / 2.54 % 12) : '';
    let sex = p.sex;
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">About you</h2></div>' +
      '<div class="field"><span>Sex</span>' + segHtml('dSex', [['female', 'Female'], ['male', 'Male'], ['other', 'Other']], sex) + '</div>' +
      field('Age', '<input class="input" id="dAge" inputmode="numeric" maxlength="3" placeholder="28" value="' + (ageNow() || '') + '" autocomplete="off" />') +
      (lb ? '<div class="field"><span>Height</span><div class="two"><div class="sfx"><input class="input" id="dFt" inputmode="numeric" maxlength="1" value="' + ft + '" aria-label="Feet" autocomplete="off" /><em>ft</em></div><div class="sfx"><input class="input" id="dIn" inputmode="numeric" maxlength="2" value="' + inch + '" aria-label="Inches" autocomplete="off" /><em>in</em></div></div></div>'
          : '<div class="field"><span>Height</span><div class="sfx"><input class="input" id="dCm" inputmode="decimal" maxlength="5" placeholder="170" value="' + (p.heightCm ? Math.round(p.heightCm) : '') + '" aria-label="Height" autocomplete="off" /><em>cm</em></div></div>') +
      '<div class="field"><span>Body fat <span class="faint">· optional</span></span><div class="sfx"><input class="input" id="dBf" inputmode="decimal" maxlength="4" value="' + (p.bodyFat || '') + '" aria-label="Body fat" autocomplete="off" /><em>%</em></div></div>' +
      '<p class="form-error" id="dErr" hidden></p>' +
      '<button type="button" class="btn primary block" id="dSave">Save</button>',
      function (root) {
        bindSeg(root, 'dSex', function (v) { sex = v; });
        const err = function (m) { const x = $('#dErr', root); x.textContent = m; x.hidden = false; buzz('warn'); };
        $('#dSave', root).addEventListener('click', function () {
          const age = parseNum($('#dAge', root).value);
          const cm = lb ? (parseNum($('#dFt', root).value) * 12 + (parseNum($('#dIn', root).value) || 0)) * 2.54 : parseNum($('#dCm', root).value);
          const bfRaw = $('#dBf', root).value.trim(), bf = bfRaw ? parseNum(bfRaw) : null;
          if (!sex) return err('Choose one for sex');
          if (isNaN(age) || age < 13 || age > 100) return err('Age should be 13 to 100');
          if (isNaN(cm) || cm < 120 || cm > 230) return err('That height doesn\'t look right');
          if (bfRaw && (isNaN(bf) || bf < 3 || bf > 60)) return err('Body fat should be 3 to 60%');
          const snap = snapshot();
          p.sex = sex; p.birthYear = new Date().getFullYear() - Math.round(age); p.heightCm = Math.round(cm * 10) / 10; p.bodyFat = bf != null ? Math.round(bf * 10) / 10 : null;
          save(); closeSheet(); renderAll(); buzz('success');
          toast('Saved', function () { restore(snap); });
        });
      });
  }

  function activitySheet() {
    const p = state.profile, t = p.training, snap = snapshot();
    let trainReset = false;
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Activity</h2><span class="pill" id="aLevel"></span></div>' +
      '<div class="ctl"><div class="ctl-head"><span class="label">Daily steps</span><span class="num" id="aSteps"></span></div><input type="range" id="aRange" min="0" max="25000" step="500" value="' + p.steps + '" aria-label="Daily steps" /></div>' +
      '<div class="ctl"><div class="ctl-head"><span class="label">Workouts a week</span><span class="stepper-mini"><button type="button" class="icon-btn" data-d="-1" aria-label="Fewer">' + MINUS + '</button><b class="num" id="aDays"></b><button type="button" class="icon-btn" data-d="1" aria-label="More">' + PLUS + '</button></span></div></div>' +
      '<div id="aTrain">' +
        '<div class="ctl"><div class="ctl-head"><span class="label">Type</span></div>' + segHtml('aType', [['lifting', 'Lifting'], ['cardio', 'Cardio'], ['mixed', 'HIIT'], ['sports', 'Sports']], t.type) + '</div>' +
        '<div class="ctl"><div class="ctl-head"><span class="label">Length</span></div>' + segHtml('aMin', [[30, '30m'], [45, '45m'], [60, '1h'], [90, '1.5h']], t.minutes) + '</div>' +
        '<div class="ctl"><div class="ctl-head"><span class="label">Effort</span></div>' + segHtml('aInt', [['light', 'Easy'], ['moderate', 'Moderate'], ['hard', 'Hard']], t.intensity) + '</div>' +
      '</div>' +
      '<button type="button" class="btn primary block" id="aDone">Done</button>',
      function (root) {
        const sync = function () {
          $('#aSteps', root).textContent = fmtKcal(p.steps);
          $('#aDays', root).textContent = t.days;
          $('#aTrain', root).hidden = t.days === 0;
          // Training weekdays must match workouts a week, or the week wouldn't add up.
          if (state.settings.train && state.settings.train.days.length !== t.days) { state.settings.train = null; trainReset = true; }
          const c = calcEnergy();
          $('#aLevel', root).textContent = c ? c.level : '';
          $('#aLevel', root).hidden = !c;
          save(); renderAll();
        };
        sync();
        $('#aRange', root).addEventListener('input', function () { p.steps = +this.value; sync(); });
        $$('[data-d]', root).forEach(function (b) { b.addEventListener('click', function () { t.days = Math.max(0, Math.min(7, t.days + +b.dataset.d)); buzz('light'); sync(); }); });
        bindSeg(root, 'aType', function (v) { t.type = v; sync(); });
        bindSeg(root, 'aMin', function (v) { t.minutes = +v; sync(); });
        bindSeg(root, 'aInt', function (v) { t.intensity = v; sync(); });
        $('#aDone', root).addEventListener('click', function () { closeSheet(); });
      },
      function () { if (snapshot() !== snap) p.paceAt = dayNum(todayISO()); save(); if (snapshot() !== snap) toast(trainReset ? 'Saved. Pick your training days again in Targets' : 'Activity saved', function () { restore(snap); }); });
  }

  function macrosSheet() {
    const p = state.profile, snap = snapshot(), lb = unit() === 'lb';
    const per = function (v) { return lb ? (v / LB).toFixed(2) + ' g/lb' : v.toFixed(1) + ' g/kg'; };
    const ctl = function (id, label) {
      return '<div class="ctl"><div class="ctl-head"><span class="label">' + label + '</span><span class="num" id="' + id + 'V"></span></div>' +
        '<input type="range" id="' + id + '" step="0.1" aria-label="' + label + '" />' +
        '<div class="range-foot"><span id="' + id + 'Lo"></span><button type="button" class="rec-btn" id="' + id + 'Rec"></button><span id="' + id + 'Hi"></span></div></div>';
    };
    openSheet(
      '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Macros</h2><span class="pill" id="mTag"></span></div>' +
      '<div class="split" id="mBar"><i class="o4"></i><i class="o2"></i><i class="o1"></i></div>' +
      '<div class="macros" id="mPrev" style="border-top:0;padding-top:0;margin:12px 0 22px"></div>' +
      '<div class="label faint" style="margin:0 0 8px">Quick pick</div><div class="meal-chips" id="mPre"><button type="button" data-v="bal">Balanced</button><button type="button" data-v="hp">High protein</button><button type="button" data-v="lc">Lower carb</button></div>' +
      ctl('mP', 'Protein') + ctl('mF', 'Fat') +
      '<p class="warn" id="mWarn" style="margin:-8px 0 14px" hidden></p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="mReset">Recommended</button><button type="button" class="btn primary" id="mDone">Done</button></div>',
      function (root) {
        const P = $('#mP', root), F = $('#mF', root);
        // Presets stay inside the safe ranges: high protein = top of the protein range; lower carb = top of the fat range.
        $$('#mPre button', root).forEach(function (b) { b.addEventListener('click', function () {
          const plan = makePlan(activeEnergy()); if (!plan) return; const r = macroRanges(plan.pace.kg < 0);
          p.macros = b.dataset.v === 'bal' ? { protein: null, fat: null } : b.dataset.v === 'hp' ? { protein: r.protein[1], fat: r.fat[2] } : { protein: r.protein[2], fat: r.fat[1] };
          $$('#mPre button', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          save(); renderAll(); buzz('light'); sync();
        }); });
        const sync = function () {
          const plan = makePlan(activeEnergy());
          if (!plan) return;
          const r = macroRanges(plan.pace.kg < 0);
          [[P, r.protein, plan.proteinPerKg, 'mP', plan.protein], [F, r.fat, plan.fatPerKg, 'mF', plan.fat]].forEach(function (x) {
            x[0].min = x[1][0]; x[0].max = x[1][1]; x[0].value = x[2];
            $('#' + x[3] + 'V', root).textContent = per(x[2]) + ' · ' + x[4] + ' g';
            $('#' + x[3] + 'Lo', root).textContent = per(x[1][0]);
            $('#' + x[3] + 'Hi', root).textContent = per(x[1][1]);
            $('#' + x[3] + 'Rec', root).textContent = 'Recommended ' + per(x[1][2]);
          });
          const kP = plan.protein * 4, kF = plan.fat * 9, kC = plan.carbs * 4, tot = Math.max(1, kP + kF + kC);
          const bars = $$('#mBar i', root);
          [kP, kF, kC].forEach(function (k, i) { bars[i].style.flexGrow = Math.max(1, Math.round(k)); });
          $('#mPrev', root).innerHTML = [['Protein', plan.protein, kP], ['Fat', plan.fat, kF], ['Carbs', plan.carbs, kC]].map(function (m) {
            return '<div><b>' + m[1] + '<small>g</small></b><span>' + m[0] + ' · ' + Math.round(m[2] / tot * 100) + '%</span></div>';
          }).join('');
          $('#mTag', root).textContent = plan.custom ? 'Custom' : 'Recommended';
          const w = plan.carbs < 50 ? 'Very little room left for carbs' : kF < plan.target * 0.2 ? 'Fat is under 20% of your calories' : '';
          $('#mWarn', root).textContent = w; $('#mWarn', root).hidden = !w;
          save(); renderAll();
        };
        const set = function (key, input) {
          const plan = makePlan(activeEnergy()), r = macroRanges(plan && plan.pace.kg < 0)[key];
          const v = Math.round(+input.value * 10) / 10;
          p.macros[key] = Math.abs(v - r[2]) < 0.001 ? null : v; // back on the recommended value = recommended
          sync();
        };
        P.addEventListener('input', function () { set('protein', P); });
        F.addEventListener('input', function () { set('fat', F); });
        P.addEventListener('change', function () { buzz('light'); });
        F.addEventListener('change', function () { buzz('light'); });
        $('#mPRec', root).addEventListener('click', function () { p.macros.protein = null; buzz('light'); sync(); });
        $('#mFRec', root).addEventListener('click', function () { p.macros.fat = null; buzz('light'); sync(); });
        $('#mReset', root).addEventListener('click', function () { p.macros.protein = null; p.macros.fat = null; buzz('medium'); sync(); });
        $('#mDone', root).addEventListener('click', function () { closeSheet(); });
        sync();
      },
      function () { save(); if (snapshot() !== snap) toast('Macros saved', function () { restore(snap); }); });
  }

  function guestSheet() {
    const g = state.guest, t = g.training, lb = unit() === 'lb';
    const ft = g.heightCm ? Math.floor(g.heightCm / 2.54 / 12) : '', inch = g.heightCm ? Math.round(g.heightCm / 2.54 % 12) : '';
    const inp = function (id, val, ph, sfx, mode, label) { return '<div class="sfx"><input class="input" id="' + id + '" inputmode="' + (mode || 'decimal') + '" maxlength="5" placeholder="' + ph + '" value="' + (val != null && val !== '' ? val : '') + '" aria-label="' + label + '" autocomplete="off" /><em>' + sfx + '</em></div>'; };
    openSheet(
      '<div class="sheet-head"><div><div class="label faint">Your plan stays the same</div><h2 class="sheet-title" id="sheetTitle">Someone else</h2></div><button type="button" class="text-btn" id="guClear" style="margin:0">Clear</button></div>' +
      '<div class="stat-box" id="guOut" style="margin-bottom:22px;position:sticky;top:30px;z-index:2;box-shadow:0 8px 18px -12px rgba(0,0,0,.35)"></div>' +
      '<div class="field"><span>Sex</span>' + segHtml('guSex', [['female', 'Female'], ['male', 'Male'], ['other', 'Other']], g.sex) + '</div>' +
      '<div class="two"><label class="field"><span>Age</span>' + inp('guAge', g.age, '30', 'yrs', 'numeric', 'Age') + '</label>' +
        '<label class="field"><span>Weight</span>' + inp('guKg', g.kg != null ? fmtW(g.kg) : '', lb ? '160' : '72', unit(), 'decimal', 'Weight') + '</label></div>' +
      (lb ? '<div class="field"><span>Height</span><div class="two">' + inp('guFt', ft, '5', 'ft', 'numeric', 'Feet') + inp('guIn', inch, '8', 'in', 'numeric', 'Inches') + '</div></div>'
          : '<label class="field"><span>Height</span>' + inp('guCm', g.heightCm ? Math.round(g.heightCm) : '', '170', 'cm', 'decimal', 'Height') + '</label>') +
      '<div class="ctl" style="margin-top:6px"><div class="ctl-head"><span class="label">Daily steps</span><span class="num" id="guSteps"></span></div><input type="range" id="guRange" min="0" max="25000" step="500" value="' + g.steps + '" aria-label="Daily steps" /></div>' +
      '<div class="ctl"><div class="ctl-head"><span class="label">Workouts a week</span><span class="stepper-mini"><button type="button" class="icon-btn" data-gd="-1" aria-label="Fewer">' + MINUS + '</button><b class="num" id="guDays"></b><button type="button" class="icon-btn" data-gd="1" aria-label="More">' + PLUS + '</button></span></div></div>' +
      '<div id="guTrain">' +
        '<div class="ctl">' + segHtml('guType', [['lifting', 'Lifting'], ['cardio', 'Cardio'], ['mixed', 'HIIT'], ['sports', 'Sports']], t.type) + '</div>' +
        '<div class="ctl">' + segHtml('guMin', [[30, '30m'], [45, '45m'], [60, '1h'], [90, '1.5h']], t.minutes) + '</div>' +
        '<div class="ctl">' + segHtml('guInt', [['light', 'Easy'], ['moderate', 'Moderate'], ['hard', 'Hard']], t.intensity) + '</div>' +
      '</div>' +
      '<div class="ctl"><div class="ctl-head"><span class="label">Goal</span></div><div class="seg" id="guDir"><button type="button" data-v="lose">Lose</button><button type="button" data-v="maintain">Maintain</button><button type="button" data-v="gain">Gain</button></div><div class="rates" id="guRates"></div></div>' +
      '<button type="button" class="btn primary block" id="guDone">Done</button>',
      function (root) {
        const val = function (id) { const el = $('#' + id, root); return el ? parseNum(el.value) : NaN; };
        const read = function () {
          const age = val('guAge'), w = val('guKg');
          g.age = !isNaN(age) && age >= 13 && age <= 100 ? Math.round(age) : null;
          g.kg = !isNaN(w) && fromDisp(w) >= 20 && fromDisp(w) <= 400 ? Math.round(fromDisp(w) * 100) / 100 : null;
          const cm = lb ? (val('guFt') * 12 + (val('guIn') || 0)) * 2.54 : val('guCm');
          g.heightCm = !isNaN(cm) && cm >= 120 && cm <= 230 ? Math.round(cm * 10) / 10 : null;
        };
        const sync = function () {
          $('#guSteps', root).textContent = fmtKcal(g.steps);
          $('#guDays', root).textContent = t.days;
          $('#guTrain', root).hidden = t.days === 0;
          const pace = snapPace(g.paceKg);
          $$('#guDir button', root).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === pace.dir); });
          $('#guRates', root).innerHTML = pace.dir === 'maintain' ? '' : RATES[unit()][pace.dir].map(function (v, i) { return '<button type="button" data-gr="' + i + '" aria-pressed="' + (i === pace.i) + '">' + v + '</button>'; }).join('') + '<span class="rates-u">' + unit() + ' / week</span>';
          $('#guRates', root).hidden = pace.dir === 'maintain';
          const out = $('#guOut', root);
          if (!g.sex || g.age == null || g.heightCm == null || g.kg == null) {
            out.innerHTML = '<p class="muted-note" style="text-align:center;padding:10px 0;margin:0">Add sex, age, weight and height</p>';
          } else {
            const en = energyFor({ sex: g.sex, age: g.age, heightCm: g.heightCm, steps: g.steps, training: t }, g.kg);
            const plan = planFor({ tdee: en.tdee, bmr: en.bmr, kg: g.kg, pace: pace, goal: null, p: { sex: g.sex, heightCm: g.heightCm, bodyFat: null, macros: null, training: t } });
            out.innerHTML = '<div class="two" style="text-align:center"><div><div class="num">' + fmtKcal(roundKcal(en.tdee)) + '</div><div class="label faint">Maintenance</div></div>' +
              '<div><div class="num" style="color:var(--accent-text)">' + fmtKcal(roundKcal(plan.target)) + '</div><div class="label faint">' + (pace.dir === 'maintain' ? 'Target' : pace.dir === 'lose' ? 'To lose' : 'To gain') + '</div></div></div>' +
              '<div class="macros" style="margin-top:14px;padding-top:12px;border-color:var(--line)"><div><b>' + plan.protein + '<small>g</small></b><span>Protein</span></div><div><b>' + plan.fat + '<small>g</small></b><span>Fat</span></div><div><b>' + plan.carbs + '<small>g</small></b><span>Carbs</span></div></div>' +
              '<p class="muted-note" style="text-align:center;margin:10px 0 0">' + esc(macroNote(plan)).replace(/; change your workouts.*$/, '.') + '</p>' +
              '<div class="t-sub" style="text-align:center;margin-top:10px">' + en.level + (plan.warn ? ' · <span style="color:var(--danger)">' + esc(plan.warn) + '</span>' : '') + '</div>';
          }
          save();
        };
        sync();
        $$('input.input', root).forEach(function (el) { el.addEventListener('input', function () { read(); sync(); }); });
        bindSeg(root, 'guSex', function (v) { g.sex = v; sync(); });
        $('#guRange', root).addEventListener('input', function () { g.steps = +this.value; sync(); });
        $$('[data-gd]', root).forEach(function (b) { b.addEventListener('click', function () { t.days = Math.max(0, Math.min(7, t.days + +b.dataset.gd)); buzz('light'); sync(); }); });
        bindSeg(root, 'guType', function (v) { t.type = v; sync(); });
        bindSeg(root, 'guMin', function (v) { t.minutes = +v; sync(); });
        bindSeg(root, 'guInt', function (v) { t.intensity = v; sync(); });
        $('#guDir', root).addEventListener('click', function (e) {
          const b = e.target.closest('button'); if (!b) return;
          g.paceKg = paceValue(b.dataset.v, b.dataset.v === 'lose' ? 1 : 0); buzz('light'); sync();
        });
        $('#guRates', root).addEventListener('click', function (e) {
          const b = e.target.closest('[data-gr]'); if (!b) return;
          g.paceKg = paceValue(snapPace(g.paceKg).dir, +b.dataset.gr); buzz('light'); sync();
        });
        $('#guClear', root).addEventListener('click', function () { state.guest = migrate({}).guest; save(); buzz('medium'); guestSheet(); });
        $('#guDone', root).addEventListener('click', function () { closeSheet(); });
      });
  }

  // How close the formula is to your real burn, and how much to trust that.
  function estimateCheck(m, c) {
    if (!m || !m.ready || !c) return '';
    const diff = m.tdee - c.tdee, pct = Math.round(diff / c.tdee * 100);
    const conf = m.calDays >= m.needCal * 1.6 && m.span >= m.needSpan * 1.5 ? ['High', 'hi'] : m.calDays >= m.needCal * 1.2 ? ['Medium', 'mid'] : ['Low', 'low'];
    const verdict = Math.abs(pct) <= 5 ? 'The formula fits you well.' : (pct > 0 ? 'You burn about ' + pct + '% more than the formula thinks.' : 'You burn about ' + Math.abs(pct) + '% less than the formula thinks.') + (conf[1] === 'low' ? ' Keep logging to be sure.' : ' Basing your target on your log would be more accurate.');
    return '<div class="ec-box"><div class="ec-top"><b>Estimate check</b><span class="src-tag src-' + conf[1] + '">' + conf[0] + ' confidence</span></div><p>' + verdict + '</p><small>' + m.calDays + ' days with calories over ' + m.span + ' days of weigh-ins</small></div>';
  }
  // Patterns from your own log: what tends to come before a higher or lower weigh-in the next morning.
  function weightInsights() {
    const wBy = {}; state.entries.forEach(function (e) { wBy[dayNum(e.date)] = e.kg; });
    const rows = [];
    Object.keys(wBy).forEach(function (k) {
      const d = +k; if (wBy[d + 1] == null) return;
      const iso = isoFromDay(d), t = dayTotals(iso); if (!t.kcal || t.kcal < 600) return;
      const r = { delta: wBy[d + 1] - wBy[d], kcal: t.kcal, carbs: t.carbs };
      if (foodDB) { const nd = dayNutrients(iso); if (nd.cov.na > 0.7 && nd.tot.na > 0) r.na = nd.tot.na; }
      const pl = dayPlan(iso); if (pl && pl.train != null) r.train = pl.train;
      rows.push(r);
    });
    const out = { n: rows.length, items: [] };
    if (rows.length < 14) return out;
    const avg = function (l, k) { return l.reduce(function (a, x) { return a + x[k]; }, 0) / l.length; };
    const split = function (key, label, unitTxt, note) {
      const r = rows.filter(function (x) { return x[key] != null; }).sort(function (a, b) { return a[key] - b[key]; });
      if (r.length < 12) return;
      const n = Math.floor(r.length / 3), lo = r.slice(0, n), hi = r.slice(-n), d = avg(hi, 'delta') - avg(lo, 'delta');
      out.items.push({ t: label, d: d, s: 'After days over ' + fmtNum(avg(hi, key)) + unitTxt + ' vs under ' + fmtNum(avg(lo, key)) + unitTxt, note: Math.abs(d) >= 0.15 ? note : 'No clear effect for you so far.' });
    };
    split('na', 'Salty days', ' mg sodium', 'That\'s water, not fat. It usually leaves in 1–3 days.');
    split('carbs', 'High-carb days', ' g carbs', 'Carbs are stored with water, so the scale jumps. It isn\'t fat.');
    split('kcal', 'Bigger eating days', ' kcal', 'Mostly food and water still in you. Real fat change shows over weeks, not overnight.');
    const tr = rows.filter(function (x) { return x.train === true; }), rs = rows.filter(function (x) { return x.train === false; });
    if (tr.length >= 5 && rs.length >= 5) { const d = avg(tr, 'delta') - avg(rs, 'delta'); out.items.push({ t: 'Training days', d: d, s: 'Next morning after training vs rest days', note: Math.abs(d) >= 0.15 ? 'Muscles hold extra water after training while they repair.' : 'No clear effect for you so far.' }); }
    // Weeks: average calories against how the trend moved.
    const wk = {}; Object.keys(state.food).forEach(function (iso) { const t = dayTotals(iso).kcal; if (t < 600) return; const w = weekStart(dayNum(iso)); (wk[w] = wk[w] || []).push(t); });
    const pts = Object.keys(wk).map(Number).filter(function (w) { return wk[w].length >= 4 && trendAt(w) != null && trendAt(w + 7) != null; }).map(function (w) { return { k: wk[w].reduce(function (a, x) { return a + x; }, 0) / wk[w].length, ch: trendAt(w + 7) - trendAt(w) }; });
    if (pts.length >= 4) {
      const mk = avg(pts, 'k'), mc = avg(pts, 'ch'); let num = 0, den = 0; pts.forEach(function (p) { num += (p.k - mk) * (p.ch - mc); den += (p.k - mk) * (p.k - mk); });
      const slope = den ? num / den : 0, even = slope ? mk - mc / slope : null;
      if (slope > 0 && even && even > 800 && even < 5000) out.items.push({ t: 'Your weekly balance', d: slope * 500, s: 'Each extra 500 kcal a day moved your trend about ' + fmtDelta(toDisp(slope * 500), 2) + ' ' + unit() + ' a week', note: 'From ' + pts.length + ' weeks, you hold steady at about ' + fmtKcal(Math.round(even / 10) * 10) + ' kcal a day.', week: true });
    }
    return out;
  }
  function fmtNum(v) { return Math.round(v).toLocaleString(); }
  function insightsSheet() {
    const draw = function (root) {
      const r = weightInsights();
      root.innerHTML = '<div class="sheet-head"><div><div class="label faint">From your own log</div><h2 class="sheet-title" id="sheetTitle">What moves your weight</h2></div></div>' +
        (r.n < 14 ? '<p class="muted-note fd-empty">Needs a bit more data: days with food logged and a weigh-in the next morning. ' + r.n + ' of 14 so far.</p>' :
          '<div class="list">' + r.items.map(function (x) { const up = x.d > 0; return '<div class="row fd-row ins-row"><div class="grow"><div class="row-t">' + esc(x.t) + '</div><div class="row-s" style="white-space:normal">' + esc(x.s) + '</div><div class="ins-note">' + esc(x.note) + '</div></div><span class="ins-v num ' + (Math.abs(x.d) < 0.15 && !x.week ? 'flat' : up ? 'up' : 'down') + '">' + (x.week ? '' : (up ? '+' : '−') + fmtW(Math.abs(x.d)) + ' ' + unit()) + '</span></div>'; }).join('') + '</div>' +
          '<p class="muted-note sv-src">Next-morning change in your weigh-in, compared between your highest and lowest third of days. ' + r.n + ' days so far.</p>');
    };
    openSheet('<div id="insRoot"></div>', function (body) {
      sheet.classList.add('tall'); const root = $('#insRoot', body); root.innerHTML = '<p class="muted-note fd-empty">Looking for patterns…</p>';
      loadFoods().then(function () { if (root.isConnected) draw(root); }, function () { if (root.isConnected) draw(root); });
    }, function () { sheet.classList.remove('tall'); });
  }
  // Fajr and Maghrib for a place and day (standard astronomical method; Fajr angle depends on the local authority).
  function prayerTimes(date, lat, lon, fajrAngle) {
    const R = Math.PI / 180, sin = function (x) { return Math.sin(x * R); }, cos = function (x) { return Math.cos(x * R); };
    const asin = function (x) { return Math.asin(x) / R; }, acos = function (x) { return Math.acos(Math.max(-1, Math.min(1, x))) / R; }, atan2 = function (y, x) { return Math.atan2(y, x) / R; };
    const fix = function (a, b) { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
    const y = date.getFullYear(), mo = date.getMonth() + 1, dd = date.getDate();
    let Y = y, M = mo; if (M <= 2) { Y -= 1; M += 12; }
    const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4), jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + dd + B - 1524.5 - lon / (15 * 24);
    const sun = function (j) { const D = j - 2451545, g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360), L = fix(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360), e = 23.439 - 0.00000036 * D, RA = fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24); return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - RA }; };
    const at = function (angle, t, ccw) { const s0 = sun(jd + t / 24), noon = fix(12 - s0.eqt, 24), T = acos((-sin(angle) - sin(s0.decl) * sin(lat)) / (cos(s0.decl) * cos(lat))) / 15; return noon + (ccw ? -T : T); };
    let f = at(fajrAngle, 5, true), m = at(0.833, 18, false); f = at(fajrAngle, f, true); m = at(0.833, m, false);
    const tz = -new Date(y, mo - 1, dd, 12).getTimezoneOffset() / 60, toDate = function (h) { h = h + tz - lon / 15; return new Date(y, mo - 1, dd, 0, Math.round(h * 60)); };
    return { fajr: toDate(f), maghrib: toDate(m) };
  }
  const RAM_CITIES = [['Cairo', 30.0444, 31.2357, 19.5], ['Giza', 30.0131, 31.2089, 19.5], ['Alexandria', 31.2001, 29.9187, 19.5], ['Mansoura', 31.0409, 31.3785, 19.5], ['Tanta', 30.7865, 31.0004, 19.5], ['Port Said', 31.2653, 32.3019, 19.5], ['Suez', 29.9668, 32.5498, 19.5], ['Ismailia', 30.5965, 32.2715, 19.5], ['Asyut', 27.1809, 31.1837, 19.5], ['Luxor', 25.6872, 32.6396, 19.5], ['Aswan', 24.0889, 32.8998, 19.5], ['Hurghada', 27.2579, 33.8116, 19.5], ['Sharm El Sheikh', 27.9158, 34.33, 19.5],
    ['Riyadh', 24.7136, 46.6753, 18.5], ['Jeddah', 21.4858, 39.1925, 18.5], ['Mecca', 21.3891, 39.8579, 18.5], ['Medina', 24.5247, 39.5692, 18.5], ['Dammam', 26.4207, 50.0888, 18.5], ['Dubai', 25.2048, 55.2708, 18.2], ['Abu Dhabi', 24.4539, 54.3773, 18.2], ['Kuwait City', 29.3759, 47.9774, 18], ['Doha', 25.2854, 51.531, 18], ['Amman', 31.9454, 35.9284, 18], ['London', 51.5074, -0.1278, 18]];
  function ramadanTimes(day) { const r = state.settings.ramadan; return r && r.on ? prayerTimes(day, r.lat, r.lon, r.fa) : null; }
  function hm(ms) { const m = Math.max(0, Math.round(ms / 60000)); return (m >= 60 ? Math.floor(m / 60) + 'h ' : '') + (m % 60) + 'm'; }
  let ramTimer = null;
  // The Islamic (Umm al-Qura) date, from the phone's own calendar: { y, m, d }, or null if the phone can't tell.
  function hijri(date) {
    try {
      const o = {}; new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(date).forEach(function (x) { if (x.type !== 'literal') o[x.type] = parseInt(x.value, 10); });
      return o.month && o.year ? { y: o.year, m: o.month, d: o.day } : null;
    } catch (e) { return null; }
  }
  // During Ramadan, offer to turn Ramadan mode on; after Eid, offer to turn it off. Each offer can be dismissed for the year.
  function ramadanOffer() {
    if (viewDay !== todayISO()) return '';
    const h = hijri(new Date()), r = state.settings.ramadan; if (!h) return '';
    const x = '<button type="button" class="hint-x" data-ram-x="' + h.y + '" aria-label="Not now"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button>';
    if (h.m === 9 && !(r && r.on) && state.ui.ramAsk !== String(h.y)) return '<div class="card ram-card ram-offer"><span class="ico ico-s">' + MOON_IC + '</span><div class="grow"><b>Ramadan Mubarak</b><span>Turn on Ramadan mode: Suhoor and Iftar meals, with fasting times for your city.</span><button type="button" class="btn sm tint" data-action="ramadan">Turn on</button></div>' + x + '</div>';
    if (h.m === 10 && h.d <= 10 && r && r.on && state.ui.ramOff !== String(h.y)) return '<div class="card ram-card ram-offer"><span class="ico ico-s">' + MOON_IC + '</span><div class="grow"><b>Eid Mubarak</b><span>Ramadan is over. Turn Ramadan mode off to get your usual meals back?</span><button type="button" class="btn sm tint" data-ram-off="' + h.y + '">Turn off</button></div>' + x.replace('data-ram-x', 'data-ram-x2') + '</div>';
    return '';
  }
  function ramadanBanner() {
    const r = state.settings.ramadan;
    clearInterval(ramTimer); ramTimer = null;
    const offer = ramadanOffer(); if (offer || !r || !r.on || viewDay !== todayISO()) return offer;
    ramTimer = setInterval(function () { const el = $('#ramLine'); if (el) el.innerHTML = ramLine(); else { clearInterval(ramTimer); ramTimer = null; } }, 60000);
    return '<div class="card ram-card"><span class="ico ico-s">' + MOON_IC + '</span><div class="grow" id="ramLine">' + ramLine() + '</div><button type="button" class="icon-btn" data-action="ramadan" aria-label="Ramadan settings">' + COG_IC + '</button></div>';
  }
  function ramLine() {
    const now = new Date(), t = ramadanTimes(now), tm = ramadanTimes(new Date(now.getTime() + 864e5)); if (!t) return '';
    const left = Math.max(0, waterGoal() - waterTotal(todayISO())), clock = function (d) { return fmtClock(d.getTime()); };
    if (now >= t.fajr && now < t.maghrib) return '<b>Fasting · Iftar at ' + clock(t.maghrib) + '</b><span>' + hm(t.maghrib - now) + ' to go · Suhoor ended ' + clock(t.fajr) + '</span>';
    const fajr = now < t.fajr ? t.fajr : tm.fajr;
    return '<b>Eating window · Suhoor until ' + clock(fajr) + '</b><span>' + hm(fajr - now) + ' left' + (left > 0 ? ' · drink ' + fmtVol(left) + ' more before Fajr' : ' · water goal done') + '</span>';
  }
  function fmtVol(ml) { return ml >= 1000 ? (Math.round(ml / 100) / 10) + ' L' : Math.round(ml) + ' ml'; }
  function ramadanSheet() {
    const cur = state.settings.ramadan;
    let on = !!(cur && cur.on), pick = cur ? { city: cur.city, lat: cur.lat, lon: cur.lon, fa: cur.fa } : { city: 'Cairo', lat: 30.0444, lon: 31.2357, fa: 19.5 };
    const draw = function (root) {
      const t = prayerTimes(new Date(), pick.lat, pick.lon, pick.fa);
      root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Ramadan mode</h2></div>' +
        '<p class="sheet-text">Breakfast becomes Suhoor and dinner becomes Iftar, and today\'s Diary shows the time to Iftar or to the end of Suhoor, plus how much water is left before Fajr.</p>' +
        '<div class="list"><label class="row"><div class="grow row-t">Ramadan mode</div><span class="switch"><input type="checkbox" id="rmOn"' + (on ? ' checked' : '') + ' /><i></i></span></label></div>' +
        '<div class="field" style="margin-top:14px"><span>City</span><select class="input" id="rmCity">' + RAM_CITIES.map(function (c) { return '<option' + (c[0] === pick.city ? ' selected' : '') + '>' + c[0] + '</option>'; }).join('') + (RAM_CITIES.some(function (c) { return c[0] === pick.city; }) ? '' : '<option selected>' + esc(pick.city || 'My location') + '</option>') + '</select></div>' +
        '<button type="button" class="text-btn" id="rmLoc">Use my location</button>' +
        '<div class="stat-box rm-times"><div><b class="num">' + fmtClock(t.fajr.getTime()) + '</b><span>Fajr (Suhoor ends)</span></div><div><b class="num">' + fmtClock(t.maghrib.getTime()) + '</b><span>Maghrib (Iftar)</span></div></div>' +
        '<p class="muted-note" style="text-align:start">Calculated times can differ from your local mosque by a few minutes.</p>' +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="rmSave">Save</button></div>';
      $('#rmOn', root).addEventListener('change', function () { on = this.checked; buzz('light'); });
      $('#rmCity', root).addEventListener('change', function () { const c = RAM_CITIES.find(function (x) { return x[0] === this.value; }, this); if (c) { pick = { city: c[0], lat: c[1], lon: c[2], fa: c[3] }; draw(root); } });
      $('#rmLoc', root).addEventListener('click', function () {
        if (!navigator.geolocation) { toast('Location isn\'t available here'); return; }
        const b = this; b.textContent = 'Finding you…';
        navigator.geolocation.getCurrentPosition(function (pos) { pick = { city: 'My location', lat: Math.round(pos.coords.latitude * 1000) / 1000, lon: Math.round(pos.coords.longitude * 1000) / 1000, fa: 18 }; buzz('success'); draw(root); }, function () { b.textContent = 'Use my location'; toast('Couldn\'t get your location'); }, { timeout: 10000 });
      });
      $('#rmSave', root).addEventListener('click', function () { state.settings.ramadan = on ? { on: true, city: pick.city, lat: pick.lat, lon: pick.lon, fa: pick.fa } : null; applyMeals(); save(); renderAll(); closeSheet(); buzz('success'); toast(on ? 'Ramadan mode on · Ramadan Kareem' : 'Ramadan mode off'); });
    };
    openSheet('<div id="rmRoot"></div>', function (body) { draw($('#rmRoot', body)); });
  }
  // Days around a period when water weight is common: 5 days before to 2 days after each start, plus the next expected one.
  function cycleWindows() {
    const c = state.settings.cycle; if (!c || !c.on || !c.starts.length) return [];
    const st = c.starts.map(dayNum).sort(function (a, b) { return a - b; }), gaps = [];
    for (let i = 1; i < st.length; i++) { const g = st[i] - st[i - 1]; if (g >= 21 && g <= 40) gaps.push(g); }
    const len = gaps.length ? Math.round(gaps.reduce(function (a, x) { return a + x; }, 0) / gaps.length) : 28;
    const out = st.map(function (d) { return { a: d - 5, b: d + 2 }; });
    let nx = st[st.length - 1] + len; const today = dayNum(todayISO()); while (nx < today - 2) nx += len;
    out.push({ a: nx - 5, b: nx + 2, guess: true });
    return out;
  }
  function inCycleWindow(day) { return cycleWindows().find(function (w) { return day >= w.a && day <= w.b; }) || null; }
  function cycleSheet() {
    const draw = function (root) {
      const c = state.settings.cycle;
      root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Cycle and weight</h2></div>' +
        '<p class="sheet-text">Many women hold 0.5–2 kg of water in the days before and around their period. With this on, those days are shaded on your weight chart so a jump doesn\'t look like a stall.</p>' +
        '<div class="list"><label class="row"><div class="grow row-t">Show on the weight chart</div><span class="switch"><input type="checkbox" id="cyOn"' + (c.on ? ' checked' : '') + ' /><i></i></span></label></div>' +
        (c.on ? '<div class="field" style="margin-top:14px"><span>Add a period start</span><div class="sv-amt" style="grid-template-columns:1fr auto;margin:0"><input class="input" type="date" id="cyD" max="' + todayISO() + '" value="' + todayISO() + '" /><button type="button" class="btn soft" id="cyAdd" style="height:50px">Add</button></div></div>' +
          (c.starts.length ? '<div class="list">' + c.starts.slice().reverse().map(function (d) { return '<div class="row fd-row"><div class="grow row-t">' + esc(fmtDate(d, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })) + '</div><button type="button" class="icon-btn me-rm" data-cyx="' + d + '" aria-label="Remove">' + TRASH + '</button></div>'; }).join('') + '</div>' : '<p class="muted-note">Add your last period start to begin. After two or more, the next one is estimated from your own cycle length.</p>') : '') +
        '<p class="muted-note sv-src">Stays private in your Setpoint data. It only changes how the chart is shaded.</p>';
      $('#cyOn', root).addEventListener('change', function () { c.on = this.checked; save(); renderChart(); buzz('light'); draw(root); });
      if ($('#cyAdd', root)) $('#cyAdd', root).addEventListener('click', function () { const v = $('#cyD', root).value; if (!ISO_RE.test(v) || v > todayISO()) return; if (c.starts.indexOf(v) < 0) { c.starts.push(v); c.starts.sort(); } save(); renderChart(); buzz('success'); draw(root); });
      $$('[data-cyx]', root).forEach(function (b) { b.addEventListener('click', function () { c.starts = c.starts.filter(function (x) { return x !== b.dataset.cyx; }); save(); renderChart(); buzz('light'); draw(root); }); });
    };
    openSheet('<div id="cyRoot"></div>', function (body) { draw($('#cyRoot', body)); });
  }
  function flexSheet() {
    const fx = state.settings.flex || { on: false, big: null, extra: 0 };
    let on = !!fx.on, big = fx.big != null ? fx.big : 5, extra = fx.extra || 0;
    const DAYS = [0, 1, 2, 3, 4, 5, 6].map(function (d) { return [d, new Date(Date.UTC(2024, 0, 7 + d)).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })]; });
    const draw = function (root) {
      root.innerHTML = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Flexible week</h2></div>' +
        '<p class="sheet-text">Your week\'s calories stay the same, but each day adjusts: eat less early in the week and later days get more, or the other way round. You can also give one day extra, like a family lunch.</p>' +
        '<div class="list"><label class="row"><div class="grow row-t">Flexible week</div><span class="switch"><input type="checkbox" id="fxOn"' + (on ? ' checked' : '') + ' /><i></i></span></label></div>' +
        (on ? '<div class="field" style="margin-top:14px"><span>Bigger day</span><div class="seg fx-days" id="fxBig">' + DAYS.map(function (x) { return '<button type="button" data-v="' + x[0] + '" aria-pressed="' + (extra > 0 && big === x[0]) + '">' + esc(x[1]) + '</button>'; }).join('') + '</div></div>' +
          '<div class="field"><span>Extra on that day</span><div class="seg" id="fxEx">' + [0, 200, 400, 600, 800].map(function (v) { return '<button type="button" data-v="' + v + '" aria-pressed="' + (extra === v) + '">' + (v ? '+' + v : 'None') + '</button>'; }).join('') + '</div></div>' +
          '<p class="muted-note" style="text-align:start">Days stay between 75% and 135% of your normal target, and never below ' + (state.profile.sex === 'male' ? '1,500' : '1,200') + ' kcal. Days you don\'t log count as on plan.</p>' : '') +
        '<div class="sheet-foot"><button type="button" class="btn primary block" id="fxSave">Save</button></div>';
      $('#fxOn', root).addEventListener('change', function () { on = this.checked; buzz('light'); draw(root); });
      $$('#fxBig button', root).forEach(function (b) { b.addEventListener('click', function () { big = +b.dataset.v; if (!extra) extra = 400; buzz('light'); draw(root); }); });
      $$('#fxEx button', root).forEach(function (b) { b.addEventListener('click', function () { extra = +b.dataset.v; buzz('light'); draw(root); }); });
      $('#fxSave', root).addEventListener('click', function () { state.settings.flex = on ? { on: true, big: extra ? big : null, extra: extra } : null; save(); renderAll(); closeSheet(); buzz('success'); toast(on ? 'Flexible week on' : 'Flexible week off'); });
    };
    openSheet('<div id="fxRoot"></div>', function (body) { draw($('#fxRoot', body)); });
  }
  function realTdeeSheet() {
    const m = measuredEnergy(), c = calcEnergy(), en = activeEnergy();
    let body;
    if (!m.ready) {
      const pct = (Math.min(m.calDays, m.needCal) / m.needCal + Math.min(m.span, m.needSpan) / m.needSpan) * 50;
      body = '<p class="sheet-text">Formulas can be 10–15% off. Log everything you eat in the Diary, drinks and snacks too, and Setpoint will work out your real burn and start using it on its own.</p>' +
        '<div class="stat-box"><div class="two">' +
          '<div><div class="num">' + Math.min(m.calDays, m.needCal) + '<span class="unit">/ ' + m.needCal + '</span></div><div class="label faint">days with calories</div></div>' +
          '<div><div class="num">' + Math.min(m.span, m.needSpan) + '<span class="unit">/ ' + m.needSpan + '</span></div><div class="label faint">days of weigh-ins</div></div>' +
        '</div><div class="bar" style="margin-top:16px"><i style="width:' + pct.toFixed(0) + '%"></i></div></div>';
    } else {
      const sv = state.profile.tdeeSource;
      body = '<div class="num" style="font-size:46px;font-weight:700;letter-spacing:-.04em;line-height:1">' + fmtKcal(roundKcal(m.tdee)) + '<span class="unit">kcal</span></div>' +
        '<p class="sheet-text" style="margin:10px 0 20px">You ate ' + fmtKcal(roundKcal(m.intake)) + ' a day and your weight moved ' + fmtDelta(m.rateKgWk, 2) + ' ' + unit() + ' a week.' + (c ? ' The formula says ' + fmtKcal(roundKcal(c.tdee)) + '.' : '') + '</p>' + estimateCheck(m, c) +
        '<div class="field"><span>Base your target on</span><div class="seg" id="rSrc"><button type="button" data-v="auto" aria-pressed="' + (sv === 'auto') + '"' + (c ? '' : ' disabled') + '>Automatic</button><button type="button" data-v="calc" aria-pressed="' + (sv === 'calc') + '"' + (c ? '' : ' disabled') + '>Formula</button><button type="button" data-v="measured" aria-pressed="' + (sv === 'measured') + '">Your log</button></div></div>' +
        '<p class="muted-note" style="text-align:start">' + (sv === 'auto' ? 'Automatic uses ' + Math.round((en && en.w || 0) * 100) + '% your log right now, more as you log more days.' : sv === 'calc' ? 'Formula plus weekly corrections from your weight trend.' : 'Only your log, nothing from the formula.') + '</p>';
    }
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Your real burn</h2></div><p class="sheet-text" style="margin-top:-4px">How many calories you actually burn in a day (also called TDEE), worked out from what you eat and how your weight changes, instead of a formula.</p>' + body, function (root) {
      if ($('#rSrc', root)) bindSeg(root, 'rSrc', function (v) { state.profile.tdeeSource = v; save(); renderAll(); closeSheet(); realTdeeSheet(); });
    });
  }

  function whatsNewSheet() {
    hideToast();
    openSheet('<div class="sheet-head"><div class="grow"><div class="label faint">Setpoint ' + APP_VERSION + '</div><h2 class="sheet-title" id="sheetTitle">What\'s new</h2></div></div><div class="changes" data-notr dir="ltr">' +
      (function () { const one = function (c) { return '<h3>Version ' + c.v + '</h3><ul>' + c.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>'; };
        const n = /\.0$/.test(CHANGES[0].v) ? 1 : 3; // a big release stands on its own
        return CHANGES.slice(0, n).map(one).join('') + (CHANGES.length > n ? '<details class="wn-old"><summary>Earlier versions (' + (CHANGES.length - n) + ')</summary>' + CHANGES.slice(n).map(one).join('') + '</details>' : ''); })() +
      '</div><div style="height:20px"></div><div class="btn-row"><button type="button" class="btn soft" id="wnUp">Check for updates</button><button type="button" class="btn primary" id="wnOk">Done</button></div>',
      function (root) { $('#wnOk', root).addEventListener('click', function () { closeSheet(); }); $('#wnUp', root).addEventListener('click', function () { closeSheet(); checkUpdate(); }); });
    state.seenVersion = APP_VERSION; save();
  }

  // The newest feature you haven't seen yet (versions since the one you last opened), if any is worth announcing.
  function featureNews(seen) {
    const i = CHANGES.findIndex(function (c) { return c.v === seen; }); if (i < 0) return null; // unknown version: stay quiet
    const since = CHANGES.slice(0, i);
    for (let k = 0; k < since.length; k++) if (since[k].announce) return since[k].announce;
    return null;
  }
  // A one-time card for a new feature: what it is, why it helps, and a button straight to it.
  const NEWS_IC = {
    plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M8 14h4M8 17h7"/></svg>'
  };
  const NEWS_GO = { plan: function () { planDaySheet(); } };
  function spotlightSheet(n) {
    const TK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    openSheet('<div class="ns"><div class="ns-art"><span>' + (NEWS_IC[n.icon] || NEWS_IC.plan) + '</span></div><span class="ns-tag">New</span>' +
      '<h2 class="sheet-title" id="sheetTitle">' + esc(n.title) + '</h2><p class="ns-text">' + esc(n.text) + '</p>' +
      (n.points ? '<ul class="ns-pts">' + n.points.map(function (x) { return '<li><i>' + TK + '</i><span>' + esc(x) + '</span></li>'; }).join('') + '</ul>' : '') +
      '<button type="button" class="btn primary block" id="nsGo">' + esc(n.cta || 'Try it') + '</button>' +
      '<div class="ns-more"><button type="button" class="text-btn" id="nsLater">Not now</button><span aria-hidden="true">·</span><button type="button" class="text-btn" id="nsAll">See all updates</button></div></div>',
      function (root) {
        $('#nsGo', root).addEventListener('click', function () { buzz('light'); closeSheet(); const go = NEWS_GO[n.go]; if (go) setTimeout(go, 280); });
        $('#nsLater', root).addEventListener('click', function () { closeSheet(); });
        $('#nsAll', root).addEventListener('click', function () { closeSheet(); setTimeout(whatsNewSheet, 280); });
      });
  }
  // Settings → Legal: the four policy pages.
  function legalSheet() {
    const DOC = '<span class="ico ico-s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/></svg></span>';
    const CH = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>';
    const a = function (href, t, s) { return '<a class="row" href="' + href + '">' + DOC + '<div class="grow"><div class="row-t">' + t + '</div><div class="row-s">' + s + '</div></div>' + CH + '</a>'; };
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Legal</h2></div><div class="list">' +
      a('privacy.html', 'Privacy Policy', 'What we collect, and your rights') + a('terms.html', 'Terms of Use', 'Including: not medical advice') +
      a('cookies.html', 'Cookies &amp; storage', 'No tracking, nothing optional') + a('refunds.html', 'Refund Policy', 'For future paid features') + '</div>');
  }
  function confirmSheet(title, text, okLabel, danger, onOk) {
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">' + esc(title) + '</h2></div><p class="sheet-text">' + text + '</p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="cfNo">Cancel</button><button type="button" class="btn ' + (danger ? 'danger' : 'primary') + '" id="cfOk">' + esc(okLabel) + '</button></div>',
      function (root) { $('#cfNo', root).addEventListener('click', function () { closeSheet(); }); $('#cfOk', root).addEventListener('click', function () { closeSheet(); onOk(); }); });
  }

  /* ================= Account + sync ================= */
  // Setpoint's own Firebase project. Data lives at users/{uid}/setpoint/state, which the rules limit to its owner.
  // (A Firebase web config is public by design; access is controlled by those rules.)
  const FB_CONFIG = {
    apiKey: 'AIzaSyAYXoxTt8Bhb2A-oCrQzpKO71GL1D892_o',
    // On our own site, sign-in pages are served from this domain (/__/auth/…) so iPhone home-screen apps can finish
    // Google sign-in; elsewhere (local testing) use the project's default domain.
    authDomain: location.hostname === 'setpoint-tracker.web.app' ? 'setpoint-tracker.web.app' : 'setpoint-tracker.firebaseapp.com',
    projectId: 'setpoint-tracker',
    storageBucket: 'setpoint-tracker.firebasestorage.app',
    messagingSenderId: '813690688684',
    appId: '1:813690688684:web:579ef69ad6c51f92093b09'
  };
  const USER_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4"/></svg>';
  let fb = null, fbP = null, auth = null, db = null, user = null;
  let syncBusy = false, syncError = false, pushTimer = null;

  // The SDK is only downloaded once someone signs in (or was signed in before).
  function loadFirebase() {
    if (!fbP) {
      fbP = import('./firebase.js').then(function (m) {
        fb = m;
        const app = m.initializeApp(FB_CONFIG);
        auth = m.initializeAuth(app, { persistence: [m.indexedDBLocalPersistence, m.browserLocalPersistence], popupRedirectResolver: m.browserPopupRedirectResolver });
        db = m.getFirestore(app);
        m.getRedirectResult(auth).then(function (r) { if (r && r.user) { buzz('success'); toast('Signed in · syncing'); } }, function (e) { if (e && e.code) toast(authError(e)); }).then(function () { try { localStorage.removeItem('setpoint-redirect'); } catch (e) {} });
        return new Promise(function (resolve) {
          let first = true;
          m.onAuthStateChanged(auth, function (u) { onUser(u); if (first) { first = false; resolve(m); } });
        });
      }).catch(function (e) { fbP = null; throw e; });
    }
    return fbP;
  }
  function cloudRef() { return fb.doc(db, 'users', user.uid, 'setpoint', 'state'); }

  function onUser(u) {
    if (u) {
      const fresh = state.sync.uid !== u.uid; // first time this account syncs on this device
      user = u;
      state.sync.uid = u.uid; state.sync.email = u.email || state.sync.email;
      quietSave = true; save(); quietSave = false;
      pull(fresh);
      photoSyncSoon(2500);
    } else {
      user = null;
      if (state.sync.uid) { state.sync = migrate({}).sync; quietSave = true; save(); quietSave = false; }
    }
    renderAccount(); refreshAccountSheet();
  }

  // Merge two saves: union of weigh-ins and phases (the newer save wins a clash);
  // settings, profile and the guest calculator come from the newer save.
  function mergeData(local, cloud, cloudNewer) {
    const a = cloudNewer ? local : cloud, b = cloudNewer ? cloud : local; // b wins
    const byDate = {}, ph = {};
    a.entries.concat(b.entries).forEach(function (e) { byDate[e.date] = e; });
    a.phases.concat(b.phases).forEach(function (p) { ph[p.date] = p; });
    const food = {};
    // Entry by entry: the most recently changed copy wins (wherever it is, so moving a food to another day sticks),
    // and an entry deleted on either phone stays deleted unless it was changed after that.
    const del = Object.assign({}, a.del || {}); Object.keys(b.del || {}).forEach(function (k) { if (!del[k] || b.del[k] > del[k]) del[k] = b.del[k]; });
    const pickd = {};
    [a.food || {}, b.food || {}].forEach(function (src, si) { Object.keys(src).forEach(function (dt) { src[dt].forEach(function (f) { const cur = pickd[f.id], u = f.u || 0, cu = cur ? cur.f.u || 0 : -1; if (!cur || u > cu || (u === cu && si === 1)) pickd[f.id] = { f: f, dt: dt }; }); }); });
    const placed = {};
    [b.food || {}, a.food || {}].forEach(function (src) { Object.keys(src).forEach(function (dt) { src[dt].forEach(function (f) { const x = pickd[f.id]; if (!x || placed[f.id] || x.dt !== dt) return; if (del[f.id] && del[f.id] >= (x.f.u || 0)) return; placed[f.id] = 1; (food[dt] = food[dt] || []).push(x.f); }); }); });
    Object.keys(pickd).forEach(function (id) { const x = pickd[id]; if (placed[id] || (del[id] && del[id] >= (x.f.u || 0))) return; placed[id] = 1; (food[x.dt] = food[x.dt] || []).push(x.f); });
    const ms = {}; (a.measures || []).concat(b.measures || []).forEach(function (m) { ms[m.date] = m; });
    const byId = function (k) { const o = {}; (a[k] || []).concat(b[k] || []).forEach(function (c) { o[c.id] = c; }); return Object.keys(o).map(function (id) { return o[id]; }); };
    const mf = {}; (a.myFoods || []).concat(b.myFoods || []).forEach(function (c) { mf[c.id] = c; });
    return { v: SCHEMA, del: del, entries: Object.keys(byDate).sort().map(function (k) { return byDate[k]; }), phases: Object.keys(ph).sort().map(function (k) { return ph[k]; }), food: food, measures: Object.keys(ms).sort().map(function (k) { return ms[k]; }), myFoods: Object.keys(mf).map(function (k) { return mf[k]; }), offFoods: byId('offFoods'), recipes: byId('recipes'), meals: byId('meals'), repeats: byId('repeats').filter(function (r) { return !(del['rp:' + r.id] && del['rp:' + r.id] >= (r.u || 0)); }), water: Object.assign({}, a.water || {}, b.water || {}), goals: Object.assign({}, a.goals || {}, b.goals || {}), portions: Object.assign({}, a.portions || {}, b.portions || {}), dayType: Object.assign({}, a.dayType || {}, b.dayType || {}), dayMode: Object.assign({}, a.dayMode || {}, b.dayMode || {}),
      fast: (function () { const fb2 = b.fast || a.fast || { goal: 16, start: null, log: [] }, lg = {}; ((a.fast || {}).log || []).concat((b.fast || {}).log || []).forEach(function (x) { lg[x.s] = x; }); return { goal: fb2.goal, start: fb2.start, log: Object.keys(lg).map(function (k) { return lg[k]; }).sort(function (x, y) { return y.s - x.s; }).slice(0, 100) }; })(), favs: (b.favs || []).concat((a.favs || []).filter(function (x) { return (b.favs || []).indexOf(x) < 0; })), settings: b.settings, profile: b.profile, guest: b.guest };
  }
  function applyData(d, updatedAt) {
    const inc = migrate(d);
    state.entries = inc.entries; state.phases = inc.phases; state.food = inc.food; state.measures = inc.measures; state.myFoods = inc.myFoods; state.favs = inc.favs; state.offFoods = inc.offFoods; state.recipes = inc.recipes; state.meals = inc.meals; state.repeats = inc.repeats; state.water = inc.water; state.portions = inc.portions; state.del = inc.del; state.goals = inc.goals; state.dayType = inc.dayType; state.dayMode = inc.dayMode; state.fast = inc.fast; state.settings = inc.settings; state.profile = inc.profile; state.guest = inc.guest;
    state.sync.updatedAt = updatedAt;
    applyRepeats();
    markMilestonesSeen();
    quietSave = true; save(); quietSave = false;
    applyAppearance(); renderAll();
  }
  function hasData(d) { return d.entries.length > 0 || d.phases.length > 0 || Object.keys(d.food).length > 0 || d.measures.length > 0 || d.myFoods.length > 0 || d.recipes.length > 0 || d.meals.length > 0 || !!d.profile.sex; }

  // The food log lives in monthly pieces under the main document (users/{uid}/setpoint/state/food/YYYY-MM), so it can
  // grow for years without reaching Firestore's 1 MB-per-document limit. Everything else stays in the main document.
  function foodCol() { return fb.collection(db, 'users', user.uid, 'setpoint', 'state', 'food'); }
  function monthDoc(ym) { return fb.doc(db, 'users', user.uid, 'setpoint', 'state', 'food', ym); }
  function monthsOf(food) { const m = {}; Object.keys(food).forEach(function (d) { const ym = d.slice(0, 7); (m[ym] = m[ym] || {})[d] = food[d]; }); return m; }
  function hashStr(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + '.' + str.length.toString(36); }
  function monthSigs(food) { const m = monthsOf(food), o = {}; Object.keys(m).forEach(function (k) { o[k] = hashStr(JSON.stringify(m[k])); }); return o; }
  // What each month looked like when this device last uploaded it. null = this device hasn't synced months yet.
  function sentMonths() { try { return JSON.parse(localStorage.getItem('setpoint-months-' + user.uid) || 'null'); } catch (e) { return null; } }
  function setSentMonths(m) { try { localStorage.setItem('setpoint-months-' + user.uid, JSON.stringify(m)); } catch (e) {} }
  // The whole cloud save: main document plus every food month, plus any food an older app version left in the main document.
  function readCloud() {
    return Promise.all([fb.getDoc(cloudRef()), fb.getDocs(foodCol())]).then(function (r) {
      const c = r[0].exists() ? r[0].data() : null;
      if (!c) return null;
      const data = JSON.parse(c.data || '{}'), food = {};
      r[1].forEach(function (d) { let part = {}; try { part = JSON.parse(d.data().data || '{}'); } catch (e) {} Object.keys(part).forEach(function (k) { food[k] = part[k]; }); });
      Object.keys(data.food || {}).forEach(function (dt) { const byId = {}; (food[dt] || []).concat(data.food[dt] || []).forEach(function (f) { if (f && f.id) byId[f.id] = f; }); food[dt] = Object.keys(byId).map(function (k) { return byId[k]; }); });
      data.food = food;
      return { at: c.updatedAt || 0, split: !!c.split, data: data };
    });
  }
  function syncDone() {
    state.sync.lastSync = Date.now(); state.sync.dirty = false;
    quietSave = true; save(); quietSave = false;
    renderAccount(); refreshAccountSheet();
  }
  function pull(fresh) {
    if (!user || !navigator.onLine) { renderAccount(); return Promise.resolve(); }
    if (!sentMonths()) fresh = true; // first sync of monthly food on this device: merge everything once
    syncBusy = true; syncError = false; renderAccount();
    return fb.getDoc(cloudRef()).then(function (snap) {
      if (!snap.exists()) { syncBusy = false; setSentMonths(sentMonths() || {}); return push(); }
      const cAt = snap.data().updatedAt || 0;
      if (!fresh && !state.sync.dirty && cAt <= state.sync.updatedAt) { syncBusy = false; syncDone(); return; }
      return readCloud().then(function (rc) {
        syncBusy = false;
        const cloud = migrate(rc.data), local = migrate(cloudData());
        const took = function () { setSentMonths(rc.split ? monthSigs(state.food) : {}); if (!rc.split) return push(); syncDone(); };
        if (fresh || state.sync.dirty) {
          if (!hasData(local)) { applyData(cloud, cAt); return took(); }
          if (!hasData(cloud)) { setSentMonths(sentMonths() || {}); return push(); }
          applyData(mergeData(local, cloud, cAt > state.sync.updatedAt), Date.now());
          setSentMonths(sentMonths() || {});
          return push();
        }
        applyData(cloud, cAt); return took();
      });
    }).catch(function () { syncBusy = false; syncError = true; renderAccount(); refreshAccountSheet(); });
  }
  function push() {
    if (!user || !navigator.onLine) { renderAccount(); return Promise.resolve(); }
    const sent = sentMonths();
    if (!sent) return pull(true); // never upload months before this device has merged with the cloud once
    syncBusy = true; syncError = false; renderAccount();
    const at = state.sync.updatedAt || Date.now(), data = cloudData(), months = monthsOf(data.food), sigs = monthSigs(data.food), main = Object.assign({}, data);
    delete main.food;
    const batch = fb.writeBatch(db);
    batch.set(cloudRef(), { app: 'Setpoint', v: SCHEMA, split: 2, updatedAt: at, data: JSON.stringify(main) });
    Object.keys(sigs).forEach(function (ym) { if (sent[ym] !== sigs[ym]) batch.set(monthDoc(ym), { updatedAt: at, data: JSON.stringify(months[ym]) }); });
    Object.keys(sent).forEach(function (ym) { if (!sigs[ym]) batch.set(monthDoc(ym), { updatedAt: at, data: '{}' }); }); // emptied months
    return batch.commit().then(function () {
      syncBusy = false;
      setSentMonths(sigs);
      state.sync.lastSync = Date.now();
      if (state.sync.updatedAt === at) state.sync.dirty = false; // nothing changed while uploading
      else schedulePush();
      quietSave = true; save(); quietSave = false;
      renderAccount(); refreshAccountSheet();
    }).catch(function () { syncBusy = false; syncError = true; renderAccount(); refreshAccountSheet(); });
  }
  function schedulePush() {
    if (!state.sync.uid) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { if (user) push(); else loadFirebase().then(function () { if (user) push(); }).catch(function () {}); }, 1200);
  }

  function authError(e) {
    const c = (e && e.code) || '';
    return {
      'auth/invalid-email': 'That email doesn\'t look right',
      'auth/missing-password': 'Enter your password',
      'auth/weak-password': 'Use at least 6 characters',
      'auth/email-already-in-use': 'This email already has an account. Sign in instead.',
      'auth/invalid-credential': 'Wrong email or password. If you\'ve used Google with this email, tap Continue with Google.',
      'auth/wrong-password': 'Wrong email or password. If you\'ve used Google with this email, tap Continue with Google.',
      'auth/user-not-found': 'No account with this email',
      'auth/too-many-requests': 'Too many tries. Wait a minute and try again.',
      'auth/network-request-failed': 'You\'re offline',
      'auth/popup-blocked': 'Your browser blocked the Google window',
      'auth/account-exists-with-different-credential': 'This email signs in a different way. Try email and password.'
    }[c] || 'Something went wrong. Try again.';
  }

  let accountSheetOpen = false, accountMode = null;
  // Redraw only when signing in or out; otherwise just refresh the status line.
  function refreshAccountSheet() {
    if (!accountSheetOpen || !sheet.classList.contains('open')) return;
    if ((state.sync.uid ? 'in' : 'out') !== accountMode) accountSheet(true);
    else { const el = $('#acStatus'); if (el) el.textContent = syncStatus(); }
  }
  // Email/password account whose address isn't verified yet.
  function needsVerify() {
    return !!(user && !user.emailVerified && (user.providerData || []).some(function (p) { return p && p.providerId === 'password'; }));
  }

  function accountSheet(refresh) {
    accountMode = state.sync.uid ? 'in' : 'out';
    const sy = state.sync, GOOGLE = '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 5.9 12 5.9z"/></svg>';
    let html;
    if (sy.uid) {
      html = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Account</h2></div>' +
        '<div class="stat-box" style="display:flex;align-items:center;gap:14px;margin-bottom:18px"><span class="ico" style="border-radius:50%;width:46px;height:46px"><b style="font-size:18px">' + esc((sy.email || '?').charAt(0).toUpperCase()) + '</b></span>' +
        '<div class="grow"><div class="row-t" style="overflow:hidden;text-overflow:ellipsis">' + esc(sy.email || 'Signed in') + '</div><div class="row-s" id="acStatus">' + esc(syncStatus()) + '</div></div></div>' +
        '<p class="sheet-text" style="margin:0 0 18px">Your weigh-ins and settings sync to this account. Sign in on another device to see them there.</p>' +
        (needsVerify() ? '<div class="stat-box" id="acVerifyBox" style="margin-bottom:18px"><p class="sheet-text" style="margin:0 0 10px">Verify your email to keep your password safe. Signing in with Google before you verify removes it.</p><button type="button" class="btn soft block" id="acVerify">Send verification email</button></div>' : '') +
        '<div class="btn-row"><button type="button" class="btn soft" id="acOut">Sign out</button><button type="button" class="btn primary" id="acSync">Sync now</button></div>' +
        '<button type="button" class="text-btn ac-del" id="acDel">Delete account and cloud data</button>';
    } else {
      html = '<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Sign in</h2></div>' +
        '<p class="sheet-text">Back up your data and sync it across devices. Your Study Planner account works here too.</p>' +
        '<button type="button" class="btn soft block" id="acGoogle" style="margin-bottom:16px;gap:10px">' + GOOGLE + 'Continue with Google</button>' +
        '<div class="field"><input class="input" id="acEmail" type="email" inputmode="email" autocomplete="email" placeholder="Email" aria-label="Email" /></div>' +
        '<div class="field"><input class="input" id="acPass" type="password" autocomplete="current-password" placeholder="Password" aria-label="Password" /></div>' +
        '<label class="consent"><input type="checkbox" id="acOk"' + (state.ui.consentAt ? ' checked' : '') + ' /><span>I\'m 18 or older (or have a parent\'s or guardian\'s permission). I agree to the <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>, and I consent to my health data (weight, food, body measurements and photos) being stored in my account on Google Firebase servers, which may be outside Egypt.</span></label>' +
        '<p class="form-error" id="acErr" hidden></p>' +
        '<button type="button" class="btn primary block" id="acIn">Sign in</button>' +
        '<div style="display:flex;justify-content:space-between;margin-top:14px"><button type="button" class="text-btn" id="acNew" style="margin:0">Create account</button><button type="button" class="text-btn" id="acForgot" style="margin:0">Forgot password?</button></div>';
    }
    const keep = refresh ? { e: $('#acEmail') && $('#acEmail').value, p: $('#acPass') && $('#acPass').value } : null;
    openSheet(html, function (root) {
      accountSheetOpen = true;
      if (sy.uid) {
        $('#acSync', root).addEventListener('click', function () { buzz('light'); loadFirebase().then(function () { return state.sync.dirty ? push() : pull(false); }).catch(function () { syncError = true; renderAccount(); }); });
        if ($('#acVerify', root)) $('#acVerify', root).addEventListener('click', function () {
          const b = this; b.disabled = true;
          loadFirebase().then(function () { return fb.sendEmailVerification(user); })
            .then(function () { b.textContent = 'Sent. Check your inbox'; buzz('success'); })
            .catch(function (e) { b.disabled = false; toast(e && e.code === 'auth/too-many-requests' ? 'Too many tries. Wait a bit.' : 'Couldn\'t send. Are you offline?'); });
        });
        $('#acDel', root).addEventListener('click', function () { buzz('light'); deleteAccount(); });
        $('#acOut', root).addEventListener('click', function () {
          loadFirebase().then(function () { return fb.signOut(auth); }).then(function () {
            state.sync = migrate({}).sync; quietSave = true; save(); quietSave = false;
            renderAccount(); closeSheet(); buzz('medium'); toast('Signed out. Your data stays on this device.');
          }).catch(function () { toast('Couldn\'t sign out. Are you offline?'); });
        });
        return;
      }
      const email = $('#acEmail', root), pass = $('#acPass', root);
      if (keep) { email.value = keep.e || ''; pass.value = keep.p || ''; }
      const err = function (m) { const el = $('#acErr', root); if (!el) return; el.textContent = m; el.hidden = !m; if (m) buzz('warn'); };
      // The sheet may already have redrawn as "signed in" by the time this runs, so check the button exists.
      const busy = function (b) { $$('button', root).forEach(function (x) { x.disabled = b; }); const btn = $('#acIn', root); if (btn) btn.textContent = b ? 'Please wait…' : 'Sign in'; };
      // Nothing is sent to the cloud until you agree (asked once; kept with your settings).
      const agreed = function () { if (!$('#acOk', root).checked) { err('Tick the box above to continue'); return false; } if (!state.ui.consentAt) { state.ui.consentAt = Date.now(); save(); } return true; };
      const run = function (fn) {
        if (!agreed()) return;
        err(''); busy(true);
        loadFirebase().then(fn).then(function () { busy(false); if (user) { closeSheet(); buzz('success'); toast('Signed in · syncing'); } })
          .catch(function (e) { busy(false); if (e && e.code === 'auth/popup-closed-by-user') return; err(e && e.code ? authError(e) : 'Couldn\'t reach the server. Are you offline?'); });
      };
      const creds = function () { const e = email.value.trim(), pw = pass.value; if (!e) { err('Enter your email'); return null; } if (!pw) { err('Enter your password'); return null; } return [e, pw]; };
      $('#acIn', root).addEventListener('click', function () { const c = creds(); if (c) run(function () { return fb.signInWithEmailAndPassword(auth, c[0], c[1]); }); });
      pass.addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#acIn', root).click(); });
      $('#acNew', root).addEventListener('click', function () {
        const c = creds(); if (!c) return;
        if (c[1].length < 6) return err('Use at least 6 characters');
        run(function () {
          return fb.createUserWithEmailAndPassword(auth, c[0], c[1]).then(function (cred) {
            // Verified emails keep their password if Google is used later; unverified ones lose it.
            fb.sendEmailVerification(cred.user).catch(function () {});
          });
        });
      });
      $('#acForgot', root).addEventListener('click', function () {
        const e = email.value.trim(); if (!e) return err('Enter your email first');
        err(''); loadFirebase().then(function () { return fb.sendPasswordResetEmail(auth, e); })
          .then(function () { toast('Reset link sent to ' + e); }).catch(function (x) { err(authError(x)); });
      });
      $('#acGoogle', root).addEventListener('click', function () {
        run(function () {
          const provider = new fb.GoogleAuthProvider();
          const redirect = function () { try { localStorage.setItem('setpoint-redirect', '1'); } catch (e) {} return fb.signInWithRedirect(auth, provider); };
          // Home-screen apps (iPhone especially) can't use pop-ups, so leave the page and come back instead.
          if (navigator.standalone || matchMedia('(display-mode: standalone)').matches) return redirect();
          return fb.signInWithPopup(auth, provider).catch(function (e) {
            if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return redirect();
            throw e;
          });
        });
      });
    }, function () { accountSheetOpen = false; });
  }

  // Delete the account and everything synced to it (the copy on this phone stays, so nothing is lost by accident).
  function deleteAccount() {
    confirmSheet('Delete your account?', 'This permanently deletes your account and everything synced to it: weigh-ins, food log, settings and progress photos. Your Study Planner account is the same account, so it will be deleted too. The data on this phone stays until you clear it in Settings. This can\'t be undone.', 'Delete account', true, function () {
      toast('Deleting your account…');
      loadFirebase().then(function () {
        const u = user; if (!u) throw { code: 'signed-out' };
        return fb.getDoc(phIdxRef()).then(function (snap) {
          const ids = Object.keys((snap.exists() && snap.data().items) || {}), refs = ids.map(phDocRef).concat([phIdxRef(), cloudRef()]);
          let chain = Promise.resolve();
          for (let i = 0; i < refs.length; i += 400) { const part = refs.slice(i, i + 400); chain = chain.then(function () { const bt = fb.writeBatch(db); part.forEach(function (r) { bt.delete(r); }); return bt.commit(); }); }
          return chain;
        }).then(function () { return u.delete(); });
      }).then(function () {
        state.sync = migrate({}).sync; state.ui.consentAt = null; quietSave = true; save(); quietSave = false;
        renderAccount(); buzz('medium'); toast('Account deleted. Your data on this phone is still here.');
      }).catch(function (e) {
        toast(e && e.code === 'auth/requires-recent-login' ? 'For safety, sign out and sign in again, then delete.' : 'Couldn\'t delete. Are you online?');
      });
    });
  }
  window.addEventListener('online', function () { renderAccount(); if (state.sync.uid) loadFirebase().then(function () { return state.sync.dirty ? push() : pull(false); }).catch(function () {}); });
  window.addEventListener('offline', renderAccount);

  /* ================= Data ================= */
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  // The backup file: everything (diary, foods, recipes, meals, water, weigh-ins, settings) plus your food and progress photos.
  const blobToUrl = function (b) { return new Promise(function (res) { const r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { res(null); }; r.readAsDataURL(b); }); };
  const urlToBlob = function (u) { return fetch(u).then(function (r) { return r.blob(); }); };
  function exportJSON() {
    state.ui.backupAt = Date.now(); save(); if (state.ui.tab === 'diary') renderDiary();
    const data = JSON.parse(JSON.stringify(state)); delete data.sync; delete data.ui;
    const ids = []; Object.keys(state.food).forEach(function (d) { state.food[d].forEach(function (it) { if (it.pic) ids.push(it.id); }); });
    toast('Preparing backup…');
    const foodPics = Promise.all(ids.map(function (id) { return picGet(id).then(function (b) { return b ? blobToUrl(b).then(function (u) { return [id, u]; }) : null; }, function () { return null; }); }));
    const bodyPics = photoTx('readonly', function (st) { return st.getAll(); }).then(function (list) {
      return Promise.all((list || []).map(function (r) { return Promise.all([blobToUrl(r.full), blobToUrl(r.thumb)]).then(function (u) { return { id: r.id, date: r.date, added: r.added, pose: r.pose || null, full: u[0], thumb: u[1] }; }); }));
    }, function () { return []; });
    Promise.all([foodPics, bodyPics]).then(function (r) {
      const fp = {}; r[0].forEach(function (x) { if (x && x[1]) fp[x[0]] = x[1]; });
      const out = Object.assign({ app: 'Setpoint', exported: new Date().toISOString(), version: APP_VERSION }, data, { foodPhotos: fp, bodyPhotos: r[1].filter(function (x) { return x.full; }) });
      download('setpoint-backup-' + todayISO() + '.json', JSON.stringify(out), 'application/json');
      const n = Object.keys(fp).length + out.bodyPhotos.length;
      toast('Backup saved' + (n ? ' · with ' + n + (n === 1 ? ' photo' : ' photos') : ''));
    });
  }
  // Put a backup's photos back on this phone.
  function restorePhotos(parsed) {
    const fp = parsed && parsed.foodPhotos && typeof parsed.foodPhotos === 'object' ? parsed.foodPhotos : {}, bp = parsed && Array.isArray(parsed.bodyPhotos) ? parsed.bodyPhotos : [];
    const jobs = Object.keys(fp).filter(function (id) { return typeof fp[id] === 'string' && fp[id].indexOf('data:image/') === 0; }).map(function (id) { return urlToBlob(fp[id]).then(function (b) { return picPut(id, b); }).catch(function () {}); });
    bp.forEach(function (x) { if (x && typeof x.full === 'string' && x.full.indexOf('data:image/') === 0 && typeof x.id === 'string') jobs.push(Promise.all([urlToBlob(x.full), urlToBlob(x.thumb || x.full)]).then(function (b) { return photoTx('readwrite', function (st) { st.put({ id: x.id.slice(0, 20), date: String(x.date || todayISO()).slice(0, 10), added: Number(x.added) || Date.now(), pose: ['front', 'side', 'back'].indexOf(x.pose) >= 0 ? x.pose : null, full: b[0], thumb: b[1] }); }); }).catch(function () {})); });
    return Promise.all(jobs).then(function () { loadPhotos(); renderDiary(); if (phUser()) photoSyncSoon(); });
  }
  // Everything you've eaten, one row per food, with every nutrient we know for it.
  function exportFood() {
    const dates = Object.keys(state.food).sort();
    if (!dates.length) { toast('No food logged yet'); return; }
    const go = function () {
      const q = function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
      const extra = NUTS.filter(function (n) { return ['kcal', 'p', 'c', 'f'].indexOf(n[0]) < 0; });
      const rows = [['date', 'time', 'category', 'food', 'amount', 'planned', 'kcal', 'protein_g', 'carbs_g', 'fat_g'].concat(extra.map(function (n) { return n[1] + ' (' + n[2] + ')'; }))];
      dates.forEach(function (d) { foodFor(d).forEach(function (it) {
        const nd = itemNutrients(it);
        rows.push([d, it.t || '', mealName(mealOf(it)), it.name || 'Quick add', it.ref ? fmtAmt(it.qty, it.unit) : '', it.plan ? 'yes' : '', it.kcal, it.protein, it.carbs, it.fat].concat(extra.map(function (n) { const v = nd ? nd[n[0]] : null; return v == null ? '' : Math.round(v * 100) / 100; })));
      }); });
      download('setpoint-food-' + todayISO() + '.csv', rows.map(function (r) { return r.map(q).join(','); }).join('\n'), 'text/csv');
      toast('Food log saved · ' + (rows.length - 1) + ' rows');
    };
    if (!foodDB && dates.some(dayNeedsDB)) { toast('Preparing…'); loadFoods().then(go, function () { toast('Couldn\'t load the food list. Try again online.'); }); } else go();
  }
  function exportCSV() {
    if (!entries().length) { toast('Nothing to export yet'); return; }
    const rows = [['date', 'weight_kg', 'weight_lb', 'trend_kg', 'kcal', 'note']];
    withTrend().forEach(function (e) { rows.push([e.date, e.kg.toFixed(2), (e.kg * LB).toFixed(1), e.trend.toFixed(2), dayKcal(e.date) || '', '"' + (e.note || '').replace(/"/g, '""') + '"']); });
    download('setpoint-' + todayISO() + '.csv', rows.map(function (r) { return r.join(','); }).join('\n'), 'text/csv');
    toast('CSV saved');
  }
  $('#importFile').addEventListener('change', function () {
    const f = this.files && this.files[0];
    this.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function () {
      let parsed;
      try { parsed = JSON.parse(reader.result); } catch (e) { toast('That isn\'t a Setpoint backup'); buzz('warn'); return; }
      const incoming = migrate(parsed), days = Object.keys(incoming.food).length;
      if (!incoming.entries.length && !incoming.phases.length && !days && !incoming.recipes.length && !incoming.myFoods.length) { toast('Nothing to restore in that file'); buzz('warn'); return; }
      const np = Object.keys(parsed.foodPhotos || {}).length + (Array.isArray(parsed.bodyPhotos) ? parsed.bodyPhotos.length : 0);
      confirmSheet('Restore backup?', '<b>' + days + '</b> ' + (days === 1 ? 'day' : 'days') + ' of food, <b>' + incoming.entries.length + '</b> ' + (incoming.entries.length === 1 ? 'weigh-in' : 'weigh-ins') + (np ? ' and <b>' + np + '</b> ' + (np === 1 ? 'photo' : 'photos') : '') + '. This replaces what\'s on this device.', 'Restore', false, function () {
        const snap = snapshot();
        incoming.ui = state.ui; incoming.seenVersion = state.seenVersion; incoming.sync = state.sync;
        state = incoming; markMilestonesSeen(); save(); applyAppearance(); renderAll(); buzz('success');
        restorePhotos(parsed);
        toast('Backup restored', function () { restore(snap); });
      });
    };
    reader.readAsText(f);
  });

  // Reads weight CSVs from other apps: finds the date and weight columns, the separator and the date order.
  function parseWeightCsv(text) {
    const lines = String(text).replace(/^﻿/, '').split(/\r?\n/).filter(function (l) { return l.trim() && !/^\s*#/.test(l); });
    if (!lines.length) return null;
    const delim = [';', '\t', ','].map(function (dl) { return [dl, lines[0].split(dl).length]; }).sort(function (a, b) { return b[1] - a[1]; })[0][0];
    const split = function (line) {
      const out = []; let cur = '', q = false;
      for (let i = 0; i < line.length; i++) { const ch = line[i]; if (ch === '"') q = !q; else if (ch === delim && !q) { out.push(cur.trim()); cur = ''; } else cur += ch; }
      out.push(cur.trim()); return out;
    };
    let rows = lines.map(split);
    const head = rows[0], hasHeader = head.some(function (h) { return /date|time|day|weight|mass|kg|lb/i.test(h); }) && !head.some(function (h) { return /^\d{4}-\d{2}-\d{2}/.test(h); });
    let di = 0, wi = 1, hdrUnit = null;
    if (hasHeader) {
      di = head.findIndex(function (h) { return /date|time|day/i.test(h); });
      wi = head.findIndex(function (h) { return /weight|body ?mass|^kg$|^lbs?$|\(kg\)|\(lbs?\)/i.test(h) && !/trend|goal|fat|bmi|change|lean|muscle|water|bone|diff/i.test(h); });
      const wh = head[wi] || '';
      hdrUnit = /lb|pound/i.test(wh) ? 'lb' : /kg|kilo/i.test(wh) ? 'kg' : null;
      rows = rows.slice(1);
    }
    if (di < 0 || wi < 0) return null;
    let order = null;
    rows.forEach(function (r) { const m = String(r[di] || '').match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/); if (m) { if (+m[1] > 12) order = 'dmy'; else if (+m[2] > 12 && !order) order = 'mdy'; } });
    if (!order) order = /^en-US/i.test(navigator.language || '') ? 'mdy' : 'dmy';
    const toIso = function (str) {
      let m = str.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);
      if (m) return m[1] + '-' + pad(+m[2]) + '-' + pad(+m[3]);
      m = str.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
      if (m) { let y = +m[3]; if (y < 100) y += 2000; const mo = order === 'dmy' ? +m[2] : +m[1], da = order === 'dmy' ? +m[1] : +m[2]; return mo >= 1 && mo <= 12 && da >= 1 && da <= 31 ? y + '-' + pad(mo) + '-' + pad(da) : null; }
      const t = Date.parse(str); return isNaN(t) ? null : isoOf(new Date(t));
    };
    const out = {}; let skipped = 0;
    rows.forEach(function (r) {
      const iso = toIso(String(r[di] || '')), v = parseFloat(String(r[wi] == null ? '' : r[wi]).replace(',', '.').replace(/[^\d.\-]/g, ''));
      if (!iso || !isFinite(v) || v <= 0 || iso > todayISO()) { skipped++; return; }
      if (!(iso in out)) out[iso] = v;
    });
    const dates = Object.keys(out).sort();
    if (!dates.length) return null;
    const vals = dates.map(function (dd) { return out[dd]; }).sort(function (a, b) { return a - b; }), med = vals[Math.floor(vals.length / 2)];
    return { dates: dates, values: out, unit: hdrUnit || (med > 200 ? 'lb' : unit()), skipped: skipped };
  }
  function csvImportSheet(res) {
    let u = res.unit, replace = false;
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Import weigh-ins</h2></div>' +
      '<div class="stat-box" style="margin-bottom:18px;text-align:center"><div class="num" style="font-size:30px">' + res.dates.length + '</div><div class="label faint">weigh-ins · ' + esc(fmtDate(res.dates[0], { month: 'short', day: 'numeric', year: 'numeric' })) + ' – ' + esc(fmtDate(res.dates[res.dates.length - 1], { month: 'short', day: 'numeric', year: 'numeric' })) + '</div></div>' +
      '<div class="field"><span>The file is in</span>' + segHtml('ciUnit', [['kg', 'kg'], ['lb', 'lb']], u) + '</div>' +
      '<label class="row" style="padding:12px 2px;border:0"><div class="grow"><div class="row-t">Replace days I already logged</div><div class="row-s" id="ciInfo"></div></div><span class="switch"><input type="checkbox" id="ciReplace" /><i></i></span></label>' +
      '<p class="t-sub" id="ciSample" style="margin:4px 2px 18px"></p>' +
      '<div class="btn-row"><button type="button" class="btn soft" id="ciNo">Cancel</button><button type="button" class="btn primary" id="ciGo">Import</button></div>',
      function (root) {
        const info = function () {
          const clash = res.dates.filter(function (dd) { return !!findEntry(dd); }).length, first = res.values[res.dates[res.dates.length - 1]];
          $('#ciInfo', root).textContent = clash ? clash + ' of these days are already logged' : 'None of these days are logged yet';
          $('#ciSample', root).textContent = 'Latest: ' + fmtDate(res.dates[res.dates.length - 1]) + ' · ' + first + ' ' + u + (unit() !== u ? ' (' + fmtW(u === 'lb' ? first / LB : first) + ' ' + unit() + ')' : '') + (res.skipped ? ' · ' + res.skipped + ' rows skipped' : '');
        };
        info();
        bindSeg(root, 'ciUnit', function (v) { u = v; info(); });
        $('#ciReplace', root).addEventListener('change', function () { replace = this.checked; });
        $('#ciNo', root).addEventListener('click', function () { closeSheet(); });
        $('#ciGo', root).addEventListener('click', function () {
          const snap = snapshot(); let n = 0;
          res.dates.forEach(function (dd) {
            const kg = u === 'lb' ? res.values[dd] / LB : res.values[dd];
            if (kg < 20 || kg > 400) return;
            const ex = findEntry(dd);
            if (ex && !replace) return;
            upsert({ date: dd, kg: Math.round(kg * 10000) / 10000, note: ex ? ex.note : '', kcal: ex ? ex.kcal : undefined });
            n++;
          });
          state.entries.forEach(function (e) { if (e.kcal === undefined) delete e.kcal; });
          markMilestonesSeen();
          save(); renderAll(); closeSheet(); buzz('success');
          toast(n ? 'Imported ' + n + ' weigh-in' + (n === 1 ? '' : 's') : 'Nothing new to import', n ? function () { restore(snap); } : null);
        });
      });
  }
  // Cronometer export: dailysummary.csv (nutrition per day and group) + servings.csv (the foods, for names and water).
  function parseCsv(text) {
    const rows = [], t = String(text).replace(/^\uFEFF/, ''); let row = [], cur = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (q) { if (ch === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += ch;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return c.trim(); }); });
  }
  const CRONO = { 'Energy': 'kcal', 'Protein': 'p', 'Carbs': 'c', 'Fat': 'f', 'Fiber': 'fib', 'Sugars': 'sug', 'Caffeine': 'caff', 'Alcohol': 'alc', 'Vitamin A': 'vA', 'Vitamin C': 'vC', 'Vitamin D': 'vD', 'Vitamin E': 'vE', 'Vitamin K': 'vK',
    'B1': 'b1', 'B2': 'b2', 'B3': 'b3', 'B5': 'b5', 'B6': 'b6', 'Folate': 'fol', 'B12': 'b12', 'Calcium': 'ca', 'Copper': 'cu', 'Iron': 'fe', 'Magnesium': 'mg', 'Manganese': 'mn', 'Phosphorus': 'ph', 'Potassium': 'k', 'Selenium': 'se', 'Sodium': 'na', 'Zinc': 'zn',
    'Saturated': 'sat', 'Monounsaturated': 'mono', 'Polyunsaturated': 'poly', 'Trans-Fats': 'trans', 'Cholesterol': 'chol', 'ALA': 'ala', 'EPA': 'epa', 'DHA': 'dha', 'LA': 'la' };
  // "Milk-Oatmeal, Milk-Oatmeal, Apple" → "Milk-Oatmeal ×2, Apple"
  function crName(names) { const c = {}, order = []; names.forEach(function (n) { n = n.replace(/ ×\d+$/, ''); if (!c[n]) { c[n] = 0; order.push(n); } c[n]++; }); return order.map(function (n) { return n + (c[n] > 1 ? ' ×' + c[n] : ''); }).join(', '); }
  function parseCronometer(texts) {
    let sum = null, serv = null;
    texts.forEach(function (t) { const r = parseCsv(t); if (!r.length) return; const h = r[0].map(function (x) { return x.trim(); }); if (h[0] === 'Date' && h.indexOf('Group') >= 0 && h.some(function (x) { return /^Energy/.test(x); })) sum = r; else if (h[0] === 'Day' && h.indexOf('Food Name') >= 0) serv = r; });
    if (!sum) return null;
    const h = sum[0].map(function (x) { return x.trim(); }), gi = h.indexOf('Group'), cols = [];
    h.forEach(function (name, i) { const base = name.replace(/\s*\(.*$/, ''), k = CRONO[base]; if (k && NUT[k]) cols.push({ i: i, k: k, iu: /\(IU\)/.test(name) }); });
    const foods = {}, water = {};
    if (serv) {
      const sh = serv[0].map(function (x) { return x.trim(); }), di = sh.indexOf('Day'), gj = sh.indexOf('Group'), ni = sh.indexOf('Food Name'), ai = sh.indexOf('Amount');
      serv.slice(1).forEach(function (r) {
        const d = r[di], g = (r[gj] || '').trim(), nm = (r[ni] || '').trim(), amt = (r[ai] || '').trim();
        if (!ISO_RE.test(d) || !nm) return;
        const m = /^([\d.]+)\s*(ml|mL)$/i.exec(amt);
        if (/^water$/i.test(nm) && m) { water[d] = (water[d] || 0) + parseFloat(m[1]); return; }
        (foods[d + '|' + g] = foods[d + '|' + g] || []).push((function (x) { return x.length > 36 ? x.slice(0, 36).replace(/\s+\S*$/, '') : x; })(nm.replace(/\s*,\s*/g, ' ')));
      });
    }
    const days = {};
    sum.slice(1).forEach(function (r) {
      const d = r[0], g = (r[gi] || '').trim();
      if (!ISO_RE.test(d) || !g || /^total$/i.test(g) || d > todayISO()) return;
      const v = {}; let any = false;
      cols.forEach(function (c) { const x = parseFloat(r[c.i]); if (isFinite(x) && x >= 0) { v[c.k] = c.iu ? x / 40 : x; any = true; } });
      if (!any || !(v.kcal >= 1)) return;
      const names = foods[d + '|' + g] || [];
      let name = names.length ? crName(names) : g; if (name.length > 80) name = name.slice(0, 78).replace(/[ ,]+\S*$/, '') + '…';
      (days[d] = days[d] || []).push({ group: g, name: name, v: v });
    });
    return { days: days, water: water, groups: Object.keys(days).reduce(function (a, d) { days[d].forEach(function (x) { if (a.indexOf(x.group) < 0) a.push(x.group); }); return a; }, []) };
  }
  function cronoSheet(res) {
    const dates = Object.keys(res.days).sort(), wdates = Object.keys(res.water).filter(function (d) { return d <= todayISO(); });
    const n = dates.reduce(function (a, d) { return a + res.days[d].length; }, 0);
    if (!dates.length) { toast('No food with calories found in that file'); buzz('warn'); return; }
    let skip = true;
    openSheet('<div class="sheet-head"><h2 class="sheet-title" id="sheetTitle">Import from Cronometer</h2></div>' +
      '<div class="stat-box" style="margin-bottom:14px;text-align:center"><div class="num" style="font-size:30px">' + dates.length + '</div><div class="label faint">days · ' + esc(fmtDate(dates[0], { month: 'short', day: 'numeric' })) + ' to ' + esc(fmtDate(dates[dates.length - 1], { month: 'short', day: 'numeric' })) + '</div></div>' +
      '<p class="t-sub" style="margin:0 2px 14px">Each meal comes in as one entry with its calories, macros, vitamins and minerals' + (wdates.length ? ', plus water on ' + wdates.length + ' days' : '') + '. Groups: ' + res.groups.map(esc).join(', ') + '.</p>' +
      '<label class="row" style="padding:12px 2px;border:0"><div class="grow"><div class="row-t">Skip days I already logged here</div><div class="row-s" id="crInfo"></div></div><span class="switch"><input type="checkbox" id="crSkip" checked /><span></span></span></label>' +
      '<div class="btn-row" style="margin-top:12px"><button type="button" class="btn soft" id="crNo">Cancel</button><button type="button" class="btn primary" id="crGo">Import</button></div>',
      function (root) {
        const own = function (d) { return foodFor(d).some(function (it) { return !/^cr-/.test(it.id); }); };
        const clash = dates.filter(own).length;
        $('#crInfo', root).textContent = clash ? clash + ' of these days already have food' : 'None of these days have food yet';
        $('#crSkip', root).addEventListener('change', function () { skip = this.checked; });
        $('#crNo', root).addEventListener('click', function () { closeSheet(); });
        $('#crGo', root).addEventListener('click', function () {
          const snap = snapshot();
          // Cronometer groups → your categories (adds any that are missing, like Pre-Workout).
          const norm = function (x) { return x.toLowerCase().replace(/[^a-z0-9]/g, ''); };
          let cats = MEALS.map(function (m) { return { k: m[0], n: m[1] }; });
          const keyFor = {};
          res.groups.forEach(function (g) {
            if (/^water$/i.test(g)) { keyFor[g] = (cats.find(function (c) { return c.k === 'snacks'; }) || cats[cats.length - 1]).k; return; }
            let c = cats.find(function (x) { return norm(x.n) === norm(g); });
            if (!c) { const dk = DEFAULT_MEALS.find(function (m) { return norm(m[1]) === norm(g); }); if (dk && !cats.some(function (x) { return x.k === dk[0]; })) c = { k: dk[0], n: dk[1] }; }
            if (!c && cats.length < 10) c = { k: 'g' + newId().replace(/[^a-z0-9]/g, '').slice(0, 8).padEnd(3, '0'), n: g.slice(0, 24) };
            if (c && cats.indexOf(c) < 0) cats.push(c);
            keyFor[g] = c ? c.k : cats[cats.length - 1].k;
          });
          const same = cats.length === DEFAULT_MEALS.length && cats.every(function (c, i) { return c.k === DEFAULT_MEALS[i][0] && c.n === DEFAULT_MEALS[i][1]; });
          state.settings.meals = same ? null : cats; applyMeals();
          let days = 0, entries = 0, wd = 0;
          dates.forEach(function (d) {
            if (skip && own(d)) return;
            const keep = foodFor(d).filter(function (it) { return !/^cr-/.test(it.id); });
            const add = res.days[d].map(function (x, i) {
              const v = x.v, nn = {}; Object.keys(v).forEach(function (k) { if (['kcal', 'p', 'c', 'f'].indexOf(k) < 0) nn[k] = Math.round(v[k] * 1000) / 1000; });
              return { id: 'cr-' + d.replace(/-/g, '') + '-' + i, kcal: Math.min(10000, Math.round(v.kcal)), protein: Math.round(v.p || 0), carbs: Math.round(v.c || 0), fat: Math.round(v.f || 0), name: x.name, meal: keyFor[x.group], n: nn };
            });
            state.food[d] = keep.concat(add); days++; entries += add.length;
          });
          wdates.forEach(function (d) { if (skip && waterOn(d)) return; state.water[d] = Math.min(10000, Math.round(res.water[d])); wd++; });
          save(); renderAll(); closeSheet(); buzz('success');
          toast(days ? 'Imported ' + days + ' days' + (wd ? ' and water' : '') : 'Nothing new to import', days ? function () { restore(snap); } : null);
        });
      });
  }
  $('#cronoFile').addEventListener('change', function () {
    const fs = Array.prototype.slice.call(this.files || []); this.value = '';
    if (!fs.length) return;
    Promise.all(fs.map(function (f) { return f.text ? f.text() : new Promise(function (ok) { const r = new FileReader(); r.onload = function () { ok(r.result); }; r.readAsText(f); }); })).then(function (texts) {
      const res = parseCronometer(texts);
      if (!res) { toast(texts.length === 1 ? 'Pick dailysummary.csv too (it has the nutrition)' : 'Those don\'t look like Cronometer files'); buzz('warn'); return; }
      cronoSheet(res);
    });
  });
  $('#csvFile').addEventListener('change', function () {
    const f = this.files && this.files[0]; this.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = function () { const res = parseWeightCsv(r.result); if (!res) { toast('Couldn\'t find dates and weights in that file'); buzz('warn'); return; } csvImportSheet(res); };
    r.readAsText(f);
  });

  // Swipe a logged food to the right for a ⋯ button; tap it for Copy, Adjust (recipes) and Delete.
  function swSet(w, mode, v) {
    // mode: '' (closed), 'open' (⋯ showing), 'expanded' (buttons showing). The row springs there from wherever it
    // is, starting at v (finger speed, px/ms) after a swipe; the buttons stay visible until it has covered them.
    const row = w.lastElementChild;
    w.classList.toggle('open', mode === 'open'); w.classList.toggle('expanded', mode === 'expanded');
    if (row._run) { row._run.stop(); row._run = null; }
    const from = nowAt(row).x, to = mode ? w.firstElementChild.offsetWidth : 0;
    row.style.transition = 'none';
    if (calmMotion() || !row.animate || Math.abs(to - from) < 0.5) { row.style.transform = to ? 'translateX(' + to + 'px)' : ''; w.classList.remove('settling'); }
    else {
      w.classList.add('settling');
      const r = row._run = springGroup([[row, { transform: 'translateX(' + from + 'px)' }, { transform: 'translateX(' + to + 'px)' }]], { response: 0.36, damping: 0.88, v: (v || 0) * Math.sign(to - from), dist: Math.abs(to - from) });
      r.onEnd = function () { if (row._run !== r) return; row._run = null; w.classList.remove('settling'); if (!to) row.style.transform = ''; };
    }
    $$('.sw-btn', w).forEach(function (b) { b.tabIndex = mode ? 0 : -1; });
  }
  // Hold a row (or grab its handle), drag it, drop it. Other rows slide out of the way; the page scrolls at the edges.
  // onDrop(row, target, dropBefore): drop before `target` (or after it when dropBefore is false).
  let dragActive = false;
  function dragSort(box, sel, onDrop, opts) {
    opts = opts || {};
    let src = null, timer = null, on = false, y0 = 0, x0 = 0, py = 0, flow = [], tops = [], si = 0, h = 0, ins = 0, sc = null, sc0 = 0, raf = 0, mk = null, home = null;
    const scroller = function () { const sh = box.closest('.sheet'); return sh && sh.classList.contains('open') ? sh : document.scrollingElement; };
    const start = function (id) {
      on = true; dragActive = true;
      flow = $$(sel + (opts.also ? ', ' + opts.also : ''), box);
      si = flow.indexOf(src); ins = si;
      tops = flow.map(function (el) { const r = el.getBoundingClientRect(); return { top: r.top, mid: r.top + r.height / 2, bot: r.bottom }; });
      h = src.getBoundingClientRect().height; sc = scroller(); sc0 = sc.scrollTop;
      // Rows in separate cards (the Diary): leave the others still and show a line where it will land.
      if (opts.marker) {
        box.classList.add('drag-on'); home = opts.marker === true ? null : src.closest(opts.marker); if (home) home.classList.add('drag-home');
        mk = document.createElement('div'); mk.className = 'drop-line'; box.appendChild(mk);
      } else flow.forEach(function (el) { if (el !== src) el.style.transition = 'transform .18s cubic-bezier(.2,.8,.2,1)'; });
      src.classList.add('lifted'); buzz('medium'); try { src.setPointerCapture(id); } catch (x) {}
      tick();
    };
    // Where the row would land, given the finger (positions are from the start, adjusted for scrolling).
    const place = function () {
      const y = py + (sc.scrollTop - sc0);
      src.style.transform = 'translateY(' + (y - y0) + 'px) scale(1.02)';
      let k = 0; for (let i = 0; i < flow.length; i++) { if (i === si) continue; if (y > tops[i].mid) k = i < si ? i + 1 : i; }
      if (y < tops[0].mid) k = 0;
      ins = k;
      if (mk) {
        const others = tops.filter(function (t, i) { return i !== si; }), br = box.getBoundingClientRect(), shift = sc.scrollTop - sc0;
        const yv = k === si || !others.length ? null : k > 0 ? others[k - 1].bot : others[0].top;
        mk.style.opacity = yv == null ? '0' : '1';
        if (yv != null) mk.style.transform = 'translateY(' + (yv - shift - br.top - 1.5) + 'px)';
        return;
      }
      flow.forEach(function (el, i) { if (i === si) return; const dy = si < ins && i > si && i <= ins ? -h : si > ins && i >= ins && i < si ? h : 0; el.style.transform = dy ? 'translateY(' + dy + 'px)' : ''; });
    };
    const tick = function () {
      if (!on) return;
      const vh = sc === document.scrollingElement ? innerHeight : sc.getBoundingClientRect().bottom, vt = sc === document.scrollingElement ? 0 : sc.getBoundingClientRect().top;
      const edge = 70, sp = py < vt + edge ? -Math.ceil((vt + edge - py) / 6) : py > vh - edge - 80 ? Math.ceil((py - (vh - edge - 80)) / 6) : 0;
      if (sp) sc.scrollTop += sp;
      place(); raf = requestAnimationFrame(tick);
    };
    box.addEventListener('pointerdown', function (e) {
      const r = e.target.closest(sel); if (!r || !box.contains(r)) return;
      if (opts.handle ? !e.target.closest(opts.handle) : e.target.closest('input, select, .sw-acts, [data-eat]')) return;
      if (swOpen) return;
      src = r; x0 = e.clientX; y0 = py = e.clientY; on = false;
      if (opts.handle) { e.preventDefault(); start(e.pointerId); }
      else { const id = e.pointerId; timer = setTimeout(function () { if (src) start(id); }, 380); }
    });
    box.addEventListener('pointermove', function (e) {
      if (!src) return;
      if (!on) { if (Math.abs(e.clientX - x0) > 8 || Math.abs(e.clientY - y0) > 8) { clearTimeout(timer); src = null; } return; }
      py = e.clientY;
    });
    const end = function () {
      clearTimeout(timer); if (!src) return;
      const s0 = src, was = on; src = null; on = false; cancelAnimationFrame(raf);
      if (!was) return;
      dragActive = false;
      const stop = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
      document.addEventListener('click', stop, true); setTimeout(function () { document.removeEventListener('click', stop, true); }, 80);
      const moved = ins !== si, others = flow.filter(function (el) { return el !== s0; });
      const reset = function () { s0.classList.remove('lifted'); flow.forEach(function (el) { el.style.transition = ''; el.style.transform = ''; }); box.classList.remove('drag-on'); if (home) home.classList.remove('drag-home'); if (mk) mk.remove(); mk = null; home = null; };
      if (!moved) { s0.style.transition = 'transform .15s ease'; s0.style.transform = ''; setTimeout(reset, 160); if (opts.onHold) opts.onHold(s0); return; }
      reset();
      // ins = where it lands among the other rows (0 = before the first one)
      const k = ins;
      if (k < others.length) onDrop(s0, others[k], true); else onDrop(s0, others[others.length - 1], false);
    };
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  }
  document.addEventListener('touchmove', function (e) { if (dragActive) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('.sw, [data-ing]')) e.preventDefault(); });
  function swClose() { if (!swOpen) return; const r = swOpen; swOpen = null; swSet(r, ''); }
  function swMore(w) { swSet(w, 'expanded'); swOpen = w; buzz('light'); }
  (function swipeFood() {
    const list = $('#mealList'), fs = fingerSpeed();
    let w = null, row = null, x0 = 0, y0 = 0, dx = 0, base = 0, swiping = false, open = 0;
    list.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.sw-acts')) return;
      const s = e.target.closest('.sw');
      if (swOpen && swOpen !== s) swClose();
      if (!s) return;
      w = s; row = s.lastElementChild;
      if (row._run) { row._run.stop(); row._run = null; } // still sliding: take hold of it where it is
      base = Math.max(0, nowAt(row).x);
      x0 = e.clientX; y0 = e.clientY; dx = base; swiping = false; fs.reset(); fs.add(e.clientX, e.timeStamp);
    });
    list.addEventListener('pointermove', function (e) {
      if (!w) return;
      if (dragActive) { w = null; return; }
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!swiping) {
        if (Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my) * 1.5 && (mx > 0 || base)) { swiping = true; try { row.setPointerCapture(e.pointerId); } catch (x) {} w.classList.add('dragging'); open = w.querySelector('.sw-acts').offsetWidth; }
        else if (Math.abs(my) > 10) { w = null; return; }
        else return;
      }
      fs.add(e.clientX, e.timeStamp);
      dx = Math.max(0, base + mx);
      const lim = Math.max(base, open); if (dx > lim) dx = lim + rubber(dx - lim, 70); // a little give past the end
      row.style.transition = 'none'; row.style.transform = 'translateX(' + dx + 'px)';
    });
    const end = function (e) {
      if (!w) return;
      const s = w; w = null;
      if (!swiping) { if (base > 0.5 && base < (s.firstElementChild.offsetWidth || 1) - 0.5) swSet(s, s.classList.contains('expanded') ? 'expanded' : s.classList.contains('open') ? 'open' : ''); return; } // caught mid-slide, then let go
      s.classList.remove('dragging');
      // Stop the tap that follows a drag from opening the food.
      const stop = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
      document.addEventListener('click', stop, true); setTimeout(function () { document.removeEventListener('click', stop, true); }, 60);
      // where the flick would carry it decides: open (keeping the buttons it showed) or closed
      if (e && e.clientX != null) fs.add(e.clientX, e.timeStamp); // where the finger lifted counts too
      const v = e ? fs.get(e.timeStamp) : 0, proj = dx + v * 160, was = s.classList.contains('expanded') ? 'expanded' : s.classList.contains('open') ? 'open' : '';
      const keepW = was ? s.firstElementChild.offsetWidth : open;
      if (proj > keepW / 2 && v > -0.4) { const fresh = !was; swSet(s, was || 'open', v); swOpen = s; if (fresh) buzz('light'); }
      else { swSet(s, '', v); if (swOpen === s) swOpen = null; }
    };
    list.addEventListener('pointerup', end);
    list.addEventListener('pointercancel', end);
  })();
  document.addEventListener('pointerdown', function (e) { if (swOpen && !e.target.closest('#mealList')) swClose(); }, true);
  dragSort($('#mealList'), '.sw:not([data-nodrag])', function (src, tgt, before) {
    const d = viewDay, arr = foodFor(d).slice(), i = arr.findIndex(function (x) { return x.id === src.dataset.sw; });
    if (i < 0) return;
    const it = arr.splice(i, 1)[0];
    if (tgt.dataset.mh) {
      const mi = MEALS.findIndex(function (m) { return m[0] === tgt.dataset.mh; });
      if (before && mi > 0) { it.meal = MEALS[mi - 1][0]; let j = -1; arr.forEach(function (x, i) { if (mealOf(x) === it.meal && !isDailyTotal(x)) j = i; }); arr.splice(j < 0 ? arr.length : j + 1, 0, it); }
      else { it.meal = tgt.dataset.mh; const j = arr.findIndex(function (x) { return mealOf(x) === it.meal && !isDailyTotal(x); }); arr.splice(j < 0 ? arr.length : j, 0, it); }
    }
    else { const t = arr.find(function (x) { return x.id === tgt.dataset.sw; }); if (!t) return; it.meal = mealOf(t); let j = arr.indexOf(t); if (!before) j++; arr.splice(j, 0, it); }
    state.food[d] = arr; save(); renderAll(); buzz('success');

  }, { also: '.meal-head', marker: '.meal-sec', onHold: function (w) { if (w.dataset.sw) quickSheet(w.dataset.sw, viewDay); } });

  // Swipe a weigh-in left to delete it (with Undo).
  (function swipeToDelete() {
    const list = $('#entryList'), fs = fingerSpeed();
    let row = null, x0 = 0, y0 = 0, dx = 0, swiping = false, swallow = false;
    list.addEventListener('pointerdown', function (e) { const r = e.target.closest('[data-edit]'); if (!r || r._run) return; row = r; x0 = e.clientX; y0 = e.clientY; dx = 0; swiping = false; fs.reset(); fs.add(e.clientX, e.timeStamp); });
    list.addEventListener('pointermove', function (e) {
      if (!row) return;
      const mx = e.clientX - x0, my = e.clientY - y0;
      if (!swiping) {
        if (mx < -10 && Math.abs(mx) > Math.abs(my) * 1.5) { swiping = true; try { row.setPointerCapture(e.pointerId); } catch (x) {} row.parentElement.classList.add('swiping'); }
        else if (Math.abs(my) > 10 || mx > 10) { row = null; return; }
      }
      if (swiping) { fs.add(e.clientX, e.timeStamp); dx = Math.min(0, mx); row.style.transition = 'none'; row.style.transform = 'translateX(' + dx + 'px)'; const armed = dx < -90; if (armed !== row.classList.contains('del-armed')) { row.classList.toggle('del-armed', armed); buzz('light'); } }
    });
    const end = function (e) {
      if (!row) return;
      const r = row; row = null;
      if (!swiping) return;
      swallow = true; setTimeout(function () { swallow = false; }, 60);
      r.parentElement.classList.remove('swiping');
      // past the mark, or flicked away: it slides off at the finger's speed and is deleted; otherwise it springs back
      if (e && e.clientX != null) fs.add(e.clientX, e.timeStamp);
      const v = e ? fs.get(e.timeStamp) : 0, W = r.offsetWidth, gone = dx < -90 || (v < -0.6 && dx < -36);
      const to = gone ? -W * 1.1 : 0, after = function () {
        r._run = null;
        if (!gone) { r.style.transform = ''; r.classList.remove('del-armed'); return; }
        const snap = snapshot(), when = r.dataset.edit;
        state.entries = state.entries.filter(function (x) { return x.date !== when; });
        save(); renderAll(); buzz('medium');
        toast('Deleted ' + fmtDate(when), function () { restore(snap); });
      };
      if (gone) r.classList.add('del-armed');
      if (calmMotion() || !r.animate) { r.style.transform = gone ? 'translateX(-110%)' : ''; after(); return; }
      r._run = springGroup([[r, { transform: 'translateX(' + dx + 'px)' }, { transform: 'translateX(' + to + 'px)' }]], { response: gone ? 0.3 : 0.36, damping: gone ? 1 : 0.86, v: gone ? -v : v, dist: Math.abs(to - dx), noOver: gone });
      r._run.onEnd = after;
    };
    list.addEventListener('pointerup', end); list.addEventListener('pointercancel', end);
    list.addEventListener('click', function (e) { if (swallow) { e.stopPropagation(); e.preventDefault(); } }, true);
  })();

  /* ================= Events ================= */
  // Holding a switch: its knob turns into a glass bubble (like iPhone), and stays glass while it slides across.
  (function () {
    let held = null, tm = 0; // the knob stays glass a moment after you let go, while it slides
    const off = function () { const h = held; held = null; clearTimeout(tm); if (h) tm = setTimeout(function () { h.classList.remove('sw-press'); }, 360); };
    document.addEventListener('pointerdown', function (e) { const w = e.target.closest && e.target.closest('.switch, .mini-sw'); if (!w) return; clearTimeout(tm); if (held && held !== w) held.classList.remove('sw-press'); held = w; w.classList.add('sw-press'); }, true);
    ['pointerup', 'pointercancel'].forEach(function (t) { document.addEventListener(t, off, true); });
  })();
  // Switching a segmented control: the selected highlight glides to the new option (even when the control re-renders).
  document.addEventListener('click', function (e) {
    const b = e.target.closest && e.target.closest('.seg button'); if (!b || calmMotion()) return;
    const seg = b.closest('.seg'), old = seg.querySelector('button[aria-pressed="true"]'); if (!old || old === b || b.disabled) return;
    const sr = seg.getBoundingClientRect(), or = old.getBoundingClientRect(), st = getComputedStyle(old);
    const from = { x: or.left - sr.left, y: or.top - sr.top, w: or.width, bg: st.backgroundColor, sh: st.boxShadow, r: st.borderRadius }, cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2;
    requestAnimationFrame(function () {
      let s2 = seg.isConnected ? seg : null;
      if (!s2) { const at = document.elementFromPoint(cx, cy); s2 = at && at.closest('.seg'); }
      if (!s2) return; const nb = s2.querySelector('button[aria-pressed="true"]'), r2 = s2.getBoundingClientRect(); if (!nb || Math.abs(r2.top - sr.top) > 40) return;
      const nr = nb.getBoundingClientRect(), x = nr.left - r2.left, y = nr.top - r2.top, g = document.createElement('span');
      g.className = 'seg-glide'; g.setAttribute('aria-hidden', 'true');
      g.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + nr.width + 'px;height:' + nr.height + 'px;background:' + from.bg + ';box-shadow:' + from.sh + ';border-radius:' + from.r;
      s2.appendChild(g); s2.classList.add('gliding');
      const a = g.animate([{ transform: 'translate(' + (from.x - x) + 'px,' + (from.y - y) + 'px)', width: from.w + 'px' }, { transform: 'none', width: nr.width + 'px' }], { duration: 380, easing: 'cubic-bezier(.3,1.2,.4,1)' });
      a.onfinish = a.oncancel = function () { s2.classList.remove('gliding'); setTimeout(function () { g.remove(); }, 200); };
    });
  }, true);
  $$('.tab-btn').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.tab !== b.dataset.tab) { if (b.dataset.tab === 'diary') viewDay = todayISO(), renderDiary(); showTab(b.dataset.tab); } else if (b.dataset.tab === 'foods' && (foodsView || foodsSearch)) { foodsView = null; foodsSearch = false; $('#mfQ').value = ''; renderFoods(); window.scrollTo(0, 0); } else window.scrollTo({ top: 0, behavior: 'smooth' }); }); });
  $$('#progSeg button').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.prog !== b.dataset.prog) showProg(b.dataset.prog); }); });
  $$('[data-back]').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.tab === 'targets' && tgView) tgClose(); else goBack(); }); });
  $$('[data-day]').forEach(function (b) { b.addEventListener('click', function () { const n = dayNum(viewDay) + Number(b.dataset.day); if (n > dayNum(todayISO()) + PLAN_DAYS) return; viewDay = isoFromDay(n); buzz('light'); renderDiary(); }); });
  $('#dayPick').addEventListener('change', function () { if (this.value && this.value <= isoFromDay(dayNum(todayISO()) + PLAN_DAYS)) { viewDay = this.value; renderDiary(); } });
  $('.day-title').addEventListener('click', function (e) { const i = $('#dayPick'); if (e.target === i && i.showPicker) { try { i.showPicker(); } catch (x) {} } });
  $('.tabbar-inner').addEventListener('keydown', function (e) {
    const order = ['diary', 'progress', 'foods', 'you'], cur = state.ui.tab === 'settings' || state.ui.tab === 'targets' ? 'you' : state.ui.tab;
    let i = Math.max(0, order.indexOf(cur));
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') i = (i + ((e.key === 'ArrowRight') !== (document.dir === 'rtl') ? 1 : order.length - 1)) % order.length; else return;
    showTab(order[i]); $('#tab-' + order[i]).focus();
  });
  $$('#viewSeg button').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.view === b.dataset.view) return; state.ui.view = b.dataset.view; showAllEntries = false; save(); buzz('light'); renderProgress(); }); });
  // A new range: the chart sweeps in from the left instead of swapping in place.
  const chartSweep = function (box) {
    const svg = box && box.querySelector('svg'); if (!svg || !svg.animate || calmMotion()) return;
    svg.animate([{ clipPath: 'inset(0 100% 0 0)', opacity: .4 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1 }], { duration: 620, easing: 'cubic-bezier(.22,1,.36,1)' });
  };
  $$('#rangeSeg button').forEach(function (b) { b.addEventListener('click', function () { if (state.ui.range === +b.dataset.range) return; state.ui.range = +b.dataset.range; save(); buzz('light'); renderChart(); renderProgress(); $$('#rangeSeg button').forEach(function (x) { x.setAttribute('aria-pressed', +x.dataset.range === state.ui.range); }); if (state.ui.prog === 'nutrition') { renderTrend(); chartSweep($('#trendBox')); } else chartSweep($('#chart')); }); });
  $$('[data-setting]').forEach(function (seg) {
    $$('button', seg).forEach(function (b) {
      b.addEventListener('click', function () {
        const key = seg.dataset.setting;
        if (state.settings[key] === b.dataset.v) return;
        state.settings[key] = b.dataset.v; save(); buzz('light');
        if (key === 'lang') { flushSave(); location.reload(); return; } // a clean redraw in the new language
        restyle(function () { applyAppearance(); renderAll(); });
      });
    });
  });
  $('#hapticsToggle').addEventListener('change', function () { state.settings.haptics = this.checked; save(); buzz('medium'); });
  $('#explodeToggle').addEventListener('change', function () { state.settings.explode = this.checked; save(); buzz('medium'); });
  // Search settings by any word on a row (or its group).
  $('#setQ').addEventListener('input', function () {
    const q = normText(this.value).trim(); let any = false;
    $$('#panel-settings .set-group').forEach(function (g) {
      const gl = normText(g.querySelector('.group-label').textContent); let n = 0;
      $$('.set-list > .row', g).forEach(function (r) { const hit = !q || (gl + ' ' + normText(r.textContent)).indexOf(q) >= 0; r.classList.toggle('sq-out', !hit); if (hit && !r.hidden) n++; });
      g.classList.toggle('sq-out', !n); if (n) any = true;
    });
    $('#setNone').hidden = any;
  });
  $('#oledToggle').addEventListener('change', function () { state.settings.oled = this.checked; save(); buzz('light'); const on = this.checked, t = this; setTimeout(function () { if (t.checked === on) restyle(applyAppearance); }, 300); }); // after the knob has slid
  $('#numpadToggle').addEventListener('change', function () { state.settings.numpad = this.checked; save(); buzz('medium'); });
  $('#fastToggle').addEventListener('change', function () { state.settings.fasting = this.checked; save(); buzz('medium'); renderAll(); });
  $('#lockToggle').addEventListener('change', function () {
    const el = this;
    if (el.checked) lockSetup().then(function () { buzz('success'); toast('App lock is on'); }, function () { el.checked = false; toast('App lock wasn\'t turned on'); });
    else lockVerify().then(function () { localStorage.removeItem(LOCK_KEY); buzz('light'); toast('App lock is off'); }, function () { el.checked = true; });
  });
  $('#weekStartSel').addEventListener('change', function () { state.settings.weekStart = +this.value; save(); buzz('light'); renderAll(); });
  $('#autoAdjToggle').addEventListener('change', function () { state.settings.autoAdjust = this.checked; save(); buzz('medium'); renderAll(); });

  document.addEventListener('click', function (e) {
    if (sheet.contains(e.target)) return; // sheets bind their own controls
    if (e.target.closest('[data-water-add]')) { const ws = state.settings.waterSizes[0], prev = addWater(viewDay, ws); toast('+' + fmtWater(ws) + ' water', function () { state.water[viewDay] = prev; if (!prev) delete state.water[viewDay]; save(); renderDiary(); }); return; }
    if (e.target.closest('#waterTile')) { buzz('light'); waterSheet(viewDay); return; }
    if (e.target.closest('[data-hl-edit]')) { buzz('light'); highlightsSheet(); return; }
    const rx = e.target.closest('[data-ram-x], [data-ram-x2]');
    if (rx) { if (rx.dataset.ramX) state.ui.ramAsk = rx.dataset.ramX; else state.ui.ramOff = rx.dataset.ramX2; save(); buzz('light'); renderDiary(); return; }
    const ro = e.target.closest('[data-ram-off]');
    if (ro) { const snap = snapshot(); state.settings.ramadan = null; state.ui.ramOff = ro.dataset.ramOff; applyMeals(); save(); renderAll(); buzz('success'); toast('Ramadan mode off', function () { restore(snap); }); return; }
    const hxb = e.target.closest('[data-hint-x]');
    if (hxb) {
      const snap = snapshot(), t = todayISO(), o = state.ui.hintOff && state.ui.hintOff.d === t ? state.ui.hintOff : { d: t, k: [] };
      if (o.k.indexOf(hxb.dataset.hintX) < 0) o.k.push(hxb.dataset.hintX);
      state.ui.hintOff = o; save(); buzz('light'); renderDiary(); toast('Hidden for today', function () { restore(snap); }); return;
    }
    if (e.target.closest('[data-plan-day]')) { buzz('light'); planDaySheet(); return; }
    const srcb = e.target.closest('[data-src]');
    if (srcb) { buzz('light'); sourcesSheet(srcb.dataset.src, srcb.dataset.days ? todayISO() : viewDay, +srcb.dataset.days || 1); return; }
    if (e.target.closest('[data-hi-find]')) { buzz('light'); highInSheet('fib'); return; }
    const lg = e.target.closest('[data-log-ref]');
    if (lg) { const f = getFood(lg.dataset.logRef); if (f) { buzz('light'); addFoodSheet(null, todayISO(), null, f); } return; }
    const eat = e.target.closest('[data-eat]');
    if (eat) { const it = foodFor(viewDay).find(function (x) { return x.id === eat.dataset.eat; }); if (it) { const snap = snapshot(); delete it.plan; if (viewDay === todayISO() && !it.t) it.t = nowHM(); save(); renderAll(); eatenFlash(it.id); buzz('success'); toast('Eaten · ' + (it.name || 'food'), function () { restore(snap); }); } return; }
    const mt = e.target.closest('[data-mt]'); if (mt) { measKey = mt.dataset.mt; buzz('light'); renderBody(); return; }
    if (e.target.closest('[data-bk-later]')) { state.ui.backupLater = Date.now() + 7 * 864e5; save(); buzz('light'); renderDiary(); return; }
    if (e.target.closest('[data-gs-hide]')) { state.ui.gsHide = true; save(); buzz('light'); renderDiary(); return; }
    const gs = e.target.closest('[data-gs]');
    if (gs) { buzz('light'); const k = gs.dataset.gs; if (k === 'targets') showTab('targets'); else if (k === 'food') addFoodSheet(); else if (k === 'water') waterSheet(todayISO()); else logSheet(); return; }
    const gh = e.target.closest('[data-gap-hide]');
    if (gh) { state.ui.gapHide = gh.dataset.gapHide; save(); buzz('light'); renderDiary(); return; }
    const gf = e.target.closest('[data-gap-f]');
    if (gf) { const f = getFood(gf.dataset.gapF); if (f) { buzz('light'); addFoodSheet(null, viewDay, null, f); } return; }
    const gq = e.target.closest('[data-gap-high]');
    if (gq) { buzz('light'); highInSheet(gq.dataset.gapHigh); return; }
    if (e.target.closest('[data-wr-hide]')) { state.ui.weekSeen = weekStart(dayNum(todayISO())); save(); buzz('light'); renderDiary(); return; }
    if (e.target.closest('[data-month-report]')) { buzz('light'); shareMonth(); return; }
    const ntp = e.target.closest('[data-nt-plan]');
    if (ntp) { buzz('light'); if (ntp.dataset.ntPlan === 'kcal') tgOpen('goal'); else macrosSheet(); return; }
    const tgb = e.target.closest('[data-tg]');
    if (tgb && state.ui.tab === 'targets') { buzz('light'); tgOpen(tgb.dataset.tg); return; }
    const cm = e.target.closest('[data-cal-m]');
    if (cm) { calOff = Math.max(0, calOff + Number(cm.dataset.calM)); buzz('light'); const c = $('.cal-card'); if (c) c.outerHTML = calCard(); return; }
    const cd = e.target.closest('[data-cal-day]');
    if (cd) { buzz('light'); viewDay = cd.dataset.calDay; renderDiary(); showTab('diary'); return; }
    const sxb = e.target.closest('[data-same-x]');
    if (sxb) { const m = sxb.dataset.sameX, sx = state.ui.sameX && state.ui.sameX.d === viewDay ? state.ui.sameX : { d: viewDay, m: [] }; if (sx.m.indexOf(m) < 0) sx.m.push(m); state.ui.sameX = sx; save(); buzz('light'); renderDiary(); return; }
    const sy = e.target.closest('[data-same]');
    if (sy) { const its = sameItems(sy.dataset.same); if (its.length) copyFood(its.map(function (it) { return Object.assign(repItemCopy(it), { meal: sy.dataset.same }, it.t ? { t: it.t } : {}); }), viewDay, viewDay === todayISO() ? 'Added from yesterday' : 'Added from the day before'); return; }
    const us = e.target.closest('[data-usual]');
    if (us) { const u = usualFor(us.dataset.usual); if (u) { const snap = snapshot(); addItems(viewDay, u.map(function (it) { const c = Object.assign({}, it, { id: newId(), meal: us.dataset.usual }); delete c.plan; delete c.pic; delete c.note; delete c.u; return c; })); save(); renderAll(); buzz('success'); toast('Added your usual ' + mealName(us.dataset.usual).toLowerCase(), function () { restore(snap); }); } return; }
    const hi = e.target.closest('#nutBox [data-high], #mealList [data-high]');
    if (hi) { buzz('light'); highInSheet(hi.dataset.high); return; }
    const a = e.target.closest('[data-action]');
    if (a) {
      const act = a.dataset.action;
      if (act === 'log') logSheet();
      else if (act === 'log-day') logSheet(viewDay);
      else if (act === 'day-menu') { buzz('light'); dayMenu(viewDay); }
      else if (act === 'nutrients') { buzz('light'); nutrientsSheet(viewDay); }
      else if (act === 'day-score') { buzz('light'); dayScoreSheet(viewDay); }
      else if (act === 'go-targets') { showTab('targets'); }
      else if (act === 'sync-now') { buzz('light'); if (!navigator.onLine) toast('You\'re offline. It syncs when you\'re back.'); else { const b = $('.yh-sync'); if (b) b.classList.add('spin'); pull(true).then(function () { if (b) b.classList.remove('spin'); toast(syncError ? 'Couldn\'t sync. Try again in a moment.' : 'Synced'); }); } }
      else if (act === 'fast') { buzz('light'); fastSheet(); }
      else if (act === 'nut-targets') { closeSheet(); if (state.ui.tab !== 'targets') showTab('targets'); tgOpen('cal'); setTimeout(function () { const x = $('#ntTable .nt-sec:nth-child(3)'); if (x) x.scrollIntoView({ block: 'start' }); }, 60); }
      else if (act === 'add') addFoodSheet(null, state.ui.tab === 'diary' ? viewDay : todayISO());
      else if (act === 'goal') goalSheet();
      else if (act === 'theme') { buzz('light'); themeSheet(); }
      else if (act === 'photo-compare') { buzz('light'); photoCompare(); }
      else if (act === 'photo-all') { buzz('light'); photoGallery(); }
      else if (act === 'photo-play') { buzz('light'); photoTimelapse(); }
      else if (act === 'use-bf') { const snap = snapshot(); state.profile.bodyFat = +a.dataset.bf; save(); renderAll(); buzz('success'); toast('Body fat ' + a.dataset.bf + '% · targets updated', function () { restore(snap); }); }
      else if (act === 'new-phase') phaseSheet();
      else if (act === 'details') detailsSheet();
      else if (act === 'activity') activitySheet();
      else if (act === 'real-tdee') realTdeeSheet();
      else if (act === 'macros') macrosSheet();
      else if (act === 'guest') guestSheet();
      else if (act === 'import-csv') $('#csvFile').click();
      else if (act === 'import-crono') $('#cronoFile').click();
      else if (act === 'measure') measureSheet();
      else if (act === 'add-photo') addPhotoFlow();
      else if (act === 'flex') { buzz('light'); flexSheet(); }
      else if (act === 'insights') { buzz('light'); insightsSheet(); }
      else if (act === 'ramadan') { buzz('light'); ramadanSheet(); }
      else if (act === 'cycle') { buzz('light'); cycleSheet(); }
      else if (act === 'food') addFoodSheet();
      else if (act === 'adjust-info') adjustSheet();
      else if (act === 'tg-explain') { buzz('light'); targetExplainSheet(); }
      else if (act === 'account') accountSheet();
      else if (act === 'week') weekSheet(weekStart(dayNum(todayISO())));
      else if (act === 'week-review') { buzz('light'); weekReviewSheet(weekStart(dayNum(todayISO())) - 7); }
      else if (act === 'training') { buzz('light'); trainSheet(); }
      else if (act === 'data-backup') { buzz('light'); dataSheet('backup'); }
      else if (act === 'data-import') { buzz('light'); dataSheet('import'); }
      else if (act === 'week-at') weekSheet(+a.dataset.start);
      else if (act === 'whats-new') whatsNewSheet();
      else if (act === 'legal') { buzz('light'); legalSheet(); }
      else if (act === 'export-json') exportJSON();
      else if (act === 'health') { buzz('light'); healthSheet(); }
      else if (act === 'backups') { buzz('light'); backupsSheet(); }
      else if (act === 'achievements') { buzz('light'); achievementsSheet(); }
      else if (act === 'dups') { buzz('light'); dupsSheet(); }
      else if (act === 'chart-kcal') { state.ui.chartKcal = !state.ui.chartKcal; save(); buzz('light'); renderChart(); $('#ckToggle').setAttribute('aria-pressed', !!state.ui.chartKcal); }
      else if (act === 'export-csv') exportCSV();
      else if (act === 'export-food') exportFood();
      else if (act === 'import') $('#importFile').click();
      else if (act === 'check-update') checkUpdate();
      else if (act === 'show-all') { showAllEntries = true; renderProgress(); }
      else if (act === 'erase') {
        if (!entries().length && !state.phases.length && !state.settings.goalKg && !Object.keys(state.food).length && !state.myFoods.length && !state.recipes.length && !state.meals.length) { toast('Nothing to erase'); return; }
        confirmSheet('Erase everything?', 'Removes every weigh-in, food log, your own foods, recipes, meals, water, fasting and measurements from this device' + (state.sync.uid ? ' and your account.' : '.') + ' Your settings stay.', 'Erase', true, function () {
          const snap = snapshot();
          state.entries = []; state.phases = []; state.settings.goalKg = null; state.food = {}; state.myFoods = []; state.favs = []; state.offFoods = []; state.recipes = []; state.meals = [];
          state.water = {}; state.goals = {}; state.dayType = {}; state.measures = []; state.fast = { goal: state.fast.goal, start: null, log: [] };
          save(); renderAll(); buzz('warn');
          toast('Erased', function () { restore(snap); });
        });
      }
      return;
    }
    const ed = e.target.closest('[data-edit]');
    if (ed) { buzz('light'); logSheet(ed.dataset.edit); return; }
    const dp = e.target.closest('[data-del-phase]');
    if (dp) {
      const date = dp.dataset.delPhase, snap = snapshot();
      state.phases = state.phases.filter(function (x) { return x.date !== date; });
      save(); renderAll(); buzz('medium');
      toast('Phase removed', function () { restore(snap); });
      return;
    }
    const dir = e.target.closest('[data-dir]');
    if (dir) {
      const v = dir.dataset.dir;
      if (v === currentPace().dir) return;
      setPace(v, v === 'lose' ? 1 : 0); // defaults: lose 0.5 kg (1 lb), gain 0.25 kg (0.5 lb)
      save(); buzz('light'); renderAll();
      return;
    }
    const rate = e.target.closest('[data-rate]');
    if (rate) { setPace(currentPace().dir, +rate.dataset.rate); save(); buzz('light'); renderAll(); return; }
    const am = e.target.closest('[data-add-meal]');
    if (am) { addFoodSheet(am.dataset.addMeal, viewDay); return; }
    const fo = e.target.closest('[data-fold]');
    if (fo) {
      const k = fo.dataset.fold, i = state.ui.folded.indexOf(k), box = fo.nextElementSibling;
      if (i >= 0) state.ui.folded.splice(i, 1); else state.ui.folded.push(k); save(); buzz('light'); fo.setAttribute('aria-expanded', i >= 0);
      // History and Phases open and fold smoothly (what's below moves with them)
      box.getAnimations && box.getAnimations().forEach(function (a) { a.cancel(); });
      if (calmMotion() || !box.animate) { box.hidden = i < 0; return; }
      box.style.overflow = 'hidden';
      if (i >= 0) { box.hidden = false; const h = box.offsetHeight; box.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = function () { box.style.overflow = ''; }; }
      else { const h = box.offsetHeight, a = box.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }); a.onfinish = function () { box.hidden = true; box.style.overflow = ''; a.cancel(); }; }
      return;
    }
    const tg = e.target.closest('[data-toggle-meal]');
    if (tg) {
      const k = tg.dataset.toggleMeal, i = state.ui.shut.indexOf(k), body = (tg.closest('.meal-sec') || document).querySelector('.meal-body');
      const flip = function () { const j = state.ui.shut.indexOf(k); if (j >= 0) state.ui.shut.splice(j, 1); else state.ui.shut.push(k); save(); renderDiary(); };
      buzz('light');
      if (calmMotion()) { flip(); return; }
      // folding: the foods tuck away first (and stay tucked while the Diary redraws); opening: the meals below glide
      // down to make room while the foods fade in
      if (i < 0 && body && body.animate) { body.style.overflow = 'hidden'; body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 220, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).onfinish = flip; return; }
      flip();
      const nb = i >= 0 && ($('[data-mh="' + k + '"]') || { closest: function () { return null; } }).closest('.meal-sec'), b2 = nb && nb.querySelector('.meal-body');
      if (b2 && b2.animate) b2.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 40, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      return;
    }
    const mm = e.target.closest('[data-meal-menu]');
    if (mm) { buzz('light'); mealSheet(mm.dataset.mealMenu, viewDay); return; }
    const smo = e.target.closest('[data-sw-more]');
    if (smo) { swMore(smo.closest('.sw')); return; }
    const sa = e.target.closest('[data-sw-act]');
    if (sa) {
      const id = sa.dataset.id, k = sa.dataset.swAct, it = foodFor(viewDay).find(function (x) { return x.id === id; }); swClose();
      if (!it) return;
      if (k === 'del') removeFoodItem(id, viewDay);
      else if (k === 'copy') { buzz('light'); copyItemSheet(id, viewDay); }
      else { buzz('light'); addFoodSheet(null, viewDay, it, null, true); }
      return;
    }
    const qa = e.target.closest('.food-item .row-v');
    if (qa && !swOpen && !qa.closest('.day-total')) { e.stopPropagation(); quickAmount(qa, qa.closest('[data-food]').dataset.food); return; }
    const pc = e.target.closest('[data-pic]');
    if (pc) { e.stopPropagation(); buzz('light'); picView(pc.dataset.pic); return; }
    const fi = e.target.closest('[data-food]');
    if (fi) { if (swOpen) { swClose(); return; } buzz('light'); foodItemSheet(fi.dataset.food, viewDay); return; }
    const phb = e.target.closest('[data-photo]');
    if (phb) { photoSheet(phb.dataset.photo); return; }
    const go = e.target.closest('[data-go]');
    if (go) showTab(go.dataset.go);
  });

  let resizeT = null;
  window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(renderChart, 120); });
  let lastDay = todayISO();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      if (todayISO() !== lastDay) { lastDay = todayISO(); viewDay = lastDay; applyRepeats(); renderAll(); }
      else if (applyRepeats()) renderAll();
      const tn = autoTune(); if (tn) { renderAll(); tuneToast(tn); }
      if (swReg) swReg.update().catch(function () {});
      if (user) { if (state.sync.dirty) push(); else pull(false); photoSyncSoon(4000); }
    } else maybeReload(true);
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); applyAppearance(); renderAll(); } });

  /* ================= Offline + self-update ================= */
  let swReg = null, pendingReload = false;
  function maybeReload(force) {
    if (!pendingReload) return;
    if (force || !sheet.classList.contains('open') || document.visibilityState === 'hidden') { pendingReload = false; location.reload(); }
  }
  function checkUpdate() {
    if (!swReg) { toast(navigator.onLine ? 'You\'re up to date' : 'You\'re offline'); return; }
    toast('Checking…');
    swReg.update().then(function () { setTimeout(function () { if (!pendingReload) toast('Up to date · v' + APP_VERSION); }, 1200); })
      .catch(function () { toast('Couldn\'t check. Are you offline?'); });
  }
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (!hadController) return;
        pendingReload = true;
        setTimeout(maybeReload, 600);
      });
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        swReg = reg;
        setInterval(function () { if (reg) reg.update().catch(function () {}); }, 60 * 60 * 1000);
        // Also look for a new version whenever the app comes back to the screen.
        document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') reg.update().catch(function () {}); });
      }).catch(function () {});
    });
    setInterval(function () { maybeReload(); }, 5000);
  }

  // Pinch-to-zoom stays available (accessibility); only double-tap zoom is turned off, so quick taps don't zoom.
  document.addEventListener('dblclick', function (e) { e.preventDefault(); }, { passive: false });

  /* ================= Start ================= */
  load();
  loadPhotos();
  let backFromGoogle = false; try { backFromGoogle = localStorage.getItem('setpoint-redirect') === '1'; } catch (e) {}
  if (state.sync.uid || backFromGoogle) loadFirebase().catch(function () { renderAccount(); });
  applyAppearance();
  showTab(state.ui.tab, true);
  // the first page eases in as the app opens
  (function () { const p0 = $('main > .tab-panel:not([hidden])'); if (p0 && !calmMotion()) { p0.classList.add('panel-in'); setTimeout(function () { p0.classList.remove('panel-in'); }, 400); } })();
  if (state.ui.tab === 'targets' || state.ui.tab === 'settings') navPush('page');
  renderAll();
  setTimeout(prefetchFoods, 4000);
  setInterval(function () { if (state.fast.start && state.settings.fasting && state.ui.tab === 'diary' && document.visibilityState === 'visible') renderDiary(); }, 30000);
  // Show "Updated" once per version: it counts as seen as soon as it appears (it used to only
  // count once What's new was opened, so it kept coming back).
  setTimeout(checkStorage, 3000);
  setTimeout(function () { if (achLine == null) achLine = achText(); }, 2000); // ready before You is first opened
  setTimeout(function () { snapHooks(); }, 2600); // what page slides need from the stylesheet, read once while idle
  // Older saves: count milestones already reached as celebrated, so nobody gets a pile of old confetti.
  if (state.ui.milestones === null) { state.ui.milestones = reachedMilestones().map(function (m) { return m.key; }); save(); }
  // Home-screen shortcuts open straight into logging (?action=log) or food (?action=food).
  // Shared recipe/meal links (#s=…), on open or while the app is already open.
  const takeShare = function (delay) { if (!/^#s=/.test(location.hash)) return; const h = location.hash.slice(3); history.replaceState(null, '', location.pathname + location.search); setTimeout(function () { openShared(h); }, delay); };
  takeShare(500); window.addEventListener('hashchange', function () { takeShare(50); });
  const shortcut = new URLSearchParams(location.search).get('action');
  if (shortcut) history.replaceState(null, '', location.pathname);
  // Graphite is the main theme now: switch once from the old default (Emerald). Any theme you choose after that stays.
  if (!state.ui.smartBurn) { state.ui.smartBurn = true; if (state.profile.tdeeSource === 'calc') state.profile.tdeeSource = 'auto'; save(); renderAll(); }
  if (!state.ui.graphite) { state.ui.graphite = true; if (state.settings.style === 'classic') { state.settings.style = 'graphite'; applyAppearance(); renderAll(); } save(); }
  if (applyRepeats()) renderAll();
  // Repeat items with a set time are added when that time comes, even with the app open.
  setInterval(function () { if (document.visibilityState === 'visible' && !dragActive && todayISO() === lastDay && applyRepeats()) renderAll(); }, 30000);
  const isNew = !state.seenVersion && !state.entries.length && !state.profile.sex && !state.sync.uid && !state.ui.onboarded;
  // Updates install quietly, like big apps. Only a new feature worth showing gets a one-time spotlight.
  const news = state.seenVersion !== APP_VERSION && (state.seenVersion || state.entries.length) ? featureNews(state.seenVersion) : null, showUpdate = !!news;
  if (state.seenVersion !== APP_VERSION) { state.seenVersion = APP_VERSION; save(); }
  const updateToast = function () { if (news) setTimeout(function () { if (!sheet.classList.contains('open')) spotlightSheet(news); }, 500); };
  // Weekly check-in: once, on the first open of a new week, for the week that just ended.
  const lastWeek = weekStart(dayNum(todayISO())) - 7, lw = weekStats(lastWeek);
  const tuned = isNew ? null : autoTune();
  if (isNew) setTimeout(function () { welcomeSheet(1); }, 350);
  else if (shortcut === 'log' || shortcut === 'food' || shortcut === 'scan' || shortcut === 'water') { showTab('diary', true); setTimeout(function () { if (shortcut === 'log') logSheet(); else if (shortcut === 'scan') addFoodSheet(null, null, null, null, false, null, true); else if (shortcut === 'water') waterSheet(todayISO()); else addFoodSheet(); }, 250); }
  else if (state.ui.checkin !== lastWeek && lw && lw.n >= 2) {
    state.ui.checkin = lastWeek; save();
    if (tuned) renderAll();
    const t = state.ui.tune && state.ui.tune.at >= lastWeek ? state.ui.tune : null;
    setTimeout(function () { weekSheet(lastWeek, true, updateToast, t); }, 600);
  } else { updateToast(); if (tuned) { renderAll(); setTimeout(function () { tuneToast(tuned); }, showUpdate ? 5200 : 700); } }
})();
