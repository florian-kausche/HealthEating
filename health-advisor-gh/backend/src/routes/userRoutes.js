const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// Public route for registration
router.post('/register', authController.registerUser);

// Note: A backend /login route is not strictly necessary with Firebase client-side auth.
// The client logs in, gets an ID token, and sends it with requests.
// If you wanted to implement session cookies or custom tokens, you might add a /login endpoint.
// router.post('/login', authController.loginUser); // Example if you had such a method

// Protected route to get current user's profile
// The verifyFirebaseToken middleware will ensure the user is authenticated
router.get('/me', verifyFirebaseToken, authController.getCurrentUser);

module.exports = router;
