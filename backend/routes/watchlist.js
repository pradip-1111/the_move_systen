const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Watchlist = require('../models/Watchlist');
const Movie = require('../models/Movie');
const { authenticate, checkResourceOwnership } = require('../middleware/auth');

const router = express.Router();

// Get user's watchlist
router.get('/:userId', authenticate, checkResourceOwnership('watchlist'), [
  query('status').optional().isIn(['want_to_watch', 'watching', 'watched', 'all']).withMessage('Invalid status filter'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['added', 'title', 'rating', 'priority', 'date_watched']).withMessage('Invalid sort option')
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
      status = 'all',
      page = 1,
      limit = 20,
      sortBy = 'added'
    } = req.query;

    const skip = (page - 1) * limit;

    const watchlistItems = await Watchlist.getUserWatchlist(userId, status, {
      sortBy,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    // Filter out items where movie was not populated (deleted movies)
    const validItems = watchlistItems.filter(item => item.movie);

    // Count total items for pagination
    let countQuery = { user: userId };
    if (status && status !== 'all') {
      countQuery.status = status;
    }
    
    const totalItems = await Watchlist.countDocuments(countQuery);

    res.json({
      watchlist: validItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        hasNext: skip + validItems.length < totalItems,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'The provided user ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch watchlist'
    });
  }
});

// Add movie to watchlist
router.post('/:userId', authenticate, checkResourceOwnership('watchlist'), [
  body('movieId').isMongoId().withMessage('Valid movie ID is required'),
  body('status').optional().isIn(['want_to_watch', 'watching', 'watched']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
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
    const { movieId, status = 'want_to_watch', priority = 'medium', notes = '' } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Check if movie is already in watchlist
    const existingEntry = await Watchlist.findOne({ user: userId, movie: movieId });
    if (existingEntry) {
      return res.status(400).json({
        error: 'Movie already in watchlist',
        message: 'This movie is already in your watchlist. Use the update endpoint to modify it.'
      });
    }

    // Create watchlist entry
    const watchlistEntry = new Watchlist({
      user: userId,
      movie: movieId,
      status,
      priority,
      notes
    });

    await watchlistEntry.save();
    await watchlistEntry.populate('movie', 'title posterUrl releaseDate genres averageRating runtime');

    res.status(201).json({
      message: 'Movie added to watchlist successfully',
      watchlistEntry
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to add movie to watchlist'
    });
  }
});

// Update watchlist entry
router.put('/:userId/:movieId', authenticate, checkResourceOwnership('watchlist'), [
  body('status').optional().isIn(['want_to_watch', 'watching', 'watched']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('personalRating').optional().isInt({ min: 1, max: 5 }).withMessage('Personal rating must be between 1 and 5')
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

    const { userId, movieId } = req.params;
    const updateData = req.body;

    const watchlistEntry = await Watchlist.findOne({ user: userId, movie: movieId });
    if (!watchlistEntry) {
      return res.status(404).json({
        error: 'Watchlist entry not found',
        message: 'This movie is not in your watchlist'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        watchlistEntry[key] = updateData[key];
      }
    });

    await watchlistEntry.save();
    await watchlistEntry.populate('movie', 'title posterUrl releaseDate genres averageRating runtime');

    res.json({
      message: 'Watchlist entry updated successfully',
      watchlistEntry
    });
  } catch (error) {
    console.error('Update watchlist entry error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided user or movie ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to update watchlist entry'
    });
  }
});

// Remove movie from watchlist
router.delete('/:userId/:movieId', authenticate, checkResourceOwnership('watchlist'), async (req, res) => {
  try {
    const { userId, movieId } = req.params;

    const watchlistEntry = await Watchlist.findOne({ user: userId, movie: movieId });
    if (!watchlistEntry) {
      return res.status(404).json({
        error: 'Watchlist entry not found',
        message: 'This movie is not in your watchlist'
      });
    }

    await watchlistEntry.remove();

    res.json({
      message: 'Movie removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided user or movie ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to remove movie from watchlist'
    });
  }
});

// Mark movie as watched
router.patch('/:userId/:movieId/watched', authenticate, checkResourceOwnership('watchlist'), [
  body('personalRating').optional().isInt({ min: 1, max: 5 }).withMessage('Personal rating must be between 1 and 5')
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

    const { userId, movieId } = req.params;
    const { personalRating } = req.body;

    const watchlistEntry = await Watchlist.findOne({ user: userId, movie: movieId });
    if (!watchlistEntry) {
      return res.status(404).json({
        error: 'Watchlist entry not found',
        message: 'This movie is not in your watchlist'
      });
    }

    await watchlistEntry.markAsWatched(personalRating);
    await watchlistEntry.populate('movie', 'title posterUrl releaseDate genres averageRating runtime');

    res.json({
      message: 'Movie marked as watched successfully',
      watchlistEntry
    });
  } catch (error) {
    console.error('Mark as watched error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided user or movie ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to mark movie as watched'
    });
  }
});

// Get watchlist statistics for a user
router.get('/:userId/stats', authenticate, checkResourceOwnership('watchlist'), async (req, res) => {
  try {
    const userId = req.params.userId;

    const stats = await Watchlist.getUserWatchlistStats(userId);

    res.json(stats);
  } catch (error) {
    console.error('Get watchlist stats error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'The provided user ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch watchlist statistics'
    });
  }
});

// Check if movie is in user's watchlist
router.get('/:userId/check/:movieId', authenticate, checkResourceOwnership('watchlist'), async (req, res) => {
  try {
    const { userId, movieId } = req.params;

    const watchlistEntry = await Watchlist.isInWatchlist(userId, movieId);

    res.json({
      inWatchlist: !!watchlistEntry,
      entry: watchlistEntry || null
    });
  } catch (error) {
    console.error('Check watchlist error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'The provided user or movie ID is not valid'
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to check watchlist status'
    });
  }
});

// Get popular movies from watchlists
router.get('/popular', [
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

    const popularMovies = await Watchlist.getPopularWatchlistMovies(parseInt(limit));

    res.json({
      movies: popularMovies
    });
  } catch (error) {
    console.error('Get popular watchlist movies error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch popular watchlist movies'
    });
  }
});

module.exports = router;