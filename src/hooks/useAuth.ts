import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginService, register as registerService, logout as logoutService } from '../services/authService';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Aquí fetch user from /auth/me si el backend lo soporta
          setIsAuthenticated(true);
          // Temporal: mock user
          setUser({ id: '1', name: 'User', email: 'user@example.com' });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginService(email, password);
    setUser({ id: data.userId || '1', name: data.name || 'User', email });
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await registerService(email, password, name);
    setUser({ id: data.userId || '1', name, email });
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
</xai:function_call.




<xai:function_call name="edit_file">
<parameter name="path">c:/Users/sebas/Documents/GitHub/PetMatch/TODO.md
