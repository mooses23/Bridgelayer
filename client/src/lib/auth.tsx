import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'firm_user';
  firmId?: number;
  firmName?: string;
}

interface AuthError extends Error {
  code?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, mode: 'bridgelayer' | 'firm') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFirmUser: boolean;
  oauthLogin: (provider: 'google' | 'microsoft' | 'github') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshToken = async (): Promise<string | null> => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) return null;

      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh })
      });

      if (!res.ok) throw new Error('Token refresh failed');

      const data = await res.json();
      localStorage.setItem('token', data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = localStorage.getItem('token');

    if (!token) {
      const newToken = await refreshToken();
      if (!newToken) throw new Error('No valid authentication');
      token = newToken;
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      const newToken = await refreshToken();
      if (!newToken) throw new Error('Authentication expired');

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        }
      });
    }

    return res;
  };

  useEffect(() => {
    // Check for existing auth token and validate it
    const validateAuth = async () => {
      try {
        const res = await fetchWithAuth('/api/auth/me');
        const data = await res.json();
        
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth validation failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, []);

  const login = async (email: string, password: string, mode: 'bridgelayer' | 'firm') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mode })
      });

      const data = await res.json();
      
      if (!res.ok) {
        const error = new Error(data.error || 'Login failed') as AuthError;
        error.code = data.code;
        throw error;
      }

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      setUser(data.user);
      navigate(data.redirect);
    } catch (error) {
      throw error;
    }
  };

  const oauthLogin = async (provider: 'google' | 'microsoft' | 'github') => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `/api/auth/${provider}`,
      `Login with ${provider}`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (popup) {
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === 'oauth_success') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          
          const { accessToken, refreshToken, user: userData } = event.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          setUser(userData);
          navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
        }
      };

      window.addEventListener('message', messageHandler);
    }
  };

  const logout = async () => {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      navigate('/login');
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFirmUser: user?.role === 'firm_user',
    oauthLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
