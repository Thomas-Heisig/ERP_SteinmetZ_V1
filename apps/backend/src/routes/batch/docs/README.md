# Batch Processing Module

Comprehensive batch processing system for large-scale asynchronous operations with real-time progress tracking, result visualization, and analytics.

## 📋 Overview

The Batch Processing Module provides a robust framework for managing long-running batch operations including:

- **AI Annotation Batches** - Bulk AI-powered metadata generation
- **Data Import/Export** - Large-scale data transfers
- **Bulk Transformations** - Mass data updates and migrations
- **Report Generation** - Automated batch reporting
- **Data Validation** - Bulk data quality checks
- **Cleanup Operations** - Automated data maintenance

## 🚀 Features

### Core Capabilities

- ✅ **Batch Creation & Management** - Create, monitor, and control batch operations
- ✅ **Real-time Progress Tracking** - WebSocket integration for live updates
- ✅ **Result Visualization** - Comprehensive analytics and dashboards
- ✅ **Error Tracking** - Detailed error distribution and reporting
- ✅ **Quality Metrics** - Quality score analysis and distribution
- ✅ **Performance Analytics** - Duration percentiles and throughput metrics
- ✅ **History & Filtering** - Advanced filtering and pagination
- ✅ **Cancellation Support** - Stop running batches gracefully
- ✅ **Auto-cleanup** - Automatic removal of old batches

### Advanced Features

- 📊 **Performance Metrics** - P50, P95, P99 duration tracking
- 🎯 **Success Rate Analysis** - Real-time success/failure statistics
- 🔍 **Error Distribution** - Categorized error analysis
- 📈 **Quality Distribution** - Quality score histograms
- 🕐 **Timeline Tracking** - Progress over time visualization
- 🔔 **WebSocket Events** - Real-time event broadcasting
- 📦 **Pagination Support** - Efficient large dataset handling
- 🧹 **Retention Policies** - Configurable data retention

## 📁 File Structure

```t
apps/backend/src/routes/batch/
├── batchRouter.ts              # REST API endpoints
├── batchProcessingService.ts   # Core service logic
├── types.ts                    # TypeScript type definitions
└── docs/
    └── README.md              # This file
```

## 🔌 API Endpoints

### Create Batch

Creates a new batch operation.

```http
POST /api/batch/create
Content-Type: application/json

{
  "operation": "annotate",
  "filters": {
    "status": "pending",
    "category": "invoice"
  },
  "options": {
    "model": "gpt-4",
    "batchSize": 50,
    "retryAttempts": 3
  },
  "name": "Monthly invoice annotation",
  "description": "Annotate all pending invoices"
}
```

**Response:**

```json
{
  "success": true,
  "batch": {
    "id": "batch_1234567890_abc123",
    "operation": "annotate",
    "status": "pending",
    "progress": 0,
    "created_at": "2025-12-20T10:00:00.000Z"
  }
}
```

### Get Batch Status

Retrieves current batch status and metadata.

```http
GET /api/batch/:id
```

**Response:**

```json
{
  "success": true,
  "batch": {
    "id": "batch_1234567890_abc123",
    "operation": "annotate",
    "status": "running",
    "progress": 45,
    "created_at": "2025-12-20T10:00:00.000Z",
    "started_at": "2025-12-20T10:01:00.000Z",
    "total_items": 100,
    "processed_items": 45,
    "failed_items": 2
  }
}
```

### Get Batch Results

Retrieves complete batch results with summary statistics.

```http
GET /api/batch/:id/results
```

**Response:**

```json
{
  "success": true,
  "batch": {
    "id": "batch_1234567890_abc123",
    "operation": "annotate",
    "status": "completed",
    "progress": 100,
    "results": [
      {
        "nodeId": "node_001",
        "success": true,
        "result": { "description": "Invoice processing", "tags": ["finance"] },
        "retries": 0,
        "durationMs": 1250,
        "qualityScore": 0.95,
        "createdAt": "2025-12-20T10:05:00.000Z"
      }
    ],
    "summary": {
      "total": 100,
      "successful": 98,
      "failed": 2,
      "qualityScore": 0.92,
      "performanceMetrics": {
        "averageDuration": 1180,
        "totalDuration": 118000,
        "requestsPerMinute": 50.85
      }
    }
  }
}
```

### Get Visualization Data

Retrieves comprehensive analytics for visualization.

```http
GET /api/batch/:id/viz
```

**Response:**

```json
{
  "success": true,
  "visualization": {
    "batchId": "batch_1234567890_abc123",
    "overview": {
      "total": 100,
      "successful": 98,
      "failed": 2,
      "pending": 0,
      "successRate": 0.98,
      "averageDuration": 1180
    },
    "errorDistribution": [
      { "error": "Timeout", "count": 1, "percentage": 50 },
      { "error": "Invalid response", "count": 1, "percentage": 50 }
    ],
    "qualityDistribution": [
      { "range": "0.8-1.0", "count": 85, "percentage": 85 },
      { "range": "0.6-0.8", "count": 13, "percentage": 13 }
    ],
    "performanceMetrics": {
      "averageDuration": 1180,
      "p50Duration": 1150,
      "p95Duration": 1850,
      "p99Duration": 2200
    }
  }
}
```

### Get Batch History

Retrieves batch history with filtering and pagination.

```http
GET /api/batch/history?status=completed&operation=annotate&limit=20&offset=0
```

**Query Parameters:**

- `operation` (string) - Filter by operation type
- `status` (string) - Filter by batch status
- `createdAfter` (ISO 8601) - Filter by creation date
- `createdBefore` (ISO 8601) - Filter by creation date
- `limit` (number) - Max results (default: 50, max: 100)
- `offset` (number) - Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "batches": [...],
  "count": 20,
  "filter": {
    "status": "completed",
    "operation": "annotate",
    "limit": 20,
    "offset": 0
  }
}
```

### Cancel Batch

Cancels a running batch operation.

```http
POST /api/batch/:id/cancel
```

**Response:**

```json
{
  "success": true,
  "message": "Batch cancelled successfully"
}
```

### Cleanup Old Batches

Removes batches older than specified retention period.

```http
DELETE /api/batch/cleanup
Content-Type: application/json

{
  "daysToKeep": 60
}
```

**Response:**

```json
{
  "success": true,
  "deleted": 42,
  "daysToKeep": 60
}
```

### Get Statistics

Retrieves overall batch processing statistics.

```http
GET /api/batch/stats
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "total": 150,
    "byStatus": {
      "pending": 5,
      "running": 3,
      "completed": 138,
      "failed": 2,
      "cancelled": 2
    },
    "byOperation": {
      "annotate": 120,
      "import": 20,
      "export": 10
    },
    "completionRate": 0.92
  }
}
```

## 🎯 Usage Examples

### TypeScript Integration

```typescript
import { batchProcessingService } from "./batchProcessingService";

// Create annotation batch
const batch = batchProcessingService.createBatch({
  operation: "annotate",
  filters: {
    annotation_status: "pending",
    category: "product",
  },
  options: {
    model: "gpt-4",
    batchSize: 50,
    retryAttempts: 3,
  },
  name: "Product annotation batch",
});

console.log(`Created batch: ${batch.id}`);

// Monitor progress
const currentBatch = batchProcessingService.getBatch(batch.id);
console.log(`Progress: ${currentBatch?.progress}%`);

// Record individual results
batchProcessingService.recordResult(
  batch.id,
  "node_123",
  true,
  { description: "Product listing page", tags: ["ecommerce", "product"] },
  undefined,
  0,
  1250,
  0.95,
);

// Get visualization data
const viz = batchProcessingService.getBatchVisualization(batch.id);
if (viz) {
  console.log(`Success rate: ${viz.overview.successRate * 100}%`);
  console.log(`Average duration: ${viz.performanceMetrics.averageDuration}ms`);
}

// Cancel if needed
if (currentBatch?.status === "running") {
  batchProcessingService.cancelBatch(batch.id);
}

// Cleanup old batches (keep last 30 days)
const deleted = batchProcessingService.cleanupOldBatches(30);
console.log(`Cleaned up ${deleted} old batches`);
```

### WebSocket Integration

```typescript
import { websocketService } from "../other/websocketService";

// Listen for batch events
websocketService.on("batch:created", (batch) => {
  console.log("New batch created:", batch.id);
});

websocketService.on("batch:progress", ({ batchId, progress, status }) => {
  console.log(`Batch ${batchId}: ${progress}% - ${status}`);
});

websocketService.on("batch:completed", ({ batchId }) => {
  console.log(`Batch ${batchId} completed`);
  // Trigger notifications, update UI, etc.
});
```

### Frontend Integration (React)

```tsx
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

function BatchMonitor({ batchId }: { batchId: string }) {
  const [batch, setBatch] = useState(null);
  const [viz, setViz] = useState(null);

  useEffect(() => {
    // Initial fetch
    fetch(`/api/batch/${batchId}`)
      .then((res) => res.json())
      .then((data) => setBatch(data.batch));

    // WebSocket updates
    const socket = io();
    socket.on("batch:progress", (update) => {
      if (update.batchId === batchId) {
        setBatch((prev) => ({ ...prev, ...update }));
      }
    });

    return () => socket.disconnect();
  }, [batchId]);

  useEffect(() => {
    // Fetch visualization data
    if (batch?.status === "completed") {
      fetch(`/api/batch/${batchId}/viz`)
        .then((res) => res.json())
        .then((data) => setViz(data.visualization));
    }
  }, [batch?.status]);

  return (
    <div>
      <h2>{batch?.name || batchId}</h2>
      <div>Status: {batch?.status}</div>
      <div>Progress: {batch?.progress}%</div>
      {viz && (
        <div>
          <div>
            Success Rate: {(viz.overview.successRate * 100).toFixed(2)}%
          </div>
          <div>Avg Duration: {viz.performanceMetrics.averageDuration}ms</div>
        </div>
      )}
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

```env
# Batch processing settings
BATCH_DEFAULT_SIZE=50
BATCH_MAX_RETRIES=3
BATCH_TIMEOUT_MS=30000
BATCH_RETENTION_DAYS=30
```

### Service Configuration

```typescript
// Customize batch processing behavior
const customBatch = batchProcessingService.createBatch({
  operation: "annotate",
  filters: { status: "pending" },
  options: {
    batchSize: 100, // Process 100 items at a time
    retryAttempts: 5, // Retry failed items 5 times
    timeout: 60000, // 60 second timeout
    priority: "high", // High priority processing
    notifyOnComplete: true, // Send notifications
  },
});
```

## 📊 Type Definitions

### Core Types

```typescript
type BatchStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
type BatchOperationType =
  | "annotate"
  | "import"
  | "export"
  | "transform"
  | "report";

interface BatchOperation {
  id: string;
  operation: BatchOperationType;
  status: BatchStatus;
  progress: number;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  total_items?: number;
  processed_items?: number;
  failed_items?: number;
}

interface BatchItemResult {
  nodeId: string;
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
  retries: number;
  durationMs?: number;
  qualityScore?: number;
  createdAt: string;
}
```

## 🔒 Security

- ✅ Authentication required for all endpoints
- ✅ Input validation with Zod schemas
- ✅ Rate limiting on batch creation
- ✅ Resource usage monitoring
- ✅ Automatic cleanup of old data

## 🐛 Error Handling

All endpoints follow standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "errors": [
      {
        "path": "field.name",
        "message": "Validation error message",
        "code": "invalid_type"
      }
    ]
  }
}
```

## 📈 Performance Considerations

- **In-Memory Storage**: Current implementation uses Map-based storage
- **Scalability**: For production, consider database-backed storage
- **Cleanup**: Run periodic cleanup to prevent memory bloat
- **Pagination**: Always use limit/offset for large result sets
- **WebSocket Scaling**: Consider Redis adapter for multi-server deployments

## 🔄 Future Enhancements

- [ ] Database persistence for batch operations
- [ ] Scheduled batch execution (cron-like)
- [ ] Batch templates and presets
- [ ] Advanced retry strategies (exponential backoff)
- [ ] Batch dependencies and chaining
- [ ] Email/Slack notifications
- [ ] Export results to CSV/Excel
- [ ] Batch comparison and diff tools
- [ ] Resource usage limits and throttling
- [ ] Multi-tenant batch isolation

## 📝 Best Practices

1. **Always set total_items** when creating a batch for accurate progress tracking
2. **Use meaningful names** for batches to improve searchability
3. **Implement retry logic** for transient failures
4. **Monitor memory usage** with large batches
5. **Clean up regularly** using the cleanup endpoint
6. **Validate filters** before creating batches
7. **Use appropriate batch sizes** (50-100 items recommended)
8. **Handle WebSocket disconnects** gracefully
9. **Log batch operations** for audit trails
10. **Test batch operations** with small datasets first

## 🤝 Integration Points

- **AI Annotator Service** - Bulk AI annotation processing
- **WebSocket Service** - Real-time progress updates
- **Error Handler** - Standardized error responses
- **Logger** - Structured logging with Pino
- **Authentication** - User session management

## 📚 Related Documentation

- [AI Annotator Guide](../aiAnnotatorRouter/docs/README.md)
- [WebSocket Integration](../other/docs/WEBSOCKET.md)
- [Error Handling Standards](../../../docs/ERROR_HANDLING.md)
- [API Documentation](../../../docs/API.md)

## 🆘 Support

For issues or questions:

- Check the [API endpoints](#-api-endpoints)
- Review the [usage examples](#-usage-examples)
- Consult the [type definitions](#-type-definitions)

---

**Last Updated:** 2025-12-20  
**Module Version:** 1.0.0  
**Maintainer:** ERP SteinmetZ Development Team
