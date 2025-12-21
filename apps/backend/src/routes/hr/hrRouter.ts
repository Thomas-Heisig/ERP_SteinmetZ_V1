// SPDX-License-Identifier: MIT
// apps/backend/src/routes/hr/hrRouter.ts

/**
 * HR (Human Resources) Router
 *
 * Provides comprehensive HR management API endpoints with RBAC integration.
 *
 * @module routes/hr
 */

import { Router, Request, Response } from "express";
import pino from "pino";
import { z, type ZodIssue } from "zod";

import { authenticate } from "../../middleware/authMiddleware.js";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  requirePermission,
  requireModuleAccess,
} from "../../middleware/rbacMiddleware";
import { BadRequestError, NotFoundError } from "../error/errors.js";
import {
  ContractStatus,
  ContractType,
  EmployeeStatus,
  LeaveRequestStatus,
  LeaveRequestType,
  PaymentMethod,
  TimeEntryType,
} from "./hr";
import hrService from "./hrService";

// Helper function to get authenticated user ID
function getUserId(req: Request): string {
  if (!req.auth || !req.auth.user || !req.auth.user.id) {
    throw new Error("User not authenticated");
  }
  return req.auth.user.id;
}

const router = Router();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const uuidSchema = z.string().uuid();

function formatValidationErrors(issues: ZodIssue[]): Record<string, unknown> {
  return {
    issues: issues.map((issue) => ({
      path: issue.path.join(".") || "root",
      message: issue.message,
      code: issue.code,
    })),
  };
}

function parseWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
  message: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new BadRequestError(
      message,
      formatValidationErrors(result.error.issues),
    );
  }
  return result.data;
}

// Apply authentication and module access to all routes
router.use(authenticate);
router.use(requireModuleAccess("hr"));

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
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
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
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
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
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  assigned_to: z.string().uuid().optional(),
  sort_order: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

const employeesQuerySchema = z
  .object({
    department: z.string().optional(),
    status: z.nativeEnum(EmployeeStatus).optional(),
    position: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(200).default(50),
    sort_by: z.string().default("last_name"),
    sort_order: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

const timeEntriesQuerySchema = z
  .object({
    employee_id: uuidSchema,
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .strict();

const leaveRequestsQuerySchema = z
  .object({
    employee_id: uuidSchema,
    status: z.nativeEnum(LeaveRequestStatus).optional(),
  })
  .strict();

const overtimeQuerySchema = z
  .object({
    employee_id: uuidSchema,
  })
  .strict();

const payrollQuerySchema = z
  .object({
    year: z.coerce.number().int().optional(),
    month: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(200).default(50),
    sort_by: z.string().optional(),
    sort_order: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

const employeePayrollQuerySchema = z
  .object({
    year: z.coerce.number().int().optional(),
    month: z.string().optional(),
  })
  .strict();

// ==================== EMPLOYEE ENDPOINTS ====================

/**
 * GET /api/hr/employees
 * Get all employees with filters
 */
router.get(
  "/employees",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const query = parseWithSchema(
      employeesQuerySchema,
      req.query,
      "Invalid employee query parameters",
    );

    const filters = {
      department: query.department,
      status: query.status,
      position: query.position,
      search: query.search,
    };

    const pagination = {
      page: query.page,
      limit: query.limit,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
    } as const;

    const result = hrService.getEmployees(filters, pagination);

    res.json({
      success: true,
      data: result,
    });
  }),
);

/**
 * GET /api/hr/employees/:id
 * Get employee by ID with relations
 */
router.get(
  "/employees/:id",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid employee id",
    );
    const employee = hrService.getEmployeeWithRelations(employeeId);

    if (!employee) {
      throw new NotFoundError("Employee not found", { employeeId });
    }

    res.json({
      success: true,
      data: employee,
    });
  }),
);

/**
 * POST /api/hr/employees
 * Create a new employee
 */
router.post(
  "/employees",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      createEmployeeSchema,
      req.body,
      "Invalid employee payload",
    );
    const employee = hrService.createEmployee(validatedData);

    logger.info({ employeeId: employee.id }, "Employee created");

    res.status(201).json({
      success: true,
      data: employee,
    });
  }),
);

/**
 * PUT /api/hr/employees/:id
 * Update employee
 */
router.put(
  "/employees/:id",
  requirePermission("hr:update"),
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid employee id",
    );
    const validatedData = parseWithSchema(
      updateEmployeeSchema,
      req.body,
      "Invalid employee update payload",
    );
    const employee = hrService.updateEmployee(employeeId, validatedData);

    if (!employee) {
      throw new NotFoundError("Employee not found", { employeeId });
    }

    logger.info({ employeeId: employee.id }, "Employee updated");

    res.json({
      success: true,
      data: employee,
    });
  }),
);

/**
 * DELETE /api/hr/employees/:id
 * Delete (terminate) employee
 */
router.delete(
  "/employees/:id",
  requirePermission("hr:delete"),
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid employee id",
    );
    const success = hrService.deleteEmployee(employeeId);

    if (!success) {
      throw new NotFoundError("Employee not found", { employeeId });
    }

    logger.info({ employeeId }, "Employee terminated");

    res.json({
      success: true,
      message: "Employee terminated successfully",
    });
  }),
);

// ==================== CONTRACT ENDPOINTS ====================

/**
 * GET /api/hr/employees/:employeeId/contracts
 * Get employee contracts
 */
router.get(
  "/employees/:employeeId/contracts",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = parseWithSchema(
      uuidSchema,
      req.params.employeeId,
      "Invalid employee id",
    );
    const contracts = hrService.getEmployeeContracts(employeeId);

    res.json({
      success: true,
      data: contracts,
    });
  }),
);

/**
 * POST /api/hr/contracts
 * Create a contract
 */
router.post(
  "/contracts",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      createContractSchema,
      req.body,
      "Invalid contract payload",
    );
    const contract = hrService.createContract(validatedData);

    logger.info({ contractId: contract.id }, "Contract created");

    res.status(201).json({
      success: true,
      data: contract,
    });
  }),
);

/**
 * GET /api/hr/contracts/:id
 * Get contract by ID
 */
router.get(
  "/contracts/:id",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const contractId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid contract id",
    );
    const contract = hrService.getContractById(contractId);

    if (!contract) {
      throw new NotFoundError("Contract not found", { contractId });
    }

    res.json({
      success: true,
      data: contract,
    });
  }),
);

/**
 * PUT /api/hr/contracts/:id
 * Update contract
 */
router.put(
  "/contracts/:id",
  requirePermission("hr:update"),
  asyncHandler(async (req: Request, res: Response) => {
    const contractId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid contract id",
    );
    const validatedData = parseWithSchema(
      createContractSchema.partial(),
      req.body,
      "Invalid contract update payload",
    );
    const contract = hrService.updateContract(contractId, validatedData);

    if (!contract) {
      throw new NotFoundError("Contract not found", { contractId });
    }

    logger.info({ contractId: contract.id }, "Contract updated");

    res.json({
      success: true,
      data: contract,
    });
  }),
);

// ==================== TIME ENTRY ENDPOINTS ====================

/**
 * GET /api/hr/time-entries
 * Get time entries
 */
router.get(
  "/time-entries",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const query = parseWithSchema(
      timeEntriesQuerySchema,
      req.query,
      "Invalid time entry query parameters",
    );

    const timeEntries = hrService.getEmployeeTimeEntries(
      query.employee_id,
      query.start_date,
      query.end_date,
    );

    res.json({
      success: true,
      data: timeEntries,
    });
  }),
);

/**
 * POST /api/hr/time-entries
 * Create time entry
 */
router.post(
  "/time-entries",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      createTimeEntrySchema,
      req.body,
      "Invalid time entry payload",
    );
    const timeEntry = hrService.createTimeEntry(validatedData);

    logger.info({ timeEntryId: timeEntry.id }, "Time entry created");

    res.status(201).json({
      success: true,
      data: timeEntry,
    });
  }),
);

/**
 * POST /api/hr/time-entries/:id/approve
 * Approve time entry
 */
router.post(
  "/time-entries/:id/approve",
  requirePermission("hr:approve"),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const timeEntryId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid time entry id",
    );
    const timeEntry = hrService.approveTimeEntry(timeEntryId, userId);

    if (!timeEntry) {
      throw new NotFoundError("Time entry not found", { timeEntryId });
    }

    logger.info({ timeEntryId: timeEntry.id }, "Time entry approved");

    res.json({
      success: true,
      data: timeEntry,
    });
  }),
);

// ==================== LEAVE REQUEST ENDPOINTS ====================

/**
 * GET /api/hr/leave-requests
 * Get leave requests
 */
router.get(
  "/leave-requests",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const query = parseWithSchema(
      leaveRequestsQuerySchema,
      req.query,
      "Invalid leave request query parameters",
    );

    const leaveRequests = hrService.getEmployeeLeaveRequests(
      query.employee_id,
      query.status,
    );

    res.json({
      success: true,
      data: leaveRequests,
    });
  }),
);

/**
 * POST /api/hr/leave-requests
 * Create leave request
 */
router.post(
  "/leave-requests",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      createLeaveRequestSchema,
      req.body,
      "Invalid leave request payload",
    );
    const leaveRequest = hrService.createLeaveRequest(validatedData);

    logger.info({ leaveRequestId: leaveRequest.id }, "Leave request created");

    res.status(201).json({
      success: true,
      data: leaveRequest,
    });
  }),
);

/**
 * POST /api/hr/leave-requests/:id/approve
 * Approve leave request
 */
router.post(
  "/leave-requests/:id/approve",
  requirePermission("hr:approve"),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const leaveRequestId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid leave request id",
    );
    const leaveRequest = hrService.approveLeaveRequest(leaveRequestId, userId);

    if (!leaveRequest) {
      throw new NotFoundError("Leave request not found", { leaveRequestId });
    }

    logger.info({ leaveRequestId: leaveRequest.id }, "Leave request approved");

    res.json({
      success: true,
      data: leaveRequest,
    });
  }),
);

/**
 * POST /api/hr/leave-requests/:id/reject
 * Reject leave request
 */
router.post(
  "/leave-requests/:id/reject",
  requirePermission("hr:approve"),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const leaveRequestId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid leave request id",
    );
    const body = parseWithSchema(
      z.object({ reason: z.string().min(1) }),
      req.body,
      "Invalid rejection reason",
    );

    const leaveRequest = hrService.rejectLeaveRequest(
      leaveRequestId,
      userId,
      body.reason,
    );

    if (!leaveRequest) {
      throw new NotFoundError("Leave request not found", { leaveRequestId });
    }

    logger.info({ leaveRequestId: leaveRequest.id }, "Leave request rejected");

    res.json({
      success: true,
      data: leaveRequest,
    });
  }),
);

// ==================== DEPARTMENT ENDPOINTS ====================

/**
 * GET /api/hr/departments
 * Get all departments
 */
router.get(
  "/departments",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const activeOnly = req.query.active_only !== "false";
    const departments = hrService.getDepartments(activeOnly);

    res.json({
      success: true,
      data: departments,
    });
  }),
);

/**
 * POST /api/hr/departments
 * Create department
 */
router.post(
  "/departments",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      createDepartmentSchema,
      req.body,
      "Invalid department payload",
    );
    const department = hrService.createDepartment(validatedData);

    logger.info({ departmentId: department.id }, "Department created");

    res.status(201).json({
      success: true,
      data: department,
    });
  }),
);

// ==================== ONBOARDING ENDPOINTS ====================

/**
 * GET /api/hr/onboarding/:id
 * Get onboarding process with tasks
 */
router.get(
  "/onboarding/:id",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const onboardingId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid onboarding id",
    );
    const onboarding = hrService.getOnboardingWithTasks(onboardingId);

    if (!onboarding) {
      throw new NotFoundError("Onboarding not found", { onboardingId });
    }

    res.json({
      success: true,
      data: onboarding,
    });
  }),
);

/**
 * POST /api/hr/onboarding
 * Create onboarding process
 */
router.post(
  "/onboarding",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      createOnboardingSchema,
      req.body,
      "Invalid onboarding payload",
    );
    const onboarding = hrService.createOnboarding(validatedData);

    logger.info({ onboardingId: onboarding.id }, "Onboarding created");

    res.status(201).json({
      success: true,
      data: onboarding,
    });
  }),
);

/**
 * POST /api/hr/onboarding/tasks
 * Create onboarding task
 */
router.post(
  "/onboarding/tasks",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      createOnboardingTaskSchema,
      req.body,
      "Invalid onboarding task payload",
    );
    const task = hrService.createOnboardingTask(validatedData);

    logger.info({ taskId: task.id }, "Onboarding task created");

    res.status(201).json({
      success: true,
      data: task,
    });
  }),
);

/**
 * POST /api/hr/onboarding/tasks/:id/complete
 * Complete onboarding task
 */
router.post(
  "/onboarding/tasks/:id/complete",
  requirePermission("hr:update"),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const taskId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid task id",
    );
    const task = hrService.completeOnboardingTask(taskId, userId);

    if (!task) {
      throw new NotFoundError("Onboarding task not found", { taskId });
    }

    logger.info({ taskId: task.id }, "Onboarding task completed");

    res.json({
      success: true,
      data: task,
    });
  }),
);

// ==================== DOCUMENT ENDPOINTS ====================

/**
 * GET /api/hr/employees/:employeeId/documents
 * Get employee documents
 */
router.get(
  "/employees/:employeeId/documents",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = parseWithSchema(
      uuidSchema,
      req.params.employeeId,
      "Invalid employee id",
    );
    const documents = hrService.getEmployeeDocuments(employeeId);

    res.json({
      success: true,
      data: documents,
    });
  }),
);

// ==================== OVERTIME ENDPOINTS ====================

/**
 * GET /api/hr/overtime
 * Get overtime records
 */
router.get(
  "/overtime",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const query = parseWithSchema(
      overtimeQuerySchema,
      req.query,
      "Invalid overtime query parameters",
    );

    const overtime = hrService.getEmployeeOvertime(query.employee_id);

    res.json({
      success: true,
      data: overtime,
    });
  }),
);

/**
 * POST /api/hr/overtime
 * Create overtime record
 */
router.post(
  "/overtime",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      z
        .object({
          employee_id: uuidSchema,
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          hours: z.number().positive(),
          reason: z.string().optional(),
          notes: z.string().optional(),
        })
        .strict(),
      req.body,
      "Invalid overtime payload",
    );

    const overtime = hrService.createOvertimeRecord(validatedData);

    logger.info({ overtimeId: overtime.id }, "Overtime record created");

    res.status(201).json({
      success: true,
      data: overtime,
    });
  }),
);

/**
 * POST /api/hr/overtime/:id/approve
 * Approve overtime
 */
router.post(
  "/overtime/:id/approve",
  requirePermission("hr:approve"),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const overtimeId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid overtime id",
    );
    const overtime = hrService.approveOvertime(overtimeId, userId);

    if (!overtime) {
      throw new NotFoundError("Overtime record not found", { overtimeId });
    }

    logger.info({ overtimeId: overtime.id }, "Overtime approved");

    res.json({
      success: true,
      data: overtime,
    });
  }),
);

// ==================== PAYROLL TAX PARAMETERS ENDPOINTS ====================

/**
 * GET /api/hr/payroll/tax-params/:year
 * Get payroll tax parameters
 */
router.get(
  "/payroll/tax-params/:year",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const year = parseInt(req.params.year);
    if (!Number.isFinite(year)) {
      throw new BadRequestError("Invalid year parameter");
    }
    const countryCode = (req.query.country_code as string) || "DE";

    const params = hrService.getPayrollTaxParams(year, countryCode);

    res.json({
      success: true,
      data: params,
    });
  }),
);

/**
 * POST /api/hr/payroll/tax-params
 * Create payroll tax parameters
 */
router.post(
  "/payroll/tax-params",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      z
        .object({
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
        })
        .strict(),
      req.body,
      "Invalid payroll tax parameters",
    );

    const params = hrService.createPayrollTaxParams({
      ...validatedData,
      country_code: validatedData.country_code || "DE",
    });

    logger.info({ year: params.year }, "Payroll tax parameters created");

    res.status(201).json({
      success: true,
      data: params,
    });
  }),
);

// ==================== PAYROLL ENDPOINTS ====================

/**
 * GET /api/hr/payroll
 * Get payroll records for period with pagination
 */
router.get(
  "/payroll",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const query = parseWithSchema(
      payrollQuerySchema,
      req.query,
      "Invalid payroll query parameters",
    );

    const result = hrService.getPayrollRecords(
      query.year ?? new Date().getFullYear(),
      query.month,
      {
        page: query.page,
        limit: query.limit,
        sort_by: query.sort_by,
        sort_order: query.sort_order,
      },
    );

    res.json({
      success: true,
      data: result,
    });
  }),
);

/**
 * GET /api/hr/payroll/:id
 * Get payroll record by ID
 */
router.get(
  "/payroll/:id",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const payrollId = parseWithSchema(
      uuidSchema,
      req.params.id,
      "Invalid payroll id",
    );
    const payroll = hrService.getPayrollRecordById(payrollId);

    if (!payroll) {
      throw new NotFoundError("Payroll record not found", { payrollId });
    }

    res.json({
      success: true,
      data: payroll,
    });
  }),
);

/**
 * GET /api/hr/employees/:employeeId/payroll
 * Get employee payroll records
 */
router.get(
  "/employees/:employeeId/payroll",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const employeeId = parseWithSchema(
      uuidSchema,
      req.params.employeeId,
      "Invalid employee id",
    );
    const query = parseWithSchema(
      employeePayrollQuerySchema,
      req.query,
      "Invalid employee payroll query parameters",
    );

    const records = hrService.getEmployeePayroll(
      employeeId,
      query.year,
      query.month,
    );

    res.json({
      success: true,
      data: records,
    });
  }),
);

/**
 * POST /api/hr/payroll
 * Create payroll record
 */
router.post(
  "/payroll",
  requirePermission("hr:create"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      z
        .object({
          employee_id: uuidSchema,
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
          payment_method: z.nativeEnum(PaymentMethod).optional(),
          iban: z.string().optional(),
          bic: z.string().optional(),
          creditor_name: z.string().optional(),
          notes: z.string().optional(),
        })
        .strict(),
      req.body,
      "Invalid payroll payload",
    );

    const payroll = hrService.createPayrollRecord(validatedData);

    logger.info({ payrollId: payroll.id }, "Payroll record created");

    res.status(201).json({
      success: true,
      data: payroll,
    });
  }),
);

/**
 * GET /api/hr/payroll/export/csv
 * Export payroll as CSV
 */
router.get(
  "/payroll/export/csv",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = req.query.month as string | undefined;

    const csv = hrService.exportPayrollAsCSV(year, month);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="payroll-${year}-${month || "all"}.csv"`,
    );
    res.send(csv);
  }),
);

/**
 * POST /api/hr/payroll/export/sepa
 * Export payroll as SEPA pain.001.001.03 XML
 */
router.post(
  "/payroll/export/sepa",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData = parseWithSchema(
      z
        .object({
          year: z.number().int(),
          month: z.string().regex(/^\d{2}$/),
          company_name: z.string(),
          company_iban: z.string(),
          company_bic: z.string(),
        })
        .strict(),
      req.body,
      "Invalid SEPA export payload",
    );

    const xml = hrService.exportPayrollAsSEPA(
      validatedData.year,
      validatedData.month,
      validatedData.company_name,
      validatedData.company_iban,
      validatedData.company_bic,
    );

    res.setHeader("Content-Type", "application/xml");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sepa-payroll-${validatedData.year}-${validatedData.month}.xml"`,
    );
    res.send(xml);
  }),
);

// ==================== STATISTICS ENDPOINT ====================

/**
 * GET /api/hr/statistics
 * Get HR statistics
 */
router.get(
  "/statistics",
  requirePermission("hr:read"),
  asyncHandler(async (req: Request, res: Response) => {
    const statistics = hrService.getStatistics();

    res.json({
      success: true,
      data: statistics,
    });
  }),
);

export default router;
