import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAd6JNFdbt-n5fHZUI1aPSNZob1-e3mW8",
  authDomain: "web-todo-6.firebaseapp.com",
  projectId: "web-todo-6",
  storageBucket: "web-todo-6.appspot.com",
  messagingSenderId: "107908166317",
  appId: "1:107908166317:web:66bb2800a0f86d29f8cc24",
  measurementId: "G-MFNL2GPWC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);