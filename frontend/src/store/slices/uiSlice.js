import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light',
    sidebarOpen: false,
    modals: {
      loginModal: false,
      registerModal: false,
      reviewModal: false,
      confirmModal: false
    },
    notifications: [],
    loading: {
      global: false,
      movies: false,
      reviews: false
    },
    searchQuery: '',
    filters: {
      genre: '',
      year: '',
      rating: '',
      sortBy: 'popularity'
    }
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    openModal: (state, action) => {
      const { modalName } = action.payload;
      state.modals[modalName] = true;
    },
    closeModal: (state, action) => {
      const { modalName } = action.payload;
      state.modals[modalName] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    addNotification: (state, action) => {
      const { id, type, message, duration } = action.payload;
      state.notifications.push({
        id: id || Date.now(),
        type: type || 'info',
        message,
        duration: duration || 5000,
        timestamp: Date.now()
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loading[component] = loading;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        genre: '',
        year: '',
        rating: '',
        sortBy: 'popularity'
      };
    },
    resetUI: (state) => {
      state.sidebarOpen = false;
      state.modals = {
        loginModal: false,
        registerModal: false,
        reviewModal: false,
        confirmModal: false
      };
      state.notifications = [];
      state.searchQuery = '';
    }
  }
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setComponentLoading,
  setSearchQuery,
  setFilters,
  clearFilters,
  resetUI
} = uiSlice.actions;

export default uiSlice.reducer;