import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  AlertTriangle, 
  Clock, 
  ExternalLink 
} from "lucide-react";

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
  const defaultDeadlines = [
    { id: 1, title: "Discovery Response Due", matter: "Smith vs. Johnson", dueDate: "Dec 17, 2025", type: "Litigation", priority: "urgent", daysRemaining: 1 },
    { id: 2, title: "Contract Amendment Review", matter: "XYZ Inc Agreement", dueDate: "Dec 20, 2025", type: "Contract", priority: "high", daysRemaining: 4 },
    { id: 3, title: "Client Meeting Prep", matter: "Employment Agreement", dueDate: "Dec 24, 2025", type: "Meeting", priority: "medium", daysRemaining: 8 }
  ];

  const allDeadlines = deadlines.length > 0 ? deadlines : defaultDeadlines;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high': return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 1) return 'text-red-600 font-bold';
    if (days <= 3) return 'text-orange-600 font-semibold';
    if (days <= 7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Upcoming Deadlines</span>
          </CardTitle>
          <Button variant="ghost" size="sm">
            View Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allDeadlines.map((deadline) => (
            <div key={deadline.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {getPriorityIcon(deadline.priority)}
                    <h4 className="font-medium text-gray-900 truncate">
                      {deadline.title}
                    </h4>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <div>Matter: {deadline.matter}</div>
                    <div>Type: {deadline.type}</div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">Due: {deadline.dueDate}</span>
                    <span className={getDaysRemainingColor(deadline.daysRemaining)}>
                      {deadline.daysRemaining === 0 ? 'Due Today' : 
                       deadline.daysRemaining === 1 ? '1 day remaining' :
                       `${deadline.daysRemaining} days remaining`}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    {getPriorityBadge(deadline.priority)}
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
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-red-600">
                {allDeadlines.filter(d => d.daysRemaining <= 1).length}
              </div>
              <div className="text-gray-600">Due Soon</div>
            </div>
            <div>
              <div className="font-medium text-orange-600">
                {allDeadlines.filter(d => d.daysRemaining <= 7 && d.daysRemaining > 1).length}
              </div>
              <div className="text-gray-600">This Week</div>
            </div>
            <div>
              <div className="font-medium text-blue-600">
                {allDeadlines.length}
              </div>
              <div className="text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}