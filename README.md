# Blog Panel Backend

A RESTful API for managing blog posts built with Express.js, MongoDB, and MinIO for file storage.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- MinIO (for file storage)

Alternatively, you can use Docker Compose to run all services.

## Installation

### Option 1: Manual Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the configuration as needed
4. Initialize the database with seed data:
   ```
   npm run seed
   ```
   This will create:
   - A default admin user
   - Default categories
   - Default tags
   - Ensure all database indexes are created

### Option 2: Docker Compose

1. Make sure you have Docker and Docker Compose installed
2. Run:
   ```
   docker-compose up -d
   ```
   This will start:
   - The Node.js backend on port 5000
   - MongoDB on port 27017
   - MinIO on ports 9000 (API) and 9001 (Console)
3. Initialize the database (if it's a fresh installation):
   ```
   docker exec blog-panel-backend npm run seed
   ```

## Running the Application

### Development mode (local)
```
npm run dev
```

### Production mode (local)
```
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout

### Posts
- `GET /api/posts` - Get all posts (with pagination, filtering)
- `GET /api/posts/:id` - Get a single post by ID or slug
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `PUT /api/posts/:id/status` - Update post status
- `DELETE /api/posts/:id` - Delete a post

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id/posts` - Get posts by category
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/:id/posts` - Get posts by tag
- `POST /api/tags` - Create a new tag
- `PUT /api/tags/:id` - Update a tag
- `DELETE /api/tags/:id` - Delete a tag

### Media Upload
- `POST /api/media/upload` - Upload media files
- `GET /api/media` - List uploaded media files
- `DELETE /api/media/:id` - Delete media file

## Project Structure

```
blog_panel_back/
├── config/            # Configuration files
├── controllers/       # Request handlers
├── middleware/        # Custom middleware
├── models/            # Database models
├── routes/            # API routes
├── scripts/           # Utility scripts
│   └── seed.js        # Database initialization script
├── .env               # Environment variables
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile         # Docker configuration
├── index.js           # Entry point
└── package.json       # Project dependencies
```

## Database Initialization

On first run, you should initialize the database with the seed script. This ensures:

1. The necessary database indexes are created for optimal performance
2. A default admin user is created (if none exists)
3. Default categories and tags are set up
4. The MinIO bucket for file storage is properly initialized

You can customize the default admin credentials by setting these environment variables:
- `ADMIN_USERNAME` (default: "admin")
- `ADMIN_EMAIL` (default: "admin@example.com")
- `ADMIN_PASSWORD` (default: "admin123") 