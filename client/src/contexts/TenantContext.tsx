import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  onboardingComplete: boolean;
  features: Record<string, boolean>;
}

interface TenantContextType {
  tenantId: string;
  config: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: '',
  config: null,
  isLoading: true,
  error: null
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState('');

  useEffect(() => {
    // Extract tenant from subdomain
    const hostname = window.location.hostname;
    let extractedTenantId = '';

    if (hostname.includes('.') && !hostname.startsWith('www.')) {
      // Extract subdomain (e.g., 'smithlaw' from 'smithlaw.firmsync.com')
      extractedTenantId = hostname.split('.')[0];
    } else if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
      // For development, check if there's a tenant in the path or use default
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments[0] && pathSegments[0] !== 'admin') {
        extractedTenantId = pathSegments[0];
      } else {
        // Default tenant for development
        extractedTenantId = 'testfirm';
      }
    }

    setTenantId(extractedTenantId);
  }, []);

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['tenant-config', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const response = await fetch(`/api/tenant/${tenantId}`);
      if (!response.ok) {
        throw new Error('Failed to load tenant configuration');
      }
      return response.json() as TenantConfig;
    },
    enabled: !!tenantId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <TenantContext.Provider value={{
      tenantId,
      config,
      isLoading,
      error: error?.message || null
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};