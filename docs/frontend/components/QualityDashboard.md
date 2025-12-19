# Quality Dashboard Module

Comprehensive quality assurance tools for reviewing and monitoring AI-annotated nodes and ensuring data quality across the ERP system.

## Components

### QADashboard

The main dashboard component that provides an overview of quality assurance metrics and recent reviews.

#### QADashboard Features

- **Summary Cards**: Display total, pending, approved, and rejected reviews
- **Quality Metrics**: Show average quality score and review time
- **Recent Reviews Table**: List of recently completed reviews with status and scores
- **Real-time Updates**: Refresh button to fetch latest data
- **Responsive Design**: Adapts to different screen sizes
- **Dark Mode Support**: Automatic dark mode based on system preferences

#### QADashboard Usage

```tsx
import { QADashboard } from "@/components/QualityDashboard";

function App() {
  return <QADashboard apiBaseUrl="http://localhost:3000" />;
}
```

#### QADashboard Props

| Prop         | Type     | Default                   | Description               |
| ------------ | -------- | ------------------------- | ------------------------- |
| `apiBaseUrl` | `string` | `"http://localhost:3000"` | Base URL for API requests |

#### QADashboard API Endpoints

- `GET /api/ai-annotator/qa/dashboard` - Fetch dashboard summary and recent reviews

### ManualReviewInterface

Interactive interface for manual review of pending quality assurance items.

#### ManualReviewInterface Features

- **Review Queue**: Display pending reviews with preview
- **Node Information**: Show detailed node data including ID, name, kind, and description
- **Quality Score Display**: Visual indication of quality scores with color coding
- **Review Actions**: Approve, reject, request revision, or skip reviews
- **Comment System**: Add review comments for each action
- **Queue Preview**: See upcoming reviews in the queue
- **Keyboard Navigation**: Navigate between reviews efficiently
- **Progress Tracking**: Show current position in review queue

#### ManualReviewInterface Usage

```tsx
import { ManualReviewInterface } from "@/components/QualityDashboard";

function ReviewPage() {
  const handleReviewComplete = (review) => {
    console.log("Review completed:", review);
  };

  return (
    <ManualReviewInterface
      apiBaseUrl="http://localhost:3000"
      onReviewComplete={handleReviewComplete}
    />
  );
}
```

#### ManualReviewInterface Props

| Prop               | Type                         | Default                   | Description                         |
| ------------------ | ---------------------------- | ------------------------- | ----------------------------------- |
| `apiBaseUrl`       | `string`                     | `"http://localhost:3000"` | Base URL for API requests           |
| `onReviewComplete` | `(review: QAReview) => void` | `undefined`               | Callback when a review is completed |

#### ManualReviewInterface API Endpoints

- `GET /api/ai-annotator/qa/reviews?status=pending&limit=50` - Fetch pending reviews
- `PUT /api/ai-annotator/qa/reviews/:id` - Update review status

#### ManualReviewInterface Quality Score Colors

- **Green** (80-100): High quality
- **Yellow** (60-79): Medium quality
- **Red** (0-59): Low quality

### QualityTrendChart

Visualization component for displaying quality trends over time.

#### QualityTrendChart Features

- Chart rendering for quality metrics
- Metric selection
- Statistics display
- Interactive tooltips

## Installation

The components are already integrated into the project. No additional installation required.

## File Structure

```text
QualityDashboard/
├── index.tsx                      # Module exports
├── QADashboard.tsx                # Dashboard component
├── QADashboard.css                # Dashboard styles
├── ManualReviewInterface.tsx      # Review interface component
├── ManualReviewInterface.css      # Review interface styles
├── QualityTrendChart.tsx          # Chart component
└── README.md                      # This file
```

## Styling

All components use external CSS files with BEM-like naming conventions:

- `.qa-dashboard-*` - Dashboard component classes
- `.manual-review-*` - Review interface classes

### CSS Features

- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 480px
- **Dark Mode**: Automatic dark mode support via `prefers-color-scheme`
- **Accessibility**: Focus states, ARIA labels, keyboard navigation
- **Transitions**: Smooth hover and active states
- **Color Coding**: Status-based colors for visual feedback

## Type Definitions

### QASummary

```typescript
interface QASummary {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageQualityScore: number;
  averageReviewTime: number;
}
```

### QAReview

```typescript
interface QAReview {
  id: string;
  nodeId: string;
  reviewer?: string;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_revision";
  qualityScore?: number;
  reviewComments?: string;
  createdAt: string;
  reviewedAt?: string;
  nodeData?: {
    name: string;
    kind: string;
    description?: string;
  };
}
```

## Keyboard Shortcuts (Planned)

Future enhancements will include keyboard shortcuts for review actions:

- `A` - Approve current review
- `R` - Reject current review
- `V` - Request revision
- `S` - Skip to next review
- `←/→` - Navigate between reviews
- `Ctrl+Enter` - Submit review with comment

## Best Practices

1. **Always provide comments** for rejected or revision-needed reviews
2. **Review sequentially** through the queue for consistency
3. **Check node context** before making review decisions
4. **Monitor quality scores** to identify patterns
5. **Use refresh** to ensure you're reviewing the latest data

## Error Handling

All components include error handling for:

- Network failures
- API errors
- Missing data
- Invalid responses

Error messages are displayed to users with appropriate styling.

## Performance

- **Lazy Loading**: Components load only necessary data
- **Memoization**: Uses React hooks for optimized rendering
- **Batch Updates**: Multiple reviews can be processed efficiently
- **Pagination**: Large review lists are limited to prevent performance issues

## Accessibility

- **ARIA Labels**: All interactive elements have proper labels
- **Keyboard Navigation**: Full keyboard support for all actions
- **Focus Management**: Clear focus indicators
- **Screen Reader Support**: Semantic HTML and descriptive text
- **Color Contrast**: WCAG AA compliant color contrast ratios

## Testing

To test the components:

1. Start the backend server: `cd apps/backend && npm run dev`
2. Start the frontend: `cd apps/frontend && npm run dev`
3. Navigate to the quality dashboard section
4. Test review actions and dashboard updates

## Future Enhancements

- [ ] Bulk review actions
- [ ] Advanced filtering and sorting
- [ ] Export functionality (CSV/JSON)
- [ ] Review history timeline
- [ ] Reviewer performance analytics
- [ ] Custom quality score thresholds
- [ ] Review templates for common comments
- [ ] Automated review suggestions
- [ ] Integration with notification system
- [ ] Review assignment system

## Troubleshooting

### Dashboard not loading

- Check API endpoint is accessible
- Verify `apiBaseUrl` prop is correct
- Check browser console for errors

### Reviews not updating

- Ensure backend is running
- Check network tab for failed requests
- Verify API response format matches interfaces

### Styling issues

- Clear browser cache
- Check CSS files are imported correctly
- Verify no conflicting global styles

## Contributing

When modifying these components:

1. Follow existing code patterns
2. Update TypeScript interfaces if data structure changes
3. Add CSS classes for new elements (no inline styles)
4. Test responsive design and dark mode
5. Update this README with new features
6. Run ESLint and fix all warnings

## License

SPDX-License-Identifier: MIT
