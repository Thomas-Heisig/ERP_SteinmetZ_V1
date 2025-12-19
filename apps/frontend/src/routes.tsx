// SPDX-License-Identifier: MIT
// apps/frontend/src/routes.tsx

/**
 * Application routing configuration using React Router v6
 *
 * This file defines all routes and lazy-loaded components for the application.
 * All route components are lazy-loaded to improve initial load performance.
 *
 * @module routes
 */

import React, { Suspense, lazy, ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "./App";
import { LoadingFallback } from "./components/ui/LoadingFallback";
import { ProtectedPage } from "./components/ui/ProtectedPage";

/**
 * Helper function to wrap lazy-loaded components with Suspense and error boundary
 * @param Component - The lazy-loaded component to wrap
 * @param isProtected - Whether the route requires authentication
 * @returns Wrapped component with Suspense and optional protection
 */
const lazyLoad = (
  Component: React.LazyExoticComponent<ComponentType>,
  isProtected = true,
): React.ReactElement => {
  const element = (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );

  return isProtected ? <ProtectedPage>{element}</ProtectedPage> : element;
};

// ============================================================================
// Core Components
// ============================================================================

/** Simple dashboard with executive overview only (4 KPIs, tasks, notifications) */
const SimpleDashboard = lazy(
  () => import("./components/Dashboard/SimpleDashboard"),
);

/** Functions catalog for browsing and managing available functions */
const FunctionsCatalog = lazy(
  () => import("./components/FunctionsCatalog/FunctionsCatalog"),
);

/** Login page for user authentication */
const Login = lazy(() => import("./pages/Login/Login"));

/** AI Annotator main interface */
const AIAnnotator = lazy(() => import("./components/AIAnnotator/AIAnnotator"));

/** Help center with documentation and support */
const HelpCenter = lazy(() => import("./components/HelpCenter/HelpCenter"));

// ============================================================================
// Feature Modules
// ============================================================================

/** Calendar for scheduling and appointments */
const Calendar = lazy(() => import("./features/calendar/Calendar"));

/** System settings and configuration */
const Settings = lazy(() => import("./pages/Settings/Settings"));

/** Communication center for calls, SMS, and fax */
const CommunicationCenter = lazy(
  () => import("./features/communication/CommunicationCenter"),
);

/** HR: Employee management and records */
const EmployeeList = lazy(() => import("./features/hr/EmployeeList"));

/** Finance: Invoice management and billing */
const InvoiceList = lazy(() => import("./features/finance/InvoiceList"));

/** CRM: Customer relationship management */
const CustomerList = lazy(() => import("./features/crm/CustomerList"));

/** Inventory: Stock and warehouse management */
const InventoryList = lazy(() => import("./features/inventory/InventoryList"));

/** Projects: Project planning and tracking */
const ProjectList = lazy(() => import("./features/projects/ProjectList"));

/** Innovation: Idea board and innovation management */
const IdeaBoard = lazy(() => import("./features/innovation/IdeaBoard"));

/** Documents: Document management system */
const DocumentList = lazy(() => import("./features/documents/DocumentList"));

// ============================================================================
// AI & ML Features
// ============================================================================

/** Batch processing for bulk AI operations */
const BatchProcessingPage = lazy(
  () => import("./components/BatchProcessing/BatchProcessingPage"),
);

/** Quality dashboard for AI annotation metrics */
const QualityDashboard = lazy(() => import("./components/QualityDashboard"));

/** Model management for AI/ML models */
const ModelManagement = lazy(() => import("./components/ModelManagement"));

/** Advanced filters UI for data filtering */
const AdvancedFiltersUI = lazy(
  () => import("./components/AdvancedFilters/AdvancedFilters"),
);

// ============================================================================
// Router Configuration
// ============================================================================

/**
 * Application router with lazy-loaded routes
 *
 * Route structure:
 * - /login: Public authentication page
 * - /: Protected application routes (requires authentication)
 * - /*: Catch-all redirect to home
 */
export const router = createBrowserRouter([
  {
    path: "/login",
    element: lazyLoad(Login, false),
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: lazyLoad(SimpleDashboard),
      },
      {
        path: "dashboard",
        element: lazyLoad(SimpleDashboard),
      },
      {
        path: "catalog",
        element: lazyLoad(FunctionsCatalog),
      },
      {
        path: "ai",
        element: lazyLoad(AIAnnotator),
      },
      {
        path: "calendar",
        element: lazyLoad(Calendar),
      },
      {
        path: "settings",
        element: lazyLoad(Settings),
      },
      {
        path: "communication",
        element: lazyLoad(CommunicationCenter),
      },
      {
        path: "hr",
        element: lazyLoad(EmployeeList),
      },
      {
        path: "finance",
        element: lazyLoad(InvoiceList),
      },
      {
        path: "crm",
        element: lazyLoad(CustomerList),
      },
      {
        path: "inventory",
        element: lazyLoad(InventoryList),
      },
      {
        path: "projects",
        element: lazyLoad(ProjectList),
      },
      {
        path: "innovation",
        element: lazyLoad(IdeaBoard),
      },
      {
        path: "documents",
        element: lazyLoad(DocumentList),
      },
      {
        path: "batch-processing",
        element: lazyLoad(BatchProcessingPage),
      },
      {
        path: "quality-dashboard",
        element: lazyLoad(QualityDashboard),
      },
      {
        path: "model-management",
        element: lazyLoad(ModelManagement),
      },
      {
        path: "advanced-filters",
        element: lazyLoad(AdvancedFiltersUI),
      },
      {
        path: "help",
        element: lazyLoad(HelpCenter),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
