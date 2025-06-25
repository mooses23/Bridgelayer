interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  shouldRetry?: (error: any) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  factor: 2,
  shouldRetry: (error: any) => {
    // Retry on network errors and rate limits
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // Retry on 429 (rate limit) and 5xx errors
    const status = error.status || error.statusCode;
    return status === 429 || (status >= 500 && status < 600);
  }
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let attempt = 1;
  let delay = opts.initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (
        attempt >= opts.maxAttempts ||
        !opts.shouldRetry(error)
      ) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Exponential backoff with jitter
      delay = Math.min(
        delay * opts.factor * (0.9 + Math.random() * 0.2),
        opts.maxDelay
      );
      
      attempt++;
    }
  }
}
