// SPDX-License-Identifier: MIT
// apps/backend/src/routes/business/companyRouter.ts
/**
 * @module CompanyRouter
 * @description Company Master Data Management - Unternehmens-Stammdaten
 */

import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { z } from "zod";
import { BadRequestError, NotFoundError } from "../../types/errors.js";
import db from "../../services/dbService.js";
import { createLogger } from "../../utils/logger.js";

const router = Router();
const logger = createLogger("company");

/* ---------------------------------------------------------
   VALIDATION SCHEMAS
--------------------------------------------------------- */

const companyInfoSchema = z.object({
  official_name: z.string().min(1, "Official name is required"),
  trade_name: z.string().optional(),
  company_purpose: z.string().optional(),
  founded_date: z.string().optional(),
  employee_count: z.number().int().min(0).optional(),
  revenue_class: z.string().optional(),
  industry_classification: z.string().optional(),
  street: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Deutschland"),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  business_hours: z.string().optional(), // JSON string
  timezone: z.string().default("Europe/Berlin"),
  logo_url: z.string().optional(),
  brand_assets: z.string().optional(), // JSON string
  imprint_data: z.string().optional(),
  notes: z.string().optional(),
});

const legalInfoSchema = z.object({
  company_id: z.string(),
  legal_form: z.string().min(1, "Legal form is required"),
  registration_number: z.string().optional(),
  registration_court: z.string().optional(),
  registration_date: z.string().optional(),
  management: z.string().optional(), // JSON string
  shareholders: z.string().optional(), // JSON string
  capital_amount: z.number().optional(),
  capital_increases: z.string().optional(), // JSON string
  authorized_representatives: z.string().optional(), // JSON string
  articles_of_association: z.string().optional(),
  commercial_register_extract: z.string().optional(),
  international_registrations: z.string().optional(), // JSON string
  compliance_obligations: z.string().optional(), // JSON string
  representation_rules: z.string().optional(),
  reporting_obligations: z.string().optional(), // JSON string
  valid_from: z.string(),
  valid_to: z.string().optional(),
});

const taxInfoSchema = z.object({
  company_id: z.string(),
  tax_office: z.string().optional(),
  tax_office_address: z.string().optional(),
  tax_number: z.string().optional(),
  vat_id: z.string().optional(),
  business_location_number: z.string().optional(),
  payroll_tax_number: z.string().optional(),
  trade_tax_number: z.string().optional(),
  international_tax_ids: z.string().optional(), // JSON string
  verification_status: z.enum(["pending", "verified", "failed"]).optional(),
  verification_date: z.string().optional(),
  vies_check_log: z.string().optional(), // JSON string
  elster_access: z.string().optional(), // Encrypted JSON string
  digital_signature: z.string().optional(),
  certificate_expiry: z.string().optional(),
  tax_classification: z.string().optional(),
  tax_obligations: z.string().optional(), // JSON string
  valid_from: z.string(),
  valid_to: z.string().optional(),
});

const bankAccountSchema = z.object({
  company_id: z.string(),
  bank_name: z.string().min(1, "Bank name is required"),
  account_name: z.string().min(1, "Account name is required"),
  account_type: z.string().optional(),
  iban: z.string().min(1, "IBAN is required"),
  bic: z.string().optional(),
  bank_code: z.string().optional(),
  account_number: z.string().optional(),
  overdraft_limit: z.number().optional(),
  credit_line: z.number().optional(),
  online_banking_access: z.string().optional(), // Encrypted JSON string
  ebics_keys: z.string().optional(), // Encrypted JSON string
  last_sync: z.string().optional(),
  is_primary: z.boolean().default(false),
  low_balance_threshold: z.number().optional(),
  notification_settings: z.string().optional(), // JSON string
});

const communicationSchema = z.object({
  company_id: z.string(),
  channel_type: z.enum([
    "email",
    "phone",
    "fax",
    "social_media",
    "website",
    "other",
  ]),
  channel_name: z.string().min(1, "Channel name is required"),
  value: z.string().min(1, "Value is required"),
  description: z.string().optional(),
  configuration: z.string().optional(), // JSON string
  is_primary: z.boolean().default(false),
});

/* ---------------------------------------------------------
   COMPANY INFO - Basic Data
--------------------------------------------------------- */

// GET /api/business/company - Get all companies
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const companies = await db.all(
      `SELECT * FROM business_company_info WHERE is_active = 1 ORDER BY created_at DESC`,
    );
    res.json({ companies });
  }),
);

// GET /api/business/company/:id - Get single company with all related data
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get basic info
    const company = await db.get(
      `SELECT * FROM business_company_info WHERE id = ?`,
      [id],
    );

    if (!company) {
      throw new NotFoundError("Company not found");
    }

    // Get legal info
    const legalInfo = await db.all(
      `SELECT * FROM business_legal_info WHERE company_id = ? AND (valid_to IS NULL OR valid_to > datetime('now'))`,
      [id],
    );

    // Get tax info
    const taxInfo = await db.all(
      `SELECT * FROM business_tax_info WHERE company_id = ? AND (valid_to IS NULL OR valid_to > datetime('now'))`,
      [id],
    );

    // Get bank accounts
    const bankAccounts = await db.all(
      `SELECT * FROM business_bank_accounts WHERE company_id = ? AND is_active = 1`,
      [id],
    );

    // Get communication channels
    const communications = await db.all(
      `SELECT * FROM business_communication WHERE company_id = ? AND is_active = 1`,
      [id],
    );

    res.json({
      company,
      legal_info: legalInfo,
      tax_info: taxInfo,
      bank_accounts: bankAccounts,
      communications,
    });
  }),
);

// POST /api/business/company - Create new company
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const validatedData = companyInfoSchema.parse(req.body);

    const id = await db.run(
      `INSERT INTO business_company_info (
        official_name, trade_name, company_purpose, founded_date, employee_count,
        revenue_class, industry_classification, street, postal_code, city, country,
        phone, fax, email, website, business_hours, timezone, logo_url,
        brand_assets, imprint_data, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.official_name,
        validatedData.trade_name || null,
        validatedData.company_purpose || null,
        validatedData.founded_date || null,
        validatedData.employee_count || null,
        validatedData.revenue_class || null,
        validatedData.industry_classification || null,
        validatedData.street || null,
        validatedData.postal_code || null,
        validatedData.city || null,
        validatedData.country,
        validatedData.phone || null,
        validatedData.fax || null,
        validatedData.email || null,
        validatedData.website || null,
        validatedData.business_hours || null,
        validatedData.timezone,
        validatedData.logo_url || null,
        validatedData.brand_assets || null,
        validatedData.imprint_data || null,
        validatedData.notes || null,
      ],
    );

    logger.info("Company created", { id, name: validatedData.official_name });

    res.status(201).json({
      message: "Company created successfully",
      id,
    });
  }),
);

// PUT /api/business/company/:id - Update company
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = companyInfoSchema.parse(req.body);

    // Check if company exists
    const existing = await db.get(
      `SELECT id FROM business_company_info WHERE id = ?`,
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Company not found");
    }

    await db.run(
      `UPDATE business_company_info SET
        official_name = ?, trade_name = ?, company_purpose = ?, founded_date = ?,
        employee_count = ?, revenue_class = ?, industry_classification = ?,
        street = ?, postal_code = ?, city = ?, country = ?, phone = ?, fax = ?,
        email = ?, website = ?, business_hours = ?, timezone = ?, logo_url = ?,
        brand_assets = ?, imprint_data = ?, notes = ?, updated_at = datetime('now')
      WHERE id = ?`,
      [
        validatedData.official_name,
        validatedData.trade_name || null,
        validatedData.company_purpose || null,
        validatedData.founded_date || null,
        validatedData.employee_count || null,
        validatedData.revenue_class || null,
        validatedData.industry_classification || null,
        validatedData.street || null,
        validatedData.postal_code || null,
        validatedData.city || null,
        validatedData.country,
        validatedData.phone || null,
        validatedData.fax || null,
        validatedData.email || null,
        validatedData.website || null,
        validatedData.business_hours || null,
        validatedData.timezone,
        validatedData.logo_url || null,
        validatedData.brand_assets || null,
        validatedData.imprint_data || null,
        validatedData.notes || null,
        id,
      ],
    );

    logger.info("Company updated", { id, name: validatedData.official_name });

    res.json({ message: "Company updated successfully" });
  }),
);

// DELETE /api/business/company/:id - Soft delete company
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await db.get(
      `SELECT id FROM business_company_info WHERE id = ?`,
      [id],
    );

    if (!existing) {
      throw new NotFoundError("Company not found");
    }

    await db.run(
      `UPDATE business_company_info SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
      [id],
    );

    logger.info("Company deactivated", { id });

    res.json({ message: "Company deactivated successfully" });
  }),
);

/* ---------------------------------------------------------
   LEGAL INFO
--------------------------------------------------------- */

// POST /api/business/company/:id/legal - Add legal info
router.post(
  "/:id/legal",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = legalInfoSchema.parse({
      ...req.body,
      company_id: id,
    });

    await db.run(
      `INSERT INTO business_legal_info (
        company_id, legal_form, registration_number, registration_court,
        registration_date, management, shareholders, capital_amount,
        capital_increases, authorized_representatives, articles_of_association,
        commercial_register_extract, international_registrations,
        compliance_obligations, representation_rules, reporting_obligations,
        valid_from, valid_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.company_id,
        validatedData.legal_form,
        validatedData.registration_number || null,
        validatedData.registration_court || null,
        validatedData.registration_date || null,
        validatedData.management || null,
        validatedData.shareholders || null,
        validatedData.capital_amount || null,
        validatedData.capital_increases || null,
        validatedData.authorized_representatives || null,
        validatedData.articles_of_association || null,
        validatedData.commercial_register_extract || null,
        validatedData.international_registrations || null,
        validatedData.compliance_obligations || null,
        validatedData.representation_rules || null,
        validatedData.reporting_obligations || null,
        validatedData.valid_from,
        validatedData.valid_to || null,
      ],
    );

    logger.info("Legal info added", { company_id: id });

    res.status(201).json({ message: "Legal info added successfully" });
  }),
);

/* ---------------------------------------------------------
   TAX INFO
--------------------------------------------------------- */

// POST /api/business/company/:id/tax - Add tax info
router.post(
  "/:id/tax",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = taxInfoSchema.parse({ ...req.body, company_id: id });

    await db.run(
      `INSERT INTO business_tax_info (
        company_id, tax_office, tax_office_address, tax_number, vat_id,
        business_location_number, payroll_tax_number, trade_tax_number,
        international_tax_ids, verification_status, verification_date,
        vies_check_log, elster_access, digital_signature, certificate_expiry,
        tax_classification, tax_obligations, valid_from, valid_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.company_id,
        validatedData.tax_office || null,
        validatedData.tax_office_address || null,
        validatedData.tax_number || null,
        validatedData.vat_id || null,
        validatedData.business_location_number || null,
        validatedData.payroll_tax_number || null,
        validatedData.trade_tax_number || null,
        validatedData.international_tax_ids || null,
        validatedData.verification_status || null,
        validatedData.verification_date || null,
        validatedData.vies_check_log || null,
        validatedData.elster_access || null,
        validatedData.digital_signature || null,
        validatedData.certificate_expiry || null,
        validatedData.tax_classification || null,
        validatedData.tax_obligations || null,
        validatedData.valid_from,
        validatedData.valid_to || null,
      ],
    );

    logger.info("Tax info added", { company_id: id });

    res.status(201).json({ message: "Tax info added successfully" });
  }),
);

/* ---------------------------------------------------------
   BANK ACCOUNTS
--------------------------------------------------------- */

// GET /api/business/company/:id/bank-accounts - Get all bank accounts
router.get(
  "/:id/bank-accounts",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const accounts = await db.all(
      `SELECT * FROM business_bank_accounts WHERE company_id = ? AND is_active = 1`,
      [id],
    );

    res.json({ bank_accounts: accounts });
  }),
);

// POST /api/business/company/:id/bank-accounts - Add bank account
router.post(
  "/:id/bank-accounts",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = bankAccountSchema.parse({
      ...req.body,
      company_id: id,
    });

    await db.run(
      `INSERT INTO business_bank_accounts (
        company_id, bank_name, account_name, account_type, iban, bic,
        bank_code, account_number, overdraft_limit, credit_line,
        online_banking_access, ebics_keys, last_sync, is_primary,
        low_balance_threshold, notification_settings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.company_id,
        validatedData.bank_name,
        validatedData.account_name,
        validatedData.account_type || null,
        validatedData.iban,
        validatedData.bic || null,
        validatedData.bank_code || null,
        validatedData.account_number || null,
        validatedData.overdraft_limit || null,
        validatedData.credit_line || null,
        validatedData.online_banking_access || null,
        validatedData.ebics_keys || null,
        validatedData.last_sync || null,
        validatedData.is_primary ? 1 : 0,
        validatedData.low_balance_threshold || null,
        validatedData.notification_settings || null,
      ],
    );

    logger.info("Bank account added", {
      company_id: id,
      iban: validatedData.iban,
    });

    res.status(201).json({ message: "Bank account added successfully" });
  }),
);

/* ---------------------------------------------------------
   COMMUNICATION CHANNELS
--------------------------------------------------------- */

// GET /api/business/company/:id/communications - Get all communication channels
router.get(
  "/:id/communications",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const communications = await db.all(
      `SELECT * FROM business_communication WHERE company_id = ? AND is_active = 1`,
      [id],
    );

    res.json({ communications });
  }),
);

// POST /api/business/company/:id/communications - Add communication channel
router.post(
  "/:id/communications",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = communicationSchema.parse({
      ...req.body,
      company_id: id,
    });

    await db.run(
      `INSERT INTO business_communication (
        company_id, channel_type, channel_name, value, description,
        configuration, is_primary
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.company_id,
        validatedData.channel_type,
        validatedData.channel_name,
        validatedData.value,
        validatedData.description || null,
        validatedData.configuration || null,
        validatedData.is_primary ? 1 : 0,
      ],
    );

    logger.info("Communication channel added", {
      company_id: id,
      type: validatedData.channel_type,
    });

    res
      .status(201)
      .json({ message: "Communication channel added successfully" });
  }),
);

export default router;
