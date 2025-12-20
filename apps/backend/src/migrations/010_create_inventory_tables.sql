-- SPDX-License-Identifier: MIT
-- Migration: Create Inventory Management tables
-- Description: Creates tables for inventory items, stock movements, and warehouses

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit TEXT NOT NULL DEFAULT 'pcs',
  min_stock INTEGER NOT NULL DEFAULT 10 CHECK (min_stock >= 0),
  max_stock INTEGER CHECK (max_stock IS NULL OR max_stock >= min_stock),
  reorder_point INTEGER,
  price REAL CHECK (price IS NULL OR price >= 0),
  cost REAL CHECK (cost IS NULL OR cost >= 0),
  location TEXT,
  warehouse_id TEXT,
  supplier_id TEXT,
  barcode TEXT,
  weight REAL,
  dimensions TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'discontinued', 'out_of_stock')) DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stock movements table (for tracking inventory changes)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'transfer', 'return')),
  reason TEXT,
  reference TEXT,
  reference_type TEXT CHECK (reference_type IN ('purchase_order', 'sale_order', 'production', 'adjustment', 'transfer', 'return')),
  from_location TEXT,
  to_location TEXT,
  user_id TEXT,
  notes TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Warehouses/Locations table
CREATE TABLE IF NOT EXISTS inventory_warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  address TEXT,
  type TEXT CHECK (type IN ('main', 'secondary', 'transit', 'virtual')),
  capacity INTEGER,
  manager TEXT,
  is_active BOOLEAN DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stock levels per warehouse (for multi-warehouse support)
CREATE TABLE IF NOT EXISTS inventory_stock_levels (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) VIRTUAL,
  last_counted_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (item_id, warehouse_id),
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES inventory_warehouses(id) ON DELETE CASCADE
);

-- Inventory categories table
CREATE TABLE IF NOT EXISTS inventory_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES inventory_categories(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_timestamp ON inventory_movements(timestamp);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_levels_item ON inventory_stock_levels(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_levels_warehouse ON inventory_stock_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent ON inventory_categories(parent_id);

