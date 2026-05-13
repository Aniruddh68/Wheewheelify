import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Add this for the database
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsB7ervccN0ZLEUjvkOlcjn5Y8SQ9_cOE",
  authDomain: "wheelify-3190c.firebaseapp.com",
  projectId: "wheelify-3190c",
  storageBucket: "wheelify-3190c.firebasestorage.app",
  messagingSenderId: "886053701357",
  appId: "1:886053701357:web:15fa8a81625049cb102ee4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Database) and export it
export const db = getFirestore(app);

// Initialize Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();