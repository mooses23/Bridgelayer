'use client';

import Header from './components/Header';
import Sidebar from './components/Sidebar';

export default function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantId?: string };
}) {
  // For now, we'll use a default tenantId. In a real app, this would come from params or auth
  const tenantId = params?.tenantId || 'default-tenant';
  
  // Sample wildcard tabs - these would typically come from database/API
  const wildcardTabs = [
    {
      id: 'wildcard-1',
      name: 'Custom App 1',
      path: `/firmsync/${tenantId}/wildcards/wildcard-one`,
      enabled: true,
    },
    {
      id: 'wildcard-2', 
      name: 'Custom App 2',
      path: `/firmsync/${tenantId}/wildcards/wildcard-two`,
      enabled: false,
    },
    {
      id: 'wildcard-3',
      name: 'Custom App 3', 
      path: `/firmsync/${tenantId}/wildcards/wildcard-three`,
      enabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar tenantId={tenantId} wildcardTabs={wildcardTabs} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          firmName="Acme Legal Partners"
          userName="John Doe"
          userRole="tenant_admin"
          tenantId={tenantId}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
