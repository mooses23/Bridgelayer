import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Plus, Edit, Trash, ExternalLink, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventType: string;
  startTime: string;
  endTime?: string;
  location?: string;
  isAiSuggested: boolean;
  confirmationStatus: string;
  reminders: string[];
  caseId?: number;
  clientId?: number;
  documentId?: number;
  caseName?: string;
  clientName?: string;
}

const eventTypeColors = {
  hearing: "bg-red-100 text-red-800",
  trial: "bg-purple-100 text-purple-800",
  deposition: "bg-blue-100 text-blue-800",
  deadline: "bg-orange-100 text-orange-800",
  meeting: "bg-green-100 text-green-800"
};

export default function CalendarWidget() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "meeting",
    startTime: "",
    endTime: "",
    location: "",
    caseId: "",
    clientId: ""
  });

  const queryClient = useQueryClient();

  // Fetch calendar events
  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar-events"]
  });

  // Create new event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", "/api/calendar-events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
      setIsCreateDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        eventType: "meeting",
        startTime: "",
        endTime: "",
        location: "",
        caseId: "",
        clientId: ""
      });
    }
  });

  // Confirm AI suggested event mutation
  const confirmEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("POST", `/api/calendar-events/${eventId}/confirm`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
    }
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("DELETE", `/api/calendar-events/${eventId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
    }
  });

  // Google Calendar sync mutation
  const syncGoogleCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/calendar-events/sync-google");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
    }
  });

  const handleCreateEvent = () => {
    createEventMutation.mutate({
      ...newEvent,
      caseId: newEvent.caseId ? parseInt(newEvent.caseId) : null,
      clientId: newEvent.clientId ? parseInt(newEvent.clientId) : null
    });
  };

  const handleConfirmEvent = (eventId: number) => {
    confirmEventMutation.mutate(eventId);
  };

  const handleDeleteEvent = (eventId: number) => {
    deleteEventMutation.mutate(eventId);
  };

  const handleSyncGoogleCalendar = () => {
    syncGoogleCalendarMutation.mutate();
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
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingEvents = events.filter((event: CalendarEvent) => {
    try {
      return event.startTime && new Date(event.startTime) >= new Date();
    } catch {
      return false;
    }
  }).slice(0, 5);

  const aiSuggestedEvents = events.filter((event: CalendarEvent) => 
    event.isAiSuggested && event.confirmationStatus === "pending"
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Court Calendar
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncGoogleCalendar}
                disabled={syncGoogleCalendarMutation.isPending}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Sync Google
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Calendar Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Court hearing, deposition, etc."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="eventType">Event Type</Label>
                      <Select value={newEvent.eventType} onValueChange={(value) => setNewEvent(prev => ({ ...prev, eventType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hearing">Court Hearing</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="deposition">Deposition</SelectItem>
                          <SelectItem value="deadline">Filing Deadline</SelectItem>
                          <SelectItem value="meeting">Client Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="startTime">Start Date/Time</Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={newEvent.startTime}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Date/Time</Label>
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
                        placeholder="Courtroom, office address, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Additional notes or details"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateEvent}
                        disabled={createEventMutation.isPending || !newEvent.title || !newEvent.startTime}
                      >
                        Create Event
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {aiSuggestedEvents.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-blue-900">AI Suggested Events</h4>
              <div className="space-y-2">
                {aiSuggestedEvents.map((event: CalendarEvent) => (
                  <div key={event.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-blue-900">{event.title}</h5>
                          <Badge className={eventTypeColors[event.eventType as keyof typeof eventTypeColors]}>
                            {event.eventType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-blue-700">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.startTime ? format(new Date(event.startTime), "MMM d, h:mm a") : "Invalid date"}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-blue-600 mt-1">{event.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleConfirmEvent(event.id)}
                          disabled={confirmEventMutation.isPending}
                        >
                          Confirm
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deleteEventMutation.isPending}
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-3">Upcoming Events</h4>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming calendar events</p>
                <p className="text-sm">AI will suggest events based on filed documents</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event: CalendarEvent) => (
                  <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{event.title}</h5>
                          <Badge className={eventTypeColors[event.eventType as keyof typeof eventTypeColors]}>
                            {event.eventType}
                          </Badge>
                          {event.isAiSuggested && (
                            <Badge variant="secondary" className="text-xs">AI Suggested</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.startTime ? format(new Date(event.startTime), "MMM d, h:mm a") : "Invalid date"}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                          {event.caseName && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.caseName}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deleteEventMutation.isPending}
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}