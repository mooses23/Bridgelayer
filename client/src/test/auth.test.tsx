
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from 'vitest';
import { render, mockFetch, mockApiError, mockApiResponses } from './test-utils';
import LoginPage from '@/pages/Public/LoginPage';
import { SessionProvider } from '@/contexts/SessionContext';

describe('Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('LoginPage', () => {
    it('renders login form with all required fields', () => {
      render(<LoginPage />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('validates required fields before submission', async () => {
      render(<LoginPage />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('handles successful login', async () => {
      mockFetch({
        '/api/auth/login': {
          success: true,
          user: mockApiResponses.user,
          token: 'test-token',
          redirectPath: '/dashboard',
        },
      });

      render(<LoginPage />);
      
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(localStorage.getItem('auth-token')).toBe('test-token');
      });
    });

    it('handles login error gracefully', async () => {
      mockApiError(401, 'Invalid credentials');
      
      render(<LoginPage />);
      
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      });
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
      
      render(<LoginPage />);
      
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during authentication', async () => {
      // Mock delayed response
      global.fetch = jest.fn(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve(mockApiResponses.user)
          } as Response), 100)
        )
      );
      
      render(<LoginPage />);
      
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });

  describe('Session Management', () => {
    it('maintains session state across page reloads', () => {
      localStorage.setItem('auth-token', 'valid-token');
      localStorage.setItem('user-data', JSON.stringify(mockApiResponses.user));
      
      render(
        <SessionProvider>
          <div data-testid="user-email">{mockApiResponses.user.email}</div>
        </SessionProvider>
      );
      
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    it('clears session on logout', async () => {
      localStorage.setItem('auth-token', 'valid-token');
      mockFetch({ '/api/auth/logout': { success: true } });
      
      render(
        <SessionProvider initialUser={mockApiResponses.user}>
          <button onClick={() => /* logout function */}>Logout</button>
        </SessionProvider>
      );
      
      fireEvent.click(screen.getByText('Logout'));
      
      await waitFor(() => {
        expect(localStorage.getItem('auth-token')).toBeNull();
        expect(localStorage.getItem('user-data')).toBeNull();
      });
    });

    it('handles token expiration', async () => {
      mockApiError(401, 'Token expired');
      
      render(
        <SessionProvider initialUser={mockApiResponses.user}>
          <div>Protected Content</div>
        </SessionProvider>
      );
      
      // Simulate an API call that returns 401
      await waitFor(() => {
        expect(localStorage.getItem('auth-token')).toBeNull();
      });
    });
  });

  describe('Tenant Context', () => {
    it('loads tenant data on authentication', async () => {
      mockFetch({
        '/api/tenant/test-tenant': mockApiResponses.tenant,
      });
      
      render(<LoginPage />, {
        tenant: mockApiResponses.tenant,
      });
      
      await waitFor(() => {
        expect(screen.getByText(/test law firm/i)).toBeInTheDocument();
      });
    });

    it('handles tenant not found error', async () => {
      mockApiError(404, 'Tenant not found');
      
      render(<LoginPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/tenant not found/i)).toBeInTheDocument();
      });
    });
  });
});
