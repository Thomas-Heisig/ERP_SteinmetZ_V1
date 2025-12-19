Basierend auf der analysierten `aiRouter.ts` Datei, hier sind die erkannten Routen und Funktionen:

## 🌐 **AI Router - API Endpoints**

### **Model Management**

- `GET /ai/models` - Liefert verfügbare KI-Modelle

### **Chat System**

- `POST /ai/chat` - Erstellt neue Chat-Session
- `POST /ai/chat/:sessionId/message` - Sendet Nachricht an Session
- `GET /ai/sessions` - Listet alle aktiven Sessions
- `DELETE /ai/chat/:sessionId` - Löscht spezifische Session

### **Audio Processing (STT)**

- `POST /ai/audio/transcribe` - Transkribiert Audio zu Text (Speech-to-Text)

### **Translation Services**

- `POST /ai/translate` - Übersetzt Text zwischen Sprachen

### **Settings & Configuration**

- `GET /ai/settings` - Lädt Systemeinstellungen
- `PUT /ai/settings` - Speichert alle Einstellungen
- `PATCH /ai/settings/:key` - Aktualisiert einzelne Einstellung

### **Tools & Workflows**

- `GET /ai/tools` - Listet alle verfügbaren Tools
- `POST /ai/tools/:name/run` - Führt spezifisches Tool aus
- `GET /ai/workflows` - Listet alle verfügbaren Workflows
- `POST /ai/workflow/:name/run` - Führt spezifischen Workflow aus

### **System Status & Diagnostics**

- `GET /ai/status` - Systemstatus und Metriken

## 📋 **Detailierte Route-Beschreibungen**

### **1. Chat System Routes**

#### **Session Creation**

```typescript
POST / ai / chat;
```

**Body**: `{ model?: "gpt-4o-mini" }` (optional)
**Response**: Session-Objekt mit ID und Metadaten

#### **Message Handling**

```typescript
POST /ai/chat/:sessionId/message
```

**Body**: `{ message: "User input" }`
**Features**:

- Message Validation (nicht leer)
- Session Lookup
- Message Sanitization
- AI Response Generation
- Session Update

#### **Session Management**

```typescript
GET /ai/sessions              // Alle Sessions
DELETE /ai/chat/:sessionId    // Session löschen
```

### **2. Audio Processing**

#### **Speech-to-Text**

```typescript
POST / ai / audio / transcribe;
```

**Content-Type**: `multipart/form-data`
**File Field**: `audio`
**Features**:

- Multer File Upload
- Automatische Temp-Verzeichnis-Erstellung
- Audio Transkription Service

### **3. Translation Services**

#### **Text Translation**

```typescript
POST / ai / translate;
```

**Body**: `{ text: "Text", targetLang: "de", engine?: "openai" }`
**Required**: `text`, `targetLang`
**Optional**: `engine` (Default: "openai")

### **4. Settings Management**

#### **Complete Settings Cycle**

```typescript
GET /ai/settings              // Alle Einstellungen laden
PUT /ai/settings              // Alle Einstellungen speichern
PATCH /ai/settings/:key       // Einzelne Einstellung aktualisieren
```

### **5. Tools & Workflows Execution**

#### **Tools Management**

```typescript
GET /ai/tools                 // Alle Tools mit Metadaten
POST /ai/tools/:name/run      // Spezifisches Tool ausführen
```

**Tool Execution**: `{ success: true, name: "tool", result: ... }`

#### **Workflows Management**

```typescript
GET /ai/workflows             // Alle Workflows mit Metadaten
POST /ai/workflow/:name/run   // Workflow ausführen
```

**Workflow Execution**: `{ success: true, result: ... }` mit Debug-Modus

### **6. System Status**

#### **Health Check & Metrics**

```typescript
GET / ai / status;
```

**Response**:

- Timestamp
- Model Count
- Tool Count
- Workflow Count
- System Status

## 🔧 **Technische Integration**

### **Service Integration**

- **ModelService**: `getModelOverview()`
- **AudioService**: `transcribeAudio()`
- **TranslationService**: `translateText()`
- **SettingsService**: `loadSettings()`, `saveSettings()`, `updateSetting()`

### **Core System Integration**

- **SessionStore**: `createSession()`, `getSession()`, `removeSession()`, `chatSessions`
- **WorkflowEngine**: `executeWorkflow()`, `getWorkflowDefinitions()`, `listWorkflows()`
- **ToolRegistry**: `call()`, `getToolDefinitions()`, `count()`

### **Utility Integration**

- **Logger**: `log()` für strukturierte Protokollierung
- **Error Handling**: `errorResponse()` für standardisierte Fehler
- **AI Utils**: `sanitizeMessages()` für Nachrichtenbereinigung
- **Helpers**: `nowISO()` für Zeitstempel

## 🛡️ **Sicherheitsfeatures**

### **Input Validation**

- Message Length Checks
- Session Existence Validation
- Required Parameter Validation
- File Upload Validation

### **Error Handling**

- Structured Error Responses
- Graceful Degradation
- Comprehensive Error Logging
- User-Friendly Error Messages

## 📊 **Monitoring & Logging**

### **Request Logging**

- Chat Message Processing
- Audio Transcription Events
- Tool/Workflow Execution
- Error Events

### **Performance Tracking**

- Session Management Metrics
- Response Time Monitoring
- System Resource Usage

## 🎯 **Use Cases**

### **KI-Chat Anwendungen**

- Multi-Session Chat Management
- Context-Aware Conversations
- Model Selection Support

### **Datenverarbeitung**

- Audio-to-Text Conversion
- Multi-Language Translation
- Automated Workflows

### **System Administration**

- Settings Configuration
- Tool Management
- System Monitoring

### **Developer Tools**

- Tool Testing & Execution
- Workflow Development
- System Diagnostics

Der AI Router bietet ein umfassendes API-Gateway für das ERP-KI-Backend mit vollständiger Abdeckung aller KI-Funktionen, Session-Management und System-Administration.
