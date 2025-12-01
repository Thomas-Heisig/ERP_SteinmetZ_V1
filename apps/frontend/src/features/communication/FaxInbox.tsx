// SPDX-License-Identifier: MIT
// apps/frontend/src/features/communication/FaxInbox.tsx

import React, { useState, useEffect } from "react";
import { Table, Button, Modal } from "../../components/ui";

interface FaxDocument {
  id: string;
  from: string;
  to: string;
  receivedAt: string;
  pages: number;
  status: "received" | "processing" | "processed" | "failed";
  ocrText?: string;
  classification?: {
    type: string;
    confidence: number;
    suggestedAction?: string;
  };
}

export const FaxInbox: React.FC = () => {
  const [faxes, setFaxes] = useState<FaxDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFax, setSelectedFax] = useState<FaxDocument | null>(null);

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockFaxes: FaxDocument[] = [
      {
        id: "1",
        from: "+49 30 11111111",
        to: "+49 30 22222222",
        receivedAt: new Date(Date.now() - 1800000).toISOString(),
        pages: 3,
        status: "processed",
        ocrText: "Rechnung Nr. 2024-001\n\nSehr geehrte Damen und Herren...",
        classification: {
          type: "invoice",
          confidence: 0.92,
          suggestedAction: "Zur Rechnungsverarbeitung hinzufügen",
        },
      },
      {
        id: "2",
        from: "+49 40 33333333",
        to: "+49 30 22222222",
        receivedAt: new Date(Date.now() - 86400000).toISOString(),
        pages: 1,
        status: "processed",
        ocrText: "Anfrage zu Produkten...",
        classification: {
          type: "inquiry",
          confidence: 0.78,
          suggestedAction: "An Vertrieb weiterleiten",
        },
      },
      {
        id: "3",
        from: "+49 89 44444444",
        to: "+49 30 22222222",
        receivedAt: new Date(Date.now() - 3600000).toISOString(),
        pages: 5,
        status: "processing",
      },
    ];
    
    setFaxes(mockFaxes);
    setLoading(false);
  }, []);

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: FaxDocument["status"]) => {
    const config: Record<string, { label: string; bg: string; color: string }> = {
      received: { label: "Empfangen", bg: "var(--info-50)", color: "var(--info-500)" },
      processing: { label: "Wird verarbeitet", bg: "var(--warning-50)", color: "var(--warning-500)" },
      processed: { label: "Verarbeitet", bg: "var(--success-50)", color: "var(--success-500)" },
      failed: { label: "Fehlgeschlagen", bg: "var(--error-50)", color: "var(--error-500)" },
    };
    const c = config[status];
    return (
      <span
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          background: c.bg,
          color: c.color,
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        {c.label}
      </span>
    );
  };

  const getClassificationBadge = (classification?: FaxDocument["classification"]) => {
    if (!classification) return null;

    const typeLabels: Record<string, string> = {
      invoice: "📄 Rechnung",
      order: "🛒 Bestellung",
      inquiry: "❓ Anfrage",
      complaint: "⚠️ Beschwerde",
      other: "📋 Sonstiges",
    };

    return (
      <span
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          background: "var(--primary-50)",
          color: "var(--primary-700)",
          fontSize: "0.75rem",
        }}
      >
        {typeLabels[classification.type] || classification.type}{" "}
        ({Math.round(classification.confidence * 100)}%)
      </span>
    );
  };

  const columns = [
    {
      key: "from",
      header: "Von",
      render: (value: unknown) => (
        <span style={{ fontFamily: "monospace" }}>{value as string}</span>
      ),
    },
    {
      key: "receivedAt",
      header: "Empfangen",
      width: "120px",
      render: (value: unknown) => formatTime(value as string),
    },
    {
      key: "pages",
      header: "Seiten",
      width: "80px",
      render: (value: unknown) => `${value as number} S.`,
    },
    {
      key: "status",
      header: "Status",
      width: "140px",
      render: (value: unknown) => getStatusBadge(value as FaxDocument["status"]),
    },
    {
      key: "classification",
      header: "Klassifikation",
      render: (value: unknown) => getClassificationBadge(value as FaxDocument["classification"]),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (_: unknown, row: FaxDocument) => (
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <Button
            variant="ghost"
            size="sm"
            title="Anzeigen"
            onClick={() => setSelectedFax(row)}
          >
            👁️
          </Button>
          <Button variant="ghost" size="sm" title="Herunterladen">
            📥
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ color: "var(--text-secondary)" }}>
          {faxes.length} Faxe
        </span>
        <Button variant="outline" size="sm">
          🔄 Aktualisieren
        </Button>
      </div>

      <Table
        columns={columns}
        data={faxes}
        keyField="id"
        loading={loading}
        emptyMessage="Keine Faxe vorhanden"
        hoverable
        onRowClick={(row) => setSelectedFax(row)}
      />

      <Modal
        isOpen={!!selectedFax}
        onClose={() => setSelectedFax(null)}
        title={`Fax von ${selectedFax?.from}`}
        size="lg"
      >
        {selectedFax && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
              }}
            >
              <div>
                <strong>Von:</strong>
                <p style={{ margin: "0.25rem 0" }}>{selectedFax.from}</p>
              </div>
              <div>
                <strong>An:</strong>
                <p style={{ margin: "0.25rem 0" }}>{selectedFax.to}</p>
              </div>
              <div>
                <strong>Empfangen:</strong>
                <p style={{ margin: "0.25rem 0" }}>
                  {new Date(selectedFax.receivedAt).toLocaleString("de-DE")}
                </p>
              </div>
              <div>
                <strong>Seiten:</strong>
                <p style={{ margin: "0.25rem 0" }}>{selectedFax.pages}</p>
              </div>
            </div>

            {selectedFax.classification && (
              <div
                style={{
                  padding: "1rem",
                  background: "var(--primary-50)",
                  borderRadius: "8px",
                }}
              >
                <strong>KI-Klassifikation:</strong>
                <p style={{ margin: "0.5rem 0" }}>
                  Typ: {selectedFax.classification.type} (
                  {Math.round(selectedFax.classification.confidence * 100)}% Konfidenz)
                </p>
                {selectedFax.classification.suggestedAction && (
                  <p style={{ margin: 0, color: "var(--primary-600)" }}>
                    Empfehlung: {selectedFax.classification.suggestedAction}
                  </p>
                )}
              </div>
            )}

            {selectedFax.ocrText && (
              <div>
                <strong>OCR-Text:</strong>
                <pre
                  style={{
                    margin: "0.5rem 0",
                    padding: "1rem",
                    background: "var(--gray-50)",
                    borderRadius: "8px",
                    whiteSpace: "pre-wrap",
                    fontSize: "0.875rem",
                    maxHeight: "200px",
                    overflow: "auto",
                  }}
                >
                  {selectedFax.ocrText}
                </pre>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <Button variant="outline">📥 Herunterladen</Button>
              <Button variant="primary">✅ Verarbeiten</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FaxInbox;
