const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 2000]
    }
  },
  spoilers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  helpfulVotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  totalVotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  editedAt: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  moderationStatus: {
    type: DataTypes.ENUM('approved', 'pending', 'rejected'),
    defaultValue: 'approved'
  },
  moderationReason: {
    type: DataTypes.TEXT
  },
  flagSpam: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  flagInappropriate: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  flagSpoiler: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    {
      fields: ['movieId', 'createdAt']
    },
    {
      fields: ['userId', 'createdAt']
    },
    {
      unique: true,
      fields: ['movieId', 'userId'],
      name: 'reviews_movie_user_unique'
    },
    {
      fields: ['rating']
    },
    {
      fields: ['helpfulVotes']
    },
    {
      fields: ['moderationStatus']
    }
  ],
  hooks: {
    beforeUpdate: (review) => {
      if (review.changed('content') || review.changed('rating') || review.changed('title')) {
        review.isEdited = true;
        review.editedAt = new Date();
      }
    },
    afterSave: async (review) => {
      // Update movie rating statistics
      const Movie = require('./Movie');
      const movie = await Movie.findByPk(review.movieId);
      if (movie) {
        await movie.updateRatingStats();
      }
    },
    afterDestroy: async (review) => {
      // Update movie rating statistics
      const Movie = require('./Movie');
      const movie = await Movie.findByPk(review.movieId);
      if (movie) {
        await movie.updateRatingStats();
      }
    }
  }
});

// Virtual for helpful percentage
Review.prototype.getHelpfulPercentage = function() {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.helpfulVotes / this.totalVotes) * 100);
};

// Instance methods
Review.prototype.markHelpful = function() {
  this.helpfulVotes++;
  this.totalVotes++;
  return this.save();
};

Review.prototype.markNotHelpful = function() {
  this.totalVotes++;
  return this.save();
};

Review.prototype.flag = function(reason) {
  const flagField = `flag${reason.charAt(0).toUpperCase() + reason.slice(1)}`;
  if (this[flagField] !== undefined) {
    this[flagField]++;
    
    // Auto-moderate if too many flags
    const totalFlags = this.flagSpam + this.flagInappropriate + this.flagSpoiler;
    if (totalFlags >= 5) {
      this.moderationStatus = 'pending';
    }
    
    return this.save();
  }
  throw new Error('Invalid flag reason');
};

// Static methods
Review.getMovieReviews = function(movieId, options = {}) {
  const {
    sortBy = 'helpful',
    limit = 10,
    offset = 0,
    includeInactive = false
  } = options;

  let whereClause = { movieId: movieId };
  if (!includeInactive) {
    whereClause.isActive = true;
    whereClause.moderationStatus = 'approved';
  }

  let order = [];
  switch (sortBy) {
    case 'newest':
      order = [['createdAt', 'DESC']];
      break;
    case 'oldest':
      order = [['createdAt', 'ASC']];
      break;
    case 'rating_high':
      order = [['rating', 'DESC'], ['createdAt', 'DESC']];
      break;
    case 'rating_low':
      order = [['rating', 'ASC'], ['createdAt', 'DESC']];
      break;
    case 'helpful':
    default:
      order = [['helpfulVotes', 'DESC'], ['createdAt', 'DESC']];
      break;
  }

  return this.findAll({
    where: whereClause,
    include: [{
      model: require('./User'),
      attributes: ['id', 'username', 'profilePicture', 'reviewCount']
    }],
    order: order,
    offset: offset,
    limit: limit
  });
};

Review.getUserReviews = function(userId, options = {}) {
  const {
    sortBy = 'newest',
    limit = 10,
    offset = 0
  } = options;

  let order = [];
  switch (sortBy) {
    case 'rating_high':
      order = [['rating', 'DESC'], ['createdAt', 'DESC']];
      break;
    case 'rating_low':
      order = [['rating', 'ASC'], ['createdAt', 'DESC']];
      break;
    case 'helpful':
      order = [['helpfulVotes', 'DESC'], ['createdAt', 'DESC']];
      break;
    case 'newest':
    default:
      order = [['createdAt', 'DESC']];
      break;
  }

  return this.findAll({
    where: { userId: userId, isActive: true },
    include: [{
      model: require('./Movie'),
      attributes: ['id', 'title', 'posterUrl', 'releaseDate', 'averageRating']
    }],
    order: order,
    offset: offset,
    limit: limit
  });
};

Review.getReviewStats = async function() {
  const stats = await this.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
      [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 5 THEN 1 ELSE 0 END')), 'five'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 4 THEN 1 ELSE 0 END')), 'four'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 3 THEN 1 ELSE 0 END')), 'three'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 2 THEN 1 ELSE 0 END')), 'two'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 1 THEN 1 ELSE 0 END')), 'one']
    ],
    raw: true
  });

  if (stats.length === 0 || stats[0].totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { five: 0, four: 0, three: 0, two: 0, one: 0 }
    };
  }

  const result = stats[0];
  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: {
      five: result.five || 0,
      four: result.four || 0,
      three: result.three || 0,
      two: result.two || 0,
      one: result.one || 0
    }
  };
};

module.exports = Review;