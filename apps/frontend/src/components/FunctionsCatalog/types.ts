// SPDX-License-Identifier: MIT
// src/components/FunctionsCatalog/types.ts

/* ============================================================
   Allgemeine Basistypen & Enums
============================================================ */

/**
 * Erweiterte Node-Kind-Typen für verschiedene Inhalte
 */
export type NodeKind =
  | "category"       // Hauptkategorie
  | "section"        // Abschnitt
  | "record"         // Datensatz
  | "collection"     // Sammlung
  | "action"         // Aktion/Funktion
  | "note"           // Notiz
  | "group"          // Gruppe
  | "workflow"       // Workflow
  | "report"         // Bericht
  | "dataset"        // Dataset
  | "item"           // Einzelelement
  | "function"       // Funktion (Kompatibilität)
  | "document"       // Dokument
  | "api"            // API Endpoint
  | "dashboard"      // Dashboard
  | "settings"       // Einstellungen
  | "tool";          // Werkzeug

/**
 * Prioritätslevel für Nodes
 */
export type PriorityLevel = 
  | "low"
  | "medium" 
  | "high"
  | "critical";

/**
 * Status-Typen für Nodes
 */
export type NodeStatus =
  | "active"
  | "inactive"
  | "deprecated"
  | "maintenance"
  | "draft"
  | "archived";

/**
 * Sicherheitslevel für PII
 */
export type PIILevel =
  | "public"
  | "internal"
  | "confidential"
  | "restricted"
  | "secret";

/**
 * RBAC-Berechtigungsebenen
 */
export type AccessLevel =
  | "public"
  | "user"
  | "editor"
  | "admin"
  | "system";

/* ============================================================
   Menü & Kontext - Erweitert
============================================================ */

export interface MenuNode {
  id: string;
  title: string;
  icon?: string;
  kind: NodeKind;
  description?: string;
  children?: MenuNode[];
  metadata?: MenuNodeMetadata;
}

export interface MenuNodeMetadata {
  badge?: string;
  badgeColor?: "default" | "primary" | "secondary" | "error" | "warning" | "success";
  isNew?: boolean;
  updatedAt?: string;
  accessLevel?: AccessLevel;
}

export interface MenuContext {
  roles?: string[];
  features?: string[];
  permissions?: string[];
  environment?: "development" | "staging" | "production";
  locale?: string;
  timezone?: string;
}

/* ============================================================
   Breadcrumbs - Erweitert
============================================================ */

export interface Breadcrumb {
  id: string;
  title: string;
  icon?: string;
  kind?: NodeKind;
  path?: string;
  queryParams?: Record<string, string>;
}

export interface EnhancedBreadcrumb extends Breadcrumb {
  isClickable: boolean;
  hasChildren: boolean;
  metadata?: {
    lastAccessed?: string;
    accessCount?: number;
  };
}

/* ============================================================
   Node UI Flags - Erweitert
============================================================ */

export interface NodeUI {
  // Basis-Flags
  isForm: boolean;
  isWorkflow: boolean;
  isReport: boolean;
  isDataset: boolean;
  isAction: boolean;
  
  // Erweiterte UI-Flags
  isExpandable: boolean;
  isSelectable: boolean;
  isDraggable: boolean;
  isEditable: boolean;
  isDeletable: boolean;
  isCopyable: boolean;
  isExportable: boolean;
  isImportable: boolean;
  
  // Visual Flags
  hasPreview: boolean;
  hasThumbnail: boolean;
  hasCustomIcon: boolean;
  hasBadge: boolean;
  
  // Interaktions-Flags
  supportsSearch: boolean;
  supportsFilter: boolean;
  supportsSort: boolean;
  supportsPagination: boolean;
  
  // Feature-Flags
  supportsComments: boolean;
  supportsVersioning: boolean;
  supportsAudit: boolean;
  supportsNotifications: boolean;
}

/* ============================================================
   Metadaten-Strukturen - Vollständig erweitert
============================================================ */

export interface BaseMetadata {
  version?: string;
  author?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityMetadata {
  piiLevel?: PIILevel;
  accessLevel?: AccessLevel;
  encryptionRequired?: boolean;
  auditRequired?: boolean;
  compliance?: string[];
  dataRetention?: string;
}

export interface BusinessMetadata {
  costCenter?: string;
  profitCenter?: string;
  businessUnit?: string;
  revenueImpact?: "low" | "medium" | "high";
  criticality?: PriorityLevel;
  slaRequired?: boolean;
  businessOwner?: string;
}

export interface TechnicalMetadata {
  technologyStack?: string[];
  dependencies?: string[];
  apiVersion?: string;
  database?: string;
  framework?: string;
  performance?: {
    responseTime?: number;
    throughput?: number;
    availability?: number;
  };
}

export interface NodeMetadata extends BaseMetadata, SecurityMetadata, BusinessMetadata, TechnicalMetadata {
  // Zusätzliche dynamische Felder
  [key: string]: unknown;
}

/* ============================================================
   RBAC & Berechtigungen - Vollständig
============================================================ */

export interface RBACRule {
  role: string;
  permissions: string[];
  conditions?: RBACCondition[];
  exceptions?: string[];
}

export interface RBACCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "in" | "not_in";
  value: unknown;
}

export interface UserPermission {
  userId: string;
  roles: string[];
  permissions: string[];
  effectivePermissions: string[];
  restrictions?: string[];
}

/* ============================================================
   PII & Datenschutz - Erweitert
============================================================ */

export interface PIIMetadata {
  classification: PIILevel;
  dataCategories: string[];
  retentionPeriod?: string;
  legalBasis?: string;
  crossBorderTransfer?: boolean;
  encryption?: {
    algorithm?: string;
    keyManagement?: string;
    atRest?: boolean;
    inTransit?: boolean;
  };
}

/* ============================================================
   Analytics & Audit - Neu
============================================================ */

export interface AnalyticsMetadata {
  usageCount: number;
  lastAccessed?: string;
  averageTimeSpent?: number;
  popularityScore?: number;
  userSatisfaction?: number;
  errorRate?: number;
}

export interface AuditMetadata {
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  version: number;
  changeHistory: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  user: string;
  action: string;
  changes: Record<string, unknown>;
  comment?: string;
}

/* ============================================================
   Schema & Datenstruktur - Erweitert
============================================================ */

export interface DataSchema {
  type: "object" | "array" | "string" | "number" | "boolean" | "null";
  properties?: Record<string, DataSchema>;
  items?: DataSchema;
  required?: string[];
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  enum?: string[];
  default?: unknown;
  examples?: unknown[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  severity: Severity;
}

/* ============================================================
   Node Details - Vollständig erweitert (Kompatibel!)
============================================================ */

export interface NodeDetail {
  // Basis-Identifikation (Kompatibel)
  id: string;
  title: string;
  icon?: string;
  kind: NodeKind;
  path: string[];
  weight: number;

  // Hierarchie & Navigation (Kompatibel)
  children: {
    id: string;
    title: string;
    icon?: string;
    kind: NodeKind;
    // Erweiterte Felder für bessere UX
    description?: string;
    status?: NodeStatus;
    priority?: PriorityLevel;
    metadata?: NodeMetadata;
  }[];

  // Source Information (Kompatibel)
  source: {
    file: string;
    lineStart: number;
    lineEnd?: number;
    // Erweiterte Source-Info
    repository?: string;
    branch?: string;
    commitHash?: string;
    version?: string;
  };

  // Metadaten (Kompatibel, aber erweitert)
  meta?: NodeMetadata;
  rbac?: RBACRule[];
  flags?: Record<string, boolean>;
  pii?: PIIMetadata;
  aa?: AnalyticsMetadata; // Analytics & Audit
  schema?: DataSchema;
  warnings?: string[];

  // Navigation (Kompatibel)
  breadcrumbs: Breadcrumb[];
  ui: NodeUI;

  // Neue erweiterte Felder
  status: NodeStatus;
  priority: PriorityLevel;
  tags: string[];
  categories: string[];
  
  // Zeitstempel
  createdAt: string;
  updatedAt: string;
  lastAccessed?: string;
  
  // Statistiken
  viewCount: number;
  favoriteCount: number;
  
  // Relations
  parentId?: string;
  relatedNodes?: string[];
  
  // Versioning
  version: string;
  changelog?: string[];
}

/* ============================================================
   Suchsystem - Vollständig erweitert
============================================================ */

export interface SearchResult {
  // Basis-Felder (Kompatibel)
  id: string;
  title: string;
  kind: NodeKind;
  path: string[];
  score: number;
  tags?: string[];
  
  // Erweiterte Such-Felder
  description?: string;
  icon?: string;
  highlight?: {
    title?: string[];
    description?: string[];
    tags?: string[];
    content?: string[];
  };
  metadata?: {
    lastModified?: string;
    relevance?: number;
    accessLevel?: AccessLevel;
  };
  matchType?: "exact" | "partial" | "fuzzy" | "semantic";
  boosted?: boolean;
}

export interface SearchFilters {
  kinds?: NodeKind[];
  tags?: string[];
  status?: NodeStatus[];
  accessLevel?: AccessLevel[];
  dateRange?: {
    from: string;
    to: string;
  };
  minScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  queryTime: number;
  filters: SearchFilters;
  suggestions?: string[];
}

/* ============================================================
   Lint / Findings - Erweitert
============================================================ */

export type Severity = "error" | "warn" | "info" | "critical";

export interface LintFinding {
  // Basis-Felder (Kompatibel)
  code: string;
  message: string;
  severity: Severity;
  file?: string;
  nodePath?: string;
  nodeId?: string;
  
  // Erweiterte Lint-Informationen
  category?: "security" | "performance" | "maintainability" | "accessibility" | "best-practice";
  rule?: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  suggestion?: string;
  fix?: {
    type: "auto" | "manual";
    description: string;
    code?: string;
  };
  documentation?: string;
  confidence?: "low" | "medium" | "high";
  tags?: string[];
}

export interface LintReport {
  findings: LintFinding[];
  summary: {
    total: number;
    errors: number;
    warnings: number;
    infos: number;
    critical: number;
  };
  generatedAt: string;
  duration: number;
  rulesVersion: string;
}

/* ============================================================
   Regeln - Erweitert
============================================================ */

export interface FunctionsRulesSnapshot {
  // Basis (Kompatibel)
  version: number;
  locale: string;
  
  // Erweiterte Regel-Informationen
  rules: RuleDefinition[];
  categories: RuleCategory[];
  metadata: {
    generatedAt: string;
    generatedBy: string;
    checksum: string;
  };
}

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: Severity;
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  tags: string[];
  documentation?: string;
  examples?: RuleExample[];
}

export interface RuleCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  rules: string[];
}

export interface RuleCondition {
  field: string;
  operator: "equals" | "contains" | "matches" | "greater_than" | "less_than" | "in" | "not_in" | "exists" | "not_exists";
  value: unknown;
  type: "string" | "number" | "boolean" | "array" | "object";
}

export interface RuleAction {
  type: "validation" | "transformation" | "notification" | "logging" | "blocking";
  target: string;
  parameters: Record<string, unknown>;
  severity?: Severity;
}

export interface RuleExample {
  description: string;
  input: unknown;
  output: unknown;
  valid: boolean;
}

/* ============================================================
   BuildInfo - Erweitert
============================================================ */

export interface BuildResult {
  // Basis (Kompatibel)
  nodes: any[];
  findings: any[];
  warnings: string[];
  rules: any;
  loadedAt: string;
  
  // Erweiterte Build-Informationen
  metadata: {
    buildId: string;
    buildTime: number;
    nodeCount: number;
    errorCount: number;
    warningCount: number;
    success: boolean;
  };
  statistics: {
    byKind: Record<NodeKind, number>;
    byStatus: Record<NodeStatus, number>;
    byPriority: Record<PriorityLevel, number>;
  };
  dependencies: {
    external: string[];
    internal: string[];
    version: string;
  };
}

/* ============================================================
   Favoriten / History / Kontextmenü - Erweitert
============================================================ */

export interface FavoriteEntry {
  // Basis (Kompatibel)
  id: string;
  title: string;
  kind: NodeKind;
  addedAt: string;
  
  // Erweiterte Favoriten-Informationen
  icon?: string;
  description?: string;
  tags?: string[];
  category?: string;
  lastAccessed?: string;
  accessCount?: number;
  position?: number;
  metadata?: {
    isPinned?: boolean;
    color?: string;
    notes?: string;
  };
}

export interface HistoryEntry {
  id: string;
  title: string;
  icon?: string;
  viewedAt: number;
  
  kind?: NodeKind;     // ← OPTIONAL machen
  duration?: number;
  action?: "view" | "edit" | "create" | "delete";
  queryParams?: Record<string, string>;
  scrollPosition?: number;
}



export interface ContextMenuAction {
  // Basis (Kompatibel)
  label: string;
  icon?: string;
  onClick: () => void;
  
  // Erweiterte Context-Menu-Informationen
  id: string;
  type: "action" | "navigation" | "export" | "import" | "settings";
  shortcut?: string;
  condition?: () => boolean;
  severity?: Severity;
  category?: string;
  subActions?: ContextMenuAction[];
}

/* ============================================================
   Export-Funktionalität - Erweitert
============================================================ */

export interface ExportPayload {
  // Basis (Kompatibel)
  id: string;
  title: string;
  kind: NodeKind;
  meta?: unknown;
  schema?: unknown;
  aa?: unknown;
  source?: unknown;
  breadcrumbs?: Breadcrumb[];
  exportDate: string;
  
  // Erweiterte Export-Informationen
  format: "json" | "yaml" | "xml" | "csv" | "pdf";
  version: string;
  includes: string[];
  excludes?: string[];
  compression?: "none" | "gzip" | "zip";
  encryption?: {
    algorithm: string;
    required: boolean;
  };
  metadata: {
    exportedBy: string;
    exportReason?: string;
    sourceSystem: string;
    checksum: string;
  };
}

/* ============================================================
   Props für die Hauptkomponente - Erweitert
============================================================ */

export interface FunctionsCatalogProps {
  // Basis (Kompatibel)
  roles?: string[];
  features?: string[];
  baseUrl?: string;
  
  // Erweiterte Props
  theme?: "light" | "dark" | "auto" | "lcars";
  locale?: string;
  permissions?: string[];
  config?: CatalogConfig;
  onNodeSelect?: (node: NodeDetail) => void;
  onSearch?: (query: string, results: SearchResult[]) => void;
  onError?: (error: Error, context: string) => void;
  onExport?: (payload: ExportPayload) => void;
  customActions?: ContextMenuAction[];
}

export interface CatalogConfig {
  // Konfigurationsoptionen
  enableSearch: boolean;
  enableFilters: boolean;
  enableFavorites: boolean;
  enableHistory: boolean;
  enableExport: boolean;
  enableImport: boolean;
  maxSearchResults: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  offlineMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

/* ============================================================
   Response & Error Types - Neu
============================================================ */

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  version: string;
  metadata?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
  requestId?: string;
  documentation?: string;
}

export interface LoadingState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  progress?: number;
}

/* ============================================================
   Utility Types für Kompatibilität
============================================================ */

// Alias für Rückwärtskompatibilität
export type CategoryNode = NodeDetail;
export type SearchResultItem = SearchResult;
export type MenuItem = MenuNode;

// Partielle Typen für Updates
export type PartialNodeDetail = Partial<NodeDetail> & Pick<NodeDetail, 'id' | 'title' | 'kind'>;
export type PartialSearchResult = Partial<SearchResult> & Pick<SearchResult, 'id' | 'title' | 'kind'>;

// Filter-Typen
export type NodeFilter = {
  kinds?: NodeKind[];
  status?: NodeStatus[];
  tags?: string[];
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
};

// Sort-Typen
export type SortOption = {
  field: keyof NodeDetail;
  direction: 'asc' | 'desc';
};

export {};

// Zusätzliche Exporte für einfachen Zugriff
export type * from './types';