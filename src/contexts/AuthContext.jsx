// ./src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import * as usersService from '../utilities/users-service.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const user = usersService.getUser();
    setUser(user);
    setLoading(false);
  }, []);

  const signUp = async (userData) => {
    try {
      const user = await usersService.signUp(userData);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const user = await usersService.login(credentials);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    usersService.logOut();
    setUser(null);
  };

  const value = {
    user,
    signUp,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}