-- SPDX-License-Identifier: MIT
-- Migration: Fix warehouse_stock schema conflicts
-- Description: Resolves conflicts between 010 and 020 migrations by migrating to correct schema
-- Database: SQLite
-- Created: 2025-12-20

-- =============================================================================
-- WAREHOUSE_STOCK - Migrate from product_id to material_id schema
-- =============================================================================

-- Strategy: Rename old table, create new one with correct schema, migrate data, drop old

-- Step 1: Rename old table (if it exists with old schema)
DROP TABLE IF EXISTS warehouse_stock_old;
ALTER TABLE warehouse_stock RENAME TO warehouse_stock_old;

-- Step 2: Create new table with correct schema (from 020 migration)
CREATE TABLE warehouse_stock (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL UNIQUE,
  material_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit TEXT NOT NULL DEFAULT 'm²',
  location_id TEXT,
  min_stock INTEGER NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  unit_cost REAL CHECK (unit_cost IS NULL OR unit_cost >= 0),
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('low', 'ok', 'overstock', 'reserved')),
  last_movement_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES warehouse_locations(id) ON DELETE SET NULL
);

-- Step 3: Migrate existing data (product_id → material_id)
INSERT INTO warehouse_stock (
  id,
  material_id,
  material_name,
  quantity,
  unit,
  location_id,
  min_stock,
  status,
  created_at,
  updated_at
)
SELECT 
  id,
  product_id as material_id,
  COALESCE(product_name, 'Unknown Material') as material_name,
  CAST(COALESCE(quantity, 0) AS INTEGER) as quantity,
  COALESCE(unit, 'm²') as unit,
  location_id,
  CAST(COALESCE(min_quantity, 0) AS INTEGER) as min_stock,
  'ok' as status,
  created_at,
  updated_at
FROM warehouse_stock_old
WHERE id IS NOT NULL;

-- Step 4: Drop old table
DROP TABLE warehouse_stock_old;

-- Step 5: Create indexes (now that material_id column exists)
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_material_id ON warehouse_stock(material_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_status ON warehouse_stock(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_location_id ON warehouse_stock(location_id);
