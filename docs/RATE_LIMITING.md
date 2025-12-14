# Rate Limiting Strategy

**Version**: 1.0.0  
**Status**: Production Ready  
**Letzte Aktualisierung**: Dezember 2024  
**Maintainer**: Thomas Heisig

---

## 📋 Überblick

Dieses Dokument beschreibt die Rate-Limiting-Strategie für das ERP SteinmetZ Backend.
Rate Limiting schützt die API vor Missbrauch, verhindert DoS-Angriffe und kontrolliert
Kosten bei externen AI-Providern.

---

## 🎯 Ziele

- **Schutz vor Missbrauch**: Verhindert automatisierte Angriffe und Bot-Traffic
- **Kostenkontrolle**: Begrenzt teure AI-API-Aufrufe
- **Fair Use**: Stellt sicher, dass alle Nutzer gleichen Zugang haben
- **Systemstabilität**: Verhindert Überlastung durch zu viele Anfragen

---

## 📊 Rate Limit Kategorien

### 1. Authentication Endpoints

**Zweck**: Schutz vor Brute-Force-Angriffen auf Login/Register

```typescript
// Login/Register: 5 Versuche pro 15 Minuten
windowMs: 15 * 60 * 1000; // 15 minutes
max: 5; // 5 requests per window
```

**Endpoints**:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/reset-password`

**Begründung**:

- Login-Endpoints sind häufiges Ziel von Brute-Force-Angriffen
- 5 Versuche reichen für legitime Nutzer (Tippfehler)
- 15 Minuten Wartezeit ist angemessen für Security

**Burst Handling**: Keine - streng limitiert

---

### 2. AI Endpoints (Standard)

**Zweck**: Kontrollierte Nutzung von AI-Features

```typescript
// AI Requests: 20 Anfragen pro 15 Minuten
windowMs: 15 * 60 * 1000; // 15 minutes
max: 20; // 20 requests per window
```

**Endpoints**:

- `POST /api/ai/chat`
- `POST /api/ai/completion`
- `GET /api/ai/models`
- `POST /api/ai/stream`

**Begründung**:

- Balance zwischen Nutzbarkeit und Kostenkontrolle
- 20 Anfragen = ca. 1-2 Anfragen pro Minute
- Ausreichend für interaktive Nutzung

**Burst Handling**:

- Burst von bis zu 5 Anfragen innerhalb 1 Minute erlaubt
- Danach greift Rate Limit

---

### 3. AI Endpoints (Strikt - Teure Operationen)

**Zweck**: Schutz vor hohen Kosten bei teuren AI-Operationen

```typescript
// Expensive AI: 5 Anfragen pro 15 Minuten
windowMs: 15 * 60 * 1000; // 15 minutes
max: 5; // 5 requests per window
```

**Endpoints**:

- `POST /api/ai-annotator/batch` (Batch-Verarbeitung)
- `POST /api/ai/transcribe` (Audio-Transkription)
- Große Modelle (GPT-4, Claude-3-Opus)

**Begründung**:

- Batch-Operationen verarbeiten viele Items
- Audio-Transkription ist ressourcenintensiv
- Große Modelle haben höhere API-Kosten

**Burst Handling**: Keine - streng limitiert

---

### 4. Audio Transcription

**Zweck**: Spezielle Limitierung für Audio-Verarbeitung

```typescript
// Audio: 10 Anfragen pro Stunde
windowMs: 60 * 60 * 1000; // 1 hour
max: 10; // 10 requests per window
```

**Endpoints**:

- `POST /api/ai/transcribe`
- `POST /api/quickchat/transcribe`

**Begründung**:

- Audio-Transkription ist sehr teuer (Whisper API)
- Lange Verarbeitungszeit pro Datei
- Legitimerweise weniger häufig genutzt

**Burst Handling**: Keine

---

### 5. General API

**Zweck**: Basis-Schutz für alle anderen Endpoints

```typescript
// General: 100 Anfragen pro 15 Minuten
windowMs: 15 * 60 * 1000; // 15 minutes
max: 100; // 100 requests per window
```

**Endpoints**:

- Alle anderen API-Endpoints
- CRUD-Operationen
- Dashboard-Abfragen
- Nicht-AI-Features

**Begründung**:

- Großzügig genug für normale Nutzung
- Schützt trotzdem vor automatisierten Massenanfragen
- 100 Requests = ca. 6-7 pro Minute

**Burst Handling**:

- Burst von bis zu 20 Anfragen innerhalb 1 Minute erlaubt
- Danach greift Rate Limit

---

## 🔧 Konfiguration

### Environment Variables

```env
# Disable rate limiting in development
SKIP_RATE_LIMIT=false

# Production: Always enforce rate limits
# (Remove or set to false)
```

### Code-Integration

```typescript
// apps/backend/src/middleware/rateLimiters.ts
import rateLimit from "express-rate-limit";

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.SKIP_RATE_LIMIT === "true",
});
```

---

## 📈 Monitoring

### Wichtige Metriken

1. **Rate Limit Hits**
   - Wie oft wird das Limit erreicht?
   - Welche Endpoints sind betroffen?

2. **Rejection Rate**
   - Prozentsatz abgelehnter Requests
   - Ziel: < 1% bei normaler Nutzung

3. **User Impact**
   - Wie viele unique Users sind betroffen?
   - Gibt es legitime Nutzer, die blockiert werden?

### Prometheus Metrics

```typescript
// Rate limit hits counter
rate_limit_hits_total{endpoint="/api/ai/chat", limit="20"}

// Rate limit rejections
rate_limit_rejections_total{endpoint="/api/ai/chat"}
```

### Logs

```json
{
  "level": "warn",
  "message": "Rate limit exceeded",
  "endpoint": "/api/ai/chat",
  "ip": "192.168.1.100",
  "userId": "user-123",
  "limit": 20,
  "windowMs": 900000
}
```

---

## 🚨 Alerts

### Kritische Alerts

1. **Hohe Rejection Rate**
   - Trigger: > 5% Rejections über 5 Minuten
   - Aktion: Prüfen auf Angriff oder legitimen Traffic-Anstieg

2. **Massives Rate Limit Hitting**
   - Trigger: > 100 Hits/Minute von einzelner IP
   - Aktion: Prüfen auf Bot/Scraper

3. **AI Cost Spike**
   - Trigger: Ungewöhnlich hohe AI-API-Kosten
   - Aktion: Prüfen auf Missbrauch

---

## 🎛️ Anpassung der Limits

### Wann anpassen?

1. **Erhöhen**:
   - Legitimerweise mehr Traffic (z.B. nach Marketing)
   - User-Feedback: Limits zu streng
   - Business-Wachstum

2. **Verringern**:
   - Kostenkontrolle erforderlich
   - Missbrauchsfälle erkannt
   - Systemlast zu hoch

### Wie anpassen?

1. **Graduell**: Limits in 10-20% Schritten ändern
2. **Testen**: In Staging-Umgebung testen
3. **Monitoren**: 24h nach Änderung genau überwachen
4. **Dokumentieren**: Änderungen im CHANGELOG festhalten

---

## 🔍 Testing

### Load Testing

```bash
# Test mit Apache Bench
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/ai/chat

# Test mit k6
k6 run --vus 10 --duration 30s load-test.js
```

### Integration Tests

```typescript
describe("Rate Limiting", () => {
  it("should reject after limit exceeded", async () => {
    // Make 21 requests (limit is 20)
    for (let i = 0; i < 21; i++) {
      const response = await request(app)
        .post("/api/ai/chat")
        .send({ message: "test" });

      if (i < 20) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

---

## 🌐 Production Best Practices

### 1. IP-basiertes Limiting

- **Standard**: Rate Limit pro IP-Adresse
- **Problem**: Shared IPs (NAT, Corporate Networks)
- **Lösung**: Kombination mit User-ID für authentifizierte Requests

### 2. Distributed Rate Limiting

Bei mehreren Backend-Instanzen:

```typescript
import RedisStore from "rate-limit-redis";
import { redisService } from "../services/redisService.js";

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  store: new RedisStore({
    client: redisService.getClient(),
    prefix: "rl:",
  }),
});
```

### 3. Graceful Responses

```typescript
handler: (req, res, next, options) => {
  const retryAfter = Math.ceil(options.windowMs / 1000);
  res.status(429).json({
    error: "Too many requests",
    retryAfter,
    message: "Please try again later",
  });
};
```

### 4. Whitelist für Internal Services

```typescript
skip: (req) => {
  // Skip rate limiting for internal service calls
  const internalToken = req.headers["x-internal-service"];
  return internalToken === process.env.INTERNAL_SERVICE_TOKEN;
};
```

---

## 📚 Referenzen

- [express-rate-limit Dokumentation](https://github.com/nfriedly/express-rate-limit)
- [OWASP Rate Limiting Guide](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)
- [API Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

**Letzte Aktualisierung**: Dezember 2024  
**Maintainer**: Thomas Heisig  
**Nächster Review**: März 2025
