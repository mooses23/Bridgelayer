# 🌉 BridgeLayer Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

> **🚀 Status**: FirmSync Production Ready | **🔐 Security**: Multi-Tenant | **🏗️ Vision**: Multi-Vertical Scale

**BridgeLayer** is an honest, AI-Copilot-scaffolded foundation for multi-vertical SaaS platforms. **FirmSync** (legal document processing) is our only active vertical today, but the architecture intentionally exposes the vision for healthcare, education, and HR verticals—because thinking about cross-vertical scaling *now* creates better design decisions than retrofitting later.

## 🎯 What This Really Is

This isn't polished enterprise software. It's a **real foundation** built with AI assistance that demonstrates how to think about multi-tenant, multi-vertical platforms from day one. The code is messy in places, the UI shows future verticals that don't exist yet, and the onboarding flow is complex—but it's *honest* about the vision and *functional* for its current purpose.

### 🏢 Role Architecture (The Truth)

- **🌉 Owner (Bridgelayer)**: The visionary entrepreneur role. Currently exists mainly to see the multi-vertical vision reflected in the UI. No real functional responsibilities today, but represents the big-picture thinking that drives architectural decisions.

- **� Admin (FirmSync Onboarding)**: The *only* real operational role. Runs the entire 4-step onboarding pipeline for law firms. Uses their own OpenAI API key to auto-generate firm-specific AI agents. Goal: eventually train other Admins to scale onboarding operations.

- **🏢 Firm Users**: End-users (lawyers, paralegals, staff) who access their custom-configured FirmSync portal *after* onboarding is complete. Each firm gets isolated access to their configured document processing workflows.

## 🌐 Vertical Reality Check

### **Active vs. Future Verticals**

| Vertical | Status | Reality | Purpose |
|----------|--------|---------|---------|
| **FirmSync** | ✅ **Active** | Legal document processing, real workflows, actual firms | Revenue-generating vertical with full functionality |
| **MedSync** | 🔄 **Future** | Healthcare workflows (hard-coded UI only) | Vision proof for investors and architectural validation |
| **EduSync** | 🔄 **Future** | Educational institution workflows (UI placeholder) | Demonstrates scalability thinking in codebase |
| **HRSYNC** | 🔄 **Future** | HR policy & compliance (placeholder) | Forces multi-tenant design decisions early |

**Why show inactive verticals?** Because building for one vertical creates single-tenant thinking. Showing the vision forces better architecture *now*—multi-tenant schemas, role boundaries, and data isolation patterns that would be painful to retrofit later.

## 🎯 The Admin Onboarding Reality

The onboarding system is the **core operational workflow** where Admin (Avi) configures each law firm's custom FirmSync portal. It's complex because it's doing real work—collecting firm data, configuring AI agents, and building isolated workspaces.

### **📋 4-Step Onboarding Flow**

#### **🔵 Step 1: Firm Setup** *(The Foundation)*
- **What**: Collects all core firm data needed to build their custom portal
- **Complexity**: Broken into sub-sections (Basic Info, Practice Areas, Branding) because it's the most comprehensive step
- **Output**: Generates **Onboarding Code** (workspace session token for tracking progress)
- **Why Complex**: Real firms have complex practice areas (criminal, family, corporate law) and district-specific requirements. This step captures that complexity to ensure each firm gets a tailored FirmSync experience.

#### **🟣 Step 2: Integrations**
- **Purpose**:
  - *With Onboarding Code*: Allows firms to select integrations from the marketplace catagoriesed by functionality (e.g., CRM, Document Management, Billing)
  - *Without Onboarding Code*: Enables Admin to add new API/Webhook integrations to expand the marketplace
- **Dual Design**: The same UI supports both firm-specific integration selection and Admin-driven marketplace growth
- **Security**: Each integration uses scoped API keys and role-based access control to ensure data isolation

#### **� Step 3: Base Agent Configuration** *(AI-Powered Core)*
- **Purpose**: Configures the **core agents** that handle the firm's primary workflows. These agents are categorized by interaction type:

##### **Agent Categories**:

1. **Text-Box Agents (Paralegal+ Specific)**:
   - **Doc Gen Agent**: Smart text box with filters for document type, jurisdiction, etc.
   - **Case Analysis Agent**: Processes case details via user input forms
   - **Legal Research Agent**: Handles research queries through structured input
   - **Document Review Agent**: Reviews uploaded documents via user interface
   
2. **Data-Driven Agents (API/Database-Integrated)**:
   - **Cases Agent**: Interacts with case management APIs or FirmSync database
   - **Clients Agent**: Pulls client data from CRM integrations
   - **Calendar Agent**: Syncs with calendar systems for scheduling
   - **Billing Agent**: Processes billing data from integrated platforms

##### **How It Works**:
- **Text-Box Agents**: Users interact via forms/filters in Paralegal+ interface → agents consume input → generate dynamic prompts
- **Data-Driven Agents**: Fetch data from APIs or FirmSync database (based on Step 2 selections) → process data → return insights
- **Security**: Role-based access control ensures each agent only accesses authorized data sources
- **Output**: 4 core workflow agents (Cases, Clients, Calendar, Billing) + 4 Paralegal+ interface agents

#### **🔴 Step 4: Document Agent Assignment** *(Agent Chain Completion)*
- **Purpose**: Creates **specialized document agents** that integrate into the agent chain system for document-specific processing

##### **Agent Chain Architecture**:
```typescript
// Based on PROJECT_OUTLINE_AUTO.md Agent Chain System
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

##### **Document Processing Flow**:
```
Document Input
     ↓
[🧠 Head Agent] - Analyzes document type and delegates
     ↓
[📄 Specialized Document Agent] - NDA, Contract, etc.
     ↓
[✍️ Synthesis Agent] - Combines outputs
     ↓
Final Report 
```

##### **How Document Agents Work**:
1. **Agent Chain Integration**: Document agents become part of the processing chain
   - Head Agent receives document and determines type
   - Delegates to appropriate specialized agent (NDA Agent, Contract Agent, etc.)
   - Synthesis Agent combines all outputs into final result

2. **Dynamic Agent Injection (Doc+)**:
   ```typescript
   interface DocPlusAgent {
     insertionPoint: number;  // Where in chain to insert
     condition: (doc: Document) => boolean;  // When to activate
     agent: Agent;  // The specialized agent to inject
   }
   ```

3. **Paralegal+ User Experience**:
   - Users see simple document type dropdowns
   - Behind the scenes: Complex agent chain orchestration
   - No technical complexity exposed to end users

##### **Security & Validation**:
- **Agent Chain Validation**: Prevents circular dependencies and ensures logical flow
- **Data Scoping**: Each document agent only accesses its specific document type data
- **Audit Logging**: All agent interactions tracked for compliance
- **Error Handling**: Robust retry mechanisms for agent execution failures

#### **🟢 Admin Preview** *(Final FirmSync Portal Assembly)*
- **Purpose**: Shows the complete, assembled FirmSync portal with all integrations, agents, and branding applied
- **Portal Structure**: Simple 7-tab layout - Dashboard, Clients, Cases, Calendar, Paralegal+, Billing, Settings

##### **Cohesive Integration System**:
```
Step 2 Selections → Step 3 Agents → Portal Tabs with Embedded Tools

Examples:
- QuickBooks selected → Billing Agent configured → Billing tab shows embedded QuickBooks
- CRM selected → Clients Agent configured → Clients tab shows embedded CRM  
- Calendar integration → Calendar Agent configured → Calendar tab shows embedded scheduling
- Paralegal+ tab → Always shows 4 text-box agents (Doc Gen, Research, etc.)
```

##### **Fallback Logic** (Complete Coverage):
- **No QuickBooks?** → Use FirmSync billing system with document upload via agents
- **No CRM?** → Use built-in client management with agent-assisted data entry
- **No Calendar?** → Use FirmSync scheduling with deadline tracking
- **Document Upload**: Agents automatically categorize and assign uploads to appropriate database systems

##### **What Admin Sees in Preview**:
- Final portal with firm branding (logo, colors)
- All selected integrations embedded in their respective tabs
- Fallback FirmSync tools for unselected integrations
- Complete workflow ready for firm users
- OpenAI usage analytics in Settings tab 

## 🏗️ FirmSync Portal Structure

### **Simple 7-Tab Layout** *(What Firms Get After Onboarding)*

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: [Firm Logo] FirmSync Legal | Search | User Menu     │
├─────────────────────────────────────────────────────────────┤
│ TAB NAVIGATION:                                             │
│ Dashboard | Clients | Cases | Calendar | Paralegal+ | Billing | Settings │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT: Integration-aware with fallback systems      │
└─────────────────────────────────────────────────────────────┘
```

### **Integration-First Design with Fallback**

| Portal Tab | With Integration | Without Integration (Fallback) |
|------------|------------------|--------------------------------|
| **Clients** | Embedded CRM (Salesforce, etc.) | FirmSync client management + agent assistance |
| **Cases** | Case management integration | Built-in case tracking + agent categorization |
| **Calendar** | Google/Outlook calendar | FirmSync scheduling + deadline agents |
| **Billing** | Embedded QuickBooks/billing | FirmSync billing + document upload agents |
| **Paralegal+** | Always shows 4 text-box agents | Doc Gen, Research, Case Analysis, Document Review |
| **Settings** | Firm profile + integration status | Firm profile + OpenAI usage analytics |

### **Agent-Integration Harmony**
- **Step 2** (Integrations) determines what tools embed in each tab
- **Step 3** (Agents) configures AI assistance for each workflow area  
- **Step 4** (Document Agents) adds specialized processing for each document type
- **Result**: Seamless workflow where agents assist with both integrated tools and fallback systems

### **⚡️ Onboarding Code System**

**Think of it as a workspace session token**—generated after Step 1, it tracks exactly where each firm's onboarding stands. Critical for managing multiple firms in parallel without confusion.

```typescript
// Example: Admin resumes onboarding for firm XYZ
onboardingCode: "FIRM-XYZ-2025-ABC123"
// Loads: Firm data, current step, configured integrations, AI agents
```

##### **Context-Aware Navigation System**

The admin interface dynamically changes behavior based on onboarding context:

| Nav Item | Without Code (Platform Mode) | With Code (Onboarding Mode) |
|----------|------------------------------|------------------------------|
| **Home** | Platform metrics dashboard | Onboarding progress tracker |
| **Firms** | List all firms, create new | Step 1: Configure firm details |
| **Integrations** | Manage marketplace | Step 2: Select firm integrations |
| **LLM** | Template management | Step 3: Generate AI agents |
| **Doc+** | Document type library | Step 4: Map agents to documents |
| **VR** | View FirmSync template | Preview configured firm |

This dual-mode navigation ensures admins can vie platform layout while seamlessly switching to firm-specific onboarding contexts.

## 🏗️ Architecture & Design Decisions

### **Why Multi-Tenant From Day One?**

Most SaaS platforms start single-tenant and retrofit multi-tenancy later—a painful, expensive migration. We chose the harder path upfront because:

- **Data Isolation**: Every query filtered by `firmId` prevents data leakage
- **Role Boundaries**: Admin, Owner, and Firm roles have clear separation in code
- **Scaling Vision**: When MedSync, EduSync, HRSYNC become real, the foundation exists
- **Honest Growth**: Forces us to think about 100+ firms when we have none today

```typescript
Frontend:
- React 18 + TypeScript + Vite (fast dev experience)
- Tailwind CSS + shadcn/ui (consistent, customizable components)
- TanStack Query (server state management)
- Wouter (lightweight client-side routing)

Backend:
- Node.js + Express + TypeScript (familiar, productive)
- Drizzle ORM + PostgreSQL (type-safe queries, Neon serverless)
- Dual Authentication (session-based web + JWT API)
- Multi-tenant schema design

AI Integration:
- OpenAI API (Admin's key during onboarding)
- Document type detection and prompt assembly
- Firm-specific agent generation
```




-- Every table includes firmId for complete tenant isolation
-- Foreign keys maintain referential integrity across tenants
-- Optimized indexes for performance at scale
-- Comprehensive audit logging for compliance

Core Tables:
├── firms (tenant boundaries)
├── users (role-based access)
├── documents (isolated by firmId)
├── integrations (marketplace + firm selections)
├── llm_agents (auto-generated per firm)
└── audit_logs (security compliance)
```

## 🚀 Quick Start *(The Real Setup)*

### **Prerequisites**
- Node.js ≥ 20.0.0
- PostgreSQL 14+ (or Neon account)
- OpenAI API key (for Admin onboarding automation)

### **Installation**

```bash
# Clone and install
git clone https://github.com/moosees23/Firmsync.git
cd Firmsync
npm install

# Environment setup
cp .env.example .env
# Edit .env with:
# DATABASE_URL, OPENAI_API_KEY, SESSION_SECRET, JWT_SECRET, PLATFORM_ADMIN_KEY, OWNER_MASTER_KEY, etc.

# Database setup
npm run db:push
npm run seed # optional

# Start development
npm run dev
```

**Access Points:**
- 🌐 **Frontend**: http://localhost:5000
- 🔧 **Backend API**: http://localhost:5001

### **Production Deployment**
```bash
npm run build
npm run start
```

## 📁 Project Structure *(AI-Copilot Reality)*

```
bridgelayer-platform/
├── client/       # React frontend
├── server/       # Express backend
├── shared/       # Types and prompt templates
├── firms/        # Firm-specific storage
├── verticals/    # FirmSync (active), MedSync, EduSync, HRSYNC (planned)
├── migrations/   # DB migrations
└── scripts/      # Utilities
```

**Note**: The `/verticals/` structure exists to force multi-vertical thinking in the codebase, even though only FirmSync is active. This architectural decision prevents single-tenant design patterns.

## 🔧 Available Scripts

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run dev` | Development server with hot reload | Daily development |
| `npm run build` | Production build | Before deployment |
| `npm run start` | Production server | Live deployment |
| `npm run db:push` | Push schema to database | After schema changes |
| `npm run seed` | Populate sample data | Initial setup, testing |
| `npm run check` | TypeScript validation | Before commits |

## 🔐 Authentication & Multi-Tenancy

### **Dual Authentication Design**

```typescript
// Web routes (dashboard, admin): Session-based
// API routes (/api/*): JWT-based
// Single login creates both authentication methods
```

**Why dual auth?** Sessions work better for web interfaces (automatic cookie handling), while JWTs work better for API calls (stateless, mobile-friendly). Single login creates both, unified user experience.

### **Multi-Tenant Data Isolation**

```sql
-- Every query automatically filtered by firmId
SELECT * FROM documents WHERE firmId = ? AND userId = ?;

-- Prevents data leakage between firms
-- Enables scaling to 100+ firms without architecture changes
-- Forces good design patterns early
```

### **Role-Based Access Matrix**

| Permission | Admin | Owner | Firm User |
|------------|-------|-------|-----------|
| Onboard Firms | ✅ | ❌ | ❌ |
| View Multi-Vertical UI | ✅ | ✅ | ❌ |
| Manage Integrations | ✅ | ❌ | ❌ |
| Process Documents | ❌ | ❌ | ✅ |
| Configure AI Agents | ✅ | ❌ | ❌ |

## 🤖 AI Integration Reality

### **Current FirmSync Document Types**

**Legal Document Processing** (AI-powered analysis):
- 📋 Non-Disclosure Agreements (NDAs)
- 👥 Employment Contracts
- 🏠 Lease Agreements  
- ⚖️ Settlement Agreements
- 📄 General Contracts
- 🔍 Discovery Documents
- ⚖️ Litigation Documents

### **AI Workflow Architecture**

```typescript
// Onboarding: Admin's OpenAI key auto-generates firm-specific agent prompts
Step 3: Firm Data → AI Prompt Assembly → Agent Chain Configuration

// Production: Firm's OpenAI key powers actual document processing
Document Upload → Head Agent Analysis → Specialized Agents → Synthesis → Review
```

**Dual-Key System Benefits**:
- **Cost Separation**: Platform pays for onboarding setup, firms pay for usage
- **Security**: Firm keys encrypted at rest with AES-256-GCM
- **Scalability**: Admin can onboard firms without requiring immediate OpenAI accounts
- **Quality Control**: Admin-generated prompts ensure consistent, high-quality agent behavior

## � Why This Design? (Honest Assessment)

### **What We Got Right**

- **Multi-Tenant From Day One**: Every database query includes `firmId`. Painful now, but prevents expensive migrations later.
- **Role Separation**: Admin does complex configuration so firms get simple, working systems.
- **AI Integration Strategy**: Admin's API key during onboarding means firms get pre-configured AI without technical barriers.
- **Vertical Vision**: UI shows inactive verticals to force scalable architecture decisions early.

### **What's Messy (And Why)**

- **AI-Copilot Scaffolding**: Code generation created inconsistent patterns. Real projects have this messiness.
- **Complex Onboarding**: 4-step process reflects real-world complexity of configuring business systems.
- **Future Vertical Placeholders**: Intentionally "fake" UI elements that represent architectural vision over current functionality.

### **Alternative Thinking**

**Most SaaS platforms hide complexity from admins.** We expose it because:
1. **Admin expertise scales better** than user training
2. **Complex onboarding enables simple usage**
3. **Configuration front-loading prevents per-firm customization requests**

**Most platforms start single-tenant.** We chose multi-tenant because:
1. **Retrofit costs are exponentially higher** than upfront complexity
2. **Architectural decisions compound** - single-tenant thinking creates single-tenant code
3. **Vision-driven development** forces better patterns even when serving few customers

## 📊 Database Schema Philosophy

```sql
-- Multi-tenant core principle: Every table filtered by firmId
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  firmId UUID NOT NULL REFERENCES firms(id),
  content TEXT,
  -- Never query without firmId filter
  INDEX idx_firm_documents (firmId, created_at)
);

-- Role boundaries enforced at schema level
CREATE TABLE users (
  id UUID PRIMARY KEY,
  firmId UUID REFERENCES firms(id), -- NULL for Admin/Owner roles
  role user_role_enum NOT NULL,
  -- Admin: firmId = NULL, can access all firms
  -- Firm Users: firmId = specific firm, isolated access
);
```

### **Why This Schema Design?**

- **Isolation by Design**: Data leakage impossible at query level
- **Performance at Scale**: Proper indexes for multi-tenant queries
- **Role Enforcement**: Database constraints prevent privilege escalation
- **Audit Ready**: Every operation logged with firm and user context

## 🔧 API Reference

### **Authentication Endpoints**
```typescript
POST /api/auth/login          # Unified login (creates session + JWT)
POST /api/auth/logout         # Logout from both session and JWT
POST /api/auth/refresh        # Refresh JWT tokens
GET  /api/auth/session        # Validate current session
```

### **Admin Onboarding API**
```typescript
POST /api/admin/firms                    # Create new firm (Step 1)
PUT  /api/admin/firms/:code             # Update firm via onboarding code
GET  /api/admin/firms/:code/integrations # Get available integrations (Step 2)
POST /api/admin/firms/:code/agents      # Generate AI agents (Step 3)
PUT  /api/admin/firms/:code/documents   # Configure doc+agent mapping (Step 4)
GET  /api/admin/firms/:code/preview     # Preview configured firm portal
```

### **Firm Operations**
```typescript
GET    /api/firms/:id/documents         # List firm documents
POST   /api/firms/:id/documents/upload  # Upload document
GET    /api/documents/:id               # Get document details
PUT    /api/documents/:id/review        # Update review status
DELETE /api/documents/:id               # Delete document
```

### **Multi-Tenant Pattern**
```typescript
// Every API call automatically filtered by user's firmId
// Admin role can access cross-firm data
// Firm users restricted to their firm's data only
```

### 📂 Project Structure
- `/` - Root directory containing active, current files
- `/legacy` - Historical reference materials, past audits, and development artifacts


## � Final Thoughts

**BridgeLayer/FirmSync** is proof that you can build scalable, multi-tenant SaaS architecture from day one—even with AI-assisted development. The code is messy, the vision is ambitious, and the current focus is narrow (legal only), but the foundation is solid.

**For developers**: Study the multi-tenant patterns, role-based access design, and onboarding workflows. These patterns apply to any B2B SaaS platform.

**For entrepreneurs**: This demonstrates how to build for scale before you have scale—multi-tenant architecture, role separation, and AI integration that works for 1 firm or 1,000 firms.

**For legal professionals**: FirmSync is ready for production use. The onboarding process is comprehensive, the AI document analysis is functional, and the multi-tenant isolation ensures your data security.

---

**Built with AI assistance, human vision, and honest acknowledgment of both the mess and the potential.**

**Last Updated**: June 29, 2025  
**Version**: 1.0.0  
**Status**: FirmSync Production Ready, Multi-Vertical Framework Complete  
**Maintainer**: Avi (Owner/Admin) with GitHub Copilot
