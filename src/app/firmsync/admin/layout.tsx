// Protected by middleware (admin-only access)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const adminTabs = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      path: '/firmsync/admin/dashboard',
      icon: '📊'
    },
    { 
      id: 'firms', 
      name: 'Firms', 
      path: '/firmsync/admin/firms',
      icon: '🏢'
    },
    { 
      id: 'integrations', 
      name: 'Integrations', 
      path: '/firmsync/admin/integrations',
      icon: '🔗'
    },
    { 
      id: 'llm', 
      name: 'LLM Agents', 
      path: '/firmsync/admin/llm',
      icon: '🤖'
    },
    { 
      id: 'docplus', 
      name: 'Doc+', 
      path: '/firmsync/admin/docplus',
      icon: '📄'
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      path: '/firmsync/admin/settings',
      icon: '⚙️'
    },
    { 
      id: 'preview', 
      name: 'Preview', 
      path: '/firmsync/admin/preview',
      icon: '👁️'
    }
  ];

  const getCurrentTab = () => {
    return adminTabs.find(tab => pathname.startsWith(tab.path))?.name || 'Admin';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">FirmSync Admin</h2>
                <p className="text-sm text-gray-600">Portal Builder</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {adminTabs.map((tab) => {
              const isActive = pathname.startsWith(tab.path);
              return (
                <li key={tab.id}>
                  <Link
                    href={tab.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg mr-3">{tab.icon}</span>
                    {!sidebarCollapsed && (
                      <span className="font-medium">{tab.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Breadcrumbs */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                <Link href="/" className="hover:text-blue-600">Bridgelayer</Link>
                <span>→</span>
                <Link href="/firmsync/admin/dashboard" className="hover:text-blue-600">FirmSync</Link>
                <span>→</span>
                <span className="text-gray-900 font-medium">Admin</span>
                <span>→</span>
                <span className="text-blue-600 font-medium">{getCurrentTab()}</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900">
                FirmSync Admin Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/firmsync/admin/preview"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Preview Portal
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
