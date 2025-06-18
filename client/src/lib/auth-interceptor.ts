import { useSession } from '@/contexts/SessionContext';

export interface AuthInterceptorConfig {
  retryAttempts?: number;
  retryDelay?: number;
  enableLogging?: boolean;
}

export class AuthInterceptor {
  private config: AuthInterceptorConfig;
  private refreshing = false;
  private refreshQueue: Array<(success: boolean) => void> = [];

  constructor(config: AuthInterceptorConfig = {}) {
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      enableLogging: true,
      ...config
    };
  }

  /**
   * Enhanced fetch wrapper with authentication and error handling
   */
  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const { retryAttempts = 3, enableLogging = true } = this.config;

    // Ensure credentials are included for authentication
    const requestOptions: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (enableLogging) {
      console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        // Handle authentication errors
        if (response.status === 401) {
          if (enableLogging) {
            console.log(`🔐 Authentication failed for ${url}, attempting refresh...`);
          }
          
          // Try to refresh authentication
          const refreshed = await this.handleAuthRefresh();
          
          if (refreshed && attempt < retryAttempts) {
            if (enableLogging) {
              console.log(`🔄 Retrying request after refresh (attempt ${attempt + 1})`);
            }
            continue;
          }
        }

        // Handle other HTTP errors
        if (!response.ok && response.status >= 500) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        if (enableLogging && response.ok) {
          console.log(`✅ API Success: ${response.status} ${url}`);
        }

        return response;

      } catch (error) {
        lastError = error as Error;
        
        if (enableLogging) {
          console.log(`❌ API Error (attempt ${attempt}/${retryAttempts}):`, error);
        }

        // Don't retry on client errors (4xx except 401)
        if (error instanceof TypeError || (error as any).status < 500) {
          break;
        }

        if (attempt < retryAttempts) {
          await this.delay(this.config.retryDelay! * attempt);
        }
      }
    }

    throw lastError || new Error('Request failed after maximum retries');
  }

  /**
   * Handle authentication refresh
   */
  private async handleAuthRefresh(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshing) {
      return new Promise<boolean>((resolve) => {
        this.refreshQueue.push(resolve);
      });
    }

    this.refreshing = true;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      const success = response.ok;
      
      // Resolve all queued requests
      this.refreshQueue.forEach(resolve => resolve(success));
      this.refreshQueue = [];
      
      return success;

    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Resolve all queued requests with failure
      this.refreshQueue.forEach(resolve => resolve(false));
      this.refreshQueue = [];
      
      return false;
    } finally {
      this.refreshing = false;
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request with authentication
   */
  async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request with authentication
   */
  async post(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : options.body,
    });
  }

  /**
   * PUT request with authentication
   */
  async put(url: string, data?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : options.body,
    });
  }

  /**
   * DELETE request with authentication
   */
  async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// Global interceptor instance
export const authInterceptor = new AuthInterceptor({
  retryAttempts: 3,
  retryDelay: 1000,
  enableLogging: process.env.NODE_ENV === 'development'
});

/**
 * React hook for authenticated API requests
 */
export function useAuthenticatedRequest() {
  const { refreshSession } = useSession();

  const request = async (url: string, options: RequestInit = {}) => {
    try {
      return await authInterceptor.request(url, options);
    } catch (error) {
      // If authentication fails, trigger session refresh
      if ((error as any)?.status === 401) {
        await refreshSession();
      }
      throw error;
    }
  };

  return {
    request,
    get: (url: string, options?: RequestInit) => request(url, { ...options, method: 'GET' }),
    post: (url: string, data?: any, options?: RequestInit) => 
      request(url, { 
        ...options, 
        method: 'POST',
        body: data ? JSON.stringify(data) : options?.body 
      }),
    put: (url: string, data?: any, options?: RequestInit) => 
      request(url, { 
        ...options, 
        method: 'PUT',
        body: data ? JSON.stringify(data) : options?.body 
      }),
    delete: (url: string, options?: RequestInit) => request(url, { ...options, method: 'DELETE' }),
  };
}