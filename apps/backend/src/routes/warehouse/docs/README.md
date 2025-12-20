# Warehouse Module

Backend routes for warehouse management (stock, locations, picking, shipments, inventory counts, analytics). All handlers live in `apps/backend/src/routes/warehouse/warehouseRouter.ts` and use `WarehouseService` with SQLite by default.

## Features

- Stock queries and movements (incoming/outgoing/transfer/adjustment)
- Location create/list
- Picking lists (create, assign picker, complete)
- Shipments (create, list, tracking)
- Inventory counts (create)
- Analytics KPIs

## REST Endpoints

### Stock

- `GET /api/warehouse/stock` – list stock with optional filters (`category`, `status`, `location_id`, `limit`, `offset`).
- `GET /api/warehouse/stock/:id` – get single stock item.
- `POST /api/warehouse/stock/movement` – record stock movement (validated via Zod schema).

### Locations

- `GET /api/warehouse/locations` – list locations.
- `POST /api/warehouse/locations` – create location.

### Picking

- `GET /api/warehouse/picking` – list picking lists, optional `status`.
- `GET /api/warehouse/picking/:id` – get picking list with items.
- `POST /api/warehouse/picking` – create picking list.
- `POST /api/warehouse/picking/:id/assign` – assign picker.
- `POST /api/warehouse/picking/:id/complete` – complete picking.

### Shipments

- `GET /api/warehouse/shipments` – list shipments, optional `status`.
- `POST /api/warehouse/shipments` – create shipment.
- `GET /api/warehouse/shipments/:id/tracking` – tracking events for a shipment.

### Inventory Count

- `POST /api/warehouse/inventory-count` – create inventory count job.

### Analytics

- `GET /api/warehouse/analytics` – aggregated KPIs (items, value, low stock, pending shipments, etc.).

## Error Handling

- Validation: Zod errors return `400` with `details` per field.
- Known domain errors (BadRequestError, NotFoundError) return their status and code.
- Others return `500 INTERNAL_SERVER_ERROR`.

## Notes

- Requests expect JSON bodies; add auth middleware upstream if user context is required (`req.user?.id`).
- Default DB: `./data/dev.sqlite3` (configured in router middleware). Adjust if running in other environments.
