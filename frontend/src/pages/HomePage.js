import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { FiStar, FiTrendingUp, FiClock, FiPlay, FiArrowRight, FiZap, FiHeart } from 'react-icons/fi';
import { moviesAPI } from '../services/api';

// Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MovieCard from '../components/movies/MovieCard';
import ErrorMessage from '../components/ui/ErrorMessage';
import CSS3DElements from '../components/ui/CSS3DElements';

const HomePage = () => {
  const { mode } = useSelector((state) => state.theme);
  const { data: featuredData, isLoading, error } = useQuery(
    'featured-movies',
    moviesAPI.getFeatured,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        mode === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
          : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
      }`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 text-lg font-medium ${
            mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Loading amazing movies...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load featured movies" />;
  }

  const { popular = [], recent = [], topRated = [] } = featuredData?.data || {};

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${
        mode === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'
          : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'
      }`}>
        {/* 3D Cinema Elements */}
        <CSS3DElements />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-300"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center fade-in-up">
            <div className="flex items-center justify-center mb-6">
              <div className={`p-4 rounded-2xl ${
                mode === 'dark' 
                  ? 'bg-white/10 backdrop-blur-lg' 
                  : 'bg-white/20 backdrop-blur-lg'
              }`}>
                <FiZap className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-white mb-6">
              Discover Amazing
              <span className="block text-gradient-dark glow-pulse">Movies</span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-100 leading-relaxed">
              Join our community of movie enthusiasts. Read reviews, discover new films, 
              and share your thoughts on the latest releases in a beautiful, modern interface.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/movies"
                className={`group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  mode === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                } shadow-2xl hover:shadow-3xl`}
              >
                <FiPlay className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                Explore Movies
                <FiArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/register"
                className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-white rounded-2xl border-2 border-white/30 hover:border-white/50 backdrop-blur-lg bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <FiHeart className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Popular Movies */}
          {popular.length > 0 && (
            <div className="mb-20 fade-in-up">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className={`text-4xl font-bold ${
                    mode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FiTrendingUp className="inline-block mr-3 h-8 w-8 text-orange-500" />
                    Popular Movies
                  </h2>
                  <p className={`mt-2 text-lg ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Most watched films this month
                  </p>
                </div>
                
                <Link
                  to="/movies?sort=popular"
                  className={`group flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    mode === 'dark'
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
                      : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  View All
                  <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {popular.slice(0, 4).map((movie, index) => (
                  <div key={movie.id} className="slide-in-right" style={{ animationDelay: `${index * 150}ms` }}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Movies */}
          {recent.length > 0 && (
            <div className="mb-20 fade-in-up">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className={`text-4xl font-bold ${
                    mode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FiClock className="inline-block mr-3 h-8 w-8 text-green-500" />
                    Recent Releases
                  </h2>
                  <p className={`mt-2 text-lg ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Latest additions to our collection
                  </p>
                </div>
                
                <Link
                  to="/movies?sort=recent"
                  className={`group flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    mode === 'dark'
                      ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  View All
                  <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {recent.slice(0, 4).map((movie, index) => (
                  <div key={movie.id} className="slide-in-right" style={{ animationDelay: `${index * 150}ms` }}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Rated Movies */}
          {topRated.length > 0 && (
            <div className="fade-in-up">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className={`text-4xl font-bold ${
                    mode === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <FiStar className="inline-block mr-3 h-8 w-8 text-yellow-500" />
                    Top Rated
                  </h2>
                  <p className={`mt-2 text-lg ${
                    mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Highest rated films by our community
                  </p>
                </div>
                
                <Link
                  to="/movies?sort=rating"
                  className={`group flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    mode === 'dark'
                      ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10'
                      : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                  }`}
                >
                  View All
                  <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {topRated.slice(0, 4).map((movie, index) => (
                  <div key={movie.id} className="slide-in-right" style={{ animationDelay: `${index * 150}ms` }}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={`py-20 ${
        mode === 'dark'
          ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50'
          : 'bg-gradient-to-r from-blue-50 to-purple-50'
      }`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={`text-4xl font-bold mb-6 ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Join Our Community?
          </h2>
          <p className={`text-xl mb-10 ${
            mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Start rating movies, building your watchlist, and connecting with fellow film enthusiasts.
          </p>
          <Link
            to="/register"
            className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl ${
              mode === 'dark'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
            }`}
          >
            <FiHeart className="mr-3 h-5 w-5" />
            Join MovieHub Today
            <FiArrowRight className="ml-3 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;