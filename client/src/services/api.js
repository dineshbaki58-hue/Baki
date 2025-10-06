import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://your-production-api.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Redirect to login screen
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getProfile: () => 
    api.get('/auth/me'),
  
  updateProfile: (userData) => 
    api.put('/auth/profile', userData),
};

// User API
export const userAPI = {
  getProfile: () => 
    api.get('/users/profile'),
  
  updateProfile: (userData) => 
    api.put('/users/profile', userData),
  
  uploadProfileImage: (imageData) => 
    api.post('/users/profile-image', imageData),
  
  updateFCMToken: (token) => 
    api.post('/users/fcm-token', { token }),
  
  getStats: () => 
    api.get('/users/stats'),
  
  deleteAccount: (password) => 
    api.delete('/users/account', { data: { password } }),
};

// Workout API
export const workoutAPI = {
  getWorkouts: (params = {}) => 
    api.get('/workouts', { params }),
  
  getFeaturedWorkouts: () => 
    api.get('/workouts/featured'),
  
  getWorkout: (id) => 
    api.get(`/workouts/${id}`),
  
  rateWorkout: (id, rating) => 
    api.post(`/workouts/${id}/rate`, { rating }),
  
  getCategories: () => 
    api.get('/workouts/categories/list'),
  
  getWorkoutsByCategory: (category, params = {}) => 
    api.get(`/workouts/category/${category}`, { params }),
  
  searchWorkouts: (query, params = {}) => 
    api.get(`/workouts/search/${query}`, { params }),
};

// Nutrition API
export const nutritionAPI = {
  generatePlan: (planData) => 
    api.post('/nutrition/generate', planData),
  
  getPlans: () => 
    api.get('/nutrition/plans'),
  
  getPlan: (id) => 
    api.get(`/nutrition/plans/${id}`),
  
  updatePlan: (id, planData) => 
    api.put(`/nutrition/plans/${id}`, planData),
  
  deletePlan: (id) => 
    api.delete(`/nutrition/plans/${id}`),
  
  getRecommendations: () => 
    api.get('/nutrition/recommendations'),
};

// Progress API
export const progressAPI = {
  logProgress: (progressData) => 
    api.post('/progress/log', progressData),
  
  getProgress: (params = {}) => 
    api.get('/progress', { params }),
  
  getAnalytics: (period = 'month') => 
    api.get('/analytics/user', { params: { period } }),
  
  getChartData: (metric, period = 'month') => 
    api.get(`/progress/charts/${metric}`, { params: { period } }),
};

// Subscription API
export const subscriptionAPI = {
  createCustomer: (customerData) => 
    api.post('/subscriptions/create-customer', customerData),
  
  createSubscription: (subscriptionData) => 
    api.post('/subscriptions/create-subscription', subscriptionData),
  
  getStatus: () => 
    api.get('/subscriptions/status'),
  
  cancelSubscription: () => 
    api.post('/subscriptions/cancel'),
  
  reactivateSubscription: () => 
    api.post('/subscriptions/reactivate'),
  
  getPaymentMethods: () => 
    api.get('/subscriptions/payment-methods'),
  
  createPaymentIntent: (paymentData) => 
    api.post('/subscriptions/create-payment-intent', paymentData),
};

// Analytics API
export const analyticsAPI = {
  getUserAnalytics: (period = 'month') => 
    api.get('/analytics/user', { params: { period } }),
  
  getWorkoutAnalytics: (period = 'month') => 
    api.get('/analytics/workouts', { params: { period } }),
  
  getNutritionAnalytics: (period = 'month') => 
    api.get('/analytics/nutrition', { params: { period } }),
};

export default api;