// ERP_SteinmetZ_V1/apps/frontend/src/components/QuickChat/components/ModelsTab.tsx
import React, { useState } from "react";
import { AIModel, Provider } from "../types";

interface ModelsTabProps {
  models: AIModel[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  onModelsReload: () => void;
  onModelToggle?: (modelId: string, enabled: boolean) => void;
  onModelFavorite?: (modelId: string, favorite: boolean) => void;
}

export const ModelsTab: React.FC<ModelsTabProps> = ({
  models,
  selectedModel,
  onModelSelect,
  onModelsReload,
  onModelToggle,
  onModelFavorite,
}) => {
  const [filterProvider, setFilterProvider] = useState<Provider | "">("");
  const [filterCapability, setFilterCapability] = useState<string>("");
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "provider" | "capabilities">(
    "name",
  );
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // ✅ KORRIGIERT: Safe models array
  const safeModels = Array.isArray(models) ? models : [];

  // ✅ KORRIGIERT: Filter and sort models based on current filters
  const filteredModels = safeModels
    .filter((model) => {
      if (!model || typeof model !== "object") return false;

      const providerMatch = filterProvider
        ? model.provider === filterProvider
        : true;
      const capabilityMatch = filterCapability
        ? Array.isArray(model.capabilities) &&
          model.capabilities.includes(filterCapability)
        : true;
      const activeMatch = showOnlyActive ? model.active !== false : true;

      return providerMatch && capabilityMatch && activeMatch;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;

      switch (sortBy) {
        case "provider":
          return (a.provider || "").localeCompare(b.provider || "");
        case "capabilities": {
          // ✅ KORRIGIERT: Sort by capability count, then by name
          const aCapCount = Array.isArray(a.capabilities)
            ? a.capabilities.length
            : 0;
          const bCapCount = Array.isArray(b.capabilities)
            ? b.capabilities.length
            : 0;
          if (bCapCount !== aCapCount) return bCapCount - aCapCount;
          return (a.name || "").localeCompare(b.name || "");
        }
        case "name":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

  // ✅ KORRIGIERT: Get unique capabilities from all models with safety
  const allCapabilities = Array.from(
    new Set(
      safeModels.flatMap((model) =>
        Array.isArray(model.capabilities) ? model.capabilities : [],
      ),
    ),
  ).sort();

  // ✅ KORRIGIERT: Get unique providers with filtering
  const allProviders = Array.from(
    new Set(
      safeModels
        .map((model) => model.provider)
        .filter((provider) => provider && typeof provider === "string"),
    ),
  ).sort() as Provider[];

  // ✅ KORRIGIERT: Get provider stats
  const providerStats = allProviders.map((provider) => ({
    provider,
    count: safeModels.filter((m) => m.provider === provider).length,
    active: safeModels.filter((m) => m.provider === provider && m.active)
      .length,
  }));

  // ✅ KORRIGIERT: Get capability stats
  const capabilityStats = allCapabilities.map((capability) => ({
    capability,
    count: safeModels.filter(
      (m) =>
        Array.isArray(m.capabilities) && m.capabilities.includes(capability),
    ).length,
  }));

  // ✅ KORRIGIERT: Get provider icon with fallbacks
  const getProviderIcon = (provider: Provider | string) => {
    if (!provider) return "🤖";

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
    };

    return providerIcons[provider.toLowerCase()] || "🤖";
  };

  // ✅ KORRIGIERT: Get model status based on backend data
  const getModelStatus = (model: AIModel) => {
    if (!model.active)
      return { status: "inactive", text: "Inaktiv", icon: "🔴" };

    // ✅ KORRIGIERT: Only mark as misconfigured if endpoint is clearly invalid
    if (model.endpoint && typeof model.endpoint === "string") {
      // Check for obviously invalid endpoints (empty, just spaces, etc.)
      const trimmedEndpoint = model.endpoint.trim();
      if (
        trimmedEndpoint === "" ||
        trimmedEndpoint === "undefined" ||
        trimmedEndpoint === "null"
      ) {
        return {
          status: "misconfigured",
          text: "Fehlkonfiguriert",
          icon: "⚠️",
        };
      }
    }

    return { status: "active", text: "Aktiv", icon: "🟢" };
  };

  // ✅ KORRIGIERT: Format capabilities for display
  const formatCapabilities = (capabilities: string[] = []) => {
    const capabilityIcons: Record<string, string> = {
      chat: "💬",
      vision: "🖼️",
      audio: "🎵",
      embedding: "📊",
      translation: "🌐",
      streaming: "⚡",
      "function-calling": "🛠️",
      reasoning: "🧠",
      multimodal: "🎭",
    };

    return capabilities.map((cap) => ({
      name: cap,
      icon: capabilityIcons[cap] || "🔹",
    }));
  };

  // ✅ KORRIGIERT: Handle favorite toggle
  const handleFavoriteToggle = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (onModelFavorite) {
      const currentlyFavorited = favorites.has(modelId);
      onModelFavorite(modelId, !currentlyFavorited);
    } else {
      // Local fallback if no callback provided
      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(modelId)) {
          newFavorites.delete(modelId);
        } else {
          newFavorites.add(modelId);
        }
        return newFavorites;
      });
    }
  };

  // ✅ KORRIGIERT: Handle model toggle
  const handleModelToggle = (
    modelId: string,
    enabled: boolean,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (onModelToggle) {
      onModelToggle(modelId, enabled);
    }
  };

  // ✅ KORRIGIERT: Check if model is favorited
  const isModelFavorited = (modelId: string) => {
    return favorites.has(modelId);
  };

  // ✅ KORRIGIERT: Count active models
  const activeModelsCount = safeModels.filter((m) => m.active).length;

  return (
    <section className="models-tab">
      <header className="models-header">
        <div className="header-main">
          <h4>🧠 Verfügbare KI-Modelle</h4>
          <div className="header-stats">
            <span className="stat-badge total">{safeModels.length} Gesamt</span>
            <span className="stat-badge active">{activeModelsCount} Aktiv</span>
            <span className="stat-badge providers">
              {allProviders.length} Provider
            </span>
          </div>
        </div>

        <div className="model-actions">
          <button
            className="reload-models-btn"
            onClick={onModelsReload}
            title="Modellliste aktualisieren"
          >
            🔄 Aktualisieren
          </button>
        </div>
      </header>

      {/* Filters and Controls */}
      <div className="models-controls">
        <div className="filters-row">
          <div className="filter-group">
            <label>Provider:</label>
            <select
              className="model-provider-filter"
              value={filterProvider}
              onChange={(e) =>
                setFilterProvider(e.target.value as Provider | "")
              }
            >
              <option value="">Alle Provider</option>
              {providerStats.map(({ provider, count, active }) => (
                <option key={provider} value={provider}>
                  {getProviderIcon(provider)} {provider} ({active}/{count})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Fähigkeit:</label>
            <select
              value={filterCapability}
              onChange={(e) => setFilterCapability(e.target.value)}
            >
              <option value="">Alle Fähigkeiten</option>
              {capabilityStats.map(({ capability, count }) => (
                <option key={capability} value={capability}>
                  {capability} ({count})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sortieren nach:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">Name</option>
              <option value="provider">Provider</option>
              <option value="capabilities">Fähigkeiten</option>
            </select>
          </div>
        </div>

        <div className="filters-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showOnlyActive}
              onChange={(e) => setShowOnlyActive(e.target.checked)}
            />
            Nur aktive Modelle anzeigen
          </label>
        </div>
      </div>

      {/* ✅ KORRIGIERT: Statistics with proper labels */}
      <div className="models-stats">
        <div className="stat-grid">
          <div className="model-stat">
            <span className="stat-label">Gesamt:</span>
            <span className="stat-value">{safeModels.length} Modelle</span>
          </div>
          <div className="model-stat">
            <span className="stat-label">Gefiltert:</span>
            <span className="stat-value">{filteredModels.length} Modelle</span>
          </div>
          <div className="model-stat">
            <span className="stat-label">Aktiv:</span>
            <span className="stat-value">{activeModelsCount} Modelle</span>
          </div>
          <div className="model-stat">
            <span className="stat-label">Ausgewählt:</span>
            <span className="stat-value selected-model">
              {selectedModel || "Keins"}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ KORRIGIERT: Models Grid with safe rendering */}
      <div className="models-list">
        {filteredModels.map((model) => {
          if (!model || typeof model.name !== "string") return null;

          const status = getModelStatus(model);
          const isSelected = selectedModel === model.name;
          const isFavorited = isModelFavorited(model.name);
          const capabilities = formatCapabilities(
            Array.isArray(model.capabilities) ? model.capabilities : [],
          );

          return (
            <div
              key={`${model.provider}-${model.name}`} // ✅ KORRIGIERT: Unique key
              className={`model-card ${model.provider} ${status.status} ${
                isSelected ? "selected" : ""
              }`}
              onClick={() => onModelSelect(model.name)}
            >
              <div className="model-header">
                <div className="model-title">
                  <div className="model-name">{model.name}</div>
                  <div className="model-provider-badge">
                    {getProviderIcon(model.provider)} {model.provider}
                  </div>
                </div>
                <div className="model-actions">
                  {/* ✅ KORRIGIERT: Favorite button now toggles favorites, not active status */}
                  {onModelFavorite && (
                    <button
                      className={`favorite-btn ${isFavorited ? "favorited" : ""}`}
                      onClick={(e) => handleFavoriteToggle(model.name, e)}
                      title={
                        isFavorited
                          ? "Von Favoriten entfernen"
                          : "Zu Favoriten hinzufügen"
                      }
                    >
                      {isFavorited ? "⭐" : "☆"}
                    </button>
                  )}

                  {/* ✅ KORRIGIERT: Toggle button for active status */}
                  {onModelToggle && (
                    <button
                      className={`toggle-btn ${model.active ? "enabled" : "disabled"}`}
                      onClick={(e) =>
                        handleModelToggle(model.name, !model.active, e)
                      }
                      title={
                        model.active
                          ? "Modell deaktivieren"
                          : "Modell aktivieren"
                      }
                    >
                      {model.active ? "🔵" : "⚪"}
                    </button>
                  )}
                </div>
              </div>

              {model.description && (
                <div className="model-description">{model.description}</div>
              )}

              {/* ✅ KORRIGIERT: Capabilities with safe rendering */}
              {capabilities.length > 0 && (
                <div className="model-capabilities">
                  <div className="capabilities-label">Fähigkeiten:</div>
                  <div className="capabilities-list">
                    {capabilities.slice(0, 6).map((cap, index) => (
                      <span
                        key={index}
                        className="capability-tag"
                        title={cap.name}
                      >
                        {cap.icon} {cap.name}
                      </span>
                    ))}
                    {capabilities.length > 6 && (
                      <span className="capability-more">
                        +{capabilities.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="model-meta">
                <div className="meta-row">
                  <span className={`model-status ${status.status}`}>
                    {status.icon} {status.text}
                  </span>

                  {model.endpoint &&
                    typeof model.endpoint === "string" &&
                    model.endpoint.trim() && (
                      <span
                        className="model-endpoint"
                        title={`Endpoint: ${model.endpoint}`}
                      >
                        🌐 Endpoint
                      </span>
                    )}
                </div>

                {/* Provider-specific information */}
                {model.provider === "openai" && (
                  <div className="meta-row">
                    <span className="provider-info">OpenAI GPT-Modell</span>
                  </div>
                )}

                {model.provider === "anthropic" && (
                  <div className="meta-row">
                    <span className="provider-info">
                      Anthropic Claude-Modell
                    </span>
                  </div>
                )}

                {model.provider === "local" && (
                  <div className="meta-row">
                    <span className="provider-info">Lokale Installation</span>
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="model-selected-indicator">
                  ✅ Aktuell ausgewählt
                </div>
              )}

              {isFavorited && (
                <div className="model-favorite-indicator">⭐ Favorit</div>
              )}
            </div>
          );
        })}

        {filteredModels.length === 0 && (
          <div className="empty-models">
            <div className="empty-icon">🔍</div>
            <h4>Keine Modelle gefunden</h4>
            <p>
              {filterProvider || filterCapability
                ? `Keine Modelle entsprechen den aktuellen Filtern.`
                : "Es sind keine Modelle verfügbar oder konfiguriert."}
            </p>
            {(filterProvider || filterCapability) && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setFilterProvider("");
                  setFilterCapability("");
                }}
              >
                Filter zurücksetzen
              </button>
            )}
            {safeModels.length === 0 && (
              <button className="reload-models-btn" onClick={onModelsReload}>
                🔄 Modelle laden
              </button>
            )}
          </div>
        )}
      </div>

      {/* Provider Overview */}
      <div className="providers-overview">
        <h5>📊 Provider Übersicht</h5>
        <div className="providers-grid">
          {providerStats.map(({ provider, count, active }) => (
            <div key={provider} className="provider-overview-card">
              <div className="provider-header">
                <span className="provider-icon">
                  {getProviderIcon(provider)}
                </span>
                <span className="provider-name">{provider}</span>
              </div>
              <div className="provider-stats">
                <span className="model-count">
                  {active}/{count}
                </span>
                <span className="availability">
                  {active === count ? "🟢" : active > 0 ? "🟡" : "🔴"}
                </span>
              </div>
              <div className="provider-description">
                {provider === "openai" && "OpenAI GPT-Modelle"}
                {provider === "anthropic" && "Anthropic Claude-Modelle"}
                {provider === "azure" && "Azure OpenAI Services"}
                {provider === "vertex" && "Google Vertex AI"}
                {provider === "ollama" && "Ollama Lokale Modelle"}
                {provider === "local" && "Lokale KI-Modelle"}
                {provider === "huggingface" && "Hugging Face Models"}
                {provider === "llamacpp" && "Llama.cpp Modelle"}
                {provider === "custom" && "Benutzerdefinierte Modelle"}
                {provider === "fallback" && "Fallback Provider"}
                {provider === "eliza" && "ELIZA Chatbot"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Help */}
      <div className="configuration-help">
        <h5>⚙️ Konfigurationshinweise</h5>
        <div className="help-content">
          <p>
            <strong>Modelle konfigurieren:</strong> Stellen Sie sicher, dass die
            entsprechenden Umgebungsvariablen für jeden Provider gesetzt sind
            (API Keys, Endpoints, etc.).
          </p>
          <div className="help-tips">
            <div className="tip">
              <span className="tip-icon">🔑</span>
              <span>API Keys in .env Datei setzen</span>
            </div>
            <div className="tip">
              <span className="tip-icon">🌐</span>
              <span>Endpoints für lokale Modelle konfigurieren</span>
            </div>
            <div className="tip">
              <span className="tip-icon">🔄</span>
              <span>Fallback-Provider für Redundanz aktivieren</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
