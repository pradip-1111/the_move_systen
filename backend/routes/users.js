const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { User, Review, Watchlist } = require('../models/index');
const { authenticate, checkResourceOwnership, requireAdmin } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      include: [{
        model: Review,
        as: 'reviews',
        attributes: ['rating', 'title', 'movieId', 'createdAt'],
        limit: 5,
        order: [['createdAt', 'DESC']],
        required: false
      }]
    });

    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture,
        bio: user.bio,
        reviewCount: user.reviewCount,
        watchlistCount: user.watchlistCount,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
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
    const { username, bio, profilePicture } = req.body;

    const user = await User.findByPk(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Check if username is being changed and already exists
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        where: { username } 
      });
      if (existingUser) {
        return res.status(400).json({
          error: 'Username taken',
          message: 'This username is already taken'
        });
      }
    }

    // Update user
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    await user.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
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

    const offset = (page - 1) * limit;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Build order clause
    let orderClause = [];
    switch (sortBy) {
      case 'newest':
        orderClause = [['createdAt', 'DESC']];
        break;
      case 'rating_high':
        orderClause = [['rating', 'DESC']];
        break;
      case 'rating_low':
        orderClause = [['rating', 'ASC']];
        break;
      case 'helpful':
        orderClause = [['helpfulVotes', 'DESC']];
        break;
    }

    const { rows: reviews, count: totalReviews } = await Review.findAndCountAll({
      where: {
        userId: userId,
        isActive: true
      },
      include: [{
        model: require('../models/Movie'),
        as: 'movie',
        attributes: ['title', 'posterUrl', 'releaseDate']
      }],
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: offset + reviews.length < totalReviews,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
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
    const user = await User.findByPk(userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    const sequelize = require('../config/database');
    
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalReviews,
        AVG(rating) as averageRating,
        SUM(helpfulVotes) as totalHelpfulVotes,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as fiveStars,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as fourStars,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as threeStars,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as twoStars,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as oneStar
      FROM Reviews 
      WHERE userId = :userId AND isActive = true
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!results.length || results[0].totalReviews === '0') {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        totalHelpfulVotes: 0,
        ratingDistribution: { five: 0, four: 0, three: 0, two: 0, one: 0 }
      });
    }

    const stats = results[0];

    res.json({
      totalReviews: parseInt(stats.totalReviews),
      averageRating: Math.round(parseFloat(stats.averageRating) * 10) / 10,
      totalHelpfulVotes: parseInt(stats.totalHelpfulVotes),
      ratingDistribution: {
        five: parseInt(stats.fiveStars),
        four: parseInt(stats.fourStars),
        three: parseInt(stats.threeStars),
        two: parseInt(stats.twoStars),
        one: parseInt(stats.oneStar)
      }
    });
  } catch (error) {
    console.error('Get user review stats error:', error);
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

    const offset = (page - 1) * limit;

    const { rows: users, count: totalUsers } = await User.findAndCountAll({
      where: {
        [Op.and]: [
          { isActive: true },
          {
            [Op.or]: [
              { username: { [Op.iLike]: `%${q}%` } },
              { bio: { [Op.iLike]: `%${q}%` } }
            ]
          }
        ]
      },
      attributes: ['id', 'username', 'profilePicture', 'bio', 'reviewCount', 'watchlistCount', 'createdAt'],
      order: [['reviewCount', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: offset + users.length < totalUsers,
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

    const topUsers = await User.findAll({
      where: { 
        isActive: true, 
        reviewCount: { [Op.gt]: 0 } 
      },
      attributes: ['id', 'username', 'profilePicture', 'bio', 'reviewCount', 'watchlistCount', 'createdAt'],
      order: [['reviewCount', 'DESC'], ['createdAt', 'ASC']],
      limit: parseInt(limit)
    });

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

    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status === 'active') whereClause.isActive = true;
    else if (status === 'inactive') whereClause.isActive = false;

    const { rows: users, count: totalUsers } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: offset + users.length < totalUsers,
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

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to toggle user status'
    });
  }
});

module.exports = router;