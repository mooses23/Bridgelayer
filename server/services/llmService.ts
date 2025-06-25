import OpenAI from "openai";
import { db } from "../db";
import { 
  firmLlmSettings, 
  llmPromptTemplates, 
  firmPromptConfigurations, 
  llmUsageLogs, 
  llmResponseCache,
  llmProviders,
  llmModels
} from "../../shared/schema";
import { eq, and, desc, lt } from "drizzle-orm";
import * as crypto from "crypto";

// Tab types that support LLM integration
export type TabType = 
  // Core LLM Functions (8 tabs)
  | 'document_review'
  | 'contract_analysis' 
  | 'compliance_check'
  | 'risk_assessment'
  | 'clause_extraction'
  | 'legal_research'
  | 'document_drafting'
  | 'case_strategy'
  // Paralegal+ Functions (3 sub-tabs)
  | 'discovery_management'
  | 'citation_research'
  | 'document_automation'
  // Legacy UI tab types for compatibility
  | 'dashboard' 
  | 'clients' 
  | 'cases' 
  | 'documents' 
  | 'calendar' 
  | 'tasks' 
  | 'billing' 
  | 'paralegal';

export interface LlmRequest {
  firmId: number;
  userId: number;
  tabType: TabType;
  requestType: string;
  context: Record<string, any>;
  userQuery?: string;
}

export interface LlmResponse {
  content: string;
  tokensUsed: number;
  responseTime: number;
  cached: boolean;
  cost?: number;
}

export interface LlmError {
  error: string;
  code?: string;
  details?: any;
}

class LlmService {
  private openaiInstances = new Map<number, OpenAI>();
  private encryptionKey = process.env.ENCRYPTION_KEY || 'fallback-key-for-dev';

  // Encrypt API key for storage
  private encryptApiKey(apiKey: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decrypt API key from storage
  private decryptApiKey(encryptedKey: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Get or create OpenAI instance for a firm
  private async getOpenAIInstance(firmId: number): Promise<OpenAI | null> {
    // Check if we already have an instance
    if (this.openaiInstances.has(firmId)) {
      return this.openaiInstances.get(firmId)!;
    }

    // Get firm's LLM settings
    const settings = await db
      .select()
      .from(firmLlmSettings)
      .where(eq(firmLlmSettings.firmId, firmId))
      .limit(1);

    if (!settings.length || !settings[0].openaiApiKey || !settings[0].isActive) {
      return null;
    }

    // Decrypt API key and create instance
    const apiKey = this.decryptApiKey(settings[0].openaiApiKey);
    const openai = new OpenAI({ apiKey });
    
    // Cache the instance
    this.openaiInstances.set(firmId, openai);
    
    return openai;
  }

  // Store or update firm's OpenAI API key
  async setFirmApiKey(firmId: number, apiKey: string, userId: number): Promise<void> {
    const encryptedKey = this.encryptApiKey(apiKey);
    
    // Check if settings exist
    const existing = await db
      .select()
      .from(firmLlmSettings)
      .where(eq(firmLlmSettings.firmId, firmId))
      .limit(1);

    if (existing.length) {
      // Update existing
      await db
        .update(firmLlmSettings)
        .set({ 
          openaiApiKey: encryptedKey,
          updatedAt: new Date()
        })
        .where(eq(firmLlmSettings.firmId, firmId));
    } else {
      // Create new
      await db
        .insert(firmLlmSettings)
        .values({
          firmId,
          openaiApiKey: encryptedKey
        });
    }

    // Clear cached instance to force reload
    this.openaiInstances.delete(firmId);
  }

  // Get firm's LLM configuration for a specific tab
  private async getFirmPromptConfig(firmId: number, tabType: TabType): Promise<{
    basePrompt: string;
    systemPrompt?: string;
    contextInstructions?: string;
    responseFormat?: string;
  } | null> {
    // First, check for firm-specific configuration
    const firmConfig = await db
      .select()
      .from(firmPromptConfigurations)
      .where(and(
        eq(firmPromptConfigurations.firmId, firmId),
        eq(firmPromptConfigurations.tabType, tabType),
        eq(firmPromptConfigurations.isActive, true)
      ))
      .limit(1);

    if (firmConfig.length && firmConfig[0].customPrompt) {
      return {
        basePrompt: firmConfig[0].customPrompt,
        systemPrompt: firmConfig[0].customSystemPrompt || undefined,
        contextInstructions: firmConfig[0].customContextInstructions || undefined,
        responseFormat: 'json'
      };
    }

    // Fall back to template
    const template = await db
      .select()
      .from(llmPromptTemplates)
      .where(and(
        eq(llmPromptTemplates.tabType, tabType),
        eq(llmPromptTemplates.isActive, true),
        eq(llmPromptTemplates.isDefault, true)
      ))
      .limit(1);

    if (template.length) {
      return {
        basePrompt: template[0].basePrompt,
        systemPrompt: template[0].systemPrompt || undefined,
        contextInstructions: template[0].contextInstructions || undefined,
        responseFormat: template[0].responseFormat || 'json'
      };
    }

    return null;
  }

  // Generate request hash for caching
  private generateRequestHash(firmId: number, tabType: TabType, context: any, userQuery?: string): string {
    const hashInput = JSON.stringify({ firmId, tabType, context, userQuery });
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  // Check cache for existing response
  private async getCachedResponse(requestHash: string, firmId: number): Promise<LlmResponse | null> {
    const cached = await db
      .select()
      .from(llmResponseCache)
      .where(and(
        eq(llmResponseCache.requestHash, requestHash),
        eq(llmResponseCache.firmId, firmId)
      ))
      .limit(1);

    if (cached.length && new Date(cached[0].expiresAt) > new Date()) {
      // Update hit count and last accessed
      await db
        .update(llmResponseCache)
        .set({
          hitCount: (cached[0].hitCount || 0) + 1,
          lastAccessedAt: new Date()
        })
        .where(eq(llmResponseCache.id, cached[0].id));

      return {
        content: JSON.stringify(cached[0].response),
        tokensUsed: cached[0].tokensUsed,
        responseTime: 0, // Cached response
        cached: true
      };
    }

    return null;
  }

  // Store response in cache
  private async cacheResponse(
    requestHash: string, 
    firmId: number, 
    tabType: TabType, 
    response: any, 
    tokensUsed: number
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db
      .insert(llmResponseCache)
      .values({
        firmId,
        requestHash,
        tabType,
        response,
        tokensUsed,
        expiresAt
      });
  }

  // Log LLM usage
  private async logUsage(
    firmId: number, 
    userId: number, 
    tabType: TabType, 
    requestType: string,
    tokensUsed: number,
    responseTime: number,
    success: boolean,
    model: string,
    errorMessage?: string
  ): Promise<void> {
    // Calculate cost (rough estimate: $0.03 per 1K tokens for GPT-4o)
    const cost = Math.round((tokensUsed / 1000) * 3); // in cents

    await db
      .insert(llmUsageLogs)
      .values({
        firmId,
        userId,
        tabType,
        requestType,
        tokensUsed,
        responseTime,
        success,
        errorMessage,
        cost,
        model
      });

    // Update monthly usage - get current usage and increment
    const currentSettings = await db
      .select()
      .from(firmLlmSettings)
      .where(eq(firmLlmSettings.firmId, firmId))
      .limit(1);

    if (currentSettings.length) {
      const newUsage = (currentSettings[0].currentMonthUsage || 0) + tokensUsed;
      await db
        .update(firmLlmSettings)
        .set({
          currentMonthUsage: newUsage
        })
        .where(eq(firmLlmSettings.firmId, firmId));
    }
  }

  // Main method to process LLM requests
  async processRequest(request: LlmRequest): Promise<LlmResponse | LlmError> {
    const startTime = Date.now();
    
    try {
      // Check for cached response
      const requestHash = this.generateRequestHash(
        request.firmId, 
        request.tabType, 
        request.context, 
        request.userQuery
      );
      
      const cached = await this.getCachedResponse(requestHash, request.firmId);
      if (cached) {
        return cached;
      }

      // Get OpenAI instance
      const openai = await this.getOpenAIInstance(request.firmId);
      if (!openai) {
        return { error: "No OpenAI API key configured for this firm" };
      }

      // Get prompt configuration
      const promptConfig = await this.getFirmPromptConfig(request.firmId, request.tabType);
      if (!promptConfig) {
        return { error: `No prompt configuration found for ${request.tabType} tab` };
      }

      // Build the prompt with context
      const contextString = JSON.stringify(request.context, null, 2);
      let fullPrompt = `${promptConfig.basePrompt}\n\nContext Data:\n${contextString}`;
      
      if (request.userQuery) {
        fullPrompt += `\n\nUser Query: ${request.userQuery}`;
      }

      // Make OpenAI request
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: promptConfig.systemPrompt || "You are a legal AI assistant helping with law firm management."
          },
          {
            role: "user", 
            content: fullPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      });

      const responseTime = Date.now() - startTime;
      const tokensUsed = completion.usage?.total_tokens || 0;
      const content = completion.choices[0]?.message?.content || "";

      // Cache the response
      await this.cacheResponse(requestHash, request.firmId, request.tabType, { content }, tokensUsed);

      // Log usage
      await this.logUsage(
        request.firmId,
        request.userId,
        request.tabType,
        request.requestType,
        tokensUsed,
        responseTime,
        true,
        "gpt-4o"
      );

      return {
        content,
        tokensUsed,
        responseTime,
        cached: false,
        cost: Math.round((tokensUsed / 1000) * 3) // rough cost in cents
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Log failed usage
      await this.logUsage(
        request.firmId,
        request.userId,
        request.tabType,
        request.requestType,
        0,
        responseTime,
        false,
        "gpt-4o",
        error.message
      );

      return {
        error: "Failed to process LLM request",
        code: error.code || "UNKNOWN_ERROR",
        details: error.message
      };
    }
  }

  // Clean up expired cache entries
  async cleanupCache(): Promise<void> {
    await db
      .delete(llmResponseCache)
      .where(lt(llmResponseCache.expiresAt, new Date()));
  }

  // Get firm's LLM usage statistics
  async getFirmUsageStats(firmId: number) {
    const rows = await db
      .select()
      .from(firmLlmSettings)
      .where(eq(firmLlmSettings.firmId, firmId))
      .limit(1);

    if (!rows.length) {
      return { currentMonthUsage: 0, monthlyTokenLimit: 0 };
    }

    const s = rows[0];
    return {
      currentMonthUsage: s.currentMonthUsage,
      monthlyTokenLimit: s.monthlyTokenLimit,
    };
  }

  // Get firm's LLM configuration and usage stats
  async getFirmSettings(firmId: number) {
    const rows = await db
      .select()
      .from(firmLlmSettings)
      .where(eq(firmLlmSettings.firmId, firmId))
      .limit(1);

    if (!rows.length) {
      return null;
    }

    const s = rows[0];
    return {
      defaultModel: s.defaultModel,
      maxTokens: s.maxTokens,
      temperature: s.temperature,
      isActive: s.isActive,
      monthlyTokenLimit: s.monthlyTokenLimit,
      currentMonthUsage: s.currentMonthUsage,
      lastUsageReset: s.lastUsageReset
    };
  }

  // Check if firm has a valid API key configured
  async checkFirmApiKey(firmId: number): Promise<boolean> {
    try {
      const settings = await db
        .select()
        .from(firmLlmSettings)
        .where(eq(firmLlmSettings.firmId, firmId))
        .limit(1);

      return !!(settings.length && settings[0].openaiApiKey && settings[0].isActive);
    } catch (error) {
      console.error('Error checking firm API key:', error);
      return false;
    }
  }

  // Get available LLM providers
  async getProviders(): Promise<any[]> {
    const providers = await db
      .select()
      .from(llmProviders)
      .where(eq(llmProviders.isActive, true))
      .orderBy(desc(llmProviders.priority))
      .execute();

    return providers;
  }

  // Get available models for a provider
  async getModels(providerId: number): Promise<any[]> {
    const models = await db
      .select()
      .from(llmModels)
      .where(and(
        eq(llmModels.providerId, providerId),
        eq(llmModels.isActive, true)
      ))
      .orderBy(desc(llmModels.createdAt))
      .execute();

    return models;
  }

  // LLM Provider methods
  async getAllProviders() {
    try {
      return await db.select().from(llmProviders).orderBy(llmProviders.name);
    } catch (error) {
      console.error('Error getting all providers:', error);
      throw new Error('Failed to get LLM providers');
    }
  }

  async getProviderById(id: number) {
    try {
      const results = await db.select().from(llmProviders).where(eq(llmProviders.id, id));
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting provider by ID:', error);
      throw new Error('Failed to get LLM provider');
    }
  }

  async createProvider(data: {
    name: string;
    apiKeyName: string;
    endpoint?: string | null;
    requiresApiKey?: boolean;
    status?: string;
  }) {
    try {
      const result = await db.insert(llmProviders).values({
        name: data.name,
        apiKeyName: data.apiKeyName,
        endpoint: data.endpoint || null,
        requiresApiKey: data.requiresApiKey !== false,
        status: data.status || 'active',
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating provider:', error);
      throw new Error('Failed to create LLM provider');
    }
  }

  async updateProvider(id: number, data: {
    name?: string;
    apiKeyName?: string;
    endpoint?: string | null;
    requiresApiKey?: boolean;
    status?: string;
  }) {
    try {
      const currentProvider = await this.getProviderById(id);
      if (!currentProvider) return null;

      const result = await db.update(llmProviders)
        .set({
          name: data.name !== undefined ? data.name : currentProvider.name,
          apiKeyName: data.apiKeyName !== undefined ? data.apiKeyName : currentProvider.apiKeyName,
          endpoint: data.endpoint !== undefined ? data.endpoint : currentProvider.endpoint,
          requiresApiKey: data.requiresApiKey !== undefined ? data.requiresApiKey : currentProvider.requiresApiKey,
          status: data.status !== undefined ? data.status : currentProvider.status,
          updatedAt: new Date(),
        })
        .where(eq(llmProviders.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating provider:', error);
      throw new Error('Failed to update LLM provider');
    }
  }

  async deleteProvider(id: number) {
    try {
      // Check if provider exists
      const provider = await this.getProviderById(id);
      if (!provider) return false;

      // Check if provider is being used by any models
      const associatedModels = await db.select({ count: llmModels.id })
        .from(llmModels)
        .where(eq(llmModels.providerId, id));

      if (associatedModels.length > 0) {
        throw new Error('Cannot delete provider that is associated with models');
      }

      await db.delete(llmProviders).where(eq(llmProviders.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw new Error('Failed to delete LLM provider');
    }
  }

  // LLM Model methods
  async getAllModels() {
    try {
      return await db.select()
      .from(llmModels)
      .leftJoin(llmProviders, eq(llmModels.providerId, llmProviders.id))
      .orderBy(llmProviders.name, llmModels.name);
    } catch (error) {
      console.error('Error getting all models:', error);
      throw new Error('Failed to get LLM models');
    }
  }

  async getModelsByProvider(providerId: number) {
    try {
      return await db.select()
        .from(llmModels)
        .where(eq(llmModels.providerId, providerId))
        .orderBy(llmModels.name);
    } catch (error) {
      console.error('Error getting models by provider:', error);
      throw new Error('Failed to get LLM models');
    }
  }

  async getModelById(id: number) {
    try {
      const results = await db.select()
      .from(llmModels)
      .leftJoin(llmProviders, eq(llmModels.providerId, llmProviders.id))
      .where(eq(llmModels.id, id));

      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting model by ID:', error);
      throw new Error('Failed to get LLM model');
    }
  }

  async createModel(data: {
    name: string;
    providerId: number;
    description?: string;
    contextWindow?: number | null;
    costPer1kTokens?: number | null;
    enabled?: boolean;
  }) {
    try {
      // Check if provider exists
      const provider = await this.getProviderById(data.providerId);
      if (!provider) {
        throw new Error('Provider does not exist');
      }

      const result = await db.insert(llmModels).values({
        name: data.name,
        providerId: data.providerId,
        description: data.description || null,
        contextWindow: data.contextWindow || null,
        costPer1kTokens: data.costPer1kTokens || null,
        enabled: data.enabled !== false,
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating model:', error);
      throw new Error('Failed to create LLM model');
    }
  }

  async updateModel(id: number, data: {
    name?: string;
    providerId?: number;
    description?: string | null;
    contextWindow?: number | null;
    costPer1kTokens?: number | null;
    enabled?: boolean;
  }) {
    try {
      const currentModel = await db.select().from(llmModels).where(eq(llmModels.id, id));
      if (currentModel.length === 0) return null;

      const current = currentModel[0];

      // If providerId is changing, verify the new provider exists
      if (data.providerId && data.providerId !== current.providerId) {
        const provider = await this.getProviderById(data.providerId);
        if (!provider) {
          throw new Error('Provider does not exist');
        }
      }

      const result = await db.update(llmModels)
        .set({
          name: data.name !== undefined ? data.name : current.name,
          providerId: data.providerId !== undefined ? data.providerId : current.providerId,
          description: data.description !== undefined ? data.description : current.description,
          contextWindow: data.contextWindow !== undefined ? data.contextWindow : current.contextWindow,
          costPer1kTokens: data.costPer1kTokens !== undefined ? data.costPer1kTokens : current.costPer1kTokens,
          enabled: data.enabled !== undefined ? data.enabled : current.enabled,
          updatedAt: new Date(),
        })
        .where(eq(llmModels.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating model:', error);
      throw new Error('Failed to update LLM model');
    }
  }

  async deleteModel(id: number) {
    try {
      const model = await db.select().from(llmModels).where(eq(llmModels.id, id));
      if (model.length === 0) return false;

      // Check if model is being used as a default model in any firm settings
      const firmsUsingModel = await db.select()
        .from(firmLlmSettings)
        .where(eq(firmLlmSettings.defaultModel, model[0].name));

      if (firmsUsingModel.length > 0) {
        throw new Error('Cannot delete model that is being used as a default model');
      }

      await db.delete(llmModels).where(eq(llmModels.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting model:', error);
      throw new Error('Failed to delete LLM model');
    }
  }
}

export const llmService = new LlmService();
