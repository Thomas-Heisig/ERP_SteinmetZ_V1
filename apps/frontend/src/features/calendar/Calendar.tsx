// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/Calendar.tsx

/**
 * Calendar component with month, week, and day views
 * 
 * @example
 * ```tsx
 * <Calendar
 *   onEventClick={(event) => console.log(event)}
 *   onDateClick={(date) => console.log(date)}
 *   onEventCreate={(start, end) => createEvent(start, end)}
 * />
 * ```
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Card, Modal } from "../../components/ui";
import styles from "./Calendar.module.css";

type ViewMode = "month" | "week" | "day";

/**
 * Calendar event interface
 */
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
  category?: string;
}

/**
 * Calendar component props
 */
interface CalendarProps {
  /** Callback when an event is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Callback when a date is clicked */
  onDateClick?: (date: Date) => void;
  /** Callback when a new event should be created */
  onEventCreate?: (start: Date, end: Date) => void;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/**
 * Calendar component with multiple view modes
 */
export const Calendar: React.FC<CalendarProps> = ({
  onEventClick,
  onDateClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const getDateRange = useCallback(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === "month") {
      start.setDate(1);
      start.setDate(start.getDate() - start.getDay() + 1);
      end.setMonth(end.getMonth() + 1, 0);
      end.setDate(end.getDate() + (7 - end.getDay()));
    } else if (viewMode === "week") {
      start.setDate(start.getDate() - start.getDay() + 1);
      end.setDate(start.getDate() + 6);
    }

    return { start, end };
  }, [currentDate, viewMode]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { start, end } = getDateRange();

      try {
        const response = await fetch(
          `/api/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setEvents(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    fetchEvents();
  }, [getDateRange]);

  const navigatePeriod = useCallback((direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const goToToday = useCallback(() => setCurrentDate(new Date()), []);

  const monthDays = useMemo(() => {
    const days: Date[] = [];
    const { start, end } = getDateRange();

    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [getDateRange]);

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const formatTitle = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <Card variant="elevated" padding="none">
      {/* Header */}
      <div className={styles.headerWrapper}>
        <div className={styles.headerControls}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigatePeriod(-1)}
          >
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Heute
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigatePeriod(1)}>
            →
          </Button>
          <h2 className={styles.headerTitle}>
            {formatTitle()}
          </h2>
        </div>

        <div className={styles.viewButtons}>
          {(["month", "week", "day"] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
            >
              {mode === "month" ? "Monat" : mode === "week" ? "Woche" : "Tag"}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === "month" && (
        <div className={styles.monthView}>
          {/* Weekday Headers */}
          <div className={styles.weekdayHeader}>
            {WEEKDAYS.map((day) => (
              <div key={day} className={styles.weekdayCell}>
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className={styles.daysGrid}>
            {monthDays.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const cellClasses = [
                styles.dayCell,
                !isCurrentMonth(date) && styles.dayCellOtherMonth,
              ].filter(Boolean).join(" ");
              const numberClasses = [
                styles.dayNumber,
                isToday(date) && styles.dayNumberToday,
              ].filter(Boolean).join(" ");

              return (
                <div
                  key={index}
                  onClick={() => onDateClick?.(date)}
                  className={cellClasses}
                >
                  <div className={numberClasses}>
                    {date.getDate()}
                  </div>

                  <div className={styles.eventsContainer}>
                    {dayEvents.slice(0, 3).map((event) => (
                      // Dynamic CSS variable for custom event colors - CSS Modules cannot handle dynamic colors
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          onEventClick?.(event);
                        }}
                        className={styles.eventItem}
                        style={
                          event.color
                            ? ({ "--event-bg": event.color } as React.CSSProperties)
                            : undefined
                        }
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className={styles.moreEvents}>
                        +{dayEvents.length - 3} mehr
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "week" && (
        <div className={styles.viewPlaceholder}>
          <p className={styles.placeholderText}>
            Wochenansicht - Drag &amp; Drop verfügbar
          </p>
          {/* Week view implementation would go here */}
        </div>
      )}

      {viewMode === "day" && (
        <div className={styles.viewPlaceholder}>
          <p className={styles.placeholderText}>
            Tagesansicht - Detaillierte Zeitplanung
          </p>
          {/* Day view implementation would go here */}
        </div>
      )}

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || "Termin"}
        size="md"
      >
        {selectedEvent && (
          <div className={styles.eventDetails}>
            <div>
              <strong>Beschreibung:</strong>
              <p>{selectedEvent.description || "Keine Beschreibung"}</p>
            </div>
            <div>
              <strong>Start:</strong>
              <p>{new Date(selectedEvent.start).toLocaleString("de-DE")}</p>
            </div>
            <div>
              <strong>Ende:</strong>
              <p>{new Date(selectedEvent.end).toLocaleString("de-DE")}</p>
            </div>
            {selectedEvent.category && (
              <div>
                <strong>Kategorie:</strong>
                <p>{selectedEvent.category}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default Calendar;
