import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { moviesAPI, reviewsAPI } from '../services/api';
import {
  addToWatchlist,
  removeFromWatchlist
} from '../store/slices/watchlistSlice';
import { verifyToken } from '../store/slices/authSlice';
// Review components
// import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { movies: watchlistMovies } = useSelector(state => state.watchlist);
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const isInWatchlist = watchlistMovies && watchlistMovies.some(movie => movie.id === parseInt(id) || movie.id === id);

  useEffect(() => {
    console.log('MovieDetailPage - ID from params:', id);
    console.log('MovieDetailPage - ID type:', typeof id);
    if (id && id !== 'undefined') {
      fetchMovie();
      fetchReviews();
    } else {
      console.error('Movie ID is undefined or invalid:', id);
      setError('Invalid movie ID');
      setLoading(false);
    }
  }, [id]);

  // Debug logging
  useEffect(() => {
    console.log('Watchlist movies:', watchlistMovies);
    console.log('Watchlist movie IDs:', watchlistMovies ? watchlistMovies.map(m => m.id) : []);
    console.log('Is in watchlist:', isInWatchlist);
  }, [watchlistMovies, isInWatchlist]);

  const fetchMovie = async () => {
    try {
      const response = await moviesAPI.getMovie(id);
      setMovie(response.data.movie);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch movie:', error);
      setError('Failed to load movie details');
      toast.error('Failed to load movie details');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getMovieReviews(id);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserId = () => {
    if (user?.id) return user.id;
    if (user?.id) return user.id;
    return null;
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage your watchlist');
      navigate('/login');
      return;
    }

    // Verify token first
    try {
      const result = await dispatch(verifyToken());
      
      if (result.type === 'auth/verifyToken/rejected') {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }
      
      // Double-check user exists after verification
      if (result.type === 'auth/verifyToken/fulfilled' && result.payload?.user) {
        const verifiedUserId = result.payload.user.id || result.payload.user.id;
        if (verifiedUserId) {
          await toggleWatchlist(verifiedUserId);
        } else {
          toast.error('User verification failed');
          return;
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      toast.error('Authentication error. Please try again.');
      return;
    }
  };

  const toggleWatchlist = async (userId) => {
    console.log('Watchlist toggle clicked');
    console.log('Auth state:', { isAuthenticated, user: user?.id });
    console.log('Movie ID:', id);
    console.log('User ID for watchlist:', userId);
    console.log('Is in watchlist:', isInWatchlist);

    if (!userId) {
      toast.error('User authentication error');
      return;
    }

    try {
      if (isInWatchlist) {
        await dispatch(removeFromWatchlist({ userId, movieId: id })).unwrap();
        toast.success('Removed from watchlist');
      } else {
        await dispatch(addToWatchlist({ userId, movieId: id })).unwrap();
        toast.success('Added to watchlist');
      }
    } catch (error) {
      console.error('Watchlist error:', error);
      toast.error(error.message || 'Failed to update watchlist');
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      console.log('📝 Submitting review:', reviewData);
      await reviewsAPI.submitReview(id, reviewData);
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      console.error('❌ Review submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error || 'Movie not found'}
        </h1>
        <button
          onClick={() => navigate('/movies')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img
              src={movie.posterUrl || 'https://via.placeholder.com/400x600/374151/white?text=No+Image'}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x600/374151/white?text=Movie+Poster';
              }}
            />
          </div>
          
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{movie.title}</h1>
            
            <div className="flex items-center mb-4">
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded mr-2">
                ⭐ {movie.averageRating || 'N/A'}
              </span>
              <span className="text-gray-600">
                ({movie.totalRatings || 0} ratings)
              </span>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Director:</strong> {movie.director}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Release Date:</strong> {new Date(movie.releaseDate).getFullYear()}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Runtime:</strong> {movie.runtime || 'N/A'} minutes
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Genres:</strong> {Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-700">{movie.overview}</p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleWatchlistToggle}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isInWatchlist
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Write Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReviewForm && (
        <div className="mt-8">
          <ReviewForm
            onSubmit={handleReviewSubmit}
            onCancel={() => setShowReviewForm(false)}
            loading={false}
          />
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{review.title}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500 mr-2">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                      </span>
                      <span className="text-gray-600 text-sm">
                        by {review.user?.username || 'Anonymous'}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.content}</p>
                {review.spoilers && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    Contains Spoilers
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet. Be the first to write one!</p>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;