// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/types.ts

/**
 * Calendar Types Module
 *
 * Centralized type definitions for the calendar feature.
 * All components should import from this file to ensure type consistency.
 *
 * @module features/calendar/types
 */

/**
 * View modes for the calendar
 */
export type ViewMode = "month" | "week" | "day" | "agenda";

/**
 * Recurrence types for recurring events
 */
export type RecurrenceType =
  | "none"
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "yearly";

/**
 * Calendar event interface
 * Represents a single calendar event with all its properties
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location?: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
  category?: string;
  recurrence?: RecurrenceType;
  recurrenceEndDate?: string;
  reminders?: number[];
  attendees?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Event form data interface
 */
export interface EventFormData {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
  category?: string;
  recurrence?: string;
  recurrenceEndDate?: string;
  reminders?: number[];
  attendees?: string[];
  createdBy?: string;
}

/**
 * Filter options for calendar events
 */
export interface FilterOptions {
  category: string[];
  search: string;
  dateRange: { start: Date; end: Date } | null;
  showAllDay: boolean;
  showRecurring: boolean;
}

/**
 * Calendar statistics data
 */
export interface CalendarStatsData {
  totalEvents: number;
  upcomingEvents: number;
  eventsThisWeek: number;
  eventsToday: number;
  byCategory: Record<string, number>;
  busiestDay: string;
  averageDuration: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Category data
 */
export interface CategoryData {
  category: string;
  count?: number;
  color?: string;
}

/**
 * Export format options
 */
export type ExportFormat = "ics" | "csv" | "json";

/**
 * Props for Calendar component
 */
export interface CalendarProps {
  /** Callback when an event is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Callback when a date is clicked */
  onDateClick?: (date: Date) => void;
  /** Callback when a new event should be created */
  onEventCreate?: (start: Date, end: Date) => void;
  /** Controlled view mode */
  viewMode?: ViewMode;
  /** Notify view changes */
  onViewChange?: (view: ViewMode) => void;
  /** Optional filters (category, search) */
  filters?: { category?: string[]; search?: string };
}

/**
 * Props for CalendarFilters component
 */
export interface CalendarFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

/**
 * Props for CalendarToolbar component
 */
export interface CalendarToolbarProps {
  onViewChange: (view: ViewMode) => void;
  onImport: (file: File) => Promise<void>;
  onPrint: () => void;
  currentView: string;
}

/**
 * Props for CalendarAgendaView component
 */
export interface CalendarAgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => Promise<void>;
}

/**
 * Props for CalendarStats component
 */
export interface CalendarStatsProps {
  events: CalendarEvent[];
}

/**
 * Props for EventForm component
 */
export interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  initialData?: Partial<EventFormData>;
  mode: "create" | "edit";
}
