// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKP-Mr5bF7ww1e3qfZ68Q6Y8g0VJuHDqQ",
  authDomain: "learn-irish-82f09.firebaseapp.com",
  projectId: "learn-irish-82f09",
  storageBucket: "learn-irish-82f09.appspot.com",
  messagingSenderId: "701146172967",
  appId: "1:701146172967:web:fd77f824e09998603cc802",
  measurementId: "G-RM6K6NZ0LL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);