# Warehouse Module

## Overview

The Warehouse module provides warehouse management system (WMS) functionality including location management, picking, packing, shipping, and warehouse operations.

## Features

- **Location Management**: Define warehouse locations and zones
- **Goods Receipt**: Receive and put away goods
- **Picking**: Pick orders for shipment
- **Packing**: Pack orders for shipping
- **Shipping**: Create shipments and track deliveries
- **Warehouse Analytics**: Space utilization and efficiency

## API Endpoints

### Locations

#### `GET /api/warehouse/locations`

List all warehouse locations.

#### `POST /api/warehouse/locations`

Create a new location.

#### `GET /api/warehouse/locations/:id`

Get location details and inventory.

### Receipts

#### `GET /api/warehouse/receipts`

List goods receipts.

#### `POST /api/warehouse/receipts`

Create a new receipt.

#### `GET /api/warehouse/receipts/:id`

Get receipt details.

#### `POST /api/warehouse/receipts/:id/putaway`

Put away received goods.

### Picking

#### `GET /api/warehouse/pick-lists`

List pick lists.

#### `POST /api/warehouse/pick-lists`

Create a pick list.

#### `GET /api/warehouse/pick-lists/:id`

Get pick list details.

#### `POST /api/warehouse/pick-lists/:id/complete`

Complete picking.

### Shipments

#### `GET /api/warehouse/shipments`

List shipments.

#### `POST /api/warehouse/shipments`

Create a new shipment.

#### `GET /api/warehouse/shipments/:id`

Get shipment details.

#### `POST /api/warehouse/shipments/:id/ship`

Mark shipment as shipped.

### Analytics

#### `GET /api/warehouse/analytics`

Get warehouse analytics.

## Integration Points

- **Inventory Module**: Stock movements and locations
- **Sales Module**: Order fulfillment
- **Procurement Module**: Goods receipt

## Version History

- **v0.3.0** (2025-12-19): Initial warehouse module implementation
