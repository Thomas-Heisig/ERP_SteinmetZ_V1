-- SPDX-License-Identifier: MIT
-- Migration: Create HR (Human Resources) tables
-- Description: Creates tables for employees, time entries, leave requests, contracts, onboarding, and payroll

-- Employees table
CREATE TABLE IF NOT EXISTS hr_employees (
  id TEXT PRIMARY KEY,
  employee_number TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT,
  position TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'on_leave', 'terminated')) DEFAULT 'active',
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Deutschland',
  emergency_contact TEXT,
  emergency_phone TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Employment contracts table
CREATE TABLE IF NOT EXISTS hr_contracts (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('permanent', 'temporary', 'freelance', 'internship')),
  start_date TEXT NOT NULL,
  end_date TEXT,
  salary REAL NOT NULL CHECK (salary >= 0),
  working_hours REAL NOT NULL CHECK (working_hours > 0 AND working_hours <= 80),
  vacation_days INTEGER NOT NULL DEFAULT 30 CHECK (vacation_days >= 0 AND vacation_days <= 50),
  probation_period INTEGER CHECK (probation_period >= 0 AND probation_period <= 12),
  notice_period INTEGER CHECK (notice_period >= 0 AND notice_period <= 12),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'terminated')) DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
);

-- Time entries table (clock in/out, overtime)
CREATE TABLE IF NOT EXISTS hr_time_entries (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  break_minutes INTEGER NOT NULL DEFAULT 0 CHECK (break_minutes >= 0),
  total_hours REAL,
  type TEXT CHECK (type IN ('regular', 'overtime', 'sick', 'vacation', 'holiday')) DEFAULT 'regular',
  notes TEXT,
  approved BOOLEAN DEFAULT 0,
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS hr_leave_requests (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'unpaid', 'parental', 'compensatory')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  days INTEGER NOT NULL CHECK (days > 0),
  reason TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  approved_by TEXT,
  approved_at TEXT,
  rejection_reason TEXT,
  notes TEXT,
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
);

-- Departments table
CREATE TABLE IF NOT EXISTS hr_departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  manager_id TEXT,
  description TEXT,
  budget REAL,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (manager_id) REFERENCES hr_employees(id) ON DELETE SET NULL
);

-- Onboarding processes table
CREATE TABLE IF NOT EXISTS hr_onboarding (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  mentor_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_tasks INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  completion_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES hr_employees(id) ON DELETE SET NULL
);

-- Onboarding tasks table
CREATE TABLE IF NOT EXISTS hr_onboarding_tasks (
  id TEXT PRIMARY KEY,
  onboarding_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) DEFAULT 'pending',
  due_date TEXT,
  assigned_to TEXT,
  completed_at TEXT,
  completed_by TEXT,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (onboarding_id) REFERENCES hr_onboarding(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES hr_employees(id) ON DELETE SET NULL
);

-- Payroll records table
CREATE TABLE IF NOT EXISTS hr_payroll (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  gross_salary REAL NOT NULL CHECK (gross_salary >= 0),
  net_salary REAL NOT NULL CHECK (net_salary >= 0),
  bonuses REAL DEFAULT 0 CHECK (bonuses >= 0),
  income_tax REAL DEFAULT 0 CHECK (income_tax >= 0),
  pension_insurance REAL DEFAULT 0 CHECK (pension_insurance >= 0),
  health_insurance REAL DEFAULT 0 CHECK (health_insurance >= 0),
  unemployment_insurance REAL DEFAULT 0 CHECK (unemployment_insurance >= 0),
  other_deductions REAL DEFAULT 0 CHECK (other_deductions >= 0),
  paid BOOLEAN DEFAULT 0,
  payment_date TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (employee_id, month, year),
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
);

-- Employee documents table
CREATE TABLE IF NOT EXISTS hr_employee_documents (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  type TEXT CHECK (type IN ('contract', 'certificate', 'id', 'passport', 'diploma', 'reference', 'other')),
  title TEXT NOT NULL,
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by TEXT,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  notes TEXT,
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
);

-- Overtime tracking table
CREATE TABLE IF NOT EXISTS hr_overtime (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  date TEXT NOT NULL,
  hours REAL NOT NULL CHECK (hours > 0),
  reason TEXT,
  approved BOOLEAN DEFAULT 0,
  approved_by TEXT,
  approved_at TEXT,
  compensated BOOLEAN DEFAULT 0,
  compensated_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hr_employees_department ON hr_employees(department);
CREATE INDEX IF NOT EXISTS idx_hr_employees_status ON hr_employees(status);
CREATE INDEX IF NOT EXISTS idx_hr_employees_email ON hr_employees(email);
CREATE INDEX IF NOT EXISTS idx_hr_contracts_employee ON hr_contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_time_entries_employee ON hr_time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_time_entries_date ON hr_time_entries(date);
CREATE INDEX IF NOT EXISTS idx_hr_leave_requests_employee ON hr_leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_leave_requests_status ON hr_leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_hr_onboarding_employee ON hr_onboarding(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_onboarding_tasks_onboarding ON hr_onboarding_tasks(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_hr_payroll_employee ON hr_payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_employee_documents_employee ON hr_employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_overtime_employee ON hr_overtime(employee_id);
