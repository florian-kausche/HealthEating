import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Ensure this path is correct
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // For client-side admin status indication

  useEffect(() => {
    let unsubscribe = () => {};
    if (auth) { // Only subscribe if auth was initialized successfully
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            // It's good practice to force token refresh if checking claims frequently,
            // though onAuthStateChanged often provides fresh enough tokens.
            // const token = await user.getIdToken(true); // Force refresh
            const tokenResult = await user.getIdTokenResult(); // Gets full result including claims
            setIdToken(tokenResult.token);
            setIsAdmin(tokenResult.claims.admin === true); // Check 'admin' custom claim from token
            // console.log("User claims:", tokenResult.claims); // For debugging
          } catch (error) {
            console.error("Error getting ID token or claims:", error);
            setIdToken(null);
            setIsAdmin(false);
          }
        } else {
          // No user logged in
          setIdToken(null);
          setIsAdmin(false);
        }
        setLoading(false);
      });
    } else {
      console.warn("Firebase auth is not initialized. Auth state will not be managed.");
      setLoading(false); // Stop loading as there's no auth service to wait for
    }

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  // Function to sign out
  const signOut = async () => {
    if (!auth) {
      console.warn("Firebase auth not initialized. Cannot sign out.");
      return;
    }
    try {
      await firebaseSignOut(auth);
      // No need to manually set currentUser and idToken to null here,
      // onAuthStateChanged will trigger and update them.
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };


  const value = {
    currentUser,
    idToken,
    isAdmin, // Expose isAdmin status to be used by components (e.g., AdminRoute)
    loading,
    signOut,
    // Login/signup are component-specific actions, context updates via onAuthStateChanged
    // The onAuthStateChanged listener will automatically update the context.
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
