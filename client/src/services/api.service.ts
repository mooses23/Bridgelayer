import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API service based on refactored schema
class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
  }

  // Generic API methods
  async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config);
  }

  // Specific API endpoints based on refactored schema

  // Firms API
  async getFirm(slug: string) {
    return this.get(`/firms/${slug}`);
  }

  async createFirm(firmData: any) {
    return this.post('/admin/firms', firmData);
  }

  async updateFirm(code: string, firmData: any) {
    return this.put(`/admin/firms/${code}`, firmData);
  }

  // Onboarding API
  async getOnboardingProfile(code: string) {
    return this.get(`/admin/firms/${code}`);
  }

  async updateOnboardingStep(code: string, step: number, stepData: any) {
    return this.put(`/admin/firms/${code}/step/${step}`, stepData);
  }

  async getIntegrations(code: string) {
    return this.get(`/admin/firms/${code}/integrations`);
  }

  async saveIntegrations(code: string, integrations: any) {
    return this.post(`/admin/firms/${code}/integrations`, integrations);
  }

  async generateAgents(code: string, agentConfig: any) {
    return this.post(`/admin/firms/${code}/agents`, agentConfig);
  }

  async configureDocumentAgents(code: string, documentMappings: any) {
    return this.put(`/admin/firms/${code}/documents`, documentMappings);
  }

  // Client API
  async getClients(slug: string) {
    return this.get(`/tenant/${slug}/clients`);
  }

  async createClient(slug: string, clientData: any) {
    return this.post(`/tenant/${slug}/clients`, clientData);
  }

  // Case API
  async getCases(slug: string) {
    return this.get(`/tenant/${slug}/cases`);
  }

  async createCase(slug: string, caseData: any) {
    return this.post(`/tenant/${slug}/cases`, caseData);
  }

  // Calendar API
  async getCalendarEvents(slug: string, start?: string, end?: string) {
    return this.get(`/tenant/${slug}/calendar?start=${start}&end=${end}`);
  }

  async createCalendarEvent(slug: string, eventData: any) {
    return this.post(`/tenant/${slug}/calendar`, eventData);
  }

  // Document API
  async getDocuments(slug: string) {
    return this.get(`/tenant/${slug}/documents`);
  }

  async uploadDocument(slug: string, formData: FormData) {
    return this.post(`/tenant/${slug}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Invoice API
  async getInvoices(slug: string) {
    return this.get(`/tenant/${slug}/invoices`);
  }

  async createInvoice(slug: string, invoiceData: any) {
    return this.post(`/tenant/${slug}/invoices`, invoiceData);
  }

  // Agent API
  async submitAgentForm(formData: any) {
    return this.post('/agent/submit', formData);
  }

  async queryAgent(queryData: any) {
    return this.post('/agent/query', queryData);
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;
