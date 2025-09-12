import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiSun, FiMoon } from 'react-icons/fi';
import { toggleTheme } from '../../store/slices/themeSlice';

const ThemeToggle = ({ className = '' }) => {
  const { mode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative inline-flex items-center justify-center
        w-12 h-6 rounded-full transition-all duration-300 ease-in-out
        ${mode === 'dark' 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
          : 'bg-gradient-to-r from-orange-400 to-yellow-400'
        }
        hover:shadow-lg transform hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        ${mode === 'dark' ? 'focus:ring-purple-500' : 'focus:ring-orange-500'}
        ${className}
      `}
      title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div
        className={`
          absolute top-0.5 left-0.5 w-5 h-5 rounded-full
          bg-white shadow-md transition-transform duration-300 ease-in-out
          flex items-center justify-center
          ${mode === 'dark' ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {mode === 'dark' ? (
          <FiMoon className="w-3 h-3 text-purple-600" />
        ) : (
          <FiSun className="w-3 h-3 text-orange-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;