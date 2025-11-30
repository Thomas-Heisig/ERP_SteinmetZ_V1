// ERP_SteinmetZ_V1/apps/frontend/src/components/QuickChat/components/EnhancedInputArea.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  QuickAction, 
  ChatSession, 
  AIModel, 
  Provider,
  ConversationState
} from '../types';
import { QUICK_ACTIONS, CATEGORIES } from '../constants';

interface EnhancedInputAreaProps {
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  sendMessage: () => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  audioLoading: boolean;
  uploadLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // ✅ KORRIGIERT: Signatur geändert für direkte File-Übergabe
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;


  showQuickActions: boolean;

  // ✅ KORRIGIERT: Explizite Typ-Definition für beide Verwendungen
  setShowQuickActions: (value: boolean | ((prev: boolean) => boolean)) => void;

  quickActions: QuickAction[];
  currentSession: ChatSession | null;
  models: AIModel[];
  onQuickAction: (action: QuickAction) => void;
  onTranslate?: () => void;
  onSummarize?: () => void;
  disabled?: boolean;
  conversationContext?: ConversationState | null;
  onModelChange?: (sessionId: string, modelName: string) => void;
  onInsertTemplate?: (template: string) => void;
  
  // ✅ HINZUGEFÜGT: Fehlende Props aus ChatTab
  handleFileUploadWrapper?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuickActionToggle?: (show: boolean) => void;
}

export const EnhancedInputArea: React.FC<EnhancedInputAreaProps> = ({
  input,
  setInput,
  loading,
  handleKeyPress,
  sendMessage,
  isRecording,
  startRecording,
  stopRecording,
  audioLoading,
  uploadLoading,
  fileInputRef,
  handleFileUpload,
  showQuickActions,
  setShowQuickActions,
  quickActions = QUICK_ACTIONS,
  currentSession,
  models,
  onQuickAction,
  onTranslate,
  onSummarize,
  disabled = false,
  conversationContext,
  onModelChange,
  onInsertTemplate,
  
  // ✅ HINZUGEFÜGT: Fehlende Props mit Fallbacks
  handleFileUploadWrapper,
  onQuickActionToggle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // ✅ KORRIGIERT: Safe quick actions mit Default
  const safeQuickActions = Array.isArray(quickActions) ? quickActions : QUICK_ACTIONS;

  // ✅ KORRIGIERT: Fallback für setShowQuickActions mit funktionaler Unterstützung
  const safeSetShowQuickActions = (value: boolean | ((prev: boolean) => boolean)) => {
    if (typeof value === 'function') {
      setShowQuickActions(value);
    } else {
      setShowQuickActions(value);
      if (onQuickActionToggle) {
        onQuickActionToggle(value);
      }
    }
  };

  // ✅ KORRIGIERT: Fallback für file upload
  const safeHandleFileUpload = (file: File) => {
    // Erstelle ein synthetisches Event für die Wrapper-Funktion
    const syntheticEvent = {
      target: { files: FileList.prototype.constructor.call([file]) }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    if (handleFileUpload) {
      handleFileUpload(syntheticEvent);
    } else if (handleFileUploadWrapper) {
      handleFileUploadWrapper(syntheticEvent);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        safeSetShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickActions, safeSetShowQuickActions]);

  // ✅ KORRIGIERT: Check for text selection mit sicherem Zugriff
  useEffect(() => {
    const checkSelection = () => {
      try {
        const selection = window.getSelection();
        const text = selection?.toString() ?? "";
        setIsTextSelected(text.length > 0);
      } catch (error) {
        console.warn('Could not check text selection:', error);
        setIsTextSelected(false);
      }
    };

    document.addEventListener('selectionchange', checkSelection);
    return () => document.removeEventListener('selectionchange', checkSelection);
  }, []);

  // ✅ KORRIGIERT: Keyboard shortcuts mit sicherem Event-Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        safeSetShowQuickActions((prev: boolean) => !prev);
      }

      if (e.key === "Escape" && showQuickActions) {
        safeSetShowQuickActions(false);
      }

      // ✅ NEU: Ctrl+L für Clear Input
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        setInput('');
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showQuickActions, safeSetShowQuickActions, setInput]);

  // ✅ KORRIGIERT: Filtered actions mit sicherem Array
  const filteredActions =
    selectedCategory === "all"
      ? safeQuickActions
      : safeQuickActions.filter((a) => a.category === selectedCategory);

  // ✅ KORRIGIERT: Get current model info - korrigierte Backend-Struktur
  const getCurrentModel = () => {
    if (!currentSession?.model) return null;
    
    const safeModels = Array.isArray(models) ? models : [];
    return safeModels.find(model => model.name === currentSession.model);
  };

  // ✅ KORRIGIERT: Get provider icon mit Fallback-Map
  const getProviderIcon = (provider?: string) => {
    if (!provider) return '🤖';
    
    const providerIcons: Record<string, string> = {
      'openai': '🤖',
      'anthropic': '🧠', 
      'azure': '☁️',
      'vertex': '🔍',
      'ollama': '🦙',
      'local': '💻',
      'huggingface': '🤗',
      'llamacpp': '🦙',
      'custom': '⚙️',
      'fallback': '🔄',
      'eliza': '💬'
    };
    
    return providerIcons[provider.toLowerCase()] || '🤖';
  };

  // ✅ KORRIGIERT: Summarize Selected mit sicherem Text-Zugriff
  const handleSummarizeSelected = () => {
    if (!input.trim()) return;
    
    try {
      const selection = window.getSelection()?.toString() || '';
      if (selection && selection.length > 0) {
        setInput(`Bitte fasse diesen ausgewählten Abschnitt zusammen:\n\n"${selection}"\n\n${input}`);
      } else if (onSummarize) {
        onSummarize();
      } else {
        setInput(`Bitte fasse den folgenden Text zusammen:\n\n${input}`);
      }
    } catch (error) {
      console.warn('Could not summarize selection:', error);
      setInput(`Bitte fasse den folgenden Text zusammen:\n\n${input}`);
    }
  };

  const handleTranslate = () => {
    if (!input.trim()) return;
    if (onTranslate) {
      onTranslate();
    } else {
      setInput(`Übersetze den folgenden Text ins Deutsche und erkläre kulturelle Besonderheiten:\n\n${input}`);
    }
  };

  const handleImproveText = () => {
    if (!input.trim()) return;
    setInput(`Bitte verbessere diesen Text hinsichtlich Grammatik, Stil und Klarheit:\n\n${input}`);
  };

  const handleExpandText = () => {
    if (!input.trim()) return;
    setInput(`Bitte erweitere diesen Text um zusätzliche Details, Beispiele und Erklärungen:\n\n${input}`);
  };

  const handleClearInput = () => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // ✅ KORRIGIERT: Safe file upload handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      safeHandleFileUpload(file);
    }
    // ✅ Reset input für erneute Auswahl der gleichen Datei
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleInsertTemplate = (template: string) => {
    if (onInsertTemplate) {
      onInsertTemplate(template);
    } else {
      setInput(input ? `${input}\n\n${template}` : template);
    }
  };

  const handleContextAwareAction = () => {
    const topic = conversationContext?.current_topic?.toLowerCase();
    if (!topic) return;

    let prompt: string;

    if (topic.includes('bestellung') || topic.includes('order')) {
      prompt = 'Analysiere die aktuelle Bestellsituation und schlage Optimierungen vor:';
    } else if (topic.includes('lager') || topic.includes('inventory')) {
      prompt = 'Bewerte den aktuellen Lagerbestand und identifiziere Engpässe oder Überbestände:';
    } else if (topic.includes('kunde') || topic.includes('customer')) {
      prompt = 'Analysiere die Kundeninteraktion und schlage nächste Schritte vor:';
    } else if (topic.includes('rechnung') || topic.includes('invoice')) {
      prompt = 'Prüfe die Rechnungsdaten und identifiziere Unstimmigkeiten:';
    } else if (topic.includes('produkt') || topic.includes('product')) {
      prompt = 'Analysiere die Produktdaten und schlage Verbesserungen vor:';
    } else {
      const currentTopic = conversationContext?.current_topic ?? 'unbekanntes Thema';
      prompt = `Basierend auf unserem aktuellen Thema "${currentTopic}", was sind die nächsten sinnvollen Schritte?`;
    }

    setInput(input ? `${prompt}\n\n${input}` : prompt);
  };

  // ✅ KORRIGIERT: Handle model change mit defensiver Prüfung
  const handleModelChange = (modelName: string) => {
    if (currentSession?.id && modelName && onModelChange) {
      onModelChange(currentSession.id, modelName);
    }
  };

  // ✅ KORRIGIERT: Get character count and word count mit sicheren Werten
  const characterCount = typeof input === 'string' ? input.length : 0;
  const wordCount = typeof input === 'string' && input.trim() ? input.trim().split(/\s+/).length : 0;

  // Check if input is too long (warn at 2000 characters)
  const isInputLong = characterCount > 2000;
  const isInputVeryLong = characterCount > 4000;

  // ✅ KORRIGIERT: Get current model mit Fallback
  const currentModel = getCurrentModel();

  // ✅ KORRIGIERT: Safe capability rendering
  const renderCapability = (capability: string) => {
    const capabilityMap: Record<string, string> = {
      'chat': '💬 Chat',
      'vision': '🖼️ Vision', 
      'audio': '🎵 Audio',
      'embedding': '📊 Embedding',
      'translation': '🌐 Translation',
      'streaming': '⚡ Streaming',
      'function-calling': '🛠️ Tools',
      'reasoning': '🧠 Reasoning',
      'multimodal': '🎭 Multimodal'
    };
    
    return capabilityMap[capability] || capability;
  };

  return (
    <div className="input-container">
      {/* Quick Action Bar */}
      <div className="quick-actions-bar">
        <div className="quick-actions-left">
          <button
            className="quick-action-btn primary"
            onClick={() => safeSetShowQuickActions(!showQuickActions)}
            title="Schnellaktionen anzeigen/verstecken"
            disabled={disabled}
          >
            ⚡ Aktionen
          </button>

          {conversationContext?.current_topic && (
            <button
              className="quick-action-btn context-aware"
              onClick={handleContextAwareAction}
              title={`Aktion basierend auf aktuellem Thema: ${conversationContext.current_topic}`}
              disabled={disabled}
            >
              🎯 {conversationContext.current_topic}
            </button>
          )}

          {isTextSelected && (
            <button
              className="quick-action-btn highlight"
              onClick={handleSummarizeSelected}
              title="Ausgewählten Text zusammenfassen"
              disabled={disabled}
            >
              📋 Auswahl zusammenfassen
            </button>
          )}

          <button
            className="quick-action-btn"
            onClick={handleSummarizeSelected}
            disabled={!input.trim() || disabled}
            title="Gesamten Text zusammenfassen"
          >
            📝 Zusammenfassen
          </button>

          <button
            className="quick-action-btn"
            onClick={handleTranslate}
            disabled={!input.trim() || disabled}
            title="Text übersetzen"
          >
            🌐 Übersetzen
          </button>
        </div>

        <div className="quick-actions-right">
          <button
            className="quick-action-btn"
            onClick={handleImproveText}
            disabled={!input.trim() || disabled}
            title="Text verbessern"
          >
            ✨ Verbessern
          </button>

          <button
            className="quick-action-btn"
            onClick={handleExpandText}
            disabled={!input.trim() || disabled}
            title="Text erweitern"
          >
            🔍 Erweitern
          </button>

          <button
            className={`quick-action-btn ${isRecording ? "recording" : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={audioLoading || disabled}
            title={isRecording ? "Aufnahme stoppen" : "Sprachaufnahme starten"}
          >
            {audioLoading ? "⏳" : isRecording ? "⏹️ Stop" : "🎤 Aufnehmen"}
          </button>

          <button
            className="quick-action-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLoading || disabled}
            title="Datei hochladen"
          >
            {uploadLoading ? "⏳" : "📎 Datei"}
          </button>

          {input.trim() && (
            <button
              className="quick-action-btn danger"
              onClick={handleClearInput}
              title="Eingabe löschen"
              disabled={disabled}
            >
              🗑️ Löschen
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            style={{ display: "none" }}
            accept=".pdf,.docx,.txt,.xlsx,.jpg,.png,.pptx,.csv,.mp3,.wav,.mp4,.avi,.mov,.webp,.gif,.json,.xml"
            // ✅ KORRIGIERT: multiple entfernt da nur eine Datei verarbeitet wird
          />
        </div>
      </div>

      {/* Quick Actions Dropdown */}
      {showQuickActions && (
        <div className="quick-actions-dropdown" ref={dropdownRef}>
          <div className="quick-actions-header">
            <h4>⚡ Schnellaktionen</h4>
            <div className="quick-actions-meta">
              <span className="actions-count">
                {filteredActions.length} Aktionen
              </span>
              <button
                className="close-actions-btn"
                onClick={() => safeSetShowQuickActions(false)}
                title="Dropdown schließen"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="quick-actions-categories">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
                title={`Kategorie: ${category.name}`}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">
                  {safeQuickActions.filter(a => a.category === category.id).length}
                </span>
              </button>
            ))}
          </div>

          <div className="quick-actions-grid">
            {filteredActions.length > 0 ? (
              filteredActions.map((action) => (
                <button
                  key={action.id}
                  className="quick-action-item"
                  onClick={() => {
                    onQuickAction(action);
                    safeSetShowQuickActions(false);
                  }}
                  title={action.description || action.name}
                >
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-content">
                    <div className="action-name">{action.name}</div>
                    {action.description && (
                      <div className="action-description">
                        {action.description}
                      </div>
                    )}
                    {action.tags && action.tags.length > 0 && (
                      <div className="action-tags">
                        {action.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="action-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {action.usageCount && action.usageCount > 0 && (
                    <div className="action-usage">
                      {action.usageCount}×
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="no-actions-message">
                <div className="no-actions-icon">🔍</div>
                <div className="no-actions-text">
                  Keine Aktionen in dieser Kategorie verfügbar
                </div>
              </div>
            )}
          </div>

          <div className="quick-actions-footer">
            <div className="templates-section">
              <h5>📋 ERP-Schnellvorlagen</h5>
              <div className="template-buttons">
                <button 
                  onClick={() => handleInsertTemplate("Analysiere die aktuellen Bestellungen und identifiziere Engpässe:")}
                  className="template-btn"
                >
                  📦 Bestellanalyse
                </button>
                <button 
                  onClick={() => handleInsertTemplate("Erstelle einen Bericht über die Lagerbestände und schlage Optimierungen vor:")}
                  className="template-btn"
                >
                  📊 Lagerreport
                </button>
                <button 
                  onClick={() => handleInsertTemplate("Analysiere die Kundeninteraktionen der letzten Woche:")}
                  className="template-btn"
                >
                  👥 Kundenanalyse
                </button>
                <button 
                  onClick={() => handleInsertTemplate("Prüfe die aktuellen Rechnungen auf Unstimmigkeiten:")}
                  className="template-btn"
                >
                  🧾 Rechnungsprüfung
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="input-area">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={disabled ? "Bitte wählen Sie zuerst einen Chat aus..." : "Nachricht schreiben … (Shift+Enter für neue Zeile, Enter zum Senden)"}
          disabled={loading || disabled}
          className={`message-input ${isInputVeryLong ? 'warning' : ''}`}
          rows={1}
          style={{ 
            minHeight: '60px', 
            maxHeight: '200px',
            resize: 'vertical'
          }}
        />
        
        <div className="input-controls">
          <div className="input-stats">
            <span className={`character-count ${isInputLong ? 'warning' : ''} ${isInputVeryLong ? 'error' : ''}`}>
              {characterCount} Zeichen
              {isInputVeryLong && ' ⚠️'}
            </span>
            <span className="word-count">{wordCount} Wörter</span>
            {currentModel && (
              <span className="model-indicator">
                {getProviderIcon(currentModel.provider)} {currentModel.name}
              </span>
            )}
          </div>
          
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || disabled || isInputVeryLong}
            className={`send-button ${loading ? 'loading' : ''}`}
            title={
              disabled ? "Wählen Sie einen Chat aus" : 
              isInputVeryLong ? "Eingabe zu lang (max 4000 Zeichen)" :
              "Nachricht senden (Enter)"
            }
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Senden...</span>
              </div>
            ) : (
              <>
                <span className="send-icon">📤</span>
                Senden
                <span className="shortcut-hint">Enter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="status-indicators">
        {audioLoading && (
          <span className="status audio-loading">
            <span className="pulse">🎤</span> Verarbeite Audio …
          </span>
        )}
        {uploadLoading && (
          <span className="status upload-loading">
            <span className="pulse">📎</span> Lade Datei hoch …
          </span>
        )}
        {isRecording && (
          <span className="status recording">
            <span className="pulse">●</span> Aufnahme läuft …
          </span>
        )}
        {isInputLong && (
          <span className={`status ${isInputVeryLong ? 'error' : 'warning'}`}>
            {isInputVeryLong ? '❌' : '⚠️'} 
            {isInputVeryLong ? ' Eingabe zu lang' : ' Lange Eingabe'} 
            ({characterCount} Zeichen)
          </span>
        )}
        {conversationContext?.intent && (
          <span className="status context-info">
            🎯 {conversationContext.intent}
            {conversationContext.confidence && ` (${conversationContext.confidence})`}
          </span>
        )}
        {currentModel && (
          <span className="status model-info">
            {getProviderIcon(currentModel.provider)} {currentModel.name}
            {currentModel.active ? ' 🟢' : ' 🔴'}
          </span>
        )}
      </div>

      {/* ✅ KORRIGIERT: Enhanced Model Selector mit sicheren Werten */}
      {currentSession && Array.isArray(models) && models.length > 0 && (
        <div className="model-select-container">
          <div className="model-select-header">
            <label htmlFor="model-select" className="model-label">
              AI-Modell:
            </label>
            <button
              className="model-info-btn"
              onClick={() => setShowModelInfo(!showModelInfo)}
              title="Modellinformationen anzeigen"
            >
              ℹ️
            </button>
          </div>
          
          <select
            id="model-select"
            value={currentSession.model ?? ""}
            onChange={(e) => handleModelChange(e.target.value)}
            className="model-select"
            disabled={loading || disabled}
          >
            {models.map((model) => (
              <option key={model.name} value={model.name}>
                {getProviderIcon(model.provider)} {model.name} 
                {model.provider && ` (${model.provider})`}
                {!model.active && ' [Inaktiv]'}
              </option>
            ))}
          </select>
          
          {showModelInfo && currentModel && (
            <div className="model-info-panel">
              <div className="model-info-content">
                <h5>{currentModel.name}</h5>
                <div className="model-details">
                  <div><strong>Provider:</strong> {getProviderIcon(currentModel.provider)} {currentModel.provider}</div>
                  <div><strong>Status:</strong> 
                    <span className={currentModel.active ? 'status-active' : 'status-inactive'}>
                      {currentModel.active ? '🟢 Aktiv' : '🔴 Inaktiv'}
                    </span>
                  </div>
                  {currentModel.description && (
                    <div><strong>Beschreibung:</strong> {currentModel.description}</div>
                  )}
                  {currentModel.capabilities && Array.isArray(currentModel.capabilities) && currentModel.capabilities.length > 0 && (
                    <div>
                      <strong>Fähigkeiten:</strong>
                      <div className="capabilities-list">
                        {currentModel.capabilities.map(capability => (
                          <span key={capability} className="capability-tag">
                            {renderCapability(capability)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentModel.endpoint && (
                    <div><strong>Endpoint:</strong> {currentModel.endpoint}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Keyboard Shortcuts Help */}
      <div className="keyboard-shortcuts">
        <div className="shortcuts-grid">
          <span className="shortcut-item">
            <kbd>Enter</kbd> Senden
          </span>
          <span className="shortcut-item">
            <kbd>Shift</kbd> + <kbd>Enter</kbd> Neue Zeile
          </span>
          <span className="shortcut-item">
            <kbd>Esc</kbd> Aktionen schließen
          </span>
          <span className="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>K</kbd> Quick Actions
          </span>
          <span className="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>L</kbd> Eingabe löschen
          </span>
        </div>
      </div>
    </div>
  );
};