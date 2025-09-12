# 🎬 Movie Review Platform

A modern, immersive full-stack movie review platform built with React, Node.js, Express, and MongoDB. Experience cinema culture with cutting-edge UI design, 3D visual elements, and a comprehensive movie discovery and review system.

##  Features

###  Visual & User Experience
- **Modern Dark/Light Theme System**: Seamless theme switching with persistent user preferences
- **3D Cinema Elements**: Immersive 3D movie reels, film strips, and floating cinema objects
- **Glass Morphism Design**: Contemporary UI with translucent effects and smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with adaptive layouts
- **Micro-interactions**: Smooth hover effects, transitions, and animated components

###  Core Features
- **Movie Discovery**: Browse and search movies with advanced filtering and modern card layouts
- **User Reviews**: Write, read, and rate movie reviews with enhanced UI components
- **Personal Watchlist**: Track movies you want to watch with status management
- **User Authentication**: Secure registration and login system with modern forms
- **Real-time Updates**: Live synchronization of reviews, ratings, and watchlist changes

###  Advanced Features
- **Review Voting**: Mark reviews as helpful or not helpful with instant feedback
- **Movie Ratings**: Aggregate rating system with detailed statistics and visual indicators
- **User Profiles**: Personalized user profiles with review history and enhanced layouts
- **Search & Filter**: Advanced search with genre, year, rating filters, and instant results
- **Admin Panel**: Administrative controls for managing movies and users
- **Theme Persistence**: Automatic theme detection and localStorage persistence
- **Visual Feedback**: Toast notifications, loading states, and error handling

## 🛠️ Tech Stack

### Frontend
- **React** - UI library with hooks and functional components
- **Redux Toolkit** - State management with theme persistence and async thunks
- **React Router** - Navigation with protected routes
- **React Query** - Data fetching and caching with optimistic updates
- **Tailwind CSS** - Modern styling with dark mode support and custom animations
- **CSS3** - Advanced 3D transforms, keyframe animations, and glass morphism effects
- **Axios** - HTTP client with interceptors and error handling
- **React Hook Form** - Form handling with validation
- **React Hot Toast** - Modern toast notifications with theme support
- **React Icons** - Comprehensive icon library with Lucide React icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

##  Modern UI Features

### Dark/Light Theme System
- **Smart Theme Detection**: Automatically detects user's system preference on first visit
- **Persistent Storage**: Theme choice saved in localStorage for consistent experience
- **Smooth Transitions**: Seamless color transitions when switching themes
- **Redux Integration**: Global theme state management with [`themeSlice.js`](frontend/src/store/slices/themeSlice.js)
- **Component Support**: All components optimized for both light and dark modes

### 3D Cinema Elements
- **Floating Movie Reels**: Large 3D cinema reels with realistic rotation animations
- **Animated Film Strips**: Vertical film strips with authentic perforations and sway motion
- **3D Icon Cubes**: Rotating cubes with play icons and gradient effects
- **Camera Elements**: 3D tilting camera icons with perspective depth
- **Dynamic Particles**: Floating particles that drift across the screen
- **CSS3 Transforms**: Advanced perspective transforms and GPU-accelerated animations

### Glass Morphism Design
- **Translucent Cards**: Modern frosted glass effect on components
- **Backdrop Blur**: Professional blur effects with subtle transparency
- **Contemporary Typography**: Modern font hierarchies and spacing
- **Micro-interactions**: Smooth hover effects and state transitions
- **Visual Feedback**: Loading states, success indicators, and error messages

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

### Optional (for full functionality):
- **MongoDB** (local installation or MongoDB Atlas) - [Download here](https://www.mongodb.com/try/download/community)

> **Note**: The application can run without MongoDB, but some features (authentication, reviews, watchlists) will be unavailable until MongoDB is installed and running.

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/movie-review-platform.git
cd movie-review-platform
```

### 2. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Install root dependencies
npm run install-deps
```

Or install manually:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. MongoDB Setup (Optional but Recommended)

#### Option A: Install MongoDB Locally
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Follow the installation instructions for your operating system
3. Start MongoDB service:
   - **Windows**: MongoDB should start automatically, or run `net start MongoDB`
   - **macOS**: Run `brew services start mongodb/brew/mongodb-community`
   - **Linux**: Run `sudo systemctl start mongod`

#### Option B: Use MongoDB Atlas (Cloud)
1. Sign up for free at: https://www.mongodb.com/atlas
2. Create a cluster and get your connection string
3. Update the `MONGODB_URI` in your `.env` file

#### Option C: Run Without MongoDB
The application will run without MongoDB but with limited functionality. A warning banner will inform users about unavailable features.

### 4. Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - MongoDB Atlas (or use local: mongodb://localhost:27017/movie_review_platform)
MONGODB_URI=mongodb+srv://sarrafpradeep857_db_user:SrGyPhrAA345D7Xt@moviesystem.b7dcqkt.mongodb.net/movie_review_platform

# JWT Secret (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:3000

# Optional: TMDB API for movie data
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

#### Frontend Environment Variables (Optional)
Create a `.env` file in the `frontend` directory if needed:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Make sure MongoDB is running on your system:

- **Local MongoDB**: Start your local MongoDB service
- **MongoDB Atlas**: Use the connection string in your `.env` file

The application will automatically create the necessary collections on first run.

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: "Could not find a required file. Name: index.html"
**Solution**: The React app needs an `index.html` file in the `frontend/public` directory. This has been created automatically, but if missing, create it with basic HTML structure.

#### Issue: MongoDB Connection Error
**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:
1. **Install MongoDB** (Recommended):
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation instructions for your OS
   - Start the MongoDB service

2. **Use the app without MongoDB**:
   - The application will continue running with limited functionality
   - A warning banner will appear showing which features are unavailable
   - API endpoints requiring database will return helpful error messages

#### Issue: npm run dev fails
**Solutions**:
1. Make sure all dependencies are installed: `npm run install-deps`
2. Check that both `frontend/package.json` and `backend/package.json` exist
3. Verify Node.js version (v16 or higher required)

#### Issue: Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000` or `:::3000`

**Solution**: 
- Change ports in your `.env` file, or
- Kill existing processes: `npx kill-port 3000 5000`

### MongoDB Quick Setup

#### Windows
1. Download MongoDB Community Server
2. Run installer with default settings
3. MongoDB should start automatically

#### macOS (with Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```
### 5. Start the Application

#### Development Mode
Run both frontend and backend simultaneously:

```bash
npm run dev
```

#### Run Separately
```bash
# Backend (from root directory)
npm run server

# Frontend (from root directory)  
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "john@example.com",
  "password": "Password123"
}
```

### Movie Endpoints

#### Get Movies
```http
GET /api/movies?page=1&limit=20&genre=Action&sortBy=popularity
```

#### Get Single Movie
```http
GET /api/movies/:id
```

#### Add Movie (Admin Only)
```http
POST /api/movies
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Movie Title",
  "overview": "Movie description",
  "releaseDate": "2024-01-01",
  "director": "Director Name",
  "genres": ["Action", "Drama"]
}
```

### Review Endpoints

#### Get Movie Reviews
```http
GET /api/reviews/movie/:movieId?page=1&limit=10&sortBy=helpful
```

#### Submit Review
```http
POST /api/reviews/movie/:movieId
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "title": "Great movie!",
  "content": "This movie was fantastic...",
  "spoilers": false
}
```

### Watchlist Endpoints

#### Get User Watchlist
```http
GET /api/watchlist/:userId?status=want_to_watch
Authorization: Bearer <token>
```

#### Add to Watchlist
```http
POST /api/watchlist/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "movieId": "movie_id_here",
  "status": "want_to_watch",
  "priority": "high"
}
```

## 🗂️ Project Structure

```
movie-review-platform/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Review.js
│   │   └── Watchlist.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── reviews.js
│   │   ├── users.js
│   │   └── watchlist.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.js
│   │   │   │   └── Footer.js
│   │   │   ├── movies/
│   │   │   │   ├── MovieCard.js
│   │   │   │   ├── MovieDetail.js
│   │   │   │   └── MovieList.js
│   │   │   ├── ui/
│   │   │   │   ├── ThemeToggle.js         # 🌙 Dark/Light theme switcher
│   │   │   │   ├── CSS3DElements.js       # 🎬 3D cinema objects
│   │   │   │   ├── LoadingSpinner.js
│   │   │   │   └── Button.js
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.js
│   │   │   │   └── RegisterForm.js
│   │   │   └── common/
│   │   │       └── DatabaseStatus.js
│   │   ├── pages/
│   │   │   ├── HomePage.js               # 🎨 Enhanced with 3D elements
│   │   │   ├── MovieDetailPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── WatchlistPage.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   └── slices/
│   │   │       ├── themeSlice.js         # 🎨 Theme state management
│   │   │       ├── authSlice.js
│   │   │       ├── movieSlice.js
│   │   │       └── watchlistSlice.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css                     # 🌈 Enhanced with 3D animations
│   ├── package.json
│   └── tailwind.config.js                # 🌙 Dark mode configuration
├── package.json
└── README.md
```

## 🎨 Database Schema

### User Collection
```javascript
{
  username: String, // unique
  email: String, // unique
  password: String, // hashed
  profilePicture: String,
  bio: String,
  favoriteGenres: [String],
  isAdmin: Boolean,
  reviewCount: Number,
  watchlistCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Movie Collection
```javascript
{
  title: String,
  overview: String,
  genres: [String],
  releaseDate: Date,
  director: String,
  cast: [{ name: String, character: String }],
  posterUrl: String,
  averageRating: Number,
  totalRatings: Number,
  runtime: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Collection
```javascript
{
  user: ObjectId, // ref: User
  movie: ObjectId, // ref: Movie
  rating: Number, // 1-5
  title: String,
  content: String,
  spoilers: Boolean,
  helpfulVotes: Number,
  totalVotes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Express-validator for data validation
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Protection** - Cross-origin resource sharing configuration
- **Helmet.js** - Security headers

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Create a new application on your platform
2. Set environment variables in the dashboard
3. Connect your GitHub repository
4. Deploy the backend folder

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `build` folder to your hosting platform

### Environment Variables for Production

Make sure to set these environment variables in production:

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=your_frontend_domain
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: Additional rate limiting for security

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **CORS Issues**
   - Verify `CLIENT_URL` in backend `.env`
   - Check if frontend is running on the correct port

3. **JWT Token Issues**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration settings

4. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check Node.js version compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Movie Review Platform Team** - [GitHub Profile](https://github.com/your-username)

## 🙏 Acknowledgments

- TMDB API for movie data
- React community for excellent documentation
- MongoDB team for the database
- All contributors and beta testers

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Documentation: [Wiki](https://github.com/pradip-1111/movie-review-platform/wiki)

## 🎯 Recent Accomplishments

This movie review platform has been enhanced with cutting-edge features and modern design patterns:

### ✅ Completed Features
- **Complete Theme System**: Full dark/light mode implementation with Redux state management
- **3D Visual Elements**: Immersive cinema-themed 3D objects and animations
- **Modern UI Redesign**: Contemporary glass morphism design with smooth transitions
- **Performance Optimizations**: Fixed all major bugs and runtime errors
- **Enhanced User Experience**: Improved watchlist functionality and review system
- **Responsive Design**: Optimized layouts for all device sizes

### 🚀 Technical Achievements
- **Zero Critical Bugs**: All reported issues resolved and tested
- **Modern Architecture**: Redux Toolkit with async thunks and persistence
- **Advanced CSS**: 3D transforms, keyframe animations, and GPU optimization
- **Theme Persistence**: Smart localStorage integration with system preference detection
- **Code Quality**: ESLint compliance and clean component architecture

### 🎨 Visual Highlights
- **Cinema Atmosphere**: Floating movie reels, film strips, and 3D camera elements
- **Smooth Animations**: Multiple animation layers with organic movement patterns
- **Professional Design**: Contemporary typography, spacing, and visual hierarchy
- **Accessibility**: Proper contrast ratios and semantic markup in both themes

The platform now rivals modern streaming services in both functionality and visual appeal, providing users with an immersive, professional movie review experience.

---

**Happy Movie Reviewing! 🎬**
