// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QuickChat/UnifiedQuickChatContext.tsx

/**
 * Unified QuickChat Context Provider
 *
 * Provides centralized state management for QuickChat using React Context API.
 * Handles sessions, messages, models, settings, and API communication.
 *
 * Features:
 * - Session management
 * - Message handling
 * - Model selection
 * - Settings persistence
 * - Backend API integration
 * - Error handling
 *
 * @example
 * ```tsx
 * <UnifiedQuickChatProvider>
 *   <UnifiedQuickChat />
 * </UnifiedQuickChatProvider>
 * ```
 *
 * @module UnifiedQuickChatContext
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  ChatSession,
  ChatMessage,
  AIModel,
  AIResponse,
  Settings,
  SystemStatus,
  ProviderStatus,
  ChatProvider,
} from "./UnifiedQuickChatTypes";
import {
  UnifiedQuickChatContext,
  type UnifiedQuickChatContextValue,
} from "./UnifiedQuickChatContextValue";

const API_BASE = "/api/ai";
const DEFAULT_TIMEOUT = 30000;

const DEFAULT_SETTINGS: Settings = {
  defaultModel: "qwen2.5:3b",
  defaultProvider: "ollama",
  temperature: 0.7,
  maxTokens: 2048,
  streaming: false,
  soundEnabled: true,
  theme: "auto",
};

interface UnifiedQuickChatProviderProps {
  children: ReactNode;
}

/**
 * UnifiedQuickChat Provider Component
 */
export const UnifiedQuickChatProvider: React.FC<
  UnifiedQuickChatProviderProps
> = ({ children }) => {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null,
  );
  const [models, setModels] = useState<AIModel[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Generic API call helper
   */
  const apiCall = useCallback(
    async <T = unknown,>(
      endpoint: string,
      options: RequestInit = {},
      timeout = DEFAULT_TIMEOUT,
    ): Promise<T> => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            throw new Error("Request timeout");
          }
          throw err;
        }
        throw new Error("Unknown error occurred");
      }
    },
    [],
  );

  /**
   * Load all sessions from backend
   */
  const loadSessions = useCallback(async (): Promise<ChatSession[]> => {
    try {
      const data = await apiCall<{ sessions: ChatSession[] }>("/sessions");
      const loadedSessions = data.sessions || [];
      setSessions(loadedSessions);
      return loadedSessions;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load sessions";
      setError(message);
      return [];
    }
  }, [apiCall]);

  /**
   * Create new chat session
   */
  const createSession = useCallback(
    async (
      model = settings.defaultModel,
      provider: ChatProvider = settings.defaultProvider,
    ): Promise<ChatSession> => {
      try {
        setLoading(true);
        const data = await apiCall<{ session: ChatSession }>("/sessions", {
          method: "POST",
          body: JSON.stringify({ model, provider }),
        });

        const newSession = data.session;
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSession(newSession);
        return newSession;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create session";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, settings],
  );

  /**
   * Select and load a session
   */
  const selectSession = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        const data = await apiCall<{ session: ChatSession }>(
          `/sessions/${sessionId}`,
        );
        setCurrentSession(data.session);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load session";
        setError(message);
      }
    },
    [apiCall],
  );

  /**
   * Delete a session
   */
  const deleteSession = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        await apiCall(`/sessions/${sessionId}`, { method: "DELETE" });
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete session";
        setError(message);
      }
    },
    [apiCall, currentSession],
  );

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (content: string): Promise<AIResponse> => {
      if (!content.trim()) {
        throw new Error("Message cannot be empty");
      }

      try {
        setLoading(true);
        setError(null);

        // Create session if none exists
        let session = currentSession;
        if (!session) {
          session = await createSession();
        }

        // Add user message to UI immediately
        const userMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: content.trim(),
          timestamp: new Date().toISOString(),
        };

        setCurrentSession((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, userMessage],
          };
        });

        // Send to backend
        const data = await apiCall<AIResponse>(
          `/sessions/${session.id}/messages`,
          {
            method: "POST",
            body: JSON.stringify({ message: content.trim() }),
          },
        );

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
          timestamp: new Date().toISOString(),
          toolCalls: data.toolCalls,
        };

        setCurrentSession((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, assistantMessage],
          };
        });

        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send message";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, currentSession, createSession],
  );

  /**
   * Stream a message (for future streaming support)
   */
  const streamMessage = useCallback(
    async (
      content: string,
      onChunk: (chunk: string) => void,
    ): Promise<void> => {
      // Placeholder for streaming implementation
      const response = await sendMessage(content);
      onChunk(response.message);
    },
    [sendMessage],
  );

  /**
   * Load available models
   */
  const loadModels = useCallback(async (): Promise<AIModel[]> => {
    try {
      const data = await apiCall<{ models: AIModel[] }>("/models");
      const loadedModels = data.models || [];
      setModels(loadedModels);
      return loadedModels;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load models";
      setError(message);
      return [];
    }
  }, [apiCall]);

  /**
   * Get provider status
   */
  const getProviders = useCallback(async (): Promise<ProviderStatus[]> => {
    try {
      const data = await apiCall<{ providers: ProviderStatus[] }>("/providers");
      return data.providers || [];
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load providers";
      setError(message);
      return [];
    }
  }, [apiCall]);

  /**
   * Update settings
   */
  const updateSettings = useCallback(
    async (newSettings: Partial<Settings>): Promise<void> => {
      try {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        // Persist to backend
        await apiCall("/settings", {
          method: "PUT",
          body: JSON.stringify(updated),
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update settings";
        setError(message);
      }
    },
    [apiCall, settings],
  );

  /**
   * Get system status
   */
  const getSystemStatus = useCallback(async (): Promise<SystemStatus> => {
    try {
      const data = await apiCall<SystemStatus>("/system/status");
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get system status";
      setError(message);
      throw err;
    }
  }, [apiCall]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    loadSessions();
    loadModels();
  }, [loadSessions, loadModels]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const value: UnifiedQuickChatContextValue = {
    sessions,
    currentSession,
    models,
    settings,
    loading,
    error,
    createSession,
    loadSessions,
    selectSession,
    deleteSession,
    sendMessage,
    streamMessage,
    loadModels,
    getProviders,
    updateSettings,
    getSystemStatus,
    clearError,
  };

  return (
    <UnifiedQuickChatContext.Provider value={value}>
      {children}
    </UnifiedQuickChatContext.Provider>
  );
};

export default UnifiedQuickChatProvider;
