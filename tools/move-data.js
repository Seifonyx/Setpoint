// One-off: copies everyone's Setpoint data from the old Firebase project to setpoint-tracker.
// Works on the free plan. Needs two service account keys (see the README steps):
//   node tools/move-data.js old-key.json new-key.json
const admin = require('firebase-admin');
const [oldKey, newKey] = process.argv.slice(2);
if (!oldKey || !newKey) { console.log('Usage: node tools/move-data.js old-key.json new-key.json'); process.exit(1); }

const from = admin.initializeApp({ credential: admin.credential.cert(require(require('path').resolve(oldKey))) }, 'old').firestore();
const to = admin.initializeApp({ credential: admin.credential.cert(require(require('path').resolve(newKey))) }, 'new').firestore();

(async () => {
  let docs = 0;
  // Every users/{uid}/setpoint/... document, plus the monthly food documents under it.
  for (const group of ['setpoint', 'food']) {
    const snap = await from.collectionGroup(group).get();
    for (const d of snap.docs) {
      if (!d.ref.path.startsWith('users/')) continue;
      await to.doc(d.ref.path).set(d.data());
      docs++;
    }
  }
  console.log('Copied ' + docs + ' documents.');
})().catch((e) => { console.error(e.message); process.exit(1); });
