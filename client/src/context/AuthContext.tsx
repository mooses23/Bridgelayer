import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  role: string;
  email: string;
  firm_id?: number;
}

interface Firm {
  id: number;
  onboarded: boolean;
  jurisdiction: string;
}

interface AuthContextType {
  user: User | null;
  firm: Firm | null;
  loading: boolean;
  setSession: (userData: { user: User; firm?: Firm }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage or API
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First try to get from localStorage
        const storedAuth = localStorage.getItem('firmsync_auth');
        if (storedAuth) {
          const { user: storedUser, firm: storedFirm } = JSON.parse(storedAuth);
          setUser(storedUser);
          setFirm(storedFirm);
        }

        // Then verify with server
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          
          // Transform session data to match our context structure
          const authUser: User = {
            role: sessionData.role,
            email: sessionData.email,
            firm_id: sessionData.firmId
          };

          // If user has a firm, try to fetch firm details
          let authFirm: Firm | null = null;
          if (sessionData.firmId) {
            try {
              const firmResponse = await fetch('/api/firm');
              if (firmResponse.ok) {
                const firmData = await firmResponse.json();
                authFirm = {
                  id: firmData.id,
                  onboarded: firmData.onboarded || false,
                  jurisdiction: firmData.jurisdiction || 'Unknown'
                };
              }
            } catch (error) {
              console.warn('Could not fetch firm details:', error);
            }
          }

          setUser(authUser);
          setFirm(authFirm);

          // Persist to localStorage
          localStorage.setItem('firmsync_auth', JSON.stringify({
            user: authUser,
            firm: authFirm
          }));
        } else {
          // Clear invalid session data
          setUser(null);
          setFirm(null);
          localStorage.removeItem('firmsync_auth');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
        setFirm(null);
        localStorage.removeItem('firmsync_auth');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setSession = (userData: { user: User; firm?: Firm }) => {
    setUser(userData.user);
    setFirm(userData.firm || null);
    
    // Persist to localStorage
    localStorage.setItem('firmsync_auth', JSON.stringify({
      user: userData.user,
      firm: userData.firm || null
    }));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      setFirm(null);
      localStorage.removeItem('firmsync_auth');
    }
  };

  const value: AuthContextType = {
    user,
    firm,
    loading,
    setSession,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading FirmSync...</p>
          </div>
        </div>
      ) : (
        children
      )}
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