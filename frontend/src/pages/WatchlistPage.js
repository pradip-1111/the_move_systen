import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatchlist, removeFromWatchlist, clearWatchlist } from '../store/slices/watchlistSlice';
import MovieCard from '../components/movies/MovieCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const WatchlistPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { movies, loading, error, totalMovies } = useSelector(state => state.watchlist);
  const { user: currentUser, isAuthenticated } = useSelector(state => state.auth);
  
  const isOwnWatchlist = isAuthenticated && currentUser?._id === userId;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (userId) {
      dispatch(fetchWatchlist(userId));
    }
  }, [dispatch, userId, isAuthenticated, navigate]);

  const handleRemoveFromWatchlist = (movieId) => {
    if (window.confirm('Remove this movie from your watchlist?')) {
      dispatch(removeFromWatchlist({ userId, movieId }));
    }
  };

  const handleClearWatchlist = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist? This action cannot be undone.')) {
      dispatch(clearWatchlist(userId));
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading && movies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isOwnWatchlist ? 'Your Watchlist' : 'User Watchlist'}
          </h1>
          <p className="text-gray-600">
            {totalMovies > 0 
              ? `${totalMovies} movie${totalMovies !== 1 ? 's' : ''} to watch`
              : 'No movies in watchlist yet'
            }
          </p>
        </div>

        {isOwnWatchlist && totalMovies > 0 && (
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/movies')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Movies
            </button>
            <button
              onClick={handleClearWatchlist}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Watchlist Content */}
      {movies && movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div key={movie._id} className="relative">
              <MovieCard movie={movie} />
              
              {isOwnWatchlist && (
                <button
                  onClick={() => handleRemoveFromWatchlist(movie._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove from watchlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {isOwnWatchlist ? 'Your watchlist is empty' : 'No movies in watchlist'}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {isOwnWatchlist 
                ? 'Start building your watchlist by adding movies you want to watch later.'
                : 'This user hasn\'t added any movies to their watchlist yet.'
              }
            </p>
            
            {isOwnWatchlist && (
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/movies')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                >
                  Browse Movies
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 font-medium"
                >
                  Go to Homepage
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Loading State for Additional Actions */}
      {loading && movies.length > 0 && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-white rounded-lg shadow-lg p-3">
            <LoadingSpinner />
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;