// SPDX-License-Identifier: MIT
// apps/frontend/src/main.tsx

import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import App from "./App";
import Dashboard from "./components/Dashboard/Dashboard";
import FunctionsCatalog from "./components/FunctionsCatalog/FunctionsCatalog";

// i18n MUSS zuerst geladen werden
import "./components/i18n/i18n";

// Themes & Styles
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/base.css";
import "./styles/light.css";
import "./styles/dark.css";
import "./styles/lcars.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "catalog", element: <FunctionsCatalog /> },
      { path: "ai", element: <div>AI Annotator – folgt später</div> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found.");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
