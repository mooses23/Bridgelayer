// src/app/firmsync/[tenantId]/calendar/CalendarWorkspace.tsx
// Main workspace component for calendar management

'use client';

import { useState, useMemo } from 'react';
import { useCalendarFeatures } from './hooks/useCalendarFeatures';
import { useCalendarEvents, type CalendarEvent } from './hooks/useCalendarEvents';
import { MonthView } from './components/MonthView';
import { EventCard } from './components/EventCard';
import { EventForm } from './components/EventForm';

interface CalendarWorkspaceProps {
  tenantId: string;
}

export default function CalendarWorkspace({ tenantId }: CalendarWorkspaceProps) {
  const { features, loading: featuresLoading, error: featuresError, refetch: refetchFeatures } = useCalendarFeatures(tenantId);
  const { events, loading: eventsLoading, error: eventsError, addEvent, updateEvent, deleteEvent, refetch: refetchEvents } = useCalendarEvents(tenantId);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter(event => event.event_type === filterType);
  }, [events, filterType]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return filteredEvents
      .filter(event => new Date(event.start_time) >= now && event.status === 'scheduled')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 5);
  }, [filteredEvents]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEventSubmit = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, eventData);
      } else {
        // If a date was clicked, use that date for the event
        if (selectedDate && !eventData.start_time) {
          const startTime = new Date(selectedDate);
          startTime.setHours(9, 0, 0, 0);
          const endTime = new Date(selectedDate);
          endTime.setHours(10, 0, 0, 0);
          
          eventData.start_time = startTime.toISOString();
          eventData.end_time = endTime.toISOString();
        }
        await addEvent(eventData);
      }
      setShowEventForm(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEventToDelete(eventId);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteEvent(eventToDelete);
      setSelectedEvent(null);
      setShowEventForm(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  if (featuresLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (featuresError || eventsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Calendar</h2>
          <p className="text-gray-600 mb-4">
            {featuresError || eventsError}
          </p>
          <button 
            onClick={() => {
              if (featuresError) refetchFeatures();
              if (eventsError) refetchEvents();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600 mt-1">
                Manage appointments, deadlines, and important dates
                {features && (
                  <span className="ml-2 text-sm text-blue-600">
                    • {Object.values(features).filter(Boolean).length} features enabled
                  </span>
                )}
              </p>
            </div>
            
            <button
              onClick={handleNewEvent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              + New Event
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Calendar Area */}
          <div className="col-span-9">
            {/* Calendar Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePreviousMonth}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
                      title="Previous month"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
                      title="Next month"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleToday}
                      className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                    >
                      Today
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Events</option>
                    <option value="appointment">Appointments</option>
                    <option value="deadline">Deadlines</option>
                    <option value="court_date">Court Dates</option>
                    <option value="meeting">Meetings</option>
                    <option value="reminder">Reminders</option>
                  </select>

                  <div className="flex border border-gray-300 rounded-md overflow-hidden">
                    <button
                      onClick={() => setView('month')}
                      className={`px-3 py-2 text-sm font-medium ${
                        view === 'month'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setView('list')}
                      className={`px-3 py-2 text-sm font-medium border-l border-gray-300 ${
                        view === 'list'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            {view === 'month' ? (
              <MonthView
                currentDate={currentDate}
                events={filteredEvents}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Events</h3>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600">No events found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => handleEventClick(event)}
                        onDelete={() => handleDeleteEvent(event.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-3">
            {/* Event Form or Upcoming Events */}
            {showEventForm ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedEvent ? 'Edit Event' : 'New Event'}
                </h3>
                <EventForm
                  event={selectedEvent || undefined}
                  onSubmit={handleEventSubmit}
                  onCancel={() => {
                    setShowEventForm(false);
                    setSelectedEvent(null);
                    setSelectedDate(null);
                  }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 text-sm">No upcoming events</p>
                    <button
                      onClick={handleNewEvent}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Create your first event
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => handleEventClick(event)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Event</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
