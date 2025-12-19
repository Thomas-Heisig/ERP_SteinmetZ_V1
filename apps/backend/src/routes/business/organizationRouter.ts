// SPDX-License-Identifier: MIT
// apps/backend/src/routes/business/organizationRouter.ts
/**
 * @module OrganizationRouter
 * @description Organizational Structure Management - Departments, Locations, Cost Centers
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { z } from "zod";
import { NotFoundError } from "../../types/errors.js";
import db from "../../services/dbService.js";
import { createLogger } from "../../utils/logger.js";

const router = Router();
const logger = createLogger("organization");

/* ---------------------------------------------------------
   VALIDATION SCHEMAS
--------------------------------------------------------- */

const departmentSchema = z.object({
  company_id: z.string(),
  parent_id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  level: z.number().int().default(0),
  sort_order: z.number().int().default(0),
  manager_id: z.string().optional(),
  deputy_manager_id: z.string().optional(),
  budget: z.number().optional(),
  employee_count: z.number().int().optional(),
  location_id: z.string().optional(),
  valid_from: z.string(),
  valid_to: z.string().optional(),
});

const locationSchema = z.object({
  company_id: z.string(),
  location_type: z.enum([
    "headquarters",
    "branch",
    "production",
    "warehouse",
    "sales_office",
    "service_center",
    "foreign",
    "representative",
    "home_office",
    "temporary",
  ]),
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  street: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  building_info: z.string().optional(), // JSON
  area_sqm: z.number().optional(),
  capacity: z.number().int().optional(),
  equipment: z.string().optional(), // JSON
  rent_or_purchase: z.enum(["rent", "purchase", "lease"]).optional(),
  monthly_cost: z.number().optional(),
  infrastructure: z.string().optional(), // JSON
  connectivity: z.string().optional(), // JSON
  compliance_requirements: z.string().optional(), // JSON
  utilization_percent: z.number().min(0).max(100).optional(),
  valid_from: z.string(),
  valid_to: z.string().optional(),
});

const costCenterSchema = z.object({
  company_id: z.string(),
  parent_id: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  type: z.enum([
    "cost_center",
    "profit_center",
    "investment_center",
    "revenue_center",
  ]),
  description: z.string().optional(),
  level: z.number().int().default(0),
  responsible_person_id: z.string().optional(),
  budget_responsible_id: z.string().optional(),
  annual_budget: z.number().optional(),
  department_id: z.string().optional(),
  valid_from: z.string(),
  valid_to: z.string().optional(),
});

const roleSchema = z.object({
  company_id: z.string(),
  role_name: z.string().min(1, "Role name is required"),
  role_code: z.string().optional(),
  description: z.string().optional(),
  competency_profile: z.string().optional(), // JSON
  qualifications_required: z.string().optional(), // JSON
  responsibility_areas: z.string().optional(), // JSON
  decision_authority: z.string().optional(), // JSON
  approval_limits: z.string().optional(), // JSON
  career_level: z.string().optional(),
});

/* ---------------------------------------------------------
   DEPARTMENTS
--------------------------------------------------------- */

// GET /api/business/organization/departments - Get all departments
router.get(
  "/departments",
  asyncHandler(async (req, res) => {
    const { company_id } = req.query;

    let query = `SELECT * FROM business_departments WHERE is_active = 1`;
    const params: any[] = [];

    if (company_id) {
      query += ` AND company_id = ?`;
      params.push(company_id);
    }

    query += ` ORDER BY level, sort_order`;

    const departments = await db.all(query, params);
    res.json({ departments });
  }),
);

// GET /api/business/organization/departments/:id - Get single department
router.get(
  "/departments/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const department = await db.get(
      `SELECT * FROM business_departments WHERE id = ?`,
      [id],
    );

    if (!department) {
      throw new NotFoundError("Department not found");
    }

    // Get sub-departments
    const subDepartments = await db.all(
      `SELECT * FROM business_departments WHERE parent_id = ? AND is_active = 1`,
      [id],
    );

    res.json({
      department,
      sub_departments: subDepartments,
    });
  }),
);

// POST /api/business/organization/departments - Create department
router.post(
  "/departments",
  asyncHandler(async (req, res) => {
    const validatedData = departmentSchema.parse(req.body);

    await db.run(
      `INSERT INTO business_departments (
        company_id, parent_id, name, code, type, description, level,
        sort_order, manager_id, deputy_manager_id, budget, employee_count,
        location_id, valid_from, valid_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.company_id,
        validatedData.parent_id || null,
        validatedData.name,
        validatedData.code || null,
        validatedData.type || null,
        validatedData.description || null,
        validatedData.level,
        validatedData.sort_order,
        validatedData.manager_id || null,
        validatedData.deputy_manager_id || null,
        validatedData.budget || null,
        validatedData.employee_count || null,
        validatedData.location_id || null,
        validatedData.valid_from,
        validatedData.valid_to || null,
      ],
    );

    logger.info("Department created", { name: validatedData.name });

    res.status(201).json({ message: "Department created successfully" });
  }),
);

// PUT /api/business/organization/departments/:id - Update department
router.put(
  "/departments/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = departmentSchema.parse(req.body);

    const existing = await db.get(
      `SELECT id FROM business_departments WHERE id = ?`,
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Department not found");
    }

    await db.run(
      `UPDATE business_departments SET
        parent_id = ?, name = ?, code = ?, type = ?, description = ?, level = ?,
        sort_order = ?, manager_id = ?, deputy_manager_id = ?, budget = ?,
        employee_count = ?, location_id = ?, valid_from = ?, valid_to = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        validatedData.parent_id || null,
        validatedData.name,
        validatedData.code || null,
        validatedData.type || null,
        validatedData.description || null,
        validatedData.level,
        validatedData.sort_order,
        validatedData.manager_id || null,
        validatedData.deputy_manager_id || null,
        validatedData.budget || null,
        validatedData.employee_count || null,
        validatedData.location_id || null,
        validatedData.valid_from,
        validatedData.valid_to || null,
        id,
      ],
    );

    logger.info("Department updated", { id, name: validatedData.name });

    res.json({ message: "Department updated successfully" });
  }),
);

// DELETE /api/business/organization/departments/:id - Deactivate department
router.delete(
  "/departments/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await db.get(
      `SELECT id FROM business_departments WHERE id = ?`,
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Department not found");
    }

    await db.run(
      `UPDATE business_departments SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
      [id],
    );

    logger.info("Department deactivated", { id });

    res.json({ message: "Department deactivated successfully" });
  }),
);

/* ---------------------------------------------------------
   LOCATIONS
--------------------------------------------------------- */

// GET /api/business/organization/locations - Get all locations
router.get(
  "/locations",
  asyncHandler(async (req, res) => {
    const { company_id, location_type } = req.query;

    let query = `SELECT * FROM business_locations WHERE is_active = 1`;
    const params: any[] = [];

    if (company_id) {
      query += ` AND company_id = ?`;
      params.push(company_id);
    }

    if (location_type) {
      query += ` AND location_type = ?`;
      params.push(location_type);
    }

    query += ` ORDER BY location_type, name`;

    const locations = await db.all(query, params);
    res.json({ locations });
  }),
);

// GET /api/business/organization/locations/:id - Get single location
router.get(
  "/locations/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const location = await db.get(
      `SELECT * FROM business_locations WHERE id = ?`,
      [id],
    );

    if (!location) {
      throw new NotFoundError("Location not found");
    }

    res.json({ location });
  }),
);

// POST /api/business/organization/locations - Create location
router.post(
  "/locations",
  asyncHandler(async (req, res) => {
    const validatedData = locationSchema.parse(req.body);

    await db.run(
      `INSERT INTO business_locations (
        company_id, location_type, name, code, description, street,
        postal_code, city, country, phone, email, building_info, area_sqm,
        capacity, equipment, rent_or_purchase, monthly_cost, infrastructure,
        connectivity, compliance_requirements, utilization_percent,
        valid_from, valid_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.company_id,
        validatedData.location_type,
        validatedData.name,
        validatedData.code || null,
        validatedData.description || null,
        validatedData.street || null,
        validatedData.postal_code || null,
        validatedData.city || null,
        validatedData.country || null,
        validatedData.phone || null,
        validatedData.email || null,
        validatedData.building_info || null,
        validatedData.area_sqm || null,
        validatedData.capacity || null,
        validatedData.equipment || null,
        validatedData.rent_or_purchase || null,
        validatedData.monthly_cost || null,
        validatedData.infrastructure || null,
        validatedData.connectivity || null,
        validatedData.compliance_requirements || null,
        validatedData.utilization_percent || null,
        validatedData.valid_from,
        validatedData.valid_to || null,
      ],
    );

    logger.info("Location created", { name: validatedData.name });

    res.status(201).json({ message: "Location created successfully" });
  }),
);

// PUT /api/business/organization/locations/:id - Update location
router.put(
  "/locations/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = locationSchema.parse(req.body);

    const existing = await db.get(
      `SELECT id FROM business_locations WHERE id = ?`,
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Location not found");
    }

    await db.run(
      `UPDATE business_locations SET
        location_type = ?, name = ?, code = ?, description = ?, street = ?,
        postal_code = ?, city = ?, country = ?, phone = ?, email = ?,
        building_info = ?, area_sqm = ?, capacity = ?, equipment = ?,
        rent_or_purchase = ?, monthly_cost = ?, infrastructure = ?,
        connectivity = ?, compliance_requirements = ?, utilization_percent = ?,
        valid_from = ?, valid_to = ?, updated_at = datetime('now')
      WHERE id = ?`,
      [
        validatedData.location_type,
        validatedData.name,
        validatedData.code || null,
        validatedData.description || null,
        validatedData.street || null,
        validatedData.postal_code || null,
        validatedData.city || null,
        validatedData.country || null,
        validatedData.phone || null,
        validatedData.email || null,
        validatedData.building_info || null,
        validatedData.area_sqm || null,
        validatedData.capacity || null,
        validatedData.equipment || null,
        validatedData.rent_or_purchase || null,
        validatedData.monthly_cost || null,
        validatedData.infrastructure || null,
        validatedData.connectivity || null,
        validatedData.compliance_requirements || null,
        validatedData.utilization_percent || null,
        validatedData.valid_from,
        validatedData.valid_to || null,
        id,
      ],
    );

    logger.info("Location updated", { id, name: validatedData.name });

    res.json({ message: "Location updated successfully" });
  }),
);

/* ---------------------------------------------------------
   COST CENTERS
--------------------------------------------------------- */

// GET /api/business/organization/cost-centers - Get all cost centers
router.get(
  "/cost-centers",
  asyncHandler(async (req, res) => {
    const { company_id } = req.query;

    let query = `SELECT * FROM business_cost_centers WHERE is_active = 1`;
    const params: any[] = [];

    if (company_id) {
      query += ` AND company_id = ?`;
      params.push(company_id);
    }

    query += ` ORDER BY level, code`;

    const costCenters = await db.all(query, params);
    res.json({ cost_centers: costCenters });
  }),
);

// POST /api/business/organization/cost-centers - Create cost center
router.post(
  "/cost-centers",
  asyncHandler(async (req, res) => {
    const validatedData = costCenterSchema.parse(req.body);

    await db.run(
      `INSERT INTO business_cost_centers (
        company_id, parent_id, code, name, type, description, level,
        responsible_person_id, budget_responsible_id, annual_budget,
        department_id, valid_from, valid_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.company_id,
        validatedData.parent_id || null,
        validatedData.code,
        validatedData.name,
        validatedData.type,
        validatedData.description || null,
        validatedData.level,
        validatedData.responsible_person_id || null,
        validatedData.budget_responsible_id || null,
        validatedData.annual_budget || null,
        validatedData.department_id || null,
        validatedData.valid_from,
        validatedData.valid_to || null,
      ],
    );

    logger.info("Cost center created", {
      code: validatedData.code,
      name: validatedData.name,
    });

    res.status(201).json({ message: "Cost center created successfully" });
  }),
);

/* ---------------------------------------------------------
   ROLES
--------------------------------------------------------- */

// GET /api/business/organization/roles - Get all roles
router.get(
  "/roles",
  asyncHandler(async (req, res) => {
    const { company_id } = req.query;

    let query = `SELECT * FROM business_roles WHERE is_active = 1`;
    const params: any[] = [];

    if (company_id) {
      query += ` AND company_id = ?`;
      params.push(company_id);
    }

    query += ` ORDER BY role_name`;

    const roles = await db.all(query, params);
    res.json({ roles });
  }),
);

// POST /api/business/organization/roles - Create role
router.post(
  "/roles",
  asyncHandler(async (req, res) => {
    const validatedData = roleSchema.parse(req.body);

    await db.run(
      `INSERT INTO business_roles (
        company_id, role_name, role_code, description, competency_profile,
        qualifications_required, responsibility_areas, decision_authority,
        approval_limits, career_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.company_id,
        validatedData.role_name,
        validatedData.role_code || null,
        validatedData.description || null,
        validatedData.competency_profile || null,
        validatedData.qualifications_required || null,
        validatedData.responsibility_areas || null,
        validatedData.decision_authority || null,
        validatedData.approval_limits || null,
        validatedData.career_level || null,
      ],
    );

    logger.info("Role created", { name: validatedData.role_name });

    res.status(201).json({ message: "Role created successfully" });
  }),
);

export default router;
