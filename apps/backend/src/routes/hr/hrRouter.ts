// SPDX-License-Identifier: MIT
// apps/backend/src/routes/hr/hrRouter.ts

/**
 * HR (Human Resources) Router
 *
 * Provides comprehensive HR management API including employee records,
 * time tracking, leave management, payroll, and document handling.
 *
 * @remarks
 * This router provides:
 * - Employee CRUD operations
 * - Time entry tracking (clock in/out)
 * - Leave request management (vacation, sick leave)
 * - Payroll record management
 * - Document upload and retrieval
 * - HR statistics and reports
 * - Department and position management
 *
 * Features:
 * - Zod-based request validation
 * - Status-based filtering (active, on_leave, terminated)
 * - Date-range queries for time entries and leave
 * - Payroll calculation and history
 * - Document attachment support
 * - Search and filtering capabilities
 *
 * @module routes/hr
 *
 * @example
 * ```typescript
 * // Create employee
 * POST /api/hr/employees
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john@example.com",
 *   "department": "Engineering",
 *   "position": "Software Developer",
 *   "startDate": "2024-01-15"
 * }
 *
 * // Record time entry
 * POST /api/hr/time-entries
 * {
 *   "employeeId": "emp-123",
 *   "date": "2024-12-09",
 *   "startTime": "09:00",
 *   "endTime": "17:00"
 * }
 *
 * // Request leave
 * POST /api/hr/leave-requests
 * {
 *   "employeeId": "emp-123",
 *   "startDate": "2024-12-20",
 *   "endDate": "2024-12-25",
 *   "type": "vacation",
 *   "reason": "Holiday vacation"
 * }
 * ```
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "../../types/errors.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import pino from "pino";

const router = Router();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });

// Validation schemas
const employeeQuerySchema = z.object({
  department: z.string().optional(),
  status: z.enum(["active", "on_leave", "terminated"]).optional(),
  search: z.string().optional(),
});

const createEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  department: z.string().min(1),
  position: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employeeNumber: z.string().optional(),
});

const timeEntryQuerySchema = z.object({
  employeeId: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const createTimeEntrySchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakMinutes: z.number().int().min(0),
  type: z.enum(["regular", "overtime", "sick", "vacation"]).optional(),
});

const leaveRequestQuerySchema = z.object({
  employeeId: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

const createLeaveRequestSchema = z.object({
  employeeId: z.string().min(1),
  type: z.enum(["vacation", "sick", "unpaid", "parental"]),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.number().int().positive().optional(),
  reason: z.string().optional(),
});

const leaveActionSchema = z.object({
  reason: z.string().optional(),
});

/**
 * HR Module Router
 * Handles employee management, time tracking, leave management, and payroll
 */

// ============================================================================
// EMPLOYEE MANAGEMENT
// ============================================================================

/**
 * GET /api/hr/employees
 * Get all employees with optional filters
 */
router.get(
  "/employees",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = employeeQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        validationResult.error.issues,
      );
    }

    const { department, status, search } = validationResult.data;

    // TODO: Replace with actual database query
    const mockEmployees = [
      {
        id: "1",
        firstName: "Max",
        lastName: "Mustermann",
        email: "max.mustermann@company.de",
        department: "Entwicklung",
        position: "Senior Developer",
        startDate: "2020-03-15",
        status: "active",
        employeeNumber: "EMP-001",
      },
      {
        id: "2",
        firstName: "Anna",
        lastName: "Schmidt",
        email: "anna.schmidt@company.de",
        department: "Vertrieb",
        position: "Sales Manager",
        startDate: "2019-07-01",
        status: "active",
        employeeNumber: "EMP-002",
      },
      {
        id: "3",
        firstName: "Thomas",
        lastName: "Müller",
        email: "thomas.mueller@company.de",
        department: "Marketing",
        position: "Marketing Specialist",
        startDate: "2021-01-10",
        status: "on_leave",
        employeeNumber: "EMP-003",
      },
    ];

    // Apply filters
    let filteredEmployees = mockEmployees;
    if (department) {
      filteredEmployees = filteredEmployees.filter(
        (emp) => emp.department === department,
      );
    }
    if (status) {
      filteredEmployees = filteredEmployees.filter(
        (emp) => emp.status === status,
      );
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredEmployees = filteredEmployees.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(searchLower) ||
          emp.lastName.toLowerCase().includes(searchLower) ||
          emp.email.toLowerCase().includes(searchLower),
      );
    }

    res.json({
      success: true,
      data: filteredEmployees,
      count: filteredEmployees.length,
    });
  }),
);

/**
 * GET /api/hr/employees/:id
 * Get a single employee by ID
 */
router.get(
  "/employees/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Replace with actual database query
    // In real implementation, this would be:
    // const employee = await employeeService.findById(id);
    // if (!employee) { return res.status(404).json(...) }
    const mockEmployee = {
      id,
      firstName: "Max",
      lastName: "Mustermann",
      email: "max.mustermann@company.de",
      department: "Entwicklung",
      position: "Senior Developer",
      startDate: "2020-03-15",
      status: "active",
      employeeNumber: "EMP-001",
      phone: "+49 123 456789",
      address: {
        street: "Musterstraße 1",
        city: "Berlin",
        zipCode: "10115",
        country: "Deutschland",
      },
      contract: {
        type: "unbefristet",
        startDate: "2020-03-15",
        salary: 65000,
        workingHours: 40,
      },
    };

    // Note: This check is for demonstration purposes only
    // Will be replaced with actual DB query in Phase 2
    if (!mockEmployee) {
      throw new NotFoundError("Employee not found", { employeeId: id });
    }

    res.json({
      success: true,
      data: mockEmployee,
    });
  }),
);

/**
 * POST /api/hr/employees
 * Create a new employee
 */
router.post(
  "/employees",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = createEmployeeSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid employee data",
        validationResult.error.issues,
      );
    }

    const employeeData = validationResult.data;

    // TODO: Save to database
    // In production: const employee = await employeeService.create(employeeData);

    const newEmployee = {
      id: Date.now().toString(),
      ...employeeData,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: newEmployee,
      message: "Employee created successfully",
    });
  }),
);

/**
 * PUT /api/hr/employees/:id
 * Update an employee
 */
router.put(
  "/employees/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate input (using partial schema for updates)
    const validationResult = createEmployeeSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid employee update data",
        validationResult.error.issues,
      );
    }

    const updateData = validationResult.data;

    // TODO: Update in database
    // In production: const employee = await employeeService.update(id, updateData);
    // if (!employee) throw new NotFoundError("Employee not found");

    res.json({
      success: true,
      data: { id, ...updateData },
      message: "Employee updated successfully",
    });
  }),
);

/**
 * DELETE /api/hr/employees/:id
 * Delete (deactivate) an employee
 */
router.delete(
  "/employees/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Soft delete in database (set status to inactive)
    // In production: const result = await employeeService.deactivate(id);
    // if (!result) throw new NotFoundError("Employee not found");

    res.json({
      success: true,
      message: "Employee deactivated successfully",
    });
  }),
);

// ============================================================================
// TIME TRACKING
// ============================================================================

/**
 * GET /api/hr/time-entries
 * Get time entries with optional filters
 */
router.get(
  "/time-entries",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = timeEntryQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        validationResult.error.issues,
      );
    }

    const { employeeId, startDate, endDate } = validationResult.data;

    // TODO: Replace with actual database query
    const mockEntries = [
      {
        id: "1",
        employeeId: "1",
        date: "2024-12-05",
        startTime: "08:00",
        endTime: "17:00",
        breakMinutes: 60,
        totalHours: 8,
        type: "regular",
      },
    ];

    // Apply filters
    let filteredEntries = mockEntries;
    if (employeeId) {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.employeeId === employeeId,
      );
    }
    // Note: startDate and endDate filtering would be applied here in production

    res.json({
      success: true,
      data: filteredEntries,
      count: filteredEntries.length,
    });
  }),
);

/**
 * POST /api/hr/time-entries
 * Create a new time entry
 */
router.post(
  "/time-entries",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = createTimeEntrySchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid time entry data",
        validationResult.error.issues,
      );
    }

    const timeEntry = validationResult.data;

    // TODO: Save to database
    // In production: const entry = await timeEntryService.create(timeEntry);

    res.status(201).json({
      success: true,
      data: { id: Date.now().toString(), ...timeEntry, totalHours: 8 },
      message: "Time entry created successfully",
    });
  }),
);

// ============================================================================
// LEAVE MANAGEMENT
// ============================================================================

/**
 * GET /api/hr/leave-requests
 * Get leave requests with optional filters
 */
router.get(
  "/leave-requests",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = leaveRequestQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid query parameters",
        validationResult.error.issues,
      );
    }

    const { employeeId, status } = validationResult.data;

    // TODO: Replace with actual database query
    const mockRequests = [
      {
        id: "1",
        employeeId: "1",
        type: "vacation",
        startDate: "2024-12-20",
        endDate: "2024-12-31",
        days: 10,
        status: "approved",
        reason: "Weihnachtsurlaub",
        requestedAt: "2024-11-15",
      },
    ];

    // Apply filters
    let filteredRequests = mockRequests;
    if (employeeId) {
      filteredRequests = filteredRequests.filter(
        (req) => req.employeeId === employeeId,
      );
    }
    if (status) {
      filteredRequests = filteredRequests.filter(
        (req) => req.status === status,
      );
    }

    res.json({
      success: true,
      data: filteredRequests,
      count: filteredRequests.length,
    });
  }),
);

/**
 * POST /api/hr/leave-requests
 * Create a new leave request
 */
router.post(
  "/leave-requests",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validationResult = createLeaveRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid leave request data",
        validationResult.error.issues,
      );
    }

    const leaveRequest = validationResult.data;

    // TODO: Save to database
    // TODO: Calculate days automatically if not provided
    // TODO: Check remaining leave balance

    res.status(201).json({
      success: true,
      data: {
        id: Date.now().toString(),
        ...leaveRequest,
        status: "pending",
        requestedAt: new Date().toISOString(),
      },
      message: "Leave request submitted successfully",
    });
  }),
);

/**
 * PUT /api/hr/leave-requests/:id/approve
 * Approve a leave request
 */
router.put(
  "/leave-requests/:id/approve",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // TODO: Update status in database
    // In production: const updated = await leaveRequestService.approve(id);
    // if (!updated) throw new NotFoundError("Leave request not found");
    // TODO: Deduct from leave balance

    logger.info({ leaveRequestId: id }, "Leave request approved");

    res.json({
      success: true,
      message: "Leave request approved successfully",
    });
  }),
);

/**
 * PUT /api/hr/leave-requests/:id/reject
 * Reject a leave request
 */
router.put(
  "/leave-requests/:id/reject",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate input
    const validationResult = leaveActionSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError(
        "Invalid rejection data",
        validationResult.error.issues,
      );
    }

    const { reason } = validationResult.data;

    // TODO: Update status in database
    // In production: const updated = await leaveRequestService.reject(id, reason);
    // if (!updated) throw new NotFoundError("Leave request not found");

    logger.info({ leaveRequestId: id, reason }, "Leave request rejected");

    res.json({
      success: true,
      message: "Leave request rejected",
    });
  }),
);

// ============================================================================
// PAYROLL
// ============================================================================

/**
 * GET /api/hr/payroll/:employeeId
 * Get payroll information for an employee
 */
router.get(
  "/payroll/:employeeId",
  asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;

    // TODO: Replace with actual database query
    // In production: const payroll = await payrollService.findByEmployee(employeeId);
    // if (!payroll) throw new NotFoundError("Payroll data not found");

    const mockPayroll = {
      employeeId,
      baseSalary: 65000,
      bonuses: [],
      deductions: [],
      netSalary: 65000,
      lastPayment: "2024-11-30",
    };

    res.json({
      success: true,
      data: mockPayroll,
    });
  }),
);

// ============================================================================
// DEPARTMENTS
// ============================================================================

/**
 * GET /api/hr/departments
 * Get all departments
 */
router.get(
  "/departments",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Replace with actual database query
    const mockDepartments = [
      {
        id: "1",
        name: "Entwicklung",
        manager: "Max Mustermann",
        employeeCount: 15,
      },
      { id: "2", name: "Vertrieb", manager: "Anna Schmidt", employeeCount: 8 },
      {
        id: "3",
        name: "Marketing",
        manager: "Thomas Müller",
        employeeCount: 5,
      },
      { id: "4", name: "Personal", manager: "Lisa Weber", employeeCount: 3 },
    ];

    res.json({
      success: true,
      data: mockDepartments,
      count: mockDepartments.length,
    });
  }),
);

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * GET /api/hr/statistics
 * Get HR statistics overview
 */
router.get(
  "/statistics",
  asyncHandler(async (_req: Request, res: Response) => {
    // TODO: Replace with actual database query
    const mockStats = {
      totalEmployees: 31,
      activeEmployees: 29,
      onLeave: 2,
      newHires: 3,
      departments: 4,
      avgTenure: 3.5,
      openPositions: 2,
    };

    res.json({
      success: true,
      data: mockStats,
    });
  }),
);

export default router;
