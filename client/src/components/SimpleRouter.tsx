import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import Login from '@/pages/Login';
import Logout from '@/pages/Logout';
import Admin from '@/pages/Admin';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/not-found';

export default function SimpleRouter() {
  const { user, isLoading, isAuthenticated } = useSession();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  // Update path on browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom navigation function
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FirmSync...</p>
        </div>
      </div>
    );
  }

  // PUBLIC ROUTES - render these without any layout or authentication checks
  if (currentPath === '/login') {
    return <Login />;
  }
  
  if (currentPath === '/logout') {
    return <Logout />;
  }

  // PROTECTED ROUTES - require authentication
  if (!isAuthenticated || !user) {
    // Redirect to login for protected routes
    if (currentPath !== '/login') {
      navigate('/login');
    }
    return <Login />;
  }

  // Handle authentication redirects
  useEffect(() => {
    if (isAuthenticated && user) {
      // Admin users go to admin dashboard
      if (user.role === 'admin' && (currentPath === '/' || currentPath === '/login')) {
        navigate('/admin');
        return;
      }
      
      // Firm users
      if ((user.role === 'firm_user' || user.role === 'firm_owner' || user.role === 'firm_admin') && user.firmId) {
        if (currentPath === '/' || currentPath === '/login') {
          navigate('/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, currentPath]);

  // AUTHENTICATED ROUTES
  if (user.role === 'admin') {
    if (currentPath === '/admin' || currentPath === '/') {
      return <Admin />;
    }
    return <NotFound />;
  }

  // Firm user routes
  if (user.role === 'firm_user' || user.role === 'firm_owner' || user.role === 'firm_admin') {
    if (currentPath === '/onboarding') {
      return <Onboarding />;
    }
    
    if (currentPath === '/' || currentPath === '/dashboard') {
      return <Dashboard />;
    }
    
    return <NotFound />;
  }

  return <NotFound />;
}