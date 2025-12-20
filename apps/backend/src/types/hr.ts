// SPDX-License-Identifier: MIT
// apps/backend/src/types/hr.ts

/**
 * HR (Human Resources) Module Type Definitions
 *
 * Defines strict TypeScript interfaces for HR entities including employees,
 * contracts, time tracking, leave requests, onboarding, and payroll.
 *
 * @module types/hr
 */

/**
 * Employee Status
 */
export enum EmployeeStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

/**
 * Contract Type
 */
export enum ContractType {
  PERMANENT = 'permanent',
  TEMPORARY = 'temporary',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
}

/**
 * Contract Status
 */
export enum ContractStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
}

/**
 * Leave Request Type
 */
export enum LeaveRequestType {
  VACATION = 'vacation',
  SICK = 'sick',
  UNPAID = 'unpaid',
  PARENTAL = 'parental',
  COMPENSATORY = 'compensatory',
}

/**
 * Leave Request Status
 */
export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

/**
 * Time Entry Type
 */
export enum TimeEntryType {
  REGULAR = 'regular',
  OVERTIME = 'overtime',
  SICK = 'sick',
  VACATION = 'vacation',
  HOLIDAY = 'holiday',
}

/**
 * Onboarding Status
 */
export enum OnboardingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Task Status
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

/**
 * Document Type
 */
export enum DocumentType {
  CONTRACT = 'contract',
  CERTIFICATE = 'certificate',
  ID = 'id',
  PASSPORT = 'passport',
  DIPLOMA = 'diploma',
  REFERENCE = 'reference',
  OTHER = 'other',
}

/**
 * Payment Method
 */
export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check',
  PAYPAL = 'paypal',
}

/**
 * Employee entity
 */
export interface Employee {
  id: string;
  employee_number?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position: string;
  start_date: string;
  end_date?: string;
  status: EmployeeStatus;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Employee Create DTO
 */
export interface EmployeeCreateInput {
  employee_number?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position: string;
  start_date: string;
  end_date?: string;
  status?: EmployeeStatus;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
}

/**
 * Employee Update DTO
 */
export interface EmployeeUpdateInput {
  employee_number?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  status?: EmployeeStatus;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
}

/**
 * Employment Contract entity
 */
export interface Contract {
  id: string;
  employee_id: string;
  type: ContractType;
  start_date: string;
  end_date?: string;
  salary: number;
  working_hours: number;
  vacation_days: number;
  probation_period?: number;
  notice_period?: number;
  status: ContractStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Contract Create DTO
 */
export interface ContractCreateInput {
  employee_id: string;
  type: ContractType;
  start_date: string;
  end_date?: string;
  salary: number;
  working_hours: number;
  vacation_days?: number;
  probation_period?: number;
  notice_period?: number;
  status?: ContractStatus;
  notes?: string;
}

/**
 * Contract Update DTO
 */
export interface ContractUpdateInput {
  type?: ContractType;
  start_date?: string;
  end_date?: string;
  salary?: number;
  working_hours?: number;
  vacation_days?: number;
  probation_period?: number;
  notice_period?: number;
  status?: ContractStatus;
  notes?: string;
}

/**
 * Time Entry entity
 */
export interface TimeEntry {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  total_hours?: number;
  type: TimeEntryType;
  notes?: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Time Entry Create DTO
 */
export interface TimeEntryCreateInput {
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes?: number;
  type?: TimeEntryType;
  notes?: string;
}

/**
 * Leave Request entity
 */
export interface LeaveRequest {
  id: string;
  employee_id: string;
  type: LeaveRequestType;
  start_date: string;
  end_date: string;
  days: number;
  reason?: string;
  status: LeaveRequestStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  requested_at: string;
  updated_at: string;
}

/**
 * Leave Request Create DTO
 */
export interface LeaveRequestCreateInput {
  employee_id: string;
  type: LeaveRequestType;
  start_date: string;
  end_date: string;
  days: number;
  reason?: string;
  notes?: string;
}

/**
 * Department entity
 */
export interface Department {
  id: string;
  name: string;
  manager_id?: string;
  description?: string;
  budget?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Department Create DTO
 */
export interface DepartmentCreateInput {
  name: string;
  manager_id?: string;
  description?: string;
  budget?: number;
  is_active?: boolean;
}

/**
 * Onboarding Process entity
 */
export interface OnboardingProcess {
  id: string;
  employee_id: string;
  start_date: string;
  mentor_id?: string;
  status: OnboardingStatus;
  completed_tasks: number;
  total_tasks: number;
  completion_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Onboarding Process Create DTO
 */
export interface OnboardingProcessCreateInput {
  employee_id: string;
  start_date: string;
  mentor_id?: string;
  notes?: string;
}

/**
 * Onboarding Task entity
 */
export interface OnboardingTask {
  id: string;
  onboarding_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  assigned_to?: string;
  completed_at?: string;
  completed_by?: string;
  sort_order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Onboarding Task Create DTO
 */
export interface OnboardingTaskCreateInput {
  onboarding_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  sort_order?: number;
  notes?: string;
}

/**
 * Payroll Record entity
 */
export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: string;
  year: number;
  gross_salary: number;
  net_salary: number;
  bonuses: number;
  income_tax: number;
  pension_insurance: number;
  health_insurance: number;
  unemployment_insurance: number;
  church_tax: number;
  solidarity_surcharge: number;
  other_deductions: number;
  paid: boolean;
  payment_date?: string;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  iban?: string;
  bic?: string;
  creditor_name?: string;
  tax_params_snapshot?: string;
  sepa_mandate_id?: string;
  sepa_batch_id?: string;
  sepa_status: SEPAStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Payroll Record Create DTO
 */
export interface PayrollRecordCreateInput {
  employee_id: string;
  month: string;
  year: number;
  gross_salary: number;
  bonuses?: number;
  income_tax?: number;
  pension_insurance?: number;
  health_insurance?: number;
  unemployment_insurance?: number;
  church_tax?: number;
  solidarity_surcharge?: number;
  other_deductions?: number;
  payment_method?: PaymentMethod;
  iban?: string;
  bic?: string;
  creditor_name?: string;
  notes?: string;
}

/**
 * Payroll Tax Parameters entity
 */
export interface PayrollTaxParams {
  id: string;
  year: number;
  income_tax_rate: number;
  pension_insurance_rate: number;
  health_insurance_rate: number;
  unemployment_insurance_rate: number;
  church_tax_rate: number;
  solidarity_surcharge_rate: number;
  minimum_wage: number;
  tax_free_allowance: number;
  country_code: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Payroll Tax Parameters Create DTO
 */
export interface PayrollTaxParamsCreateInput {
  year: number;
  income_tax_rate: number;
  pension_insurance_rate: number;
  health_insurance_rate: number;
  unemployment_insurance_rate: number;
  church_tax_rate?: number;
  solidarity_surcharge_rate?: number;
  minimum_wage: number;
  tax_free_allowance: number;
  country_code: string;
  notes?: string;
}

/**
 * Payment Status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
  REVERSED = 'reversed',
}

/**
 * SEPA Status
 */
export enum SEPAStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  REVOKED = 'revoked',
}

/**
 * Employee Document entity
 */
export interface EmployeeDocument {
  id: string;
  employee_id: string;
  type?: DocumentType;
  title: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  uploaded_at: string;
  expires_at?: string;
  notes?: string;
}

/**
 * Employee Document Upload DTO
 */
export interface EmployeeDocumentUploadInput {
  employee_id: string;
  type?: DocumentType;
  title: string;
  expires_at?: string;
  notes?: string;
}

/**
 * Overtime Record entity
 */
export interface OvertimeRecord {
  id: string;
  employee_id: string;
  date: string;
  hours: number;
  reason?: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  compensated: boolean;
  compensated_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Overtime Record Create DTO
 */
export interface OvertimeRecordCreateInput {
  employee_id: string;
  date: string;
  hours: number;
  reason?: string;
  notes?: string;
}

/**
 * Employee with relations
 */
export interface EmployeeWithRelations extends Employee {
  contracts?: Contract[];
  current_contract?: Contract;
  time_entries?: TimeEntry[];
  leave_requests?: LeaveRequest[];
  onboarding?: OnboardingProcess;
  documents?: EmployeeDocument[];
  overtime?: OvertimeRecord[];
  payroll_records?: PayrollRecord[];
}

/**
 * Onboarding with tasks
 */
export interface OnboardingProcessWithTasks extends OnboardingProcess {
  tasks: OnboardingTask[];
  employee?: Employee;
  mentor?: Employee;
}

/**
 * Query filters for employees
 */
export interface EmployeeFilters {
  department?: string;
  status?: EmployeeStatus;
  position?: string;
  search?: string;
  start_date_from?: string;
  start_date_to?: string;
}

/**
 * Query filters for leave requests
 */
export interface LeaveRequestFilters {
  employee_id?: string;
  type?: LeaveRequestType;
  status?: LeaveRequestStatus;
  start_date_from?: string;
  start_date_to?: string;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * HR Statistics
 */
export interface HRStatistics {
  total_employees: number;
  active_employees: number;
  on_leave_employees: number;
  terminated_employees: number;
  pending_leave_requests: number;
  approved_leave_requests: number;
  total_departments: number;
  pending_onboarding: number;
  completed_onboarding: number;
}
