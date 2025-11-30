// SPDX-License-Identifier: MIT
// src/components/Dashboard/hooks/useDashboardNavigation.ts

import { useCallback } from "react";
import { useDashboardContext } from "../core/DashboardContext";
import type { UseDashboardNavigation, NavigationParams } from "../types";

/**
 * useDashboardNavigation – kapselt Navigation über den globalen Dashboard-State.
 *
 * Keine UI, kein Routing, reine Zustandsverwaltung.
 */
export function useDashboardNavigation(): UseDashboardNavigation {
  const { state, dispatch } = useDashboardContext();

  /**
   * Navigation: Neuer View + History-Eintrag
   */
  const navigate = useCallback(
    (view: string, params: NavigationParams = {}) => {
      dispatch({
        type: "NAV_PUSH",
        payload: {
          id: crypto.randomUUID(),
          view,
          params,
          timestamp: new Date(),
          title: params?.title ?? view,
        },
      });
    },
    [dispatch]
  );

  /**
   * Zurück navigieren
   */
  const goBack = useCallback(() => {
    dispatch({ type: "NAV_POP" });
  }, [dispatch]);

  /**
   * Vorwärts navigieren (falls unterstützt)
   */
  const goForward = useCallback(() => {
    // Dein Reducer kennt kein NAV_FORWARD,
    // daher setzen wir NAV_PUSH mit dem letzten Forward-State.
    dispatch({ type: "NAV_PUSH", payload: state.navigation.history[state.navigation.currentIndex + 1] });
  }, [dispatch, state.navigation.history, state.navigation.currentIndex]);

  return {
    currentView: state.navigation.currentView,
    navigate,
    goBack,
    goForward,
    history: state.navigation.history,
    canGoBack: state.navigation.canGoBack,
    canGoForward: state.navigation.canGoForward,
  };
}

export default useDashboardNavigation;
