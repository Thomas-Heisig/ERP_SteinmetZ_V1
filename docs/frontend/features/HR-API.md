# API-Endpunkte

## 1. Mitarbeiter-Verwaltung

```typescript
// GET /api/hr/employees
// Query-Parameter: page, pageSize, search, departments[], status[], employmentTypes[], skills[], sortBy, sortDir
Response: {
  success: boolean;
  data: {
    employees: Employee[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// GET /api/hr/employees/:id
Response: {
  success: boolean;
  data: Employee;
}

// POST /api/hr/employees
Body: EmployeeCreateDto;
Response: {
  success: boolean;
  data: Employee;
}

// PUT /api/hr/employees/:id
Body: EmployeeUpdateDto;
Response: {
  success: boolean;
  data: Employee;
}

// DELETE /api/hr/employees/:id
Response: {
  success: boolean;
  message: string;
}

// DELETE /api/hr/employees/bulk
Body: { employeeIds: string[] };
Response: {
  success: boolean;
  message: string;
}

// POST /api/hr/employees/export
Body: { employeeIds: string[], format: 'csv' | 'pdf' | 'excel' };
Response: File download
2. Abteilungs-Statistiken
typescript
// GET /api/hr/departments/stats
Response: {
  success: boolean;
  data: DepartmentStats[];
}

// GET /api/hr/departments/:name/employees
Response: {
  success: boolean;
  data: Employee[];
}
3. KI-Insights
typescript
// GET /api/hr/ai/insights
Response: {
  success: boolean;
  data: {
    flightRiskEmployees: Employee[];
    skillGaps: Array<{ skill: string; count: number }>;
    turnoverPredictions: Array<{ department: string; risk: number }>;
    developmentSuggestions: Array<{ employeeId: string; suggestions: string[] }>;
  };
}

// GET /api/hr/ai/employee/:id/insights
Response: {
  success: boolean;
  data: {
    flightRisk: number;
    promotionPotential: number;
    skillGaps: string[];
    developmentSuggestions: string[];
    benchmarkComparison: Record<string, number>;
  };
}
4. Dokumenten-Verwaltung
typescript
// GET /api/hr/employees/:id/documents
Response: {
  success: boolean;
  data: Document[];
}

// POST /api/hr/employees/:id/documents
Body: FormData;
Response: {
  success: boolean;
  data: Document;
}

// DELETE /api/hr/documents/:id
Response: {
  success: boolean;
  message: string;
}
5. Metriken & Berichte
typescript
// GET /api/hr/metrics/attendance
// Query-Parameter: startDate, endDate, department
Response: {
  success: boolean;
  data: AttendanceReport[];
}

// GET /api/hr/metrics/turnover
// Query-Parameter: year, quarter
Response: {
  success: boolean;
  data: TurnoverReport;
}

// GET /api/hr/reports/salary
Response: {
  success: boolean;
  data: SalaryReport;
}
6. WebSocket Events
typescript
// Server-zu-Client Events:
hr:employee-created
hr:employee-updated
hr:employee-deleted
hr:attendance-changed
hr:status-changed

// Client-zu-Server Events:
hr:subscribe-department
hr:unsubscribe-department
```
