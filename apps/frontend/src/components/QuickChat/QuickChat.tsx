import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useQuickChat } from "./hooks";
import { ChatTab } from "./components/ChatTab";
import { ModelsTab } from "./components/ModelsTab";
import { SettingsTab } from "./components/SettingsTab";
import { InfoTab } from "./components/InfoTab";
import { Tab, QuickAction, Settings, AIModel, ChatSession } from "./types";
import { QUICK_ACTIONS, DEFAULT_SETTINGS, BACKEND_URL } from "./constants";
import "./QuickChat.css";

interface QuickChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickChat: React.FC<QuickChatProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();

  // QuickChat Hook für State Management
  const {
    // State
    sessions,
    currentSession,
    models,
    tools,
    settings,
    conversationContext,
    loading,
    error,

    // Session Actions
    loadSessions,
    createSession,
    deleteSession,
    listSessions,

    // Chat Actions
    sendMessage,

    // Model Actions
    loadModels,
    getModels,
    getProviders,

    // Tool Actions
    loadTools,
    listTools,
    executeTool,

    // Settings Actions
    loadSettings,
    saveSettings,

    // Context Actions
    getConversationContext,

    // Audio Actions
    transcribeAudio,

    // Translation Actions
    translateText,

    // System Actions
    getSystemStatus,

    // Utility Actions
    clearError,

    // Setters
    setCurrentSession,
    setSettings,
    setError,
  } = useQuickChat();

  // UI States
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [languages, setLanguages] = useState<
    Array<{ code: string; name: string }>
  >([]);

  // Audio & File States
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioLoading, setAudioLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // UI States
  const [showQuickActions, setShowQuickActions] = useState(false);

  // ✅ KORRIGIERT: Local sessions state mit korrekter Initialisierung
  const [localSessions, setLocalSessions] = useState<ChatSession[]>([]);

  // ✅ KORRIGIERT: System Info mit Loading State
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [systemInfoLoading, setSystemInfoLoading] = useState(false);
  const [systemInfoError, setSystemInfoError] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ KORRIGIERT: Sync local sessions mit hook sessions (sicher)
  useEffect(() => {
    if (Array.isArray(sessions)) {
      setLocalSessions(sessions);
    }
  }, [sessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, loading]);

  // Initial load when component opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadModels(),
        loadSessions(),
        loadTools(),
        loadSettings(),
        // ✅ ENTFERNT: loadLanguages() - Endpoint existiert nicht
        getConversationContext(), // ✅ KORRIGIERT: Direkter Aufruf statt Wrapper
      ]);

      // Load system info using QuickChat hook
      if (!systemInfo) {
        loadSystemInfoWithRetry();
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  };

  // ✅ KORRIGIERT: System Info Loading mit korrektem Status
  const loadSystemInfoWithRetry = async (retries = 3) => {
    setSystemInfoLoading(true);
    setSystemInfoError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/status`);

      if (!response.ok) {
        throw new Error(`Status error: ${response.status}`);
      }

      const status = await response.json();

      setSystemInfo({
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      if (retries > 0) {
        setTimeout(() => loadSystemInfoWithRetry(retries - 1), 1000);
      } else {
        setSystemInfoError(err.message || "Failed to load system info");
        // OFFLINE Status setzen
        setSystemInfo({
          status: {
            system_status: "unhealthy",
            active_provider: "none",
            model_count: 0,
            tool_count: 0,
            workflow_count: 0,
            fallback_enabled: false,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      setSystemInfoLoading(false);
    }
  };

  // ✅ ENTFERNT: loadLanguages() Funktion - nicht existierender Endpoint

  // ✅ KORRIGIERT: Session Selection mit defensiver Prüfung
  const handleSessionSelect = async (sessionId: string) => {
    try {
      const session = localSessions.find((s) => s.id === sessionId);
      if (!session) {
        console.warn("Session not found:", sessionId);
        return; // ✅ Verhindert undefined currentSession
      }
      setCurrentSession(session);
      setActiveTab("chat");
    } catch (err) {
      console.error("Failed to load session:", err);
    }
  };

  const handleSessionCreate = async () => {
    try {
      await createSession(selectedModel, selectedProvider);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  const handleSessionDelete = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      // Update current session if it's the deleted one
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleModelChange = async (sessionId: string, modelId: string) => {
    try {
      // Update local state only - model change happens when creating new messages
      const updatedSessions = localSessions.map((session) =>
        session.id === sessionId ? { ...session, model: modelId } : session,
      );

      setLocalSessions(updatedSessions);

      // Update current session if it's the active one
      if (currentSession?.id === sessionId) {
        setCurrentSession(
          updatedSessions.find((s) => s.id === sessionId) || null,
        );
      }
    } catch (err) {
      console.error("Failed to change model:", err);
    }
  };

  // ✅ KORRIGIERT: Send Message mit defensiver Prüfung
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    try {
      if (currentSession) {
        await sendMessage(input, currentSession.id);
      } else {
        await sendMessage(input, undefined, selectedModel, selectedProvider);
      }
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
      // ✅ Der Hook sollte jetzt message.content sicher handhaben
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Audio Recording using QuickChat hook
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access failed:", err);
      setError("Mikrofon-Zugriff fehlgeschlagen");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    setAudioLoading(true);
    setError(null);

    try {
      const file = new File([audioBlob], "recording.wav", {
        type: "audio/wav",
        lastModified: Date.now(),
      });

      const result = await transcribeAudio(file);
      setInput((prev) => (prev ? `${prev} ${result.text}` : result.text));
    } catch (err) {
      console.error("Audio upload failed:", err);
      setError("Audio-Verarbeitung fehlgeschlagen");
    } finally {
      setAudioLoading(false);
    }
  };

  // File Upload using QuickChat hook
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setError(null);

    try {
      let result;
      const formData = new FormData();
      formData.append("file", file);

      if (file.type.startsWith("image/")) {
        const response = await fetch(`${BACKEND_URL}/api/ai/analyze-image`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Image analysis failed");
        result = await response.json();
      } else if (file.type.startsWith("audio/")) {
        const response = await fetch(`${BACKEND_URL}/api/ai/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("File upload failed");
        result = await response.json();
      }

      const prompt = `Ich habe eine Datei hochgeladen: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB). Bitte analysiere den Inhalt: ${result.text || "Datei erfolgreich verarbeitet"}`;
      setInput((prev) => (prev ? `${prev}\n\n${prompt}` : prompt));
    } catch (err) {
      console.error("File upload failed:", err);
      setError("Datei-Upload fehlgeschlagen");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUploadDirect = async (file: File) => {
    const event = new Event("change", { bubbles: true }) as any;
    event.target = { files: [file] };
    await handleFileUpload(event);
  };

  // Quick Actions
  const handleQuickAction = (action: QuickAction) => {
    if (input.trim()) {
      setInput(`${action.prompt}\n\n${input}`);
    } else {
      setInput(`${action.prompt} `);
    }
    setShowQuickActions(false);
  };

  // Translation using QuickChat hook
  const handleTranslate = async () => {
    if (!input.trim()) return;

    try {
      const result = await translateText(
        input,
        settings?.language || "de",
        "openai",
      );
      setInput(result.text);
    } catch (err) {
      console.error("Translation failed:", err);
      setError("Übersetzung fehlgeschlagen");
    }
  };

  const handleSummarize = async () => {
    if (!input.trim()) return;
    setInput(`Bitte fasse den folgenden Text zusammen:\n\n${input}`);
  };

  // Settings Management using QuickChat hook
  const handleSettingsChange = (key: keyof Settings, value: any) => {
    if (settings) {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
    }
  };

  const handleSettingsSave = async () => {
    if (settings) {
      try {
        await saveSettings(settings);
      } catch (err) {
        console.error("Failed to save settings:", err);
        setError("Einstellungen konnten nicht gespeichert werden");
      }
    }
  };

  const handleSettingsReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Models Management
  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleModelsReload = async () => {
    await loadModels();
  };

  // System Info using QuickChat hook
  const handleSystemInfoRefresh = () => {
    loadSystemInfoWithRetry();
  };

  // Error Handling using QuickChat hook
  const dismissError = () => {
    clearError();
  };

  // ✅ KORRIGIERT: Sichere Toggle Handler
  const handleQuickActionToggle = (value: boolean) => {
    setShowQuickActions(Boolean(value));
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Early return if not open
  if (!isOpen) return null;

  return (
    <div className={`quick-chat-overlay ${theme}`}>
      <div className={`quick-chat-container ${theme}`}>
        {/* Header */}
        <header className="quick-chat-header">
          <div className="quick-chat-header-left">
            <h3>🤖 ERP Assistant</h3>
            {currentSession && (
              <span className="model-info">{currentSession.model}</span>
            )}
            {conversationContext && (
              <span className="context-info">
                {conversationContext.current_topic &&
                  `Thema: ${conversationContext.current_topic}`}
              </span>
            )}
          </div>
          <div className="quick-chat-header-right">
            {/* ✅ KORRIGIERT: Korrekter Online/Offline Status mit Loading */}
            <div className="connection-status">
              {systemInfoLoading
                ? "⏳ Lädt..."
                : systemInfo?.status?.system_status === "healthy"
                  ? "🟢 Online"
                  : "🔴 Offline"}
            </div>
            <button
              className="close-btn"
              onClick={onClose}
              aria-label="Chat schließen"
            >
              ×
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="quick-chat-tabs">
          {(["chat", "models", "settings", "info"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "chat" && "💬 Chat"}
              {tab === "models" && "🧠 Modelle"}
              {tab === "settings" && "⚙️ Einstellungen"}
              {tab === "info" && "📊 System"}
            </button>
          ))}
        </nav>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button
              className="dismiss-btn"
              onClick={dismissError}
              aria-label="Fehlermeldung schließen"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content */}
        <section className="quick-chat-content">
          {activeTab === "chat" && (
            <ChatTab
              sessions={localSessions}
              currentSession={currentSession}
              models={models}
              input={input}
              loading={loading}
              isRecording={isRecording}
              audioLoading={audioLoading}
              uploadLoading={uploadLoading}
              showQuickActions={showQuickActions}
              fallbackEnabled={fallbackEnabled}
              fileInputRef={fileInputRef}
              onSessionSelect={handleSessionSelect}
              onSessionCreate={handleSessionCreate}
              onSessionDelete={handleSessionDelete}
              onModelChange={handleModelChange}
              onFileUpload={handleFileUploadDirect}
              onInputChange={setInput}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              // ✅ KORRIGIERT: Sichere Toggle Funktion
              onQuickActionToggle={handleQuickActionToggle}
              onQuickAction={handleQuickAction}
              onFallbackToggle={setFallbackEnabled}
              onTranslate={handleTranslate}
              onSummarize={handleSummarize}
            />
          )}

          {activeTab === "models" && (
            <ModelsTab
              models={models}
              selectedModel={selectedModel}
              onModelSelect={handleModelSelect}
              onModelsReload={handleModelsReload}
            />
          )}

          {activeTab === "settings" && settings && (
            <SettingsTab
              settings={settings}
              models={models}
              onSettingsChange={handleSettingsChange}
              onSettingsSave={handleSettingsSave}
              onSettingsReset={handleSettingsReset}
            />
          )}

          {activeTab === "info" && (
            <InfoTab
              systemInfo={systemInfo}
              loading={systemInfoLoading}
              error={systemInfoError}
              onRefresh={handleSystemInfoRefresh}
            />
          )}
        </section>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default QuickChat;
