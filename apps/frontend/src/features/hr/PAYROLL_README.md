# Payroll Module Documentation

## Overview

The Payroll module in ERP SteinmetZ provides comprehensive salary management and calculation capabilities with automatic tax deduction calculation, SEPA payment support, and comprehensive export functionality.

## Features

### 1. Automatic Payroll Calculation

- **Tax Calculation**: Automatic calculation of German income tax, church tax, and solidarity surcharge
- **Social Insurance**: Automatic pension, health, and unemployment insurance calculations
- **Configurable Parameters**: Support for country-specific tax rates (currently DE)
- **Tax Snapshots**: Historical tracking of tax rates used for each payroll record

### 2. SEPA Payment Support

- **pain.001.001.03 Export**: Export payroll data in SEPA XML format for bank transfers
- **IBAN/BIC Management**: Store employee banking information
- **Creditor Name**: Support for payment reference information
- **Payment Status Tracking**: Monitor pending, processed, failed, and reversed payments

### 3. Data Exports

- **CSV Export**: Export payroll data as CSV for spreadsheet applications
- **Lohnjournal (Payroll Journal)**: Detailed records with all deductions and calculations
- **Filtering**: Filter by month, year, and payment status

### 4. RBAC Integration

All endpoints require `hr:read`, `hr:create`, or `hr:update` permissions

## Database Schema

### hr_payroll_tax_params

Stores tax parameters for different years and countries:

```sql
CREATE TABLE hr_payroll_tax_params (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  income_tax_rate REAL DEFAULT 0.42,
  pension_insurance_rate REAL DEFAULT 0.093,
  health_insurance_rate REAL DEFAULT 0.073,
  unemployment_insurance_rate REAL DEFAULT 0.012,
  church_tax_rate REAL DEFAULT 0.08,
  solidarity_surcharge_rate REAL DEFAULT 0.0055,
  minimum_wage REAL DEFAULT 12.41,
  tax_free_allowance REAL DEFAULT 520.0,
  country_code TEXT DEFAULT 'DE',
  notes TEXT,
  created_at TEXT,
  updated_at TEXT,
  UNIQUE (year, country_code)
);
```

### hr_payroll

Enhanced payroll records with SEPA support:

```sql
CREATE TABLE hr_payroll (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  gross_salary REAL NOT NULL,
  net_salary REAL NOT NULL,
  bonuses REAL DEFAULT 0,
  income_tax REAL DEFAULT 0,
  pension_insurance REAL DEFAULT 0,
  health_insurance REAL DEFAULT 0,
  unemployment_insurance REAL DEFAULT 0,
  church_tax REAL DEFAULT 0,
  solidarity_surcharge REAL DEFAULT 0,
  other_deductions REAL DEFAULT 0,
  paid BOOLEAN DEFAULT 0,
  payment_date TEXT,
  payment_method TEXT,
  payment_status TEXT,
  iban TEXT,
  bic TEXT,
  creditor_name TEXT,
  tax_params_snapshot TEXT,
  sepa_mandate_id TEXT,
  sepa_batch_id TEXT,
  sepa_status TEXT,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);
```

## API Endpoints

### Tax Parameters

- `GET /api/hr/payroll/tax-params/:year` - Get tax parameters for year
- `POST /api/hr/payroll/tax-params` - Create/update tax parameters

### Payroll Records

- `GET /api/hr/payroll` - List payroll records (paginated)
- `GET /api/hr/payroll/:id` - Get specific payroll record
- `GET /api/hr/employees/:employeeId/payroll` - Get employee payroll history
- `POST /api/hr/payroll` - Create payroll record (auto-calculates taxes)

### Exports

- `GET /api/hr/payroll/export/csv` - Export as CSV
- `POST /api/hr/payroll/export/sepa` - Export as SEPA XML (pain.001.001.03)

### Request/Response Examples

#### Create Payroll Record

```bash
POST /api/hr/payroll
Content-Type: application/json

{
  "employee_id": "uuid",
  "month": "01",
  "year": 2024,
  "gross_salary": 3500.00,
  "bonuses": 0,
  "other_deductions": 0,
  "payment_method": "bank_transfer",
  "iban": "DE89370400440532013000",
  "bic": "COBADEFF",
  "creditor_name": "Max Mustermann"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee_id": "uuid",
    "month": "01",
    "year": 2024,
    "gross_salary": 3500.0,
    "net_salary": 2365.5,
    "bonuses": 0,
    "income_tax": 735.0,
    "pension_insurance": 325.5,
    "health_insurance": 255.5,
    "unemployment_insurance": 42.0,
    "church_tax": 58.8,
    "solidarity_surcharge": 40.4,
    "other_deductions": 0,
    "payment_status": "pending",
    "sepa_status": "draft",
    "payment_method": "bank_transfer",
    "iban": "DE89370400440532013000",
    "bic": "COBADEFF",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Export SEPA

```bash
POST /api/hr/payroll/export/sepa
Content-Type: application/json

{
  "year": 2024,
  "month": "01",
  "company_name": "Steinmetz GmbH",
  "company_iban": "DE89370400440532013000",
  "company_bic": "COBADEFF"
}
```

## Frontend Components

### PayrollList

Main list component showing payroll records with:

- Employee information
- Gross/net salary display
- Tax and insurance breakdowns
- Payment status indicators
- CSV export functionality

### SEPAExport

Form component for exporting SEPA XML:

- Company details input
- IBAN/BIC entry
- XML file generation and download

### Payroll Page

Main page combining:

- Year/month filters
- Tabs for Overview and SEPA Export
- Integration of PayrollList and SEPAExport components

## German Tax Defaults (2024-2025)

Default values seed in `seed_payroll_tax_params.sql`:

| Rate                   | 2024   | 2025   |
| ---------------------- | ------ | ------ |
| Income Tax             | 42%    | 42%    |
| Pension Insurance      | 9.3%   | 9.3%   |
| Health Insurance       | 7.3%   | 7.3%   |
| Unemployment Insurance | 1.2%   | 1.2%   |
| Church Tax             | 8%     | 8%     |
| Solidarity Surcharge   | 0.55%  | 0.55%  |
| Minimum Wage           | €12.41 | €12.82 |
| Tax-Free Allowance     | €520   | €520   |

## Internationalization

Translation keys available:

- `sidebar.payroll` - "Gehaltsabrechnung" (DE) / "Payroll" (EN)
- `sidebar.navItems.payroll` - "Gehaltsabrechnung" (DE) / "Payroll" (EN)

## Security Considerations

1. **RBAC**: All endpoints require proper permissions
2. **Tax Snapshots**: Historical tax rates stored with each record for audit trails
3. **SEPA Compliance**: Follows pain.001.001.03 standard
4. **Bank Data**: Encrypted storage recommended for IBAN/BIC fields

## Development Notes

### Services (Backend)

- `HRService.calculatePayroll()` - Calculates taxes and deductions
- `HRService.createPayrollRecord()` - Creates record with auto-calculation
- `HRService.exportPayrollAsCSV()` - Generates CSV export
- `HRService.exportPayrollAsSEPA()` - Generates SEPA XML export

### Routes

- All payroll routes use RBAC middleware
- Async handlers for safe error handling
- Zod validation for all inputs

### Frontend Components

- React hooks for data fetching
- CSS modules for styling
- Responsive design for mobile/tablet
- Locale-aware formatting (de-DE)

## Future Enhancements

1. **PDF Export** - Generate PDF payroll statements
2. **Batch Processing** - Create payroll for multiple employees
3. **Tax Compliance** - Quarterly/annual tax reports
4. **Pension Fund Integration** - Direct pension fund submissions
5. **Multi-Country Support** - Additional tax systems (AT, CH, etc.)
6. **Approval Workflows** - Multi-level approval for payroll
