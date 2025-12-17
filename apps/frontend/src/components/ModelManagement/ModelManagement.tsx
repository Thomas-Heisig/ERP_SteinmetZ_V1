// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ModelManagement/ModelManagement.tsx

/**
 * Model Management component for AI/ML models
 * 
 * Features:
 * - View all models with their details
 * - Search models by name or version
 * - Filter by model type (classification, NER, QA, generation)
 * - Filter by status (active, training, archived)
 * - Model cards with accuracy, dataset size, and last trained date
 * - Actions for details, training, and archiving
 * 
 * @example
 * ```tsx
 * <ModelManagement />
 * ```
 */

import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select } from "../ui";
import styles from "./ModelManagement.module.css";

/**
 * AI/ML Model interface
 */
interface Model {
  /** Unique model identifier */
  id: string;
  /** Model name */
  name: string;
  /** Model version string */
  version: string;
  /** Model type */
  type: "classification" | "ner" | "qa" | "generation";
  /** Current model status */
  status: "active" | "training" | "archived";
  /** Model accuracy percentage */
  accuracy: number;
  /** ISO timestamp of last training */
  lastTrained: string;
  /** Number of training dataset entries */
  datasetSize: number;
}

type ModelType = Model["type"];
type ModelStatus = Model["status"];

/**
 * ModelManagement component
 * Displays and manages AI/ML models with filtering and search capabilities
 */
export const ModelManagement: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ModelType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ModelStatus | "all">("all");

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        // Mock data - replace with actual API call
        const mockModels: Model[] = [
          {
            id: "1",
            name: "Text Classification Model v2",
            version: "2.1.0",
            type: "classification",
            status: "active",
            accuracy: 94.5,
            lastTrained: "2025-12-15T10:30:00Z",
            datasetSize: 15000,
          },
          {
            id: "2",
            name: "Named Entity Recognition",
            version: "1.5.2",
            type: "ner",
            status: "active",
            accuracy: 91.2,
            lastTrained: "2025-12-10T14:20:00Z",
            datasetSize: 8500,
          },
          {
            id: "3",
            name: "Question Answering System",
            version: "3.0.1",
            type: "qa",
            status: "training",
            accuracy: 88.7,
            lastTrained: "2025-12-14T09:15:00Z",
            datasetSize: 12000,
          },
          {
            id: "4",
            name: "Text Generation Model",
            version: "1.2.0",
            type: "generation",
            status: "archived",
            accuracy: 86.3,
            lastTrained: "2025-11-20T16:45:00Z",
            datasetSize: 20000,
          },
        ];

        setModels(mockModels);
      } catch (error) {
        console.error("Failed to fetch models:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      searchTerm === "" ||
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.version.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || model.type === filterType;
    const matchesStatus =
      filterStatus === "all" || model.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: ModelStatus) => {
    const config: Record<ModelStatus, { label: string; className: string }> = {
      active: { label: "Aktiv", className: styles.statusActive },
      training: { label: "Training", className: styles.statusTraining },
      archived: { label: "Archiviert", className: styles.statusArchived },
    };
    const c = config[status];
    return (
      <span className={`${styles.statusBadge} ${c.className}`}>{c.label}</span>
    );
  };

  const getTypeLabel = (type: ModelType) => {
    const labels: Record<ModelType, string> = {
      classification: "Klassifikation",
      ner: "Named Entity Recognition",
      qa: "Question Answering",
      generation: "Textgenerierung",
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🤖 Model Management</h1>
          <p className={styles.subtitle}>
            Verwalten Sie Ihre KI-Modelle und deren Versionen
          </p>
        </div>
        <Button variant="primary">+ Neues Modell</Button>
      </div>

      <Card variant="elevated" padding="md">
        <div className={styles.filters}>
          <Input
            placeholder="Modell suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<span>🔍</span>}
            className={styles.searchInput}
          />
          <Select
            value={filterType}
            onChange={(value) => setFilterType(value as ModelType | "all")}
            options={[
              { value: "all", label: "Alle Typen" },
              { value: "classification", label: "Klassifikation" },
              { value: "ner", label: "NER" },
              { value: "qa", label: "QA" },
              { value: "generation", label: "Generierung" },
            ]}
            className={styles.filterSelect}
          />
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value as ModelStatus | "all")}
            options={[
              { value: "all", label: "Alle Status" },
              { value: "active", label: "Aktiv" },
              { value: "training", label: "Training" },
              { value: "archived", label: "Archiviert" },
            ]}
            className={styles.filterSelect}
          />
        </div>
      </Card>

      <div className={styles.modelsGrid}>
        {filteredModels.length === 0 ? (
          <Card variant="outlined" padding="lg">
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🤷</span>
              <p className={styles.emptyText}>
                Keine Modelle gefunden. Passen Sie die Filter an oder erstellen
                Sie ein neues Modell.
              </p>
            </div>
          </Card>
        ) : (
          filteredModels.map((model) => (
            <Card
              key={model.id}
              variant="elevated"
              padding="md"
              className={styles.modelCard}
            >
              <div className={styles.modelHeader}>
                <div>
                  <h3 className={styles.modelName}>{model.name}</h3>
                  <p className={styles.modelVersion}>Version {model.version}</p>
                </div>
                {getStatusBadge(model.status)}
              </div>

              <div className={styles.modelDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Typ:</span>
                  <span className={styles.detailValue}>
                    {getTypeLabel(model.type)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Genauigkeit:</span>
                  <span className={styles.detailValue}>{model.accuracy}%</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Datensatz:</span>
                  <span className={styles.detailValue}>
                    {model.datasetSize.toLocaleString("de-DE")} Einträge
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Zuletzt trainiert:</span>
                  <span className={styles.detailValue}>
                    {new Date(model.lastTrained).toLocaleDateString("de-DE")}
                  </span>
                </div>
              </div>

              <div className={styles.modelActions}>
                <Button variant="outline" size="sm">
                  Details
                </Button>
                <Button variant="outline" size="sm">
                  Training
                </Button>
                <Button variant="ghost" size="sm">
                  Archivieren
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ModelManagement;
