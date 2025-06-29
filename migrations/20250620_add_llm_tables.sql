-- Migration: Add LLM tables for multi-tenant LLM backend
-- Date: 2025-06-20

-- 1. firm_llm_settings: per-firm LLM configuration
CREATE TABLE IF NOT EXISTS public.firm_llm_settings (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER UNIQUE NOT NULL REFERENCES firms(id),
  openai_api_key TEXT,
  anthropic_api_key TEXT,
  default_model TEXT NOT NULL DEFAULT 'gpt-4o',
  max_tokens INTEGER NOT NULL DEFAULT 4000,
  temperature INTEGER NOT NULL DEFAULT 70,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  monthly_token_limit INTEGER NOT NULL DEFAULT 1000000,
  current_month_usage INTEGER NOT NULL DEFAULT 0,
  last_usage_reset TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. llm_prompt_templates: global default templates
CREATE TABLE IF NOT EXISTS public.llm_prompt_templates (
  id SERIAL PRIMARY KEY,
  tab_type TEXT NOT NULL,
  prompt_name TEXT NOT NULL,
  base_prompt TEXT NOT NULL,
  system_prompt TEXT,
  context_instructions TEXT,
  response_format TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  version INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 3. firm_prompt_configurations: firm-specific overrides
CREATE TABLE IF NOT EXISTS public.firm_prompt_configurations (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER NOT NULL REFERENCES firms(id),
  tab_type TEXT NOT NULL,
  template_id INTEGER REFERENCES llm_prompt_templates(id),
  custom_prompt TEXT,
  custom_system_prompt TEXT,
  custom_context_instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  configured_by INTEGER REFERENCES users(id),
  last_tested_at TIMESTAMP,
  test_results JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 4. llm_usage_logs: tracking each request
CREATE TABLE IF NOT EXISTS public.llm_usage_logs (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER NOT NULL REFERENCES firms(id),
  user_id INTEGER REFERENCES users(id),
  tab_type TEXT NOT NULL,
  request_type TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  response_time INTEGER,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  request_hash TEXT,
  cost INTEGER,
  model TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 5. llm_response_cache: cached LLM responses
CREATE TABLE IF NOT EXISTS public.llm_response_cache (
  id SERIAL PRIMARY KEY,
  firm_id INTEGER NOT NULL REFERENCES firms(id),
  request_hash TEXT NOT NULL,
  tab_type TEXT NOT NULL,
  response JSONB NOT NULL,
  tokens_used INTEGER NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMP NOT NULL DEFAULT now()
);
