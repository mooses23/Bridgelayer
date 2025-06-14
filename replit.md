# FIRMSYNC - AI Legal Document Analysis Platform

## Overview

FIRMSYNC is a comprehensive AI-powered legal document analysis platform built as a full-stack web application. The system enables paralegals and legal professionals to upload, analyze, and extract insights from legal documents using OpenAI's GPT-4o model. The platform features modular analysis capabilities including document summarization, risk analysis, clause extraction, cross-reference checking, and formatting analysis.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds
- **Styling**: Custom legal-themed color palette with responsive design

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **File Handling**: Multer middleware for document uploads (PDF, DOC, DOCX, TXT)
- **AI Integration**: OpenAI API for document analysis using GPT-4o model

### Database & ORM
- **Database**: PostgreSQL (fully integrated and active)
- **ORM**: Drizzle ORM with Neon Database serverless driver
- **Schema**: Complete tables for users, documents, analyses, and feature toggles
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Storage**: DatabaseStorage class replaces MemStorage for production persistence

## Key Components

### Document Processing Pipeline
1. **Upload Service**: Handles file uploads with MIME type validation and size limits (10MB)
2. **Content Extraction**: Extracts text content from various document formats
3. **Dynamic Prompt Assembly**: Assembles document-specific AI prompts based on type and risk level
4. **AI Analysis Engine**: Processes documents through configurable analysis modules
5. **Result Storage**: Stores analysis results in structured JSON format with database persistence

### Analysis Modules
- **Document Summarization**: Extracts key terms, parties, and document purpose
- **Risk Analysis**: Identifies potential legal risks with severity levels
- **Clause Extraction**: Detects standard legal clauses and identifies missing ones
- **Cross-Reference Validation**: Verifies internal document references
- **Formatting Analysis**: Checks document structure and compliance

### Feature Management System
- User-configurable analysis features via toggles
- Granular control over which analyses run per user
- Real-time feature updates without document re-upload

## Data Flow

1. **Document Upload**: User uploads document via drag-and-drop or file picker
2. **Content Processing**: Server extracts text content and stores document metadata
3. **AI Analysis**: Multiple analysis modules process document based on enabled features
4. **Result Aggregation**: Analysis results stored with confidence scores and timestamps
5. **Frontend Display**: React components render analysis results with interactive UI

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for document analysis
- **API Key Management**: Environment variable configuration

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Production bundling for server code
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development workflow
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Database**: PostgreSQL module in Replit environment

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Process Management**: Single Node.js process serves both API and static files

### Environment Configuration
- Database URL via `DATABASE_URL` environment variable
- OpenAI API key via `OPENAI_API_KEY` environment variable
- Production/development mode switching via `NODE_ENV`

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 14, 2025**: High-Trust Mega-Prompt Library Implementation Complete
  - Built comprehensive library of document-specific mega-prompts with complete analysis protocols
  - Created 6 high-trust mega-prompts: NDA, Lease, Employment, Settlement, Discovery, and General Contract
  - Integrated Trust Layer protocols, Risk Profile Balancer, and document-specific requirements into cohesive prompts
  - Implemented mega-prompt loader system with fallback to modular assembly
  - Enhanced AI agent to prioritize mega-prompts for comprehensive document analysis
  - Established professional escalation criteria and attorney review requirements for each document type
  - Applied risk-appropriate analysis tone: low-risk (NDA, Contract), medium-risk (Lease, Employment), high-risk (Settlement, Discovery)
  - Successfully deployed complete high-trust legal document analysis system

- **June 14, 2025**: Enhanced AI analysis system with Trust Layer and Risk Profile Balancer
  - Implemented evidence-based analysis with specific section citations
  - Added risk-appropriate analysis tone (low/medium/high-risk documents)
  - Enhanced all AI prompts with professional, measured language requirements
  - Added uncertainty tracking and attorney review flagging
  - Updated analysis interfaces with confidence levels and escalation flags
  - Enhanced frontend components to display trust layer features

- **June 14, 2025**: Database Integration Complete
  - Migrated from MemStorage to DatabaseStorage with PostgreSQL
  - Implemented full Drizzle ORM integration with Neon Database
  - Created database schema with users, documents, analyses, and features tables
  - Successfully tested document upload and AI analysis with database persistence
  - All data now stored persistently in PostgreSQL for production reliability

- **June 14, 2025**: Dynamic Prompt Assembly System Implementation
  - Created modular prompt management system with document-type specific configurations
  - Implemented Trust Layer protocols with transparent reasoning requirements
  - Added Risk Profile Balancer with automatic tone adjustment based on document risk
  - Created configurable analysis modules (summarize, risk, clauses, crossref, formatting)
  - Established document type detection and risk level assessment
  - Enhanced AI analysis with evidence-based reasoning and attorney review flagging

- **June 14, 2025**: Enhanced Analysis Modules Complete
  - Implemented professional ⚠️ [Issue Type] format for legal risk identification
  - Added focused scanning for critical clauses: indemnity, liability, termination, payment, jurisdiction
  - Enhanced Clause Extraction with 🧠 Suggested Draft Language format for AI-generated content
  - Updated Cross-Reference Check to verify internal references and defined term consistency
  - Enhanced Formatting Fixes to focus on structure-only changes while preserving content
  - Integrated evidence-based assessment across all modules with measured professional language

## Trust Layer & Risk Assessment Features

### Trust Layer Principles
- Evidence-based analysis with specific clause citations
- Measured professional language ("Consider revising..." vs "This is wrong")
- Clear uncertainty flagging for attorney review
- AI-generated content clearly marked with review requirements
- No legal advice - paralegal-level assistance only

### Risk Profile Balancer
- **Low-Risk Documents**: Light review focusing on clarity and standard clauses
- **Medium-Risk Documents**: Balanced analysis prioritizing enforceability
- **High-Risk Documents**: Heightened scrutiny with conservative suggestions
- Automatic escalation flags for high-risk items requiring immediate attorney review

### Enhanced Analysis Components
- Document summarization with uncertainty tracking
- Risk analysis with document categorization and escalation flags
- Clause extraction with confidence levels and AI-generated draft marking
- Cross-reference verification with evidence-based issue identification
- Formatting analysis with improvement suggestions and style guide clarification needs

## Changelog

- June 14, 2025: Initial setup
- June 14, 2025: Trust Layer Enhancer and Risk Profile Balancer implementation