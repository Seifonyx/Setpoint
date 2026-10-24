# Setpoint

Weight and food tracker PWA. Live at https://setpoint-tracker.web.app (Firebase project `setpoint-tracker`).

- Code lives in `src/*.js`; `node tools/build.js` joins them into `app.js` and stamps the sw.js cache.
- Every new user-facing string needs an Arabic entry in `ar.js` (keyed by the English text).
- Release: bump `APP_VERSION` and add a plain-words CHANGES entry in `src/01-version.js`, bump `?v=` in index.html and `version` in package.json, build, run `npm test`, then deploy with `node tools/deploy.js` (Firebase Hosting REST API; credentials come from the session proxy).
- Test at phone size (iPhone 13+) in light and dark, English and Arabic.
- Commit and push to `main` after each shipped update.
