import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('taskplanet_token') || null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Fetch logged in user on mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (emailOrUsername, password) => {
    const data = await api.login({ emailOrUsername, password });
    localStorage.setItem('taskplanet_token', data.token);
    setToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      bio: data.bio,
    });
    setAuthModalOpen(false);
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('taskplanet_token', data.token);
    setToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      bio: data.bio,
    });
    setAuthModalOpen(false);
    return data;
  };

  const quickDemoLogin = async (email) => {
    return await login(email, 'Password123!');
  };

  const logout = () => {
    localStorage.removeItem('taskplanet_token');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
