// SPDX-License-Identifier: MIT
// apps/frontend/src/features/documents/DocumentList.tsx

import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui";
import "./DocumentList.css";

type DocumentCategory =
  | "invoice"
  | "contract"
  | "employee_document"
  | "report"
  | "correspondence"
  | "other";

type DocumentStatus = "active" | "approved" | "pending" | "archived";

interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  fileType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  tags: string[];
  status: DocumentStatus;
}

export const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<
    DocumentCategory | "all"
  >("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch documents from API
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDocuments(data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
         
        console.error("Failed to load documents:", error);
        setLoading(false);
      });
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    if (categoryFilter !== "all" && doc.category !== categoryFilter)
      return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        doc.title.toLowerCase().includes(searchLower) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryLabel = (category: DocumentCategory) => {
    const labels: Record<DocumentCategory, string> = {
      invoice: "Rechnung",
      contract: "Vertrag",
      employee_document: "Personal",
      report: "Bericht",
      correspondence: "Korrespondenz",
      other: "Sonstige",
    };
    return labels[category];
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const config: Record<DocumentStatus, { label: string; className: string }> =
      {
        active: { label: "Aktiv", className: "info" },
        approved: { label: "Genehmigt", className: "success" },
        pending: { label: "Ausstehend", className: "warning" },
        archived: { label: "Archiviert", className: "secondary" },
      };
    return config[status];
  };

  if (loading) {
    return (
      <div className="documents-loading-container">
        <div className="documents-loading-spinner">Laden...</div>
      </div>
    );
  }

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h1>Dokumentenverwaltung</h1>
        <button className="btn btn-primary">Dokument hochladen</button>
      </div>

      <Card className="documents-filter-card">
        <div className="documents-filter-row">
          <div className="documents-filter-group">
            <label htmlFor="search">Suche</label>
            <input
              id="search"
              type="text"
              className="input"
              placeholder="Dokument suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="documents-filter-group">
            <label htmlFor="category">Kategorie</label>
            <select
              id="category"
              className="select"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as DocumentCategory | "all")
              }
            >
              <option value="all">Alle Kategorien</option>
              <option value="invoice">Rechnungen</option>
              <option value="contract">Verträge</option>
              <option value="employee_document">Personal</option>
              <option value="report">Berichte</option>
              <option value="correspondence">Korrespondenz</option>
              <option value="other">Sonstige</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="documents-table-header">
          <h2>Dokumente ({filteredDocuments.length})</h2>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="documents-empty-state">
            <p>Keine Dokumente gefunden</p>
          </div>
        ) : (
          <div className="documents-table-responsive">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Titel</th>
                  <th>Kategorie</th>
                  <th>Typ</th>
                  <th>Größe</th>
                  <th>Hochgeladen</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => {
                  const statusConfig = getStatusBadge(doc.status);
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div className="doc-title">
                          <strong>{doc.title}</strong>
                          {doc.tags.length > 0 && (
                            <div className="doc-tags">
                              {doc.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="doc-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{getCategoryLabel(doc.category)}</td>
                      <td>{doc.fileType.toUpperCase()}</td>
                      <td>{formatFileSize(doc.size)}</td>
                      <td>{formatDate(doc.uploadedAt)}</td>
                      <td>v{doc.version}</td>
                      <td>
                        <span
                          className={`documents-badge documents-badge-${statusConfig.className}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td>
                        <div className="documents-action-buttons">
                          <button className="btn btn-secondary" title="Ansehen">
                            👁️
                          </button>
                          <button
                            className="btn btn-secondary"
                            title="Herunterladen"
                          >
                            ⬇️
                          </button>
                          <button
                            className="btn btn-secondary"
                            title="Bearbeiten"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DocumentList;
