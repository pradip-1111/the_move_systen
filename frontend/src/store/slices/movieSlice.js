import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { moviesAPI } from '../../services/api';

// Async thunks
export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (params, { rejectWithValue }) => {
    try {
      const response = await moviesAPI.getMovies(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFeaturedMovies = createAsyncThunk(
  'movies/fetchFeaturedMovies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await moviesAPI.getFeatured();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMovieDetails = createAsyncThunk(
  'movies/fetchMovieDetails',
  async (movieId, { rejectWithValue }) => {
    try {
      const response = await moviesAPI.getMovie(movieId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      const response = await moviesAPI.searchMovies(query, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    movies: [],
    featuredMovies: [],
    currentMovie: null,
    searchResults: [],
    genres: [],
    loading: false,
    searchLoading: false,
    error: null,
    searchError: null,
    totalPages: 1,
    currentPage: 1,
    filters: {
      genre: '',
      year: '',
      rating: '',
      sortBy: 'popularity'
    }
  },
  reducers: {
    clearMovies: (state) => {
      state.movies = [];
      state.searchResults = [];
    },
    clearCurrentMovie: (state) => {
      state.currentMovie = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        genre: '',
        year: '',
        rating: '',
        sortBy: 'popularity'
      };
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch movies
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.movies || [];
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch featured movies
    builder
      .addCase(fetchFeaturedMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredMovies = action.payload;
      })
      .addCase(fetchFeaturedMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch movie details
    builder
      .addCase(fetchMovieDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMovie = action.payload;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search movies
    builder
      .addCase(searchMovies.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.movies || [];
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      });
  }
});

export const {
  clearMovies,
  clearCurrentMovie,
  setFilters,
  clearFilters,
  clearSearchResults
} = movieSlice.actions;

export default movieSlice.reducer;