const { sequelize, Movie, User, Review, Watchlist } = require('../models');

const reseedMovies = async () => {
  try {
    console.log('🎬 Reseeding MovieHub database with expanded movie collection...');

    // Clear existing data
    await Review.destroy({ where: {}, force: true });
    await Watchlist.destroy({ where: {}, force: true });
    await Movie.destroy({ where: {}, force: true });
    
    console.log('🗑️  Cleared existing movies, reviews, and watchlists');

    // Movies array with all 20 movies
    const movies = [
      {
        title: 'The Shawshank Redemption',
        overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        releaseDate: '1994-09-23',
        genres: ['Drama'],
        director: 'Frank Darabont',
        cast: 'Tim Robbins, Morgan Freeman',
        runtime: 142,
        posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg',
        tmdbId: 278,
        averageRating: 4.7,
        totalRatings: 1000,
        isActive: true
      },
      {
        title: 'The Godfather',
        overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        releaseDate: '1972-03-24',
        genres: ['Crime', 'Drama'],
        director: 'Francis Ford Coppola',
        cast: 'Marlon Brando, Al Pacino',
        runtime: 175,
        posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
        tmdbId: 238,
        averageRating: 4.6,
        totalRatings: 950,
        isActive: true
      },
      {
        title: 'The Dark Knight',
        overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
        releaseDate: '2008-07-18',
        genres: ['Action', 'Crime', 'Drama'],
        director: 'Christopher Nolan',
        cast: 'Christian Bale, Heath Ledger',
        runtime: 152,
        posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
        tmdbId: 155,
        averageRating: 4.5,
        totalRatings: 800,
        isActive: true
      },
      {
        title: 'Pulp Fiction',
        overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        releaseDate: '1994-10-14',
        genres: ['Crime', 'Drama'],
        director: 'Quentin Tarantino',
        cast: 'John Travolta, Samuel L. Jackson, Uma Thurman',
        runtime: 154,
        posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',
        tmdbId: 680,
        averageRating: 4.4,
        totalRatings: 920,
        isActive: true
      },
      {
        title: 'Forrest Gump',
        overview: 'The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75.',
        releaseDate: '1994-07-06',
        genres: ['Drama', 'Romance'],
        director: 'Robert Zemeckis',
        cast: 'Tom Hanks, Robin Wright, Gary Sinise',
        runtime: 142,
        posterUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/7c8nJdqUDbMoIsJTl8PmTfq7i9V.jpg',
        tmdbId: 13,
        averageRating: 4.4,
        totalRatings: 850,
        isActive: true
      },
      {
        title: 'Inception',
        overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
        releaseDate: '2010-07-16',
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        director: 'Christopher Nolan',
        cast: 'Leonardo DiCaprio, Marion Cotillard, Tom Hardy',
        runtime: 148,
        posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/8qNzAdSBVnKx3qXFCe3KKZP7a4a.jpg',
        tmdbId: 27205,
        averageRating: 4.4,
        totalRatings: 780,
        isActive: true
      },
      {
        title: 'The Matrix',
        overview: 'A computer programmer discovers reality as he knew it is a simulation and joins a rebellion to free humanity.',
        releaseDate: '1999-03-31',
        genres: ['Action', 'Sci-Fi'],
        director: 'Lana Wachowski',
        cast: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss',
        runtime: 136,
        posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/iu8BFa6Y4G7KFrj3ywPASI2uOmQ.jpg',
        tmdbId: 603,
        averageRating: 4.4,
        totalRatings: 890,
        isActive: true
      },
      {
        title: 'Goodfellas',
        overview: 'The story of Henry Hill and his life in the mafia, covering his rise to power and eventual downfall.',
        releaseDate: '1990-09-21',
        genres: ['Crime', 'Drama'],
        director: 'Martin Scorsese',
        cast: 'Robert De Niro, Ray Liotta, Joe Pesci',
        runtime: 146,
        posterUrl: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/8QLhA2hhF7Y5ib5nWFhT0hvHgXu.jpg',
        tmdbId: 769,
        averageRating: 4.4,
        totalRatings: 760,
        isActive: true
      },
      {
        title: 'Interstellar',
        overview: 'A team of explorers travel through a wormhole in space to ensure humanitys survival.',
        releaseDate: '2014-11-07',
        genres: ['Drama', 'Sci-Fi'],
        director: 'Christopher Nolan',
        cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
        runtime: 169,
        posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
        tmdbId: 157336,
        averageRating: 4.3,
        totalRatings: 720,
        isActive: true
      },
      {
        title: 'Fight Club',
        overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.',
        releaseDate: '1999-10-15',
        genres: ['Drama'],
        director: 'David Fincher',
        cast: 'Brad Pitt, Edward Norton, Helena Bonham Carter',
        runtime: 139,
        posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
        tmdbId: 550,
        averageRating: 4.4,
        totalRatings: 940,
        isActive: true
      },
      {
        title: 'The Lord of the Rings: The Return of the King',
        overview: 'Gandalf and Aragorn lead the World of Men against Saurons army to draw his gaze from Frodo and Sam.',
        releaseDate: '2003-12-17',
        genres: ['Action', 'Adventure', 'Drama'],
        director: 'Peter Jackson',
        cast: 'Elijah Wood, Viggo Mortensen, Ian McKellen',
        runtime: 201,
        posterUrl: 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg',
        tmdbId: 122,
        averageRating: 4.5,
        totalRatings: 830,
        isActive: true
      },
      {
        title: 'Star Wars: Episode IV - A New Hope',
        overview: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, and two droids to save the galaxy.',
        releaseDate: '1977-05-25',
        genres: ['Adventure', 'Fantasy', 'Sci-Fi'],
        director: 'George Lucas',
        cast: 'Mark Hamill, Harrison Ford, Carrie Fisher',
        runtime: 121,
        posterUrl: 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/4iJfYYoQzZcONB9hNzg0J0wWyPH.jpg',
        tmdbId: 11,
        averageRating: 4.3,
        totalRatings: 750,
        isActive: true
      },
      {
        title: 'Avengers: Endgame',
        overview: 'The Avengers assemble once more to reverse Thanos actions and restore balance to the universe.',
        releaseDate: '2019-04-26',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        director: 'Anthony Russo',
        cast: 'Robert Downey Jr., Chris Evans, Mark Ruffalo',
        runtime: 181,
        posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
        tmdbId: 299534,
        averageRating: 4.2,
        totalRatings: 680,
        isActive: true
      },
      {
        title: 'Titanic',
        overview: 'A romance blooms between a first-class American woman and a lower-class artist aboard the ill-fated R.M.S. Titanic.',
        releaseDate: '1997-12-19',
        genres: ['Drama', 'Romance'],
        director: 'James Cameron',
        cast: 'Leonardo DiCaprio, Kate Winslet, Billy Zane',
        runtime: 194,
        posterUrl: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/yFuKvT4Vm3sKHdFY4eG6I4ldAnn.jpg',
        tmdbId: 597,
        averageRating: 3.9,
        totalRatings: 650,
        isActive: true
      },
      {
        title: 'Jurassic Park',
        overview: 'A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting dinosaurs.',
        releaseDate: '1993-06-11',
        genres: ['Adventure', 'Sci-Fi', 'Thriller'],
        director: 'Steven Spielberg',
        cast: 'Sam Neill, Laura Dern, Jeff Goldblum',
        runtime: 127,
        posterUrl: 'https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/9bbOZTvNVj7lUw4aFTLc5RYc5lD.jpg',
        tmdbId: 329,
        averageRating: 4.1,
        totalRatings: 590,
        isActive: true
      },
      {
        title: 'The Lion King',
        overview: 'Lion prince Simba flees his kingdom only to learn the true meaning of responsibility and bravery.',
        releaseDate: '1994-06-24',
        genres: ['Animation', 'Drama', 'Family'],
        director: 'Roger Allers',
        cast: 'Matthew Broderick, Jeremy Irons, James Earl Jones',
        runtime: 88,
        posterUrl: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/dzBtMocZuJbjLOXvrl4zGYigDzh.jpg',
        tmdbId: 8587,
        averageRating: 4.3,
        totalRatings: 700,
        isActive: true
      },
      {
        title: 'Avatar',
        overview: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between duty and honor.',
        releaseDate: '2009-12-18',
        genres: ['Action', 'Adventure', 'Fantasy'],
        director: 'James Cameron',
        cast: 'Sam Worthington, Zoe Saldana, Sigourney Weaver',
        runtime: 162,
        posterUrl: 'https://image.tmdb.org/t/p/w500/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/o0s4XsEDfDlvit5pDRKjzXR4pp2.jpg',
        tmdbId: 19995,
        averageRating: 3.9,
        totalRatings: 620,
        isActive: true
      },
      {
        title: 'Spider-Man: Into the Spider-Verse',
        overview: 'Teen Miles Morales becomes Spider-Man and must help other Spider-People from different dimensions.',
        releaseDate: '2018-12-14',
        genres: ['Animation', 'Action', 'Adventure'],
        director: 'Bob Persichetti',
        cast: 'Shameik Moore, Jake Johnson, Hailee Steinfeld',
        runtime: 117,
        posterUrl: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/7d6EY00g1c39SGZOoCJ5Py9nNth.jpg',
        tmdbId: 324857,
        averageRating: 4.2,
        totalRatings: 540,
        isActive: true
      },
      {
        title: 'Parasite',
        overview: 'A poor family schemes to become employed by a wealthy family by infiltrating their household.',
        releaseDate: '2019-05-30',
        genres: ['Comedy', 'Drama', 'Thriller'],
        director: 'Bong Joon-ho',
        cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong',
        runtime: 132,
        posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkBcQZzr.jpg',
        tmdbId: 496243,
        averageRating: 4.3,
        totalRatings: 470,
        isActive: true
      },
      {
        title: 'Mad Max: Fury Road',
        overview: 'In a post-apocalyptic wasteland, Max teams up with Furiosa to flee from a tyrannical warlord.',
        releaseDate: '2015-05-15',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        director: 'George Miller',
        cast: 'Tom Hardy, Charlize Theron, Nicholas Hoult',
        runtime: 120,
        posterUrl: 'https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/tbhdm8UJAb4ViCTsulYFL3lxMCd.jpg',
        tmdbId: 76341,
        averageRating: 4.1,
        totalRatings: 580,
        isActive: true
      }
    ];

    // Add all movies
    let addedCount = 0;
    for (const movieData of movies) {
      const movie = await Movie.create(movieData);
      console.log(`✅ Added: ${movie.title}`);
      addedCount++;
    }

    console.log(`\n🎉 Database reseeding completed!`);
    console.log(`📊 Total movies added: ${addedCount}`);
    console.log(`🎬 Your MovieHub now has a full collection!`);

    // Add some sample reviews to make the database feel lived-in
    const sampleUsers = await User.findAll({ limit: 3 });
    if (sampleUsers.length > 0) {
      const allMovies = await Movie.findAll();
      const sampleReviews = [
        {
          rating: 5,
          title: 'An absolute masterpiece!',
          content: 'One of the greatest films ever made. The storytelling, direction, and performances are all exceptional. This movie delivers on every level and will stay with you long after watching.'
        },
        {
          rating: 4,
          title: 'Fantastic movie experience',
          content: 'Incredible performances from the entire cast. The production values are top-notch and the story is compelling throughout. Highly recommended for anyone who appreciates quality cinema.'
        },
        {
          rating: 5,
          title: 'Mind-blowing cinematography',
          content: 'The visual storytelling in this film is absolutely stunning. Every frame is carefully crafted and the attention to detail is remarkable. A true work of cinematic art.'
        },
        {
          rating: 4,
          title: 'A timeless classic',
          content: 'This movie never gets old no matter how many times you watch it. The themes are universal and the execution is flawless. A must-watch for any film enthusiast.'
        },
        {
          rating: 5,
          title: 'Perfect execution',
          content: 'Everything about this film works perfectly - the pacing, the character development, the emotional depth. It sets the standard for excellence in filmmaking.'
        }
      ];

      // Add a few sample reviews
      for (let i = 0; i < Math.min(5, allMovies.length); i++) {
        const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        
        await Review.create({
          userId: randomUser.id,
          movieId: allMovies[i].id,
          rating: randomReview.rating,
          title: randomReview.title,
          content: randomReview.content
        });
      }
      console.log(`💬 Added sample reviews for variety`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error reseeding database:', error);
    process.exit(1);
  }
};

// Run the reseeding
reseedMovies();