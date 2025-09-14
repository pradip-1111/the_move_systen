const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tmdbId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: true,
    comment: 'TMDB API movie ID for external reference'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  originalTitle: {
    type: DataTypes.STRING(200)
  },
  overview: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 2000]
    }
  },
  releaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  runtime: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1
    }
  },
  director: {
    type: DataTypes.STRING(100),
    defaultValue: 'Unknown Director'
  },
  posterUrl: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  backdropUrl: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  trailerUrl: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  imdbId: {
    type: DataTypes.STRING(20),
    unique: true
  },
  tmdbId: {
    type: DataTypes.INTEGER,
    unique: true
  },
  budget: {
    type: DataTypes.BIGINT,
    validate: {
      min: 0
    }
  },
  revenue: {
    type: DataTypes.BIGINT,
    validate: {
      min: 0
    }
  },
  genres: {
    type: DataTypes.TEXT,
    defaultValue: '',
    get() {
      const rawValue = this.getDataValue('genres');
      return rawValue ? rawValue.split(',').map(g => g.trim()) : [];
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('genres', value.join(', '));
      } else {
        this.setDataValue('genres', value || '');
      }
    }
  },
  cast: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en'
  },
  country: {
    type: DataTypes.STRING(10),
    defaultValue: 'US'
  },
  certification: {
    type: DataTypes.ENUM('G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'),
    defaultValue: 'NR'
  },
  status: {
    type: DataTypes.ENUM('Released', 'In Production', 'Post Production', 'Planned', 'Canceled'),
    defaultValue: 'Released'
  },
  averageRating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  ratingFive: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ratingFour: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ratingThree: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ratingTwo: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ratingOne: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  popularity: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  watchlistCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'movies',
  timestamps: true,
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['releaseDate']
    },
    {
      fields: ['averageRating']
    },
    {
      fields: ['popularity']
    },
    {
      fields: ['tmdbId']
    },
    {
      fields: ['imdbId']
    }
  ]
});

// Virtual field for year
Movie.prototype.getYear = function() {
  return this.releaseDate ? new Date(this.releaseDate).getFullYear() : null;
};

// Method to update rating statistics
Movie.prototype.updateRatingStats = async function() {
  const Review = require('./Review');
  const { Op } = require('sequelize');

  const stats = await Review.findAll({
    where: { movieId: this.id },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 5 THEN 1 ELSE 0 END')), 'five'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 4 THEN 1 ELSE 0 END')), 'four'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 3 THEN 1 ELSE 0 END')), 'three'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 2 THEN 1 ELSE 0 END')), 'two'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 1 THEN 1 ELSE 0 END')), 'one']
    ],
    raw: true
  });

  if (stats.length > 0 && stats[0].totalRatings > 0) {
    const stat = stats[0];
    this.averageRating = Math.round(stat.avgRating * 10) / 10;
    this.totalRatings = stat.totalRatings;
    this.ratingFive = stat.five || 0;
    this.ratingFour = stat.four || 0;
    this.ratingThree = stat.three || 0;
    this.ratingTwo = stat.two || 0;
    this.ratingOne = stat.one || 0;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
    this.ratingFive = 0;
    this.ratingFour = 0;
    this.ratingThree = 0;
    this.ratingTwo = 0;
    this.ratingOne = 0;
  }

  return await this.save();
};

// Method to increment view count
Movie.prototype.incrementViewCount = function() {
  this.viewCount++;
  return this.save();
};

// Static method to find movies by genre
Movie.findByGenre = async function(genre) {
  const MovieGenre = require('./MovieGenre');
  return await this.findAll({
    include: [{
      model: MovieGenre,
      where: { genre: genre }
    }],
    where: { isActive: true }
  });
};

// Static method to find popular movies
Movie.findPopular = function(limit = 10) {
  return this.findAll({
    where: { isActive: true },
    order: [['popularity', 'DESC'], ['averageRating', 'DESC']],
    limit: limit
  });
};

// Static method to find recent movies
Movie.findRecent = function(limit = 10) {
  return this.findAll({
    where: { isActive: true },
    order: [['releaseDate', 'DESC']],
    limit: limit
  });
};

// Static method to search movies
Movie.searchMovies = async function(query, options = {}) {
  const {
    genre,
    year,
    minRating,
    sortBy = 'relevance',
    limit = 20,
    offset = 0
  } = options;

  const { Op } = require('sequelize');
  let whereClause = { isActive: true };
  let include = [];

  // Text search
  if (query) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${query}%` } },
      { overview: { [Op.like]: `%${query}%` } }
    ];
  }

  // Year filter
  if (year) {
    whereClause.releaseDate = {
      [Op.between]: [`${year}-01-01`, `${year}-12-31`]
    };
  }

  // Rating filter
  if (minRating) {
    whereClause.averageRating = { [Op.gte]: minRating };
  }

  // Genre filter
  if (genre && genre !== 'all') {
    const MovieGenre = require('./MovieGenre');
    include.push({
      model: MovieGenre,
      where: { genre: genre },
      required: true
    });
  }

  let order = [];
  switch (sortBy) {
    case 'rating':
      order = [['averageRating', 'DESC'], ['totalRatings', 'DESC']];
      break;
    case 'year':
      order = [['releaseDate', 'DESC']];
      break;
    case 'popularity':
      order = [['popularity', 'DESC']];
      break;
    case 'title':
      order = [['title', 'ASC']];
      break;
    default:
      order = [['createdAt', 'DESC']];
  }

  return await this.findAll({
    where: whereClause,
    include: include,
    order: order,
    offset: offset,
    limit: limit
  });
};

module.exports = Movie;