// SPDX-License-Identifier: MIT
// apps/backend/src/routes/calendar/calendarRouter.ts

/**
 * Calendar Router
 *
 * Provides calendar and event management API with support for recurring
 * events, reminders, attendees, and various calendar views.
 *
 * @remarks
 * This router provides:
 * - Event CRUD operations (create, read, update, delete)
 * - Recurring event support (daily, weekly, monthly, yearly)
 * - Date-range queries for calendar views
 * - Category and color-based organization
 * - Reminder notifications
 * - Attendee management
 * - All-day event support
 * - Event search and filtering
 *
 * Recurrence Types:
 * - none - Single occurrence event
 * - daily - Repeats every day
 * - weekly - Repeats every week
 * - biweekly - Repeats every two weeks
 * - monthly - Repeats every month
 * - yearly - Repeats every year
 *
 * Features:
 * - ISO 8601 datetime format
 * - Timezone support
 * - Location field for meetings
 * - Custom colors and categories
 * - Multiple reminder times
 * - Attendee list management
 *
 * @module routes/calendar
 *
 * @example
 * ```typescript
 * // Create event
 * POST /api/calendar/events
 * {
 *   "title": "Team Meeting",
 *   "description": "Weekly sync",
 *   "start": "2024-12-09T10:00:00Z",
 *   "end": "2024-12-09T11:00:00Z",
 *   "recurrence": "weekly",
 *   "reminders": [15, 60],
 *   "attendees": ["user1@example.com", "user2@example.com"]
 * }
 *
 * // Get events in date range
 * GET /api/calendar/events?start=2024-12-01&end=2024-12-31
 *
 * // Update event
 * PATCH /api/calendar/events/:id
 * { "title": "Updated Meeting Title" }
 * ```
 */

import { Router, Request, Response } from "express";
import db from "../../services/dbService.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { BadRequestError, NotFoundError } from "../../types/errors.js";

const router = Router();

// Wiederholungs-Typen
export const RECURRENCE_TYPES = [
  "none",
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
] as const;

export type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  allDay: boolean;
  color?: string;
  category?: string;
  recurrence: RecurrenceType;
  recurrenceEndDate?: string;
  reminders: number[]; // Minutes before event
  attendees: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Tabelle für Events erstellen
async function ensureEventsTable(): Promise<void> {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS calendar_events (
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
      )
    `);

    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_events_start ON calendar_events(start_time)`,
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_events_end ON calendar_events(end_time)`,
    );
    await db.exec(
      `CREATE INDEX IF NOT EXISTS idx_events_category ON calendar_events(category)`,
    );
  } catch (error) {
    console.error("❌ [Calendar] Failed to create events table:", error);
  }
}

// Initialisierung
ensureEventsTable();

/**
 * GET /api/calendar/events
 * Liste aller Events mit optionalen Filtern
 */
router.get(
  "/events",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      start,
      end,
      category,
      search,
      limit = "500",
      offset = "0",
    } = req.query;

    let sql = "SELECT * FROM calendar_events WHERE 1=1";
    const params: unknown[] = [];

    if (start) {
      sql += " AND end_time >= ?";
      params.push(start);
    }

    if (end) {
      sql += " AND start_time <= ?";
      params.push(end);
    }

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (search) {
      sql += " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += " ORDER BY start_time ASC";
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const rows = await db.all<Record<string, unknown>>(sql, params);

    // Für wiederkehrende Events: Instanzen generieren
    let events = rows.map(rowToEvent);

    if (start && end) {
      events = expandRecurringEvents(
        events,
        new Date(start as string),
        new Date(end as string),
      );
    }

    res.json({
      success: true,
      data: events,
      total: events.length,
    });
  }),
);

/**
 * GET /api/calendar/events/:id
 * Einzelnes Event abrufen
 */
router.get(
  "/events/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM calendar_events WHERE id = ?",
      [id],
    );

    if (!row) {
      throw new NotFoundError("Event not found");
    }

    res.json({
      success: true,
      data: rowToEvent(row),
    });
  }),
);

/**
 * POST /api/calendar/events
 * Neues Event erstellen
 */
router.post(
  "/events",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      title,
      description = "",
      location,
      start,
      end,
      allDay = false,
      color,
      category,
      recurrence = "none",
      recurrenceEndDate,
      reminders = [],
      attendees = [],
      createdBy = "anonymous",
    } = req.body;

    if (!title || title.trim() === "") {
      throw new BadRequestError("Title is required");
    }

    if (!start || !end) {
      throw new BadRequestError("Start and end times are required");
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO calendar_events (
      id, title, description, location, start_time, end_time,
      all_day, color, category, recurrence, recurrence_end_date,
      reminders_json, attendees_json, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        description,
        location ?? null,
        start,
        end,
        allDay ? 1 : 0,
        color ?? null,
        category ?? null,
        recurrence,
        recurrenceEndDate ?? null,
        JSON.stringify(reminders),
        JSON.stringify(attendees),
        createdBy,
        now,
        now,
      ],
    );

    const newEvent: CalendarEvent = {
      id,
      title: title.trim(),
      description,
      location,
      start,
      end,
      allDay,
      color,
      category,
      recurrence,
      recurrenceEndDate,
      reminders,
      attendees,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    res.status(201).json({
      success: true,
      data: newEvent,
    });
  }),
);

/**
 * PUT /api/calendar/events/:id
 * Event aktualisieren
 */
router.put(
  "/events/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingRow = await db.get<Record<string, unknown>>(
      "SELECT * FROM calendar_events WHERE id = ?",
      [id],
    );

    if (!existingRow) {
      throw new NotFoundError("Event not found");
    }

    const existing = rowToEvent(existingRow);
    const {
      title = existing.title,
      description = existing.description,
      location = existing.location,
      start = existing.start,
      end = existing.end,
      allDay = existing.allDay,
      color = existing.color,
      category = existing.category,
      recurrence = existing.recurrence,
      recurrenceEndDate = existing.recurrenceEndDate,
      reminders = existing.reminders,
      attendees = existing.attendees,
    } = req.body;

    const now = new Date().toISOString();

    await db.run(
      `UPDATE calendar_events SET
      title = ?, description = ?, location = ?, start_time = ?,
      end_time = ?, all_day = ?, color = ?, category = ?,
      recurrence = ?, recurrence_end_date = ?, reminders_json = ?,
      attendees_json = ?, updated_at = ?
    WHERE id = ?`,
      [
        title,
        description,
        location ?? null,
        start,
        end,
        allDay ? 1 : 0,
        color ?? null,
        category ?? null,
        recurrence,
        recurrenceEndDate ?? null,
        JSON.stringify(reminders),
        JSON.stringify(attendees),
        now,
        id,
      ],
    );

    const updatedEvent: CalendarEvent = {
      id,
      title,
      description,
      location,
      start,
      end,
      allDay,
      color,
      category,
      recurrence,
      recurrenceEndDate,
      reminders,
      attendees,
      createdBy: existing.createdBy,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    res.json({
      success: true,
      data: updatedEvent,
    });
  }),
);

/**
 * DELETE /api/calendar/events/:id
 * Event löschen
 */
router.delete(
  "/events/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await db.run("DELETE FROM calendar_events WHERE id = ?", [
      id,
    ]);

    if (result.changes === 0) {
      throw new NotFoundError("Event not found");
    }

    res.json({
      success: true,
      message: "Event deleted",
    });
  }),
);

/**
 * GET /api/calendar/categories
 * Liste aller Kategorien
 */
router.get(
  "/categories",
  asyncHandler(async (req: Request, res: Response) => {
    const rows = await db.all<{ category: string; count: number }>(
      `SELECT category, COUNT(*) as count 
     FROM calendar_events 
     WHERE category IS NOT NULL 
     GROUP BY category 
     ORDER BY count DESC`,
    );

    res.json({
      success: true,
      data: rows,
    });
  }),
);

/**
 * GET /api/calendar/upcoming
 * Bevorstehende Events (für Erinnerungen)
 */
router.get(
  "/upcoming",
  asyncHandler(async (req: Request, res: Response) => {
    const { minutes = "60" } = req.query;
    const now = new Date();
    const until = new Date(now.getTime() + Number(minutes) * 60 * 1000);

    const rows = await db.all<Record<string, unknown>>(
      `SELECT * FROM calendar_events 
     WHERE start_time BETWEEN ? AND ?
     ORDER BY start_time ASC`,
      [now.toISOString(), until.toISOString()],
    );

    const events = rows.map(rowToEvent);

    res.json({
      success: true,
      data: events,
      timeRange: {
        from: now.toISOString(),
        to: until.toISOString(),
      },
    });
  }),
);

// Helper: Row zu Event
function rowToEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    location: row.location as string | undefined,
    start: row.start_time as string,
    end: row.end_time as string,
    allDay: Boolean(row.all_day),
    color: row.color as string | undefined,
    category: row.category as string | undefined,
    recurrence: (row.recurrence as RecurrenceType) ?? "none",
    recurrenceEndDate: row.recurrence_end_date as string | undefined,
    reminders: JSON.parse((row.reminders_json as string) ?? "[]"),
    attendees: JSON.parse((row.attendees_json as string) ?? "[]"),
    createdBy: (row.created_by as string) ?? "anonymous",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Helper: Wiederkehrende Events expandieren
function expandRecurringEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEvent[] {
  const result: CalendarEvent[] = [];

  for (const event of events) {
    if (event.recurrence === "none") {
      result.push(event);
      continue;
    }

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const duration = eventEnd.getTime() - eventStart.getTime();
    const recurrenceEnd = event.recurrenceEndDate
      ? new Date(event.recurrenceEndDate)
      : rangeEnd;

    let current = new Date(eventStart);
    let instanceCount = 0;
    const maxInstances = 365; // Limit

    while (
      current <= rangeEnd &&
      current <= recurrenceEnd &&
      instanceCount < maxInstances
    ) {
      if (current >= rangeStart) {
        const instanceEnd = new Date(current.getTime() + duration);
        result.push({
          ...event,
          id: `${event.id}-${instanceCount}`,
          start: current.toISOString(),
          end: instanceEnd.toISOString(),
        });
      }

      // Nächstes Vorkommen berechnen
      const next = new Date(current);
      switch (event.recurrence) {
        case "daily":
          next.setDate(next.getDate() + 1);
          break;
        case "weekly":
          next.setDate(next.getDate() + 7);
          break;
        case "biweekly":
          next.setDate(next.getDate() + 14);
          break;
        case "monthly":
          next.setMonth(next.getMonth() + 1);
          break;
        case "yearly":
          next.setFullYear(next.getFullYear() + 1);
          break;
      }
      current = next;

      instanceCount++;
    }
  }

  return result.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
}

export default router;
