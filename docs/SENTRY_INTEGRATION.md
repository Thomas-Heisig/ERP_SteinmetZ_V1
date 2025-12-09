# Sentry Integration Guide

**Status**: 🟡 In Planung  
**Version**: 0.1.0  
**Letzte Aktualisierung**: 9. Dezember 2025

## Übersicht

Sentry ist eine Error-Tracking und Performance-Monitoring Plattform, die automatisch Fehler erfasst, aggregiert und priorisiert. Diese Anleitung beschreibt die Integration von Sentry in das ERP SteinmetZ System.

## Warum Sentry?

- **Automatisches Error-Tracking**: Erfasst alle unbehandelten Exceptions
- **Source-Maps**: Stack-Traces mit original Source-Code
- **Release-Tracking**: Fehler nach Deployment-Version gruppieren
- **User Context**: Wer war betroffen?
- **Breadcrumbs**: Was führte zum Fehler?
- **Performance-Monitoring**: Slow Transactions identifizieren
- **Alerts**: Email/Slack-Benachrichtigungen bei kritischen Fehlern

## Voraussetzungen

- Sentry Account (https://sentry.io oder Self-Hosted)
- Project DSN (Data Source Name)
- Node.js 18+

## Setup

### 1. Sentry Account & Project

1. Registriere dich auf [sentry.io](https://sentry.io) (kostenlos für kleine Teams)
2. Erstelle ein neues Project für:
   - **Backend**: Node.js / Express
   - **Frontend**: React
3. Notiere die DSN für beide Projects

### 2. Dependencies installieren

**Backend**:

```bash
cd apps/backend
npm install @sentry/node @sentry/profiling-node
```

**Frontend**:

```bash
cd apps/frontend
npm install @sentry/react
```

## Backend Integration

### 1. Sentry Service erweitern

**apps/backend/src/services/errorTrackingService.ts** ist bereits vorhanden und muss nur konfiguriert werden:

```typescript
// Die Konfiguration ist bereits implementiert, nur DSN setzen
```

### 2. Environment Variables

Füge zu `.env` hinzu:

```bash
# Sentry Configuration
SENTRY_ENABLED=true
SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% für Performance-Monitoring
SENTRY_DEBUG=false
```

### 3. Server Integration

Die Integration ist bereits in `apps/backend/src/index.ts` vorbereitet:

```typescript
import { errorTrackingService } from "./services/errorTrackingService.js";

// Nach Express-App-Initialisierung
if (process.env.SENTRY_ENABLED === "true") {
  errorTrackingService.initialize(app);
}

// Error-Handler (MUSS nach allen Routes kommen!)
app.use(errorTrackingService.errorHandler());
```

### 4. Manuelle Error-Erfassung

Für bewusste Error-Reporting mit Context:

```typescript
import { errorTrackingService } from "../services/errorTrackingService.js";

try {
  await processPayment(orderId);
} catch (error) {
  errorTrackingService.captureError(error, {
    level: "error",
    tags: {
      operation: "payment",
      payment_method: "credit_card",
    },
    extra: {
      orderId,
      amount: order.total,
      currency: "EUR",
    },
    user: {
      id: userId,
      email: userEmail,
    },
  });
  throw error;
}
```

### 5. Performance-Monitoring

Transaktionen für kritische Operations tracken:

```typescript
import * as Sentry from "@sentry/node";

async function processOrder(orderId: string) {
  const transaction = Sentry.startTransaction({
    op: "order.process",
    name: "Process Order",
    data: { orderId },
  });

  try {
    const span1 = transaction.startChild({
      op: "db.query",
      description: "Fetch Order",
    });
    const order = await db.getOrder(orderId);
    span1.finish();

    const span2 = transaction.startChild({
      op: "payment.process",
      description: "Process Payment",
    });
    await processPayment(order);
    span2.finish();

    transaction.setStatus("ok");
  } catch (error) {
    transaction.setStatus("internal_error");
    throw error;
  } finally {
    transaction.finish();
  }
}
```

## Frontend Integration

### 1. Sentry initialisieren

**apps/frontend/src/main.tsx**:

```typescript
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      // Browser Tracing
      Sentry.browserTracingIntegration(),
      // Session Replay für Fehler-Reproduktion
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% der Transaktionen

    // Session Replay nur bei Fehlern
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Release-Tracking
    release: `erp-steinmetz@${import.meta.env.VITE_APP_VERSION}`,

    // Ignore bestimmte Fehler
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],

    // Breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Filtere sensitive Daten
      if (
        breadcrumb.category === "console" &&
        breadcrumb.message?.includes("password")
      ) {
        return null;
      }
      return breadcrumb;
    },
  });
}
```

### 2. Environment Variables

**apps/frontend/.env.production**:

```bash
VITE_SENTRY_DSN=https://your-frontend-dsn@sentry.io/your-project-id
VITE_APP_VERSION=0.3.0
```

### 3. Error Boundary Integration

```typescript
import * as Sentry from '@sentry/react';

const SentryRoutes = Sentry.withSentryRouting(Routes);

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
      showDialog
    >
      <BrowserRouter>
        <SentryRoutes>
          {/* Your routes */}
        </SentryRoutes>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}
```

### 4. User Context setzen

Nach Login:

```typescript
import * as Sentry from "@sentry/react";

function setUserContext(user: User) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    // Keine sensitiven Daten!
  });
}

function clearUserContext() {
  Sentry.setUser(null);
}
```

## Source Maps

### 1. Backend Source Maps

**apps/backend/tsconfig.json**:

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true
  }
}
```

**Sentry Release erstellen**:

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Authenticate
export SENTRY_AUTH_TOKEN=your-auth-token
export SENTRY_ORG=your-org
export SENTRY_PROJECT=erp-steinmetz-backend

# Create release and upload source maps
sentry-cli releases new "erp-steinmetz@0.3.0"
sentry-cli releases files "erp-steinmetz@0.3.0" upload-sourcemaps ./dist --rewrite
sentry-cli releases finalize "erp-steinmetz@0.3.0"
```

### 2. Frontend Source Maps (Vite)

**apps/frontend/vite.config.ts**:

```typescript
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: {
        name: `erp-steinmetz@${version}`,
      },
    }),
  ],
});
```

## CI/CD Integration

### GitHub Actions

**.github/workflows/deploy.yml**:

```yaml
- name: Create Sentry Release
  if: github.ref == 'refs/heads/main'
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
  run: |
    # Install Sentry CLI
    npm install -g @sentry/cli

    # Create release
    export VERSION=$(node -p "require('./package.json').version")
    sentry-cli releases new "erp-steinmetz@$VERSION"

    # Upload source maps
    sentry-cli releases files "erp-steinmetz@$VERSION" \
      upload-sourcemaps ./apps/backend/dist \
      --rewrite

    # Finalize release
    sentry-cli releases finalize "erp-steinmetz@$VERSION"

    # Associate commits
    sentry-cli releases set-commits "erp-steinmetz@$VERSION" --auto
```

## Alert Rules

### 1. In Sentry Dashboard konfigurieren

**Alert auf kritische Fehler**:

- **Bedingung**: New issue mit Level `error` oder `fatal`
- **Aktion**: Email an Team + Slack-Nachricht

**Alert auf hohe Fehlerrate**:

- **Bedingung**: >10 Fehler in 5 Minuten
- **Aktion**: PagerDuty-Trigger

**Alert auf Performance-Degradation**:

- **Bedingung**: P95 Response-Time >2s
- **Aktion**: Slack-Nachricht an #performance

### 2. Slack Integration

1. In Sentry: **Settings → Integrations → Slack**
2. Channel auswählen: `#erp-errors`
3. Alert-Rules mit Slack verbinden

## Best Practices

### 1. Error-Kontext

Immer aussagekräftigen Context mitgeben:

```typescript
errorTrackingService.captureError(error, {
  level: "error",
  tags: {
    feature: "payment",
    payment_provider: "stripe",
  },
  extra: {
    orderId: "12345",
    userId: "user-789",
    attemptNumber: 3,
  },
});
```

### 2. Fingerprinting

Gruppiere ähnliche Fehler:

```typescript
Sentry.init({
  beforeSend(event, hint) {
    // Custom grouping für bekannte Fehler
    if (event.exception?.values?.[0]?.type === "NetworkError") {
      event.fingerprint = ["network-error", event.request?.url || ""];
    }
    return event;
  },
});
```

### 3. Sampling

Für hohen Traffic:

```typescript
Sentry.init({
  // Error Sampling: Alle Fehler erfassen
  sampleRate: 1.0,

  // Performance Sampling: Nur 10%
  tracesSampleRate: 0.1,

  // Session Replay: Nur bei Fehlern
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 4. PII (Personally Identifiable Information)

**Niemals PII in Sentry loggen**:

```typescript
Sentry.init({
  beforeSend(event) {
    // Entferne sensitive Daten
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.creditCard;
      delete event.request.data.ssn;
    }
    return event;
  },
});
```

### 5. Release-Health

Track Crashes und Sessions:

```typescript
Sentry.init({
  // Release Health aktivieren
  autoSessionTracking: true,

  // Session nach Inaktivität beenden
  sessionTrackingIntervalMillis: 10000,
});
```

## Dashboards

### Issue Dashboard

Zeigt alle Errors gruppiert nach:

- **Frequency**: Wie oft tritt der Fehler auf?
- **Users**: Wie viele User sind betroffen?
- **First Seen**: Wann trat der Fehler erstmals auf?
- **Last Seen**: Wann zuletzt?

### Performance Dashboard

Zeigt Transaktionen mit:

- **P95/P99 Latency**
- **Throughput** (Requests/min)
- **Apdex Score** (User Satisfaction)
- **Slow Transactions**

### Release Dashboard

Zeigt pro Release:

- **Crash-Free Rate**
- **New Issues**
- **Regressions** (alte Fehler wieder aufgetreten)
- **Adoption Rate** (% User auf neuer Version)

## Kosten

**Sentry SaaS Pricing** (Stand 2025):

- **Developer**: Kostenlos bis 5k Events/Monat
- **Team**: $26/Monat - 50k Events
- **Business**: $80/Monat - 100k Events
- **Enterprise**: Custom Pricing

**Self-Hosted Alternative**: Kostenlos, aber Hosting-Kosten und Wartungsaufwand

## Troubleshooting

### Problem: Keine Events in Sentry

**Lösung**:

1. Prüfe SENTRY_ENABLED=true und DSN korrekt
2. Teste mit `Sentry.captureMessage('Test')`
3. Prüfe Network-Tab: Requests an sentry.io?
4. Prüfe Firewall/CORS

### Problem: Source Maps funktionieren nicht

**Lösung**:

1. Prüfe `sourcemap: true` in Build-Config
2. Prüfe Sentry Release erstellt: `sentry-cli releases list`
3. Prüfe Source Maps uploaded: `sentry-cli releases files <release> list`
4. Match Release-Name zwischen Code und Sentry

### Problem: Zu viele Events (Quota erreicht)

**Lösung**:

1. Aktiviere Sampling: `sampleRate: 0.5`
2. Ignore häufige, unwichtige Fehler: `ignoreErrors`
3. Filter in `beforeSend`
4. Upgrade Plan oder Self-Hosting

## Weitere Ressourcen

- [Sentry Docs](https://docs.sentry.io/)
- [Node.js SDK](https://docs.sentry.io/platforms/node/)
- [React SDK](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Best Practices](https://docs.sentry.io/product/best-practices/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)

---

**Status**: In Planung  
**Nächster Schritt**: Sentry Account erstellen und DSN konfigurieren  
**Verantwortlich**: DevOps / Backend Team
