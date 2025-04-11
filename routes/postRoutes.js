const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

// Protected routes
router.post('/', protect, postController.createPost);
router.put('/:id', protect, postController.updatePost);
router.put('/:id/status', protect, postController.updatePostStatus);
router.delete('/:id', protect, postController.deletePost);

module.exports = router; 