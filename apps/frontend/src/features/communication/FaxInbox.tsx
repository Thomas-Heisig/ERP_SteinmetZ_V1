// SPDX-License-Identifier: MIT
// apps/frontend/src/features/communication/FaxInbox.tsx

import React, { useState, useEffect } from "react";
import { Table, Button, Modal } from "../../components/ui";
import styles from "./FaxInbox.module.css";

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
  // Mock data - in production, fetch from API
  const [faxes] = useState<FaxDocument[]>(() => [
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
  ]);
  const [loading] = useState(false);
  const [selectedFax, setSelectedFax] = useState<FaxDocument | null>(null);

  // In production, fetch from API on mount
  // useEffect(() => {
  //   fetchFaxesFromAPI();
  // }, []);

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
    const config: Record<string, { label: string; bg: string; color: string }> =
      {
        received: {
          label: "Empfangen",
          bg: "var(--info-50)",
          color: "var(--info-500)",
        },
        processing: {
          label: "Wird verarbeitet",
          bg: "var(--warning-50)",
          color: "var(--warning-500)",
        },
        processed: {
          label: "Verarbeitet",
          bg: "var(--success-50)",
          color: "var(--success-500)",
        },
        failed: {
          label: "Fehlgeschlagen",
          bg: "var(--error-50)",
          color: "var(--error-500)",
        },
      };
    const c = config[status];
    return (
      <span
        className={styles.statusBadge}
        style={{ background: c.bg, color: c.color }}
      >
        {c.label}
      </span>
    );
  };

  const getClassificationBadge = (
    classification?: FaxDocument["classification"],
  ) => {
    if (!classification) return null;

    const typeLabels: Record<string, string> = {
      invoice: "📄 Rechnung",
      order: "🛒 Bestellung",
      inquiry: "❓ Anfrage",
      complaint: "⚠️ Beschwerde",
      other: "📋 Sonstiges",
    };

    return (
      <span className={styles.classificationBadge}>
        {typeLabels[classification.type] || classification.type} (
        {Math.round(classification.confidence * 100)}%)
      </span>
    );
  };

  const columns = [
    {
      key: "from",
      header: "Von",
      render: (value: unknown) => (
        <span className={styles.phoneNumber}>{value as string}</span>
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
      render: (value: unknown) =>
        getStatusBadge(value as FaxDocument["status"]),
    },
    {
      key: "classification",
      header: "Klassifikation",
      render: (value: unknown) =>
        getClassificationBadge(value as FaxDocument["classification"]),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (_: unknown, row: FaxDocument) => (
        <div className={styles.actions}>
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
      <div className={styles.header}>
        <span className={styles.headerText}>{faxes.length} Faxe</span>
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
          <div className={styles.modalContent}>
            <div className={styles.infoGrid}>
              <div>
                <strong>Von:</strong>
                <p className={styles.infoRow}>{selectedFax.from}</p>
              </div>
              <div>
                <strong>An:</strong>
                <p className={styles.infoRow}>{selectedFax.to}</p>
              </div>
              <div>
                <strong>Empfangen:</strong>
                <p className={styles.infoRow}>
                  {new Date(selectedFax.receivedAt).toLocaleString("de-DE")}
                </p>
              </div>
              <div>
                <strong>Seiten:</strong>
                <p className={styles.infoRow}>{selectedFax.pages}</p>
              </div>
            </div>

            {selectedFax.classification && (
              <div className={styles.detailsSection}>
                <strong>KI-Klassifikation:</strong>
                <p className={styles.marginSmall}>
                  Typ: {selectedFax.classification.type} (
                  {Math.round(selectedFax.classification.confidence * 100)}%
                  Konfidenz)
                </p>
                {selectedFax.classification.suggestedAction && (
                  <p className={styles.classificationRecommendationText}>
                    Empfehlung: {selectedFax.classification.suggestedAction}
                  </p>
                )}
              </div>
            )}

            {selectedFax.ocrText && (
              <div className={styles.textContent}>
                <strong>OCR-Text:</strong>
                <pre className={styles.ocrText}>{selectedFax.ocrText}</pre>
              </div>
            )}

            <div className={styles.actions}>
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
