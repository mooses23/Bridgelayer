// src/app/firmsync/tenant/components/Sidebar.tsx
// Tenant-specific sidebar navigation component for FirmSync tenant interface

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  tenantId: string;
  wildcardTabs?: Array<{
    id: string;
    name: string;
    path: string;
    enabled: boolean;
  }>;
}

export default function Sidebar({ tenantId, wildcardTabs = [] }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainTabs = [
    { name: 'Dashboard', path: `/firmsync/${tenantId}/dashboard`, icon: '🏠' },
    { name: 'Clients', path: `/firmsync/${tenantId}/clients`, icon: '👥' },
    { name: 'Cases', path: `/firmsync/${tenantId}/cases`, icon: '📁' },
    { name: 'Calendar', path: `/firmsync/${tenantId}/calendar`, icon: '📅' },
    { name: 'Paralegal+', path: `/firmsync/${tenantId}/paralegal-plus`, icon: '🤖' },
    { name: 'Billing', path: `/firmsync/${tenantId}/billing`, icon: '💰' },
    { name: 'DocSign', path: `/firmsync/${tenantId}/docsign`, icon: '✍️' },
    { name: 'Reports', path: `/firmsync/${tenantId}/reports`, icon: '📊' },
    { name: 'Settings', path: `/firmsync/${tenantId}/settings`, icon: '⚙️' },
  ];

  const enabledWildcards = wildcardTabs.filter(tab => tab.enabled);

  return (
    <div className={`bg-white shadow-lg h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between"
        >
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">FirmSync</h2>
          )}
          <span className="text-gray-500">☰</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        {/* Main Tabs */}
        <div className="px-2">
          {mainTabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex items-center px-3 py-2 rounded-md mb-1 transition-colors ${
                pathname === tab.path
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg mr-3">{tab.icon}</span>
              {!isCollapsed && <span className="font-medium">{tab.name}</span>}
            </Link>
          ))}
        </div>

        {/* Wildcard Tabs */}
        {enabledWildcards.length > 0 && (
          <div className="mt-6 px-2">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Custom
              </h3>
            )}
            {enabledWildcards.map((tab) => (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex items-center px-3 py-2 rounded-md mb-1 transition-colors ${
                  pathname === tab.path
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg mr-3">🔗</span>
                {!isCollapsed && <span className="font-medium">{tab.name}</span>}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}
