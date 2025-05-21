import { initializeApp } from "firebase/app";
/*
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";*/
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

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

// export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, region);

// setPersistence(auth, inMemoryPersistence);

/*
export const signUp = async (email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const { user } = credential;

  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    createdAt: new Date(),
  });

  return user;
};

export const signIn = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const { user } = credential;
  return user;
};
*/

if (process.env.NODE_ENV !== "production") {
  connectFirestoreEmulator(db, "127.0.0.1", 8086);
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
