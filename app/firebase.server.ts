import admin from "firebase-admin";
import { type App, initializeApp, getApps, getApp } from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore } from "firebase-admin/firestore";

export let app: App;
export let auth: Auth;
export let firestore: Firestore;

if (getApps().length === 0) {
  app = initializeApp({
    projectId: "freewheelspin-com",
  });
  firestore = admin.firestore();
  if (process.env.NODE_ENV === "development") {
    firestore.settings({
      host: "localhost:8086",
      ssl: false,
    });
  }
  auth = getAuth(app);
} else {
  app = getApp();
  auth = getAuth(app);
}

export async function getFirebaseToken(uid: string) {
  return await auth.createCustomToken(uid);
}

export async function getDocument(collectionName: string, documentId: string) {
  try {
    const docRef = firestore.collection(collectionName).doc(documentId);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      return data;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
}

// Get a collection
export async function getCollection(collectionName: string) {
  try {
    const collectionRef = firestore.collection(collectionName);
    const collectionSnapshot = await collectionRef.get();
    const documents = collectionSnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
    return documents;
  } catch (error) {
    console.error("Error getting collection:", error);
    throw error;
  }
}
