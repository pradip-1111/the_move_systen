const { initializeDatabase, Movie, Genre } = require('../models');
require('dotenv').config();

// Sample movies with placeholder images that will work locally
const sampleMovies = [
  {
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    releaseDate: "1994-09-23",
    runtime: 142,
    voteAverage: 9.3,
    voteCount: 2500000,
    popularity: 95.5,
    posterPath: "https://via.placeholder.com/500x750/4a5568/white?text=The+Shawshank+Redemption",
    backdropPath: "https://via.placeholder.com/1280x720/2d3748/white?text=The+Shawshank+Redemption",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "The Godfather",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    releaseDate: "1972-03-24",
    runtime: 175,
    voteAverage: 9.2,
    voteCount: 1800000,
    popularity: 88.2,
    posterPath: "https://via.placeholder.com/500x750/8b5cf6/white?text=The+Godfather",
    backdropPath: "https://via.placeholder.com/1280x720/7c3aed/white?text=The+Godfather",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    releaseDate: "2008-07-18",
    runtime: 152,
    voteAverage: 9.0,
    voteCount: 2200000,
    popularity: 92.8,
    posterPath: "https://via.placeholder.com/500x750/1f2937/white?text=The+Dark+Knight",
    backdropPath: "https://via.placeholder.com/1280x720/111827/white?text=The+Dark+Knight",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Pulp Fiction",
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    releaseDate: "1994-10-14",
    runtime: 154,
    voteAverage: 8.9,
    voteCount: 1900000,
    popularity: 89.1,
    posterPath: "https://via.placeholder.com/500x750/dc2626/white?text=Pulp+Fiction",
    backdropPath: "https://via.placeholder.com/1280x720/b91c1c/white?text=Pulp+Fiction",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Forrest Gump",
    overview: "The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other history unfold through the perspective of an Alabama man with an IQ of 75.",
    releaseDate: "1994-07-06",
    runtime: 142,
    voteAverage: 8.8,
    voteCount: 2100000,
    popularity: 85.3,
    posterPath: "https://via.placeholder.com/500x750/059669/white?text=Forrest+Gump",
    backdropPath: "https://via.placeholder.com/1280x720/047857/white?text=Forrest+Gump",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into a CEO's mind.",
    releaseDate: "2010-07-16",
    runtime: 148,
    voteAverage: 8.7,
    voteCount: 2000000,
    popularity: 91.2,
    posterPath: "https://via.placeholder.com/500x750/0891b2/white?text=Inception",
    backdropPath: "https://via.placeholder.com/1280x720/0e7490/white?text=Inception",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "The Matrix",
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    releaseDate: "1999-03-31",
    runtime: 136,
    voteAverage: 8.7,
    voteCount: 1800000,
    popularity: 88.9,
    posterPath: "https://via.placeholder.com/500x750/7c2d12/white?text=The+Matrix",
    backdropPath: "https://via.placeholder.com/1280x720/9a3412/white?text=The+Matrix",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Goodfellas",
    overview: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.",
    releaseDate: "1990-09-21",
    runtime: 146,
    voteAverage: 8.7,
    voteCount: 1100000,
    popularity: 82.5,
    posterPath: "https://via.placeholder.com/500x750/7e22ce/white?text=Goodfellas",
    backdropPath: "https://via.placeholder.com/1280x720/6b21a8/white?text=Goodfellas",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "The Lord of the Rings: The Return of the King",
    overview: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom.",
    releaseDate: "2003-12-17",
    runtime: 201,
    voteAverage: 8.9,
    voteCount: 1700000,
    popularity: 90.8,
    posterPath: "https://via.placeholder.com/500x750/ea580c/white?text=LOTR+Return+King",
    backdropPath: "https://via.placeholder.com/1280x720/c2410c/white?text=LOTR+Return+King",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Titanic",
    overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    releaseDate: "1997-12-19",
    runtime: 194,
    voteAverage: 7.9,
    voteCount: 2300000,
    popularity: 87.4,
    posterPath: "https://via.placeholder.com/500x750/0369a1/white?text=Titanic",
    backdropPath: "https://via.placeholder.com/1280x720/0284c7/white?text=Titanic",
    originalLanguage: "en",
    adult: false
  }
];

const seedMovies = async () => {
  try {
    console.log('🎬 Starting local movie seeder...');
    
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Clear existing movies
    await Movie.destroy({ where: {} });
    console.log('🗑️  Cleared existing movies');

    // Add sample movies
    for (const movieData of sampleMovies) {
      try {
        const existingMovie = await Movie.findOne({ where: { title: movieData.title } });
        
        if (!existingMovie) {
          const movie = await Movie.create({
            title: movieData.title,
            overview: movieData.overview,
            releaseDate: new Date(movieData.releaseDate),
            runtime: movieData.runtime,
            voteAverage: movieData.voteAverage,
            voteCount: movieData.voteCount,
            popularity: movieData.popularity,
            posterUrl: movieData.posterPath,
            backdropUrl: movieData.backdropPath,
            originalLanguage: movieData.originalLanguage,
            adult: movieData.adult,
            genres: 'Drama, Crime, Thriller', // Default genres
            director: 'Various Directors',
            cast: 'Various Actors'
          });
          
          console.log(`✅ Added movie: ${movie.title}`);
        } else {
          console.log(`⚠️  Movie already exists: ${movieData.title}`);
        }
      } catch (error) {
        console.error(`❌ Failed to add movie ${movieData.title}:`, error.message);
      }
    }

    console.log('🎉 Movie seeding completed!');
    console.log(`📊 Total movies in database: ${await Movie.count()}`);
    
  } catch (error) {
    console.error('❌ Error seeding movies:', error);
  }
};

// Run the seeder
if (require.main === module) {
  seedMovies().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = seedMovies;