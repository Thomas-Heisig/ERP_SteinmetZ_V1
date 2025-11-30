// ERP_SteinmetZ_V1/apps/frontend/src/components/QuickChat/components/ChatTab.tsx
import React, { useMemo, useCallback } from 'react';
import { SessionSidebar } from './SessionSidebar';
import { MessageList } from './MessageList';
import { EnhancedInputArea } from './EnhancedInputArea';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  ChatSession,
  QuickAction,
  ConversationState,
  AIModel,
  SessionSettings
} from '../types';
import { QUICK_ACTIONS } from '../constants';

interface ChatTabProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  models: AIModel[];
  input: string;
  loading: boolean;
  isRecording: boolean;
  audioLoading: boolean;
  uploadLoading: boolean;
  showQuickActions: boolean;
  fallbackEnabled: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  conversationContext?: ConversationState | null;
  providerStatus?: Array<{ provider: string; available: boolean }>;
  onSessionSelect: (sessionId: string) => void;
  onSessionCreate: () => void;
  onSessionDelete: (sessionId: string) => void;
  onModelChange: (sessionId: string, modelName: string) => void;
  onSessionSettingsChange?: (sessionId: string, settings: Partial<SessionSettings>) => void;
  onInputChange: (input: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFileUpload: (file: File) => void;
  onQuickActionToggle: (show: boolean) => void;
  onQuickAction: (action: QuickAction) => void;
  onFallbackToggle: (enabled: boolean) => void;
  onTranslate?: () => void;
  onSummarize?: () => void;
  onContextReset?: () => void;
  onSessionPin?: (sessionId: string, pinned: boolean) => void;
  onSessionTag?: (sessionId: string, tags: string[]) => void;
}

// ✅ KORRIGIERT: Helper: model change wrapper mit defensiver Prüfung
const useModelChange = (
  currentSession: ChatSession | null,
  onModelChange: (sessionId: string, modelName: string) => void,
) => {
  return useCallback(
    (modelName: string) => {
      if (currentSession?.id && modelName) {
        onModelChange(currentSession.id, modelName);
      }
    },
    [currentSession, onModelChange],
  );
};

// ✅ KORRIGIERT: Memoised quick-actions mit sicherer Objekterstellung
const useAvailableQuickActions = (
  baseActions: QuickAction[],
  currentSession: ChatSession | null,
  input: string,
  conversationContext?: ConversationState | null,
): QuickAction[] => {
  return useMemo(() => {
    // ✅ SICHER: Basis-Actions als Array sicherstellen
    const safeBaseActions = Array.isArray(baseActions) ? [...baseActions] : [];
    const actions = [...safeBaseActions];

    // ✅ SICHER: Prüfung auf messages Array
    const hasMessages = Array.isArray(currentSession?.messages) && currentSession.messages.length > 0;
    
    // Continue conversation action
    if (hasMessages) {
      actions.push({
        id: 'continue-conversation',
        name: 'Gespräch fortsetzen',
        icon: '➡️',
        prompt: 'Bitte fahre mit unserer vorherigen Unterhaltung fort und baue darauf auf:',
        category: 'conversation',
        description: 'Vorherige Konversation nahtlos fortsetzen',
        tags: ['conversation', 'continuation'],
        usageCount: 0,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      });
    }

    // ✅ SICHER: Input-Länge prüfen
    const safeInput = typeof input === 'string' ? input : '';
    if (safeInput.length > 100) {
      actions.push({
        id: 'summarize-input',
        name: 'Eingabe zusammenfassen',
        icon: '📝',
        prompt: 'Bitte fasse den folgenden Text kurz zusammen:',
        category: 'text',
        description: 'Lange Eingabe kompakt zusammenfassen',
        tags: ['summary', 'compression'],
        usageCount: 0,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      });
    }

    // ✅ SICHER: Business topic actions mit defensiver Prüfung
    const currentTopic = conversationContext?.current_topic;
    if (typeof currentTopic === 'string') {
      const topic = currentTopic.toLowerCase();

      const businessMap: Record<string, QuickAction> = {
        bestellung: {
          id: 'analyze-orders',
          name: 'Bestellungen analysieren',
          icon: '📊',
          prompt: 'Analysiere die Bestelldaten und identifiziere Trends, Muster und Optimierungspotential:',
          category: 'business',
          description: 'ERP-Bestellanalyse',
          tags: ['erp', 'orders', 'analysis'],
          usageCount: 0,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
        lager: {
          id: 'check-inventory',
          name: 'Lagerbestand prüfen',
          icon: '📦',
          prompt: 'Überprüfe den Lagerbestand und schlage Bestellungen vor:',
          category: 'business',
          description: 'Lagerverwaltung und Bestandsprüfung',
          tags: ['erp', 'inventory', 'stock'],
          usageCount: 0,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
        rechnung: {
          id: 'analyze-invoices',
          name: 'Rechnungen analysieren',
          icon: '🧾',
          prompt: 'Analysiere die Rechnungsdaten und identifiziere Auffälligkeiten:',
          category: 'business',
          description: 'ERP-Rechnungsanalyse',
          tags: ['erp', 'invoices', 'finance'],
          usageCount: 0,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
        kunde: {
          id: 'customer-analysis',
          name: 'Kundenanalyse',
          icon: '👥',
          prompt: 'Analysiere die Kundendaten und identifiziere Muster:',
          category: 'business',
          description: 'ERP-Kundenanalyse',
          tags: ['erp', 'customers', 'analysis'],
          usageCount: 0,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
      };

      Object.keys(businessMap).forEach(key => {
        if (topic.includes(key)) {
          actions.push(businessMap[key]);
        }
      });
    }

    return actions;
  }, [baseActions, currentSession, input, conversationContext]);
};

// ✅ KORRIGIERT: Get provider icon mit Fallback
const getProviderIcon = (provider?: string): string => {
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

// ✅ KORRIGIERT: Safe session title generator mit defensiven Prüfungen
const useSessionTitle = (sessions: ChatSession[]) => {
  return useCallback((session: ChatSession) => {
    if (!session) return 'Unbekannte Session';
    
    // ✅ Prüfe meta.title
    if (session.meta?.title && typeof session.meta.title === 'string') {
      return session.meta.title;
    }
    
    // ✅ SICHER: Generate title from first user message mit Array-Prüfung
    const messages = Array.isArray(session.messages) ? session.messages : [];
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    
    if (firstUserMessage?.content && typeof firstUserMessage.content === 'string') {
      const content = firstUserMessage.content;
      return content.length > 30 ? content.substring(0, 30) + '...' : content;
    }
    
    // ✅ SICHER: Fallback to session index mit Array-Prüfung
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const sessionIndex = safeSessions.findIndex(s => s.id === session.id);
    return `Chat ${sessionIndex >= 0 ? sessionIndex + 1 : 'Neu'}`;
  }, [sessions]);
};

export const ChatTab: React.FC<ChatTabProps> = ({
  sessions,
  currentSession,
  models,
  input,
  loading,
  isRecording,
  audioLoading,
  uploadLoading,
  showQuickActions,
  fallbackEnabled,
  fileInputRef,
  conversationContext,
  providerStatus = [],
  onSessionSelect,
  onSessionCreate,
  onSessionDelete,
  onModelChange,
  onSessionSettingsChange,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  onQuickActionToggle,
  onQuickAction,
  onFallbackToggle,
  onTranslate,
  onSummarize,
  onContextReset,
  onSessionPin,
  onSessionTag,
}) => {
  const { theme } = useTheme();
  
  // ✅ KRITISCH KORRIGIERT: sessions als Array sicherstellen
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  
  // ✅ SICHER: currentSession messages als Array sicherstellen
  const safeCurrentSession = currentSession ? {
    ...currentSession,
    messages: Array.isArray(currentSession.messages) ? currentSession.messages : []
  } : null;

  // Wrapped model-change for children components
  const handleModelChange = useModelChange(safeCurrentSession, onModelChange);

  // Quick actions with context awareness
  const quickActions = useAvailableQuickActions(
    QUICK_ACTIONS,
    safeCurrentSession,
    input,
    conversationContext,
  );

  // Safe session title
  const getSessionTitle = useSessionTitle(safeSessions);

  // ✅ KORRIGIERT: Helper functions mit defensiven Prüfungen
  const handleFileUploadWrapper = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const getCurrentModelInfo = useCallback(() => {
    if (!safeCurrentSession?.model) return null;
    
    const safeModels = Array.isArray(models) ? models : [];
    return safeModels.find(model => 
      model.name === safeCurrentSession.model || model.model === safeCurrentSession.model
    ) || null;
  }, [safeCurrentSession, models]);

  const getCurrentProviderStatus = useCallback(() => {
    const modelInfo = getCurrentModelInfo();
    if (!modelInfo?.provider) return null;
    
    const safeProviderStatus = Array.isArray(providerStatus) ? providerStatus : [];
    return safeProviderStatus.find(status => status.provider === modelInfo.provider);
  }, [getCurrentModelInfo, providerStatus]);

  const getSessionStats = useCallback(() => {
    if (!safeCurrentSession) return null;
    
    const messageCount = Array.isArray(safeCurrentSession.messages) ? safeCurrentSession.messages.length : 0;
    const tokensUsed = typeof safeCurrentSession.tokensUsed === 'number' ? safeCurrentSession.tokensUsed : 0;
    
    // ✅ KORRIGIERT: Zeit-Felder mit camelCase
    const createdAt = safeCurrentSession.createdAt;
    const updatedAt = safeCurrentSession.updatedAt;
    const timestamp = updatedAt || createdAt;
    
    const duration = timestamp ? 
      Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / (1000 * 60)) : 0;

    return { messageCount, tokensUsed, duration };
  }, [safeCurrentSession]);

  // ✅ KORRIGIERT: Computed values mit defensiven Prüfungen
  const safeModels = Array.isArray(models) ? models : [];
  const canChangeModel = safeModels.length > 1 && safeCurrentSession !== null;
  const sessionStats = getSessionStats();
  const currentModelInfo = getCurrentModelInfo();
  const providerStatusInfo = getCurrentProviderStatus();

  // ✅ KORRIGIERT: Safe capability rendering
  const renderCapability = useCallback((capability: string) => {
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
  }, []);

  // ✅ KORRIGIERT: Safe tags rendering
  const renderSessionTags = useCallback((tags: any) => {
    if (!Array.isArray(tags)) return null;
    
    return tags.map((tag: any) => {
      if (typeof tag === 'string') {
        return (
          <span key={tag} className="session-tag">
            {tag}
          </span>
        );
      }
      return null;
    }).filter(Boolean);
  }, []);

  return (
    <div className={`chat-tab-container theme-${theme}`}>
      {/* Sidebar */}
      <SessionSidebar
        sessions={safeSessions}
        currentSession={safeCurrentSession}
        models={safeModels}
        fallbackEnabled={fallbackEnabled}
        conversationContext={conversationContext}
        onSessionSelect={onSessionSelect}
        onSessionCreate={onSessionCreate}
        onSessionDelete={onSessionDelete}
        onModelChange={handleModelChange}
        onSessionSettingsChange={onSessionSettingsChange}
        onFallbackToggle={onFallbackToggle}
        onSessionPin={onSessionPin}
        onSessionTag={onSessionTag}
        canChangeModel={canChangeModel}
      />

      {/* Main chat area */}
      <main className="quick-chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="session-info">
            <div className="session-title-row">
              <h3>
                {safeCurrentSession ? (
                  <>
                    {safeCurrentSession.meta?.pinned && '📌 '}
                    {getSessionTitle(safeCurrentSession)}
                  </>
                ) : (
                  'Neuer Chat'
                )}
              </h3>

              {safeCurrentSession?.meta?.tags && (
                <div className="session-tags">
                  {renderSessionTags(safeCurrentSession.meta.tags)}
                </div>
              )}
            </div>

            {safeCurrentSession && (
              <div className="session-details">
                {/* Model & provider info */}
                <div className="model-info">
                  <span className={`model-badge ${currentModelInfo?.provider || 'unknown'}`}>
                    {getProviderIcon(currentModelInfo?.provider)} 
                    {currentModelInfo?.name || safeCurrentSession.model || 'Unbekanntes Modell'}
                    {providerStatusInfo && (
                      <span className={`provider-status ${providerStatusInfo.available ? 'available' : 'unavailable'}`}>
                        {providerStatusInfo.available ? '🟢' : '🔴'}
                      </span>
                    )}
                    {currentModelInfo && !currentModelInfo.active && (
                      <span className="model-status inactive"> [Inaktiv]</span>
                    )}
                  </span>

                  {/* ✅ KORRIGIERT: Model capabilities mit defensivem Zugriff */}
                  {currentModelInfo?.capabilities && Array.isArray(currentModelInfo.capabilities) && currentModelInfo.capabilities.length > 0 && (
                    <div className="model-capabilities">
                      {currentModelInfo.capabilities.slice(0, 3).map(capability => (
                        <span key={capability} className="capability-tag">
                          {renderCapability(capability)}
                        </span>
                      ))}
                      {currentModelInfo.capabilities.length > 3 && (
                        <span className="more-capabilities">
                          +{currentModelInfo.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ✅ KORRIGIERT: Session statistics mit sicheren Werten */}
                <div className="session-stats">
                  <span className="stat-item">💬 {sessionStats?.messageCount || 0}</span>
                  <span className="stat-item">
                    🪙 {(sessionStats?.tokensUsed || 0).toLocaleString()}
                  </span>
                  <span className="stat-item">
                    ⏱️ {sessionStats?.duration || 0}m
                  </span>
                  {safeCurrentSession && (
                    <span className="session-date">
                      {(() => {
                        const timestamp = safeCurrentSession.updatedAt || safeCurrentSession.createdAt;
                        return timestamp ? new Date(timestamp).toLocaleDateString('de-DE') : 'Unbekannt';
                      })()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat actions */}
          <div className="chat-actions">
            {/* Context information */}
            {conversationContext && (
              <div className="context-info">
                {conversationContext.current_topic && (
                  <span className="context-topic">
                    🎯 {conversationContext.current_topic}
                  </span>
                )}
                {conversationContext.sentiment && (
                  <span className={`context-sentiment sentiment-${conversationContext.sentiment}`}>
                    {conversationContext.sentiment === 'positive' && '😊'}
                    {conversationContext.sentiment === 'negative' && '😞'}
                    {conversationContext.sentiment === 'neutral' && '😐'}
                    {conversationContext.sentiment === 'critical' && '⚠️'}
                    {conversationContext.sentiment === 'questioning' && '❓'}
                    {conversationContext.sentiment}
                  </span>
                )}
                {conversationContext.intent && (
                  <span className="context-intent">🎯 {conversationContext.intent}</span>
                )}
                {onContextReset && (
                  <button
                    className="action-btn reset-context-btn"
                    onClick={onContextReset}
                    title="Konversationskontext zurücksetzen"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="action-buttons">
              {onTranslate && typeof input === 'string' && input.trim().length > 0 && (
                <button
                  className="action-btn translate-btn"
                  onClick={onTranslate}
                  title="Text übersetzen"
                  disabled={loading}
                >
                  🌐 Übersetzen
                </button>
              )}
              
              {onSummarize && typeof input === 'string' && input.trim().length > 50 && (
                <button
                  className="action-btn summarize-btn"
                  onClick={onSummarize}
                  title="Text zusammenfassen"
                  disabled={loading}
                >
                  📝 Zusammenfassen
                </button>
              )}
              
              {safeCurrentSession && onSessionPin && (
                <button
                  className={`action-btn pin-btn ${safeCurrentSession.meta?.pinned ? 'pinned' : ''}`}
                  onClick={() => onSessionPin(safeCurrentSession.id, !safeCurrentSession.meta?.pinned)}
                  title={safeCurrentSession.meta?.pinned ? 'Chat von Pinnwand entfernen' : 'Chat an Pinnwand heften'}
                >
                  {safeCurrentSession.meta?.pinned ? '📌' : '📍'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ✅ KORRIGIERT: MessageList mit sicheren messages */}
        <MessageList
          messages={safeCurrentSession?.messages || []}
          loading={loading}
          currentModel={safeCurrentSession?.model}
          models={safeModels}
          currentSession={safeCurrentSession}
          conversationContext={conversationContext}
        />

        {/* No Session Message */}
        {!safeCurrentSession && (
          <div className="no-session-message">
            <div className="welcome-card">
              <h3>👋 Willkommen beim ERP Assistant</h3>
              <p>Wählen Sie einen vorhandenen Chat aus oder erstellen Sie einen neuen, um zu beginnen.</p>
              
              <div className="welcome-features">
                <div className="feature-item">
                  <span className="feature-icon">🤖</span>
                  <div className="feature-text">
                    <strong>Multi-Provider Support</strong>
                    <span>12 KI-Provider mit 50+ Modellen</span>
                  </div>
                </div>
                
                <div className="feature-item">
                  <span className="feature-icon">🛠️</span>
                  <div className="feature-text">
                    <strong>Tool Execution</strong>
                    <span>35+ ERP-Tools direkt ausführen</span>
                  </div>
                </div>
                
                <div className="feature-item">
                  <span className="feature-icon">🔄</span>
                  <div className="feature-text">
                    <strong>Workflow Engine</strong>
                    <span>Komplexe Prozesse automatisieren</span>
                  </div>
                </div>
                
                <div className="feature-item">
                  <span className="feature-icon">🎵</span>
                  <div className="feature-text">
                    <strong>Multi-Modal</strong>
                    <span>Audio, Vision, Text & Embeddings</span>
                  </div>
                </div>
              </div>
              
              <div className="welcome-stats">
                <div className="stat">
                  <strong>{safeModels.length}</strong>
                  <span>Verfügbare Modelle</span>
                </div>
                <div className="stat">
                  <strong>12</strong>
                  <span>KI-Provider</span>
                </div>
                <div className="stat">
                  <strong>35+</strong>
                  <span>ERP-Tools</span>
                </div>
                <div className="stat">
                  <strong>42</strong>
                  <span>Backend-Services</span>
                </div>
              </div>
              
              <button 
                className="create-session-btn primary"
                onClick={onSessionCreate}
              >
                ➕ Neuen Chat starten
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Input Area mit sicherem Toggle */}
<EnhancedInputArea
  input={input}
  setInput={onInputChange}
  loading={loading}
  handleKeyPress={onKeyPress}
  sendMessage={onSendMessage}
  isRecording={isRecording}
  startRecording={onStartRecording}
  stopRecording={onStopRecording}
  audioLoading={audioLoading}
  uploadLoading={uploadLoading}
  fileInputRef={fileInputRef}
  handleFileUpload={(e) => {const file = e.target.files?.[0];if (file) {onFileUpload(file); }}}
  showQuickActions={showQuickActions}
  setShowQuickActions={(value) => {if (typeof value === "function") {onQuickActionToggle(value(showQuickActions));} else {onQuickActionToggle(value);}}}
  quickActions={quickActions}
  currentSession={safeCurrentSession}
  models={safeModels}
  onQuickAction={onQuickAction}
  onTranslate={onTranslate}
  onSummarize={onSummarize}
  disabled={!safeCurrentSession}
  conversationContext={conversationContext}
  onModelChange={handleModelChange}
  onInsertTemplate={(template) => onInputChange(template)}
/>
      </main>
    </div>
  );
};