const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Movie, Review, Watchlist } = require('../models/index');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all movies with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('genre').optional().isString().withMessage('Genre must be a string'),
  query('year').optional().isInt({ min: 1900, max: 2030 }).withMessage('Year must be between 1900 and 2030'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Min rating must be between 0 and 5'),
  query('sortBy').optional().isIn(['relevance', 'rating', 'year', 'popularity', 'title']).withMessage('Invalid sort option'),
  query('search').optional().isString().withMessage('Search must be a string')
], optionalAuth, async (req, res) => {
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
      genre,
      year,
      minRating,
      sortBy = 'popularity',
      search
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = { isActive: true };
    let orderClause = [];

    // Build where clause
    if (genre && genre !== 'all') {
      whereClause.genres = { [Op.like]: `%${genre}%` };
    }
    
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      whereClause.releaseDate = { [Op.between]: [startDate, endDate] };
    }
    
    if (minRating) {
      whereClause.averageRating = { [Op.gte]: parseFloat(minRating) };
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { overview: { [Op.like]: `%${search}%` } },
        { director: { [Op.like]: `%${search}%` } }
      ];
    }

    // Build order clause
    switch (sortBy) {
      case 'rating':
        orderClause = [['averageRating', 'DESC'], ['totalRatings', 'DESC']];
        break;
      case 'year':
        orderClause = [['releaseDate', 'DESC']];
        break;
      case 'popularity':
        orderClause = [['popularity', 'DESC']];
        break;
      case 'title':
        orderClause = [['title', 'ASC']];
        break;
      default:
        orderClause = [['createdAt', 'DESC']];
    }

    const { rows: movies, count: total } = await Movie.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    res.json({
      movies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMovies: total,
        hasNext: offset + movies.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch movies'
    });
  }
});

// Get featured/popular movies for homepage
router.get('/featured', async (req, res) => {
  try {
    const [popular, recent, topRated] = await Promise.all([
      Movie.findAll({
        where: { isActive: true },
        order: [['popularity', 'DESC']],
        limit: 8,
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }),
      Movie.findAll({
        where: { isActive: true },
        order: [['releaseDate', 'DESC']],
        limit: 8,
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      }),
      Movie.findAll({
        where: { 
          isActive: true,
          totalRatings: { [Op.gte]: 10 }
        },
        order: [['averageRating', 'DESC'], ['totalRatings', 'DESC']],
        limit: 8,
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      })
    ]);

    res.json({
      popular,
      recent,
      topRated
    });
  } catch (error) {
    console.error('Get featured movies error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch featured movies'
    });
  }
});

// Get single movie by ID with reviews
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const movieId = req.params.id;
    
    const movie = await Movie.findByPk(movieId, {
      include: [{
        model: Review,
        as: 'reviews',
        attributes: ['id', 'rating', 'title', 'content', 'userId', 'createdAt', 'helpfulVotes', 'totalVotes'],
        where: { isActive: true, moderationStatus: 'approved' },
        limit: 5,
        order: [['helpfulVotes', 'DESC'], ['createdAt', 'DESC']],
        required: false
      }]
    });

    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Increment view count
    await movie.increment('viewCount');

    // Check if user has this movie in watchlist (if authenticated)
    let inWatchlist = false;
    let userReview = null;
    
    if (req.user) {
      const watchlistEntry = await Watchlist.findOne({
        where: {
          userId: req.user.id,
          movieId: movieId
        }
      });
      inWatchlist = !!watchlistEntry;

      // Get user's review if exists
      userReview = await Review.findOne({
        where: {
          userId: req.user.id,
          movieId: movieId
        },
        include: [{
          model: require('../models/User'),
          as: 'user',
          attributes: ['username', 'profilePicture']
        }]
      });
    }

    res.json({
      movie,
      inWatchlist,
      userReview
    });
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch movie'
    });
  }
});

// Add new movie (Admin only)
router.post('/', authenticate, requireAdmin, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('overview').trim().notEmpty().withMessage('Overview is required'),
  body('releaseDate').isISO8601().withMessage('Valid release date is required'),
  body('director').trim().notEmpty().withMessage('Director is required'),
  body('genres').isArray({ min: 1 }).withMessage('At least one genre is required'),
  body('runtime').optional().isInt({ min: 1 }).withMessage('Runtime must be a positive integer'),
  body('cast').optional().isArray().withMessage('Cast must be an array'),
  body('tmdbId').optional().isInt().withMessage('TMDB ID must be an integer')
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

    const movieData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Check for duplicate TMDB ID
    if (movieData.tmdbId) {
      const existingMovie = await Movie.findOne({ 
        where: { tmdbId: movieData.tmdbId } 
      });
      if (existingMovie) {
        return res.status(400).json({
          error: 'Movie already exists',
          message: 'A movie with this TMDB ID already exists'
        });
      }
    }

    const movie = await Movie.create(movieData);

    res.status(201).json({
      message: 'Movie added successfully',
      movie
    });
  } catch (error) {
    console.error('Add movie error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to add movie'
    });
  }
});

// Update movie (Admin only)
router.put('/:id', authenticate, requireAdmin, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('overview').optional().trim().notEmpty().withMessage('Overview cannot be empty'),
  body('releaseDate').optional().isISO8601().withMessage('Valid release date is required'),
  body('director').optional().trim().notEmpty().withMessage('Director cannot be empty'),
  body('genres').optional().isArray({ min: 1 }).withMessage('At least one genre is required'),
  body('runtime').optional().isInt({ min: 1 }).withMessage('Runtime must be a positive integer')
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

    const movieId = req.params.id;
    const updateData = req.body;

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    await movie.update(updateData);

    res.json({
      message: 'Movie updated successfully',
      movie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to update movie'
    });
  }
});

// Delete movie (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Soft delete by setting isActive to false
    await movie.update({ isActive: false });

    res.json({
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to delete movie'
    });
  }
});

// Get live TMDB movie suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const tmdbService = require('../services/tmdbService');
    const page = parseInt(req.query.page) || 1;
    const type = req.query.type || 'popular'; // popular, top_rated, search
    const query = req.query.query;

    let movies;
    
    switch (type) {
      case 'top_rated':
        movies = await tmdbService.fetchTopRatedMovies(page);
        break;
      case 'search':
        if (!query) {
          return res.status(400).json({
            error: 'Query required',
            message: 'Search query is required for search type'
          });
        }
        movies = await tmdbService.searchMovies(query, page);
        break;
      case 'popular':
      default:
        movies = await tmdbService.fetchPopularMovies(page);
        break;
    }

    res.json({
      movies,
      pagination: {
        currentPage: page,
        type: type
      }
    });
  } catch (error) {
    console.error('Get movie suggestions error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Unable to fetch movie suggestions'
    });
  }
});

// Get movie genres
router.get('/data/genres', (req, res) => {
  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
  ];

  res.json({ genres });
});

module.exports = router;