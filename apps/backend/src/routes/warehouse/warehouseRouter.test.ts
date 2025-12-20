// SPDX-License-Identifier: MIT
// apps/backend/src/routes/warehouse/warehouseRouter.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import warehouseRouter from "./warehouseRouter.js";

describe("Warehouse Router", () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/warehouse", warehouseRouter);
  });

  describe("GET /api/warehouse/stock", () => {
    it("should return stock overview", async () => {
      const response = await request(app).get("/api/warehouse/stock");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/warehouse/stock-adjustment", () => {
    it("should adjust stock levels", async () => {
      const adjustment = {
        material_id: "material-1",
        location_id: "location-1",
        quantity_change: -10,
        reason: "damaged",
        adjusted_by: "employee-1",
      };

      const response = await request(app)
        .post("/api/warehouse/stock-adjustment")
        .send(adjustment);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.quantity_change).toBe(adjustment.quantity_change);
    });
  });

  describe("GET /api/warehouse/locations", () => {
    it("should return warehouse locations", async () => {
      const response = await request(app).get("/api/warehouse/locations");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/warehouse/locations", () => {
    it("should create a new warehouse location", async () => {
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
      expect(response.body).toHaveProperty("id");
      expect(response.body.code).toBe(newLocation.code);
    });
  });

  describe("POST /api/warehouse/picking", () => {
    it("should create a picking order", async () => {
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
        picker: "employee-1",
      };

      const response = await request(app)
        .post("/api/warehouse/picking")
        .send(pickingOrder);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("picking_number");
    });
  });

  describe("GET /api/warehouse/picking", () => {
    it("should return picking orders", async () => {
      const response = await request(app).get("/api/warehouse/picking");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/warehouse/shipment", () => {
    it("should create a shipment", async () => {
      const shipment = {
        order_id: "order-1",
        carrier: "DHL",
        tracking_number: "DHL1234567890",
        items: [
          {
            material_id: "material-1",
            quantity: 5,
          },
        ],
        shipping_address: {
          name: "Customer Name",
          street: "Lieferstr. 1",
          zip: "12345",
          city: "Deliverstadt",
        },
      };

      const response = await request(app)
        .post("/api/warehouse/shipment")
        .send(shipment);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("shipment_number");
    });
  });

  describe("GET /api/warehouse/shipments", () => {
    it("should return shipments", async () => {
      const response = await request(app).get("/api/warehouse/shipments");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/warehouse/inventory-count", () => {
    it("should start an inventory count", async () => {
      const inventoryCount = {
        location_ids: ["location-1", "location-2"],
        count_type: "full",
        scheduled_date: "2025-12-20",
      };

      const response = await request(app)
        .post("/api/warehouse/inventory-count")
        .send(inventoryCount);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.count_type).toBe(inventoryCount.count_type);
    });
  });

  describe("GET /api/warehouse/analytics", () => {
    it("should return warehouse analytics", async () => {
      const response = await request(app).get("/api/warehouse/analytics");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("turnover_rate");
      expect(response.body).toHaveProperty("fill_rate");
    });
  });
});
