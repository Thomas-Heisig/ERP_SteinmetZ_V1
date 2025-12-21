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

/** Full experience dashboard (modules, widgets, categories) */
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"));

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
// Business Module
// ============================================================================

/** Business: Company management */
const CompanyManagement = lazy(
  () => import("./features/business/CompanyManagement"),
);

/** Business: Process management */
const ProcessManagement = lazy(
  () => import("./features/business/ProcessManagement"),
);

/** Business: Risk and compliance management */
const RiskManagement = lazy(() => import("./features/business/RiskManagement"));

// ============================================================================
// Finance Module - Additional
// ============================================================================

/** Finance: Accounting */
const AccountingList = lazy(
  () => import("./features/finance/modules/AccountingList"),
);

/** Finance: Controlling */
const ControllingList = lazy(
  () => import("./features/finance/modules/ControllingList"),
);

/** Finance: Treasury */
const TreasuryList = lazy(
  () => import("./features/finance/modules/TreasuryList"),
);

/** Finance: Taxes */
const TaxesList = lazy(() => import("./features/finance/modules/TaxesList"));

// ============================================================================
// Sales Module
// ============================================================================

/** Sales: Marketing */
const MarketingList = lazy(() => import("./features/sales/MarketingList"));

/** Sales: Sales orders */
const SalesList = lazy(() => import("./features/sales/SalesList"));

/** Sales: Fulfillment */
const FulfillmentList = lazy(() => import("./features/sales/FulfillmentList"));

// ============================================================================
// Procurement Module
// ============================================================================

/** Procurement: Purchasing */
const PurchasingList = lazy(
  () => import("./features/procurement/PurchasingList"),
);

/** Procurement: Receiving */
const ReceivingList = lazy(
  () => import("./features/procurement/ReceivingList"),
);

/** Procurement: Suppliers */
const SupplierList = lazy(() => import("./features/procurement/SupplierList"));

// ============================================================================
// Production Module
// ============================================================================

/** Production: Planning */
const PlanningList = lazy(() => import("./features/production/PlanningList"));

/** Production: Manufacturing */
const ManufacturingList = lazy(
  () => import("./features/production/ManufacturingList"),
);

/** Production: Quality management */
const QualityList = lazy(() => import("./features/production/QualityList"));

/** Production: Maintenance */
const MaintenanceList = lazy(
  () => import("./features/production/MaintenanceList"),
);

// ============================================================================
// Warehouse Module
// ============================================================================

/** Warehouse: Picking */
const PickingList = lazy(() => import("./features/warehouse/PickingList"));

/** Warehouse: Logistics */
const LogisticsList = lazy(() => import("./features/warehouse/LogisticsList"));

// ============================================================================
// HR Module - Additional
// ============================================================================

/** HR: Personnel management */
const PersonnelList = lazy(() => import("./features/hr/modules/PersonnelList"));

/** HR: Time tracking */
const TimeTrackingList = lazy(
  () => import("./features/hr/modules/TimeTrackingList"),
);

/** HR: Personnel development */
const DevelopmentList = lazy(
  () => import("./features/hr/modules/DevelopmentList"),
);

/** HR: Recruiting */
const RecruitingList = lazy(
  () => import("./features/hr/modules/RecruitingList"),
);

/** HR: Payroll */
const Payroll = lazy(() => import("./features/hr/Payroll"));

// ============================================================================
// Reporting Module
// ============================================================================

/** Reporting: Standard reports */
const ReportsList = lazy(() => import("./features/reporting/ReportsList"));

/** Reporting: Ad-hoc analysis */
const AdhocAnalysisList = lazy(
  () => import("./features/reporting/AdhocAnalysisList"),
);

/** Reporting: AI analytics */
const AIAnalyticsList = lazy(
  () => import("./features/reporting/AIAnalyticsList"),
);

// ============================================================================
// Communication Module - Additional
// ============================================================================

/** Communication: Email management */
const EmailManagement = lazy(
  () => import("./features/communication/EmailManagement"),
);

/** Communication: Messaging center */
const MessagingCenter = lazy(
  () => import("./features/communication/MessagingCenter"),
);

/** Communication: Social media hub */
const SocialMediaHub = lazy(
  () => import("./features/communication/SocialMediaHub"),
);

// ============================================================================
// System Module
// ============================================================================

/** System: User management */
const UserManagement = lazy(() => import("./features/system/UserManagement"));

/** System: System settings */
const SystemSettings = lazy(() => import("./features/system/SystemSettings"));

/** System: Integrations */
const IntegrationsList = lazy(
  () => import("./features/system/IntegrationsList"),
);

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
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: lazyLoad(Dashboard),
      },
      {
        path: "dashboard/simple",
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
      // Business routes
      {
        path: "company",
        element: lazyLoad(CompanyManagement),
      },
      {
        path: "processes",
        element: lazyLoad(ProcessManagement),
      },
      {
        path: "risk",
        element: lazyLoad(RiskManagement),
      },
      // Finance routes
      {
        path: "accounting",
        element: lazyLoad(AccountingList),
      },
      {
        path: "controlling",
        element: lazyLoad(ControllingList),
      },
      {
        path: "treasury",
        element: lazyLoad(TreasuryList),
      },
      {
        path: "taxes",
        element: lazyLoad(TaxesList),
      },
      // Sales routes
      {
        path: "marketing",
        element: lazyLoad(MarketingList),
      },
      {
        path: "sales",
        element: lazyLoad(SalesList),
      },
      {
        path: "fulfillment",
        element: lazyLoad(FulfillmentList),
      },
      // Procurement routes
      {
        path: "purchasing",
        element: lazyLoad(PurchasingList),
      },
      {
        path: "receiving",
        element: lazyLoad(ReceivingList),
      },
      {
        path: "suppliers",
        element: lazyLoad(SupplierList),
      },
      // Production routes
      {
        path: "planning",
        element: lazyLoad(PlanningList),
      },
      {
        path: "manufacturing",
        element: lazyLoad(ManufacturingList),
      },
      {
        path: "quality",
        element: lazyLoad(QualityList),
      },
      {
        path: "maintenance",
        element: lazyLoad(MaintenanceList),
      },
      // Warehouse routes
      {
        path: "picking",
        element: lazyLoad(PickingList),
      },
      {
        path: "logistics",
        element: lazyLoad(LogisticsList),
      },
      // HR routes
      {
        path: "personnel",
        element: lazyLoad(PersonnelList),
      },
      {
        path: "time-tracking",
        element: lazyLoad(TimeTrackingList),
      },
      {
        path: "development",
        element: lazyLoad(DevelopmentList),
      },
      {
        path: "recruiting",
        element: lazyLoad(RecruitingList),
      },
      {
        path: "payroll",
        element: lazyLoad(Payroll),
      },
      // Reporting routes
      {
        path: "reports",
        element: lazyLoad(ReportsList),
      },
      {
        path: "adhoc",
        element: lazyLoad(AdhocAnalysisList),
      },
      {
        path: "ai-analytics",
        element: lazyLoad(AIAnalyticsList),
      },
      // Communication routes
      {
        path: "email",
        element: lazyLoad(EmailManagement),
      },
      {
        path: "messaging",
        element: lazyLoad(MessagingCenter),
      },
      {
        path: "social",
        element: lazyLoad(SocialMediaHub),
      },
      // System routes
      {
        path: "users",
        element: lazyLoad(UserManagement),
      },
      {
        path: "system-settings",
        element: lazyLoad(SystemSettings),
      },
      {
        path: "integrations",
        element: lazyLoad(IntegrationsList),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
