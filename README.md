# Setpoint

A native iPhone app for tracking food, nutrients and weight, with targets that learn from your real results.
Egyptian Arabic and English. iOS 26 or later.

## Install
On the iPhone, open the [ios-latest release](https://github.com/Seifonyx/Setpoint/releases/tag/ios-latest), download
`Setpoint.ipa` and open it in SideStore, or add this repo's `sidestore.json` as a SideStore source to get updates.

## Repository
- `ios/`: the app (SwiftUI, built with XcodeGen). See [ios/README.md](ios/README.md) and [ios/FEATURES.md](ios/FEATURES.md).
- `engine/`: the app's food search and maths (JavaScript run inside the app). `node engine/build.js` builds it,
  `node engine/search-check.js` checks that common searches find the right food.
- `foods.json` and `tools/foods/`: the built-in food list (USDA, Egyptian dishes, packaged products from Open Food
  Facts) and the scripts that rebuild it.
- `firestore.rules`: the cloud sync backend's security rules.
- Every push to `main` is built, tested and released by GitHub Actions (`.github/workflows/ios.yml`).

The root files `index.html`, `app.js`, `src/` and the rest are the old web app. It's abandoned and kept as it was;
the iPhone app doesn't use it.
