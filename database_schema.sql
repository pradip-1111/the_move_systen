-- MovieHub2 Database Schema for SQLite
-- This shows the structure that was automatically created by Sequelize

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profilePicture TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    isAdmin BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewCount INTEGER DEFAULT 0,
    watchlistCount INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Movies table
CREATE TABLE movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    originalTitle VARCHAR(200),
    overview TEXT NOT NULL,
    releaseDate DATE NOT NULL,
    runtime INTEGER,
    director VARCHAR(100) DEFAULT 'Unknown Director',
    posterUrl TEXT DEFAULT '',
    backdropUrl TEXT DEFAULT '',
    trailerUrl TEXT DEFAULT '',
    imdbId VARCHAR(20) UNIQUE,
    tmdbId INTEGER UNIQUE,
    budget BIGINT DEFAULT 0,
    revenue BIGINT DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    country VARCHAR(10) DEFAULT 'US',
    certification VARCHAR(10) DEFAULT 'NR',
    status VARCHAR(20) DEFAULT 'Released',
    averageRating DECIMAL(2,1) DEFAULT 0,
    totalRatings INTEGER DEFAULT 0,
    ratingFive INTEGER DEFAULT 0,
    ratingFour INTEGER DEFAULT 0,
    ratingThree INTEGER DEFAULT 0,
    ratingTwo INTEGER DEFAULT 0,
    ratingOne INTEGER DEFAULT 0,
    popularity REAL DEFAULT 0,
    viewCount INTEGER DEFAULT 0,
    watchlistCount INTEGER DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,
    createdBy INTEGER REFERENCES users(id),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Movie genres junction table
CREATE TABLE movie_genres (
    movieId INTEGER NOT NULL REFERENCES movies(id),
    genre VARCHAR(50) NOT NULL,
    PRIMARY KEY (movieId, genre)
);

-- Reviews table
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL REFERENCES users(id),
    movieId INTEGER NOT NULL REFERENCES movies(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    spoilers BOOLEAN DEFAULT FALSE,
    helpfulVotes INTEGER DEFAULT 0,
    totalVotes INTEGER DEFAULT 0,
    isEdited BOOLEAN DEFAULT FALSE,
    editedAt DATETIME,
    isActive BOOLEAN DEFAULT TRUE,
    moderationStatus VARCHAR(10) DEFAULT 'approved',
    moderationReason TEXT,
    flagSpam INTEGER DEFAULT 0,
    flagInappropriate INTEGER DEFAULT 0,
    flagSpoiler INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(movieId, userId) -- One review per user per movie
);

-- Watchlists table
CREATE TABLE watchlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL REFERENCES users(id),
    movieId INTEGER NOT NULL REFERENCES movies(id),
    status VARCHAR(20) DEFAULT 'want_to_watch',
    priority VARCHAR(10) DEFAULT 'medium',
    notes TEXT,
    dateWatched DATETIME,
    personalRating INTEGER CHECK (personalRating >= 1 AND personalRating <= 5),
    isPublic BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, movieId) -- One entry per user per movie
);

-- Create indexes for better performance
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_release_date ON movies(releaseDate);
CREATE INDEX idx_movies_rating ON movies(averageRating);
CREATE INDEX idx_movies_popularity ON movies(popularity);
CREATE INDEX idx_movies_tmdb ON movies(tmdbId);
CREATE INDEX idx_movies_imdb ON movies(imdbId);

CREATE INDEX idx_reviews_movie_created ON reviews(movieId, createdAt);
CREATE INDEX idx_reviews_user_created ON reviews(userId, createdAt);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_helpful ON reviews(helpfulVotes);

CREATE INDEX idx_watchlist_user_status ON watchlists(userId, status);
CREATE INDEX idx_watchlist_user_created ON watchlists(userId, createdAt);

CREATE INDEX idx_movie_genres_genre ON movie_genres(genre);

-- Insert sample data (optional)
INSERT INTO users (username, email, password, isAdmin) VALUES 
('admin', 'admin@moviehub.com', '$2a$12$samplehashedpassword', TRUE),
('john_doe', 'john@example.com', '$2a$12$samplehashedpassword', FALSE);

-- Note: The above schema was automatically created by Sequelize when you ran the server.
-- Your database file is located at: backend/database.sqlite