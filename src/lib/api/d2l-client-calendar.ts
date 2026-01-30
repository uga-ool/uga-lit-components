// D2L Calendar API client methods
// Additional API functions for calendar-related components

import axios from 'axios';
import { cachedApiCall, withRetry, logApiVersionWarning } from './d2l-client.js';
import type { ApiVersions } from '../../types/d2l.js';

/**
 * Calendar event structure from D2L API
 */
export interface CalendarEvent {
  EventId: number;
  Title: string;
  Description?: string;
  StartDate: string;
  EndDate?: string | null;
  IsAllDay: boolean;
  Location?: string;
  EventType: number; // EVENTTYPE_T
  AssociatedEntity?: {
    EntityId: number;
    EntityType: string;
  };
}

/**
 * Get calendar events for a course
 * @param ou - Organization unit (course) ID
 * @param leVersion - Learning Environment API version
 * @param options - Optional filters
 * @returns Array of calendar events
 */
export async function getCalendarEvents(
  ou: string,
  leVersion: string,
  options?: {
    startDate?: string; // ISO date string
    endDate?: string; // ISO date string
    eventType?: number; // EVENTTYPE_T
  }
): Promise<CalendarEvent[]> {
  logApiVersionWarning(leVersion, 'getCalendarEvents');
  
  const cacheKey = `calendarEvents:${ou}:${JSON.stringify(options || {})}`;
  
  return cachedApiCall(cacheKey, async () => {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.eventType) params.append('eventType', options.eventType.toString());
    
    const queryString = params.toString();
    const url = `/d2l/api/le/${leVersion}/${ou}/calendar/events/${queryString ? '?' + queryString : ''}`;
    
    const events = await withRetry(() => axios.get(url));
    return events.data.Items || events.data || [];
  });
}
