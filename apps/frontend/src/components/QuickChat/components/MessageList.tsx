// ERP_SteinmetZ_V1/apps/frontend/src/components/QuickChat/components/MessageList.tsx
import React, { useEffect, useRef } from 'react';
import { ChatMessage, AIModel, ConversationState, Provider } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  currentModel?: string;
  models: AIModel[];
  currentSession?: any;
  conversationContext?: ConversationState | null;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  currentModel,
  models,
  currentSession,
  conversationContext,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ KORRIGIERT: Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ✅ KORRIGIERT: Safe timestamp formatting
  const formatTime = (timestamp: string | undefined | null) => {
    if (!timestamp) return 'Jetzt';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Jetzt';
      
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
               ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      return 'Jetzt';
    }
  };

  // ✅ KORRIGIERT: Safe model name lookup
  const getModelName = () => {
    if (!currentModel) return 'Kein Modell ausgewählt';
    
    const safeModels = Array.isArray(models) ? models : [];
    const model = safeModels.find(m => m.name === currentModel || m.model === currentModel);
    return model ? `${model.name} (${model.provider})` : currentModel;
  };

  // ✅ KORRIGIERT: Safe model capabilities lookup
  const getModelCapabilities = () => {
    if (!currentModel) return [];
    
    const safeModels = Array.isArray(models) ? models : [];
    const model = safeModels.find(m => m.name === currentModel || m.model === currentModel);
    return Array.isArray(model?.capabilities) ? model.capabilities : [];
  };

  // ✅ KORRIGIERT: Safe model description lookup
  const getModelDescription = () => {
    if (!currentModel) return '';
    
    const safeModels = Array.isArray(models) ? models : [];
    const model = safeModels.find(m => m.name === currentModel || m.model === currentModel);
    return typeof model?.description === 'string' ? model.description : '';
  };

  // ✅ KORRIGIERT: Safe metadata check
  const hasMetadata = (msg: ChatMessage) => {
    return msg.metadata && Object.keys(msg.metadata).length > 0;
  };

  // ✅ KORRIGIERT: Safe provider icon with fallbacks
  const getProviderIcon = (provider?: Provider | string) => {
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
    
    const providerKey = typeof provider === 'string' ? provider.toLowerCase() : provider;
    return providerIcons[providerKey] || '🤖';
  };

  // ✅ KORRIGIERT: Safe metadata rendering
  const renderMetadata = (metadata: ChatMessage['metadata']) => {
    if (!metadata || typeof metadata !== 'object') return null;
    
    const metadataItems = [];
    
    if (typeof metadata.model === 'string') {
      metadataItems.push(
        <span key="model" className="metadata-item">
          <strong>Modell:</strong> {metadata.model}
        </span>
      );
    }
    
    if (metadata.provider) {
      metadataItems.push(
        <span key="provider" className="metadata-item">
          <strong>Provider:</strong> 
          <span className="provider-badge">
            {getProviderIcon(metadata.provider)} {metadata.provider}
          </span>
        </span>
      );
    }
    
    if (typeof metadata.intent === 'string') {
      metadataItems.push(
        <span key="intent" className="metadata-item">
          <strong>Intent:</strong> 
          <span className={`intent-${metadata.intent.toLowerCase()}`}>
            {metadata.intent}
          </span>
        </span>
      );
    }
    
    if (typeof metadata.sentiment === 'string') {
      const sentimentIcons: Record<string, string> = {
        'positive': '😊',
        'negative': '😞', 
        'neutral': '😐',
        'critical': '⚠️',
        'questioning': '❓'
      };
      
      metadataItems.push(
        <span key="sentiment" className="metadata-item sentiment">
          <strong>Stimmung:</strong> 
          <span className={`sentiment-${metadata.sentiment}`}>
            {sentimentIcons[metadata.sentiment] || ''} {metadata.sentiment}
          </span>
        </span>
      );
    }
    
    if (typeof metadata.topic === 'string') {
      metadataItems.push(
        <span key="topic" className="metadata-item">
          <strong>Thema:</strong> 
          <span className="topic-tag">{metadata.topic}</span>
        </span>
      );
    }
    
    if (typeof metadata.tokens_used === 'number') {
      metadataItems.push(
        <span key="tokens" className="metadata-item">
          <strong>Tokens:</strong> {metadata.tokens_used.toLocaleString()}
        </span>
      );
    }
    
    if (typeof metadata.thinking_time === 'number') {
      metadataItems.push(
        <span key="thinking" className="metadata-item">
          <strong>Denkzeit:</strong> {metadata.thinking_time}ms
        </span>
      );
    }
    
    if (Array.isArray(metadata.tool_calls) && metadata.tool_calls.length > 0) {
      metadataItems.push(
        <span key="tools" className="metadata-item">
          <strong>Tools:</strong> {metadata.tool_calls.length} verwendet
        </span>
      );
    }
    
    if (Array.isArray(metadata.context_references) && metadata.context_references.length > 0) {
      metadataItems.push(
        <span key="references" className="metadata-item">
          <strong>Referenzen:</strong> {metadata.context_references.length}
        </span>
      );
    }
    
    if (metadataItems.length === 0) return null;
    
    return <div className="message-metadata">{metadataItems}</div>;
  };

  // ✅ KORRIGIERT: Safe tool calls rendering
  const renderToolCalls = (toolCalls: any[]) => {
    if (!Array.isArray(toolCalls) || toolCalls.length === 0) return null;

    return (
      <div className="tool-calls">
        <div className="tool-calls-header">
          <strong>🔧 Verwendete Tools:</strong>
        </div>
        {toolCalls.map((toolCall, index) => {
          if (!toolCall || typeof toolCall !== 'object') return null;
          
          return (
            <div key={index} className="tool-call">
              {typeof toolCall.name === 'string' && (
                <span className="tool-name">{toolCall.name}</span>
              )}
              
              {toolCall.parameters && typeof toolCall.parameters === 'object' && Object.keys(toolCall.parameters).length > 0 && (
                <div className="tool-parameters">
                  <strong>Parameter:</strong> 
                  <pre>{JSON.stringify(toolCall.parameters, null, 2)}</pre>
                </div>
              )}
              
              {toolCall.result !== undefined && (
                <div className="tool-result">
                  <strong>Ergebnis:</strong>
                  <pre className={toolCall.success === false ? 'tool-error' : ''}>
                    {typeof toolCall.result === 'object' 
                      ? JSON.stringify(toolCall.result, null, 2)
                      : String(toolCall.result)
                    }
                  </pre>
                  {typeof toolCall.error === 'string' && (
                    <div className="tool-error-message">
                      <strong>Fehler:</strong> {toolCall.error}
                    </div>
                  )}
                </div>
              )}
              
              {typeof toolCall.duration === 'number' && (
                <div className="tool-duration">
                  <small>Dauer: {toolCall.duration}ms</small>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ✅ KORRIGIERT: Safe typing indicator
  const renderTypingIndicator = () => {
    const safeModels = Array.isArray(models) ? models : [];
    const model = safeModels.find(m => m.name === currentModel || m.model === currentModel);
    const provider = typeof model?.provider === 'string' ? model.provider : 'openai';
    
    const providerTexts: Record<string, string> = {
      'openai': 'Analysiere und generiere Antwort...',
      'anthropic': 'Denke sorgfältig nach...',
      'vertex': 'Verarbeite Anfrage...',
      'azure': 'Verarbeite in der Cloud...',
      'ollama': 'Lokale Verarbeitung...',
      'local': 'Lokale Berechnung...',
      'huggingface': 'Lade Modell...',
      'llamacpp': 'Llama-Verarbeitung...',
      'custom': 'Benutzerdefinierte Verarbeitung...',
      'fallback': 'Fallback-Verarbeitung...',
      'eliza': 'ELIZA-Analyse...'
    };
    
    const capabilities = Array.isArray(model?.capabilities) ? model.capabilities : [];

    return (
      <div className="message assistant typing">
        <div className="message-avatar">
          {getProviderIcon(provider)}
        </div>
        <div className="message-content">
          <div className="message-header">
            <span className="message-sender">ERP Assistant</span>
            <span className="message-model">
              {typeof model?.name === 'string' ? model.name : 'Unknown Model'} 
              <span className="provider-badge">{provider}</span>
            </span>
          </div>
          <div className="typing-indicator">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
          <div className="typing-text">
            {providerTexts[provider] || 'Verarbeite Anfrage...'}
          </div>
          {capabilities.length > 0 && (
            <div className="typing-capabilities">
              <small>Fähigkeiten: {capabilities.slice(0, 3).join(', ')}</small>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ KORRIGIERT: Safe conversation context rendering
  const renderContextInfo = () => {
    if (!conversationContext || typeof conversationContext !== 'object') return null;

    const contextItems = [];
    
    if (typeof conversationContext.current_topic === 'string') {
      contextItems.push(
        <span key="topic" className="context-item">
          <strong>Thema:</strong> {conversationContext.current_topic}
        </span>
      );
    }
    
    if (typeof conversationContext.intent === 'string') {
      contextItems.push(
        <span key="intent" className="context-item">
          <strong>Intent:</strong> 
          <span className={`intent-${conversationContext.intent.toLowerCase()}`}>
            {conversationContext.intent}
          </span>
        </span>
      );
    }
    
    if (typeof conversationContext.sentiment === 'string') {
      contextItems.push(
        <span key="sentiment" className="context-item">
          <strong>Stimmung:</strong> 
          <span className={`sentiment-${conversationContext.sentiment}`}>
            {conversationContext.sentiment}
          </span>
        </span>
      );
    }
    
    if (typeof conversationContext.confidence === 'string') {
      contextItems.push(
        <span key="confidence" className="context-item">
          <strong>Konfidenz:</strong> 
          <span className={`confidence-${conversationContext.confidence}`}>
            {conversationContext.confidence}
          </span>
        </span>
      );
    }
    
    if (conversationContext.stats && typeof conversationContext.stats === 'object') {
      if (typeof conversationContext.stats.messageCount === 'number') {
        contextItems.push(
          <span key="messages" className="context-item">
            <strong>Nachrichten:</strong> {conversationContext.stats.messageCount}
          </span>
        );
      }
      
      if (typeof conversationContext.stats.tokensUsed === 'number') {
        contextItems.push(
          <span key="tokens" className="context-item">
            <strong>Tokens:</strong> {conversationContext.stats.tokensUsed.toLocaleString()}
          </span>
        );
      }
      
      if (typeof conversationContext.stats.topicSwitches === 'number') {
        contextItems.push(
          <span key="switches" className="context-item">
            <strong>Themenwechsel:</strong> {conversationContext.stats.topicSwitches}
          </span>
        );
      }
    }
    
    if (conversationContext.preferences && typeof conversationContext.preferences === 'object' && Object.keys(conversationContext.preferences).length > 0) {
      contextItems.push(
        <span key="preferences" className="context-item">
          <strong>Präferenzen:</strong> {Object.keys(conversationContext.preferences).length} gesetzt
        </span>
      );
    }
    
    if (contextItems.length === 0) return null;

    return (
      <div className="context-info-banner">
        <div className="context-header">
          <strong>🎯 Konversations-Kontext</strong>
        </div>
        <div className="context-details">
          {contextItems}
        </div>
      </div>
    );
  };

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

  // ✅ KORRIGIERT: Safe welcome message
  const renderWelcomeMessage = () => {
    const safeModels = Array.isArray(models) ? models : [];
    const currentModelData = safeModels.find(m => m.name === currentModel || m.model === currentModel);
    const capabilities = getModelCapabilities();

    return (
      <div className="welcome-message">
        <div className="welcome-header">
          <div className="welcome-icon">
            {getProviderIcon(currentModelData?.provider)}
          </div>
          <h3>Willkommen beim ERP‑Assistant</h3>
        </div>
        
        <p className="welcome-description">
          Ich bin Ihr KI-Assistent und helfe Ihnen bei verschiedenen Aufgaben im ERP-System. 
          Nutzen Sie die erweiterten Funktionen für Textverarbeitung, Datenanalyse, 
          Geschäftsprozesse und Automatisierung.
        </p>
        
        <div className="welcome-info-grid">
          <div className="info-section model-info">
            <h4>🧠 Aktuelles Modell</h4>
            <div className="model-details">
              <strong>{getModelName()}</strong>
              {typeof currentModelData?.description === 'string' && (
                <p className="model-description">{currentModelData.description}</p>
              )}
              {capabilities.length > 0 && (
                <div className="capabilities-list">
                  <strong>Fähigkeiten:</strong>
                  <div className="capability-tags">
                    {capabilities.map(capability => (
                      <span key={capability} className="capability-tag">
                        {renderCapability(capability)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {typeof currentModelData?.endpoint === 'string' && (
                <p className="model-stats">
                  <strong>Endpoint:</strong> {currentModelData.endpoint}
                </p>
              )}
              <p className="model-status">
                <strong>Status:</strong> 
                <span className={currentModelData?.active ? 'status-active' : 'status-inactive'}>
                  {currentModelData?.active ? '🟢 Aktiv' : '🔴 Inaktiv'}
                </span>
              </p>
            </div>
          </div>
          
          <div className="info-section features-info">
            <h4>🚀 Verfügbare Funktionen</h4>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">💬</span>
                <div className="feature-text">
                  <strong>Intelligente Konversationen</strong>
                  <span>Context-aware Dialoge mit Memory</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛠️</span>
                <div className="feature-text">
                  <strong>Tool Execution</strong>
                  <span>ERP-Funktionen ausführen</span>
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
                  <strong>Sprachverarbeitung</strong>
                  <span>Audio Transkription & Synthesis</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🖼️</span>
                <div className="feature-text">
                  <strong>Bildanalyse</strong>
                  <span>Vision & OCR Funktionen</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <div className="feature-text">
                  <strong>Übersetzung</strong>
                  <span>Mehrsprachige Unterstützung</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <div className="feature-text">
                  <strong>Embeddings & Search</strong>
                  <span>Semantische Suche</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🧠</span>
                <div className="feature-text">
                  <strong>Knowledge Base</strong>
                  <span>RAG & Dokumentenanalyse</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="welcome-tips">
          <h4>💡 Tipps für bessere Ergebnisse</h4>
          <div className="tips-grid">
            <div className="tip-item">
              <strong>Seien Sie spezifisch</strong>
              <span>Je detaillierter die Frage, desto bessere Antworten</span>
            </div>
            <div className="tip-item">
              <strong>Nutzen Sie Tools</strong>
              <span>ERP-Funktionen direkt ausführen</span>
            </div>
            <div className="tip-item">
              <strong>Workflows automatisieren</strong>
              <span>Komplexe Prozesse als Workflow speichern</span>
            </div>
            <div className="tip-item">
              <strong>Experimentieren Sie</strong>
              <span>Verschiedene Modelle für verschiedene Aufgaben</span>
            </div>
          </div>
        </div>

        {renderContextInfo()}
      </div>
    );
  };

  // ✅ KRITISCH KORRIGIERT: Safe message rendering with content validation
  const renderMessage = (msg: ChatMessage | undefined | null, idx: number) => {
    // ✅ VALIDATION: Check if message is valid
    if (!msg || typeof msg !== 'object') {
      console.warn('Invalid message detected at index', idx, msg);
      return (
        <div key={`invalid-${idx}`} className="message error-message">
          <div className="message-avatar">⚠️</div>
          <div className="message-content">
            <div className="message-text">
              Ungültige Nachricht empfangen
            </div>
          </div>
        </div>
      );
    }

    // ✅ VALIDATION: Check if content is valid
    const safeContent = typeof msg.content === 'string' ? msg.content : '';
    const safeRole = typeof msg.role === 'string' ? msg.role : 'system';

    return (
      <div
        key={`${idx}-${msg.timestamp || idx}`}
        className={`message ${safeRole} ${hasMetadata(msg) ? 'with-metadata' : ''}`}
      >
        <div className="message-avatar">
          {safeRole === 'user' && '👤'}
          {safeRole === 'assistant' && getProviderIcon(msg.metadata?.provider)}
          {safeRole === 'system' && '⚙️'}
        </div>
        
        <div className="message-content">
          <div className="message-header">
            <span className="message-sender">
              {safeRole === 'user' ? 'Sie' : 
               safeRole === 'assistant' ? 'ERP Assistant' : 'System'}
              {msg.metadata?.provider && safeRole === 'assistant' && (
                <span className="provider-badge">
                  {getProviderIcon(msg.metadata.provider)} {msg.metadata.provider}
                </span>
              )}
            </span>
            {msg.timestamp && (
              <span className="message-time">
                {formatTime(msg.timestamp)}
              </span>
            )}
          </div>
          
          {/* ✅ KRITISCH KORRIGIERT: Safe content splitting */}
          <div className="message-text">
            {safeContent.split('\n').map((line, lineIdx) => (
              <div key={lineIdx} className="message-line">
                {line || <br />}
              </div>
            ))}
          </div>
          
          {Array.isArray(msg.metadata?.tool_calls) && renderToolCalls(msg.metadata.tool_calls)}
          {hasMetadata(msg) && renderMetadata(msg.metadata)}
        </div>
      </div>
    );
  };

  // ✅ KORRIGIERT: Safe messages array handling
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="messages-container" ref={containerRef}>
      {safeMessages.length > 0 ? (
        <div className="messages-list">
          {renderContextInfo()}
          {safeMessages.map(renderMessage)}
        </div>
      ) : (
        renderWelcomeMessage()
      )}
      
      {loading && renderTypingIndicator()}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};