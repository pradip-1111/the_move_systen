import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovieDetails } from '../store/slices/movieSlice';
import { fetchMovieReviews, submitReview } from '../store/slices/reviewSlice';
import { addToWatchlist, removeFromWatchlist, fetchWatchlist } from '../store/slices/watchlistSlice';
import { verifyToken } from '../store/slices/authSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentMovie, loading: movieLoading, error: movieError } = useSelector(state => state.movies);
  const { reviews, loading: reviewsLoading } = useSelector(state => state.reviews);
  const authState = useSelector(state => state.auth);
  const { isAuthenticated, user } = authState;
  const { movies: watchlistMovies, loading: watchlistLoading } = useSelector(state => state.watchlist);
  const isPersistRehydrated = useSelector(state => state._persist?.rehydrated);
  
  const [userReview, setUserReview] = useState({ rating: 5, title: '', content: '', spoilers: false });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const isInWatchlist = watchlistMovies.some(movie => movie._id === id || movie.id === id);
  
  // Debug watchlist calculation
  useEffect(() => {
    console.log('🎬 Watchlist calculation debug:');
    console.log('Current movie ID:', id);
    console.log('Watchlist movies:', watchlistMovies);
    console.log('Watchlist movie IDs:', watchlistMovies.map(m => m._id || m.id));
    console.log('Is in watchlist:', isInWatchlist);
  }, [id, watchlistMovies, isInWatchlist]);

  useEffect(() => {
    if (id) {
      dispatch(fetchMovieDetails(id));
      dispatch(fetchMovieReviews({ movieId: id }));
    }
  }, [dispatch, id]);

  // Separate effect for watchlist to ensure proper auth state handling
  useEffect(() => {
    // Only proceed if Redux Persist has rehydrated
    if (!isPersistRehydrated) {
      console.log('⏳ Waiting for Redux Persist rehydration...');
      return;
    }

    // Try multiple ways to get user ID for better compatibility
    const getUserId = () => {
      if (user?._id) return user._id;
      if (user?.id) return user.id;
      
      // Fallback: check localStorage for token and decode if needed
      const token = localStorage.getItem('token');
      if (token && isAuthenticated) {
        // For now, use a more reliable approach by calling verifyToken if needed
        return null; // Will trigger a token verification
      }
      
      return null;
    };

    const userId = getUserId();
    
    console.log('🔄 Watchlist sync check (after rehydration):');
    console.log('Redux Persist rehydrated:', isPersistRehydrated);
    console.log('Is authenticated:', isAuthenticated);
    console.log('User object:', user);
    console.log('Resolved user ID:', userId);
    console.log('Watchlist loading:', watchlistLoading);
    
    if (isAuthenticated && userId) {
      console.log('✅ Fetching watchlist for user:', userId);
      dispatch(fetchWatchlist(userId));
    } else if (isAuthenticated && !userId) {
      console.log('🔄 User authenticated but no ID, dispatching token verification...');
      dispatch(verifyToken()).then((result) => {
        if (result.type === 'auth/verifyToken/fulfilled' && result.payload?.user) {
          const verifiedUserId = result.payload.user._id || result.payload.user.id;
          if (verifiedUserId) {
            console.log('✅ Token verified, fetching watchlist for user:', verifiedUserId);
            dispatch(fetchWatchlist(verifiedUserId));
          }
        }
      });
    }
  }, [dispatch, isAuthenticated, user, isPersistRehydrated, watchlistLoading]);

  // Debug logging
  useEffect(() => {
    console.log('Complete auth state object:', authState);
    console.log('Auth breakdown:', { isAuthenticated, user });
    console.log('User object type:', typeof user);
    console.log('User keys:', user ? Object.keys(user) : 'User is falsy');
    console.log('User details:', user);
    console.log('Movie data:', currentMovie);
    console.log('Poster URL (direct):', currentMovie?.posterUrl);
    console.log('Poster URL (nested):', currentMovie?.movie?.posterUrl);
  }, [authState, isAuthenticated, user, currentMovie]);

  const handleWatchlistToggle = () => {
    console.log('Watchlist toggle clicked');
    console.log('Auth state:', { isAuthenticated, user: user?._id });
    console.log('Movie ID:', id);
    console.log('Is in watchlist:', isInWatchlist);
    console.log('Watchlist movies:', watchlistMovies);
    
    // For testing, let's try using a dummy user ID if auth state is inconsistent
    if (!isAuthenticated || !user) {
      console.log('Authentication issue - not authenticated or no user data');
      navigate('/login');
      return;
    }

    const userId = user._id || user.id;
    if (!userId) {
      console.log('No user ID found in user object:', user);
      navigate('/login');
      return;
    }

    console.log('Using user ID:', userId);

    if (isInWatchlist) {
      console.log('Removing from watchlist...');
      console.log('Remove payload:', { userId, movieId: id });
      dispatch(removeFromWatchlist({ userId, movieId: id })).then((result) => {
        console.log('Remove result:', result);
        if (result.type === 'watchlist/removeFromWatchlist/fulfilled') {
          console.log('✅ Successfully removed from watchlist');
        }
      });
    } else {
      console.log('Adding to watchlist...');
      console.log('Add payload:', { userId, movieId: id });
      console.log('User ID type:', typeof userId);
      console.log('Movie ID type:', typeof id);
      dispatch(addToWatchlist({ userId, movieId: id })).then((result) => {
        console.log('Add result:', result);
        if (result.type === 'watchlist/addToWatchlist/fulfilled') {
          console.log('✅ Successfully added to watchlist');
          // Refresh watchlist to update button state
          dispatch(fetchWatchlist(userId));
        } else if (result.type === 'watchlist/addToWatchlist/rejected') {
          console.log('❌ Failed to add to watchlist:', result.payload);
          
          // Handle "already in watchlist" case gracefully
          if (result.payload?.error === 'Movie already in watchlist') {
            console.log('🔄 Movie already in watchlist, refreshing watchlist data...');
            // Just refresh the watchlist to sync the frontend state
            dispatch(fetchWatchlist(userId));
          }
        }
      });
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    dispatch(submitReview({
      movieId: id,
      reviewData: userReview
    })).then((result) => {
      if (result.type === 'reviews/submitReview/fulfilled') {
        // Reset form and close it
        setUserReview({ rating: 5, title: '', content: '', spoilers: false });
        setShowReviewForm(false);
        
        // Refresh both reviews and movie details to update statistics
        dispatch(fetchMovieReviews({ movieId: id }));
        dispatch(fetchMovieDetails(id));
      }
    });
  };

  if (movieLoading && !currentMovie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (movieError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={typeof movieError === 'string' ? movieError : movieError?.message || 'An error occurred'} />
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Movie not found</h1>
          <button
            onClick={() => navigate('/movies')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Browse Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Movie Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          {/* Movie Poster */}
          <div className="md:w-1/3 lg:w-1/4 relative">
            {currentMovie?.movie?.posterUrl ? (
              <img
                src={currentMovie.movie.posterUrl}
                alt={currentMovie.movie.title}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  console.log('Poster failed to load:', currentMovie.movie.posterUrl);
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
                onLoad={() => {
                  console.log('Poster loaded successfully:', currentMovie.movie.posterUrl);
                }}
              />
            ) : null}
            <div
              className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center text-gray-500 border absolute top-0"
              style={currentMovie?.movie?.posterUrl ? { display: 'none' } : { display: 'flex' }}
            >
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 3h16l-2 4H6L4 3zm0 6h16v2H4V9zm2 4h12v6H6v-6z"/>
                </svg>
                <div className="text-sm font-medium">No Poster Available</div>
              </div>
            </div>
          </div>
          
          {/* Movie Info */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentMovie?.movie?.title}</h1>
                <p className="text-gray-600 mb-2">{currentMovie?.movie?.year} • {currentMovie?.movie?.runtime} min</p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="ml-1 font-medium">{currentMovie?.movie?.averageRating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-gray-500 ml-1">({currentMovie?.movie?.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleWatchlistToggle}
                className={`px-4 py-2 rounded-md font-medium ${
                  isInWatchlist
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
            
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentMovie?.movie?.genres?.map(genre => (
                <span
                  key={genre}
                  className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
            
            {/* Synopsis */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
              <p className="text-gray-700 leading-relaxed">
                {currentMovie?.movie?.synopsis || 'No synopsis available.'}
              </p>
            </div>
            
            {/* Cast & Crew */}
            {(currentMovie?.movie?.director || currentMovie?.movie?.cast?.length > 0) && (
              <div className="mt-4">
                {currentMovie?.movie?.director && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Director:</span> {currentMovie.movie.director}
                  </p>
                )}
                {currentMovie?.movie?.cast?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Cast:</span> {currentMovie.movie.cast.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Write Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserReview({ ...userReview, rating: star })}
                    className={`text-2xl ${
                      star <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
              <input
                type="text"
                value={userReview.title}
                onChange={(e) => setUserReview({ ...userReview, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Give your review a title (3-100 characters)"
                minLength={3}
                maxLength={100}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={userReview.content}
                onChange={(e) => setUserReview({ ...userReview, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your thoughts about this movie (10-2000 characters)"
                minLength={10}
                maxLength={2000}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userReview.spoilers}
                  onChange={(e) => setUserReview({ ...userReview, spoilers: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">This review contains spoilers</span>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{review.user?.username || 'Anonymous'}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No reviews yet. Be the first to review this movie!
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;