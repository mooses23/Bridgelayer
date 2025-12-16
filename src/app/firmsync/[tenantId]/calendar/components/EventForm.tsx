// src/app/firmsync/[tenantId]/calendar/components/EventForm.tsx
// Form component for creating/editing calendar events

'use client';

import { useState } from 'react';
import type { CalendarEvent, EventType, EventPriority } from '../hooks/useCalendarEvents';

interface EventFormProps {
  event?: CalendarEvent;
  onSubmit: (data: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_type: event?.event_type || 'appointment' as EventType,
    start_time: event?.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : '',
    end_time: event?.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
    all_day: event?.all_day || false,
    location: event?.location || '',
    priority: event?.priority || 'medium' as EventPriority,
    reminder_minutes: event?.reminder_minutes || 30,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    const startDate = new Date(formData.start_time);
    const endDate = new Date(formData.end_time);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert('Please enter valid start and end times');
      return;
    }
    
    if (endDate <= startDate) {
      alert('End time must be after start time');
      return;
    }
    
    const eventData: Partial<CalendarEvent> = {
      title: formData.title,
      description: formData.description,
      event_type: formData.event_type,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      all_day: formData.all_day,
      location: formData.location,
      priority: formData.priority,
      reminder_minutes: formData.reminder_minutes,
      is_recurring: false,
    };
    
    onSubmit(eventData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter event title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Type *
        </label>
        <select
          value={formData.event_type}
          onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="appointment">Appointment</option>
          <option value="deadline">Deadline</option>
          <option value="court_date">Court Date</option>
          <option value="meeting">Meeting</option>
          <option value="reminder">Reminder</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time *
          </label>
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time *
          </label>
          <input
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="all_day"
          checked={formData.all_day}
          onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="all_day" className="ml-2 text-sm text-gray-700">
          All day event
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as EventPriority })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter event description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reminder (minutes before)
        </label>
        <select
          value={formData.reminder_minutes}
          onChange={(e) => setFormData({ ...formData, reminder_minutes: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="0">No reminder</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="1440">1 day</option>
          <option value="10080">1 week</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
