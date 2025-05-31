import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";

const app = initializeApp({
  apiKey: "AIzaSyAdHy_Y8yAEX5BSwQGSWVyoyOa-LEaARm4",
  authDomain: "freewheelspin-com.firebaseapp.com",
  projectId: "freewheelspin-com",
  storageBucket: "freewheelspin-com.firebasestorage.app",
  messagingSenderId: "1061420179773",
  appId: "1:1061420179773:web:4154452576c26e38b52554",
  measurementId: "G-8RTXGKWSBW",
});
const region = "us-west1";

export const db = getFirestore(app);
export const functions = getFunctions(app, region);
export const analytics = getAnalytics(app);

if (process.env.NODE_ENV !== "production") {
  connectFirestoreEmulator(db, "127.0.0.1", 8086);
}
