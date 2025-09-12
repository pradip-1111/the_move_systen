const axios = require('axios');
const Movie = require('../models/Movie');

class TMDBService {
  constructor() {
    this.baseURL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
    this.apiKey = process.env.TMDB_API_KEY;
    this.accessToken = process.env.TMDB_ACCESS_TOKEN;
    this.imageBaseURL = 'https://image.tmdb.org/t/p/w500';
  }

  getHeaders() {
    if (this.accessToken) {
      return {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      };
    }
    return {};
  }

  getParams(additionalParams = {}) {
    const params = { language: 'en-US', ...additionalParams };
    
    // Use API key if no access token available
    if (!this.accessToken && this.apiKey) {
      params.api_key = this.apiKey;
    }
    
    return params;
  }

  async fetchPopularMovies(page = 1) {
    try {
      if (!this.accessToken && (!this.apiKey || this.apiKey === 'your_tmdb_api_key_here')) {
        console.log('TMDB API authentication not configured, using mock data');
        return this.getMockMovies();
      }

      const response = await axios.get(`${this.baseURL}/movie/popular`, {
        headers: this.getHeaders(),
        params: this.getParams({ page })
      });

      return response.data.results.map(movie => this.transformTMDBMovie(movie));
    } catch (error) {
      console.error('Error fetching from TMDB:', error.message);
      return this.getMockMovies();
    }
  }

  async fetchTopRatedMovies(page = 1) {
    try {
      if (!this.accessToken && (!this.apiKey || this.apiKey === 'your_tmdb_api_key_here')) {
        return this.getMockMovies();
      }

      const response = await axios.get(`${this.baseURL}/movie/top_rated`, {
        headers: this.getHeaders(),
        params: this.getParams({ page })
      });

      return response.data.results.map(movie => this.transformTMDBMovie(movie));
    } catch (error) {
      console.error('Error fetching top rated from TMDB:', error.message);
      return this.getMockMovies();
    }
  }

  async searchMovies(query, page = 1) {
    try {
      if (!this.accessToken && (!this.apiKey || this.apiKey === 'your_tmdb_api_key_here')) {
        return this.getMockMovies().filter(movie => 
          movie.title.toLowerCase().includes(query.toLowerCase())
        );
      }

      const response = await axios.get(`${this.baseURL}/search/movie`, {
        headers: this.getHeaders(),
        params: this.getParams({ query, page })
      });

      return response.data.results.map(movie => this.transformTMDBMovie(movie));
    } catch (error) {
      console.error('Error searching TMDB:', error.message);
      return [];
    }
  }

  transformTMDBMovie(tmdbMovie) {
    return {
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      releaseDate: new Date(tmdbMovie.release_date),
      posterUrl: tmdbMovie.poster_path ? `${this.imageBaseURL}${tmdbMovie.poster_path}` : null,
      backdropUrl: tmdbMovie.backdrop_path ? `${this.imageBaseURL}${tmdbMovie.backdrop_path}` : null,
      tmdbId: tmdbMovie.id,
      genres: this.mapTMDBGenres(tmdbMovie.genre_ids || []),
      popularity: tmdbMovie.popularity,
      voteAverage: tmdbMovie.vote_average,
      voteCount: tmdbMovie.vote_count,
      adult: tmdbMovie.adult,
      originalTitle: tmdbMovie.original_title,
      originalLanguage: tmdbMovie.original_language,
      isActive: true
    };
  }

  mapTMDBGenres(genreIds) {
    const genreMap = {
      28: 'Action',
      12: 'Adventure', 
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    };

    return genreIds.map(id => genreMap[id]).filter(Boolean);
  }

  getMockMovies() {
    return [
      {
        title: 'The Shawshank Redemption',
        overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        releaseDate: new Date('1994-09-23'),
        director: 'Frank Darabont',
        genres: ['Drama'],
        runtime: 142,
        cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
        posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w500/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg',
        popularity: 95.5,
        voteAverage: 9.3,
        voteCount: 2000,
        tmdbId: 278,
        isActive: true
      },
      {
        title: 'The Godfather',
        overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        releaseDate: new Date('1972-03-24'),
        director: 'Francis Ford Coppola',
        genres: ['Drama', 'Crime'],
        runtime: 175,
        cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
        posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w500/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg',
        popularity: 98.2,
        voteAverage: 9.2,
        voteCount: 1800,
        tmdbId: 238,
        isActive: true
      },
      {
        title: 'The Dark Knight',
        overview: 'Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        releaseDate: new Date('2008-07-18'),
        director: 'Christopher Nolan',
        genres: ['Action', 'Crime', 'Drama'],
        runtime: 152,
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
        posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w500/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
        popularity: 89.7,
        voteAverage: 9.0,
        voteCount: 2200,
        tmdbId: 155,
        isActive: true
      },
      {
        title: 'Pulp Fiction',
        overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
        releaseDate: new Date('1994-10-14'),
        director: 'Quentin Tarantino',
        genres: ['Crime', 'Drama'],
        runtime: 154,
        cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
        posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w500/4cDFJr4HnXN5AdPw4AKrmLlMWdO.jpg',
        popularity: 87.3,
        voteAverage: 8.9,
        voteCount: 1900,
        tmdbId: 680,
        isActive: true
      },
      {
        title: 'Forrest Gump',
        overview: 'The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75.',
        releaseDate: new Date('1994-07-06'),
        director: 'Robert Zemeckis',
        genres: ['Drama', 'Romance'],
        runtime: 142,
        cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
        posterUrl: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w500/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg',
        popularity: 85.1,
        voteAverage: 8.8,
        voteCount: 2100,
        tmdbId: 13,
        isActive: true
      },
      {
        title: 'Inception',
        overview: 'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.',
        releaseDate: new Date('2010-07-16'),
        director: 'Christopher Nolan',
        genres: ['Action', 'Science Fiction', 'Thriller'],
        runtime: 148,
        cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
        posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w500/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg',
        popularity: 92.4,
        voteAverage: 8.7,
        voteCount: 2300,
        tmdbId: 27205,
        isActive: true
      }
    ];
  }

  async populateDatabase() {
    try {
      const existingCount = await Movie.countDocuments();
      if (existingCount > 0) {
        console.log(`Database already has ${existingCount} movies, skipping population`);
        return;
      }

      console.log('Populating database with movie data...');
      
      // First try to get real data from TMDB
      let movies = await this.fetchPopularMovies(1);
      
      // If TMDB fails, use mock data
      if (!movies || movies.length === 0) {
        movies = this.getMockMovies();
      }

      // Insert movies into database
      for (const movieData of movies) {
        try {
          const existingMovie = await Movie.findOne({ 
            $or: [
              { tmdbId: movieData.tmdbId },
              { title: movieData.title }
            ]
          });

          if (!existingMovie) {
            const movie = new Movie(movieData);
            await movie.save();
            console.log(`Added movie: ${movieData.title}`);
          }
        } catch (error) {
          console.error(`Error adding movie ${movieData.title}:`, error.message);
        }
      }

      const finalCount = await Movie.countDocuments();
      console.log(`Database population complete. Total movies: ${finalCount}`);

    } catch (error) {
      console.error('Error populating database:', error);
    }
  }
}

module.exports = new TMDBService();