# Monitoring Service

This module provides basic metrics collection and monitoring capabilities for the ERP SteinmetZ backend.

## Features

- **Counters**: Track cumulative values that only increase (e.g., total requests)
- **Gauges**: Track values that can go up and down (e.g., active connections)
- **Histograms**: Track distributions of values (e.g., request durations)
- **Prometheus Export**: Export metrics in Prometheus text format
- **JSON Export**: Export metrics as JSON for custom dashboards

## Usage

### Basic Examples

```typescript
import { metricsService } from './services/monitoring/metricsService.js';

// Increment a counter
metricsService.incrementCounter('http_requests_total', {
  method: 'GET',
  endpoint: '/api/users',
  status: '200'
});

// Set a gauge value
metricsService.setGauge('active_connections', 42);

// Record histogram observation
const start = Date.now();
// ... do work
const duration = (Date.now() - start) / 1000;
metricsService.recordHistogram('request_duration_seconds', duration);
```

### Available Metrics

#### HTTP Metrics
- `http_requests_total` - Total HTTP requests (counter)
- `http_request_errors_total` - Total HTTP errors (counter)

#### Database Metrics
- `db_queries_total` - Total database queries (counter)
- `db_query_duration_seconds` - Database query duration (histogram)

#### AI Metrics
- `ai_requests_total` - Total AI requests (counter)
- `ai_request_duration_seconds` - AI request duration (histogram)

#### Business Metrics
- `active_users` - Currently active users (gauge)
- `active_sessions` - Currently active sessions (gauge)

## API Endpoints

### GET /api/monitoring/metrics
Get all metrics in JSON format.

**Response:**
```json
{
  "success": true,
  "data": {
    "counters": {
      "http_requests_total": 1234
    },
    "gauges": {
      "active_users": 42
    },
    "histograms": {
      "request_duration_seconds": {
        "count": 1000,
        "sum": 123.45,
        "min": 0.001,
        "max": 2.5,
        "avg": 0.123,
        "p50": 0.1,
        "p95": 0.5,
        "p99": 1.2
      }
    }
  },
  "timestamp": "2025-12-09T10:00:00.000Z"
}
```

### GET /api/monitoring/metrics/prometheus
Get all metrics in Prometheus text format for scraping.

**Response:**
```
# TYPE http_requests_total counter
http_requests_total 1234
http_requests_total{method="GET",status="200"} 800
http_requests_total{method="POST",status="201"} 434

# TYPE active_users gauge
active_users 42

# TYPE request_duration_seconds histogram
request_duration_seconds_count 1000
request_duration_seconds_sum 123.45
request_duration_seconds_bucket{le="0.005"} 100
request_duration_seconds_bucket{le="0.01"} 250
...
```

### GET /api/monitoring/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-09T10:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  },
  "metricsEnabled": true
}
```

### POST /api/monitoring/metrics/reset
Reset all metrics (for testing/development only).

**Response:**
```json
{
  "success": true,
  "message": "All metrics have been reset",
  "timestamp": "2025-12-09T10:00:00.000Z"
}
```

## Integration with Middleware

### HTTP Request Metrics

You can automatically track HTTP requests using the existing `metricsMiddleware`:

```typescript
import { metricsService } from './services/monitoring/metricsService.js';

app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    // Increment counter
    metricsService.incrementCounter('http_requests_total', {
      method: req.method,
      endpoint: req.path,
      status: res.statusCode.toString()
    });
    
    // Record duration
    metricsService.recordHistogram('http_request_duration_seconds', duration);
    
    // Track errors
    if (res.statusCode >= 400) {
      metricsService.incrementCounter('http_request_errors_total', {
        method: req.method,
        endpoint: req.path,
        status: res.statusCode.toString()
      });
    }
  });
  
  next();
});
```

## Future Enhancements

This is a basic implementation. For production use, consider:

1. **Prometheus Client**: Use official `prom-client` library
2. **Grafana Integration**: Create dashboards for visualization
3. **Alert Rules**: Define alert conditions in Prometheus
4. **Custom Metrics**: Add business-specific metrics
5. **Metric Labels**: Add more granular labels for better filtering
6. **Metric Retention**: Implement time-series database storage

## Production Setup

### Prometheus Configuration

Example `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'erp-steinmetz'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/api/monitoring/metrics/prometheus'
```

### Grafana Dashboard

Import the pre-built Grafana dashboards from `apps/backend/config/grafana/`:

- `dashboard-overview.json` - System overview
- `dashboard-ai.json` - AI metrics
- `dashboard-business.json` - Business metrics

## Testing

```typescript
import { metricsService } from './services/monitoring/metricsService.js';

// Reset metrics before each test
beforeEach(() => {
  metricsService.reset();
});

// Test counter
test('counter increments correctly', () => {
  metricsService.incrementCounter('test_counter');
  expect(metricsService.getCounter('test_counter')).toBe(1);
  
  metricsService.incrementCounter('test_counter', {}, 5);
  expect(metricsService.getCounter('test_counter')).toBe(6);
});

// Test histogram
test('histogram records observations', () => {
  metricsService.recordHistogram('test_histogram', 0.1);
  metricsService.recordHistogram('test_histogram', 0.2);
  metricsService.recordHistogram('test_histogram', 0.3);
  
  const stats = metricsService.getHistogramStats('test_histogram');
  expect(stats?.count).toBe(3);
  expect(stats?.avg).toBeCloseTo(0.2);
});
```

## License

MIT License - see [LICENSE](../../../../LICENSE) for details.
