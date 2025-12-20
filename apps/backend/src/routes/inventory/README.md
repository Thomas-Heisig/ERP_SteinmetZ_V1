# Inventory Management Module

## Overview

The Inventory Management module provides comprehensive functionality for tracking stock levels, managing warehouse operations, product catalog, and inventory movements.

## Features

- **Product Catalog**: Manage inventory items with SKUs, descriptions, and categories
- **Stock Management**: Track quantities, locations, and stock levels
- **Stock Movements**: Record incoming, outgoing, and adjustments
- **Low Stock Alerts**: Monitor items below minimum stock levels
- **Warehouse Management**: Multi-location support
- **Inventory Valuation**: Calculate total inventory value

## API Endpoints

### Inventory Items

#### `GET /api/inventory/items`

List all inventory items with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by product category
- `status` (optional): Filter by stock status (in_stock, low_stock, out_of_stock)
- `search` (optional): Search items by name or SKU

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "sku": "SKU-12345",
      "description": "Product description",
      "category": "electronics",
      "quantity": 150,
      "unit": "pcs",
      "minStock": 50,
      "maxStock": 500,
      "price": 29.99,
      "location": "Warehouse A, Shelf 1",
      "status": "in_stock",
      "created_at": "2025-12-19T10:00:00Z",
      "updated_at": "2025-12-19T10:00:00Z"
    }
  ]
}
```

#### `POST /api/inventory/items`

Create a new inventory item.

**Request Body:**
```json
{
  "name": "Product Name",
  "sku": "SKU-12345",
  "description": "Product description",
  "category": "electronics",
  "quantity": 100,
  "unit": "pcs",
  "minStock": 50,
  "maxStock": 500,
  "price": 29.99,
  "location": "Warehouse A, Shelf 1"
}
```

#### `GET /api/inventory/items/:id`

Get detailed item information including stock history.

#### `PUT /api/inventory/items/:id`

Update item information (except quantity - use stock movements).

#### `DELETE /api/inventory/items/:id`

Delete an inventory item (if no stock movements exist).

### Stock Movements

#### `GET /api/inventory/movements`

List all stock movements with filtering.

**Query Parameters:**
- `itemId` (optional): Filter by item
- `type` (optional): Filter by movement type (in, out, adjustment)
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "itemId": "item-uuid",
      "itemName": "Product Name",
      "quantity": 50,
      "type": "in",
      "reason": "Purchase order received",
      "reference": "PO-2025-001",
      "previousQuantity": 100,
      "newQuantity": 150,
      "created_at": "2025-12-19T10:00:00Z"
    }
  ]
}
```

#### `POST /api/inventory/movements`

Record a stock movement (in, out, or adjustment).

**Request Body:**
```json
{
  "itemId": "item-uuid",
  "quantity": 50,
  "type": "in",
  "reason": "Purchase order received",
  "reference": "PO-2025-001"
}
```

**Movement Types:**
- `in`: Stock incoming (positive quantity)
- `out`: Stock outgoing (positive quantity, reduces stock)
- `adjustment`: Stock correction (can be positive or negative)

#### `GET /api/inventory/movements/:id`

Get movement details.

### Stock Alerts

#### `GET /api/inventory/low-stock`

Get items below minimum stock level.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "sku": "SKU-12345",
      "quantity": 30,
      "minStock": 50,
      "deficit": 20,
      "status": "low_stock"
    }
  ]
}
```

#### `GET /api/inventory/out-of-stock`

Get items that are completely out of stock.

### Categories

#### `GET /api/inventory/categories`

List all inventory categories with item counts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "electronics",
      "itemCount": 45,
      "totalQuantity": 2500
    }
  ]
}
```

### Statistics

#### `GET /api/inventory/statistics`

Get inventory statistics and metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalItems": 250,
    "totalQuantity": 15000,
    "totalValue": 450000.00,
    "lowStockItems": 12,
    "outOfStockItems": 3,
    "categories": 15,
    "averageStockValue": 1800.00,
    "movementsToday": 45,
    "movementsThisMonth": 1234
  }
}
```

## Database Schema

### `inventory_items`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `sku` (TEXT UNIQUE NOT NULL)
- `description` (TEXT)
- `category` (TEXT)
- `quantity` (INTEGER DEFAULT 0)
- `unit` (TEXT DEFAULT 'pcs')
- `min_stock` (INTEGER DEFAULT 10)
- `max_stock` (INTEGER)
- `price` (REAL)
- `location` (TEXT)
- `status` (TEXT GENERATED)
- `created_at` (TEXT)
- `updated_at` (TEXT)

### `inventory_movements`
- `id` (TEXT PRIMARY KEY)
- `item_id` (TEXT FOREIGN KEY)
- `quantity` (INTEGER NOT NULL)
- `type` (TEXT CHECK: in, out, adjustment)
- `reason` (TEXT)
- `reference` (TEXT)
- `previous_quantity` (INTEGER)
- `new_quantity` (INTEGER)
- `created_at` (TEXT)
- `created_by` (TEXT)

## Stock Status Calculation

Items automatically receive a status based on current quantity:
- **out_of_stock**: quantity = 0
- **low_stock**: quantity > 0 AND quantity < minStock
- **in_stock**: quantity >= minStock

## Business Rules

1. **Stock Movements**:
   - "in" movements increase stock
   - "out" movements decrease stock
   - "adjustment" movements can increase or decrease
   - All movements are logged with previous and new quantities

2. **SKU Uniqueness**: Each item must have a unique SKU

3. **Minimum Stock**: When quantity falls below minStock, item appears in low-stock alerts

4. **Negative Stock**: Not allowed - validation prevents quantity from going below zero

5. **Price Updates**: Price changes don't affect existing orders (historical pricing)

## Integration Points

- **Procurement Module**: Purchase orders update stock levels
- **Sales Module**: Sales orders reduce stock levels
- **Production Module**: Material consumption and production output
- **Finance Module**: Inventory valuation for accounting
- **Warehouse Module**: Multi-location stock management

## Error Handling

The module uses standardized error handling:
- `ValidationError`: Invalid input data (400)
- `NotFoundError`: Item not found (404)
- `BadRequestError`: Invalid operation (e.g., insufficient stock) (400)
- `ConflictError`: SKU already exists (409)

All responses follow the standard format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": []
  }
}
```

## Future Enhancements

- [ ] Barcode scanning support
- [ ] Batch and serial number tracking
- [ ] Expiration date management (for perishables)
- [ ] Multi-warehouse stock transfer
- [ ] Inventory forecasting
- [ ] Automatic reorder points
- [ ] Integration with suppliers for automatic ordering
- [ ] Stock valuation methods (FIFO, LIFO, Weighted Average)
- [ ] Physical inventory count reconciliation
- [ ] Inventory reservations for pending orders

## Related Documentation

- [API Documentation](../../../../docs/modules/inventory/README.md)
- [Database Schema](../../../../docs/reference/database-schema.md)
- [Error Handling Guide](../../../../docs/ERROR_STANDARDIZATION_GUIDE.md)
- [Procurement Module](../procurement/README.md)
- [Warehouse Module](../warehouse/README.md)

## Version History

- **v0.3.0** (2025-12-19): Initial inventory management implementation
