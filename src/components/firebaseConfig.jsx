import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpG8PjbKMR_dbwDCl9jkIn2_dNlN-biPQ",
  authDomain: "node-mco.firebaseapp.com",
  databaseURL: "https://node-mco-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "node-mco",
  storageBucket: "node-mco.firebasestorage.app",
  messagingSenderId: "843295622099",
  appId: "1:843295622099:web:3d1c3c2138a83155086526",
  measurementId: "G-3STMM4VBT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Realtime Database
const auth = getAuth(app);
const database = getDatabase(app);

// Export for use in other files
export { auth, database };


