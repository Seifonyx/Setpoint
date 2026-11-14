# Setpoint

**Before any suggestion, review or change to the app, follow the rules in AGENTS.md** (inspect the real app first,
research how top apps do it, check for vibe-coding mistakes, back every recommendation with internal and external
evidence, and verify the actual behaviour afterwards). They are imported here:

@AGENTS.md

Weight and food tracker PWA. Live at https://setpoint-tracker.web.app (Firebase project `setpoint-tracker`).

- Code lives in `src/*.js`; `node tools/build.js` joins them into `app.js` and stamps the sw.js cache.
- Every new user-facing string needs an Arabic entry in `ar.js` (keyed by the English text).
- Release: bump `APP_VERSION` and add a plain-words CHANGES entry in `src/01-version.js`, bump `?v=` in index.html and `version` in package.json, build, run `npm test`, then deploy with `node tools/deploy.js` (Firebase Hosting REST API; credentials come from the session proxy).
- Test at phone size (iPhone 13+) in light and dark, English and Arabic.
- Commit and push to `main` after each shipped update.

## iPhone app (ios/)
- Native SwiftUI app, minimum iOS 26. There's no Mac: code is built by GitHub Actions (`.github/workflows/ios.yml`) from `ios/project.yml` via XcodeGen.
- Results: the `ios-latest` release (Setpoint.ipa + simulator screenshots); a failed build posts `build.log`/`sim.log` to the `ios-log` release. Both are public downloads.
- The user installs the .ipa with SideStore. The web app is retired (the user calls it useless): don't update or deploy it, and don't hold the iPhone app back to stay compatible with it. The iPhone app is the product; aim for exceptional. The data can grow iPhone-only parts (kept under root["ios"], preserved through migrate/sync by the engine wrapper), as long as existing synced data keeps working.
- Progress: Phase 0 done (build pipeline, SideStore source at sidestore.json). Phase 1 done (web-format Store, backup import/export, Diary with targets/meals/weight/water/actions/undo, food details, day swipe, daily totals). Phase 2 + 3 done (Add food sheet, barcode/OFF, Plan screens). Phase 4 (Progress: Swift Charts), Phase 5 (Account.swift: Firebase REST auth + Firestore, same docs as web, merge via engine `syncMerge`; Google sign-in through `ios-signin.html` on the site, which is in deploy.js), Phase 6 (App/Extras.swift: reminders, Face ID lock, haptics, settings; App/Intents.swift: Siri/Shortcuts) done. Phase 7: Health is being tested (needs SideStore to keep the HealthKit permission); widgets + Live Activity done for free (ios/Widgets, App Group shared with the app via Shared/WidgetShared.swift; SideStore renames the group, read from ALTAppGroups). Phase 8 in progress: see ios/PARITY.md. Design: warm & editorial (App/Design.swift, Brand), dial icon with dark variant (ios/icon/). Every push to main is released straight to ios-latest + sidestore.json (no approval needed); screenshots are taken after the release and also land on ios-preview. Only when the user asks to see an update first, put [preview] in the commit message (then it stays on ios-preview until a manual run or a normal push). Bigger work awaiting approval lives on its own branch (e.g. `redesign`): pushes there only make previews; merge to main to release. Search and maths are the web app's own JS: `node tools/ios-engine.js` bundles src/02-05,10 + ar.js + `tools/ios-engine-api.js` into `ios/Setpoint/Resources/engine.js` (and copies foods.json); CI runs it, both are gitignored. Next: the ⬜ items in ios/PARITY.md.
- Plan: 0 foundation · 1 diary · 2 adding food · 3 plan & maths (golden tests vs web) · 4 progress · 5 Firebase account & sync (same data as web) · 6 free iPhone extras · 7 paid extras (Health, widgets, Live Activity) · 8 parity & switch-over.
