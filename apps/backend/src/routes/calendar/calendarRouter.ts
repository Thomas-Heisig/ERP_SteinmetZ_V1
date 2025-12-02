// SPDX-License-Identifier: MIT
// apps/backend/src/routes/calendar/calendarRouter.ts

import { Router, Request, Response } from "express";
import db from "../../services/dbService.js";

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
router.get("/events", async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("❌ [Calendar] GET /events error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/calendar/events/:id
 * Einzelnes Event abrufen
 */
router.get("/events/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = await db.get<Record<string, unknown>>(
      "SELECT * FROM calendar_events WHERE id = ?",
      [id],
    );

    if (!row) {
      res.status(404).json({
        success: false,
        error: "Event not found",
      });
      return;
    }

    res.json({
      success: true,
      data: rowToEvent(row),
    });
  } catch (error) {
    console.error("❌ [Calendar] GET /events/:id error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/calendar/events
 * Neues Event erstellen
 */
router.post("/events", async (req: Request, res: Response) => {
  try {
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
      res.status(400).json({
        success: false,
        error: "Title is required",
      });
      return;
    }

    if (!start || !end) {
      res.status(400).json({
        success: false,
        error: "Start and end times are required",
      });
      return;
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
  } catch (error) {
    console.error("❌ [Calendar] POST /events error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * PUT /api/calendar/events/:id
 * Event aktualisieren
 */
router.put("/events/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingRow = await db.get<Record<string, unknown>>(
      "SELECT * FROM calendar_events WHERE id = ?",
      [id],
    );

    if (!existingRow) {
      res.status(404).json({
        success: false,
        error: "Event not found",
      });
      return;
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
  } catch (error) {
    console.error("❌ [Calendar] PUT /events/:id error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * DELETE /api/calendar/events/:id
 * Event löschen
 */
router.delete("/events/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.run("DELETE FROM calendar_events WHERE id = ?", [
      id,
    ]);

    if (result.changes === 0) {
      res.status(404).json({
        success: false,
        error: "Event not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Event deleted",
    });
  } catch (error) {
    console.error("❌ [Calendar] DELETE /events/:id error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/calendar/categories
 * Liste aller Kategorien
 */
router.get("/categories", async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("❌ [Calendar] GET /categories error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/calendar/upcoming
 * Bevorstehende Events (für Erinnerungen)
 */
router.get("/upcoming", async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("❌ [Calendar] GET /upcoming error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

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
      switch (event.recurrence) {
        case "daily":
          current.setDate(current.getDate() + 1);
          break;
        case "weekly":
          current.setDate(current.getDate() + 7);
          break;
        case "biweekly":
          current.setDate(current.getDate() + 14);
          break;
        case "monthly":
          current.setMonth(current.getMonth() + 1);
          break;
        case "yearly":
          current.setFullYear(current.getFullYear() + 1);
          break;
      }

      instanceCount++;
    }
  }

  return result.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
}

export default router;
