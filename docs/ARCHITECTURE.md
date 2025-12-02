# ERP SteinmetZ — Architekturüberblick (Production-Ready Ergänzungen)

Ziel: ERP SteinmetZ zu einer produktionsreifen Plattform ausbauen mit Fokus auf:
- Datenkonsistenz (SAGA, Idempotenz, Versionierung)
- Resilienz & Fehlerbehandlung (Circuit Breaker, Retry, DLQ)
- Compliance (GoBD, GDPR, Audit Trail)
- Observability & Performance (Metriken, Health Checks, Query-Analysis)

1) Kernkomponenten
- API-Gateway (Auth, Rate-Limit, Request-ID)
- Backend-Services (modular, z.B. hr, payroll, billing) — einzelne Services kommunizieren via Events/Commands
- TransactionCoordinator (SAGA Orchestrator) — Orchestrierung lang laufender, verteilter Prozesse
- IdempotencyStore — Verhinderung doppelt ausgeführter Requests
- Postgres (Primärer Datenspeicher) + Replica(s) für Leser
- Materialized Views & Refresh-Strategien
- Audit Trail (GoBD-konform) — Vor/Nach-Zustände
- Monitoring: Prometheus + Grafana, Tracing: OpenTelemetry
- Queue: Kafka oder RabbitMQ (Empfohlener Standard: Kafka für hohe Durchsatzanforderungen)
- Local/Cloud KI-Orchestrierung — Modell-Registry + A/B Testing

2) Datenkonsistenz-Strategie
- Use SAGA Pattern für verteilte Transaktionen (TransactionCoordinator)
- Optimistic Locking: version-nummern in Entities
- Idempotency über request_id + operation_hash
- DSL für Data Integrity Rules (architekturmäßig vorbereitet; Regeln in DB oder Policy-Engine)

3) Resilienz
- Circuit Breaker pro externem System
- Retry-Policies mit exponentiellem Backoff + Jitter
- Dead Letter Queue für nicht verarbeitbare Nachrichten
- Health Checks: aggregierte Abhängigkeiten (DB, Queue, KI-Modelle, Externe APIs)

4) Compliance & Audit
- Audit-Trail-Table mit before/after JSONB, Context, Tags
- Aufbewahrungsfristen, automatische Policies (TTL & Archivierung)
- Vier-Augen-Prinzip (Approval-Flows)

5) Observability & SLOs
- Request tracing (OpenTelemetry)
- Metriken: latencies, error rates, MTTR, model hallucination rate
- Alerts: >1% failed validations, service error budget breaches

6) Deployment
- Docker Compose for local dev
- Kubernetes manifests for production (Blue/Green, Canary)
- DB Migrations with preview + rollback (use Flyway or Liquibase)

7) Phasenplan
- Phase 0 (heute): Implement core SAGA + Idempotency + Audit trail + HealthChecks + basic CircuitBreaker/Retry
- Phase 1: Materialized Views, Monitoring, Compliance workflows, Retention jobs
- Phase 2: KI Orchestration (A/B), Model monitoring, Process versioning
