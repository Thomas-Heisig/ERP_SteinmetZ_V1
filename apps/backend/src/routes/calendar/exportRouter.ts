// apps/backend/src/routes/calendar/exportRouter.ts

import { Router } from "express";
import { randomUUID } from "crypto";
import db from "../../services/dbService.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createICS } from "../../utils/icsGenerator.js";

const router = Router();

/**
 * GET /api/calendar/export
 * Export calendar events in various formats
 */
router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const { format = "ics", start, end } = req.query;
    
    let sql = "SELECT * FROM calendar_events WHERE 1=1";
    const params: unknown[] = [];

    if (start) {
      sql += " AND start_time >= ?";
      params.push(start);
    }

    if (end) {
      sql += " AND end_time <= ?";
      params.push(end);
    }

    const rows = await db.all<Record<string, unknown>>(sql, params);
    const events = rows.map(rowToEvent);

    switch (format) {
      case "ics": {
        const icsContent = createICS(events);
        res.setHeader("Content-Type", "text/calendar");
        res.setHeader("Content-Disposition", "attachment; filename=calendar.ics");
        res.send(icsContent);
        break;
      }

      case "csv": {
        const csvContent = eventsToCSV(events);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=calendar.csv");
        res.send(csvContent);
        break;
      }

      case "json":
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=calendar.json");
        res.json({
          success: true,
          data: events,
          meta: {
            exportedAt: new Date().toISOString(),
            totalEvents: events.length,
          },
        });
        break;

      default:
        res.status(400).json({
          success: false,
          error: "Unsupported export format",
        });
    }
  })
);

/**
 * POST /api/calendar/import
 * Import calendar events from ICS file
 */
router.post(
  "/import",
  asyncHandler(async (req, res) => {
    const { events, ics, overwrite = false } = req.body as {
      events?: any[];
      ics?: string;
      overwrite?: boolean;
    };

    let importEvents: any[] = Array.isArray(events) ? events : [];
    if (!Array.isArray(events) && typeof ics === "string" && ics.trim().length > 0) {
      try {
        importEvents = parseICS(ics);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Failed to parse ICS content",
        });
      }
    }

    if (!Array.isArray(importEvents)) {
      return res.status(400).json({
        success: false,
        error: "Events array or ICS content is required",
      });
    }

    if (overwrite) {
      await db.run("DELETE FROM calendar_events");
    }

    let imported = 0;
    let skipped = 0;

    for (const event of importEvents) {
      try {
        const id = randomUUID();
        const now = new Date().toISOString();

        await db.run(
          `INSERT INTO calendar_events (
            id, title, description, location, start_time, end_time,
            all_day, color, category, recurrence, recurrence_end_date,
            reminders_json, attendees_json, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            event.title?.trim() || "Unbenannter Termin",
            event.description || "",
            event.location || null,
            event.start || now,
            event.end || now,
            event.allDay ? 1 : 0,
            event.color || null,
            event.category || null,
            event.recurrence || "none",
            event.recurrenceEndDate || null,
            JSON.stringify(event.reminders || []),
            JSON.stringify(event.attendees || []),
            event.createdBy || "import",
            now,
            now,
          ]
        );
        imported++;
      } catch (error) {
        console.error("Failed to import event:", error);
        skipped++;
      }
    }

    res.json({
      success: true,
      data: {
        imported,
        skipped,
        total: importEvents.length,
      },
    });
  })
);

// Helper functions
function eventsToCSV(events: any[]): string {
  const headers = [
    "Title",
    "Description",
    "Start",
    "End",
    "All Day",
    "Location",
    "Category",
    "Color",
    "Recurrence",
    "Attendees",
  ];

  const rows = events.map((event) => [
    `"${event.title.replace(/"/g, '""')}"`,
    `"${event.description.replace(/"/g, '""')}"`,
    event.start,
    event.end,
    event.allDay ? "Yes" : "No",
    `"${(event.location || "").replace(/"/g, '""')}"`,
    `"${(event.category || "").replace(/"/g, '""')}"`,
    event.color || "",
    event.recurrence,
    `"${event.attendees.join("; ")}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function rowToEvent(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    location: row.location as string,
    start: row.start_time as string,
    end: row.end_time as string,
    allDay: Boolean(row.all_day),
    color: row.color as string,
    category: row.category as string,
    recurrence: (row.recurrence as string) ?? "none",
    recurrenceEndDate: row.recurrence_end_date as string,
    reminders: JSON.parse((row.reminders_json as string) ?? "[]"),
    attendees: JSON.parse((row.attendees_json as string) ?? "[]"),
    createdBy: (row.created_by as string) ?? "import",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Very basic ICS parser for VEVENT blocks
function parseICS(ics: string): any[] {
  const lines = ics.replace(/\r\n|\r/g, "\n").split("\n");
  const events: any[] = [];
  let current: any | null = null;

  const flush = () => {
    if (current) {
      // Detect allDay
      const allDay = current.dtstartValueDate || /^(\d{8})$/.test(current.dtstartRaw || "");
      const start = normalizeDateTime(current.dtstartRaw, current.dtstartValueDate);
      const end = normalizeDateTime(current.dtendRaw, current.dtendValueDate);
      const attendees = current.attendees || [];
      events.push({
        id: current.uid || undefined,
        title: current.summary || "Unbenannter Termin",
        description: current.description || "",
        location: current.location || null,
        start,
        end,
        allDay,
        color: current.color || null,
        category: current.categories || null,
        recurrence: "none",
        recurrenceEndDate: null,
        reminders: [],
        attendees,
        createdBy: current.organizer || "import",
      });
    }
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      flush();
      continue;
    }
    if (!current) continue;

    // Property;Params:Value pattern
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const left = line.slice(0, idx);
    const value = line.slice(idx + 1);
    const [prop, ...paramsParts] = left.split(";");
    const params = paramsParts
      .map((p) => p.split("=") as [string, string])
      .reduce((acc, [k, v]) => {
        if (k && v) acc[k.toUpperCase()] = v;
        return acc;
      }, {} as Record<string, string>);

    switch (prop.toUpperCase()) {
      case "UID":
        current.uid = value;
        break;
      case "SUMMARY":
        current.summary = unescapeICS(value);
        break;
      case "DESCRIPTION":
        current.description = unescapeICS(value);
        break;
      case "LOCATION":
        current.location = unescapeICS(value);
        break;
      case "CATEGORIES":
        current.categories = unescapeICS(value);
        break;
      case "COLOR":
        current.color = value;
        break;
      case "ORGANIZER":
        // ORGANIZER may be mailto:
        current.organizer = value.replace(/^mailto:/i, "");
        break;
      case "ATTENDEE":
        {
          const cn = params["CN"] ? unescapeICS(params["CN"]) : undefined;
          const email = value.replace(/^mailto:/i, "");
          current.attendees = current.attendees || [];
          current.attendees.push(email || cn);
        }
        break;
      case "DTSTART":
        current.dtstartRaw = value;
        current.dtstartValueDate = params["VALUE"] === "DATE";
        break;
      case "DTEND":
        current.dtendRaw = value;
        current.dtendValueDate = params["VALUE"] === "DATE";
        break;
    }
  }

  return events;
}

function normalizeDateTime(raw: string | undefined, isDate: boolean | undefined): string {
  if (!raw) return new Date().toISOString();
  if (isDate || /^(\d{8})$/.test(raw)) {
    // YYYYMMDD -> treat as 00:00:00 UTC
    const y = Number(raw.slice(0, 4));
    const m = Number(raw.slice(4, 6)) - 1;
    const d = Number(raw.slice(6, 8));
    return new Date(Date.UTC(y, m, d, 0, 0, 0)).toISOString();
  }
  // YYYYMMDDTHHMMSSZ or without Z
  const hasZ = /Z$/.test(raw);
  if (hasZ) {
    const iso = raw.replace(/^([0-9]{8})T([0-9]{6})Z$/, (match, d, t) => {
      const y = d.slice(0, 4);
      const m = d.slice(4, 6);
      const day = d.slice(6, 8);
      const hh = t.slice(0, 2);
      const mm = t.slice(2, 4);
      const ss = t.slice(4, 6);
      return `${y}-${m}-${day}T${hh}:${mm}:${ss}Z`;
    });
    return new Date(iso).toISOString();
  }
  // Assume local time -> interpret as UTC for simplicity
  const iso = raw.replace(/^([0-9]{8})T([0-9]{6})$/, (match, d, t) => {
    const y = d.slice(0, 4);
    const m = d.slice(4, 6);
    const day = d.slice(6, 8);
    const hh = t.slice(0, 2);
    const mm = t.slice(2, 4);
    const ss = t.slice(4, 6);
    return `${y}-${m}-${day}T${hh}:${mm}:${ss}Z`;
  });
  return new Date(iso).toISOString();
}

function unescapeICS(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

export default router;