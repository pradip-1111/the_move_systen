const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Trust proxy for rate limiting (fixes X-Forwarded-For warning)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with graceful error handling
let mongoConnected = false;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_review_platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of default 30s
    });
    console.log('✅ Connected to MongoDB');
    mongoConnected = true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('ℹ️  The server will continue running without database functionality.');
    console.log('ℹ️  To enable full functionality, please install and start MongoDB:');
    console.log('   • Download from: https://www.mongodb.com/try/download/community');
    console.log('   • Or install with: npm install -g mongodb-memory-server');
    console.log('   • Then restart the application');
    mongoConnected = false;
  }
};

// Initialize database and populate with movie data
const initializeDatabase = async () => {
  await connectMongoDB();
  
  if (mongoConnected) {
    try {
      const tmdbService = require('./services/tmdbService');
      await tmdbService.populateDatabase();
    } catch (error) {
      console.error('Error populating database:', error.message);
    }
  }
};

initializeDatabase();

// Middleware to check MongoDB connection
const requireDatabase = (req, res, next) => {
  if (!mongoConnected) {
    return res.status(503).json({
      error: 'Database Unavailable',
      message: 'MongoDB is not connected. Please install and start MongoDB to use this feature.',
      installInstructions: {
        download: 'https://www.mongodb.com/try/download/community',
        npmPackage: 'mongodb-memory-server for development'
      }
    });
  }
  next();
};

// Import routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const watchlistRoutes = require('./routes/watchlist');

// Routes
app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/movies', requireDatabase, movieRoutes);
app.use('/api/reviews', requireDatabase, reviewRoutes);
app.use('/api/users', requireDatabase, userRoutes);
app.use('/api/watchlist', requireDatabase, watchlistRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Movie Review Platform API is running',
    database: mongoConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    ...(mongoConnected ? {} : {
      note: 'Some features may be unavailable without database connection',
      setup: 'Install MongoDB to enable full functionality'
    })
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'The provided ID is not valid'
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;