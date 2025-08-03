// ITTT Framework Types and Interfaces
// Global automation framework for no-code admin configuration

export interface ITTTRule {
  id: string
  name: string
  description: string
  trigger: ITTTTrigger
  conditions: ITTTCondition[]
  actions: ITTTAction[]
  isActive: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface ITTTTrigger {
  type: 'client_added' | 'client_updated' | 'client_contacted' | 'document_uploaded' | 'case_created' | 'time_entry_added'
  eventData?: Record<string, unknown>
}

export interface ITTTCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_empty' | 'is_empty'
  value: string | number | boolean
  logicalOperator?: 'AND' | 'OR'
}

export interface ITTTAction {
  type: 'send_email' | 'create_task' | 'update_field' | 'send_sms' | 'create_document' | 'log_activity' | 'webhook_call'
  target: string
  payload: Record<string, string | number | boolean>
  delayMinutes?: number
}

// IHO Framework (In Host Out) - Simple interface pattern
export interface IHOInterface {
  mode: 'native' | 'integration'
  component: IHOComponent
  actions: IHOAction[]
}

export interface IHOComponent {
  type: 'client' | 'case' | 'document' | 'billing' | 'calendar'
  operations: ('add' | 'view' | 'edit' | 'contact' | 'archive')[]
}

export interface IHOAction {
  operation: 'add' | 'view' | 'edit' | 'contact' | 'archive'
  native: {
    component: string
    method: string
    params?: Record<string, string | number | boolean>
  }
  integration?: {
    provider: string
    endpoint: string
    mapping: Record<string, string>
  }
}

// Client-specific types for the page
export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  status: 'active' | 'inactive' | 'lead' | 'archived'
  clientType: 'individual' | 'business'
  notes: string
  tags: string[]
  lastContact: string
  createdAt: string
  updatedAt: string
  metadata: Record<string, string | number | boolean>
}

export interface ClientAction {
  type: 'ADD' | 'EDIT' | 'VIEW' | 'CONTACT' | 'ARCHIVE'
  client?: Client
  payload?: Record<string, string | number | boolean>
}

// Feature toggle for native vs integration
export interface FeatureMode {
  clients: 'native' | 'integration'
  integrationProvider?: 'salesforce' | 'hubspot' | 'custom' | null
  fallbackToNative: boolean
}

export interface ContactMethod {
  type: 'email' | 'phone' | 'sms' | 'meeting'
  template: string
  autoTrigger: boolean
  itttRuleId?: string
}

// Dashboard Types
export interface DashboardMetrics {
  activeClients: number
  newClients: number
  revenue: number
  billableHours: number
  timeframe: string
}

export interface RecentActivity {
  type: string
  action: string
  description: string
  timestamp: string
  icon: string
}

export interface SystemAlert {
  id: number
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  timestamp: string
  resolved: boolean
}

// Case Types
export interface Case {
  id: string
  title: string
  clientId: string
  clientName?: string
  caseType: 'litigation' | 'corporate' | 'real_estate' | 'family' | 'criminal' | 'other'
  status: 'active' | 'pending' | 'closed' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  retainerAmount?: number
  hourlyRate?: number
  assignedAttorney?: string
  dateOpened: string
  dateClosed?: string
  nextDeadline?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CaseParams {
  status?: string
  clientId?: string
  caseType?: string
  limit?: number
  offset?: number
}

// Billing Types
export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  clientName?: string
  caseId?: string
  caseTitle?: string
  amount: number
  tax?: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  issuedDate: string
  paidDate?: string
  description: string
  notes?: string
  lineItems: InvoiceLineItem[]
  items?: InvoiceLineItem[] // For backward compatibility
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
  type: 'time' | 'expense' | 'fixed'
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other'
  paymentMethod?: string // For backward compatibility
  paymentDate?: string // For backward compatibility
  transactionId?: string
  notes?: string
  receivedDate: string
  status?: 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: string
  updatedAt?: string
}

export interface TimeEntry {
  id: string
  clientId: string
  caseId?: string
  description: string
  hours: number
  rate: number
  amount: number
  billable: boolean
  invoiced: boolean
  billed?: boolean // For backward compatibility
  invoiceId?: string
  date: string
  attorney: string
  attorneyId?: string // For backward compatibility
  createdAt: string
  updatedAt: string
}

export interface BillingParams {
  clientId?: string
  caseId?: string
  attorneyId?: string
  status?: string
  dateRange?: {
    startDate: string
    endDate: string
  }
  dateFrom?: string // For backward compatibility
  dateTo?: string // For backward compatibility
  billable?: boolean
  billed?: boolean
  invoiced?: boolean
  limit?: number
  offset?: number
}

// Calendar Types
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  allDay: boolean
  location?: string
  attendees?: string[]
  clientId?: string
  caseId?: string
  eventType: 'appointment' | 'court_date' | 'deadline' | 'meeting' | 'consultation' | 'other'
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  reminderMinutes?: number
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
  }
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CalendarParams {
  startDate?: string
  endDate?: string
  clientId?: string
  caseId?: string
  eventType?: string
  status?: string
  createdBy?: string
  limit?: number
  offset?: number
}

// Reports types
export interface Report {
  id: string
  name: string
  type: 'financial' | 'case' | 'time' | 'client' | 'billing' | 'custom'
  description?: string
  parameters: ReportParameters
  data?: unknown[]
  generatedAt: string
  format: 'json' | 'pdf' | 'csv' | 'excel'
  scheduledRecurrence?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  nextScheduledRun?: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  filePath?: string
  fileSize?: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ReportParameters {
  dateRange?: {
    startDate: string
    endDate: string
  }
  clients?: string[]
  cases?: string[]
  billableOnly?: boolean
  includeArchived?: boolean
  groupBy?: string
  sortBy?: string
  filters?: Record<string, unknown>
  customFields?: string[]
}

export interface ReportTemplate {
  id: string
  name: string
  type: 'financial' | 'case' | 'time' | 'client' | 'billing' | 'custom'
  description: string
  defaultParameters: ReportParameters
  fields: ReportField[]
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ReportField {
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency'
  source: string // table.column format
  required: boolean
  sortable: boolean
  filterable: boolean
}

export interface ReportsParams {
  type?: 'financial' | 'case' | 'time' | 'client' | 'billing' | 'custom'
  status?: 'pending' | 'generating' | 'completed' | 'failed'
  createdBy?: string
  dateRange?: {
    startDate: string
    endDate: string
  }
  limit?: number
  offset?: number
}
