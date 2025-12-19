# Reporting Module

## Overview

The Reporting module provides comprehensive reporting and business intelligence functionality with customizable reports, dashboards, and data export capabilities.

## Features

- **Standard Reports**: Pre-built reports for all modules
- **Custom Reports**: Create custom reports with filters
- **Data Visualization**: Charts, graphs, and dashboards
- **Scheduled Reports**: Automatic report generation
- **Export**: Export to PDF, Excel, CSV
- **Report Builder**: Visual report designer

## API Endpoints

### Reports

#### `GET /api/reporting/reports`
List all available reports.

#### `POST /api/reporting/reports`
Create a new report definition.

#### `GET /api/reporting/reports/:id`
Get report definition.

#### `PUT /api/reporting/reports/:id`
Update report definition.

#### `POST /api/reporting/reports/:id/run`
Execute a report with parameters.

**Request Body:**
```json
{
  "parameters": {
    "dateFrom": "2025-01-01",
    "dateTo": "2025-12-31",
    "department": "sales"
  },
  "format": "pdf"
}
```

### Report Categories

#### `GET /api/reporting/categories`
List report categories.

### Scheduled Reports

#### `GET /api/reporting/scheduled`
List scheduled reports.

#### `POST /api/reporting/scheduled`
Schedule a report.

### Data Sources

#### `GET /api/reporting/data-sources`
List available data sources.

### Export

#### `POST /api/reporting/export`
Export data in various formats.

## Standard Reports

### Financial Reports
- Balance Sheet
- Profit & Loss Statement
- Cash Flow Statement
- Accounts Receivable Aging
- Accounts Payable Aging

### Sales Reports
- Sales by Period
- Sales by Product
- Sales by Customer
- Sales Pipeline

### HR Reports
- Headcount Report
- Attendance Report
- Leave Balance Report
- Payroll Summary

### Inventory Reports
- Stock Level Report
- Stock Movements
- Low Stock Alert
- Inventory Valuation

### Project Reports
- Project Status
- Time & Materials
- Resource Utilization
- Project Profitability

## Integration Points

- **All Modules**: Reports pull data from all system modules
- **Dashboard Module**: Report widgets
- **Export Services**: PDF, Excel generation

## Version History

- **v0.3.0** (2025-12-19): Initial reporting module implementation
