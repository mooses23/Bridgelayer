import axios from 'axios';

class AuthApi {
  private api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });

  private accessToken: string | null = null;

  constructor() {
    // Add request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const response = await this.api.post('/auth/refresh');
            const { accessToken } = response.data;

            if (accessToken) {
              this.setToken(accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, clear token and reject
            this.clearToken();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.accessToken = token;
  }

  clearToken() {
    this.accessToken = null;
  }

  async get(url: string, config = {}) {
    return this.api.get(url, config);
  }

  async post(url: string, data = {}, config = {}) {
    return this.api.post(url, data, config);
  }

  async put(url: string, data = {}, config = {}) {
    return this.api.put(url, data, config);
  }

  async delete(url: string, config = {}) {
    return this.api.delete(url, config);
  }
}

// Development mock functions for testing
const isDevelopment = import.meta.env.DEV;

export const mockLogin = async (email: string, password: string, vertical: string) => {
  if (!isDevelopment) {
    throw new Error('Mock login only available in development');
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock successful login for admin
  if (email === 'admin@firmsync.com' && password === 'Admin123!') {
    return {
      data: {
        success: true,
        user: {
          id: 1,
          email: email,
          role: 'admin',
          vertical: vertical || 'all',
          name: 'Admin User'
        },
        token: 'mock-jwt-token-' + Date.now(),
        message: 'Login successful'
      }
    };
  }

  // Mock failed login
  throw new Error('Invalid credentials');
};

export const mockGetProfile = async () => {
  if (!isDevelopment) {
    throw new Error('Mock profile only available in development');
  }

  return {
    data: {
      id: 1,
      email: 'admin@firmsync.com',
      role: 'admin',
      vertical: 'all',
      name: 'Admin User'
    }
  };
};

export const authApi = new AuthApi();
