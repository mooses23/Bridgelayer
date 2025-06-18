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
  authMethod: 'session' | 'jwt' | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setToken: (token: string | null) => void;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<'session' | 'jwt' | null>(null);

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
        setAuthMethod(sessionData.authMethod || 'session');
      } else {
        console.log('❌ No active session');
        // Don't clear user immediately on session check failure during page loads
        // The user might be logged in but session validation is having timing issues
        if (!user) {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      if (!user) {
        setUser(null);
      }
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
        
        // Set user data immediately from login response
        setUser(loginData.user);
        setIsLoading(false);
        
        // Don't check session immediately - we have the user data already
        console.log("📤 Login result:", { success: true, redirectPath: loginData.redirectPath });
        
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
      setAuthMethod(null);
    }
  };

  const refreshSession = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        await checkSession();
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  };

  useEffect(() => {
    // Initial session check with retry mechanism
    const initializeSession = async () => {
      let retries = 3;
      while (retries > 0) {
        try {
          await checkSession();
          break;
        } catch (error) {
          retries--;
          if (retries > 0) {
            console.log(`Session check failed, retrying... (${retries} left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    };
    
    initializeSession();
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    authMethod,
    login,
    logout,
    checkSession,
    setToken,
    refreshSession,
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