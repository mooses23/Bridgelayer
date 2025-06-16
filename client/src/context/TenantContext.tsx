import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from '@/contexts/SessionContext';

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
  const { user, isLoading: sessionLoading } = useSession();

  // Helper function to check if a feature is enabled
  const hasFeature = (featureName: keyof TenantFeatures): boolean => {
    return tenant?.features?.[featureName] || false;
  };

  // Load tenant data based on user's firmId
  useEffect(() => {
    if (sessionLoading) return; // Wait for session to load
    
    if (user && user.firmId) {
      // Fetch tenant data using authenticated user's firm endpoint
      fetch('/api/firm', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          // Data already includes default features from backend
          setTenant(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching tenant by firmId:', err);
          setLoading(false);
        });
    } else {
      // Try subdomain detection as fallback
      const host = window.location.hostname;
      const [subdomain] = host.split('.');
      
      if (subdomain && subdomain !== 'localhost' && subdomain !== '127') {
        fetch(`/api/tenant/${subdomain}`)
          .then(res => res.json())
          .then(data => {
            const tenantWithFeatures = {
              ...data.tenant,
              features: {
                billingEnabled: true,
                aiDebug: false,
                documentsEnabled: true,
                intakeEnabled: true,
                communicationsEnabled: true,
                calendarEnabled: true,
                adminGhostMode: false,
                ...data.tenant?.features
              }
            };
            setTenant(tenantWithFeatures);
            setLoading(false);
          })
          .catch(err => {
            console.error('Error fetching tenant by subdomain:', err);
            setLoading(false);
          });
      } else {
        // No user or subdomain - set default state
        setLoading(false);
      }
    }
  }, [user, sessionLoading]);

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