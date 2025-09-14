const { initializeDatabase, Movie, Genre } = require('../models');
require('dotenv').config();

// Sample movies to seed the database with
const sampleMovies = [
  {
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    releaseDate: "1994-09-23",
    runtime: 142,
    voteAverage: 9.3,
    voteCount: 2500000,
    popularity: 95.5,
    posterPath: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg",
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
    posterPath: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    releaseDate: "2008-07-18",
    runtime: 152,
    voteAverage: 9.0,
    voteCount: 2200000,
    popularity: 92.8,
    posterPath: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Pulp Fiction",
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
    releaseDate: "1994-10-14",
    runtime: 154,
    voteAverage: 8.9,
    voteCount: 2000000,
    popularity: 85.3,
    posterPath: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Forrest Gump",
    overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.",
    releaseDate: "1994-07-06",
    runtime: 142,
    voteAverage: 8.8,
    voteCount: 2100000,
    popularity: 89.7,
    posterPath: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/7c9UVPPiTPltouxRVY6N9qk2Iec.jpg",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.",
    releaseDate: "2010-07-16",
    runtime: 148,
    voteAverage: 8.8,
    voteCount: 2300000,
    popularity: 91.4,
    posterPath: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "The Matrix",
    overview: "Set in the 22nd century, The Matrix tells the story of a computer programmer who is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.",
    releaseDate: "1999-03-31",
    runtime: 136,
    voteAverage: 8.7,
    voteCount: 1900000,
    popularity: 87.1,
    posterPath: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Goodfellas",
    overview: "The true story of Henry Hill, a half-Irish, half-Sicilian Brooklyn kid who is adopted by neighbourhood gangsters at an early age and climbs the ranks of a Mafia family under the guidance of Jimmy Conway.",
    releaseDate: "1990-09-21",
    runtime: 146,
    voteAverage: 8.7,
    voteCount: 1200000,
    popularity: 78.9,
    posterPath: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/6wicjPTw6hHejlQwakT32F6mqS7.jpg",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    releaseDate: "2014-11-07",
    runtime: 169,
    voteAverage: 8.6,
    voteCount: 1700000,
    popularity: 84.2,
    posterPath: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    originalLanguage: "en",
    adult: false
  },
  {
    title: "The Lion King",
    overview: "A young lion prince flees his kingdom only to learn the true meaning of responsibility and bravery.",
    releaseDate: "1994-06-24",
    runtime: 88,
    voteAverage: 8.5,
    voteCount: 1600000,
    popularity: 82.6,
    posterPath: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w500/hKHZhUbIyUAjcSrqJThFGKVKqpR.jpg",
    originalLanguage: "en",
    adult: false
  }
];

const seedDatabase = async () => {
  console.log('🎬 Simple Movie Database Seeder');
  console.log('===============================');
  
  try {
    // Initialize database
    console.log('🔄 Initializing SQLite database...');
    const dbSuccess = await initializeDatabase();
    if (!dbSuccess) {
      console.error('❌ Failed to initialize database');
      process.exit(1);
    }

    console.log('📽️  Adding sample movies to database...');
    let savedCount = 0;
    
    for (const movieData of sampleMovies) {
      try {
        // Check if movie already exists
        const existingMovie = await Movie.findOne({ where: { title: movieData.title } });
        if (existingMovie) {
          console.log(`⏭️  Movie "${movieData.title}" already exists, skipping...`);
          continue;
        }

        // Create new movie
        const movie = await Movie.create(movieData);
        console.log(`✅ Added movie: ${movieData.title}`);
        savedCount++;
        
      } catch (error) {
        console.error(`❌ Failed to save movie "${movieData.title}":`, error.message);
      }
    }

    console.log('\n🎉 Database seeding completed!');
    console.log(`📊 Results:`);
    console.log(`   • Movies processed: ${sampleMovies.length}`);
    console.log(`   • Movies added: ${savedCount}`);
    
    console.log('\n🚀 Your MovieHub2 application now has movies!');
    console.log('💡 Start your servers:');
    console.log('   Backend: npm start (in backend directory)');
    console.log('   Frontend: npm start (in frontend directory)');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('🔍 Full error:', error);
    process.exit(1);
  }
};

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;