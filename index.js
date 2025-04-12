const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { initializeBucket } = require('./config/minio');

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

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the blog panel API' });
});
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

// Set port
const PORT = process.env.PORT || 5000;

// Production MongoDB connection string using Docker Compose service name
// Adjust the fallback URI to include the root credentials and authentication parameters.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:hami1370caspersisi@mongo:27017/blog_panel?authMechanism=DEFAULT&authSource=admin';

// Connect to MongoDB, then initialize the MinIO bucket, and finally start the server.
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return initializeBucket();
  })
  .then(() => {
    console.log('MinIO initialization completed');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error during startup:', err);
    process.exit(1);
  });

module.exports = app;
