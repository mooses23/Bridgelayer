import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../contexts/SessionContext';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    firmId?: number;
  };
  redirectPath?: string;
  message?: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  firmId?: number;
  firm?: any;
}

// Authentication API functions
const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    return {
      success: true,
      user: data.user,
      redirectPath: data.redirectPath
    };
  },

  logout: async (): Promise<void> => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  },

  refreshToken: async (): Promise<void> => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
  }
};

// Custom authentication hooks
export const useAuth = () => {
  const { user, isLoading, checkSession } = useSession();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: () => {
      // Refresh session data after successful login
      checkSession();
      // Invalidate all queries to force refresh
      queryClient.invalidateQueries();
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Refresh session to clear user data
      checkSession();
    }
  });

  // Token refresh mutation
  const refreshMutation = useMutation({
    mutationFn: authAPI.refreshToken,
    onSuccess: () => {
      checkSession();
    }
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshToken: refreshMutation.mutateAsync,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    loginError: loginMutation.error?.message,
    logoutError: logoutMutation.error?.message
  };
};

// Role checking hooks
export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role: string) => user?.role === role;
  const hasAnyRole = (roles: string[]) => user?.role ? roles.includes(user.role) : false;

  const isAdmin = hasAnyRole(['platform_admin', 'admin', 'super_admin']);
  const isFirmAdmin = hasRole('firm_admin');
  const isParalegal = hasRole('paralegal');
  const isFirmUser = hasAnyRole(['firm_admin', 'paralegal']);

  return {
    role: user?.role,
    hasRole,
    hasAnyRole,
    isAdmin,
    isFirmAdmin,
    isParalegal,
    isFirmUser
  };
};

// Tenant access hook
export const useTenantAccess = () => {
  const { user } = useAuth();
  const { isAdmin } = useRole();

  const canAccessTenant = (firmId: number) => {
    if (isAdmin) return true;
    return user?.firmId === firmId;
  };

  const getCurrentTenant = () => user?.firmId;

  return {
    canAccessTenant,
    getCurrentTenant,
    currentFirmId: user?.firmId
  };
};

// Authenticated fetch hook for API calls
export const useAuthenticatedFetch = () => {
  const { refreshToken } = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      try {
        await refreshToken();
        // Retry the original request
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
      } catch (error) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        throw error;
      }
    }

    return response;
  };

  return { authenticatedFetch };
};