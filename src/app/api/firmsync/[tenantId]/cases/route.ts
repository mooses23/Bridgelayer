import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await context.params;
    
    // TODO: Implement cases fetching logic
    return NextResponse.json({
      success: true,
      tenantId,
      cases: [],
      message: 'Cases endpoint - implementation pending'
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
