// SPDX-License-Identifier: MIT
// src/components/Dashboard/hooks/useDashboardLogic.ts

import { useMemo } from "react";

import { useDashboardContext } from "../core/DashboardContext";

import { useDashboardSearch } from "./useDashboardSearch";
import { useDashboardNavigation } from "./useDashboardNavigation";
import { useDashboardHealth } from "./useDashboardHealth";
import { useDashboardLayout } from "./useDashboardLayout";

/**
 * useDashboardLogic – zentraler Logik-Binder.
 *
 * Stellt eine einheitliche, aufbereitete Schnittstelle bereit:
 * - Navigation
 * - Suche
 * - Health
 * - Layout
 * - UI-Helper (Chat, Overlay)
 *
 * Keine Netzwerklogik, keine Renderinglogik.
 */
export function useDashboardLogic() {
  const { state, dispatch } = useDashboardContext();

  /* --------------------------------------------
   * Navigation
   * -------------------------------------------- */
  const navigation = useDashboardNavigation();

  /* --------------------------------------------
   * Search
   * -------------------------------------------- */
  const search = useDashboardSearch();

  /* --------------------------------------------
   * Health
   * -------------------------------------------- */
  const health = useDashboardHealth();

  /* --------------------------------------------
   * Layout
   * -------------------------------------------- */
  const layout = useDashboardLayout();

  /* --------------------------------------------
   * UI Helper
   * -------------------------------------------- */
  function toggleChat(): void {
    dispatch({ type: "TOGGLE_CHAT" });
  }

  function openSearchOverlay(): void {
    dispatch({ type: "SET_SEARCH_ACTIVE", payload: true });
  }

  function closeSearchOverlay(): void {
    dispatch({ type: "SET_SEARCH_ACTIVE", payload: false });
  }

  /* --------------------------------------------
   * Aggregiertes Interface
   * -------------------------------------------- */
  return useMemo(
    () => ({
      state,
      navigation,
      search,
      health,
      layout,
      toggleChat,
      openSearchOverlay,
      closeSearchOverlay,
    }),
    [state, navigation, search, health, layout]
  );
}

export default useDashboardLogic;
