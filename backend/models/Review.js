const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for review']
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required for review']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  spoilers: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  moderationStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved'
  },
  moderationReason: {
    type: String
  },
  flags: {
    spam: { type: Number, default: 0 },
    inappropriate: { type: Number, default: 0 },
    spoiler: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
reviewSchema.index({ movie: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ movie: 1, user: 1 }, { unique: true }); // One review per user per movie
reviewSchema.index({ rating: -1 });
reviewSchema.index({ helpfulVotes: -1 });
reviewSchema.index({ moderationStatus: 1 });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});

// Virtual for populated user info (without password)
reviewSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  select: 'username profilePicture reviewCount'
});

// Virtual for populated movie info
reviewSchema.virtual('movieInfo', {
  ref: 'Movie',
  localField: 'movie',
  foreignField: '_id',
  justOne: true,
  select: 'title posterUrl releaseDate averageRating'
});

// Pre-save middleware to handle edit tracking
reviewSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('rating') || this.isModified('title')) {
    if (!this.isNew) {
      this.isEdited = true;
      this.editedAt = new Date();
    }
  }
  next();
});

// Post-save middleware to update movie rating statistics
reviewSchema.post('save', async function() {
  try {
    const Movie = mongoose.model('Movie');
    const movie = await Movie.findById(this.movie);
    if (movie) {
      await movie.updateRatingStats();
    }
  } catch (error) {
    console.error('Error updating movie rating stats:', error);
  }
});

// Post-remove middleware to update movie rating statistics
reviewSchema.post('remove', async function() {
  try {
    const Movie = mongoose.model('Movie');
    const movie = await Movie.findById(this.movie);
    if (movie) {
      await movie.updateRatingStats();
    }
  } catch (error) {
    console.error('Error updating movie rating stats:', error);
  }
});

// Static method to get reviews for a specific movie
reviewSchema.statics.getMovieReviews = function(movieId, options = {}) {
  const {
    sortBy = 'helpful',
    limit = 10,
    skip = 0,
    includeInactive = false
  } = options;

  let query = { movie: movieId };
  if (!includeInactive) {
    query.isActive = true;
    query.moderationStatus = 'approved';
  }

  let sortOptions = {};
  switch (sortBy) {
    case 'newest':
      sortOptions = { createdAt: -1 };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'rating_high':
      sortOptions = { rating: -1, createdAt: -1 };
      break;
    case 'rating_low':
      sortOptions = { rating: 1, createdAt: -1 };
      break;
    case 'helpful':
    default:
      sortOptions = { helpfulVotes: -1, createdAt: -1 };
      break;
  }

  return this.find(query)
    .populate('user', 'username profilePicture reviewCount')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

// Static method to get user's reviews
reviewSchema.statics.getUserReviews = function(userId, options = {}) {
  const {
    sortBy = 'newest',
    limit = 10,
    skip = 0
  } = options;

  let sortOptions = {};
  switch (sortBy) {
    case 'rating_high':
      sortOptions = { rating: -1, createdAt: -1 };
      break;
    case 'rating_low':
      sortOptions = { rating: 1, createdAt: -1 };
      break;
    case 'helpful':
      sortOptions = { helpfulVotes: -1, createdAt: -1 };
      break;
    case 'newest':
    default:
      sortOptions = { createdAt: -1 };
      break;
  }

  return this.find({ user: userId, isActive: true })
    .populate('movie', 'title posterUrl releaseDate averageRating')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

// Method to mark review as helpful
reviewSchema.methods.markHelpful = function() {
  this.helpfulVotes++;
  this.totalVotes++;
  return this.save();
};

// Method to mark review as not helpful
reviewSchema.methods.markNotHelpful = function() {
  this.totalVotes++;
  return this.save();
};

// Method to flag review
reviewSchema.methods.flag = function(reason) {
  if (this.flags[reason] !== undefined) {
    this.flags[reason]++;
    
    // Auto-moderate if too many flags
    const totalFlags = Object.values(this.flags).reduce((sum, count) => sum + count, 0);
    if (totalFlags >= 5) {
      this.moderationStatus = 'pending';
    }
    
    return this.save();
  }
  throw new Error('Invalid flag reason');
};

// Static method to get review statistics
reviewSchema.statics.getReviewStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: {
            $switch: {
              branches: [
                { case: { $eq: ['$rating', 5] }, then: 'five' },
                { case: { $eq: ['$rating', 4] }, then: 'four' },
                { case: { $eq: ['$rating', 3] }, then: 'three' },
                { case: { $eq: ['$rating', 2] }, then: 'two' },
                { case: { $eq: ['$rating', 1] }, then: 'one' }
              ],
              default: 'unknown'
            }
          }
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { five: 0, four: 0, three: 0, two: 0, one: 0 }
    };
  }

  const result = stats[0];
  const distribution = { five: 0, four: 0, three: 0, two: 0, one: 0 };
  
  result.ratingDistribution.forEach(rating => {
    if (distribution[rating] !== undefined) {
      distribution[rating]++;
    }
  });

  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10,
    ratingDistribution: distribution
  };
};

module.exports = mongoose.model('Review', reviewSchema);