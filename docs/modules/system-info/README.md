System- & Health-APIs

Dieses Modul beschreibt zwei zentrale Router:

Health Router (health.ts) – einfache Liveness/Readiness-Probes

SystemInfo Router (systemInfoRouter.ts) – detaillierte System-, DB- und Service-Informationen

Die exakten Mountpoints hängen von deiner index.ts / app.ts ab, typische Beispiele sind:

app.use("/api/health", healthRouter);
app.use("/api/system", systemInfoRouter);

Im Folgenden wird von diesen Prefixen ausgegangen.

1. Health Router (/api/health)

Der Health-Router stellt minimalistische, aber klar definierte Endpunkte für Kubernetes, Load-Balancer und Monitoring bereit.

1.1 Logischer Status

Intern wird ein logischer Status berechnet:

type LogicalStatus = "healthy" | "degraded" | "unhealthy";

computeStatus(details: Record<string, boolean>): LogicalStatus

healthy – alle Detail-Checks sind true

degraded – mindestens ein Check true, aber nicht alle

unhealthy – alle Checks false

Alle JSON-Antworten basieren auf:

basePayload(status, details) => {
status, // "healthy" | "degraded" | "unhealthy"
timestamp, // ISO-Zeitstempel
version, // aus npm_package_version oder "unknown"
environment, // NODE_ENV oder "development"
uptime, // Sekunden
memory, // process.memoryUsage()
details // Detail-Matrix, s.u.
}

1.2 GET /api/health – Liveness

Zweck: Liveness-Probe – ist der Prozess noch „lebendig“?

Statuscode: Immer 200, auch bei internen Fehlern.

Header: Cache-Control: no-store

Details enthalten u. a.:

const details = {
processUp: true,
hasOpenAIKey: !!process.env.OPENAI_API_KEY,
hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
hasOllamaUrl: !!process.env.OLLAMA_BASE_URL,
};

Beispielantwort:

{
"status": "degraded",
"timestamp": "2025-02-01T12:00:00.000Z",
"version": "1.0.0",
"environment": "development",
"uptime": 1234.56,
"memory": { "...": "process.memoryUsage()" },
"details": {
"processUp": true,
"hasOpenAIKey": true,
"hasAnthropicKey": false,
"hasOllamaUrl": true
}
}

Hinweis: Bei einem Fehler im Handler selbst wird trotzdem 200 zurückgegeben, aber mit status: "degraded".

1.3 GET /api/health/readiness – Readiness

Zweck: Readiness-Probe – sind Kernabhängigkeiten konfiguriert?

Statuscode:

200 wenn status === "healthy"

503 sonst

Header: Cache-Control: no-store

Verwendet dieselben Detail-Flags wie / plus ggf. spätere Checks (z. B. Pings).

Beispielantwort bei fehlenden Keys:

{
"status": "degraded",
"timestamp": "...",
"version": "1.0.0",
"environment": "production",
"uptime": 234.12,
"memory": { "...": "process.memoryUsage()" },
"details": {
"processUp": true,
"hasOpenAIKey": false,
"hasAnthropicKey": false,
"hasOllamaUrl": true
}
}

Bei internen Fehlern:

503 mit status: "unhealthy" und processUp: false.

1.4 HEAD /api/health – schneller Probe

Zweck: Minimaler Probe ohne Body.

Statuscode: 204 No Content

Header: Cache-Control: no-store

Body: leer

Eignet sich z. B. für sehr günstige Load-Balancer-Checks.

2. SystemInfo Router (/api/system)

Der SystemInfo Router liefert erweiterte Informationen über:

Express-App und registrierte Routen

Datenbank

Systemumgebung & Abhängigkeiten

interne Feature-Flags

Ressourcenauslastung

Funktionskatalog-Status

Der Router kapselt alle Zugriffe auf systemInfoService.

2.1 Gemeinsamer Error-Handler

Alle Routen nutzen:

function handleError(res, label, error, status = 500)

loggt einen konsistenten Fehler

gibt JSON zurück:

{ "success": false, "error": "Fehlermeldung" }

2.2 Express-App-Auflösung
function resolveApp(req: Request): Application

Primär über req.app

Fallback: (globalThis as any).expressApp

Erlaubt systemweite Auswertung von Routen, Middleware usw.

2.3 GET /api/system – Systemübersicht

Zweck: Gesamte Systemübersicht aus Sicht des Services.

Ruft systemInfoService.getCompleteSystemOverview(app) auf.

Typische Inhalte (abhängig vom Service):

Registrierte Routen / Module

Datenbankstatus

Feature-Flags

AI/Functions/Services-Status

Antwortstruktur:

{
"success": true,
"data": { "..." : "Overview-Objekt" }
}

2.4 GET /api/system/routes – registrierte Routen

Zweck: Übersicht aller bekannten Express-Routen.

Verwendet intern systemInfoService.getRegisteredRoutes(app).

Spezialfall: Wenn app.\_router.stack noch nicht initialisiert ist, wird einmalig eine Dummy-Route /**init_router** registriert, um den Stack aufzubauen. Falls der Stack danach immer noch nicht verfügbar ist, wird eine Fehlermeldung zurückgegeben.

Antwort (Beispiel):

{
"success": true,
"data": {
"count": 42,
"endpoints": [
{ "method": "GET", "path": "/api/health" },
{ "method": "GET", "path": "/api/system" }
]
}
}

2.5 GET /api/system/database – Datenbankinformationen

Zweck: Liefert DB-Status und ggf. Metriken.

Intern: systemInfoService.getDatabaseInfo().

Beispielstruktur:

{
"success": true,
"data": {
"connected": true,
"client": "postgres",
"database": "erp",
"version": "16.1",
"pool": { "max": 10, "used": 2 }
}
}

2.6 GET /api/system/system – Systeminformationen

Zweck: OS- und Prozessinformationen.

Intern: systemInfoService.getSystemInfo().

Typische Inhalte:

CPU-Kerne

Loadavg

Speicher

Node-Version

Hostname

2.7 GET /api/system/status – aggregierter Service-Status

Zweck: Zusammenfassung verschiedener Subsysteme.

Intern: systemInfoService.getServiceStatus().

Beispielinhalt (abhängig vom Service):

{
"success": true,
"data": {
"database": { "connected": true },
"ai": { "available": true },
"functions": { "loaded": true },
"timestamp": "..."
}
}

2.8 GET /api/system/health – Health-Check (SystemInfo)

Dieser Endpunkt ist getrennt vom Health-Router unter /api/health und basiert auf dem SystemInfo-Service.

Logik:

const status = await systemInfoService.getServiceStatus();
const healthy = status.database.connected;

HTTP-Status:

200 wenn healthy === true

503 sonst

Antwort:

{
"success": true,
"status": "healthy",
"timestamp": "2025-02-01T12:00:00.000Z",
"services": {
"database": true,
"functions": true,
"ai": true
}
}

2.9 GET /api/system/environment – Environment (sanitiziert)

Zweck: Liefert eine bereinigte Sicht auf process.env.

Intern: systemInfoService.getSanitizedEnvironment().

Kritische Daten (z. B. Secrets) werden serverseitig gefiltert.

2.10 GET /api/system/dependencies – Dependencies

Zweck: Übersicht über installierte Abhängigkeiten.

Intern: systemInfoService.getDependenciesSummary().

Beispiel:

{
"success": true,
"data": {
"dependencies": {
"express": "4.19.0",
"pg": "8.11.5"
},
"devDependencies": {
"typescript": "5.7.0"
}
}
}

2.11 GET /api/system/diagnostics – Diagnostics

Zweck: Führen erweiterter Diagnosen aus.

Intern: systemInfoService.runSystemDiagnostics().

Mögliche Inhalte:

Ping auf DB

Testaufruf Functions-Service

AI-Provider-Checks

Latenz-Metriken

2.12 GET /api/system/features – Feature-Flags

Zweck: Liefert Backend-Featureflags (z. B. für UI-Toggles).

Intern: systemInfoService.getBackendFeatureFlags().

Beispiel:

{
"success": true,
"data": {
"audioProcessing": true,
"fileUpload": true,
"workflows": false,
"knowledgeBase": true
}
}

2.13 GET /api/system/resources – Ressourcenauslastung

Zweck: Snapshot der aktuellen Auslastung.

Intern: systemInfoService.getResourceUsage().

Typische Daten:

CPU-Last

RAM-Nutzung

Eventuelle interne Queue-Längen

2.14 GET /api/system/functions – Funktionskatalog (Kurzform)

Zweck: Kurzsummary des Funktionskatalogs für Monitoring / Dashboard.

Intern: systemInfoService.getFunctionsSummary().

Beispiel:

{
"success": true,
"data": {
"loadedAt": "...",
"totalNodes": 180,
"categories": {
"erp_operations": 40,
"audio": 5
},
"warnings": [],
"findings": []
}
}

3. Zusammenspiel

/api/health eignet sich für:

sehr leichte Probes (Liveness/Readiness)

Infrastruktur-Checks ohne tiefe Systemabfragen

/api/system/ liefert:

detaillierte Diagnose für Administratoren

Datenbasis für Admin-UI / Monitoring-Dashboard

DB-, Feature-, Dependency- und Funktionskataloginformationen

Beide Router ergänzen sich:

/api/health → klein, billig, immer verfügbar

/api/system/\* → breitere Sicht, aber schwerer
