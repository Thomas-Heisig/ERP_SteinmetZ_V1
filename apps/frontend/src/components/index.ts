// SPDX-License-Identifier: MIT
// apps/frontend/src/components/index.ts

/**
 * Central export file for all reusable components
 * 
 * This file provides a single entry point for importing components
 * throughout the application, making it easier to manage dependencies
 * and refactor code.
 * 
 * @example
 * ```tsx
 * import { UnifiedQuickChat, ProtectedRoute } from "@/components";
 * ```
 */

// UI Components
export * from "./ui";

// Authentication
export { default as ProtectedRoute } from "./Auth/ProtectedRoute";

// Language & Internationalization
export { LanguageProvider } from "./LanguageSwitch/LanguageProvider";
export { LanguageSwitcher } from "./LanguageSwitch/LanguageSwitcher";

// Navigation
export { Sidebar } from "./Sidebar/Sidebar";
export { MainNavigation } from "./Navigation/MainNavigation";

// Chat & Communication
export { 
  UnifiedQuickChat, 
  UnifiedQuickChatProvider, 
  useUnifiedQuickChat 
} from "./QuickChat";
export type { 
  UnifiedQuickChatContextValue,
  ChatMessage,
  ChatSession,
  AIModel,
  Settings as QuickChatSettings
} from "./QuickChat";

// Dashboard
export { default as Dashboard } from "./Dashboard/Dashboard";
export { SimpleDashboard } from "./Dashboard/SimpleDashboard";

// Quality & Monitoring
export { default as QualityDashboard } from "./QualityDashboard";
export { QADashboard } from "./QualityDashboard/QADashboard";
export { ManualReviewInterface } from "./QualityDashboard/ManualReviewInterface";

// AI & Annotation
export { default as AIAnnotator } from "./AIAnnotator";

// Model Management
export {
  ModelManagement,
  ModelManagementPage,
  ModelSelectionInterface,
  ModelComparison,
  ModelCostTracking,
  ModelUsageStatistics
} from "./ModelManagement";

// Batch Processing
export { 
  BatchCreationForm,
  ProgressTracker
} from "./BatchProcessing";

// Filters & Search
export { 
  AdvancedFilters,
  FilterBuilder
} from "./AdvancedFilters";

// Functions Catalog
export { default as FunctionsCatalog } from "./FunctionsCatalog/FunctionsCatalog";

// Help & Support
export { HelpCenter } from "./HelpCenter/HelpCenter";

// Dashboard Widgets
export { DashboardWidgets } from "./DashboardWidgets/DashboardWidgets";

// Search Analytics
export { default as SearchAnalytics } from "./SearchAnalytics";
