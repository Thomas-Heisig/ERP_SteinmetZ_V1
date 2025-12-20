// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/EventFormSimple.tsx

/**
 * Simple EventForm Component (Temporary)
 * 
 * Simplified form without advanced UI components.
 * TODO: Replace with full EventForm once all UI components are available.
 */

import React, { useState } from "react";
import { Button, Modal, Input } from "../../components/ui";
import styles from "./Calendar.module.css";
import { Notification } from "./utils/notification";
import { EventFormData } from "./types";

interface EventFormSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  initialData?: Partial<EventFormData>;
  mode: "create" | "edit";
}

export const EventFormSimple: React.FC<EventFormSimpleProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    start: initialData?.start || new Date().toISOString(),
    end: initialData?.end || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    allDay: initialData?.allDay || false,
    color: initialData?.color || "#4f46e5",
    category: initialData?.category || "",
    recurrence: initialData?.recurrence || "none",
    recurrenceEndDate: initialData?.recurrenceEndDate || "",
    reminders: initialData?.reminders || [],
    attendees: initialData?.attendees || [],
    createdBy: initialData?.createdBy || "user@example.com",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      Notification.success({
        title: mode === "create" ? "Termin erstellt" : "Termin aktualisiert",
        message: `Der Termin "${formData.title}" wurde erfolgreich ${mode === "create" ? "erstellt" : "aktualisiert"}.`,
      });
      onClose();
    } catch {
      Notification.error({
        title: "Fehler",
        message: `Termin konnte nicht ${mode === "create" ? "erstellt" : "aktualisiert"} werden.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Neuer Termin" : "Termin bearbeiten"}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Titel *</label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Termintitel"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Ort</label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Ort"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="start">Start</label>
            <Input
              id="start"
              type="datetime-local"
              value={formData.start.substring(0, 16)}
              onChange={(e) => setFormData((prev) => ({ ...prev, start: new Date(e.target.value).toISOString() }))}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="end">Ende</label>
            <Input
              id="end"
              type="datetime-local"
              value={formData.end.substring(0, 16)}
              onChange={(e) => setFormData((prev) => ({ ...prev, end: new Date(e.target.value).toISOString() }))}
              required
            />
          </div>

          <div className={styles.formGroupFull}>
            <label htmlFor="description">Beschreibung</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung des Termins"
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.allDay}
                onChange={(e) => setFormData((prev) => ({ ...prev, allDay: e.target.checked }))}
              />
              <span> Ganztägig</span>
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button type="button" variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Wird gespeichert..." : mode === "create" ? "Erstellen" : "Speichern"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EventFormSimple;
