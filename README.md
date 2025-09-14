# MovieHub - Full-Stack Movie Review Platform

A modern, full-stack web application for discovering, reviewing, and managing your favorite movies. Built with React, Node.js, and SQLite, featuring a sleek dark mode interface and comprehensive movie database.

## 🎬 Features

- **Movie Discovery**: Browse a curated collection of 20+ popular movies from classics to modern hits
- **User Authentication**: Secure registration and login system with JWT tokens
- **Movie Reviews**: Write detailed reviews with ratings, titles, and comprehensive content
- **Personal Watchlist**: Save movies to watch later and manage your viewing preferences
- **Search & Filter**: Find movies by title, genre, director, or cast members
- **Responsive Design**: Beautiful dark/light theme with mobile-first responsive layout
- **TMDB Integration**: High-quality movie posters and metadata from The Movie Database
- **User Profiles**: Personal dashboards with review history and statistics

## 🏗️ Tech Stack

### Frontend
- **React 18** with modern hooks and functional components
- **Redux Toolkit** for state management
- **Tailwind CSS** with dark mode support
- **React Router** for navigation
- **Responsive Design** optimized for all screen sizes

### Backend  
- **Node.js** with Express.js framework
- **SQLite** database with Sequelize ORM
- **JWT Authentication** with bcrypt password hashing
- **RESTful API** design patterns
- **CORS** enabled for cross-origin requests

### Database
- **Sequelize Models**: User, Movie, Review, Watchlist, Genre relationships
- **Data Validation**: Comprehensive field validation and constraints
- **Foreign Key Relationships**: Proper relational database design
- **Automatic Timestamps**: Created/updated tracking for all records

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd movieHub2
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up environment variables**

Backend (`.env` in `/backend/`):
```env
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
DATABASE_URL=./database.sqlite
TMDB_API_KEY=your_tmdb_api_key_here
```

Frontend (`.env` in `/frontend/`):
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
```

5. **Initialize the database**
```bash
cd backend
node server.js
```
The database will be automatically created with sample data on first run.

6. **Seed the database with movies**
```bash
# Load 20 popular movies with sample reviews
node scripts/reseed-movies.js
```

7. **Start the development servers**
```bash
# Terminal 1: Start backend server (from /backend)
npm start

# Terminal 2: Start frontend (from /frontend) 
npm start
```

8. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 📱 Usage Guide

### Getting Started
1. **Register an Account**: Create your profile with username, email, and password
2. **Browse Movies**: Explore the movie catalog with posters and ratings
3. **View Details**: Click any movie for cast, plot, ratings, and reviews
4. **Write Reviews**: Share your thoughts with title, content, and star ratings
5. **Build Watchlist**: Save movies to watch later

### Movie Reviews
- **Star Ratings**: Rate movies from 1-5 stars
- **Review Titles**: Write compelling headlines for your reviews
- **Detailed Content**: Share comprehensive thoughts (minimum 10 characters)
- **Review Management**: Edit your reviews and track helpful votes

### Watchlist Features
- **Add to Watchlist**: Save movies for later viewing
- **Remove Items**: Clean up your list as you watch movies
- **Personal Dashboard**: View your saved movies at a glance

## 🗄️ Database Schema

### Core Models

**Movies**
- id, title, overview, releaseDate, genres
- director, cast, runtime, posterUrl, backdropUrl
- tmdbId, averageRating, totalRatings
- Validation: Required title/overview, rating constraints

**Users** 
- id, username, email, passwordHash
- profilePicture, reviewCount, watchlistCount
- JWT token authentication

**Reviews**
- id, userId, movieId, rating (1-5)
- title, content, spoilers flag
- helpfulVotes, moderationStatus
- Validation: Required title/content, rating constraints

**Watchlist**
- id, userId, movieId, dateAdded
- Unique constraint: One entry per user-movie pair

### Database Seeding
The application includes a comprehensive movie seeding script with:
- 20 popular movies from various genres and decades
- Proper TMDB poster URLs and metadata  
- Sample reviews with realistic titles and content
- All data validated against schema constraints

## 🛠️ Development

### Project Structure
```
movieHub2/
├── backend/
│   ├── config/database.js      # Sequelize configuration
│   ├── models/                 # Database models
│   ├── routes/                 # API endpoints
│   ├── middleware/auth.js      # JWT authentication
│   ├── scripts/                # Database utilities
│   └── server.js               # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Route components
│   │   ├── store/              # Redux store & slices
│   │   └── services/api.js     # API client
│   └── public/                 # Static assets
└── README.md
```

### Key API Endpoints
```
Authentication:
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile

Movies:
GET  /api/movies           # List all movies
GET  /api/movies/:id       # Get movie details
GET  /api/movies/search    # Search movies

Reviews:
GET  /api/reviews/movie/:id  # Get movie reviews
POST /api/reviews            # Create review
PUT  /api/reviews/:id        # Update review
DELETE /api/reviews/:id      # Delete review

Watchlist:
GET  /api/watchlist          # Get user watchlist
POST /api/watchlist          # Add to watchlist
DELETE /api/watchlist/:id    # Remove from watchlist
```

### Database Management

**Reseeding Database**
```bash
cd backend
node scripts/reseed-movies.js
```
This script:
- Clears existing movies and reviews
- Loads 20 curated movies with TMDB data
- Creates sample reviews with proper validation
- Maintains referential integrity

**Schema Updates**
- Models auto-sync on server start in development
- Use Sequelize migrations for production changes
- Backup database before major updates

## 🎨 Customization

### Styling
- **Tailwind CSS**: Modify `tailwind.config.js` for theme changes
- **Dark Mode**: Toggle implemented with system preference detection
- **Components**: Styled with consistent design system

### Movie Data
- **Add Movies**: Update seeding script with new entries
- **TMDB Integration**: Fetch latest posters and metadata
- **Custom Fields**: Extend movie model as needed

### Features
- **Review System**: Customize rating scales and validation
- **User Profiles**: Add avatars, bio, preferences
- **Social Features**: Implement following, comments, sharing

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build production bundle: `npm run build`
2. Deploy `build/` directory to hosting platform
3. Set environment variables in platform dashboard

### Backend (Railway/Heroku)
1. Configure production environment variables
2. Update database connection for production
3. Deploy with automatic builds from repository

### Database (Production)
- Consider PostgreSQL for production instead of SQLite
- Set up database backups and monitoring
- Configure connection pooling for scale

## 📊 Features Implemented

- ✅ User authentication with JWT tokens
- ✅ Movie catalog with 20+ seeded movies
- ✅ Comprehensive review system with validation
- ✅ Personal watchlist functionality
- ✅ Dark/light theme toggle
- ✅ Responsive mobile-first design
- ✅ Search and filtering capabilities
- ✅ TMDB integration for movie data
- ✅ Database reseeding scripts
- ✅ Error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices and hooks patterns
- Use TypeScript for type safety (if migrating)
- Write descriptive commit messages
- Test API endpoints with proper error handling
- Ensure mobile responsiveness

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The Movie Database (TMDB)** for movie data and poster images
- **React & Redux** communities for excellent documentation
- **Tailwind CSS** for the utility-first CSS framework
- **Sequelize** for the robust ORM functionality

## 📞 Support

- 📧 Email: sarrafpradeep857@gmail.com
- 📍 Location: Tamil Nadu, India, Thiruvallur 601103
- 🐛 Issues: Create GitHub issues for bugs or feature requests

---

**Ready to discover your next favorite movie? Register an account and start exploring!** 🎬✨
