# QuickChat AI Assistant Module

Umfassender AI-gestützter Chat-Assistent mit Multi-Provider-Support, Tool-Execution, Workflow-Orchestrierung und erweiterten KI-Fähigkeiten (Vision, Audio, Translation, Embeddings).

**Version:** 2.0.0  
**Letzte Aktualisierung:** 2025-12-20  
**Status:** ✅ Production Ready

---

## Inhaltsverzeichnis

- [Überblick](#überblick)
- [Features](#features)
- [Architektur](#architektur)
- [AI-Provider](#ai-provider)
- [API-Endpoints](#api-endpoints)
- [Commands](#commands)
- [AI-Capabilities](#ai-capabilities)
- [Tools & Workflows](#tools--workflows)
- [Session-Management](#session-management)
- [TypeScript-Typen](#typescript-typen)
- [Verwendung](#verwendung)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

---

## Überblick

Das QuickChat-Modul ist ein vollständig integrierter AI-Assistent für das ERP SteinmetZ System, der natürliche Sprachinteraktionen, Slash-Commands und erweiterte KI-Fähigkeiten kombiniert.

### Kernkomponenten

| Komponente | Pfad | Verantwortlichkeit |
| ---------- | ---- | ------------------ |

| Router | `quickchatRouter.ts` | HTTP-Endpoints und Validierung |
| Service | `quickchatService.ts` | Business-Logik und AI-Integration |
| AI Router | `../ai/aiRouter.ts` | AI-Provider-Management |
| Providers | `../ai/providers/` | AI-Provider-Implementierungen |
| Tools | `../ai/tools/` | Tool-Definitionen und -Execution |
| Workflows | `../ai/workflows/` | Workflow-Engine |
| Sessions | `../ai/sessions/` | Session-Storage |

### Integration mit AI-Komponente

QuickChat nutzt die vollständige AI-Infrastruktur:

```tree
QuickChat Service
    ├── Provider Manager (Multi-Provider-Support)
    ├── Chat Service (Completions mit Tools)
    ├── Tool Service (ERP, DB, Files, System)
    ├── Session Store (Conversation History)
    ├── Workflow Engine (Complex Workflows)
    ├── Vision Service (Bildanalyse)
    ├── Audio Service (TTS, STT)
    ├── Translation Service (Multi-Language)
    ├── Embedding Service (Semantic Search)
    └── Knowledge Service (RAG)
```

---

## Features

### ✅ Multi-Provider AI Support

- **OpenAI:** GPT-3.5, GPT-4, GPT-4 Turbo
- **Anthropic:** Claude 3 (Opus, Sonnet, Haiku)
- **Azure OpenAI:** Enterprise GPT-Models
- **Ollama:** Lokale LLMs (Llama, Mistral, etc.)
- **Google Vertex AI:** PaLM, Gemini
- **Hugging Face:** Custom Models
- **LlamaCpp:** Eigene GGUF-Modelle
- **Fallback:** Eliza-basierte Antworten

### ✅ Slash Commands

**Standard-Commands:**

- `/rechnung` - Rechnung erstellen
- `/angebot` - Angebot erstellen
- `/bericht` - Bericht generieren
- `/idee` - Idee parken
- `/termin` - Termin erstellen
- `/suche` - Semantische Suche

**AI-Commands:**

- `/translate` - Text übersetzen
- `/vision` - Bild analysieren
- `/audio` - Audio transkribieren/generieren
- `/workflow` - Workflow ausführen
- `/hilfe` - Hilfe anzeigen

### ✅ Tool Execution

**Database Tools:**

- `database_query` - SQL-Queries ausführen
- `database_insert` - Daten einfügen
- `database_update` - Daten aktualisieren
- `database_delete` - Daten löschen

**ERP Tools:**

- `erp_create_invoice` - Rechnung erstellen
- `erp_create_quote` - Angebot erstellen
- `erp_get_customer` - Kundendaten abrufen
- `erp_get_product` - Produktdaten abrufen

**File Tools:**

- `file_read` - Datei lesen
- `file_write` - Datei schreiben
- `file_list` - Dateien auflisten
- `file_delete` - Datei löschen

**System Tools:**

- `system_status` - System-Status
- `calculation` - Mathematische Berechnungen
- `semantic_search` - Embeddings-basierte Suche

### ✅ Advanced AI Capabilities

**Vision:**

- Bildanalyse mit GPT-4 Vision
- Objekterkennung
- Text-Extraktion (OCR)
- Bild-Beschreibung

**Audio:**

- Speech-to-Text (Whisper)
- Text-to-Speech (TTS)
- Audio-Transkription
- Multi-Language Support

**Translation:**

- 50+ Sprachen
- Automatische Spracherkennung
- Kontextbewusste Übersetzung
- Batch-Übersetzung

**Embeddings & RAG:**

- Text-Embeddings (OpenAI, Sentence Transformers)
- Semantische Suche
- Knowledge Base Integration
- Ähnlichkeitssuche

**Workflows:**

- Multi-Step-Prozesse
- Conditional Logic
- Error Handling
- State Management

### ✅ Session Management

- Persistente Konversationen
- Context-Preservation
- User-basierte Sessions
- Session-Metadata
- Automatische Bereinigung

---

## Architektur

### Schichtenmodell

```chart
┌─────────────────────────────────────────┐
│  HTTP Layer (quickchatRouter.ts)        │  ← REST API, Validation
├─────────────────────────────────────────┤
│  Service Layer (quickchatService.ts)    │  ← Business Logic, Orchestration
├─────────────────────────────────────────┤
│  AI Layer (ai/services/*)               │  ← Provider, Tools, Workflows
├─────────────────────────────────────────┤
│  Storage Layer (sessionStore, db)       │  ← Persistence
└─────────────────────────────────────────┘
```

### Request Flow

```tree
Client Request
     ↓
Router (Zod Validation)
     ↓
QuickChat Service
     ├─> Command? → Execute Command → Tool Service
     └─> Chat → Provider Manager → AI Provider
                    ↓
                Tool Calls? → Tool Service
                    ↓
                Session Store (Save)
     ↓
Response to Client
```

### Provider Selection

```typescript
// Default: OpenAI
POST /api/quickchat/message
{
  "message": "Hello"
}

// Explicit Provider
POST /api/quickchat/message
{
  "message": "Hello",
  "preferences": {
    "provider": "anthropic",
    "model": "claude-3-opus-20240229"
  }
}

// Session Preferences
const session = await quickchatService.createSession({
  preferences: {
    provider: "ollama",
    model: "llama2"
  }
});
```

---

## AI-Provider

### Konfiguration

Alle Provider werden über Environment-Variablen konfiguriert:

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Azure OpenAI
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_DEPLOYMENT=...

# Ollama
OLLAMA_BASE_URL=http://localhost:11434

# Google Vertex AI
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_CLOUD_PROJECT=project-id

# Hugging Face
HUGGINGFACE_API_KEY=hf_...
```

### Provider-Merkmale

| Provider     | Streaming | Tools | Vision | Audio | Local |
| ------------ | --------- | ----- | ------ | ----- | ----- |
| OpenAI       | ✅        | ✅    | ✅     | ✅    | ❌    |
| Anthropic    | ✅        | ✅    | ✅     | ❌    | ❌    |
| Azure OpenAI | ✅        | ✅    | ✅     | ✅    | ❌    |
| Ollama       | ✅        | ⚠️    | ❌     | ❌    | ✅    |
| Vertex AI    | ✅        | ✅    | ✅     | ❌    | ❌    |
| Hugging Face | ❌        | ❌    | ⚠️     | ❌    | ❌    |
| LlamaCpp     | ❌        | ❌    | ❌     | ❌    | ✅    |
| Fallback     | ❌        | ❌    | ❌     | ❌    | ✅    |

---

## API-Endpoints

### POST /api/quickchat/message

Nachricht an QuickChat senden.

**Request:**

```typescript
{
  sessionId?: string;      // UUID für Session-Kontinuität
  userId?: string;         // User-Identifier
  message: string;         // Nachricht (1-5000 Zeichen)
  context?: Record<string, unknown>;  // Zusätzlicher Kontext
  metadata?: {
    source?: string;       // Nachrichtenquelle
    priority?: "low" | "normal" | "high";
    tags?: string[];       // Tags
  };
  preferences?: {
    provider?: string;     // AI-Provider
    model?: string;        // Model-Name
    temperature?: number;  // 0-2
    maxTokens?: number;    // Max Output Tokens
    stream?: boolean;      // Streaming aktivieren
  };
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    sessionId: string;
    message: {
      id: string;
      role: "assistant";
      content: string;
      timestamp: string;
      metadata?: {
        provider: string;
        model: string;
        tokens: {
          input: number;
          output: number;
          total: number;
        };
        duration: number;
        toolCalls?: string[];
      };
    };
    commandResult?: unknown;
  };
}
```

**Beispiele:**

```bash
# Einfache Nachricht
curl -X POST http://localhost:3000/api/quickchat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the total revenue this month?"
  }'

# Mit Provider-Auswahl
curl -X POST http://localhost:3000/api/quickchat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain quantum computing",
    "preferences": {
      "provider": "anthropic",
      "model": "claude-3-opus-20240229",
      "temperature": 0.7
    }
  }'

# Command ausführen
curl -X POST http://localhost:3000/api/quickchat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "/rechnung Kunde ABC, Betrag 1000€"
  }'
```

---

### POST /api/quickchat/command

Command direkt ausführen.

**Request:**

```typescript
{
  command: string;         // Command-Name (z.B. "/rechnung")
  args?: string;           // Command-Argumente
  context?: Record<string, unknown>;
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    success: boolean;
    message: string;
    data?: unknown;
    toolsUsed?: string[];
    duration?: number;
  };
}
```

**Beispiel:**

```bash
curl -X POST http://localhost:3000/api/quickchat/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "/rechnung",
    "args": "Kunde: ABC GmbH, Betrag: 1500€"
  }'
```

---

### GET /api/quickchat/commands

Verfügbare Commands auflisten.

**Response:**

```typescript
{
  success: true;
  data: {
    commands: [
      {
        command: "/rechnung";
        name: "Rechnung erstellen";
        description: "Erstellt eine neue Rechnung";
        tools: ["database_query", "erp_create_invoice"];
      }
      // ...
    ];
  };
}
```

---

### GET /api/quickchat/capabilities

System-Capabilities abrufen.

**Response:**

```typescript
{
  success: true;
  data: {
    providers: string[];         // Verfügbare Provider
    models: {                    // Models pro Provider
      openai: ["gpt-4", "gpt-3.5-turbo"];
      anthropic: ["claude-3-opus-20240229"];
    };
    tools: string[];             // Verfügbare Tools
    workflows: string[];         // Verfügbare Workflows
    features: {
      vision: boolean;
      audio: boolean;
      translation: boolean;
      embedding: boolean;
      knowledge: boolean;
      streaming: boolean;
    };
  };
}
```

**Beispiel:**

```bash
curl http://localhost:3000/api/quickchat/capabilities
```

---

### POST /api/quickchat/sessions

Neue Session erstellen.

**Request:**

```typescript
{
  userId?: string;
  context?: Record<string, unknown>;
  preferences?: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    id: string;
    userId?: string;
    messages: [];
    context: Record<string, unknown>;
    preferences: { /* ... */ };
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### GET /api/quickchat/sessions/:id

Session abrufen.

**Response:**

```typescript
{
  success: true;
  data: {
    id: string;
    messages: QuickChatMessage[];
    context: Record<string, unknown>;
    // ...
  };
}
```

---

### GET /api/quickchat/sessions

Sessions auflisten.

**Query-Parameter:**

| Parameter | Typ    | Optional | Beschreibung        |
| --------- | ------ | -------- | ------------------- |
| `userId`  | string | ✅       | Filter nach User-ID |

**Response:**

```typescript
{
  success: true;
  data: {
    sessions: QuickChatSession[];
    count: number;
  };
}
```

---

### DELETE /api/quickchat/sessions/:id

Session löschen.

**Response:**

```typescript
{
  success: true;
  data: {
    deleted: boolean;
  }
}
```

---

## Commands

### Standard-Commands

#### /rechnung

Rechnung erstellen.

**Usage:**

```text
/rechnung Kunde: ABC GmbH, Betrag: 1500€, Positionen: 3
```

**Tools:** `database_query`, `erp_create_invoice`

---

#### /angebot

Angebot erstellen.

**Usage:**

```path
/angebot Kunde: XYZ AG, Produkt: Grabstein Modell A
```

**Tools:** `database_query`, `erp_create_quote`

---

#### /bericht

Bericht generieren.

**Usage:**

```text
/bericht Umsatz Q4 2025
```

**Tools:** `database_query`, `file_write`

---

#### /idee

Idee parken (Innovation-Modul).

**Usage:**

```text
/idee Automatische Qualitätskontrolle mit AI Vision
```

**Tools:** `database_insert`

---

#### /termin

Termin erstellen.

**Usage:**

```text
/termin Meeting mit Kunde ABC am 15.01.2025
```

**Tools:** `database_insert`

---

#### /suche

Semantische Suche.

**Usage:**

```text
/suche Wie war der Umsatz im letzten Quartal?
```

**Tools:** `database_query`, `semantic_search`

---

### AI-Commands

#### /translate

Text übersetzen.

**Usage:**

```text
/translate Hallo Welt | de | en
```

**Format:** `text | source_lang | target_lang`

**Tools:** `translation`

**Beispiel:**

```bash
POST /api/quickchat/message
{
  "message": "/translate The quick brown fox | en | de"
}

# Response:
# "Übersetzung (en → de):\n\nDer schnelle braune Fuchs"
```

---

#### /vision

Bild analysieren.

**Usage:**

```html
/vision https://example.com/image.jpg
```

**Tools:** `vision`

**Beispiel:**

```bash
POST /api/quickchat/message
{
  "message": "/vision https://example.com/invoice.jpg"
}

# Response:
# "Bildanalyse:\n\nDies ist eine Rechnung von ABC GmbH..."
```

---

#### /audio

Audio verarbeiten.

**Usage:**

```html
/audio transcribe|https://example.com/audio.mp3 /audio generate|Willkommen im
ERP System
```

**Actions:**

- `transcribe` - Audio zu Text
- `generate` - Text zu Audio

**Tools:** `audio_transcribe`, `audio_generate`

---

#### /workflow

Workflow ausführen.

**Usage:**

```html
/workflow data_export
```

**Tools:** `workflow_engine`

**Verfügbare Workflows:**

- `data_export` - Daten exportieren
- `invoice_processing` - Rechnungsverarbeitung
- `customer_onboarding` - Kunden-Onboarding
- Custom Workflows (siehe `ai/workflows/`)

---

#### /hilfe

Hilfe anzeigen.

**Usage:**

```html
/hilfe
```

**Response:** Liste aller Commands mit Beschreibungen

---

## AI-Capabilities

### Vision (Bildanalyse)

**Provider:** OpenAI GPT-4 Vision, Google Vertex AI

**Features:**

- Objekterkennung
- Text-Extraktion (OCR)
- Szenen-Beschreibung
- Bild-Klassifizierung

**Verwendung:**

```typescript
import { visionService } from "../ai/services/visionService.js";

const analysis = await visionService.analyzeImage(
  "https://example.com/image.jpg",
  "What's in this image?",
);

console.log(analysis.description);
// "This image shows a marble gravestone with..."
```

**Über QuickChat:**

```bash
POST /api/quickchat/message
{
  "message": "/vision https://example.com/product.jpg"
}
```

---

### Audio (Speech Processing)

**Provider:** OpenAI Whisper (STT), OpenAI TTS

**Features:**

- Speech-to-Text (50+ Sprachen)
- Text-to-Speech (Multi-Voice)
- Transkription mit Timestamps
- Audio-Format-Unterstützung

**Verwendung:**

```typescript
import { audioService } from "../ai/services/audioService.js";

// Transkription
const transcription = await audioService.transcribeAudio(
  "https://example.com/meeting.mp3",
);

console.log(transcription.text);
// "Guten Tag, wir besprechen heute..."

// Text-to-Speech
const audio = await audioService.generateSpeech("Willkommen im ERP System", {
  voice: "alloy",
  format: "mp3",
});
```

---

### Translation (Übersetzung)

**Provider:** OpenAI, Google Translate API

**Features:**

- 50+ Sprachen
- Auto-Detect Source Language
- Kontextbewusste Übersetzung
- Batch-Verarbeitung

**Verwendung:**

```typescript
import { translationService } from "../ai/services/translationService.js";

const translation = await translationService.translate(
  "The quick brown fox",
  "en",
  "de",
);

console.log(translation.translatedText);
// "Der schnelle braune Fuchs"
```

---

### Embeddings & Semantic Search

**Provider:** OpenAI Embeddings, Sentence Transformers

**Features:**

- Text-Embeddings (1536 Dimensionen)
- Semantische Ähnlichkeitssuche
- RAG (Retrieval-Augmented Generation)
- Knowledge Base Integration

**Verwendung:**

```typescript
import { embeddingService } from "../ai/services/embeddingService.js";
import { knowledgeService } from "../ai/services/knowledgeService.js";

// Embedding erstellen
const embedding = await embeddingService.createEmbedding(
  "How to create an invoice",
);

// Semantische Suche
const results = await knowledgeService.search("invoice creation process", {
  limit: 5,
});

results.forEach((result) => {
  console.log(`${result.title}: ${result.similarity}`);
});
```

---

## Tools & Workflows

### Tool-Registrierung

Tools werden automatisch vom AI-Provider erkannt:

```typescript
import { toolService } from "../ai/services/toolService.js";

const availableTools = await toolService.getAvailableTools();

availableTools.forEach((tool) => {
  console.log(`${tool.name}: ${tool.description}`);
});

// Output:
// database_query: Execute SQL queries
// erp_create_invoice: Create a new invoice
// file_write: Write content to a file
// ...
```

### Tool-Execution

Tools werden entweder durch AI-Requests oder manuell ausgeführt:

```typescript
// AI ruft Tool automatisch auf
POST /api/quickchat/message
{
  "message": "Create an invoice for customer ABC, amount 1000€"
}

// AI verwendet erp_create_invoice Tool

// Manueller Tool-Aufruf
const result = await toolService.executeTool("database_query", {
  query: "SELECT * FROM customers WHERE id = ?",
  params: ["ABC"]
});
```

### Workflow-Engine

Workflows orchestrieren mehrere Tools in definierten Abläufen:

```typescript
import { workflowEngine } from "../ai/workflows/workflowEngine.js";

// Workflow ausführen
const result = await workflowEngine.executeWorkflow("data_export", {
  format: "csv",
  tables: ["customers", "invoices"],
});

// Workflows auflisten
const workflows = await workflowEngine.listWorkflows();
// ["data_export", "invoice_processing", "customer_onboarding"]
```

**Workflow-Definition:**

```json
{
  "name": "data_export",
  "description": "Export data to file",
  "steps": [
    {
      "tool": "database_query",
      "params": { "query": "SELECT * FROM ${table}" }
    },
    {
      "tool": "file_write",
      "params": { "path": "/exports/${table}.csv", "content": "${result}" }
    }
  ]
}
```

---

## Session-Management

### Session-Lifecycle

```typescript
// 1. Session erstellen
const session = await quickchatService.createSession({
  userId: "user-123",
  preferences: {
    provider: "openai",
    model: "gpt-4",
  },
});

// 2. Nachricht senden
const response = await quickchatService.sendMessage({
  sessionId: session.id,
  message: "Hello, how can you help me?",
});

// 3. Session abrufen
const retrievedSession = await quickchatService.getSession(session.id);
console.log(retrievedSession.messages);

// 4. Session löschen
await quickchatService.deleteSession(session.id);
```

### Context-Preservation

Sessions speichern den vollständigen Konversationsverlauf:

```typescript
const session = await quickchatService.getSession("session-123");

// Letzte 10 Nachrichten für AI-Context
const recentMessages = session.messages.slice(-10);

// Custom Context
session.context = {
  customerId: "ABC",
  invoiceId: "INV-001",
  metadata: {
    /* ... */
  },
};

await quickchatService.updateSession(session);
```

### Session-Storage

Sessions werden im SessionStore persistiert:

```typescript
import { sessionStore } from "../ai/sessions/sessionStore.js";

// CRUD-Operationen
await sessionStore.createSession(sessionId, data);
const session = await sessionStore.getSession(sessionId);
await sessionStore.updateSession(sessionId, data);
await sessionStore.deleteSession(sessionId);

// Batch-Operationen
const allSessions = await sessionStore.listSessions();
await sessionStore.cleanup(); // Alte Sessions entfernen
```

---

## TypeScript-Typen

### QuickChatMessage

```typescript
interface QuickChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  command?: string;
  commandResult?: unknown;
  metadata?: {
    provider?: string;
    model?: string;
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
    duration?: number;
    toolCalls?: string[];
  };
}
```

### QuickChatSession

```typescript
interface QuickChatSession {
  id: string;
  userId?: string;
  messages: QuickChatMessage[];
  context: Record<string, unknown>;
  preferences: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}
```

### SendMessageOptions

```typescript
interface SendMessageOptions {
  sessionId?: string;
  userId?: string;
  message: string;
  context?: Record<string, unknown>;
  metadata?: {
    source?: string;
    priority?: "low" | "normal" | "high";
    tags?: string[];
  };
  preferences?: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  };
}
```

### QuickChatCapabilities

```typescript
interface QuickChatCapabilities {
  providers: string[];
  models: Record<string, string[]>;
  tools: string[];
  workflows: string[];
  features: {
    vision: boolean;
    audio: boolean;
    translation: boolean;
    embedding: boolean;
    knowledge: boolean;
    streaming: boolean;
  };
}
```

---

## Verwendung

### Basic Chat

```typescript
import { quickchatService } from "./quickchatService.js";

const response = await quickchatService.sendMessage({
  message: "What is our total revenue this year?",
});

console.log(response.message.content);
// "Based on the data, your total revenue this year is €1.2M..."
```

### Mit Provider-Auswahl

```typescript
const response = await quickchatService.sendMessage({
  message: "Explain machine learning in simple terms",
  preferences: {
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    temperature: 0.7,
  },
});
```

### Command Execution

```typescript
const result = await quickchatService.executeCommand(
  "/rechnung Kunde ABC, 1000€",
  session,
);

console.log(result.message);
// "Rechnung wird erstellt für: Kunde ABC, 1000€"

console.log(result.data);
// { type: "invoice", status: "draft", args: "Kunde ABC, 1000€" }
```

### Session-basierte Konversation

```typescript
// Session erstellen
const session = await quickchatService.createSession({
  userId: "user-123",
});

// Erste Nachricht
await quickchatService.sendMessage({
  sessionId: session.id,
  message: "Show me the revenue for January",
});

// Folge-Nachricht mit Context
await quickchatService.sendMessage({
  sessionId: session.id,
  message: "And what about February?", // AI erinnert sich an Kontext
});
```

### Multi-Tool Workflow

```typescript
const response = await quickchatService.sendMessage({
  message:
    "Create an invoice for customer ABC with 3 items, then send it via email",
});

// AI verwendet mehrere Tools:
// 1. database_query (Kundendaten abrufen)
// 2. erp_create_invoice (Rechnung erstellen)
// 3. email_send (E-Mail versenden)

console.log(response.message.metadata.toolCalls);
// ["database_query", "erp_create_invoice", "email_send"]
```

---

## Best Practices

### 1. Provider-Auswahl

```typescript
// Produktiv: Zuverlässige Cloud-Provider
const productionPreferences = {
  provider: "openai",
  model: "gpt-4",
  temperature: 0.3, // Konsistente Antworten
};

// Entwicklung: Lokale Provider
const devPreferences = {
  provider: "ollama",
  model: "llama2",
  temperature: 0.7,
};

// Kosten-optimiert
const budgetPreferences = {
  provider: "openai",
  model: "gpt-3.5-turbo",
  maxTokens: 500,
};
```

### 2. Error Handling

```typescript
try {
  const response = await quickchatService.sendMessage({
    message: "Complex query...",
  });
} catch (error) {
  if (error instanceof ValidationError) {
    // Input-Fehler
    console.error("Invalid input:", error.message);
  } else if (error.message.includes("rate limit")) {
    // Rate Limit erreicht
    console.warn("Rate limit - using fallback");
    // Fallback-Provider nutzen
  } else {
    // Andere Fehler
    logger.error({ error }, "QuickChat error");
  }
}
```

### 3. Token-Optimierung

```typescript
// Lange Konversationen begrenzen
const session = await quickchatService.getSession(sessionId);
if (session.messages.length > 20) {
  // Nur letzte 10 Nachrichten behalten
  session.messages = session.messages.slice(-10);
  await quickchatService.updateSession(session);
}

// Max Tokens setzen
await quickchatService.sendMessage({
  message: "Summarize this document...",
  preferences: {
    maxTokens: 500, // Kurze Antwort
  },
});
```

### 4. Caching

```typescript
// Capabilities cachen
let cachedCapabilities: QuickChatCapabilities | null = null;
let cacheExpiry = 0;

async function getCapabilities() {
  if (cachedCapabilities && Date.now() < cacheExpiry) {
    return cachedCapabilities;
  }

  cachedCapabilities = await quickchatService.getCapabilities();
  cacheExpiry = Date.now() + 3600000; // 1 Stunde

  return cachedCapabilities;
}
```

### 5. Streaming (TODO)

```typescript
// Streaming für lange Antworten
const stream = await quickchatService.sendMessageStream({
  message: "Write a detailed report on...",
  preferences: {
    stream: true,
  },
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

---

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { quickchatService } from "./quickchatService.js";

describe("QuickChatService", () => {
  describe("sendMessage", () => {
    it("should create session if not provided", async () => {
      const result = await quickchatService.sendMessage({
        message: "Hello",
      });

      expect(result.sessionId).toBeDefined();
      expect(result.message.role).toBe("assistant");
    });

    it("should execute commands", async () => {
      const result = await quickchatService.sendMessage({
        message: "/hilfe",
      });

      expect(result.message.content).toContain("Verfügbare Befehle");
    });
  });

  describe("executeCommand", () => {
    it("should handle /rechnung command", async () => {
      const session = await quickchatService.createSession({});
      const result = await quickchatService.executeCommand(
        "/rechnung Test",
        session,
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("type", "invoice");
    });
  });
});
```

### Integration Tests

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("QuickChat API", () => {
  it("should process message", async () => {
    const response = await request(app).post("/api/quickchat/message").send({
      message: "Hello, QuickChat!",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.message).toBeDefined();
  });

  it("should list capabilities", async () => {
    const response = await request(app).get("/api/quickchat/capabilities");

    expect(response.status).toBe(200);
    expect(response.body.data.providers).toBeInstanceOf(Array);
    expect(response.body.data.features.vision).toBeDefined();
  });
});
```

---

## Troubleshooting

### Problem: AI-Antwort zu langsam

**Symptom:** Response-Zeit >10 Sekunden

**Lösungen:**

1. Kleineres Model verwenden (`gpt-3.5-turbo` statt `gpt-4`)
2. `maxTokens` begrenzen
3. Lokalen Provider nutzen (Ollama)
4. Streaming aktivieren

```typescript
preferences: {
  model: "gpt-3.5-turbo",
  maxTokens: 500
}
```

---

### Problem: Rate Limit Exceeded

**Symptom:** `429 Too Many Requests`

**Lösungen:**

1. Fallback-Provider konfigurieren
2. Request-Throttling implementieren
3. Premium-Tier nutzen

```typescript
// Automatischer Fallback
const result = await quickchatService.sendMessage({
  message: "...",
  preferences: {
    provider: "openai", // Falls Rate Limit, automatisch Fallback
  },
});
```

---

### Problem: Tool Execution Failed

**Symptom:** "Tool execution failed" in Logs

**Lösungen:**

1. Tool-Permissions prüfen
2. Tool-Parameter validieren
3. Database-Verbindung prüfen

```bash
# Logs prüfen
grep "Tool execution failed" logs/app.log

# Tool-Status prüfen
GET /api/quickchat/capabilities
# -> tools: [...]
```

---

### Problem: Session nicht gefunden

**Symptom:** `NotFoundError: Session not found`

**Lösungen:**

1. Session-ID korrekt übergeben
2. Session-Expiry prüfen
3. Neue Session erstellen

```typescript
// Session validieren
const session = await quickchatService.getSession(sessionId);
if (!session) {
  // Neue Session erstellen
  session = await quickchatService.createSession({ userId });
}
```

---

## Changelog

### Version 2.0.0 (2025-12-20)

**✅ Neue Features:**

- Vollständige AI-Komponenten-Integration
- Multi-Provider-Support (8 Provider)
- Tool-Execution mit 15+ Tools
- Vision, Audio, Translation Capabilities
- Workflow-Engine Integration
- Session-Management mit Persistence
- Embedding & Semantic Search
- Knowledge Base Integration
- Umfassende JSDoc-Dokumentation
- Production-ready Service-Layer

**🔧 Verbesserungen:**

- Trennung Router/Service-Layer
- Strukturiertes Logging mit Pino
- Zod-Validierung für alle Endpoints
- Error-Handling mit StandardError
- Performance-Optimierungen
- Token-Usage-Tracking

**📚 Dokumentation:**

- Vollständige API-Dokumentation
- Provider-Guides
- Tool & Workflow-Beschreibungen
- Verwendungsbeispiele
- Best Practices
- Troubleshooting-Guide

**🔄 Breaking Changes:**

- `POST /api/quickchat` → `POST /api/quickchat/message`
- Session-Format geändert (jetzt mit userId, preferences)
- Command-Response-Format standardisiert

---

### Version 0.2.0 (2025-12-01)

- Initiale Version mit Basic Chat
- Slash Commands
- In-Memory Sessions
- Einfache Pattern-basierte Antworten

---

## Roadmap

### Q1 2026

- [ ] Streaming Support
- [ ] Voice Chat (Real-time)
- [ ] Custom Tool Registration API
- [ ] Workflow-Builder UI
- [ ] Advanced RAG mit Vector DB
- [ ] Multi-Modal Inputs (Bild + Text)

### Q2 2026

- [ ] Fine-Tuning Support
- [ ] Custom Model Integration
- [ ] A/B Testing für Provider
- [ ] Cost Tracking & Analytics
- [ ] Multi-Tenancy Support

---

## Support

**Dokumentation:** [/docs/AI_INTEGRATION.md](../../../../docs/AI_INTEGRATION.md)  
**API-Reference:** [/docs/api/API_DOCUMENTATION.md](../../../../docs/api/API_DOCUMENTATION.md)  
**Issues:** GitHub Issues

---

**Letzte Aktualisierung:** 2025-12-20  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
