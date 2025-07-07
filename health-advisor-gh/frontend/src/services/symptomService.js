import { auth } from '../firebaseConfig'; // To get ID token

const API_BASE_URL = '/api/symptoms'; // Assuming frontend and backend are served on the same domain or proxied

export const submitSymptomsForCheck = async (symptomsDescription) => {
  if (!auth || !auth.currentUser) {
    // This check is important because auth might not be initialized if firebaseConfig is bad
    // or if onAuthStateChanged hasn't fired yet / user isn't logged in.
    const errorMessage = !auth ? "Firebase not initialized. Cannot perform symptom check." : "User not authenticated. Please login to check symptoms.";
    console.error("submitSymptomsForCheck Error:", errorMessage);
    // We could throw an error or return a specific object indicating auth failure
    // For now, let's throw an error to be caught by the calling component.
    throw new Error(errorMessage);
  }

  let idToken;
  try {
    idToken = await auth.currentUser.getIdToken();
  } catch (tokenError) {
    console.error("Error getting ID token:", tokenError);
    throw new Error("Could not obtain authentication token. Please try logging in again.");
  }

  const response = await fetch(`${API_BASE_URL}/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ symptomsDescription }),
  });

  const data = await response.json(); // Attempt to parse JSON regardless of response.ok status, as backend might send error details in JSON

  if (!response.ok) {
    // Use message from backend response if available, otherwise a generic error
    const errorMessage = data.message || `Symptom check failed with status: ${response.status}.`;
    console.error("Symptom Check API Error:", errorMessage, "Full response data:", data);
    throw new Error(errorMessage);
  }

  // data should be: { userInput, potentialIssues, recommendations, requiresUrgentCare, disclaimer, etc. }
  return data;
};
