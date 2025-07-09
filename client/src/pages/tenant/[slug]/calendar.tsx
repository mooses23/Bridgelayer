import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  Plus, 
  Clock,
  Users,
  MapPin,
  Video
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/contexts/TenantContext';
import apiService from '@/services/api.service';
import { CalendarEvent } from '@/types/schema';

export default function CalendarPage() {
  const { tenant } = useTenant();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Format selected date for API
  const formatApiDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Calculate start and end of month for API query
  const startOfMonth = selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date();
  const endOfMonth = selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0) : new Date();
  
  // Fetch calendar events using API service
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar', tenant?.slug, formatApiDate(startOfMonth), formatApiDate(endOfMonth)],
    queryFn: async () => {
      const response = await apiService.getCalendarEvents(
        tenant?.slug || '', 
        formatApiDate(startOfMonth), 
        formatApiDate(endOfMonth)
      );
      return response.data;
    },
    enabled: !!tenant?.slug
  });

  // Event type color mapping
  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'court': return 'bg-red-100 text-red-800';
      case 'deposition': return 'bg-purple-100 text-purple-800';
      case 'review': return 'bg-green-100 text-green-800';
      case 'deadline': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter events for selected date
  const eventsForSelectedDate = selectedDate ? events.filter((event: CalendarEvent) => {
    const eventDate = new Date(event.startTime);
    return eventDate.getDate() === selectedDate.getDate() &&
           eventDate.getMonth() === selectedDate.getMonth() &&
           eventDate.getFullYear() === selectedDate.getFullYear();
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your schedule and upcoming events
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Picker */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {eventsForSelectedDate.length} events scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">Loading events...</div>
            ) : eventsForSelectedDate.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No events scheduled for this day</div>
            ) : (
              <div className="space-y-4">
                {eventsForSelectedDate.map((event: CalendarEvent) => {
                  const startTime = new Date(event.startTime);
                  const endTime = new Date(event.endTime);
                  
                  return (
                    <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.eventType)}>
                          {event.eventType}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
