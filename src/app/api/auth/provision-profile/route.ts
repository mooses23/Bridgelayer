import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/provision-profile
 *
 * Provisions a profile for the authenticated user if one doesn't exist.
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Get the current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile,
      })
    }

    // Get the default FirmSync vertical
    const { data: vertical } = await supabase
      .from('verticals')
      .select('id')
      .eq('name', 'FirmSync')
      .eq('is_active', true)
      .single()

    const defaultVerticalId = vertical?.id || 1

    // Create the profile
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        tenant_id: null,
        vertical_id: defaultVerticalId,
        role: 'tenant_user',
        display_name: user.user_metadata?.full_name || user.email || 'New User',
        email: user.email,
      })
      .select()
      .single()

    if (error) {
      console.error('[Provision Profile] Error creating profile:', error)
      return NextResponse.json(
        { error: `Failed to create profile: ${error.message}` },
        { status: 500 }
      )
    }

    console.log(`[Provision Profile] Successfully created profile for user ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile: newProfile,
    })
  } catch (error) {
    console.error('[Provision Profile] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/provision-profile
 *
 * Checks if the authenticated user has a profile.
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "not found"
      console.error('[Check Profile] Error fetching profile:', error)
      return NextResponse.json(
        { error: `Failed to fetch profile: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      hasProfile: !!profile,
      profile: profile || null,
      userEmail: user.email,
    })
  } catch (error) {
    console.error('[Check Profile] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
