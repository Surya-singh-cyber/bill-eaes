import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyDxB3EtgWvSPAF909pOdd8WFfqD6ShyvT4",
  authDomain: "e-billing-f0e1a.firebaseapp.com",
  projectId: "e-billing-f0e1a",
  storageBucket: "e-billing-f0e1a.firebasestorage.app",
  messagingSenderId: "737926986699",
  appId: "1:737926986699:web:bdf26dafabfd4ddfbf144e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);