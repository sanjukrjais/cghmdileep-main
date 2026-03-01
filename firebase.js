// firebase.js - FIXED VERSION
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAOkwFUoTvwygSUdx9fQhqeZfb5s8G7IP4",
    authDomain: "greeninurjamall.firebaseapp.com",
    projectId: "greeninurjamall",
    storageBucket: "greeninurjamall.firebasestorage.app",
    messagingSenderId: "120545251212",
    appId: "1:120545251212:web:683049967fb9636e20d0a9",
    measurementId: "G-H0XNSML06C"
};

// 🔥 FIXED: Check if app already exists
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);

export default app;
