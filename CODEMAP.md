# CODEMAP

One line per folder and key file. Read this before searching the code; keep it updated when files are added, moved or removed.
The old web app at the repo root is frozen: ignore it.

## The app: `ios/`
- `ios/project.yml` XcodeGen project (targets, sources, entitlements); `ios/FEATURES.md` feature list and what's left.
- `ios/Setpoint/App/` app shell:
  - `SetpointApp.swift` entry point; `RootView.swift` tabs, sign-in overlay, dial flight, launch hooks (`-tab`, `-sheet`, `-open`).
  - `Design.swift` Brand colours, fonts, Radius/Motion, `CalorieDial`, `BrandCardStyle`, `PaperBackground`.
  - `Components.swift` shared views (incl. `LaunchDial`); `BrandSection.swift` section styling; `BrandTabBar.swift` tab bar.
  - `TabMemory.swift` when tabs keep your place: tap the open tab to go back to its main screen (Diary: today); back after an hour or on a new day, every tab starts fresh.
  - `DialHandoff.swift` state + `FlyingDial` for the sign-in dial flying into the Diary dial.
  - `Health.swift` Apple Health; `Intents.swift` Siri/Control intents; `WidgetBridge.swift` data to widgets; `Sounds.swift`; `UpdateCheck.swift` update check (installs the new build with AltStore); `Extras.swift` small helpers.
- `ios/Setpoint/Features/` screens:
  - `AuthFlow.swift` sign-in / create-account card; `Onboarding.swift` first plan set-up; `AccountView.swift` account settings.
  - `Diary/` `DiaryView.swift` main day screen + summary dial, `MealSection.swift` meal rows + drag, `FoodDetailSheet.swift`, `Sheets.swift`.
  - `AddFood/` `AddFoodSheet.swift` search/add, `BarcodeScreen.swift`, `LabelScan.swift`, `PlatePhoto.swift`, `VoiceInput.swift`, `FoodAmountView.swift`, `UnitPicker.swift`.
  - `Plan/` `PlanView.swift` your plan, `GuestPlanView.swift` plan for someone else, `PlanOptions.swift`, `PlanSheets.swift`.
  - `ProgressScreen.swift` weight/trend charts; `TargetsView.swift`, `TargetExplainer.swift` targets and why; `NutrientsView.swift`; `WeekAndAchievements.swift`, `WeekStory.swift`, `Coaching.swift` weekly review.
  - `FoodsView.swift` My foods; `Duplicates.swift` merge duplicates; `RecipeEditor.swift`, `ImportRecipe.swift`, `MealEditor.swift`, `MealsAndRepeats.swift`; `DayPlanner.swift` planner.
  - `YouView.swift` settings tab; `BodyFasting.swift`, `Ramadan.swift`, `PhotosView.swift`, `ExportView.swift`, `LegalView.swift`.
- `ios/Setpoint/Model/` data: `Store.swift` the one JSON root + saving; `Account.swift` Firebase sign-in + sync; `Engine.swift` Swift side of the JS engine (`SP.*`); `Models.swift` Totals/DayPlan etc.; `Format.swift`; `JSONValue.swift`.
- `ios/Setpoint/Shared/` code shared with widgets (`QuickActions.swift`, `WidgetShared.swift`).
- `ios/Setpoint/Resources/` `Localizable.xcstrings` English + Egyptian Arabic strings (sorted keys); `Demo.json` demo data; `Legal.json` (built); `Assets.xcassets`, `Fonts/`, `Sounds/`; `engine.js` and `foods.json` here are build output (gitignored).
- `ios/Widgets/` widgets and Live Activity. `ios/UITests/DiaryDragTests.swift` all UI tests (3 methods). `ios/icon/` app icon sources. `ios/legal/` legal pages (HTML) + `build.js`.

## Engine: `engine/`
- `engine/src/NN-*.js` the app's search and maths, joined in order: storage, helpers, migrate, weight maths, energy maths, food database (`06`), language, sync merge, cycle/Ramadan/insights, nutrients, water, diary maths, week review, achievements, planner, `16-api.js` (the `SP.*` API Swift calls).
- `engine/ar.js` Egyptian Arabic for text the engine hands out; `build.js` writes `ios/Setpoint/Resources/engine.js` and copies `foods.json`; `search-check.js` search regression check; `check-recipe-import.js`.

## Food list and backend
- `foods.json` the built-in food list; `tools/foods/` rebuilds it (`off_fetch.py` → `build.py` → `verify.py` → `complete.py`; `egypt_dishes.py`, `usda-branded.json`).
- `firestore.rules`, `firebase.json` Firebase backend (project `setpoint-tracker`).

## Build and release
- `.github/workflows/ios.yml` CI: check → device, tests (3 jobs), shots → release → preview.
- `sidestore.json` SideStore source (written by CI); `HANDOFF.md` state of the project; `CLAUDE.md`, `AGENTS.md` rules.
- `handoff/` (gitignored) short .md files passed between threads: plans, reviews, status.

## Frozen web app (do not edit)
- Root `index.html`, `app.js`, `ar.js`, `src/`, `tests/`, `tools/build.js`, `tools/deploy.js`, `server.js`, `sw.js`, etc.
