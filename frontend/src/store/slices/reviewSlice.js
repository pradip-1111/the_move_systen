import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsAPI } from '../../services/api';

// Async thunks
export const fetchMovieReviews = createAsyncThunk(
  'reviews/fetchMovieReviews',
  async ({ movieId, params }, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.getMovieReviews(movieId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async ({ movieId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.submitReview(movieId, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.updateReview(reviewId, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewsAPI.deleteReview(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  'reviews/markHelpful',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.markHelpful(reviewId);
      return { reviewId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    userReviews: [],
    currentReview: null,
    loading: false,
    submitLoading: false,
    error: null,
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
  },
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.error = null;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    setCurrentReview: (state, action) => {
      state.currentReview = action.payload;
    },
    updateReviewInList: (state, action) => {
      const index = state.reviews.findIndex(review => review._id === action.payload._id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch movie reviews
    builder
      .addCase(fetchMovieReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovieReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews || [];
        state.totalReviews = action.payload.totalReviews || 0;
        state.averageRating = action.payload.averageRating || 0;
        state.ratingDistribution = action.payload.ratingDistribution || {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
      })
      .addCase(fetchMovieReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Submit review
    builder
      .addCase(submitReview.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.reviews.unshift(action.payload);
        state.totalReviews += 1;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload;
      });

    // Update review
    builder
      .addCase(updateReview.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.submitLoading = false;
        const index = state.reviews.findIndex(review => review._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload;
      });

    // Delete review
    builder
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter(review => review._id !== action.payload);
        state.totalReviews = Math.max(0, state.totalReviews - 1);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Mark review helpful
    builder
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId } = action.payload;
        const review = state.reviews.find(r => r._id === reviewId);
        if (review) {
          review.helpfulCount = action.payload.helpfulCount;
          review.isMarkedHelpful = action.payload.isMarkedHelpful;
        }
      });
  }
});

export const {
  clearReviews,
  clearCurrentReview,
  setCurrentReview,
  updateReviewInList
} = reviewSlice.actions;

export default reviewSlice.reducer;