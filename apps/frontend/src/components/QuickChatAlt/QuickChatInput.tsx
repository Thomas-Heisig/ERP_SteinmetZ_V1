// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QuickChatAlt/QuickChatInput.tsx

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui";

const COMMANDS = [
  { command: "/rechnung", description: "Rechnung erstellen" },
  { command: "/angebot", description: "Angebot erstellen" },
  { command: "/bericht", description: "Bericht generieren" },
  { command: "/idee", description: "Idee parken" },
  { command: "/termin", description: "Termin erstellen" },
  { command: "/suche", description: "Im System suchen" },
  { command: "/hilfe", description: "Hilfe anzeigen" },
];

interface QuickChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const QuickChatInput: React.FC<QuickChatInputProps> = ({
  onSend,
  disabled,
}) => {
  const [input, setInput] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.startsWith("/")) {
      const search = input.toLowerCase();
      const filtered = COMMANDS.filter(
        (c) =>
          c.command.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search.slice(1)),
      );
      setFilteredCommands(filtered);
      setShowCommands(filtered.length > 0);
      setSelectedCommandIndex(0);
    } else {
      setShowCommands(false);
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      setShowCommands(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCommands) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1,
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        if (filteredCommands.length > 0 && !input.includes(" ")) {
          e.preventDefault();
          setInput(filteredCommands[selectedCommandIndex].command + " ");
          setShowCommands(false);
        }
      } else if (e.key === "Escape") {
        setShowCommands(false);
      }
    }
  };

  const selectCommand = (command: string) => {
    setInput(command + " ");
    setShowCommands(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Command Autocomplete */}
      {showCommands && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            right: 0,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            marginBottom: "0.5rem",
            boxShadow: "var(--shadow-lg)",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {filteredCommands.map((cmd, index) => (
            <button
              key={cmd.command}
              onClick={() => selectCommand(cmd.command)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                background:
                  index === selectedCommandIndex
                    ? "var(--primary-50)"
                    : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "var(--primary-600)",
                }}
              >
                {cmd.command}
              </span>
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
              >
                {cmd.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nachricht eingeben oder / für Befehle..."
          disabled={disabled}
          style={{
            flex: 1,
            padding: "0.75rem 1rem",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "1rem",
            outline: "none",
            background: "var(--surface)",
            color: "var(--text-primary)",
            transition: "border-color 0.2s ease",
          }}
        />
        <Button type="submit" disabled={disabled || !input.trim()}>
          ➤
        </Button>
      </form>

      {/* Quick Actions */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {["/idee", "/rechnung", "/termin"].map((cmd) => (
          <button
            key={cmd}
            onClick={() => selectCommand(cmd)}
            style={{
              padding: "0.25rem 0.5rem",
              background: "var(--gray-100)",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.75rem",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickChatInput;
