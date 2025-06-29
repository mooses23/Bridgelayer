# Contributing to BridgeLayer Platform

Welcome to BridgeLayer - a multi-vertical authentication and document processing platform! We appreciate your interest in contributing to our comprehensive platform that supports legal, medical, education, and HR industries.

## 🌐 Platform Overview

BridgeLayer is a sophisticated multi-vertical platform with:

- **Multi-Vertical Architecture**: FIRMSYNC (Legal), MEDSYNC (Medical), EDUSYNC (Education), HRSYNC (HR)
- **Three-Tier Role Model**: Platform Admin → Owner (Bridgelayer) → Tenant (Firms)
- **Dual Authentication**: Session-based web + JWT API
- **Multi-Tenant Isolation**: Complete data segregation across verticals

## 🏗️ Development Architecture

### Role-Based Development
When contributing, understand our three-tier role system:

- **Platform Admin**: Handles firm onboarding via left side nav, system configuration
- **Owner (Bridgelayer)**: Manages operations of onboarded firms (NO onboarding responsibilities)
- **Tenant (Firms)**: Individual firms using vertical-specific services

### Vertical Plugin System
- Each vertical maintains its own document types and AI prompts
- New verticals can be added without core system changes
- Follow the plugin architecture in `/verticals/` directory

## 🔧 Development Setup

### Prerequisites
- Node.js 20.0.0+
- PostgreSQL 14+
- OpenAI API key (for AI document analysis)

### Installation
```bash
git clone https://github.com/your-username/bridgelayer-platform.git
cd bridgelayer-platform
npm install
```

### Environment Setup
Copy `.env.example` to `.env` and configure:
- Database URL
- Authentication secrets (Platform Admin, Owner master keys)
- OpenAI API key

## 📝 Contribution Guidelines

### Code Standards
- TypeScript with strict mode
- ESLint configuration compliance
- Comprehensive error handling
- Role-based security validation

### Testing Requirements
- Unit tests for authentication middleware
- Integration tests for role boundaries
- Multi-vertical scenario testing
- Admin onboarding flow validation

### Documentation
- Update role architecture documentation
- Document vertical-specific features
- Maintain API documentation for multi-vertical endpoints
- Keep audit trails for security features

## 🚀 Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/vertical-name` or `git checkout -b feature/role-enhancement`
3. Follow our coding standards
4. Add comprehensive tests
5. Update documentation
6. Submit pull request with detailed description

## 📊 Multi-Vertical Contributions

### Adding New Verticals
1. Create new directory in `/verticals/[vertical-name]/`
2. Configure industry-specific document types
3. Add AI prompt templates
4. Update platform configuration
5. Add comprehensive tests

### Role-Based Features
- Respect three-tier role boundaries
- Admin-exclusive features (onboarding)
- Owner operational management
- Tenant isolation requirements

## 🔐 Security Guidelines

- Never expose cross-tenant data
- Validate role permissions at every layer
- Audit log all administrative actions
- Secure ghost mode implementations
- Follow OWASP compliance standards

## 📞 Contact

For questions about platform architecture or contribution guidelines, please open an issue or contact the maintainers.

Thank you for contributing to BridgeLayer Platform!