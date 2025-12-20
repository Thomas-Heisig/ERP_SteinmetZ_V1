-- SPDX-License-Identifier: MIT
-- Migration: Add missing columns to CRM and Calendar tables
-- Description: Adds missing columns to CRM and Calendar tables if they don't exist
-- Database: SQLite
-- Created: 2025-12-20

-- =============================================================================
-- CRM_CUSTOMERS - Add missing columns (if they don't already exist)
-- =============================================================================

-- These ALT ER TABLE commands will silently succeed if columns already exist
-- SQLite in strict mode would error, but the migration handler catches those
ALTER TABLE crm_customers ADD COLUMN city TEXT;
ALTER TABLE crm_customers ADD COLUMN postal_code TEXT;
ALTER TABLE crm_customers ADD COLUMN country TEXT;
ALTER TABLE crm_customers ADD COLUMN industry TEXT;
ALTER TABLE crm_customers ADD COLUMN website TEXT;
ALTER TABLE crm_customers ADD COLUMN tax_id TEXT;
ALTER TABLE crm_customers ADD COLUMN assigned_to TEXT;
ALTER TABLE crm_customers ADD COLUMN created_by TEXT;

-- =============================================================================
-- CALENDAR_EVENTS - Ensure all required columns exist (add only missing ones)
-- =============================================================================

-- Create table if it doesn't exist with full schema
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  all_day INTEGER DEFAULT 0,
  color TEXT,
  category TEXT,
  recurrence TEXT DEFAULT 'none',
  recurrence_end_date TEXT,
  reminders_json TEXT DEFAULT '[]',
  attendees_json TEXT DEFAULT '[]',
  status TEXT DEFAULT 'confirmed',
  priority TEXT DEFAULT 'normal',
  timezone TEXT DEFAULT 'UTC',
  is_private INTEGER DEFAULT 0,
  url TEXT,
  organizer TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Add missing columns to calendar_events (safe - errors will be caught by migration handler)
-- Only add the essential ones that might be missing
ALTER TABLE calendar_events ADD COLUMN status TEXT DEFAULT 'confirmed';
ALTER TABLE calendar_events ADD COLUMN priority TEXT DEFAULT 'normal';
ALTER TABLE calendar_events ADD COLUMN timezone TEXT DEFAULT 'UTC';

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================

-- CRM Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_status ON crm_customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_category ON crm_customers(category);
CREATE INDEX IF NOT EXISTS idx_customers_assigned ON crm_customers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customers_email ON crm_customers(email);

-- Calendar Events indexes
CREATE INDEX IF NOT EXISTS idx_events_start ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_end ON calendar_events(end_time);
CREATE INDEX IF NOT EXISTS idx_events_category ON calendar_events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON calendar_events(created_by);
