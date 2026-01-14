// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Firestore with persistence
const initializeFirestore = () => {
  const firestoreDb = getFirestore(app);
  if (typeof window !== 'undefined') {
    try {
      enableIndexedDbPersistence(firestoreDb)
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            // This can happen if multiple tabs are open
            console.warn('Firebase persistence failed: multiple tabs open.');
          } else if (err.code === 'unimplemented') {
            // The current browser does not support persistence
            console.warn('Firebase persistence not available in this browser.');
          }
        });
    } catch (error) {
      console.error("Error enabling Firebase persistence: ", error);
    }
  }
  return firestoreDb;
};

const db = initializeFirestore();

export { app, auth, db, storage };
