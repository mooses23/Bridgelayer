import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  firm_id?: string;
}

interface Firm {
  id: string;
  name: string;
  onboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  firm: Firm | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);

          // Fetch firm data if user has firmId
          if (userData.firmId) {
            const firmResponse = await fetch('/api/firm', {
              credentials: 'include'
            });
            if (firmResponse.ok) {
              const firmData = await firmResponse.json();
              setFirm(firmData);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const userData = await response.json();
    setUser(userData);

    // Fetch firm data if user has firmId
    if (userData.firmId) {
      try {
        const firmResponse = await fetch('/api/firm', {
          credentials: 'include'
        });
        if (firmResponse.ok) {
          const firmData = await firmResponse.json();
          setFirm(firmData);
        }
      } catch (error) {
        console.error('Error fetching firm:', error);
      }
    }
  };

  const logout = () => {
    fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    setFirm(null);
  };

  return (
    <AuthContext.Provider value={{ user, firm, login, logout, loading }}>
      {children}
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