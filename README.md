# � BridgeLayer Platform

### 👥 **Three-Tier Role Architecture**
- **🔧 Platform Admin**: Cross-platform system administration, **firm onboarding** (via left side nav), ghost mode verification
- **🏗️ Owner (Bridgelayer)**: Multi-tenant operational management (**NO onboarding responsibilities**)
- **🏢 Tenant (Firms)**: Individual firms with isolated vertical-specific accessicense: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opens## 🚀 Platform Quick Start

### **Prerequisites**
- Node.js 20.0.0 or higher
- PostgreSQL 14+ (or Neon account)
- OpenAI API key (for AI document analysis)org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)](https://www.postgresql.org/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)](/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

**BridgeLayer** is a **production-ready multi-vertical authentication and document processing platform** featuring comprehensive multi-tenant architecture, dual authentication systems, and industry-specific document analysis across **legal**, **medical**, **education**, and **HR** verticals.

> **🚀 Status**: Multi-Platform Production Ready | **🔐 Security**: Enterprise Grade | **🏗️ Architecture**: Multi-Vertical Multi-Tenant

## 🌐 Multi-Vertical Platform

### 🏢 **Supported Industry Verticals**
- **FIRMSYNC** (Legal): Document analysis for law firms
- **MEDSYNC** (Medical): Healthcare document processing
- **EDUSYNC** (Education): Educational institution workflows  
- **HRSYNC** (HR): Human resources document management
- **Extensible**: Plugin architecture supports unlimited vertical expansion

### 👥 **Three-Tier Role Architecture**
- **� Platform Admin**: Cross-platform system administration and oversight
- **🏗️ Owner (Bridgelayer)**: Multi-tenant service provider managing client firms
- **🏢 Tenant (Firms)**: Individual firms with isolated vertical-specific access

## ✨ Platform Features

### 🔐 **Dual Authentication System**
- **Web Routes**: Session-based authentication with PostgreSQL session store
- **API Routes**: JWT token authentication with automatic refresh
- **Role-Based Access**: Platform Admin, Owner (Bridgelayer), Tenant boundaries
- **Security Compliance**: OWASP best practices, CORS, rate limiting, audit logging
- **Admin Navigation**: Left side nav with dual workspace onboarding code and integrated ghost mode

### � **Multi-Vertical Architecture**
- **Vertical Plugin System**: Industry-specific configurations and document types
- **Complete Tenant Isolation**: Secure data segregation across all verticals
- **Cross-Vertical Prevention**: No data leakage between industry verticals
- **Scalable Design**: Horizontal scaling ready with vertical-aware infrastructure
- **Dynamic Loading**: Automatic vertical detection and configuration

### 👥 **Advanced Role Management**
- **Platform Admin**: Cross-platform access, **firm onboarding**, ghost mode, system configuration
- **Owner (Bridgelayer)**: Multi-tenant operational management (**NO onboarding capabilities**)
- **Tenant (Firms)**: Isolated firm-scoped access within assigned vertical
- **Permission System**: Granular permissions per role with audit logging
- **Admin Onboarding Flow**: **Admin-exclusive** firm onboarding through left side navigation

### 📄 **Multi-Vertical Document Processing**
- **Industry-Specific Processing**: Vertical-aware document analysis pipelines
- **59+ Document Types**: Legal, medical, educational, and HR document support
- **AI Prompt Assembly**: Industry-specific prompt generation and processing
- **Multi-Format Support**: PDF, DOC, DOCX, TXT across all verticals
- **Vertical-Aware Metadata**: Industry-specific document tracking and analysis

### 🤖 **Multi-Industry AI Integration**
- **Vertical-Specific Prompts**: Industry-tailored AI analysis across all verticals
- **Legal AI**: NDA, Employment, Lease, Settlement, Contract, Discovery, Litigation
- **Medical AI**: Patient records, clinical protocols, insurance claims, compliance
- **Education AI**: Academic documents, student records, institutional workflows
- **HR AI**: Employee documents, policy analysis, compliance tracking

### 🔧 **Modern Technology Stack**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM
- **Database**: PostgreSQL (Neon serverless) with multi-vertical schema
- **Authentication**: Dual session + JWT with role-based boundaries
- **API**: Multi-vertical RESTful design with `/api/vertical/*` endpoints

## 🏗️ Multi-Vertical Production Architecture

### **Frontend Stack**
```typescript
- React 18 with TypeScript and Vite
- UI Framework: Tailwind CSS + shadcn/ui components
- State Management: TanStack Query (React Query)
- Routing: Wouter client-side routing with role-based access
- Authentication: Dual session + JWT contexts
- Multi-Vertical UI: Dynamic theming and configuration per vertical
```

### **Backend Stack**
```typescript
- Node.js + Express.js with TypeScript
- ORM: Drizzle with PostgreSQL (Neon serverless)
- Authentication: Dual session + JWT with role boundaries
- Multi-Vertical APIs: Industry-specific endpoints
- File Processing: Vertical-aware document analysis
- AI Integration: Industry-specific prompt systems
```

### **Database Schema**
```sql
- Multi-vertical, multi-tenant architecture
- Three-tier role management (Platform Admin, Owner, Tenant)
- Vertical-aware document storage and processing
- Session store with role-based persistence
- Comprehensive audit logging across all verticals
```

### **Security Implementation**
```typescript
- Dual Authentication: Session (web) + JWT (API)
- Role-Based Access: Platform, Owner, Tenant boundaries
- Multi-Tenant Isolation: Complete data segregation
- Vertical Security: Industry-specific compliance
- Audit Logging: Role-based action tracking
```

## � Quick Start

### **Prerequisites**
- Node.js 20.0.0 or higher
- PostgreSQL 14+ (or Neon account)
- OpenAI API key

### **Installation**

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/bridgelayer-platform.git
   cd bridgelayer-platform
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   **Configure your `.env` file:**
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   
   # OpenAI Integration (for AI document analysis)
   OPENAI_API_KEY=sk-proj-your_openai_api_key_here
   
   # Platform Authentication Secrets
   SESSION_SECRET=your_session_secret_base64_encoded
   JWT_SECRET=your_jwt_secret_base64_encoded
   PLATFORM_ADMIN_KEY=your_platform_admin_key_base64_encoded
   OWNER_MASTER_KEY=your_owner_master_key_base64_encoded
   
   # JWT Configuration
   JWT_ACCESS_EXPIRES=2h
   JWT_REFRESH_EXPIRES=7d
   
   # Environment
   NODE_ENV=development
   PORT=5001
   
   # Security
   CORS_ORIGIN=http://localhost:5000
   SESSION_MAX_AGE=86400000
   
   # Platform Configuration
   ENABLE_RATE_LIMITING=true
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Database Setup**
   ```bash
   # Push multi-vertical schema to database
   npm run db:push
   
   # Optional: Seed with sample data across all verticals
   npm run seed
   ```

4. **Start Platform Development**
   ```bash
   npm run dev
   ```

   The platform will be available at:
   - **Frontend**: http://localhost:5000
   - **Backend API**: http://localhost:5001
   - **Multi-Vertical Endpoints**: http://localhost:5001/api/vertical/*
   
   🌐 **Application**: http://localhost:5000  
   � **API**: http://localhost:5000/api

### **Production Deployment**
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
firmsync/
├── 📱 client/                    # React frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components (shadcn/ui)
│   │   ├── pages/               # Page components and routing
│   │   ├── contexts/            # React contexts (SessionContext, etc.)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities (API client, error handling)
│   │   └── types/               # TypeScript type definitions
│   └── index.html               # Vite entry point
│
├── 🚀 server/                   # Express backend application
│   ├── auth/                    # Authentication system
│   │   ├── controllers/         # Auth controllers (hybrid, onboarding)
│   │   ├── core/               # Auth managers (admin, JWT)
│   │   ├── middleware/         # Auth middleware (unified, strategy)
│   │   └── types/              # Auth type definitions
│   ├── routes/                  # API route handlers
│   ├── services/               # Business logic services
│   ├── storage/                # Database storage layer
│   ├── types/                  # Server type definitions
│   ├── utils/                  # Server utilities
│   └── index.ts                # Server entry point
│
├── 🔗 shared/                   # Shared code between client/server
│   ├── filetypes/              # Document type configurations
│   ├── prompts/                # AI prompt templates
│   ├── schema/                 # Database schema (Drizzle ORM)
│   ├── types/                  # Shared TypeScript types
│   └── validation.ts           # Shared validation schemas
│
├── 🏢 firms/                   # Firm-specific file storage
│   └── [firmId]/
│       ├── files/              # Uploaded documents
│       └── review_logs/        # Analysis results and metadata
│
├── 🎯 verticals/               # Industry-specific configurations
│   ├── firmsync/              # Legal industry (default)
│   ├── medsync/               # Healthcare industry
│   ├── edusync/               # Education industry
│   └── hrsync/                # Human resources industry
│
├── 📊 migrations/              # Database migration files
├── 🧪 test/                   # Test files and utilities
├── 📋 scripts/                # Utility and deployment scripts
└── 📚 audit-reports/          # System audit documentation
```

## 🔧 Available Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run dev` | Start development server | Development with hot reload |
| `npm run build` | Build for production | Creates optimized production build |
| `npm run start` | Start production server | Runs built application |
| `npm run check` | TypeScript type checking | Validates TypeScript code |
| `npm run db:push` | Push database schema | Updates database with schema changes |
| `npm run test:auth` | Run authentication tests | Validates auth system functionality |

## 🔐 Authentication & Security

### **Hybrid Authentication System**
FIRMSYNC implements a sophisticated hybrid authentication system:

- **Web Routes** (`/dashboard`, `/admin`): PostgreSQL session-based authentication
- **API Routes** (`/api/*`): JWT token-based authentication with automatic refresh
- **Unified Experience**: Single login creates both session and JWT authentication

### **Security Features**
- ✅ **Enterprise-Grade Security**: OWASP best practices implementation
- ✅ **Multi-Tenant Isolation**: Complete data separation between firms
- ✅ **Role-Based Access Control**: 4-tier permission system
- ✅ **Session Management**: PostgreSQL session store with automatic cleanup
- ✅ **Token Security**: HttpOnly cookies with SameSite protection
- ✅ **Rate Limiting**: Configurable request throttling
- ✅ **Audit Logging**: Comprehensive security event tracking
- ✅ **Input Validation**: Request validation and sanitization

### **User Roles & Permissions**
| Role | Description | Permissions |
|------|-------------|-------------|
| **Platform Admin** | System administrator | Full system access, cross-tenant operations |
| **Firm Admin** | Law firm administrator | Firm management, user administration |
| **Paralegal** | Legal document processor | Document upload, review, analysis |
| **Client** | External client access | Document viewing, limited interaction |

## 🤖 AI Document Analysis

### **Supported Document Types**
FIRMSYNC includes specialized AI prompts for:

- **📋 Non-Disclosure Agreements (NDAs)** - Confidentiality and disclosure analysis
- **👥 Employment Contracts** - Terms, conditions, and compliance review
- **🏠 Lease Agreements** - Property lease terms and obligations
- **⚖️ Settlement Agreements** - Settlement terms and enforceability
- **📄 General Contracts** - Standard contract analysis and clause review
- **🔍 Discovery Documents** - Litigation discovery and evidence analysis
- **⚖️ Litigation Documents** - Legal proceeding documentation review

### **AI Analysis Features**
- **Intelligent Prompt Assembly**: Document-type specific analysis protocols
- **Metadata Extraction**: Key terms, parties, dates, and obligations
- **Risk Assessment**: Legal risk identification and severity classification
- **Clause Analysis**: Standard legal clause detection and validation
- **Review Workflow**: Structured review process with reviewer assignment
- **Audit Trail**: Complete analysis history and revision tracking

### **AI Integration Architecture**
```typescript
// Document processing pipeline
Upload → Type Detection → Config Loading → Prompt Assembly → AI Analysis → Review Dashboard
```

## 🏢 Multi-Tenant & Vertical Architecture

### **Industry Verticals**
FIRMSYNC's modular architecture supports multiple industries:

| Vertical | Industry | Status | Focus |
|----------|----------|--------|-------|
| **FIRMSYNC** | Legal Services | ✅ Production | Legal document analysis and compliance |
| **MEDSYNC** | Healthcare | 🔄 Framework Ready | Medical document review with HIPAA compliance |
| **EDUSYNC** | Education | 🔄 Framework Ready | Educational document analysis with accreditation focus |
| **HRSYNC** | Human Resources | 🔄 Framework Ready | HR document review with EEOC compliance |

### **Multi-Tenant Benefits**
- **Complete Data Isolation**: Each firm's data is completely separated
- **Scalable Architecture**: Supports unlimited number of law firms
- **Customizable Branding**: Firm-specific UI and branding options
- **Independent Configuration**: Each firm can configure their own settings
- **Compliance Ready**: Built-in support for legal industry compliance requirements

## 📊 Database Schema

### **Core Tables**
```sql
-- User Management
users, user_roles, user_permissions

-- Firm Management  
firms, firm_configurations, firm_integrations

-- Document Management
documents, document_metadata, document_reviews

-- Authentication
sessions, jwt_tokens, audit_logs

-- AI Integration
document_types, prompt_templates, analysis_results
```

### **Multi-Tenant Design**
- All queries filtered by `firmId` for complete data isolation
- Foreign key relationships maintain referential integrity
- Comprehensive audit logging for compliance requirements
- Optimized indexes for performance at scale

## 🔧 API Documentation

### **Authentication Endpoints**
```typescript
POST /api/auth/login          # User authentication
POST /api/auth/logout         # Session termination
POST /api/auth/refresh        # JWT token refresh
GET  /api/auth/session        # Session validation
```

### **Document Management**
```typescript
GET    /api/documents              # List documents
POST   /api/documents/upload       # Upload document
GET    /api/documents/:id          # Get document details
PUT    /api/documents/:id/review   # Update review status
DELETE /api/documents/:id          # Delete document
```

### **Admin Endpoints**
```typescript
GET  /api/admin/stats         # Platform statistics
GET  /api/admin/firms         # Firm management
GET  /api/admin/users         # User management
GET  /api/admin/audit-logs    # Security audit logs
```

### **Firm Management**
```typescript
GET  /api/firms/:id           # Firm details
PUT  /api/firms/:id           # Update firm
GET  /api/firms/:id/users     # Firm users
POST /api/firms/:id/invite    # Invite user to firm
```

## 🤝 Contributing

We welcome contributions to FIRMSYNC! Please follow these guidelines:

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Set up environment: `cp .env.example .env`
5. Run development server: `npm run dev`

### **Code Standards**
- **TypeScript**: All code must be written in TypeScript
- **Linting**: Code must pass ESLint validation
- **Type Safety**: No `any` types without explicit justification
- **Testing**: Include tests for new features
- **Documentation**: Update documentation for API changes

### **Pull Request Process**
1. Ensure all tests pass: `npm run check`
2. Update documentation as needed
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to your branch: `git push origin feature/amazing-feature`
5. Open a Pull Request with detailed description

### **Security**
- Never commit secrets or API keys
- Follow OWASP security guidelines
- Report security vulnerabilities privately

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **Commercial Use**
FIRMSYNC is available for commercial use under the MIT license. For enterprise support, custom integrations, or professional services, please contact our team.

## 📞 Support & Contact

### **Documentation**
- 📚 **Full Documentation**: Available in `/audit-reports/` directory
- 🛠️ **API Reference**: See API documentation above
- 🔧 **Setup Guide**: Follow Quick Start section
- 🎯 **Architecture**: Review system architecture documentation

### **Community Support**
- 🐛 **Bug Reports**: Create an issue on GitHub
- 💡 **Feature Requests**: Open a GitHub issue with enhancement label
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📖 **Wiki**: Check project wiki for additional resources

### **Professional Support**
- 🏢 **Enterprise Support**: Available for production deployments
- 🎓 **Training**: Professional training and onboarding services
- 🔧 **Custom Development**: Tailored features and integrations
- ☁️ **Managed Hosting**: Fully managed FIRMSYNC deployments

### **Contact Information**
- 📧 **Email**: [Contact via GitHub Issues]
- 🌐 **Website**: [Project Homepage]
- 📱 **Social**: [Follow for updates]

## 🚧 Current Status & Roadmap

### **✅ Production Ready Features**
- Complete authentication and authorization system
- Multi-tenant architecture with firm isolation
- Document upload and processing pipeline
- AI prompt assembly for legal document types
- Admin dashboard and user management
- RESTful API with comprehensive error handling
- Modern React frontend with responsive design

### **🔄 In Development**
- Enhanced AI document analysis with GPT-4 integration
- Advanced client portal with document sharing
- Integration with DocuSign, QuickBooks, and other legal tools
- Mobile application for iOS and Android
- Advanced reporting and analytics dashboard

### **🎯 Future Roadmap**
- **Q3 2025**: Full AI analysis implementation
- **Q4 2025**: Mobile app release
- **Q1 2026**: Enterprise integrations (DocuSign, QuickBooks)
- **Q2 2026**: Advanced analytics and reporting
- **Q3 2026**: Multi-industry vertical expansion

---

## 🏆 Project Status

**FIRMSYNC** is a **production-ready enterprise legal document analysis platform** with comprehensive features for law firms and legal professionals.

> **🚀 Ready for Production** | **🔐 Enterprise Security** | **📈 Scalable Architecture** | **🤖 AI-Powered Analysis**

**Last Updated**: June 28, 2025  
**Version**: 1.0.0  
**Status**: Production Ready  
**Maintainer**: GitHub Copilot (AI Project Manager)

---

**Built with ❤️ for legal professionals seeking modern, secure, and intelligent document analysis solutions.**
