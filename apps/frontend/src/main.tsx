// SPDX-License-Identifier: MIT
// apps/frontend/src/main.tsx

import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import App from "./App";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { getVersionInfo } from "./version";

// Lazy load heavy components for better initial load time
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const FunctionsCatalog = lazy(
  () => import("./components/FunctionsCatalog/FunctionsCatalog"),
);
const Login = lazy(() => import("./pages/Login/Login"));

// Loading fallback component with improved UX
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      gap: "1rem",
      background: "var(--bg, #f8fafc)",
      color: "var(--text, #1e293b)",
    }}
  >
    <div
      style={{
        fontSize: "2rem",
        animation: "pulse 2s ease-in-out infinite",
      }}
    >
      🧱
    </div>
    <div style={{ fontSize: "1rem", fontWeight: 500 }}>
      ERP SteinmetZ lädt...
    </div>
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.95); }
      }
    `}</style>
  </div>
);

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
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
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
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: "catalog",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <FunctionsCatalog />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        ),
      },
      {
        path: "ai",
        element: (
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <div>AI Annotator – folgt später</div>
              </Suspense>
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

// Display version info in console
const versionInfo = getVersionInfo();
console.log("========================================================");
console.log("🧱 ERP-SteinmetZ Frontend");
console.log("========================================================");
console.log(`📌 Version:           ${versionInfo.version}`);
console.log(`🕒 Build:             ${versionInfo.buildDate}`);
console.log(`🔧 Environment:       ${versionInfo.environment}`);
console.log("========================================================");

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
