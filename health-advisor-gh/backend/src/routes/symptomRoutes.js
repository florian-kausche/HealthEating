const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware'); // Assuming symptom checking requires login

// POST /api/symptoms/check
// Body: { symptomsDescription: "text..." }
// Protected route: only logged-in users can check symptoms.
// This is a design choice. If it should be public, remove verifyFirebaseToken.
router.post('/check', verifyFirebaseToken, symptomController.checkSymptoms);

module.exports = router;
