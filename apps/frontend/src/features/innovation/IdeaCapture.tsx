// SPDX-License-Identifier: MIT
// apps/frontend/src/features/innovation/IdeaCapture.tsx

import React, { useState } from "react";
import { Button, Input, Card } from "../../components/ui";
import styles from "./IdeaCapture.module.css";

interface IdeaCaptureProps {
  onSubmit?: (idea: {
    title: string;
    description: string;
    tags: string[];
  }) => void;
  onClose?: () => void;
}

export const IdeaCapture: React.FC<IdeaCaptureProps> = ({
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/innovation/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tags,
          phase: "parked",
        }),
      });

      if (response.ok) {
        await response.json();
        onSubmit?.({ title, description, tags });
        setTitle("");
        setDescription("");
        setTags([]);
      }
    } catch (error) {
      console.error("Failed to submit idea:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      title="💡 Idee schnell parken"
      subtitle="Minimale Eingabe für maximale Geschwindigkeit"
      variant="elevated"
    >
      <form onSubmit={handleSubmit}>
        <div className={styles.formContainer}>
          <Input
            label="Titel *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Was ist die Idee?"
            autoFocus
          />

          <div className={styles.textareaWrapper}>
            <label className={styles.label}>Beschreibung (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung..."
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.tagSection}>
            <label className={styles.label}>Tags</label>
            <div className={styles.tagInputRow}>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Tag hinzufügen"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                +
              </Button>
            </div>
            {tags.length > 0 && (
              <div className={styles.tagList}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className={styles.tagRemoveButton}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            {onClose && (
              <Button type="button" variant="ghost" onClick={onClose}>
                Abbrechen
              </Button>
            )}
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!title.trim()}
            >
              🚀 Idee parken
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default IdeaCapture;
