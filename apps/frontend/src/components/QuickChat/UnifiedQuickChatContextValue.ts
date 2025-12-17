// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QuickChat/UnifiedQuickChatContextValue.ts

/**
 * UnifiedQuickChat Context Type Definition
 * Separated to avoid Fast Refresh issues
 * 
 * @module UnifiedQuickChatContextValue
 */

import { createContext } from "react";
import type {
  ChatSession,
  AIModel,
  AIResponse,
  Settings,
  ChatProvider,
  ProviderStatus,
  SystemStatus,
} from "./UnifiedQuickChatTypes";

/**
 * QuickChat context value interface
 */
export interface UnifiedQuickChatContextValue {
  // State
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  models: AIModel[];
  settings: Settings;
  loading: boolean;
  error: string | null;
  
  // Session management
  createSession: (model?: string, provider?: ChatProvider) => Promise<ChatSession>;
  loadSessions: () => Promise<ChatSession[]>;
  selectSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  
  // Message handling
  sendMessage: (content: string) => Promise<AIResponse>;
  streamMessage: (content: string, onChunk: (chunk: string) => void) => Promise<void>;
  
  // Model management
  loadModels: () => Promise<AIModel[]>;
  getProviders: () => Promise<ProviderStatus[]>;
  
  // Settings
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  
  // System
  getSystemStatus: () => Promise<SystemStatus>;
  
  // Utils
  clearError: () => void;
}

/**
 * UnifiedQuickChat Context
 */
export const UnifiedQuickChatContext = createContext<UnifiedQuickChatContextValue | null>(null);
