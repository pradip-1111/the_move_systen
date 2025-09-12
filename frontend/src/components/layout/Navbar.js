import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiSearch, FiFilm } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import ThemeToggle from '../ui/ThemeToggle';
import clsx from 'clsx';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/movies', label: 'Movies' },
  ];

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 ${
      mode === 'dark' 
        ? 'bg-gray-900/80 border-gray-700/50 shadow-2xl shadow-purple-500/10' 
        : 'bg-white/80 border-gray-200/50 shadow-xl shadow-blue-500/10'
    } border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              mode === 'dark'
                ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white group-hover:from-purple-500 group-hover:via-blue-500 group-hover:to-cyan-500'
                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500'
            } shadow-lg group-hover:shadow-xl group-hover:scale-105`}>
              <FiFilm className="h-6 w-6" />
              <span className="font-bold text-lg">MovieHub</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  'relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group',
                  isActivePath(path) 
                    ? mode === 'dark'
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-blue-600 bg-blue-50'
                    : mode === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {label}
                {isActivePath(path) && (
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                    mode === 'dark' ? 'bg-blue-400' : 'bg-blue-600'
                  }`} />
                )}
              </Link>
            ))}

            {/* Search */}
            <Link
              to="/movies"
              className={`p-3 rounded-xl transition-all duration-300 group ${
                mode === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Search Movies"
            >
              <FiSearch className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={`/watchlist/${user?.id}`}
                  className={`p-3 rounded-xl transition-all duration-300 group ${
                    mode === 'dark'
                      ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-400/10'
                      : 'text-pink-600 hover:text-pink-700 hover:bg-pink-50'
                  }`}
                  title="My Watchlist"
                >
                  <FiHeart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </Link>
                
                <Link
                  to={`/profile/${user?.id}`}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 group ${
                    mode === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FiUser className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{user?.username}</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className={`p-3 rounded-xl transition-all duration-300 group ${
                    mode === 'dark'
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  }`}
                  title="Logout"
                >
                  <FiLogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    mode === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    mode === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle className="scale-90" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                mode === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden py-4 border-t transition-all duration-300 ${
            mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="space-y-2">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={clsx(
                    'block px-4 py-3 rounded-lg font-medium transition-all duration-300',
                    isActivePath(path) 
                      ? mode === 'dark'
                        ? 'text-blue-400 bg-blue-400/10'
                        : 'text-blue-600 bg-blue-50'
                      : mode === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    to={`/profile/${user?.id}`}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      mode === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to={`/watchlist/${user?.id}`}
                    className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      mode === 'dark'
                        ? 'text-pink-400 hover:text-pink-300 hover:bg-pink-400/10'
                        : 'text-pink-600 hover:text-pink-700 hover:bg-pink-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Watchlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      mode === 'dark'
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      mode === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`block mx-4 my-2 px-6 py-3 rounded-lg font-medium text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      mode === 'dark'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;