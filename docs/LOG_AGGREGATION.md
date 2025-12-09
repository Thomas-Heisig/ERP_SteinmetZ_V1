# Log Aggregation Setup Guide

**Status**: 🟡 In Planung  
**Version**: 0.1.0  
**Letzte Aktualisierung**: 9. Dezember 2025

## Übersicht

Log Aggregation zentralisiert Logs von mehreren Services und Instanzen, ermöglicht effiziente Suche, Filterung und Analyse. Diese Anleitung vergleicht verschiedene Lösungen und zeigt die Integration.

## Vergleich der Lösungen

| Feature         | ELK Stack      | Loki + Grafana    | Datadog       | Papertrail    |
| --------------- | -------------- | ----------------- | ------------- | ------------- |
| **Kosten**      | Self-Hosted    | Self-Hosted       | SaaS ($$$)    | SaaS ($$)     |
| **Komplexität** | Hoch           | Mittel            | Niedrig       | Niedrig       |
| **Skalierung**  | Exzellent      | Gut               | Exzellent     | Gut           |
| **Suche**       | Elasticsearch  | LogQL             | Erweitert     | Einfach       |
| **Integration** | Gut            | Perfekt (Grafana) | Gut           | Gut           |
| **Retention**   | Konfigurierbar | Konfigurierbar    | Plan-abhängig | Plan-abhängig |

**Empfehlung**: Loki + Grafana für beste Integration mit bestehendem Monitoring

## Option 1: Loki + Grafana (Empfohlen)

### Vorteile

- ✅ Perfekte Integration mit Grafana (bereits vorhanden)
- ✅ Einfacher als ELK Stack
- ✅ Labels statt Full-Text-Index (kostengünstiger)
- ✅ LogQL ähnlich zu PromQL
- ✅ Self-Hosted, keine SaaS-Kosten

### Architektur

```
┌──────────────┐
│ App Instance │
│   (Pino)     │
└──────┬───────┘
       │ JSON logs
       ▼
┌──────────────┐
│   Promtail   │ ← Log Shipper
│  (or Fluent) │
└──────┬───────┘
       │ Push logs with labels
       ▼
┌──────────────┐
│     Loki     │ ← Log Storage
│  (Datastore) │
└──────┬───────┘
       │ Query
       ▼
┌──────────────┐
│   Grafana    │ ← Visualization
│  (Dashboard) │
└──────────────┘
```

### Installation

**1. Docker Compose erweitern**

**monitoring/docker-compose.yml**:

```yaml
version: "3.8"

services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./loki/loki-config.yaml:/etc/loki/local-config.yaml
      - loki-data:/loki
    networks:
      - monitoring

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./promtail/promtail-config.yaml:/etc/promtail/config.yaml
      - /var/log:/var/log
      - ../apps/backend/logs:/logs/backend
    command: -config.file=/etc/promtail/config.yaml
    networks:
      - monitoring
    depends_on:
      - loki

  grafana:
    # ... existing config ...
    environment:
      - GF_INSTALL_PLUGINS=grafana-loki-datasource

volumes:
  loki-data:

networks:
  monitoring:
    driver: bridge
```

**2. Loki Konfiguration**

**monitoring/loki/loki-config.yaml**:

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

query_range:
  results_cache:
    cache:
      embedded_cache:
        enabled: true
        max_size_mb: 100

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v12
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://localhost:9093

# Retention (30 Tage)
limits_config:
  retention_period: 720h

# Compaction
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  retention_enabled: true
```

**3. Promtail Konfiguration**

**monitoring/promtail/promtail-config.yaml**:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # Backend JSON Logs
  - job_name: backend
    static_configs:
      - targets:
          - localhost
        labels:
          job: backend
          env: production
          __path__: /logs/backend/*.log

    pipeline_stages:
      # Parse JSON logs
      - json:
          expressions:
            level: level
            ts: ts
            msg: msg
            module: module

      # Extract labels
      - labels:
          level:
          module:

      # Parse timestamp
      - timestamp:
          source: ts
          format: RFC3339Nano

      # Output format
      - output:
          source: msg

  # System Logs (optional)
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: system
          __path__: /var/log/*.log
```

**4. Backend Logger anpassen**

**apps/backend/src/utils/logger.ts** ist bereits mit Pino konfiguriert und schreibt JSON-Logs.

Für Production: Log-File-Rotation aktivieren:

```typescript
import pino from "pino";
import { createStream } from "rotating-file-stream";

// Rotating file stream
const stream = createStream("app.log", {
  interval: "1d", // Täglich rotieren
  maxFiles: 30, // 30 Tage behalten
  path: "./logs",
  compress: "gzip", // Alte Logs komprimieren
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
    },
  },
  pino.multistream([
    { stream: process.stdout }, // Console (für Docker logs)
    { stream }, // File (für Promtail)
  ]),
);
```

### Grafana Integration

**1. Loki als Data Source hinzufügen**

In Grafana UI:

1. Configuration → Data Sources → Add data source
2. Select "Loki"
3. URL: `http://loki:3100`
4. Save & Test

**2. Log-Dashboard erstellen**

**Explore View**:

```logql
# Alle Backend-Logs
{job="backend"}

# Nur Errors
{job="backend", level="ERROR"}

# Bestimmtes Modul
{job="backend", module="auth"}

# Mit Text-Filter
{job="backend"} |= "payment failed"

# Rate von Errors
rate({job="backend", level="ERROR"}[5m])
```

**Dashboard Panels**:

```json
{
  "panels": [
    {
      "title": "Recent Errors",
      "targets": [
        {
          "expr": "{job=\"backend\", level=\"ERROR\"}"
        }
      ],
      "options": {
        "showTime": true,
        "showLabels": true,
        "sortOrder": "Descending"
      }
    },
    {
      "title": "Error Rate",
      "targets": [
        {
          "expr": "sum(rate({job=\"backend\", level=\"ERROR\"}[5m])) by (module)"
        }
      ],
      "type": "graph"
    }
  ]
}
```

### LogQL Queries

**Basic Queries**:

```logql
# Alle Logs
{job="backend"}

# Filter nach Level
{job="backend", level="ERROR"}

# Mehrere Jobs
{job=~"backend|frontend"}

# Negation
{job="backend", level!="DEBUG"}
```

**Log Pipeline**:

```logql
# Text-Suche
{job="backend"} |= "error"

# Regex
{job="backend"} |~ "error|failure"

# JSON-Parsing
{job="backend"} | json | userId != ""

# Line Format
{job="backend"} | line_format "{{.level}}: {{.msg}}"
```

**Aggregations**:

```logql
# Count
count_over_time({job="backend"}[5m])

# Rate
rate({job="backend", level="ERROR"}[5m])

# Bytes
sum(bytes_over_time({job="backend"}[1h]))

# Top Errors
topk(10, sum by (msg) (count_over_time({level="ERROR"}[1h])))
```

### Alerts

**Alert Rules in Loki**:

**monitoring/loki/rules.yaml**:

```yaml
groups:
  - name: errors
    interval: 1m
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate({job="backend", level="ERROR"}[5m])) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "More than 10 errors/sec in backend"

      - alert: CriticalError
        expr: |
          count_over_time({job="backend", level="FATAL"}[1m]) > 0
        labels:
          severity: critical
        annotations:
          summary: "Fatal error detected"
          description: "A fatal error occurred in backend"
```

## Option 2: ELK Stack (Elasticsearch, Logstash, Kibana)

### Vorteile

- ✅ Mächtige Full-Text-Suche
- ✅ Sehr flexible Filterung
- ✅ Großes Ökosystem
- ✅ Bewährte Enterprise-Lösung

### Nachteile

- ❌ Ressourcen-intensiv (>2GB RAM für ES)
- ❌ Komplexe Konfiguration
- ❌ Lizenz-Änderungen (Elastic License 2.0)

### Quick Start (nur für Referenz)

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - es-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
```

## Option 3: Cloud-Lösungen

### Datadog

**Vorteile**:

- Komplette Observability-Plattform
- Keine Infrastruktur-Verwaltung
- APM, Logs, Metrics in einem

**Nachteile**:

- Teuer (ab $15/Host/Monat)
- Vendor Lock-in

### AWS CloudWatch

Für AWS-Deployments:

```typescript
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const client = new CloudWatchLogsClient({ region: "eu-central-1" });

// Pino Transport für CloudWatch
import pinoCW from "pino-cloudwatch";

const cwStream = pinoCW({
  logGroupName: "/erp-steinmetz/backend",
  logStreamName: "production",
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_region: "eu-central-1",
});

export const logger = pino(cwStream);
```

## Best Practices

### 1. Structured Logging

✅ **Gut**:

```typescript
logger.info({ userId, orderId, action: "payment" }, "Payment processed");
```

❌ **Schlecht**:

```typescript
logger.info(`Payment processed for user ${userId} and order ${orderId}`);
```

### 2. Log Levels

- **FATAL**: System unbrauchbar (App crash)
- **ERROR**: Fehler, der Aufmerksamkeit braucht
- **WARN**: Warnung, läuft aber weiter
- **INFO**: Wichtige Business-Events
- **DEBUG**: Detaillierte Informationen
- **TRACE**: Sehr detailliert (nur Development)

### 3. Sensitive Data

**Niemals loggen**:

- Passwörter
- Tokens/API-Keys
- Kreditkarten-Daten
- Sozialversicherungsnummern

Nutze Logger-Redaction (bereits in unserem Logger implementiert).

### 4. Log Retention

**Empfohlene Retention**:

- **Production**: 30-90 Tage
- **Staging**: 14-30 Tage
- **Development**: 7 Tage

### 5. Performance

**Asynchrones Logging** (Pino macht das automatisch):

- Logs werden non-blocking geschrieben
- Kein Performance-Impact auf Requests

**Sampling** bei sehr hohem Volume:

```typescript
// Nur jeder 10. Debug-Log
if (Math.random() < 0.1) {
  logger.debug({ data }, "Detailed info");
}
```

## Monitoring & Alerts

### Log-basierte Metrics

Erstelle Metrics aus Logs in Grafana:

```logql
# Request Rate
rate({job="backend"} | json | level="INFO" |= "Request completed"[5m])

# Latency Histogram
histogram_quantile(0.95,
  sum(rate({job="backend"} | json | duration > 0 [5m])) by (le)
)
```

## Kosten-Schätzung

### Loki (Self-Hosted)

- **Storage**: ~1-2 GB/Tag für 10k req/min
- **Server**: 2 CPU, 4GB RAM (~$50/Monat VPS)
- **Gesamt**: ~$50/Monat

### ELK Stack (Self-Hosted)

- **Storage**: ~2-3 GB/Tag (Full-Text-Index)
- **Server**: 4 CPU, 8GB RAM (~$100/Monat VPS)
- **Gesamt**: ~$100/Monat

### Datadog

- **Kosten**: $15/Host + $0.10/GB ingested
- **Bei 10GB/Tag**: ~$315/Monat

## Troubleshooting

### Problem: Keine Logs in Loki

**Lösung**:

1. Prüfe Promtail läuft: `docker-compose ps promtail`
2. Prüfe Promtail Logs: `docker-compose logs promtail`
3. Teste Loki: `curl http://localhost:3100/ready`
4. Prüfe File-Permissions auf Log-Verzeichnis

### Problem: Hoher Disk-Verbrauch

**Lösung**:

1. Reduziere Retention: `retention_period: 168h` (7 Tage)
2. Aktiviere Compaction in Loki
3. Filter unwichtige Logs in Promtail

## Weitere Ressourcen

- [Loki Docs](https://grafana.com/docs/loki/latest/)
- [LogQL](https://grafana.com/docs/loki/latest/logql/)
- [Promtail](https://grafana.com/docs/loki/latest/clients/promtail/)
- [ELK Stack](https://www.elastic.co/elastic-stack)
- [Pino Docs](https://getpino.io/)

---

**Status**: In Planung  
**Nächster Schritt**: Loki + Promtail aufsetzen  
**Verantwortlich**: DevOps Team
