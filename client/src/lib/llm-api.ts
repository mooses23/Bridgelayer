import { toast } from "@/components/ui/use-toast";

// API Base URL
const API_BASE = '/api/llm/admin';

/**
 * LLM Provider API functions
 */

// Get all providers
export const getProviders = async () => {
  try {
    const response = await fetch(`${API_BASE}/providers`);
    if (!response.ok) {
      throw new Error(`Error fetching providers: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch providers:', error);
    toast({
      title: "Error",
      description: "Failed to fetch LLM providers",
      variant: "destructive",
    });
    return [];
  }
};

// Get provider by ID
export const getProviderById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/providers/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching provider: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch provider ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to fetch LLM provider",
      variant: "destructive",
    });
    return null;
  }
};

// Create new provider
export const createProvider = async (provider: {
  name: string;
  apiKeyName: string;
  endpoint?: string;
  requiresApiKey?: boolean;
  status?: string;
}) => {
  try {
    const response = await fetch(`${API_BASE}/providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(provider),
    });
    if (!response.ok) {
      throw new Error(`Error creating provider: ${response.statusText}`);
    }
    toast({
      title: "Success",
      description: "Provider created successfully",
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to create provider:', error);
    toast({
      title: "Error",
      description: "Failed to create provider",
      variant: "destructive",
    });
    return null;
  }
};

// Update provider
export const updateProvider = async (id: string, provider: {
  name?: string;
  apiKeyName?: string;
  endpoint?: string;
  requiresApiKey?: boolean;
  status?: string;
}) => {
  try {
    const response = await fetch(`${API_BASE}/providers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(provider),
    });
    if (!response.ok) {
      throw new Error(`Error updating provider: ${response.statusText}`);
    }
    toast({
      title: "Success",
      description: "Provider updated successfully",
    });
    return await response.json();
  } catch (error) {
    console.error(`Failed to update provider ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to update provider",
      variant: "destructive",
    });
    return null;
  }
};

// Delete provider
export const deleteProvider = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/providers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting provider: ${response.statusText}`);
    }
    toast({
      title: "Success",
      description: "Provider deleted successfully",
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete provider ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to delete provider",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * LLM Model API functions
 */

// Get all models
export const getModels = async () => {
  try {
    const response = await fetch(`${API_BASE}/models`);
    if (!response.ok) {
      throw new Error(`Error fetching models: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch models:', error);
    toast({
      title: "Error",
      description: "Failed to fetch LLM models",
      variant: "destructive",
    });
    return [];
  }
};

// Get models by provider ID
export const getModelsByProvider = async (providerId: string) => {
  try {
    const response = await fetch(`${API_BASE}/providers/${providerId}/models`);
    if (!response.ok) {
      throw new Error(`Error fetching models for provider ${providerId}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch models for provider ${providerId}:`, error);
    toast({
      title: "Error",
      description: "Failed to fetch provider models",
      variant: "destructive",
    });
    return [];
  }
};

// Get model by ID
export const getModelById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/models/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching model: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch model ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to fetch LLM model",
      variant: "destructive",
    });
    return null;
  }
};

// Create new model
export const createModel = async (model: {
  name: string;
  providerId: string | number;
  description?: string;
  contextWindow?: number;
  costPer1kTokens?: number;
  enabled?: boolean;
}) => {
  try {
    const response = await fetch(`${API_BASE}/models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(model),
    });
    if (!response.ok) {
      throw new Error(`Error creating model: ${response.statusText}`);
    }
    toast({
      title: "Success",
      description: "Model created successfully",
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to create model:', error);
    toast({
      title: "Error",
      description: "Failed to create model",
      variant: "destructive",
    });
    return null;
  }
};

// Update model
export const updateModel = async (id: string, model: {
  name?: string;
  providerId?: string | number;
  description?: string;
  contextWindow?: number;
  costPer1kTokens?: number;
  enabled?: boolean;
}) => {
  try {
    const response = await fetch(`${API_BASE}/models/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(model),
    });
    if (!response.ok) {
      throw new Error(`Error updating model: ${response.statusText}`);
    }
    toast({
      title: "Success",
      description: "Model updated successfully",
    });
    return await response.json();
  } catch (error) {
    console.error(`Failed to update model ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to update model",
      variant: "destructive",
    });
    return null;
  }
};

// Delete model
export const deleteModel = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/models/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting model: ${response.statusText}`);
    }
    toast({
      title: "Success",
      description: "Model deleted successfully",
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete model ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to delete model",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Prompt Template API functions
 */

// Get all prompt templates
export const getPromptTemplates = async () => {
  try {
    const response = await fetch(`${API_BASE}/prompt-templates`);
    if (!response.ok) {
      throw new Error(`Error fetching prompt templates: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch prompt templates:', error);
    toast({
      title: "Error",
      description: "Failed to fetch prompt templates",
      variant: "destructive",
    });
    return [];
  }
};

// Get prompt template by ID
export const getPromptTemplateById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/prompt-templates/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching prompt template: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch prompt template ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to fetch prompt template",
      variant: "destructive",
    });
    return null;
  }
};

// Create new prompt template
export const createPromptTemplate = async (prompt: {
  name: string;
  description: string;
  category: string;
  template: string;
  systemMessage?: string;
  active: boolean;
}) => {
  try {
    const response = await fetch(`${API_BASE}/prompt-templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt),
    });
    if (!response.ok) {
      throw new Error(`Error creating prompt template: ${response.statusText}`);
    }
    toast({
      title: "Success",
      description: "Prompt template created successfully",
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to create prompt template:', error);
    toast({
      title: "Error",
      description: "Failed to create prompt template",
      variant: "destructive",
    });
    return null;
  }
};

// Update prompt template
export const updatePromptTemplate = async (id: string, prompt: {
  name?: string;
  description?: string;
  category?: string;
  template?: string;
  systemMessage?: string;
  active?: boolean;
}) => {
  try {
    const response = await fetch(`${API_BASE}/prompt-templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt),
    });
    if (!response.ok) {
      throw new Error(`Error updating prompt template: ${response.statusText}`);
    }
    toast({
      title: "Success",
      description: "Prompt template updated successfully",
    });
    return await response.json();
  } catch (error) {
    console.error(`Failed to update prompt template ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to update prompt template",
      variant: "destructive",
    });
    return null;
  }
};

// Delete prompt template
export const deletePromptTemplate = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE}/prompt-templates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting prompt template: ${response.statusText}`);
    }
    toast({
      title: "Success",
      description: "Prompt template deleted successfully",
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete prompt template ${id}:`, error);
    toast({
      title: "Error",
      description: "Failed to delete prompt template",
      variant: "destructive",
    });
    return false;
  }
};
