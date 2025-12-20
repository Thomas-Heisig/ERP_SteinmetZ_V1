-- SPDX-License-Identifier: MIT
-- Migration: Seed payroll tax parameters for Germany (DE)
-- Description: Inserts default German payroll tax and social insurance rates for 2024-2025

-- 2024 German payroll tax parameters

INSERT OR IGNORE INTO hr_payroll_tax_params (
    id, year, income_tax_rate, pension_insurance_rate, health_insurance_rate,
    unemployment_insurance_rate, church_tax_rate, solidarity_surcharge_rate,
    minimum_wage, tax_free_allowance, country_code, notes, created_at, updated_at
  ) VALUES (
    'tax-param-de-2024',
    2024,
    0.42,
    0.093,
    0.073,
    0.012,
    0.08,
    0.0055,
    12.41,
    520.0,
    'DE',
    'Standard German payroll rates for 2024 (employees only, employer contributions separate)',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- 2025 German payroll tax parameters

INSERT OR IGNORE INTO hr_payroll_tax_params (
    id, year, income_tax_rate, pension_insurance_rate, health_insurance_rate,
    unemployment_insurance_rate, church_tax_rate, solidarity_surcharge_rate,
    minimum_wage, tax_free_allowance, country_code, notes, created_at, updated_at
  ) VALUES (
    'tax-param-de-2025',
    2025,
    0.42,
    0.093,
    0.073,
    0.012,
    0.08,
    0.0055,
    12.82,
    520.0,
    'DE',
    'Standard German payroll rates for 2025 with updated minimum wage',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

