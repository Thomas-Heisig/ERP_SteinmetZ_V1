// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QuickChat/UnifiedQuickChat.tsx

/**
 * Unified QuickChat Component
 *
 * Complete AI assistant interface merged from QuickChat and QuickChatAlt.
 * Features modern design, full TypeScript support, and backend integration.
 *
 * @module UnifiedQuickChat
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useUnifiedQuickChat } from "./useUnifiedQuickChat";
import styles from "./UnifiedQuickChat.module.css";
import type {
  TabName,
  CommandDefinition,
  ChatProvider,
} from "./UnifiedQuickChatTypes";

const COMMANDS: CommandDefinition[] = [
  { command: "/rechnung", description: "Rechnung erstellen", category: "erp" },
  { command: "/angebot", description: "Angebot erstellen", category: "erp" },
  {
    command: "/bericht",
    description: "Bericht generieren",
    category: "reports",
  },
  { command: "/idee", description: "Idee parken", category: "notes" },
  { command: "/termin", description: "Termin erstellen", category: "calendar" },
  { command: "/suche", description: "Im System suchen", category: "search" },
  { command: "/hilfe", description: "Hilfe anzeigen", category: "system" },
  { command: "/new", description: "Neue Session starten", category: "system" },
  { command: "/clear", description: "Nachrichten löschen", category: "system" },
];

interface UnifiedQuickChatProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

export const UnifiedQuickChat: React.FC<UnifiedQuickChatProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const {
    sessions,
    currentSession,
    models,
    settings,
    loading,
    error,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    updateSettings,
    clearError,
  } = useUnifiedQuickChat();

  const [activeTab, setActiveTab] = useState<TabName>("chat");
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredCommandsList = useMemo(() => {
    if (!input.startsWith("/")) return [];
    const search = input.toLowerCase();
    return COMMANDS.filter(
      (c) =>
        c.command.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search.slice(1)),
    );
  }, [input]);

  const shouldShowCommands =
    filteredCommandsList.length > 0 && input.startsWith("/");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const selectCommand = useCallback((command: string) => {
    setInput(command + " ");
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const message = input.trim();
      setInput("");

      try {
        if (message.startsWith("/")) {
          const cmd = message.split(" ")[0];

          if (cmd === "/new") {
            await createSession();
            return;
          }

          if (cmd === "/clear") {
            return;
          }
        }

        await sendMessage(message);
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [input, loading, sendMessage, createSession],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (shouldShowCommands) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedCommandIndex((prev) =>
            prev < filteredCommandsList.length - 1 ? prev + 1 : 0,
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedCommandIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommandsList.length - 1,
          );
        } else if (e.key === "Tab" || e.key === "Enter") {
          if (filteredCommandsList[selectedCommandIndex]) {
            e.preventDefault();
            selectCommand(filteredCommandsList[selectedCommandIndex].command);
          }
        } else if (e.key === "Escape") {
          setInput("");
        }
      }

      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        handleSubmit(e);
      }
    },
    [
      shouldShowCommands,
      filteredCommandsList,
      selectedCommandIndex,
      handleSubmit,
      selectCommand,
    ],
  );

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Always show floating button when closed
  const floatingButton = !isOpen ? (
    <button
      className={styles.floatingButton}
      onClick={onOpen || (() => {})}
      aria-label="QuickChat öffnen"
      type="button"
    >
      💬
    </button>
  ) : null;

  if (!isOpen) {
    return floatingButton;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.container} ${isMinimized ? styles.minimized : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="QuickChat Dialog"
      >
        <header
          className={styles.header}
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>💬</span>
            <div>
              <h2 className={styles.headerTitle}>QuickChat</h2>
              <div className={styles.headerInfo}>
                <div className={styles.headerStatus}>
                  <span
                    className={`${styles.statusIndicator} ${loading ? styles.loading : ""} ${error ? styles.error : ""}`}
                    aria-label={
                      loading ? "Lädt..." : error ? "Fehler" : "Verbunden"
                    }
                  />
                  <span>
                    {loading
                      ? "Verarbeite..."
                      : error
                        ? "Fehler"
                        : currentSession
                          ? currentSession.model
                          : "Bereit"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.headerButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              aria-label={isMinimized ? "Maximieren" : "Minimieren"}
              type="button"
            >
              {isMinimized ? "⬆️" : "⬇️"}
            </button>
            <button
              className={styles.headerButton}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Schließen"
              type="button"
            >
              ✕
            </button>
          </div>
        </header>

        {!isMinimized && (
          <>
            <div className={styles.tabs} role="tablist">
              {(
                ["chat", "sessions", "models", "settings", "info"] as const
              ).map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""}`}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  {...{
                    "aria-selected":
                      activeTab === tab
                        ? ("true" as const)
                        : ("false" as const),
                  }}
                  type="button"
                >
                  {tab === "chat" && "💬 Chat"}
                  {tab === "sessions" && "📁 Sessions"}
                  {tab === "models" && "🤖 Modelle"}
                  {tab === "settings" && "⚙️ Einstellungen"}
                  {tab === "info" && "ℹ️ Info"}
                </button>
              ))}
            </div>

            {error && (
              <div className={styles.errorBanner} role="alert">
                <span className={styles.errorText}>{error}</span>
                <button
                  className={styles.errorDismiss}
                  onClick={clearError}
                  aria-label="Fehler schließen"
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}

            <div className={styles.content}>
              {activeTab === "chat" && (
                <>
                  <div className={styles.messagesContainer}>
                    {!currentSession || currentSession.messages.length === 0 ? (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>💭</div>
                        <h3 className={styles.emptyStateTitle}>
                          Willkommen bei QuickChat
                        </h3>
                        <p className={styles.emptyStateText}>
                          Starten Sie eine Unterhaltung oder geben Sie einen
                          Befehl mit / ein
                        </p>
                      </div>
                    ) : (
                      currentSession.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`${styles.message} ${styles[message.role]}`}
                        >
                          <div
                            className={`${styles.messageBubble} ${styles[message.role]}`}
                          >
                            <p className={styles.messageContent}>
                              {message.content}
                            </p>
                            {message.command && (
                              <span className={styles.messageCommand}>
                                {message.command}
                              </span>
                            )}
                            <div className={styles.messageTimestamp}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {loading && (
                      <div className={styles.loadingMessage}>
                        <div className={styles.loadingBubble}>
                          <span className={styles.loadingDots}>...</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}

              {activeTab === "sessions" && (
                <div className={styles.sessionsTab}>
                  <h3>Sessions ({sessions.length})</h3>
                  {sessions.map((session) => (
                    <div key={session.id} className={styles.sessionCard}>
                      <div>
                        <h4>{session.title}</h4>
                        <p>{session.model}</p>
                      </div>
                      <button
                        onClick={() => selectSession(session.id)}
                        type="button"
                      >
                        Öffnen
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        type="button"
                      >
                        Löschen
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "models" && (
                <div className={styles.modelsTab}>
                  <h3>Verfügbare Modelle ({models.length})</h3>
                  {models.map((model) => (
                    <div key={model.id} className={styles.modelCard}>
                      <h4>{model.name}</h4>
                      <p>{model.description}</p>
                      <span>{model.provider}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "settings" && (
                <div className={styles.settingsTab}>
                  <h3>Einstellungen</h3>

                  <div className={styles.settingGroup}>
                    <label htmlFor="provider-select">Standard Provider</label>
                    <select
                      id="provider-select"
                      value={settings.defaultProvider}
                      onChange={(e) =>
                        updateSettings({
                          defaultProvider: e.target.value as ChatProvider,
                        })
                      }
                      className={styles.settingSelect}
                    >
                      <option value="ollama">Ollama (Lokal)</option>
                      <option value="eliza">Eliza (Regelbasiert)</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="azure">Azure OpenAI</option>
                      <option value="local">Lokales Modell</option>
                    </select>
                    <small>
                      Ollama wird als primärer Provider verwendet, Eliza als
                      Fallback
                    </small>
                  </div>

                  <div className={styles.settingGroup}>
                    <label htmlFor="model-select">Standard Modell</label>
                    <input
                      id="model-select"
                      type="text"
                      value={settings.defaultModel}
                      onChange={(e) =>
                        updateSettings({ defaultModel: e.target.value })
                      }
                      className={styles.settingInput}
                      placeholder="z.B. qwen2.5:3b"
                    />
                  </div>

                  <div className={styles.settingGroup}>
                    <label htmlFor="temperature-slider">
                      Temperatur: {settings.temperature}
                    </label>
                    <input
                      id="temperature-slider"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) =>
                        updateSettings({
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      className={styles.settingSlider}
                    />
                    <small>
                      Niedrige Werte (0-0.5) = präzise, Hohe Werte (0.8-2) =
                      kreativ
                    </small>
                  </div>

                  <div className={styles.settingGroup}>
                    <label htmlFor="max-tokens">Max Tokens</label>
                    <input
                      id="max-tokens"
                      type="number"
                      min="256"
                      max="8192"
                      step="256"
                      value={settings.maxTokens}
                      onChange={(e) =>
                        updateSettings({ maxTokens: parseInt(e.target.value) })
                      }
                      className={styles.settingInput}
                    />
                  </div>
                </div>
              )}

              {activeTab === "info" && (
                <div className={styles.infoTab}>
                  <h3>System Information</h3>
                  <div className={styles.infoCard}>
                    <h4>Provider Konfiguration</h4>
                    <p>
                      <strong>Primär:</strong> {settings.defaultProvider}
                    </p>
                    <p>
                      <strong>Fallback:</strong> Eliza (regelbasiert)
                    </p>
                    <p>
                      <strong>Modell:</strong> {settings.defaultModel}
                    </p>
                  </div>
                  <div className={styles.infoCard}>
                    <h4>Verfügbare Provider</h4>
                    <ul>
                      <li>🏠 Ollama - Lokale Modelle (empfohlen)</li>
                      <li>🤖 Eliza - Regelbasierter Fallback</li>
                      <li>☁️ OpenAI - Cloud API</li>
                      <li>☁️ Anthropic - Cloud API</li>
                      <li>☁️ Azure OpenAI - Cloud API</li>
                      <li>💾 Local - GGUF Modelle</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {activeTab === "chat" && (
              <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                  {shouldShowCommands && (
                    <div
                      className={styles.commandMenu}
                      role="listbox"
                      aria-label="Verfügbare Befehle"
                    >
                      {filteredCommandsList.map((cmd, index) => (
                        <button
                          key={cmd.command}
                          className={`${styles.commandButton} ${index === selectedCommandIndex ? styles.selected : ""}`}
                          onClick={() => selectCommand(cmd.command)}
                          role="option"
                          {...{
                            "aria-selected":
                              index === selectedCommandIndex
                                ? ("true" as const)
                                : ("false" as const),
                          }}
                          type="button"
                        >
                          <span className={styles.commandText}>
                            {cmd.command}
                          </span>
                          <span className={styles.commandDescription}>
                            {cmd.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <form className={styles.inputForm} onSubmit={handleSubmit}>
                    <textarea
                      ref={inputRef}
                      className={styles.inputField}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nachricht eingeben oder / für Befehle..."
                      disabled={loading}
                      rows={1}
                      aria-label="Nachricht eingeben"
                    />
                    <div className={styles.inputActions}>
                      <button
                        type="submit"
                        className={styles.actionButton}
                        disabled={!input.trim() || loading}
                        aria-label="Nachricht senden"
                      >
                        {loading ? (
                          <span className={styles.spinner} />
                        ) : (
                          "Senden"
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className={styles.quickActions}>
                  <button
                    className={styles.quickActionButton}
                    onClick={() => setInput("/rechnung ")}
                    type="button"
                  >
                    📄 Rechnung
                  </button>
                  <button
                    className={styles.quickActionButton}
                    onClick={() => setInput("/angebot ")}
                    type="button"
                  >
                    📝 Angebot
                  </button>
                  <button
                    className={styles.quickActionButton}
                    onClick={() => setInput("/idee ")}
                    type="button"
                  >
                    💡 Idee
                  </button>
                  <button
                    className={styles.quickActionButton}
                    onClick={() => setInput("/hilfe")}
                    type="button"
                  >
                    ❓ Hilfe
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UnifiedQuickChat;
