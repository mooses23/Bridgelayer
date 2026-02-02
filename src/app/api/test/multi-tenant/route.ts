// Test API endpoint for the multi-tenant system
// GET /api/test/multi-tenant - Run system verification tests

import { NextResponse } from 'next/server'
import testMultiTenantSystem from '@/lib/test-multi-tenant'

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🚀 Starting multi-tenant system test...')
    
    const result = await testMultiTenantSystem()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Multi-tenant system test completed successfully',
        details: result,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Multi-tenant system test failed'
      }, { status: 500 })
    }
    
  } catch (error: unknown) {
    console.error('❌ Test endpoint error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      message: 'Failed to run multi-tenant system test'
    }, { status: 500 })
  }
}
