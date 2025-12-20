#

## 🧠 **ConversationContext Klasse - Hauptfunktionen**

### **Kontextverwaltung**

- `set(key, value)` - Setzt Kontextwerte
- `get(key)` - Holt Kontextwerte
- `has(key)` - Prüft Kontextexistenz
- `delete(key)` - Löscht Kontext
- `clear()` - Setzt gesamten Kontext zurück
- `resetContext(keepHistory)` - Reset mit History-Option

### **Analyse-Funktionen**

- `update(messages, responseTime)` - Aktualisiert Kontext basierend auf Nachrichten
- `matchRules(input)` - Regelbasiertes Matching für Eingaben
- `executeAction(action, params)` - Führt Aktionen/Tools/Workflows aus

### **Datenabfrage**

- `getContext()` - Gibt gesamten Kontextzustand zurück
- `getPreferences()` - Gibt Benutzerpräferenzen zurück
- `getDiagnostics()` - Systemdiagnose-Informationen
- `mergeInto(target)` - Merged Kontext in Zielobjekt

## 🔍 **Analysierte Themenkategorien**

Die KI erkennt folgende Themenbereiche:

**ERP-Bereiche:**

- `orders` (Bestellungen/Aufträge)
- `inventory` (Lager/Bestand)
- `customers` (Kunden)
- `invoices` (Rechnungen/Zahlungen)
- `finance` (Finanzen/Umsatz)

**Technische Bereiche:**

- `database` (Datenbank/SQL)
- `file_operations` (Dateioperationen)
- `ai` (KI/Modelle/Workflows)
- `system_monitoring` (Systemüberwachung)
- `code` (Programmierung)

**Kommunikation:**

- `greetings` (Begrüßungen)
- `thanks` (Dank)
- `goodbye` (Verabschiedungen)
- `communication` (Chat/Kommunikation)

## ⚙️ **Integrierte Aktionen**

### **Tool-Integration**

- Zugriff auf `toolRegistry` für Tool-Execution
- Automatisches Tracking von Tool-Nutzung

### **Workflow-Integration**

- Integration mit `workflowEngine`
- Workflow-Execution und Monitoring

## 📊 **Statistik-Tracking**

- Nachrichtenanzahl und Response-Zeiten
- Themenwechsel
- Ausgelöste Regeln
- Genutzte Tools/Workflows
- Konfidenz-Bewertung

## 🎯 **Intent-Erkennung**

- `query` (Abfragen/Anzeigen)
- `create` (Erstellen/Hinzufügen)
- `update` (Aktualisieren/Ändern)
- `delete` (Löschen/Entfernen)
- `calculate` (Berechnen/Simulieren)
- `diagnose` (Testen/Diagnostizieren)
- `explain` (Erklären/Beschreiben)

Die Komponente dient als intelligente Kontextverwaltung für ERP-Dialoge mit erweiterter Themenanalyse, Regelverarbeitung und Tool-Integration.

Basierend auf der analysierten `anthropicProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Anthropic Provider - Hauptfunktionen**

### **Kernfunktionen**

- `callAnthropic(model, messages, options, context)` - Hauptfunktion für KI-Aufrufe
- `initializeAnthropicClient()` - Client-Initialisierung
- `getAnthropicClient()` - Client-Abruf

### **Message Processing**

- `mapMessages(messages)` - Mappt Chat-Nachrichten für Anthropic API
- `prepareToolsForAnthropic()` - Bereitet Tools für API-Aufruf vor

### **Tool Execution System**

- `detectAndRunTools(output, config)` - Erkennt und führt Tools aus
- `parseToolParams(paramString, pattern)` - Parameter-Parsing
- `executeToolCall(toolName, params)` - Führt Tool-Aufrufe aus
- `validateToolParameters(tool, params)` - Parameter-Validierung

### **Utility Functions**

- `isAnthropicModel(modelId)` - Prüft auf Anthropic-Modelle
- `getSupportedAnthropicModels()` - Liste unterstützter Modelle
- `validateAnthropicConfig()` - Konfigurationsvalidierung
- `createFallbackResponse()` - Fallback bei Fehlern
- `formatToolResults(results)` - Formatierung von Tool-Ergebnissen

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export const anthropicProvider = {
  name: 'anthropic',
  call: callAnthropic,                    // Hauptaufruffunktion
  isSupportedModel: isAnthropicModel,     // Modellprüfung
  getSupportedModels: getSupportedAnthropicModels, // Modellliste
  validateConfig: validateAnthropicConfig, // Konfigurationscheck
  healthCheck(): Promise<{healthy, details}> // Gesundheitsprüfung
}
```

## 🛠️ **Tool Call Patterns**

Der Provider erkennt mehrere Tool-Aufruf-Formate:

### **Erkannte Syntaxformen**

1. **Direct Tool Call**: `#TOOL: tool_name(params)`
2. **Code Block Format**: `tool tool_name params`
3. **JSON Format**: `{"tool": "tool_name", "params": {...}}`

### **Parameter-Parsing**

- JSON-Parsing für komplexe Parameter
- Key=Value Parsing für einfache Syntax
- Automatische Typkonvertierung (Boolean, Number, String)

## 📊 **Response-Verarbeitung**

### **Response-Struktur**

```typescript
ModelResponse {
  model: string,
  provider: 'anthropic',
  text: string,
  tokens_in: number,
  tokens_out: number,
  duration_ms: number,
  tool_calls: Array,
  success: boolean,
  meta: {
    stop_reason: string,
    tool_results: ToolResult[],
    response_time: number
  }
}
```

### **Tool Results Integration**

- Automatisches Anhängen von Tool-Ergebnissen an Antwort
- Erfolgs-/Fehler-Zusammenfassung
- Laufzeit-Metriken

## 🔐 **Konfiguration & Validierung**

### **Umgebungsvariablen**

- `ANTHROPIC_API_KEY` - Erforderlicher API-Schlüssel

### **Provider-Konfiguration**

```typescript
AnthropicProviderConfig {
  maxTokens?: number,           // Maximale Tokens
  temperature?: number,         // Kreativität
  timeoutMs?: number,           // Timeout in ms
  enableToolCalls?: boolean,    // Tool-Unterstützung
  enableWorkflows?: boolean,    // Workflow-Unterstützung
  toolCallPatterns?: RegExp[],  // Custom Tool-Patterns
  fallbackOnError?: boolean,    // Fallback bei Fehlern
  debugMode?: boolean          // Debug-Informationen
}
```

## 📋 **Unterstützte Modelle**

### **Claude 3.5 Serie**

- `claude-3-5-sonnet-20241022`

### **Claude 3 Serie**

- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`

### **Claude 2 Serie**

- `claude-2.1`
- `claude-2.0`
- `claude-instant-1.2`

## 🚨 **Fehlerbehandlung**

### **Fallback-System**

- Automatische Fallback-Antworten bei API-Fehlern
- Detaillierte Fehlerprotokollierung
- Timeout-Management (30s Standard)

### **Health Check**

- Konfigurationsvalidierung
- Test-API-Aufruf
- Detaillierte Statusinformationen

## 🔄 **Integrationen**

### **Tool Registry**

- Integration mit `toolRegistry.getToolDefinitions()`
- Automatische Tool-Validierung
- Parameter-Schema-Überprüfung

### **Conversation Context**

- Kontextaktualisierung nach Antworten
- Response-Time Tracking
- Themenanalyse-Integration

Der Provider dient als vollständige Integration der Anthropic Claude API mit erweiterter Tool-Unterstützung, Fehlerbehandlung und Kontextintegration für das ERP-System.

Basierend auf der analysierten `azureOpenAIProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Azure OpenAI Provider - Hauptfunktionen**

### **Kernfunktionen**

- `callAzureOpenAI(model, messages, options, context)` - Hauptfunktion für Azure OpenAI Aufrufe
- `initializeAzureClient()` - Client-Initialisierung
- `getAzureClient()` - Client-Abruf
- `getAzureClientConfig()` - Konfigurationsabruf

### **Message Processing**

- `prepareOpenAIMessages(messages, config)` - Bereitet Nachrichten für API vor
- `prepareToolsForOpenAI()` - Bereitet Tools für OpenAI Format vor

### **Tool Execution System**

- `executeToolCalls(toolCalls)` - Führt Tool-Aufrufe aus (OpenAI Format)
- `formatToolResults(results)` - Formatierung von Tool-Ergebnissen

### **Utility Functions**

- `isAzureOpenAIModel(modelId)` - Prüft auf Azure OpenAI-Modelle
- `getSupportedAzureModels()` - Liste unterstützter Modelle
- `validateAzureConfig()` - Konfigurationsvalidierung
- `createFallbackResponse()` - Fallback bei Fehlern

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export const azureOpenAIProvider = {
  name: 'azure',
  call: callAzureOpenAI,                    // Hauptaufruffunktion
  isSupportedModel: isAzureOpenAIModel,     // Modellprüfung
  getSupportedModels: getSupportedAzureModels, // Modellliste
  validateConfig: validateAzureConfig,      // Konfigurationscheck
  config: azureConfig,                      // Provider-Konfiguration
  healthCheck(): Promise<{healthy, details}>, // Gesundheitsprüfung
  resetClient(): void                       // Client-Reset
}
```

## ⚙️ **Konfigurationssystem**

### **Umgebungsvariablen**

- `AZURE_OPENAI_API_KEY` - API-Schlüssel (erforderlich)
- `AZURE_OPENAI_ENDPOINT` - Endpoint URL (erforderlich)
- `AZURE_OPENAI_DEPLOYMENT` - Deployment-Name (erforderlich)
- `AZURE_OPENAI_API_VERSION` - API Version (optional)
- `AZURE_OPENAI_TEMPERATURE` - Temperatureinstellung
- `AZURE_OPENAI_MAX_TOKENS` - Maximale Tokens

### **Provider-Konfiguration**

```typescript
AzureOpenAIProviderConfig {
  maxTokens?: number,           // Maximale Tokens (Standard: 1500)
  temperature?: number,         // Kreativität (Standard: 0.4)
  timeoutMs?: number,           // Timeout in ms (Standard: 30000)
  enableToolCalls?: boolean,    // Tool-Unterstützung (Standard: true)
  enableStreaming?: boolean,    // Streaming (Standard: false)
  fallbackOnError?: boolean,    // Fallback bei Fehlern (Standard: true)
  apiVersion?: string,          // API Version
  deploymentName?: string       // Deployment Name
}
```

## 🛠️ **Tool Integration**

### **OpenAI Tool Calling Format**

- Native Integration mit OpenAI Function Calling
- Automatische Tool-Definition aus Registry
- Parameter-Schema-Validierung

### **Tool Execution Flow**

1. API erkennt Tool-Aufrufe in Response
2. `executeToolCalls()` verarbeitet Tool-Calls
3. Parameter werden als JSON geparst
4. Tools werden über Registry ausgeführt
5. Ergebnisse werden formatiert und angehängt

## 📊 **Response-Verarbeitung**

### **Response-Struktur**

```typescript
ModelResponse {
  model: string,
  provider: 'azure',
  text: string,
  tokens_in: number,
  tokens_out: number,
  duration_ms: number,
  tool_calls: any[],
  success: boolean,
  meta: {
    finish_reason: string,
    tool_results: ToolResult[],
    deployment: string,
    api_version: string
  }
}
```

## 📋 **Unterstützte Modelle**

### **GPT-4 Serie**

- `gpt-4`
- `gpt-4-32k`
- `gpt-4-turbo`
- `gpt-4o`

### **GPT-3.5 Serie**

- `gpt-35-turbo`
- `gpt-35-turbo-16k`
- `gpt-35-turbo-instruct`

### **Azure Deployment-Namen**

- Unterstützung für benutzerdefinierte Deployment-Namen
- Automatische Erkennung von Azure-Modellen

## 🔐 **Sicherheit & Validierung**

### **Konfigurationsvalidierung**

- API-Key Validierung
- Endpoint-URL Validierung
- Deployment-Name Prüfung
- URL-Format Validierung

### **Health Check System**

- Konfigurationsprüfung
- Test-API-Aufruf
- Detaillierte Fehlerberichte

## 🚨 **Fehlerbehandlung**

### **Fallback-System**

- Automatische Fallback-Antworten bei API-Fehlern
- Timeout-Management (30s Standard)
- Detaillierte Fehlerprotokollierung

### **Client Management**

- Client-Caching für Performance
- Reset-Funktion für Re-Initialisierung
- Parallele Initialisierungsverhinderung

## 🔄 **Integrationen**

### **Tool Registry**

- Integration mit `toolRegistry.getToolDefinitions()`
- Automatische Tool-Validierung
- Parameter-Schema-Überprüfung

### **Conversation Context**

- Kontextaktualisierung nach Antworten
- Response-Time Tracking
- Themenanalyse-Integration

## 🌐 **API-Kompatibilität**

### **Azure OpenAI Service**

- Kompatibel mit Azure OpenAI Deployment
- Unterstützt verschiedene API-Versionen
- Deployment-basierte Authentifizierung

### **OpenAI SDK**

- Verwendet offizielle OpenAI SDK
- Unterstützt Function Calling
- Kompatibel mit Chat-Completions API

Der Provider bietet eine vollständige Integration des Azure OpenAI Services mit erweiterter Tool-Unterstützung, robustem Fehlerhandling und Enterprise-fähiger Konfiguration für das ERP-System.

Basierend auf der analysierten `customProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Custom Provider - Hauptfunktionen**

### **Kernfunktionen**

- `callCustomAPI(model, messages, options, context)` - Hauptfunktion für Custom API Aufrufe
- `buildHeaders()` - Erstellt Request-Header
- `buildRequestPayload()` - Baut Request-Payload auf

### **Message Processing**

- `prepareMessages(messages, format)` - Bereitet Nachrichten für API vor
- `prepareToolsForCustomAPI()` - Bereitet Tools für Custom API vor

### **Response Processing**

- `processCustomResponse(data, model, duration, config)` - Verarbeitet API-Response
- `extractField(data, paths)` - Extrahiert Felder aus Response
- `extractToolCalls(data)` - Erkennt Tool-Aufrufe in Response

### **Tool Execution**

- `executeToolCalls(toolCalls)` - Führt Tool-Aufrufe aus
- `formatToolResults(results)` - Formatierung von Tool-Ergebnissen

### **Utility Functions**

- `isCustomModel(modelId)` - Prüft auf Custom-Modelle
- `testCustomAPI()` - Testet API-Verbindung
- `validateCustomConfig()` - Konfigurationsvalidierung
- `createFallbackResponse()` - Fallback bei Fehlern

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export const customProvider = {
  name: 'custom',
  call: callCustomAPI,              // Hauptaufruffunktion
  isSupportedModel: isCustomModel,   // Modellprüfung
  testConnection: testCustomAPI,     // Verbindungstest
  validateConfig: validateCustomConfig, // Konfigurationscheck
  config: customConfig,              // Provider-Konfiguration
  healthCheck(): Promise<{healthy, details}>, // Gesundheitsprüfung
  updateConfig(newConfig): void     // Dynamische Konfiguration
}
```

## ⚙️ **Flexibles Konfigurationssystem**

### **Umgebungsvariablen**

- `CUSTOM_AI_URL` - API Endpoint URL (erforderlich)
- `CUSTOM_AI_KEY` - API-Schlüssel (optional)
- `CUSTOM_AI_MODEL` - Modellname (Standard: "generic")
- `CUSTOM_AI_TEMPERATURE` - Temperatureinstellung
- `CUSTOM_AI_MAX_TOKENS` - Maximale Tokens
- `CUSTOM_AI_FORMAT` - Request-Format
- `CUSTOM_AI_AUTH_TYPE` - Authentifizierungstyp
- `CUSTOM_AI_HEADERS` - Benutzerdefinierte Header (JSON)
- `CUSTOM_AI_PARAMS` - Benutzerdefinierte Parameter (JSON)

### **Provider-Konfiguration**

```typescript
CustomProviderConfig {
  timeoutMs?: number,           // Timeout in ms (Standard: 60000)
  retryAttempts?: number,       // Retry-Versuche (Standard: 2)
  enableToolCalls?: boolean,    // Tool-Unterstützung (Standard: true)
  fallbackOnError?: boolean,    // Fallback bei Fehlern (Standard: true)
  requestFormat?: string,       // 'openai' | 'anthropic' | 'generic' | 'custom'
  responseMapping?: {           // Response-Feld-Mapping
    text?: string[],           // Mögliche Text-Felder
    error?: string[],          // Mögliche Error-Felder
    tokens?: string[]          // Mögliche Token-Felder
  }
}
```

## 🌐 **Unterstützte API-Formate**

### **Request-Formate**

1. **OpenAI Format** - Kompatibel mit OpenAI API
2. **Anthropic Format** - Kompatibel mit Claude API
3. **Generic Format** - Einfaches Chat-Format
4. **Custom Format** - Vollständig anpassbar

### **Authentifizierungstypen**

- `bearer` - Bearer Token Authentication
- `api_key` - API Key Header
- `token` - Custom Token Header
- Custom - Vollständig anpassbar

## 🛠️ **Tool Integration**

### **Flexible Tool-Call Erkennung**

- Unterstützt verschiedene Tool-Call Formate:
  - `tool_calls` Array
  - `tools` Array
  - `function_calls` Array
- Automatische Parameter-Extraktion

### **Tool Execution**

- Integration mit `toolRegistry`
- Parameter-Validierung
- Fehlerbehandlung

## 📊 **Response-Verarbeitung**

### **Intelligentes Field-Mapping**

```typescript
responseMapping: {
  text: ['text', 'response', 'message', 'content', 'answer'],
  error: ['error', 'error_message', 'err'],
  tokens: ['tokens', 'usage.total_tokens', 'usage.tokens']
}
```

### **Response-Struktur**

```typescript
ModelResponse {
  model: string,
  provider: 'custom',
  text: string,
  tokens_in: number,
  tokens_out: number,
  duration_ms: number,
  tool_calls: any[],
  success: boolean,
  meta: {
    source: 'custom_api',
    response_data: any,
    tool_calls_detected: boolean
  }
}
```

## 🔄 **Retry & Error Handling**

### **Robustes Retry-System**

- Exponential Backoff (2^attempt \* 1000ms)
- Konfigurierbare Retry-Versuche
- Detaillierte Fehlerprotokollierung

### **Fallback-System**

- Automatische Fallback-Antworten bei Fehlern
- Timeout-Management (60s Standard)
- Connection Testing

## 🔍 **Health Check & Monitoring**

### **Verbindungstest**

- Endpoint-Erreichbarkeit
- HTTP Status Code Prüfung
- Detaillierte Diagnose-Informationen

### **Konfigurationsvalidierung**

- URL-Format Validierung
- API-Key Prüfung
- Required Field Validation

## 🎯 **Modell-Erkennung**

### **Erkannte Custom-Modelle**

- `custom*` - Alle Custom-Modelle
- `generic*` - Generic APIs
- `external*` - Externe Dienste
- `api*` - API-basierte Dienste
- `rest*` - REST APIs

## 🔧 **Dynamische Konfiguration**

### **Runtime Updates**

- `updateConfig()` - Aktualisiert Konfiguration zur Laufzeit
- Flexible Header-Konfiguration
- Anpassbare Request-Parameter

### **Benutzerdefinierte Erweiterungen**

- JSON-basierte Header-Konfiguration
- Custom Parameter Injection
- Flexible Response-Mapping

Der Custom Provider dient als universelle Schnittstelle für beliebige REST-basierte KI-APIs und Backend-Dienste mit maximaler Flexibilität und robustem Fehlerhandling für Enterprise-Integrationen.

Basierend auf der analysierten `elizaProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Eliza Provider - Hauptfunktionen**

### **Kernfunktionen**

- `ElizaProvider.respond(messages)` - Hauptfunktion für regelbasierte Antworten
- `ElizaEngine.apply(message, context)` - Regelbasierte Nachrichtenverarbeitung

### **Konfigurationsmanagement**

- `loadElizaConfig()` - Lädt und validiert Eliza-Konfiguration
- `validateConfigPart()` - Validierung von Konfigurationsdateien

### **Session Management**

- `resetSession()` - Setzt Session zurück
- `getSessionInfo()` - Gibt Session-Informationen zurück
- `updateConfig()` - Aktualisiert Konfiguration zur Laufzeit

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export const elizaProvider = new ElizaProvider();
```

### **ElizaProvider Methoden**

- `respond(messages)` - Hauptantwort-Generator
- `getSessionInfo()` - Session-Informationen
- `getConfig()` - Aktuelle Konfiguration
- `updateConfig()` - Konfiguration aktualisieren
- `resetSession()` - Session zurücksetzen
- `addCustomRule()` - Benutzerdefinierte Regel hinzufügen

## 🛠️ **ElizaEngine - Regelverarbeitung**

### **Kernmethoden**

- `apply(message, context)` - Wendet Regeln auf Nachricht an
- `reflect(input)` - Wendet Reflexionsregeln an
- `checkRuleContext()` - Prüft Kontextanforderungen
- `generateResponse()` - Generiert Antwort basierend auf Regel
- `extractToolParameters()` - Extrahiert Tool-Parameter
- `handleWikipediaSearch()` - Spezialbehandlung für Wikipedia

### **Statistik-Methoden**

- `getStats()` - Regel- und Match-Statistiken
- `addRule()` - Fügt Regel zur Laufzeit hinzu

## 📋 **Befehls-System (Command Handler)**

### **Verfügbare Systembefehle**

- `?help` / `/help` / `hilfe` - Zeigt Hilfe an
- `?tools` - Zeigt verfügbare Tools
- `?workflows` - Zeigt aktive Workflows
- `?config` - Zeigt Konfiguration & Regeln
- `?session` - Zeigt aktuelle Sitzung
- `?stats` - Zeigt Systemstatistiken
- `?rules` - Zeigt Regel-Statistiken
- `?status` - Zeigt Systemstatus

### **Befehls-Handler Methoden**

- `showHelp()` - Hilfe-Informationen
- `showTools()` - Tool-Übersicht
- `showWorkflows()` - Workflow-Liste
- `showConfig()` - Konfigurationsdetails
- `showSession()` - Session-Info
- `showStats()` - Systemstatistiken
- `showRules()` - Regel-Statistiken
- `showStatus()` - Systemstatus

## ⚙️ **Konfigurationssystem**

### **Konfigurationsquellen**

1. **Multi-File Directory** (`/data` Verzeichnis)
2. **Fallback File** (`context.json`)
3. **Default Configuration** (Integriert)

### **Konfigurationsstruktur**

```typescript
ElizaConfig {
  pools: Record<string, string[][]>;    // Antwort-Pools
  eliza_rules: ElizaRule[];            // Regeln
  reflections: Record<string, string>;  // Reflexionsregeln
  metadata: {...}                      // Metadaten
}
```

## 🛠️ **Tool Integration**

### **Tool Execution**

- `executeToolCalls(tool_calls)` - Führt Tool-Aufrufe aus
- `formatToolResults(results)` - Formatierung von Tool-Ergebnissen
- Integration mit `toolRegistry.call()`

### **Tool-Call Erkennung**

- Automatische Tool-Ausführung basierend auf Regeln
- Parameter-Extraktion aus Regex-Matches
- Fehlerbehandlung für Tool-Fehler

## 📊 **Response-System**

### **Antwort-Generierung**

- Regelbasierte Antworten
- Kontextabhängige Antworten
- Tool-Ergebnis-Integration
- Fallback-Antworten

### **Response-Typen**

- **Regelbasierte Antworten** - Gefundene Pattern-Matches
- **Tool-Responses** - Mit Tool-Ergebnissen
- **Befehls-Responses** - Systembefehle
- **Fallback-Responses** - Bei keinem Match
- **Error-Responses** - Bei Fehlern

## 🔄 **Session Management**

### **Session-Informationen**

- Session-ID mit Zeitstempel
- Nachrichten-Historie
- Kontext-Zustand
- Laufzeit-Statistiken

### **Session-Methoden**

- Automatische Session-Erstellung
- Session-Reset mit neuer ID
- Historie-Begrenzung (25 Nachrichten Standard)

## 📈 **Statistik & Monitoring**

### **Regel-Statistiken**

- Anzahl Regeln (gesamt/aktiv)
- Treffer nach Priorität
- Letzter Treffer-Zeitpunkt
- Regeln mit Tools/Actions

### **System-Statistiken**

- Nachrichtenanzahl
- Aktives Thema
- Stimmungsanalyse
- Kontext-Confidence
- Durchschnittliche Response-Time

## 🔧 **Erweiterte Funktionalität**

### **Dynamische Regeln**

- `addCustomRule()` - Fügt Regeln zur Laufzeit hinzu
- Regel-Validierung und Kompilierung
- Prioritäts-basierte Sortierung

### **Kontext-Integration**

- Integration mit `ConversationContext`
- Themenanalyse
- Stimmungserkennung
- Intent-Erkennung

## 🎯 **Spezialbehandlungen**

### **Wikipedia Integration**

- Automatische Erkennung von Wikipedia-Suchanfragen
- Integration mit `wikipedia_search` Tool
- Fehlerbehandlung für Wikipedia-Fehler

### **Reflexionssystem**

- Automatische Text-Transformation
- Pronomen-Reflexion (ich → du, etc.)
- Kontextuelle Anpassungen

Der Eliza Provider dient als regelbasierter Fallback-Provider mit erweiterter Tool-Integration, Session-Management und umfangreichem Diagnose-System für das ERP-KI-System.

Basierend auf der analysierten `fallbackProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Fallback Provider - Hauptfunktionen**

### **Kernfunktion**

- `callFallback(model, messages)` - Generiert Fallback-Antworten

### **Utility-Funktionen**

- `isFallbackModel(modelId)` - Prüft auf Fallback-Modelle

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export const fallbackProvider = {
  call: callFallback, // Hauptaufruffunktion
  isModel: isFallbackModel, // Modellprüfung
};
```

## 📋 **Antwort-System**

### **Fallback-Antworten**

Vordefinierte Antwort-Pool:

```typescript
const FALLBACK_RESPONSES = [
  "Ich habe Ihre Eingabe registriert, benötige jedoch mehr Informationen.",
  "Die Anfrage konnte nicht eindeutig interpretiert werden.",
  "Bitte formulieren Sie die Frage etwas präziser.",
  "Im aktuellen Modus stehen nur einfache Antworten bereit.",
  "Gerne – bitte geben Sie weitere Details an.",
];
```

### **Response-Generierung**

- Zufällige Auswahl aus Antwort-Pool
- Einfache Text-Antwort ohne komplexe Verarbeitung

## 📊 **Response-Struktur**

```typescript
AIResponse {
  text: string,              // Zufällige Fallback-Antwort
  meta: {
    provider: "fallback",    // Provider-Identifikation
    model: string,           // Übergebenes Modell oder "fallback"
    source: "local"          // Lokale Quelle
  }
}
```

## 🎯 **Modell-Erkennung**

### **Erkannte Fallback-Modelle**

- `fallback` - Explizites Fallback-Modell
- `local` - Lokales Modell
- `offline*` - Offline-Modelle (enthält "offline")

### **Fallback-Verhalten**

- Bei leerem `modelId` wird `true` zurückgegeben
- Case-insensitive Prüfung

## 🔄 **Integrations-Punkte**

### **Minimales Interface**

- Keine Tool-Integration
- Keine Kontext-Verarbeitung
- Keine Session-Verwaltung
- Keine komplexe Logik

### **Einsatzszenario**

- Letzte Fallback-Ebene bei Fehlern
- Offline-Betrieb
- Minimale Abhängigkeiten
- Schnelle Antwort-Generierung

Der Fallback Provider dient als ultimative Rückfallebene mit minimaler Funktionalität für Notfälle und Offline-Betrieb im ERP-KI-System.

Basierend auf der analysierten `huggingfaceProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **HuggingFace Provider - Hauptfunktionen**

### **Kernfunktion**

- `callHuggingFace(model, messages)` - Hauptfunktion für HuggingFace API Aufrufe

### **Utility-Funktionen**

- `buildHeaders()` - Erstellt Request-Header mit API-Key
- `formatInput(messages)` - Formatiert Chat-Nachrichten für API
- `isHuggingFaceModel(modelId)` - Prüft auf HuggingFace-Modelle
- `testHuggingFace()` - Testet API-Erreichbarkeit

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  config: hfConfig, // Provider-Konfiguration
  call: callHuggingFace, // Hauptaufruffunktion
  isModel: isHuggingFaceModel, // Modellprüfung
  test: testHuggingFace, // Verbindungstest
};
```

## ⚙️ **Konfigurationssystem**

### **Umgebungsvariablen**

- `HF_MODEL` - Modellname (Standard: "mistralai/Mistral-7B-Instruct-v0.1")
- `HF_ENDPOINT` - API Endpoint (Standard: HuggingFace Inference API)
- `HUGGINGFACEHUB_API_TOKEN` - API Token (erforderlich)
- `HF_TEMPERATURE` - Temperatureinstellung
- `HF_MAX_TOKENS` - Maximale Tokens

### **Provider-Konfiguration**

```typescript
hfConfig: AIModuleConfig {
  name: "huggingfaceProvider",
  provider: "huggingface",
  model: string,                    // Verwendetes Modell
  endpoint: string,                 // API Endpoint
  api_key_env: string,              // API Key Umgebungsvariable
  temperature: number,              // 0.4 Standard
  max_tokens: number,               // 1200 Standard
  capabilities: string[],           // Unterstützte Funktionen
  active: boolean                   // Aktivierungsstatus
}
```

## 🌐 **API-Integration**

### **Request-Format**

```typescript
{
  inputs: string,                  // Formatierte Eingabe
  parameters: {
    temperature: number,
    max_new_tokens: number,
    return_full_text: boolean      // false - nur neue Tokens
  }
}
```

### **Response-Verarbeitung**

Unterstützt verschiedene Response-Formate:

- **Array-Format** - Standard Text-Generation
- **generated_text** - Direkte Text-Antwort
- **translation_text** - Übersetzungs-Response
- **summary_text** - Zusammenfassungs-Response
- **outputs** - Generische Ausgaben

## 📊 **Response-Struktur**

```typescript
AIResponse {
  text: string,                    // Verarbeitete Antwort
  data: any,                       // Rohdaten von API
  meta: {
    provider: "huggingface",
    model: string,
    tokens_used: number,           // Verwendete Tokens
    time_ms: number,               // Laufzeit
    source: string                 // Endpoint URL
  },
  errors?: string[]                // Bei Fehlern
}
```

## 🛠️ **Unterstützte Capabilities**

### **Modell-Typen**

- `chat` - Chat-Modelle
- `text` - Text-Generation
- `embedding` - Embedding-Modelle
- `translation` - Übersetzungs-Modelle
- `summarization` - Zusammenfassungs-Modelle

### **Modell-Erkennung**

- **Slash-Notation** - Modelle mit `/` (z.B. "org/model")
- **HuggingFace Keywords** - Enthält "huggingface"

## 🔐 **Sicherheit & Error Handling**

### **Authentifizierung**

- Bearer Token Authentication
- API-Key Validierung
- Header-basierte Authentifizierung

### **Fehlerbehandlung**

- HTTP Status Code Überprüfung
- Timeout Management (60s)
- Detaillierte Fehlerprotokollierung
- Fallback Error Responses

## 🧪 **Health Check**

### **Verbindungstest**

- `testHuggingFace()` - Endpoint-Erreichbarkeit
- HEAD Request mit Timeout (5s)
- Boolean Rückgabe (true/false)

### **Endpoint-Validierung**

- Base URL Sicherung gegen undefined
- Pfad-Korrektur für Model-Endpoints
- URL-Format Validierung

## 🔄 **Input-Formatierung**

### **Nachrichten-Format**

```
role: content
role: content
```

Beispiel:

```
user: Hallo, wie geht es dir?
assistant: Mir geht es gut, danke!
```

### **Eingabe-Verarbeitung**

- Kombiniert alle Nachrichten zu einem String
- Behält Rollen-Informationen bei
- Einfache Text-Konkatenierung

Der HuggingFace Provider bietet eine robuste Integration der HuggingFace Inference API mit Unterstützung für verschiedene Modell-Typen und umfassender Fehlerbehandlung für das ERP-KI-System.

Basierend auf der analysierten `llamaCppProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Llama.cpp Provider - Hauptfunktionen**

### **Kernfunktion**

- `callLlamaCpp(model, messages)` - Hauptfunktion für llama.cpp API Aufrufe

### **Utility-Funktionen**

- `buildPrompt(messages)` - Baut Prompt aus Chat-Nachrichten
- `buildPayload(prompt)` - Erstellt Request-Payload
- `isLlamaCppModel(modelId)` - Prüft auf llama.cpp-Modelle
- `testLlamaCpp()` - Testet API-Erreichbarkeit

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  config: llamaConfig, // Provider-Konfiguration
  call: callLlamaCpp, // Hauptaufruffunktion
  isModel: isLlamaCppModel, // Modellprüfung
  test: testLlamaCpp, // Verbindungstest
};
```

## ⚙️ **Konfigurationssystem**

### **Umgebungsvariablen**

- `LLAMA_CPP_MODEL` - Modellname (Standard: "local-gguf")
- `LLAMA_CPP_URL` - API Endpoint (Standard: "http://localhost:8080/completion")
- `LLAMA_CPP_TEMPERATURE` - Temperatureinstellung
- `LLAMA_CPP_MAX_TOKENS` - Maximale Tokens

### **Provider-Konfiguration**

```typescript
llamaConfig: AIModuleConfig {
  name: "llamaCppProvider",
  provider: "local",
  model: string,                    // Verwendetes Modell
  endpoint: string,                 // API Endpoint
  temperature: number,              // 0.4 Standard
  max_tokens: number,               // 1000 Standard
  capabilities: string[],           // Unterstützte Funktionen
  active: boolean                   // Aktivierungsstatus
}
```

## 🌐 **API-Integration**

### **Request-Format**

```typescript
{
  prompt: string,                  // Formatierter Prompt
  temperature: number,
  max_tokens: number,
  stream: boolean                  // false - kein Streaming
}
```

### **Prompt-Formatierung**

```
USER: Nachricht 1
ASSISTANT: Antwort 1
USER: Nachricht 2
ASSISTANT:
```

### **Response-Verarbeitung**

Unterstützt verschiedene Response-Formate:

- `content` - Standard llama.cpp Response
- `response` - Alternative Response-Felder
- `choices[0].text` - OpenAI-kompatibles Format
- `choices[0].message.content` - Chat Completion Format

## 📊 **Response-Struktur**

```typescript
AIResponse {
  text: string,                    // Verarbeitete Antwort
  meta: {
    provider: "llama.cpp",
    model: string,
    time_ms: number,               // Laufzeit in Millisekunden
    source: string                 // Endpoint URL
  },
  errors?: string[],               // Bei Fehlern
  confidence?: number              // Konfidenz bei Fehlern (0)
}
```

## 🛠️ **Unterstützte Capabilities**

### **Modell-Typen**

- `chat` - Chat-Modelle
- `text` - Text-Generation
- `reasoning` - Reasoning-Fähigkeiten
- `tools` - Tool-Unterstützung
- `json` - JSON-Formatierung

### **Modell-Erkennung**

- **GGUF-Modelle** - Enthält "gguf"
- **Llama-Modelle** - Enthält "llama"
- **Lokale Modelle** - Enthält "local"

## 🔐 **Sicherheit & Error Handling**

### **Authentifizierung**

- Keine Authentifizierung erforderlich (lokal)
- Einfache HTTP Requests
- Localhost-basierte Kommunikation

### **Fehlerbehandlung**

- HTTP Status Code Überprüfung
- Längeres Timeout (120s für lokale Modelle)
- Detaillierte Fehlerprotokollierung
- Fallback Error Responses mit Confidence 0

## 🧪 **Health Check**

### **Verbindungstest**

- `testLlamaCpp()` - Endpoint-Erreichbarkeit
- HEAD Request mit kurzem Timeout (3s)
- Boolean Rückgabe (true/false)

### **Endpoint-Validierung**

- Default URL Fallback
- URL-Format Sicherung

## 🔄 **Kompatibilität**

### **API-Endpoints Unterstützt**

- `/completion` - Standard llama.cpp Endpoint
- `/chat/completions` - OpenAI-kompatible Endpoints

### **Response-Formate**

- Native llama.cpp Response
- OpenAI-kompatible Response-Struktur
- Einfache Text-Responses

Der Llama.cpp Provider bietet eine robuste Integration für lokale llama.cpp Instanzen mit breiter Kompatibilität für verschiedene Modelle und API-Formate, ideal für Offline-Betrieb im ERP-KI-System.

Basierend auf der analysierten `localProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Local Provider - Hauptfunktionen**

### **Kernfunktionen**

- `callLocalModel(model, messages, options)` - Hauptfunktion für lokale Modellaufrufe
- `scanLocalModels()` - Scannt und erkennt lokale Modelle
- `updateLocalConfig(updates)` - Aktualisiert Konfiguration dynamisch
- `getLocalProviderStatus()` - Gibt Systemstatus zurück

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  callLocalModel, // Hauptaufruffunktion
  scanLocalModels, // Modell-Erkennung
  updateLocalConfig, // Konfigurationsupdate
  getLocalProviderStatus, // Systemstatus
};
```

## 📁 **Modell-Erkennungssystem**

### **Unterstützte Modell-Typen**

- **GGUF** - `.gguf` Dateien
- **HuggingFace** - `pytorch_model` Dateien
- **Whisper** - Whisper-Modelle
- **Falcon** - Falcon-Modelle
- **Mistral** - Mistral-Modelle
- **Gemma** - Gemma-Modelle
- **Qwen** - Qwen-Modelle
- **Unknown** - Andere Modelltypen

### **Scan-Pfade**

1. `F:/KI/models` - Externe KI-Modelle
2. `ERP_SteinmetZ_V1/models` - Projekt-interne Modelle

### **Modell-Informationen**

```typescript
LocalModelInfo {
  name: string,              // Modellname
  path: string,              // Dateipfad
  type: string,              // Modelltyp
  sizeMB?: number,           // Größe in MB
  lastModified?: string,     // Änderungsdatum
  files?: string[]           // Dateiliste
}
```

## ⚙️ **Konfigurationssystem**

### **Provider-Konfiguration**

```typescript
localProviderConfig: AIModuleConfig {
  name: "localProvider",
  provider: "local",
  model: "auto",                    // Automatische Modellerkennung
  role: "assistant",
  temperature: 0.4,
  max_tokens: 512,
  active: true,
  capabilities: string[]            // Unterstützte Funktionen
}
```

### **Dynamische Konfiguration**

- Runtime Updates via `updateLocalConfig()`
- Systemprompt-basierte Konfiguration
- Flexible Parameter-Anpassung

## 📊 **Response-System**

### **Response-Struktur**

```typescript
AIResponse {
  text: string,                    // Antworttext
  action?: string,                 // Aktion (bei Fehlern)
  errors?: string[],               // Fehlermeldungen
  meta: {
    model: string,                 // Modellname
    source: "localProvider",       // Provider-Identifikation
    reasoning: string,             // Erklärungs-Text
    confidence: number,            // Konfidenzwert (0.6)
    time_ms: number                // Laufzeit (75ms)
  }
}
```

### **Fehlerbehandlung**

- Modell-Nicht-Gefunden Fehler
- Verfügbare Modelle Auflistung
- Detaillierte Fehlerinformationen

## 🖥️ **System-Status & Monitoring**

### **Status-Informationen**

```typescript
{
  provider: "localProvider",
  model_count: number,             // Anzahl gefundener Modelle
  directories: string[],           // Scan-Pfade
  active_config: AIModuleConfig,   // Aktuelle Konfiguration
  system_info: {
    hostname: string,              // System-Hostname
    platform: string,              // Betriebssystem
    arch: string,                  // Prozessor-Architektur
    totalmem_GB: number,           // Gesamter RAM
    freemem_GB: number,            // Freier RAM
    cpus: number,                  // CPU-Kerne
    uptime_hours: number           // System-Laufzeit
  }
}
```

## 🛠️ **Unterstützte Capabilities**

### **Funktionen**

- `tools` - Tool-Unterstützung
- `workflow` - Workflow-Integration
- `chat` - Chat-Funktionalität
- `reasoning` - Reasoning-Fähigkeiten
- `json` - JSON-Verarbeitung

## 🔄 **Simulations-Modus**

### **Aktuelle Implementierung**

- **Mock/Simulation** - Keine echte Inferenz
- **Response-Generierung** - Vordefinierte Antworten
- **Erweiterbar** - Kann für echte Inferenz angepasst werden

### **Antwort-Format**

```
Systemprompt

🧠 (Modellname): Ich habe deine Eingabe erhalten: "Eingabe" ...
Ich bin aktuell eine lokale Simulation, kann aber für echte Inferenz erweitert werden.
```

## 🎯 **Einsatzszenarien**

### **Modell-Management**

- Automatische Modell-Erkennung
- Modell-Informationen Abfrage
- Pfad-basierte Organisation

### **System-Integration**

- Offline-Betrieb
- Lokale Modell-Nutzung
- Systemressourcen-Überwachung

Der Local Provider dient als Modell-Management und Simulations-System für lokale KI-Modelle mit umfassender Systemintegration und Erweiterbarkeit für echte Inferenz im ERP-KI-System.

Basierend auf der analysierten `ollamaProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Ollama Provider - Hauptfunktionen**

### **Kernfunktionen**

- `callOllama(model, messages, options)` - Hauptfunktion für Ollama API Aufrufe
- `listOllamaModels()` - Listet verfügbare Ollama-Modelle
- `updateOllamaConfig(update)` - Aktualisiert Konfiguration dynamisch
- `getOllamaStatus()` - Gibt Systemstatus zurück

### **Tool Integration**

- `detectToolCalls(text)` - Erkennt Tool-Aufrufe im Text
- `handleToolCalls(toolCalls)` - Führt Tool-Aufrufe aus
- `safeParseJSON(str)` - Sicheres JSON-Parsing für Parameter

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  callOllama, // Hauptaufruffunktion
  listOllamaModels, // Modell-Liste
  updateOllamaConfig, // Konfigurationsupdate
  getOllamaStatus, // Systemstatus
};
```

## ⚙️ **Konfigurationssystem**

### **Umgebungsvariablen**

- `OLLAMA_MODEL` - Standardmodell (Default: "mistral:latest")
- `OLLAMA_TEMPERATURE` - Temperatureinstellung
- `OLLAMA_MAX_TOKENS` - Maximale Tokens
- `OLLAMA_API_URL` - API Endpoint (Default: "http://localhost:11434")

### **Provider-Konfiguration**

```typescript
ollamaConfig: AIModuleConfig {
  name: "ollamaProvider",
  provider: "ollama",
  model: string,                    // Verwendetes Modell
  temperature: number,              // 0.5 Standard
  max_tokens: number,               // 1024 Standard
  active: boolean,                  // Aktivierungsstatus
  capabilities: string[],           // Unterstützte Funktionen
  timeout_ms: number                // 60000ms Timeout
}
```

## 🌐 **API-Integration**

### **Request-Format**

```typescript
{
  model: string,                    // Modellname
  stream: false,                    // Kein Streaming
  options: {
    temperature: number,
    num_predict: number             // Maximale Tokens
  },
  messages: Array<{                 // Nachrichten-Array
    role: string,
    content: string
  }>
}
```

### **Message-Struktur**

- Automatische System-Prompt Integration
- Beibehaltung der Chat-Historie
- Flexible Rollen-Zuweisung

## 🛠️ **Tool Integration System**

### **Tool-Call Erkennung**

**Syntax**: `[TOOL: tool_name {"param": "value"}]`

### **Tool-Execution Flow**

1. **Erkennung** - Regex-basierte Tool-Erkennung im Antworttext
2. **Parameter-Parsing** - Sicheres JSON-Parsing
3. **Ausführung** - Über `toolRegistry.call()`
4. **Ergebnis-Formatierung** - Erfolgs-/Fehler-Meldungen

### **Response-Integration**

- Tool-Ergebnisse werden an Antworttext angehängt
- Separate Erfolgs-/Fehler-Nachrichten
- Vollständige Transparenz über Tool-Ausführung

## 📊 **Response-Struktur**

```typescript
AIResponse {
  text: string,                    // Kombinierte Antwort + Tool-Results
  action: "ollama_chat",           // Aktionstyp
  tool_calls: Array<{              // Erkannte Tool-Aufrufe
    name: string,
    parameters: any
  }>,
  meta: {
    model: string,                 // Verwendetes Modell
    tokens_used: number,           // Verwendete Tokens
    time_ms: number,               // Laufzeit
    source: "ollamaProvider",      // Provider-Identifikation
    confidence: number             // 0.95 Standard
  },
  errors?: string[]                // Bei Fehlern
}
```

## 🔍 **Modell-Management**

### **Modell-Liste**

```typescript
{
  name: string,                    // Modellname
  modified: string                 // Änderungsdatum
}
```

### **API-Endpoints**

- `/api/tags` - Modell-Liste abrufen
- `/api/chat` - Chat-Completions

## 📈 **Status & Monitoring**

### **System-Status**

```typescript
{
  provider: "ollama",
  apiUrl: string,                  // API Endpoint
  model_count: number,             // Anzahl verfügbarer Modelle
  models: Array<{...}>,           // Modell-Liste
  config: AIModuleConfig,          // Aktuelle Konfiguration
  system: {
    hostname: string,              // System-Hostname
    platform: string,              // Betriebssystem
    arch: string,                  // Prozessor-Architektur
    totalmem_GB: number,           // Gesamter RAM
    freemem_GB: number,            // Freier RAM
    cpus: number,                  // CPU-Kerne
    uptime_h: number               // System-Laufzeit in Stunden
  }
}
```

## 🛡️ **Fehlerbehandlung**

### **Error Responses**

- HTTP Status Code Validierung
- Timeout Management (60s)
- Detaillierte Fehlerprotokollierung
- Confidence 0 bei Fehlern

### **Tool-Fehlerbehandlung**

- Separate Fehlerbehandlung pro Tool
- Fehlermeldungen in Response integriert
- Kein Abbruch bei Tool-Fehlern

## 🎯 **Unterstützte Capabilities**

### **Funktionen**

- `chat` - Chat-Funktionalität
- `embedding` - Embedding-Erstellung
- `vision` - Bildverarbeitung
- `tools` - Tool-Integration
- `workflow` - Workflow-Unterstützung
- `json` - JSON-Response-Formatierung

Der Ollama Provider bietet eine umfassende Integration für lokale Ollama-Instanzen mit erweiterter Tool-Unterstützung, Modell-Management und System-Monitoring für das ERP-KI-System.

Basierend auf der analysierten `openaiProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **OpenAI Provider - Hauptfunktionen**

### **Kernfunktionen**

- `callOpenAI(model, messages, options)` - Hauptfunktion für OpenAI API Aufrufe
- `updateOpenAIConfig(update)` - Aktualisiert Konfiguration dynamisch
- `getOpenAIStatus()` - Gibt Provider-Status zurück

### **Tool Integration**

- `detectToolCalls(text)` - Erkennt Tool-Aufrufe im Text
- `handleToolCalls(calls)` - Führt Tool-Aufrufe aus
- `safeJsonParse(s)` - Sicheres JSON-Parsing für Parameter

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  callOpenAI, // Hauptaufruffunktion
  updateOpenAIConfig, // Konfigurationsupdate
  getOpenAIStatus, // Statusabfrage
};
```

## ⚙️ **Konfigurationssystem**

### **Umgebungsvariablen**

- `OPENAI_API_KEY` - API-Schlüssel (erforderlich)
- `OPENAI_MODEL` - Standardmodell (Default: "gpt-4o-mini")
- `OPENAI_TEMPERATURE` - Temperatureinstellung
- `OPENAI_MAX_TOKENS` - Maximale Tokens

### **Provider-Konfiguration**

```typescript
openaiConfig: AIModuleConfig {
  name: "openaiProvider",
  provider: "openai",
  model: string,                    // Verwendetes Modell
  temperature: number,              // 0.3 Standard
  max_tokens: number,               // 1500 Standard
  active: boolean,                  // Aktivierungsstatus
  capabilities: string[],           // Unterstützte Funktionen
  timeout_ms: number,               // 60000ms Timeout
  description: string               // Beschreibung
}
```

## 🌐 **API-Integration**

### **Request-Format**

```typescript
{
  model: string,                    // Modellname
  messages: Array<{                 // Nachrichten-Array
    role: string,
    content: string
  }>,
  temperature: number,
  max_tokens: number,
  stream: false,                    // Kein Streaming
  response_format: string           // "text" Standard
}
```

### **Message-Struktur**

- Automatische System-Prompt Integration
- Beibehaltung der Chat-Historie
- Formatierung für OpenAI API

## 🛠️ **Tool Integration System**

### **Tool-Call Erkennung**

**Syntax**: `[TOOL: tool_name {"param": "value"}]`

### **Tool-Execution Flow**

1. **Erkennung** - Regex-basierte Tool-Erkennung im Antworttext
2. **Parameter-Parsing** - Sicheres JSON-Parsing
3. **Ausführung** - Über `toolRegistry.call()`
4. **Ergebnis-Formatierung** - Erfolgs-/Fehler-Meldungen

### **Response-Integration**

- Tool-Ergebnisse werden an Antworttext angehängt
- Separate Erfolgs-/Fehler-Nachrichten
- Vollständige Transparenz über Tool-Ausführung

## 📊 **Response-Struktur**

```typescript
AIResponse {
  text: string,                    // Kombinierte Antwort + Tool-Results
  action: "openai_chat",           // Aktionstyp
  tool_calls: Array<{              // Erkannte Tool-Aufrufe
    name: string,
    parameters: any
  }>,
  meta: {
    model: string,                 // Verwendetes Modell
    tokens_used: number,           // Verwendete Tokens
    time_ms: number,               // Laufzeit
    source: "openaiProvider",      // Provider-Identifikation
    confidence: number             // 0.97 Standard (hoch)
  },
  errors?: string[]                // Bei Fehlern
}
```

## 🔐 **Client-Management**

### **API-Client Initialisierung**

- `getClient()` - Erstellt OpenAI Client mit API-Key
- API-Key Validierung
- Fehler bei fehlendem API-Key

## 📈 **Status & Monitoring**

### **Status-Informationen**

```typescript
{
  provider: "openai",
  api_key_available: boolean,      // API-Key Verfügbarkeit
  active_config: AIModuleConfig,   // Aktuelle Konfiguration
  default_model: string,           // Standardmodell
  capabilities: string[]           // Unterstützte Funktionen
}
```

## 🛡️ **Fehlerbehandlung**

### **Error Responses**

- API-Client Fehlerbehandlung
- Detaillierte Fehlerprotokollierung
- Confidence 0 bei Fehlern
- Strukturierte Error-Responses

### **Tool-Fehlerbehandlung**

- Separate Fehlerbehandlung pro Tool
- Fehlermeldungen in Response integriert
- Kein Abbruch bei Tool-Fehlern

## 🎯 **Unterstützte Capabilities**

### **Funktionen**

- `chat` - Chat-Funktionalität
- `tools` - Tool-Integration
- `reasoning` - Reasoning-Fähigkeiten
- `workflow` - Workflow-Unterstützung
- `json` - JSON-Response-Formatierung

## 🔄 **Dynamische Konfiguration**

### **Runtime Updates**

- `updateOpenAIConfig()` - Aktualisiert Konfiguration zur Laufzeit
- Flexible Parameter-Anpassung
- Sofortige Wirksamkeit

## 📋 **Unterstützte Modelle**

### **OpenAI Modelle**

- `gpt-4o-mini` - Standardmodell
- `gpt-4o` - GPT-4 Omni
- `gpt-4-turbo` - GPT-4 Turbo
- `gpt-4` - GPT-4
- `gpt-3.5-turbo` - GPT-3.5 Turbo

Der OpenAI Provider bietet eine robuste Integration der OpenAI API mit erweiterter Tool-Unterstützung, dynamischer Konfiguration und umfassender Fehlerbehandlung für das ERP-KI-System.

Basierend auf der analysierten `vertexAIProvider.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Vertex AI Provider - Hauptfunktionen**

### **Kernfunktionen**

- `callVertexAI(model, messages, options)` - Hauptfunktion für Vertex AI API Aufrufe
- `updateVertexConfig(update)` - Aktualisiert Konfiguration dynamisch
- `getVertexStatus()` - Gibt Provider-Status zurück

### **Tool Integration**

- `detectToolCalls(text)` - Erkennt Tool-Aufrufe im Text
- `handleToolCalls(calls)` - Führt Tool-Aufrufe aus
- `safeJsonParse(s)` - Sicheres JSON-Parsing für Parameter

## 🔧 **Provider Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  callVertexAI, // Hauptaufruffunktion
  updateVertexConfig, // Konfigurationsupdate
  getVertexStatus, // Statusabfrage
};
```

## ⚙️ **Konfigurationssystem**

### **Umgebungsvariablen**

- `VERTEX_API_KEY` - API-Schlüssel (erforderlich)
- `VERTEX_MODEL` - Standardmodell (Default: "gemini-1.5-pro")
- `VERTEX_API_URL` - API Endpoint (Default: Google Generative Language API)
- `VERTEX_TEMPERATURE` - Temperatureinstellung
- `VERTEX_MAX_TOKENS` - Maximale Tokens

### **Provider-Konfiguration**

```typescript
vertexConfig: AIModuleConfig {
  name: "vertexAIProvider",
  provider: "vertex",
  model: string,                    // Verwendetes Modell
  endpoint: string,                 // API Endpoint
  api_key_env: string,              // API Key Umgebungsvariable
  temperature: number,              // 0.4 Standard
  max_tokens: number,               // 1500 Standard
  active: boolean,                  // Aktivierungsstatus
  capabilities: string[],           // Unterstützte Funktionen
  timeout_ms: number                // 60000ms Timeout
}
```

## 🌐 **API-Integration**

### **Request-Format**

```typescript
{
  contents: Array<{                // Nachrichten-Array
    role: string,
    parts: Array<{ text: string }>
  }>,
  generationConfig: {
    temperature: number,
    maxOutputTokens: number        // Maximale Ausgabe-Tokens
  }
}
```

### **Message-Struktur**

- **System-Prompt** - Wird automatisch vorangestellt
- **Parts-basierte Struktur** - Vertex AI spezifisches Format
- **Rollen-Trennung** - User/System/Assistant

### **API-Endpoint**

```
https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}
```

## 🛠️ **Tool Integration System**

### **Tool-Call Erkennung**

**Syntax**: `[TOOL: tool_name {"param": "value"}]`

### **Tool-Execution Flow**

1. **Erkennung** - Regex-basierte Tool-Erkennung im Antworttext
2. **Parameter-Parsing** - Sicheres JSON-Parsing
3. **Ausführung** - Über `toolRegistry.call()` (dynamischer Import)
4. **Ergebnis-Formatierung** - Erfolgs-/Fehler-Meldungen

### **Response-Integration**

- Tool-Ergebnisse werden an Antworttext angehängt
- Separate Erfolgs-/Fehler-Nachrichten
- Vollständige Transparenz über Tool-Ausführung

## 📊 **Response-Struktur**

```typescript
AIResponse {
  text: string,                    // Kombinierte Antwort + Tool-Results
  action: "vertex_chat",           // Aktionstyp
  tool_calls: Array<{              // Erkannte Tool-Aufrufe
    name: string,
    parameters: any
  }>,
  meta: {
    provider: "vertexAI",          // Provider-Identifikation
    model: string,                 // Verwendetes Modell
    tokens_used: number,           // Verwendete Tokens
    time_ms: number,               // Laufzeit
    source: "vertexAIProvider",    // Quell-Identifikation
    confidence: number             // 0.95 Standard
  },
  errors?: string[]                // Bei Fehlern
}
```

## 🔍 **Response-Verarbeitung**

### **Sichere Response-Parsing**

- **Type-Safe Checking** - Robuste Objekt-Validierung
- **Multiple Response-Formate** - Unterstützt verschiedene Vertex AI Ausgabeformate:
  - `candidates[0].content.parts[0].text` - Standard-Textantwort
  - `candidates[0].output` - Alternative Ausgabe
- **Token-Count Extraction** - Aus `usageMetadata.totalTokenCount`

### **Fehlerbehandlung**

- API-Key Validierung
- HTTP Status Code Überprüfung
- Detaillierte Fehlerprotokollierung
- Confidence 0 bei Fehlern

## 📈 **Status & Monitoring**

### **Status-Informationen**

```typescript
{
  provider: "vertexAI",
  model: string,                   // Aktuelles Modell
  endpoint: string,                // API Endpoint
  api_key_set: boolean,            // API-Key Verfügbarkeit
  active_config: AIModuleConfig    // Aktuelle Konfiguration
}
```

## 🎯 **Unterstützte Capabilities**

### **Funktionen**

- `chat` - Chat-Funktionalität
- `vision` - Bildverarbeitung (Gemini Vision)
- `tools` - Tool-Integration
- `json` - JSON-Response-Formatierung
- `reasoning` - Reasoning-Fähigkeiten

## 🔄 **Dynamische Konfiguration**

### **Runtime Updates**

- `updateVertexConfig()` - Aktualisiert Konfiguration zur Laufzeit
- Flexible Parameter-Anpassung
- Sofortige Wirksamkeit

## 📋 **Unterstützte Modelle**

### **Gemini Modelle**

- `gemini-1.5-pro` - Standardmodell
- `gemini-1.5-flash` - Schnelles Modell
- `gemini-pro` - Gemini Pro
- `gemini-ultra` - Gemini Ultra (falls verfügbar)

Der Vertex AI Provider bietet eine robuste Integration der Google Vertex AI API mit Fokus auf Gemini-Modelle, erweiterter Tool-Unterstützung und umfassender Fehlerbehandlung für das ERP-KI-System.
