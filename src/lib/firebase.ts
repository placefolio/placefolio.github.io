import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "sobeelab-creer",
  appId: "1:220538716348:web:9a285291219b21317d50b9",
  storageBucket: "sobeelab-creer.firebasestorage.app",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "sobeelab-creer.firebaseapp.com",
  messagingSenderId: "220538716348",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Enterprise Edition requires specifying the database ID
const db = getFirestore(app, 'job-board');
const auth = getAuth(app);

export { app, db, auth };
