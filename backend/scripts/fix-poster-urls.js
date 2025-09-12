const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movie_review_platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Migration script to fix poster URLs
const fixPosterUrls = async () => {
  try {
    await connectDB();
    
    // Get all movies with posterPath but no posterUrl
    const movies = await mongoose.connection.db.collection('movies').find({
      posterPath: { $exists: true },
      posterUrl: { $exists: false }
    }).toArray();
    
    console.log(`Found ${movies.length} movies to fix`);
    
    for (const movie of movies) {
      const updateData = {};
      
      // Convert posterPath to posterUrl
      if (movie.posterPath) {
        updateData.posterUrl = movie.posterPath;
      }
      
      // Convert backdropPath to backdropUrl
      if (movie.backdropPath) {
        updateData.backdropUrl = movie.backdropPath;
      }
      
      if (Object.keys(updateData).length > 0) {
        await mongoose.connection.db.collection('movies').updateOne(
          { _id: movie._id },
          { 
            $set: updateData,
            $unset: { posterPath: "", backdropPath: "" }
          }
        );
        console.log(`✅ Fixed movie: ${movie.title}`);
      }
    }
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

fixPosterUrls();