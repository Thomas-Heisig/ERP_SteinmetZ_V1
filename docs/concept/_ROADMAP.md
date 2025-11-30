Aktueller Stand (benenne ihn so)

Release Name: v0.1.0-alpha (Kickstart)
Kurzbeschreibung: App-Shell steht, Backend läuft, Health-Check integriert. Dev-Setup ist Windows-tauglich (concurrently). BFF-Stubs angelegt.

Was funktioniert:

Frontend (Next 14) startet unter http://localhost:3000.

Backend (Fastify v4) startet; Health: GET /api/health → JSON.

Rewrite im Frontend: /bff/* → 127.0.0.1:4000/* (keine CORS/IPv6-Probleme).

Navigation/Startseite mit Status/Quicklinks/„Nächste Schritte“.

BFF-Stubs vorhanden:

backend/src/bff/hr/index.ts → GET /api/hr/health

backend/src/bff/finance/index.ts → GET /api/finance/health

Fixes umgesetzt:

Wechsel von fastify-cors → @fastify/cors (kompatibel zu Fastify v4).

server.ts aufgeräumt (Root-Redirect, CORS, Logging).

package.json (root) → paralleler Dev-Start, DB-Scripts.

(Optional) Migrationen + Runner vorbereitet (falls eingespielt):
scripts/migrate.mjs, backend/db/migrations/0001_init.sql.

Offene Punkte/Prüfen:

tsconfig-Variante im Backend:

Entweder NodeNext + .js-Endungen in Imports, oder

Bundler + allowImportingTsExtensions + .ts-Endungen.
(Beides funktioniert – wähle eine Linie und bleib konsistent.)

DB-Migrationen wirklich gelaufen? (npm run db:migrate)
Tabellen sollten existieren: core.audit_event, core."case", core.form_instance, core.todo, hr.employee.

Nächstes Vorgehen (konkret & kurz)
Phase A – „laufender Kern“ (heute fertig machen)

CORS final

In server.ts: import cors from "@fastify/cors" (keine Reste von fastify-cors).

Optional: CORS im Dev weglassen (Rewrite macht’s obsolet).

tsconfig festziehen (Backend) – wähle 1 Stil

Empfohlen (NodeNext):
module: "NodeNext", moduleResolution: "NodeNext", Importe mit .js-Endung:

import { registerHR } from "./bff/hr/index.js";


Alternativ (Bundler):
module: "ES2022", moduleResolution: "bundler", allowImportingTsExtensions: true, Importe mit .ts:

import { registerHR } from "./bff/hr/index.ts";


Akzeptanz: npm run -w backend typecheck ohne Fehler.

DB anlegen & migrieren

# falls DB fehlt
psql -h localhost -U erp_user -d postgres -c "CREATE DATABASE erp_steinmetz;"
npm run db:migrate


Akzeptanz: Alle Migrationen angewendet.

Smoke-Test

npm run dev (Root)

Front: Dashboard zeigt Backend ✅

GET /bff/api/hr/health → { ok: true, area: "hr" }

Phase B – HR-MVP „Mitarbeiter anlegen“ (2–4 h)

Ziel: End-to-End durchklickbar, noch ohne Compliance-Ballast.

Schema backend/schemas/hr.employee.v1.json

Tri-State je Feld: known | unknown | not_applicable

Minimal: first_name, last_name, birth_date, email, iban?.

BFF Endpoints (Fastify + zod)

POST /api/hr/employee/validate
→ validiert Tri-State, erzeugt To-Dos (unknown) im Response.

POST /api/hr/employee/save
→ legt core."case" an, core.form_instance speichern (is_valid=true), To-Dos in core.todo anlegen, (später) materialisieren nach hr.employee.

Frontend Mini-Form

Route: frontend/features/hr/routes/employee-new

Form-UI (simpel): Tri-State Toggle + Value-Input, Submit → validate, danach save.

Nach save: Hinweis/Toast „Vorgang gespeichert“, Link zu To-Dos.

Akzeptanzkriterien

100 Validierungsläufe → Schema-Validität ≥ 99 %.

To-Dos entstehen bei unknown.

Audit-Event für form.save geloggt.

Phase C – Dev-Qualität (kurz)

Scripts: check (lint + typecheck) im Root laufen lassen.

Logs: Health/Ready mit Service-Name+Version im Backend.

README: kurze Dev-Anleitung + Ports + Rewrite.

Commands (Ready-to-run)
# 1) Dependencies & Start
npm install
npm run dev

# 2) DB (falls noch nicht)
psql -h localhost -U erp_user -d postgres -c "CREATE DATABASE erp_steinmetz;"
npm run db:migrate

# 3) Backend nur (Debug)
npm run -w backend dev

# 4) Frontend nur
npm run -w frontend dev

Namens-/Branch-Vorschlag

Tag jetzt: v0.1.0-alpha

Branch für HR-MVP: feature/hr-mitarbeiter-anlegen

Commits:

feat(hr): add hr.employee.v1 schema (tri-state)

feat(hr-bff): validate/save endpoints

feat(hr-ui): minimal employee form (tri-state)

test(hr): happy-path & unknown→todo


✅ Bereits erledigt / funktionsfähig

 Grundstruktur App mit App.tsx, Header, Footer, Routing (react-router-dom)

 Theme-System (light, dark, lcars) mit globalen Variablen und Umschalter

 Dashboard-Basislayout (Header, Kategorienübersicht, Suchfeld, QuickChat-Button)

 useFunctionsCatalog-Integration mit Menü-, Node-, Rules- und Root-Ladevorgängen

 Datenanzeige der Nodes (Meta-, Schema-, Arbeitsanweisungs- und Kind-Informationen)

 Breadcrumb-Navigation mit Rückverfolgung über alle Ebenen

 Suchfunktion mit Kategorie- und Funktions-Filter

 Health-Status-Anzeige (online / gestört / fehlerhaft / checking)

 Grund-Styling für Header, Navigation und Theme-Toggle

 Entfernung der Sidebar, Neuordnung der Navigation im Kopfbereich

⚙️ In Arbeit / teilweise umgesetzt

 Widgets-Darstellung für Untergruppen / Funktionen
→ Aktuell einfache Karten, sollen optisch wie „intelligente Module“ wirken.

 Kategoriewechsel im Dashboard (Top-Bar)
→ Navigation funktioniert, Design-Feinschliff offen.

 Suche & Filter-Layout
→ Funktional, benötigt optisch einheitliche Integration in den Header-Block.

 Globale CSS-Harmonisierung
→ Styles aus base.css, dark.css, light.css, lcars.css müssen vereinheitlicht werden.

 Responsive Layout-Anpassung (mobile / Tablet-Ansicht)
→ Noch keine Breakpoints oder Kompaktansicht.

🧠 Geplant / nächste Schritte

 Intelligente Widget-Logik

Erkennung der Node-Art („category“, „group“, „function“)

Automatische Anzeige von Kerninfos → Symbol, Beschreibung, Kinderzahl

 Visuelle Widget-Komponenten (Grid-Layout mit Schatten / Hover-Effekten)

 Einbindung der Meta-Informationen in UI-Elemente

Anzeige von Status, Priorität, Area, Verknüpfungen, Verweisen

 Dynamische Statistiken

Automatische Darstellung, wenn meta.tags oder schema auf „report“ / „stats“ hindeuten

Verwendung einfacher Diagramm-Komponenten (recharts)

🧩 AI-Annotator-Integration

 Service-Verknüpfung zum AI-Annotator

Übergabe der Node-Metadaten an Backend-Service

 Formular-Generierung aus Metadaten / Schema

Dynamische Formulare abhängig von node.schema

 Metadaten-Erzeugung / -Aktualisierung durch Annotator

Schreiben zurück in Meta-Files (nur nach Freigabe)

 Erweiterung um Vorschläge & automatische Klassifizierung

AI schlägt Tags, Area, Priority, Relations vor

🧱 Abschließende Schritte / Projektabschluss

 Gesamtes CSS final konsolidieren

Einheitliche Variablenstruktur, konsistente Buttons, Widgets, Tabellen

 Code-Cleanup

Typdefinitionen vereinheitlichen (NodeDetail, SearchResult, MenuNode)

Entfernen alter Komponenten (Sidebar, Legacy-Hooks)

 Internationalisierung (optional)

Sprachumschaltung DE/EN über rules.locale

 Dokumentation

Kurze Entwickler-Dokumentation (Hooks, Komponenten, Themes, Build)

 Abschließende Review / Stabilitätstest

Test aller Navigations- und Anzeigewege

 Release-Build / Deployment-Konfiguration

🏁 Zielzustand

Ein voll funktionsfähiges, themenadaptives ERP-Frontend, das:

Funktions- und Datenstrukturen aus dem Katalog dynamisch visualisiert,

per KI-Annotator kontextabhängig erweitert und gepflegt werden kann,

einheitlich in allen Themes und Endgeräten dargestellt wird,

und modular erweiterbar bleibt für weitere ERP-Bereiche.

✅ Bereits erledigt / funktionsfähig

 Grundstruktur App mit App.tsx, Header, Footer, Routing (react-router-dom)

 Theme-System (light, dark, lcars) mit globalen Variablen und Umschalter

 Dashboard-Basislayout (Header, Kategorienübersicht, Suchfeld, QuickChat-Button)

 useFunctionsCatalog-Integration mit Menü-, Node-, Rules- und Root-Ladevorgängen

 Datenanzeige der Nodes (Meta-, Schema-, Arbeitsanweisungs- und Kind-Informationen)

 Breadcrumb-Navigation mit Rückverfolgung über alle Ebenen

 Suchfunktion mit Kategorie- und Funktions-Filter

 Health-Status-Anzeige (online / gestört / fehlerhaft / checking)

 Grund-Styling für Header, Navigation und Theme-Toggle

 Entfernung der Sidebar, Neuordnung der Navigation im Kopfbereich

⚙️ In Arbeit / teilweise umgesetzt

 Widgets-Darstellung für Untergruppen / Funktionen
→ Aktuell einfache Karten, sollen optisch wie „intelligente Module“ wirken.

 Kategoriewechsel im Dashboard (Top-Bar)
→ Navigation funktioniert, Design-Feinschliff offen.

 Suche & Filter-Layout
→ Funktional, benötigt optisch einheitliche Integration in den Header-Block.

 Globale CSS-Harmonisierung
→ Styles aus base.css, dark.css, light.css, lcars.css müssen vereinheitlicht werden.

 Responsive Layout-Anpassung (mobile / Tablet-Ansicht)
→ Noch keine Breakpoints oder Kompaktansicht.

🧠 Geplant / nächste Schritte

 Intelligente Widget-Logik

Erkennung der Node-Art („category“, „group“, „function“)

Automatische Anzeige von Kerninfos → Symbol, Beschreibung, Kinderzahl

 Visuelle Widget-Komponenten (Grid-Layout mit Schatten / Hover-Effekten)

 Einbindung der Meta-Informationen in UI-Elemente

Anzeige von Status, Priorität, Area, Verknüpfungen, Verweisen

 Dynamische Statistiken

Automatische Darstellung, wenn meta.tags oder schema auf „report“ / „stats“ hindeuten

Verwendung einfacher Diagramm-Komponenten (recharts)

🧩 AI-Annotator-Integration

 Service-Verknüpfung zum AI-Annotator

Übergabe der Node-Metadaten an Backend-Service

 Formular-Generierung aus Metadaten / Schema

Dynamische Formulare abhängig von node.schema

 Metadaten-Erzeugung / -Aktualisierung durch Annotator

Schreiben zurück in Meta-Files (nur nach Freigabe)

 Erweiterung um Vorschläge & automatische Klassifizierung

AI schlägt Tags, Area, Priority, Relations vor

🧱 Abschließende Schritte / Projektabschluss

 Gesamtes CSS final konsolidieren

Einheitliche Variablenstruktur, konsistente Buttons, Widgets, Tabellen

 Code-Cleanup

Typdefinitionen vereinheitlichen (NodeDetail, SearchResult, MenuNode)

Entfernen alter Komponenten (Sidebar, Legacy-Hooks)

 Internationalisierung (optional)

Sprachumschaltung DE/EN über rules.locale

 Dokumentation

Kurze Entwickler-Dokumentation (Hooks, Komponenten, Themes, Build)

 Abschließende Review / Stabilitätstest

Test aller Navigations- und Anzeigewege

 Release-Build / Deployment-Konfiguration

🏁 Zielzustand

Ein voll funktionsfähiges, themenadaptives ERP-Frontend, das:

Funktions- und Datenstrukturen aus dem Katalog dynamisch visualisiert,

per KI-Annotator kontextabhängig erweitert und gepflegt werden kann,

einheitlich in allen Themes und Endgeräten dargestellt wird,

und modular erweiterbar bleibt für weitere ERP-Bereiche.