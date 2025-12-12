import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { TenantSettings } from '@/types/settings';

// GET: Retrieve tenant settings
export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const supabase = createServerComponentClient({ cookies });

    // Get tenant by ID (assuming tenantId is the subdomain or numeric ID)
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, subdomain, settings, created_at, updated_at')
      .or(`id.eq.${tenantId},subdomain.eq.${tenantId}`)
      .single();

    if (error || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Parse settings from JSONB
    const settings = tenant.settings as Partial<TenantSettings> || {};

    // Return settings with tenant info
    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
      },
      settings: {
        firmProfile: settings.firmProfile || {
          firmName: tenant.name,
          contactEmail: '',
          timezone: 'America/New_York',
        },
        userManagement: settings.userManagement || {
          allowUserInvites: true,
          defaultRole: 'tenant_user',
          requireEmailVerification: false,
        },
        integrations: settings.integrations || {
          clients: { enabled: false, provider: null, mode: 'native' },
          calendar: { enabled: false, provider: null, mode: 'native' },
          billing: { enabled: false, provider: null, mode: 'native' },
          docsign: { enabled: false, provider: null, mode: 'native' },
        },
        notifications: settings.notifications || {
          email: {
            enabled: true,
            frequency: 'realtime',
            types: ['case_update', 'new_client', 'deadline_reminder'],
          },
          inApp: {
            enabled: true,
            types: ['case_update', 'new_client', 'deadline_reminder'],
          },
        },
        security: settings.security || {
          twoFactorAuth: false,
          sessionTimeout: 30,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT: Update tenant settings
export async function PUT(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const body = await request.json();
    const supabase = createServerComponentClient({ cookies });

    // Get current tenant
    const { data: tenant, error: fetchError } = await supabase
      .from('tenants')
      .select('id, settings')
      .or(`id.eq.${tenantId},subdomain.eq.${tenantId}`)
      .single();

    if (fetchError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Merge existing settings with updates
    const currentSettings = (tenant.settings as Partial<TenantSettings>) || {};
    const updatedSettings = {
      ...currentSettings,
      ...body.settings,
      firmProfile: {
        ...currentSettings.firmProfile,
        ...body.settings?.firmProfile,
      },
      userManagement: {
        ...currentSettings.userManagement,
        ...body.settings?.userManagement,
      },
      integrations: {
        ...currentSettings.integrations,
        ...body.settings?.integrations,
      },
      notifications: {
        ...currentSettings.notifications,
        ...body.settings?.notifications,
      },
      security: {
        ...currentSettings.security,
        ...body.settings?.security,
      },
    };

    // Update tenant settings
    const { data: updated, error: updateError } = await supabase
      .from('tenants')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenant.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updated.settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
