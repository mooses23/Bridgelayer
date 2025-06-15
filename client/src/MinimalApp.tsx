import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function MinimalDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Legal Operations Dashboard</h1>
        <p className="text-gray-600">Comprehensive view of firm activities and workflow management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Cases</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
          <p className="text-sm text-gray-600 mt-2">↑ 3 new this week</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
          <p className="text-3xl font-bold text-orange-600">7</p>
          <p className="text-sm text-gray-600 mt-2">Requires attention</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-green-600">142h</p>
          <p className="text-sm text-gray-600 mt-2">$28,400 billable</p>
        </div>
      </div>
    </div>
  );
}

function MinimalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="px-4 py-3">
              <h1 className="text-xl font-semibold text-gray-900">FIRMSYNC</h1>
            </div>
          </header>
          <main>
            <MinimalDashboard />
          </main>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default MinimalApp;