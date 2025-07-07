const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
// const { verifyFirebaseToken } = require('../middleware/authMiddleware'); // To protect routes
// const { ensureAdmin } = require('../middleware/adminMiddleware'); // Hypothetical admin check middleware

// GET /api/clinics - Get a list of clinics (can be filtered by query params)
// This route is public, anyone can access clinic listings.
router.get('/', clinicController.getClinics);

// GET /api/clinics/:id - Get details for a single clinic
// Also public.
router.get('/:id', clinicController.getClinicById);

/*
// Example of a protected route for adding clinics (for future admin functionality)
router.post(
  '/',
  verifyFirebaseToken, // User must be logged in
  // ensureAdmin,      // User must be an admin (middleware to be created)
  clinicController.addClinic // Hypothetical controller function
);
*/

module.exports = router;
