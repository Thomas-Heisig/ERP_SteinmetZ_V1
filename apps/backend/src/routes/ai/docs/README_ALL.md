## 🎯 Zusammenfassung – Alle API‑Routen („AI‑Router“) und deren Funktionen  
### Ziel: Frontend‑Entwicklung (Aufruf‑ und Daten‑Schema‑Definition)

> **Hinweis** – Das Backend besteht aus vielen Service‑ und Layer‑Komponenten (Provider, Services, Utilities, Workflow‑Engine, …).  
> Für das Frontend sind jedoch ausschließlich die **öffentlichen HTTP‑Endpoints** relevant, die im `aiRouter.ts` definiert sind.  
> Die nachfolgende Übersicht listet **jede Route**, deren **HTTP‑Methode**, **Zweck**, **erwartetes Request‑Payload**, **Response‑Schema** (inkl. Beispiel) und **Kurz‑Hinweise** zu Fehler‑ und Authentifizierungs‑Verhalten.

---

## 1. Übersicht aller Endpunkte

| HTTP‑Methode | Pfad                               | Kategorie                     | Kurz‑Beschreibung |
|---------------|------------------------------------|------------------------------|-------------------|
| **GET**       | `/ai/models`                       | Model‑Management             | Liste aller konfigurierten KI‑Modelle |
| **POST**      | `/ai/chat`                         | Chat‑Session‑Start           | Neue Session anlegen |
| **POST**      | `/ai/chat/:sessionId/message`      | Chat‑Nachricht senden         | Nachricht zu einer bestehenden Session |
| **GET**       | `/ai/sessions`                     | Session‑Übersicht            | Alle aktiven Sessions |
| **DELETE**    | `/ai/chat/:sessionId`              | Session löschen              | Entfernt eine Session inkl. Historie |
| **POST**      | `/ai/audio/transcribe`             | Audio → Text (STT)           | Audiodatei hochladen → Transkription |
| **POST**      | `/ai/translate`                    | Text‑Übersetzung             | Übersetzt über konfiguriertes Engine |
| **GET**       | `/ai/settings`                     | Konfiguration laden           | Alle System‑Settings |
| **PUT**       | `/ai/settings`                     | Konfiguration speichern       | komplettes Settings‑Objekt überschreiben |
| **PATCH**     | `/ai/settings/:key`                | Einzel‑Setting ändern         | Update nur eines Schlüssels |
| **GET**       | `/ai/tools`                        | Tool‑Katalog                 | Alle registrierten Tools & Metadaten |
| **POST**      | `/ai/tools/:name/run`              | Tool ausführen               | Aufruf eines einzelnen Tools |
| **GET**       | `/ai/workflows`                    | Workflow‑Katalog             | Alle registrierten Workflows |
| **POST**      | `/ai/workflow/:name/run`           | Workflow ausführen           | Start einer definierten Workflow‑Instanz |
| **GET**       | `/ai/status`                       | System‑Health & Metriken     | Status‑Report (Modelle, Tools, Workflows, Ressourcen) |
| **GET**       | `/ai/diagnostics`                  *(optional – falls aktiviert)* | System‑Diagnose | Komplettes Diagnose‑Report (Provider, Tools, Workflows, Audio, System‑Info) |

> **Alle anderen Services (Embedding, Vision, Audio‑Service, …)** werden **intern** von den oben genannten Endpunkten aufgerufen und sind für das Front‑End nicht direkt adressierbar.

---

## 2. Detail‑Beschreibung der einzelnen Routen  

### 2.1 Model‑Management  

| **Methode** | **Pfad** | **Beschreibung** |
|------------|----------|-----------------|
| `GET` | `/ai/models` | Gibt ein Array von **Model‑Definitionen** zurück (Name, Provider, Modell‑ID, Aktiv‑Status, Capabilities, Beschreibung). |

**Response‑Beispiel**

```json
{
  "models": [
    {
      "name": "gpt‑4o‑mini",
      "provider": "openai",
      "model": "gpt-4o-mini",
      "active": true,
      "capabilities": ["chat","tools","json_mode","reasoning"],
      "description": "OpenAI GPT‑4o Mini"
    },
    {
      "name": "mistral‑latest",
      "provider": "ollama",
      "model": "mistral:latest",
      "active": true,
      "capabilities": ["chat","tools"],
      "description": "Ollama Mistral"
    }
    // … weitere Modelle
  ]
}
```

> **Hinweis** – Frontend kann das Model‑Dropdown dynamisch aus dieser Liste bauen.  

---

### 2.2 Chat & Session‑Handling  

| **Methode** | **Pfad** | **Body / Params** | **Beschreibung** |
|------------|----------|--------------------|-----------------|
| `POST` | `/ai/chat` | `{ "model": "gpt-4o-mini" }` (optional) | Erstellt eine neue Chat‑Session, legt das gewählte Modell fest, erzeugt eine eindeutige **sessionId** und gibt die leere Historie zurück. |
| `POST` | `/ai/chat/:sessionId/message` | `{ "message": "Wie ist der Lagerbestand?" }` | Fügt die Nutzer‑Nachricht zur Session‑Historie hinzu, ruft den konfigurierten **Chat‑Service** (inkl. Provider‑Routing, Tool‑Aufrufe, ggf. Workflow‑Einbindung) auf und gibt die KI‑Antwort zurück. |
| `GET` | `/ai/sessions` | – | Liefert eine Liste aller aktiven Sessions (ID, Modell, Erstellungs‑/Letztes‑Update‑Zeitpunkt, Anzahl Nachrichten). |
| `DELETE` | `/ai/chat/:sessionId` | – | Löscht die Session komplett (Memory‑Eintrag + Persistenz‑Datei, falls aktiviert). |

**Response‑Beispiel (Session‑Erstellung)**  

```json
{
  "sessionId": "chat_8f4b2c7a-6e1d-4b3f-9021-1a2b3c4d5e6f",
  "model": "gpt-4o-mini",
  "createdAt": "2025‑11‑17T10:42:12.000Z",
  "messages": []
}
```

**Response‑Beispiel (Nachricht + KI‑Antwort)**  

```json
{
  "sessionId": "chat_8f4b2c7a-6e1d-4b3f-9021-1a2b3c4d5e6f",
  "messages": [
    { "role": "user", "content": "Wie ist der Lagerbestand?" },
    { "role": "assistant", "content": "Der aktuelle Bestand von Produkt X beträgt 37 Stück." }
  ],
  "usage": {
    "tokens_in": 45,
    "tokens_out": 78,
    "duration_ms": 620
  }
}
```

> **Fehler** – `404` wenn `sessionId` nicht existiert, `400` bei fehlendem `message`.  

---

### 2.3 Audio (Speech‑to‑Text)  

| **Methode** | **Pfad** | **Upload** | **Beschreibung** |
|------------|----------|-----------|-----------------|
| `POST` | `/ai/audio/transcribe` | `multipart/form-data` ⇒ Feld **audio** (Datei, z. B. `.wav`, `.mp3`) | Das Audio‑File wird an den **Audio‑Service** weitergeleitet (standard: OpenAI Whisper). Gibt den transkribierten Text zurück. |

**Response‑Beispiel**

```json
{
  "text": "Bitte erstelle eine Rechnung über 1 200 € für Kunde Müller.",
  "meta": {
    "provider": "openai",
    "model": "whisper-1",
    "duration_ms": 2140,
    "file": "voice_20251117_104200.wav"
  }
}
```

> **Fehler** – `415` bei falschem MIME‑Typ, `500` bei Provider‑Fehlern.  

---

### 2.4 Übersetzung  

| **Methode** | **Pfad** | **Body** | **Beschreibung** |
|------------|----------|----------|-----------------|
| `POST` | `/ai/translate` | `{ "text": "...", "targetLang": "de", "engine": "openai" }` (engine optional) | Übersetzt `text` in die Zielsprache. Nutzt standardmäßig den in `translationConfig.defaultEngine` konfigurierten Provider (`openai`). |

**Response‑Beispiel**

```json
{
  "text": "Bitte erstelle eine Rechnung über 1 200 € für Kunde Müller.",
  "meta": {
    "engine": "openai",
    "targetLang": "Deutsch",
    "model": "gpt-4o-mini",
    "duration_ms": 480
  }
}
```

> **Fehler** – `400` bei fehlendem `text`/`targetLang`.  

---

### 2.5 Einstellungen (Settings)  

| **Methode** | **Pfad** | **Body** | **Beschreibung** |
|------------|----------|----------|-----------------|
| `GET` | `/ai/settings` | – | Gibt das komplette **Settings‑JSON** zurück (System‑Version, Default‑Provider/Model, Logging‑Level, Cache‑Optionen, usw.). |
| `PUT` | `/ai/settings` | Ganzes Settings‑Objekt | Überschreibt die Persistente Settings‑Datei (`./config/ai_settings.json`). |
| `PATCH` | `/ai/settings/:key` | `{ "value": … }` | Aktualisiert **einzelnen** Schlüssel (z. B. `default_provider`). |

**Response‑Beispiel (GET)**  

```json
{
  "system_version": "1.3.2",
  "default_provider": "openai",
  "default_model": "gpt-4o-mini",
  "log_level": "info",
  "max_parallel_requests": 3,
  "cache_enabled": true,
  "autosave_interval_min": 30,
  "last_updated": "2025‑11‑17T09:58:00.000Z"
}
```

> **Hinweis** – Änderungen werden sofort in den `aiRouter`‑Services übernommen (z. B. neuer Provider wird beim nächsten Aufruf verwendet).  

---

### 2.6 Tool‑Katalog und Ausführung  

| **Methode** | **Pfad** | **Body** | **Beschreibung** |
|------------|----------|----------|-----------------|
| `GET` | `/ai/tools` | – | Liefert **alle registrierten Tools** inkl. Name, Kategorie, Parameter‑Schema, Beispiel‑Aufruf, letzte Nutzung. |
| `POST` | `/ai/tools/:name/run` | `{ "params": { … } }` | Führt das angegebene Tool synchron aus, gibt das Ergebnis (String oder JSON) zurück. Unterstützt **Timeout** (standard 10 s) und Fehler‑Reporting. |

**Response‑Beispiel (Tool‑Liste)**  

```json
{
  "tools": [
    {
      "name": "calculate",
      "description": "Allgemeiner mathematischer Rechner",
      "category": "calculations",
      "parameters": {
        "expression": "string"
      },
      "example": "calculate({ expression: \"2+3*4\" })",
      "last_used": "2025‑11‑16T14:22:08.000Z"
    },
    {
      "name": "search_database",
      "description": "SQL‑Abfrage auf konfigurierten DBs",
      "category": "database",
      "parameters": {
        "query": "string",
        "connectionString": "string"
      },
      "example": "search_database({ query: \"SELECT * FROM orders\" })",
      "last_used": null
    }
    // …
  ]
}
```

**Response‑Beispiel (Tool‑Ausführung)**  

```json
{
  "success": true,
  "name": "calculate",
  "result": {
    "expression": "2+3*4",
    "parsed": "2 + (3 * 4)",
    "value": 14,
    "formatted": "14",
    "type": "number"
  },
  "meta": {
    "duration_ms": 45,
    "tool_version": "2.1"
  }
}
```

---

### 2.7 Workflow‑Katalog und Ausführung  

| **Methode** | **Pfad** | **Body** | **Beschreibung** |
|------------|----------|----------|-----------------|
| `GET` | `/ai/workflows` | – | Gibt alle **registrierten Workflows** zurück (Name, Beschreibung, Schritte‑Array, letzter Lauf). |
| `POST` | `/ai/workflow/:name/run` | `{ "input": { … } }` (optional) | Startet den Workflow **synchron** über die **Workflow‑Engine**. Ergebnis ist das finale AI‑Response des letzten Schritts (oder ein strukturiertes Fehler‑Objekt). |

**Response‑Beispiel (Workflow‑Liste)**  

```json
{
  "workflows": [
    {
      "name": "order_processing",
      "description": "Bestellung anlegen → Lager prüfen → Rechnung erstellen",
      "steps": [
        { "type": "tool_call", "tool": "create_order", "params": { "customer": "{{input.customer}}" } },
        { "type": "if", "condition": "{{last_result.success}}", "steps": [{ "type": "tool_call", "tool": "check_inventory", "params": { "product": "{{input.product}}" } }]},
        { "type": "tool_call", "tool": "create_invoice", "params": { "orderId": "{{last_result.orderId}}" } }
      ],
      "lastRun": "2025‑11‑15T08:31:41.000Z"
    }
    // …
  ]
}
```

**Response‑Beispiel (Workflow‑Ausführung)**  

```json
{
  "workflow": "order_processing",
  "input": { "customer": "Müller GmbH", "product": "Artikel‑X" },
  "output": {
    "orderId": 1023,
    "invoiceId": 587,
    "status": "abgeschlossen"
  },
  "meta": {
    "duration_ms": 1830,
    "steps_executed": 3,
    "tool_calls": [
      { "tool": "create_order", "result": "success" },
      { "tool": "check_inventory", "result": "in_stock" },
      { "tool": "create_invoice", "result": "created" }
    ]
  }
}
```

> **Fehler‑Handling** – Bei `stop`‑Modus bricht die Engine ab und liefert das bislang erreichte Ergebnis + Fehlermeldung; `skip` bzw. `continue` Modus werden in `workflowEngine`‑Konfiguration unterstützt.

---

### 2.8 System‑Status & Diagnose  

| **Methode** | **Pfad** | **Beschreibung** |
|------------|----------|-----------------|
| `GET` | `/ai/status` | Liefert einen **Kurz‑Health‑Report** (Anzahl Modelle, Tools, Workflows, aktuelle System‑Ressourcen, Uptime, eventuelle Warnungen). |
| `GET` | `/ai/diagnostics` *(optional – aktivierbar via Settings)* | Sehr detaillierter Report: Provider‑Verfügbarkeit, Tool‑ und Workflow‑Inventur, Audio‑Service‑Status, System‑Info (CPU‑Load, RAM, Disk u. a.). |

**Response‑Beispiel (Status)**  

```json
{
  "timestamp": "2025‑11‑17T12:00:04.000Z",
  "models": 12,
  "tools": 35,
  "workflows": 9,
  "sessions_active": 4,
  "system": {
    "hostname": "erp‑server-01",
    "platform": "linux",
    "cpu_cores": 8,
    "load_average": [0.42, 0.55, 0.61],
    "memory_total_gb": 32,
    "memory_free_gb": 19.3,
    "uptime_minutes": 4721
  },
  "warnings": []
}
```

**Response‑Beispiel (Diagnostics)** – Siehe Analyse‑Zusammenfassung von `diagnosticService.ts` (großer JSON‑Block mit Provider‑Status, Tool‑Liste, Workflow‑Liste, Audio‑Service‑Info, System‑Info).

---

## 3. Gemeinsame Daten‑Modelle (für Front‑End‑Typisierung)

| Modell | Felder (relevant) | Beschreibung |
|--------|-------------------|--------------|
| **ChatMessage** | `role: "system"|"user"|"assistant"`, `content: string`, `timestamp?: string` | Einzelne Nachricht innerhalb einer Session. |
| **AIResponse** | `text: string`, `data?: any`, `meta: { provider, model, duration_ms, … }`, `errors?: string[]` | Einheitliches Antwort‑Objekt, das von allen Services zurückgegeben wird (Chat, Audio, Translation, Tools, Workflows). |
| **ToolDefinition** | `name`, `description`, `category`, `parameters`, `example`, `last_used?` | Wird von `/ai/tools` zurückgeliefert. |
| **WorkflowDefinition** | `name`, `description`, `steps: WorkflowStep[]`, `lastRun?` | Wird von `/ai/workflows` zurückgeliefert. |
| **WorkflowStep** | `type` (tool_call, if, loop, workflow_call, …), je nach Typ weitere Felder (`tool`, `params`, `condition`, `steps`, …) | Intern von der Workflow‑Engine benutzt; Front‑End kann zur Visualisierung/Editor‑Funktion genutzt werden. |
| **Settings** | Siehe `settingsService.ts` – u. a. `default_provider`, `default_model`, `log_level`, `max_parallel_requests`, `cache_enabled`, … | Konfigurations‑Objekt, das über GET/PUT/PATCH verwaltet wird. |

> **TypeScript‑Typ‑Definition** (aus `types.ts`) kann direkt ins Front‑End importiert werden, um **Typ‑Sicherheit** zu gewährleisten.

---

## 4. Fehler‑ und Authentifizierungs‑Verhalten (global)

| Situation | HTTP‑Status | JSON‑Body (Beispiel) |
|-----------|------------|----------------------|
| **Ungültige Parameter** | `400 Bad Request` | `{ "error": { "code": "ERR_VALIDATION", "message": "Missing field `text`", "status": 400 } }` |
| **Ressource nicht gefunden** (z. B. Session, Tool) | `404 Not Found` | `{ "error": { "code": "ERR_NOT_FOUND", "message": "Session 1234 not found", "status": 404 } }` |
| **Provider‑Fehler / Timeout** | `502 Bad Gateway` (Provider) oder `504 Gateway Timeout` | `{ "error": { "code": "ERR_PROVIDER", "message": "OpenAI request timed out", "status": 504 } }` |
| **Interner Server‑Fehler** | `500 Internal Server Error` | `{ "error": { "code": "ERR_INTERNAL", "message": "Unexpected error in tool `calculate`", "status": 500 } }` |
| **Kein API‑Key** (OpenAI, Vertex, etc.) | `401 Unauthorized` | `{ "error": { "code": "ERR_AUTH", "message": "Missing OPENAI_API_KEY", "status": 401 } }` |

> **Logging** – Alle Fehler werden über das zentrale `logger`‑Modul (JSON‑Lines) protokolliert; Front‑End kann das `error`‑Objekt direkt anzeigen.

---

## 5. Empfohlene Front‑End‑Implementierung  

1. **Initialisierung**  
   * Rufe `GET /ai/models` → fülle Model‑Dropdown.  
   * Rufe `GET /ai/tools` → baue Tool‑Catalog (z. B. für Autocomplete in Prompt‑Editor).  
   * Rufe `GET /ai/workflows` → zeige Workflow‑Übersicht / “Run workflow” UI.

2. **Chat‑Flow**  
   * Beim Öffnen einer Seite: `POST /ai/chat` → speichere `sessionId`.  
   * Für jede Benutzereingabe: `POST /ai/chat/:sessionId/message`.  
   * Zeige `messages`‑Array chronologisch; nutze `usage.tokens_in/out` für Kosten‑Anzeige.  
   * Bei `tool_calls` im `AIResponse.meta` (falls vorhanden) führe ggf. die jeweiligen Tools sofort aus und ergänze die Antwort (dies geschieht bereits im Backend, das Ergebnis wird zurückgeliefert).

3. **Werkzeug‑Aufruf**  
   * UI‑Komponente “Tool‑Runner” → Dropdown mit Namen aus `/ai/tools`.  
   * Formular‑Dynamik: Parameter‑Schema aus `parameters`.  
   * `POST /ai/tools/:name/run` → zeige `result` (String oder JSON‑Baum).  

4. **Workflow‑Ausführung**  
   * UI‑Komponente “Workflow‑Starter” → Auswahl aus `/ai/workflows`.  
   * Optionales Eingabe‑Objekt (`input`) über Formular.  
   * `POST /ai/workflow/:name/run` → zeige `output` + `meta.steps_executed`.  

5. **System‑Monitoring**  
   * Periodisches `GET /ai/status` (z. B. alle 30 s) → Dashboard mit Modell‑/Tool‑/Workflow‑Zahlen und Ressourcenauslastung.  
   * Bei Fehlermeldungen zeige klare Fehlermeldung aus `error.message`.  

6. **Einstellungen**  
   * Admin‑Bereich: `GET /ai/settings`, `PATCH /ai/settings/:key` (z. B. `default_provider`).  
   * Änderungen wirken sofort (z. B. neuer Provider wird beim nächsten Chat‑Aufruf verwendet).  

---

## 6. Kurz‑Zusammenfassung (Bullet‑Liste)

- **Model‑Endpoints** – `/ai/models` (GET)  
- **Chat‑ und Session‑Endpoints** – `/ai/chat` (POST), `/ai/chat/:id/message` (POST), `/ai/sessions` (GET), `/ai/chat/:id` (DELETE)  
- **Audio‑Transkription** – `/ai/audio/transcribe` (POST, multipart)  
- **Übersetzung** – `/ai/translate` (POST)  
- **Settings** – `/ai/settings` (GET/PUT), `/ai/settings/:key` (PATCH)  
- **Tool‑Katalog** – `/ai/tools` (GET)  
- **Tool‑Ausführung** – `/ai/tools/:name/run` (POST)  
- **Workflow‑Katalog** – `/ai/workflows` (GET)  
- **Workflow‑Ausführung** – `/ai/workflow/:name/run` (POST)  
- **System‑Status** – `/ai/status` (GET)  
- **Diagnose (optional)** – `/ai/diagnostics` (GET)

Alle Antworten folgen dem **einheitlichen `AIResponse`‑Schema** (Text + Meta + optional Data + Errors).  

Damit steht dem Front‑End sämtliche nötigen Informationen zur Verfügung, um dynamisch Modelle, Tools, Workflows und Systeme zu entdecken, zu starten und zu überwachen – komplett kompatibel mit der **Workflow‑Engine** und den übrigen Backend‑Services.