// Mock Chatbot Logic
const botResponses = {
  greetings: ["Hello! How can I help you with your health questions today?", "Hi there! What health topic is on your mind?", "Welcome! Feel free to ask me any general health questions."],
  farewells: ["Take care! Feel free to return if you have more questions.", "Stay healthy! Goodbye.", "Glad I could assist. Bye for now!"],
  gratitude: ["You're welcome!", "Happy to help!", "Anytime!"],
  default: ["I'm still learning and may not have information on that specific topic. Could you try phrasing your question differently, or ask about common health topics like diet, exercise, or common cold symptoms?", "That's an interesting question! I don't have specific information on that right now. Perhaps try searching for it on a trusted medical website?", "I can provide general health information. For specific medical advice, please consult a doctor."],
  keywords: [
    {
      keys: ["cold", "flu", "fever", "cough", "sore throat"],
      response: "For symptoms like fever, cough, or sore throat, it's important to rest, stay hydrated, and monitor your symptoms. Over-the-counter medications might help. If symptoms worsen or you have concerns, consulting a doctor is recommended. Would you like to know more about managing cold/flu symptoms or when to see a doctor?",
      suggestions: ["Tell me about managing cold symptoms", "When should I see a doctor for a cold?"]
    },
    {
      keys: ["diet", "nutrition", "healthy food", "eat", "food"],
      response: "A balanced diet is key to good health! It should include plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Staying hydrated by drinking enough water is also crucial. Do you have a specific question about diet or nutrition, like healthy snacks or meal planning?",
      suggestions: ["What are some healthy snacks?", "Tips for meal planning"]
    },
    {
      keys: ["exercise", "fitness", "workout", "stay active", "active"],
      response: "Regular physical activity is very beneficial for both physical and mental health. Aim for at least 150 minutes of moderate-intensity aerobic exercise or 75 minutes of vigorous-intensity exercise per week, plus muscle-strengthening activities twice a week. What kind of exercise are you interested in?",
      suggestions: ["Benefits of walking", "Home workout ideas"]
    },
    {
      keys: ["headache", "migraine"],
      response: "Headaches can be caused by many things, including stress, dehydration, or lack of sleep. For mild headaches, resting in a quiet, dark room, drinking water, and over-the-counter pain relievers might help. If headaches are severe, frequent, or accompanied by other symptoms like vision changes or dizziness, it's important to see a doctor. ",
      suggestions: ["How to prevent headaches?", "When is a headache serious?"]
    },
     {
      keys: ["stress", "anxiety", "feeling down", "mental health", "sad", "worried"],
      response: "It's important to take care of your mental health. Techniques like mindfulness, regular exercise, getting enough sleep, and talking to someone you trust can help manage stress and anxiety. If you're feeling overwhelmed or persistently down, speaking with a healthcare professional or a counselor can provide support and guidance.",
      suggestions: ["Tips for stress relief", "What is mindfulness?"]
    },
    {
      keys: ["sleep", "insomnia", "tired", "can't sleep"],
      response: "Good sleep is crucial for overall health. Most adults need 7-9 hours of quality sleep per night. To improve sleep, try maintaining a regular sleep schedule, creating a restful environment, and avoiding caffeine or heavy meals close to bedtime. If you consistently have trouble sleeping, it's a good idea to talk to a doctor.",
      suggestions: ["How to improve sleep quality?", "Effects of sleep deprivation"]
    },
    {
      keys: ["skin", "rash", "dry skin", "acne"],
      response: "Skin health can be affected by many factors including diet, hydration, hygiene, and environment. For general skin care, keep your skin clean and moisturized. If you have specific concerns like a persistent rash, severe acne, or changes in moles, it's best to consult a dermatologist.",
      suggestions: ["Tips for dry skin", "When to see a dermatologist for acne?"]
    },
    {
      keys: ["help", "support", "options"],
      response: "I can provide general information on topics like diet, exercise, managing common minor symptoms, and mental well-being. How can I assist you further?",
      suggestions: ["Tell me about healthy eating", "How to reduce stress?"]
    }
  ],
  clarification: [
    "Could you please tell me a bit more about that?",
    "I'm not sure I fully understand. Can you rephrase your question?",
    "To help me understand better, what specific information are you looking for regarding that topic?"
  ]
};

// Very simple session store (in-memory, will be lost on server restart)
// For a real app, use a database or a more persistent session store.
const userSessions = {};

function getRandomResponse(responsesArray) {
  if (!responsesArray || responsesArray.length === 0) {
    return "I'm not sure how to respond to that. Can you try asking in a different way?";
  }
  return responsesArray[Math.floor(Math.random() * responsesArray.length)];
}

exports.handleMessage = async (req, res) => {
  // If chatbot is public, req.user might not exist. We need a session ID mechanism.
  // For now, let's assume it's a protected route and req.user is available.
  // If it were public, client would need to generate/manage a unique sessionId.
  const { message } = req.body;
  const userId = req.user ? req.user.uid : 'anonymous_chatbot_user'; // Use Firebase UID if available

  if (!message || typeof message !== 'string' || message.trim() === "") {
    return res.status(400).json({
        response: "Please send a message for the chatbot.",
        suggestions: []
    });
  }

  const userMessage = message.toLowerCase().trim();
  let botReply = "";
  let suggestions = [];
  let matchedKeyword = false;

  // Initialize session if it doesn't exist
  if (!userSessions[userId]) {
    userSessions[userId] = {
      conversationHistory: [],
      lastTopic: null,
      greeted: false
    };
  }
  userSessions[userId].conversationHistory.push({ sender: 'user', text: message, timestamp: new Date() });

  // Check for greetings if not already greeted in this "session" (very basic session logic)
  if (!userSessions[userId].greeted && ["hello", "hi", "hey", "good morning", "good afternoon", "greetings"].some(greet => userMessage.startsWith(greet))) {
    botReply = getRandomResponse(botResponses.greetings);
    suggestions = ["Ask about diet", "Ask about exercise", "How to manage a cold?"];
    userSessions[userId].greeted = true; // Mark as greeted
    matchedKeyword = true;
  }
  // Check for farewells
  else if (["bye", "goodbye", "see you", "take care", "exit", "quit"].some(farewell => userMessage.includes(farewell))) {
    botReply = getRandomResponse(botResponses.farewells);
    // Optionally clear session here or parts of it
    // delete userSessions[userId];
    matchedKeyword = true;
  }
  // Check for gratitude
  else if (["thank you", "thanks", "appreciate it", "thx", "ty"].some(grat => userMessage.includes(grat))) {
    botReply = getRandomResponse(botResponses.gratitude);
    matchedKeyword = true;
  }
  // Keyword-based responses
  else {
    for (const item of botResponses.keywords) {
      if (item.keys.some(key => userMessage.includes(key))) {
        botReply = item.response;
        suggestions = item.suggestions || [];
        userSessions[userId].lastTopic = item.keys[0]; // Store first keyword as topic
        matchedKeyword = true;
        break;
      }
    }
  }

  // If no specific keyword match, use default or clarification
  if (!matchedKeyword) {
    // Simple logic: if last interaction had a topic, maybe try to clarify based on that, else default.
    // This part can be made much more sophisticated.
    if (userSessions[userId].lastTopic && userMessage.length < 15) { // very short follow-up might need clarification
        // botReply = getRandomResponse(botResponses.clarification) + ` Are you still asking about ${userSessions[userId].lastTopic}?`;
        botReply = getRandomResponse(botResponses.default); // Keep it simple for now
    } else {
        botReply = getRandomResponse(botResponses.default);
    }
     suggestions = ["Ask about healthy eating", "Tips for stress relief", "When to see a doctor for flu?"]; // Generic suggestions
  }

  userSessions[userId].conversationHistory.push({ sender: 'bot', text: botReply, timestamp: new Date() });
  // Keep history capped to avoid memory issues with this simple in-memory store
  if (userSessions[userId].conversationHistory.length > 20) {
      userSessions[userId].conversationHistory = userSessions[userId].conversationHistory.slice(-20);
  }

  // Simulate a delay
  setTimeout(() => {
    res.status(200).json({
      response: botReply,
      suggestions: suggestions,
      sessionId: userId, // Echo back the session ID used
      // history: userSessions[userId].conversationHistory // Optionally send back full history (can get large)
    });
  }, 300 + Math.random() * 400); // Simulate 0.3-0.7 second delay
};
