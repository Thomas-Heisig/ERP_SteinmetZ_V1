// ERP_SteinmetZ_V1\apps\frontend\src\hooks\useAI.ts
import { useState, useCallback, useRef } from "react";

// TypeScript Interfaces - Angepasst an Backend-Typen
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: string;
  metadata?: {
    intent?: string;
    sentiment?: "positive" | "neutral" | "negative";
    topic?: string;
    model?: string;
    tokens?: number;
  };
}

export interface AIResponse {
  text: string;
  action?: string;
  tool_calls?: Array<{
    name: string;
    parameters: Record<string, unknown>;
  }>;
  context_update?: Record<string, unknown>;
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

export interface ToolMetadata {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  category?: string;
  version?: string;
  restricted?: boolean;
  registeredAt?: string;
}

export interface AIModel {
  name: string;
  provider: string;
  model: string;
  active: boolean;
  capabilities: string[];
  description: string;
  endpoint?: string;
}

export interface ChatSession {
  id: string;
  model: string;
  provider?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  tokensUsed?: number;
  meta?: Record<string, unknown>;
}

export interface ConversationState {
  current_topic?: string;
  sentiment?: "positive" | "negative" | "neutral" | "critical" | "questioning";
  intent?:
    | "query"
    | "create"
    | "update"
    | "delete"
    | "calculate"
    | "diagnose"
    | "informational";
  confidence?: "low" | "medium" | "high";
  preferences: Record<string, unknown>;
  history_length: number;
  updated_at?: string;
  stats: {
    messageCount: number;
    topicSwitches: number;
    lastTopic: string | null;
  };
}

export interface SystemStatus {
  timestamp: string;
  model_count: number;
  tool_count: number;
  workflow_count: number;
  system_status: "healthy" | "degraded" | "unhealthy";
  active_provider: string;
  fallback_enabled: boolean;
}

// Main Hook
export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generic API Call Function
  const apiCall = useCallback(
    async <T = unknown>(
      endpoint: string,
      options: RequestInit = {},
      timeoutMs: number = 60000,
    ): Promise<T> => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, timeoutMs);

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/ai${endpoint}`, {
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          signal: abortControllerRef.current.signal,
          ...options,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || `API Error: ${response.status}`,
          );
        }

        return await response.json();
      } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof Error && err.name === "AbortError") {
          throw new Error("Request timeout");
        }

        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [],
  );

  // Chat Functions - Angepasst an Backend-API
  const sendMessage = useCallback(
    async (
      message: string,
      sessionId?: string,
      model?: string,
      provider?: string,
    ): Promise<AIResponse> => {
      if (sessionId) {
        return apiCall<AIResponse>(`/chat/${sessionId}/message`, {
          method: "POST",
          body: JSON.stringify({ message }),
        });
      } else {
        return apiCall<AIResponse>("/chat", {
          method: "POST",
          body: JSON.stringify({
            message,
            model,
            provider,
          }),
        });
      }
    },
    [apiCall],
  );

  const streamMessage = useCallback(
    async (
      message: string,
      onChunk: (chunk: string) => void,
      sessionId?: string,
    ): Promise<void> => {
      setLoading(true);
      setError("");

      try {
        const endpoint = sessionId ? `/chat/${sessionId}/message` : "/chat";

        const response = await fetch(`/api/ai${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Stream error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          onChunk(chunk);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Session Management - Angepasst an Backend-API
  const createSession = useCallback(
    async (
      model: string = "gpt-4o-mini",
      provider: string = "openai",
    ): Promise<ChatSession> => {
      return apiCall<ChatSession>("/chat", {
        method: "POST",
        body: JSON.stringify({ model, provider }),
      });
    },
    [apiCall],
  );

  const getSession = useCallback(
    async (_sessionId: string): Promise<ChatSession> => {
      // Sessions werden über den SessionStore verwaltet
      // Direkter Session-Zugriff über Backend nicht verfügbar
      throw new Error(
        "Direct session access not available. Use listSessions instead.",
      );
    },
    [],
  );

  const updateSession = useCallback(
    async (sessionId: string, message: ChatMessage): Promise<ChatSession> => {
      // Session wird automatisch bei Nachrichten aktualisiert
      await sendMessage(message.content, sessionId);
      return apiCall<ChatSession>(`/chat/${sessionId}`);
    },
    [sendMessage, apiCall],
  );

  const deleteSession = useCallback(
    async (sessionId: string): Promise<void> => {
      await apiCall(`/chat/${sessionId}`, { method: "DELETE" });
    },
    [apiCall],
  );

  const listSessions = useCallback(async (): Promise<ChatSession[]> => {
    return apiCall<ChatSession[]>("/sessions");
  }, [apiCall]);

  // Tool Functions - Angepasst an Backend-API
  const listTools = useCallback(async (): Promise<ToolMetadata[]> => {
    const response = await apiCall<{ tools: ToolMetadata[] }>("/tools");
    return response.tools || [];
  }, [apiCall]);

  const executeTool = useCallback(
    async (
      toolName: string,
      params: Record<string, unknown> = {},
    ): Promise<Record<string, unknown>> => {
      return apiCall(`/tools/${toolName}/run`, {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
    [apiCall],
  );

  // Model Management - Angepasst an Backend-API
  const getModels = useCallback(async (): Promise<AIModel[]> => {
    const response = await apiCall<{ models: AIModel[] }>("/models");
    return response.models || [];
  }, [apiCall]);

  const getProviders = useCallback(async (): Promise<
    Array<{
      provider: string;
      available: boolean;
      models: string[];
    }>
  > => {
    return apiCall("/status");
  }, [apiCall]);

  // Audio Functions - Angepasst an Backend-API
  const transcribeAudio = useCallback(
    async (
      audioFile: File,
    ): Promise<{
      text: string;
      meta: Record<string, unknown>;
    }> => {
      const formData = new FormData();
      formData.append("audio", audioFile);

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/ai/audio/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Transcription error: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const synthesizeSpeech = useCallback(
    async (text: string, voice: string = "alloy"): Promise<Blob> => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/ai/audio/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice }),
        });

        if (!response.ok) {
          throw new Error(`Synthesis error: ${response.status}`);
        }

        return await response.blob();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Vision Functions - Angepasst an Backend-API
  const analyzeImage = useCallback(
    async (
      imageFile: File,
      instruction?: string,
      engine: string = "openai",
    ): Promise<AIResponse> => {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (instruction) formData.append("instruction", instruction);
      formData.append("engine", engine);

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/ai/vision/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Vision analysis error: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Context Management - Angepasst an Backend-API
  const getConversationContext =
    useCallback(async (): Promise<ConversationState> => {
      // ConversationContext wird automatisch verwaltet
      // Direkter Zugriff über spezifischen Endpoint nicht verfügbar
      return apiCall<ConversationState>("/status");
    }, [apiCall]);

  const resetContext = useCallback(async (): Promise<void> => {
    // Context Reset über spezifischen Endpoint nicht verfügbar
    // Wird automatisch bei neuen Sessions verwaltet
    console.warn(
      "Context reset not directly available. Create a new session instead.",
    );
  }, []);

  // Translation Functions - Angepasst an Backend-API
  const translateText = useCallback(
    async (
      text: string,
      targetLang: string,
      engine: string = "openai",
    ): Promise<AIResponse> => {
      return apiCall<AIResponse>("/translate", {
        method: "POST",
        body: JSON.stringify({ text, targetLang, engine }),
      });
    },
    [apiCall],
  );

  // System Functions - Angepasst an Backend-API
  const getSystemStatus = useCallback(async (): Promise<SystemStatus> => {
    return apiCall<SystemStatus>("/status");
  }, [apiCall]);

  const getDiagnostics = useCallback(async (): Promise<SystemStatus> => {
    return apiCall("/status");
  }, [apiCall]);

  // Workflow Functions - Angepasst an Backend-API
  const listWorkflows = useCallback(async (): Promise<
    Record<string, unknown>[]
  > => {
    const response = await apiCall<{ workflows: Record<string, unknown>[] }>(
      "/workflows",
    );
    return response.workflows || [];
  }, [apiCall]);

  const executeWorkflow = useCallback(
    async (
      workflowName: string,
      input: Record<string, unknown> = {},
    ): Promise<Record<string, unknown>> => {
      return apiCall(`/workflow/${workflowName}/run`, {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    [apiCall],
  );

  // Settings Management - Neu hinzugefügt
  const getSettings = useCallback(async (): Promise<
    Record<string, unknown>
  > => {
    return apiCall("/settings");
  }, [apiCall]);

  const updateSettings = useCallback(
    async (
      settings: Record<string, unknown>,
    ): Promise<Record<string, unknown>> => {
      return apiCall("/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
    },
    [apiCall],
  );

  const updateSetting = useCallback(
    async (key: string, value: unknown): Promise<Record<string, unknown>> => {
      return apiCall(`/settings/${key}`, {
        method: "PATCH",
        body: JSON.stringify({ value }),
      });
    },
    [apiCall],
  );

  // Knowledge Base Functions - Neu hinzugefügt
  const queryKnowledge = useCallback(
    async (
      query: string,
      limit: number = 5,
    ): Promise<Record<string, unknown>> => {
      return apiCall("/knowledge/query", {
        method: "POST",
        body: JSON.stringify({ query, limit }),
      });
    },
    [apiCall],
  );

  // Utility Functions
  const cancelRequest = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setError("Request cancelled");
    }
  }, []);

  const clearError = useCallback((): void => {
    setError("");
  }, []);

  return {
    // State
    loading,
    error,

    // Chat
    sendMessage,
    streamMessage,

    // Sessions
    createSession,
    getSession,
    updateSession,
    deleteSession,
    listSessions,

    // Tools
    listTools,
    executeTool,

    // Models & Providers
    getModels,
    getProviders,

    // Audio
    transcribeAudio,
    synthesizeSpeech,

    // Vision
    analyzeImage,

    // Context
    getConversationContext,
    resetContext,

    // Translation
    translateText,

    // System
    getSystemStatus,
    getDiagnostics,

    // Workflows
    listWorkflows,
    executeWorkflow,

    // Settings
    getSettings,
    updateSettings,
    updateSetting,

    // Knowledge
    queryKnowledge,

    // Utilities
    cancelRequest,
    clearError,
  };
};

export default useAI;
