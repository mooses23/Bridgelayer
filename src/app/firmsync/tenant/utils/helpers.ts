/**
 * FirmSync Tenant Utility Functions
 * Helper functions for the FirmSync tenant application
 */

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Validate URL for iframe safety
export function isValidIframeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Only allow https URLs for security
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

// Generate unique case/client IDs
export function generateId(prefix: string = 'FS'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`;
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
