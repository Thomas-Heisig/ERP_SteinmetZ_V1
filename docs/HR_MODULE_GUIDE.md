# HR-Modul Entwicklungsanleitung

**Status**: 🟡 In Entwicklung  
**Version**: 0.1.0  
**Letzte Aktualisierung**: 9. Dezember 2025

## Übersicht

Das HR-Modul (Human Resources) verwaltet alle mitarbeiterbezogenen Daten und Prozesse im ERP SteinmetZ System. Diese Anleitung beschreibt die Architektur, Datenmodelle und Implementierungsmuster.

## Funktionsumfang

### Phase 1: Basis-Funktionalität (MVP)

- ✅ Mitarbeiter-CRUD-Operationen
- ✅ Basis-Stammdaten (Name, Email, Telefon, Adresse)
- ✅ Beschäftigungsverhältnis (Eintritt, Austritt, Status)
- ✅ Abteilungen und Positionen
- [ ] Dokumentenverwaltung (Verträge, Zeugnisse)

### Phase 2: Zeiterfassung

- [ ] Time-Tracking-Interface
- [ ] Urlaubs-/Abwesenheitsmanagement
- [ ] Überstunden-Konto
- [ ] Genehmigungsworkflows

### Phase 3: Payroll & Compliance

- [ ] Gehaltsabrechnung
- [ ] Steuerberechnung
- [ ] SEPA-Export
- [ ] DSGVO-konforme Datenverarbeitung

## Datenmodell

### Mitarbeiter (employees)

```typescript
interface Employee {
  id: string; // UUID
  employee_number: string; // Eindeutige Personalnummer

  // Persönliche Daten
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string; // ISO 8601
  nationality?: string;

  // Adresse
  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };

  // Beschäftigung
  employment: {
    status: "active" | "inactive" | "on_leave" | "terminated";
    hire_date: string; // ISO 8601
    termination_date?: string; // ISO 8601
    department_id?: string;
    position_id?: string;
    employment_type: "full_time" | "part_time" | "contractor" | "intern";
    work_hours_per_week?: number;
  };

  // Vergütung
  compensation?: {
    salary: number;
    currency: "EUR" | "USD" | "GBP";
    payment_frequency: "monthly" | "bi-weekly" | "weekly";
    effective_date: string;
  };

  // Emergency Contact
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}
```

### Abteilungen (departments)

```typescript
interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string; // Verknüpfung zu Employee
  parent_department_id?: string; // Hierarchie
  cost_center?: string;

  created_at: string;
  updated_at: string;
}
```

### Positionen (positions)

```typescript
interface Position {
  id: string;
  title: string;
  description?: string;
  department_id?: string;
  level: "junior" | "mid" | "senior" | "lead" | "executive";
  min_salary?: number;
  max_salary?: number;

  created_at: string;
  updated_at: string;
}
```

### Dokumente (employee_documents)

```typescript
interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: "contract" | "certificate" | "id" | "resume" | "other";
  title: string;
  file_path: string;
  file_type: string; // MIME type
  file_size: number; // Bytes

  // Metadata
  uploaded_at: string;
  uploaded_by: string;
  valid_until?: string; // Für zeitlich begrenzte Dokumente

  // DSGVO
  retention_period_days?: number;
  deletion_scheduled_at?: string;
}
```

### Abwesenheiten (absences)

```typescript
interface Absence {
  id: string;
  employee_id: string;
  absence_type:
    | "vacation"
    | "sick_leave"
    | "parental_leave"
    | "unpaid_leave"
    | "training";

  start_date: string; // ISO 8601
  end_date: string;
  days_count: number;

  status: "pending" | "approved" | "rejected" | "cancelled";

  reason?: string;
  notes?: string;

  // Approval Workflow
  requested_at: string;
  requested_by: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;

  created_at: string;
  updated_at: string;
}
```

## Datenbankschema

### SQLite Schema

```sql
-- Employees Table
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  employee_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth TEXT,
  nationality TEXT,

  -- JSON für komplexe Strukturen
  address TEXT,                  -- JSON
  employment TEXT NOT NULL,      -- JSON
  compensation TEXT,             -- JSON
  emergency_contact TEXT,        -- JSON

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  updated_by TEXT,

  CHECK(json_valid(address)),
  CHECK(json_valid(employment)),
  CHECK(json_valid(compensation)),
  CHECK(json_valid(emergency_contact))
);

-- Departments Table
CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  manager_id TEXT,
  parent_department_id TEXT,
  cost_center TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Positions Table
CREATE TABLE positions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department_id TEXT,
  level TEXT NOT NULL CHECK(level IN ('junior', 'mid', 'senior', 'lead', 'executive')),
  min_salary REAL,
  max_salary REAL,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Employee Documents Table
CREATE TABLE employee_documents (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK(document_type IN ('contract', 'certificate', 'id', 'resume', 'other')),
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,

  uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  uploaded_by TEXT NOT NULL,
  valid_until TEXT,

  retention_period_days INTEGER,
  deletion_scheduled_at TEXT,

  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Absences Table
CREATE TABLE absences (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  absence_type TEXT NOT NULL CHECK(absence_type IN ('vacation', 'sick_leave', 'parental_leave', 'unpaid_leave', 'training')),

  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  days_count REAL NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')),

  reason TEXT,
  notes TEXT,

  requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  requested_by TEXT NOT NULL,
  approved_at TEXT,
  approved_by TEXT,
  rejection_reason TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Indexes für Performance
CREATE INDEX idx_employees_status ON employees(json_extract(employment, '$.status'));
CREATE INDEX idx_employees_department ON employees(json_extract(employment, '$.department_id'));
CREATE INDEX idx_absences_employee ON absences(employee_id);
CREATE INDEX idx_absences_dates ON absences(start_date, end_date);
CREATE INDEX idx_absences_status ON absences(status);
CREATE INDEX idx_documents_employee ON employee_documents(employee_id);
```

## API-Endpunkte

### Employees

```typescript
// GET /api/hr/employees
// Liste aller Mitarbeiter (mit Pagination & Filter)
router.get(
  "/employees",
  asyncHandler(async (req, res) => {
    const {
      status, // 'active' | 'inactive' | 'on_leave' | 'terminated'
      department_id,
      position_id,
      search, // Suche in Name, Email
      page = 1,
      per_page = 20,
    } = req.query;

    // Implementation...
  }),
);

// GET /api/hr/employees/:id
// Details eines Mitarbeiters
router.get(
  "/employees/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employee = await hrService.getEmployee(id);

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    res.json({ success: true, data: employee });
  }),
);

// POST /api/hr/employees
// Neuen Mitarbeiter anlegen
router.post(
  "/employees",
  validateRequest(createEmployeeSchema),
  asyncHandler(async (req, res) => {
    const employeeData = req.body;
    const employee = await hrService.createEmployee(employeeData);

    res.status(201).json({ success: true, data: employee });
  }),
);

// PATCH /api/hr/employees/:id
// Mitarbeiter aktualisieren (partial update)
router.patch(
  "/employees/:id",
  validateRequest(updateEmployeeSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const employee = await hrService.updateEmployee(id, updates);
    res.json({ success: true, data: employee });
  }),
);

// DELETE /api/hr/employees/:id
// Mitarbeiter löschen (soft delete)
router.delete(
  "/employees/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await hrService.deleteEmployee(id);

    res.json({ success: true, message: "Employee deleted" });
  }),
);
```

### Departments

```typescript
// GET /api/hr/departments
router.get(
  "/departments",
  asyncHandler(async (req, res) => {
    const departments = await hrService.getDepartments();
    res.json({ success: true, data: departments });
  }),
);

// POST /api/hr/departments
router.post(
  "/departments",
  validateRequest(departmentSchema),
  asyncHandler(async (req, res) => {
    const department = await hrService.createDepartment(req.body);
    res.status(201).json({ success: true, data: department });
  }),
);
```

### Absences

```typescript
// GET /api/hr/absences
router.get(
  "/absences",
  asyncHandler(async (req, res) => {
    const { employee_id, status, start_date, end_date } = req.query;
    const absences = await hrService.getAbsences({
      employee_id,
      status,
      start_date,
      end_date,
    });
    res.json({ success: true, data: absences });
  }),
);

// POST /api/hr/absences
router.post(
  "/absences",
  validateRequest(absenceSchema),
  asyncHandler(async (req, res) => {
    const absence = await hrService.requestAbsence(req.body);
    res.status(201).json({ success: true, data: absence });
  }),
);

// PATCH /api/hr/absences/:id/approve
router.patch(
  "/absences/:id/approve",
  requirePermission("hr:approve_absences"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const absence = await hrService.approveAbsence(id, req.user.id);
    res.json({ success: true, data: absence });
  }),
);
```

## Validation Schemas (Zod)

```typescript
import { z } from "zod";

const addressSchema = z
  .object({
    street: z.string().min(1),
    city: z.string().min(1),
    postal_code: z.string().regex(/^\d{5}$/),
    country: z.string().length(2), // ISO 3166-1 alpha-2
  })
  .optional();

const employmentSchema = z.object({
  status: z.enum(["active", "inactive", "on_leave", "terminated"]),
  hire_date: z.string().datetime(),
  termination_date: z.string().datetime().optional(),
  department_id: z.string().uuid().optional(),
  position_id: z.string().uuid().optional(),
  employment_type: z.enum(["full_time", "part_time", "contractor", "intern"]),
  work_hours_per_week: z.number().min(0).max(168).optional(),
});

export const createEmployeeSchema = z.object({
  employee_number: z.string().regex(/^EMP-\d{5}$/),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  date_of_birth: z.string().datetime().optional(),
  nationality: z.string().length(2).optional(),
  address: addressSchema,
  employment: employmentSchema,
  compensation: z
    .object({
      salary: z.number().positive(),
      currency: z.enum(["EUR", "USD", "GBP"]),
      payment_frequency: z.enum(["monthly", "bi-weekly", "weekly"]),
      effective_date: z.string().datetime(),
    })
    .optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const departmentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  manager_id: z.string().uuid().optional(),
  parent_department_id: z.string().uuid().optional(),
  cost_center: z.string().max(50).optional(),
});

export const absenceSchema = z.object({
  employee_id: z.string().uuid(),
  absence_type: z.enum([
    "vacation",
    "sick_leave",
    "parental_leave",
    "unpaid_leave",
    "training",
  ]),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});
```

## Service Layer

```typescript
// apps/backend/src/services/hrService.ts

import { dbService } from "./dbService.js";
import type { Employee, Department, Absence } from "../types/hr.js";

export class HRService {
  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const employee: Employee = {
      id,
      ...data,
      created_at: now,
      updated_at: now,
    } as Employee;

    await dbService.insert("employees", {
      id,
      employee_number: employee.employee_number,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      date_of_birth: employee.date_of_birth,
      nationality: employee.nationality,
      address: JSON.stringify(employee.address),
      employment: JSON.stringify(employee.employment),
      compensation: JSON.stringify(employee.compensation),
      emergency_contact: JSON.stringify(employee.emergency_contact),
      created_at: now,
      updated_at: now,
    });

    return employee;
  }

  async getEmployee(id: string): Promise<Employee | null> {
    const row = await dbService.getOne("employees", { id });
    if (!row) return null;

    return this.mapRowToEmployee(row);
  }

  async getEmployees(filters: {
    status?: string;
    department_id?: string;
    search?: string;
  }): Promise<Employee[]> {
    // Implementation mit dynamischen WHERE-Bedingungen
    // ...
  }

  async updateEmployee(
    id: string,
    updates: Partial<Employee>,
  ): Promise<Employee> {
    const existing = await this.getEmployee(id);
    if (!existing) {
      throw new Error("Employee not found");
    }

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await dbService.update(
      "employees",
      { id },
      {
        ...this.mapEmployeeToRow(updated),
        updated_at: updated.updated_at,
      },
    );

    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    // Soft delete: Status auf 'terminated' setzen
    await this.updateEmployee(id, {
      employment: {
        ...existing.employment,
        status: "terminated",
        termination_date: new Date().toISOString(),
      },
    });
  }

  private mapRowToEmployee(row: any): Employee {
    return {
      ...row,
      address: row.address ? JSON.parse(row.address) : undefined,
      employment: JSON.parse(row.employment),
      compensation: row.compensation ? JSON.parse(row.compensation) : undefined,
      emergency_contact: row.emergency_contact
        ? JSON.parse(row.emergency_contact)
        : undefined,
    };
  }

  private mapEmployeeToRow(employee: Employee): any {
    return {
      ...employee,
      address: employee.address ? JSON.stringify(employee.address) : null,
      employment: JSON.stringify(employee.employment),
      compensation: employee.compensation
        ? JSON.stringify(employee.compensation)
        : null,
      emergency_contact: employee.emergency_contact
        ? JSON.stringify(employee.emergency_contact)
        : null,
    };
  }
}

export const hrService = new HRService();
```

## Frontend Components

### Employee List

```tsx
// apps/frontend/src/components/HR/EmployeeList.tsx

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export function EmployeeList() {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "active",
    search: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/hr/employees?${query}`);
      const data = await response.json();
      setEmployees(data.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-list">
      <h2>{t("hr.employees")}</h2>

      <div className="filters">
        <input
          type="search"
          placeholder={t("hr.search_placeholder")}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="active">{t("hr.status.active")}</option>
          <option value="inactive">{t("hr.status.inactive")}</option>
          <option value="on_leave">{t("hr.status.on_leave")}</option>
          <option value="terminated">{t("hr.status.terminated")}</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t("hr.employee_number")}</th>
              <th>{t("hr.name")}</th>
              <th>{t("hr.email")}</th>
              <th>{t("hr.department")}</th>
              <th>{t("hr.status")}</th>
              <th>{t("hr.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employee_number}</td>
                <td>{`${employee.first_name} ${employee.last_name}`}</td>
                <td>{employee.email}</td>
                <td>{employee.employment.department_name}</td>
                <td>{t(`hr.status.${employee.employment.status}`)}</td>
                <td>
                  <button onClick={() => viewEmployee(employee.id)}>
                    {t("common.view")}
                  </button>
                  <button onClick={() => editEmployee(employee.id)}>
                    {t("common.edit")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

## Tests

```typescript
// apps/backend/src/routes/hr/hrRouter.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../index.js";

describe("HR API", () => {
  describe("POST /api/hr/employees", () => {
    it("should create a new employee", async () => {
      const employeeData = {
        employee_number: "EMP-00001",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        employment: {
          status: "active",
          hire_date: "2025-01-01T00:00:00Z",
          employment_type: "full_time",
          work_hours_per_week: 40,
        },
      };

      const response = await request(app)
        .post("/api/hr/employees")
        .send(employeeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.employee_number).toBe("EMP-00001");
    });

    it("should validate email format", async () => {
      const invalidData = {
        employee_number: "EMP-00001",
        first_name: "John",
        last_name: "Doe",
        email: "invalid-email",
        employment: {
          /* ... */
        },
      };

      const response = await request(app)
        .post("/api/hr/employees")
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("email");
    });
  });

  describe("GET /api/hr/employees/:id", () => {
    it("should return employee details", async () => {
      // Setup: Create employee first
      const created = await createTestEmployee();

      const response = await request(app)
        .get(`/api/hr/employees/${created.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(created.id);
    });

    it("should return 404 for non-existent employee", async () => {
      const response = await request(app)
        .get("/api/hr/employees/non-existent-id")
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
```

## DSGVO-Compliance

### Datenschutz-Anforderungen

1. **Zweckbindung**: Mitarbeiterdaten nur für HR-Zwecke verarbeiten
2. **Datensparsamkeit**: Nur notwendige Daten erfassen
3. **Löschfristen**: Automatische Löschung nach gesetzlichen Fristen
4. **Auskunftsrecht**: API-Endpoint für Datenauskunft
5. **Löschrecht**: API-Endpoint für Datenlöschung

### Implementation

```typescript
// Automatische Löschung alter Dokumente
async function scheduleDocumentDeletion() {
  const documents = await db.all(`
    SELECT * FROM employee_documents
    WHERE deletion_scheduled_at IS NULL
      AND retention_period_days IS NOT NULL
      AND date(uploaded_at, '+' || retention_period_days || ' days') < date('now')
  `);

  for (const doc of documents) {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30); // 30 Tage Vorankündigung

    await db.update(
      "employee_documents",
      { id: doc.id },
      {
        deletion_scheduled_at: deletionDate.toISOString(),
      },
    );
  }
}

// Datenauskunft
router.get(
  "/employees/:id/data-export",
  requirePermission("hr:data_export"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await hrService.exportEmployeeData(id);

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="employee-data-${id}.json"`,
    );
    res.json(data);
  }),
);
```

## Best Practices

1. **Soft Deletes**: Niemals wirklich löschen, Status auf "terminated" setzen
2. **Audit Trail**: Alle Änderungen loggen (created_by, updated_by)
3. **Validierung**: Strikte Zod-Schemas für alle Inputs
4. **Permissions**: Feingranulare Berechtigungen (hr:read, hr:write, hr:delete)
5. **Encryption**: Sensitive Daten verschlüsseln (z.B. Sozialversicherungsnummer)

## Weitere Schritte

- [ ] Zeiterfassungs-Modul
- [ ] Urlaubs-Workflows
- [ ] Dokumenten-Upload
- [ ] Payroll-Integration
- [ ] Reporting & Analytics

---

**Status**: In Entwicklung  
**Nächster Schritt**: CRUD-Operationen implementieren  
**Verantwortlich**: Backend Team
