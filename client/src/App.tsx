import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TenantProvider } from "@/context/TenantContext";
import RoleRouter from "@/components/RoleRouter";
import { SessionProvider } from "@/contexts/SessionContext";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <TenantProvider>
            <RoleRouter />
            <Toaster />
          </TenantProvider>
        </SessionProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;