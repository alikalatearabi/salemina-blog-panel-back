const Category = require('../models/Category');
const Post = require('../models/Post');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const newCategory = new Category({
      name,
      description
    });
    
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if new name conflicts with existing category
    if (name) {
      const existingCategory = await Category.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Category name already in use' });
      }
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category is in use
    const postsWithCategory = await Post.countDocuments({ categories: id });
    if (postsWithCategory > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category that is used by ${postsWithCategory} posts` 
      });
    }
    
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by category
exports.getPostsByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Find category by id or slug
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id });
    }
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Find posts with this category
    const posts = await Post.find({ 
      categories: category._id,
      status: 'published'  // Only show published posts
    })
      .populate('authorId', 'name username')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Post.countDocuments({ 
      categories: category._id,
      status: 'published'
    });
    
    res.status(200).json({
      category,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 