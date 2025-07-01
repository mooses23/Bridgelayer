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

#### **� Step 1: Firm Setup** *(The Big One)*
- **What**: Collects all core firm data needed to build their portal
- **Complexity**: Broken into sub-sections (Basic Info, Practice Areas, Branding) because it's the heaviest step
- **Output**: Generates **Onboarding Code** (workspace session token for tracking progress)
- **Why Complex**: Real firms have real complexity—practice areas, branding requirements, staff hierarchies

#### **🟣 Step 2: Integrations**
- **Dual Design Purpose**:
  - *With Onboarding Code*: Firm selects from available integrations marketplace
  - *Without Code*: Admin adds new API/Webhook integrations to grow the marketplace
- **Smart Scaling**: Same UI serves both firm selection and Admin marketplace expansion

#### **🟣 Step 3: Prompt Configuration** *(AI-Powered)*
- **The Magic**: Uses Admin's OpenAI API key to auto-generate firm-specific AI agents
- **Input**: All collected firm data from Steps 1 & 2
- **Output**: Pre-configured Head Agent and Subtasks tailored to this firm
- **Why This Matters**: Firms get usable AI out-of-the-box without needing their own API keys or prompt engineering skills

#### **🟣 Step 4: Document + Agent Assignment** *(Doc+)*
- **Purpose**: Maps specific AI agents to specific document types
- **Result**: Firm's internal AI workflow for document analysis is defined
- **Smart Default**: Agents have clear, pre-configured tasks for their document processing

#### **🟢 Admin Preview** *(QA, Not a Formal Step)*
- **Reality Check**: Final review of fully configured FirmSync website template
- **Purpose**: Ensures all firm data, integrations, and agents are correctly assembled before launch

### **⚡️ Onboarding Code System**

**Think of it as a workspace session token**—generated after Step 1, it tracks exactly where each firm's onboarding stands. Critical for managing multiple firms in parallel without confusion.

```typescript
// Example: Admin resumes onboarding for firm XYZ
onboardingCode: "FIRM-XYZ-2025-ABC123"
// Loads: Firm data, current step, configured integrations, AI agents
```

## 🏗️ Architecture & Design Decisions

### **Why Multi-Tenant From Day One?**

Most SaaS platforms start single-tenant and retrofit multi-tenancy later—a painful, expensive migration. We chose the harder path upfront because:

- **Data Isolation**: Every query filtered by `firmId` prevents data leakage
- **Role Boundaries**: Admin, Owner, and Firm roles have clear separation in code
- **Scaling Vision**: When MedSync, EduSync, HRSYNC become real, the foundation exists
- **Honest Growth**: Forces us to think about 100+ firms when we have 5

### **Technology Stack** *(AI-Copilot Scaffolded)*

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

### **Database Design Philosophy**

```sql
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
// Onboarding: Admin's OpenAI key auto-generates firm-specific agents
Step 3: Firm Data → AI Prompt Assembly → Custom Head Agent + Subtasks

// Production: Firm users upload documents
Document Upload → Type Detection → Agent Assignment → AI Analysis → Review
```

**Why Admin's API Key?** Firms get pre-configured AI without needing their own OpenAI accounts or prompt engineering skills. Admin acts as the "AI factory" during onboarding.

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

## 📚 Documentation Policy

- The ONLY authoritative source for architecture and requirements is `PROJECT_OUTLINE_AUTO.md`
- Historical documents, audits, and reference materials are in the `/legacy` folder
- Legacy files contain valuable insights but are NOT implementation requirements
- If you find conflicting information, always defer to `PROJECT_OUTLINE_AUTO.md`
- Future enhancements should follow the patterns in `PROJECT_OUTLINE_AUTO.md`

### 📂 Project Structure
- `/` - Root directory containing active, current files
- `/legacy` - Historical reference materials, past audits, and development artifacts
- Additional directories as outlined in `PROJECT_OUTLINE_AUTO.md`

## 🤝 Contributing

**Contributing**:
- Fork & clone
- `npm install`  
- Create feature branch
- `npm run check` before PR
- Follow TypeScript and ESLint standards
- Write tests for new features

## 📜 License & Status

**License**: MIT - Use it, modify it, scale it commercially

### **Current Status** *(Honest Assessment)*
- ✅ **FirmSync**: Production-ready for legal document processing
- ✅ **Multi-Tenant**: Real data isolation, scales to 100+ firms
- ✅ **Admin Onboarding**: 4-step process generates working firm portals
- ✅ **AI Integration**: Auto-generates firm-specific agents via Admin's API key
- � **Code Quality**: AI-generated, inconsistent, but functional
- � **Other Verticals**: Framework exists, implementation needed

### **Roadmap** *(Vision vs. Reality)*

**2025 Q3-Q4**:
- Clean up AI-generated code inconsistencies
- Implement MedSync (healthcare) vertical
- Enhanced AI document analysis with GPT-4

**2026**:
- EduSync and HRSYNC verticals
- Mobile applications
- Enterprise integrations (DocuSign, QuickBooks)

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
