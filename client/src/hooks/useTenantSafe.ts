import { useTenant as useOriginalTenant } from '@/contexts/TenantContext';

/**
 * Safe wrapper for useTenant hook that handles cases where TenantProvider might not be available
 */
export function useTenantSafe() {
  try {
    return useOriginalTenant();
  } catch (error) {
    console.warn('TenantProvider not found, returning default values');
    return {
      tenant: null,
      config: null,
      tenantId: null,
      loading: false,
      isLoading: false,
      error: null,
      hasFeature: () => false,
      updateTenant: () => {},
      refreshTenant: async () => {}
    };
  }
}
