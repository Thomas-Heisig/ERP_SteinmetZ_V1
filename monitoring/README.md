# Monitoring Setup for ERP SteinmetZ

This directory contains monitoring configurations for Prometheus and Grafana.

## Overview

The monitoring stack includes:

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **prom-client**: Node.js Prometheus client for metrics export

## Quick Start

### 1. Start Prometheus

Using Docker:

```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  -v $(pwd)/monitoring/prometheus/alert-rules.yml:/etc/prometheus/alert-rules.yml \
  prom/prometheus
```

Or using Docker Compose (see `docker-compose.yml` in project root).

### 2. Start Grafana

Using Docker:

```bash
docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana
```

Default credentials:

- Username: `admin`
- Password: `admin` (you'll be prompted to change on first login)

### 3. Configure Grafana

1. Open Grafana at http://localhost:3001
2. Add Prometheus as a data source:
   - Go to Configuration → Data Sources
   - Click "Add data source"
   - Select "Prometheus"
   - URL: `http://prometheus:9090` (or `http://localhost:9090` if running locally)
   - Click "Save & Test"

3. Import the dashboard:
   - Go to Dashboards → Import
   - Upload `grafana/erp-steinmetz-dashboard.json`
   - Select the Prometheus data source
   - Click "Import"

## Metrics Endpoint

The application exposes metrics at:

- **Prometheus format**: `http://localhost:3000/api/metrics`
- **JSON format**: `http://localhost:3000/api/metrics/json`
- **Health check**: `http://localhost:3000/api/metrics/health`

## Available Metrics

### HTTP Metrics

- `http_requests_total` - Total HTTP requests (counter)
- `http_request_duration_seconds` - HTTP request duration (histogram)
- `http_request_errors_total` - Total HTTP errors (counter)

### Database Metrics

- `db_queries_total` - Total database queries (counter)
- `db_query_duration_seconds` - Database query duration (histogram)
- `db_connections_active` - Active database connections (gauge)

### AI Metrics

- `ai_requests_total` - Total AI requests (counter)
- `ai_request_duration_seconds` - AI request duration (histogram)
- `ai_tokens_used_total` - Total AI tokens used (counter)
- `ai_request_cost_total` - Total AI request cost in USD (counter)

### Business Metrics

- `active_users` - Currently active users (gauge)
- `active_sessions` - Currently active sessions (gauge)
- `business_events_total` - Total business events (counter)

### System Metrics

- `process_cpu_seconds_total` - Process CPU usage
- `process_resident_memory_bytes` - Process memory usage
- `process_heap_bytes` - Heap memory usage
- `nodejs_*` - Various Node.js metrics (from default collectors)

## Alert Rules

Alert rules are defined in `prometheus/alert-rules.yml`:

### HTTP Alerts

- **HighHTTPErrorRate**: Triggers when error rate > 10 errors/sec for 5 minutes
- **SlowHTTPRequests**: Triggers when p95 latency > 2 seconds for 5 minutes
- **VerySlowHTTPRequests**: Triggers when p95 latency > 5 seconds for 3 minutes

### Database Alerts

- **SlowDatabaseQueries**: Triggers when p95 query time > 1 second for 5 minutes
- **HighDatabaseQueryRate**: Triggers when query rate > 1000 queries/sec for 5 minutes
- **DatabaseConnectionPoolExhausted**: Triggers when active connections > 45 for 3 minutes

### AI Alerts

- **HighAICost**: Triggers when hourly cost > $50 for 10 minutes
- **AIProviderFailure**: Triggers when error rate > 10% for 5 minutes
- **SlowAIRequests**: Triggers when p95 latency > 30 seconds for 5 minutes

### System Alerts

- **HighCPUUsage**: Triggers when CPU usage > 80% for 5 minutes
- **HighMemoryUsage**: Triggers when memory usage > 2 GB for 5 minutes
- **ServiceDown**: Triggers immediately when service is down for 1 minute

### Business Alerts

- **LowUserActivity**: Triggers when active users < 1 for 30 minutes
- **HighBusinessEventFailureRate**: Triggers when event failure rate > 5% for 5 minutes

## Dashboard Panels

The Grafana dashboard includes:

1. **HTTP Request Rate**: Requests per second by method, path, and status
2. **HTTP Request Duration (p95)**: 95th percentile response times
3. **HTTP Error Rate**: Errors per second
4. **Active Users & Sessions**: Current active users and sessions
5. **Database Query Rate**: Queries per second by operation and table
6. **Database Query Duration (p95)**: 95th percentile query times
7. **AI Request Rate**: AI requests per second by provider and model
8. **AI Request Duration (p95)**: 95th percentile AI request times
9. **AI Tokens Used (24h)**: Total tokens used in last 24 hours
10. **AI Cost (24h)**: Total AI costs in last 24 hours
11. **CPU Usage**: Process CPU usage percentage
12. **Memory Usage**: Process memory usage
13. **Business Events**: Business events per second

## Customization

### Adding New Metrics

1. Update `apps/backend/src/services/monitoring/prometheusMetricsService.ts`
2. Add new Counter, Gauge, or Histogram
3. Create methods to record metrics
4. Use the metrics in your code

Example:

```typescript
import prometheusMetrics from "./services/monitoring/prometheusMetricsService.js";

// Record a custom metric
prometheusMetrics.recordBusinessEvent("order_created", "success");
```

### Adding New Alert Rules

1. Edit `monitoring/prometheus/alert-rules.yml`
2. Add your alert rule to the appropriate group
3. Restart Prometheus to reload configuration

### Customizing Dashboards

1. Modify `monitoring/grafana/erp-steinmetz-dashboard.json`
2. Re-import the dashboard in Grafana

Or create dashboards directly in Grafana UI and export them.

## Production Considerations

1. **Security**:
   - Protect `/api/metrics` endpoint with authentication in production
   - Use HTTPS for Prometheus and Grafana
   - Configure Grafana authentication (LDAP, OAuth, etc.)

2. **Performance**:
   - Adjust scrape intervals based on your needs
   - Use recording rules for expensive queries
   - Set up remote write for long-term storage

3. **Storage**:
   - Configure Prometheus retention (`--storage.tsdb.retention.time=30d`)
   - Consider remote storage (Thanos, Cortex, or cloud providers)

4. **High Availability**:
   - Run multiple Prometheus instances
   - Use Prometheus federation or Thanos
   - Set up Grafana with a database backend (PostgreSQL)

5. **Alerting**:
   - Configure Alertmanager for notification routing
   - Set up receivers (email, Slack, PagerDuty, etc.)
   - Define escalation policies

## Troubleshooting

### Metrics not showing up

1. Check if metrics endpoint is accessible:

   ```bash
   curl http://localhost:3000/api/metrics
   ```

2. Check Prometheus targets status:
   - Open http://localhost:9090/targets
   - Ensure all targets are "UP"

3. Check Prometheus logs:
   ```bash
   docker logs prometheus
   ```

### Grafana dashboard not loading

1. Verify Prometheus data source is configured correctly
2. Check if queries are valid in Prometheus UI
3. Check Grafana logs for errors

### Alerts not firing

1. Check alert rules are loaded in Prometheus (http://localhost:9090/alerts)
2. Verify Alertmanager is reachable
3. Check alert rule syntax in `alert-rules.yml`

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client Documentation](https://github.com/siimon/prom-client)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)

## Support

For questions or issues, please check:

- Project documentation in `/docs`
- Issue tracker on GitHub
- Contact: maintainer@erp-steinmetz.local
