import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";  // ✅ WAJIB untuk realtime

const firebaseConfig = {
  apiKey: "AIzaSyCB3ySd6xxb0R5r01Hu2edngbpyqfw6-Fg",
  authDomain: "perpusgoo.firebaseapp.com",
  databaseURL: "https://perpusgoo-default-rtdb.firebaseio.com", // 🔥 penting untuk realtime
  projectId: "perpusgoo",
  storageBucket: "perpusgoo.appspot.com",
  messagingSenderId: "549670461380",
  appId: "1:549670461380:web:6ac42da04e4c744c700e91",
  measurementId: "G-NMYJB4P0HW"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export Authentication
export const auth = getAuth(app);

// Export Realtime Database
export const db = getDatabase(app);

console.log("🔥 Firebase Loaded:", app.name);
