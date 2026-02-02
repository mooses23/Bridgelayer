// Admin API for firm provisioning and management
// POST /api/admin/firms - Create new firm with dedicated Neon database
// GET /api/admin/firms - List all firms with status

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import DatabaseRouter from '@/lib/database-router'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'

interface Firm {
  id: string
  name: string
  status: string
  plan_type: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export async function POST(request: NextRequest) {
  try {
    const dbRouter = new DatabaseRouter()
    // For now, skip auth - add proper auth later
    // TODO: Add proper admin authentication
    
    const { firmName, planType = 'basic' } = await request.json()

    if (!firmName || firmName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Valid firm name is required' },
        { status: 400 }
      )
    }

    console.log(`🏢 Creating new firm: ${firmName}`)

    // Provision new firm with dedicated Neon database
    const provisionResult = await dbRouter.provisionNewFirm(firmName, {
      planType,
      adminUserId: 'admin-user-temp' // TODO: Get from auth
    })

    return NextResponse.json({
      success: true,
      firm: provisionResult,
      message: `Firm "${firmName}" created successfully with dedicated database`
    })

  } catch (error: unknown) {
    console.error('❌ Firm creation failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to create firm',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const dbRouter = new DatabaseRouter()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // For now, skip auth - add proper auth later
    // TODO: Add proper admin authentication

    // Get all firms from central routing table
    const { data: firms, error } = await supabase
      .from('tenants')
      .select(`
        id,
        name,
        status,
        plan_type,
        created_at,
        updated_at,
        is_active
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch firms: ${error.message}`)
    }

    // Get connection status for each firm
    const firmsWithStatus = await Promise.all(
      (firms as Firm[]).map(async (firm: Firm) => {
        try {
          const connectionStatus = await dbRouter.testFirmConnection(firm.id)
          return {
            ...firm,
            connectionStatus: connectionStatus ? 'connected' : 'disconnected'
          }
        } catch {
          return {
            ...firm,
            connectionStatus: 'error'
          }
        }
      })
    )

    return NextResponse.json({
      firms: firmsWithStatus,
      total: firms.length
    })

  } catch (error: unknown) {
    console.error('❌ Failed to fetch firms:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to fetch firms',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}
