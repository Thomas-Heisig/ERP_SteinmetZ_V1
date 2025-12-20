# Procurement Module

## Overview

The Procurement module provides purchase order management, supplier management, requisitions, and procurement analytics.

## Features

- **Purchase Orders**: Create and track purchase orders
- **Supplier Management**: Manage supplier information and relationships
- **Requisitions**: Internal purchase requests and approvals
- **Receiving**: Goods receipt and quality inspection
- **Procurement Analytics**: Spending analysis and supplier performance

## API Endpoints

### Purchase Orders

#### `GET /api/procurement/purchase-orders`

List all purchase orders.

#### `POST /api/procurement/purchase-orders`

Create a new purchase order.

#### `GET /api/procurement/purchase-orders/:id`

Get purchase order details.

#### `PUT /api/procurement/purchase-orders/:id`

Update purchase order.

#### `POST /api/procurement/purchase-orders/:id/approve`

Approve a purchase order.

### Suppliers

#### `GET /api/procurement/suppliers`

List all suppliers.

#### `POST /api/procurement/suppliers`

Create a new supplier.

#### `GET /api/procurement/suppliers/:id`

Get supplier details.

#### `PUT /api/procurement/suppliers/:id`

Update supplier information.

### Requisitions

#### `GET /api/procurement/requisitions`

List purchase requisitions.

#### `POST /api/procurement/requisitions`

Create a new requisition.

#### `GET /api/procurement/requisitions/:id`

Get requisition details.

#### `PUT /api/procurement/requisitions/:id/approve`

Approve a requisition.

### Analytics

#### `GET /api/procurement/analytics`

Get procurement analytics.

## Integration Points

- **Inventory Module**: Stock replenishment
- **Finance Module**: Purchase invoices and payments
- **Projects Module**: Project-specific procurement

## Version History

- **v0.3.0** (2025-12-19): Initial procurement module implementation
