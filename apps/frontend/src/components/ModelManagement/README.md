# Model Management Components

Comprehensive suite of components for managing, monitoring, and optimizing AI model usage.

## 🎯 Overview

The Model Management module provides a complete interface for:

- **Model Selection**: Intelligent recommendations based on performance criteria
- **Cost Tracking**: Monitor and optimize AI model costs
- **Usage Statistics**: Detailed analytics on model performance and usage
- **Model Comparison**: Side-by-side comparison of different models

## 📦 Components

### ModelManagementPage

Main navigation component with tabbed interface for all model management features.

**Usage:**

```tsx
import { ModelManagementPage } from '@/components/ModelManagement';

<ModelManagementPage />
```

---

### ModelSelectionInterface

Intelligent model selection with performance-based recommendations.

**Features:**

- Dynamic recommendations based on criteria (speed, accuracy, cost, balanced)
- Real-time model availability
- Visual performance metrics
- Filter by max cost and minimum accuracy

**Usage:**

```tsx
import { ModelSelectionInterface } from '@/components/ModelManagement';

<ModelSelectionInterface apiBaseUrl="http://localhost:3000" />
```

**Props:**

- `apiBaseUrl?`: string - API base URL (default: "localhost:3000")

---

### ModelComparison

Compare performance and cost metrics across different AI models.

**Features:**

- Success rates and request counts
- Cost per request comparison
- Performance benchmarking
- Time-range filtering (7/30/90 days)

**Usage:**

```tsx
import { ModelComparison } from '@/components/ModelManagement';

<ModelComparison apiBaseUrl="http://localhost:3000" />
```

---

### ModelCostTracking

Track and optimize AI model costs over time.

**Features:**

- Cost breakdown by model
- Cost distribution visualization
- Period selection (day/week/month)
- CSV export functionality
- Cost optimization suggestions

**Usage:**

```tsx
import { ModelCostTracking } from '@/components/ModelManagement';

<ModelCostTracking apiBaseUrl="http://localhost:3000" />
```

---

### ModelUsageStatistics

Comprehensive usage statistics and trends.

**Features:**

- Usage trends over time (bar chart)
- Request counts and success rates
- Token usage and costs
- Model breakdown table
- Request distribution by model

**Usage:**

```tsx
import { ModelUsageStatistics } from '@/components/ModelManagement';

<ModelUsageStatistics apiBaseUrl="http://localhost:3000" />
```

---

### ModelManagement

Core model management component for viewing and managing all AI/ML models.

**Features:**

- Search by name or version
- Filter by type (classification, NER, QA, generation)
- Filter by status (active, training, archived)
- Model cards with accuracy and dataset info
- Actions for training and archiving

**Usage:**

```tsx
import { ModelManagement } from '@/components/ModelManagement';

<ModelManagement />
```

## 🎨 Styling

All components use **CSS Modules** for scoped styling:

- `ModelManagementPage.module.css`
- `ModelSelectionInterface.module.css`
- `ModelComparison.module.css`
- `ModelCostTracking.module.css`
- `ModelUsageStatistics.module.css`
- `ModelManagement.module.css`

### Dynamic Styles

Components use inline styles **only** for dynamic values that cannot be pre-defined in CSS:

- Dynamic widths based on percentages
- Dynamic heights based on data
- Dynamic colors based on conditions

This is an acceptable pattern and follows React best practices.

## 📡 API Endpoints

All components expect the following API endpoints:

### Model List

```batch
GET /api/ai-annotator/models
Response: { success: boolean, data: ModelConfig[] }
```

### Model Recommendations

```batch
GET /api/ai-annotator/models/recommendations?prioritize=<criteria>&maxCost=<number>&minAccuracy=<number>
Response: { success: boolean, data: ModelRecommendation[] }
```

### Model Statistics

```batch
GET /api/ai-annotator/models/stats?days=<number>
Response: { success: boolean, data: ModelStats[] }
```

### Cost Data

```batch
GET /api/ai-annotator/models/cost?period=<day|week|month>
Response: { success: boolean, data: CostBreakdown }
```

### Usage Data

```batch
GET /api/ai-annotator/models/usage?days=<number>
Response: { success: boolean, data: UsageDataPoint[] }
```

## 🔧 TypeScript Types

### ModelConfig

```typescript
interface ModelConfig {
  name: string;
  provider: "openai" | "anthropic" | "ollama" | "fallback";
  available: boolean;
  description?: string;
  capabilities?: string[];
  costPerToken?: number;
  maxTokens?: number;
}
```

### ModelRecommendation

```typescript
interface ModelRecommendation {
  modelName: string;
  provider: string;
  speed: number;        // ms (lower is better)
  accuracy: number;     // 0-1 (higher is better)
  cost: number;         // $ per 1k tokens
  reliability: number;  // 0-1 (higher is better)
  overallScore: number; // 0-100
}
```

### ModelStats

```typescript
interface ModelStats {
  modelName: string;
  provider: string;
  totalRequests: number;
  successfulRequests: number;
  totalCost: number;
  averageDuration: number;
  successRate: number;
}
```

## ♿ Accessibility

All components follow accessibility best practices:

- ✅ All `<select>` elements have `id` and `aria-label` attributes
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Color contrast compliant
- ✅ Semantic HTML structure

## 🧪 Testing

Components are tested with:

- Unit tests (React Testing Library)
- Integration tests for API calls
- Accessibility tests (axe-core)

## 🚀 Performance

Optimizations implemented:

- CSS Modules for efficient styling
- Lazy loading of heavy visualizations
- Memoized calculations
- Debounced search inputs
- Optimized re-renders with React hooks

## 📝 Code Quality

- ✅ TypeScript strict mode enabled
- ✅ ESLint compliant (no warnings)
- ✅ Zero `any` types
- ✅ JSDoc documentation
- ✅ CSS Modules (no inline style objects)
- ✅ React Hooks best practices

## 🔄 Recent Improvements (2025-12-17)

1. **CSS Modules Migration**: Converted all components from inline style objects to CSS Modules
2. **TypeScript Strictness**: Eliminated all `any` types with proper union types
3. **Accessibility**: Added `aria-label` and `id` attributes to all form controls
4. **Documentation**: Added comprehensive JSDoc comments
5. **Export Organization**: Centralized exports through `index.ts`
6. **Hook Dependencies**: Fixed all React Hook dependency warnings
7. **Code Reduction**: Removed ~800 lines of redundant style objects

## 🐛 Known Issues

None. All TypeScript errors and warnings have been resolved.

## 📚 Related Documentation

- [AI Annotator Guide](../../../docs/AI_ANNOTATOR_UI_GUIDE.md)
- [Model Management API](../../../docs/API_REFERENCE.md)
- [Component Architecture](../../../docs/ARCHITECTURE.md)

## 🤝 Contributing

When contributing to these components:

1. Follow CSS Modules patterns (no style objects)
2. Maintain TypeScript strict mode compliance
3. Add JSDoc documentation
4. Test accessibility with screen readers
5. Update this README for new features
