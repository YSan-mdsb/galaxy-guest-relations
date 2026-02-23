import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCI1HMsbMccDhlEF_MjlGZd20MNgiWnwHM",
    authDomain: "galaxy-guest-relations.firebaseapp.com",
    projectId: "galaxy-guest-relations",
    storageBucket: "galaxy-guest-relations.firebasestorage.app",
    messagingSenderId: "153336950963",
    appId: "1:153336950963:web:7427f1b9583968074940c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
