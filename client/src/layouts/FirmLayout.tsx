import React from 'react';
import { Route, Switch } from 'wouter';
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/SessionContext';

// Import firm portal pages - now from tenant/[slug]
import DashboardPage from '@/pages/tenant/[slug]/dashboard';
import DocumentsPage from '@/pages/tenant/[slug]/documents';
import BillingPage from '@/pages/tenant/[slug]/billing';
import SettingsPage from '@/pages/tenant/[slug]/settings';
import CasesPage from '@/pages/tenant/[slug]/cases';
import ClientsPage from '@/pages/tenant/[slug]/clients';
import CalendarPage from '@/pages/tenant/[slug]/calendar';
import ParalegalPage from '@/pages/tenant/[slug]/paralegal';

// Layout for tenant portal (/tenant/[slug]/*)
export default function FirmLayout() {
  const { user, logout } = useSession();

  // Get tenant slug from user context or URL
  const tenantSlug = user?.firmId || 'default'; // fallback

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">FirmSync Portal</h1>
              {user?.firmId && (
                <span className="text-sm text-gray-500">Firm ID: {user.firmId}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href={`/tenant/${tenantSlug}/dashboard`}
              className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium"
            >
              Dashboard
            </a>
            <a
              href={`/tenant/${tenantSlug}/clients`}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              Clients
            </a>
            <a
              href={`/tenant/${tenantSlug}/cases`}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              Cases
            </a>
            <a
              href={`/tenant/${tenantSlug}/calendar`}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              Calendar
            </a>
            <a
              href={`/tenant/${tenantSlug}/paralegal`}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              Paralegal+
            </a>
            <a
              href={`/tenant/${tenantSlug}/billing`}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              Billing
            </a>
            <a
              href={`/tenant/${tenantSlug}/settings`}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700"
            >
              Settings
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Switch>
          <Route path={`/tenant/${tenantSlug}/dashboard`} component={DashboardPage} />
          <Route path={`/tenant/${tenantSlug}/clients`} component={ClientsPage} />
          <Route path={`/tenant/${tenantSlug}/cases`} component={CasesPage} />
          <Route path={`/tenant/${tenantSlug}/calendar`} component={CalendarPage} />
          <Route path={`/tenant/${tenantSlug}/paralegal`} component={ParalegalPage} />
          <Route path={`/tenant/${tenantSlug}/billing`} component={BillingPage} />
          <Route path={`/tenant/${tenantSlug}/settings`} component={SettingsPage} />
          <Route path={`/tenant/${tenantSlug}/documents`} component={DocumentsPage} />
          <Route>
            <DashboardPage />
          </Route>
        </Switch>
      </main>
    </div>
  );
}

// Placeholder components for firm portal pages
function FirmDashboardPage() {
  const { user } = useSession();
  
  // Get firm code from user's firm data
  const firmCode = user?.firm?.slug || user?.firmId?.toString() || 'unknown';
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', firmCode],
    queryFn: () => 
      fetch(`/api/app/dashboard/${firmCode}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject(res)),
    enabled: !!firmCode && firmCode !== 'unknown'
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalCases: 0,
    totalDocuments: 0,
    monthlyRevenue: 0,
    activeTasks: 0
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.firstName}!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalCases}</p>
            <p className="text-sm text-gray-500">Active cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalDocuments}</p>
            <p className="text-sm text-gray-500">Total documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeTasks}</p>
            <p className="text-sm text-gray-500">Active tasks</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FirmDocumentsPage() {
  const { user } = useSession();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [documentToReview, setDocumentToReview] = useState<any>(null);
  const [reviewSuggestions, setReviewSuggestions] = useState(null);
  
  const firmCode = user?.firm?.slug || user?.firmId?.toString() || 'unknown';
  
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['documents', firmCode],
    queryFn: () => 
      fetch(`/api/app/documents/${firmCode}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject(res)),
    enabled: !!firmCode && firmCode !== 'unknown'
  });

  const { data: templatesData } = useQuery({
    queryKey: ['document-templates', firmCode],
    queryFn: () => 
      fetch(`/api/app/templates/${firmCode}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject(res)),
    enabled: !!firmCode && firmCode !== 'unknown'
  });

  const handleGenerateDocument = async () => {
    if (!selectedTemplate) {
      alert('Please select a template first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/app/documents/${firmCode}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          templateId: selectedTemplate,
          firmCode
        })
      });

      if (response.ok) {
        // Refresh documents list
        window.location.reload();
      } else {
        alert('Failed to generate document');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenReviewModal = (document: any) => {
    setDocumentToReview(document);
    setIsReviewModalOpen(true);
  };

  const handleReview = (suggestions: any) => {
    setReviewSuggestions(suggestions);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading documents..." size="md" fullScreen={false} />;
  }

  const documents = documentsData?.documents || [];
  const templates = templatesData?.templates || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <div className="flex gap-3 items-center">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Template</option>
            {templates.map((template: any) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleGenerateDocument}
            disabled={isGenerating || !selectedTemplate}
          >
            {isGenerating ? 'Generating...' : 'Generate Document'}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No documents generated yet.</p>
              <p className="text-sm text-gray-400 mt-2">Use the Generate Document button to create your first document.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{doc.name || `Document ${index + 1}`}</h3>
                    <p className="text-sm text-gray-500">{doc.type || 'Unknown type'}</p>
                    <p className="text-xs text-gray-400">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                    <Button 
                      onClick={() => handleOpenReviewModal(doc)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Review Modal */}
      <AIReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        documentText={documentToReview?.content || ''}
        onReview={handleReview}
      />

      {/* AI Review Results */}
      {reviewSuggestions && (
        <AIReviewResults 
          suggestions={reviewSuggestions} 
          onClose={() => setReviewSuggestions(null)} 
        />
      )}
    </div>
  );
}

function FirmBillingPage() {
  const { user } = useSession();
  
  const firmCode = user?.firm?.slug || user?.firmId?.toString() || 'unknown';
  
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billing', firmCode],
    queryFn: () => 
      fetch(`/api/app/billing/${firmCode}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : Promise.reject(res)),
    enabled: !!firmCode && firmCode !== 'unknown'
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading billing data..." size="md" fullScreen={false} />;
  }

  const invoices = billingData?.invoices || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Invoices & Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No invoices found.</p>
              <p className="text-sm text-gray-400 mt-2">Invoices will appear here once you start billing clients.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Invoice #{invoice.number || index + 1}</h3>
                    <p className="text-sm text-gray-500">{invoice.status || 'Pending'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${invoice.amount || '0.00'}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FirmSettingsPage() {
  const { user } = useSession();
  const [firmSettings, setFirmSettings] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    practiceAreas: [],
    billingSettings: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.firmId) {
      fetch(`/api/app/profile/${user.firmId}`, {
        credentials: 'include'
      })
        .then(res => res.ok ? res.json() : {})
        .then((data: any) => {
          if (data?.firm) {
            setFirmSettings({
              name: data.firm.name || '',
              email: data.firm.email || '',
              phone: data.firm.phone || '',
              address: data.firm.address || '',
              practiceAreas: data.firm.practiceAreas || [],
              billingSettings: data.firm.billingSettings || {}
            });
          }
        })
        .catch(err => console.error('Error loading firm settings:', err))
        .finally(() => setIsLoading(false));
    }
  }, [user?.firmId]);

  const handleSave = async () => {
    if (!user?.firmId) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/app/profile/${user.firmId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(firmSettings)
      });

      if (response.ok) {
        // Show success message
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Firm Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Firm Name
            </label>
            <input
              type="text"
              value={firmSettings.name}
              onChange={(e) => setFirmSettings((prev: any) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={firmSettings.email}
              onChange={(e) => setFirmSettings((prev: any) => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={firmSettings.phone}
              onChange={(e) => setFirmSettings((prev: any) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={firmSettings.address}
              onChange={(e) => setFirmSettings((prev: any) => ({ ...prev, address: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">User Role</h3>
              <p className="text-gray-600">{user?.role}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Firm ID</h3>
              <p className="text-gray-600">{user?.firmId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AIReviewModal({ isOpen, onClose, documentText, onReview }: {
  isOpen: boolean;
  onClose: () => void;
  documentText?: string;
  onReview: (suggestions: any) => void;
}) {
  const [reviewText, setReviewText] = useState(documentText || '');
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReview = async () => {
    if (!reviewText.trim()) {
      alert('Please enter some text to review');
      return;
    }

    setIsReviewing(true);
    try {
      const response = await fetch('/api/app/ai/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          documentText: reviewText,
          documentType: 'general'
        })
      });

      if (response.ok) {
        const result = await response.json();
        onReview(result.suggestions);
        onClose();
      } else {
        alert('Failed to get AI review');
      }
    } catch (error) {
      console.error('Error getting AI review:', error);
      alert('Error getting AI review');
    } finally {
      setIsReviewing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">AI Document Review</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Text
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Paste your document text here for AI review..."
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleReview} 
              disabled={isReviewing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isReviewing ? 'Reviewing...' : 'Get AI Review'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIReviewResults({ suggestions, onClose }: {
  suggestions: any;
  onClose: () => void;
}) {
  if (!suggestions) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">AI Review Results</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Confidence Score:</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {Math.round((suggestions.confidence || 0.85) * 100)}%
            </span>
          </div>

          {suggestions.issues && suggestions.issues.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Issues Found</h3>
              <ul className="space-y-2">
                {suggestions.issues.map((issue: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">⚠️</span>
                    <span className="text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.improvements && suggestions.improvements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Suggestions</h3>
              <ul className="space-y-2">
                {suggestions.improvements.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">💡</span>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
