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

export async function claimOrVerifyAdmin(user) {
  if (!user) return { allowed: false, reason: "signed_out" };
  const adminRef = doc(db, ...ADMIN_DOC_PATH);
  let snap = await getDoc(adminRef);

  if (!snap.exists()) {
    try {
      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        createdAt: serverTimestamp()
      });
      snap = await getDoc(adminRef);
    } catch (error) {
      // Another account may have claimed the admin role at the same time.
      snap = await getDoc(adminRef);
      if (!snap.exists()) throw error;
    }
  }

  const info = snap.data();
  return {
    allowed: info.uid === user.uid,
    admin: info,
    currentUid: user.uid
  };
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

