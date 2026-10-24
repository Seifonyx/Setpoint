// Test stand-in for firebase.js with the same exports. Talks to a shared in-memory "cloud" in the test runner.
function setUser(auth, u) { auth.currentUser = u; localStorage.setItem('__fakeUser', JSON.stringify(u)); auth.listeners.forEach(function (f) { f(u); }); }
async function call() { const r = await window.__fake.apply(null, arguments); if (r && r.error) { const e = new Error(r.error); e.code = r.error; throw e; } return r; }
export function initializeApp(c) { window.__fbConfig = c; return { c: c }; }
export function initializeAuth() { return { listeners: [], currentUser: null }; }
export const indexedDBLocalPersistence = {}, browserLocalPersistence = {}, browserPopupRedirectResolver = {};
export function onAuthStateChanged(auth, cb) { auth.listeners.push(cb); const u = JSON.parse(localStorage.getItem('__fakeUser') || 'null'); auth.currentUser = u; setTimeout(function () { cb(auth.currentUser); }, 20); return function () {}; }
export async function createUserWithEmailAndPassword(auth, e, p) { const r = await call('signup', e, p); setUser(auth, { uid: r.uid, email: e, emailVerified: !!r.verified, providerData: [{ providerId: 'password' }] }); return { user: auth.currentUser }; }
export async function signInWithEmailAndPassword(auth, e, p) { const r = await call('signin', e, p); setUser(auth, { uid: r.uid, email: e, emailVerified: !!r.verified, providerData: [{ providerId: 'password' }] }); return { user: auth.currentUser }; }
export async function sendPasswordResetEmail(auth, e) { await call('reset', e); }
export async function sendEmailVerification(u) { await call('verify', u.email); }
export async function signOut(auth) { setUser(auth, null); }
export class GoogleAuthProvider {}
export async function signInWithPopup() { const e = new Error('closed'); e.code = 'auth/popup-closed-by-user'; throw e; }
export async function signInWithRedirect() { localStorage.setItem('__fakeRedirect', '1'); await window.__fake('redirect'); setTimeout(function () { location.reload(); }, 50); await new Promise(function () {}); }
export async function getRedirectResult(auth) {
  if (localStorage.getItem('__fakeRedirect') !== '1') return null;
  localStorage.removeItem('__fakeRedirect');
  const r = await call('google', 'g@gmail.com');
  setUser(auth, { uid: r.uid, email: 'g@gmail.com', emailVerified: true, providerData: [{ providerId: 'google.com' }] });
  return { user: auth.currentUser };
}
export function getFirestore() { return {}; }
export function doc(db) { return Array.prototype.slice.call(arguments, 1).join('/'); }
export async function getDoc(ref) { const d = await call('get', ref); return { exists: function () { return !!d; }, data: function () { return d; } }; }
export async function setDoc(ref, data, o) { await call('set', ref, JSON.parse(JSON.stringify(data)), !!(o && o.merge)); }
export function collection(db) { return Array.prototype.slice.call(arguments, 1).join('/'); }
export async function getDocs(col) { const list = await call('list', col); return { docs: list, forEach: function (fn) { list.forEach(function (d) { fn({ id: d.id, data: function () { return d.data; } }); }); } }; }
export function writeBatch() { const ops = []; return { set: function (ref, data) { ops.push([ref, JSON.parse(JSON.stringify(data))]); }, delete: function (ref) { ops.push([ref, null]); }, commit: async function () { await call('batch', ops); } }; }
