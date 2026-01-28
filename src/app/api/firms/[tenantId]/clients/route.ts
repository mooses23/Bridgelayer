// Firm-specific data API routes

// Force dynamic rendering
export const dynamic = 'force-dynamic';
// GET /api/firms/[tenantId]/clients - Get all clients for this firm
// POST /api/firms/[tenantId]/clients - Create client for this firm
// This demonstrates firm data isolation for LLM access

import { NextRequest, NextResponse } from 'next/server'
import DatabaseRouter from '@/lib/database-router'

const dbRouter = new DatabaseRouter()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params
    
    console.log(`📋 Fetching clients for firm: ${tenantId}`)

    // Query firm-specific database only
    // LLMs will only see this firm's data
    const clients = await dbRouter.queryFirmDatabase(
      tenantId,
      `SELECT 
         id, 
         name, 
         email, 
         phone, 
         status,
         created_at,
         updated_at
       FROM clients 
       WHERE is_active = true 
       ORDER BY created_at DESC`
    )

    return NextResponse.json({
      success: true,
      tenantId,
      clients,
      count: clients.length
    })

  } catch (error: unknown) {
    console.error('❌ Failed to fetch clients:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to fetch clients',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params
    const { name, email, phone, notes } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    console.log(`➕ Creating client for firm: ${tenantId}`)

    // Insert into firm-specific database only
    const newClient = await dbRouter.queryFirmDatabase(
      tenantId,
      `INSERT INTO clients (name, email, phone, notes, created_at, updated_at, is_active)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), true)
       RETURNING id, name, email, phone, created_at`,
      [name, email, phone || null, notes || null]
    )

    return NextResponse.json({
      success: true,
      tenantId,
      client: newClient[0],
      message: 'Client created successfully'
    })

  } catch (error: unknown) {
    console.error('❌ Failed to create client:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to create client',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}
