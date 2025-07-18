'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/types/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OwnerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData?.role !== 'super_admin') {
        router.push('/'); // Redirect to main page if not super admin
        return;
      }

      setProfile(profileData);
      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-sm text-gray-600">Platform Administration</p>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Verticals</h3>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Active Tenants</h3>
            <p className="text-2xl font-bold text-gray-900">15</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">127</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">$24.5K</p>
          </div>
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/owner/verticals"
            className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏗️ Verticals</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage platform verticals (FirmSync, MedSync, EduSync)
            </p>
            <div className="text-blue-600 text-sm font-medium">Manage →</div>
          </Link>

          <Link
            href="/owner/tenants"
            className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏢 Tenants</h3>
            <p className="text-sm text-gray-600 mb-4">
              View and manage all tenants across verticals
            </p>
            <div className="text-blue-600 text-sm font-medium">View All →</div>
          </Link>

          <Link
            href="/owner/users"
            className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Users</h3>
            <p className="text-sm text-gray-600 mb-4">
              Global user and role management
            </p>
            <div className="text-blue-600 text-sm font-medium">Manage →</div>
          </Link>

          <Link
            href="/owner/analytics"
            className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">
              Platform usage, revenue, and performance metrics
            </p>
            <div className="text-blue-600 text-sm font-medium">View Analytics →</div>
          </Link>

          <Link
            href="/owner/settings"
            className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Settings</h3>
            <p className="text-sm text-gray-600 mb-4">
              Global configuration and API keys
            </p>
            <div className="text-blue-600 text-sm font-medium">Configure →</div>
          </Link>

          <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Quick Actions</h3>
            <div className="space-y-2">
              <button className="block w-full text-left text-sm text-blue-700 hover:text-blue-900">
                • Create new vertical
              </button>
              <button className="block w-full text-left text-sm text-blue-700 hover:text-blue-900">
                • Add super admin user
              </button>
              <button className="block w-full text-left text-sm text-blue-700 hover:text-blue-900">
                • View system health
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
