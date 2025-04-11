const Post = require('../models/Post');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

// Get all posts with pagination, filtering and sorting
exports.getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      tag, 
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    const query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (author) query.authorId = author;
    
    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category) {
      query.categories = category;
    }
    
    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const posts = await Post.find(query)
      .populate('authorId', 'name username')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    // Get total documents count
    const total = await Post.countDocuments(query);
    
    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single post by ID or slug
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    let post;
    
    // Check if id is a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(id);
    } else {
      // If not a valid ObjectId, try to find by slug
      post = await Post.findOne({ slug: id });
    }
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Populate references
    await post.populate('authorId', 'name username');
    await post.populate('categories', 'name slug');
    await post.populate('tags', 'name slug');
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, excerpt, metaDescription, status, featuredImage, categories, tags } = req.body;
    
    // Ensure categories exist and get their IDs
    let categoryIds = [];
    if (categories && categories.length > 0) {
      categoryIds = await Promise.all(categories.map(async (categoryName) => {
        let category = await Category.findOne({ name: categoryName });
        if (!category) {
          category = new Category({ name: categoryName });
          await category.save();
        }
        return category._id;
      }));
    }
    
    // Ensure tags exist and get their IDs
    let tagIds = [];
    if (tags && tags.length > 0) {
      tagIds = await Promise.all(tags.map(async (tagName) => {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = new Tag({ name: tagName });
          await tag.save();
        }
        return tag._id;
      }));
    }
    
    const newPost = new Post({
      title,
      content,
      excerpt,
      metaDescription,
      status,
      featuredImage,
      authorId: req.user.id,  // From auth middleware
      categories: categoryIds,
      tags: tagIds
    });
    
    const savedPost = await newPost.save();
    
    // Populate references for response
    await savedPost.populate('authorId', 'name username');
    await savedPost.populate('categories', 'name slug');
    await savedPost.populate('tags', 'name slug');
    
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Handle categories update
    if (updateData.categories) {
      const categoryIds = await Promise.all(updateData.categories.map(async (categoryName) => {
        let category = await Category.findOne({ name: categoryName });
        if (!category) {
          category = new Category({ name: categoryName });
          await category.save();
        }
        return category._id;
      }));
      updateData.categories = categoryIds;
    }
    
    // Handle tags update
    if (updateData.tags) {
      const tagIds = await Promise.all(updateData.tags.map(async (tagName) => {
        let tag = await Tag.findOne({ name: tagName });
        if (!tag) {
          tag = new Tag({ name: tagName });
          await tag.save();
        }
        return tag._id;
      }));
      updateData.tags = tagIds;
    }
    
    // Find post and check permissions
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Only author or admin/editor can update
    if (post.authorId.toString() !== req.user.id && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    // Update and return the post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    // Populate references
    await updatedPost.populate('authorId', 'name username');
    await updatedPost.populate('categories', 'name slug');
    await updatedPost.populate('tags', 'name slug');
    
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update post status
exports.updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Only author or admin/editor can update status
    if (post.authorId.toString() !== req.user.id && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    post.status = status;
    await post.save();
    
    res.status(200).json({ 
      message: `Post status updated to ${status}`,
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Only author or admin can delete
    if (post.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 