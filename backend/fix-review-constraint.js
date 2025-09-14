const { sequelize, Review } = require('./models/index');

async function fixReviewConstraint() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Drop the incorrect unique constraint on userId alone
    await sequelize.query('DROP INDEX IF EXISTS reviews_userId_unique');
    console.log('✅ Dropped incorrect userId unique constraint');

    // Ensure the correct composite unique constraint exists
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS reviews_movieId_userId_unique 
      ON reviews (movieId, userId)
    `);
    console.log('✅ Created correct movieId-userId composite unique constraint');

    // Test by checking existing reviews
    const existingReviews = await Review.findAll({
      attributes: ['id', 'userId', 'movieId', 'title']
    });
    console.log(`✅ Found ${existingReviews.length} existing reviews`);

    console.log('✅ Review constraint fix completed');

  } catch (error) {
    console.error('❌ Error fixing review constraint:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixReviewConstraint();