// Router utility functions to handle path matching safely
export function safePath(path: string | undefined): string {
  if (!path || typeof path !== 'string') {
    console.warn('Invalid path provided, defaulting to root:', path);
    return '/';
  }
  return path;
}

// Enhanced path validation for wouter routing
export function validateRoutePath(path: any): boolean {
  return typeof path === 'string' && path.length > 0;
}

// Safe location hook wrapper
export function useSafeLocation(): [string, (path: string) => void] {
  try {
    const location = window.location.pathname || '/';
    const navigate = (path: string) => {
      if (validateRoutePath(path)) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };
    return [location, navigate];
  } catch (error) {
    console.error('Location error:', error);
    return ['/', () => {}];
  }
}