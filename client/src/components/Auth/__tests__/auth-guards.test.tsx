import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { useSession } from '@/hooks/useSession';
import { 
  ProtectedRoute, 
  ProtectedAdminRoute, 
  OnboardingGuard, 
  PublicRoute 
} from '.';

// Mock useSession hook
vi.mock('@/hooks/useSession');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Test components
const TestComponent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;
const DashboardPage = () => <div>Dashboard Page</div>;
const AdminPage = () => <div>Admin Page</div>;

describe('Auth Route Guards', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('ProtectedRoute', () => {
    it('should show loading state', () => {
      mockUseSession.mockReturnValue({
        user: null,
        isLoading: true,
        error: null,
        isAdmin: false
      } as any);

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should redirect unauthorized users to login', () => {
      mockUseSession.mockReturnValue({
        user: null,
        isLoading: false,
        error: null,
        isAdmin: false
      } as any);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should render children for authenticated users', () => {
      mockUseSession.mockReturnValue({
        user: { id: 1, email: 'user@example.com' },
        isLoading: false,
        error: null,
        isAdmin: false
      } as any);

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('ProtectedAdminRoute', () => {
    it('should redirect non-admin users to dashboard', () => {
      mockUseSession.mockReturnValue({
        user: { id: 1, email: 'user@example.com' },
        isLoading: false,
        error: null,
        isAdmin: false
      } as any);

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminPage />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('should allow admin users to access admin routes', () => {
      mockUseSession.mockReturnValue({
        user: { id: 1, email: 'admin@example.com', role: 'admin' },
        isLoading: false,
        error: null,
        isAdmin: true
      } as any);

      render(
        <MemoryRouter>
          <ProtectedAdminRoute>
            <AdminPage />
          </ProtectedAdminRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Page')).toBeInTheDocument();
    });
  });

  describe('OnboardingGuard', () => {
    it('should redirect completed users to dashboard', () => {
      mockUseSession.mockReturnValue({
        user: { 
          id: 1, 
          email: 'user@example.com',
          firm: { onboarded: true } 
        },
        isLoading: false,
        error: null,
        isAdmin: false
      } as any);

      render(
        <MemoryRouter initialEntries={['/onboarding/1']}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route 
              path="/onboarding/:step" 
              element={
                <OnboardingGuard>
                  <TestComponent />
                </OnboardingGuard>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('should prevent skipping onboarding steps', async () => {
      mockUseSession.mockReturnValue({
        user: { 
          id: 1, 
          email: 'user@example.com',
          firm: { 
            onboarded: false,
            onboardingStep: 1
          } 
        },
        isLoading: false,
        error: null,
        isAdmin: false
      } as any);

      render(
        <MemoryRouter initialEntries={['/onboarding/3']}>
          <Routes>
            <Route 
              path="/onboarding/:step" 
              element={
                <OnboardingGuard>
                  <TestComponent />
                </OnboardingGuard>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/onboarding/1');
      });
    });
  });

  describe('PublicRoute', () => {
    it('should redirect authenticated users to dashboard', () => {
      mockUseSession.mockReturnValue({
        user: { id: 1, email: 'user@example.com' },
        isLoading: false,
        error: null,
        isAdmin: false
      } as any);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('should redirect admin users to admin dashboard', () => {
      mockUseSession.mockReturnValue({
        user: { id: 1, email: 'admin@example.com', role: 'admin' },
        isLoading: false,
        error: null,
        isAdmin: true
      } as any);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Page')).toBeInTheDocument();
    });
  });
});
