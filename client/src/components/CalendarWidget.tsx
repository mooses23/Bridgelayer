import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, MapPin, Bot, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventType: string;
  startTime: string;
  endTime?: string;
  location?: string;
  isAllDay: boolean;
  isAiSuggested: boolean;
  aiConfidence?: number;
  status: string;
}

const eventTypeColors = {
  hearing: "bg-red-100 text-red-800",
  trial: "bg-red-200 text-red-900",
  deposition: "bg-blue-100 text-blue-800",
  deadline: "bg-orange-100 text-orange-800",
  meeting: "bg-green-100 text-green-800"
};

const eventTypes = [
  { value: "hearing", label: "Court Hearing" },
  { value: "trial", label: "Trial" },
  { value: "deposition", label: "Deposition" },
  { value: "deadline", label: "Filing Deadline" },
  { value: "meeting", label: "Client Meeting" }
];

export default function CalendarWidget() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "",
    startTime: "",
    endTime: "",
    location: "",
    isAllDay: false
  });

  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/calendar/events"],
    queryFn: () => apiRequest("GET", "/api/calendar/events")
  });

  // Ensure events is always an array
  const eventsArray = Array.isArray(events) ? events : [];

  const createEventMutation = useMutation({
    mutationFn: (eventData: any) => apiRequest("POST", "/api/calendar/events", eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setIsDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        eventType: "",
        startTime: "",
        endTime: "",
        location: "",
        isAllDay: false
      });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/calendar/events/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
    }
  });

  const upcomingEvents = eventsArray
    .filter((event: CalendarEvent) => new Date(event.startTime) >= new Date())
    .sort((a: CalendarEvent, b: CalendarEvent) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, 5);

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.eventType || !newEvent.startTime) return;
    
    createEventMutation.mutate({
      ...newEvent,
      startTime: new Date(newEvent.startTime).toISOString(),
      endTime: newEvent.endTime ? new Date(newEvent.endTime).toISOString() : null
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const formatEventTime = (dateString: string) => {
    return format(parseISO(dateString), "h:mm a");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Court Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Court Calendar
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Calendar Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                />
              </div>
              
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={newEvent.eventType} onValueChange={(value) => setNewEvent(prev => ({ ...prev, eventType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime">Start Date & Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Date & Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Court room, address, or venue"
                />
              </div>

              <div>
                <Label htmlFor="description">Notes</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details or notes"
                  rows={3}
                />
              </div>

              <Button onClick={handleCreateEvent} className="w-full" disabled={createEventMutation.isPending}>
                {createEventMutation.isPending ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event: CalendarEvent) => (
              <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                      {event.isAiSuggested && (
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatEventDate(event.startTime)} at {formatEventTime(event.startTime)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={`text-xs ${eventTypeColors[event.eventType as keyof typeof eventTypeColors] || 'bg-gray-100 text-gray-800'}`}>
                    {eventTypes.find(t => t.value === event.eventType)?.label || event.eventType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}