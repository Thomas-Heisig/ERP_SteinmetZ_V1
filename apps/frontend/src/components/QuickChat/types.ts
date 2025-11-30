// ERP_SteinmetZ_V1\apps\frontend\src\components\QuickChat\types.ts

/* ==================== KERN-TYPEN ==================== */
export type Role = "system" | "user" | "assistant";
export type Provider = 
  | "openai" 
  | "anthropic" 
  | "local" 
  | "ollama" 
  | "fallback" 
  | "azure" 
  | "vertex" 
  | "huggingface" 
  | "llamacpp" 
  | "custom"
  | "eliza";

export type Tab = "chat" | "models" | "settings" | "info" | "tools" | "workflows" | "sessions" | "context";
export type Sentiment = "positive" | "negative" | "neutral" | "critical" | "questioning";
export type Intent = "query" | "create" | "update" | "delete" | "calculate" | "diagnose" | "informational" | "analyze" | "suggest";
export type Confidence = "low" | "medium" | "high";
export type ToolCategory = "calculations" | "database" | "erp_operations" | "file_operations" | "system_info" | "system_monitoring" | "audio" | "vision" | "translation";

/* ==================== CHAT & KONVERSATION ==================== */
export interface ChatMessage {
  role: Role;
  content: string;
  timestamp?: string;
  metadata?: {
    intent?: Intent;
    sentiment?: Sentiment;
    topic?: string;
    model?: string;
    provider?: Provider;
    tokens_used?: number;
    thinking_time?: number;
    tool_calls?: ToolCall[];
    context_references?: string[];
  };
}

export interface ChatSession {
  id: string;
  model: string;
  provider?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  tokensUsed?: number;
  meta?: Record<string, any>;
}

export interface SessionSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface AIResponse {
  text: string;
  action?: string;
  tool_calls?: ToolCall[];
  context_update?: Record<string, any>;
  meta?: {
    model?: string;
    provider?: string;
    tokens_used?: number;
    confidence?: number;
    time_ms?: number;
    source?: string;
  };
  errors?: string[];
}

export interface StreamingChunk {
  content: string;
  is_final: boolean;
  timestamp: string;
  chunk_type?: "text" | "tool_call" | "thinking";
}

/* ==================== MODELLE & PROVIDER ==================== */
export interface AIModel {
  name: string;
  provider: string;
  model: string;
  active: boolean;
  capabilities: string[];
  description: string;
  endpoint?: string;
}

export interface ProviderStatus {
  provider: string;
  available: boolean;
  models: string[];
}

/* ==================== TOOLS & FUNKTIONEN ==================== */
export interface ToolMetadata {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  category?: string;
  version?: string;
  restricted?: boolean;
  registeredAt?: string;
}

export interface ToolParameter {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required: boolean;
  default?: any;
  enum?: string[];
  min?: number;
  max?: number;
  pattern?: string;
}

export interface ToolExample {
  input: Record<string, any>;
  output: any;
  description: string;
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
  result?: any;
  success?: boolean;
  error?: string;
  duration?: number;
  timestamp: string;
}

export interface ToolExecutionResult {
  success: boolean;
  tool: string;
  result: any;
  duration_ms: number;
  error?: string;
  metadata?: Record<string, any>;
}

/* ==================== WORKFLOWS & AUTOMATION ==================== */
export interface WorkflowDefinition {
  name: string;
  description: string;
  version: string;
  steps: WorkflowStep[];
  triggers?: WorkflowTrigger[];
  variables?: WorkflowVariable[];
  on_error?: "continue" | "stop" | "skip" | "retry";
  metadata?: {
    author?: string;
    category?: string;
    tags?: string[];
    created: string;
    modified: string;
  };
  settings?: {
    timeout: number;
    max_retries: number;
    concurrent: boolean;
  };
}

export type WorkflowStep = 
  | ToolCallStep
  | IfConditionStep
  | LoopStep
  | WorkflowCallStep
  | LogStep
  | WaitStep
  | TransformStep
  | ContextUpdateStep;

export interface ToolCallStep {
  type: "tool_call";
  tool: string;
  params?: Record<string, any>;
  variable?: string;
  condition?: string;
  retry?: {
    attempts: number;
    delay: number;
  };
}

export interface IfConditionStep {
  type: "if";
  condition: string;
  steps: WorkflowStep[];
  else_steps?: WorkflowStep[];
}

export interface LoopStep {
  type: "loop";
  over: string;
  variable: string;
  steps: WorkflowStep[];
  max_iterations?: number;
}

export interface WorkflowCallStep {
  type: "workflow_call";
  workflow: string;
  params?: Record<string, any>;
  variable?: string;
}

export interface LogStep {
  type: "log";
  message: string;
  level: "info" | "warn" | "error" | "debug";
}

export interface WaitStep {
  type: "wait";
  duration: number;
  until?: string;
}

export interface TransformStep {
  type: "transform";
  expression: string;
  variable: string;
}

export interface ContextUpdateStep {
  type: "context_update";
  params: Record<string, any>;
}

export interface WorkflowTrigger {
  type: "manual" | "schedule" | "webhook" | "event";
  config: Record<string, any>;
}

export interface WorkflowVariable {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  default?: any;
  description?: string;
}

export interface WorkflowExecution {
  id: string;
  workflow: string;
  status: "running" | "completed" | "failed" | "cancelled";
  steps: WorkflowStepExecution[];
  input: Record<string, any>;
  output?: Record<string, any>;
  started_at: string;
  finished_at?: string;
  duration?: number;
  error?: string;
}

export interface WorkflowStepExecution {
  step: WorkflowStep;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  result?: any;
  error?: string;
  started_at?: string;
  finished_at?: string;
  duration?: number;
}

/* ==================== CONTEXT & KONVERSATIONS-MANAGEMENT ==================== */
export interface ConversationState {
  current_topic?: string;
  sentiment?: Sentiment;
  intent?: Intent;
  confidence?: Confidence;
  preferences: UserPreferences;
  history_length: number;
  updated_at?: string;
  stats: {
    messageCount: number;
    topicSwitches: number;
    lastTopic: string | null;
    averageResponseTime: number;
    tokensUsed: number;
  };
}

export interface ConversationEntity {
  type: "person" | "location" | "organization" | "product" | "concept";
  name: string;
  value: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface ContextMemory {
  id: string;
  type: "fact" | "preference" | "goal" | "constraint";
  content: string;
  source: "user" | "assistant" | "system";
  timestamp: string;
  importance: "low" | "medium" | "high";
  expires_at?: string;
}

export interface UserPreferences {
  response_style?: "detailed" | "short" | "technical" | "casual";
  language?: string;
  temperature?: number;
  max_tokens?: number;
  auto_save?: boolean;
  streaming?: boolean;
  voice_preference?: string;
  theme?: "light" | "dark" | "auto";
  notification_settings?: NotificationSettings;
  privacy_level?: "minimal" | "balanced" | "maximum";
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  emailEnabled: boolean;
  activityAlertsEnabled: boolean;
}

export interface ConversationContext {
  rules: ConversationRule[];
  templates: ConversationTemplate[];
  personas: Persona[];
  constraints: Constraint[];
}

export interface ConversationRule {
  id: string;
  pattern: string;
  action: string;
  category: string;
  priority: number;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface ConversationTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: string;
  description?: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  style: string;
  constraints: string[];
  examples: string[];
}

export interface Constraint {
  id: string;
  type: "safety" | "privacy" | "compliance" | "technical";
  description: string;
  rules: string[];
  severity: "low" | "medium" | "high" | "critical";
}

/* ==================== EINSTELLUNGEN & KONFIGURATION ==================== */
export interface Settings {
  // Model-Einstellungen
  defaultModel: string;
  defaultProvider: Provider;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;

  // Feature-Einstellungen
  audioEnabled: boolean;
  translationEnabled: boolean;
  visionEnabled: boolean;
  streamingEnabled: boolean;
  autoSave: boolean;
  toolExecutionEnabled: boolean;
  workflowExecutionEnabled: boolean;
  
  // Sprache & Region
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  
  // UI-Einstellungen
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  density: "compact" | "comfortable" | "spacious";
  sidebarPosition: "left" | "right";
  
  // Privacy & Sicherheit
  dataRetentionDays: number;
  autoClearHistory: boolean;
  analyticsEnabled: boolean;
  errorReportingEnabled: boolean;
  
  // Erweiterte Einstellungen
  apiTimeout: number;
  maxConcurrentRequests: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  fallbackProviderEnabled: boolean;
  
  // Notification-Einstellungen
  notifications: NotificationSettings;
  
  // Backup & Export
  autoBackup: boolean;
  backupInterval: number;
  exportFormat: "json" | "csv" | "markdown";
}

/* ==================== AUDIO & SPRACHE ==================== */
export interface AudioSettings {
  enabled: boolean;
  autoDetectLanguage: boolean;
  preferredLanguage: string;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: "male" | "female" | "neutral";
  provider: string;
  style?: string;
  sampleRate?: number;
}

export interface TranscriptionResult {
  text: string;
  meta: {
    provider: string;
    model: string;
    source: string;
    time_ms: number;
  };
}

export interface SynthesisRequest {
  text: string;
  voice: string;
  speed?: number;
  pitch?: number;
  format?: "mp3" | "wav" | "ogg";
}

export interface SynthesisResult {
  audioUrl: string;
  duration: number;
  size: number;
  format: string;
}

/* ==================== VISION & BILDVERARBEITUNG ==================== */
export interface VisionSettings {
  enabled: boolean;
  maxFileSize: number;
  allowedFormats: string[];
  autoOCR: boolean;
  detailLevel: "low" | "high";
}

export interface ImageAnalysisRequest {
  image: File | string;
  instruction?: string;
  engine?: string;
}

export type VisionTask = 
  | "describe"
  | "analyze"
  | "extract_text"
  | "detect_objects"
  | "identify_landmarks"
  | "read_documents";

export interface ImageAnalysisResult {
  text: string;
  meta: {
    provider: string;
    model: string;
    file: string;
    engine: string;
  };
}

export interface DetectedObject {
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
  attributes?: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
  language: string;
}

export interface TextBlock {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
  lines: TextLine[];
}

export interface TextLine {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

/* ==================== EMBEDDINGS & SEMANTISCHE SUCHE ==================== */
export interface EmbeddingSettings {
  enabled: boolean;
  defaultProvider: string;
  defaultModel: string;
  dimensions: number;
  cacheEnabled: boolean;
}

export interface EmbeddingRequest {
  texts: string[];
  model?: string;
  provider?: string;
}

export interface EmbeddingResult {
  text: string;
  data: number[][];
  meta: {
    provider: string;
    model: string;
    tokens_used?: number;
    dimensions?: number;
  };
}

export interface SimilarityRequest {
  vectorA: number[];
  vectorB: number[];
  metric?: "cosine" | "euclidean" | "dot";
}

export interface SimilarityResult {
  similarity: number;
  metric: string;
  interpretation: string;
}

export interface SemanticSearchRequest {
  query: string;
  documents: string[];
  top_k?: number;
  threshold?: number;
}

export interface SemanticSearchResult {
  results: SearchResult[];
  query: string;
  total_matches: number;
}

export interface SearchResult {
  document: string;
  similarity: number;
  index: number;
  highlights?: string[];
}

/* ==================== KNOWLEDGE BASE & RAG ==================== */
export interface KnowledgeBaseSettings {
  enabled: boolean;
  autoIndex: boolean;
  chunkSize: number;
  chunkOverlap: number;
  indexingModel: string;
  maxDocuments: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  type: "text" | "markdown" | "pdf" | "html";
  source: string;
  size: number;
  created: string;
  modified: string;
  metadata: Record<string, any>;
  embeddings?: number[];
}

export interface KnowledgeQuery {
  query: string;
  limit?: number;
}

export interface KnowledgeResult {
  text: string;
  data: Document[];
  meta: {
    provider: string;
    model: string;
  };
}

/* ==================== ÜBERSETZUNG ==================== */
export interface TranslationSettings {
  enabled: boolean;
  defaultSourceLanguage: string;
  defaultTargetLanguage: string;
  autoDetect: boolean;
  preferredEngine: string;
}

export interface TranslationRequest {
  text: string;
  targetLang: string;
  engine?: string;
}

export interface TranslationResult {
  text: string;
  meta: {
    engine: string;
    targetLang: string;
  };
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  alternatives: AlternativeLanguage[];
}

export interface AlternativeLanguage {
  language: string;
  confidence: number;
}

/* ==================== SYSTEM & DIAGNOSTIK ==================== */
export interface SystemInfoData {
  provider: string;
  active_model: string;
  engines_supported: string[];
  max_tokens: number;
  active: boolean;
}

export interface SystemStatus {
  timestamp: string;
  model_count: number;
  tool_count: number;
  workflow_count: number;
  system_status: 'healthy' | 'degraded' | 'unhealthy';
  active_provider: string;
  fallback_enabled: boolean;
}

export interface FeatureFlags {
  audioProcessing: boolean;
  fileUpload: boolean;
  translation: boolean;
  settings: boolean;
  vision: boolean;
  workflows: boolean;
  tools: boolean;
  embeddings: boolean;
  knowledgeBase: boolean;
  streaming: boolean;
  sessions: boolean;
  contextManagement: boolean;
}

export interface MemoryUsage {
  total: number;
  free: number;
  used: number;
  usagePercent: number;
}

export interface CpuUsage {
  count: number;
  usage: number;
  load: number[];
  model: string;
  speed: number;
}

export interface PerformanceMetrics {
  responseTimes: ResponseTimeMetrics;
  throughput: ThroughputMetrics;
  errorRates: ErrorRateMetrics;
  cache: CacheMetrics;
}

export interface ResponseTimeMetrics {
  average: number;
  p95: number;
  p99: number;
  max: number;
}

export interface ThroughputMetrics {
  requestsPerSecond: number;
  averageThroughput: number;
  peakThroughput: number;
}

export interface ErrorRateMetrics {
  totalErrors: number;
  errorRate: number;
  by_type: Record<string, number>;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
}

/* ==================== QUICK ACTIONS & TEMPLATES ==================== */
export interface QuickAction {
  id: string;
  name: string;
  prompt: string;
  category: string;
  icon: string;
  description?: string;
  tags?: string[];
  popularity?: number;
  usageCount?: number;
  created?: string;
  modified?: string;
  variables?: ActionVariable[];
  examples?: string[];
  suggestedModels?: string[];
}

export interface ActionVariable {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required: boolean;
  default?: any;
  min?: number;
  max?: number;
}

export interface ActionCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  actions: QuickAction[];
}

/* ==================== ERROR HANDLING & LOGGING ==================== */
export interface APIError {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  details: Record<string, any>;
  stack?: string;
  requestId?: string;
  suggestions?: string[];
}

export interface ErrorContext {
  component: string;
  operation: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
  constraint: string;
}

/* ==================== CACHE & PERFORMANCE ==================== */
export interface CacheSettings {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: "lru" | "lfu" | "fifo";
  compression: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  keys: number;
  memoryUsage: number;
  oldestEntry: string;
  newestEntry: string;
}

/* ==================== DATEIEN & UPLOAD ==================== */
export interface FileUploadSettings {
  enabled: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  maxFiles: number;
  autoProcess: boolean;
  storage: "local" | "cloud" | "hybrid";
}

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  uploaded: string;
  processed: boolean;
  metadata: FileMetadata;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
  language?: string;
  checksum?: string;
}

/* ==================== SICHERHEIT & AUTHENTIFIZIERUNG ==================== */
export interface SecuritySettings {
  apiKeyRequired: boolean;
  rateLimiting: boolean;
  requestSigning: boolean;
  encryption: boolean;
  auditLogging: boolean;
  dataRetention: DataRetentionSettings;
}

export interface DataRetentionSettings {
  enabled: boolean;
  retentionPeriod: number;
  autoDelete: boolean;
  exportBeforeDelete: boolean;
}

/* ==================== ERWEITERTE UI-TYPEN ==================== */
export interface UIState {
  activeTab: Tab;
  sidebarOpen: boolean;
  quickActionsOpen: boolean;
  settingsOpen: boolean;
  theme: "light" | "dark" | "auto";
  layout: "horizontal" | "vertical";
  zoom: number;
  panels: UIPanel[];
}

export interface UIPanel {
  id: string;
  type: "chat" | "tools" | "context" | "settings";
  position: "left" | "right" | "bottom";
  size: number;
  isOpen: boolean;
  isPinned: boolean;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: NotificationAction;
  duration?: number;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  type: "button" | "link";
}

/* ==================== EXPORT & IMPORT ==================== */
export interface ExportSettings {
  format: "json" | "csv" | "markdown" | "pdf";
  include: string[];
  compression: boolean;
  encryption: boolean;
}

export interface ExportResult {
  url: string;
  size: number;
  format: string;
  exportedAt: string;
  itemCount: number;
}

/* ==================== BACKUP & RESTORE ==================== */
export interface BackupSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  retention: number;
  include: string[];
  encryption: boolean;
  cloudStorage: boolean;
}

/* ==================== MISC & UTILITY ==================== */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Filter {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt" | "in";
  value: any;
}

export interface Sort {
  field: string;
  direction: "asc" | "desc";
}

// Response-Wrapper für API-Antworten
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    pagination?: Pagination;
  };
}

// Union-Typen für flexible Nutzung
export type AnySettings = 
  | Settings 
  | AudioSettings 
  | VisionSettings 
  | TranslationSettings 
  | KnowledgeBaseSettings 
  | EmbeddingSettings 
  | SecuritySettings 
  | CacheSettings 
  | FileUploadSettings 
  | BackupSettings 
  | ExportSettings;

export type AnyResult = 
  | AIResponse 
  | ToolExecutionResult 
  | WorkflowExecution 
  | TranscriptionResult 
  | ImageAnalysisResult 
  | TranslationResult 
  | EmbeddingResult 
  | SimilarityResult 
  | KnowledgeResult 
  | ExportResult;

// Utility-Typen für komplexe Operationen
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;