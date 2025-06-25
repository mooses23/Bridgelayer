import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import type { 
  User, 
  AuthResult, 
  OnboardingCode,
  UserRole 
} from '@shared/types/auth-types';

interface UseSessionState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  authMethod: 'session' | 'jwt' | null;
}

interface UseSessionHook {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, mode?: 'bridgelayer' | 'firm', code?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  validateOnboardingCode: (code: string) => Promise<OnboardingCode>;
  refreshSession: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const ADMIN_ROLES: UserRole[] = ['platform_admin', 'admin', 'super_admin'];
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useSession(): UseSessionHook {
  const navigate = useNavigate();
  const [state, setState] = useState<UseSessionState>({
    user: null,
    isLoading: true,
    error: null,
    isAdmin: false,
    authMethod: null
  });

  // Check if user is admin based on role
  const checkIsAdmin = useCallback((user: User | null): boolean => {
    return user ? ADMIN_ROLES.includes(user.role) : false;
  }, []);

  // Handle automatic admin routing
  useEffect(() => {
    if (state.user && state.isAdmin && window.location.pathname === '/') {
      navigate('/admin');
    }
  }, [state.user, state.isAdmin, navigate]);

  // Session refresh logic
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Session refresh failed');
      }

      const data = await response.json();
      const isAdmin = checkIsAdmin(data.user);
      
      setState(prev => ({
        ...prev,
        user: data.user,
        isAdmin,
        authMethod: data.authMethod
      }));

      return data.user;
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        isAdmin: false,
        error: 'Session refresh failed'
      }));
      throw error;
    }
  }, [checkIsAdmin]);

  // Periodic session check
  useEffect(() => {
    const checkInterval = setInterval(refreshSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(checkInterval);
  }, [refreshSession]);

  // Initial session check on page load
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      await refreshSession();
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [refreshSession]);

  // Run initial session check
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Enhanced login with onboarding support
  const login = useCallback(async (
    email: string, 
    password: string, 
    mode: 'bridgelayer' | 'firm' = 'bridgelayer',
    code?: string
  ): Promise<AuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, mode, code })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data: AuthResult = await response.json();      const isAdmin = checkIsAdmin(data.user || null);
      
      setState(prev => ({
        ...prev,
        user: data.user || null,
        isAdmin,
        error: null,
        authMethod: 'session'
      }));

      // Handle automatic routing
      if (data.redirectPath) {
        navigate(data.redirectPath);
      } else if (isAdmin) {
        navigate('/admin');
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        error: message,
        user: null,
        isAdmin: false
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [checkIsAdmin, navigate]);

  // Enhanced logout with cleanup
  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clean up session state regardless of logout request success
      setState({
        user: null,
        isLoading: false,
        error: null,
        isAdmin: false,
        authMethod: null
      });
      
      // Clear any persisted auth data
      localStorage.removeItem('lastRoute');
      sessionStorage.clear();
      
      // Navigate to login page
      navigate('/login');
    }
  }, [navigate]);

  // Onboarding code validation
  const validateOnboardingCode = useCallback(async (code: string): Promise<OnboardingCode> => {
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
  }, []);

  return {
    user: state.user,
    isAdmin: state.isAdmin,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    validateOnboardingCode,
    refreshSession,
    checkSession
  };
}

// Test cases (to be moved to a separate test file)
/*
import { renderHook, act } from '@testing-library/react-hooks';
import { MemoryRouter } from 'react-router-dom';

describe('useSession', () => {
  test('should handle admin login and routing', async () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/']}>
        {children}
      </MemoryRouter>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    await act(async () => {
      await result.current.login('admin@example.com', 'password');
    });

    expect(result.current.isAdmin).toBe(true);
    expect(window.location.pathname).toBe('/admin');
  });

  test('should persist session across page reloads', async () => {
    // Implementation
  });

  test('should handle automatic routing', async () => {
    // Implementation
  });
});
*/
