import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgJAuuHDw41_dLy7f5EZj841kophQt6mw",
  authDomain: "villagetracker-ef811.firebaseapp.com",
  projectId: "villagetracker-ef811",
  storageBucket: "villagetracker-ef811.appspot.com",
  messagingSenderId: "593452817288",
  appId: "1:593452817288:web:4c66f28186b6eb0e6bb83d",
  measurementId: "G-2D40M0S5S5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);