// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcenL6kHZVqFyK1ADGo8cvDYYmoIXngjg",
  authDomain: "smart-dustbins-be003.firebaseapp.com",
  projectId: "smart-dustbins-be003",
  storageBucket: "smart-dustbins-be003.firebasestorage.app",
  messagingSenderId: "918734665956",
  appId: "1:918734665956:web:41a14281d0f341aafad4f1",
  measurementId: "G-XY8WDL6H9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);