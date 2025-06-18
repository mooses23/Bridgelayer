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
  showFallback: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: '',
  config: null,
  isLoading: true,
  error: null
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectTenant = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get hostname without port
        const hostname = window.location.hostname;
        console.log('🌐 Detecting tenant from hostname:', hostname);

        // Set default fallback tenant to prevent context errors
        const fallbackTenant: TenantConfig = {
          id: 'fallback',
          name: 'FirmSync Demo',
          subdomain: 'demo',
          onboardingComplete: false,
          features: {
            documentAnalysis: true,
            aiAssistant: true,
            advancedReporting: false,
            integrations: false,
            customBranding: false,
            prioritySupport: false
          }
        };

        setTenant(fallbackTenant);

        let tenantSlug = 'localhost';

        // Extract subdomain from Replit URLs
        if (hostname.includes('.replit.dev') || hostname.includes('.repl.co')) {
          // Format: subdomain-hash.username.replit.dev
          const parts = hostname.split('.');
          if (parts.length >= 3) {
            tenantSlug = parts[0]; // Take the first part as tenant slug
          }
        }

        console.log('🏷️ Detected tenant slug:', tenantSlug);

        // Try to fetch tenant data from API (non-blocking)
        try {
          const response = await fetch(`/api/tenant/${tenantSlug}`, {
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Tenant data loaded:', data);
            setTenant(data.tenant);
          } else {
            console.log('ℹ️ No tenant found for slug, using fallback tenant');
            // Use fallback tenant for any unrecognized subdomain
            setTenant({
              id: 'new-firm',
              name: 'New Legal Firm',
              subdomain: tenantSlug,
              onboardingComplete: false,
              features: {
                documentAnalysis: true,
                aiAssistant: true,
                advancedReporting: false,
                integrations: false,
                customBranding: false,
                prioritySupport: false
              }
            });
          }
        } catch (apiError) {
          console.log('ℹ️ Tenant API not available, using defaults');
        }
      } catch (error) {
        console.error('❌ Error in tenant detection:', error);
        setError('Failed to load tenant configuration');
        // Ensure we always have a tenant set
        setTenant({
          id: 'default',
          name: 'FirmSync',
          subdomain: 'localhost', // Added subdomain
          onboardingComplete: false,
          features: {
            documentAnalysis: true,
            aiAssistant: true,
            advancedReporting: false,
            integrations: false,
            customBranding: false,
            prioritySupport: false
          }
        });
      } finally {
        setLoading(false);
      }
    };

    detectTenant();
  }, []); // Add empty dependency array

  return (
    <TenantContext.Provider value={{
      tenantId: tenant?.id || '',
      config: tenant || null,
      isLoading: loading,
      error
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