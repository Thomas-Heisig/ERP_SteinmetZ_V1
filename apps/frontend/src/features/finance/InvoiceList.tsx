// SPDX-License-Identifier: MIT
// apps/frontend/src/features/finance/InvoiceList.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Input, Tabs } from "../../components/ui";

type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
}

export const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Mock data
    const mockInvoices: Invoice[] = [
      {
        id: "1",
        invoiceNumber: "RE-2024-001",
        customerName: "ABC GmbH",
        amount: 1500.00,
        currency: "EUR",
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: "sent",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: "2",
        invoiceNumber: "RE-2024-002",
        customerName: "XYZ AG",
        amount: 3250.50,
        currency: "EUR",
        dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        status: "overdue",
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: "3",
        invoiceNumber: "RE-2024-003",
        customerName: "Musterfirma",
        amount: 890.00,
        currency: "EUR",
        dueDate: new Date(Date.now() - 20 * 86400000).toISOString(),
        status: "paid",
        createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
      },
      {
        id: "4",
        invoiceNumber: "RE-2024-004",
        customerName: "Test KG",
        amount: 2100.00,
        currency: "EUR",
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: "draft",
        createdAt: new Date().toISOString(),
      },
    ];

    setInvoices(mockInvoices);
    setLoading(false);
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.customerName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const config: Record<InvoiceStatus, { label: string; bg: string; color: string }> = {
      draft: { label: "Entwurf", bg: "var(--gray-100)", color: "var(--gray-600)" },
      sent: { label: "Versendet", bg: "var(--info-50)", color: "var(--info-600)" },
      paid: { label: "Bezahlt", bg: "var(--success-50)", color: "var(--success-600)" },
      overdue: { label: "Überfällig", bg: "var(--error-50)", color: "var(--error-600)" },
      cancelled: { label: "Storniert", bg: "var(--gray-100)", color: "var(--gray-500)" },
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

  const totalOpen = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalOverdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  const columns = [
    { key: "invoiceNumber", header: "Rechnung Nr.", width: "140px" },
    { key: "customerName", header: "Kunde" },
    {
      key: "amount",
      header: "Betrag",
      width: "120px",
      render: (value: unknown, row: Invoice) => (
        <span style={{ fontWeight: 500 }}>{formatCurrency(value as number, row.currency)}</span>
      ),
    },
    {
      key: "dueDate",
      header: "Fällig",
      width: "100px",
      render: (value: unknown) => new Date(value as string).toLocaleDateString("de-DE"),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (value: unknown) => getStatusBadge(value as InvoiceStatus),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (_: unknown, row: Invoice) => (
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <Button variant="ghost" size="sm" title="Anzeigen">
            👁️
          </Button>
          <Button variant="ghost" size="sm" title="PDF">
            📄
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        <Card variant="outlined" padding="md">
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Gesamt offen
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {formatCurrency(totalOpen, "EUR")}
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Überfällig
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--error-500)" }}>
            {formatCurrency(totalOverdue, "EUR")}
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Rechnungen gesamt
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{invoices.length}</div>
        </Card>
        <Card variant="outlined" padding="md">
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Entwürfe
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {invoices.filter((i) => i.status === "draft").length}
          </div>
        </Card>
      </div>

      {/* Invoice Table */}
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
            💰 Rechnungen
          </h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Input
              placeholder="Suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<span>🔍</span>}
            />
            <Button variant="primary">+ Neue Rechnung</Button>
          </div>
        </div>

        <div
          style={{
            padding: "0.5rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          {(["all", "draft", "sent", "paid", "overdue"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "primary" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "Alle" : getStatusBadge(status as InvoiceStatus)}
            </Button>
          ))}
        </div>

        <Table
          columns={columns}
          data={filteredInvoices}
          keyField="id"
          loading={loading}
          emptyMessage="Keine Rechnungen gefunden"
          hoverable
        />
      </Card>
    </div>
  );
};

export default InvoiceList;
