-- Migration: Add LLM Admin tables for providers and models
-- Date: 2025-06-23

-- 1. llm_providers: table for LLM providers
CREATE TABLE IF NOT EXISTS public.llm_providers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  api_key_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  endpoint TEXT,
  requires_api_key BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. llm_models: table for LLM models
CREATE TABLE IF NOT EXISTS public.llm_models (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  provider_id INTEGER NOT NULL REFERENCES llm_providers(id),
  description TEXT,
  context_window INTEGER,
  cost_per_1k_tokens INTEGER,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 3. Insert default LLM providers
INSERT INTO public.llm_providers (name, api_key_name, status, endpoint, requires_api_key)
VALUES
  ('OpenAI', 'openaiApiKey', 'active', 'https://api.openai.com/v1', TRUE),
  ('Anthropic', 'anthropicApiKey', 'active', 'https://api.anthropic.com/v1', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 4. Insert default LLM models
INSERT INTO public.llm_models (name, provider_id, description, context_window, cost_per_1k_tokens, enabled)
VALUES
  ('gpt-4o', (SELECT id FROM llm_providers WHERE name = 'OpenAI'), 'Most capable GPT-4 model for complex tasks', 8192, 30, TRUE),
  ('gpt-3.5-turbo', (SELECT id FROM llm_providers WHERE name = 'OpenAI'), 'Fast and cost-effective for most tasks', 4096, 2, TRUE),
  ('claude-3-opus', (SELECT id FROM llm_providers WHERE name = 'Anthropic'), 'Anthropic''s most powerful model', 100000, 50, FALSE),
  ('claude-3-sonnet', (SELECT id FROM llm_providers WHERE name = 'Anthropic'), 'Good balance of intelligence and speed', 50000, 20, FALSE)
ON CONFLICT (name) DO NOTHING;
