// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QuickChat/UnifiedQuickChatTypes.ts

/**
 * Unified QuickChat Type Definitions
 * Merged and improved types from both QuickChat versions
 *
 * @module UnifiedQuickChatTypes
 */

export type MessageRole = "system" | "user" | "assistant";

export type ChatProvider =
  | "openai"
  | "anthropic"
  | "local"
  | "ollama"
  | "azure"
  | "custom";

export type TabName = "chat" | "sessions" | "models" | "settings" | "info";

/**
 * Chat message interface
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message role */
  role: MessageRole;
  /** Message content */
  content: string;
  /** ISO timestamp */
  timestamp: string;
  /** Optional command that was executed */
  command?: string;
  /** Optional command execution result */
  commandResult?: unknown;
  /** Optional tool calls */
  toolCalls?: ToolCall[];
}

/**
 * Chat session interface
 */
export interface ChatSession {
  /** Unique session identifier */
  id: string;
  /** Session title */
  title: string;
  /** AI model used */
  model: string;
  /** Provider name */
  provider: string;
  /** Session messages */
  messages: ChatMessage[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * AI model interface
 */
export interface AIModel {
  /** Model identifier */
  id: string;
  /** Display name */
  name: string;
  /** Provider */
  provider: ChatProvider;
  /** Model description */
  description?: string;
  /** Maximum context length */
  maxTokens?: number;
  /** Is model available */
  available: boolean;
}

/**
 * Provider status interface
 */
export interface ProviderStatus {
  /** Provider name */
  provider: ChatProvider;
  /** Is provider available */
  available: boolean;
  /** Status message */
  message?: string;
}

/**
 * Tool metadata interface
 */
export interface ToolMetadata {
  /** Tool identifier */
  id: string;
  /** Tool name */
  name: string;
  /** Tool description */
  description: string;
  /** Tool category */
  category: string;
  /** Tool parameters */
  parameters?: Record<string, ToolParameter>;
}

/**
 * Tool parameter interface
 */
export interface ToolParameter {
  /** Parameter type */
  type: string;
  /** Parameter description */
  description: string;
  /** Is parameter required */
  required?: boolean;
  /** Default value */
  default?: string | number | boolean;
}

/**
 * Tool call interface
 */
export interface ToolCall {
  /** Tool identifier */
  id: string;
  /** Tool name */
  name: string;
  /** Tool arguments */
  arguments: Record<string, unknown>;
  /** Execution result */
  result?: ToolExecutionResult;
}

/**
 * Tool execution result interface
 */
export interface ToolExecutionResult {
  /** Execution success status */
  success: boolean;
  /** Result data */
  data?: unknown;
  /** Error message */
  error?: string;
}

/**
 * AI response interface
 */
export interface AIResponse {
  /** Response message */
  message: string;
  /** Session identifier */
  sessionId?: string;
  /** Model used */
  model?: string;
  /** Response metadata */
  metadata?: Record<string, unknown>;
  /** Tool calls */
  toolCalls?: ToolCall[];
}

/**
 * Settings interface
 */
export interface Settings {
  /** Default model */
  defaultModel: string;
  /** Default provider */
  defaultProvider: ChatProvider;
  /** Temperature setting */
  temperature: number;
  /** Maximum tokens */
  maxTokens: number;
  /** Enable streaming */
  streaming: boolean;
  /** Enable sound notifications */
  soundEnabled: boolean;
  /** Theme */
  theme: "light" | "dark" | "auto";
}

/**
 * System status interface
 */
export interface SystemStatus {
  /** Status timestamp */
  timestamp: string;
  /** Number of available models */
  modelCount: number;
  /** Number of available tools */
  toolCount: number;
  /** System health status */
  systemStatus: "healthy" | "degraded" | "unhealthy";
  /** Active provider */
  activeProvider: string;
  /** Is fallback enabled */
  fallbackEnabled: boolean;
}

/**
 * Command definition interface
 */
export interface CommandDefinition {
  /** Command string */
  command: string;
  /** Command description */
  description: string;
  /** Command category */
  category?: string;
  /** Command handler */
  handler?: (args?: string) => void | Promise<void>;
}
