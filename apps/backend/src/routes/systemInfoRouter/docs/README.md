# System- & Health-APIs (Backend)

Dieses Modul bündelt zwei Router:

- `health.ts` (Liveness/Readiness/Version)
- `systemInfoRouter.ts` (Routen-, System-, DB-Infos etc.)

Mountpoints (typisch):

- `/api/health` → `health.ts`
- `/api/system` → `systemInfoRouter.ts`

## Health Router

**Statuslogik!**

- `LogicalStatus = healthy | degraded | unhealthy | shutting_down`
- Berechnung via `computeStatus(checks, isShuttingDown)` auf Bool-Flags

**Responses** basieren auf `basePayload` und enthalten u. a. Version, Build-Date, Environment, Uptime, Memory, Checks und Redis-Status.

**Endpoints!**

- `GET /api/health` (Liveness): immer 200; nutzt Checks: `processUp`, `hasOpenAIKey`, `hasAnthropicKey`, `hasOllamaUrl`, `redisConnected`. Bei Fehlern `status = degraded`, aber HTTP 200.
- `GET /api/health/readiness`: 200 bei `healthy`, sonst 503. Gleiche Checks; eignet sich für K8s Readiness.
- `HEAD /api/health`: 204, ohne Body, `Cache-Control: no-store`.
- `GET /api/health/version`: Version/Build/Env-Info (`getVersionInfo()`).

## SystemInfo Router

Alle Routen nutzen `asyncHandler`; App-Auflösung erfolgt über `req.app` oder `global expressApp`.

**Endpoints**
 (Prefix: `/api/system`):

- `/` – Gesamtübersicht (`getCompleteSystemOverview`).
- `/routes` – registrierte Express-Routen (`getRegisteredRoutes`).
- `/database` – DB-Infos (`getDatabaseInfo`).
- `/system` – OS/Prozess-Infos (`getSystemInfo`).
- `/status` – aggregierter Service-Status (`getServiceStatus`), 200/503 abhängig vom DB-Status.
- `/environment` – bereinigte ENV-Variablen (`getSanitizedEnvironment`).
- `/dependencies` – Dependency-Summary (`getDependenciesSummary`).
- `/diagnostics` – erweiterte Checks (`runSystemDiagnostics`).
- `/features` – Backend-Feature-Flags (`getBackendFeatureFlags`).
- `/resources` – Ressourcenauslastung (`getResourceUsage`).
- `/functions` – Funktionskatalog-Kurzform (`getFunctionsSummary`).

## Einsatzempfehlung

- `/api/health` für Liveness/Readiness-Probes und schnelle LB-Checks.
- `/api/system/*` für Admin-/Monitoring-Dashboards und detaillierte Diagnose (größerer Overhead).
