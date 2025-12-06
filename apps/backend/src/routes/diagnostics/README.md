# Diagnostics Router

**Version:** 0.2.0  
**Last Updated:** December 2025

## Overview

The Diagnostics Router provides comprehensive system monitoring and health check capabilities for the ERP system. It offers both a human-readable HTML dashboard and a JSON API for programmatic access to system diagnostics, health checks, database statistics, and self-healing reports.

## Features

- **System Health Monitoring**: Real-time health checks for all system components
- **Database Statistics**: Query performance, connection pool stats, table sizes
- **Self-Healing Reports**: Automated issue detection and resolution tracking
- **Scheduler Status**: Background job monitoring
- **System Information**: CPU, memory, uptime, Node.js version
- **HTML Dashboard**: Visual diagnostic interface
- **JSON API**: Programmatic access for monitoring tools

## API Endpoints

### GET `/diagnostics`

Returns an HTML diagnostic dashboard for human viewing.

**Response:** HTML page with:
- System information (OS, CPU, memory, uptime)
- Application version and build date
- Health check results for all services
- Database statistics and performance metrics
- Scheduler status and job queue
- Self-healing reports and statistics

**Usage:**

```bash
# Open in browser
http://localhost:3000/diagnostics

# Or with curl
curl http://localhost:3000/diagnostics
```

### GET `/diagnostics/api`

Returns diagnostic data in JSON format for programmatic access.

**Response:**

```typescript
{
  success: true;
  timestamp: string;       // ISO datetime
  version: {
    version: string;       // Semver
    buildDate: string;     // ISO datetime
    gitCommit?: string;
  };
  health: {
    overall: "healthy" | "degraded" | "unhealthy";
    checks: {
      [service: string]: {
        status: "healthy" | "unhealthy";
        message?: string;
        latency?: number;
        lastCheck: string;
      }
    }
  };
  database: {
    connectionPoolSize: number;
    activeConnections: number;
    idleConnections: number;
    totalQueries: number;
    slowQueries: number;
    avgQueryTime: number;
    tables: {
      name: string;
      rowCount: number;
      sizeKB: number;
    }[];
  };
  scheduler: {
    running: boolean;
    jobsQueued: number;
    jobsCompleted: number;
    jobsFailed: number;
    lastRun?: string;
  };
  reports: {
    totalReports: number;
    resolvedIssues: number;
    unresolvedIssues: number;
    recentReports: Report[];
  };
  system: {
    hostname: string;
    platform: string;
    arch: string;
    cpus: number;
    totalMemory: number;   // bytes
    freeMemory: number;    // bytes
    uptime: number;        // seconds
    nodeVersion: string;
    processUptime: number; // seconds
  }
}
```

**Usage:**

```bash
curl http://localhost:3000/diagnostics/api | jq .
```

## Diagnostic Components

### Health Checks

Monitors critical system components:
- **Database**: Connection and query capability
- **AI Providers**: OpenAI, Ollama, Anthropic availability
- **File System**: Write/read permissions
- **External APIs**: Third-party service connectivity

**Status Levels:**
- `healthy`: All checks passed
- `degraded`: Some non-critical checks failed
- `unhealthy`: Critical checks failed

### Database Statistics

Provides insights into database performance:
- **Connection Pool**: Active/idle connections
- **Query Performance**: Total queries, slow queries, average time
- **Table Statistics**: Row counts, sizes
- **Slow Query Threshold**: Configurable (default: 100ms)

### Self-Healing System

Monitors automated issue resolution:
- **Issue Detection**: Automatic problem identification
- **Healing Actions**: Corrective measures taken
- **Success Rate**: Percentage of successfully resolved issues
- **Recent Reports**: Last N healing events

### Scheduler Status

Tracks background job execution:
- **Queue Status**: Pending jobs
- **Completion Stats**: Successful/failed jobs
- **Last Execution**: Timestamp of last run
- **Performance**: Average job duration

### System Information

OS and runtime metrics:
- **CPU**: Core count, architecture
- **Memory**: Total, free, used (formatted)
- **Uptime**: System and process uptime
- **Platform**: OS platform and version
- **Node.js**: Runtime version

## HTML Dashboard Features

The HTML dashboard (`/diagnostics`) provides:

### Visual Status Indicators

- 🟢 Green: Healthy components
- 🟡 Yellow: Degraded components
- 🔴 Red: Unhealthy components

### Real-time Metrics

- CPU and memory usage (formatted)
- Active database connections
- Query performance trends
- Job queue depth

### Interactive Tables

- Health check results with timestamps
- Database table statistics
- Recent self-healing events
- Scheduler job history

### Auto-refresh

- Configurable refresh interval
- Manual refresh button
- Last update timestamp

## Monitoring Integration

### Prometheus

Export metrics for Prometheus scraping:

```typescript
// Example integration (future enhancement)
GET /diagnostics/metrics

# HELP system_uptime_seconds System uptime
# TYPE system_uptime_seconds gauge
system_uptime_seconds 3600

# HELP db_queries_total Total database queries
# TYPE db_queries_total counter
db_queries_total 1234
```

### Grafana

Create dashboards using `/diagnostics/api` data:
- Health status over time
- Query performance graphs
- Memory usage trends
- Job success rates

### Alerting

Set up alerts based on diagnostic data:
- Unhealthy health checks
- High slow query count
- Low memory availability
- Failed healing attempts

## Usage Examples

### Check System Health

```bash
# Human-readable
curl http://localhost:3000/diagnostics

# JSON format
curl http://localhost:3000/diagnostics/api | jq '.health'
```

### Monitor Database Performance

```bash
curl http://localhost:3000/diagnostics/api | jq '.database'
```

### Get Self-Healing Reports

```bash
curl http://localhost:3000/diagnostics/api | jq '.reports'
```

### System Resource Check

```bash
curl http://localhost:3000/diagnostics/api | jq '.system'
```

## Utility Functions

### formatBytes(bytes: number): string

Converts bytes to human-readable format (KB, MB, GB).

```typescript
formatBytes(1024) // "1.00 KB"
formatBytes(1048576) // "1.00 MB"
```

### formatUptime(seconds: number): string

Converts seconds to "Xd Xh Xm Xs" format.

```typescript
formatUptime(3665) // "1h 1m 5s"
formatUptime(90000) // "1d 1h 0m 0s"
```

## Error Handling

### HTML Errors

Returns an error page with:
- Error message
- Stack trace (if available)
- Link to retry

### API Errors

Returns JSON error response:

```typescript
{
  success: false;
  error: {
    message: string;
    timestamp: string;
  }
}
```

## Logging

Uses `console.error` for errors. Should be migrated to structured logging (Pino) as per CODE_QUALITY_IMPROVEMENTS.md.

```typescript
console.error("❌ [Diagnostics] Error:", error);
```

## Dependencies

- **express**: Web framework
- **os**: Node.js OS module
- **dbService**: Database abstraction
- **healthMonitor**: Health check service
- **scheduler**: Job scheduler
- **healingReport**: Self-healing system

## Related Services

- **healthMonitor** (`src/services/selfhealing/healthMonitor.ts`)
- **scheduler** (`src/services/selfhealing/scheduler.ts`)
- **healingReport** (`src/services/selfhealing/healingReport.ts`)
- **dbService** (`src/services/dbService.ts`)

## Related Documentation

- [DATABASE_OPTIMIZATION.md](../../../../docs/DATABASE_OPTIMIZATION.md) - DB performance
- [ARCHITECTURE.md](../../../../docs/ARCHITECTURE.md) - System architecture

## Security Considerations

### Access Control

⚠️ **Important:** The diagnostics endpoint currently has no authentication. Consider adding:

```typescript
router.get('/', authenticate(), requireRole(['admin']), diagnosticsHandler);
```

### Information Disclosure

Be cautious about exposing:
- Internal IP addresses
- Database credentials
- System vulnerabilities
- Detailed error messages

### Production Deployment

In production:
- Restrict access by IP address
- Require authentication
- Rate limit requests
- Disable detailed stack traces

## Performance Considerations

- **Caching**: Consider caching diagnostic data (30-60 seconds)
- **Async Operations**: All checks run asynchronously
- **Resource Impact**: Minimal overhead when properly configured
- **Timeout Handling**: Health checks have reasonable timeouts

## Future Enhancements

- [ ] Prometheus metrics export (`/diagnostics/metrics`)
- [ ] Authentication and authorization
- [ ] Configurable refresh intervals
- [ ] Historical data storage and trends
- [ ] Alert threshold configuration
- [ ] WebSocket for real-time updates
- [ ] Export diagnostic reports (PDF, CSV)
- [ ] Integration with monitoring services (DataDog, New Relic)

## Maintainer

Thomas Heisig

**Last Review:** December 2025
