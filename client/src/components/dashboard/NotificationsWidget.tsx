import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Mail, 
  FileText, 
  Users, 
  Clock,
  MoreHorizontal
} from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: string;
}

interface NotificationsWidgetProps {
  notifications: Notification[];
}

export default function NotificationsWidget({ notifications }: NotificationsWidgetProps) {
  const defaultNotifications = [
    { id: 1, type: "document", title: "New Document Uploaded", message: "Contract amendment received from XYZ Inc", timestamp: "10 minutes ago", read: false, priority: "high" },
    { id: 2, type: "email", title: "Client Email", message: "Smith replied to discovery questions", timestamp: "1 hour ago", read: false, priority: "medium" },
    { id: 3, type: "client", title: "New Client Inquiry", message: "Potential client inquiry from referral", timestamp: "2 hours ago", read: true, priority: "low" }
  ];

  const allNotifications = notifications.length > 0 ? notifications : defaultNotifications;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'document': return <FileText className="h-4 w-4 text-green-500" />;
      case 'client': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string, read: boolean) => {
    const opacity = read ? 'opacity-60' : '';
    switch (priority) {
      case 'high': return `border-l-red-500 bg-red-50 ${opacity}`;
      case 'medium': return `border-l-yellow-500 bg-yellow-50 ${opacity}`;
      case 'low': return `border-l-green-500 bg-green-50 ${opacity}`;
      default: return `border-l-gray-300 bg-gray-50 ${opacity}`;
    }
  };

  const unreadCount = allNotifications.filter(n => !n.read).length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 border rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-shadow ${getPriorityColor(notification.priority, notification.read)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{notification.timestamp}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        notification.priority === 'high' ? 'border-red-300 text-red-700' :
                        notification.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                        'border-green-300 text-green-700'
                      }`}
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {unreadCount} unread of {allNotifications.length} total
            </span>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
              Mark All Read
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}