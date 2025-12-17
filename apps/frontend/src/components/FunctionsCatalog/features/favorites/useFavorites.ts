// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/features/favorites/useFavorites.ts

import { useEffect, useState } from "react";
import FavoritesStore from "./FavoritesStore";
import type { FavoriteEntry, NodeDetail } from "../../types";

/**
 * React Hook für Favoriten:
 *  - liefert reaktive Liste der Favoriten
 *  - kann Favoriten hinzufügen/entfernen
 *  - kann Favoriten basierend auf NodeDetail anlegen
 */
export function useFavorites() {
  const store = FavoritesStore.get();

  const [favorites, setFavorites] = useState<FavoriteEntry[]>(() =>
    store.getAll(),
  );

  // Echtzeit-Updates aktivieren
  useEffect(() => {
    const unsubscribe = store.subscribe((list) => {
      setFavorites([...list]);
    });
    return unsubscribe;
  }, [store]);

  /**
   * Legt einen Favoriten aus NodeDetail an.
   * - defensive Checks, da NodeDetail KEINE Pflichtfelder "tags" oder "categories" hat
   */
  const addFromNode = (node: NodeDetail): void => {
    const nodeExtended = node as NodeDetail & {
      tags?: unknown;
      categories?: unknown;
    };

    store.add({
      id: node.id,
      title: node.title,
      kind: node.kind,
      icon: node.icon,
      addedAt: new Date().toISOString(),

      // Nur setzen, wenn vorhanden → verhindert Typfehler
      tags: Array.isArray(nodeExtended.tags)
        ? (nodeExtended.tags as string[])
        : undefined,

      category:
        Array.isArray(nodeExtended.categories) &&
        (nodeExtended.categories as unknown[]).length > 0
          ? (nodeExtended.categories as string[])[0]
          : undefined,
    });
  };

  return {
    favorites,

    /** Utilities */
    isFavorite: (id: string) => store.isFavorite(id),

    /** Rohmethoden */
    addFavorite: (entry: FavoriteEntry) => store.add(entry),
    removeFavorite: (id: string) => store.remove(id),
    toggleFavorite: (id: string, node?: NodeDetail) => store.toggle(id, node),

    clearFavorites: () => store.clear(),

    /** Komfort-API */
    addFromNode,
  };
}

export default useFavorites;
