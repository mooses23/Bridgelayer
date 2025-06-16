import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Pause 
} from "lucide-react";

interface Matter {
  id: number;
  title: string;
  client: string;
  status: string;
  priority: string;
  lastAccessed: string;
}

interface RecentMattersWidgetProps {
  matters: Matter[];
}

export default function RecentMattersWidget({ matters }: RecentMattersWidgetProps) {
  const defaultMatters = [
    { id: 1, title: "Smith vs. Johnson", client: "ABC Corp", status: "active", priority: "high", lastAccessed: "2 hours ago" },
    { id: 2, title: "Contract Review - XYZ Inc", client: "XYZ Inc", status: "pending", priority: "medium", lastAccessed: "1 day ago" },
    { id: 3, title: "Employment Agreement", client: "Tech Startup", status: "active", priority: "low", lastAccessed: "3 days ago" }
  ];

  const allMatters = matters.length > 0 ? matters : defaultMatters;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'urgent': return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Recent Matters</span>
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allMatters.map((matter) => (
            <div 
              key={matter.id} 
              className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(matter.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(matter.status)}
                    <h4 className="font-medium text-gray-900 truncate">
                      {matter.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>Client: {matter.client}</span>
                    <span>•</span>
                    <span>Last accessed: {matter.lastAccessed}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(matter.status)}
                    <Badge variant="outline" className={`text-xs ${
                      matter.priority === 'high' ? 'border-red-300 text-red-700' :
                      matter.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-green-300 text-green-700'
                    }`}>
                      {matter.priority} priority
                    </Badge>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total Active Matters</span>
            <span className="font-medium">{allMatters.filter(m => m.status === 'active').length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}