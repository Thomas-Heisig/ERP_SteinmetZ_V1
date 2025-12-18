// SPDX-License-Identifier: MIT
// apps/frontend/src/data/helpDeskContent.ts

/**
 * Help Desk Content Structure
 * This file contains the centralized help documentation for the ERP System
 */

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  path?: string; // Optional path to markdown file
}

export interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
}

export const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    name: "Erste Schritte",
    icon: "🚀",
    description: "Lernen Sie die Grundlagen von ERP SteinmetZ kennen",
    order: 1,
  },
  {
    id: "concept",
    name: "Konzept & Vision",
    icon: "🧭",
    description: "Projektkonzept und strategische Ausrichtung",
    order: 2,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "📊",
    description: "Informationen zur Dashboard-Nutzung",
    order: 3,
  },
  {
    id: "business",
    name: "Geschäftsverwaltung",
    icon: "🏢",
    description: "Unternehmensverwaltung und Prozesse",
    order: 4,
  },
  {
    id: "finance",
    name: "Finanzen & Controlling",
    icon: "💰",
    description: "Rechnungen, Buchhaltung und Finanzverwaltung",
    order: 5,
  },
  {
    id: "sales",
    name: "Vertrieb & Marketing",
    icon: "📈",
    description: "Vertriebsprozesse und Kundenbeziehungen",
    order: 6,
  },
  {
    id: "procurement",
    name: "Einkauf & Beschaffung",
    icon: "🛒",
    description: "Lieferanten und Bestellwesen",
    order: 7,
  },
  {
    id: "production-werk",
    name: "Produktion (Werk)",
    icon: "🏭",
    description: "Fertigungssteuerung und Produktion",
    order: 8,
  },
  {
    id: "warehouse",
    name: "Lager & Logistik",
    icon: "📦",
    description: "Lagerverwaltung und Bestandskontrolle",
    order: 9,
  },
  {
    id: "hr",
    name: "Personal & HR",
    icon: "👥",
    description: "Personalverwaltung und Zeiterfassung",
    order: 10,
  },
  {
    id: "reporting",
    name: "Reporting & Analytics",
    icon: "📊",
    description: "Berichte und Auswertungen",
    order: 11,
  },
  {
    id: "communication",
    name: "Kommunikation & Social",
    icon: "💬",
    description: "Interne Kommunikation und Zusammenarbeit",
    order: 12,
  },
  {
    id: "system",
    name: "System & Administration",
    icon: "⚙️",
    description: "Systemeinstellungen und Verwaltung",
    order: 13,
  },
  {
    id: "ai",
    name: "KI-Funktionen",
    icon: "🤖",
    description: "KI-Annotator und intelligente Assistenz",
    order: 14,
  },
  {
    id: "development",
    name: "Entwicklung",
    icon: "💻",
    description: "Entwicklerdokumentation und technische Guides",
    order: 15,
  },
];

export const helpArticles: HelpArticle[] = [
  // Getting Started
  {
    id: "welcome",
    title: "Willkommen bei ERP SteinmetZ",
    category: "getting-started",
    content: `
# Willkommen bei ERP SteinmetZ

ERP SteinmetZ ist ein umfassendes Enterprise Resource Planning System mit KI-gestützten Funktionen.

## Hauptfunktionen

### Dashboard mit Echtzeitübersicht
Das Dashboard bietet Ihnen einen zentralen Überblick über alle wichtigen Kennzahlen und Prozesse Ihres Unternehmens.

### Module
- **Geschäftsverwaltung**: Unternehmensverwaltung und Prozessmanagement
- **Finanzen & Controlling**: Buchhaltung, Rechnungswesen, Controlling
- **Vertrieb & Marketing**: CRM, Verkaufsprozesse, Marketing-Automation
- **Einkauf & Beschaffung**: Bestellwesen, Lieferantenverwaltung
- **Produktion**: Fertigungssteuerung und Produktionsplanung
- **Lager**: Lagerverwaltung und Bestandsführung
- **Personal**: HR-Management und Zeiterfassung
- **Reporting**: Berichte und Auswertungen
- **Kommunikation**: Interne Kommunikation und Zusammenarbeit
- **System**: Systemeinstellungen und Administration

### KI-gestützte Funktionen
- **QuickChat**: KI-Assistent für schnelle Hilfe
- **AI Annotator**: Intelligente Datenanalyse und -anreicherung

## Navigation
Verwenden Sie die Sidebar links, um zwischen den verschiedenen Modulen zu wechseln.

## Erste Schritte
1. Machen Sie sich mit dem Dashboard vertraut
2. Erkunden Sie die verschiedenen Module
3. Nutzen Sie den QuickChat für Fragen
4. Passen Sie Ihre Benutzereinstellungen an
    `,
    keywords: ["start", "einführung", "übersicht", "willkommen"],
  },
  {
    id: "navigation",
    title: "Navigation im System",
    category: "getting-started",
    content: `
# Navigation im System

## Sidebar
Die Sidebar auf der linken Seite ist Ihr Hauptnavigationswerkzeug:

- Klicken Sie auf ein Modul, um es zu öffnen
- Erweitern Sie Module mit Untermenüs durch Klick auf den Pfeil
- Die aktive Seite ist farblich hervorgehoben

## Dashboard
Das Dashboard ist Ihre Startseite und zeigt:
- Wichtige Kennzahlen (KPIs)
- Aktuelle Aktivitäten
- Schnellzugriffe auf häufig genutzte Funktionen
- Systemstatus

## Suche
Nutzen Sie die Suchfunktion oben rechts:
- Suchen Sie nach Kunden, Artikeln, Dokumenten
- Verwenden Sie Filter für präzisere Ergebnisse
- Nutzen Sie Tastenkombinationen (Strg+K)

## QuickChat
Der KI-Assistent hilft Ihnen:
- Fragen zum System beantworten
- Aufgaben ausführen
- Daten finden
- Prozesse erklären

## Tastenkombinationen
- \`Strg+K\`: Suche öffnen
- \`Strg+/\`: Tastenkombinationen anzeigen
- \`Esc\`: Dialog schließen
- \`Alt+1-9\`: Direkte Navigation zu Modulen
    `,
    keywords: ["navigation", "sidebar", "menü", "suche", "shortcuts"],
  },

  // Concept & Vision
  {
    id: "concept-overview",
    title: "ERP SteinmetZ – Konzept & Vision",
    category: "concept",
    content: `
# ERP SteinmetZ – Konzeptfassung

## Zielbild & Geltungsbereich

ERP SteinmetZ ist ein **instruction-driven ERP**, in dem fachliche Abläufe als Arbeitsanweisungen (AA/DSL) und JSON-Schemas beschrieben sind.

### Kernprinzipien

1. **KI als Moderator**: Die KI-Schicht moderiert Eingaben und ruft deterministische Services auf
2. **Deterministische Services**: Persistenz, Nummernkreise, Steuern, RBAC, Fristen
3. **Regelbasierte Navigation**: Navigation und Dashboards entstehen aus Modul-Manifesten
4. **RAG für Text**: RAG wird nur für Text-/Webquellen genutzt
5. **Deterministische Kernzahlen**: Alle Geschäftszahlen werden deterministisch berechnet

## Kernarchitektur

### Frontend
- React/Next.js basiert
- App-Shell mit KI-Drawer
- Formular-Dialoge
- Progress-Banner

### Backend
- Node.js API-Service
- BFF-Routen je Modul
- Validierung und Maskierung serverseitig

### Datenbank
- PostgreSQL
- Schemas: core, hr, finance
- Event/Audit-Store (append-only)
- Verschlüsselte Dokumentenablage

### Modularität
- Module als Manifeste (Capabilities, Widgets, RBAC, i18n)
- Versionierung
- Mehrsprachigkeit mit i18n-Katalogen

## KI-Orchestrierung

### Stufenmodell
1. **Router/Klassifizierer** (≤3B): Pfadwahl (SQL vs. RAG vs. Web)
2. **Orchestrator** (≈7B): Dialog, Schema-gebunden, Tool-Calls
3. **Fallback** (≈14B): Komplexe Formdialoge und Validierungen
4. **Consultant** (Ollama): Beratungsmodus, liefert JSON-Pläne

### Sicherheit
- PII-Filter vor Eskalation
- Platzhalter-Mapping on-prem
- Regelgeführte Eskalation und De-Eskalation

## Compliance & Sicherheit

### DSGVO
- PII-Klassifikation pro Feld
- Aufbewahrungsregeln
- Löschläufe
- Verschlüsselung "at rest" & "in transit"

### GoBD
- Unveränderliche Journale
- Audit Trail
- Versionierung
- Nachvollziehbarkeit
    `,
    keywords: ["konzept", "vision", "architektur", "ki", "strategie"],
    path: "/docs/concept/_0_KONZEPT.md",
  },

  // Dashboard
  {
    id: "dashboard-overview",
    title: "Dashboard-Übersicht",
    category: "dashboard",
    content: `
# Dashboard-Übersicht

Das Dashboard ist Ihre zentrale Übersicht über alle wichtigen Kennzahlen und Prozesse.

## Executive Overview

### Unternehmens-KPIs
- **Umsatz-Kennzahlen**: Tagesumsatz, Monatsumsatz, Jahresumsatz
- **Gewinnmargen**: Bruttomarge, Nettomarge in Echtzeit
- **Liquiditätsstatus**: Cashflow, Prognosen, Kreditlinien
- **Auftragseingang**: Soll-Ist-Vergleich, Trends
- **Produktivitätskennzahlen**: Output, Durchlaufzeiten, OEE

### Prozess-Monitoring
- **Lead-to-Cash Pipeline**: Conversion-Raten, Sales-Cycle
- **Procure-to-Pay Status**: Bestellungen, Wareneingänge
- **Order-to-Delivery**: Auftragsabwicklung, Lieferungen
- **Hire-to-Retire**: HR-Prozesse, Onboarding

## Widgets

### Anpassbare Widgets
Sie können Ihr Dashboard personalisieren:
1. Widget hinzufügen/entfernen
2. Position ändern (Drag & Drop)
3. Größe anpassen
4. Datenquellen konfigurieren

### Verfügbare Widgets
- Umsatz-Widget
- Auftrags-Widget
- Lagerbestand-Widget
- Personal-Widget
- Finanzen-Widget
- Aktuelle Aktivitäten
- Statistik-Übersicht
- Systemstatus

## Echtzeit-Updates

Das Dashboard aktualisiert sich automatisch:
- WebSocket-Verbindung für Live-Daten
- Push-Benachrichtigungen für wichtige Ereignisse
- Automatische Aktualisierung alle 30 Sekunden
    `,
    keywords: ["dashboard", "übersicht", "kpi", "widgets", "echtzeit"],
    path: "/docs/concept/_1_DASHBOARD.md",
  },

  // AI Features
  {
    id: "ai-features",
    title: "KI-Funktionen nutzen",
    category: "ai",
    content: `
# KI-Funktionen nutzen

## AI-Annotator

Der AI-Annotator ist ein intelligentes System zur automatischen Analyse und Anreicherung von Daten.

### Funktionen
- **Automatische Datenanalyse**: Erkennung von Mustern und Zusammenhängen
- **Metadaten-Generierung**: Automatische Erzeugung von Metadaten
- **Regelextraktion**: Ableitung von Geschäftsregeln aus Daten
- **Formular-Generierung**: Automatische Erstellung von Eingabemasken

### Batch-Processing
- Große Datenmengen verarbeiten
- Progress-Tracking in Echtzeit
- Quality-Assurance
- Fehlerbehandlung

### Quality Dashboard
- Qualitätsmetriken überwachen
- Manuelle Review-Interface
- Approval-Workflow
- Trend-Analyse

## QuickChat

QuickChat ist Ihr persönlicher KI-Assistent.

### Funktionen
- **Fragen beantworten**: Stellen Sie Fragen zum System
- **Aufgaben ausführen**: Automatisieren Sie wiederkehrende Aufgaben
- **Daten suchen**: Finden Sie schnell, was Sie brauchen
- **Prozesse erklären**: Lernen Sie, wie Abläufe funktionieren

### Verwendung
1. Öffnen Sie QuickChat (Icon unten rechts)
2. Geben Sie Ihre Frage oder Anfrage ein
3. QuickChat verarbeitet Ihre Eingabe
4. Folgen Sie den Anweisungen oder Vorschlägen

### Beispiele
- "Zeige mir die offenen Rechnungen"
- "Wie erstelle ich ein neues Angebot?"
- "Wer ist mein bester Kunde?"
- "Erstelle einen Umsatzbericht für letzten Monat"

## Model Management

Verwalten Sie die KI-Modelle:
- **Model-Selection**: Wählen Sie das beste Modell für Ihre Aufgabe
- **Performance-Vergleich**: Vergleichen Sie die Leistung verschiedener Modelle
- **Cost-Tracking**: Überwachen Sie die Kosten
- **Usage-Statistics**: Analysieren Sie die Nutzung
    `,
    keywords: ["ki", "ai", "chat", "automatisierung", "annotator"],
  },

  // Business Management - Extended
  {
    id: "business-company-data",
    title: "Unternehmensstammdaten verwalten",
    category: "business",
    content: `
# Unternehmensstammdaten

## Grunddaten

### Firmeninformationen
- **Offizieller Firmenname**: Vollständiger eingetragener Name
- **Handelsname**: Geschäftsname (DBA - Doing Business As)
- **Hauptsitz**: Offizielle Geschäftsadresse
- **Website & Domains**: Unternehmenswebsite und E-Mail-Domains
- **Kontaktdaten**: Telefon, Fax, E-Mail
- **Geschäftszeiten**: Öffnungszeiten und Erreichbarkeit
- **Unternehmenszweck**: Geschäftsgegenstand
- **Gründungsdatum**: Datum der Gründung
- **Mitarbeiteranzahl**: Aktuelle Mitarbeiterzahl
- **Branchenzuordnung**: WZ-Code und Branche

### Rechtsform & Handelsregister
- **Rechtsform**: GmbH, AG, KG, etc.
- **Handelsregister-Nummer**: HRB/HRA-Nummer
- **Registergericht**: Zuständiges Amtsgericht
- **Geschäftsführer/Vorstand**: Vertretungsberechtigte Personen
- **Gesellschafterliste**: Anteilseigner und Beteiligungen
- **Stamm-/Grundkapital**: Eingetragenes Kapital

### Steuernummern & USt-ID
- **Finanzamt**: Zuständiges Finanzamt
- **Steuernummer**: Nationale Steuernummer
- **USt-IdNr**: Umsatzsteuer-Identifikationsnummer
- **Lohnsteuer-Nummer**: Für Gehaltsabrechnung
- **Gewerbesteuer-Nummer**: Kommunale Steuernummer

### Bankverbindungen
- **Hauptbankverbindung**: Primäres Geschäftskonto
- **IBAN/BIC**: Internationale Bankverbindung
- **Weitere Konten**: Zusätzliche Bankkonten
- **Kreditlinien**: Verfügbare Kreditrahmen
- **Online-Banking**: EBICS-Schlüssel und Zugänge
    `,
    keywords: ["unternehmen", "stammdaten", "firma", "handelsregister"],
  },

  // HR - Extended
  {
    id: "hr-employee-management",
    title: "Mitarbeiterverwaltung",
    category: "hr",
    content: `
# Mitarbeiterverwaltung

## Stammdaten

### Identifikationsdaten
- **Personalnummer**: Eindeutige Mitarbeiter-ID
- **Mitarbeiter-ID**: System-interne Kennung
- **Benutzername**: Login-Name für Systeme
- **Externe Kennungen**: Referenzen zu externen Systemen

### Organisationsdaten
- **Abteilung**: Zugehörigkeit zur Organisationseinheit
- **Kostenstelle**: Buchungskreis und Kostenträger
- **Position & Rolle**: Stellenbezeichnung und Funktion
- **Vorgesetzter**: Direkte Berichtsbeziehung
- **Karriere-Level**: Hierarchiestufe im Unternehmen

### Persönliche Daten
- **Name**: Vollständiger Name (Vor- und Nachname)
- **Geburtsdatum**: Datum und Ort der Geburt
- **Nationalität**: Staatsangehörigkeit
- **Familienstand**: Ledig, Verheiratet, etc.
- **Steuer-ID**: Steueridentifikationsnummer

### Kontaktdaten
- **Privatadresse**: Wohnanschrift
- **E-Mail**: Geschäftliche und private E-Mail
- **Telefon**: Festnetz und Mobilnummer
- **Notfallkontakte**: Kontaktpersonen im Notfall

## Vertragsmanagement

### Vertragsgrundlagen
- **Vertragsbeginn**: Startdatum des Arbeitsverhältnisses
- **Vertragsende**: Bei befristeten Verträgen
- **Vertragsart**: Unbefristet, befristet, Zeitarbeit
- **Arbeitszeitmodell**: Vollzeit, Teilzeit, Gleitzeit
- **Kündigungsfrist**: Rechtliche Kündigungsfristen
- **Probezeit**: Dauer und Bedingungen

### Vergütung
- **Grundgehalt**: Monatliches Festgehalt
- **Zulagen**: Schichtzulagen, Erschwerniszulagen
- **Variable Vergütung**: Boni, Provisionen
- **Benefits**: Firmenwagen, Versicherungen
- **Sachbezüge**: Dienstwagen, Essensgutscheine

### Arbeitszeit
- **Sollarbeitszeit**: Vereinbarte Wochenarbeitszeit
- **Gleitzeit**: Kernarbeitszeit und Gleitzeitrahmen
- **Überstunden**: Abbau oder Auszahlung
- **Urlaubsanspruch**: Jahresurlaub in Tagen
- **Sonderurlaub**: Besondere Urlaubsansprüche

## Zeiterfassung

### Zeit-Tracking
- **Arbeitszeiterfassung**: Kommen/Gehen-Buchungen
- **Pausenregelung**: Gesetzliche und vertragliche Pausen
- **Überstunden**: Erfassung und Saldenverwaltung
- **Fehlzeiten**: Krankmeldungen, Urlaub
- **Genehmigungen**: Workflow für Abwesenheiten

### Urlaubsmanagement
- **Urlaubsanträge**: Beantragung und Genehmigung
- **Urlaubsplanung**: Jahresplanung und Teamkalender
- **Urlaubssaldo**: Resturlaubstage und Verfallfristen
- **Sonderurlaub**: Hochzeit, Geburt, Umzug
- **Krankheitsvertretung**: Urlaubsvertretung regeln
    `,
    keywords: [
      "mitarbeiter",
      "personal",
      "hr",
      "vertrag",
      "urlaub",
      "zeit",
    ],
  },

  // Finance - Extended
  {
    id: "finance-invoicing",
    title: "Rechnungswesen",
    category: "finance",
    content: `
# Rechnungswesen

## Debitoren (Kundenbuchhaltung)

### Ausgangsrechnungen
- **Rechnungserstellung**: Manuelle und automatische Erstellung
- **Rechnungsvorlagen**: Templates für verschiedene Rechnungsarten
- **Rechnungsnummern**: Automatische Nummernkreise
- **Positionen**: Artikel, Dienstleistungen, Rabatte
- **Umsatzsteuer**: Verschiedene Steuersätze und -arten
- **Zahlungsbedingungen**: Skonto, Zahlungsziele
- **XRechnung**: E-Rechnungs-Standard für B2G
- **ZUGFeRD**: Hybrid-Format (PDF mit XML)

### Mahnwesen
- **Mahnstufen**: 3 Eskalationsstufen
  1. Zahlungserinnerung (ohne Gebühr)
  2. 1. Mahnung (mit Mahngebühr)
  3. 2. Mahnung (höhere Mahngebühr)
- **Automatische Mahnläufe**: Zeitgesteuerte Verarbeitung
- **Mahngebühren**: Konfigurierbare Gebühren pro Stufe
- **Mahnsperre**: Temporäres Aussetzen von Mahnungen
- **Inkasso**: Übergabe an Inkassobüro

### Zahlungseingänge
- **Bankauszug-Import**: Automatischer Import (MT940, CAMT)
- **Zahlungszuordnung**: Manuelle und automatische Zuordnung
- **Offene Posten**: OP-Verwaltung und Matching
- **Teilzahlungen**: Verarbeitung von Ratenzahlungen
- **Gutschriften**: Erstellen und Verbuchen

## Kreditoren (Lieferantenbuchhaltung)

### Eingangsrechnungen
- **Rechnungserfassung**: Manuelle Eingabe oder OCR-Scan
- **Rechnungsprüfung**: 3-Wege-Match (Bestellung, Wareneingang, Rechnung)
- **Freigabe-Workflow**: Mehrstufige Genehmigung
- **Kontierung**: Zuordnung zu Kostenstellen und Konten
- **Skonto**: Automatische Skontoverwaltung

### Zahlungslauf
- **Zahlungsvorschläge**: Automatische Generierung
- **Skontooptimierung**: Maximierung von Skontoerträgen
- **Liquiditätsplanung**: Cashflow-Optimierung
- **Sammelüberweisung**: Mehrere Zahlungen gebündelt
- **SEPA-Export**: XML-Dateien für Online-Banking

## Hauptbuch

### Buchungen
- **Journaleinträge**: Manuelle Buchungen
- **Automatische Buchungen**: Aus Verkauf, Einkauf, Lohn
- **Korrekturbuchungen**: Stornierungen und Anpassungen
- **Periodische Buchungen**: Wiederkehrende Buchungen

### Kontenplan
- **SKR03**: Kontenrahmen für Prozessgliederung
- **SKR04**: Kontenrahmen für Abschlussgliederung
- **Individuelle Anpassung**: Eigene Kontenstruktur
- **Kostenstellen**: Kostenstellenrechnung
- **Kostenträger**: Produktkalkulation

### Abschluss
- **Monatsabschluss**: Periodenabschluss und -sperre
- **Jahresabschluss**: Bilanz und GuV
- **Rückstellungen**: Verbindlichkeiten und Rücklagen
- **Abgrenzungen**: Aktive und passive Abgrenzung
- **DATEV-Export**: Übergabe an Steuerberater
    `,
    keywords: [
      "rechnung",
      "buchhaltung",
      "finanzen",
      "debitor",
      "kreditor",
      "zahlung",
    ],
  },

  // Sales - Extended
  {
    id: "sales-process",
    title: "Vertriebsprozess",
    category: "sales",
    content: `
# Vertriebsprozess

## Lead-to-Cash Pipeline

### Lead-Management
- **Lead-Erfassung**: Manuelle Eingabe oder Import
- **Lead-Qualifizierung**: BANT-Kriterien (Budget, Authority, Need, Timeline)
- **Lead-Scoring**: Automatische Bewertung nach Kriterien
- **Lead-Nurturing**: Automatisierte Follow-up-Kampagnen
- **Lead-Übergabe**: Vom Marketing an Vertrieb

### Opportunity-Management
- **Verkaufschance erstellen**: Aus qualifizierten Leads
- **Pipeline-Stages**:
  1. Qualifizierung
  2. Bedarfsanalyse
  3. Angebot
  4. Verhandlung
  5. Abschluss (Gewonnen/Verloren)
- **Wahrscheinlichkeit**: Abschlusswahrscheinlichkeit in %
- **Forecast**: Umsatzprognose basierend auf Pipeline
- **Win/Loss-Analyse**: Gründe für Erfolg oder Misserfolg

### Angebotserstellung
- **Angebotsvorlagen**: Templates für verschiedene Produkte
- **Konfiguration**: Produktbundle und Optionen
- **Preiskalkulation**: Basis-, Listen- und Sonderpreise
- **Rabatte**: Mengen-, Kunden- und Projektrabatte
- **Gültigkeitsdauer**: Befristung der Angebote
- **Versionierung**: Mehrere Angebotsversionen

### Auftragsabwicklung
- **Auftragsbestätigung**: Automatische Generierung
- **Verfügbarkeitsprüfung**: Lagerbestand und Liefertermine
- **Produktionsplanung**: Bei Fertigungsaufträgen
- **Liefertermine**: Kommunikation mit Kunden
- **Teillieferungen**: Aufspaltung großer Aufträge

## Customer Relationship Management

### Kundenverwaltung
- **Kundenstammdaten**: Adressen, Kontakte, Konditionen
- **Kundensegmentierung**: ABC-Analyse, Branchen
- **Kundenwert**: Customer Lifetime Value (CLV)
- **Kundenhistorie**: Alle Interaktionen und Transaktionen

### Kontaktverwaltung
- **Kontaktpersonen**: Ansprechpartner beim Kunden
- **Rollen**: Entscheider, Einkäufer, Anwender
- **Kommunikationshistorie**: E-Mails, Anrufe, Meetings
- **Aufgaben**: Follow-ups und To-Dos

### Aktivitäten
- **Termine**: Kundenbesuche, Telefonate
- **Aufgaben**: To-Do-Liste pro Kunde
- **Notizen**: Gesprächsprotokolle
- **Dokumente**: Verträge, Präsentationen
    `,
    keywords: ["vertrieb", "sales", "angebot", "auftrag", "kunde", "crm"],
  },

  // Development
  {
    id: "dev-setup",
    title: "Entwickler-Setup",
    category: "development",
    content: `
# Entwickler-Setup

## Voraussetzungen

- Node.js >= 18.18.0
- npm oder yarn
- Git

## Installation

\`\`\`bash
# Repository klonen
git clone https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git
cd ERP_SteinmetZ_V1

# Dependencies installieren
npm install

# Environment-Variablen konfigurieren
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
\`\`\`

## Development-Server starten

\`\`\`bash
# Frontend + Backend zusammen
npm run dev

# Nur Frontend
npm run dev:frontend

# Nur Backend
npm run dev:backend
\`\`\`

## Tests ausführen

\`\`\`bash
# Alle Tests
npm test

# Mit Coverage
npm run test:coverage

# Nur Backend-Tests
npm run test:backend

# Nur Frontend-Tests
npm run test:frontend
\`\`\`

## Code-Qualität

\`\`\`bash
# Linting
npm run lint

# Build (TypeScript-Prüfung)
npm run build

# Format
npm run format
\`\`\`

## Weitere Ressourcen

Weitere Informationen finden Sie in:
- Developer Onboarding Guide
- Code Conventions
- Contributing Guidelines
- Architecture Documentation
    `,
    keywords: ["entwicklung", "setup", "installation", "entwickler"],
  },
];
