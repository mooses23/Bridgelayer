import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Clock } from "lucide-react";
import { Link } from "react-router-dom";

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
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Recent Matters</span>
          </CardTitle>
          <Link to="/matters">
            <Button variant="ghost" size="sm">
              View All
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matters.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recent matters</p>
              <Link to="/matters/new">
                <Button variant="outline" size="sm" className="mt-2">
                  Create First Matter
                </Button>
              </Link>
            </div>
          ) : (
            matters.slice(0, 5).map((matter) => (
              <div key={matter.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {matter.title}
                    </p>
                    <Badge className={`text-xs ${getStatusColor(matter.status)}`}>
                      {matter.status}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(matter.priority)}`}>
                      {matter.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{matter.client}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{matter.lastAccessed}</span>
                  </div>
                </div>
                <Link to={`/matters/${matter.id}`}>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}