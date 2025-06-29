import { llmService, TabType, LlmRequest } from './llmService';
import { db } from '../db';
import { clients, cases, documents, timeLogs, invoices } from '../../shared/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';

export class TabLlmService {

  // Dashboard Tab - Overview and insights
  async getDashboardInsights(firmId: number, userId: number): Promise<any> {
    try {
      // Gather dashboard context
      const recentCases = await db
        .select()
        .from(cases)
        .where(eq(cases.firmId, firmId))
        .orderBy(desc(cases.createdAt))
        .limit(10);

      const recentClients = await db
        .select()
        .from(clients)
        .where(eq(clients.firmId, firmId))
        .orderBy(desc(clients.createdAt))
        .limit(10);

      // TODO: Re-enable when calendarEvents table is implemented
      // const upcomingEvents = await db
      //   .select()
      //   .from(calendarEvents)
      //   .where(eq(calendarEvents.firmId, firmId))
      //   .orderBy(desc(calendarEvents.startTime))
      //   .limit(5);
      const upcomingEvents: any[] = []; // Temporary mock

      const context = {
        recentCases: recentCases.map(c => ({
          title: c.title,
          status: c.status,
          createdAt: c.createdAt
        })),
        recentClients: recentClients.map(c => ({
          name: c.name,
          status: c.status,
          createdAt: c.createdAt
        })),
        upcomingEvents: upcomingEvents.map(e => ({
          title: e.title,
          startTime: e.startTime
        }))
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'dashboard',
        requestType: 'dashboard_insights',
        context
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Dashboard insights error:', error);
      return { error: 'Failed to generate dashboard insights' };
    }
  }

  // Clients Tab - Client management insights
  async getClientInsights(firmId: number, userId: number, clientId?: number): Promise<any> {
    try {
      let context: any = {};

      if (clientId) {
        // Specific client analysis
        const client = await db
          .select()
          .from(clients)
          .where(and(
            eq(clients.firmId, firmId),
            eq(clients.id, clientId)
          ))
          .limit(1);

        const clientCases = await db
          .select()
          .from(cases)
          .where(and(
            eq(cases.firmId, firmId),
            eq(cases.clientId, clientId)
          ));

        context = {
          client: client[0],
          cases: clientCases,
          analysisType: 'individual_client'
        };
      } else {
        // Overall client portfolio analysis
        const allClients = await db
          .select()
          .from(clients)
          .where(eq(clients.firmId, firmId))
          .orderBy(desc(clients.createdAt));

        context = {
          clients: allClients.slice(0, 20), // Limit for token efficiency
          analysisType: 'client_portfolio'
        };
      }

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'clients',
        requestType: clientId ? 'client_analysis' : 'portfolio_analysis',
        context
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Client insights error:', error);
      return { error: 'Failed to generate client insights' };
    }
  }

  // Cases Tab - Case strategy and management
  async getCaseInsights(firmId: number, userId: number, caseId?: number): Promise<any> {
    try {
      let context: any = {};

      if (caseId) {
        // Specific case analysis
        const caseData = await db
          .select()
          .from(cases)
          .where(and(
            eq(cases.firmId, firmId),
            eq(cases.id, caseId)
          ))
          .limit(1);

        const caseDocuments = await db
          .select()
          .from(documents)
          .where(and(
            eq(documents.firmId, firmId)
            // TODO: Add case-document relationship
          ))
          .limit(10);

        const caseTimeLogs = await db
          .select()
          .from(timeLogs)
          .where(and(
            eq(timeLogs.firmId, firmId),
            eq(timeLogs.caseId, caseId)
          ));

        context = {
          case: caseData[0],
          documents: caseDocuments,
          timeLogs: caseTimeLogs,
          analysisType: 'individual_case'
        };
      } else {
        // Overall case portfolio analysis
        const allCases = await db
          .select()
          .from(cases)
          .where(eq(cases.firmId, firmId))
          .orderBy(desc(cases.createdAt));

        context = {
          cases: allCases.slice(0, 15),
          analysisType: 'case_portfolio'
        };
      }

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'cases',
        requestType: caseId ? 'case_strategy' : 'portfolio_overview',
        context
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Case insights error:', error);
      return { error: 'Failed to generate case insights' };
    }
  }

  // Documents Tab - Document analysis and organization
  async getDocumentInsights(firmId: number, userId: number, documentId?: number): Promise<any> {
    try {
      let context: any = {};

      if (documentId) {
        // Specific document analysis
        const document = await db
          .select()
          .from(documents)
          .where(and(
            eq(documents.firmId, firmId),
            eq(documents.id, documentId)
          ))
          .limit(1);

        context = {
          document: document[0],
          analysisType: 'individual_document'
        };
      } else {
        // Document portfolio analysis
        const recentDocuments = await db
          .select()
          .from(documents)
          .where(eq(documents.firmId, firmId))
          .orderBy(desc(documents.createdAt))
          .limit(20);

        context = {
          documents: recentDocuments,
          analysisType: 'document_portfolio'
        };
      }

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'documents',
        requestType: documentId ? 'document_analysis' : 'portfolio_organization',
        context
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Document insights error:', error);
      return { error: 'Failed to generate document insights' };
    }
  }

  // Calendar Tab - Scheduling optimization
  async getCalendarInsights(firmId: number, userId: number): Promise<any> {
    try {
      // TODO: Re-enable when calendarEvents table is implemented
      // const upcomingEvents = await db
      //   .select()
      //   .from(calendarEvents)
      //   .where(eq(calendarEvents.firmId, firmId))
      //   .orderBy(calendarEvents.startTime)
      //   .limit(20);
      const upcomingEvents: any[] = []; // Temporary mock

      const context = {
        events: upcomingEvents,
        analysisType: 'schedule_optimization'
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'calendar',
        requestType: 'schedule_analysis',
        context
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Calendar insights error:', error);
      return { error: 'Failed to generate calendar insights' };
    }
  }

  // Tasks Tab - Task prioritization and workflow
  async getTaskInsights(firmId: number, userId: number): Promise<any> {
    try {
      // TODO: Add tasks table to schema, for now use time logs as proxy
      const recentTimeLogs = await db
        .select()
        .from(timeLogs)
        .where(eq(timeLogs.firmId, firmId))
        .orderBy(desc(timeLogs.createdAt))
        .limit(20);

      const context = {
        timeLogs: recentTimeLogs,
        analysisType: 'workflow_optimization'
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'tasks',
        requestType: 'workflow_analysis',
        context
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Task insights error:', error);
      return { error: 'Failed to generate task insights' };
    }
  }

  // Billing Tab - Financial insights and optimization
  async getBillingInsights(firmId: number, userId: number): Promise<any> {
    try {
      const recentInvoices = await db
        .select()
        .from(invoices)
        .where(eq(invoices.firmId, firmId))
        .orderBy(desc(invoices.createdAt))
        .limit(20);

      const unbilledTimeLogs = await db
        .select()
        .from(timeLogs)
        .where(and(
          eq(timeLogs.firmId, firmId),
          isNull(timeLogs.invoiceId)
        ))
        .limit(50);

      const context = {
        invoices: recentInvoices,
        unbilledTime: unbilledTimeLogs,
        analysisType: 'financial_optimization'
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'billing',
        requestType: 'financial_analysis',
        context
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Billing insights error:', error);
      return { error: 'Failed to generate billing insights' };
    }
  }

  // Paralegal+ Tab - Research and document generation
  async getParalegalInsights(firmId: number, userId: number, requestType: string, userQuery?: string): Promise<any> {
    try {
      // This tab is more interactive and query-driven
      const context = {
        requestType,
        firmData: {
          // Basic firm context for legal research
          practiceAreas: [], // TODO: Get from firm preferences
          jurisdiction: 'US', // TODO: Get from firm settings
        }
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'paralegal',
        requestType,
        context,
        userQuery
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Paralegal insights error:', error);
      return { error: 'Failed to generate paralegal insights' };
    }
  }

  // Generic method for custom queries on any tab
  async getCustomInsights(
    firmId: number, 
    userId: number, 
    tabType: TabType, 
    query: string
  ): Promise<any> {
    try {
      const context = {
        customQuery: true,
        userQuery: query
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType,
        requestType: 'custom_query',
        context,
        userQuery: query
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Custom insights error:', error);
      return { error: 'Failed to process custom query' };
    }
  }

  // =============================================================================
  // PHASE 2: LLM-POWERED FUNCTIONS - All 11 tabs with proper context mapping
  // =============================================================================

  // 1. Document Review - Analyze documents for legal issues
  async getDocumentReview(firmId: number, userId: number, documentId: number, userQuery?: string): Promise<any> {
    try {
      // Get document content and metadata
      const document = await db
        .select()
        .from(documents)
        .where(and(eq(documents.id, documentId), eq(documents.firmId, firmId)))
        .limit(1);

      if (!document.length) {
        return { error: 'Document not found' };
      }

      const context = {
        document: {
          fileName: document[0].fileName,
          documentType: document[0].documentType,
          content: document[0].content,
          mimeType: document[0].mimeType,
          uploadedAt: document[0].uploadedAt
        },
        firmContext: await this.getFirmContext(firmId),
        analysisType: 'comprehensive_review'
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'document_review',
        requestType: 'document_analysis',
        context,
        userQuery: userQuery || 'Provide a comprehensive legal review of this document'
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Document review error:', error);
      return { error: 'Failed to analyze document' };
    }
  }

  // 2. Contract Analysis - Specialized contract review
  async getContractAnalysis(firmId: number, userId: number, documentId: number, userQuery?: string): Promise<any> {
    try {
      const document = await db
        .select()
        .from(documents)
        .where(and(eq(documents.id, documentId), eq(documents.firmId, firmId)))
        .limit(1);

      if (!document.length) {
        return { error: 'Contract not found' };
      }

      const context = {
        contract: {
          fileName: document[0].fileName,
          content: document[0].content,
          documentType: document[0].documentType
        },
        analysisType: 'contract_specific',
        focusAreas: ['terms', 'obligations', 'risks', 'compliance'],
        firmContext: await this.getFirmContext(firmId)
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'contract_analysis',
        requestType: 'contract_review',
        context,
        userQuery: userQuery || 'Analyze this contract for key terms, risks, and recommendations'
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Contract analysis error:', error);
      return { error: 'Failed to analyze contract' };
    }
  }

  // 3. Compliance Check - Regulatory compliance verification
  async getComplianceCheck(firmId: number, userId: number, documentId: number, regulations?: string[], userQuery?: string): Promise<any> {
    try {
      const document = await db
        .select()
        .from(documents)
        .where(and(eq(documents.id, documentId), eq(documents.firmId, firmId)))
        .limit(1);

      if (!document.length) {
        return { error: 'Document not found' };
      }

      const firmContext = await this.getFirmContext(firmId);
      
      const context = {
        document: {
          fileName: document[0].fileName,
          content: document[0].content,
          documentType: document[0].documentType
        },
        compliance: {
          regulations: regulations || ['General Legal Standards'],
          jurisdiction: firmContext.jurisdiction || 'US',
          industryStandards: firmContext.practiceAreas || []
        },
        firmContext
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'compliance_check',
        requestType: 'compliance_verification',
        context,
        userQuery: userQuery || 'Check this document for regulatory compliance issues'
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Compliance check error:', error);
      return { error: 'Failed to check compliance' };
    }
  }

  // 4. Risk Assessment - Comprehensive legal risk analysis
  async getRiskAssessment(firmId: number, userId: number, documentId: number, riskTypes?: string[], userQuery?: string): Promise<any> {
    try {
      const document = await db
        .select()
        .from(documents)
        .where(and(eq(documents.id, documentId), eq(documents.firmId, firmId)))
        .limit(1);

      if (!document.length) {
        return { error: 'Document not found' };
      }

      const context = {
        document: {
          fileName: document[0].fileName,
          content: document[0].content,
          documentType: document[0].documentType
        },
        riskAssessment: {
          types: riskTypes || ['legal', 'financial', 'operational', 'reputational'],
          priority: 'comprehensive',
          mitigationFocus: true
        },
        firmContext: await this.getFirmContext(firmId)
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'risk_assessment',
        requestType: 'risk_analysis',
        context,
        userQuery: userQuery || 'Identify and assess all legal risks in this document'
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Risk assessment error:', error);
      return { error: 'Failed to assess risks' };
    }
  }

  // 5. Clause Extraction - Smart clause identification and extraction
  async getClauseExtraction(firmId: number, userId: number, documentId: number, clauseTypes?: string[], userQuery?: string): Promise<any> {
    try {
      const document = await db
        .select()
        .from(documents)
        .where(and(eq(documents.id, documentId), eq(documents.firmId, firmId)))
        .limit(1);

      if (!document.length) {
        return { error: 'Document not found' };
      }

      const context = {
        document: {
          fileName: document[0].fileName,
          content: document[0].content,
          documentType: document[0].documentType
        },
        extraction: {
          clauseTypes: clauseTypes || ['standard', 'custom', 'financial', 'performance', 'termination'],
          structuredOutput: true,
          categorization: true
        },
        firmContext: await this.getFirmContext(firmId)
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'clause_extraction',
        requestType: 'clause_parsing',
        context,
        userQuery: userQuery || 'Extract and categorize all important clauses from this document'
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Clause extraction error:', error);
      return { error: 'Failed to extract clauses' };
    }
  }

  // 6. Legal Research - Comprehensive legal research and citation
  async getLegalResearch(firmId: number, userId: number, query: string, jurisdiction?: string, practiceArea?: string): Promise<any> {
    try {
      const firmContext = await this.getFirmContext(firmId);
      
      const context = {
        research: {
          query,
          jurisdiction: jurisdiction || firmContext.jurisdiction || 'US',
          practiceArea: practiceArea || 'General',
          depth: 'comprehensive',
          citationFormat: 'bluebook'
        },
        firmContext
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'legal_research',
        requestType: 'research_query',
        context,
        userQuery: query
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Legal research error:', error);
      return { error: 'Failed to conduct legal research' };
    }
  }

  // 7. Document Drafting - Legal document creation and revision
  async getDocumentDrafting(firmId: number, userId: number, documentType: string, parameters: any, templateId?: number): Promise<any> {
    try {
      const firmContext = await this.getFirmContext(firmId);
      
      const context = {
        drafting: {
          documentType,
          parameters,
          templateId,
          jurisdiction: firmContext.jurisdiction || 'US',
          firmBranding: true
        },
        firmContext
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'document_drafting',
        requestType: 'document_creation',
        context,
        userQuery: `Draft a ${documentType} document with the specified parameters`
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Document drafting error:', error);
      return { error: 'Failed to draft document' };
    }
  }

  // 8. Case Strategy - Strategic case analysis and planning
  async getCaseStrategy(firmId: number, userId: number, caseId: number, strategyType?: string, userQuery?: string): Promise<any> {
    try {
      const caseData = await db
        .select()
        .from(cases)
        .where(and(eq(cases.id, caseId), eq(cases.firmId, firmId)))
        .limit(1);

      if (!caseData.length) {
        return { error: 'Case not found' };
      }

      // Get related documents for this case (by matching case title or using document metadata)
      const relatedDocs = await db
        .select()
        .from(documents)
        .where(eq(documents.firmId, firmId))
        .limit(10);

      const context = {
        case: {
          title: caseData[0].title,
          status: caseData[0].status,
          description: caseData[0].description,
          name: caseData[0].name
        },
        strategy: {
          type: strategyType || 'comprehensive',
          focus: ['legal_theory', 'evidence', 'timeline', 'resources'],
          objectives: 'client_success'
        },
        relatedDocuments: relatedDocs.length,
        firmContext: await this.getFirmContext(firmId)
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'case_strategy',
        requestType: 'strategy_analysis',
        context,
        userQuery: userQuery || 'Develop a comprehensive case strategy and action plan'
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Case strategy error:', error);
      return { error: 'Failed to generate case strategy' };
    }
  }

  // =============================================================================
  // PARALEGAL+ FUNCTIONS (3 sub-tabs)
  // =============================================================================

  // 9. Discovery Management - Discovery planning and document management
  async getDiscoveryManagement(firmId: number, userId: number, caseId: number, discoveryType?: string, userQuery?: string): Promise<any> {
    try {
      const caseData = await db
        .select()
        .from(cases)
        .where(and(eq(cases.id, caseId), eq(cases.firmId, firmId)))
        .limit(1);

      if (!caseData.length) {
        return { error: 'Case not found' };
      }

      const context = {
        case: {
          title: caseData[0].title,
          status: caseData[0].status
        },
        discovery: {
          type: discoveryType || 'comprehensive',
          phase: 'planning',
          scope: 'full_discovery',
          deadlines: true
        },
        firmContext: await this.getFirmContext(firmId)
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'discovery_management',
        requestType: 'discovery_planning',
        context,
        userQuery: userQuery || 'Create a comprehensive discovery management plan'
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Discovery management error:', error);
      return { error: 'Failed to manage discovery' };
    }
  }

  // 10. Citation Research - Legal citation verification and research
  async getCitationResearch(firmId: number, userId: number, query: string, citationStyle?: string, jurisdiction?: string): Promise<any> {
    try {
      const firmContext = await this.getFirmContext(firmId);
      
      const context = {
        citation: {
          query,
          style: citationStyle || 'bluebook',
          jurisdiction: jurisdiction || firmContext.jurisdiction || 'US',
          verification: true,
          format: 'professional'
        },
        firmContext
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'citation_research',
        requestType: 'citation_lookup',
        context,
        userQuery: query
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Citation research error:', error);
      return { error: 'Failed to research citations' };
    }
  }

  // 11. Document Automation - Template and workflow automation
  async getDocumentAutomation(firmId: number, userId: number, automationType: string, parameters: any, userQuery?: string): Promise<any> {
    try {
      const context = {
        automation: {
          type: automationType,
          parameters,
          workflow: true,
          efficiency: 'maximum',
          qualityControl: true
        },
        firmContext: await this.getFirmContext(firmId)
      };

      const request: LlmRequest = {
        firmId,
        userId,
        tabType: 'document_automation',
        requestType: 'automation_design',
        context,
        userQuery: userQuery || 'Design document automation workflow'
      };

      return await llmService.processRequest(request);
    } catch (error) {
      console.error('Document automation error:', error);
      return { error: 'Failed to automate document process' };
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private async getFirmContext(firmId: number): Promise<any> {
    try {
      // This would get firm-specific context like practice areas, jurisdiction, preferences
      // For now, returning a basic structure
      return {
        practiceAreas: [], // TODO: Get from firm preferences
        jurisdiction: 'US', // TODO: Get from firm settings
        preferences: {}, // TODO: Get from firm preferences
        branding: {} // TODO: Get from firm branding
      };
    } catch (error) {
      console.error('Error getting firm context:', error);
      return {
        practiceAreas: [],
        jurisdiction: 'US',
        preferences: {},
        branding: {}
      };
    }
  }
}

export const tabLlmService = new TabLlmService();
