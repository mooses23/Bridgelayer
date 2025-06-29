import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, mockFetch, mockApiError, mockApiResponses } from './test-utils';
import DocumentAnalyzer from '@/components/DocumentAnalyzer';

describe('Document Analysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DocumentAnalyzer', () => {
    it('renders upload interface', () => {
      render(<DocumentAnalyzer />);
      
      expect(screen.getByText(/drop your legal document/i)).toBeInTheDocument();
      expect(screen.getByText(/select document type/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze document/i })).toBeInTheDocument();
    });

    it('handles file selection via input', async () => {
      render(<DocumentAnalyzer />);
      
      const fileInput = screen.getByLabelText(/browse/i);
      const file = new File(['test content'], 'test-nda.pdf', { type: 'application/pdf' });
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(screen.getByText(/test-nda.pdf/i)).toBeInTheDocument();
        expect(screen.getByText(/pdf/i)).toBeInTheDocument();
      });
    });

    it('handles drag and drop file upload', async () => {
      render(<DocumentAnalyzer />);
      
      const dropzone = screen.getByText(/drop your legal document/i).closest('div');
      const file = new File(['test content'], 'contract.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      
      fireEvent.dragEnter(dropzone!);
      fireEvent.dragOver(dropzone!);
      fireEvent.drop(dropzone!, {
        dataTransfer: { files: [file] },
      });
      
      await waitFor(() => {
        expect(screen.getByText(/contract.docx/i)).toBeInTheDocument();
      });
    });

    it('validates file size limits', async () => {
      render(<DocumentAnalyzer />);
      
      const fileInput = screen.getByLabelText(/browse/i);
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
      
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/file too large/i)).toBeInTheDocument();
      });
    });

    it('validates supported file types', async () => {
      render(<DocumentAnalyzer />);
      
      const fileInput = screen.getByLabelText(/browse/i);
      const unsupportedFile = new File(['test'], 'test.exe', { type: 'application/octet-stream' });
      
      fireEvent.change(fileInput, { target: { files: [unsupportedFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
      });
    });

    it('auto-suggests document type based on filename', async () => {
      render(<DocumentAnalyzer />);
      
      const fileInput = screen.getByLabelText(/browse/i);
      const ndaFile = new File(['test'], 'confidentiality-agreement.pdf', { type: 'application/pdf' });
      
      fireEvent.change(fileInput, { target: { files: [ndaFile] } });
      
      await waitFor(() => {
        expect(screen.getByDisplayValue(/nda/i)).toBeInTheDocument();
      });
    });

    it('requires document type selection for analysis', async () => {
      render(<DocumentAnalyzer />);
      
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/browse/i);
      
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      const analyzeButton = screen.getByRole('button', { name: /analyze document/i });
      fireEvent.click(analyzeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/document type.*required/i)).toBeInTheDocument();
      });
    });

    it('performs successful document analysis', async () => {
      mockFetch({
        '/api/documents/analyze': {
          success: true,
          analysis: mockApiResponses.analysisResult,
          fileName: 'test-nda.pdf',
          documentType: 'nda',
          timestamp: '2025-01-20T10:00:00Z',
        },
      });
      
      render(<DocumentAnalyzer />);
      
      // Upload file and select type
      const file = new File(['test nda content'], 'test-nda.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/browse/i);
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      const typeSelect = screen.getByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'nda' } });
      
      const analyzeButton = screen.getByRole('button', { name: /analyze document/i });
      fireEvent.click(analyzeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/analysis results/i)).toBeInTheDocument();
        expect(screen.getByText(/test document analysis summary/i)).toBeInTheDocument();
        expect(screen.getByText(/85% confidence/i)).toBeInTheDocument();
      });
    });

    it('shows analysis progress during processing', async () => {
      // Mock delayed response
      global.fetch = vi.fn(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve(mockApiResponses.analysisResult)
          } as Response), 1000)
        )
      ) as any;
      
      render(<DocumentAnalyzer />);
      
      // Upload and analyze
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/browse/i);
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      const typeSelect = screen.getByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'nda' } });
      
      const analyzeButton = screen.getByRole('button', { name: /analyze document/i });
      fireEvent.click(analyzeButton);
      
      expect(screen.getByText(/analyzing document/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(analyzeButton).toBeDisabled();
    });

    it('handles analysis errors gracefully', async () => {
      mockApiError(500, 'AI service temporarily unavailable');
      
      render(<DocumentAnalyzer />);
      
      // Upload and attempt analysis
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/browse/i);
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      const typeSelect = screen.getByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'nda' } });
      
      const analyzeButton = screen.getByRole('button', { name: /analyze document/i });
      fireEvent.click(analyzeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/ai service temporarily unavailable/i)).toBeInTheDocument();
      });
    });

    it('displays analysis results in tabbed interface', async () => {
      mockFetch({
        '/api/documents/analyze': {
          success: true,
          analysis: {
            ...mockApiResponses.analysisResult,
            extractedClauses: [
              { type: 'Confidentiality', content: 'Test clause content', location: 'Section 3' },
            ],
          },
        },
      });
      
      render(<DocumentAnalyzer />);
      
      // Complete analysis flow
      // ... upload and analyze ...
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /summary/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /key points/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /risk flags/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /extracted clauses/i })).toBeInTheDocument();
      });
      
      // Test tab navigation
      fireEvent.click(screen.getByRole('tab', { name: /key points/i }));
      expect(screen.getByText(/point 1/i)).toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('tab', { name: /extracted clauses/i }));
      expect(screen.getByText(/confidentiality/i)).toBeInTheDocument();
    });

    it('allows clearing and re-analyzing documents', async () => {
      render(<DocumentAnalyzer />);
      
      // Upload a file
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/browse/i);
      fireEvent.change(fileInput, { target: { files: [file] } });
      
      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);
      
      expect(screen.queryByText(/test.pdf/i)).not.toBeInTheDocument();
      expect(screen.getByText(/drop your legal document/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty PDF files', async () => {
      mockApiError(400, 'Document appears to be empty or unreadable');
      
      render(<DocumentAnalyzer />);
      
      const emptyFile = new File([''], 'empty.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/browse/i);
      fireEvent.change(fileInput, { target: { files: [emptyFile] } });
      
      const typeSelect = screen.getByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'nda' } });
      
      const analyzeButton = screen.getByRole('button', { name: /analyze document/i });
      fireEvent.click(analyzeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/empty or unreadable/i)).toBeInTheDocument();
      });
    });

    it('handles corrupted files', async () => {
      mockApiError(400, 'Failed to extract text from file');
      
      render(<DocumentAnalyzer />);
      
      const corruptFile = new File(['corrupted data'], 'corrupt.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/browse/i);
      fireEvent.change(fileInput, { target: { files: [corruptFile] } });
      
      const typeSelect = screen.getByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'contract' } });
      
      const analyzeButton = screen.getByRole('button', { name: /analyze document/i });
      fireEvent.click(analyzeButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to extract text/i)).toBeInTheDocument();
      });
    });

    it('handles API quota exceeded', async () => {
      mockApiError(402, 'OpenAI API quota exceeded');
      
      render(<DocumentAnalyzer />);
      
      // ... perform analysis ...
      
      await waitFor(() => {
        expect(screen.getByText(/api quota exceeded/i)).toBeInTheDocument();
        expect(screen.getByText(/contact administrator/i)).toBeInTheDocument();
      });
    });
  });
});
