# Advanced Features Documentation

This document describes the advanced features added to the ERP SteinmetZ system for improved AI annotation, quality assurance, and model management.

## Table of Contents

1. [Advanced Filters](#advanced-filters)
2. [Batch Processing](#batch-processing)
3. [Quality Assurance Dashboard](#quality-assurance-dashboard)
4. [AI Model Management](#ai-model-management)

---

## Advanced Filters

The Advanced Filter system allows users to create, save, and apply complex filters to find and manage nodes efficiently.

### Features

- **Dynamic Filter Builder**: Create filters with multiple criteria
- **Saved Filters**: Save frequently used filter configurations
- **Filter Presets**: Quick access to common filter patterns
- **Export Results**: Export filtered data in JSON or CSV format

### API Endpoints

#### Get All Filters

```http
GET /api/ai-annotator/filters?type={filterType}&publicOnly={boolean}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "filter_123",
      "name": "High Complexity Nodes",
      "filterType": "annotator",
      "filterConfig": {
        "complexityScore": { "min": 7 }
      },
      "isPreset": false,
      "isPublic": true,
      "usageCount": 42
    }
  ]
}
```

#### Create Filter

```http
POST /api/ai-annotator/filters
Content-Type: application/json

{
  "name": "My Filter",
  "description": "Filter description",
  "filterType": "annotator",
  "filterConfig": {
    "query": "search text",
    "kinds": ["action", "workflow"],
    "complexityScore": { "min": 5, "max": 8 }
  },
  "isPreset": false,
  "isPublic": false
}
```

#### Apply Filter

```http
POST /api/ai-annotator/filters/{id}/apply
```

#### Export Filtered Results

```http
POST /api/ai-annotator/filters/export
Content-Type: application/json

{
  "nodes": [...],
  "format": "csv"
}
```

### Frontend Component Usage

```tsx
import { FilterBuilder } from "@/components/AdvancedFilters";

<FilterBuilder
  initialFilter={existingFilter}
  onApply={(filter) => {
    // Apply filter to your data
    console.log("Applying filter:", filter);
  }}
  onSave={(name, filter) => {
    // Save filter for later use
    console.log("Saving filter:", name, filter);
  }}
/>;
```

### Filter Configuration Schema

```typescript
interface FilterConfig {
  query?: string; // Text search
  kinds?: string[]; // Node types
  tags?: string[]; // Tags
  businessArea?: string[]; // Business areas
  annotationStatus?: string[]; // Status filter
  complexityScore?: {
    // Complexity range
    min?: number;
    max?: number;
  };
  createdAfter?: string; // Date filters
  createdBefore?: string;
  minConfidence?: number; // Quality filters
  hasSchema?: boolean;
  hasMeta?: boolean;
  sortBy?: string; // Sorting
  sortOrder?: "asc" | "desc";
}
```

---

## Batch Processing

Enhanced batch processing system with progress tracking, visualization, and detailed result analysis.

### Features

- **Batch Creation**: Create batch operations with custom options
- **Real-time Progress**: WebSocket-based progress updates
- **Batch History**: View and filter past batch operations
- **Result Visualization**: Charts and statistics for batch results

### API Endpoints

#### Create Batch

```http
POST /api/ai-annotator/batch/create
Content-Type: application/json

{
  "operation": "generate_meta",
  "filters": { ... },
  "options": {
    "chunkSize": 10,
    "parallelRequests": 2,
    "modelPreference": "balanced"
  },
  "name": "My Batch",
  "description": "Batch description"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "batch_123",
    "operation": "generate_meta",
    "status": "pending",
    "progress": 0,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### Get Batch Details

```http
GET /api/ai-annotator/batch/{id}/details
```

#### Get Batch Visualization

```http
GET /api/ai-annotator/batch/{id}/visualization
```

**Response:**

```json
{
  "success": true,
  "data": {
    "batchId": "batch_123",
    "overview": {
      "total": 100,
      "successful": 85,
      "failed": 15,
      "successRate": 0.85,
      "averageDuration": 1500
    },
    "timeline": [...],
    "errorDistribution": [...],
    "qualityDistribution": [...]
  }
}
```

#### Get Batch History

```http
GET /api/ai-annotator/batch/history?operation={op}&status={status}&limit={n}
```

#### Cancel Batch

```http
POST /api/ai-annotator/batch/{id}/cancel-v2
```

### Frontend Component Usage

```tsx
import { BatchCreationForm, ProgressTracker } from "@/components/BatchProcessing";

// Create batch
<BatchCreationForm
  onSubmit={(data) => {
    // Submit batch creation
  }}
  onCancel={() => {
    // Handle cancel
  }}
/>

// Track progress
<ProgressTracker
  batch={{
    batchId: "batch_123",
    status: "running",
    progress: 45,
    total: 100,
    processed: 45,
    successful: 40,
    failed: 5
  }}
  onCancel={(id) => {
    // Cancel batch
  }}
/>
```

### WebSocket Events

The batch processing system emits WebSocket events for real-time updates:

- `batch:created` - Batch was created
- `batch:progress` - Progress update
- `batch:cancelled` - Batch was cancelled

```javascript
// Listen for batch events
socket.on("batch:progress", (data) => {
  console.log("Batch progress:", data);
  // { batchId, progress, status }
});
```

---

## Quality Assurance Dashboard

Comprehensive quality assurance system for manual review and approval workflows.

### Features

- **Quality Metrics**: Automatic quality score calculation
- **Manual Review**: Review interface for annotations
- **Approval Workflow**: Approve, reject, or request revisions
- **Quality Trends**: Track quality over time

### API Endpoints

#### Get QA Dashboard

```http
GET /api/ai-annotator/qa/dashboard
```

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalReviews": 150,
      "pendingReviews": 25,
      "approvedReviews": 100,
      "rejectedReviews": 25,
      "averageQualityScore": 85.5,
      "averageReviewTime": 12.3
    },
    "recentReviews": [...],
    "qualityTrends": [...],
    "topIssues": [...]
  }
}
```

#### Get Reviews by Status

```http
GET /api/ai-annotator/qa/reviews?status={status}&limit={n}&offset={m}
```

#### Create Review

```http
POST /api/ai-annotator/qa/reviews
Content-Type: application/json

{
  "nodeId": "node_123",
  "reviewer": "user@example.com",
  "reviewStatus": "pending",
  "reviewComments": "Review comments"
}
```

#### Update Review

```http
PUT /api/ai-annotator/qa/reviews/{id}
Content-Type: application/json

{
  "reviewStatus": "approved",
  "qualityScore": 92,
  "reviewComments": "Looks good!"
}
```

#### Approve Review

```http
POST /api/ai-annotator/qa/reviews/{id}/approve
Content-Type: application/json

{
  "reviewer": "user@example.com",
  "comments": "Approved"
}
```

#### Reject Review

```http
POST /api/ai-annotator/qa/reviews/{id}/reject
Content-Type: application/json

{
  "reviewer": "user@example.com",
  "comments": "Needs improvement"
}
```

#### Get Quality Trends

```http
GET /api/ai-annotator/qa/trends?metricType={type}&days={n}
```

#### Calculate Node Quality Metrics

```http
POST /api/ai-annotator/qa/metrics/node/{nodeId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "completeness": 0.85,
    "accuracy": 0.9,
    "consistency": 0.88,
    "confidence": 0.87,
    "overallScore": 87,
    "metaQuality": {
      "hasDescription": true,
      "descriptionLength": 150,
      "tagCount": 5,
      "hasBusinessArea": true,
      "hasPiiClass": true
    },
    "schemaQuality": {
      "hasSchema": true,
      "fieldCount": 8,
      "requiredFields": 3,
      "validationRules": 5
    }
  }
}
```

### Frontend Component Usage

```tsx
import { QADashboard } from "@/components/QualityDashboard";

<QADashboard apiBaseUrl="http://localhost:3000" />;
```

### Quality Metrics Calculation

Quality scores are calculated based on:

- **Completeness** (30%): Presence of required fields
- **Accuracy** (30%): AI confidence score
- **Consistency** (20%): Internal consistency checks
- **Confidence** (20%): Overall confidence level

---

## AI Model Management

Comprehensive model management system for monitoring, comparison, and cost tracking.

### Features

- **Model Statistics**: Track usage and performance
- **Performance Comparison**: Compare models side-by-side
- **Cost Tracking**: Monitor costs per model and operation
- **Usage Analytics**: Detailed usage statistics

### API Endpoints

#### Get All Model Stats

```http
GET /api/ai-annotator/models/stats?days={n}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "modelName": "gpt-4",
      "provider": "openai",
      "totalRequests": 1500,
      "successfulRequests": 1450,
      "failedRequests": 50,
      "totalTokens": 150000,
      "totalCost": 45.5,
      "averageDuration": 1200,
      "successRate": 0.967
    }
  ]
}
```

#### Get Model Stats

```http
GET /api/ai-annotator/models/stats/{modelName}?days={n}
```

#### Compare Models

```http
POST /api/ai-annotator/models/compare
Content-Type: application/json

{
  "models": ["gpt-4", "gpt-3.5-turbo", "claude-2"],
  "days": 30
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "modelName": "gpt-4",
      "provider": "openai",
      "speed": 1200,
      "accuracy": 0.95,
      "cost": 0.03,
      "reliability": 0.97,
      "overallScore": 88
    }
  ]
}
```

#### Get Cost Breakdown

```http
GET /api/ai-annotator/models/costs?period={day|week|month}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "period": "month",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-31T23:59:59Z",
    "totalCost": 450.75,
    "byModel": [
      {
        "modelName": "gpt-4",
        "provider": "openai",
        "cost": 350.5,
        "requests": 1500,
        "tokens": 150000
      }
    ],
    "byOperation": [
      {
        "operationType": "generate_meta",
        "cost": 200.25,
        "requests": 800
      }
    ]
  }
}
```

#### Get Usage Timeline

```http
GET /api/ai-annotator/models/usage-timeline?days={n}&granularity={hour|day}
```

#### Get Model Availability

```http
GET /api/ai-annotator/models/availability
```

#### Get Model Recommendations

```http
GET /api/ai-annotator/models/recommendations?prioritize={speed|accuracy|cost|balanced}&maxCost={n}&minAccuracy={n}
```

#### Get Registered Models

```http
GET /api/ai-annotator/models/registered
```

### Frontend Component Usage

```tsx
import { ModelComparison } from "@/components/ModelManagement";

<ModelComparison apiBaseUrl="http://localhost:3000" />;
```

### Cost Optimization

The system automatically tracks:

- Cost per request
- Cost per token
- Cost per operation type
- Total cost over time

Use the recommendations endpoint to find the best model for your needs based on:

- Speed requirements
- Accuracy requirements
- Budget constraints

---

## Database Schema

### Saved Filters Table

```sql
CREATE TABLE saved_filters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  filter_type TEXT NOT NULL,
  filter_config TEXT NOT NULL,
  is_preset BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  usage_count INTEGER DEFAULT 0
);
```

### QA Reviews Table

```sql
CREATE TABLE qa_reviews (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL,
  reviewer TEXT,
  review_status TEXT DEFAULT 'pending',
  quality_score REAL,
  review_comments TEXT,
  metrics TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT
);
```

### Batch Results Table

```sql
CREATE TABLE batch_results (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  success BOOLEAN DEFAULT false,
  result TEXT,
  error TEXT,
  retries INTEGER DEFAULT 0,
  duration_ms INTEGER,
  quality_score REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Model Usage Stats Table

```sql
CREATE TABLE model_usage_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  operation_type TEXT,
  tokens_used INTEGER,
  cost REAL,
  duration_ms INTEGER,
  success BOOLEAN,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Quality Metrics History Table

```sql
CREATE TABLE quality_metrics_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_type TEXT NOT NULL,
  metric_value REAL NOT NULL,
  node_count INTEGER,
  batch_id TEXT,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing

### Backend Tests

```bash
# Run all backend tests
cd apps/backend
npm test

# Run specific service tests
npm test -- filterService
npm test -- qualityAssuranceService
npm test -- modelManagementService
npm test -- batchProcessingService
```

### Frontend Tests

```bash
# Run all frontend tests
cd apps/frontend
npm test

# Run specific component tests
npm test -- FilterBuilder
npm test -- QADashboard
npm test -- ModelComparison
```

---

## Performance Considerations

### Filtering

- Filters are applied in-memory for fast results
- Large datasets (>10,000 nodes) may require pagination
- Consider implementing server-side filtering for very large datasets

### Batch Processing

- Batch operations are processed in chunks to avoid memory issues
- Parallel requests are limited to prevent API rate limits
- Progress is tracked and persisted for reliability

### Model Management

- Statistics are aggregated periodically for performance
- Old statistics can be cleaned up automatically
- Caching is recommended for frequently accessed metrics

---

## Future Enhancements

### Advanced Filters

- [ ] Visual query builder with drag-and-drop
- [ ] Filter templates marketplace
- [ ] Advanced boolean logic (AND/OR/NOT)
- [ ] Saved filter sharing between users

### Batch Processing

- [ ] Scheduled batch operations
- [ ] Batch dependencies and workflows
- [ ] Email notifications on completion
- [ ] Batch result comparison

### Quality Assurance

- [ ] Automated quality scoring rules
- [ ] Reviewer assignment automation
- [ ] Quality improvement suggestions
- [ ] Compliance reporting

### Model Management

- [ ] Automatic model selection based on requirements
- [ ] Cost forecasting
- [ ] Model A/B testing framework
- [ ] Custom model integration

---

## Support

For issues, questions, or feature requests, please:

1. Check the existing documentation
2. Search closed issues in the repository
3. Open a new issue with detailed information

For urgent issues, contact the development team directly.

---

**Last Updated:** December 2025  
**Version:** 0.3.0
