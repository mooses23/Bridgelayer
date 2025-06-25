import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboardLayout from '../AdminDashboardLayout';
import { useLocation } from 'wouter';

// Mock wouter's useLocation
vi.mock('wouter', () => ({
  useLocation: vi.fn(() => ['/admin', () => {}]),
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
}));

// Mock the auth hook
vi.mock('@/lib/auth', () => ({
  useSession: () => ({
    user: {
      firstName: 'John',
      email: 'john@example.com'
    },
    logout: vi.fn()
  })
}));

describe('AdminDashboardLayout', () => {
  it('renders all navigation items', () => {
    render(
      <AdminDashboardLayout>
        <div>Content</div>
      </AdminDashboardLayout>
    );

    // Check all nav items are present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Firms')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Doc+')).toBeInTheDocument();
    expect(screen.getByText('LLM')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows active state for current route', () => {
    (useLocation as any).mockImplementation(() => ['/admin', () => {}]);
    
    render(
      <AdminDashboardLayout>
        <div>Content</div>
      </AdminDashboardLayout>
    );

    // Home should have active classes
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('toggles mobile sidebar', () => {
    render(
      <AdminDashboardLayout>
        <div>Content</div>
      </AdminDashboardLayout>
    );

    // Initially sidebar is closed on mobile
    const sidebar = screen.getByRole('navigation').parentElement;
    expect(sidebar).toHaveClass('-translate-x-full');

    // Open sidebar
    fireEvent.click(screen.getByLabelText('Open sidebar'));
    expect(sidebar).toHaveClass('translate-x-0');

    // Close sidebar
    fireEvent.click(screen.getByLabelText('Close sidebar'));
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('renders user information', () => {
    render(
      <AdminDashboardLayout>
        <div>Content</div>
      </AdminDashboardLayout>
    );

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <AdminDashboardLayout>
        <div>Test Content</div>
      </AdminDashboardLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
