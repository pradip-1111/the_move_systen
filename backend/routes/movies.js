const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

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

    const skip = (page - 1) * limit;

    let movies;
    let total;

    if (search) {
      movies = await Movie.searchMovies(search, {
        genre,
        year: parseInt(year),
        minRating: parseFloat(minRating),
        sortBy,
        limit: parseInt(limit),
        skip: parseInt(skip)
      });
      
      // Count total for search
      const countQuery = { isActive: true };
      if (search) countQuery.$text = { $search: search };
      if (genre && genre !== 'all') countQuery.genres = genre;
      if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        countQuery.releaseDate = { $gte: startDate, $lte: endDate };
      }
      if (minRating) countQuery.averageRating = { $gte: minRating };
      
      total = await Movie.countDocuments(countQuery);
    } else {
      let query = { isActive: true };
      
      if (genre && genre !== 'all') {
        query.genres = genre;
      }
      
      if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        query.releaseDate = { $gte: startDate, $lte: endDate };
      }
      
      if (minRating) {
        query.averageRating = { $gte: minRating };
      }

      let sortOptions = {};
      switch (sortBy) {
        case 'rating':
          sortOptions = { averageRating: -1, totalRatings: -1 };
          break;
        case 'year':
          sortOptions = { releaseDate: -1 };
          break;
        case 'popularity':
          sortOptions = { popularity: -1 };
          break;
        case 'title':
          sortOptions = { title: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      movies = await Movie.find(query)
        .sort(sortOptions)
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .select('-__v');

      total = await Movie.countDocuments(query);
    }

    res.json({
      movies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMovies: total,
        hasNext: skip + movies.length < total,
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
      Movie.findPopular(8),
      Movie.findRecent(8),
      Movie.find({ isActive: true, totalRatings: { $gte: 10 } })
        .sort({ averageRating: -1, totalRatings: -1 })
        .limit(8)
        .select('-__v')
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
    
    const movie = await Movie.findById(movieId)
      .populate('reviews', 'rating title content user createdAt helpfulVotes totalVotes', null, {
        limit: 5,
        sort: { helpfulVotes: -1, createdAt: -1 }
      });

    if (!movie || !movie.isActive) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Increment view count
    await movie.incrementViewCount();

    // Check if user has this movie in watchlist (if authenticated)
    let inWatchlist = false;
    let userReview = null;
    
    if (req.user) {
      const Watchlist = require('../models/Watchlist');
      const watchlistEntry = await Watchlist.findOne({
        user: req.user._id,
        movie: movieId
      });
      inWatchlist = !!watchlistEntry;

      // Get user's review if exists
      userReview = await Review.findOne({
        user: req.user._id,
        movie: movieId
      }).populate('user', 'username profilePicture');
    }

    res.json({
      movie,
      inWatchlist,
      userReview
    });
  } catch (error) {
    console.error('Get movie error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid movie ID',
        message: 'The provided movie ID is not valid'
      });
    }
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
      createdBy: req.user._id
    };

    // Check for duplicate TMDB ID
    if (movieData.tmdbId) {
      const existingMovie = await Movie.findOne({ tmdbId: movieData.tmdbId });
      if (existingMovie) {
        return res.status(400).json({
          error: 'Movie already exists',
          message: 'A movie with this TMDB ID already exists'
        });
      }
    }

    const movie = new Movie(movieData);
    await movie.save();

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

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        movie[key] = updateData[key];
      }
    });

    await movie.save();

    res.json({
      message: 'Movie updated successfully',
      movie
    });
  } catch (error) {
    console.error('Update movie error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid movie ID',
        message: 'The provided movie ID is not valid'
      });
    }
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

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        error: 'Movie not found',
        message: 'The requested movie does not exist'
      });
    }

    // Soft delete by setting isActive to false
    movie.isActive = false;
    await movie.save();

    res.json({
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid movie ID',
        message: 'The provided movie ID is not valid'
      });
    }
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