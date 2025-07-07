const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const { adminRequired } = require('../middleware/adminMiddleware');

// All routes defined in this file will first verify the Firebase ID token (authentication)
// and then check if the authenticated user has admin privileges (authorization).
router.use(verifyFirebaseToken); // Step 1: Authenticate
router.use(adminRequired);    // Step 2: Authorize as Admin

// GET /api/admin/stats - Fetches some mock administrative statistics.
// Accessible only by authenticated admin users.
router.get('/stats', adminController.getAdminStats);

// Future Admin Routes (examples, not implemented in adminController yet):
// router.get('/users', adminController.listUsers);
// router.post('/users/:userId/set-admin', adminController.setUserAdminStatus); // For managing admin roles
// router.get('/clinics', adminController.listClinicsForAdmin);
// router.post('/clinics', adminController.addClinic);
// router.put('/clinics/:clinicId', adminController.updateClinic);
// router.delete('/clinics/:clinicId', adminController.deleteClinic);
// Similar CRUD for health content, etc.

module.exports = router;
