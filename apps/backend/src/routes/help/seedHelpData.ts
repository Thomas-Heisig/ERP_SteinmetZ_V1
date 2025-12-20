// SPDX-License-Identifier: MIT

/**
 * Help System Data Seeding
 *
 * Seeds the help system with initial categories and articles from documentation.
 *
 * @module seedHelpData
 */

import { createLogger } from "../../utils/logger.js";
import db from "../database/dbService.js";
import type { SqlValue } from "../database/database.js";

const logger = createLogger("help-seed");

type ArticleStatus = "draft" | "published" | "archived";

interface SeedCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
}

interface SeedArticle {
  title: string;
  category: string;
  excerpt: string;
  keywords: string;
  icon: string;
  path: string;
  status: ArticleStatus;
  content: string;
}

const CATEGORIES: SeedCategory[] = [
  {
    id: "getting-started",
    name: "Erste Schritte",
    icon: "🚀",
    description: "Einführung und erste Schritte mit ERP SteinmetZ",
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
    id: "architecture",
    name: "Architektur",
    icon: "🏗️",
    description: "Systemarchitektur und technische Konzepte",
    order: 3,
  },
  {
    id: "development",
    name: "Entwicklung",
    icon: "💻",
    description: "Entwickler-Dokumentation und Guidelines",
    order: 4,
  },
  {
    id: "modules",
    name: "Module & Features",
    icon: "🧩",
    description: "Einzelne Module und deren Funktionen",
    order: 5,
  },
  {
    id: "ai",
    name: "KI & Automatisierung",
    icon: "🤖",
    description: "AI Annotator und KI-gestützte Features",
    order: 6,
  },
  {
    id: "integration",
    name: "Integration & APIs",
    icon: "🔌",
    description: "API-Dokumentation und Integrationen",
    order: 7,
  },
  {
    id: "deployment",
    name: "Deployment & Monitoring",
    icon: "🚀",
    description: "Deployment, Monitoring und Betrieb",
    order: 8,
  },
  {
    id: "tutorials",
    name: "Tutorials & How-To",
    icon: "📖",
    description: "Schritt-für-Schritt Anleitungen",
    order: 9,
  },
  {
    id: "reference",
    name: "Referenz",
    icon: "📚",
    description: "Technische Referenzdokumentation",
    order: 10,
  },
];

const ARTICLES: SeedArticle[] = [
  {
    title: "ERP SteinmetZ - Übersicht",
    category: "getting-started",
    excerpt:
      "Willkommen bei ERP SteinmetZ - Ein modernes, KI-gestütztes ERP-System",
    keywords: "erp,einführung,übersicht,willkommen",
    icon: "📖",
    path: "/docs/README.md",
    status: "published",
    content: `# ERP SteinmetZ - Übersicht

Willkommen bei ERP SteinmetZ - Ein modernes, KI-gestütztes ERP-System.

## Hauptfunktionen

- Dashboard mit Echtzeitübersicht
- Module für alle Geschäftsbereiche
- KI-gestützte Funktionen
- Moderne Technologie-Stack

## Navigation

Verwenden Sie die Sidebar links, um zwischen den verschiedenen Modulen zu wechseln.

Weitere Details finden Sie in der [vollständigen Dokumentation](/docs/README.md).`,
  },
  {
    title: "Developer Onboarding",
    category: "getting-started",
    excerpt: "Schnellstart für neue Entwickler im Projekt",
    keywords: "entwickler,setup,installation,onboarding",
    icon: "👨‍💻",
    path: "/docs/DEVELOPER_ONBOARDING.md",
    status: "published",
    content: `# Developer Onboarding

Schnellstart für neue Entwickler.

## Voraussetzungen

- Node.js >= 18.18.0
- npm oder yarn
- Git

## Installation

\`\`\`bash
git clone https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1.git
cd ERP_SteinmetZ_V1
npm install
\`\`\`

Weitere Details siehe [DEVELOPER_ONBOARDING.md](/docs/DEVELOPER_ONBOARDING.md).`,
  },
  {
    title: "System-Architektur",
    category: "architecture",
    excerpt: "Überblick über die Systemarchitektur und Komponenten",
    keywords: "architektur,system,design,komponenten",
    icon: "🏗️",
    path: "/docs/ARCHITECTURE.md",
    status: "published",
    content: `# System-Architektur

Überblick über die Systemarchitektur.

## Komponenten

- Frontend: React 19 mit TypeScript
- Backend: Node.js mit Express
- Database: SQLite (dev) / PostgreSQL (prod)

Weitere Details siehe [ARCHITECTURE.md](/docs/ARCHITECTURE.md).`,
  },
  {
    title: "AI Annotator Integration",
    category: "ai",
    excerpt: "KI-gestützter Annotator für strukturierte Dateneingabe",
    keywords: "ki,ai,annotator,automatisierung",
    icon: "🤖",
    path: "/docs/AI_ANNOTATOR_INTEGRATION.md",
    status: "published",
    content: `# AI Annotator Integration

Der AI Annotator ist ein intelligentes System zur automatischen Analyse und Anreicherung von Daten.

## Funktionen

- Automatische Datenanalyse
- Metadaten-Generierung
- Regelextraktion
- Formular-Generierung

Weitere Details siehe [AI_ANNOTATOR_INTEGRATION.md](/docs/AI_ANNOTATOR_INTEGRATION.md).`,
  },
  {
    title: "Code Conventions",
    category: "development",
    excerpt: "Coding Standards und Best Practices",
    keywords: "code,standards,conventions,typescript",
    icon: "📝",
    path: "/docs/CODE_CONVENTIONS.md",
    status: "published",
    content: `# Code Conventions

Unsere Coding Standards und Best Practices.

## TypeScript

- Verwenden Sie strict mode
- Typen für alle Funktionen
- Keine any-Types

Weitere Details siehe [CODE_CONVENTIONS.md](/docs/CODE_CONVENTIONS.md).`,
  },
  {
    title: "Finance Module Guide",
    category: "modules",
    excerpt: "Finanzmodul - Buchhaltung und Controlling",
    keywords: "finanzen,buchhaltung,controlling,rechnung",
    icon: "💰",
    path: "/docs/FINANCE_MODULE_GUIDE.md",
    status: "published",
    content: `# Finance Module Guide

Das Finanzmodul bietet umfassende Funktionen für Buchhaltung und Controlling.

## Funktionen

- Rechnungserstellung
- Debitorenbuchhaltung
- Kreditorenbuchhaltung
- Mahnwesen

Weitere Details siehe [FINANCE_MODULE_GUIDE.md](/docs/FINANCE_MODULE_GUIDE.md).`,
  },
  {
    title: "HR Module Guide",
    category: "modules",
    excerpt: "Personalverwaltung und HR-Funktionen",
    keywords: "personal,hr,mitarbeiter,urlaub",
    icon: "👥",
    path: "/docs/HR_MODULE_GUIDE.md",
    status: "published",
    content: `# HR Module Guide

Personalverwaltung und HR-Funktionen.

## Funktionen

- Mitarbeiterverwaltung
- Zeiterfassung
- Urlaubsverwaltung
- Gehaltsabrechnung

Weitere Details siehe [HR_MODULE_GUIDE.md](/docs/HR_MODULE_GUIDE.md).`,
  },
  {
    title: "Authentication System",
    category: "integration",
    excerpt: "Authentifizierung und Autorisierung",
    keywords: "auth,authentifizierung,login,sicherheit",
    icon: "🔐",
    path: "/docs/AUTHENTICATION.md",
    status: "published",
    content: `# Authentication System

Authentifizierung und Autorisierung im ERP System.

## Funktionen

- JWT-basierte Authentifizierung
- Role-based Access Control (RBAC)
- Session Management

Weitere Details siehe [AUTHENTICATION.md](/docs/AUTHENTICATION.md).`,
  },
  {
    title: "Monitoring & Observability",
    category: "deployment",
    excerpt: "System-Monitoring und Observability",
    keywords: "monitoring,observability,metrics,logging",
    icon: "📊",
    path: "/docs/MONITORING.md",
    status: "published",
    content: `# Monitoring & Observability

System-Monitoring und Observability Setup.

## Komponenten

- Health Checks
- Metrics Collection
- Error Tracking (Sentry)
- Tracing (OpenTelemetry)

Weitere Details siehe [MONITORING.md](/docs/MONITORING.md).`,
  },
  {
    title: "Environment Variables",
    category: "reference",
    excerpt: "Umgebungsvariablen und Konfiguration",
    keywords: "environment,config,konfiguration,setup",
    icon: "⚙️",
    path: "/docs/ENVIRONMENT_VARIABLES.md",
    status: "published",
    content: `# Environment Variables

Umgebungsvariablen und Konfiguration.

## Wichtige Variablen

- NODE_ENV
- PORT
- DATABASE_URL
- JWT_SECRET

Weitere Details siehe [ENVIRONMENT_VARIABLES.md](/docs/ENVIRONMENT_VARIABLES.md).`,
  },
];

/**
 * Seed help categories
 */
async function seedCategories(): Promise<void> {
  logger.info("Seeding help categories...");

  for (const category of CATEGORIES) {
    try {
      // Check if category already exists
      const existing = await db.get<{ id: string }>(
        "SELECT id FROM help_categories WHERE id = ?",
        [category.id],
      );

      if (existing) {
        logger.debug(
          { categoryId: category.id },
          "Category already exists, skipping",
        );
        continue;
      }

      const params: SqlValue[] = [
        category.id,
        category.name,
        category.icon,
        category.description,
        category.order,
      ];

      await db.run(
        `INSERT INTO help_categories (id, name, icon, description, \`order\`)
         VALUES (?, ?, ?, ?, ?)`,
        params,
      );

      logger.info({ categoryId: category.id }, "Seeded category");
    } catch (error) {
      logger.error({ error, category: category.id }, "Failed to seed category");
    }
  }

  logger.info("Help categories seeded successfully");
}

/**
 * Seed help articles
 */
async function seedArticles(): Promise<void> {
  logger.info("Seeding help articles...");

  for (const article of ARTICLES) {
    try {
      // Check if article already exists (by title)
      const existing = await db.get<{ id: number }>(
        "SELECT id FROM help_articles WHERE title = ?",
        [article.title],
      );

      if (existing) {
        logger.debug(
          { title: article.title },
          "Article already exists, skipping",
        );
        continue;
      }

      const params: SqlValue[] = [
        article.title,
        article.content,
        article.category,
        article.excerpt,
        article.keywords,
        article.icon,
        article.path,
        article.status,
        "system",
      ];

      await db.run(
        `INSERT INTO help_articles 
         (title, content, category, excerpt, keywords, icon, path, status, author, created_at, updated_at, view_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 0)`,
        params,
      );

      logger.info({ title: article.title }, "Seeded article");
    } catch (error) {
      logger.error({ error, title: article.title }, "Failed to seed article");
    }
  }

  logger.info("Help articles seeded successfully");
}

/**
 * Main seeding function
 */
export async function seedHelpData(): Promise<void> {
  try {
    logger.info("Starting help data seeding...");

    await seedCategories();
    await seedArticles();

    logger.info("Help data seeding completed successfully");
  } catch (error) {
    logger.error({ error }, "Help data seeding failed");
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedHelpData()
    .then(() => {
      logger.info("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, "Seeding failed");
      process.exit(1);
    });
}
