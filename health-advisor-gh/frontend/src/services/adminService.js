import { auth } from '../firebaseConfig'; // To get ID token

const API_BASE_URL = '/api/admin';

export const fetchAdminStats = async () => {
  if (!auth || !auth.currentUser) {
    const errorMessage = !auth ? "Firebase not initialized." : "User not authenticated.";
    console.error("fetchAdminStats Error:", errorMessage, "Admin access requires login.");
    throw new Error(errorMessage + " Admin access requires login.");
  }

  let idToken;
  try {
    // Force token refresh to ensure custom claims are up-to-date.
    // This is particularly important if claims were just set.
    idToken = await auth.currentUser.getIdToken(true);
  } catch (tokenError) {
    console.error("Error getting ID token for admin service:", tokenError);
    throw new Error("Could not obtain authentication token. Please try logging in again.");
  }

  const response = await fetch(`${API_BASE_URL}/stats`, {
    method: 'GET',
    headers: {
      // 'Content-Type': 'application/json', // Not strictly necessary for GET if no body
      'Authorization': `Bearer ${idToken}`,
    },
  });

  const data = await response.json(); // Attempt to parse JSON for both success and error responses

  if (!response.ok) {
    // The backend admin routes should return a JSON object with a 'message' field on error.
    const errorMessage = data.message || `Failed to fetch admin stats. Status: ${response.status}.`;
    console.error("Admin Stats API Error:", errorMessage, "Full response data:", data);
    throw new Error(errorMessage);
  }

  // Expected successful data structure from backend:
  // { message: "Admin Dashboard Statistics", data: mockStats, requestingAdmin: { uid, email } }
  return data;
};

// Add other admin service functions here as needed, e.g.:
// export const fetchAdminUsers = async () => { /* ... */ };
// export const updateAdminUserRole = async (userId, newRole) => { /* ... */ };
