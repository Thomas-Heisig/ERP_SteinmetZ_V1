// SPDX-License-Identifier: MIT
// apps/backend/src/routes/inventory/inventoryRouter.ts

/**
 * Inventory Management Router
 *
 * Provides API for inventory tracking, stock management,
 * warehouse operations, and product catalog.
 *
 * @module routes/inventory
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../error/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { createLogger } from "../../utils/logger.js";
import db from "../database/dbService.js";
import { randomUUID } from "crypto";

type InventoryItemRow = {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  category?: string | null;
  quantity: number;
  unit: string;
  min_stock: number;
  max_stock?: number | null;
  price?: number | null;
  location?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type InventoryMovementRow = {
  id: string;
  item_id: string;
  quantity: number;
  type: "in" | "out" | "adjustment" | "transfer" | "return";
  reason?: string | null;
  reference?: string | null;
  reference_type?: string | null;
  from_location?: string | null;
  to_location?: string | null;
  user_id?: string | null;
  notes?: string | null;
  timestamp: string;
};

const router = Router();
const logger = createLogger("inventory-router");
const STOCK_STATUS_SQL =
  "CASE WHEN quantity = 0 THEN 'out_of_stock' WHEN quantity < min_stock THEN 'low_stock' ELSE 'in_stock' END";

// Validation schemas
const itemQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(["in_stock", "low_stock", "out_of_stock"]).optional(),
  search: z.string().optional(),
});

const createItemSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(50),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  unit: z.string().default("pcs"),
  minStock: z.number().int().min(0).default(10),
  maxStock: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
  location: z.string().optional(),
});

const updateItemSchema = createItemSchema
  .omit({ quantity: true })
  .partial()
  .refine((val) => Object.keys(val).length > 0, { message: "No fields to update" });

const stockMovementSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int(),
  type: z.enum(["in", "out", "adjustment"]),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

const movementQuerySchema = z.object({
  itemId: z.string().optional(),
  type: z.enum(["in", "out", "adjustment", "transfer", "return"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const toStockStatus = (quantity: number, minStock: number) => {
  if (quantity === 0) return "out_of_stock" as const;
  if (quantity < minStock) return "low_stock" as const;
  return "in_stock" as const;
};

const mapItemRow = (row: InventoryItemRow & { stock_status?: string }) => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  description: row.description ?? undefined,
  category: row.category ?? undefined,
  quantity: row.quantity,
  unit: row.unit,
  minStock: row.min_stock,
  maxStock: row.max_stock ?? undefined,
  price: row.price ?? undefined,
  location: row.location ?? undefined,
  status: row.stock_status ?? toStockStatus(row.quantity, row.min_stock),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const mapMovementRow = (
  row: InventoryMovementRow & {
    item_name?: string;
    previous_quantity?: number;
    new_quantity?: number;
  },
) => ({
  id: row.id,
  itemId: row.item_id,
  itemName: row.item_name ?? undefined,
  quantity: row.quantity,
  type: row.type,
  reason: row.reason ?? undefined,
  reference: row.reference ?? undefined,
  timestamp: row.timestamp,
  previousQuantity: row.previous_quantity ?? undefined,
  newQuantity: row.new_quantity ?? undefined,
});

const fetchStatistics = async () => {
  const totalItems = await db.get<{ count: number }>(
    "SELECT COUNT(*) as count FROM inventory_items",
  );
  const totalQuantity = await db.get<{ total: number | null }>(
    "SELECT SUM(quantity) as total FROM inventory_items",
  );
  const lowStock = await db.get<{ count: number }>(
    "SELECT COUNT(*) as count FROM inventory_items WHERE quantity > 0 AND quantity < min_stock",
  );
  const outOfStock = await db.get<{ count: number }>(
    "SELECT COUNT(*) as count FROM inventory_items WHERE quantity = 0",
  );
  const totalValue = await db.get<{ value: number | null }>(
    "SELECT SUM(price * quantity) as value FROM inventory_items WHERE price IS NOT NULL",
  );
  const distinctCategories = await db.get<{ count: number }>(
    "SELECT COUNT(DISTINCT category) as count FROM inventory_items WHERE category IS NOT NULL",
  );
  const movementsToday = await db.get<{ count: number }>(
    "SELECT COUNT(*) as count FROM inventory_movements WHERE date(timestamp) = date('now')",
  );
  const movementsThisMonth = await db.get<{ count: number }>(
    "SELECT COUNT(*) as count FROM inventory_movements WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now')",
  );

  return {
    totalItems: totalItems?.count ?? 0,
    totalQuantity: totalQuantity?.total ?? 0,
    totalValue: totalValue?.value ?? 0,
    lowStockItems: lowStock?.count ?? 0,
    outOfStockItems: outOfStock?.count ?? 0,
    categories: distinctCategories?.count ?? 0,
    averageStockValue:
      (totalItems?.count ?? 0) > 0
        ? (totalValue?.value ?? 0) / (totalItems?.count ?? 1)
        : 0,
    movementsToday: movementsToday?.count ?? 0,
    movementsThisMonth: movementsThisMonth?.count ?? 0,
  };
};

/**
 * GET /api/inventory/items
 * List all inventory items
 */
router.get(
  "/items",
  asyncHandler(async (req: Request, res: Response) => {
    const query = itemQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new ValidationError("Invalid query parameters", { issues: query.error.issues });
    }

    const { category, status, search } = query.data;

    let sql = `SELECT *, ${STOCK_STATUS_SQL} AS stock_status FROM inventory_items WHERE 1=1`;
    const params: string[] = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }

    if (status) {
      sql += ` AND (${STOCK_STATUS_SQL}) = ?`;
      params.push(status);
    }

    if (search) {
      sql += " AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += " ORDER BY created_at DESC";

    const results = await db.all<InventoryItemRow & { stock_status: string }>(
      sql,
      params,
    );
    const data = results.map(mapItemRow);

    res.json({
      success: true,
      data,
      count: data.length,
    });
  }),
);

/**
 * GET /api/inventory/items/:id
 * Get a specific inventory item
 */
router.get(
  "/items/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const item = await db.get<InventoryItemRow & { stock_status: string }>(
      `SELECT *, ${STOCK_STATUS_SQL} AS stock_status FROM inventory_items WHERE id = ?`,
      [req.params.id],
    );

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    res.json({
      success: true,
      data: mapItemRow(item),
    });
  }),
);

/**
 * POST /api/inventory/items
 * Create a new inventory item
 */
router.post(
  "/items",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = createItemSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid item data", { issues: validation.error.issues });
    }

    const skuExists = await db.get<{ id: string }>(
      "SELECT id FROM inventory_items WHERE sku = ?",
      [validation.data.sku],
    );

    if (skuExists) {
      throw new ConflictError("SKU already exists");
    }

    const id = `item-${randomUUID()}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO inventory_items (id, sku, name, description, category, quantity, unit, min_stock, max_stock, price, location, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validation.data.sku,
        validation.data.name,
        validation.data.description || null,
        validation.data.category || null,
        validation.data.quantity,
        validation.data.unit,
        validation.data.minStock,
        validation.data.maxStock || null,
        validation.data.price || null,
        validation.data.location || null,
        "active",
        now,
        now,
      ],
    );

    const item = await db.get<InventoryItemRow & { stock_status: string }>(
      `SELECT *, ${STOCK_STATUS_SQL} AS stock_status FROM inventory_items WHERE id = ?`,
      [id],
    );

    if (!item) {
      throw new NotFoundError("Item creation verification failed");
    }

    logger.info({ itemId: id, sku: validation.data.sku }, "Created inventory item");

    res.status(201).json({
      success: true,
      data: mapItemRow(item),
    });
  }),
);

/**
 * PUT /api/inventory/items/:id
 * Update an inventory item
 */
router.put(
  "/items/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await db.get<InventoryItemRow>(
      "SELECT * FROM inventory_items WHERE id = ?",
      [req.params.id],
    );

    if (!existing) {
      throw new NotFoundError("Item not found");
    }

    const validation = updateItemSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid item data", { issues: validation.error.issues });
    }

    const updates = validation.data;
    const now = new Date().toISOString();

    const columnMap: Record<string, string> = {
      name: "name",
      sku: "sku",
      description: "description",
      category: "category",
      unit: "unit",
      minStock: "min_stock",
      maxStock: "max_stock",
      price: "price",
      location: "location",
    };

    const setParts: string[] = [];
    const values: Array<string | number | null> = [];

    Object.entries(updates).forEach(([key, value]) => {
      const column = columnMap[key];
      if (!column) return;
      setParts.push(`${column} = ?`);
      values.push(value === undefined ? null : (value as string | number));
    });

    if (setParts.length === 0) {
      return res.json({ success: true, data: mapItemRow(existing) });
    }

    setParts.push("updated_at = ?");
    values.push(now, req.params.id);

    await db.run(
      `UPDATE inventory_items SET ${setParts.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await db.get<InventoryItemRow & { stock_status: string }>(
      `SELECT *, ${STOCK_STATUS_SQL} AS stock_status FROM inventory_items WHERE id = ?`,
      [req.params.id],
    );

    if (!updated) {
      throw new NotFoundError("Item not found after update");
    }

    logger.info({ itemId: req.params.id }, "Updated inventory item");

    res.json({
      success: true,
      data: mapItemRow(updated),
    });
  }),
);

/**
 * DELETE /api/inventory/items/:id
 * Delete an inventory item
 */
router.delete(
  "/items/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await db.get<InventoryItemRow>(
      "SELECT * FROM inventory_items WHERE id = ?",
      [req.params.id],
    );

    if (!existing) {
      throw new NotFoundError("Item not found");
    }

    const hasMovements = await db.get<{ count: number }>(
      "SELECT COUNT(1) as count FROM inventory_movements WHERE item_id = ?",
      [req.params.id],
    );

    if (hasMovements?.count) {
      throw new ConflictError("Item cannot be deleted because movements exist");
    }

    await db.run("DELETE FROM inventory_items WHERE id = ?", [req.params.id]);

    logger.info({ itemId: req.params.id }, "Deleted inventory item");

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  }),
);

/**
 * POST /api/inventory/movements
 * Record a stock movement
 */
router.post(
  "/movements",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = stockMovementSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid movement data", { issues: validation.error.issues });
    }

    const { itemId, quantity, type, reason, reference } = validation.data;
    const item = await db.get<InventoryItemRow>(
      "SELECT * FROM inventory_items WHERE id = ?",
      [itemId],
    );

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    if (type !== "adjustment" && quantity <= 0) {
      throw new ValidationError("Quantity must be greater than zero for in/out movements");
    }

    const delta = type === "in" ? quantity : type === "out" ? -quantity : quantity;
    const previousQuantity = item.quantity;
    const newQuantity = previousQuantity + delta;

    if (newQuantity < 0) {
      throw new BadRequestError("Insufficient stock");
    }

    const now = new Date().toISOString();

    await db.run(
      "UPDATE inventory_items SET quantity = ?, updated_at = ? WHERE id = ?",
      [newQuantity, now, itemId],
    );

    const movementId = `mov-${randomUUID()}`;
    await db.run(
      `INSERT INTO inventory_movements (id, item_id, quantity, type, reason, reference, timestamp, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        movementId,
        itemId,
        delta,
        type,
        reason ?? null,
        reference ?? null,
        now,
        `previous=${previousQuantity};new=${newQuantity}`,
      ],
    );

    const movement = mapMovementRow({
      id: movementId,
      item_id: itemId,
      quantity: delta,
      type,
      reason: reason ?? null,
      reference: reference ?? null,
      timestamp: now,
      previous_quantity: previousQuantity,
      new_quantity: newQuantity,
    } as InventoryMovementRow & { previous_quantity: number; new_quantity: number });

    const updatedItem = mapItemRow({
      ...item,
      quantity: newQuantity,
      updated_at: now,
      stock_status: toStockStatus(newQuantity, item.min_stock),
    });

    logger.info(
      { itemId, movementId, type, delta, previousQuantity, newQuantity },
      "Recorded inventory movement",
    );

    res.status(201).json({
      success: true,
      data: movement,
      updatedItem,
    });
  }),
);

/**
 * GET /api/inventory/movements
 * List all stock movements
 */
router.get(
  "/movements",
  asyncHandler(async (req: Request, res: Response) => {
    const validation = movementQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError("Invalid movement query", { issues: validation.error.issues });
    }

    const { itemId, type, dateFrom, dateTo } = validation.data;
    let sql =
      "SELECT m.*, i.name AS item_name FROM inventory_movements m LEFT JOIN inventory_items i ON m.item_id = i.id WHERE 1=1";
    const params: string[] = [];

    if (itemId) {
      sql += " AND m.item_id = ?";
      params.push(itemId);
    }

    if (type) {
      sql += " AND m.type = ?";
      params.push(type);
    }

    if (dateFrom) {
      sql += " AND m.timestamp >= ?";
      params.push(dateFrom);
    }

    if (dateTo) {
      sql += " AND m.timestamp <= ?";
      params.push(dateTo);
    }

    sql += " ORDER BY m.timestamp DESC";

    const results = await db.all<InventoryMovementRow & { item_name?: string }>(
      sql,
      params,
    );
    const data = results.map(mapMovementRow);

    res.json({
      success: true,
      data,
      count: data.length,
    });
  }),
);

/**
 * GET /api/inventory/stats
 * Get inventory statistics
 */
router.get(
  "/low-stock",
  asyncHandler(async (_req: Request, res: Response) => {
    const rows = await db.all<InventoryItemRow & { stock_status: string }>(
      `SELECT *, ${STOCK_STATUS_SQL} AS stock_status FROM inventory_items WHERE quantity > 0 AND quantity < min_stock ORDER BY quantity ASC`,
    );
    const data = rows.map(mapItemRow);

    res.json({ success: true, data, count: data.length });
  }),
);

router.get(
  "/out-of-stock",
  asyncHandler(async (_req: Request, res: Response) => {
    const rows = await db.all<InventoryItemRow & { stock_status: string }>(
      `SELECT *, ${STOCK_STATUS_SQL} AS stock_status FROM inventory_items WHERE quantity = 0 ORDER BY updated_at DESC`,
    );
    const data = rows.map(mapItemRow);

    res.json({ success: true, data, count: data.length });
  }),
);

router.get(
  "/categories",
  asyncHandler(async (_req: Request, res: Response) => {
    const categories = await db.all<{
      category: string;
      itemCount: number;
      totalQuantity: number | null;
    }>(
      "SELECT category, COUNT(*) as itemCount, SUM(quantity) as totalQuantity FROM inventory_items WHERE category IS NOT NULL GROUP BY category ORDER BY category",
    );

    res.json({ success: true, data: categories, count: categories.length });
  }),
);

router.get(
  "/statistics",
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await fetchStatistics();
    res.json({ success: true, data: stats });
  }),
);

router.get(
  "/stats",
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await fetchStatistics();
    res.json({ success: true, data: stats });
  }),
);

export default router;
