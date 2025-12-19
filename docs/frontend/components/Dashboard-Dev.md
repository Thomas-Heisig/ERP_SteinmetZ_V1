# 📘 **Dashboard-Modul – Technische Dokumentation für Entwickler und Administratoren**

Dieses Dokument beschreibt wesentliche technische Aspekte des Dashboard-Moduls, relevante Abläufe, interne Datenflüsse und Hinweise zur Wartung.
Es richtet sich an Personen, die das System erweitern, Fehler analysieren oder den Betrieb sicherstellen müssen.

---

## 1. Systemübersicht

Das Dashboard ist ein Bestandteil der Frontend-Anwendung.
Es dient der Anzeige von Informationen über:

- Nodes der Funktionsdatenbank
- Systemzustände (Health, Status, Ressourcen)
- Kategorien und Navigationsstruktur
- Suchtreffer und dynamisch erzeugte Widgets

Das Modul kommuniziert ausschließlich über definierte Backend-Endpunkte.
Es enthält keine Hardcodierung von Daten.

---

## 2. Technische Architektur

## 2.1 Gliederung des Moduls

Das Dashboard besteht aus den folgenden Hauptbereichen:

| Bereich      | Zweck                                        |
| ------------ | -------------------------------------------- |
| **core**     | globaler Zustand, Actions, Reducer, Provider |
| **features** | Health, Navigation, Suche, Builder, Widgets  |
| **hooks**    | kapselte Geschäftslogik                      |
| **ui**       | Präsentationskomponenten                     |
| **utils**    | Hilfsfunktionen                              |

Diese Aufteilung verhindert gegenseitige Abhängigkeiten und ermöglicht gezielte Anpassungen.

---

## 3. Globaler Dashboard-State

Der Zustand des Dashboards wird zentral im **dashboardReducer** verwaltet.
Zu den wichtigsten State-Bereichen gehören:

- aktuelle Sprache
- Theme
- Health-Status
- Knoten-Informationen
- Navigationshistorie
- Suchparameter
- Builder- und Widget-Status

State-Änderungen erfolgen ausschließlich über definierte Actions, um unkontrollierte Seiteneffekte zu vermeiden.

---

## 4. Backend-Kommunikation

Das Dashboard nutzt verschiedene Endpunkte:

| Endpunkt                | Zweck                                 |
| ----------------------- | ------------------------------------- |
| `/api/system-info`      | Systemdaten, Versionen, Routen        |
| `/api/health`           | Liveness- und Basis-Status            |
| `/api/health/readiness` | Readiness (betriebsbereit oder nicht) |
| Funktionen-Datenbank    | Nodes, Kanten und Metadaten           |

Die Daten werden über spezialisierte Hooks oder Features abgerufen.

---

## 5. Health-Monitoring

Das Gesundheitsmonitoring besteht aus zwei Komponenten:

1. **HealthMonitor** (pollt Backend mit Timer)
2. **HealthMapper** (normalisiert die Response)

Ablauf:

1. Backend-Health wird abgefragt
2. Mapper erzeugt internes Statusmodell
3. Das Modell wird in den globalen State geschrieben
4. UI-Komponenten wie StatusBadges reagieren darauf

Falls der Backend-Check fehlschlägt, erzeugt das System automatisch einen konsistenten Fallback-Status.

---

## 6. Navigation

Die Navigation basiert auf zwei Dateien:

- **NavigationStack.ts**
- **NavigationManager.ts**

Der Stack speichert den Verlauf als einfache Liste.
Der Manager stellt Methoden bereit wie:

- `push(node)`
- `pop()`
- `replace(node)`
- `clear()`

Alle Navigationsaktionen werden über Actions in den Reducer eingespeist.
UI-Komponenten greifen nur indirekt über Hooks darauf zu.

---

## 7. Suche

Das Suchsystem ist getrennt aufgebaut:

- **SearchManager** führt Suchläufe aus
- **SearchFilter** wendet Filter an
- **SearchHelpers** enthalten Utility-Funktionen

Aus Performancegründen sind Matching-Operationen im Suchsystem konzentriert.
Das verhindert redundante Berechnungen im UI.

---

## 8. Dynamische Widgets

Widgets basieren auf der WidgetRegistry.
Der Builder erzeugt aus Grundlage der Node-Metadaten:

- Formulare
- Tabellen
- Karten
- Diagramme
- textuelle Informationen

Die Zuordnung erfolgt deterministisch durch den **WidgetResolver**, der anhand von Node-Eigenschaften Entscheidungen trifft.

---

## 9. Logging und Fehleranalyse

### 9.1 Frontend

Fehler im Dashboard werden primär über:

- Browser-Konsole (React-Fehler, Netzwerkfehler)
- Logging innerhalb beteiligter Hooks und Features

gemeldet.

Der Provider fängt interne Fehler ab und zeigt eine fallback UI an.

### 9.2 Backend

Relevante Log-Quellen:

- Express-Logs im Terminal
- SystemInfo-Service (liefert strukturierten Status über Endpunkte)
- SQLite-Tabellen:
  - `ai_annotations_log`
  - `audit_log`
  - `batch_operations`

Diese Informationen sind nützlich, wenn das Dashboard inkonsistente Daten anzeigt.

---

## 10. Wartung & typische Problemursachen

## 10.1 Health zeigt „unhealthy“

Mögliche Ursachen:

- Backend-Server nicht erreichbar
- Timeout in HealthMonitor
- fehlende Umgebungsvariablen (z. B. Ollama / OpenAI)
- interner Fehler im Backend-Evaluationscode

## 10.2 Navigation reagiert falsch

Mögliche Ursachen:

- falsche Reihenfolge von push/pop
- unvollständige Node-Daten
- invalides Mapping in WidgetResolver

## 10.3 Widgets rendern nicht

Mögliche Ursachen:

- Widget-Typ nicht in Registry eingetragen
- Node-Metadaten unvollständig oder fehlerhaft
- Builder bekommt strukturell unerwartete Daten

## 10.4 Suche liefert unvollständige Ergebnisse

Mögliche Ursachen:

- Filter aktiv, aber nicht sichtbar
- Ranking-Regeln im SearchManager greifen anders als erwartet
- fehlende Normalisierung von Textfeldern

---

## 11. Anpassungen und Erweiterungen

Änderungen sollten folgende Schritte berücksichtigen:

1. neue Typdefinitionen in `types.ts` ergänzen
2. Reducer um Action erweitern
3. die neue Logik in einem Hook oder Feature abbilden
4. UI-Komponenten nur minimal verändern
5. bei Bedarf Registry-Einträge ergänzen

Dieser Ablauf stellt sicher, dass Erweiterungen nachvollziehbar bleiben.

---

## 12. Hinweise zur Zukunftsentwicklung

Folgende Punkte sind gut erweiterbar:

- zusätzliche Widget-Typen
- komplexere Formularstrukturen
- Visualisierung von Beziehungen im NodeGraph
- Integration weiterer System- und Health-Daten
- modulare Erweiterung der Suche
- rollenbasierte Steuerung (RBAC)

Die aktuelle Architektur sieht solche Erweiterungen ausdrücklich vor.

---

## 13. Zusammenfassung

Dieses Dokument bietet eine Übersicht über technische Abläufe des Dashboard-Moduls.
Die Struktur ist darauf ausgelegt, Fehler effizient zu analysieren und Erweiterungen nachvollziehbar umzusetzen.
Komponenten sind klar voneinander getrennt, um Wiederverwendbarkeit und Wartbarkeit sicherzustellen.

---

Wenn du möchtest, kann ich:

✔ eine Version für Endanwender („Wie benutzt man das Dashboard?“) erstellen
✔ Diagramme (Datenfluss + Architektur) ergänzen
✔ eine PDF-Version erzeugen
