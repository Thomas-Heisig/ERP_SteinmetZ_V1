// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/CalendarPage.tsx

/**
 * CalendarPage Component
 * 
 * Main page component for the calendar feature that orchestrates all calendar
 * functionality including view switching, filtering, import/export, and statistics.
 * 
 * @remarks
 * Features:
 * - Multiple view modes (month, week, day, agenda)
 * - Filter integration (category, search, date range)
 * - Import/Export functionality (ICS, CSV, JSON)
 * - Event statistics
 * - Real-time event synchronization
 * - Print support
 * 
 * @example
 * ```tsx
 * <CalendarPage />
 * ```
 */

import React, { useCallback, useEffect, useState } from "react";
import styles from "./Calendar.module.css";
import { Calendar, CalendarEvent } from "./Calendar";
import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarFilters } from "./CalendarFilters";
import { CalendarAgendaView } from "./CalendarAgendaView";
import { CalendarStats } from "./CalendarStats";

export type ViewMode = "month" | "week" | "day" | "agenda";

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

export const CalendarPage: React.FC = () => {
  const [view, setView] = useState<ViewMode>("month");
  const [filters, setFilters] = useState<FilterOptions>({
    category: [],
    search: "",
    dateRange: null,
    showAllDay: true,
    showRecurring: true,
  });
  const [agendaEvents, setAgendaEvents] = useState<CalendarEvent[]>([]);

  const handleViewChange = useCallback((v: ViewMode) => setView(v), []);

  const handleImport = async (file: File) => {
    const text = await file.text();
    const res = await fetch("/api/calendar/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ics: text, overwrite: false }),
    });
    if (!res.ok) throw new Error("Import failed");
  };

  const handlePrint = () => {
    window.print();
  };

  // Fetch for agenda view based on filters/dateRange
  useEffect(() => {
    if (view !== "agenda") return;
    const fetchEvents = async (): Promise<void> => {
      try {
        const range = filters.dateRange || {
          start: new Date(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
        const params = new URLSearchParams({
          start: range.start.toISOString(),
          end: range.end.toISOString(),
        });
        if (filters.search) params.set("search", filters.search);
        if (filters.category.length === 1) params.set("category", filters.category[0]);
        const resp = await fetch(`/api/calendar/events?${params.toString()}`);
        if (resp.ok) {
          const data = await resp.json() as { success: boolean; data: CalendarEvent[] };
          if (data.success) setAgendaEvents(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch agenda events", e);
      }
    };
    fetchEvents();
  }, [view, filters]);

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <CalendarToolbar
          onViewChange={handleViewChange}
          onImport={async (file) => {
            try {
              await handleImport(file);
              // Import successful
            } catch (error) {
              console.error("Import fehlgeschlagen", error);
            }
          }}
          onPrint={handlePrint}
          currentView={view}
        />
      </div>

      <CalendarFilters onFilterChange={setFilters} />

      <div className={styles.calendarWrapper}>
        {view === "agenda" ? (
          <CalendarAgendaView
            events={agendaEvents}
            onEventClick={() => {}}
            onEventEdit={() => {}}
            onEventDelete={async () => {}}
          />
        ) : (
          <Calendar
            viewMode={view}
            onViewChange={(v) => setView(v)}
            onEventClick={() => {}}
            onDateClick={() => {}}
            filters={{
              category: filters.category,
              search: filters.search,
            }}
          />
        )}
      </div>

      <CalendarStats events={view === "agenda" ? agendaEvents : []} />
    </div>
  );
};

export default CalendarPage;
