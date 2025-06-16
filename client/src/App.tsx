import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from "./contexts/SessionContext";
import { TenantProvider } from "./context/TenantContext";
import RoleRouter from "./components/RoleRouter";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log("[App] LIVE");

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <TenantProvider>
            <SessionProvider>
              <RoleRouter />
              <Toaster />
            </SessionProvider>
          </TenantProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}