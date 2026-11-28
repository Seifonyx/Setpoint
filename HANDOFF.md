# Setpoint — handoff (25 Nov 2026)

Read `CLAUDE.md` and `AGENTS.md` first: they hold the standing rules (inspect first, research top apps, Setpoint's own
identity, Egyptian Arabic for every string, test → publish → check release policy).

## What the project is
Setpoint is a native iPhone app (SwiftUI, iOS 26+) for tracking food, nutrients and weight, with targets that learn
from your results. English and Egyptian Arabic. Installed with SideStore from this repo's releases. The old web app
(PWA at setpoint-tracker.web.app) is **abandoned**: the owner wants it left in the repo and online, untouched, and
not used by the app.

## Current state
- **Latest release: build 190** (`c166e4d`, SideStore commit `c79d4b1`) on `ios-latest` + `sidestore.json`. All checks
  clean: build, 3 UI tests, screenshots, search check 181/181, no crash files.
- Shipped this session (on `main`):
  - Build 188/189: **Possible duplicates** in My foods (engine `dupGroups`/`mergeFoods` = the web app's rules; merge
    moves diary, recipes, meals, favorites; Undo restores the whole root). `ios/Setpoint/Features/Duplicates.swift`.
  - Build 190: **Plan › Someone else** (engine `guestPlan` = `energyFor` + `planFor` on `root["guest"]`, never your
    profile). `ios/Setpoint/Features/Plan/GuestPlanView.swift`. Arabic added for plan warnings that were missing.
  - Build 190: the flaky Diary drag test fixed (slow, held nudges that don't coast a row under the top bar; retry when
    the list reports no move) and the three drag checks are now real assertions. All passed in 190.
  - UI checks added: duplicates merge + undo (testMenusAndSignIn), someone-else numbers + Clear (testInputsAndCrashes).
- **Build 191** (`2fd6a7f`, SideStore commit `5aa96e0`): `standalone-engine` merged; the app no longer builds from
  the web sources (details below). First CI build from `engine/`: build, 3 UI tests, search check 181/181 all passed.
  The release job failed once on a transient `gh release` error ("release not found" then "already exists") and
  passed on a re-run of the failed job. The `standalone-engine` branch still exists on GitHub (sessions can't delete
  branches); it's fully merged and can be deleted from GitHub.

## Where everything lives
- Repo `Seifonyx/Setpoint`. Branches: `main` (releases), `redesign` (last commit 13 Nov, previews only, already superseded by main) and `release` (last commit 11 Nov, old,
  unused by CI). CI only runs on `main` and `redesign` pushes (and manual runs).
- Layout:
  - `ios/` the app (`project.yml` for XcodeGen; `Setpoint/App|Features|Model|Resources|Shared`, `Widgets/`, `UITests/`,
    `icon/`, `legal/` + `legal/build.js` → `Resources/Legal.json`). Feature list: `ios/FEATURES.md` (was PARITY.md).
  - `engine/` the app's search and maths in JS, run by JavaScriptCore: `src/01-…16-*.js` (16-api.js is what
    `Engine.swift` calls as `SP.*`), `ar.js` (Arabic for engine text), `build.js` (→ `ios/Setpoint/Resources/engine.js`
    + copies `foods.json`; both gitignored), `search-check.js`, `check-recipe-import.js`.
  - `foods.json` + `tools/foods/` food list pipeline (`off_fetch.py` → `build.py` → `verify.py` → `complete.py`).
  - `firestore.rules`, `firebase.json` backend config. Everything else at the root is the frozen web app.
- Services: Firebase project `setpoint-tracker` (Auth via REST + Firestore; same documents/format the web used, so
  existing accounts keep working), Google sign-in straight from the app (ASWebAuthenticationSession, iOS OAuth client;
  `ios-signin.html` is **not** used), Open Food Facts (barcodes/online search), GitHub releases for install/updates
  (`App/UpdateCheck.swift` reads `sidestore.json` at most every 3 h).
- CI `.github/workflows/ios.yml`: `check` (Linux: engine build, search check, decides if UI tests are needed; food-list-only
  pushes skip them) → `device` (.ipa), `test` (3 jobs: testDragFoods, testInputsAndCrashes, testMenusAndSignIn — keep
  them independent and about equally long), `shots` → `release` (only if tests pass and nothing crashed) → `preview`.
  ≈13 min for app changes. Results on the `ios-preview` release: `drag-results.txt`, `check-results-*.txt`,
  `uitest-log-*.txt`, `search-check.txt`, `crash-*.txt`, screenshots. Read via REST
  (`gh api repos/Seifonyx/Setpoint/releases/tags/ios-preview`, then `releases/assets/<id>` with
  `Accept: application/octet-stream`); `gh release` GraphQL commands are blocked in sessions.

## Decisions and why
- **Abandon the web, don't delete it** (owner's call). The app must not need the website to run or build. Runtime was
  already independent; the build-time dependency is removed on `standalone-engine`.
- **Engine kept in JavaScript for now**, moved into `engine/` as plain files containing exactly the code the bundle
  used. Proof of no behaviour change: `engine/build.js` produced a byte-identical `engine.js` to the old
  `tools/ios-engine.js` (compared with `cmp`). Follows Apple's guidance that an app owns its code in its own repo
  (developer.apple.com/documentation/xcode/organizing-your-code-with-local-packages).
- Root `ar.js` was put back for the web; the app has its own copy `engine/ar.js`. The two will now drift — that's
  intended. Edit only the engine copy.
- Legal pages: the app's own copies in `ios/legal/` (privacy, terms, cookies, refunds).
- SideStore source `website` field now points to the GitHub repo instead of the web app.
- `.gitattributes` forces LF: a Windows clone with CRLF broke the engine build (migrate went missing) and CI shell steps.
- Duplicates row in My foods only appears when there's something to merge (like Photos' Duplicates album). Undo banner
  there only shows for a merge made on that screen.
- Someone-else values are written back with Western digits so they always read back (Arabic-Indic typing is accepted).

## Gotchas and rules
- Release policy (AGENTS.md): push finished work to `main` without `[preview]`; CI tests before releasing; then check
  every result file and the screenshots; fix and push again until clean; report plainly what couldn't be checked.
- Every new string: Egyptian Arabic in `ios/Setpoint/Resources/Localizable.xcstrings` (keep sorted keys, 2-space JSON,
  trailing newline) or `engine/ar.js` for engine text.
- `Text(cond ? "a" : "b")` can resolve to a plain String and skip Arabic: wrap one branch in `LocalizedStringKey(...)`.
- No Mac: Swift only compiles in CI. Test engine changes locally with Node (`node engine/build.js` and a vm script
  calling `SP.*`); keep `engine/search-check.js` green.
- Logged food links (`ref`) survive `migrate` only with `g`, `qty` and `unit`; ids must match `^[ucor][\w-]{1,23}$`.
- Never two simulators on one Mac (slower); fast-animations test mode was tried and dropped.
- Session network allowlist includes the restaurant chains' sites, USDA FDC and Open Food Facts.

## Open bugs / loose ends
- Some screenshots come out blank (black) at random in every build (190 and 191 alike: different screens each time);
  the `shots` job captures before the screen draws. Not an app bug, but it hides screens from review.
- Someone else: typed boxes show Western digits while results use Arabic-Indic (cosmetic).
- `ios/legal` HTML still links fonts from the old site's folder (harmless: only text is extracted).
- Updates now go through AltStore (`UpdateCheck.install()`: `altstore://install?url=`, then SideStore, then the release page).
- Restaurant items still estimates: Burger King, Costa, Pizza Hut, Starbucks mochas, Dunkin' coffees, Domino's/Papa
  John's Egypt, local places.

## Next steps, in priority order
1. Done: `standalone-engine` merged and released as build 191, all checks clean.
2. Done: `ios/legal/privacy.html` now matches `Legal.json` (regenerating gives no diff).
3. Confirm Apple Health on the real phone and mark it ✅ in `ios/FEATURES.md`.
4. Optional, larger: port the engine from JavaScript to Swift (a local Swift package, e.g. `SetpointCore`), one area at
   a time, each proven against the JS engine's outputs on fixed inputs (golden tests), as Shopify did moving to native
   (shopify.engineering/helix). Then drop JavaScriptCore. Not started; needs the owner's go-ahead.
5. Wire the SideStore fork's URL scheme into UpdateCheck when that project provides it.
