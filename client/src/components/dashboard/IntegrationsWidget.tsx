import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plug, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  lastSync: string;
  icon: string;
}

interface IntegrationsWidgetProps {
  integrations: Integration[];
}

export default function IntegrationsWidget({ integrations }: IntegrationsWidgetProps) {
  const defaultIntegrations = [
    { id: 'docusign', name: 'DocuSign', status: 'connected' as const, description: 'Digital signatures', lastSync: '2 hours ago', icon: '📄' },
    { id: 'quickbooks', name: 'QuickBooks', status: 'connected' as const, description: 'Accounting sync', lastSync: '1 day ago', icon: '💰' },
    { id: 'google', name: 'Google Workspace', status: 'disconnected' as const, description: 'Email & calendar', lastSync: 'Never', icon: '📧' },
    { id: 'slack', name: 'Slack', status: 'error' as const, description: 'Team communication', lastSync: '3 days ago', icon: '💬' },
    { id: 'dropbox', name: 'Dropbox', status: 'connected' as const, description: 'File storage', lastSync: '30 minutes ago', icon: '📁' }
  ];

  const allIntegrations = integrations.length > 0 ? integrations : defaultIntegrations;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'disconnected': return <Badge className="bg-gray-100 text-gray-800">Disconnected</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const connectedCount = allIntegrations.filter(i => i.status === 'connected').length;
  const totalCount = allIntegrations.length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Plug className="h-5 w-5 text-blue-600" />
            <span>Integrations</span>
            <Badge className="bg-blue-100 text-blue-800">
              {connectedCount}/{totalCount}
            </Badge>
          </CardTitle>
          <Link to="/integrations">
            <Button variant="ghost" size="sm">
              <Settings className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allIntegrations.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <span className="text-lg">{integration.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {integration.name}
                    </p>
                    {getStatusIcon(integration.status)}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{integration.description}</p>
                  <p className="text-xs text-gray-400">
                    Last sync: {integration.lastSync}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(integration.status)}
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Integration Health</span>
            <span>{connectedCount} of {totalCount} connected</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(connectedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}