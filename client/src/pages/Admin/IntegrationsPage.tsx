import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Settings, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Globe,
  FileText,
  CreditCard,
  Mail,
  Calendar,
  Shield,
  Database,
  MessageSquare
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  status: 'active' | 'inactive' | 'configured' | 'error';
  icon: any;
  configurable: boolean;
  webhookUrl?: string;
  apiKey?: string;
  lastSync?: string;
  firmCount?: number;
}

const integrationCategories = [
  { 
    id: 'document-management', 
    name: 'Document Management', 
    icon: FileText,
    description: 'Document storage, processing, and collaboration platforms'
  },
  { 
    id: 'billing-payments', 
    name: 'Billing & Payments', 
    icon: CreditCard,
    description: 'Payment processing, invoicing, and financial management'
  },
  { 
    id: 'communications', 
    name: 'Communications', 
    icon: MessageSquare,
    description: 'Email, messaging, and client communication tools'
  },
  { 
    id: 'calendar-scheduling', 
    name: 'Calendar & Scheduling', 
    icon: Calendar,
    description: 'Appointment scheduling and calendar synchronization'
  },
  { 
    id: 'security-compliance', 
    name: 'Security & Compliance', 
    icon: Shield,
    description: 'Authentication, encryption, and compliance monitoring'
  },
  { 
    id: 'data-analytics', 
    name: 'Data & Analytics', 
    icon: Database,
    description: 'Business intelligence, reporting, and data visualization'
  },
  { 
    id: 'web-services', 
    name: 'Web Services', 
    icon: Globe,
    description: 'External APIs, webhooks, and third-party services'
  }
];

const sampleIntegrations: Integration[] = [
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Electronic signature and document workflow platform',
    category: 'document-management',
    provider: 'DocuSign Inc.',
    status: 'active',
    icon: FileText,
    configurable: true,
    firmCount: 247,
    lastSync: '2025-06-18T07:30:00Z'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    category: 'billing-payments',
    provider: 'Stripe Inc.',
    status: 'configured',
    icon: CreditCard,
    configurable: true,
    firmCount: 189,
    lastSync: '2025-06-18T07:15:00Z'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing automation',
    category: 'communications',
    provider: 'Twilio SendGrid',
    status: 'active',
    icon: Mail,
    configurable: true,
    firmCount: 156,
    lastSync: '2025-06-18T07:25:00Z'
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Appointment scheduling and calendar integration',
    category: 'calendar-scheduling',
    provider: 'Calendly LLC',
    status: 'inactive',
    icon: Calendar,
    configurable: true,
    firmCount: 78
  },
  {
    id: 'okta',
    name: 'Okta',
    description: 'Identity and access management platform',
    category: 'security-compliance',
    provider: 'Okta Inc.',
    status: 'configured',
    icon: Shield,
    configurable: true,
    firmCount: 43,
    lastSync: '2025-06-18T06:45:00Z'
  },
  {
    id: 'tableau',
    name: 'Tableau',
    description: 'Business intelligence and data visualization',
    category: 'data-analytics',
    provider: 'Salesforce Inc.',
    status: 'error',
    icon: Database,
    configurable: true,
    firmCount: 32
  }
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [integrations] = useState<Integration[]>(sampleIntegrations);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'configured': return <Settings className="w-4 h-4 text-blue-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'configured': 'secondary', 
      'inactive': 'outline',
      'error': 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Integrations</h1>
          <p className="text-gray-500 mt-2">
            Manage third-party platform integrations for FirmSync. Configure connections to external services
            categorized by their function type for streamlined legal operations.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Integration
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Categories</option>
            {integrationCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Integration Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {integrationCategories.map(category => {
          const categoryIntegrations = integrations.filter(i => i.category === category.id);
          const activeCount = categoryIntegrations.filter(i => i.status === 'active').length;
          const Icon = category.icon;
          
          return (
            <Card 
              key={category.id} 
              className={`cursor-pointer transition-colors ${
                selectedCategory === category.id ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Icon className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{category.name}</h3>
                    <p className="text-xs text-gray-500">{activeCount}/{categoryIntegrations.length} active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integrations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIntegrations.map(integration => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        {getStatusIcon(integration.status)}
                      </div>
                      <CardDescription className="text-sm">
                        {integration.provider}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                
                <div className="space-y-2 mb-4">
                  {integration.firmCount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Connected Firms:</span>
                      <span className="font-medium">{integration.firmCount}</span>
                    </div>
                  )}
                  {integration.lastSync && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Sync:</span>
                      <span className="font-medium">
                        {new Date(integration.lastSync).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleConfigureIntegration(integration)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Docs
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or category filter.
          </p>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Configure {selectedIntegration.name}</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowConfigModal(false)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select 
                      id="status"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      defaultValue={selectedIntegration.status}
                    >
                      <option value="active">Active</option>
                      <option value="configured">Configured</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      defaultValue={selectedIntegration.category}
                    >
                      {integrationCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input 
                    id="apiKey"
                    type="password"
                    placeholder="Enter API key..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input 
                    id="webhookUrl"
                    placeholder="https://your-app.com/webhooks/..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="config">Configuration JSON</Label>
                  <Textarea 
                    id="config"
                    placeholder="Enter integration-specific configuration..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">
                    Save Configuration
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Test Connection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}