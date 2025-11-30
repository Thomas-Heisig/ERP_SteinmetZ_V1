import React, { useState } from 'react';
import { Settings, AIModel } from '../types';
import { THEMES, SUPPORTED_LANGUAGES } from '../constants';
import { useTheme } from '../../../contexts/ThemeContext';

interface SettingsTabProps {
  settings: Settings;
  models: AIModel[];
  onSettingsChange: (key: keyof Settings, value: any) => void;
  onSettingsSave: () => void;
  onSettingsReset: () => void;
}

// ✅ KORRIGIERT: Default notification structure
const NOTIFICATION_DEFAULT = {
  enabled: false,
  soundEnabled: false,
  desktopEnabled: false,
  emailEnabled: false,
  activityAlertsEnabled: false
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  models,
  onSettingsChange,
  onSettingsSave,
  onSettingsReset,
}) => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ✅ KORRIGIERT: Safe models array
  const safeModels = Array.isArray(models) ? models : [];

  // ✅ KORRIGIERT: Safe input change handler with proper type conversion
  const handleInputChange = (key: keyof Settings) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    let value: any;
    
    if (e.target.type === 'checkbox') {
      value = (e.target as HTMLInputElement).checked;
    } else if (e.target.type === 'number') {
      value = e.target.value === '' ? 0 : Number(e.target.value);
    } else if (e.target.getAttribute('data-numeric') === 'true') {
      // ✅ KORRIGIERT: Handle numeric values from text inputs
      value = e.target.value === '' ? 0 : Number(e.target.value);
    } else {
      value = e.target.value;
    }
    
    onSettingsChange(key, value);
  };

  // ✅ KORRIGIERT: Safe range change handler
  const handleRangeChange = (key: keyof Settings) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      onSettingsChange(key, value);
    }
  };

  const handleResetConfirm = () => {
    onSettingsReset();
    setShowResetConfirm(false);
  };

  // ✅ KORRIGIERT: Safe notification change handler
  const handleNotificationChange = (field: keyof typeof NOTIFICATION_DEFAULT) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onSettingsChange('notifications', {
      ...NOTIFICATION_DEFAULT,
      ...(settings.notifications || {}),
      [field]: e.target.checked
    });
  };

  const sections = [
    { id: 'general', name: 'Allgemein', icon: '⚙️' },
    { id: 'model', name: 'KI-Modelle', icon: '🧠' },
    { id: 'features', name: 'Funktionen', icon: '🚀' },
    { id: 'ui', name: 'Oberfläche', icon: '🎨' },
    { id: 'privacy', name: 'Datenschutz', icon: '🔒' },
    { id: 'advanced', name: 'Erweitert', icon: '🔧' },
  ];

  // ✅ KORRIGIERT: Safe providers with filtering
  const availableProviders = Array.from(
    new Set(safeModels.map(m => m.provider).filter(Boolean))
  );

  // ✅ KORRIGIERT: Safe default model selection
  const providerModels = safeModels.filter(m => m.provider === settings.defaultProvider);
  const safeDefaultModel = providerModels.some(m => m.name === settings.defaultModel)
    ? settings.defaultModel
    : providerModels[0]?.name || '';

  // ✅ KORRIGIERT: Safe language selection
  const safeLanguage = SUPPORTED_LANGUAGES.some(l => l.code === settings.language)
    ? settings.language
    : SUPPORTED_LANGUAGES[0]?.code || 'de';

  // ✅ KORRIGIERT: Safe theme selection
  const safeTheme = THEMES.some(t => t.id === settings.theme)
    ? settings.theme
    : 'auto';

  return (
    <section className="settings-tab" data-theme={theme}>
      {/* Header */}
      <header className="settings-header">
        <div className="settings-title">
          <h4>Einstellungen</h4>
          <div className="settings-status">
            {settings.autoSave && <span className="autosave-badge">💾 Auto-Save</span>}
          </div>
        </div>
        <div className="settings-actions">
          <button 
            className="save-settings-btn primary"
            onClick={onSettingsSave}
            title="Einstellungen speichern"
          >
            💾 Speichern
          </button>
          <button 
            className="reset-settings-btn secondary"
            onClick={() => setShowResetConfirm(true)}
            title="Auf Standard zurücksetzen"
          >
            🔄 Zurücksetzen
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="settings-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-text">{section.name}</span>
          </button>
        ))}
      </nav>

      {/* Settings Content */}
      <div className="settings-content">
        {/* General Settings */}
        {activeSection === 'general' && (
          <div className="settings-section">
            <h5>Allgemeine Einstellungen</h5>
            
            <div className="settings-grid">
              <div className="settings-field">
                <label htmlFor="language">Standard-Sprache:</label>
                <select
                  id="language"
                  value={safeLanguage}
                  onChange={handleInputChange('language')}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="timezone">Zeitzone:</label>
                <select
                  id="timezone"
                  value={settings.timezone || 'Europe/Berlin'}
                  onChange={handleInputChange('timezone')}
                >
                  <option value="Europe/Berlin">Berlin (UTC+1)</option>
                  <option value="Europe/London">London (UTC+0)</option>
                  <option value="America/New_York">New York (UTC-5)</option>
                  <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="dateFormat">Datumsformat:</label>
                <select
                  id="dateFormat"
                  value={settings.dateFormat || 'DD.MM.YYYY'}
                  onChange={handleInputChange('dateFormat')}
                >
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="timeFormat">Zeitformat:</label>
                <select
                  id="timeFormat"
                  value={settings.timeFormat || 'HH:mm'}
                  onChange={handleInputChange('timeFormat')}
                >
                  <option value="HH:mm">24-Stunden</option>
                  <option value="hh:mm A">12-Stunden</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Model Settings */}
        {activeSection === 'model' && (
          <div className="settings-section">
            <h5>KI-Modell Einstellungen</h5>
            
            <div className="settings-grid">
              <div className="settings-field">
                <label htmlFor="defaultProvider">Standard-Provider:</label>
                <select
                  id="defaultProvider"
                  value={settings.defaultProvider || 'openai'}
                  onChange={handleInputChange('defaultProvider')}
                >
                  {availableProviders.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="defaultModel">Standard-Modell:</label>
                <select
                  id="defaultModel"
                  value={safeDefaultModel}
                  onChange={handleInputChange('defaultModel')}
                >
                  {providerModels.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                  {providerModels.length === 0 && (
                    <option value="">Keine Modelle verfügbar</option>
                  )}
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="maxTokens">
                  Maximale Tokens: <span className="value-display">{settings.maxTokens}</span>
                </label>
                <input
                  id="maxTokens"
                  type="range"
                  min={100}
                  max={32000}
                  step={100}
                  value={settings.maxTokens || 2000}
                  onChange={handleRangeChange('maxTokens')}
                />
                <div className="setting-description">
                  Maximale Länge der Antwort ({settings.maxTokens || 2000} Tokens)
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="temperature">
                  Temperatur: <span className="value-display">{settings.temperature}</span>
                </label>
                <input
                  id="temperature"
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={settings.temperature || 0.7}
                  onChange={handleRangeChange('temperature')}
                />
                <div className="setting-description">
                  {settings.temperature < 0.3 && 'Sehr fokussiert und vorhersehbar'}
                  {settings.temperature >= 0.3 && settings.temperature < 0.7 && 'Ausgewogen und kreativ'}
                  {settings.temperature >= 0.7 && 'Sehr kreativ und unvorhersehbar'}
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="topP">
                  Top-P: <span className="value-display">{settings.topP}</span>
                </label>
                <input
                  id="topP"
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={settings.topP || 1}
                  onChange={handleRangeChange('topP')}
                />
                <div className="setting-description">
                  Diversity der Antworten (1 = maximale Vielfalt)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Settings */}
        {activeSection === 'features' && (
          <div className="settings-section">
            <h5>Funktionen & Integrationen</h5>
            
            <div className="settings-grid">
              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.audioEnabled || false}
                    onChange={handleInputChange('audioEnabled')}
                  />
                  <span className="feature-label">
                    <span className="feature-icon">🎙️</span>
                    Audio-Verarbeitung (Spracheingabe)
                  </span>
                </label>
                <div className="setting-description">
                  Spracherkennung und Sprachausgabe aktivieren
                </div>
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.visionEnabled || false}
                    onChange={handleInputChange('visionEnabled')}
                  />
                  <span className="feature-label">
                    <span className="feature-icon">📸</span>
                    Bildanalyse
                  </span>
                </label>
                <div className="setting-description">
                  Bild-Upload und -Analyse aktivieren
                </div>
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.translationEnabled || false}
                    onChange={handleInputChange('translationEnabled')}
                  />
                  <span className="feature-label">
                    <span className="feature-icon">🌍</span>
                    Übersetzungs-Dienst
                  </span>
                </label>
                <div className="setting-description">
                  Automatische Text-Übersetzung aktivieren
                </div>
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.streamingEnabled || false}
                    onChange={handleInputChange('streamingEnabled')}
                  />
                  <span className="feature-label">
                    <span className="feature-icon">⚡</span>
                    Streaming Antworten
                  </span>
                </label>
                <div className="setting-description">
                  Antworten werden in Echtzeit gestreamt
                </div>
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.toolExecutionEnabled || false}
                    onChange={handleInputChange('toolExecutionEnabled')}
                  />
                  <span className="feature-label">
                    <span className="feature-icon">🛠️</span>
                    Tool-Ausführung
                  </span>
                </label>
                <div className="setting-description">
                  KI kann externe Tools und Funktionen ausführen
                </div>
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.workflowExecutionEnabled || false}
                    onChange={handleInputChange('workflowExecutionEnabled')}
                  />
                  <span className="feature-label">
                    <span className="feature-icon">🔀</span>
                    Workflow-Ausführung
                  </span>
                </label>
                <div className="setting-description">
                  Automatisierte Workflows aktivieren
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UI Settings */}
        {activeSection === 'ui' && (
          <div className="settings-section">
            <h5>Oberfläche & Darstellung</h5>
            
            <div className="settings-grid">
              <div className="settings-field">
                <label htmlFor="theme">Farbschema:</label>
                <select
                  id="theme"
                  value={safeTheme}
                  onChange={handleInputChange('theme')}
                >
                  {THEMES.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="fontSize">Schriftgröße:</label>
                <select
                  id="fontSize"
                  value={settings.fontSize || 'medium'}
                  onChange={handleInputChange('fontSize')}
                >
                  <option value="small">Klein</option>
                  <option value="medium">Mittel</option>
                  <option value="large">Groß</option>
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="density">Dichte:</label>
                <select
                  id="density"
                  value={settings.density || 'comfortable'}
                  onChange={handleInputChange('density')}
                >
                  <option value="compact">Kompakt</option>
                  <option value="comfortable">Komfortabel</option>
                  <option value="spacious">Geräumig</option>
                </select>
              </div>

              <div className="settings-field">
                <label htmlFor="sidebarPosition">Sidebar-Position:</label>
                <select
                  id="sidebarPosition"
                  value={settings.sidebarPosition || 'left'}
                  onChange={handleInputChange('sidebarPosition')}
                >
                  <option value="left">Links</option>
                  <option value="right">Rechts</option>
                </select>
              </div>
            </div>

            {/* ✅ KORRIGIERT: Notification Settings with safe structure */}
            <div className="settings-subgroup">
              <h6>Benachrichtigungen</h6>
              <div className="settings-grid">
                <div className="settings-field checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.enabled ?? false}
                      onChange={handleNotificationChange('enabled')}
                    />
                    Benachrichtigungen aktivieren
                  </label>
                </div>

                <div className="settings-field checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.soundEnabled ?? false}
                      onChange={handleNotificationChange('soundEnabled')}
                    />
                    Sound-Benachrichtigungen
                  </label>
                </div>

                <div className="settings-field checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.desktopEnabled ?? false}
                      onChange={handleNotificationChange('desktopEnabled')}
                    />
                    Desktop-Benachrichtigungen
                  </label>
                </div>

                <div className="settings-field checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications?.activityAlertsEnabled ?? false}
                      onChange={handleNotificationChange('activityAlertsEnabled')}
                    />
                    Aktivitäts-Benachrichtigungen
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeSection === 'privacy' && (
          <div className="settings-section">
            <h5>Datenschutz & Sicherheit</h5>
            
            <div className="settings-grid">
              <div className="settings-field">
                <label htmlFor="dataRetentionDays">
                  Datenaufbewahrung (Tage): <span className="value-display">{settings.dataRetentionDays}</span>
                </label>
                <input
                  id="dataRetentionDays"
                  type="range"
                  min={1}
                  max={365}
                  value={settings.dataRetentionDays || 30}
                  onChange={handleRangeChange('dataRetentionDays')}
                />
                <div className="setting-description">
                  Wie lange Konversationen gespeichert werden
                </div>
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoClearHistory || false}
                    onChange={handleInputChange('autoClearHistory')}
                  />
                  Verlauf automatisch löschen
                </label>
                <div className="setting-description">
                  Alte Konversationen automatisch bereinigen
                </div>
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.analyticsEnabled || false}
                    onChange={handleInputChange('analyticsEnabled')}
                  />
                  Analytics aktivieren
                </label>
                <div className="setting-description">
                  Anonymisierte Nutzungsdaten sammeln
                </div>
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.errorReportingEnabled || false}
                    onChange={handleInputChange('errorReportingEnabled')}
                  />
                  Fehlerberichte senden
                </label>
                <div className="setting-description">
                  Automatische Fehlerberichte für Verbesserungen
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {activeSection === 'advanced' && (
          <div className="settings-section">
            <h5>Erweiterte Einstellungen</h5>
            
            <div className="settings-grid">
              <div className="settings-field">
                <label htmlFor="apiTimeout">API-Timeout (ms):</label>
                <input
                  id="apiTimeout"
                  type="number"
                  min={1000}
                  max={120000}
                  step={1000}
                  value={settings.apiTimeout || 30000}
                  onChange={handleInputChange('apiTimeout')}
                  data-numeric="true"
                />
              </div>

              <div className="settings-field">
                <label htmlFor="maxConcurrentRequests">Max. parallele Anfragen:</label>
                <input
                  id="maxConcurrentRequests"
                  type="number"
                  min={1}
                  max={10}
                  value={settings.maxConcurrentRequests || 3}
                  onChange={handleInputChange('maxConcurrentRequests')}
                  data-numeric="true"
                />
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.cacheEnabled || false}
                    onChange={handleInputChange('cacheEnabled')}
                  />
                  Caching aktivieren
                </label>
              </div>

              <div className="settings-field">
                <label htmlFor="cacheTTL">Cache-Gültigkeit (Sekunden):</label>
                <input
                  id="cacheTTL"
                  type="number"
                  min={60}
                  max={86400}
                  value={settings.cacheTTL || 3600}
                  onChange={handleInputChange('cacheTTL')}
                  data-numeric="true"
                />
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.fallbackProviderEnabled || false}
                    onChange={handleInputChange('fallbackProviderEnabled')}
                  />
                  Fallback-Provider aktivieren
                </label>
                <div className="setting-description">
                  Automatisch auf Backup-Provider wechseln bei Fehlern
                </div>
              </div>

              <div className="settings-field checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoSave || false}
                    onChange={handleInputChange('autoSave')}
                  />
                  Automatisches Speichern
                </label>
                <div className="setting-description">
                  Einstellungen automatisch speichern
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="backupInterval">Backup-Intervall (Stunden):</label>
                <input
                  id="backupInterval"
                  type="number"
                  min={1}
                  max={168}
                  value={settings.backupInterval || 24}
                  onChange={handleInputChange('backupInterval')}
                  data-numeric="true"
                />
              </div>

              <div className="settings-field">
                <label htmlFor="exportFormat">Export-Format:</label>
                <select
                  id="exportFormat"
                  value={settings.exportFormat || 'json'}
                  onChange={handleInputChange('exportFormat')}
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ KORRIGIERT: Reset Confirmation Modal with portal consideration */}
      {showResetConfirm && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content">
            <h5>Einstellungen zurücksetzen?</h5>
            <p>Alle Einstellungen werden auf die Standardwerte zurückgesetzt. Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowResetConfirm(false)}
              >
                Abbrechen
              </button>
              <button 
                className="confirm-btn danger"
                onClick={handleResetConfirm}
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};