// SPDX-License-Identifier: MIT
// src/components/Dashboard/core/useDashboard.ts

import React from "react";
import { DashboardContext } from "./DashboardContext";

/**
 * Hook to access Dashboard context
 * Must be used within a DashboardProvider
 */
export const useDashboard = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
