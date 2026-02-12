import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_YsVAEKnOgNugI3FBqeAO-ToPc2Pn4Hk",
  authDomain: "reading-log--backend.firebaseapp.com",
  projectId: "reading-log--backend",
  storageBucket: "reading-log--backend.firebasestorage.app",
  messagingSenderId: "144337555876",
  appId: "1:144337555876:web:8025da68f182473fedf131",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
