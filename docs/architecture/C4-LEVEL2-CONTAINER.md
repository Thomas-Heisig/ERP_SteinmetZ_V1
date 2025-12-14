# C4 Model - Level 2: Container Diagram

**Version**: 1.0.0  
**Status**: Production Ready  
**Letzte Aktualisierung**: Dezember 2024  
**Maintainer**: Thomas Heisig

---

## 📋 Überblick

Dieses Diagramm zeigt die Container (Applikationen und Datenspeicher) innerhalb des
ERP SteinmetZ Systems (C4 Level 2 - Container Diagram).

---

## 🎯 Container Diagram

```mermaid
C4Container
    title Container Diagram for ERP SteinmetZ

    Person(user, "Business User", "Nutzt das ERP System")
    Person(admin, "Admin", "Verwaltet das System")

    System_Boundary(erp_boundary, "ERP SteinmetZ") {
        Container(web_app, "Web Application", "React, TypeScript, Vite", "Bietet UI für alle Geschäftsprozesse")
        Container(api, "API Application", "Node.js, Express, TypeScript", "REST API für alle Backend-Operationen")
        Container(ws, "WebSocket Server", "Socket.IO", "Real-time Updates und Push-Notifications")
        ContainerDb(db, "Database", "SQLite/PostgreSQL", "Speichert Geschäftsdaten, Konfiguration, Cache")
        ContainerDb(redis, "Redis", "Redis", "Session Store, Distributed Cache, Rate Limiting")
    }

    System_Ext(ai_providers, "AI Providers", "OpenAI, Anthropic, Ollama")
    System_Ext(monitoring, "Monitoring", "Sentry, Jaeger, Prometheus")

    Rel(user, web_app, "Nutzt", "HTTPS")
    Rel(admin, web_app, "Administriert", "HTTPS")
    
    Rel(web_app, api, "Macht API-Calls", "HTTPS/REST, JSON")
    Rel(web_app, ws, "Verbindet zu", "WebSocket")
    
    Rel(api, db, "Liest/Schreibt", "SQL")
    Rel(api, redis, "Liest/Schreibt", "Redis Protocol")
    Rel(api, ai_providers, "Sendet AI-Anfragen", "HTTPS/REST")
    Rel(api, monitoring, "Sendet Telemetrie", "HTTPS/OTLP")
    
    Rel(ws, redis, "Publishes Events", "Redis PubSub")
    Rel(ws, db, "Liest Status", "SQL")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

---

## 📦 Container-Beschreibungen

### Frontend Container

#### Web Application
- **Technologie**: React 18, TypeScript, Vite
- **Zweck**: Single-Page-Application (SPA) für alle UI-Interaktionen
- **Features**:
  - Dashboard mit Widgets
  - Modul-basierte Navigation (HR, Finance, Documents, etc.)
  - AI-Annotator UI
  - QuickChat Interface
  - Real-time Updates via WebSocket
- **Build**: Vite mit Code-Splitting und Lazy Loading
- **Deployment**: Statische Files (HTML, CSS, JS)
- **Port**: 5173 (dev), wird von Reverse Proxy bereitgestellt (prod)

**Key Components**:
```
/src
  /components
    /Dashboard      - Dashboard-Widgets und Grid
    /ui             - Shared UI Components (Button, Input, etc.)
  /features
    /documents      - Dokumentenverwaltung
    /hr             - HR-Modul
    /finance        - Finance-Modul
    /communication  - QuickChat, Phone Dialer
  /utils
    /logger         - Structured Logging
    /api            - API Client
```

---

### Backend Containers

#### API Application
- **Technologie**: Node.js 18+, Express 5, TypeScript
- **Zweck**: REST API für alle Backend-Operationen
- **Port**: 3000
- **Features**:
  - RESTful Endpoints für alle Module
  - Authentication & Authorization (JWT)
  - Rate Limiting (express-rate-limit)
  - Request Validation (Zod)
  - Error Handling & Logging
  - Metrics Collection (Prometheus)
  - Health Checks

**Router-Struktur**:
```
/api
  /auth             - Login, Register, Token Refresh
  /dashboard        - Dashboard-Daten
  /ai               - AI-Chat, Completion, Models
  /ai-annotator     - AI-Annotator Batch Processing
  /hr               - Mitarbeiter, Urlaub, Gehalt
  /finance          - Rechnungen, Buchhaltung, Reports
  /documents        - Dokumentenverwaltung
  /quickchat        - QuickChat Nachrichten
  /calendar         - Termine, Events
  /system           - System-Info, Configuration
  /health           - Liveness, Readiness Probes
  /metrics          - Prometheus Metrics
```

**Services**:
- `authService` - User Authentication
- `dbService` - Database Abstraction
- `aiProviderHealthService` - AI Provider Health Checks
- `tracingService` - OpenTelemetry Tracing
- `errorTrackingService` - Sentry Integration
- `websocketService` - WebSocket Management
- `shutdownManager` - Graceful Shutdown

---

#### WebSocket Server
- **Technologie**: Socket.IO 4
- **Zweck**: Real-time bidirektionale Kommunikation
- **Port**: 3000 (same as API, Socket.IO upgrade)
- **Features**:
  - JWT-basierte Authentifizierung
  - Room-based Broadcasting
  - Event-Types:
    - `dashboard:update` - Dashboard-Updates
    - `chat:message` - Chat-Nachrichten
    - `system:notification` - System-Benachrichtigungen
    - `batch:progress` - Batch-Processing-Updates
    - `catalog:update` - Functions-Catalog-Changes

**Event-Flow**:
```
Client → WebSocket → Server
         (connect, auth)
Server → WebSocket → Client
         (events, broadcasts)
```

---

### Data Storage Containers

#### Database
- **Technologie**: SQLite (dev), PostgreSQL (prod)
- **Zweck**: Persistente Speicherung aller Geschäftsdaten
- **Port**: 5432 (PostgreSQL)
- **Schema**:
  - `users` - Benutzer und Authentication
  - `sessions` - Session-Daten (wenn Redis nicht verfügbar)
  - `functions_nodes` - Functions-Catalog
  - `functions_edges` - Functions-Relationships
  - `ai_annotations` - AI-Annotator-Daten
  - `documents` - Dokumenten-Metadaten
  - `hr_*` - HR-Modul-Tabellen
  - `finance_*` - Finance-Modul-Tabellen
  - `audit_trail` - Audit-Logs für Compliance

**Migrations**:
- Automatisch bei Startup (dbService.init())
- Versioniert mit Schema-Checksums
- Rollback-fähig

---

#### Redis
- **Technologie**: Redis 7+
- **Zweck**: Distributed Cache, Session Store, PubSub
- **Port**: 6379
- **Use Cases**:
  1. **Session Store**: Express-Sessions mit `connect-redis`
  2. **Rate Limiting**: Verteiltes Rate-Limiting
  3. **Cache**: API-Response-Cache, Query-Cache
  4. **PubSub**: WebSocket Event Broadcasting
- **Fallback**: In-Memory Store wenn Redis nicht verfügbar

**Key-Patterns**:
```
sess:*              - Sessions (TTL: 7 days)
rl:*                - Rate Limit Counters (TTL: 15 min)
cache:*             - API Response Cache (TTL: 5-15 min)
ws:room:*           - WebSocket Room Membership
```

---

## 🔄 Datenfluss

### 1. Normale API-Anfrage

```mermaid
sequenceDiagram
    participant User
    participant WebApp
    participant API
    participant DB
    participant Redis

    User->>WebApp: Interaktion
    WebApp->>API: HTTP Request (JSON)
    API->>Redis: Check Cache
    alt Cache Hit
        Redis-->>API: Cached Data
    else Cache Miss
        API->>DB: Query Data
        DB-->>API: Result
        API->>Redis: Store in Cache
    end
    API-->>WebApp: HTTP Response (JSON)
    WebApp-->>User: UI Update
```

### 2. Real-time Update

```mermaid
sequenceDiagram
    participant User1
    participant WebApp1
    participant API
    participant WS
    participant Redis
    participant WebApp2
    participant User2

    User1->>WebApp1: Action (z.B. Create Document)
    WebApp1->>API: POST /api/documents
    API->>DB: Insert Document
    API->>WS: Trigger Event
    WS->>Redis: Publish to Room
    Redis-->>WS: Event to Subscribers
    WS-->>WebApp2: WebSocket Event
    WebApp2-->>User2: UI Update
```

### 3. AI-Anfrage mit Fallback

```mermaid
sequenceDiagram
    participant WebApp
    participant API
    participant OpenAI
    participant Anthropic
    participant Ollama

    WebApp->>API: POST /api/ai/chat
    API->>OpenAI: AI Request
    alt OpenAI verfügbar
        OpenAI-->>API: Response
    else OpenAI nicht verfügbar
        API->>Anthropic: Fallback Request
        alt Anthropic verfügbar
            Anthropic-->>API: Response
        else Anthropic nicht verfügbar
            API->>Ollama: Final Fallback
            Ollama-->>API: Response
        end
    end
    API-->>WebApp: AI Response
```

---

## 🔐 Security

### API Security
- **Authentication**: JWT (Bearer Token)
- **Authorization**: Role-based (User, Admin)
- **Rate Limiting**: IP-based, differenziert nach Endpoint
- **Input Validation**: Zod-Schema-Validation
- **CORS**: Configured für Frontend-Origin

### WebSocket Security
- **Authentication**: JWT in Handshake
- **Room Authorization**: Server-seitig geprüft
- **Rate Limiting**: Connection Limits

### Database Security
- **Prepared Statements**: SQL-Injection-Prevention
- **Encryption**: TLS für PostgreSQL
- **Access Control**: Dedizierter DB-User mit minimalen Rechten

---

## 📊 Monitoring

### Metrics (Prometheus)
- API Request Counts & Latencies
- Database Query Performance
- WebSocket Connection Count
- Redis Cache Hit/Miss Ratio
- AI Provider Response Times

### Traces (OpenTelemetry)
- Request-to-Response Flow
- Database Query Traces
- External API Calls
- Error Propagation

### Errors (Sentry)
- Uncaught Exceptions
- API Errors
- Frontend Errors
- Performance Issues

---

## 🚀 Deployment

### Development
```
Frontend: npm run dev        (Port 5173)
Backend:  npm run dev        (Port 3000)
Redis:    Optional (Fallback to in-memory)
DB:       SQLite (./data/dev.sqlite3)
```

### Production
```
Frontend: Static Build → CDN/Nginx
Backend:  Node.js → Docker → Kubernetes
Redis:    Redis Cluster
DB:       PostgreSQL Cluster
```

---

## 📚 Verwandte Dokumente

- [C4 Level 1: System Context](./C4-LEVEL1-SYSTEM-CONTEXT.md)
- [Request Flow Diagram](./REQUEST-FLOW.md)
- [AI-Annotator Data Flow](./AI-ANNOTATOR-FLOW.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)

---

**Letzte Aktualisierung**: Dezember 2024  
**Maintainer**: Thomas Heisig  
**Nächster Review**: März 2025
