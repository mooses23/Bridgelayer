import axios from 'axios';

export interface LlmSettings {
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
}

export async function setFirmApiKey(apiKey: string): Promise<void> {
  await axios.post('/api/llm/settings/api-key', { apiKey });
  return;
}

export async function getFirmUsageStats() {
  const response = await axios.get('/api/llm/usage/stats');
  return response.data;
}

export async function getInsights(tab: string, id?: number) {
  const url = id ? `/api/llm/insights/${tab}/${id}` : `/api/llm/insights/${tab}`;
  const response = await axios.get(url);
  return response.data;
}

export async function getTemplates(tab: string) {
  const response = await axios.get(`/api/llm/templates?tabType=${tab}`);
  return response.data;
}

export async function updateTemplate(templateId: number, updates: any) {
  const response = await axios.put(`/api/llm/templates/${templateId}`, updates);
  return response.data;
}

export async function initializeTemplates() {
  const response = await axios.post('/api/llm/templates/initialize');
  return response.data;
}

export async function getFirmSettings() {
  const response = await axios.get('/api/llm/settings');
  return response.data;
}

// LLM Function APIs
export async function getContractAnalysis(firmId: number, userId: number, documentId: number, userQuery?: string) {
  const response = await axios.post('/api/llm/function/contract_analysis', {
    firmId,
    userId,
    documentId,
    userQuery
  });
  return response.data;
}

export async function getComplianceCheck(firmId: number, userId: number, documentId: number, regulations?: string[], userQuery?: string) {
  const response = await axios.post('/api/llm/function/compliance_check', {
    firmId,
    userId,
    documentId,
    regulations,
    userQuery
  });
  return response.data;
}

export async function getRiskAssessment(firmId: number, userId: number, documentId: number, riskTypes?: string[], userQuery?: string) {
  const response = await axios.post('/api/llm/function/risk_assessment', {
    firmId,
    userId,
    documentId,
    riskTypes,
    userQuery
  });
  return response.data;
}

export async function getClauseExtraction(firmId: number, userId: number, documentId: number, clauseTypes?: string[], userQuery?: string) {
  const response = await axios.post('/api/llm/function/clause_extraction', {
    firmId,
    userId,
    documentId,
    clauseTypes,
    userQuery
  });
  return response.data;
}

export async function getLegalResearch(firmId: number, userId: number, query: string, jurisdiction?: string, practiceArea?: string) {
  const response = await axios.post('/api/llm/function/legal_research', {
    firmId,
    userId,
    query,
    jurisdiction,
    practiceArea
  });
  return response.data;
}

export async function getDocumentDrafting(firmId: number, userId: number, documentType: string, parameters: any, templateId?: number) {
  const response = await axios.post('/api/llm/function/document_drafting', {
    firmId,
    userId,
    documentType,
    parameters,
    templateId
  });
  return response.data;
}

export async function getCaseStrategy(firmId: number, userId: number, caseId: number, strategyType?: string, userQuery?: string) {
  const response = await axios.post('/api/llm/function/case_strategy', {
    firmId,
    userId,
    caseId,
    strategyType,
    userQuery
  });
  return response.data;
}

export async function getDiscoveryManagement(firmId: number, userId: number, caseId: number, discoveryType?: string, userQuery?: string) {
  const response = await axios.post('/api/llm/function/discovery_management', {
    firmId,
    userId,
    caseId,
    discoveryType,
    userQuery
  });
  return response.data;
}

export async function getCitationResearch(firmId: number, userId: number, query: string, citationStyle?: string, jurisdiction?: string) {
  const response = await axios.post('/api/llm/function/citation_research', {
    firmId,
    userId,
    query,
    citationStyle,
    jurisdiction
  });
  return response.data;
}

export async function getDocumentAutomation(firmId: number, userId: number, automationType: string, parameters: any, userQuery?: string) {
  const response = await axios.post('/api/llm/function/document_automation', {
    firmId,
    userId,
    automationType,
    parameters,
    userQuery
  });
  return response.data;
}

export async function getDocumentReview(firmId: number, userId: number, documentId: number, userQuery?: string) {
  const response = await axios.post('/api/llm/function/document_review', {
    firmId,
    userId,
    documentId,
    userQuery
  });
  return response.data;
}

// Export as default object for easier importing
const llmApi = {
  setFirmApiKey,
  getFirmUsageStats,
  getInsights,
  getTemplates,
  updateTemplate,
  initializeTemplates,
  getFirmSettings,
  getContractAnalysis,
  getComplianceCheck,
  getRiskAssessment,
  getClauseExtraction,
  getLegalResearch,
  getDocumentDrafting,
  getCaseStrategy,
  getDiscoveryManagement,
  getCitationResearch,
  getDocumentAutomation,
  getDocumentReview
};

export default llmApi;
