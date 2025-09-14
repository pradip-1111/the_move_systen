const { initializeDatabase } = require('../models');
const path = require('path');
const fs = require('fs');

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting SQLite database...');
    
    // Remove the existing database file completely
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('🗑️ Removed existing database file');
    }
    
    // Initialize fresh database with force sync
    await initializeDatabase(true); // Force sync will recreate all tables
    console.log('✅ Fresh database created successfully');
    
    // Now add some sample movies
    const { Movie } = require('../models');
    
    const sampleMovies = [
      {
        title: "The Shawshank Redemption",
        overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        releaseDate: "1994-09-23",
        runtime: 142,
        voteAverage: 9.3,
        voteCount: 2500000,
        popularity: 95.5,
        posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/w1280/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg",
        originalLanguage: "en",
        adult: false,
        genres: "Drama, Crime",
        director: "Frank Darabont",
        cast: "Tim Robbins, Morgan Freeman"
      },
      {
        title: "The Godfather",
        overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        releaseDate: "1972-03-24",
        runtime: 175,
        voteAverage: 9.2,
        voteCount: 1800000,
        popularity: 88.2,
        posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/w1280/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
        originalLanguage: "en",
        adult: false,
        genres: "Drama, Crime",
        director: "Francis Ford Coppola",
        cast: "Marlon Brando, Al Pacino"
      },
      {
        title: "The Dark Knight",
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        releaseDate: "2008-07-18",
        runtime: 152,
        voteAverage: 9.0,
        voteCount: 2200000,
        popularity: 92.8,
        posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/w1280/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
        originalLanguage: "en",
        adult: false,
        genres: "Action, Crime, Drama",
        director: "Christopher Nolan",
        cast: "Christian Bale, Heath Ledger"
      }
    ];
    
    for (const movieData of sampleMovies) {
      try {
        const movie = await Movie.create({
          title: movieData.title,
          overview: movieData.overview,
          releaseDate: new Date(movieData.releaseDate),
          runtime: movieData.runtime,
          voteAverage: movieData.voteAverage,
          voteCount: movieData.voteCount,
          popularity: movieData.popularity,
          posterUrl: movieData.posterUrl,
          backdropUrl: movieData.backdropUrl,
          originalLanguage: movieData.originalLanguage,
          adult: movieData.adult,
          genres: movieData.genres,
          director: movieData.director,
          cast: movieData.cast
        });
        
        console.log(`✅ Added movie: ${movie.title}`);
      } catch (error) {
        console.error(`❌ Failed to add movie ${movieData.title}:`, error.message);
      }
    }
    
    console.log('🎉 Database reset and seeding completed!');
    console.log(`📊 Total movies in database: ${await Movie.count()}`);
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  }
};

// Run the reset
if (require.main === module) {
  resetDatabase().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = resetDatabase;