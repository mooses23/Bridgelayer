// src/app/firmsync/[tenantId]/dashboard/page.tsx
// Main dashboard for FirmSync tenant - Overview of firm activities, metrics, and quick actions

import PortalRenderer from '@/components/PortalRenderer';
import { PortalPageConfiguration } from '@/types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function DashboardPage({ params }: { params: { tenantId: string } }) {
  const supabase = createServerComponentClient({ cookies });

  // Fetch the layout configuration for THIS tenant's dashboard from the database
  const { data: layout, error } = await supabase
    .from('portal_layouts')
    .select('configuration')
    .eq('tenant_id', params.tenantId)
    .eq('page_slug', 'dashboard')
    .single();

  if (error || !layout) {
    // You can render a default layout or an "unconfigured" message
    return (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
            <h2 className="text-xl font-semibold">Welcome to your Dashboard</h2>
            <p className="mt-2 text-gray-600">This page has not been configured yet. An administrator can design the layout in the Admin Workshop.</p>
        </div>
    );
  }

  // Pass the configuration from the database to the renderer
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {/* The type assertion is safe here because we've checked for layout existence */}
      <PortalRenderer configuration={layout.configuration as PortalPageConfiguration} />
    </div>
  );
}
