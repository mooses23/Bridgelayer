// src/app/firmsync/[tenantId]/calendar/components/EventCard.tsx
// Component for displaying a single calendar event

'use client';

import type { CalendarEvent, EventType } from '../hooks/useCalendarEvents';
import { formatTime, formatDate } from '../utils/dateFormatters';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  onDelete?: () => void;
}

const eventTypeColors: Record<EventType, { bg: string; text: string; border: string }> = {
  appointment: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  deadline: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  court_date: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  meeting: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  reminder: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export function EventCard({ event, onClick, onDelete }: EventCardProps) {
  const colors = eventTypeColors[event.event_type] || eventTypeColors.appointment;

  return (
    <div
      className={`border rounded-lg p-4 ${colors.border} ${colors.bg} hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`font-semibold ${colors.text}`}>{event.title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[event.priority]}`}>
              {event.priority}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {event.all_day ? (
                <span>All Day - {formatDate(event.start_time)}</span>
              ) : (
                <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
              )}
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
            )}
            
            {event.description && (
              <p className="text-gray-500 line-clamp-2 mt-2">{event.description}</p>
            )}
          </div>
        </div>
        
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete event"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
