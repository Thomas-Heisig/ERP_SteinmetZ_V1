// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/CalendarAgendaView.tsx

/**
 * CalendarAgendaView Component
 * 
 * Displays calendar events in a chronological agenda/list view.
 * Events are grouped by day with expandable sections.
 * 
 * @remarks
 * Features:
 * - Events grouped by day
 * - Expandable/collapsible day sections
 * - Event time and duration display
 * - Location and attendee information
 * - Edit and delete actions
 * - Color-coded event indicators
 * - Smart date labels (Today, Tomorrow, Yesterday)
 * 
 * @example
 * ```tsx
 * <CalendarAgendaView
 *   events={myEvents}
 *   onEventClick={handleClick}
 *   onEventEdit={handleEdit}
 *   onEventDelete={handleDelete}
 * />
 * ```
 */

import React, { useState, useMemo } from "react";
import { Button, Card } from "../../components/ui";
import styles from "./Calendar.module.css";
import { CalendarEvent } from "./Calendar";

interface CalendarAgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => Promise<void>;
}

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  events,
  onEventClick,
  onEventEdit,
  onEventDelete,
}) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const groupedEvents = useMemo(() => {
    const grouped = events.reduce((acc, event) => {
      const date = new Date(event.start).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    // Sort events within each day
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.start).getTime() - new Date(b.start).getTime()
      );
    });

    // Sort days
    return Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as Record<string, CalendarEvent[]>);
  }, [events]);

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Heute";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Morgen";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Gestern";
    }

    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (dateString: string, allDay: boolean) => {
    if (allDay) return "Ganztägig";
    
    const date = new Date(dateString);
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (start: string, end: string, allDay: boolean) => {
    if (allDay) return "";
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  return (
    <div className={styles.agendaView}>
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <Card key={date} variant="outlined" className={styles.agendaDay}>
          <div 
            className={styles.agendaDayHeader}
            onClick={() => toggleDay(date)}
          >
            <div className={styles.agendaDayTitle}>
              <h3>{formatDate(date)}</h3>
              <span className={styles.eventCount}>{dayEvents.length} Termine</span>
            </div>
            <span className={styles.expandIcon}>
              {expandedDays.has(date) ? "▲" : "▼"}
            </span>
          </div>

          {expandedDays.has(date) && (
            <div className={styles.agendaDayContent}>
              {dayEvents.map((event) => (
                <div 
                  key={event.id} 
                  className={styles.agendaEvent}
                  onClick={() => onEventClick(event)}
                >
                  <div 
                    className={styles.eventColorIndicator}
                    data-color={event.color || "#4f46e5"}
                  />
                  
                  <div className={styles.eventContent}>
                    <div className={styles.eventHeader}>
                      <h4 className={styles.eventTitle}>{event.title}</h4>
                      <div className={styles.eventActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventEdit(event);
                          }}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm("Termin wirklich löschen?")) {
                              await onEventDelete(event.id);
                            }
                          }}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                    
                    <div className={styles.eventDetails}>
                      <div className={styles.eventTime}>
                        <span className={styles.eventIcon}>🕐</span>
                        <span>
                          {formatTime(event.start, event.allDay)}
                          {!event.allDay && ` - ${formatTime(event.end, false)}`}
                          {!event.allDay && ` (${getDuration(event.start, event.end, false)})`}
                        </span>
                      </div>
                      
                      {event.location && (
                        <div className={styles.eventLocation}>
                          <span className={styles.eventIcon}>📍</span>
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.category && (
                        <span className={styles.categoryBadge}>{event.category}</span>
                      )}
                      
                      {event.attendees && event.attendees.length > 0 && (
                        <div className={styles.eventAttendees}>
                          <span className={styles.eventIcon}>👥</span>
                          <span>{event.attendees.length} Teilnehmer</span>
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className={styles.eventDescription}>
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default CalendarAgendaView;