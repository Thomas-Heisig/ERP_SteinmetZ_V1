Basierend auf der analysierten `aiUtils.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **AI Utils - Hauptfunktionen**

### **Nachrichten-Validierung & Bereinigung**
- `sanitizeMessages(messages)` - Bereinigt Chat-Nachrichten
- `normalizeMessageContent(content, maxLength)` - Normalisiert Nachrichteninhalt
- `sanitizeAndNormalize(messages)` - Kombinierte Bereinigung

### **Timeout-Handling**
- `withTimeout(promise, ms, label)` - Promise mit Timeout

### **Token-Management**
- `estimateTokens(text)` - Schätzt Token-Anzahl
- `truncateMessages(messages, maxTokens)` - Kürzt Nachrichten basierend auf Tokens

### **Sicherheitsprüfung**
- `analyzeTextSecurity(text)` - Prüft Text auf Sicherheitsprobleme
- `validateConversation(messages)` - Validiert gesamte Konversation

### **Analyse & Debugging**
- `analyzeAIResponse(response)` - Analysiert KI-Antwort
- `debugAIResponse(label, response)` - Debug-Ausgabe für KI-Antworten
- `measureAsync(label, fn)` - Misst Laufzeit asynchroner Funktionen

### **Utility-Funktionen**
- `createHashId(input)` - Erstellt Hash-ID für Deduplizierung

## 🔧 **Utils Interface**

### **Hauptexport**
```typescript
export default {
  // Nachrichten-Validierung
  sanitizeMessages,
  sanitizeAndNormalize,
  normalizeMessageContent,
  
  // Timeout-Handling
  withTimeout,
  
  // Token-Management
  estimateTokens,
  truncateMessages,
  
  // Sicherheitsprüfung
  analyzeTextSecurity,
  validateConversation,
  
  // Analyse & Debugging
  analyzeAIResponse,
  debugAIResponse,
  measureAsync,
  
  // Utility
  createHashId
}
```

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Nachrichten-Bereinigung**
```typescript
sanitizeMessages(messages: ChatMessage[]): ChatMessage[]
```
**Funktionalität**:
- Filtert ungültige Rollen (nur system, user, assistant)
- Erzwingt String-Content
- Trimmt Whitespace

### **2. Content-Normalisierung**
```typescript
normalizeMessageContent(content: string, maxLength = 4000): string
```
**Sicherheitsfeatures**:
- **Token Redaction**: Entfernt JWT/API-Token Muster
- **Sensitive Data**: Maskiert API-Keys, Secrets
- **Length Limiting**: Verhindert überlange Nachrichten

**Regex Patterns**:
- JWT Tokens: `[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}`
- API Keys: `/(sk-|api-|key-|token-|secret-)\w+/gi`

### **3. Timeout-Wrapper**
```typescript
withTimeout<T>(promise: Promise<T>, ms = 10000, label = "Operation"): Promise<T>
```
**Features**:
- **Clean Timeout**: Proper Resource Cleanup
- **Descriptive Errors**: Label-basierte Fehlermeldungen
- **Default Timeout**: 10 Sekunden Standard

### **4. Token-Schätzung**
```typescript
estimateTokens(text: string): number
```
**Algorithmus**: `text.length / 4` (einfache Approximation)
**Use Case**: Quick Estimation für Length-Limits

### **5. Nachrichten-Trunkierung**
```typescript
truncateMessages(messages: ChatMessage[], maxTokens = 8000): ChatMessage[]
```
**Strategie**: 
- Rückwärts-Iteration (neueste Nachrichten zuerst)
- Token-Akkumulation bis Limit
- Beibehaltung der Chronologie

### **6. Sicherheitsanalyse**
```typescript
analyzeTextSecurity(text: string): { safe: boolean; issues: string[] }
```
**Erkennungsmuster**:
- **Credentials**: password, token, api_key
- **HTML/JS**: script tags
- **SQL Injection**: DROP TABLE, DELETE FROM, etc.
- **Data Extraction**: SELECT *, INSERT INTO

### **7. KI-Antwort-Analyse**
```typescript
analyzeAIResponse(response: AIResponse)
```
**Analysierte Metriken**:
- Model & Provider Identification
- Token & Length Counting
- Security Assessment
- Performance Timing

## 🛡️ **Sicherheitsfeatures**

### **Proactive Security**
- **Input Sanitization**: Bevor Daten an KI gesendet werden
- **Pattern Detection**: Erkennung sensitiver Informationen
- **No Censorship**: Nur Markierung, keine automatische Löschung

### **Data Protection**
- **Token Redaction**: Automatische Maskierung von Credentials
- **Length Limits**: Prevention von Resource Exhaustion
- **Content Validation**: Strukturierte Sicherheitsprüfung

## 🔄 **Performance Optimizations**

### **Efficient Processing**
- **Streaming Ready**: Für große Textmengen optimiert
- **Memory Efficient**: Minimale Kopien von Daten
- **Fast Algorithms**: Optimierte String-Operationen

### **Resource Management**
- **Timeout Protection**: Verhindert hängende Requests
- **Token Awareness**: Vermeidet API-Limit-Überschreitungen
- **Cleanup Guarantee**: Proper Resource Freigabe

## 📊 **Monitoring & Debugging**

### **Structured Analysis**
```typescript
// Analyse-Ergebnis
{
  model: string,
  provider: string,
  tokens: number,
  length: number,
  safe: boolean,
  issues: string[],
  time_ms: number
}
```

### **Debugging Tools**
- **Benchmarking**: `measureAsync` für Performance-Tests
- **Response Debugging**: `debugAIResponse` für Entwickler
- **Security Auditing**: `validateConversation` für Sicherheitschecks

## 🎯 **Use Cases**

### **Pre-Processing Pipeline**
- Nachrichten-Bereinigung vor KI-Aufruf
- Token-Limit-Management
- Sicherheitsvalidierung

### **Quality Assurance**
- Response-Analyse und -Monitoring
- Performance-Benchmarking
- Security-Auditing

### **Developer Tools**
- Debugging-Hilfen für KI-Entwicklung
- Testing und Benchmarking
- Logging und Analyse

## 🔧 **Integration**

### **KI-System Kompatibilität**
- **Provider Agnostic**: Arbeitet mit allen KI-Providern
- **Type Safety**: Vollständige TypeScript-Unterstützung
- **Standard Compliance**: Kompatibel mit ChatMessage Standard

### **Logger Integration**
- Strukturierte Logging-Ausgabe
- Performance-Metriken-Protokollierung
- Security-Issue-Tracking

Die AI Utils bieten eine umfassende Tool-Sammlung für KI-spezifische Operationen mit Fokus auf Sicherheit, Performance und Developer Experience im ERP-KI-System.

Basierend auf der analysierten `cache.ts` Datei, hier sind die erkannten Funktionen und Features:

## 🗃️ **AI Cache System - Hauptfunktionen**

### **Cache-Kernfunktionen**
- `AICache` - Hauptklasse für Cache-Management
- `aiCache` - Globale Cache-Instanz
- `cached()` - Wrapper für asynchrone Funktionen mit Cache

### **Cache-Operationen**
- `generateKey()` - Erstellt deterministische Cache-Schlüssel
- `set()` - Speichert Werte im Cache
- `get()` - Ruft Werte aus dem Cache ab
- `has()` - Prüft Existenz und Gültigkeit
- `delete()` - Entfernt spezifische Einträge
- `clear()` - Löscht gesamten Cache
- `stats()` - Gibt Cache-Statistiken aus

## 🔧 **Cache Interface**

### **Hauptexport**
```typescript
export default {
  // Globale Instanz
  aiCache,
  
  // Cache-Wrapper
  cached,
  
  // Hauptklasse
  AICache
}
```

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Cache-Schlüssel-Generierung**
```typescript
generateKey(model: string, input: any, opts: CacheOptions = {}): string
```
**Algorithmus**:
- Kombiniert Model, Input und Namespace
- Erstellt deterministischen Hash mittels `createHashId()`
- Verwendet JSON-Stringifizierung für Konsistenz

### **2. Cache-Speicherung**
```typescript
set<T>(key: string, value: T, opts: CacheOptions = {}): void
```
**Features**:
- **TTL Support**: Standard 5 Minuten, konfigurierbar
- **Persistenz**: Optionale Dateispeicherung
- **Automatic Cleanup**: Integriertes Ablaufmanagement

### **3. Cache-Abruf**
```typescript
get<T>(key: string, persistent = false): T | null
```
**Ablaufprüfung**:
- Prüft `expiresAt` Zeitstempel
- Automatische Entfernung abgelaufener Einträge
- Fallback auf persistente Speicherung

### **4. Cache-Wrapper**
```typescript
cached<T>(key: string, fn: () => Promise<T>, opts: CacheOptions = {}): Promise<T>
```
**Use Case**: 
- Vereinfachte Cache-Nutzung für asynchrone Funktionen
- Automatisches Cache-Hit/Miss Handling
- Logging von Cache-Treffern

## ⚙️ **Cache-Konfiguration**

### **CacheOptions Interface**
```typescript
interface CacheOptions {
  ttl?: number;           // Ablaufzeit in Millisekunden (Default: 5min)
  persistent?: boolean;   // Speichern auf Festplatte
  namespace?: string;    // Logische Gruppierung
}
```

### **CacheEntry Struktur**
```typescript
interface CacheEntry<T = any> {
  key: string;           // Cache-Schlüssel
  value: T;              // Gespeicherter Wert
  createdAt: number;     // Erstellungszeitpunkt
  expiresAt?: number;    // Ablaufzeitpunkt (optional)
}
```

## 🗂️ **Persistente Speicherung**

### **Dateisystem-Integration**
- **Base Directory**: `data/ai_cache/`
- **Automatische Erstellung**: Verzeichnis wird bei Initialisierung angelegt
- **Dateiformat**: JSON mit Pretty-Print

### **Persistenz-Features**
- **Fallback-Mechanismus**: Bei Memory-Miss wird Dateisystem geprüft
- **Fehlertoleranz**: Fehler beim Schreiben/Lesen werden geloggt aber nicht geworfen
- **Cleanup**: Persistente Dateien werden bei Löschung entfernt

## 🧹 **Automatisches Cleanup**

### **Cleanup-System**
- **Intervall**: Alle 60 Sekunden
- **Ablaufprüfung**: Entfernt Einträge mit abgelaufener TTL
- **Performance**: Non-blocking mit `unref()`

### **Cleanup-Process**
```typescript
private cleanupExpired(): void
```
- Durchläuft alle Cache-Einträge
- Prüft `expiresAt` gegen aktuelle Zeit
- Entfernt abgelaufene Einträge
- Loggt Anzahl entfernte Einträge

## 📊 **Monitoring & Statistik**

### **Cache-Statistiken**
```typescript
stats(): {
  entries: number,      // Anzahl Cache-Einträge
  baseDir: string,      // Persistenz-Verzeichnis
  oldest: string        // Alter des ältesten Eintrags
}
```

### **Altersberechnung**
- `getOldestEntryAge()` - Berechnet Alter des ältesten Eintrags
- Format: Sekunden seit Erstellung
- "leer" wenn Cache empty

## 🛡️ **Sicherheitsfeatures**

### **Datenintegrität**
- **Hash-basierte Keys**: Verhindert Kollisionen
- **JSON Validation**: Strukturierte Datenspeicherung
- **Error Handling**: Fehlertolerante Dateioperationen

### **Resource Management**
- **Memory Limits**: Verwendet Map für begrenzten Speicher
- **Automatic Cleanup**: Verhindert Memory Leaks
- **TTL Enforcement**: Konsistente Ablaufsteuerung

## 🔄 **Performance Optimizations**

### **Effiziente Operationen**
- **In-Memory First**: Schneller Memory-Zugriff vor Dateisystem
- **Deterministic Keys**: Vermeidet doppelte Berechnungen
- **Lazy File Access**: Dateizugriff nur bei Bedarf

### **Resource Cleanup**
- **Scheduled Cleanup**: Regelmäßige Bereinigung
- **Proper Unref**: Verhindert Blockieren des Event-Loops
- **Efficient Iteration**: Optimierte Map-Operationen

## 🎯 **Use Cases**

### **KI-Abfragen-Caching**
- Model-Response-Caching (OpenAI, Anthropic, etc.)
- Embedding-Resultate
- Tool-Execution-Results

### **Deduplizierung**
- Identische Prompts mit gleichem Model
- Hash-basierte Schlüsselvergleich
- Vermeidung doppelter API-Aufrufe

### **Performance-Critical Operations**
- Teure KI-Berechnungen
- Häufig genutzte Embeddings
- Statische Model-Responses

## 🔧 **Integration**

### **KI-System Kompatibilität**
- **Provider Agnostic**: Arbeitet mit allen KI-Providern
- **Type Safety**: Generische Typunterstützung
- **Flexible TTL**: Anpassbar an verschiedene Use Cases

### **Logger Integration**
- Cache-Hit/Miss Logging
- Cleanup-Aktivitäts-Protokollierung
- Fehler- und Warnungs-Logging

Das AI Cache System bietet eine robuste, leistungsfähige Caching-Lösung für KI-Operationen mit Fokus auf Performance, Persistenz und Ressourcenmanagement im ERP-KI-System.

Basierend auf der analysierten `errors.ts` Datei, hier sind die erkannten Funktionen und Fehlerklassen:

## 🚨 **Error Handling System - Hauptkomponenten**

### **Basis-Fehlerklasse**
- `BaseError` - Grundklasse für alle standardisierten Fehler

### **KI-spezifische Fehlerklassen**
- `AIProviderError` - Fehler von KI-Providern
- `AIResponseError` - Ungültige KI-Antworten
- `AITimeoutError` - Zeitüberschreitungen bei KI-Operationen
- `AITokenLimitError` - Token-Limit-Überschreitungen

### **System- und Infrastrukturfehler**
- `FileSystemError` - Dateisystem-Fehler
- `ConfigError` - Konfigurationsfehler
- `ToolExecutionError` - Tool-Ausführungsfehler

### **API-Fehlerklassen**
- `APIError` - Allgemeine API-Fehler
- `ValidationError` - Validierungsfehler

## 🔧 **Utility-Funktionen**

### **Fehler-Erkennung & Konvertierung**
- `isBaseError()` - Prüft ob Fehler bereits BaseError ist
- `toBaseError()` - Wandelt beliebige Fehler in BaseError um
- `formatErrorResponse()` - Formatiert Fehler für API-Antwort

### **Logging & Handling**
- `logError()` - Sichert Fehlerlogging mit Metadaten
- `errorResponse()` - HTTP-kompatible Fehlerantwort für Express

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. BaseError Klasse**
```typescript
class BaseError extends Error
```
**Eigenschaften**:
- `code` - Standardisierter Fehlercode (z.B. "ERR_AI_PROVIDER")
- `status` - HTTP-Statuscode
- `details` - Zusätzliche Fehlerdetails
- `timestamp` - ISO-Zeitstempel
- `toJSON()` - Serialisierung für API-Antworten

### **2. KI-Provider Fehler**
```typescript
AIProviderError(provider: string, message: string, details?)
```
- **Status**: 502 (Bad Gateway)
- **Use Case**: OpenAI, Anthropic, etc. Provider-Fehler

### **3. KI-Timeout Fehler**
```typescript
AITimeoutError(durationMs: number, provider?: string)
```
- **Status**: 504 (Gateway Timeout)
- **Details**: Dauer und betroffener Provider

### **4. Token-Limit Fehler**
```typescript
AITokenLimitError(limit: number, used: number)
```
- **Status**: 413 (Payload Too Large)
- **Details**: Limit und verwendete Token

### **5. Tool-Execution Fehler**
```typescript
ToolExecutionError(toolName: string, message: string, details?)
```
- **Use Case**: Fehler bei Datenbank-, File- oder ERP-Tools

### **6. Validation Fehler**
```typescript
ValidationError(message: string, field?: string, details?)
```
- **Status**: 400 (Bad Request)
- **Features**: Feld-spezifische Validierungsfehler

## 🛡️ **Fehler-Handling Utilities**

### **Fehler-Erkennung**
```typescript
isBaseError(err: any): err is BaseError
```
- Prüft Instanz-Typ
- TypeScript Type Guard

### **Fehler-Konvertierung**
```typescript
toBaseError(err: unknown, context: string): BaseError
```
- Wandelt native Errors in BaseError um
- Automatisches Logging des Originalfehlers
- Context-Parameter für bessere Nachverfolgung

### **API-Response Formatierung**
```typescript
formatErrorResponse(err: any): Record<string, any>
```
**Ausgabeformat**:
```json
{
  "error": {
    "code": "ERR_AI_PROVIDER",
    "message": "KI-Provider-Fehler...",
    "status": 502,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "details": {}
  }
}
```

### **HTTP-Fehlerantwort**
```typescript
errorResponse(res: Response, code: number, message: string, err?: unknown): Response
```
**Features**:
- Einheitliches JSON-Response-Format
- Automatisches Error-Logging
- HTTP-Statuscode Integration
- Stack-Trace Protokollierung

## 📊 **Logging-Integration**

### **Strukturierte Fehlerprotokollierung**
- **Context-Tracking**: Fehlerkontext für bessere Diagnose
- **Metadata**: Code, Status, Details
- **Stack-Traces**: Ursprüngliche Fehlerherkunft

### **Log-Levels**
- `error` - Für alle BaseError Instanzen
- `warn` - Für nicht-kritische Fehler

## 🎯 **Use Cases**

### **KI-Provider Integration**
- Timeout-Management bei langsamen KI-Antworten
- Token-Limit-Überwachung
- Provider-spezifische Fehlerbehandlung

### **API-Validierung**
- Eingabevalidierung mit Feld-spezifischen Fehlern
- Strukturierte Fehlerrückmeldungen an Frontend

### **Tool-Execution**
- Fehlerbehandlung bei Datenbankoperationen
- File-System-Operation Fehlermanagement
- ERP-Tool Fehlerpropagierung

### **System-Konfiguration**
- Konfigurationsfehler bei Provider-Einrichtung
- Umgebungsvariablen Validierung

## 🔧 **Integration**

### **Express.js Compatibility**
- Direkte Integration mit Response-Objekten
- Middleware-ready Fehlerbehandlung
- Standardisiertes JSON-Response-Format

### **TypeScript Support**
- Vollständige Typisierung aller Fehlerklassen
- Type Guards für sichere Fehlerbehandlung
- Generische Details-Unterstützung

Das Error Handling System bietet eine umfassende, standardisierte Fehlerbehandlung für das ERP-KI-Backend mit Fokus auf KI-spezifische Szenarien, API-Kompatibilität und Developer Experience.

Basierend auf der analysierten `fileUtils.ts` Datei, hier sind die erkannten Funktionen und Features:

## 📁 **File Utilities System - Hauptfunktionen**

### **Basis-Pfad-Operationen**
- `pathExists()` - Prüft Existenz von Dateien/Ordnern
- `ensureDir()` - Erstellt Verzeichnisse (rekursiv)
- `getFileSize()` - Liefert Dateigröße in Bytes
- `relativeToRoot()` - Erzeugt relativen Pfad ab Projektstamm

### **Datei-Lese/Schreib-Operationen**
- `readTextFile()` - Liest Textdateien (UTF-8)
- `writeTextFile()` - Schreibt Textdateien (atomisch mit Backup)
- `deleteFile()` - Löscht Dateien sicher

### **JSON & YAML Handler**
- `readJsonFile()` - Liest JSON-Dateien mit Fallback
- `writeJsonFile()` - Schreibt JSON formatiert
- `readYamlFile()` - Liest YAML-Dateien
- `writeYamlFile()` - Schreibt YAML-Dateien

### **Temporäre Dateien & Verzeichnis-Operationen**
- `createTempFile()` - Erstellt temporäre Dateien
- `listFilesInDir()` - Listet Dateien in Verzeichnis
- `isReadable()` - Prüft Lesbarkeit
- `isWritable()` - Prüft Beschreibbarkeit

### **Datei-Informationen**
- `getFileInfo()` - Liefert umfassende Datei-Informationen

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Sichere Dateioperationen**
```typescript
readTextFile(filePath: string): Promise<string>
```
**Features**:
- UTF-8 Kodierung
- Fehlerlogging bei Lesefehlern
- FileSystemError bei Problemen

### **2. Atomisches Schreiben mit Backup**
```typescript
writeTextFile(filePath: string, content: string): Promise<void>
```
**Sicherheitsmechanismen**:
- **Automatische Backup-Erstellung** mit Zeitstempel
- **Atomisches Schreiben** über temporäre Datei
- **Verzeichnis-Erstellung** falls nicht vorhanden
- **Größen-Protokollierung**

### **3. JSON-Operationen mit Fehlertoleranz**
```typescript
readJsonFile<T = any>(filePath: string): Promise<T>
```
**Fehlerbehandlung**:
- Fallback auf leeres Objekt bei Fehlern
- Warn-Logging statt Fehler
- TypeScript Generic Support

### **4. Temporäre Dateien-Management**
```typescript
createTempFile(prefix = "tmp_", content = ""): Promise<string>
```
**Eigenschaften**:
- System-Temp-Verzeichnis Nutzung
- Zeitstempel-basierte Namen
- Optionale Vorbelegung mit Inhalt

### **5. Datei-Zugriffsrechte**
```typescript
isReadable(filePath: string): boolean
isWritable(filePath: string): boolean
```
**Prüfungen**:
- FS Constants `R_OK` und `W_OK`
- Exception-basierte Rückgabe
- Synchron für sofortige Ergebnisse

## 🛡️ **Sicherheitsfeatures**

### **Data Integrity**
- **Atomic Writes**: Verhindert Datenverlust bei Abbruch
- **Automatic Backups**: `.bak_${timestamp}` Sicherungen
- **Error Recovery**: Fehlertolerante JSON-Operationen

### **File System Safety**
- **Recursive Directory Creation**: Automatische Pfaderstellung
- **Path Validation**: Existenzprüfungen vor Operationen
- **Permission Checks**: Zugriffsrechte-Validierung

## 📊 **File Information System**

### **Umfassende Datei-Statistiken**
```typescript
getFileInfo(filePath: string)
```
**Gelieferte Informationen**:
- `exists` - Existenzstatus
- `size_bytes` - Dateigröße
- `modified` - Änderungszeitpunkt (ISO)
- `created` - Erstellungszeitpunkt (ISO)
- `readable` - Lesbarkeit
- `writable` - Beschreibbarkeit

## 🔄 **Performance & Reliability**

### **Optimierte Operationen**
- **Async/Promise-basiert**: Nicht-blockierende Operationen
- **Synchron für Checks**: Schnelle Existenzprüfungen
- **Buffer-basierte Größen**: Effiziente Größenberechnung

### **Robust Error Handling**
- **Structured Logging**: Kontextreiche Fehlerprotokollierung
- **Graceful Degradation**: Fallbacks für nicht-kritische Fehler
- **Detailed Error Context**: Dateipfad und Fehlerdetails

## 🎯 **Use Cases**

### **KI-Konfigurationsdateien**
- Model-Configurations (JSON/YAML)
- Provider-Settings
- Workflow-Definitionen

### **Daten-Persistierung**
- Cache-Dateien
- Session-Speicherung
- Temporäre Verarbeitungsdateien

### **System-Operationen**
- Log-Rotation
- Backup-Management
- Temp-File Cleaning

## 🔧 **Integration**

### **Error System Compatibility**
- `FileSystemError` Integration für einheitliche Fehlerbehandlung
- Strukturierte Logging mit `log()` Funktion
- TypeScript volle Unterstützung

### **File Format Support**
- **Text**: UTF-8 encoded
- **JSON**: Mit Pretty-Print Option
- **YAML**: Vollständige YAML-Parsing Unterstützung
- **Binary**: Über Größenabfragen und Temp-Files

### **Cross-Platform Compatibility**
- **OS-Tempdir**: Plattformunabhängige Temp-Verzeichnisse
- **Path Normalization**: Konsistente Pfadtrennung
- **Permission Handling**: OS-spezifische Zugriffsrechte

Die File Utilities bieten ein umfassendes, sicheres Dateisystem für das ERP-KI-Backend mit Fokus auf Datenintegrität, Fehlertoleranz und Cross-Platform-Kompatibilität.

Basierend auf der analysierten `helpers.ts` Datei, hier sind die erkannten Funktionen und Features:

## 🔧 **Helpers System - Hauptfunktionen**

### **Zeit & Performance**
- `measureExecutionTime()` - Misst Laufzeit asynchroner Funktionen
- `formatDuration()` - Formatiert Millisekunden in lesbare Zeit

### **JSON & Objekt-Operationen**
- `safeJsonParse()` - Sicheres JSON-Parsing mit Fallback
- `safeJsonStringify()` - Sicheres JSON-Stringify
- `deepClone()` - Tiefe Kopie von Objekten
- `deepMergeLoose()` - Rekursives Zusammenführen von Objekten
- `deepEqual()` - Inhaltlicher Objektvergleich
- `isPlainObject()` - Prüfung auf einfache Objekte

### **Text- & Formatierungshilfen**
- `truncateText()` - Kürzt lange Texte
- `sanitizeString()` - Entfernt Steuerzeichen
- `stripHtmlTags()` - Entfernt HTML-Tags
- `normalizeLineEndings()` - Normalisiert Zeilenumbrüche

### **Pfad- & Dateihilfen**
- `normalizePath()` - Systemübergreifende Pfadnormalisierung
- `relativeToRoot()` - Relativer Pfad ab Projektstamm
- `getBaseName()` - Dateiname ohne Endung
- `timestampedFileName()` - Eindeutiger Dateiname mit Zeitstempel

### **IDs, Zeitstempel & Zufall**
- `createUUID()` - Erstellt UUID v4
- `shortId()` - Erzeugt Kurz-ID für Sessions/Logs
- `nowISO()` - Aktueller ISO-Zeitstempel

### **Typprüfungen & Guards**
- `isObject()` - Prüft auf Objekt-Typ
- `isEmpty()` - Prüft auf leere Werte
- `isValidUrl()` - Validiert URL-Strings

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Performance Monitoring**
```typescript
measureExecutionTime<T>(label: string, fn: () => Promise<T>)
```
**Ausgabe**: 
- `result` - Funktionsergebnis
- `durationMs` - Gemessene Zeit in Millisekunden
- **Automatisches Logging** mit Label und Dauer

### **2. Sichere JSON-Operationen**
```typescript
safeJsonParse<T = any>(input: string, fallback: T = {} as T): T
```
**Features**:
- Fallback bei Parse-Fehlern
- TypeScript Generic Support
- Keine Exception-Würfe

### **3. Tiefe Objekt-Manipulation**
```typescript
deepClone<T>(obj: T): T
```
**Implementierung**:
- Primär: `structuredClone()` (schnell)
- Fallback: `JSON.parse(JSON.stringify())` (robust)

### **4. Rekursives Merging**
```typescript
deepMergeLoose<T extends Record<string, any>>(target: T, source: Partial<T>): T
```
**Verhalten**:
- Arrays werden ersetzt (nicht gemerged)
- Objekte werden rekursiv gemerged
- Primitivwerte werden überschrieben

### **5. Text-Sanitization**
```typescript
sanitizeString(input: string): string
```
**Entfernt**:
- Steuerzeichen (`\x00-\x1F`)
- DEL-Zeichen (`\x7F`)
- Führende/abschließende Leerzeichen

### **6. Pfad-Management**
```typescript
normalizePath(p: string): string
```
**Normalisierung**:
- Konsistente Pfadtrennung (`/`)
- Relative Pfadauflösung
- Redundante Separator-Entfernung

### **7. ID-Generierung**
```typescript
createUUID(): string        // Crypto-basierte UUID v4
shortId(prefix = "id"): string // Kurze lesbare ID (z.B. "id_a1b2c3")
```

## 🛡️ **Sicherheitsfeatures**

### **Data Sanitization**
- **HTML Stripping**: Entfernt potentielle XSS-Vektoren
- **Control Character Removal**: Verhindert Injection-Angriffe
- **JSON Safety**: Vermeidet Prototype Pollution

### **Input Validation**
- **URL Validation**: Echte URL-Validierung via URL-Klasse
- **Type Guards**: Sichere Typprüfungen für Runtime
- **Empty Checks**: Umfassende Leerwert-Erkennung

## 📊 **Performance Optimizations**

### **Efficient Algorithms**
- **Structured Clone**: Moderne Browser/Node.js Optimierung
- **JSON Fallback**: Robuste Alternative
- **Performance Timing**: High-Resolution Zeitmessung

### **Memory Management**
- **Shallow Operations**: Wo möglich
- **Efficient String Handling**: Minimale Kopien
- **Lazy Evaluation**: Nur notwendige Operationen

## 🎯 **Use Cases**

### **KI-Response Verarbeitung**
- JSON-Sicherheit für KI-Antworten
- Text-Trunkierung für Logging
- HTML-Bereinigung für sichere Ausgaben

### **Konfigurationsmanagement**
- Deep Merge für Settings-Overrides
- Objekt-Vergleich für Change Detection
- Sichere Serialisierung für Persistierung

### **Session & Cache Management**
- UUID-Generierung für Sessions
- Kurz-IDs für Request-Tracking
- Zeitstempel für Expiry-Berechnung

### **File System Operations**
- Pfadnormalisierung für Cross-Platform
- Zeitstempel-Dateinamen für Backups
- Basisnamen-Extraktion für Logging

## 🔧 **Integration**

### **Logging System**
- Integrierte Performance-Logging
- Fehlerprotokollierung bei JSON-Problemen
- Strukturierte Metriken-Ausgabe

### **TypeScript Support**
- **Generic Types**: Vollständige Typunterstützung
- **Type Guards**: Runtime-Typsicherheit
- **Interface Compliance**: Kompatibel mit KI-System-Typen

### **Cross-Platform Compatibility**
- **Path Normalization**: Windows/Linux/macOS Unterstützung
- **Line Ending Handling**: Konsistente Textverarbeitung
- **Crypto Standards**: Plattformunabhängige UUID-Generierung

Die Helpers bieten eine umfassende Sammlung universeller Hilfsfunktionen für das ERP-KI-Backend mit Fokus auf Performance, Sicherheit und Developer Experience.

Basierend auf der analysierten `helpers.ts` Datei, hier sind die erkannten Funktionen und Features:

## 🔧 **Helpers System - Hauptfunktionen**

### **Zeit & Performance**
- `measureExecutionTime()` - Misst Laufzeit asynchroner Funktionen
- `formatDuration()` - Formatiert Millisekunden in lesbare Zeit

### **JSON & Objekt-Operationen**
- `safeJsonParse()` - Sicheres JSON-Parsing mit Fallback
- `safeJsonStringify()` - Sicheres JSON-Stringify
- `deepClone()` - Tiefe Kopie von Objekten
- `deepMergeLoose()` - Rekursives Zusammenführen von Objekten
- `deepEqual()` - Inhaltlicher Objektvergleich
- `isPlainObject()` - Prüfung auf einfache Objekte

### **Text- & Formatierungshilfen**
- `truncateText()` - Kürzt lange Texte
- `sanitizeString()` - Entfernt Steuerzeichen
- `stripHtmlTags()` - Entfernt HTML-Tags
- `normalizeLineEndings()` - Normalisiert Zeilenumbrüche

### **Pfad- & Dateihilfen**
- `normalizePath()` - Systemübergreifende Pfadnormalisierung
- `relativeToRoot()` - Relativer Pfad ab Projektstamm
- `getBaseName()` - Dateiname ohne Endung
- `timestampedFileName()` - Eindeutiger Dateiname mit Zeitstempel

### **IDs, Zeitstempel & Zufall**
- `createUUID()` - Erstellt UUID v4
- `shortId()` - Erzeugt Kurz-ID für Sessions/Logs
- `nowISO()` - Aktueller ISO-Zeitstempel

### **Typprüfungen & Guards**
- `isObject()` - Prüft auf Objekt-Typ
- `isEmpty()` - Prüft auf leere Werte
- `isValidUrl()` - Validiert URL-Strings

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Performance Monitoring**
```typescript
measureExecutionTime<T>(label: string, fn: () => Promise<T>)
```
**Ausgabe**: 
- `result` - Funktionsergebnis
- `durationMs` - Gemessene Zeit in Millisekunden
- **Automatisches Logging** mit Label und Dauer

### **2. Sichere JSON-Operationen**
```typescript
safeJsonParse<T = any>(input: string, fallback: T = {} as T): T
```
**Features**:
- Fallback bei Parse-Fehlern
- TypeScript Generic Support
- Keine Exception-Würfe

### **3. Tiefe Objekt-Manipulation**
```typescript
deepClone<T>(obj: T): T
```
**Implementierung**:
- Primär: `structuredClone()` (schnell)
- Fallback: `JSON.parse(JSON.stringify())` (robust)

### **4. Rekursives Merging**
```typescript
deepMergeLoose<T extends Record<string, any>>(target: T, source: Partial<T>): T
```
**Verhalten**:
- Arrays werden ersetzt (nicht gemerged)
- Objekte werden rekursiv gemerged
- Primitivwerte werden überschrieben

### **5. Text-Sanitization**
```typescript
sanitizeString(input: string): string
```
**Entfernt**:
- Steuerzeichen (`\x00-\x1F`)
- DEL-Zeichen (`\x7F`)
- Führende/abschließende Leerzeichen

### **6. Pfad-Management**
```typescript
normalizePath(p: string): string
```
**Normalisierung**:
- Konsistente Pfadtrennung (`/`)
- Relative Pfadauflösung
- Redundante Separator-Entfernung

### **7. ID-Generierung**
```typescript
createUUID(): string        // Crypto-basierte UUID v4
shortId(prefix = "id"): string // Kurze lesbare ID (z.B. "id_a1b2c3")
```

## 🛡️ **Sicherheitsfeatures**

### **Data Sanitization**
- **HTML Stripping**: Entfernt potentielle XSS-Vektoren
- **Control Character Removal**: Verhindert Injection-Angriffe
- **JSON Safety**: Vermeidet Prototype Pollution

### **Input Validation**
- **URL Validation**: Echte URL-Validierung via URL-Klasse
- **Type Guards**: Sichere Typprüfungen für Runtime
- **Empty Checks**: Umfassende Leerwert-Erkennung

## 📊 **Performance Optimizations**

### **Efficient Algorithms**
- **Structured Clone**: Moderne Browser/Node.js Optimierung
- **JSON Fallback**: Robuste Alternative
- **Performance Timing**: High-Resolution Zeitmessung

### **Memory Management**
- **Shallow Operations**: Wo möglich
- **Efficient String Handling**: Minimale Kopien
- **Lazy Evaluation**: Nur notwendige Operationen

## 🎯 **Use Cases**

### **KI-Response Verarbeitung**
- JSON-Sicherheit für KI-Antworten
- Text-Trunkierung für Logging
- HTML-Bereinigung für sichere Ausgaben

### **Konfigurationsmanagement**
- Deep Merge für Settings-Overrides
- Objekt-Vergleich für Change Detection
- Sichere Serialisierung für Persistierung

### **Session & Cache Management**
- UUID-Generierung für Sessions
- Kurz-IDs für Request-Tracking
- Zeitstempel für Expiry-Berechnung

### **File System Operations**
- Pfadnormalisierung für Cross-Platform
- Zeitstempel-Dateinamen für Backups
- Basisnamen-Extraktion für Logging

## 🔧 **Integration**

### **Logging System**
- Integrierte Performance-Logging
- Fehlerprotokollierung bei JSON-Problemen
- Strukturierte Metriken-Ausgabe

### **TypeScript Support**
- **Generic Types**: Vollständige Typunterstützung
- **Type Guards**: Runtime-Typsicherheit
- **Interface Compliance**: Kompatibel mit KI-System-Typen

### **Cross-Platform Compatibility**
- **Path Normalization**: Windows/Linux/macOS Unterstützung
- **Line Ending Handling**: Konsistente Textverarbeitung
- **Crypto Standards**: Plattformunabhängige UUID-Generierung

Die Helpers bieten eine umfassende Sammlung universeller Hilfsfunktionen für das ERP-KI-Backend mit Fokus auf Performance, Sicherheit und Developer Experience.

Basierend auf der analysierten `logger.ts` Datei, hier sind die erkannten Funktionen und Features:

## 📝 **Logger System - Hauptfunktionen**

### **Kern-Logging-Funktionen**
- `log()` - Zentrale Logfunktion mit JSON-Ausgabe
- `debugLog()` - Bedingte Debug-Ausgabe (nur Development)
- `errorResponse()` - Standardisierte Fehlerantwort für Express
- `nowISO()` - Zeitstempel-Generator

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Haupt-Logging-Funktion**
```typescript
log(level: LogLevel, msg: string, data?: any): void
```
**Log-Level**:
- `info` - Cyan (Informationen)
- `warn` - Gelb (Warnungen)
- `error` - Rot (Fehler)
- `debug` - Magenta (Debug-Informationen)

**Ausgabe-Format**:
```json
{
  "ts": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "msg": "Log-Nachricht",
  "data": { /* optionale Metadaten */ }
}
```

### **2. Bedingtes Debug-Logging**
```typescript
debugLog(msg: string, data?: any)
```
**Aktivierung**: Nur wenn `NODE_ENV=development`
**Use Case**: Entwicklungs-spezifische Debug-Informationen

### **3. HTTP-Fehlerantwort**
```typescript
errorResponse(res: any, code: number, msg: string, err?: any)
```
**Response-Format**:
```json
{
  "success": false,
  "error": "Fehlermeldung",
  "detail": "Fehlerdetails",
  "ts": "2024-01-01T12:00:00.000Z"
}
```

## ⚙️ **Konfiguration & Features**

### **Umgebungsvariablen**
- `LOG_TO_FILE="true"` - Aktiviert Datei-Logging
- `NODE_ENV="development"` - Aktiviert Debug-Logging
- `SEND_ERROR_LOGS="true"` - (Geplant) Remote-Logging

### **Datei-Logging**
- **Verzeichnis**: `logs/` (automatische Erstellung)
- **Dateiname**: `app_YYYY-MM-DD.log`
- **Format**: JSON-Lines (ein Eintrag pro Zeile)

### **Farbcodierung (CLI)**
- **TTY-Erkennung**: Automatische Farbaktivierung
- **Farbpalette**: 
  - Cyan → Info
  - Gelb → Warn
  - Rot → Error  
  - Magenta → Debug

## 🎯 **Use Cases**

### **KI-System Monitoring**
- Provider-Antwortzeiten
- Token-Verbrauch
- Model-Wechsel

### **Fehlerbehandlung**
- API-Request-Fehler
- Tool-Execution-Fehler
- System-Fehler

### **Performance-Tracking**
- Laufzeit-Messungen
- Cache-Hit/Miss Rates
- Workflow-Execution

## 🔧 **Integration**

### **Express.js Compatibility**
- Direkte Integration mit Response-Objekten
- Standardisiertes Error-Response-Format
- HTTP-Statuscode Unterstützung

### **Development vs Production**
- **Development**: Farbige CLI + Debug-Logs
- **Production**: JSON-Lines Format
- **Beide**: Optionale Datei-Persistierung

### **Extensibility**
- **Remote-Logging**: Vorbereitet für externe Systeme
- **Structured Data**: Erweiterbare Metadaten
- **JSON-Lines**: Einfache Parsing mit Log-Tools

Das Logger System bietet eine flexible, strukturierte Logging-Lösung für das ERP-KI-Backend mit Unterstützung für verschiedene Ausgabeformate, Level und Integrationsszenarien.

Basierend auf der analysierten `validation.ts` Datei, hier sind die erkannten Funktionen und Features:

## ✅ **Validation System - Hauptfunktionen**

### **Grundlegende Typprüfungen**
- `isString()` - Prüft auf String-Typ
- `isNumber()` - Prüft auf Number-Typ (ohne NaN)
- `isBoolean()` - Prüft auf Boolean-Typ
- `isArray()` - Prüft auf Array-Typ
- `isObject()` - Prüft auf einfache Objekte

### **Schema-Validierung**
- `validateSchema()` - Führt Schema-Validierung mit optionalen Feldern durch

### **KI-spezifische Validierungen**
- `validateModelName()` - Validiert KI-Modell-Namen
- `validateAIConfig()` - Prüft KI-Konfigurationsobjekte
- `validateChatMessages()` - Validiert Chat-Nachrichten-Arrays

### **Sicherheitsvalidierungen**
- `sanitizeInput()` - Bereinigt Eingabestrings
- `containsInjectionRisk()` - Prüft auf Injection-Risiken

### **Utility-Validierungen**
- `validateFileExtension()` - Prüft Dateiendungen
- `isInRange()` - Prüft Zahlenbereiche
- `hasKey()` - Typsichere Eigenschaftsprüfung
- `logValidationErrors()` - Logging-Wrapper für Validierungsfehler

## 📋 **Detailierte Funktionsbeschreibungen**

### **1. Schema-Validierung**
```typescript
validateSchema<T>(obj: any, schema: Record<keyof T, string>, options?: { allowExtra?: boolean })
```
**Features**:
- **Optionale Felder**: Unterstützung für `"string?"`, `"number?"` etc.
- **Typprüfung**: String, Number, Boolean, Array, Object
- **Extra-Feld-Kontrolle**: `allowExtra` Option für unbekannte Felder
- **Strukturierte Fehler**: Detaillierte Fehlermeldungen pro Feld

### **2. KI-Konfigurationsvalidierung**
```typescript
validateAIConfig(config: Record<string, any>): { valid: boolean; issues: string[] }
```
**Pflichtfelder**:
- `provider` - String (KI-Provider)
- `model` - String (valider Modellname)

**Optionale Felder**:
- `temperature` - Number
- `max_tokens` - Positive Number

### **3. Chat-Nachrichten-Validierung**
```typescript
validateChatMessages(messages: any[]): { valid: boolean; errors: string[] }
```
**Anforderungen**:
- **Rollen**: Nur `system`, `user`, `assistant`
- **Content**: Muss String sein
- **Struktur**: Muss Array von Objekten sein

### **4. Sicherheitsprüfungen**
```typescript
sanitizeInput(input: string): string
```
**Entfernt Zeichen**: `<`, `>`, `;`, `$`, `` ` ``
**Use Case**: XSS und Injection Prevention

## 🛡️ **Sicherheitsfeatures**

### **Injection Detection**
```typescript
containsInjectionRisk(input: string): boolean
```
**Erkennungsmuster**: `[;$`<>]` - Häufige Injection-Zeichen

### **Model Name Security**
```typescript
validateModelName(model: string): boolean
```
**Erlaubte Zeichen**: `a-zA-Z0-9._-` (Keine Sonderzeichen)

## 🔧 **Utility-Funktionen**

### **Dateityp-Validierung**
```typescript
validateFileExtension(filename: string, allowed: string[]): boolean
```
**Case-Insensitive**: Automatische Kleinbuchstaben-Konvertierung

### **Bereichsprüfung**
```typescript
isInRange(value: number, min: number, max: number): boolean
```
**Inklusive Ränder**: `>= min` und `<= max`

### **Typsichere Eigenschaftsprüfung**
```typescript
hasKey<T>(obj: T, key: PropertyKey): key is keyof T
```
**TypeScript Feature**: Type Guard für Objekteigenschaften

## 📊 **Error Handling & Logging**

### **Strukturierte Validierungsantworten**
```typescript
{ valid: boolean; errors: string[] }
{ valid: boolean; issues: string[] }
```

### **Automatisches Logging**
```typescript
logValidationErrors(context: string, errors: string[])
```
**Features**:
- Nur bei tatsächlichen Fehlern
- Kontext-Information für Tracing
- Warn-Level für Validierungsprobleme

## 🎯 **Use Cases**

### **API-Request-Validierung**
- Eingabedaten-Schema-Prüfung
- Pflichtfeld-Validierung
- Typ-Sicherheit für Request-Bodies

### **KI-Konfigurationsmanagement**
- Provider-Konfigurationsvalidierung
- Model-Parameter-Bereichsprüfung
- Chat-History-Integrität

### **Sicherheits-Checks**
- User-Input-Sanitisierung
- Injection-Risiko-Erkennung
- File-Upload-Validierung

### **System-Konfiguration**
- Settings-Objekte-Validierung
- Environment-Variable-Checks
- Cross-Platform Pfadvalidierung

## 🔧 **Integration**

### **TypeScript Support**
- **Type Guards**: `isString`, `isNumber` etc.
- **Generic Types**: `validateSchema<T>` mit Typinferenz
- **Keyof Operator**: Typsichere Schema-Definition

### **Error System Compatibility**
- Strukturierte Fehlerarrays für detaillierte Rückmeldungen
- Logging-Integration für Validierungsprobleme
- Keine Exception-Würfe (nur return-basierte Fehler)

### **KI-System Spezifisch**
- Modellname-Validierung für verschiedene Provider
- Chat-Message-Struktur für KI-Kompatibilität
- Konfigurationsparameter für Temperature, Tokens etc.

Das Validation System bietet eine umfassende, typsichere Validierungslösung für das ERP-KI-Backend mit Fokus auf Sicherheit, KI-spezifische Anforderungen und Developer Experience.