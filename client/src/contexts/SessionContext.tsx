import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthResult, OnboardingCode } from '@shared/types/auth-types';
import { mockLogin } from '../lib/auth-api';

interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, mode?: 'bridgelayer' | 'firm', code?: string, vertical?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  validateOnboardingCode: (code: string) => Promise<OnboardingCode>;
  refreshSession: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState({
    user: null as User | null,
    isLoading: true,
    error: null as string | null
  });

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Session check failed');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        user: data.user,
        error: null
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        error: 'Session check failed'
      }));
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    await checkSession();
  }, [checkSession]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Periodic session refresh
  useEffect(() => {
    const intervalId = setInterval(refreshSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [refreshSession]);

  const login = async (
    email: string,
    password: string,
    mode: 'bridgelayer' | 'firm' = 'bridgelayer',
    code?: string,
    vertical?: string
  ): Promise<AuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, mode, code, vertical })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        user: data.user,
        error: null
      }));

      // Handle automatic routing
      if (data.redirectPath) {
        navigate(data.redirectPath);
      } else if (data.user?.role === 'admin') {
        navigate('/admin');
      }

      return data;
    } catch (error) {
      // If backend is not available in development, try mock login
      if (import.meta.env.DEV && error instanceof Error && 
          (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        try {
          console.log('🔧 Backend not available, using mock login for development');
          const mockResponse = await mockLogin(email, password, vertical || mode);
          
          setState(prev => ({
            ...prev,
            user: mockResponse.data.user,
            error: null
          }));

          // Handle routing for mock login
          if (mockResponse.data.user?.role === 'admin') {
            navigate('/admin');
          }

          return mockResponse.data;
        } catch (mockError) {
          const message = mockError instanceof Error ? mockError.message : 'Mock login failed';
          setState(prev => ({
            ...prev,
            error: message,
            user: null
          }));
          throw mockError;
        }
      }

      // Regular error handling
      const message = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        error: message,
        user: null
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setState({
        user: null,
        isLoading: false,
        error: null
      });
      
      // Clear any persisted auth data
      localStorage.removeItem('lastRoute');
      sessionStorage.clear();
      
      navigate('/login');
    }
  };

  const validateOnboardingCode = async (code: string): Promise<OnboardingCode> => {
    const response = await fetch('/api/auth/validate-onboarding-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid onboarding code');
    }

    return response.json();
  };

  const value = {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    validateOnboardingCode,
    refreshSession,
    checkSession
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}