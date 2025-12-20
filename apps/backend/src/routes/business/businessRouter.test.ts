// SPDX-License-Identifier: MIT
// apps/backend/src/routes/business/businessRouter.test.ts

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import businessRouter from "./businessRouter.js";

describe("Business Router", () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/business", businessRouter);
  });

  afterAll(() => {
    // Cleanup if needed
  });

  describe("GET /api/business/company", () => {
    it("should return company information", async () => {
      const response = await request(app).get("/api/business/company");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("legal_form");
    });
  });

  describe("GET /api/business/processes", () => {
    it("should return list of processes", async () => {
      const response = await request(app).get("/api/business/processes");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/business/processes", () => {
    it("should create a new process with valid data", async () => {
      const newProcess = {
        name: "Test Process",
        description: "Test Description",
        category: "operations",
      };

      const response = await request(app)
        .post("/api/business/processes")
        .send(newProcess);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(newProcess.name);
    });

    it("should reject invalid process data", async () => {
      const invalidProcess = {
        // Missing required fields
        description: "Missing name",
      };

      const response = await request(app)
        .post("/api/business/processes")
        .send(invalidProcess);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/business/risks", () => {
    it("should return list of risks", async () => {
      const response = await request(app).get("/api/business/risks");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("POST /api/business/risks", () => {
    it("should create a new risk assessment", async () => {
      const newRisk = {
        name: "Test Risk",
        description: "Risk Description",
        category: "financial",
        probability: "medium",
        impact: "high",
      };

      const response = await request(app)
        .post("/api/business/risks")
        .send(newRisk);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(newRisk.name);
    });
  });

  describe("GET /api/business/compliance", () => {
    it("should return compliance status", async () => {
      const response = await request(app).get("/api/business/compliance");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("requirements");
      expect(Array.isArray(response.body.requirements)).toBe(true);
    });
  });

  describe("POST /api/business/audits", () => {
    it("should create a new audit", async () => {
      const newAudit = {
        name: "Test Audit",
        type: "internal",
        scheduled_date: "2025-12-20",
      };

      const response = await request(app)
        .post("/api/business/audits")
        .send(newAudit);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(newAudit.name);
    });
  });

  describe("GET /api/business/audits", () => {
    it("should return list of audits", async () => {
      const response = await request(app).get("/api/business/audits");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
