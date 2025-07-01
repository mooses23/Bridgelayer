import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  FileText, 
  Settings, 
  BarChart3, 
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download
} from 'lucide-react';

/**
 * FIRMSYNC ADMIN SYSTEM VISION DEMO
 * 
 * This demonstrates the complete admin system layout and functionality
 * that I believe you envision for FirmSync Legal. This is a comprehensive
 * admin dashboard that manages multiple law firms as tenants.
 */

interface Firm {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'pending' | 'suspended';
  onboardingComplete: boolean;
  plan: 'trial' | 'starter' | 'professional' | 'enterprise';
  adminUsers: number;
  documentsProcessed: number;
  lastActivity: string;
  createdAt: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'platform_admin' | 'support';
  lastLogin: string;
  status: 'active' | 'inactive';
}

export default function AdminSystemVisionDemo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);

  // Mock data representing the admin system state
  const mockFirms: Firm[] = [
    {
      id: '1',
      name: 'Smith & Associates',
      subdomain: 'smith-law',
      status: 'active',
      onboardingComplete: true,
      plan: 'professional',
      adminUsers: 3,
      documentsProcessed: 1247,
      lastActivity: '2 hours ago',
      createdAt: '2025-01-15'
    },
    {
      id: '2', 
      name: 'Johnson Legal Group',
      subdomain: 'johnson-legal',
      status: 'pending',
      onboardingComplete: false,
      plan: 'trial',
      adminUsers: 1,
      documentsProcessed: 0,
      lastActivity: '1 day ago',
      createdAt: '2025-06-20'
    },
    {
      id: '3',
      name: 'Davis Criminal Defense',
      subdomain: 'davis-defense',
      status: 'active',
      onboardingComplete: true,
      plan: 'starter',
      adminUsers: 2,
      documentsProcessed: 567,
      lastActivity: '4 hours ago',
      createdAt: '2025-03-10'
    }
  ];

  const mockAdminUsers: AdminUser[] = [
    {
      id: '1',
      name: 'Platform Admin',
      email: 'admin@firmsync.com',
      role: 'super_admin',
      lastLogin: '1 hour ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'Support Agent',
      email: 'support@firmsync.com', 
      role: 'support',
      lastLogin: '3 hours ago',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'starter': return 'bg-green-100 text-green-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">FirmSync Admin</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Platform Management
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create New Firm
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="firms" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Law Firms</span>
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Onboarding</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Admin Users</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Firms</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Onboardings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">8 completed this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45,231</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">99.8%</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
                <CardDescription>Latest actions across all law firms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { firm: 'Smith & Associates', action: 'Completed onboarding process', time: '2 hours ago' },
                    { firm: 'Johnson Legal Group', action: 'Started Step 3: Integrations', time: '4 hours ago' },
                    { firm: 'Davis Criminal Defense', action: 'Processed 45 documents', time: '6 hours ago' },
                    { firm: 'Wilson Law Firm', action: 'Upgraded to Professional plan', time: '1 day ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{activity.firm}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Law Firms Tab */}
          <TabsContent value="firms" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Law Firm Management</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Firm Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockFirms.map((firm) => (
                        <tr key={firm.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{firm.name}</div>
                              <div className="text-sm text-gray-500">{firm.subdomain}.firmsync.com</div>
                              <div className="text-xs text-gray-400">Created: {firm.createdAt}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <Badge className={getStatusColor(firm.status)}>
                                {firm.status}
                              </Badge>
                              {firm.onboardingComplete ? (
                                <div className="flex items-center text-xs text-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Onboarded
                                </div>
                              ) : (
                                <div className="flex items-center text-xs text-yellow-600">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getPlanColor(firm.plan)}>
                              {firm.plan}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div>{firm.documentsProcessed} docs</div>
                              <div className="text-gray-500">{firm.adminUsers} admins</div>
                              <div className="text-xs text-gray-400">Active: {firm.lastActivity}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedFirm(firm)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Onboarding Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Start New Onboarding
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Onboarding Pipeline</CardTitle>
                  <CardDescription>Current status of firm onboardings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Template Selection</span>
                      <Badge variant="outline">5 firms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Firm Information</span>
                      <Badge variant="outline">8 firms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Admin Account</span>
                      <Badge variant="outline">3 firms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Integrations</span>
                      <Badge variant="outline">7 firms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Review & Deploy</span>
                      <Badge variant="outline">2 firms</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completion Metrics</CardTitle>
                  <CardDescription>Onboarding success rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Completion Rate</span>
                        <span>87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Time</span>
                        <span>45 min</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Drop-off Rate</span>
                        <span>13%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{width: '13%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support Needed</CardTitle>
                  <CardDescription>Firms requiring assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { firm: 'Johnson Legal', issue: 'Integration timeout', priority: 'high' },
                      { firm: 'Miller & Partners', issue: 'Payment setup', priority: 'medium' },
                      { firm: 'Brown Law Office', issue: 'Domain verification', priority: 'low' }
                    ].map((support, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{support.firm}</p>
                            <p className="text-xs text-gray-600">{support.issue}</p>
                          </div>
                          <Badge 
                            className={
                              support.priority === 'high' ? 'bg-red-100 text-red-800' :
                              support.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {support.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Platform Admin Users</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Admin User
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockAdminUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <h2 className="text-xl font-semibold">Platform Document Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>Document Processing Overview</CardTitle>
                <CardDescription>System-wide document analysis and processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">45,231</div>
                    <div className="text-sm text-gray-600">Total Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">42,891</div>
                    <div className="text-sm text-gray-600">Successfully Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">1,847</div>
                    <div className="text-sm text-gray-600">Pending Review</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">493</div>
                    <div className="text-sm text-gray-600">Failed Processing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">Platform Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>Core platform settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Auto-backup enabled</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Document retention</span>
                      <span className="text-sm text-gray-600">7 years</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Max file size</span>
                      <span className="text-sm text-gray-600">100 MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Platform security configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Two-factor authentication</span>
                      <Badge className="bg-green-100 text-green-800">Required</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Session timeout</span>
                      <span className="text-sm text-gray-600">8 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Password policy</span>
                      <Badge className="bg-blue-100 text-blue-800">Strong</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Firm Detail Modal (if selected) */}
      {selectedFirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedFirm.name} Details</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFirm(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Subdomain</label>
                    <p className="text-sm">{selectedFirm.subdomain}.firmsync.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p>
                      <Badge className={getStatusColor(selectedFirm.status)}>
                        {selectedFirm.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Plan</label>
                    <p>
                      <Badge className={getPlanColor(selectedFirm.plan)}>
                        {selectedFirm.plan}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Admin Users</label>
                    <p className="text-sm">{selectedFirm.adminUsers}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Documents Processed</label>
                    <p className="text-sm">{selectedFirm.documentsProcessed}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Activity</label>
                    <p className="text-sm">{selectedFirm.lastActivity}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Dashboard
                    </Button>
                    <Button size="sm" variant="outline">
                      Access Support
                    </Button>
                    <Button size="sm" variant="outline">
                      Billing Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
