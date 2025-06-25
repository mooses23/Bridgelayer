import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { AuthErrorBoundary } from '@/components/Auth/AuthErrorBoundary';
import RoleRouter from '@/components/RoleRouter';
import RegisterPage from '@/duplicates/Public/RegisterPage';
import { SessionProvider } from '@/contexts/SessionContext';
import { TenantProvider } from './contexts/TenantContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  console.log('[App] LIVE');

  return (
    <ErrorBoundary fallback={<div style={{padding: '20px', textAlign: 'center'}}><h1>Error Loading App</h1><p>Check browser console for details</p></div>}>
      <QueryClientProvider client={queryClient}>
        <AuthErrorBoundary>
          <SessionProvider>
            <TenantProvider>
              <Router>
                <div className="min-h-screen bg-gray-50">
                  <Switch>
                    <Route path="/register" component={RegisterPage} />
                    <Route path="*" component={RoleRouter} />
                  </Switch>
                  <Toaster />
                </div>
              </Router>
            </TenantProvider>
          </SessionProvider>
        </AuthErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;