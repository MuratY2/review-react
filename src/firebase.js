// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDyWt_ZP3oVVsX1IVxypAfdoiB9sjbkNxU",
  authDomain: "authorfactory.firebaseapp.com",
  projectId: "authorfactory",
  storageBucket: "authorfactory.appspot.com",
  messagingSenderId: "737798229387",
  appId: "1:737798229387:web:cd0c543e261d60fa5cf38e",
  measurementId: "G-NV1R16EL39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
