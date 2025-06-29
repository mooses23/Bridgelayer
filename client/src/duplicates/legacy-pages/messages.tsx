import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Plus, 
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages"],
    queryFn: () => fetch("/api/messages?type=user").then(res => res.json())
  });

  // Fetch users for message recipients
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json())
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => 
      apiRequest(`/api/messages/${messageId}/read`, { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    }
  });

  // Create new message mutation
  const createMessageMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/messages", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setNewMessageOpen(false);
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully.",
      });
    }
  });

  const filteredMessages = messages?.filter((msg: any) => 
    msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-l-red-500';
      case 'success': return 'border-l-green-500';
      case 'warning': return 'border-l-yellow-500';
      default: return 'border-l-blue-500';
    }
  };

  const handleCreateMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createMessageMutation.mutate({
      toUserId: parseInt(formData.get('recipient') as string),
      title: formData.get('title'),
      content: formData.get('content'),
      type: formData.get('type') || 'info'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communication hub for your legal team</p>
        </div>
        <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMessage} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recipient</label>
                <Select name="recipient" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select name="type" defaultValue="info">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input name="title" placeholder="Message subject" required />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea name="content" placeholder="Type your message here..." rows={4} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setNewMessageOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMessageMutation.isPending}>
                  {createMessageMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Inbox
                <Badge variant="secondary">
                  {filteredMessages.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Messages */}
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length > 0 ? (
                <div className="space-y-2">
                  {filteredMessages.map((message: any) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`
                        p-4 border-l-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50
                        ${getMessageTypeColor(message.type)}
                        ${selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-500' : ''}
                        ${!message.isRead ? 'bg-gray-50 font-medium' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getMessageIcon(message.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900 truncate">
                                {message.title}
                              </h3>
                              {!message.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {message.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {new Date(message.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? "No messages found" : "No messages yet"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery 
                      ? "Try adjusting your search terms"
                      : "Messages from your team will appear here"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMessage ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getMessageIcon(selectedMessage.type)}
                    <Badge variant="outline" className="capitalize">
                      {selectedMessage.type}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {selectedMessage.title}
                    </h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="text-xs text-gray-500">
                      <strong>Sent:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                    {selectedMessage.documentId && (
                      <div className="text-xs text-gray-500">
                        <strong>Related Document:</strong> Document #{selectedMessage.documentId}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a message to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}