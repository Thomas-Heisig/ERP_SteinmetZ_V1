// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/favorites/FavoritesStore.ts

import { useEffect, useState } from "react";
import type { FavoriteEntry, NodeKind, NodeDetail } from "../../types";

/* -------------------------------------------------------------------------- */
/*                               STORE-TYPEN                                  */
/* -------------------------------------------------------------------------- */

export type FavoritesListener = (entries: FavoriteEntry[]) => void;

const STORAGE_KEY = "fc.favorites.v2";

/* -------------------------------------------------------------------------- */
/*                               FAVORITEN-STORE                              */
/* -------------------------------------------------------------------------- */

class FavoritesStore {
  private static instance: FavoritesStore;

  private entries: FavoriteEntry[] = [];
  private listeners = new Set<FavoritesListener>();

  private constructor() {
    this.load();
  }

  static get(): FavoritesStore {
    if (!FavoritesStore.instance) {
      FavoritesStore.instance = new FavoritesStore();
    }
    return FavoritesStore.instance;
  }

  /* ---------------------------------------------------------------------- */
  /*                                 STORAGE                                */
  /* ---------------------------------------------------------------------- */

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      // Migration: alte Version (nur String-IDs)
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        this.entries = parsed.map((id) => ({
          id,
          title: id,
          kind: "item" as NodeKind,
          addedAt: new Date().toISOString(),
        }));
        this.save();
        return;
      }

      if (Array.isArray(parsed)) {
        this.entries = parsed.filter((e) => typeof e?.id === "string");
      }
    } catch {
      this.entries = [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      /* Storage voll – ignorieren */
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                              LISTENER API                               */
  /* ---------------------------------------------------------------------- */

  private notify(): void {
    for (const cb of this.listeners) {
      cb([...this.entries]);
    }
  }

  subscribe(cb: FavoritesListener): () => void {
    this.listeners.add(cb);
    cb([...this.entries]);
    return () => this.listeners.delete(cb);
  }

  /* ---------------------------------------------------------------------- */
  /*                                   API                                   */
  /* ---------------------------------------------------------------------- */

  getAll(): FavoriteEntry[] {
    return [...this.entries];
  }

  isFavorite(id: string): boolean {
    return this.entries.some((e) => e.id === id);
  }

  /** Favorit aus NodeDetail erstellen */
  addFromNode(node: NodeDetail): void {
    this.add({
      id: node.id,
      title: node.title,
      icon: node.icon,
      kind: node.kind,

      // defensiv: nur setzen, wenn existiert (keine Typfehler)
      tags: Array.isArray((node as any).tags) ? (node as any).tags : undefined,
      category:
        Array.isArray((node as any).categories) &&
        (node as any).categories.length > 0
          ? (node as any).categories[0]
          : undefined,

      addedAt: new Date().toISOString(),
    });
  }

  add(entry: FavoriteEntry): void {
    if (!entry.id) return;

    const exists = this.entries.some((e) => e.id === entry.id);
    if (!exists) {
      this.entries.push(entry);
      this.save();
      this.notify();
    }
  }

  remove(id: string): void {
    const before = this.entries.length;
    this.entries = this.entries.filter((e) => e.id !== id);

    if (this.entries.length !== before) {
      this.save();
      this.notify();
    }
  }

  toggle(id: string, node?: NodeDetail): void {
    if (this.isFavorite(id)) {
      this.remove(id);
    } else if (node) {
      this.addFromNode(node);
    }
  }

  clear(): void {
    this.entries = [];
    this.save();
    this.notify();
  }
}

/* -------------------------------------------------------------------------- */
/*                             EXPORT SINGLETON                               */
/* -------------------------------------------------------------------------- */

export default FavoritesStore;

/* -------------------------------------------------------------------------- */
/*                           REACT HOOK – useFavorites                        */
/* -------------------------------------------------------------------------- */

export function useFavorites() {
  const store = FavoritesStore.get();

  const [favorites, setFavorites] = useState<FavoriteEntry[]>(store.getAll());

  useEffect(() => {
    return store.subscribe((list) => {
      setFavorites([...list]);
    });
  }, [store]);

  return {
    favorites,
    isFavorite: (id: string) => store.isFavorite(id),
    addFavorite: (entry: FavoriteEntry) => store.add(entry),
    addFromNode: (node: NodeDetail) => store.addFromNode(node),
    removeFavorite: (id: string) => store.remove(id),
    toggleFavorite: (id: string, node?: NodeDetail) => store.toggle(id, node),
    clearFavorites: () => store.clear(),
  };
}
