# Log Retention Policy

**Status**: ✅ Defined  
**Version**: 1.0.0  
**Letzte Aktualisierung**: 9. Dezember 2025

## Übersicht

Diese Richtlinie definiert, wie lange verschiedene Log-Arten gespeichert werden, um Balance zwischen Compliance-Anforderungen, Storage-Kosten und operativen Bedürfnissen zu gewährleisten.

## Retention-Perioden nach Umgebung

### Production

| Log-Typ                 | Retention                           | Grund                 | Storage-Format         |
| ----------------------- | ----------------------------------- | --------------------- | ---------------------- |
| **Application Logs**    | 90 Tage                             | Debugging, Compliance | Compressed             |
| **Security Logs**       | 1 Jahr                              | Audit, DSGVO          | Encrypted + Compressed |
| **Access Logs**         | 90 Tage                             | Analytics, Security   | Compressed             |
| **Error Logs**          | 180 Tage                            | Root Cause Analysis   | Compressed             |
| **Audit Logs**          | 7 Jahre                             | GoBD-Compliance       | Encrypted + Compressed |
| **Performance Metrics** | 30 Tage (raw), 2 Jahre (aggregiert) | Kapazitätsplanung     | Aggregated             |

### Staging

| Log-Typ                 | Retention | Grund              | Storage-Format |
| ----------------------- | --------- | ------------------ | -------------- |
| **Application Logs**    | 30 Tage   | Testing, Debugging | Compressed     |
| **Security Logs**       | 90 Tage   | Security Testing   | Compressed     |
| **Error Logs**          | 60 Tage   | Bug Investigation  | Compressed     |
| **Performance Metrics** | 14 Tage   | Load Testing       | Raw            |

### Development

| Log-Typ                 | Retention | Grund             | Storage-Format |
| ----------------------- | --------- | ----------------- | -------------- |
| **Application Logs**    | 7 Tage    | Lokales Debugging | Raw            |
| **Error Logs**          | 14 Tage   | Bug Fixing        | Raw            |
| **Performance Metrics** | 7 Tage    | Optimization      | Raw            |

## Compliance-Anforderungen

### DSGVO (GDPR)

**Artikel 5(1)(e)**: Speicherbegrenzung

- Personenbezogene Daten nur so lange speichern, wie für Zweck erforderlich
- **Unsere Umsetzung**:
  - Pseudonymisierung von User-IDs in Logs
  - Automatische Löschung nach 90 Tagen (Application Logs)
  - Exception: Audit Logs für rechtliche Verpflichtungen (7 Jahre)

**Artikel 17**: Recht auf Löschung

- User können Löschung ihrer Daten verlangen
- **Unsere Umsetzung**:
  - Script für User-Data-Deletion inklusive Logs
  - Log-Anonymisierung nach User-Deletion

### GoBD (Deutschland)

**§ 147 AO**: Aufbewahrungsfrist

- Buchungsbelege und Geschäftsunterlagen: 10 Jahre
- Handels- und Geschäftsbriefe: 6 Jahre
- **Unsere Umsetzung**:
  - Audit Logs (Transaktionen, Rechnungen): 7 Jahre (sicher, verschlüsselt)
  - Business-relevante Logs: Tagged und separiert

### SOX (falls anwendbar)

- Audit Logs: 7 Jahre
- Change Logs: 7 Jahre
- Access Logs: 7 Jahre

## Log-Kategorisierung

### Kritisch (Critical)

**Retention**: 1-7 Jahre

- Audit Logs (User-Aktionen, Admin-Aktionen)
- Transaction Logs (Zahlungen, Rechnungen)
- Security Events (Login, Permissions Changes)
- Data Changes (CRUD-Operationen auf kritische Daten)

**Eigenschaften**:

- Verschlüsselt
- Tamper-Proof (WORM Storage)
- Backup an Off-Site-Location

### Wichtig (Important)

**Retention**: 90-180 Tage

- Application Errors
- Performance Issues
- API Errors
- Database Slow Queries

**Eigenschaften**:

- Komprimiert
- Searchable (Loki/Elasticsearch)

### Standard (Standard)

**Retention**: 30-90 Tage

- Application Info Logs
- HTTP Access Logs
- Debug Logs (Production)

**Eigenschaften**:

- Komprimiert
- Archiviert nach 30 Tagen

### Temporär (Temporary)

**Retention**: 7-14 Tage

- Development Logs
- Staging Logs
- Test Logs

**Eigenschaften**:

- Unkomprimiert
- Lokaler Storage

## Implementierung

### Loki Configuration

**monitoring/loki/loki-config.yaml**:

```yaml
limits_config:
  retention_period: 2160h # 90 Tage für Standard-Logs

table_manager:
  retention_deletes_enabled: true
  retention_period: 2160h # 90 Tage

# Komprimierung
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
  retention_delete_worker_count: 150
```

**Erweiterte Konfiguration für unterschiedliche Retention nach Log-Typ**:

```yaml
# Stream-basierte Retention via Labels
limits_config:
  # Standard: 90 Tage
  retention_period: 2160h

  # Per-Tenant Overrides (via Labels)
  per_stream_rate_limit: 3MB
  per_stream_rate_limit_burst: 15MB
# Custom Retention via Tenant Config
# (In Loki 2.7+, pro-stream retention via labels)
```

### Promtail Configuration

**Automatisches Labeling für Retention**:

```yaml
scrape_configs:
  - job_name: backend
    static_configs:
      - targets:
          - localhost
        labels:
          job: backend
          environment: production
          retention: standard # 90 Tage

    # Audit Logs bekommen längere Retention
    relabel_configs:
      - source_labels: [__meta_filepath]
        target_label: __path__

      # Audit Logs
      - source_labels: [module]
        regex: audit
        target_label: retention
        replacement: audit # 7 Jahre

      # Security Logs
      - source_labels: [level]
        regex: (ERROR|WARN)
        target_label: retention
        replacement: important # 180 Tage
```

### Backup-Strategie

**Tägliche Backups**:

```bash
#!/bin/bash
# backup-logs.sh

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/logs/$DATE"

# Loki Data exportieren
docker exec loki tar -czf - /loki/chunks | \
  gpg --encrypt --recipient admin@erp-steinmetz.de > \
  "$BACKUP_DIR/loki-chunks-$DATE.tar.gz.gpg"

# Retention Check
find /backups/logs/ -type f -mtime +90 -delete  # Standard
find /backups/logs/audit/ -type f -mtime +2555 -delete  # 7 Jahre
```

### Rotation & Archivierung

**File-Based Logs (Backend)**:

```typescript
// apps/backend/src/utils/logger.ts
import { createStream } from "rotating-file-stream";

const createLogStream = (filename: string, retention: number) => {
  return createStream(filename, {
    interval: "1d", // Täglich rotieren
    maxFiles: retention, // Anzahl Tage
    path: "./logs",
    compress: "gzip",

    // Callback nach Rotation
    rotate: (filename: string, index: number) => {
      // Optional: Upload zu S3/Backup-Server
      if (index > 30) {
        // Nach 30 Tagen archivieren
        uploadToArchive(filename);
      }
    },
  });
};

// Standard Logs: 90 Tage
const appLogStream = createLogStream("app.log", 90);

// Audit Logs: 7 Jahre = 2555 Tage
const auditLogStream = createLogStream("audit.log", 2555);

// Security Logs: 1 Jahr = 365 Tage
const securityLogStream = createLogStream("security.log", 365);
```

## Archivierung

### Cold Storage

Logs älter als 30 Tage werden in Cold Storage verschoben:

**Archivierungs-Script**:

```bash
#!/bin/bash
# archive-old-logs.sh

ARCHIVE_AGE=30 # Tage
S3_BUCKET="s3://erp-steinmetz-logs-archive"

# Finde Logs älter als 30 Tage
find /var/log/erp/ -name "*.log.gz" -mtime +$ARCHIVE_AGE | \
while read logfile; do
  # Upload zu S3 mit Lifecycle Policy
  aws s3 cp "$logfile" "$S3_BUCKET/$(date +%Y/%m/)/" \
    --storage-class GLACIER

  # Lokale Kopie löschen nach erfolgreichem Upload
  if [ $? -eq 0 ]; then
    rm "$logfile"
  fi
done
```

**S3 Lifecycle Policy**:

```json
{
  "Rules": [
    {
      "Id": "ArchiveAuditLogs",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "audit/"
      },
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    },
    {
      "Id": "DeleteStandardLogs",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "application/"
      },
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

## Monitoring der Retention

### Metrics

```prometheus
# Loki Storage Size
loki_ingester_memory_streams

# Log Ingestion Rate
rate(loki_distributor_lines_received_total[5m])

# Retention Cleanup
loki_compactor_runs_completed_total
```

### Alerts

```yaml
# monitoring/prometheus/alert-rules.yml

groups:
  - name: log_retention
    interval: 1h
    rules:
      - alert: LogStorageHigh
        expr: loki_ingester_memory_streams > 1000000
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "High log storage usage"
          description: "Loki ingester has {{ $value }} streams. Consider reviewing retention policy."

      - alert: RetentionCleanupFailed
        expr: increase(loki_compactor_runs_failed_total[24h]) > 0
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "Loki compactor failing"
          description: "Log retention cleanup is failing"
```

## Data Privacy & Security

### Anonymisierung

**Vor Archivierung**:

```typescript
// Anonymisiere User-IDs in alten Logs
const anonymizeLogs = (logs: LogEntry[]) => {
  return logs.map((log) => ({
    ...log,
    userId: log.userId ? hashUserId(log.userId) : undefined,
    userEmail: "[REDACTED]",
    ip: anonymizeIP(log.ip),
  }));
};
```

### Verschlüsselung

**At Rest**:

- Alle Audit Logs verschlüsselt (AES-256)
- Encryption Key Management: AWS KMS / Azure Key Vault

**In Transit**:

- TLS 1.3 für Log-Shipping
- mTLS zwischen Promtail und Loki

## Kosten-Optimierung

### Storage-Kosten nach Retention

**Annahme**: 10 GB/Tag Log-Volume

| Retention | Storage Needed | Kosten (S3 Standard) | Kosten (S3 Glacier) |
| --------- | -------------- | -------------------- | ------------------- |
| 7 Tage    | 70 GB          | $1.61/Monat          | -                   |
| 30 Tage   | 300 GB         | $6.90/Monat          | -                   |
| 90 Tage   | 900 GB         | $20.70/Monat         | $3.60/Monat         |
| 1 Jahr    | 3.6 TB         | $82.80/Monat         | $14.40/Monat        |
| 7 Jahre   | 25.2 TB        | $579.60/Monat        | $100.80/Monat       |

**Empfehlung**:

- 0-30 Tage: S3 Standard (Hot Storage)
- 30-365 Tage: S3 Glacier (Cold Storage)
- 1-7 Jahre: S3 Glacier Deep Archive

## Compliance-Audit

### Prüfung der Retention-Compliance

**Quarterly Audit-Checklist**:

- [ ] Alle Log-Typen korrekt kategorisiert
- [ ] Retention-Perioden eingehalten
- [ ] Backup-Prozess funktioniert
- [ ] Archivierung läuft automatisch
- [ ] Verschlüsselung aktiv für Audit Logs
- [ ] User-Deletion-Script getestet
- [ ] DSGVO-Löschanfragen dokumentiert
- [ ] Storage-Kosten im Budget

### Dokumentation

Alle Änderungen an Retention-Policies müssen dokumentiert werden:

```markdown
## Change Log

### 2025-12-09

- Initial Retention Policy definiert
- Standard: 90 Tage
- Audit: 7 Jahre
- Security: 1 Jahr

### [Datum]

- [Änderung]
- [Grund]
- [Approved by]
```

## Weitere Ressourcen

- [Loki Retention Documentation](https://grafana.com/docs/loki/latest/operations/storage/retention/)
- [DSGVO Artikel 5](https://dsgvo-gesetz.de/art-5-dsgvo/)
- [GoBD Aufbewahrungsfristen](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Weitere_Steuerthemen/Abgabenordnung/2019-11-28-GoBD.html)
- [AWS S3 Lifecycle Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)

---

**Letzte Aktualisierung**: 9. Dezember 2025  
**Maintainer**: Thomas Heisig  
**Nächster Review**: März 2026 (Quarterly)
