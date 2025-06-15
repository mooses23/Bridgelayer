
import { ReactNode } from 'react';
import { useTenant } from '@/context/TenantContext';

interface FeatureToggleProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function FeatureToggle({ feature, children, fallback = null }: FeatureToggleProps) {
  const { hasFeature } = useTenant();
  
  return hasFeature(feature as any) ? <>{children}</> : <>{fallback}</>;
}
