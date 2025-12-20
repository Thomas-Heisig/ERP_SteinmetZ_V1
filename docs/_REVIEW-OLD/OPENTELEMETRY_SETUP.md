# OpenTelemetry Integration Guide

**Status**: 🟡 In Planung  
**Version**: 0.1.0  
**Letzte Aktualisierung**: 9. Dezember 2025

## Übersicht

OpenTelemetry (OTel) ist ein Open-Source-Framework für Observability, das Traces, Metrics und Logs in einem einheitlichen System vereint. Diese Anleitung beschreibt die Integration von OpenTelemetry in das ERP SteinmetZ System.

## Voraussetzungen

- Node.js 18+
- Bestehende Prometheus/Grafana Installation
- OTLP-kompatibler Backend (Jaeger, Zipkin, oder Grafana Tempo)

## Architektur

```
┌─────────────────┐
│  ERP Backend    │
│  (Node.js)      │
└────────┬────────┘
         │ OTLP/HTTP or OTLP/gRPC
         ▼
┌─────────────────┐
│ OpenTelemetry   │
│ Collector       │
└────────┬────────┘
         │
    ┌────┴────┬────────┬─────────┐
    ▼         ▼        ▼         ▼
┌────────┐ ┌────────┐ ┌──────┐ ┌─────────┐
│ Jaeger │ │Grafana │ │Zipkin│ │Prometheus│
│(Traces)│ │ Tempo  │ │      │ │(Metrics) │
└────────┘ └────────┘ └──────┘ └─────────┘
```

## Installation

### 1. Dependencies installieren

```bash
npm install @opentelemetry/sdk-node \
            @opentelemetry/auto-instrumentations-node \
            @opentelemetry/exporter-trace-otlp-http \
            @opentelemetry/exporter-metrics-otlp-http \
            @opentelemetry/resources \
            @opentelemetry/semantic-conventions
```

### 2. OpenTelemetry Collector aufsetzen

**docker-compose.yml** erweitern:

```yaml
version: "3.8"

services:
  otel-collector:
    image: otel/opentelemetry-collector:latest
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./monitoring/otel/otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317" # OTLP gRPC
      - "4318:4318" # OTLP HTTP
      - "55681:55681" # Legacy
    networks:
      - monitoring

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686" # Jaeger UI
      - "14268:14268" # Jaeger collector
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
```

### 3. Collector Konfiguration

**monitoring/otel/otel-collector-config.yaml**:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024

  memory_limiter:
    check_interval: 1s
    limit_mib: 512

  # Resource attributes enrichment
  resource:
    attributes:
      - key: environment
        value: ${env:ENVIRONMENT}
        action: upsert

exporters:
  # Jaeger für Traces
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true

  # Prometheus für Metrics
  prometheus:
    endpoint: "0.0.0.0:8889"
    namespace: erp_steinmetz

  # Logging für Development
  logging:
    loglevel: debug

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, resource]
      exporters: [jaeger, logging]

    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch, resource]
      exporters: [prometheus, logging]
```

## Backend Integration

### 1. Tracing Service erweitern

**apps/backend/src/services/tracingService.ts**:

```typescript
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

export class OpenTelemetryService {
  private sdk: NodeSDK | null = null;

  initialize(): void {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "erp-steinmetz-backend",
      [SemanticResourceAttributes.SERVICE_VERSION]:
        process.env.npm_package_version || "0.3.0",
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
        process.env.NODE_ENV || "development",
    });

    const traceExporter = new OTLPTraceExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
        "http://localhost:4318/v1/traces",
    });

    const metricExporter = new OTLPMetricExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
        "http://localhost:4318/v1/metrics",
    });

    this.sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 60000, // 1 Minute
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Express auto-instrumentation
          "@opentelemetry/instrumentation-express": {
            enabled: true,
          },
          // HTTP auto-instrumentation
          "@opentelemetry/instrumentation-http": {
            enabled: true,
            ignoreIncomingPaths: ["/health", "/metrics"],
          },
          // Database auto-instrumentation
          "@opentelemetry/instrumentation-pg": {
            enabled: true,
          },
        }),
      ],
    });

    this.sdk.start();
    console.log("✅ OpenTelemetry initialized");
  }

  shutdown(): Promise<void> {
    if (this.sdk) {
      return this.sdk.shutdown();
    }
    return Promise.resolve();
  }
}

export const otelService = new OpenTelemetryService();
```

### 2. Manuelle Span-Erstellung

Für Custom Business Logic können manuelle Spans erstellt werden:

```typescript
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("erp-steinmetz", "0.3.0");

async function processOrder(orderId: string) {
  const span = tracer.startSpan("process_order", {
    attributes: {
      "order.id": orderId,
      "order.type": "standard",
    },
  });

  try {
    // Business logic
    const result = await performOrderProcessing(orderId);

    span.setAttributes({
      "order.total": result.total,
      "order.items": result.items.length,
    });

    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (error as Error).message,
    });
    throw error;
  } finally {
    span.end();
  }
}
```

## Environment Variables

Füge folgende Variablen zu `.env` hinzu:

```bash
# OpenTelemetry Configuration
OTEL_TRACES_ENABLED=true
OTEL_METRICS_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=erp-steinmetz-backend
OTEL_SERVICE_VERSION=0.3.0
OTEL_LOG_LEVEL=info

# Resource Attributes
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.namespace=erp
```

## Frontend Integration (Optional)

Für Browser-Tracing mit OpenTelemetry Web:

```bash
npm install @opentelemetry/sdk-trace-web \
            @opentelemetry/instrumentation-document-load \
            @opentelemetry/instrumentation-user-interaction \
            @opentelemetry/exporter-trace-otlp-http
```

**apps/frontend/src/utils/telemetry.ts**:

```typescript
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

export function initializeTelemetry() {
  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: "erp-steinmetz-frontend",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.3.0",
    }),
  });

  const exporter = new OTLPTraceExporter({
    url: "/api/telemetry/traces", // Proxy through backend
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  provider.register({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation(),
    ],
  });
}
```

## Dashboards & Visualization

### Jaeger UI

Zugriff auf Jaeger UI: `http://localhost:16686`

**Features**:

- Trace Suche nach Service, Operation, Tags
- Span Timeline Visualization
- Dependency Graph
- Latency-Analyse

### Grafana mit Tempo

Für Langzeit-Speicherung und erweiterte Analyse kann Grafana Tempo verwendet werden:

```yaml
tempo:
  image: grafana/tempo:latest
  command: ["-config.file=/etc/tempo.yaml"]
  volumes:
    - ./monitoring/tempo/tempo.yaml:/etc/tempo.yaml
    - tempo-data:/var/tempo
  ports:
    - "3200:3200" # Tempo HTTP
    - "4317:4317" # OTLP gRPC
```

## Best Practices

### 1. Span-Naming

- Verwende spezifische, aussagekräftige Namen: `GET /api/users/:id`
- Vermeide generische Namen wie `handler` oder `function`
- Folge OpenTelemetry Semantic Conventions

### 2. Attribute

- Nutze Semantic Conventions für Standard-Attribute
- Custom Attributes mit Namespace: `erp.order.id`, `erp.user.role`
- Keine sensitiven Daten (Passwords, PII) in Attributes

### 3. Sampling

Für Production mit hohem Traffic:

```typescript
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-base";

const sdk = new NodeSDK({
  sampler: new TraceIdRatioBasedSampler(0.1), // 10% sampling
  // ... rest of config
});
```

### 4. Context Propagation

OpenTelemetry nutzt W3C Trace Context für verteiltes Tracing:

```typescript
import { propagation, trace } from "@opentelemetry/api";

// In HTTP requests
const headers = {};
propagation.inject(trace.getActiveSpan()?.spanContext(), headers);

// Externe API aufrufen mit propagierten Context
fetch("https://external-api.com", { headers });
```

## Performance Impact

- **Overhead**: ~2-5% bei aktivem Tracing
- **Memory**: ~50-100MB zusätzlich
- **Network**: Abhängig von Trace-Volumen (empfohlen: Sampling)

## Troubleshooting

### Problem: Keine Traces sichtbar

**Lösung**:

1. Prüfe OTEL_TRACES_ENABLED=true
2. Prüfe Collector erreichbar: `curl http://localhost:4318/v1/traces`
3. Prüfe Logs: `docker-compose logs otel-collector`

### Problem: Hoher Memory-Verbrauch

**Lösung**:

1. Aktiviere Sampling: `TraceIdRatioBasedSampler(0.1)`
2. Reduziere Batch-Größe im Collector
3. Setze Memory-Limiter im Collector

## Weitere Ressourcen

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Node.js SDK](https://opentelemetry.io/docs/instrumentation/js/getting-started/nodejs/)
- [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
- [Best Practices](https://opentelemetry.io/docs/concepts/sdk-configuration/general-sdk-configuration/)

---

**Status**: In Planung  
**Nächster Schritt**: Dependencies installieren und Collector aufsetzen  
**Verantwortlich**: DevOps / Platform Team
