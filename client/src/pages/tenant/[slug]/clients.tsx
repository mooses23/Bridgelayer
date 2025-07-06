import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search,
  Phone,
  Mail,
  Building,
  MoreHorizontal,
  Eye,
  Edit,
  Trash
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock client data - would come from API
  const clients = [
    {
      id: 1,
      name: "TechCorp Inc",
      type: "Corporate",
      contact: "John Smith",
      email: "john.smith@techcorp.com",
      phone: "(555) 123-4567",
      status: "Active",
      activeCases: 3,
      lastActivity: "2025-01-15"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      type: "Individual",
      contact: "Sarah Johnson",
      email: "sarah.johnson@email.com", 
      phone: "(555) 987-6543",
      status: "Active",
      activeCases: 1,
      lastActivity: "2025-01-12"
    },
    {
      id: 3,
      name: "Manufacturing Solutions LLC",
      type: "Corporate",
      contact: "Michael Brown",
      email: "m.brown@mansol.com",
      phone: "(555) 456-7890",
      status: "Inactive",
      activeCases: 0,
      lastActivity: "2024-12-20"
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and contact information
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients by name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === 'Active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corporate</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.type === 'Corporate').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Individual</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.type === 'Individual').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>
            {filteredClients.length} of {clients.length} clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {client.type === 'Corporate' ? (
                      <Building className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Users className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{client.name}</h3>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {client.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {client.phone}
                        </span>
                      </div>
                      <div>
                        Contact: {client.contact} • {client.activeCases} active cases
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Client
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
