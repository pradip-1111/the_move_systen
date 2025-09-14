const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Watchlist, Movie, User } = require('../models/index');
const { authenticate, checkResourceOwnership } = require('../middleware/auth');
const { Op } = require('sequelize');

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

    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = { userId: userId };
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Build order clause
    let orderClause = [];
    switch (sortBy) {
      case 'added':
        orderClause = [['createdAt', 'DESC']];
        break;
      case 'title':
        orderClause = [[{ model: Movie, as: 'movie' }, 'title', 'ASC']];
        break;
      case 'rating':
        orderClause = [[{ model: Movie, as: 'movie' }, 'averageRating', 'DESC']];
        break;
      case 'priority':
        orderClause = [['priority', 'DESC']];
        break;
      case 'date_watched':
        orderClause = [['watchedAt', 'DESC']];
        break;
    }

    const { rows: watchlistItems, count: totalItems } = await Watchlist.findAndCountAll({
      where: whereClause,
      include: [{
        model: Movie,
        as: 'movie',
        attributes: ['id', 'title', 'posterUrl', 'releaseDate', 'genres', 'averageRating', 'runtime'],
        where: { isActive: true },
        required: true
      }],
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Transform the watchlist items to include movie data directly
    const movies = watchlistItems.map(item => ({
      id: item.movieId, // Use movieId from watchlist item
      title: item.movie.title,
      posterUrl: item.movie.posterUrl,
      releaseDate: item.movie.releaseDate,
      genres: item.movie.genres,
      averageRating: item.movie.averageRating,
      runtime: item.movie.runtime,
      director: 'Unknown Director', // Fallback since director column doesn't exist
      description: item.movie.title, // Use title as fallback for description
      year: item.movie.releaseDate ? new Date(item.movie.releaseDate).getFullYear() : null,
      // Include watchlist-specific data
      watchlistStatus: item.status,
      watchlistPriority: item.priority,
      watchlistNotes: item.notes,
      addedAt: item.createdAt,
      personalRating: item.personalRating,
      watchedAt: item.watchedAt
    }));

    res.json({
      movies: movies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        hasNext: offset + watchlistItems.length < totalItems,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch watchlist'
    });
  }
});

// Add movie to watchlist
router.post('/:userId', authenticate, checkResourceOwnership('watchlist'), [
  body('movieId').isInt().withMessage('Valid movie ID is required'),
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
    const movie = await Movie.findByPk(movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Check if movie is already in watchlist
    const existingEntry = await Watchlist.findOne({ 
      where: { userId: userId, movieId: movieId } 
    });
    if (existingEntry) {
      return res.status(400).json({
        error: 'Movie already in watchlist',
        message: 'This movie is already in your watchlist. Use the update endpoint to modify it.'
      });
    }

    // Create watchlist entry
    const watchlistEntry = await Watchlist.create({
      userId: userId,
      movieId: movieId,
      status,
      priority,
      notes
    });

    // Get entry with movie info for response
    const entryWithMovie = await Watchlist.findByPk(watchlistEntry.id, {
      include: [{
        model: Movie,
        as: 'movie',
        attributes: ['id', 'title', 'posterUrl', 'releaseDate', 'genres', 'averageRating', 'runtime']
      }]
    });

    res.status(201).json({
      message: 'Movie added to watchlist successfully',
      watchlistEntry: entryWithMovie
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

    const watchlistEntry = await Watchlist.findOne({ 
      where: { userId: userId, movieId: movieId } 
    });
    if (!watchlistEntry) {
      return res.status(404).json({
        error: 'Watchlist entry not found',
        message: 'This movie is not in your watchlist'
      });
    }

    await watchlistEntry.update(updateData);

    // Get updated entry with movie info
    const updatedEntry = await Watchlist.findByPk(watchlistEntry.id, {
      include: [{
        model: Movie,
        as: 'movie',
        attributes: ['id', 'title', 'posterUrl', 'releaseDate', 'genres', 'averageRating', 'runtime']
      }]
    });

    res.json({
      message: 'Watchlist entry updated successfully',
      watchlistEntry: updatedEntry
    });
  } catch (error) {
    console.error('Update watchlist entry error:', error);
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

    const watchlistEntry = await Watchlist.findOne({ 
      where: { userId: userId, movieId: movieId } 
    });
    if (!watchlistEntry) {
      return res.status(404).json({
        error: 'Watchlist entry not found',
        message: 'This movie is not in your watchlist'
      });
    }

    await watchlistEntry.destroy();

    res.json({
      message: 'Movie removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
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

    const watchlistEntry = await Watchlist.findOne({ 
      where: { userId: userId, movieId: movieId } 
    });
    if (!watchlistEntry) {
      return res.status(404).json({
        error: 'Watchlist entry not found',
        message: 'This movie is not in your watchlist'
      });
    }

    const updateData = {
      status: 'watched',
      watchedAt: new Date()
    };
    if (personalRating) {
      updateData.personalRating = personalRating;
    }

    await watchlistEntry.update(updateData);

    // Get updated entry with movie info
    const updatedEntry = await Watchlist.findByPk(watchlistEntry.id, {
      include: [{
        model: Movie,
        as: 'movie',
        attributes: ['id', 'title', 'posterUrl', 'releaseDate', 'genres', 'averageRating', 'runtime']
      }]
    });

    res.json({
      message: 'Movie marked as watched successfully',
      watchlistEntry: updatedEntry
    });
  } catch (error) {
    console.error('Mark as watched error:', error);
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
    const sequelize = require('../config/database');

    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalMovies,
        COUNT(CASE WHEN status = 'want_to_watch' THEN 1 END) as wantToWatch,
        COUNT(CASE WHEN status = 'watching' THEN 1 END) as watching,
        COUNT(CASE WHEN status = 'watched' THEN 1 END) as watched,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as highPriority,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as mediumPriority,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as lowPriority,
        AVG(CASE WHEN personalRating IS NOT NULL THEN personalRating END) as averagePersonalRating
      FROM Watchlists 
      WHERE userId = :userId
    `, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });

    const stats = results[0];

    res.json({
      totalMovies: parseInt(stats.totalMovies),
      statusDistribution: {
        wantToWatch: parseInt(stats.wantToWatch),
        watching: parseInt(stats.watching),
        watched: parseInt(stats.watched)
      },
      priorityDistribution: {
        high: parseInt(stats.highPriority),
        medium: parseInt(stats.mediumPriority),
        low: parseInt(stats.lowPriority)
      },
      averagePersonalRating: parseFloat(stats.averagePersonalRating) || 0
    });
  } catch (error) {
    console.error('Get watchlist stats error:', error);
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

    const watchlistEntry = await Watchlist.findOne({
      where: { userId: userId, movieId: movieId }
    });

    res.json({
      inWatchlist: !!watchlistEntry,
      entry: watchlistEntry || null
    });
  } catch (error) {
    console.error('Check watchlist error:', error);
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
    const sequelize = require('../config/database');

    const [results] = await sequelize.query(`
      SELECT 
        m.*,
        COUNT(w.id) as watchlistCount
      FROM Movies m
      INNER JOIN Watchlists w ON m.id = w.movieId
      WHERE m.isActive = true
      GROUP BY m.id
      ORDER BY watchlistCount DESC, m.averageRating DESC
      LIMIT :limit
    `, {
      replacements: { limit: parseInt(limit) },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      movies: results
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