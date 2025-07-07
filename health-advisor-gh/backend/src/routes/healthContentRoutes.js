const express = require('express');
const router = express.Router();
const healthContentController = require('../controllers/healthContentController');

// GET /api/health-content - Get a list of health tips/articles (can be filtered by query params)
// This route is public.
router.get('/', healthContentController.getHealthContent);

// GET /api/health-content/:id - Get details for a single content item by its ID
// Also public.
router.get('/:id', healthContentController.getHealthContentById);

module.exports = router;
