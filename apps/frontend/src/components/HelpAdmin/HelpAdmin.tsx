// SPDX-License-Identifier: MIT

/**
 * Help Admin Component
 *
 * Admin interface for managing help articles and categories.
 */

import React, { useState, useEffect } from "react";
import {
  getHelpArticles,
  getHelpCategories,
  createHelpArticle,
  updateHelpArticle,
  deleteHelpArticle,
  getHelpStats,
  type HelpArticle,
  type HelpCategory,
} from "../../api/helpApi";
import "./HelpAdmin.css";

export const HelpAdmin: React.FC = () => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState({
    category: "",
    status: "all",
    search: "",
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load articles with filter
      const articlesData = await getHelpArticles({
        category: filter.category || undefined,
        status: filter.status === "all" ? undefined : (filter.status as any),
        search: filter.search || undefined,
      });

      // Load categories
      const categoriesData = await getHelpCategories();

      // Load stats
      const statsData = await getHelpStats();

      setArticles(articlesData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = () => {
    setSelectedArticle({
      id: 0,
      title: "",
      content: "",
      category: "",
      excerpt: "",
      keywords: "",
      icon: "📄",
      status: "draft",
    });
    setIsEditing(true);
  };

  const handleEditArticle = (article: HelpArticle) => {
    setSelectedArticle(article);
    setIsEditing(true);
  };

  const handleSaveArticle = async () => {
    if (!selectedArticle) return;

    try {
      if (selectedArticle.id === 0) {
        // Create new article
        await createHelpArticle(selectedArticle);
      } else {
        // Update existing article
        await updateHelpArticle(selectedArticle.id, selectedArticle);
      }

      setIsEditing(false);
      setSelectedArticle(null);
      loadData();
    } catch (error) {
      console.error("Failed to save article:", error);
      alert("Fehler beim Speichern des Artikels");
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm("Möchten Sie diesen Artikel wirklich löschen?")) {
      return;
    }

    try {
      await deleteHelpArticle(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete article:", error);
      alert("Fehler beim Löschen des Artikels");
    }
  };

  if (loading) {
    return (
      <div className="help-admin">
        <div className="loading">Lade Daten...</div>
      </div>
    );
  }

  return (
    <div className="help-admin">
      <header className="admin-header">
        <h1>📚 Help Desk Administration</h1>
        <button onClick={handleCreateArticle} className="btn-primary">
          ➕ Neuer Artikel
        </button>
      </header>

      {/* Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Gesamt Artikel</h3>
            <p className="stat-value">{stats.totalArticles}</p>
          </div>
          <div className="stat-card">
            <h3>Veröffentlicht</h3>
            <p className="stat-value">{stats.publishedArticles}</p>
          </div>
          <div className="stat-card">
            <h3>Entwürfe</h3>
            <p className="stat-value">{stats.draftArticles}</p>
          </div>
          <div className="stat-card">
            <h3>Gesamt Aufrufe</h3>
            <p className="stat-value">{stats.totalViews}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">Alle Kategorien</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="all">Alle Status</option>
          <option value="draft">Entwurf</option>
          <option value="published">Veröffentlicht</option>
          <option value="archived">Archiviert</option>
        </select>

        <input
          type="search"
          placeholder="Suchen..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
      </div>

      {/* Articles List */}
      <div className="articles-table">
        <table>
          <thead>
            <tr>
              <th>Icon</th>
              <th>Titel</th>
              <th>Kategorie</th>
              <th>Status</th>
              <th>Aufrufe</th>
              <th>Erstellt</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>{article.icon}</td>
                <td>{article.title}</td>
                <td>
                  {categories.find((c) => c.id === article.category)?.name ||
                    article.category}
                </td>
                <td>
                  <span className={`status-badge status-${article.status}`}>
                    {article.status}
                  </span>
                </td>
                <td>{article.view_count || 0}</td>
                <td>
                  {article.created_at
                    ? new Date(article.created_at).toLocaleDateString("de-DE")
                    : "-"}
                </td>
                <td className="actions">
                  <button
                    onClick={() => handleEditArticle(article)}
                    className="btn-small"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="btn-small btn-danger"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {isEditing && selectedArticle && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {selectedArticle.id === 0
                  ? "Neuer Artikel"
                  : "Artikel bearbeiten"}
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedArticle(null);
                }}
                className="btn-close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Titel *</label>
                <input
                  type="text"
                  value={selectedArticle.title}
                  onChange={(e) =>
                    setSelectedArticle({
                      ...selectedArticle,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Kategorie *</label>
                  <select
                    value={selectedArticle.category}
                    onChange={(e) =>
                      setSelectedArticle({
                        ...selectedArticle,
                        category: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Wählen...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={selectedArticle.status}
                    onChange={(e) =>
                      setSelectedArticle({
                        ...selectedArticle,
                        status: e.target.value as any,
                      })
                    }
                    required
                  >
                    <option value="draft">Entwurf</option>
                    <option value="published">Veröffentlicht</option>
                    <option value="archived">Archiviert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Icon</label>
                  <input
                    type="text"
                    value={selectedArticle.icon || ""}
                    onChange={(e) =>
                      setSelectedArticle({
                        ...selectedArticle,
                        icon: e.target.value,
                      })
                    }
                    placeholder="📄"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Kurzbeschreibung</label>
                <input
                  type="text"
                  value={selectedArticle.excerpt || ""}
                  onChange={(e) =>
                    setSelectedArticle({
                      ...selectedArticle,
                      excerpt: e.target.value,
                    })
                  }
                  placeholder="Kurze Beschreibung für die Übersicht"
                />
              </div>

              <div className="form-group">
                <label>Keywords</label>
                <input
                  type="text"
                  value={selectedArticle.keywords || ""}
                  onChange={(e) =>
                    setSelectedArticle({
                      ...selectedArticle,
                      keywords: e.target.value,
                    })
                  }
                  placeholder="keyword1,keyword2,keyword3"
                />
              </div>

              <div className="form-group">
                <label>Pfad (optional)</label>
                <input
                  type="text"
                  value={selectedArticle.path || ""}
                  onChange={(e) =>
                    setSelectedArticle({
                      ...selectedArticle,
                      path: e.target.value,
                    })
                  }
                  placeholder="/docs/example.md"
                />
              </div>

              <div className="form-group">
                <label>Inhalt (Markdown) *</label>
                <textarea
                  value={selectedArticle.content}
                  onChange={(e) =>
                    setSelectedArticle({
                      ...selectedArticle,
                      content: e.target.value,
                    })
                  }
                  rows={15}
                  required
                  placeholder="# Titel&#10;&#10;Inhalt in Markdown..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedArticle(null);
                }}
                className="btn-secondary"
              >
                Abbrechen
              </button>
              <button onClick={handleSaveArticle} className="btn-primary">
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpAdmin;
