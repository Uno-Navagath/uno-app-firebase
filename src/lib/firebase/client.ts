import { initializeApp, getApps, getApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDuuWFuk8PUNhtDRXD7gJ8T5V2ifWKYpJY",
    authDomain: "uno-score-app.firebaseapp.com",
    projectId: "uno-score-app",
    storageBucket: "uno-score-app.firebasestorage.app",
    messagingSenderId: "856908167094",
    appId: "1:856908167094:web:ba0e522f1664b968393317"
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };