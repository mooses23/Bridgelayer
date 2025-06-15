import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Logout from '@/pages/Logout';
import Onboarding from '@/pages/Onboarding';
import Admin from '@/pages/Admin';
import Dashboard from '@/pages/dashboard';
import Documents from '@/pages/documents';
import Clients from '@/pages/clients';
import Intake from '@/pages/intake';
import Billing from '@/pages/billing';
import Settings from '@/pages/settings';
import ClientPortal from '@/pages/client-portal';
import NotFound from '@/pages/not-found';

// Tab Components for Dashboard
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

function AppRouter() {
  const { user, isLoading, isAuthenticated } = useSession();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom navigation function
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FirmSync...</p>
        </div>
      </div>
    );
  }

  // Handle authentication redirects
  useEffect(() => {
    if (!isLoading) {
      // If user is not logged in, redirect to login (except for logout page)
      if (!isAuthenticated && currentPath !== '/logout') {
        navigate('/login');
        return;
      }

      // If user is logged in, handle role-based routing
      if (isAuthenticated && user) {
        // Admin users go to admin dashboard
        if (user.role === 'admin') {
          if (currentPath === '/' || currentPath === '/login') {
            navigate('/admin');
          }
          return;
        }

        // Firm users (owners and regular users)
        if (user.role === 'firm_user' || user.role === 'firm_owner') {
          // Check if firm onboarding is incomplete
          if (user.firm && !user.firm.onboarded) {
            if (currentPath !== '/onboarding') {
              navigate('/onboarding');
            }
            return;
          }

          // If coming from login page, redirect to dashboard
          if (currentPath === '/login') {
            navigate('/');
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, user, currentPath]);

  // Render the appropriate route
  const renderRoute = () => {
    // Public routes
    if (currentPath === '/login') {
      return <Login />;
    }
    
    if (currentPath === '/logout') {
      return <Logout />;
    }

    // Protected routes - require authentication
    if (!isAuthenticated || !user) {
      return <Login />;
    }

    // Admin routes
    if (user.role === 'admin') {
      if (currentPath === '/admin' || currentPath === '/') {
        console.log('Admin page loaded');
        return <Admin />;
      }
      return <NotFound />;
    }

    // Firm user routes
    if (user.role === 'firm_user' || user.role === 'firm_owner') {
      // Onboarding flow
      if (currentPath === '/onboarding') {
        console.log('Onboarding page loaded');
        return <Onboarding />;
      }

      // Client portal (special route)
      if (currentPath === '/client-portal') {
        console.log('Client Portal page loaded');
        return <ClientPortal />;
      }

      // Main application routes (inside Layout)
      return (
        <Layout>
          {currentPath === '/' && <DashboardTab />}
          {currentPath === '/dashboard' && <DashboardTab />}
          {currentPath === '/clients' && <ClientsTab />}
          {currentPath === '/intake' && <IntakeTab />}
          {currentPath === '/documents' && <DocumentsTab />}
          {currentPath === '/billing' && <BillingTab />}
          {currentPath === '/settings' && <SettingsTab />}
          {!['/dashboard', '/clients', '/intake', '/documents', '/billing', '/settings'].includes(currentPath) && currentPath !== '/' && <NotFound />}
        </Layout>
      );
    }

    return <NotFound />;
  };

  return renderRoute();
}

export default AppRouter;