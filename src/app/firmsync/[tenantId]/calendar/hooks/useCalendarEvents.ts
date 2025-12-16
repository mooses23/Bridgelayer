// src/app/firmsync/[tenantId]/calendar/hooks/useCalendarEvents.ts
// Hook for fetching calendar events for a tenant

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export type EventType = 'appointment' | 'deadline' | 'court_date' | 'meeting' | 'reminder';
export type EventPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CalendarEvent {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  attendees?: string[];
  related_case_id?: string;
  related_client_id?: string;
  priority: EventPriority;
  reminder_minutes?: number;
  is_recurring: boolean;
  recurrence_rule?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
}

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addEvent: (event: Partial<CalendarEvent>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export function useCalendarEvents(tenantId: string): UseCalendarEventsReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('firmsync_calendar_events')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('start_time', { ascending: true });

      if (supabaseError) {
        throw new Error(`Failed to fetch calendar events: ${supabaseError.message}`);
      }

      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar events');
      console.error('useCalendarEvents fetchEvents error:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, tenantId]);

  const addEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('firmsync_calendar_events')
        .insert({
          ...eventData,
          tenant_id: tenantId,
          id: crypto.randomUUID(),
          status: eventData.status || 'scheduled',
        })
        .select()
        .single();

      if (supabaseError) {
        throw new Error(`Failed to add event: ${supabaseError.message}`);
      }

      setEvents(prev => [...prev, data].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add event');
      console.error('useCalendarEvents addEvent error:', err);
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('firmsync_calendar_events')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (supabaseError) {
        throw new Error(`Failed to update event: ${supabaseError.message}`);
      }

      setEvents(prev => 
        prev.map(event => event.id === id ? { ...event, ...data } : event)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      console.error('useCalendarEvents updateEvent error:', err);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('firmsync_calendar_events')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (supabaseError) {
        throw new Error(`Failed to delete event: ${supabaseError.message}`);
      }

      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      console.error('useCalendarEvents deleteEvent error:', err);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchEvents();
    }
  }, [tenantId, fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
