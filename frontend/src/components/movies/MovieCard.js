import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiStar, FiCalendar, FiClock, FiPlay } from 'react-icons/fi';

const MovieCard = ({ movie }) => {
  const { mode } = useSelector((state) => state.theme);

  if (!movie) return null;

  const { _id, title, director, year, genre, rating, description, posterUrl } = movie;

  return (
    <div className="movie-card fade-in group">
      {/* Movie Poster */}
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={posterUrl || '/placeholder-movie.jpg'}
          alt={title}
          className="movie-card-image"
          onError={(e) => {
            e.target.src = '/placeholder-movie.jpg';
          }}
        />
        
        {/* Hover Overlay */}
        <div className="movie-card-overlay flex items-center justify-center">
          <Link
            to={`/movies/${_id}`}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              mode === 'dark'
                ? 'bg-white/90 text-gray-900 hover:bg-white'
                : 'bg-gray-900/90 text-white hover:bg-gray-900'
            }`}
          >
            <FiPlay className="h-5 w-5" />
            <span>View Details</span>
          </Link>
        </div>
        
        {/* Rating Badge */}
        <div className={`absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
          mode === 'dark'
            ? 'bg-yellow-500/90 text-gray-900'
            : 'bg-yellow-400/90 text-gray-900'
        }`}>
          <FiStar className="h-4 w-4 fill-current" />
          <span>{rating}</span>
        </div>
      </div>

      {/* Movie Details */}
      <div className={`p-6 ${
        mode === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="space-y-3">
          {/* Title */}
          <h3 className={`text-xl font-bold line-clamp-2 group-hover:text-gradient transition-all duration-300 ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          
          {/* Director */}
          <p className={`text-sm font-medium ${
            mode === 'dark' ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Directed by {director}
          </p>
          
          {/* Year and Genre */}
          <div className="flex items-center space-x-4 text-sm">
            <div className={`flex items-center space-x-1 ${
              mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <FiCalendar className="h-4 w-4" />
              <span>{year}</span>
            </div>
            <div className={`flex items-center space-x-1 ${
              mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <FiClock className="h-4 w-4" />
              <span>{genre}</span>
            </div>
          </div>
          
          {/* Description */}
          <p className={`text-sm line-clamp-3 leading-relaxed ${
            mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {description}
          </p>
        </div>
        
        {/* View Details Button */}
        <div className="mt-6">
          <Link
            to={`/movies/${_id}`}
            className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              mode === 'dark'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
            } shadow-lg hover:shadow-xl`}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;