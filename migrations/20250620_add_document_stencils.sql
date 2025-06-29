-- Add document_stencils table and document_stencil_id to LLM tables
-- June 20, 2025

-- Create document_stencils table
CREATE TABLE IF NOT EXISTS "document_stencils" (
  "id" serial PRIMARY KEY NOT NULL,
  "firm_id" integer REFERENCES "firms"("id"),
  "name" text NOT NULL,
  "file_name" text NOT NULL,
  "full_text" text NOT NULL,
  "description" text,
  "category" text,
  "uploaded_by" integer NOT NULL REFERENCES "users"("id"),
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add document_stencil_id to llm_prompt_templates table
ALTER TABLE "llm_prompt_templates" 
ADD COLUMN IF NOT EXISTS "document_stencil_id" integer REFERENCES "document_stencils"("id");

-- Add document_stencil_id to firm_prompt_configurations table
ALTER TABLE "firm_prompt_configurations" 
ADD COLUMN IF NOT EXISTS "document_stencil_id" integer REFERENCES "document_stencils"("id");

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_document_stencils_firm_id" ON "document_stencils"("firm_id");
CREATE INDEX IF NOT EXISTS "idx_document_stencils_category" ON "document_stencils"("category");
CREATE INDEX IF NOT EXISTS "idx_document_stencils_is_active" ON "document_stencils"("is_active");
CREATE INDEX IF NOT EXISTS "idx_llm_prompt_templates_document_stencil_id" ON "llm_prompt_templates"("document_stencil_id");
CREATE INDEX IF NOT EXISTS "idx_firm_prompt_configurations_document_stencil_id" ON "firm_prompt_configurations"("document_stencil_id");
