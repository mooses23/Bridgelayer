import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import Clients from "@/pages/clients";
import Intake from "@/pages/intake";
import Billing from "@/pages/billing";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/Onboarding";
import Admin from "@/pages/Admin";
import ClientPortal from "@/pages/client-portal";
import NotFound from "@/pages/not-found";

// Tab Components
function DashboardTab() {
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
      
      case 'calendar':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar & Deadlines</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                <h4 className="font-medium text-red-900">Motion Filing Deadline</h4>
                <p className="text-sm text-red-700">Rodriguez v. TechCorp - Due Tomorrow</p>
                <button 
                  className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  onClick={() => handleAction('Open Motion Filing')}
                >
                  Open Case
                </button>
              </div>
              
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-900">Client Meeting</h4>
                <p className="text-sm text-blue-700">Emma Rodriguez - Today 3:00 PM</p>
                <button 
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  onClick={() => handleAction('Prepare Meeting Notes')}
                >
                  Prepare
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'intake':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Intake Management</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900">New Intake: Personal Injury</h4>
                  <p className="text-sm text-green-700">Sarah Johnson - Motor Vehicle Accident</p>
                  <p className="text-xs text-green-600 mt-1">Region: Cook County • Submitted 1 hour ago</p>
                  <button 
                    className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    onClick={() => handleAction('Process New Intake')}
                  >
                    Process Intake
                  </button>
                </div>
                
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Follow-up Required</h4>
                  <p className="text-sm text-blue-700">David Wilson - Contract Dispute</p>
                  <p className="text-xs text-blue-600 mt-1">Region: DuPage County • Awaiting documents</p>
                  <button 
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    onClick={() => handleAction('Follow Up on Intake')}
                  >
                    Follow Up
                  </button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <button 
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  onClick={() => handleAction('Create New Intake Form')}
                >
                  + New Intake Form
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'communications':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Communications</h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Call with Emma Rodriguez</h4>
                        <p className="text-sm text-gray-600">Discussed settlement negotiations - 45 minutes</p>
                        <p className="text-xs text-gray-500 mt-1">Today 10:30 AM • Logged by Sarah Chen</p>
                      </div>
                    </div>
                    <button 
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      onClick={() => handleAction('View Call Notes')}
                    >
                      View Notes
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Email Exchange: Michael Chen</h4>
                        <p className="text-sm text-gray-600">Contract review feedback and revisions requested</p>
                        <p className="text-xs text-gray-500 mt-1">Yesterday 4:15 PM • 3 messages</p>
                      </div>
                    </div>
                    <button 
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                      onClick={() => handleAction('View Email Thread')}
                    >
                      View Thread
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <button 
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  onClick={() => handleAction('Log New Communication')}
                >
                  + Log Communication
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'admin':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrative Controls</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Firm Management</h4>
                  <div className="space-y-2">
                    <button 
                      className="block w-full text-left bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded text-sm"
                      onClick={() => handleAction('Manage User Accounts')}
                    >
                      User Account Management
                    </button>
                    <button 
                      className="block w-full text-left bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded text-sm"
                      onClick={() => handleAction('Review Firm Settings')}
                    >
                      Firm Settings & Preferences
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">System Monitoring</h4>
                  <div className="space-y-2">
                    <button 
                      className="block w-full text-left bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded text-sm"
                      onClick={() => handleAction('View Audit Logs')}
                    >
                      Audit Trail & Activity Logs
                    </button>
                    <button 
                      className="block w-full text-left bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded text-sm"
                      onClick={() => handleAction('Check System Status')}
                    >
                      System Health & Performance
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Ghost Mode Access</h4>
                <p className="text-sm text-red-700 mb-3">Administrative simulation mode for firm workflow testing</p>
                <button 
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => handleAction('Enter Ghost Mode')}
                >
                  Enter Ghost Mode
                </button>
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
            { id: 'ai-triage', label: 'AI Triage', icon: '🤖' },
            { id: 'calendar', label: 'Calendar', icon: '📅' },
            { id: 'intake', label: 'Intake', icon: '📝' },
            { id: 'communications', label: 'Communications', icon: '💬' },
            { id: 'admin', label: 'Admin', icon: '⚙️' }
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

function DocumentsTab() {
  console.log("DocumentsTab rendered");
  return <Documents />;
}

function ClientsTab() {
  console.log("ClientsTab rendered");
  return <Clients />;
}

function IntakeTab() {
  console.log("IntakeTab rendered");
  return <Intake />;
}

function BillingTab() {
  console.log("BillingTab rendered");
  return <Billing />;
}

function SettingsTab() {
  console.log("SettingsTab rendered");
  return <Settings />;
}

function CalendarTab() {
  console.log("CalendarTab rendered");
  return <div>This is the Calendar tab.</div>;
}

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderRoute = () => {
    // Special routes (outside Layout)
    if (currentPath === '/onboarding') return <Onboarding />;
    if (currentPath === '/admin') return <Admin />;
    if (currentPath === '/client-portal') return <ClientPortal />;
    
    // Main application routes (inside Layout)
    return (
      <Layout>
        {currentPath === '/' && <DashboardTab />}
        {currentPath === '/clients' && <ClientsTab />}
        {currentPath === '/intake' && <IntakeTab />}
        {currentPath === '/documents' && <DocumentsTab />}
        {currentPath === '/billing' && <BillingTab />}
        {currentPath === '/settings' && <SettingsTab />}
        {currentPath === '/calendar' && <CalendarTab />}
        {!['/clients', '/intake', '/documents', '/billing', '/settings', '/calendar'].includes(currentPath) && currentPath !== '/' && <NotFound />}
      </Layout>
    );
  };

  return renderRoute();
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
