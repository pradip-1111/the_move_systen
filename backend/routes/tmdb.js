const express = require('express');
const router = express.Router();
const tmdbService = require('../services/tmdbService');
const { authenticate } = require('../middleware/auth');

// POST /api/tmdb/populate - Populate database with TMDB movies
router.post('/populate', authenticate, async (req, res) => {
  try {
    // Check if user is admin (optional - you can remove this if any user should be able to populate)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can populate the movie database'
      });
    }

    const {
      popularPages = 3,
      topRatedPages = 2,
      includeDetails = true
    } = req.body;

    console.log('🎬 Starting TMDB population via API...');
    
    const result = await tmdbService.populateDatabase({
      popularPages,
      topRatedPages,
      includeDetails
    });

    res.status(200).json({
      success: true,
      message: 'Database populated successfully with TMDB data',
      data: result
    });

  } catch (error) {
    console.error('Error in TMDB populate route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to populate database',
      error: error.message
    });
  }
});

// GET /api/tmdb/status - Check TMDB API status
router.get('/status', async (req, res) => {
  try {
    if (!process.env.TMDB_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'TMDB API key not configured'
      });
    }

    // Test API by fetching genres
    const genres = await tmdbService.fetchGenres();
    
    res.status(200).json({
      success: true,
      message: 'TMDB API is accessible',
      data: {
        apiConfigured: true,
        genresAvailable: genres.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'TMDB API not accessible',
      error: error.message
    });
  }
});

// POST /api/tmdb/sync-genres - Sync genres from TMDB
router.post('/sync-genres', authenticate, async (req, res) => {
  try {
    console.log('📂 Syncing genres from TMDB...');
    const genres = await tmdbService.fetchGenres();
    const savedGenres = await tmdbService.saveGenresToDatabase(genres);

    res.status(200).json({
      success: true,
      message: `Successfully synced ${savedGenres.length} genres`,
      data: {
        genreCount: savedGenres.length,
        genres: savedGenres.map(g => ({ id: g.id, name: g.name, tmdbId: g.tmdbId }))
      }
    });

  } catch (error) {
    console.error('Error syncing genres:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync genres',
      error: error.message
    });
  }
});

module.exports = router;