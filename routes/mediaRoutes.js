const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');

// All media routes are protected and require authentication
router.post('/upload', protect, mediaController.uploadFile);
router.get('/', protect, mediaController.getAllMedia);
router.delete('/:id', protect, mediaController.deleteMedia);

module.exports = router; 