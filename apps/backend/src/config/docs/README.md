# Configuration Module

Zentralisierte Konfigurationsverwaltung für das ERP SteinmetZ System mit Umgebungsvariablen-Validierung und RBAC-Systemkonfiguration.

## Überblick

Das Config-Modul bietet:

✅ **Typ-sichere Validierung** - Zod-basierte Umgebungsvariablen-Validierung  
✅ **Strukturiertes Logging** - Pino Logger mit verschiedenen Log-Leveln  
✅ **AI-Provider-Unterstützung** - OpenAI, Anthropic, Azure, Ollama, Local  
✅ **RBAC-System** - 5-stufige Rollenhierarchie mit modulbasierenden Permissions  
✅ **Produktions-Checks** - JWT-Validierung, CORS-Sicherheit, Datenbank-Verifizierung  
✅ **Umfangreiche Tests** - 28 Tests zur vollständigen Validierung  

## Dateistruktur

```tree
config/
├── env.ts              # Umgebungsvariablen-Validierung
├── env.test.ts         # Tests für Umgebungsvariablen
├── rbac.ts             # RBAC-Konfiguration & Rollendefinitionen
├── README.md           # Diese Datei
└── docs/               # Leer (für zukünftige Dokumentation)
```

## Hauptdateien

### env.ts

Umgebungsvariablen-Validierung und -Management mit Zod.

**Hauptfunktionen:**

- `validateEnv()` - Validiert und parst Umgebungsvariablen
- `getEnv()` - Gibt gecachte, validierte Konfiguration zurück
- `validateProviderConfig()` - Validiert AI-Provider-spezifische Konfiguration
- `validateProductionConfig()` - Produktions-Sicherheitschecks
- `validateEnvironment()` - Einstiegspunkt für komplette Validierung

**Validierte Variablen:**

- **Server:** PORT, NODE_ENV, CORS_ORIGIN
- **Datenbank:** DB_DRIVER, SQLITE_FILE, DATABASE_URL
- **AI-Provider:** AI_PROVIDER, OPENAI_API_KEY, ANTHROPIC_API_KEY, AZURE_*, OLLAMA_*, LOCAL_*
- **Sicherheit:** JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN
- **Logging:** LOG_LEVEL, LOG_REQUESTS
- **Limits:** MAX_FILE_UPLOAD_SIZE, MAX_BATCH_OPERATION_SIZE

### env.test.ts

Umfangreiche Tests für Umgebungsvariablen-Validierung.

**Test-Kategorien:**

- **AI Provider Validation** (8 Tests)
  - OpenAI, Anthropic, Azure, Ollama, Local, None
  - Erforderliche Keys und Konfiguration

- **Database Configuration Validation** (4 Tests)
  - SQLite und PostgreSQL Setup
  - Verbindungsstring-Validierung

- **JWT Secret Validation** (5 Tests)
  - Längen-Anforderungen (32+ Zeichen)
  - Schwache/Standard-Secrets erkennen
  - Strong Secret Validierung

- **CORS Configuration** (4 Tests)
  - Wildcard-Warnung
  - Localhost-Warnung in Production
  - Korrekte Domain-Validierung

- **Production Settings** (7 Tests)
  - Development vs Production Unterschiede
  - Datenbank-Konfiguration für Production
  - Provider-Validierung

**Tests ausführen:**

```bash
# Alle Config-Tests
npm run test -- env.test.ts

# Spezifische Test-Suite
npm run test -- env.test.ts -t "JWT Secret"

# Mit Coverage
npm run test -- env.test.ts --coverage
```

### rbac.ts

Role-Based Access Control (RBAC) Konfiguration und Rollendefinitionen.

**Rollenhierarchie:**

```text
SUPER_ADMIN (Level 0) → ADMIN (Level 1) → MANAGER (Level 2) → USER (Level 3) → GUEST (Level 4)
```

**Hauptkomponenten:**

- `buildPermission()` - Hilfsfunktion zur Permission-Erstellung
- `DEFAULT_ROLES` - Vordefinierte Systemrollen
- `ROLE_HIERARCHY` - Rollenhierarchie und Privilege-Levels
- `MODULE_PERMISSIONS_CONFIG` - Modul-spezifische Permissions

**Verfügbare Module:**

- `hr` - Human Resources
- `finance` - Finanz-Management
- `crm` - Customer Relationship Management
- `dashboard` - Dashboard & Übersichten
- `calendar` - Terminverwaltung
- `communication` - Kommunikation
- `documents` - Dokumentenverwaltung

**Rollen und Berechtigungen:**

```typescript
// SUPER_ADMIN - Vollständiger Zugriff
{
  id: 'super_admin',
  name: 'Super Administrator',
  permissions: ['hr:*', 'finance:*', 'crm:*', ...]
}

// ADMIN - Administrative Funktionen
{
  id: 'admin',
  name: 'Administrator',
  permissions: ['hr:read', 'hr:create', 'finance:read', ...]
}

// MANAGER - Team-Management
{
  id: 'manager',
  name: 'Manager',
  permissions: ['hr:read', 'crm:read', 'crm:create', ...]
}

// USER - Standard-Zugriff
{
  id: 'user',
  name: 'User',
  permissions: ['hr:read', 'crm:read', 'crm:create', ...]
}

// GUEST - Nur-Lese-Zugriff
{
  id: 'guest',
  name: 'Guest',
  permissions: ['dashboard:read', 'calendar:read']
}
```

## Verwendung

### Umgebungsvariablen laden

```typescript
import { getEnv } from '@/config/env';

// Am Server-Start
const env = getEnv();

// Verwenden
const port = env.PORT;
const dbUrl = env.DATABASE_URL;
const aiProvider = env.AI_PROVIDER;
```

### RBAC verwenden

```typescript
import { DEFAULT_ROLES, ROLE_HIERARCHY } from '@/config/rbac';

// Benutzer-Rolle abrufen
const userRole = DEFAULT_ROLES.find(r => r.id === user.roleId);

// Permissions prüfen
const hasPermission = userRole?.permissions.includes('hr:read');

// Privilege-Level prüfen
const userLevel = ROLE_HIERARCHY.find(r => r.role === user.role)!.level;
const requiredLevel = ROLE_HIERARCHY.find(r => r.role === 'admin')!.level;
const hasAccess = userLevel <= requiredLevel;
```

## Umgebungsvariablen konfigurieren

### Development Setup

```bash
# .env.development.local
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

DB_DRIVER=sqlite
SQLITE_FILE=data/dev.sqlite3

AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b

LOG_LEVEL=debug
LOG_REQUESTS=1

JWT_SECRET=DevelopmentSecretKey32CharactersMinimum!@#
```

### Production Setup

```bash
# .env.production
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com

DB_DRIVER=postgresql
DATABASE_URL=postgresql://user:password@host:5432/db

AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview

LOG_LEVEL=info
LOG_REQUESTS=1

JWT_SECRET=<strong-random-32-char-minimum>
```

## Validierungs-Prozess

### 1. Schema-Validierung

Alle Umgebungsvariablen werden gegen Zod-Schema validiert:

```typescript
const envSchema = z.object({
  PORT: z.string().default('3000').transform(v => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  JWT_SECRET: z.string().min(32).optional(),
  // ...
});
```

### 2. Provider-Validierung

Abhängig vom `AI_PROVIDER` werden provider-spezifische Variablen validiert:

```typescript
if (env.AI_PROVIDER === 'openai') {
  // OPENAI_API_KEY muss gesetzt sein
  // OPENAI_MODEL muss gültig sein
}
```

### 3. Production-Validierung

Zusätzliche Sicherheitschecks für `NODE_ENV=production`:

```typescript
// JWT_SECRET Länge ≥ 32
// JWT_SECRET darf keine Standard-Werte enthalten
// CORS_ORIGIN darf nicht Localhost/Wildcard sein
// Datenbank muss PostgreSQL sein
```

## Fehlerbehebung

### JWT_SECRET Anforderungen nicht erfüllt

**Fehler:** `JWT_SECRET must be at least 32 characters`

**Lösung:**

```bash
# Sichere Secret generieren
openssl rand -base64 32

# Oder mit Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Anforderungen:**

- ✅ Mindestens 32 Zeichen
- ✅ Großbuchstaben, Kleinbuchstaben, Zahlen
- ✅ Keine Standard-Wörter wie "secret", "password"

### AI Provider nicht konfiguriert

**Fehler:** `OPENAI_API_KEY is required when AI_PROVIDER is set to 'openai'`

**Lösung:**

```bash
# API Key setzen
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Oder Provider auf "none" setzen, um AI zu deaktivieren
AI_PROVIDER=none
```

### Datenbank-Verbindung schlägt fehl

**Fehler:** `DATABASE_URL is required when DB_DRIVER is set to 'postgresql'`

**Lösung:**

```bash
# PostgreSQL Connection String
DATABASE_URL=postgresql://user:password@localhost:5432/erp_db

# Verbindung testen
psql postgresql://user:password@localhost:5432/erp_db -c "SELECT 1;"
```

## Best Practices

### Umgebungsvariablen

✅ **DO:**

- Nutze `.env.local` für lokale Entwicklung
- Verwende Secrets Manager für Production
- Dokumentiere alle Variablen in `.env.example`
- Validiere beim Server-Start
- Rotiere Secrets regelmäßig
- Nutze starke JWT Secrets (32+ Zeichen)

❌ **DON'T:**

- Committe `.env` Dateien
- Speichere Secrets im Code
- Nutze gleiche Secrets in Dev und Production
- Loge sensitive Daten
- Verwende schwache Secrets

### RBAC

✅ **DO:**

- Starte mit Least Privilege Prinzip
- Dokumentiere Permission-Anforderungen
- Teste Permissions vor Deployment
- Review Role-Assignments regelmäßig

❌ **DON'T:**

- Nutze SUPER_ADMIN für reguläre User
- Vergebe unnötige Permissions
- Hardcode Roles im Code
- Vertraue nur Client-side Roles

## Performance

### Umgebungsvariablen Caching

```typescript
// getEnv() cacht das Ergebnis nach dem ersten Aufruf
const env1 = getEnv(); // Validierung und Parsing
const env2 = getEnv(); // Gibt gecachtes Ergebnis zurück (schneller)
```

### Production Empfehlungen

- Log-Level auf `info` setzen (nicht `debug`)
- CORS_ORIGIN auf spezifische Domain setzen
- PostgreSQL statt SQLite verwenden
- JWT Secret regelmäßig rotieren
- Datenbank-Backups aktivieren

## Testing

```bash
# Alle Tests
npm run test

# Config-Tests
npm run test -- env.test.ts

# Mit Coverage
npm run test -- --coverage

# Watch Mode
npm run test -- --watch
```

## Verwandte Dokumentation

- [CONFIG_MODULE_GUIDE.md](../../docs/CONFIG_MODULE_GUIDE.md) - Ausführliche Dokumentation
- [ENVIRONMENT_VARIABLES.md](../../docs/ENVIRONMENT_VARIABLES.md) - Alle Umgebungsvariablen
- [RBAC_CONFIGURATION.md](../../docs/RBAC_CONFIGURATION.md) - RBAC-Details
- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - System-Architektur

## Version

- **Modul Version:** 1.0.0
- **Status:** ✅ Production Ready
- **Letzte Aktualisierung:** 2025-12-20
- **Teste abgedeckt:** 28 comprehensive tests
- **TypeScript Errors:** 0
