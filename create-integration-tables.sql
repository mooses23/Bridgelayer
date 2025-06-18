-- Create integration tables for firm-level API key management system

-- Platform integrations (managed by platform admins)
CREATE TABLE IF NOT EXISTS platform_integrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  auth_type VARCHAR(50) NOT NULL CHECK (auth_type IN ('API_KEY', 'OAUTH2', 'BASIC_AUTH')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
  version VARCHAR(50),
  settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Firm integrations (firm-level selections with API credentials)
CREATE TABLE IF NOT EXISTS firm_integrations (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  integration_id INTEGER NOT NULL REFERENCES platform_integrations(id) ON DELETE CASCADE,
  enabled_by INTEGER NOT NULL REFERENCES users(id),
  is_enabled BOOLEAN DEFAULT true,
  configuration JSONB,
  api_credentials TEXT, -- Encrypted firm-level API keys/tokens
  webhook_secret VARCHAR(255),
  last_sync_at TIMESTAMP,
  sync_status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(firm_id, integration_id)
);

-- User integration permissions (user-level access control)
CREATE TABLE IF NOT EXISTS user_integration_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  firm_integration_id INTEGER NOT NULL REFERENCES firm_integrations(id) ON DELETE CASCADE,
  granted_by INTEGER NOT NULL REFERENCES users(id),
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_configure BOOLEAN DEFAULT false,
  can_disable BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, firm_integration_id)
);

-- Integration rate limiting (firm-level usage tracking)
CREATE TABLE IF NOT EXISTS integration_rate_limits (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  integration_id INTEGER NOT NULL REFERENCES platform_integrations(id) ON DELETE CASCADE,
  requests_per_hour INTEGER,
  requests_per_day INTEGER,
  current_hourly_usage INTEGER DEFAULT 0,
  current_daily_usage INTEGER DEFAULT 0,
  last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(firm_id, integration_id)
);

-- Integration audit logs (compliance and security tracking)
CREATE TABLE IF NOT EXISTS integration_audit_logs (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  integration_id INTEGER NOT NULL REFERENCES platform_integrations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_integrations_category ON platform_integrations(category);
CREATE INDEX IF NOT EXISTS idx_platform_integrations_status ON platform_integrations(status);
CREATE INDEX IF NOT EXISTS idx_firm_integrations_firm_id ON firm_integrations(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_integrations_status ON firm_integrations(sync_status);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_integration_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_firm_id ON integration_audit_logs(firm_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON integration_audit_logs(created_at);