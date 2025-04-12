// This script will be executed when MongoDB container starts for the first time
db = db.getSiblingDB('admin');

// Authenticate as the root user
db.auth('root', 'hami1370caspersisi');

// Create blog_panel database
db = db.getSiblingDB('blog_panel');

// Create a user for blog_panel database if needed
try {
  db.createUser({
    user: 'blog_user',
    pwd: 'hami1370caspersisi',
    roles: [
      { role: 'readWrite', db: 'blog_panel' },
      { role: 'dbAdmin', db: 'blog_panel' }
    ]
  });
  print('blog_user created successfully');
} catch (error) {
  print('User blog_user might already exist: ' + error.message);
}

// Create collections
db.createCollection('users');
db.createCollection('posts');
db.createCollection('categories');
db.createCollection('tags');
db.createCollection('media');

print('blog_panel database and collections initialized successfully'); 