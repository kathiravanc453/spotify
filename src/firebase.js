// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// PASTE YOUR FIREBASE CONFIG HERE (from Firebase Console → Project Settings)
// Steps:
//   1. Go to https://console.firebase.google.com
//   2. Create project → Add Web App
//   3. Enable Authentication → Phone
//   4. Copy the firebaseConfig object values below
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
