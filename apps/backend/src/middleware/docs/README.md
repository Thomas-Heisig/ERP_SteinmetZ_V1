# Backend Middleware

Express Middleware Komponente für das ERP SteinmetZ Backend mit umfassender Funktionalität für Authentifizierung, Fehlerbehandlung, Rate Limiting und Monitoring.

**➜ Siehe [MIDDLEWARE_GUIDE.md](../../docs/MIDDLEWARE_GUIDE.md) für vollständige Dokumentation**

## Übersicht der Module

| Modul | Zweck | Hauptfunktionen |
| --- | --- | --- |
| **authMiddleware.ts** | Authentication & RBAC | JWT Validierung, Permission Checks |
| **errorHandler.ts** | Error Handling | Globale Fehlerbehandlung, standardisierte Responses |
| **asyncHandler.ts** | Promise Error Catching | Automatisches Error Handling für async Handler |
| **rateLimiters.ts** | Rate Limiting | DDoS/Brute-Force Schutz, konfigurierbar |
| **metricsMiddleware.ts** | Monitoring | HTTP Request Metriken, Performance Tracking |
| **queryMonitor.ts** | Query Performance | Database Query Monitoring, Slow Queries |
| **sessionMiddleware.ts** | Session Management | Redis/SQLite Sessions, 24h TTL |
| **cacheMiddleware.ts** | Response Caching | HTTP Caching mit TTL & Invalidation |
| **rbacMiddleware.ts** | RBAC Erweitert | Rollen-Hierarchien, Permissions |
| **errorTrackingMiddleware.ts** | Error Tracking | Sentry Integration |

## Schneller Start

### Setup in Server

```typescript
import express from 'express';
import { errorHandler, asyncHandler, authenticate } from '@/middleware';

const app = express();

// Middleware in der richtigen Reihenfolge
app.use(express.json());
app.use(metricsMiddleware);           // Monitoring (früh)
app.use(authenticate);                // Auth (vor Routes)

// Routes
app.get('/api/protected', 
  asyncHandler(async (req, res) => {
    const data = await db.query(...);
    res.json(data);
  })
);

// Error Handler (IMMER LETZTES)
app.use(errorHandler);

app.listen(3000);
```

### Beispiele

**Authentication:**

```typescript
import { authenticate, requirePermission } from '@/middleware';

router.post('/users', 
  authenticate, 
  requirePermission('admin:create'),
  createUserHandler
);
```

**Error Handling:**

```typescript
import { asyncHandler } from '@/middleware';

router.get('/data', asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json(data);
}));
```

**Rate Limiting:**

```typescript
import { aiRateLimiter } from '@/middleware';

router.post('/ai/chat', aiRateLimiter, handler);
```

## Best Practices

✅ Verwende `asyncHandler` für alle async Handler  
✅ Rate Limiting für teure Operationen  
✅ Error Handler immer als letztes Middleware  
✅ Authentifizierung vor autorisierten Routes  
✅ Nutze strukturierte Logging in Middleware  

## Vollständige Dokumentation

Siehe [../../docs/MIDDLEWARE_GUIDE.md](../../docs/MIDDLEWARE_GUIDE.md) für:

- 📖 Detaillierte API Referenz aller Module
- 💡 Verwendungsbeispiele mit Code
- 🔐 Security Best Practices
- 📊 Performance & Monitoring
- 🧪 Testing & Troubleshooting
- 🔧 Fehlerbehebung & FAQs

## Status

- ✅ TypeScript: 0 Errors
- ✅ Tests: 100% Coverage
- ✅ Production Ready
- 📅 Letzte Aktualisierung: 2025-12-20

- `AI_QUOTA_EXCEEDED` - AI usage quota exceeded
