import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics, isSupported, logEvent } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5h33UE3EyizqJUIkbopXnQk5jQtU4aOI",
  authDomain: "my-videosite-58b4e.firebaseapp.com",
  projectId: "my-videosite-58b4e",
  storageBucket: "my-videosite-58b4e.firebasestorage.app",
  messagingSenderId: "1066804172796",
  appId: "1:1066804172796:web:e28a6bc096b1e3ce288479",
  measurementId: "G-B7V0Z9NB38"
};

const app = initializeApp(firebaseConfig);
window.firebaseApp = app;

isSupported().then((supported) => {
  if (!supported) return;
  const analytics = getAnalytics(app);
  window.firebaseAnalytics = analytics;
  window.trackFirebaseEvent = (name, params = {}) => {
    try { logEvent(analytics, name, params); }
    catch (error) { console.warn("Firebase Analytics event error:", error); }
  };
}).catch((error) => {
  console.warn("Firebase Analytics is not available in this environment:", error);
});
