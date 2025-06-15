import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import LoginPage from '@/pages/Login';
import LogoutPage from '@/pages/LogoutPage';
import AdminLayout from '@/layouts/AdminLayout';
import OnboardingPage from '@/pages/Onboarding';
import FirmDashboardLayout from '@/layouts/FirmDashboardLayout';
import AuthDemo from '@/components/AuthDemo';

export default function AppRouter() {
  const { user, firm, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  // Update path on browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Show loading spinner while checking authentication state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Handle public routes (no authentication required)
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/logout') {
    return <LogoutPage />;
  }

  if (currentPath === '/auth-demo') {
    return <AuthDemo />;
  }

  // Redirect to login if no user is authenticated
  if (!user) {
    // Redirect to login for protected routes
    if (currentPath !== '/login') {
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
    }
    return <LoginPage />;
  }

  // Admin users get admin layout
  if (user.role === 'admin') {
    return <AdminLayout />;
  }

  // Firm users without onboarded firm go to onboarding
  if (!firm?.onboarded) {
    return <OnboardingPage />;
  }

  // Onboarded firm users get the main dashboard layout
  return <FirmDashboardLayout />;
}