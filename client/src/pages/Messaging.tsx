import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Plus, 
  Search,
  FileText,
  Clock,
  CheckCircle,
  User,
  Building,
  Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MessageThread {
  id: number;
  threadId: string;
  title: string;
  filename?: string;
  documentId?: number;
  isResolved: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  threadId: string;
  senderId: number;
  senderRole: string;
  senderName: string;
  recipientRole?: string;
  content: string;
  isSystemMessage: boolean;
  readBy: number[];
  createdAt: string;
}

const ROLE_ICONS = {
  paralegal: User,
  firm_admin: Building,
  bridge: Settings,
};

const ROLE_COLORS = {
  paralegal: "bg-blue-100 text-blue-800",
  firm_admin: "bg-green-100 text-green-800", 
  bridge: "bg-purple-100 text-purple-800",
};

export default function Messaging() {
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch message threads
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["/api/message-threads"],
    queryFn: () => fetch("/api/message-threads").then(res => res.json())
  });

  // Fetch messages for selected thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/message-threads", selectedThread?.threadId, "messages"],
    queryFn: () => selectedThread 
      ? fetch(`/api/message-threads/${selectedThread.threadId}/messages`).then(res => res.json())
      : Promise.resolve([]),
    enabled: !!selectedThread
  });

  // Fetch users for thread creation
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json())
  });

  // Create new thread mutation
  const createThreadMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/message-threads", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    }),
    onSuccess: (newThread) => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-threads"] });
      setSelectedThread(newThread);
      setNewThreadOpen(false);
      toast({
        title: "Thread created",
        description: "New conversation thread has been started.",
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/messages/send", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/message-threads", selectedThread?.threadId, "messages"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/message-threads"] });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
    }
  });

  // Resolve thread mutation
  const resolveThreadMutation = useMutation({
    mutationFn: (threadId: string) => apiRequest(`/api/message-threads/${threadId}/resolve`, {
      method: "PUT"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-threads"] });
      toast({
        title: "Thread resolved",
        description: "This conversation has been marked as resolved.",
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredThreads = threads.filter((thread: MessageThread) => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (thread.filename && thread.filename.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateThread = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createThreadMutation.mutate({
      title: formData.get('title'),
      filename: formData.get('filename') || null,
      documentId: formData.get('documentId') ? parseInt(formData.get('documentId') as string) : null
    });
  };

  const handleSendMessage = () => {
    if (!selectedThread || !newMessage.trim()) return;

    sendMessageMutation.mutate({
      threadId: selectedThread.threadId,
      content: newMessage.trim(),
      senderRole: "paralegal", // This would come from user context
      recipientRole: null // Broadcast to thread
    });
  };

  const getRoleIcon = (role: string) => {
    const IconComponent = ROLE_ICONS[role as keyof typeof ROLE_ICONS] || User;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || "bg-gray-100 text-gray-800";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Messages</h1>
          <p className="text-gray-600">Structured communication for legal professionals</p>
        </div>
        <Dialog open={newThreadOpen} onOpenChange={setNewThreadOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Thread
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Thread Title</label>
                <Input name="title" placeholder="Enter conversation topic" required />
              </div>
              <div>
                <label className="text-sm font-medium">Related File (Optional)</label>
                <Input name="filename" placeholder="e.g., NDA_JohnDoe.pdf" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setNewThreadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createThreadMutation.isPending}>
                  {createThreadMutation.isPending ? "Creating..." : "Start Thread"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Thread List */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {threadsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredThreads.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredThreads.map((thread: MessageThread) => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50
                      ${selectedThread?.id === thread.id ? 'bg-blue-50 border-blue-200 border' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate flex-1">
                        {thread.title}
                      </h3>
                      {thread.isResolved && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                      )}
                    </div>
                    
                    {thread.filename && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <FileText className="w-3 h-3" />
                        {thread.filename}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(thread.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? "No matching conversations" : "No conversations yet"}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedThread.title}
                    </h2>
                    {selectedThread.filename && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        {selectedThread.filename}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedThread.isResolved ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Resolved
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveThreadMutation.mutate(selectedThread.threadId)}
                        disabled={resolveThreadMutation.isPending}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message: Message) => (
                      <div key={message.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRoleColor(message.senderRole)}`}>
                            {getRoleIcon(message.senderRole)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {message.senderName}
                            </span>
                            <Badge variant="outline" className={`text-xs ${getRoleColor(message.senderRole)}`}>
                              {message.senderRole.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <div className="text-gray-800 whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              {!selectedThread.isResolved && (
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-3">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="self-end"
                    >
                      {sendMessageMutation.isPending ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 mb-6">
                  Choose a thread from the sidebar to view messages
                </p>
                <Button onClick={() => setNewThreadOpen(true)}>
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}