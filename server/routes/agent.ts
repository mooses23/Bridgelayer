import { Request, Response } from 'express';

export interface AgentRequest {
  tenantId: string;
  agentType: string;
  action: string;
  data: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  fallbackUsed?: boolean;
}

/**
 * Universal Agent Route Handler
 * 
 * Implements the agent-first architecture:
 * 1. All form submissions go through agents
 * 2. Agents decide whether to use integrations or local storage
 * 3. Consistent interface regardless of backend implementation
 */

/**
 * Handle agent submission requests
 */
export async function handleAgentSubmit(req: Request, res: Response) {
  try {
    const { tenantId, agentType, action, data }: AgentRequest = req.body;

    if (!tenantId || !agentType || !action || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tenantId, agentType, action, data'
      });
    }

    // For Phase 2, we'll simulate agent responses
    // In Phase 3, this will call actual integration services
    const response = await simulateAgentResponse(agentType, action, data);
    
    res.json(response);
  } catch (error) {
    console.error('Agent submit error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Handle agent query requests
 */
export async function handleAgentQuery(req: Request, res: Response) {
  try {
    const { tenantId, agentType, action }: AgentRequest = req.body;

    if (!tenantId || !agentType || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tenantId, agentType, action'
      });
    }

    // For Phase 2, return mock data
    const response = await simulateAgentQuery(agentType, action);
    
    res.json(response);
  } catch (error) {
    console.error('Agent query error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Simulate agent responses for Phase 2
 * This will be replaced with actual agent logic in Phase 3
 */
async function simulateAgentResponse(agentType: string, action: string, data: any): Promise<AgentResponse> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  switch (agentType) {
    case 'CLIENT_AGENT':
      return handleClientAgentSim(action, data);
    case 'BILLING_AGENT':
      return handleBillingAgentSim(action, data);
    case 'CASE_AGENT':
      return handleCaseAgentSim(action, data);
    case 'DOCUMENT_AGENT':
      return handleDocumentAgentSim(action, data);
    case 'CALENDAR_AGENT':
      return handleCalendarAgentSim(action, data);
    default:
      return { success: false, error: 'Unknown agent type' };
  }
}

async function simulateAgentQuery(agentType: string, action: string): Promise<AgentResponse> {
  switch (agentType) {
    case 'CLIENT_AGENT':
      if (action === 'GET_CLIENTS') {
        return {
          success: true,
          data: [
            {
              id: 1,
              name: "TechCorp Inc",
              type: "Corporate",
              contact: "John Smith",
              email: "john.smith@techcorp.com",
              phone: "(555) 123-4567",
              status: "Active",
              activeCases: 3,
              lastActivity: "2025-01-15"
            },
            {
              id: 2,
              name: "Sarah Johnson",
              type: "Individual", 
              contact: "Sarah Johnson",
              email: "sarah.johnson@email.com",
              phone: "(555) 987-6543",
              status: "Active",
              activeCases: 1,
              lastActivity: "2025-01-12"
            }
          ],
          fallbackUsed: true
        };
      }
      break;

    case 'BILLING_AGENT':
      if (action === 'GET_BILLING_DATA') {
        return {
          success: true,
          data: {
            timeEntries: [
              {
                id: 1,
                attorney: 'Sarah Wilson',
                client: 'ABC Corporation',
                description: 'Contract review and analysis',
                hours: 3.5,
                rate: 450,
                date: 'Jan 22, 2025'
              }
            ],
            invoices: [
              {
                id: 'INV-001',
                client: 'ABC Corporation',
                amount: 15750.00,
                status: 'Paid',
                date: 'Jan 15, 2025',
                dueDate: 'Jan 30, 2025'
              }
            ]
          },
          fallbackUsed: true
        };
      }
      break;
  }

  return { success: false, error: 'Unknown query action' };
}

function handleClientAgentSim(action: string, data: any): AgentResponse {
  switch (action) {
    case 'CREATE_CLIENT':
      return {
        success: true,
        data: {
          id: Date.now(),
          name: data.clientName,
          email: data.email,
          phone: data.phone,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        fallbackUsed: true
      };
    default:
      return { success: false, error: 'Unknown client action' };
  }
}

function handleBillingAgentSim(action: string, data: any): AgentResponse {
  switch (action) {
    case 'CREATE_TIME_ENTRY':
      return {
        success: true,
        data: {
          id: Date.now(),
          clientName: data.clientName,
          description: data.description,
          hours: parseFloat(data.hours),
          rate: parseFloat(data.billableRate),
          total: parseFloat(data.hours) * parseFloat(data.billableRate),
          date: data.date,
          billable: data.billable === 'true'
        },
        fallbackUsed: true
      };
    case 'CREATE_INVOICE':
      return {
        success: true,
        data: {
          id: `INV-${Date.now()}`,
          clientName: data.clientName,
          amount: parseFloat(data.amount),
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          status: 'pending'
        },
        fallbackUsed: true
      };
    default:
      return { success: false, error: 'Unknown billing action' };
  }
}

function handleCaseAgentSim(action: string, data: any): AgentResponse {
  switch (action) {
    case 'CREATE_CASE':
      return {
        success: true,
        data: {
          id: Date.now(),
          title: data.caseTitle,
          clientName: data.clientName,
          matterType: data.matterType,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        fallbackUsed: true
      };
    default:
      return { success: false, error: 'Unknown case action' };
  }
}

function handleDocumentAgentSim(action: string, data: any): AgentResponse {
  switch (action) {
    case 'PROCESS_DOCUMENT':
      return {
        success: true,
        data: {
          requestId: Date.now(),
          documentType: data.documentType,
          status: 'processing',
          message: 'Document processing request received and queued'
        },
        fallbackUsed: true
      };
    default:
      return { success: false, error: 'Unknown document action' };
  }
}

function handleCalendarAgentSim(action: string, data: any): AgentResponse {
  switch (action) {
    case 'CREATE_APPOINTMENT':
      return {
        success: true,
        data: {
          id: Date.now(),
          title: data.title,
          clientName: data.clientName,
          date: data.appointmentDate,
          startTime: data.startTime,
          duration: data.duration,
          status: 'scheduled'
        },
        fallbackUsed: true
      };
    default:
      return { success: false, error: 'Unknown calendar action' };
  }
}
