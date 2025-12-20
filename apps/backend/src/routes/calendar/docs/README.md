# Calendar Router

**Version:** 0.2.0  
**Last Updated:** December 2025

## Overview

The Calendar Router provides comprehensive event management functionality for the ERP system. It supports creating, reading, updating, and deleting calendar events with features like recurring events, reminders, attendee management, and category-based organization.

## Features

- **Event Management**: Full CRUD operations for calendar events
- **Recurring Events**: Support for daily, weekly, biweekly, monthly, and yearly recurrence
- **Reminders**: Multiple reminder notifications per event
- **Attendees**: Track event participants
- **Categories**: Organize events by category
- **Date Range Queries**: Efficient filtering by date ranges
- **All-Day Events**: Support for all-day and multi-day events
- **Search**: Full-text search across event titles and descriptions

## Data Model

### CalendarEvent Interface

```typescript
interface CalendarEvent {
  id: string; // UUID
  title: string; // Event title
  description: string; // Event description
  location?: string; // Event location
  start: string; // ISO datetime
  end: string; // ISO datetime
  allDay: boolean; // All-day event flag
  color?: string; // Event color (hex)
  category?: string; // Event category
  recurrence: RecurrenceType; // Recurrence pattern
  recurrenceEndDate?: string; // When recurrence ends
  reminders: number[]; // Minutes before event
  attendees: string[]; // Attendee IDs/emails
  
  // ✅ NEW: Extended properties (v0.2.0)
  status: "confirmed" | "tentative" | "cancelled"; // Event status
  priority: "low" | "normal" | "high" | "urgent"; // Priority level
  timezone: string; // IANA timezone (default: UTC)
  isPrivate: boolean; // Privacy flag
  url?: string; // Meeting URL (Zoom, Teams, etc.)
  organizer?: string; // Organizer email/ID
  
  createdBy: string; // Creator ID
  createdAt: string; // Creation timestamp
  updatedAt: string; // Last update timestamp
}
```

### Recurrence Types

```typescript
type RecurrenceType =
  | "none" // Single event
  | "daily" // Every day
  | "weekly" // Every week
  | "biweekly" // Every 2 weeks
  | "monthly" // Every month
  | "yearly"; // Every year
```

## API Endpoints

### GET `/api/calendar/events`

Retrieve calendar events with optional filters.

**Query Parameters:**

- `start` (string): Filter events after this ISO datetime
- `end` (string): Filter events before this ISO datetime
- `category` (string): Filter by category
- `search` (string): Search in title and description
- `limit` (number): Max results (default: 500)
- `offset` (number): Pagination offset (default: 0)

**Response:**

```typescript
{
  success: true;
  data: CalendarEvent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  }
}
```

**Examples:**

```bash
# Get all events
GET /api/calendar/events

# Get events in December 2025
GET /api/calendar/events?start=2025-12-01T00:00:00Z&end=2025-12-31T23:59:59Z

# Get meetings only
GET /api/calendar/events?category=meeting

# Search for "budget"
GET /api/calendar/events?search=budget
```

### GET `/api/calendar/events/:id`

Get a specific event by ID.

**Response:**

```typescript
{
  success: true;
  data: CalendarEvent;
}
```

### POST `/api/calendar/events`

Create a new calendar event.

**Request Body:**

```typescript
{
  title: string;                 // Required
  description?: string;
  location?: string;
  start: string;                 // Required, ISO datetime
  end: string;                   // Required, ISO datetime
  allDay?: boolean;              // Default: false
  color?: string;                // Hex color
  category?: string;
  recurrence?: RecurrenceType;   // Default: "none"
  recurrenceEndDate?: string;
  reminders?: number[];          // Minutes before
  attendees?: string[];
  createdBy: string;             // Required
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    id: string;
    ...CalendarEvent
  }
}
```

### PUT `/api/calendar/events/:id`

Update an existing event.

**Request Body:** Same as POST (all fields optional except those you want to update)

**Response:**

```typescript
{
  success: true;
  data: CalendarEvent;
}
```

### DELETE `/api/calendar/events/:id`

Delete an event.

**Response:**

```typescript
{
  success: true;
  message: "Event deleted successfully";
}
```

### GET `/api/calendar/categories`

Get list of all event categories.

**Response:**

```typescript
{
  success: true;
  data: {
    categories: string[];
  }
}
```

### GET `/api/calendar/conflicts` ✅ NEW

Check for scheduling conflicts.

**Query Parameters:**

- `start` (string, required): Event start time
- `end` (string, required): Event end time
- `excludeId` (string, optional): Exclude specific event from check

**Response:**

```typescript
{
  success: true;
  data: CalendarEvent[];  // Conflicting events
  conflicts: boolean;     // true if conflicts exist
}
```

**Example:**

```bash
GET /api/calendar/conflicts?start=2025-12-15T10:00:00Z&end=2025-12-15T11:00:00Z&excludeId=event-123
```

### POST `/api/calendar/events/batch` ✅ NEW

Perform batch operations on multiple events.

**Request Body:**

```typescript
{
  action: "delete" | "duplicate" | "updateStatus" | "updatePriority";
  eventIds: string[];  // Array of event IDs
  data?: {             // Required for updateStatus/updatePriority
    status?: "confirmed" | "tentative" | "cancelled";
    priority?: "low" | "normal" | "high" | "urgent";
  }
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    changes: number;  // Number of affected events
  }
}
```

**Examples:**

```bash
# Delete multiple events
POST /api/calendar/events/batch
{
  "action": "delete",
  "eventIds": ["event-1", "event-2", "event-3"]
}

# Confirm multiple events
POST /api/calendar/events/batch
{
  "action": "updateStatus",
  "eventIds": ["event-1", "event-2"],
  "data": { "status": "confirmed" }
}

# Mark as urgent
POST /api/calendar/events/batch
{
  "action": "updatePriority",
  "eventIds": ["event-5"],
  "data": { "priority": "urgent" }
}
```

### GET `/api/calendar/stats` ✅ NEW

Get calendar statistics.

**Query Parameters:**

- `start` (string, optional): Filter start date
- `end` (string, optional): Filter end date

**Response:**

```typescript
{
  success: true;
  data: {
    summary: {
      total: number;           // Total events
      upcoming: number;        // Future events
      allDay: number;          // All-day events
      recurring: number;       // Recurring events
      withAttendees: number;   // Events with attendees
      confirmed: number;       // Confirmed events
      tentative: number;       // Tentative events
      cancelled: number;       // Cancelled events
      highPriority: number;    // High/urgent priority
    };
    byCategory: Array<{ category: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  }
}
```

**Example:**

```bash
GET /api/calendar/stats?start=2025-12-01T00:00:00Z&end=2025-12-31T23:59:59Z
```

### GET `/api/calendar/export` ✅ EXISTING

Export events in various formats (ICS, CSV, JSON).

**Query Parameters:**

- `format`: "ics" | "csv" | "json" (default: "ics")
- `start` (optional): Filter start date
- `end` (optional): Filter end date

**Response:** File download

**Example:**

```bash
GET /api/calendar/export?format=ics&start=2025-12-01&end=2025-12-31
```

### POST `/api/calendar/import` ✅ EXISTING

Import events from ICS file.

**Request Body:** Multipart form data or ICS content

**Response:**

```typescript
{
  success: true;
  data: {
    imported: number;  // Number of events imported
    events: CalendarEvent[];
  }
}
```

## Database Schema

### calendar_events Table

```sql
CREATE TABLE calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  all_day BOOLEAN DEFAULT 0,
  color TEXT,
  category TEXT,
  recurrence TEXT DEFAULT 'none',
  recurrence_end_date TEXT,
  reminders_json TEXT DEFAULT '[]',
  attendees_json TEXT DEFAULT '[]',
  
  -- ✅ NEW: Extended fields (v0.2.0)
  status TEXT DEFAULT 'confirmed',      -- confirmed | tentative | cancelled
  priority TEXT DEFAULT 'normal',       -- low | normal | high | urgent
  timezone TEXT DEFAULT 'UTC',          -- IANA timezone
  is_private INTEGER DEFAULT 0,         -- Boolean: 0=public, 1=private
  url TEXT,                             -- Meeting URL
  organizer TEXT,                       -- Organizer email/ID
  
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX idx_events_start ON calendar_events(start_time);
CREATE INDEX idx_events_end ON calendar_events(end_time);
CREATE INDEX idx_events_category ON calendar_events(category);
CREATE INDEX idx_events_status ON calendar_events(status);  -- ✅ NEW
```

## Usage Examples

### Create a Meeting

```bash
curl -X POST http://localhost:3000/api/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "description": "Monthly team sync",
    "location": "Conference Room A",
    "start": "2025-12-15T10:00:00Z",
    "end": "2025-12-15T11:00:00Z",
    "category": "meeting",
    "reminders": [15, 60],
    "attendees": ["user1@company.com", "user2@company.com"],
    "createdBy": "manager@company.com"
  }'
```

### Create a Recurring Event

```bash
curl -X POST http://localhost:3000/api/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekly Standup",
    "start": "2025-12-09T09:00:00Z",
    "end": "2025-12-09T09:30:00Z",
    "recurrence": "weekly",
    "recurrenceEndDate": "2026-12-31T23:59:59Z",
    "category": "meeting",
    "createdBy": "scrum-master@company.com"
  }'
```

### Get This Month's Events

```bash
curl "http://localhost:3000/api/calendar/events?\
start=2025-12-01T00:00:00Z&\
end=2025-12-31T23:59:59Z"
```

### Update Event

```bash
curl -X PUT http://localhost:3000/api/calendar/events/event-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Meeting Title",
    "location": "Conference Room B"
  }'
```

## Best Practices

### Date Handling

- Always use **ISO 8601** format for dates
- Store dates in **UTC** timezone
- Let clients handle timezone conversion

### Recurring Events

- Set realistic `recurrenceEndDate` to avoid infinite series
- Consider performance implications of long-running recurring events
- For UI, generate occurrences dynamically rather than storing each instance

### Reminders

- Store reminder times in **minutes before event**
- Common values: `[5, 15, 30, 60, 1440]` (5min, 15min, 30min, 1h, 1day)
- Process reminders asynchronously

### Search Performance

- Use indexed columns for filtering (`start_time`, `end_time`, `category`)
- For full-text search, consider limits and pagination
- Cache frequent queries

## Error Handling

Common errors:

- `400`: Invalid date format or missing required fields
- `404`: Event not found
- `500`: Database error

All errors follow the standard error response format:

```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    timestamp: string;
    path: string;
  }
}
```

## Logging

Uses `console.error` for database errors. Should be migrated to structured logging (Pino) as per CODE_QUALITY_IMPROVEMENTS.md.

## Dependencies

- **express**: Web framework
- **dbService**: Database abstraction layer

## Related Documentation

- [DATABASE_OPTIMIZATION.md](../../../../docs/DATABASE_OPTIMIZATION.md) - Query optimization
- [API_DOCUMENTATION.md](../../../../docs/api/API_DOCUMENTATION.md) - Complete API reference

## Future Enhancements

### ✅ Completed (v0.2.0 - December 2025)

- [x] **Input validation with Zod schemas** - Implemented in types.ts
- [x] **Event conflicts detection** - `/api/calendar/conflicts` endpoint
- [x] **CalDAV/iCal export** - `/api/calendar/export?format=ics`
- [x] **Time zone support** - `timezone` field added to events
- [x] **Extended event properties** - status, priority, privacy, organizer, URL
- [x] **Batch operations** - `/api/calendar/events/batch` endpoint
- [x] **Enhanced statistics** - `/api/calendar/stats` with status/priority breakdown

### 🔄 Planned

- [ ] **Standardized error handling** - Migrate to APIError classes (see CODE_QUALITY_IMPROVEMENTS.md)
- [ ] **Structured logging with Pino** - Replace console.error calls
- [ ] **Notification system integration** - Email/push notifications for reminders
- [ ] **Attendee response tracking** - Accept/decline/maybe with EventAttendee interface
- [ ] **Custom recurrence rules** - Advanced patterns ("last Friday of month", "every 2nd Tuesday")
- [ ] **Time zone conversion** - Automatic server-side timezone handling
- [ ] **Event templates** - Reusable event templates
- [ ] **Calendar sharing** - Share calendars between users
- [ ] **External calendar sync** - Google Calendar, Outlook integration

## Frontend Integration Guide

### TypeScript Types

Import types from the backend:

```typescript
// frontend/src/types/calendar.ts
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  start: string;  // ISO datetime
  end: string;    // ISO datetime
  allDay: boolean;
  color?: string;
  category?: string;
  recurrence: RecurrenceType;
  recurrenceEndDate?: string;
  reminders: number[];
  attendees: string[];
  status: "confirmed" | "tentative" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  timezone: string;
  isPrivate: boolean;
  url?: string;
  organizer?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
```

### API Client

```typescript
// frontend/src/api/calendar.ts
import axios from 'axios';
import type { CalendarEvent } from '../types/calendar';

const API_BASE = '/api/calendar';

export const calendarAPI = {
  // Get events
  getEvents: async (params?: {
    start?: string;
    end?: string;
    category?: string;
    search?: string;
    status?: string;
    priority?: string;
  }) => {
    const { data } = await axios.get<{ success: boolean; data: CalendarEvent[] }>(
      `${API_BASE}/events`,
      { params }
    );
    return data.data;
  },

  // Get single event
  getEvent: async (id: string) => {
    const { data } = await axios.get<{ success: boolean; data: CalendarEvent }>(
      `${API_BASE}/events/${id}`
    );
    return data.data;
  },

  // Create event
  createEvent: async (event: Partial<CalendarEvent>) => {
    const { data } = await axios.post<{ success: boolean; data: CalendarEvent }>(
      `${API_BASE}/events`,
      event
    );
    return data.data;
  },

  // Update event
  updateEvent: async (id: string, updates: Partial<CalendarEvent>) => {
    const { data } = await axios.put<{ success: boolean; data: CalendarEvent }>(
      `${API_BASE}/events/${id}`,
      updates
    );
    return data.data;
  },

  // Delete event
  deleteEvent: async (id: string) => {
    await axios.delete(`${API_BASE}/events/${id}`);
  },

  // Check conflicts
  checkConflicts: async (start: string, end: string, excludeId?: string) => {
    const { data } = await axios.get<{
      success: boolean;
      data: CalendarEvent[];
      conflicts: boolean;
    }>(`${API_BASE}/conflicts`, {
      params: { start, end, excludeId }
    });
    return data;
  },

  // Batch operations
  batchOperation: async (
    action: 'delete' | 'duplicate' | 'updateStatus' | 'updatePriority',
    eventIds: string[],
    data?: { status?: string; priority?: string }
  ) => {
    const response = await axios.post<{ success: boolean; data: { changes: number } }>(
      `${API_BASE}/events/batch`,
      { action, eventIds, data }
    );
    return response.data.data.changes;
  },

  // Get statistics
  getStats: async (start?: string, end?: string) => {
    const { data } = await axios.get(`${API_BASE}/stats`, {
      params: { start, end }
    });
    return data.data;
  },

  // Export
  exportEvents: async (format: 'ics' | 'csv' | 'json', start?: string, end?: string) => {
    const response = await axios.get(`${API_BASE}/export`, {
      params: { format, start, end },
      responseType: 'blob'
    });
    return response.data;
  },

  // Import
  importEvents: async (icsContent: string) => {
    const { data } = await axios.post(`${API_BASE}/import`, {
      ics: icsContent
    });
    return data.data;
  }
};
```

### React Hooks Example

```typescript
// frontend/src/hooks/useCalendar.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarAPI } from '../api/calendar';
import type { CalendarEvent } from '../types/calendar';

export function useCalendarEvents(params?: {
  start?: string;
  end?: string;
  category?: string;
  status?: string;
  priority?: string;
}) {
  return useQuery({
    queryKey: ['calendar-events', params],
    queryFn: () => calendarAPI.getEvents(params),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (event: Partial<CalendarEvent>) => calendarAPI.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CalendarEvent> }) =>
      calendarAPI.updateEvent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => calendarAPI.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useCheckConflicts() {
  return useMutation({
    mutationFn: ({ start, end, excludeId }: {
      start: string;
      end: string;
      excludeId?: string;
    }) => calendarAPI.checkConflicts(start, end, excludeId),
  });
}

export function useBatchOperation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ action, eventIds, data }: {
      action: 'delete' | 'duplicate' | 'updateStatus' | 'updatePriority';
      eventIds: string[];
      data?: { status?: string; priority?: string };
    }) => calendarAPI.batchOperation(action, eventIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useCalendarStats(start?: string, end?: string) {
  return useQuery({
    queryKey: ['calendar-stats', start, end],
    queryFn: () => calendarAPI.getStats(start, end),
  });
}
```

### Component Examples

#### Event List Component

```tsx
// frontend/src/components/Calendar/EventList.tsx
import { useCalendarEvents } from '../../hooks/useCalendar';
import { EventCard } from './EventCard';

export function EventList() {
  const { data: events, isLoading } = useCalendarEvents({
    start: new Date().toISOString(),
    // Get next 30 days
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {events?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

#### Create Event Form

```tsx
// frontend/src/components/Calendar/CreateEventForm.tsx
import { useForm } from 'react-hook-form';
import { useCreateEvent } from '../../hooks/useCalendar';
import type { CalendarEvent } from '../../types/calendar';

export function CreateEventForm() {
  const { register, handleSubmit } = useForm<Partial<CalendarEvent>>();
  const createEvent = useCreateEvent();

  const onSubmit = (data: Partial<CalendarEvent>) => {
    createEvent.mutate({
      ...data,
      createdBy: 'current-user-id',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title', { required: true })} placeholder="Title" />
      <textarea {...register('description')} placeholder="Description" />
      <input {...register('location')} placeholder="Location" />
      
      <input type="datetime-local" {...register('start', { required: true })} />
      <input type="datetime-local" {...register('end', { required: true })} />
      
      <select {...register('status')}>
        <option value="confirmed">Confirmed</option>
        <option value="tentative">Tentative</option>
        <option value="cancelled">Cancelled</option>
      </select>
      
      <select {...register('priority')}>
        <option value="low">Low</option>
        <option value="normal">Normal</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
      
      <input {...register('url')} placeholder="Meeting URL" />
      
      <label>
        <input type="checkbox" {...register('isPrivate')} />
        Private Event
      </label>
      
      <button type="submit" disabled={createEvent.isPending}>
        Create Event
      </button>
    </form>
  );
}
```

#### Conflict Checker

```tsx
// frontend/src/components/Calendar/ConflictChecker.tsx
import { useCheckConflicts } from '../../hooks/useCalendar';
import { AlertCircle } from 'lucide-react';

export function ConflictChecker({ start, end, excludeId }: {
  start: string;
  end: string;
  excludeId?: string;
}) {
  const checkConflicts = useCheckConflicts();
  
  useEffect(() => {
    if (start && end) {
      checkConflicts.mutate({ start, end, excludeId });
    }
  }, [start, end]);
  
  if (!checkConflicts.data?.conflicts) return null;
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
      <div className="flex items-center gap-2">
        <AlertCircle className="text-yellow-600" />
        <p className="font-medium">Scheduling Conflict Detected</p>
      </div>
      <p className="text-sm mt-2">
        {checkConflicts.data.data.length} conflicting event(s) found
      </p>
    </div>
  );
}
```

#### Calendar Statistics Dashboard

```tsx
// frontend/src/components/Calendar/StatsWidget.tsx
import { useCalendarStats } from '../../hooks/useCalendar';

export function StatsWidget() {
  const { data: stats } = useCalendarStats();
  
  if (!stats) return null;
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Events" value={stats.summary.total} />
      <StatCard title="Upcoming" value={stats.summary.upcoming} />
      <StatCard title="High Priority" value={stats.summary.highPriority} color="red" />
      <StatCard 
        title="Confirmed" 
        value={stats.summary.confirmed} 
        color="green" 
      />
    </div>
  );
}
```

### Best Practices for Frontend

1. **Date Handling**
   - Use `date-fns` or `dayjs` for date manipulation
   - Always convert to ISO string before sending to backend
   - Parse ISO strings from backend to Date objects

2. **Timezone Handling**
   - Store user's timezone preference
   - Display times in user's timezone
   - Send UTC times to backend

3. **Validation**
   - Use Zod schemas on frontend matching backend validation
   - Validate before API calls to provide immediate feedback

4. **Error Handling**
   - Handle network errors gracefully
   - Show user-friendly error messages
   - Implement retry logic for failed requests

5. **Performance**
   - Use React Query for caching and automatic refetching
   - Implement pagination for large event lists
   - Debounce search inputs

6. **Accessibility**
   - Use semantic HTML for calendar components
   - Implement keyboard navigation
   - Provide ARIA labels for screen readers

## Maintainer

Thomas Heisig

**Last Review:** December 2025  
**Last Update:** December 20, 2025 (v0.2.0 - Extended properties & features)
