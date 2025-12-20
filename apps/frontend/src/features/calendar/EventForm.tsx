// SPDX-License-Identifier: MIT
// apps/frontend/src/features/calendar/EventForm.tsx

/**
 * EventForm Component
 *
 * Simplified modal form for creating and editing calendar events.
 * Uses only available UI components (Button, Modal, Input, Select).
 *
 * @remarks
 * Features:
 * - Create new events or edit existing ones
 * - All-day event toggle
 * - Basic recurring event support
 * - Attendee email list (comma-separated)
 * - Category selection
 * - Location field
 * - Form validation
 *
 * @example
 * ```tsx
 * <EventForm
 *   isOpen={showForm}
 *   onClose={() => setShowForm(false)}
 *   onSubmit={handleEventSubmit}
 *   mode="create"
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import type { EventFormData } from "./types";
import styles from "./Calendar.module.css";

/**
 * Props for the EventForm component
 */
export interface EventFormProps {
  /** Whether the form modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Callback when the form is submitted with valid data */
  onSubmit: (data: EventFormData) => void;
  /** Existing event data for edit mode */
  event?: EventFormData;
  /** Form mode - 'create' or 'edit' */
  mode: "create" | "edit";
}

/**
 * EventForm - Simplified form for creating and editing calendar events
 *
 * This component provides a modal form with all essential fields for event management.
 * It handles validation, state management, and data submission.
 */
export const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  event,
  mode,
}) => {
  // Generate initial dates outside of useState to avoid impure function during render
  const getInitialDates = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 3600000);
    return {
      start: now.toISOString().slice(0, 16),
      end: oneHourLater.toISOString().slice(0, 16),
    };
  };

  // Calculate initial form data based on mode and event
  const getInitialFormData = (): EventFormData => {
    if (event && mode === "edit") {
      return {
        ...event,
        start:
          typeof event.start === "string"
            ? event.start.slice(0, 16)
            : event.start,
        end: typeof event.end === "string" ? event.end.slice(0, 16) : event.end,
        attendees: event.attendees || [],
      };
    }

    const initialDates = getInitialDates();
    return {
      title: "",
      start: initialDates.start,
      end: initialDates.end,
      allDay: false,
      location: "",
      description: "",
      category: "",
      color: "#3b82f6",
      recurrence: "none",
      attendees: [],
    };
  };

  const [formData, setFormData] = useState<EventFormData>(getInitialFormData);

  const [categories, setCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories
  useEffect(() => {
    const loadCategories = async (): Promise<void> => {
      try {
        const response = await fetch("/api/calendar/categories");
        if (response.ok) {
          const data = (await response.json()) as {
            success: boolean;
            data: Array<{ category: string }>;
          };
          if (data.success) {
            setCategories(data.data.map((item) => item.category));
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, []);

  /**
   * Handle input field changes
   */
  const handleInputChange = useCallback(
    (field: keyof EventFormData, value: string | boolean | string[]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    },
    [],
  );

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Titel ist erforderlich";
    }

    if (!formData.start) {
      newErrors.start = "Startzeit ist erforderlich";
    }

    if (!formData.end) {
      newErrors.end = "Endzeit ist erforderlich";
    }

    if (formData.start && formData.end) {
      const startDate = new Date(formData.start);
      const endDate = new Date(formData.end);
      if (endDate <= startDate) {
        newErrors.end = "Endzeit muss nach Startzeit liegen";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      onSubmit(formData);
      onClose();
    },
    [formData, validateForm, onSubmit, onClose],
  );

  /**
   * Handle modal close with reset
   */
  const handleClose = useCallback(() => {
    const dates = getInitialDates();
    setFormData({
      title: "",
      start: dates.start,
      end: dates.end,
      allDay: false,
      location: "",
      description: "",
      category: "",
      color: "#3b82f6",
      recurrence: "none",
      attendees: [],
    });
    setErrors({});
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "create" ? "Neues Event erstellen" : "Event bearbeiten"}
    >
      <form onSubmit={handleSubmit} className={styles.eventForm}>
        {/* Title */}
        <div className={styles.formGroup}>
          <label htmlFor="title">
            Titel<span className={styles.requiredField}>*</span>
          </label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Event-Titel"
          />
          {errors.title && <span className={styles.error}>{errors.title}</span>}
        </div>

        {/* All Day Checkbox */}
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={formData.allDay}
              onChange={(e) => handleInputChange("allDay", e.target.checked)}
            />
            {" Ganztägig"}
          </label>
        </div>

        {/* Start Date/Time */}
        <div className={styles.formGroup}>
          <label htmlFor="start">
            Start<span className={styles.requiredField}>*</span>
          </label>
          <input
            id="start"
            type={formData.allDay ? "date" : "datetime-local"}
            value={formData.start}
            onChange={(e) => handleInputChange("start", e.target.value)}
            className={styles.input}
          />
          {errors.start && <span className={styles.error}>{errors.start}</span>}
        </div>

        {/* End Date/Time */}
        <div className={styles.formGroup}>
          <label htmlFor="end">
            Ende<span className={styles.requiredField}>*</span>
          </label>
          <input
            id="end"
            type={formData.allDay ? "date" : "datetime-local"}
            value={formData.end}
            onChange={(e) => handleInputChange("end", e.target.value)}
            className={styles.input}
          />
          {errors.end && <span className={styles.error}>{errors.end}</span>}
        </div>

        {/* Location */}
        <div className={styles.formGroup}>
          <label htmlFor="location">Ort</label>
          <Input
            id="location"
            type="text"
            value={formData.location || ""}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="Event-Ort"
          />
        </div>

        {/* Category */}
        <div className={styles.formGroup}>
          <label htmlFor="category">Kategorie</label>
          <select
            id="category"
            value={formData.category || ""}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className={styles.input}
          >
            <option value="">Keine Kategorie</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div className={styles.formGroup}>
          <label htmlFor="color">Farbe</label>
          <input
            id="color"
            type="color"
            value={formData.color || "#3b82f6"}
            onChange={(e) => handleInputChange("color", e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description">Beschreibung</label>
          <textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Event-Beschreibung"
            rows={4}
            className={styles.input}
          />
        </div>

        {/* Recurrence */}
        <div className={styles.formGroup}>
          <label htmlFor="recurrence">Wiederkehrend</label>
          <select
            id="recurrence"
            value={formData.recurrence || "none"}
            onChange={(e) => handleInputChange("recurrence", e.target.value)}
            className={styles.input}
          >
            <option value="none">Nicht wiederkehrend</option>
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
            <option value="monthly">Monatlich</option>
            <option value="yearly">Jährlich</option>
          </select>
        </div>

        {/* Attendees */}
        <div className={styles.formGroup}>
          <label htmlFor="attendees">
            Teilnehmer (E-Mails, durch Komma getrennt)
          </label>
          <Input
            id="attendees"
            type="text"
            value={formData.attendees?.join(", ") || ""}
            onChange={(e) =>
              handleInputChange(
                "attendees",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="email1@example.com, email2@example.com"
          />
        </div>

        {/* Buttons */}
        <div className={styles.formActions}>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary">
            {mode === "create" ? "Erstellen" : "Speichern"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
