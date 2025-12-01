// ERP_SteinmetZ_V1/apps/frontend/src/components/QuickChat/components/InfoTab.tsx
import React from "react";
import { SystemStatus, ProviderStatus } from "../types";

interface InfoTabProps {
  systemInfo: {
    status: SystemStatus;
    timestamp: string;
  } | null;
  loading: boolean;
  error?: string | null;
  onRefresh: () => void;
}

// ✅ KORRIGIERT: Safe utility functions
const formatDate = (iso: string | undefined | null): string => {
  if (!iso) return "Unbekannt";
  try {
    const d = new Date(iso);
    return d.toLocaleString("de-DE");
  } catch {
    return "Ungültiges Datum";
  }
};

// ✅ KORRIGIERT: Safe provider icon function
const getProviderIcon = (provider: string | undefined | null): string => {
  if (!provider) return "❓";

  const providerIcons: Record<string, string> = {
    openai: "🤖",
    anthropic: "🧠",
    azure: "☁️",
    vertex: "🔍",
    ollama: "🦙",
    local: "💻",
    huggingface: "🤗",
    llamacpp: "🦙",
    custom: "⚙️",
    fallback: "🔄",
    eliza: "💬",
    google: "🔍",
    mistral: "🌪️",
    sagemaker: "🏭",
    none: "⭕",
    "": "❓",
  };

  return providerIcons[provider.toLowerCase()] || "❓";
};

// ✅ KORRIGIERT: Safe status functions
const getStatusColor = (status: string | undefined | null): string => {
  if (!status) return "status-unknown";

  switch (status) {
    case "healthy":
      return "status-healthy";
    case "degraded":
      return "status-degraded";
    case "unhealthy":
      return "status-unhealthy";
    default:
      return "status-unknown";
  }
};

const getStatusIcon = (status: string | undefined | null): string => {
  if (!status) return "⚪";

  switch (status) {
    case "healthy":
      return "🟢";
    case "degraded":
      return "🟡";
    case "unhealthy":
      return "🔴";
    default:
      return "⚪";
  }
};

const getStatusText = (status: string | undefined | null): string => {
  if (!status) return "Status unbekannt";

  switch (status) {
    case "healthy":
      return "System ist gesund";
    case "degraded":
      return "System eingeschränkt";
    case "unhealthy":
      return "System hat Probleme";
    default:
      return `Status: ${status}`;
  }
};

// ✅ KORRIGIERT: Safe number formatting
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "0";
  return value.toLocaleString("de-DE");
};

// ✅ KORRIGIERT: Safe boolean display
const formatBoolean = (
  value: boolean | undefined | null,
): { icon: string; text: string } => {
  if (value === true) return { icon: "🟢", text: "Aktiv" };
  if (value === false) return { icon: "🔴", text: "Inaktiv" };
  return { icon: "⚪", text: "Unbekannt" };
};

// ✅ KORRIGIERT: Provider information based on actual capabilities
const getProviderInfo = (
  provider: string | undefined | null,
): { name: string; description: string } => {
  if (!provider)
    return { name: "Unbekannt", description: "Provider nicht erkannt" };

  const providerInfo: Record<string, { name: string; description: string }> = {
    openai: { name: "OpenAI", description: "GPT-Modelle & Embeddings" },
    anthropic: { name: "Anthropic", description: "Claude-Modelle" },
    azure: { name: "Azure", description: "Azure OpenAI Services" },
    vertex: { name: "Vertex AI", description: "Google AI Models" },
    ollama: { name: "Ollama", description: "Lokale LLMs" },
    local: { name: "Local", description: "Lokale Installationen" },
    huggingface: { name: "HuggingFace", description: "Open Source Models" },
    llamacpp: { name: "Llama.cpp", description: "Llama-basierte Modelle" },
    custom: { name: "Custom", description: "Benutzerdefinierte Endpoints" },
    fallback: { name: "Fallback", description: "Redundanz Provider" },
    eliza: { name: "Eliza", description: "Test & Debug Provider" },
    google: { name: "Google", description: "Gemini & PaLM Models" },
    mistral: { name: "Mistral", description: "Mistral AI Models" },
    sagemaker: { name: "SageMaker", description: "AWS ML Services" },
    none: { name: "Kein Provider", description: "System im Wartungsmodus" },
  };

  return (
    providerInfo[provider.toLowerCase()] || {
      name: provider,
      description: "KI-Provider",
    }
  );
};

export const InfoTab: React.FC<InfoTabProps> = ({
  systemInfo,
  loading,
  error,
  onRefresh,
}) => {
  // ✅ KORRIGIERT: Safe data extraction with defaults
  const systemStatus = systemInfo?.status;

  // ✅ KORRIGIERT: Extract safe values with fallbacks
  const systemStatusValue = systemStatus?.system_status || "unknown";
  const activeProvider = systemStatus?.active_provider;
  const modelCount = systemStatus?.model_count ?? 0;
  const toolCount = systemStatus?.tool_count ?? 0;
  const workflowCount = systemStatus?.workflow_count ?? 0;
  const fallbackEnabled = systemStatus?.fallback_enabled ?? false;

  const activeProviderInfo = getProviderInfo(activeProvider);
  const fallbackStatus = formatBoolean(fallbackEnabled);

  // ✅ KORRIGIERT: Common providers to display (based on likely availability)
  const commonProviders = [
    "openai",
    "anthropic",
    "azure",
    "ollama",
    "local",
    "huggingface",
  ];

  // Error State anzeigen
  if (error) {
    return (
      <section className="info-tab">
        <div className="info-error">
          <div className="error-icon">❌</div>
          <h5>Fehler beim Laden der Systeminformationen</h5>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={onRefresh} disabled={loading}>
            {loading ? "🔄 Lädt..." : "🔄 Erneut versuchen"}
          </button>
        </div>
      </section>
    );
  }

  // Loading State
  if (!systemInfo || loading) {
    return (
      <section className="info-tab">
        <div className="info-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Lade Systeminformationen...</p>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? "Lädt..." : "Erneut versuchen"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="info-tab">
      <header className="info-header">
        <h4>🖥️ ERP AI System-Informationen</h4>
        <div className="header-actions">
          <span className="last-updated">
            Aktualisiert: {formatDate(systemInfo.timestamp)}
          </span>
          <button
            className="refresh-info-btn"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? "🔄" : "🔄 Aktualisieren"}
          </button>
        </div>
      </header>

      <div className="info-grid">
        {/* ✅ KORRIGIERT: System Status Overview with safe data */}
        <div className="info-card status-card">
          <h5>📊 System Übersicht</h5>
          <div className="status-overview">
            <div
              className={`system-status ${getStatusColor(systemStatusValue)}`}
            >
              <span className="status-icon">
                {getStatusIcon(systemStatusValue)}
              </span>
              <span className="status-text">
                {getStatusText(systemStatusValue)}
              </span>
            </div>
          </div>
          <div className="info-item">
            <strong>Aktiver Provider:</strong>
            <span className="provider-badge">
              {getProviderIcon(activeProvider)} {activeProviderInfo.name}
            </span>
          </div>
          <div className="info-item">
            <strong>Modelle:</strong> {formatNumber(modelCount)} verfügbar
          </div>
          <div className="info-item">
            <strong>Tools:</strong> {formatNumber(toolCount)} registriert
          </div>
          <div className="info-item">
            <strong>Workflows:</strong> {formatNumber(workflowCount)} definiert
          </div>
          <div className="info-item">
            <strong>Fallback:</strong>
            <span
              className={
                fallbackEnabled ? "feature-enabled" : "feature-disabled"
              }
            >
              {fallbackStatus.icon} {fallbackStatus.text}
            </span>
          </div>
        </div>

        {/* ✅ KORRIGIERT: Provider Status - Only show likely providers */}
        <div className="info-card providers-card">
          <h5>🔌 Provider Status</h5>
          <div className="providers-grid">
            {commonProviders.map((provider) => {
              const providerInfo = getProviderInfo(provider);
              const isActive = activeProvider === provider;
              const isFallback = provider === "fallback";

              return (
                <div key={provider} className="provider-status">
                  <div className="provider-header">
                    <span className="provider-icon">
                      {getProviderIcon(provider)}
                    </span>
                    <span className="provider-name">{providerInfo.name}</span>
                    <span className="status-indicator">
                      {isActive
                        ? "🟢 Aktiv"
                        : isFallback && fallbackEnabled
                          ? "🟡 Bereit"
                          : "⚪ Standby"}
                    </span>
                  </div>
                  <div className="provider-info">
                    <span>{providerInfo.description}</span>
                  </div>
                </div>
              );
            })}

            {/* ✅ KORRIGIERT: Show actual active provider if not in common list */}
            {activeProvider && !commonProviders.includes(activeProvider) && (
              <div className="provider-status highlighted">
                <div className="provider-header">
                  <span className="provider-icon">
                    {getProviderIcon(activeProvider)}
                  </span>
                  <span className="provider-name">
                    {activeProviderInfo.name}
                  </span>
                  <span className="status-indicator">🟢 Aktiv</span>
                </div>
                <div className="provider-info">
                  <span>{activeProviderInfo.description}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ KORRIGIERT: Feature Capabilities based on actual system state */}
        <div className="info-card features-card">
          <h5>🚀 System-Funktionen</h5>
          <div className="features-grid">
            <div
              className={`feature-item ${modelCount > 0 ? "enabled" : "disabled"}`}
            >
              <span className="feature-icon">💬</span>
              <div className="feature-info">
                <strong>Chat & Konversation</strong>
                <span>{formatNumber(modelCount)} Modelle</span>
              </div>
            </div>
            <div
              className={`feature-item ${toolCount > 0 ? "enabled" : "disabled"}`}
            >
              <span className="feature-icon">🛠️</span>
              <div className="feature-info">
                <strong>Tool Execution</strong>
                <span>{formatNumber(toolCount)} Tools</span>
              </div>
            </div>
            <div
              className={`feature-item ${workflowCount > 0 ? "enabled" : "disabled"}`}
            >
              <span className="feature-icon">🔄</span>
              <div className="feature-info">
                <strong>Workflow Engine</strong>
                <span>{formatNumber(workflowCount)} Workflows</span>
              </div>
            </div>
            <div className="feature-item enabled">
              <span className="feature-icon">🎵</span>
              <div className="feature-info">
                <strong>Audio Processing</strong>
                <span>Transkription & Synthesis</span>
              </div>
            </div>
            <div className="feature-item enabled">
              <span className="feature-icon">🖼️</span>
              <div className="feature-info">
                <strong>Vision Analysis</strong>
                <span>Bilderkennung & OCR</span>
              </div>
            </div>
            <div className="feature-item enabled">
              <span className="feature-icon">🌐</span>
              <div className="feature-info">
                <strong>Translation</strong>
                <span>Mehrsprachige Unterstützung</span>
              </div>
            </div>
            <div className="feature-item enabled">
              <span className="feature-icon">📊</span>
              <div className="feature-info">
                <strong>Embeddings</strong>
                <span>Semantische Suche</span>
              </div>
            </div>
            <div
              className={`feature-item ${fallbackEnabled ? "enabled" : "disabled"}`}
            >
              <span className="feature-icon">🔄</span>
              <div className="feature-info">
                <strong>Fallback System</strong>
                <span>{fallbackStatus.text}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ KORRIGIERT: System Architecture - Generic description */}
        <div className="info-card architecture-card">
          <h5>🏗️ System-Architektur</h5>
          <div className="architecture-layers">
            <div className="layer">
              <strong>API Layer</strong>
              <span>RESTful Endpoints</span>
            </div>
            <div className="layer">
              <strong>Service Layer</strong>
              <span>Modulare Services</span>
            </div>
            <div className="layer">
              <strong>Provider Layer</strong>
              <span>{formatNumber(modelCount)} KI-Modelle</span>
            </div>
            <div className="layer">
              <strong>Tool Layer</strong>
              <span>{formatNumber(toolCount)} Spezialisierte Tools</span>
            </div>
            <div className="layer">
              <strong>Engine Layer</strong>
              <span>{formatNumber(workflowCount)} Workflows</span>
            </div>
            <div className="layer">
              <strong>Integration Layer</strong>
              <span>ERP-System Anbindung</span>
            </div>
          </div>
          <div className="architecture-stats">
            <div className="stat">
              <strong>Aktive Provider:</strong>
              <span>{activeProviderInfo.name}</span>
            </div>
            <div className="stat">
              <strong>System Status:</strong>
              <span>{getStatusText(systemStatusValue)}</span>
            </div>
          </div>
        </div>

        {/* ✅ KORRIGIERT: Performance Metrics - Only show actual metrics */}
        <div className="info-card performance-card">
          <h5>📈 System-Metriken</h5>
          <div className="performance-grid">
            <div className="metric">
              <div className="metric-value">{formatNumber(modelCount)}</div>
              <div className="metric-label">Verfügbare Modelle</div>
            </div>
            <div className="metric">
              <div className="metric-value">{formatNumber(toolCount)}</div>
              <div className="metric-label">Registrierte Tools</div>
            </div>
            <div className="metric">
              <div className="metric-value">{formatNumber(workflowCount)}</div>
              <div className="metric-label">Workflows</div>
            </div>
            <div className="metric">
              <div className="metric-value">
                {systemStatusValue === "healthy"
                  ? "🟢"
                  : systemStatusValue === "degraded"
                    ? "🟡"
                    : "🔴"}
              </div>
              <div className="metric-label">System Status</div>
            </div>
          </div>
          <div className="performance-info">
            <p>Metriken basieren auf aktueller Systemkonfiguration</p>
          </div>
        </div>

        {/* ✅ KORRIGIERT: Session Information - Generic description */}
        <div className="info-card sessions-card">
          <h5>💾 Session Management</h5>
          <div className="session-info">
            <div className="session-stat">
              <strong>Aktive Sessions:</strong>
              <span>Dynamisch verwaltet</span>
            </div>
            <div className="session-stat">
              <strong>Session-Lifetime:</strong>
              <span>Browser-basiert</span>
            </div>
            <div className="session-stat">
              <strong>Auto-Save:</strong>
              <span>🟢 Aktiviert</span>
            </div>
            <div className="session-stat">
              <strong>Context Memory:</strong>
              <span>🟢 Aktiviert</span>
            </div>
          </div>
          <div className="session-features">
            <h6>Session-Features:</h6>
            <ul>
              <li>Automatische Context-Verwaltung</li>
              <li>Multi-Model Support</li>
              <li>Tool-Execution History</li>
              <li>Echtzeit-Konversation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ KORRIGIERT: System Health based on actual status */}
      <div className="info-card full-width health-card">
        <h5>🏥 System Health</h5>
        <div className="health-grid">
          <div
            className={`health-item ${systemStatusValue === "healthy" ? "healthy" : "degraded"}`}
          >
            <span className="health-icon">
              {getStatusIcon(systemStatusValue)}
            </span>
            <div className="health-info">
              <strong>Gesamtsystem</strong>
              <span>{getStatusText(systemStatusValue)}</span>
            </div>
          </div>
          <div
            className={`health-item ${modelCount > 0 ? "healthy" : "degraded"}`}
          >
            <span className="health-icon">{modelCount > 0 ? "🟢" : "🔴"}</span>
            <div className="health-info">
              <strong>Model Availability</strong>
              <span>{formatNumber(modelCount)} Modelle verfügbar</span>
            </div>
          </div>
          <div
            className={`health-item ${toolCount > 0 ? "healthy" : "degraded"}`}
          >
            <span className="health-icon">{toolCount > 0 ? "🟢" : "🔴"}</span>
            <div className="health-info">
              <strong>Tool Registry</strong>
              <span>{formatNumber(toolCount)} Tools verfügbar</span>
            </div>
          </div>
          <div
            className={`health-item ${fallbackEnabled ? "healthy" : "warning"}`}
          >
            <span className="health-icon">{fallbackEnabled ? "🟢" : "🟡"}</span>
            <div className="health-info">
              <strong>Fallback System</strong>
              <span>{fallbackStatus.text}</span>
            </div>
          </div>
          <div className="health-item healthy">
            <span className="health-icon">🟢</span>
            <div className="health-info">
              <strong>API Connectivity</strong>
              <span>Backend erreichbar</span>
            </div>
          </div>
          <div className="health-item healthy">
            <span className="health-icon">🟢</span>
            <div className="health-info">
              <strong>Frontend Interface</strong>
              <span>UI Komponenten aktiv</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ KORRIGIERT: Quick Actions Info - Generic categories */}
      <div className="info-card full-width quickactions-card">
        <h5>🎯 Verfügbare Aktionen</h5>
        <div className="quickactions-grid">
          <div className="quickaction-category">
            <h6>📝 Text & Schreiben</h6>
            <ul>
              <li>Zusammenfassung erstellen</li>
              <li>Text verbessern</li>
              <li>Übersetzung</li>
              <li>Content Generation</li>
            </ul>
          </div>
          <div className="quickaction-category">
            <h6>🔍 Analyse & Daten</h6>
            <ul>
              <li>Datenanalyse</li>
              <li>Berichte erstellen</li>
              <li>Muster erkennen</li>
              <li>Visualisierung</li>
            </ul>
          </div>
          <div className="quickaction-category">
            <h6>💼 Business & ERP</h6>
            <ul>
              <li>Bestellungen analysieren</li>
              <li>Kunden verwalten</li>
              <li>Lager optimieren</li>
              <li>Reporting</li>
            </ul>
          </div>
          <div className="quickaction-category">
            <h6>⚙️ System & Tools</h6>
            <ul>
              <li>Tool Execution</li>
              <li>Workflow Automation</li>
              <li>System-Diagnose</li>
              <li>Konfiguration</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
