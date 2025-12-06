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
  id: string;                    // UUID
  title: string;                 // Event title
  description: string;           // Event description
  location?: string;             // Event location
  start: string;                 // ISO datetime
  end: string;                   // ISO datetime
  allDay: boolean;              // All-day event flag
  color?: string;               // Event color (hex)
  category?: string;            // Event category
  recurrence: RecurrenceType;   // Recurrence pattern
  recurrenceEndDate?: string;   // When recurrence ends
  reminders: number[];          // Minutes before event
  attendees: string[];          // Attendee IDs/emails
  createdBy: string;            // Creator ID
  createdAt: string;            // Creation timestamp
  updatedAt: string;            // Last update timestamp
}
```

### Recurrence Types

```typescript
type RecurrenceType = 
  | "none"      // Single event
  | "daily"     // Every day
  | "weekly"    // Every week
  | "biweekly"  // Every 2 weeks
  | "monthly"   // Every month
  | "yearly";   // Every year
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
  data: CalendarEvent
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
  data: CalendarEvent
}
```

### DELETE `/api/calendar/events/:id`

Delete an event.

**Response:**

```typescript
{
  success: true;
  message: "Event deleted successfully"
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
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX idx_events_start ON calendar_events(start_time);
CREATE INDEX idx_events_end ON calendar_events(end_time);
CREATE INDEX idx_events_category ON calendar_events(category);
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

- [ ] Input validation with Zod schemas
- [ ] Standardized error handling (APIError classes)
- [ ] Structured logging with Pino
- [ ] Time zone support
- [ ] CalDAV/iCal export
- [ ] Event conflicts detection
- [ ] Notification system integration
- [ ] Attendee response tracking (accept/decline)
- [ ] Custom recurrence rules (e.g., "last Friday of month")

## Maintainer

Thomas Heisig

**Last Review:** December 2025
