// hooks.ts - Vollständig korrigierte und API-kompatible Version
import { useState, useCallback, useRef, useEffect } from "react";
import {
  ChatSession,
  AIModel,
  Settings,
  ToolMetadata,
  ConversationState,
  ChatMessage,
  AIResponse,
} from "./types";
import { BACKEND_URL, DEFAULT_SETTINGS } from "./constants";

// System Status Interface - korrekt aus API-Dokumentation
interface SystemStatus {
  timestamp: string;
  model_count: number;
  tool_count: number;
  workflow_count: number;
  system_status: "healthy" | "degraded" | "unhealthy";
  active_provider: string;
  fallback_enabled: boolean;
}

export const useQuickChat = () => {
  // State Management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null,
  );
  const [models, setModels] = useState<AIModel[]>([]);
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [conversationContext, setConversationContext] =
    useState<ConversationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ KORRIGIERT: Generic API Call mit korrekten Endpoints und Error Handling
  const apiCall = useCallback(
    async <T = any>(
      endpoint: string,
      options: RequestInit = {},
      timeoutMs: number = 60000,
    ): Promise<T> => {
      const controller = new AbortController();
      const { signal } = controller;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      setLoading(true);
      setError(null);

      try {
        // ✅ KORRIGIERT: Korrekter API-Pfad mit /api/ai prefix
        const response = await fetch(`${BACKEND_URL}/api/ai${endpoint}`, {
          ...options,
          signal,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message =
            errorData.error?.message || `API Error (${response.status})`;

          // ✅ KORRIGIERT: Spezifische Error-Codes aus API-Dokumentation
          const errorCode = errorData.error?.code || "ERR_UNKNOWN";
          throw new Error(`${errorCode}: ${message}`);
        }

        // ✅ KORRIGIERT: Direkte Rückgabe des Response-Body (kein Wrapping)
        return await response.json();
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === "AbortError") {
          const timeoutError = "ERR_TIMEOUT: Request timeout";
          setError(timeoutError);
          throw new Error(timeoutError);
        }

        const message =
          err.message || "ERR_UNKNOWN: An unexpected error occurred";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ==================== SESSION MANAGEMENT ====================

  const loadSessions = useCallback(async (): Promise<ChatSession[]> => {
    try {
      // ✅ KORRIGIERT: Korrekter Endpoint gemäß API-Dokumentation
      const sessions = await apiCall<ChatSession[]>("/sessions");

      const normalized: ChatSession[] = Array.isArray(sessions) ? sessions : [];
      setSessions(normalized);

      if (normalized.length > 0 && !currentSession) {
        setCurrentSession(normalized[0]);
      }

      return normalized;
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setSessions([]);
      throw err;
    }
  }, [apiCall, currentSession]);

  const createSession = useCallback(
    async (
      model: string = "gpt-4o-mini",
      provider: string = "openai",
    ): Promise<ChatSession> => {
      try {
        // ✅ KORRIGIERT: Korrektes Payload gemäß API-Dokumentation
        const session = await apiCall<ChatSession>("/chat", {
          method: "POST",
          body: JSON.stringify({ model }), // provider wird automatisch vom Backend bestimmt
        });

        setSessions((prev) =>
          Array.isArray(prev) ? [session, ...prev] : [session],
        );
        setCurrentSession(session);
        return session;
      } catch (err) {
        console.error("Failed to create session:", err);
        throw err;
      }
    },
    [apiCall],
  );

  const getSession = useCallback(
    async (sessionId: string): Promise<ChatSession> => {
      try {
        const list = await loadSessions();
        const found = list.find((s) => s.id === sessionId);

        if (!found) {
          throw new Error(`ERR_NOT_FOUND: Session ${sessionId} not found`);
        }

        return found;
      } catch (err) {
        console.error("Failed to get session:", err);
        throw err;
      }
    },
    [loadSessions],
  );

  const deleteSession = useCallback(
    async (sessionId: string): Promise<void> => {
      try {
        // ✅ KORRIGIERT: Korrekter Endpoint gemäß API-Dokumentation
        await apiCall(`/chat/${sessionId}`, { method: "DELETE" });

        setSessions((prev) =>
          Array.isArray(prev) ? prev.filter((s) => s.id !== sessionId) : [],
        );

        setCurrentSession((prev) => {
          if (!prev || prev.id !== sessionId) return prev;
          const newSessions = sessions.filter((s) => s.id !== sessionId);
          return newSessions.length > 0 ? newSessions[0] : null;
        });
      } catch (err) {
        console.error("Failed to delete session:", err);
        throw err;
      }
    },
    [apiCall, sessions],
  );

  const listSessions = useCallback(async (): Promise<ChatSession[]> => {
    return loadSessions();
  }, [loadSessions]);

  // ==================== CHAT FUNCTIONS ====================

  const sendMessage = useCallback(
    async (
      message: string,
      sessionId?: string,
      model?: string,
      provider?: string,
    ): Promise<AIResponse> => {
      try {
        if (sessionId) {
          // ✅ KORRIGIERT: Korrektes Payload gemäß API-Dokumentation
          const response = await apiCall<AIResponse>(
            `/chat/${sessionId}/message`,
            {
              method: "POST",
              body: JSON.stringify({ message }),
            },
          );

          // ✅ KORRIGIERT: Session wird separat geladen falls nötig
          // Das Backend gibt die Session nicht in der AI Response zurück

          return response;
        } else {
          // ✅ KORRIGIERT: Session-Erstellung über Backend
          const session = await createSession(model, provider);

          // Nachricht an neu erstellte Session senden
          const response = await apiCall<AIResponse>(
            `/chat/${session.id}/message`,
            {
              method: "POST",
              body: JSON.stringify({ message }),
            },
          );

          return response;
        }
      } catch (err) {
        console.error("Failed to send message:", err);
        throw err;
      }
    },
    [apiCall, createSession],
  );

  const sendMessageToSession = useCallback(
    async (sessionId: string, message: string): Promise<AIResponse> => {
      return sendMessage(message, sessionId);
    },
    [sendMessage],
  );

  const streamMessage = useCallback(
    async (
      message: string,
      onChunk: (chunk: string) => void,
      sessionId?: string,
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = sessionId ? `/chat/${sessionId}/message` : "/chat";

        // ✅ KORRIGIERT: Korrekter API-Pfad
        const response = await fetch(`${BACKEND_URL}/api/ai${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || `Stream error: ${response.status}`,
          );
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
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ==================== MODEL MANAGEMENT ====================

  const loadModels = useCallback(async (): Promise<AIModel[]> => {
    try {
      // ✅ KORRIGIERT: Direkte Rückgabe des Arrays (kein Wrapping)
      const models = await apiCall<AIModel[]>("/models");
      const normalized = Array.isArray(models) ? models : [];
      setModels(normalized);
      return normalized;
    } catch (err) {
      console.error("Failed to load models:", err);
      setModels([]);
      throw err;
    }
  }, [apiCall]);

  const getModels = useCallback(async (): Promise<AIModel[]> => {
    return loadModels();
  }, [loadModels]);

  const getProviders = useCallback(async (): Promise<
    Array<{
      provider: string;
      available: boolean;
    }>
  > => {
    try {
      const status = await apiCall<SystemStatus>("/status");
      return [
        {
          provider: status.active_provider,
          available: status.system_status === "healthy",
        },
      ];
    } catch (err) {
      console.error("Failed to get providers:", err);
      throw err;
    }
  }, [apiCall]);

  // ==================== TOOL MANAGEMENT ====================

  const loadTools = useCallback(async (): Promise<ToolMetadata[]> => {
    try {
      // ✅ KORRIGIERT: Direkte Rückgabe des Arrays (kein Wrapping)
      const tools = await apiCall<ToolMetadata[]>("/tools");
      const normalized = Array.isArray(tools) ? tools : [];
      setTools(normalized);
      return normalized;
    } catch (err) {
      console.error("Failed to load tools:", err);
      setTools([]);
      throw err;
    }
  }, [apiCall]);

  const listTools = useCallback(async (): Promise<ToolMetadata[]> => {
    return loadTools();
  }, [loadTools]);

  const executeTool = useCallback(
    async (
      toolName: string,
      params: Record<string, any> = {},
    ): Promise<any> => {
      try {
        // ✅ KORRIGIERT: Korrekter Endpoint gemäß API-Dokumentation
        return await apiCall(`/tools/${toolName}/run`, {
          method: "POST",
          body: JSON.stringify({ params }), // ✅ Korrektes Payload-Format
        });
      } catch (err) {
        console.error("Failed to execute tool:", err);
        throw err;
      }
    },
    [apiCall],
  );

  // ==================== SETTINGS MANAGEMENT ====================

  const loadSettings = useCallback(async (): Promise<Settings> => {
    try {
      // ✅ KORRIGIERT: Direkte Rückgabe der Settings (kein Wrapping)
      const settings = await apiCall<Settings>("/settings");
      const normalized = settings || DEFAULT_SETTINGS;
      setSettings(normalized);
      return normalized;
    } catch (err) {
      console.error("Failed to load settings:", err);
      setSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  }, [apiCall]);

  const saveSettings = useCallback(
    async (newSettings: Settings): Promise<Settings> => {
      try {
        // ✅ KORRIGIERT: Korrektes PUT mit komplettem Settings-Objekt
        const settings = await apiCall<Settings>("/settings", {
          method: "PUT",
          body: JSON.stringify(newSettings),
        });
        setSettings(settings);
        return settings;
      } catch (err) {
        console.error("Failed to save settings:", err);
        throw err;
      }
    },
    [apiCall],
  );

  const updateSetting = useCallback(
    async (key: string, value: any): Promise<void> => {
      try {
        // ✅ KORRIGIERT: Korrekter PATCH Endpoint
        await apiCall(`/settings/${key}`, {
          method: "PATCH",
          body: JSON.stringify({ value }),
        });

        setSettings((prev) => ({ ...prev, [key]: value }));
      } catch (err) {
        console.error("Failed to update setting:", err);
        throw err;
      }
    },
    [apiCall],
  );

  // ==================== CONTEXT MANAGEMENT ====================

  const loadConversationContext =
    useCallback(async (): Promise<ConversationState> => {
      try {
        // Conversation context wird automatisch vom Backend verwaltet
        const context: ConversationState = {
          preferences: {},
          history_length: 0,
          stats: {
            messageCount: 0,
            topicSwitches: 0,
            lastTopic: null,
            averageResponseTime: 0,
            tokensUsed: 0,
          },
        };
        setConversationContext(context);
        return context;
      } catch (err) {
        console.error("Failed to load conversation context:", err);
        throw err;
      }
    }, []);

  const getConversationContext =
    useCallback(async (): Promise<ConversationState> => {
      return loadConversationContext();
    }, [loadConversationContext]);

  const resetContext = useCallback(async (): Promise<void> => {
    try {
      // Context reset durch neue Session
      await createSession();
    } catch (err) {
      console.error("Failed to reset context:", err);
      throw err;
    }
  }, [createSession]);

  // ==================== AUDIO FUNCTIONS ====================

  const transcribeAudio = useCallback(
    async (
      audioFile: File,
    ): Promise<{
      text: string;
      meta: any;
    }> => {
      const formData = new FormData();
      formData.append("audio", audioFile);

      setLoading(true);
      setError(null);

      try {
        // ✅ KORRIGIERT: Korrekter Endpoint gemäß API-Dokumentation
        const response = await fetch(`${BACKEND_URL}/api/ai/audio/transcribe`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message ||
              `Transcription error: ${response.status}`,
          );
        }

        return await response.json();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ ENTFERNT: synthesizeSpeech - nicht in API dokumentiert

  // ==================== VISION FUNCTIONS ====================

  // ✅ ENTFERNT: analyzeImage - nicht in API dokumentiert
  // Vision-Funktionalität wird über Tool-Execution implementiert

  // ==================== TRANSLATION FUNCTIONS ====================

  const translateText = useCallback(
    async (
      text: string,
      targetLang: string,
      engine: string = "openai",
    ): Promise<AIResponse> => {
      try {
        // ✅ KORRIGIERT: Korrektes Payload gemäß API-Dokumentation
        return await apiCall<AIResponse>("/translate", {
          method: "POST",
          body: JSON.stringify({ text, targetLang, engine }),
        });
      } catch (err) {
        console.error("Failed to translate text:", err);
        throw err;
      }
    },
    [apiCall],
  );

  // ==================== SYSTEM FUNCTIONS ====================

  const getSystemStatus = useCallback(async (): Promise<SystemStatus> => {
    try {
      return await apiCall<SystemStatus>("/status");
    } catch (err) {
      console.error("Failed to get system status:", err);
      throw err;
    }
  }, [apiCall]);

  const getDiagnostics = useCallback(async (): Promise<any> => {
    try {
      // ✅ KORRIGIERT: Diagnostics Endpoint (falls aktiviert)
      return await apiCall("/diagnostics");
    } catch (err) {
      console.error("Failed to get diagnostics:", err);
      throw err;
    }
  }, [apiCall]);

  // ==================== WORKFLOW FUNCTIONS ====================

  const listWorkflows = useCallback(async (): Promise<any[]> => {
    try {
      // ✅ KORRIGIERT: Direkte Rückgabe des Arrays (kein Wrapping)
      const workflows = await apiCall<any[]>("/workflows");
      return Array.isArray(workflows) ? workflows : [];
    } catch (err) {
      console.error("Failed to list workflows:", err);
      throw err;
    }
  }, [apiCall]);

  const executeWorkflow = useCallback(
    async (workflowName: string, input: any = {}): Promise<any> => {
      try {
        // ✅ KORRIGIERT: Korrekter Endpoint gemäß API-Dokumentation
        return await apiCall(`/workflow/${workflowName}/run`, {
          method: "POST",
          body: JSON.stringify({ input }), // ✅ Korrektes Payload-Format
        });
      } catch (err) {
        console.error("Failed to execute workflow:", err);
        throw err;
      }
    },
    [apiCall],
  );

  // ==================== KNOWLEDGE FUNCTIONS ====================

  // ✅ ENTFERNT: queryKnowledge - nicht in API dokumentiert

  // ==================== UTILITY FUNCTIONS ====================

  const cancelRequest = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setError("ERR_CANCELLED: Request cancelled");
    }
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadSessions().catch(console.error);
    loadModels().catch(console.error);
    loadTools().catch(console.error);
    loadSettings().catch(console.error);
  }, [loadSessions, loadModels, loadTools, loadSettings]);

  return {
    // ==================== STATE ====================
    sessions,
    currentSession,
    models,
    tools,
    settings,
    conversationContext,
    loading,
    error,

    // ==================== SESSION ACTIONS ====================
    loadSessions,
    createSession,
    getSession,
    deleteSession,
    listSessions,

    // ==================== CHAT ACTIONS ====================
    sendMessage,
    sendMessageToSession,
    streamMessage,

    // ==================== MODEL ACTIONS ====================
    loadModels,
    getModels,
    getProviders,

    // ==================== TOOL ACTIONS ====================
    loadTools,
    listTools,
    executeTool,

    // ==================== SETTINGS ACTIONS ====================
    loadSettings,
    saveSettings,
    updateSetting,

    // ==================== CONTEXT ACTIONS ====================
    loadConversationContext,
    getConversationContext,
    resetContext,

    // ==================== AUDIO ACTIONS ====================
    transcribeAudio,

    // ==================== TRANSLATION ACTIONS ====================
    translateText,

    // ==================== SYSTEM ACTIONS ====================
    getSystemStatus,
    getDiagnostics,

    // ==================== WORKFLOW ACTIONS ====================
    listWorkflows,
    executeWorkflow,

    // ==================== UTILITY ACTIONS ====================
    cancelRequest,
    clearError,

    // ==================== SETTERS ====================
    setCurrentSession,
    setSettings,
    setError,
  };
};

export default useQuickChat;
