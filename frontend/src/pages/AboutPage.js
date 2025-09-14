import React from 'react';
import { useSelector } from 'react-redux';
import { FiStar, FiUsers, FiTrendingUp, FiAward, FiTarget, FiHeart } from 'react-icons/fi';

const AboutPage = () => {
  const { mode } = useSelector((state) => state.theme);

  const stats = [
    { icon: FiUsers, label: 'Active Users', value: '10,000+', color: 'blue' },
    { icon: FiStar, label: 'Movie Reviews', value: '25,000+', color: 'yellow' },
    { icon: FiTrendingUp, label: 'Movies Rated', value: '5,000+', color: 'green' },
    { icon: FiAward, label: 'User Satisfaction', value: '98%', color: 'purple' },
  ];

  const features = [
    {
      icon: FiStar,
      title: 'Smart Recommendations',
      description: 'AI-powered movie suggestions based on your viewing history and preferences.',
    },
    {
      icon: FiUsers,
      title: 'Community Reviews',
      description: 'Read authentic reviews from fellow movie enthusiasts worldwide.',
    },
    {
      icon: FiHeart,
      title: 'Personal Watchlist',
      description: 'Curate your perfect movie collection with our advanced watchlist system.',
    },
    {
      icon: FiTrendingUp,
      title: 'Trending Analytics',
      description: 'Discover what movies are popular and trending in real-time.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`py-20 ${
        mode === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'
          : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About MovieHub
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing how movie enthusiasts discover, review, and connect over their 
            favorite films. Built with cutting-edge technology and user-centric design.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 ${
        mode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className={`text-center p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  mode === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-white hover:shadow-lg'
                }`}
              >
                <Icon className={`h-12 w-12 mx-auto mb-4 text-${color}-500`} />
                <div className={`text-3xl font-bold mb-2 ${
                  mode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {value}
                </div>
                <div className={`text-sm font-medium ${
                  mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className={`text-4xl font-bold mb-6 ${
              mode === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Our Mission
            </h2>
            <p className={`text-lg leading-relaxed ${
              mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              To create the world's most comprehensive and user-friendly movie discovery platform, 
              empowering film lovers to find their next favorite movie and connect with like-minded 
              enthusiasts through meaningful reviews and recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className={`p-8 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  mode === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-white hover:shadow-lg border border-gray-100'
                }`}
              >
                <Icon className={`h-10 w-10 mb-4 ${
                  mode === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <h3 className={`text-xl font-bold mb-3 ${
                  mode === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
                <p className={mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className={`py-20 ${
        mode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-4xl font-bold mb-12 ${
            mode === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Built with Modern Technology
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['React.js', 'Node.js', 'MongoDB', 'Express.js', 'Redux', 'Tailwind CSS', 'Vercel', 'JWT Auth'].map((tech) => (
              <div
                key={tech}
                className={`p-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                  mode === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                }`}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;