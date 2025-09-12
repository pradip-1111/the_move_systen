const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for watchlist entry']
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required for watchlist entry']
  },
  status: {
    type: String,
    enum: ['want_to_watch', 'watching', 'watched'],
    default: 'want_to_watch'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  dateWatched: {
    type: Date
  },
  personalRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one entry per user per movie
watchlistSchema.index({ user: 1, movie: 1 }, { unique: true });
watchlistSchema.index({ user: 1, status: 1 });
watchlistSchema.index({ user: 1, createdAt: -1 });
watchlistSchema.index({ movie: 1 });

// Virtual for populated movie details
watchlistSchema.virtual('movieDetails', {
  ref: 'Movie',
  localField: 'movie',
  foreignField: '_id',
  justOne: true,
  select: 'title posterUrl releaseDate genres averageRating runtime'
});

// Pre-save middleware to handle status changes
watchlistSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'watched' && !this.dateWatched) {
      this.dateWatched = new Date();
    } else if (this.status !== 'watched') {
      this.dateWatched = undefined;
    }
  }
  next();
});

// Post-save middleware to update movie watchlist count
watchlistSchema.post('save', async function() {
  try {
    const Movie = mongoose.model('Movie');
    const movie = await Movie.findById(this.movie);
    if (movie) {
      const count = await mongoose.model('Watchlist').countDocuments({ movie: this.movie });
      movie.watchlistCount = count;
      await movie.save();
    }
  } catch (error) {
    console.error('Error updating movie watchlist count:', error);
  }
});

// Post-remove middleware to update movie watchlist count
watchlistSchema.post('remove', async function() {
  try {
    const Movie = mongoose.model('Movie');
    const movie = await Movie.findById(this.movie);
    if (movie) {
      const count = await mongoose.model('Watchlist').countDocuments({ movie: this.movie });
      movie.watchlistCount = count;
      await movie.save();
    }
  } catch (error) {
    console.error('Error updating movie watchlist count:', error);
  }
});

// Static method to get user's watchlist by status
watchlistSchema.statics.getUserWatchlist = function(userId, status = null, options = {}) {
  const {
    sortBy = 'added',
    limit = 20,
    skip = 0
  } = options;

  let query = { user: userId };
  if (status && status !== 'all') {
    query.status = status;
  }

  let sortOptions = {};
  switch (sortBy) {
    case 'title':
      // This requires population, handled in the query
      sortOptions = { createdAt: -1 }; // fallback
      break;
    case 'rating':
      sortOptions = { personalRating: -1, createdAt: -1 };
      break;
    case 'priority':
      sortOptions = { priority: 1, createdAt: -1 };
      break;
    case 'date_watched':
      sortOptions = { dateWatched: -1, createdAt: -1 };
      break;
    case 'added':
    default:
      sortOptions = { createdAt: -1 };
      break;
  }

  return this.find(query)
    .populate({
      path: 'movie',
      select: 'title posterUrl releaseDate genres averageRating runtime',
      match: { isActive: true }
    })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

// Static method to get watchlist statistics for a user
watchlistSchema.statics.getUserWatchlistStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    want_to_watch: 0,
    watching: 0,
    watched: 0,
    total: 0
  };

  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Method to mark as watched
watchlistSchema.methods.markAsWatched = function(rating = null) {
  this.status = 'watched';
  this.dateWatched = new Date();
  if (rating) {
    this.personalRating = rating;
  }
  return this.save();
};

// Method to update priority
watchlistSchema.methods.updatePriority = function(priority) {
  if (['low', 'medium', 'high'].includes(priority)) {
    this.priority = priority;
    return this.save();
  }
  throw new Error('Invalid priority level');
};

// Static method to get popular movies from watchlists
watchlistSchema.statics.getPopularWatchlistMovies = function(limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$movie',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movie'
      }
    },
    { $unwind: '$movie' },
    {
      $project: {
        _id: 0,
        movie: 1,
        watchlistCount: '$count'
      }
    }
  ]);
};

// Static method to check if movie is in user's watchlist
watchlistSchema.statics.isInWatchlist = function(userId, movieId) {
  return this.findOne({ user: userId, movie: movieId });
};

module.exports = mongoose.model('Watchlist', watchlistSchema);