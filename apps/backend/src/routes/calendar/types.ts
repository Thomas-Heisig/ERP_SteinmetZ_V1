// SPDX-License-Identifier: MIT
// apps/backend/src/routes/calendar/types.ts

/**
 * Calendar Types and Interfaces
 * Zentrale Typdefinitionen für das Calendar-Modul
 */

import { z } from "zod";

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

// Event Status
export const EVENT_STATUS = ["confirmed", "tentative", "cancelled"] as const;

export type EventStatus = (typeof EVENT_STATUS)[number];

// Event Priority
export const EVENT_PRIORITY = ["low", "normal", "high", "urgent"] as const;

export type EventPriority = (typeof EVENT_PRIORITY)[number];

/**
 * Calendar Event Interface
 */
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
  status: EventStatus;
  priority: EventPriority;
  recurrence: RecurrenceType;
  recurrenceEndDate?: string;
  reminders: number[]; // Minutes before event
  attendees: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Erweiterte Felder
  url?: string;
  isPrivate?: boolean;
  organizer?: string;
  timezone?: string;
}

/**
 * Event Attendee mit erweiterten Informationen
 */
export interface EventAttendee {
  email: string;
  name?: string;
  role?: "required" | "optional" | "chair";
  status?: "accepted" | "declined" | "tentative" | "pending";
  responseDate?: string;
}

/**
 * Event Reminder
 */
export interface EventReminder {
  minutes: number;
  method: "email" | "popup" | "sms";
  sent?: boolean;
  sentAt?: string;
}

/**
 * Event Conflict Info
 */
export interface EventConflict {
  eventId: string;
  conflictingEventId: string;
  overlapStart: string;
  overlapEnd: string;
  conflictType: "full" | "partial";
}

/**
 * Calendar Statistics
 */
export interface CalendarStats {
  total: number;
  upcoming: number;
  past: number;
  allDay: number;
  recurring: number;
  withAttendees: number;
  byCategory: Record<string, number>;
  byStatus: Record<EventStatus, number>;
  byPriority: Record<EventPriority, number>;
}

// ==================== Zod Validation Schemas ====================

/**
 * Schema für Event-Erstellung
 */
export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().default(""),
  location: z.string().max(200).optional(),
  start: z.string().datetime({ message: "Invalid ISO datetime" }),
  end: z.string().datetime({ message: "Invalid ISO datetime" }),
  allDay: z.boolean().default(false),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  category: z.string().max(50).optional(),
  status: z.enum(EVENT_STATUS).default("confirmed"),
  priority: z.enum(EVENT_PRIORITY).default("normal"),
  recurrence: z.enum(RECURRENCE_TYPES).default("none"),
  recurrenceEndDate: z.string().datetime().optional(),
  reminders: z.array(z.number().int().min(0)).default([]),
  attendees: z.array(z.string().email()).default([]),
  createdBy: z.string().min(1),
  url: z.string().url().optional(),
  isPrivate: z.boolean().default(false),
  organizer: z.string().email().optional(),
  timezone: z.string().default("UTC"),
});

/**
 * Schema für Event-Update
 */
export const updateEventSchema = createEventSchema.partial().omit({
  createdBy: true,
});

/**
 * Schema für Event-Query-Parameter
 */
export const eventQuerySchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  category: z.string().optional(),
  status: z.enum(EVENT_STATUS).optional(),
  priority: z.enum(EVENT_PRIORITY).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(500),
  offset: z.coerce.number().int().min(0).default(0),
  includePrivate: z.coerce.boolean().default(false),
});

/**
 * Schema für Batch-Operationen
 */
export const batchOperationSchema = z.object({
  action: z.enum([
    "delete",
    "updateCategory",
    "updateStatus",
    "updatePriority",
  ]),
  eventIds: z.array(z.string().uuid()).min(1),
  data: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema für Event-Import
 */
export const importEventsSchema = z.object({
  events: z.array(createEventSchema.partial()).optional(),
  ics: z.string().optional(),
  overwrite: z.boolean().default(false),
});

/**
 * Type Guards
 */
export function isValidRecurrence(value: unknown): value is RecurrenceType {
  return RECURRENCE_TYPES.includes(value as RecurrenceType);
}

export function isValidEventStatus(value: unknown): value is EventStatus {
  return EVENT_STATUS.includes(value as EventStatus);
}

export function isValidEventPriority(value: unknown): value is EventPriority {
  return EVENT_PRIORITY.includes(value as EventPriority);
}
