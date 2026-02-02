import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/check-profile
 * Check if current user has a profile
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profile) {
      return NextResponse.json({
        status: 'exists',
        message: 'Profile already exists',
        profile,
      })
    }

    return NextResponse.json(
      { status: 'not_found', message: 'Profile not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('[Check Profile] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/auth/check-profile
 * Manual profile check
 */
export async function POST() {
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      return NextResponse.json({
        status: 'exists',
        message: 'Profile exists',
        profile,
      })
    }

    return NextResponse.json(
      { status: 'not_found', message: 'Profile not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('[Check Profile POST] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
