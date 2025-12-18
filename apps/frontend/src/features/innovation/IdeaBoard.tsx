// SPDX-License-Identifier: MIT
// apps/frontend/src/features/innovation/IdeaBoard.tsx

import React, { useState, useEffect } from "react";
import styles from "./IdeaBoard.module.css";

type IdeaPhase =
  | "parked"
  | "analysis"
  | "development"
  | "testing"
  | "completed"
  | "archived";

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

const PHASES: { key: IdeaPhase; label: string; icon: string; color: string }[] =
  [
    { key: "parked", label: "Geparkt", icon: "🅿️", color: "var(--gray-500)" },
    {
      key: "analysis",
      label: "In Analyse",
      icon: "🔍",
      color: "var(--info-500)",
    },
    {
      key: "development",
      label: "In Entwicklung",
      icon: "🛠️",
      color: "var(--warning-500)",
    },
    {
      key: "testing",
      label: "Testing",
      icon: "🧪",
      color: "var(--primary-500)",
    },
    {
      key: "completed",
      label: "Abgeschlossen",
      icon: "✅",
      color: "var(--success-500)",
    },
  ];

export const IdeaBoard: React.FC<IdeaBoardProps> = ({
  onIdeaClick,
  onPhaseChange,
}) => {
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
      const response = await fetch(
        `/api/innovation/ideas/${draggedIdea.id}/phase`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: targetPhase }),
        },
      );

      if (response.ok) {
        // Update local state
        setIdeas((prev) => {
          const newIdeas = { ...prev };
          newIdeas[draggedIdea.phase] = newIdeas[draggedIdea.phase].filter(
            (i) => i.id !== draggedIdea.id,
          );
          newIdeas[targetPhase] = [
            ...newIdeas[targetPhase],
            { ...draggedIdea, phase: targetPhase },
          ];
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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.ideaBoard}>
      {PHASES.map((phase) => (
        <div
          key={phase.key}
          className={styles.ideaColumn}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, phase.key)}
        >
          <div className={styles.columnHeader} data-phase-color={phase.color}>
            <span className={styles.phaseIcon}>{phase.icon}</span>
            <h3 className={styles.phaseTitle}>{phase.label}</h3>
            <span className={styles.ideaCount}>
              {ideas[phase.key]?.length || 0}
            </span>
          </div>

          <div className={styles.ideasContainer}>
            {ideas[phase.key]?.map((idea) => (
              <div
                key={idea.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idea)}
                onClick={() => onIdeaClick?.(idea)}
                className={styles.ideaCard}
              >
                <h4 className={styles.ideaTitle}>{idea.title}</h4>
                {idea.description && (
                  <p className={styles.ideaDescription}>{idea.description}</p>
                )}
                {idea.tags.length > 0 && (
                  <div className={styles.ideaTags}>
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.ideaTag}>
                        {tag}
                      </span>
                    ))}
                    {idea.tags.length > 3 && (
                      <span className={styles.moreTagsBadge}>
                        +{idea.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className={styles.ideaFooter}>
                  <span>👤 {idea.author}</span>
                  <span>
                    {new Date(idea.createdAt).toLocaleDateString("de-DE")}
                  </span>
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
