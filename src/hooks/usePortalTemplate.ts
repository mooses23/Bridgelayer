// src/hooks/usePortalTemplate.ts
export type TenantTab = { id: string; label: string; href: string };
export type WildcardTab = { id: string; name: string; url: string; enabled: boolean };

export function usePortalTemplate(): {
  tenantTabs: TenantTab[];
  wildcardTabs: WildcardTab[];
} {
  const tenantTabs: TenantTab[] = [
    { id: 'home',      label: 'Home',      href: '/firmsync/preview/home' },
    { id: 'clients',   label: 'Clients',   href: '/firmsync/preview/clients' },
    { id: 'cases',     label: 'Cases',     href: '/firmsync/preview/cases' },
    { id: 'calendar',  label: 'Calendar',  href: '/firmsync/preview/calendar' },
    { id: 'docsign',   label: 'DocSign',   href: '/firmsync/preview/docsign' },
    { id: 'paralegal', label: 'Paralegal+',href: '/firmsync/preview/paralegal' },
    { id: 'billing',   label: 'Billing',   href: '/firmsync/preview/billing' },
    { id: 'settings',  label: 'Settings',  href: '/firmsync/preview/settings' }
  ];

  const wildcardTabs: WildcardTab[] = [
    { id: 'w1', name: 'Custom A', url: 'https://example.com/a', enabled: false },
    { id: 'w2', name: 'Custom B', url: 'https://example.com/b', enabled: true  },
    { id: 'w3', name: 'Custom C', url: 'https://example.com/c', enabled: false }
  ];

  return { tenantTabs, wildcardTabs };
}
