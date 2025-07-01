# Development Setup Guide

## Prerequisites

- Node.js ≥20.0.0
- PostgreSQL 14+
- pnpm or npm
- Git

## Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/firmsync.git
cd firmsync

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Initialize database
pnpm db:setup
pnpm db:seed
```

## Development Server

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Environment Variables

Required variables:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/firmsync
OPENAI_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
```

## IDE Setup

### VS Code
Required extensions:
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense

### Configuration
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Testing

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

## Common Issues

### Database Connection
```bash
# Reset database
pnpm db:reset

# Run migrations
pnpm db:migrate
```

### Dependencies
```bash
# Clear dependencies
rm -rf node_modules
pnpm install
```

## Next Steps

1. Review [SYSTEM_ARCHITECTURE.md](/docs/architecture/SYSTEM_ARCHITECTURE.md)
2. Check current [DEVELOPMENT_PLAN.md](/docs/development/DEVELOPMENT_PLAN.md)
3. Explore feature documentation in `/docs/features/`
