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
  NotFoundError,
  ValidationError,
} from "../../types/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import pino from "pino";
import db from "../../services/dbService.js";
import { randomUUID } from "crypto";

const router = Router();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

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

const updateItemSchema = createItemSchema.partial();

const stockMovementSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int(),
  type: z.enum(["in", "out", "adjustment"]),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

/**
 * GET /api/inventory/items
 * List all inventory items
 */
router.get(
  "/items",
  asyncHandler(async (req: Request, res: Response) => {
    const query = itemQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new ValidationError("Invalid query parameters", query.error.issues);
    }

    const { category, status, search } = query.data;

    let sql = "SELECT * FROM inventory_items WHERE 1=1";
    const params: any[] = [];

    // Apply filters
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (status) {
      if (status === "out_of_stock") {
        sql += " AND quantity = 0";
      } else if (status === "low_stock") {
        sql += " AND quantity > 0 AND quantity <= min_stock";
      } else {
        sql += " AND quantity > min_stock";
      }
    }
    if (search) {
      sql += " AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += " ORDER BY created_at DESC";

    const results = await db.all(sql, params);

    res.json({
      success: true,
      data: results,
      count: results.length,
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
    const item = await db.get("SELECT * FROM inventory_items WHERE id = ?", [
      req.params.id,
    ]);

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    res.json({
      success: true,
      data: item,
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
      throw new ValidationError("Invalid item data", validation.error.issues);
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

    const item = await db.get("SELECT * FROM inventory_items WHERE id = ?", [
      id,
    ]);

    res.status(201).json({
      success: true,
      data: item,
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
    const existing = await db.get(
      "SELECT * FROM inventory_items WHERE id = ?",
      [req.params.id],
    );

    if (!existing) {
      throw new NotFoundError("Item not found");
    }

    const validation = updateItemSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid item data", validation.error.issues);
    }

    const now = new Date().toISOString();
    const updates = validation.data;

    // Build dynamic UPDATE query
    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.json({ success: true, data: existing });
    }

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = [
      ...fields.map((f) => (updates as any)[f]),
      now,
      req.params.id,
    ];

    await db.run(
      `UPDATE inventory_items SET ${setClause}, updated_at = ? WHERE id = ?`,
      values,
    );

    const updated = await db.get("SELECT * FROM inventory_items WHERE id = ?", [
      req.params.id,
    ]);

    res.json({
      success: true,
      data: updated,
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
    const existing = await db.get(
      "SELECT * FROM inventory_items WHERE id = ?",
      [req.params.id],
    );

    if (!existing) {
      throw new NotFoundError("Item not found");
    }

    await db.run("DELETE FROM inventory_items WHERE id = ?", [req.params.id]);

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
      throw new ValidationError(
        "Invalid movement data",
        validation.error.issues,
      );
    }

    const { itemId, quantity, type } = validation.data;
    const item = await db.get<any>(
      "SELECT * FROM inventory_items WHERE id = ?",
      [itemId],
    );

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    // Calculate new quantity
    let newQuantity = item.quantity;
    if (type === "in") {
      newQuantity += quantity;
    } else if (type === "out") {
      if (item.quantity < quantity) {
        throw new BadRequestError("Insufficient stock");
      }
      newQuantity -= quantity;
    } else {
      // adjustment
      newQuantity = quantity;
    }

    const now = new Date().toISOString();

    // Update item quantity
    await db.run(
      "UPDATE inventory_items SET quantity = ?, updated_at = ? WHERE id = ?",
      [newQuantity, now, itemId],
    );

    // Record movement
    const movementId = `mov-${randomUUID()}`;
    await db.run(
      `INSERT INTO inventory_movements (id, item_id, quantity, type, reason, reference, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        movementId,
        itemId,
        quantity,
        type,
        req.body.reason || null,
        req.body.reference || null,
        now,
      ],
    );

    const movement = await db.get(
      "SELECT * FROM inventory_movements WHERE id = ?",
      [movementId],
    );
    const updatedItem = await db.get(
      "SELECT * FROM inventory_items WHERE id = ?",
      [itemId],
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
    const results = await db.all(
      "SELECT * FROM inventory_movements ORDER BY timestamp DESC",
    );

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  }),
);

/**
 * GET /api/inventory/stats
 * Get inventory statistics
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const totalItems = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM inventory_items",
    );
    const inStock = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM inventory_items WHERE quantity > min_stock",
    );
    const lowStock = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM inventory_items WHERE quantity > 0 AND quantity <= min_stock",
    );
    const outOfStock = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM inventory_items WHERE quantity = 0",
    );
    const totalValue = await db.get<{ value: number }>(
      "SELECT SUM(price * quantity) as value FROM inventory_items WHERE price IS NOT NULL",
    );
    const totalMovements = await db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM inventory_movements",
    );

    const stats = {
      totalItems: totalItems?.count || 0,
      inStock: inStock?.count || 0,
      lowStock: lowStock?.count || 0,
      outOfStock: outOfStock?.count || 0,
      totalValue: totalValue?.value || 0,
      totalMovements: totalMovements?.count || 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

export default router;
