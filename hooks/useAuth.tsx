
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { Militar } from '../types';
import { api } from '../services/mockApi';

interface AuthContextType {
  user: Militar | null;
  isLoading: boolean;
  login: (cpf: string, pin: string) => Promise<Militar | null>;
  logout: () => void;
  updateUser: (updatedUserData: Militar) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Militar | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('sarc_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('sarc_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (cpf: string, pin: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await api.login(cpf, pin);
      if (loggedInUser) {
        localStorage.setItem('sarc_user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return loggedInUser;
      }
      return null;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sarc_user');
  }, []);

  const updateUser = useCallback((updatedUserData: Militar) => {
    setUser(updatedUserData);
    localStorage.setItem('sarc_user', JSON.stringify(updatedUserData));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};