import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema.js";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function seedLlmData() {
  console.log('🤖 Seeding LLM prompt templates and data...');

  try {
    // Default prompt templates for each tab
    const defaultTemplates = [
      {
        tabType: 'dashboard',
        promptName: 'Dashboard Insights',
        basePrompt: 'You are a legal AI assistant helping to analyze dashboard data for a law firm. Provide insights about case status, upcoming deadlines, financial metrics, and workload distribution.',
        systemPrompt: 'Focus on actionable insights that help with firm management and case prioritization.',
        contextInstructions: 'Consider recent cases, billing data, calendar events, and task completion rates.',
        responseFormat: 'Provide a structured analysis with key metrics, trends, and recommendations.',
        isDefault: true,
        isActive: true
      },
      {
        tabType: 'clients',
        promptName: 'Client Analysis',
        basePrompt: 'You are a legal AI assistant helping to analyze client data and relationships. Provide insights about client history, case outcomes, billing patterns, and potential opportunities.',
        systemPrompt: 'Focus on client relationship management and business development opportunities.',
        contextInstructions: 'Consider client intake data, case history, payment patterns, and communication logs.',
        responseFormat: 'Provide client insights with relationship status, opportunities, and action items.',
        isDefault: true,
        isActive: true
      },
      {
        tabType: 'cases',
        promptName: 'Case Analysis',
        basePrompt: 'You are a legal AI assistant helping to analyze case data and progress. Provide insights about case status, deadlines, potential risks, and strategic recommendations.',
        systemPrompt: 'Focus on case strategy, risk assessment, and deadline management.',
        contextInstructions: 'Consider case type, timeline, documents, opposing parties, and court requirements.',
        responseFormat: 'Provide case analysis with status summary, risk assessment, and next steps.',
        isDefault: true,
        isActive: true
      },
      {
        tabType: 'documents',
        promptName: 'Document Analysis',
        basePrompt: 'You are a legal AI assistant helping to analyze legal documents. Provide insights about document content, risks, compliance issues, and recommendations.',
        systemPrompt: 'Focus on legal document review, risk identification, and compliance checking.',
        contextInstructions: 'Consider document type, jurisdiction, parties involved, and relevant legal standards.',
        responseFormat: 'Provide document analysis with summary, risks, compliance notes, and recommendations.',
        isDefault: true,
        isActive: true
      },
      {
        tabType: 'calendar',
        promptName: 'Calendar & Scheduling',
        basePrompt: 'You are a legal AI assistant helping to analyze calendar and scheduling data. Provide insights about upcoming deadlines, court dates, conflicts, and time management.',
        systemPrompt: 'Focus on scheduling optimization, deadline tracking, and conflict resolution.',
        contextInstructions: 'Consider court deadlines, client meetings, internal tasks, and attorney availability.',
        responseFormat: 'Provide scheduling analysis with conflicts, priorities, and optimization suggestions.',
        isDefault: true,
        isActive: true
      },
      {
        tabType: 'tasks',
        promptName: 'Task Management',
        basePrompt: 'You are a legal AI assistant helping to analyze task and workflow data. Provide insights about task priorities, bottlenecks, and productivity improvements.',
        systemPrompt: 'Focus on workflow optimization, task prioritization, and productivity enhancement.',
        contextInstructions: 'Consider task deadlines, assignees, case relationships, and workload distribution.',
        responseFormat: 'Provide task analysis with priorities, bottlenecks, and workflow improvements.',
        isDefault: true,
        isActive: true
      },
      {
        tabType: 'billing',
        promptName: 'Billing & Financial Analysis',
        basePrompt: 'You are a legal AI assistant helping to analyze billing and financial data. Provide insights about revenue, outstanding invoices, payment patterns, and financial health.',
        systemPrompt: 'Focus on financial analysis, revenue optimization, and payment collection.',
        contextInstructions: 'Consider billing rates, time entries, payment history, and outstanding balances.',
        responseFormat: 'Provide financial analysis with revenue insights, collection priorities, and recommendations.',
        isDefault: true,
        isActive: true
      },
      {
        tabType: 'paralegal',
        promptName: 'Paralegal Support',
        basePrompt: 'You are a legal AI assistant helping paralegals with case preparation, research, and administrative tasks. Provide guidance on legal procedures, document preparation, and case organization.',
        systemPrompt: 'Focus on paralegal support, procedural guidance, and task efficiency.',
        contextInstructions: 'Consider case requirements, court procedures, document needs, and deadlines.',
        responseFormat: 'Provide paralegal guidance with step-by-step instructions and best practices.',
        isDefault: true,
        isActive: true
      }
    ];

    // Insert default templates
    for (const template of defaultTemplates) {
      await db.insert(schema.llmPromptTemplates).values(template).onConflictDoNothing();
      console.log(`✅ Inserted default template for ${template.tabType}`);
    }

    // Create a sample firm LLM settings (for testing)
    const testFirmId = 1; // Assuming there's a test firm with ID 1
    
    await db.insert(schema.firmLlmSettings).values({
      firmId: testFirmId,
      openaiApiKey: null, // Will be set by firm admin
      defaultModel: 'gpt-4o',
      maxTokens: 4000,
      temperature: 70,
      monthlyTokenLimit: 1000000,
      isActive: false, // Inactive until API key is configured
    }).onConflictDoNothing();

    console.log('✅ Created sample firm LLM settings');

    console.log('🎉 LLM data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding LLM data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedLlmData().catch(console.error);

// Archived: seed-llm-data.js -- legacy seed script removed
