import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to check if a feature is enabled
  const hasFeature = (featureName: keyof TenantFeatures): boolean => {
    return tenant?.features?.[featureName] || false;
  };

  // Detect tenant from subdomain
  const detectTenantFromSubdomain = (): string | null => {
    const host = window.location.hostname;
    const parts = host.split('.');

    // Check if we're on a subdomain (more than 2 parts for domain.com)
    if (parts.length > 2) {
      return parts[0]; // Return subdomain as tenantId
    }
    return null;
  };

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        // Try subdomain detection first
        const subdomainTenant = detectTenantFromSubdomain();

        let tenantId: string | null = null;

        if (subdomainTenant) {
          tenantId = subdomainTenant;
        } else if (user?.firm_id) {
          tenantId = user.firm_id;
        }

        if (tenantId) {
          const response = await fetch(`/api/firms/${tenantId}`, {
            headers: {
              'X-Tenant-ID': tenantId,
            }
          });

          if (response.ok) {
            const data = await response.json();
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
          }
        }
      } catch (err) {
        console.error('Error fetching tenant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [user]);

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