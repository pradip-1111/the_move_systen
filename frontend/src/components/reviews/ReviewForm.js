import React, { useState } from 'react';

const ReviewForm = ({ onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: '',
    spoilers: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }
    
    if (!formData.content.trim() || formData.content.trim().length < 10) {
      newErrors.content = 'Review content must be at least 10 characters long';
    }
    
    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Trim text fields before submitting
    const cleanedData = {
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim()
    };
    
    onSubmit(cleanedData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Write Your Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className={`text-3xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
              >
                ★
              </button>
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-3">
              {formData.rating} out of 5 stars
            </span>
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Give your review a title..."
            maxLength="100"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {formData.title.length}/100
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Review Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
              errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Share your thoughts about this movie..."
            maxLength="2000"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content}</p>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {formData.content.length}/2000
            </span>
          </div>
        </div>

        {/* Spoilers Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="spoilers"
            name="spoilers"
            checked={formData.spoilers}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="spoilers" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            This review contains spoilers
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;