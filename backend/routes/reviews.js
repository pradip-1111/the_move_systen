const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Review, Movie, User } = require('../models/index');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get reviews for a specific movie
router.get('/movie/:movieId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('sortBy').optional().isIn(['newest', 'oldest', 'rating_high', 'rating_low', 'helpful']).withMessage('Invalid sort option')
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

    const movieId = req.params.movieId;
    const {
      page = 1,
      limit = 10,
      sortBy = 'helpful'
    } = req.query;

    const offset = (page - 1) * limit;

    // Check if movie exists
    const movie = await Movie.findByPk(movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Build order clause
    let orderClause = [];
    switch (sortBy) {
      case 'newest':
        orderClause = [['createdAt', 'DESC']];
        break;
      case 'oldest':
        orderClause = [['createdAt', 'ASC']];
        break;
      case 'rating_high':
        orderClause = [['rating', 'DESC']];
        break;
      case 'rating_low':
        orderClause = [['rating', 'ASC']];
        break;
      case 'helpful':
      default:
        orderClause = [['helpfulVotes', 'DESC'], ['createdAt', 'DESC']];
    }

    const { rows: reviews, count: totalReviews } = await Review.findAndCountAll({
      where: {
        movieId: movieId,
        isActive: true,
        moderationStatus: 'approved'
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['username', 'profilePicture', 'reviewCount']
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
    console.error('Get movie reviews error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch reviews'
    });
  }
});

// Submit a new review for a movie
router.post('/movie/:movieId', authenticate, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('spoilers')
    .optional()
    .isBoolean()
    .withMessage('Spoilers must be a boolean')
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

    const movieId = req.params.movieId;
    const { rating, title, content, spoilers = false } = req.body;

    // Check if movie exists
    const movie = await Movie.findByPk(movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      where: {
        userId: req.user.id,
        movieId: movieId
      }
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await existingReview.update({
        rating,
        title,
        content,
        spoilers,
        isEdited: true,
        editedAt: new Date()
      });
    } else {
      // Create new review
      review = await Review.create({
        userId: req.user.id,
        movieId: movieId,
        rating,
        title,
        content,
        spoilers
      });
    }

    // Get review with user info for response
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['username', 'profilePicture', 'reviewCount']
      }]
    });

    // Get updated movie statistics
    const updatedMovie = await Movie.findByPk(movieId);
    
    res.status(201).json({
      message: existingReview ? 'Review updated successfully' : 'Review submitted successfully',
      review: reviewWithUser,
      updated: !!existingReview,
      movieStats: {
        averageRating: updatedMovie.averageRating,
        totalRatings: updatedMovie.totalRatings,
        ratingDistribution: updatedMovie.ratingDistribution
      }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to submit review'
    });
  }
});

// Update a review
router.put('/:reviewId', authenticate, [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  body('spoilers')
    .optional()
    .isBoolean()
    .withMessage('Spoilers must be a boolean')
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

    const reviewId = req.params.reviewId;
    const updateData = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Check if user owns this review or is admin
    if (review.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own reviews'
      });
    }

    await review.update(updateData);

    // Get updated review with user info
    const updatedReview = await Review.findByPk(reviewId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['username', 'profilePicture', 'reviewCount']
      }]
    });

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to update review'
    });
  }
});

// Delete a review
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Check if user owns this review or is admin
    if (review.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own reviews'
      });
    }

    // Soft delete by setting isActive to false
    await review.update({ isActive: false });

    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to delete review'
    });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const review = await Review.findByPk(reviewId);
    if (!review || !review.isActive) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Users cannot mark their own reviews as helpful
    if (review.userId === req.user.id) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'You cannot mark your own review as helpful'
      });
    }

    // Increment helpful votes
    await review.increment(['helpfulVotes', 'totalVotes']);

    res.json({
      message: 'Review marked as helpful',
      helpfulVotes: review.helpfulVotes + 1,
      totalVotes: review.totalVotes + 1
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to mark review as helpful'
    });
  }
});

// Mark review as not helpful
router.post('/:reviewId/not-helpful', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const review = await Review.findByPk(reviewId);
    if (!review || !review.isActive) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Users cannot vote on their own reviews
    if (review.userId === req.user.id) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'You cannot vote on your own review'
      });
    }

    // Increment only total votes
    await review.increment('totalVotes');

    res.json({
      message: 'Review marked as not helpful',
      helpfulVotes: review.helpfulVotes,
      totalVotes: review.totalVotes + 1
    });
  } catch (error) {
    console.error('Mark not helpful error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to mark review as not helpful'
    });
  }
});

// Flag a review
router.post('/:reviewId/flag', authenticate, [
  body('reason')
    .isIn(['spam', 'inappropriate', 'spoiler'])
    .withMessage('Invalid flag reason')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid flag reason',
        details: errors.array()
      });
    }

    const reviewId = req.params.reviewId;
    const { reason } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review || !review.isActive) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Users cannot flag their own reviews
    if (review.userId === req.user.id) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'You cannot flag your own review'
      });
    }

    // Update moderation status to flagged
    await review.update({ 
      moderationStatus: 'flagged',
      flagReason: reason
    });

    res.json({
      message: 'Review flagged successfully',
      moderationStatus: review.moderationStatus
    });
  } catch (error) {
    console.error('Flag review error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to flag review'
    });
  }
});

// Get review statistics
router.get('/stats', async (req, res) => {
  try {
    const sequelize = require('../config/database');
    
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalReviews,
        AVG(rating) as averageRating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as fiveStars,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as fourStars,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as threeStars,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as twoStars,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as oneStar
      FROM Reviews 
      WHERE isActive = true AND moderationStatus = 'approved'
    `);

    const stats = results[0];
    
    res.json({
      totalReviews: parseInt(stats.totalReviews),
      averageRating: parseFloat(stats.averageRating) || 0,
      ratingDistribution: {
        five: parseInt(stats.fiveStars),
        four: parseInt(stats.fourStars),
        three: parseInt(stats.threeStars),
        two: parseInt(stats.twoStars),
        one: parseInt(stats.oneStar)
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch review statistics'
    });
  }
});

module.exports = router;