📘 Functions Catalog Router – API Referenz

**Version**: 1.0  
**Stand**: Dezember 2025  
**Status**: Production-Ready  
**Funktionsknoten**: 15.472

Dieser Router kapselt sämtliche Endpunkte rund um den FunctionsCatalogService.

## 📖 Übersicht

Der Functions Catalog ist die zentrale Datenquelle für alle ERP-Funktionen. Er verwaltet:

- **15.472 Funktionsknoten** aus 11 Geschäftsbereichen
- Hierarchische Struktur (Kategorien, Gruppen, Einzelfunktionen)
- Metadaten (RBAC, PII-Level, Komplexität, Tags)
- Regeln und Validierungen
- Volltext-Suche mit Facetten

Für die Transformation von Funktionsknoten zu ausführbarem Code siehe:
[FUNCTION_NODE_TRANSFORMATION.md](../../../../../docs/FUNCTION_NODE_TRANSFORMATION.md)
Er deckt Index-Building, Caching, Suche, Datei-Import, Menü-Generierung und Validierungen ab.

Pfadpräfix:

/api/functions

Inhaltsverzeichnis

Grundlagen

Regel-Snapshot

Index neu laden

Kompletter Index

Menügenerierung

Quelldateien

Lint-Ergebnisse

Node-Details

Node-Kinder

Suche

JSON-Dateien hinzufügen

Persistieren in DB

Root-Dashboard

Validierung & Fehlerbehandlung

Grundlagen

Der Router nutzt den Service:

FunctionsCatalogService

Der Service verwaltet:

Caching des Funktionskatalogs

Inkrementelles Laden von JSON-Dateien

Linting

Menübildung (RBAC + Features + Area)

Suche (inkl. Pagination)

Baumstruktur & Kind-Knoten

Rule-Snapshots

Zod wird verwendet, um Eingaben abzusichern.

Fehler werden über einen zentralen Logger (pino) erfasst.

1️⃣ Regel-Snapshot – GET /rules

Gibt alle Modell-Regeln aus, wie sie im Cache liegen.

Beispielantwort
{
"success": true,
"rules": {
"groups": {...},
"validation": {...}
}
}

2️⃣ Index neu aufbauen – POST /reload

Erzwingt ein vollständiges Neuladen aller Funktionskatalog-Dateien.

Antwort
{
"success": true,
"loadedAt": "2025-02-01T12:00:00.000Z",
"findings": [...],
"warnings": [...]
}

3️⃣ Funktions-Index – GET /index
Query-Parameter
Parameter Typ Beschreibung
strict=1 boolean Erzwingt Neubuild statt Cache
flat=1 boolean Ausgabe nicht verschachtelt
kinds=... CSV Filtert Knoten anhand kind
Verhalten

Ohne Parameter → vollständiger Baum.

Mit strict=1 → frische Indizierung.

Mit kinds=... → Teilbaum.

Beispielantwort (gekürzt)
{
"success": true,
"nodes": [...],
"loadedAt": "2025-02-01T12:00:00.000Z"
}

4️⃣ Menü-Erstellung – POST /menu

Validiert Eingaben über Zod.

Body
{
"roles": ["admin", "editor"],
"features": ["ai", "erp"],
"area": "dashboard"
}

Antwort
{
"success": true,
"menu": [...],
"loadedAt": "2025-02-01T12:00:00.000Z"
}

5️⃣ Liste aller Quellen – GET /files

Liefert alle JSON- oder Metadaten-Quelldateien, aus denen der Katalog besteht.

6️⃣ Lint-Findings – GET /lint

Prüft alle geladenen Funktionen:

Strukturfehler

fehlende Felder

widersprüchliche Typen

7️⃣ Einzelknoten – GET /nodes/:id

Gibt Struktur, Breadcrumbs, Kind-Infos (falls vorhanden).

Wenn id unbekannt → Status 404.

Antwort
{
"success": true,
"node": { ... }
}

8️⃣ Kinder eines Knotens – GET /nodes/:id/children

Optional mit Filter:

?roles=admin,user&features=ai

Antwort
{
"success": true,
"children": [...],
"breadcrumbs": [...]
}

9️⃣ Volltext-Suche – GET /search

Validiert über Zod.

Query-Parameter
Parameter Typ Bemerkung
q string Volltext
kinds CSV Filter
tags CSV Tags lowercased
area string Bereich
limit int Pagination
offset int Pagination
Antwort
{
"success": true,
"results": {
"items": [...],
"total": 42,
"limit": 10,
"offset": 0
}
}

🔟 JSON-Dateien hinzufügen – POST /add-files

Erlaubt inkrementelles Hinzufügen neuer JSON-Definitionen.

Body
{
"files": ["new/functions/custom1.json"]
}

Antwort
{
"success": true,
"loadedAt": "...",
"stats": {...},
"findings": [...],
"warnings": [...]
}

11️⃣ Katalog in DB persistieren – POST /persist

Schreibt den aktuellen Funktionskatalog in die Datenbank (Upsert).

Antwort
{
"success": true,
"inserted": 120,
"updated": 20
}

12️⃣ Root-Endpoint – GET /

Zusammenfassung aus mehreren Service-Ausgaben:

Voller Index

Kategorien

Findings

Warnings

Beispielantwort
{
"success": true,
"data": {
"loadedAt": "...",
"nodes": [...],
"categories": {...},
"warnings": [...],
"findings": [...]
}
}

Validierung & Fehlerbehandlung

Zod validiert alle Eingaben:

/menu

/search

/add-files

asyncHandler fängt Fehler in Promises ab.

Der Logger (pino) protokolliert alle Fehler mit:

Quelle

Fehlermeldung

Meta-Daten

Zusammenfassung

Der Router stellt alle notwendigen Endpunkte bereit, um:

Funktionskataloge zu laden, zu filtern und zu durchsuchen

Regeln, Lint-Warnings und Quellen auszuwerten

Menüs dynamisch zu generieren

JSON-Dateien inkrementell einzufügen

Ergebnisse in die Datenbank zu übertragen

Ein Dashboard-freundliches Root-Summary bereitzustellen

Die Struktur ist vollständig kompatibel mit Caching, Pagination und Streaming-Parsing im FunctionsCatalogService.
