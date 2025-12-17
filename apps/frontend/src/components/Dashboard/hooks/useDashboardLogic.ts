// SPDX-License-Identifier: MIT
// src/components/Dashboard/hooks/useDashboardLogic.ts

import { useMemo, useCallback } from "react";

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
  const toggleChat = useCallback(() => {
    dispatch({ type: "TOGGLE_CHAT" });
  }, [dispatch]);

  const openSearchOverlay = useCallback(() => {
    dispatch({ type: "SET_SEARCH_ACTIVE", payload: true });
  }, [dispatch]);

  const closeSearchOverlay = useCallback(() => {
    dispatch({ type: "SET_SEARCH_ACTIVE", payload: false });
  }, [dispatch]);

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
    [
      state,
      navigation,
      search,
      health,
      layout,
      toggleChat,
      openSearchOverlay,
      closeSearchOverlay,
    ],
  );
}

export default useDashboardLogic;
