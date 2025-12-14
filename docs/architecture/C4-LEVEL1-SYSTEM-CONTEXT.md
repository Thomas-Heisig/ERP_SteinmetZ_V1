# C4 Model - Level 1: System Context

**Version**: 1.0.0  
**Status**: Production Ready  
**Letzte Aktualisierung**: Dezember 2024  
**Maintainer**: Thomas Heisig

---

## 📋 Überblick

Dieses Diagramm zeigt das ERP SteinmetZ System im Kontext seiner externen Benutzer
und Systeme (C4 Level 1 - System Context).

---

## 🎯 System Context Diagram

```mermaid
C4Context
    title System Context Diagram for ERP SteinmetZ

    Person(user, "Business User", "Nutzt das ERP System für tägliche Geschäftsprozesse")
    Person(admin, "System Administrator", "Verwaltet und konfiguriert das System")
    Person(developer, "Developer", "Entwickelt und wartet das System")

    System(erp, "ERP SteinmetZ", "Enterprise Resource Planning System für Steinmetz-Betriebe")

    System_Ext(openai, "OpenAI API", "AI-gestützte Textverarbeitung und Analyse")
    System_Ext(anthropic, "Anthropic Claude API", "Advanced AI für komplexe Aufgaben")
    System_Ext(ollama, "Ollama (Local)", "Lokale AI-Modelle")
    System_Ext(sentry, "Sentry", "Error Tracking und Monitoring")
    System_Ext(jaeger, "Jaeger/OpenTelemetry", "Distributed Tracing")
    System_Ext(email, "E-Mail Service", "E-Mail-Benachrichtigungen")

    Rel(user, erp, "Nutzt", "HTTPS/WebSocket")
    Rel(admin, erp, "Administriert", "HTTPS")
    Rel(developer, erp, "Entwickelt für", "Git, API")

    Rel(erp, openai, "Sendet AI-Anfragen", "HTTPS/REST")
    Rel(erp, anthropic, "Sendet AI-Anfragen", "HTTPS/REST")
    Rel(erp, ollama, "Sendet AI-Anfragen", "HTTP/REST")
    Rel(erp, sentry, "Sendet Fehler-Reports", "HTTPS")
    Rel(erp, jaeger, "Sendet Traces", "OTLP/HTTP")
    Rel(erp, email, "Sendet E-Mails", "SMTP")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

---

## 📝 Beschreibung

### Benutzer

#### Business User

- **Rolle**: Mitarbeiter im Steinmetz-Betrieb
- **Interaktion**:
  - Tägliche Arbeit mit dem ERP System
  - Verwaltung von Kunden, Aufträgen, Rechnungen
  - Nutzung der AI-Features für Dokumentverarbeitung
- **Zugriff**: Web-Browser (Frontend), HTTPS verschlüsselt

#### System Administrator

- **Rolle**: IT-Verantwortlicher
- **Interaktion**:
  - System-Konfiguration und -Wartung
  - Benutzer-Verwaltung
  - Monitoring und Fehleranalyse
- **Zugriff**: Admin-Dashboard, System-APIs

#### Developer

- **Rolle**: Software-Entwickler
- **Interaktion**:
  - Entwicklung neuer Features
  - Bug-Fixes und Wartung
  - API-Integration
- **Zugriff**: Git-Repository, Entwicklungs-APIs, Dokumentation

---

### Externe Systeme

#### AI-Provider

**OpenAI API**

- **Zweck**: Advanced AI für Text-Generation und -Analyse
- **Modelle**: GPT-4, GPT-4-Turbo, GPT-3.5-Turbo
- **Nutzung**: AI-Annotator, QuickChat, Dokumentenverarbeitung
- **Protokoll**: HTTPS REST API
- **Fallback**: Bei Ausfall → Anthropic oder Ollama

**Anthropic Claude API**

- **Zweck**: Alternative AI mit hoher Qualität
- **Modelle**: Claude-3-Opus, Claude-3-Sonnet
- **Nutzung**: Komplexe Analysen, lange Kontexte
- **Protokoll**: HTTPS REST API
- **Fallback**: Bei Ausfall → OpenAI oder Ollama

**Ollama (Local)**

- **Zweck**: Lokale AI ohne externe Abhängigkeiten
- **Modelle**: Qwen2.5, Llama, Mistral
- **Nutzung**: Privacy-sensitive Daten, Offline-Betrieb
- **Protokoll**: HTTP REST API (localhost)
- **Vorteil**: Keine API-Kosten, vollständige Datenkontrolle

#### Monitoring & Observability

**Sentry**

- **Zweck**: Error Tracking und Performance Monitoring
- **Daten**: Exception-Logs, Performance-Traces, User-Feedback
- **Protokoll**: HTTPS
- **Optional**: Kann deaktiviert werden (SENTRY_ENABLED=false)

**Jaeger / OpenTelemetry**

- **Zweck**: Distributed Tracing für Anfragen über Services
- **Daten**: Spans, Traces, Metriken
- **Protokoll**: OTLP/HTTP (Port 4318)
- **Optional**: Kann deaktiviert werden (OTEL_TRACES_ENABLED=false)

#### Communication

**E-Mail Service**

- **Zweck**: Benachrichtigungen an Benutzer
- **Nutzung**:
  - Passwort-Reset
  - Batch-Job-Completion
  - System-Warnungen
- **Protokoll**: SMTP
- **Konfiguration**: Über ENV-Variablen

---

## 🔐 Sicherheit

### Externe Verbindungen

1. **AI-Provider**:
   - API-Keys über ENV-Variablen
   - HTTPS verschlüsselt
   - Rate Limiting zum Kostenschutz

2. **Monitoring**:
   - Optional aktivierbar
   - DSN/Token-basierte Authentifizierung
   - Keine sensitiven Daten in Traces

3. **E-Mail**:
   - SMTP mit TLS
   - Authentifizierung erforderlich

### Datenschutz

- Lokale AI-Option (Ollama) für GDPR-Compliance
- Keine Personendaten in externen Monitoring-Systemen
- Opt-in für Sentry und Tracing

---

## 🚀 Deployment-Kontext

### Development

- Alle externen Services optional
- Ollama als Standard-AI-Provider
- Lokales Monitoring (optional)

### Production

- Redundante AI-Provider mit Fallback
- Sentry und Jaeger aktiviert
- E-Mail-Service konfiguriert
- Rate Limiting aktiv

---

## 📚 Verwandte Dokumente

- [C4 Level 2: Container Diagram](./C4-LEVEL2-CONTAINER.md)
- [Request Flow Diagram](./REQUEST-FLOW.md)
- [AI-Annotator Data Flow](./AI-ANNOTATOR-FLOW.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)

---

**Letzte Aktualisierung**: Dezember 2024  
**Maintainer**: Thomas Heisig  
**Nächster Review**: März 2025
