import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { watchlistAPI } from '../../services/api';

// Async thunks
export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetchWatchlist',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching watchlist for user ID:', userId);
      const response = await watchlistAPI.getWatchlist(userId);
      console.log('✅ Watchlist fetch response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Watchlist fetch failed:', error);
      console.error('❌ Error response:', error.response?.data);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  'watchlist/addToWatchlist',
  async ({ userId, movieId }, { rejectWithValue }) => {
    try {
      console.log('🔥 WATCHLIST DEBUG - About to call API');
      console.log('📝 userId:', userId, 'type:', typeof userId);
      console.log('📝 movieId:', movieId, 'type:', typeof movieId);
      console.log('📝 API URL will be:', `/watchlist/${userId}`);
      console.log('📝 Request body will be:', { movieId });
      
      const response = await watchlistAPI.addToWatchlist(userId, movieId);
      console.log('✅ API call succeeded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API call failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Full error object:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'watchlist/removeFromWatchlist',
  async ({ userId, movieId }, { rejectWithValue }) => {
    try {
      await watchlistAPI.removeFromWatchlist(userId, movieId);
      return { movieId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearWatchlist = createAsyncThunk(
  'watchlist/clearWatchlist',
  async (userId, { rejectWithValue }) => {
    try {
      await watchlistAPI.clearWatchlist(userId);
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState: {
    movies: [],
    loading: false,
    error: null,
    totalMovies: 0,
  },
  reducers: {
    clearWatchlistState: (state) => {
      state.movies = [];
      state.error = null;
      state.totalMovies = 0;
    },
    toggleMovieInWatchlist: (state, action) => {
      const movieId = action.payload;
      const existingIndex = state.movies.findIndex(movie => movie.id === movieId);
      
      if (existingIndex !== -1) {
        state.movies.splice(existingIndex, 1);
        state.totalMovies -= 1;
      } else {
        // This would normally add the movie, but we need movie data
        // This reducer is mainly for optimistic updates
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch watchlist
    builder
      .addCase(fetchWatchlist.pending, (state) => {
        console.log('🔄 Watchlist fetch PENDING - setting loading to true');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        console.log('✅ Watchlist fetch FULFILLED');
        console.log('📦 Raw payload:', action.payload);
        console.log('🎬 Movies from payload:', action.payload?.movies);
        console.log('📊 Movies length:', action.payload?.movies?.length);
        
        state.loading = false;
        state.movies = action.payload.movies || [];
        state.totalMovies = action.payload.movies?.length || 0;
        
        console.log('🏪 Updated state - movies count:', state.totalMovies);
        console.log('🏪 Updated state - movies array:', state.movies);
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        console.log('❌ Watchlist fetch REJECTED');
        console.log('❌ Error payload:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });

    // Add to watchlist
    builder
      .addCase(addToWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        console.log('✅ Movie added to watchlist successfully');
        console.log('📦 Add response payload:', action.payload);
        state.loading = false;
        
        // The backend returns { message, watchlistEntry } format
        const watchlistEntry = action.payload.watchlistEntry;
        if (watchlistEntry && watchlistEntry.movie) {
          // Transform the watchlist entry to movie format for consistency
          const movieData = {
            id: watchlistEntry.movie.id,
            title: watchlistEntry.movie.title,
            posterUrl: watchlistEntry.movie.posterUrl,
            releaseDate: watchlistEntry.movie.releaseDate,
            genres: watchlistEntry.movie.genres,
            averageRating: watchlistEntry.movie.averageRating,
            runtime: watchlistEntry.movie.runtime,
            // Include watchlist-specific data
            watchlistStatus: watchlistEntry.status,
            watchlistPriority: watchlistEntry.priority,
            watchlistNotes: watchlistEntry.notes,
            addedAt: watchlistEntry.createdAt,
            personalRating: watchlistEntry.personalRating,
            watchedAt: watchlistEntry.watchedAt
          };
          
          // Only add if not already present
          if (!state.movies.find(movie => movie.id === movieData.id)) {
            state.movies.unshift(movieData);
            state.totalMovies += 1;
          }
        }
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove from watchlist
    builder
      .addCase(removeFromWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        const { movieId } = action.payload;
        state.movies = state.movies.filter(movie => movie.id !== movieId);
        state.totalMovies = Math.max(0, state.totalMovies - 1);
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear watchlist
    builder
      .addCase(clearWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWatchlist.fulfilled, (state) => {
        state.loading = false;
        state.movies = [];
        state.totalMovies = 0;
      })
      .addCase(clearWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearWatchlistState,
  toggleMovieInWatchlist
} = watchlistSlice.actions;

export default watchlistSlice.reducer;