import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';

expect.extend(matchers);

// Global test setup
beforeEach(() => {
  // Reset DOM state
  document.head.innerHTML = '';
  document.body.innerHTML = '';

  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock File and FileReader
  global.File = vi.fn().mockImplementation((chunks: any[], filename: string, options: any) => ({
    name: filename,
    size: chunks.reduce((total: number, chunk: any) => total + chunk.length, 0),
    type: options?.type || 'text/plain',
    lastModified: Date.now(),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    text: vi.fn().mockResolvedValue(chunks.join('')),
  }));

  (global.FileReader as any) = vi.fn().mockImplementation(() => ({
    readAsText: vi.fn(),
    readAsDataURL: vi.fn(),
    readAsArrayBuffer: vi.fn(),
    onload: null,
    onerror: null,
    result: null,
  }));

  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn().mockReturnValue('mock-object-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock fetch globally (can be overridden in individual tests)
  global.fetch = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// Custom matchers for testing
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      message: () => `expected ${received} to be a valid email address`,
      pass,
    };
  },

  toHaveValidationError(received: HTMLElement, error: string) {
    const errorElement = received.querySelector(`[data-testid="error"]`) ||
                        received.querySelector(`.error`) ||
                        received.parentElement?.querySelector(`.error`);

    const pass = errorElement?.textContent?.includes(error) || false;

    return {
      message: () => `expected validation error "${error}" to be present`,
      pass,
    };
  },

  toBeLoading(received: HTMLElement) {
    const hasLoadingText = received.textContent?.toLowerCase().includes('loading') ||
                          received.textContent?.toLowerCase().includes('analyzing') ||
                          received.textContent?.toLowerCase().includes('processing');

    const hasSpinner = received.querySelector('[data-testid="spinner"]') ||
                      received.querySelector('.loading-spinner') ||
                      received.querySelector('.animate-spin');

    const isDisabled = received.hasAttribute('disabled');

    const pass = Boolean((hasLoadingText || hasSpinner) && isDisabled);

    return {
      message: () => `expected element to be in loading state`,
      pass,
    };
  },
});

// Extend TypeScript definitions
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidEmail(): T;
    toHaveValidationError(error: string): T;
    toBeLoading(): T;
  }
}