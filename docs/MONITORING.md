# Monitoring & Observability

Dieses Dokument beschreibt die Monitoring- und Observability-Infrastruktur des ERP SteinmetZ Backend-Systems.

## Übersicht

Das System bietet drei Hauptbereiche für Monitoring und Observability:

1. **Metrics & Monitoring** - Prometheus-basierte Metriken
2. **Tracing** - OpenTelemetry-basiertes Distributed Tracing
3. **Error Tracking** - Sentry-basiertes Error Tracking

## 1. Metrics & Monitoring

### Prometheus-Integration

Das Backend exportiert Metriken im Prometheus-Format über den `/api/metrics` Endpoint.

#### Verfügbare Metriken

##### System-Metriken (Standard)

- `erp_steinmetz_process_cpu_seconds_total` - CPU-Nutzung
- `erp_steinmetz_process_resident_memory_bytes` - Speichernutzung
- `erp_steinmetz_nodejs_heap_size_used_bytes` - Heap-Nutzung
- `erp_steinmetz_nodejs_gc_duration_seconds` - Garbage Collection Dauer

##### HTTP-Metriken

- `erp_steinmetz_http_requests_total` - Gesamtanzahl HTTP-Requests
- `erp_steinmetz_http_request_duration_seconds` - Request-Dauer (Histogram)
- `erp_steinmetz_http_requests_in_progress` - Aktive Requests

##### Datenbank-Metriken

- `erp_steinmetz_db_queries_total` - Gesamtanzahl Datenbankabfragen
- `erp_steinmetz_db_query_duration_seconds` - Query-Dauer (Histogram)
- `erp_steinmetz_db_connections_active` - Aktive Datenbankverbindungen

##### Authentifizierungs-Metriken

- `erp_steinmetz_auth_attempts_total` - Authentifizierungsversuche
- `erp_steinmetz_auth_active_sessions` - Aktive Sessions

##### Business-Metriken

- `erp_steinmetz_business_events_total` - Business-Events
- `erp_steinmetz_business_operation_duration_seconds` - Dauer Business-Operationen

##### AI-Provider-Metriken

- `erp_steinmetz_ai_requests_total` - AI-Provider-Requests
- `erp_steinmetz_ai_request_duration_seconds` - AI-Request-Dauer
- `erp_steinmetz_ai_tokens_used_total` - Verwendete AI-Tokens

##### Error-Metriken

- `erp_steinmetz_errors_total` - Fehleranzahl nach Typ und Schweregrad

#### Verwendung im Code

```typescript
import { metricsService } from "./services/metricsService.js";

// HTTP-Request aufzeichnen
metricsService.recordHttpRequest("GET", "/api/users", 200, 123);

// Datenbankabfrage aufzeichnen
metricsService.recordDbQuery("SELECT", "users", 50, true);

// Business-Event aufzeichnen
metricsService.recordBusinessEvent("order_created", "success");

// AI-Request aufzeichnen
metricsService.recordAiRequest("openai", 2500, true);
metricsService.recordAiTokens("openai", "prompt", 100);

// Fehler aufzeichnen
metricsService.recordError("validation", "warning");
```

### Grafana-Dashboards

Vorkonfigurierte Grafana-Dashboards befinden sich in `apps/backend/config/grafana/`:

1. **dashboard-overview.json** - Systemübersicht
   - HTTP Request Rate
   - Request Duration (95th percentile)
   - Active Requests
   - Error Rate
   - Memory & CPU Usage

2. **dashboard-business.json** - Business-Metriken
   - Business Events Rate
   - Operation Duration
   - Database Query Performance
   - Authentication Metrics
   - Active Sessions

3. **dashboard-ai.json** - AI-Metriken
   - AI Request Rate
   - AI Request Duration
   - Token Usage
   - Provider-spezifische Metriken

#### Dashboard-Import

1. Grafana öffnen
2. Dashboards → Import
3. JSON-Datei hochladen oder Inhalt einfügen
4. Prometheus-Datenquelle auswählen
5. Import bestätigen

### Prometheus Alert Rules

Alert-Regeln befinden sich in `apps/backend/config/prometheus/alerts.yml`:

#### Definierte Alerts

- **HighErrorRate** - Hohe Fehlerrate (> 10 errors/sec)
- **HighHTTP5xxRate** - Hohe 5xx-Fehlerrate (> 5 requests/sec)
- **SlowHTTPRequests** - Langsame Requests (95th percentile > 5s)
- **HighMemoryUsage** - Hohe Speichernutzung (> 1GB)
- **HighDatabaseErrorRate** - Hohe DB-Fehlerrate (> 1 error/sec)
- **SlowDatabaseQueries** - Langsame DB-Queries (95th percentile > 1s)
- **HighAuthFailureRate** - Hohe Auth-Fehlerrate (> 5 failures/sec)
- **AIProviderFailures** - AI-Provider-Fehler (> 1 error/sec)
- **SlowAIRequests** - Langsame AI-Requests (95th percentile > 30s)
- **ServiceDown** - Service nicht erreichbar

#### Alert-Konfiguration

In `prometheus.yml` einbinden:

```yaml
rule_files:
  - /path/to/apps/backend/config/prometheus/alerts.yml

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

## 2. Tracing

### OpenTelemetry-Integration

Das Backend unterstützt OpenTelemetry für Distributed Tracing.

#### Konfiguration

Umgebungsvariablen in `.env`:

```env
# OpenTelemetry Tracing aktivieren
OTEL_TRACES_ENABLED=true
OTEL_SERVICE_NAME=erp-steinmetz-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Tracing Sample Rate (0.0 - 1.0)
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

#### Automatische Instrumentierung

Das System instrumentiert automatisch:

- HTTP-Requests (Express)
- Datenbankabfragen
- Redis-Operationen
- HTTP-Client-Requests

#### Manuelle Spans

```typescript
import { tracingService } from "./services/tracingService.js";

// Span erstellen und manuell verwalten
const span = tracingService.startSpan("operation-name", {
  customAttribute: "value",
  userId: "123",
});

try {
  // Operation durchführen
  await doWork();
  tracingService.endSpan(span);
} catch (error) {
  tracingService.recordError(span, error);
  tracingService.endSpan(span);
  throw error;
}

// Oder: executeInSpan verwenden (empfohlen)
const result = await tracingService.executeInSpan(
  "operation-name",
  async (span) => {
    // Operation durchführen
    return await doWork();
  },
  { customAttribute: "value" },
);
```

### Jaeger Setup

Jaeger als Tracing-Backend verwenden:

#### Docker Compose

```yaml
version: "3"
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686" # Jaeger UI
      - "4318:4318" # OTLP HTTP receiver
    environment:
      - COLLECTOR_OTLP_ENABLED=true
```

#### Zugriff

Jaeger UI: http://localhost:16686

## 3. Error Tracking

### Sentry-Integration

Das Backend integriert Sentry für Error Tracking, Grouping und Alerting.

#### Konfiguration

Umgebungsvariablen in `.env`:

```env
# Sentry aktivieren
SENTRY_ENABLED=true
SENTRY_DSN=https://your-key@sentry.io/your-project-id

# Sample Rates (0.0 - 1.0)
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

#### Automatisches Error Tracking

Alle nicht abgefangenen Fehler werden automatisch an Sentry gesendet mit:

- Stack Trace
- Request-Kontext (Method, URL, Headers, Body)
- User-Kontext (falls vorhanden)
- Environment-Informationen

#### Manuelles Error Tracking

```typescript
import { errorTrackingService } from "./services/errorTrackingService.js";

// Exception erfassen
errorTrackingService.captureException(error, {
  user: { id: "123", email: "user@example.com" },
  tags: { feature: "checkout" },
  extra: { orderId: "456" },
});

// Nachricht erfassen
errorTrackingService.captureMessage("Important event", "warning", {
  tags: { category: "business" },
  extra: { details: "Additional info" },
});

// User-Kontext setzen
errorTrackingService.setUser({
  id: "123",
  email: "user@example.com",
  username: "johndoe",
});

// Breadcrumb hinzufügen
errorTrackingService.addBreadcrumb({
  message: "User clicked checkout",
  category: "user-action",
  level: "info",
  data: { cartTotal: 99.99 },
});
```

#### Security & Redaction

Sensible Daten werden automatisch entfernt:

- password
- token, apiKey, api_key
- secret, authorization
- cookie, session
- ssn, credit_card, creditCard

### Source Maps

Für bessere Stack Traces in Production:

1. TypeScript Build mit Source Maps:

   ```json
   {
     "compilerOptions": {
       "sourceMap": true
     }
   }
   ```

2. Source Maps zu Sentry hochladen:
   ```bash
   npm install -D @sentry/cli
   sentry-cli releases files <version> upload-sourcemaps ./dist
   ```

## Deployment & Best Practices

### Production Setup

1. **Prometheus**

   ```yaml
   scrape_configs:
     - job_name: "erp-steinmetz"
       scrape_interval: 15s
       static_configs:
         - targets: ["backend:3000"]
   ```

2. **Grafana**
   - Dashboards importieren
   - Alerts konfigurieren
   - Notification Channels einrichten

3. **Jaeger/OTLP Collector**
   - OTLP Endpoint bereitstellen
   - Sample Rate anpassen (z.B. 0.1 = 10%)

4. **Sentry**
   - DSN konfigurieren
   - Environments einrichten (dev, staging, production)
   - Alert-Rules definieren

### Sample Rates

Empfohlene Sample Rates für Production:

- **Traces**: 0.1 (10%) - für normale Anwendungen
- **Sentry Traces**: 0.1 (10%)
- **Sentry Profiles**: 0.1 (10%)

Für High-Traffic-Systeme:

- Traces: 0.01 (1%)
- Kritische Endpoints: 1.0 (100%)

### Performance-Überlegungen

1. **Metriken**: Minimaler Overhead (~1-2%)
2. **Tracing**: Overhead je nach Sample Rate (10% Sample = ~0.5% Overhead)
3. **Error Tracking**: Nur bei Fehlern, vernachlässigbarer Overhead

### Monitoring-Checklist

- [ ] Prometheus scraping konfiguriert
- [ ] Grafana-Dashboards importiert
- [ ] Alert-Rules aktiviert
- [ ] Alert-Notifications eingerichtet
- [ ] Tracing-Endpoint erreichbar
- [ ] Sentry DSN konfiguriert
- [ ] Sample Rates angepasst
- [ ] Source Maps hochgeladen (Production)
- [ ] Monitoring-Endpoints geschützt (API-Key/IP-Whitelist)

## Troubleshooting

### Metriken werden nicht exportiert

1. `/api/metrics` Endpoint aufrufen
2. Logs prüfen: "Metrics middleware enabled"
3. Middleware-Reihenfolge prüfen (metrics middleware vor routes)

### Tracing funktioniert nicht

1. `OTEL_TRACES_ENABLED=true` gesetzt?
2. OTLP Endpoint erreichbar?
3. Logs prüfen: "OpenTelemetry tracing initialized"

### Sentry erfasst keine Errors

1. `SENTRY_ENABLED=true` und `SENTRY_DSN` gesetzt?
2. Logs prüfen: "Sentry error tracking initialized"
3. Error-Tracking-Middleware vor Error-Handler?

## Weitere Ressourcen

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Sentry Documentation](https://docs.sentry.io/)
