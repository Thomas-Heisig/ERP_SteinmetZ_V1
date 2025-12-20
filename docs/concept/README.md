# 📘 ERP SteinmetZ - Concept Documentation

**Version**: 1.0  
**Status**: Production Ready  
**Letzte Aktualisierung**: 2025-12-20

## 📖 Hauptdokument

Das vollständige System-Konzept für ERP SteinmetZ V1.0 ist hier:

👉 **[GESAMTKONZEPT_V1.0.md](./GESAMTKONZEPT_V1.0.md)**

Dieses Dokument enthält:
- ✅ Vision und Zielsetzung
- ✅ Kernarchitektur (Monorepo, Tech-Stack)
- ✅ **Unified Dashboard System** (Fusion von KI-Annotator + Funktionskatalog)
- ✅ KI-gestützte Entwicklung (Multi-Provider, Prompts)
- ✅ Alle 11 Funktionsmodule für V1.0
- ✅ Technische Spezifikationen (DB, Schemas, APIs)
- ✅ Sicherheit und Compliance (RBAC, DSGVO, GoBD)
- ✅ Roadmap und Phasen

## 🏗️ Architektur-Übersicht

```
ERP SteinmetZ V1.0
├── Unified Dashboard (Zentrale Steuerung)
│   ├── Funktionskatalog (Navigation, Hierarchie)
│   ├── KI-Annotator (Meta/Form/Rule-Generierung)
│   └── Widget-Management (Dashboard-Komponenten)
│
├── 11 Funktionsmodule
│   ├── Dashboard (Executive Overview)
│   ├── Geschäftsverwaltung
│   ├── Finanzen & Controlling
│   ├── Vertrieb & Marketing
│   ├── Einkauf & Beschaffung
│   ├── Produktion & Fertigung (Werk)
│   ├── Produktion & Fertigung (Lager)
│   ├── Personal & HR
│   ├── Reporting & Analytics
│   ├── Kommunikation & Social
│   └── System & Administration
│
└── Technische Basis
    ├── PostgreSQL (Datenbank)
    ├── Node.js/Fastify (Backend)
    ├── React/Next.js (Frontend)
    └── Ollama/OpenAI (KI-Layer)
```

## 📂 Verzeichnisstruktur

- `GESAMTKONZEPT_V1.0.md` - **Hauptdokument** (lesen Sie dies zuerst)
- `archive/` - Alte Concept-Dateien (archiviert, nicht mehr aktiv)
- `.gitkeep` - Git-Platzhalter

## 🎯 Kernkonzepte

### Unified Dashboard

Das **Unified Dashboard** ist das Herzstück von V1.0 und vereint:

```
┌────────────────────────────────────────────┐
│         UNIFIED DASHBOARD V1.0             │
├────────────────────────────────────────────┤
│ • Funktionsverwaltung (Katalog)            │
│ • KI-Generierung (Meta/Form/Rule)          │
│ • Widget-Management (Dashboards)           │
│ • Batch-Operationen (QA-Pipeline)          │
└────────────────────────────────────────────┘
```

**Vorteile**:
- ✅ Eine API statt zwei (Katalog + Annotator)
- ✅ Konsistente Daten (automatisches Merging)
- ✅ Bessere Performance (Server-seitiges Caching)
- ✅ Einfachere Integration (Unified Schema)

### Instruction-Driven ERP

- Fachprozesse als Arbeitsanweisungen (AA/DSL)
- JSON-Schemas für alle Formulare
- KI moderiert, Determinismus führt aus
- Regelbasierte Navigation und Dashboards

### Tri-State Schema

Jedes Feld kann in 3 Zuständen existieren:

```typescript
type FieldState = 'known' | 'unknown' | 'not_applicable';
```

- `known` → Wert vorhanden und validiert
- `unknown` → Wert fehlt, To-Do wird erstellt
- `not_applicable` → Feld nicht relevant

## 🚀 Schnellstart

1. **Lesen Sie das Hauptdokument**: [GESAMTKONZEPT_V1.0.md](./GESAMTKONZEPT_V1.0.md)

2. **API-Dokumentation**: [/apps/backend/src/routes/unifiedDashboard/README.md](../../apps/backend/src/routes/unifiedDashboard/README.md)

3. **Code erkunden**:
   - Backend: `apps/backend/src/routes/unifiedDashboard/`
   - Frontend: `apps/frontend/src/pages/` (in Entwicklung)

4. **Entwicklung starten**:
   ```bash
   npm install
   npm run dev
   ```

## 📋 Version History

### Version 1.0 (2025-12-20)
- ✅ **GESAMTKONZEPT_V1.0.md** erstellt
- ✅ Unified Dashboard konzipiert
- ✅ Alte Concept-Dateien archiviert
- ✅ Alle 11 Module definiert
- ✅ Backend-Router implementiert

### Version 0.1-alpha (vorher)
- Getrennte Konzepte für Module
- KI-Annotator und Funktionskatalog separat
- Verteilte Dokumentation

## 🔗 Weiterführende Dokumentation

### Backend
- [Unified Dashboard API](../../apps/backend/src/routes/unifiedDashboard/README.md)
- [AI Annotator Docs](../../apps/backend/src/routes/aiAnnotatorRouter/docs/README.md)
- [Functions Catalog Docs](../../apps/backend/src/routes/functionsCatalog/docs/README.md)

### Konzepte
- [AI Annotator Integration](../AI_ANNOTATOR_INTEGRATION.md)
- [AI Annotator Workflow](../AI_ANNOTATOR_WORKFLOW.md)
- [Architecture](../ARCHITECTURE.md)

### Development
- [Developer Onboarding](../DEVELOPER_ONBOARDING.md)
- [Code Conventions](../CODE_CONVENTIONS.md)
- [Testing Strategy](../backend/) (in Arbeit)

## 💡 Best Practices

1. **Immer GESAMTKONZEPT_V1.0.md verwenden** als Referenz
2. **Archivierte Dateien nicht bearbeiten**
3. **Neue Versionen** als GESAMTKONZEPT_V1.1.md erstellen
4. **API-First Approach** - Backend zuerst, dann Frontend
5. **KI nutzen** - Generierung statt manuelle Erstellung

## 🤝 Beitragen

Bei Änderungen am Konzept:

1. **GESAMTKONZEPT_V1.0.md** bearbeiten (oder neue Version erstellen)
2. **PR erstellen** mit klarer Beschreibung
3. **Review abwarten** (mindestens 1 Approver)
4. **Merge** nur nach erfolgreicher Review

## 📞 Support

Bei Fragen zum Konzept:
- GitHub Issues: [ERP_SteinmetZ_V1/issues](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
- Team-Kontakt: siehe [SUPPORT.md](../SUPPORT.md)

---

**Erstellt von**: ERP SteinmetZ Team  
**Letzte Aktualisierung**: 2025-12-20  
**Status**: Production Ready ✅
