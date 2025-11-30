// SPDX-License-Identifier: MIT
// src/components/Dashboard/hooks/useDashboardLayout.ts

import { useDashboardContext } from "../core/DashboardContext";
import type { DashboardLayout, Category, UseDashboardLayout } from "../types";

export function useDashboardLayout(): UseDashboardLayout {
  const { state, dispatch } = useDashboardContext();

  const layout = state.builder.layout;

  return {
    layout,

    updateLayout: (updates) => {
      dispatch({
        type: "SET_LAYOUT",
        payload: { ...layout, ...updates },
      });
    },

    addCategory: (category: Category) => {
      dispatch({
        type: "SET_LAYOUT",
        payload: {
          ...layout,
          categories: [...layout.categories, category],
        },
      });
    },

    removeCategory: (id: string) => {
      dispatch({
        type: "SET_LAYOUT",
        payload: {
          ...layout,
          categories: layout.categories.filter((c) => c.id !== id),
        },
      });
    },
  };
}

export default useDashboardLayout;
