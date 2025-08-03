// Demo API route for ITTT-powered client management
// Tests the IHO framework with automatic ITTT triggers

import { NextRequest, NextResponse } from 'next/server'
import IHOManager from '@/lib/iho-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params
    const ihoManager = new IHOManager(tenantId)
    
    console.log(`🧪 Testing IHO Client Management for tenant: ${tenantId}`)

    // Initialize IHO mode
    const featureMode = await ihoManager.initializeMode(tenantId)
    console.log('🔧 Feature Mode:', featureMode)

    // Test 1: Add a demo client (triggers ITTT rules)
    console.log('➕ Testing client addition...')
    const newClient = await ihoManager.executeClientOperation(tenantId, 'add', {
      firstName: 'Demo',
      lastName: 'Client',
      email: `demo.client.${Date.now()}@example.com`,
      phone: '+1-555-0123',
      company: 'Demo Law Firm',
      clientType: 'business',
      status: 'active',
      notes: 'Test client created via IHO framework'
    })

    // Test 2: View all clients
    console.log('👀 Testing client viewing...')
    const allClients = await ihoManager.executeClientOperation(tenantId, 'view')

    // Test 3: Contact the client (triggers ITTT rules)
    console.log('📧 Testing client contact...')
    const contactResult = await ihoManager.executeClientOperation(tenantId, 'contact', {
      id: (newClient as any).id,
      email: (newClient as any).email
    })

    return NextResponse.json({
      success: true,
      message: 'IHO Client Management test completed successfully',
      results: {
        featureMode,
        newClient,
        totalClients: Array.isArray(allClients) ? allClients.length : 0,
        contactResult,
        timestamp: new Date().toISOString()
      },
      framework: {
        mode: 'IHO (In Host Out)',
        operations: ['ADD', 'VIEW', 'EDIT', 'CONTACT'],
        automation: 'ITTT (If This Then That)',
        database: 'Native Neon per-firm isolation'
      }
    })

  } catch (error: unknown) {
    console.error('❌ IHO Client Management test failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      message: 'IHO Client Management test failed'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params
    const { operation, clientData } = await request.json()
    
    const ihoManager = new IHOManager(tenantId)
    
    const result = await ihoManager.executeClientOperation(
      tenantId,
      operation,
      clientData
    )

    return NextResponse.json({
      success: true,
      operation,
      result,
      tenantId
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
