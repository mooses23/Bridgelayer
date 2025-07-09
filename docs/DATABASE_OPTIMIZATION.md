# Database Optimization Strategy

## Current Schema Analysis

### Core Tables
- `firm_users` - User accounts linked to firms
- `admin_ghost_sessions` - Admin impersonation sessions
- `ai_triage_results` - AI processing results
- `audit_logs` - System audit trail
- `available_integrations` - Integration configurations

### Existing Indexes
- `idx_onboarding_codes_code` on `onboardingCodes(code)`
- Primary key indexes on all tables
- Unique constraint on `admin_ghost_sessions(session_token)`

## Optimization Plan

### 1. Index Optimizations

#### High-Priority Indexes to Add
1. Firm-based queries:
   ```sql
   CREATE INDEX idx_audit_logs_firm_timestamp ON audit_logs(firm_id, timestamp DESC);
   CREATE INDEX idx_ai_triage_firm_created ON ai_triage_results(firm_id, created_at DESC);
   ```

2. User lookup optimizations:
   ```sql
   CREATE INDEX idx_firm_users_email_firm ON firm_users(email, firm_id);
   CREATE INDEX idx_firm_users_firm_role ON firm_users(firm_id, role);
   ```

3. Session management:
   ```sql
   CREATE INDEX idx_ghost_sessions_active_firm ON admin_ghost_sessions(is_active, target_firm_id) WHERE is_active = true;
   ```

### 2. Query Optimizations

1. Add result limiting to paginate large result sets
2. Use materialized views for complex, frequently-accessed reports
3. Implement database-level soft deletes with filtered indexes
4. Add query result caching for read-heavy operations

### 3. Table Partitioning Strategy

Consider partitioning for:
- `audit_logs` - By time range
- `ai_triage_results` - By firm_id

### 4. Maintenance Tasks

1. Regular VACUUM and ANALYZE operations
2. Index usage monitoring
3. Query performance tracking
4. Data archival strategy

## Implementation Phases

1. Create new indexes
2. Update queries to use new indexes
3. Implement query result caching
4. Set up maintenance tasks
5. Monitor and tune performance

## Performance Metrics

Track key metrics:
- Query execution time
- Index hit rates
- Cache hit rates
- Table and index sizes
- Query plan changes
