# Business Module

## Overview

The Business module provides core business management functionality including company settings, organization structure, document management, and business process automation.

## Sub-Modules

This module consists of four main routers:

### 1. Business Router (`businessRouter.ts`)
Core business settings and configuration.

### 2. Company Router (`companyRouter.ts`)
Company-wide settings, multi-company support, and organizational details.

### 3. Document Router (`documentRouter.ts`)
Business document management and workflows.

### 4. Organization Router (`organizationRouter.ts`)
Organizational structure, departments, and hierarchies.

## API Endpoints

### Company Management

#### `GET /api/business/companies`
List all companies (multi-tenant support).

#### `POST /api/business/companies`
Create a new company.

#### `GET /api/business/companies/:id`
Get company details.

#### `PUT /api/business/companies/:id`
Update company information.

### Organization Structure

#### `GET /api/business/organization/departments`
List all departments.

#### `POST /api/business/organization/departments`
Create a new department.

#### `GET /api/business/organization/hierarchy`
Get organizational hierarchy.

#### `PUT /api/business/organization/structure`
Update organizational structure.

### Business Documents

#### `GET /api/business/documents`
List business documents.

#### `POST /api/business/documents`
Upload business document.

#### `GET /api/business/documents/:id`
Get document details.

#### `PUT /api/business/documents/:id`
Update document.

### Business Settings

#### `GET /api/business/settings`
Get business settings.

#### `PUT /api/business/settings`
Update business settings.

## Features

- **Multi-Company Support**: Manage multiple business entities
- **Organization Structure**: Define departments and hierarchies
- **Document Management**: Business document handling
- **Business Rules**: Configure business logic and rules
- **Workflow Automation**: Business process automation

## Integration Points

- **HR Module**: Employee assignments to departments
- **Finance Module**: Company-specific financial settings
- **Projects Module**: Project organization structure
- **All Modules**: Company-wide settings and configurations

## Version History

- **v0.3.0** (2025-12-19): Initial business module implementation
