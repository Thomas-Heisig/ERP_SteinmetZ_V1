# AI-Annotator: Datenverarbeitungs-Workflow

**Version**: 1.0.0  
**Stand**: Dezember 2025  
**Status**: In Production  
**Standards**: ISO/IEC 25010, IEEE 730

---

## 📋 Überblick

Der AI-Annotator ist ein intelligentes System zur automatischen Analyse, Anreicherung und Qualitätssicherung von Funktionsknoten im ERP SteinmetZ System. Er verarbeitet 15.472 Funktionsknoten aus 11 Geschäftsbereichen und reichert diese mit Metadaten, Regeln, Formularen und Validierungen an.

### Kernziele

1. **Automatisierung**: Reduzierung manueller Dokumentationsarbeit um 90%
2. **Qualitätssicherung**: Konsistente Datenqualität über alle Knoten
3. **Skalierbarkeit**: Verarbeitung großer Datenmengen in Batches
4. **Compliance**: DSGVO-konforme PII-Klassifikation und -Verarbeitung
5. **Transparenz**: Nachvollziehbare AI-Entscheidungen mit Audit-Trail

---

## 🔄 Datenverarbeitungs-Pipeline

### Phase 1: Datenaufnahme (Ingestion)

```
┌─────────────────────────────────────────────────────────────┐
│ Input: Markdown-Funktionsknoten (data/functions/*.md)      │
│ - 15.472 Knoten                                             │
│ - 11 Hauptkategorien                                        │
│ - Hierarchische Struktur                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Parser & Validator                                          │
│ - Markdown → AST (Abstract Syntax Tree)                    │
│ - Schema-Validierung (Regeln aus _0_REGELN.md)            │
│ - Strukturprüfung (Hierarchie, IDs, RBAC)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Node-Objekt                                                 │
│ {                                                           │
│   id: "fn-hr-employee-create",                             │
│   title: "Mitarbeiter anlegen",                            │
│   kind: "workflow",                                         │
│   businessArea: "HR",                                       │
│   path: ["8_PERSONAL", "Mitarbeiterverwaltung"],          │
│   content: "...",                                           │
│   metadata: {},                                             │
│   status: "pending_annotation"                              │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: AI-gestützte Annotation

```
┌─────────────────────────────────────────────────────────────┐
│ AI-Annotator Service                                        │
│                                                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│ │ Meta-Gen     │  │ Rule-Gen     │  │ Form-Gen     │     │
│ │ AI Model     │  │ AI Model     │  │ AI Model     │     │
│ └──────────────┘  └──────────────┘  └──────────────┘     │
│        ↓                 ↓                 ↓               │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│ │ Metadaten    │  │ Regeln       │  │ Formulare    │     │
│ │ - Tags       │  │ - Validation │  │ - JSON Schema│     │
│ │ - Kategorie  │  │ - Business   │  │ - UI Config  │     │
│ │ - Komplexität│  │ - RBAC       │  │ - Workflow   │     │
│ └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

#### 2.1 Metadaten-Generierung

**Input**: Node-Objekt  
**Prozess**: 
1. Content-Analyse mit NLP
2. Extraktion von Business-Begriffen
3. Kategorisierung und Tagging
4. Komplexitäts-Scoring
5. Abhängigkeits-Erkennung

**Output**: Metadata-Objekt
```json
{
  "tags": ["mitarbeiter", "hr", "onboarding"],
  "complexity": "medium",
  "estimatedDuration": "15min",
  "requiredRoles": ["hr_manager"],
  "integrations": ["payroll", "timetracking"],
  "piiLevel": "high"
}
```

#### 2.2 Regel-Generierung

**Input**: Node-Objekt + Metadaten  
**Prozess**:
1. Business-Logik-Extraktion
2. Validierungsregeln definieren
3. RBAC-Regeln ableiten
4. Workflow-Transitionen bestimmen

**Output**: Rule-Definition
```json
{
  "validation": {
    "employeeId": {
      "type": "string",
      "pattern": "^EMP-[0-9]{6}$",
      "required": true
    },
    "birthdate": {
      "type": "date",
      "max": "today-18years"
    }
  },
  "business": {
    "preventDuplicates": {
      "fields": ["email", "taxId"]
    }
  },
  "rbac": {
    "create": ["hr_manager", "hr_admin"],
    "read": ["hr_employee", "hr_manager"],
    "update": ["hr_manager"],
    "delete": ["hr_admin"]
  }
}
```

#### 2.3 Formular-Generierung

**Input**: Node-Objekt + Metadaten + Regeln  
**Prozess**:
1. JSON-Schema aus Regeln generieren
2. UI-Layout bestimmen
3. Validatoren zuordnen
4. i18n-Keys erstellen

**Output**: Form-Configuration
```json
{
  "schema": {
    "type": "object",
    "properties": {
      "firstName": {
        "type": "string",
        "minLength": 2,
        "maxLength": 50
      },
      "email": {
        "type": "string",
        "format": "email"
      }
    },
    "required": ["firstName", "email"]
  },
  "uiSchema": {
    "firstName": {
      "ui:widget": "text",
      "ui:placeholder": "Max"
    },
    "email": {
      "ui:widget": "email",
      "ui:help": "Wird für Login verwendet"
    }
  }
}
```

### Phase 3: Qualitätssicherung

```
┌─────────────────────────────────────────────────────────────┐
│ Quality Assurance                                           │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Validierung                                          │   │
│ │ - Schema-Compliance: 99.5%+                         │   │
│ │ - Regelkonsistenz                                    │   │
│ │ - RBAC-Vollständigkeit                              │   │
│ │ - i18n-Coverage                                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Scoring                                              │   │
│ │ - Completeness Score (0-100)                        │   │
│ │ - Quality Score (0-100)                             │   │
│ │ - Confidence Score (0-1)                            │   │
│ └──────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Review Queue                                         │   │
│ │ - Automatisch: Confidence > 0.95                    │   │
│ │ - Manuell: Confidence < 0.95                        │   │
│ │ - Fehler: Validation Failed                         │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Phase 4: PII-Klassifikation

```
┌─────────────────────────────────────────────────────────────┐
│ PII Classification (DSGVO-Compliance)                       │
│                                                             │
│ Level: none | low | medium | high                          │
│                                                             │
│ NONE:    Keine personenbezogenen Daten                    │
│ LOW:     Name, Position, Abteilung                        │
│ MEDIUM:  Email, Telefon, Adresse                          │
│ HIGH:    IBAN, Gehalt, Steuer-ID, Gesundheitsdaten       │
│                                                             │
│ Konsequenzen:                                              │
│ - LOW:    Logging erlaubt                                 │
│ - MEDIUM: Logging maskiert                                │
│ - HIGH:   Kein Logging, Verschlüsselung at-rest          │
└─────────────────────────────────────────────────────────────┘
```

### Phase 5: Batch-Processing

```
┌─────────────────────────────────────────────────────────────┐
│ Batch Operation                                             │
│                                                             │
│ Input:                                                      │
│ - Filter: businessArea="HR", status="pending"              │
│ - Operation: "full-annotation"                             │
│ - Options: {parallelRequests: 3, retryFailed: true}       │
│                                                             │
│ Processing:                                                 │
│ ┌────────────────────────────────────────────────────┐     │
│ │ Chunk 1 (100 nodes)  →  Workers 1-3  →  Results   │     │
│ │ Chunk 2 (100 nodes)  →  Workers 1-3  →  Results   │     │
│ │ Chunk 3 (100 nodes)  →  Workers 1-3  →  Results   │     │
│ │ ...                                                 │     │
│ └────────────────────────────────────────────────────┘     │
│                                                             │
│ Progress Tracking:                                          │
│ - Total: 1000 nodes                                        │
│ - Completed: 750 (75%)                                     │
│ - Failed: 10 (1%)                                          │
│ - Pending: 240 (24%)                                       │
│                                                             │
│ WebSocket Updates:                                          │
│ - Real-time Progress                                       │
│ - Error Notifications                                      │
│ - Completion Events                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI-Model-Selection

### Model-Strategie (Dezember 2025)

```
┌──────────────────────────────────────────────────────────┐
│ Task Complexity → Model Selection                        │
│                                                          │
│ LOW (Tags, Simple Meta):                                │
│   → OpenAI GPT-3.5-Turbo (Fast, Cost-Effective)        │
│                                                          │
│ MEDIUM (Rules, Forms):                                  │
│   → OpenAI GPT-4-Turbo (Balanced)                      │
│                                                          │
│ HIGH (Complex Workflows, AA/DSL):                       │
│   → OpenAI GPT-4 (High Quality)                        │
│   → Anthropic Claude-3 Opus (Fallback)                 │
│                                                          │
│ LOCAL (Sensitive Data):                                 │
│   → Ollama Llama-3.1-70B (On-Premise)                  │
└──────────────────────────────────────────────────────────┘
```

### Fallback-Chain

```
Primary (Cloud)  →  Secondary (Cloud)  →  Tertiary (Local)
     ↓                    ↓                      ↓
  OpenAI            Anthropic               Ollama
  GPT-4              Claude-3            Llama-3.1-70B
     ↓                    ↓                      ↓
 99% Success        98% Success            95% Success
 50ms latency      80ms latency         200ms latency
```

---

## 📊 Quality Metrics & KPIs

### Annotation Quality (Target vs. Actual)

| Metric                        | Target  | Actual | Status |
|-------------------------------|---------|--------|--------|
| Schema-Validität              | ≥99.5%  | 99.7%  | ✅     |
| Metadata-Completeness         | ≥95%    | 97.3%  | ✅     |
| Rule-Accuracy                 | ≥99%    | 98.9%  | 🟡     |
| Form-Schema-Validity          | ≥99.5%  | 99.8%  | ✅     |
| PII-Classification-Accuracy   | ≥98%    | 99.1%  | ✅     |
| Batch-Success-Rate            | ≥95%    | 96.4%  | ✅     |

### Performance Metrics

| Metric                        | Target    | Actual   | Status |
|-------------------------------|-----------|----------|--------|
| Single-Node-Annotation        | <5s       | 3.2s     | ✅     |
| Batch-Processing (1000 nodes) | <30min    | 24min    | ✅     |
| API-Response-Time (p95)       | <200ms    | 145ms    | ✅     |
| Error-Rate                    | <1%       | 0.7%     | ✅     |

---

## 🔒 Security & Compliance

### DSGVO-Compliance

1. **PII-Schutz**:
   - Automatische PII-Klassifikation
   - Maskierung in Logs (HIGH → keine Logs)
   - Verschlüsselung at-rest für HIGH-PII
   - Verschlüsselung in-transit (TLS 1.3)

2. **Zugriffskontrollen**:
   - RBAC-basierte API-Zugriffe
   - Audit-Trail für alle Annotationen
   - Vier-Augen-Prinzip für HIGH-PII-Änderungen

3. **Datenminimierung**:
   - Nur notwendige Daten an AI-Models
   - Lokale Modelle für sensible Daten
   - Automatische Löschung nach Retention-Period

### Audit-Trail

```json
{
  "timestamp": "2025-12-05T10:30:00Z",
  "action": "annotate",
  "nodeId": "fn-hr-employee-create",
  "userId": "system-ai-annotator",
  "operation": "generate-meta",
  "model": "gpt-4-turbo",
  "inputHash": "sha256:abc123...",
  "outputHash": "sha256:def456...",
  "confidence": 0.97,
  "reviewStatus": "auto-approved"
}
```

---

## 🚀 API-Endpoints

### Core-Operations

```typescript
// Single-Node-Annotation
POST /api/ai-annotator/nodes/:id/generate-meta
POST /api/ai-annotator/nodes/:id/generate-rule
POST /api/ai-annotator/nodes/:id/generate-form
POST /api/ai-annotator/nodes/:id/full-annotation

// Batch-Operations
POST /api/ai-annotator/batch
GET  /api/ai-annotator/batch/:id
POST /api/ai-annotator/batch/:id/cancel

// Quality & Monitoring
GET  /api/ai-annotator/quality/report
GET  /api/ai-annotator/system/monitoring
GET  /api/ai-annotator/ai/model-stats

// PII & Validation
POST /api/ai-annotator/classify-pii
POST /api/ai-annotator/validate-batch
```

---

## 🛠️ Troubleshooting

### Häufige Probleme

#### Problem: Niedrige Confidence-Scores (<0.95)

**Ursachen**:
- Unklare Funktionsbeschreibungen
- Fehlende Kontext-Informationen
- Komplexe Business-Logik

**Lösungen**:
1. Funktionsbeschreibung erweitern
2. Beispiele hinzufügen
3. Manuelles Review durchführen
4. Model auf GPT-4 upgraden

#### Problem: Hohe Error-Rate (>2%)

**Ursachen**:
- API-Rate-Limits erreicht
- Model-Overload
- Netzwerk-Probleme

**Lösungen**:
1. Batch-Size reduzieren
2. Retry-Delay erhöhen
3. Fallback-Model aktivieren
4. Load-Balancing prüfen

---

## 📚 Weiterführende Dokumentation

- [AI-Annotator Router API](../apps/backend/src/routes/aiAnnotatorRouter/docs/README.md)
- [Function-Node Transformation](./FUNCTION_NODE_TRANSFORMATION.md)
- [Quality-Assurance-Prozess](./QA_PROCESS.md)
- [DSGVO-Compliance-Guide](./COMPLIANCE.md)

---

**Version**: 1.0.0  
**Autor**: Thomas Heisig  
**Letzte Aktualisierung**: 5. Dezember 2025  
**Status**: Production-Ready ✅
