import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import RoleRouter from '@/components/RoleRouter';
import NotFoundPage from '@/components/NotFoundPage';
import RegisterPage from '@/pages/Public/RegisterPage';
import { SessionProvider } from '@/contexts/SessionContext';
import { TenantProvider } from '@/contexts/TenantContext';

const queryClient = new QueryClient();

function App() {
  console.log('[App] LIVE');

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;