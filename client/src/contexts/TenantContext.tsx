import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Tenant Configuration Interface
export interface TenantConfig {
  id: string;
  name: string;
  slug?: string;
  plan?: string;
  onboardingComplete?: boolean;
  features: {
    documentsEnabled: boolean;
    billingEnabled: boolean;
    aiAnalysis: boolean;
    [key: string]: boolean;
  };
  integrations?: {
    storage: string | null;
    billing: string | null;
    calendar: string | null;
    [key: string]: string | null;
  };
  settings?: {
    [key: string]: any;
  };
}

// Tenant Context Interface
interface TenantContextType {
  tenant: TenantConfig | null;
  config: TenantConfig | null; // Add config alias for tenant
  tenantId: string | null;
  loading: boolean;
  isLoading: boolean; // Add isLoading alias for loading
  error: Error | null; // Add error field
  hasFeature: (feature: string) => boolean;
  updateTenant: (updates: Partial<TenantConfig>) => void;
  refreshTenant: () => Promise<void>;
}

// Create Context
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Provider Props
interface TenantProviderProps {
  children: ReactNode;
  initialTenant?: TenantConfig | null;
}

// Tenant Provider Component
export function TenantProvider({ children, initialTenant = null }: TenantProviderProps) {
  const [tenant, setTenant] = useState<TenantConfig | null>(initialTenant);
  const [loading, setLoading] = useState(!initialTenant);
  const [error, setError] = useState<Error | null>(null); // Add error state

  // Feature check function
  const hasFeature = (feature: string): boolean => {
    if (!tenant?.features) return false;
    return tenant.features[feature] === true;
  };

  // Update tenant function
  const updateTenant = (updates: Partial<TenantConfig>) => {
    if (!tenant) return;
    setTenant(prev => prev ? { ...prev, ...updates } : null);
  };

  // Refresh tenant from server
  const refreshTenant = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tenant/current', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const tenantData = await response.json();
        setTenant(tenantData);
      } else {
        console.warn('Failed to fetch tenant data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load tenant on mount if not provided initially
  useEffect(() => {
    if (!initialTenant && !tenant) {
      refreshTenant();
    }
  }, [initialTenant, tenant]);

  // Auto-detect tenant from subdomain if available
  useEffect(() => {
    if (!tenant && !initialTenant) {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
        // Extract tenant info from subdomain
        const detectedTenant: TenantConfig = {
          id: subdomain,
          name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1),
          slug: subdomain,
          plan: 'standard',
          features: {
            documentsEnabled: true,
            billingEnabled: true,
            aiAnalysis: true,
          },
          integrations: {
            storage: null,
            billing: null,
            calendar: null,
          }
        };
        setTenant(detectedTenant);
      }
    }
  }, [tenant, initialTenant]);

  const contextValue: TenantContextType = {
    tenant,
    config: tenant, // Add config alias
    tenantId: tenant?.id || null,
    loading,
    isLoading: loading, // Add isLoading alias
    error, // Add error
    hasFeature,
    updateTenant,
    refreshTenant,
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

// Custom Hook
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

// Export the context for testing
export { TenantContext };
