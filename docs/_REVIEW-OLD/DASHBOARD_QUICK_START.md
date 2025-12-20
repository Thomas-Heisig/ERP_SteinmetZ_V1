# 🚀 System Diagnose Dashboard - Quick Start Guide

**Schnelleinstieg in 5 Minuten**

---

## 1️⃣ Backend starten

```bash
cd F:\ERP_SteinmetZ_V1
npm run dev
```

**Erwartete Ausgabe**:
```
[dev:backend] 🚀 Backend Server Ready
[dev:backend] Dashboard: http://localhost:3000/
[dev:backend] System API: http://localhost:3000/api/system
```

> ⏱️ Dauert ca. 10-15 Sekunden beim ersten Start

---

## 2️⃣ Dashboard öffnen

Öffne in Browser:
```
http://localhost:3000/
```

---

## 3️⃣ Anmelden

**Login-Anmeldedaten**:
- **Benutzername**: `admin`
- **Passwort**: `admin123`

> Die Felder sind bereits vorausgefüllt!

---

## 4️⃣ Dashboard erkunden

### Übersicht-Karten (oben)
- 🏥 **Health Status** - Systemgesundheit
- ⚙️ **Services** - Service-Status (DB, AI, Functions)
- 💻 **System Info** - Node, OS, Uptime, CPU
- 🗄️ **Database** - Tabellen und Zeilen

### Registerkarten (unten)
Klick auf die Tabs um verschiedene Informationen zu sehen:

1. **Routes** 🛣️ - Alle API-Endpoints
2. **Resources** 📊 - Memory/CPU Auslastung
3. **Environment** 🔧 - Konfigurationsvariablen
4. **Dependencies** 📦 - Installierte NPM-Pakete
5. **Diagnostics** 🔍 - Systemdiagnosen
6. **Functions** ⚙️ - Funktionenkatalog

---

## 5️⃣ Features nutzen

### 🔄 Daten aktualisieren
Klick auf den grünen Button: **🔄 Jetzt aktualisieren**

### ⏱️ Auto-Refresh aktivieren
Klick auf: **⏱️ Auto-Refresh**

Die Daten aktualisieren sich dann automatisch alle 30 Sekunden.

### 📋 Tabs durchsuchen
- Klick auf die Tab-Namen um zwischen Ansichten zu wechseln
- Scrolle in den Tabellen um alle Einträge zu sehen
- Hover über Status-Badges für Details

---

## 🔍 Was du sehen solltest

### Routes Tab - Beispiel
```
GET     /api/system/           ✅
POST    /api/projects          ✅
PUT     /api/users/:id         ✅
DELETE  /api/archive/:id       ⚠️
PATCH   /api/config            ✅
```

### Resources Tab - Beispiel
```
Memory Usage:    65%  ████████░░
CPU Usage:       32%  ███░░░░░░░
Heap Usage:      58%  █████░░░░░
Available RAM:   512 MB
```

### Diagnostics Tab - Beispiel
```
✅ Database Connection: OK (52ms)
✅ Memory Leak Check: PASS
✅ Response Time: <100ms
⚠️ Disk Space: 85% used
✅ Scheduler Status: Running
```

---

## 🟢 Status-Farben

| Farbe | Bedeutung |
|-------|-----------|
| 🟢 Grün | Everything OK |
| 🟡 Orange | Achtung erforderlich |
| 🔴 Rot | Fehler |

---

## 🐛 Troubleshooting

### Dashboard lädt nicht
```
1. Backend läuft? → npm run dev
2. Port 3000 frei?
3. Browser-Konsole überprüfen (F12)
```

### Login funktioniert nicht
```
Verwende EXAKT:
- Benutzer: admin
- Passwort: admin123
```

### APIs zeigen Fehler
```
1. Terminal überprüfen auf Backend-Fehler
2. Browser-Konsole auf API-Fehler checken
3. http://localhost:3000/api/system/health direkt aufrufen
```

---

## 📚 Weitere Dokumentation

- **Ausführliche Doku**: [DASHBOARD_README.md](apps/backend/src/views/DASHBOARD_README.md)
- **Completion Report**: [DASHBOARD_COMPLETION_REPORT.md](DASHBOARD_COMPLETION_REPORT.md)
- **Architekturdoku**: [ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🎯 Nächste Schritte

1. ✅ Dashboard öffnen und erkunden
2. ✅ Alle Tabs durchschauen
3. ✅ Auto-Refresh testen
4. ✅ API-Endpoints überprüfen
5. ✅ System-Status überwachen

---

## 💡 Tipps & Tricks

### Tipps
- 🔐 Login-Daten sind nur für Development (ändern in Production!)
- 📱 Dashboard ist responsive (teste auf Mobil mit F12)
- 🔄 Auto-Refresh läuft kontinuierlich im Hintergrund
- 📊 Metriken aktualisieren sich in Echtzeit
- 🎯 Nutze die Tabs um verschiedene Aspekte des Systems zu überwachen

### Keyboard Shortcuts
- **F12** - Developer Tools öffnen
- **Ctrl+R** - Page reload
- **Ctrl+Shift+Delete** - Cache löschen

---

## 🚨 Quick Links

| Link | Zweck |
|------|-------|
| http://localhost:3000/ | Dashboard |
| http://localhost:3000/api/system/health | Health-Check |
| http://localhost:3000/api/system/routes | Alle Routes |
| http://localhost:3000/api/system/system | System-Info |

---

## ✅ Checkliste

- [ ] Backend läuft (`npm run dev`)
- [ ] Dashboard öffnet sich (http://localhost:3000/)
- [ ] Login funktioniert (admin/admin123)
- [ ] 4 Übersicht-Karten werden angezeigt
- [ ] Mindestens 3 Tabs laden Daten
- [ ] Auto-Refresh funktioniert
- [ ] Browser-Konsole zeigt keine Fehler
- [ ] Status-Badges haben die richtige Farbe

---

## 📞 Hilfe

Wenn etwas nicht funktioniert:

1. **Terminal überprüfen** - Fehler im Backend?
2. **Browser-Konsole** - F12 → Console Tab
3. **Netzwerk** - F12 → Network Tab
4. **Dokumentation** - [DASHBOARD_README.md](apps/backend/src/views/DASHBOARD_README.md)

---

**Version**: 2.0  
**Zuletzt aktualisiert**: 2025-12-20  
**Status**: ✅ Production Ready

🎉 **Viel Spaß mit dem Dashboard!**
