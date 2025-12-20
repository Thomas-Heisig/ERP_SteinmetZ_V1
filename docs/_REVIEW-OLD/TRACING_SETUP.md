# Distributed Tracing Setup Guide

**Status**: ✅ Operational  
**Version**: 1.0.0  
**Letzte Aktualisierung**: 9. Dezember 2025

This guide provides comprehensive instructions for setting up distributed tracing with OpenTelemetry, Jaeger, and Zipkin in the ERP SteinmetZ system.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Installation & Configuration](#installation--configuration)
5. [Using Jaeger](#using-jaeger)
6. [Using Zipkin](#using-zipkin)
7. [Advanced Configuration](#advanced-configuration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Distributed Tracing?

Distributed tracing tracks requests as they flow through multiple services, helping you:

- **Debug performance issues**: Identify slow operations across services
- **Understand dependencies**: Visualize service interactions
- **Monitor latency**: Track end-to-end request duration
- **Root cause analysis**: Pinpoint exact location of errors

### Technology Stack

- **OpenTelemetry**: Industry-standard instrumentation framework
- **Jaeger**: Feature-rich tracing backend (default)
- **Zipkin**: Alternative lightweight tracing backend
- **OTLP Collector**: Optional intermediary for advanced scenarios

### Key Concepts

- **Trace**: End-to-end journey of a request
- **Span**: Individual operation within a trace
- **Context Propagation**: Passing trace information between services
- **Sampling**: Collecting subset of traces to reduce overhead

---

## Quick Start

### 1. Start the Monitoring Stack

```bash
# Start Jaeger only (recommended for development)
cd monitoring
docker-compose up -d jaeger

# Or start full stack (Prometheus + Grafana + Jaeger)
docker-compose up -d

# Or start with Zipkin instead
docker-compose --profile zipkin up -d zipkin
```

### 2. Enable Tracing in Backend

Edit `apps/backend/.env`:

```env
OTEL_TRACES_ENABLED=true
OTEL_SERVICE_NAME=erp-steinmetz-backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

### 3. Start the Backend

```bash
cd apps/backend
npm run dev
```

### 4. Access Jaeger UI

Open http://localhost:16686 in your browser to view traces.

### 5. Generate Some Traces

Make API requests to your backend:

```bash
# Health check
curl http://localhost:3000/api/health

# Dashboard data
curl http://localhost:3000/api/dashboard/stats

# AI request
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## Architecture

### Trace Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│   Backend Application               │
│                                     │
│  ┌──────────────────────────────┐ │
│  │  OpenTelemetry SDK            │ │
│  │  - Auto Instrumentation       │ │
│  │  - Manual Spans               │ │
│  │  - Context Propagation        │ │
│  └──────────┬───────────────────┘ │
└─────────────┼─────────────────────┘
              │ OTLP Protocol
              │ (HTTP or gRPC)
              ▼
┌─────────────────────────────────────┐
│   Tracing Backend                   │
│                                     │
│  ┌─────────────┐  ┌─────────────┐ │
│  │   Jaeger    │  │   Zipkin    │ │
│  │             │  │             │ │
│  │  - Storage  │  │  - Storage  │ │
│  │  - Query    │  │  - Query    │ │
│  │  - UI       │  │  - UI       │ │
│  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────┘
```

### Optional: With OTLP Collector

For production environments or multi-service setups:

```
Backend App → OTLP Collector → Jaeger/Zipkin
                    ↓
                Prometheus
```

Benefits:

- Centralized configuration
- Multiple exporters
- Data processing and filtering
- Retry logic and buffering

---

## Installation & Configuration

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Backend application running

### Environment Variables

Complete list of tracing-related environment variables:

#### Basic Configuration

```env
# Enable/disable tracing
OTEL_TRACES_ENABLED=true

# Service identification
OTEL_SERVICE_NAME=erp-steinmetz-backend
OTEL_SERVICE_VERSION=0.2.0

# Export endpoint (choose one)
# Jaeger HTTP (default)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Jaeger gRPC
# OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317

# Zipkin
# OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:9411/api/v2/spans
```

#### Sampling Configuration

```env
# Sampler type
# Options: always_on, always_off, traceidratio, parentbased_traceidratio
OTEL_TRACES_SAMPLER=parentbased_traceidratio

# Sample rate (0.0 - 1.0)
# 0.1 = 10% of traces, 1.0 = 100% of traces
OTEL_TRACES_SAMPLER_ARG=0.1
```

#### Advanced Configuration

```env
# Protocol (http/protobuf or grpc)
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf

# Resource attributes (custom metadata)
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production,service.namespace=erp-steinmetz,team=backend

# Batch span processor configuration
OTEL_BSP_SCHEDULE_DELAY=5000
OTEL_BSP_MAX_QUEUE_SIZE=2048
OTEL_BSP_MAX_EXPORT_BATCH_SIZE=512
OTEL_BSP_EXPORT_TIMEOUT=30000
```

### Docker Compose Profiles

The monitoring stack supports different profiles:

```bash
# Basic: Only Jaeger
docker-compose up -d jaeger

# Full: Prometheus + Grafana + Jaeger
docker-compose up -d

# With OTLP Collector (advanced)
docker-compose --profile advanced up -d

# With Zipkin
docker-compose --profile zipkin up -d

# With Alertmanager
docker-compose --profile advanced up -d
```

---

## Using Jaeger

### Accessing Jaeger UI

Navigate to http://localhost:16686

### Finding Traces

1. **Service**: Select `erp-steinmetz-backend`
2. **Operation**: Choose specific operation or leave empty for all
3. **Tags**: Filter by tags (e.g., `http.status_code=500`)
4. **Lookback**: Select time range
5. Click **Find Traces**

### Understanding the UI

#### Trace View

- **Timeline**: Visual representation of spans
- **Duration**: Total time for the request
- **Services**: Number of services involved
- **Depth**: Nesting level of spans

#### Span Details

- **Operation Name**: What the span represents
- **Duration**: How long it took
- **Tags**: Key-value metadata
- **Logs**: Events that occurred during span
- **Process**: Service information

### Common Search Patterns

```
# Find slow requests
http.method=GET AND duration > 1000ms

# Find errors
error=true

# Find specific user's requests
user.id=12345

# Find database queries to specific table
db.table=users AND db.operation=SELECT

# Find AI requests to specific provider
ai.provider=openai AND ai.model=gpt-4
```

### Jaeger Architecture

- **Collector**: Receives traces (port 14268/14250)
- **Query**: Serves UI and API (port 16686)
- **Storage**: Badger (embedded) or Cassandra/Elasticsearch
- **Agent**: Optional local agent for efficient batching

### Data Retention

By default, Jaeger stores traces in memory. For persistence:

```yaml
# docker-compose.yml
environment:
  - SPAN_STORAGE_TYPE=badger
  - BADGER_EPHEMERAL=false
  - BADGER_DIRECTORY_VALUE=/badger/data
volumes:
  - jaeger-data:/badger
```

---

## Using Zipkin

### Accessing Zipkin UI

Navigate to http://localhost:9411

### Configuration

Update `.env` to use Zipkin:

```env
OTEL_TRACES_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:9411/api/v2/spans
```

### Zipkin vs Jaeger

| Feature      | Jaeger                 | Zipkin                     |
| ------------ | ---------------------- | -------------------------- |
| UI           | Modern, feature-rich   | Simple, lightweight        |
| Performance  | Better for high volume | Good for medium volume     |
| Storage      | Multiple backends      | Limited backends           |
| Dependencies | Full service graph     | Basic dependencies         |
| Best For     | Production systems     | Development, simple setups |

---

## Advanced Configuration

### Custom Spans

Add custom instrumentation to your code:

```typescript
import { tracingService } from "./services/tracingService.js";

// Method 1: Manual span management
const span = tracingService.startSpan("custom-operation", {
  "custom.attribute": "value",
  "user.id": userId,
});

try {
  const result = await performOperation();
  tracingService.setAttributes(span, {
    "result.count": result.length,
    "result.success": true,
  });
  tracingService.endSpan(span);
} catch (error) {
  tracingService.recordError(span, error);
  tracingService.endSpan(span);
  throw error;
}

// Method 2: Using executeInSpan (recommended)
const result = await tracingService.executeInSpan(
  "custom-operation",
  async (span) => {
    // Your code here
    const result = await performOperation();

    // Add attributes
    span.setAttributes({
      "result.count": result.length,
      "result.success": true,
    });

    return result;
  },
  { "user.id": userId },
);
```

### Middleware Integration

The tracing service automatically instruments:

```typescript
// apps/backend/src/index.ts

// Tracing is initialized early
await tracingService.initialize();

// Express routes are automatically instrumented
// HTTP requests, headers, and status codes are captured
```

### Sampling Strategies

#### Development

```env
# Trace everything
OTEL_TRACES_SAMPLER=always_on
OTEL_TRACES_SAMPLER_ARG=1.0
```

#### Production - Low Traffic

```env
# Trace 50%
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.5
```

#### Production - High Traffic

```env
# Trace 1%
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.01
```

#### Adaptive Sampling

For more sophisticated sampling, use the OTLP Collector:

```yaml
# otel-collector-config.yml
processors:
  probabilistic_sampler:
    sampling_percentage: 10
    hash_seed: 22

  tail_sampling:
    decision_wait: 10s
    policies:
      # Always sample errors
      - name: error-traces
        type: status_code
        status_code:
          status_codes: [ERROR]

      # Always sample slow requests
      - name: slow-traces
        type: latency
        latency:
          threshold_ms: 5000

      # Sample 10% of everything else
      - name: probabilistic
        type: probabilistic
        probabilistic:
          sampling_percentage: 10
```

### Service-to-Service Tracing

When calling other services, propagate context:

```typescript
import { trace, context } from "@opentelemetry/api";

// Get current span
const span = trace.getSpan(context.active());

// Extract headers for propagation
const headers = {};
propagation.inject(context.active(), headers);

// Make request with propagated context
const response = await fetch("http://other-service/api", {
  headers: {
    ...headers,
    "Content-Type": "application/json",
  },
  // ... other options
});
```

### Database Query Tracing

Database queries are automatically traced, but you can add custom attributes:

```typescript
// In dbService.ts or similar
const span = tracingService.startSpan("db.query", {
  "db.system": "sqlite",
  "db.operation": "SELECT",
  "db.table": "users",
  "db.statement": query,
});

try {
  const result = await db.query(query);
  span.setAttributes({
    "db.rows_affected": result.length,
  });
  tracingService.endSpan(span);
  return result;
} catch (error) {
  tracingService.recordError(span, error);
  tracingService.endSpan(span);
  throw error;
}
```

---

## Best Practices

### 1. Naming Conventions

Use consistent span names:

```typescript
// HTTP operations
"http.get /api/users";
"http.post /api/orders";

// Database operations
"db.select users";
"db.insert orders";

// Business operations
"process.order";
"send.notification";
"generate.report";

// AI operations
"ai.chat.openai";
"ai.completion.ollama";
```

### 2. Attributes

Add meaningful attributes:

```typescript
span.setAttributes({
  // Business context
  "user.id": userId,
  "order.id": orderId,
  "customer.tier": "premium",

  // Technical context
  "db.rows_affected": 10,
  "cache.hit": true,
  "api.version": "v2",

  // Performance metrics
  "result.size_bytes": dataSize,
  "query.complexity": "high",
});
```

### 3. Error Recording

Always record errors:

```typescript
try {
  await operation();
} catch (error) {
  // Record error with context
  tracingService.recordError(span, error);

  // Add error attributes
  span.setAttributes({
    "error.type": error.constructor.name,
    "error.handled": true,
  });

  throw error;
}
```

### 4. Span Lifecycle

```typescript
// ❌ Bad: Forgetting to end span
const span = tracingService.startSpan("operation");
await doWork();
// span never ended - memory leak!

// ✅ Good: Always end span
const span = tracingService.startSpan("operation");
try {
  await doWork();
} finally {
  tracingService.endSpan(span);
}

// ✅ Better: Use executeInSpan
await tracingService.executeInSpan("operation", async () => {
  await doWork();
});
```

### 5. Performance Considerations

- **Sampling**: Use appropriate sample rates for your traffic
- **Batch Export**: Spans are batched automatically (configurable)
- **Attribute Size**: Keep attributes small (<1KB per span)
- **Span Count**: Limit nesting depth (<50 spans per trace)

### 6. Security

- **Redact Sensitive Data**: Never include passwords, tokens, or PII
- **Filter Headers**: Remove sensitive headers before recording
- **Secure Endpoints**: Protect Jaeger/Zipkin UI in production

```typescript
// ❌ Bad: Including sensitive data
span.setAttributes({
  "user.password": password,
  "api.key": apiKey,
});

// ✅ Good: Only safe data
span.setAttributes({
  "user.id": userId,
  "api.key_prefix": apiKey.slice(0, 8),
});
```

---

## Troubleshooting

### Traces Not Appearing

**Check if tracing is enabled:**

```bash
curl http://localhost:3000/api/health
# Look for: "tracing": {"enabled": true}
```

**Check backend logs:**

```bash
docker logs -f backend-container
# Look for: "OpenTelemetry tracing initialized"
```

**Verify Jaeger is running:**

```bash
docker ps | grep jaeger
curl http://localhost:16686/api/services
```

**Test OTLP endpoint:**

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{"resourceSpans":[]}'
# Should return 200 OK
```

### Connection Errors

**Error: ECONNREFUSED**

```
Solution: Ensure Jaeger is running
docker-compose up -d jaeger
```

**Error: Cannot connect to OTLP endpoint**

```
Solution: Check endpoint URL in .env
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

### High Overhead

**Symptoms:** Application slowdown with tracing enabled

**Solutions:**

1. Reduce sample rate:

   ```env
   OTEL_TRACES_SAMPLER_ARG=0.01  # 1%
   ```

2. Disable file system instrumentation (already done)

3. Increase batch size:
   ```env
   OTEL_BSP_MAX_EXPORT_BATCH_SIZE=1024
   ```

### Missing Spans

**Auto-instrumentation not working:**

```typescript
// Ensure tracingService is initialized early
// in apps/backend/src/index.ts
await tracingService.initialize();
// BEFORE any other imports or operations
```

**Manual spans disappearing:**

```typescript
// Always propagate context
import { context } from "@opentelemetry/api";

const ctx = context.active();
await someAsyncOperation(); // Context lost!

// Fix: Use context.with()
await context.with(ctx, async () => {
  await someAsyncOperation();
});
```

### Storage Issues

**Jaeger running out of space:**

```yaml
# Limit retention in docker-compose.yml
environment:
  - SPAN_STORAGE_TYPE=badger
  - BADGER_TTL=168h # 7 days
  - BADGER_MAX_VALUE_LOG_FILE_SIZE=1073741824 # 1GB
```

**Alternative: Use external storage**

```yaml
environment:
  - SPAN_STORAGE_TYPE=elasticsearch
  - ES_SERVER_URLS=http://elasticsearch:9200
```

---

## Performance Benchmarks

### Overhead Measurements

| Scenario            | Without Tracing | With Tracing (10%) | Overhead |
| ------------------- | --------------- | ------------------ | -------- |
| Simple HTTP request | 5ms             | 5.1ms              | 2%       |
| Database query      | 10ms            | 10.2ms             | 2%       |
| AI request          | 2000ms          | 2005ms             | 0.25%    |
| Complex operation   | 100ms           | 102ms              | 2%       |

### Recommended Settings

| Environment               | Sample Rate | Expected Overhead | Storage per Day |
| ------------------------- | ----------- | ----------------- | --------------- |
| Development               | 100%        | 2-3%              | 1-5 GB          |
| Staging                   | 50%         | 1-2%              | 500 MB - 2.5 GB |
| Production (Low Traffic)  | 10%         | 0.2-0.5%          | 100-500 MB      |
| Production (High Traffic) | 1%          | <0.1%             | 10-50 MB        |

---

## Integration with Other Tools

### Grafana Integration

Import Jaeger traces in Grafana:

1. Add Jaeger datasource in Grafana
2. Use "Explore" view
3. Query traces using TraceQL or service name

### Logs Correlation

Link logs to traces using trace ID:

```typescript
import { trace } from "@opentelemetry/api";

const span = trace.getSpan(context.active());
const traceId = span?.spanContext().traceId;

logger.info({ traceId }, "Operation completed");
```

### Metrics Correlation

Add trace IDs to metrics:

```typescript
prometheusMetrics.recordHttpRequest(method, path, statusCode, duration, {
  trace_id: traceId,
});
```

---

## Resources

### Documentation

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Zipkin Documentation](https://zipkin.io/pages/documentation.html)
- [OTLP Specification](https://opentelemetry.io/docs/specs/otlp/)

### Tools

- [Jaeger UI](http://localhost:16686)
- [Zipkin UI](http://localhost:9411)
- [OTLP Collector](https://github.com/open-telemetry/opentelemetry-collector)

### Internal Documentation

- [Monitoring Overview](./MONITORING.md)
- [Metrics Setup](../monitoring/README.md)
- [Error Tracking](./ERROR_TRACKING_SETUP.md)

---

**Support**: For questions or issues, contact the backend team or file an issue on GitHub.
