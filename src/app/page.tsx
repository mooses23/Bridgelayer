'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';
import { Profile } from '../types/database';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/login');
        return;
      }
      
      const userId = session.user.id;
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError || !data) {
        setError('Unable to load profile.');
      } else {
        setProfile(data);
      }
      setLoading(false);
    }
    
    fetchProfile();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  // Determine nav items based on role
  let navItems: { label: string; href: string; description: string }[] = [];
  if (profile) {
    switch (profile.role) {
      case 'super_admin':
        navItems = [
          { label: 'Owner Dashboard', href: '/owner/dashboard', description: 'Platform overview and management' },
          { label: 'Verticals', href: '/owner/verticals', description: 'Manage platform verticals' },
          { label: 'Tenants', href: '/owner/tenants', description: 'View all tenants across verticals' },
          { label: 'Users', href: '/owner/users', description: 'Global user management' },
          { label: 'Analytics', href: '/owner/analytics', description: 'Platform usage and revenue' },
          { label: 'Settings', href: '/owner/settings', description: 'Global configuration and API keys' }
        ];
        break;
      case 'admin':
        navItems = [
          { label: 'Firms', href: '/firmsync/admin/firms', description: 'Tenant/firm creation and management' },
          { label: 'Integrations', href: '/firmsync/admin/integrations', description: 'Configure per-tenant integrations' },
          { label: 'LLM', href: '/firmsync/admin/llm', description: 'AI agent workflow configuration' },
          { label: 'Doc+', href: '/firmsync/admin/docplus', description: 'Document intelligence pipelines' },
          { label: 'Preview', href: '/firmsync/admin/preview', description: 'Ghost mode portal preview' },
          { label: 'Settings', href: '/firmsync/admin/settings', description: 'Portal and onboarding settings' }
        ];
        break;
      case 'tenant_admin':
      case 'tenant_user':
        navItems = [
          { label: 'Clients', href: `/firmsync/${profile.tenant_id}/clients`, description: 'Manage client information' },
          { label: 'Cases', href: `/firmsync/${profile.tenant_id}/cases`, description: 'Track and manage cases' },
          { label: 'Calendar', href: `/firmsync/${profile.tenant_id}/calendar`, description: 'Schedule and appointments' },
          { label: 'DocSign', href: `/firmsync/${profile.tenant_id}/docsign`, description: 'Document signing workflow' },
          { label: 'Paralegal+', href: `/firmsync/${profile.tenant_id}/paralegal`, description: 'AI-powered legal assistance' },
          { label: 'Billing', href: `/firmsync/${profile.tenant_id}/billing`, description: 'Billing and invoicing' }
        ];
        break;
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Platform Administrator';
      case 'admin': return 'Vertical Administrator';
      case 'tenant_admin': return 'Firm Administrator';
      case 'tenant_user': return 'Firm User';
      default: return role;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bridgelayer</h1>
              <p className="text-sm text-gray-600">Meta-SaaS Platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.display_name}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(profile?.role || '')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {profile?.display_name}
          </h2>
          <p className="text-gray-600">
            Access your {getRoleDisplayName(profile?.role || '').toLowerCase()} dashboard and tools below.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.label}
              </h3>
              <p className="text-sm text-gray-600">
                {item.description}
              </p>
              <div className="mt-4 text-blue-600 text-sm font-medium">
                Access →
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats or Info */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{profile?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="text-sm text-gray-900">{getRoleDisplayName(profile?.role || '')}</dd>
            </div>
            {profile?.tenant_id && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
                <dd className="text-sm text-gray-900">{profile.tenant_id}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Vertical ID</dt>
              <dd className="text-sm text-gray-900">{profile?.vertical_id}</dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
