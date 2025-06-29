import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TenantContextType {
  tenantId: string | null;
  tenantSlug: string | null;
  tenantName: string | null;
  setTenant: (tenantId: string, tenantSlug: string, tenantName: string) => void;
  clearTenant: () => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to determine tenant from URL subdomain or other means
    const initializeTenant = () => {
      try {
        // Check for subdomain-based tenancy
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        
        if (parts.length > 2) {
          // Subdomain exists, e.g., acmelaw.firmsync.com
          const subdomain = parts[0];
          if (subdomain !== 'www' && subdomain !== 'app') {
            setTenantSlug(subdomain);
            // In a real app, you'd fetch tenant details from API
            setTenantName(subdomain.charAt(0).toUpperCase() + subdomain.slice(1));
            setTenantId(subdomain); // Simplified for now
          }
        }

        // Check localStorage for tenant info
        const storedTenant = localStorage.getItem('tenant');
        if (storedTenant) {
          const tenant = JSON.parse(storedTenant);
          setTenantId(tenant.id);
          setTenantSlug(tenant.slug);
          setTenantName(tenant.name);
        }
      } catch (error) {
        console.error('Error initializing tenant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTenant();
  }, []);

  const setTenant = (id: string, slug: string, name: string) => {
    setTenantId(id);
    setTenantSlug(slug);
    setTenantName(name);
    
    // Store in localStorage
    localStorage.setItem('tenant', JSON.stringify({ id, slug, name }));
  };

  const clearTenant = () => {
    setTenantId(null);
    setTenantSlug(null);
    setTenantName(null);
    localStorage.removeItem('tenant');
  };

  const value: TenantContextType = {
    tenantId,
    tenantSlug,
    tenantName,
    setTenant,
    clearTenant,
    isLoading,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
