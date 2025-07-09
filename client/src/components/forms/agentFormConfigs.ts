import { AgentFormField } from './AgentForm';
import * as yup from 'yup';

// Common field configurations
export const commonFields = {
  clientName: {
    name: 'clientName',
    label: 'Client Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter client name'
  },
  email: {
    name: 'email',
    label: 'Email Address',
    type: 'email' as const,
    required: true,
    placeholder: 'client@example.com'
  },
  phone: {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel' as const,
    required: false,
    placeholder: '(555) 123-4567'
  },
  description: {
    name: 'description',
    label: 'Description',
    type: 'textarea' as const,
    required: true,
    placeholder: 'Describe the matter or request'
  },
  priority: {
    name: 'priority',
    label: 'Priority',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' }
    ]
  },
  matterType: {
    name: 'matterType',
    label: 'Matter Type',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'personal-injury', label: 'Personal Injury' },
      { value: 'criminal-defense', label: 'Criminal Defense' },
      { value: 'family-law', label: 'Family Law' },
      { value: 'estate-planning', label: 'Estate Planning' },
      { value: 'business-law', label: 'Business Law' },
      { value: 'real-estate', label: 'Real Estate' },
      { value: 'employment-law', label: 'Employment Law' },
      { value: 'immigration', label: 'Immigration' },
      { value: 'bankruptcy', label: 'Bankruptcy' },
      { value: 'other', label: 'Other' }
    ]
  },
  amount: {
    name: 'amount',
    label: 'Amount',
    type: 'number' as const,
    required: true,
    placeholder: '0.00'
  },
  hours: {
    name: 'hours',
    label: 'Hours',
    type: 'number' as const,
    required: true,
    placeholder: '0.00'
  },
  billableRate: {
    name: 'billableRate',
    label: 'Billable Rate',
    type: 'number' as const,
    required: true,
    placeholder: '450.00'
  },
  date: {
    name: 'date',
    label: 'Date',
    type: 'date' as const,
    required: true
  }
};

// Agent-specific form configurations
export const agentFormConfigs = {
  // Client Management Agent
  clientIntake: {
    title: 'New Client Intake',
    description: 'Add a new client to your firm',
    agentType: 'CLIENT_AGENT',
    action: 'CREATE_CLIENT',
    submitLabel: 'Add Client',
    fields: [
      commonFields.clientName,
      commonFields.email,
      commonFields.phone,
      {
        name: 'address',
        label: 'Address',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Enter client address'
      },
      {
        name: 'company',
        label: 'Company',
        type: 'text' as const,
        required: false,
        placeholder: 'Company name (if applicable)'
      },
      commonFields.matterType,
      commonFields.description,
      commonFields.priority
    ]
  },

  // Billing Agent  
  timeEntry: {
    title: 'Time Entry',
    description: 'Log billable time for a client matter',
    agentType: 'BILLING_AGENT',
    action: 'CREATE_TIME_ENTRY',
    submitLabel: 'Log Time',
    fields: [
      commonFields.clientName,
      {
        name: 'caseNumber',
        label: 'Case Number',
        type: 'text' as const,
        required: false,
        placeholder: 'Optional case reference'
      },
      commonFields.description,
      commonFields.hours,
      commonFields.billableRate,
      commonFields.date,
      {
        name: 'billable',
        label: 'Billable',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'true', label: 'Billable' },
          { value: 'false', label: 'Non-billable' }
        ]
      }
    ]
  },

  invoice: {
    title: 'Create Invoice',
    description: 'Generate an invoice for client services',
    agentType: 'BILLING_AGENT', 
    action: 'CREATE_INVOICE',
    submitLabel: 'Create Invoice',
    fields: [
      commonFields.clientName,
      {
        name: 'invoiceDate',
        label: 'Invoice Date',
        type: 'date' as const,
        required: true
      },
      {
        name: 'dueDate',
        label: 'Due Date',
        type: 'date' as const,
        required: true
      },
      commonFields.amount,
      {
        name: 'services',
        label: 'Services Provided',
        type: 'textarea' as const,
        required: true,
        placeholder: 'Describe the services provided'
      },
      {
        name: 'terms',
        label: 'Payment Terms',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'net-15', label: 'Net 15 days' },
          { value: 'net-30', label: 'Net 30 days' },
          { value: 'net-60', label: 'Net 60 days' },
          { value: 'due-on-receipt', label: 'Due on receipt' }
        ]
      }
    ]
  },

  // Case Management Agent
  newCase: {
    title: 'New Case',
    description: 'Create a new case for a client',
    agentType: 'CASE_AGENT',
    action: 'CREATE_CASE',
    submitLabel: 'Create Case',
    fields: [
      {
        name: 'caseTitle',
        label: 'Case Title',
        type: 'text' as const,
        required: true,
        placeholder: 'Enter case title'
      },
      commonFields.clientName,
      commonFields.matterType,
      {
        name: 'opposingParty',
        label: 'Opposing Party',
        type: 'text' as const,
        required: false,
        placeholder: 'Name of opposing party (if applicable)'
      },
      {
        name: 'jurisdiction',
        label: 'Jurisdiction',
        type: 'text' as const,
        required: false,
        placeholder: 'Court or jurisdiction'
      },
      commonFields.description,
      commonFields.priority,
      {
        name: 'estimatedValue',
        label: 'Estimated Case Value',
        type: 'number' as const,
        required: false,
        placeholder: '0.00'
      }
    ]
  },

  // Document Agent
  documentRequest: {
    title: 'Document Request',
    description: 'Request document generation or analysis',
    agentType: 'DOCUMENT_AGENT',
    action: 'PROCESS_DOCUMENT',
    submitLabel: 'Submit Request',
    fields: [
      {
        name: 'documentType',
        label: 'Document Type',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'contract', label: 'Contract' },
          { value: 'nda', label: 'Non-Disclosure Agreement' },
          { value: 'cease-desist', label: 'Cease & Desist' },
          { value: 'demand-letter', label: 'Demand Letter' },
          { value: 'motion', label: 'Motion' },
          { value: 'brief', label: 'Brief' },
          { value: 'pleading', label: 'Pleading' },
          { value: 'other', label: 'Other' }
        ]
      },
      commonFields.clientName,
      {
        name: 'templateRequired',
        label: 'Use Template',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'yes', label: 'Yes, use existing template' },
          { value: 'no', label: 'No, create from scratch' }
        ]
      },
      commonFields.description,
      {
        name: 'deadline',
        label: 'Deadline',
        type: 'date' as const,
        required: false
      },
      commonFields.priority
    ]
  },

  // Calendar Agent
  appointment: {
    title: 'Schedule Appointment',
    description: 'Schedule a meeting or court appearance',
    agentType: 'CALENDAR_AGENT',
    action: 'CREATE_APPOINTMENT',
    submitLabel: 'Schedule',
    fields: [
      {
        name: 'title',
        label: 'Appointment Title',
        type: 'text' as const,
        required: true,
        placeholder: 'Meeting with client, Court hearing, etc.'
      },
      commonFields.clientName,
      {
        name: 'appointmentDate',
        label: 'Date',
        type: 'date' as const,
        required: true
      },
      {
        name: 'startTime',
        label: 'Start Time',
        type: 'text' as const,
        required: true,
        placeholder: '09:00 AM'
      },
      {
        name: 'duration',
        label: 'Duration (minutes)',
        type: 'number' as const,
        required: true,
        placeholder: '60'
      },
      {
        name: 'location',
        label: 'Location',
        type: 'text' as const,
        required: false,
        placeholder: 'Office, courthouse, video call'
      },
      commonFields.description,
      {
        name: 'attendees',
        label: 'Additional Attendees',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Email addresses of additional attendees'
      }
    ]
  }
};

export type AgentFormConfigKey = keyof typeof agentFormConfigs;
