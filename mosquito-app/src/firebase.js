// src/firebase.js

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// --- මෙතනට ඔයාගේ Firebase Config ටික දාන්න ---
const firebaseConfig = {
  apiKey: "AIzaSyDhlkpjU4WHY3T9n9DqstDqhdaLf8JOlK4",
  authDomain: "mosquito-trap-01.firebaseapp.com",
  databaseURL: "https://mosquito-trap-01-default-rtdb.firebaseio.com",
  projectId: "mosquito-trap-01",
  storageBucket: "mosquito-trap-01.firebasestorage.app",
  messagingSenderId: "929830720122",
  appId: "1:929830720122:web:9b81e025baf1f1a2fd21c3",
  measurementId: "G-0W40XMKMRS"
};

// Firebase පණ ගන්වනවා
const app = initializeApp(firebaseConfig);

// Database එක Export කරනවා (අනිත් ෆයිල් වලට පාවිච්චි කරන්න)
export const database = getDatabase(app);