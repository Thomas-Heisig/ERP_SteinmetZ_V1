import React, { useState } from 'react';
import { 
  ChatSession, 
  AIModel, 
  ConversationState, 
  SessionSettings 
} from "../types";

interface SessionSidebarProps {
  /** Alle gespeicherten Chat-Sitzungen */
  sessions: ChatSession[];

  /** Aktuell aktive Sitzung */
  currentSession: ChatSession | null;

  /** Verfügbare Modelle */
  models: AIModel[];

  /** Fallback-System aktiviert */
  fallbackEnabled: boolean;

  /** Optionaler Gesprächskontext (z. B. Thema, Stimmung etc.) */
  conversationContext?: ConversationState | null;

  /** Erlaubt, das Modell im Sidebar zu wechseln */
  canChangeModel?: boolean;

  /** Wird aufgerufen, wenn eine Sitzung ausgewählt wird */
  onSessionSelect: (sessionId: string) => void;

  /** Wird aufgerufen, um eine neue Sitzung anzulegen */
  onSessionCreate: () => void;

  /** Wird aufgerufen, um eine Sitzung zu löschen */
  onSessionDelete: (sessionId: string) => void;

  /** Wird aufgerufen, wenn der Benutzer das AI-Modell einer Sitzung ändert */
  onModelChange: (sessionId: string, modelId: string) => void;

  /** Optional: Sitzungseinstellungen werden geändert */
  onSessionSettingsChange?: (sessionId: string, settings: Partial<SessionSettings>) => void;

  /** Aktiviert oder deaktiviert Fallback-Modus */
  onFallbackToggle: (enabled: boolean) => void;

  /** Optional: Sitzung anheften oder lösen */
  onSessionPin?: (sessionId: string, pinned: boolean) => void;

  /** Optional: Sitzung mit Tags versehen */
  onSessionTag?: (sessionId: string, tags: string[]) => void;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  currentSession,
  models,
  fallbackEnabled,
  conversationContext,
  canChangeModel = true,
  onSessionSelect,
  onSessionCreate,
  onSessionDelete,
  onModelChange,
  onSessionSettingsChange,
  onFallbackToggle,
  onSessionPin,
  onSessionTag,
}) => {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ KORRIGIERT: Safe sessions array
  const safeSessions = Array.isArray(sessions) ? sessions : [];

  // ✅ KORRIGIERT: Safe date formatting with error handling
  const formatDate = (iso: string | undefined | null) => {
    if (!iso) return 'Unbekannt';
    
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return 'Ungültiges Datum';
      
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Gerade eben';
      if (diffMins < 60) return `Vor ${diffMins} Min`;
      if (diffHours < 24) return `Vor ${diffHours} Std`;
      if (diffDays === 1) return 'Gestern';
      if (diffDays < 7) return `Vor ${diffDays} Tagen`;
      
      return d.toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Ungültiges Datum';
    }
  };

  // ✅ KORRIGIERT: Safe session title generation
  const getSessionTitle = (session: ChatSession) => {
    if (!session) return "Neue Unterhaltung";
    
    // Use custom title if available
    if ((session as any).title && typeof (session as any).title === 'string') {
      return (session as any).title;
    }
    
    // ✅ KORRIGIERT: Safe messages access
    const safeMessages = Array.isArray(session.messages) ? session.messages : [];
    const firstUserMessage = safeMessages.find(m => m && m.role === 'user');
    const firstContent = firstUserMessage?.content || safeMessages[0]?.content || "";
    
    if (!firstContent) return "Neue Unterhaltung";
    
    // Clean and truncate
    const cleanContent = firstContent
      .replace(/[#*`]/g, '')
      .replace(/\n/g, ' ')
      .trim();
    
    return cleanContent.length > 30 
      ? `${cleanContent.slice(0, 30)}…` 
      : cleanContent || "Neue Unterhaltung";
  };

  // ✅ KORRIGIERT: Safe session icon selection
  const getSessionIcon = (session: ChatSession) => {
    if (!session) return '💬';
    
    if ((session as any).isPinned) return '📌';
    
    const safeMessages = Array.isArray(session.messages) ? session.messages : [];
    const firstMessage = safeMessages[0]?.content?.toLowerCase() || '';
    
    if (firstMessage.includes('frage') || firstMessage.includes('?')) return '❓';
    if (firstMessage.includes('hilfe') || firstMessage.includes('support')) return '🆘';
    if (firstMessage.includes('analyse') || firstMessage.includes('daten')) return '📊';
    if (firstMessage.includes('code') || firstMessage.includes('programm')) return '💻';
    
    return '💬';
  };

  // ✅ KORRIGIERT: Safe model display name
  const getModelDisplayName = (modelId: string) => {
    if (!modelId) return 'Unbekannt';
    
    const safeModels = Array.isArray(models) ? models : [];
    const model = safeModels.find(m => m.name === modelId);
    return model?.name || modelId;
  };

  // ✅ KORRIGIERT: Safe provider icon
  const getProviderIcon = (provider?: string) => {
    if (!provider) return '❓';
    
    const icons: Record<string, string> = {
      openai: '⚡',
      anthropic: '🔷', 
      azure: '🔵',
      vertex: '🔴',
      ollama: '🐋',
      local: '💻',
      huggingface: '🤗',
      fallback: '🔄',
      eliza: '🧠'
    };
    return icons[provider] || '❓';
  };

  // ✅ KORRIGIERT: Safe session filtering
  const filteredSessions = safeSessions.filter(session => {
    if (!session || typeof session !== 'object') return false;
    
    const title = getSessionTitle(session).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const titleMatch = title.includes(searchLower);
    const tagsMatch = Array.isArray((session as any).tags) && 
      (session as any).tags.some((tag: string) => 
        typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
      );
    
    return titleMatch || tagsMatch;
  });

  // ✅ KORRIGIERT: Safe pinned/unpinned filtering
  const pinnedSessions = filteredSessions.filter(s => 
    s && (s as any).isPinned === true
  );
  const unpinnedSessions = filteredSessions.filter(s => 
    s && (s as any).isPinned !== true
  );

  // ✅ KORRIGIERT: Safe session deletion
  const handleSessionDelete = (sessionId: string) => {
    onSessionDelete(sessionId);
    setShowDeleteConfirm(null);
    if (currentSession?.id === sessionId) {
      // Select another session if available
      const otherSession = safeSessions.find(s => s.id !== sessionId);
      if (otherSession) {
        onSessionSelect(otherSession.id);
      }
    }
  };

  // ✅ KORRIGIERT: Safe model change
  const handleModelChange = (sessionId: string, modelId: string) => {
    if (sessionId && modelId) {
      onModelChange(sessionId, modelId);
    }
    setExpandedSession(null);
  };

  const toggleSessionExpansion = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  return (
    <aside className="quick-chat-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="header-title">
          <h4>📁 Unterhaltungen</h4>
          <span className="session-count">{safeSessions.length}</span>
        </div>
        <button
          className="new-session-btn primary"
          onClick={onSessionCreate}
          title="Neue Unterhaltung starten"
        >
          + Neu
        </button>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => setSearchTerm('')}
            title="Suche zurücksetzen"
          >
            ×
          </button>
        )}
      </div>

      {/* Sessions List */}
      <div className="sessions-list">
        {/* Pinned Sessions */}
        {pinnedSessions.length > 0 && (
          <div className="sessions-group">
            <div className="group-label">Angeheftet</div>
            {pinnedSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                currentSession={currentSession}
                models={models}
                canChangeModel={canChangeModel}
                expanded={expandedSession === session.id}
                showDeleteConfirm={showDeleteConfirm === session.id}
                onSelect={onSessionSelect}
                onDelete={handleSessionDelete}
                onDeleteConfirm={setShowDeleteConfirm}
                onModelChange={handleModelChange}
                onPin={onSessionPin}
                onExpand={toggleSessionExpansion}
                getSessionTitle={getSessionTitle}
                getSessionIcon={getSessionIcon}
                getModelDisplayName={getModelDisplayName}
                getProviderIcon={getProviderIcon}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {/* Unpinned Sessions */}
        {unpinnedSessions.length > 0 && (
          <div className="sessions-group">
            <div className="group-label">Letzte Unterhaltungen</div>
            {unpinnedSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                currentSession={currentSession}
                models={models}
                canChangeModel={canChangeModel}
                expanded={expandedSession === session.id}
                showDeleteConfirm={showDeleteConfirm === session.id}
                onSelect={onSessionSelect}
                onDelete={handleSessionDelete}
                onDeleteConfirm={setShowDeleteConfirm}
                onModelChange={handleModelChange}
                onPin={onSessionPin}
                onExpand={toggleSessionExpansion}
                getSessionTitle={getSessionTitle}
                getSessionIcon={getSessionIcon}
                getModelDisplayName={getModelDisplayName}
                getProviderIcon={getProviderIcon}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredSessions.length === 0 && (
          <div className="empty-sessions">
            {searchTerm ? (
              <>
                <div className="empty-icon">🔍</div>
                <div className="empty-title">Keine Ergebnisse</div>
                <div className="empty-description">
                  Keine Unterhaltungen gefunden für "{searchTerm}"
                </div>
              </>
            ) : (
              <>
                <div className="empty-icon">💬</div>
                <div className="empty-title">Noch keine Unterhaltungen</div>
                <div className="empty-description">
                  Starte deine erste Unterhaltung mit dem KI-Assistenten
                </div>
                <button
                  className="empty-action-btn"
                  onClick={onSessionCreate}
                >
                  Erste Unterhaltung starten
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Fallback Settings */}
      <div className="sidebar-footer">
        <div className="fallback-settings">
          <div className="fallback-header">
            <span className="fallback-label">Fallback-System</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={fallbackEnabled}
                onChange={(e) => onFallbackToggle(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
          <div className="fallback-info">
            {fallbackEnabled 
              ? "Fallback aktiv - bei Fehlern wird auf Backup-KI gewechselt"
              : "Fallback deaktiviert - nur primäre KI wird verwendet"
            }
          </div>
        </div>

        {/* ✅ KORRIGIERT: Safe context info */}
        {conversationContext && typeof conversationContext === 'object' && (
          <div className="context-info">
            <div className="context-label">Aktueller Kontext</div>
            {typeof conversationContext.current_topic === 'string' && (
              <div className="context-topic">
                Thema: {conversationContext.current_topic}
              </div>
            )}
            {typeof conversationContext.sentiment === 'string' && (
              <div className="context-sentiment">
                Stimmung: {conversationContext.sentiment}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

// ✅ KORRIGIERT: Separate Session Item Component with safe rendering
interface SessionItemProps {
  session: ChatSession;
  currentSession: ChatSession | null;
  models: AIModel[];
  canChangeModel: boolean;
  expanded: boolean;
  showDeleteConfirm: boolean;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onDeleteConfirm: (sessionId: string | null) => void;
  onModelChange: (sessionId: string, modelId: string) => void;
  onPin?: (sessionId: string, pinned: boolean) => void;
  onExpand: (sessionId: string) => void;
  getSessionTitle: (session: ChatSession) => string;
  getSessionIcon: (session: ChatSession) => string;
  getModelDisplayName: (modelId: string) => string;
  getProviderIcon: (provider?: string) => string;
  formatDate: (iso: string) => string;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  currentSession,
  models,
  canChangeModel,
  expanded,
  showDeleteConfirm,
  onSelect,
  onDelete,
  onDeleteConfirm,
  onModelChange,
  onPin,
  onExpand,
  getSessionTitle,
  getSessionIcon,
  getModelDisplayName,
  getProviderIcon,
  formatDate,
}) => {
  // ✅ KORRIGIERT: Safe model filtering - find models that match the session's model name
  const safeModels = Array.isArray(models) ? models : [];
  const availableModels = safeModels.filter(m => 
    m && typeof m.name === 'string' && m.name === session.model
  );

  // ✅ KORRIGIERT: Safe session data extraction
  const sessionTitle = getSessionTitle(session);
  const sessionIcon = getSessionIcon(session);
  const isPinned = Boolean((session as any).isPinned);
  const tags = Array.isArray((session as any).tags) ? (session as any).tags : [];
  const safeMessages = Array.isArray(session.messages) ? session.messages : [];
  const messageCount = safeMessages.length;

  return (
    <div
      className={`session-item ${currentSession?.id === session.id ? "active" : ""} ${
        isPinned ? "pinned" : ""
      }`}
    >
      <div 
        className="session-main"
        onClick={() => onSelect(session.id)}
      >
        <div className="session-icon">{sessionIcon}</div>
        
        <div className="session-info">
          <div className="session-header">
            <div className="session-title truncate">
              {sessionTitle}
            </div>
            <div className="session-provider">
              {getProviderIcon(session.provider)}
            </div>
          </div>
          
          <div className="session-meta">
            <span className="session-date">
              {formatDate(session.updatedAt)}
            </span>
            <span className="session-stats">
              {messageCount} Nachrichten
              {typeof session.tokensUsed === 'number' && ` • ${session.tokensUsed} Tokens`}
            </span>
          </div>

          {tags.length > 0 && (
            <div className="session-tags">
              {tags.slice(0, 2).map((tag: string) => (
                <span key={tag} className="session-tag">#{tag}</span>
              ))}
              {tags.length > 2 && (
                <span className="session-tag-more">+{tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session Actions */}
      <div className="session-actions">
        {onPin && (
          <button
            className={`pin-btn ${isPinned ? 'pinned' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onPin(session.id, !isPinned);
            }}
            title={isPinned ? "Lösen" : "Anheften"}
          >
            {isPinned ? '📌' : '📍'}
          </button>
        )}

        {canChangeModel && (
          <button
            className="expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              onExpand(session.id);
            }}
            title="Einstellungen anzeigen"
          >
            ⚙️
          </button>
        )}

        <button
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteConfirm(session.id);
          }}
          title="Unterhaltung löschen"
        >
          🗑️
        </button>
      </div>

      {/* ✅ KORRIGIERT: Expanded Settings with safe model selection */}
      {expanded && (
        <div className="session-settings">
          <div className="settings-section">
            <label>Modell wechseln:</label>
            <select
              value={session.model || ''}
              onChange={(e) => onModelChange(session.id, e.target.value)}
              className="model-select"
            >
              {safeModels.map((model) => (
                model && typeof model.name === 'string' && (
                  <option key={model.name} value={model.name}>
                    {getModelDisplayName(model.name)}
                  </option>
                )
              ))}
            </select>
          </div>
          
          <div className="settings-actions">
            <button
              className="close-settings-btn"
              onClick={(e) => {
                e.stopPropagation();
                onExpand(session.id);
              }}
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <div className="confirmation-text">
            Unterhaltung löschen?
          </div>
          <div className="confirmation-actions">
            <button
              className="confirm-btn danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
            >
              Löschen
            </button>
            <button
              className="cancel-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConfirm(null);
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};