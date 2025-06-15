import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'firm_user' | 'firm_owner';
  firmId?: number;
  firm?: {
    id: number;
    name: string;
    slug: string;
    plan: string;
    status: string;
    onboarded?: boolean;
  };
}

interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      
      // Check localStorage for remember me token
      const rememberToken = localStorage.getItem('remember_token');
      if (rememberToken) {
        const response = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: rememberToken }),
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          return;
        } else {
          // Invalid token, remove it
          localStorage.removeItem('remember_token');
        }
      }

      // Check session cookie
      const sessionResponse = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      
      if (sessionResponse.ok) {
        const userData = await sessionResponse.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        if (rememberMe && userData.rememberToken) {
          localStorage.setItem('remember_token', userData.rememberToken);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('remember_token');
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: SessionContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};