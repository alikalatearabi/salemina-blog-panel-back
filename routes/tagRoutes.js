const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', tagController.getAllTags);
router.get('/:id/posts', tagController.getPostsByTag);

// Protected routes - only admin and editor can manage tags
router.post('/', protect, restrictTo('admin', 'editor'), tagController.createTag);
router.put('/:id', protect, restrictTo('admin', 'editor'), tagController.updateTag);
router.delete('/:id', protect, restrictTo('admin', 'editor'), tagController.deleteTag);

module.exports = router; 