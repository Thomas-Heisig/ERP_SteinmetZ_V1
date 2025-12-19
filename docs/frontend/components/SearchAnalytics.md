# Search Analytics Module

Comprehensive search analytics dashboard for monitoring search performance, tracking popular queries, and analyzing user search behavior in the ERP system.

## Components

### SearchAnalyticsDashboard

The main analytics dashboard that provides insights into search usage, performance metrics, and query patterns.

#### SearchAnalyticsDashboard Features

- **Real-time Metrics**: Total queries, unique queries, latency statistics
- **Performance Tracking**: P95 and P99 latency percentiles
- **Query Analysis**: Top searches and zero-result queries
- **Performance Distribution**: Query response time breakdown
- **Trend Visualization**: Search volume over time with interactive charts
- **Time Range Selection**: Last hour, 24 hours, week, or 30 days
- **Responsive Design**: Adapts to mobile and desktop screens
- **Dark Mode Support**: Automatic dark mode via system preferences

#### SearchAnalyticsDashboard Usage

```tsx
import { SearchAnalyticsDashboard } from "@/components/SearchAnalytics";

function AnalyticsPage() {
  return <SearchAnalyticsDashboard apiBaseUrl="http://localhost:3000" />;
}
```

#### SearchAnalyticsDashboard Props

| Prop         | Type     | Default                   | Description               |
| ------------ | -------- | ------------------------- | ------------------------- |
| `apiBaseUrl` | `string` | `"http://localhost:3000"` | Base URL for API requests |

#### SearchAnalyticsDashboard API Endpoints

- `GET /api/search/analytics/dashboard?hours={timeRange}` - Fetch analytics data for specified time range

## Installation

The component is already integrated into the project. No additional installation required.

## File Structure

```text
SearchAnalytics/
├── index.tsx                              # Module exports
├── SearchAnalyticsDashboard.tsx           # Dashboard component
├── SearchAnalyticsDashboard.module.css    # Component styles (CSS Modules)
└── README.md                              # This file
```

## Styling

Uses CSS Modules for scoped styling with the following features:

- **CSS Modules**: Automatic class name scoping to prevent conflicts
- **CSS Variables**: Theme-aware styling with CSS custom properties
- **Responsive Design**: Mobile-first approach with breakpoints at 768px
- **Dark Mode**: Automatic support via `prefers-color-scheme`
- **Accessibility**: Focus states, proper contrast ratios
- **Transitions**: Smooth animations for interactive elements

### CSS Module Classes

All classes are scoped via CSS Modules:

```tsx
import styles from "./SearchAnalyticsDashboard.module.css";

<div className={styles.container}>
  <div className={styles.card}>...</div>
</div>;
```

## Type Definitions

### SearchMetrics

```typescript
interface SearchMetrics {
  totalQueries: number;
  uniqueQueries: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  zeroResultsRate: number;
  clickThroughRate: number;
}
```

### PopularQuery

```typescript
interface PopularQuery {
  query: string;
  count: number;
  averageResults: number;
  averageLatency: number;
}
```

### SearchTrend

```typescript
interface SearchTrend {
  timestamp: string;
  queryCount: number;
  averageLatency: number;
  zeroResultsCount: number;
}
```

### PerformanceDistribution

```typescript
interface PerformanceDistribution {
  range: string;
  count: number;
}
```

### DashboardData

```typescript
interface DashboardData {
  summary: SearchMetrics;
  topQueries: PopularQuery[];
  zeroResultQueries: PopularQuery[];
  trends: SearchTrend[];
  performanceDistribution: PerformanceDistribution[];
}
```

## Features Explained

### Summary Metrics Cards

Seven key metrics displayed as cards:

1. **Total Queries**: All search queries in the time range
2. **Unique Queries**: Distinct search terms
3. **Avg Latency**: Mean response time
4. **P95 Latency**: 95th percentile (only 5% slower)
5. **P99 Latency**: 99th percentile (outlier detection)
6. **Zero Results**: Percentage of searches with no results
7. **Click-Through Rate**: How often users click on results

### Top Search Queries

Lists most popular searches with:

- Query text
- Number of searches
- Average result count
- Average latency
- Visual bar chart for comparison

### Queries with Zero Results

Tracks searches that returned no results:

- Helps identify missing content or data
- Shows search volume for failed queries
- Useful for improving search coverage

### Performance Distribution

Breaks down queries by response time:

- `< 50ms` - Excellent
- `50-100ms` - Good
- `100-200ms` - Acceptable
- `200-500ms` - Slow
- `> 500ms` - Very slow

### Search Volume Trends

Interactive chart showing:

- Query volume over time
- Hover for details (latency, zero results)
- Automatic time interval based on range
- Identifies usage patterns and peak times

## Performance

- **useCallback**: Optimized API calls prevent unnecessary re-renders
- **CSS Modules**: Automatic code splitting and scoped styles
- **Lazy Loading**: Components load only necessary data
- **Memoization**: Efficient chart calculations

## Accessibility

- **ARIA Labels**: All interactive elements properly labeled
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Clear focus indicators
- **Screen Reader Support**: Semantic HTML structure
- **Color Contrast**: WCAG AA compliant

## Responsive Design

- **Mobile First**: Optimized for mobile screens
- **Breakpoints**:
  - `768px`: Tablet layout adjustments
  - Default: Desktop layout
- **Flexible Grids**: Adapts to available space
- **Touch Friendly**: Large tap targets on mobile

## Dark Mode

Automatic dark mode based on system preference:

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

- Proper contrast ratios maintained
- All colors adjusted for readability
- Smooth transition between modes

## Best Practices

1. **Monitor regularly** to identify performance issues
2. **Track zero-result queries** to improve content coverage
3. **Watch P95/P99 latency** for outlier detection
4. **Analyze top queries** to understand user needs
5. **Use time ranges** to spot usage patterns

## Error Handling

- Network failure handling
- Empty state displays
- Loading indicators
- Error messages with helpful text

## Testing

To test the component:

1. Start backend: `cd apps/backend && npm run dev`
2. Start frontend: `cd apps/frontend && npm run dev`
3. Navigate to search analytics section
4. Test different time ranges
5. Verify data loads correctly

## Troubleshooting

### Dashboard not loading

- Check API endpoint is accessible
- Verify `apiBaseUrl` prop is correct
- Check browser console for errors
- Ensure backend analytics endpoint exists

### Data seems incorrect

- Verify time range selection
- Check backend logs for data issues
- Confirm database has analytics data
- Test API endpoint directly

### Styling issues

- Verify CSS Modules import is correct
- Check for global style conflicts
- Clear browser cache
- Verify CSS file exists

## Future Enhancements

- [ ] Export data (CSV/JSON/PDF)
- [ ] Custom date range picker
- [ ] Query comparison tool
- [ ] Real-time WebSocket updates
- [ ] Search suggestion analytics
- [ ] User session tracking
- [ ] A/B testing metrics
- [ ] Advanced filtering options
- [ ] Custom metric thresholds
- [ ] Alert notifications for anomalies

## Integration Example

```tsx
import { SearchAnalyticsDashboard } from "@/components/SearchAnalytics";

function Dashboard() {
  return (
    <div>
      <h1>Search Analytics</h1>
      <SearchAnalyticsDashboard apiBaseUrl={process.env.VITE_API_URL} />
    </div>
  );
}
```

## Contributing

When modifying this component:

1. Follow existing code patterns
2. Update TypeScript interfaces if data changes
3. Use CSS Modules (no inline styles)
4. Test responsive design and dark mode
5. Run ESLint and fix all warnings
6. Update this README with new features

## License

SPDX-License-Identifier: MIT
