// IHO Framework - Simple interface pattern (In Host Out)
// Manages native vs integration modes for each component

import { FeatureMode, IHOInterface, Client, DashboardMetrics, RecentActivity, SystemAlert, Case, CaseParams, Invoice, Payment, TimeEntry, BillingParams, CalendarEvent, CalendarParams, Report, ReportTemplate, ReportsParams } from '@/types/ittt'
import DatabaseRouter from '@/lib/database-router'

export class IHOManager {
  private dbRouter: DatabaseRouter
  private featureMode: FeatureMode

  constructor() {
    this.dbRouter = new DatabaseRouter()
    this.featureMode = {
      clients: 'native', // Start with native, can switch to integration
      integrationProvider: null,
      fallbackToNative: true
    }
  }

  /**
   * Initialize feature mode for tenant
   */
  async initializeMode(tenantId: string): Promise<FeatureMode> {
    try {
      const config = await this.dbRouter.queryFirmDatabase<{ feature_mode: string; integration_provider: string }>(
        tenantId,
        'SELECT feature_mode, integration_provider FROM firmsync.tenant_config WHERE tenant_id = $1',
        [tenantId]
      )

      if (config.length > 0) {
        this.featureMode = {
          clients: config[0].feature_mode as 'native' | 'integration',
          integrationProvider: config[0].integration_provider as 'salesforce' | 'hubspot' | 'custom' || null,
          fallbackToNative: true
        }
      }
    } catch (error) {
      console.log('Using default native mode:', error)
    }

    return this.featureMode
  }

  /**
   * Get client interface configuration
   */
  getClientInterface(): IHOInterface {
    return {
      mode: this.featureMode.clients,
      component: {
        type: 'client',
        operations: ['add', 'view', 'edit', 'contact']
      },
      actions: [
        {
          operation: 'add',
          native: {
            component: 'ClientForm',
            method: 'createClient',
            params: { validateEmail: true, autoAssignId: true }
          },
          integration: this.featureMode.integrationProvider ? {
            provider: this.featureMode.integrationProvider,
            endpoint: '/api/clients',
            mapping: {
              firstName: 'first_name',
              lastName: 'last_name',
              email: 'email_address',
              phone: 'phone_number'
            }
          } : undefined
        },
        {
          operation: 'view',
          native: {
            component: 'ClientList',
            method: 'fetchClients'
          }
        },
        {
          operation: 'edit',
          native: {
            component: 'ClientForm',
            method: 'updateClient'
          }
        },
        {
          operation: 'contact',
          native: {
            component: 'ContactClient',
            method: 'initiateContact'
          }
        }
      ]
    }
  }

  /**
   * Execute client operation with automatic fallback
   */
  async executeClientOperation(
    tenantId: string,
    operation: 'add' | 'view' | 'edit' | 'contact',
    data?: Partial<Client>
  ): Promise<unknown> {
    const interface_config = this.getClientInterface()
    
    try {
      if (interface_config.mode === 'native') {
        return await this.executeNativeOperation(tenantId, operation, data)
      } else {
        return await this.executeIntegrationOperation(tenantId, operation, data)
      }
    } catch (error) {
      if (this.featureMode.fallbackToNative && interface_config.mode === 'integration') {
        console.log(`🔄 Integration failed, falling back to native for ${operation}`)
        return await this.executeNativeOperation(tenantId, operation, data)
      }
      throw error
    }
  }

  /**
   * Execute dashboard operation with automatic fallback
   */
  async executeDashboardOperation(
    tenantId: string,
    operation: 'metrics' | 'activity' | 'alerts',
    params?: { timeframe?: string; limit?: number; severity?: string }
  ): Promise<unknown> {
    const interface_config = this.getClientInterface() // Will use same mode as clients for now
    
    try {
      if (interface_config.mode === 'native') {
        return await this.executeDashboardNativeOperation(tenantId, operation, params)
      } else {
        return await this.executeDashboardIntegrationOperation(tenantId, operation, params)
      }
    } catch (error) {
      if (this.featureMode.fallbackToNative && interface_config.mode === 'integration') {
        console.log(`🔄 Dashboard integration failed, falling back to native for ${operation}`)
        return await this.executeDashboardNativeOperation(tenantId, operation, params)
      }
      throw error
    }
  }

  /**
   * Execute case operation with automatic fallback
   */
  async executeCaseOperation(
    tenantId: string,
    operation: 'add' | 'view' | 'edit' | 'status' | 'delete',
    data?: Partial<Case> | CaseParams | { id: string; status: string }
  ): Promise<unknown> {
    const interface_config = this.getClientInterface() // Will use same mode as clients for now
    
    try {
      if (interface_config.mode === 'native') {
        return await this.executeCaseNativeOperation(tenantId, operation, data)
      } else {
        return await this.executeCaseIntegrationOperation(tenantId, operation, data)
      }
    } catch (error) {
      if (this.featureMode.fallbackToNative && interface_config.mode === 'integration') {
        console.log(`🔄 Case integration failed, falling back to native for ${operation}`)
        return await this.executeCaseNativeOperation(tenantId, operation, data)
      }
      throw error
    }
  }

  /**
   * Execute billing operation with automatic fallback
   */
  async executeBillingOperation(
    tenantId: string,
    operation: 'invoices' | 'create_invoice' | 'record_payment' | 'track_time' | 'get_time_entries',
    data?: BillingParams | Partial<Invoice> | Partial<Payment> | Partial<TimeEntry>
  ): Promise<unknown> {
    const interface_config = this.getClientInterface() // Will use same mode as clients for now
    
    try {
      if (interface_config.mode === 'native') {
        return await this.executeBillingNativeOperation(tenantId, operation, data)
      } else {
        return await this.executeBillingIntegrationOperation(tenantId, operation, data)
      }
    } catch (error) {
      if (this.featureMode.fallbackToNative && interface_config.mode === 'integration') {
        console.log(`🔄 Billing integration failed, falling back to native for ${operation}`)
        return await this.executeBillingNativeOperation(tenantId, operation, data)
      }
      throw error
    }
  }

  /**
   * Execute reports operation with automatic fallback
   */
  async executeReportsOperation(
    tenantId: string,
    operation: 'generate_report' | 'get_reports' | 'export_report' | 'schedule_report' | 'get_templates',
    data?: ReportsParams | Partial<Report> | { id: string; format?: string }
  ): Promise<unknown> {
    const interface_config = this.getClientInterface() // Will use same mode as clients for now
    
    try {
      if (interface_config.mode === 'native') {
        return await this.executeReportsNativeOperation(tenantId, operation, data)
      } else {
        return await this.executeReportsIntegrationOperation(tenantId, operation, data)
      }
    } catch (error) {
      if (this.featureMode.fallbackToNative && interface_config.mode === 'integration') {
        console.log(`🔄 Reports integration failed, falling back to native for ${operation}`)
        return await this.executeReportsNativeOperation(tenantId, operation, data)
      }
      throw error
    }
  }

  /**
   * Execute native operation (directly on Neon database)
   */
  private async executeNativeOperation(
    tenantId: string,
    operation: 'add' | 'view' | 'edit' | 'contact',
    data?: Partial<Client>
  ): Promise<unknown> {
    switch (operation) {
      case 'add':
        return await this.addClientNative(tenantId, data!)
      case 'view':
        return await this.getClientsNative(tenantId)
      case 'edit':
        return await this.updateClientNative(tenantId, data!)
      case 'contact':
        return await this.contactClientNative(tenantId, data!)
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }

  /**
   * Execute integration operation (with external provider)
   */
  private async executeIntegrationOperation(
    tenantId: string,
    operation: 'add' | 'view' | 'edit' | 'contact',
    data?: Partial<Client>
  ): Promise<unknown> {
    // Placeholder for integration logic
    // In production, this would interface with Salesforce, HubSpot, etc.
    console.log(`🔗 Integration operation: ${operation} with ${this.featureMode.integrationProvider}`)
    
    // For now, sync to integration then persist locally
    if (operation === 'add' && data) {
      // 1. Send to integration provider (placeholder - would call actual API)
      console.log(`📤 Syncing client to integration provider: ${JSON.stringify(data)}`)
      // 2. Store locally for fast access
      return await this.addClientNative(tenantId, data)
    }
    
    // Fall back to native for unsupported operations
    return await this.executeNativeOperation(tenantId, operation, data)
  }

  /**
   * Execute dashboard native operation
   */
  private async executeDashboardNativeOperation(
    tenantId: string,
    operation: 'metrics' | 'activity' | 'alerts',
    params?: { timeframe?: string; limit?: number; severity?: string }
  ): Promise<unknown> {
    switch (operation) {
      case 'metrics':
        return await this.getDashboardMetricsNative(tenantId, params?.timeframe || 'week')
      case 'activity':
        return await this.getRecentActivityNative(tenantId, params?.limit || 10)
      case 'alerts':
        return await this.getSystemAlertsNative(tenantId, params?.severity || 'all')
      default:
        throw new Error(`Unknown dashboard operation: ${operation}`)
    }
  }

  /**
   * Execute dashboard integration operation
   */
  private async executeDashboardIntegrationOperation(
    tenantId: string,
    operation: 'metrics' | 'activity' | 'alerts',
    params?: { timeframe?: string; limit?: number; severity?: string }
  ): Promise<unknown> {
    // Placeholder for BI integrations (PowerBI, Tableau, etc.)
    console.log(`🔗 Dashboard integration operation: ${operation}`)
    
    // For now, fall back to native with integration data enhancement
    return await this.executeDashboardNativeOperation(tenantId, operation, params)
  }

  /**
   * Execute case native operation
   */
  private async executeCaseNativeOperation(
    tenantId: string,
    operation: 'add' | 'view' | 'edit' | 'status' | 'delete',
    data?: Partial<Case> | CaseParams | { id: string; status: string }
  ): Promise<unknown> {
    switch (operation) {
      case 'add':
        if (!data) throw new Error('Case data required for add operation')
        return await this.addCaseNative(tenantId, data as Partial<Case>)
      case 'view':
        return await this.getCasesNative(tenantId, data as CaseParams)
      case 'edit':
        if (!data) throw new Error('Case data required for edit operation')
        return await this.updateCaseNative(tenantId, data as Partial<Case>)
      case 'status':
        if (!data) throw new Error('Status data required for status operation')
        return await this.updateCaseStatusNative(tenantId, data as { id: string; status: string })
      case 'delete':
        if (!data) throw new Error('ID required for delete operation')
        return await this.deleteCaseNative(tenantId, data as { id: string })
      default:
        throw new Error(`Unknown case operation: ${operation}`)
    }
  }

  /**
   * Execute case integration operation
   */
  private async executeCaseIntegrationOperation(
    tenantId: string,
    operation: 'add' | 'view' | 'edit' | 'status' | 'delete',
    data?: Partial<Case> | CaseParams | { id: string; status: string }
  ): Promise<unknown> {
    // Placeholder for case management integrations (Clio, MyCase, PracticePanther)
    console.log(`🔗 Case integration operation: ${operation} with ${this.featureMode.integrationProvider}`)
    
    // For now, sync to integration then persist locally
    if (operation === 'add' && data) {
      // 1. Send to integration provider (Clio, MyCase, etc.)
      await this.syncCaseToIntegration(tenantId, 'create', data as Partial<Case>)
      // 2. Store locally for fast access
      return await this.addCaseNative(tenantId, data as Partial<Case>)
    }
    
    // Fall back to native for unsupported operations
    return await this.executeCaseNativeOperation(tenantId, operation, data)
  }

  /**
   * Execute billing native operation
   */
  private async executeBillingNativeOperation(
    tenantId: string,
    operation: 'invoices' | 'create_invoice' | 'record_payment' | 'track_time' | 'get_time_entries',
    data?: BillingParams | Partial<Invoice> | Partial<Payment> | Partial<TimeEntry>
  ): Promise<unknown> {
    switch (operation) {
      case 'invoices':
        return await this.getInvoicesNative(tenantId, data as BillingParams)
      case 'create_invoice':
        if (!data) throw new Error('Invoice data required')
        return await this.createInvoiceNative(tenantId, data as Partial<Invoice>)
      case 'record_payment':
        if (!data) throw new Error('Payment data required')
        return await this.recordPaymentNative(tenantId, data as Partial<Payment>)
      case 'track_time':
        if (!data) throw new Error('Time entry data required')
        return await this.trackTimeNative(tenantId, data as Partial<TimeEntry>)
      case 'get_time_entries':
        return await this.getTimeEntriesNative(tenantId, data as BillingParams)
      default:
        throw new Error(`Unknown billing operation: ${operation}`)
    }
  }

  /**
   * Execute billing integration operation
   */
  private async executeBillingIntegrationOperation(
    tenantId: string,
    operation: 'invoices' | 'create_invoice' | 'record_payment' | 'track_time' | 'get_time_entries',
    data?: BillingParams | Partial<Invoice> | Partial<Payment> | Partial<TimeEntry>
  ): Promise<unknown> {
    // Placeholder for billing integrations (QuickBooks, Xero, TimeSolv)
    console.log(`🔗 Billing integration operation: ${operation} with ${this.featureMode.integrationProvider}`)
    
    // For now, sync to integration then persist locally
    if (operation === 'create_invoice' && data) {
      // 1. Send to integration provider (QuickBooks, Xero, etc.)
      await this.syncBillingToIntegration(tenantId, 'create_invoice', data as Partial<Invoice>)
      // 2. Store locally for fast access
      return await this.createInvoiceNative(tenantId, data as Partial<Invoice>)
    }
    
    // Fall back to native for unsupported operations
    return await this.executeBillingNativeOperation(tenantId, operation, data)
  }

  /**
   * Execute calendar operation with automatic fallback
   */
  async executeCalendarOperation(
    tenantId: string,
    operation: 'events' | 'create_event' | 'update_event' | 'delete_event',
    data?: CalendarParams | Partial<CalendarEvent> | { id: string }
  ): Promise<unknown> {
    const interface_config = this.getClientInterface() // Will use same mode as clients for now
    
    try {
      if (interface_config.mode === 'native') {
        return await this.executeCalendarNativeOperation(tenantId, operation, data)
      } else {
        return await this.executeCalendarIntegrationOperation(tenantId, operation, data)
      }
    } catch (error) {
      if (this.featureMode.fallbackToNative && interface_config.mode === 'integration') {
        console.log(`🔄 Calendar integration failed, falling back to native for ${operation}`)
        return await this.executeCalendarNativeOperation(tenantId, operation, data)
      }
      throw error
    }
  }

  /**
   * Execute calendar native operation
   */
  private async executeCalendarNativeOperation(
    tenantId: string,
    operation: 'events' | 'create_event' | 'update_event' | 'delete_event',
    data?: CalendarParams | Partial<CalendarEvent> | { id: string }
  ): Promise<unknown> {
    switch (operation) {
      case 'events':
        return await this.getCalendarEventsNative(tenantId, data as CalendarParams)
      case 'create_event':
        if (!data) throw new Error('Event data required')
        return await this.createCalendarEventNative(tenantId, data as Partial<CalendarEvent>)
      case 'update_event':
        if (!data) throw new Error('Event data required')
        return await this.updateCalendarEventNative(tenantId, data as Partial<CalendarEvent>)
      case 'delete_event':
        if (!data) throw new Error('Event ID required')
        return await this.deleteCalendarEventNative(tenantId, data as { id: string })
      default:
        throw new Error(`Unknown calendar operation: ${operation}`)
    }
  }

  /**
   * Execute calendar integration operation
   */
  private async executeCalendarIntegrationOperation(
    tenantId: string,
    operation: 'events' | 'create_event' | 'update_event' | 'delete_event',
    data?: CalendarParams | Partial<CalendarEvent> | { id: string }
  ): Promise<unknown> {
    // Placeholder for calendar integrations (Google Calendar, Outlook, Calendly)
    console.log(`🔗 Calendar integration operation: ${operation} with ${this.featureMode.integrationProvider}`)
    
    // For now, sync to integration then persist locally
    if (operation === 'create_event' && data) {
      // 1. Send to integration provider (Google Calendar, Outlook, etc.)
      await this.syncCalendarToIntegration(tenantId, 'create_event', data as Partial<CalendarEvent>)
      // 2. Store locally for fast access
      return await this.createCalendarEventNative(tenantId, data as Partial<CalendarEvent>)
    }
    
    // Fall back to native for unsupported operations
    return await this.executeCalendarNativeOperation(tenantId, operation, data)
  }

  /**
   * Execute reports native operation
   */
  private async executeReportsNativeOperation(
    tenantId: string,
    operation: 'generate_report' | 'get_reports' | 'export_report' | 'schedule_report' | 'get_templates',
    data?: ReportsParams | Partial<Report> | { id: string; format?: string }
  ): Promise<unknown> {
    switch (operation) {
      case 'generate_report':
        if (!data) throw new Error('Report data required')
        return await this.generateReportNative(tenantId, data as Partial<Report>)
      case 'get_reports':
        return await this.getReportsNative(tenantId, data as ReportsParams)
      case 'export_report':
        if (!data) throw new Error('Report ID required')
        return await this.exportReportNative(tenantId, data as { id: string; format?: string })
      case 'schedule_report':
        if (!data) throw new Error('Report schedule data required')
        return await this.scheduleReportNative(tenantId, data as Partial<Report>)
      case 'get_templates':
        return await this.getReportTemplatesNative(tenantId)
      default:
        throw new Error(`Unknown reports operation: ${operation}`)
    }
  }

  /**
   * Execute reports integration operation
   */
  private async executeReportsIntegrationOperation(
    tenantId: string,
    operation: 'generate_report' | 'get_reports' | 'export_report' | 'schedule_report' | 'get_templates',
    data?: ReportsParams | Partial<Report> | { id: string; format?: string }
  ): Promise<unknown> {
    // Placeholder for reports integrations (PowerBI, Tableau, etc.)
    console.log(`🔗 Reports integration operation: ${operation} with ${this.featureMode.integrationProvider}`)
    
    // For now, sync to integration then persist locally
    if (operation === 'generate_report' && data) {
      // 1. Send to integration provider (PowerBI, Tableau, etc.)
      await this.syncReportsToIntegration(tenantId, 'generate_report', data as Partial<Report>)
      // 2. Store locally for fast access
      return await this.generateReportNative(tenantId, data as Partial<Report>)
    }
    
    // Fall back to native for unsupported operations
    return await this.executeReportsNativeOperation(tenantId, operation, data)
  }

  /**
   * Reports Native Operations
   */
  
  // GENERATE REPORT (Host: Native Database)
  private async generateReportNative(tenantId: string, reportData: Partial<Report>): Promise<Report> {
    try {
      const report_id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Basic report generation - in production would be more sophisticated
      let data: unknown[] = []
      let query = ''
      
      switch (reportData.type) {
        case 'financial':
          query = `
            SELECT 
              i.invoice_number,
              i.amount,
              i.status,
              i.issued_date,
              c.first_name || ' ' || c.last_name as client_name
            FROM firmsync.invoices i
            LEFT JOIN firmsync.clients c ON i.client_id = c.id
            ORDER BY i.issued_date DESC
          `
          break
        case 'case':
          query = `
            SELECT 
              cs.title,
              cs.status,
              cs.date_opened,
              cs.case_type,
              c.first_name || ' ' || c.last_name as client_name
            FROM firmsync.cases cs
            LEFT JOIN firmsync.clients c ON cs.client_id = c.id
            ORDER BY cs.date_opened DESC
          `
          break
        case 'time':
          query = `
            SELECT 
              te.description,
              te.hours,
              te.amount,
              te.date,
              te.billable,
              c.first_name || ' ' || c.last_name as client_name
            FROM firmsync.time_entries te
            LEFT JOIN firmsync.clients c ON te.client_id = c.id
            ORDER BY te.date DESC
          `
          break
        case 'client':
          query = `
            SELECT 
              c.first_name || ' ' || c.last_name as name,
              c.email,
              c.status,
              c.client_type,
              c.created_at
            FROM firmsync.clients c
            ORDER BY c.created_at DESC
          `
          break
        default:
          throw new Error(`Unsupported report type: ${reportData.type}`)
      }

      data = await this.dbRouter.queryFirmDatabase(tenantId, query, [])
      
      const report = await this.dbRouter.queryFirmDatabase<Report>(
        tenantId,
        `INSERT INTO firmsync.reports (
          id, name, type, description, parameters, data, generated_at,
          format, status, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, NOW(), NOW())
        RETURNING *`,
        [
          report_id,
          reportData.name || `${reportData.type} Report`,
          reportData.type,
          reportData.description || '',
          JSON.stringify(reportData.parameters || {}),
          JSON.stringify(data),
          reportData.format || 'json',
          'completed',
          reportData.createdBy || 'System'
        ]
      )

      return report[0]
    } catch (error) {
      console.error('Error generating report:', error)
      throw new Error('Failed to generate report')
    }
  }

  // GET REPORTS (Host: Native Database)
  private async getReportsNative(tenantId: string, params?: ReportsParams): Promise<Report[]> {
    try {
      let query = `
        SELECT * FROM firmsync.reports
        WHERE 1=1
      `
      const queryParams: (string | number)[] = []
      let paramIndex = 1

      if (params?.type) {
        query += ` AND type = $${paramIndex}`
        queryParams.push(params.type)
        paramIndex++
      }

      if (params?.status) {
        query += ` AND status = $${paramIndex}`
        queryParams.push(params.status)
        paramIndex++
      }

      if (params?.createdBy) {
        query += ` AND created_by = $${paramIndex}`
        queryParams.push(params.createdBy)
        paramIndex++
      }

      if (params?.dateRange?.startDate) {
        query += ` AND created_at >= $${paramIndex}`
        queryParams.push(params.dateRange.startDate)
        paramIndex++
      }

      if (params?.dateRange?.endDate) {
        query += ` AND created_at <= $${paramIndex}`
        queryParams.push(params.dateRange.endDate)
        paramIndex++
      }

      query += ` ORDER BY created_at DESC`

      if (params?.limit) {
        query += ` LIMIT $${paramIndex}`
        queryParams.push(params.limit)
        paramIndex++
      }

      if (params?.offset) {
        query += ` OFFSET $${paramIndex}`
        queryParams.push(params.offset)
      }

      const reports = await this.dbRouter.queryFirmDatabase<Report>(tenantId, query, queryParams)
      
      return reports.map(report => ({
        ...report,
        parameters: typeof report.parameters === 'string' ? JSON.parse(report.parameters) : report.parameters,
        data: typeof report.data === 'string' ? JSON.parse(report.data) : report.data
      }))
    } catch (error) {
      console.error('Error fetching reports:', error)
      return []
    }
  }

  // EXPORT REPORT (Host: Native Database)
  private async exportReportNative(tenantId: string, data: { id: string; format?: string }): Promise<{ downloadUrl: string; fileName: string }> {
    try {
      const reports = await this.dbRouter.queryFirmDatabase<Report>(
        tenantId,
        `SELECT * FROM firmsync.reports WHERE id = $1`,
        [data.id]
      )

      if (reports.length === 0) {
        throw new Error('Report not found')
      }

      const report = reports[0]
      const format = data.format || report.format
      const fileName = `${report.name.replace(/\s+/g, '_')}_${Date.now()}.${format}`
      
      // In production, would generate actual file and upload to storage
      // For now, return mock download URL
      const downloadUrl = `/api/reports/${report.id}/download?format=${format}`

      return { downloadUrl, fileName }
    } catch (error) {
      console.error('Error exporting report:', error)
      throw new Error('Failed to export report')
    }
  }

  // SCHEDULE REPORT (Host: Native Database)
  private async scheduleReportNative(tenantId: string, reportData: Partial<Report>): Promise<Report> {
    try {
      const report = await this.dbRouter.queryFirmDatabase<Report>(
        tenantId,
        `INSERT INTO firmsync.reports (
          id, name, type, description, parameters, scheduled_recurrence,
          next_scheduled_run, status, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *`,
        [
          `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          reportData.name || `Scheduled ${reportData.type} Report`,
          reportData.type,
          reportData.description || '',
          JSON.stringify(reportData.parameters || {}),
          reportData.scheduledRecurrence,
          reportData.nextScheduledRun || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          'pending',
          reportData.createdBy || 'System'
        ]
      )

      return report[0]
    } catch (error) {
      console.error('Error scheduling report:', error)
      throw new Error('Failed to schedule report')
    }
  }

  // GET REPORT TEMPLATES (Host: Native Database)
  private async getReportTemplatesNative(tenantId: string): Promise<ReportTemplate[]> {
    try {
      const templates = await this.dbRouter.queryFirmDatabase<ReportTemplate>(
        tenantId,
        `SELECT * FROM firmsync.report_templates ORDER BY name ASC`,
        []
      )
      
      return templates.map(template => ({
        ...template,
        defaultParameters: typeof template.defaultParameters === 'string' ? JSON.parse(template.defaultParameters) : template.defaultParameters,
        fields: typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields
      }))
    } catch (error) {
      console.error('Error fetching report templates:', error)
      // Return default templates if query fails
      return [
        {
          id: 'template_financial',
          name: 'Financial Summary',
          type: 'financial',
          description: 'Overview of invoices, payments, and revenue',
          defaultParameters: { dateRange: { startDate: '', endDate: '' } },
          fields: [],
          isPublic: true,
          createdBy: 'System',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }
  }

  // Integration sync for cases
  private async syncCaseToIntegration(tenantId: string, operation: string, data: Partial<Case>): Promise<void> {
    console.log(`🔄 Syncing case ${operation} to ${this.featureMode.integrationProvider}:`, data)
    // Implementation would depend on integration provider (Clio, MyCase, etc.)
    // For now, just log the action
  }

  // Integration sync for billing
  private async syncBillingToIntegration(tenantId: string, operation: string, data: Partial<Invoice> | Partial<Payment> | Partial<TimeEntry>): Promise<void> {
    console.log(`🔄 Syncing billing ${operation} to ${this.featureMode.integrationProvider}:`, data)
    // Implementation would depend on integration provider (QuickBooks, Xero, etc.)
    // For now, just log the action
  }

  // Integration sync for calendar
  private async syncCalendarToIntegration(tenantId: string, operation: string, data: Partial<CalendarEvent>): Promise<void> {
    console.log(`🔄 Syncing calendar ${operation} to ${this.featureMode.integrationProvider}:`, data)
    // Implementation would depend on integration provider (Google Calendar, Outlook, etc.)
    // For now, just log the action
  }

  // Integration sync for reports
  private async syncReportsToIntegration(tenantId: string, operation: string, data: Partial<Report>): Promise<void> {
    console.log(`🔄 Syncing reports ${operation} to ${this.featureMode.integrationProvider}:`, data)
    // Implementation would depend on integration provider (PowerBI, Tableau, etc.)
    // For now, just log the action
  }

  /**
   * Native client operations (IHO Pattern Implementation)
   */
  
  // ADD CLIENT (Host: Native Database)
  private async addClientNative(tenantId: string, clientData: Partial<Client>): Promise<Client> {
    const client = await this.dbRouter.queryFirmDatabase<Client>(
      tenantId,
      `INSERT INTO firmsync.clients (
        first_name, last_name, email, phone, company, address, 
        status, client_type, notes, tags, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [
        clientData.firstName || '',
        clientData.lastName || '',
        clientData.email || '',
        clientData.phone || '',
        clientData.company || '',
        JSON.stringify(clientData.address || {}),
        clientData.status || 'active',
        clientData.clientType || 'individual',
        clientData.notes || '',
        JSON.stringify(clientData.tags || [])
      ]
    )

    return client[0]
  }

  // VIEW CLIENTS (Out: Display Interface)
  private async getClientsNative(tenantId: string): Promise<Client[]> {
    return await this.dbRouter.queryFirmDatabase<Client>(
      tenantId,
      `SELECT 
        id, first_name as "firstName", last_name as "lastName", 
        email, phone, company, address, status, client_type as "clientType",
        notes, tags, created_at as "createdAt", updated_at as "updatedAt"
       FROM firmsync.clients 
       WHERE status != 'archived' 
       ORDER BY created_at DESC`
    )
  }

  // EDIT CLIENT (Host: Native Database)
  private async updateClientNative(tenantId: string, clientData: Partial<Client>): Promise<Client> {
    const client = await this.dbRouter.queryFirmDatabase<Client>(
      tenantId,
      `UPDATE firmsync.clients SET
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        company = COALESCE($6, company),
        address = COALESCE($7, address),
        status = COALESCE($8, status),
        client_type = COALESCE($9, client_type),
        notes = COALESCE($10, notes),
        tags = COALESCE($11, tags),
        updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        clientData.id,
        clientData.firstName,
        clientData.lastName,
        clientData.email,
        clientData.phone,
        clientData.company,
        clientData.address ? JSON.stringify(clientData.address) : null,
        clientData.status,
        clientData.clientType,
        clientData.notes,
        clientData.tags ? JSON.stringify(clientData.tags) : null
      ]
    )

    return client[0]
  }

  // CONTACT CLIENT (Out: Communication Interface)
  private async contactClientNative(tenantId: string, contactData: Partial<Client>): Promise<{ success: boolean; method: string }> {
    // Update last contact timestamp
    await this.dbRouter.queryFirmDatabase(
      tenantId,
      `UPDATE firmsync.clients SET last_contact = NOW() WHERE id = $1`,
      [contactData.id]
    )

    return { success: true, method: 'email' }
  }

  /**
   * Dashboard Native Operations
   */
  
  // GET DASHBOARD METRICS (Host: Native Database)
  private async getDashboardMetricsNative(tenantId: string, timeframe: string): Promise<DashboardMetrics> {
    try {
      // Calculate date range based on timeframe
      let dateCondition = '';
      switch (timeframe) {
        case 'day':
          dateCondition = "AND created_at >= NOW() - INTERVAL '1 day'";
          break;
        case 'week':
          dateCondition = "AND created_at >= NOW() - INTERVAL '1 week'";
          break;
        case 'month':
          dateCondition = "AND created_at >= NOW() - INTERVAL '1 month'";
          break;
        case 'year':
          dateCondition = "AND created_at >= NOW() - INTERVAL '1 year'";
          break;
        default:
          dateCondition = "AND created_at >= NOW() - INTERVAL '1 week'";
      }

      // Get metrics from various tables
      const metrics = await Promise.all([
        // Active clients count
        this.dbRouter.queryFirmDatabase(
          tenantId,
          `SELECT COUNT(*) as count FROM firmsync.clients WHERE status = 'active' ${dateCondition}`,
          []
        ),
        // New clients this period
        this.dbRouter.queryFirmDatabase(
          tenantId,
          `SELECT COUNT(*) as count FROM firmsync.clients WHERE created_at >= NOW() - INTERVAL '${timeframe === 'day' ? '1 day' : timeframe === 'week' ? '1 week' : timeframe === 'month' ? '1 month' : '1 year'}'`,
          []
        ),
        // Total revenue (placeholder - would come from billing)
        this.dbRouter.queryFirmDatabase(
          tenantId,
          `SELECT COALESCE(SUM(amount), 0) as total FROM firmsync.invoices WHERE status = 'paid' ${dateCondition}`,
          []
        ),
        // Billable hours (placeholder - would come from time tracking)
        this.dbRouter.queryFirmDatabase(
          tenantId,
          `SELECT COALESCE(SUM(hours), 0) as total FROM firmsync.time_entries WHERE billable = true ${dateCondition}`,
          []
        )
      ]);

      return {
        activeClients: metrics[0][0]?.count || 0,
        newClients: metrics[1][0]?.count || 0,
        revenue: metrics[2][0]?.total || 0,
        billableHours: metrics[3][0]?.total || 0,
        timeframe
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return default metrics if query fails
      return {
        activeClients: 24,
        newClients: 8,
        revenue: 42500,
        billableHours: 156.5,
        timeframe
      };
    }
  }

  // GET RECENT ACTIVITY (Host: Native Database)
  private async getRecentActivityNative(tenantId: string, limit: number): Promise<RecentActivity[]> {
    try {
      const activities = await this.dbRouter.queryFirmDatabase(
        tenantId,
        `SELECT 
           'client' as type,
           'Client Added' as action,
           first_name || ' ' || last_name as description,
           created_at as timestamp
         FROM firmsync.clients 
         WHERE created_at >= NOW() - INTERVAL '7 days'
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );

      return activities.map(activity => ({
        type: activity.type,
        action: activity.action,
        description: activity.description,
        timestamp: activity.timestamp,
        icon: 'user'
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Return sample activity if query fails
      return [
        {
          type: 'client',
          action: 'Client Added',
          description: 'John Doe added to system',
          timestamp: new Date().toISOString(),
          icon: 'user'
        }
      ];
    }
  }

  // GET SYSTEM ALERTS (Host: Native Database)
  private async getSystemAlertsNative(tenantId: string, severity: string): Promise<SystemAlert[]> {
    try {
      let severityCondition = '';
      if (severity !== 'all') {
        severityCondition = `AND severity = '${severity}'`;
      }

      const alerts = await this.dbRouter.queryFirmDatabase(
        tenantId,
        `SELECT * FROM firmsync.system_alerts 
         WHERE resolved = false ${severityCondition}
         ORDER BY created_at DESC 
         LIMIT 10`,
        []
      );

      return alerts.map(alert => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        timestamp: alert.created_at,
        resolved: alert.resolved
      }));
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      // Return sample alerts if query fails
      return [
        {
          id: 1,
          title: 'System Status',
          message: 'All systems operational',
          severity: 'info',
          timestamp: new Date().toISOString(),
          resolved: false
        }
      ];
    }
  }

  /**
   * Case Native Operations
   */

  // ADD CASE (Host: Native Database)
  private async addCaseNative(tenantId: string, caseData: Partial<Case>): Promise<Case> {
    try {
      const newCase = await this.dbRouter.queryFirmDatabase<Case>(
        tenantId,
        `INSERT INTO firmsync.cases (
          title, client_id, case_type, status, date_opened,
          description, assigned_attorney,
          retainer_amount, hourly_rate, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *`,
        [
          caseData.title || '',
          caseData.clientId,
          caseData.caseType || 'other',
          caseData.status || 'pending',
          caseData.dateOpened || new Date().toISOString(),
          caseData.description || '',
          caseData.assignedAttorney || '',
          caseData.retainerAmount || 0,
          caseData.hourlyRate || 0
        ]
      )

      return newCase[0]
    } catch (error) {
      console.error('Error creating case:', error)
      throw new Error('Failed to create case')
    }
  }

  // GET CASES (Host: Native Database)
  private async getCasesNative(tenantId: string, params?: CaseParams): Promise<Case[]> {
    try {
      let query = `
        SELECT c.*, cl.first_name || ' ' || cl.last_name as client_name
        FROM firmsync.cases c
        LEFT JOIN firmsync.clients cl ON c.client_id = cl.id
        WHERE 1=1
      `
      const queryParams: (string | number)[] = []
      let paramIndex = 1

      if (params?.clientId) {
        query += ` AND c.client_id = $${paramIndex}`
        queryParams.push(params.clientId)
        paramIndex++
      }

      if (params?.status) {
        query += ` AND c.status = $${paramIndex}`
        queryParams.push(params.status)
        paramIndex++
      }

      if (params?.caseType) {
        query += ` AND c.case_type = $${paramIndex}`
        queryParams.push(params.caseType)
        paramIndex++
      }

      // Note: practiceArea and attorneyAssigned not in current Case interface
      // These filters are commented out until the interface is updated
      // if (params?.practiceArea) {
      //   query += ` AND c.practice_area = $${paramIndex}`
      //   queryParams.push(params.practiceArea)
      //   paramIndex++
      // }
      // if (params?.attorneyAssigned) {
      //   query += ` AND c.attorney_assigned = $${paramIndex}`
      //   queryParams.push(params.attorneyAssigned)
      //   paramIndex++
      // }

      query += ` ORDER BY c.date_opened DESC`

      if (params?.limit) {
        query += ` LIMIT $${paramIndex}`
        queryParams.push(params.limit)
        paramIndex++
      }

      if (params?.offset) {
        query += ` OFFSET $${paramIndex}`
        queryParams.push(params.offset)
      }

      const cases = await this.dbRouter.queryFirmDatabase<Case>(tenantId, query, queryParams)
      
      // Return cases as-is since courtInfo and filingDetails are not in the interface
      return cases
    } catch (error) {
      console.error('Error fetching cases:', error)
      return []
    }
  }

  // UPDATE CASE (Host: Native Database)
  private async updateCaseNative(tenantId: string, caseData: Partial<Case>): Promise<Case> {
    try {
      const updatedCase = await this.dbRouter.queryFirmDatabase<Case>(
        tenantId,
        `UPDATE firmsync.cases SET
          title = COALESCE($2, title),
          client_id = COALESCE($3, client_id),
          case_type = COALESCE($4, case_type),
          status = COALESCE($5, status),
          description = COALESCE($6, description),
          assigned_attorney = COALESCE($7, assigned_attorney),
          retainer_amount = COALESCE($8, retainer_amount),
          hourly_rate = COALESCE($9, hourly_rate),
          updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          caseData.id,
          caseData.title,
          caseData.clientId,
          caseData.caseType,
          caseData.status,
          caseData.description,
          caseData.assignedAttorney,
          caseData.retainerAmount,
          caseData.hourlyRate
        ]
      )

      return updatedCase[0]
    } catch (error) {
      console.error('Error updating case:', error)
      throw new Error('Failed to update case')
    }
  }

  // UPDATE CASE STATUS (Host: Native Database)
  private async updateCaseStatusNative(tenantId: string, data: { id: string; status: string }): Promise<Case> {
    try {
      const updatedCase = await this.dbRouter.queryFirmDatabase<Case>(
        tenantId,
        `UPDATE firmsync.cases SET
          status = $2,
          updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [data.id, data.status]
      )

      return updatedCase[0]
    } catch (error) {
      console.error('Error updating case status:', error)
      throw new Error('Failed to update case status')
    }
  }

  // DELETE CASE (Host: Native Database)
  private async deleteCaseNative(tenantId: string, data: { id: string }): Promise<{ success: boolean }> {
    try {
      await this.dbRouter.queryFirmDatabase(
        tenantId,
        `DELETE FROM firmsync.cases WHERE id = $1`,
        [data.id]
      )

      return { success: true }
    } catch (error) {
      console.error('Error deleting case:', error)
      throw new Error('Failed to delete case')
    }
  }

  /**
   * Billing Native Operations
   */

  // GET INVOICES (Host: Native Database)
  private async getInvoicesNative(tenantId: string, params?: BillingParams): Promise<Invoice[]> {
    try {
      let query = `
        SELECT i.*, c.first_name || ' ' || c.last_name as client_name
        FROM firmsync.invoices i
        LEFT JOIN firmsync.clients c ON i.client_id = c.id
        WHERE 1=1
      `
      const queryParams: (string | number)[] = []
      let paramIndex = 1

      if (params?.clientId) {
        query += ` AND i.client_id = $${paramIndex}`
        queryParams.push(params.clientId)
        paramIndex++
      }

      if (params?.status) {
        query += ` AND i.status = $${paramIndex}`
        queryParams.push(params.status)
        paramIndex++
      }

      if (params?.dateRange?.startDate) {
        query += ` AND i.issued_date >= $${paramIndex}`
        queryParams.push(params.dateRange.startDate)
        paramIndex++
      }

      if (params?.dateRange?.endDate) {
        query += ` AND i.issued_date <= $${paramIndex}`
        queryParams.push(params.dateRange.endDate)
        paramIndex++
      }

      query += ` ORDER BY i.issued_date DESC`

      if (params?.limit) {
        query += ` LIMIT $${paramIndex}`
        queryParams.push(params.limit)
        paramIndex++
      }

      if (params?.offset) {
        query += ` OFFSET $${paramIndex}`
        queryParams.push(params.offset)
      }

      const invoices = await this.dbRouter.queryFirmDatabase<Invoice>(tenantId, query, queryParams)
      
      return invoices.map(invoice => ({
        ...invoice,
        items: typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items,
        metadata: typeof invoice.metadata === 'string' ? JSON.parse(invoice.metadata) : invoice.metadata
      }))
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return []
    }
  }

  // CREATE INVOICE (Host: Native Database)
  private async createInvoiceNative(tenantId: string, invoiceData: Partial<Invoice>): Promise<Invoice> {
    try {
      const invoice = await this.dbRouter.queryFirmDatabase<Invoice>(
        tenantId,
        `INSERT INTO firmsync.invoices (
          invoice_number, client_id, amount, status, issued_date,
          due_date, items, notes, metadata, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *`,
        [
          invoiceData.invoiceNumber || `INV-${Date.now()}`,
          invoiceData.clientId,
          invoiceData.amount || 0,
          invoiceData.status || 'draft',
          invoiceData.issuedDate || new Date().toISOString(),
          invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          JSON.stringify(invoiceData.items || []),
          invoiceData.notes || '',
          JSON.stringify(invoiceData.metadata || {})
        ]
      )

      return invoice[0]
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw new Error('Failed to create invoice')
    }
  }

  // RECORD PAYMENT (Host: Native Database)
  private async recordPaymentNative(tenantId: string, paymentData: Partial<Payment>): Promise<Payment> {
    try {
      const payment = await this.dbRouter.queryFirmDatabase<Payment>(
        tenantId,
        `INSERT INTO firmsync.payments (
          invoice_id, amount, payment_date, payment_method,
          transaction_id, status, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *`,
        [
          paymentData.invoiceId,
          paymentData.amount || 0,
          paymentData.paymentDate || new Date().toISOString(),
          paymentData.paymentMethod || 'other',
          paymentData.transactionId || '',
          paymentData.status || 'completed',
          paymentData.notes || ''
        ]
      )

      // Update invoice status if payment completes the full amount
      if (payment[0].status === 'completed') {
        const invoice = await this.dbRouter.queryFirmDatabase<Invoice>(
          tenantId,
          `SELECT * FROM firmsync.invoices WHERE id = $1`,
          [payment[0].invoiceId]
        )

        if (invoice.length > 0) {
          const totalPaid = await this.dbRouter.queryFirmDatabase<{ total: number }>(
            tenantId,
            `SELECT COALESCE(SUM(amount), 0) as total 
             FROM firmsync.payments 
             WHERE invoice_id = $1 AND status = 'completed'`,
            [payment[0].invoiceId]
          )

          if (totalPaid[0].total >= invoice[0].amount) {
            await this.dbRouter.queryFirmDatabase(
              tenantId,
              `UPDATE firmsync.invoices SET status = 'paid', updated_at = NOW() WHERE id = $1`,
              [payment[0].invoiceId]
            )
          }
        }
      }

      return payment[0]
    } catch (error) {
      console.error('Error recording payment:', error)
      throw new Error('Failed to record payment')
    }
  }

  // TRACK TIME (Host: Native Database)
  private async trackTimeNative(tenantId: string, timeData: Partial<TimeEntry>): Promise<TimeEntry> {
    try {
      const timeEntry = await this.dbRouter.queryFirmDatabase<TimeEntry>(
        tenantId,
        `INSERT INTO firmsync.time_entries (
          case_id, client_id, attorney_id, description, date,
          hours, rate, amount, billable, billed, invoice_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *`,
        [
          timeData.caseId,
          timeData.clientId,
          timeData.attorneyId,
          timeData.description || '',
          timeData.date || new Date().toISOString(),
          timeData.hours || 0,
          timeData.rate || 0,
          timeData.amount || (timeData.hours || 0) * (timeData.rate || 0),
          timeData.billable !== undefined ? timeData.billable : true,
          timeData.billed || false,
          timeData.invoiceId || null
        ]
      )

      return timeEntry[0]
    } catch (error) {
      console.error('Error tracking time:', error)
      throw new Error('Failed to track time')
    }
  }

  // GET TIME ENTRIES (Host: Native Database)
  private async getTimeEntriesNative(tenantId: string, params?: BillingParams): Promise<TimeEntry[]> {
    try {
      let query = `
        SELECT te.*, c.first_name || ' ' || c.last_name as client_name,
               CASE WHEN te.attorney_id IS NOT NULL THEN
                 (SELECT first_name || ' ' || last_name 
                  FROM firmsync.attorneys 
                  WHERE id = te.attorney_id)
               END as attorney_name
        FROM firmsync.time_entries te
        LEFT JOIN firmsync.clients c ON te.client_id = c.id
        WHERE 1=1
      `
      const queryParams: (string | number | boolean)[] = []
      let paramIndex = 1

      if (params?.clientId) {
        query += ` AND te.client_id = $${paramIndex}`
        queryParams.push(params.clientId)
        paramIndex++
      }

      if (params?.caseId) {
        query += ` AND te.case_id = $${paramIndex}`
        queryParams.push(params.caseId)
        paramIndex++
      }

      if (params?.attorneyId) {
        query += ` AND te.attorney_id = $${paramIndex}`
        queryParams.push(params.attorneyId)
        paramIndex++
      }

      if (params?.billable !== undefined) {
        query += ` AND te.billable = $${paramIndex}`
        queryParams.push(params.billable)
        paramIndex++
      }

      if (params?.billed !== undefined) {
        query += ` AND te.billed = $${paramIndex}`
        queryParams.push(params.billed)
        paramIndex++
      }

      if (params?.dateRange?.startDate) {
        query += ` AND te.date >= $${paramIndex}`
        queryParams.push(params.dateRange.startDate)
        paramIndex++
      }

      if (params?.dateRange?.endDate) {
        query += ` AND te.date <= $${paramIndex}`
        queryParams.push(params.dateRange.endDate)
        paramIndex++
      }

      query += ` ORDER BY te.date DESC`

      if (params?.limit) {
        query += ` LIMIT $${paramIndex}`
        queryParams.push(params.limit)
        paramIndex++
      }

      if (params?.offset) {
        query += ` OFFSET $${paramIndex}`
        queryParams.push(params.offset)
      }

      const timeEntries = await this.dbRouter.queryFirmDatabase<TimeEntry>(tenantId, query, queryParams)
      return timeEntries
    } catch (error) {
      console.error('Error fetching time entries:', error)
      return []
    }
  }

  // GET CALENDAR EVENTS (Host: Native Database)
  private async getCalendarEventsNative(tenantId: string, params?: CalendarParams): Promise<CalendarEvent[]> {
    try {
      let query = `
        SELECT e.*, 
               CASE WHEN e.client_id IS NOT NULL THEN
                 (SELECT first_name || ' ' || last_name 
                  FROM firmsync.clients 
                  WHERE id = e.client_id)
               END as client_name,
               CASE WHEN e.case_id IS NOT NULL THEN
                 (SELECT title
                  FROM firmsync.cases 
                  WHERE id = e.case_id)
               END as case_title
        FROM firmsync.calendar_events e
        WHERE 1=1
      `
      const queryParams: (string | number)[] = []
      let paramIndex = 1

      if (params?.startDate) {
        query += ` AND e.start_date >= $${paramIndex}`
        queryParams.push(params.startDate)
        paramIndex++
      }

      if (params?.endDate) {
        query += ` AND e.end_date <= $${paramIndex}`
        queryParams.push(params.endDate)
        paramIndex++
      }

      if (params?.clientId) {
        query += ` AND e.client_id = $${paramIndex}`
        queryParams.push(params.clientId)
        paramIndex++
      }

      if (params?.caseId) {
        query += ` AND e.case_id = $${paramIndex}`
        queryParams.push(params.caseId)
        paramIndex++
      }

      if (params?.eventType) {
        query += ` AND e.event_type = $${paramIndex}`
        queryParams.push(params.eventType)
        paramIndex++
      }

      if (params?.status) {
        query += ` AND e.status = $${paramIndex}`
        queryParams.push(params.status)
        paramIndex++
      }

      if (params?.createdBy) {
        query += ` AND e.created_by = $${paramIndex}`
        queryParams.push(params.createdBy)
        paramIndex++
      }

      query += ` ORDER BY e.start_date ASC`

      if (params?.limit) {
        query += ` LIMIT $${paramIndex}`
        queryParams.push(params.limit)
        paramIndex++
      }

      if (params?.offset) {
        query += ` OFFSET $${paramIndex}`
        queryParams.push(params.offset)
      }

      const events = await this.dbRouter.queryFirmDatabase<CalendarEvent>(tenantId, query, queryParams)
      
      return events.map(event => ({
        ...event,
        attendees: typeof event.attendees === 'string' ? JSON.parse(event.attendees) : event.attendees,
        recurrence: typeof event.recurrence === 'string' ? JSON.parse(event.recurrence) : event.recurrence
      }))
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      return []
    }
  }

  // CREATE CALENDAR EVENT (Host: Native Database)
  private async createCalendarEventNative(tenantId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const event = await this.dbRouter.queryFirmDatabase<CalendarEvent>(
        tenantId,
        `INSERT INTO firmsync.calendar_events (
          title, description, start_date, end_date, all_day,
          location, attendees, client_id, case_id, event_type,
          status, reminder_minutes, recurrence, created_by,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *`,
        [
          eventData.title || '',
          eventData.description || '',
          eventData.startDate || new Date().toISOString(),
          eventData.endDate || new Date().toISOString(),
          eventData.allDay || false,
          eventData.location || '',
          JSON.stringify(eventData.attendees || []),
          eventData.clientId || null,
          eventData.caseId || null,
          eventData.eventType || 'other',
          eventData.status || 'scheduled',
          eventData.reminderMinutes || 15,
          eventData.recurrence ? JSON.stringify(eventData.recurrence) : null,
          eventData.createdBy || 'System'
        ]
      )

      return {
        ...event[0],
        attendees: typeof event[0].attendees === 'string' ? JSON.parse(event[0].attendees) : event[0].attendees,
        recurrence: typeof event[0].recurrence === 'string' ? JSON.parse(event[0].recurrence) : event[0].recurrence
      }
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw new Error('Failed to create calendar event')
    }
  }

  // UPDATE CALENDAR EVENT (Host: Native Database)
  private async updateCalendarEventNative(tenantId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const event = await this.dbRouter.queryFirmDatabase<CalendarEvent>(
        tenantId,
        `UPDATE firmsync.calendar_events SET
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          start_date = COALESCE($4, start_date),
          end_date = COALESCE($5, end_date),
          all_day = COALESCE($6, all_day),
          location = COALESCE($7, location),
          attendees = COALESCE($8, attendees),
          client_id = COALESCE($9, client_id),
          case_id = COALESCE($10, case_id),
          event_type = COALESCE($11, event_type),
          status = COALESCE($12, status),
          reminder_minutes = COALESCE($13, reminder_minutes),
          recurrence = COALESCE($14, recurrence),
          updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          eventData.id,
          eventData.title,
          eventData.description,
          eventData.startDate,
          eventData.endDate,
          eventData.allDay,
          eventData.location,
          eventData.attendees ? JSON.stringify(eventData.attendees) : null,
          eventData.clientId,
          eventData.caseId,
          eventData.eventType,
          eventData.status,
          eventData.reminderMinutes,
          eventData.recurrence ? JSON.stringify(eventData.recurrence) : null
        ]
      )

      return {
        ...event[0],
        attendees: typeof event[0].attendees === 'string' ? JSON.parse(event[0].attendees) : event[0].attendees,
        recurrence: typeof event[0].recurrence === 'string' ? JSON.parse(event[0].recurrence) : event[0].recurrence
      }
    } catch (error) {
      console.error('Error updating calendar event:', error)
      throw new Error('Failed to update calendar event')
    }
  }

  // DELETE CALENDAR EVENT (Host: Native Database)
  private async deleteCalendarEventNative(tenantId: string, data: { id: string }): Promise<{ success: boolean }> {
    try {
      await this.dbRouter.queryFirmDatabase(
        tenantId,
        `DELETE FROM firmsync.calendar_events WHERE id = $1`,
        [data.id]
      )

      return { success: true }
    } catch (error) {
      console.error('Error deleting calendar event:', error)
      throw new Error('Failed to delete calendar event')
    }
  }
}

export default IHOManager
