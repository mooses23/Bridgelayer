import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from '@/contexts/SessionContext';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/Login/Login';
import ModernAdminLayout from '@/layouts/ModernAdminLayout';
import FirmLayout from '@/layouts/FirmLayout';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const queryClient = new QueryClient();

function RequireAuth({ children, role }: { children: React.ReactNode; role?: 'admin' | 'firm_user' }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary fallback={<div className="p-8 text-center"><h1>Error Loading App</h1></div>}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <SessionProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin/*" 
                  element={
                    <RequireAuth role="admin">
                      <ModernAdminLayout />
                    </RequireAuth>
                  } 
                />
                
                {/* Tenant Routes (FirmSync Portal) */}
                <Route 
                  path="/tenant/*" 
                  element={
                    <RequireAuth role="firm_user">
                      <FirmLayout />
                    </RequireAuth>
                  } 
                />
                
                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" />} />
              </Routes>
              
              <Toaster />
            </div>
          </SessionProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;