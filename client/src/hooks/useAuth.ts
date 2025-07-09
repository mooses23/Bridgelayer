import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../contexts/SessionContext';
import { User } from '@shared/types/auth-types';

const ADMIN_ROLES = ['platform_admin', 'admin', 'super_admin'];
const FIRM_ROLES = ['firm_admin', 'paralegal'];

export interface UseAuthResult {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFirmUser: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  login: (email: string, password: string, mode?: 'bridgelayer' | 'firm', code?: string, vertical?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const { 
    user, 
    isLoading,
    login: sessionLogin,
    logout: sessionLogout
  } = useSession();

  const queryClient = useQueryClient();

  // Role checking utilities
  const hasRole = (role: string) => user?.role === role;
  const hasAnyRole = (roles: string[]) => user?.role ? roles.includes(user.role) : false;
  
  const isAdmin = hasAnyRole(ADMIN_ROLES);
  const isFirmUser = hasAnyRole(FIRM_ROLES);

  // Login mutation with session management
  const loginMutation = useMutation({
    mutationFn: sessionLogin,
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });

  // Logout mutation with cleanup
  const logoutMutation = useMutation({
    mutationFn: sessionLogout,
    onSuccess: () => {
      queryClient.clear();
    }
  });

  // Expose unified auth interface
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isFirmUser,
    hasRole,
    hasAnyRole,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshToken: async () => {
      await queryClient.invalidateQueries(['session']);
    }
  };
}

// Optional tenant access hook
export function useTenantAccess() {
  const { user, isAdmin } = useAuth();

  return {
    canAccessTenant: (firmId: number) => {
      if (isAdmin) return true;
      return user?.firmId === firmId;
    },
    getCurrentTenant: () => user?.firmId
  };
}