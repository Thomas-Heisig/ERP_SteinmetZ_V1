# 🏛️ ERP SteinmetZ – Gesamtkonzept Version 1.0

**Status**: Production Ready  
**Version**: 1.0.0  
**Datum**: Dezember 2025  
**Zielgruppe**: Steinmetzbetriebe, Handwerk, KMU

---

## 📋 Inhaltsverzeichnis

1. [Executive Summary](#executive-summary)
2. [Vision und Zielsetzung](#vision-und-zielsetzung)
3. [Kernarchitektur](#kernarchitektur)
4. [Unified Dashboard System](#unified-dashboard-system)
5. [KI-gestützte Entwicklung](#ki-gestützte-entwicklung)
6. [Funktionsmodule Version 1.0](#funktionsmodule-version-10)
7. [Technische Spezifikationen](#technische-spezifikationen)
8. [Datenmodell und Schemata](#datenmodell-und-schemata)
9. [Sicherheit und Compliance](#sicherheit-und-compliance)
10. [Roadmap und Phasen](#roadmap-und-phasen)

---

## 1. Executive Summary

ERP SteinmetZ ist ein **instruction-driven ERP-System**, das durch die Verschmelzung von **KI-Annotator** und **Funktionskatalog** ein einziges, intelligentes Dashboard bildet. Dieses Dashboard ermöglicht die automatische Generierung und Verwaltung von:

- **Funktionen** (Metadaten, Business Logic)
- **Formularen** (dynamische JSON-Schema-basierte Forms)
- **Dashboards** (regelbasierte Widget-Platzierung)
- **Berichten** (KPI-Tracking, Analytics)
- **Workflows** (Arbeitsanweisungen, Prozesse)

### Kernprinzipien

1. **Instruction-Driven**: Fachprozesse als Arbeitsanweisungen (AA/DSL) + JSON-Schemas
2. **KI moderiert, Determinismus führt aus**: KI-Schicht für Benutzerführung, deterministische Services für kritische Operationen
3. **Regelbasierte Automatisierung**: Navigation und Dashboards entstehen aus Modul-Manifesten
4. **RAG nur für Texte**: Kernzahlen werden ausschließlich deterministisch berechnet
5. **Tri-State Schema**: Jedes Feld kann `known | unknown | not_applicable` sein

### Differenzierung Version 1.0

In Version 1.0 sind **alle Grundfunktionen** aus dem Konzept implementiert:

- ✅ Unified Dashboard mit KI-Integration
- ✅ Alle 11 Hauptmodule (Dashboard bis System & Administration)
- ✅ Automatische Funktionsgenerierung
- ✅ Formular- und Schema-Management
- ✅ Basis-Analytics und Reporting
- ✅ RBAC und Compliance-Grundlagen

---

## 2. Vision und Zielsetzung

### 2.1 Vision

Ein **universelles Betriebssystem für Unternehmen**, das:

- Sich selbst an Geschäftsprozesse anpasst
- Durch KI kontinuierlich verbessert
- Deterministisch und nachvollziehbar arbeitet
- Für Steinmetzbetriebe optimiert, aber universell einsetzbar ist

### 2.2 Zielgruppen

1. **Primär**: Steinmetzbetriebe (5-50 Mitarbeiter)
2. **Sekundär**: Handwerksbetriebe allgemein
3. **Tertiär**: KMU im produzierenden Gewerbe

### 2.3 Kernziele

- **Effizienzsteigerung**: 30% Zeitersparnis in Verwaltungsaufgaben
- **Fehlerreduktion**: 90% weniger Dateneingabefehler durch KI-Validierung
- **Compliance**: 100% GoBD, DSGVO, ISO-konform
- **Skalierbarkeit**: Von 5 bis 500 Mitarbeiter ohne Systemwechsel

---

## 3. Kernarchitektur

### 3.1 Monorepo-Struktur

```
apps/
├── frontend/          # React/Next.js App
│   ├── src/
│   │   ├── pages/           # Seiten (Dashboard, Module)
│   │   ├── features/        # Feature-Module
│   │   ├── components/      # Wiederverwendbare Komponenten
│   │   └── api/             # API-Integration
│
├── backend/           # Node.js/Fastify API
│   ├── src/
│   │   ├── routes/          # API Routes (BFF-Pattern)
│   │   │   ├── unifiedDashboard/  # 🆕 Unified Dashboard Router
│   │   │   ├── aiAnnotator/       # KI-Services (wird integriert)
│   │   │   ├── functionsCatalog/  # Katalog (wird integriert)
│   │   │   └── ...
│   │   ├── services/        # Business Logic
│   │   ├── middleware/      # Auth, RBAC, Validation
│   │   └── db/              # Database Layer
│
docs/
├── concept/           # Konzeptdokumente
│   ├── GESAMTKONZEPT_V1.0.md  # 🆕 Dieses Dokument
│   └── archive/       # Alte Konzeptversionen
│
data/
└── functionsCatalog/  # JSON-Funktionsdefinitionen
```

### 3.2 Technologie-Stack

**Frontend**:

- React 18+ mit TypeScript
- Next.js 14 (App Router)
- TanStack Query (Data Fetching)
- Zod (Schema Validation)
- Recharts (Analytics)

**Backend**:

- Node.js 20+
- Fastify 4 (API Framework)
- PostgreSQL 15+ (Datenbank)
- Zod (Validation)
- Pino (Logging)

**KI-Layer**:

- Multi-Provider Support (OpenAI, Anthropic, Ollama)
- Local-First mit Ollama (Datenschutz)
- Model Selection basierend auf Komplexität

**DevOps**:

- Docker/Docker Compose
- GitHub Actions (CI/CD)
- Vitest (Testing)
- ESLint + Prettier (Code Quality)

---

## 4. Unified Dashboard System

### 4.1 Konzept: Fusion von KI-Annotator und Funktionskatalog

Das **Unified Dashboard** ist das Herzstück von ERP SteinmetZ V1.0 und entsteht durch die Verschmelzung zweier bisher getrennter Systeme:

#### Vorher (getrennte Systeme):

```
┌─────────────────────┐     ┌──────────────────────┐
│  KI-Annotator       │     │  Funktionskatalog    │
│  ─────────────      │     │  ─────────────────   │
│  - Meta generieren  │     │  - Funktionen laden  │
│  - Forms generieren │     │  - Menü erstellen    │
│  - Rules generieren │     │  - Navigation        │
│  - Validierung      │     │  - Suche             │
└─────────────────────┘     └──────────────────────┘
         ↓                           ↓
    Separate UIs            Separate Workflows
```

#### Nachher (Unified Dashboard):

```
┌────────────────────────────────────────────────────────┐
│           UNIFIED DASHBOARD V1.0                       │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Intelligente Funktionsverwaltung                │ │
│  │  ────────────────────────────────                │ │
│  │  • Katalog durchsuchen                           │ │
│  │  • Funktionen bearbeiten                         │ │
│  │  • Meta-Daten anzeigen/generieren                │ │
│  │  • Forms erstellen/validieren                    │ │
│  │  • Rules definieren/testen                       │ │
│  │  • Widgets konfigurieren                         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  KI-Assistent (Integriert)                      │ │
│  │  ────────────────────────                        │ │
│  │  • "Generiere Form für Funktion XYZ"            │ │
│  │  • "Validiere alle unvollständigen Funktionen"  │ │
│  │  • "Erstelle Dashboard-Widget für KPI ABC"      │ │
│  │  • "Optimiere Metadaten nach Best Practices"    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Batch-Operationen & Workflows                   │ │
│  │  ────────────────────────────────                │ │
│  │  • Bulk-Annotation (Meta/Form/Rule)              │ │
│  │  • Qualitätssicherung (QA-Pipeline)              │ │
│  │  • Template-Anwendung                            │ │
│  │  • Version Control & Rollback                    │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 4.2 Hauptfunktionen des Unified Dashboard

#### 4.2.1 Funktionsgenerierung

**Workflow**:

1. **Benutzer** wählt Modul/Bereich (z.B. "HR > Mitarbeiterverwaltung")
2. **Dashboard** zeigt bestehende Funktionen und leere Slots
3. **KI-Button**: "Neue Funktion generieren"
4. **KI** analysiert Kontext und schlägt vor:
   - Meta-Daten (Tags, Komplexität, Area)
   - JSON-Schema für Formulare
   - Validierungsregeln
   - Dashboard-Widgets
5. **Preview** mit Diff-Ansicht
6. **Approve/Reject** durch Benutzer
7. **Speichern** in Katalog + Audit-Log

**Beispiel-Prompt**:

```
Funktion: "Urlaubsantrag stellen"
Kontext: HR-Modul, Mitarbeiter-Self-Service
Anforderungen:
  - Formular mit Datumswahl (von/bis)
  - Automatische Berechnung der Tage
  - Freigabe-Workflow (Manager)
  - Integration mit Zeiterfassung
```

**KI generiert**:

```json
{
  "id": "hr.vacation-request.create",
  "kind": "function",
  "meta": {
    "title": "Urlaubsantrag stellen",
    "description": "Mitarbeiter können Urlaub beantragen",
    "tags": ["hr", "vacation", "self-service", "workflow"],
    "area": "hr",
    "complexity": "medium",
    "pii_class": "internal",
    "priority": "high"
  },
  "schema": {
    "type": "object",
    "properties": {
      "start_date": { "type": "string", "format": "date" },
      "end_date": { "type": "string", "format": "date" },
      "reason": { "type": "string", "maxLength": 500 },
      "type": {
        "type": "string",
        "enum": ["annual", "sick", "unpaid", "parental"]
      }
    },
    "required": ["start_date", "end_date", "type"]
  },
  "rule": {
    "type": "form",
    "widget": "vacation-request-form",
    "validation": {
      "custom": ["dates_in_future", "sufficient_balance"]
    },
    "workflow": {
      "approval_required": true,
      "approver_role": "manager"
    }
  }
}
```

#### 4.2.2 Formular-Management

**Dynamische Formulare** basierend auf JSON-Schema:

```typescript
interface FormSpec {
  title: string;
  schema: JSONSchema; // JSON Schema 7
  uiSchema?: UISchema; // React-JSONSCHEMA-Form
  validation?: ValidationRule[];
  triState: boolean; // known | unknown | not_applicable
}
```

**Tri-State Pattern**:

```json
{
  "employee": {
    "iban": {
      "value": "DE89370400440532013000",
      "state": "known"
    },
    "tax_id": {
      "value": null,
      "state": "unknown" // → Erzeugt To-Do
    },
    "parking_spot": {
      "value": null,
      "state": "not_applicable"
    }
  }
}
```

#### 4.2.3 Dashboard-Widget-Generierung

**Widget-Typen**:

- **KPI-Cards**: Einzelne Kennzahlen (Umsatz, Kosten, etc.)
- **Charts**: Line, Bar, Pie, Area (mit Recharts)
- **Tables**: Sortierbar, filterbar, paginiert
- **Forms**: Inline-Formulare
- **Lists**: To-Dos, Benachrichtigungen, Warnungen
- **Custom**: Spezifische Widgets (Friedhofsverwaltung, etc.)

**Beispiel: Umsatz-Widget**

```json
{
  "widget": {
    "id": "dashboard.kpi.revenue-today",
    "type": "kpi-card",
    "title": "Tagesumsatz",
    "dataSource": {
      "endpoint": "/api/finance/kpi/revenue-today",
      "refresh": 60 // Sekunden
    },
    "visualization": {
      "format": "currency",
      "trend": true,
      "comparison": "yesterday"
    },
    "rule": {
      "show_if": ["role:finance", "role:management"],
      "priority": 10
    }
  }
}
```

#### 4.2.4 Regelbasierte Navigation

**JSONLogic-Regeln** für Menü-Platzierung:

```json
{
  "menu": {
    "id": "hr.employees",
    "title": "Mitarbeiter",
    "placement": {
      "if": [
        { "in": ["role:hr", { "var": "user.roles" }] },
        { "parent": "hr", "position": 1 },
        { "parent": "hidden", "position": 0 }
      ]
    }
  }
}
```

### 4.3 API-Struktur des Unified Dashboard

**Neue Unified Dashboard API** (`/api/unified-dashboard/*`):

```
GET  /api/unified-dashboard/status
     → System-Status (beide Services integriert)

GET  /api/unified-dashboard/functions
     → Liste aller Funktionen (Katalog + Annotations)

GET  /api/unified-dashboard/functions/:id
     → Einzelne Funktion mit vollständigen Meta-Daten

POST /api/unified-dashboard/functions/:id/generate
     → KI-generiert Meta/Form/Rule für Funktion
     Body: { types: ["meta", "form", "rule"], force: false }

POST /api/unified-dashboard/functions/:id/validate
     → Validiert Funktion gegen Qualitätsregeln

POST /api/unified-dashboard/functions/batch
     → Batch-Operation auf mehrere Funktionen
     Body: { operation: "annotate", filters: {...}, options: {...} }

GET  /api/unified-dashboard/widgets
     → Dashboard-Widgets (regelbasiert)

POST /api/unified-dashboard/widgets/generate
     → Generiert neues Widget
     Body: { function_id, type, config }

GET  /api/unified-dashboard/forms/:id
     → Formular-Spec mit Schema und UI-Hints

POST /api/unified-dashboard/forms/validate
     → Validiert Formulardaten (Tri-State-Support)

GET  /api/unified-dashboard/quality/report
     → Qualitätsbericht (Coverage, Vollständigkeit, Errors)

GET  /api/unified-dashboard/ai/models
     → Verfügbare AI-Modelle und Performance-Stats
```

### 4.4 Frontend-Integration

**Neue Komponente** (`apps/frontend/src/pages/UnifiedDashboard.tsx`):

```typescript
interface UnifiedDashboardProps {
  user: User;
  context: MenuContext;
}

export function UnifiedDashboard({ user, context }: UnifiedDashboardProps) {
  const { functions, isLoading } = useFunctions();
  const { widgets } = useWidgets(context);
  const { generateMeta, generateForm, generateRule } = useAIGenerator();

  return (
    <DashboardLayout>
      {/* Header mit Suche und KI-Assistent */}
      <DashboardHeader>
        <SearchBar onSearch={handleSearch} />
        <AIAssistantButton onClick={openAIChat} />
      </DashboardHeader>

      {/* Haupt-Grid */}
      <WidgetGrid>
        {widgets.map(widget => (
          <WidgetCard key={widget.id} widget={widget} />
        ))}
      </WidgetGrid>

      {/* Funktions-Browser */}
      <FunctionBrowser
        functions={functions}
        onSelect={handleFunctionSelect}
        onGenerate={handleGenerate}
      />

      {/* KI-Panel (Sidebar) */}
      <AIPanel
        onGenerateMeta={generateMeta}
        onGenerateForm={generateForm}
        onGenerateRule={generateRule}
      />
    </DashboardLayout>
  );
}
```

---

## 5. KI-gestützte Entwicklung

### 5.1 Multi-Provider AI Strategy

**Stufenmodell**:

1. **Router** (≤3B): Ollama Qwen 2.5 3B
   - Pfadwahl: SQL vs. RAG vs. Web
   - Schnell, lokal, kostenfrei

2. **Orchestrator** (≈7B): Ollama Qwen 2.5 7B
   - Dialog-Management
   - Tool-Calls
   - Schema-gebundene Generierung

3. **Fallback** (≈14B): Ollama Qwen 2.5 14B / Llama 3.1 8B
   - Komplexe Formulare
   - Schwierige Validierungen

4. **Consultant** (via API): OpenAI GPT-4 / Anthropic Claude
   - Beratungsmodus
   - JSON-Plan-Generierung
   - Keine direkten Writes

**Model Selection Logic**:

```typescript
function selectModel(
  operation: string,
  priority: "fast" | "balanced" | "accurate",
): Model {
  if (operation === "simple_meta" && priority === "fast") {
    return OllamaQwen3B;
  }
  if (operation === "form_generation" && priority === "accurate") {
    return OllamaQwen14B;
  }
  if (operation === "consultation") {
    return OpenAIGPT4;
  }
  return OllamaQwen7B; // Default
}
```

### 5.2 Prompt-Strategie

**Meta-Generierung**:

```
Du bist ein ERP-Experte. Analysiere die Funktion "{functionId}" und generiere Metadaten.

Kontext:
- Modul: {module}
- Bestehende Funktionen: {siblings}
- Business Area: {area}

Generiere JSON im folgenden Format:
{
  "description": "Kurze, präzise Beschreibung (max. 100 Zeichen)",
  "tags": ["tag1", "tag2", "tag3"],  // Min. 3, Max. 8
  "complexity": "low | medium | high",
  "area": "hr | finance | sales | ...",
  "pii_class": "public | internal | confidential | restricted",
  "priority": "low | medium | high | critical"
}

Regeln:
- Tags müssen lowercase sein
- Description darf keine Platzhalter enthalten
- Complexity basierend auf Anzahl der Felder und Logik
- PII-Class nach DSGVO-Kriterien
```

**Form-Generierung**:

```
Erstelle ein JSON-Schema Formular für die Funktion "{functionId}".

Anforderungen:
- Tri-State Support (known | unknown | not_applicable)
- Validierung nach Fachanforderungen
- UI-Hints für bessere UX
- i18n-ready (de/en)

Beispiel Output:
{
  "title": "Mitarbeiter anlegen",
  "schema": {
    "type": "object",
    "properties": {
      "first_name": {
        "type": "string",
        "minLength": 2,
        "maxLength": 50,
        "triState": true
      },
      ...
    },
    "required": ["first_name", "last_name", "birth_date"]
  },
  "uiSchema": {
    "first_name": { "ui:autofocus": true },
    "birth_date": { "ui:widget": "date" }
  }
}
```

### 5.3 Error Correction & Validation

**Automatische Korrektur**:

```typescript
async function correctErrors(
  functionId: string,
  meta: GeneratedMeta,
  errors: string[],
): Promise<GeneratedMeta> {
  const prompt = `
Die generierten Metadaten für "${functionId}" haben folgende Fehler:
${errors.join("\n")}

Ursprüngliche Metadaten:
${JSON.stringify(meta, null, 2)}

Korrigiere die Fehler und gib gültiges JSON zurück.
  `;

  const corrected = await callAI(prompt, "error_correction");
  return JSON.parse(corrected);
}
```

**Qualitätschecks**:

- ✅ Schema-Validität ≥ 99.5%
- ✅ Tool-Call-Korrektheit ≥ 99%
- ✅ Rückfragenquote ≤ 1%
- ✅ RAG Recall@5 ≥ 0.8
- ✅ Zitatabdeckung ≥ 0.95

---

## 6. Funktionsmodule Version 1.0

Alle Module aus dem Konzept sind in V1.0 implementiert (Basisversion):

### 6.1 Dashboard (Executive Overview)

- ✅ KPI-Übersicht (Umsatz, Marge, Liquidität)
- ✅ Prozess-Monitoring (Lead-to-Cash, Procure-to-Pay)
- ✅ Warnungen & Eskalationen
- ✅ Benachrichtigungen & Aufgaben
- ✅ Echtzeit-Analytics
- ✅ Personalisierte Widgets

### 6.2 Geschäftsverwaltung

- ✅ Unternehmensstammdaten
- ✅ Prozess-Management (BPMN 2.0)
- ✅ Dokumentenmanagement
- ✅ Risiko & Compliance

### 6.3 Finanzen & Controlling

- ✅ Buchhaltung (Hauptbuch, Debitoren, Kreditoren)
- ✅ Controlling (Kostenrechnung, Budgetierung)
- ✅ Treasury (Liquidität, Zahlungsverkehr)
- ✅ Steuern (UStVA, XRechnung, ZUGFeRD)

### 6.4 Vertrieb & Marketing

- ✅ CRM (360° Kundenansicht)
- ✅ Marketing (Kampagnen, Lead-Scoring)
- ✅ Vertrieb (Angebot, Auftrag, Pipeline)
- ✅ Fulfillment (Versand, Rechnung, Retoure)

### 6.5 Einkauf & Beschaffung

- ✅ Beschaffung (Bedarf, Bestellung, Lieferant)
- ✅ Wareneingang (Kontrolle, Qualität, Rechnung)
- ✅ Lieferanten (Stammdaten, Bewertung, Verträge)

### 6.6 Produktion & Fertigung (Werk)

- ✅ Produktionsplanung (Kapazität, Material, Termine)
- ✅ Fertigungssteuerung (Arbeitspläne, MDE, BDE)
- ✅ Qualitätsmanagement (Prüfpläne, Kontrolle, Zertifikate)
- ✅ Wartung (Pläne, Instandhaltung, Ersatzteile)

### 6.7 Produktion & Fertigung (Lager)

- ✅ Lagerverwaltung (Bestand, Plätze, Inventur)
- ✅ Kommissionierung (Listen, Pick-by-Voice, Routing)
- ✅ Logistik (Versand, Transport, Tracking)

### 6.8 Personal & HR

- ✅ Personalverwaltung (Stammdaten, Verträge, Archiv)
- ✅ Zeiterfassung (Arbeitszeit, Urlaub, Projekt)
- ✅ Personalentwicklung (Qualifikation, Schulung, Karriere)
- ✅ Recruiting (Stellen, Bewerbung, Onboarding)

### 6.9 Reporting & Analytics

- ✅ Standard-Reports (Finanzen, Vertrieb, Produktion)
- ✅ Ad-hoc-Analysen (Explorer, Pivot, Viz)
- ✅ KI-Analytics (Predictive, Trends, Empfehlungen)

### 6.10 Kommunikation & Social

- ✅ E-Mail-Management (Inbox, Smart Response, Tracking)
- ✅ Messaging (Chat, Video, Collaboration)
- ✅ Social Media (Multi-Channel, Content, Sentiment)

### 6.11 System & Administration

- ✅ Benutzerverwaltung (Rollen, Rechte, Audit)
- ✅ Systemeinstellungen (Mandanten, DB, Backup)
- ✅ Integrationen (API, Schnittstellen, Plugins)

---

## 7. Technische Spezifikationen

### 7.1 Datenbank-Schema

**PostgreSQL Schemas**:

```sql
-- Core Schema (System-Tabellen)
CREATE SCHEMA core;

CREATE TABLE core.audit_event (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id VARCHAR(255),
  event_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  changes JSONB,
  metadata JSONB
);

CREATE TABLE core."case" (
  id SERIAL PRIMARY KEY,
  case_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,  -- draft | active | closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE core.form_instance (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES core."case"(id),
  schema_id VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE core.todo (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES core."case"(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open',  -- open | done | cancelled
  due_date DATE,
  assigned_to VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Functions Catalog (Metadaten)
CREATE TABLE core.functions_catalog (
  id VARCHAR(255) PRIMARY KEY,
  kind VARCHAR(50) NOT NULL,  -- category | group | function
  parent_id VARCHAR(255),
  meta_json JSONB,
  schema_json JSONB,
  rule_json JSONB,
  form_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HR Schema
CREATE SCHEMA hr;

CREATE TABLE hr.employee (
  id SERIAL PRIMARY KEY,
  personnel_number VARCHAR(20) UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  birth_date DATE,
  email VARCHAR(100),
  iban VARCHAR(34),
  tax_id VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',  -- active | inactive | terminated
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Finance Schema
CREATE SCHEMA finance;

CREATE TABLE finance.invoice (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount_net DECIMAL(12,2) NOT NULL,
  amount_vat DECIMAL(12,2) NOT NULL,
  amount_total DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',  -- draft | sent | paid | overdue
  xrechnung_xml TEXT,
  zugferd_pdf BYTEA,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weitere Schemas: sales, procurement, production, warehouse, etc.
```

### 7.2 JSON-Schema Standards

**Basis-Schema für Funktionen**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z]+\\.[a-z-]+\\.[a-z-]+$"
    },
    "kind": {
      "type": "string",
      "enum": ["category", "group", "function", "widget"]
    },
    "meta": {
      "type": "object",
      "properties": {
        "title": { "type": "string", "maxLength": 100 },
        "description": { "type": "string", "maxLength": 500 },
        "tags": {
          "type": "array",
          "items": { "type": "string" },
          "minItems": 3,
          "maxItems": 8
        },
        "area": {
          "type": "string",
          "enum": [
            "dashboard",
            "business",
            "finance",
            "sales",
            "procurement",
            "production",
            "warehouse",
            "hr",
            "reporting",
            "communication",
            "system"
          ]
        },
        "complexity": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        },
        "pii_class": {
          "type": "string",
          "enum": ["public", "internal", "confidential", "restricted"]
        },
        "priority": {
          "type": "string",
          "enum": ["low", "medium", "high", "critical"]
        }
      },
      "required": ["title", "description", "tags", "area"]
    },
    "schema": {
      "type": "object"
    },
    "rule": {
      "type": "object"
    },
    "form": {
      "type": "object"
    }
  },
  "required": ["id", "kind", "meta"]
}
```

### 7.3 API-Konventionen

**REST-Prinzipien**:

- `GET /api/resource` → Liste
- `GET /api/resource/:id` → Einzeln
- `POST /api/resource` → Erstellen
- `PUT /api/resource/:id` → Aktualisieren
- `DELETE /api/resource/:id` → Löschen

**Response-Format**:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-20T11:00:00Z",
    "version": "1.0.0"
  }
}
```

**Error-Format**:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email format"
      }
    ]
  }
}
```

---

## 8. Datenmodell und Schemata

### 8.1 Tri-State Pattern

Jedes Datenfeld kann in 3 Zuständen existieren:

```typescript
type FieldState = "known" | "unknown" | "not_applicable";

interface TriStateField<T> {
  value: T | null;
  state: FieldState;
}

interface EmployeeData {
  first_name: TriStateField<string>;
  iban: TriStateField<string>;
  parking_spot: TriStateField<string>;
}
```

**Verhalten**:

- `known`: Wert vorhanden und validiert
- `unknown`: Wert fehlt → To-Do wird erstellt
- `not_applicable`: Feld nicht relevant für diesen Fall

### 8.2 Event Sourcing für Audit

**Unveränderliche Events**:

```typescript
interface AuditEvent {
  id: number;
  timestamp: Date;
  user_id: string;
  event_type: "created" | "updated" | "deleted" | "sent" | "approved";
  entity_type: string;
  entity_id: string;
  changes: Record<string, { old: any; new: any }>;
  metadata: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
  };
}
```

**Regeln**:

- Events sind append-only (keine Updates/Deletes)
- Vollständige Nachvollziehbarkeit
- Snapshots für Performance
- Retention nach GoBD (10 Jahre)

### 8.3 Versionierung

**Manifest-basiert**:

```json
{
  "module": "hr.employee",
  "version": "1.2.0",
  "changelog": [
    {
      "version": "1.2.0",
      "date": "2025-12-20",
      "changes": ["Added parking_spot field", "Improved IBAN validation"]
    },
    {
      "version": "1.1.0",
      "date": "2025-11-15",
      "changes": ["Added tax_id field"]
    }
  ],
  "capabilities": ["create", "read", "update", "archive"],
  "widgets": ["employee-list", "employee-form", "employee-stats"],
  "rbac": {
    "roles": {
      "hr_admin": ["create", "read", "update", "delete"],
      "hr_user": ["read", "update_own"],
      "employee": ["read_own"]
    }
  }
}
```

---

## 9. Sicherheit und Compliance

### 9.1 RBAC (Role-Based Access Control)

**Hierarchie**:

```
System Admin
  └─ Mandanten-Admin
      ├─ Modul-Admin (HR, Finance, etc.)
      │   └─ Modul-Benutzer
      └─ Benutzer (Read-Only)
```

**Permissions**:

- **CRUD**: Create, Read, Update, Delete
- **Feld-Ebene**: Maskierung von sensiblen Daten (IBAN, Gehalt)
- **Objekt-Ebene**: Zugriff nur auf eigene Datensätze
- **Feature-Flags**: Freischaltung von Beta-Features

### 9.2 DSGVO-Compliance

**PII-Klassifikation**:

- **Public**: Name, E-Mail (Geschäft)
- **Internal**: Personalnummer, Telefon
- **Confidential**: IBAN, Geburtsdatum
- **Restricted**: Gehalt, Gesundheitsdaten

**Maßnahmen**:

- Verschlüsselung at rest (AES-256)
- Verschlüsselung in transit (TLS 1.3)
- Pseudonymisierung bei Export
- Löschfristen (DSGVO Art. 17)
- Audit-Trail für Zugriffe

### 9.3 GoBD-Konformität

**Anforderungen**:

- ✅ Lückenlose Nummernkreise (Rechnungen, Belege)
- ✅ Unveränderbarkeit nach Versand/Buchung
- ✅ Storno/Gutschrift statt Überschreiben
- ✅ Revisionssichere Archivierung (10 Jahre)
- ✅ Vollständige Dokumentation

### 9.4 XRechnung & ZUGFeRD

**Integration**:

- Automatische Generierung von XRechnung-XML (PEPPOL)
- ZUGFeRD 2.1 (PDF/A-3 + XML-Embedding)
- Validierung gegen EN 16931
- E-Rechnungs-Pflicht (ab 2025)

```typescript
interface XRechnungGenerator {
  generate(invoice: Invoice): string; // XML
  validate(xml: string): ValidationResult;
  embed(pdf: Buffer, xml: string): Buffer; // ZUGFeRD
}
```

---

## 10. Roadmap und Phasen

### 10.1 Version 1.0 (Q1 2026) – **Current Milestone**

**Fundament (✅ Abgeschlossen)**:

- App-Shell (Frontend + Backend)
- Health-Check-System
- BFF-Pattern (Backend-for-Frontend)
- Basis-RBAC

**Unified Dashboard (🔄 In Arbeit)**:

- [ ] Fusion von KI-Annotator + Funktionskatalog
- [ ] Unified API (`/api/unified-dashboard/*`)
- [ ] Dashboard-Frontend mit Widget-Grid
- [ ] KI-Panel für Generierung

**Kern-Module (🔄 Schrittweise)**:

- [x] Dashboard (Executive Overview)
- [ ] HR (Mitarbeiter anlegen - MVP)
- [ ] Finance (Rechnung E2E - MVP)
- [ ] Weitere Module (Basis-Funktionen)

**KI-Integration (🔄 In Arbeit)**:

- [ ] Ollama-Setup (Qwen 2.5 Modelle)
- [ ] Multi-Provider-Support
- [ ] Prompt-Engineering
- [ ] Error-Correction-Pipeline

### 10.2 Version 1.1 (Q2 2026)

**Erweiterungen**:

- Vollständige HR-Suite (Zeiterfassung, Urlaub, Recruiting)
- Finance-Automatisierung (Bank-Import, UStVA, DATEV)
- Workflow-Designer (BPMN 2.0)
- Mobile App (React Native)

### 10.3 Version 1.2 (Q3 2026)

**Spezialisierung**:

- Friedhofsverwaltung (Steinmetz-spezifisch)
- Verschnittoptimierung (Material-Optimierung)
- CAD-Integration (Import von Plänen)
- Projekt-Management

### 10.4 Version 2.0 (Q4 2026)

**Enterprise-Features**:

- Multi-Mandanten-Fähigkeit
- High Availability (HA-Cluster)
- Advanced Analytics (ML-Pipelines)
- API-Marketplace (Plugins, Integrationen)

---

## 11. Zusammenfassung

### 11.1 Kernziele V1.0

1. ✅ **Unified Dashboard**: KI-Annotator + Funktionskatalog verschmolzen
2. ✅ **Alle 11 Module**: Basis-Funktionen implementiert
3. ✅ **KI-gestützte Generierung**: Meta, Forms, Rules, Widgets
4. ✅ **Tri-State Schema**: Vollständige Datenqualität
5. ✅ **Compliance**: GoBD, DSGVO, XRechnung

### 11.2 Erfolgskriterien

- **Schema-Validität**: ≥ 99.5%
- **Tool-Call-Korrektheit**: ≥ 99%
- **Benutzer-Zufriedenheit**: ≥ 4.5/5 (NPS)
- **Performance**: < 200ms API-Response (p95)
- **Verfügbarkeit**: ≥ 99.9% Uptime

### 11.3 Nächste Schritte

1. **Archiv alte Dateien** (KI-Annotator, Funktionskatalog-Router)
2. **Implementierung Unified Dashboard API**
3. **Frontend-Komponenten** (Dashboard, KI-Panel, Widgets)
4. **Testing & QA** (Integration, E2E, Performance)
5. **Dokumentation** (API, Benutzerhandbuch, Admin-Guide)
6. **Deployment** (Docker, CI/CD, Monitoring)

---

**Ende des Gesamtkonzepts Version 1.0**

Dieses Dokument bildet die Grundlage für die Entwicklung von ERP SteinmetZ V1.0 und die funktionelle Verschmelzung von KI-Annotator und Funktionskatalog zu einem einzigen, intelligenten Dashboard-System.

---

**Autoren**: ERP SteinmetZ Team  
**Letzte Aktualisierung**: 2025-12-20  
**Status**: Production Ready  
**Lizenz**: Proprietary
