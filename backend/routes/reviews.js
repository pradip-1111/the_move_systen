const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { authenticate, optionalAuth } = require('../middleware/auth');

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

    const skip = (page - 1) * limit;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    const reviews = await Review.getMovieReviews(movieId, {
      sortBy,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    const totalReviews = await Review.countDocuments({
      movie: movieId,
      isActive: true,
      moderationStatus: 'approved'
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
    console.error('Get movie reviews error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid movie ID',
        message: 'The provided movie ID is not valid'
      });
    }
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
    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      user: req.user._id,
      movie: movieId
    });

    if (existingReview) {
      return res.status(400).json({
        error: 'Review already exists',
        message: 'You have already reviewed this movie. Use the update endpoint to modify your review.'
      });
    }

    // Create new review
    const review = new Review({
      user: req.user._id,
      movie: movieId,
      rating,
      title,
      content,
      spoilers
    });

    await review.save();

    // Populate user info for response
    await review.populate('user', 'username profilePicture reviewCount');

    // Get updated movie statistics
    const updatedMovie = await Movie.findById(movieId);
    
    res.status(201).json({
      message: 'Review submitted successfully',
      review,
      movieStats: {
        averageRating: updatedMovie.averageRating,
        totalRatings: updatedMovie.totalRatings,
        ratingDistribution: updatedMovie.ratingDistribution
      }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid movie ID',
        message: 'The provided movie ID is not valid'
      });
    }
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

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own reviews'
      });
    }

    // Update review fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        review[key] = updateData[key];
      }
    });

    await review.save();
    await review.populate('user', 'username profilePicture reviewCount');

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid review ID',
        message: 'The provided review ID is not valid'
      });
    }
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

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own reviews'
      });
    }

    // Soft delete by setting isActive to false
    review.isActive = false;
    await review.save();

    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid review ID',
        message: 'The provided review ID is not valid'
      });
    }
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

    const review = await Review.findById(reviewId);
    if (!review || !review.isActive) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Users cannot mark their own reviews as helpful
    if (review.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'You cannot mark your own review as helpful'
      });
    }

    await review.markHelpful();

    res.json({
      message: 'Review marked as helpful',
      helpfulVotes: review.helpfulVotes,
      totalVotes: review.totalVotes
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid review ID',
        message: 'The provided review ID is not valid'
      });
    }
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

    const review = await Review.findById(reviewId);
    if (!review || !review.isActive) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Users cannot vote on their own reviews
    if (review.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'You cannot vote on your own review'
      });
    }

    await review.markNotHelpful();

    res.json({
      message: 'Review marked as not helpful',
      helpfulVotes: review.helpfulVotes,
      totalVotes: review.totalVotes
    });
  } catch (error) {
    console.error('Mark not helpful error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid review ID',
        message: 'The provided review ID is not valid'
      });
    }
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

    const review = await Review.findById(reviewId);
    if (!review || !review.isActive) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'The requested review does not exist'
      });
    }

    // Users cannot flag their own reviews
    if (review.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'You cannot flag your own review'
      });
    }

    await review.flag(reason);

    res.json({
      message: 'Review flagged successfully',
      moderationStatus: review.moderationStatus
    });
  } catch (error) {
    console.error('Flag review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid review ID',
        message: 'The provided review ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to flag review'
    });
  }
});

// Get review statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Review.getReviewStats();
    res.json(stats);
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch review statistics'
    });
  }
});

module.exports = router;