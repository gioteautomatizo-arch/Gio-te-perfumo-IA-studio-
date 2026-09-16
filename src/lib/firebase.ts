import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAD8Xhpts_EyHUq_2OVBlcmFtCdThunO5I',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gio-te-perfumo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gio-te-perfumo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gio-te-perfumo.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '189284211073',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:189284211073:web:1d4f5465ab9903b2c67080',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-38S0WRQ7QH',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
