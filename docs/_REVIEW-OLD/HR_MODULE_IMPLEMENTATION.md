# HR Module Documentation

## Overview

The HR (Human Resources) Module provides comprehensive employee management capabilities for the ERP system including employee records, contract management, time tracking, leave management, onboarding workflows, document management, and payroll tracking.

## Features

### 1. Employee Management

- Complete employee lifecycle management
- Employee profiles with personal and contact information
- Emergency contact information
- Department and position tracking
- Employment status tracking (active, on_leave, terminated)
- Unique employee numbering system

### 2. Contract Management

- Multiple contract types (permanent, temporary, freelance, internship)
- Contract lifecycle tracking (active, expired, terminated)
- Salary and working hours tracking
- Vacation days allocation
- Probation and notice period tracking
- Contract history per employee

### 3. Time Tracking

- Daily time entry recording
- Start/end time with break calculation
- Automatic total hours calculation
- Time entry types (regular, overtime, sick, vacation, holiday)
- Approval workflow for time entries
- Date range queries

### 4. Leave Management

- Leave request creation and tracking
- Multiple leave types (vacation, sick, unpaid, parental, compensatory)
- Leave request status tracking (pending, approved, rejected, cancelled)
- Days calculation
- Approval/rejection workflow with reasons
- Leave history per employee

### 5. Department Management

- Department creation and tracking
- Department manager assignment
- Budget tracking per department
- Active/inactive status
- Department-based employee filtering

### 6. Onboarding Workflow

- Structured onboarding processes
- Task-based onboarding checklist
- Mentor assignment
- Progress tracking (completed/total tasks)
- Task status tracking (pending, in_progress, completed, skipped)
- Task assignment and due dates
- Automatic status updates based on task completion

### 7. Document Management

- Employee document upload and storage
- Document type categorization
- Document expiration tracking
- File metadata storage (size, mime type)
- Document access control

### 8. Overtime Tracking

- Overtime hour recording
- Reason tracking
- Approval workflow
- Compensation tracking
- Overtime history

### 9. Payroll Records

- Monthly payroll tracking
- Gross and net salary calculation
- Bonus tracking
- Tax and insurance deductions (income tax, pension, health, unemployment)
- Payment status and method tracking
- Payroll history per employee

### 10. Statistics & Reporting

- Real-time HR statistics
- Employee count by status
- Leave request statistics
- Onboarding progress tracking
- Department metrics

## Architecture

### Backend Structure

```
apps/backend/src/
├── types/
│   └── hr.ts                    # Strict TypeScript type definitions
├── services/
│   └── hrService.ts             # Business logic and database operations
├── routes/
│   └── hr/
│       └── hrRouter.ts          # API endpoints with RBAC integration
└── migrations/
    └── create_hr_tables.sql     # Database schema
```

### Frontend Structure

```
apps/frontend/src/
└── types/
    └── hr.ts                    # Frontend type definitions
```

## Database Schema

### Tables

1. **hr_employees**
   - Employee master data
   - Personal and contact information
   - Employment status and dates
   - Emergency contacts

2. **hr_contracts**
   - Employment contracts
   - Contract terms and conditions
   - Salary and working hours
   - Contract status

3. **hr_time_entries**
   - Daily time tracking
   - Work hours recording
   - Break time tracking
   - Approval status

4. **hr_leave_requests**
   - Leave/vacation requests
   - Leave types and dates
   - Approval workflow
   - Rejection reasons

5. **hr_departments**
   - Department information
   - Manager assignments
   - Budget tracking
   - Active status

6. **hr_onboarding**
   - Onboarding process tracking
   - Mentor assignments
   - Progress metrics
   - Completion status

7. **hr_onboarding_tasks**
   - Onboarding task checklist
   - Task assignments
   - Due dates
   - Completion tracking

8. **hr_payroll**
   - Monthly payroll records
   - Salary components
   - Deductions
   - Payment status

9. **hr_employee_documents**
   - Document storage metadata
   - Document type categorization
   - Expiration tracking
   - Access control

10. **hr_overtime**
    - Overtime hour tracking
    - Approval workflow
    - Compensation status

## API Endpoints

All endpoints require authentication and appropriate RBAC permissions.

### Employee Endpoints

```
GET    /api/hr/employees                 # List employees (filters, pagination)
GET    /api/hr/employees/:id             # Get employee with relations
POST   /api/hr/employees                 # Create employee
PUT    /api/hr/employees/:id             # Update employee
DELETE /api/hr/employees/:id             # Terminate employee (soft delete)
```

### Contract Endpoints

```
GET    /api/hr/employees/:employeeId/contracts  # Get employee contracts
GET    /api/hr/contracts/:id                    # Get contract by ID
POST   /api/hr/contracts                        # Create contract
PUT    /api/hr/contracts/:id                    # Update contract
```

### Time Entry Endpoints

```
GET    /api/hr/time-entries                     # Get time entries (by employee)
POST   /api/hr/time-entries                     # Create time entry
POST   /api/hr/time-entries/:id/approve         # Approve time entry
```

### Leave Request Endpoints

```
GET    /api/hr/leave-requests                   # Get leave requests (by employee)
POST   /api/hr/leave-requests                   # Create leave request
POST   /api/hr/leave-requests/:id/approve       # Approve leave request
POST   /api/hr/leave-requests/:id/reject        # Reject leave request
```

### Department Endpoints

```
GET    /api/hr/departments                      # List departments
POST   /api/hr/departments                      # Create department
```

### Onboarding Endpoints

```
GET    /api/hr/onboarding/:id                   # Get onboarding with tasks
POST   /api/hr/onboarding                       # Create onboarding process
POST   /api/hr/onboarding/tasks                 # Create onboarding task
POST   /api/hr/onboarding/tasks/:id/complete    # Complete task
```

### Document Endpoints

```
GET    /api/hr/employees/:employeeId/documents  # Get employee documents
```

### Overtime Endpoints

```
GET    /api/hr/overtime                         # Get overtime records
POST   /api/hr/overtime                         # Create overtime record
POST   /api/hr/overtime/:id/approve             # Approve overtime
```

### Statistics Endpoint

```
GET    /api/hr/statistics                       # Get HR statistics
```

## RBAC Permissions

The HR module integrates with the RBAC system and requires the following permissions:

- `hr:read` - View HR data
- `hr:create` - Create HR records
- `hr:update` - Update HR records
- `hr:delete` - Delete/terminate HR records
- `hr:approve` - Approve time entries, leave requests, overtime

## Usage Examples

### Create an Employee

```typescript
POST /api/hr/employees
Content-Type: application/json
Authorization: Bearer <token>

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+49 123 456789",
  "department": "Engineering",
  "position": "Software Developer",
  "start_date": "2024-01-15",
  "status": "active",
  "country": "Germany",
  "emergency_contact": "Jane Doe",
  "emergency_phone": "+49 987 654321"
}
```

### Create a Contract

```typescript
POST /api/hr/contracts
Content-Type: application/json
Authorization: Bearer <token>

{
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "permanent",
  "start_date": "2024-01-15",
  "salary": 65000,
  "working_hours": 40,
  "vacation_days": 30,
  "probation_period": 6,
  "notice_period": 3,
  "status": "active"
}
```

### Record Time Entry

```typescript
POST /api/hr/time-entries
Content-Type: application/json
Authorization: Bearer <token>

{
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-12-19",
  "start_time": "09:00",
  "end_time": "17:30",
  "break_minutes": 30,
  "type": "regular"
}
```

### Create Leave Request

```typescript
POST /api/hr/leave-requests
Content-Type: application/json
Authorization: Bearer <token>

{
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "vacation",
  "start_date": "2024-12-23",
  "end_date": "2024-12-27",
  "days": 5,
  "reason": "Christmas vacation"
}
```

### Create Onboarding Process

```typescript
POST /api/hr/onboarding
Content-Type: application/json
Authorization: Bearer <token>

{
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "start_date": "2024-01-15",
  "mentor_id": "660e8400-e29b-41d4-a716-446655440001",
  "notes": "Standard onboarding for software developer"
}
```

### Create Onboarding Task

```typescript
POST /api/hr/onboarding/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "onboarding_id": "770e8400-e29b-41d4-a716-446655440002",
  "title": "Setup development environment",
  "description": "Install IDE, Git, and configure access",
  "due_date": "2024-01-16",
  "assigned_to": "660e8400-e29b-41d4-a716-446655440001",
  "sort_order": 1
}
```

## Frontend Integration

### API Client Example

```typescript
import axios from "axios";
import type {
  EmployeeFormData,
  EmployeeListResponse,
  EmployeeDetailResponse,
} from "@/types/hr";

class HRApiClient {
  private baseUrl = "/api/hr";

  async getEmployees(filters?: EmployeeFilters, pagination?: PaginationParams) {
    const response = await axios.get<EmployeeListResponse>(
      `${this.baseUrl}/employees`,
      { params: { ...filters, ...pagination } },
    );
    return response.data;
  }

  async getEmployee(id: string) {
    const response = await axios.get<EmployeeDetailResponse>(
      `${this.baseUrl}/employees/${id}`,
    );
    return response.data;
  }

  async createEmployee(data: EmployeeFormData) {
    const response = await axios.post<EmployeeCreateResponse>(
      `${this.baseUrl}/employees`,
      data,
    );
    return response.data;
  }

  async updateEmployee(id: string, data: Partial<EmployeeFormData>) {
    const response = await axios.put<EmployeeDetailResponse>(
      `${this.baseUrl}/employees/${id}`,
      data,
    );
    return response.data;
  }
}

export const hrApi = new HRApiClient();
```

### React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { hrApi } from '@/api/hr';
import type { Employee, EmployeeFilters } from '@/types/hr';

export const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async (filters?: EmployeeFilters) => {
    setLoading(true);
    try {
      const response = await hrApi.getEmployees(filters);
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Employees</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Employee #</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.employee_number}</td>
                <td>{emp.first_name} {emp.last_name}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.position}</td>
                <td>{emp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

## Type Safety

The HR module uses strict TypeScript types throughout:

- No `any` types
- Comprehensive interfaces for all entities
- Enum-based status and type fields
- Strict validation with Zod schemas
- Type-safe API responses
- Form data types for frontend

## Security

- All endpoints require authentication via JWT
- RBAC permissions enforced on all routes
- Module-level access control (`hr` module)
- Operation-level permissions (read, create, update, delete, approve)
- Audit logging for critical operations
- Soft delete for employee termination

## Performance

- Efficient database queries with proper indexing
- Pagination support for large datasets
- Filtering capabilities to reduce data transfer
- Singleton service pattern
- Foreign key relationships for data integrity

## Testing

### Unit Test Example

```typescript
import { HRService } from "../services/hrService";
import type { EmployeeCreateInput } from "../types/hr";

describe("HRService", () => {
  let service: HRService;

  beforeEach(() => {
    service = HRService.getInstance();
  });

  it("should create an employee", () => {
    const input: EmployeeCreateInput = {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@test.com",
      position: "Developer",
      start_date: "2024-01-15",
      country: "Germany",
    };

    const employee = service.createEmployee(input);

    expect(employee.id).toBeDefined();
    expect(employee.first_name).toBe("John");
    expect(employee.status).toBe("active");
  });
});
```

## Migration

The HR database schema is created using the migration file:

```
apps/backend/src/migrations/create_hr_tables.sql
```

Run migrations before using the HR module:

```bash
# Apply HR tables migration
sqlite3 data/dev.sqlite3 < apps/backend/src/migrations/create_hr_tables.sql
```

## Future Enhancements

- [ ] Performance reviews module
- [ ] Training and certifications tracking
- [ ] Expense management
- [ ] Attendance calendar view
- [ ] Bulk employee import/export
- [ ] Advanced reporting and analytics
- [ ] Email notifications for approvals
- [ ] Document version control
- [ ] Payroll integration with accounting
- [ ] Multi-language support

## Support

For issues or questions:

- Check the API documentation
- Review type definitions in `types/hr.ts`
- Check RBAC permissions
- Review database schema in `create_hr_tables.sql`
- Check application logs for errors

## License

MIT License - See LICENSE file for details
