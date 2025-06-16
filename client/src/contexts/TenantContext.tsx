
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import ApiClient from '@/lib/apiClient';

interface TenantConfig {
  id: string;
  name: string;
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
    customCss?: string;
  };
  features?: {
    aiAnalysis?: boolean;
    clientPortal?: boolean;
    billingModule?: boolean;
    auditTrail?: boolean;
  };
  integrations?: {
    google?: boolean;
    microsoft?: boolean;
    dropbox?: boolean;
  };
  templates?: string[];
  settings?: any;
}

interface TenantContextType {
  tenantId: string;
  config: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  setTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: '',
  config: null,
  isLoading: false,
  error: null,
  refreshConfig: async () => {},
  setTenantId: () => {}
});

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string>('');
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const extractTenantFromHost = (): string => {
    const hostname = window.location.hostname;
    
    // For localhost development, check for tenant in URL params or use default
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      
      // Also check for subdomain pattern in localhost (like tenant.localhost)
      const subdomain = hostname.split('.')[0];
      if (subdomain !== 'localhost' && subdomain !== '127') {
        return subdomain;
      }
      
      return tenantParam || 'default';
    }
    
    // For production, extract subdomain
    const subdomain = hostname.split('.')[0];
    return subdomain || 'default';
  };

  const fetchTenantConfig = async (tenant: string): Promise<void> => {
    if (!tenant) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Set tenant header for API requests
      const headers: Record<string, string> = {
        'X-Tenant-ID': tenant
      };
      
      const response = await fetch(`/api/tenant/config?tenant=${tenant}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tenant config: ${response.statusText}`);
      }
      
      const tenantConfig = await response.json();
      setConfig(tenantConfig);
    } catch (err) {
      console.error('Error fetching tenant config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tenant configuration');
      
      // Set default config on error
      setConfig({
        id: tenant,
        name: tenant.charAt(0).toUpperCase() + tenant.slice(1),
        branding: {},
        features: {
          aiAnalysis: true,
          clientPortal: true,
          billingModule: true,
          auditTrail: true
        },
        integrations: {},
        templates: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConfig = async (): Promise<void> => {
    if (tenantId) {
      await fetchTenantConfig(tenantId);
    }
  };

  const handleSetTenantId = (id: string): void => {
    setTenantId(id);
    fetchTenantConfig(id);
  };

  useEffect(() => {
    const extractedTenantId = extractTenantFromHost();
    if (extractedTenantId && extractedTenantId !== tenantId) {
      setTenantId(extractedTenantId);
      fetchTenantConfig(extractedTenantId);
    }
  }, []);

  // Update API client with tenant header when tenantId changes
  useEffect(() => {
    if (tenantId) {
      // Add tenant header to all API requests
      ApiClient.setDefaultHeader('X-Tenant-ID', tenantId);
    }
  }, [tenantId]);

  const contextValue: TenantContextType = {
    tenantId,
    config,
    isLoading,
    error,
    refreshConfig,
    setTenantId: handleSetTenantId
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const useTenantConfig = () => {
  const { config } = useTenant();
  return config;
};

export const useTenantFeatures = () => {
  const { config } = useTenant();
  return config?.features || {};
};

export const useTenantBranding = () => {
  const { config } = useTenant();
  return config?.branding || {};
};
