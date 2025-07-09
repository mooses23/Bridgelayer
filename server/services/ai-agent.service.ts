import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { firms, clients, cases, timeLogs, invoices } from '../../shared/schema.js';

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
 * Universal Agent Service
 * 
 * This service implements the agent-first architecture where:
 * 1. Frontend always talks to agents (never directly to integrations)
 * 2. Agents decide whether to use integrations or local database
 * 3. Same UI works regardless of integration availability
 */
export class AgentService {
  
  /**
   * Process agent requests and route to appropriate handler
   */
  async processAgentRequest(request: AgentRequest): Promise<AgentResponse> {
    try {
      // Validate tenant access
      const firm = await this.validateTenant(request.tenantId);
      if (!firm) {
        return { success: false, error: 'Invalid tenant' };
      }

      // Route to appropriate agent
      switch (request.agentType) {
        case 'CLIENT_AGENT':
          return await this.handleClientAgent(request, firm);
        case 'BILLING_AGENT':
          return await this.handleBillingAgent(request, firm);
        case 'CASE_AGENT':
          return await this.handleCaseAgent(request, firm);
        case 'DOCUMENT_AGENT':
          return await this.handleDocumentAgent(request, firm);
        case 'CALENDAR_AGENT':
          return await this.handleCalendarAgent(request, firm);
        default:
          return { success: false, error: 'Unknown agent type' };
      }
    } catch (error) {
      console.error('Agent request failed:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Validate tenant and get firm data
   */
  private async validateTenant(tenantId: string): Promise<any> {
    try {
      const firm = await db.select().from(firms).where(eq(firms.id, parseInt(tenantId))).limit(1);
      return firm[0] || null;
    } catch (error) {
      console.error('Tenant validation failed:', error);
      return null;
    }
  }

  /**
   * Client Agent - Handles client management
   * Routes to CRM integration (if available) or local database
   */
  private async handleClientAgent(request: AgentRequest, firm: any): Promise<AgentResponse> {
    const { action, data } = request;

    switch (action) {
      case 'CREATE_CLIENT':
        return await this.createClient(data, firm);
      case 'GET_CLIENTS':
        return await this.getClients(firm);
      case 'UPDATE_CLIENT':
        return await this.updateClient(data, firm);
      default:
        return { success: false, error: 'Unknown client action' };
    }
  }

  /**
   * Billing Agent - Handles billing operations
   * Routes to billing integration (if available) or local database
   */
  private async handleBillingAgent(request: AgentRequest, firm: any): Promise<AgentResponse> {
    const { action, data } = request;

    switch (action) {
      case 'CREATE_TIME_ENTRY':
        return await this.createTimeEntry(data, firm);
      case 'CREATE_INVOICE':
        return await this.createInvoice(data, firm);
      case 'GET_BILLING_DATA':
        return await this.getBillingData(firm);
      default:
        return { success: false, error: 'Unknown billing action' };
    }
  }

  /**
   * Case Agent - Handles case management
   */
  private async handleCaseAgent(request: AgentRequest, firm: any): Promise<AgentResponse> {
    const { action, data } = request;

    switch (action) {
      case 'CREATE_CASE':
        return await this.createCase(data, firm);
      case 'GET_CASES':
        return await this.getCases(firm);
      default:
        return { success: false, error: 'Unknown case action' };
    }
  }

  /**
   * Document Agent - Handles document processing
   */
  private async handleDocumentAgent(request: AgentRequest, firm: any): Promise<AgentResponse> {
    const { action, data } = request;

    switch (action) {
      case 'PROCESS_DOCUMENT':
        return await this.processDocument(data, firm);
      case 'GENERATE_DOCUMENT':
        return await this.generateDocument(data, firm);
      default:
        return { success: false, error: 'Unknown document action' };
    }
  }

  /**
   * Calendar Agent - Handles scheduling
   */
  private async handleCalendarAgent(request: AgentRequest, firm: any): Promise<AgentResponse> {
    const { action, data } = request;

    switch (action) {
      case 'CREATE_APPOINTMENT':
        return await this.createAppointment(data, firm);
      case 'GET_APPOINTMENTS':
        return await this.getAppointments(firm);
      default:
        return { success: false, error: 'Unknown calendar action' };
    }
  }

  // Implementation methods for each agent type
  
  private async createClient(data: any, firm: any): Promise<AgentResponse> {
    try {
      // TODO: Check if firm has CRM integration (Salesforce, HubSpot, etc.)
      // If integration exists, use it; otherwise use local database
      
      // For now, use local database (integration will be added later)
      const newClient = await db.insert(clients).values({
        firmId: firm.id,
        name: data.clientName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        company: data.company,
        matterType: data.matterType,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return { 
        success: true, 
        data: newClient[0],
        fallbackUsed: true // Indicates we used local DB instead of integration
      };
    } catch (error) {
      console.error('Failed to create client:', error);
      return { success: false, error: 'Failed to create client' };
    }
  }

  private async getClients(firm: any): Promise<AgentResponse> {
    try {
      // TODO: Check if firm has CRM integration and prefer that data
      const firmClients = await db.select().from(clients).where(eq(clients.firmId, firm.id));
      
      return { 
        success: true, 
        data: firmClients,
        fallbackUsed: true
      };
    } catch (error) {
      console.error('Failed to get clients:', error);
      return { success: false, error: 'Failed to retrieve clients' };
    }
  }

  private async updateClient(data: any, firm: any): Promise<AgentResponse> {
    try {
      const updatedClient = await db.update(clients)
        .set({
          name: data.clientName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          company: data.company,
          updatedAt: new Date()
        })
        .where(eq(clients.id, data.id))
        .returning();

      return { success: true, data: updatedClient[0] };
    } catch (error) {
      console.error('Failed to update client:', error);
      return { success: false, error: 'Failed to update client' };
    }
  }

  private async createTimeEntry(data: any, firm: any): Promise<AgentResponse> {
    try {
      // TODO: Check if firm has billing integration (QuickBooks, etc.)
      // TODO: Resolve clientId from clientName
      
      const newTimeEntry = await db.insert(timeLogs).values({
        firmId: firm.id,
        userId: 1, // TODO: Get from session/auth
        clientId: null, // Will need to resolve client by name
        description: data.description,
        hours: Math.round(parseFloat(data.hours) * 100), // Convert to minutes
        billableRate: Math.round(parseFloat(data.billableRate) * 100), // Convert to cents
        loggedAt: new Date(data.date),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return { 
        success: true, 
        data: newTimeEntry[0],
        fallbackUsed: true
      };
    } catch (error) {
      console.error('Failed to create time entry:', error);
      return { success: false, error: 'Failed to create time entry' };
    }
  }

  private async createInvoice(data: any, firm: any): Promise<AgentResponse> {
    try {
      const newInvoice = await db.insert(invoices).values({
        firmId: firm.id,
        clientName: data.clientName,
        amount: parseFloat(data.amount),
        invoiceDate: new Date(data.invoiceDate),
        dueDate: new Date(data.dueDate),
        services: data.services,
        terms: data.terms,
        status: 'pending',
        createdAt: new Date()
      }).returning();

      return { 
        success: true, 
        data: newInvoice[0],
        fallbackUsed: true
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      return { success: false, error: 'Failed to create invoice' };
    }
  }

  private async getBillingData(firm: any): Promise<AgentResponse> {
    try {
      const [firmTimeEntries, firmInvoices] = await Promise.all([
        db.select().from(timeEntries).where(eq(timeEntries.firmId, firm.id)),
        db.select().from(invoices).where(eq(invoices.firmId, firm.id))
      ]);

      return {
        success: true,
        data: {
          timeEntries: firmTimeEntries,
          invoices: firmInvoices
        },
        fallbackUsed: true
      };
    } catch (error) {
      console.error('Failed to get billing data:', error);
      return { success: false, error: 'Failed to retrieve billing data' };
    }
  }

  private async createCase(data: any, firm: any): Promise<AgentResponse> {
    try {
      const newCase = await db.insert(cases).values({
        firmId: firm.id,
        title: data.caseTitle,
        clientName: data.clientName,
        matterType: data.matterType,
        opposingParty: data.opposingParty,
        jurisdiction: data.jurisdiction,
        description: data.description,
        priority: data.priority,
        estimatedValue: data.estimatedValue ? parseFloat(data.estimatedValue) : null,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return { 
        success: true, 
        data: newCase[0],
        fallbackUsed: true
      };
    } catch (error) {
      console.error('Failed to create case:', error);
      return { success: false, error: 'Failed to create case' };
    }
  }

  private async getCases(firm: any): Promise<AgentResponse> {
    try {
      const firmCases = await db.select().from(cases).where(eq(cases.firmId, firm.id));
      return { success: true, data: firmCases };
    } catch (error) {
      console.error('Failed to get cases:', error);
      return { success: false, error: 'Failed to retrieve cases' };
    }
  }

  private async processDocument(data: any, firm: any): Promise<AgentResponse> {
    // Placeholder for document processing
    return { 
      success: true, 
      data: { message: 'Document processing request received' },
      fallbackUsed: true
    };
  }

  private async generateDocument(data: any, firm: any): Promise<AgentResponse> {
    // Placeholder for document generation
    return { 
      success: true, 
      data: { message: 'Document generation request received' },
      fallbackUsed: true
    };
  }

  private async createAppointment(data: any, firm: any): Promise<AgentResponse> {
    // Placeholder for calendar integration
    return { 
      success: true, 
      data: { message: 'Appointment created', appointment: data },
      fallbackUsed: true
    };
  }

  private async getAppointments(firm: any): Promise<AgentResponse> {
    // Placeholder for calendar data
    return { 
      success: true, 
      data: [],
      fallbackUsed: true
    };
  }
}

export const agentService = new AgentService();
