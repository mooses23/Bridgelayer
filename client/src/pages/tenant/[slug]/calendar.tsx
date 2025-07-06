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

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Mock calendar events - would come from API
  const events = [
    {
      id: 1,
      title: "Client Consultation - Smith vs. Jones",
      time: "9:00 AM - 10:00 AM",
      type: "meeting",
      location: "Conference Room A",
      attendees: ["John Smith", "Sarah Connor"]
    },
    {
      id: 2,
      title: "Court Hearing - Case #2024-001",
      time: "2:00 PM - 4:00 PM", 
      type: "court",
      location: "Downtown Courthouse",
      attendees: ["Attorney Johnson"]
    },
    {
      id: 3,
      title: "Deposition Review",
      time: "11:00 AM - 12:00 PM",
      type: "review",
      location: "Virtual Meeting",
      attendees: ["Legal Team"]
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'court': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your appointments, court dates, and meetings
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Calendar
            </CardTitle>
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

        {/* Today's Events */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {selectedDate?.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Clock className="h-4 w-4 text-gray-500 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{event.time}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {event.attendees.length} attendees
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your schedule for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No upcoming events scheduled</p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
