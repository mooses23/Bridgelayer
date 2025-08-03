import { NextRequest, NextResponse } from 'next/server';
import { IHOManager } from '@/lib/iho-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    
    // Initialize IHO Manager for this tenant
    const ihoManager = new IHOManager(tenantId);
    await ihoManager.initializeMode(tenantId);
    
    // Get all clients for this tenant
    const clients = await ihoManager.executeClientOperation(tenantId, 'view');
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const body = await request.json();
    
    // Initialize IHO Manager for this tenant
    const ihoManager = new IHOManager(tenantId);
    await ihoManager.initializeMode(tenantId);
    
    // Create new client
    const newClient = await ihoManager.executeClientOperation(tenantId, 'add', body);
    
    return NextResponse.json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const body = await request.json();
    
    // Initialize IHO Manager for this tenant
    const ihoManager = new IHOManager(tenantId);
    await ihoManager.initializeMode(tenantId);
    
    // Update existing client
    const updatedClient = await ihoManager.executeClientOperation(tenantId, 'edit', body);
    
    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { tenantId } = params;
    const body = await request.json();
    
    // Initialize IHO Manager for this tenant
    const ihoManager = new IHOManager(tenantId);
    await ihoManager.initializeMode(tenantId);
    
    // Handle different patch operations
    if (body.action === 'contact') {
      const result = await ihoManager.executeClientOperation(tenantId, 'contact', {
        id: body.id,
        email: body.email
      });
      return NextResponse.json(result);
    }
    
    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling client action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
