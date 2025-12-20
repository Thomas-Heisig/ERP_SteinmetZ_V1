// SPDX-License-Identifier: MIT
// apps/backend/src/routes/hr/hrRouter.ts

/**
 * HR (Human Resources) Router
 *
 * Provides comprehensive HR management API endpoints with RBAC integration.
 *
 * @module routes/hr
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import hrService from '../../services/hrService';
import { authenticate } from '../../middleware/authMiddleware.js';
import { requirePermission, requireModuleAccess } from '../../middleware/rbacMiddleware';
import { asyncHandler } from '../../middleware/asyncHandler';
import { EmployeeStatus, ContractType, ContractStatus, TimeEntryType, LeaveRequestType, LeaveRequestStatus } from '../../types/hr';
import pino from 'pino';

// Helper function to get authenticated user ID
function getUserId(req: Request): string {
  if (!req.auth || !req.auth.user || !req.auth.user.id) {
    throw new Error('User not authenticated');
  }
  return req.auth.user.id;
}

const router = Router();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Apply authentication and module access to all routes
router.use(authenticate);
router.use(requireModuleAccess('hr'));

// ==================== VALIDATION SCHEMAS ====================

const createEmployeeSchema = z.object({
  employee_number: z.string().optional(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().min(1),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  notes: z.string().optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

const createContractSchema = z.object({
  employee_id: z.string().uuid(),
  type: z.nativeEnum(ContractType),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  salary: z.number().positive(),
  working_hours: z.number().positive(),
  vacation_days: z.number().int().min(0).optional(),
  probation_period: z.number().int().min(0).optional(),
  notice_period: z.number().int().min(0).optional(),
  status: z.nativeEnum(ContractStatus).optional(),
  notes: z.string().optional(),
});

const createTimeEntrySchema = z.object({
  employee_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  break_minutes: z.number().int().min(0).optional(),
  type: z.nativeEnum(TimeEntryType).optional(),
  notes: z.string().optional(),
});

const createLeaveRequestSchema = z.object({
  employee_id: z.string().uuid(),
  type: z.nativeEnum(LeaveRequestType),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.number().int().positive(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
  manager_id: z.string().uuid().optional(),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
  is_active: z.boolean().optional(),
});

const createOnboardingSchema = z.object({
  employee_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mentor_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const createOnboardingTaskSchema = z.object({
  onboarding_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  assigned_to: z.string().uuid().optional(),
  sort_order: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

// ==================== EMPLOYEE ENDPOINTS ====================

/**
 * GET /api/hr/employees
 * Get all employees with filters
 */
router.get(
  '/employees',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      department: req.query.department as string | undefined,
      status: req.query.status as EmployeeStatus | undefined,
      position: req.query.position as string | undefined,
      search: req.query.search as string | undefined,
    };

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
      sort_by: req.query.sort_by as string || 'last_name',
      sort_order: (req.query.sort_order as 'asc' | 'desc') || 'asc',
    };

    const result = hrService.getEmployees(filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/hr/employees/:id
 * Get employee by ID with relations
 */
router.get(
  '/employees/:id',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const employee = hrService.getEmployeeWithRelations(req.params.id);

    if (!employee) {
      throw new Error('Employee not found');
    }

    res.json({
      success: true,
      data: employee,
    });
  })
);

/**
 * POST /api/hr/employees
 * Create a new employee
 */
router.post(
  '/employees',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createEmployeeSchema.parse(req.body);
    const employee = hrService.createEmployee(validatedData);

    logger.info({ employeeId: employee.id }, 'Employee created');

    res.status(201).json({
      success: true,
      data: employee,
    });
  })
);

/**
 * PUT /api/hr/employees/:id
 * Update employee
 */
router.put(
  '/employees/:id',
  requirePermission('hr:update'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = updateEmployeeSchema.parse(req.body);
    const employee = hrService.updateEmployee(req.params.id, validatedData);

    if (!employee) {
      throw new Error('Employee not found');
    }

    logger.info({ employeeId: employee.id }, 'Employee updated');

    res.json({
      success: true,
      data: employee,
    });
  })
);

/**
 * DELETE /api/hr/employees/:id
 * Delete (terminate) employee
 */
router.delete(
  '/employees/:id',
  requirePermission('hr:delete'),
  asyncHandler(async (req: Request, res: Response) => {
    const success = hrService.deleteEmployee(req.params.id);

    if (!success) {
      throw new Error('Employee not found');
    }

    logger.info({ employeeId: req.params.id }, 'Employee terminated');

    res.json({
      success: true,
      message: 'Employee terminated successfully',
    });
  })
);

// ==================== CONTRACT ENDPOINTS ====================

/**
 * GET /api/hr/employees/:employeeId/contracts
 * Get employee contracts
 */
router.get(
  '/employees/:employeeId/contracts',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const contracts = hrService.getEmployeeContracts(req.params.employeeId);

    res.json({
      success: true,
      data: contracts,
    });
  })
);

/**
 * POST /api/hr/contracts
 * Create a contract
 */
router.post(
  '/contracts',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createContractSchema.parse(req.body);
    const contract = hrService.createContract(validatedData);

    logger.info({ contractId: contract.id }, 'Contract created');

    res.status(201).json({
      success: true,
      data: contract,
    });
  })
);

/**
 * GET /api/hr/contracts/:id
 * Get contract by ID
 */
router.get(
  '/contracts/:id',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const contract = hrService.getContractById(req.params.id);

    if (!contract) {
      throw new Error('Contract not found');
    }

    res.json({
      success: true,
      data: contract,
    });
  })
);

/**
 * PUT /api/hr/contracts/:id
 * Update contract
 */
router.put(
  '/contracts/:id',
  requirePermission('hr:update'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createContractSchema.partial().parse(req.body);
    const contract = hrService.updateContract(req.params.id, validatedData);

    if (!contract) {
      throw new Error('Contract not found');
    }

    logger.info({ contractId: contract.id }, 'Contract updated');

    res.json({
      success: true,
      data: contract,
    });
  })
);

// ==================== TIME ENTRY ENDPOINTS ====================

/**
 * GET /api/hr/time-entries
 * Get time entries
 */
router.get(
  '/time-entries',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.query.employee_id as string;
    const startDate = req.query.start_date as string | undefined;
    const endDate = req.query.end_date as string | undefined;

    if (!employeeId) {
      throw new Error('employee_id is required');
    }

    const timeEntries = hrService.getEmployeeTimeEntries(employeeId, startDate, endDate);

    res.json({
      success: true,
      data: timeEntries,
    });
  })
);

/**
 * POST /api/hr/time-entries
 * Create time entry
 */
router.post(
  '/time-entries',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createTimeEntrySchema.parse(req.body);
    const timeEntry = hrService.createTimeEntry(validatedData);

    logger.info({ timeEntryId: timeEntry.id }, 'Time entry created');

    res.status(201).json({
      success: true,
      data: timeEntry,
    });
  })
);

/**
 * POST /api/hr/time-entries/:id/approve
 * Approve time entry
 */
router.post(
  '/time-entries/:id/approve',
  requirePermission('hr:approve'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const timeEntry = hrService.approveTimeEntry(req.params.id, userId);

    if (!timeEntry) {
      throw new Error('Time entry not found');
    }

    logger.info({ timeEntryId: timeEntry.id }, 'Time entry approved');

    res.json({
      success: true,
      data: timeEntry,
    });
  })
);

// ==================== LEAVE REQUEST ENDPOINTS ====================

/**
 * GET /api/hr/leave-requests
 * Get leave requests
 */
router.get(
  '/leave-requests',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.query.employee_id as string;
    const status = req.query.status as LeaveRequestStatus | undefined;

    if (!employeeId) {
      throw new Error('employee_id is required');
    }

    const leaveRequests = hrService.getEmployeeLeaveRequests(employeeId, status);

    res.json({
      success: true,
      data: leaveRequests,
    });
  })
);

/**
 * POST /api/hr/leave-requests
 * Create leave request
 */
router.post(
  '/leave-requests',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createLeaveRequestSchema.parse(req.body);
    const leaveRequest = hrService.createLeaveRequest(validatedData);

    logger.info({ leaveRequestId: leaveRequest.id }, 'Leave request created');

    res.status(201).json({
      success: true,
      data: leaveRequest,
    });
  })
);

/**
 * POST /api/hr/leave-requests/:id/approve
 * Approve leave request
 */
router.post(
  '/leave-requests/:id/approve',
  requirePermission('hr:approve'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const leaveRequest = hrService.approveLeaveRequest(req.params.id, userId);

    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }

    logger.info({ leaveRequestId: leaveRequest.id }, 'Leave request approved');

    res.json({
      success: true,
      data: leaveRequest,
    });
  })
);

/**
 * POST /api/hr/leave-requests/:id/reject
 * Reject leave request
 */
router.post(
  '/leave-requests/:id/reject',
  requirePermission('hr:approve'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { reason } = req.body;

    if (!reason) {
      throw new Error('Rejection reason is required');
    }

    const leaveRequest = hrService.rejectLeaveRequest(req.params.id, userId, reason);

    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }

    logger.info({ leaveRequestId: leaveRequest.id }, 'Leave request rejected');

    res.json({
      success: true,
      data: leaveRequest,
    });
  })
);

// ==================== DEPARTMENT ENDPOINTS ====================

/**
 * GET /api/hr/departments
 * Get all departments
 */
router.get(
  '/departments',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const activeOnly = req.query.active_only !== 'false';
    const departments = hrService.getDepartments(activeOnly);

    res.json({
      success: true,
      data: departments,
    });
  })
);

/**
 * POST /api/hr/departments
 * Create department
 */
router.post(
  '/departments',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createDepartmentSchema.parse(req.body);
    const department = hrService.createDepartment(validatedData);

    logger.info({ departmentId: department.id }, 'Department created');

    res.status(201).json({
      success: true,
      data: department,
    });
  })
);

// ==================== ONBOARDING ENDPOINTS ====================

/**
 * GET /api/hr/onboarding/:id
 * Get onboarding process with tasks
 */
router.get(
  '/onboarding/:id',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const onboarding = hrService.getOnboardingWithTasks(req.params.id);

    if (!onboarding) {
      throw new Error('Onboarding not found');
    }

    res.json({
      success: true,
      data: onboarding,
    });
  })
);

/**
 * POST /api/hr/onboarding
 * Create onboarding process
 */
router.post(
  '/onboarding',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createOnboardingSchema.parse(req.body);
    const onboarding = hrService.createOnboarding(validatedData);

    logger.info({ onboardingId: onboarding.id }, 'Onboarding created');

    res.status(201).json({
      success: true,
      data: onboarding,
    });
  })
);

/**
 * POST /api/hr/onboarding/tasks
 * Create onboarding task
 */
router.post(
  '/onboarding/tasks',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createOnboardingTaskSchema.parse(req.body);
    const task = hrService.createOnboardingTask(validatedData);

    logger.info({ taskId: task.id }, 'Onboarding task created');

    res.status(201).json({
      success: true,
      data: task,
    });
  })
);

/**
 * POST /api/hr/onboarding/tasks/:id/complete
 * Complete onboarding task
 */
router.post(
  '/onboarding/tasks/:id/complete',
  requirePermission('hr:update'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const task = hrService.completeOnboardingTask(req.params.id, userId);

    if (!task) {
      throw new Error('Onboarding task not found');
    }

    logger.info({ taskId: task.id }, 'Onboarding task completed');

    res.json({
      success: true,
      data: task,
    });
  })
);

// ==================== DOCUMENT ENDPOINTS ====================

/**
 * GET /api/hr/employees/:employeeId/documents
 * Get employee documents
 */
router.get(
  '/employees/:employeeId/documents',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const documents = hrService.getEmployeeDocuments(req.params.employeeId);

    res.json({
      success: true,
      data: documents,
    });
  })
);

// ==================== OVERTIME ENDPOINTS ====================

/**
 * GET /api/hr/overtime
 * Get overtime records
 */
router.get(
  '/overtime',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.query.employee_id as string;

    if (!employeeId) {
      throw new Error('employee_id is required');
    }

    const overtime = hrService.getEmployeeOvertime(employeeId);

    res.json({
      success: true,
      data: overtime,
    });
  })
);

/**
 * POST /api/hr/overtime
 * Create overtime record
 */
router.post(
  '/overtime',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = z.object({
      employee_id: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      hours: z.number().positive(),
      reason: z.string().optional(),
      notes: z.string().optional(),
    }).parse(req.body);

    const overtime = hrService.createOvertimeRecord(validatedData);

    logger.info({ overtimeId: overtime.id }, 'Overtime record created');

    res.status(201).json({
      success: true,
      data: overtime,
    });
  })
);

/**
 * POST /api/hr/overtime/:id/approve
 * Approve overtime
 */
router.post(
  '/overtime/:id/approve',
  requirePermission('hr:approve'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const overtime = hrService.approveOvertime(req.params.id, userId);

    if (!overtime) {
      throw new Error('Overtime record not found');
    }

    logger.info({ overtimeId: overtime.id }, 'Overtime approved');

    res.json({
      success: true,
      data: overtime,
    });
  })
);

// ==================== PAYROLL TAX PARAMETERS ENDPOINTS ====================

/**
 * GET /api/hr/payroll/tax-params/:year
 * Get payroll tax parameters
 */
router.get(
  '/payroll/tax-params/:year',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    const countryCode = (req.query.country_code as string) || 'DE';

    const params = hrService.getPayrollTaxParams(year, countryCode);

    res.json({
      success: true,
      data: params,
    });
  })
);

/**
 * POST /api/hr/payroll/tax-params
 * Create payroll tax parameters
 */
router.post(
  '/payroll/tax-params',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = z.object({
      year: z.number().int(),
      income_tax_rate: z.number().positive(),
      pension_insurance_rate: z.number().positive(),
      health_insurance_rate: z.number().positive(),
      unemployment_insurance_rate: z.number().positive(),
      church_tax_rate: z.number().positive().optional(),
      solidarity_surcharge_rate: z.number().positive().optional(),
      minimum_wage: z.number().positive(),
      tax_free_allowance: z.number().positive(),
      country_code: z.string().optional(),
      notes: z.string().optional(),
    }).parse(req.body);

    const params = hrService.createPayrollTaxParams({
      ...validatedData,
      country_code: validatedData.country_code || 'DE',
    });

    logger.info({ year: params.year }, 'Payroll tax parameters created');

    res.status(201).json({
      success: true,
      data: params,
    });
  })
);

// ==================== PAYROLL ENDPOINTS ====================

/**
 * GET /api/hr/payroll
 * Get payroll records for period with pagination
 */
router.get(
  '/payroll',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = req.query.month as string | undefined;

    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
      sort_by: req.query.sort_by as string,
      sort_order: (req.query.sort_order as 'asc' | 'desc') || 'asc',
    };

    const result = hrService.getPayrollRecords(year, month, pagination);

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/hr/payroll/:id
 * Get payroll record by ID
 */
router.get(
  '/payroll/:id',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const payroll = hrService.getPayrollRecordById(req.params.id);

    if (!payroll) {
      throw new Error('Payroll record not found');
    }

    res.json({
      success: true,
      data: payroll,
    });
  })
);

/**
 * GET /api/hr/employees/:employeeId/payroll
 * Get employee payroll records
 */
router.get(
  '/employees/:employeeId/payroll',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const month = req.query.month as string | undefined;

    const records = hrService.getEmployeePayroll(req.params.employeeId, year, month);

    res.json({
      success: true,
      data: records,
    });
  })
);

/**
 * POST /api/hr/payroll
 * Create payroll record
 */
router.post(
  '/payroll',
  requirePermission('hr:create'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = z.object({
      employee_id: z.string().uuid(),
      month: z.string().regex(/^\d{2}$/),
      year: z.number().int(),
      gross_salary: z.number().positive(),
      bonuses: z.number().nonnegative().optional(),
      income_tax: z.number().nonnegative().optional(),
      pension_insurance: z.number().nonnegative().optional(),
      health_insurance: z.number().nonnegative().optional(),
      unemployment_insurance: z.number().nonnegative().optional(),
      church_tax: z.number().nonnegative().optional(),
      solidarity_surcharge: z.number().nonnegative().optional(),
      other_deductions: z.number().nonnegative().optional(),
      payment_method: z.enum(['bank_transfer', 'cash', 'check', 'direct_debit']).optional(),
      iban: z.string().optional(),
      bic: z.string().optional(),
      creditor_name: z.string().optional(),
      notes: z.string().optional(),
    }).parse(req.body);

    const payroll = hrService.createPayrollRecord(validatedData);

    logger.info({ payrollId: payroll.id }, 'Payroll record created');

    res.status(201).json({
      success: true,
      data: payroll,
    });
  })
);

/**
 * GET /api/hr/payroll/export/csv
 * Export payroll as CSV
 */
router.get(
  '/payroll/export/csv',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = req.query.month as string | undefined;

    const csv = hrService.exportPayrollAsCSV(year, month);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="payroll-${year}-${month || 'all'}.csv"`);
    res.send(csv);
  })
);

/**
 * POST /api/hr/payroll/export/sepa
 * Export payroll as SEPA pain.001.001.03 XML
 */
router.post(
  '/payroll/export/sepa',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = z.object({
      year: z.number().int(),
      month: z.string().regex(/^\d{2}$/),
      company_name: z.string(),
      company_iban: z.string(),
      company_bic: z.string(),
    }).parse(req.body);

    const xml = hrService.exportPayrollAsSEPA(
      validatedData.year,
      validatedData.month,
      validatedData.company_name,
      validatedData.company_iban,
      validatedData.company_bic
    );

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="sepa-payroll-${validatedData.year}-${validatedData.month}.xml"`);
    res.send(xml);
  })
);

// ==================== STATISTICS ENDPOINT ====================

/**
 * GET /api/hr/statistics
 * Get HR statistics
 */
router.get(
  '/statistics',
  requirePermission('hr:read'),
  asyncHandler(async (req: Request, res: Response) => {
    const statistics = hrService.getStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  })
);

export default router;
