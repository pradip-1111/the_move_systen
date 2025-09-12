const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const fixEmptyPosters = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const apiKey = process.env.TMDB_API_KEY;
    const accessToken = process.env.TMDB_ACCESS_TOKEN;
    
    if (!apiKey && !accessToken) {
      console.log('⚠️ No TMDB API credentials found, using mock poster URLs');
    }

    // Find movies with empty poster URLs
    const movies = await mongoose.connection.db.collection('movies').find({
      $or: [
        { posterUrl: "" },
        { posterUrl: { $exists: false } },
        { posterUrl: null }
      ]
    }).toArray();

    console.log(`Found ${movies.length} movies needing poster URLs`);

    for (const movie of movies) {
      let posterUrl = '';
      let backdropUrl = '';

      // Try to fetch from TMDB if we have API credentials and tmdbId
      if (movie.tmdbId && (apiKey || accessToken)) {
        try {
          const headers = accessToken ? {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          } : {};
          
          const params = accessToken ? {} : { api_key: apiKey };
          
          const response = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.tmdbId}`,
            { headers, params }
          );

          if (response.data.poster_path) {
            posterUrl = `https://image.tmdb.org/t/p/w500${response.data.poster_path}`;
          }
          if (response.data.backdrop_path) {
            backdropUrl = `https://image.tmdb.org/t/p/w1280${response.data.backdrop_path}`;
          }
        } catch (error) {
          console.log(`Failed to fetch TMDB data for ${movie.title}: ${error.message}`);
        }
      }

      // Fallback to predefined URLs for popular movies
      if (!posterUrl) {
        const fallbackPosters = {
          'The Shawshank Redemption': 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
          'The Godfather': 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
          'The Dark Knight': 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
          'Pulp Fiction': 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
          'Forrest Gump': 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
          'Inception': 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
        };

        posterUrl = fallbackPosters[movie.title] || 'https://via.placeholder.com/500x750/cccccc/666666?text=No+Image';
      }

      if (!backdropUrl) {
        backdropUrl = 'https://via.placeholder.com/1280x720/cccccc/666666?text=No+Backdrop';
      }

      // Update the movie
      await mongoose.connection.db.collection('movies').updateOne(
        { _id: movie._id },
        { 
          $set: { 
            posterUrl: posterUrl,
            backdropUrl: backdropUrl
          }
        }
      );

      console.log(`✅ Updated poster for: ${movie.title}`);
    }

    console.log('✅ Poster URL fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
};

fixEmptyPosters();