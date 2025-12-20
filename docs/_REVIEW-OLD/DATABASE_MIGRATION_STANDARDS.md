# Database Migration Standards

## Übersicht

Dieses Dokument definiert verbindliche Standards für Datenbank-Migrationen im ERP SteinmetZ-Projekt, um zukünftige SQL-Dialekt-Probleme und Inkonsistenzen zu vermeiden.

**Letzte Aktualisierung:** 2025-12-20  
**Status:** ✅ Aktiv  
**Gilt für:** Alle neuen und bestehenden Migrationen

---

## 1. Migration-Ordner-Struktur

### Haupt-Migrations (AKTIV)
**Pfad:** `apps/backend/src/migrations/`

- ✅ **Produktiv genutzt** von `runMigrations.ts`
- ✅ Enthält alle aktuellen SQLite-Migrationen
- ✅ Wird automatisch beim Server-Start ausgeführt

### Legacy-Migrations (VERALTET)
**Pfad:** `apps/backend/data/migrations/`

- ⚠️ **Nicht mehr verwenden!**
- ⚠️ Enthält alte AI Annotator/Batch-Operationen-Migrations
- ⚠️ Wird NICHT automatisch ausgeführt
- 📌 **Empfehlung:** Relevante Migrations nach `src/migrations/` migrieren oder Ordner löschen

### Regel #1: Ein Migrations-Ordner
> **Alle neuen Migrationen MÜSSEN in `apps/backend/src/migrations/` erstellt werden.**

---

## 2. Dateibenennungs-Konvention

### Nummerierungs-Schema (OBLIGATORISCH)

```
<prefix>_<beschreibender_name>.sql

Prefixe:
  001-009   = Core-System (Auth, RBAC, Settings)
  010-049   = Tabellen-Erstellung (alle Module)
  050-059   = Tabellen-Modifikationen (ALTER, ADD COLUMN)
  060-099   = Daten-Population (Seed, Extend)
  100-199   = Erweiterte Einstellungen/Konfiguration
  200-299   = Feature-Migrations
  900-999   = Hotfixes/Notfall-Migrations
```

### Beispiele

✅ **KORREKT:**
```
001_create_auth_tables.sql
002_rbac_system.sql
010_create_hr_tables.sql
050_add_employee_status.sql
060_seed_default_roles.sql
100_add_extended_settings.sql
```

❌ **FALSCH:**
```
create_auth_tables.sql          # Fehlt Prefix
003_rbac_system.sql             # Falsche Kategorie (sollte 002 sein)
add_extended_settings.sql       # Fehlt Prefix
999_create_hr_tables.sql        # Falsche Kategorie
```

### Regel #2: Migrations-Reihenfolge
> **Nutzen Sie numerische Prefixe, um die Ausführungsreihenfolge zu steuern.**  
> Die Dateien werden **alphabetisch** sortiert und ausgeführt.

---

## 3. SQL-Dialekt-Standards

### 3.1 Primäre Datenbank: SQLite

**Das Projekt verwendet SQLite als primäre Datenbank.**

Alle Migrationen MÜSSEN SQLite-kompatibel sein:

#### ✅ Erlaubte SQLite-Syntax

```sql
-- Tabellen erstellen
CREATE TABLE IF NOT EXISTS tablename (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_name ON tablename(column);

-- Daten einfügen (idempotent)
INSERT OR IGNORE INTO tablename (id, name) VALUES ('1', 'Test');

-- Einfache Foreign Keys
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- Constraints
CHECK (status IN ('active', 'inactive'))
```

#### ❌ VERBOTENE Syntax (MS SQL Server)

```sql
-- ❌ MS SQL Server-spezifische Konstrukte
IF NOT EXISTS (SELECT * FROM sys.objects WHERE ...)
BEGIN
  CREATE TABLE ...
END
GO

-- ❌ Datentypen
NVARCHAR(255)           → TEXT
BIT                     → INTEGER
DATETIME2               → TEXT
INT                     → INTEGER
UNIQUEIDENTIFIER        → TEXT

-- ❌ Funktionen
GETDATE()               → CURRENT_TIMESTAMP
NEWID()                 → lower(hex(randomblob(16)))
ISNULL(x, y)            → COALESCE(x, y)

-- ❌ T-SQL Konstrukte
FROM (VALUES ...) AS Source
EXEC sp_...
```

### 3.2 Typ-Mapping Tabelle

| MS SQL Server | SQLite | Beschreibung |
|--------------|--------|--------------|
| `NVARCHAR(n)` | `TEXT` | Zeichenketten |
| `VARCHAR(n)` | `TEXT` | Zeichenketten |
| `CHAR(n)` | `TEXT` | Zeichenketten |
| `BIT` | `INTEGER` | Boolean (0/1) |
| `INT` | `INTEGER` | Ganzzahlen |
| `BIGINT` | `INTEGER` | Große Ganzzahlen |
| `DECIMAL(p,s)` | `REAL` oder `TEXT` | Dezimalzahlen |
| `MONEY` | `REAL` | Währungsbeträge |
| `DATETIME` | `TEXT` | ISO 8601 Format |
| `DATETIME2` | `TEXT` | ISO 8601 Format |
| `DATE` | `TEXT` | ISO 8601 Format |
| `UNIQUEIDENTIFIER` | `TEXT` | UUIDs als Text |

### 3.3 Funktions-Mapping

| MS SQL Server | SQLite | Anmerkungen |
|--------------|--------|-------------|
| `GETDATE()` | `CURRENT_TIMESTAMP` | Aktuelle Zeit |
| `NEWID()` | `lower(hex(randomblob(16)))` | UUID-Generierung |
| `ISNULL(a, b)` | `COALESCE(a, b)` | NULL-Behandlung |
| `LEN(s)` | `LENGTH(s)` | String-Länge |
| `CHARINDEX(x, s)` | `INSTR(s, x)` | String-Suche |

### Regel #3: SQLite First
> **Alle Migrationen MÜSSEN zuerst für SQLite geschrieben werden.**  
> Bei späterer MSSQL-Unterstützung: Separate `*_mssql.sql` Dateien erstellen.

---

## 4. Migration-Struktur

### 4.1 Datei-Header (OBLIGATORISCH)

Jede Migration MUSS mit diesem Header beginnen:

```sql
-- SPDX-License-Identifier: MIT
-- Migration: <Kurzbeschreibung>
-- Description: <Detaillierte Beschreibung>
-- Database: SQLite
-- Created: YYYY-MM-DD
-- Author: <Optional>

-- =============================================================================
-- <SEKTION NAME>
-- =============================================================================
```

### 4.2 Idempotenz

**Alle Migrationen MÜSSEN idempotent sein** (mehrfach ausführbar ohne Fehler):

```sql
-- ✅ KORREKT: Idempotent
CREATE TABLE IF NOT EXISTS users (...);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
INSERT OR IGNORE INTO roles (id, name) VALUES ('admin', 'Administrator');

-- ❌ FALSCH: Nicht idempotent
CREATE TABLE users (...);           -- Fehler beim 2. Lauf
INSERT INTO roles VALUES (...);     -- Dupliziert Daten
```

### 4.3 Transaktionen

Einzelne Statements werden automatisch von `runMigrations.ts` in Transaktionen ausgeführt.

```sql
-- ✅ KORREKT: Kein manuelles Transaction Management
CREATE TABLE IF NOT EXISTS orders (...);
CREATE TABLE IF NOT EXISTS order_items (...);

-- ❌ FALSCH: Manuelle Transaktionen vermeiden
BEGIN TRANSACTION;
CREATE TABLE orders (...);
COMMIT;
```

### Regel #4: Idempotenz und Transaktionen
> **Migrations müssen mehrfach ausführbar sein.**  
> **Keine manuellen BEGIN/COMMIT Statements verwenden.**

---

## 5. Abhängigkeits-Management

### 5.1 Tabellen-Abhängigkeiten

Beachten Sie die Reihenfolge bei Foreign Keys:

```sql
-- ✅ KORREKT: Übergeordnete Tabelle zuerst
-- 001_create_auth_tables.sql
CREATE TABLE IF NOT EXISTS users (...);

-- 002_rbac_system.sql
CREATE TABLE IF NOT EXISTS roles (...);
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### 5.2 SQLite Foreign Key Limitierungen

**WICHTIG:** SQLite unterstützt **KEIN** `ALTER TABLE ADD CONSTRAINT FOREIGN KEY`.

```sql
-- ❌ NICHT MÖGLICH in SQLite:
ALTER TABLE user_roles 
ADD CONSTRAINT fk_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- ✅ LÖSUNG 1: Foreign Key in CREATE TABLE
CREATE TABLE user_roles (
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ✅ LÖSUNG 2: Kommentar für spätere Datenbank
CREATE TABLE user_roles (
  user_id TEXT NOT NULL
  -- FOREIGN KEY added later in 002_rbac_system.sql
);
```

### 5.3 Datei-Abhängigkeiten

Dokumentieren Sie Abhängigkeiten in Kommentaren:

```sql
-- SPDX-License-Identifier: MIT
-- Migration: HR Employee Tables
-- Dependencies: 
--   - 001_create_auth_tables.sql (users)
--   - 002_rbac_system.sql (roles)
-- Creates: hr_employees, hr_contracts, hr_departments

CREATE TABLE IF NOT EXISTS hr_employees (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Regel #5: Abhängigkeiten dokumentieren
> **Dokumentieren Sie alle Tabellen-Abhängigkeiten.**  
> **Foreign Keys nur in CREATE TABLE, nicht via ALTER TABLE.**

---

## 6. Daten-Migrations (Seed Data)

### 6.1 Seed-Strategie

```sql
-- 060_seed_default_roles.sql

-- System-Rollen (MUSS existieren)
INSERT OR IGNORE INTO roles (id, name, is_system) 
VALUES ('super_admin', 'Super Administrator', 1);

INSERT OR IGNORE INTO roles (id, name, is_system) 
VALUES ('admin', 'Administrator', 1);

-- Test-Daten (Optional, nur in DEV)
-- Wird durch environment variable gesteuert
```

### 6.2 Große Datenmengen

Für große Datenmengen (>100 Zeilen):

```sql
-- ✅ KORREKT: Einzelne INSERT OR IGNORE Statements
INSERT OR IGNORE INTO system_settings (key, value, category) 
VALUES ('setting_1', 'value_1', 'system');

INSERT OR IGNORE INTO system_settings (key, value, category) 
VALUES ('setting_2', 'value_2', 'system');

-- ❌ FALSCH: T-SQL VALUES Syntax
INSERT INTO system_settings (key, value, category)
SELECT * FROM (VALUES 
  ('setting_1', 'value_1', 'system'),
  ('setting_2', 'value_2', 'system')
) AS Source;
```

### Regel #6: Seed-Daten Standards
> **Verwenden Sie `INSERT OR IGNORE` für idempotente Daten-Inserts.**  
> **Keine T-SQL-spezifischen VALUES-Konstrukte verwenden.**

---

## 7. Qualitätssicherung

### 7.1 Pre-Commit Checklist

Vor jedem Commit einer neuen Migration:

- [ ] Dateiname folgt Benennungskonvention (`<prefix>_name.sql`)
- [ ] Header mit SPDX, Beschreibung und Datum vorhanden
- [ ] Nur SQLite-kompatible Syntax verwendet
- [ ] Alle CREATE TABLE haben `IF NOT EXISTS`
- [ ] Alle INSERT verwenden `OR IGNORE`
- [ ] Keine `BEGIN`/`END`/`GO` Statements
- [ ] Foreign Keys in CREATE TABLE definiert
- [ ] Abhängigkeiten dokumentiert
- [ ] Lokal getestet (fresh database)

### 7.2 Testing

```bash
# Test 1: Fresh Database Migration
rm -f data/dev.sqlite3*
npm run dev  # Migrations laufen automatisch

# Test 2: Idempotenz Test (mehrfach ausführen)
npm run migration:run  # 1. Lauf
npm run migration:run  # 2. Lauf - sollte "already executed" zeigen

# Test 3: Syntax Validation (optional)
sqlite3 data/dev.sqlite3 < apps/backend/src/migrations/010_create_hr_tables.sql
```

### 7.3 CI/CD Integration

**TODO:** GitHub Actions Workflow für automatisches Testing:

```yaml
# .github/workflows/migrations.yml
name: Test Migrations
on: [pull_request]
jobs:
  test-migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Test migrations (fresh)
        run: |
          rm -f data/dev.sqlite3*
          npm run dev &
          sleep 5
          pkill node
      - name: Test migrations (idempotent)
        run: npm run migration:run
```

### Regel #7: Testing vor Deployment
> **Alle Migrationen MÜSSEN lokal getestet werden.**  
> **Idempotenz-Test ist OBLIGATORISCH.**

---

## 8. Multi-Database Support (Zukunft)

### 8.1 Strategie

Wenn MSSQL-Unterstützung hinzugefügt wird:

**Option 1: Separate Dateien (EMPFOHLEN)**
```
src/migrations/
  010_create_hr_tables.sql         # SQLite (Standard)
  010_create_hr_tables_mssql.sql   # MS SQL Server
```

**Option 2: Conditional Migrations**
```typescript
// runMigrations.ts
const driver = process.env.DB_DRIVER || 'sqlite';
const migrations = files.filter(f => {
  if (driver === 'sqlite' && f.includes('_mssql')) return false;
  if (driver === 'mssql' && !f.includes('_mssql') && hasDialectVersion(f)) return false;
  return true;
});
```

### 8.2 Abstraction Layer (Zukunft)

**TODO:** ORM/Query Builder evaluieren:

- **Prisma** - Typ-sichere Migrations
- **Knex.js** - Migrations mit JavaScript
- **TypeORM** - Decorator-basierte Migrations

Vorteile:
- ✅ Automatische SQL-Dialekt-Konvertierung
- ✅ Type-Safety
- ✅ Einfachere Rollbacks

Nachteile:
- ⚠️ Lernkurve
- ⚠️ Abstraktion kann Kontrolle verringern
- ⚠️ Migration von bestehendem SQL-Code

### Regel #8: SQLite First, MSSQL Optional
> **SQLite bleibt primäre Datenbank.**  
> **MSSQL-Support nur via separate `*_mssql.sql` Dateien.**

---

## 9. Fehlerbehandlung

### 9.1 Häufige Fehler

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| `near 'IF': syntax error` | IF NOT EXISTS Block | Umschreiben zu `CREATE TABLE IF NOT EXISTS` |
| `near 'CREATE': syntax error` | Doppelte CREATE TABLE | Duplikat entfernen |
| `no such table: X` | Falsche Ausführungsreihenfolge | Numerischen Prefix anpassen |
| `near '(': syntax error` | T-SQL VALUES Syntax | Zu einzelnen INSERT OR IGNORE umschreiben |
| `FOREIGN KEY constraint failed` | Tabelle existiert nicht | Abhängigkeits-Reihenfolge prüfen |
| `table already exists` | Fehlendes IF NOT EXISTS | IF NOT EXISTS hinzufügen |

### 9.2 Debugging

```bash
# SQLite-Syntax prüfen
sqlite3 -batch data/dev.sqlite3 < migration.sql

# Migrations-Log anzeigen
sqlite3 data/dev.sqlite3 "SELECT * FROM database_migrations ORDER BY executed_at DESC LIMIT 10"

# Tabellen-Schema anzeigen
sqlite3 data/dev.sqlite3 ".schema users"

# Letzte Migration zurücksetzen (VORSICHT!)
sqlite3 data/dev.sqlite3 "DELETE FROM database_migrations WHERE name = '010_create_hr_tables.sql'"
```

### Regel #9: Fehler dokumentieren
> **Neue Fehlertypen in dieses Dokument aufnehmen.**  
> **Lösungen für häufige Probleme dokumentieren.**

---

## 10. Copilot/AI-Assistenten Regeln

### 10.1 Prompt für Migration-Erstellung

Beim Erstellen neuer Migrationen mit Copilot/AI:

```
Erstelle eine SQLite-Migration für [Beschreibung].

WICHTIG - Befolge diese Regeln:
1. Nur SQLite-kompatible Syntax (TEXT statt NVARCHAR, INTEGER statt BIT)
2. CREATE TABLE IF NOT EXISTS verwenden
3. INSERT OR IGNORE für Daten
4. CURRENT_TIMESTAMP statt GETDATE()
5. Dateiname: <prefix>_beschreibung.sql mit korrektem Prefix
6. SPDX-Header und Beschreibung hinzufügen
7. Keine BEGIN/END/GO Statements
8. Foreign Keys in CREATE TABLE definieren
9. Abhängigkeiten in Kommentaren dokumentieren

Siehe: docs/DATABASE_MIGRATION_STANDARDS.md
```

### 10.2 Copilot Instructions (.github/copilot-instructions.md)

```markdown
## Database Migrations

When creating database migrations:
- Use SQLite syntax ONLY (TEXT, INTEGER, CURRENT_TIMESTAMP)
- File naming: `<prefix>_description.sql` (001-009 core, 010-049 tables, 050-059 alters, 060-099 seeds)
- Always use: CREATE TABLE IF NOT EXISTS, INSERT OR IGNORE
- Never use: NVARCHAR, BIT, GETDATE(), BEGIN/END, GO
- Include SPDX header and description
- Document dependencies in comments
- See docs/DATABASE_MIGRATION_STANDARDS.md for full standards
```

### Regel #10: AI-Guidelines
> **Copilot/AI MUSS nach diesen Standards generieren.**  
> **Migrations-Standards in `.github/copilot-instructions.md` referenzieren.**

---

## 11. Rollback-Strategie

### 11.1 Philosophie

SQLite-Migrations sind **forward-only** (kein automatischer Rollback).

Für kritische Änderungen:

**Option 1: Neue Migration erstellen**
```sql
-- 900_rollback_hr_department_changes.sql
DROP TABLE IF EXISTS hr_departments_new;
ALTER TABLE hr_departments_old RENAME TO hr_departments;
```

**Option 2: Datenbank-Backup/Restore**
```bash
# Vor riskanter Migration
cp data/dev.sqlite3 data/dev.sqlite3.backup.$(date +%Y%m%d_%H%M%S)

# Restore bei Fehler
cp data/dev.sqlite3.backup.20251220_143000 data/dev.sqlite3
```

### 11.2 Backup-Strategie

**Automatisches Backup vor Migrations:**

```typescript
// TODO: Implementieren in runMigrations.ts
async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `data/backups/dev.sqlite3.${timestamp}`;
  await fs.copyFile('data/dev.sqlite3', backupPath);
  logger.info({ backupPath }, 'Database backed up before migrations');
}
```

### Regel #11: Backup vor kritischen Migrations
> **Erstellen Sie Backups vor strukturellen Änderungen.**  
> **Verwenden Sie neue Migrations für Rollbacks.**

---

## 12. Change Log

| Datum | Version | Änderung | Autor |
|-------|---------|----------|-------|
| 2025-12-20 | 1.0 | Initiale Version nach SQL-Dialekt-Konvertierung | GitHub Copilot |

---

## Anhang A: Konvertierungs-Beispiele

### Beispiel 1: Tabellen-Erstellung

**Vorher (MS SQL Server):**
```sql
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]'))
BEGIN
  CREATE TABLE [dbo].[users] (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    username NVARCHAR(255) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
  );
END
GO
```

**Nachher (SQLite):**
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  username TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Beispiel 2: Daten-Insert

**Vorher (MS SQL Server T-SQL):**
```sql
IF NOT EXISTS (SELECT 1 FROM roles WHERE id = 'admin')
BEGIN
  INSERT INTO roles (id, name) VALUES ('admin', 'Administrator');
END
```

**Nachher (SQLite):**
```sql
INSERT OR IGNORE INTO roles (id, name) VALUES ('admin', 'Administrator');
```

### Beispiel 3: Seed Data mit VALUES

**Vorher (T-SQL):**
```sql
INSERT INTO system_settings (key, value, category)
SELECT * FROM (VALUES 
  ('setting_1', 'value_1', 'system'),
  ('setting_2', 'value_2', 'system')
) AS Source (key, value, category)
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = Source.key);
```

**Nachher (SQLite):**
```sql
INSERT OR IGNORE INTO system_settings (key, value, category) 
VALUES ('setting_1', 'value_1', 'system');

INSERT OR IGNORE INTO system_settings (key, value, category) 
VALUES ('setting_2', 'value_2', 'system');
```

---

## Anhang B: Nützliche Tools

- **SQLite Browser:** GUI für SQLite-Datenbanken (https://sqlitebrowser.org/)
- **sqlite3 CLI:** Kommandozeilen-Tool für SQLite
- **VS Code Extension:** SQLite Viewer (alexcvzz.vscode-sqlite)
- **Migration Linter:** TODO - Custom tool für Syntax-Validierung

---

## Ressourcen

- SQLite Dokumentation: https://www.sqlite.org/docs.html
- SQLite SQL Syntax: https://www.sqlite.org/lang.html
- SQLite vs MSSQL: https://www.sqlite.org/different.html
- Projekt README: [../README.md](../README.md)
- Backend Architektur: [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Ende des Dokuments**
