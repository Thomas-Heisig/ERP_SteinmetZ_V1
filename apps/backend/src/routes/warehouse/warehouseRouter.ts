// SPDX-License-Identifier: MIT
// apps/backend/src/routes/warehouse/warehouseRouter.ts

/**
 * @module WarehouseRouter
 * @description Warehouse Management API - Stock, Picking, Shipments, Inventory
 */

import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { WarehouseService } from '../../service/WarehouseService.js';
import { DatabaseService } from '../../service/DatabaseService.js';
import { BadRequestError, NotFoundError } from '../../types/errors.js';
import {
  CreateStockMovementSchema,
  CreateLocationSchema,
  CreatePickingListSchema,
  CompletePickingSchema,
  CreateShipmentSchema,
  CreateInventoryCountSchema,
  WarehouseFiltersSchema,
} from '../../types/warehouse.js';
import { createLogger } from '../../utils/logger.js';
import { z } from 'zod';

const router = Router();
const logger = createLogger('WarehouseRouter');

type WarehouseRequest = Request & {
  warehouseService: WarehouseService;
  user?: { id?: string };
};

/**
 * Async error handler wrapper for Express routes
 */
const asyncHandler =
  (
    fn: (req: WarehouseRequest, res: Response, next: NextFunction) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as WarehouseRequest, res, next)).catch(next);
  };

// ═════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Initialize WarehouseService for route handlers
 */
router.use((req, _res, next) => {
  const db = new DatabaseService({
    driver: 'sqlite',
    sqliteFile: './data/dev.sqlite3',
  });
  (req as WarehouseRequest).warehouseService = new WarehouseService(db);
  next();
});

// ═════════════════════════════════════════════════════════════════════════════
// STOCK MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/warehouse/stock
 * Get all stock items with optional filtering
 * @query category - Filter by category
 * @query status - Filter by status (low, ok, overstock)
 * @query location_id - Filter by location
 * @query limit - Result limit (default: 50, max: 1000)
 * @query offset - Result offset (default: 0)
 * @returns Array of stock items
 */
router.get(
  '/stock',
  asyncHandler(async (req, res) => {
    const filters = WarehouseFiltersSchema.parse(req.query);
    const items = await req.warehouseService.getStockItems(filters);

    res.json({
      success: true,
      data: items,
      count: items.length,
    });
  })
);

/**
 * GET /api/warehouse/stock/:id
 * Get a single stock item by ID
 * @param id - Stock item ID
 * @returns Stock item object with movement history
 */
router.get(
  '/stock/:id',
  asyncHandler(async (req, res) => {
    if (!req.params.id) {
      throw new BadRequestError('Stock item ID is required');
    }

    const item = await req.warehouseService.getStockItemById(req.params.id);

    res.json({
      success: true,
      data: item,
    });
  })
);

/**
 * POST /api/warehouse/stock/movement
 * Record a stock movement (incoming, outgoing, transfer, adjustment)
 * @body CreateStockMovement - Movement data
 * @returns Recorded movement
 */
router.post(
  '/stock/movement',
  asyncHandler(async (req, res) => {
    const validatedData = CreateStockMovementSchema.parse(req.body);
    const userId = req.user?.id || 'system'; // From auth middleware

    const movement = await req.warehouseService.recordStockMovement(
      validatedData,
      userId
    );

    logger.info(
      { movementId: movement.id, type: movement.type },
      'Stock movement recorded via API'
    );

    res.status(201).json({
      success: true,
      data: movement,
    });
  })
);

// ═════════════════════════════════════════════════════════════════════════════
// WAREHOUSE LOCATIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/warehouse/locations
 * Get all warehouse locations
 * @returns Array of warehouse locations
 */
router.get(
  '/locations',
  asyncHandler(async (req, res) => {
    const locations = await req.warehouseService.getWarehouseLocations();

    res.json({
      success: true,
      data: locations,
      count: locations.length,
    });
  })
);

/**
 * POST /api/warehouse/locations
 * Create a new warehouse location
 * @body CreateLocation - Location data
 * @returns Created location
 */
router.post(
  '/locations',
  asyncHandler(async (req, res) => {
    const validatedData = CreateLocationSchema.parse(req.body);

    const location = await req.warehouseService.createWarehouseLocation(
      validatedData
    );

    logger.info({ locationId: location.id }, 'Warehouse location created via API');

    res.status(201).json({
      success: true,
      data: location,
    });
  })
);

// ═════════════════════════════════════════════════════════════════════════════
// PICKING LISTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/warehouse/picking
 * Get all picking lists with optional status filter
 * @query status - Filter by status (open, in_progress, completed, cancelled)
 * @returns Array of picking lists
 */
router.get(
  '/picking',
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const lists = await req.warehouseService.getPickingLists(status);

    res.json({
      success: true,
      data: lists,
      count: lists.length,
    });
  })
);

/**
 * GET /api/warehouse/picking/:id
 * Get a single picking list with items
 * @param id - Picking list ID
 * @returns Picking list with items
 */
router.get(
  '/picking/:id',
  asyncHandler(async (req, res) => {
    if (!req.params.id) {
      throw new BadRequestError('Picking list ID is required');
    }

    const list = await req.warehouseService.getPickingListById(req.params.id);

    res.json({
      success: true,
      data: list,
    });
  })
);

/**
 * POST /api/warehouse/picking
 * Create a new picking list
 * @body CreatePickingList - Picking list data with items
 * @returns Created picking list
 */
router.post(
  '/picking',
  asyncHandler(async (req, res) => {
    const validatedData = CreatePickingListSchema.parse(req.body);
    const userId = req.user?.id || 'system';

    const list = await req.warehouseService.createPickingList(
      validatedData,
      userId
    );

    logger.info(
      { pickingListId: list.id, orderId: list.order_id },
      'Picking list created via API'
    );

    res.status(201).json({
      success: true,
      data: list,
    });
  })
);

/**
 * POST /api/warehouse/picking/:id/assign
 * Assign a picker to a picking list
 * @param id - Picking list ID
 * @body picker_id - Picker user ID
 */
router.post(
  '/picking/:id/assign',
  asyncHandler(async (req, res) => {
    if (!req.params.id) {
      throw new BadRequestError('Picking list ID is required');
    }

    if (!req.body.picker_id) {
      throw new BadRequestError('Picker ID is required');
    }

    await req.warehouseService.assignPicker(req.params.id, req.body.picker_id);

    logger.info(
      { pickingListId: req.params.id, pickerId: req.body.picker_id },
      'Picker assigned via API'
    );

    res.json({
      success: true,
      message: 'Picker assigned successfully',
    });
  })
);

/**
 * POST /api/warehouse/picking/:id/complete
 * Complete a picking list
 * @param id - Picking list ID
 * @body items - Array of picked items
 */
router.post(
  '/picking/:id/complete',
  asyncHandler(async (req, res) => {
    if (!req.params.id) {
      throw new BadRequestError('Picking list ID is required');
    }

    const validatedData = CompletePickingSchema.parse(req.body);

    await req.warehouseService.completePicking(req.params.id, validatedData);

    logger.info(
      { pickingListId: req.params.id },
      'Picking completed via API'
    );

    res.json({
      success: true,
      message: 'Picking completed successfully',
    });
  })
);

// ═════════════════════════════════════════════════════════════════════════════
// SHIPMENTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/warehouse/shipments
 * Get all shipments with optional status filter
 * @query status - Filter by status
 * @returns Array of shipments
 */
router.get(
  '/shipments',
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const shipments = await req.warehouseService.getShipments(status);

    res.json({
      success: true,
      data: shipments,
      count: shipments.length,
    });
  })
);

/**
 * POST /api/warehouse/shipments
 * Create a new shipment
 * @body CreateShipment - Shipment data
 * @returns Created shipment
 */
router.post(
  '/shipments',
  asyncHandler(async (req, res) => {
    const validatedData = CreateShipmentSchema.parse(req.body);

    const shipment = await req.warehouseService.createShipment(validatedData);

    logger.info(
      { shipmentId: shipment.id, orderId: shipment.order_id },
      'Shipment created via API'
    );

    res.status(201).json({
      success: true,
      data: shipment,
    });
  })
);

/**
 * GET /api/warehouse/shipments/:id/tracking
 * Get shipment tracking information
 * @param id - Shipment ID
 * @returns Shipment with tracking events
 */
router.get(
  '/shipments/:id/tracking',
  asyncHandler(async (req, res) => {
    if (!req.params.id) {
      throw new BadRequestError('Shipment ID is required');
    }

    const tracking = await req.warehouseService.getShipmentTracking(
      req.params.id
    );

    res.json({
      success: true,
      data: tracking,
    });
  })
);

// ═════════════════════════════════════════════════════════════════════════════
// INVENTORY COUNT
// ═════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/warehouse/inventory-count
 * Create a new inventory count
 * @body CreateInventoryCount - Inventory count data
 * @returns Created inventory count
 */
router.post(
  '/inventory-count',
  asyncHandler(async (req, res) => {
    const validatedData = CreateInventoryCountSchema.parse(req.body);
    const userId = req.user?.id || 'system';

    const count = await req.warehouseService.createInventoryCount(
      validatedData,
      userId
    );

    logger.info(
      { countId: count.id, type: count.type },
      'Inventory count created via API'
    );

    res.status(201).json({
      success: true,
      data: count,
    });
  })
);

// ═════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/warehouse/analytics
 * Get warehouse analytics and KPIs
 * @returns Warehouse analytics data
 */
router.get(
  '/analytics',
  asyncHandler(async (req, res) => {
    const analytics = await req.warehouseService.getAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  })
);

// ═════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Global error handler for validation errors
 */
router.use(
  (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (err instanceof z.ZodError) {
      const details = err.issues.reduce<Record<string, string>>(
        (acc, issue) => {
          const path = issue.path.join('.');
          acc[path] = issue.message;
          return acc;
        },
        {}
      );

      logger.warn({ errors: details }, 'Validation error');

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    }

    if (err instanceof BadRequestError || err instanceof NotFoundError) {
      logger.warn({ error: err.message }, 'Request error');

      return res.status(err.statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      });
    }

    // Unexpected error
    logger.error({ error: err }, 'Unexpected error');

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
);

export default router;
