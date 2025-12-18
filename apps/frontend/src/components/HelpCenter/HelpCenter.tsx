// SPDX-License-Identifier: MIT
// apps/frontend/src/components/HelpCenter/HelpCenter.tsx

import React, { useState } from "react";
import "./HelpCenter.css";
import {
  helpCategories,
  helpArticles,
  type HelpArticle,
} from "../../data/helpDeskContent";

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null,
  );

  // Sort categories by order
  const sortedCategories = [...helpCategories].sort(
    (a, b) => a.order - b.order,
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

  // Simple markdown-like rendering helper
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      // Handle headings
      if (line.startsWith("### ")) {
        return (
          <h3
            key={index}
            style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}
          >
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            style={{ marginTop: "2rem", marginBottom: "0.75rem" }}
          >
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} style={{ marginTop: "2rem", marginBottom: "1rem" }}>
            {line.substring(2)}
          </h1>
        );
      }
      // Handle bold
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={index}>
            {parts.map((part, i) =>
              i % 2 === 0 ? part : <strong key={i}>{part}</strong>,
            )}
          </p>
        );
      }
      // Handle list items
      if (line.trim().startsWith("- ")) {
        return <li key={index}>{line.substring(2)}</li>;
      }
      // Regular paragraphs
      if (line.trim()) {
        return <p key={index}>{line}</p>;
      }
      return null;
    });
  };

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
                {sortedCategories.map((category) => (
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
                {renderContent(selectedArticle.content)}
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
