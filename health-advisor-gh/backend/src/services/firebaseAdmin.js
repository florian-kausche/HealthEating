const admin = require('firebase-admin');
require('dotenv').config(); // To load environment variables from .env file

try {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
    const decodedKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('ascii');
    serviceAccount = JSON.parse(decodedKey);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
    serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
  } else {
    console.warn("Firebase Admin SDK not initialized. Missing FIREBASE_SERVICE_ACCOUNT_KEY_PATH or FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable.");
    // In a real app, you might throw an error or handle this more gracefully
    // For now, we'll let it proceed but Firebase dependent features won't work.
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error);
  // Proceed without Firebase if initialization fails, features will be affected.
}

module.exports = admin;
