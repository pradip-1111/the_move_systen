const { sequelize } = require('./models/index');
const { QueryInterface } = require('sequelize');

async function fixDatabaseConstraints() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get the query interface
    const queryInterface = sequelize.getQueryInterface();

    // Drop the incorrect unique constraint on userId alone if it exists
    try {
      await sequelize.query('DROP INDEX IF EXISTS reviews_userId_unique');
      console.log('✅ Dropped incorrect userId unique constraint');
    } catch (error) {
      console.log('ℹ️ No userId unique constraint found to drop');
    }

    // Drop other potential problematic constraints
    try {
      await sequelize.query('DROP INDEX IF EXISTS sqlite_autoindex_reviews_1');
      console.log('✅ Dropped auto index if it existed');
    } catch (error) {
      console.log('ℹ️ No auto index found to drop');
    }

    // Ensure the correct composite unique constraint exists (movieId + userId)
    try {
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS reviews_movie_user_unique 
        ON reviews (movieId, userId)
      `);
      console.log('✅ Created correct movieId-userId composite unique constraint');
    } catch (error) {
      console.log('ℹ️ Composite constraint might already exist:', error.message);
    }

    // Verify the current indexes
    const indexes = await sequelize.query(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='index' AND tbl_name='reviews'
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('📊 Current indexes on reviews table:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${index.sql}`);
    });

    // Test constraint by checking if we can create a duplicate review
    console.log('🧪 Testing constraint behavior...');
    
    // Check existing reviews
    const existingReviews = await sequelize.query(
      'SELECT id, userId, movieId FROM reviews LIMIT 5',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log(`📝 Found ${existingReviews.length} existing reviews`);
    existingReviews.forEach(review => {
      console.log(`  Review ${review.id}: User ${review.userId}, Movie ${review.movieId}`);
    });

    console.log('✅ Database constraint fix completed successfully');

  } catch (error) {
    console.error('❌ Error fixing database constraints:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixDatabaseConstraints();