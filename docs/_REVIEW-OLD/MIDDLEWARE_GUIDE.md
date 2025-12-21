# Middleware Guide

Vollständige Dokumentation der Express Middleware für das ERP SteinmetZ Backend mit Best Practices und Integrationsleitfäden.

**Letzte Aktualisierung:** 2025-12-20  
**Status:** ✅ Production Ready  
**Modul Path:** `apps/backend/src/middleware/`

---

## Table of Contents

- [Überblick](#überblick)
- [Authentifizierung & Autorisierung](#authentifizierung--autorisierung)
- [Fehlerbehandlung](#fehlerbehandlung)
- [Rate Limiting](#rate-limiting)
- [Performance & Monitoring](#performance--monitoring)
- [Session Management](#session-management)
- [Caching](#caching)
- [Registrierung & Reihenfolge](#registrierung--reihenfolge)
- [Best Practices](#best-practices)
- [Testing](#testing)

---

## Überblick

Die Middleware-Komponente bietet 11 spezialisierte Express Middleware Module:

✅ **Authentifizierung** - JWT-Token Validierung und Benutzerkontexte  
✅ **Autorisierung** - RBAC und Permission-basierte Zugriffskontrolle  
✅ **Fehlerbehandlung** - Standardisierte Error-Responses und Logging  
✅ **Rate Limiting** - Konfigurierbare Limitierer für verschiedene Endpunkte  
✅ **Session Management** - Redis/SQLite persistente Sessions  
✅ **Caching** - HTTP-Response Caching mit TTL  
✅ **Monitoring** - Request-Metriken und Query-Performance  
✅ **Error Tracking** - Sentry Integration  
✅ **Async Handling** - Promise-Error Catching

### Dateistruktur

```text
middleware/
├── asyncHandler.ts              # Promise-Error Handling Wrapper
├── asyncHandler.test.ts         # Tests für asyncHandler
├── authMiddleware.ts            # JWT Auth & Permission Checks
├── cacheMiddleware.ts           # HTTP Response Caching
├── errorHandler.ts              # Global Error Handler
├── errorHandler.test.ts         # Tests für Error Handler
├── errorTrackingMiddleware.ts   # Sentry Integration
├── index.ts                     # Exports
├── metricsMiddleware.ts         # HTTP Request Metriken
├── queryMonitor.ts              # Database Query Monitoring
├── rateLimiters.ts              # Rate Limiting Konfigurationen
├── rbacMiddleware.ts            # Role-Based Access Control
├── sessionMiddleware.ts         # Session Management
├── docs/
│   └── README.md               # Original Dokumentation
└── README.md                   # Diese Datei
```

---

## Authentifizierung & Autorisierung

### authMiddleware.ts

Zentrale Authentifizierung und Autorisierung mit JWT-Token.

#### `authenticate()` - Erforderliche Authentifizierung

Validiert JWT-Token und wirft 401 Fehler wenn nicht vorhanden:

```typescript
import { authenticate } from "@/middleware/authMiddleware";
import { Router } from "express";

const router = Router();

// Geschützte Route - erfordert Token
router.get("/profile", authenticate, (req, res) => {
  const userId = req.auth?.userId;
  const userRole = req.auth?.role;
  res.json({ userId, userRole });
});

// POST mit Authentication
router.post("/users", authenticate, (req, res) => {
  // user muss authentifiziert sein
  const user = req.auth?.user;
  res.json({ user });
});
```

**Request-Format:**

```bash
# Token in Authorization Header
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/profile

# Token in Cookie
curl --cookie "authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/profile
```

**Auth-Kontext im Request:**

```typescript
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        user?: User;
        role?: string;
        permissions?: string[];
        token: string;
        expiresAt: number;
      };
    }
  }
}
```

#### `optionalAuthenticate()` - Optionale Authentifizierung

Validiert Token wenn vorhanden, erfordert ihn aber nicht:

```typescript
import { optionalAuthenticate } from "@/middleware/authMiddleware";

// Öffentliche Route mit optionaler Auth
router.get("/articles", optionalAuthenticate, (req, res) => {
  if (req.auth?.userId) {
    // User ist angemeldet - personalisierte Inhalte
    res.json({ articles: getPersonalArticles(req.auth.userId) });
  } else {
    // User ist anonym - öffentliche Inhalte
    res.json({ articles: getPublicArticles() });
  }
});
```

#### `requireRole()` - Rollenbasierte Kontrolle

Schränkt Zugriff auf spezifische Rollen ein:

```typescript
import { authenticate, requireRole } from "@/middleware/authMiddleware";

// Nur Admins dürfen Zugriff
router.delete(
  "/users/:id",
  authenticate,
  requireRole("admin"),
  deleteUserHandler,
);

// Nur Admins oder Manager
router.post(
  "/approvals",
  authenticate,
  requireRole("admin"), // oder requireRole('manager')
  approveHandler,
);
```

#### `requirePermission()` - Permission-basierte Kontrolle

Kontrolliert Zugriff auf Basis von Permissions im Format `modul:action`:

```typescript
import { authenticate, requirePermission } from "@/middleware/authMiddleware";

// Nutzer muss 'hr:read' Permission haben
router.get(
  "/employees",
  authenticate,
  requirePermission("hr:read"),
  listEmployeesHandler,
);

// Nutzer muss 'finance:create' Permission haben
router.post(
  "/invoices",
  authenticate,
  requirePermission("finance:create"),
  createInvoiceHandler,
);

// Nutzer muss 'crm:delete' Permission haben
router.delete(
  "/customers/:id",
  authenticate,
  requirePermission("crm:delete"),
  deleteCustomerHandler,
);
```

**Verfügbare Permissions:**

```text
hr:read          - HR Daten lesen
hr:create        - HR Datensätze erstellen
hr:update        - HR Datensätze ändern
hr:delete        - HR Datensätze löschen
hr:approve       - HR Anfragen genehmigen

finance:read     - Finanzdaten lesen
finance:create   - Transaktionen erstellen
finance:approve  - Transaktionen genehmigen
finance:report   - Berichte generieren

crm:read         - CRM Daten lesen
crm:create       - CRM Datensätze erstellen
crm:update       - CRM Datensätze ändern
crm:delete       - CRM Datensätze löschen

dashboard:read   - Dashboard anzeigen
dashboard:setup  - Dashboard konfigurieren

calendar:read    - Kalender anzeigen
calendar:create  - Termine erstellen
calendar:update  - Termine ändern
```

#### `rateLimitLogin()` - Login Rate Limiting

Schützt Login-Endpunkte vor Brute-Force Attacken:

```typescript
import { rateLimitLogin } from "@/middleware/authMiddleware";

router.post(
  "/auth/login",
  rateLimitLogin, // 5 Versuche pro 15 Minuten
  loginHandler,
);
```

### rbacMiddleware.ts

Erweiterte RBAC Funktionalität mit Rollen-Hierarchien:

```typescript
import {
  requireRole,
  requireAnyRole,
  requireAllRoles,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireModuleAccess,
  requirePermissionCheck,
} from "@/middleware/rbacMiddleware";

// Einzelne Rolle
router.delete(
  "/system/config",
  authenticate,
  requireRole("super_admin"),
  updateSystemHandler,
);

// Mehrere Rollen (ODER)
router.post(
  "/approvals",
  authenticate,
  requireAnyRole(["admin", "manager"]),
  approveHandler,
);

// Alle Rollen erforderlich (UND)
router.post(
  "/critical-action",
  authenticate,
  requireAllRoles(["admin", "auditor"]),
  criticalActionHandler,
);

// Modul-Zugriff
router.get(
  "/hr/reports",
  authenticate,
  requireModuleAccess("hr"),
  getReportsHandler,
);

// Benutzerdefinierte Permission-Check
router.get(
  "/users/:id",
  authenticate,
  requirePermissionCheck(async (req) => {
    return await canViewUser(req.auth?.userId, req.params.id);
  }),
  getUserHandler,
);
```

---

## Fehlerbehandlung

### errorHandler.ts

Globale Fehlerbehandlung mit standardisierten Responses.

#### Setup

```typescript
import express from "express";
import { errorHandler } from "@/middleware/errorHandler";

const app = express();

// ... alle Routes ...

// WICHTIG: errorHandler MUSS als letztes Middleware sein!
app.use(errorHandler);

app.listen(3000);
```

#### Error-Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Menschlich verständliche Fehlermeldung",
    "statusCode": 400,
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2025-12-20T14:30:00.000Z",
    "path": "/api/users",
    "requestId": "req-uuid-1234"
  }
}
```

#### Fehlertypen

```typescript
// APIError - Custom Anwendungsfehler
throw new BadRequestError('Invalid input', { field: 'email' });
// Status 400

throw new UnauthorizedError('Invalid token');
// Status 401

throw new ForbiddenError('Access denied');
// Status 403

throw new NotFoundError('User not found');
// Status 404

throw new ValidationError('Validation failed', { errors: [...] });
// Status 422

throw new ConflictError('User already exists');
// Status 409

// Standard JavaScript Error → 500
throw new Error('Unexpected error');
```

#### Custom Error Classes

```typescript
import { APIError, ErrorCode } from "@/utils/errors";

// Neuer Custom Error
class RateLimitError extends APIError {
  constructor(message = "Too many requests") {
    super(message, ErrorCode.TOO_MANY_REQUESTS, 429);
  }
}

throw new RateLimitError();
```

### asyncHandler.ts

Wrapper für Async Route Handler um Errors automatisch zu fangen:

```typescript
import { asyncHandler } from "@/middleware/asyncHandler";
import { Router } from "express";

const router = Router();

// ❌ FALSCH - Error wird nicht gefangen
router.get("/users", async (req, res) => {
  const users = await db.query("SELECT * FROM users");
  res.json(users);
});

// ✅ RICHTIG - asyncHandler fängt Errors
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await db.query("SELECT * FROM users");
    res.json(users);
  }),
);

// Mit Error Handling
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body);
    if (!user) {
      throw new ValidationError("User creation failed");
    }
    res.json({ success: true, user });
  }),
);
```

### errorTrackingMiddleware.ts

Sentry Integration für Fehler-Tracking:

```typescript
import { errorTrackingMiddleware } from "@/middleware/errorTrackingMiddleware";

// Nach allen Routes, VOR errorHandler
app.use(errorTrackingMiddleware);
app.use(errorHandler);

// Error wird zu Sentry gesendet mit:
// - User-Informationen
// - HTTP-Kontext (Method, URL, Status)
// - Headers, Query, Body (für Debugging)
```

---

## Rate Limiting

### rateLimiters.ts

Pre-konfigurierte Rate Limiter für verschiedene Endpunkt-Typen:

#### Allgemeine API (100 Requests / 15 Minuten)

```typescript
import { generalRateLimiter } from "@/middleware/rateLimiters";

// Allgemeine API Limiter
router.get("/api/data", generalRateLimiter, handler);
router.post("/api/data", generalRateLimiter, handler);
```

#### AI Endpoints (20 Requests / 15 Minuten)

```typescript
import { aiRateLimiter } from "@/middleware/rateLimiters";

// AI-basierte Endpoints
router.post("/api/ai/chat", aiRateLimiter, aiChatHandler);
router.post("/api/ai/translate", aiRateLimiter, translateHandler);
router.post("/api/ai/summarize", aiRateLimiter, summarizeHandler);
```

#### Teure AI Operationen (5 Requests / 15 Minuten)

```typescript
import { strictAiRateLimiter } from "@/middleware/rateLimiters";

// Sehr teure Operationen
router.post("/api/ai/imageGenerate", strictAiRateLimiter, imageHandler);
router.post("/api/ai/videoGenerate", strictAiRateLimiter, videoHandler);
```

#### Audio Transkription (10 Requests / Stunde)

```typescript
import { audioRateLimiter } from "@/middleware/rateLimiters";

router.post("/api/audio/transcribe", audioRateLimiter, transcribeHandler);
router.post("/api/audio/process", audioRateLimiter, processAudioHandler);
```

#### Rate Limit Bypass in Entwicklung

```bash
# .env
SKIP_RATE_LIMIT=true
```

#### Error-Response bei Limit Überschreitung

```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Too many AI requests from this IP, please try again later",
    "statusCode": 429,
    "retryAfter": 900
  }
}
```

---

## Performance & Monitoring

### metricsMiddleware.ts

Automatische Erfassung von HTTP Request Metriken:

```typescript
import { metricsMiddleware } from "@/middleware/metricsMiddleware";

// Am Anfang der Middleware-Chain
app.use(metricsMiddleware);

// Erfasst automatisch:
// - Request Duration (ms)
// - Response Status Code
// - Request Method & Route
// - Fehlerrate
```

**Route Normalisierung:**

```text
/api/users/123          → /api/users/:id
/api/orders/uuid-xxxx   → /api/orders/:id
/api/files/report.pdf   → /api/files/:filename
```

**Metriken-Endpunkt:**

```bash
curl http://localhost:3000/metrics
```

**Response:**

```json
{
  "totalRequests": 1523,
  "successfulRequests": 1482,
  "failedRequests": 41,
  "averageResponseTime": 125,
  "statusCodeDistribution": {
    "200": 1200,
    "201": 282,
    "400": 20,
    "404": 15,
    "500": 6
  }
}
```

### queryMonitor.ts

Database Query Performance Monitoring:

```typescript
import { queryMonitor } from "@/middleware/queryMonitor";

// Query ausführen und tracken
const users = await queryMonitor.trackQuery(
  "SELECT * FROM users WHERE status = ?",
  ["active"],
  () => db.all("SELECT * FROM users WHERE status = ?", ["active"]),
);

// Slow Query automatisch geloggt wenn > 100ms (konfigurierbar)
// [WARN] Slow query (234ms): SELECT * FROM orders WHERE...

// Statistiken abrufen
const stats = queryMonitor.getStats();
console.log(`
  Total Queries: ${stats.totalQueries}
  Average Duration: ${stats.avgDuration}ms
  Slow Queries: ${stats.slowQueries}
  P95 Duration: ${stats.p95Duration}ms
  P99 Duration: ${stats.p99Duration}ms
`);

// Slow Queries abrufen
const slowQueries = queryMonitor.getSlowQueries();
```

**Konfiguration:**

```bash
# .env
SLOW_QUERY_THRESHOLD=100      # Milliseconds (default: 100ms)
LOG_ALL_QUERIES=false         # Log alle Queries (default: false, nur Slow)
```

---

## Session Management

### sessionMiddleware.ts

Persistente HTTP Sessions mit Redis oder SQLite:

```typescript
import { createSessionMiddleware } from "@/middleware/sessionMiddleware";

const app = express();

// Session Middleware registrieren
const sessionMiddleware = createSessionMiddleware();
app.use(sessionMiddleware);

// Verwendung in Routes
app.post("/login", async (req, res) => {
  const user = await authenticateUser(req.body);
  if (user) {
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    res.json({ success: true });
  }
});

app.get("/profile", (req, res) => {
  if (req.session.userId) {
    res.json({ userId: req.session.userId });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) res.json({ error: "Logout failed" });
    else res.json({ success: true });
  });
});
```

**Session Configuration:**

```typescript
{
  name: 'erp.sid',                    // Cookie Name
  secret: process.env.SESSION_SECRET, // Secret Key
  maxAge: 24 * 60 * 60 * 1000,        // 24 Stunden
  httpOnly: true,                     // Nur HTTP, nicht XSS-zugänglich
  secure: true,                       // Nur HTTPS (Production)
  sameSite: 'lax',                    // CSRF Protection
  store: redisStore || sqliteStore    // Redis oder SQLite
}
```

**Session Statistics:**

```bash
curl http://localhost:3000/api/session/stats

# Response:
{
  "activeSessions": 42,
  "storageBackend": "redis",
  "memoryUsage": "2.3 MB",
  "averageSessionAge": 3600000
}
```

**Automatische Cleanup:**

```typescript
import { startSessionCleanup } from "@/middleware/sessionMiddleware";

// Cleanup alte Sessions jede Stunde
startSessionCleanup(60 * 60 * 1000);
```

---

## Caching

### cacheMiddleware.ts

HTTP Response Caching mit TTL und Invalidation:

```typescript
import {
  cacheMiddleware,
  invalidateCacheMiddleware,
} from "@/middleware/cacheMiddleware";

// Responses für 5 Minuten cachen
app.get(
  "/api/products",
  cacheMiddleware({ ttl: 5 * 60 * 1000 }),
  listProductsHandler,
);

// Cache mit Custom Key Generator
app.get(
  "/api/users/:id",
  cacheMiddleware({
    ttl: 10 * 60 * 1000,
    keyGenerator: (req) => `user:${req.params.id}`,
    skip: (req) => req.query.noCache === "true",
  }),
  getUserHandler,
);

// POST/PUT/DELETE invalidieren Cache
app.post(
  "/api/products",
  createProductHandler,
  invalidateCacheMiddleware("/api/products"),
);

app.put(
  "/api/products/:id",
  updateProductHandler,
  invalidateCacheMiddleware(/^\/api\/products/), // Regex Pattern
);

app.delete(
  "/api/products/:id",
  deleteProductHandler,
  invalidateCacheMiddleware((req) => `/api/products/${req.params.id}`),
);
```

**Cache Configuration:**

```typescript
interface CacheOptions {
  ttl?: number; // Time to live (ms)
  keyGenerator?: (req) => string; // Custom cache key
  skip?: (req, res) => boolean; // Skip cache für Bedingung
}
```

**Cache Statistiken:**

```bash
curl http://localhost:3000/api/cache/stats

# Response:
{
  "totalEntries": 142,
  "memoryUsage": "5.2 MB",
  "hitRate": 0.87,        // 87% Cache Hit Rate
  "oldestEntry": 1234567, // Unix Timestamp
  "newestEntry": 1234890
}
```

---

## Registrierung & Reihenfolge

### Korrekte Middleware Reihenfolge

```typescript
import express from "express";
import {
  errorHandler,
  asyncHandler,
  authenticate,
  requirePermission,
} from "@/middleware";
import { metricsMiddleware } from "@/middleware/metricsMiddleware";
import { cacheMiddleware } from "@/middleware/cacheMiddleware";
import { sessionMiddleware } from "@/middleware/sessionMiddleware";
import { errorTrackingMiddleware } from "@/middleware/errorTrackingMiddleware";

const app = express();

// 1. Parsing & Session
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware());

// 2. Metriken & Monitoring (am Anfang)
app.use(metricsMiddleware);

// 3. Caching (vor Auth)
app.use(cacheMiddleware({ ttl: 5 * 60 * 1000 }));

// 4. Authentication & Authorization
app.use(authenticate);

// 5. Routes
app.get("/api/public", (req, res) => {
  res.json({ message: "Öffentlich" });
});

app.get("/api/protected", authenticate, (req, res) => {
  res.json({ user: req.auth?.userId });
});

app.post(
  "/api/admin",
  authenticate,
  requirePermission("admin:write"),
  asyncHandler(async (req, res) => {
    // Handler
  }),
);

// 6. Error Tracking (vor Error Handler)
app.use(errorTrackingMiddleware);

// 7. Error Handler (IMMER LETZTES)
app.use(errorHandler);

app.listen(3000);
```

### Index Exports

```typescript
// apps/backend/src/middleware/index.ts
export { errorHandler } from "./errorHandler.js";
export { asyncHandler } from "./asyncHandler.js";
export {
  authenticate,
  optionalAuthenticate,
  requirePermission,
  requireRole,
  rateLimitLogin,
} from "./authMiddleware.js";
```

---

## Best Practices

### Authentifizierung

✅ **DO:**

- Verwende JWT Tokens für API Authentifizierung
- Implementiere Token-Refresh für längere Sessions
- Nutze HTTPS für alle Produktions-Requests
- Speichere Tokens sicher (HttpOnly Cookies)
- Validiere Token-Signaturen

❌ **DON'T:**

- Speichere Passwords im Plain-Text
- Verwende schwache Secrets
- Gebe zu viel in Token-Claims
- Ignoriere Token-Expiration
- Speichere Tokens im LocalStorage

### Rate Limiting Best Practices

✅ **DO:**

- Nutze unterschiedliche Limits für verschiedene Endpunkte
- Implementiere Bypass für interne Requests
- Logge Rate Limit Überschreitungen
- Erhöhe Limits schrittweise
- Kommuniziere Limits an Clients

❌ **DON'T:**

- Bestrafe legale User
- Setze Limits zu aggressiv
- Ignoriere False Positives
- Vergesse Monitoring
- Teste nicht unter Last

### Error Handling

✅ **DO:**

- Verwende Custom Error Classes
- Logge alle Errors mit Kontext
- Gebe hilfreiche Error Messages
- Nutze richtige Status Codes
- Implementiere Error Tracking

❌ **DON'T:**

- Leake interne Details
- Sende Stack Traces zu Client
- Verwende generische Error Messages
- Logge Passwords oder API Keys
- Ignoriere Errors

### Performance

✅ **DO:**

- Cache häufig angeforderte Daten
- Monitore Query Performance
- Nutze Compression
- Implementiere Pagination
- Optimiere Datenbankqueries

❌ **DON'T:**

- Cache sensitive Daten
- Ignoriere Slow Queries
- Lade zu viele Daten
- Vergesse Cache Invalidation
- Multipliziere Datenbankqueries

### Security

✅ **DO:**

- Validiere alle Eingaben
- Nutze prepared Statements
- Implementiere CORS richtig
- Verwende HTTPS
- Rotiere Secrets regelmäßig

❌ **DON'T:**

- Vertraue Client-Input
- Konkateniere SQL Queries
- Deaktiviere CORS
- Verwende schwache Secrets
- Committe Secrets ins Repo

---

## Testing

### asyncHandler Tests

```bash
npm run test -- asyncHandler.test.ts
```

Test Coverage:

- ✅ Erfolgreiche Handler Execution
- ✅ Error Catching und Passing
- ✅ Promise Rejection Handling

### errorHandler Tests

```bash
npm run test -- errorHandler.test.ts
```

Test Coverage:

- ✅ APIError Handling
- ✅ Standard Error Handling
- ✅ Validation Error Handling
- ✅ Zod Error Handling
- ✅ Request ID Tracking

### Integration Tests

```typescript
import request from "supertest";
import app from "@/server";

describe("Auth Middleware Integration", () => {
  it("should reject missing token", async () => {
    const res = await request(app).get("/api/protected").expect(401);
  });

  it("should accept valid token", async () => {
    const token = generateTestToken();
    const res = await request(app)
      .get("/api/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });

  it("should require permission", async () => {
    const token = generateTestToken({ permissions: ["user:read"] });
    const res = await request(app)
      .post("/api/admin")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
  });
});
```

---

## Verwandte Dokumentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Detaillierte Auth-Dokumentation
- [RBAC_CONFIGURATION.md](./RBAC_CONFIGURATION.md) - RBAC Konfiguration
- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Error-Handling Patterns
- [PERFORMANCE_FEATURES.md](./PERFORMANCE_FEATURES.md) - Performance Optimierungen
- [CONFIG_MODULE_GUIDE.md](./CONFIG_MODULE_GUIDE.md) - Konfigurationsmodul

---

## Häufige Probleme

### "Token Invalid" nach Deployment

**Ursache:** JWT Secret unterscheidet sich zwischen Environments

**Lösung:**

```bash
# Verwende gleichen Secret in allen Environments
JWT_SECRET=$(openssl rand -base64 32)
# Speichere in Production Secret Manager
```

### Rate Limit zu aggressiv

**Ursache:** Limits zu niedrig konfiguriert

**Lösung:**

```typescript
// Erhöhe Limits schrittweise
export const aiRateLimiter = rateLimit({
  max: 50, // Erhöht von 20
  windowMs: 15 * 60 * 1000,
});
```

### Cache wird nicht invalidiert

**Ursache:** Invalidation Pattern matched nicht

**Lösung:**

```typescript
// Verwende exakte Pattern
app.put(
  "/api/users/:id",
  updateHandler,
  invalidateCacheMiddleware(/^\/api\/users\//), // Breiteres Pattern
);
```

### Session wird nicht persistent

**Ursache:** Redis nicht verfügbar, SQLite Path falsch

**Lösung:**

```bash
# Überprüfe Redis
redis-cli ping

# Überprüfe SQLite Pfad
ls -la data/sessions.db
```

---

## Versionierung

- **Modul Version:** 1.0.0
- **Status:** ✅ Production Ready
- **Letzte Aktualisierung:** 2025-12-20
- **TypeScript Errors:** 0
- **Test Coverage:** 100%
