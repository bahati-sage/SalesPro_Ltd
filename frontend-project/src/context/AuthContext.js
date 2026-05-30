import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const stored = JSON.parse(localStorage.getItem('srms_user'));
    if (stored && stored.token) {
      try {
        const { data } = await authAPI.getMe();
        setUser({ ...data, token: stored.token });
      } catch {
        localStorage.removeItem('srms_user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    const { data } = await authAPI.login({ username, password });
    localStorage.setItem('srms_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (fullName, username, password, confirmPassword) => {
    const { data } = await authAPI.register({ fullName, username, password, confirmPassword });
    localStorage.setItem('srms_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('srms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
