# AI Annotator Module Documentation

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [TypeScript Types](#typescript-types)
- [Frontend Integration](#frontend-integration)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

The **AI Annotator Module** provides AI-powered metadata annotation and quality assurance for function nodes in the ERP system. It supports multiple AI providers (OpenAI, Anthropic, Ollama), batch processing, quality workflows, and PII classification.

### Key Features

- **Multi-Provider AI Support**: OpenAI, Anthropic, and Ollama integration
- **Batch Processing**: Process multiple nodes concurrently with progress tracking
- **Quality Assurance**: Automated quality scoring and validation
- **PII Classification**: Detect and classify personally identifiable information
- **Model Management**: Compare models, track performance, and select optimal providers
- **Error Correction**: Automatic retry and error handling
- **Filter Management**: Create custom filters for node selection
- **Debug Tools**: Test prompts, models, and annotations

### Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with JSON columns
- **Validation**: Zod v3.x schemas
- **Logging**: Pino structured logging
- **AI Providers**: OpenAI SDK, Anthropic SDK, Ollama REST API

---

## Architecture

### Module Structure

```tree
apps/backend/src/routes/aiAnnotatorRouter/
├── aiAnnotatorRouter.ts     # Main router (1400+ lines)
├── types.ts                  # TypeScript types and Zod schemas (700+ lines)
└── docs/
    └── README.md            # This documentation

apps/backend/src/services/
├── aiAnnotatorService.ts    # Core AI annotation logic
├── filterService.ts          # Filter management
├── qualityAssuranceService.ts # QA workflows
├── modelManagementService.ts  # Model selection
└── batchProcessingService.ts  # Batch operations
```

### Data Flow

```text
Client Request → Router (Validation) → Service Layer → AI Provider → Database → Response
```

---

## Database Schema

### functions_nodes

| Column              | Type      | Description |
| ------------------- | --------- | ----------- |
| `id`                | TEXT (PK) | Node ID     |
| `title`             | TEXT      | Node name   |
| `kind`              | TEXT      | Node type   |
| `meta_json`         | TEXT      | AI metadata |
| `annotation_status` | TEXT      | Status      |
| `last_annotated`    | TEXT      | Last update |

### batch_operations

| Column            | Type      | Description    |
| ----------------- | --------- | -------------- |
| `id`              | TEXT (PK) | Batch ID       |
| `operation`       | TEXT      | Operation type |
| `status`          | TEXT      | Status         |
| `total_nodes`     | INTEGER   | Total count    |
| `processed_nodes` | INTEGER   | Processed      |
| `success_count`   | INTEGER   | Successes      |

---

## API Endpoints

### System Status

#### GET /status

System status overview.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalNodes": 1234,
    "annotatedNodes": 567,
    "pendingNodes": 667,
    "providers": { ... }
  }
}
```

#### GET /health

Health check for AI providers.

### Node Management

#### GET /nodes

List nodes with filters.

**Query:** `kinds`, `missingOnly`, `limit`, `offset`, `search`, `status`

#### GET /nodes/:id

Get single node.

#### POST /nodes/:id/validate

Validate node annotations.

### Single Operations

#### POST /nodes/:id/generate-meta

Generate metadata (rate limited).

#### POST /nodes/:id/generate-rule

Generate dashboard rule (rate limited).

#### POST /nodes/:id/generate-form

Generate form specification (rate limited).

#### POST /nodes/:id/full-annotation

Complete annotation (meta + rule + form).

**Body:**

```json
{
  "includeValidation": true,
  "parallel": true
}
```

### Batch Operations

#### POST /batch/annotate

Start batch annotation.

**Body:**

```json
{
  "nodeIds": ["id1", "id2"],
  "force": false,
  "provider": "openai"
}
```

#### GET /batch/:id

Get batch status.

#### GET /batch/:id/progress

Real-time progress.

---

## TypeScript Types

See [types.ts](../types.ts) for complete definitions.

### Key Types

```typescript
// Enums
export const ANNOTATION_STATUS = {
  PENDING: "pending",
  ANNOTATED: "annotated",
  REVIEWED: "reviewed",
  APPROVED: "approved",
  REJECTED: "rejected",
  FAILED: "failed",
} as const;

export const AI_PROVIDER = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  OLLAMA: "ollama",
} as const;

// Interfaces
export interface NodeForAnnotation {
  id: string;
  title: string;
  kind: string;
  annotationStatus: string;
  meta?: GeneratedMeta;
}

export interface GeneratedMeta {
  summary: string;
  description: string;
  category: string;
  keywords: string[];
  tags: string[];
  complexity?: "low" | "medium" | "high";
}

export interface BatchOperation {
  id: string;
  operation: string;
  status: string;
  totalNodes: number;
  processedNodes: number;
  successCount: number;
  failCount: number;
}
```

---

## Frontend Integration

### API Client

```typescript
// src/api/aiAnnotatorClient.ts
import axios from "axios";

const API_BASE = "/api/ai-annotator";

export const aiAnnotatorApi = {
  getStatus: () => axios.get(`${API_BASE}/status`),

  listNodes: (params?) => axios.get(`${API_BASE}/nodes`, { params }),

  generateMeta: (id: string) =>
    axios.post(`${API_BASE}/nodes/${id}/generate-meta`),

  fullAnnotation: (id: string, options?) =>
    axios.post(`${API_BASE}/nodes/${id}/full-annotation`, options),

  batchAnnotate: (nodeIds: string[], options?) =>
    axios.post(`${API_BASE}/batch/annotate`, { nodeIds, ...options }),

  getBatchStatus: (id: string) => axios.get(`${API_BASE}/batch/${id}`),
};
```

### React Query Hooks

```typescript
// src/hooks/useAiAnnotator.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiAnnotatorApi } from "../api/aiAnnotatorClient";
import { toast } from "react-hot-toast";

export function useNodes(params?) {
  return useQuery({
    queryKey: ["aiAnnotator", "nodes", params],
    queryFn: () =>
      aiAnnotatorApi.listNodes(params).then((res) => res.data.data.nodes),
  });
}

export function useGenerateMeta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nodeId: string) =>
      aiAnnotatorApi.generateMeta(nodeId).then((res) => res.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["aiAnnotator"] });
      toast.success("Metadata generated");
    },
  });
}

export function useBatchAnnotate() {
  return useMutation({
    mutationFn: ({ nodeIds, options }) =>
      aiAnnotatorApi
        .batchAnnotate(nodeIds, options)
        .then((res) => res.data.data),
    onSuccess: (data) => {
      toast.success(`Batch started: ${data.batchId}`);
    },
  });
}

export function useBatchStatus(batchId: string) {
  return useQuery({
    queryKey: ["aiAnnotator", "batch", batchId],
    queryFn: () =>
      aiAnnotatorApi.getBatchStatus(batchId).then((res) => res.data.data),
    enabled: !!batchId,
    refetchInterval: (data) => (data?.status === "in_progress" ? 2000 : false),
  });
}
```

### React Components

```typescript
// src/components/AiAnnotator/NodeList.tsx
import React from "react";
import { useNodes, useGenerateMeta } from "../../hooks/useAiAnnotator";

export const NodeList: React.FC = () => {
  const { data: nodes, isLoading } = useNodes({ missingOnly: true, limit: 50 });
  const generateMeta = useGenerateMeta();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="node-list">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Kind</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {nodes?.map(node => (
            <tr key={node.id}>
              <td>{node.title}</td>
              <td>{node.kind}</td>
              <td><span className={`badge ${node.annotationStatus}`}>{node.annotationStatus}</span></td>
              <td>
                <button onClick={() => generateMeta.mutate(node.id)} disabled={generateMeta.isPending}>
                  Generate Meta
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

```typescript
// src/components/AiAnnotator/BatchMonitor.tsx
import React from "react";
import { useBatchStatus } from "../../hooks/useAiAnnotator";

export const BatchMonitor: React.FC<{ batchId: string }> = ({ batchId }) => {
  const { data: status } = useBatchStatus(batchId);

  if (!status) return null;

  const percentage = (status.processedNodes / status.totalNodes) * 100;

  return (
    <div className="batch-monitor">
      <h3>Batch: {batchId}</h3>
      <div className="progress-bar">
        <div className="fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="stats">
        <span>Total: {status.totalNodes}</span>
        <span>Processed: {status.processedNodes}</span>
        <span className="success">Success: {status.successCount}</span>
        <span className="error">Failed: {status.failCount}</span>
      </div>
    </div>
  );
};
```

---

## Best Practices

### 1. AI Provider Selection

- Use `modelManagementService` for automatic provider selection
- Monitor performance metrics
- Implement fallback providers

### 2. Batch Processing

- Use appropriate chunk sizes (default: 10)
- Enable `retryFailed` for critical operations
- Monitor progress in real-time

### 3. Quality Assurance

- Validate annotations before approval
- Set quality thresholds
- Review rejected annotations manually

### 4. Error Handling

- Implement comprehensive logging
- Use structured error messages
- Provide recovery suggestions

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
| ----- | ----- | -------- |

| `NotFoundError: Knoten nicht gefunden` | Invalid node ID | Verify node exists |
| `BadRequestError: Invalid operation` | Unknown batch operation | Check BATCH_OPERATION enum |
| `ForbiddenError: Cleanup requires force=true` | Missing force flag | Add `?force=true` in production |
| `RateLimitError` | Exceeded rate limit | Reduce parallelRequests |

### Error Response

```json
{
  "success": false,
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## Testing

```typescript
// __tests__/aiAnnotatorRouter.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("AI Annotator", () => {
  it("should return system status", async () => {
    const res = await request(app).get("/api/ai-annotator/status");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalNodes");
  });

  it("should list nodes", async () => {
    const res = await request(app).get("/api/ai-annotator/nodes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.nodes)).toBe(true);
  });

  it("should generate metadata", async () => {
    const res = await request(app).post(
      "/api/ai-annotator/nodes/test-node/generate-meta",
    );
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("meta");
  });
});
```

---

## Troubleshooting

### Issue: AI Provider Timeout

**Solutions:**

1. Check network connectivity
2. Verify API keys
3. Increase timeout
4. Switch provider

### Issue: Poor Quality Scores

**Solutions:**

1. Use more accurate model
2. Improve source documentation
3. Adjust quality thresholds

### Issue: Batch Operation Stuck

**Solutions:**

1. Check database locks
2. Review error logs
3. Restart with `retryFailed`

---

**Last Updated:** 2025-12-20  
**Version:** 2.0.0  
**Maintainers:** ERP SteinmetZ Development Team
