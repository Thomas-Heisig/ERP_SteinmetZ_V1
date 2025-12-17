// ERP_SteinmetZ_V1/apps/frontend/src/components/Dashboard/types.ts

// ==================== CORE TYPES ====================
export interface DashboardState {
  navigation: DashboardNavigationState;
  search: DashboardSearchState;
  health: DashboardHealthState;
  ui: DashboardUIState;
  catalog: DashboardCatalogState;
  builder: DashboardBuilderState;
  settings: DashboardSettingsState;
  loading: LoadingState;
  errors: ErrorState;
  cache: CacheState;
  lastUpdated?: Date;
  config?: DashboardConfig;
  system?: SystemInfoState;
}

export interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  actions: DashboardActions;
}

// ==================== ACTION TYPES ====================
export type DashboardAction =
  // ROOT ACTIONS
  | { type: "LOAD_ROOTS_START" }
  | { type: "LOAD_ROOTS_SUCCESS"; payload: NodeDetail[] }
  | { type: "LOAD_ROOTS_ERROR"; payload: unknown }

  // NODE ACTIONS
  | { type: "SELECT_NODE"; payload: string }
  | { type: "LOAD_NODE_START" }
  | { type: "LOAD_NODE_SUCCESS"; payload: NodeDetail }
  | { type: "LOAD_NODE_ERROR"; payload: unknown }

  // SEARCH ACTIONS
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SEARCH_FILTERS"; payload: SearchFilters }
  | { type: "SET_SEARCH_ACTIVE"; payload: boolean }
  | { type: "SEARCH_START" }
  | {
      type: "SEARCH_SUCCESS";
      payload: { query: string; results: SearchResult[] };
    }
  | { type: "SEARCH_CLEAR" }

  // NAVIGATION ACTIONS
  | { type: "NAV_PUSH"; payload: NavigationEntry }
  | { type: "NAV_POP" }
  | { type: "NAV_CLEAR" }

  // HEALTH ACTIONS
  | { type: "SET_HEALTH_STATUS"; payload: DashboardHealthState }
  | { type: "HEALTH_UPDATE"; payload: DashboardHealthState }

  // UI ACTIONS
  | { type: "SET_THEME"; payload: "light" | "dark" | "lcars" }
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "TOGGLE_CHAT" }

  // *** ADD THIS — Layoutwechsel für Builder ***
  | { type: "SET_LAYOUT"; payload: DashboardLayout }

  // Falls weiterhin benötigt:
  | { type: "SET_LAYOUT_MODE"; payload: "mobile" | "tablet" | "desktop" }

  // LOADING ACTIONS
  | { type: "SET_LOADING"; payload: { key: string; value: boolean } }

  // ERROR ACTIONS
  | { type: "SET_ERROR"; payload: { key: string; value: unknown } }
  | { type: "CLEAR_ERRORS" }

  // CACHE ACTIONS
  | { type: "CACHE_SET_NODE"; payload: NodeDetail }

  // TIMESTAMP ACTIONS
  | { type: "SET_LAST_UPDATED"; payload: Date }

  // CONFIGURATION ACTIONS
  | { type: "SET_CONFIG"; payload: Partial<DashboardConfig> }
  | { type: "SET_SYSTEM_INFO"; payload: Partial<SystemInfoState> };

export interface DashboardActions {
  // ==================== CATALOG ====================
  loadRoots: () => void;
  selectNode: (nodeId: string) => void;
  loadNode: (nodeId: string) => void;

  // ==================== SEARCH ====================
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  setSearchActive: (active: boolean) => void;
  search: (query: string) => void;
  clearSearch: () => void;

  // ==================== NAVIGATION ====================
  navigateTo: (entry: NavigationEntry) => void;
  goBack: () => void;
  goForward: () => void;
  clearNavigation: () => void;

  // ==================== UI ====================
  setTheme: (theme: "light" | "dark" | "lcars") => void;
  setLanguage: (language: string) => void;
  toggleChat: () => void;

  /**
   * Nur Layout-Mode (mobile/tablet/desktop)
   * -> gehört zu DashboardUIState
   */
  setLayoutMode: (mode: "mobile" | "tablet" | "desktop") => void;

  /**
   * Komplettes Dashboard-Layout setzen (Builder)
   * -> gehört zu DashboardLayout und DashboardBuilderState
   */
  setLayout: (layout: DashboardLayout) => void;

  // ==================== HEALTH ====================
  updateHealth: (status: DashboardHealthState) => void;

  // ==================== UTILITY ====================
  setLoading: (key: string, value: boolean) => void;
  setError: (key: string, value: unknown) => void;
  clearErrors: () => void;
}

export interface CategoryColor {
  primary: string;
  text: string;
}

export type IconMode = "emoji" | "lucide";

export type NodeIcon = string | React.ReactNode;

export function getNodeIcon(_type: NodeType, _mode: IconMode): NodeIcon {
  // Implementation placeholder
  return "";
}

export function getCategoryColor(_categoryId: string): CategoryColor {
  // Implementation placeholder
  return { primary: "", text: "" };
}

// ==================== STATE SUB-TYPES ====================
export interface DashboardNavigationState {
  selectedId: string | null;
  stack: NodeDetail[];
  history: NavigationEntry[];
  currentIndex: number;
  currentView: string;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface DashboardSearchState {
  query: string;
  active: boolean;
  isOpen: boolean;
  loading: boolean;
  isLoading: boolean;
  results: SearchResult[];
  filter: SearchFilter;
  filters?: SearchFilters;
  lastSearch?: Date;
}

export interface DashboardHealthState {
  status: HealthStatus;
  overall?: HealthLevel;
  components?: ComponentHealth[];
  lastChecked?: string;
  responseTime?: number;
  version?: string;
  message?: string;
  metrics?: HealthMetrics;
}

export interface DashboardUIState {
  chatOpen: boolean;
  quickChatOpen: boolean;
  currentTime: Date;
  searchOverlayVisible: boolean;
  layout: "mobile" | "tablet" | "desktop";
  layoutMode: "mobile" | "tablet" | "desktop";
  theme?: UITheme;
  language?: string;
  viewMode?: ViewMode;
  sidebarOpen?: boolean;
  searchOpen?: boolean;
}

export interface DashboardCatalogState {
  roots: NodeDetail[];
  rootsLoading: boolean;
  rootsError: unknown;
  node: NodeDetail | null;
  nodeLoading: boolean;
  nodeError: unknown;
  selectedNodeId?: string | null;
  lastUpdated?: Date;
}

export interface DashboardBuilderState {
  /** Vom Builder erzeugte Widgets (abstrakte Widget-Beschreibungen) */
  renderedWidgets: WidgetInstance[];

  /** Aktives Layout (GRID | FREE | CATEGORY) */
  activeLayout: DashboardLayout["type"];

  /** Vollständiges aktuelles Layout mit Breakpoints, Kategorien usw. */
  layout: DashboardLayout;

  /** WidgetRegistry – echte, renderbare Widget-Komponenten */
  widgets: WidgetRegistry;

  /** Aktives Formular (z. B. beim Editieren von Nodes) */
  activeForm?: {
    schema: Record<string, unknown>;
    values: Record<string, unknown>;
    valid: boolean;
  };
}

export interface DashboardSettingsState {
  language: string;
  theme: "light" | "dark" | "lcars";
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  roots: unknown;
  node: unknown;
  search: unknown;
  health: unknown;
  provider: unknown;
  [key: string]: unknown;
  lastError?: {
    key: string;
    value: unknown;
    timestamp: Date;
  };
}

export interface CacheState {
  nodes: {
    [key: string]: NodeDetail;
  };
  lastUpdated?: Date;
}

export interface SystemInfoState {
  platform?: string;
  userAgent?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
  online?: boolean;
  [key: string]: unknown;
}

// ==================== NODE & CATALOG TYPES ====================
export interface NodeDetail {
  id: string;
  type: NodeType;
  name: string;
  title?: string;
  description?: string;
  category: string;
  tags: string[];
  metadata: NodeMetadata;
  data?: NodeData;
  config?: NodeConfig;
  children?: NodeDetail[];
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
  position?: NodePosition;
  size?: NodeSize;
}

export type NodeType =
  | "CARD"
  | "CHART"
  | "TABLE"
  | "FORM"
  | "CUSTOM"
  | "CATEGORY"
  | "ROOT";

export interface NodeData {
  title: string;
  content?: unknown;
  dataSource?: DataSource;
  refreshInterval?: number;
  fields?: FormField[];
  chartConfig?: ChartConfig;
  tableConfig?: TableConfig;
  [key: string]: unknown;
}

export interface NodeConfig {
  isDraggable: boolean;
  isResizable: boolean;
  isCollapsible: boolean;
  isEditable: boolean;
  visibility: "VISIBLE" | "HIDDEN" | "MINIMIZED";
  [key: string]: unknown;
}

export interface NodeMetadata {
  icon?: string;
  color?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  version?: number;
  [key: string]: unknown;
}

// ==================== SEARCH TYPES ====================
export interface SearchResult {
  id: string;
  type: "NODE" | "CATEGORY" | "DATA";
  title: string;
  description?: string;
  category?: string;
  relevance: number;
  metadata: SearchMetadata;
  [key: string]: unknown;
}

export interface SearchMetadata {
  lastModified: Date;
  tags: string[];
  category: string;
  nodeType: NodeType;
  [key: string]: unknown;
}

export type SearchFilter = "category" | "type" | "tag" | "date" | string;

export interface SearchFilters {
  categories: string[];
  nodeTypes: NodeType[];
  dateRange?: DateRange;
  tags: string[];
  [key: string]: unknown;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface SortCriteria {
  field: "RELEVANCE" | "DATE" | "TITLE";
  direction: "ASC" | "DESC";
}

export interface SearchManager {
  search: (query: string, filters?: SearchFilters) => Promise<SearchResult[]>;
  filter: (results: SearchResult[], filters: SearchFilters) => SearchResult[];
  sort: (results: SearchResult[], criteria: SortCriteria) => SearchResult[];
}

// ==================== NAVIGATION TYPES ====================
export interface NavigationEntry {
  id: string;
  view: string;
  params: NavigationParams;
  timestamp: Date;
  title: string;
  [key: string]: unknown;
}

export interface NavigationParams {
  [key: string]: unknown;
}

export interface NavigationManager {
  navigate: (view: string, params?: NavigationParams) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  getHistory: () => NavigationEntry[];
}

// ==================== HEALTH TYPES ====================
export type HealthStatus =
  | "checking"
  | "healthy"
  | "degraded"
  | "unhealthy"
  | "unknown";

export interface HealthStatusDetailed {
  overall: HealthLevel;
  components: ComponentHealth[];
  lastChecked: Date;
  metrics: HealthMetrics;
  version?: string;
  environment?: string;
  instance?: string;
  details?: Record<string, unknown>;
}

export type HealthLevel = "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "UNKNOWN";

export interface ComponentHealth {
  name: string;
  status: HealthLevel;
  message?: string;
  lastUpdate: Date;
  dependencies?: string[];
  details?: Record<string, unknown>;
}

export interface HealthMetrics {
  responseTime: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage?: number;
  avgResponseTime?: number;
  maxErrorRate?: number;
  maxMemoryUsage?: number;
  maxCpuUsage?: number;
  healthyComponents?: number;
  totalComponents?: number;
  [key: string]: unknown;
}

// Health Mapper Types
export interface RawHealthResponse {
  status?: string;
  health?: string;
  state?: string;
  components?: unknown;
  metrics?: unknown;
  version?: string;
  timestamp?: string | Date;
  lastChecked?: string | Date;
  environment?: string;
  instance?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface HealthMapperConfig {
  strictValidation?: boolean;
  defaultMetrics?: Partial<HealthMetrics>;
  componentThresholds?: {
    responseTime?: number;
    errorRate?: number;
    memoryUsage?: number;
  };
  supportedEnvironments?: string[];
}

// ==================== BUILDER & WIDGET TYPES ====================
export interface WidgetInstance {
  id: string;
  type: string;
  position: NodePosition;
  size: NodeSize;
  config: WidgetConfig;
  [key: string]: unknown;
}

export interface DashboardNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  size: NodeSize;
  data: NodeData;
  config: NodeConfig;
  metadata: NodeMetadata;
}

export interface NodePosition {
  x: number;
  y: number;
  zIndex: number;
}

export interface NodeSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface DashboardLayout {
  type: "GRID" | "FREE" | "CATEGORY";
  columns: number;
  rowHeight: number;
  breakpoints: LayoutBreakpoints;
  categories: Category[];
}

export interface LayoutBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  color?: string;
  icon?: string;
  nodeIds: string[];
}

// Node Builder Types
export interface NodeBuilderOptions {
  validate?: boolean;
  normalize?: boolean;
  [key: string]: unknown;
}

// ==================== UI & THEME TYPES ====================
export type ViewMode = "VIEW" | "EDIT" | "PREVIEW";

export interface UITheme {
  mode: "LIGHT" | "DARK" | "AUTO";
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
  textSecondary?: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

// ==================== FORM & WIDGET TYPES ====================
export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
  validation?: ValidationRule;
  defaultValue?: unknown;
  [key: string]: unknown;
}

export type FieldType =
  | "TEXT"
  | "NUMBER"
  | "SELECT"
  | "DATE"
  | "BOOLEAN"
  | "FILE";

export interface ValidationRule {
  pattern?: RegExp;
  min?: number;
  max?: number;
  required?: boolean;
  custom?: (value: unknown) => boolean;
  [key: string]: unknown;
}

export interface ChartConfig {
  type: ChartType;
  data: unknown[];
  xKey: string;
  yKey: string;
  colors: string[];
  showLegend: boolean;
  animation: boolean;
  [key: string]: unknown;
}

export type ChartType = "BAR" | "LINE" | "PIE" | "AREA" | "SCATTER";

export interface TableConfig {
  columns: TableColumn[];
  pagination: boolean;
  pageSize: number;
  sortable: boolean;
  filterable: boolean;
  selectable: boolean;
  [key: string]: unknown;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  filterable: boolean;
  width?: number;
  render?: (value: unknown) => React.ReactNode;
  [key: string]: unknown;
}

export interface WidgetProps {
  node: DashboardNode;
  config: WidgetConfig;
  onUpdate?: (data: unknown) => void;
  onDelete?: () => void;
}

export interface WidgetConfig {
  theme: WidgetTheme;
  animations: boolean;
  responsive: boolean;
  errorHandling: ErrorHandlingConfig;
  [key: string]: unknown;
}

export interface WidgetTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  [key: string]: unknown;
}

export interface ErrorHandlingConfig {
  retryCount: number;
  fallbackMessage: string;
  showErrors: boolean;
  [key: string]: unknown;
}

export interface WidgetRegistry {
  [key: string]: React.ComponentType<WidgetProps>;
}

// ==================== HOOKS TYPES ====================
export interface UseDashboardHealth {
  healthStatus: HealthStatus;
  health: DashboardHealthState;
  refreshHealth: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  lastChecked?: Date;
}

export interface UseDashboardLayout {
  layout: DashboardLayout;
  updateLayout: (updates: Partial<DashboardLayout>) => void;
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
}

export interface UseDashboardNavigation {
  currentView: string;
  navigate: (view: string, params?: NavigationParams) => void;
  goBack: () => void;
  goForward: () => void;
  history: NavigationEntry[];
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface UseDashboardSearch {
  query: string;
  results: SearchResult[];
  filters: SearchFilters;
  search: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  clearSearch: () => void;
  isLoading: boolean;
  isOpen: boolean;
}

export interface UseDashboardShortcuts {
  registerShortcut: (
    key: string,
    handler: () => void,
    description: string,
  ) => void;
  unregisterShortcut: (key: string) => void;
  showHelp: () => void;
}

export interface UseDashboardLogic {
  state: DashboardState;
  navigation: UseDashboardNavigation;
  search: UseDashboardSearch;
  health: UseDashboardHealth;
  layout: UseDashboardLayout;
  toggleChat: () => void;
  openSearchOverlay: () => void;
  closeSearchOverlay: () => void;
  catalog: DashboardCatalogState;
}

// ==================== CONFIG TYPES ====================
export interface DashboardConfig {
  version: string;
  permissions: Permission[];
  features: FeatureFlags;
  dataSources: DataSource[];
  security: SecurityConfig;
  [key: string]: unknown;
}

export interface Permission {
  role: string;
  actions: Action[];
  constraints: Constraint[];
  [key: string]: unknown;
}

export type Action = "READ" | "WRITE" | "DELETE" | "CREATE" | "ADMIN";

export interface Constraint {
  field: string;
  operator: "EQ" | "NEQ" | "GT" | "LT" | "IN";
  value: unknown;
  [key: string]: unknown;
}

export interface FeatureFlags {
  search: boolean;
  healthMonitoring: boolean;
  customWidgets: boolean;
  advancedLayout: boolean;
  realTimeUpdates: boolean;
  [key: string]: unknown;
}

export interface DataSource {
  id: string;
  type: DataSourceType;
  endpoint: string;
  authentication?: AuthConfig;
  cacheTimeout: number;
  retryPolicy: RetryPolicy;
  [key: string]: unknown;
}

export type DataSourceType = "REST" | "WEBSOCKET" | "GRAPHQL" | "DATABASE";

export interface AuthConfig {
  type: "BEARER" | "BASIC" | "API_KEY";
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  [key: string]: unknown;
}

export interface RetryPolicy {
  maxRetries: number;
  timeout: number;
  backoff: "LINEAR" | "EXPONENTIAL";
  [key: string]: unknown;
}

export interface SecurityConfig {
  encryption: EncryptionConfig;
  sessionTimeout: number;
  allowedOrigins: string[];
  cors: CorsConfig;
  [key: string]: unknown;
}

export interface EncryptionConfig {
  algorithm: string;
  key: string;
  enabled: boolean;
  [key: string]: unknown;
}

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  [key: string]: unknown;
}

// ==================== UTILITY TYPES ====================
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
  [key: string]: unknown;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  [key: string]: unknown;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  timestamp: Date;
  [key: string]: unknown;
}

// ==================== COMPONENT PROPS ====================
export interface DashboardProps {
  config?: Partial<DashboardConfig>;
  initialNodes?: NodeDetail[];
  onStateChange?: (state: DashboardState) => void;
  onError?: (error: Error) => void;
  className?: string;
  backendUrl?: string;
}

export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;

  /** Trigger für die Suchanzeige */
  onSearchToggle?: () => void;

  /** Trigger für das Menü (z. B. mobile Sidebar) */
  onMenuToggle?: () => void;

  /** Anzeige des HealthStatus-Badges ein-/ausschalten */
  showHealthStatus?: boolean;

  /** "Letzte Aktualisierung" anzeigen */
  showLastUpdated?: boolean;

  /** Zusätzliche CSS-Klassen */
  className?: string;

  /** Beliebige weitere HTML-Attribute für <header> */
  [key: string]: unknown;
}

export interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
  onCategoryEdit?: (category: Category) => void;
  onCategoryDelete?: (categoryId: string) => void;
  displayMode?: "grid" | "list";
  isLoading?: boolean;
  emptyStateMessage?: string;
  className?: string;
}

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect: (result: SearchResult) => void;
  query?: string;
  results?: SearchResult[];
  isLoading?: boolean;
}

export interface HealthStatusBadgeProps {
  status: HealthStatus;
  health?: DashboardHealthState;
  size?: "SMALL" | "MEDIUM" | "LARGE";
  showText?: boolean;
  onClick?: () => void;
}

export interface QuickChatButtonProps {
  position?: "BOTTOM_LEFT" | "BOTTOM_RIGHT";
  variant?: "FLOATING" | "STATIC";
  onClick?: () => void;
  isOpen?: boolean;
}

// ==================== EVENT TYPES ====================
export interface DashboardEventMap {
  "node.added": { node: NodeDetail };
  "node.updated": { node: NodeDetail; previous: NodeDetail };
  "node.deleted": { nodeId: string };
  "layout.changed": { layout: DashboardLayout };
  "search.executed": { query: string; results: SearchResult[] };
  "navigation.changed": { from: NavigationEntry; to: NavigationEntry };
  "health.statusChanged": {
    status: HealthStatus;
    health: DashboardHealthState;
  };
  "error.occurred": { error: Error; context: string };
  "theme.changed": { theme: string };
  "language.changed": { language: string };
}

export type DashboardEvent = keyof DashboardEventMap;

// ==================== INITIAL STATE ====================
export const initialDashboardState: DashboardState = {
  navigation: {
    selectedId: null,
    stack: [],
    history: [],
    currentIndex: -1,
    currentView: "root",
    canGoBack: false,
    canGoForward: false,
  },
  search: {
    query: "",
    active: false,
    isOpen: false,
    loading: false,
    isLoading: false,
    results: [],
    filter: "category",
  },
  health: {
    status: "checking",
  },
  ui: {
    chatOpen: false,
    quickChatOpen: false,
    currentTime: new Date(),
    searchOverlayVisible: false,
    layout: "desktop",
    layoutMode: "desktop",
  },
  catalog: {
    roots: [],
    rootsLoading: false,
    rootsError: null,
    node: null,
    nodeLoading: false,
    nodeError: null,
  },
  builder: {
    renderedWidgets: [],
    activeLayout: "GRID",
    layout: {
      type: "GRID",
      columns: 12,
      rowHeight: 30,
      breakpoints: { xs: 1, sm: 2, md: 4, lg: 8, xl: 12 },
      categories: [],
    },
    widgets: {}, // Registry wird später gefüllt
  },

  settings: {
    language: "de",
    theme: "light",
  },
  loading: {},
  errors: {
    roots: null,
    node: null,
    search: null,
    health: null,
    provider: null,
  },
  cache: {
    nodes: {},
  },
};
