import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import reducers
import authReducer from './slices/authSlice';
import movieReducer from './slices/movieSlice';
import reviewReducer from './slices/reviewSlice';
import watchlistReducer from './slices/watchlistSlice';
import uiReducer from './slices/uiSlice';
import themeReducer from './slices/themeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  movies: movieReducer,
  reviews: reviewReducer,
  watchlist: watchlistReducer,
  ui: uiReducer,
  theme: themeReducer
});

const persistConfig = {
  key: 'movie-review-platform',
  version: 1,
  storage,
  whitelist: ['auth'] // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// For JavaScript usage - these would be types in TypeScript
export default store;