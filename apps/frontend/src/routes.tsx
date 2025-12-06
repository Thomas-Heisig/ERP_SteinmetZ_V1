// SPDX-License-Identifier: MIT
// apps/frontend/src/routes.tsx

import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "./App";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));
const FunctionsCatalog = lazy(
  () => import("./components/FunctionsCatalog/FunctionsCatalog"),
);
const Login = lazy(() => import("./pages/Login/Login"));
const AiAnnotatorRouter = lazy(
  () => import("./components/aiAnnotatorRouter/aiAnnotatorRouter"),
);

// Features - lazy loaded
const Calendar = lazy(() => import("./features/calendar/Calendar"));
const Settings = lazy(() => import("./features/settings/Settings"));
const CommunicationCenter = lazy(
  () => import("./features/communication/CommunicationCenter"),
);
const EmployeeList = lazy(() => import("./features/hr/EmployeeList"));
const InvoiceList = lazy(() => import("./features/finance/InvoiceList"));
const CustomerList = lazy(() => import("./features/crm/CustomerList"));
const InventoryList = lazy(() => import("./features/inventory/InventoryList"));
const ProjectList = lazy(() => import("./features/projects/ProjectList"));
const IdeaBoard = lazy(() => import("./features/innovation/IdeaBoard"));

// Loading fallback component
const LoadingFallback = () => {
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.95); }
      }
      .loading-icon {
        animation: pulse 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
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
      <div className="loading-icon" style={{ fontSize: "2rem" }}>
        🧱
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 500 }}>
        ERP SteinmetZ lädt...
      </div>
    </div>
  );
};

// Wrapped component with Suspense and Error Boundary
const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ErrorBoundary>
  </ProtectedRoute>
);

// Router configuration
export const router = createBrowserRouter([
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
          <ProtectedPage>
            <Dashboard />
          </ProtectedPage>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedPage>
            <Dashboard />
          </ProtectedPage>
        ),
      },
      {
        path: "catalog",
        element: (
          <ProtectedPage>
            <FunctionsCatalog />
          </ProtectedPage>
        ),
      },
      {
        path: "ai",
        element: (
          <ProtectedPage>
            <AiAnnotatorRouter />
          </ProtectedPage>
        ),
      },
      {
        path: "calendar",
        element: (
          <ProtectedPage>
            <Calendar />
          </ProtectedPage>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedPage>
            <Settings />
          </ProtectedPage>
        ),
      },
      {
        path: "communication",
        element: (
          <ProtectedPage>
            <CommunicationCenter />
          </ProtectedPage>
        ),
      },
      {
        path: "hr",
        element: (
          <ProtectedPage>
            <EmployeeList />
          </ProtectedPage>
        ),
      },
      {
        path: "finance",
        element: (
          <ProtectedPage>
            <InvoiceList />
          </ProtectedPage>
        ),
      },
      {
        path: "crm",
        element: (
          <ProtectedPage>
            <CustomerList />
          </ProtectedPage>
        ),
      },
      {
        path: "inventory",
        element: (
          <ProtectedPage>
            <InventoryList />
          </ProtectedPage>
        ),
      },
      {
        path: "projects",
        element: (
          <ProtectedPage>
            <ProjectList />
          </ProtectedPage>
        ),
      },
      {
        path: "innovation",
        element: (
          <ProtectedPage>
            <IdeaBoard />
          </ProtectedPage>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
