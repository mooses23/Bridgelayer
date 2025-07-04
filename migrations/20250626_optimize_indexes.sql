-- Up: Add performance optimization indexes

-- Firm-based query optimization
CREATE INDEX IF NOT EXISTS idx_audit_logs_firm_timestamp 
ON audit_logs(firm_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ai_triage_firm_created 
ON ai_triage_results(firm_id, created_at DESC);

-- User lookup optimization
CREATE INDEX IF NOT EXISTS idx_firm_users_email_firm 
ON firm_users(email, firm_id);

CREATE INDEX IF NOT EXISTS idx_firm_users_firm_role 
ON firm_users(firm_id, role);

-- Active session lookup optimization
CREATE INDEX IF NOT EXISTS idx_ghost_sessions_active_firm 
ON admin_ghost_sessions(is_active, target_firm_id) 
WHERE is_active = true;

-- Down: Remove optimization indexes
-- DROP INDEX IF EXISTS idx_audit_logs_firm_timestamp;
-- DROP INDEX IF EXISTS idx_ai_triage_firm_created;
-- DROP INDEX IF EXISTS idx_firm_users_email_firm;
-- DROP INDEX IF EXISTS idx_firm_users_firm_role;
-- DROP INDEX IF EXISTS idx_ghost_sessions_active_firm;
