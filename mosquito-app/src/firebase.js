import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Database eka ona nisa meka add karanna

const firebaseConfig = {
  apiKey: "AIzaSyBCfOPxDBUpVkP52jB0ti1Qpp-mKVcMaOg",
  authDomain: "mosquito-dashboard-381a3.firebaseapp.com",
  databaseURL: "https://mosquito-dashboard-381a3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mosquito-dashboard-381a3",
  storageBucket: "mosquito-dashboard-381a3.firebasestorage.app",
  messagingSenderId: "81707227953",
  appId: "1:81707227953:web:41d30b336e72e0b440ee10",
  measurementId: "G-HQFV0EFWB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Database eka export karanna Dashboard ekedi use karanna
export const db = getDatabase(app);