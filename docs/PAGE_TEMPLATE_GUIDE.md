# 📄 Modul-Seitenvorlagen - Implementierungsanleitung

## Übersicht

Dieses Dokument beschreibt die Struktur und das Pattern für die Erstellung von Modul-Detailseiten.

## 📁 Dateistruktur

```
apps/frontend/src/pages/
├── Business/
│   ├── CompanyPage.tsx          # ✅ Beispiel implementiert
│   ├── ProcessesPage.tsx        # ⏳ TODO
│   └── RisksPage.tsx            # ⏳ TODO
├── Finance/
│   ├── AccountingPage.tsx
│   ├── ControllingPage.tsx
│   ├── TreasuryPage.tsx
│   └── TaxesPage.tsx
├── Sales/
│   ├── CRMPage.tsx
│   ├── MarketingPage.tsx
│   ├── OrdersPage.tsx
│   └── FulfillmentPage.tsx
// ... weitere Module
```

## 🎯 Standard-Template

Jede Seite sollte folgende Struktur haben:

```typescript
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Interfaces für Datenmodelle
interface DataModel {
  id: string;
  // weitere Felder
}

export const ModulePage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<DataModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // API-Aufruf
      const response = await fetch('/api/module/endpoint');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('module.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('module.description')}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {/* Inhalt hier */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulePage;
```

## 🎨 UI-Komponenten

### Standard-Formular

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Feldname
    </label>
    <input
      type="text"
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    />
  </div>
</div>
```

### Standard-Tabelle

```typescript
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
          Spalte 1
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
          Spalte 2
        </th>
      </tr>
    </thead>
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
      {data.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
            {item.field1}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
            {item.field2}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Action-Buttons

```typescript
<div className="flex gap-4">
  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
    Speichern
  </button>
  <button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
    Abbrechen
  </button>
  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
    Löschen
  </button>
</div>
```

## 🔌 API-Integration

### Standard-API-Calls

```typescript
// GET - Daten laden
const loadData = async () => {
  try {
    const response = await fetch("/api/module/endpoint");
    if (!response.ok) throw new Error("Failed to load data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// POST - Daten erstellen
const createData = async (data: DataModel) => {
  try {
    const response = await fetch("/api/module/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create data");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// PUT - Daten aktualisieren
const updateData = async (id: string, data: Partial<DataModel>) => {
  try {
    const response = await fetch(`/api/module/endpoint/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update data");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// DELETE - Daten löschen
const deleteData = async (id: string) => {
  try {
    const response = await fetch(`/api/module/endpoint/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete data");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
```

## 📝 Beispiel: Vollständige Seite

Siehe [CompanyPage.tsx](../../apps/frontend/src/pages/Business/CompanyPage.tsx) als Referenzimplementierung.

## 🚀 Nächste Schritte

Für jedes Modul folgende Seiten erstellen:

### Geschäftsverwaltung

- [ ] ProcessesPage.tsx
- [ ] RisksPage.tsx

### Finanzen

- [ ] AccountingPage.tsx
- [ ] ControllingPage.tsx
- [ ] TreasuryPage.tsx
- [ ] TaxesPage.tsx

### Vertrieb & Marketing

- [ ] CRMPage.tsx
- [ ] MarketingPage.tsx
- [ ] OrdersPage.tsx
- [ ] FulfillmentPage.tsx

### Einkauf & Beschaffung

- [ ] ProcurementOrdersPage.tsx
- [ ] GoodsReceiptPage.tsx
- [ ] SuppliersPage.tsx

### Produktion & Fertigung

- [ ] PlanningPage.tsx
- [ ] ControlPage.tsx
- [ ] QualityPage.tsx
- [ ] MaintenancePage.tsx

### Lager & Logistik

- [ ] StockPage.tsx
- [ ] PickingPage.tsx
- [ ] ShippingPage.tsx

### Personal & HR

- [ ] EmployeesPage.tsx
- [ ] TimeTrackingPage.tsx
- [ ] DevelopmentPage.tsx
- [ ] RecruitingPage.tsx

### Reporting & Analytics

- [ ] StandardReportsPage.tsx
- [ ] AdhocPage.tsx
- [ ] AIAnalyticsPage.tsx

### Kommunikation & Social

- [ ] EmailPage.tsx
- [ ] MessagingPage.tsx
- [ ] SocialMediaPage.tsx

### System & Administration

- [ ] UsersPage.tsx
- [ ] SettingsPage.tsx
- [ ] IntegrationsPage.tsx

---

**Pattern-Autor**: Thomas Heisig
**Erstellt**: 2025-12-17
**Version**: 1.0
