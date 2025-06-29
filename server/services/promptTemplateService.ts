import { db } from '../db';
import { llmPromptTemplates } from '../../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';

export class PromptTemplateService {
  
  // Default prompt templates for each tab
  private defaultTemplates = {
    dashboard: {
      promptName: 'Dashboard Overview Analysis',
      basePrompt: `You are a legal practice management AI assistant. Analyze the provided firm data and generate insights for the dashboard overview.

Focus on:
- Recent case activity trends
- Client engagement patterns  
- Upcoming deadlines and priorities
- Resource allocation recommendations
- Revenue opportunities

Provide actionable insights in a professional, concise format suitable for law firm partners and staff.`,
      systemPrompt: 'You are an expert legal practice management consultant with deep knowledge of law firm operations, case management, and business optimization.',
      contextInstructions: 'Use the provided case, client, and calendar data to identify trends, bottlenecks, and opportunities.',
      responseFormat: 'json'
    },
    
    clients: {
      promptName: 'Client Relationship Analysis',
      basePrompt: `Analyze client data to provide insights on client relationships, satisfaction, and opportunities.

For individual clients, focus on:
- Case history and outcomes
- Communication patterns
- Billing history and payment behavior
- Risk assessment
- Upselling opportunities

For client portfolio analysis, focus on:
- Client diversity and concentration risk
- Revenue per client trends
- Client retention rates
- Practice area distribution
- Geographic spread`,
      systemPrompt: 'You are a client relationship management expert specializing in legal services.',
      contextInstructions: 'Consider client lifecycle, case complexity, and firm capacity when making recommendations.',
      responseFormat: 'json'
    },

    cases: {
      promptName: 'Case Strategy and Management',
      basePrompt: `Provide strategic analysis for case management and litigation strategy.

For individual cases, analyze:
- Case complexity and risk factors
- Resource requirements and timeline
- Precedent cases and legal strategies
- Evidence strength assessment
- Settlement vs. trial recommendations

For case portfolio analysis:
- Workload distribution
- Case type performance
- Resource bottlenecks
- Deadline management
- Profitability analysis`,
      systemPrompt: 'You are an experienced litigation strategist and case management expert with knowledge across multiple practice areas.',
      contextInstructions: 'Consider jurisdictional factors, precedent law, and firm resources when providing strategic recommendations.',
      responseFormat: 'json'
    },

    documents: {
      promptName: 'Document Analysis and Organization',
      basePrompt: `Analyze legal documents to provide insights on content, organization, and workflow optimization.

For individual documents:
- Document type identification
- Key terms and clauses analysis
- Risk assessment
- Compliance review
- Related document suggestions

For document portfolio:
- Organization and categorization
- Version control recommendations
- Access pattern analysis
- Storage optimization
- Workflow improvements`,
      systemPrompt: 'You are a legal document management expert with expertise in document review, analysis, and organization systems.',
      contextInstructions: 'Focus on legal accuracy, compliance requirements, and efficient document workflows.',
      responseFormat: 'json'
    },

    calendar: {
      promptName: 'Schedule and Deadline Management',
      basePrompt: `Optimize scheduling and deadline management for legal practice operations.

Analyze:
- Upcoming deadlines and priorities
- Schedule conflicts and resolution
- Resource allocation and availability
- Court date optimization
- Client meeting scheduling
- Workload balancing across team members

Provide recommendations for:
- Priority task scheduling
- Deadline buffer management
- Team coordination
- Client communication timing`,
      systemPrompt: 'You are a legal practice scheduling and time management expert.',
      contextInstructions: 'Consider court schedules, client availability, attorney capacity, and case urgency when making scheduling recommendations.',
      responseFormat: 'json'
    },

    tasks: {
      promptName: 'Task Prioritization and Workflow',
      basePrompt: `Optimize task management and workflow efficiency for legal practice operations.

Analyze:
- Task priority and urgency
- Resource allocation and dependencies
- Workflow bottlenecks
- Team productivity patterns
- Deadline adherence

Provide recommendations for:
- Task prioritization
- Workflow optimization
- Resource reallocation
- Process improvements
- Productivity enhancements`,
      systemPrompt: 'You are a legal practice workflow optimization specialist.',
      contextInstructions: 'Focus on maximizing efficiency while maintaining quality and meeting all legal deadlines.',
      responseFormat: 'json'
    },

    billing: {
      promptName: 'Financial Analysis and Billing Optimization',
      basePrompt: `Provide financial insights and billing optimization recommendations for legal practice.

Analyze:
- Revenue trends and patterns
- Billing efficiency and realization rates
- Unbilled time and collection opportunities
- Client payment behaviors
- Profitability by practice area and client

Recommend:
- Billing process improvements
- Rate optimization strategies
- Collection process enhancements
- Financial forecasting
- Cost management opportunities`,
      systemPrompt: 'You are a legal practice financial management and billing expert.',
      contextInstructions: 'Focus on maximizing revenue while maintaining client relationships and ensuring ethical billing practices.',
      responseFormat: 'json'
    },

    paralegal: {
      promptName: 'Legal Research and Document Generation',
      basePrompt: `Assist with legal research, document drafting, and paralegal support tasks.

Capabilities include:
- Legal research and case law analysis
- Document drafting and templates
- Contract review and analysis
- Compliance checking
- Citation verification
- Procedural guidance

Provide accurate, well-researched responses with proper legal citations and formatting.`,
      systemPrompt: 'You are an expert paralegal and legal researcher with comprehensive knowledge of legal procedures, document drafting, and research methodologies.',
      contextInstructions: 'Always verify legal accuracy and provide proper citations. Consider jurisdiction-specific requirements.',
      responseFormat: 'json'
    }
  };

  // Initialize default templates
  async initializeDefaultTemplates(): Promise<void> {
    for (const [tabType, template] of Object.entries(this.defaultTemplates)) {
      try {
        // Check if default template already exists
        const existing = await db
          .select()
          .from(llmPromptTemplates)
          .where(and(
            eq(llmPromptTemplates.tabType, tabType),
            eq(llmPromptTemplates.isDefault, true),
            isNull(llmPromptTemplates.firmId) // Global template
          ))
          .limit(1);

        if (!existing.length) {
          // Create default template
          await db
            .insert(llmPromptTemplates)
            .values({
              firmId: null, // Global template
              tabType,
              promptName: template.promptName,
              basePrompt: template.basePrompt,
              systemPrompt: template.systemPrompt,
              contextInstructions: template.contextInstructions,
              responseFormat: template.responseFormat,
              isActive: true,
              isDefault: true,
              version: 1
            });

          console.log(`Created default template for ${tabType} tab`);
        }
      } catch (error) {
        console.error(`Failed to create default template for ${tabType}:`, error);
      }
    }
  }

  // Create custom template for a firm
  async createFirmTemplate(
    firmId: number, 
    tabType: string, 
    templateData: {
      promptName: string;
      basePrompt: string;
      systemPrompt?: string;
      contextInstructions?: string;
      responseFormat?: string;
    },
    createdBy: number
  ): Promise<number | null> {
    try {
      const result = await db
        .insert(llmPromptTemplates)
        .values({
          firmId,
          tabType,
          promptName: templateData.promptName,
          basePrompt: templateData.basePrompt,
          systemPrompt: templateData.systemPrompt,
          contextInstructions: templateData.contextInstructions,
          responseFormat: templateData.responseFormat || 'json',
          isActive: true,
          isDefault: false,
          version: 1,
          createdBy
        })
        .returning({ id: llmPromptTemplates.id });

      return result[0]?.id || null;
    } catch (error) {
      console.error('Failed to create firm template:', error);
      return null;
    }
  }

  // Get templates for a firm (including global defaults)
  async getFirmTemplates(firmId: number, tabType?: string): Promise<any[]> {
    try {
      const conditions = tabType 
        ? and(
            eq(llmPromptTemplates.tabType, tabType),
            eq(llmPromptTemplates.isActive, true)
          )
        : eq(llmPromptTemplates.isActive, true);

      const templates = await db
        .select()
        .from(llmPromptTemplates)
        .where(conditions);

      // Filter for firm-specific and global templates
      return templates.filter(t => 
        t.firmId === firmId || t.firmId === null
      );
    } catch (error) {
      console.error('Failed to get firm templates:', error);
      return [];
    }
  }

  // Update template
  async updateTemplate(
    templateId: number, 
    updates: {
      promptName?: string;
      basePrompt?: string;
      systemPrompt?: string;
      contextInstructions?: string;
      responseFormat?: string;
      isActive?: boolean;
    }
  ): Promise<boolean> {
    try {
      await db
        .update(llmPromptTemplates)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(llmPromptTemplates.id, templateId));

      return true;
    } catch (error) {
      console.error('Failed to update template:', error);
      return false;
    }
  }

  // Clone template for customization
  async cloneTemplate(
    sourceTemplateId: number, 
    firmId: number, 
    newName: string,
    createdBy: number
  ): Promise<number | null> {
    try {
      const source = await db
        .select()
        .from(llmPromptTemplates)
        .where(eq(llmPromptTemplates.id, sourceTemplateId))
        .limit(1);

      if (!source.length) return null;

      const template = source[0];
      const result = await db
        .insert(llmPromptTemplates)
        .values({
          firmId,
          tabType: template.tabType,
          promptName: newName,
          basePrompt: template.basePrompt,
          systemPrompt: template.systemPrompt,
          contextInstructions: template.contextInstructions,
          responseFormat: template.responseFormat,
          isActive: true,
          isDefault: false,
          version: 1,
          createdBy
        })
        .returning({ id: llmPromptTemplates.id });

      return result[0]?.id || null;
    } catch (error) {
      console.error('Failed to clone template:', error);
      return null;
    }
  }
}

export const promptTemplateService = new PromptTemplateService();
