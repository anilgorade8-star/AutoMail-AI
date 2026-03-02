import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyApyWLiu5sLvrD5_Nq-zrllEhprDn3Itd4",
    authDomain: "lifepulse-aa965.firebaseapp.com",
    projectId: "lifepulse-aa965",
    storageBucket: "lifepulse-aa965.firebasestorage.app",
    messagingSenderId: "98339320470",
    appId: "1:98339320470:web:0e3c43f73d73d6afc2c8b7",
    measurementId: "G-3PBD3YXL93"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Scopes for Gmail and Calendar
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

export default app;
