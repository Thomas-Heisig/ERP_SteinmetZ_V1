# HR Module - Developer Guide

## Quick Start

The HR module is fully implemented and ready to use. This guide will help you get started with development and integration.

## 📦 What's Included

### Backend (`apps/backend/src/`)

- ✅ **types/hr.ts** - Strict TypeScript types (600 lines)
- ✅ **services/hrService.ts** - Business logic (1,000 lines)
- ✅ **routes/hr/hrRouter.ts** - API endpoints (700 lines)
- ✅ **migrations/create_hr_tables.sql** - Database schema

### Frontend (`apps/frontend/src/`)

- ✅ **types/hr.ts** - Frontend types (500 lines)

### Documentation (`docs/`)

- ✅ **HR_MODULE_IMPLEMENTATION.md** - Full documentation
- ✅ **HR_MODULE_SUMMARY.md** - Implementation summary

### Testing (`scripts/`)

- ✅ **test-hr-api.sh** - API test script

## 🚀 Getting Started

### 1. Database Setup

The HR tables are already created if you ran the migration. If not:

```bash
sqlite3 data/dev.sqlite3 < apps/backend/src/migrations/create_hr_tables.sql
```

### 2. API is Ready

The HR router is automatically registered at `/api/hr` in the main application.

```typescript
// apps/backend/src/index.ts
import hrRouter from "./routes/hr/hrRouter.js";
app.use("/api/hr", hrRouter);
```

### 3. Test the API

```bash
# Set your JWT token
export API_TOKEN="your-jwt-token-here"

# Run tests
bash scripts/test-hr-api.sh
```

## 🎯 Core Concepts

### 1. Employee Management

```typescript
import hrService from "../services/hrService";
import type { EmployeeCreateInput } from "../types/hr";

// Create an employee
const employee = hrService.createEmployee({
  first_name: "Max",
  last_name: "Mustermann",
  email: "max@example.com",
  position: "Developer",
  start_date: "2024-01-15",
  country: "Germany",
});

// Get employee with all relations
const fullEmployee = hrService.getEmployeeWithRelations(employee.id);
// Returns: employee + contracts + time_entries + leave_requests + documents + etc.

// List employees with filters
const result = hrService.getEmployees(
  { status: "active", department: "Engineering" },
  { page: 1, limit: 50 },
);
```

### 2. Contract Management

```typescript
// Create a contract
const contract = hrService.createContract({
  employee_id: employeeId,
  type: "permanent",
  start_date: "2024-01-15",
  salary: 65000,
  working_hours: 40,
  vacation_days: 30,
  status: "active",
});

// Get all contracts for an employee
const contracts = hrService.getEmployeeContracts(employeeId);
```

### 3. Time Tracking

```typescript
// Record time entry
const timeEntry = hrService.createTimeEntry({
  employee_id: employeeId,
  date: "2024-12-19",
  start_time: "09:00",
  end_time: "17:30",
  break_minutes: 30,
  type: "regular",
});
// Total hours are calculated automatically: 8.0 hours

// Approve time entry
const approved = hrService.approveTimeEntry(timeEntry.id, userId);

// Get time entries for date range
const entries = hrService.getEmployeeTimeEntries(
  employeeId,
  "2024-12-01",
  "2024-12-31",
);
```

### 4. Leave Management

```typescript
// Create leave request
const leaveRequest = hrService.createLeaveRequest({
  employee_id: employeeId,
  type: "vacation",
  start_date: "2024-12-23",
  end_date: "2024-12-27",
  days: 5,
  reason: "Christmas vacation",
});

// Approve leave request
const approved = hrService.approveLeaveRequest(leaveRequest.id, managerId);

// Reject leave request
const rejected = hrService.rejectLeaveRequest(
  leaveRequest.id,
  managerId,
  "Insufficient vacation days",
);

// Get employee leave requests
const leaves = hrService.getEmployeeLeaveRequests(employeeId, "pending");
```

### 5. Onboarding Workflow

```typescript
// Create onboarding process
const onboarding = hrService.createOnboarding({
  employee_id: employeeId,
  start_date: "2024-01-15",
  mentor_id: mentorId,
  notes: "Standard developer onboarding",
});

// Add onboarding tasks
const task1 = hrService.createOnboardingTask({
  onboarding_id: onboarding.id,
  title: "Setup development environment",
  description: "Install IDE, Git, configure access",
  due_date: "2024-01-16",
  sort_order: 1,
});

// Complete a task
const completed = hrService.completeOnboardingTask(task1.id, userId);
// This automatically updates the onboarding progress

// Get onboarding with all tasks
const fullOnboarding = hrService.getOnboardingWithTasks(onboarding.id);
```

## 🔌 API Endpoints Reference

### Quick Reference Table

| Method | Endpoint                                | Permission   | Description          |
| ------ | --------------------------------------- | ------------ | -------------------- |
| GET    | `/api/hr/employees`                     | `hr:read`    | List employees       |
| GET    | `/api/hr/employees/:id`                 | `hr:read`    | Get employee details |
| POST   | `/api/hr/employees`                     | `hr:create`  | Create employee      |
| PUT    | `/api/hr/employees/:id`                 | `hr:update`  | Update employee      |
| DELETE | `/api/hr/employees/:id`                 | `hr:delete`  | Terminate employee   |
| GET    | `/api/hr/contracts/:id`                 | `hr:read`    | Get contract         |
| POST   | `/api/hr/contracts`                     | `hr:create`  | Create contract      |
| PUT    | `/api/hr/contracts/:id`                 | `hr:update`  | Update contract      |
| GET    | `/api/hr/time-entries`                  | `hr:read`    | Get time entries     |
| POST   | `/api/hr/time-entries`                  | `hr:create`  | Create time entry    |
| POST   | `/api/hr/time-entries/:id/approve`      | `hr:approve` | Approve time entry   |
| GET    | `/api/hr/leave-requests`                | `hr:read`    | Get leave requests   |
| POST   | `/api/hr/leave-requests`                | `hr:create`  | Create leave request |
| POST   | `/api/hr/leave-requests/:id/approve`    | `hr:approve` | Approve leave        |
| POST   | `/api/hr/leave-requests/:id/reject`     | `hr:approve` | Reject leave         |
| GET    | `/api/hr/departments`                   | `hr:read`    | List departments     |
| POST   | `/api/hr/departments`                   | `hr:create`  | Create department    |
| GET    | `/api/hr/onboarding/:id`                | `hr:read`    | Get onboarding       |
| POST   | `/api/hr/onboarding`                    | `hr:create`  | Create onboarding    |
| POST   | `/api/hr/onboarding/tasks`              | `hr:create`  | Create task          |
| POST   | `/api/hr/onboarding/tasks/:id/complete` | `hr:update`  | Complete task        |
| GET    | `/api/hr/overtime`                      | `hr:read`    | Get overtime         |
| POST   | `/api/hr/overtime`                      | `hr:create`  | Create overtime      |
| POST   | `/api/hr/overtime/:id/approve`          | `hr:approve` | Approve overtime     |
| GET    | `/api/hr/statistics`                    | `hr:read`    | Get statistics       |

## 🎨 Frontend Integration

### 1. Create API Client

```typescript
// apps/frontend/src/api/hrApi.ts
import axios from "axios";
import type {
  EmployeeFormData,
  EmployeeListResponse,
  EmployeeDetailResponse,
  EmployeeFilters,
  PaginationParams,
} from "../types/hr";

const BASE_URL = "/api/hr";

export const hrApi = {
  // Employees
  async getEmployees(filters?: EmployeeFilters, pagination?: PaginationParams) {
    const { data } = await axios.get<EmployeeListResponse>(
      `${BASE_URL}/employees`,
      { params: { ...filters, ...pagination } },
    );
    return data;
  },

  async getEmployee(id: string) {
    const { data } = await axios.get<EmployeeDetailResponse>(
      `${BASE_URL}/employees/${id}`,
    );
    return data;
  },

  async createEmployee(input: EmployeeFormData) {
    const { data } = await axios.post(`${BASE_URL}/employees`, input);
    return data;
  },

  async updateEmployee(id: string, input: Partial<EmployeeFormData>) {
    const { data } = await axios.put(`${BASE_URL}/employees/${id}`, input);
    return data;
  },

  // Time Entries
  async getTimeEntries(
    employeeId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { data } = await axios.get(`${BASE_URL}/time-entries`, {
      params: {
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
      },
    });
    return data;
  },

  async createTimeEntry(input: TimeEntryFormData) {
    const { data } = await axios.post(`${BASE_URL}/time-entries`, input);
    return data;
  },

  // Leave Requests
  async getLeaveRequests(employeeId: string) {
    const { data } = await axios.get(`${BASE_URL}/leave-requests`, {
      params: { employee_id: employeeId },
    });
    return data;
  },

  async createLeaveRequest(input: LeaveRequestFormData) {
    const { data } = await axios.post(`${BASE_URL}/leave-requests`, input);
    return data;
  },

  async approveLeaveRequest(id: string) {
    const { data } = await axios.post(
      `${BASE_URL}/leave-requests/${id}/approve`,
    );
    return data;
  },

  // Statistics
  async getStatistics() {
    const { data } = await axios.get(`${BASE_URL}/statistics`);
    return data;
  },
};
```

### 2. React Component Example

```typescript
// apps/frontend/src/components/hr/EmployeeList.tsx
import React, { useEffect, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import type { Employee } from '../../types/hr';

export const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hrApi.getEmployees();
      setEmployees(response.data.data);
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading employees...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Employees</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Position</th>
            <th>Department</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.first_name} {emp.last_name}</td>
              <td>{emp.email}</td>
              <td>{emp.position}</td>
              <td>{emp.department}</td>
              <td>{emp.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 3. Form Component Example

```typescript
// apps/frontend/src/components/hr/EmployeeForm.tsx
import React, { useState } from 'react';
import { hrApi } from '../../api/hrApi';
import type { EmployeeFormData, EmployeeStatus } from '../../types/hr';

export const EmployeeForm: React.FC = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    start_date: '',
    country: 'Germany',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await hrApi.createEmployee(formData);
      console.log('Employee created:', response.data);
      // Reset form or redirect
    } catch (error) {
      console.error('Failed to create employee:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="First Name"
        value={formData.first_name}
        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={formData.last_name}
        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Position"
        value={formData.position}
        onChange={e => setFormData({ ...formData, position: e.target.value })}
        required
      />
      <input
        type="date"
        value={formData.start_date}
        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
        required
      />
      <button type="submit">Create Employee</button>
    </form>
  );
};
```

## 🔐 RBAC Permissions

All HR endpoints require authentication and appropriate permissions:

```typescript
// Required permissions
const permissions = {
  "hr:read": ["admin", "manager", "hr_manager", "user"],
  "hr:create": ["admin", "manager", "hr_manager"],
  "hr:update": ["admin", "manager", "hr_manager"],
  "hr:delete": ["admin", "hr_manager"],
  "hr:approve": ["admin", "manager", "hr_manager"],
};
```

## 🧪 Testing

### Run API Tests

```bash
# Set your JWT token
export API_TOKEN="your-jwt-token-here"

# Run all tests
bash scripts/test-hr-api.sh

# Or manually test specific endpoints
curl -X GET "http://localhost:3000/api/hr/statistics" \
  -H "Authorization: Bearer $TOKEN"
```

### Unit Test Example

```typescript
import { HRService } from '../services/hrService';
import type { EmployeeCreateInput } from '../types/hr';

describe('HRService - Employee Operations', () => {
  let service: HRService;

  beforeEach(() => {
    service = HRService.getInstance();
  });

  it('should create an employee with all required fields', () => {
    const input: EmployeeCreateInput = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      position: 'Developer',
      start_date: '2024-01-15',
      country: 'Germany',
    };

    const employee = service.createEmployee(input);

    expect(employee.id).toBeDefined();
    expect(employee.first_name).toBe('Test');
    expect(employee.status).toBe('active');
  });

  it('should get employee with relations', () => {
    // Create employee first
    const employee = service.createEmployee({...});

    // Get with relations
    const fullEmployee = service.getEmployeeWithRelations(employee.id);

    expect(fullEmployee).toBeDefined();
    expect(fullEmployee?.contracts).toBeDefined();
    expect(fullEmployee?.time_entries).toBeDefined();
  });
});
```

## 📊 Common Queries

### Get Active Employees by Department

```typescript
const employees = hrService.getEmployees(
  { department: "Engineering", status: "active" },
  { page: 1, limit: 100, sort_by: "last_name", sort_order: "asc" },
);
```

### Get Employee's Current Contract

```typescript
const employee = hrService.getEmployeeWithRelations(employeeId);
const currentContract = employee?.current_contract;
```

### Get Time Entries for Current Month

```typescript
const now = new Date();
const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;

const timeEntries = hrService.getEmployeeTimeEntries(
  employeeId,
  startDate,
  endDate,
);
```

### Get Pending Leave Requests

```typescript
const pendingLeaves = hrService.getEmployeeLeaveRequests(employeeId, "pending");
```

## 🐛 Troubleshooting

### Issue: "Employee not found"

- Check that employee ID is valid UUID
- Verify employee exists in database
- Check authentication token has proper permissions

### Issue: "Permission denied"

- Verify user has required RBAC permissions
- Check module access is granted (`hr` module)
- Review role assignments

### Issue: "Validation error"

- Review request body matches schema
- Check date formats (YYYY-MM-DD)
- Verify required fields are provided
- Check email format is valid

### Issue: "Database error"

- Verify migrations have been run
- Check foreign key relationships
- Review database constraints
- Check SQLite connection

## 📚 Additional Resources

- [HR_MODULE_IMPLEMENTATION.md](HR_MODULE_IMPLEMENTATION.md) - Full documentation
- [HR_MODULE_SUMMARY.md](HR_MODULE_SUMMARY.md) - Implementation summary
- [types/hr.ts](../apps/backend/src/types/hr.ts) - Type definitions
- [services/hrService.ts](../apps/backend/src/services/hrService.ts) - Service implementation
- [routes/hr/hrRouter.ts](../apps/backend/src/routes/hr/hrRouter.ts) - API endpoints

## 🎯 Next Steps

1. **Review Documentation** - Read the full implementation guide
2. **Test API** - Run the test script to verify everything works
3. **Create Frontend Components** - Build UI components using the API client
4. **Add Features** - Extend the module with additional functionality
5. **Deploy** - Deploy to production once frontend is complete

---

**Happy Coding! 🚀**
