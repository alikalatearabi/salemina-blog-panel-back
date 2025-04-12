const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { initializeBucket } = require('./config/minio');
const { initializeDatabase } = require('./config/dbInit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize MinIO bucket
initializeBucket().catch(err => console.error('MinIO init error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the blog panel API' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/media', mediaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_panel')
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize database and create collections
    // Pass true to seed with initial data, or false to just create collections
    const shouldSeedData = process.env.SEED_DATABASE !== 'false';
    initializeDatabase(shouldSeedData);
  })
  .catch(err => console.error('Could not connect to MongoDB', err));

module.exports = app; 