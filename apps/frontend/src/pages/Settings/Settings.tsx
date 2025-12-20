import { useState, useEffect } from "react";
import styles from "./Settings.module.css";

// Types matching backend
interface SettingRecord {
  id: string;
  key: string;
  value: string | number | boolean;
  category: string;
  sensitive: boolean;
  description: string;
  type: string;
  validValues?: string[];
  minValue?: number;
  maxValue?: number;
  defaultValue: string | number | boolean;
  requiresRestart: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

interface SettingsHistory {
  id: string;
  setting_key: string;
  old_value: string | number | boolean | null;
  new_value: string | number | boolean | null;
  changed_by: string;
  changed_at: string;
  reason?: string;
}

type SettingCategory =
  | "system"
  | "ai"
  | "database"
  | "security"
  | "ui"
  | "email"
  | "performance"
  | "integration"
  | "finance"
  | "inventory"
  | "hr"
  | "crm"
  | "reporting"
  | "api"
  | "backup"
  | "notifications";

const CATEGORY_LABELS: Record<SettingCategory, string> = {
  system: "System",
  ai: "KI & Assistenten",
  database: "Datenbank",
  security: "Sicherheit",
  ui: "Benutzeroberfläche",
  email: "E-Mail",
  performance: "Performance",
  integration: "Integrationen",
  finance: "Finanzen",
  inventory: "Lagerverwaltung",
  hr: "Personal",
  crm: "CRM",
  reporting: "Berichte",
  api: "API",
  backup: "Backup",
  notifications: "Benachrichtigungen",
};

const CATEGORY_ICONS: Record<SettingCategory, string> = {
  system: "⚙️",
  ai: "🤖",
  database: "💾",
  security: "🔒",
  ui: "🎨",
  email: "📧",
  performance: "⚡",
  integration: "🔗",
  finance: "💰",
  inventory: "📦",
  hr: "👥",
  crm: "🤝",
  reporting: "📊",
  api: "🔌",
  backup: "💾",
  notifications: "🔔",
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingRecord[]>([]);
  const [filteredSettings, setFilteredSettings] = useState<SettingRecord[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<SettingCategory>("system");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [changes, setChanges] = useState<
    Map<string, string | number | boolean>
  >(new Map());
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SettingsHistory[]>([]);
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(
    new Map(),
  );

  // Load settings
  useEffect(() => {
    loadSettings();
  }, []);

  // Filter settings when category or search changes
  useEffect(() => {
    filterSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchTerm, settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/settings", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      } else {
        throw new Error(data.error || "Fehler beim Laden der Einstellungen");
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const filterSettings = () => {
    let filtered = settings.filter((s) => s.category === activeCategory);

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.key.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term),
      );
    }

    setFilteredSettings(filtered);
  };

  const handleChange = (
    key: string,
    value: string | number | boolean,
    setting: SettingRecord,
  ) => {
    // Validate
    const error = validateSetting(setting, value);
    if (error) {
      const errors = new Map(validationErrors);
      errors.set(key, error);
      setValidationErrors(errors);
      return;
    } else {
      const errors = new Map(validationErrors);
      errors.delete(key);
      setValidationErrors(errors);
    }

    const newChanges = new Map(changes);
    newChanges.set(key, value);
    setChanges(newChanges);
  };

  const validateSetting = (
    setting: SettingRecord,
    value: string | number | boolean,
  ): string | null => {
    // Type validation
    if (setting.type === "number") {
      const num = Number(value);
      if (isNaN(num)) return "Muss eine Zahl sein";
      if (setting.minValue !== undefined && num < setting.minValue) {
        return `Minimum: ${setting.minValue}`;
      }
      if (setting.maxValue !== undefined && num > setting.maxValue) {
        return `Maximum: ${setting.maxValue}`;
      }
    }

    if (setting.type === "boolean" && typeof value !== "boolean") {
      return "Muss true oder false sein";
    }

    if (setting.type === "select" && setting.validValues) {
      if (!setting.validValues.includes(String(value))) {
        return `Ungültiger Wert. Erlaubt: ${setting.validValues.join(", ")}`;
      }
    }

    // Required validation
    if (setting.type === "string" && !value) {
      return "Pflichtfeld";
    }

    return null;
  };

  const handleSave = async () => {
    if (changes.size === 0) return;

    // Check for validation errors
    if (validationErrors.size > 0) {
      setError("Bitte korrigieren Sie die Validierungsfehler");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updates = Array.from(changes.entries()).map(([key, value]) => ({
        key,
        value,
      }));

      const token = localStorage.getItem("token");
      const response = await fetch("/api/settings/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          updates,
          reason: "Manuelle Änderung über Settings UI",
        }),
      });

      if (!response.ok) {
        let errorMessage = "Fehler beim Speichern";
        try {
          const data = await response.json();
          if (response.status === 403) {
            errorMessage = "Keine Berechtigung. Admin-Rechte erforderlich.";
          } else if (data.error) {
            errorMessage =
              typeof data.error === "string"
                ? data.error
                : JSON.stringify(data.error);
          } else if (data.message) {
            errorMessage = data.message;
          }
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setSuccessMessage(
        `${data.results.length} Einstellung(en) erfolgreich gespeichert`,
      );
      setChanges(new Map());

      // Check if restart required
      const requiresRestart = Array.from(changes.keys()).some((key) => {
        const setting = settings.find((s) => s.key === key);
        return setting?.requiresRestart;
      });

      if (requiresRestart) {
        setSuccessMessage(
          (prev) => prev + ". ⚠️ Server-Neustart erforderlich!",
        );
      }

      // Reload settings
      await loadSettings();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);

      // Show user-friendly message based on error type
      if (
        errorMessage.includes("403") ||
        errorMessage.includes("Berechtigung")
      ) {
        setError("❌ Zugriff verweigert. Bitte als Administrator anmelden.");
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        setError("❌ Netzwerkfehler. Bitte Verbindung prüfen.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setChanges(new Map());
    setValidationErrors(new Map());
  };

  const handleResetToDefaults = async () => {
    if (
      !confirm(
        "Möchten Sie wirklich ALLE Einstellungen auf Standardwerte zurücksetzen?",
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/settings/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          reason: "Zurücksetzen auf Standardwerte",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Fehler beim Zurücksetzen");
      }

      setSuccessMessage("Alle Einstellungen wurden zurückgesetzt");
      setChanges(new Map());
      await loadSettings();

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Failed to reset settings:", err);
      setError(err instanceof Error ? err.message : "Fehler beim Zurücksetzen");
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async (settingKey?: string) => {
    try {
      const url = settingKey
        ? `/api/settings/history/${settingKey}`
        : "/api/settings/history";

      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error("Fehler beim Laden der Historie");
      }

      const data = await response.json();
      setHistory(data.history || []);
      setShowHistory(true);
      setSelectedSetting(settingKey || null);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError(
        err instanceof Error ? err.message : "Fehler beim Laden der Historie",
      );
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/settings/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ includeSensitive: false }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `settings-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Einstellungen erfolgreich exportiert");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to export settings:", err);
      setError(err instanceof Error ? err.message : "Fehler beim Export");
    }
  };

  const renderSettingInput = (setting: SettingRecord) => {
    const currentValue = changes.has(setting.key)
      ? changes.get(setting.key)
      : setting.value;

    const hasError = validationErrors.has(setting.key);
    const errorMessage = validationErrors.get(setting.key);

    switch (setting.type) {
      case "boolean":
        return (
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={!!currentValue}
              onChange={(e) =>
                handleChange(setting.key, e.target.checked, setting)
              }
              aria-label={setting.description || setting.key}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        );

      case "number":
        return (
          <div className={styles.inputWrapper}>
            <input
              type="number"
              value={typeof currentValue === "number" ? currentValue : ""}
              min={setting.minValue}
              max={setting.maxValue}
              onChange={(e) =>
                handleChange(setting.key, Number(e.target.value), setting)
              }
              className={`${styles.input} ${hasError ? styles.inputError : ""}`}
              aria-label={setting.description || setting.key}
              title={setting.description || setting.key}
            />
            {hasError && (
              <span className={styles.errorText}>{errorMessage}</span>
            )}
          </div>
        );

      case "select":
        return (
          <select
            value={String(currentValue ?? "")}
            onChange={(e) => handleChange(setting.key, e.target.value, setting)}
            className={styles.select}
            aria-label={setting.description || setting.key}
          >
            <option value="">-- Bitte wählen --</option>
            {setting.validValues && setting.validValues.length > 0 ? (
              setting.validValues.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))
            ) : (
              <option disabled>Keine Optionen verfügbar</option>
            )}
          </select>
        );

      case "string":
      default:
        return (
          <div className={styles.inputWrapper}>
            <input
              type={setting.sensitive ? "password" : "text"}
              value={
                typeof currentValue === "string"
                  ? currentValue
                  : String(currentValue ?? "")
              }
              onChange={(e) =>
                handleChange(setting.key, e.target.value, setting)
              }
              className={`${styles.input} ${hasError ? styles.inputError : ""}`}
              placeholder={String(setting.defaultValue ?? "")}
            />
            {hasError && (
              <span className={styles.errorText}>{errorMessage}</span>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Lade Einstellungen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>⚙️ Systemeinstellungen</h1>
          <p className={styles.subtitle}>
            Konfigurieren Sie das System nach Ihren Anforderungen
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={() => loadHistory()}
            className={styles.btnSecondary}
            title="Änderungshistorie anzeigen"
          >
            📜 Historie
          </button>
          <button
            onClick={handleExport}
            className={styles.btnSecondary}
            title="Einstellungen exportieren"
          >
            📥 Export
          </button>
          <button
            onClick={handleResetToDefaults}
            className={styles.btnDanger}
            disabled={saving}
            title="Alle auf Standardwerte zurücksetzen"
          >
            🔄 Zurücksetzen
          </button>
        </div>
      </header>

      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <strong>❌ Fehler:</strong> {error}
          <button onClick={() => setError(null)} className={styles.alertClose}>
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          <strong>✅ Erfolg:</strong> {successMessage}
          <button
            onClick={() => setSuccessMessage(null)}
            className={styles.alertClose}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="🔍 Einstellungen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            aria-label="Einstellungen durchsuchen"
          />
        </div>

        {changes.size > 0 && (
          <div className={styles.changeIndicator}>
            <span>{changes.size} Änderung(en)</span>
            <button onClick={handleReset} className={styles.btnText}>
              Verwerfen
            </button>
            <button
              onClick={handleSave}
              className={styles.btnPrimary}
              disabled={saving || validationErrors.size > 0}
            >
              {saving ? "Speichere..." : "💾 Speichern"}
            </button>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <nav className={styles.categoryNav}>
            {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
              const category = cat as SettingCategory;
              const count = settings.filter(
                (s) => s.category === category,
              ).length;
              const hasChanges = Array.from(changes.keys()).some(
                (key) =>
                  settings.find((s) => s.key === key)?.category === category,
              );

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`${styles.categoryBtn} ${
                    activeCategory === category ? styles.categoryBtnActive : ""
                  }`}
                >
                  <span className={styles.categoryIcon}>
                    {CATEGORY_ICONS[category]}
                  </span>
                  <span className={styles.categoryLabel}>{label}</span>
                  <span className={styles.categoryCount}>{count}</span>
                  {hasChanges && <span className={styles.changeDot}>●</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className={styles.main}>
          <div className={styles.categoryHeader}>
            <h2>
              {CATEGORY_ICONS[activeCategory]} {CATEGORY_LABELS[activeCategory]}
            </h2>
            <p className={styles.categoryDescription}>
              {filteredSettings.length} Einstellung(en)
              {searchTerm && ` gefunden für "${searchTerm}"`}
            </p>
          </div>

          {filteredSettings.length === 0 ? (
            <div className={styles.empty}>
              <p>Keine Einstellungen in dieser Kategorie gefunden</p>
            </div>
          ) : (
            <div className={styles.settingsList}>
              {filteredSettings.map((setting) => (
                <div key={setting.key} className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingHeader}>
                      <label className={styles.settingLabel}>
                        {setting.key}
                        {setting.sensitive && (
                          <span className={styles.badge} title="Sensible Daten">
                            🔒
                          </span>
                        )}
                        {setting.requiresRestart && (
                          <span
                            className={styles.badge}
                            title="Neustart erforderlich"
                          >
                            ⚠️
                          </span>
                        )}
                      </label>
                      <button
                        onClick={() => loadHistory(setting.key)}
                        className={styles.btnIcon}
                        title="Historie anzeigen"
                      >
                        📜
                      </button>
                    </div>
                    <p className={styles.settingDescription}>
                      {setting.description}
                    </p>
                    {setting.type === "number" &&
                      (setting.minValue || setting.maxValue) && (
                        <p className={styles.settingMeta}>
                          Bereich: {setting.minValue ?? "∞"} –{" "}
                          {setting.maxValue ?? "∞"}
                        </p>
                      )}
                    {changes.has(setting.key) && (
                      <p className={styles.settingChanged}>
                        ✏️ Geändert von:{" "}
                        <code>{JSON.stringify(setting.value)}</code>
                      </p>
                    )}
                  </div>
                  <div className={styles.settingControl}>
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className={styles.modal} onClick={() => setShowHistory(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>
                📜 Änderungshistorie
                {selectedSetting && ` – ${selectedSetting}`}
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className={styles.modalClose}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {history.length === 0 ? (
                <p>Keine Historie vorhanden</p>
              ) : (
                <div className={styles.historyList}>
                  {history.map((entry) => (
                    <div key={entry.id} className={styles.historyItem}>
                      <div className={styles.historyHeader}>
                        <strong>{entry.setting_key}</strong>
                        <span className={styles.historyDate}>
                          {new Date(entry.changed_at).toLocaleString("de-DE")}
                        </span>
                      </div>
                      <div className={styles.historyChange}>
                        <div>
                          <span className={styles.label}>Alt:</span>
                          <code>{JSON.stringify(entry.old_value)}</code>
                        </div>
                        <div>
                          <span className={styles.label}>Neu:</span>
                          <code>{JSON.stringify(entry.new_value)}</code>
                        </div>
                      </div>
                      <div className={styles.historyMeta}>
                        <span>Geändert von: {entry.changed_by}</span>
                        {entry.reason && <span>Grund: {entry.reason}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
