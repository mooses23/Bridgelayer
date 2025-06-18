# Contributing to FIRMSYNC

Thank you for your interest in contributing to FIRMSYNC! This document provides guidelines for contributing to this AI-powered legal document analysis platform.

## Development Setup

### Prerequisites
- Node.js 20.0.0 or higher
- PostgreSQL 14 or higher
- OpenAI API key

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/firmsync.git
   cd firmsync
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration values in `.env`

5. Set up the database:
   ```bash
   npm run db:push
   npm run seed
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
firmsync/
├── client/src/          # React frontend
├── server/              # Express backend
├── shared/              # Shared types and schemas
├── verticals/           # Industry-specific configurations
└── scripts/             # Utility scripts
```

## Code Guidelines

### TypeScript
- Use strict TypeScript configuration
- Define proper types for all functions and components
- Use shared types from `shared/schema.ts`

### Frontend (React)
- Use functional components with hooks
- Implement proper error boundaries
- Use TanStack Query for server state management
- Follow shadcn/ui component patterns

### Backend (Express)
- Keep routes thin - business logic in storage layer
- Use Drizzle ORM for database operations
- Implement proper error handling
- Use Zod for request validation

### Database
- Use Drizzle ORM schema definitions
- Run `npm run db:push` for schema changes
- Never modify database directly - use migrations

## Contribution Process

### 1. Issue Creation
- Check existing issues before creating new ones
- Use issue templates when available
- Provide clear reproduction steps for bugs
- Include system information and error messages

### 2. Development Workflow
- Create a feature branch from `main`:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Make your changes following the code guidelines
- Write tests for new functionality
- Ensure all tests pass:
  ```bash
  npm test
  ```

### 3. Pull Request Process
- Update documentation if needed
- Add yourself to contributors list
- Create a pull request with:
  - Clear title and description
  - Reference to related issues
  - Screenshots for UI changes
  - Test coverage information

### 4. Code Review
- Address reviewer feedback promptly
- Keep discussions focused and constructive
- Update your branch with latest changes from main

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Type checking
npm run type-check

# Lint code
npm run lint
```

### Writing Tests
- Write unit tests for utility functions
- Create integration tests for API endpoints
- Add component tests for complex UI logic
- Mock external services (OpenAI, databases)

## Documentation

### Code Documentation
- Use JSDoc comments for functions
- Document complex business logic
- Include examples for public APIs

### User Documentation
- Update README.md for setup changes
- Document new features in user guides
- Include configuration examples

## Security Considerations

### Sensitive Data
- Never commit API keys or secrets
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security guidelines

### Authentication
- Understand the hybrid auth system
- Test role-based access controls
- Validate tenant isolation

## AI Integration Guidelines

### OpenAI Usage
- Use cost-effective models when appropriate
- Implement proper error handling for API failures
- Test with various document types
- Monitor token usage and costs

### Prompt Engineering
- Document prompt changes thoroughly
- Test prompts across different scenarios
- Maintain backward compatibility
- Consider legal accuracy and professional tone

## Database Contributions

### Schema Changes
- Use Drizzle schema definitions
- Test migrations thoroughly
- Consider data migration requirements
- Document breaking changes

### Performance
- Add indexes for new query patterns
- Monitor query performance
- Use proper connection pooling
- Implement caching where appropriate

## Deployment

### Production Considerations
- Test in staging environment
- Monitor application metrics
- Implement proper logging
- Consider rollback procedures

## Getting Help

### Documentation
- Check existing documentation first
- Review code comments and examples
- Look at similar implementations

### Community
- Create GitHub issues for bugs
- Start discussions for feature proposals
- Join community channels if available

### Maintainers
- Tag maintainers for urgent issues
- Provide complete context in communications
- Be patient with response times

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Project documentation where appropriate

Thank you for contributing to FIRMSYNC!