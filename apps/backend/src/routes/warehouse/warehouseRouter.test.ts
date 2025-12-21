// SPDX-License-Identifier: MIT
// apps/backend/src/routes/warehouse/warehouseRouter.test.ts

/**
 * @description Warehouse Router Test Suite
 * Tests all warehouse management endpoints
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import warehouseRouter from "./warehouseRouter";

describe("Warehouse Router", () => {
  let app: Express;
  let warehouseServiceMock: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock warehouse service
    warehouseServiceMock = {
      getStockItems: vi.fn().mockResolvedValue([
        {
          id: "1",
          material_id: "mat-1",
          material_name: "Schwarzer Granit",
          category: "Rohstoffe",
          quantity: 12,
          unit: "m²",
          location_id: "loc-1",
          min_stock: 20,
          status: "low",
        },
      ]),
      getStockItemById: vi.fn().mockResolvedValue({
        id: "1",
        material_id: "mat-1",
        material_name: "Schwarzer Granit",
        quantity: 12,
      }),
      getWarehouseLocations: vi.fn().mockResolvedValue([
        {
          id: "1",
          code: "A-01",
          zone: "A",
          capacity: 100,
          occupied: 50,
          type: "Rohstoffe",
        },
      ]),
      getPickingLists: vi.fn().mockResolvedValue([
        {
          id: "1",
          picking_number: "PL-2025-001",
          order_id: "OR-001",
          status: "open",
          priority: "high",
        },
      ]),
      getShipments: vi.fn().mockResolvedValue([
        {
          id: "1",
          shipment_number: "SH-2025-001",
          order_id: "OR-001",
          status: "prepared",
          carrier: "DHL",
        },
      ]),
      getAnalytics: vi.fn().mockResolvedValue({
        total_items: 100,
        total_value: 500000,
        low_stock_items: 5,
        turnover_rate: 0.45,
        fill_rate: 0.68,
        inventory_accuracy: 0.98,
      }),
    };

    // Inject mock into middleware
    app.use((req: any, _res, next) => {
      req.warehouseService = warehouseServiceMock;
      next();
    });

    app.use("/api/warehouse", warehouseRouter);
  });

  describe("GET /api/warehouse/stock", () => {
    it("should return stock items successfully", async () => {
      const response = await request(app).get("/api/warehouse/stock");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
      expect(warehouseServiceMock.getStockItems).toHaveBeenCalled();
    });

    it("should filter stock items by category", async () => {
      const response = await request(app)
        .get("/api/warehouse/stock")
        .query({ category: "Rohstoffe" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should handle limit and offset parameters", async () => {
      const response = await request(app)
        .get("/api/warehouse/stock")
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(warehouseServiceMock.getStockItems).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 0 }),
      );
    });
  });

  describe("POST /api/warehouse/stock/movement", () => {
    it("should record a stock movement", async () => {
      warehouseServiceMock.recordStockMovement = vi.fn().mockResolvedValue({
        id: "1",
        material_id: "mat-1",
        type: "incoming",
        quantity: 5,
      });

      const movement = {
        material_id: "mat-1",
        type: "incoming",
        quantity: 5,
      };

      const response = await request(app)
        .post("/api/warehouse/stock/movement")
        .send(movement);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
    });

    it("should reject invalid movement data", async () => {
      const response = await request(app)
        .post("/api/warehouse/stock/movement")
        .send({ material_id: "mat-1" }); // Missing required fields

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/warehouse/locations", () => {
    it("should return warehouse locations", async () => {
      const response = await request(app).get("/api/warehouse/locations");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(warehouseServiceMock.getWarehouseLocations).toHaveBeenCalled();
    });
  });

  describe("POST /api/warehouse/locations", () => {
    it("should create a new warehouse location", async () => {
      warehouseServiceMock.createWarehouseLocation = vi.fn().mockResolvedValue({
        id: "loc-1",
        code: "A-01-02",
        zone: "A",
        aisle: "01",
        position: "02",
        capacity: 1000,
        type: "pallet",
      });

      const newLocation = {
        code: "A-01-02",
        zone: "A",
        aisle: "01",
        position: "02",
        capacity: 1000,
        type: "pallet",
      };

      const response = await request(app)
        .post("/api/warehouse/locations")
        .send(newLocation);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(warehouseServiceMock.createWarehouseLocation).toHaveBeenCalledWith(
        expect.objectContaining({ code: newLocation.code }),
      );
    });
  });

  describe("POST /api/warehouse/picking", () => {
    it("should create a picking list", async () => {
      warehouseServiceMock.createPickingList = vi.fn().mockResolvedValue({
        id: "pl-1",
        picking_number: "PL-2025-001",
        order_id: "order-1",
        status: "open",
        priority: "high",
      });

      const pickingOrder = {
        order_id: "order-1",
        items: [
          {
            material_id: "material-1",
            quantity: 5,
            location_id: "location-1",
          },
        ],
        priority: "high",
      };

      const response = await request(app)
        .post("/api/warehouse/picking")
        .send(pickingOrder);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("picking_number");
      expect(warehouseServiceMock.createPickingList).toHaveBeenCalled();
    });
  });

  describe("GET /api/warehouse/picking", () => {
    it("should return picking lists", async () => {
      const response = await request(app).get("/api/warehouse/picking");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(warehouseServiceMock.getPickingLists).toHaveBeenCalled();
    });

    it("should filter picking lists by status", async () => {
      const response = await request(app)
        .get("/api/warehouse/picking")
        .query({ status: "open" });

      expect(response.status).toBe(200);
      expect(warehouseServiceMock.getPickingLists).toHaveBeenCalledWith("open");
    });
  });

  describe("POST /api/warehouse/shipment", () => {
    it("should create a shipment", async () => {
      warehouseServiceMock.createShipment = vi.fn().mockResolvedValue({
        id: "ship-1",
        shipment_number: "SH-2025-001",
        order_id: "order-1",
        status: "prepared",
        carrier: "DHL",
      });

      const shipment = {
        order_id: "order-1",
        carrier: "DHL",
        tracking_number: "DHL1234567890",
        packages: [
          {
            material_id: "material-1",
            quantity: 5,
            weight: 10,
            dimensions: "10x10x10",
          },
        ],
      };

      const response = await request(app)
        .post("/api/warehouse/shipment")
        .send(shipment);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("shipment_number");
      expect(warehouseServiceMock.createShipment).toHaveBeenCalled();
    });
  });

  describe("GET /api/warehouse/shipments", () => {
    it("should return shipments", async () => {
      const response = await request(app).get("/api/warehouse/shipments");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(warehouseServiceMock.getShipments).toHaveBeenCalled();
    });

    it("should filter shipments by status", async () => {
      const response = await request(app)
        .get("/api/warehouse/shipments")
        .query({ status: "prepared" });

      expect(response.status).toBe(200);
      expect(warehouseServiceMock.getShipments).toHaveBeenCalledWith(
        "prepared",
      );
    });
  });

  describe("POST /api/warehouse/inventory-count", () => {
    it("should create an inventory count", async () => {
      warehouseServiceMock.createInventoryCount = vi.fn().mockResolvedValue({
        id: "ic-1",
        count_number: "IC-2025-001",
        type: "full",
        status: "planned",
      });

      const inventoryCount = {
        location_ids: ["location-1", "location-2"],
        type: "full",
        scheduled_date: "2025-12-20",
      };

      const response = await request(app)
        .post("/api/warehouse/inventory-count")
        .send(inventoryCount);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.type).toBe("full");
      expect(warehouseServiceMock.createInventoryCount).toHaveBeenCalled();
    });
  });

  describe("GET /api/warehouse/analytics", () => {
    it("should return warehouse analytics", async () => {
      const response = await request(app).get("/api/warehouse/analytics");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("turnover_rate");
      expect(response.body.data).toHaveProperty("fill_rate");
      expect(response.body.data).toHaveProperty("inventory_accuracy");
      expect(warehouseServiceMock.getAnalytics).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 errors for missing resources", async () => {
      warehouseServiceMock.getStockItemById = vi
        .fn()
        .mockRejectedValue(new Error("Not found"));

      const response = await request(app).get(
        "/api/warehouse/stock/invalid-id",
      );

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });

    it("should handle validation errors gracefully", async () => {
      const response = await request(app)
        .post("/api/warehouse/stock/movement")
        .send({}); // Empty body should fail validation

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
