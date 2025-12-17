// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/Calendar.tsx

import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Modal } from "../../components/ui";

type ViewMode = "month" | "week" | "day";

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

interface CalendarProps {
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
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

export const Calendar: React.FC<CalendarProps> = ({
  onEventClick,
  onDateClick,
  onEventCreate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewMode]);

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
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
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
  };

  const navigatePeriod = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const monthDays = useMemo(() => {
    const days: Date[] = [];
    const { start, end } = getDateRange();

    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate, viewMode]);

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
            {formatTitle()}
          </h2>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
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
        <div style={{ padding: "1rem" }}>
          {/* Weekday Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "1px",
              marginBottom: "0.5rem",
            }}
          >
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                style={{
                  padding: "0.5rem",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "1px",
              background: "var(--border)",
            }}
          >
            {monthDays.map((date, index) => {
              const dayEvents = getEventsForDate(date);

              return (
                <div
                  key={index}
                  onClick={() => onDateClick?.(date)}
                  style={{
                    background: "var(--surface)",
                    minHeight: "100px",
                    padding: "0.5rem",
                    cursor: "pointer",
                    opacity: isCurrentMonth(date) ? 1 : 0.5,
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      fontSize: "0.875rem",
                      fontWeight: isToday(date) ? 600 : 400,
                      background: isToday(date)
                        ? "var(--primary-500)"
                        : "transparent",
                      color: isToday(date) ? "white" : "var(--text-primary)",
                    }}
                  >
                    {date.getDate()}
                  </div>

                  <div style={{ marginTop: "0.25rem" }}>
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          onEventClick?.(event);
                        }}
                        style={{
                          padding: "0.125rem 0.375rem",
                          marginBottom: "0.125rem",
                          background: event.color || "var(--primary-100)",
                          color: "var(--primary-700)",
                          borderRadius: "4px",
                          fontSize: "0.625rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div
                        style={{
                          fontSize: "0.625rem",
                          color: "var(--text-tertiary)",
                          textAlign: "center",
                        }}
                      >
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
        <div style={{ padding: "1rem" }}>
          <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>
            Wochenansicht - Drag &amp; Drop verfügbar
          </p>
          {/* Week view implementation would go here */}
        </div>
      )}

      {viewMode === "day" && (
        <div style={{ padding: "1rem" }}>
          <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
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
