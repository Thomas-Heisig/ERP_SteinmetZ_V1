// SPDX-License-Identifier: MIT
// apps/backend/src/routes/procurement/procurementRouter.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import procurementRouter from "./procurementRouter.js";

describe("Procurement Router", () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/procurement", procurementRouter);
  });

  describe("GET /api/procurement/orders", () => {
    it("should return list of purchase orders", async () => {
      const response = await request(app).get("/api/procurement/orders");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/procurement/orders", () => {
    it("should create a new purchase order", async () => {
      const newOrder = {
        supplier_id: "supplier-1",
        items: [
          {
            material_id: "material-1",
            quantity: 100,
            price: 10.5,
          },
        ],
        delivery_date: "2025-12-30",
      };

      const response = await request(app)
        .post("/api/procurement/orders")
        .send(newOrder);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("order_number");
    });

    it("should reject order without supplier_id", async () => {
      const invalidOrder = {
        items: [{ material_id: "mat-1", quantity: 10, price: 5.0 }],
      };

      const response = await request(app)
        .post("/api/procurement/orders")
        .send(invalidOrder);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/procurement/suppliers", () => {
    it("should return list of suppliers", async () => {
      const response = await request(app).get("/api/procurement/suppliers");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/procurement/suppliers", () => {
    it("should create a new supplier", async () => {
      const newSupplier = {
        name: "Test Supplier GmbH",
        contact_person: "Max Mustermann",
        email: "max@supplier.de",
        phone: "+49 123 456789",
        address: {
          street: "Lieferstr. 1",
          zip: "12345",
          city: "Supplierstadt",
        },
      };

      const response = await request(app)
        .post("/api/procurement/suppliers")
        .send(newSupplier);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(newSupplier.name);
    });
  });

  describe("POST /api/procurement/goods-receipt", () => {
    it("should record goods receipt", async () => {
      const receipt = {
        order_id: "order-1",
        items: [
          {
            material_id: "material-1",
            quantity_received: 95,
            quality_status: "accepted",
          },
        ],
        received_by: "employee-1",
      };

      const response = await request(app)
        .post("/api/procurement/goods-receipt")
        .send(receipt);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("receipt_number");
    });
  });

  describe("GET /api/procurement/demand-planning", () => {
    it("should return demand planning data", async () => {
      const response = await request(app).get(
        "/api/procurement/demand-planning",
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("materials");
      expect(Array.isArray(response.body.materials)).toBe(true);
    });
  });

  describe("POST /api/procurement/supplier-evaluation", () => {
    it("should create supplier evaluation", async () => {
      const evaluation = {
        supplier_id: "supplier-1",
        criteria: {
          quality: 8,
          delivery: 9,
          price: 7,
          communication: 8,
        },
        notes: "Good overall performance",
      };

      const response = await request(app)
        .post("/api/procurement/supplier-evaluation")
        .send(evaluation);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("overall_score");
    });
  });
});
