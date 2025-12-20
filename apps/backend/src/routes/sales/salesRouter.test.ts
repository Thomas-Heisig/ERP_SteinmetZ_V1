// SPDX-License-Identifier: MIT
// apps/backend/src/routes/sales/salesRouter.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import salesRouter from "./salesRouter.js";

describe("Sales Router", () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/sales", salesRouter);
  });

  describe("GET /api/sales/pipeline", () => {
    it("should return sales pipeline data", async () => {
      const response = await request(app).get("/api/sales/pipeline");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("stages");
      expect(Array.isArray(response.body.stages)).toBe(true);
    });
  });

  describe("POST /api/sales/quotes", () => {
    it("should create a new quote", async () => {
      const newQuote = {
        customer_id: "customer-1",
        items: [
          {
            product_id: "product-1",
            quantity: 5,
            price: 100.0,
          },
        ],
        valid_until: "2025-12-31",
      };

      const response = await request(app)
        .post("/api/sales/quotes")
        .send(newQuote);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("quote_number");
    });

    it("should reject quote without required fields", async () => {
      const invalidQuote = {
        items: [], // Empty items array
      };

      const response = await request(app)
        .post("/api/sales/quotes")
        .send(invalidQuote);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/sales/quotes", () => {
    it("should return list of quotes", async () => {
      const response = await request(app).get("/api/sales/quotes");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/sales/orders", () => {
    it("should create a new sales order", async () => {
      const newOrder = {
        customer_id: "customer-1",
        items: [
          {
            product_id: "product-1",
            quantity: 3,
            price: 150.0,
          },
        ],
        delivery_date: "2025-12-25",
      };

      const response = await request(app)
        .post("/api/sales/orders")
        .send(newOrder);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("order_number");
    });
  });

  describe("GET /api/sales/leads", () => {
    it("should return list of leads", async () => {
      const response = await request(app).get("/api/sales/leads");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/sales/leads", () => {
    it("should create a new lead", async () => {
      const newLead = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+49 123 456789",
        source: "website",
      };

      const response = await request(app)
        .post("/api/sales/leads")
        .send(newLead);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(newLead.name);
    });
  });

  describe("GET /api/sales/campaigns", () => {
    it("should return list of campaigns", async () => {
      const response = await request(app).get("/api/sales/campaigns");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/sales/campaigns", () => {
    it("should create a new campaign", async () => {
      const newCampaign = {
        name: "Summer Sale 2025",
        start_date: "2025-06-01",
        end_date: "2025-08-31",
        budget: 5000.0,
        target_audience: "B2B",
      };

      const response = await request(app)
        .post("/api/sales/campaigns")
        .send(newCampaign);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(newCampaign.name);
    });
  });

  describe("GET /api/sales/analytics", () => {
    it("should return sales analytics", async () => {
      const response = await request(app).get("/api/sales/analytics");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("total_revenue");
      expect(response.body).toHaveProperty("conversion_rate");
    });
  });
});
