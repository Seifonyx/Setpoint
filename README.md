# Setpoint

A food and weight tracker (PWA). Published at https://setpoint-tracker.web.app.

## Working on the code
- The app's code lives in `src/` as modules (diary, add food, sync, targets and so on).
- `npm run build` joins them into `app.js`, which is what the app loads. It stops if there's a syntax error.
- `npm test` runs the smoke tests (`tests/smoke.js`) in Chromium at phone size, in light and dark mode.
- `ar.js` holds the Arabic interface text. It is only loaded when the language is set to Arabic.
- `foods.json` is the built-in food list (USDA SR28 and FNDDS, Egyptian dishes, and packaged products from Open Food Facts).

Each release: bump `APP_VERSION` and add a `CHANGES` entry in `src/01-version.js`, bump `CACHE` and the `?v=` numbers in `sw.js`, the `?v=` numbers in `index.html` and `version` in `package.json`.
