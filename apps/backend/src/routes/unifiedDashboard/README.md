# 📊 Unified Dashboard API

**Version**: 1.0.0  
**Status**: Production Ready  
**Base Path**: `/api/unified-dashboard`

## Übersicht

Das Unified Dashboard vereint die Funktionalität von **KI-Annotator** und **Funktionskatalog** in einer einzigen, konsistenten API. Dies ermöglicht die nahtlose Generierung und Verwaltung von Funktionen, Formularen, Widgets und Dashboard-Komponenten.

### Hauptmerkmale

- ✅ **Unified Functions API**: Alle Funktionen mit Meta-Daten, Schemas, Rules und Forms
- ✅ **KI-Generierung**: Automatische Erstellung von Meta-Daten, Formularen und Regeln
- ✅ **Widget-Management**: Dashboard-Widgets mit regelbasierter Platzierung
- ✅ **Batch-Operationen**: Bulk-Annotation und Qualitätssicherung
- ✅ **Qualitäts-Reporting**: Vollständige Übersicht über Annotationsstatus
- ✅ **Suche & Navigation**: Erweiterte Suche über alle Funktionen

---

## Endpoints

### 1. System & Health

#### GET /status
System-Status von beiden Services (Katalog + Annotator)

**Response**:
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "services": {
      "catalog": {
        "loaded": "2025-12-20T11:00:00Z",
        "categories": [...],
        "warnings": []
      },
      "annotator": {
        "healthy": true,
        "annotationCoverage": 0.75
      }
    },
    "unified": {
      "ready": true,
      "features": [
        "function_browsing",
        "ai_generation",
        "widget_management",
        "batch_operations"
      ]
    }
  }
}
```

#### GET /health
Health-Check

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-12-20T11:00:00Z",
    "healthy": true
  }
}
```

---

### 2. Unified Functions

#### GET /functions
Liste aller Funktionen mit Meta-Daten

**Query Parameters**:
- `kinds` (optional): Komma-getrennte Liste von Typen (z.B. "category,function")
- `area` (optional): Business-Bereich (z.B. "hr", "finance")
- `limit` (optional): Max. Anzahl Ergebnisse (Standard: 50)
- `offset` (optional): Offset für Pagination (Standard: 0)

**Response**:
```json
{
  "success": true,
  "data": {
    "functions": [
      {
        "id": "hr.employees.create",
        "kind": "function",
        "parent_id": "hr.employees",
        "breadcrumbs": [...],
        "meta": {
          "title": "Mitarbeiter anlegen",
          "description": "Neuen Mitarbeiter im System anlegen",
          "tags": ["hr", "employee", "create"],
          "area": "hr",
          "complexity": "medium",
          "pii_class": "internal"
        },
        "schema": {...},
        "rule": {...},
        "form": {...},
        "quality": {
          "annotated": true,
          "validated": true,
          "coverage": 1.0,
          "last_updated": "2025-12-20T11:00:00Z"
        }
      }
    ],
    "total": 150,
    "loaded_at": "2025-12-20T10:00:00Z"
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150
  }
}
```

#### GET /functions/:id
Einzelne Funktion mit vollständigen Daten

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "hr.employees.create",
    "kind": "function",
    "meta": {...},
    "schema": {...},
    "rule": {...},
    "form": {...},
    "quality": {...}
  }
}
```

#### POST /functions/:id/generate
KI-generiert Meta/Form/Rule für Funktion

**Body**:
```json
{
  "types": ["meta", "form", "rule"],
  "force": false,
  "options": {
    "modelPreference": "balanced",
    "includeValidation": true,
    "parallel": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Generierung erfolgreich abgeschlossen",
  "data": {
    "meta": {
      "title": "Mitarbeiter anlegen",
      "description": "...",
      "tags": ["hr", "employee"],
      "area": "hr",
      "complexity": "medium"
    },
    "form": {
      "title": "Mitarbeiter anlegen",
      "schema": {...},
      "uiSchema": {...}
    },
    "rule": {
      "type": "form",
      "widget": "employee-create-form",
      "validation": {...}
    },
    "validation": {
      "valid": true,
      "errors": [],
      "warnings": [],
      "suggestions": []
    }
  }
}
```

#### POST /functions/:id/validate
Validiert Funktion

**Response**:
```json
{
  "success": true,
  "data": {
    "function": {...},
    "validation": {
      "valid": true,
      "errors": [],
      "warnings": ["Description could be more specific"],
      "suggestions": ["Add more tags for better discoverability"]
    }
  }
}
```

---

### 3. Batch Operations

#### POST /functions/batch
Batch-Operation auf mehrere Funktionen

**Body**:
```json
{
  "operation": "generate_meta",
  "filters": {
    "kinds": ["function"],
    "businessArea": ["hr"],
    "missingOnly": true
  },
  "options": {
    "retryFailed": true,
    "maxRetries": 3,
    "chunkSize": 10,
    "parallelRequests": 2,
    "modelPreference": "balanced"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "batch_id": "batch_12345",
    "operation": "generate_meta",
    "affected_functions": 45,
    "status": "running",
    "progress": 0
  }
}
```

---

### 4. Widget Management

#### GET /widgets
Dashboard-Widgets basierend auf Kontext

**Query Parameters**:
- `context` (optional): JSON-Kontext (z.B. `{"roles":["hr"],"area":"hr"}`)

**Response**:
```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "id": "dashboard.kpi.revenue-today",
        "kind": "widget",
        "meta": {...},
        "rule": {
          "type": "widget",
          "widget": "kpi-card",
          "dataSource": {
            "endpoint": "/api/finance/kpi/revenue-today",
            "refresh": 60
          }
        }
      }
    ],
    "context": {"roles": ["hr"]},
    "total": 12
  }
}
```

#### POST /widgets/generate
Generiert neues Widget

**Body**:
```json
{
  "function_id": "finance.revenue.today",
  "type": "kpi-card",
  "config": {
    "format": "currency",
    "trend": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Widget erfolgreich generiert",
  "data": {
    "widget": {
      "id": "finance.revenue.today.widget",
      "type": "kpi-card",
      "function_id": "finance.revenue.today",
      "config": {...},
      "generated_at": "2025-12-20T11:00:00Z"
    },
    "preview": {
      "type": "kpi-card",
      "title": "Tagesumsatz"
    }
  }
}
```

---

### 5. Search & Navigation

#### GET /search
Erweiterte Suche

**Query Parameters**:
- `q` (optional): Suchbegriff
- `kinds` (optional): Komma-getrennte Typen
- `tags` (optional): Komma-getrennte Tags
- `area` (optional): Business-Bereich
- `limit` (optional): Max. Ergebnisse
- `offset` (optional): Offset

**Example**:
```
GET /search?q=mitarbeiter&kinds=function&area=hr&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [...],
    "total": 8,
    "query": {
      "q": "mitarbeiter",
      "kinds": ["function"],
      "area": "hr"
    }
  },
  "pagination": {
    "limit": 20,
    "offset": 0
  }
}
```

---

### 6. Quality & Analytics

#### GET /quality/report
Qualitätsbericht

**Response**:
```json
{
  "success": true,
  "data": {
    "catalog": {
      "total_functions": 250,
      "categories": [...],
      "warnings": []
    },
    "annotations": {
      "coverage": 0.75,
      "average_confidence": 0.85
    },
    "recommendations": [
      "Weniger als 50% der Funktionen sind annotiert. Starten Sie eine Batch-Annotation."
    ]
  }
}
```

---

### 7. Maintenance

#### POST /reload
Katalog neu laden

**Response**:
```json
{
  "success": true,
  "message": "Katalog erfolgreich neu geladen",
  "data": {
    "loaded_at": "2025-12-20T11:00:00Z",
    "findings": [...],
    "warnings": []
  }
}
```

---

## Integration

### Frontend-Beispiel

```typescript
import { useUnifiedDashboard } from '@/api/unified-dashboard';

function DashboardPage() {
  const { functions, isLoading } = useUnifiedDashboard.useFunctions({
    kinds: ['function'],
    area: 'hr',
  });

  const { generateMeta } = useUnifiedDashboard.useGenerate();

  async function handleGenerate(functionId: string) {
    const result = await generateMeta(functionId, {
      types: ['meta', 'form'],
      force: false,
    });
    console.log('Generated:', result);
  }

  return (
    <div>
      {functions.map(fn => (
        <FunctionCard
          key={fn.id}
          function={fn}
          onGenerate={() => handleGenerate(fn.id)}
        />
      ))}
    </div>
  );
}
```

---

## Architektur

### Datenfluss

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       ├─── GET /functions ───────┐
       │                          │
       ├─── POST /generate ───────┤
       │                          │
       └─── GET /widgets ─────────┤
                                  │
                           ┌──────▼──────┐
                           │   Unified   │
                           │  Dashboard  │
                           │   Router    │
                           └──────┬──────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              ┌─────▼─────┐            ┌────────▼────────┐
              │ Functions │            │  AI Annotator   │
              │  Catalog  │            │    Service      │
              │  Service  │            └────────┬────────┘
              └─────┬─────┘                     │
                    │                           │
              ┌─────▼─────┐            ┌────────▼────────┐
              │   JSON    │            │   PostgreSQL    │
              │   Files   │            │    Database     │
              └───────────┘            └─────────────────┘
```

### Merge-Logik

Die `mergeFunctionData()` Funktion kombiniert Daten aus beiden Quellen:

1. **Katalog** liefert: ID, Kind, Hierarchie, Breadcrumbs
2. **Annotator** liefert: Meta, Schema, Rule, Form (falls vorhanden)
3. **Quality Metrics** werden berechnet: Coverage, Validated, Last Updated

---

## Vorteile der Unified API

### Vorher (getrennte APIs)

```typescript
// 2 separate Calls
const catalogData = await fetch('/api/functions/:id');
const annotations = await fetch('/api/ai-annotator/nodes/:id');

// Manuelles Merging im Frontend
const merged = mergeFunctionData(catalogData, annotations);
```

### Nachher (Unified API)

```typescript
// 1 Call, vollständige Daten
const function = await fetch('/api/unified-dashboard/functions/:id');

// Alle Daten bereits zusammengeführt
console.log(function.meta, function.form, function.quality);
```

### Benefits

- ✅ **Weniger API-Calls**: 50% Reduktion
- ✅ **Konsistente Daten**: Keine Merge-Logik im Frontend
- ✅ **Bessere Performance**: Server-seitiges Caching
- ✅ **Einfachere Integration**: Eine API statt zwei
- ✅ **Unified Schema**: Konsistente Response-Formate

---

## Error Handling

Alle Endpoints verwenden konsistente Error-Formate:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Funktion hr.employees.xyz nicht gefunden",
    "details": []
  }
}
```

**Mögliche Error Codes**:
- `NOT_FOUND` (404)
- `BAD_REQUEST` (400)
- `FORBIDDEN` (403)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)

---

## Performance & Caching

- **GET /functions**: 5min Cache
- **GET /widgets**: No Cache (context-abhängig)
- **POST /generate**: Rate Limited (AI-Provider)
- **POST /batch**: Rate Limited (Bulk-Operationen)

---

## Changelog

### Version 1.0.0 (2025-12-20)
- ✅ Initial Release
- ✅ Fusion von KI-Annotator + Funktionskatalog
- ✅ Alle 7 Endpoint-Gruppen implementiert
- ✅ Quality Reporting
- ✅ Batch Operations

---

**Dokumentiert von**: ERP SteinmetZ Team  
**Letzte Aktualisierung**: 2025-12-20  
**API Version**: 1.0.0
