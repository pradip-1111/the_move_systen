const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Genre = sequelize.define('Genre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tmdbId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: true,
    comment: 'TMDB API genre ID for external reference'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'genres',
  timestamps: true,
  indexes: [
    {
      fields: ['tmdbId']
    },
    {
      fields: ['name']
    }
  ]
});

module.exports = Genre;