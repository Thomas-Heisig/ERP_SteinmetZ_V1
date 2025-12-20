// SPDX-License-Identifier: MIT
// apps/backend/src/routes/production/productionRouter.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import productionRouter from "./productionRouter.js";

describe("Production Router", () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/production", productionRouter);
  });

  describe("GET /api/production/planning", () => {
    it("should return production planning data", async () => {
      const response = await request(app).get("/api/production/planning");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("schedules");
      expect(Array.isArray(response.body.schedules)).toBe(true);
    });
  });

  describe("POST /api/production/orders", () => {
    it("should create a new production order", async () => {
      const newOrder = {
        product_id: "product-1",
        quantity: 100,
        start_date: "2025-12-20",
        target_date: "2025-12-30",
        priority: "high",
      };

      const response = await request(app)
        .post("/api/production/orders")
        .send(newOrder);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("order_number");
      expect(response.body.quantity).toBe(newOrder.quantity);
    });

    it("should reject order with invalid quantity", async () => {
      const invalidOrder = {
        product_id: "product-1",
        quantity: -10, // Invalid negative quantity
        start_date: "2025-12-20",
      };

      const response = await request(app)
        .post("/api/production/orders")
        .send(invalidOrder);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/production/orders", () => {
    it("should return list of production orders", async () => {
      const response = await request(app).get("/api/production/orders");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /api/production/machines", () => {
    it("should return list of machines", async () => {
      const response = await request(app).get("/api/production/machines");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/production/feedback", () => {
    it("should record production feedback", async () => {
      const feedback = {
        order_id: "order-1",
        machine_id: "machine-1",
        quantity_produced: 95,
        quantity_scrapped: 5,
        operator: "employee-1",
        notes: "Minor quality issues on 5 units",
      };

      const response = await request(app)
        .post("/api/production/feedback")
        .send(feedback);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.quantity_produced).toBe(feedback.quantity_produced);
    });
  });

  describe("POST /api/production/quality-check", () => {
    it("should create a quality check record", async () => {
      const qualityCheck = {
        order_id: "order-1",
        inspector: "employee-2",
        sample_size: 10,
        passed: 9,
        failed: 1,
        defect_types: ["scratch"],
      };

      const response = await request(app)
        .post("/api/production/quality-check")
        .send(qualityCheck);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("pass_rate");
    });
  });

  describe("GET /api/production/quality-checks", () => {
    it("should return list of quality checks", async () => {
      const response = await request(app).get("/api/production/quality-checks");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/production/maintenance", () => {
    it("should schedule maintenance", async () => {
      const maintenance = {
        machine_id: "machine-1",
        type: "preventive",
        scheduled_date: "2025-12-25",
        estimated_duration: 4,
        technician: "employee-3",
      };

      const response = await request(app)
        .post("/api/production/maintenance")
        .send(maintenance);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.type).toBe(maintenance.type);
    });
  });

  describe("GET /api/production/reports", () => {
    it("should return production reports", async () => {
      const response = await request(app).get("/api/production/reports");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("efficiency");
      expect(response.body).toHaveProperty("output");
    });
  });
});
