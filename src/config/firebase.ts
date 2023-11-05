import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
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
// Get authentication of the firebase application.
export const auth = getAuth(app);
// Get firestore of the FB application
export const firestore = getFirestore(app);
// Get google provider. Used for google sign in.
export const googleProvider = new GoogleAuthProvider();