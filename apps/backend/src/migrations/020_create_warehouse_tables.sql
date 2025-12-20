-- SPDX-License-Identifier: MIT
-- Migration: Create Warehouse Management Tables
-- Description: Creates tables for warehouse operations including picking, shipments, and inventory counts
-- Database: SQLite
-- Created: 2025-12-20

-- =============================================================================
-- WAREHOUSE STOCK ITEMS (Extended Inventory)
-- =============================================================================
-- NOTE: Table creation moved to 053_fix_warehouse_stock_schema.sql
-- This migration now only handles dependent tables

-- Table and indexes created by migration 053_fix_warehouse_stock_schema.sql

-- =============================================================================
-- WAREHOUSE STOCK MOVEMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_stock_movements (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL,
  material_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('incoming', 'outgoing', 'transfer', 'adjustment')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  from_location_id TEXT,
  to_location_id TEXT,
  reference TEXT,
  reference_type TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES warehouse_stock(material_id) ON DELETE CASCADE,
  FOREIGN KEY (from_location_id) REFERENCES warehouse_locations(id) ON DELETE SET NULL,
  FOREIGN KEY (to_location_id) REFERENCES warehouse_locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_warehouse_stock_movements_material_id ON warehouse_stock_movements(material_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_movements_type ON warehouse_stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_movements_created_at ON warehouse_stock_movements(created_at);

-- =============================================================================
-- WAREHOUSE LOCATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_locations (
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

CREATE INDEX IF NOT EXISTS idx_warehouse_locations_code ON warehouse_locations(code);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_zone ON warehouse_locations(zone);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_is_active ON warehouse_locations(is_active);

-- =============================================================================
-- WAREHOUSE PICKING LISTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_picking_lists (
  id TEXT PRIMARY KEY,
  picking_number TEXT NOT NULL UNIQUE,
  order_id TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  picker_id TEXT,
  items_count INTEGER DEFAULT 0,
  completed_items_count INTEGER DEFAULT 0,
  completed_at TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warehouse_picking_lists_order_id ON warehouse_picking_lists(order_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_picking_lists_status ON warehouse_picking_lists(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_picking_lists_picker_id ON warehouse_picking_lists(picker_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_picking_lists_created_at ON warehouse_picking_lists(created_at);

-- =============================================================================
-- WAREHOUSE PICKING ITEMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_picking_items (
  id TEXT PRIMARY KEY,
  picking_list_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  material_name TEXT,
  quantity_required INTEGER NOT NULL CHECK (quantity_required > 0),
  quantity_picked INTEGER DEFAULT 0 CHECK (quantity_picked >= 0),
  location_id TEXT,
  is_picked INTEGER DEFAULT 0,
  picked_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (picking_list_id) REFERENCES warehouse_picking_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (material_id) REFERENCES warehouse_stock(material_id) ON DELETE SET NULL,
  FOREIGN KEY (location_id) REFERENCES warehouse_locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_warehouse_picking_items_picking_list_id ON warehouse_picking_items(picking_list_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_picking_items_material_id ON warehouse_picking_items(material_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_picking_items_is_picked ON warehouse_picking_items(is_picked);

-- =============================================================================
-- WAREHOUSE SHIPMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_shipments (
  id TEXT PRIMARY KEY,
  shipment_number TEXT NOT NULL UNIQUE,
  order_id TEXT,
  carrier TEXT,
  tracking_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared', 'ready_for_shipment', 'in_transit', 'delivered', 'cancelled')),
  weight_kg REAL CHECK (weight_kg IS NULL OR weight_kg > 0),
  dimensions TEXT,
  total_packages INTEGER DEFAULT 0,
  shipped_date TEXT,
  delivered_date TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warehouse_shipments_order_id ON warehouse_shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_shipments_status ON warehouse_shipments(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_shipments_tracking_number ON warehouse_shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_warehouse_shipments_created_at ON warehouse_shipments(created_at);

-- =============================================================================
-- WAREHOUSE SHIPMENT TRACKING
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_shipment_tracking (
  id TEXT PRIMARY KEY,
  shipment_id TEXT NOT NULL,
  event_timestamp TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shipment_id) REFERENCES warehouse_shipments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_warehouse_shipment_tracking_shipment_id ON warehouse_shipment_tracking(shipment_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_shipment_tracking_event_timestamp ON warehouse_shipment_tracking(event_timestamp);

-- =============================================================================
-- WAREHOUSE INVENTORY COUNTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_inventory_counts (
  id TEXT PRIMARY KEY,
  count_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'full' CHECK (type IN ('full', 'spot_check', 'cycle')),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  location_ids TEXT,
  scheduled_date TEXT,
  started_at TEXT,
  completed_date TEXT,
  created_by TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_counts_type ON warehouse_inventory_counts(type);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_counts_status ON warehouse_inventory_counts(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_counts_created_at ON warehouse_inventory_counts(created_at);

-- =============================================================================
-- WAREHOUSE ANALYTICS (MATERIALIZED VIEW - simulated with table)
-- =============================================================================

CREATE TABLE IF NOT EXISTS warehouse_analytics (
  id TEXT PRIMARY KEY,
  metric_date TEXT NOT NULL,
  total_items INTEGER DEFAULT 0,
  total_value REAL DEFAULT 0,
  low_stock_items INTEGER DEFAULT 0,
  turnover_rate REAL DEFAULT 0,
  fill_rate REAL DEFAULT 0,
  inventory_accuracy REAL DEFAULT 100,
  avg_pick_time REAL DEFAULT 0,
  orders_shipped_today INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(metric_date)
);

CREATE INDEX IF NOT EXISTS idx_warehouse_analytics_metric_date ON warehouse_analytics(metric_date);

-- =============================================================================
-- DATA INSERTION EXAMPLES (idempotent)
-- =============================================================================

-- Insert default warehouse locations
INSERT OR IGNORE INTO warehouse_locations (id, code, zone, aisle, position, capacity, type, is_active)
VALUES 
  ('loc-001', 'A-01', 'A', '01', '01', 1000, 'standard', 1),
  ('loc-002', 'A-02', 'A', '01', '02', 1000, 'standard', 1),
  ('loc-003', 'B-01', 'B', '02', '01', 1500, 'pallet', 1),
  ('loc-004', 'C-01', 'C', '03', '01', 2000, 'bulk', 1);

-- End of migration
