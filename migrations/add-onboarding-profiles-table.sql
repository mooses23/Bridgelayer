-- Add onboarding profiles table for 6-tab admin workflow coordination
-- Auto-incrementing unique codes: #101, #102, #103, etc.

CREATE TABLE IF NOT EXISTS onboarding_profiles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE, -- "#101", "#102", etc.
  firm_id INTEGER REFERENCES firms(id),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  
  -- Tab 1: Firm Data (from FirmsPage)
  step1_firm_data JSONB, -- Basic firm info, practice areas, etc.
  step1_complete BOOLEAN DEFAULT FALSE,
  step1_completed_at TIMESTAMP,
  
  -- Tab 2: Integrations (from IntegrationsPage)
  step2_selected_integrations JSONB, -- Array of selected integration IDs
  step2_integration_configs JSONB, -- Configuration for each integration
  step2_complete BOOLEAN DEFAULT FALSE,
  step2_completed_at TIMESTAMP,
  
  -- Tab 3: LLM Prompts (from LLMPromptsPage)
  step3_custom_prompts JSONB, -- Tab-specific prompt customizations
  step3_llm_settings JSONB, -- AI model preferences, token limits
  step3_complete BOOLEAN DEFAULT FALSE,
  step3_completed_at TIMESTAMP,
  
  -- Tab 4: Final Configuration File
  step4_final_configuration JSONB, -- Generated complete config
  step4_generated_file TEXT, -- URL or path to generated onboarding file
  step4_complete BOOLEAN DEFAULT FALSE,
  step4_completed_at TIMESTAMP,
  
  -- Metadata
  created_by INTEGER REFERENCES users(id) NOT NULL,
  notes TEXT, -- Admin notes about the onboarding process
  total_steps_completed INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for efficient code lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_code ON onboarding_profiles(code);
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_status ON onboarding_profiles(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_firm_id ON onboarding_profiles(firm_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_created_by ON onboarding_profiles(created_by);

-- Insert some sample data for testing
INSERT INTO onboarding_profiles (code, created_by, notes, status) VALUES 
('#101', 1, 'Test onboarding profile #1', 'in_progress'),
('#102', 1, 'Test onboarding profile #2', 'in_progress')
ON CONFLICT (code) DO NOTHING;
