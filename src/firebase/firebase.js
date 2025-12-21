import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Import the functions you need from the SDKs you need
const firebaseConfig = {
  apiKey: "AIzaSyB2HUP4rDr5_DEBFDW0wAo96QFsr4b3GNk",
  authDomain: "filltech-341fb.firebaseapp.com",
  projectId: "filltech-341fb",
  storageBucket: "filltech-341fb.firebasestorage.app",
  messagingSenderId: "383546184176",
  appId: "1:383546184176:web:008de132febf5f81f58d35",
  measurementId: "G-7EN8ELE1TX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)



export { app, auth };