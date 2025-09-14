const { sequelize, Movie, Watchlist, User } = require('./models/index');

async function testWatchlistAPI() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Test the exact query that's failing in the watchlist route
    const userId = 1;
    const watchlistItems = await Watchlist.findAndCountAll({
      where: { userId: userId },
      include: [{
        model: Movie,
        as: 'movie',
        attributes: ['id', 'title', 'posterUrl', 'releaseDate', 'genres', 'averageRating', 'runtime'],
        where: { isActive: true },
        required: true
      }],
      order: [['createdAt', 'DESC']],
      limit: 20,
      offset: 0
    });

    console.log(`✅ Query successful! Found ${watchlistItems.count} watchlist items`);
    
    if (watchlistItems.rows.length > 0) {
      console.log('Sample item:');
      const sample = watchlistItems.rows[0];
      console.log({
        id: sample.movieId,
        title: sample.movie.title,
        posterUrl: sample.movie.posterUrl,
        status: sample.status
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testWatchlistAPI();