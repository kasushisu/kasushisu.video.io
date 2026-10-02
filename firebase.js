import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics, isSupported as analyticsIsSupported, logEvent } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5h33UE3EyizqJUIkbopXnQk5jQtU4aOI",
  authDomain: "my-videosite-58b4e.firebaseapp.com",
  projectId: "my-videosite-58b4e",
  messagingSenderId: "1066804172796",
  appId: "1:1066804172796:web:e28a6bc096b1e3ce288479",
  measurementId: "G-B7V0Z9NB38"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const LIBRARY_COLLECTION = "videoLibrary";
const ADMIN_DOC_PATH = ["settings", "admin"];
let analytics = null;

analyticsIsSupported().then((supported) => {
  if (!supported) return;
  analytics = getAnalytics(app);
}).catch((error) => console.warn("Firebase Analytics unavailable:", error));

export function trackEvent(name, params = {}) {
  if (!analytics) return;
  try { logEvent(analytics, name, params); }
  catch (error) { console.warn("Analytics event error:", error); }
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  trackEvent("admin_login", { provider: "google" });
  return result.user;
}

export async function signOutGoogle() {
  await signOut(auth);
}

export async function claimOrVerifyAccess(user) {
  if (!user) return { allowed: false, role: "", reason: "signed_out" };

  const adminRef = doc(db, ...ADMIN_DOC_PATH);
  let adminSnap = await getDoc(adminRef);

  // First signed-in user becomes the initial admin.
  if (!adminSnap.exists()) {
    try {
      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        createdAt: serverTimestamp()
      });
      adminSnap = await getDoc(adminRef);
    } catch (error) {
      adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) throw error;
    }
  }

  const adminInfo = adminSnap.data();
  if (adminInfo?.uid === user.uid) {
    return { allowed: true, role: "admin", admin: adminInfo, currentUid: user.uid };
  }

  const email = String(user.email || "").trim().toLowerCase();
  if (!email) return { allowed: false, role: "", reason: "no_email", currentUid: user.uid };

  // Preferred permission model: the initial admin grants editing access by email.
  const accessRef = doc(db, "access", email);
  const accessSnap = await getDoc(accessRef);
  if (accessSnap.exists()) {
    const info = accessSnap.data();
    const role = info?.role || "";
    return {
      allowed: role === "editor",
      role,
      profile: info,
      admin: adminInfo,
      currentUid: user.uid
    };
  }

  // Backward compatibility with the previous UID-based role version.
  const legacyRef = doc(db, "users", user.uid);
  const legacySnap = await getDoc(legacyRef);
  if (legacySnap.exists()) {
    const info = legacySnap.data();
    const role = info?.role || "";
    return {
      allowed: role === "editor" || role === "admin",
      role: role === "admin" ? "editor" : role,
      profile: info,
      admin: adminInfo,
      currentUid: user.uid
    };
  }

  return { allowed: false, role: "", reason: "no_access", currentUid: user.uid };
}

export function subscribeAccessList(onEntries, onError) {
  return onSnapshot(collection(db, "access"), (snapshot) => {
    const entries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    entries.sort((a, b) => String(a.email || a.id).localeCompare(String(b.email || b.id), "ja"));
    onEntries(entries);
  }, onError);
}

export async function grantEditorAccess(email, grantedByUser = null) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) throw new Error("有効なメールアドレスを入力してください");
  await setDoc(doc(db, "access", normalized), {
    email: normalized,
    role: "editor",
    grantedByUid: grantedByUser?.uid || "",
    grantedByEmail: grantedByUser?.email || "",
    updatedAt: serverTimestamp()
  }, { merge: true });
  trackEvent("admin_grant_editor", { email_domain: normalized.split("@")[1] || "" });
}

export async function revokeEditorAccess(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return;
  await deleteDoc(doc(db, "access", normalized));
  trackEvent("admin_revoke_editor", { email_domain: normalized.split("@")[1] || "" });
}

export function subscribeLibraryItems(onItems, onError) {
  return onSnapshot(collection(db, LIBRARY_COLLECTION), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => String(a.id).localeCompare(String(b.id), "ja"));
    onItems(items);
  }, onError);
}

export async function getLibraryItems() {
  const snap = await getDocs(collection(db, LIBRARY_COLLECTION));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return items.sort((a, b) => String(a.id).localeCompare(String(b.id), "ja"));
}

function cleanForFirestore(item) {
  const clean = { ...item };
  delete clean.mediaData;
  // undefined values are not allowed in Firestore.
  Object.keys(clean).forEach((key) => {
    if (clean[key] === undefined) delete clean[key];
  });
  clean.updatedAt = serverTimestamp();
  return clean;
}

export async function saveLibraryItem(item) {
  if (!item?.id) throw new Error("ID is required");
  await setDoc(doc(db, LIBRARY_COLLECTION, item.id), cleanForFirestore(item), { merge: true });
  trackEvent("admin_save", { item_id: item.id, category: item.category || "" });
}


export async function deleteLibraryItem(item) {
  if (!item?.id) return;
  await deleteDoc(doc(db, LIBRARY_COLLECTION, item.id));
  trackEvent("admin_delete", { item_id: item.id });
}

export async function seedLibraryItems(items) {
  if (!Array.isArray(items) || !items.length) return;
  // Firestore batch limit is comfortably above this site's starter item count.
  const batch = writeBatch(db);
  items.forEach((item) => {
    if (!item?.id) return;
    batch.set(doc(db, LIBRARY_COLLECTION, item.id), cleanForFirestore(item), { merge: true });
  });
  await batch.commit();
  trackEvent("admin_seed_library", { item_count: items.length });
}

