# Setpoint

Weight and food tracker PWA. Live at https://setpoint-tracker.web.app (Firebase project `setpoint-tracker`).

- Code lives in `src/*.js`; `node tools/build.js` joins them into `app.js` and stamps the sw.js cache.
- Every new user-facing string needs an Arabic entry in `ar.js` (keyed by the English text).
- Release: bump `APP_VERSION` and add a plain-words CHANGES entry in `src/01-version.js`, bump `?v=` in index.html and `version` in package.json, build, run `npm test`, then deploy with `node tools/deploy.js` (Firebase Hosting REST API; credentials come from the session proxy).
- Test at phone size (iPhone 13+) in light and dark, English and Arabic.
- Commit and push to `main` after each shipped update.

## iPhone app (ios/)
- Native SwiftUI app, minimum iOS 26. There's no Mac: code is built by GitHub Actions (`.github/workflows/ios.yml`) from `ios/project.yml` via XcodeGen.
- Results: the `ios-latest` release (Setpoint.ipa + simulator screenshots); a failed build posts `build.log`/`sim.log` to the `ios-log` release. Both are public downloads.
- The user installs the .ipa with SideStore. New features go into the native app; the web app is frozen for now.
