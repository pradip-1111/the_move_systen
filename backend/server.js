const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./models/index');
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

// CORS configuration - more permissive for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// SQLite database connection
let sqliteConnected = false;

const initializeSQLite = async () => {
  try {
    console.log('🔄 Initializing SQLite database...');
    const success = await initializeDatabase();
    if (success) {
      console.log('✅ SQLite database initialized successfully');
      sqliteConnected = true;
    } else {
      console.error('❌ Failed to initialize SQLite database');
      sqliteConnected = false;
    }
  } catch (error) {
    console.error('❌ SQLite database initialization error:', error.message);
    console.log('ℹ️  The server will continue running without database functionality.');
    sqliteConnected = false;
  }
};

// Initialize database
initializeSQLite();

// Middleware to check SQLite connection
const requireDatabase = (req, res, next) => {
  if (!sqliteConnected) {
    return res.status(503).json({
      error: 'Database Unavailable',
      message: 'SQLite database is not connected. Please check the database configuration.',
      note: 'The database file will be created automatically when the connection is established.'
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
const tmdbRoutes = require('./routes/tmdb');

// Routes
app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/movies', requireDatabase, movieRoutes);
app.use('/api/reviews', requireDatabase, reviewRoutes);
app.use('/api/users', requireDatabase, userRoutes);
app.use('/api/watchlist', requireDatabase, watchlistRoutes);
app.use('/api/tmdb', requireDatabase, tmdbRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Movie Review Platform API is running with SQLite',
    database: sqliteConnected ? 'Connected' : 'Disconnected',
    databaseType: 'SQLite',
    timestamp: new Date().toISOString(),
    ...(sqliteConnected ? {} : {
      note: 'Some features may be unavailable without database connection',
      setup: 'SQLite database will be created automatically'
    })
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.errors?.map(e => ({ field: e.path, message: e.message }))
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists',
      details: err.errors?.map(e => ({ field: e.path, message: e.message }))
    });
  }
  
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      error: 'Database Error',
      message: 'A database error occurred'
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
  console.log(`Database: SQLite (${sqliteConnected ? 'Connected' : 'Disconnected'})`);
});

module.exports = app;