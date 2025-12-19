// SPDX-License-Identifier: MIT
// apps/frontend/src/components/HelpCenter/HelpCenter.tsx

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { getHelpArticles, getHelpArticle } from "../../api/helpApi";
import "./HelpCenter.css";

interface DocFile {
  id: string;
  title: string;
  category: string;
  path: string;
  content?: string;
  excerpt?: string;
  icon?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
}

const categories: Category[] = [
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

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [documents, setDocuments] = useState<DocFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Lade verfügbare Dokumentationen
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);

        // Lade Artikel vom Backend API
        const articles = await getHelpArticles();
        
        // Konvertiere Backend-Format zu Frontend-Format
        const docs: DocFile[] = articles.map((article) => ({
          id: String(article.id),
          title: article.title,
          category: article.category,
          path: article.path || '',
          excerpt: article.excerpt || '',
          icon: article.icon || '📄',
          content: article.content,
        }));

        setDocuments(docs);
        
        // Fallback zu Mock-Daten wenn API fehlschlägt oder leer ist
        if (articles.length === 0) {
          const mockDocs: DocFile[] = [
          {
            id: "readme",
            title: "ERP SteinmetZ - Übersicht",
            category: "getting-started",
            path: "/docs/README.md",
            excerpt:
              "Willkommen bei ERP SteinmetZ - Ein modernes, KI-gestütztes ERP-System",
            icon: "📖",
          },
          {
            id: "developer-onboarding",
            title: "Developer Onboarding",
            category: "getting-started",
            path: "/docs/DEVELOPER_ONBOARDING.md",
            excerpt: "Schnellstart für neue Entwickler im Projekt",
            icon: "👨‍💻",
          },
          {
            id: "architecture",
            title: "System-Architektur",
            category: "architecture",
            path: "/docs/ARCHITECTURE.md",
            excerpt: "Überblick über die Systemarchitektur und Komponenten",
            icon: "🏗️",
          },
          {
            id: "ai-annotator",
            title: "AI Annotator Integration",
            category: "ai",
            path: "/docs/AI_ANNOTATOR_INTEGRATION.md",
            excerpt: "KI-gestützter Annotator für strukturierte Dateneingabe",
            icon: "🤖",
          },
          {
            id: "ai-ui-guide",
            title: "AI Annotator UI Guide",
            category: "ai",
            path: "/docs/AI_ANNOTATOR_UI_GUIDE.md",
            excerpt: "Benutzeroberfläche und Bedienung des AI Annotators",
            icon: "🎨",
          },
          {
            id: "ai-workflow",
            title: "AI Annotator Workflow",
            category: "ai",
            path: "/docs/AI_ANNOTATOR_WORKFLOW.md",
            excerpt: "Workflows und Best Practices für den AI Annotator",
            icon: "🔄",
          },
          {
            id: "advanced-filters",
            title: "Advanced Filters Guide",
            category: "ai",
            path: "/docs/ADVANCED_FILTERS_GUIDE.md",
            excerpt: "Erweiterte Filter- und Suchmöglichkeiten",
            icon: "🔍",
          },
          {
            id: "database-migrations",
            title: "Database Migrations",
            category: "architecture",
            path: "/docs/DATABASE_MIGRATIONS.md",
            excerpt: "Datenbank-Migrationen und Schema-Management",
            icon: "🗄️",
          },
          {
            id: "authentication",
            title: "Authentication System",
            category: "integration",
            path: "/docs/AUTHENTICATION.md",
            excerpt: "Authentifizierung und Autorisierung",
            icon: "🔐",
          },
          {
            id: "websocket",
            title: "WebSocket & Realtime",
            category: "integration",
            path: "/docs/WEBSOCKET_REALTIME.md",
            excerpt: "Echtzeit-Kommunikation mit WebSockets",
            icon: "⚡",
          },
          {
            id: "monitoring",
            title: "Monitoring & Observability",
            category: "deployment",
            path: "/docs/MONITORING.md",
            excerpt: "System-Monitoring und Observability",
            icon: "📊",
          },
          {
            id: "sentry",
            title: "Sentry Integration",
            category: "deployment",
            path: "/docs/SENTRY_INTEGRATION.md",
            excerpt: "Error-Tracking mit Sentry",
            icon: "🐛",
          },
          {
            id: "code-conventions",
            title: "Code Conventions",
            category: "development",
            path: "/docs/CODE_CONVENTIONS.md",
            excerpt: "Coding Standards und Best Practices",
            icon: "📝",
          },
          {
            id: "dashboard",
            title: "Dashboard Module",
            category: "modules",
            path: "/docs/DASHBOARD_FIX_STATUS.md",
            excerpt: "Dashboard-Komponente und Funktionen",
            icon: "📊",
          },
          {
            id: "finance",
            title: "Finance Module Guide",
            category: "modules",
            path: "/docs/FINANCE_MODULE_GUIDE.md",
            excerpt: "Finanzmodul - Buchhaltung und Controlling",
            icon: "💰",
          },
          {
            id: "hr",
            title: "HR Module Guide",
            category: "modules",
            path: "/docs/HR_MODULE_GUIDE.md",
            excerpt: "Personalverwaltung und HR-Funktionen",
            icon: "👥",
          },
          {
            id: "environment",
            title: "Environment Variables",
            category: "reference",
            path: "/docs/ENVIRONMENT_VARIABLES.md",
            excerpt: "Umgebungsvariablen und Konfiguration",
            icon: "⚙️",
          },
          {
            id: "backup",
            title: "Backup & Restore",
            category: "deployment",
            path: "/docs/BACKUP_RESTORE.md",
            excerpt: "Daten-Backup und Wiederherstellung",
            icon: "💾",
          },
        ];

          setDocuments(mockDocs);
        }
      } catch (error) {
        console.error("Failed to load documents:", error);
        
        // Bei Fehler: Nutze Mock-Daten als Fallback
        const mockDocs: DocFile[] = [
          {
            id: "readme",
            title: "ERP SteinmetZ - Übersicht",
            category: "getting-started",
            path: "/docs/README.md",
            excerpt:
              "Willkommen bei ERP SteinmetZ - Ein modernes, KI-gestütztes ERP-System",
            icon: "📖",
          },
          {
            id: "developer-onboarding",
            title: "Developer Onboarding",
            category: "getting-started",
            path: "/docs/DEVELOPER_ONBOARDING.md",
            excerpt: "Schnellstart für neue Entwickler im Projekt",
            icon: "👨‍💻",
          },
        ];
        setDocuments(mockDocs);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  // Filtere Dokumente basierend auf Kategorie und Suche
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory =
        !selectedCategory || doc.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [documents, selectedCategory, searchQuery]);

  // Zähle Dokumente pro Kategorie
  const documentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach((doc) => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    });
    return counts;
  }, [documents]);

  const handleDocumentClick = async (doc: DocFile) => {
    // Lade den Inhalt des Dokuments vom Backend API
    try {
      const article = await getHelpArticle(doc.id);
      setSelectedDoc({ 
        ...doc, 
        content: article.content 
      });
    } catch (error) {
      console.error("Failed to load document:", error);
      
      // Fallback: Versuche direkt von Pfad zu laden
      try {
        const fileResponse = await fetch(doc.path);
        if (fileResponse.ok) {
          const content = await fileResponse.text();
          setSelectedDoc({ ...doc, content });
        } else {
          throw new Error('File not found');
        }
      } catch (fallbackError) {
        setSelectedDoc({
          ...doc,
          content: `# ${doc.title}\n\n${doc.excerpt}\n\n*Fehler beim Laden der Dokumentation.*`,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="help-center">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Lade Dokumentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="help-center">
      <div className="help-container">
        {/* Header */}
        {!selectedDoc && (
          <header className="help-header">
            <h1>📚 Hilfe & Dokumentation</h1>
            <p className="help-subtitle">
              Umfassende Dokumentation für alle Aspekte von ERP SteinmetZ
            </p>

            {/* Search */}
            <div className="help-search">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="search"
                  placeholder="Dokumentation durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </header>
        )}

        {/* Main Layout */}
        <div className={selectedDoc ? "help-content" : "help-layout"}>
          {!selectedDoc && (
            <>
              {/* Sidebar */}
              <aside className="help-sidebar">
                <h3 className="sidebar-title">Kategorien</h3>
                <nav>
                  <ul className="category-nav">
                    <li className="category-nav-item">
                      <button
                        className={`category-nav-button ${!selectedCategory ? "active" : ""}`}
                        onClick={() => setSelectedCategory(null)}
                      >
                        <span className="category-nav-icon">📋</span>
                        <span>Alle Dokumente</span>
                        <span className="category-count">
                          {documents.length}
                        </span>
                      </button>
                    </li>
                    {categories
                      .sort((a, b) => a.order - b.order)
                      .map((category) => (
                        <li key={category.id} className="category-nav-item">
                          <button
                            className={`category-nav-button ${selectedCategory === category.id ? "active" : ""}`}
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            <span className="category-nav-icon">
                              {category.icon}
                            </span>
                            <span>{category.name}</span>
                            <span className="category-count">
                              {documentCounts[category.id] || 0}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                </nav>
              </aside>

              {/* Content */}
              <div className="help-content">
                {/* Articles Section */}
                <section className="articles-section">
                  <div className="articles-header">
                    <div>
                      <h2 className="section-title">
                        {selectedCategory
                          ? categories.find((c) => c.id === selectedCategory)
                              ?.name
                          : searchQuery
                            ? "Suchergebnisse"
                            : "Alle Dokumente"}
                      </h2>
                      <p className="results-count">
                        {filteredDocuments.length}{" "}
                        {filteredDocuments.length === 1
                          ? "Dokument"
                          : "Dokumente"}
                      </p>
                    </div>

                    <div className="view-toggle">
                      <button
                        className={`view-button ${viewMode === "grid" ? "active" : ""}`}
                        onClick={() => setViewMode("grid")}
                        title="Gitteransicht"
                      >
                        ▦
                      </button>
                      <button
                        className={`view-button ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                        title="Listenansicht"
                      >
                        ☰
                      </button>
                    </div>
                  </div>

                  {filteredDocuments.length > 0 ? (
                    <div
                      className={
                        viewMode === "grid" ? "articles-grid" : "articles-list"
                      }
                    >
                      {filteredDocuments.map((doc) => (
                        <article
                          key={doc.id}
                          className="article-card"
                          onClick={() => handleDocumentClick(doc)}
                        >
                          <div className="article-header">
                            <span className="article-icon">{doc.icon}</span>
                            <div className="article-info">
                              <h3 className="article-title">{doc.title}</h3>
                              <div className="article-meta">
                                <span>
                                  {
                                    categories.find(
                                      (c) => c.id === doc.category,
                                    )?.name
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="article-excerpt">{doc.excerpt}</p>
                          <span className="read-more">
                            Mehr lesen <span>→</span>
                          </span>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="no-results">
                      <div className="no-results-icon">🔍</div>
                      <h3>Keine Dokumente gefunden</h3>
                      <p>
                        Versuchen Sie eine andere Suche oder wählen Sie eine
                        andere Kategorie.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {/* Article Detail */}
          {selectedDoc && (
            <section className="article-detail">
              <button
                className="back-button"
                onClick={() => setSelectedDoc(null)}
              >
                ← Zurück zur Übersicht
              </button>

              <div className="article-detail-header">
                <h1 className="article-detail-title">{selectedDoc.title}</h1>
                <div className="article-detail-meta">
                  <span>
                    📂{" "}
                    {
                      categories.find((c) => c.id === selectedDoc.category)
                        ?.name
                    }
                  </span>
                </div>
              </div>

              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {selectedDoc.content || ""}
                </ReactMarkdown>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        {!selectedDoc && (
          <footer className="help-footer">
            <h3>Brauchen Sie weitere Hilfe?</h3>
            <p>
              Nutzen Sie unseren KI-Assistenten für personalisierte
              Unterstützung oder besuchen Sie unsere Community-Foren.
            </p>
            <div className="footer-actions">
              <Link to="/ai" className="footer-button">
                <span>🤖</span>
                AI Annotator öffnen
              </Link>
              <a
                href="mailto:support@erp-steinmetz.de"
                className="footer-button secondary"
              >
                <span>📧</span>
                Support kontaktieren
              </a>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;
