import React, { useEffect, useState } from 'react';

// Safe routing component that handles undefined path values
export function SafeRouter({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState('/');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updatePath = () => {
      try {
        const path = window.location.pathname || '/';
        setCurrentPath(path);
        setError(null);
      } catch (err) {
        console.error('Path update error:', err);
        setError('Navigation error');
      }
    };

    // Initial path
    updatePath();

    // Listen for navigation changes
    const handlePopState = () => updatePath();
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">Navigation Error</h1>
          <p className="text-gray-600 mt-2">Please refresh the page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Safe navigation function
export function safeNavigate(path: string) {
  try {
    if (!path || typeof path !== 'string') {
      console.warn('Invalid navigation path:', path);
      return;
    }
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  } catch (error) {
    console.error('Navigation error:', error);
  }
}