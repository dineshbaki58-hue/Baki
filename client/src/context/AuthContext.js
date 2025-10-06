import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, logout, clearErrors } from '../store/actions/authActions';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user, token, error } = useSelector(state => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        // Token exists, verify it's still valid
        // In a real app, you'd verify the token with the server
        setIsInitialized(true);
      } else {
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setIsInitialized(true);
    }
  };

  const handleLogin = async (email, password) => {
    const result = await dispatch(login(email, password));
    return result;
  };

  const handleRegister = async (userData) => {
    const result = await dispatch(register(userData));
    return result;
  };

  const handleLogout = () => {
    dispatch(logout());
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('user');
  };

  const handleClearErrors = () => {
    dispatch(clearErrors());
  };

  const value = {
    isAuthenticated,
    isLoading: isLoading || !isInitialized,
    user,
    token,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearErrors: handleClearErrors
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};