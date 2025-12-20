# System Diagnose Dashboard

Ein umfassendes, echtzeit Monitoring- und Diagnose Dashboard für das ERP SteinmetZ Backend System.

## 📋 Übersicht

Das Dashboard bietet eine zentrale Schnittstelle zur Überwachung aller Systemkomponenten und Dienste des ERP-Systems. Es verbindet sich direkt mit den echten Backend-APIs und zeigt Live-Daten ohne Mock-Daten an.

## 🚀 Features

### Echtzeit-Monitoring

- **Health Status** - Gesamtstatus des Systems mit detaillierten Prüfungen
- **Service Status** - Status aller kritischen Services (Datenbank, AI, Functions)
- **System Information** - CPU, Memory, Uptime, Node.js Version
- **Database Statistics** - Tabellenanzahl, Datensatzanzahl, Datenbanktyp
- **Performance Metrics** - Heap-Speicher, CPU-Auslastung, Ressourcennutzung

### Detaillierte Informationen (Tab-basiert)

- **🛣️ Routes** - Alle registrierten API-Endpunkte gruppiert nach HTTP-Methode
- **💾 Resources** - RAM-Auslastung, CPU-Prozentsatz, Systemuptime
- **🔧 Environment** - Umgebungsvariablen und Konfigurationswerte
- **📦 Dependencies** - Installierte NPM-Pakete mit Versionen
- **🔍 Diagnostics** - Systemdiagnosen, Scheduler-Status, Speicherinformationen
- **⚙️ Functions** - Funktionskatalog mit Status und Kategorien

### Zusätzliche Features

- **Auto-Refresh** - Automatische Datenaktualisierung alle 30 Sekunden
- **Manuelle Aktualisierung** - Sofortiges Laden aller Daten
- **Session-Management** - Sichere Admin-Authentifizierung
- **Responsive Design** - Optimiert für Desktop und mobile Geräte
- **Farbcodierte Status** - Grün (✅), Orange (⚠️), Rot (❌)

## 🔐 Authentifizierung

Das Dashboard nutzt einfache Admin-Authentifizierung:

**Credentials:**

```code
Benutzername: admin
Passwort: admin123
```

Diese werden in `sessionStorage` gespeichert und sind lokal auf dem Browser beschränkt.

## 🏗️ Architektur

### Dateien

```l
systemDashboard.html    - HTML-Struktur und Login-Seite
systemDashboard.css     - Styling und responsive Design
systemDashboard.js      - Logik, API-Integration und Rendering
README.md              - Diese Datei
```

### API-Endpunkte

Das Dashboard nutzt folgende Backend-Endpunkte:

#### System Info API (`/api/system/`)

- `GET /api/system/` - Vollständige Systemübersicht
- `GET /api/system/status` - Service-Status
- `GET /api/system/system` - Systeminformationen (Node.js, OS, etc.)
- `GET /api/system/database` - Datenbankinformationen und Tabellenstatistiken
- `GET /api/system/health` - Health-Check Status
- `GET /api/system/resources` - Ressourcenauslastung
- `GET /api/system/environment` - Umgebungsvariablen
- `GET /api/system/dependencies` - Abhängigkeitsübersicht
- `GET /api/system/features` - Feature-Flags und Konfigurationen
- `GET /api/system/routes` - Alle registrierten Routes
- `GET /api/system/functions` - Funktionskatalog

#### Diagnostics API (`/api/diagnostics/`)

- `GET /api/diagnostics/health` - Erweiterte Health-Checks
- `GET /api/diagnostics/api` - Vollständige Diagnostics-Informationen
- `GET /api/diagnostics/system` - Detaillierte Systemdiagnosen

## 🎨 Dashboard-Komponenten

### Übersichtsbereich (Overview Grid)

4 Hauptkarten zeigen die wichtigsten Metriken:

1. **Health Card** - Gesamtstatus mit einzelnen Checks
2. **Service Status Card** - Datenbank, AI, Functions Status
3. **System Info Card** - CPU, Memory, Uptime
4. **Database Card** - Tabellenübersicht

### Erweiterte Tabs

6 Tab-Reiter mit detaillierten Informationen:

| Tab | Inhalt |
|-----|--------|

| Routes | API-Endpunkte gruppiert nach HTTP-Methode |
| Resources | Speicher, CPU, Auslastungsprozentsätze |
| Environment | Konfigurationsvariablen und Settings |
| Dependencies | Installierte Packages und Versionen |
| Diagnostics | System-Checks, Scheduler-Info |
| Functions | Funktionskatalog mit Status |

## 📊 Datenaktualisierung

Das Dashboard lädt Daten parallel mit `Promise.allSettled()`:

```javascript
// Parallel laden aller Endpoints
const [health, services, system, database, ...] = 
  await Promise.allSettled([
    fetchAPI(`${DIAGNOSTICS_BASE}/health`),
    fetchAPI(`${API_BASE}/status`),
    // ... weitere APIs
  ]);
```

### Auto-Refresh

- **Standard-Intervall:** 30 Sekunden
- **Togglebar:** ⏱️ Button zum An/Ausschalten
- **Nicht blockierend:** Asynchrone Updates ohne UI-Freeze

## 🎯 Status-Indikatoren

### Farbcodierung

```legend
✅ Grün   = Healthy/Verfügbar/OK
⚠️ Orange = Warning/Caution
❌ Rot    = Error/Nicht verfügbar
```

### Status-Badges

Überall im Dashboard verwendete Badges:

- `status-healthy` - Grüner Hintergrund
- `status-warning` - Oranger Hintergrund
- `status-danger` - Roter Hintergrund

## 🔧 Entwicklung & Anpassung

### Neue Tabs hinzufügen

1. Tab-Button in HTML hinzufügen:

```html
<button class="tab-button" data-tab="new-tab">📌 New Tab</button>
```

2. Tab-Content-Div erstellen:

```html
<div id="new-tab" class="tab-content">
  <div id="new-content" class="loading">Loading...</div>
</div>
```

3. Display-Funktion in JavaScript:

```javascript
function displayNewFeature(data) {
  const content = document.getElementById("new-content");
  // Rendering logic
}
```

4. In `loadAllData()` API-Call hinzufügen:

```javascript
const [existing, newData] = await Promise.allSettled([
  // ...
  fetchAPI(`/api/new-endpoint`),
]);
displayNewFeature(extractData(newData));
```

### Backend-Integration

Das Dashboard erwartet folgende JSON-Antwortstruktur:

```typescript
// Standard Response Format
{
  success: true,
  data: {
    // Actual data here
  }
}

// Alternative Format
{
  data: {
    // Direct data
  }
}
```

## 📱 Responsive Design

Das Dashboard passt sich verschiedenen Bildschirmgrößen an:

```css
/* Desktop: Mehrspaltiges Grid */
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

/* Mobile: Single Column */
@media (max-width: 768px) {
  grid-template-columns: 1fr;
}
```

## 🚨 Fehlerbehandlung

Das Dashboard verarbeitet Fehler elegant:

```javascript
// Parallel Promise Loading
const results = await Promise.allSettled([...]);

// Fehlerhafte Requests zeigen "data unavailable"
if (result.status === "rejected") {
  content.innerHTML = '<div class="error">Data unavailable</div>';
}
```

## 🔐 Security

### Authentifizierung

- Session-basiert mit `sessionStorage`
- Logout löscht die Session und lädt Seite neu
- Backend-Token wird benötigt für `/api/system` Zugriffe (via Middleware)

### Datenscutz

- Keine sensiblen Daten werden direkt in HTML angezeigt
- Umgebungsvariablen sind gekürzt auf 100 Zeichen
- Logs und Audit-Daten sind optional

## 🐛 Troubleshooting

### Dashboard lädt nicht

1. Backend muss laufen: `npm run dev`
2. Port muss stimmen (Standard: 3000)
3. Browser-Konsole auf Fehler überprüfen

### Daten werden nicht aktualisiert

1. Auto-Refresh Button überprüfen
2. Network-Tab in Dev-Tools prüfen auf 404/500 Fehler
3. Backend-Logs ansehen: `/api/system/` Responses

### CORS-Fehler

Das Dashboard wird von denselben Backend Server geladen, daher sollte es keine CORS-Probleme geben.

## 📈 Performance

- **Parallele Requests:** ~12 Endpoints gleichzeitig
- **Rendering:** < 100ms für komplette UI
- **Memory:** ~5-10 MB bei normaler Last
- **Update-Zeit:** ~2 Sekunden für komplette Refresh

## 📚 Weitere Ressourcen

- [Backend System Info Router](../systemInfoRouter/)
- [Backend Diagnostics Router](../diagnostics/)
- [API Documentation](../../docs/)

## 🎓 Beispiele

### Ein neues Metrics-Widget hinzufügen

```javascript
// In HTML
<div class="card">
  <div class="card-header">
    <span class="card-icon">📈</span>
    <h2 class="card-title">New Metric</h2>
  </div>
  <div id="new-metric-content" class="loading">Loading...</div>
</div>

// In JavaScript - Display Function
function displayNewMetric(data) {
  const content = document.getElementById("new-metric-content");
  if (!data) {
    content.innerHTML = '<div class="error">Metric unavailable</div>';
    return;
  }
  
  content.innerHTML = `
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-value">${data.value}</div>
        <div class="metric-label">Unit</div>
      </div>
    </div>
  `;
}

// In loadAllData()
const newMetric = await Promise.allSettled([
  fetchAPI(`/api/metric/endpoint`)
]);
displayNewMetric(extractData(newMetric));
```

## 📝 Lizenz

SPDX-License-Identifier: MIT

## 👥 Support

Bei Fragen oder Problemen mit dem Dashboard siehe:

- Backend-Logs: `apps/backend/logs/`
- API-Dokumentation: `docs/API*.md`
- System-Router: `src/routes/systemInfoRouter/`
