-- SPDX-License-Identifier: MIT
-- Migration: Fix warehouse_locations schema to align with 020
-- Description: Migrates warehouse_locations from legacy (010) schema to the new schema (adds zone, aisle, position, occupied, type consistency) so subsequent migrations succeed.
-- Database: SQLite
-- Created: 2025-12-20

-- =============================================================================
-- STRATEGY
-- =============================================================================
-- 1) Rename existing warehouse_locations to warehouse_locations_old
-- 2) Create new warehouse_locations with the expected columns
-- 3) Migrate data from old to new with safe defaults
-- 4) Drop old table
-- 5) Create required indexes

-- Step 0: Clean previous temp table if exists
DROP TABLE IF EXISTS warehouse_locations_old;

-- Step 1: Rename old table (will fail if not present; ensure table exists via 010)
ALTER TABLE warehouse_locations RENAME TO warehouse_locations_old;

-- Step 2: Create new table with expected schema (as used by WarehouseService and 020 migration)
CREATE TABLE warehouse_locations (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  zone TEXT NOT NULL,
  aisle TEXT,
  position TEXT,
  capacity REAL CHECK (capacity IS NULL OR capacity > 0),
  occupied REAL DEFAULT 0 CHECK (occupied >= 0),
  type TEXT DEFAULT 'standard' CHECK (type IN ('standard', 'pallet', 'shelf', 'bin', 'bulk')),
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Migrate existing data from old table
-- Map legacy columns: code, type, capacity, is_active, created_at, updated_at
-- Provide safe defaults for new NOT NULL column 'zone'
INSERT INTO warehouse_locations (
  id, code, zone, aisle, position, capacity, occupied, type, is_active, created_at, updated_at
)
SELECT
  id,
  code,
  COALESCE('A', 'A') as zone, -- default zone 'A'
  NULL as aisle,
  NULL as position,
  capacity,
  0 as occupied,
  COALESCE(type, 'standard') as type,
  COALESCE(is_active, 1) as is_active,
  created_at,
  updated_at
FROM warehouse_locations_old
WHERE id IS NOT NULL;

-- Step 4: Drop old table
DROP TABLE warehouse_locations_old;

-- Step 5: Create indexes required by newer migrations
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_code ON warehouse_locations(code);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_zone ON warehouse_locations(zone);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_is_active ON warehouse_locations(is_active);
