// SPDX-License-Identifier: MIT
// apps/frontend/src/features/marketing/CampaignForm.tsx

/**
 * Campaign Form Component
 *
 * Form for creating and editing marketing campaigns with validation.
 */

import React, { useState } from "react";
import styles from "./CampaignForm.module.css";

interface CampaignFormData {
  name: string;
  type: string;
  status: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  target_audience: string;
  goals: string;
}

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  onCancel: () => void;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: initialData?.name || "",
    type: initialData?.type || "email",
    status: initialData?.status || "draft",
    description: initialData?.description || "",
    start_date: initialData?.start_date || "",
    end_date: initialData?.end_date || "",
    budget: initialData?.budget || 0,
    target_audience: initialData?.target_audience || "",
    goals: initialData?.goals || "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CampaignFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "budget" ? parseFloat(value) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name as keyof CampaignFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CampaignFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name ist erforderlich";
    } else if (formData.name.length > 200) {
      newErrors.name = "Name darf maximal 200 Zeichen lang sein";
    }

    if (formData.budget < 0) {
      newErrors.budget = "Budget muss positiv sein";
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = "Enddatum muss nach dem Startdatum liegen";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Fehler beim Speichern der Kampagne");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2>
          {initialData ? "Kampagne bearbeiten" : "Neue Kampagne erstellen"}
        </h2>
      </div>

      <div className={styles.formBody}>
        {/* Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Kampagnenname <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            placeholder="z.B. Sommerkampagne 2025"
            required
          />
          {errors.name && (
            <span className={styles.errorText}>{errors.name}</span>
          )}
        </div>

        {/* Type and Status */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>
              Typ <span className={styles.required}>*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="email">E-Mail</option>
              <option value="social">Social Media</option>
              <option value="sem">SEM</option>
              <option value="seo">SEO</option>
              <option value="offline">Offline</option>
              <option value="event">Event</option>
              <option value="telephone">Telefon</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>
              Status <span className={styles.required}>*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="draft">Entwurf</option>
              <option value="planned">Geplant</option>
              <option value="active">Aktiv</option>
              <option value="paused">Pausiert</option>
              <option value="completed">Abgeschlossen</option>
              <option value="cancelled">Abgebrochen</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Beschreibung
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
            placeholder="Beschreiben Sie die Kampagne..."
            rows={4}
          />
        </div>

        {/* Dates */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="start_date" className={styles.label}>
              Startdatum
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="end_date" className={styles.label}>
              Enddatum
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={`${styles.input} ${errors.end_date ? styles.inputError : ""}`}
            />
            {errors.end_date && (
              <span className={styles.errorText}>{errors.end_date}</span>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className={styles.formGroup}>
          <label htmlFor="budget" className={styles.label}>
            Budget (€)
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className={`${styles.input} ${errors.budget ? styles.inputError : ""}`}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          {errors.budget && (
            <span className={styles.errorText}>{errors.budget}</span>
          )}
        </div>

        {/* Target Audience */}
        <div className={styles.formGroup}>
          <label htmlFor="target_audience" className={styles.label}>
            Zielgruppe
          </label>
          <input
            type="text"
            id="target_audience"
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            className={styles.input}
            placeholder="z.B. Bestandskunden, Neukunden, etc."
          />
        </div>

        {/* Goals */}
        <div className={styles.formGroup}>
          <label htmlFor="goals" className={styles.label}>
            Ziele (JSON)
          </label>
          <textarea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            className={styles.textarea}
            placeholder='{"conversions": 100, "revenue": 50000}'
            rows={3}
          />
          <span className={styles.helpText}>
            JSON-Format: Ziele und KPIs der Kampagne
          </span>
        </div>
      </div>

      <div className={styles.formFooter}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={submitting}
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting
            ? "Wird gespeichert..."
            : initialData
              ? "Speichern"
              : "Erstellen"}
        </button>
      </div>
    </form>
  );
};

export default CampaignForm;
