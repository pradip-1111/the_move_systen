const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Watchlist = sequelize.define('Watchlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'movies',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('want_to_watch', 'watching', 'watched'),
    defaultValue: 'want_to_watch'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  notes: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 500]
    }
  },
  dateWatched: {
    type: DataTypes.DATE
  },
  personalRating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'watchlists',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'movieId']
    },
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['userId', 'createdAt']
    },
    {
      fields: ['movieId']
    }
  ],
  hooks: {
    beforeSave: (watchlist) => {
      if (watchlist.changed('status')) {
        if (watchlist.status === 'watched' && !watchlist.dateWatched) {
          watchlist.dateWatched = new Date();
        } else if (watchlist.status !== 'watched') {
          watchlist.dateWatched = null;
        }
      }
    },
    afterSave: async (watchlist) => {
      // Update movie watchlist count
      const Movie = require('./Movie');
      const movie = await Movie.findByPk(watchlist.movieId);
      if (movie) {
        const count = await Watchlist.count({ where: { movieId: watchlist.movieId } });
        movie.watchlistCount = count;
        await movie.save();
      }
    },
    afterDestroy: async (watchlist) => {
      // Update movie watchlist count
      const Movie = require('./Movie');
      const movie = await Movie.findByPk(watchlist.movieId);
      if (movie) {
        const count = await Watchlist.count({ where: { movieId: watchlist.movieId } });
        movie.watchlistCount = count;
        await movie.save();
      }
    }
  }
});

// Instance methods
Watchlist.prototype.markAsWatched = function(rating = null) {
  this.status = 'watched';
  this.dateWatched = new Date();
  if (rating) {
    this.personalRating = rating;
  }
  return this.save();
};

Watchlist.prototype.updatePriority = function(priority) {
  if (['low', 'medium', 'high'].includes(priority)) {
    this.priority = priority;
    return this.save();
  }
  throw new Error('Invalid priority level');
};

// Static methods
Watchlist.getUserWatchlist = function(userId, status = null, options = {}) {
  const {
    sortBy = 'added',
    limit = 20,
    offset = 0
  } = options;

  let whereClause = { userId: userId };
  if (status && status !== 'all') {
    whereClause.status = status;
  }

  let order = [];
  switch (sortBy) {
    case 'rating':
      order = [['personalRating', 'DESC'], ['createdAt', 'DESC']];
      break;
    case 'priority':
      order = [['priority', 'ASC'], ['createdAt', 'DESC']];
      break;
    case 'date_watched':
      order = [['dateWatched', 'DESC'], ['createdAt', 'DESC']];
      break;
    case 'added':
    default:
      order = [['createdAt', 'DESC']];
      break;
  }

  return this.findAll({
    where: whereClause,
    include: [{
      model: require('./Movie'),
      attributes: ['id', 'title', 'posterUrl', 'releaseDate', 'averageRating', 'runtime'],
      where: { isActive: true }
    }],
    order: order,
    offset: offset,
    limit: limit
  });
};

Watchlist.getUserWatchlistStats = async function(userId) {
  const stats = await this.findAll({
    where: { userId: userId },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  const result = {
    want_to_watch: 0,
    watching: 0,
    watched: 0,
    total: 0
  };

  stats.forEach(stat => {
    result[stat.status] = parseInt(stat.count);
    result.total += parseInt(stat.count);
  });

  return result;
};

Watchlist.getPopularWatchlistMovies = function(limit = 10) {
  return this.findAll({
    attributes: [
      'movieId',
      [sequelize.fn('COUNT', sequelize.col('movieId')), 'count']
    ],
    group: ['movieId'],
    order: [[sequelize.literal('count'), 'DESC']],
    limit: limit,
    include: [{
      model: require('./Movie'),
      attributes: ['id', 'title', 'posterUrl', 'releaseDate', 'averageRating']
    }]
  });
};

Watchlist.isInWatchlist = function(userId, movieId) {
  return this.findOne({ where: { userId: userId, movieId: movieId } });
};

module.exports = Watchlist;