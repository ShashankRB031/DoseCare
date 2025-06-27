// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging"; // ✅ Added

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALTber9xylt645EjNxW6Y3Pk0RsYIzq0E",
  authDomain: "dosecare-bd255.firebaseapp.com",
  projectId: "dosecare-bd255",
  storageBucket: "dosecare-bd255.appspot.com",
  messagingSenderId: "449344288461",
  appId: "1:449344288461:web:ce4bea608de3ded0bd5b84",
  measurementId: "G-Y5409HDLFV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app); // ✅ Added
