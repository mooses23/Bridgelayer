# FIRMSYNC Hybrid Authentication Architecture
**Date**: June 18, 2025  
**Phase**: 1.2 - Clear Separation Strategy Design  
**Status**: DESIGN COMPLETE - Ready for Implementation

## Architecture Overview

The hybrid authentication system implements clear boundaries between web application routes (session-based) and API routes (JWT-based) while maintaining unified user experience and security.

## System Boundaries

### Web Application Domain
**Routes**: `/login`, `/dashboard`, `/admin`, `/onboarding`, `/client`
**Authentication**: PostgreSQL sessions with express-session
**Middleware**: Enhanced session validation
**Security**: HttpOnly session cookies, CSRF protection

### API Domain  
**Routes**: `/api/*` (excluding `/api/auth/*`)
**Authentication**: JWT tokens with automatic refresh
**Middleware**: JWT validation and role-based access
**Security**: HttpOnly JWT cookies, token rotation

### Authentication Boundary
**Routes**: `/api/auth/*`
**Authentication**: Dual-response endpoints
**Middleware**: Hybrid authentication creation
**Security**: Creates both session and JWT simultaneously

## Implementation Architecture

### Backend Structure

```
server/auth/
├── strategy-router.ts          # Route-based authentication selection
├── session-auth.ts             # Web application session management
├── jwt-auth.ts                 # API JWT authentication
├── hybrid-controller.ts        # Dual-response authentication endpoints
├── middleware/
│   ├── session-middleware.ts   # Session validation for web routes
│   ├── jwt-middleware.ts       # JWT validation for API routes
│   └── strategy-middleware.ts  # Authentication strategy selection
└── types/
    ├── session-types.ts        # Session authentication types
    ├── jwt-types.ts           # JWT authentication types
    └── hybrid-types.ts        # Shared authentication types
```

### Frontend Structure

```
client/src/contexts/
├── WebSessionContext.tsx       # Web application session management
├── APIAuthContext.tsx          # API authentication with JWT
└── AuthenticationProvider.tsx  # Unified authentication provider

client/src/hooks/
├── useWebAuth.ts              # Web session authentication
├── useAPIAuth.ts              # API JWT authentication
├── useHybridAuth.ts           # Unified authentication interface
└── useAuthenticatedAPI.ts     # JWT-authenticated API calls
```

## Authentication Flow Design

### Login Process (Hybrid)
1. User submits credentials to POST `/api/auth/login`
2. Backend validates credentials against database
3. Creates PostgreSQL session for web navigation
4. Generates JWT access/refresh tokens for API calls
5. Sets both session cookie AND JWT cookies
6. Returns user data, redirectPath, and authentication status
7. Frontend updates both web session state and API auth state

### Web Navigation (Session-Based)
1. User navigates to web routes (`/dashboard`, `/admin`)
2. Strategy router selects session authentication
3. Session middleware validates req.session.userId
4. Retrieves user data from database using session
5. Attaches user to req.user for route handlers
6. Page renders with authenticated user context

### API Calls (JWT-Based)
1. Frontend makes API call to `/api/documents`
2. Strategy router selects JWT authentication  
3. JWT middleware validates req.cookies.accessToken
4. Verifies JWT signature and expiration
5. Retrieves user data from JWT payload
6. Attaches user to req.user for API handlers
7. Returns API response with proper authentication

### Token Refresh (JWT-Only)
1. API call receives 401 Unauthorized response
2. Frontend automatically calls POST `/api/auth/refresh`
3. Backend validates refresh token from cookies
4. Generates new access token with updated expiration
5. Sets new access token cookie
6. Frontend retries original API call
7. API call succeeds with new authentication

### Logout Process (Dual)
1. User initiates logout from frontend
2. Frontend calls POST `/api/auth/logout`
3. Backend destroys PostgreSQL session
4. Clears both session and JWT cookies
5. Optionally blacklists JWT tokens for security
6. Frontend clears both session and API authentication state
7. Redirects to login page

## Security Model

### Session Security (Web Routes)
- PostgreSQL session store prevents data loss on restart
- Session cookies with HttpOnly, SameSite=Lax configuration
- Session expiration and cleanup policies
- CSRF protection for state-changing operations
- Session regeneration on privilege escalation

### JWT Security (API Routes)
- Short-lived access tokens (2 hours)
- Long-lived refresh tokens (7 days) with rotation
- HttpOnly cookies prevent XSS attacks
- Token blacklisting for immediate revocation
- Automatic token refresh with seamless user experience

### Multi-Tenant Security
- Session isolation by firmId in database
- JWT payload includes firmId for tenant validation
- Middleware enforces tenant access boundaries
- Admin users can access multiple tenants securely
- Audit logging for cross-tenant access

## Database Schema Integration

### Session Management
```sql
-- Uses existing connect-pg-simple session table
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);
```

### JWT Token Management
```sql
-- Optional JWT blacklist for enhanced security
CREATE TABLE jwt_blacklist (
  id SERIAL PRIMARY KEY,
  jti UUID NOT NULL UNIQUE,  -- JWT ID claim
  user_id INTEGER REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);
```

### Authentication Audit Log
```sql
-- Enhanced audit logging for authentication events
ALTER TABLE audit_logs ADD COLUMN auth_method VARCHAR(20);
ALTER TABLE audit_logs ADD COLUMN session_id VARCHAR(128);
ALTER TABLE audit_logs ADD COLUMN jwt_jti UUID;
```

## Error Handling Strategy

### Authentication Failures
- **Session Invalid**: Redirect to login page with clear message
- **JWT Expired**: Automatic refresh attempt, fallback to login
- **Refresh Failed**: Clear all authentication state, redirect to login
- **Cross-Tenant Access**: 403 Forbidden with audit log entry
- **Rate Limiting**: Temporary lockout with retry-after headers

### Edge Cases
- **Concurrent Logins**: Allow multiple sessions with last-login tracking
- **Session + JWT Mismatch**: Prioritize session for web, JWT for API
- **Database Connectivity**: Graceful degradation with cached authentication
- **Token Hijacking**: Immediate blacklisting with security alert
- **Mixed Authentication**: Clear separation prevents conflicts

## Performance Considerations

### Session Performance
- Database connection pooling for session queries
- Session data caching for frequently accessed users
- Lazy loading of user details in session validation
- Session cleanup scheduling for expired sessions

### JWT Performance
- JWT signing with optimized algorithms (RS256/ES256)
- Token payload optimization to minimize size
- Refresh token rotation to balance security and performance
- API response caching with authentication context

### Hybrid Performance
- Authentication strategy caching to reduce route analysis
- Parallel session and JWT validation where beneficial
- Database query optimization for user lookups
- Monitoring and alerting for authentication performance

## Testing Strategy

### Unit Tests
- Authentication middleware validation
- JWT token generation and verification
- Session creation and validation
- Strategy router decision logic
- Error handling for all failure modes

### Integration Tests
- Complete login/logout flows
- Session persistence across requests
- JWT refresh token rotation
- Cross-domain authentication
- Multi-tenant access control

### Security Tests
- Authentication bypass attempts
- Token manipulation and forgery
- Session hijacking protection
- CSRF attack prevention
- Rate limiting effectiveness

### Performance Tests
- Authentication latency under load
- Session database performance
- JWT processing efficiency
- Concurrent authentication requests
- Memory usage optimization

## Deployment Configuration

### Environment Variables
```env
# Session Configuration
SESSION_SECRET=your-session-secret-here
SESSION_MAX_AGE=86400000  # 24 hours

# JWT Configuration  
JWT_SECRET=your-jwt-secret-here
JWT_ACCESS_EXPIRES=2h
JWT_REFRESH_EXPIRES=7d

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_TABLE_NAME=session

# Security Configuration
ENABLE_JWT_BLACKLIST=true
ENABLE_AUDIT_LOGGING=true
CORS_ORIGIN=https://your-domain.com
```

### Production Checklist
- [ ] Secure secrets management for JWT and session keys
- [ ] HTTPS enforcement for all authentication endpoints
- [ ] Proper CORS configuration for cross-origin requests
- [ ] Database backup strategy for session data
- [ ] Monitoring and alerting for authentication failures
- [ ] Security incident response procedures
- [ ] Performance baseline and scaling thresholds

## Migration Strategy

### Phase 1: Foundation (Current)
- Complete current state analysis
- Design hybrid architecture
- Create implementation roadmap

### Phase 2: Implementation
- Build authentication strategy router
- Implement session and JWT middleware separation
- Create dual-response authentication endpoints
- Update frontend contexts for hybrid authentication

### Phase 3: Integration
- Update all routes to use appropriate authentication
- Implement comprehensive error handling
- Add audit logging and monitoring
- Perform security testing and validation

### Phase 4: Optimization
- Performance tuning and optimization
- Advanced security features
- Monitoring and alerting enhancement
- Documentation and training

This architecture provides a comprehensive foundation for implementing secure, scalable hybrid authentication that meets the needs of legal professionals while supporting modern API integration requirements.