📘 Dashboard Router – API Dokumentation

Dieser Router stellt grundlegende System-, Status- und Kontextinformationen für das ERP-/KI-Dashboard bereit.
Er befindet sich unter:

/api/dashboard

Inhaltsverzeichnis

System Health

Dashboard-Übersicht

Kontext / Logs

System Health
GET /health

Liefert technische Laufzeitinformationen des Backend-Systems.

Antwortstruktur
{
"status": "healthy",
"uptime": 12345.123,
"hostname": "server01",
"platform": "linux",
"node_version": "v18.17.0",
"memory": {
"free": "1024 MB",
"total": "32000 MB"
},
"loadavg": [0.12, 0.08, 0.04],
"timestamp": "2025-01-01T12:00:00.000Z"
}

Inhalt

status – Einfacher Health-Check

uptime – Sekunden seit Start des Node-Prozesses

hostname / platform / node_version

Memory-Werte (frei/gesamt)

loadavg – Durchschnittliche CPU-Last (1 / 5 / 15 Minuten)

timestamp

Dashboard-Übersicht
GET /overview

Kombinierter Statusbericht über:

Systemressourcen

ERP-Statistikwerte (Platzhalter)

KI-/Modulstatus

Version des Backend-Pakets

Antwortstruktur
{
"system": {
"uptime": 12345.12,
"cpu": 8,
"loadavg": ["0.12", "0.10", "0.09"],
"memory": {
"free": "1024 MB",
"total": "32000 MB"
}
},
"ai": {
"fallback_config_source": "defaults",
"wiki_enabled": true,
"modules": {
"fallback_ai": true,
"annotator_ai": true,
"rag_ai": false
}
},
"erp": {
"openOrders": 14,
"pendingInvoices": 7,
"stockItems": 1240,
"customers": 328
},
"version": {
"name": "erp-steinmetz",
"version": "1.0.0",
"description": "..."
},
"timestamp": "2025-01-01T12:00:00.000Z"
}

Details
Systemdaten

cpu – Anzahl der CPU-Kerne

loadavg – Durchschnittslast

memory – RAM-Informationen

ERP-Statistik (aktuell Platzhalter)

offene Aufträge

offene Rechnungen

Lagerartikel

Kundenzahl

AI-Modulstatus

Wird dynamisch anhand vorhandener Dateien ermittelt:

Modul Beschreibung
fallback_ai Fallback-KI aktiv
annotator_ai Datei annotator_ai.ts vorhanden
rag_ai Datei rag_ai.ts vorhanden
Version

Liest Daten aus der lokalen package.json.

Kontext / Logs
GET /context

Gibt die letzten Zeilen des Chat-Kontextlogs aus:

Datei: data/chat_context.log

Ausgabe maximal: 10 letzte Logzeilen

Antwortbeispiel
{
"context": [
"User: …",
"AI: …",
"System: …"
]
}

Wenn die Datei nicht existiert:

{
"context": []
}

Zusammenfassung

Der Dashboard-Router deckt drei Kernbereiche ab:

Systemüberwachung

Dashboard-Statusübersicht (System, ERP, KI, Version)

Abruf der letzten Log- bzw. Kontextdaten

Er dient damit als zentrale Informationsquelle für die Verwaltungs- und Überwachungsbereiche im ERP/KI-System.
