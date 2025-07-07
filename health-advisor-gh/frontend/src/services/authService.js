import { auth } from '../firebaseConfig'; // Firebase client auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

// Base URL for our backend API
// In development, if your React app is on port 3000 and backend on 3001,
// you'll need to set up a proxy in package.json or use full URLs.
// For now, assuming they might be served from same origin in production or proxy is set.
const API_BASE_URL = '/api/users';

export const registerUser = async (email, password, fullName) => {
  if (!auth) {
    throw new Error("Firebase auth is not initialized. Please check firebaseConfig.js.");
  }

  // Step 1: Call our backend to register the user.
  // The backend uses Firebase Admin SDK to create the user in Firebase Authentication
  // and can also create a corresponding record in our application database (e.g., MongoDB).
  const backendResponse = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, fullName }),
  });

  const backendData = await backendResponse.json();

  if (!backendResponse.ok) {
    // Forward error message from backend
    throw new Error(backendData.message || 'Failed to register user via backend.');
  }

  // Step 2: After successful backend registration (which creates the Firebase user),
  // sign in the user on the client-side using Firebase Client SDK.
  // This establishes the Firebase auth session in the browser and triggers onAuthStateChanged.
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged in AuthContext will handle setting currentUser and idToken.
  } catch (clientSignInError) {
    // This is a critical state: backend registered, but client couldn't sign in.
    // This might happen if there's a slight delay or inconsistency.
    // Or if the backend didn't actually create the user in Firebase correctly.
    console.error("Client sign-in failed after backend registration:", clientSignInError);
    // You might want to inform the user to try logging in manually.
    throw new Error(`User registered, but client sign-in failed: ${clientSignInError.message}. Please try logging in.`);
  }

  return backendData; // Contains { message, user: { uid, email, fullName from backend } }
};

export const loginUser = async (email, password) => {
  if (!auth) {
    throw new Error("Firebase auth is not initialized. Please check firebaseConfig.js.");
  }
  // Firebase client SDK handles the sign-in.
  // onAuthStateChanged in AuthContext will update the user state and ID token.
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user; // The Firebase user object
};

export const fetchUserProfile = async (idToken) => {
  if (!idToken) {
    throw new Error("No ID token provided for fetching user profile.");
  }
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${idToken}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user profile.');
  }
  return response.json();
};

// Sign out is available via useAuth().signOut() from AuthContext, which uses firebase/auth signOut.
