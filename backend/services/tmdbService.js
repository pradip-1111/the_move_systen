const axios = require('axios');
const { Movie, Genre } = require('../models');

class TMDBService {
  constructor() {
    this.baseURL = 'https://api.themoviedb.org/3';
    this.apiKey = process.env.TMDB_API_KEY;
    this.imageBaseURL = 'https://image.tmdb.org/t/p/w500';
    
    if (!this.apiKey) {
      console.warn('⚠️  TMDB_API_KEY not found in environment variables');
    }
  }

  async fetchPopularMovies(page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/movie/popular`, {
        params: {
          api_key: this.apiKey,
          page,
          language: 'en-US'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error.message);
      throw error;
    }
  }

  async fetchTopRatedMovies(page = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/movie/top_rated`, {
        params: {
          api_key: this.apiKey,
          page,
          language: 'en-US'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top rated movies:', error.message);
      throw error;
    }
  }

  async fetchGenres() {
    try {
      const response = await axios.get(`${this.baseURL}/genre/movie/list`, {
        params: {
          api_key: this.apiKey,
          language: 'en-US'
        }
      });
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching genres:', error.message);
      throw error;
    }
  }

  async fetchMovieDetails(tmdbId) {
    try {
      const response = await axios.get(`${this.baseURL}/movie/${tmdbId}`, {
        params: {
          api_key: this.apiKey,
          language: 'en-US'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie details for ID ${tmdbId}:`, error.message);
      throw error;
    }
  }

  transformMovieData(tmdbMovie) {
    return {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      overview: tmdbMovie.overview,
      releaseDate: tmdbMovie.release_date || null,
      runtime: tmdbMovie.runtime || null,
      voteAverage: tmdbMovie.vote_average || 0,
      voteCount: tmdbMovie.vote_count || 0,
      popularity: tmdbMovie.popularity || 0,
      posterPath: tmdbMovie.poster_path ? `${this.imageBaseURL}${tmdbMovie.poster_path}` : null,
      backdropPath: tmdbMovie.backdrop_path ? `${this.imageBaseURL}${tmdbMovie.backdrop_path}` : null,
      originalLanguage: tmdbMovie.original_language || 'en',
      adult: tmdbMovie.adult || false
    };
  }

  async saveMovieToDatabase(movieData, genreIds = []) {
    try {
      // Check if movie already exists by TMDB ID
      const existingMovie = await Movie.findOne({ where: { tmdbId: movieData.tmdbId } });
      if (existingMovie) {
        console.log(`Movie "${movieData.title}" already exists in database`);
        return existingMovie;
      }

      // Create new movie
      const movie = await Movie.create(movieData);
      
      // Associate with genres if provided
      if (genreIds && genreIds.length > 0) {
        const genres = await Genre.findAll({
          where: { tmdbId: genreIds }
        });
        if (genres.length > 0) {
          await movie.setGenreList(genres);
        }
      }

      console.log(`✅ Saved movie: ${movieData.title}`);
      return movie;
    } catch (error) {
      console.error(`Error saving movie "${movieData.title}":`, error.message);
      throw error;
    }
  }

  async saveGenresToDatabase(genres) {
    try {
      const savedGenres = [];
      for (const genre of genres) {
        const [genreRecord, created] = await Genre.findOrCreate({
          where: { tmdbId: genre.id },
          defaults: {
            tmdbId: genre.id,
            name: genre.name
          }
        });
        savedGenres.push(genreRecord);
        if (created) {
          console.log(`✅ Created genre: ${genre.name}`);
        }
      }
      return savedGenres;
    } catch (error) {
      console.error('Error saving genres:', error.message);
      throw error;
    }
  }

  async populateDatabase(options = {}) {
    const {
      popularPages = 3,
      topRatedPages = 2,
      includeDetails = true
    } = options;

    console.log('🎬 Starting TMDB database population...');

    try {
      // First, fetch and save genres
      console.log('📂 Fetching genres...');
      const genres = await this.fetchGenres();
      await this.saveGenresToDatabase(genres);

      const allMovies = new Set(); // Use Set to avoid duplicates
      
      // Fetch popular movies
      console.log(`📈 Fetching popular movies (${popularPages} pages)...`);
      for (let page = 1; page <= popularPages; page++) {
        const popularData = await this.fetchPopularMovies(page);
        popularData.results.forEach(movie => allMovies.add(JSON.stringify(movie)));
        console.log(`Fetched page ${page} of popular movies`);
      }

      // Fetch top rated movies
      console.log(`⭐ Fetching top rated movies (${topRatedPages} pages)...`);
      for (let page = 1; page <= topRatedPages; page++) {
        const topRatedData = await this.fetchTopRatedMovies(page);
        topRatedData.results.forEach(movie => allMovies.add(JSON.stringify(movie)));
        console.log(`Fetched page ${page} of top rated movies`);
      }

      // Convert back to array and parse
      const uniqueMovies = Array.from(allMovies).map(movieStr => JSON.parse(movieStr));
      console.log(`🎯 Found ${uniqueMovies.length} unique movies to process`);

      // Save movies to database
      let savedCount = 0;
      for (const movie of uniqueMovies) {
        try {
          let movieData = this.transformMovieData(movie);
          
          // Fetch detailed information if requested
          if (includeDetails && movie.id) {
            try {
              const detailedMovie = await this.fetchMovieDetails(movie.id);
              movieData = this.transformMovieData(detailedMovie);
            } catch (detailError) {
              console.warn(`Could not fetch details for "${movie.title}", using basic data`);
            }
          }

          await this.saveMovieToDatabase(movieData, movie.genre_ids);
          savedCount++;
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to save movie "${movie.title}":`, error.message);
        }
      }

      console.log(`🎉 Database population complete! Saved ${savedCount} movies and ${genres.length} genres.`);
      return {
        moviesProcessed: uniqueMovies.length,
        moviesSaved: savedCount,
        genresSaved: genres.length
      };

    } catch (error) {
      console.error('Error populating database:', error.message);
      throw error;
    }
  }
}

module.exports = new TMDBService();