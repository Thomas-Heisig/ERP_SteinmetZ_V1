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
import Login from "./pages/Login/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// i18n MUSS zuerst geladen werden
import "./components/i18n/i18n";

// Themes & Styles
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/base.css";
import "./styles/light.css";
import "./styles/dark.css";
import "./styles/lcars.css";
import "./styles/contrast.css";

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    ),
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: "catalog",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <FunctionsCatalog />
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: "ai",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <div>AI Annotator – folgt später</div>
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
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
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
