-- CreateTable
CREATE TABLE "Firm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'basic',
    "billingEmail" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,

    CONSTRAINT "Firm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 2000,
    "topP" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "frequencyPenalty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "presencePenalty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "capabilities" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentPrompt" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "context" TEXT,
    "category" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentWorkflow" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConfig" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'markdown',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAssignment" (
    "documentTypeId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "workflow" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentAssignment_pkey" PRIMARY KEY ("documentTypeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Firm_slug_key" ON "Firm"("slug");

-- CreateIndex
CREATE INDEX "Firm_status_idx" ON "Firm"("status");

-- CreateIndex
CREATE INDEX "Firm_subscriptionTier_idx" ON "Firm"("subscriptionTier");

-- CreateIndex
CREATE INDEX "Agent_firmId_idx" ON "Agent"("firmId");

-- CreateIndex
CREATE INDEX "Agent_type_idx" ON "Agent"("type");

-- CreateIndex
CREATE INDEX "Agent_status_idx" ON "Agent"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_firmId_name_key" ON "Agent"("firmId", "name");

-- CreateIndex
CREATE INDEX "AgentPrompt_firmId_idx" ON "AgentPrompt"("firmId");

-- CreateIndex
CREATE INDEX "AgentPrompt_agentId_idx" ON "AgentPrompt"("agentId");

-- CreateIndex
CREATE INDEX "AgentPrompt_category_idx" ON "AgentPrompt"("category");

-- CreateIndex
CREATE UNIQUE INDEX "AgentPrompt_firmId_agentId_name_key" ON "AgentPrompt"("firmId", "agentId", "name");

-- CreateIndex
CREATE INDEX "AgentWorkflow_firmId_idx" ON "AgentWorkflow"("firmId");

-- CreateIndex
CREATE INDEX "AgentWorkflow_agentId_idx" ON "AgentWorkflow"("agentId");

-- CreateIndex
CREATE INDEX "AgentWorkflow_trigger_idx" ON "AgentWorkflow"("trigger");

-- CreateIndex
CREATE UNIQUE INDEX "AgentWorkflow_firmId_name_key" ON "AgentWorkflow"("firmId", "name");

-- CreateIndex
CREATE INDEX "IntegrationConfig_firmId_idx" ON "IntegrationConfig"("firmId");

-- CreateIndex
CREATE INDEX "IntegrationConfig_type_idx" ON "IntegrationConfig"("type");

-- CreateIndex
CREATE INDEX "IntegrationConfig_status_idx" ON "IntegrationConfig"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConfig_firmId_type_name_key" ON "IntegrationConfig"("firmId", "type", "name");

-- CreateIndex
CREATE INDEX "DocumentTemplate_firmId_idx" ON "DocumentTemplate"("firmId");

-- CreateIndex
CREATE INDEX "DocumentTemplate_type_idx" ON "DocumentTemplate"("type");

-- CreateIndex
CREATE INDEX "DocumentTemplate_category_idx" ON "DocumentTemplate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTemplate_firmId_name_version_key" ON "DocumentTemplate"("firmId", "name", "version");

-- CreateIndex
CREATE INDEX "AgentAssignment_agentId_idx" ON "AgentAssignment"("agentId");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWorkflow" ADD CONSTRAINT "AgentWorkflow_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWorkflow" ADD CONSTRAINT "AgentWorkflow_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConfig" ADD CONSTRAINT "IntegrationConfig_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTemplate" ADD CONSTRAINT "DocumentTemplate_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAssignment" ADD CONSTRAINT "AgentAssignment_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAssignment" ADD CONSTRAINT "AgentAssignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
