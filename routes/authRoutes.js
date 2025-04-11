const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', protect, authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router; 