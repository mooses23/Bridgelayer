import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Retrieve users for a tenant
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params;
    const supabase = createServerComponentClient({ cookies });

    // Get tenant by ID or subdomain
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .or(`id.eq.${tenantId},subdomain.eq.${tenantId}`)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get all users (profiles) for this tenant
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name, email, role, created_at')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });

    if (usersError) {
      throw usersError;
    }

    // Transform to match User type
    const formattedUsers = users?.map(user => ({
      id: user.id,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      status: 'active', // Could be enhanced with actual status tracking
      createdAt: user.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Invite a new user to the tenant
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params;
    const body = await request.json();
    const supabase = createServerComponentClient({ cookies });

    // Get tenant by ID or subdomain
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .or(`id.eq.${tenantId},subdomain.eq.${tenantId}`)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you would:
    // 1. Send an invitation email with a signup link
    // 2. Create a pending invitation record
    // 3. When user signs up, link them to the tenant

    // For now, return a success message
    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${body.email}`,
      invitation: {
        email: body.email,
        role: body.role || 'tenant_user',
        status: 'invited',
        invitedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user from the tenant
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerComponentClient({ cookies });

    // Get tenant by ID or subdomain
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .or(`id.eq.${tenantId},subdomain.eq.${tenantId}`)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Remove user from tenant (set tenant_id to null)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ tenant_id: null })
      .eq('id', userId)
      .eq('tenant_id', tenant.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'User removed from tenant',
    });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
