# Geschäftsverwaltung Module Documentation

## Overview

The Geschäftsverwaltung (Business Management) module is a comprehensive system for managing all business-related master data, organizational structures, and document processes based on the concept document `docs/concept/_2_GESCHÄFTSVERWALTUNG.md`.

## Features

### 1. Company Master Data (Unternehmens-Stammdaten)

Complete company information management including basic data, legal information, tax details, bank accounts, and communication channels.

### 2. Organizational Structure (Organisation)

Hierarchical management of departments, locations, cost centers, and roles with full tracking of responsibilities and budgets.

### 3. Document Management

Template library, version control, workflow automation, and compliant document archiving.

### 4. Audit Trail

Comprehensive change history with user tracking and data integrity verification.

## Database Schema

See `apps/backend/src/migrations/create_business_management_tables.sql` for complete schema.

## API Endpoints

All endpoints are prefixed with `/api/business/`

- Company: `/company/*`
- Organization: `/organization/*`
- Documents: `/documents/*`

See inline code documentation for detailed API specifications.

## Frontend Components

- **CompanyPage**: Company master data management
- **OrganizationPage**: Organizational structure management

## Implementation Status

✅ Database schema complete
✅ Backend API complete
✅ Frontend components implemented
✅ Validation and error handling
✅ Documentation

## Next Steps

- Add workflow designer UI
- Implement document template editor
- Add advanced search capabilities
- Integration with HR and Finance modules
