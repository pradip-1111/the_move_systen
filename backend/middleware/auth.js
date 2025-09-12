const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No valid authorization token provided'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      error: 'Server error',
      message: 'Token verification failed'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }
  next();
};

// Optional authentication - sets user if token is valid, but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }
  } catch (error) {
    // Ignore errors in optional auth
  }
  
  next();
};

// Middleware to check resource ownership
const checkResourceOwnership = (resourceType = 'general') => {
  return (req, res, next) => {
    const resourceUserId = req.body.userId || req.params.userId || req.resource?.user?.toString();
    
    if (!resourceUserId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Resource user ID not found'
      });
    }

    if (req.userId.toString() !== resourceUserId && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: `You can only access your own ${resourceType}`
      });
    }
    
    next();
  };
};

// Middleware to validate JWT token format
const validateTokenFormat = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No authorization header provided'
    });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'Authorization header must start with "Bearer "'
    });
  }

  const token = authHeader.substring(7);
  if (!token || token.length < 10) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token format'
    });
  }

  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify token without middleware
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
  checkResourceOwnership,
  validateTokenFormat,
  generateToken,
  verifyToken
};