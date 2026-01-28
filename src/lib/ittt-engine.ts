// ITTT Engine - Global automation framework
// Handles If This Then That logic for all tenant operations

import { ITTTRule, ITTTTrigger, ITTTCondition, ITTTAction } from '@/types/ittt'
import DatabaseRouter from '@/lib/database-router'

export class ITTTEngine {
  private dbRouter: DatabaseRouter
  private isProcessing: boolean = false

  constructor() {
    this.dbRouter = new DatabaseRouter()
  }

  /**
   * Process a trigger event and execute matching ITTT rules
   */
  async processTrigger(tenantId: string, trigger: ITTTTrigger, contextData: Record<string, unknown> = {}): Promise<void> {
    if (this.isProcessing) {
      console.log('⏳ ITTT Engine busy, queueing trigger...')
      // In production, implement proper queue system
      setTimeout(() => this.processTrigger(tenantId, trigger, contextData), 1000)
      return
    }

    this.isProcessing = true
    console.log(`🔄 Processing ITTT trigger: ${trigger.type} for tenant ${tenantId}`)

    try {
      // Get active ITTT rules for this tenant and trigger type
      const rules = await this.getActiveTriggerRules(tenantId, trigger.type)
      
      for (const rule of rules) {
        if (await this.evaluateConditions(rule.conditions, contextData)) {
          console.log(`✅ Rule "${rule.name}" conditions met, executing actions...`)
          await this.executeActions(tenantId, rule.actions, contextData)
          
          // Log rule execution
          await this.logRuleExecution(tenantId, rule.id, trigger, contextData)
        }
      }
    } catch (error) {
      console.error('❌ ITTT Engine error:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Get active ITTT rules for a specific trigger type
   */
  private async getActiveTriggerRules(tenantId: string, triggerType: string): Promise<ITTTRule[]> {
    try {
      const rules = await this.dbRouter.queryFirmDatabase<ITTTRule>(
        tenantId,
        `SELECT * FROM firmsync.ittt_rules 
         WHERE trigger_type = $1 AND is_active = true 
         ORDER BY created_at DESC`,
        [triggerType]
      )
      return rules
    } catch (error) {
      console.error('Failed to fetch ITTT rules:', error)
      return []
    }
  }

  /**
   * Evaluate if all conditions are met
   */
  private async evaluateConditions(conditions: ITTTCondition[], contextData: Record<string, unknown>): Promise<boolean> {
    if (conditions.length === 0) return true

    let result = true
    let currentLogicalOp: 'AND' | 'OR' = 'AND'

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, contextData)
      
      if (currentLogicalOp === 'AND') {
        result = result && conditionResult
      } else {
        result = result || conditionResult
      }
      
      currentLogicalOp = condition.logicalOperator || 'AND'
    }

    return result
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: ITTTCondition, contextData: Record<string, unknown>): boolean {
    const fieldValue = this.getFieldValue(condition.field, contextData)
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value)
      case 'less_than':
        return Number(fieldValue) < Number(condition.value)
      case 'not_empty':
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''
      case 'is_empty':
        return fieldValue === null || fieldValue === undefined || fieldValue === ''
      default:
        return false
    }
  }

  /**
   * Get field value from context data using dot notation
   */
  private getFieldValue(fieldPath: string, contextData: Record<string, unknown>): unknown {
    return fieldPath.split('.').reduce((obj: unknown, key: string) => {
      return obj && typeof obj === 'object' && obj !== null && key in obj 
        ? (obj as Record<string, unknown>)[key] 
        : undefined
    }, contextData as unknown)
  }

  /**
   * Execute all actions for a triggered rule
   */
  private async executeActions(tenantId: string, actions: ITTTAction[], contextData: Record<string, unknown>): Promise<void> {
    for (const action of actions) {
      try {
        if (action.delayMinutes && action.delayMinutes > 0) {
          // Schedule delayed action (in production, use proper job queue)
          setTimeout(() => this.executeAction(tenantId, action, contextData), action.delayMinutes * 60 * 1000)
        } else {
          await this.executeAction(tenantId, action, contextData)
        }
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error)
      }
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(tenantId: string, action: ITTTAction, contextData: Record<string, unknown>): Promise<void> {
    console.log(`🎯 Executing action: ${action.type} for ${action.target}`)

    switch (action.type) {
      case 'send_email':
        await this.sendEmail(tenantId, action, contextData)
        break
      case 'create_task':
        await this.createTask(tenantId, action, contextData)
        break
      case 'update_field':
        await this.updateField(tenantId, action, contextData)
        break
      case 'send_sms':
        await this.sendSMS(tenantId, action, contextData)
        break
      case 'log_activity':
        await this.logActivity(tenantId, action, contextData)
        break
      case 'webhook_call':
        await this.callWebhook(tenantId, action, contextData)
        break
      default:
        console.log(`Unknown action type: ${action.type}`)
    }
  }

  /**
   * Action implementations
   */
  private async sendEmail(tenantId: string, action: ITTTAction, contextData: Record<string, unknown>): Promise<void> {
    // Implementation for email sending
    const contextSummary = this.formatContextSummary(contextData)
    console.log(`📧 Sending email to ${action.target}`, {
      payload: action.payload,
      context: contextSummary,
    })
    // Integrate with email service (SendGrid, AWS SES, etc.)
  }

  private async createTask(tenantId: string, action: ITTTAction, contextData: Record<string, unknown>): Promise<void> {
    const description =
      action.payload.description ||
      this.formatContextSummary(contextData) ||
      'Generated by ITTT rule'

    await this.dbRouter.queryFirmDatabase(
      tenantId,
      `INSERT INTO firmsync.tasks (title, description, assigned_to, due_date, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        action.payload.title || 'Automated Task',
        description,
        action.target,
        action.payload.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      ]
    )
  }

  private async updateField(tenantId: string, action: ITTTAction, contextData: Record<string, unknown>): Promise<void> {
    // Dynamic field update based on action configuration
    const [table, recordId, field] = action.target.split('.')
    const contextSummary = this.formatContextSummary(contextData)
    if (contextSummary) {
      console.log(`Updating ${table}.${field} with context:`, contextSummary)
    }
    await this.dbRouter.queryFirmDatabase(
      tenantId,
      `UPDATE firmsync.${table} SET ${field} = $1, updated_at = NOW() WHERE id = $2`,
      [action.payload.value, recordId]
    )
  }

  private async sendSMS(tenantId: string, action: ITTTAction, contextData: Record<string, unknown>): Promise<void> {
    const contextSummary = this.formatContextSummary(contextData)
    console.log(`📱 Sending SMS to ${action.target}`, {
      payload: action.payload,
      context: contextSummary,
    })
    // Integrate with SMS service (Twilio, AWS SNS, etc.)
  }

  private async logActivity(tenantId: string, action: ITTTAction, contextData: Record<string, unknown>): Promise<void> {
    const contextSummary = this.formatContextSummary(contextData)
    const description = contextSummary
      ? `${action.payload.description || 'Automated action executed'} Context: ${contextSummary}`
      : action.payload.description || 'Automated action executed'

    await this.dbRouter.queryFirmDatabase(
      tenantId,
      `INSERT INTO firmsync.activity_logs (entity_type, entity_id, activity_type, description, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        action.payload.entityType || 'client',
        action.target,
        action.payload.activityType || 'automated_action',
        description
      ]
    )
  }

  private async callWebhook(tenantId: string, action: ITTTAction, contextData: Record<string, unknown>): Promise<void> {
    try {
      const response = await fetch(action.target, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          ...action.payload,
          contextData,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Webhook call failed:', error)
    }
  }

  private formatContextSummary(contextData: Record<string, unknown>): string | null {
    if (!contextData || Object.keys(contextData).length === 0) {
      return null
    }

    try {
      const serialized = JSON.stringify(contextData)
      return serialized.length > 200 ? `${serialized.slice(0, 197)}...` : serialized
    } catch (error) {
      console.warn('Failed to serialize context data:', error)
      return null
    }
  }

  /**
   * Log rule execution for audit trail
   */
  private async logRuleExecution(
    tenantId: string, 
    ruleId: string, 
    trigger: ITTTTrigger, 
    contextData: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.dbRouter.queryFirmDatabase(
        tenantId,
        `INSERT INTO firmsync.ittt_executions (rule_id, trigger_type, context_data, executed_at)
         VALUES ($1, $2, $3, NOW())`,
        [ruleId, trigger.type, JSON.stringify(contextData)]
      )
    } catch (error) {
      console.error('Failed to log rule execution:', error)
    }
  }

  /**
   * Quick trigger helpers for common events
   */
  async triggerClientAdded(tenantId: string, client: Record<string, unknown>): Promise<void> {
    await this.processTrigger(tenantId, { type: 'client_added' }, { client })
  }

  async triggerClientUpdated(tenantId: string, client: Record<string, unknown>, changes: Record<string, unknown>): Promise<void> {
    await this.processTrigger(tenantId, { type: 'client_updated' }, { client, changes })
  }

  async triggerClientContacted(tenantId: string, client: Record<string, unknown>, contactMethod: string): Promise<void> {
    await this.processTrigger(tenantId, { type: 'client_contacted' }, { client, contactMethod })
  }
}

// Singleton instance
export const itttEngine = new ITTTEngine()
export default ITTTEngine
