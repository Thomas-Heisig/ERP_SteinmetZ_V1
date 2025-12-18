/* ────────────────────────────────────────────────────────────────
 * Globale Typdefinitionen für ERP-KI-System
 * (Provider, Tools, Workflows, Kontext, Agents, Monitoring, etc.)
 * ──────────────────────────────────────────────────────────────── */

/* ========================================================================== */
/* 🗨️ Chat und Kommunikation */
/* ========================================================================== */

/** Rollen in der Konversation */
export type Role =
  | "system"
  | "user"
  | "assistant"
  | "observer"
  | "controller"
  | "router"
  | "function"; // Hinzugefügt für Funktionsaufrufe

/** Grundstruktur einer Chatnachricht */
export interface ChatMessage {
  role: Role;
  content: string;
  timestamp?: string;
  metadata?: {
    intent?: string;
    sentiment?:
      | "positive"
      | "neutral"
      | "negative"
      | "critical"
      | "questioning";
    topic?: string;
    tokens?: number;
    model?: string;
    confidence?: number;
    origin?: "manual" | "automated" | "imported";
    language?: string;
    source_tool?: string;
    // Ergänzungen für erweiterte Metadaten
    session_id?: string;
    user_id?: string;
    workflow_id?: string;
  };
}

/** Verlauf einer Unterhaltung */
export interface ConversationHistory {
  messages: ChatMessage[];
  context_snapshot?: Record<string, unknown>;
  last_updated?: string;
  source?: string;
  // Ergänzungen für erweiterte Historie
  summary?: string;
  total_messages?: number;
  duration_minutes?: number;
}

/* ========================================================================== */
/* 🧠 Regelbasierte / Eliza-Komponenten */
/* ========================================================================== */

export interface ElizaRule {
  pattern: string;
  replies: string[];
  action?: string;
  params?: string[];
  context?: string[];
  requires_auth?: boolean;
  tool_call?: string;
  priority?: number;
  weight?: number;
  tags?: string[];
  confidence_threshold?: number;
  dynamic?: boolean;
  enabled?: boolean;
  // Ergänzungen für erweiterte Regelverwaltung
  id?: string;
  category?: string;
  last_triggered?: string;
  trigger_count?: number;
}

/* ========================================================================== */
/* ⚙️ Fallback- & Systemkonfiguration */
/* ========================================================================== */

export interface FallbackConfig {
  pools: Record<string, string[][]>;
  eliza_rules: ElizaRule[];
  reflections: Record<string, string>;
  tools: Record<string, unknown>;
  workflows: Record<string, unknown>;
  databases: Record<string, unknown>;
  models?: Record<string, AIModuleConfig>;
  preferences?: Record<string, unknown>;
  defaults?: Record<string, unknown>;
  environment?: "development" | "production" | "test";
  version?: string;
  // Ergänzungen für erweiterte Konfiguration
  security?: {
    max_requests_per_minute?: number;
    allowed_ips?: string[];
    require_authentication?: boolean;
  };
  logging?: {
    level: "error" | "warn" | "info" | "debug";
    retain_days: number;
  };
}

/* ========================================================================== */
/* 🧰 Tool-System */
/* ========================================================================== */

export interface ToolMetadata {
  name: string; // Hinzugefügt für Konsistenz
  description?: string;
  parameters?: Record<string, unknown>;
  category?: string;
  version?: string;
  restricted?: boolean;
  author?: string;
  last_updated?: string;
  return_type?: string;
  // Ergänzungen für erweiterte Tool-Metadaten
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  examples?: Array<{
    input: Record<string, unknown>;
    output: unknown;
  }>;
  dependencies?: string[];
  timeout_ms?: number;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  runtime_ms?: number;
  source_tool?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
  // Ergänzungen für erweiterte Ergebnisverwaltung
  warnings?: string[];
  partial_data?: unknown;
  next_steps?: string[];
}

export interface ToolFunction {
  (params: Record<string, unknown>): Promise<unknown> | unknown;
  description?: string;
  parameters?: Record<string, unknown>;
  category?: string;
  version?: string;
  restricted?: boolean;
  registeredAt?: string;
  // Ergänzungen für erweiterte Tool-Funktionen
  validate?: (params: Record<string, unknown>) => boolean;
  cleanup?: () => void;
}

export interface ToolRegistryEntry extends ToolMetadata {
  name: string;
  registeredAt?: string;
  // Ergänzungen für Registry-Einträge
  enabled?: boolean;
  health_check?: () => boolean;
  usage_count?: number;
  last_used?: string;
}

/* ========================================================================== */
/* 🔁 Workflow-System - VERBESSERTE VERSION */
/* ========================================================================== */

export type WorkflowStepType =
  | "tool_call"
  | "if"
  | "loop"
  | "workflow_call"
  | "context_update"
  | "transform"
  | "log"
  | "wait"
  | "api_request"
  | "ai_invoke"
  | "parallel"
  | "switch"
  | "error_handler"
  | "variable_set"
  | "variable_clear"
  | "end"
  | "event_emit"
  | "data_validation" // Neu: Datenvalidierungsschritt
  | "notification"; // Neu: Benachrichtigungsschnittstelle

/**
 * Repräsentiert einen einzelnen Schritt innerhalb eines Workflows.
 */
export interface WorkflowStep {
  /** Schritt-Typ (tool_call, if, loop, etc.) */
  type: WorkflowStepType;

  /** Name des Tools, Workflows oder API-Aufrufs */
  tool?: string;

  /** Parameter, die an Tool oder Subworkflow übergeben werden */
  params?: Record<string, unknown>;

  /** Speichert Ergebnis des Schrittes unter diesem Variablennamen */
  variable?: string;

  /** Bedingung für if/switch */
  condition?: string;

  /** Verschachtelte Schritte (z. B. im if-, loop- oder parallel-Block) */
  steps?: WorkflowStep[];

  /** Log- oder Debug-Nachricht */
  message?: string;

  /** Transformation von Daten zwischen Variablen */
  transform?: {
    source: string;
    target: string;
    map?: Record<string, string>;
    // Ergänzungen für erweiterte Transformationen
    filter?: (item: unknown) => boolean;
    format?: "json" | "csv" | "xml";
  };

  /** Zeitlimit (in Millisekunden) für den Schritt */
  timeout_ms?: number;

  /** Wiederholungsversuche bei Fehlern */
  retries?: number;

  /** Falls true, wird Workflow trotz Fehler fortgesetzt */
  continue_on_error?: boolean;

  /** Optionaler benutzerdefinierter Name oder ID für den Schritt */
  id?: string;

  /** Optionaler Kontextschlüssel, der durch diesen Schritt beeinflusst wird */
  context_key?: string;

  /** Zusätzliche Metadaten, z. B. Beschreibung, Autor, Quelle */
  metadata?: Record<string, unknown>;

  /** Nur für `switch`: Fälle definieren */
  cases?: {
    match: string | number | boolean;
    steps: WorkflowStep[];
    // Ergänzungen für Switch-Cases
    description?: string;
  }[];

  /** Für `error_handler`: Schritte, die bei Fehlern ausgeführt werden */
  on_error_steps?: WorkflowStep[];

  /** Parallele Unteraufgaben (für Typ `parallel`) */
  parallel_branches?: {
    name: string;
    steps: WorkflowStep[];
    // Ergänzungen für parallele Ausführung
    timeout_ms?: number;
    merge_strategy?: "first" | "all" | "race";
  }[];

  /** Neu: Für `loop`-Schritte */
  loop_config?: {
    collection: string;
    item_var: string;
    max_iterations?: number;
    break_condition?: string;
  };

  /** Neu: Für `data_validation`-Schritte */
  validation_rules?: Array<{
    field: string;
    type: "string" | "number" | "boolean" | "array" | "object";
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  }>;

  /** Neu: Für `notification`-Schritte */
  notification?: {
    type: "email" | "slack" | "webhook" | "internal";
    target: string;
    template: string;
    data_mapping?: Record<string, string>;
  };
}

/**
 * Definition eines vollständigen Workflows.
 */
export interface WorkflowDefinition {
  /** Interne ID des Workflows */
  id?: string;

  /** Beschreibung des Workflows */
  description?: string;

  /** Liste der auszuführenden Schritte */
  steps: WorkflowStep[];

  /** Fehlerstrategie auf Workflow-Ebene */
  on_error?: "continue" | "stop" | "skip" | "rollback";

  /** Zusatzinformationen (Autor, Kategorie etc.) */
  metadata?: Record<string, any>;

  /** Workflow-Kategorie */
  category?: string;

  /** Version des Workflows */
  version?: string;

  /** Zeitpunkt der Erstellung */
  created_at?: string;

  /** Name des Workflows (optional, für konsistente Identifikation) */
  name?: string;

  /** Optionale Tags (z. B. ["export", "database"]) */
  tags?: string[];

  /** Workflow-Variablen (Standardwerte bei Start) */
  variables?: Record<string, any>;

  /** Gibt an, ob der Workflow aktiv ist */
  enabled?: boolean;

  /** Ergänzungen für erweiterte Workflow-Funktionen */
  triggers?: Array<{
    type: "manual" | "schedule" | "event" | "api";
    config: Record<string, any>;
  }>;

  /** Berechtigungen für Workflow-Ausführung */
  permissions?: {
    roles?: string[];
    users?: string[];
    require_approval?: boolean;
  };

  /** Zeitliche Begrenzungen */
  scheduling?: {
    max_runtime_ms?: number;
    allowed_time_windows?: Array<{
      start: string;
      end: string;
    }>;
  };

  /** Input/Output-Schema für bessere Validierung */
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
}

/* ========================================================================== */
/* 🧩 KI-Antwortstruktur - VERBESSERT */
/* ========================================================================== */

export interface AIResponse {
  text: string;
  action?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
  tool_calls?: Array<{
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: Record<string, any>;
    // Ergänzungen für erweiterte Tool-Aufrufe
    id?: string;
    sequential?: boolean;
    fallback_tool?: string;
  }>;
  context_update?: Record<string, unknown>;
  suggested_actions?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  meta?: {
    model?: string;
    provider?: string;
    tokens_used?: number;
    confidence?: number;
    reasoning?: string;
    time_ms?: number;
    source?: string;
    workflow?: string;
    // Ergänzungen für erweiterte Metadaten
    cost_estimate?: number;
    model_version?: string;
    reasoning_steps?: string[];
    alternatives?: string[];
    [key: string]: unknown;
  };
  errors?: string[];
  // Ergänzungen für erweiterte Antwortverwaltung
  warnings?: string[];
  next_steps?: string[];
  requires_confirmation?: boolean;
  confirmation_prompt?: string;
}

/* ========================================================================== */
/* 💬 Kontextverwaltung - VERBESSERT */
/* ========================================================================== */

export interface ConversationState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  preferences?: Record<string, unknown>;
  history_length?: number;
  sentiment?: "positive" | "neutral" | "negative" | "critical" | "questioning";
  current_topic?: string;
  intent?: string;
  confidence?: "low" | "medium" | "high";
  updated_at?: string;
  active_workflow?: string;
  last_tool_used?: string;
  user_profile?: Record<string, unknown>;
  context_confidence?: string;
  // Ergänzungen für erweiterte Kontextverwaltung
  session_start?: string;
  language?: string;
  timezone?: string;
  allowed_actions?: string[];
  security_level?: "low" | "medium" | "high";
  conversation_phase?: "initial" | "middle" | "final";
  pending_actions?: Array<{
    action: string;
    params: Record<string, unknown>;
    required_confirmation: boolean;
  }>;
}

/* ========================================================================== */
/* 📊 System- & KI-Monitoring - VERBESSERT */
/* ========================================================================== */

export interface ElizaStats {
  total_rules: number;
  rules_by_priority: Record<number, number>;
  patterns_with_tools: number;
  patterns_with_actions: number;
  highest_priority: number;
  lowest_priority: number;
  last_updated?: string;
  // Ergänzungen für erweiterte Statistiken
  rules_by_category?: Record<string, number>;
  most_used_rules?: Array<{ pattern: string; count: number }>;
  success_rate?: number;
  average_response_time_ms?: number;
}

export interface SystemMetrics {
  cpu_load?: number[];
  memory_usage_percent?: number;
  uptime_seconds?: number;
  active_tools?: number;
  workflows_executed?: number;
  last_error?: string;
  timestamp?: string;
  sessions_active?: number;
  tool_failures?: number;
  avg_response_time_ms?: number;
  total_requests?: number;
  // Ergänzungen für erweiterte Metriken
  database_connections?: number;
  cache_hit_rate?: number;
  network_latency_ms?: number;
  queue_length?: number;
  error_rate?: number;
  throughput_requests_per_second?: number;
}

/* ========================================================================== */
/* 🤖 KI-Modelle, Provider & Agenten - VERBESSERT */
/* ========================================================================== */

/**
 * Unterstützte KI-Provider im ERP_SteinmetZ-System.
 */
export type Provider =
  | "openai"
  | "anthropic"
  | "local"
  | "ollama"
  | "fallback"
  | "custom"
  | "huggingface"
  | "azure"
  | "vertex"
  | "embedding"
  | "workflow"
  | "diagnostic"
  | "mock"; // Neu: Für Testzwecke

/** Typisierte Modell-ID */
export type AnyModelId = string & { __brand?: "AnyModelId" };

/* -------------------------------------------------------------------------- */
/* 🧩 KI-Modul-Konfiguration - VERBESSERT */
/* -------------------------------------------------------------------------- */

export interface AIModuleConfig {
  name: string;
  provider: Provider;
  model: string;
  temperature?: number;
  max_tokens?: number;
  role?:
    | "assistant"
    | "analyzer"
    | "controller"
    | "router"
    | "observer"
    | "specialist";
  endpoint?: string;
  api_key_env?: string;
  api_key_value?: string;
  capabilities?: (
    | "chat"
    | "completion"
    | "embedding"
    | "translation"
    | "summarization"
    | "text"
    | "audio"
    | "vision"
    | "code"
    | "tools"
    | "workflow"
    | "json"
    | "json_mode"
    | "speech"
    | "reasoning"
    | "tool_calls"
    | "multimodal" // Neu: Für multimodale Modelle
  )[];
  active?: boolean;
  timeout_ms?: number;
  description?: string;
  version?: string;
  priority?: number;
  last_updated?: string;
  avg_token_usage?: number;
  last_latency_ms?: number;
  streaming?: boolean;
  cacheable?: boolean;
  category?:
    | "general"
    | "system"
    | "analysis"
    | "research"
    | "training"
    | "fallback"
    | "custom";
  meta?: Record<string, any>;
  // Ergänzungen für erweiterte Modulkonfiguration
  health_check_endpoint?: string;
  retry_config?: {
    max_retries: number;
    backoff_multiplier: number;
  };
  rate_limiting?: {
    requests_per_minute: number;
    burst_capacity: number;
  };
  cost_tracking?: {
    cost_per_token?: number;
    monthly_budget?: number;
  };
}

/* -------------------------------------------------------------------------- */
/* 🧠 Agenten-Konfiguration & Status - VERBESSERT */
/* -------------------------------------------------------------------------- */

export interface AIAgentConfig {
  id: string;
  name: string;
  role: Role;
  model: string;
  provider: Provider;
  capabilities?: string[];
  active?: boolean;
  max_tokens?: number;
  temperature?: number;
  routing_priority?: number;
  description?: string;
  last_active_at?: string;
  environment?: string;
  // Ergänzungen für erweiterte Agentenkonfiguration
  memory_config?: {
    type: "short_term" | "long_term" | "hybrid";
    max_context_length?: number;
  };
  tool_restrictions?: string[];
  allowed_domains?: string[];
  personality_traits?: string[];
  communication_style?: "formal" | "casual" | "technical" | "friendly";
}

export interface AIAgentStatus {
  name: string;
  model: string;
  state:
    | "idle"
    | "running"
    | "error"
    | "initializing"
    | "paused"
    | "terminated";
  last_activity?: string;
  error_message?: string;
  total_requests?: number;
  avg_latency_ms?: number;
  last_runtime_ms?: number;
  failed_requests?: number;
  success_rate?: number;
  provider?: Provider;
  diagnostics?: Record<string, any>;
  system_load?: { cpu?: number; memory?: number; disk?: number };
  updated_at?: string;
  // Ergänzungen für erweiterten Status
  current_session_id?: string;
  queue_length?: number;
  resource_usage?: {
    cpu_percent: number;
    memory_mb: number;
    network_io?: number;
  };
  performance_metrics?: {
    p95_latency_ms: number;
    p99_latency_ms: number;
    error_distribution: Record<string, number>;
  };
}

/* -------------------------------------------------------------------------- */
/* 🧩 Cluster- und Pool-Zustand - VERBESSERT */
/* -------------------------------------------------------------------------- */

export interface AIClusterState {
  agents: AIAgentStatus[];
  active_models: string[];
  total_requests: number;
  failed_requests: number;
  avg_latency_ms: number;
  started_at?: string;
  active_providers?: Provider[];
  mode?: "operational" | "degraded" | "maintenance" | "recovering";
  metrics?: {
    tokens_generated?: number;
    avg_tokens_per_call?: number;
    error_rate?: number;
    uptime_ms?: number;
    // Ergänzungen für erweiterte Metriken
    concurrent_sessions?: number;
    cache_efficiency?: number;
    cost_per_request?: number;
  };
  config_snapshot?: Record<string, any>;
  // Ergänzungen für erweiterten Cluster-Zustand
  load_balancing?: {
    strategy: "round_robin" | "least_connections" | "weighted";
    weights?: Record<string, number>;
  };
  health_check?: {
    last_check: string;
    healthy_agents: number;
    unhealthy_agents: number;
  };
  scaling_recommendations?: Array<{
    agent: string;
    action: "scale_up" | "scale_down" | "maintain";
    reason: string;
  }>;
}

/* ========================================================================== */
/* 🧭 Provider-Standardisierung - VERBESSERT */
/* ========================================================================== */

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  timeoutMs?: number;
  context?: Record<string, any>;
  stream?: boolean;
  // Ergänzungen für erweiterte Optionen
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  tool_choice?: "auto" | "none" | "required";
  stop_sequences?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  seed?: number;
}

export interface ModelResponse {
  model: string;
  provider: Provider;
  text: string;
  tokens_in?: number;
  tokens_out?: number;
  duration_ms?: number;
  tool_calls?: Array<{
    name: string;
    parameters: Record<string, any>;
    // Ergänzungen für erweiterte Tool-Aufrufe
    id?: string;
    type?: "function";
  }>;
  success?: boolean;
  errors?: string[];
  meta?: Record<string, any>;
  // Ergänzungen für erweiterte Antworten
  finish_reason?: "stop" | "length" | "tool_calls" | "content_filter";
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export type ProviderFunction = (
  model: string,
  messages: ChatMessage[],
  options?: AIOptions,
) => Promise<ModelResponse | string>;

/* ========================================================================== */
/* 🪪 Audit & Rückverfolgbarkeit - VERBESSERT */
/* ========================================================================== */

export interface AuditLogEntry {
  timestamp: string;
  user?: string;
  action: string;
  details?: Record<string, any>;
  success?: boolean;
  duration_ms?: number;
  workflow?: string;
  tool?: string;
  error?: string;
  category?: string;
  context?: Record<string, any>;
  source_ip?: string;
  // Ergänzungen für erweiterte Audit-Logs
  session_id?: string;
  resource_id?: string;
  severity?: "low" | "medium" | "high" | "critical";
  compliance_tags?: string[];
  data_changes?: Array<{
    field: string;
    old_value: unknown;
    new_value: unknown;
  }>;
}

/* ========================================================================== */
/* 🧭 Kategorien / Quellen - VERBESSERT */
/* ========================================================================== */

export type MessageCategory =
  | "greetings"
  | "thanks"
  | "goodbye"
  | "orders"
  | "inventory"
  | "customers"
  | "invoices"
  | "products"
  | "pricing"
  | "calculations"
  | "file_operations"
  | "system_info"
  | "system_monitoring"
  | "system_health"
  | "system_security"
  | "database"
  | "ai"
  | "workflow"
  | "research"
  | "project"
  | "code"
  | "communication"
  | "training"
  | "unknown"
  | "compliance" // Neu: Für Compliance-bezogene Nachrichten
  | "reporting"; // Neu: Für Berichtswesen

export type ConfigSource =
  | "json"
  | "defaults"
  | "database"
  | "env"
  | "dynamic"
  | "api";

/* ========================================================================== */
/* 💬 Sessions - VERBESSERT */
/* ========================================================================== */

export interface ChatSession {
  id: string;
  model: string;
  provider: Provider;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  // Ergänzungen für erweiterte Session-Verwaltung
  user_id?: string;
  organization_id?: string;
  status?: "active" | "paused" | "completed" | "archived";
  settings?: {
    auto_save?: boolean;
    max_history_length?: number;
    allowed_tools?: string[];
  };
  statistics?: {
    total_messages: number;
    average_response_time: number;
    most_used_tools: string[];
  };
}

/* ========================================================================== */
/* 🧾 KI-Pipeline - VERBESSERT */
/* ========================================================================== */

export interface PipelineStage {
  name: string;
  description?: string;
  handler: (input: unknown, context?: unknown) => Promise<unknown>;
  depends_on?: string[];
  timeout_ms?: number;
  output_key?: string;
  enabled?: boolean;
  // Ergänzungen für erweiterte Pipeline-Stages
  retry_policy?: {
    max_attempts: number;
    backoff_ms: number;
  };
  validation_schema?: Record<string, unknown>;
  error_handler?: (error: Error, context: unknown) => Promise<unknown>;
}

export interface PipelineRun {
  id: string;
  started_at: string;
  finished_at?: string;
  stages_executed: string[];
  success: boolean;
  results: Record<string, any>;
  errors?: string[];
  duration_ms?: number;
  initiator?: string;
  // Ergänzungen für erweiterte Pipeline-Runs
  trigger?: {
    type: "manual" | "scheduled" | "event";
    source: string;
  };
  performance_metrics?: {
    stage_times: Record<string, number>;
    memory_usage_mb: number;
    bottleneck_stage?: string;
  };
  rollback_info?: {
    attempted: boolean;
    success: boolean;
    steps_rolled_back: string[];
  };
}

/* ========================================================================== */
/* 🌐 API- und Netzwerkschnittstellen - VERBESSERT */
/* ========================================================================== */

export interface APIRequestLog {
  method: string;
  url: string;
  status: number;
  duration_ms: number;
  source_ip?: string;
  user_agent?: string;
  timestamp: string;
  // Ergänzungen für erweiterte API-Logs
  request_size_bytes?: number;
  response_size_bytes?: number;
  endpoint_category?: string;
  user_id?: string;
  query_params?: Record<string, any>;
  error_code?: string;
}

export interface APIResponseEnvelope<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status_code?: number;
  meta?: Record<string, any>;
  // Ergänzungen für erweiterte API-Antworten
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  warnings?: string[];
  validation_errors?: Record<string, string[]>;
}

/* ========================================================================== */
/* 🧰 Utility-Typen - VERBESSERT */
/* ========================================================================== */

export type SanitizeMessagesFn = (messages: ChatMessage[]) => ChatMessage[];
export type WithTimeoutFn = <T>(promise: Promise<T>, ms?: number) => Promise<T>;
export type ToolExecutionFn = (
  name: string,
  params?: Record<string, any>,
) => Promise<ToolResult>;

// Neue Utility-Typen
export type AsyncResult<T, E = Error> = Promise<{ data?: T; error?: E }>;
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
};

/* ========================================================================== */
/* 🧠 Reasoning & Wissensmanagement - VERBESSERT */
/* ========================================================================== */

export interface ReasoningTrace {
  step: string;
  input: unknown;
  output: unknown;
  duration_ms: number;
  timestamp: string;
  // Ergänzungen für erweiterte Reasoning-Traces
  confidence?: number;
  alternatives_considered?: unknown[];
  decision_factors?: string[];
  metadata?: Record<string, unknown>;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  source?: string;
  last_updated?: string;
  related_tools?: string[];
  // Ergänzungen für erweitertes Wissensmanagement
  category?: string;
  priority?: "low" | "medium" | "high" | "critical";
  access_level?: "public" | "internal" | "restricted";
  validity_period?: {
    valid_from: string;
    valid_until: string;
  };
  dependencies?: string[];
  metadata?: Record<string, any>;
}

/* ========================================================================== */
/* ✅ Kompatibilitäts-Export */
/* ========================================================================== */

// Behalten Sie die bestehenden Exporte für Abwärtskompatibilität bei
export type { ChatMessage as BaseChatMessage };

/* ========================================================================== */
/* 🆕 NEUE TYPEN FÜR ERWEITERTE FUNKTIONALITÄT */
/* ========================================================================== */

/** Für erweiterte Fehlerbehandlung */
export interface ErrorHandlingConfig {
  max_retries: number;
  retry_delay_ms: number;
  fallback_strategy: "continue" | "stop" | "use_default";
  notify_on_critical: boolean;
  log_level: "error" | "warn" | "info";
}

/** Für Caching-System */
export interface CacheConfig {
  enabled: boolean;
  ttl_ms: number;
  max_size_mb: number;
  strategy: "lru" | "fifo" | "ttl";
  persist_to_disk: boolean;
}

/** Für Sicherheits- und Berechtigungssystem */
export interface SecurityContext {
  user_id: string;
  roles: string[];
  permissions: string[];
  organization_id?: string;
  session_attributes: Record<string, any>;
  auth_method: "jwt" | "api_key" | "session" | "none";
}

/** Für Event-System */
export interface SystemEvent {
  type: string;
  source: string;
  timestamp: string;
  data: Record<string, any>;
  severity: "info" | "warning" | "error" | "critical";
  correlation_id?: string;
}

/** Für Batch-Verarbeitung */
export interface BatchProcessingConfig {
  batch_size: number;
  max_concurrent_batches: number;
  timeout_ms: number;
  retry_policy: {
    max_retries: number;
    backoff_factor: number;
  };
}
