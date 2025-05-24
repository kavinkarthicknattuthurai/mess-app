// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdAkDiRufgtSJq1ittF-vnKdTwMagGeHM",
  authDomain: "extrabite-66108.firebaseapp.com",
  projectId: "extrabite-66108",
  storageBucket: "extrabite-66108.appspot.com",
  messagingSenderId: "4446016956",
  appId: "1:4446016956:web:810d889b7a83f20fb787b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 