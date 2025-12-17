// SPDX-License-Identifier: MIT
// src/components/Dashboard/hooks/useDashboardShortcuts.ts

import { useCallback, useEffect, useRef } from "react";
import type { UseDashboardShortcuts } from "../types";

/**
 * useDashboardShortcuts – verwaltet Tastenkombinationen.
 *
 * Verantwortlichkeiten:
 * - globale Keydown-Listener
 * - Registrierung individueller Shortcuts
 * - De-Registrierung
 * - Bereitstellung einer einfachen API
 */
export function useDashboardShortcuts(): UseDashboardShortcuts {
  // lokale Registry
  const shortcutsRef = useRef<
    Map<string, { handler: () => void; description: string }>
  >(new Map());

  const registerShortcut = useCallback(
    (key: string, handler: () => void, description: string) => {
      shortcutsRef.current.set(key.toLowerCase(), { handler, description });
    },
    [],
  );

  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current.delete(key.toLowerCase());
  }, []);

  const showHelp = useCallback(() => {
    // Log shortcuts for debugging (only in development)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.table(
        Array.from(shortcutsRef.current.entries()).map(([key, v]) => ({
          key,
          description: v.description,
        })),
      );
    }
  }, []);

  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent): void {
      const pressed = [];

      if (ev.ctrlKey) pressed.push("ctrl");
      if (ev.shiftKey) pressed.push("shift");
      if (ev.altKey) pressed.push("alt");

      pressed.push(ev.key.toLowerCase());

      const combo = pressed.join("+");

      const entry = shortcutsRef.current.get(combo);
      if (entry) {
        ev.preventDefault();
        entry.handler();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return {
    registerShortcut,
    unregisterShortcut,
    showHelp,
  };
}

export default useDashboardShortcuts;
