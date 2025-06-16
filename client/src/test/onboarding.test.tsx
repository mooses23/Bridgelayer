
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from 'vitest';
import { render, mockFetch, mockApiError } from './test-utils';
import OnboardingWizard from '@/pages/Onboarding/OnboardingWizard';

describe('Onboarding Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OnboardingWizard', () => {
    it('renders all onboarding steps', () => {
      render(<OnboardingWizard />);
      
      expect(screen.getByText(/firm info/i)).toBeInTheDocument();
      expect(screen.getByText(/branding/i)).toBeInTheDocument();
      expect(screen.getByText(/preferences/i)).toBeInTheDocument();
      expect(screen.getByText(/integrations/i)).toBeInTheDocument();
      expect(screen.getByText(/review/i)).toBeInTheDocument();
    });

    it('validates required fields in firm info step', async () => {
      render(<OnboardingWizard />);
      
      // Try to proceed without filling required fields
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/firm name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/admin email is required/i)).toBeInTheDocument();
      });
    });

    it('prevents proceeding without accepting legal agreements', async () => {
      render(<OnboardingWizard />);
      
      // Fill in required fields but don't accept agreements
      fireEvent.change(screen.getByLabelText(/firm name/i), {
        target: { value: 'Test Law Firm' },
      });
      fireEvent.change(screen.getByLabelText(/admin email/i), {
        target: { value: 'admin@testfirm.com' },
      });
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/must accept terms/i)).toBeInTheDocument();
        expect(screen.getByText(/must accept nda/i)).toBeInTheDocument();
      });
    });

    it('successfully completes firm info step', async () => {
      render(<OnboardingWizard />);
      
      // Fill in all required fields
      fireEvent.change(screen.getByLabelText(/firm name/i), {
        target: { value: 'Test Law Firm' },
      });
      fireEvent.change(screen.getByLabelText(/admin email/i), {
        target: { value: 'admin@testfirm.com' },
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '555-0123' },
      });
      
      // Accept legal agreements
      fireEvent.click(screen.getByLabelText(/accept terms/i));
      fireEvent.click(screen.getByLabelText(/accept nda/i));
      
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/branding/i)).toBeInTheDocument();
      });
    });

    it('handles file upload in branding step', async () => {
      render(<OnboardingWizard />);
      
      // Navigate to branding step (assume firm info is filled)
      // ... navigation logic ...
      
      const fileInput = screen.getByLabelText(/upload logo/i);
      const file = new File(['logo content'], 'logo.png', { type: 'image/png' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/logo.png/i)).toBeInTheDocument();
      });
    });

    it('saves progress automatically', async () => {
      mockFetch({
        '/api/admin/onboarding/save-progress': {
          success: true,
          sessionId: 'test-session-123',
        },
      });
      
      render(<OnboardingWizard />);
      
      fireEvent.change(screen.getByLabelText(/firm name/i), {
        target: { value: 'Test Law Firm' },
      });
      
      // Auto-save should trigger after a delay
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/onboarding/save-progress',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Test Law Firm'),
          })
        );
      }, { timeout: 3000 });
    });

    it('handles practice area selection', async () => {
      render(<OnboardingWizard />);
      
      // Navigate to preferences step
      // ... navigation logic ...
      
      const practiceAreas = [
        'Corporate Law',
        'Criminal Defense',
        'Family Law',
        'Personal Injury',
      ];
      
      practiceAreas.forEach(area => {
        fireEvent.click(screen.getByLabelText(area));
      });
      
      expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(4);
    });

    it('completes onboarding successfully', async () => {
      mockFetch({
        '/api/admin/onboarding/complete': {
          success: true,
          firm: { id: 1, name: 'Test Law Firm', slug: 'test-law-firm' },
          user: { id: 1, email: 'admin@testfirm.com' },
          redirectUrl: '/dashboard',
        },
      });
      
      render(<OnboardingWizard />);
      
      // Fill in complete onboarding data and submit
      // ... complete form filling logic ...
      
      const completeButton = screen.getByRole('button', { name: /complete setup/i });
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/setup complete/i)).toBeInTheDocument();
        expect(screen.getByText(/test law firm/i)).toBeInTheDocument();
      });
    });

    it('handles onboarding completion errors', async () => {
      mockApiError(500, 'Failed to create firm');
      
      render(<OnboardingWizard />);
      
      // Complete form and attempt submission
      // ... form completion logic ...
      
      const completeButton = screen.getByRole('button', { name: /complete setup/i });
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to create firm/i)).toBeInTheDocument();
      });
    });

    it('shows loading states during submission', async () => {
      // Mock delayed response
      global.fetch = jest.fn(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true })
          } as Response), 1000)
        )
      );
      
      render(<OnboardingWizard />);
      
      // ... complete form and submit ...
      
      const completeButton = screen.getByRole('button', { name: /complete setup/i });
      fireEvent.click(completeButton);
      
      expect(screen.getByText(/creating firm/i)).toBeInTheDocument();
      expect(completeButton).toBeDisabled();
    });
  });

  describe('Step Navigation', () => {
    it('allows navigation between completed steps', async () => {
      render(<OnboardingWizard />);
      
      // Complete first step
      // ... fill form and proceed ...
      
      // Should be able to go back to previous step
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);
      
      expect(screen.getByText(/firm info/i)).toBeInTheDocument();
    });

    it('prevents skipping incomplete steps', () => {
      render(<OnboardingWizard />);
      
      // Try to click on step 3 without completing steps 1 and 2
      const step3 = screen.getByText(/preferences/i);
      fireEvent.click(step3);
      
      // Should remain on current step
      expect(screen.getByText(/firm info/i)).toBeInTheDocument();
    });
  });
});
