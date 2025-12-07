# ERP SteinmetZ - Fault Tolerance & Resilience

**Stand**: 7. Dezember 2025  
**Version**: 0.3.0

## 📋 Übersicht

Dieses Dokument beschreibt die Fehlertoleranz- und Resilience-Mechanismen des ERP SteinmetZ Systems.

---

## ✅ Implementierte Resilience-Patterns

### 1. Circuit Breaker Pattern

**Implementierung**: `/src/resilience/CircuitBreaker.ts`

Das Circuit Breaker Pattern verhindert kaskadierende Fehler bei externen Service-Aufrufen.

**Konfiguration**:
```typescript
const cb = new CircuitBreaker({
  failureThreshold: 5,      // Anzahl Fehler bis Circuit öffnet
  successThreshold: 2,       // Erfolge zum Schließen bei HALF_OPEN
  timeoutMs: 30_000         // Timeout bis Retry (30s)
});
```

**Status**:
- ✅ Implementiert und getestet
- ✅ Verwendet in kritischen externen Service-Aufrufen
- ✅ Automatisches Recovery nach Timeout

### 2. Retry Policy

**Implementierung**: `/src/resilience/RetryPolicy.ts`

Automatisches Retry mit exponential backoff für transiente Fehler.

**Konfiguration**:
```typescript
const retry = new RetryPolicy({
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
});
```

**Status**:
- ✅ Implementiert und getestet
- ✅ Exponential Backoff
- ✅ Konfigurierbare Retry-Strategie

### 3. Graceful Degradation

#### Redis Session Store Fallback

**Implementierung**: `/apps/backend/src/middleware/sessionMiddleware.ts`

```typescript
// Automatischer Fallback zu In-Memory Store
if (redisError) {
  logger.warn("Falling back to in-memory session store");
  return session({
    store: new MemoryStore(),
    secret: sessionSecret,
    // ... config
  });
}
```

**Verifiziert**:
- ✅ Redis-Verbindungsfehler werden abgefangen
- ✅ Automatischer Fallback zu MemoryStore
- ✅ System bleibt operativ ohne Redis

#### AI Provider Fallback

**Implementierung**: `/apps/backend/src/services/aiProviderHealthService.ts`

```typescript
// Automatisches Fallback-System mit Prioritätsreihenfolge
const providers = ['openai', 'ollama', 'anthropic', 'fallback'];
const bestProvider = await getBestAvailableProvider();
```

**Verifiziert**:
- ✅ Health-Checks für alle Provider
- ✅ Automatische Provider-Auswahl nach Verfügbarkeit
- ✅ Lokaler Fallback-Provider immer verfügbar
- ✅ Priorisierung nach Konfiguration

### 4. Database Resilience

**Implementierung**: `/apps/backend/src/services/dbService.ts`

**Features**:
- ✅ **Schema-Validierung** beim Start
- ✅ **Automatisches Schema-Setup** wenn fehlend
- ✅ **Connection Pooling** (PostgreSQL)
- ✅ **Query Monitoring** für Performance
- ✅ **Graceful Shutdown** mit Connection-Cleanup

**Verifiziert**:
```typescript
// Schema-Validierung beim Start
{"level":"INFO","msg":"Starting SQLite schema verification..."}
{"level":"INFO","msg":"SQLite schema verification completed"}
{"level":"INFO","msg":"SQLite database initialized"}
{"level":"INFO","msg":"Database ready","driver":"sqlite"}
```

### 5. Error Handling

**Implementierung**: 
- `/apps/backend/src/middleware/errorHandler.ts`
- `/apps/backend/src/middleware/asyncHandler.ts`
- `/apps/backend/src/middleware/errorHandler.test.ts` (10 Tests)

**Features**:
- ✅ **APIError-Klassen** (BadRequestError, NotFoundError, UnauthorizedError, etc.)
- ✅ **asyncHandler** Wrapper für alle Router
- ✅ **Zod-Validierung** mit automatischem Error-Handling
- ✅ **Strukturiertes Logging** bei allen Fehlern
- ✅ **Standardisierte Error-Responses**

**Coverage**: Alle 16 Router standardisiert

### 6. Service-Level Monitoring

**Implementierung**:
- `/apps/backend/src/services/errorTrackingService.ts` (14 Tests)
- `/apps/backend/src/services/tracingService.ts` (14 Tests)
- `/apps/backend/src/services/metricsService.ts` (14 Tests)

**Features**:
- ✅ **Error Tracking** mit Sentry-Integration (optional)
- ✅ **OpenTelemetry Tracing** (optional)
- ✅ **Prometheus Metrics** Export
- ✅ **Query Performance Monitoring**
- ✅ **Graceful Degradation** bei Service-Ausfall

**Verifiziert**:
```typescript
// Services prüfen isInitialized/isEnabled() vor Operationen
if (!this.isEnabled()) {
  return; // Graceful skip wenn deaktiviert
}
```

---

## 🔍 Verifikation & Tests

### API Endpoint Tests (Durchgeführt: 7. Dez 2025)

| Endpoint | Status | Response Time | Fault Tolerance |
|----------|--------|---------------|-----------------|
| `/api/health` | ✅ | <50ms | Zeigt degraded bei fehlenden Keys |
| `/api/functions/roots` | ✅ | <100ms | Cache fallback verfügbar |
| `/api/metrics` | ✅ | <50ms | Prometheus-Export aktiv |
| `/api/ai/health` | ✅ | <100ms | Fallback-Provider immer verfügbar |

### Service Resilience Tests

#### 1. Redis Connection Failure
```bash
# Test: Start ohne Redis
npm run dev:backend

# Ergebnis: ✅ System startet mit In-Memory Fallback
[ERROR] Redis Client Error
[WARN] Falling back to in-memory session store
{"level":"INFO","msg":"Backend listening on: http://localhost:3000"}
```

#### 2. AI Provider Unavailability
```bash
# Test: Health-Check ohne API-Keys
curl http://localhost:3000/api/ai/health

# Ergebnis: ✅ Fallback-Provider verfügbar
{
  "overall": "degraded",
  "providers": [
    {"provider": "openai", "status": "unavailable"},
    {"provider": "ollama", "status": "unavailable"},
    {"provider": "fallback", "status": "healthy"}
  ]
}
```

#### 3. Database Initialization
```bash
# Test: Start mit fehlenden Tabellen
npm run dev:backend

# Ergebnis: ✅ Automatisches Schema-Setup
{"level":"INFO","msg":"Starting SQLite schema verification..."}
[auth] Authentication tables initialized
```

#### 4. Build & Test Success
```bash
# Test: Vollständiger Build
npm run build

# Ergebnis: ✅ Backend + Frontend erfolgreich
✓ built in 21.91s

# Test: Alle Tests
npm test

# Ergebnis: ✅ 134/134 Tests bestanden
Test Files  9 passed (9)
Tests  84 passed (84)   # Backend
Tests  50 passed (50)   # Frontend
```

---

## 📊 Fault Tolerance Metrics

### Availability
- **Target**: 99.9% (8.76h Ausfallzeit pro Jahr)
- **Current**: ✅ System operativ, keine kritischen Single Points of Failure

### Recovery Time
- **Redis Failure**: <1s (Automatischer Fallback)
- **AI Provider Failure**: <100ms (Health-Check + Fallback)
- **Database Init**: <2s (Schema-Validierung + Setup)

### Error Handling
- **Unhandled Exceptions**: 0 (Vollständige asyncHandler-Coverage)
- **API Error Responses**: ✅ Standardisiert (16/16 Router)
- **Logging Coverage**: ✅ Alle kritischen Pfade

---

## 🎯 Best Practices

### 1. Service-Integration

**DO**:
```typescript
// Health-Check vor Verwendung
const provider = await aiHealthService.getBestAvailableProvider();
if (provider === 'fallback') {
  logger.warn('Using fallback provider');
}

// Circuit Breaker für externe Calls
const result = await circuitBreaker.call(() => 
  externalService.call()
);
```

**DON'T**:
```typescript
// Kein direkter Call ohne Health-Check
const result = await openai.complete(prompt); // ❌

// Kein ungeschützter externer Call
const data = await fetch(externalAPI); // ❌
```

### 2. Error Handling

**DO**:
```typescript
// asyncHandler + APIError
router.get('/resource/:id', asyncHandler(async (req, res) => {
  const item = await findById(req.params.id);
  if (!item) {
    throw new NotFoundError('Resource not found');
  }
  res.json(item);
}));
```

**DON'T**:
```typescript
// Try-catch ohne asyncHandler
router.get('/resource/:id', async (req, res) => {
  try {
    const item = await findById(req.params.id);
    res.json(item); // ❌ Unhandled error if findById throws
  } catch (err) {
    res.status(500).json({ error: 'Internal error' }); // ❌ Keine strukturierte Antwort
  }
});
```

### 3. Graceful Degradation

**DO**:
```typescript
// Prüfung vor Operation
if (!metricsService.isEnabled()) {
  logger.debug('Metrics disabled, skipping');
  return;
}

// Fallback bei Fehler
try {
  await primaryOperation();
} catch (err) {
  logger.warn('Primary failed, using fallback', err);
  await fallbackOperation();
}
```

---

## 🔧 Konfiguration

### Environment Variables

```bash
# Redis (Optional - Fallback zu MemoryStore)
REDIS_URL=redis://localhost:6379

# AI Providers (Optional - Fallback zu lokalem Provider)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_BASE_URL=http://localhost:11434

# Monitoring (Optional - Graceful Degradation)
SENTRY_ENABLED=true
SENTRY_DSN=https://...
OTEL_TRACES_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Circuit Breaker Tuning

```typescript
// Aggressive (schnelles Öffnen)
new CircuitBreaker({
  failureThreshold: 3,
  successThreshold: 2,
  timeoutMs: 10_000
});

// Conservative (mehr Toleranz)
new CircuitBreaker({
  failureThreshold: 10,
  successThreshold: 5,
  timeoutMs: 60_000
});
```

---

## 📈 Monitoring & Alerts

### Health Checks

**Endpoint**: `GET /api/health`

**Response Statuses**:
- `healthy` - Alle Systeme operativ
- `degraded` - System operativ, aber mit Einschränkungen
- `unhealthy` - Kritische Komponenten ausgefallen

**Empfohlene Alerts**:
```yaml
# Prometheus Alert Rules
- alert: SystemDegraded
  expr: erp_health_status == 1
  for: 5m
  annotations:
    summary: "System in degraded state"

- alert: HighErrorRate
  expr: rate(erp_errors_total[5m]) > 0.1
  for: 2m
  annotations:
    summary: "Error rate above 10%"
```

### Metrics

**Endpoint**: `GET /api/metrics`

**Key Metrics**:
- `erp_steinmetz_http_request_duration_seconds` - Request latency
- `erp_steinmetz_http_requests_total` - Request count
- `erp_steinmetz_process_resident_memory_bytes` - Memory usage
- `erp_steinmetz_process_cpu_seconds_total` - CPU usage

---

## ✅ Checkliste: Production-Readiness

### Kritisch (Must-Have)
- [x] Circuit Breaker implementiert
- [x] Retry Policy mit exponential backoff
- [x] Graceful degradation bei Service-Ausfall
- [x] Standardisiertes Error-Handling (alle Router)
- [x] Health-Check-Endpoint
- [x] Strukturiertes Logging
- [x] Database Connection-Pooling
- [x] Graceful Shutdown-Handling

### Empfohlen (Should-Have)
- [x] Monitoring Service (Prometheus-Metrics)
- [x] Error Tracking (Sentry-Integration verfügbar)
- [x] Distributed Tracing (OpenTelemetry verfügbar)
- [x] Query Performance Monitoring
- [ ] Alerting-System (Prometheus Alertmanager)
- [ ] Dashboard (Grafana)

### Nice-to-Have
- [ ] Chaos Engineering Tests
- [ ] Load Testing (k6, Artillery)
- [ ] Failover-Tests
- [ ] Disaster Recovery Plan
- [ ] SLA-Monitoring

---

## 🚨 Known Limitations

### 1. In-Memory Session Store (Development)
**Impact**: Session-Daten gehen bei Server-Restart verloren  
**Mitigation**: Redis für Production verwenden  
**Status**: ✅ Fallback funktioniert, kein kritischer Fehler

### 2. AI Provider Dependencies
**Impact**: Externe AI-Funktionen nicht verfügbar ohne API-Keys  
**Mitigation**: Lokaler Fallback-Provider vorhanden  
**Status**: ✅ System bleibt operativ

### 3. SQLite für Development
**Impact**: Nicht für High-Concurrency Production geeignet  
**Mitigation**: PostgreSQL für Production konfiguriert  
**Status**: ✅ Migration-System vorhanden

---

## 📚 Weitere Ressourcen

- **[ERROR_HANDLING.md](ERROR_HANDLING.md)** - Detailliertes Error-Handling
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System-Architektur & Patterns
- **[MONITORING.md](MONITORING.md)** - Monitoring & Observability
- **[DATABASE_OPTIMIZATION.md](DATABASE_OPTIMIZATION.md)** - DB-Performance

---

**Letzte Aktualisierung**: 7. Dezember 2025  
**Verifiziert durch**: Manuelle Tests + Automatisierte Test-Suite (134 Tests)  
**Nächstes Review**: Januar 2026
