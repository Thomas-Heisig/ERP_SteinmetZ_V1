📘 AI Annotator Router – API-Dokumentation

**Version**: 1.0  
**Stand**: Dezember 2025  
**Status**: Production-Ready

Dieses Dokument beschreibt die bereitgestellten API-Endpunkte des AI Annotator Routers.

## 📖 Übersicht

Der AI Annotator Router verarbeitet Funktionsknoten und reichert diese automatisch mit:

- **Metadaten** (Tags, Komplexität, Kategorisierung)
- **Regeln** (Validierung, Business-Logic, RBAC)
- **Formulare** (JSON-Schema, UI-Konfiguration)
- **Qualitätssicherung** (Validierung, Scoring)

Für den vollständigen Workflow siehe: [AI_ANNOTATOR_WORKFLOW.md](../../../../../docs/AI_ANNOTATOR_WORKFLOW.md)
Der Router stellt Funktionen zur Datenannotation, Analyse, Qualitätssicherung und Batch-Verarbeitung bereit.
Alle Routen befinden sich unter:

/api/ai-annotator

Inhaltsverzeichnis

System & Health

Database & Batch Verwaltung

Node Management

Einzeloperationen (Meta/Rule/Form/Validation)

Batch Operations

PII / Validierung

Qualitätsanalyse

Dashboard-Regeln

AI-Modellverwaltung

Error-Correction

Debug-Endpunkte

Templates

Node-spezifische Daten

Erweiterte Funktionen

System & Health
GET /status

Liefert den allgemeinen Systemstatus.

GET /health

Gibt die interne Health-Analyse des Systems zurück.

Database & Batch Verwaltung
GET /database/stats

Gibt Statistiken über gespeicherte Nodes und Annotationen aus.

GET /database/batches?limit=50

Liefert Batch-Operationen aus der Datenbank.

DELETE /database/batches/cleanup?days=30&force=true

Bereinigt alte Batch-Prozesse.
In Produktionsumgebungen ist force=true erforderlich.

Node Management
GET /nodes

Filterbare Abfrage von Nodes.
Unterstützte Parameter:

kinds

status

businessArea

complexity

missingOnly

limit, offset

search

GET /nodes/:id

Gibt genau einen Node zurück (sofern vorhanden).

POST /nodes/:id/validate

Führt eine Validierung des Node aus.

Einzeloperationen (Meta/Rule/Daten/Form)
POST /nodes/:id/generate-meta

Erzeugt Metadaten und speichert sie.

POST /nodes/:id/generate-rule

Erzeugt Regeldefinitionen und speichert sie.

POST /nodes/:id/generate-form

Erzeugt Formularkonfigurationen und speichert sie.

POST /nodes/:id/enhance-schema

Erweitert das Datenschema eines Nodes.

POST /nodes/:id/full-annotation

Kombiniert Meta-Erzeugung, Regelgenerierung, Formularerstellung und Validierung.

Parameter:

includeValidation

parallel

Batch Operations
POST /batch

Erstellt und startet eine Batch-Operation.
Erforderliche Felder:

operation
filters

Default-Optionen werden automatisch gesetzt:

retryFailed

maxRetries

chunkSize

parallelRequests

modelPreference

GET /batch/:id

Liefert einen gespeicherten Batch.

POST /batch/:id/cancel

Setzt einen Batch auf cancelled.

PII & Validierung
POST /classify-pii

Klassifiziert Nodes hinsichtlich personenbezogener Daten.
Body:

{ nodeIds: [], detailed: false }

POST /validate-batch

Validiert mehrere Nodes gleichzeitig.
Berechnet zusätzlich eine aggregierte Zusammenfassung.

Qualitätsanalyse
GET /quality/report

Erstellt einen Bericht über:

Annotationstatus

Modell-Qualität

Fehlerquoten in Batches

Empfehlungen basierend auf Statistiken

Dashboard-Regeln
GET /rules?type=...&widget=...&includeNodes=true

Gibt Regeldefinitionen strukturiert nach:

type

widget
zusätzlich:

Zuordnung der Nodes zu den Regeltypen

AI-Modellverwaltung
GET /ai/models

Liefert Modellstatistiken.

POST /ai/optimize

Optimierung der Modellkonfiguration.

GET /ai/model-stats

Alternative Ausgabe von Modellstatistiken.

Error Correction
GET /error-correction/config

Liest die aktuelle Fehlerkorrektur-Konfiguration aus.

PUT /error-correction/config

Aktualisiert die Fehlerkorrektur-Einstellungen.
Nicht verfügbar in Produktionsumgebungen.

Debug-Endpunkte

Alle Debug-Funktionen sind nur außerhalb von Production verfügbar.

POST /debug/prompt

Gibt generierte KI-Prompts für einen Node zurück.
Unterstützte Typen:

meta

rule

form

simple

correction

POST /debug/ai-test

Testet die KI-Verbindung mit einem einfachen Prompt.

Batch Templates
GET /batch-templates

Gibt vorbereitete Batch-Vorlagen zurück:

quick_annotation

full_annotation

pii_scan

quality_check

Node-spezifische Daten
GET /nodes/:id/meta

Liefert Metadaten.

GET /nodes/:id/rule

Liefert Regeldefinition.

GET /nodes/:id/form

Liefert Formulardefinition.

GET /nodes/:id/schema

Liefert gespeichertes Schema.

GET /nodes/:id/analysis

Liefert technische Analyse:

Komplexität

Integrationspunkte

Business-Zuordnung

PII-Klassifikation

GET /nodes/:id/quality

Liefert qualitätsbezogene Metriken des Nodes.

Erweiterte Funktionen
POST /system/optimize

Optimiert globale Einstellungen.

POST /bulk-enhance

Verbessert mehrere Nodes gleichzeitig (Meta, Rule, Form).

GET /system/monitoring

Kombinierter Systemstatus:

Health

Modelle

Datenbank

POST /ai/model-selection-test

Testet den Modellselektor (nur außerhalb Production).

Abschluss

Dieses Routing-Modul deckt folgende Hauptbereiche ab:

Node-Verwaltung und Annotation

Validierung und Qualitätskontrolle

Batch-Verarbeitung

AI-Modellanalyse

Debugging

System- und Health-Monitoring
