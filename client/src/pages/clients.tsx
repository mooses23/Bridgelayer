import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import type { Client } from "@shared/schema";

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch clients for the firm
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: () => fetch("/api/clients").then(res => res.json())
  });

  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "prospective": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No clients found matching your search." : "No clients found. Add your first client to get started."}
              </div>
            ) : (
              filteredClients.map((client: Client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{client.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {client.phone}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Added {format(new Date(client.createdAt || ''), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}