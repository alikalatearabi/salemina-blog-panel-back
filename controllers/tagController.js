const Tag = require('../models/Tag');
const Post = require('../models/Post');

// Get all tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if tag already exists
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      return res.status(400).json({ message: 'Tag already exists' });
    }
    
    const newTag = new Tag({ name });
    const savedTag = await newTag.save();
    
    res.status(201).json(savedTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a tag
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Check if new name conflicts with existing tag
    if (name) {
      const existingTag = await Tag.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      
      if (existingTag) {
        return res.status(400).json({ message: 'Tag name already in use' });
      }
    }
    
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    
    if (!updatedTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.status(200).json(updatedTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a tag
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if tag is in use
    const postsWithTag = await Post.countDocuments({ tags: id });
    if (postsWithTag > 0) {
      return res.status(400).json({ 
        message: `Cannot delete tag that is used by ${postsWithTag} posts` 
      });
    }
    
    const deletedTag = await Tag.findByIdAndDelete(id);
    if (!deletedTag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by tag
exports.getPostsByTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Find tag by id or slug
    let tag;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      tag = await Tag.findById(id);
    } else {
      tag = await Tag.findOne({ slug: id });
    }
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    // Find posts with this tag
    const posts = await Post.find({ 
      tags: tag._id,
      status: 'published'  // Only show published posts
    })
      .populate('authorId', 'name username')
      .populate('categories', 'name slug')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Post.countDocuments({ 
      tags: tag._id,
      status: 'published'
    });
    
    res.status(200).json({
      tag,
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 