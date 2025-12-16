// src/app/firmsync/[tenantId]/calendar/components/MonthView.tsx
// Month calendar view component

'use client';

import { useMemo } from 'react';
import type { CalendarEvent } from '../hooks/useCalendarEvents';
import { formatTime } from '../utils/dateFormatters';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthView({ currentDate, events, onDateClick, onEventClick }: MonthViewProps) {
  const { days } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days to show
    const daysInMonth = lastDay.getDate();
    const daysArray: Date[] = [];
    
    // Add previous month's trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      daysArray.push(date);
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(new Date(year, month, i));
    }
    
    // Add next month's leading days to complete the grid
    const remainingDays = 42 - daysArray.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      daysArray.push(new Date(year, month + 1, i));
    }
    
    return {
      days: daysArray,
    };
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 px-2 py-3 text-center text-sm font-semibold text-gray-700"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isTodayDate = isToday(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          
          return (
            <div
              key={index}
              onClick={() => onDateClick(date)}
              className={`bg-white min-h-[120px] p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                !isCurrentMonthDate ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    isTodayDate
                      ? 'flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full'
                      : isCurrentMonthDate
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-xs font-medium truncate ${
                      event.event_type === 'appointment'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : event.event_type === 'deadline'
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : event.event_type === 'court_date'
                        ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        : event.event_type === 'meeting'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {event.all_day ? '' : formatTime(event.start_time)} {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
