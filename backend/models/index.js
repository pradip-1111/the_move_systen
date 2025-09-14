const { sequelize } = require('../config/database');
const User = require('./User');
const Movie = require('./Movie');
const MovieGenre = require('./MovieGenre');
const Genre = require('./Genre');
const Review = require('./Review');
const Watchlist = require('./Watchlist');

// Define associations
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Watchlist, { foreignKey: 'userId', as: 'watchlist' });
Watchlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Movie.hasMany(Review, { foreignKey: 'movieId', as: 'reviews' });
Review.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

Movie.hasMany(Watchlist, { foreignKey: 'movieId', as: 'watchlist' });
Watchlist.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

Movie.hasMany(MovieGenre, { foreignKey: 'movieId', as: 'movieGenres' });
MovieGenre.belongsTo(Movie, { foreignKey: 'movieId', as: 'movie' });

// Many-to-many association between Movies and Genres via junction table
Movie.belongsToMany(Genre, { through: 'movie_genre_associations', as: 'genreList' });
Genre.belongsToMany(Movie, { through: 'movie_genre_associations', as: 'movies' });

User.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Initialize database with one-time seeding
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Create tables (force: false will create tables if they don't exist, but won't alter existing ones)
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synchronized successfully.');
    
    // Check if database already has data
    const movieCount = await Movie.count();
    const userCount = await User.count();
    
    if (movieCount === 0 || userCount === 0) {
      console.log('📊 Database appears empty, seeding with initial data...');
      await seedInitialData();
    } else {
      console.log(`📊 Database already contains ${movieCount} movies and ${userCount} users - skipping seed`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

// Seed initial data function
const seedInitialData = async () => {
  try {
    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@moviehub.com',
      password: '$2b$10$8K1p/a0dClAoQ6YC4PIBVOvb5OAKfHNOgGe8rPOj8wJW6YYKmqm3G', // password123
      isAdmin: true,
      isActive: true,
      reviewCount: 0,
      watchlistCount: 0
    });

    // Create demo user
    const demoUser = await User.create({
      username: 'demo',
      email: 'demo@moviehub.com',
      password: '$2b$10$8K1p/a0dClAoQ6YC4PIBVOvb5OAKfHNOgGe8rPOj8wJW6YYKmqm3G', // password123
      isAdmin: false,
      isActive: true,
      reviewCount: 0,
      watchlistCount: 0
    });

    // Create sample movies
    const movies = [
      {
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        releaseDate: '1994-09-23',
        genres: ['Drama'],
        director: 'Frank Darabont',
        cast: ['Tim Robbins', 'Morgan Freeman'],
        runtime: 142,
        posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg',
        tmdbId: 278,
        averageRating: 9.3,
        totalRatings: 1000,
        isActive: true
      },
      {
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        releaseDate: '1972-03-24',
        genres: ['Crime', 'Drama'],
        director: 'Francis Ford Coppola',
        cast: ['Marlon Brando', 'Al Pacino'],
        runtime: 175,
        posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
        tmdbId: 238,
        averageRating: 9.2,
        totalRatings: 950,
        isActive: true
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
        releaseDate: '2008-07-18',
        genres: ['Action', 'Crime', 'Drama'],
        director: 'Christopher Nolan',
        cast: ['Christian Bale', 'Heath Ledger'],
        runtime: 152,
        posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
        tmdbId: 155,
        averageRating: 9.0,
        totalRatings: 800,
        isActive: true
      },
      {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        releaseDate: '1994-10-14',
        genres: ['Crime', 'Drama'],
        director: 'Quentin Tarantino',
        cast: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman'],
        runtime: 154,
        posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',
        tmdbId: 680,
        averageRating: 8.9,
        totalRatings: 920,
        isActive: true
      },
      {
        title: 'Forrest Gump',
        description: 'The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75.',
        releaseDate: '1994-07-06',
        genres: ['Drama', 'Romance'],
        director: 'Robert Zemeckis',
        cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
        runtime: 142,
        posterUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/7c8nJdqUDbMoIsJTl8PmTfq7i9V.jpg',
        tmdbId: 13,
        averageRating: 8.8,
        totalRatings: 850,
        isActive: true
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
        releaseDate: '2010-07-16',
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        director: 'Christopher Nolan',
        cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
        runtime: 148,
        posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/8qNzAdSBVnKx3qXFCe3KKZP7a4a.jpg',
        tmdbId: 27205,
        averageRating: 8.8,
        totalRatings: 780,
        isActive: true
      },
      {
        title: 'The Matrix',
        description: 'A computer programmer discovers reality as he knew it is a simulation and joins a rebellion to free humanity.',
        releaseDate: '1999-03-31',
        genres: ['Action', 'Sci-Fi'],
        director: 'Lana Wachowski',
        cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
        runtime: 136,
        posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/iu8BFa6Y4G7KFrj3ywPASI2uOmQ.jpg',
        tmdbId: 603,
        averageRating: 8.7,
        totalRatings: 890,
        isActive: true
      },
      {
        title: 'Goodfellas',
        description: 'The story of Henry Hill and his life in the mafia, covering his rise to power and eventual downfall.',
        releaseDate: '1990-09-21',
        genres: ['Crime', 'Drama'],
        director: 'Martin Scorsese',
        cast: ['Robert De Niro', 'Ray Liotta', 'Joe Pesci'],
        runtime: 146,
        posterUrl: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/8QLhA2hhF7Y5ib5nWFhT0hvHgXu.jpg',
        tmdbId: 769,
        averageRating: 8.7,
        totalRatings: 760,
        isActive: true
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space to ensure humanitys survival.',
        releaseDate: '2014-11-07',
        genres: ['Drama', 'Sci-Fi'],
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
        runtime: 169,
        posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
        tmdbId: 157336,
        averageRating: 8.6,
        totalRatings: 720,
        isActive: true
      },
      {
        title: 'Fight Club',
        description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.',
        releaseDate: '1999-10-15',
        genres: ['Drama'],
        director: 'David Fincher',
        cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
        runtime: 139,
        posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
        tmdbId: 550,
        averageRating: 8.8,
        totalRatings: 940,
        isActive: true
      },
      {
        title: 'The Lord of the Rings: The Return of the King',
        description: 'Gandalf and Aragorn lead the World of Men against Saurons army to draw his gaze from Frodo and Sam.',
        releaseDate: '2003-12-17',
        genres: ['Action', 'Adventure', 'Drama'],
        director: 'Peter Jackson',
        cast: ['Elijah Wood', 'Viggo Mortensen', 'Ian McKellen'],
        runtime: 201,
        posterUrl: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg',
        tmdbId: 122,
        averageRating: 9.0,
        totalRatings: 830,
        isActive: true
      },
      {
        title: 'Star Wars: Episode IV - A New Hope',
        description: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, and two droids to save the galaxy.',
        releaseDate: '1977-05-25',
        genres: ['Adventure', 'Fantasy', 'Sci-Fi'],
        director: 'George Lucas',
        cast: ['Mark Hamill', 'Harrison Ford', 'Carrie Fisher'],
        runtime: 121,
        posterUrl: 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/4iJfYYoQzZcONB9hNzg0J0wWyPH.jpg',
        tmdbId: 11,
        averageRating: 8.6,
        totalRatings: 750,
        isActive: true
      },
      {
        title: 'Avengers: Endgame',
        description: 'The Avengers assemble once more to reverse Thanos actions and restore balance to the universe.',
        releaseDate: '2019-04-26',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        director: 'Anthony Russo',
        cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo'],
        runtime: 181,
        posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        tmdbId: 299534,
        averageRating: 8.4,
        totalRatings: 680,
        isActive: true
      },
      {
        title: 'Titanic',
        description: 'A romance blooms between a first-class American woman and a lower-class artist aboard the ill-fated R.M.S. Titanic.',
        releaseDate: '1997-12-19',
        genres: ['Drama', 'Romance'],
        director: 'James Cameron',
        cast: ['Leonardo DiCaprio', 'Kate Winslet', 'Billy Zane'],
        runtime: 194,
        posterUrl: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/yFuKvT4Vm3sKHdFY4eG6I4ldAnn.jpg',
        tmdbId: 597,
        averageRating: 7.9,
        totalRatings: 650,
        isActive: true
      },
      {
        title: 'Jurassic Park',
        description: 'A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting dinosaurs.',
        releaseDate: '1993-06-11',
        genres: ['Adventure', 'Sci-Fi', 'Thriller'],
        director: 'Steven Spielberg',
        cast: ['Sam Neill', 'Laura Dern', 'Jeff Goldblum'],
        runtime: 127,
        posterUrl: 'https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/9bbOZTvNVj7lUw4aFTLc5RYc5lD.jpg',
        tmdbId: 329,
        averageRating: 8.2,
        totalRatings: 590,
        isActive: true
      },
      {
        title: 'The Lion King',
        description: 'Lion prince Simba flees his kingdom only to learn the true meaning of responsibility and bravery.',
        releaseDate: '1994-06-24',
        genres: ['Animation', 'Drama', 'Family'],
        director: 'Roger Allers',
        cast: ['Matthew Broderick', 'Jeremy Irons', 'James Earl Jones'],
        runtime: 88,
        posterUrl: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/dzBtMocZuJbjLOXvrl4zGYigDzh.jpg',
        tmdbId: 8587,
        averageRating: 8.5,
        totalRatings: 700,
        isActive: true
      },
      {
        title: 'Avatar',
        description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between duty and honor.',
        releaseDate: '2009-12-18',
        genres: ['Action', 'Adventure', 'Fantasy'],
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
        runtime: 162,
        posterUrl: 'https://image.tmdb.org/t/p/w500/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/o0s4XsEDfDlvit5pDRKjzXR4pp2.jpg',
        tmdbId: 19995,
        averageRating: 7.8,
        totalRatings: 620,
        isActive: true
      },
      {
        title: 'Spider-Man: Into the Spider-Verse',
        description: 'Teen Miles Morales becomes Spider-Man and must help other Spider-People from different dimensions.',
        releaseDate: '2018-12-14',
        genres: ['Animation', 'Action', 'Adventure'],
        director: 'Bob Persichetti',
        cast: ['Shameik Moore', 'Jake Johnson', 'Hailee Steinfeld'],
        runtime: 117,
        posterUrl: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/7d6EY00g1c39SGZOoCJ5Py9nNth.jpg',
        tmdbId: 324857,
        averageRating: 8.4,
        totalRatings: 540,
        isActive: true
      },
      {
        title: 'Parasite',
        description: 'A poor family schemes to become employed by a wealthy family by infiltrating their household.',
        releaseDate: '2019-05-30',
        genres: ['Comedy', 'Drama', 'Thriller'],
        director: 'Bong Joon-ho',
        cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
        runtime: 132,
        posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkBcQZzr.jpg',
        tmdbId: 496243,
        averageRating: 8.6,
        totalRatings: 470,
        isActive: true
      },
      {
        title: 'Mad Max: Fury Road',
        description: 'In a post-apocalyptic wasteland, Max teams up with Furiosa to flee from a tyrannical warlord.',
        releaseDate: '2015-05-15',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        director: 'George Miller',
        cast: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult'],
        runtime: 120,
        posterUrl: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/tbhdm8UJAb4ViCTsulYFL3lxMCd.jpg',
        tmdbId: 76341,
        averageRating: 8.1,
        totalRatings: 580,
        isActive: true
      }
    ];

    // Insert movies
    for (const movieData of movies) {
      const movie = await Movie.create(movieData);
      console.log(`✅ Added movie: ${movie.title}`);
    }

    // Create sample reviews
    const createdMovies = await Movie.findAll();
    if (createdMovies.length > 0) {
      await Review.create({
        userId: adminUser.id,
        movieId: createdMovies[0].id,
        rating: 5,
        title: 'A Masterpiece of Cinema',
        content: 'This film is absolutely incredible. The story, acting, and direction are all top-notch.',
        spoilers: false
      });

      await Review.create({
        userId: demoUser.id,
        movieId: createdMovies[1].id,
        rating: 5,
        title: 'Classic Crime Drama',
        content: 'One of the greatest films ever made. Brando\'s performance is legendary.',
        spoilers: false
      });
    }

    // Create sample watchlist entries
    if (createdMovies.length > 1) {
      await Watchlist.create({
        userId: demoUser.id,
        movieId: createdMovies[1].id,
        status: 'want_to_watch',
        priority: 'high'
      });

      await Watchlist.create({
        userId: adminUser.id,
        movieId: createdMovies[2].id,
        status: 'watched',
        priority: 'medium',
        personalRating: 5,
        watchedAt: new Date()
      });
    }

    console.log('🎉 Initial data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Movie,
  MovieGenre,
  Genre,
  Review,
  Watchlist,
  initializeDatabase
};