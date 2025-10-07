// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOsdEivsYh2qFfhguHTQLzC5Gn69Uno8E",
  authDomain: "tacmap-2e8dc.firebaseapp.com",
  projectId: "tacmap-2e8dc",
  //storageBucket: "tacmap-2e8dc.firebasestorage.app",
  //messagingSenderId: "55609511981",
  //appId: "1:55609511981:web:a7525cf4b89df6d6e9a8a4",
  //measurementId: "G-F0TLK5T5FJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);