import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Firm } from '@shared/types/schema';
import { authApi } from '@/lib/auth-api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  firm: Firm | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, mode?: 'bridgelayer' | 'firm', code?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const refreshSession = async () => {
    try {
      const { data } = await authApi.get('/auth/session');
      if (data.user) {
        setUser(data.user);
        setFirm(data.firm || null);
        setIsAuthenticated(true);
        setError(null);
      } else {
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setFirm(null);
    setIsAuthenticated(false);
    setError(null);
    authApi.clearToken();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshSession();
      } catch (err) {
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    mode: 'bridgelayer' | 'firm' = 'bridgelayer',
    code?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await authApi.post('/auth/login', {
        email,
        password,
        mode,
        code
      });

      setUser(data.user);
      setFirm(data.firm || null);
      setIsAuthenticated(true);
      
      // Update API client token
      if (data.accessToken) {
        authApi.setToken(data.accessToken);
      }

      // Handle automatic routing
      const redirectPath = data.redirectPath || (data.user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(redirectPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      handleLogout();
      navigate('/login');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        firm,
        loading,
        error,
        login,
        logout,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
