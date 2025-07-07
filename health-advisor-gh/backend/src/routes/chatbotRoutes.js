const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// POST /api/chatbot/message
// Body: { message: "user's message" }
// This route is protected, meaning a user must be logged in to use the chatbot.
// The `verifyFirebaseToken` middleware will attach `req.user` which contains `uid`.
// The controller uses `req.user.uid` as the `sessionId`.
router.post('/message', verifyFirebaseToken, chatbotController.handleMessage);

module.exports = router;
