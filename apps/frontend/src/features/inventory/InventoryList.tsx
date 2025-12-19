// SPDX-License-Identifier: MIT
// apps/frontend/src/features/inventory/InventoryList.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input } from "../../components/ui";
import styles from "./InventoryList.module.css";

interface InventoryApiResponse {
  id: string;
  sku: string;
  name: string;
  category?: string;
  quantity: number;
  min_stock: number;
  price?: number;
  location?: string;
}

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
        const response = await fetch(
          "http://localhost:3000/api/inventory/items",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch inventory items");
        }
        const data = await response.json();

        // Map database format to component format
        const mappedItems: InventoryItem[] = data.data.map(
          (item: InventoryApiResponse) => {
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
          },
        );

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

  const getStatusBadge = (status: InventoryItem["status"]) => {
    const config: Record<string, { label: string; className: string }> = {
      in_stock: {
        label: "Auf Lager",
        className: styles.statusBadgeInStock,
      },
      low_stock: {
        label: "Niedrig",
        className: styles.statusBadgeLowStock,
      },
      out_of_stock: {
        label: "Nicht verfügbar",
        className: styles.statusBadgeOutOfStock,
      },
    };
    const c = config[status];
    return (
      <span className={`${styles.statusBadge} ${c.className}`}>{c.label}</span>
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
          <div className={styles.itemName}>{value as string}</div>
          <div className={styles.itemCategory}>{row.category}</div>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Bestand",
      width: "100px",
      render: (value: unknown, row: InventoryItem) => (
        <span
          className={`${styles.quantityText} ${row.status === "out_of_stock" ? styles.quantityTextOutOfStock : ""}`}
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
      render: (value: unknown) =>
        getStatusBadge(value as InventoryItem["status"]),
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
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>📦 Lagerbestand</h2>
        <div className={styles.headerActions}>
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
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
