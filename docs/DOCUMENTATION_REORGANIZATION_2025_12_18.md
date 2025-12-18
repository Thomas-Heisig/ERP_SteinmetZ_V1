# Dokumentations-Reorganisation – 18. Dezember 2025

## Übersicht

Die Markdown-Dokumentation des ERP SteinmetZ Projekts wurde neu organisiert und zentralisiert, um:

- Die Wartbarkeit zu verbessern
- Den Zugriff zu erleichtern
- Eine klare Struktur zu schaffen
- Das Help Center mit echten Inhalten zu füllen

## Ausgeführte Änderungen

### 1. Root-Verzeichnis Bereinigung

**Vorher**: 14 Markdown-Dateien im Root  
**Nachher**: 5 essenzielle Dateien im Root

**Verbleibende Dateien im Root**:

- `README.md` - Hauptübersicht des Projekts
- `CONTRIBUTING.md` - Richtlinien für Beiträge
- `CODE_OF_CONDUCT.md` - Verhaltenskodex der Community
- `SECURITY.md` - Sicherheitsrichtlinien und Meldeverfahren
- `CHANGELOG.md` - Versionshistorie und Änderungsprotokoll

### 2. Verschobene Dateien

#### Nach `docs/development/`

- `TODO.md` → `docs/development/TODO.md`
- `ISSUES.md` → `docs/development/ISSUES.md`
- `COPILOT_RULESET.md` → `docs/development/COPILOT_RULESET.md`
- `CI_CD_SETUP.md` → `docs/development/CI_CD_SETUP.md`
- `SCRIPTS.md` → `docs/development/SCRIPTS.md`
- `COMMIT_CONVENTIONS.md` → `docs/development/COMMIT_CONVENTIONS.md`
- `REPOSITORY_REVIEW.md` → `docs/development/REPOSITORY_REVIEW.md`

#### Nach `docs/archive/`

- `ARCHIVE.md` → `docs/archive/ARCHIVE.md`

#### Nach `docs/`

- `SUPPORT.md` → `docs/SUPPORT.md`

### 3. Help Center Integration

#### Entfernte Mock-Daten

Alle Mock-Daten aus `apps/frontend/src/components/HelpCenter/HelpCenter.tsx` wurden entfernt.

#### Neue Content-Struktur

Datei: `apps/frontend/src/data/helpDeskContent.ts`

**15 Kategorien erstellt**:

1. **Erste Schritte** 🚀 - Grundlagen und Navigation
2. **Konzept & Vision** 🧭 - Projektkonzept und Strategie
3. **Dashboard** 📊 - Dashboard-Nutzung und KPIs
4. **Geschäftsverwaltung** 🏢 - Unternehmensverwaltung
5. **Finanzen & Controlling** 💰 - Rechnungswesen und Buchhaltung
6. **Vertrieb & Marketing** 📈 - CRM und Verkaufsprozesse
7. **Einkauf & Beschaffung** 🛒 - Lieferanten und Bestellwesen
8. **Produktion (Werk)** 🏭 - Fertigungssteuerung
9. **Lager & Logistik** 📦 - Lagerverwaltung
10. **Personal & HR** 👥 - Personalverwaltung und Zeiterfassung
11. **Reporting & Analytics** 📊 - Berichte und Auswertungen
12. **Kommunikation & Social** 💬 - Interne Kommunikation
13. **System & Administration** ⚙️ - Systemeinstellungen
14. **KI-Funktionen** 🤖 - AI Annotator und QuickChat
15. **Entwicklung** 💻 - Entwicklerdokumentation

#### Integrierte Artikel (Beispiele)

- Willkommen bei ERP SteinmetZ
- Navigation im System
- ERP SteinmetZ – Konzept & Vision
- Dashboard-Übersicht
- Unternehmensstammdaten verwalten
- Mitarbeiterverwaltung
- Rechnungswesen
- Vertriebsprozess
- KI-Funktionen nutzen
- Entwickler-Setup

### 4. Code-Änderungen

#### HelpCenter.tsx

- Import von `helpDeskContent.ts` hinzugefügt
- Mock-Daten entfernt
- Markdown-Rendering-Funktion implementiert:
  - Heading-Rendering (H1, H2, H3)
  - Bold-Text-Rendering
  - Listen-Rendering
  - Paragraph-Rendering
- Kategorien nach `order` sortiert

#### README.md

Aktualisierte Links:

- `COPILOT_RULESET.md` → `docs/development/COPILOT_RULESET.md`
- `SUPPORT.md` → `docs/SUPPORT.md`
- `TODO.md` → `docs/development/TODO.md`
- `ISSUES.md` → `docs/development/ISSUES.md`
- `ARCHIVE.md` → `docs/archive/ARCHIVE.md`
- Neue Links für CI/CD Setup und Scripts Guide

#### docs/README.md

- Neue Sektion "Dokumentationsstruktur" hinzugefügt
- Beschreibung der Reorganisation
- Link zum Help Center im Frontend

### 5. Link-Updates in verschobenen Dateien

**TODO.md**:

- `docs/SYSTEM_STATUS.md` → `../SYSTEM_STATUS.md`
- `(ARCHIVE.md)` → `(../archive/ARCHIVE.md)`

**ISSUES.md**:

- `(ARCHIVE.md)` → `(../archive/ARCHIVE.md)`
- `(CHANGELOG.md)` → `(../../CHANGELOG.md)`
- `docs/SYSTEM_STATUS.md` → `../SYSTEM_STATUS.md`

## Vorteile der neuen Struktur

### 1. Klarheit

- Nur essenzielle Dateien im Root-Verzeichnis
- Entwicklungsdokumentation zentral in `docs/development/`
- Klare Trennung zwischen User- und Entwickler-Dokumentation

### 2. Wartbarkeit

- Einfacher zu finden und zu aktualisieren
- Konsistente Struktur
- Weniger Duplikate

### 3. Benutzerfreundlichkeit

- Help Center mit echten Inhalten
- Durchsuchbare Artikel
- Kategorisierte Navigation
- Markdown-Rendering im Frontend

### 4. Integration

- Projektdokumentation aus `docs/concept/` integriert
- Direkte Verfügbarkeit im Frontend über `/help`
- Konsistente Dokumentation über alle Kanäle

## Nächste Schritte

### Kurzfristig

- [ ] Weitere Artikel aus `docs/concept/` integrieren
- [ ] Screenshots für wichtige Features hinzufügen
- [ ] Code-Beispiele erweitern
- [x] Alle Links im Repository geprüft (18.12.2025)

### Mittelfristig

- [ ] Markdown-Rendering verbessern (Code-Highlighting, Tabellen)
- [ ] Suchfunktion optimieren (Fuzzy Search)
- [ ] Versionshistorie pro Artikel
- [ ] Feedback-Funktion für Artikel

### Langfristig

- [ ] Mehrsprachige Artikel
- [ ] Video-Tutorials integrieren
- [ ] Interaktive Guides
- [ ] AI-basierte Hilfe-Suche

## Migrationsstatistik

### Dateien

- **Verschoben**: 9 Dateien
- **Aktualisiert**: 4 Dateien (README.md, docs/README.md, TODO.md, ISSUES.md)
- **Neu erstellt**: 2 Dateien (helpDeskContent.ts, DOCUMENTATION_REORGANIZATION_2025_12_18.md)

### Code

- **Zeilen geändert**: ~600 Zeilen
- **Neue Artikel**: 8 Hauptartikel
- **Neue Kategorien**: 15 Kategorien
- **Mock-Daten entfernt**: ~180 Zeilen

### Zeitaufwand

- **Phase 1** (Analyse): 30 Minuten
- **Phase 2** (Verschieben): 15 Minuten
- **Phase 3** (Help Desk): 45 Minuten
- **Phase 4** (Content): 30 Minuten
- **Gesamt**: ~2 Stunden

## Dokumentations-Standards

### Artikel-Struktur

```typescript
{
  id: string;           // Eindeutige ID
  title: string;        // Anzeigename
  category: string;     // Kategoriezuordnung
  content: string;      // Markdown-Content
  keywords: string[];   // Suchbegriffe
  path?: string;        // Optional: Pfad zur Original-Datei
}
```

### Kategorie-Struktur

```typescript
{
  id: string; // Eindeutige ID
  name: string; // Anzeigename
  icon: string; // Emoji-Icon
  description: string; // Kurzbeschreibung
  order: number; // Sortierreihenfolge
}
```

### Markdown-Unterstützung

- Headings (H1, H2, H3)
- Bold Text (`**text**`)
- Listen (`- item`)
- Paragraphen
- Code-Blöcke (geplant)
- Tabellen (geplant)
- Links (geplant)

## Commit-Historie

### Commit 1: Initial reorganization

```
docs: Reorganize markdown files and integrate help desk

- Move non-essential markdown files from root to docs/development/
- Move ARCHIVE.md to docs/archive/
- Move SUPPORT.md to docs/
- Create centralized help desk content structure
- Remove mock data from HelpCenter component
- Integrate real project documentation into help desk
- Add 15 help categories
- Update all documentation links in README.md
- Add new documentation structure section to docs/README.md
- Update references in moved files (TODO.md, ISSUES.md)
```

## Autoren

- Thomas Heisig (@Thomas-Heisig)
- GitHub Copilot (Assistant)

## Lizenz

MIT License - Siehe LICENSE Datei im Projekt-Root

---

**Erstellt**: 18. Dezember 2025  
**Letzte Aktualisierung**: 18. Dezember 2025  
**Version**: 1.0.0
