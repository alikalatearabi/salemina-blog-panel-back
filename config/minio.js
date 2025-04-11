const Minio = require('minio');
const dotenv = require('dotenv');

dotenv.config();

// MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// Bucket name for media files
const BUCKET_NAME = process.env.MINIO_BUCKET || 'blog-media';

// Initialize bucket if it doesn't exist
const initializeBucket = async () => {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, process.env.MINIO_REGION || 'us-east-1');
      console.log(`Created bucket: ${BUCKET_NAME}`);
      
      // Set bucket policy to allow public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: ['*']
            },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log(`Set public read policy for bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('Error initializing MinIO bucket:', error);
  }
};

// Get public URL for an object
const getPublicUrl = (objectName) => {
  return `${process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`}/${BUCKET_NAME}/${objectName}`;
};

module.exports = {
  minioClient,
  BUCKET_NAME,
  initializeBucket,
  getPublicUrl
}; 