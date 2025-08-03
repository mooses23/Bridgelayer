-- ITTT and IHO Framework Database Schema Extensions
-- Adds support for automation rules and tenant configuration

-- ITTT Rules table - stores automation rules per tenant
CREATE TABLE IF NOT EXISTS firmsync.ittt_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100) NOT NULL,
    conditions JSONB DEFAULT '[]',
    actions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ITTT Executions table - audit trail of rule executions
CREATE TABLE IF NOT EXISTS firmsync.ittt_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES firmsync.ittt_rules(id) ON DELETE CASCADE,
    trigger_type VARCHAR(100) NOT NULL,
    context_data JSONB DEFAULT '{}',
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    execution_status VARCHAR(50) DEFAULT 'success'
);

-- Tenant Configuration table - stores feature mode settings
CREATE TABLE IF NOT EXISTS firmsync.tenant_config (
    tenant_id VARCHAR(255) PRIMARY KEY,
    feature_mode VARCHAR(50) DEFAULT 'native',
    integration_provider VARCHAR(100),
    config_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Contacts table - tracks all client communication
CREATE TABLE IF NOT EXISTS firmsync.client_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id INTEGER REFERENCES firmsync.clients(id) ON DELETE CASCADE,
    contact_method VARCHAR(50) NOT NULL,
    contact_notes TEXT,
    contacted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table - for automated task creation
CREATE TABLE IF NOT EXISTS firmsync.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(255),
    due_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Activity Logs table - general activity tracking
CREATE TABLE IF NOT EXISTS firmsync.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ittt_rules_trigger_type ON firmsync.ittt_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_ittt_rules_is_active ON firmsync.ittt_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_ittt_executions_rule_id ON firmsync.ittt_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_ittt_executions_executed_at ON firmsync.ittt_executions(executed_at);
CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON firmsync.client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_contacted_at ON firmsync.client_contacts(contacted_at);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON firmsync.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON firmsync.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON firmsync.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON firmsync.activity_logs(created_at);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_ittt_rules_updated_at 
    BEFORE UPDATE ON firmsync.ittt_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_config_updated_at 
    BEFORE UPDATE ON firmsync.tenant_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample ITTT Rules for demo
INSERT INTO firmsync.ittt_rules (name, description, trigger_type, conditions, actions) VALUES
(
    'Welcome New Clients',
    'Send welcome email when a new client is added',
    'client_added',
    '[]',
    '[{
        "type": "send_email",
        "target": "{{client.email}}",
        "payload": {
            "subject": "Welcome to Our Firm",
            "template": "welcome_client",
            "autoSend": true
        }
    }]'
),
(
    'Create Follow-up Task',
    'Create a follow-up task when client is contacted',
    'client_contacted',
    '[]',
    '[{
        "type": "create_task",
        "target": "attorney@firm.com",
        "payload": {
            "title": "Follow up with {{client.firstName}} {{client.lastName}}",
            "description": "Schedule follow-up contact within 3 days",
            "dueDate": "{{date.add(3, days)}}"
        },
        "delayMinutes": 1440
    }]'
),
(
    'Log High-Value Client Activity',
    'Log activity for business clients',
    'client_added',
    '[{
        "field": "client.clientType",
        "operator": "equals",
        "value": "business"
    }]',
    '[{
        "type": "log_activity",
        "target": "{{client.id}}",
        "payload": {
            "entityType": "client",
            "activityType": "high_value_client_added",
            "description": "New business client added: {{client.company}}"
        }
    }]'
);

-- Insert default tenant configuration
INSERT INTO firmsync.tenant_config (tenant_id, feature_mode, integration_provider) VALUES
('demo-firm', 'native', null)
ON CONFLICT (tenant_id) DO NOTHING;
