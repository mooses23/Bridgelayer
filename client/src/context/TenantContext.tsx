import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  id: string;
  name: string;
  slug: string;
  onboarded: boolean;
  plan: string;
  features: TenantFeatures;
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  setTenant: (tenant: Tenant | null) => void;
  hasFeature: (featureName: keyof TenantFeatures) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // GHGH 20.3 – Detect Tenant from Subdomain
  const host = window.location.hostname;           // e.g. "acme.firmsync.com"
  const [subdomain] = host.split('.');             // e.g. "acme"

  // Helper function to check if a feature is enabled
  const hasFeature = (featureName: keyof TenantFeatures): boolean => {
    return tenant?.features?.[featureName] || false;
  };

  useEffect(() => {
    if (subdomain && subdomain !== 'localhost' && subdomain !== '127') {
      fetch(`/api/tenant/${subdomain}`)
        .then(res => res.json())
        .then(data => {
          // Set default features if not provided
          const tenantWithFeatures = {
            ...data,
            features: {
              billingEnabled: true,
              aiDebug: false,
              documentsEnabled: true,
              intakeEnabled: true,
              communicationsEnabled: true,
              calendarEnabled: true,
              adminGhostMode: false,
              ...data.features
            }
          };
          setTenant(tenantWithFeatures);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching tenant:', err);
          setLoading(false);
        });
    } else {
      // Fallback for localhost or non-subdomain environments
      setLoading(false);
    }
  }, [subdomain]);

return (
    <TenantContext.Provider value={{ tenant, loading, setTenant, hasFeature }}>
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