
import { ReactNode } from 'react';
import { useTenantSafe } from '@/hooks/useTenantSafe';

interface FeatureToggleProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function FeatureToggle({ feature, children, fallback = null }: FeatureToggleProps) {
  const { hasFeature } = useTenantSafe();
  
  return hasFeature(feature as any) ? <>{children}</> : <>{fallback}</>;
}
