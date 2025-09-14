const { sequelize } = require('./config/database');

async function resetReviewsTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Drop the reviews table completely to remove all constraints
    await sequelize.query('DROP TABLE IF EXISTS reviews');
    console.log('✅ Dropped existing reviews table');

    // Recreate the reviews table with the correct schema
    const createTableSQL = `
      CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL REFERENCES users(id),
        movieId INTEGER NOT NULL REFERENCES movies(id),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        spoilers BOOLEAN DEFAULT 0,
        helpfulVotes INTEGER DEFAULT 0,
        totalVotes INTEGER DEFAULT 0,
        isEdited BOOLEAN DEFAULT 0,
        editedAt DATETIME,
        isActive BOOLEAN DEFAULT 1,
        moderationStatus VARCHAR(20) DEFAULT 'approved',
        moderationReason TEXT,
        flagSpam INTEGER DEFAULT 0,
        flagInappropriate INTEGER DEFAULT 0,
        flagSpoiler INTEGER DEFAULT 0,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        UNIQUE(movieId, userId)
      )
    `;

    await sequelize.query(createTableSQL);
    console.log('✅ Created reviews table with correct constraints');

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX idx_reviews_movieId_createdAt ON reviews (movieId, createdAt)',
      'CREATE INDEX idx_reviews_userId_createdAt ON reviews (userId, createdAt)',
      'CREATE INDEX idx_reviews_rating ON reviews (rating)',
      'CREATE INDEX idx_reviews_helpfulVotes ON reviews (helpfulVotes)',
      'CREATE INDEX idx_reviews_moderationStatus ON reviews (moderationStatus)'
    ];

    for (const indexSQL of indexes) {
      await sequelize.query(indexSQL);
    }
    console.log('✅ Created performance indexes');

    // Verify the table structure
    const tableInfo = await sequelize.query(
      "PRAGMA table_info(reviews)",
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('📊 Reviews table structure:');
    tableInfo.forEach(column => {
      console.log(`  ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
    });

    // Check indexes
    const indexInfo = await sequelize.query(
      "SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='reviews'",
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('📊 Reviews table indexes:');
    indexInfo.forEach(index => {
      console.log(`  ${index.name}: ${index.sql || 'AUTO INDEX'}`);
    });

    console.log('✅ Reviews table reset completed successfully');

  } catch (error) {
    console.error('❌ Error resetting reviews table:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetReviewsTable();