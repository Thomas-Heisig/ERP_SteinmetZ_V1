// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/history/useHistory.ts

import { useEffect, useState } from "react";
import HistoryStore from "./HistoryStore";
import type { HistoryEntry, NodeDetail } from "../../types";

/**
 * React-Hook für den Verlauf:
 *  - Verlauf abonnieren
 *  - Einträge hinzufügen
 *  - Verlauf löschen
 */
export function useHistory() {
  const store = HistoryStore.get();

  const [entries, setEntries] = useState<HistoryEntry[]>(() => store.getAll());

  /** Listener registrieren */
  useEffect(() => {
    const unsubscribe = store.subscribe((list) => {
      setEntries([...list]);
    });

    return unsubscribe;
  }, [store]);

  /**
   * Fügt einen Node dem Verlauf hinzu.
   * - validiert NodeDetail
   * - ruft store.add() korrekt auf
   */
  const addFromNode = (node: NodeDetail | null | undefined): void => {
    if (!node || typeof node.id !== "string" || !node.id.trim()) {
      console.warn("[useHistory] addFromNode: Ungültiger Node:", node);
      return;
    }

    store.add({
      id: node.id,
      title: node.title,
      icon: node.icon,
      kind: node.kind,
    });
  };

  /** Verlauf löschen */
  const clear = (): void => {
    store.clear();
  };

  return {
    entries,
    addFromNode,
    clear,
  };
}

export default useHistory;
