# Backend Documentation Index

Comprehensive documentation for the ERP SteinmetZ backend API and services.

## Architecture & Infrastructure

### Core Infrastructure
- **[Middleware](./infrastructure/Middleware.md)** - Request processing middleware
- **[Monitoring Service](./infrastructure/Monitoring-Service.md)** - System monitoring
- **[Monitoring Setup](./infrastructure/Monitoring-Setup.md)** - Monitoring configuration

## Services

### Database & Persistence
- **[Database Service](../../apps/backend/src/services/dbService.ts)** - Database abstraction layer
  - Supports SQLite (development) and PostgreSQL (production)
  - Schema management and migrations
  - Connection pooling and retry logic

### AI & Automation Services
- **[AI Service](../modules/ai/README_SERVICE.md)** - AI orchestration service
- **[AI Annotator Service](../../apps/backend/src/services/aiAnnotatorService.ts)** - Annotation service
- **[Functions Catalog Service](../../apps/backend/src/services/functionsCatalogService.ts)** - Function catalog

### Monitoring & Observability
- **[Monitoring Service](./infrastructure/Monitoring-Service.md)** - Health checks and metrics
- See also: [Monitoring Guide](../MONITORING.md)

## API Routes

All API routes are organized by module. See [Module Documentation](../modules/README.md) for detailed API specifications.

### Core Routes
- **/api/auth** - Authentication and authorization
- **/api/calendar** - Calendar and scheduling
- **/api/diagnostics** - System diagnostics

### Business Module Routes
- **/api/dashboard** - Dashboard data and KPIs
- **/api/finance** - Financial operations
- **/api/hr** - Human resources
- **/api/documents** - Document management
- **/api/innovation** - Innovation management

### AI & Automation Routes
- **/api/ai** - AI orchestration
- **/api/ai-annotator** - AI annotation
- **/api/quickchat** - Chat assistant
- **/api/functions-catalog** - Function catalog

### System Routes
- **/api/system-info** - System information
- **/api/metrics** - Performance metrics

## Technology Stack

- **Runtime**: Node.js >= 18.18.0
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Custom database service
- **Validation**: Zod
- **Testing**: Vitest
- **Documentation**: JSDoc + TypeDoc

## Development Guide

### Setup
1. Follow [Developer Onboarding](../DEVELOPER_ONBOARDING.md)
2. Configure [Environment Variables](../ENVIRONMENT_VARIABLES.md)
3. Review [Code Conventions](../CODE_CONVENTIONS.md)

### Creating New Routes
1. Create route file in `apps/backend/src/routes/<module>/`
2. Define types and validation schemas
3. Implement route handlers
4. Add middleware as needed
5. Document with JSDoc
6. Write tests
7. Update module documentation

### Database Changes
1. Review [Database Migrations](../DATABASE_MIGRATIONS.md)
2. Update schema in `dbService.ts`
3. Create migration script if needed
4. Test with both SQLite and PostgreSQL
5. Document schema changes

## Best Practices

### Code Quality
- **TypeScript**: Use strict mode
- **Error Handling**: Standardized error responses
- **Validation**: Validate all inputs with Zod
- **Security**: Follow security best practices
- **Testing**: Comprehensive unit and integration tests

### API Design
- **RESTful**: Follow REST principles
- **Versioning**: Version APIs appropriately
- **Documentation**: Document all endpoints
- **Error Messages**: Provide clear error messages
- **Status Codes**: Use appropriate HTTP status codes

### Performance
- **Caching**: Implement caching where appropriate
- **Database**: Optimize queries and use indexes
- **Rate Limiting**: Implement rate limiting
- **Monitoring**: Track performance metrics

## Configuration

### Environment Variables
See [Environment Variables Guide](../ENVIRONMENT_VARIABLES.md) for complete configuration options.

Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `AI_PROVIDER` - AI provider configuration

### Database Configuration
- **Development**: SQLite (`data/erp_dev.db`)
- **Production**: PostgreSQL (configure via DATABASE_URL)

## Security

### Authentication
- JWT-based authentication
- See [Authentication Guide](../AUTHENTICATION.md)

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions

### Data Protection
- **Encryption**: Data encrypted at rest and in transit
- **GDPR**: PII classification and retention policies
- **GoBD**: Immutable audit logs
- See [Compliance Guide](../COMPLIANCE.md)

## Testing

### Running Tests
```bash
# All backend tests
npm run test:backend

# With coverage
npm run test:coverage:backend

# Watch mode
npm run test:watch:backend
```

### Test Structure
- Unit tests alongside source files (`*.test.ts`)
- Integration tests in `tests/integration/`
- E2E tests in `tests/e2e/`

## Monitoring & Logging

### Logging
- Structured logging with Winston
- Log levels: error, warn, info, debug
- See [Logging Guide](../LOG_AGGREGATION.md)

### Monitoring
- Health checks at `/api/health`
- Metrics at `/api/metrics`
- See [Monitoring Guide](../MONITORING.md)

### Tracing
- OpenTelemetry integration
- See [Tracing Setup](../TRACING_SETUP.md)

### Error Tracking
- Sentry integration
- See [Sentry Integration](../SENTRY_INTEGRATION.md)

## Deployment

### Build
```bash
npm run build:backend
```

### Start
```bash
npm run start:backend
```

### Docker
See deployment documentation for Docker configuration.

## Quick Links

### Development
- [Developer Onboarding](../DEVELOPER_ONBOARDING.md)
- [Code Conventions](../CODE_CONVENTIONS.md)
- [Development Scripts](../development/Scripts.md)

### Architecture
- [System Architecture](../ARCHITECTURE.md)
- [Module Documentation](../modules/README.md)
- [Database Migrations](../DATABASE_MIGRATIONS.md)

### Operations
- [Monitoring](../MONITORING.md)
- [Error Handling](../ERROR_HANDLING.md)
- [Backup & Restore](../BACKUP_RESTORE.md)

### Security & Compliance
- [Authentication](../AUTHENTICATION.md)
- [Compliance](../COMPLIANCE.md)
- [Rate Limiting](../RATE_LIMITING.md)

## Contributing

When adding backend features:
1. Follow code conventions
2. Add comprehensive tests
3. Document API endpoints
4. Update module documentation
5. Consider security implications
6. Add monitoring and logging
7. Update this index

## Related Documentation

- [Frontend Documentation](../frontend/README.md)
- [Module Documentation](../modules/README.md)
- [API Reference](../reference/modules-index.md)
- [Architecture](../ARCHITECTURE.md)
