import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usersAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useSelector(state => state.auth);
  
  const [profileUser, setProfileUser] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');

  const isOwnProfile = isAuthenticated && currentUser?.id === userId;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data and reviews - these should exist
        const [userResponse, reviewsResponse] = await Promise.all([
          usersAPI.getUser(userId),
          usersAPI.getUserReviews(userId)
        ]);
        
        setProfileUser(userResponse.data);
        setUserReviews(reviewsResponse.data.reviews || []);
        
        // Try to fetch stats, but handle if endpoint doesn't exist
        try {
          const statsResponse = await usersAPI.getUserStats(userId);
          setUserStats(statsResponse.data);
        } catch (statsError) {
          console.log('User stats endpoint not available, using defaults');
          // Set default stats if the endpoint doesn't exist
          setUserStats({
            totalReviews: reviewsResponse.data.reviews?.length || 0,
            averageRating: 0,
            totalMoviesWatched: 0
          });
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={profileUser.avatar || '/api/placeholder/100/100'}
              alt={profileUser.username}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
          
          {/* User Info */}
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {profileUser.username}
                </h1>
                <p className="text-gray-600 mb-4">
                  Member since {new Date(profileUser.createdAt).toLocaleDateString()}
                </p>
                
                {/* Stats */}
                {userStats && (
                  <div className="flex space-x-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {userStats.totalReviews || 0}
                      </div>
                      <div className="text-sm text-gray-500">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">
                        {userStats.averageRating?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {userStats.helpfulVotes || 0}
                      </div>
                      <div className="text-sm text-gray-500">Helpful Votes</div>
                    </div>
                  </div>
                )}
              </div>
              
              {isOwnProfile && (
                <button
                  onClick={() => navigate(`/profile/${userId}/edit`)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews ({userReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'watchlist'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Watchlist
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isOwnProfile ? 'Your Reviews' : `${profileUser.username}'s Reviews`}
            </h2>
            
            {userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-blue-600 hover:text-blue-700">
                        <button onClick={() => navigate(`/movies/${review.movie.id}`)}>
                          {review.movie.title}
                        </button>
                      </h3>
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
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    {review.helpfulCount > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        {review.helpfulCount} people found this helpful
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                {isOwnProfile ? "You haven't written any reviews yet." : "No reviews found."}
              </p>
            )}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isOwnProfile ? 'Your Watchlist' : `${profileUser.username}'s Watchlist`}
            </h2>
            <div className="text-center text-gray-500 py-8">
              <p>Watchlist feature coming soon!</p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/watchlist')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Go to Watchlist
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;