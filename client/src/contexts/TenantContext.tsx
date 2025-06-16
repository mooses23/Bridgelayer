import React, { createContext, useContext, useEffect, useState } from 'react';

interface TenantFeatures {
  billingEnabled: boolean;
  aiDebug: boolean;
  documentsEnabled: boolean;
  intakeEnabled: boolean;
  communicationsEnabled: boolean;
  calendarEnabled: boolean;
  adminGhostMode: boolean;
}

interface Tenant {
  id: string | number;
  name: string;
  slug: string;
  onboarded: boolean;
  plan: string;
  features: TenantFeatures;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  hasFeature: (feature: keyof TenantFeatures) => boolean;
  refetch: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectTenantFromSubdomain = (): string | null => {
    if (typeof window === 'undefined') return null;

    const hostname = window.location.hostname;

    // Handle localhost development
    if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('replit.dev')) {
      return 'testfirm'; // Default tenant for development
    }

    // Extract subdomain from hostname (e.g., 'acme' from 'acme.firmsync.com')
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0]; // Return first part as subdomain
    }

    return null;
  };

  const fetchTenantData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const subdomain = detectTenantFromSubdomain();

      if (!subdomain) {
        throw new Error('Unable to detect tenant from subdomain');
      }

      const response = await fetch(`/api/tenant/${subdomain}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tenant data: ${response.status}`);
      }

      const data = await response.json();
      setTenant(data.tenant);
    } catch (err) {
      console.error('Error fetching tenant data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Fallback to default tenant for development
      setTenant({
        id: 1,
        name: 'Test Firm',
        slug: 'testfirm',
        onboarded: true,
        plan: 'professional',
        features: {
          billingEnabled: true,
          aiDebug: false,
          documentsEnabled: true,
          intakeEnabled: true,
          communicationsEnabled: true,
          calendarEnabled: true,
          adminGhostMode: false
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (feature: keyof TenantFeatures): boolean => {
    return tenant?.features?.[feature] ?? false;
  };

  const refetch = () => {
    fetchTenantData();
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  return (
    <TenantContext.Provider value={{
      tenant,
      isLoading,
      error,
      hasFeature,
      refetch
    }}>
      {children}
    </TenantContext.Provider>
  );
};