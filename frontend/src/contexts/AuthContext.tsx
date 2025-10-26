import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService from '../services/authService.ts';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      if (authService.isAuthenticated()) {
        // In a real app, you would fetch user details from the API
        // For now, we'll just get the user info from the token
        const userData = authService.getCurrentUser();
        if (userData) {
          // We need to fetch full user details from the backend
          try {
            // Since we don't have a route to get user by ID yet, we'll just create a partial user object
            setUser({
              id: userData.id,
              username: userData.username,
              email: '', // We'll need to fetch this from the backend
              role: '' // We'll need to fetch this from the backend
            });
          } catch (error) {
            console.error('Error fetching user details:', error);
            // If there's an error, clear the token and logout
            authService.logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const result = await authService.login({ username, password });
      setUser(result.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const result = await authService.register({ username, email, password });
      setUser(result.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};