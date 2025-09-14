const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const { initializeDatabase } = require('../models');
const tmdbService = require('../services/tmdbService');

const populateDatabase = async () => {
  console.log('🎬 TMDB Database Population Script');
  console.log('=====================================');
  
  try {
    // Check if TMDB API key is configured
    if (!process.env.TMDB_API_KEY) {
      console.error('❌ TMDB_API_KEY not found in environment variables');
      console.log('📝 Please add your TMDB API key to backend/.env file:');
      console.log('   TMDB_API_KEY=your_api_key_here');
      console.log('🔗 Get your free API key from: https://www.themoviedb.org/settings/api');
      process.exit(1);
    }

    // Initialize database
    console.log('🔄 Initializing SQLite database...');
    const dbSuccess = await initializeDatabase();
    if (!dbSuccess) {
      console.error('❌ Failed to initialize database');
      process.exit(1);
    }

    // Test TMDB API connection
    console.log('🔄 Testing TMDB API connection...');
    try {
      const genres = await tmdbService.fetchGenres();
      console.log(`✅ TMDB API connected successfully. Found ${genres.length} genres.`);
    } catch (error) {
      console.error('❌ Failed to connect to TMDB API:', error.message);
      console.log('🔑 Please verify your TMDB_API_KEY in the .env file');
      process.exit(1);
    }

    // Populate database with movies
    console.log('🎯 Starting movie population...');
    const result = await tmdbService.populateDatabase({
      popularPages: 3,    // Fetch 3 pages of popular movies (~60 movies)
      topRatedPages: 2,   // Fetch 2 pages of top rated movies (~40 movies)
      includeDetails: true // Fetch detailed information for each movie
    });

    console.log('\n🎉 Database population completed successfully!');
    console.log(`📊 Results:`);
    console.log(`   • Movies processed: ${result.moviesProcessed}`);
    console.log(`   • Movies saved: ${result.moviesSaved}`);
    console.log(`   • Genres saved: ${result.genresSaved}`);
    
    console.log('\n🚀 Your MovieHub2 application is now ready with movie data!');
    console.log('💡 You can now start your server with: npm start');
    
  } catch (error) {
    console.error('❌ Error populating database:', error.message);
    console.error('🔍 Full error:', error);
    process.exit(1);
  }
};

// Run the population script
if (require.main === module) {
  populateDatabase();
}

module.exports = populateDatabase;