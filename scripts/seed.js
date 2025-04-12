const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

// Load environment variables
dotenv.config();

// Use the MONGODB_URI from environment; if not provided, fallback to the server default.
// The fallback string uses the service name "mongo" (as defined in your Compose file) and includes authentication details.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:hami1370caspersisi@mongo:27017/blog_panel?authMechanism=DEFAULT&authSource=admin';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

// Create admin user if none exists
const createAdminUser = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount === 0) {
      // Admin user doesn't exist, create one
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', salt);
      
      const adminUser = new User({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Create default categories
const createDefaultCategories = async () => {
  try {
    const categoryCount = await Category.countDocuments();
    
    if (categoryCount === 0) {
      // Create default categories
      const defaultCategories = [
        { name: 'Uncategorized', description: 'Default category for uncategorized posts' },
        { name: 'Technology', description: 'Posts related to technology' },
        { name: 'News', description: 'Latest news and updates' }
      ];
      
      await Category.insertMany(defaultCategories);
      console.log('Default categories created');
    } else {
      console.log('Categories already exist');
    }
  } catch (error) {
    console.error('Error creating default categories:', error);
  }
};

// Create default tags
const createDefaultTags = async () => {
  try {
    const tagCount = await Tag.countDocuments();
    
    if (tagCount === 0) {
      // Create default tags
      const defaultTags = [
        { name: 'General' },
        { name: 'Featured' },
        { name: 'Important' }
      ];
      
      await Tag.insertMany(defaultTags);
      console.log('Default tags created');
    } else {
      console.log('Tags already exist');
    }
  } catch (error) {
    console.error('Error creating default tags:', error);
  }
};

// Ensure indexes are created
const ensureIndexes = async () => {
  try {
    // Make sure indexes are created
    await User.createIndexes();
    await Category.createIndexes();
    await Tag.createIndexes();
    console.log('Database indexes created/verified');
  } catch (error) {
    console.error('Error ensuring indexes:', error);
  }
};

// Run seed functions
const seedDatabase = async () => {
  try {
    await createAdminUser();
    await createDefaultCategories();
    await createDefaultTags();
    await ensureIndexes();
    
    console.log('Database seeding completed successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Database seeding failed:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();
