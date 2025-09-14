import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  if (!movie) {
    return null;
  }

  const { id, title, director, year, genre, rating, description, posterUrl } = movie;

  // Additional safety check
  if (!id) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> Movie missing ID
      </div>
    );
  }

  // Validate and sanitize poster URL
  const isValidUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Multiple fallback options for better reliability
  const fallbackImages = [
    '/placeholder-movie.jpg',
    'https://via.placeholder.com/300x450/374151/white?text=No+Image',
    'https://via.placeholder.com/300x450/6b7280/white?text=Movie+Poster',
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%23374151"/%3E%3Ctext x="150" y="225" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
  ];

  const currentYear = new Date().getFullYear();
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : year || currentYear;

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e) => {
    setImageLoading(false);
    
    if (fallbackIndex < fallbackImages.length - 1) {
      setFallbackIndex(prev => prev + 1);
      e.target.src = fallbackImages[fallbackIndex + 1];
    } else {
      setImageError(true);
    }
  };

  const getImageSrc = () => {
    if (fallbackIndex > 0) {
      return fallbackImages[fallbackIndex];
    }
    return isValidUrl(posterUrl) ? posterUrl : fallbackImages[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        
        {imageError ? (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">🎬</div>
              <div className="text-sm">Image unavailable</div>
            </div>
          </div>
        ) : (
          <img
            src={getImageSrc()}
            alt={title || 'Movie poster'}
            className={`w-full h-64 object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          {rating || movie.averageRating || 'N/A'}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">
          {director} • {releaseYear}
        </p>
        {genre && (
          <p className="text-gray-500 text-xs mb-3">{Array.isArray(genre) ? genre.join(', ') : genre}</p>
        )}
        {description && (
          <p className="text-gray-700 text-sm line-clamp-3 mb-3">{description}</p>
        )}
        
        <div className="flex space-x-2">
          <Link
            to={`/movies/${id}`}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;