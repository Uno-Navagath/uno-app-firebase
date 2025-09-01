import {getApp, getApps, initializeApp} from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCBg0Y-j24P_lSjxIsUcDXKH5alslCOLFc",
    authDomain: "uno-app-firebase.firebaseapp.com",
    projectId: "uno-app-firebase",
    storageBucket: "uno-app-firebase.firebasestorage.app",
    messagingSenderId: "814054191281",
    appId: "1:814054191281:web:6b99a7669bebdd0a1af290"
};
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };