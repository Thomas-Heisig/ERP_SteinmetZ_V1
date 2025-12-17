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

// In-memory storage
const items = new Map<string, any>();
const movements = new Map<string, any>();
let itemCounter = 0;
let movementCounter = 0;

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
    let results = Array.from(items.values());

    // Apply filters
    if (category) {
      results = results.filter((i) => i.category === category);
    }
    if (status) {
      results = results.filter((i) => {
        if (status === "out_of_stock") return i.quantity === 0;
        if (status === "low_stock")
          return i.quantity > 0 && i.quantity <= i.minStock;
        return i.quantity > i.minStock;
      });
    }
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (i) =>
          i.name?.toLowerCase().includes(searchLower) ||
          i.sku?.toLowerCase().includes(searchLower) ||
          i.description?.toLowerCase().includes(searchLower),
      );
    }

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
    const item = items.get(req.params.id);

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

    const id = `item-${++itemCounter}`;
    const item = {
      id,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    items.set(id, item);

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
    const item = items.get(req.params.id);

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    const validation = updateItemSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError("Invalid item data", validation.error.issues);
    }

    const updated = {
      ...item,
      ...validation.data,
      updatedAt: new Date().toISOString(),
    };

    items.set(req.params.id, updated);

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
    if (!items.has(req.params.id)) {
      throw new NotFoundError("Item not found");
    }

    items.delete(req.params.id);

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
    const item = items.get(itemId);

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    // Update item quantity
    if (type === "in") {
      item.quantity += quantity;
    } else if (type === "out") {
      if (item.quantity < quantity) {
        throw new BadRequestError("Insufficient stock");
      }
      item.quantity -= quantity;
    } else {
      // adjustment
      item.quantity = quantity;
    }

    item.updatedAt = new Date().toISOString();
    items.set(itemId, item);

    // Record movement
    const movementId = `mov-${++movementCounter}`;
    const movement = {
      id: movementId,
      ...validation.data,
      timestamp: new Date().toISOString(),
    };

    movements.set(movementId, movement);

    res.status(201).json({
      success: true,
      data: movement,
      updatedItem: item,
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
    const results = Array.from(movements.values());

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
    const allItems = Array.from(items.values());
    const stats = {
      totalItems: items.size,
      inStock: allItems.filter((i) => i.quantity > i.minStock).length,
      lowStock: allItems.filter(
        (i) => i.quantity > 0 && i.quantity <= i.minStock,
      ).length,
      outOfStock: allItems.filter((i) => i.quantity === 0).length,
      totalValue: allItems.reduce(
        (sum, i) => sum + (i.price || 0) * i.quantity,
        0,
      ),
      totalMovements: movements.size,
    };

    res.json({
      success: true,
      data: stats,
    });
  }),
);

export default router;
