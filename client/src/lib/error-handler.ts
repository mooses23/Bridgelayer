import { toast } from '@/hooks/use-toast';

export interface APIError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp?: string;
}

export class AuthenticationError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public status: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Parse API response and handle errors
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  try {
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw createErrorFromResponse(response, data);
      }
      
      return data;
    } else {
      const text = await response.text();
      
      if (!response.ok) {
        throw createErrorFromResponse(response, { message: text });
      }
      
      return text as unknown as T;
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'SyntaxError') {
      throw error;
    }
    
    throw new NetworkError(`Failed to parse response: ${error}`);
  }
}

/**
 * Create appropriate error type from response
 */
function createErrorFromResponse(response: Response, data: any): Error {
  const message = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
  
  switch (response.status) {
    case 401:
      return new AuthenticationError(message, response.status);
    case 403:
      return new AuthorizationError(message, response.status);
    case 422:
      return new ValidationError(message, data?.errors || {});
    case 400:
    case 404:
    case 409:
      return new Error(message);
    default:
      return new NetworkError(message, response.status);
  }
}

/**
 * Global error handler for authentication errors
 */
export function handleAuthError(error: Error): void {
  console.error('Authentication error:', error);
  
  if (error instanceof AuthenticationError) {
    toast({
      title: 'Authentication Required',
      description: 'Please log in to continue.',
      variant: 'destructive',
    });
    
    // Trigger logout or redirect to login
    window.location.href = '/login';
  } else if (error instanceof AuthorizationError) {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to perform this action.',
      variant: 'destructive',
    });
  } else if (error instanceof ValidationError) {
    toast({
      title: 'Validation Error',
      description: error.message,
      variant: 'destructive',
    });
  } else if (error instanceof NetworkError) {
    toast({
      title: 'Network Error',
      description: 'Please check your connection and try again.',
      variant: 'destructive',
    });
  } else {
    toast({
      title: 'Unexpected Error',
      description: 'Something went wrong. Please try again.',
      variant: 'destructive',
    });
  }
}

/**
 * Error boundary handler for React components
 */
export function handleComponentError(error: Error, errorInfo: any): void {
  console.error('Component error:', error, errorInfo);
  
  // Log to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
    console.error('Production error logged:', { error, errorInfo });
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry authentication errors
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Safe async function wrapper
 */
export function safeAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleAuthError(error as Error);
      return null;
    }
  };
}

/**
 * API client with error handling
 */
export class APIClient {
  private baseURL: string;
  
  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    try {
      const response = await fetch(url, config);
      return await parseApiResponse<T>(response);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        // Attempt to refresh authentication
        try {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          
          if (refreshResponse.ok) {
            // Retry original request
            const retryResponse = await fetch(url, config);
            return await parseApiResponse<T>(retryResponse);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      
      throw error;
    }
  }
  
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Global API client instance
export const apiClient = new APIClient();