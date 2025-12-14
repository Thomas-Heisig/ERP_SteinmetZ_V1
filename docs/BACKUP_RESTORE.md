# Backup & Restore Strategy

**Version**: 1.0.0  
**Status**: Production Ready  
**Letzte Aktualisierung**: Dezember 2024  
**Maintainer**: Thomas Heisig

---

## 📋 Überblick

Dieses Dokument beschreibt die Backup- und Restore-Strategie für das ERP SteinmetZ System
zur Sicherstellung von Datensicherheit, Business Continuity und Compliance-Anforderungen.

---

## 🎯 Ziele

1. **Datensicherheit**: Schutz vor Datenverlust durch Hardware-Fehler, menschliche Fehler, oder Cyberangriffe
2. **Business Continuity**: Minimale Downtime bei Disaster Recovery
3. **Compliance**: Erfüllung von GoBD, GDPR und Branchenstandards
4. **RTO/RPO**: Recovery Time Objective < 4h, Recovery Point Objective < 24h

---

## 📦 Backup Components

### 1. Database (SQLite/PostgreSQL)

#### SQLite (Development/Small Production)

**Backup-Strategie**:

- **Frequenz**: Täglich um 2:00 Uhr
- **Retention**: 30 Tage daily, 12 Monate monthly
- **Methode**: File-based Copy mit SQLite Backup API

**Skript**:

```bash
#!/bin/bash
# scripts/backup-sqlite.sh

set -e

BACKUP_DIR="/var/backups/erp-steinmetz/sqlite"
DB_FILE="./data/production.sqlite3"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sqlite3"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform backup using SQLite's backup command
sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"

# Compress backup
gzip "$BACKUP_FILE"

# Verify backup integrity
gunzip -c "$BACKUP_FILE.gz" | sqlite3 -readonly :memory: "PRAGMA integrity_check;" > /dev/null

echo "✅ SQLite backup completed: $BACKUP_FILE.gz"

# Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "backup_*.sqlite3.gz" -mtime +30 -delete

# Monthly backup (1st of month)
if [ $(date +%d) == "01" ]; then
  MONTHLY_DIR="$BACKUP_DIR/monthly"
  mkdir -p "$MONTHLY_DIR"
  cp "$BACKUP_FILE.gz" "$MONTHLY_DIR/backup_$(date +%Y-%m).sqlite3.gz"
fi
```

#### PostgreSQL (Production)

**Backup-Strategie**:

- **Frequenz**:
  - Full Backup: Täglich um 2:00 Uhr
  - Incremental: Stündlich
  - WAL Archiving: Kontinuierlich
- **Retention**: 7 Tage full, 30 Tage incremental, 90 Tage WAL
- **Methode**: pg_dump + WAL archiving

**Full Backup Skript**:

```bash
#!/bin/bash
# scripts/backup-postgresql.sh

set -e

BACKUP_DIR="/var/backups/erp-steinmetz/postgresql"
DB_NAME="erp_steinmetz"
DB_USER="erp_user"
DB_HOST="localhost"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/full_backup_$DATE.sql"

mkdir -p "$BACKUP_DIR"

# Full backup with pg_dump
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  -F c \
  -b \
  -v \
  -f "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

# Verify backup
pg_restore --list "$BACKUP_FILE.gz" > /dev/null

echo "✅ PostgreSQL backup completed: $BACKUP_FILE.gz"

# Cleanup old backups
find "$BACKUP_DIR" -name "full_backup_*.sql.gz" -mtime +7 -delete
```

**WAL Archiving** (postgresql.conf):

```conf
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/backups/erp-steinmetz/postgresql/wal/%f && cp %p /var/backups/erp-steinmetz/postgresql/wal/%f'
```

---

### 2. Redis (Session & Cache)

**Backup-Strategie**:

- **Frequenz**: Täglich um 3:00 Uhr
- **Retention**: 7 Tage
- **Methode**: RDB Snapshot + AOF

**redis.conf**:

```conf
# RDB Snapshots
save 900 1      # After 900 sec (15 min) if at least 1 key changed
save 300 10     # After 300 sec (5 min) if at least 10 keys changed
save 60 10000   # After 60 sec if at least 10000 keys changed

dbfilename dump.rdb
dir /var/lib/redis

# AOF (Append Only File)
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
```

**Backup Skript**:

```bash
#!/bin/bash
# scripts/backup-redis.sh

set -e

BACKUP_DIR="/var/backups/erp-steinmetz/redis"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

mkdir -p "$BACKUP_DIR"

# Trigger BGSAVE
redis-cli BGSAVE

# Wait for BGSAVE to complete
while [ $(redis-cli LASTSAVE) -eq $LASTSAVE ]; do
  sleep 1
done

# Copy RDB and AOF files
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/dump_$DATE.rdb"
cp /var/lib/redis/appendonly.aof "$BACKUP_DIR/aof_$DATE.aof"

# Compress
gzip "$BACKUP_DIR/dump_$DATE.rdb"
gzip "$BACKUP_DIR/aof_$DATE.aof"

echo "✅ Redis backup completed"

# Cleanup old backups
find "$BACKUP_DIR" -name "dump_*.rdb.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "aof_*.aof.gz" -mtime +7 -delete
```

---

### 3. Application Files & Configuration

**Backup-Strategie**:

- **Frequenz**: Bei Deployment (Git-tagged)
- **Retention**: Alle Git-Tags
- **Methode**: Git Repository + Config Files

**Zu sichernde Files**:

```
/home/erp-steinmetz/
├── .env                        # Environment Variables
├── apps/backend/config/        # AI Settings, Prometheus Config
├── data/                       # Uploads, Generated Files
└── monitoring/                 # Monitoring Config
```

**Backup Skript**:

```bash
#!/bin/bash
# scripts/backup-config.sh

set -e

BACKUP_DIR="/var/backups/erp-steinmetz/config"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
ARCHIVE="$BACKUP_DIR/config_$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"

# Backup configuration files
tar -czf "$ARCHIVE" \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  /home/erp-steinmetz/.env \
  /home/erp-steinmetz/apps/backend/config \
  /home/erp-steinmetz/data \
  /home/erp-steinmetz/monitoring

echo "✅ Config backup completed: $ARCHIVE"

# Cleanup old backups
find "$BACKUP_DIR" -name "config_*.tar.gz" -mtime +30 -delete
```

---

### 4. Uploaded Files & Documents

**Backup-Strategie**:

- **Frequenz**: Täglich um 4:00 Uhr
- **Retention**: 90 Tage
- **Methode**: Incremental mit rsync

**Backup Skript**:

```bash
#!/bin/bash
# scripts/backup-uploads.sh

set -e

SOURCE_DIR="/home/erp-steinmetz/data/uploads"
BACKUP_DIR="/var/backups/erp-steinmetz/uploads"
DATE=$(date +%Y-%m-%d)

mkdir -p "$BACKUP_DIR"

# Incremental backup with rsync
rsync -avz \
  --delete \
  --link-dest="$BACKUP_DIR/latest" \
  "$SOURCE_DIR/" \
  "$BACKUP_DIR/$DATE/"

# Update 'latest' symlink
ln -sfn "$DATE" "$BACKUP_DIR/latest"

echo "✅ Uploads backup completed: $BACKUP_DIR/$DATE"

# Cleanup old backups
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +90 -exec rm -rf {} \;
```

---

## 🔄 Restore Procedures

### 1. SQLite Restore

```bash
#!/bin/bash
# scripts/restore-sqlite.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.gz>"
  exit 1
fi

# Stop application
systemctl stop erp-backend

# Backup current database
mv ./data/production.sqlite3 ./data/production.sqlite3.backup

# Restore from backup
gunzip -c "$BACKUP_FILE" > ./data/production.sqlite3

# Verify integrity
sqlite3 ./data/production.sqlite3 "PRAGMA integrity_check;"

# Start application
systemctl start erp-backend

echo "✅ SQLite restored from $BACKUP_FILE"
```

### 2. PostgreSQL Restore

**Full Restore**:

```bash
#!/bin/bash
# scripts/restore-postgresql.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.gz>"
  exit 1
fi

# Stop application
systemctl stop erp-backend

# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS erp_steinmetz;"
psql -U postgres -c "CREATE DATABASE erp_steinmetz OWNER erp_user;"

# Restore from backup
pg_restore \
  -h localhost \
  -U erp_user \
  -d erp_steinmetz \
  -v \
  "$BACKUP_FILE"

# Start application
systemctl start erp-backend

echo "✅ PostgreSQL restored from $BACKUP_FILE"
```

**Point-in-Time Recovery (PITR)**:

```bash
# 1. Stop PostgreSQL
systemctl stop postgresql

# 2. Remove current data directory
rm -rf /var/lib/postgresql/14/main

# 3. Restore base backup
tar -xzf /var/backups/postgresql/base_backup.tar.gz -C /var/lib/postgresql/14/

# 4. Create recovery.conf
cat > /var/lib/postgresql/14/main/recovery.conf << EOF
restore_command = 'cp /var/backups/postgresql/wal/%f %p'
recovery_target_time = '2024-12-14 10:30:00'
EOF

# 5. Start PostgreSQL (will enter recovery mode)
systemctl start postgresql

# 6. Wait for recovery to complete
# PostgreSQL will automatically promote when recovery is done
```

### 3. Redis Restore

```bash
#!/bin/bash
# scripts/restore-redis.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <dump_file.gz>"
  exit 1
fi

# Stop Redis
systemctl stop redis

# Restore RDB file
gunzip -c "$BACKUP_FILE" > /var/lib/redis/dump.rdb

# Set correct permissions
chown redis:redis /var/lib/redis/dump.rdb

# Start Redis
systemctl start redis

echo "✅ Redis restored from $BACKUP_FILE"
```

---

## 🔄 Automated Backup Schedule

### Cron Configuration

```bash
# /etc/cron.d/erp-backup

# SQLite/PostgreSQL Backup (2:00 AM daily)
0 2 * * * root /home/erp-steinmetz/scripts/backup-postgresql.sh >> /var/log/erp-backup.log 2>&1

# Redis Backup (3:00 AM daily)
0 3 * * * root /home/erp-steinmetz/scripts/backup-redis.sh >> /var/log/erp-backup.log 2>&1

# Config Backup (4:00 AM daily)
0 4 * * * root /home/erp-steinmetz/scripts/backup-config.sh >> /var/log/erp-backup.log 2>&1

# Uploads Backup (5:00 AM daily)
0 5 * * * root /home/erp-steinmetz/scripts/backup-uploads.sh >> /var/log/erp-backup.log 2>&1

# Weekly integrity check (Sunday 6:00 AM)
0 6 * * 0 root /home/erp-steinmetz/scripts/verify-backups.sh >> /var/log/erp-backup.log 2>&1
```

### Systemd Timer (Alternative)

```ini
# /etc/systemd/system/erp-backup.timer
[Unit]
Description=ERP SteinmetZ Daily Backup Timer

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

```ini
# /etc/systemd/system/erp-backup.service
[Unit]
Description=ERP SteinmetZ Backup Service

[Service]
Type=oneshot
ExecStart=/home/erp-steinmetz/scripts/backup-all.sh
User=root
StandardOutput=journal
StandardError=journal
```

---

## 🔍 Backup Verification

### Automated Verification Script

```bash
#!/bin/bash
# scripts/verify-backups.sh

set -e

BACKUP_DIR="/var/backups/erp-steinmetz"
LOG_FILE="/var/log/erp-backup-verify.log"
ERRORS=0

echo "=== Backup Verification $(date) ===" >> "$LOG_FILE"

# 1. Verify SQLite Backup
LATEST_SQLITE=$(ls -t $BACKUP_DIR/sqlite/backup_*.sqlite3.gz | head -1)
if [ -f "$LATEST_SQLITE" ]; then
  gunzip -c "$LATEST_SQLITE" | sqlite3 -readonly :memory: "PRAGMA integrity_check;" >> "$LOG_FILE" 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ SQLite backup verified: $LATEST_SQLITE" >> "$LOG_FILE"
  else
    echo "❌ SQLite backup verification failed" >> "$LOG_FILE"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "⚠️  No SQLite backup found" >> "$LOG_FILE"
  ERRORS=$((ERRORS + 1))
fi

# 2. Verify PostgreSQL Backup
LATEST_PG=$(ls -t $BACKUP_DIR/postgresql/full_backup_*.sql.gz | head -1)
if [ -f "$LATEST_PG" ]; then
  pg_restore --list "$LATEST_PG" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL backup verified: $LATEST_PG" >> "$LOG_FILE"
  else
    echo "❌ PostgreSQL backup verification failed" >> "$LOG_FILE"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "⚠️  No PostgreSQL backup found" >> "$LOG_FILE"
  ERRORS=$((ERRORS + 1))
fi

# 3. Verify Redis Backup
LATEST_REDIS=$(ls -t $BACKUP_DIR/redis/dump_*.rdb.gz | head -1)
if [ -f "$LATEST_REDIS" ]; then
  echo "✅ Redis backup exists: $LATEST_REDIS" >> "$LOG_FILE"
else
  echo "⚠️  No Redis backup found" >> "$LOG_FILE"
  ERRORS=$((ERRORS + 1))
fi

# 4. Send alert if errors found
if [ $ERRORS -gt 0 ]; then
  echo "❌ Backup verification found $ERRORS errors" >> "$LOG_FILE"
  # Send alert (e.g., email, Slack, PagerDuty)
  # mail -s "ERP Backup Verification Failed" admin@example.com < "$LOG_FILE"
  exit 1
else
  echo "✅ All backups verified successfully" >> "$LOG_FILE"
fi
```

---

## 📊 Monitoring & Alerting

### Prometheus Metrics

```typescript
// apps/backend/src/services/monitoring/backupMetrics.ts
import { Gauge, Counter } from "prom-client";

export const backupLastSuccess = new Gauge({
  name: "backup_last_success_timestamp_seconds",
  help: "Timestamp of last successful backup",
  labelNames: ["type"], // sqlite, postgresql, redis, uploads
});

export const backupDuration = new Gauge({
  name: "backup_duration_seconds",
  help: "Duration of last backup",
  labelNames: ["type"],
});

export const backupSize = new Gauge({
  name: "backup_size_bytes",
  help: "Size of last backup",
  labelNames: ["type"],
});

export const backupFailures = new Counter({
  name: "backup_failures_total",
  help: "Total number of backup failures",
  labelNames: ["type"],
});
```

### Grafana Dashboard

```json
{
  "title": "ERP Backups",
  "panels": [
    {
      "title": "Last Successful Backup",
      "targets": [
        {
          "expr": "time() - backup_last_success_timestamp_seconds"
        }
      ]
    },
    {
      "title": "Backup Size Trend",
      "targets": [
        {
          "expr": "backup_size_bytes"
        }
      ]
    },
    {
      "title": "Backup Failure Rate",
      "targets": [
        {
          "expr": "rate(backup_failures_total[24h])"
        }
      ]
    }
  ]
}
```

### Alerts

```yaml
# prometheus/alert-rules.yml
groups:
  - name: backup_alerts
    rules:
      - alert: BackupTooOld
        expr: time() - backup_last_success_timestamp_seconds > 86400
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "Backup not performed in last 24 hours"
          description: "Last backup for {{ $labels.type }} was {{ $value | humanizeDuration }} ago"

      - alert: BackupFailing
        expr: rate(backup_failures_total[1h]) > 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Backup failures detected"
          description: "Backup type {{ $labels.type }} is failing"
```

---

## 🔐 Security

### Backup Encryption

```bash
# Encrypt backup with GPG
gpg --encrypt --recipient admin@example.com backup.sql.gz

# Decrypt backup
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

### Access Control

```bash
# Set restrictive permissions
chmod 600 /var/backups/erp-steinmetz/*
chown root:root /var/backups/erp-steinmetz/*

# Backup scripts
chmod 700 /home/erp-steinmetz/scripts/backup-*.sh
```

### Off-site Backup

```bash
# Sync to remote server (rsync over SSH)
rsync -avz -e "ssh -i /root/.ssh/backup_key" \
  /var/backups/erp-steinmetz/ \
  backup-server:/backups/erp-steinmetz/

# Or use cloud storage (S3, Azure Blob)
aws s3 sync /var/backups/erp-steinmetz/ s3://erp-backups/
```

---

## 📚 Verwandte Dokumente

- [Database Migrations](./DATABASE_MIGRATIONS.md)
- [Database Optimization](./DATABASE_OPTIMIZATION.md)
- [Monitoring](./MONITORING.md)
- [Security](../SECURITY.md)

---

**Letzte Aktualisierung**: Dezember 2024  
**Maintainer**: Thomas Heisig  
**Nächster Review**: März 2025
