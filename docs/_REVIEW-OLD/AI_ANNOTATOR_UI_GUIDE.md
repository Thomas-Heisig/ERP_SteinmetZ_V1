# AI Annotator UI Implementation Guide

**Stand**: Dezember 2025  
**Version**: 0.3.0

Dieses Dokument beschreibt die Implementierung der Benutzeroberfläche für das AI Annotator System.

---

## 📋 Überblick

Das AI Annotator UI ermöglicht Benutzern die Verwaltung von Batch-Verarbeitungen, Quality-Assurance-Workflows und AI-Model-Management.

---

## 🎯 Features

1. **Batch Processing UI**: Erstellen und Überwachen von Batch-Operationen
2. **Quality Assurance Dashboard**: Überprüfung und Genehmigung von AI-generierten Annotationen
3. **Model Management UI**: Auswahl und Verwaltung von AI-Modellen
4. **Progress Tracking**: Echtzeit-Fortschrittsanzeige für Batch-Operationen
5. **Result Visualization**: Visualisierung von Annotations-Ergebnissen

---

## 🏗️ Component Structure

```
src/components/AIAnnotator/
├── BatchProcessing/
│   ├── BatchCreateForm.tsx        # Formular zur Batch-Erstellung
│   ├── BatchList.tsx              # Liste aller Batches
│   ├── BatchDetail.tsx            # Detail-Ansicht eines Batches
│   ├── BatchProgress.tsx          # Fortschrittsanzeige
│   └── BatchHistory.tsx           # Batch-Historie
├── QualityAssurance/
│   ├── QADashboard.tsx            # QA-Übersicht
│   ├── ReviewQueue.tsx            # Warteschlange zur Überprüfung
│   ├── ReviewItem.tsx             # Einzelne Überprüfung
│   ├── ApprovalWorkflow.tsx       # Genehmigungsworkflow
│   └── QualityMetrics.tsx         # Qualitätsmetriken
├── ModelManagement/
│   ├── ModelSelector.tsx          # Model-Auswahl
│   ├── ModelComparison.tsx        # Model-Vergleich
│   ├── CostTracker.tsx            # Kosten-Tracking
│   └── UsageStatistics.tsx        # Nutzungsstatistiken
└── ResultVisualization/
    ├── AnnotationViewer.tsx       # Annotations-Viewer
    ├── DiffViewer.tsx             # Vergleich von Annotations
    └── MetadataDisplay.tsx        # Metadaten-Anzeige
```

---

## 💻 Implementation

### 1. Batch Create Form

```typescript
// src/components/AIAnnotator/BatchProcessing/BatchCreateForm.tsx
import { useState } from 'react';
import { z } from 'zod';

const batchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  nodeIds: z.array(z.string()).min(1, 'Select at least one node'),
  model: z.enum(['gpt-4', 'gpt-4o-mini', 'claude-3-sonnet', 'ollama']),
  priority: z.enum(['low', 'normal', 'high']),
  options: z.object({
    extractMetadata: z.boolean(),
    validateSchema: z.boolean(),
    enrichContent: z.boolean(),
  }),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface BatchCreateFormProps {
  onSubmit: (data: BatchFormData) => Promise<void>;
  onCancel: () => void;
}

export function BatchCreateForm({ onSubmit, onCancel }: BatchCreateFormProps) {
  const [formData, setFormData] = useState<Partial<BatchFormData>>({
    priority: 'normal',
    options: {
      extractMetadata: true,
      validateSchema: true,
      enrichContent: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = batchSchema.parse(formData);
      setIsSubmitting(true);
      await onSubmit(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="batch-create-form">
      <h2>Create Batch Processing Job</h2>

      <div className="form-field">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name || ''}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-field">
        <label htmlFor="model">AI Model *</label>
        <select
          id="model"
          value={formData.model || ''}
          onChange={e => setFormData({ ...formData, model: e.target.value as any })}
          className={errors.model ? 'error' : ''}
        >
          <option value="">Select a model</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          <option value="ollama">Ollama (Local)</option>
        </select>
        {errors.model && <span className="error-message">{errors.model}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={formData.priority || 'normal'}
          onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="form-field">
        <label>Options</label>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.options?.extractMetadata}
              onChange={e => setFormData({
                ...formData,
                options: { ...formData.options!, extractMetadata: e.target.checked }
              })}
            />
            Extract Metadata
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.options?.validateSchema}
              onChange={e => setFormData({
                ...formData,
                options: { ...formData.options!, validateSchema: e.target.checked }
              })}
            />
            Validate Schema
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.options?.enrichContent}
              onChange={e => setFormData({
                ...formData,
                options: { ...formData.options!, enrichContent: e.target.checked }
              })}
            />
            Enrich Content
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Batch'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
```

### 2. Batch Progress Component

```typescript
// src/components/AIAnnotator/BatchProcessing/BatchProgress.tsx
import { useEffect, useState } from 'react';
import { useWebSocket } from '../../../hooks/useWebSocket';

interface BatchStatus {
  batchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  current: number;
  total: number;
  startedAt?: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
}

interface BatchProgressProps {
  batchId: string;
}

export function BatchProgress({ batchId }: BatchProgressProps) {
  const [status, setStatus] = useState<BatchStatus | null>(null);

  // Listen for progress updates via WebSocket
  useWebSocket('batch:progress', (data) => {
    if (data.batchId === batchId) {
      setStatus({
        batchId: data.batchId,
        status: data.status,
        progress: data.progress,
        current: data.current,
        total: data.total,
        estimatedTimeRemaining: data.estimatedTimeRemaining
      });
    }
  });

  // Listen for completion
  useWebSocket('batch:completed', (data) => {
    if (data.batchId === batchId) {
      setStatus(prev => prev ? {
        ...prev,
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString()
      } : null);
    }
  });

  // Initial status load
  useEffect(() => {
    fetchBatchStatus();
  }, [batchId]);

  const fetchBatchStatus = async () => {
    try {
      const response = await fetch(`/api/ai-annotator/batches/${batchId}/status`);
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Failed to fetch batch status:', error);
    }
  };

  if (!status) {
    return <div>Loading...</div>;
  }

  return (
    <div className="batch-progress">
      <div className="progress-header">
        <h3>Batch Progress</h3>
        <span className={`status-badge status-${status.status}`}>
          {status.status}
        </span>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${status.progress}%` }}
        />
      </div>

      <div className="progress-details">
        <div>
          <strong>Progress:</strong> {status.current} / {status.total} ({status.progress}%)
        </div>
        {status.estimatedTimeRemaining && (
          <div>
            <strong>Estimated Time Remaining:</strong>{' '}
            {formatDuration(status.estimatedTimeRemaining)}
          </div>
        )}
        {status.startedAt && (
          <div>
            <strong>Started:</strong> {formatDate(status.startedAt)}
          </div>
        )}
        {status.completedAt && (
          <div>
            <strong>Completed:</strong> {formatDate(status.completedAt)}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. Quality Assurance Dashboard

```typescript
// src/components/AIAnnotator/QualityAssurance/QADashboard.tsx
import { useState, useEffect } from 'react';
import { ReviewQueue } from './ReviewQueue';
import { QualityMetrics } from './QualityMetrics';

interface QAStats {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
  averageConfidence: number;
  qualityScore: number;
}

export function QADashboard() {
  const [stats, setStats] = useState<QAStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<'queue' | 'metrics'>('queue');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ai-annotator/qa/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch QA stats:', error);
    }
  };

  return (
    <div className="qa-dashboard">
      <div className="qa-header">
        <h1>Quality Assurance Dashboard</h1>
      </div>

      {stats && (
        <div className="qa-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.pendingReviews}</div>
            <div className="stat-label">Pending Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.approvedToday}</div>
            <div className="stat-label">Approved Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.rejectedToday}</div>
            <div className="stat-label">Rejected Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{(stats.averageConfidence * 100).toFixed(1)}%</div>
            <div className="stat-label">Avg Confidence</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.qualityScore.toFixed(1)}/10</div>
            <div className="stat-label">Quality Score</div>
          </div>
        </div>
      )}

      <div className="qa-tabs">
        <button
          className={selectedTab === 'queue' ? 'active' : ''}
          onClick={() => setSelectedTab('queue')}
        >
          Review Queue
        </button>
        <button
          className={selectedTab === 'metrics' ? 'active' : ''}
          onClick={() => setSelectedTab('metrics')}
        >
          Quality Metrics
        </button>
      </div>

      <div className="qa-content">
        {selectedTab === 'queue' ? (
          <ReviewQueue onReviewComplete={fetchStats} />
        ) : (
          <QualityMetrics />
        )}
      </div>
    </div>
  );
}
```

### 4. Model Management Interface

```typescript
// src/components/AIAnnotator/ModelManagement/ModelSelector.tsx
import { useState, useEffect } from 'react';

interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'ollama';
  description: string;
  costPerToken: number;
  maxTokens: number;
  avgResponseTime: number;
  qualityScore: number;
  availability: 'available' | 'limited' | 'unavailable';
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/ai/models');
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  return (
    <div className="model-selector">
      <div className="selector-header">
        <h3>AI Model Selection</h3>
        <button onClick={() => setShowComparison(!showComparison)}>
          {showComparison ? 'Hide' : 'Show'} Comparison
        </button>
      </div>

      <div className="model-grid">
        {models.map(model => (
          <div
            key={model.id}
            className={`model-card ${selectedModel === model.id ? 'selected' : ''} ${model.availability}`}
            onClick={() => model.availability === 'available' && onModelChange(model.id)}
          >
            <div className="model-name">{model.name}</div>
            <div className="model-provider">{model.provider}</div>
            <div className="model-description">{model.description}</div>

            <div className="model-metrics">
              <div className="metric">
                <span className="metric-label">Cost:</span>
                <span className="metric-value">${model.costPerToken}/1k tokens</span>
              </div>
              <div className="metric">
                <span className="metric-label">Response Time:</span>
                <span className="metric-value">{model.avgResponseTime}ms</span>
              </div>
              <div className="metric">
                <span className="metric-label">Quality:</span>
                <span className="metric-value">{model.qualityScore}/10</span>
              </div>
            </div>

            {model.availability !== 'available' && (
              <div className="availability-badge">{model.availability}</div>
            )}
          </div>
        ))}
      </div>

      {showComparison && (
        <div className="model-comparison">
          <h4>Model Comparison</h4>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Cost</th>
                <th>Speed</th>
                <th>Quality</th>
                <th>Max Tokens</th>
              </tr>
            </thead>
            <tbody>
              {models.map(model => (
                <tr key={model.id} className={selectedModel === model.id ? 'selected' : ''}>
                  <td>{model.name}</td>
                  <td>${model.costPerToken}/1k</td>
                  <td>{model.avgResponseTime}ms</td>
                  <td>{model.qualityScore}/10</td>
                  <td>{model.maxTokens.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

### 5. Result Visualization

```typescript
// src/components/AIAnnotator/ResultVisualization/AnnotationViewer.tsx
import { useState } from 'react';

interface Annotation {
  id: string;
  nodeId: string;
  nodeName: string;
  metadata: Record<string, any>;
  enrichedContent: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface AnnotationViewerProps {
  annotation: Annotation;
  onApprove?: () => void;
  onReject?: () => void;
}

export function AnnotationViewer({ annotation, onApprove, onReject }: AnnotationViewerProps) {
  const [activeTab, setActiveTab] = useState<'metadata' | 'content' | 'raw'>('metadata');

  return (
    <div className="annotation-viewer">
      <div className="viewer-header">
        <h3>{annotation.nodeName}</h3>
        <div className="confidence-badge">
          Confidence: {(annotation.confidence * 100).toFixed(1)}%
        </div>
      </div>

      <div className="viewer-tabs">
        <button
          className={activeTab === 'metadata' ? 'active' : ''}
          onClick={() => setActiveTab('metadata')}
        >
          Metadata
        </button>
        <button
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
        >
          Enriched Content
        </button>
        <button
          className={activeTab === 'raw' ? 'active' : ''}
          onClick={() => setActiveTab('raw')}
        >
          Raw Data
        </button>
      </div>

      <div className="viewer-content">
        {activeTab === 'metadata' && (
          <div className="metadata-view">
            <h4>Extracted Metadata</h4>
            <table>
              <tbody>
                {Object.entries(annotation.metadata).map(([key, value]) => (
                  <tr key={key}>
                    <td className="metadata-key">{key}</td>
                    <td className="metadata-value">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-view">
            <h4>Enriched Content</h4>
            <div className="content-display">
              {annotation.enrichedContent}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="raw-view">
            <h4>Raw JSON</h4>
            <pre>{JSON.stringify(annotation, null, 2)}</pre>
          </div>
        )}
      </div>

      {annotation.status === 'pending' && (onApprove || onReject) && (
        <div className="viewer-actions">
          {onApprove && (
            <button className="approve-button" onClick={onApprove}>
              Approve
            </button>
          )}
          {onReject && (
            <button className="reject-button" onClick={onReject}>
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Styling

```css
/* src/components/AIAnnotator/AIAnnotator.css */
.batch-create-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-field input,
.form-field textarea,
.form-field select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-field input.error,
.form-field select.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  margin-top: 4px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.batch-progress {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.progress-bar-container {
  width: 100%;
  height: 24px;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  margin: 16px 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  transition: width 0.3s ease;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.status-pending {
  background: #fff3e0;
  color: #f57c00;
}
.status-processing {
  background: #e3f2fd;
  color: #1976d2;
}
.status-completed {
  background: #e8f5e9;
  color: #388e3c;
}
.status-failed {
  background: #ffebee;
  color: #d32f2f;
}

.qa-dashboard {
  padding: 24px;
}

.qa-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.stat-card {
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.model-card {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.model-card:hover {
  border-color: #1976d2;
  transform: translateY(-2px);
}

.model-card.selected {
  border-color: #1976d2;
  background: #e3f2fd;
}

.model-card.unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.annotation-viewer {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.viewer-tabs {
  display: flex;
  gap: 8px;
  margin: 16px 0;
  border-bottom: 1px solid #e0e0e0;
}

.viewer-tabs button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.viewer-tabs button.active {
  border-bottom-color: #1976d2;
  color: #1976d2;
}

.metadata-view table {
  width: 100%;
  border-collapse: collapse;
}

.metadata-view td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.metadata-key {
  font-weight: 500;
  width: 30%;
}

.viewer-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.approve-button {
  padding: 12px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reject-button {
  padding: 12px 24px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

---

## 🔌 Backend API

```typescript
// POST /api/ai-annotator/batches
router.post(
  "/batches",
  validate(batchSchema),
  asyncHandler(async (req, res) => {
    const batch = await batchService.create(req.body);
    res.json({ success: true, data: batch });
  }),
);

// GET /api/ai-annotator/batches/:id/status
router.get(
  "/batches/:id/status",
  asyncHandler(async (req, res) => {
    const status = await batchService.getStatus(req.params.id);
    res.json({ success: true, status });
  }),
);

// GET /api/ai-annotator/qa/stats
router.get(
  "/qa/stats",
  asyncHandler(async (req, res) => {
    const stats = await qaService.getStats();
    res.json({ success: true, stats });
  }),
);

// GET /api/ai-annotator/qa/queue
router.get(
  "/qa/queue",
  asyncHandler(async (req, res) => {
    const items = await qaService.getReviewQueue();
    res.json({ success: true, data: items });
  }),
);

// POST /api/ai-annotator/qa/approve/:id
router.post(
  "/qa/approve/:id",
  asyncHandler(async (req, res) => {
    await qaService.approve(req.params.id);
    res.json({ success: true });
  }),
);

// POST /api/ai-annotator/qa/reject/:id
router.post(
  "/qa/reject/:id",
  asyncHandler(async (req, res) => {
    await qaService.reject(req.params.id, req.body.reason);
    res.json({ success: true });
  }),
);
```

---

## 🔗 Siehe auch

- [AI Annotator Workflow](./AI_ANNOTATOR_WORKFLOW.md)
- [WebSocket Real-Time](./WEBSOCKET_REALTIME.md)
- [Advanced Features](./ADVANCED_FEATURES.md)

---

**Letzte Aktualisierung**: 6. Dezember 2025  
**Maintainer**: Thomas Heisig
