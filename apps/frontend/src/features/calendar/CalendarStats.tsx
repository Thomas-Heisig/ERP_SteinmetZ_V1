// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/CalendarStats.tsx

/**
 * CalendarStats Component
 * 
 * Displays statistical information about calendar events including:
 * - Total, upcoming, weekly, and daily event counts
 * - Category distribution with visual progress bars
 * - Busiest day of the week
 * - Average event duration
 * 
 * @remarks
 * Automatically calculates statistics based on provided events array.
 * Updates in real-time when events change.
 * 
 * @example
 * ```tsx
 * <CalendarStats events={myEvents} />
 * ```
 */

import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui";
import styles from "./Calendar.module.css";
import { CalendarEvent } from "./Calendar";

interface CalendarStatsData {
  totalEvents: number;
  upcomingEvents: number;
  eventsThisWeek: number;
  eventsToday: number;
  byCategory: Record<string, number>;
  busiestDay: string;
  averageDuration: number;
}

interface CalendarStatsProps {
  events: CalendarEvent[];
}

export const CalendarStats: React.FC<CalendarStatsProps> = ({ events }) => {
  const [stats, setStats] = useState<CalendarStatsData>({
    totalEvents: 0,
    upcomingEvents: 0,
    eventsThisWeek: 0,
    eventsToday: 0,
    byCategory: {},
    busiestDay: "",
    averageDuration: 0,
  });

  useEffect(() => {
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  const calculateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    let totalDuration = 0;
    const categoryCount: Record<string, number> = {};
    const dayCount: Record<string, number> = {};

    const upcoming = events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart > now;
    });

    const thisWeek = events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= weekStart && eventStart <= weekEnd;
    });

    const todayEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      return (
        eventStart.getDate() === today.getDate() &&
        eventStart.getMonth() === today.getMonth() &&
        eventStart.getFullYear() === today.getFullYear()
      );
    });

    events.forEach(event => {
      // Category stats
      if (event.category) {
        categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
      }

      // Day of week stats
      const day = new Date(event.start).toLocaleDateString('de-DE', { weekday: 'long' });
      dayCount[day] = (dayCount[day] || 0) + 1;

      // Duration stats
      if (!event.allDay) {
        const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
        totalDuration += duration;
      }
    });

    // Find busiest day
    let busiestDay = "";
    let maxCount = 0;
    Object.entries(dayCount).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        busiestDay = day;
      }
    });

    setStats({
      totalEvents: events.length,
      upcomingEvents: upcoming.length,
      eventsThisWeek: thisWeek.length,
      eventsToday: todayEvents.length,
      byCategory: categoryCount,
      busiestDay,
      averageDuration: events.length > 0 ? totalDuration / events.length : 0,
    });
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  return (
    <div className={styles.statsContainer}>
      <Card variant="elevated" className={styles.statsCard}>
        <h3 className={styles.statsTitle}>Kalender-Statistiken</h3>
        
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📅</span>
            <div className={styles.statValue}>{stats.totalEvents}</div>
            <div className={styles.statLabel}>Gesamt</div>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🕒</span>
            <div className={styles.statValue}>{stats.upcomingEvents}</div>
            <div className={styles.statLabel}>Bevorstehend</div>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📆</span>
            <div className={styles.statValue}>{stats.eventsThisWeek}</div>
            <div className={styles.statLabel}>Diese Woche</div>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statIcon}>☀️</span>
            <div className={styles.statValue}>{stats.eventsToday}</div>
            <div className={styles.statLabel}>Heute</div>
          </div>
        </div>
        
        <div className={styles.statsSection}>
          <h4>Verteilung nach Kategorien</h4>
          <div className={styles.categoryStats}>
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className={styles.categoryItem}>
                <div className={styles.categoryHeader}>
                  <div 
                    className={styles.categoryColor}
                  />
                  <span className={styles.categoryName}>{category}</span>
                  <span className={styles.categoryCount}>{count}</span>
                </div>
                <div 
                  className={styles.progressBar}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.statsSection}>
          <h4>Weitere Statistiken</h4>
          <div className={styles.additionalStats}>
            <div className={styles.additionalStat}>
              <span>📊</span>
              <span>Beliebtester Tag: {stats.busiestDay || "Keine Daten"}</span>
            </div>
            <div className={styles.additionalStat}>
              <span>⏳</span>
              <span>Durchschnittliche Dauer: {formatDuration(stats.averageDuration)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarStats;