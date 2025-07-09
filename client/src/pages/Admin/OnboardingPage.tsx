import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Upload, 
  Monitor, 
  Send, 
  CheckCircle,
  Clock,
  User,
  Building2,
  Settings,
  Eye,
  Edit3,
  Save,
  Plus
} from 'lucide-react';
import apiService from '@/services/api.service';
import { useOnboarding } from '@/contexts/auth.context';
import { OnboardingProfile } from '@/types/schema';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
}

interface FirmOnboarding {
  id: string;
  firmName: string;
  status: 'draft' | 'customizing' | 'review' | 'completed';
  createdAt: string;
  assignedTo: string;
  steps: OnboardingStep[];
}

export default function OnboardingPage({ code }: { code?: string }) {
  const [activeTab, setActiveTab] = useState('template');
  const [selectedFirm, setSelectedFirm] = useState<FirmOnboarding | null>(null);
  const [loading, setLoading] = useState(false);
  const { onboardingCode, setOnboardingCode } = useOnboarding();
  
  // Use provided code or code from context
  const currentCode = code || onboardingCode;
  
  // State for onboarding data
  const [onboardingQueue, setOnboardingQueue] = useState<FirmOnboarding[]>([]);
  
  // Load onboarding data
  useEffect(() => {
    const loadOnboardingData = async () => {
      setLoading(true);
      try {
        // If we have a specific code, load that onboarding profile
        if (currentCode) {
          const response = await apiService.getOnboardingProfile(currentCode);
          const profile = response.data;
          
          // Convert to FirmOnboarding format
          const firmData = {
            id: profile.id.toString(),
            firmName: profile.firmId ? `Firm #${profile.firmId}` : 'New Firm',
            status: profile.status as any,
            createdAt: new Date(profile.createdAt).toISOString().split('T')[0],
            assignedTo: 'Admin User',
            steps: [
              { 
                id: '1', 
                title: 'Firm Information', 
                description: 'Basic firm details and logo', 
                status: profile.totalStepsCompleted >= 1 ? 'completed' : 'pending' as any,
                completedAt: profile.totalStepsCompleted >= 1 ? profile.updatedAt : undefined
              },
              {
                id: '2',
                title: 'Integrations Setup',
                description: '3rd party connections',
                status: profile.totalStepsCompleted >= 2 ? 'completed' : profile.totalStepsCompleted === 1 ? 'in-progress' : 'pending' as any,
                completedAt: profile.totalStepsCompleted >= 2 ? profile.updatedAt : undefined
              },
              {
                id: '3',
                title: 'LLM Configuration',
                description: 'Custom prompts and AI settings',
                status: profile.totalStepsCompleted >= 3 ? 'completed' : profile.totalStepsCompleted === 2 ? 'in-progress' : 'pending' as any,
                completedAt: profile.totalStepsCompleted >= 3 ? profile.updatedAt : undefined
              },
              {
                id: '4',
                title: 'Document Agent Assignment',
                description: 'Configure document processing',
                status: profile.totalStepsCompleted >= 4 ? 'completed' : profile.totalStepsCompleted === 3 ? 'in-progress' : 'pending' as any,
                completedAt: profile.totalStepsCompleted >= 4 ? profile.updatedAt : undefined
              }
            ]
          };
          
          setSelectedFirm(firmData);
          setOnboardingQueue([firmData]);
        } else {
          // Otherwise, load all onboarding profiles
          // This would be implemented with a call to get all profiles
          // Mock data for now
          setOnboardingQueue([
            {
              id: '1',
              firmName: 'Johnson & Associates',
              status: 'customizing',
              createdAt: '2024-06-15',
              assignedTo: 'Admin User',
              steps: [
                { id: '1', title: 'Firm Information', description: 'Basic firm details and logo', status: 'completed', completedAt: '2024-06-15' },
                { id: '2', title: 'Integrations Setup', description: '3rd party connections', status: 'in-progress' },
                { id: '3', title: 'LLM Configuration', description: 'Custom prompts and AI settings', status: 'pending' },
                { id: '4', title: 'Document Agent Assignment', description: 'Configure document processing', status: 'pending' }
              ]
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to load onboarding data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOnboardingData();
  }, [currentCode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'customizing': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending': return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
      default: return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templated Onboarding</h1>
          <p className="mt-2 text-gray-600">
            Customize the FirmSync template for each law firm and manage the complete onboarding process.
          </p>
        </div>
        
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Start New Onboarding</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template" className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>View Template</span>
          </TabsTrigger>
          <TabsTrigger value="customize" className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4" />
            <span>Customize Template</span>
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Complete Onboarding</span>
          </TabsTrigger>
        </TabsList>

        {/* View Template Tab */}
        <TabsContent value="template" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>FirmSync Template Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Monitor className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Template Preview</h3>
                    <p className="text-gray-600 mb-4">
                      View the standard FirmSync website template with mock firm data
                    </p>
                    <Button variant="outline">
                      Open Template Preview
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Template Features</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Dashboard Overview</li>
                        <li>• Client Management</li>
                        <li>• Case Tracking</li>
                        <li>• Document Storage</li>
                        <li>• Calendar Integration</li>
                        <li>• Task Management</li>
                        <li>• Billing System</li>
                        <li>• Paralegal+ Tools</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">AI-Powered Tabs</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Smart Client Insights</li>
                        <li>• Case Strategy AI</li>
                        <li>• Document Analysis</li>
                        <li>• Calendar AI</li>
                        <li>• Task Automation</li>
                        <li>• Billing Intelligence</li>
                        <li>• Research Assistant</li>
                        <li>• Document Generation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Template Version</Label>
                    <p className="text-sm text-gray-600">v2.1.0 - Latest Stable</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                    <p className="text-sm text-gray-600">June 20, 2024</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Customizable Elements</Label>
                    <div className="mt-2 space-y-2">
                      <Badge variant="outline">Firm Branding</Badge>
                      <Badge variant="outline">Color Scheme</Badge>
                      <Badge variant="outline">Logo & Images</Badge>
                      <Badge variant="outline">Practice Areas</Badge>
                      <Badge variant="outline">LLM Prompts</Badge>
                      <Badge variant="outline">Integrations</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Integration Support</Label>
                    <div className="mt-2 space-y-2">
                      <Badge variant="secondary">Document Management</Badge>
                      <Badge variant="secondary">Billing Software</Badge>
                      <Badge variant="secondary">Case Management</Badge>
                      <Badge variant="secondary">Calendar Systems</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customize Template Tab */}
        <TabsContent value="customize" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Template Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firm-name">Firm Name</Label>
                      <Input
                        id="firm-name"
                        placeholder="Enter law firm name"
                        value="Johnson & Associates"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firm-subdomain">Subdomain</Label>
                      <Input
                        id="firm-subdomain"
                        placeholder="firmname"
                        value="johnson-associates"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="firm-logo">Firm Logo</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Upload firm logo (SVG, PNG, JPG)</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Practice Areas</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {['Criminal Law', 'Family Law', 'Corporate Law', 'Real Estate', 'Personal Injury', 'Immigration'].map((area) => (
                        <label key={area} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" defaultChecked={area === 'Criminal Law'} />
                          <span className="text-sm">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Color Scheme</Label>
                    <div className="mt-2 flex space-x-2">
                      {['blue', 'green', 'purple', 'red', 'orange'].map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full bg-${color}-600 border-2 border-gray-300`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save Template</span>
                    </Button>
                    <Button variant="outline">
                      Preview Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Onboarding File
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure LLM Prompts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Setup Integrations
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Create User Accounts
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Complete Onboarding Tab */}
        <TabsContent value="onboarding" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Onboarding Queue */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Onboarding Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {onboardingQueue.map((firm) => (
                    <div
                      key={firm.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFirm?.id === firm.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFirm(firm)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{firm.firmName}</h3>
                        <Badge className={getStatusColor(firm.status)}>
                          {firm.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Assigned to: {firm.assignedTo}</p>
                      <p className="text-xs text-gray-400">Started: {firm.createdAt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Onboarding Progress */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedFirm ? `${selectedFirm.firmName} - Onboarding Progress` : 'Select a Firm'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFirm ? (
                  <div className="space-y-4">
                    {selectedFirm.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStepStatusIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{step.title}</h3>
                            {step.status === 'completed' && step.completedAt && (
                              <span className="text-xs text-gray-500">Completed: {step.completedAt}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          {step.status === 'in-progress' && (
                            <Button size="sm" className="mt-2">
                              Continue Step
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4 mt-6">
                      <div className="flex space-x-2">
                        <Button className="flex items-center space-x-2">
                          <Send className="w-4 h-4" />
                          <span>Send Credentials</span>
                        </Button>
                        <Button variant="outline">
                          Test Login
                        </Button>
                        <Button variant="outline">
                          Preview Site
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>Select a firm from the queue to view onboarding progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
