Basierend auf der analysierten `audioService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🎙️ **Audio Service - Hauptfunktionen**

### **Spracherkennung (Speech-to-Text)**

- `transcribeAudio(filePath)` - Wandelt Audio in Text um (Whisper)

### **Sprachausgabe (Text-to-Speech)**

- `textToSpeech(text, outputPath)` - Erstellt Sprachdatei aus Text

### **Service-Tests**

- `testAudioEndpoints()` - Prüft Verfügbarkeit der Audio-Endpoints

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  config: audioConfig, // Service-Konfiguration
  transcribeAudio, // Spracherkennung
  textToSpeech, // Sprachausgabe
  testAudioEndpoints, // Endpoint-Tests
};
```

## ⚙️ **Konfigurationssystem**

### **Umgebungsvariablen**

- `OPENAI_API_KEY` - API-Schlüssel (erforderlich für beide Dienste)
- `AUDIO_MODEL` - Whisper Modell (Default: "whisper-1")
- `TTS_VOICE` - TTS Stimme (Default: "alloy")

### **Service-Konfiguration**

```typescript
audioConfig: AIModuleConfig {
  name: "audioService",
  provider: "openai",
  model: string,                    // Whisper Modell
  description: string,              // Service-Beschreibung
  capabilities: string[],           // Unterstützte Funktionen
  active: boolean,                  // Aktivierungsstatus
  timeout_ms: number                // 120000ms (2 Minuten)
}
```

## 🎤 **Spracherkennung (Whisper)**

### **Unterstützte Audio-Formate**

- WAV, MP3, M4A, und andere gängige Formate

### **API-Integration**

- **Endpoint**: `https://api.openai.com/v1/audio/transcriptions`
- **Methode**: POST mit FormData
- **Parameter**:
  - `file` - Audio-Datei
  - `model` - Whisper Modell

### **Response-Verarbeitung**

- **Sicheres Parsing** - Type-Safe Response Handling
- **Fehlerbehandlung** - Robuste Error Management
- **Logging** - Detaillierte Protokollierung

### **Response-Struktur**

```typescript
AIResponse {
  text: string,                    // Transkribierter Text
  meta: {
    provider: "openai",
    model: string,                 // Verwendetes Modell
    source: string,                // Dateiname
    time_ms: number                // Timeout-Wert
  },
  errors?: string[]                // Bei Fehlern
}
```

## 🔊 **Sprachausgabe (TTS)**

### **TTS-Features**

- **Modell**: `gpt-4o-mini-tts` (OpenAI TTS)
- **Stimmen**: "alloy" (Standard), andere OpenAI TTS Voices
- **Format**: MP3 Ausgabe

### **API-Integration**

- **Endpoint**: `https://api.openai.com/v1/audio/speech`
- **Methode**: POST mit JSON Body
- **Parameter**:
  - `model` - TTS Modell
  - `voice` - Stimme
  - `input` - Text für Sprachausgabe

### **Datei-Management**

- **Automatische Ordner-Erstellung** - `output/` Verzeichnis
- **Dateinamen-Generierung** - `tts_{timestamp}.mp3`
- **Buffer-Verarbeitung** - Effiziente Datei-Erstellung

## 🧪 **Health Check & Testing**

### **Endpoint-Tests**

```typescript
testAudioEndpoints(): Promise<{
  whisper: boolean,    // Whisper API verfügbar
  tts: boolean         // TTS API verfügbar
}>
```

### **Test-Implementierung**

- **API-Modell-Liste** - Abruf verfügbarer Modelle
- **Modell-Erkennung** - Prüfung auf "whisper-1" und TTS-Modelle
- **Fehlertoleranz** - Graceful Degradation bei Fehlern

## 🛡️ **Fehlerbehandlung**

### **Transkriptions-Fehler**

- Datei-Existenz-Prüfung
- API-Key Validierung
- HTTP Status Code Überprüfung
- Response Format Validierung

### **TTS-Fehler**

- Ausgabe-Pfad Validierung
- API-Key Prüfung
- Netzwerk-Fehlerbehandlung
- Datei-Schreib-Operationen

### **Allgemeine Sicherheitsmaßnahmen**

- **Type Safety** - Unknown Type Handling
- **Timeout Management** - 2 Minuten Timeout
- **Resource Cleanup** - Ordnermanagement

## 📁 **Datei-Management**

### **Eingabe**

- Relative/Absolute Pfade unterstützt
- Datei-Existenz-Prüfung
- Format-Unterstützung

### **Ausgabe**

- Automatische Output-Ordner-Erstellung
- Zeitstempel-basierte Dateinamen
- MP3 Format für Kompatibilität

## 🔄 **Integration**

### **Capabilities**

- `audio` - Audio-Verarbeitung
- `tools` - Tool-Integration
- `json` - JSON Response Format

### **Provider-Anbindung**

- OpenAI API Integration
- Kompatibel mit KI-Subsystem
- Einheitliche Response-Strukturen

Der Audio Service bietet eine vollständige Audio-Verarbeitungslösung mit Spracherkennung und Sprachausgabe, integriert in das ERP-KI-System mit robustem Fehlerhandling und Type-Safety.

Basierend auf der analysierten `chatService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Chat Service - Hauptfunktionen**

### **Kern-Chat-Funktionen**

- `handleChatRequest(model, messages, options)` - Zentrale Chat-Anfrage-Verarbeitung
- `handleWorkflow(name, input)` - Workflow-Ausführung
- `getProviderStatus()` - Status aller Provider abfragen
- `getChatSystemInfo()` - Systeminformationen abrufen

### **Tool-Integration**

- `executeToolCalls(toolCalls)` - Führt Tool-Aufrufe aus

### **Provider-Verfügbarkeit**

- `isProviderAvailable(provider)` - Prüft Provider-Verfügbarkeit

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  handleChatRequest, // Haupt-Chat-Funktion
  handleWorkflow, // Workflow-Verwaltung
  getProviderStatus, // Provider-Status
  getChatSystemInfo, // System-Informationen
};
```

## 🔄 **Provider-Routing-System**

### **Unterstützte Provider**

1. **`openai`** - OpenAI GPT-Modelle
2. **`azure` / `azureopenai`** - Azure OpenAI Service
3. **`vertex`** - Google Vertex AI (Gemini)
4. **`ollama`** - Lokale Ollama-Instanz
5. **`huggingface`** - HuggingFace Inference API
6. **`local`** - Lokale Modelle
7. **`llama` / `llamacpp`** - Llama.cpp Server
8. **`custom`** - Benutzerdefinierte APIs

### **Routing-Logik**

- **Umgebungsvariable**: `AI_PROVIDER` (Standard: "ollama")
- **Option Override**: `options.provider` überschreibt Standard
- **Fallback-System**: Automatischer Fallback bei Fehlern

## ⚙️ **Konfigurationssystem**

### **Umgebungsvariablen**

- `AI_PROVIDER` - Standard-Provider (Default: "ollama")
- `AI_FALLBACK_ENABLED` - Fallback aktivieren (1/0)

### **Provider-spezifische Konfiguration**

- **OpenAI**: `OPENAI_API_KEY`
- **Ollama**: Localhost:11434 Verfügbarkeit
- **Vertex AI**: `VERTEX_API_KEY`
- **HuggingFace**: `HUGGINGFACEHUB_API_TOKEN`

## 🛠️ **Tool-Integration**

### **Tool-Execution Flow**

1. **Erkennung**: Tool-Calls in Provider-Response
2. **Ausführung**: Über `toolRegistry.call()`
3. **Ergebnis-Integration**: An Antworttext anhängen
4. **Fehlerbehandlung**: Pro Tool separate Fehlerbehandlung

### **Response-Erweiterung**

```typescript
// Tool-Ergebnisse werden angehängt:
response.text += `\n\n${toolResults.join("\n")}`;
```

## 🔁 **Workflow-Integration**

### **Workflow-Execution**

- **Flexible Methoden-Unterstützung**:
  - `runWorkflow`
  - `execute`
  - `start`
- **Dynamische Erkennung**: Arbeitet mit verschiedenen Workflow-Engine-Implementierungen

### **Workflow-Response**

```typescript
AIResponse {
  text: string,                    // Erfolgsmeldung
  data: any,                       Workflow-Ergebnis
  meta: {
    provider: "workflowEngine",
    workflow: string               // Workflow-Name
  }
}
```

## 📊 **Status & Monitoring**

### **Provider-Status-Check**

```typescript
getProviderStatus(): Promise<Array<{
  provider: string,
  available: boolean
}>>
```

### **Verfügbarkeitsprüfung**

- **OpenAI**: API-Key Vorhandensein
- **Ollama**: Localhost API Erreichbarkeit
- **Vertex AI**: API-Key Vorhandensein
- **HuggingFace**: API-Key Vorhandensein
- **Local**: Immer verfügbar

### **System-Informationen**

```typescript
{
  activeProvider: string,          // Aktiver Provider
  fallbackEnabled: boolean,        // Fallback-Status
  tools: Array,                    // Verfügbare Tools
  workflows: Array                 // Verfügbare Workflows
}
```

## 🛡️ **Fehlerbehandlung & Fallback**

### **Fehlerhierarchie**

1. **Provider-Fehler** - Spezifischer Provider fehlgeschlagen
2. **Fallback-Provider** - `callFallback()` bei aktiviertem Fallback
3. **Error-Response** - Strukturierte Fehlerantwort

### **Fallback-System**

- **Aktivierung**: `AI_FALLBACK_ENABLED=1`
- **Implementation**: `callFallback()` Provider
- **Graceful Degradation**: Statt Abbruch

## 🔄 **Integrations-Punkte**

### **Tool Registry**

- `toolRegistry.getToolDefinitions()` - Tool-Liste
- `toolRegistry.call()` - Tool-Ausführung

### **Workflow Engine**

- `workflowEngine.getWorkflowDefinitions()` - Workflow-Liste
- Dynamische Workflow-Ausführung

## 📈 **Logging & Monitoring**

### **Protokollierung**

- **Start**: Provider, Modell, Nachrichtenanzahl
- **Fehler**: Detaillierte Error-Logs
- **Workflows**: Workflow-Ausführungen

### **Metriken**

- Provider-Verfügbarkeit
- Tool-Ausführungs-Statistiken
- Workflow-Erfolgsraten

Der Chat Service dient als zentrale Steuerungskomponente für das gesamte KI-System mit intelligentem Provider-Routing, umfassender Tool-Integration und robustem Fehlerhandling.

Basierend auf der analysierten `diagnosticService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🩺 **Diagnostic Service - Hauptfunktionen**

### **Hauptdiagnose-Funktion**

- `runSystemDiagnostics()` - Führt vollständige Systemdiagnose durch

### **Einzelkomponenten-Checks**

- `checkProviders()` - Prüft Provider-Verfügbarkeit
- `checkTools()` - Überprüft geladene Tools
- `checkWorkflows()` - Überprüft registrierte Workflows
- `checkAudio()` - Prüft Audio-Systemverfügbarkeit
- `checkSystemInfo()` - Sammelt Systeminformationen

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  runSystemDiagnostics, // Komplette Systemdiagnose
  checkProviders, // Provider-Status
  checkAudio, // Audio-Systemcheck
  checkTools, // Tool-Überprüfung
  checkWorkflows, // Workflow-Check
  checkSystemInfo, // Systeminformationen
};
```

## 📊 **Diagnose-Bereiche**

### **1. Provider-Diagnose**

```typescript
{
  list: Array<{ provider: string, available: boolean }>,
  activeCount: number,      // Verfügbare Provider
  total: number            // Gesamte Provider
}
```

### **2. Tool-Diagnose**

```typescript
{
  count: number,           // Anzahl geladener Tools
  list: string[]           // Tool-Namen Liste
}
```

### **3. Workflow-Diagnose**

```typescript
{
  count: number,           // Anzahl registrierter Workflows
  list: string[]           // Workflow-Namen Liste
}
```

### **4. Audio-System-Diagnose**

```typescript
{
  available: boolean,      // Audio-Services verfügbar
  details: string,         // Details (Whisper/TTS/Fehler)
  model: string           // Konfiguriertes Audio-Modell
}
```

### **5. System-Informationen**

```typescript
{
  hostname: string,        // System-Hostname
  platform: string,        // Betriebssystem
  uptime_min: number,      // Laufzeit in Minuten
  cpu: {
    cores: number,         // CPU-Kerne
    load1: number,         // 1-Minuten Load
    load5: number,         // 5-Minuten Load
    load15: number         // 15-Minuten Load
  },
  memory: {
    totalGB: number,       // Gesamter RAM
    freeGB: number         // Freier RAM
  },
  paths: {
    cwd: string,           // Current Working Directory
    tmp: string,           // Temp-Verzeichnis
    dataDir: string,       // Daten-Verzeichnis
    logDir: string         // Log-Verzeichnis
  }
}
```

## 🔍 **Detailierte Prüfungen**

### **Provider-Verfügbarkeit**

- **Integration**: `getProviderStatus()` aus `chatService`
- **Automatische Prüfung**: Alle konfigurierten Provider
- **Fehlertoleranz**: Graceful Degradation bei Fehlern

### **Audio-System-Prüfung**

- **API-Key Validierung**: `OPENAI_API_KEY` Vorhandensein
- **Modell-Liste**: Abruf verfügbarer OpenAI-Modelle
- **Feature-Erkennung**:
  - `whisper-1` für Spracherkennung
  - `tts`-Modelle für Sprachausgabe
- **HTTP Status Überwachung**: API-Erreichbarkeit

### **Tool & Workflow Inventur**

- **Tool Registry**: `toolRegistry.getToolDefinitions()`
- **Workflow Engine**: `workflowEngine.getWorkflowDefinitions()`
- **Fehlerbehandlung**: Separate Error Handling pro Komponente

## 📈 **Response-Struktur**

### **Hauptdiagnose-Response**

```typescript
AIResponse {
  text: string,                    // Zusammenfassungstext
  data: {
    providers: {...},              // Provider-Status
    system: {...},                 // System-Info
    tools: {...},                  // Tool-Status
    workflows: {...},              // Workflow-Status
    audio: {...}                   // Audio-Status
  },
  meta: {
    provider: "diagnosticService",
    model: "internal-check",
    time_ms: number,               // Zeitstempel
    source: "diagnosticService.ts"
  },
  errors?: string[]                // Bei Fehlern
}
```

### **Zusammenfassungs-Text**

```
🩺 KI-Systemdiagnose abgeschlossen.

📡 Provider aktiv: 3/6
🔧 Tools geladen: 15
⚙️ Workflows registriert: 8
🧠 Speicher: 4.2 GB frei von 16.0 GB
🗣️ Audio verfügbar: Ja (Whisper, TTS)
```

## 🛡️ **Fehlerbehandlung**

### **Robuste Implementierung**

- **Promise.all()**: Parallele Ausführung aller Checks
- **Individual Error Handling**: Jeder Check hat eigenes Try-Catch
- **Graceful Degradation**: Teilweise Ergebnisse bei Teilfehlern

### **Fehlerprotokollierung**

- Detaillierte Error-Logs pro Komponente
- Strukturierte Fehlerinformationen
- Kein Abbruch bei Teilfehlern

## 🔄 **Integrationen**

### **Externe Abhängigkeiten**

- **Chat Service**: `getProviderStatus()`
- **Tool Registry**: Tool-Definitionen
- **Workflow Engine**: Workflow-Definitionen
- **Audio Service**: Konfiguration und Modell-Info

### **System-APIs**

- **OS Module**: CPU, Memory, Uptime Informationen
- **File System**: Pfad-Validierungen
- **Fetch API**: Externe API-Checks (OpenAI)

## 🎯 **Einsatzszenarien**

### **System-Monitoring**

- Regelmäßige Health-Checks
- Provider-Verfügbarkeitsüberwachung
- Ressourcen-Auslastungsmonitoring

### **Debugging & Support**

- Schnelle Problemdiagnose
- Komponenten-Statusüberprüfung
- Systemkonfigurations-Validierung

Der Diagnostic Service bietet eine umfassende Systemdiagnose für das KI-Subsystem mit detaillierten Statusinformationen aller Komponenten und robustem Fehlerhandling.

Basierend auf der analysierten `embeddingService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Embedding Service - Hauptfunktionen**

### **Kern-Embedding-Funktionen**

- `generateEmbeddings(input, options)` - Erzeugt Embeddings für Text(e)
- `cosineSimilarity(vecA, vecB)` - Berechnet Kosinus-Ähnlichkeit zwischen Vektoren

### **Provider-spezifische Implementierungen**

- `openAIEmbedding(input, model)` - OpenAI Embeddings
- `ollamaEmbedding(input, model)` - Ollama Embeddings
- `huggingFaceEmbedding(input, model)` - HuggingFace Embeddings
- `localDummyEmbedding(input)` - Lokale Dummy-Embeddings

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  generateEmbeddings, // Haupt-Embedding-Funktion
  cosineSimilarity, // Ähnlichkeitsberechnung
};
```

## ⚙️ **Konfigurationssystem**

### **Umgebungsvariablen**

- `EMBEDDING_PROVIDER` - Standard-Provider (Default: "openai")
- `EMBEDDING_MODEL` - Standard-Modell (Default: "text-embedding-3-small")
- `OPENAI_API_KEY` - Für OpenAI Embeddings
- `HUGGINGFACEHUB_API_TOKEN` - Für HuggingFace Embeddings
- `OLLAMA_API_URL` - Für Ollama Embeddings

### **Service-Konfiguration**

```typescript
embeddingConfig: AIModuleConfig {
  name: "embeddingService",
  provider: Provider,              // Typensicherer Provider
  model: string,                   // Embedding-Modell
  description: string,             // Service-Beschreibung
  capabilities: string[],          // ["embedding", "text"]
  active: boolean                  // Aktivierungsstatus
}
```

## 🔄 **Provider-Routing**

### **Unterstützte Provider**

1. **`openai`** - OpenAI Embedding API
2. **`ollama`** - Lokale Ollama-Instanz
3. **`huggingface`** - HuggingFace Inference API
4. **`local`** - Lokale Dummy-Embeddings

### **Routing-Logik**

- **Umgebungsvariable**: `EMBEDDING_PROVIDER`
- **Option Override**: `options.provider` überschreibt Standard
- **Fallback-System**: Automatische Fehlerbehandlung

## 🌐 **API-Integrationen**

### **OpenAI Embeddings**

- **Endpoint**: `https://api.openai.com/v1/embeddings`
- **Request**:
  ```typescript
  {
    model: string,
    input: string | string[]
  }
  ```
- **Response**: `{ data: [{ embedding: number[] }] }`

### **Ollama Embeddings**

- **Endpoint**: `http://localhost:11434/api/embeddings`
- **Request**:
  ```typescript
  {
    model: string,
    input: string
  }
  ```
- **Response**: Multiple Formate unterstützt

### **HuggingFace Embeddings**

- **Endpoint**: `https://api-inference.huggingface.co/pipeline/feature-extraction/{model}`
- **Request**:
  ```typescript
  {
    inputs: string[]
  }
  ```
- **Response**: Multiple Formate unterstützt

## 📊 **Response-Struktur**

### **Embedding-Response**

```typescript
AIResponse {
  text: string,                    // Beschreibungstext
  data: number[][],                // Embedding-Vektoren (Array von Arrays)
  meta: {
    provider: string,              // Verwendeter Provider
    model: string,                 // Verwendetes Modell
    tokens_used?: number,          // OpenAI Token-Verbrauch
    dimensions?: number            // Vektor-Dimensionen
  },
  errors?: string[]                // Bei Fehlern
}
```

### **Response-Beispiele**

- **OpenAI**: "OpenAI Embeddings erzeugt (3 Vektoren, 1536 Dimensionen)."
- **Ollama**: "Ollama Embedding erzeugt (4096 Dimensionen)."
- **HuggingFace**: "HuggingFace Embedding erzeugt (768 Dimensionen)."
- **Local**: "🧩 Lokales Dummy-Embedding erzeugt (128 Dimensionen)."

## 🧮 **Ähnlichkeitsberechnung**

### **Cosine Similarity**

```typescript
cosineSimilarity(vecA: number[], vecB: number[]): number
```

### **Berechnungslogik**

- **Formel**: `dot(A,B) / (||A|| * ||B||)`
- **Validierung**: Vektor-Längen müssen übereinstimmen
- **Rückgabewert**: Zahl zwischen -1 und 1 (1 = identisch)

## 🔍 **Response-Verarbeitung**

### **Multi-Format Support**

Jeder Provider unterstützt verschiedene Response-Formate:

#### **OpenAI**

- Standard: `data[0].embedding`

#### **Ollama**

1. `embedding` - Direktes Array
2. `data[0].embedding` - Array in Daten-Objekt

#### **HuggingFace**

1. `[0]` als `number[][]` - Verschachteltes Array
2. `[0]` als `number[]` - Direktes Array
3. `embeddings` als `number[][]` - Embeddings Feld

#### **Local**

- Deterministische Dummy-Vektoren basierend auf Text-Input

## 🛡️ **Fehlerbehandlung**

### **Robuste Implementierung**

- **API-Key Validierung** für alle externen Provider
- **HTTP Status Code** Überprüfung
- **Response Format** Validierung mit Type-Safety
- **Graceful Degradation** bei Fehlern

### **Error Responses**

- Strukturierte Fehlermeldungen
- Detaillierte Protokollierung
- Meta-Informationen im Response

## 📈 **Use Cases**

### **Semantische Suche**

- Vektor-basierte Dokumentensuche
- Ähnlichkeitsanalyse von Texten

### **RAG (Retrieval Augmented Generation)**

- Wissensabruf aus Vektor-Datenbanken
- Kontext-Erweiterung für KI-Modelle

### **Klassifikation**

- Text-Kategorisierung basierend auf Embeddings
- Clustering und Gruppierung

### **Ähnlichkeitsanalyse**

- Content-Matching
- Duplikatserkennung
- Recommender Systems

Der Embedding Service bietet eine umfassende Lösung zur Erzeugung von Text-Embeddings mit Multi-Provider-Unterstützung, robustem Fehlerhandling und erweiterten Analyse-Funktionen für das ERP-KI-System.

Basierend auf der analysierten `knowledgeService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 📚 **Knowledge Service - Hauptfunktionen**

### **Kern-Wissensfunktionen**

- `loadKnowledgeBase()` - Lädt und indexiert Wissensdatenbank
- `queryKnowledgeBase(query, limit)` - Führt semantische Suche durch
- `buildContextFromKnowledge(query)` - Erstellt KI-Kontext aus Wissen
- `getKnowledgeStatus()` - Gibt Service-Status zurück

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  loadKnowledgeBase, // Wissensbasis laden
  queryKnowledgeBase, // Semantische Suche
  buildContextFromKnowledge, // Kontextaufbereitung
  getKnowledgeStatus, // Statusabfrage
};
```

## 📁 **Datenquellen & Verzeichnisse**

### **Wissensbasis-Pfade**

1. `ERP_SteinmetZ_V1/data/knowledge` - Projekt-interne Daten
2. `ERP_SteinmetZ_V1/docs/knowledge` - Dokumentations-Wissen
3. `F:/KI/ERP_SteinmetZ_V1/knowledge` - Externe KI-Daten

### **Unterstützte Dateiformate**

- **`.txt`** - Textdateien
- **`.md`** - Markdown-Dateien
- **`.json`** - JSON-Daten

## 🏗️ **Wissensmodell**

### **Knowledge Entry Struktur**

```typescript
interface KnowledgeEntry {
  id: string; // Dateiname als ID
  title: string; // Dateiname als Titel
  content: string; // Dateiinhalt
  vector?: number[]; // Embedding-Vektor
  source?: string; // Vollständiger Dateipfad
  updated?: string; // Änderungsdatum
}
```

## 🔍 **Semantische Suchfunktionen**

### **Suchprozess**

1. **Wissensbasis laden** - Alle Dateien einlesen
2. **Embeddings generieren** - Für jeden Eintrag Vektoren erstellen
3. **Query-Vectorisierung** - Suchanfrage in Vektor umwandeln
4. **Cosine Similarity** - Ähnlichkeitsberechnung
5. **Ranking & Filtering** - Top-Ergebnisse auswählen

### **Response-Struktur**

```typescript
AIResponse {
  text: string,                    // Zusammenfassung der Ergebnisse
  data: KnowledgeEntry[],          // Rangierte Einträge mit Scores
  meta: {
    provider: "knowledgeService",
    model: "semantic-retrieval"
  }
}
```

### **Ergebnis-Formatierung**

```
📖 Relevante Wissenseinträge zu "Suchbegriff":

• **Dateiname1** (85.5%)
  Quelle: dateiname1.txt
• **Dateiname2** (72.3%)
  Quelle: dateiname2.md
```

## 🧠 **Kontextaufbereitung**

### **KI-Kontext-Generierung**

```typescript
buildContextFromKnowledge(query): Promise<string>
```

### **Kontext-Format**

```
📚 Wissenskontext:

# Titel1
Inhaltsausschnitt (max. 1000 Zeichen)
---

# Titel2
Inhaltsausschnitt (max. 1000 Zeichen)
---
```

### **Use Cases**

- **RAG (Retrieval Augmented Generation)** - Kontext für KI-Modelle
- **Chat-Kontext** - Hintergrundwissen für Gespräche
- **Analyse-Grundlage** - Datenbasis für Entscheidungen

## 🔄 **Integrationen**

### **Embedding Service**

- `generateEmbeddings()` - Vektorerzeugung
- `cosineSimilarity()` - Ähnlichkeitsberechnung

### **Dateisystem**

- Automatische Datei-Erkennung
- Encoding-Handling (UTF-8)
- Metadaten-Extraktion (Änderungsdatum)

## 📊 **Status & Monitoring**

### **Status-Informationen**

```typescript
{
  provider: "knowledgeService",
  directories: string[],          // Gefundene Verzeichnisse
  total_dirs: number,             // Anzahl verfügbarer Verzeichnisse
  system: {
    hostname: string,             // System-Hostname
    platform: string              // Betriebssystem
  }
}
```

## 🛡️ **Fehlerbehandlung**

### **Robuste Implementierung**

- **Verzeichnis-Existenzprüfung** - Fehlertolerante Pfad-Verarbeitung
- **JSON-Parsing Fehlerbehandlung** - Graceful Degradation bei invalid JSON
- **Leere Wissensbasis** - Sinnvolle Fallback-Responses

### **Error Responses**

- "❌ Keine Wissensbasis gefunden." - Bei leerem Ergebnis
- Strukturierte Meta-Informationen
- Detaillierte Protokollierung

## 🎯 **Einsatzszenarien**

### **Semantische Suche**

- Natürlichsprachige Abfragen
- Inhaltsbasierte Suche (nicht nur Keywords)
- Relevanz-basiertes Ranking

### **Wissensmanagement**

- Zentrale Wissenssammlung
- Automatische Kategorisierung
- Schneller Zugriff auf Informationen

### **KI-Integration**

- Kontext-Erweiterung für Chat-Systeme
- Fakten-basierte Antwortgenerierung
- Vermeidung von Halluzinationen durch Grounding

## 📈 **Performance-Optimierungen**

### **Lazy Loading**

- Wissensbasis wird bei Bedarf geladen
- Embeddings werden nur einmal pro Eintrag generiert
- Caching-Mechanismen

### **Limit-Parameter**

- `limit` Parameter für Ergebnisbegrenzung (Standard: 5)
- Effiziente Sortierung und Slicing

Der Knowledge Service bietet eine vollständige semantische Wissensmanagement-Lösung mit RAG-Funktionalität, automatischer Vektorisierung und intelligenter Kontextaufbereitung für das ERP-KI-System.

Basierend auf der analysierten `modelService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🧠 **Model Service - Hauptfunktionen**

### **Modell-Verwaltung**

- `listAllModels()` - Liste aller registrierten KI-Modelle
- `getModelOverview()` - Übersicht aller aktiven Modelle
- `toggleModel(name, active)` - Aktiviert/Deaktiviert Modelle
- `registerModel(newModel)` - Registriert neue Modelle dynamisch

### **Auto-Detection**

- `autoDetectModels()` - Automatische Modell-Erkennung
- `getModelStatusReport()` - System-Statusbericht

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  listAllModels, // Komplette Modellliste
  getModelOverview, // Übersichtsformat
  toggleModel, // Modell-Aktivierung
  registerModel, // Dynamische Registrierung
  autoDetectModels, // Auto-Erkennung
  getModelStatusReport, // Statusbericht
};
```

## 📋 **Unterstützte Provider & Modelle**

### **Integrierte Provider**

1. **OpenAI** - `openaiConfig`
2. **Vertex AI** - `vertexConfig`
3. **Ollama** - `ollamaConfig`
4. **Local Provider** - `localProviderConfig`
5. **HuggingFace** - `hfConfig`
6. **Azure OpenAI** - `azureConfig`
7. **Custom Provider** - `customConfig`

### **Automatisch erkannte Modelle**

- **Lokale Modelle** - Via `scanLocalModels()`
- **Ollama-Modelle** - Via `listOllamaModels()`

## 🏗️ **Modell-Konfigurationsstruktur**

### **AIModuleConfig Interface**

```typescript
{
  name: string,                    // Eindeutiger Modellname
  provider: string,                // Provider-Typ
  model: string,                   // Spezifisches Modell
  active: boolean,                 // Aktivierungsstatus
  capabilities: string[],          // Unterstützte Funktionen
  description: string,             // Beschreibung
  endpoint?: string,               API-Endpoint
  // Weitere provider-spezifische Felder
}
```

## 📊 **Übersichts-Funktionen**

### **Modell-Übersicht**

```typescript
getModelOverview(): Array<{
  name: string,
  provider: string,
  model: string,
  active: boolean,
  capabilities: string[],
  description: string,
  endpoint: string
}>
```

### **Status-Report**

```typescript
{
  timestamp: string,               // Zeitstempel
  total_models: number,            // Gesamte Modelle
  active_models: number,           // Aktive Modelle
  detected_models: number,         // Auto-erkannte Modelle
  providers: string[],             // Verfügbare Provider
  system_info: {
    hostname: string,              // System-Hostname
    platform: string,              // Betriebssystem
    totalmem_GB: number,           // Gesamter RAM
    freemem_GB: number,            // Freier RAM
    cpus: number                   // CPU-Kerne
  }
}
```

## 🔄 **Dynamische Modell-Verwaltung**

### **Modell-Aktivierung**

```typescript
toggleModel(name: string, active: boolean): AIModuleConfig
```

- **Fehlerbehandlung**: Modell-Nicht-Gefunden Fehler
- **Logging**: Detaillierte Protokollierung

### **Dynamische Registrierung**

```typescript
registerModel(newModel: AIModuleConfig): AIModuleConfig
```

- **Validierung**: Name und Provider erforderlich
- **Update-Logik**: Existierende Modelle werden aktualisiert
- **Neueintrag**: Neue Modelle werden hinzugefügt

## 🔍 **Auto-Detection System**

### **Lokale Modell-Erkennung**

- **Quelle**: `scanLocalModels()` aus Local Provider
- **Format**: `local-{modellname}`
- **Capabilities**: `["chat", "completion", "embedding"]`

### **Ollama Modell-Erkennung**

- **Quelle**: `listOllamaModels()` aus Ollama Provider
- **Format**: `ollama-{modellname}`
- **Capabilities**: `["chat", "completion", "tools"]`

### **Detection-Response**

```typescript
AIModuleConfig[] // Array von automatisch erkannten Modell-Konfigurationen
```

## ⚙️ **Filterung & Aktivierung**

### **Aktive Modell-Filterung**

- Nur Modelle mit `active: true` werden zurückgegeben
- Inaktive Modelle bleiben in der Konfiguration erhalten

### **Provider-Integration**

- Direkter Import aller Provider-Konfigurationen
- Zentrale Verwaltung aller KI-Module
- Konsistente Schnittstelle

## 📈 **Monitoring & Reporting**

### **System-Metriken**

- **Modell-Zählung**: Total, Aktiv, Erkannt
- **Provider-Diversität**: Einzigartige Provider-Typen
- **System-Ressourcen**: RAM, CPU, Host-Informationen

### **Logging**

- Modellstatus-Änderungen
- Registrierungs-Ereignisse
- Auto-Detection Ergebnisse

## 🎯 **Use Cases**

### **Modell-Management**

- Zentrale Übersicht aller verfügbaren KI-Modelle
- Dynamische Aktivierung/Deaktivierung
- Provider-übergreifende Verwaltung

### **System-Administration**

- Ressourcen-Überwachung
- Capacity Planning
- Provider-Auswahl und Load Balancing

### **Auto-Discovery**

- Automatische Erweiterung der Modell-Palette
- Integration neuer lokaler Modelle
- Dynamische Ollama-Modell-Erkennung

## 🔄 **Integrationen**

### **Provider-Services**

- OpenAI, Azure, Vertex AI Konfigurationen
- Ollama Local API Integration
- Local File System Scanning
- HuggingFace & Custom Provider

### **System-APIs**

- OS Module für Systeminformationen
- Dateisystem für Local Models
- Network APIs für Ollama Detection

Der Model Service bietet eine zentrale Verwaltungseinheit für das gesamte KI-Modell-Ökosystem mit umfassender Auto-Detection, dynamischer Konfiguration und detailliertem Monitoring für das ERP-System.

Basierend auf der analysierten `settingsService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## ⚙️ **Settings Service - Hauptfunktionen**

### **Kern-Einstellungsfunktionen**

- `loadSettings()` - Lädt Systemeinstellungen
- `saveSettings(settings)` - Speichert Einstellungen
- `updateSetting(key, value)` - Aktualisiert einzelne Werte
- `resetSettings()` - Setzt Einstellungen zurück
- `getSetting(key, fallback)` - Holt einzelnen Wert

### **Validierung & Migration**

- `validateSettings(settings)` - Validiert Einstellungen
- `migrateSettings(settings)` - Migriert veraltete Strukturen

### **Import/Export**

- `exportSettings(targetFile)` - Exportiert Konfiguration
- `importSettings(sourceFile)` - Importiert Konfiguration

### **Diagnose**

- `getSettingsStatusReport()` - Systemstatus-Bericht

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  loadSettings, // Einstellungen laden
  saveSettings, // Einstellungen speichern
  updateSetting, // Einzelwert aktualisieren
  resetSettings, // Auf Standard zurücksetzen
  getSetting, // Wert abfragen
  validateSettings, // Validierung
  migrateSettings, // Migration
  getSettingsStatusReport, // Statusbericht
  exportSettings, // Export-Funktion
  importSettings, // Import-Funktion
};
```

## 📁 **Dateisystem-Integration**

### **Konfigurationspfade**

- **Config Directory**: `./config/`
- **Settings File**: `./config/ai_settings.json`
- **Backup Directory**: `./config/backups/`

### **Backup-System**

- **Automatische Backups**: Vor jedem Speichern
- **Dateinamen**: `ai_settings_backup_{timestamp}.json`
- **Zeitstempel-Format**: ISO mit Sanitization

## 🏗️ **Standard-Einstellungen**

### **Default-Konfiguration**

```typescript
DEFAULT_SETTINGS = {
  system_version: "1.0",
  default_provider: "openai",
  default_model: "gpt-4o-mini",
  log_level: "info",
  max_parallel_requests: 3,
  cache_enabled: true,
  autosave_interval_min: 30,
  diagnostics_enabled: true,
  last_updated: string, // ISO Timestamp
};
```

## 🔄 **Einstellungs-Management**

### **Lade-Logik**

1. **Verzeichnis-Prüfung** - Erstellt Config-Verzeichnis falls nicht vorhanden
2. **Datei-Existenz** - Erstellt Standarddatei falls fehlend
3. **Migration** - Automatische Aktualisierung veralteter Strukturen
4. **Fallback** - Bei Fehlern werden Defaults verwendet

### **Speicher-Logik**

1. **Backup-Erstellung** - Vor jeder Änderung
2. **Timestamp-Update** - Automatische Aktualisierung von `last_updated`
3. **Strukturierte Speicherung** - JSON mit Formatierung
4. **Fehlerbehandlung** - Robuste Error-Handling

## 🛡️ **Validierung & Migration**

### **Einstellungs-Validierung**

```typescript
validateSettings(settings): string[] // Gibt Problem-Liste zurück
```

### **Validierte Parameter**

- `default_provider` - Muss vorhanden sein
- `default_model` - Muss vorhanden sein
- `max_parallel_requests` - Muss positive Zahl sein

### **Migrations-Logik**

- **Vergleich mit Defaults** - Fehlende Schlüssel werden ergänzt
- **Automatische Speicherung** - Bei Änderungen
- **Change Tracking** - Protokollierung von Migrationen

## 📊 **Status & Monitoring**

### **Settings Status Report**

```typescript
{
  timestamp: string,               // Aktueller Zeitstempel
  settings: Record<string, any>,   // Komplette Einstellungen
  issues: string[],               // Validierungsprobleme
  system_info: {
    hostname: string,              // System-Hostname
    platform: string,              // Betriebssystem
    totalmem_GB: number,           // Gesamter RAM
    freemem_GB: number,            // Freier RAM
    cpus: number                   // CPU-Kerne
  }
}
```

## 🔄 **Import/Export-Funktionen**

### **Export**

- **Zieldatei**: Beliebig wählbarer Pfad
- **Format**: Strukturierte JSON
- **Fehlerbehandlung**: Boolean Rückgabe

### **Import**

- **Quelldatei**: Externe JSON-Datei
- **Validierung**: Datei-Existenz und JSON-Parsing
- **Automatische Speicherung**: Nach erfolgreichem Import

## 🎯 **Use Cases**

### **System-Konfiguration**

- Zentrale Verwaltung aller KI-Einstellungen
- Provider- und Modell-Konfiguration
- Performance-Parameter

### **Backup & Recovery**

- Automatische Backup-Erstellung
- Einfache Wiederherstellung
- Konfigurations-Migration

### **Administration**

- Runtime-Konfigurationsänderungen
- System-Statusüberwachung
- Problemdiagnose

## 📈 **Logging & Protokollierung**

### **Protokollierte Ereignisse**

- **Einstellungsänderungen** - Key, Old Value, New Value
- **Backup-Erstellungen** - Backup-Pfade
- **Migrationen** - Automatische Updates
- **Import/Export** - Erfolgs-/Fehlerstatus

### **Log-Level**

- `info` - Normale Operationen
- `warn` - Validierungsprobleme, Resets
- `error` - Fehler bei Dateioperationen

## 🔒 **Sicherheitsfeatures**

### **Datenintegrität**

- **Automatic Backups** - Vor jeder Änderung
- **Validation** - Kritische Parameter-Überprüfung
- **Migration** - Forward-Compatibility

### **Fehlertoleranz**

- **Graceful Degradation** - Fallback zu Defaults bei Fehlern
- **Robuste Datei-Operationen** - Try-Catch bei allen FS-Operationen
- **Konsistente Rückgabewerte** - Vorhersehbare Error-Handling

Der Settings Service bietet eine vollständige Konfigurationsverwaltungslösung mit Backup-System, Validierung, Migration und umfassendem Monitoring für das ERP-KI-System.

Basierend auf der analysierten `toolService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🛠️ **Tool Service - Hauptfunktionen**

### **Tool-Management**

- `loadAvailableTools()` - Lädt verfügbare Tools aus Dateisystem
- `listRegisteredTools()` - Listet registrierte Tools
- `reloadTools()` - Lädt Tools neu

### **Tool-Execution**

- `runTool(toolName, params)` - Führt Tool aus
- `isToolAvailable(toolName)` - Prüft Tool-Verfügbarkeit

### **Metadaten & Diagnose**

- `getToolMetadata()` - Holt Tool-Metadaten
- `getToolServiceStatus()` - Gibt Service-Status zurück

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  loadAvailableTools, // Tool-Discovery
  listRegisteredTools, // Registry-Liste
  runTool, // Tool-Ausführung
  getToolMetadata, // Metadaten-Abfrage
  isToolAvailable, // Verfügbarkeitsprüfung
  reloadTools, // Neuladen
  getToolServiceStatus, // Statusbericht
};
```

## ⚙️ **Service-Konfiguration**

### **Tool Service Config**

```typescript
toolServiceConfig: AIModuleConfig {
  name: "toolService",
  provider: "custom",
  model: "tools-runtime",
  active: true,
  description: "Verwaltet Tools und deren Aufrufe über KI-Modelle.",
  capabilities: ["tools", "workflow", "json_mode", "reasoning"]
}
```

## 📁 **Tool-Discovery System**

### **Tool-Verzeichnis**

- **Pfad**: `ERP_SteinmetZ_V1/apps/backend/src/routes/ai/tools`
- **Dateitypen**: `.ts` und `.js` Dateien
- **Namensextraktion**: Dateiname ohne Extension wird Tool-Name

### **Discovery-Prozess**

1. **Verzeichnis-Prüfung** - Existiert das Tool-Verzeichnis?
2. **Datei-Scan** - Alle TS/JS Dateien finden
3. **Namen-Extraktion** - Dateinamen ohne Extension
4. **Logging** - Anzahl und Namen der gefundenen Tools

## 🔧 **Tool-Execution System**

### **Ausführungs-Flow**

```typescript
runTool(toolName: string, params: Record<string, any>): Promise<string>
```

### **Ausführungs-Schritte**

1. **Parameter-Validierung** - Tool-Name und Parameter
2. **Registry-Aufruf** - `toolRegistry.call(toolName, params)`
3. **Performance-Monitoring** - Laufzeit-Messung
4. **Response-Formatierung** - Einheitliches Antwortformat
5. **Error-Handling** - Strukturierte Fehlerbehandlung

### **Response-Formate**

- **String-Result**: Direkte Rückgabe
- **Object-Result**: JSON-Stringifiziert mit Metadaten
- **Error-Result**: Fehlermeldung mit Tool-Name

## 📊 **Tool-Metadaten System**

### **ToolMetadata Interface**

```typescript
interface ToolMetadata {
  name: string; // Tool-Name
  description?: string; // Beschreibung
  category?: string; // Kategorie
  params?: Record<string, string>; // Parameter-Definition
  example?: string; // Beispielaufruf
  last_used?: string; // Letzte Verwendung
}
```

### **Metadaten-Erkennung**

**Prioritäts-basierte Abfrage**:

1. **`registry.describe()`** - Primäre Metadaten-Quelle
2. **`registry.getToolDefinitions()`** - Fallback-Quelle
3. **Basic Fallback** - Nur Namen bei Fehlschlag

### **Fallback-Logik**

- **Flexible Registry-Integration** - Arbeitet mit verschiedenen Registry-Implementierungen
- **Graceful Degradation** - Metadaten soweit verfügbar
- **Konsistente Struktur** - Immer gültige Rückgabe

## 🔄 **Tool-Reload System**

### **Neulade-Prozess**

1. **Tool-Discovery** - Neue Tools im Dateisystem finden
2. **Registry-Reload** - `toolRegistry.reload()` falls verfügbar
3. **Fallback-Handling** - Statisches Neuladen bei fehlender Reload-Funktion
4. **Status-Rückgabe** - Liste der geladenen Tools

## 📈 **Status & Monitoring**

### **Tool Service Status**

```typescript
{
  provider: "toolService",
  registered_count: number,       // In Registry registrierte Tools
  available_count: number,        // Im Dateisystem verfügbare Tools
  active_config: AIModuleConfig,  // Service-Konfiguration
  system_info: {
    hostname: string,             // System-Hostname
    platform: string,             // Betriebssystem
    cpus: number                  // CPU-Kerne
  }
}
```

## 🛡️ **Fehlerbehandlung**

### **Robuste Implementierung**

- **Try-Catch Wrapping** - Alle Operationen abgesichert
- **Registry-Compatibility** - Flexible Anpassung an verschiedene Registry-APIs
- **Meaningful Errors** - Verständliche Fehlermeldungen

### **Error Responses**

- **Tool nicht gefunden** - Klare Fehlermeldung
- **Ausführungsfehler** - Tool-spezifische Fehler
- **Registry-Fehler** - Metadaten-Abfrage Probleme

## 🔍 **Verfügbarkeitsprüfung**

### **Tool-Verfügbarkeit**

```typescript
isToolAvailable(toolName: string): boolean
```

- **Prüfung**: Über `toolRegistry.list()`
- **Schnelle Abfrage** - Direkte Registry-Integration
- **Boolean Rückgabe** - Einfache Integration

## 🎯 **Use Cases**

### **Tool-Management**

- Dynamische Tool-Erkennung
- Runtime Tool-Registrierung
- Tool-Metadaten Verwaltung

### **KI-Integration**

- Tool-Aufrufe von KI-Modellen
- Parameter-Validierung und Transformation
- Einheitliche Response-Formate

### **Administration**

- Tool-Statusüberwachung
- Performance-Monitoring
- Debugging und Problemdiagnose

## 📊 **Logging & Protokollierung**

### **Protokollierte Ereignisse**

- **Tool-Discovery** - Gefundene Tools und Anzahl
- **Tool-Ausführung** - Name, Parameter, Laufzeit
- **Tool-Fehler** - Fehlermeldungen mit Kontext
- **Neulade-Operationen** - Reload-Ergebnisse

Der Tool Service bietet eine umfassende Verwaltungslösung für KI-Tools mit automatischer Discovery, robuste Execution und detailliertem Monitoring für das ERP-KI-System.

Basierend auf der analysierten `translationService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 🌍 **Translation Service - Hauptfunktionen**

### **Übersetzungsfunktionen**

- `translateText(text, targetLang, engine)` - Übersetzt einzelnen Text
- `autoTranslate(text, targetLang, engine)` - Automatische Spracherkennung + Übersetzung
- `translateBatch(texts, targetLang, engine)` - Übersetzt mehrere Texte
- `detectLanguage(text, engine)` - Erkennt Sprache des Textes

### **Service-Status**

- `getTranslationStatus()` - Gibt Service-Status zurück

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  translateText, // Einzel-Übersetzung
  autoTranslate, // Automatische Übersetzung
  translateBatch, // Batch-Übersetzung
  detectLanguage, // Spracherkennung
  getTranslationStatus, // Statusabfrage
};
```

## ⚙️ **Service-Konfiguration**

### **Translation Config**

```typescript
translationConfig = {
  name: "translationService",
  defaultEngine: "openai", // Standard-Engine
  defaultModel: "gpt-4o-mini", // Standard-Modell
  fallbackEngine: "vertex", // Fallback-Engine
  supportedEngines: ["openai", "vertex", "huggingface"], // Unterstützte Engines
  defaultTargetLang: "Deutsch", // Standard-Zielsprache
};
```

## 🔄 **Engine-Routing**

### **Unterstützte Übersetzungs-Engines**

1. **`openai`** - OpenAI GPT-Modelle (Standard)
2. **`vertex`** - Google Vertex AI (Gemini)
3. **`huggingface`** - HuggingFace Inference API

### **Engine-spezifische Modelle**

- **OpenAI**: `gpt-4o-mini` (Standard)
- **Vertex AI**: `gemini-1.5-pro`
- **HuggingFace**: `facebook/m2m100_418M`

## 📝 **Übersetzungsprozess**

### **Prompt-Struktur**

```typescript
ChatMessage[] = [
  {
    role: "system",
    content: `Übersetze den folgenden Text präzise ins ${targetLang}.`
  },
  {
    role: "user",
    content: text
  }
]
```

### **Response-Verarbeitung**

- **Text-Extraktion**: `response.text`
- **Meta-Informationen**: Engine, Zielsprache
- **Fehlerbehandlung**: Strukturierte Error-Responses

## 🧠 **Spracherkennung**

### **Detect Language Prozess**

```typescript
detectLanguage(text, engine): Promise<string>
```

### **Prompt für Spracherkennung**

```
"Bestimme die Sprache des folgenden Textes und antworte nur mit dem Sprachennamen (z. B. 'Deutsch', 'Englisch', 'Französisch')."
```

### **Unterstützte Engines für Spracherkennung**

- **OpenAI** - Primäre Engine
- **Vertex AI** - Alternative Engine
- **HuggingFace** - Nicht unterstützt (Fallback zu OpenAI)

## 🔄 **Automatische Übersetzung**

### **Auto-Translate Flow**

1. **Spracherkennung** - `detectLanguage()`
2. **Vergleich** - Prüfung ob Übersetzung nötig
3. **Übersetzung** - Nur bei unterschiedlichen Sprachen
4. **Optimierung** - Überspringen bei gleicher Sprache

### **Response bei gleicher Sprache**

```typescript
{
  text: originalText,
  meta: {
    info: "Keine Übersetzung nötig",
    language: detectedLanguage
  }
}
```

## 📦 **Batch-Übersetzung**

### **Batch Processing**

```typescript
translateBatch(texts, targetLang, engine): Promise<AIResponse[]>
```

### **Verarbeitungslogik**

- **Sequentiell** - Texte werden nacheinander verarbeitet
- **Einzelaufrufe** - Jeder Text einzeln übersetzt
- **Array-Rückgabe** - Ergebnisse in gleicher Reihenfolge

## 📊 **Response-Strukturen**

### **Erfolgs-Response**

```typescript
AIResponse {
  text: string,                    // Übersetzter Text
  meta: {
    ...originalMeta,              // Provider-Metadaten
    engine: string,               // Verwendete Engine
    targetLang: string            // Zielsprache
  }
}
```

### **Fehler-Response**

```typescript
{
  text: string,                    // Fehlermeldung
  errors: string[],               // Fehlerdetails
  meta: {
    engine: string,               // Verwendete Engine
    targetLang: string            // Zielsprache
  }
}
```

## 🛡️ **Fehlerbehandlung**

### **Robuste Implementierung**

- **Engine-Fallback** - Automatischer Fallback bei Fehlern
- **Timeout-Handling** - Netzwerk-Fehlerbehandlung
- **Response-Validierung** - Prüfung auf gültige Antwort

### **Error-Logging**

- Detaillierte Fehlerprotokollierung
- Engine-spezifische Fehlermeldungen
- Kontext-Informationen

## 📈 **Monitoring & Status**

### **Service-Status**

```typescript
{
  service: "translationService",
  defaultEngine: string,           // Standard-Engine
  supportedEngines: string[],      // Unterstützte Engines
  defaultTargetLang: string        // Standard-Zielsprache
}
```

## 🎯 **Use Cases**

### **Einzel-Übersetzungen**

- Direkte Text-Übersetzung
- Spezifische Sprach-Kombinationen
- Engine-Auswahl nach Bedarf

### **Automatische Übersetzung**

- Unbekannte Eingabesprachen
- Dynamische Sprach-Erkennung
- Intelligente Fallbacks

### **Batch-Verarbeitung**

- Massen-Übersetzungen
- Dokumenten-Verarbeitung
- Effiziente Bulk-Operations

## 🔍 **Performance-Optimierungen**

### **Caching-Potential**

- Spracherkennung-Ergebnisse
- Häufige Übersetzungs-Paare
- Engine-Auswahl basierend auf Verfügbarkeit

### **Resource Management**

- Gezielte Engine-Nutzung
- Effiziente Prompt-Konstruktion
- Minimale API-Aufrufe bei Auto-Translate

Der Translation Service bietet eine vielseitige Übersetzungslösung mit Multi-Engine-Unterstützung, automatischer Spracherkennung und robustem Fehlerhandling für das ERP-KI-System.

Basierend auf der analysierten `visionService.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 📸 **Vision Service - Hauptfunktionen**

### **Bildanalyse-Funktionen**

- `analyzeImage(imagePath, instruction, engine)` - Analysiert einzelnes Bild
- `analyzeMultipleImages(imagePaths, instruction, engine)` - Analysiert mehrere Bilder
- `extractTextFromImage(imagePath, engine)` - Texterkennung (OCR)

### **Hilfsfunktionen**

- `isImageFile(filePath)` - Prüft Bildformat
- `encodeImageToBase64(filePath)` - Kodiert Bild zu Base64

### **Service-Status**

- `getVisionStatus()` - Gibt Service-Status zurück

## 🔧 **Service Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  analyzeImage, // Einzelbild-Analyse
  analyzeMultipleImages, // Mehrfachbild-Analyse
  extractTextFromImage, // OCR-Texterkennung
  getVisionStatus, // Statusabfrage
};
```

## ⚙️ **Service-Konfiguration**

### **Vision Config**

```typescript
visionConfig: AIModuleConfig {
  name: "visionService",
  provider: "openai",
  model: string,                    // Standard: "gpt-4o"
  description: string,              // Service-Beschreibung
  capabilities: string[],           // ["vision", "json_mode", "reasoning"]
  active: boolean,                  // Aktivierungsstatus
  max_tokens: number,               // 1500 Standard
  temperature: number               // 0.3 Standard
}
```

## 🌐 **Engine-Routing**

### **Unterstützte Vision-Engines**

1. **`openai`** - OpenAI Vision API (Standard)
2. **`vertex`** - Google Vertex AI (Gemini Vision)
3. **`huggingface`** - HuggingFace Inference API

### **Engine-spezifische Modelle**

- **OpenAI**: `gpt-4o` (Standard), `gpt-4o-mini`
- **Vertex AI**: `gemini-1.5-pro-vision`
- **HuggingFace**: `Salesforce/blip-image-captioning-large`

## 📁 **Bildverarbeitung**

### **Unterstützte Bildformate**

- **PNG** - `.png`
- **JPEG** - `.jpg`, `.jpeg`
- **GIF** - `.gif`
- **BMP** - `.bmp`
- **WebP** - `.webp`
- **TIFF** - `.tiff`

### **Base64 Encoding**

- **Automatische Konvertierung** - Bilder zu Base64 Strings
- **Data URL Format** - `data:image/jpeg;base64,{base64String}`
- **Datei-Existenzprüfung** - Validierung vor Verarbeitung

## 🧠 **Bildanalyse-Prozess**

### **Analyse-Prompts**

```typescript
// Standard-Prompt für Einzelbildanalyse
"Beschreibe den Inhalt des Bildes detailliert.";

// OCR-Prompt für Texterkennung
"Erkenne und gib den im Bild enthaltenen Text exakt wieder.";

// Multi-Image Prompt
"Analysiere die Gemeinsamkeiten und Unterschiede zwischen den Bildern.";
```

### **OpenAI Vision Integration**

```typescript
{
  model: "gpt-4o",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: instruction },
      {
        type: "image_url",
        image_url: `data:image/jpeg;base64,${base64}`
      }
    ]
  }]
}
```

### **Provider-Integration**

- **OpenAI**: Direkte Vision API Integration
- **Vertex AI**: `callVertexAI()` mit Vision-Modell
- **HuggingFace**: `callHuggingFace()` mit Image-Captioning Modell

## 📊 **Response-Strukturen**

### **Erfolgs-Response**

```typescript
AIResponse {
  text: string,                    // Analyse-Ergebnis
  meta: {
    ...providerMeta,              // Provider-spezifische Metadaten
    file: string,                 // Dateiname
    engine: string                // Verwendete Engine
  }
}
```

### **Multi-Image Response**

```typescript
{
  text: string,                    // Kombinierte Ergebnisse
  meta: {
    provider: string,
    model: string,
    images: number                 // Anzahl analysierter Bilder
  }
}
```

### **Fehler-Response**

```typescript
{
  text: string,                    // Fehlermeldung
  errors: string[]                // Fehlerdetails
}
```

## 🔍 **Spezialfunktionen**

### **Texterkennung (OCR)**

- **Spezialisierter Prompt** - Exakte Textextraktion
- **Engine-Kompatibilität** - Funktioniert mit allen unterstützten Engines
- **Use Cases** - Dokumentenverarbeitung, Screenshot-Analyse

### **Multi-Bildanalyse**

- **Sequenzielle Verarbeitung** - Bilder nacheinander analysieren
- **Kombinierte Ergebnisse** - Einheitliche Response mit allen Ergebnissen
- **Vergleichende Analyse** - Gemeinsamkeiten und Unterschiede

## 🛡️ **Fehlerbehandlung**

### **Validierung**

- **Dateiformat-Prüfung** - Nur unterstützte Bildformate
- **Datei-Existenz** - Pfad-Validierung
- **Base64-Encoding** - Fehlerbehandlung bei Konvertierung

### **Error-Types**

- **Ungültiges Format** - Bei nicht unterstützten Dateitypen
- **Datei nicht gefunden** - Bei fehlenden Bildern
- **API-Fehler** - Bei Provider-Problemen
- **Network-Fehler** - Bei Verbindungsproblemen

## 📈 **Monitoring & Status**

### **Vision Status**

```typescript
{
  provider: "visionService",
  active_model: string,            // Aktives Modell
  engines_supported: string[],     // Unterstützte Engines
  max_tokens: number,              // Maximale Tokens
  active: boolean                  // Aktivierungsstatus
}
```

## 🎯 **Use Cases**

### **Bildbeschreibung**

- Automatische Alt-Texte für Bilder
- Barrierefreiheit für visuelle Inhalte
- Inhaltsanalyse und -kategorisierung

### **Texterkennung**

- Dokumenten-Digitalisierung
- Screenshot-Verarbeitung
- Schilder- und Label-Erkennung

### **Vergleichende Analyse**

- Produktvergleiche
- Qualitätskontrolle
- Veränderungserkennung

### **Objekt-Erkennung**

- Inventarmanagement
- Sicherheitsüberwachung
- Automatisierte Katalogisierung

## 🔄 **Integrationen**

### **Provider-Services**

- **OpenAI Provider** - Für GPT-4o Vision
- **Vertex AI Provider** - Für Gemini Vision
- **HuggingFace Provider** - Für Open-Source Vision-Modelle

### **Dateisystem**

- Flexible Pfad-Unterstützung
- Automatische Format-Erkennung
- Effiziente Base64-Konvertierung

Der Vision Service bietet eine umfassende Bildanalyse-Lösung mit Multi-Engine-Unterstützung, spezialisierten OCR-Funktionen und robustem Fehlerhandling für das ERP-KI-System.

Basierend auf der analysierten `sessionStore.ts` Datei, hier sind die erkannten Funktionen und Routen:

## 💾 **Session Store - Hauptfunktionen**

### **Session-Management**

- `createSession(model, provider)` - Erstellt neue Session
- `getSession(id)` - Ruft Session ab
- `updateSession(id, message)` - Aktualisiert Session mit neuer Nachricht
- `removeSession(id)` - Löscht Session
- `listSessions()` - Listet alle Sessions

### **Erweiterte Funktionen**

- `findSessions(filter)` - Filtert Sessions nach Kriterien
- `cleanupOldSessions(maxAgeDays)` - Bereinigt alte Sessions
- `getSessionStatus()` - Gibt Store-Status zurück

### **Persistenz-Funktionen**

- `saveSessionToFile(session)` - Speichert Session auf Disk
- `loadAllSessions()` - Lädt alle gespeicherten Sessions
- `deleteSessionFile(id)` - Löscht Session-Datei

## 🔧 **Store Interface**

### **Exportierte Hauptkomponente**

```typescript
export default {
  createSession, // Neue Session erstellen
  getSession, // Session abrufen
  updateSession, // Session aktualisieren
  removeSession, // Session löschen
  listSessions, // Alle Sessions auflisten
  findSessions, // Sessions filtern
  getSessionStatus, // Store-Status
  loadAllSessions, // Persistenz laden
  cleanupOldSessions, // Bereinigung
};
```

## 🏗️ **Session-Struktur**

### **ChatSession Interface**

```typescript
interface ChatSession {
  id: string; // Eindeutige Session-ID
  model: string; // Verwendetes KI-Modell
  provider?: string; // KI-Provider
  messages: ChatMessage[]; // Nachrichtenverlauf
  createdAt: string; // Erstellungszeitpunkt (ISO)
  updatedAt: string; // Letzte Aktualisierung (ISO)
  tokensUsed?: number; // Verwendete Tokens
  meta?: Record<string, any>; // Zusätzliche Metadaten
}
```

## 💽 **Speichersystem**

### **In-Memory Store**

- **Map-basiert** - `chatSessions: Map<string, ChatSession>`
- **Schneller Zugriff** - Direkter Speicherzugriff
- **Automatische Verwaltung** - Integrierte CRUD-Operationen

### **Persistente Speicherung**

- **Aktivierung**: `PERSIST_SESSIONS = true` (Konfigurierbar)
- **Verzeichnis**: `./data/sessions/`
- **Dateiformat**: JSON mit Formatierung
- **Dateinamen**: `{session-id}.json`

## 🔄 **Session-Lebenszyklus**

### **Erstellung**

```typescript
createSession(model: string, provider?: string): ChatSession
```

- **ID-Generierung**: `chat_{UUID}`
- **Zeitstempel**: Automatische Erstellung
- **Initialisierung**: Leerer Nachrichtenverlauf

### **Aktualisierung**

```typescript
updateSession(id: string, message: ChatMessage | AIResponse): ChatSession
```

- **Nachrichtenhinzufügung**: Push zur Messages-Liste
- **Timestamp-Update**: Automatische Aktualisierung
- **Response-Adaptierung**: Konvertiert AIResponse zu ChatMessage

### **Löschung**

- **Memory Cleanup**: Entfernt aus Map
- **File Cleanup**: Löscht JSON-Datei (falls persistent)

## 📁 **Dateisystem-Integration**

### **Automatisches Laden**

- **Startup Initialization**: Beim Modul-Import
- **Bulk Loading**: Alle JSON-Dateien im Session-Verzeichnis
- **Fehlertoleranz**: Fehlerhafte Dateien werden übersprungen

### **Backup & Recovery**

- **Automatische Sicherung**: Bei jeder Änderung
- **Consistency Checks**: JSON-Parsing mit Error-Handling
- **Graceful Degradation**: Funktioniert auch ohne Persistenz

## 🧹 **Bereinigungsfunktionen**

### **Automatic Cleanup**

```typescript
cleanupOldSessions(maxAgeDays = 7): number
```

### **Bereinigungslogik**

- **Altersprüfung**: Basierend auf `updatedAt`
- **Standard**: 7 Tage (konfigurierbar)
- **Startup Cleanup**: Automatisch beim Initialisieren (14 Tage)

### **Filter-Funktionen**

```typescript
findSessions(filter: { model?: string; provider?: string }): ChatSession[]
```

- **Modell-Filter**: Nach spezifischem KI-Modell
- **Provider-Filter**: Nach KI-Provider
- **Kombinierte Filter**: Mehrere Kriterien gleichzeitig

## 📊 **Monitoring & Status**

### **Session Status**

```typescript
{
  total: number,                 // Gesamtzahl der Sessions
  persistent: boolean,           // Persistenz aktiviert
  directory: string,             // Speicherverzeichnis
  lastUpdated: string            // Letzte Aktualisierung (ISO)
}
```

## 🛡️ **Fehlerbehandlung**

### **Robuste Implementierung**

- **Session nicht gefunden**: Gibt `null` zurück
- **Datei-Operationen**: Try-Catch bei allen FS-Operationen
- **JSON-Parsing**: Fehlertolerantes Parsing von Session-Dateien

### **Error-Logging**

- **Session-Erstellung**: Erfolgsprotokollierung
- **Speicherfehler**: Detaillierte Error-Logs
- **Ladefehler**: Warnungen bei fehlerhaften Dateien

## 🎯 **Use Cases**

### **Chat-Historie**

- Persistenter Nachrichtenverlauf
- Kontext-Erhaltung über mehrere Anfragen
- Token-Tracking für Cost Management

### **Session-Management**

- Mehrere parallele Chat-Sessions
- Benutzer-spezifische Konversationen
- Modell- und Provider-Isolation

### **Analytics & Debugging**

- Nutzungsstatistiken
- Performance-Monitoring
- Problemdiagnose durch Session-Review

## 🔄 **Integrationen**

### **KI-System-Integration**

- **Provider-Agnostisch**: Unterstützt alle KI-Provider
- **Message-Typen**: Kompatibel mit ChatMessage und AIResponse
- **Metadata-Support**: Erweiterbare Session-Metadaten

### **System-Integration**

- **File System**: Persistente Speicherung
- **Crypto Module**: Sichere ID-Generierung
- **Date-Handling**: ISO-Format Zeitstempel

Der Session Store bietet eine vollständige Session-Management-Lösung mit persistenter Speicherung, automatischer Bereinigung und robustem Fehlerhandling für das ERP-KI-System.
