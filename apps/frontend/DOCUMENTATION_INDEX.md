# 📚 Frontend Dashboard - Dokumentations-Index

Willkommen zur konsolidierten Frontend-Dashboard-Dokumentation für ERP SteinmetZ V1.

## 🎯 Schnellzugriff

| Dokument                                                       | Zweck                         | Zielgruppe |
| -------------------------------------------------------------- | ----------------------------- | ---------- |
| **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)**         | Schnelle API-Referenz         | Entwickler |
| **[DASHBOARD_CONSOLIDATION.md](./DASHBOARD_CONSOLIDATION.md)** | Übersicht der Konsolidierung  | Alle       |
| **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**                 | Schritt-für-Schritt Migration | Entwickler |
| **[src/config/README.md](./src/config/README.md)**             | Konfigurationsdokumentation   | Entwickler |

## 📖 Dokumentationsübersicht

### 1. Quick Reference (Schnelleinstieg)

**Datei:** `API_QUICK_REFERENCE.md`

**Inhalt:**

- Häufig genutzte Endpoints
- Widget-Konfiguration
- Helper-Funktionen
- Code-Beispiele
- Debugging-Tipps

**Für:** Entwickler, die schnell eine API-Route oder Widget-Config nachschlagen wollen.

---

### 2. Consolidation Documentation (Vollständige Übersicht)

**Datei:** `DASHBOARD_CONSOLIDATION.md`

**Inhalt:**

- Architekturübersicht
- Alle Backend-Module (20+)
- Alle API-Routen (200+)
- Widget-Mapping
- Performance-Vorteile
- Best Practices

**Für:** Projektmanager, Architekten, Senior Developers.

---

### 3. Migration Guide (Praktische Umsetzung)

**Datei:** `MIGRATION_GUIDE.md`

**Inhalt:**

- Schritt-für-Schritt Anleitung
- Vorher/Nachher Code-Beispiele
- Komponenten-spezifische Migrations
- Testing-Strategien
- Fortschritt Tracking

**Für:** Entwickler, die existierende Komponenten umstellen.

---

### 4. Config Documentation

**Datei:** `src/config/README.md` (zu erstellen)

**Inhalt:**

- API-Routen-Struktur
- Widget-Definitionen
- Theme-Konfiguration
- Grid-System
- Erweiterungsanleitung

**Für:** Entwickler, die neue Widgets oder Module hinzufügen.

---

## 🗂️ Dateistruktur

```
apps/frontend/
├── API_QUICK_REFERENCE.md          # ✅ Schnellreferenz
├── DASHBOARD_CONSOLIDATION.md      # ✅ Vollständige Dokumentation
├── MIGRATION_GUIDE.md              # ✅ Migration Anleitung
│
├── src/
│   ├── config/                     # ✅ Zentrale Konfiguration
│   │   ├── apiRoutes.ts           # Alle Backend-Routen
│   │   ├── dashboardConfig.ts     # Dashboard-Einstellungen
│   │   ├── index.ts               # Exports
│   │   └── README.md              # ⏳ Config-Dokumentation
│   │
│   └── components/
│       ├── Dashboard/              # Dashboard-Komponenten
│       │   ├── README.md          # Dashboard-Dokumentation
│       │   ├── README_DEV.md      # Developer-Dokumentation
│       │   └── ...
│       │
│       ├── Navigation/             # Navigation
│       │   ├── README.md
│       │   └── ...
│       │
│       └── Sidebar/                # Sidebar
│           ├── README.md
│           └── ...
│
└── apps/backend/
    └── src/routes/
        └── */docs/README.md        # Backend-Route-Dokumentation
```

## 🎓 Lernpfad

### Für neue Entwickler

1. **Start:** `API_QUICK_REFERENCE.md` (15 min)
   - Verstehe die grundlegende API-Struktur
   - Lerne die wichtigsten Endpoints kennen

2. **Vertiefung:** `DASHBOARD_CONSOLIDATION.md` (30 min)
   - Verstehe die Architektur
   - Lerne alle verfügbaren Module kennen

3. **Praxis:** `MIGRATION_GUIDE.md` (45 min)
   - Folge den Code-Beispielen
   - Migriere ein einfaches Widget

4. **Erweiterung:** `src/config/README.md` (30 min)
   - Lerne, wie man neue Widgets hinzufügt
   - Verstehe das Konfigurations-System

### Für erfahrene Entwickler

1. **Übersicht:** `DASHBOARD_CONSOLIDATION.md` (10 min)
   - Schneller Überblick über Änderungen

2. **Migration:** `MIGRATION_GUIDE.md` (20 min)
   - Direkt mit der Umstellung starten

3. **Referenz:** `API_QUICK_REFERENCE.md` (als Nachschlagewerk)
   - Bei Bedarf nachschlagen

## 🔍 Nach Thema suchen

### API-Routen

- **Alle Routen:** `DASHBOARD_CONSOLIDATION.md` → "Comprehensive Backend API Routes Map"
- **Schnellzugriff:** `API_QUICK_REFERENCE.md` → "Häufig genutzte Endpoints"
- **Route-Muster:** `MIGRATION_GUIDE.md` → "Backend-Route-Muster"

### Widgets

- **Widget-Liste:** `DASHBOARD_CONSOLIDATION.md` → "Definierte Widgets"
- **Konfiguration:** `dashboardConfig.ts` → `DASHBOARD_WIDGETS`
- **Beispiele:** `MIGRATION_GUIDE.md` → "Komponenten-spezifische Migrations-Beispiele"

### Permissions

- **System:** `dashboardConfig.ts` → Widget `permissions` Felder
- **Beispiele:** `MIGRATION_GUIDE.md` → "Permissions integrieren"
- **Helper:** `API_QUICK_REFERENCE.md` → "Helper-Funktionen"

### Themes

- **Konfiguration:** `dashboardConfig.ts` → `DASHBOARD_THEMES`
- **Verwendung:** `MIGRATION_GUIDE.md` → "Theme-System nutzen"
- **Farben:** `API_QUICK_REFERENCE.md` → "Themes"

### Grid/Layout

- **Breakpoints:** `dashboardConfig.ts` → `GRID_CONFIG`
- **Responsive:** `API_QUICK_REFERENCE.md` → "Responsive Grid"
- **Beispiele:** `MIGRATION_GUIDE.md` → "Grid-Layout anpassen"

## 🛠️ Wartung & Updates

### Neue Backend-Route hinzufügen

1. Route in `src/config/apiRoutes.ts` definieren
2. Widget in `src/config/dashboardConfig.ts` erstellen (falls UI benötigt)
3. `API_QUICK_REFERENCE.md` aktualisieren
4. Tests schreiben

### Neue Widget-Komponente erstellen

1. Komponente in `src/components/Dashboard/widgets/` erstellen
2. Widget-Config in `dashboardConfig.ts` hinzufügen
3. In `DASHBOARD_WIDGETS` registrieren
4. `MIGRATION_GUIDE.md` mit Beispiel erweitern

### Dokumentation aktualisieren

```bash
# Beim Ändern von Routen
1. apiRoutes.ts ändern
2. API_QUICK_REFERENCE.md aktualisieren
3. DASHBOARD_CONSOLIDATION.md prüfen

# Beim Ändern von Widgets
1. dashboardConfig.ts ändern
2. MIGRATION_GUIDE.md Beispiele anpassen
3. Widget-Liste in DASHBOARD_CONSOLIDATION.md updaten
```

## ✅ Checklisten

### Neue Route hinzufügen

- [ ] Route in `apiRoutes.ts` definieren
- [ ] JSDoc-Kommentar hinzufügen
- [ ] `API_QUICK_REFERENCE.md` aktualisieren
- [ ] Backend-Dokumentation referenzieren
- [ ] Tests schreiben

### Neues Widget erstellen

- [ ] Widget-Komponente entwickeln
- [ ] Widget-Config in `dashboardConfig.ts` erstellen
- [ ] API-Endpoints zuordnen
- [ ] Permissions definieren
- [ ] Grid-Span festlegen
- [ ] Refresh-Intervall konfigurieren
- [ ] In `DASHBOARD_WIDGETS` registrieren
- [ ] Beispiel in `MIGRATION_GUIDE.md` hinzufügen
- [ ] Tests schreiben

### Komponente migrieren

- [ ] `MIGRATION_GUIDE.md` durcharbeiten
- [ ] Imports auf `@/config` umstellen
- [ ] Hardcoded URLs entfernen
- [ ] Widget-Config nutzen
- [ ] Permissions implementieren
- [ ] Auto-Refresh hinzufügen
- [ ] Grid-System verwenden
- [ ] Theme-Support hinzufügen
- [ ] Tests anpassen
- [ ] Funktionalität testen

## 📊 Status-Übersicht

| Aufgabe                | Status        | Dokument                     |
| ---------------------- | ------------- | ---------------------------- |
| API-Routen definiert   | ✅ Fertig     | `apiRoutes.ts`               |
| Widget-Config erstellt | ✅ Fertig     | `dashboardConfig.ts`         |
| Quick Reference        | ✅ Fertig     | `API_QUICK_REFERENCE.md`     |
| Consolidation Doc      | ✅ Fertig     | `DASHBOARD_CONSOLIDATION.md` |
| Migration Guide        | ✅ Fertig     | `MIGRATION_GUIDE.md`         |
| Config README          | ⏳ Ausstehend | `src/config/README.md`       |
| Komponenten migriert   | ⏳ Ausstehend | -                            |
| Duplikate entfernt     | ⏳ Ausstehend | -                            |
| Tests aktualisiert     | ⏳ Ausstehend | -                            |

## 🔗 Externe Referenzen

### Backend-Dokumentation

- **System Router:** `apps/backend/src/routes/systemInfoRouter/docs/README.md`
- **Dashboard Router:** `apps/backend/src/routes/dashboard/docs/README.md`
- **CRM Router:** `apps/backend/src/routes/crm/docs/README.md`
- **Finance Router:** `apps/backend/src/routes/finance/docs/README.md`
- _(und weitere 15+ Module)_

### Verwandte Dokumente

- **Component README:** `src/components/Dashboard/README.md`
- **Developer Guide:** `src/components/Dashboard/README_DEV.md`
- **Navigation README:** `src/components/Navigation/README.md`
- **Sidebar README:** `src/components/Sidebar/README.md`

## 💬 Feedback & Beitragen

Verbesserungsvorschläge für die Dokumentation:

1. Issue auf GitHub erstellen
2. Pull Request mit Updates
3. Team-Meeting ansprechen

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-12-20  
**Maintainer:** GitHub Copilot  
**Status:** 🟡 In Entwicklung (Phase 1 abgeschlossen)
