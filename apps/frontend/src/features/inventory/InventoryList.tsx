// SPDX-License-Identifier: MIT
// apps/frontend/src/features/inventory/InventoryList.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input } from "../../components/ui";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  location: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/inventory/items");
        if (!response.ok) {
          throw new Error("Failed to fetch inventory items");
        }
        const data = await response.json();
        
        // Map database format to component format
        const mappedItems: InventoryItem[] = data.data.map((item: any) => {
          let status: InventoryItem["status"] = "in_stock";
          if (item.quantity === 0) {
            status = "out_of_stock";
          } else if (item.quantity <= item.min_stock) {
            status = "low_stock";
          }
          
          return {
            id: item.id,
            sku: item.sku,
            name: item.name,
            category: item.category || "",
            quantity: item.quantity,
            minQuantity: item.min_stock,
            price: item.price || 0,
            location: item.location || "",
            status,
          };
        });
        
        setItems(mappedItems);
      } catch (error) {
        console.error("Error fetching inventory items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.sku.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (
    status: InventoryItem["status"],
    quantity: number,
    minQuantity: number,
  ) => {
    const config: Record<string, { label: string; bg: string; color: string }> =
      {
        in_stock: {
          label: "Auf Lager",
          bg: "var(--success-50)",
          color: "var(--success-600)",
        },
        low_stock: {
          label: "Niedrig",
          bg: "var(--warning-50)",
          color: "var(--warning-600)",
        },
        out_of_stock: {
          label: "Nicht verfügbar",
          bg: "var(--error-50)",
          color: "var(--error-600)",
        },
      };
    const c = config[status];
    return (
      <span
        style={{
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          background: c.bg,
          color: c.color,
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        {c.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const columns = [
    { key: "sku", header: "SKU", width: "100px" },
    {
      key: "name",
      header: "Artikel",
      render: (value: unknown, row: InventoryItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{value as string}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            {row.category}
          </div>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Bestand",
      width: "100px",
      render: (value: unknown, row: InventoryItem) => (
        <span
          style={{
            color:
              row.status === "out_of_stock" ? "var(--error-500)" : "inherit",
          }}
        >
          {value as number} / {row.minQuantity}
        </span>
      ),
    },
    {
      key: "price",
      header: "Preis",
      width: "100px",
      render: (value: unknown) => formatCurrency(value as number),
    },
    { key: "location", header: "Lagerort", width: "100px" },
    {
      key: "status",
      header: "Status",
      width: "130px",
      render: (value: unknown, row: InventoryItem) =>
        getStatusBadge(
          value as InventoryItem["status"],
          row.quantity,
          row.minQuantity,
        ),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: () => (
        <Button variant="ghost" size="sm">
          ✏️
        </Button>
      ),
    },
  ];

  return (
    <Card variant="elevated" padding="none">
      <div
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
          📦 Lagerbestand
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<span>🔍</span>}
          />
          <Button variant="primary">+ Neuer Artikel</Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredItems}
        keyField="id"
        loading={loading}
        emptyMessage="Keine Artikel gefunden"
        hoverable
      />
    </Card>
  );
};

export default InventoryList;
