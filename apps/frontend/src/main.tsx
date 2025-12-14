// SPDX-License-Identifier: MIT
// apps/frontend/src/main.tsx

import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./routes";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { getVersionInfo } from "./version";

// i18n MUSS zuerst geladen werden
import "./components/i18n/i18n";

// Themes & Styles
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/theme/variables.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/light.css";
import "./styles/dark.css";
import "./styles/lcars.css";
import "./styles/contrast.css";

// Display version info in console (allowed for startup diagnostics)
const versionInfo = getVersionInfo();
/* eslint-disable no-console */
console.info("========================================================");
console.info("🧱 ERP-SteinmetZ Frontend");
console.info("========================================================");
console.info(`📌 Version:           ${versionInfo.version}`);
console.info(`🕒 Build:             ${versionInfo.buildDate}`);
console.info(`🔧 Environment:       ${versionInfo.environment}`);
console.info("========================================================");
/* eslint-enable no-console */

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found.");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
