bridgelayer - owner of firmsync,medsync
# FIRMSYNC - AI Legal Document Analysis Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)](https://www.postgresql.org/)

FIRMSYNC is a comprehensive AI-powered legal document analysis platform built as a full-stack web application. The system enables paralegals and legal professionals to upload, analyze, and extract insights from legal documents using OpenAI's GPT-4 model.

## 🚀 Features

### Core Capabilities
- **AI Document Analysis**: Powered by OpenAI GPT-4 with specialized legal prompts
- **Multi-Format Support**: PDF, DOC, DOCX, TXT document processing
- **Trust Layer**: Evidence-based analysis with professional language standards
- **Risk Assessment**: Automatic tone adjustment based on document risk levels
- **Multi-Tenant Architecture**: Complete firm isolation and data security

### Document Analysis Modules
- **Document Summarization**: Key terms, parties, and purpose extraction
- **Risk Analysis**: Legal risk identification with severity levels
- **Clause Extraction**: Standard legal clause detection and missing clause identification
- **Cross-Reference Validation**: Internal document reference verification
- **Formatting Analysis**: Document structure and compliance checking

### Platform Features
- **Role-Based Access Control**: Admin, firm admin, paralegal, and client roles
- **Enterprise Authentication**: Hybrid session + JWT authentication system
- **Integration Framework**: DocuSign, QuickBooks, Google Workspace, Slack, Microsoft 365, Dropbox
- **Comprehensive Onboarding**: 6-step wizard for firm setup
- **Billing & Time Tracking**: Complete legal practice management

## 🏗️ System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query)
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **File Handling**: Multer middleware for document uploads
- **AI Integration**: OpenAI GPT-4 with specialized legal prompts

### Database
- **Database**: PostgreSQL with Drizzle ORM
- **Provider**: Neon Database (serverless PostgreSQL)
- **Schema**: Complete multi-tenant structure with firm isolation
- **Storage**: Production-ready DatabaseStorage class

## 🛠️ Installation

### Prerequisites
- Node.js 20.0.0 or higher
- PostgreSQL 14 or higher
- OpenAI API key

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/firmsync.git
   cd firmsync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/firmsync
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Authentication
   SESSION_SECRET=your_session_secret_here
   JWT_SECRET=your_jwt_secret_here
   
   # Environment
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Seed initial data
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_secure_session_secret
JWT_SECRET=your_secure_jwt_secret
```

## 📁 Project Structure

```
firmsync/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── hooks/         # Custom hooks
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database storage layer
│   ├── auth.ts           # Authentication logic
│   └── services/         # External service integrations
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
├── verticals/           # Industry-specific configurations
│   ├── firmsync/        # Legal industry (default)
│   ├── medsync/         # Healthcare industry
│   ├── edusync/         # Education industry
│   └── hrsync/          # Human resources industry
└── scripts/             # Utility scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run seed` - Seed database with initial data
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🔐 Authentication & Security

FIRMSYNC implements enterprise-grade security:

- **Hybrid Authentication**: Session-based + JWT token system
- **Role-Based Access Control**: Multi-level permission system
- **Multi-Tenant Isolation**: Complete data separation between firms
- **OWASP Compliance**: Security best practices implementation
- **Audit Logging**: Comprehensive activity tracking

## 🤖 AI Integration

### Document Types Supported
- Non-Disclosure Agreements (NDAs)
- Employment Contracts
- Lease Agreements
- Settlement Agreements
- Discovery Documents
- General Contracts
- Litigation Documents
- And 50+ additional legal document types

### AI Analysis Features
- **Mega-Prompt System**: Document-specific comprehensive protocols
- **Trust Layer**: Evidence-based analysis with citations
- **Risk Profile Balancer**: Conservative to aggressive analysis modes
- **Professional Language**: Paralegal-level assistance standards

## 🏢 Multi-Tenant Architecture

FIRMSYNC supports multiple industries through its vertical plugin system:

- **FIRMSYNC**: Legal document analysis (default)
- **MEDSYNC**: Medical document review with HIPAA compliance
- **EDUSYNC**: Educational document analysis with accreditation focus
- **HRSYNC**: HR document review with EEOC compliance

## 📊 Database Schema

The platform includes comprehensive database tables:
- User management and authentication
- Firm profiles and configurations
- Document storage and metadata
- Analysis results and logs
- Integration configurations
- Audit trails and compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the comprehensive audit reports in `/audit-reports`

## 🚧 Development Status

FIRMSYNC is actively developed with regular updates. See `replit.md` for the latest changes and `IMPLEMENTATION_REVIEW.md` for detailed technical specifications.

---

**Built with ❤️ for legal professionals seeking AI-powered document analysis solutions.**
