import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";

// Enhanced Interactive Dashboard Component
function EnhancedDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [lastAction, setLastAction] = useState('');

  const handleAction = (action: string) => {
    setLastAction(`Action: ${action} at ${new Date().toLocaleTimeString()}`);
    console.log(`Dashboard action: ${action}`);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAction('View Active Cases')}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Cases</h3>
                <p className="text-3xl font-bold text-blue-600">24</p>
                <p className="text-sm text-gray-600 mt-2">↑ 3 new this week</p>
              </div>
              
              <div 
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAction('Review Pending Documents')}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
                <p className="text-3xl font-bold text-orange-600">7</p>
                <p className="text-sm text-gray-600 mt-2">Requires attention</p>
              </div>
              
              <div 
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAction('Check Billable Hours')}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
                <p className="text-3xl font-bold text-green-600">142h</p>
                <p className="text-sm text-gray-600 mt-2">$28,400 billable</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded cursor-pointer"
                     onClick={() => handleAction('View Document: NDA Review')}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">NDA Document Review Completed</p>
                    <p className="text-xs text-gray-500">Emma Rodriguez - 2 hours ago</p>
                  </div>
                  <span className="text-green-600 text-sm">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded cursor-pointer"
                     onClick={() => handleAction('View Client Communication')}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Client Communication Logged</p>
                    <p className="text-xs text-gray-500">Michael Chen - 3 hours ago</p>
                  </div>
                  <span className="text-blue-600 text-sm">📞 Call</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'ai-triage':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Document Triage</h3>
            <div className="space-y-4">
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Employment Agreement - TechCorp</h4>
                    <p className="text-sm text-gray-600">Priority: High • Risk Level: Medium</p>
                  </div>
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => handleAction('Review High Priority Document')}
                  >
                    Review Now
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Service Agreement - ClientCo</h4>
                    <p className="text-sm text-gray-600">Priority: Normal • Risk Level: Low</p>
                  </div>
                  <button 
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    onClick={() => handleAction('Queue Standard Review')}
                  >
                    Queue
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Legal Operations Dashboard</h1>
        <p className="text-gray-600">Comprehensive view of firm activities and workflow management</p>
      </div>

      {lastAction && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">{lastAction}</p>
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'ai-triage', label: 'AI Triage', icon: '🤖' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSection(tab.id);
                handleAction(`Switch to ${tab.label} section`);
              }}
              className={`${
                activeSection === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {renderActiveSection()}
    </div>
  );
}

function SimpleApp() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <EnhancedDashboard />;
      case 'clients':
        return <div className="p-6"><h1 className="text-2xl font-bold">Clients</h1><p>Client management interface</p></div>;
      case 'documents':
        return <div className="p-6"><h1 className="text-2xl font-bold">Documents</h1><p>Document analysis and management</p></div>;
      case 'intake':
        return <div className="p-6"><h1 className="text-2xl font-bold">Intake</h1><p>Client intake and case management</p></div>;
      case 'billing':
        return <div className="p-6"><h1 className="text-2xl font-bold">Billing</h1><p>Time tracking and invoicing</p></div>;
      case 'settings':
        return <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Application configuration</p></div>;
      default:
        return <EnhancedDashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Layout currentView={currentView} onNavigate={setCurrentView}>
          {renderView()}
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default SimpleApp;