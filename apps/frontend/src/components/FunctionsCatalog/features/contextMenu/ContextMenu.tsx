// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/contextMenu/ContextMenu.tsx

import React, { useEffect, useRef } from "react";
import type { ContextMenuItem } from "./useContextMenu";

export interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

/**
 * Universelles Kontextmenü mit Outside-Click- und Escape-Behandlung.
 */
export default function ContextMenu({
  visible,
  x,
  y,
  items,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Set dynamic position via CSS custom properties
  useEffect(() => {
    if (menuRef.current && visible) {
      const xPos = Number.isFinite(x) ? x : 0;
      const yPos = Number.isFinite(y) ? y : 0;
      menuRef.current.style.setProperty("--context-menu-x", `${xPos}px`);
      menuRef.current.style.setProperty("--context-menu-y", `${yPos}px`);
    }
  }, [visible, x, y]);

  // Outside Click / ESC
  useEffect(() => {
    if (!visible) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div ref={menuRef} className="fc-context-menu" role="menu">
      {items.map((item) =>
        item.divider ? (
          <div key={item.id} className="fc-context-divider" role="separator" />
        ) : (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            className={`fc-context-item ${item.disabled ? "disabled" : ""}`}
            onClick={() => {
              if (!item.disabled) item.onClick?.();
              onClose();
            }}
          >
            {item.icon && <span className="fc-context-icon">{item.icon}</span>}
            <span className="fc-context-label">{item.label}</span>
          </button>
        ),
      )}
    </div>
  );
}
