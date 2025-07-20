// src/app/firmsync/tenant/components/Header.tsx
// Header component for FirmSync tenant interface with user info and navigation

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  firmName?: string;
  userName?: string;
  userRole?: string;
  tenantId: string;
}

export default function Header({ 
  firmName = 'Your Firm', 
  userName = 'User', 
  userRole = 'tenant_user',
  tenantId 
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'tenant_admin': return 'Firm Administrator';
      case 'tenant_user': return 'Firm User';
      default: return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-full mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Firm branding */}
          <div className="flex items-center">
            <Link href={`/firmsync/${tenantId}/dashboard`} className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{firmName}</h1>
                <p className="text-xs text-gray-500">Legal Practice Management</p>
              </div>
            </Link>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="text-gray-500 hover:text-gray-700 relative">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-gray-500">{getRoleDisplayName(userRole)}</p>
                </div>
                <span className="text-gray-400">▼</span>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    href={`/firmsync/${tenantId}/settings`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href={`/firmsync/${tenantId}/settings`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Firm Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowUserMenu(false);
                      // Handle logout
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
