import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  verifyToken: () => api.get('/auth/verify'),
};

// Movies API
export const moviesAPI = {
  getMovies: (params) => api.get('/movies', { params }),
  getFeatured: () => api.get('/movies/featured'),
  getSuggestions: (params) => api.get('/movies/suggestions', { params }),
  getMovie: (id) => api.get(`/movies/${id}`),
  searchMovies: (query, filters) => api.get('/movies', { params: { search: query, ...filters } }),
  getGenres: () => api.get('/movies/data/genres'),
  // Admin endpoints
  addMovie: (movieData) => api.post('/movies', movieData),
  updateMovie: (id, movieData) => api.put(`/movies/${id}`, movieData),
  deleteMovie: (id) => api.delete(`/movies/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getMovieReviews: (movieId, params) => api.get(`/reviews/movie/${movieId}`, { params }),
  submitReview: (movieId, reviewData) => api.post(`/reviews/movie/${movieId}`, reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
  markNotHelpful: (reviewId) => api.post(`/reviews/${reviewId}/not-helpful`),
  flagReview: (reviewId, reason) => api.post(`/reviews/${reviewId}/flag`, { reason }),
  getReviewStats: () => api.get('/reviews/stats'),
};

// Users API
export const usersAPI = {
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  getUserReviews: (userId, params) => api.get(`/users/${userId}/reviews`, { params }),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
};

// Watchlist API
export const watchlistAPI = {
  getWatchlist: (userId) => api.get(`/watchlist/${userId}`),
  addToWatchlist: (userId, movieId) => api.post(`/watchlist/${userId}`, { movieId }),
  removeFromWatchlist: (userId, movieId) => api.delete(`/watchlist/${userId}/${movieId}`),
  clearWatchlist: (userId) => api.delete(`/watchlist/${userId}`),
};

// Export the api instance for components that need direct access
export { api };

// Default export
const apiExports = {
  authAPI,
  moviesAPI,
  reviewsAPI,
  usersAPI,
  watchlistAPI,
  api
};

export default apiExports;