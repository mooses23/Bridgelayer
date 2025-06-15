import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, X, Check, AlertTriangle, Info, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'ai_review_ready':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'reviewer_assigned':
      return <FileText className="h-4 w-4 text-green-500" />;
    case 'message_received':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'high_risk_detected':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'border-l-red-500 bg-red-50';
    case 'high':
      return 'border-l-orange-500 bg-orange-50';
    case 'normal':
      return 'border-l-blue-500 bg-blue-50';
    case 'low':
      return 'border-l-gray-500 bg-gray-50';
    default:
      return 'border-l-gray-500 bg-gray-50';
  }
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch unread notification count
  const { data: countData } = useQuery({
    queryKey: ["/api/notifications/count"],
    queryFn: async () => {
      const response = await fetch("/api/notifications/count");
      if (!response.ok) throw new Error("Failed to fetch notification count");
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch notifications when bell is opened
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    enabled: isOpen,
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    },
  });

  const unreadCount = countData?.count || 0;

  const handleMarkAsRead = (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator />
          
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-3 p-3">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      notification.isRead ? 'opacity-60' : ''
                    } ${getPriorityColor(notification.priority)}`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id, {} as React.MouseEvent);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </ScrollArea>
          
          {notifications && notifications.length > 0 && (
            <>
              <Separator />
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All Notifications
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}