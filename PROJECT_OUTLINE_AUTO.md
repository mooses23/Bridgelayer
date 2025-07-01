# BridgeLayer Platform - Technical Architecture & Implementation Guide

## 🏗️ System Overview

BridgeLayer is a multi-tenant SaaS platform that enables rapid deployment of vertical-specific solutions. The platform uses a sophisticated onboarding system where administrators configure custom instances for firms, with FirmSync (legal vertical) as the flagship implementation.

## 🎯 Core Architecture Principles

### 1. Multi-Tenant Architecture
- **Firm Isolation**: Every database query includes `firmId` validation
- **Shared Infrastructure**: Single codebase serves multiple firms with custom configurations
- **Data Segregation**: Row-level security ensures complete data isolation
- **Performance**: Indexed queries on `firmId` for optimal performance
- **Tenant-Aware Middleware**: Middleware explicitly injects and validates `firmId` context for every request, ensuring no cross-tenant data leaks.

### 2. Dual-Key OpenAI System
- **Admin Key**: Used during onboarding to generate AI agent prompts
- **Firm Keys**: Each firm provides their own OpenAI key for all firm & doc agents w base prompts 
- **Cost Separation**: Platform pays for prompt generation, firms pay for usage
- **Security**: All API keys encrypted at rest using AES-256-GCM
- **Key Rotation & Management**: Automated key rotation reminders and secure key management dashboard for admins.

### 3. Modular Component System
```
┌─────────────────────────────────────────────────────────┐
│                    Admin Portal                         │
├─────────────────────────────────────────────────────────┤
│  Navigation │  Onboarding Wizard  │  Firm Management   │
├─────────────┴────────────┴────────┴────────────────────┤
│                  Shared Services Layer                   │
│  • Authentication  • Encryption  • Validation  • Audit  │
├─────────────────────────────────────────────────────────┤
│                   Data Access Layer                      │
│  • Drizzle ORM  • PostgreSQL  • Redis  • File Storage  │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Authentication & Authorization

### Dual-Mode Login System
```typescript
interface AuthModes {
  bridgelayer: AdminAuth;  // Platform administrators
  firmsync: FirmAuth;     // Firm users
}
```

### Role Hierarchy
1. **Super Admin** (Platform Owner)
   - Full system access
   - Manages admin accounts
   - Views all metrics

2. **Admin** (Platform Staff)
   - Creates and configures firms
   - Manages integrations marketplace
   - Generates AI agents using admin OpenAI key

3. **Firm Owner**
   - Manages their firm's users
   - Configures firm settings
   - Views firm analytics

4. **Firm User**
   - Uses configured AI agents
   - Processes documents
   - Limited to assigned permissions
- **Permission Granularity**: Clearly defined permission scopes per role, with explicit permission inheritance and overrides.

## 🧙 Onboarding Wizard Architecture

### Context-Aware Navigation System

The admin sidebar dynamically changes behavior based on onboarding context:

```typescript
interface NavigationState {
  mode: 'platform' | 'onboarding';
  onboardingCode?: string;
  currentStep?: number;
}
```

### Navigation Items & Their Dual Purpose

| Nav Item | Without Code (Platform Mode) | With Code (Onboarding Mode) |
|----------|------------------------------|------------------------------|
| **Home** | Platform metrics dashboard | Onboarding progress tracker |
| **Firms** | List all firms, create new | Step 1: Configure firm details |
| **Integrations** | Manage marketplace | Step 2: Select firm integrations |
| **LLM** | Template management | Step 3: Generate AI agents |
| **Doc+** | Document type library | Step 4: Map agents to documents |
| **VR** | View FirmSync template | Preview configured firm |
| **Settings** | Platform configuration | Firm-specific settings |

### Onboarding Flow Technical Details

#### Step 1: Firm Configuration
```typescript
interface FirmSetup {
  // Basic Information
  name: string;
  email: string;
  contactName: string;
  
  // OpenAI Configuration
  openaiApiKey: string;  // Firm's own key (encrypted)
  
  // Legal Specialization
  practiceAreas: string[];
  clientTypes: string[];
  
  // Branding
  logo?: File;
  primaryColor: string;
  secondaryColor: string;
}
```
- **Validation & Error Handling**: Explicit validation schemas and error feedback for each input field.

#### Step 2: Integration Selection
```typescript
interface IntegrationConfig {
  // Shared marketplace - all firms see same options
  availableIntegrations: Integration[];
  
  // Firm selections
  selectedIntegrations: {
    integrationId: string;
    config?: {
      apiKey?: string;  // For third-party services
      webhookUrl?: string;
      customFields?: Record<string, any>;
    };
  }[];
}
```
- **Integration Health Checks**: Automated health checks and status indicators for third-party integrations.

#### Step 3: AI Agent Generation
```typescript
interface AgentGeneration {
  // Uses ADMIN OpenAI key to generate
  generateAgents(firmData: FirmSetup): Promise<Agent[]>;
  
  // Agent types generated
  agents: {
    head: HeadAgent;        // Orchestrates workflow
    contract: Agent;        // Contract analysis
    compliance: Agent;      // Compliance checking
    risk: Agent;           // Risk assessment
    summary: Agent;        // Executive summaries
    custom: Agent[];       // Firm-specific agents
  };
}
```
- **Prompt Versioning**: Maintain version history of generated prompts for audit and rollback purposes.

#### Step 4: Document Mapping
```typescript
interface DocumentMapping {
  documentTypes: DocumentType[];
  
  mappings: {
    documentTypeId: string;
    agentChain: string[];  // Ordered list of agent IDs
    processingRules: {
      autoProcess: boolean;
      requiresApproval: boolean;
      outputFormat: 'pdf' | 'docx' | 'json';
    };
  }[];
}
```
- **Mapping Validation**: Ensure agent chains are validated for logical consistency (no circular dependencies, proper ordering).

## 🤖 AI Agent Architecture

### Agent Chain System
```typescript
interface AgentChain {
  id: string;
  firmId: number;
  name: string;
  agents: {
    agentId: string;
    order: number;
    role: 'head' | 'processor' | 'synthesizer';
    inputFrom?: string;  // Previous agent ID
    outputTo?: string;   // Next agent ID
  }[];
}
```
- **Agent Chain Validation**: Implement validation logic to prevent misconfigured agent chains.

### Agent Execution Flow
```
Document Input
     ↓
[🧠 Head Agent] - Analyzes document type and delegates
     ↓
[📄 Specialized Agents] - Process in parallel or sequence
     ↓
[✍️ Synthesis Agent] - Combines outputs
     ↓
Final Report
```
- **Error Handling & Retries**: Robust error handling and retry mechanisms for agent execution failures.

### Dynamic Agent Injection (Doc+)
```typescript
interface DocPlusAgent {
  insertionPoint: number;  // Where in chain to insert
  condition: (doc: Document) => boolean;  // When to activate
  agent: Agent;  // The agent to inject
}
```
- **Conditional Logic Testing**: Provide a testing interface to simulate document conditions and verify Doc+ agent injections.

## 📊 Database Schema

### Core Tables
```sql
-- Multi-tenant foundation
firms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  onboarding_code VARCHAR(20) UNIQUE,
  onboarding_status ENUM('pending', 'in_progress', 'complete'),
  onboarding_step INTEGER DEFAULT 1,
  openai_api_key_encrypted TEXT,
  openai_api_key_iv TEXT,
  openai_api_key_tag TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

-- User management with roles
users (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER REFERENCES firms(id),
  email VARCHAR(255) UNIQUE,
  role ENUM('admin', 'firm_owner', 'firm_user'),
  permissions JSONB
)

-- AI agents configuration
llm_agents (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER REFERENCES firms(id),
  name VARCHAR(255),
  role ENUM('head', 'subtask', 'doc_plus'),
  system_prompt TEXT,
  parent_agent_id INTEGER REFERENCES llm_agents(id),
  order_in_chain INTEGER
)

-- Document processing
document_mappings (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER REFERENCES firms(id),
  document_type_id INTEGER,
  agent_chain JSONB,  -- Array of agent IDs in order
  processing_rules JSONB
)

-- Audit logs
audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  action ENUM('create', 'update', 'delete'),
  changed_by INTEGER REFERENCES users(id),
  change_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
)
```

## 🔄 State Management

### Frontend State Architecture
```typescript
interface AppState {
  auth: {
    user: User | null;
    role: Role;
    firmId?: number;
    token: string;
  };
  
  admin: {
    onboardingCode?: string;
    currentStep?: number;
    firmData?: Partial<FirmSetup>;
  };
  
  firm: {
    config: FirmConfig;
    agents: Agent[];
    documents: Document[];
  };
}
```
- **Error & Loading States**: Explicit global error and loading states for improved UX.

### Backend Session Management
```typescript
interface SessionData {
  userId: number;
  firmId?: number;
  role: Role;
  permissions: Permission[];
  onboardingContext?: {
    code: string;
    firmId: number;
    step: number;
  };
}
```
- **Session Expiration & Renewal**: Clearly defined session expiration policies and renewal mechanisms.

## 🚀 API Architecture

### RESTful Endpoints
```typescript
// Admin endpoints
POST   /api/admin/firms                    // Create firm (Step 1)
POST   /api/admin/firms/:code/integrations // Configure integrations (Step 2)
POST   /api/admin/firms/:code/agents       // Generate agents (Step 3)
POST   /api/admin/firms/:code/documents    // Map documents (Step 4)
GET    /api/admin/firms/:code/preview      // Preview configured firm

// Firm endpoints
POST   /api/firms/:firmId/documents        // Upload document
GET    /api/firms/:firmId/documents/:id    // Get processing results
POST   /api/firms/:firmId/process          // Trigger AI processing

// Shared endpoints
POST   /api/auth/login                     // Dual-mode login
POST   /api/auth/refresh                   // Refresh JWT
GET    /api/integrations/marketplace       // Available integrations
```
- **API Versioning**: Implement explicit API versioning (`/api/v1/...`) to manage breaking changes gracefully.

### Middleware Stack
```typescript
app.use([
  securityHeaders(),      // Helmet configuration
  rateLimiter(),         // Redis-backed rate limiting
  cors(),                // CORS with whitelist
  authenticate(),        // JWT validation
  firmContext(),         // Inject firmId from session
  validateInput(),       // Zod schema validation
  auditLog(),           // Track all actions
  errorHandler()        // Centralized error handling
]);
```
- **Request Tracing**: Add request tracing middleware (e.g., OpenTelemetry) for improved observability.

## 🛡️ Security Architecture

### Encryption Strategy
- **At Rest**: AES-256-GCM for API keys and sensitive data
- **In Transit**: TLS 1.3 for all communications
- **Key Management**: Separate encryption keys per environment
- **Rotation**: Quarterly key rotation with zero downtime
- **Automated Security Scans**: Regular automated security scans integrated into CI/CD pipeline.

### Access Control
```typescript
interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
  conditions?: {
    firmId?: number;
    ownerId?: number;
  };
}
```
- **Dynamic Permission Checks**: Middleware-based dynamic permission checks for every API endpoint.

## 🎨 Frontend Module Architecture

### Admin Portal Structure
```
/admin
  /components
    /navigation
      AdminSidebar.tsx      // Context-aware navigation
      OnboardingIndicator.tsx
    /onboarding
      FirmSetup.tsx         // Step 1
      IntegrationSelect.tsx // Step 2
      AgentGenerator.tsx    // Step 3
      DocumentMapper.tsx    // Step 4
    /preview
      FirmPreview.tsx       // VR mode component
  /hooks
    useOnboardingContext.ts
    useAdminAuth.ts
  /services
    onboardingService.ts
    firmService.ts
```
- **Reusable UI Components**: Centralized component library for consistent UI across admin and firm portals.

### Firm Portal Structure
```
/firm
  /components
    /dashboard
      Overview.tsx
      RecentDocuments.tsx
    /documents
      DocumentList.tsx
      DocumentProcessor.tsx
      AIResults.tsx
    /billing
      TimeEntry.tsx
      InvoiceBuilder.tsx
  /hooks
    useFirmContext.ts
    useAIProcessing.ts
```
- **Real-Time Updates**: WebSocket integration for real-time document processing updates and notifications.

## 📈 Performance Optimization

### Caching Strategy
```typescript
interface CacheLayer {
  redis: {
    sessionData: TTL(15_MINUTES);
    firmConfig: TTL(1_HOUR);
    aiResults: TTL(24_HOURS);
  };
  
  browser: {
    staticAssets: 'max-age=31536000';
    apiResponses: 'max-age=300';
  };
}
```

### Database Optimization
- **Indexes**: On firmId, userId, documentTypeId
- **Partitioning**: By firmId for large tables
- **Connection Pooling**: Separate pools for read/write
- **Query Optimization**: Prepared statements for common queries
- **Slow Query Monitoring**: Automated monitoring and alerting for slow database queries.

## 🧪 Testing Strategy

### Test Coverage Requirements
```typescript
interface TestCoverage {
  unit: {
    target: 80%;
    focus: ['services', 'utils', 'hooks'];
  };
  
  integration: {
    target: 70%;
    focus: ['api', 'database', 'auth'];
  };
  
  e2e: {
    target: 'critical paths';
    scenarios: ['onboarding', 'document-processing', 'billing'];
  };
}
```
- **Continuous Integration**: Automated test execution on every commit with clear pass/fail reporting.

## 🚀 Deployment Architecture

### Infrastructure
```yaml
production:
  frontend:
    hosting: Vercel
    cdn: CloudFlare
  
  backend:
    hosting: Railway/Render
    database: Neon Serverless
    redis: Upstash
    storage: AWS S3
  
  monitoring:
    logs: DataDog
    errors: Sentry
    analytics: PostHog
```

### CI/CD Pipeline
```yaml
pipeline:
  - lint & type-check
  - run tests
  - security scan
  - build artifacts
  - deploy to staging
  - run e2e tests
  - deploy to production
  - notify team
```
- **Rollback Strategy**: Explicit rollback procedures and automated rollback triggers upon deployment failures.

## 📊 Success Metrics & Monitoring

### Technical KPIs
- **API Response Time**: p95 < 200ms
- **Document Processing Time**: < 30 seconds
- **System Uptime**: 99.9%
- **Error Rate**: < 0.1%

### Business KPIs
- **Onboarding Completion Rate**: > 90%
- **Feature Adoption**: > 70% using AI features
- **User Satisfaction**: NPS > 50
- **Revenue Per Firm**: Growing MoM
- **Alerting & Incident Response**: Clearly defined alerting thresholds and incident response procedures.

## 🎯 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Authentication system
- Multi-tenant database
- Basic firm CRUD
- Admin dashboard shell
- **CI/CD Setup**: Establish CI/CD pipeline early for rapid iteration.

### Phase 2: Onboarding (Weeks 3-4)
- 4-step wizard implementation
- AI agent generation
- Integration marketplace
- Preview mode
- **Onboarding Analytics**: Track onboarding funnel metrics for continuous improvement.

### Phase 3: Firm Portal (Weeks 5-6)
- Document management
- AI processing pipeline
- Results visualization
- Basic billing
- **Real-Time Notifications**: Implement real-time notifications for document processing status.

### Phase 4: Polish & Launch (Weeks 7-8)
- Performance optimization
- Security audit
- Documentation
- Beta testing
- **User Training & Documentation**: Comprehensive user training materials and documentation.

## ⚠️ Potential Logic Flaws & Recommendations

### Identified Logic Flaws:
- **Agent Chain Circular Dependencies**: Current outline lacks explicit validation to prevent circular dependencies in agent chains.
- **Integration Health Checks**: Missing explicit health check mechanisms for third-party integrations.
- **Prompt Versioning & Rollbacks**: No explicit versioning or rollback strategy for AI-generated prompts.

### Recommendations:
- Implement explicit validation logic for agent chains to prevent circular dependencies.
- Add automated health checks and status indicators for integrations.
- Maintain prompt version history with rollback capabilities.

These enhancements will significantly improve the robustness, maintainability, and scalability of the BridgeLayer platform.

Here’s a concise, educated audit review of your codebase versus the project outline in PROJECT_OUTLINE_AUTO.md:

---

## Audit Review: BridgeLayer Platform vs. Project Outline

### Strengths & Alignment

- **Multi-Tenant Architecture**: Your codebase and documentation emphasize firmId validation, tenant-aware middleware, and row-level security, matching the outline’s requirements.
- **Authentication & Authorization**: Dual-mode login, role hierarchy, and permission granularity are well-documented and appear to be implemented.
- **Onboarding Wizard**: The 4-step onboarding flow, context-aware navigation, and onboarding code system are present and align with the outline.
- **Database Schema**: Core tables (firms, users, llm_agents, document_mappings, audit_logs) are defined as specified.
- **API & Middleware**: RESTful endpoints, versioning, and a robust middleware stack are described and likely implemented.
- **Security**: Encryption at rest, key management, and access control are addressed.
- **Testing & CI/CD**: Test coverage targets and CI/CD pipeline steps are outlined and referenced in supporting docs.
- **Frontend/Backend Structure**: Modular, reusable components and hooks for both admin and firm portals are described.

### Gaps & Recommendations

- **Agent Chain Circular Dependency Validation**: The outline calls for explicit logic to prevent circular dependencies in agent chains. This is noted as missing—ensure validation is implemented in both backend logic and UI.
- **Integration Health Checks**: Automated health checks and status indicators for third-party integrations are not explicitly present. Add these to integration setup and monitoring flows.
- **Prompt Versioning & Rollback**: There is no clear versioning or rollback mechanism for AI-generated prompts. Implement prompt history tracking and rollback endpoints/UI.
- **Real-Time Notifications**: WebSocket or similar real-time updates for document processing are mentioned but not confirmed as implemented—verify or add this.
- **User Training & Documentation**: Ensure comprehensive user-facing documentation and training materials are available before launch.

### Overall

Your codebase and documentation are strongly aligned with the outlined architecture and roadmap. The main areas needing attention are agent chain validation, integration health checks, and prompt versioning/rollback. Addressing these will close the most critical gaps and ensure the platform’s robustness and maintainability.

Let me know if you want a deeper dive into any specific area or implementation details for the missing features.