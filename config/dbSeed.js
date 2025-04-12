const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

/**
 * Seed the database with initial data if it's empty
 */
const seedDatabase = async () => {
  try {
    // Check if we need to seed admin user
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding admin user...');
      const adminUser = new User({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123', // Will be hashed by the model
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created successfully.');
    }

    // Check if we need to seed default categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('Seeding default categories...');
      const defaultCategories = [
        { name: 'Technology', slug: 'technology', description: 'Technology related posts' },
        { name: 'Programming', slug: 'programming', description: 'Programming related posts' },
        { name: 'Design', slug: 'design', description: 'Design related posts' }
      ];
      await Category.insertMany(defaultCategories);
      console.log('Default categories created successfully.');
    }

    // Check if we need to seed default tags
    const tagCount = await Tag.countDocuments();
    if (tagCount === 0) {
      console.log('Seeding default tags...');
      const defaultTags = [
        { name: 'JavaScript', slug: 'javascript' },
        { name: 'Node.js', slug: 'nodejs' },
        { name: 'MongoDB', slug: 'mongodb' },
        { name: 'Express', slug: 'express' },
        { name: 'React', slug: 'react' }
      ];
      await Tag.insertMany(defaultTags);
      console.log('Default tags created successfully.');
    }

    console.log('Database seeding completed.');
  } catch (error) {
    console.error('Database seeding failed:', error);
  }
};

module.exports = { seedDatabase }; 