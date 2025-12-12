// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuwR9zROmSPWi9Xxx5bWYcCJA9msU3yMw",
  authDomain: "byte-arena.firebaseapp.com",
  projectId: "byte-arena",
  storageBucket: "byte-arena.firebasestorage.app",
  messagingSenderId: "623298458456",
  appId: "1:623298458456:web:0a7df9327804c08a4dab2d",
  measurementId: "G-VWKCSWEXB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

// Debug: Log Firebase config (remove in production)
console.log('Firebase initialized with project:', firebaseConfig.projectId);

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export default app;
