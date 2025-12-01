// SPDX-License-Identifier: MIT
// apps/frontend/src/features/innovation/IdeaBoard.tsx

import React, { useState, useEffect } from "react";
import { Card, Button } from "../../components/ui";

type IdeaPhase = "parked" | "analysis" | "development" | "testing" | "completed" | "archived";

interface Idea {
  id: string;
  title: string;
  description: string;
  phase: IdeaPhase;
  priority: number;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface IdeaBoardProps {
  onIdeaClick?: (idea: Idea) => void;
  onPhaseChange?: (ideaId: string, newPhase: IdeaPhase) => void;
}

const PHASES: { key: IdeaPhase; label: string; icon: string; color: string }[] = [
  { key: "parked", label: "Geparkt", icon: "🅿️", color: "var(--gray-500)" },
  { key: "analysis", label: "In Analyse", icon: "🔍", color: "var(--info-500)" },
  { key: "development", label: "In Entwicklung", icon: "🛠️", color: "var(--warning-500)" },
  { key: "testing", label: "Testing", icon: "🧪", color: "var(--primary-500)" },
  { key: "completed", label: "Abgeschlossen", icon: "✅", color: "var(--success-500)" },
];

export const IdeaBoard: React.FC<IdeaBoardProps> = ({ onIdeaClick, onPhaseChange }) => {
  const [ideas, setIdeas] = useState<Record<IdeaPhase, Idea[]>>({
    parked: [],
    analysis: [],
    development: [],
    testing: [],
    completed: [],
    archived: [],
  });
  const [loading, setLoading] = useState(true);
  const [draggedIdea, setDraggedIdea] = useState<Idea | null>(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await fetch("/api/innovation/board");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIdeas(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, idea: Idea) => {
    setDraggedIdea(idea);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetPhase: IdeaPhase) => {
    e.preventDefault();
    if (!draggedIdea || draggedIdea.phase === targetPhase) return;

    try {
      const response = await fetch(`/api/innovation/ideas/${draggedIdea.id}/phase`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: targetPhase }),
      });

      if (response.ok) {
        // Update local state
        setIdeas((prev) => {
          const newIdeas = { ...prev };
          newIdeas[draggedIdea.phase] = newIdeas[draggedIdea.phase].filter(
            (i) => i.id !== draggedIdea.id
          );
          newIdeas[targetPhase] = [...newIdeas[targetPhase], { ...draggedIdea, phase: targetPhase }];
          return newIdeas;
        });
        onPhaseChange?.(draggedIdea.id, targetPhase);
      }
    } catch (error) {
      console.error("Failed to update phase:", error);
    }

    setDraggedIdea(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid var(--gray-200)",
            borderTopColor: "var(--primary-500)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="idea-board"
      style={{
        display: "flex",
        gap: "1rem",
        overflowX: "auto",
        padding: "1rem 0",
      }}
    >
      {PHASES.map((phase) => (
        <div
          key={phase.key}
          className="idea-column"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, phase.key)}
          style={{
            minWidth: "280px",
            maxWidth: "320px",
            flex: "1",
            display: "flex",
            flexDirection: "column",
            background: "var(--gray-50)",
            borderRadius: "12px",
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              padding: "0.5rem",
              borderBottom: `3px solid ${phase.color}`,
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>{phase.icon}</span>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>
              {phase.label}
            </h3>
            <span
              style={{
                marginLeft: "auto",
                padding: "0.125rem 0.5rem",
                background: "var(--gray-200)",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {ideas[phase.key]?.length || 0}
            </span>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              minHeight: "200px",
            }}
          >
            {ideas[phase.key]?.map((idea) => (
              <div
                key={idea.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idea)}
                onClick={() => onIdeaClick?.(idea)}
                style={{
                  padding: "1rem",
                  background: "var(--surface)",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "grab",
                  border: "1px solid var(--border)",
                  transition: "all 0.2s ease",
                }}
              >
                <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                  {idea.title}
                </h4>
                {idea.description && (
                  <p
                    style={{
                      margin: "0 0 0.5rem",
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {idea.description}
                  </p>
                )}
                {idea.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "0.125rem 0.375rem",
                          background: "var(--primary-50)",
                          color: "var(--primary-700)",
                          borderRadius: "4px",
                          fontSize: "0.625rem",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {idea.tags.length > 3 && (
                      <span
                        style={{
                          padding: "0.125rem 0.375rem",
                          background: "var(--gray-100)",
                          color: "var(--text-tertiary)",
                          borderRadius: "4px",
                          fontSize: "0.625rem",
                        }}
                      >
                        +{idea.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.625rem",
                    color: "var(--text-tertiary)",
                  }}
                >
                  <span>👤 {idea.author}</span>
                  <span>{new Date(idea.createdAt).toLocaleDateString("de-DE")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default IdeaBoard;
