import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchMovies, setFilters, clearFilters } from '../store/slices/movieSlice';
import MovieCard from '../components/movies/MovieCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const MoviesPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { movies, loading, error, totalPages, currentPage, filters } = useSelector(state => state.movies);
  
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'popularity'
  });

  useEffect(() => {
    const params = {
      page: parseInt(searchParams.get('page')) || 1,
      ...localFilters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });

    dispatch(fetchMovies(params));
  }, [dispatch, searchParams, localFilters]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...localFilters, [filterName]: value };
    setLocalFilters(newFilters);
    
    // Update URL search params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) newParams.set(key, val);
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setLocalFilters({
      search: '',
      genre: '',
      year: '',
      rating: '',
      sortBy: 'popularity'
    });
    setSearchParams({});
    dispatch(clearFilters());
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Movies</h1>
        <p className="text-gray-600">Find your next favorite movie from our extensive collection</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search movies..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <select
              value={localFilters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Genres</option>
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="horror">Horror</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="romance">Romance</option>
              <option value="thriller">Thriller</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={localFilters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
            <select
              value={localFilters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="year">Release Year</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        <button
          onClick={clearAllFilters}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Clear All Filters
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Movies Grid */}
      {movies && movies.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : !loading ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No movies found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
          <button
            onClick={clearAllFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default MoviesPage;