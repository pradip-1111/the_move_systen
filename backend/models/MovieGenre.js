const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MovieGenre = sequelize.define('MovieGenre', {
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  genre: {
    type: DataTypes.ENUM(
      'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
      'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 
      'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 
      'TV Movie', 'Thriller', 'War', 'Western'
    ),
    allowNull: false
  }
}, {
  tableName: 'movie_genres',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['movieId', 'genre']
    },
    {
      fields: ['genre']
    }
  ]
});

module.exports = MovieGenre;