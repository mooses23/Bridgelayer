CREATE TABLE "document_stencils" (
	"id" serial PRIMARY KEY NOT NULL,
	"firm_id" integer,
	"name" text NOT NULL,
	"file_name" text NOT NULL,
	"full_text" text NOT NULL,
	"description" text,
	"category" text,
	"uploaded_by" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "firm_llm_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"firm_id" integer NOT NULL,
	"openai_api_key" text,
	"anthropic_api_key" text,
	"default_model" text DEFAULT 'gpt-4o',
	"max_tokens" integer DEFAULT 4000,
	"temperature" integer DEFAULT 70,
	"is_active" boolean DEFAULT true,
	"monthly_token_limit" integer DEFAULT 1000000,
	"current_month_usage" integer DEFAULT 0,
	"last_usage_reset" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "firm_llm_settings_firm_id_unique" UNIQUE("firm_id")
);
--> statement-breakpoint
CREATE TABLE "firm_prompt_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"firm_id" integer NOT NULL,
	"tab_type" text NOT NULL,
	"template_id" integer,
	"document_stencil_id" integer,
	"custom_prompt" text,
	"custom_system_prompt" text,
	"custom_context_instructions" text,
	"is_active" boolean DEFAULT true,
	"configured_by" integer NOT NULL,
	"last_tested_at" timestamp,
	"test_results" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "llm_prompt_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"firm_id" integer,
	"tab_type" text NOT NULL,
	"document_stencil_id" integer,
	"prompt_name" text NOT NULL,
	"base_prompt" text NOT NULL,
	"system_prompt" text,
	"context_instructions" text,
	"response_format" text,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"version" integer DEFAULT 1,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "llm_response_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"firm_id" integer NOT NULL,
	"request_hash" text NOT NULL,
	"tab_type" text NOT NULL,
	"response" jsonb NOT NULL,
	"tokens_used" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"hit_count" integer DEFAULT 0,
	"last_accessed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "llm_usage_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"firm_id" integer NOT NULL,
	"user_id" integer,
	"tab_type" text NOT NULL,
	"request_type" text NOT NULL,
	"tokens_used" integer NOT NULL,
	"response_time" integer,
	"success" boolean DEFAULT true,
	"error_message" text,
	"request_hash" text,
	"cost" integer,
	"model" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "billing_forms" ADD COLUMN "form_type" text;--> statement-breakpoint
ALTER TABLE "billing_permissions" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD COLUMN "case_id" integer;--> statement-breakpoint
ALTER TABLE "document_type_templates" ADD COLUMN "vertical" text;--> statement-breakpoint
ALTER TABLE "document_type_templates" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "document_type_templates" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "document_type_templates" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "uploaded_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "status" text DEFAULT 'processing';--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "analyzed_at" timestamp;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "firm_integrations" ADD COLUMN "integration_name" text;--> statement-breakpoint
ALTER TABLE "firm_integrations" ADD COLUMN "status" text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "firm_integrations" ADD COLUMN "enabled_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "firm_integrations" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "firms" ADD COLUMN "subdomain" text;--> statement-breakpoint
ALTER TABLE "firms" ADD COLUMN "onboarding_complete" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "firms" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "integration_rate_limits" ADD COLUMN "window_minutes" integer DEFAULT 60;--> statement-breakpoint
ALTER TABLE "integration_rate_limits" ADD COLUMN "current_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "integration_rate_limits" ADD COLUMN "max_requests" integer DEFAULT 1000;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "subtotal" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "tax_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "total" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "issue_date" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "message_threads" ADD COLUMN "thread_id" text;--> statement-breakpoint
ALTER TABLE "message_threads" ADD COLUMN "is_resolved" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "message_threads" ADD COLUMN "resolved_by" integer;--> statement-breakpoint
ALTER TABLE "message_threads" ADD COLUMN "resolved_at" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "firm_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "read_by" jsonb;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "resource_type" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "resource_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "client_id" integer;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "system_admins" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "system_alerts" ADD COLUMN "firm_id" integer;--> statement-breakpoint
ALTER TABLE "system_alerts" ADD COLUMN "is_read" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_integration_permissions" ADD COLUMN "firm_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user_integration_permissions" ADD COLUMN "integration_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user_integration_permissions" ADD COLUMN "permissions" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "document_stencils" ADD CONSTRAINT "document_stencils_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_stencils" ADD CONSTRAINT "document_stencils_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_llm_settings" ADD CONSTRAINT "firm_llm_settings_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_prompt_configurations" ADD CONSTRAINT "firm_prompt_configurations_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_prompt_configurations" ADD CONSTRAINT "firm_prompt_configurations_template_id_llm_prompt_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."llm_prompt_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_prompt_configurations" ADD CONSTRAINT "firm_prompt_configurations_document_stencil_id_document_stencils_id_fk" FOREIGN KEY ("document_stencil_id") REFERENCES "public"."document_stencils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firm_prompt_configurations" ADD CONSTRAINT "firm_prompt_configurations_configured_by_users_id_fk" FOREIGN KEY ("configured_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_prompt_templates" ADD CONSTRAINT "llm_prompt_templates_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_prompt_templates" ADD CONSTRAINT "llm_prompt_templates_document_stencil_id_document_stencils_id_fk" FOREIGN KEY ("document_stencil_id") REFERENCES "public"."document_stencils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_prompt_templates" ADD CONSTRAINT "llm_prompt_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_response_cache" ADD CONSTRAINT "llm_response_cache_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_usage_logs" ADD CONSTRAINT "llm_usage_logs_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "llm_usage_logs" ADD CONSTRAINT "llm_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_client_auth_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_auth"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_integration_permissions" ADD CONSTRAINT "user_integration_permissions_firm_id_firms_id_fk" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_integration_permissions" ADD CONSTRAINT "user_integration_permissions_integration_id_platform_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."platform_integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firms" ADD CONSTRAINT "firms_subdomain_unique" UNIQUE("subdomain");--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_thread_id_unique" UNIQUE("thread_id");--> statement-breakpoint
ALTER TABLE "system_admins" ADD CONSTRAINT "system_admins_email_unique" UNIQUE("email");