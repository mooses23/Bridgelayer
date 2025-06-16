// API client with automatic JWT token inclusion
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  setDefaultHeader(key: string, value: string) {
    this.defaultHeaders[key] = value;
  }

  removeDefaultHeader(key: string) {
    delete this.defaultHeaders[key];
  }

  private static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add JWT token to Authorization header if available
    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      credentials: 'include',
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // If we get a 401, the token might be expired - remove it
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        // Optionally redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  static async post(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }
}

// Default export for convenience
export default ApiClient;