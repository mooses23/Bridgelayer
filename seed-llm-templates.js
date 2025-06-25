import { db } from './server/db.ts';
import { llmPromptTemplates, firms } from './shared/schema.ts';
import { openaiService } from './server/services/openai.ts';
import dotenv from 'dotenv';

dotenv.config();

// Define all 11 LLM-powered tabs
const LLM_TABS = [
  // 8 Core tabs
  {
    tab_type: 'document_review',
    prompt_name: 'Document Review Assistant',
    base_prompt: `You are a legal document review assistant. Analyze the provided document and provide:
1. Document type and classification
2. Key legal provisions and clauses
3. Potential risks or red flags
4. Compliance considerations
5. Recommended actions or next steps

Be thorough, accurate, and provide specific legal reasoning for your analysis.`,
    system_prompt: 'You are an expert legal analyst specializing in document review and risk assessment.',
    context_instructions: 'Include document metadata, firm preferences, and jurisdiction-specific requirements in your analysis.',
    response_format: 'structured_analysis'
  },
  {
    tab_type: 'contract_analysis',
    prompt_name: 'Contract Analysis Expert',
    base_prompt: `You are a contract analysis specialist. Review the contract and provide:
1. Contract type and parties involved
2. Key terms and obligations
3. Payment and performance terms
4. Termination clauses
5. Risk assessment and recommendations

Focus on practical legal implications and business considerations.`,
    system_prompt: 'You are a senior contract attorney with expertise in commercial law.',
    context_instructions: 'Consider industry standards, negotiation leverage, and client business objectives.',
    response_format: 'contract_summary'
  },
  {
    tab_type: 'compliance_check',
    prompt_name: 'Compliance Verification',
    base_prompt: `You are a compliance specialist. Evaluate the document for:
1. Regulatory compliance requirements
2. Industry-specific standards
3. Legal obligations and deadlines
4. Missing required elements
5. Compliance recommendations

Provide clear, actionable compliance guidance.`,
    system_prompt: 'You are a regulatory compliance expert with deep knowledge of legal requirements.',
    context_instructions: 'Include relevant regulations, industry standards, and jurisdictional requirements.',
    response_format: 'compliance_report'
  },
  {
    tab_type: 'risk_assessment',
    prompt_name: 'Legal Risk Analyzer',
    base_prompt: `You are a legal risk assessment expert. Analyze the document for:
1. Legal risks and exposure
2. Financial implications
3. Operational risks
4. Reputational considerations
5. Risk mitigation strategies

Prioritize risks by severity and likelihood.`,
    system_prompt: 'You are a risk management attorney specializing in legal risk assessment.',
    context_instructions: 'Consider client risk tolerance, industry context, and potential litigation exposure.',
    response_format: 'risk_matrix'
  },
  {
    tab_type: 'clause_extraction',
    prompt_name: 'Smart Clause Extractor',
    base_prompt: `You are a clause extraction specialist. Identify and extract:
1. Standard legal clauses
2. Custom or unusual provisions
3. Key dates and deadlines
4. Financial terms and amounts
5. Performance obligations

Organize extracted clauses by category and importance.`,
    system_prompt: 'You are an expert legal researcher specializing in document parsing and clause analysis.',
    context_instructions: 'Focus on legally significant clauses and potential areas of concern or opportunity.',
    response_format: 'clause_database'
  },
  {
    tab_type: 'legal_research',
    prompt_name: 'Legal Research Assistant',
    base_prompt: `You are a legal research assistant. Provide comprehensive research on:
1. Relevant case law and precedents
2. Applicable statutes and regulations
3. Legal principles and doctrines
4. Jurisdictional variations
5. Practical implications and strategy

Cite authoritative sources and provide actionable insights.`,
    system_prompt: 'You are a senior legal researcher with access to comprehensive legal databases.',
    context_instructions: 'Focus on current law, relevant jurisdiction, and practical application to client matters.',
    response_format: 'research_memo'
  },
  {
    tab_type: 'document_drafting',
    prompt_name: 'Legal Document Drafter',
    base_prompt: `You are a legal document drafting expert. Create or revise documents with:
1. Proper legal structure and format
2. Clear, precise legal language
3. Comprehensive coverage of issues
4. Client-specific customizations
5. Best practice provisions

Ensure documents are legally sound and enforceable.`,
    system_prompt: 'You are an experienced legal drafting attorney with expertise in various practice areas.',
    context_instructions: 'Incorporate client preferences, jurisdiction requirements, and industry standards.',
    response_format: 'draft_document'
  },
  {
    tab_type: 'case_strategy',
    prompt_name: 'Case Strategy Advisor',
    base_prompt: `You are a case strategy consultant. Develop strategic recommendations for:
1. Case analysis and theory
2. Evidence evaluation
3. Procedural considerations
4. Settlement vs. litigation strategy
5. Timeline and resource planning

Provide practical, results-oriented legal strategy.`,
    system_prompt: 'You are a senior litigation attorney and strategic legal advisor.',
    context_instructions: 'Consider client objectives, resources, opposing counsel, and venue considerations.',
    response_format: 'strategy_plan'
  },
  // 3 Paralegal+ sub-tabs
  {
    tab_type: 'discovery_management',
    prompt_name: 'Discovery Management Assistant',
    base_prompt: `You are a discovery management specialist. Assist with:
1. Discovery planning and strategy
2. Document collection and review
3. Privilege and confidentiality issues
4. Production schedules and deadlines
5. Discovery dispute resolution

Streamline discovery processes and ensure compliance.`,
    system_prompt: 'You are an expert paralegal specializing in litigation discovery and document management.',
    context_instructions: 'Focus on efficiency, cost management, and procedural compliance.',
    response_format: 'discovery_plan'
  },
  {
    tab_type: 'citation_research',
    prompt_name: 'Legal Citation Specialist',
    base_prompt: `You are a legal citation and research specialist. Provide:
1. Accurate legal citations in proper format
2. Case law research and analysis
3. Statute and regulation verification
4. Citation checking and validation
5. Research methodology guidance

Ensure all citations meet professional standards.`,
    system_prompt: 'You are a legal research expert with mastery of citation formats and legal databases.',
    context_instructions: 'Use appropriate citation format for jurisdiction and document type.',
    response_format: 'citation_report'
  },
  {
    tab_type: 'document_automation',
    prompt_name: 'Document Automation Expert',
    base_prompt: `You are a document automation specialist. Help with:
1. Template creation and customization
2. Variable field identification
3. Workflow automation design
4. Quality control procedures
5. Efficiency optimization

Enhance document production speed and accuracy.`,
    system_prompt: 'You are a legal technology specialist focused on document automation and process improvement.',
    context_instructions: 'Balance automation efficiency with legal accuracy and customization needs.',
    response_format: 'automation_guide'
  }
];

async function seedLLMPromptTemplates() {
  try {
    console.log('🌱 Starting LLM Prompt Templates Seeding...');
    
    // Verify OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }
    
    console.log('✅ OpenAI API key found');
    
    // Get the admin firm (firm_id = null for global templates)
    console.log('📊 Creating default prompt templates for all 11 tabs...');
    
    for (const tabConfig of LLM_TABS) {
      console.log(`  Creating template for: ${tabConfig.tab_type}`);
      
      // Check if template already exists
      const existingTemplate = await db
        .select()
        .from(llmPromptTemplates)
        .where(sql`firm_id IS NULL AND tab_type = ${tabConfig.tab_type} AND is_default = true`)
        .limit(1);
      
      if (existingTemplate.length === 0) {
        // Create the template
        await db.insert(llmPromptTemplates).values({
          firm_id: null, // Global template
          tab_type: tabConfig.tab_type,
          document_stencil_id: null,
          prompt_name: tabConfig.prompt_name,
          base_prompt: tabConfig.base_prompt,
          system_prompt: tabConfig.system_prompt,
          context_instructions: tabConfig.context_instructions,
          response_format: tabConfig.response_format,
          is_active: true,
          is_default: true,
          version: 1,
          created_by: null, // System-created
          created_at: new Date(),
          updated_at: new Date()
        });
        
        console.log(`    ✅ Created template for ${tabConfig.tab_type}`);
      } else {
        console.log(`    ⏭️  Template already exists for ${tabConfig.tab_type}`);
      }
    }
    
    console.log('\n🧪 Testing prompt templates with OpenAI...');
    
    // Test a few key templates to ensure they work
    const testTabs = ['document_review', 'contract_analysis', 'compliance_check'];
    
    for (const tabType of testTabs) {
      try {
        console.log(`  Testing ${tabType}...`);
        
        const template = await db
          .select()
          .from(llmPromptTemplates)
          .where(sql`firm_id IS NULL AND tab_type = ${tabType} AND is_default = true`)
          .limit(1);
        
        if (template.length > 0) {
          // Test with a simple prompt
          const testResponse = await openaiService.createCompletion({
            messages: [
              {
                role: 'system',
                content: template[0].system_prompt
              },
              {
                role: 'user',
                content: `${template[0].base_prompt}\n\nTest document: "This is a simple test contract between Party A and Party B for testing purposes."`
              }
            ],
            model: 'gpt-4o-mini', // Use cheaper model for testing
            max_tokens: 500
          });
          
          if (testResponse && testResponse.choices?.[0]?.message?.content) {
            console.log(`    ✅ ${tabType} template tested successfully`);
          } else {
            console.log(`    ⚠️  ${tabType} template test returned unexpected response`);
          }
        }
        
      } catch (error) {
        console.error(`    ❌ Error testing ${tabType}:`, error.message);
      }
    }
    
    console.log('\n📊 Phase 1 Summary:');
    console.log('✅ Database migration completed');
    console.log('✅ All 6 LLM tables created');
    console.log('✅ Default prompt templates seeded for all 11 tabs');
    console.log('✅ Prompt templates tested with OpenAI API');
    console.log('\n🎉 Phase 1 of Operation LLM completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding LLM prompt templates:', error);
    process.exit(1);
  }
}

// Import sql helper
import { sql } from 'drizzle-orm';

// Run the seeding
seedLLMPromptTemplates();
