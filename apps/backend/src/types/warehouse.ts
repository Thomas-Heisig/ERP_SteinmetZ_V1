// SPDX-License-Identifier: MIT
// apps/backend/src/types/warehouse.ts

import { z } from "zod";

/**
 * Warehouse Item Status
 */
export enum StockStatus {
  LOW = "low",
  OK = "ok",
  OVERSTOCK = "overstock",
  RESERVED = "reserved",
}

/**
 * Movement Type for Stock Adjustments
 */
export enum MovementType {
  INCOMING = "incoming",
  OUTGOING = "outgoing",
  TRANSFER = "transfer",
  ADJUSTMENT = "adjustment",
}

/**
 * Picking Status
 */
export enum PickingStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

/**
 * Shipment Status
 */
export enum ShipmentStatus {
  PREPARED = "prepared",
  READY_FOR_SHIPMENT = "ready_for_shipment",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

/**
 * Inventory Count Type
 */
export enum InventoryCountType {
  FULL = "full",
  SPOT_CHECK = "spot_check",
  CYCLE = "cycle",
}

/**
 * Inventory Count Status
 */
export enum InventoryCountStatus {
  PLANNED = "planned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

/**
 * Stock Item Schema
 */
export const StockItemSchema = z.object({
  id: z.string().uuid(),
  material_id: z.string(),
  material_name: z.string(),
  category: z.string(),
  quantity: z.number().min(0),
  unit: z.string(),
  location_id: z.string(),
  min_stock: z.number().min(0),
  reorder_point: z.number().min(0),
  unit_cost: z.number().positive(),
  status: z.nativeEnum(StockStatus),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type StockItem = z.infer<typeof StockItemSchema>;

/**
 * Stock Movement Schema
 */
export const StockMovementSchema = z.object({
  id: z.string().uuid(),
  material_id: z.string(),
  type: z.nativeEnum(MovementType),
  quantity: z.number(),
  from_location_id: z.string().optional(),
  to_location_id: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  created_by: z.string(),
  created_at: z.string().datetime(),
});

export type StockMovement = z.infer<typeof StockMovementSchema>;

/**
 * Warehouse Location Schema
 */
export const WarehouseLocationSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  zone: z.string(),
  aisle: z.string().optional(),
  position: z.string().optional(),
  capacity: z.number().positive(),
  occupied: z.number().min(0),
  type: z.string(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type WarehouseLocation = z.infer<typeof WarehouseLocationSchema>;

/**
 * Picking List Schema
 */
export const PickingListSchema = z.object({
  id: z.string().uuid(),
  picking_number: z.string(),
  order_id: z.string(),
  status: z.nativeEnum(PickingStatus),
  priority: z.enum(["low", "normal", "high"]),
  picker_id: z.string().optional(),
  items_count: z.number().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
});

export type PickingList = z.infer<typeof PickingListSchema>;

/**
 * Picking Item Schema
 */
export const PickingItemSchema = z.object({
  id: z.string().uuid(),
  picking_list_id: z.string(),
  material_id: z.string(),
  material_name: z.string(),
  quantity_required: z.number().positive(),
  quantity_picked: z.number().min(0),
  unit: z.string(),
  location_id: z.string(),
  is_picked: z.boolean(),
  notes: z.string().optional(),
});

export type PickingItem = z.infer<typeof PickingItemSchema>;

/**
 * Shipment Schema
 */
export const ShipmentSchema = z.object({
  id: z.string().uuid(),
  shipment_number: z.string(),
  order_id: z.string(),
  status: z.nativeEnum(ShipmentStatus),
  carrier: z.string(),
  tracking_number: z.string().optional(),
  service_level: z.string().optional(),
  weight_kg: z.number().positive(),
  dimension_l_cm: z.number().positive(),
  dimension_w_cm: z.number().positive(),
  dimension_h_cm: z.number().positive(),
  shipped_date: z.string().datetime().optional(),
  estimated_delivery: z.string().datetime().optional(),
  delivered_date: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Shipment = z.infer<typeof ShipmentSchema>;

/**
 * Inventory Count Schema
 */
export const InventoryCountSchema = z.object({
  id: z.string().uuid(),
  count_number: z.string(),
  type: z.nativeEnum(InventoryCountType),
  status: z.nativeEnum(InventoryCountStatus),
  location_ids: z.array(z.string()),
  scheduled_date: z.string().date(),
  started_date: z.string().datetime().optional(),
  completed_date: z.string().datetime().optional(),
  discrepancies: z.number().min(0).optional(),
  created_by: z.string(),
  created_at: z.string().datetime(),
});

export type InventoryCount = z.infer<typeof InventoryCountSchema>;

/**
 * Input Schema: Stock Movement Request
 */
export const CreateStockMovementSchema = z
  .object({
    material_id: z.string().min(1, "Material-ID erforderlich"),
    type: z.nativeEnum(MovementType),
    quantity: z.number().positive("Menge muss positiv sein"),
    from_location_id: z.string().optional(),
    to_location_id: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === MovementType.TRANSFER) {
        return data.from_location_id && data.to_location_id;
      }
      return true;
    },
    { message: "Für Transfers sind Quell- und Zielort erforderlich" },
  );

export type CreateStockMovement = z.infer<typeof CreateStockMovementSchema>;

/**
 * Input Schema: Location Create
 */
export const CreateLocationSchema = z.object({
  code: z.string().min(1),
  zone: z.string().min(1),
  aisle: z.string().optional(),
  position: z.string().optional(),
  capacity: z.number().positive(),
  type: z.string().min(1),
});

export type CreateLocation = z.infer<typeof CreateLocationSchema>;

/**
 * Input Schema: Picking List Create
 */
export const CreatePickingListSchema = z.object({
  order_id: z.string().min(1),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  items: z
    .array(
      z.object({
        material_id: z.string(),
        quantity: z.number().positive(),
        location_id: z.string(),
      }),
    )
    .min(1),
});

export type CreatePickingList = z.infer<typeof CreatePickingListSchema>;

/**
 * Input Schema: Complete Picking
 */
export const CompletePickingSchema = z.object({
  items: z
    .array(
      z.object({
        picking_item_id: z.string(),
        quantity_picked: z.number().min(0),
        notes: z.string().optional(),
      }),
    )
    .min(1),
});

export type CompletePicking = z.infer<typeof CompletePickingSchema>;

/**
 * Input Schema: Shipment Create
 */
export const CreateShipmentSchema = z.object({
  order_id: z.string().min(1),
  carrier: z.string().min(1),
  service_level: z.string().optional(),
  packages: z
    .array(
      z.object({
        weight_kg: z.number().positive(),
        length_cm: z.number().positive(),
        width_cm: z.number().positive(),
        height_cm: z.number().positive(),
        description: z.string().optional(),
      }),
    )
    .min(1),
  shipping_address: z.object({
    name: z.string().min(1),
    street: z.string().min(1),
    zip: z.string().min(1),
    city: z.string().min(1),
    country: z.string().default("DE"),
  }),
  notes: z.string().optional(),
});

export type CreateShipment = z.infer<typeof CreateShipmentSchema>;

/**
 * Input Schema: Inventory Count Create
 */
export const CreateInventoryCountSchema = z.object({
  type: z.nativeEnum(InventoryCountType),
  location_ids: z.array(z.string()).min(1),
  scheduled_date: z.string().date(),
  notes: z.string().optional(),
});

export type CreateInventoryCount = z.infer<typeof CreateInventoryCountSchema>;

/**
 * Warehouse Analytics Schema
 */
export const WarehouseAnalyticsSchema = z.object({
  total_items: z.number(),
  total_value: z.number(),
  low_stock_items: z.number(),
  turnover_rate: z.number(),
  fill_rate: z.number(),
  avg_picking_time_minutes: z.number(),
  pending_shipments: z.number(),
  on_time_delivery_rate: z.number(),
  inventory_accuracy: z.number(),
});

export type WarehouseAnalytics = z.infer<typeof WarehouseAnalyticsSchema>;

/**
 * Query Filters Schema
 */
export const WarehouseFiltersSchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  location_id: z.string().optional(),
  limit: z.number().min(1).max(1000).default(50),
  offset: z.number().min(0).default(0),
});

export type WarehouseFilters = z.infer<typeof WarehouseFiltersSchema>;
