# Setpoint

**Before any suggestion, review or change to the app, follow the rules in AGENTS.md** (inspect the real app first,
research how top apps do it, check for vibe-coding mistakes, back every recommendation with internal and external
evidence, and verify the actual behaviour afterwards). They are imported here:

@AGENTS.md

Setpoint is a native iPhone app (SwiftUI, iOS 26+) for tracking food, nutrients and weight, with targets that learn
from your results. It stands on its own: it never needs the website to run or to build.

## Working rules for threads
- **Read `CODEMAP.md` before searching the code** (one line per folder and key file). **Keep it updated** when files are
  added, moved or removed.
- **Pass plans, reviews and status as short `.md` files in `handoff/`** (gitignored, in the project folder), and keep chat
  messages between threads to one line that names the file.

## Where things are
| Folder | What it is |
|---|---|
| `ios/` | The app: `project.yml` (XcodeGen), `Setpoint/` (App, Features, Model, Resources, Shared), `Widgets/`, `UITests/`, `icon/`, `legal/` |
| `engine/` | The app's own search and maths in JavaScript, run inside the app by JavaScriptCore. `src/NN-*.js` in order, `ar.js` (Egyptian Arabic for text the engine hands out), `build.js`, `search-check.js`, `check-recipe-import.js` |
| `foods.json` | The built-in food list, copied into the app by `engine/build.js` |
| `tools/foods/` | Rebuilds `foods.json` (see Food list) |
| `ios/legal/` | The app's legal pages (HTML); `node ios/legal/build.js` turns them into `ios/Setpoint/Resources/Legal.json` |
| `firestore.rules`, `firebase.json` | The cloud backend (Firebase Auth + Firestore, project `setpoint-tracker`) the app syncs with |
| `.github/workflows/ios.yml` | Build, tests, screenshots and release |
| Everything else at the root (`src/`, `index.html`, `app.js`, root `ar.js`, `tests/`, `tools/build.js`, `tools/deploy.js`…) | **The old web app: abandoned and frozen.** Don't edit, build or deploy it, and never copy changes into it. The app doesn't use any of it. |

## The app
- There's no Mac: GitHub Actions builds it from `ios/project.yml` with XcodeGen.
- Screens are native SwiftUI; search, targets, expenditure, sync merging, nutrients and the planner come from
  `engine/` (`Engine.swift` calls `SP.*` in `engine/src/16-api.js`). `engine/build.js` writes
  `ios/Setpoint/Resources/engine.js` and copies `foods.json`; CI runs it, and both outputs are gitignored. To change
  search or maths, edit `engine/src/` and run `node engine/build.js && node engine/search-check.js`.
- Every user-facing string needs Egyptian Arabic: Swift text in `ios/Setpoint/Resources/Localizable.xcstrings`
  (sorted keys, 2-space JSON), text from the engine in `engine/ar.js` (keyed by the English text).
- Data: one JSON document (`Store.root`) in the original Setpoint format, so existing synced accounts keep working.
  iPhone-only parts live under `root["ios"]`. Account and sync: `Model/Account.swift` (Firebase REST; Google sign-in
  straight from the app with ASWebAuthenticationSession, email sign-in), merged with the engine's `syncMerge`.
- Other services the app talks to: Open Food Facts (barcodes and online search), and GitHub for update checks
  (`sidestore.json`, `App/UpdateCheck.swift`).
- Design: warm & editorial (`App/Design.swift`, `Brand`); dial icon with a dark variant (`ios/icon/`).
- Screenshot hooks (launch arguments): `-demo YES` (demo data from `Resources/Demo.json`), `-tab diary|progress|foods|you`,
  `-sheet …`, `-open …` (e.g. `plan`, `guest`, `mine`, `dups`, `recipe`, `planner`). Use them to reach a screen you changed.
- Features and what's left: `ios/FEATURES.md`.

## Build, test, release
Every push to `main` that touches `ios/`, `engine/`, `foods.json` or the workflow is tested before it's released:
- `check` (Linux): builds the engine, runs the search check (`engine/search-check.js`, must stay green) and decides
  whether UI tests are needed (not when only the food list changed).
- On separate Macs at once, reusing cached build folders (files dated by their last commit): `device` builds the .ipa;
  `test` is three jobs, one per UI test method (`testDragFoods`, `testInputsAndCrashes`, `testMenusAndSignIn`; keep
  them independent and about equally long); `shots` takes the screenshots.
- `release` (needs device + test) publishes to `ios-latest` and `sidestore.json` only if the tests pass and nothing
  crashed; `preview` collects everything on `ios-preview`. A failed build posts `build.log`/`sim.log` to `ios-log`.
- Results to check after every build (read via REST: `gh api repos/Seifonyx/Setpoint/releases/tags/ios-preview`, then
  asset ids; `gh release` GraphQL commands are blocked in sessions): `drag-results.txt`, `check-results-*.txt`,
  `uitest-log-*.txt`, `search-check.txt`, any `crash-*.txt`, and the screenshots.
- The standing release policy is in AGENTS.md (test, then publish, then check). Put `[preview]` in the commit message
  only when the user asks to see something first. Bigger work awaiting approval goes on its own branch (e.g.
  `redesign`): pushes there only make previews; merge to `main` to release.
- The user installs with AltStore (switched from SideStore on 2026-11-28). The update card's Update button
  (`UpdateCheck.install()`) hands the new .ipa to `altstore://install?url=`, then SideStore's same link, then the release
  page. The source file is still named `sidestore.json` (AltStore reads the same format).

## Food list (foods.json)
Rebuilt by `tools/foods/` in order: `off_fetch.py` (Open Food Facts brands; slow, rate-limited) → `build.py
<off-raw.jsonl>` (merge, clean, import, Egyptian dishes; reads `TOP_PICKS`/`POPULAR` from
`engine/src/06-food-database.js`) → `verify.py` (USDA Branded Foods by barcode + makers' caffeine; marks row[9]
'usda'/'maker' = verified) → `complete.py` (certain zeros, Foundation gaps, removes copies of verified foods with
aliases). Never invent values: a blank means the label didn't say. Restaurant numbers (`LAB_TWIN`, `OFFICIAL`, …) are
in `engine/src/06-food-database.js`.

## Working on Windows
The repo is LF-only (`.gitattributes`). If an old clone shows CRLF, run `git config core.autocrlf false` and re-check it out.
