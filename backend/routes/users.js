const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Review = require('../models/Review');
const Watchlist = require('../models/Watchlist');
const { authenticate, checkResourceOwnership, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .select('-password -__v')
      .populate('reviews', 'rating title movie createdAt', null, {
        limit: 5,
        sort: { createdAt: -1 }
      });

    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        favoriteGenres: user.favoriteGenres,
        reviewCount: user.reviewCount,
        watchlistCount: user.watchlistCount,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'The provided user ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch user profile'
    });
  }
});

// Update user profile
router.put('/:userId', authenticate, checkResourceOwnership('profile'), [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('favoriteGenres')
    .optional()
    .isArray()
    .withMessage('Favorite genres must be an array'),
  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('Profile picture must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Please check your input',
        details: errors.array()
      });
    }

    const userId = req.params.userId;
    const { username, bio, favoriteGenres, profilePicture } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Check if username is being changed and already exists
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          error: 'Username taken',
          message: 'This username is already taken'
        });
      }
      user.username = username;
    }

    // Update other fields
    if (bio !== undefined) user.bio = bio;
    if (favoriteGenres !== undefined) user.favoriteGenres = favoriteGenres;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        favoriteGenres: user.favoriteGenres,
        reviewCount: user.reviewCount,
        watchlistCount: user.watchlistCount
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to update profile'
    });
  }
});

// Get user's reviews
router.get('/:userId/reviews', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('sortBy').optional().isIn(['newest', 'rating_high', 'rating_low', 'helpful']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: errors.array()
      });
    }

    const userId = req.params.userId;
    const {
      page = 1,
      limit = 10,
      sortBy = 'newest'
    } = req.query;

    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const reviews = await Review.getUserReviews(userId, {
      sortBy,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    const totalReviews = await Review.countDocuments({
      user: userId,
      isActive: true
    });

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: skip + reviews.length < totalReviews,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'The provided user ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch user reviews'
    });
  }
});

// Get user's review statistics
router.get('/:userId/review-stats', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const stats = await Review.aggregate([
      { $match: { user: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalHelpfulVotes: { $sum: '$helpfulVotes' },
          ratingDistribution: {
            $push: {
              $switch: {
                branches: [
                  { case: { $eq: ['$rating', 5] }, then: 'five' },
                  { case: { $eq: ['$rating', 4] }, then: 'four' },
                  { case: { $eq: ['$rating', 3] }, then: 'three' },
                  { case: { $eq: ['$rating', 2] }, then: 'two' },
                  { case: { $eq: ['$rating', 1] }, then: 'one' }
                ],
                default: 'unknown'
              }
            }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        totalHelpfulVotes: 0,
        ratingDistribution: { five: 0, four: 0, three: 0, two: 0, one: 0 }
      });
    }

    const result = stats[0];
    const distribution = { five: 0, four: 0, three: 0, two: 0, one: 0 };
    
    result.ratingDistribution.forEach(rating => {
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });

    res.json({
      totalReviews: result.totalReviews,
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalHelpfulVotes: result.totalHelpfulVotes,
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Get user review stats error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'The provided user ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch user review statistics'
    });
  }
});

// Search users
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: errors.array()
      });
    }

    const {
      q,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (page - 1) * limit;

    const searchRegex = new RegExp(q, 'i');
    
    const users = await User.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { username: searchRegex },
            { bio: searchRegex }
          ]
        }
      ]
    })
    .select('username profilePicture bio reviewCount watchlistCount createdAt')
    .sort({ reviewCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalUsers = await User.countDocuments({
      $and: [
        { isActive: true },
        {
          $or: [
            { username: searchRegex },
            { bio: searchRegex }
          ]
        }
      ]
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: skip + users.length < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to search users'
    });
  }
});

// Get top reviewers
router.get('/top', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: errors.array()
      });
    }

    const { limit = 10 } = req.query;

    const topUsers = await User.find({ isActive: true, reviewCount: { $gt: 0 } })
      .select('username profilePicture bio reviewCount watchlistCount createdAt')
      .sort({ reviewCount: -1, createdAt: 1 })
      .limit(parseInt(limit));

    res.json({ users: topUsers });
  } catch (error) {
    console.error('Get top reviewers error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch top reviewers'
    });
  }
});

// Admin: Get all users
router.get('/', authenticate, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['active', 'inactive', 'all']).withMessage('Invalid status filter')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      status = 'all'
    } = req.query;

    const skip = (page - 1) * limit;

    let query = {};
    if (status === 'active') query.isActive = true;
    else if (status === 'inactive') query.isActive = false;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: skip + users.length < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch users'
    });
  }
});

// Admin: Toggle user status
router.patch('/:userId/toggle-status', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'The provided user ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to toggle user status'
    });
  }
});

module.exports = router;