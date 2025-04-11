const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const Media = require('../models/Media');
const { minioClient, BUCKET_NAME, getPublicUrl } = require('../config/minio');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and common document formats
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Helper function to generate unique filename
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  const basename = path.basename(originalname, extension)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
    
  return `${basename}-${timestamp}-${randomString}${extension}`;
};

// Upload a single file
exports.uploadFile = [
  // Use multer middleware to handle file upload
  upload.single('file'),
  
  // Process the upload and store in MinIO
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const { originalname, buffer, mimetype, size } = req.file;
      const { blogPostId } = req.body;
      
      // Generate unique filename
      const filename = generateUniqueFilename(originalname);
      
      // Upload to MinIO
      await minioClient.putObject(
        BUCKET_NAME,
        filename,
        buffer,
        size,
        { 'Content-Type': mimetype }
      );
      
      // Get the public URL
      const url = getPublicUrl(filename);
      
      // Save file info to database
      const media = new Media({
        filename,
        originalname,
        path: `${BUCKET_NAME}/${filename}`,
        mimetype,
        size,
        url,
        blogPostId: blogPostId || null,
        uploadedById: req.user.id  // From auth middleware
      });
      
      await media.save();
      
      res.status(201).json({
        message: 'File uploaded successfully',
        media
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

// Get all media files with pagination
exports.getAllMedia = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    // Filter by type if specified
    const query = {};
    if (type) {
      query.mimetype = { $regex: `^${type}\/` };
    }
    
    // Only return media uploaded by the current user unless admin
    if (req.user.role !== 'admin') {
      query.uploadedById = req.user.id;
    }
    
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Media.countDocuments(query);
    
    res.status(200).json({
      media,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete media file
exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Check if user is authorized to delete
    if (media.uploadedById.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this media' });
    }
    
    // Delete from MinIO
    await minioClient.removeObject(BUCKET_NAME, media.filename);
    
    // Delete from database
    await Media.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 