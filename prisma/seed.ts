import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test firm
  const firm = await prisma.firm.create({
    data: {
      name: 'Smith & Associates',
      slug: 'smith-associates',
      status: 'active',
      subscriptionTier: 'professional',
      contactName: 'John Smith',
      contactEmail: 'john@smithlaw.com',
      contactPhone: '+1-555-0123',
    },
  });

  // Create test agents
  const researcher = await prisma.agent.create({
    data: {
      firmId: firm.id,
      name: 'Legal Researcher',
      description: 'Specialized in legal research and precedent analysis',
      type: 'researcher',
      systemPrompt: 'You are an expert legal researcher with deep knowledge of case law...',
      capabilities: {
        canAccessLaw: true,
        canSearchPrecedents: true,
        maxDocuments: 50,
      },
    },
  });

  const analyst = await prisma.agent.create({
    data: {
      firmId: firm.id,
      name: 'Document Analyzer',
      description: 'Analyzes legal documents and contracts',
      type: 'analyst',
      systemPrompt: 'You are a detail-oriented legal document analyzer...',
      capabilities: {
        canAnalyzeContracts: true,
        canExtractClauses: true,
        supportedDocTypes: ['pdf', 'docx', 'txt'],
      },
    },
  });

  // Create prompts for the agents
  await prisma.agentPrompt.createMany({
    data: [
      {
        firmId: firm.id,
        agentId: researcher.id,
        name: 'Case Research',
        description: 'Template for case law research',
        prompt: 'Find relevant precedents for {legal_issue} in {jurisdiction}...',
        category: 'research',
      },
      {
        firmId: firm.id,
        agentId: analyst.id,
        name: 'Contract Review',
        description: 'Template for contract analysis',
        prompt: 'Review this contract focusing on {focus_areas}...',
        category: 'analysis',
      },
    ],
  });

  // Create workflows
  await prisma.agentWorkflow.createMany({
    data: [
      {
        firmId: firm.id,
        agentId: researcher.id,
        name: 'Research Request Flow',
        description: 'Handles new research requests',
        trigger: 'new_research_request',
        rules: {
          steps: [
            { action: 'validate_request', timeout: 300 },
            { action: 'perform_research', timeout: 3600 },
            { action: 'generate_summary', timeout: 600 },
          ],
          fallback: { action: 'notify_supervisor' },
        },
      },
      {
        firmId: firm.id,
        agentId: analyst.id,
        name: 'Contract Review Flow',
        description: 'Automated contract review process',
        trigger: 'new_contract_upload',
        rules: {
          steps: [
            { action: 'extract_text', timeout: 300 },
            { action: 'analyze_clauses', timeout: 1800 },
            { action: 'generate_report', timeout: 600 },
          ],
          fallback: { action: 'notify_supervisor' },
        },
      },
    ],
  });

  // Create integration configs
  await prisma.integrationConfig.createMany({
    data: [
      {
        firmId: firm.id,
        type: 'docusign',
        name: 'DocuSign Integration',
        config: {
          clientId: 'test-client-id',
          accountId: 'test-account-id',
          environment: 'sandbox',
        },
      },
      {
        firmId: firm.id,
        type: 'clio',
        name: 'Clio Integration',
        config: {
          apiKey: 'test-api-key',
          environment: 'sandbox',
        },
      },
    ],
  });

  // Create document templates
  await prisma.documentTemplate.createMany({
    data: [
      {
        firmId: firm.id,
        name: 'Service Agreement',
        description: 'Standard service agreement template',
        type: 'contract',
        category: 'agreements',
        content: '# Service Agreement\n\nThis agreement is made between {client_name}...',
        variables: {
          required: ['client_name', 'service_description', 'fee_amount'],
          optional: ['term_length', 'special_conditions'],
        },
        format: 'markdown',
      },
      {
        firmId: firm.id,
        name: 'Client Intake Form',
        description: 'New client intake questionnaire',
        type: 'form',
        category: 'onboarding',
        content: '# Client Intake Form\n\n1. Personal Information\n{client_details}...',
        variables: {
          required: ['client_details', 'matter_type', 'contact_info'],
          optional: ['referral_source', 'additional_notes'],
        },
        format: 'markdown',
      },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
