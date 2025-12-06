# Advanced Filters Implementation Guide

**Stand**: Dezember 2025  
**Version**: 0.3.0

Dieses Dokument beschreibt die Implementierung eines fortgeschrittenen Filter-Systems für das ERP SteinmetZ Frontend.

---

## 📋 Überblick

Das Advanced Filters System ermöglicht Benutzern, komplexe Filterkriterien für Datenabfragen zu erstellen, zu speichern und wiederzuverwenden.

---

## 🎯 Features

1. **Filter Builder**: Visueller Editor für komplexe Filterregeln
2. **Saved Filters**: Speichern und Wiederverwenden von Filterkombinationen
3. **Filter Presets**: Vordefinierte Filter für häufige Use Cases
4. **Export**: Export von gefilterten Ergebnissen (CSV, Excel, PDF)
5. **Sharing**: Teilen von Filtern mit anderen Benutzern
6. **Quick Filters**: Schnellfilter für häufig genutzte Felder

---

## 🏗️ Architektur

### Component Structure

```
src/components/Filters/
├── FilterBuilder/
│   ├── FilterBuilder.tsx          # Hauptkomponente
│   ├── FilterRule.tsx             # Einzelne Filterregel
│   ├── FilterGroup.tsx            # Gruppe von Regeln (AND/OR)
│   ├── FieldSelector.tsx          # Feldauswahl
│   ├── OperatorSelector.tsx       # Operator-Auswahl
│   └── ValueInput.tsx             # Wert-Eingabe
├── SavedFilters/
│   ├── SavedFiltersList.tsx       # Liste gespeicherter Filter
│   ├── SavedFilterItem.tsx        # Einzelner gespeicherter Filter
│   └── SaveFilterDialog.tsx       # Dialog zum Speichern
├── FilterPresets/
│   ├── FilterPresets.tsx          # Vordefinierte Filter
│   └── PresetCard.tsx             # Preset-Karte
├── QuickFilters/
│   ├── QuickFilters.tsx           # Schnellfilter
│   └── QuickFilterChip.tsx        # Filter-Chip
└── FilterExport/
    ├── ExportDialog.tsx           # Export-Dialog
    └── ExportButton.tsx           # Export-Button
```

### Data Model

```typescript
// Filter Rule
interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'select';
}

// Filter Group
interface FilterGroup {
  id: string;
  logic: 'AND' | 'OR';
  rules: (FilterRule | FilterGroup)[];
}

// Saved Filter
interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filter: FilterGroup;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  ownerId: string;
}

// Filter Preset
interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  filter: FilterGroup;
  category: string;
}

// Filter Operators
type FilterOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isEmpty'
  | 'isNotEmpty';
```

---

## 💻 Implementation

### 1. Filter Builder Component

```typescript
// src/components/Filters/FilterBuilder/FilterBuilder.tsx
import { useState } from 'react';
import { FilterGroup, FilterRule } from '../types';
import { FilterGroupComponent } from './FilterGroup';

interface FilterBuilderProps {
  fields: FieldDefinition[];
  initialFilter?: FilterGroup;
  onChange: (filter: FilterGroup) => void;
}

export function FilterBuilder({ fields, initialFilter, onChange }: FilterBuilderProps) {
  const [filter, setFilter] = useState<FilterGroup>(
    initialFilter || {
      id: generateId(),
      logic: 'AND',
      rules: []
    }
  );

  const handleFilterChange = (newFilter: FilterGroup) => {
    setFilter(newFilter);
    onChange(newFilter);
  };

  const addRule = () => {
    const newRule: FilterRule = {
      id: generateId(),
      field: fields[0].name,
      operator: 'equals',
      value: '',
      dataType: fields[0].type
    };

    handleFilterChange({
      ...filter,
      rules: [...filter.rules, newRule]
    });
  };

  const addGroup = () => {
    const newGroup: FilterGroup = {
      id: generateId(),
      logic: 'AND',
      rules: []
    };

    handleFilterChange({
      ...filter,
      rules: [...filter.rules, newGroup]
    });
  };

  return (
    <div className="filter-builder">
      <div className="filter-builder-header">
        <h3>Filter Builder</h3>
        <div className="filter-builder-actions">
          <button onClick={addRule}>Add Rule</button>
          <button onClick={addGroup}>Add Group</button>
        </div>
      </div>

      <FilterGroupComponent
        group={filter}
        fields={fields}
        onChange={handleFilterChange}
        onRemove={() => {}}
        isRoot={true}
      />
    </div>
  );
}
```

### 2. Filter Rule Component

```typescript
// src/components/Filters/FilterBuilder/FilterRule.tsx
import { FilterRule, FieldDefinition } from '../types';
import { FieldSelector } from './FieldSelector';
import { OperatorSelector } from './OperatorSelector';
import { ValueInput } from './ValueInput';

interface FilterRuleProps {
  rule: FilterRule;
  fields: FieldDefinition[];
  onChange: (rule: FilterRule) => void;
  onRemove: () => void;
}

export function FilterRuleComponent({ rule, fields, onChange, onRemove }: FilterRuleProps) {
  const field = fields.find(f => f.name === rule.field);

  const handleFieldChange = (fieldName: string) => {
    const newField = fields.find(f => f.name === fieldName);
    onChange({
      ...rule,
      field: fieldName,
      dataType: newField?.type || 'string',
      value: ''
    });
  };

  const handleOperatorChange = (operator: FilterOperator) => {
    onChange({ ...rule, operator });
  };

  const handleValueChange = (value: any) => {
    onChange({ ...rule, value });
  };

  return (
    <div className="filter-rule">
      <FieldSelector
        value={rule.field}
        fields={fields}
        onChange={handleFieldChange}
      />

      <OperatorSelector
        value={rule.operator}
        dataType={rule.dataType}
        onChange={handleOperatorChange}
      />

      <ValueInput
        value={rule.value}
        dataType={rule.dataType}
        operator={rule.operator}
        field={field}
        onChange={handleValueChange}
      />

      <button onClick={onRemove} className="remove-button">
        Remove
      </button>
    </div>
  );
}
```

### 3. Saved Filters Component

```typescript
// src/components/Filters/SavedFilters/SavedFiltersList.tsx
import { useState, useEffect } from 'react';
import { SavedFilter } from '../types';
import { SavedFilterItem } from './SavedFilterItem';
import { SaveFilterDialog } from './SaveFilterDialog';

interface SavedFiltersListProps {
  currentFilter: FilterGroup;
  onLoad: (filter: FilterGroup) => void;
}

export function SavedFiltersList({ currentFilter, onLoad }: SavedFiltersListProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      const response = await fetch('/api/filters');
      const data = await response.json();
      setSavedFilters(data.filters);
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  };

  const handleSave = async (name: string, description: string, isPublic: boolean) => {
    try {
      const response = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          filter: currentFilter,
          isPublic
        })
      });

      if (response.ok) {
        loadSavedFilters();
        setShowSaveDialog(false);
      }
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/filters/${id}`, { method: 'DELETE' });
      loadSavedFilters();
    } catch (error) {
      console.error('Failed to delete filter:', error);
    }
  };

  return (
    <div className="saved-filters">
      <div className="saved-filters-header">
        <h3>Saved Filters</h3>
        <button onClick={() => setShowSaveDialog(true)}>
          Save Current Filter
        </button>
      </div>

      <div className="saved-filters-list">
        {savedFilters.map(filter => (
          <SavedFilterItem
            key={filter.id}
            filter={filter}
            onLoad={() => onLoad(filter.filter)}
            onDelete={() => handleDelete(filter.id)}
          />
        ))}
      </div>

      {showSaveDialog && (
        <SaveFilterDialog
          onSave={handleSave}
          onClose={() => setShowSaveDialog(false)}
        />
      )}
    </div>
  );
}
```

### 4. Filter Presets

```typescript
// src/components/Filters/FilterPresets/FilterPresets.tsx
import { FilterPreset } from '../types';
import { PresetCard } from './PresetCard';

const PRESETS: FilterPreset[] = [
  {
    id: 'active-employees',
    name: 'Active Employees',
    description: 'Show only active employees',
    icon: '👥',
    category: 'hr',
    filter: {
      id: '1',
      logic: 'AND',
      rules: [
        {
          id: '1-1',
          field: 'status',
          operator: 'equals',
          value: 'active',
          dataType: 'select'
        }
      ]
    }
  },
  {
    id: 'overdue-invoices',
    name: 'Overdue Invoices',
    description: 'Invoices past due date',
    icon: '💰',
    category: 'finance',
    filter: {
      id: '2',
      logic: 'AND',
      rules: [
        {
          id: '2-1',
          field: 'status',
          operator: 'notEquals',
          value: 'paid',
          dataType: 'select'
        },
        {
          id: '2-2',
          field: 'dueDate',
          operator: 'lessThan',
          value: new Date().toISOString(),
          dataType: 'date'
        }
      ]
    }
  },
  {
    id: 'this-month',
    name: 'This Month',
    description: 'Records from current month',
    icon: '📅',
    category: 'common',
    filter: {
      id: '3',
      logic: 'AND',
      rules: [
        {
          id: '3-1',
          field: 'createdAt',
          operator: 'greaterThanOrEqual',
          value: startOfMonth(new Date()).toISOString(),
          dataType: 'date'
        }
      ]
    }
  }
];

interface FilterPresetsProps {
  category?: string;
  onSelect: (filter: FilterGroup) => void;
}

export function FilterPresets({ category, onSelect }: FilterPresetsProps) {
  const filteredPresets = category
    ? PRESETS.filter(p => p.category === category)
    : PRESETS;

  return (
    <div className="filter-presets">
      <h3>Filter Presets</h3>
      <div className="preset-grid">
        {filteredPresets.map(preset => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onClick={() => onSelect(preset.filter)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 5. Export Functionality

```typescript
// src/components/Filters/FilterExport/ExportDialog.tsx
import { useState } from 'react';

interface ExportDialogProps {
  data: any[];
  onClose: () => void;
}

export function ExportDialog({ data, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          format,
          includeHeaders,
          fields: selectedFields
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        onClose();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="export-dialog">
      <h3>Export Data</h3>

      <div className="export-format">
        <label>Format:</label>
        <select value={format} onChange={(e) => setFormat(e.target.value as any)}>
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      <div className="export-options">
        <label>
          <input
            type="checkbox"
            checked={includeHeaders}
            onChange={(e) => setIncludeHeaders(e.target.checked)}
          />
          Include Headers
        </label>
      </div>

      <div className="export-actions">
        <button onClick={handleExport}>Export</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
```

---

## 🎨 Styling

```css
/* src/components/Filters/FilterBuilder/FilterBuilder.css */
.filter-builder {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.filter-builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-builder-actions {
  display: flex;
  gap: 8px;
}

.filter-group {
  border: 1px dashed #ccc;
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
}

.filter-group-logic {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-rule {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin: 4px 0;
}

.filter-rule select,
.filter-rule input {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.remove-button {
  padding: 4px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-button:hover {
  background: #d32f2f;
}

.saved-filters {
  margin-top: 24px;
}

.saved-filters-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.saved-filter-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.saved-filter-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.preset-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-card:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.preset-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
```

---

## 🔌 Backend API

### Endpoints

```typescript
// GET /api/filters
// List saved filters for current user
router.get('/filters', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const filters = await db.all(
    'SELECT * FROM saved_filters WHERE owner_id = ? OR is_public = 1',
    [userId]
  );
  res.json({ success: true, filters });
}));

// POST /api/filters
// Save a new filter
router.post('/filters', validate(saveFilterSchema), asyncHandler(async (req, res) => {
  const { name, description, filter, isPublic } = req.body;
  const userId = req.user.id;

  const result = await db.run(
    'INSERT INTO saved_filters (name, description, filter, is_public, owner_id) VALUES (?, ?, ?, ?, ?)',
    [name, description, JSON.stringify(filter), isPublic ? 1 : 0, userId]
  );

  res.json({
    success: true,
    data: { id: result.lastID }
  });
}));

// DELETE /api/filters/:id
// Delete a saved filter
router.delete('/filters/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await db.run(
    'DELETE FROM saved_filters WHERE id = ? AND owner_id = ?',
    [id, userId]
  );

  res.json({ success: true });
}));

// POST /api/export
// Export filtered data
router.post('/export', asyncHandler(async (req, res) => {
  const { data, format, includeHeaders, fields } = req.body;

  let fileBuffer: Buffer;
  let mimeType: string;

  switch (format) {
    case 'csv':
      fileBuffer = exportToCSV(data, fields, includeHeaders);
      mimeType = 'text/csv';
      break;
    case 'excel':
      fileBuffer = await exportToExcel(data, fields, includeHeaders);
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;
    case 'pdf':
      fileBuffer = await exportToPDF(data, fields);
      mimeType = 'application/pdf';
      break;
    default:
      throw new BadRequestError('Invalid format');
  }

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename=export.${format}`);
  res.send(fileBuffer);
}));
```

---

## 🧪 Testing

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBuilder } from './FilterBuilder';

describe('FilterBuilder', () => {
  const fields = [
    { name: 'name', label: 'Name', type: 'string' },
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] }
  ];

  it('should render empty filter builder', () => {
    render(<FilterBuilder fields={fields} onChange={() => {}} />);
    expect(screen.getByText('Filter Builder')).toBeInTheDocument();
  });

  it('should add new rule', () => {
    const onChange = vi.fn();
    render(<FilterBuilder fields={fields} onChange={onChange} />);

    fireEvent.click(screen.getByText('Add Rule'));
    expect(onChange).toHaveBeenCalled();
  });

  it('should add new group', () => {
    const onChange = vi.fn();
    render(<FilterBuilder fields={fields} onChange={onChange} />);

    fireEvent.click(screen.getByText('Add Group'));
    expect(onChange).toHaveBeenCalled();
  });
});
```

---

## 📚 Usage Example

```typescript
// src/pages/Employees/EmployeesPage.tsx
import { useState } from 'react';
import { FilterBuilder } from '../../components/Filters/FilterBuilder';
import { SavedFiltersList } from '../../components/Filters/SavedFilters';
import { FilterPresets } from '../../components/Filters/FilterPresets';

const EMPLOYEE_FIELDS = [
  { name: 'firstName', label: 'First Name', type: 'string' },
  { name: 'lastName', label: 'Last Name', type: 'string' },
  { name: 'email', label: 'Email', type: 'string' },
  { name: 'department', label: 'Department', type: 'select', options: ['IT', 'Sales', 'HR'] },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
  { name: 'startDate', label: 'Start Date', type: 'date' },
  { name: 'salary', label: 'Salary', type: 'number' }
];

export function EmployeesPage() {
  const [filter, setFilter] = useState<FilterGroup | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const handleFilterChange = async (newFilter: FilterGroup) => {
    setFilter(newFilter);
    
    // Apply filter
    const response = await fetch('/api/hr/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter: newFilter })
    });

    const data = await response.json();
    setEmployees(data.data);
  };

  return (
    <div className="employees-page">
      <h1>Employees</h1>

      <FilterPresets category="hr" onSelect={handleFilterChange} />

      <FilterBuilder
        fields={EMPLOYEE_FIELDS}
        initialFilter={filter}
        onChange={handleFilterChange}
      />

      <SavedFiltersList
        currentFilter={filter}
        onLoad={handleFilterChange}
      />

      <EmployeesList employees={employees} />
    </div>
  );
}
```

---

## 🔗 Siehe auch

- [Enhanced Search Guide](./ENHANCED_SEARCH_GUIDE.md)
- [Frontend Components](../apps/frontend/src/components/README.md)
- [API Documentation](./api/README.md)

---

**Letzte Aktualisierung**: 6. Dezember 2025  
**Maintainer**: Thomas Heisig
