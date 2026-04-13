import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBpaRHIePwtV6hgldeVVQpzSVB5H1k22uU",
  authDomain: "gestanest-76006.firebaseapp.com",
  projectId: "gestanest-76006",
  storageBucket: "gestanest-76006.firebasestorage.app",
  messagingSenderId: "199067784355",
  appId: "1:199067784355:web:ef5fd3cd37db3eeb459b16",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
