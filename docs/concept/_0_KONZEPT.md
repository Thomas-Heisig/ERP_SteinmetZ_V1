🧭 ERP SteinmetZ – Konzeptfassung

Einleitung (kurz):
Ziel ist ein instruction-driven ERP, in dem fachliche Abläufe als Arbeitsanweisungen (AA/DSL) und JSON-Schemas beschrieben sind. Eine KI-Schicht moderiert Eingaben und ruft deterministische Services auf (Persistenz, Nummernkreise, Steuern, RBAC). Navigation und Dashboards entstehen regelbasiert aus Modul-Manifesten. RAG wird ausschließlich für Text-/Webquellen genutzt; Kernzahlen werden deterministisch berechnet. Nachfolgend die strukturierte Konzeptfassung – ohne Code, mit klaren Leitplanken und messbaren Kriterien.

1. 🎯 Zielbild & Geltungsbereich

Instruction-driven ERP: Fachprozesse als Arbeitsanweisungen (AA/DSL) + JSON-Schemas.

KI moderiert, deterministische Services führen aus (Persistenz, Nummernkreise, Steuern, RBAC, Fristen).

Automatische Navigation/Dashboards aus Manifesten und Regeln.

RAG nur für Texte/Web; Kernzahlen ausschließlich deterministisch.

2. 🧱 Kernarchitektur (Monorepo)

Frontend: React/Next.js (App-Shell, KI-Drawer „Wie kann ich helfen?“, Formular-Dialoge, Progress-Banner).

Backend: Node (ein API-Service), BFF-Routen je Modul; Validierung/Maskierung serverseitig.

Datenbank: Postgres (Schemas core, hr, finance), Event/Audit-Store (append-only), verschlüsselte Dokumentenablage.

Modularität in der DB: Module als Manifeste (Capabilities, Widgets, RBAC, i18n) versioniert.

Mehrsprachigkeit: i18n-Kataloge pro Modul, Fallback-Sprache, Linting/CI für Übersetzungen.

Deterministischer Kern: Nummernkreise, Steuer/XRechnung/ZUGFeRD, Fristen, GoBD-Journal, RBAC – testbar, nachvollziehbar.

3. 🧭 Navigation & 📊 Dashboards (regelbasiert)

Menüstruktur: JSONLogic-Regeln platzieren Einträge deterministisch; Preview/Approval vor Commit.

Unter-Dashboards: Widgets aus Manifesten; Ranking nach Score (Priorität, Nutzung, Kritikalität, Aktualität).

Beweis: Snapshot-Tests – gleiches Manifest ⇒ gleicher Navigations/Dashboard-Plan.

4. 🗂️ Daten & 📐 Schemata

JSON-Schemas für alle Formulare (Renderer + serverseitige Validierung).

Tri-State je Feld: known | unknown | not_applicable; unknown ⇒ To-Do (kein „N/A“ als Wert).

Feld-Registry: Zusatzfelder mit Typ, RBAC, PII-Klasse, Retention; Lebenszyklus proposed → active → deprecated → archived; Linting + Approval.

Event/Audit: Prompt/Antwort-Hashes, Validator-Berichte, DB-Diffs; Unveränderbarkeit nach „sent/posted“.

5. 🤖 KI-Orchestrierung & ⤴️ De/Eskalation

Stufenmodell

Router/Klassifizierer (≤3B): Pfadwahl (SQL vs. RAG vs. Web).

Orchestrator (≈7B): Dialog, Schema-gebunden, Tool-Calls.

Fallback (≈14B): längere Formdialoge/schwierigere Validierungen.

Consultant via Ollama (größtes lokal tragbares Instruct-Modell): Beratungsmodus, liefert JSON-Pläne, keine direkten Writes/Versände.

Regelgeführte Eskalation: objektive Gates (≥2 Schema-Fails, niedrige Tool-Konfidenz, schlechter RAG-Recall); De-Eskalation zur lokalen Ausführung.

Redaktion/Maskierung vor Eskalation: PII-Filter (keine Bank/Payroll-PII), Platzhalter-Mapping on-prem.

Session-Memory: externer Sitzungszustand (Facts/To-Dos/Entscheidungen), Turn-Summaries; verhindert „Vergessen“.

6. 🔎 RAG & 🌐 Recherche

Einsatzgebiet: interne Dokumente (PDF, Mails, Handbücher) + Web-Quellen.

Pipeline: Hybrid Retrieval (BM25 + Vektor) → Reranking → Zitate Pflicht; Metadaten-Filter (Rolle, Mandant, Gültigkeit).

Preisvergleich/Großhandel: Fetcher → Tabellen-Extraktion/Einheiten-Normierung (Netto/Brutto, Staffel) → Vergleichstabelle → Freigabe vor externem Versand.

7. 🔄 Prozesse & Workflows

AA/DSL: Schritte, Freigaben, Policies je Prozess (z. B. Onboarding, Rechnung).

Freigabe-Gates: z. B. Finance/HR vor kritischen Aktionen.

Zustandsautomaten: Case, Invoice, Field-Def – klare Transitionen (z. B. draft → validated → sent).

8. 🌙 Nachtläufe & ⚙️ Automatisierung

Job-Queue:

data_validation (IBAN, Dubletten, Pflichtfelder, Status-Widersprüche),

report_daily (Kennzahlen deterministisch; KI nur Zusammenfassung),

todo_followup (Erinnern/Eskalieren),

search_index (RAG-Rebuild).

Keine stillen Direkt-Writes: Patches nur mit Schwellen/Approval.

9. 🔐 Sicherheit & ⚖️ Compliance

RBAC/ABAC inkl. Feld-Maskierung; Server-Checks unabhängig von Navigation.

DSGVO: PII-Klassifikation pro Feld, Aufbewahrungsregeln, Löschläufe, Verschlüsselung „at rest“ & „in transit“.

GoBD: lückenlose Nummernkreise, Unveränderbarkeit nach Versand/Buchung, Storno/Gutschrift statt Überschreiben.

DLP: Domain-Allowlist für Web-Zugriffe; keine Geheimnisse/PII an Fremdsysteme ohne AV-Vertrag.

10. 📏 Qualität & Nachweise (Abnahmekriterien)

Schema-Validität ≥ 99,5 % (1 000 Testruns/Prozess).

Tool-Call-Korrektheit ≥ 99 %.

Rückfragenquote (bereits bekannte Felder) ≤ 1 %.

RAG: Recall@5 ≥ 0,8; Zitatabdeckung ≥ 0,95.

Ollama-Stufe: JSON-Plan-Validität ≥ 99,5 %; Latenz innerhalb definierter Gates.

Nummernkreis 100 %; XRechnung/ZUGFeRD 100 % validiert.

Navigation: identisches Manifest ⇒ identischer Plan (Snapshot-Tests).

Security: 0 unautorisierte Tool-Calls; 0 PII-Lecks in Redaktions-Tests.

11. 🧩 Governance & 🛠️ Betrieb

Versionierte Manifeste/Regeln mit Preview-Diff & Approval; Rollback-Pfad.

Observability: Logs, Traces, Metriken; Feature-Usage-Telemetrie (Widget-Ranking).

Feature-Flags & Shadow-Mode für neue KI-Stufen/Regeln; kontrollierter Rollout.

12. 📦 Erweiterbarkeit & 📈 Skalierung

Module als Pakete (Front+Back-Logik) im Monorepo; BFF-Routen in einem API-Service.

Gezieltes Herauslösen eines Moduls zu eigenem Service nur bei Bedarf (Regulatorik/Skalierung); Verträge/Tests bleiben gleich.

Mehrsprachigkeit nachrüstbar: neue Locale-Datei + Linting + CI-Checks.

Performanz: Materialized Views, Caching, asynchrone Jobs, Modell-Quantisierung.

13. 🗺️ Projektphasen (MVP → Ausbau)

Fundament (2–3 Wo.): Case/Session, Form-Renderer, JSON-Schemas, To-Dos, Audit, RBAC.

HR-MVP (2–3 Wo.): „Mitarbeiter anlegen“ E2E inkl. Bank-Validierung; erste Dashboard-Kacheln.

Finance-MVP (2–3 Wo.): Rechnung E2E (Nummernkreis, PDF/XRechnung, Versand, Mahnwesen).

Automatik (2 Wo.): Job-Queue, nightly Validation/Reports; Manifest → Menü/Dashboard.

RAG & Web (2 Wo.): Dokumenten-RAG mit Zitaten; Preisvergleich-Toolchain.

De/Eskalation via Ollama (1–2 Wo.): Consultant-Pläne, Redaktion/Policy; Shadow-Mode → Live.

14. ⚠️ Risiken & 🚧 Gegenmaßnahmen

Schema-Wildwuchs → Feld-Registry + Linting + Approval + Deprecation-Pfad.

Halluzinationen → JSON-only-Ausgaben, niedrige Temperatur, Tool-Whitelist, strikte Validierung.

Menü-Unordnung → Regel-Limits (Tiefe/Anzahl), „Weitere“-Gruppen, Preview/Approval.

Rechtsänderungen → Regeln/Validatoren außerhalb des Modells; automatisierte Regressionstests.

Performance-Engpässe → Indizes/Views, Caching, Batch-Jobs, Quantisierung; Eskalations-Stufe nur bei Bedarf.

Drittanbieter-Abhängigkeiten → AV-Verträge, No-Retention, EU-Region; Fallback auf lokale Stufen.

15. 🔎 Offene Punkte & Annahmen

Lizenz/Lokalisierung für XRechnung/ZUGFeRD-Validatoren.

Rollenmodell finalisieren (HR, Payroll, Finance, Management, Audit).

Datendrehscheibe (E-Mail/Import Alt-Systeme): Formate, Mappings, Testdaten.

Hardware-Budget für LLM-Stufen (7B/14B + größte Ollama-Variante, quantisiert).

Zeitstempel/Zeitzonen: Strategie (UTC intern, Anzeige lokal).
