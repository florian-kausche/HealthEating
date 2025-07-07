// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Replace with your actual Firebase project configuration!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase initialized successfully on the client.");
} catch (error) {
  console.error("Error initializing Firebase on the client:", error);
  console.error("Please ensure you have replaced the placeholder values in frontend/src/firebaseConfig.js with your actual Firebase project configuration.");
  // You might want to display a message to the user in the UI if Firebase fails to initialize
  app = null; // Ensure app is null if initialization fails
  auth = null; // Ensure auth is null
}

export { app, auth };
