const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  originalTitle: {
    type: String,
    trim: true
  },
  overview: {
    type: String,
    required: [true, 'Movie overview is required'],
    maxlength: [2000, 'Overview cannot exceed 2000 characters']
  },
  genres: [{
    type: String,
    enum: ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western']
  }],
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  runtime: {
    type: Number,
    min: [1, 'Runtime must be at least 1 minute']
  },
  director: {
    type: String,
    required: false,
    trim: true,
    default: 'Unknown Director'
  },
  cast: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    character: {
      type: String,
      trim: true
    },
    profilePath: String
  }],
  posterUrl: {
    type: String,
    default: ''
  },
  backdropUrl: {
    type: String,
    default: ''
  },
  trailerUrl: {
    type: String,
    default: ''
  },
  imdbId: {
    type: String,
    unique: true,
    sparse: true
  },
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true
  },
  budget: {
    type: Number,
    min: 0
  },
  revenue: {
    type: Number,
    min: 0
  },
  language: {
    type: String,
    default: 'en'
  },
  country: {
    type: String,
    default: 'US'
  },
  certification: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'],
    default: 'NR'
  },
  status: {
    type: String,
    enum: ['Released', 'In Production', 'Post Production', 'Planned', 'Canceled'],
    default: 'Released'
  },
  // Rating statistics
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  ratingDistribution: {
    five: { type: Number, default: 0 },
    four: { type: Number, default: 0 },
    three: { type: Number, default: 0 },
    two: { type: Number, default: 0 },
    one: { type: Number, default: 0 }
  },
  // Popularity and view metrics
  popularity: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  watchlistCount: {
    type: Number,
    default: 0
  },
  // Admin fields
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
movieSchema.index({ title: 'text', overview: 'text' });
movieSchema.index({ genres: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ averageRating: -1 });
movieSchema.index({ popularity: -1 });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ tmdbId: 1 });
movieSchema.index({ imdbId: 1 });

// Virtual for reviews
movieSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'movie'
});

// Virtual for year from release date
movieSchema.virtual('year').get(function() {
  return this.releaseDate ? this.releaseDate.getFullYear() : null;
});

// Method to update rating statistics
movieSchema.methods.updateRatingStats = async function() {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { movie: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratings: { $push: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    const stat = stats[0];
    this.averageRating = Math.round(stat.averageRating * 10) / 10;
    this.totalRatings = stat.totalRatings;

    // Update rating distribution
    const distribution = { five: 0, four: 0, three: 0, two: 0, one: 0 };
    stat.ratings.forEach(rating => {
      if (rating === 5) distribution.five++;
      else if (rating === 4) distribution.four++;
      else if (rating === 3) distribution.three++;
      else if (rating === 2) distribution.two++;
      else if (rating === 1) distribution.one++;
    });
    
    this.ratingDistribution = distribution;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
    this.ratingDistribution = { five: 0, four: 0, three: 0, two: 0, one: 0 };
  }

  return this.save();
};

// Method to increment view count
movieSchema.methods.incrementViewCount = function() {
  this.viewCount++;
  return this.save();
};

// Static method to find movies by genre
movieSchema.statics.findByGenre = function(genre) {
  return this.find({ genres: genre, isActive: true });
};

// Static method to find popular movies
movieSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ popularity: -1, averageRating: -1 })
    .limit(limit);
};

// Static method to find recent movies
movieSchema.statics.findRecent = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ releaseDate: -1 })
    .limit(limit);
};

// Static method to search movies
movieSchema.statics.searchMovies = function(query, options = {}) {
  const {
    genre,
    year,
    minRating,
    sortBy = 'relevance',
    limit = 20,
    skip = 0
  } = options;

  let searchQuery = { isActive: true };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Genre filter
  if (genre && genre !== 'all') {
    searchQuery.genres = genre;
  }

  // Year filter
  if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    searchQuery.releaseDate = { $gte: startDate, $lte: endDate };
  }

  // Rating filter
  if (minRating) {
    searchQuery.averageRating = { $gte: minRating };
  }

  let sortOptions = {};
  switch (sortBy) {
    case 'rating':
      sortOptions = { averageRating: -1, totalRatings: -1 };
      break;
    case 'year':
      sortOptions = { releaseDate: -1 };
      break;
    case 'popularity':
      sortOptions = { popularity: -1 };
      break;
    case 'title':
      sortOptions = { title: 1 };
      break;
    default:
      sortOptions = query ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
  }

  return this.find(searchQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Movie', movieSchema);