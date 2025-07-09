/**
 * Core interfaces for Phase 3 Agent Backend System
 * 
 * These interfaces define the contract between agent routing logic
 * and specific integration implementations.
 */

export interface AgentRequest {
  tenantId: string;
  agentType: 'CLIENT_AGENT' | 'BILLING_AGENT' | 'CASE_AGENT' | 'DOCUMENT_AGENT' | 'CALENDAR_AGENT';
  action: string;
  data: Record<string, any>;
  userId?: string;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  integration?: string; // 'quickbooks', 'salesforce', 'local', etc.
  fallbackUsed?: boolean;
  requestId?: string;
}

/**
 * Standard interface all agent backends must implement
 */
export interface AgentBackend {
  readonly integration: string;
  readonly firmId: number;
  
  /**
   * Check if this backend is available and properly configured
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Process an agent action with the specific integration
   */
  processAction(action: string, data: any): Promise<AgentResponse>;
  
  /**
   * Health check for admin dashboard
   */
  healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    lastSuccessful?: Date;
    errorCount?: number;
  }>;
}

/**
 * Billing Agent Actions
 */
export interface BillingAgentBackend extends AgentBackend {
  createTimeEntry(data: TimeEntryData): Promise<AgentResponse>;
  createInvoice(data: InvoiceData): Promise<AgentResponse>;
  getTimeEntries(filters?: any): Promise<AgentResponse>;
  getInvoices(filters?: any): Promise<AgentResponse>;
}

/**
 * Client Agent Actions  
 */
export interface ClientAgentBackend extends AgentBackend {
  createClient(data: ClientData): Promise<AgentResponse>;
  updateClient(id: string, data: Partial<ClientData>): Promise<AgentResponse>;
  getClients(filters?: any): Promise<AgentResponse>;
  getClient(id: string): Promise<AgentResponse>;
}

/**
 * Case Agent Actions
 */
export interface CaseAgentBackend extends AgentBackend {
  createCase(data: CaseData): Promise<AgentResponse>;
  updateCase(id: string, data: Partial<CaseData>): Promise<AgentResponse>;
  getCases(filters?: any): Promise<AgentResponse>;
  getCase(id: string): Promise<AgentResponse>;
}

/**
 * Calendar Agent Actions
 */
export interface CalendarAgentBackend extends AgentBackend {
  createAppointment(data: AppointmentData): Promise<AgentResponse>;
  updateAppointment(id: string, data: Partial<AppointmentData>): Promise<AgentResponse>;
  getAppointments(filters?: any): Promise<AgentResponse>;
  cancelAppointment(id: string): Promise<AgentResponse>;
}

/**
 * Document Agent Actions
 */
export interface DocumentAgentBackend extends AgentBackend {
  processDocument(data: DocumentProcessingData): Promise<AgentResponse>;
  generateDocument(data: DocumentGenerationData): Promise<AgentResponse>;
  getDocuments(filters?: any): Promise<AgentResponse>;
}

/**
 * Data Transfer Objects
 */
export interface TimeEntryData {
  clientName: string;
  caseNumber?: string;
  description: string;
  hours: number;
  billableRate: number;
  date: string;
  billable: boolean;
}

export interface InvoiceData {
  clientName: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  services: string;
  terms: string;
}

export interface ClientData {
  clientName: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  matterType: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CaseData {
  caseTitle: string;
  clientName: string;
  matterType: string;
  opposingParty?: string;
  jurisdiction?: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedValue?: number;
}

export interface AppointmentData {
  title: string;
  clientName: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  location?: string;
  description: string;
  attendees?: string;
}

export interface DocumentProcessingData {
  documentType: string;
  clientName: string;
  templateRequired: boolean;
  description: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface DocumentGenerationData {
  documentType: string;
  templateId?: string;
  clientData: Record<string, any>;
  customFields: Record<string, any>;
}

/**
 * Firm Integration Configuration
 */
export interface FirmIntegrationConfig {
  firmId: number;
  integrations: {
    quickbooks?: {
      enabled: boolean;
      companyId?: string;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: Date;
    };
    salesforce?: {
      enabled: boolean;
      instanceUrl?: string;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: Date;
    };
    googleCalendar?: {
      enabled: boolean;
      calendarId?: string;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: Date;
    };
    [key: string]: any;
  };
}

/**
 * Agent Routing Decision
 */
export interface AgentRoutingDecision {
  agentType: string;
  backend: AgentBackend;
  fallbackBackend?: AgentBackend;
  integrationName: string;
}

/**
 * Integration Health Status
 */
export interface IntegrationHealth {
  integration: string;
  status: 'healthy' | 'degraded' | 'down';
  lastSuccessful?: Date;
  lastError?: string;
  errorCount: number;
  responseTime?: number;
}

/**
 * Audit Log Entry
 */
export interface AgentAuditLog {
  id: string;
  firmId: number;
  agentType: string;
  action: string;
  integration: string;
  success: boolean;
  responseTime: number;
  error?: string;
  timestamp: Date;
}
