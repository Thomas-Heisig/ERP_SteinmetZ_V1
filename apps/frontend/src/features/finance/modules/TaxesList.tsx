// SPDX-License-Identifier: MIT
// apps/frontend/src/features/finance/modules/TaxesList.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input } from "../../../components/ui";
import styles from "./TaxesList.module.css";

interface DataItem {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export const TaxesList: React.FC = () => {
  const [items, setItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/finance/taxes");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setItems(data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; bg: string; color: string }> =
      {
        active: {
          label: "Aktiv",
          bg: "var(--success-50)",
          color: "var(--success-600)",
        },
        inactive: {
          label: "Inaktiv",
          bg: "var(--gray-100)",
          color: "var(--gray-600)",
        },
        pending: {
          label: "Ausstehend",
          bg: "var(--warning-50)",
          color: "var(--warning-600)",
        },
      };
    const c = config[status] || config.active;
    return (
      <span
        className={styles.statusBadge}
        style={{ background: c.bg, color: c.color }}
      >
        {c.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("de-DE");
  };

  const columns = [
    { key: "name", header: "Name" },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (value: unknown) => getStatusBadge(value as string),
    },
    {
      key: "created_at",
      header: "Erstellt",
      width: "120px",
      render: (value: unknown) => formatDate(value as string),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: () => (
        <Button variant="ghost" size="sm">
          👁️
        </Button>
      ),
    },
  ];

  return (
    <Card variant="elevated" padding="none">
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>📋 Steuern</h2>
        <div className={styles.headerActions}>
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            icon={<span>🔍</span>}
          />
          <Button variant="primary">+ Neu</Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredItems}
        keyField="id"
        loading={loading}
        emptyMessage="Keine Daten gefunden"
        hoverable
      />
    </Card>
  );
};

export default TaxesList;
