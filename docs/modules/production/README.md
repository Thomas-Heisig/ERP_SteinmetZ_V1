# Production Module

## Overview

The Production module provides manufacturing and production management including work orders, bill of materials (BOM), production planning, and shop floor control.

## Features

- **Work Orders**: Create and track production orders
- **Bill of Materials**: Define product components and assemblies
- **Production Planning**: Schedule production activities
- **Shop Floor Control**: Track production progress
- **Quality Control**: Quality checks and inspections
- **Production Analytics**: Efficiency and performance metrics

## API Endpoints

### Work Orders

#### `GET /api/production/work-orders`
List all work orders.

#### `POST /api/production/work-orders`
Create a new work order.

#### `GET /api/production/work-orders/:id`
Get work order details.

#### `PUT /api/production/work-orders/:id`
Update work order.

#### `POST /api/production/work-orders/:id/start`
Start production.

#### `POST /api/production/work-orders/:id/complete`
Complete work order.

### Bill of Materials

#### `GET /api/production/bom`
List all BOMs.

#### `POST /api/production/bom`
Create a new BOM.

#### `GET /api/production/bom/:id`
Get BOM details with components.

#### `PUT /api/production/bom/:id`
Update BOM.

### Production Planning

#### `GET /api/production/schedule`
Get production schedule.

#### `POST /api/production/schedule`
Schedule production.

### Quality Control

#### `GET /api/production/quality-checks`
List quality checks.

#### `POST /api/production/quality-checks`
Record quality check.

### Analytics

#### `GET /api/production/analytics`
Get production analytics.

## Integration Points

- **Inventory Module**: Material consumption and finished goods
- **Sales Module**: Production based on orders
- **Procurement Module**: Material requirements

## Version History

- **v0.3.0** (2025-12-19): Initial production module implementation
