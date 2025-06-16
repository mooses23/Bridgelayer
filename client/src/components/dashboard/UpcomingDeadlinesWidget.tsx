import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Deadline {
  id: number;
  title: string;
  matter: string;
  dueDate: string;
  type: string;
  priority: string;
  daysRemaining: number;
}

interface UpcomingDeadlinesWidgetProps {
  deadlines: Deadline[];
}

export default function UpcomingDeadlinesWidget({ deadlines }: UpcomingDeadlinesWidgetProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (daysRemaining: number) => {
    if (daysRemaining <= 1) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (daysRemaining <= 3) return <Clock className="h-4 w-4 text-orange-500" />;
    return <Calendar className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Upcoming Deadlines</span>
          </CardTitle>
          <Link to="/calendar">
            <Button variant="ghost" size="sm">
              View Calendar
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deadlines.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No upcoming deadlines</p>
            </div>
          ) : (
            deadlines.slice(0, 3).map((deadline) => (
              <div key={deadline.id} className={`p-3 border rounded-lg ${deadline.daysRemaining <= 1 ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getUrgencyIcon(deadline.daysRemaining)}
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {deadline.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{deadline.matter}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">{deadline.type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      deadline.daysRemaining <= 1 ? 'text-red-600' : 
                      deadline.daysRemaining <= 3 ? 'text-orange-600' : 
                      'text-blue-600'
                    }`}>
                      {deadline.daysRemaining === 0 ? 'Due Today' :
                       deadline.daysRemaining === 1 ? 'Due Tomorrow' :
                       `${deadline.daysRemaining} days`}
                    </p>
                    <p className="text-xs text-gray-500">{deadline.dueDate}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}