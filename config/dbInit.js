const mongoose = require('mongoose');
const { seedDatabase } = require('./dbSeed');

/**
 * Initialize the database and create required collections
 * @param {boolean} seedData Whether to seed the database with initial data
 */
const initializeDatabase = async (seedData = true) => {
  try {
    const connection = mongoose.connection;
    
    // Wait for connection to be established
    if (connection.readyState !== 1) {
      await new Promise(resolve => {
        connection.once('connected', resolve);
      });
    }
    
    console.log('Setting up database collections...');
    
    // Get the database name from the connection string or default to blog_panel
    const dbName = connection.name || 'blog_panel';
    console.log(`Using database: ${dbName}`);
    
    // Check if collections exist, if not they will be created when the models are used
    const collections = await connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // List of required collections based on your models
    const requiredCollections = ['users', 'posts', 'categories', 'tags', 'media'];
    
    // Log which collections exist and which need to be created
    requiredCollections.forEach(collection => {
      if (collectionNames.includes(collection)) {
        console.log(`Collection '${collection}' already exists.`);
      } else {
        console.log(`Collection '${collection}' will be created when needed.`);
      }
    });
    
    console.log('Database initialization completed.');
    
    // Seed the database with initial data if requested
    if (seedData) {
      await seedDatabase();
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

module.exports = { initializeDatabase }; 