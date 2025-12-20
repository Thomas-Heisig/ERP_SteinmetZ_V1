# Settings Page

Die **Settings**-Seite ist die zentrale Konfigurationsschnittstelle des ERP SteinmetZ Systems. Sie ermöglicht die Verwaltung aller Systemeinstellungen über eine übersichtliche, kategorisierte Oberfläche.

## 🎯 Features

- ✅ **Kategorisierte Einstellungen** nach Geschäftsbereichen
- ✅ **Vollständig typsicher** mit TypeScript
- ✅ **Echtzeit-Validierung** von Eingaben
- ✅ **Änderungsverfolgung** mit Historie
- ✅ **Benutzerfreundlich** mit Suchfunktion
- ✅ **Backend-Integration** über REST API
- ✅ **Responsive Design** für alle Geräte
- ✅ **Fehlerbehandlung** mit benutzerfreundlichen Meldungen

## 📋 Einstellungskategorien

### System

- System-Version
- Log-Level
- Max parallele Anfragen
- Cache-Aktivierung
- Autosave-Intervall
- Diagnostics

### KI & Assistenten

- **Default Provider** - Ollama (lokal, empfohlen)
- **Default Model** - qwen2.5:3b
- **Fallback Provider** - Eliza (regelbasiert)
- KI-Timeout
- Max Tokens
- Temperatur
- Tool-Aktivierung

### Datenbank

- Datenbank-Treiber
- Connection Pool
- Query-Timeout
- Backup-Intervall

### Sicherheit

- Session-Timeout
- Max Login-Versuche
- Password-Policy
- 2FA-Aktivierung

### Benutzeroberfläche

- Theme (Light/Dark/LCARS)
- Sprache
- Datumsformat
- Währung
- Timezone

### E-Mail

- SMTP-Server
- SMTP-Port
- Absender-Adresse
- TLS/SSL-Aktivierung

### Performance

- Cache-Strategie
- Compression
- CDN-Aktivierung
- Lazy Loading

### Integration

- API-Konfiguration
- Webhook-URLs
- OAuth-Credentials
- Externe Services

## 🚀 Usage

### Accessing Settings

```tsx
import { Settings } from "@/pages/Settings";

function App() {
  return (
    <Routes>
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
```

### Programmatic Access

```tsx
import { useSettings } from "@/hooks/useSettings";

function MyComponent() {
  const { settings, updateSetting } = useSettings();

  const changeProvider = async () => {
    await updateSetting("default_provider", "ollama");
  };

  return (
    <div>
      <p>Current Provider: {settings.default_provider}</p>
      <button onClick={changeProvider}>Switch to Ollama</button>
    </div>
  );
}
```

## 📖 API Integration

### Endpoints

```typescript
// Get all settings
GET /api/settings

// Get single setting
GET /api/settings/:key

// Update setting
PUT /api/settings/:key
{
  "value": "new-value"
}

// Get settings history
GET /api/settings/:key/history
```

### Response Format

```json
{
  "id": "uuid",
  "key": "default_provider",
  "value": "ollama",
  "category": "ai",
  "sensitive": false,
  "description": "Standard KI-Provider",
  "type": "select",
  "validValues": ["ollama", "eliza", "openai", "anthropic"],
  "defaultValue": "ollama",
  "requiresRestart": false,
  "updatedAt": "2025-12-19T09:36:00.000Z",
  "updatedBy": "admin"
}
```

## 🎨 Setting Types

### Text Input

```typescript
{
  type: "text",
  minLength?: number,
  maxLength?: number,
  pattern?: string
}
```

### Number Input

```typescript
{
  type: "number",
  minValue?: number,
  maxValue?: number,
  step?: number
}
```

### Select Dropdown

```typescript
{
  type: "select",
  validValues: string[]
}
```

### Boolean Toggle

```typescript
{
  type: "boolean";
}
```

### Password

```typescript
{
  type: "password",
  sensitive: true
}
```

## 🔐 Provider Configuration

### Ollama (Empfohlen)

**Standard-Einstellungen für lokale KI-Modelle!**

```json
{
  "default_provider": "ollama",
  "default_model": "qwen2.5:3b",
  "ollama_base_url": "http://localhost:11434",
  "ollama_timeout": 60000
}
```

**Vorteile:**

- ✅ Läuft vollständig lokal
- ✅ Keine API-Kosten
- ✅ Datenschutz
- ✅ Schnelle Antwortzeiten

### Eliza (Fallback)

**Regelbasierter Fallback bei Provider-Fehlern!**

```json
{
  "fallback_provider": "eliza",
  "fallback_enabled": true
}
```

**Vorteile:**

- ✅ Immer verfügbar
- ✅ Keine externen Abhängigkeiten
- ✅ Kontextbasierte Antworten
- ✅ Tool-Integration

### OpenAI

**Cloud-basierte KI mit GPT-Modellen!**

```json
{
  "default_provider": "openai",
  "openai_api_key": "sk-...",
  "openai_model": "gpt-4o-mini"
}
```

**Vorteile:**

- ✅ Höchste Qualität
- ✅ Große Modellauswahl
- ⚠️ API-Kosten erforderlich

## 🌍 Internationalisierung

Die Settings-Seite unterstützt mehrere Sprachen:

```typescript
// Kategorie-Labels
const CATEGORY_LABELS: Record<SettingCategory, string> = {
  system: "System",
  ai: "KI & Assistenten",
  database: "Datenbank",
  security: "Sicherheit",
  ui: "Benutzeroberfläche",
  // ...
};
```

## ♿ Accessibility

- ✅ ARIA-Labels für alle Eingabefelder
- ✅ Keyboard-Navigation
- ✅ Focus-Indikatoren
- ✅ Error-Messages mit `role="alert"`
- ✅ Screen-Reader-freundlich

## 🐛 Troubleshooting

### Einstellungen werden nicht gespeichert

**Mögliche Ursachen:**

1. Backend nicht erreichbar
2. Validierung fehlgeschlagen
3. Keine Berechtigung

**Lösung:**

```typescript
// Check browser console for errors
console.log("Save failed:", error);

// Verify backend connection
fetch("/api/settings").then((r) => console.log(r.status));
```

### Provider wechselt nicht

**Mögliche Ursachen:**

1. Provider nicht verfügbar
2. Konfiguration fehlt
3. Backend-Neustart erforderlich

**Lösung:**

```typescript
// Check if setting requires restart
if (setting.requiresRestart) {
  // Show restart notification
  alert("Bitte starten Sie das System neu.");
}
```

### Übersetzungen fehlen

**Lösung:**

```typescript
// Add missing translations in i18n files
// apps/frontend/src/components/i18n/de.ts
{
  settings: {
    categories: {
      ai: "KI & Assistenten";
    }
  }
}
```

## 📝 Best Practices

### 1. Provider-Auswahl

```typescript
// ✅ Empfohlen: Ollama als Standard
default_provider: "ollama";
fallback_provider: "eliza";

// ⚠️ Vermeiden: Cloud-Provider ohne Fallback
default_provider: "openai";
fallback_provider: null;
```

### 2. Sensible Daten

```typescript
// ✅ Passwörter als sensitive markieren
{
  key: "openai_api_key",
  sensitive: true,  // Wird maskiert angezeigt
  type: "password"
}
```

### 3. Validierung

```typescript
// ✅ Validierung auf Client und Server
{
  type: "number",
  minValue: 1,
  maxValue: 100,
  // Backend validiert zusätzlich
}
```

### 4. Änderungsverfolgung

```typescript
// ✅ Immer Änderungsgrund angeben
updateSetting(key, value, {
  reason: "Provider auf Ollama umgestellt",
});
```

## 🔄 Migration

### Von OpenAI zu Ollama

1. Ollama installieren und starten
2. In Settings navigieren
3. Provider auf "Ollama" ändern
4. Model auf "qwen2.5:3b" setzen
5. Änderungen speichern
6. QuickChat testen

### Von Cloud zu Lokal

```typescript
// Vorher (Cloud)
{
  default_provider: "openai",
  openai_api_key: "sk-...",
  openai_model: "gpt-4"
}

// Nachher (Lokal)
{
  default_provider: "ollama",
  ollama_base_url: "http://localhost:11434",
  ollama_model: "qwen2.5:3b",
  fallback_provider: "eliza"
}
```

## 🚧 Roadmap

- [ ] Import/Export von Einstellungen
- [ ] Rollen-basierte Einstellungs-Berechtigung
- [ ] Einstellungs-Validierungs-Preview
- [ ] Bulk-Update von Einstellungen
- [ ] Einstellungs-Templates
- [ ] A/B-Testing für Einstellungen

## 📄 License

SPDX-License-Identifier: MIT

## 🤝 Contributing

Siehe [CONTRIBUTING.md](../../../../CONTRIBUTING.md) für Details.

---

**Hinweis**: Diese Komponente ist Teil des ERP SteinmetZ V1 Systems und folgt den Architektur-Richtlinien des Projekts.
