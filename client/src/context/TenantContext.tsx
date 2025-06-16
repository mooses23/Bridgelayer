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
  const { user, isLoading } = useSession();

  // Helper function to check if a feature is enabled
  const hasFeature = (featureName: keyof TenantFeatures): boolean => {
    return tenant?.features?.[featureName] || false;
  };

  // Load tenant data based on user's firmId
  useEffect(() => {
    if (isLoading) return; // Wait for session to load
    
    if (!user?.firmId) {
      setLoading(false);
      return;
    }
    
    fetch(`/api/tenant-by-id/${user.firmId}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setTenant(data))
      .finally(() => setLoading(false));
  }, [user?.firmId, isLoading]);

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