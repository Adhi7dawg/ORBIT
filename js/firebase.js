import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3g6t3F_Xt6yJDip1ZgWl5qFZbv0jfGQg",
  authDomain: "anjai-fc.firebaseapp.com",
  projectId: "anjai-fc",
  storageBucket: "anjai-fc.firebasestorage.app",
  messagingSenderId: "670571042789",
  appId: "1:670571042789:web:e86e9ed2f39863368a410c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);