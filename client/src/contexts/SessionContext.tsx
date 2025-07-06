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
  // added mode and code for firm login
  login: (email: string, password: string, mode?: 'bridgelayer' | 'firm', code?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
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
        return true;
      } else {
        console.log('❌ No active session');
        // Clear user state if session check fails
        setUser(null);
        setAuthMethod(null);
        return false;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      // Clear user state on network/server errors
      setUser(null);
      setAuthMethod(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, mode: 'bridgelayer' | 'firm' = 'bridgelayer', code?: string): Promise<LoginResult> => {
    try {
      console.log('🔐 Attempting login with credentials: include');
      // include mode and code for firm login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mode, code }),
        credentials: 'include'
      });

      if (response.ok) {
        const loginData = await response.json();
        console.log("✅ Login successful, user:", loginData.user);
        // Set user data immediately
        setUser(loginData.user);
        setIsLoading(false);
        // Determine redirect path based on mode
        const redirectPath = mode === 'firm' ? `/tenant/${loginData.user.firmId}/dashboard` : '/admin';
        console.log("📤 Redirecting to:", redirectPath);
        return { success: true, redirectPath };
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