// SPDX-License-Identifier: MIT
// apps/backend/src/routes/reporting/reportingRouter.test.ts

import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import reportingRouter from "./reportingRouter.js";

describe("Reporting Router", () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/reporting", reportingRouter);
  });

  describe("GET /api/reporting/financial", () => {
    it("should return financial reports", async () => {
      const response = await request(app).get("/api/reporting/financial");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("revenue");
      expect(response.body).toHaveProperty("expenses");
      expect(response.body).toHaveProperty("profit");
    });

    it("should support date range filtering", async () => {
      const response = await request(app)
        .get("/api/reporting/financial")
        .query({
          start_date: "2025-01-01",
          end_date: "2025-12-31",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("period");
    });
  });

  describe("GET /api/reporting/sales", () => {
    it("should return sales reports", async () => {
      const response = await request(app).get("/api/reporting/sales");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("total_sales");
      expect(response.body).toHaveProperty("orders_count");
    });
  });

  describe("GET /api/reporting/production", () => {
    it("should return production reports", async () => {
      const response = await request(app).get("/api/reporting/production");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("output");
      expect(response.body).toHaveProperty("efficiency");
    });
  });

  describe("POST /api/reporting/custom", () => {
    it("should generate a custom report", async () => {
      const reportConfig = {
        name: "Custom Q4 Report",
        metrics: ["revenue", "orders", "customers"],
        dimensions: ["product", "region"],
        filters: {
          date_range: {
            start: "2025-10-01",
            end: "2025-12-31",
          },
          region: ["EU", "NA"],
        },
      };

      const response = await request(app)
        .post("/api/reporting/custom")
        .send(reportConfig);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("report_id");
      expect(response.body).toHaveProperty("data");
    });
  });

  describe("GET /api/reporting/ai-insights", () => {
    it("should return AI-generated insights", async () => {
      const response = await request(app).get("/api/reporting/ai-insights");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("insights");
      expect(Array.isArray(response.body.insights)).toBe(true);
    });
  });

  describe("GET /api/reporting/ai-predictions", () => {
    it("should return AI predictions", async () => {
      const response = await request(app)
        .get("/api/reporting/ai-predictions")
        .query({ metric: "revenue", horizon: "30" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("predictions");
      expect(Array.isArray(response.body.predictions)).toBe(true);
    });
  });

  describe("GET /api/reporting/ai-trends", () => {
    it("should return trend analysis", async () => {
      const response = await request(app).get("/api/reporting/ai-trends");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("trends");
      expect(Array.isArray(response.body.trends)).toBe(true);
    });
  });

  describe("POST /api/reporting/schedule", () => {
    it("should schedule a report", async () => {
      const schedule = {
        report_type: "financial",
        frequency: "weekly",
        recipients: ["admin@company.com"],
        format: "pdf",
        day_of_week: "monday",
      };

      const response = await request(app)
        .post("/api/reporting/schedule")
        .send(schedule);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.frequency).toBe(schedule.frequency);
    });
  });

  describe("GET /api/reporting/schedules", () => {
    it("should return scheduled reports", async () => {
      const response = await request(app).get("/api/reporting/schedules");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/reporting/export", () => {
    it("should export a report", async () => {
      const exportConfig = {
        report_type: "financial",
        format: "xlsx",
        date_range: {
          start: "2025-01-01",
          end: "2025-12-31",
        },
      };

      const response = await request(app)
        .post("/api/reporting/export")
        .send(exportConfig);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("download_url");
    });
  });
});
