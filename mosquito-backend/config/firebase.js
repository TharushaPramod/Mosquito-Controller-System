const admin = require("firebase-admin");

let db;

const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    return db;
  }

  if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("WARNING: Missing FIREBASE_PROJECT_ID. Firebase features will be disabled.");
    return null;
  }

  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
  };

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log("Firebase Firestore connected");
  } catch (error) {
    console.error("Firebase initialization failed:", error.message);
    return null;
  }

  db = admin.firestore();
  db.settings({ timestampsInSnapshots: true });

  console.log("Firebase Firestore connected");
  return db;
};

const getDb = () => {
  if (!db) {
    console.warn("Accessing Firestore but Firebase not initialized. Returning mock for safety.");
    return {
      collection: () => ({
        get: async () => ({ docs: [] }),
        doc: () => ({ get: async () => ({ exists: false }), add: async () => ({ id: "mock-id" }) }),
        add: async () => ({ id: "mock-id" }),
        where: () => ({ get: async () => ({ docs: [] }) })
      })
    };
  }
  return db;
};
const getAdmin = () => admin;

module.exports = { initializeFirebase, getDb, getAdmin };