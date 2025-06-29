import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  Mail, 
  Phone,
  Calendar,
  Activity,
  Lock,
  Unlock,
  MoreHorizontal,
  Filter,
  Download,
  Upload
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'firm_admin' | 'attorney' | 'paralegal' | 'client';
  firmName?: string;
  status: 'active' | 'suspended' | 'pending';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

interface FirmUser {
  id: string;
  firmId: string;
  firmName: string;
  totalUsers: number;
  activeUsers: number;
  admins: number;
  lastActivity: string;
}

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('all-users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Mock data
  const users: User[] = [
    {
      id: '1',
      email: 'admin@bridgelayer.com',
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-06-20',
      createdAt: '2024-01-01',
      permissions: ['all']
    },
    {
      id: '2',
      email: 'john@johnsonlaw.com',
      firstName: 'John',
      lastName: 'Johnson',
      role: 'firm_admin',
      firmName: 'Johnson & Associates',
      status: 'active',
      lastLogin: '2024-06-19',
      createdAt: '2024-06-15',
      permissions: ['firm_admin', 'user_management', 'billing']
    },
    {
      id: '3',
      email: 'sarah@johnsonlaw.com',
      firstName: 'Sarah',
      lastName: 'Miller',
      role: 'attorney',
      firmName: 'Johnson & Associates',
      status: 'active',
      lastLogin: '2024-06-20',
      createdAt: '2024-06-15',
      permissions: ['cases', 'clients', 'documents']
    },
    {
      id: '4',
      email: 'mike@millerlaw.com',
      firstName: 'Mike',
      lastName: 'Miller',
      role: 'firm_admin',
      firmName: 'Miller Law Group',
      status: 'pending',
      lastLogin: 'Never',
      createdAt: '2024-06-18',
      permissions: ['firm_admin']
    }
  ];

  const firmUsers: FirmUser[] = [
    {
      id: '1',
      firmId: 'firm_1',
      firmName: 'Johnson & Associates',
      totalUsers: 8,
      activeUsers: 7,
      admins: 1,
      lastActivity: '2024-06-20'
    },
    {
      id: '2',
      firmId: 'firm_2',
      firmName: 'Miller Law Group',
      totalUsers: 5,
      activeUsers: 4,
      admins: 1,
      lastActivity: '2024-06-19'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firmName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'firm_admin': return 'bg-blue-100 text-blue-800';
      case 'attorney': return 'bg-green-100 text-green-800';
      case 'paralegal': return 'bg-orange-100 text-orange-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'firm_admin': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage all user accounts, roles, and permissions across the FirmSync platform.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Import Users</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name, email, or firm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Roles</option>
              <option value="admin">System Admin</option>
              <option value="firm_admin">Firm Admin</option>
              <option value="attorney">Attorney</option>
              <option value="paralegal">Paralegal</option>
              <option value="client">Client</option>
            </select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>All Users</span>
          </TabsTrigger>
          <TabsTrigger value="firm-users" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>By Firm</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Permissions</span>
          </TabsTrigger>
        </TabsList>

        {/* All Users Tab */}
        <TabsContent value="all-users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>User Accounts</CardTitle>
                {selectedUsers.length > 0 && (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Lock className="w-4 h-4 mr-2" />
                      Suspend ({selectedUsers.length})
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Firm</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(user.role)}
                            <span>{user.role.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.firmName ? (
                          <span className="text-sm text-gray-900">{user.firmName}</span>
                        ) : (
                          <span className="text-sm text-gray-400">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{user.lastLogin}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firm Users Tab */}
        <TabsContent value="firm-users" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {firmUsers.map((firm) => (
              <Card key={firm.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{firm.firmName}</span>
                    <Badge variant="outline">{firm.totalUsers} users</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-sm font-medium">{firm.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Administrators</span>
                      <span className="text-sm font-medium">{firm.admins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Activity</span>
                      <span className="text-sm font-medium">{firm.lastActivity}</span>
                    </div>
                    <Button size="sm" className="w-full">
                      Manage Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { role: 'System Admin', permissions: ['Full System Access', 'User Management', 'Firm Management', 'System Configuration'] },
                    { role: 'Firm Admin', permissions: ['Firm Management', 'User Management', 'Billing', 'Settings'] },
                    { role: 'Attorney', permissions: ['Cases', 'Clients', 'Documents', 'Calendar'] },
                    { role: 'Paralegal', permissions: ['Research', 'Document Generation', 'Case Support'] },
                    { role: 'Client', permissions: ['View Cases', 'Documents', 'Billing'] }
                  ].map((roleData) => (
                    <div key={roleData.role} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{roleData.role}</h3>
                      <div className="flex flex-wrap gap-1">
                        {roleData.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                    </div>
                    <Button size="sm">Enable</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Password Policy</p>
                      <p className="text-sm text-gray-600">Minimum 8 characters with complexity</p>
                    </div>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-600">Auto-logout after 4 hours</p>
                    </div>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Audit Logging</p>
                      <p className="text-sm text-gray-600">Track all user actions</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
