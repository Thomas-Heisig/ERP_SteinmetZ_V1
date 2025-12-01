// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/history/HistoryStore.ts

import type { HistoryEntry, NodeKind } from "../../types";

export type HistoryListener = (entries: HistoryEntry[]) => void;

const STORAGE_KEY = "fc.history";
const MAX_HISTORY = 50;

/**
 * Zentraler Verlaufsspeicher für den FunctionsCatalog.
 * Implementiert als Singleton, speichert in localStorage.
 */
export default class HistoryStore {
  private static instance: HistoryStore;

  private listeners: HistoryListener[] = [];
  private entries: HistoryEntry[] = [];

  private constructor() {
    this.load();
  }

  /** Singleton-Zugriff */
  static get(): HistoryStore {
    if (!HistoryStore.instance) {
      HistoryStore.instance = new HistoryStore();
    }
    return HistoryStore.instance;
  }

  /* ------------------------------------------------------------
     Persistenz
  ------------------------------------------------------------ */

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.entries = [];
        return;
      }

      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        this.entries = parsed.filter(
          (e) => typeof e?.id === "string" && e?.viewedAt,
        );
      } else {
        this.entries = [];
      }
    } catch {
      this.entries = [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      /* Speicher voll → ignorieren */
    }
  }

  /* ------------------------------------------------------------
     Listener-Mechanismus
  ------------------------------------------------------------ */

  subscribe(cb: HistoryListener): () => void {
    this.listeners.push(cb);
    cb([...this.entries]);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    for (const cb of this.listeners) {
      cb([...this.entries]);
    }
  }

  /* ------------------------------------------------------------
     API
  ------------------------------------------------------------ */

  /**
   * Fügt einen Verlaufseintrag hinzu.
   */
  add(entry: {
    id: string;
    title: string;
    icon?: string;
    kind: NodeKind;
  }): void {
    if (!entry.id) return;

    const newEntry: HistoryEntry = {
      id: entry.id,
      title: entry.title,
      icon: entry.icon,
      kind: entry.kind, // ← Pflichtfeld, darum korrekt
      viewedAt: Date.now(),
      action: "view",
    };

    this.entries = [
      newEntry,
      ...this.entries.filter((e) => e.id !== newEntry.id),
    ].slice(0, MAX_HISTORY);

    this.save();
    this.notify();
  }

  /** Verlauf löschen */
  clear(): void {
    this.entries = [];
    this.save();
    this.notify();
  }

  /** Verlauf abrufen */
  getAll(): HistoryEntry[] {
    return [...this.entries];
  }
}
