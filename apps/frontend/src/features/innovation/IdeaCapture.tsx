// SPDX-License-Identifier: MIT
// apps/frontend/src/features/innovation/IdeaCapture.tsx

import React, { useState } from "react";
import { Button, Input, Card } from "../../components/ui";

interface IdeaCaptureProps {
  onSubmit?: (idea: { title: string; description: string; tags: string[] }) => void;
  onClose?: () => void;
}

export const IdeaCapture: React.FC<IdeaCaptureProps> = ({ onSubmit, onClose }) => {
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
        const data = await response.json();
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input
            label="Titel *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Was ist die Idee?"
            autoFocus
          />

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Beschreibung (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung..."
              rows={3}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Tags
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
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
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.25rem 0.5rem",
                      background: "var(--primary-100)",
                      color: "var(--primary-700)",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: "1rem",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            {onClose && (
              <Button type="button" variant="ghost" onClick={onClose}>
                Abbrechen
              </Button>
            )}
            <Button type="submit" loading={isSubmitting} disabled={!title.trim()}>
              🚀 Idee parken
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default IdeaCapture;
