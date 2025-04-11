const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id/posts', categoryController.getPostsByCategory);

// Protected routes - only admin and editor can manage categories
router.post('/', protect, restrictTo('admin', 'editor'), categoryController.createCategory);
router.put('/:id', protect, restrictTo('admin', 'editor'), categoryController.updateCategory);
router.delete('/:id', protect, restrictTo('admin', 'editor'), categoryController.deleteCategory);

module.exports = router; 