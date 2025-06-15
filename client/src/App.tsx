import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TenantProvider } from "@/context/TenantContext";
import RoleRouter from "@/components/RoleRouter";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TenantProvider>
            <RoleRouter />
            <Toaster />
          </TenantProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;