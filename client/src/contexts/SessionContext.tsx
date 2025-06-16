import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  firmId?: number;
  firm?: any;
}

interface LoginResult {
  success: boolean;
  redirectPath?: string;
}

interface SessionContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setToken: (token: string | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const loginData = await response.json();
        console.log("✅ Login redirectPath:", loginData.redirectPath);
        
        // Store JWT token in localStorage
        if (loginData.token) {
          localStorage.setItem('auth_token', loginData.token);
          setToken(loginData.token);
        }
        
        setUser(loginData.user);
        return {
          success: true,
          redirectPath: loginData.redirectPath
        };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkSession,
    setToken,
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