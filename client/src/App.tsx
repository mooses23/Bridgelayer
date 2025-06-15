import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/contexts/SessionContext";
import SimpleRouter from "@/components/SimpleRouter";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <TooltipProvider>
          <Toaster />
          <SimpleRouter />
        </TooltipProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;