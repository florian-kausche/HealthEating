import { auth } from '../firebaseConfig'; // To get ID token

const API_BASE_URL = '/api/chatbot'; // Assuming frontend and backend are served on the same domain or proxied

export const sendMessageToBot = async (message) => {
  if (!auth || !auth.currentUser) {
    const errorMessage = !auth ? "Firebase not initialized. Cannot use chatbot." : "User not authenticated. Please login to use the chatbot.";
    console.error("sendMessageToBot Error:", errorMessage);
    throw new Error(errorMessage);
  }

  let idToken;
  try {
    idToken = await auth.currentUser.getIdToken();
  } catch (tokenError) {
    console.error("Error getting ID token for chatbot:", tokenError);
    throw new Error("Could not obtain authentication token. Please try logging in again.");
  }

  // The backend controller uses req.user.uid (derived from the idToken by verifyFirebaseToken middleware)
  // as the effective "sessionId" for managing conversation context, if any.
  // So, we don't need to explicitly send a sessionId from the client here if using Firebase auth.
  const response = await fetch(`${API_BASE_URL}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ message: message }),
  });

  const data = await response.json(); // Attempt to parse JSON regardless of response.ok status

  if (!response.ok) {
    // Use 'response' field from backend error if available (as per chatbotController error format),
    // then 'message', then a generic error.
    const errorMessage = data.response || data.message || `Chatbot request failed with status: ${response.status}.`;
    console.error("Chatbot API Error:", errorMessage, "Full response data:", data);
    throw new Error(errorMessage);
  }

  // Expected successful data: { response: "chatbot's reply", suggestions: [], sessionId: "..." }
  return data;
};
