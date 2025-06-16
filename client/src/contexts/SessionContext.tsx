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
      console.log('🔍 Checking session with credentials: include');
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('📡 Session check response:', response.status, response.statusText);
      
      if (response.ok) {
        const sessionData = await response.json();
        console.log('✅ Session data received:', sessionData);
        setUser(sessionData.user);
      } else {
        console.log('❌ No active session');
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      console.log('🔐 Attempting login with credentials: include');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const loginData = await response.json();
        console.log("✅ Login successful, redirectPath:", loginData.redirectPath);
        console.log("🍪 Response headers:", [...response.headers.entries()]);
        
        setUser(loginData.user);
        
        // Force session check after login to verify cookie persistence
        setTimeout(() => checkSession(), 100);
        
        return {
          success: true,
          redirectPath: loginData.redirectPath
        };
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
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