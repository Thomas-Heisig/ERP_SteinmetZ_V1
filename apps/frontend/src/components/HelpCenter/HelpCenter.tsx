// SPDX-License-Identifier: MIT
// apps/frontend/src/components/HelpCenter/HelpCenter.tsx

import React, { useState } from "react";
import "./HelpCenter.css";

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
}

interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    name: "Erste Schritte",
    icon: "🚀",
    description: "Lernen Sie die Grundlagen von ERP SteinmetZ kennen",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "📊",
    description: "Informationen zur Dashboard-Nutzung",
  },
  {
    id: "crm",
    name: "Kunden (CRM)",
    icon: "🤝",
    description: "Kundenverwaltung und Kontakte",
  },
  {
    id: "inventory",
    name: "Lager",
    icon: "📦",
    description: "Lagerverwaltung und Bestandskontrolle",
  },
  {
    id: "projects",
    name: "Projekte",
    icon: "🎯",
    description: "Projektmanagement und Aufgaben",
  },
  {
    id: "finance",
    name: "Finanzen",
    icon: "💰",
    description: "Rechnungen und Finanzverwaltung",
  },
  {
    id: "hr",
    name: "Personal",
    icon: "👥",
    description: "Personalverwaltung und Zeiterfassung",
  },
  {
    id: "ai",
    name: "KI-Funktionen",
    icon: "🤖",
    description: "KI-Annotator und intelligente Assistenz",
  },
];

const helpArticles: HelpArticle[] = [
  {
    id: "welcome",
    title: "Willkommen bei ERP SteinmetZ",
    category: "getting-started",
    content: `
      ERP SteinmetZ ist ein umfassendes Enterprise Resource Planning System.
      
      **Hauptfunktionen:**
      - Dashboard mit Echtzeitübersicht
      - Kundenverwaltung (CRM)
      - Lagerverwaltung
      - Projektmanagement
      - Finanzverwaltung
      - Personalverwaltung
      - KI-gestützte Funktionen
      
      Verwenden Sie die Sidebar zur Navigation zwischen den verschiedenen Modulen.
    `,
    keywords: ["start", "einführung", "übersicht"],
  },
  {
    id: "navigation",
    title: "Navigation im System",
    category: "getting-started",
    content: `
      **Sidebar:** Verwenden Sie die Sidebar links, um zwischen Modulen zu wechseln.
      
      **Dashboard:** Die Startseite zeigt Ihnen wichtige Kennzahlen und Schnellzugriffe.
      
      **Suche:** Nutzen Sie die Suchfunktion, um schnell Informationen zu finden.
      
      **Shortcuts:** Verwenden Sie Tastenkombinationen für schnellen Zugriff.
    `,
    keywords: ["navigation", "sidebar", "menü"],
  },
  {
    id: "crm-basics",
    title: "Kunden verwalten",
    category: "crm",
    content: `
      **Neuen Kunden anlegen:**
      1. Navigieren Sie zu "Kunden (CRM)"
      2. Klicken Sie auf "Neuer Kunde"
      3. Füllen Sie die erforderlichen Felder aus
      4. Speichern Sie den Kunden
      
      **Kontakte verwalten:**
      - Fügen Sie Kontaktpersonen zu Kunden hinzu
      - Verwalten Sie Kommunikationshistorie
      - Erstellen Sie Angebote und Aufträge
    `,
    keywords: ["kunden", "crm", "kontakte"],
  },
  {
    id: "inventory-basics",
    title: "Lagerverwaltung",
    category: "inventory",
    content: `
      **Artikel verwalten:**
      - Erstellen und bearbeiten Sie Lagerartikel
      - Verfolgen Sie Bestände in Echtzeit
      - Setzen Sie Mindest- und Maximalbestände
      
      **Lagerbewegungen:**
      - Erfassen Sie Wareneingänge
      - Buchen Sie Warenausgänge
      - Führen Sie Inventuren durch
    `,
    keywords: ["lager", "inventory", "bestand"],
  },
  {
    id: "project-basics",
    title: "Projekte verwalten",
    category: "projects",
    content: `
      **Projekt erstellen:**
      1. Wählen Sie "Projekte" in der Navigation
      2. Erstellen Sie ein neues Projekt
      3. Fügen Sie Aufgaben hinzu
      4. Weisen Sie Teammitglieder zu
      
      **Aufgabenverwaltung:**
      - Erstellen Sie Aufgaben mit Prioritäten
      - Setzen Sie Fälligkeitstermine
      - Verfolgen Sie den Fortschritt
    `,
    keywords: ["projekte", "aufgaben", "tasks"],
  },
  {
    id: "ai-features",
    title: "KI-Funktionen nutzen",
    category: "ai",
    content: `
      **AI-Annotator:**
      - Automatische Datenanalyse
      - Intelligente Vorschläge
      - Batch-Verarbeitung
      
      **QuickChat:**
      - Stellen Sie Fragen zum System
      - Erhalten Sie Hilfe in natürlicher Sprache
      - Automatisieren Sie Aufgaben
    `,
    keywords: ["ki", "ai", "chat", "automatisierung"],
  },
];

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null,
  );

  const filteredArticles = helpArticles.filter((article) => {
    const matchesCategory =
      !selectedCategory || article.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="help-center">
      <header className="help-center-header">
        <h1>📚 Hilfe & Dokumentation</h1>
        <p>Finden Sie Antworten und lernen Sie, ERP SteinmetZ zu nutzen</p>

        <div className="help-search">
          <input
            type="search"
            placeholder="Suchen Sie nach Hilfe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="help-search-input"
          />
        </div>
      </header>

      <div className="help-center-content">
        {!selectedArticle ? (
          <>
            <section className="help-categories">
              <h2>Kategorien</h2>
              <div className="category-grid">
                {helpCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-card ${selectedCategory === category.id ? "active" : ""}`}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category.id ? null : category.id,
                      )
                    }
                  >
                    <span className="category-icon">{category.icon}</span>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="help-articles">
              <h2>
                {selectedCategory
                  ? `Artikel: ${helpCategories.find((c) => c.id === selectedCategory)?.name}`
                  : searchQuery
                    ? "Suchergebnisse"
                    : "Beliebte Artikel"}
              </h2>
              <div className="articles-list">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="article-card"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <h3>{article.title}</h3>
                      <p>
                        {article.content.substring(0, 150)}
                        ...
                      </p>
                      <span className="read-more">Mehr erfahren →</span>
                    </div>
                  ))
                ) : (
                  <p className="no-results">
                    Keine Artikel gefunden. Versuchen Sie eine andere Suche.
                  </p>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="article-detail">
            <button
              className="back-button"
              onClick={() => setSelectedArticle(null)}
            >
              ← Zurück
            </button>
            <article>
              <h1>{selectedArticle.title}</h1>
              <div className="article-content">
                {selectedArticle.content.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </article>
          </section>
        )}
      </div>

      <footer className="help-center-footer">
        <p>
          Brauchen Sie weitere Hilfe? Nutzen Sie den QuickChat oder wenden Sie
          sich an den Support.
        </p>
      </footer>
    </div>
  );
};

export default HelpCenter;
