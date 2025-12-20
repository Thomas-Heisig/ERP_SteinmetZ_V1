// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/index.ts

/**
 * Calendar Feature Module
 *
 * Provides comprehensive calendar and event management functionality:
 * - Multiple view modes (month, week, day, agenda)
 * - Event creation, editing, and deletion
 * - Recurring events support
 * - Category-based filtering
 * - Import/Export capabilities (ICS, CSV, JSON)
 * - Attendee management
 * - Reminders and notifications
 *
 * @module features/calendar
 */

export { Calendar } from "./Calendar";
export { CalendarPage } from "./CalendarPage";
export { EventForm } from "./EventForm";
export { CalendarFilters } from "./CalendarFilters";
export { CalendarToolbar } from "./CalendarToolbar";
export { CalendarAgendaView } from "./CalendarAgendaView";
export { CalendarStats } from "./CalendarStats";

// Types - Export all types from the centralized types file
export type {
  ViewMode,
  RecurrenceType,
  CalendarEvent,
  EventFormData,
  FilterOptions,
  CalendarStatsData,
  ApiResponse,
  CategoryData,
  ExportFormat,
  CalendarProps,
  CalendarFiltersProps,
  CalendarToolbarProps,
  CalendarAgendaViewProps,
  CalendarStatsProps,
  EventFormProps,
} from "./types";
