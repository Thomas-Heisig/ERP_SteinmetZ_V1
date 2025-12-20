// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/CalendarToolbar.tsx

/**
 * CalendarToolbar Component
 * 
 * Provides toolbar functionality for the calendar including view switching,
 * import/export, and print capabilities.
 * 
 * @remarks
 * Features:
 * - View mode buttons (month, week, day, agenda)
 * - Import calendar data (ICS format)
 * - Export calendar data (ICS, CSV, JSON)
 * - Print functionality
 * - Create new event button
 * 
 * @example
 * ```tsx
 * <CalendarToolbar
 *   onViewChange={(view) => setView(view)}
 *   onImport={handleImport}
 *   onPrint={handlePrint}
 *   currentView="month"
 * />
 * ```
 */

import React, { useState } from "react";
import { Button } from "../../components/ui";
import styles from "./Calendar.module.css";

interface CalendarToolbarProps {
  onViewChange: (view: "month" | "week" | "day" | "agenda") => void;
  onImport: (file: File) => Promise<void>;
  onPrint: () => void;
  currentView: string;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  onViewChange,
  onImport,
  onPrint,
  currentView,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"ics" | "csv" | "json">(
    "ics"
  );

  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/calendar/export?format=${exportFormat}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `calendar-export-${new Date().toISOString().split("T")[0]}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        // Export successful
      }
    } catch {
      console.error("Export fehlgeschlagen");
    }
    setShowExportModal(false);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await onImport(file);
        // Import successful
      } catch {
        console.error("Import fehlgeschlagen");
      }
    }
  };

  const views = [
    { id: "month", label: "Monat", icon: "📅" },
    { id: "week", label: "Woche", icon: "📆" },
    { id: "day", label: "Tag", icon: "📋" },
    { id: "agenda", label: "Agenda", icon: "📝" },
  ];

  return (
    <div className={styles.toolbar}>
      <div className={styles.viewButtons}>
        {views.map((view) => (
          <Button
            key={view.id}
            variant={currentView === view.id ? "primary" : "ghost"}
            size="sm"
            onClick={() => onViewChange(view.id as "month" | "week" | "day" | "agenda")}
          >
            {view.icon} {view.label}
          </Button>
        ))}
      </div>

      <div className={styles.toolbarActions}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExportModal(!showExportModal)}
        >
          📥 Import/Export
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            // Event creation would be triggered from parent
          }}
        >
          ➕ Neuer Termin
        </Button>
      </div>

      {showExportModal && (
        <div className={styles.exportModal}>
          <div className={styles.modalContent}>
            <h3>Import/Export</h3>
            <div className={styles.modalActions}>
              <label className={styles.importButton}>
                📤 Import (.ics)
                <input
                  type="file"
                  accept=".ics"
                  onChange={handleImport}
                  className={styles.fileInput}
                />
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                📥 Export ({exportFormat.toUpperCase()})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
              >
                🖨️ Drucken
              </Button>
            </div>
            <div className={styles.formatSelector}>
              <label>
                Format:
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as "ics" | "csv" | "json")}
                >
                  <option value="ics">ICS</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExportModal(false)}
            >
              Schließen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarToolbar;