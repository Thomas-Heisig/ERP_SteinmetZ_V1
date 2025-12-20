// SPDX-License-Identifier: MIT
// apps/backend/src/services/hrService.ts

/**
 * HR (Human Resources) Service
 *
 * Provides business logic and database operations for HR entities including
 * employees, contracts, time tracking, leave requests, and onboarding.
 *
 * @module services/hrService
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import {
  Employee,
  EmployeeCreateInput,
  EmployeeUpdateInput,
  EmployeeWithRelations,
  EmployeeFilters,
  Contract,
  ContractCreateInput,
  ContractUpdateInput,
  TimeEntry,
  TimeEntryCreateInput,
  LeaveRequest,
  LeaveRequestCreateInput,
  LeaveRequestStatus,
  Department,
  DepartmentCreateInput,
  OnboardingProcess,
  OnboardingProcessCreateInput,
  OnboardingProcessWithTasks,
  OnboardingTask,
  OnboardingTaskCreateInput,
  PayrollRecord,
  PayrollRecordCreateInput,
  PayrollTaxParams,
  PayrollTaxParamsCreateInput,
  EmployeeDocument,
  EmployeeDocumentUploadInput,
  OvertimeRecord,
  OvertimeRecordCreateInput,
  PaginationParams,
  PaginatedResponse,
  HRStatistics,
  EmployeeStatus,
  ContractStatus,
  OnboardingStatus,
  TaskStatus,
  PaymentStatus,
  SEPAStatus,
} from '../types/hr';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * HRService Class
 *
 * Manages all HR-related database operations
 */
export class HRService {
  private static instance: HRService;
  private db: Database.Database;

  private constructor() {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/dev.sqlite3');
    
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.db = new Database(dbPath);
    this.db.pragma('foreign_keys = ON');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): HRService {
    if (!HRService.instance) {
      HRService.instance = new HRService();
    }
    return HRService.instance;
  }

  // ==================== EMPLOYEE OPERATIONS ====================

  /**
   * Create a new employee
   */
  public createEmployee(input: EmployeeCreateInput): Employee {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_employees (
        id, employee_number, first_name, last_name, email, phone,
        department, position, start_date, end_date, status,
        address, city, postal_code, country, emergency_contact,
        emergency_phone, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.employee_number || null,
      input.first_name,
      input.last_name,
      input.email,
      input.phone || null,
      input.department || null,
      input.position,
      input.start_date,
      input.end_date || null,
      input.status || EmployeeStatus.ACTIVE,
      input.address || null,
      input.city || null,
      input.postal_code || null,
      input.country || 'Germany',
      input.emergency_contact || null,
      input.emergency_phone || null,
      input.notes || null,
      now,
      now
    );

    const employee = this.getEmployeeById(id);
    if (!employee) {
      throw new Error(`Failed to create employee with id ${id}`);
    }
    return employee;
  }

  /**
   * Get employee by ID
   */
  public getEmployeeById(id: string): Employee | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_employees WHERE id = ?');
    return stmt.get(id) as Employee | undefined;
  }

  /**
   * Get employee by email
   */
  public getEmployeeByEmail(email: string): Employee | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_employees WHERE email = ?');
    return stmt.get(email) as Employee | undefined;
  }

  /**
   * Get all employees with filters and pagination
   */
  public getEmployees(
    filters: EmployeeFilters = {},
    pagination: PaginationParams = {}
  ): PaginatedResponse<Employee> {
    const { page = 1, limit = 50, sort_by = 'last_name', sort_order = 'asc' } = pagination;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM hr_employees WHERE 1=1';
    const params: unknown[] = [];

    if (filters.department) {
      query += ' AND department = ?';
      params.push(filters.department);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.position) {
      query += ' AND position LIKE ?';
      params.push(`%${filters.position}%`);
    }

    if (filters.search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.start_date_from) {
      query += ' AND start_date >= ?';
      params.push(filters.start_date_from);
    }

    if (filters.start_date_to) {
      query += ' AND start_date <= ?';
      params.push(filters.start_date_to);
    }

    // Count total
    const countStmt = this.db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count'));
    const { count } = countStmt.get(...params) as { count: number };

    // Get paginated data
    query += ` ORDER BY ${sort_by} ${sort_order} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    const data = stmt.all(...params) as Employee[];

    return {
      data,
      total: count,
      page,
      limit,
      total_pages: Math.ceil(count / limit),
    };
  }

  /**
   * Update employee
   */
  public updateEmployee(id: string, input: EmployeeUpdateInput): Employee | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.getEmployeeById(id);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE hr_employees SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.getEmployeeById(id);
  }

  /**
   * Delete employee (soft delete by setting status to terminated)
   */
  public deleteEmployee(id: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE hr_employees 
      SET status = ?, end_date = ?, updated_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      EmployeeStatus.TERMINATED,
      new Date().toISOString().split('T')[0],
      new Date().toISOString(),
      id
    );

    return result.changes > 0;
  }

  /**
   * Get employee with all related data
   */
  public getEmployeeWithRelations(id: string): EmployeeWithRelations | undefined {
    const employee = this.getEmployeeById(id);
    if (!employee) return undefined;

    const contracts = this.getEmployeeContracts(id);
    const time_entries = this.getEmployeeTimeEntries(id);
    const leave_requests = this.getEmployeeLeaveRequests(id);
    const documents = this.getEmployeeDocuments(id);
    const overtime = this.getEmployeeOvertime(id);
    const payroll_records = this.getEmployeePayroll(id);
    const onboarding = this.getEmployeeOnboarding(id);

    const current_contract = contracts.find(c => c.status === ContractStatus.ACTIVE);

    return {
      ...employee,
      contracts,
      current_contract,
      time_entries,
      leave_requests,
      onboarding,
      documents,
      overtime,
      payroll_records,
    };
  }

  // ==================== CONTRACT OPERATIONS ====================

  /**
   * Create a contract
   */
  public createContract(input: ContractCreateInput): Contract {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_contracts (
        id, employee_id, type, start_date, end_date, salary,
        working_hours, vacation_days, probation_period, notice_period,
        status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.employee_id,
      input.type,
      input.start_date,
      input.end_date || null,
      input.salary,
      input.working_hours,
      input.vacation_days || 30,
      input.probation_period || null,
      input.notice_period || null,
      input.status || ContractStatus.ACTIVE,
      input.notes || null,
      now,
      now
    );

    const contract = this.getContractById(id);
    if (!contract) {
      throw new Error(`Failed to create contract with id ${id}`);
    }
    return contract;
  }

  /**
   * Get contract by ID
   */
  public getContractById(id: string): Contract | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_contracts WHERE id = ?');
    return stmt.get(id) as Contract | undefined;
  }

  /**
   * Get employee contracts
   */
  public getEmployeeContracts(employeeId: string): Contract[] {
    const stmt = this.db.prepare(`
      SELECT * FROM hr_contracts 
      WHERE employee_id = ? 
      ORDER BY start_date DESC
    `);
    return stmt.all(employeeId) as Contract[];
  }

  /**
   * Update contract
   */
  public updateContract(id: string, input: ContractUpdateInput): Contract | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.getContractById(id);
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE hr_contracts SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.getContractById(id);
  }

  // ==================== TIME ENTRY OPERATIONS ====================

  /**
   * Create time entry
   */
  public createTimeEntry(input: TimeEntryCreateInput): TimeEntry {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Calculate total hours
    const start = new Date(`${input.date}T${input.start_time}`);
    const end = new Date(`${input.date}T${input.end_time}`);
    const diffMs = end.getTime() - start.getTime();
    const totalHours = (diffMs / (1000 * 60 * 60)) - ((input.break_minutes || 0) / 60);

    const stmt = this.db.prepare(`
      INSERT INTO hr_time_entries (
        id, employee_id, date, start_time, end_time, break_minutes,
        total_hours, type, notes, approved, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.employee_id,
      input.date,
      input.start_time,
      input.end_time,
      input.break_minutes || 0,
      totalHours,
      input.type || 'regular',
      input.notes || null,
      false,
      now,
      now
    );

    const timeEntry = this.getTimeEntryById(id);
    if (!timeEntry) {
      throw new Error(`Failed to create time entry with id ${id}`);
    }
    return timeEntry;
  }

  /**
   * Get time entry by ID
   */
  public getTimeEntryById(id: string): TimeEntry | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_time_entries WHERE id = ?');
    return stmt.get(id) as TimeEntry | undefined;
  }

  /**
   * Get employee time entries
   */
  public getEmployeeTimeEntries(employeeId: string, startDate?: string, endDate?: string): TimeEntry[] {
    let query = 'SELECT * FROM hr_time_entries WHERE employee_id = ?';
    const params: unknown[] = [employeeId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC, start_time DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as TimeEntry[];
  }

  /**
   * Approve time entry
   */
  public approveTimeEntry(id: string, approvedBy: string): TimeEntry | undefined {
    const stmt = this.db.prepare(`
      UPDATE hr_time_entries 
      SET approved = ?, approved_by = ?, approved_at = ?, updated_at = ?
      WHERE id = ?
    `);

    const now = new Date().toISOString();
    stmt.run(true, approvedBy, now, now, id);

    return this.getTimeEntryById(id);
  }

  // ==================== LEAVE REQUEST OPERATIONS ====================

  /**
   * Create leave request
   */
  public createLeaveRequest(input: LeaveRequestCreateInput): LeaveRequest {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_leave_requests (
        id, employee_id, type, start_date, end_date, days,
        reason, status, notes, requested_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.employee_id,
      input.type,
      input.start_date,
      input.end_date,
      input.days,
      input.reason || null,
      LeaveRequestStatus.PENDING,
      input.notes || null,
      now,
      now
    );

    const leaveRequest = this.getLeaveRequestById(id);
    if (!leaveRequest) {
      throw new Error(`Failed to create leave request with id ${id}`);
    }
    return leaveRequest;
  }

  /**
   * Get leave request by ID
   */
  public getLeaveRequestById(id: string): LeaveRequest | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_leave_requests WHERE id = ?');
    return stmt.get(id) as LeaveRequest | undefined;
  }

  /**
   * Get employee leave requests
   */
  public getEmployeeLeaveRequests(employeeId: string, status?: LeaveRequestStatus): LeaveRequest[] {
    let query = 'SELECT * FROM hr_leave_requests WHERE employee_id = ?';
    const params: unknown[] = [employeeId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_date DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as LeaveRequest[];
  }

  /**
   * Approve leave request
   */
  public approveLeaveRequest(id: string, approvedBy: string): LeaveRequest | undefined {
    const stmt = this.db.prepare(`
      UPDATE hr_leave_requests 
      SET status = ?, approved_by = ?, approved_at = ?, updated_at = ?
      WHERE id = ?
    `);

    const now = new Date().toISOString();
    stmt.run(LeaveRequestStatus.APPROVED, approvedBy, now, now, id);

    return this.getLeaveRequestById(id);
  }

  /**
   * Reject leave request
   */
  public rejectLeaveRequest(id: string, approvedBy: string, reason: string): LeaveRequest | undefined {
    const stmt = this.db.prepare(`
      UPDATE hr_leave_requests 
      SET status = ?, approved_by = ?, approved_at = ?, rejection_reason = ?, updated_at = ?
      WHERE id = ?
    `);

    const now = new Date().toISOString();
    stmt.run(LeaveRequestStatus.REJECTED, approvedBy, now, reason, now, id);

    return this.getLeaveRequestById(id);
  }

  // ==================== DEPARTMENT OPERATIONS ====================

  /**
   * Create department
   */
  public createDepartment(input: DepartmentCreateInput): Department {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_departments (
        id, name, manager_id, description, budget, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.name,
      input.manager_id || null,
      input.description || null,
      input.budget || null,
      input.is_active !== false,
      now,
      now
    );

    const department = this.getDepartmentById(id);
    if (!department) {
      throw new Error(`Failed to create department with id ${id}`);
    }
    return department;
  }

  /**
   * Get department by ID
   */
  public getDepartmentById(id: string): Department | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_departments WHERE id = ?');
    return stmt.get(id) as Department | undefined;
  }

  /**
   * Get all departments
   */
  public getDepartments(activeOnly: boolean = true): Department[] {
    let query = 'SELECT * FROM hr_departments';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY name';

    const stmt = this.db.prepare(query);
    return stmt.all() as Department[];
  }

  // ==================== ONBOARDING OPERATIONS ====================

  /**
   * Create onboarding process
   */
  public createOnboarding(input: OnboardingProcessCreateInput): OnboardingProcess {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_onboarding (
        id, employee_id, start_date, mentor_id, status,
        completed_tasks, total_tasks, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.employee_id,
      input.start_date,
      input.mentor_id || null,
      OnboardingStatus.PENDING,
      0,
      0,
      input.notes || null,
      now,
      now
    );

    const onboarding = this.getOnboardingById(id);
    if (!onboarding) {
      throw new Error(`Failed to create onboarding with id ${id}`);
    }
    return onboarding;
  }

  /**
   * Get onboarding by ID
   */
  public getOnboardingById(id: string): OnboardingProcess | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_onboarding WHERE id = ?');
    return stmt.get(id) as OnboardingProcess | undefined;
  }

  /**
   * Get employee onboarding
   */
  public getEmployeeOnboarding(employeeId: string): OnboardingProcess | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_onboarding WHERE employee_id = ? ORDER BY created_at DESC LIMIT 1');
    return stmt.get(employeeId) as OnboardingProcess | undefined;
  }

  /**
   * Get onboarding with tasks
   */
  public getOnboardingWithTasks(id: string): OnboardingProcessWithTasks | undefined {
    const onboarding = this.getOnboardingById(id);
    if (!onboarding) return undefined;

    const tasks = this.getOnboardingTasks(id);
    const employee = this.getEmployeeById(onboarding.employee_id);
    const mentor = onboarding.mentor_id ? this.getEmployeeById(onboarding.mentor_id) : undefined;

    return {
      ...onboarding,
      tasks,
      employee,
      mentor,
    };
  }

  /**
   * Create onboarding task
   */
  public createOnboardingTask(input: OnboardingTaskCreateInput): OnboardingTask {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_onboarding_tasks (
        id, onboarding_id, title, description, status, due_date,
        assigned_to, sort_order, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.onboarding_id,
      input.title,
      input.description || null,
      TaskStatus.PENDING,
      input.due_date || null,
      input.assigned_to || null,
      input.sort_order || 0,
      input.notes || null,
      now,
      now
    );

    // Update total tasks count
    this.updateOnboardingTaskCounts(input.onboarding_id);

    const task = this.getOnboardingTaskById(id);
    if (!task) {
      throw new Error(`Failed to create onboarding task with id ${id}`);
    }
    return task;
  }

  /**
   * Get onboarding task by ID
   */
  public getOnboardingTaskById(id: string): OnboardingTask | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_onboarding_tasks WHERE id = ?');
    return stmt.get(id) as OnboardingTask | undefined;
  }

  /**
   * Get onboarding tasks
   */
  public getOnboardingTasks(onboardingId: string): OnboardingTask[] {
    const stmt = this.db.prepare(`
      SELECT * FROM hr_onboarding_tasks 
      WHERE onboarding_id = ? 
      ORDER BY sort_order, created_at
    `);
    return stmt.all(onboardingId) as OnboardingTask[];
  }

  /**
   * Complete onboarding task
   */
  public completeOnboardingTask(id: string, completedBy: string): OnboardingTask | undefined {
    const task = this.getOnboardingTaskById(id);
    if (!task) return undefined;

    const stmt = this.db.prepare(`
      UPDATE hr_onboarding_tasks 
      SET status = ?, completed_at = ?, completed_by = ?, updated_at = ?
      WHERE id = ?
    `);

    const now = new Date().toISOString();
    stmt.run(TaskStatus.COMPLETED, now, completedBy, now, id);

    // Update onboarding progress
    this.updateOnboardingTaskCounts(task.onboarding_id);

    return this.getOnboardingTaskById(id);
  }

  /**
   * Update onboarding task counts
   */
  private updateOnboardingTaskCounts(onboardingId: string): void {
    const tasks = this.getOnboardingTasks(onboardingId);
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;

    const stmt = this.db.prepare(`
      UPDATE hr_onboarding 
      SET completed_tasks = ?, total_tasks = ?, status = ?, updated_at = ?
      WHERE id = ?
    `);

    let status = OnboardingStatus.PENDING;
    if (completed > 0 && completed < tasks.length) {
      status = OnboardingStatus.IN_PROGRESS;
    } else if (completed === tasks.length && tasks.length > 0) {
      status = OnboardingStatus.COMPLETED;
    }

    stmt.run(completed, tasks.length, status, new Date().toISOString(), onboardingId);
  }

  // ==================== PAYROLL TAX PARAMETERS ====================

  /**
   * Get payroll tax parameters by year and country
   */
  public getPayrollTaxParams(year: number, countryCode: string = 'DE'): PayrollTaxParams | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_payroll_tax_params WHERE year = ? AND country_code = ?');
    return stmt.get(year, countryCode) as PayrollTaxParams | undefined;
  }

  /**
   * Create payroll tax parameters
   */
  public createPayrollTaxParams(input: PayrollTaxParamsCreateInput): PayrollTaxParams {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_payroll_tax_params (
        id, year, income_tax_rate, pension_insurance_rate, health_insurance_rate,
        unemployment_insurance_rate, church_tax_rate, solidarity_surcharge_rate,
        minimum_wage, tax_free_allowance, country_code, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.year,
      input.income_tax_rate,
      input.pension_insurance_rate,
      input.health_insurance_rate,
      input.unemployment_insurance_rate,
      input.church_tax_rate || 0.08,
      input.solidarity_surcharge_rate || 0.0055,
      input.minimum_wage,
      input.tax_free_allowance,
      input.country_code,
      input.notes || null,
      now,
      now
    );

    const params = this.getPayrollTaxParams(input.year, input.country_code);
    if (!params) {
      throw new Error(`Failed to create payroll tax parameters for ${input.year}`);
    }
    return params;
  }

  /**
   * Calculate payroll with automatic tax deductions
   */
  public calculatePayroll(input: PayrollRecordCreateInput): PayrollRecordCreateInput {
    const params = this.getPayrollTaxParams(input.year, 'DE');
    if (!params) {
      throw new Error(`No tax parameters found for year ${input.year}`);
    }

    const grossSalary = input.gross_salary + (input.bonuses || 0);

    // Calculate progressive deductions
    const incomeTax = input.income_tax || (grossSalary * params.income_tax_rate);
    const pensionInsurance = input.pension_insurance || (grossSalary * params.pension_insurance_rate);
    const healthInsurance = input.health_insurance || (grossSalary * params.health_insurance_rate);
    const unemploymentInsurance = input.unemployment_insurance || (grossSalary * params.unemployment_insurance_rate);
    const churchTax = input.church_tax || (incomeTax * params.church_tax_rate);
    const solidaritySurcharge = input.solidarity_surcharge || (incomeTax * params.solidarity_surcharge_rate);

    return {
      ...input,
      income_tax: incomeTax,
      pension_insurance: pensionInsurance,
      health_insurance: healthInsurance,
      unemployment_insurance: unemploymentInsurance,
      church_tax: churchTax,
      solidarity_surcharge: solidaritySurcharge,
    };
  }

  // ==================== PAYROLL OPERATIONS ====================

  /**
   * Create payroll record
   */
  public createPayrollRecord(input: PayrollRecordCreateInput): PayrollRecord {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Auto-calculate with tax params
    const calculated = this.calculatePayroll(input);

    // Calculate net salary
    const totalDeductions =
      (calculated.income_tax || 0) +
      (calculated.pension_insurance || 0) +
      (calculated.health_insurance || 0) +
      (calculated.unemployment_insurance || 0) +
      (calculated.church_tax || 0) +
      (calculated.solidarity_surcharge || 0) +
      (calculated.other_deductions || 0);

    const netSalary = input.gross_salary + (input.bonuses || 0) - totalDeductions;

    // Store tax params snapshot for audit trail
    const params = this.getPayrollTaxParams(input.year, 'DE');
    const paramsSnapshot = params ? JSON.stringify(params) : null;

    const stmt = this.db.prepare(`
      INSERT INTO hr_payroll (
        id, employee_id, month, year, gross_salary, net_salary,
        bonuses, income_tax, pension_insurance, health_insurance,
        unemployment_insurance, church_tax, solidarity_surcharge,
        other_deductions, payment_method, iban, bic, creditor_name,
        tax_params_snapshot, payment_status, sepa_status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.employee_id,
      input.month,
      input.year,
      input.gross_salary,
      netSalary,
      input.bonuses || 0,
      calculated.income_tax || 0,
      calculated.pension_insurance || 0,
      calculated.health_insurance || 0,
      calculated.unemployment_insurance || 0,
      calculated.church_tax || 0,
      calculated.solidarity_surcharge || 0,
      input.other_deductions || 0,
      input.payment_method || 'bank_transfer',
      input.iban || null,
      input.bic || null,
      input.creditor_name || null,
      paramsSnapshot,
      PaymentStatus.PENDING,
      SEPAStatus.DRAFT,
      input.notes || null,
      now,
      now
    );

    const payroll = this.getPayrollRecordById(id);
    if (!payroll) {
      throw new Error(`Failed to create payroll record with id ${id}`);
    }
    return payroll;
  }

  /**
   * Get payroll record by ID
   */
  public getPayrollRecordById(id: string): PayrollRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_payroll WHERE id = ?');
    return stmt.get(id) as PayrollRecord | undefined;
  }

  /**
   * Get employee payroll records with filtering
   */
  public getEmployeePayroll(employeeId: string, year?: number, month?: string): PayrollRecord[] {
    let query = 'SELECT * FROM hr_payroll WHERE employee_id = ?';
    const params: unknown[] = [employeeId];

    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }

    query += ' ORDER BY year DESC, month DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as PayrollRecord[];
  }

  // ==================== PAYROLL TAX PARAMETERS ====================

  /**
   * Get payroll tax parameters by year and country
   */
  public getPayrollTaxParams(year: number, countryCode: string = 'DE'): PayrollTaxParams | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_payroll_tax_params WHERE year = ? AND country_code = ?');
    return stmt.get(year, countryCode) as PayrollTaxParams | undefined;
  }

  /**
   * Create payroll tax parameters
   */
  public createPayrollTaxParams(input: PayrollTaxParamsCreateInput): PayrollTaxParams {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_payroll_tax_params (
        id, year, income_tax_rate, pension_insurance_rate, health_insurance_rate,
        unemployment_insurance_rate, church_tax_rate, solidarity_surcharge_rate,
        minimum_wage, tax_free_allowance, country_code, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.year,
      input.income_tax_rate,
      input.pension_insurance_rate,
      input.health_insurance_rate,
      input.unemployment_insurance_rate,
      input.church_tax_rate || 0.08,
      input.solidarity_surcharge_rate || 0.0055,
      input.minimum_wage,
      input.tax_free_allowance,
      input.country_code,
      input.notes || null,
      now,
      now
    );

    const params = this.getPayrollTaxParams(input.year, input.country_code);
    if (!params) {
      throw new Error(`Failed to create payroll tax parameters for ${input.year}`);
    }
    return params;
  }

  /**
   * Calculate payroll with automatic tax deductions
   */
  public calculatePayroll(input: PayrollRecordCreateInput): PayrollRecordCreateInput {
    const params = this.getPayrollTaxParams(input.year, 'DE');
    if (!params) {
      throw new Error(`No tax parameters found for year ${input.year}`);
    }

    const grossSalary = input.gross_salary + (input.bonuses || 0);

    // Calculate progressive deductions
    const incomeTax = input.income_tax || (grossSalary * params.income_tax_rate);
    const pensionInsurance = input.pension_insurance || (grossSalary * params.pension_insurance_rate);
    const healthInsurance = input.health_insurance || (grossSalary * params.health_insurance_rate);
    const unemploymentInsurance = input.unemployment_insurance || (grossSalary * params.unemployment_insurance_rate);
    const churchTax = input.church_tax || (incomeTax * params.church_tax_rate);
    const solidaritySurcharge = input.solidarity_surcharge || (incomeTax * params.solidarity_surcharge_rate);

    return {
      ...input,
      income_tax: incomeTax,
      pension_insurance: pensionInsurance,
      health_insurance: healthInsurance,
      unemployment_insurance: unemploymentInsurance,
      church_tax: churchTax,
      solidarity_surcharge: solidaritySurcharge,
    };
  }

  /**
   * Create payroll record with calculation
   */
  public createPayrollRecord(input: PayrollRecordCreateInput): PayrollRecord {
    const id = uuidv4();
    const now = new Date().toISOString();

    // Auto-calculate with tax params
    const calculated = this.calculatePayroll(input);

    // Calculate net salary
    const totalDeductions =
      (calculated.income_tax || 0) +
      (calculated.pension_insurance || 0) +
      (calculated.health_insurance || 0) +
      (calculated.unemployment_insurance || 0) +
      (calculated.church_tax || 0) +
      (calculated.solidarity_surcharge || 0) +
      (calculated.other_deductions || 0);

    const netSalary = input.gross_salary + (input.bonuses || 0) - totalDeductions;

    // Store tax params snapshot for audit trail
    const params = this.getPayrollTaxParams(input.year, 'DE');
    const paramsSnapshot = params ? JSON.stringify(params) : null;

    const stmt = this.db.prepare(`
      INSERT INTO hr_payroll (
        id, employee_id, month, year, gross_salary, net_salary,
        bonuses, income_tax, pension_insurance, health_insurance,
        unemployment_insurance, church_tax, solidarity_surcharge,
        other_deductions, payment_method, iban, bic, creditor_name,
        tax_params_snapshot, payment_status, sepa_status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.employee_id,
      input.month,
      input.year,
      input.gross_salary,
      netSalary,
      input.bonuses || 0,
      calculated.income_tax || 0,
      calculated.pension_insurance || 0,
      calculated.health_insurance || 0,
      calculated.unemployment_insurance || 0,
      calculated.church_tax || 0,
      calculated.solidarity_surcharge || 0,
      input.other_deductions || 0,
      input.payment_method || 'bank_transfer',
      input.iban || null,
      input.bic || null,
      input.creditor_name || null,
      paramsSnapshot,
      PaymentStatus.PENDING,
      SEPAStatus.DRAFT,
      input.notes || null,
      now,
      now
    );

    const payroll = this.getPayrollRecordById(id);
    if (!payroll) {
      throw new Error(`Failed to create payroll record with id ${id}`);
    }
    return payroll;
  }

  /**
   * Get payroll record by ID
   */
  public getPayrollRecordById(id: string): PayrollRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_payroll WHERE id = ?');
    return stmt.get(id) as PayrollRecord | undefined;
  }

  /**
   * Get employee payroll records with filtering
   */
  public getEmployeePayroll(employeeId: string, year?: number, month?: string): PayrollRecord[] {
    let query = 'SELECT * FROM hr_payroll WHERE employee_id = ?';
    const params: unknown[] = [employeeId];

    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }

    if (month) {
      query += ' AND month = ?';
      params.push(month);
    }

    query += ' ORDER BY year DESC, month DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as PayrollRecord[];
  }

  /**
   * Get all payroll records for period with pagination
   */
  public getPayrollRecords(year: number, month?: string, pagination?: PaginationParams): PaginatedResponse<PayrollRecord> {
    let query = 'SELECT * FROM hr_payroll WHERE year = ?';
    const params: unknown[] = [year];

    if (month) {
      query += ' AND month = ?';
      params.push(month);
    }

    const countStmt = this.db.prepare(query);
    const total = (countStmt.all(...params) as PayrollRecord[]).length;

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    query += ' ORDER BY month DESC, employee_id ASC LIMIT ? OFFSET ?';
    const stmt = this.db.prepare(query);
    const data = stmt.all(...params, limit, offset) as PayrollRecord[];

    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Export payroll as CSV
   */
  public exportPayrollAsCSV(year: number, month?: string): string {
    const records = this.getEmployeePayroll('', year, month);
    
    // Get all payroll records for the period
    const allRecords = this.db.prepare(`
      SELECT p.*, e.first_name, e.last_name, e.employee_number
      FROM hr_payroll p
      JOIN hr_employees e ON p.employee_id = e.id
      WHERE p.year = ?
      ${month ? 'AND p.month = ?' : ''}
      ORDER BY p.month DESC, e.employee_number ASC
    `).all(...(month ? [year, month] : [year])) as (PayrollRecord & { first_name: string; last_name: string; employee_number: string })[];

    // CSV Header
    const header = [
      'Employee Number',
      'First Name',
      'Last Name',
      'Month',
      'Year',
      'Gross Salary',
      'Bonuses',
      'Income Tax',
      'Pension Insurance',
      'Health Insurance',
      'Unemployment Insurance',
      'Church Tax',
      'Solidarity Surcharge',
      'Other Deductions',
      'Net Salary',
      'Payment Status',
      'Payment Date',
    ].join(',');

    // CSV Rows
    const rows = allRecords.map(r =>
      [
        `"${r.employee_number || ''}"`,
        `"${r.first_name}"`,
        `"${r.last_name}"`,
        r.month,
        r.year,
        r.gross_salary.toFixed(2),
        r.bonuses.toFixed(2),
        (r.income_tax || 0).toFixed(2),
        (r.pension_insurance || 0).toFixed(2),
        (r.health_insurance || 0).toFixed(2),
        (r.unemployment_insurance || 0).toFixed(2),
        (r.church_tax || 0).toFixed(2),
        (r.solidarity_surcharge || 0).toFixed(2),
        (r.other_deductions || 0).toFixed(2),
        r.net_salary.toFixed(2),
        r.payment_status,
        r.payment_date || '',
      ].join(',')
    );

    return [header, ...rows].join('\n');
  }

  /**
   * Export payroll as SEPA pain.001.001.03 XML
   */
  public exportPayrollAsSEPA(year: number, month: string, companyName: string, companyIBAN: string, companyBIC: string): string {
    const records = this.db.prepare(`
      SELECT p.*, e.first_name, e.last_name, e.employee_number
      FROM hr_payroll p
      JOIN hr_employees e ON p.employee_id = e.id
      WHERE p.year = ? AND p.month = ?
      AND p.iban IS NOT NULL
      AND p.creditor_name IS NOT NULL
      ORDER BY e.employee_number ASC
    `).all(year, month) as (PayrollRecord & { first_name: string; last_name: string; employee_number: string })[];

    const messageId = uuidv4();
    const creationDateTime = new Date().toISOString();
    const totalAmount = records.reduce((sum, r) => sum + r.net_salary, 0).toFixed(2);
    const paymentDate = `${year}-${month.padStart(2, '0')}-01`;

    // Generate SEPA XML (pain.001.001.03)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${messageId}</MsgId>
      <CreDtTm>${creationDateTime}</CreDtTm>
      <NbOfTxns>${records.length}</NbOfTxns>
      <CtrlSum>${totalAmount}</CtrlSum>
      <InitgPty>
        <Nm>${this.escapeXML(companyName)}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${messageId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <NbOfTxns>${records.length}</NbOfTxns>
      <CtrlSum>${totalAmount}</CtrlSum>
      <PmtTpInf>
        <InstrPrty>NORM</InstrPrty>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
      </PmtTpInf>
      <ReqdExctnDt>${paymentDate}</ReqdExctnDt>
      <Debtr>
        <Nm>${this.escapeXML(companyName)}</Nm>
      </Debtr>
      <DbtrAcct>
        <Id>
          <IBAN>${companyIBAN}</IBAN>
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BIC>${companyBIC}</BIC>
        </FinInstnId>
      </DbtrAgt>
      <CdtTrfTxInf>
${records.map((r, idx) => `        <CdtTrfTxInf>
          <PmtId>
            <InstrId>${messageId}-${idx + 1}</InstrId>
            <EndToEndId>${r.employee_number || r.id}</EndToEndId>
          </PmtId>
          <Amt>
            <InstdAmt Ccy="EUR">${r.net_salary.toFixed(2)}</InstdAmt>
          </Amt>
          <CdtrAgt>
            <FinInstnId>
              <BIC>${r.bic || 'NOTPROVIDED'}</BIC>
            </FinInstnId>
          </CdtrAgt>
          <Cdtr>
            <Nm>${this.escapeXML(`${r.first_name} ${r.last_name}`)}</Nm>
          </Cdtr>
          <CdtrAcct>
            <Id>
              <IBAN>${r.iban}</IBAN>
            </Id>
          </CdtrAcct>
          <RmtInf>
            <Ustrd>Lohnabrechnung ${month}/${year}</Ustrd>
          </RmtInf>
        </CdtTrfTxInf>`).join('\n')}
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;

    return xml;
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // ==================== DOCUMENT OPERATIONS ====================

  /**
   * Create employee document
   */
  public createEmployeeDocument(input: EmployeeDocumentUploadInput, filePath?: string, fileName?: string, fileSize?: number, mimeType?: string, uploadedBy?: string): EmployeeDocument {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_employee_documents (
        id, employee_id, type, title, file_path, file_name,
        file_size, mime_type, uploaded_by, uploaded_at, expires_at, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.employee_id,
      input.type || null,
      input.title,
      filePath || null,
      fileName || null,
      fileSize || null,
      mimeType || null,
      uploadedBy || null,
      now,
      input.expires_at || null,
      input.notes || null
    );

    const document = this.getEmployeeDocumentById(id);
    if (!document) {
      throw new Error(`Failed to create employee document with id ${id}`);
    }
    return document;
  }

  /**
   * Get employee document by ID
   */
  public getEmployeeDocumentById(id: string): EmployeeDocument | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_employee_documents WHERE id = ?');
    return stmt.get(id) as EmployeeDocument | undefined;
  }

  /**
   * Get employee documents
   */
  public getEmployeeDocuments(employeeId: string): EmployeeDocument[] {
    const stmt = this.db.prepare(`
      SELECT * FROM hr_employee_documents 
      WHERE employee_id = ? 
      ORDER BY uploaded_at DESC
    `);
    return stmt.all(employeeId) as EmployeeDocument[];
  }

  // ==================== OVERTIME OPERATIONS ====================

  /**
   * Create overtime record
   */
  public createOvertimeRecord(input: OvertimeRecordCreateInput): OvertimeRecord {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO hr_overtime (
        id, employee_id, date, hours, reason, approved,
        compensated, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.employee_id,
      input.date,
      input.hours,
      input.reason || null,
      false,
      false,
      input.notes || null,
      now,
      now
    );

    const overtime = this.getOvertimeRecordById(id);
    if (!overtime) {
      throw new Error(`Failed to create overtime record with id ${id}`);
    }
    return overtime;
  }

  /**
   * Get overtime record by ID
   */
  public getOvertimeRecordById(id: string): OvertimeRecord | undefined {
    const stmt = this.db.prepare('SELECT * FROM hr_overtime WHERE id = ?');
    return stmt.get(id) as OvertimeRecord | undefined;
  }

  /**
   * Get employee overtime records
   */
  public getEmployeeOvertime(employeeId: string, approved?: boolean): OvertimeRecord[] {
    let query = 'SELECT * FROM hr_overtime WHERE employee_id = ?';
    const params: unknown[] = [employeeId];

    if (approved !== undefined) {
      query += ' AND approved = ?';
      params.push(approved);
    }

    query += ' ORDER BY date DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as OvertimeRecord[];
  }

  /**
   * Approve overtime
   */
  public approveOvertime(id: string, approvedBy: string): OvertimeRecord | undefined {
    const stmt = this.db.prepare(`
      UPDATE hr_overtime 
      SET approved = ?, approved_by = ?, approved_at = ?, updated_at = ?
      WHERE id = ?
    `);

    const now = new Date().toISOString();
    stmt.run(true, approvedBy, now, now, id);

    return this.getOvertimeRecordById(id);
  }

  // ==================== STATISTICS ====================

  /**
   * Get HR statistics
   */
  public getStatistics(): HRStatistics {
    const totalEmployees = this.db.prepare('SELECT COUNT(*) as count FROM hr_employees').get() as { count: number };
    const activeEmployees = this.db.prepare('SELECT COUNT(*) as count FROM hr_employees WHERE status = ?').get(EmployeeStatus.ACTIVE) as { count: number };
    const onLeaveEmployees = this.db.prepare('SELECT COUNT(*) as count FROM hr_employees WHERE status = ?').get(EmployeeStatus.ON_LEAVE) as { count: number };
    const terminatedEmployees = this.db.prepare('SELECT COUNT(*) as count FROM hr_employees WHERE status = ?').get(EmployeeStatus.TERMINATED) as { count: number };
    const pendingLeaveRequests = this.db.prepare('SELECT COUNT(*) as count FROM hr_leave_requests WHERE status = ?').get(LeaveRequestStatus.PENDING) as { count: number };
    const approvedLeaveRequests = this.db.prepare('SELECT COUNT(*) as count FROM hr_leave_requests WHERE status = ?').get(LeaveRequestStatus.APPROVED) as { count: number };
    const totalDepartments = this.db.prepare('SELECT COUNT(*) as count FROM hr_departments WHERE is_active = true').get() as { count: number };
    const pendingOnboarding = this.db.prepare('SELECT COUNT(*) as count FROM hr_onboarding WHERE status = ?').get(OnboardingStatus.PENDING) as { count: number };
    const completedOnboarding = this.db.prepare('SELECT COUNT(*) as count FROM hr_onboarding WHERE status = ?').get(OnboardingStatus.COMPLETED) as { count: number };

    return {
      total_employees: totalEmployees.count,
      active_employees: activeEmployees.count,
      on_leave_employees: onLeaveEmployees.count,
      terminated_employees: terminatedEmployees.count,
      pending_leave_requests: pendingLeaveRequests.count,
      approved_leave_requests: approvedLeaveRequests.count,
      total_departments: totalDepartments.count,
      pending_onboarding: pendingOnboarding.count,
      completed_onboarding: completedOnboarding.count,
    };
  }
}

// Export singleton instance
export default HRService.getInstance();
